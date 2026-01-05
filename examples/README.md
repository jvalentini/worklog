# WorkLog Examples

This directory contains user stories and examples demonstrating how to use WorkLog effectively. The examples progress from simple to advanced use cases.

## Quick Navigation

### Getting Started
1. **[Basic Daily Standup](01-basic-usage.md)** - Start here! Learn the fundamentals
2. **[Filtering by Sources](02-filtering-sources.md)** - Control which data sources to include
3. **[Project Filtering](03-project-filtering.md)** - Focus on specific repositories

### Understanding Your Data
4. **[Verbose Output](04-verbose-output.md)** - Get detailed breakdowns
5. **[Smart Clustering](05-smart-clustering.md)** - Intelligent grouping of related work
6. **[LLM Summarization](06-llm-summarization.md)** - AI-powered natural language summaries
7. **[Trends Analysis](07-trends-analysis.md)** - Compare periods and track changes
8. **[Productivity Analysis](08-productivity-analysis.md)** - Understand your work patterns

### Advanced Features
9. **[Output Formats](09-output-formats.md)** - JSON, Slack, plain text, and more
10. **[Scheduled Reports](10-scheduled-reports.md)** - Automate daily/weekly/monthly reports
11. **[Dashboard Visualization](11-dashboard-visualization.md)** - Interactive web dashboard
12. **[Search History](12-search-history.md)** - Find past work across your history
13. **[Context Recovery](13-context-recovery.md)** - Get back into context after breaks

## How to Use These Examples

1. **Start with Example 1** if you're new to WorkLog
2. **Read examples in order** - they build on each other
3. **Try the commands** - each example includes working commands you can run
4. **Adapt to your workflow** - use what works for you

## Common Workflows

### Daily Standup
```bash
# Quick daily summary
worklog -y

# With more detail
worklog -y -v

# For Slack
worklog -y --slack
```

### Weekly Review
```bash
# Weekly summary with trends
worklog -w --trends

# With productivity analysis
worklog -w --productivity

# Smart clustering for better overview
worklog -w -x
```

### Client Reporting
```bash
# Professional summary with LLM
worklog -m -x --llm

# Or use dashboard
worklog dashboard --theme default
```

### Personal Analytics
```bash
# Productivity patterns
worklog -m --productivity

# Trends over time
worklog -q --trends

# Visual dashboard
worklog dashboard
```

## Tips for Success

1. **Start Simple**: Begin with basic `worklog` command, add features as needed
2. **Configure Sources**: Set up `defaultSources` in config to match your workflow
3. **Use Scheduling**: Set up automated reports so you don't forget
4. **Explore Dashboard**: Visual data is often more insightful than text
5. **Search Regularly**: Use search to find past work and solutions
6. **Recover Context**: Use recovery when returning to work after breaks

## Getting Help

- Read the main [README.md](../README.md) for complete documentation
- Check command help: `worklog --help`
- Review configuration: `~/.config/worklog/config.json`

## Contributing Examples

Found a useful pattern? Consider adding it here! Examples should:
- Solve a real problem
- Include working commands
- Explain the "why" not just the "how"
- Build on previous examples when possible
