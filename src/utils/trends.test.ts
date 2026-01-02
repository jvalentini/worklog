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

	test("handles very large percentage changes", () => {
		const range: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(range);

		const currentItems = Array.from({ length: 100 }, () => createItem("git"));
		const previousItems = [createItem("git")];

		const current = createSummary(range, currentItems);
		const previous = createSummary(previousRange, previousItems);

		const output = formatTrendSummary(calculateTrends(current, previous));

		expect(output).toContain("Overall: 9900.0% up (100 vs 1)");
		expect(output).toContain("git: 9900.0% up (100 vs 1)");
	});

	test("shows down direction for negative changes", () => {
		const range: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(range);

		const current = createSummary(range, [createItem("git")]);
		const previous = createSummary(previousRange, [
			createItem("git"),
			createItem("git"),
			createItem("git"),
		]);

		const output = formatTrendSummary(calculateTrends(current, previous));

		expect(output).toContain("Overall: 66.7% down (1 vs 3)");
		expect(output).toContain("git: 66.7% down (1 vs 3)");
	});

	test("sorts sources by absolute change magnitude", () => {
		const range: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(range);

		const currentItems = [
			...Array.from({ length: 10 }, () => createItem("git")),
			...Array.from({ length: 5 }, () => createItem("github")),
			createItem("opencode"),
		];
		const previousItems = [
			createItem("git"),
			...Array.from({ length: 3 }, () => createItem("github")),
		];

		const current = createSummary(range, currentItems);
		const previous = createSummary(previousRange, previousItems);

		const output = formatTrendSummary(calculateTrends(current, previous));
		const lines = output.split("\n");

		// Find the "By Source:" section
		const bySourceIndex = lines.indexOf("By Source:");

		// git should come first (change: +9) then github (change: +2) then opencode (change: +1)
		const gitLineIndex = lines.findIndex((line) => line.includes("git:"));
		const githubLineIndex = lines.findIndex((line) => line.includes("github:"));
		const opencodeLineIndex = lines.findIndex((line) => line.includes("opencode:"));

		expect(gitLineIndex).toBeGreaterThan(bySourceIndex);
		expect(githubLineIndex).toBeGreaterThan(gitLineIndex);
		expect(opencodeLineIndex).toBeGreaterThan(githubLineIndex);
	});
});

describe("getPreviousDateRange - edge cases", () => {
	test("handles one hour duration", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T10:00:00.000Z"),
			end: new Date("2025-01-02T11:00:00.000Z"),
		};

		const previousRange = getPreviousDateRange(currentRange);

		expect(previousRange.end.getTime()).toBe(currentRange.start.getTime() - 1);
		const durationCurrent = currentRange.end.getTime() - currentRange.start.getTime();
		const durationPrevious = previousRange.end.getTime() - previousRange.start.getTime();
		expect(durationPrevious).toBe(durationCurrent);
	});

	test("handles one week duration", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-06T00:00:00.000Z"),
			end: new Date("2025-01-13T00:00:00.000Z"),
		};

		const previousRange = getPreviousDateRange(currentRange);

		expect(previousRange.end.getTime()).toBe(currentRange.start.getTime() - 1);
		const durationCurrent = currentRange.end.getTime() - currentRange.start.getTime();
		const durationPrevious = previousRange.end.getTime() - previousRange.start.getTime();
		expect(durationPrevious).toBe(durationCurrent);
		expect(previousRange.start.getTime()).toBe(new Date("2024-12-29T23:59:59.999Z").getTime());
	});

	test("handles one millisecond duration", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T12:00:00.000Z"),
			end: new Date("2025-01-02T12:00:00.001Z"),
		};

		const previousRange = getPreviousDateRange(currentRange);

		expect(previousRange.end.getTime()).toBe(currentRange.start.getTime() - 1);
		const durationCurrent = currentRange.end.getTime() - currentRange.start.getTime();
		const durationPrevious = previousRange.end.getTime() - previousRange.start.getTime();
		expect(durationPrevious).toBe(durationCurrent);
	});
});

