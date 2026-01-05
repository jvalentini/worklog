# Example 1: Basic Daily Standup

**Scenario**: You want a quick summary of what you worked on today for your daily standup meeting.

## The Problem

You've been working across multiple projects, using different editors, making git commits, and interacting with AI coding assistants. You need a concise summary of your activity without manually reviewing everything.

## The Solution

WorkLog automatically aggregates activity from all configured sources and organizes it by project.

## Commands

### Today's Activity (Default)
```bash
worklog
```

**Output:**
```markdown
# Daily Standup - January 15, 2026

**worklog**: Update README examples; Add productivity analysis feature

**api-server**: Fix authentication bug; Add rate limiting middleware

**frontend-app**: Implement dark mode toggle; Update dashboard theme
```

### Yesterday's Activity
```bash
worklog -y
```

### This Week's Activity
```bash
worklog -w
```

### Last Week's Activity
```bash
worklog -lw
```

## What Happens Behind the Scenes

1. WorkLog reads from all configured data sources (git, GitHub, VS Code, Cursor, AI agents, etc.)
2. Filters out noise (like auto-saves, trivial commits)
3. Groups activities by repository/project
4. Generates a concise summary organized by project

## Tips

- Run `worklog` first thing in the morning to see what you accomplished yesterday
- Use `worklog -w` on Fridays to prepare your weekly summary
- The output is automatically saved to history for later searching
