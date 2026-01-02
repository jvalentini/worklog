import { describe, expect, test } from "bun:test";
import type { DateRange, SourceType, WorkItem, WorkSummary } from "../types.ts";
import { calculateTrends, formatTrendSummary, getPreviousDateRange } from "./trends.ts";

function createSummary(dateRange: DateRange, items: WorkItem[]): WorkSummary {
	const sources = [...new Set(items.map((item) => item.source))] as SourceType[];
	return {
		dateRange,
		items,
		sources,
		generatedAt: new Date("2025-01-03T12:00:00.000Z"),
	};
}

function createItem(source: SourceType): WorkItem {
	return {
		source,
		timestamp: new Date("2025-01-03T10:00:00.000Z"),
		title: `${source} item`,
	};
}

describe("getPreviousDateRange", () => {
	test("returns a range of equal duration ending 1ms before current start", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};

		const previousRange = getPreviousDateRange(currentRange);

		expect(previousRange.end.getTime()).toBe(currentRange.start.getTime() - 1);
		expect(previousRange.start.getTime()).toBe(new Date("2025-01-01T00:00:00.000Z").getTime());
		expect(previousRange.end.getTime()).toBe(new Date("2025-01-01T23:59:59.999Z").getTime());
	});
});

describe("calculateTrends", () => {
	test("computes totals and per-source changes (including sources only in previous)", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const currentItems = [
			createItem("git"),
			createItem("git"),
			createItem("git"),
			createItem("git"),
			createItem("git"),
			createItem("opencode"),
		];
		const previousItems = [
			createItem("git"),
			createItem("git"),
			createItem("github"),
			createItem("github"),
		];

		const trendData = calculateTrends(
			createSummary(currentRange, currentItems),
			createSummary(previousRange, previousItems),
		);

		expect(trendData.currentPeriod.totalItems).toBe(6);
		expect(trendData.previousPeriod.totalItems).toBe(4);
		expect(trendData.trends.totalChange).toBe(2);
		expect(trendData.trends.totalChangePercent).toBe(50);

		expect(trendData.trends.sourceChanges.git).toEqual({ change: 3, changePercent: 150 });
		expect(trendData.trends.sourceChanges.github).toEqual({ change: -2, changePercent: -100 });
		expect(trendData.trends.sourceChanges.opencode).toEqual({ change: 1, changePercent: null });
	});
});

describe("formatTrendSummary", () => {
	test("formats overall and per-source lines, filtering zero-change sources", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const trendData = calculateTrends(
			createSummary(currentRange, [
				createItem("git"),
				createItem("git"),
				createItem("git"),
				createItem("git"),
				createItem("git"),
				createItem("opencode"),
			]),
			createSummary(previousRange, [
				createItem("git"),
				createItem("git"),
				createItem("github"),
				createItem("github"),
				createItem("opencode"),
			]),
		);

		const output = formatTrendSummary(trendData);

		expect(output).toContain("## Activity Trends");
		expect(output).toContain("Overall: 20.0% up (6 vs 5)");
		expect(output).toContain("By Source:");

		expect(output).toContain("git: 150.0% up (5 vs 2)");
		expect(output).toContain("github: 100.0% down (0 vs 2)");
		expect(output).not.toContain("opencode:");
	});

	test("prints a fallback line when there are no source-level changes", () => {
		const range: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(range);

		const current = createSummary(range, [createItem("git"), createItem("opencode")]);
		const previous = createSummary(previousRange, [createItem("git"), createItem("opencode")]);

		const output = formatTrendSummary(calculateTrends(current, previous));

		expect(output).toContain("Overall: 0.0% stable (2 vs 2)");
		expect(output).toContain("No source-level changes detected.");
	});

	test("uses n/a when previous total is zero", () => {
		const range: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(range);

		const current = createSummary(range, [createItem("git")]);
		const previous = createSummary(previousRange, []);

		const output = formatTrendSummary(calculateTrends(current, previous));

		expect(output).toContain("Overall: n/a up (1 vs 0)");
	});
});
