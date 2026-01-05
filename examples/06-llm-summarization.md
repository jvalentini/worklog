# Example 6: LLM-Powered Summarization

**Scenario**: You want WorkLog to use AI to create more natural, human-readable summaries of your work, especially for complex features or when presenting to non-technical stakeholders.

## The Problem

Your worklog shows technical details (commit messages, file paths, etc.) but you need a more narrative summary that explains what you accomplished in plain language.

## The Solution

Use the `--llm` (`-L`) flag to enable LLM summarization. This requires an API key (OpenAI or Anthropic).

## Setup

### 1. Get an API Key

**OpenAI:**
- Sign up at https://platform.openai.com
- Create an API key
- Set environment variable: `export OPENAI_API_KEY=sk-...`

**Anthropic:**
- Sign up at https://console.anthropic.com
- Create an API key
- Set environment variable: `export ANTHROPIC_API_KEY=sk-ant-...`

### 2. Configure Provider (Optional)

Edit `~/.config/worklog/config.json`:

```json
{
  "llm": {
    "enabled": false,
    "provider": "openai",
    "model": "gpt-4o-mini"
  }
}
```

## Commands

### LLM Summarization
```bash
worklog --llm
```

**Default Output:**
```markdown
**worklog**: Add productivity analysis feature; Update documentation
```

**LLM Output:**
```markdown
**worklog**: 
I spent the day implementing a new productivity analysis feature that helps users understand their work patterns. The feature analyzes activity data to identify peak working hours and calculate focus time. I also updated the documentation with examples showing how to use the new feature. This involved writing the core analysis logic, creating multiple output formatters, and adding comprehensive tests.
```

### Combine with Smart Clustering
```bash
worklog -x --llm
```

This combines intelligent clustering with LLM summarization for the best results.

## Use Cases

- **Client Reports**: Present work in business-friendly language
- **Performance Reviews**: Create narrative summaries of accomplishments
- **Team Updates**: Share what you did in natural language
- **Personal Reflection**: Get AI-generated insights about your work patterns

## Cost Considerations

- LLM API calls cost money (typically $0.01-0.10 per report depending on volume)
- Use `--llm` selectively, not for every daily report
- Consider using it for weekly/monthly summaries where the value is higher
- `gpt-4o-mini` is cheaper than `gpt-4` but still provides good summaries

## Tips

- Start with `gpt-4o-mini` for cost-effective summaries
- Use `--llm` for important reports (client updates, reviews)
- Combine with `--smart` for best results: `worklog -x --llm`
- The LLM has access to all your work items, so it can create comprehensive summaries
