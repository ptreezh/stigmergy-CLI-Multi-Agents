# /obra/superpowers/6.7-finishing-development-branches

Finishing Development Branches | obra/superpowers | DeepWiki

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

# Finishing Development Branches

Relevant source files

- [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md)
- [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)
- [skills/using-git-worktrees/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md)

## Purpose and Scope

This page documents the `finishing-a-development-branch` skill, which provides a structured process for completing development work and integrating changes back to the main codebase. The skill presents four distinct completion options (merge locally, create PR, keep as-is, or discard) after verifying that all tests pass.

This skill represents the final stage of the development workflow pipeline. For the complete workflow leading up to this point, see [Development Workflows](obra/superpowers/6-development-workflows.md). For the code review process that typically precedes this step, see [Code Review Process](obra/superpowers/6.5-executing-plans-in-batches.md).

**Sources:** [skills/finishing-a-development-branch/SKILL.md1-11](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L1-L11)

## Skill Metadata and Invocation

The skill is defined with the following metadata:

| Property              | Value                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| **Name**              | `finishing-a-development-branch`                                                                      |
| **Description**       | Use when implementation is complete, all tests pass, and you need to decide how to integrate the work |
| **Activation**        | Called automatically by `executing-plans` (Step 5) and `subagent-driven-development` (Step 7)         |
| **Manual Invocation** | User can explicitly request: "finish this branch" or "what should we do with this branch?"            |

The skill announces its usage at the start: "I'm using the finishing-a-development-branch skill to complete this work."

**Sources:** [skills/finishing-a-development-branch/SKILL.md1-14](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L1-L14)

## The Five-Step Process

```
```

**Diagram: Completion Process Flow**

The skill executes five sequential steps, with Step 1 serving as a hard gate—if tests fail, the process stops and no completion options are offered.

**Sources:** [skills/finishing-a-development-branch/SKILL.md16-151](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L16-L151)

## Completion Options

\</old\_str> \<new\_str>

## Completion Options

```
```

**Diagram: Four Completion Paths**

**Sources:** [skills/finishing-a-development-branch/SKILL.md66-134](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L66-L134)

### Step 1: Test Verification Gate

Before presenting any options, the skill verifies that all tests pass. This is a hard gate—no completion options are offered if tests fail.

**Test execution commands by project type:**

| Project Type | Test Command    | Detection Method                                  |
| ------------ | --------------- | ------------------------------------------------- |
| Node.js      | `npm test`      | Checks for `package.json`                         |
| Rust         | `cargo test`    | Checks for `Cargo.toml`                           |
| Python       | `pytest`        | Checks for `requirements.txt` or `pyproject.toml` |
| Go           | `go test ./...` | Checks for `go.mod`                               |

The skill auto-detects the project type and runs the appropriate test command. This matches the behavior in `using-git-worktrees` which performs similar project detection.

**If tests fail:**

