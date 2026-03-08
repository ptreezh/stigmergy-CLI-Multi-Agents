# Stigmergy Auto-Evolution Quick Start Guide

## Quick Start

### 1. Collaborative Evolution (Recommended)

Run tasks with multiple CLIs simultaneously:

```bash
# Basic usage
stigmergy concurrent "Analyze the code quality of src/index.js"

# With specific number of CLIs
stigmergy concurrent -c 2 "Review the architecture"

# With timeout
stigmergy concurrent -t 60000 "Generate documentation"
```

**What happens**:
1. Stigmergy launches multiple CLIs in parallel (qwen, codebuddy, etc.)
2. Each CLI works on the task independently
3. System automatically extracts experiences from their sessions
4. Insights are integrated into shared memory (STIGMERGY.md)
5. PROJECT_STATUS.md is updated with latest results

### 2. Check Evolution Progress

```bash
# View shared mission and goals
cat SOUL.md

# View conversation history and insights
cat STIGMERGY.md | tail -100

# Check project status
cat .stigmergy/status/PROJECT_STATUS.md
```

### 3. Manual Memory Extraction (Optional)

If you've been using CLIs individually and want to integrate those sessions:

```bash
# This will extract experiences from recent CLI sessions
stigmergy concurrent "Run integration task"
```

The concurrent command automatically absorbs experiences from previous individual sessions.

## Advanced Usage

### Specify Execution Mode

```bash
# Parallel mode (default) - all CLIs run simultaneously
stigmergy concurrent --mode parallel "Task description"

# Sequential mode - CLIs run one after another
stigmergy concurrent --mode sequential "Task description"
```

### Adjust Concurrency Level

```bash
# Run with 2 CLIs
stigmergy concurrent -c 2 "Task description"

# Run with 5 CLIs (if available)
stigmergy concurrent -c 5 "Task description"
```

### Verbose Output

```bash
# See detailed execution logs
stigmergy concurrent --verbose "Task description"
```

## How It Works

```
Individual CLI Sessions (qwen, codebuddy, etc.)
          ↓
   Accumulate experiences
          ↓
   stigmergy concurrent
          ↓
   Extract insights from sessions
          ↓
   Update STIGMERGY.md
          ↓
   Align with SOUL.md goals
          ↓
   Collaborative evolution achieved! ✅
```

## Examples

### Code Review with Multiple Perspectives

```bash
stigmergy concurrent "Review src/core/soul_engine/SoulEngine.js for:
1. Code quality issues
2. Performance bottlenecks
3. Security vulnerabilities
4. Improvement suggestions"
```

### Architecture Discussion

```bash
stigmergy concurrent -c 3 "Analyze the current architecture and suggest:
1. How to improve modularity
2. How to enhance scalability
3. How to reduce complexity"
```

### Bug Hunt

```bash
stigmergy concurrent "Find potential bugs in:
1. Error handling
2. Edge cases
3. Race conditions
4. Resource leaks"
```

## Tips

1. **Run regular concurrent sessions** - Even for simple tasks, this helps build shared knowledge
2. **Check STIGMERGY.md often** - See what insights have been accumulated
3. **Review SOUL.md periodically** - Ensure evolution goals are still relevant
4. **Use descriptive prompts** - More context leads to better insights
5. **Experiment with different CLIs** - Each CLI has unique strengths

## Troubleshooting

### "No CLIs available"
- Run `stigmergy scan` to detect available CLI tools
- Install CLI tools using `stigmergy install <cli-name>`

### "STIGMERGY.md not being updated"
- Check file permissions
- Ensure you're in a git repository
- Try running with `--verbose` to see detailed logs

### "Experiences not being extracted"
- This is expected for individual CLI sessions
- Use `stigmergy concurrent` to trigger experience extraction
- Check if CLI sessions have enough content (min 5 seconds duration)

## Best Practices

1. **Start with concurrent** - Always use `stigmergy concurrent` for important tasks
2. **Review insights regularly** - Check STIGMERGY.md for accumulated knowledge
3. **Update SOUL.md** - Keep evolution goals aligned with project needs
4. **Share findings** - Use STIGMERGY.md as team knowledge base
5. **Iterate** - Run multiple concurrent sessions to refine insights

## Current Limitations

- Individual CLI sessions (e.g., `qwen "task"`) don't auto-update memory
- Automatic memory extraction only works via `stigmergy concurrent`
- Not all CLI tools support the same features

## Status

For detailed technical status, see `AUTO_EVOLUTION_STATUS.md`.
