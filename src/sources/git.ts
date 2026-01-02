import { format } from "date-fns";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";
import { expandPath } from "../utils/config.ts";

interface GitCommit {
	hash: string;
	author: string;
	authorEmail: string;
	committer: string;
	committerEmail: string;
	date: Date;
	subject: string;
	body: string;
	parents: string[];
}

async function getCommits(repoPath: string, dateRange: DateRange): Promise<GitCommit[]> {
	const commits: GitCommit[] = [];

	try {
		// For today, use a simpler approach that works reliably
		const isToday = dateRange.start.toDateString() === new Date().toDateString();

		let gitArgs: string[];
		const formatStr = "%H|%an|%ae|%cn|%ce|%aI|%P|%s|%b%x00";
		if (isToday) {
			gitArgs = ["git", "log", `--since="1 day ago"`, `--format=${formatStr}`];
		} else {
			const since = format(dateRange.start, "yyyy-MM-dd");
			const until = format(dateRange.end, "yyyy-MM-dd'T'23:59:59");
			gitArgs = ["git", "log", `--since=${since}`, `--until=${until}`, `--format=${formatStr}`];
		}

		const proc = Bun.spawn(gitArgs, {
			cwd: repoPath,
			stdout: "pipe",
			stderr: "pipe",
		});

		const output = await new Response(proc.stdout).text();
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			return [];
		}

		const entries = output.split("\0").filter((e) => e.trim());

		for (const entry of entries) {
			const parts = entry.split("|");
			if (parts.length >= 8) {
				const [hash, author, authorEmail, committer, committerEmail, dateStr, parents, ...rest] =
					parts;
				const subjectAndBody = rest.join("|");
				const [subject, ...bodyParts] = subjectAndBody.split("\n");

				if (
					hash &&
					author &&
					authorEmail &&
					committer &&
					committerEmail &&
					dateStr &&
					parents !== undefined &&
					subject
				) {
					commits.push({
						hash: hash.trim(),
						author: author.trim(),
						authorEmail: authorEmail.trim(),
						committer: committer.trim(),
						committerEmail: committerEmail.trim(),
						date: new Date(dateStr.trim()),
						subject: subject.trim(),
						body: bodyParts.join("\n").trim(),
						parents: parents.trim().split(" ").filter(Boolean),
					});
				}
			}
		}
	} catch {
		return [];
	}

	return commits;
}

async function getUserEmail(repoPath: string, config: Config): Promise<string> {
	// If config specifies identities, use the first one
	if (config.gitIdentityEmails && config.gitIdentityEmails.length > 0) {
		const email = config.gitIdentityEmails[0];
		if (email) {
			return email;
		}
	}

	// Otherwise, get the email from the repo's git config
	try {
		const proc = Bun.spawn(["git", "config", "user.email"], {
			cwd: repoPath,
			stdout: "pipe",
			stderr: "pipe",
		});

		const output = await new Response(proc.stdout).text();
		const exitCode = await proc.exited;

		if (exitCode === 0 && output.trim()) {
			return output.trim();
		}
	} catch {
		// Ignore errors
	}

	return "";
}

function isUserCommit(commit: GitCommit, userEmails: string[]): boolean {
	if (userEmails.length === 0) {
		return false;
	}

	const lowerEmails = userEmails.map((e) => e.toLowerCase());
	const authorMatch = lowerEmails.includes(commit.authorEmail.toLowerCase());
	const committerMatch = lowerEmails.includes(commit.committerEmail.toLowerCase());

	return authorMatch || committerMatch;
}

function isPrMerge(subject: string): boolean {
	// Match common PR merge patterns
	const prMergePatterns = [/^Merge pull request #\d+/i, /^Merge PR #\d+/i, /^Pull request #\d+/i];

	return prMergePatterns.some((pattern) => pattern.test(subject));
}

interface BranchMerge {
	sourceBranch: string;
	targetBranch: string;
}

function extractBranchMerge(subject: string): BranchMerge | null {
	// Match "Merge branch 'feature/foo' into main"
	const pattern1 = /^Merge branch ['"]([^'"]+)['"](?:\s+into\s+(.+))?/i;
	const match1 = pattern1.exec(subject);
	if (match1?.[1]) {
		return {
			sourceBranch: match1[1].trim(),
			targetBranch: match1[2]?.trim() || "unknown",
		};
	}

	// Match "Merge branch 'feature/foo'"
	const pattern2 = /^Merge branch ['"]([^'"]+)['"]/i;
	const match2 = pattern2.exec(subject);
	if (match2?.[1]) {
		return {
			sourceBranch: match2[1].trim(),
			targetBranch: "unknown",
		};
	}

	return null;
}

export const gitReader: SourceReader = {
	name: "git",
	async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
		const items: WorkItem[] = [];

		for (const repoPath of config.gitRepos) {
			const expandedPath = expandPath(repoPath);

			try {
				const commits = await getCommits(expandedPath, dateRange);
				const userEmail = await getUserEmail(expandedPath, config);
				const userEmails = config.gitIdentityEmails || (userEmail ? [userEmail] : []);

				for (const commit of commits) {
					const isMerge = commit.parents.length > 1;

					if (isMerge && !isPrMerge(commit.subject)) {
						const branchMerge = extractBranchMerge(commit.subject);

						if (branchMerge && isUserCommit(commit, userEmails)) {
							const repoName = repoPath.split("/").pop() || repoPath;
							items.push({
								source: "git",
								timestamp: commit.date,
								title: `[${repoName}] Merged branch ${branchMerge.sourceBranch} → ${branchMerge.targetBranch}`,
								description: commit.body || undefined,
								metadata: {
									type: "branch",
									action: "merged",
									repo: repoPath,
									sourceBranch: branchMerge.sourceBranch,
									targetBranch: branchMerge.targetBranch,
									isPrMerge: false,
									hash: commit.hash,
									author: commit.author,
								},
							});
							continue;
						}
					}

					items.push({
						source: "git",
						timestamp: commit.date,
						title: `[${repoPath.split("/").pop()}] ${commit.subject}`,
						description: commit.body || undefined,
						metadata: {
							repo: repoPath,
							hash: commit.hash,
							author: commit.author,
						},
					});
				}
			} catch {}
		}

		return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	},
};
