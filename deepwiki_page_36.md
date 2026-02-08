# /obra/superpowers/8.2-skill-structure-and-skill.md-format

Skill Structure and SKILL.md Format | obra/superpowers | DeepWiki

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

# Skill Structure and SKILL.md Format

Relevant source files

- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)

This page documents the required file format, directory structure, and content organization patterns for skills in the superpowers repository. It specifies the YAML frontmatter schema, standard sections, and rules for organizing supporting files.

For the TDD methodology used to create skills, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md). For testing approaches, see [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md). For optimizing skill discoverability, see [Claude Search Optimization (CSO)](obra/superpowers/8.4-claude-search-optimization-\(cso\).md).

---

## Directory Structure Patterns

Skills follow one of three organizational patterns depending on their content requirements.

### Pattern Decision Matrix

| Pattern                  | When to Use                                   | Example                    |
| ------------------------ | --------------------------------------------- | -------------------------- |
| **Self-Contained**       | All content fits in SKILL.md (< 500 words)    | `defense-in-depth/`        |
| **With Reusable Tool**   | Includes executable scripts or code templates | `condition-based-waiting/` |
| **With Heavy Reference** | API docs, comprehensive syntax (100+ lines)   | `pptx/`                    |

**Sources:** [skills/writing-skills/SKILL.md72-80](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L72-L80) [skills/writing-skills/SKILL.md349-373](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L349-L373)

### Directory Structure Diagram

```
```

**Sources:** [skills/writing-skills/SKILL.md349-373](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L349-L373)

---

## YAML Frontmatter Requirements

Every `SKILL.md` begins with YAML frontmatter containing exactly two fields: `name` and `description`. The frontmatter is parsed by [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js) for skill discovery.

### Field Specifications

| Field         | Type   | Max Length              | Format Rules                                                   |
| ------------- | ------ | ----------------------- | -------------------------------------------------------------- |
| `name`        | string | N/A                     | Letters, numbers, hyphens only (no parentheses, special chars) |
| `description` | string | 500 chars (recommended) | Third-person, "Use when..." format, triggers only              |
| **Total**     | -      | **1024 chars**          | Combined frontmatter character limit                           |

**Sources:** [skills/writing-skills/SKILL.md95-103](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L95-L103)

### Frontmatter Structure

```
```

**Critical constraint:** The `description` field must contain ONLY triggering conditions (when to use the skill), NOT workflow summaries or process descriptions. Including workflow information causes agents to follow the description instead of reading the full skill content.

**Sources:** [skills/writing-skills/SKILL.md150-172](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L150-L172)

### Naming Conventions

```
```

**Sources:** [skills/writing-skills/SKILL.md209-276](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L209-L276)

---

## Standard SKILL.md Sections

The `SKILL.md` file follows a consistent section structure optimized for agent discovery and scanning.

### Required Section Order

```
```

**Sources:** [skills/writing-skills/SKILL.md105-137](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L105-L137)

### Section-by-Section Breakdown

#### Overview Section

**Purpose:** State the core principle in 1-2 sentences.

```
```

**Sources:** [skills/writing-skills/SKILL.md113-114](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L113-L114)

#### When to Use Section

**Purpose:** List specific symptoms and use cases. Include flowchart only if decision is non-obvious.

**Format:**

- Bullet list of triggering conditions
- "When NOT to use" subsection
- Optional inline flowchart for decision points

**Sources:** [skills/writing-skills/SKILL.md116-121](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L116-L121)

#### Core Pattern Section

**Purpose:** Show before/after code comparison. Only for technique or pattern skills.

**Skip for:** Reference skills, meta-skills, discipline-enforcing skills without code examples.

**Sources:** [skills/writing-skills/SKILL.md122-123](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L122-L123)

#### Quick Reference Section

**Purpose:** Scannable table or bullet list for common operations.

**Format:**

```
```

**Sources:** [skills/writing-skills/SKILL.md124-126](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L124-L126)

#### Implementation Section

**Purpose:** Provide inline code or link to separate file.

**Decision criteria:**

- < 50 lines → Inline in SKILL.md
- 50-100 lines → Consider separate file
- 100+ lines OR reusable tool → Separate file

**Sources:** [skills/writing-skills/SKILL.md127-131](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L127-L131)

#### Common Mistakes Section

**Purpose:** Document failure modes and fixes.

**Format:**

```
```

**Sources:** [skills/writing-skills/SKILL.md132-134](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L132-L134)

---

## Supporting Files Organization

### File Inclusion Decision Tree

```
```

