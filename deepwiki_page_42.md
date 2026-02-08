# /obra/superpowers/9.1-test-suite-architecture

Test Suite Architecture | obra/superpowers | DeepWiki

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

# Test Suite Architecture

Relevant source files

- [tests/claude-code/README.md](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md)
- [tests/claude-code/analyze-token-usage.py](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py)
- [tests/claude-code/run-skill-tests.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh)
- [tests/claude-code/test-helpers.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh)
- [tests/claude-code/test-subagent-driven-development-integration.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh)
- [tests/claude-code/test-subagent-driven-development.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh)
- [tests/subagent-driven-dev/go-fractals/design.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md)
- [tests/subagent-driven-dev/go-fractals/plan.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/plan.md)
- [tests/subagent-driven-dev/go-fractals/scaffold.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/scaffold.sh)
- [tests/subagent-driven-dev/run-test.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh)
- [tests/subagent-driven-dev/svelte-todo/design.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md)
- [tests/subagent-driven-dev/svelte-todo/plan.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/plan.md)
- [tests/subagent-driven-dev/svelte-todo/scaffold.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh)

This page documents the automated testing infrastructure for validating skills and workflows in the superpowers system. The test suite verifies that skills are loaded correctly, agents follow skill instructions, and entire workflows execute successfully.

For detailed documentation of specific test cases, see [Integration Test Cases](obra/superpowers/9.2-integration-test-cases.md). For token cost analysis tools, see [Token Usage Analysis](obra/superpowers/9.3-token-usage-analysis.md). For helper functions and utilities, see [Testing Tools and Helpers](obra/superpowers/9.4-testing-tools-and-helpers.md).

## Overview

The test suite consists of two distinct test types:

1. **Fast Tests (Query Understanding)** - Verify that Claude can load and understand skill content (\~30-60 seconds per test)
2. **Integration Tests (Full Execution)** - Execute complete workflows and verify end-to-end behavior (\~10-30 minutes per test)

Both test types run through the Claude Code CLI in headless mode (`claude -p`) and verify behavior by analyzing outputs and session transcripts.

**Sources:** [tests/claude-code/README.md1-10](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L1-L10)

## Test Suite Structure

```
```

**Sources:** [tests/claude-code/run-skill-tests.sh1-93](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L1-L93) [tests/claude-code/test-helpers.sh1-203](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L1-L203) [tests/claude-code/README.md42-80](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L42-L80)

## Test Types and Purpose

### Fast Tests: Query Understanding

Fast tests verify that skills are loaded and Claude understands their content. They run queries against Claude and check for expected patterns in responses.

| Test File                             | Duration    | Purpose                                                                                                                                                          |
| ------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test-subagent-driven-development.sh` | \~2 minutes | Verify skill loading, workflow order, self-review requirements, plan reading efficiency, spec compliance reviewer behavior, review loops, task context provision |

**Test Pattern:**

```
1. Run query via run_claude()
2. Assert expected patterns with assert_contains()
3. Assert workflow ordering with assert_order()
4. Assert absence of anti-patterns with assert_not_contains()
```

**Example Verification (Spec Compliance Before Code Quality):** [tests/claude-code/test-subagent-driven-development.sh34-41](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh#L34-L41) uses `assert_order()` to verify that "spec.\*compliance" appears before "code.\*quality" in Claude's response.

**Sources:** [tests/claude-code/test-subagent-driven-development.sh1-140](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh#L1-L140) [tests/claude-code/README.md83-94](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L83-L94)

### Integration Tests: Full Execution

Integration tests create real projects, execute complete workflows, and verify the actual implementation. They analyze session transcripts to validate specific behaviors.

| Test File                                         | Duration        | Creates                          | Executes                                  | Verifies                                                                                                                   |
| ------------------------------------------------- | --------------- | -------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `test-subagent-driven-development-integration.sh` | \~10-30 minutes | Node.js project with 2-task plan | Full subagent-driven-development workflow | Plan read once, full task text provided, self-review performed, spec compliance before code quality, working code produced |

**Test Pattern:**

```
1. Create test project with create_test_project()
2. Set up project structure (package.json, src/, test/, docs/plans/)
3. Write implementation plan
4. Execute workflow via Claude CLI
5. Analyze session transcript JSONL
6. Verify behaviors by grepping session file
7. Verify implementation works (run tests, check git commits)
8. Analyze token usage with analyze-token-usage.py
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh1-315](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L1-L315) [tests/claude-code/README.md95-118](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L95-L118)

