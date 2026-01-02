import { format, isSameDay } from "date-fns";
import { getCommitSubjects, getGitHubDescriptions, getSessionDescriptions } from "../aggregator.ts";
import type { DailyProjectActivity, ProjectActivity, ProjectWorkSummary } from "../types.ts";
import { formatDateRange } from "../utils/dates.ts";

function formatDailyProject(
	project: ProjectActivity,
	daily: DailyProjectActivity,
	verbose: boolean,
): string {
	if (!verbose) {
		const summary = daily.summary ?? generateEnhancedSummary(daily);
		return `**${project.projectName}**: ${summary}`;
	}

	const lines: string[] = [];
	lines.push(`## ${project.projectName}`);

	const summary = daily.summary ?? generateNarrativeSummary(daily);
	lines.push(`**Summary**: ${summary}`);
	lines.push("");

	if (daily.commits.length > 0) {
		lines.push(`**Commits** (${daily.commits.length}):`);
		const subjects = getCommitSubjects(daily.commits);
		for (const subject of subjects) {
			lines.push(`- ${subject}`);
		}
		lines.push("");
	}

	if (daily.sessions.length > 0) {
		lines.push(`**AI Sessions** (${daily.sessions.length}):`);
		const descriptions = getSessionDescriptions(daily.sessions);
		for (const desc of descriptions) {
			lines.push(`- ${desc}`);
		}
		lines.push("");
	}

	if (daily.githubActivity.length > 0) {
		lines.push(`**GitHub** (${daily.githubActivity.length}):`);
		const descriptions = getGitHubDescriptions(daily.githubActivity);
		for (const desc of descriptions) {
			lines.push(`- ${desc}`);
		}
		lines.push("");
	}

	return lines.join("\n");
}

