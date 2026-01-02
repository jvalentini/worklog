import { readdir, stat } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";
import { expandPath } from "../utils/config.ts";
import { isWithinRange } from "../utils/dates.ts";

interface FileActivity {
	path: string;
	modified: Date;
	size: number;
}

export interface FilesystemAdapter {
	readdir(path: string): Promise<Array<{ name: string; isDirectory: () => boolean }>>;
	stat(path: string): Promise<{ mtime: Date; size: number }>;
}

class NodeFilesystemAdapter implements FilesystemAdapter {
	async readdir(path: string): Promise<Array<{ name: string; isDirectory: () => boolean }>> {
		return readdir(path, { withFileTypes: true });
	}

	async stat(path: string): Promise<{ mtime: Date; size: number }> {
		const stats = await stat(path);
		return { mtime: stats.mtime, size: stats.size };
	}
}

async function scanDirectory(
	dirPath: string,
	dateRange: DateRange,
	maxDepth: number,
	currentDepth: number,
	skipDirs: Set<string>,
	adapter: FilesystemAdapter = new NodeFilesystemAdapter(),
): Promise<FileActivity[]> {
	const activities: FileActivity[] = [];

	if (currentDepth > maxDepth) return activities;

	try {
		const entries = await adapter.readdir(dirPath);

		for (const entry of entries) {
			if (skipDirs.has(entry.name)) continue;

			const fullPath = join(dirPath, entry.name);

			try {
				const stats = await adapter.stat(fullPath);
				const modified = new Date(stats.mtime);

				if (!entry.isDirectory() && isWithinRange(modified, dateRange)) {
					activities.push({
						path: fullPath,
						modified,
						size: stats.size,
					});
				}

				if (entry.isDirectory() && currentDepth < maxDepth) {
					const nested = await scanDirectory(
						fullPath,
						dateRange,
						maxDepth,
						currentDepth + 1,
						skipDirs,
						adapter,
					);
					activities.push(...nested);
				}
			} catch {}
		}
	} catch {
		return activities;
	}

	return activities;
}

function aggregateFileActivity(basePath: string, activities: FileActivity[]) {
	const extensions = new Map<string, number>();
	const directories = new Map<string, number>();

	for (const activity of activities) {
		const ext = extname(activity.path).toLowerCase();
		const extKey = ext.length > 1 ? ext.slice(1) : "no-ext";
		extensions.set(extKey, (extensions.get(extKey) ?? 0) + 1);

		const dir = dirname(activity.path);
		const relDir = relative(basePath, dir) || ".";
		directories.set(relDir, (directories.get(relDir) ?? 0) + 1);
	}

	return { extensions, directories, totalFiles: activities.length };
}

export function createFilesystemReader(adapter?: FilesystemAdapter): SourceReader {
	const fsAdapter = adapter ?? new NodeFilesystemAdapter();

	return {
		name: "filesystem",
		async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
			if (config.gitRepos.length === 0) {
				return [];
			}

			const skipDirs = new Set([
				"node_modules",
				".git",
				".next",
				"dist",
				"build",
				".vscode",
				".turbo",
				".cache",
			]);

			const items: WorkItem[] = [];

			for (const repo of config.gitRepos) {
				try {
					const repoPath = expandPath(repo);
					const activities = await scanDirectory(repoPath, dateRange, 3, 0, skipDirs, fsAdapter);

					if (activities.length === 0) continue;

					const { extensions, directories, totalFiles } = aggregateFileActivity(
						repoPath,
						activities,
					);

					const topExtensions = Array.from(extensions.entries())
						.sort((a, b) => b[1] - a[1])
						.slice(0, 5);

					const topDirectories = Array.from(directories.entries())
						.sort((a, b) => b[1] - a[1])
						.slice(0, 3);

					const topFiles = activities
						.slice()
						.sort((a, b) => b.modified.getTime() - a.modified.getTime())
						.slice(0, 10)
						.map((activity) => relative(repoPath, activity.path));

					const extensionSummary = topExtensions
						.map(([ext, count]) => `${ext}(${count})`)
						.join(", ");

					items.push({
						source: "filesystem",
						timestamp: new Date(),
						title: `File System: Modified ${totalFiles} file${totalFiles !== 1 ? "s" : ""}`,
						description: `Types: ${extensionSummary}`,
						metadata: {
							repo,
							project: repo.replace(/\/$/, "").split("/").pop() ?? repo,
							basePath: repoPath,
							totalFiles,
							topExtensions,
							topDirectories,
							topFiles,
						},
					});
				} catch {}
			}

			return items;
		},
	};
}

export const filesystemReader = createFilesystemReader();
