# /obra/superpowers/7.2-test-driven-development

Test-Driven Development | obra/superpowers | DeepWiki

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

# Test-Driven Development

Relevant source files

- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [skills/dispatching-parallel-agents/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md)
- [skills/test-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md)
- [skills/test-driven-development/testing-anti-patterns.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

## Purpose and Scope

This page documents the **test-driven-development** skill, which enforces the RED-GREEN-REFACTOR cycle during implementation. The skill is mandatory for all feature development, bug fixes, and refactoring work in the Superpowers workflow.

This page covers:

- The Iron Law (no production code without failing test first)
- RED-GREEN-REFACTOR cycle mechanics
- Skill file structure and reference materials
- Integration with other workflow skills
- Common rationalizations and how the skill prevents them
- Verification checklist for TDD compliance

For information about how TDD principles are applied to skill creation itself, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md). For the complete development workflow context, see [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md).

**Sources**: [skills/test-driven-development/SKILL.md1-10](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L1-L10) [README.md80-97](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L97)

---

## Skill File Structure

The test-driven-development skill consists of two files in the skills repository:

| File                       | Purpose                                                               | Location                                                  |
| -------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `SKILL.md`                 | Core TDD skill with Iron Law, cycle explanation, and rationalizations | `skills/test-driven-development/SKILL.md`                 |
| `testing-anti-patterns.md` | Reference material loaded when writing or changing tests              | `skills/test-driven-development/testing-anti-patterns.md` |

The skill is invoked automatically by the agent **before writing any implementation code**. The description field triggers invocation: *"Use when implementing any feature or bugfix, before writing implementation code"*.

**Sources**: [skills/test-driven-development/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L1-L4) [skills/test-driven-development/testing-anti-patterns.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L1-L4)

---

## The Iron Law: No Code Without Failing Test

The foundational principle enforced by this skill:

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

This is stated explicitly and repeatedly in the skill file to prevent rationalization:

> Write code before the test? Delete it. Start over.

The skill includes explicit negations to close common loopholes:

- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

**Sources**: [skills/test-driven-development/SKILL.md31-45](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L31-L45)

---

## RED-GREEN-REFACTOR Cycle

### Cycle Overview

```
```

**Sources**: [skills/test-driven-development/SKILL.md47-69](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L47-L69)

### RED Phase: Write Failing Test

Write one minimal test showing the desired behavior. The test must:

- Test one behavior only
- Have a clear, descriptive name
- Use real code (mocks only if unavoidable)

**Example from skill file** ([skills/test-driven-development/SKILL.md76-92](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L76-L92)):

```
```

**Sources**: [skills/test-driven-development/SKILL.md71-112](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L71-L112)

### Verify RED: Watch It Fail

**MANDATORY. Never skip.**

Run the test and confirm:

- Test fails (not errors)
- Failure message is expected
- Fails because feature is missing (not typos)

If the test passes immediately, you're testing existing behavior. If the test errors, fix the error first.

**Sources**: [skills/test-driven-development/SKILL.md114-129](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L114-L129)

### GREEN Phase: Minimal Code

Write the simplest code to pass the test. Do not:

- Add features beyond what the test requires
- Refactor other code
- "Improve" beyond the test

**Example from skill file** ([skills/test-driven-development/SKILL.md136-145](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L136-L145)):

```
```

**Sources**: [skills/test-driven-development/SKILL.md131-166](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L131-L166)

### Verify GREEN: Watch It Pass

**MANDATORY.**

Run the test and confirm:

- Test passes
- Other tests still pass
- Output pristine (no errors, warnings)

If the test fails, fix the code, not the test. If other tests fail, fix them now.

**Sources**: [skills/test-driven-development/SKILL.md168-184](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L168-L184)

### REFACTOR Phase: Clean Up

After tests are green, improve the code:

- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.

**Sources**: [skills/test-driven-development/SKILL.md186-196](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L186-L196)

---

## Integration with Development Workflows

```
```

The TDD skill is invoked:

1. Automatically when an agent begins implementation work
2. As a mandatory step during subagent-driven-development
3. Before any code is written in executing-plans batches

The skill description ensures it triggers: *"Use when implementing any feature or bugfix, before writing implementation code"*.

**Sources**: [README.md80-97](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L97) [skills/test-driven-development/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L1-L4)

---

## Preventing Rationalization: The Bulletproofing Process

The TDD skill has been bulletproofed through iterative pressure testing. The skill file includes a comprehensive rationalization table addressing common excuses:

### Common Rationalizations and Counters

