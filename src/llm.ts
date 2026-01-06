import { format } from "date-fns";
import { getCommitSubjects, getGitHubDescriptions, getSessionDescriptions } from "./aggregator.ts";
import {
	buildSmartSummary,
	type ContextCluster,
	extractKeyTerms,
	type SmartSummary,
} from "./context/analyzer.ts";
import type {
	Config,
	DailyProjectActivity,
	ProjectActivity,
	ProjectWorkSummary,
	WorkItem,
} from "./types.ts";
import { cleanSubject } from "./utils/commits.ts";

interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface OpenAIResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

interface AnthropicResponse {
	content: Array<{
		type: string;
		text: string;
	}>;
}

function buildPrompt(project: string, date: Date, activity: DailyProjectActivity): string {
	const parts: string[] = [];

	parts.push(
		`Summarize what was accomplished on "${project}" on ${format(date, "MMMM d, yyyy")} in a single sentence.`,
	);
	parts.push("");

	if (activity.commits.length > 0) {
		parts.push("Git commits:");
		for (const subject of getCommitSubjects(activity.commits).slice(0, 10)) {
			parts.push(`- ${subject}`);
		}
		parts.push("");
	}

	if (activity.sessions.length > 0) {
		parts.push("AI coding session activity:");
		for (const desc of getSessionDescriptions(activity.sessions).slice(0, 5)) {
			parts.push(`- ${desc}`);
		}
		parts.push("");
	}

	if (activity.githubActivity.length > 0) {
		parts.push("GitHub activity:");
		for (const desc of getGitHubDescriptions(activity.githubActivity).slice(0, 5)) {
			parts.push(`- ${desc}`);
		}
		parts.push("");
	}

	parts.push(
		"Respond with ONLY a single sentence summary. Do not include bullet points, formatting, or preamble.",
	);

	return parts.join("\n");
}

async function callOpenAI(prompt: string, model: string, maxTokens = 150): Promise<string> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable is required for LLM summarization");
	}

	const messages: OpenAIMessage[] = [
		{
			role: "system",
			content:
				"You are a concise technical writer who summarizes development work into single sentences.",
		},
		{
			role: "user",
			content: prompt,
		},
	];

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages,
			max_tokens: maxTokens,
			temperature: 0.3,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OpenAI API error: ${response.status} ${error}`);
	}

	const data = (await response.json()) as OpenAIResponse;
	const content = data.choices[0]?.message?.content?.trim();

	if (!content) {
		throw new Error("Empty response from OpenAI");
	}

	return content;
}

async function callAnthropic(prompt: string, model: string, maxTokens = 150): Promise<string> {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw new Error("ANTHROPIC_API_KEY environment variable is required for LLM summarization");
	}

	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model,
			max_tokens: maxTokens,
			system:
				"You are a concise technical writer who summarizes development work into single sentences.",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Anthropic API error: ${response.status} ${error}`);
	}

	const data = (await response.json()) as AnthropicResponse;
	const textBlock = data.content.find((block) => block.type === "text");
	const content = textBlock?.text?.trim();

	if (!content) {
		throw new Error("Empty response from Anthropic");
	}

	return content;
}

interface GeminiResponse {
	candidates: Array<{
		content: {
			parts: Array<{
				text: string;
			}>;
		};
	}>;
}

