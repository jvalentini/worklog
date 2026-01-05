import type { SchedulePeriod } from "../schedule.ts";

function quoteWindowsArg(arg: string): string {
	return `"${arg.replace(/"/g, '""')}"`;
}

function formatWindowsTime(hour: number, minute: number): string {
	return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function getWindowsTaskName(period: SchedulePeriod): string {
	return `worklog-${period}`;
}

function getWindowsTrigger(period: SchedulePeriod): string {
	switch (period) {
		case "daily":
			return `/SC DAILY /ST ${formatWindowsTime(0, 5)}`;
		case "weekly":
			return `/SC WEEKLY /D MON /ST ${formatWindowsTime(0, 5)}`;
		case "monthly":
			return `/SC MONTHLY /D 1 /ST ${formatWindowsTime(0, 5)}`;
		case "quarterly":
			return `/SC MONTHLY /D 1 /ST ${formatWindowsTime(0, 5)}`;
	}
}

export async function isWindowsTaskSchedulerAvailable(): Promise<boolean> {
	if (process.platform !== "win32") {
		return false;
	}

	try {
		const proc = Bun.spawn(["schtasks", "/?"], {
			stdout: "ignore",
			stderr: "ignore",
		});
		const exitCode = await proc.exited;
		return exitCode === 0;
	} catch {
		return false;
	}
}

export async function installWindowsTasks(
	periods: readonly SchedulePeriod[],
	execStart: string[],
): Promise<{ installed: SchedulePeriod[]; errors: string[] }> {
	const installed: SchedulePeriod[] = [];
	const errors: string[] = [];

	const [exePath, ...args] = execStart;
	if (!exePath) {
		errors.push("Missing executable path for scheduled task");
		return { installed, errors };
	}

	for (const period of periods) {
		try {
			const taskName = getWindowsTaskName(period);
			const trigger = getWindowsTrigger(period);
			const command = `${quoteWindowsArg(exePath)} ${args.map(quoteWindowsArg).join(" ")} schedule run --period ${period}`;

			const proc = Bun.spawn(
				[
					"schtasks",
					"/Create",
					"/TN",
					taskName,
					"/TR",
					command,
					...trigger.split(" ").filter(Boolean),
					"/F", // Force overwrite
				],
				{
					stdout: "pipe",
					stderr: "pipe",
				},
			);

			const [_stdout, stderr] = await Promise.all([
				new Response(proc.stdout).text(),
				new Response(proc.stderr).text(),
			]);

			const exitCode = await proc.exited;
			if (exitCode === 0) {
				installed.push(period);
			} else {
				errors.push(`Failed to install ${period}: ${stderr}`);
			}
		} catch (error) {
			errors.push(`Failed to install ${period}: ${error}`);
		}
	}

	return { installed, errors };
}

export async function uninstallWindowsTasks(
	periods: readonly SchedulePeriod[],
): Promise<{ uninstalled: SchedulePeriod[]; errors: string[] }> {
	const uninstalled: SchedulePeriod[] = [];
	const errors: string[] = [];

	for (const period of periods) {
		try {
			const taskName = getWindowsTaskName(period);

			const proc = Bun.spawn(
				[
					"schtasks",
					"/Delete",
					"/TN",
					taskName,
					"/F", // Force
				],
				{
					stdout: "pipe",
					stderr: "pipe",
				},
			);

			const [_stdout, stderr] = await Promise.all([
				new Response(proc.stdout).text(),
				new Response(proc.stderr).text(),
			]);

			const exitCode = await proc.exited;
			if (exitCode === 0) {
				uninstalled.push(period);
			} else {
				errors.push(`Failed to uninstall ${period}: ${stderr}`);
			}
		} catch (error) {
			errors.push(`Failed to uninstall ${period}: ${error}`);
		}
	}

	return { uninstalled, errors };
}

export async function getWindowsTasksStatus(
	periods: readonly SchedulePeriod[],
): Promise<{ installed: SchedulePeriod[]; notInstalled: SchedulePeriod[] }> {
	const installed: SchedulePeriod[] = [];
	const notInstalled: SchedulePeriod[] = [];

	for (const period of periods) {
		try {
			const taskName = getWindowsTaskName(period);

			const proc = Bun.spawn(["schtasks", "/Query", "/TN", taskName], {
				stdout: "ignore",
				stderr: "ignore",
			});

			const exitCode = await proc.exited;
			if (exitCode === 0) {
				installed.push(period);
			} else {
				notInstalled.push(period);
			}
		} catch {
			notInstalled.push(period);
		}
	}

	return { installed, notInstalled };
}
