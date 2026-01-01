import type { SourceType, WorkItem } from "../types.ts";

function pluralize(count: number, singular: string, plural?: string): string {
	if (count === 1) return `${count} ${singular}`;
	return `${count} ${plural ?? `${singular}s`}`;
}

function truncate(text: string, maxLength: number): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function topCounts(map: Map<string, number>, maxItems: number): Array<[string, number]> {
	return Array.from(map.entries())
		.sort((a, b) => {
			if (b[1] !== a[1]) return b[1] - a[1];
			return a[0].localeCompare(b[0]);
		})
		.slice(0, maxItems);
}

function formatTopCounts(map: Map<string, number>, maxItems: number): string {
	return topCounts(map, maxItems)
		.map(([key, count]) => `${key} ${count}`)
		.join(", ");
}

function parseBracketPrefix(title: string): { prefix?: string; rest: string } {
	if (!title.startsWith("[")) return { rest: title.trim() };
	const close = title.indexOf("]");
	if (close === -1) return { rest: title.trim() };
	const prefix = title.slice(1, close).trim();
	const rest = title.slice(close + 1).trim();
	return { prefix: prefix.length > 0 ? prefix : undefined, rest };
}

function parseConventionalType(subject: string): string | undefined {
	const match = /^(\w+)(\([^)]*\))?(!)?:/.exec(subject.trim());
	const type = match?.[1]?.toLowerCase();
	if (!type) return undefined;
	if (type.length > 20) return undefined;
	return type;
}

function getMetadataString(item: WorkItem, key: string): string | undefined {
	const value = item.metadata?.[key];
	return typeof value === "string" ? value : undefined;
}

function getMetadataNumber(item: WorkItem, key: string): number | undefined {
	const value = item.metadata?.[key];
	return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getMetadataStringArray(item: WorkItem, key: string): string[] | undefined {
	const value = item.metadata?.[key];
	if (!Array.isArray(value)) return undefined;
	const strings = value.filter((v): v is string => typeof v === "string" && v.length > 0);
	return strings.length > 0 ? strings : undefined;
}

function summarizeSessionSource(
	items: WorkItem[],
	unitLabel: string,
	countKey: string,
	projectKey?: string,
): string {
	const sessionCount = items.length;
	let totalUnits = 0;
	const projectCounts = new Map<string, number>();

	for (const item of items) {
		const units = getMetadataNumber(item, countKey);
		if (typeof units === "number") {
			totalUnits += units;
		}

		if (projectKey) {
			const project = getMetadataString(item, projectKey);
			if (project) {
				projectCounts.set(project, (projectCounts.get(project) ?? 0) + 1);
			}
		}
	}

	let summary = pluralize(sessionCount, "session");
	if (totalUnits > 0) {
		summary += `, ${pluralize(totalUnits, unitLabel)}`;
	}

	if (projectCounts.size > 0) {
		summary += ` across ${pluralize(projectCounts.size, "project")}`;
		const topProjects = topCounts(projectCounts, 2)
			.map(([name, count]) => `${name} ${count}`)
			.join(", ");
		if (topProjects) {
			summary += ` (${topProjects})`;
		}
	}

	return truncate(summary, 140);
}

function summarizeGit(items: WorkItem[]): string {
	const commitCount = items.length;
	const typeCounts = new Map<string, number>();
	const repoCounts = new Map<string, number>();

	for (const item of items) {
		const { prefix: repoFromTitle, rest } = parseBracketPrefix(item.title);
		if (repoFromTitle) {
			repoCounts.set(repoFromTitle, (repoCounts.get(repoFromTitle) ?? 0) + 1);
		}

		const type = parseConventionalType(rest);
		if (type) {
			typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
		}
	}

	let summary = pluralize(commitCount, "commit");

	const typeSummary = formatTopCounts(typeCounts, 3);
	if (typeSummary) {
		summary += ` (${typeSummary})`;
	}

	if (repoCounts.size > 1) {
		summary += ` across ${pluralize(repoCounts.size, "repo")}`;
		const repoSummary = formatTopCounts(repoCounts, 2);
		if (repoSummary) {
			summary += ` (${repoSummary})`;
		}
	}

	return truncate(summary, 160);
}

function summarizeGitHub(items: WorkItem[]): string {
	const eventCount = items.length;
	const typeCounts = new Map<string, number>();
	const repoCounts = new Map<string, number>();

	for (const item of items) {
		const type = getMetadataString(item, "type");
		if (type) {
			typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
		}

		const repo = getMetadataString(item, "repo");
		if (repo) {
			repoCounts.set(repo, (repoCounts.get(repo) ?? 0) + 1);
		}
	}

	let summary = pluralize(eventCount, "event");

	const typeSummary = formatTopCounts(typeCounts, 4);
	if (typeSummary) {
		summary += ` (${typeSummary})`;
	}

	if (repoCounts.size > 1) {
		summary += ` across ${pluralize(repoCounts.size, "repo")}`;
		const repoSummary = formatTopCounts(repoCounts, 2);
		if (repoSummary) {
			summary += ` (${repoSummary})`;
		}
	}

	return truncate(summary, 160);
}

function summarizeEditorOpens(
	items: WorkItem[],
	prefix: string,
): {
	openCount: number;
	workspaceCounts: Map<string, number>;
	extensions: Set<string>;
} {
	const workspaceCounts = new Map<string, number>();
	const extensions = new Set<string>();
	let openCount = 0;

	for (const item of items) {
		if (item.title.startsWith(prefix)) {
			openCount++;
			const match = /"([^"]+)"/.exec(item.title);
			const name = match?.[1]?.trim();
			if (name) {
				workspaceCounts.set(name, (workspaceCounts.get(name) ?? 0) + 1);
			}
		}

		const updatedExtensions = getMetadataStringArray(item, "extensions");
		if (updatedExtensions) {
			for (const ext of updatedExtensions) {
				extensions.add(ext);
			}
		}
	}

	return { openCount, workspaceCounts, extensions };
}

