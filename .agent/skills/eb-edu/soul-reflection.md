---
name: soul-reflection
description: Self-reflection and analysis - Learn from experience through dual-agent collaboration
---

# Soul Reflection - 自我反思与进化

## Overview

Use dual-agent collaboration to analyze experiences, extract lessons, and plan improvements.

## When to Use

- After completing a major task
- When encountering repeated failures
- Before starting similar tasks
- For continuous improvement

## The Process

### Phase 1: Experience Review

**Agent 1 (Actor)**: Describe what was done
- What actions were taken?
- What was the intended outcome?
- What was the actual outcome?

**Agent 2 (Reflector)**: Ask probing questions
- Why was this approach chosen?
- What assumptions were made?
- What alternatives were considered?

### Phase 2: Gap Analysis

**Agent 1**: Identify gaps
- What worked well?
- What didn't work?
- What was missing?

**Agent 2**: Challenge assumptions
- Were the right metrics used?
- Were there external factors?
- Was the goal realistic?

### Phase 3: Lesson Extraction

**Together**: Extract lessons
- Key success factors
- Critical failure points
- Unexpected discoveries

### Phase 4: Improvement Planning

**Together**: Plan improvements
- What to start doing
- What to stop doing
- What to continue doing

## Output Format

```markdown
# Reflection Report

## Experience Summary
[What was done]

## What Worked Well
- ✅ [Success 1]
- ✅ [Success 2]

## What Didn't Work
- ❌ [Failure 1]
- ❌ [Failure 2]

## Root Causes
1. [Cause 1]
2. [Cause 2]

## Lessons Learned
1. [Lesson 1]
2. [Lesson 2]

## Action Items
- Start: [What to start]
- Stop: [What to stop]
- Continue: [What to continue]
```

## Example

**User**: "Reflect on the skills implementation"

**Agent 1**: We implemented 58 skills with cross-platform compatibility...

**Agent 2**: But did we actually test them with real backend?

**Agent 1**: No, we only tested file existence and execution...

**Agent 2**: So the gap is real integration testing...

**Output**:
```markdown
# Skills Implementation Reflection

## Experience Summary
Implemented 58 skills with cross-platform compatibility

## What Worked Well
- ✅ All 58 skills pass file/execution tests
- ✅ Cross-platform encoding works
- ✅ No external dependencies

## What Didn't Work
- ❌ No real backend integration test
- ❌ Medusa not deployed
- ❌ Skills can't actually call API

## Root Causes
1. Focused on quantity over quality
2. Assumed backend was running
3. Didn't verify end-to-end flow

## Lessons Learned
1. Test with real dependencies first
2. Deploy backend before testing skills
3. End-to-end test > unit test

## Action Items
- Start: Deploy medusa backend immediately
- Stop: Testing skills without backend
- Continue: Cross-platform compatibility
```
