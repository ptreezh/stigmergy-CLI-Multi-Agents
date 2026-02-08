# /obra/superpowers/8.1-writing-skills-with-tdd

Writing Skills with TDD | obra/superpowers | DeepWiki

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

# Writing Skills with TDD

Relevant source files

- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

This document explains how to create new skills using Test-Driven Development principles. Skills are process documentation, and creating them follows the same RED-GREEN-REFACTOR cycle as writing code: baseline testing without the skill (RED), writing the minimal skill to address observed failures (GREEN), and iteratively closing loopholes through pressure scenarios (REFACTOR).

For skill structure and YAML frontmatter requirements, see [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md). For pressure scenario techniques and rationalization tables, see [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md). For making skills discoverable, see [Claude Search Optimization](obra/superpowers/8.4-claude-search-optimization-\(cso\).md). For the TDD principles that this methodology adapts, see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md).

---

## The Core Principle: Skills as Production Code

Skills are not narratives or documentation about problems you solved. They are **production documentation** - reusable process guides that future AI instances will follow. Just as you wouldn't deploy untested code, you shouldn't deploy untested skills.

[skills/writing-skills/SKILL.md10](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L10-L10) states: "Writing skills IS Test-Driven Development applied to process documentation."

The fundamental rule at [skills/writing-skills/SKILL.md374-378](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L374-L378):

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to new skills AND edits to existing skills. Write a skill before testing? Delete it. Edit without testing? Same violation. No exceptions.

**Sources:** [skills/writing-skills/SKILL.md1-656](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L1-L656)

---

## TDD Mapping: From Code to Documentation

```
```

**TDD Concept-to-Skill Mapping**

| TDD Concept         | Skill Creation                                   | Verification                                   |
| ------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Test case           | Pressure scenario with subagent                  | Agent faces realistic task with pressures      |
| Production code     | `SKILL.md` document                              | Agent reads and follows skill                  |
| Test fails (RED)    | Agent violates rule without skill                | Document exact rationalizations verbatim       |
| Test passes (GREEN) | Agent complies with skill present                | Agent chooses correct option under pressure    |
| Refactor            | Close loopholes while maintaining compliance     | Add explicit counters for new rationalizations |
| Write test first    | Run baseline scenario BEFORE writing skill       | Must see what agents naturally do              |
| Watch it fail       | Document exact rationalizations agent uses       | Capture word-for-word excuses                  |
| Minimal code        | Write skill addressing those specific violations | Only fix observed failures, not hypotheticals  |
| Watch it pass       | Verify agent now complies                        | Re-run scenarios with skill present            |
| Refactor cycle      | Find new rationalizations → plug → re-verify     | Continue until bulletproof                     |

**Sources:** [skills/writing-skills/SKILL.md30-45](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L30-L45) [skills/writing-skills/testing-skills-with-subagents.md30-41](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L30-L41)

---

## Phase 1: RED - Baseline Testing (Watch It Fail)

### The Baseline Test Protocol

Before writing any skill content, you must run pressure scenarios WITHOUT the skill and document what agents naturally do. This is identical to writing a failing test first in TDD.

```
```

### Creating Effective Pressure Scenarios

Pressure scenarios must combine multiple stressors to force realistic choices. Single-pressure scenarios fail because agents easily resist them.

**Pressure Types to Combine:**

| Pressure Type     | Example Trigger                                   |
| ----------------- | ------------------------------------------------- |
| Time              | Emergency, deadline, deploy window closing        |
| Sunk cost         | Hours of work already invested, "waste" to delete |
| Authority         | Senior engineer says skip it, manager overrides   |
| Economic          | Job security, company survival at stake           |
| Exhaustion        | End of day, tired, wants to finish                |
| Social            | Looking dogmatic, seeming inflexible to team      |
| Pragmatic framing | "Being pragmatic vs dogmatic" argument            |

**Bad Scenario (No Pressure):**

```
```

This is academic - agent just recites the skill.

**Good Scenario (Multiple Pressures):**

```
```

This combines: sunk cost + time pressure + exhaustion + social consequences. Forces explicit choice.

### Documenting Baseline Failures

From [skills/writing-skills/testing-skills-with-subagents.md59-80](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L59-L80) the baseline test captures:

```
```

**You must document exact wording.** Generic notes like "agent was wrong" don't tell you what to prevent. Verbatim rationalizations become entries in your rationalization table.

