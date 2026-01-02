import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";
import { expandPath } from "../utils/config.ts";
import { isWithinRange } from "../utils/dates.ts";

interface CommandPattern {
	command: string;
	count: number;
	lastUsed: Date;
}

interface HistoryEvent {
	timestamp: Date;
	commandLine: string;
}

class CwdTracker {
	private cwd: string;
	private homeDir: string;
	private cwdHistory: string[] = [];

	constructor(initialCwd = homedir()) {
		this.homeDir = homedir();
		this.cwd = initialCwd;
	}

	handleCd(args: string): void {
		const trimmed = args.trim();

		if (!trimmed || trimmed === "~") {
			this.cwd = this.homeDir;
			return;
		}

		if (trimmed === "-") {
			if (this.cwdHistory.length > 0) {
				const previous = this.cwdHistory.pop();
				if (previous) {
					this.cwdHistory.push(this.cwd);
					this.cwd = previous;
				}
			}
			return;
		}

		this.cwdHistory.push(this.cwd);

		if (trimmed.startsWith("/")) {
			this.cwd = trimmed;
		} else if (trimmed.startsWith("~/")) {
			this.cwd = join(this.homeDir, trimmed.slice(2));
		} else {
			this.cwd = resolve(this.cwd, trimmed);
		}
	}

	getCwd(): string {
		return this.cwd;
	}
}

function normalizeBaseCommand(commandLine: string): string {
	const tokens = commandLine.trim().split(/\s+/).filter(Boolean);
	let index = 0;

	while (index < tokens.length) {
		const token = tokens[index];
		if (!token) break;
		if (!token.includes("=") || token.startsWith("-")) break;
		index++;
	}

	let base = tokens[index] ?? "";
	if ((base === "sudo" || base === "env") && tokens.length > index + 1) {
		base = tokens[index + 1] ?? base;
	}

	return base;
}

function shouldIgnoreForCounting(baseCommand: string): boolean {
	const ignore = new Set(["cd", "ls", "pwd", "clear", "history", "exit"]);
	return ignore.has(baseCommand);
}

function parseHistoryEvents(content: string): HistoryEvent[] {
	const events: HistoryEvent[] = [];
	const lines = content.split("\n");

	let pendingBashTimestamp: Date | null = null;
	let pendingFishCmd: string | null = null;

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;

		const bashTimestampMatch = /^#\s*(\d{9,})$/.exec(line);
		if (bashTimestampMatch) {
			const epoch = Number(bashTimestampMatch[1]);
			if (!Number.isNaN(epoch)) {
				pendingBashTimestamp = new Date(epoch * 1000);
			}
			continue;
		}

		if (pendingBashTimestamp) {
			events.push({
				timestamp: pendingBashTimestamp,
				commandLine: line,
			});
			pendingBashTimestamp = null;
			continue;
		}

		const zshMatch = /^: (\d+):\d+;(.*)$/.exec(line);
		if (zshMatch) {
			const epoch = Number(zshMatch[1]);
			const cmd = (zshMatch[2] ?? "").trim();
			if (!Number.isNaN(epoch) && cmd) {
				events.push({
					timestamp: new Date(epoch * 1000),
					commandLine: cmd,
				});
			}
			continue;
		}

		if (line.startsWith("- cmd:")) {
			pendingFishCmd = line.slice(6).trim();
			continue;
		}

		if (pendingFishCmd && line.startsWith("when:")) {
			const epoch = Number(line.slice(5).trim());
			if (!Number.isNaN(epoch)) {
				events.push({
					timestamp: new Date(epoch * 1000),
					commandLine: pendingFishCmd,
				});
			}
			pendingFishCmd = null;
		}
	}

	return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function matchRepoPath(cwd: string, configuredRepos: string[]): string | undefined {
	for (const repo of configuredRepos) {
		const expandedRepo = expandPath(repo);
		if (cwd === expandedRepo || cwd.startsWith(`${expandedRepo}/`)) {
			return repo;
		}
	}
	return undefined;
}

