# Example 7: Activity Trends Analysis

**Scenario**: You want to see how your activity this week compares to last week, or understand if you're becoming more or less productive over time.

## The Problem

You want to understand trends in your work patterns - are you committing more code? Spending more time in AI sessions? Working on more projects?

## The Solution

Use the `--trends` (`-t`) flag to compare the current period with the previous period.

## Commands

### Compare This Week vs Last Week
```bash
worklog -w --trends
```

**Output:**
```markdown
# Weekly Standup - Week of January 8, 2026

## Activity Trends (vs Previous Week)

**Total Items**: 142 (+18, +14.5%)
**Projects**: 4 (+1, +33.3%)
**Git Commits**: 23 (+5, +27.8%)
**AI Sessions**: 8 (-2, -20.0%)
**GitHub Activity**: 12 (+3, +33.3%)

## Projects

### worklog
**Items**: 45 (+12, +36.4%)
- Features: 3 (+1)
- Bug Fixes: 2 (+1)
- Documentation: 1 (no change)

### api-server
**Items**: 38 (+5, +15.2%)
- Features: 2 (no change)
- Bug Fixes: 1 (+1)
- Reviews: 4 (+1)
```

### Compare This Month vs Last Month
```bash
worklog -m --trends
```

### Compare Specific Date Ranges
```bash
# Compare this week with the week before
worklog -w --trends

# Compare yesterday with the day before
worklog -y --trends
```

## What Trends Shows

1. **Item Counts**: Total work items compared to previous period
2. **Project Activity**: Which projects saw more/less activity
3. **Source Breakdown**: Changes in git commits, AI sessions, GitHub activity, etc.
4. **Category Changes**: Features, bug fixes, documentation, etc.

## Use Cases

- **Weekly Reviews**: See if you're maintaining consistent activity
- **Goal Tracking**: Monitor if you're meeting productivity goals
- **Pattern Recognition**: Identify if certain days/weeks are more productive
- **Retrospectives**: Understand what changed between periods

## Interpreting Results

- **Positive trends** (+): More activity than previous period
- **Negative trends** (-): Less activity than previous period
- **No change** (0): Similar activity levels

Remember: More activity doesn't always mean more productivity. Use trends as one data point, not the only metric.

## Tips

- Use `--trends` with weekly or monthly reports for meaningful comparisons
- Daily trends can be noisy due to natural variation
- Combine with `--verbose` to see detailed breakdowns: `worklog -w --trends -v`
- Trends work with filtered sources: `worklog -w --trends --sources git,github`