async function callGemini(prompt: string, model: string, maxTokens = 150): Promise<string> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY environment variable is required for LLM summarization");
	}

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: `You are a concise technical writer who summarizes development work into single sentences.\n\n${prompt}`,
							},
						],
					},
				],
				generationConfig: {
					maxOutputTokens: maxTokens,
					temperature: 0.3,
				},
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Gemini API error: ${response.status} ${error}`);
	}

	const data = (await response.json()) as GeminiResponse;
	const content = data.candidates[0]?.content?.parts[0]?.text?.trim();

	if (!content) {
		throw new Error("Empty response from Gemini");
	}

	return content;
}

async function generateSummary(prompt: string, config: Config, maxTokens = 150): Promise<string> {
	const { provider, model } = config.llm;

	if (provider === "openai") {
		return callOpenAI(prompt, model, maxTokens);
	}

	if (provider === "anthropic") {
		return callAnthropic(prompt, model, maxTokens);
	}

	if (provider === "gemini") {
		return callGemini(prompt, model, maxTokens);
	}

	throw new Error(`Unknown LLM provider: ${provider}`);
}

interface MergedPrInfo {
	number: number;
	title: string;
	summary?: string;
}

function extractMergedPrs(activity: DailyProjectActivity): MergedPrInfo[] {
	const mergedPrs: MergedPrInfo[] = [];

	for (const item of activity.githubActivity) {
		const metadata = item.metadata;
		if (!metadata || typeof metadata !== "object") continue;
		if (metadata.type !== "pr" || metadata.action !== "merged") continue;

		const number = metadata.number;
		if (typeof number !== "number") continue;

		const summaryValue = metadata.summary;
		const titleValue = metadata.title;
		const title = item.title;

		mergedPrs.push({
			number,
			title:
				typeof summaryValue === "string" && summaryValue.trim()
					? summaryValue.trim()
					: typeof titleValue === "string" && titleValue.trim()
						? titleValue.trim()
						: title,
			summary: typeof summaryValue === "string" ? summaryValue.trim() : undefined,
		});
	}

	return mergedPrs;
}

function buildMergedPrPrompt(project: string, mergedPrs: MergedPrInfo[]): string {
	const parts: string[] = [];

	parts.push(
		`Summarize what was accomplished in the following merged pull requests for "${project}" in 2-3 sentences.`,
	);
	parts.push("");
	parts.push("Merged PRs:");

	for (const pr of mergedPrs.slice(0, 10)) {
		const desc = pr.summary ? `: ${pr.summary}` : "";
		parts.push(`- PR #${pr.number}: ${pr.title}${desc}`);
	}

	if (mergedPrs.length > 10) {
		parts.push(`  ... and ${mergedPrs.length - 10} more PRs`);
	}

	parts.push("");
	parts.push(
		"Focus on the key improvements and features delivered. Respond with ONLY the summary sentences. No formatting or preamble.",
	);

	return parts.join("\n");
}

function generateFallbackSummary(activity: DailyProjectActivity): string {
	const parts: string[] = [];

	if (activity.commits.length > 0) {
		const subjects = getCommitSubjects(activity.commits);
		if (subjects.length <= 3) {
			parts.push(...subjects.map((s) => cleanSubject(s)));
		} else {
			const first = subjects[0];
			if (first) {
				parts.push(cleanSubject(first));
			}
		}
	}

	if (parts.length === 0 && activity.sessions.length > 0) {
		const descriptions = getSessionDescriptions(activity.sessions);
		const first = descriptions[0];
		if (first) {
			parts.push(first);
		}
	}

	if (parts.length === 0) {
		return "Development activity";
	}

	return parts.join("; ");
}

export async function summarizeProjectActivity(
	projectSummary: ProjectWorkSummary,
	config: Config,
): Promise<ProjectWorkSummary> {
	if (!config.llm.enabled) {
		for (const project of projectSummary.projects) {
			for (const daily of project.dailyActivity) {
				daily.summary = generateFallbackSummary(daily);
			}
		}
		return projectSummary;
	}

	const summaryPromises: Array<{
		project: ProjectActivity;
		daily: DailyProjectActivity;
		promise: Promise<string>;
	}> = [];

	const mergedPrPromises: Array<{
		project: ProjectActivity;
		daily: DailyProjectActivity;
		promise: Promise<string | null>;
	}> = [];

	for (const project of projectSummary.projects) {
		for (const daily of project.dailyActivity) {
			const prompt = buildPrompt(project.projectName, daily.date, daily);
			summaryPromises.push({
				project,
				daily,
				promise: generateSummary(prompt, config).catch((error) => {
					console.error(`Failed to generate summary for ${project.projectName}: ${error}`);
					return generateFallbackSummary(daily);
				}),
			});

			const mergedPrs = extractMergedPrs(daily);
			if (mergedPrs.length > 0) {
				const prPrompt = buildMergedPrPrompt(project.projectName, mergedPrs);
				mergedPrPromises.push({
					project,
					daily,
					promise: generateSummary(prPrompt, config, 500).catch((error) => {
						console.error(
							`Failed to generate merged PR summary for ${project.projectName}: ${error}`,
						);
						return null;
					}),
				});
			}
		}
	}

	const [summaryResults, prResults] = await Promise.all([
		Promise.all(summaryPromises.map((p) => p.promise)),
		Promise.all(mergedPrPromises.map((p) => p.promise)),
	]);

	for (let i = 0; i < summaryPromises.length; i++) {
		const item = summaryPromises[i];
		const result = summaryResults[i];
		if (item && result) {
			item.daily.summary = result;
		}
	}

	for (let i = 0; i < mergedPrPromises.length; i++) {
		const item = mergedPrPromises[i];
		const result = prResults[i];
		if (item && result) {
			item.daily.mergedPrSummary = result;
		}
	}

	return projectSummary;
}

