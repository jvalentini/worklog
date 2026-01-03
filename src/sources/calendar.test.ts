import { describe, expect, test } from "bun:test";
import type { Config, DateRange } from "../types.ts";
import { createCalendarReader } from "./calendar.ts";

function mockFetch(content: string): typeof globalThis.fetch {
	const mockFn = async () => new Response(content, { status: 200 });
	// Add preconnect property to match Bun's fetch type
	const fn = mockFn as unknown as typeof globalThis.fetch & {
		preconnect: () => void;
	};
	fn.preconnect = () => {};
	return fn;
}

const sampleIcal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20260103T100000Z
DTEND:20260103T110000Z
SUMMARY:Team Standup
LOCATION:Zoom
ATTENDEE:mailto:alice@example.com
ATTENDEE:mailto:bob@example.com
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20260103T140000Z
DTEND:20260103T150000Z
SUMMARY:Code Review
DESCRIPTION:Review PR #123
END:VEVENT
BEGIN:VEVENT
UID:event3@example.com
DTSTART:20260104
DTEND:20260105
SUMMARY:Company Holiday
END:VEVENT
BEGIN:VEVENT
UID:event4@example.com
DTSTART:20260103T120000Z
DTEND:20260103T130000Z
SUMMARY:Focus Time - Deep Work
END:VEVENT
BEGIN:VEVENT
UID:event5@example.com
DTSTART:20260105T090000Z
DTEND:20260105T100000Z
SUMMARY:1:1 with Manager
ATTENDEE:mailto:manager@example.com
END:VEVENT
END:VCALENDAR`;

const baseConfig: Config = {
	defaultSources: ["calendar"],
	gitRepos: [],
	gitIdentityEmails: [],
	llm: { enabled: false, provider: "openai", model: "gpt-4o-mini" },
	paths: {
		opencode: "",
		claude: "",
		codex: "",
		factory: "",
		vscode: "",
		cursor: "",
		terminal: "",
		filesystem: "",
	},
	calendar: {
		excludePatterns: [],
		includePatterns: [],
	},
};

describe("calendarReader", () => {
	test("parses iCal events with attendees as meetings", async () => {
		// Mock fetch to return our sample iCal
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(sampleIcal);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-03T00:00:00Z"),
			end: new Date("2026-01-03T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: [],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		// Should find 3 events on Jan 3rd (standup, code review, focus time)
		expect(items.length).toBe(3);

		// Check Team Standup
		const standup = items.find((i) => i.title.includes("Team Standup"));
		expect(standup).toBeDefined();
		expect(standup?.metadata?.category).toBe("meeting");
		expect(standup?.metadata?.attendeeCount).toBe(2);
		expect(standup?.metadata?.durationMinutes).toBe(60);

		// Check Focus Time
		const focus = items.find((i) => i.title.includes("Focus Time"));
		expect(focus).toBeDefined();
		expect(focus?.metadata?.category).toBe("focus");
	});

	test("parses all-day events", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(sampleIcal);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-04T00:00:00Z"),
			end: new Date("2026-01-04T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: [],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		const holiday = items.find((i) => i.title.includes("Company Holiday"));
		expect(holiday).toBeDefined();
		expect(holiday?.metadata?.allDay).toBe(true);
	});

	test("applies exclude patterns", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(sampleIcal);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-03T00:00:00Z"),
			end: new Date("2026-01-03T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: ["standup"],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		// Standup should be excluded
		const standup = items.find((i) => i.title.includes("Team Standup"));
		expect(standup).toBeUndefined();
		expect(items.length).toBe(2);
	});

	test("applies include patterns", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(sampleIcal);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-03T00:00:00Z"),
			end: new Date("2026-01-03T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: [],
				includePatterns: ["standup", "review"],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		// Only standup and code review should be included
		expect(items.length).toBe(2);
		expect(items.some((i) => i.title.includes("Team Standup"))).toBe(true);
		expect(items.some((i) => i.title.includes("Code Review"))).toBe(true);
	});

	test("returns empty array when no calendar config", async () => {
		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-03T00:00:00Z"),
			end: new Date("2026-01-03T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				excludePatterns: [],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);
		expect(items).toEqual([]);
	});

	test("categorizes 1:1 meetings correctly", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(sampleIcal);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-05T00:00:00Z"),
			end: new Date("2026-01-05T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: [],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		const oneOnOne = items.find((i) => i.title.includes("1:1"));
		expect(oneOnOne).toBeDefined();
		expect(oneOnOne?.metadata?.category).toBe("meeting");
	});

	test("handles multiline descriptions with escapes", async () => {
		const icalWithEscapes = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:escaped@example.com
DTSTART:20260103T100000Z
DTEND:20260103T110000Z
SUMMARY:Meeting with notes
DESCRIPTION:Line 1\\nLine 2\\nLine 3\\, with comma
END:VEVENT
END:VCALENDAR`;

		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(icalWithEscapes);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-03T00:00:00Z"),
			end: new Date("2026-01-03T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: [],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		expect(items.length).toBe(1);
		expect(items[0]?.description).toContain("Line 1\nLine 2");
		expect(items[0]?.description).toContain("Line 3, with comma");
	});

	test("handles folded lines in iCal", async () => {
		const icalWithFolding = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:folded@example.com
DTSTART:20260103T100000Z
DTEND:20260103T110000Z
SUMMARY:This is a very long summary that continues on
 the next line due to line folding
END:VEVENT
END:VCALENDAR`;

		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch(icalWithFolding);

		const reader = createCalendarReader();
		const dateRange: DateRange = {
			start: new Date("2026-01-03T00:00:00Z"),
			end: new Date("2026-01-03T23:59:59Z"),
		};

		const config: Config = {
			...baseConfig,
			calendar: {
				icalUrl: "https://example.com/calendar.ics",
				excludePatterns: [],
				includePatterns: [],
			},
		};

		const items = await reader.read(dateRange, config);

		globalThis.fetch = originalFetch;

		expect(items.length).toBe(1);
		expect(items[0]?.title).toContain("very long summary");
		expect(items[0]?.title).toContain("line folding");
	});
});