function summarizeVSCode(items: WorkItem[]): string {
	const { openCount, workspaceCounts, extensions } = summarizeEditorOpens(
		items,
		"VS Code: Opened workspace",
	);

	const parts: string[] = [];

	if (workspaceCounts.size > 0) {
		const topWorkspaces = topCounts(workspaceCounts, 2).map(([name]) => name);
		const workspacePart = `${pluralize(workspaceCounts.size, "workspace")}${
			topWorkspaces.length > 0 ? ` (${topWorkspaces.join(", ")})` : ""
		}`;
		parts.push(workspacePart);
	} else if (openCount > 0) {
		parts.push(pluralize(openCount, "open"));
	}

	if (extensions.size > 0) {
		const extList = Array.from(extensions).sort().slice(0, 2);
		const extPart = `${pluralize(extensions.size, "extension")} updated${
			extList.length > 0 ? ` (${extList.join(", ")})` : ""
		}`;
		parts.push(extPart);
	}

	if (parts.length === 0) {
		return pluralize(items.length, "item");
	}

	return truncate(parts.join(", "), 160);
}

function summarizeCursor(items: WorkItem[]): string {
	const { openCount, workspaceCounts } = summarizeEditorOpens(items, "Cursor: Opened workspace");

	if (workspaceCounts.size > 0) {
		const topWorkspaces = topCounts(workspaceCounts, 2).map(([name]) => name);
		const workspacePart = `${pluralize(workspaceCounts.size, "workspace")}${
			topWorkspaces.length > 0 ? ` (${topWorkspaces.join(", ")})` : ""
		}`;
		return truncate(workspacePart, 160);
	}

	if (openCount > 0) return pluralize(openCount, "open");
	return pluralize(items.length, "item");
}

function summarizeSingleSummaryItem(source: SourceType, items: WorkItem[]): string {
	if (items.length === 0) return pluralize(0, "item");

	if (items.length !== 1) {
		return pluralize(items.length, "item");
	}

	const item = items[0];
	if (!item) return pluralize(0, "item");
	let title = item.title;

	const prefix =
		source === "terminal" ? "Terminal:" : source === "filesystem" ? "File System:" : undefined;
	if (prefix && title.startsWith(prefix)) {
		title = title.slice(prefix.length).trim();
	}

	const desc = item.description?.trim();
	if (!desc) return truncate(title, 160);

	const normalizedDesc = desc.replace(/^(Top|Types):\s*/i, "").trim();
	return truncate(`${title} (${normalizedDesc})`, 160);
}

export function summarizeSourceItems(source: SourceType, items: WorkItem[]): string {
	switch (source) {
		case "git":
			return summarizeGit(items);
		case "github":
			return summarizeGitHub(items);
		case "vscode":
			return summarizeVSCode(items);
		case "cursor":
			return summarizeCursor(items);
		case "terminal":
		case "filesystem":
			return summarizeSingleSummaryItem(source, items);
		case "opencode":
			return summarizeSessionSource(items, "interaction", "messageCount");
		case "claude":
			return summarizeSessionSource(items, "interaction", "messageCount", "project");
		case "factory":
			return summarizeSessionSource(items, "interaction", "messageCount", "project");
		case "codex":
			return summarizeSessionSource(items, "prompt", "promptCount");
		default:
			return pluralize(items.length, "item");
	}
}
