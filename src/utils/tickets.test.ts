import { describe, expect, test } from "bun:test";
import {
	extractTickets,
	extractTicketsFromCommit,
	formatTickets,
	groupTicketsByTracker,
	hasTicketReferences,
	type TicketReference,
} from "./tickets.ts";

describe("extractTickets", () => {
	test("extracts Jira-style tickets", () => {
		const tickets = extractTickets("feat: add login page PROJ-123");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "PROJ-123",
			type: "jira",
			project: "PROJ",
			number: 123,
		});
	});

	test("extracts multiple Jira tickets", () => {
		const tickets = extractTickets("fix: resolve PROJ-123 and PROJ-456");
		expect(tickets).toHaveLength(2);
		expect(tickets.map((t) => t.id)).toEqual(["PROJ-123", "PROJ-456"]);
	});

	test("extracts tickets with numeric project prefixes", () => {
		const tickets = extractTickets("ABC2-789 support");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "ABC2-789",
			project: "ABC2",
			number: 789,
		});
	});

	test("extracts Linear-style tickets (same format as Jira)", () => {
		const tickets = extractTickets("TEAM-42: implement feature");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "TEAM-42",
			type: "jira", // We treat Linear same as Jira since format is identical
			project: "TEAM",
			number: 42,
		});
	});

	test("extracts GitHub issue references with repo", () => {
		const tickets = extractTickets("fix: closes anthropics/claude-code#123");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "anthropics/claude-code#123",
			type: "github",
			project: "anthropics/claude-code",
			number: 123,
			url: "https://github.com/anthropics/claude-code/issues/123",
		});
	});

	test("extracts simple GitHub issue references", () => {
		const tickets = extractTickets("fix: closes #42");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "#42",
			type: "github",
			number: 42,
		});
	});

	test("extracts GitHub issues in parentheses", () => {
		const tickets = extractTickets("fix: bug (#99)");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]?.id).toBe("#99");
	});

	test("extracts Shortcut ticket references", () => {
		const tickets = extractTickets("feat: new feature [sc-12345]");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "sc-12345",
			type: "shortcut",
			number: 12345,
		});
	});

	test("extracts Shortcut without brackets", () => {
		const tickets = extractTickets("sc-999 fix");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]?.id).toBe("sc-999");
	});

	test("extracts Azure DevOps work items", () => {
		const tickets = extractTickets("fix: AB#456 - resolve issue");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "AB#456",
			type: "azure-devops",
			number: 456,
		});
	});

	test("extracts Asana references", () => {
		const tickets = extractTickets("docs: update readme Asana-789");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]).toMatchObject({
			id: "Asana-789",
			type: "asana",
			number: 789,
		});
	});

	test("deduplicates identical tickets", () => {
		const tickets = extractTickets("PROJ-123: fix for PROJ-123");
		expect(tickets).toHaveLength(1);
	});

	test("deduplicates case-insensitively", () => {
		const tickets = extractTickets("proj-123 and PROJ-123");
		expect(tickets).toHaveLength(1);
	});

	test("extracts multiple ticket types", () => {
		const tickets = extractTickets("PROJ-123 closes #42 sc-999");
		expect(tickets).toHaveLength(3);
		expect(tickets.map((t) => t.type)).toContain("jira");
		expect(tickets.map((t) => t.type)).toContain("github");
		expect(tickets.map((t) => t.type)).toContain("shortcut");
	});

	test("returns empty array for no tickets", () => {
		const tickets = extractTickets("feat: add new feature");
		expect(tickets).toHaveLength(0);
	});

	test("does not match false positives", () => {
		// Version numbers
		const v = extractTickets("v1.2.3");
		expect(v).toHaveLength(0);

		// Standalone hashes without # prefix
		const hash = extractTickets("commit abc123");
		expect(hash).toHaveLength(0);

		// Single letter prefixes (must be 2+)
		const single = extractTickets("A-123");
		expect(single).toHaveLength(0);
	});
});

describe("extractTicketsFromCommit", () => {
	test("extracts from subject only", () => {
		const tickets = extractTicketsFromCommit("PROJ-123: fix bug");
		expect(tickets).toHaveLength(1);
		expect(tickets[0]?.id).toBe("PROJ-123");
	});

	test("extracts from subject and body", () => {
		const tickets = extractTicketsFromCommit(
			"fix: bug",
			"Fixes PROJ-456\n\nAlso relates to TEAM-789",
		);
		expect(tickets).toHaveLength(2);
		expect(tickets.map((t) => t.id)).toContain("PROJ-456");
		expect(tickets.map((t) => t.id)).toContain("TEAM-789");
	});

	test("deduplicates between subject and body", () => {
		const tickets = extractTicketsFromCommit("PROJ-123: fix", "Details for PROJ-123");
		expect(tickets).toHaveLength(1);
	});

	test("subject tickets come first", () => {
		const tickets = extractTicketsFromCommit("PROJ-111: fix", "Also PROJ-222");
		expect(tickets[0]?.id).toBe("PROJ-111");
		expect(tickets[1]?.id).toBe("PROJ-222");
	});
});

describe("formatTickets", () => {
	const tickets: TicketReference[] = [
		{ id: "PROJ-123", type: "jira", project: "PROJ", number: 123 },
		{
			id: "anthropics/claude#42",
			type: "github",
			project: "anthropics/claude",
			number: 42,
			url: "https://github.com/anthropics/claude/issues/42",
		},
	];

	test("formats compact style", () => {
		const result = formatTickets(tickets, "compact");
		expect(result).toBe("PROJ-123, anthropics/claude#42");
	});

	test("formats links style with URLs", () => {
		const result = formatTickets(tickets, "links");
		expect(result).toBe(
			"PROJ-123, [anthropics/claude#42](https://github.com/anthropics/claude/issues/42)",
		);
	});

	test("returns empty string for no tickets", () => {
		expect(formatTickets([])).toBe("");
	});
});

describe("groupTicketsByTracker", () => {
	test("groups tickets by type", () => {
		const tickets: TicketReference[] = [
			{ id: "PROJ-1", type: "jira", project: "PROJ", number: 1 },
			{ id: "PROJ-2", type: "jira", project: "PROJ", number: 2 },
			{ id: "#42", type: "github", number: 42 },
		];

		const groups = groupTicketsByTracker(tickets);
		expect(groups.size).toBe(2);
		expect(groups.get("jira")).toHaveLength(2);
		expect(groups.get("github")).toHaveLength(1);
	});

	test("returns empty map for no tickets", () => {
		const groups = groupTicketsByTracker([]);
		expect(groups.size).toBe(0);
	});
});

describe("hasTicketReferences", () => {
	test("returns true when tickets present", () => {
		expect(hasTicketReferences("PROJ-123")).toBe(true);
		expect(hasTicketReferences("fixes #42")).toBe(true);
	});

	test("returns false when no tickets", () => {
		expect(hasTicketReferences("feat: new feature")).toBe(false);
		expect(hasTicketReferences("")).toBe(false);
	});
});
