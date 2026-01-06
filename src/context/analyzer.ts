import type { WorkItem } from "../types.ts";

export interface ContextCluster {
	id: string;
	theme: string;
	items: WorkItem[];
	keywords: string[];
	coherenceScore: number;
}

export interface SmartSummary {
	clusters: ContextCluster[];
	narrative: string;
	crossClusterConnections: Array<{
		from: string;
		to: string;
		relationship: string;
	}>;
}

interface TermFrequency {
	[term: string]: number;
}

interface DocumentVector {
	terms: TermFrequency;
	magnitude: number;
}

const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"are",
	"as",
	"at",
	"be",
	"by",
	"for",
	"from",
	"has",
	"he",
	"in",
	"is",
	"it",
	"its",
	"of",
	"on",
	"that",
	"the",
	"to",
	"was",
	"were",
	"will",
	"with",
	"this",
	"but",
	"they",
	"have",
	"had",
	"what",
	"when",
	"where",
	"who",
	"which",
	"why",
	"how",
	"all",
	"each",
	"every",
	"both",
	"can",
	"could",
	"may",
	"might",
	"must",
	"shall",
	"should",
	"will",
	"would",
	"just",
	"now",
	"then",
	"there",
	"here",
	"also",
	"only",
	"very",
	"really",
	"quite",
	"rather",
	"some",
	"any",
	"many",
	"much",
	"few",
	"more",
	"most",
	"less",
	"least",
	"than",
	"such",
	"other",
	"another",
	"same",
	"different",
	"new",
	"old",
	"good",
	"bad",
	"big",
	"small",
	"large",
	"short",
	"long",
	"high",
	"low",
	"right",
	"wrong",
	"true",
	"false",
	"yes",
	"no",
	"not",
	"never",
	"always",
	"often",
	"sometimes",
	"usually",
	"generally",
	"specifically",
	"particularly",
	"actually",
	"really",
	"certainly",
	"definitely",
	"probably",
	"possibly",
	"maybe",
	"perhaps",
	"like",
	"such",
	"well",
	"even",
	"though",
	"although",
	"because",
	"since",
	"while",
	"during",
	"after",
	"before",
	"until",
	"since",
	"ago",
	"later",
	"earlier",
	"soon",
	"now",
	"then",
	"when",
	"where",
	"why",
	"how",
	"what",
	"which",
	"who",
	"whose",
	"whom",
	"that",
	"this",
	"these",
	"those",
	"i",
	"me",
	"my",
	"myself",
	"you",
	"your",
	"yourself",
	"he",
	"him",
	"his",
	"himself",
	"she",
	"her",
	"hers",
	"herself",
	"it",
	"its",
	"itself",
	"we",
	"us",
	"our",
	"ourselves",
	"they",
	"them",
	"their",
	"themselves",
	"one",
	"ones",
	"someone",
	"somebody",
	"something",
	"everyone",
	"everybody",
	"everything",
	"nobody",
	"nothing",
	"none",
	"anybody",
	"anything",
	"each",
	"either",
	"neither",
	"both",
	"all",
	"any",
	"some",
	"many",
	"much",
	"few",
	"little",
	"more",
	"most",
	"least",
	"less",
	"than",
	"such",
	"other",
	"another",
	"same",
	"different",
	"changing",
]);

