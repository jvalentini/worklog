# Example 9: Different Output Formats

**Scenario**: You need WorkLog output in different formats for different purposes - Slack for team updates, JSON for automation, plain text for logs.

## The Problem

You want to share your worklog in Slack, integrate it into other tools, or format it differently for different audiences.

## The Solution

WorkLog supports multiple output formats: Markdown (default), JSON, plain text, and Slack format.

## Commands

### Markdown (Default)
```bash
worklog
```

**Output:**
```markdown
# Daily Standup - January 15, 2026

**worklog**: Add productivity analysis feature; Update documentation

**api-server**: Fix authentication bug; Add rate limiting
```

### JSON Format
```bash
worklog --json
```

**Output:**
```json
{
  "dateRange": {
    "start": "2026-01-15T00:00:00.000Z",
    "end": "2026-01-15T23:59:59.999Z"
  },
  "projects": [
    {
      "name": "worklog",
      "items": [
        {
          "source": "git",
          "timestamp": "2026-01-15T10:30:00.000Z",
          "title": "Add productivity analysis feature",
          "description": "feat: add --productivity flag with peak hours analysis"
        }
      ],
      "summary": {
        "features": 2,
        "bugFixes": 1,
        "documentation": 1
      }
    }
  ],
  "generatedAt": "2026-01-15T18:00:00.000Z"
}
```

**Use Cases:**
- Automation and scripting
- Integration with other tools
- Custom processing and analysis
- Storing structured data

### Plain Text
```bash
worklog --plain
```

**Output:**
```
Daily Standup - January 15, 2026

worklog: Add productivity analysis feature; Update documentation

api-server: Fix authentication bug; Add rate limiting
```

**Use Cases:**
- Terminal viewing without markdown rendering
- Logging to files
- Piping to other commands
- Simple text processing

### Slack Format
```bash
worklog --slack
```

**Output:**
```
:calendar: *Daily Standup - January 15, 2026*

*worklog*: :sparkles: Add productivity analysis feature; :memo: Update documentation

*api-server*: :bug: Fix authentication bug; :rocket: Add rate limiting
```

**Use Cases:**
- Posting directly to Slack channels
- Team standup updates
- Automated daily reports
- Integration with Slack workflows

## Combining Formats with Other Features

### JSON with Smart Clustering
```bash
worklog -x --json
```

### Slack Format with Trends
```bash
worklog -w --trends --slack
```

### Plain Text with Productivity
```bash
worklog --productivity --plain
```

## Automation Examples

### Save to File
```bash
# Markdown
worklog > standup-$(date +%Y-%m-%d).md

# JSON
worklog --json > standup-$(date +%Y-%m-%d).json

# Plain text
worklog --plain > standup-$(date +%Y-%m-%d).txt
```

### Post to Slack (Manual)
```bash
worklog --slack | curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"$(worklog --slack)\"}" \
  YOUR_SLACK_WEBHOOK_URL
```

### Process with jq (JSON)
```bash
# Count projects
worklog --json | jq '.projects | length'

# List all project names
worklog --json | jq -r '.projects[].name'

# Count total items
worklog --json | jq '[.projects[].items | length] | add'
```

## Tips

- Use `--json` when you need structured data for automation
- Use `--slack` for team communication (or set up scheduled reports)
- Use `--plain` for simple text processing or logging
- Default markdown is best for human reading and GitHub/GitLab issues
