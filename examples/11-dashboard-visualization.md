# Example 11: Interactive Dashboard

**Scenario**: You want a visual, interactive way to explore your work history, see trends, and analyze your productivity patterns over time.

## The Problem

Command-line output is great for quick summaries, but you want to see your work data visualized with charts, filters, and interactive exploration.

## The Solution

Use WorkLog's web-based dashboard to visualize your saved snapshots.

## Commands

### Launch Dashboard
```bash
worklog dashboard
```

Opens dashboard at `http://127.0.0.1:3000` (or next available port).

### Custom Port
```bash
worklog dashboard --port 8080
```

### Different Themes
```bash
worklog dashboard --theme chaos
worklog dashboard --theme infrared
worklog dashboard --theme forest
```

## Available Themes

1. **default** - Clean, professional dark theme
2. **chaos** - Cyberpunk dystopia with isometric 3D
3. **terminal-amber** - Vintage computing with CRT effects
4. **infrared** - Military command center with HUD
5. **forest** - Organic tree structure with parallax
6. **midnight-bloom** - Editorial elegance with scattered layout
7. **blueprint** - Engineering precision with grid lines
8. **papercut** - Brutalist minimalism with hard shadows

## Dashboard Features

### View Different Periods

The dashboard automatically loads:
- **Default**: Yesterday's daily snapshot
- **URL Parameters**: Customize via query strings

**Examples:**
```
http://localhost:3000?period=weekly
http://localhost:3000?period=monthly
http://localhost:3000?period=daily&key=2026-01-15
http://localhost:3000?period=daily&start=2026-01-10&end=2026-01-15
```

### What You'll See

1. **Metrics Cards**: Total items, projects, commits, AI sessions, etc.
2. **Project Breakdown**: Activity organized by repository
3. **Source Distribution**: Pie/bar charts showing source contributions
4. **Timeline**: Chronological view of work items
5. **Activity Heatmap**: Visual representation of activity over time
6. **Source Filters**: Toggle sources on/off interactively

### API Endpoints

The dashboard also exposes JSON APIs:

```bash
# List available reports
curl http://localhost:3000/api/reports?period=daily

# Get specific report
curl http://localhost:3000/api/report?period=daily&key=2026-01-15

# Get date range
curl "http://localhost:3000/api/report-range?start=2026-01-10&end=2026-01-15"
```

## Use Cases

- **Weekly Reviews**: Visualize your week's work
- **Trend Analysis**: See patterns over time
- **Client Presentations**: Show work in a professional dashboard
- **Personal Analytics**: Understand your work patterns visually
- **Team Sharing**: Share dashboard URL (if accessible) for team visibility

## Tips

- Generate snapshots first: `worklog schedule install --backfill`
- Use different themes to find your favorite
- Dashboard works best with saved snapshots (from scheduled reports)
- Press Ctrl+C to stop the dashboard server
- Dashboard automatically falls back to next available port if 3000 is in use

## Configuration

Set default port in config:

```json
{
  "dashboard": {
    "port": 3000
  }
}
```

Or use environment variable:
```bash
export WORKLOG_DASHBOARD_PORT=8080
```