```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

The process stops here. No Step 2 is executed. No options are presented. The user must fix test failures before returning to this skill.

**If tests pass:** Continue to Step 2.

**Sources:** [skills/finishing-a-development-branch/SKILL.md18-38](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L18-L38) [skills/using-git-worktrees/SKILL.md102-118](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L102-L118)

### Step 2: Base Branch Detection

The skill determines which branch this feature branch split from, typically `main` or `master`:

```
```

If detection is ambiguous, the skill asks: "This branch split from main - is that correct?"

This information is used in Step 3 to correctly phrase the merge option and in Step 4 to execute the merge.

**Sources:** [skills/finishing-a-development-branch/SKILL.md40-47](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L40-L47)

### Step 3: Present Four Options

The skill presents exactly four structured options, with no additional explanation:

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Key constraint:** The skill must not add explanatory text or opinions. The options are always presented in this exact format with numbered choices.

**Sources:** [skills/finishing-a-development-branch/SKILL.md49-64](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L49-L64)

## Completion Options

```
```

**Diagram: Four Completion Paths**

**Sources:** [skills/finishing-a-development-branch/SKILL.md66-134](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L66-L134)

### Option 1: Merge Locally

This option merges the feature branch into the base branch in the local repository.

**Execution sequence:**

1. `git checkout <base-branch>` - Switch to target branch
2. `git pull` - Fetch latest changes
3. `git merge <feature-branch>` - Perform merge
4. Run test command again - Verify merge didn't break tests
5. `git branch -d <feature-branch>` - Delete feature branch (safe delete)

**Critical verification:** Tests must pass on the merged result. If the merge introduces conflicts or test failures, the process stops before deleting the feature branch.

After successful merge, proceed to Step 5 (Worktree Cleanup).

**Sources:** [skills/finishing-a-development-branch/SKILL.md68-87](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L68-L87)

### Option 2: Push and Create PR

This option pushes the branch to the remote and creates a pull request using the `gh` CLI.

**Execution sequence:**

1. `git push -u origin <feature-branch>` - Push branch to remote
2. `gh pr create` - Create pull request with structured body

**PR body template:**

```
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
```

The skill generates a concise summary based on the commit history and test results. The test plan includes verification steps that reviewers should execute.

After PR creation, proceed to Step 5 (Worktree Cleanup).

**Sources:** [skills/finishing-a-development-branch/SKILL.md89-106](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L89-L106)

### Option 3: Keep As-Is

This option preserves the branch and worktree without any integration.

**Behavior:**

- Report: "Keeping branch `<name>`. Worktree preserved at `<path>`."
- No git operations are performed
- Worktree is NOT cleaned up
- Branch remains available for future work

**Use cases:**

- User wants to manually handle the merge
- Work needs additional changes before integration
- Waiting for external dependencies
- Branch serves as reference for other work

**Sources:** [skills/finishing-a-development-branch/SKILL.md108-112](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L108-L112)

### Option 4: Discard

This option permanently deletes the branch and all its commits.

**Safety protocol:**

1. Show warning with full context:

```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

2. Wait for exact typed confirmation (must be the word "discard")

3. Only after confirmation:

   - `git checkout <base-branch>` - Switch away from feature branch
   - `git branch -D <feature-branch>` - Force delete branch

After deletion, proceed to Step 5 (Worktree Cleanup).

**Sources:** [skills/finishing-a-development-branch/SKILL.md114-134](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L114-L134)

## Step 5: Worktree Cleanup

```
```

**Diagram: Worktree Cleanup Decision Flow**

Worktree cleanup only occurs for Options 1, 2, and 4. Option 3 explicitly preserves the worktree.

**Cleanup commands:**

1. Check if in worktree:

```
```

2. If yes, remove it:

```
```

This cleanup integrates with the `using-git-worktrees` skill, which creates worktrees during the brainstorming phase. The worktree lifecycle is: created by `using-git-worktrees` → used during development → cleaned up by `finishing-a-development-branch`.

**Sources:** [skills/finishing-a-development-branch/SKILL.md136-151](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L136-L151)

## Option Comparison Table

| Aspect                    | Option 1: Merge      | Option 2: PR | Option 3: Keep | Option 4: Discard |
| ------------------------- | -------------------- | ------------ | -------------- | ----------------- |
| **Merges locally**        | ✓                    | -            | -              | -                 |
| **Pushes to remote**      | -                    | ✓            | -              | -                 |
| **Preserves worktree**    | -                    | -            | ✓              | -                 |
| **Deletes branch**        | ✓ (safe)             | -            | -              | ✓ (force)         |
| **Cleanup Step 5**        | ✓                    | ✓            | -              | ✓                 |
| **Requires confirmation** | -                    | -            | -              | ✓                 |
| **Re-runs tests**         | ✓ (on merged result) | -            | -              | -                 |

**Sources:** [skills/finishing-a-development-branch/SKILL.md152-159](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L152-L159)

## Integration with Development Workflows

```
```

**Diagram: Integration Points in Development Pipeline**

The `finishing-a-development-branch` skill is called by two execution workflows:

