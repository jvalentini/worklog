# Example 3: Focusing on Specific Projects

**Scenario**: You work on multiple repositories, but today you only want to report on one specific project for a client meeting.

## The Problem

Your worklog shows activity across 5 different repositories, but you need a focused report on just the client project.

## The Solution

Use the `--repos` flag to filter by specific git repository paths.

## Commands

### Single Project Focus
```bash
worklog --repos ~/code/client-project
```

**Output:**
```markdown
# Daily Standup - January 15, 2026

**client-project**: 
- Implement OAuth flow
- Add user authentication tests
- Fix session management bug
```

### Multiple Specific Projects
```bash
worklog --repos ~/code/project-a,~/code/project-b
```

### Combine with Source Filtering
```bash
# Only git and GitHub activity for specific repos
worklog --repos ~/code/client-project --sources git,github
```

## Finding Repository Paths

WorkLog automatically detects git repositories. To see which repos it's tracking:

1. Check your config: `~/.config/worklog/config.json`
2. Look for the `gitRepos` array
3. Or use verbose mode to see what's being scanned: `worklog -v`

## Configuration

Set default repositories in your config file:

```json
{
  "gitRepos": [
    "~/code/client-project",
    "~/code/internal-tools",
    "~/code/open-source"
  ]
}
```

## Tips

- Use absolute paths or `~` for home directory
- WorkLog will scan all repos by default if `gitRepos` is not specified
- Combine with date ranges: `worklog -w --repos ~/code/client-project`
