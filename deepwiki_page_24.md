# /obra/superpowers/6.3-writing-implementation-plans

Writing Implementation Plans | obra/superpowers | DeepWiki

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

# Writing Implementation Plans

Relevant source files

- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md)
- [skills/systematic-debugging/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md)
- [skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

## Purpose and Scope

This document describes the `writing-plans` skill, which converts completed design documents into detailed, TDD-focused implementation plans with bite-sized tasks. The skill produces plans that assume the executing engineer has zero codebase context and provides exact file paths, complete code examples, and verification steps for each task.

This page covers plan structure, task granularity, and execution handoff. For the preceding design phase, see [Brainstorming and Design](obra/superpowers/6.1-brainstorming-and-design.md). For plan execution approaches, see [Executing Plans](obra/superpowers/6.3-writing-implementation-plans.md) and [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md). For TDD methodology details, see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md).

## Overview

The `writing-plans` skill transforms a design document into an actionable implementation plan. It operates on the principle that implementation should be delegated to an engineer (or agent) with minimal domain knowledge, requiring comprehensive documentation of every decision and step.

**Key characteristics:**

- **Prerequisite:** Complete design document (typically from `brainstorming` skill)
- **Output:** Markdown plan saved to `docs/plans/YYYY-MM-DD-<feature-name>.md`
- **Execution context:** Dedicated worktree created by brainstorming skill
- **Task size:** 2-5 minutes per step
- **Methodology:** Strict TDD (RED-GREEN-REFACTOR)
- **Assumptions:** Engineer is skilled but has zero codebase/domain context

Sources: [skills/writing-plans/SKILL.md1-17](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L1-L17)

## Workflow Position

```
```

**Workflow Position Diagram**

The `writing-plans` skill sits between design completion and execution, serving as the translation layer from high-level architecture to concrete implementation steps.

Sources: [skills/writing-plans/SKILL.md1-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L1-L117)

## Skill Invocation

**Manual announcement required:**

```
I'm using the writing-plans skill to create the implementation plan.
```

This announcement is mandatory at the start of plan writing and creates an audit trail for skill usage.

**Typical invocation flow:**

1. Design document exists in `docs/plans/YYYY-MM-DD-<feature-name>-design.md`
2. User requests implementation plan
3. Agent announces skill usage
4. Agent generates plan following skill structure
5. Agent offers execution handoff options

Sources: [skills/writing-plans/SKILL.md14](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L14-L14)

## Task Granularity Philosophy

### Bite-Sized Steps

Each step represents **one action** taking 2-5 minutes. The skill enforces atomic granularity by breaking down traditional development tasks into individual steps.

| Traditional Task | Decomposed Steps                                                                                         | Duration                      |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------- |
| "Add feature X"  | 1. Write failing test 2. Run to verify failure 3. Implement minimal code 4. Run to verify pass 5. Commit | 5 steps × 2-4 min = 10-20 min |

**Example decomposition:**

```
```

This granularity ensures that each step is verifiable, reversible, and provides immediate feedback.

Sources: [skills/writing-plans/SKILL.md20-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L20-L28)

## Plan Document Structure

### Required Header Format

Every implementation plan must start with a standardized header defined in the skill's "Plan Document Header" section:

```
```

**Header components:**

| Component               | Purpose                                                        | Example                                                                 |
| ----------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| H1 Title                | Feature identification                                         | `# User Authentication Implementation Plan`                             |
| Blockquote directive    | Sub-skill enforcement (must use `superpowers:executing-plans`) | `> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans` |
| **Goal:** field         | Single-sentence objective                                      | `**Goal:** Build JWT-based authentication system`                       |
| **Architecture:** field | High-level approach (2-3 sentences)                            | `**Architecture:** Token-based auth with refresh mechanism...`          |
| **Tech Stack:** field   | Technology listing                                             | `**Tech Stack:** JWT, bcrypt, Express middleware, PostgreSQL`           |
| Horizontal rule         | Header separator                                               | `---`                                                                   |

The blockquote sub-skill directive serves as a mandatory execution protocol—when another agent loads the plan file, this directive immediately establishes which skill must be invoked (`superpowers:executing-plans`) before proceeding with task execution.

Sources: [skills/writing-plans/SKILL.md29-45](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L29-L45)

### Task Structure Template

Each task follows a rigid five-step structure implementing the RED-GREEN-REFACTOR cycle from TDD:

```
```

**Markdown Task Structure Hierarchy**

**File action syntax:**

| Action Verb | Syntax                                | Usage                                   |
| ----------- | ------------------------------------- | --------------------------------------- |
| `Create:`   | `Create: path/to/new.py`              | New file to be created                  |
| `Modify:`   | `Modify: path/to/existing.py:123-145` | Existing file with line range to change |
| `Test:`     | `Test: tests/path/to/test.py`         | Test file location                      |