function buildSmartPrompt(clusters: ContextCluster[], keyTerms: string[]): string {
	const parts: string[] = [];

	parts.push("Summarize this development work into a cohesive narrative.");
	parts.push("");
	parts.push(`Key themes: ${keyTerms.join(", ")}`);
	parts.push("");

	for (const cluster of clusters) {
		parts.push(`## ${cluster.theme}`);
		for (const item of cluster.items.slice(0, 5)) {
			const desc = item.description ? ` - ${item.description}` : "";
			parts.push(`- [${item.source}] ${item.title}${desc}`);
		}
		if (cluster.items.length > 5) {
			parts.push(`  ... and ${cluster.items.length - 5} more items`);
		}
		parts.push("");
	}

	parts.push("Write 2-3 sentences that:");
	parts.push("1. Highlight the main accomplishments");
	parts.push("2. Show how different work areas connect");
	parts.push("3. Focus on outcomes, not just activities");
	parts.push("");
	parts.push("Respond with ONLY the summary. No formatting, headers, or preamble.");

	return parts.join("\n");
}

function generateFallbackSmartSummary(smartSummary: SmartSummary): string {
	if (smartSummary.clusters.length === 0) {
		return "No development activity to summarize.";
	}

	const clusterSummaries = smartSummary.clusters.map((cluster) => {
		const count = cluster.items.length;
		const itemWord = count === 1 ? "item" : "items";
		return `${cluster.theme} (${count} ${itemWord})`;
	});

	if (clusterSummaries.length === 1) {
		return `Work focused on ${clusterSummaries[0]}.`;
	}

	return `Work spanned ${clusterSummaries.length} areas: ${clusterSummaries.join(", ")}.`;
}

export interface SmartSummaryResult {
	summary: SmartSummary;
	llmNarrative?: string;
}

export async function generateSmartSummary(
	items: WorkItem[],
	config: Config,
): Promise<SmartSummaryResult> {
	const summary = buildSmartSummary(items);
	const keyTerms = extractKeyTerms(items, 8);

	if (!config.llm.enabled) {
		return {
			summary,
			llmNarrative: generateFallbackSmartSummary(summary),
		};
	}

	try {
		const prompt = buildSmartPrompt(summary.clusters, keyTerms);
		const llmNarrative = await generateSummary(prompt, config);

		return {
			summary,
			llmNarrative,
		};
	} catch (error) {
		console.error(`Failed to generate smart summary: ${error}`);
		return {
			summary,
			llmNarrative: generateFallbackSmartSummary(summary),
		};
	}
}

export function collectAllItems(projectSummary: ProjectWorkSummary): WorkItem[] {
	const items: WorkItem[] = [];

	for (const project of projectSummary.projects) {
		for (const daily of project.dailyActivity) {
			items.push(...daily.commits);
			items.push(...daily.sessions);
			items.push(...daily.githubActivity);
			items.push(...daily.otherActivity);
		}
	}

	return items;
}
