# Example 5: Smart Context Clustering

**Scenario**: You've been working on a complex feature across multiple commits, AI sessions, and files. You want WorkLog to intelligently group related work together.

## The Problem

Your default worklog shows individual commits and sessions, but you want to see related work clustered together to understand the bigger picture of what you accomplished.

## The Solution

Use the `--smart` (`-x`) flag to enable intelligent context clustering and summarization.

## Commands

### Smart Clustered Summary
```bash
worklog -x
```

**Default Output:**
```markdown
# Daily Standup - January 15, 2026

**worklog**: Add productivity analysis feature; Update documentation

**api-server**: Implement OAuth flow; Add rate limiting
```

**Smart Output:**
```markdown
# Daily Standup - January 15, 2026

## Work Clusters

### 🔧 Productivity Analysis Feature
**Projects**: worklog
**Context**: Implemented productivity analysis with peak hours detection and focus time calculation
- Added `--productivity` flag to CLI
- Implemented `analyzeProductivity()` function
- Created productivity formatters (JSON, Markdown, Plain)
- Added tests for productivity analysis
- Updated README with productivity examples

**Sources**: claude (2h 15m), git (3 commits), vscode (12 file edits)

### 🔐 OAuth Implementation
**Projects**: api-server
**Context**: Complete OAuth 2.0 flow with Google and GitHub providers
- Implemented OAuth endpoints
- Added token refresh logic
- Created user session management
- Added OAuth tests

**Sources**: git (5 commits), github (PR #42), cursor (4h 30m)
```

## How Smart Clustering Works

1. **Semantic Analysis**: Groups related work items based on content similarity
2. **Context Building**: Creates meaningful clusters around features, bug fixes, or themes
3. **Source Aggregation**: Combines information from multiple sources (git, AI sessions, etc.)
4. **Intelligent Summarization**: Provides context about what was accomplished

## When to Use Smart Clustering

- **Complex Features**: When work spans multiple commits and sessions
- **Retrospectives**: Understanding what you accomplished over a period
- **Client Reports**: Presenting cohesive work summaries
- **Personal Review**: Getting a high-level view of your productivity

## Combining with Other Features

```bash
# Smart clustering for last week
worklog -x -lw

# Smart clustering with verbose output
worklog -x -v

# Smart clustering for specific projects
worklog -x --repos ~/code/client-project
```

## Tips

- Smart clustering works best with multiple related work items
- Use it for weekly/monthly summaries to see themes emerge
- Combine with `--verbose` to see how items were clustered