**Step format template:**

```
```

\[Expected output description]

````

Each step's code must be complete and copy-pasteable—no placeholders like "add validation here" are permitted.

Sources: <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L47-L89" min=47 max=89 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>

### Complete Task Example

```markdown
### Task 3: Database Connection Pool

**Files:**
- Create: `src/database/pool.py`
- Modify: `src/config.py:15-20`
- Test: `tests/database/test_pool.py`

**Step 1: Write the failing test**

```python
# tests/database/test_pool.py
import pytest
from src.database.pool import ConnectionPool

def test_pool_initialization():
    pool = ConnectionPool(max_connections=5)
    assert pool.max_connections == 5
    assert pool.active_connections == 0
````

**Step 2: Run test to verify it fails**

Run: `pytest tests/database/test_pool.py::test_pool_initialization -v` Expected: `FAIL - ModuleNotFoundError: No module named 'src.database.pool'`

**Step 3: Write minimal implementation**

```
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/database/test_pool.py::test_pool_initialization -v` Expected: `PASS - 1 passed in 0.02s`

**Step 5: Commit**

```
```

````

**Key structural requirements:**

| Requirement | Rationale |
|------------|-----------|
| Exact file paths | Eliminates ambiguity about where code goes |
| Line number ranges | Shows precisely what to modify in existing files |
| Complete code | No "add validation" placeholders—actual implementation |
| Exact commands | Copy-pasteable commands with no interpretation needed |
| Expected output | Verifiable success/failure criteria |

Sources: <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L47-L89" min=47 max=89 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>

## Plan Composition Principles

### DRY, YAGNI, TDD

The skill enforces three core principles throughout plan generation:

**DRY (Don't Repeat Yourself):**
- Extract common patterns into helper functions
- Reference existing utilities rather than duplicating
- Use inheritance/composition to share behavior

**YAGNI (You Ain't Gonna Need It):**
- Implement only what the current task requires
- No speculative features or abstractions
- Add complexity only when tests demand it

**TDD (Test-Driven Development):**
- Every feature starts with a failing test
- Minimal implementation to make test pass
- Refactor only after tests pass

```mermaid
graph LR
    RED["RED Phase<br/>Write failing test<br/>Step 1-2"]
    GREEN["GREEN Phase<br/>Minimal implementation<br/>Step 3-4"]
    REFACTOR["REFACTOR Phase<br/>(Separate task if needed)<br/>Step N"]
    COMMIT["Commit<br/>Step 5"]
    
    RED --> GREEN
    GREEN --> COMMIT
    COMMIT --> REFACTOR
    REFACTOR --> RED
````

**TDD Cycle in Plan Structure**

Sources: [skills/writing-plans/SKILL.md90-95](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L90-L95)

### Skill References

Plans may reference other skills using the `@` syntax for cross-referencing:

```
```

This creates navigation between skills and reinforces the ecosystem.

Sources: [skills/writing-plans/SKILL.md94](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L94-L94)

## Execution Handoff

### Two-Option Presentation

After saving the plan to `docs/plans/YYYY-MM-DD-<feature-name>.md`, the skill must present the exact handoff message specified in the "Execution Handoff" section:

```
Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch fresh subagent per task, review between tasks, fast iteration

2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints

Which approach?
```

```
```

**Execution Handoff Protocol Flow**

The handoff enforces a mandatory choice—the agent cannot proceed without user selection, and each path explicitly invokes its corresponding sub-skill (`subagent-driven-development` or `executing-plans`).

Sources: [skills/writing-plans/SKILL.md97-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L97-L117)

### Option 1: Subagent-Driven Development

**Implementation path:**

- **REQUIRED SUB-SKILL:** `superpowers:subagent-driven-development` must be invoked
- **Session continuity:** Remains in current session (no context switch)
- **Execution model:** Fresh subagent spawned for each task in plan
- **Review mechanism:** Two-stage review after each task (spec compliance → code quality)
- **Iteration cadence:** Fast (no session initialization overhead per task)
- **Human involvement:** Minimal—human reviews at completion, not per-task

**Technical flow:**

```
```

**Subagent-Driven Execution Flow**

**When to choose:**

- Working solo without real-time human review
- Need automated quality enforcement via two-stage review
- Want continuous autonomous progress
- Complex tasks benefit from isolated agent context per task

Sources: [skills/writing-plans/SKILL.md109-113](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L109-L113)

### Option 2: Parallel Session Execution

**Implementation path:**

- **REQUIRED SUB-SKILL:** `superpowers:executing-plans` must be invoked in new session
- **Session handling:** New session opened in worktree directory
- **Execution model:** Single agent processes tasks sequentially in batches
- **Review mechanism:** Human review after each batch (default: 3 tasks)
- **Iteration cadence:** Moderate (checkpoint overhead + human review time)
- **Human involvement:** Regular—human reviews and approves after each batch

**Technical flow:**

```
```

**Parallel Session Execution Flow**

The executing-plans skill's default batch size of 3 tasks (from [skills/executing-plans/SKILL.md25](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L25-L25)) creates natural review checkpoints.

**When to choose:**

- Pair programming scenario with human oversight
- High-risk changes requiring frequent human verification
- Learning/training mode (human observing agent decision-making)
- Current session state must be preserved (plan writing continues separately)

Sources: [skills/writing-plans/SKILL.md114-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L114-L117) [skills/executing-plans/SKILL.md25](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L25-L25)

## Integration with Development Pipeline

The `writing-plans` skill is tightly integrated with the broader workflow:

```
```

**Integration Pipeline Diagram**

**Pipeline stages:**

| Stage      | Input                | Process                                            | Output                     |
| ---------- | -------------------- | -------------------------------------------------- | -------------------------- |
| Design     | User idea            | `brainstorming` skill                              | Design document + worktree |
| Planning   | Design document      | `writing-plans` skill                              | Implementation plan        |
| Execution  | Implementation plan  | `executing-plans` or `subagent-driven-development` | Working code               |
| Completion | Implemented features | `finishing-a-development-branch`                   | Merged/PR'd code           |

Sources: [skills/writing-plans/SKILL.md1-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L1-L117)

## File Path Conventions

### Plan Storage Location

All implementation plans are saved to:

```
docs/plans/YYYY-MM-DD-<feature-name>.md
```

**Naming conventions:**

| Component    | Format     | Example             |
| ------------ | ---------- | ------------------- |
| Date         | YYYY-MM-DD | 2024-01-15          |
| Feature name | kebab-case | user-authentication |
| Extension    | .md        | .md                 |

**Full example:** `docs/plans/2024-01-15-user-authentication.md`

This convention enables:

- Chronological sorting
- Feature identification at a glance
- Consistent navigation patterns

Sources: [skills/writing-plans/SKILL.md18](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L18-L18)

### File Reference Syntax

Plans must use exact file paths with optional line ranges:

**Create new file:**

```
```

**Modify existing file:**

```
```

**Test file:**

```
```

The line range syntax (`file.py:startLine-endLine`) indicates precisely which lines to modify, eliminating ambiguity about scope.

Sources: [skills/writing-plans/SKILL.md52-55](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L52-L55)

## Assumptions About the Engineer

The skill operates under specific assumptions about the executing engineer's capabilities and knowledge:

| Assumption            | Implication                         | Plan Requirement                 |
| --------------------- | ----------------------------------- | -------------------------------- |
| Skilled developer     | Can write good code                 | Don't explain basic syntax       |
| Zero codebase context | Doesn't know project structure      | Provide exact file paths         |
| Zero domain knowledge | Doesn't know business logic         | Explain why, not just what       |
| Questionable taste    | Might make poor design choices      | Provide complete implementations |
| Weak test design      | Doesn't know testing best practices | Show exact test patterns         |

**Example of addressing assumptions:**

```
```

Why this test structure:

- We test the happy path first (valid credentials)
- We assert on multiple attributes to catch partial failures
- We use clear, readable assertions rather than complex matchers

````

This verbosity ensures that an engineer unfamiliar with the project can execute correctly.

Sources: <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L10-L12" min=10 max=12 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>

## Verification Steps

Every task includes explicit verification steps with exact commands and expected outputs:

```markdown
**Step 2: Run test to verify it fails**

Run: `pytest tests/auth/test_auth.py::test_authenticate_valid_user -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'auth'"

**Step 4: Run test to verify it passes**

Run: `pytest tests/auth/test_auth.py::test_authenticate_valid_user -v`
Expected: PASS (1 passed in 0.01s)
````

**Verification components:**

| Component        | Purpose                                  | Example                                                           |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| Exact command    | Copy-pasteable invocation                | `pytest tests/auth/test_auth.py::test_authenticate_valid_user -v` |
| Expected outcome | Success/failure criteria                 | `FAIL with "ModuleNotFoundError"`                                 |
| Expected output  | Exact error message or success indicator | `(1 passed in 0.01s)`                                             |

This enables mechanical execution—the engineer doesn't need to interpret whether the result is correct; they can compare actual vs. expected output directly.

Sources: [skills/writing-plans/SKILL.md66-79](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L66-L79)

## Commit Strategy

Every task ends with an explicit commit step:

```
```

````

**Commit message format:**

| Prefix | Usage | Example |
|--------|-------|---------|
| feat: | New feature | `feat: add user authentication` |
| fix: | Bug fix | `fix: handle missing user gracefully` |
| test: | Test addition/modification | `test: add edge cases for auth` |
| refactor: | Code restructuring | `refactor: extract auth validation` |
| docs: | Documentation | `docs: add auth API examples` |

This strategy:
- Creates fine-grained history (one feature per commit)
- Enables easy rollback if a step fails
- Provides clear audit trail
- Follows conventional commits standard

Sources: <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L82-L87" min=82 max=87 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>

## Common Plan Patterns

The skill's task structure (<FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L47-L89" min=47 max=89 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>) produces consistent patterns for common development scenarios:

### Pattern: Adding a New Endpoint

```markdown
### Task 1: POST /auth/login Endpoint

**Files:**
- Create: `src/routes/auth.py`
- Modify: `src/app.py:25-30`
- Test: `tests/routes/test_auth.py`

**Step 1: Write the failing test**

```python
def test_login_valid_credentials():
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'token' in response.json()
````

**Step 2: Run test to verify it fails**

Run: `pytest tests/routes/test_auth.py::test_login_valid_credentials -v` Expected: `FAIL - ModuleNotFoundError: No module named 'src.routes.auth'`

**Step 3: Write minimal implementation**

```
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/routes/test_auth.py::test_login_valid_credentials -v` Expected: `PASS (1 passed in 0.02s)`

**Step 5: Commit**

```
```

````

### Pattern: Database Schema Change

```markdown
### Task 2: Add email Column to Users Table

**Files:**
- Create: `migrations/002_add_user_email.sql`
- Modify: `src/models/user.py:15-20`
- Test: `tests/models/test_user.py`

**Step 1: Write the failing test**

```python
def test_user_has_email_attribute():
    user = User(username='test', email='test@example.com')
    assert user.email == 'test@example.com'
````

**Step 2: Run test to verify it fails**

Run: `pytest tests/models/test_user.py::test_user_has_email_attribute -v` Expected: `FAIL - AttributeError: 'User' object has no attribute 'email'`

````

### Pattern: Refactoring Existing Code

```markdown
### Task 3: Extract Validation Logic

**Files:**
- Create: `src/utils/validation.py`
- Modify: `src/routes/auth.py:45-60` (replace inline validation)
- Test: `tests/utils/test_validation.py`

**Step 1: Write the failing test**

```python
def test_validate_email():
    assert validate_email('test@example.com') is True
    assert validate_email('invalid-email') is False
````

**Step 2: Run test to verify it fails**

Run: `pytest tests/utils/test_validation.py::test_validate_email -v` Expected: `FAIL - ModuleNotFoundError: No module named 'src.utils.validation'`

```

Each pattern follows the mandatory five-step structure with explicit verification commands and expected outputs.

Sources: <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L47-L89" min=47 max=89 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>

## Summary

The `writing-plans` skill transforms completed designs into mechanical implementation plans. Key characteristics:

- **Granularity:** 2-5 minute steps with explicit verification
- **Completeness:** Exact paths, complete code, expected outputs
- **Methodology:** Strict TDD (RED-GREEN-REFACTOR)
- **Assumptions:** Zero codebase/domain context
- **Output:** `docs/plans/YYYY-MM-DD-<feature-name>.md`
- **Handoff:** Choice between subagent-driven or parallel session execution

The skill's verbosity and precision enable reliable delegation to engineers (human or AI) with minimal context, ensuring consistent implementation quality.

Sources: <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L1-L117" min=1 max=117 file-path="skills/writing-plans/SKILL.md">Hii</FileRef>
```

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Writing Implementation Plans](#writing-implementation-plans.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Overview](#overview.md)
- [Workflow Position](#workflow-position.md)
- [Skill Invocation](#skill-invocation.md)
- [Task Granularity Philosophy](#task-granularity-philosophy.md)
- [Bite-Sized Steps](#bite-sized-steps.md)
- [Plan Document Structure](#plan-document-structure.md)
- [Required Header Format](#required-header-format.md)
- [Task Structure Template](#task-structure-template.md)
- [Skill References](#skill-references.md)
- [Execution Handoff](#execution-handoff.md)
- [Two-Option Presentation](#two-option-presentation.md)
- [Option 1: Subagent-Driven Development](#option-1-subagent-driven-development.md)
- [Option 2: Parallel Session Execution](#option-2-parallel-session-execution.md)
- [Integration with Development Pipeline](#integration-with-development-pipeline.md)
- [File Path Conventions](#file-path-conventions.md)
- [Plan Storage Location](#plan-storage-location.md)
- [File Reference Syntax](#file-reference-syntax.md)
- [Assumptions About the Engineer](#assumptions-about-the-engineer.md)
- [Commit Strategy](#commit-strategy.md)
