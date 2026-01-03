import { readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Config, DateRange, SourceReader, WorkItem } from "../types.ts";
import { expandPath } from "../utils/config.ts";
import { isWithinRange } from "../utils/dates.ts";

interface SlackMessage {
	type: string;
	user?: string;
	text?: string;
	ts: string;
	thread_ts?: string;
	reply_count?: number;
	replies?: Array<{ user: string; ts: string }>;
	parent_user_id?: string;
}

interface SlackUser {
	id: string;
	name: string;
	real_name?: string;
	profile?: {
		display_name?: string;
		real_name?: string;
	};
}

interface ThreadSummary {
	channel: string;
	threadTs: string;
	startTime: Date;
	replyCount: number;
	participants: Set<string>;
	rootMessage: string;
	lastReply: Date;
}

function parseSlackTimestamp(ts: string): Date {
	const epochSeconds = Number.parseFloat(ts);
	return new Date(epochSeconds * 1000);
}

function truncateText(text: string, maxLength = 100): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

async function loadUsers(exportPath: string): Promise<Map<string, SlackUser>> {
	const usersFile = join(exportPath, "users.json");
	const users = new Map<string, SlackUser>();

	try {
		const file = Bun.file(usersFile);
		const content = await file.json();
		if (Array.isArray(content)) {
			for (const user of content) {
				users.set(user.id, user);
			}
		}
	} catch {
		// users.json may not exist
	}

	return users;
}

async function findChannelDirs(exportPath: string): Promise<string[]> {
	const dirs: string[] = [];

	try {
		const entries = await readdir(exportPath);
		for (const entry of entries) {
			const entryPath = join(exportPath, entry);
			const entryStat = await stat(entryPath);
			if (entryStat.isDirectory() && !entry.startsWith("__") && !entry.startsWith(".")) {
				dirs.push(entryPath);
			}
		}
	} catch {
		return [];
	}

	return dirs;
}

async function parseChannelMessages(
	channelDir: string,
	dateRange: DateRange,
): Promise<SlackMessage[]> {
	const messages: SlackMessage[] = [];

	try {
		const files = await readdir(channelDir);
		const jsonFiles = files.filter((f) => f.endsWith(".json"));

		for (const jsonFile of jsonFiles) {
			const filePath = join(channelDir, jsonFile);
			try {
				const file = Bun.file(filePath);
				const content = await file.json();
				if (Array.isArray(content)) {
					for (const msg of content) {
						if (msg.ts) {
							const timestamp = parseSlackTimestamp(msg.ts);
							if (isWithinRange(timestamp, dateRange)) {
								messages.push(msg);
							}
						}
					}
				}
			} catch {
				// Skip malformed files
			}
		}
	} catch {
		return [];
	}

	return messages;
}

function groupThreads(messages: SlackMessage[], channelName: string): ThreadSummary[] {
	const threads = new Map<string, ThreadSummary>();

	// First pass: identify thread roots
	for (const msg of messages) {
		if (msg.thread_ts && msg.ts === msg.thread_ts && msg.reply_count && msg.reply_count > 0) {
			threads.set(msg.thread_ts, {
				channel: channelName,
				threadTs: msg.thread_ts,
				startTime: parseSlackTimestamp(msg.ts),
				replyCount: msg.reply_count,
				participants: new Set(msg.user ? [msg.user] : []),
				rootMessage: msg.text ?? "",
				lastReply: parseSlackTimestamp(msg.ts),
			});
		}
	}

	// Second pass: collect thread replies
	for (const msg of messages) {
		if (msg.thread_ts && msg.ts !== msg.thread_ts) {
			const thread = threads.get(msg.thread_ts);
			if (thread) {
				if (msg.user) {
					thread.participants.add(msg.user);
				}
				const replyTime = parseSlackTimestamp(msg.ts);
				if (replyTime > thread.lastReply) {
					thread.lastReply = replyTime;
				}
			} else {
				// Thread started before our date range but has replies in range
				threads.set(msg.thread_ts, {
					channel: channelName,
					threadTs: msg.thread_ts,
					startTime: parseSlackTimestamp(msg.thread_ts),
					replyCount: 1,
					participants: new Set(msg.user ? [msg.user] : []),
					rootMessage: "(thread started earlier)",
					lastReply: parseSlackTimestamp(msg.ts),
				});
			}
		}
	}

	return Array.from(threads.values());
}

function getUserDisplayName(userId: string, users: Map<string, SlackUser>): string {
	const user = users.get(userId);
	if (!user) return userId;
	return user.profile?.display_name || user.profile?.real_name || user.real_name || user.name;
}

export const slackReader: SourceReader = {
	name: "slack",
	async read(dateRange: DateRange, config: Config): Promise<WorkItem[]> {
		const exportPath = expandPath(config.paths.slack);
		const items: WorkItem[] = [];

		try {
			const exportStat = await stat(exportPath);
			if (!exportStat.isDirectory()) {
				return [];
			}
		} catch {
			return [];
		}

		const users = await loadUsers(exportPath);
		const channelDirs = await findChannelDirs(exportPath);

		for (const channelDir of channelDirs) {
			const channelName = basename(channelDir);
			const messages = await parseChannelMessages(channelDir, dateRange);

			if (messages.length === 0) continue;

			const threads = groupThreads(messages, channelName);

			// Create work items for significant threads (2+ replies)
			for (const thread of threads) {
				if (thread.replyCount < 2) continue;

				const participantNames = Array.from(thread.participants)
					.map((id) => getUserDisplayName(id, users))
					.slice(0, 3);

				const participantStr =
					participantNames.length > 0 ? participantNames.join(", ") : "unknown";

				items.push({
					source: "slack",
					timestamp: thread.lastReply,
					title: `[#${channelName}] ${truncateText(thread.rootMessage, 80)}`,
					description: `${thread.replyCount} replies from ${participantStr}`,
					metadata: {
						channel: channelName,
						threadTs: thread.threadTs,
						replyCount: thread.replyCount,
						participants: Array.from(thread.participants),
						startTime: thread.startTime.toISOString(),
					},
				});
			}

			// Summarize non-threaded messages as channel activity
			const nonThreadedMessages = messages.filter((m) => !m.thread_ts || m.ts === m.thread_ts);
			const standaloneMessages = nonThreadedMessages.filter(
				(m) => !m.reply_count || m.reply_count === 0,
			);

			if (standaloneMessages.length > 0) {
				const uniqueUsers = new Set(standaloneMessages.map((m) => m.user).filter(Boolean));
				const firstMessage = standaloneMessages[0];
				if (!firstMessage) continue;

				const latestMessage = standaloneMessages.reduce((latest, msg) => {
					const msgTime = parseSlackTimestamp(msg.ts);
					const latestTime = parseSlackTimestamp(latest.ts);
					return msgTime > latestTime ? msg : latest;
				}, firstMessage);

				if (latestMessage) {
					items.push({
						source: "slack",
						timestamp: parseSlackTimestamp(latestMessage.ts),
						title: `[#${channelName}] ${standaloneMessages.length} messages`,
						description: `${uniqueUsers.size} participants`,
						metadata: {
							channel: channelName,
							messageCount: standaloneMessages.length,
							uniqueParticipants: uniqueUsers.size,
						},
					});
				}
			}
		}

		return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	},
};