**Sources:** [skills/writing-skills/SKILL.md82-92](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L82-L92)

### Supporting File Types

| File Type            | Purpose                         | Example                              | When to Use                             |
| -------------------- | ------------------------------- | ------------------------------------ | --------------------------------------- |
| **api-reference.md** | Comprehensive API documentation | `pptxgenjs.md` (600 lines)           | Reference material too large for inline |
| **example.ts/js**    | Working code to adapt           | `condition-based-waiting/example.ts` | Reusable test helpers or utilities      |
| **scripts/**         | Executable tools                | `pptx/scripts/`                      | CLI tools, automation scripts           |
| **.dot files**       | Complex flowcharts              | `graphviz-conventions.dot`           | Referenced for diagram style rules      |

**Sources:** [skills/writing-skills/SKILL.md364-373](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L364-L373)

---

## Flowchart Usage Guidelines

Flowcharts in `SKILL.md` files use graphviz (dot syntax) embedded in code blocks. The [render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/render-graphs.js) tool extracts and renders these to SVG for human review.

### When to Use Flowcharts

```
```

**Sources:** [skills/writing-skills/SKILL.md290-316](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L290-L316)

### Never Use Flowcharts For

| Content Type                    | Use Instead                          |
| ------------------------------- | ------------------------------------ |
| Reference material              | Tables, lists                        |
| Code examples                   | Markdown code blocks                 |
| Linear instructions             | Numbered lists                       |
| Labels without semantic meaning | (Don't use `step1`, `helper2`, etc.) |

**Sources:** [skills/writing-skills/SKILL.md310-316](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L310-L316)

### Rendering Flowcharts

The [render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/render-graphs.js) tool extracts `dot` code blocks from `SKILL.md` and renders them to SVG for human visualization.

**Usage:**

```
```

**Output:** Creates `diagrams/` subdirectory with `.svg` files.

**Sources:** [skills/writing-skills/render-graphs.js1-169](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js#L1-L169)

---

## Code Examples Best Practices

### One Excellent Example Principle

**Rule:** One excellent, complete example beats multiple mediocre examples across languages.

**Good example characteristics:**

- Complete and runnable
- Well-commented explaining WHY (not just WHAT)
- From real scenario (not contrived)
- Shows pattern clearly
- Ready to adapt (not generic fill-in-the-blank template)

**Sources:** [skills/writing-skills/SKILL.md325-346](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L325-L346)

### Language Selection

| Skill Domain       | Preferred Language    |
| ------------------ | --------------------- |
| Testing techniques | TypeScript/JavaScript |
| System debugging   | Shell/Python          |
| Data processing    | Python                |
| Web APIs           | JavaScript/TypeScript |

**Rationale:** Choose the language most relevant to the skill's domain. Agents can port patterns to other languages as needed.

**Sources:** [skills/writing-skills/SKILL.md328-335](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L328-L335)

### Anti-Pattern: Multi-Language Dilution

**Don't create:**

```
skill-name/
  example-js.js
  example-py.py
  example-go.go
  example-rb.rb
```

**Why:** Mediocre quality across all languages, high maintenance burden, dilutes focus.

**Sources:** [skills/writing-skills/SKILL.md568-571](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L568-L571)

---

## Cross-Referencing Other Skills

### Reference Syntax

Skills reference other skills by name using explicit requirement markers. This allows agents to load dependencies on-demand rather than force-loading all referenced content.

**Correct patterns:**

```
```

**Incorrect patterns:**

```
```

**Sources:** [skills/writing-skills/SKILL.md278-289](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L278-L289)

### Why Avoid @ Syntax

The `@` syntax in skill references force-loads files immediately, consuming 200k+ tokens of context before the agent determines whether the skill is needed. Using skill names allows the agent to load dependencies only when invoked.

**Sources:** [skills/writing-skills/SKILL.md288-289](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L288-L289)

---

## Flat Namespace Design

All skills exist in a single flat namespace under `skills/`. This design enables:

1. **Simple discovery:** No need to search nested hierarchies
2. **Consistent naming:** All skills at same level
3. **Easy searching:** grep/find across single directory
4. **Clear identity:** Each skill has unique name

**Directory structure:**

```
skills/
  brainstorming/
    SKILL.md
  test-driven-development/
    SKILL.md
  using-git-worktrees/
    SKILL.md
  condition-based-waiting/
    SKILL.md
    example.ts
  pptx/
    SKILL.md
    pptxgenjs.md
    ooxml.md
    scripts/
```

**Sources:** [skills/writing-skills/SKILL.md72-83](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L72-L83)

---

## Content Optimization Guidelines

### Token Efficiency Targets

Frequently-loaded skills consume context in every conversation. Token budgets vary by usage pattern:

| Skill Type                   | Target Word Count | Rationale                   |
| ---------------------------- | ----------------- | --------------------------- |
| Getting-started workflows    | < 150 words       | Loaded in every session     |
| Frequently-referenced skills | < 200 words       | Loaded often, burns context |
| Other skills                 | < 500 words       | Loaded on-demand            |

**Sources:** [skills/writing-skills/SKILL.md214-221](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L214-L221)

### Token Reduction Techniques

#### Move Details to Tool Help

```
```

**Sources:** [skills/writing-skills/SKILL.md224-231](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L224-L231)

#### Use Cross-References

```
```

**Sources:** [skills/writing-skills/SKILL.md233-242](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L233-L242)

#### Compress Examples

```
```

**Sources:** [skills/writing-skills/SKILL.md244-255](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L244-L255)

---

## Verification Command

Check word count for frequently-loaded skills:

```
```

**Sources:** [skills/writing-skills/SKILL.md262-267](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L262-L267)

---

## Summary: Required Elements

Every `SKILL.md` must include:

1. **YAML frontmatter** with `name` and `description` (max 1024 chars total)
2. **Overview section** with core principle (1-2 sentences)
3. **When to Use section** with symptoms and triggers
4. **Implementation or Quick Reference** appropriate to skill type
5. **Common Mistakes section** documenting failure modes

Optional but recommended:

- **Core Pattern section** for techniques (before/after code)
- **Real-World Impact section** for concrete results
- **Flowcharts** for non-obvious decisions only

Supporting files:

- Use separate files only for 100+ line references or reusable tools
- Keep principles, concepts, and < 50 line code inline

**Sources:** [skills/writing-skills/SKILL.md93-137](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L93-L137) [skills/writing-skills/SKILL.md349-373](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L349-L373)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Skill Structure and SKILL.md Format](#skill-structure-and-skillmd-format.md)
- [Directory Structure Patterns](#directory-structure-patterns.md)
- [Pattern Decision Matrix](#pattern-decision-matrix.md)
- [Directory Structure Diagram](#directory-structure-diagram.md)
- [YAML Frontmatter Requirements](#yaml-frontmatter-requirements.md)
- [Field Specifications](#field-specifications.md)
- [Frontmatter Structure](#frontmatter-structure.md)
- [Naming Conventions](#naming-conventions.md)
- [Standard SKILL.md Sections](#standard-skillmd-sections.md)
- [Required Section Order](#required-section-order.md)
- [Section-by-Section Breakdown](#section-by-section-breakdown.md)
- [Overview Section](#overview-section.md)
- [When to Use Section](#when-to-use-section.md)
- [Core Pattern Section](#core-pattern-section.md)
- [Quick Reference Section](#quick-reference-section.md)
- [Implementation Section](#implementation-section.md)
- [Common Mistakes Section](#common-mistakes-section.md)
- [Supporting Files Organization](#supporting-files-organization.md)
- [File Inclusion Decision Tree](#file-inclusion-decision-tree.md)
- [Supporting File Types](#supporting-file-types.md)
- [Flowchart Usage Guidelines](#flowchart-usage-guidelines.md)
- [When to Use Flowcharts](#when-to-use-flowcharts.md)
- [Never Use Flowcharts For](#never-use-flowcharts-for.md)
- [Rendering Flowcharts](#rendering-flowcharts.md)
- [Code Examples Best Practices](#code-examples-best-practices.md)
- [One Excellent Example Principle](#one-excellent-example-principle.md)
- [Language Selection](#language-selection.md)
- [Anti-Pattern: Multi-Language Dilution](#anti-pattern-multi-language-dilution.md)
- [Cross-Referencing Other Skills](#cross-referencing-other-skills.md)
- [Reference Syntax](#reference-syntax.md)
- [Why Avoid @ Syntax](#why-avoid-syntax.md)
- [Flat Namespace Design](#flat-namespace-design.md)
- [Content Optimization Guidelines](#content-optimization-guidelines.md)
- [Token Efficiency Targets](#token-efficiency-targets.md)
- [Token Reduction Techniques](#token-reduction-techniques.md)
- [Move Details to Tool Help](#move-details-to-tool-help.md)
- [Use Cross-References](#use-cross-references.md)
- [Compress Examples](#compress-examples.md)
- [Verification Command](#verification-command.md)
- [Summary: Required Elements](#summary-required-elements.md)