| Rationalization                        | Reality (from skill)                                                    |
| -------------------------------------- | ----------------------------------------------------------------------- |
| "Too simple to test"                   | Simple code breaks. Test takes 30 seconds.                              |
| "I'll test after"                      | Tests passing immediately prove nothing.                                |
| "Tests after achieve same goals"       | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Already manually tested"              | Ad-hoc ≠ systematic. No record, can't re-run.                           |
| "Deleting X hours is wasteful"         | Sunk cost fallacy. Keeping unverified code is technical debt.           |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete.             |
| "TDD will slow me down"                | TDD faster than debugging. Pragmatic = test-first.                      |

**Sources**: [skills/test-driven-development/SKILL.md257-271](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L257-L271)

### Why Order Matters Section

The skill includes detailed explanations for why testing-after doesn't work:

**"I'll write tests after to verify it works"** ([skills/test-driven-development/SKILL.md208-216](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L208-L216)):

- Tests written after code pass immediately
- Passing immediately proves nothing
- Might test wrong thing, implementation instead of behavior
- Never saw it catch the bug

**"I already manually tested all the edge cases"** ([skills/test-driven-development/SKILL.md218-226](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L218-L226)):

- Manual testing is ad-hoc
- No record of what was tested
- Can't re-run when code changes
- Easy to forget cases under pressure

**Sources**: [skills/test-driven-development/SKILL.md206-255](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L206-L255)

### Red Flags List

The skill includes a comprehensive red flags section that triggers immediate action:

```
- Code before test
- Test after implementation
- Test passes immediately
- Can't explain why test failed
- Rationalizing "just this once"
- "I already manually tested it"
- "Keep as reference" or "adapt existing code"
- "Already spent X hours, deleting is wasteful"
```

All of these mean: **Delete code. Start over with TDD.**

**Sources**: [skills/test-driven-development/SKILL.md273-288](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L273-L288)

---

## Verification Checklist

Before marking work complete, the skill requires checking:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

**If you can't check all boxes: You skipped TDD. Start over.**

