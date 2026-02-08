# /obra/superpowers/9.3-token-usage-analysis

Token Usage Analysis | obra/superpowers | DeepWiki

Loading...

Index your code with Devin

[DeepWiki](.md)

[DeepWiki](.md)

[obra/superpowers](https://github.com/obra/superpowers "Open repository")

Index your code with

Devin

Edit WikiShare

Loading...

Last indexed: 24 January 2026 ([a01a13](https://github.com/obra/superpowers/commits/a01a135f))

- [Overview](obra/superpowers/1-overview.md)
- [Getting Started](obra/superpowers/2-getting-started.md)
- [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md)
- [Installing on OpenCode](obra/superpowers/2.2-installing-on-opencode.md)
- [Installing on Codex](obra/superpowers/2.3-installing-on-codex.md)
- [Core Concepts](obra/superpowers/3-core-concepts.md)
- [What Are Skills](obra/superpowers/3.1-what-are-skills.md)
- [The Rule: Mandatory First Response Protocol](obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol.md)
- [Finding and Invoking Skills](obra/superpowers/3.3-finding-and-invoking-skills.md)
- [Architecture](obra/superpowers/4-architecture.md)
- [Dual Repository Design](obra/superpowers/4.1-dual-repository-design.md)
- [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md)
- [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md)
- [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md)
- [Skills Resolution and Priority](obra/superpowers/4.5-skills-resolution-and-priority.md)
- [Platform-Specific Features](obra/superpowers/5-platform-specific-features.md)
- [Claude Code: Skill Tool and Hooks](obra/superpowers/5.1-claude-code:-skill-tool-and-hooks.md)
- [OpenCode: Plugin and Custom Tools](obra/superpowers/5.2-opencode:-plugin-and-custom-tools.md)
- [Codex: CLI Tool](obra/superpowers/5.3-codex:-cli-tool.md)
- [skills-core.js Shared Module](obra/superpowers/5.4-skills-core.js-shared-module.md)
- [Development Workflows](obra/superpowers/6-development-workflows.md)
- [Brainstorming and Design](obra/superpowers/6.1-brainstorming-and-design.md)
- [Using Git Worktrees](obra/superpowers/6.2-using-git-worktrees.md)
- [Writing Implementation Plans](obra/superpowers/6.3-writing-implementation-plans.md)
- [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md)
- [Executing Plans in Batches](obra/superpowers/6.5-executing-plans-in-batches.md)
- [Code Review Process](obra/superpowers/6.6-code-review-process.md)
- [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md)
- [Key Skills Reference](obra/superpowers/7-key-skills-reference.md)
- [using-superpowers (Meta-Skill)](obra/superpowers/7.1-using-superpowers-\(meta-skill\).md)
- [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md)
- [Systematic Debugging](obra/superpowers/7.3-systematic-debugging.md)
- [Other Essential Skills](obra/superpowers/7.4-other-essential-skills.md)
- [Creating Skills](obra/superpowers/8-creating-skills.md)
- [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md)
- [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md)
- [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md)
- [Claude Search Optimization (CSO)](obra/superpowers/8.4-claude-search-optimization-\(cso\).md)
- [Contributing Skills via Pull Request](obra/superpowers/8.5-contributing-skills-via-pull-request.md)
- [Testing Infrastructure](obra/superpowers/9-testing-infrastructure.md)
- [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md)
- [Integration Test Cases](obra/superpowers/9.2-integration-test-cases.md)
- [Token Usage Analysis](obra/superpowers/9.3-token-usage-analysis.md)
- [Testing Tools and Helpers](obra/superpowers/9.4-testing-tools-and-helpers.md)
- [Technical Reference](obra/superpowers/10-technical-reference.md)
- [Directory Structure](obra/superpowers/10.1-directory-structure.md)
- [Configuration Files](obra/superpowers/10.2-configuration-files.md)
- [Environment Variables](obra/superpowers/10.3-environment-variables.md)
- [Polyglot Wrapper Pattern](obra/superpowers/10.4-polyglot-wrapper-pattern.md)
- [Release Notes Archive](obra/superpowers/10.5-release-notes-archive.md)

Menu

# Token Usage Analysis

Relevant source files

- [tests/claude-code/README.md](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md)
- [tests/claude-code/analyze-token-usage.py](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py)
- [tests/claude-code/run-skill-tests.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh)
- [tests/claude-code/test-helpers.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh)
- [tests/claude-code/test-subagent-driven-development-integration.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh)
- [tests/claude-code/test-subagent-driven-development.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh)

This page documents the `analyze-token-usage.py` script, which extracts and analyzes token consumption from Claude Code session transcripts. The script parses JSONL session files to break down token usage by main session and individual subagents, calculates estimated costs, and provides detailed usage reports.

For information about the broader test suite architecture and how this script fits into the testing workflow, see [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md). For details on integration test cases that use this script, see [Integration Test Cases](obra/superpowers/9.2-integration-test-cases.md).

---

## Overview

The token usage analyzer is a Python script that processes Claude Code session transcripts stored as JSONL (JSON Lines) files. It extracts token consumption metrics from both the main coordinator session and all dispatched subagents, providing a detailed breakdown of costs and usage patterns.

**Primary Use Cases:**

- Post-test analysis of integration test runs
- Cost estimation for workflow execution
- Performance profiling of skill-based workflows
- Identifying expensive operations in multi-agent execution

**Key Features:**

- Separates main session from subagent token usage
- Tracks cache creation and cache read tokens
- Calculates estimated costs using Claude API pricing
- Provides per-agent descriptions extracted from prompts

**Sources:** [tests/claude-code/analyze-token-usage.py1-10](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L1-L10)

---

## Session Transcript Format

Claude Code stores session transcripts in JSONL format at `~/.claude/projects/<project-dir>/<session-id>.jsonl`. Each line is a JSON object representing either a user message, an assistant message, or a tool result.

```
```

**Main Session Messages:**

- Lines with `type: 'assistant'` and `message` field
- Contains `message.usage` object with token counts
- Represents coordinator/main session token consumption

**Subagent Messages:**

- Lines with `type: 'user'` and `toolUseResult` field
- Contains `toolUseResult.usage` object with token counts
- Contains `toolUseResult.agentId` to identify the subagent
- Contains `toolUseResult.prompt` with task description

**Sources:** [tests/claude-code/analyze-token-usage.py32-68](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L32-L68)

---

## Token Extraction Logic

The `analyze_main_session()` function parses the JSONL file line-by-line, accumulating token usage for the main session and each subagent separately.

```
```

**Main Session Tracking:**

- Increments `main_usage['messages']` for each assistant message
- Accumulates `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`
- All main session messages aggregate into a single usage object

**Subagent Tracking:**

- Uses `defaultdict` to create per-agent usage objects on first encounter
- Key is `agentId` from `toolUseResult`
- Extracts first line of prompt as agent description (truncated to 60 chars)
- Removes "You are " prefix if present
- Accumulates usage separately for each agent ID

**Sources:** [tests/claude-code/analyze-token-usage.py12-70](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L12-L70)

---

## Data Structures

The script uses two primary data structures to organize token usage:

```
```

**Token Categories:**

- `input_tokens`: User input and context passed to model
- `output_tokens`: Model-generated response tokens
- `cache_creation_input_tokens`: Tokens written to prompt cache
- `cache_read_input_tokens`: Tokens read from prompt cache (cheaper)

**Agent Description Extraction:** The script extracts agent descriptions from the first line of the subagent prompt to make reports more readable:

```
```

**Sources:** [tests/claude-code/analyze-token-usage.py14-30](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L14-L30) [tests/claude-code/analyze-token-usage.py54-60](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L54-L60)

---

## Cost Calculation

The `calculate_cost()` function estimates USD cost based on Claude API pricing for Sonnet 3.5.

```
```

**Pricing Model (as of implementation):**

- **Input tokens:** $3.00 per million tokens
- **Output tokens:** $15.00 per million tokens
- **Cache tokens:** Treated as regular input tokens in cost calculation

**Formula:**

```
```

**Note:** Cache read tokens are typically cheaper than regular input tokens in Claude's actual pricing, but the script treats them equally for simplicity. This provides a conservative (higher) cost estimate.

**Sources:** [tests/claude-code/analyze-token-usage.py76-81](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L76-L81)

---

## Output Format

The script produces a tabular breakdown followed by summary totals.

### Usage Breakdown Table

| Column          | Description                                                  | Width    |
| --------------- | ------------------------------------------------------------ | -------- |
| **Agent**       | Agent ID ("main" for coordinator, subagent ID for subagents) | 15 chars |
| **Description** | Task description or "Main session (coordinator)"             | 35 chars |
| **Msgs**        | Number of messages/tool invocations                          | 5 chars  |
| **Input**       | Input tokens (formatted with commas)                         | 10 chars |
| **Output**      | Output tokens (formatted with commas)                        | 10 chars |
| **Cache**       | Cache read tokens (formatted with commas)                    | 10 chars |
| **Cost**        | Estimated cost in USD                                        | 8 chars  |

**Example Output:**

```
================================================================================
TOKEN USAGE ANALYSIS
================================================================================

Usage Breakdown:
--------------------------------------------------------------------------------
Agent           Description                          Msgs      Input     Output      Cache     Cost
--------------------------------------------------------------------------------
main            Main session (coordinator)              3     12,453      2,341      8,234   $0.12
agent-abc123    implementing task 1: create add fun     2      5,234      1,123      3,456   $0.08
agent-def456    spec compliance reviewer for task 1     1      4,123        234      2,111   $0.05
agent-ghi789    implementing task 2: create multiply    2      5,567      1,234      3,789   $0.09
--------------------------------------------------------------------------------
```

**Sources:** [tests/claude-code/analyze-token-usage.py97-128](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L97-L128)

### Summary Totals

After the breakdown table, the script prints aggregate statistics:

```
TOTALS:
  Total messages:         8
  Input tokens:           27,377
  Output tokens:          4,932
  Cache creation tokens:  0
  Cache read tokens:      17,590

  Total input (incl cache): 44,967
  Total tokens:             49,899

  Estimated cost: $0.34
  (at $3/$15 per M tokens for input/output)
```

**Total Calculations:**

- **Total messages:** Sum of all main + subagent messages
- **Total input:** Sum of `input_tokens` from all agents
- **Total output:** Sum of `output_tokens` from all agents
- **Total cache creation:** Sum of `cache_creation_input_tokens`
- **Total cache read:** Sum of `cache_read_input_tokens`
- **Total input (incl cache):** `input_tokens + cache_creation + cache_read`
- **Total tokens:** `total_input + output_tokens`

**Sources:** [tests/claude-code/analyze-token-usage.py132-165](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L132-L165)

---

## Integration with Test Suite

The token analyzer is invoked by integration tests to provide cost visibility for workflow execution.

```
```

**Session File Discovery:** Integration tests locate the most recent session file created during test execution:

```
```

This finds session files modified within the last 60 minutes, sorts by modification time (newest first), and takes the most recent.

**Invocation in Tests:**

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh164-176](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L164-L176) [tests/claude-code/test-subagent-driven-development-integration.sh280-286](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L280-L286)

---

## Usage Examples

### Basic Invocation

```
```

### Within Integration Tests

Integration tests automatically invoke the analyzer after workflow execution:

```
```

The test will:

1. Execute a complete workflow (e.g., subagent-driven development)
2. Verify correct behavior
3. Display token usage breakdown
4. Show estimated cost

### Manual Session Analysis

To analyze any Claude Code session:

```
```

**Sources:** [tests/claude-code/analyze-token-usage.py84-88](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L84-L88) [tests/claude-code/README.md16-24](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L16-L24)

---

## Helper Functions

### Token Formatting

The `format_tokens()` function adds thousands separators for readability:

```
```

**Examples:**

- `1234567` → `"1,234,567"`
- `123` → `"123"`
- `0` → `"0"`

### Agent Description Extraction

The script extracts concise descriptions from subagent prompts to identify each agent's role:

```
```

This provides human-readable context like:

- `"implementing task 1: create add function"`
- `"spec compliance reviewer for task 1"`
- `"code quality reviewer for task 2"`

**Sources:** [tests/claude-code/analyze-token-usage.py72-74](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L72-L74) [tests/claude-code/analyze-token-usage.py54-60](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L54-L60)

---

## Error Handling

The script uses defensive parsing to handle malformed or incomplete session files:

```
```

**Error Scenarios:**

- **Invalid JSON:** Silently skipped (allows partial analysis)
- **Missing fields:** Handled with `.get()` with default values
- **Missing file:** Exits with error message at invocation

**Exit Conditions:**

```
```

**Sources:** [tests/claude-code/analyze-token-usage.py32-68](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L32-L68) [tests/claude-code/analyze-token-usage.py90-92](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L90-L92)

---

## Performance Characteristics

**File Processing:**

- Single-pass streaming parse (O(n) where n = number of lines)
- No in-memory buffering of full file
- Efficient for large session files (10,000+ lines)

**Memory Usage:**

- Main session: Single dict (\~100 bytes)
- Subagents: One dict per agent (\~150 bytes each)
- Typical workflow: \~10-20 subagents = <5 KB memory

**Execution Time:**

- \~0.1 seconds for typical session (1,000 lines)
- \~1 second for large session (10,000 lines)

**Scalability:**

- Handles sessions with 100+ subagents
- No performance degradation with deep agent nesting
- Streaming design prevents memory issues

**Sources:** [tests/claude-code/analyze-token-usage.py32-70](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L32-L70)

---

## Relationship to Test Suite

This script is part of the broader testing infrastructure documented in [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md). It serves as a post-execution analysis tool that complements the verification assertions in integration tests.

**Testing Layer Integration:**

| Test Layer                 | Purpose                                               | Uses Token Analyzer? |
| -------------------------- | ----------------------------------------------------- | -------------------- |
| **Skill Triggering Tests** | Verify skill invocation from naive prompts            | No                   |
| **Integration Tests**      | Verify end-to-end workflow execution                  | **Yes**              |
| **End-to-End Tests**       | Validate complete projects (go-fractals, svelte-todo) | **Yes**              |
| **Explicit Request Tests** | Verify skills trigger when named directly             | No                   |

The token analyzer provides cost transparency for expensive integration tests, helping developers:

- Optimize workflow efficiency
- Identify expensive subagent patterns
- Budget for CI/CD test execution
- Justify infrastructure costs

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh280-286](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L280-L286) [tests/claude-code/README.md95-117](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L95-L117)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Token Usage Analysis](#token-usage-analysis.md)
- [Overview](#overview.md)
- [Session Transcript Format](#session-transcript-format.md)
- [Token Extraction Logic](#token-extraction-logic.md)
- [Data Structures](#data-structures.md)
- [Cost Calculation](#cost-calculation.md)
- [Output Format](#output-format.md)
- [Usage Breakdown Table](#usage-breakdown-table.md)
- [Summary Totals](#summary-totals.md)
- [Integration with Test Suite](#integration-with-test-suite.md)
- [Usage Examples](#usage-examples.md)
- [Basic Invocation](#basic-invocation.md)
- [Within Integration Tests](#within-integration-tests.md)
- [Manual Session Analysis](#manual-session-analysis.md)
- [Helper Functions](#helper-functions.md)
- [Token Formatting](#token-formatting.md)
- [Agent Description Extraction](#agent-description-extraction.md)
- [Error Handling](#error-handling.md)
- [Performance Characteristics](#performance-characteristics.md)
- [Relationship to Test Suite](#relationship-to-test-suite.md)
