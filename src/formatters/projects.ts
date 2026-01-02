import { format, isSameDay } from "date-fns";
import type { DailyProjectActivity, ProjectActivity, ProjectWorkSummary } from "../types.ts";
import { formatDateRange } from "../utils/dates.ts";

function formatDailyProject(project: ProjectActivity, daily: DailyProjectActivity): string {
	const summary = daily.summary ?? "Development activity";
	return `**${project.projectName}**: ${summary}`;
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

export function formatProjectsMarkdown(summary: ProjectWorkSummary): string {
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
				lines.push(formatDailyProject(project, daily));
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
					lines.push(formatDailyProject(project, daily));
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
				const summary_text = daily.summary ?? "Development activity";
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
					const summary_text = daily.summary ?? "Development activity";
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
				const summary_text = daily.summary ?? "Development activity";
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
					const summary_text = daily.summary ?? "Development activity";
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
