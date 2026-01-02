import type { WorkItem } from "../types.ts";
import { expandPath } from "./config.ts";

export const MISC_PROJECT = "misc";

function normalizeProjectName(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getRepoBasename(repoPath: string): string {
	const normalized = repoPath.replace(/\/$/, "");
	const parts = normalized.split("/");
	return parts[parts.length - 1] ?? normalized;
}

function isPath(str: string): boolean {
	return (
		str.startsWith("~") || str.startsWith("/") || str.startsWith("./") || str.startsWith("../")
	);
}

function isGitHubFormat(str: string): boolean {
	return !isPath(str) && str.includes("/") && str.split("/").length === 2;
}

function buildRepoBasenameMap(expandedRepos: string[]): Map<string, string[]> {
	const repoBasenames = new Map<string, string[]>();

	for (const repo of expandedRepos) {
		const basename = getRepoBasename(repo);
		const normalized = normalizeProjectName(basename);
		if (!repoBasenames.has(normalized)) {
			repoBasenames.set(normalized, []);
		}
		repoBasenames.get(normalized)?.push(repo);
	}

	return repoBasenames;
}

function findLongestPathMatch(itemPath: string, expandedRepos: string[]): string {
	let longestMatch = "";

	for (const repo of expandedRepos) {
		if (itemPath === repo || itemPath.startsWith(`${repo}/`) || repo.startsWith(`${itemPath}/`)) {
			if (repo.length > longestMatch.length) {
				longestMatch = repo;
			}
		}
	}

	return longestMatch;
}

function getOriginalRepoPath(
	expandedMatch: string,
	expandedRepos: string[],
	gitRepos: string[],
): string {
	const matchIndex = expandedRepos.indexOf(expandedMatch);
	return matchIndex !== -1 ? (gitRepos[matchIndex] ?? MISC_PROJECT) : MISC_PROJECT;
}

function matchByBasename(
	normalizedName: string,
	repoBasenames: Map<string, string[]>,
	expandedRepos: string[],
	gitRepos: string[],
): string {
	const matches = repoBasenames.get(normalizedName);
	if (matches && matches.length > 0) {
		const firstMatch = matches[0];
		if (firstMatch) {
			return getOriginalRepoPath(firstMatch, expandedRepos, gitRepos);
		}
	}
	return MISC_PROJECT;
}

export function attributeWorkItem(item: WorkItem, gitRepos: string[]): string {
	const expandedRepos = gitRepos.map((repo) => expandPath(repo));
	const repoBasenames = buildRepoBasenameMap(expandedRepos);

	const metadataRepo = item.metadata?.repo;
	const metadataProject = item.metadata?.project;

	if (typeof metadataRepo === "string" && isPath(metadataRepo)) {
		const expandedItem = expandPath(metadataRepo);
		const longestMatch = findLongestPathMatch(expandedItem, expandedRepos);

		if (longestMatch) {
			return getOriginalRepoPath(longestMatch, expandedRepos, gitRepos);
		}
	}

	if (typeof metadataRepo === "string" && isGitHubFormat(metadataRepo)) {
		const parts = metadataRepo.split("/");
		const repoName = parts[1];
		if (repoName) {
			const normalized = normalizeProjectName(repoName);
			return matchByBasename(normalized, repoBasenames, expandedRepos, gitRepos);
		}
	}

	if (typeof metadataProject === "string") {
		const normalized = normalizeProjectName(metadataProject);
		return matchByBasename(normalized, repoBasenames, expandedRepos, gitRepos);
	}

	return MISC_PROJECT;
}