## Test Execution Flow

```
```

**Sources:** [tests/claude-code/run-skill-tests.sh99-164](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L99-L164) [tests/claude-code/test-helpers.sh4-29](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L4-L29) [tests/claude-code/test-subagent-driven-development-integration.sh118-158](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L118-L158)

## Test Runner Commands

The `run-skill-tests.sh` script provides flexible test execution:

| Command                                    | Purpose                            |
| ------------------------------------------ | ---------------------------------- |
| `./run-skill-tests.sh`                     | Run all fast tests (default)       |
| `./run-skill-tests.sh --integration`       | Run fast tests + integration tests |
| `./run-skill-tests.sh --test test-name.sh` | Run specific test only             |
| `./run-skill-tests.sh --verbose`           | Show full Claude output            |
| `./run-skill-tests.sh --timeout 1800`      | Set custom timeout (seconds)       |

**Test Selection Logic:** [tests/claude-code/run-skill-tests.sh74-92](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L74-L92) defines two arrays: `tests[]` for fast tests and `integration_tests[]` for slow tests. The `--integration` flag appends integration tests to the execution list.

**Sources:** [tests/claude-code/run-skill-tests.sh25-72](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L25-L72) [tests/claude-code/README.md14-40](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L14-L40)

## Helper Functions Reference

The [tests/claude-code/test-helpers.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh) module provides reusable test utilities:

### Claude Execution

```
run_claude(prompt, timeout, allowed_tools)
```

Executes Claude Code CLI in headless mode with the given prompt. Returns output or exit code on failure.

**Implementation:** [tests/claude-code/test-helpers.sh4-29](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L4-L29)

### Assertion Functions

| Function              | Parameters                         | Purpose                                 |
| --------------------- | ---------------------------------- | --------------------------------------- |
| `assert_contains`     | `output, pattern, name`            | Verify pattern exists in output         |
| `assert_not_contains` | `output, pattern, name`            | Verify pattern absent from output       |
| `assert_count`        | `output, pattern, count, name`     | Verify exact count of pattern           |
| `assert_order`        | `output, patternA, patternB, name` | Verify patternA appears before patternB |

**Implementations:** [tests/claude-code/test-helpers.sh32-123](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L32-L123)

### Project Setup

| Function               | Parameters  | Purpose                                |
| ---------------------- | ----------- | -------------------------------------- |
| `create_test_project`  | none        | Create temp directory for test project |
| `cleanup_test_project` | `dir`       | Remove test project directory          |
| `create_test_plan`     | `dir, name` | Generate sample implementation plan    |

**Implementations:** [tests/claude-code/test-helpers.sh125-192](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L125-L192)

**Sources:** [tests/claude-code/test-helpers.sh1-203](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L1-L203) [tests/claude-code/README.md42-52](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L42-L52)

## Session Transcript Analysis

Integration tests analyze Claude Code session transcripts stored as JSONL files at `~/.claude/projects/<working-dir>/<session-id>.jsonl`. Each line is a JSON object representing a message or tool use.

### Verification Patterns

Integration tests grep for specific patterns in session transcripts:

