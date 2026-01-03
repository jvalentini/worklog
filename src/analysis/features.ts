import type { GitRepoStatus } from "../sources/gitStatus.ts";
import type { WorkItem } from "../types.ts";

export type FeatureStatus = "started" | "in-progress" | "nearly-done" | "completed";

export interface FeatureCluster {
	name: string;
	keywords: string[];
	items: WorkItem[];
	status: FeatureStatus;
	completionEstimate: number; // 0-100
	recentActivity: Date | null;
	suggestedNextSteps: string[];
}

export interface FeatureAnalysis {
	features: FeatureCluster[];
	uncategorized: WorkItem[];
	activeFeatureCount: number;
	completedFeatureCount: number;
}

// Common prefixes to strip from commit messages
const COMMIT_PREFIXES = [
	/^feat(\([^)]+\))?:\s*/i,
	/^fix(\([^)]+\))?:\s*/i,
	/^chore(\([^)]+\))?:\s*/i,
	/^docs(\([^)]+\))?:\s*/i,
	/^style(\([^)]+\))?:\s*/i,
	/^refactor(\([^)]+\))?:\s*/i,
	/^test(\([^)]+\))?:\s*/i,
	/^ci(\([^)]+\))?:\s*/i,
	/^build(\([^)]+\))?:\s*/i,
	/^perf(\([^)]+\))?:\s*/i,
	/^\[[^\]]+\]\s*/,
];

function normalizeTitle(title: string): string {
	let normalized = title.toLowerCase();
	for (const prefix of COMMIT_PREFIXES) {
		normalized = normalized.replace(prefix, "");
	}
	return normalized.trim();
}

function extractKeywords(text: string): string[] {
	const normalized = normalizeTitle(text);
	// Extract meaningful words (3+ chars, not common words)
	const stopWords = new Set([
		"the",
		"and",
		"for",
		"add",
		"fix",
		"update",
		"remove",
		"delete",
		"change",
		"new",
		"use",
		"with",
		"from",
		"into",
		"that",
		"this",
		"has",
		"have",
		"was",
		"were",
		"are",
		"been",
	]);

	return normalized
		.split(/\W+/)
		.filter((word) => word.length >= 3 && !stopWords.has(word))
		.slice(0, 10);
}

function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
	if (keywords1.length === 0 || keywords2.length === 0) return 0;

	const set1 = new Set(keywords1);
	const set2 = new Set(keywords2);

	let intersection = 0;
	for (const word of set1) {
		if (set2.has(word)) intersection++;
	}

	const union = new Set([...keywords1, ...keywords2]).size;
	return intersection / union;
}

function inferFeatureName(items: WorkItem[]): string {
	// Find most common meaningful keywords across items
	const keywordCounts = new Map<string, number>();

	for (const item of items) {
		const keywords = extractKeywords(item.title);
		for (const keyword of keywords) {
			keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
		}
	}

	// Get top keywords
	const sortedKeywords = [...keywordCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([keyword]) => keyword);

	if (sortedKeywords.length === 0) {
		return "Miscellaneous work";
	}

	// Capitalize first letter of each word
	return sortedKeywords.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" ");
}

function inferStatus(
	items: WorkItem[],
	hasUncommittedWork: boolean,
): { status: FeatureStatus; estimate: number } {
	const itemCount = items.length;
	const recentItems = items.filter((item) => {
		const hoursSince = (Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60);
		return hoursSince < 24;
	});

	// If there's uncommitted work related to this feature, it's in-progress
	if (hasUncommittedWork) {
		return { status: "in-progress", estimate: 50 };
	}

	// If no recent activity, might be completed or abandoned
	if (recentItems.length === 0 && itemCount > 3) {
		return { status: "nearly-done", estimate: 85 };
	}

	// Few items = just started
	if (itemCount <= 2) {
		return { status: "started", estimate: 15 };
	}

	// Medium activity = in progress
	if (itemCount <= 5) {
		return { status: "in-progress", estimate: 45 };
	}

	// Lots of activity = nearly done
	return { status: "nearly-done", estimate: 75 };
}

