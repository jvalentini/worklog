# Example 8: Productivity Patterns Analysis

**Scenario**: You want to understand when you're most productive, how much focused time you have, and identify patterns in your work habits.

## The Problem

You suspect you work better in the morning, or you want to optimize your schedule based on when you're most productive. You need data to back up these insights.

## The Solution

Use the `--productivity` (`-P`) flag to analyze productivity patterns from your work activity.

## Commands

### Daily Productivity Analysis
```bash
worklog --productivity
```

**Output:**
```markdown
# Productivity Analysis - January 15, 2026

## Peak Hours
**Most Productive**: 9:00 AM - 11:00 AM (23 items, 35% of daily activity)
**Secondary Peak**: 2:00 PM - 4:00 PM (18 items, 27% of daily activity)
**Low Activity**: 12:00 PM - 1:00 PM (3 items, lunch break)

## Focus Time
**Total Focus Sessions**: 4
**Longest Focus Session**: 2h 15m (9:00 AM - 11:15 AM)
**Average Focus Session**: 1h 8m
**Total Focus Time**: 4h 32m

## Activity Distribution
- **Morning** (6 AM - 12 PM): 38 items (58%)
- **Afternoon** (12 PM - 6 PM): 24 items (36%)
- **Evening** (6 PM - 12 AM): 4 items (6%)

## Work Patterns
- **Most Active Day**: Tuesday (average 45 items)
- **Most Productive Project**: worklog (28 items)
- **Primary Activity Type**: Features (12 items)
```

### Weekly Productivity Analysis
```bash
worklog -w --productivity
```

### Monthly Productivity Analysis
```bash
worklog -m --productivity
```

## Understanding the Metrics

### Peak Hours
- Identifies when you're most active based on timestamps
- Helps schedule important work during your most productive times
- Shows natural breaks (lunch, etc.)

### Focus Time
- Calculates continuous work sessions (gaps < 30 minutes = same session)
- Shows how long you can maintain focus
- Helps identify if you're getting enough deep work time

### Activity Distribution
- Breaks down work by time of day
- Helps understand your natural rhythm
- Can reveal if you're working too late or starting too early

## Use Cases

- **Schedule Optimization**: Schedule important work during peak hours
- **Work-Life Balance**: Identify if you're working too many hours
- **Focus Improvement**: Track if you're getting enough focused time
- **Pattern Recognition**: Understand your natural productivity cycles

## Output Formats

### JSON Output
```bash
worklog --productivity --json
```

Useful for:
- Creating custom visualizations
- Tracking productivity over time
- Integrating with other tools

### Plain Text
```bash
worklog --productivity --plain
```

Useful for:
- Quick terminal viewing
- Piping to other commands
- Simple logging

## Tips

- Run weekly productivity analysis to see patterns: `worklog -w --productivity`
- Compare months to see if your patterns are changing
- Use with specific projects: `worklog --productivity --repos ~/code/main-project`
- Combine with trends: `worklog -w --trends --productivity` (trends will show, productivity will analyze)
