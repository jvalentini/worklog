# Example 10: Automated Scheduled Reports

**Scenario**: You want WorkLog to automatically generate and post daily/weekly/monthly reports to Slack without manually running commands.

## The Problem

You forget to generate your standup reports, or you want them automatically posted to your team's Slack channel every day.

## The Solution

Use WorkLog's scheduling system to automatically generate snapshots and optionally post them to Slack.

## Setup

### 1. Install Scheduled Reports

```bash
worklog schedule install
```

This installs:
- **Daily**: Runs at 00:05 every day (generates previous day's report)
- **Weekly**: Runs Monday at 00:05 (generates previous week's report)
- **Monthly**: Runs 1st of month at 00:05 (generates previous month's report)
- **Quarterly**: Runs Jan/Apr/Jul/Oct 1st at 00:05 (generates previous quarter's report)

### 2. Configure Slack (Optional)

```bash
worklog schedule install --slack https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Or set environment variable:
```bash
export WORKLOG_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 3. Customize Schedule

```bash
# Disable quarterly reports
worklog schedule install --no-quarterly

# Disable monthly reports
worklog schedule install --no-monthly

# Install with Slack and backfill historical data
worklog schedule install --slack YOUR_WEBHOOK --backfill
```

## How It Works

### Snapshot System

Scheduled reports create **snapshots** (JSON files) that:
- Store complete work summaries for a period
- Enable dashboard visualization
- Allow historical analysis
- Support regeneration and verification

### Timing

**Important**: Scheduled reports always generate the **previous** period:
- Daily report (runs at 00:05) → generates yesterday's report
- Weekly report (runs Monday 00:05) → generates last week's report
- Monthly report (runs 1st at 00:05) → generates last month's report

This ensures complete data for the period.

## Managing Schedules

### Check Status
```bash
worklog schedule status
```

**Output:**
```
✓ Scheduler: systemd user timers
NEXT                         LEFT          LAST                         PASSED       UNIT
Mon 2026-01-20 00:05:00 EST  4 days 12h    Mon 2026-01-13 00:05:00 EST  1 day 12h    worklog-weekly.timer
Tue 2026-01-21 00:05:00 EST  5 days 12h    Mon 2026-01-20 00:05:00 EST  12h          worklog-daily.timer
```

### Uninstall
```bash
worklog schedule uninstall
```

### Run Manually
```bash
# Generate yesterday's report
worklog schedule run --period daily

# Generate last week's report
worklog schedule run --period weekly

# Generate with Slack posting
worklog schedule run --period daily --slack YOUR_WEBHOOK
```

## Backfilling Historical Data

Generate snapshots for past periods:

```bash
# Default: 4 weeks of daily/weekly + 1 month of monthly
worklog schedule backfill

# Custom range
worklog schedule backfill --since 2025-12-01 --until 2025-12-31

# Include quarterly
worklog schedule backfill --quarterly

# Dry run to see what would be generated
worklog schedule backfill --dry-run
```

## Snapshot Management

### Verify Snapshots
```bash
worklog snapshot verify
```

Checks consistency between weekly and daily snapshots.

### Regenerate Snapshots
```bash
# Regenerate a specific day
worklog snapshot regenerate --daily 2026-01-15

# Regenerate a week
worklog snapshot regenerate --week 2026-01-13

# Regenerate all incomplete dailies
worklog snapshot regenerate --all
```

## Use Cases

- **Team Standups**: Automatic daily reports in Slack
- **Weekly Reviews**: Automated weekly summaries
- **Monthly Reports**: Client or management reporting
- **Historical Analysis**: Build a database of work over time

## Tips

- Start with daily reports, add weekly/monthly as needed
- Use `--backfill` when first setting up to generate historical snapshots
- Check `worklog schedule status` regularly to ensure timers are active
- Snapshots are stored in `~/.local/share/worklog/snapshots/`
- Use the dashboard to visualize snapshot data: `worklog dashboard`