**RED Phase Checklist:**

- [ ] Create pressure scenarios (3+ combined pressures)
- [ ] Run scenarios WITHOUT skill - give agents realistic task
- [ ] Document choices and rationalizations word-for-word
- [ ] Identify patterns - which excuses appear repeatedly?
- [ ] Note effective pressures - which scenarios trigger violations?

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md43-81](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L43-L81) [skills/writing-skills/SKILL.md537-545](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L537-L545)

---

## Phase 2: GREEN - Write Minimal Skill (Make It Pass)

### Write Only What Addresses Observed Failures

The GREEN phase writes the minimal skill that addresses the specific baseline failures you documented. Do not add extra content for hypothetical cases - write just enough to prevent the actual failures you observed.

```
```

### Addressing Specific Rationalizations

If baseline testing revealed "I already manually tested it" as a rationalization, the skill must explicitly counter it:

**Generic (Weak):**

```
```

**Specific (Strong):**

```
```

### The Required Skill Structure

Every skill needs at minimum:

1. **YAML frontmatter** with `name` and `description` fields
2. **Overview** with core principle in 1-2 sentences
3. **When to Use** with symptoms and use cases
4. **Core Pattern** showing what to do (for technique skills)
5. **Rationalization table** (for discipline-enforcing skills)

From [skills/writing-skills/SKILL.md94-137](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L94-L137) the basic template:

```
```

**GREEN Phase Checklist:**

- [ ] Name uses only letters, numbers, hyphens
- [ ] YAML frontmatter with name and description (max 1024 chars)
- [ ] Description starts with "Use when..." and includes triggers
- [ ] Clear overview with core principle
- [ ] Address specific baseline failures from RED
- [ ] Run scenarios WITH skill - verify agents now comply

**Sources:** [skills/writing-skills/SKILL.md546-550](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L546-L550) [skills/writing-skills/SKILL.md94-137](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L94-L137) [skills/writing-skills/testing-skills-with-subagents.md82-89](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L82-L89)

---

## Phase 3: REFACTOR - Close Loopholes (Stay Green)

### The Iterative Bulletproofing Process

Agents are intelligent and will find loopholes when under pressure. The REFACTOR phase iteratively discovers and closes these holes while maintaining compliance.

```
```

### Plugging Each Hole Systematically

When an agent violates the rule despite having the skill, capture the new rationalization and add four types of counters:

**1. Explicit Negation in Rules Section**

From [skills/writing-skills/testing-skills-with-subagents.md182-200](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L182-L200):

Before:

```
```

After:

```
```

**2. Entry in Rationalization Table**

Add to the table that compares excuse vs reality:

```
```

**3. Red Flag Entry**

Create a checklist of violation symptoms:

```
```

**4. Update Description with Violation Symptoms**

From [skills/writing-skills/testing-skills-with-subagents.md220-225](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L220-L225):

```
```

Add symptoms of ABOUT to violate (not just when to use).

### Meta-Testing for Clarity Issues

After an agent chooses the wrong option, ask:

```
```

Three possible responses indicate different fixes:

| Agent Response                              | Problem                   | Fix                                                                |
| ------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| "The skill WAS clear, I chose to ignore it" | Not documentation problem | Add foundational principle: "Violating letter is violating spirit" |
| "The skill should have said X"              | Documentation gap         | Add their suggestion verbatim                                      |
| "I didn't see section Y"                    | Organization problem      | Make key points more prominent, add principle early                |

### Bulletproof Status Criteria

From [skills/writing-skills/testing-skills-with-subagents.md268-281](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L268-L281) a skill is bulletproof when:

1. Agent chooses correct option under maximum pressure
2. Agent cites skill sections as justification
3. Agent acknowledges temptation but follows rule anyway
4. Meta-testing reveals "skill was clear, I should follow it"

**Not bulletproof if:**

- Agent finds new rationalizations
- Agent argues skill is wrong
- Agent creates "hybrid approaches"
- Agent asks permission but argues strongly for violation

**REFACTOR Phase Checklist:**

- [ ] Identify NEW rationalizations from testing
- [ ] Add explicit counters (if discipline skill)
- [ ] Build rationalization table from all test iterations
- [ ] Create red flags list
- [ ] Update description with violation symptoms
- [ ] Re-test until bulletproof

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md164-240](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L164-L240) [skills/writing-skills/SKILL.md551-561](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L551-L561) [skills/writing-skills/testing-skills-with-subagents.md268-281](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L268-L281)

