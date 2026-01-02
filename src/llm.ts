import { format } from "date-fns";
import { getCommitSubjects, getGitHubDescriptions, getSessionDescriptions } from "./aggregator.ts";
import type { Config, DailyProjectActivity, ProjectActivity, ProjectWorkSummary } from "./types.ts";

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

async function callOpenAI(prompt: string, model: string): Promise<string> {
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
			max_tokens: 150,
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

async function callAnthropic(prompt: string, model: string): Promise<string> {
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
			max_tokens: 150,
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

async function generateSummary(prompt: string, config: Config): Promise<string> {
	const { provider, model } = config.llm;

	if (provider === "openai") {
		return callOpenAI(prompt, model);
	}

	if (provider === "anthropic") {
		return callAnthropic(prompt, model);
	}

	throw new Error(`Unknown LLM provider: ${provider}`);
}

function generateFallbackSummary(activity: DailyProjectActivity): string {
	const parts: string[] = [];

	if (activity.commits.length > 0) {
		const subjects = getCommitSubjects(activity.commits);
		const firstSubject = subjects[0];
		if (firstSubject) {
			let cleaned = firstSubject.replace(
				/^(feat|fix|docs|refactor|test|chore|style|perf|ci|build)(\([^)]*\))?:\s*/i,
				"",
			);
			cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			parts.push(cleaned);
		}
		if (activity.commits.length > 1) {
			parts.push(`and ${activity.commits.length - 1} other changes`);
		}
	}

	if (activity.sessions.length > 0 && parts.length === 0) {
		const descriptions = getSessionDescriptions(activity.sessions);
		if (descriptions[0]) {
			parts.push(descriptions[0]);
		}
	}

	if (parts.length === 0) {
		return "Development activity";
	}

	return parts.join(" ");
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
		}
	}

	const results = await Promise.all(summaryPromises.map((p) => p.promise));

	for (let i = 0; i < summaryPromises.length; i++) {
		const item = summaryPromises[i];
		const result = results[i];
		if (item && result) {
			item.daily.summary = result;
		}
	}

	return projectSummary;
}
