/**
 * Ticket extraction utility for correlating commits with external issue trackers.
 *
 * Supports common ticket patterns:
 * - Jira: PROJ-123, ABC-1, MYPROJECT-99999
 * - Linear: ABC-123, TEAM-456
 * - GitHub Issues: #123, org/repo#456
 * - Shortcut (formerly Clubhouse): sc-12345, [sc-12345]
 * - Azure DevOps: AB#123
 * - Asana: Asana-123 or references in URLs
 */

export interface TicketReference {
	/** The raw ticket ID as found in the text (e.g., "PROJ-123") */
	id: string;
	/** The detected tracker type */
	type: TicketTrackerType;
	/** The project/prefix portion (e.g., "PROJ" from "PROJ-123") */
	project?: string;
	/** The numeric portion (e.g., 123 from "PROJ-123") */
	number?: number;
	/** Optional URL if we can construct one */
	url?: string;
}

export type TicketTrackerType =
	| "jira"
	| "linear"
	| "github"
	| "shortcut"
	| "azure-devops"
	| "asana"
	| "unknown";

/**
 * Common patterns for ticket references in commit messages.
 *
 * Order matters - more specific patterns should come first to avoid
 * false positives from more generic patterns.
 */
const TICKET_PATTERNS: Array<{
	type: TicketTrackerType;
	pattern: RegExp;
	extract: (match: RegExpMatchArray) => Omit<TicketReference, "type">;
}> = [
	// Shortcut (formerly Clubhouse): sc-12345 or [sc-12345]
	{
		type: "shortcut",
		pattern: /\[?sc-(\d+)\]?/gi,
		extract: (match) => ({
			id: `sc-${match[1]}`,
			number: Number.parseInt(match[1] ?? "0", 10),
		}),
	},
	// Azure DevOps: AB#123
	{
		type: "azure-devops",
		pattern: /\bAB#(\d+)\b/gi,
		extract: (match) => ({
			id: `AB#${match[1]}`,
			number: Number.parseInt(match[1] ?? "0", 10),
		}),
	},
	// GitHub Issues with repo: org/repo#123
	{
		type: "github",
		pattern: /\b([\w.-]+\/[\w.-]+)#(\d+)\b/g,
		extract: (match) => ({
			id: `${match[1]}#${match[2]}`,
			project: match[1],
			number: Number.parseInt(match[2] ?? "0", 10),
			url: `https://github.com/${match[1]}/issues/${match[2]}`,
		}),
	},
	// GitHub Issues (local repo): #123
	// Only match if preceded by whitespace/start or certain punctuation to avoid false positives
	{
		type: "github",
		pattern: /(?:^|[\s([\]])#(\d+)\b/g,
		extract: (match) => ({
			id: `#${match[1]}`,
			number: Number.parseInt(match[1] ?? "0", 10),
		}),
	},
	// Jira/Linear style: PROJ-123, ABC-1
	// Must be 2+ uppercase letters followed by hyphen and 1+ digits
	{
		type: "jira", // Could also be Linear - they use the same format
		pattern: /\b([A-Z][A-Z0-9]+-\d+)\b/g,
		extract: (match) => {
			const fullId = match[1] ?? "";
			const [project, numStr] = fullId.split("-");
			return {
				id: fullId,
				project: project,
				number: Number.parseInt(numStr ?? "0", 10),
			};
		},
	},
	// Asana task references (less common in commit messages)
	{
		type: "asana",
		pattern: /\bAsana[:\s-]?(\d+)\b/gi,
		extract: (match) => ({
			id: `Asana-${match[1]}`,
			number: Number.parseInt(match[1] ?? "0", 10),
		}),
	},
];

/**
 * Extract all ticket references from a commit message or text.
 *
 * @param text - The commit subject/body or other text to scan
 * @returns Array of ticket references found, deduplicated by ID
 */
export function extractTickets(text: string): TicketReference[] {
	const tickets: TicketReference[] = [];
	const seenIds = new Set<string>();

	for (const { type, pattern, extract } of TICKET_PATTERNS) {
		// Reset regex state for global patterns
		pattern.lastIndex = 0;

		let match = pattern.exec(text);
		while (match !== null) {
			const extracted = extract(match);

			// Normalize ID for deduplication
			const normalizedId = extracted.id.toUpperCase();
			if (!seenIds.has(normalizedId)) {
				seenIds.add(normalizedId);
				tickets.push({
					...extracted,
					type,
				});
			}

			match = pattern.exec(text);
		}
	}

	return tickets;
}

/**
 * Extract tickets from both commit subject and body.
 * Subject tickets are typically more authoritative.
 *
 * @param subject - The commit subject line
 * @param body - The commit body (optional)
 * @returns Array of ticket references, subject tickets first
 */
export function extractTicketsFromCommit(subject: string, body?: string): TicketReference[] {
	const subjectTickets = extractTickets(subject);
	const bodyTickets = body ? extractTickets(body) : [];

	// Merge, preferring subject tickets and deduplicating
	const seenIds = new Set(subjectTickets.map((t) => t.id.toUpperCase()));
	const merged = [...subjectTickets];

	for (const ticket of bodyTickets) {
		if (!seenIds.has(ticket.id.toUpperCase())) {
			seenIds.add(ticket.id.toUpperCase());
			merged.push(ticket);
		}
	}

	return merged;
}

/**
 * Format ticket references for display.
 *
 * @param tickets - Array of ticket references
 * @param style - Output style: "compact" (IDs only), "links" (with URLs if available)
 * @returns Formatted string
 */
export function formatTickets(
	tickets: TicketReference[],
	style: "compact" | "links" = "compact",
): string {
	if (tickets.length === 0) {
		return "";
	}

	if (style === "compact") {
		return tickets.map((t) => t.id).join(", ");
	}

	// "links" style - include URLs where available
	return tickets
		.map((t) => {
			if (t.url) {
				return `[${t.id}](${t.url})`;
			}
			return t.id;
		})
		.join(", ");
}

/**
 * Group tickets by tracker type.
 *
 * @param tickets - Array of ticket references
 * @returns Map of tracker type to tickets
 */
export function groupTicketsByTracker(
	tickets: TicketReference[],
): Map<TicketTrackerType, TicketReference[]> {
	const groups = new Map<TicketTrackerType, TicketReference[]>();

	for (const ticket of tickets) {
		const existing = groups.get(ticket.type) ?? [];
		existing.push(ticket);
		groups.set(ticket.type, existing);
	}

	return groups;
}

/**
 * Check if a commit message contains any ticket references.
 *
 * @param text - The text to check
 * @returns True if at least one ticket reference was found
 */
export function hasTicketReferences(text: string): boolean {
	for (const { pattern } of TICKET_PATTERNS) {
		pattern.lastIndex = 0;
		if (pattern.test(text)) {
			return true;
		}
	}
	return false;
}
