# /obra/superpowers/8-creating-skills

Creating Skills | obra/superpowers | DeepWiki

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

# Creating Skills

Relevant source files

- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)

This page provides a complete guide to authoring new skills for the Superpowers system. It covers the TDD methodology applied to documentation, skill structure requirements, testing with pressure scenarios, optimization for Claude's search, and the contribution workflow.

For information about using existing skills, see [Finding and Invoking Skills](obra/superpowers/3.3-finding-and-invoking-skills.md). For skill management and repository structure, see [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md).

**Core Principle**: Creating skills IS Test-Driven Development applied to process documentation. You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Sources**: [skills/writing-skills/SKILL.md1-656](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L1-L656)

---

## Skills as Tested Documentation

A **skill** is a reusable reference guide for proven techniques, patterns, or tools. Skills help future AI agent instances find and apply effective approaches.

**Skills are**: Reusable techniques, patterns, tools, reference guides\
**Skills are NOT**: Narratives about how you solved a problem once

### The Iron Law

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS to existing skills. Write a skill before testing it? Delete it. Start over. Edit a skill without testing? Same violation.

**No exceptions**:

- Not for "simple additions"
- Not for "just adding a section"
- Not for "documentation updates"
- Don't keep untested changes as "reference"
- Don't "adapt" while running tests
- Delete means delete

This is the same Iron Law from [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md), applied to documentation instead of code.

**Sources**: [skills/writing-skills/SKILL.md374-393](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L374-L393)

---

## Skill Types

Different types of skills require different testing approaches:

| Skill Type               | Description                                 | Examples                                                    | Testing Focus                                                  |
| ------------------------ | ------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| **Technique**            | Concrete method with steps to follow        | `condition-based-waiting`, `root-cause-tracing`             | Application scenarios, edge cases, instruction gaps            |
| **Pattern**              | Way of thinking about problems              | `flatten-with-flags`, `test-invariants`                     | Recognition when pattern applies, counter-examples             |
| **Reference**            | API docs, syntax guides, tool documentation | `pptx`, `office-docs`                                       | Retrieval scenarios, application correctness, coverage gaps    |
| **Discipline-Enforcing** | Rules and requirements                      | `test-driven-development`, `verification-before-completion` | Academic understanding, pressure scenarios, combined stressors |

**Sources**: [skills/writing-skills/SKILL.md61-71](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L61-L71) [skills/writing-skills/SKILL.md395-442](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L395-L442)

---

## TDD Cycle for Skills

### Diagram: TDD Concepts Mapped to Skill Creation

```
```

**Sources**: [skills/writing-skills/SKILL.md30-44](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L30-L44) [skills/writing-skills/SKILL.md533-560](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L533-L560)

### Mapping Table

| TDD Concept             | Skill Creation Equivalent                        |
| ----------------------- | ------------------------------------------------ |
| **Test case**           | Pressure scenario with subagent                  |
| **Production code**     | Skill document (`SKILL.md`)                      |
| **Test fails (RED)**    | Agent violates rule without skill (baseline)     |
| **Test passes (GREEN)** | Agent complies with skill present                |
| **Refactor**            | Close loopholes while maintaining compliance     |
| **Write test first**    | Run baseline scenario BEFORE writing skill       |
| **Watch it fail**       | Document exact rationalizations agent uses       |
| **Minimal code**        | Write skill addressing those specific violations |
| **Watch it pass**       | Verify agent now complies                        |
| **Refactor cycle**      | Find new rationalizations → plug → re-verify     |

**Sources**: [skills/writing-skills/SKILL.md30-44](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L30-L44)

### RED Phase: Baseline Testing

Run pressure scenarios with a subagent WITHOUT the skill. Document exact behavior:

- What choices did they make?
- What rationalizations did they use (verbatim)?
- Which pressures triggered violations?

This is "watch the test fail" - you must see what agents naturally do before writing the skill.

### GREEN Phase: Write Minimal Skill

Write a skill that addresses those specific rationalizations. Don't add extra content for hypothetical cases.

Run the same scenarios WITH the skill. Agent should now comply.

### REFACTOR Phase: Close Loopholes

Agent found a new rationalization? Add an explicit counter. Re-test until bulletproof.

**Sources**: [skills/writing-skills/SKILL.md533-560](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L533-L560)

---

## Skill File Structure

