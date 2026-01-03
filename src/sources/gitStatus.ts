import type { Config } from "../types.ts";
import { expandPath } from "../utils/config.ts";

export interface GitFileChange {
	path: string;
	status: "modified" | "added" | "deleted" | "renamed" | "untracked";
	staged: boolean;
}

export interface GitBranchInfo {
	name: string;
	isDetached: boolean;
	ahead: number;
	behind: number;
	trackingBranch?: string;
}

export interface GitRepoStatus {
	repoPath: string;
	repoName: string;
	branch: GitBranchInfo;
	changes: GitFileChange[];
	hasUncommittedChanges: boolean;
	hasUnpushedCommits: boolean;
	lastCommitHash?: string;
	lastCommitMessage?: string;
	lastCommitDate?: Date;
}

async function runGit(
	repoPath: string,
	args: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
	const proc = Bun.spawn(["git", ...args], {
		cwd: repoPath,
		stdout: "pipe",
		stderr: "pipe",
	});

	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	const exitCode = await proc.exited;

	return { exitCode, stdout, stderr };
}

async function getBranchInfo(repoPath: string): Promise<GitBranchInfo> {
	// Get current branch name
	const { exitCode: branchExit, stdout: branchOut } = await runGit(repoPath, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);

	const isDetached = branchExit !== 0 || branchOut.trim() === "HEAD";
	let branchName = branchOut.trim();

	if (isDetached) {
		// Get short hash for detached HEAD
		const { stdout: hashOut } = await runGit(repoPath, ["rev-parse", "--short", "HEAD"]);
		branchName = `detached@${hashOut.trim()}`;
	}

	// Get tracking info
	let ahead = 0;
	let behind = 0;
	let trackingBranch: string | undefined;

	if (!isDetached) {
		const { exitCode: trackExit, stdout: trackOut } = await runGit(repoPath, [
			"rev-parse",
			"--abbrev-ref",
			`${branchName}@{upstream}`,
		]);

		if (trackExit === 0) {
			trackingBranch = trackOut.trim();

			// Get ahead/behind counts
			const { stdout: countOut } = await runGit(repoPath, [
				"rev-list",
				"--left-right",
				"--count",
				`${trackingBranch}...HEAD`,
			]);

			const [behindStr, aheadStr] = countOut.trim().split(/\s+/);
			behind = Number.parseInt(behindStr || "0", 10);
			ahead = Number.parseInt(aheadStr || "0", 10);
		}
	}

	return {
		name: branchName,
		isDetached,
		ahead,
		behind,
		trackingBranch,
	};
}

async function getChanges(repoPath: string): Promise<GitFileChange[]> {
	const changes: GitFileChange[] = [];

	// Get staged and unstaged changes
	const { exitCode, stdout } = await runGit(repoPath, ["status", "--porcelain=v1", "-uall"]);

	if (exitCode !== 0) {
		return [];
	}

	for (const line of stdout.split("\n").filter(Boolean)) {
		const indexStatus = line[0];
		const workTreeStatus = line[1];
		const path = line.slice(3).trim();

		// Skip empty paths
		if (!path) continue;

		// Determine if staged (index has changes)
		const staged = indexStatus !== " " && indexStatus !== "?";

		// Determine status
		let status: GitFileChange["status"] = "modified";

		if (indexStatus === "?" || workTreeStatus === "?") {
			status = "untracked";
		} else if (indexStatus === "A" || workTreeStatus === "A") {
			status = "added";
		} else if (indexStatus === "D" || workTreeStatus === "D") {
			status = "deleted";
		} else if (indexStatus === "R" || workTreeStatus === "R") {
			status = "renamed";
		}

		changes.push({ path, status, staged });
	}

	return changes;
}

async function getLastCommit(
	repoPath: string,
): Promise<{ hash: string; message: string; date: Date } | null> {
	const { exitCode, stdout } = await runGit(repoPath, ["log", "-1", "--format=%H|%s|%aI"]);

	if (exitCode !== 0 || !stdout.trim()) {
		return null;
	}

	const [hash, message, dateStr] = stdout.trim().split("|");
	if (!hash || !message || !dateStr) return null;

	return {
		hash,
		message,
		date: new Date(dateStr),
	};
}

export async function getRepoStatus(repoPath: string): Promise<GitRepoStatus | null> {
	const expandedPath = expandPath(repoPath);

	// Check if it's a git repo
	const { exitCode: isRepoExit } = await runGit(expandedPath, ["rev-parse", "--git-dir"]);

	if (isRepoExit !== 0) {
		return null;
	}

	const [branch, changes, lastCommit] = await Promise.all([
		getBranchInfo(expandedPath),
		getChanges(expandedPath),
		getLastCommit(expandedPath),
	]);

	const repoName = repoPath.split("/").pop() || repoPath;

	return {
		repoPath,
		repoName,
		branch,
		changes,
		hasUncommittedChanges: changes.length > 0,
		hasUnpushedCommits: branch.ahead > 0,
		lastCommitHash: lastCommit?.hash,
		lastCommitMessage: lastCommit?.message,
		lastCommitDate: lastCommit?.date,
	};
}

export async function getAllRepoStatuses(config: Config): Promise<GitRepoStatus[]> {
	const statuses: GitRepoStatus[] = [];

	for (const repoPath of config.gitRepos) {
		const status = await getRepoStatus(repoPath);
		if (status) {
			statuses.push(status);
		}
	}

	return statuses;
}
