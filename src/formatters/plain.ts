import { format } from "date-fns";
import type { WorkSummary } from "../types.ts";
import { formatDateRange } from "../utils/dates.ts";

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
		const sourceCounts = new Map<string, number>();
		for (const item of summary.items) {
			const count = sourceCounts.get(item.source) ?? 0;
			sourceCounts.set(item.source, count + 1);
		}

		for (const [source, count] of sourceCounts) {
			const sourceName = source.toUpperCase().padEnd(8);
			lines.push(`${sourceName} ${count} item${count !== 1 ? "s" : ""}`);
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
