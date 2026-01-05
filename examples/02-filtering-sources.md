# Example 2: Filtering by Data Sources

**Scenario**: You only want to see activity from specific sources, or you want to exclude certain sources that are too noisy.

## The Problem

You're working on a project where you have a lot of filesystem activity (auto-saves, temp files) that's cluttering your report. You want to focus on meaningful work like git commits and AI coding sessions.

## The Solution

Use the `--sources` flag to include only the sources you care about.

## Commands

### Only Git and GitHub Activity
```bash
worklog --sources git,github
```

**Output:**
```markdown
# Daily Standup - January 15, 2026

**api-server**: 
- Fix authentication bug (git commit)
- Merge PR #42: Add rate limiting (github)
- Review PR #43: Update dependencies (github)
```

### Only AI Coding Sessions
```bash
worklog --sources opencode,claude,codex,factory
```

**Output:**
```markdown
# Daily Standup - January 15, 2026

**worklog**: 
- Implementing productivity analysis feature (claude session)
- Refactoring date utilities (opencode session)
```

### Exclude Noisy Sources
```bash
# Include everything except filesystem and terminal
worklog --sources opencode,claude,codex,factory,git,github,vscode,cursor,calendar
```

## Available Sources

- `opencode` - OpenCode AI sessions
- `claude` - Claude Code sessions
- `codex` - Codex sessions
- `factory` - Factory sessions
- `git` - Local commit history
- `github` - PRs, issues, reviews (requires `gh` CLI)
- `vscode` - VS Code workspace activity
- `cursor` - Cursor editor sessions
- `terminal` - Shell command history
- `filesystem` - File modifications
- `calendar` - iCal events
- `slack` - Slack export messages and threads

## Tips

- Start with all sources enabled, then filter as needed
- Use `worklog -v` (verbose) to see which sources contributed what
- Configure `defaultSources` in `~/.config/worklog/config.json` to set your preferred sources