| Pattern                                                             | Meaning                 | Example Code                                                                                                                                                                                              |
| ------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"name":"Skill".*"skill":"superpowers:subagent-driven-development"` | Skill tool was invoked  | [tests/claude-code/test-subagent-driven-development-integration.sh188-194](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L188-L194) |
| `"name":"Task"`                                                     | Subagent was dispatched | [tests/claude-code/test-subagent-driven-development-integration.sh198-206](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L198-L206) |
| `"name":"TodoWrite"`                                                | Task tracking was used  | [tests/claude-code/test-subagent-driven-development-integration.sh209-217](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L209-L217) |

### Session File Location

The test finds the session file by:

1. Constructing expected directory from working directory: `~/.claude/projects/-<escaped-path>/`
2. Finding most recent `.jsonl` file modified within last 60 minutes
3. Failing if no session file found

**Implementation:** [tests/claude-code/test-subagent-driven-development-integration.sh163-179](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L163-L179)

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh163-219](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L163-L219)

## Token Usage Analysis

The `analyze-token-usage.py` script parses session transcripts to break down token usage by agent:

```
```

### Data Collection

The analyzer extracts token usage from two types of JSON objects:

1. **Main session messages:** [tests/claude-code/analyze-token-usage.py37-44](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L37-L44)

   - Type: `"type": "assistant"`
   - Usage in: `data['message']['usage']`

2. **Subagent tool results:** [tests/claude-code/analyze-token-usage.py46-66](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L46-L66)

   - Type: `"type": "user"` with `"toolUseResult"`
   - Usage in: `data['toolUseResult']['usage']`
   - Agent ID: `data['toolUseResult']['agentId']`

### Output Format

The analyzer produces a table showing token usage per agent:

```
Agent           Description                           Msgs      Input     Output      Cache      Cost
main            Main session (coordinator)              12     45,123     12,456      8,901    $0.45
agent-1         Implementer for Task 1                   8     23,456      6,789      4,567    $0.23
agent-2         Spec compliance reviewer                 4     12,345      3,210      2,345    $0.12
...
```

**Implementation:** [tests/claude-code/analyze-token-usage.py102-128](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L102-L128)

**Sources:** [tests/claude-code/analyze-token-usage.py1-169](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L1-L169) [tests/claude-code/test-subagent-driven-development-integration.sh280-286](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L280-L286)

## Integration Test Verification Matrix

Integration tests verify multiple aspects of workflow execution:

| Verification           | Test Method                 | Success Criteria                       | Code Reference                                                                                                                                                                                            |
| ---------------------- | --------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill invoked          | Grep session JSONL          | `"name":"Skill"` found                 | [tests/claude-code/test-subagent-driven-development-integration.sh188-194](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L188-L194) |
| Subagents dispatched   | Count `Task` tool uses      | `>= 2` subagents                       | [tests/claude-code/test-subagent-driven-development-integration.sh198-206](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L198-L206) |
| Task tracking          | Count `TodoWrite` uses      | `>= 1` tracking update                 | [tests/claude-code/test-subagent-driven-development-integration.sh209-217](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L209-L217) |
| Implementation created | Check file exists           | `src/math.js` present                  | [tests/claude-code/test-subagent-driven-development-integration.sh221-240](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L221-L240) |
| Tests created          | Check file exists           | `test/math.test.js` present            | [tests/claude-code/test-subagent-driven-development-integration.sh242-247](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L242-L247) |
| Tests pass             | Run `npm test`              | Exit code 0                            | [tests/claude-code/test-subagent-driven-development-integration.sh250-256](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L250-L256) |
| Git commits            | Count commits               | `> 2` commits (initial + task commits) | [tests/claude-code/test-subagent-driven-development-integration.sh260-268](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L260-L268) |
| No extra features      | Grep for unwanted functions | No `divide`, `power`, `subtract`       | [tests/claude-code/test-subagent-driven-development-integration.sh271-278](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L271-L278) |

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh181-279](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L181-L279)

## Test Project Structure

Integration tests create temporary projects with realistic structures:

```
/tmp/test-XXXX/
├── package.json           # Node.js project config
├── docs/
│   └── plans/
│       └── implementation-plan.md  # Task definitions
├── src/                   # Implementation files
│   └── math.js
├── test/                  # Test files
│   └── math.test.js
└── .git/                  # Git repository
```

The implementation plan follows the standard format documented in [Writing Implementation Plans](obra/superpowers/6.3-writing-implementation-plans.md):

- Task-based structure with clear sections
- File paths, requirements, implementation code
- Test requirements per task
- Verification commands

**Example:** [tests/claude-code/test-subagent-driven-development-integration.sh48-105](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L48-L105) creates a 2-task plan for testing the workflow.

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh24-113](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L24-L113)

## Timeout Configuration

Tests use timeouts to prevent hanging:

| Test Type                  | Default Timeout       | Configurable Via     | Purpose                 |
| -------------------------- | --------------------- | -------------------- | ----------------------- |
| Fast test query            | 30 seconds            | `run_claude()` param | Quick skill queries     |
| Fast test overall          | 60 seconds            | `run_claude()` param | Longer queries          |
| Integration test execution | 1800 seconds (30 min) | `timeout` command    | Full workflow execution |
| Test runner per-test       | 300 seconds (5 min)   | `--timeout` flag     | Default per-test limit  |

**Fast Test Example:** [tests/claude-code/test-subagent-driven-development.sh15](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh#L15-L15) calls `run_claude()` with 30-second timeout.

**Integration Test Example:** [tests/claude-code/test-subagent-driven-development-integration.sh152](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L152-L152) uses `timeout 1800` for full workflow execution.

**Test Runner:** [tests/claude-code/run-skill-tests.sh28](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L28-L28) sets default `TIMEOUT=300`, overridable with `--timeout` flag.

**Sources:** [tests/claude-code/test-helpers.sh5-9](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L5-L9) [tests/claude-code/test-subagent-driven-development-integration.sh152](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L152-L152) [tests/claude-code/run-skill-tests.sh28-44](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L28-L44)

## Exit Codes and Status Reporting

Tests use standard Unix exit codes for pass/fail:

- **Exit 0:** All tests passed
- **Exit 1:** One or more tests failed
- **Exit 124:** Test timed out

The test runner aggregates results and reports summary:

```
========================================
 Test Results Summary