function generateEnhancedSummary(activity: DailyProjectActivity): string {
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

	if (parts.length === 0 && activity.githubActivity.length > 0) {
		const descriptions = getGitHubDescriptions(activity.githubActivity);
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

function generateNarrativeSummary(activity: DailyProjectActivity): string {
	const parts: string[] = [];

	const commitCount = activity.commits.length;
	const sessionCount = activity.sessions.length;
	const githubCount = activity.githubActivity.length;

	if (commitCount > 0) {
		const subjects = getCommitSubjects(activity.commits);
		const types = analyzeCommitTypes(subjects);

		if (types.length > 0) {
			parts.push(types.join(", "));
		} else {
			parts.push(`${commitCount} commit${commitCount > 1 ? "s" : ""}`);
		}
	}

	if (sessionCount > 0) {
		parts.push(`${sessionCount} AI session${sessionCount > 1 ? "s" : ""}`);
	}

	if (githubCount > 0) {
		parts.push(`${githubCount} GitHub event${githubCount > 1 ? "s" : ""}`);
	}

	if (parts.length === 0) {
		return "Development activity";
	}

	return parts.join(" with ");
}

function cleanSubject(subject: string): string {
	let cleaned = subject.replace(
		/^(feat|fix|docs|refactor|test|chore|style|perf|ci|build)(\([^)]*\))?:\s*/i,
		"",
	);
	cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	return cleaned;
}

function analyzeCommitTypes(subjects: string[]): string[] {
	const types: Record<string, number> = {};

	for (const subject of subjects) {
		const match = /^(feat|fix|docs|refactor|test|chore|style|perf|ci|build)/i.exec(subject);
		if (match) {
			const type = match[1]?.toLowerCase();
			if (type) {
				types[type] = (types[type] ?? 0) + 1;
			}
		}
	}

	const result: string[] = [];
	const typeLabels: Record<string, string> = {
		feat: "feature",
		fix: "bug fix",
		docs: "documentation",
		refactor: "refactoring",
		test: "testing",
		chore: "maintenance",
		style: "styling",
		perf: "performance",
		ci: "CI/CD",
		build: "build",
	};

	for (const [type, count] of Object.entries(types)) {
		const label = typeLabels[type] ?? type;
		if (count === 1) {
			result.push(label);
		} else {
			result.push(`${count} ${label}${type === "fix" ? "es" : "s"}`);
		}
	}

	return result;
}

function isSingleDay(summary: ProjectWorkSummary): boolean {
	const { start, end } = summary.dateRange;
	return isSameDay(start, end);
}

function getAllDates(summary: ProjectWorkSummary): Date[] {
	const dateSet = new Set<string>();
	const dates: Date[] = [];

	for (const project of summary.projects) {
		for (const daily of project.dailyActivity) {
			const key = format(daily.date, "yyyy-MM-dd");
			if (!dateSet.has(key)) {
				dateSet.add(key);
				dates.push(daily.date);
			}
		}
	}

	return dates.sort((a, b) => a.getTime() - b.getTime());
}

function getProjectActivityForDate(
	project: ProjectActivity,
	date: Date,
): DailyProjectActivity | undefined {
	return project.dailyActivity.find((daily) => isSameDay(daily.date, date));
}

export function formatProjectsMarkdown(summary: ProjectWorkSummary, verbose = false): string {
	const lines: string[] = [];

	if (isSingleDay(summary)) {
		lines.push(`# Daily Standup - ${formatDateRange(summary.dateRange)}`);
	} else {
		lines.push(`# Weekly Standup - ${formatDateRange(summary.dateRange)}`);
	}
	lines.push("");

	if (summary.projects.length === 0) {
		lines.push("*No project activity recorded for this period.*");
		lines.push("");
		lines.push("---");
		lines.push(`*Generated at ${format(summary.generatedAt, "yyyy-MM-dd HH:mm:ss")}*`);
		return lines.join("\n");
	}

	if (isSingleDay(summary)) {
		for (const project of summary.projects) {
			for (const daily of project.dailyActivity) {
				lines.push(formatDailyProject(project, daily, verbose));
			}
		}
	} else {
		const allDates = getAllDates(summary);

		for (const date of allDates) {
			lines.push(`## ${format(date, "EEEE, MMMM d")}`);
			lines.push("");

			for (const project of summary.projects) {
				const daily = getProjectActivityForDate(project, date);
				if (daily) {
					lines.push(formatDailyProject(project, daily, verbose));
				}
			}
			lines.push("");
		}
	}

	lines.push("---");
	lines.push(`*Generated at ${format(summary.generatedAt, "yyyy-MM-dd HH:mm:ss")}*`);

	return lines.join("\n");
}

export function formatProjectsPlain(summary: ProjectWorkSummary): string {
	const lines: string[] = [];

	if (isSingleDay(summary)) {
		lines.push(`Worklog: ${formatDateRange(summary.dateRange)}`);
	} else {
		lines.push(`Weekly Worklog: ${formatDateRange(summary.dateRange)}`);
	}
	lines.push("=".repeat(50));
	lines.push("");

	if (summary.projects.length === 0) {
		lines.push("No project activity recorded for this period.");
		return lines.join("\n");
	}

	if (isSingleDay(summary)) {
		for (const project of summary.projects) {
			for (const daily of project.dailyActivity) {
				const summary_text = daily.summary ?? generateEnhancedSummary(daily);
				lines.push(`${project.projectName.toUpperCase().padEnd(15)} ${summary_text}`);
			}
		}
	} else {
		const allDates = getAllDates(summary);

		for (const date of allDates) {
			lines.push(`${format(date, "EEEE, MMMM d")}`);
			lines.push("-".repeat(30));

			for (const project of summary.projects) {
				const daily = getProjectActivityForDate(project, date);
				if (daily) {
					const summary_text = daily.summary ?? generateEnhancedSummary(daily);
					lines.push(`  ${project.projectName}: ${summary_text}`);
				}
			}
			lines.push("");
		}
	}

	return lines.join("\n");
}

export function formatProjectsSlack(summary: ProjectWorkSummary): string {
	const lines: string[] = [];

	if (isSingleDay(summary)) {
		lines.push(`:clipboard: *Daily Standup - ${formatDateRange(summary.dateRange)}*`);
	} else {
		lines.push(`:clipboard: *Weekly Standup - ${formatDateRange(summary.dateRange)}*`);
	}
	lines.push("");

	if (summary.projects.length === 0) {
		lines.push("_No project activity recorded for this period._");
		return lines.join("\n");
	}

	if (isSingleDay(summary)) {
		for (const project of summary.projects) {
			for (const daily of project.dailyActivity) {
				const summary_text = daily.summary ?? generateEnhancedSummary(daily);
				lines.push(`:file_folder: *${project.projectName}*: ${summary_text}`);
			}
		}
	} else {
		const allDates = getAllDates(summary);

		for (const date of allDates) {
			lines.push(`*${format(date, "EEEE, MMMM d")}*`);

			for (const project of summary.projects) {
				const daily = getProjectActivityForDate(project, date);
				if (daily) {
					const summary_text = daily.summary ?? generateEnhancedSummary(daily);
					lines.push(`:file_folder: *${project.projectName}*: ${summary_text}`);
				}
			}
			lines.push("");
		}
	}

	return lines.join("\n");
}

export function formatProjectsJson(summary: ProjectWorkSummary): string {
	const output = {
		dateRange: {
			start: summary.dateRange.start.toISOString(),
			end: summary.dateRange.end.toISOString(),
		},
		projects: summary.projects.map((project) => ({
			name: project.projectName,
			path: project.projectPath,
			activity: project.dailyActivity.map((daily) => ({
				date: format(daily.date, "yyyy-MM-dd"),
				summary: daily.summary ?? null,
				commitCount: daily.commits.length,
				sessionCount: daily.sessions.length,
				githubActivityCount: daily.githubActivity.length,
			})),
		})),
		generatedAt: summary.generatedAt.toISOString(),
	};

	return JSON.stringify(output, null, 2);
}
