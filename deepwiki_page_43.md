# /obra/superpowers/9.2-integration-test-cases

Integration Test Cases | obra/superpowers | DeepWiki

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

# Integration Test Cases

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

This page documents the specific integration test cases that execute full development workflows end-to-end using the superpowers skills system. For information about the overall test suite architecture and test types, see [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md). For token usage analysis tools, see [Token Usage Analysis](obra/superpowers/9.3-token-usage-analysis.md). For helper functions and utilities, see [Testing Tools and Helpers](obra/superpowers/9.4-testing-tools-and-helpers.md).

**Purpose:** Integration tests validate that entire workflows (brainstorming → planning → execution) work correctly by invoking Claude Code CLI and executing real implementation plans. These tests verify actual agent behavior, not just skill documentation, and take 10-30 minutes to complete.

## Overview of Integration Test Cases

The repository contains three integration test implementations:

| Test Case                    | Location                                                            | Tasks | Language/Framework | Purpose                                      |
| ---------------------------- | ------------------------------------------------------------------- | ----- | ------------------ | -------------------------------------------- |
| **Minimal Integration Test** | `tests/claude-code/test-subagent-driven-development-integration.sh` | 2     | Node.js            | Fast verification of core workflow behaviors |
| **Svelte Todo**              | `tests/subagent-driven-dev/svelte-todo/`                            | 12    | TypeScript/Svelte  | Full-stack web app with testing              |
| **Go Fractals**              | `tests/subagent-driven-dev/go-fractals/`                            | 10    | Go                 | CLI tool with algorithms                     |

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh1-315](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L1-L315) [tests/subagent-driven-dev/run-test.sh1-106](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L1-L106) [tests/claude-code/README.md95-117](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L95-L117)

## Test Execution Workflow

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh115-158](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L115-L158) [tests/subagent-driven-dev/run-test.sh57-80](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L57-L80)

## Minimal Integration Test

The fast integration test at [tests/claude-code/test-subagent-driven-development-integration.sh1-315](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L1-L315) executes a 2-task plan to verify core workflow behaviors without the overhead of a complex project.

### Test Project Structure

The test creates a minimal Node.js project:

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh24-112](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L24-L112)

### Implementation Plan

The test plan defines two simple tasks:

| Task   | File          | Function                         | Verification                          |
| ------ | ------------- | -------------------------------- | ------------------------------------- |
| Task 1 | `src/math.js` | `add(a, b)` returns `a + b`      | Tests for (2,3)→5, (0,0)→0, (-1,1)→0  |
| Task 2 | `src/math.js` | `multiply(a, b)` returns `a * b` | Tests for (2,3)→6, (0,5)→0, (-2,3)→-6 |

**Important:** Task 2 includes the requirement "DO NOT add any extra features (like power, divide, etc.)" to test spec compliance review effectiveness [tests/claude-code/test-subagent-driven-development-integration.sh90](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L90-L90)

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh48-105](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L48-L105)

### Verification Checks

The test performs seven verification categories:

```
```

**Key verification logic:**

1. **Skill invocation** [tests/claude-code/test-subagent-driven-development-integration.sh188-194](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L188-L194): Searches session transcript for `"name":"Skill"` with `"skill":"superpowers:subagent-driven-development"`

2. **Subagent dispatch** [tests/claude-code/test-subagent-driven-development-integration.sh198-206](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L198-L206): Counts `"name":"Task"` entries, expects ≥2

3. **Task tracking** [tests/claude-code/test-subagent-driven-development-integration.sh209-217](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L209-L217): Verifies `"name":"TodoWrite"` was used

4. **Implementation verification** [tests/claude-code/test-subagent-driven-development-integration.sh220-257](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L220-L257): Checks files exist, functions present, tests pass

5. **Git workflow** [tests/claude-code/test-subagent-driven-development-integration.sh260-268](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L260-L268): Verifies multiple commits (initial + per-task)

6. **Spec compliance** [tests/claude-code/test-subagent-driven-development-integration.sh271-278](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L271-L278): Warns if extra functions added (divide, subtract, power)

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh181-278](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L181-L278)

### Running the Minimal Test

```
```