---

## Complete RED-GREEN-REFACTOR Example

The following shows the iterative bulletproofing process for a TDD skill from [skills/writing-skills/testing-skills-with-subagents.md283-306](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L283-L306):

### Iteration 0: Initial Test (RED - Failed)

```
Scenario: 200 lines done, forgot TDD, exhausted, dinner plans
Agent WITHOUT skill chose: C (write tests after)
Rationalization: "Tests after achieve same goals"
```

### Iteration 1: Write Minimal Skill (GREEN)

Added section: "Why Order Matters" explaining tests-first vs tests-after.

Re-tested with skill present:

```
Agent STILL chose: C (write tests after)
New rationalization: "Spirit not letter - I'm achieving the same purpose"
```

GREEN phase failed - skill didn't prevent violation.

### Iteration 2: Add Foundational Principle (REFACTOR)

Added early in skill:

```
```

Re-tested:

```
Agent chose: A (delete it)
Cited: New principle directly
Meta-test response: "Skill was clear, I should follow it"
```

**Bulletproof achieved.**

This demonstrates the complete cycle:

1. RED: Baseline test reveals "tests after achieve same goals" rationalization
2. GREEN: Add explanation of why order matters
3. VERIFY GREEN: Test fails with new rationalization
4. REFACTOR: Add foundational principle cutting off entire class of "spirit vs letter" arguments
5. VERIFY GREEN: Test passes, meta-test confirms clarity

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md283-306](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L283-L306)

---

## Skill Types and Testing Approaches

Different skill types require different test strategies:

### Discipline-Enforcing Skills

**Examples:** test-driven-development, verification-before-completion, designing-before-coding

**Test with:**

- Academic questions: Do they understand the rules?
- Pressure scenarios: Do they comply under stress?
- Multiple pressures combined: time + sunk cost + exhaustion
- Identify rationalizations and add explicit counters

**Success criteria:** Agent follows rule under maximum pressure

### Technique Skills

**Examples:** condition-based-waiting, root-cause-tracing, defensive-programming

**Test with:**

- Application scenarios: Can they apply the technique correctly?
- Variation scenarios: Do they handle edge cases?
- Missing information tests: Do instructions have gaps?

**Success criteria:** Agent successfully applies technique to new scenario

### Pattern Skills

**Examples:** reducing-complexity, information-hiding concepts

**Test with:**

- Recognition scenarios: Do they recognize when pattern applies?
- Application scenarios: Can they use the mental model?
- Counter-examples: Do they know when NOT to apply?

**Success criteria:** Agent correctly identifies when/how to apply pattern

### Reference Skills

**Examples:** API documentation, command references, library guides

**Test with:**

- Retrieval scenarios: Can they find the right information?
- Application scenarios: Can they use what they found correctly?
- Gap testing: Are common use cases covered?

**Success criteria:** Agent finds and correctly applies reference information

**Sources:** [skills/writing-skills/SKILL.md396-443](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L396-L443)

---

## Common Rationalization Catalog

From baseline testing across multiple skills, these rationalizations appear repeatedly:

| Excuse                           | Reality                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| "Skill is obviously clear"       | Clear to you ≠ clear to other agents. Test it.                        |
| "It's just a reference"          | References can have gaps, unclear sections. Test retrieval.           |
| "Testing is overkill"            | Untested skills have issues. Always. 15 min testing saves hours.      |
| "I'll test if problems emerge"   | Problems = agents can't use skill. Test BEFORE deploying.             |
| "Too tedious to test"            | Testing is less tedious than debugging bad skill in production.       |
| "I'm confident it's good"        | Overconfidence guarantees issues. Test anyway.                        |
| "Academic review is enough"      | Reading ≠ using. Test application scenarios.                          |
| "No time to test"                | Deploying untested skill wastes more time fixing it later.            |
| "Too simple to test"             | Simple documentation breaks. Test takes 5 minutes.                    |
| "I'll test after"                | Skills passing immediately prove nothing about preventing failures.   |
| "Tests after achieve same goals" | Tests-after = "does it work?" Tests-first = "prevents what failures?" |
| "It's about spirit not ritual"   | Violating letter is violating spirit. No exceptions.                  |

