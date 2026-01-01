import { format } from "date-fns";
import type { SourceType, WorkItem, WorkSummary } from "../types.ts";
import { formatDateRange } from "../utils/dates.ts";
import { summarizeSourceItems } from "./summary.ts";

export function formatPlain(summary: WorkSummary, verbose = false): string {
	const lines: string[] = [];

	lines.push(`Worklog: ${formatDateRange(summary.dateRange)}`);
	lines.push("=".repeat(50));
	lines.push("");

	if (summary.llmSummary) {
		lines.push("Summary:");
		lines.push(summary.llmSummary);
		lines.push("");
	}

	if (summary.items.length === 0) {
		lines.push("No activity recorded for this period.");
		return lines.join("\n");
	}

	if (!verbose) {
		const grouped = new Map<SourceType, WorkItem[]>();
		for (const item of summary.items) {
			const existing = grouped.get(item.source) ?? [];
			existing.push(item);
			grouped.set(item.source, existing);
		}

		for (const [source, items] of grouped) {
			const sourceName = source.toUpperCase().padEnd(10);
			lines.push(`${sourceName} ${summarizeSourceItems(source, items)}`);
		}
	} else {
		for (const item of summary.items) {
			const time = format(item.timestamp, "HH:mm");
			const source = item.source.toUpperCase().padEnd(8);
			lines.push(`[${time}] ${source} ${item.title}`);
			if (item.description) {
				lines.push(`         ${" ".repeat(8)} ${item.description}`);
			}
		}
	}

	return lines.join("\n");
}