The test includes a 1800-second (30-minute) timeout [tests/claude-code/test-subagent-driven-development-integration.sh152](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L152-L152)

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh1-15](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L1-L15) [tests/claude-code/run-skill-tests.sh79-86](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/run-skill-tests.sh#L79-L86)

## Svelte Todo Test Case

The Svelte todo application is a 12-task test that exercises full-stack web development workflow including component testing and end-to-end testing.

### Project Structure

```
```

**Sources:** [tests/subagent-driven-dev/svelte-todo/scaffold.sh1-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L1-L46) [tests/subagent-driven-dev/svelte-todo/design.md1-71](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L1-L71)

### Task Breakdown

The 12 tasks follow a systematic progression:

| Task # | Category    | Component/Feature          | Dependencies |
| ------ | ----------- | -------------------------- | ------------ |
| 1      | Setup       | Vite + Svelte project      | None         |
| 2      | State       | Todo store with operations | Task 1       |
| 3      | Persistence | localStorage integration   | Task 2       |
| 4      | UI          | TodoInput component        | Task 2       |
| 5      | UI          | TodoItem component         | Task 2       |
| 6      | UI          | TodoList component         | Tasks 4-5    |
| 7      | UI          | FilterBar component        | Task 2       |
| 8      | Integration | Wire App.svelte            | Tasks 4-7    |
| 9      | Logic       | Filter functionality       | Task 8       |
| 10     | Polish      | CSS styling                | Task 8       |
| 11     | Testing     | Playwright E2E tests       | Task 9       |
| 12     | Docs        | README.md                  | All tasks    |

**Each task follows the pattern:**

- **Do:** Specific implementation steps
- **Verify:** Test commands or manual verification

**Example from Task 2** [tests/subagent-driven-dev/svelte-todo/plan.md28-41](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/plan.md#L28-L41):

```
Create `src/lib/store.ts`
Define `Todo` interface with id, text, completed
Create writable store with initial empty array
Export functions: addTodo(text), toggleTodo(id), deleteTodo(id), clearCompleted()
Create `src/lib/store.test.ts` with tests for each function

Verify: Tests pass: npm run test
```

**Sources:** [tests/subagent-driven-dev/svelte-todo/plan.md1-223](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/plan.md#L1-L223)

### Design Specification

The [tests/subagent-driven-dev/svelte-todo/design.md1-71](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L1-L71) provides:

1. **UI Mockup** (ASCII art) showing layout [tests/subagent-driven-dev/svelte-todo/design.md19-32](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L19-L32)
2. **Component Architecture** [tests/subagent-driven-dev/svelte-todo/design.md34-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L34-L46)
3. **Data Model** with TypeScript interfaces [tests/subagent-driven-dev/svelte-todo/design.md48-58](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L48-L58)
4. **Acceptance Criteria** (9 items) [tests/subagent-driven-dev/svelte-todo/design.md60-71](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L60-L71)

**Sources:** [tests/subagent-driven-dev/svelte-todo/design.md1-71](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/design.md#L1-L71)

### Running the Svelte Todo Test

```
```

The test outputs to `/tmp/superpowers-tests/<timestamp>/subagent-driven-development/svelte-todo/` [tests/subagent-driven-dev/run-test.sh46-48](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L46-L48)

**Post-execution verification:**

```
```

**Sources:** [tests/subagent-driven-dev/run-test.sh1-106](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L1-L106) [tests/claude-code/README.md104](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/README.md#L104-L104)

## Go Fractals Test Case

The Go fractals CLI is a 10-task test that exercises algorithm implementation, CLI development, and integration testing patterns.

### Project Structure

```
```

**Sources:** [tests/subagent-driven-dev/go-fractals/scaffold.sh1-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/scaffold.sh#L1-L46) [tests/subagent-driven-dev/go-fractals/design.md1-82](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L1-L82)

### Task Breakdown

The 10 tasks build a complete CLI tool:

| Task # | Component            | Focus                             | Testing                |
| ------ | -------------------- | --------------------------------- | ---------------------- |
| 1      | Project Setup        | go.mod, directory structure       | Build succeeds         |
| 2      | CLI Framework        | Cobra root command                | Help output            |
| 3      | Sierpinski Algorithm | Recursive midpoint subdivision    | Unit tests (3 cases)   |
| 4      | Sierpinski CLI       | Wire algorithm to command         | CLI execution          |
| 5      | Mandelbrot Algorithm | Set renderer, character gradient  | Unit tests (3 cases)   |
| 6      | Mandelbrot CLI       | Wire algorithm to command         | CLI execution          |
| 7      | Character Config     | `--char` flag consistency         | Custom character tests |
| 8      | Input Validation     | Error handling for invalid inputs | Error case tests       |
| 9      | Integration Tests    | Full CLI invocation tests         | `go test ./...`        |
| 10     | Documentation        | README with examples              | Examples work          |

**Key implementation details:**

- **Sierpinski** [tests/subagent-driven-dev/go-fractals/plan.md43-57](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/plan.md#L43-L57): Uses recursive midpoint subdivision algorithm with configurable depth
- **Mandelbrot** [tests/subagent-driven-dev/go-fractals/plan.md75-91](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/plan.md#L75-L91): Maps complex plane region (-2.5 to 1.0, -1.0 to 1.0) to ASCII with character gradient `" .:-=+*#%@"`
- **CLI flags** [tests/subagent-driven-dev/go-fractals/design.md24-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L24-L46): Size, depth, width, height, iterations, char

**Sources:** [tests/subagent-driven-dev/go-fractals/plan.md1-173](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/plan.md#L1-L173)

### Design Specification

The [tests/subagent-driven-dev/go-fractals/design.md1-82](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L1-L82) provides:

1. **Usage Examples** with command syntax [tests/subagent-driven-dev/go-fractals/design.md8-22](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L8-L22)
2. **Command Specifications** with flags and defaults [tests/subagent-driven-dev/go-fractals/design.md24-48](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L24-L48)
3. **Architecture Diagram** (text-based) showing directory structure [tests/subagent-driven-dev/go-fractals/design.md49-67](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L49-L67)
4. **Dependencies** (Go 1.21+, Cobra) [tests/subagent-driven-dev/go-fractals/design.md69-71](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L69-L71)
5. **Acceptance Criteria** (7 items) [tests/subagent-driven-dev/go-fractals/design.md73-82](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L73-L82)

**Sources:** [tests/subagent-driven-dev/go-fractals/design.md1-82](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/design.md#L1-L82)

### Running the Go Fractals Test

```
```

**Post-execution verification:**

```
```

**Sources:** [tests/subagent-driven-dev/run-test.sh101-105](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L101-L105)

## Test Scaffolding Pattern

Both test cases follow a common scaffolding pattern:

```
```

**Common scaffolding elements:**

1. **Git initialization** [tests/subagent-driven-dev/svelte-todo/scaffold.sh15](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L15-L15): Every test starts with a clean repository
2. **Design document** [tests/subagent-driven-dev/svelte-todo/scaffold.sh18](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L18-L18): Provides context and requirements
3. **Implementation plan** [tests/subagent-driven-dev/svelte-todo/scaffold.sh19](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L19-L19): Defines the tasks to execute
4. **Permission configuration** [tests/subagent-driven-dev/svelte-todo/scaffold.sh22-37](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L22-L37): `.claude/settings.local.json` allows file operations and tool execution
5. **Initial commit** [tests/subagent-driven-dev/svelte-todo/scaffold.sh40-41](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L40-L41): Baseline for tracking changes

**Permission patterns:**

```
```

**Sources:** [tests/subagent-driven-dev/svelte-todo/scaffold.sh1-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/svelte-todo/scaffold.sh#L1-L46) [tests/subagent-driven-dev/go-fractals/scaffold.sh1-46](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/go-fractals/scaffold.sh#L1-L46)

## Test Execution via run-test.sh

The [tests/subagent-driven-dev/run-test.sh1-106](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L1-L106) script orchestrates test execution:

```
```

**Command-line options:**

- `--plugin-dir <path>`: Override plugin directory (default: parent of tests directory) [tests/subagent-driven-dev/run-test.sh19-32](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L19-L32)
- Test name: `svelte-todo` or `go-fractals` [tests/subagent-driven-dev/run-test.sh12](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L12-L12)

**Claude CLI flags:**

- `--plugin-dir`: Points to superpowers repository [tests/subagent-driven-dev/run-test.sh77](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L77-L77)
- `--dangerously-skip-permissions`: Allows subagents to execute without manual approval [tests/subagent-driven-dev/run-test.sh78](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L78-L78)
- `--output-format stream-json`: Captures structured output for analysis [tests/subagent-driven-dev/run-test.sh79](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L79-L79)

**Output structure:**

```
/tmp/superpowers-tests/<timestamp>/
└── subagent-driven-development/
    └── <test-name>/
        ├── project/           # Scaffolded and implemented code
        └── claude-output.json # Session transcript
```

**Sources:** [tests/subagent-driven-dev/run-test.sh1-106](https://github.com/obra/superpowers/blob/a01a135f/tests/subagent-driven-dev/run-test.sh#L1-L106)

## Verification Check Reference

Integration tests verify multiple aspects of workflow execution:

| Check Category        | What It Verifies                                        | How It Checks                                                          |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Skill Invocation**  | `subagent-driven-development` skill was loaded and used | Search session transcript for `"name":"Skill"` with correct skill name |
| **Subagent Dispatch** | Tasks were executed via Task tool                       | Count `"name":"Task"` entries in transcript                            |
| **Task Tracking**     | TodoWrite tool used to mark completion                  | Search for `"name":"TodoWrite"`                                        |
| **Plan Reading**      | Plan read once at start, not per task                   | Check file read operations occur in Step 1 only                        |
| **Self-Review**       | Subagents performed self-review before reporting        | Verify prompts include self-review instructions                        |
| **Review Order**      | Spec compliance before code quality                     | Check reviewer dispatch order in transcript                            |
| **Review Loops**      | Issues trigger re-implementation                        | Count Task dispatches per logical task                                 |
| **Implementation**    | Files created with correct content                      | Check file existence and grep for functions                            |
| **Tests**             | Test files exist and pass                               | Run test command (`npm test`, `go test ./...`)                         |
| **Git Workflow**      | Per-task commits created                                | Count commits, verify messages                                         |
| **Spec Compliance**   | No extra features added                                 | Check for forbidden functions/features                                 |

**Example verification code patterns:**

**1. Skill invocation check** [tests/claude-code/test-subagent-driven-development-integration.sh189-194](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L189-L194):

```
```

**2. Subagent count** [tests/claude-code/test-subagent-driven-development-integration.sh199-205](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L199-L205):

```
```

**3. Implementation verification** [tests/claude-code/test-subagent-driven-development-integration.sh224-229](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L224-L229):

```
```

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh181-278](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L181-L278)

## Token Usage Analysis Integration

Integration tests capture session transcripts for cost analysis using [tests/claude-code/analyze-token-usage.py1-169](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L1-L169) See [Token Usage Analysis](obra/superpowers/9.3-token-usage-analysis.md) for detailed documentation.

**Example output from minimal integration test:**

```
Usage Breakdown:
Agent           Description                         Msgs     Input     Output      Cache      Cost
main            Main session (coordinator)             8    15,432      2,341     12,055    $0.52
agent-1         Implementer for Task 1                 4     3,221        876      2,100    $0.18
agent-2         Spec compliance reviewer               2     2,894        234      1,987    $0.13
agent-3         Code quality reviewer                  2     2,756        198      1,856    $0.12
agent-4         Implementer for Task 2                 4     3,145        823      2,034    $0.17
```

**Analysis metrics:**

- Token counts per agent (main session + each subagent)
- Cache utilization (prompt caching effectiveness)
- Estimated costs at $3/$15 per million tokens (input/output)
- Message counts

**Sources:** [tests/claude-code/test-subagent-driven-development-integration.sh280-286](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/test-subagent-driven-development-integration.sh#L280-L286) [tests/claude-code/analyze-token-usage.py1-169](https://github.com/obra/superpowers/blob/a01a135f/tests/claude-code/analyze-token-usage.py#L1-L169)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Integration Test Cases](#integration-test-cases.md)
- [Overview of Integration Test Cases](#overview-of-integration-test-cases.md)
- [Test Execution Workflow](#test-execution-workflow.md)
- [Minimal Integration Test](#minimal-integration-test.md)
- [Test Project Structure](#test-project-structure.md)
- [Implementation Plan](#implementation-plan.md)
- [Verification Checks](#verification-checks.md)
- [Running the Minimal Test](#running-the-minimal-test.md)
- [Svelte Todo Test Case](#svelte-todo-test-case.md)
- [Project Structure](#project-structure.md)
- [Task Breakdown](#task-breakdown.md)
- [Design Specification](#design-specification.md)
- [Running the Svelte Todo Test](#running-the-svelte-todo-test.md)
- [Go Fractals Test Case](#go-fractals-test-case.md)
- [Project Structure](#project-structure-1.md)
- [Task Breakdown](#task-breakdown-1.md)
- [Design Specification](#design-specification-1.md)
- [Running the Go Fractals Test](#running-the-go-fractals-test.md)
- [Test Scaffolding Pattern](#test-scaffolding-pattern.md)
- [Test Execution via run-test.sh](#test-execution-via-run-testsh.md)
- [Verification Check Reference](#verification-check-reference.md)
- [Token Usage Analysis Integration](#token-usage-analysis-integration.md)
