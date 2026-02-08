# /obra/superpowers/9-testing-infrastructure

Testing Infrastructure | obra/superpowers | DeepWiki

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

# Testing Infrastructure

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [tests/claude-code/README.md](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md)
- [tests/claude-code/analyze-token-usage.py](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py)
- [tests/claude-code/run-skill-tests.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh)
- [tests/claude-code/test-helpers.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh)
- [tests/claude-code/test-subagent-driven-development-integration.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh)
- [tests/claude-code/test-subagent-driven-development.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh)

## Purpose and Scope

This document covers the automated testing infrastructure for validating superpowers skills and workflows. The test system operates at two levels: **fast tests** that verify skill content and requirements (2-5 minutes), and **integration tests** that execute complete workflows end-to-end (10-30 minutes).

For information about testing methodology used when *writing* skills (TDD, pressure scenarios), see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md) and [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md). This page focuses on the automated test infrastructure itself.

---

## Test System Architecture

The testing infrastructure comprises two distinct test suites located in different directories, each with its own runner and purpose.

### Overview Diagram

```
```

**Sources:** [tests/claude-code/README.md1-159](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L1-L159) [tests/claude-code/run-skill-tests.sh1-188](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L1-L188) [tests/subagent-driven-dev/run-test.sh1-106](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L1-L106)

---

## Fast Test Suite

Fast tests verify that skills are loaded correctly and contain expected requirements without executing full workflows. These run in under 5 minutes and are suitable for continuous integration.

### Test Execution Flow

```
```

**Sources:** [tests/claude-code/run-skill-tests.sh99-163](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L99-L163) [tests/claude-code/test-helpers.sh1-202](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L1-L202)

### Test Helper Functions

The `test-helpers.sh` module provides assertion functions that wrap Claude CLI invocation and output verification:

| Function               | Parameters                                 | Purpose                                          |
| ---------------------- | ------------------------------------------ | ------------------------------------------------ |
| `run_claude`           | prompt, timeout, allowed\_tools            | Execute Claude CLI in headless mode with timeout |
| `assert_contains`      | output, pattern, test\_name                | Verify pattern exists in output                  |
| `assert_not_contains`  | output, pattern, test\_name                | Verify pattern absent from output                |
| `assert_count`         | output, pattern, count, test\_name         | Verify exact occurrence count                    |
| `assert_order`         | output, pattern\_a, pattern\_b, test\_name | Verify pattern\_a appears before pattern\_b      |
| `create_test_project`  | -                                          | Create temporary test directory                  |
| `create_test_plan`     | project\_dir, plan\_name                   | Generate simple plan file                        |
| `cleanup_test_project` | test\_dir                                  | Remove test directory                            |

**Sources:** [tests/claude-code/test-helpers.sh4-202](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L4-L202)

### Example: test-subagent-driven-development.sh

This fast test verifies the skill contains correct workflow requirements:

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development.sh1-140](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh#L1-L140)

---

## Integration Test Suite

Integration tests execute complete workflows with real implementation plans, verifying that skills produce working code. These tests take 10-30 minutes and validate end-to-end behavior.

### test-subagent-driven-development-integration.sh

This integration test creates a real Node.js project, executes a 2-task implementation plan, and verifies the workflow:

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh1-315](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L1-L315)

### Verification Tests

The integration test performs eight verification checks:

| Test                         | Verification Method                                                              | Purpose                                    |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| Test 1: Skill invoked        | `grep '"name":"Skill".*"superpowers:subagent-driven-development"' session.jsonl` | Confirms skill was loaded and used         |
| Test 2: Subagents dispatched | Count `"name":"Task"` occurrences (expect ≥2)                                    | Verifies subagent-driven execution         |
| Test 3: Task tracking        | Count `"name":"TodoWrite"` occurrences (expect ≥1)                               | Confirms plan tracking system used         |
| Test 6: Implementation works | Check files exist, run `npm test`                                                | Validates working code produced            |
| Test 7: Git commits          | Count commits (expect >2)                                                        | Ensures proper workflow commits            |
| Test 8: No extra features    | `grep` for forbidden functions (divide, power, subtract)                         | Tests spec compliance review effectiveness |

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh182-278](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L182-L278)

---

## Test Projects: Scaffolding System

Integration tests use scaffolding scripts to create realistic test projects with implementation plans. Two reference projects are provided.

### Scaffolding Architecture

```
```

