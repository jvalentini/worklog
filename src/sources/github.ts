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
	mergedAt: string;
	repository: {
		nameWithOwner: string;
	};
}

async function getGitHubEvents(user: string, dateRange: DateRange): Promise<GitHubEvent[]> {
	try {
		const proc = Bun.spawn(["gh", "api", `/users/${user}/events`, "--paginate"], {
			stdout: "pipe",
			stderr: "pipe",
		});

		const output = await new Response(proc.stdout).text();
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			return [];
		}

		const events = JSON.parse(output) as GitHubEvent[];

		return events.filter((event) => {
			const eventDate = new Date(event.created_at);
			return eventDate >= dateRange.start && eventDate <= dateRange.end;
		});
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

async function getMergedPRs(user: string, dateRange: DateRange): Promise<WorkItem[]> {
	try {
		// Use gh search to find merged PRs by the user
		// Format: author:USER is:pr is:merged merged:>=YYYY-MM-DD merged:<=YYYY-MM-DD
		const since = format(dateRange.start, "yyyy-MM-dd");
		const until = format(dateRange.end, "yyyy-MM-dd");
		const query = `author:${user} is:pr is:merged merged:${since}..${until}`;

		const proc = Bun.spawn(
			[
				"gh",
				"search",
				"prs",
				query,
				"--json",
				"number,title,mergedAt,repository",
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
		const items: WorkItem[] = [];

		for (const pr of prs) {
			const mergedAt = new Date(pr.mergedAt);

			// Double-check date range (gh search might be inclusive in unexpected ways)
			if (mergedAt >= dateRange.start && mergedAt <= dateRange.end) {
				items.push({
					source: "github",
					timestamp: mergedAt,
					title: `[${pr.repository.nameWithOwner}] PR #${pr.number} merged: ${pr.title}`,
					metadata: {
						type: "pr",
						repo: pr.repository.nameWithOwner,
						number: pr.number,
						action: "merged",
						merged: true,
					},
				});
			}
		}

		return items;
	} catch {
		return [];
	}
}

export const githubReader: SourceReader = {
	name: "github",
	async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
		const user = config.githubUser;
		if (!user) {
			return [];
		}

		// Get both events and merged PRs
		const [events, mergedPRs] = await Promise.all([
			getGitHubEvents(user, dateRange),
			getMergedPRs(user, dateRange),
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
