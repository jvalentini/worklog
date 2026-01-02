/**
 * Extracts a short standup-friendly summary from a PR description/body.
 *
 * @param body - The PR description/body text
 * @returns A 1-2 sentence summary, or null if no meaningful content exists
 */
export function extractPrSummary(body: string): string | null {
	if (!body || typeof body !== "string") {
		return null;
	}

	const cleanedBody = cleanTemplateNoise(body);
	if (!cleanedBody) {
		return null;
	}

	const headingSummary = extractFromHeadings(cleanedBody);
	if (headingSummary) {
		return headingSummary;
	}

	return extractFirstMeaningfulParagraph(cleanedBody);
}

function cleanTemplateNoise(body: string): string {
	let cleaned = body;

	cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
	cleaned = cleaned.replace(/^[\s-]*\[[\sx]\]\s*$/gim, "");
	cleaned = cleaned.replace(/^[\s-_*]{3,}$/gm, "");
	cleaned = cleaned.replace(
		/^[\s-]*\[?(N\/A|TBD|TODO|To be determined|Not applicable|None|Empty)\]?[\s.]*$/gim,
		"",
	);
	cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

	return cleaned.trim();
}

function extractFromHeadings(body: string): string | null {
	const lines = body.split("\n");

	const headingPatterns = [
		/^#+\s*(summary|overview|what\s+changed?|context|details|description)/i,
		/^(summary|overview|what\s+changed?|context|details|description)[:]\s*/i,
	];

	for (let i = 0; i < lines.length; i++) {
		const currentLine = lines[i];
		if (!currentLine) continue;

		const line = currentLine.trim();
		if (!line) continue;

		for (const pattern of headingPatterns) {
			const match = pattern.exec(line);
			if (match) {
				const restOfLine = line.slice(match[0].length).trim();
				if (restOfLine) {
					return extractMeaningfulContent(restOfLine);
				}

				const content = extractContentAfterHeading(lines, i + 1);
				if (content) {
					return content;
				}
			}
		}
	}

	return null;
}

function extractContentAfterHeading(lines: string[], startIndex: number): string | null {
	const contentLines: string[] = [];
	let hasContent = false;

	for (let i = startIndex; i < lines.length; i++) {
		const currentLine = lines[i];
		if (!currentLine) {
			if (hasContent) {
				break;
			}
			continue;
		}

		const line = currentLine.trim();

		if (!line) {
			if (hasContent) {
				break;
			}
			continue;
		}

		if (line.startsWith("#") || /^[A-Z][a-z\s]+:$/.test(line)) {
			break;
		}

		let cleanedLine = line;
		if (line.startsWith("-") || line.startsWith("*")) {
			cleanedLine = line.replace(/^[-*]\s+/, "");
			if (cleanedLine && !/[.!?]$/.test(cleanedLine)) {
				cleanedLine += ".";
			}
		}

		contentLines.push(cleanedLine);
		hasContent = true;
	}

	if (contentLines.length === 0) {
		return null;
	}

	const joined = contentLines.join(" ");
	return extractMeaningfulContent(joined);
}

function extractFirstMeaningfulParagraph(body: string): string | null {
	const paragraphs = body.split(/\n\n+/);

	for (const para of paragraphs) {
		const trimmed = para.trim();

		if (
			trimmed.length < 10 ||
			trimmed.startsWith("#") ||
			trimmed.endsWith(":") ||
			/^[-*]\s*\[/.test(trimmed)
		) {
			continue;
		}

		const content = extractMeaningfulContent(trimmed);
		if (content) {
			return content;
		}
	}

	return null;
}

function extractMeaningfulContent(text: string): string | null {
	let cleaned = text;

	const bulletLines = cleaned.split("\n").map((line) => {
		const trimmed = line.trim();
		if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
			let content = trimmed.replace(/^[-*]\s+/, "");
			if (content && !/[.!?]$/.test(content)) {
				content += ".";
			}
			return content;
		}
		return trimmed;
	});

	cleaned = bulletLines.join(" ");

	cleaned = cleaned.replace(/\[[\sx]\]\s*/g, "");

	const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);

	const meaningfulSentences = sentences.filter((s) => {
		const lower = s.toLowerCase().trim();
		return (
			!lower.startsWith("n/a") &&
			!lower.startsWith("tbd") &&
			!lower.startsWith("todo") &&
			!lower.startsWith("to be determined") &&
			!lower.startsWith("not applicable") &&
			!lower.startsWith("none") &&
			lower.length > 5
		);
	});

	if (meaningfulSentences.length === 0) {
		return null;
	}

	const topTwo = meaningfulSentences.slice(0, 2);
	const result = topTwo.join(" ");

	return result.endsWith(".") || result.endsWith("!") || result.endsWith("?")
		? result
		: `${result}.`;
}
