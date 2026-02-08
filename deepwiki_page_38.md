# /obra/superpowers/8.3-testing-skills-with-pressure-scenarios

Testing Skills with Pressure Scenarios | obra/superpowers | DeepWiki

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

# Testing Skills with Pressure Scenarios

Relevant source files

- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

This document explains how to validate skills using pressure scenarios and the RED-GREEN-REFACTOR cycle adapted for documentation. Pressure testing verifies that agents follow skill guidance when they have strong incentives to bypass it.

For information about creating the skill structure itself, see [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md). For the overall TDD methodology applied to skills, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md). For understanding the foundational TDD concepts, see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md).

## Overview

Pressure testing applies Test-Driven Development principles to process documentation. Instead of testing code, you test whether agents comply with documented processes under realistic constraints (time pressure, sunk cost, authority conflicts, exhaustion).

The core principle: if you didn't watch an agent fail without the skill, you don't know what behaviors the skill must prevent.

Pressure scenarios combine multiple constraints (3+) to simulate conditions where agents are tempted to rationalize away compliance. The methodology follows the same RED-GREEN-REFACTOR cycle as code TDD: baseline without skill (RED), write skill addressing failures (GREEN), close loopholes iteratively (REFACTOR).

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md1-17](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L1-L17) [skills/writing-skills/SKILL.md10-17](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L10-L17)

## TDD Mapping for Skill Testing

```
```

| TDD Phase               | Skill Testing                     | File Artifacts                     | Success Criteria                              |
| ----------------------- | --------------------------------- | ---------------------------------- | --------------------------------------------- |
| **Test case**           | Pressure scenario                 | Scenario markdown in test file     | 3+ combined pressures, forces explicit choice |
| **Production code**     | Skill document                    | `SKILL.md` in `skills/skill-name/` | Addresses specific baseline failures          |
| **Test fails (RED)**    | Agent violates rule without skill | Documented rationalizations        | Verbatim capture of agent excuses             |
| **Test passes (GREEN)** | Agent complies with skill         | Agent cites skill sections         | Chooses correct option under pressure         |
| **Refactor**            | Close loopholes                   | Updated `SKILL.md` sections        | No new rationalizations found                 |
| **Watch it fail**       | Run baseline scenario             | Test output logs                   | Agent failures documented                     |
| **Minimal code**        | Write skill addressing violations | Core sections in `SKILL.md`        | Minimal content for compliance                |
| **Watch it pass**       | Verify compliance                 | Test output showing success        | Agent follows rule with skill                 |
| **Refactor cycle**      | Find new rationalizations         | Rationalization table, red flags   | Agent bulletproof under max pressure          |

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md30-43](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L30-L43) [skills/writing-skills/SKILL.md32-44](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L32-L44)

## When to Use Pressure Testing

### Skills That Need Pressure Testing

Pressure testing applies to **discipline-enforcing skills** that have compliance costs and can be rationalized away:

- **Process enforcement skills**: TDD, verification-before-completion, designing-before-coding
- **Quality requirement skills**: Code review, testing requirements, documentation standards
- **Workflow control skills**: When to use worktrees, when to brainstorm, systematic debugging phases

These skills contradict immediate goals (speed over quality) and require agents to invest time/effort upfront. Agents under pressure will find creative rationalizations to bypass them.

### Skills That Don't Need Pressure Testing

- **Pure reference skills**: API documentation, syntax guides, command references
- **Technique skills without rules**: Patterns, mental models, implementation approaches
- **Skills without bypass incentives**: Tools with clear benefits, non-controversial practices

If there's no rule to violate and no cost to following the skill, pressure testing provides minimal value. Focus on application scenarios instead.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md17-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L17-L28)

## Pressure Types and Combinations

### Individual Pressure Types

```
```