1. **`executing-plans` (final step):** After all task batches complete and the user reviews the final batch
2. **`subagent-driven-development` (Step 7):** After all tasks complete and the code review passes

Both workflows verify tests before calling this skill, but the skill performs its own verification as a safety gate. This defense-in-depth approach prevents broken code from reaching the completion options.

**Worktree lifecycle:**

- Created by: `using-git-worktrees` (Phase 4 of `brainstorming`)
- Used during: `subagent-driven-development` or `executing-plans`
- Cleaned up by: `finishing-a-development-branch` (Step 5, Options 1/2/4 only)

**Sources:** [skills/finishing-a-development-branch/SKILL.md193-201](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L193-L201) [skills/brainstorming/SKILL.md36-45](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L36-L45) [skills/using-git-worktrees/SKILL.md209-217](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L209-L217) [README.md80-94](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L94)

## Platform-Specific Invocation

The skill is invoked differently across platforms due to their different integration mechanisms:

### Claude Code

**Automatic invocation:** Called by `executing-plans` and `subagent-driven-development` skills at their completion stages. The skill is loaded from `~/.config/superpowers/skills/finishing-a-development-branch/SKILL.md`.

**Manual invocation:** User can say "finish this branch" or "what should we do with this branch?" The agent will recognize the intent and invoke the skill.

**Tool execution:** Uses native Claude Code command execution for git operations. For PR creation (Option 2), uses the `gh` CLI tool if available.

### OpenCode

**Automatic invocation:** Same as Claude Code - called by workflow skills.

**Manual invocation:** User invokes via the `use_skill` tool defined in `.opencode/plugin/superpowers.js`:

```
use_skill("finishing-a-development-branch")
```

**Skill loading:** The plugin's `use_skill` tool reads from `~/.config/superpowers/skills/finishing-a-development-branch/SKILL.md` using the `skills-core.js` module's `loadSkillContent()` function.

**Tool execution:** Git operations execute via OpenCode's command execution. The `gh pr create` command is wrapped in the tool's execution context.

### Codex

**Manual invocation only:** User must explicitly run:

```
```

**Skill loading:** The CLI tool reads from `~/.codex/superpowers/skills/finishing-a-development-branch/SKILL.md` (note the different base path for Codex).

**No automatic workflow:** Codex doesn't support the automatic workflow orchestration that Claude Code and OpenCode provide, so this skill must be invoked manually after completing implementation. The user must track when implementation is complete and explicitly call the skill.

