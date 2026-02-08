# /obra/superpowers/6.1-brainstorming-and-design

Brainstorming and Design | obra/superpowers | DeepWiki

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

# Brainstorming and Design

Relevant source files

- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [commands/brainstorm.md](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md)
- [commands/execute-plan.md](https://github.com/obra/superpowers/blob/a01a135f/commands/execute-plan.md)
- [commands/write-plan.md](https://github.com/obra/superpowers/blob/a01a135f/commands/write-plan.md)
- [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md)
- [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)
- [skills/using-git-worktrees/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

## When Brainstorming is Mandatory

The `brainstorming` skill is **required before any creative work**. The skill's YAML frontmatter explicitly states:

> "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior."

**Mandatory trigger conditions:**

- Creating new features or functionality
- Building new components or modules
- Adding functionality to existing systems
- Modifying behavior of existing code
- Any task that requires design decisions before implementation

**Not required for:**

- Bug fixes with clear root cause (use `systematic-debugging` instead)
- Simple refactoring with no behavior change
- Documentation updates
- Test additions for existing code

The skill is invoked via:

- **Claude Code:** `/superpowers:brainstorm` slash command ([commands/brainstorm.md1-7](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md#L1-L7))
- **Automatic:** The `using-superpowers` meta-skill detects creative work and triggers brainstorming

**Sources:** [skills/brainstorming/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L1-L4) [commands/brainstorm.md1-3](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md#L1-L3)

## Overview and Core Principle

The `brainstorming` skill transforms rough ideas into validated designs using the principle: **"research first, ask targeted questions to fill gaps, explore alternatives, present design incrementally for validation."**

### Primary Artifacts

| Artifact            | File Path Pattern                                                             | Created In | Purpose                           |
| ------------------- | ----------------------------------------------------------------------------- | ---------- | --------------------------------- |
| Design Document     | `docs/plans/YYYY-MM-DD-<topic>-design.md`                                     | Phase 4    | Canonical design reference        |
| Git Worktree        | `.worktrees/<branch>` or `~/.config/superpowers/worktrees/<project>/<branch>` | Phase 5    | Isolated implementation workspace |
| Implementation Plan | `docs/plans/YYYY-MM-DD-<topic>-implementation-plan.md`                        | Phase 6    | TDD-focused task breakdown        |

### Process Characteristics

- **Pre-question reconnaissance:** Browse repository, commits, docs before asking
- **Structured alternatives:** Always propose 2-3 approaches with trade-offs
- **Incremental validation:** Present design in 200-300 word sections
- **Sub-skill chaining:** Automatically invokes `using-git-worktrees` and `writing-plans`
- **Backtracking support:** Explicit backward movement when new information emerges

**Sources:** [skills/brainstorming/SKILL.md1-55](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L1-L55)

## The Six-Phase Process

The brainstorming process consists of six sequential phases with explicit backtracking allowed when new information emerges. Each phase has specific deliverables and code-level actions.

### Phase Summary Table

| Phase                       | Duration              | Key Activities                         | Code Actions                                                | Output Artifact                                             |
| --------------------------- | --------------------- | -------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| **Prep: Autonomous Recon**  | Pre-conversation      | Inspect repo/docs/commits              | `cat`, `ls`, `find`, `git log`                              | Draft understanding model                                   |
| **1. Understanding**        | 1-3 questions         | Share findings, gather missing context | `AskUserQuestion` tool invocation                           | Validated purpose, constraints, criteria                    |
| **2. Exploration**          | Single interaction    | Propose 2-3 approaches with trade-offs | `AskUserQuestion` with options                              | Selected architecture                                       |
| **3. Design Presentation**  | Multiple interactions | Present in 200-300 word sections       | Open-ended questions (no tool)                              | Complete validated design                                   |
| **4. Design Documentation** | Single write          | Write to `docs/plans/`                 | Optional: `elements-of-style:writing-clearly-and-concisely` | `docs/plans/YYYY-MM-DD-<topic>-design.md`                   |
| **5. Worktree Setup**       | If implementing       | Create isolated workspace              | Invoke `superpowers:using-git-worktrees`                    | `.worktrees/<branch>` or `~/.config/superpowers/worktrees/` |
| **6. Planning Handoff**     | If implementing       | Create task breakdown                  | Invoke `superpowers:writing-plans`                          | `docs/plans/YYYY-MM-DD-<topic>-implementation-plan.md`      |

**Sources:** [skills/brainstorming/SKILL.md14-46](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L14-L46)

### Process Flow with File System Operations

**Diagram: Brainstorming Phase Execution and File Operations**

```
```

**Sources:** [skills/brainstorming/SKILL.md14-55](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L14-L55) [skills/using-git-worktrees/SKILL.md82-134](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L82-L134)

### Prep: Autonomous Recon

Before asking any questions, the skill performs autonomous reconnaissance using file system commands. This phase establishes a foundation of knowledge that minimizes unnecessary questions.

**File System Operations:**

| Command                   | Purpose                       | Example                        |
| ------------------------- | ----------------------------- | ------------------------------ |
| `cat README.md`           | Understand project purpose    | Read project overview          |
| `cat docs/*.md`           | Gather existing documentation | Read design docs, architecture |
| `ls -la`                  | Repository structure          | Identify key directories       |
| `find . -name '*.test.*'` | Testing approach              | Locate test files              |
| `git log --oneline -20`   | Recent changes                | Understand recent work         |
| `git diff HEAD~5`         | Recent modifications          | See what changed lately        |
| `cat CLAUDE.md`           | Project conventions           | Read coding standards          |

**Output Pattern:**

The agent synthesizes findings and shares them first:

```
Based on exploring the project state, docs, working copy, and recent commits, 
here's how I think this should work… [synthesized understanding]
```

Then asks follow-up questions **only for gaps** that cannot be inferred from available materials.

**Sources:** [skills/brainstorming/SKILL.md14-20](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L14-L20)

### Phase 1: Understanding

This phase gathers purpose, constraints, and success criteria through targeted questioning. The key principle is **"one question at a time, only for gaps you cannot close yourself."**

**Questioning Protocol:**

1. **Share synthesized understanding first** - Present findings from Prep phase
2. **Ask one focused question at a time** - No multiple questions per message
3. **Use `AskUserQuestion` tool only for decision points** - Not for validation
4. **Invite corrections** - "Did I miss anything important?"

**Example Question Flow:**

```
Based on the README and yesterday's commit to src/localization/index.ts, 
we're expanding localization to dashboard and billing emails; admin 
console is still untouched. Only gap I see is whether support responses 
need localization in this iteration. Did I miss anything important?
```

**Completion Criteria:**

Phase completes when you have:

- **Purpose:** Why this work is needed
- **Constraints:** Technical/business limitations
- **Success criteria:** What "done" looks like

**Sources:** [skills/brainstorming/SKILL.md16-22](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L16-L22)

### Phase 2: Exploration

This phase proposes **2-3 different architectural approaches** with explicit trade-off analysis. The skill mandates exploring alternatives before settling on a design.

**Required Elements Per Approach:**

| Element               | Description                          |
| --------------------- | ------------------------------------ |
| **Core architecture** | High-level structure and components  |
| **Trade-offs**        | What you gain vs. what you sacrifice |
| **Complexity**        | Implementation difficulty assessment |
| **Recommendation**    | Your preferred option with reasoning |

**AskUserQuestion Tool Invocation Pattern:**

```
```

**Example Presentation:**

```
I recommend the direct API approach because it matches existing patterns 
in src/api/client.ts and minimizes new infrastructure. Let me know if 
you see a blocker.
```

**Special Case - Clear Priorities:**

If repository conventions make priorities clear (e.g., `CLAUDE.md` states "favor simplicity over scalability"), state them as facts and proceed:

```
Based on CLAUDE.md's "favor simplicity" guidance, I'll proceed with 
the direct API approach. This matches the existing pattern in 
src/api/client.ts. Let me know if this needs adjustment.
```

**Sources:** [skills/brainstorming/SKILL.md23-29](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L23-L29)

### Phase 3: Design Presentation

This phase presents the complete design in **200-300 word sections**, validating each before proceeding. Once alignment is established, shorter summaries suffice.

**Coverage Areas:**

| Area                           | Content                       | Example                                                    |
| ------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| **Architecture overview**      | High-level component diagram  | "3-layer: API → Service → Repository"                      |
| **Component responsibilities** | What each component does      | "UserService handles auth, validation"                     |
| **Data flow**                  | How data moves through system | "Request → validate → transform → store"                   |
| **Error handling**             | Failure modes and recovery    | "Retry with exponential backoff"                           |
| **Testing approach**           | How to verify correctness     | "Unit tests per component, integration via testcontainers" |

**Validation Pattern:**

Use **open-ended questions** (not `AskUserQuestion` tool) for freeform feedback:

```
[Present 200-300 word section on architecture]

Stop me if this diverges from what you expect.
```

```
[Present data flow section]

Any concerns about how this handles the authentication edge cases?
```

**Ownership Assumption:**

Assume ownership and proceed unless partner redirects. Don't ask permission for obvious next steps:

```
✗ Bad: "Should I continue with the error handling section?"
✓ Good: [Present error handling section directly]
```

**Why Open-Ended (Not AskUserQuestion):**

This phase needs detailed feedback and creative input that structured options would limit. The `AskUserQuestion` tool is reserved for decision points with clear alternatives.

**Sources:** [skills/brainstorming/SKILL.md28-34](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L28-L34)

### Phase 4: Design Documentation

After design validation, this phase writes the design to a permanent file at `docs/plans/YYYY-MM-DD-<topic>-design.md`.

**File Path Convention:**

| Component     | Format           | Example                                             |
| ------------- | ---------------- | --------------------------------------------------- |
| **Directory** | `docs/plans/`    | Fixed location                                      |
| **Date**      | `YYYY-MM-DD`     | `2024-01-15`                                        |
| **Topic**     | Descriptive slug | `oauth-integration`                                 |
| **Extension** | `.md`            | Markdown format                                     |
| **Full Path** | Combined         | `docs/plans/2024-01-15-oauth-integration-design.md` |

**Documentation Process:**

```
```

**Document Structure:**

Organize into sections that emerged from Phase 3 conversation:

- Architecture overview
- Component responsibilities
- Data flow
- Error handling
- Testing approach

**Purpose:**

The design document serves as the **canonical reference** for:

- Phase 6 implementation planning
- Future developers understanding design rationale
- Code review context

**Sources:** [skills/brainstorming/SKILL.md36-40](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L36-L40)

### Phase 5: Worktree Setup (If Implementing)

When implementation will follow immediately, this phase creates an isolated workspace using git worktrees.

**When to Execute:**

| Condition                        | Execute Phase 5? |
| -------------------------------- | ---------------- |
| Continuing to implementation     | ✓ Yes            |
| Design review only               | ✗ No             |
| Implementation in main workspace | ✗ No             |
| Implementation deferred          | ✗ No             |

**Sub-Skill Invocation Process:**

```
```

**Resulting Directory Structure:**

```
project-root/
├── .worktrees/              # Worktrees directory
│   └── feature-branch/      # Isolated workspace
│       ├── src/             # Full project copy
│       ├── tests/           # Full project copy
│       └── docs/plans/      # Contains design doc
├── src/                     # Original workspace unchanged
└── docs/plans/              # Contains design doc
    └── 2024-01-15-feature-design.md
```

**Sources:** [skills/brainstorming/SKILL.md42-45](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L42-L45) [skills/using-git-worktrees/SKILL.md1-143](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L1-L143)

### Phase 6: Planning Handoff (If Implementing)

This phase transitions from design to implementation by creating a detailed task breakdown.

**Sub-Skill Invocation Process:**

```
```

**Resulting Plan Structure:**

```
```

**Downstream Execution:**

The plan file is consumed by:

- `superpowers:executing-plans` - Batch execution with checkpoints (see [6.5](obra/superpowers/6.5-executing-plans-in-batches.md))
- `superpowers:subagent-driven-development` - Per-task subagent dispatch (see [6.4](obra/superpowers/6.4-subagent-driven-development.md))

**Sources:** [skills/brainstorming/SKILL.md42-46](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L42-L46) [README.md86-88](https://github.com/obra/superpowers/blob/a01a135f/README.md#L86-L88)

## Question Strategies and Tool Usage

The brainstorming skill uses two distinct questioning patterns: **structured `AskUserQuestion` tool** for decisions and **open-ended questions** for validation.

### When to Use AskUserQuestion Tool

The `AskUserQuestion` tool presents structured options when the agent needs the partner to make a **judgment call among real alternatives**.

**Tool Invocation Conditions:**

| Use Tool? | Condition                                       | Example                                                       |
| --------- | ----------------------------------------------- | ------------------------------------------------------------- |
| ✓ Yes     | 2-4 real alternatives exist                     | "OAuth vs API key vs JWT authentication?"                     |
| ✓ Yes     | Agent has recommendation but needs confirmation | "I recommend approach A because X, but B is viable"           |
| ✓ Yes     | Prioritization ambiguous from repo/docs         | "Performance vs simplicity trade-off?"                        |
| ✗ No      | Answer is in `README.md` or `CLAUDE.md`         | State as fact: "Based on CLAUDE.md, we favor simplicity"      |
| ✗ No      | Only one viable option exists                   | State decision: "OAuth is the standard, proceeding with that" |
| ✗ No      | Need freeform feedback                          | Use open-ended question                                       |

**Tool Invocation Pattern:**

```
```

**Key Principle:**

State preferred option and rationale **inside the tool call**. Don't ask then explain - explain while asking.

**Sources:** [skills/brainstorming/SKILL.md16-29](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L16-L29)

### When to Use Open-Ended Questions

Open-ended questions are used for **validation, detailed feedback, and creative input** that structured options would limit.

**Open-Ended Question Conditions:**

| Use Open-Ended? | Condition                                | Example                                          |
| --------------- | ---------------------------------------- | ------------------------------------------------ |
| ✓ Yes           | Phase 3 design validation                | "Stop me if this diverges from what you expect." |
| ✓ Yes           | Need detailed explanation                | "What edge cases am I missing here?"             |
| ✓ Yes           | Partner should describe own requirements | "What security requirements exist?"              |
| ✓ Yes           | Creative input needed                    | "Any concerns about this approach?"              |
| ✗ No            | Structured decision needed               | Use `AskUserQuestion` instead                    |
| ✗ No            | Multiple choice with clear options       | Use `AskUserQuestion` instead                    |

**Framing Principles:**

- **Confirm or expand** current understanding
- **Don't reopen** settled topics
- **Natural breakpoints** in design presentation
- **Invite correction** rather than forcing choice

**Example Patterns:**

```
# Phase 3 validation
[Present 200-word architecture section]
Stop me if this diverges from what you expect.

# Gap discovery
Based on the error handling in src/api/client.ts, I'm planning 
to use exponential backoff with circuit breaker. What edge cases 
am I missing?

# Unstructured concerns
[Present complete component design]
Any concerns about how this handles authentication state?
```

**Sources:** [skills/brainstorming/SKILL.md28-34](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L28-L34)

### Question Strategy Decision Tree

```
```

**Sources:** [skills/brainstorming/SKILL.md108-134](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L108-L134)

## Sub-Skills and Integration Points

The brainstorming skill integrates with three other skills to complete the design-to-implementation pipeline. These integrations are enforced through the skill's mandatory protocol.

### Sub-Skill Dependency Map

```
```

**Sources:** [skills/brainstorming/SKILL.md88-106](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L88-L106)

### Integration Announcements

Each sub-skill invocation requires an explicit announcement to maintain audit trail:

| Phase                     | Announcement Pattern                                                                  | File Reference                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 (optional)        | "I'm using elements-of-style:writing-clearly-and-concisely for documentation quality" | [skills/brainstorming/SKILL.md88](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L88-L88)    |
| Phase 5 (if implementing) | "I'm using the using-git-worktrees skill to set up an isolated workspace."            | [skills/brainstorming/SKILL.md94](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L94-L94)    |
| Phase 6 (if implementing) | "I'm using the writing-plans skill to create the implementation plan."                | [skills/brainstorming/SKILL.md103](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L103-L103) |

**Sources:** [skills/brainstorming/SKILL.md88-105](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L88-L105)

## Flow Control and Backtracking

The brainstorming skill explicitly allows backward movement through phases when new information emerges. This flexibility prevents forcing forward linearly when going backward would produce better results.

### Backtracking Decision Logic

```
```

**Sources:** [skills/brainstorming/SKILL.md136-163](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L136-L163)

### Backtracking Scenarios

| Trigger Condition                | Current Phase | Return To      | Example                                        |
| -------------------------------- | ------------- | -------------- | ---------------------------------------------- |
| Partner reveals new constraint   | Phase 2 or 3  | Phase 1        | "Actually, we need HIPAA compliance"           |
| Validation shows fundamental gap | Phase 3       | Phase 1        | Design doesn't address stated success criteria |
| Partner questions approach       | Phase 3       | Phase 2        | "Why not use a message queue instead?"         |
| Something doesn't make sense     | Any           | Previous phase | Unclear trade-off, ambiguous requirement       |

The skill explicitly states: "Avoid forcing forward linearly when going backward would give better results." This principle prevents premature commitment to flawed designs.

**Sources:** [skills/brainstorming/SKILL.md156-162](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L156-L162)

## Key Principles and Anti-Patterns

The brainstorming skill enforces core principles and explicitly flags anti-patterns.

### Core Principles Table

| Principle                  | Application                                           | How Enforced                                                                                                                                        |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One question at a time** | Phase 1: Single targeted question only for gaps       | Explicit in [skills/brainstorming/SKILL.md20](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L20-L20)              |
| **Structured choices**     | Use `AskUserQuestion` for 2-4 options with trade-offs | Tool-based pattern                                                                                                                                  |
| **YAGNI ruthlessly**       | Remove unnecessary features from all designs          | Cultural principle in [skills/brainstorming/SKILL.md52](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L52-L52)    |
| **Explore alternatives**   | Always propose 2-3 approaches before settling         | Required in Phase 2                                                                                                                                 |
| **Incremental validation** | Present design in 200-300 word sections               | Phase 3 structure                                                                                                                                   |
| **Flexible progression**   | Go backward when needed - flexibility > rigidity      | Explicit backtracking in [skills/brainstorming/SKILL.md54](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L54-L54) |
| **Own the initiative**     | Recommend priorities and next steps                   | Leadership framing in tool calls                                                                                                                    |
| **Announce sub-skills**    | State skill usage before invocation                   | Mandatory announcement pattern                                                                                                                      |

### Anti-Patterns to Avoid

| Anti-Pattern                       | Problem                              | Correct Approach                               |
| ---------------------------------- | ------------------------------------ | ---------------------------------------------- |
| **Multiple questions per message** | Overwhelms partner                   | Ask one at a time                              |
| **Asking when answer exists**      | Wastes time, ignores available info  | Read `README.md`, `CLAUDE.md`, `git log` first |
| **Open-ended when choices exist**  | Forces partner to enumerate options  | Use `AskUserQuestion` with structured options  |
| **Structured when need details**   | Limits creative input                | Use open-ended questions                       |
| **Single approach presentation**   | No comparison, no trade-off analysis | Always present 2-3 alternatives                |
| **Skipping validation**            | Large chunks with no checkpoints     | Validate every 200-300 words                   |
| **Forcing forward**                | Ignoring red flags, new constraints  | Back up to appropriate phase                   |

**Sources:** [skills/brainstorming/SKILL.md47-55](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L47-L55)

## Progress Tracking Checklist

The skill provides a copy-paste checklist for tracking progress through phases:

```
Brainstorming Progress:
- [ ] Prep: Autonomous Recon (repo/docs/commits reviewed, initial model shared)
- [ ] Phase 1: Understanding (purpose, constraints, criteria gathered)
- [ ] Phase 2: Exploration (2-3 approaches proposed and evaluated)
- [ ] Phase 3: Design Presentation (design validated in sections)
- [ ] Phase 4: Design Documentation (design written to docs/plans/)
- [ ] Phase 5: Worktree Setup (if implementing)
- [ ] Phase 6: Planning Handoff (if implementing)
```

This checklist serves both as progress tracking and as a reminder of the required outputs for each phase.

**Sources:** [skills/brainstorming/SKILL.md30-41](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L30-L41)

## File Path Conventions and Artifacts

### Design Document Location

Design documents are written to `docs/plans/YYYY-MM-DD-<topic>-design.md` with:

- `YYYY-MM-DD`: Actual date when design was created
- `<topic>`: Short descriptive slug (e.g., `user-authentication`, `payment-processing`)

**Example paths:**

- `docs/plans/2024-01-15-oauth-integration-design.md`
- `docs/plans/2024-02-03-refactor-database-layer-design.md`

The date prefix enables chronological sorting and provides temporal context for design decisions.

**Sources:** [skills/brainstorming/SKILL.md87](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L87-L87)

### Worktree Location

Git worktrees created in Phase 5 follow the pattern defined by the `using-git-worktrees` skill, typically under `~/.claude/worktrees/` with branch-based naming.

**Sources:** [skills/brainstorming/SKILL.md92-97](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L92-L97)

## Integration with Execution Workflows

The brainstorming skill produces artifacts consumed by downstream execution workflows:

```
```

The design document provides the "why" (rationale and architecture), while the implementation plan provides the "how" (specific tasks and verification steps). Both execution workflows consume the plan but may reference the design document for context.

**Sources:** [skills/brainstorming/SKILL.md99-106](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L99-L106) and [skills/executing-plans/SKILL.md18-23](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L18-L23)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Brainstorming and Design](#brainstorming-and-design.md)
- [When Brainstorming is Mandatory](#when-brainstorming-is-mandatory.md)
- [Overview and Core Principle](#overview-and-core-principle.md)
- [Primary Artifacts](#primary-artifacts.md)
- [Process Characteristics](#process-characteristics.md)
- [The Six-Phase Process](#the-six-phase-process.md)
- [Phase Summary Table](#phase-summary-table.md)
- [Process Flow with File System Operations](#process-flow-with-file-system-operations.md)
- [Prep: Autonomous Recon](#prep-autonomous-recon.md)
- [Phase 1: Understanding](#phase-1-understanding.md)
- [Phase 2: Exploration](#phase-2-exploration.md)
- [Phase 3: Design Presentation](#phase-3-design-presentation.md)
- [Phase 4: Design Documentation](#phase-4-design-documentation.md)
- [Phase 5: Worktree Setup (If Implementing)](#phase-5-worktree-setup-if-implementing.md)
- [Phase 6: Planning Handoff (If Implementing)](#phase-6-planning-handoff-if-implementing.md)
- [Question Strategies and Tool Usage](#question-strategies-and-tool-usage.md)
- [When to Use AskUserQuestion Tool](#when-to-use-askuserquestion-tool.md)
- [When to Use Open-Ended Questions](#when-to-use-open-ended-questions.md)
- [Question Strategy Decision Tree](#question-strategy-decision-tree.md)
- [Sub-Skills and Integration Points](#sub-skills-and-integration-points.md)
- [Sub-Skill Dependency Map](#sub-skill-dependency-map.md)
- [Integration Announcements](#integration-announcements.md)
- [Flow Control and Backtracking](#flow-control-and-backtracking.md)
- [Backtracking Decision Logic](#backtracking-decision-logic.md)
- [Backtracking Scenarios](#backtracking-scenarios.md)
- [Key Principles and Anti-Patterns](#key-principles-and-anti-patterns.md)
- [Core Principles Table](#core-principles-table.md)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid.md)
- [Progress Tracking Checklist](#progress-tracking-checklist.md)
- [File Path Conventions and Artifacts](#file-path-conventions-and-artifacts.md)
- [Design Document Location](#design-document-location.md)
- [Worktree Location](#worktree-location.md)
- [Integration with Execution Workflows](#integration-with-execution-workflows.md)