| Pressure Type  | Example Constraint                           | Agent Rationalization Trigger            |
| -------------- | -------------------------------------------- | ---------------------------------------- |
| **Time**       | Production down, deploy window, deadline     | "No time for process, need quick fix"    |
| **Sunk Cost**  | 4 hours invested, 200 lines written          | "Wasteful to delete working code"        |
| **Authority**  | Senior says skip it, manager overrides       | "Not my decision, following orders"      |
| **Economic**   | Job performance, promotion, company survival | "Company needs this, process secondary"  |
| **Exhaustion** | End of day, already tired, dinner plans      | "Too exhausted for quality, commit now"  |
| **Social**     | Appearing inflexible, seeming dogmatic       | "Don't want to look rigid about rules"   |
| **Pragmatic**  | Being flexible vs. process-bound             | "Adapting process to reality, not blind" |

### Combining Pressures for Maximum Effect

Best pressure scenarios combine **3+ pressures simultaneously**. Single pressures are too easy to resist; multiple pressures create realistic decision conflicts.

**Example: Weak Single Pressure**

```
```

Only time pressure. Agent can easily resist with "Quality matters, fix properly."

**Example: Strong Triple Pressure**

```
```

Combines sunk cost (4 hours) + exhaustion (end of day) + time (dinner plans). Agent genuinely tempted to choose B or C.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md128-142](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L128-L142)

## RED Phase: Baseline Testing

### Running Baseline Scenarios

The RED phase establishes what agents naturally do **without** the skill. This is mandatory before writing any skill content.

```
```

### Baseline Test Structure

Baseline tests use specific markdown format with explicit constraints:

```
```

**Key elements:**

- `IMPORTANT:` header signals real scenario
- Concrete constraints (not hypothetical)
- Explicit A/B/C options force choice
- "Be honest" prevents academic responses

### Capturing Rationalizations

Document agent responses **verbatim**:

| Scenario Result             | Rationalization Example           | Pattern Identified              |
| --------------------------- | --------------------------------- | ------------------------------- |
| Agent chose B (skip tests)  | "I already manually tested it"    | Denies value of automated tests |
| Agent chose C (tests after) | "Tests after achieve same goals"  | Claims order doesn't matter     |
| Agent chose B               | "Being pragmatic not dogmatic"    | Spirit vs letter argument       |
| Agent chose C               | "Delete working code is wasteful" | Sunk cost rationalization       |
| Agent chose B               | "Following spirit of TDD"         | False equivalence claim         |

These verbatim captures become the foundation for skill content in the GREEN phase.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md44-81](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L44-L81) [skills/writing-skills/SKILL.md536-544](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L536-L544)

## GREEN Phase: Writing Minimal Skill

### Addressing Specific Baseline Failures

The GREEN phase writes skill content targeting **only** the rationalizations observed in baseline testing. Do not add hypothetical content.

```
```

### Example: Minimal Skill for Baseline Failures

**Baseline failures observed:**

- "I already manually tested it"
- "Tests after achieve same goals"
- "Deleting working code is wasteful"

**Minimal skill content addressing these:**

```
```

### Verification Testing

After writing minimal skill:

1. **Re-run baseline scenarios** with skill present
2. **Verify agent chooses A** (rule-compliant option)
3. **Check citations**: Agent should cite new skill sections
4. **Document any new rationalizations** for REFACTOR phase

If agent still violates with skill present, the skill content is insufficient or unclear. Revise before moving to REFACTOR.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md83-90](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L83-L90) [skills/writing-skills/SKILL.md545-554](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L545-L554)

## REFACTOR Phase: Closing Loopholes

### Identifying New Rationalizations

The REFACTOR phase iteratively hardens skills against new bypass attempts discovered during testing.

```
```

### Four-Step Loophole Closure

For each new rationalization discovered, add all four elements:

| Element                            | Location in `SKILL.md`       | Purpose                              |
| ---------------------------------- | ---------------------------- | ------------------------------------ |
| **1. Explicit Negation**           | Rules section                | Close specific loophole directly     |
| **2. Rationalization Table Entry** | `## Common Rationalizations` | Document excuse + counter-argument   |
| **3. Red Flag Entry**              | `## Red Flags - STOP`        | Quick self-check list for agents     |
| **4. Description Update**          | YAML frontmatter             | Add violation symptoms for discovery |

### Example Loophole Closure

**New rationalization captured:**