========================================

  Passed:  3
  Failed:  1
  Skipped: 0

STATUS: FAILED
```

**Summary Logic:** [tests/claude-code/run-skill-tests.sh165-187](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L165-L187) tracks `passed`, `failed`, and `skipped` counters throughout execution, then exits with 0 or 1 based on `$failed` count.

**Sources:** [tests/claude-code/run-skill-tests.sh94-187](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L94-L187)

## Verbose Mode

The `--verbose` flag controls output verbosity:

| Mode                  | Behavior                            | Use Case                               |
| --------------------- | ----------------------------------- | -------------------------------------- |
| Normal                | Show only failed test output        | CI/CD, quick validation                |
| Verbose (`--verbose`) | Show all Claude output in real-time | Debugging, understanding test behavior |

**Implementation:** [tests/claude-code/run-skill-tests.sh120-160](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L120-L160)

- Verbose: Direct output to stdout
- Normal: Capture output, only print on failure

**Sources:** [tests/claude-code/run-skill-tests.sh26-27](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L26-L27) [tests/claude-code/run-skill-tests.sh120-160](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L120-L160) [tests/claude-code/README.md135-140](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L135-L140)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Test Suite Architecture](#test-suite-architecture.md)
- [Overview](#overview.md)
- [Test Suite Structure](#test-suite-structure.md)
- [Test Types and Purpose](#test-types-and-purpose.md)
- [Fast Tests: Query Understanding](#fast-tests-query-understanding.md)
- [Integration Tests: Full Execution](#integration-tests-full-execution.md)
- [Test Execution Flow](#test-execution-flow.md)
- [Test Runner Commands](#test-runner-commands.md)
- [Helper Functions Reference](#helper-functions-reference.md)
- [Claude Execution](#claude-execution.md)
- [Assertion Functions](#assertion-functions.md)
- [Project Setup](#project-setup.md)
- [Session Transcript Analysis](#session-transcript-analysis.md)
- [Verification Patterns](#verification-patterns.md)
- [Session File Location](#session-file-location.md)
- [Token Usage Analysis](#token-usage-analysis.md)
- [Data Collection](#data-collection.md)
- [Output Format](#output-format.md)
- [Integration Test Verification Matrix](#integration-test-verification-matrix.md)
- [Test Project Structure](#test-project-structure.md)
- [Timeout Configuration](#timeout-configuration.md)
- [Exit Codes and Status Reporting](#exit-codes-and-status-reporting.md)
- [Verbose Mode](#verbose-mode.md)
