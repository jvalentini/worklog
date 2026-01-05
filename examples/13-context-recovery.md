# Example 13: Context Recovery

**Scenario**: You're returning to work after a break (vacation, weekend, or switching projects) and need to quickly understand what you were working on and get back into context.

## The Problem

After time away, you've lost context on what you were working on, what problems you were solving, and where you left off.

## The Solution

Use WorkLog's recovery feature to analyze recent work and generate a context recovery report.

## Commands

### Basic Recovery
```bash
worklog recover
```

**Output:**
```markdown
# Context Recovery Report

## Recent Activity Summary
**Period**: Last 3 days
**Total Items**: 45
**Projects**: 3

## Active Projects

### worklog
**Status**: Active development
**Recent Work**:
- Implementing productivity analysis feature (in progress)
- Fixed date parsing edge case (completed)
- Updated documentation (completed)

**Key Context**:
- Working on `--productivity` flag implementation
- Last commit: "feat: add productivity analysis skeleton"
- Active branch: `feature/productivity-analysis`

### api-server
**Status**: Maintenance
**Recent Work**:
- Reviewed PR #42: Add rate limiting
- Fixed authentication bug (completed)

**Key Context**:
- PR #42 is ready for merge
- Main branch is stable
```

### Week-Long Recovery
```bash
worklog recover --week
```

### Project-Specific Recovery
```bash
worklog recover --project worklog
```

### Verbose Recovery
```bash
worklog recover --verbose
```

### JSON Output
```bash
worklog recover --json
```

## What Recovery Shows

1. **Active Projects**: Which repositories you were working on
2. **Recent Work**: What you accomplished recently
3. **In-Progress Items**: Work that appears incomplete
4. **Key Context**: Important details to help you resume
5. **Status Indicators**: Whether projects are active, stable, or need attention

## Use Cases

- **Monday Morning**: Get back into context after the weekend
- **After Vacation**: Understand what you were working on
- **Project Switching**: Quickly get context on a project you haven't touched
- **Team Handoffs**: Share context with team members
- **Personal Notes**: Create a "where did I leave off" report

## How It Works

Recovery analyzes:
- Recent git commits and branches
- Incomplete work items (commits without follow-ups)
- Active AI sessions
- Recent file modifications
- GitHub PRs and issues you were working on

## Tips

- Run `worklog recover` first thing when returning to work
- Use `--week` for longer breaks
- Use `--project` to focus on specific work
- Combine with search to find specific items: `worklog search "productivity"`
- Use verbose mode for detailed breakdown: `worklog recover -v`

## Example Workflow

```bash
# Monday morning routine
worklog recover --week          # Get context on last week
worklog -y                       # See what you did Friday
worklog search "TODO|FIXME"      # Find incomplete items
```
