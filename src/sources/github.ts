import { format } from "date-fns";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";

interface GitHubEvent {
	type: string;
	created_at: string;
	repo: { name: string };
	payload: {
		action?: string;
		commits?: Array<{ message: string }>;
		pull_request?: { title: string; number: number; merged?: boolean };
		issue?: { title: string; number: number };
		review?: { state: string };
	};
}

interface MergedPR {
	number: number;
	title: string;
	closedAt: string;
	repository: {
		nameWithOwner: string;
	};
}

interface GitHubUser {
	login: string;
}

async function getAuthenticatedGitHubLogin(): Promise<string | null> {
	try {
		const proc = Bun.spawn(["gh", "api", "user"], {
			stdout: "pipe",
			stderr: "pipe",
		});

		const output = await new Response(proc.stdout).text();
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			return null;
		}

		const user = JSON.parse(output) as GitHubUser;
		if (!user.login || typeof user.login !== "string") {
			return null;
		}

		return user.login;
	} catch {
		return null;
	}
}

async function fetchGitHubEventsPage(
	user: string,
	page: number,
	perPage: number,
): Promise<GitHubEvent[]> {
	try {
		const proc = Bun.spawn(
			["gh", "api", `/users/${user}/events?per_page=${perPage}&page=${page}`],
			{
				stdout: "pipe",
				stderr: "pipe",
			},
		);

		const output = await new Response(proc.stdout).text();
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			return [];
		}

		const events = JSON.parse(output) as GitHubEvent[];
		if (!Array.isArray(events)) {
			return [];
		}

		return events;
	} catch {
		return [];
	}
}

async function getGitHubEvents(user: string, dateRange: DateRange): Promise<GitHubEvent[]> {
	try {
		const perPage = 100;
		const maxPages = 3;
		const results: GitHubEvent[] = [];

		for (let page = 1; page <= maxPages; page++) {
			if (process.env.WORKLOG_PROGRESS === "1" && process.stderr.isTTY) {
				console.error(`github: events page ${page}/${maxPages}`);
			}

			const events = await fetchGitHubEventsPage(user, page, perPage);
			if (events.length === 0) {
				break;
			}

			for (const event of events) {
				const eventDate = new Date(event.created_at);
				if (eventDate >= dateRange.start && eventDate <= dateRange.end) {
					results.push(event);
				}
			}

			const oldestEvent = events[events.length - 1];
			if (oldestEvent) {
				const oldestDate = new Date(oldestEvent.created_at);
				if (oldestDate < dateRange.start) {
					break;
				}
			}
		}

		return results;
	} catch {
		return [];
	}
}

function eventToWorkItem(event: GitHubEvent): WorkItem | null {
	const timestamp = new Date(event.created_at);
	const repo = event.repo.name;

	switch (event.type) {
		case "PushEvent": {
			const commits = event.payload.commits ?? [];
			if (commits.length === 0) return null;
			const firstCommit = commits[0]?.message?.split("\n")[0] ?? "Push";
			return {
				source: "github",
				timestamp,
				title: `[${repo}] Push: ${firstCommit}`,
				description: commits.length > 1 ? `${commits.length} commits` : undefined,
				metadata: { type: "push", repo, commitCount: commits.length },
			};
		}

		case "PullRequestEvent": {
			const pr = event.payload.pull_request;
			if (!pr) return null;
			let action = event.payload.action ?? "updated";

			// Distinguish merged from just closed
			if (action === "closed" && pr.merged) {
				action = "merged";
			}

			return {
				source: "github",
				timestamp,
				title: `[${repo}] PR #${pr.number} ${action}: ${pr.title}`,
				metadata: { type: "pr", repo, number: pr.number, action, merged: pr.merged },
			};
		}

		case "IssuesEvent": {
			const issue = event.payload.issue;
			if (!issue) return null;
			const action = event.payload.action ?? "updated";
			return {
				source: "github",
				timestamp,
				title: `[${repo}] Issue #${issue.number} ${action}: ${issue.title}`,
				metadata: { type: "issue", repo, number: issue.number, action },
			};
		}

		case "PullRequestReviewEvent": {
			const pr = event.payload.pull_request;
			const review = event.payload.review;
			if (!pr || !review) return null;
			return {
				source: "github",
				timestamp,
				title: `[${repo}] Reviewed PR #${pr.number}: ${pr.title}`,
				description: `Review: ${review.state}`,
				metadata: { type: "review", repo, number: pr.number, state: review.state },
			};
		}

		case "IssueCommentEvent": {
			const issue = event.payload.issue;
			if (!issue) return null;
			return {
				source: "github",
				timestamp,
				title: `[${repo}] Commented on #${issue.number}: ${issue.title}`,
				metadata: { type: "comment", repo, number: issue.number },
			};
		}

		default:
			return null;
	}
}

