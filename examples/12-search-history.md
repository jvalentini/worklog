# Example 12: Searching Work History

**Scenario**: You remember working on a specific feature or bug fix a few weeks ago, but you can't remember exactly when or in which project. You need to search your work history.

## The Problem

You have months of work history, and you need to find specific work items, features, or topics you worked on in the past.

## The Solution

Use WorkLog's search functionality to find work items across your entire history.

## Commands

### Basic Search
```bash
worklog search "authentication"
```

**Output:**
```markdown
# Search Results: "authentication"

Found 12 matches across 3 projects

## worklog (5 matches)
- 2026-01-10 14:30 | git: Fix authentication bug in OAuth flow
- 2026-01-08 09:15 | claude: Implementing authentication middleware
- 2026-01-05 16:45 | github: Review PR #42 - Add authentication tests

## api-server (4 matches)
- 2026-01-12 11:20 | git: Add JWT authentication
- 2026-01-11 10:00 | github: Opened PR #45 - Authentication refactor

## frontend-app (3 matches)
- 2026-01-09 15:30 | git: Update authentication UI components
```

### Fuzzy Search
```bash
worklog search "auth" --fuzzy
```

Finds variations like "authentication", "authorization", "auth", etc.

### Regex Search
```bash
worklog search "bug.*fix|fix.*bug" --regex
```

### Filter by Date Range
```bash
worklog search "authentication" --since 2026-01-01 --until 2026-01-15
```

### Filter by Sources
```bash
worklog search "authentication" --sources git,github
```

### Filter by Projects
```bash
worklog search "authentication" --projects worklog,api-server
```

### Limit Results
```bash
worklog search "authentication" --limit 5
```

### Different Output Formats

**Timeline (default):**
```bash
worklog search "authentication"
```

**Grouped by project:**
```bash
worklog search "authentication" --format grouped
```

**JSON:**
```bash
worklog search "authentication" --json
```

## Advanced Examples

### Find All Bug Fixes
```bash
worklog search "fix|bug" --regex --fuzzy
```

### Find Work from Last Week
```bash
worklog search "feature" --since $(date -d '7 days ago' +%Y-%m-%d)
```

### Find AI Session Topics
```bash
worklog search "implement" --sources claude,opencode
```

### Find GitHub Activity
```bash
worklog search "PR" --sources github
```

## Use Cases

- **Finding Past Work**: Locate when you worked on something
- **Reference Lookup**: Find how you solved a problem before
- **Audit Trail**: See all work related to a topic
- **Knowledge Recovery**: Rediscover work you forgot about
- **Reporting**: Gather all work on a specific feature for reports

## Tips

- Use `--fuzzy` for flexible matching (handles typos, variations)
- Use `--regex` for complex pattern matching
- Combine filters for precise searches: `--sources git --since 2026-01-01`
- Use `--limit` to focus on most recent matches
- Search is case-insensitive by default

## Search Performance

- Searches through all saved history files
- Faster with more specific queries
- Use date ranges to limit search scope
- Source/project filters improve performance
