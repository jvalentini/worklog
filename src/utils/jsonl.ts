import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function findJsonlFiles(dir: string): Promise<string[]> {
	const results: string[] = [];

	try {
		const entries = await readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			if (entry.isDirectory()) {
				const nested = await findJsonlFiles(fullPath);
				results.push(...nested);
			} else if (entry.name.endsWith(".jsonl")) {
				results.push(fullPath);
			}
		}
	} catch {
		return results;
	}

	return results;
}