> "I'll keep the code as reference while writing tests first. That way I can adapt the proven solution."

**1. Explicit Negation (added to rules):**

```
```

**2. Rationalization Table Entry:**

```
```

**3. Red Flag Entry:**

```
```

**4. Description Update:**

```
```

### Re-verification After Each Closure

After closing a loophole:

1. **Re-run test** with updated skill
2. **Verify agent now complies** (no longer uses that rationalization)
3. **Check for new rationalizations** (agents find creative alternatives)
4. **Continue cycle** until no new rationalizations appear

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md164-237](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L164-L237) [skills/writing-skills/SKILL.md459-524](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L459-L524)

## Rationalization Tables

### Building the Table Iteratively

Rationalization tables document every excuse observed across all testing iterations. They serve as explicit counters for common bypass attempts.

```
```

### Table Structure

Format from actual skills:

```
```

### Counter-Argument Patterns

Effective counters use these patterns:

| Pattern                      | Example                                | Why It Works                      |
| ---------------------------- | -------------------------------------- | --------------------------------- |
| **Reframe terminology**      | "Pragmatic = proven practices"         | Changes meaning of loaded term    |
| **Expose hidden cost**       | "Test takes 30 seconds"                | Shows excuse overstates burden    |
| **Reveal false equivalence** | "Tests-after ≠ tests-first"            | Breaks "same result" claim        |
| **Appeal to principle**      | "Violating letter is violating spirit" | Cuts off entire class of excuses  |
| **Acknowledge temptation**   | "All violations feel different"        | Validates feeling, maintains rule |

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md202-209](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L202-L209) [skills/writing-skills/SKILL.md498-508](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L498-L508)

## Red Flags Lists

### Purpose and Format

Red flags provide agents a quick self-check when they notice rationalization patterns. Located in a prominent section of `SKILL.md`.

```
```

### Red Flags Workflow in Agent Decision Making

```
```

Red flags enable rapid self-correction. Agents recognize their rationalization pattern before articulating the full excuse.

**Sources:** [skills/writing-skills/SKILL.md509-524](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L509-L524)

## Meta-Testing Techniques

### Diagnosing Why Skills Fail

When agents violate rules despite having the skill, meta-testing diagnoses the root cause.

**Meta-test prompt format:**

```
```

### Three Response Categories

```
```

| Response Type                   | Root Cause                  | Fix Strategy                             | Example                                               |
| ------------------------------- | --------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| "Skill was clear, I ignored it" | Weak foundational principle | Add principle that cuts off excuse class | "Violating letter IS violating spirit"                |
| "Skill should have said X"      | Missing content             | Add agent's exact suggestion             | Agent: "Should forbid 'keep as reference'" → Add that |
| "I didn't see section Y"        | Poor organization           | Restructure for prominence               | Move critical rules to Overview                       |

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md240-265](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L240-L265)

## Bulletproofing Verification

### Success Criteria

A skill is bulletproof when:

```
```

### Bulletproof Indicators

| Indicator                             | What It Shows            | Example Agent Response                             |
| ------------------------------------- | ------------------------ | -------------------------------------------------- |
| **Correct choice under max pressure** | Rule compliance          | "Choosing A despite sunk cost"                     |
| **Cites specific skill sections**     | Used skill as reference  | "The 'No Exceptions' section says..."              |
| **Acknowledges temptation**           | Understands pressure     | "I'm tempted to choose C, but the rule is clear"   |
| **Meta-test: "was clear"**            | Documentation sufficient | "The skill was crystal clear. I should follow it." |

### Not Bulletproof Indicators

| Indicator                 | What It Shows            | Next Action                    |
| ------------------------- | ------------------------ | ------------------------------ |
| Finds new rationalization | Loophole exists          | Add counter to REFACTOR phase  |
| Argues skill is wrong     | Missing justification    | Add "Why this matters" section |
| Creates hybrid approach   | Ambiguous wording        | Make rules more explicit       |
| Asks permission strongly  | Authority bypass opening | Add "No exceptions" section    |

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md267-280](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L267-L280)

## Complete Testing Workflow

### End-to-End Process

```
```