**Sources:** [README.md28-78](https://github.com/obra/superpowers/blob/a01a135f/README.md#L28-L78) [skills/finishing-a-development-branch/SKILL.md1-3](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L1-L3)

## Safety Mechanisms and Red Flags

The skill implements multiple safety mechanisms to prevent common mistakes:

### Test Verification Gate

**Mechanism:** Tests must pass before any options are presented.

**Prevents:**

- Merging broken code
- Creating PRs with failing tests
- Integrating incomplete work

**Implementation:** [skills/finishing-a-development-branch/SKILL.md18-36](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L18-L36)

### Structured Options

**Mechanism:** Present exactly 4 options in standardized format, no additional explanation.

**Prevents:**

- Ambiguous questions like "What should I do next?"
- Agent deciding unilaterally what to do
- User confusion about available choices

**Implementation:** [skills/finishing-a-development-branch/SKILL.md49-64](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L49-L64)

### Discard Confirmation

**Mechanism:** Require typed "discard" confirmation before deleting work.

**Prevents:**

- Accidental deletion of commits
- Loss of work due to misunderstanding
- Premature cleanup

**Implementation:** [skills/finishing-a-development-branch/SKILL.md116-127](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L116-L127)

### Conditional Worktree Cleanup

**Mechanism:** Only cleanup worktree for Options 1, 2, 4. Preserve for Option 3.

**Prevents:**

- Removing worktree when user wants to continue working
- Losing context for in-progress PRs
- Cleanup when branch should be preserved

**Implementation:** [skills/finishing-a-development-branch/SKILL.md136-150](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L136-L150)

### Post-Merge Test Verification

**Mechanism:** Re-run tests after merge completes (Option 1 only).

**Prevents:**

- Merge conflicts causing test failures
- Integration issues not caught before merge
- Breaking the base branch

**Implementation:** [skills/finishing-a-development-branch/SKILL.md80-81](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L80-L81)

**Sources:** [skills/finishing-a-development-branch/SKILL.md161-191](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L161-L191)

## Common Mistakes and Corrections

The skill documentation identifies patterns that agents commonly get wrong:

### Mistake: Skipping Test Verification

**Problem:** Agent offers completion options without running tests first.

**Consequence:** Broken code gets merged or PR'd.

**Correction:** Always verify tests in Step 1 before proceeding to Step 2.

**Source:** [skills/finishing-a-development-branch/SKILL.md163-165](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L163-L165)

### Mistake: Open-Ended Questions

**Problem:** Agent asks "What should I do next?" or "How would you like to proceed?"

**Consequence:** Ambiguous, requires user to think through options, inconsistent UX.

**Correction:** Present exactly the 4 structured options, numbered, with no additional text.

**Source:** [skills/finishing-a-development-branch/SKILL.md167-169](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L167-L169)

### Mistake: Automatic Worktree Cleanup

**Problem:** Agent removes worktree for all options, including Options 2 and 3.

**Consequence:** User loses working directory for PR they need to update, or branch they want to keep working on.

**Correction:** Only cleanup worktree for Options 1 and 4. Skip Step 5 for Option 3. Run Step 5 but preserve for Option 2.

**Source:** [skills/finishing-a-development-branch/SKILL.md171-173](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L171-L173)

### Mistake: No Confirmation for Discard

**Problem:** Agent immediately deletes branch when user selects Option 4.

**Consequence:** Accidental deletion of work, no way to recover.

**Correction:** Show full warning with commit list, require exact typed "discard" confirmation.

**Source:** [skills/finishing-a-development-branch/SKILL.md175-177](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L175-L177)

## Command Reference

### Git Commands Used

| Command                       | Purpose                   | Used In      |
| ----------------------------- | ------------------------- | ------------ |
| `git merge-base HEAD main`    | Detect base branch        | Step 2       |
| `git checkout <branch>`       | Switch branches           | Options 1, 4 |
| `git pull`                    | Fetch latest changes      | Option 1     |
| `git merge <branch>`          | Merge feature branch      | Option 1     |
| `git branch -d <branch>`      | Safe delete (merged only) | Option 1     |
| `git branch -D <branch>`      | Force delete (unmerged)   | Option 4     |
| `git push -u origin <branch>` | Push and set upstream     | Option 2     |
| `git worktree list`           | List all worktrees        | Step 5       |
| `git worktree remove <path>`  | Remove worktree           | Step 5       |

### GitHub CLI Commands Used

| Command        | Purpose             | Used In  |
| -------------- | ------------------- | -------- |
| `gh pr create` | Create pull request | Option 2 |
| `--title`      | Set PR title        | Option 2 |
| `--body`       | Set PR description  | Option 2 |

**Sources:** [skills/finishing-a-development-branch/SKILL.md68-104](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L68-L104)

## Example Execution Traces

### Successful Merge (Option 1)

```
Agent: I'm using the finishing-a-development-branch skill to complete this work.

[Running npm test...]
All tests pass (24 passing)

Implementation complete. What would you like to do?

1. Merge back to main locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?

User: 1

Agent: [Executing Option 1]
Switched to branch 'main'
Already up to date.
Merging feature-add-validation...
Merge made by 'recursive' strategy.

[Running npm test on merged result...]
All tests pass (24 passing)

Deleted branch feature-add-validation.
Removed worktree at /tmp/worktree-feature-add-validation

Merge complete. All changes integrated into main.
```

### Pull Request Creation (Option 2)

```
Agent: I'm using the finishing-a-development-branch skill to complete this work.

[Running cargo test...]
All tests pass

Implementation complete. What would you like to do?

1. Merge back to main locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?

User: 2

Agent: [Executing Option 2]
Pushing branch fix-parsing-bug to origin...
Creating pull request...

https://github.com/user/repo/pull/42

## Summary
- Fix off-by-one error in parser
- Add test coverage for edge case
- Update documentation

## Test Plan
- [x] All existing tests pass
- [x] New test covers edge case

Removed worktree at /tmp/worktree-fix-parsing-bug

Pull request created. Branch available for review.
```

### Discard with Confirmation (Option 4)

```
Agent: I'm using the finishing-a-development-branch skill to complete this work.

[Running pytest...]
All tests pass

Implementation complete. What would you like to do?

1. Merge back to main locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?

User: 4

Agent: This will permanently delete:
- Branch experimental-feature
- All commits:
  * abc123 "Add experimental API"
  * def456 "Refactor implementation"
  * ghi789 "Add tests"
- Worktree at /tmp/worktree-experimental-feature

Type 'discard' to confirm.

User: discard

Agent: [Executing Option 4]
Switched to branch 'main'
Deleted branch experimental-feature (was ghi789).
Removed worktree at /tmp/worktree-experimental-feature

Branch discarded. All work deleted.
```

**Sources:** [skills/finishing-a-development-branch/SKILL.md1-201](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L1-L201)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Finishing Development Branches](#finishing-development-branches.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Skill Metadata and Invocation](#skill-metadata-and-invocation.md)
- [The Five-Step Process](#the-five-step-process.md)
- [Completion Options](#completion-options.md)
- [Step 1: Test Verification Gate](#step-1-test-verification-gate.md)
- [Step 2: Base Branch Detection](#step-2-base-branch-detection.md)
- [Step 3: Present Four Options](#step-3-present-four-options.md)
- [Completion Options](#completion-options-1.md)
- [Option 1: Merge Locally](#option-1-merge-locally.md)
- [Option 2: Push and Create PR](#option-2-push-and-create-pr.md)
- [Option 3: Keep As-Is](#option-3-keep-as-is.md)
- [Option 4: Discard](#option-4-discard.md)
- [Step 5: Worktree Cleanup](#step-5-worktree-cleanup.md)
- [Option Comparison Table](#option-comparison-table.md)
- [Integration with Development Workflows](#integration-with-development-workflows.md)
- [Platform-Specific Invocation](#platform-specific-invocation.md)
- [Claude Code](#claude-code.md)
- [OpenCode](#opencode.md)
- [Codex](#codex.md)
- [Safety Mechanisms and Red Flags](#safety-mechanisms-and-red-flags.md)
- [Test Verification Gate](#test-verification-gate.md)
- [Structured Options](#structured-options.md)
- [Discard Confirmation](#discard-confirmation.md)
- [Conditional Worktree Cleanup](#conditional-worktree-cleanup.md)
- [Post-Merge Test Verification](#post-merge-test-verification.md)
- [Common Mistakes and Corrections](#common-mistakes-and-corrections.md)
- [Mistake: Skipping Test Verification](#mistake-skipping-test-verification.md)
- [Mistake: Open-Ended Questions](#mistake-open-ended-questions.md)
- [Mistake: Automatic Worktree Cleanup](#mistake-automatic-worktree-cleanup.md)
- [Mistake: No Confirmation for Discard](#mistake-no-confirmation-for-discard.md)
- [Command Reference](#command-reference.md)
- [Git Commands Used](#git-commands-used.md)
- [GitHub CLI Commands Used](#github-cli-commands-used.md)
- [Example Execution Traces](#example-execution-traces.md)
- [Successful Merge (Option 1)](#successful-merge-option-1.md)
- [Pull Request Creation (Option 2)](#pull-request-creation-option-2.md)
- [Discard with Confirmation (Option 4)](#discard-with-confirmation-option-4.md)
