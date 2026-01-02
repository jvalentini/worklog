export function cleanSubject(subject: string): string {
	let cleaned = subject.replace(
		/^(feat|fix|docs|refactor|test|chore|style|perf|ci|build)(\([^)]*\))?:\s*/i,
		"",
	);
	cleaned = cleaned.replace(/^\[\]\s*/, "");
	const pipeIndex = cleaned.indexOf("|");
	if (pipeIndex !== -1) {
		cleaned = cleaned.slice(0, pipeIndex).trim();
	}
	cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	return cleaned;
}
