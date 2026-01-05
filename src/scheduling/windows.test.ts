import { describe, expect, test } from "bun:test";
import { detectSchedulerBackend } from "./index.ts";
import {
	getWindowsTasksStatus,
	installWindowsTasks,
	isWindowsTaskSchedulerAvailable,
	uninstallWindowsTasks,
} from "./windows.ts";

describe("Windows Task Scheduler", () => {
	test("detectSchedulerBackend includes windows", async () => {
		const backend = await detectSchedulerBackend();
		expect(["systemd", "cron", "windows"]).toContain(backend);
	});

	test("isWindowsTaskSchedulerAvailable returns false on non-Windows", async () => {
		// On Linux/macOS, this should return false
		if (process.platform !== "win32") {
			const available = await isWindowsTaskSchedulerAvailable();
			expect(available).toBe(false);
		}
	});

	test("Windows task functions handle non-Windows gracefully", async () => {
		if (process.platform !== "win32") {
			// These should not throw on non-Windows platforms
			await expect(getWindowsTasksStatus(["daily"])).resolves.toBeDefined();
			await expect(installWindowsTasks(["daily"], ["echo", "test"])).resolves.toBeDefined();
			await expect(uninstallWindowsTasks(["daily"])).resolves.toBeDefined();
		}
	});
});
