import { describe, expect, test } from "bun:test";
import type { WorkItem } from "../types.ts";
import { attributeWorkItem, MISC_PROJECT } from "./attribution.ts";

describe("attributeWorkItem", () => {
	const gitRepos = ["~/code/worklog", "~/code/api-server", "~/code/nested/deep-project"];

	describe("metadata.repo as path", () => {
		test("matches exact path", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test commit",
				metadata: { repo: "~/code/worklog" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("matches nested path", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test commit",
				metadata: { repo: "~/code/worklog/src" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("prefers longest match for nested repos", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test commit",
				metadata: { repo: "~/code/nested/deep-project/src" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/nested/deep-project");
		});

		test("returns misc for non-matching path", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test commit",
				metadata: { repo: "~/other/project" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe(MISC_PROJECT);
		});
	});

	describe("metadata.repo as GitHub owner/name", () => {
		test("matches by repo basename", () => {
			const item: WorkItem = {
				source: "github",
				timestamp: new Date(),
				title: "PR opened",
				metadata: { repo: "jvalentini/worklog" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("matches case-insensitively", () => {
			const item: WorkItem = {
				source: "github",
				timestamp: new Date(),
				title: "PR opened",
				metadata: { repo: "JVALENTINI/WORKLOG" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("handles dashes and underscores in normalization", () => {
			const repos = ["~/code/api-server", "~/code/deep_project"];

			const item1: WorkItem = {
				source: "github",
				timestamp: new Date(),
				title: "PR opened",
				metadata: { repo: "org/api_server" },
			};

			const item2: WorkItem = {
				source: "github",
				timestamp: new Date(),
				title: "PR opened",
				metadata: { repo: "org/deep-project" },
			};

			expect(attributeWorkItem(item1, repos)).toBe("~/code/api-server");
			expect(attributeWorkItem(item2, repos)).toBe("~/code/deep_project");
		});

		test("returns misc for non-matching GitHub repo", () => {
			const item: WorkItem = {
				source: "github",
				timestamp: new Date(),
				title: "PR opened",
				metadata: { repo: "other-user/other-repo" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe(MISC_PROJECT);
		});
	});

	describe("metadata.project", () => {
		test("matches by normalized project name", () => {
			const item: WorkItem = {
				source: "opencode",
				timestamp: new Date(),
				title: "Session",
				metadata: { project: "worklog" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("matches case-insensitively", () => {
			const item: WorkItem = {
				source: "opencode",
				timestamp: new Date(),
				title: "Session",
				metadata: { project: "WORKLOG" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("matches with special characters", () => {
			const item: WorkItem = {
				source: "opencode",
				timestamp: new Date(),
				title: "Session",
				metadata: { project: "api-server" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/api-server");
		});

		test("returns misc for non-matching project", () => {
			const item: WorkItem = {
				source: "opencode",
				timestamp: new Date(),
				title: "Session",
				metadata: { project: "unknown-project" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe(MISC_PROJECT);
		});
	});

	describe("priority and fallback", () => {
		test("prefers metadata.repo over metadata.project", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: {
					repo: "~/code/worklog",
					project: "api-server",
				},
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("falls back to metadata.project if repo doesn't match", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: {
					repo: "~/other/path",
					project: "worklog",
				},
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("returns misc when no metadata matches", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: {
					other: "value",
				},
			};

			expect(attributeWorkItem(item, gitRepos)).toBe(MISC_PROJECT);
		});

		test("returns misc when metadata is missing", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
			};

			expect(attributeWorkItem(item, gitRepos)).toBe(MISC_PROJECT);
		});
	});

	describe("empty gitRepos configuration", () => {
		test("returns misc when gitRepos is empty", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: { repo: "~/code/worklog" },
			};

			expect(attributeWorkItem(item, [])).toBe(MISC_PROJECT);
		});
	});

	describe("edge cases", () => {
		test("handles repo paths with trailing slash", () => {
			const repos = ["~/code/worklog/"];
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: { repo: "~/code/worklog" },
			};

			expect(attributeWorkItem(item, repos)).toBe("~/code/worklog/");
		});

		test("handles item repo with trailing slash", () => {
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: { repo: "~/code/worklog/" },
			};

			expect(attributeWorkItem(item, gitRepos)).toBe("~/code/worklog");
		});

		test("handles absolute paths", () => {
			const repos = ["/home/user/code/worklog"];
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: { repo: "/home/user/code/worklog/src" },
			};

			expect(attributeWorkItem(item, repos)).toBe("/home/user/code/worklog");
		});

		test("handles relative paths", () => {
			const repos = ["./worklog"];
			const item: WorkItem = {
				source: "git",
				timestamp: new Date(),
				title: "Test",
				metadata: { repo: "./worklog" },
			};

			expect(attributeWorkItem(item, repos)).toBe("./worklog");
		});
	});
});