**All of these mean: Test before deploying. No exceptions.**

**Sources:** [skills/writing-skills/SKILL.md445-457](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L445-L457)

---

## Testing Checklist (TDD for Skills)

Before deploying any skill, verify you followed RED-GREEN-REFACTOR:

**RED Phase:**

- [ ] Created pressure scenarios (3+ combined pressures)
- [ ] Ran scenarios WITHOUT skill (baseline)
- [ ] Documented agent failures and rationalizations verbatim
- [ ] Identified patterns in baseline failures

**GREEN Phase:**

- [ ] Wrote skill addressing specific baseline failures
- [ ] Added required YAML frontmatter (name, description)
- [ ] Added required sections (Overview, When to Use, Core Pattern)
- [ ] Ran scenarios WITH skill
- [ ] Agent now complies

**REFACTOR Phase:**

- [ ] Identified NEW rationalizations from testing
- [ ] Added explicit counters for each loophole
- [ ] Updated rationalization table with all test iterations
- [ ] Updated red flags list
- [ ] Updated description with violation symptoms
- [ ] Re-tested - agent still complies
- [ ] Meta-tested to verify clarity
- [ ] Agent follows rule under maximum pressure

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md308-331](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L308-L331) [skills/writing-skills/SKILL.md596-634](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L596-L634)

---

## Real-World Example: CLAUDE.md Testing Campaign

The [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md) file demonstrates a complete test campaign for documentation variants.

### Test Scenarios Designed

**Scenario 1: Time Pressure + Confidence**

```
```

**Scenario 2: Sunk Cost + Works Already**

```
```

**Scenario 3: Authority + Speed Bias**

```
```

### Documentation Variants Tested

The campaign tests 4 different CLAUDE.md documentation styles:

1. **NULL**: No mention of skills (baseline)
2. **Soft Suggestion**: "Consider checking for skills"
3. **Directive**: "Before working on any task, check..."
4. **Emphatic**: `<important_info_about_skills>` with strong language

### Success Criteria

Variant succeeds if:

- Agent checks for skills unprompted
- Agent reads skill completely before acting
- Agent follows skill guidance under pressure
- Agent can't rationalize away compliance

This demonstrates TDD for documentation at meta-level: testing different documentation approaches to find what actually makes agents discover and use skills under pressure.

**Sources:** [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md1-190](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md#L1-L190)

---

## Anti-Patterns to Avoid

### Skipping RED Phase

**Problem:** Writing skill before running baseline tests reveals what YOU think needs preventing, not what ACTUALLY needs preventing.

**Fix:** Always run baseline scenarios first. Watch agents fail without the skill.

### Weak Test Cases

**Problem:** Single-pressure scenarios let agents easily resist. "Production down" alone isn't enough.

**Fix:** Combine 3+ pressures (time + sunk cost + exhaustion).

### Not Capturing Exact Failures

**Problem:** Generic notes like "agent was wrong" don't tell you what to prevent.

**Fix:** Document exact rationalizations verbatim. These become table entries.

### Vague Fixes

**Problem:** "Don't cheat" doesn't work. Too abstract.

**Fix:** Add explicit negations: "Don't keep as reference" - addresses specific excuse.

### Stopping After First Pass

**Problem:** Tests passing once ≠ bulletproof. Agents find new loopholes.

**Fix:** Continue REFACTOR cycle until no new rationalizations emerge.

### Testing After Writing

**Problem:** Testing after writing is just like writing tests after code - validates current implementation, doesn't drive design.

**Fix:** Run baseline WITHOUT skill first. This is the Iron Law.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md332-357](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L332-L357) [skills/writing-skills/SKILL.md374-394](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L374-L394)

---

## The Iron Law: Same as Code TDD

From [skills/writing-skills/SKILL.md374-394](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L374-L394):

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS to existing skills.

Write skill before testing? **Delete it. Start over.**

Edit skill without testing? **Same violation.**

**No exceptions:**

- Not for "simple additions"
- Not for "just adding a section"
- Not for "documentation updates"
- Don't keep untested changes as "reference"
- Don't "adapt" while running tests
- Delete means delete

The superpowers:test-driven-development skill at [7.2](obra/superpowers/7.2-test-driven-development.md) explains why this matters. Same principles apply to documentation.

**Sources:** [skills/writing-skills/SKILL.md374-394](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L374-L394)

---

