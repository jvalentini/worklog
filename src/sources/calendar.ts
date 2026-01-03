import { readFile } from "node:fs/promises";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";
import { expandPath } from "../utils/config.ts";

interface CalendarEvent {
	uid: string;
	summary: string;
	description?: string;
	location?: string;
	start: Date;
	end: Date;
	allDay: boolean;
	organizer?: string;
	attendees: string[];
}

function parseICalDate(value: string, _params?: string): Date {
	// Handle TZID parameter
	const isAllDay = !value.includes("T");

	if (isAllDay) {
		// YYYYMMDD format
		const year = Number.parseInt(value.slice(0, 4), 10);
		const month = Number.parseInt(value.slice(4, 6), 10) - 1;
		const day = Number.parseInt(value.slice(6, 8), 10);
		return new Date(year, month, day);
	}

	// YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ format
	const year = Number.parseInt(value.slice(0, 4), 10);
	const month = Number.parseInt(value.slice(4, 6), 10) - 1;
	const day = Number.parseInt(value.slice(6, 8), 10);
	const hour = Number.parseInt(value.slice(9, 11), 10);
	const minute = Number.parseInt(value.slice(11, 13), 10);
	const second = Number.parseInt(value.slice(13, 15), 10) || 0;

	if (value.endsWith("Z")) {
		return new Date(Date.UTC(year, month, day, hour, minute, second));
	}

	return new Date(year, month, day, hour, minute, second);
}

function unescapeICalValue(value: string): string {
	return value
		.replace(/\\n/g, "\n")
		.replace(/\\,/g, ",")
		.replace(/\\;/g, ";")
		.replace(/\\\\/g, "\\");
}

function parseICalContent(content: string): CalendarEvent[] {
	const events: CalendarEvent[] = [];
	const lines: string[] = [];

	// Unfold lines (lines starting with space/tab are continuations)
	for (const rawLine of content.split(/\r?\n/)) {
		if (rawLine.startsWith(" ") || rawLine.startsWith("\t")) {
			const last = lines.pop();
			if (last) {
				lines.push(last + rawLine.slice(1));
			}
		} else {
			lines.push(rawLine);
		}
	}

	let currentEvent: Partial<CalendarEvent> | null = null;
	let inEvent = false;

	for (const line of lines) {
		if (line === "BEGIN:VEVENT") {
			inEvent = true;
			currentEvent = {
				attendees: [],
				allDay: false,
			};
			continue;
		}

		if (line === "END:VEVENT" && currentEvent) {
			if (currentEvent.uid && currentEvent.summary && currentEvent.start && currentEvent.end) {
				events.push(currentEvent as CalendarEvent);
			}
			currentEvent = null;
			inEvent = false;
			continue;
		}

		if (!inEvent || !currentEvent) continue;

		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) continue;

		const propertyPart = line.slice(0, colonIndex);
		const value = unescapeICalValue(line.slice(colonIndex + 1));

		// Parse property name and parameters
		const semicolonIndex = propertyPart.indexOf(";");
		const propertyName =
			semicolonIndex === -1 ? propertyPart : propertyPart.slice(0, semicolonIndex);
		const params = semicolonIndex === -1 ? undefined : propertyPart.slice(semicolonIndex + 1);

		switch (propertyName) {
			case "UID":
				currentEvent.uid = value;
				break;
			case "SUMMARY":
				currentEvent.summary = value;
				break;
			case "DESCRIPTION":
				currentEvent.description = value;
				break;
			case "LOCATION":
				currentEvent.location = value;
				break;
			case "DTSTART":
				currentEvent.start = parseICalDate(value, params);
				currentEvent.allDay = !value.includes("T");
				break;
			case "DTEND":
				currentEvent.end = parseICalDate(value, params);
				break;
			case "ORGANIZER":
				currentEvent.organizer = value.replace(/^mailto:/i, "");
				break;
			case "ATTENDEE":
				currentEvent.attendees?.push(value.replace(/^mailto:/i, ""));
				break;
		}
	}

	return events;
}

function getDurationMinutes(event: CalendarEvent): number {
	return Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60));
}

function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}m`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours}h`;
	}
	return `${hours}h ${remainingMinutes}m`;
}