### Testing Checklist

Use this checklist for each skill requiring pressure testing:

**RED Phase - Baseline:**

- [ ] Create 3+ pressure scenarios combining time, sunk cost, exhaustion
- [ ] Run scenarios WITHOUT skill present (`rm skills/skill-name/SKILL.md`)
- [ ] Document agent choice (A, B, or C) for each scenario
- [ ] Capture rationalizations verbatim (exact wording)
- [ ] Identify patterns in excuses across scenarios
- [ ] Note which pressure combinations triggered violations

**GREEN Phase - Initial Skill:**

- [ ] Write skill addressing only baseline failures (minimal content)
- [ ] Include core principle in Overview
- [ ] Add sections countering specific rationalizations observed
- [ ] Run same scenarios WITH skill present
- [ ] Verify agent now chooses rule-compliant option
- [ ] Verify agent cites skill sections as justification

**REFACTOR Phase - Iterative Hardening:**

- [ ] Run max pressure scenarios (5+ combined pressures)
- [ ] Capture NEW rationalizations not seen before
- [ ] For each rationalization: add explicit negation to rules
- [ ] For each rationalization: add entry to rationalization table
- [ ] For each rationalization: add entry to red flags list
- [ ] Update frontmatter description with violation symptoms
- [ ] Re-test all scenarios with updated skill
- [ ] Meta-test: ask agent how skill could be clearer
- [ ] Continue until no new rationalizations appear
- [ ] Verify bulletproof: correct choice + cites skill + acknowledges temptation

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md308-331](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L308-L331)

## Example Pressure Scenarios

### Scenario Template Structure

Effective pressure scenarios follow this structure:

```
```

### Example 1: TDD Skill Test

**File:** Testing `skills/test-driven-development/SKILL.md`

```
```

**Pressures combined:** Sunk cost (3 hours, 200 lines) + Time (dinner plans) + Exhaustion (end of day) + Economic (code review deadline)

### Example 2: Systematic Debugging Test

**File:** Testing `skills/systematic-debugging/SKILL.md`

```
```

**Pressures combined:** Time (15 min deploy window) + Economic ($8k/min loss) + Authority (manager directive) + Sunk cost (2 days work) + Social (appearing slow)

### Example 3: Brainstorming Skill Test

**File:** Testing `skills/brainstorming/SKILL.md`

```
```

**Pressures combined:** Authority (human partner directive) + Confidence (you know how) + Time (partner wants speed) + Social (appearing to slow things down)

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md96-160](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L96-L160) [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md6-52](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md#L6-L52)

## File Structure for Test Artifacts

### Test File Organization

```
skills/skill-name/
├── SKILL.md                          # Main skill document
├── tests/
│   ├── baseline-test.md             # RED phase scenarios without skill
│   ├── baseline-results.md          # Captured rationalizations from baseline
│   ├── pressure-test.md             # GREEN/REFACTOR scenarios with skill
│   └── bulletproof-verification.md  # Final max-pressure tests
└── diagrams/                         # Generated SVGs (optional)
    └── flowchart.svg
```

### Test Result Documentation Format

**File:** `skills/skill-name/tests/baseline-results.md`

```
```

This documentation structure becomes the foundation for GREEN phase skill content.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md44-90](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L44-L90)

## Integration with Writing Skills Workflow

### When Pressure Testing Occurs in Skill Creation

```
```

### Relationship to Other Testing Approaches

| Testing Type              | Purpose                             | When to Use                 | File Reference                          |
| ------------------------- | ----------------------------------- | --------------------------- | --------------------------------------- |
| **Pressure scenarios**    | Verify compliance under constraints | Discipline-enforcing skills | `testing-skills-with-subagents.md`      |
| **Application scenarios** | Verify technique works              | Technique/pattern skills    | `writing-skills/SKILL.md`               |
| **Academic questions**    | Verify understanding                | All skill types             | `writing-skills/SKILL.md`               |
| **Retrieval testing**     | Verify discoverability              | Reference skills            | `writing-skills/SKILL.md` (CSO section) |
| **Integration tests**     | Verify end-to-end workflow          | Workflow skills             | `tests/claude-code/` directory          |