**Sources**: [skills/test-driven-development/SKILL.md328-340](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md#L328-L340)

---

## Testing Anti-Patterns Reference

The `testing-anti-patterns.md` file is loaded when writing or changing tests. It defines three Iron Laws:

```
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
```

### Anti-Pattern 1: Testing Mock Behavior

**Problem**: Asserting that mocks exist instead of testing real behavior.

**Example violation** ([skills/test-driven-development/testing-anti-patterns.md25-29](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L25-L29)):

```
```

**Gate function**: Before asserting on any mock element, ask "Am I testing real component behavior or just mock existence?"

**Sources**: [skills/test-driven-development/testing-anti-patterns.md21-62](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L21-L62)

### Anti-Pattern 2: Test-Only Methods in Production

**Problem**: Adding methods to production classes that are only used in tests.

**Example violation** ([skills/test-driven-development/testing-anti-patterns.md67-77](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L67-L77)):

```
```

**Fix**: Put cleanup logic in test utilities, not production classes.

**Sources**: [skills/test-driven-development/testing-anti-patterns.md64-117](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L64-L117)

### Anti-Pattern 3: Mocking Without Understanding

**Problem**: Mocking breaks test logic by removing side effects the test depends on.

**Gate function** ([skills/test-driven-development/testing-anti-patterns.md152-175](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L152-L175)):

```
BEFORE mocking any method:
  STOP - Don't mock yet
  
  1. Ask: "What side effects does the real method have?"
  2. Ask: "Does this test depend on any of those side effects?"
  3. Ask: "Do I fully understand what this test needs?"
```

**Sources**: [skills/test-driven-development/testing-anti-patterns.md119-176](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L119-L176)

### Anti-Pattern 4: Incomplete Mocks

**Problem**: Mocking only fields you think you need, missing fields downstream code depends on.

**Iron Rule**: Mock the COMPLETE data structure as it exists in reality, not just fields your immediate test uses.

**Sources**: [skills/test-driven-development/testing-anti-patterns.md178-227](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L178-L227)

### Anti-Pattern 5: Integration Tests as Afterthought

**Problem**: Treating testing as optional follow-up instead of part of implementation.

**Why TDD prevents these**: Writing tests first forces you to think about what you're actually testing, watch it fail against real code, and avoid adding test-only infrastructure.

**Sources**: [skills/test-driven-development/testing-anti-patterns.md229-272](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L229-L272)

---

## Meta-Application: TDD for Skills Themselves

The same TDD principles are applied to skill creation through the `testing-skills-with-subagents` skill. This creates a recursive structure where TDD is used to create and validate the TDD skill itself.

```
```

### Mapping TDD Phases to Skill Testing

| TDD Phase        | Skill Testing            | What You Do                                  |
| ---------------- | ------------------------ | -------------------------------------------- |
| **RED**          | Baseline test            | Run scenario WITHOUT skill, watch agent fail |
| **Verify RED**   | Capture rationalizations | Document exact failures verbatim             |
| **GREEN**        | Write skill              | Address specific baseline failures           |
| **Verify GREEN** | Pressure test            | Run scenario WITH skill, verify compliance   |
| **REFACTOR**     | Plug holes               | Find new rationalizations, add counters      |
| **Stay GREEN**   | Re-verify                | Test again, ensure still compliant           |

**Sources**: [skills/writing-skills/testing-skills-with-subagents.md30-41](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L30-L41)

### Example: Bulletproofing the TDD Skill

The TDD skill itself went through 6 RED-GREEN-REFACTOR iterations ([skills/writing-skills/testing-skills-with-subagents.md377-385](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L377-L385)):

**Iteration 1** - Initial test failed:

```
Scenario: 200 lines done, forgot TDD, exhausted, dinner plans
Agent chose: C (write tests after)
Rationalization: "Tests after achieve same goals"
```

**Iteration 2** - Added "Why Order Matters" section, still failed:

```
Re-tested: Agent STILL chose C
New rationalization: "Spirit not letter"
```

**Iteration 6** - Added foundational principle:

```
Added: "Violating letter is violating spirit"
Re-tested: Agent chose A (delete it)
Meta-test: "Skill was clear, I should follow it"
Bulletproof achieved.
```

**Sources**: [skills/writing-skills/testing-skills-with-subagents.md283-307](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L283-L307)

---

## Real-World Impact

From the README philosophy section:

> **Test-Driven Development** - Write tests first, always

The TDD skill is enforced at multiple points in the workflow:

1. Listed as step 5 in the basic workflow
2. Invoked automatically during implementation
3. Referenced in verification checklists
4. Used as the development standard for all Superpowers skills themselves

**Sources**: [README.md124-131](https://github.com/obra/superpowers/blob/a01a135f/README.md#L124-L131) [README.md90-91](https://github.com/obra/superpowers/blob/a01a135f/README.md#L90-L91) [skills/writing-skills/testing-skills-with-subagents.md1-17](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L1-L17)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Test-Driven Development](#test-driven-development.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Skill File Structure](#skill-file-structure.md)
- [The Iron Law: No Code Without Failing Test](#the-iron-law-no-code-without-failing-test.md)
- [RED-GREEN-REFACTOR Cycle](#red-green-refactor-cycle.md)
- [Cycle Overview](#cycle-overview.md)
- [RED Phase: Write Failing Test](#red-phase-write-failing-test.md)
- [Verify RED: Watch It Fail](#verify-red-watch-it-fail.md)
- [GREEN Phase: Minimal Code](#green-phase-minimal-code.md)
- [Verify GREEN: Watch It Pass](#verify-green-watch-it-pass.md)
- [REFACTOR Phase: Clean Up](#refactor-phase-clean-up.md)
- [Integration with Development Workflows](#integration-with-development-workflows.md)
- [Preventing Rationalization: The Bulletproofing Process](#preventing-rationalization-the-bulletproofing-process.md)
- [Common Rationalizations and Counters](#common-rationalizations-and-counters.md)
- [Why Order Matters Section](#why-order-matters-section.md)
- [Red Flags List](#red-flags-list.md)
- [Verification Checklist](#verification-checklist.md)
- [Testing Anti-Patterns Reference](#testing-anti-patterns-reference.md)
- [Anti-Pattern 1: Testing Mock Behavior](#anti-pattern-1-testing-mock-behavior.md)
- [Anti-Pattern 2: Test-Only Methods in Production](#anti-pattern-2-test-only-methods-in-production.md)
- [Anti-Pattern 3: Mocking Without Understanding](#anti-pattern-3-mocking-without-understanding.md)
- [Anti-Pattern 4: Incomplete Mocks](#anti-pattern-4-incomplete-mocks.md)
- [Anti-Pattern 5: Integration Tests as Afterthought](#anti-pattern-5-integration-tests-as-afterthought.md)
- [Meta-Application: TDD for Skills Themselves](#meta-application-tdd-for-skills-themselves.md)
- [Mapping TDD Phases to Skill Testing](#mapping-tdd-phases-to-skill-testing.md)
- [Example: Bulletproofing the TDD Skill](#example-bulletproofing-the-tdd-skill.md)
- [Real-World Impact](#real-world-impact.md)