### Directory Layout

```
```

**Flat namespace**: All skills in one searchable namespace under `skills/`.

**Use separate files only for**:

1. Heavy reference (100+ lines) - API docs, comprehensive syntax
2. Reusable tools - Scripts, utilities, templates

**Keep inline**:

- Principles and concepts
- Code patterns (< 50 lines)
- Everything else

**Sources**: [skills/writing-skills/SKILL.md72-92](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L72-L92) [skills/writing-skills/SKILL.md347-373](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L347-L373)

---

## SKILL.md Format

### YAML Frontmatter

Required fields only:

```
```

**Requirements**:

- Max 1024 characters total

- `name`: Letters, numbers, hyphens only (no parentheses or special characters)

- `description`: Third-person, describes ONLY when to use (NOT what it does)

  - Start with "Use when..." to focus on triggering conditions
  - Include specific symptoms, situations, contexts
  - **NEVER summarize the skill's process or workflow**
  - Keep under 500 characters if possible

**Why no workflow in description**: Testing revealed that when a description summarizes workflow, Claude may follow the description instead of reading the full skill content. A description saying "code review between tasks" caused Claude to do ONE review, even though the skill's flowchart showed TWO reviews (spec compliance then code quality). When changed to just triggering conditions, Claude correctly read and followed the full flowchart.

**Sources**: [skills/writing-skills/SKILL.md95-172](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L95-L172)

### Content Sections

```
```

**Sources**: [skills/writing-skills/SKILL.md93-138](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L93-L138)

---

## Testing Skills with Pressure Scenarios

### Testing by Skill Type

Different skill types require different test approaches:

#### Discipline-Enforcing Skills

Examples: `test-driven-development`, `verification-before-completion`, `designing-before-coding`

**Test with**:

- Academic questions: Do they understand the rules?
- Pressure scenarios: Do they comply under stress?
- Multiple pressures combined: time + sunk cost + exhaustion
- Identify rationalizations and add explicit counters

**Success criteria**: Agent follows rule under maximum pressure

#### Technique Skills

Examples: `condition-based-waiting`, `root-cause-tracing`, `defensive-programming`

**Test with**:

- Application scenarios: Can they apply the technique correctly?
- Variation scenarios: Do they handle edge cases?
- Missing information tests: Do instructions have gaps?

**Success criteria**: Agent successfully applies technique to new scenario

#### Pattern Skills

Examples: `reducing-complexity`, information-hiding concepts

**Test with**:

- Recognition scenarios: Do they recognize when pattern applies?
- Application scenarios: Can they use the mental model?
- Counter-examples: Do they know when NOT to apply?

**Success criteria**: Agent correctly identifies when/how to apply pattern

#### Reference Skills

Examples: API documentation, command references, library guides

**Test with**:

- Retrieval scenarios: Can they find the right information?
- Application scenarios: Can they use what they found correctly?
- Gap testing: Are common use cases covered?

**Success criteria**: Agent finds and correctly applies reference information

**Sources**: [skills/writing-skills/SKILL.md395-442](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L395-L442)

### Diagram: Pressure Testing Workflow

```
```

**Sources**: [skills/writing-skills/SKILL.md533-560](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L533-L560)

### Bulletproofing Against Rationalization

Skills that enforce discipline need to resist rationalization. Agents will find loopholes when under pressure.

#### Close Every Loophole Explicitly

Don't just state the rule - forbid specific workarounds:

**Bad**:

```
```

**Good**:

```
```

#### Build Rationalization Table

Capture rationalizations from baseline testing. Every excuse agents make goes in the table:

```
```

#### Create Red Flags List

Make it easy for agents to self-check when rationalizing:

```
```

**Sources**: [skills/writing-skills/SKILL.md459-524](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L459-L524)

### Common Rationalizations for Skipping Testing

| Excuse                         | Reality                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| "Skill is obviously clear"     | Clear to you ≠ clear to other agents. Test it.                   |
| "It's just a reference"        | References can have gaps, unclear sections. Test retrieval.      |
| "Testing is overkill"          | Untested skills have issues. Always. 15 min testing saves hours. |
| "I'll test if problems emerge" | Problems = agents can't use skill. Test BEFORE deploying.        |
| "Too tedious to test"          | Testing is less tedious than debugging bad skill in production.  |
| "I'm confident it's good"      | Overconfidence guarantees issues. Test anyway.                   |
| "Academic review is enough"    | Reading ≠ using. Test application scenarios.                     |
| "No time to test"              | Deploying untested skill wastes more time fixing it later.       |