## Quick Reference: TDD Cycle for Skills

| Phase            | Action                     | Verification                           | Output                                   |
| ---------------- | -------------------------- | -------------------------------------- | ---------------------------------------- |
| **RED**          | Run scenario without skill | Agent fails, rationalizes              | Documented baseline failures (verbatim)  |
| **Verify RED**   | Capture exact wording      | Have word-for-word rationalizations    | Rationalization list for GREEN phase     |
| **GREEN**        | Write minimal skill        | Agent now complies                     | Working SKILL.md addressing failures     |
| **Verify GREEN** | Re-test scenarios          | Agent follows rule under pressure      | Passing test with skill present          |
| **REFACTOR**     | Close loopholes            | Add counters for new rationalizations  | Updated SKILL.md with explicit negations |
| **Stay GREEN**   | Re-verify                  | Agent still complies after refactoring | Bulletproof skill                        |

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md30-41](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L30-L41) [skills/writing-skills/testing-skills-with-subagents.md358-368](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L358-L368)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Writing Skills with TDD](#writing-skills-with-tdd.md)
- [The Core Principle: Skills as Production Code](#the-core-principle-skills-as-production-code.md)
- [TDD Mapping: From Code to Documentation](#tdd-mapping-from-code-to-documentation.md)
- [Phase 1: RED - Baseline Testing (Watch It Fail)](#phase-1-red---baseline-testing-watch-it-fail.md)
- [The Baseline Test Protocol](#the-baseline-test-protocol.md)
- [Creating Effective Pressure Scenarios](#creating-effective-pressure-scenarios.md)
- [Documenting Baseline Failures](#documenting-baseline-failures.md)
- [Phase 2: GREEN - Write Minimal Skill (Make It Pass)](#phase-2-green---write-minimal-skill-make-it-pass.md)
- [Write Only What Addresses Observed Failures](#write-only-what-addresses-observed-failures.md)
- [Addressing Specific Rationalizations](#addressing-specific-rationalizations.md)
- [The Required Skill Structure](#the-required-skill-structure.md)
- [Phase 3: REFACTOR - Close Loopholes (Stay Green)](#phase-3-refactor---close-loopholes-stay-green.md)
- [The Iterative Bulletproofing Process](#the-iterative-bulletproofing-process.md)
- [Plugging Each Hole Systematically](#plugging-each-hole-systematically.md)
- [Meta-Testing for Clarity Issues](#meta-testing-for-clarity-issues.md)
- [Bulletproof Status Criteria](#bulletproof-status-criteria.md)
- [Complete RED-GREEN-REFACTOR Example](#complete-red-green-refactor-example.md)
- [Iteration 0: Initial Test (RED - Failed)](#iteration-0-initial-test-red---failed.md)
- [Iteration 1: Write Minimal Skill (GREEN)](#iteration-1-write-minimal-skill-green.md)
- [Iteration 2: Add Foundational Principle (REFACTOR)](#iteration-2-add-foundational-principle-refactor.md)
- [Skill Types and Testing Approaches](#skill-types-and-testing-approaches.md)
- [Discipline-Enforcing Skills](#discipline-enforcing-skills.md)
- [Technique Skills](#technique-skills.md)
- [Pattern Skills](#pattern-skills.md)
- [Reference Skills](#reference-skills.md)
- [Common Rationalization Catalog](#common-rationalization-catalog.md)
- [Testing Checklist (TDD for Skills)](#testing-checklist-tdd-for-skills.md)
- [Real-World Example: CLAUDE.md Testing Campaign](#real-world-example-claudemd-testing-campaign.md)
- [Test Scenarios Designed](#test-scenarios-designed.md)
- [Documentation Variants Tested](#documentation-variants-tested.md)
- [Success Criteria](#success-criteria.md)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid.md)
- [Skipping RED Phase](#skipping-red-phase.md)
- [Weak Test Cases](#weak-test-cases.md)
- [Not Capturing Exact Failures](#not-capturing-exact-failures.md)
- [Vague Fixes](#vague-fixes.md)
- [Stopping After First Pass](#stopping-after-first-pass.md)
- [Testing After Writing](#testing-after-writing.md)
- [The Iron Law: Same as Code TDD](#the-iron-law-same-as-code-tdd.md)
- [Quick Reference: TDD Cycle for Skills](#quick-reference-tdd-cycle-for-skills.md)