async function searchMergedPRs(args: string[], mergedAtRange: string): Promise<MergedPR[]> {
	try {
		const proc = Bun.spawn(
			[
				"gh",
				"search",
				"prs",
				...args,
				"--merged",
				"--merged-at",
				mergedAtRange,
				"--json",
				"number,title,closedAt,repository",
				"--limit",
				"1000",
			],
			{
				stdout: "pipe",
				stderr: "pipe",
			},
		);

		const output = await new Response(proc.stdout).text();
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			return [];
		}

		const prs = JSON.parse(output) as MergedPR[];
		if (!Array.isArray(prs)) {
			return [];
		}

		return prs;
	} catch {
		return [];
	}
}

async function getMergedPRs(user: string, dateRange: DateRange): Promise<WorkItem[]> {
	try {
		const since = format(dateRange.start, "yyyy-MM-dd");
		const until = format(dateRange.end, "yyyy-MM-dd");
		const mergedAtRange = `${since}..${until}`;

		const [authored, mergedBy] = await Promise.all([
			searchMergedPRs(["--author", user], mergedAtRange),
			searchMergedPRs([`merged-by:${user}`], mergedAtRange),
		]);

		const allPRs = [...authored, ...mergedBy];
		const items: WorkItem[] = [];
		const seen = new Set<string>();

		for (const pr of allPRs) {
			const closedAt = new Date(pr.closedAt);
			if (Number.isNaN(closedAt.getTime())) {
				continue;
			}

			if (closedAt < dateRange.start || closedAt > dateRange.end) {
				continue;
			}

			const repo = pr.repository?.nameWithOwner;
			if (!repo) {
				continue;
			}

			const key = `${repo}#${pr.number}`;
			if (seen.has(key)) {
				continue;
			}
			seen.add(key);

			items.push({
				source: "github",
				timestamp: closedAt,
				title: `[${repo}] PR #${pr.number} merged: ${pr.title}`,
				metadata: {
					type: "pr",
					repo,
					number: pr.number,
					action: "merged",
					merged: true,
				},
			});
		}

		return items;
	} catch {
		return [];
	}
}

export const githubReader: SourceReader = {
	name: "github",
	async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
		const configuredUser = config.githubUser;
		const login = configuredUser ?? (await getAuthenticatedGitHubLogin());

		const [events, mergedPRs] = await Promise.all([
			login ? getGitHubEvents(login, dateRange) : Promise.resolve([]),
			login ? getMergedPRs(login, dateRange) : Promise.resolve([]),
		]);

		const items: WorkItem[] = [];

		// Add items from events
		for (const event of events) {
			const item = eventToWorkItem(event);
			if (item) {
				items.push(item);
			}
		}

		// Add merged PRs (deduplicate by checking if we already have this PR)
		const existingPRs = new Set(
			items
				.filter((item) => item.metadata?.type === "pr" && item.metadata?.merged)
				.map((item) => `${item.metadata?.repo}#${item.metadata?.number}`),
		);

		for (const mergedPR of mergedPRs) {
			const prKey = `${mergedPR.metadata?.repo}#${mergedPR.metadata?.number}`;
			if (!existingPRs.has(prKey)) {
				items.push(mergedPR);
			}
		}

		return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	},
};