async function parseHistoryFile(
	filePath: string,
	dateRange: DateRange,
	configuredRepos: string[],
): Promise<Map<string, CommandPattern[]>> {
	const repoPatterns = new Map<string, Map<string, CommandPattern>>();

	try {
		const content = await readFile(filePath, "utf-8");
		const events = parseHistoryEvents(content);
		const cwdTracker = new CwdTracker();

		for (const event of events) {
			if (!isWithinRange(event.timestamp, dateRange)) continue;

			const baseCommand = normalizeBaseCommand(event.commandLine);
			if (!baseCommand) continue;

			if (baseCommand === "cd") {
				const args = event.commandLine.slice(2).trim();
				cwdTracker.handleCd(args);
				continue;
			}

			if (shouldIgnoreForCounting(baseCommand)) continue;

			const currentCwd = cwdTracker.getCwd();
			const matchedRepo = matchRepoPath(currentCwd, configuredRepos);

			if (!matchedRepo) continue;

			let patterns = repoPatterns.get(matchedRepo);
			if (!patterns) {
				patterns = new Map();
				repoPatterns.set(matchedRepo, patterns);
			}

			const existing = patterns.get(baseCommand);
			if (existing) {
				existing.count++;
				if (event.timestamp > existing.lastUsed) {
					existing.lastUsed = event.timestamp;
				}
			} else {
				patterns.set(baseCommand, {
					command: baseCommand,
					count: 1,
					lastUsed: event.timestamp,
				});
			}
		}
	} catch {
		return new Map();
	}

	const result = new Map<string, CommandPattern[]>();
	for (const [repo, patterns] of repoPatterns) {
		result.set(
			repo,
			Array.from(patterns.values()).sort((a, b) => b.count - a.count),
		);
	}

	return result;
}

export const terminalReader: SourceReader = {
	name: "terminal",
	async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
		const configured = expandPath(config.paths.terminal);

		const candidates = [
			configured,
			join(homedir(), ".bash_history"),
			join(homedir(), ".zsh_history"),
			join(homedir(), ".local", "share", "fish", "fish_history"),
		];

		const aggregated = new Map<string, Map<string, CommandPattern>>();
		const seenFiles = new Set<string>();

		for (const filePath of candidates) {
			if (seenFiles.has(filePath)) continue;
			seenFiles.add(filePath);

			const repoPatterns = await parseHistoryFile(filePath, dateRange, config.gitRepos);

			for (const [repo, patterns] of repoPatterns) {
				let repoMap = aggregated.get(repo);
				if (!repoMap) {
					repoMap = new Map();
					aggregated.set(repo, repoMap);
				}

				for (const pattern of patterns) {
					const existing = repoMap.get(pattern.command);
					if (existing) {
						existing.count += pattern.count;
						if (pattern.lastUsed > existing.lastUsed) {
							existing.lastUsed = pattern.lastUsed;
						}
					} else {
						repoMap.set(pattern.command, { ...pattern });
					}
				}
			}
		}

		if (aggregated.size === 0) return [];

		const items: WorkItem[] = [];

		for (const [repo, patterns] of aggregated) {
			const allPatterns = Array.from(patterns.values()).sort((a, b) => b.count - a.count);
			const totalCommands = allPatterns.reduce((sum, p) => sum + p.count, 0);
			const topPatterns = allPatterns.slice(0, 10);

			const latestTimestamp =
				allPatterns.length > 0
					? allPatterns.reduce(
							(latest, p) => (p.lastUsed > latest ? p.lastUsed : latest),
							allPatterns[0]?.lastUsed ?? new Date(),
						)
					: new Date();

			const description = topPatterns
				.slice(0, 3)
				.map((p) => `${p.command}(${p.count})`)
				.join(", ");

			const repoName = repo.split("/").pop() ?? repo;

			items.push({
				source: "terminal",
				timestamp: latestTimestamp,
				title: `[${repoName}] Terminal: ${totalCommands} commands across ${allPatterns.length} tools`,
				description: description ? `Top: ${description}` : undefined,
				metadata: {
					repo,
					totalCommands,
					uniqueCommands: allPatterns.length,
					topCommands: topPatterns,
				},
			});
		}

		return items;
	},
};