For overall skill creation workflow, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md). For skill structure requirements, see [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md). For foundational TDD concepts, see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md).

**Sources:** [skills/writing-skills/SKILL.md395-435](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L395-L435) [skills/writing-skills/testing-skills-with-subagents.md1-43](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L1-L43)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Testing Skills with Pressure Scenarios](#testing-skills-with-pressure-scenarios.md)
- [Overview](#overview.md)
- [TDD Mapping for Skill Testing](#tdd-mapping-for-skill-testing.md)
- [When to Use Pressure Testing](#when-to-use-pressure-testing.md)
- [Skills That Need Pressure Testing](#skills-that-need-pressure-testing.md)
- [Skills That Don't Need Pressure Testing](#skills-that-dont-need-pressure-testing.md)
- [Pressure Types and Combinations](#pressure-types-and-combinations.md)
- [Individual Pressure Types](#individual-pressure-types.md)
- [Combining Pressures for Maximum Effect](#combining-pressures-for-maximum-effect.md)
- [RED Phase: Baseline Testing](#red-phase-baseline-testing.md)
- [Running Baseline Scenarios](#running-baseline-scenarios.md)
- [Baseline Test Structure](#baseline-test-structure.md)
- [Capturing Rationalizations](#capturing-rationalizations.md)
- [GREEN Phase: Writing Minimal Skill](#green-phase-writing-minimal-skill.md)
- [Addressing Specific Baseline Failures](#addressing-specific-baseline-failures.md)
- [Example: Minimal Skill for Baseline Failures](#example-minimal-skill-for-baseline-failures.md)
- [Verification Testing](#verification-testing.md)
- [REFACTOR Phase: Closing Loopholes](#refactor-phase-closing-loopholes.md)
- [Identifying New Rationalizations](#identifying-new-rationalizations.md)
- [Four-Step Loophole Closure](#four-step-loophole-closure.md)
- [Example Loophole Closure](#example-loophole-closure.md)
- [Re-verification After Each Closure](#re-verification-after-each-closure.md)
- [Rationalization Tables](#rationalization-tables.md)
- [Building the Table Iteratively](#building-the-table-iteratively.md)
- [Table Structure](#table-structure.md)
- [Counter-Argument Patterns](#counter-argument-patterns.md)
- [Red Flags Lists](#red-flags-lists.md)
- [Purpose and Format](#purpose-and-format.md)
- [Red Flags Workflow in Agent Decision Making](#red-flags-workflow-in-agent-decision-making.md)
- [Meta-Testing Techniques](#meta-testing-techniques.md)
- [Diagnosing Why Skills Fail](#diagnosing-why-skills-fail.md)
- [Three Response Categories](#three-response-categories.md)
- [Bulletproofing Verification](#bulletproofing-verification.md)
- [Success Criteria](#success-criteria.md)
- [Bulletproof Indicators](#bulletproof-indicators.md)
- [Not Bulletproof Indicators](#not-bulletproof-indicators.md)
- [Complete Testing Workflow](#complete-testing-workflow.md)
- [End-to-End Process](#end-to-end-process.md)
- [Testing Checklist](#testing-checklist.md)
- [Example Pressure Scenarios](#example-pressure-scenarios.md)
- [Scenario Template Structure](#scenario-template-structure.md)
- [Example 1: TDD Skill Test](#example-1-tdd-skill-test.md)
- [Example 2: Systematic Debugging Test](#example-2-systematic-debugging-test.md)
- [Example 3: Brainstorming Skill Test](#example-3-brainstorming-skill-test.md)
- [File Structure for Test Artifacts](#file-structure-for-test-artifacts.md)
- [Test File Organization](#test-file-organization.md)
- [Test Result Documentation Format](#test-result-documentation-format.md)
- [Integration with Writing Skills Workflow](#integration-with-writing-skills-workflow.md)
- [When Pressure Testing Occurs in Skill Creation](#when-pressure-testing-occurs-in-skill-creation.md)
- [Relationship to Other Testing Approaches](#relationship-to-other-testing-approaches.md)
