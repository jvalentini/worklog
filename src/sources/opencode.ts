import { readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";
import { attributeWorkItem } from "../utils/attribution.ts";
import { expandPath } from "../utils/config.ts";
import { isWithinRange } from "../utils/dates.ts";

interface OpenCodeMessage {
	role: string;
	content?: string;
	timestamp?: string;
}

export interface OpenCodeSession {
	id: string;
	title: string;
	time: { created: number; updated: number };
	projectID: string;
	directory: string;
}

export interface OpenCodeAdapter {
	readdir(path: string): Promise<string[]>;
	stat(path: string): Promise<{ isDirectory: () => boolean; isFile: () => boolean }>;
	readFile(path: string): Promise<string>;
}

class BunOpenCodeAdapter implements OpenCodeAdapter {
	async readdir(path: string): Promise<string[]> {
		return readdir(path);
	}

	async stat(path: string): Promise<{ isDirectory: () => boolean; isFile: () => boolean }> {
		const s = await stat(path);
		return {
			isDirectory: () => s.isDirectory(),
			isFile: () => s.isFile(),
		};
	}

	async readFile(path: string): Promise<string> {
		return Bun.file(path).text();
	}
}

export function extractFilePaths(content: string): string[] {
	const paths: string[] = [];
	const lines = content.split("\n");

	const pathPattern =
		/(?:^|[\s"'`(])((?:~|\/)[^\s"'`(),]+?\/[^\s"'`(),]*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9]+)?)|(?:^|[\s"'`(])((?:src|lib|test|tests|pkg|cmd|internal|bin|scripts)\/[^\s"'`(),]+)/g;

	for (const line of lines) {
		const matches = Array.from(line.matchAll(pathPattern));
		for (const match of matches) {
			const path = match[1] || match[2];
			if (path) {
				paths.push(path);
			}
		}
	}

	return paths;
}

export async function findJsonFilesRecursively(
	dirPath: string,
	adapter: OpenCodeAdapter = new BunOpenCodeAdapter(),
): Promise<string[]> {
	const files: string[] = [];

	async function scanDir(currentPath: string): Promise<void> {
		try {
			const entries = await adapter.readdir(currentPath);

			for (const entry of entries) {
				const fullPath = join(currentPath, entry);
				const stats = await adapter.stat(fullPath);

				if (stats.isDirectory()) {
					await scanDir(fullPath);
				} else if (stats.isFile() && entry.endsWith(".json")) {
					files.push(fullPath);
				}
			}
		} catch {
			// Skip directories we can't read
		}
	}

	await scanDir(dirPath);
	return files;
}

export function findRepoFromMessages(
	messages: OpenCodeMessage[],
	gitRepos: string[],
): string | undefined {
	const allPaths: string[] = [];

	for (const msg of messages) {
		if (msg.content) {
			allPaths.push(...extractFilePaths(msg.content));
		}
	}

	if (allPaths.length === 0) {
		return undefined;
	}

	for (const path of allPaths) {
		const dummyItem: WorkItem = {
			source: "opencode",
			timestamp: new Date(),
			title: "temp",
			metadata: { repo: path },
		};

		const attributed = attributeWorkItem(dummyItem, gitRepos);
		if (attributed !== "misc") {
			return attributed;
		}
	}

	return undefined;
}

export async function parseSessionFile(
	filePath: string,
	dateRange: DateRange,
	gitRepos: string[],
	adapter: OpenCodeAdapter = new BunOpenCodeAdapter(),
): Promise<WorkItem[]> {
	const items: WorkItem[] = [];

	try {
		const content = await adapter.readFile(filePath);
		const session = JSON.parse(content) as OpenCodeSession;

		const sessionStart = new Date(session.time.created);

		if (isWithinRange(sessionStart, dateRange)) {
			// Try to find repo from directory path
			let repo: string | undefined;
			const dummyItem: WorkItem = {
				source: "opencode",
				timestamp: sessionStart,
				title: "temp",
				metadata: { repo: session.directory },
			};
			const attributed = attributeWorkItem(dummyItem, gitRepos);
			if (attributed !== "misc") {
				repo = attributed;
			}

			items.push({
				source: "opencode",
				timestamp: sessionStart,
				title: `OpenCode: ${session.title}`,
				description: `Project: ${session.projectID}`,
				metadata: {
					sessionFile: basename(filePath),
					projectID: session.projectID,
					directory: session.directory,
					...(repo && { repo }),
				},
			});
		}
	} catch {
		return [];
	}

	return items;
}

export function createOpenCodeReader(
	adapter: OpenCodeAdapter = new BunOpenCodeAdapter(),
): SourceReader {
	return {
		name: "opencode",
		async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
			const basePath = expandPath(config.paths.opencode);
			const items: WorkItem[] = [];

			try {
				const jsonFiles = await findJsonFilesRecursively(basePath, adapter);

				for (const filePath of jsonFiles) {
					const sessionItems = await parseSessionFile(
						filePath,
						dateRange,
						config.gitRepos,
						adapter,
					);
					items.push(...sessionItems);
				}
			} catch {
				return [];
			}

			return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
		},
	};
}

export const opencodeReader: SourceReader = createOpenCodeReader();