**All of these mean: Test before deploying. No exceptions.**

**Sources**: [skills/writing-skills/SKILL.md444-457](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L444-L457)

---

## Claude Search Optimization (CSO)

Making skills discoverable is critical. Future Claude instances need to FIND your skill based on task context.

### Diagram: Skill Discovery Flow

```
```

**Sources**: [skills/writing-skills/SKILL.md140-273](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L140-L273)

### Description Field Optimization

**Purpose**: Claude reads the `description` field to decide which skills to load for a given task.

**Critical Rule**: Description = WHEN to use, NOT WHAT the skill does.

**Format**: Start with "Use when..." to focus on triggering conditions.

#### Examples

```
```

```
```

**Content Guidelines**:

- Use concrete triggers, symptoms, and situations
- Describe the *problem* (race conditions, inconsistent behavior) not *language-specific symptoms* (setTimeout, sleep)
- Keep triggers technology-agnostic unless the skill itself is technology-specific
- Write in third person (injected into system prompt)
- **NEVER summarize the skill's process or workflow**

**Sources**: [skills/writing-skills/SKILL.md144-197](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L144-L197)

### Keyword Coverage

Use words Claude would search for:

- **Error messages**: "Hook timed out", "ENOTEMPTY", "race condition"
- **Symptoms**: "flaky", "hanging", "zombie", "pollution"
- **Synonyms**: "timeout/hang/freeze", "cleanup/teardown/afterEach"
- **Tools**: Actual commands, library names, file types

**Sources**: [skills/writing-skills/SKILL.md199-206](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L199-L206)

### Descriptive Naming

**Use active voice, verb-first**:

- ✅ `creating-skills` not `skill-creation`
- ✅ `condition-based-waiting` not `async-test-helpers`
- ✅ `flatten-with-flags` > `data-structure-refactoring`
- ✅ `root-cause-tracing` > `debugging-techniques`

**Gerunds (-ing) work well for processes**:

- `creating-skills`, `testing-skills`, `debugging-with-logs`
- Active, describes the action you're taking

**Sources**: [skills/writing-skills/SKILL.md208-277](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L208-L277)

### Token Efficiency

**Problem**: Getting-started and frequently-referenced skills load into EVERY conversation. Every token counts.

**Target word counts**:

- getting-started workflows: <150 words each
- Frequently-loaded skills: <200 words total
- Other skills: <500 words (still be concise)

**Techniques**:

#### Move details to tool help

```
```

#### Use cross-references

```
```

#### Compress examples

```
```

**Verification**:

```
```

**Sources**: [skills/writing-skills/SKILL.md213-266](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L213-L266)

### Cross-Referencing Other Skills

Use skill name only, with explicit requirement markers:

- ✅ Good: `**REQUIRED SUB-SKILL:** Use superpowers:test-driven-development`
- ✅ Good: `**REQUIRED BACKGROUND:** You MUST understand superpowers:systematic-debugging`
- ❌ Bad: `See skills/testing/test-driven-development` (unclear if required)
- ❌ Bad: `@skills/testing/test-driven-development/SKILL.md` (force-loads, burns context)

**Why no @ links**: `@` syntax force-loads files immediately, consuming 200k+ context before you need them.

**Sources**: [skills/writing-skills/SKILL.md278-289](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L278-L289)

---

## Contributing Skills

### Skill Creation Checklist

Use TodoWrite to create todos for EACH checklist item:

#### RED Phase - Write Failing Test

- [ ] Create pressure scenarios (3+ combined pressures for discipline skills)
- [ ] Run scenarios WITHOUT skill - document baseline behavior verbatim
- [ ] Identify patterns in rationalizations/failures

#### GREEN Phase - Write Minimal Skill

- [ ] Name uses only letters, numbers, hyphens (no parentheses/special chars)
- [ ] YAML frontmatter with only `name` and `description` (max 1024 chars)
- [ ] Description starts with "Use when..." and includes specific triggers/symptoms
- [ ] Description written in third person
- [ ] Keywords throughout for search (errors, symptoms, tools)
- [ ] Clear overview with core principle
- [ ] Address specific baseline failures identified in RED
- [ ] Code inline OR link to separate file
- [ ] One excellent example (not multi-language)
- [ ] Run scenarios WITH skill - verify agents now comply

