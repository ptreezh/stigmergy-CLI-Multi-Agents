# /obra/superpowers/9.4-testing-tools-and-helpers

Testing Tools and Helpers | obra/superpowers | DeepWiki

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

# Testing Tools and Helpers

Relevant source files

- [tests/claude-code/README.md](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md)
- [tests/claude-code/analyze-token-usage.py](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py)
- [tests/claude-code/run-skill-tests.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh)
- [tests/claude-code/test-helpers.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh)
- [tests/claude-code/test-subagent-driven-development-integration.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh)
- [tests/claude-code/test-subagent-driven-development.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh)
- [tests/explicit-skill-requests/prompts/action-oriented.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/action-oriented.txt)
- [tests/explicit-skill-requests/prompts/after-planning-flow.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/after-planning-flow.txt)
- [tests/explicit-skill-requests/prompts/claude-suggested-it.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/claude-suggested-it.txt)
- [tests/explicit-skill-requests/prompts/i-know-what-sdd-means.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/i-know-what-sdd-means.txt)
- [tests/explicit-skill-requests/prompts/mid-conversation-execute-plan.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/mid-conversation-execute-plan.txt)
- [tests/explicit-skill-requests/prompts/please-use-brainstorming.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/please-use-brainstorming.txt)
- [tests/explicit-skill-requests/prompts/skip-formalities.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/skip-formalities.txt)
- [tests/explicit-skill-requests/prompts/subagent-driven-development-please.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/subagent-driven-development-please.txt)
- [tests/explicit-skill-requests/prompts/use-systematic-debugging.txt](https://github.com/obra/superpowers/blob/a01a135f/tests/explicit-skill-requests/prompts/use-systematic-debugging.txt)
- [tests/subagent-driven-dev/go-fractals/design.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md)
- [tests/subagent-driven-dev/go-fractals/plan.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/plan.md)
- [tests/subagent-driven-dev/go-fractals/scaffold.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/scaffold.sh)
- [tests/subagent-driven-dev/run-test.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh)
- [tests/subagent-driven-dev/svelte-todo/design.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md)
- [tests/subagent-driven-dev/svelte-todo/plan.md](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/plan.md)
- [tests/subagent-driven-dev/svelte-todo/scaffold.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh)

This document describes the testing tools and helper functions used in the Superpowers test suite. The primary tool is `test-helpers.sh`, which provides reusable functions for running Claude Code in headless mode, making assertions about output, and managing test projects. Additional tools include `analyze-token-usage.py` for cost analysis and scaffold scripts for end-to-end testing.

For information about the overall test suite architecture and test orchestration, see [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md). For specific integration test cases, see [Integration Test Cases](obra/superpowers/9.2-integration-test-cases.md). For token usage analysis workflows, see [Token Usage Analysis](obra/superpowers/9.3-token-usage-analysis.md).

## Overview

The Superpowers test suite uses a shared helper library at [tests/claude-code/test-helpers.sh1-203](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L1-L203) that provides common functionality for all tests. This library enables tests to:

- Execute Claude Code in headless mode with custom prompts and timeouts
- Make assertions about Claude's behavior using pattern matching and ordering checks
- Create isolated test projects with temporary directories
- Generate sample implementation plans for testing workflows
- Clean up test artifacts automatically

All helper functions are exported for use in any test file that sources the library. Test files source the helpers using:

```
```

Sources: [tests/claude-code/test-helpers.sh1-203](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-helpers.sh#L1-L203) [tests/claude-code/test-subagent-driven-development.sh6-7](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development.sh#L6-L7)

\<old\_str>

## Use Cases

`find-polluter.sh` addresses several common test pollution scenarios:

| Pollution Type          | Example                       | Impact                              |
| ----------------------- | ----------------------------- | ----------------------------------- |
| Git repository creation | `.git` directory appears      | Tests become dependent on git state |
| Configuration files     | `.opencode` directory created | Tests read/write unintended config  |
| Temporary files         | Lock files, cache files       | Tests may fail intermittently       |
| Side effects            | Network state, process state  | Non-deterministic test behavior     |

The bisection approach is particularly valuable when:

- A large test suite contains dozens or hundreds of test files
- The pollution appears only after running multiple tests
- Manual inspection would require running tests individually
- The polluting test may be unrelated to the pollution it creates

Sources: [skills/root-cause-tracing/find-polluter.sh1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L1-L4)

## Use Cases

`find-polluter.sh` addresses several common test pollution scenarios:

| Pollution Type          | Example                       | Impact                              |
| ----------------------- | ----------------------------- | ----------------------------------- |
| Git repository creation | `.git` directory appears      | Tests become dependent on git state |
| Configuration files     | `.opencode` directory created | Tests read/write unintended config  |
| Temporary files         | Lock files, cache files       | Tests may fail intermittently       |
| Side effects            | Network state, process state  | Non-deterministic test behavior     |

The bisection approach is particularly valuable when:

- A large test suite contains dozens or hundreds of test files
- The pollution appears only after running multiple tests
- Manual inspection would require running tests individually
- The polluting test may be unrelated to the pollution it creates

Sources: [skills/root-cause-tracing/find-polluter.sh1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L1-L4)

## Bisection Algorithm

The script implements a linear bisection algorithm that tests each file sequentially until pollution is detected.

### Bisection Flow

```
```

The algorithm iterates through test files in sorted order, running each test in isolation and checking for the pollution artifact after each execution. This linear approach is simple and reliable, though not as fast as a true binary search.

Sources: [skills/root-cause-tracing/find-polluter.sh21-63](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L21-L63)

### Key Variables

The script uses the following key variables in its control flow:

| Variable          | Type    | Purpose                              | Line Reference                                                                                                                                          |
| ----------------- | ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POLLUTION_CHECK` | string  | File or directory path to monitor    | [skills/root-cause-tracing/find-polluter.sh14](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L14-L14)    |
| `TEST_PATTERN`    | glob    | Pattern matching test files to check | [skills/root-cause-tracing/find-polluter.sh15](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L15-L15)    |
| `TEST_FILES`      | array   | Sorted list of test file paths       | [skills/root-cause-tracing/find-polluter.sh22](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L22-L22)    |
| `TOTAL`           | integer | Total count of test files to check   | [skills/root-cause-tracing/find-polluter.sh23](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L23-L23)    |
| `COUNT`           | integer | Current test iteration number        | [skills/root-cause-tracing/find-polluter.sh28-30](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L28-L30) |
| `TEST_FILE`       | string  | Current test file being executed     | [skills/root-cause-tracing/find-polluter.sh29](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L29-L29)    |

Sources: [skills/root-cause-tracing/find-polluter.sh14-30](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L14-L30)

## Command-Line Interface

### Syntax

```
```

### Arguments

| Position | Parameter                | Description                               | Example                             |
| -------- | ------------------------ | ----------------------------------------- | ----------------------------------- |
| 1        | `<file_or_dir_to_check>` | Path to the pollution artifact to monitor | `.git`, `.opencode`, `node_modules` |
| 2        | `<test_pattern>`         | Glob pattern for test files to examine    | `src/**/*.test.ts`, `test/*.js`     |

The script validates that exactly 2 arguments are provided. If argument validation fails, it prints usage information and exits with code 1.

Sources: [skills/root-cause-tracing/find-polluter.sh8-12](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L8-L12)

### Exit Codes

| Exit Code | Condition             | Meaning                                     |
| --------- | --------------------- | ------------------------------------------- |
| 0         | No pollution detected | All tests are clean, no polluter found      |
| 1         | Pollution detected    | Polluter found, test file printed to stdout |
| 1         | Invalid arguments     | Incorrect number of command-line arguments  |

Sources: [skills/root-cause-tracing/find-polluter.sh11-63](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L11-L63)

## Usage Examples

### Finding Git Repository Pollution

```
```

This searches for a test that creates a `.git` directory, checking all TypeScript test files in the `src` directory tree.

**Expected Output (if polluter found):**

```
🔍 Searching for test that creates: .git
Test pattern: src/**/*.test.ts

Found 47 test files

[1/47] Testing: src/core/init.test.ts
[2/47] Testing: src/core/skills.test.ts
[3/47] Testing: src/integration/git.test.ts

🎯 FOUND POLLUTER!
   Test: src/integration/git.test.ts
   Created: .git

Pollution details:
drwxr-xr-x 8 user group 256 Jan 15 10:30 .git

To investigate:
  npm test src/integration/git.test.ts    # Run just this test
  cat src/integration/git.test.ts         # Review test code
```

Sources: [skills/root-cause-tracing/find-polluter.sh3-4](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L3-L4) [skills/root-cause-tracing/find-polluter.sh46-57](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L46-L57)

### Finding Configuration Directory Pollution

```
```

This identifies which test creates a `.opencode` configuration directory, checking all JavaScript test files in the `test` directory.

Sources: [skills/root-cause-tracing/find-polluter.sh3-4](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L3-L4)

### Handling Pre-Existing Pollution

If the pollution artifact already exists before running the script, tests will be skipped with a warning:

```
⚠️ Pollution already exists before test 1/47
   Skipping: src/core/init.test.ts
```

The script continues checking subsequent tests, but this indicates the pollution may have been created outside the test suite or the test environment was not properly cleaned before running the bisection.

Sources: [skills/root-cause-tracing/find-polluter.sh32-37](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L32-L37)

## Technical Implementation Details

### Test Execution

The script executes individual tests using `npm test` with output suppression:

```
```

The `|| true` ensures the script continues even if the test fails, since test failures are distinct from pollution detection. Both stdout and stderr are redirected to `/dev/null` to keep the bisection output clean.

Sources: [skills/root-cause-tracing/find-polluter.sh42](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L42-L42)

### File Discovery

Test files are discovered using `find` with pattern matching:

```
```

The results are sorted alphabetically to ensure consistent ordering across runs. This makes the bisection reproducible.

Sources: [skills/root-cause-tracing/find-polluter.sh22](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L22-L22)

### Pollution Detection

Pollution detection uses the shell's `-e` test operator:

```
```

This checks for both files and directories. The check occurs before each test (to detect pre-existing pollution) and after each test (to detect new pollution).

Sources: [skills/root-cause-tracing/find-polluter.sh33-37](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L33-L37) [skills/root-cause-tracing/find-polluter.sh45-58](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L45-L58)

## Integration with Test Suite

### Workflow Integration

```
```

The script is typically used after the main test suite detects pollution, serving as a diagnostic tool rather than a continuous integration check.

Sources: [skills/root-cause-tracing/find-polluter.sh1-64](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L1-L64)

### Relationship to Test Infrastructure

The `find-polluter.sh` script complements the test isolation mechanisms documented in [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md):

- **setup.sh** creates isolated `TEST_HOME` directories to prevent pollution
- **run-tests.sh** orchestrates test execution within isolated environments
- **find-polluter.sh** diagnoses when tests escape isolation and pollute the environment

This three-layer approach provides both prevention (isolation) and diagnosis (bisection) for test pollution issues.

Sources: [skills/root-cause-tracing/find-polluter.sh1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L1-L4)

## Limitations

### Linear Search Performance

The current implementation uses a linear search rather than a true binary search. For a test suite with N test files, this requires O(N) test executions in the worst case (when the polluter is the last test checked).

A true binary search could reduce this to O(log N) executions by:

1. Running the first half of tests together
2. If pollution appears, bisect that half
3. If no pollution, bisect the second half

However, the linear approach has advantages:

- Simpler implementation
- Easier to debug
- Identifies all polluters if multiple exist
- No risk of missing pollution that requires specific test ordering

Sources: [skills/root-case-tracing/find-polluter.sh21-63](https://github.com/obra/superpowers/blob/a01a135f/skills/root-case-tracing/find-polluter.sh#L21-L63)

### Test Independence Assumption

The script assumes each test can run independently. If Test B only pollutes when Test A has already run, the linear bisection may not identify the true root cause. In this case, the script would identify Test B as the polluter, but fixing Test B might not resolve the underlying coupling issue.

### Platform Assumptions

The script assumes:

- `npm test` is the test runner command
- The shell is bash (#!/usr/bin/env bash)
- Standard Unix tools are available (find, sort, wc, ls)

These assumptions may not hold for all projects using Superpowers.

Sources: [skills/root-cause-tracing/find-polluter.sh1](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L1-L1) [skills/root-cause-tracing/find-polluter.sh42](https://github.com/obra/superpowers/blob/a01a135f/skills/root-cause-tracing/find-polluter.sh#L42-L42)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Testing Tools and Helpers](#testing-tools-and-helpers.md)
- [Overview](#overview.md)
- [Use Cases](#use-cases.md)
- [Bisection Algorithm](#bisection-algorithm.md)
- [Bisection Flow](#bisection-flow.md)
- [Key Variables](#key-variables.md)
- [Command-Line Interface](#command-line-interface.md)
- [Syntax](#syntax.md)
- [Arguments](#arguments.md)
- [Exit Codes](#exit-codes.md)
- [Usage Examples](#usage-examples.md)
- [Finding Git Repository Pollution](#finding-git-repository-pollution.md)
- [Finding Configuration Directory Pollution](#finding-configuration-directory-pollution.md)
- [Handling Pre-Existing Pollution](#handling-pre-existing-pollution.md)
- [Technical Implementation Details](#technical-implementation-details.md)
- [Test Execution](#test-execution.md)
- [File Discovery](#file-discovery.md)
- [Pollution Detection](#pollution-detection.md)
- [Integration with Test Suite](#integration-with-test-suite.md)
- [Workflow Integration](#workflow-integration.md)
- [Relationship to Test Infrastructure](#relationship-to-test-infrastructure.md)
- [Limitations](#limitations.md)
- [Linear Search Performance](#linear-search-performance.md)
- [Test Independence Assumption](#test-independence-assumption.md)
- [Platform Assumptions](#platform-assumptions.md)