function matchesPattern(text: string, patterns: string[]): boolean {
	if (patterns.length === 0) return false;
	const lowerText = text.toLowerCase();
	return patterns.some((pattern) => {
		const lowerPattern = pattern.toLowerCase();
		if (pattern.startsWith("/") && pattern.endsWith("/")) {
			try {
				const regex = new RegExp(pattern.slice(1, -1), "i");
				return regex.test(text);
			} catch {
				return false;
			}
		}
		return lowerText.includes(lowerPattern);
	});
}

function categorizeMeeting(event: CalendarEvent): "meeting" | "focus" | "personal" | "other" {
	const summary = event.summary.toLowerCase();
	const hasAttendees = event.attendees.length > 0;

	// Meeting indicators
	const meetingKeywords = [
		"meeting",
		"sync",
		"standup",
		"stand-up",
		"1:1",
		"1-1",
		"review",
		"interview",
		"call",
		"chat",
		"discussion",
		"planning",
		"retro",
		"retrospective",
		"demo",
		"presentation",
	];
	if (hasAttendees || meetingKeywords.some((kw) => summary.includes(kw))) {
		return "meeting";
	}

	// Focus time indicators
	const focusKeywords = [
		"focus",
		"deep work",
		"coding",
		"development",
		"heads down",
		"no meetings",
	];
	if (focusKeywords.some((kw) => summary.includes(kw))) {
		return "focus";
	}

	// Personal time indicators
	const personalKeywords = [
		"lunch",
		"break",
		"personal",
		"doctor",
		"dentist",
		"appointment",
		"errand",
	];
	if (personalKeywords.some((kw) => summary.includes(kw))) {
		return "personal";
	}

	return "other";
}

async function fetchICalFromUrl(url: string): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
	}
	return response.text();
}

async function readICalFromFile(path: string): Promise<string> {
	const expandedPath = expandPath(path);
	return readFile(expandedPath, "utf-8");
}

export function createCalendarReader(): SourceReader {
	return {
		name: "calendar",
		async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
			const calendarConfig = config.calendar;
			const icalPath = calendarConfig?.icalPath ?? config.paths?.calendar;
			const icalUrl = calendarConfig?.icalUrl;

			if (!icalPath && !icalUrl) {
				return [];
			}

			let content: string;
			try {
				if (icalUrl) {
					content = await fetchICalFromUrl(icalUrl);
				} else if (icalPath) {
					content = await readICalFromFile(icalPath);
				} else {
					return [];
				}
			} catch {
				return [];
			}

			const events = parseICalContent(content);
			const excludePatterns = calendarConfig?.excludePatterns ?? [];
			const includePatterns = calendarConfig?.includePatterns ?? [];

			const items: WorkItem[] = [];

			for (const event of events) {
				// Check if event overlaps with date range
				if (event.end < dateRange.start || event.start > dateRange.end) {
					continue;
				}

				// Apply include/exclude filters
				if (excludePatterns.length > 0 && matchesPattern(event.summary, excludePatterns)) {
					continue;
				}
				if (includePatterns.length > 0 && !matchesPattern(event.summary, includePatterns)) {
					continue;
				}

				const duration = getDurationMinutes(event);
				const category = categorizeMeeting(event);
				const attendeeCount = event.attendees.length;

				let title = `[Calendar] ${event.summary}`;
				if (!event.allDay) {
					title += ` (${formatDuration(duration)})`;
				}

				const descriptionParts: string[] = [];
				if (event.location) {
					descriptionParts.push(`Location: ${event.location}`);
				}
				if (attendeeCount > 0) {
					descriptionParts.push(`${attendeeCount} attendee${attendeeCount !== 1 ? "s" : ""}`);
				}
				if (event.description) {
					const shortDesc = event.description.slice(0, 200);
					descriptionParts.push(shortDesc + (event.description.length > 200 ? "..." : ""));
				}

				items.push({
					source: "calendar",
					timestamp: event.start,
					title,
					description: descriptionParts.length > 0 ? descriptionParts.join(" | ") : undefined,
					metadata: {
						uid: event.uid,
						summary: event.summary,
						category,
						durationMinutes: duration,
						allDay: event.allDay,
						location: event.location,
						organizer: event.organizer,
						attendeeCount,
						startTime: event.start.toISOString(),
						endTime: event.end.toISOString(),
					},
				});
			}

			// Sort by start time
			items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

			return items;
		},
	};
}

export const calendarReader = createCalendarReader();