**Sources:** [tests/subagent-driven-dev/svelte-todo/scaffold.sh1-47](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L1-L47) [tests/subagent-driven-dev/go-fractals/scaffold.sh1-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/scaffold.sh#L1-L46)

### Test Project Characteristics

**Svelte Todo (12 tasks):**

- Full-stack web application with Svelte + TypeScript
- Tests: Vitest (unit) + Playwright (E2E)
- Features: localStorage persistence, filtering, CRUD operations
- Complexity: Component hierarchy, state management, async persistence

**Go Fractals (10 tasks):**

- CLI tool with Cobra framework
- Tests: Go standard testing
- Features: Sierpinski triangle + Mandelbrot set ASCII rendering
- Complexity: Algorithm implementation, flag parsing, recursive functions

**Sources:** [tests/subagent-driven-dev/svelte-todo/plan.md1-223](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/plan.md#L1-L223) [tests/subagent-driven-dev/go-fractals/plan.md1-173](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/plan.md#L1-L173)

---

## Token Usage Analysis

The `analyze-token-usage.py` script parses Claude session transcripts to measure token consumption and cost, breaking down usage by main session and individual subagents.

### Analysis Flow

```
```

**Sources:** [tests/claude-code/analyze-token-usage.py1-169](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L1-L169)

### Usage Extraction Logic

The analyzer processes two event types from the session transcript:

**Main Session Messages** ([tests/claude-code/analyze-token-usage.py38-44](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L38-L44)):

```
```

**Subagent Tool Results** ([tests/claude-code/analyze-token-usage.py47-66](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L47-L66)):

```
```

### Output Format

The script produces a table with per-agent breakdown and totals:

```
================================================================================================
Agent           Description                          Msgs      Input     Output      Cache     Cost
------------------------------------------------------------------------------------------------
main            Main session (coordinator)              5     12,450      3,200      8,100  $115.50
agent-abc123    Implementer for Task 1: Create Add F    3      4,200      1,100      2,800   $36.30
agent-def456    Spec compliance reviewer                2      3,800        450      2,100   $28.35
------------------------------------------------------------------------------------------------

TOTALS:
  Total messages:         10
  Input tokens:           20,450
  Output tokens:          4,750
  ...
  Estimated cost: $180.15
```

**Sources:** [tests/claude-code/analyze-token-usage.py97-165](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L97-L165)

---

## Running Tests

### Command-Line Interface

**Fast tests only (default):**

```
```

**Include integration tests:**

```
```

**Specific test:**

```
```

**Verbose output:**

```
```

**Custom timeout:**

```
```

**Sources:** [tests/claude-code/run-skill-tests.sh31-72](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L31-L72)

### Subagent-Driven-Dev Test Runner

The alternative test runner in `tests/subagent-driven-dev/` executes integration tests with different scaffolding projects:

```
```

This runner:

1. Creates timestamped output directory: `/tmp/superpowers-tests/<timestamp>/subagent-driven-development/<test-name>/`
2. Scaffolds the project by calling `<test-name>/scaffold.sh`
3. Runs Claude CLI with the implementation plan
4. Captures output in stream-json format for token analysis

**Sources:** [tests/subagent-driven-dev/run-test.sh1-106](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L1-L106)

---

## Test Environment Requirements

### Prerequisites

| Requirement     | Verification Command | Purpose                        |
| --------------- | -------------------- | ------------------------------ |
| Claude Code CLI | `claude --version`   | Execute tests in headless mode |
| Node.js         | `node --version`     | Run Node.js test projects      |
| Go              | `go version`         | Run Go test projects           |
| Python 3        | `python3 --version`  | Token usage analysis           |
| jq (optional)   | `jq --version`       | Parse JSON logs                |
| Git             | `git --version`      | Test project initialization    |

**Sources:** [tests/claude-code/run-skill-tests.sh18-23](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L18-L23) [tests/claude-code/README.md9-12](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L9-L12)

### Session Transcript Location

Integration tests locate session transcripts at:

```
~/.claude/projects/<working-dir-escaped>/<session-id>.jsonl
```

Where `<working-dir-escaped>` is the working directory path with `/` replaced by `-` and leading `-` removed.

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh164-176](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L164-L176)

---

## Test Execution Mapping

### Test Suite to Code Entity Mapping

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh118-158](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L118-L158) [tests/claude-code/test-helpers.sh4-29](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L4-L29) [tests/claude-code/analyze-token-usage.py12-70](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L12-L70)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Testing Infrastructure](#testing-infrastructure.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Test System Architecture](#test-system-architecture.md)
- [Overview Diagram](#overview-diagram.md)
- [Fast Test Suite](#fast-test-suite.md)
- [Test Execution Flow](#test-execution-flow.md)
- [Test Helper Functions](#test-helper-functions.md)
- [Example: test-subagent-driven-development.sh](#example-test-subagent-driven-developmentsh.md)
- [Integration Test Suite](#integration-test-suite.md)
- [test-subagent-driven-development-integration.sh](#test-subagent-driven-development-integrationsh.md)
- [Verification Tests](#verification-tests.md)
- [Test Projects: Scaffolding System](#test-projects-scaffolding-system.md)
- [Scaffolding Architecture](#scaffolding-architecture.md)
- [Test Project Characteristics](#test-project-characteristics.md)
- [Token Usage Analysis](#token-usage-analysis.md)
- [Analysis Flow](#analysis-flow.md)
- [Usage Extraction Logic](#usage-extraction-logic.md)
- [Output Format](#output-format.md)
- [Running Tests](#running-tests.md)
- [Command-Line Interface](#command-line-interface.md)
- [Subagent-Driven-Dev Test Runner](#subagent-driven-dev-test-runner.md)
- [Test Environment Requirements](#test-environment-requirements.md)
- [Prerequisites](#prerequisites.md)
- [Session Transcript Location](#session-transcript-location.md)
- [Test Execution Mapping](#test-execution-mapping.md)
- [Test Suite to Code Entity Mapping](#test-suite-to-code-entity-mapping.md)