describe("calculateTrends - edge cases", () => {
	test("handles empty current period", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const current = createSummary(currentRange, []);
		const previous = createSummary(previousRange, [createItem("git"), createItem("github")]);

		const trendData = calculateTrends(current, previous);

		expect(trendData.currentPeriod.totalItems).toBe(0);
		expect(trendData.previousPeriod.totalItems).toBe(2);
		expect(trendData.trends.totalChange).toBe(-2);
		expect(trendData.trends.totalChangePercent).toBe(-100);

		expect(trendData.trends.sourceChanges.git).toEqual({ change: -1, changePercent: -100 });
		expect(trendData.trends.sourceChanges.github).toEqual({ change: -1, changePercent: -100 });
	});

	test("handles empty both periods", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const current = createSummary(currentRange, []);
		const previous = createSummary(previousRange, []);

		const trendData = calculateTrends(current, previous);

		expect(trendData.currentPeriod.totalItems).toBe(0);
		expect(trendData.previousPeriod.totalItems).toBe(0);
		expect(trendData.trends.totalChange).toBe(0);
		expect(trendData.trends.totalChangePercent).toBe(null);

		expect(Object.keys(trendData.trends.sourceChanges)).toHaveLength(0);
	});

	test("handles single source dominance", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const currentItems = Array.from({ length: 20 }, () => createItem("git"));
		const previousItems = Array.from({ length: 10 }, () => createItem("git"));

		const current = createSummary(currentRange, currentItems);
		const previous = createSummary(previousRange, previousItems);

		const trendData = calculateTrends(current, previous);

		expect(trendData.currentPeriod.totalItems).toBe(20);
		expect(trendData.previousPeriod.totalItems).toBe(10);
		expect(trendData.trends.totalChange).toBe(10);
		expect(trendData.trends.totalChangePercent).toBe(100);

		expect(Object.keys(trendData.trends.sourceChanges)).toHaveLength(1);
		expect(trendData.trends.sourceChanges.git).toEqual({ change: 10, changePercent: 100 });
	});

	test("handles many different sources", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const sources: SourceType[] = ["git", "github", "opencode", "claude", "codex"];
		const currentItems = sources.flatMap((source) => [createItem(source), createItem(source)]);
		const previousItems = sources.map((source) => createItem(source));

		const current = createSummary(currentRange, currentItems);
		const previous = createSummary(previousRange, previousItems);

		const trendData = calculateTrends(current, previous);

		expect(trendData.currentPeriod.totalItems).toBe(10);
		expect(trendData.previousPeriod.totalItems).toBe(5);
		expect(trendData.trends.totalChange).toBe(5);
		expect(trendData.trends.totalChangePercent).toBe(100);

		expect(Object.keys(trendData.trends.sourceChanges)).toHaveLength(5);
		for (const source of sources) {
			expect(trendData.trends.sourceChanges[source]).toEqual({ change: 1, changePercent: 100 });
		}
	});

	test("handles new sources appearing in current period", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const current = createSummary(currentRange, [createItem("git"), createItem("github")]);
		const previous = createSummary(previousRange, [createItem("git")]);

		const trendData = calculateTrends(current, previous);
		const { sourceChanges } = trendData.trends;

		expect(sourceChanges.git).toBeDefined();
		expect(sourceChanges.github).toBeDefined();

		if (sourceChanges.git && sourceChanges.github) {
			expect(sourceChanges.git).toEqual({ change: 0, changePercent: 0 });
			expect(sourceChanges.github).toEqual({ change: 1, changePercent: null });
		}
	});

	test("calculates correct percentages for fractional changes", () => {
		const currentRange: DateRange = {
			start: new Date("2025-01-02T00:00:00.000Z"),
			end: new Date("2025-01-02T23:59:59.999Z"),
		};
		const previousRange = getPreviousDateRange(currentRange);

		const currentItems = Array.from({ length: 7 }, () => createItem("git"));
		const previousItems = Array.from({ length: 3 }, () => createItem("git"));

		const current = createSummary(currentRange, currentItems);
		const previous = createSummary(previousRange, previousItems);

		const trendData = calculateTrends(current, previous);

		// (7 - 3) / 3 * 100 = 133.333...
		expect(trendData.trends.totalChangePercent).toBeCloseTo(133.33333333333334, 5);

		const gitChange = trendData.trends.sourceChanges.git;
		expect(gitChange).toBeDefined();
		if (gitChange?.changePercent !== null && gitChange?.changePercent !== undefined) {
			expect(gitChange.changePercent).toBeCloseTo(133.33333333333334, 5);
		}
	});
});