#### REFACTOR Phase - Close Loopholes

- [ ] Identify NEW rationalizations from testing
- [ ] Add explicit counters (if discipline skill)
- [ ] Build rationalization table from all test iterations
- [ ] Create red flags list
- [ ] Re-test until bulletproof

#### Quality Checks

- [ ] Small flowchart only if decision non-obvious
- [ ] Quick reference table
- [ ] Common mistakes section
- [ ] No narrative storytelling
- [ ] Supporting files only for tools or heavy reference

#### Deployment

- [ ] Commit skill to git and push to your fork (if configured)
- [ ] Consider contributing back via PR (if broadly useful)

**STOP: Before Moving to Next Skill**

After writing ANY skill, you MUST STOP and complete the deployment process.

**Do NOT**:

- Create multiple skills in batch without testing each
- Move to next skill before current one is verified
- Skip testing because "batching is more efficient"

The deployment checklist is MANDATORY for EACH skill. Deploying untested skills = deploying untested code. It's a violation of quality standards.

**Sources**: [skills/writing-skills/SKILL.md596-634](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L596-L634)

### Fork and PR Workflow

For skills you want to contribute to the main repository:

1. **Fork setup** (if not already done): The `initialize-skills.sh` script offers to fork the repository if GitHub CLI is available
2. **Branch-based development**: Create a branch for your new skill
3. **Testing**: Complete the full TDD cycle (RED-GREEN-REFACTOR)
4. **Commit and push**: Push to your fork
5. **Pull request**: Submit PR to `obra/superpowers-skills`

See [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md) for details on fork setup and [Dual Repository Design](obra/superpowers/4.1-dual-repository-design.md) for architecture context.

**Sources**: [skills/writing-skills/SKILL.md631-633](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L631-L633)

---

## Flowchart Usage

Use flowcharts ONLY for:

- Non-obvious decision points
- Process loops where you might stop too early
- "When to use A vs B" decisions

**Never use flowcharts for**:

- Reference material → Tables, lists
- Code examples → Markdown blocks
- Linear instructions → Numbered lists
- Labels without semantic meaning (step1, helper2)

### Visualization Tool

The `render-graphs.js` script renders flowcharts to SVG for sharing with your human partner:

```
```

The script:

- Extracts all ` ```dot ` blocks from `SKILL.md`
- Renders to SVG using graphviz
- Outputs to `diagrams/` subdirectory
- Also saves `.dot` source for debugging

**Sources**: [skills/writing-skills/SKILL.md290-322](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L290-L322) [skills/writing-skills/render-graphs.js1-169](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js#L1-L169)

---

## Code Examples

**One excellent example beats many mediocre ones**

Choose most relevant language:

- Testing techniques → TypeScript/JavaScript
- System debugging → Shell/Python
- Data processing → Python

**Good example**:

- Complete and runnable
- Well-commented explaining WHY
- From real scenario
- Shows pattern clearly
- Ready to adapt (not generic template)

**Don't**:

- Implement in 5+ languages
- Create fill-in-the-blank templates
- Write contrived examples

You're good at porting - one great example is enough.

**Sources**: [skills/writing-skills/SKILL.md324-346](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L324-L346)

---

## Anti-Patterns

| Anti-Pattern                | Why Bad                                                             | Better Approach                                                                        |
| --------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Narrative Example**       | "In session 2025-10-03, we found empty projectDir caused..."        | Too specific, not reusable. Use pattern-focused examples.                              |
| **Multi-Language Dilution** | `example-js.js`, `example-py.py`, `example-go.go`                   | Mediocre quality, maintenance burden. One excellent example in most relevant language. |
| **Code in Flowcharts**      | `step1 [label="import fs"];`                                        | Can't copy-paste, hard to read. Use markdown code blocks.                              |
| **Generic Labels**          | `helper1`, `helper2`, `step3`, `pattern4`                           | Labels should have semantic meaning.                                                   |
| **Workflow in Description** | `description: Use for TDD - write test first, watch fail, refactor` | Claude may follow description instead of reading skill. Use triggers only.             |
| **Force-Loading Files**     | `@skills/path/SKILL.md`                                             | Burns 200k+ context immediately. Use skill names with requirement markers.             |

**Sources**: [skills/writing-skills/SKILL.md562-582](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L562-L582) [skills/writing-skills/SKILL.md150-172](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L150-L172) [skills/writing-skills/SKILL.md278-289](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L278-L289)

---

## Summary

Creating skills follows the same TDD discipline as writing code:

1. **RED**: Run baseline without skill, document failures verbatim
2. **GREEN**: Write minimal skill addressing specific failures
3. **REFACTOR**: Close loopholes, build rationalization tables

**Key requirements**:

- Follow the Iron Law: No skill without failing test first
- Optimize description for triggering conditions (no workflow summary)
- Test with appropriate scenarios for skill type
- Use keyword coverage for discoverability
- Deploy one skill at a time with full checklist

If you follow TDD for code, follow it for skills. It's the same discipline applied to documentation.

**Sources**: [skills/writing-skills/SKILL.md647-656](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L647-L656)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Creating Skills](#creating-skills.md)
- [Skills as Tested Documentation](#skills-as-tested-documentation.md)
- [The Iron Law](#the-iron-law.md)
- [Skill Types](#skill-types.md)
- [TDD Cycle for Skills](#tdd-cycle-for-skills.md)
- [Diagram: TDD Concepts Mapped to Skill Creation](#diagram-tdd-concepts-mapped-to-skill-creation.md)
- [Mapping Table](#mapping-table.md)
- [RED Phase: Baseline Testing](#red-phase-baseline-testing.md)
- [GREEN Phase: Write Minimal Skill](#green-phase-write-minimal-skill.md)
- [REFACTOR Phase: Close Loopholes](#refactor-phase-close-loopholes.md)
- [Skill File Structure](#skill-file-structure.md)
- [Directory Layout](#directory-layout.md)
- [SKILL.md Format](#skillmd-format.md)
- [YAML Frontmatter](#yaml-frontmatter.md)
- [Content Sections](#content-sections.md)
- [Testing Skills with Pressure Scenarios](#testing-skills-with-pressure-scenarios.md)
- [Testing by Skill Type](#testing-by-skill-type.md)
- [Discipline-Enforcing Skills](#discipline-enforcing-skills.md)
- [Technique Skills](#technique-skills.md)
- [Pattern Skills](#pattern-skills.md)
- [Reference Skills](#reference-skills.md)
- [Diagram: Pressure Testing Workflow](#diagram-pressure-testing-workflow.md)
- [Bulletproofing Against Rationalization](#bulletproofing-against-rationalization.md)
- [Close Every Loophole Explicitly](#close-every-loophole-explicitly.md)
- [Build Rationalization Table](#build-rationalization-table.md)
- [Create Red Flags List](#create-red-flags-list.md)
- [Common Rationalizations for Skipping Testing](#common-rationalizations-for-skipping-testing.md)
- [Claude Search Optimization (CSO)](#claude-search-optimization-cso.md)
- [Diagram: Skill Discovery Flow](#diagram-skill-discovery-flow.md)
- [Description Field Optimization](#description-field-optimization.md)
- [Examples](#examples.md)
- [Keyword Coverage](#keyword-coverage.md)
- [Descriptive Naming](#descriptive-naming.md)
- [Token Efficiency](#token-efficiency.md)
- [Move details to tool help](#move-details-to-tool-help.md)
- [Use cross-references](#use-cross-references.md)
- [Compress examples](#compress-examples.md)
- [Cross-Referencing Other Skills](#cross-referencing-other-skills.md)
- [Contributing Skills](#contributing-skills.md)
- [Skill Creation Checklist](#skill-creation-checklist.md)
- [RED Phase - Write Failing Test](#red-phase---write-failing-test.md)
- [GREEN Phase - Write Minimal Skill](#green-phase---write-minimal-skill.md)
- [REFACTOR Phase - Close Loopholes](#refactor-phase---close-loopholes.md)
- [Quality Checks](#quality-checks.md)
- [Deployment](#deployment.md)
- [Fork and PR Workflow](#fork-and-pr-workflow.md)
- [Flowchart Usage](#flowchart-usage.md)
- [Visualization Tool](#visualization-tool.md)
- [Code Examples](#code-examples.md)
- [Anti-Patterns](#anti-patterns.md)
- [Summary](#summary.md)
