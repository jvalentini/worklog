# Example 4: Detailed Breakdown with Verbose Mode

**Scenario**: You want to understand exactly what WorkLog found and how it categorized your work, not just a summary.

## The Problem

The default concise output is great for standups, but sometimes you need more detail to understand what WorkLog detected or to verify it's capturing everything correctly.

## The Solution

Use the `--verbose` (`-v`) flag to get a detailed breakdown.

## Commands

### Verbose Daily Report
```bash
worklog -v
```

**Output:**
```markdown
Date range: 2026-01-15 00:00:00 - 2026-01-15 23:59:59
Sources: opencode, claude, git, github, vscode, cursor

Reading opencode...
  Found 3 items (0.45s)
Reading claude...
  Found 2 items (0.32s)
Reading git...
  Found 8 items (1.23s)
Reading github...
  Found 5 items (2.10s)
Reading vscode...
  Found 12 items (0.67s)
Reading cursor...
  Found 4 items (0.89s)

Total items: 34

# Daily Standup - January 15, 2026

## worklog
**Summary**: 2 features, 1 bug fix, 1 documentation

**Features** (2):
- Add productivity analysis feature
- Implement smart context clustering

**Bug Fixes** (1):
- Fix date parsing edge case

**Documentation** (1):
- Update README examples

**AI Sessions** (2):
- Implementing productivity analysis (claude, 2h 15m)
- Refactoring date utilities (opencode, 45m)

**Git Commits** (3):
- feat: add productivity analysis
- fix: date parsing edge case
- docs: update examples

**GitHub Activity** (2):
- Opened PR #42: Add productivity analysis
- Reviewed PR #41: Update dependencies
```

## What Verbose Mode Shows

1. **Source Reading Progress**: See which sources are being read and how long each takes
2. **Item Counts**: Know exactly how many items each source contributed
3. **Categorized Breakdown**: See work organized by type (features, bug fixes, documentation, etc.)
4. **Source Attribution**: Know which source (git, claude, etc.) contributed each item
5. **Timing Information**: For AI sessions, see duration estimates

## Use Cases

- **Debugging**: Verify WorkLog is reading all your sources correctly
- **Performance**: See which sources are slow to read
- **Verification**: Check that important work items are being captured
- **Detailed Reporting**: When you need more than a one-line summary

## Tips

- Combine with other flags: `worklog -v -w` for verbose weekly report
- Use verbose mode occasionally to verify your setup
- The timing information helps identify slow sources (like GitHub API calls)