// Generic keywords that don't provide meaningful cluster themes
const GENERIC_KEYWORDS = new Set([
	// Source/tool specific
	"opencode",
	"background",
	"zsh",
	"bash",
	"terminal",
	"shell",
	"command",
	"commands",
	"git",
	"file",
	"files",
	"vscode",
	"cursor",
	"editor",
	"code",
	"coding",
	"development",
	"programming",
	"software",

	// Generic work terms
	"project",
	"projects",
	"work",
	"working",
	"task",
	"tasks",
	"item",
	"items",
	"activity",
	"activities",
	"session",
	"sessions",
	"window",
	"windows",
	"tab",
	"tabs",
	"page",
	"pages",

	// Generic data/tech terms
	"data",
	"database",
	"db",
	"api",
	"apis",
	"server",
	"servers",
	"client",
	"clients",
	"request",
	"requests",
	"response",
	"responses",
	"error",
	"errors",

	// Generic issue/PR terms
	"issue",
	"issues",
	"bug",
	"bugs",
	"fix",
	"fixes",
	"feature",
	"features",
	"update",
	"updates",
	"change",
	"changes",
	"commit",
	"commits",
	"push",
	"pull",
	"merge",
	"branch",
	"branches",
	"repository",
	"repositories",
	"repo",
	"repos",

	// GitHub specific
	"github",
	"pr",
	"pull",
	"request",
	"opened",
	"merged",
	"closed",

	// User/repo names (these are too generic in PR titles)
	"jvalentini",
	"worklog",
	"main",
	"master",
	"develop",
	"development",

	// Common verbs that don't help clustering
	"add",
	"added",
	"create",
	"created",
	"update",
	"updated",
	"remove",
	"removed",
	"delete",
	"deleted",
	"implement",
	"implemented",
	"improve",
	"improved",
	"fix",
	"fixed",
	"ensure",
	"ensures",
	"make",
	"made",
	"set",
	"setting",
	"get",
	"getting",
	"run",
	"running",
	"start",
	"started",
	"stop",
	"stopped",
	"enable",
	"enabled",
	"disable",
	"disabled",

	// PR/commit specific terms
	"pr",
	"pull",
	"request",
	"requests",
	"merge",
	"merges",
	"merged",
	"commit",
	"commits",
	"branch",
	"branches",

	// More generic action words
	"trigger",
	"triggers",
	"triggered",
	"handle",
	"handles",
	"handled",
	"support",
	"supports",
	"supported",
	"resolve",
	"resolves",
	"resolved",
	"address",
	"addresses",
	"addressed",

	// Tool/framework names that are too generic
	"release",
	"please",
	"npm",
	"bun",
	"node",
	"typescript",
	"ts",
	"js",
	"javascript",
	"react",
	"vue",
	"angular",
	"next",
	"nuxt",
	"express",
	"fastify",
	"docker",
	"kubernetes",
	"aws",
	"gcp",
	"azure",
	"postgres",
	"postgresql",
	"mysql",
	"mongodb",
	"redis",
	"elasticsearch",

	// Even more generic terms
	"new",
	"old",
	"good",
	"bad",
	"better",
	"best",
	"simple",
	"complex",
	"easy",
	"hard",
	"quick",
	"fast",
	"slow",
	"small",
	"large",
	"big",
	"little",
	"major",
	"minor",
	"patch",
]);

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function computeTermFrequency(tokens: string[]): TermFrequency {
	const tf: TermFrequency = {};
	for (const token of tokens) {
		tf[token] = (tf[token] ?? 0) + 1;
	}
	const maxFreq = Math.max(...Object.values(tf), 1);
	for (const term in tf) {
		tf[term] = (tf[term] ?? 0) / maxFreq;
	}
	return tf;
}

function computeIDF(documents: string[][]): Map<string, number> {
	const docCount = documents.length;
	const termDocCount = new Map<string, number>();

	for (const doc of documents) {
		const uniqueTerms = new Set(doc);
		for (const term of uniqueTerms) {
			termDocCount.set(term, (termDocCount.get(term) ?? 0) + 1);
		}
	}

	const idf = new Map<string, number>();
	for (const [term, count] of termDocCount) {
		idf.set(term, Math.log(docCount / count) + 1);
	}

	return idf;
}

function computeTFIDF(tf: TermFrequency, idf: Map<string, number>): DocumentVector {
	const terms: TermFrequency = {};
	let sumSquares = 0;

	for (const [term, freq] of Object.entries(tf)) {
		const tfidf = freq * (idf.get(term) ?? 1);
		terms[term] = tfidf;
		sumSquares += tfidf * tfidf;
	}

	return {
		terms,
		magnitude: Math.sqrt(sumSquares),
	};
}

function cosineSimilarity(a: DocumentVector, b: DocumentVector): number {
	if (a.magnitude === 0 || b.magnitude === 0) return 0;

	let dotProduct = 0;
	for (const [term, weight] of Object.entries(a.terms)) {
		if (term in b.terms) {
			dotProduct += weight * (b.terms[term] ?? 0);
		}
	}

	return dotProduct / (a.magnitude * b.magnitude);
}