function generateNextSteps(cluster: FeatureCluster, repoStatus?: GitRepoStatus): string[] {
	const steps: string[] = [];
	const featureName = cluster.name.toLowerCase();

	// Based on status
	if (cluster.status === "started") {
		steps.push(`Continue implementing ${featureName}`);
		steps.push("Review initial approach and validate design");
	} else if (cluster.status === "in-progress") {
		steps.push(`Complete remaining ${featureName} implementation`);
		steps.push("Add tests for new functionality");
	} else if (cluster.status === "nearly-done") {
		steps.push("Review and clean up code");
		steps.push("Ensure test coverage is adequate");
		steps.push("Prepare for code review/PR");
	}

	// Based on repo status
	if (repoStatus) {
		if (repoStatus.hasUncommittedChanges) {
			const stagedCount = repoStatus.changes.filter((c) => c.staged).length;
			const unstagedCount = repoStatus.changes.filter((c) => !c.staged).length;

			if (stagedCount > 0 && unstagedCount === 0) {
				steps.unshift("Commit staged changes");
			} else if (unstagedCount > 0) {
				steps.unshift("Stage and commit pending changes");
			}
		}

		if (repoStatus.hasUnpushedCommits) {
			steps.push(`Push ${repoStatus.branch.ahead} commit(s) to remote`);
		}
	}

	return steps.slice(0, 4);
}

export function analyzeFeatures(
	items: WorkItem[],
	repoStatuses: GitRepoStatus[] = [],
): FeatureAnalysis {
	if (items.length === 0) {
		return {
			features: [],
			uncategorized: [],
			activeFeatureCount: 0,
			completedFeatureCount: 0,
		};
	}

	// Extract keywords for each item
	const itemKeywords = items.map((item) => ({
		item,
		keywords: extractKeywords(item.title),
	}));

	// Cluster items by similarity
	const clusters: { items: WorkItem[]; keywords: string[] }[] = [];
	const assigned = new Set<WorkItem>();

	const SIMILARITY_THRESHOLD = 0.25;

	for (const { item, keywords } of itemKeywords) {
		if (assigned.has(item)) continue;

		// Find best matching cluster
		let bestCluster: (typeof clusters)[0] | null = null;
		let bestSimilarity = 0;

		for (const cluster of clusters) {
			const similarity = calculateSimilarity(keywords, cluster.keywords);
			if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
				bestSimilarity = similarity;
				bestCluster = cluster;
			}
		}

		if (bestCluster) {
			bestCluster.items.push(item);
			// Merge keywords
			bestCluster.keywords = [...new Set([...bestCluster.keywords, ...keywords])];
		} else {
			// Create new cluster
			clusters.push({ items: [item], keywords: [...keywords] });
		}

		assigned.add(item);
	}

	// Check which repos have uncommitted changes
	const reposWithChanges = new Set(
		repoStatuses.filter((r) => r.hasUncommittedChanges).map((r) => r.repoPath),
	);

	// Convert clusters to FeatureClusters
	const features: FeatureCluster[] = [];
	const uncategorized: WorkItem[] = [];

	for (const cluster of clusters) {
		// Single items without clear theme go to uncategorized
		if (cluster.items.length === 1 && cluster.keywords.length < 2) {
			uncategorized.push(...cluster.items);
			continue;
		}

		const name = inferFeatureName(cluster.items);

		// Check if any item is from a repo with uncommitted changes
		const hasUncommittedWork = cluster.items.some((item) => {
			const repo = item.metadata?.repo as string | undefined;
			return repo && reposWithChanges.has(repo);
		});

		const { status, estimate } = inferStatus(cluster.items, hasUncommittedWork);

		// Find most recent activity
		const sortedItems = [...cluster.items].sort(
			(a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
		);
		const recentActivity = sortedItems[0]?.timestamp || null;

		// Get relevant repo status for next steps
		const relevantRepo = cluster.items
			.map((item) => item.metadata?.repo as string | undefined)
			.filter(Boolean)
			.map((repoPath) => repoStatuses.find((r) => r.repoPath === repoPath))
			.find(Boolean);

		const featureCluster: FeatureCluster = {
			name,
			keywords: cluster.keywords,
			items: cluster.items,
			status,
			completionEstimate: estimate,
			recentActivity,
			suggestedNextSteps: [],
		};

		featureCluster.suggestedNextSteps = generateNextSteps(featureCluster, relevantRepo);
		features.push(featureCluster);
	}

	// Sort features by recent activity (most recent first)
	features.sort((a, b) => {
		if (!a.recentActivity && !b.recentActivity) return 0;
		if (!a.recentActivity) return 1;
		if (!b.recentActivity) return -1;
		return b.recentActivity.getTime() - a.recentActivity.getTime();
	});

	const activeFeatureCount = features.filter(
		(f) => f.status !== "completed" && f.status !== "nearly-done",
	).length;
	const completedFeatureCount = features.filter(
		(f) => f.status === "completed" || f.status === "nearly-done",
	).length;

	return {
		features,
		uncategorized,
		activeFeatureCount,
		completedFeatureCount,
	};
}