export function computeSimilarityMatrix(items: WorkItem[]): number[][] {
	const documents = items.map((item) => {
		const text = `${item.title} ${item.description ?? ""}`;
		return tokenize(text);
	});

	const idf = computeIDF(documents);

	const vectors = documents.map((doc) => {
		const tf = computeTermFrequency(doc);
		return computeTFIDF(tf, idf);
	});

	const matrix: number[][] = Array.from({ length: items.length }, () =>
		Array.from({ length: items.length }, () => 0),
	);

	for (let i = 0; i < items.length; i++) {
		const row = matrix[i];
		const vecI = vectors[i];
		if (!row || !vecI) continue;
		for (let j = 0; j < items.length; j++) {
			if (i === j) {
				row[j] = 1;
			} else if (j < i) {
				row[j] = matrix[j]?.[i] ?? 0;
			} else {
				const vecJ = vectors[j];
				if (vecJ) {
					let similarity = cosineSimilarity(vecI, vecJ);

					// Boost similarity for clearly related items
					const itemI = items[i];
					const itemJ = items[j];
					if (itemI && itemJ) {
						// GitHub PR events with same PR number should be highly similar
						const prMatchI = itemI.title.match(/PR #(\d+)/);
						const prMatchJ = itemJ.title.match(/PR #(\d+)/);
						if (prMatchI && prMatchJ && prMatchI[1] === prMatchJ[1]) {
							similarity = Math.max(similarity, 0.9);
						}

						// Same commit hash should be highly similar
						const commitMatchI = itemI.title.match(/([a-f0-9]{7,40})/);
						const commitMatchJ = itemJ.title.match(/([a-f0-9]{7,40})/);
						if (commitMatchI && commitMatchJ && commitMatchI[1] === commitMatchJ[1]) {
							similarity = Math.max(similarity, 0.95);
						}
					}

					row[j] = similarity;
				}
			}
		}
	}

	return matrix;
}

export function clusterItems(items: WorkItem[], threshold = 0.3): ContextCluster[] {
	if (items.length === 0) return [];
	const firstItem = items[0];
	if (items.length === 1 && firstItem) {
		return [createCluster([firstItem], 0)];
	}

	const matrix = computeSimilarityMatrix(items);
	const assigned = new Set<number>();
	const clusters: ContextCluster[] = [];

	for (let i = 0; i < items.length; i++) {
		if (assigned.has(i)) continue;

		const clusterIndices = [i];
		assigned.add(i);

		for (let j = i + 1; j < items.length; j++) {
			if (assigned.has(j)) continue;

			const avgSimilarity =
				clusterIndices.reduce((sum, idx) => sum + (matrix[idx]?.[j] ?? 0), 0) /
				clusterIndices.length;

			if (avgSimilarity >= threshold) {
				clusterIndices.push(j);
				assigned.add(j);
			}
		}

		const clusterItems = clusterIndices
			.map((idx) => items[idx])
			.filter((item): item is WorkItem => item !== undefined);
		clusters.push(createCluster(clusterItems, clusters.length));
	}

	return clusters;
}

function createCluster(items: WorkItem[], index: number): ContextCluster {
	const allText = items.map((i) => `${i.title} ${i.description ?? ""}`).join(" ");
	const tokens = tokenize(allText);

	const termCounts = new Map<string, number>();
	for (const token of tokens) {
		termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
	}

	const sortedTerms = [...termCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

	const keywords = sortedTerms.map(([term]) => term);

	const coherenceScore = items.length > 1 ? computeClusterCoherence(items) : 1;

	return {
		id: `cluster-${index}`,
		theme: generateThemeLabel(keywords, items),
		items,
		keywords,
		coherenceScore,
	};
}

function computeClusterCoherence(items: WorkItem[]): number {
	if (items.length < 2) return 1;

	const matrix = computeSimilarityMatrix(items);
	let totalSimilarity = 0;
	let pairCount = 0;

	for (let i = 0; i < items.length; i++) {
		for (let j = i + 1; j < items.length; j++) {
			totalSimilarity += matrix[i]?.[j] ?? 0;
			pairCount++;
		}
	}

	return pairCount > 0 ? totalSimilarity / pairCount : 0;
}

function generateThemeLabel(keywords: string[], items: WorkItem[]): string {
	// Filter out generic keywords that don't provide meaningful themes
	const meaningfulKeywords = keywords.filter((k) => !GENERIC_KEYWORDS.has(k.toLowerCase()));

	if (meaningfulKeywords.length === 0) {
		// If no meaningful keywords, try to generate a theme from item content
		const allText = items.map((i) => `${i.title} ${i.description ?? ""}`).join(" ");
		const titleTokens = tokenize(allText).filter((t) => !GENERIC_KEYWORDS.has(t.toLowerCase()));

		if (titleTokens.length > 0) {
			// Use the most common meaningful words from all content
			const tokenCounts = new Map<string, number>();
			for (const token of titleTokens) {
				tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
			}
			const sortedTokens = [...tokenCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3); // Get top 3 most meaningful terms

			// Try to find the most specific/unique terms
			const meaningfulTokens = sortedTokens
				.map(([token]) => token)
				.filter((token) => token.length > 3) // Prefer longer, more specific words
				.slice(0, 2); // Take at most 2

			if (meaningfulTokens.length >= 2) {
				const first = meaningfulTokens[0];
				const second = meaningfulTokens[1];
				if (first && second) {
					return `${capitalize(first)} & ${capitalize(second)}`;
				}
			} else if (meaningfulTokens.length === 1) {
				const first = meaningfulTokens[0];
				if (first) {
					return capitalize(first);
				}
			}
		}

		// Last resort: try to find any nouns or proper names
		const fullContent = items.map((i) => `${i.title} ${i.description ?? ""}`).join(" ");
		const matchedWords = fullContent.toLowerCase().match(/\b[a-z]{4,}\b/g); // Words of 4+ characters
		const fallbackTokens: string[] =
			matchedWords?.filter((word): word is string => !GENERIC_KEYWORDS.has(word))?.slice(0, 2) ??
			[];

		if (fallbackTokens.length >= 2) {
			const first = fallbackTokens[0];
			const second = fallbackTokens[1];
			if (first && second) {
				return `${capitalize(first)} & ${capitalize(second)}`;
			}
		} else if (fallbackTokens.length === 1) {
			const first = fallbackTokens[0];
			if (first) {
				return capitalize(first);
			}
		}

		// Ultimate fallback to source-based naming
		const sources = [...new Set(items.map((i) => i.source))];
		return sources.length === 1 ? `${sources[0]} activity` : "Mixed activity";
	}

	// For meaningful keywords, prefer longer, more specific ones
	const sortedKeywords = meaningfulKeywords
		.sort((a, b) => b.length - a.length) // Longer words first
		.slice(0, 2);

	const primary = sortedKeywords[0];
	const secondary = sortedKeywords[1];

	if (!primary) {
		const sources = [...new Set(items.map((i) => i.source))];
		return sources.length === 1 ? `${sources[0]} activity` : "Mixed activity";
	}

	if (secondary) {
		return `${capitalize(primary)} & ${capitalize(secondary)}`;
	}

	return capitalize(primary);
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function findCrossClusterConnections(
	clusters: ContextCluster[],
): Array<{ from: string; to: string; relationship: string }> {
	const connections: Array<{ from: string; to: string; relationship: string }> = [];

	for (let i = 0; i < clusters.length; i++) {
		for (let j = i + 1; j < clusters.length; j++) {
			const a = clusters[i];
			const b = clusters[j];
			if (!a || !b) continue;

			// Only consider meaningful shared keywords (filter out generic ones)
			const sharedKeywords = a.keywords
				.filter((k) => b.keywords.includes(k))
				.filter((k) => !GENERIC_KEYWORDS.has(k.toLowerCase()));

			// Only create connections if there are meaningful shared keywords
			// and the clusters are actually different (not just the same generic keywords)
			if (sharedKeywords.length > 0 && a.theme !== b.theme) {
				connections.push({
					from: a.id,
					to: b.id,
					relationship: `Shared focus: ${sharedKeywords.join(", ")}`,
				});
			}
		}
	}

	return connections;
}

export function buildSmartSummary(items: WorkItem[], threshold = 0.3): SmartSummary {
	const clusters = clusterItems(items, threshold);
	const connections = findCrossClusterConnections(clusters);

	const narrativeParts: string[] = [];

	for (const cluster of clusters) {
		const itemCount = cluster.items.length;
		const itemWord = itemCount === 1 ? "item" : "items";
		narrativeParts.push(`${cluster.theme} (${itemCount} ${itemWord})`);
	}

	const narrative =
		clusters.length === 0
			? "No work items to summarize."
			: clusters.length === 1
				? `Work focused on: ${narrativeParts[0]}`
				: `Work spanned ${clusters.length} areas: ${narrativeParts.join(", ")}`;

	return {
		clusters,
		narrative,
		crossClusterConnections: connections,
	};
}

export function extractKeyTerms(items: WorkItem[], topN = 10): string[] {
	const documents = items.map((item) => {
		const text = `${item.title} ${item.description ?? ""}`;
		return tokenize(text);
	});

	const idf = computeIDF(documents);

	const globalTermScores = new Map<string, number>();

	for (const doc of documents) {
		const tf = computeTermFrequency(doc);
		for (const [term, freq] of Object.entries(tf)) {
			const tfidf = freq * (idf.get(term) ?? 1);
			globalTermScores.set(term, (globalTermScores.get(term) ?? 0) + tfidf);
		}
	}

	return [...globalTermScores.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, topN)
		.map(([term]) => term);
}
