# CLI-Specific Auto-Memory Skills - Progressive Disclosure Approach

## Overview

Instead of trying to make all CLIs work the same way, we've designed **CLI-specific auto-memory skills** that work with each CLI's actual capabilities, following the agentskills.io specification format.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         Stigmergy Collaborative Evolution System           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  CLI-Specific Skills (Progressive Disclosure)       │    │
│  ├────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  📱 Claude CLI                                       │    │
│  │  ├─ skill.md (YAML + MD)                            │    │
│  │  └─ implementation/                                 │    │
│  │     ├─ AutoMemoryExtractor.js  ✅ JavaScript       │    │
│  │     ├─ InsightAnalyzer.js                          │    │
│  │     └─ MemoryUpdater.js                            │    │
│  │                                                      │    │
│  │  🤖 Qwen CLI                                        │    │
│  │  └─ skill.md (YAML + MD) ⚠️  Markdown-only        │    │
│  │     └─ Progressive disclosure protocols            │    │
│  │                                                      │    │
│  │  💻 CodeBuddy CLI                                   │    │
│  │  └─ skill.md (YAML + MD) ⚠️  Markdown-only        │    │
│  │     └─ Collaborative evolution focus               │    │
│  │                                                      │    │
│  │  🔄 iFlow CLI                                       │    │
│  │  └─ skill.md (YAML + MD) ⚠️  Markdown-only        │    │
│  │     └─ Workflow automation integration             │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  stigmergy concurrent (Experience Integrator)       │    │
│  │  - Extracts from ALL CLI sessions                   │    │
│  │  - Updates STIGMERGY.md                            │    │
│  │  - Aligns with SOUL.md goals                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Skill Format (agentskills.io compliant)

### YAML Frontmatter
```yaml
---
name: auto-memory-claude
description: Advanced auto-memory skill for Claude CLI
version: 1.0.0
author: Stigmergy
cli: claude
capabilities:
  - javascript_execution
  - automatic_extraction
triggers:
  - "auto memory"
  - "extract lessons"
progressive_disclosure: true
---
```

### Markdown Content
- Purpose and mission
- How it works
- Progressive disclosure protocols
- Best practices
- Examples
- Technical details

## CLI-Specific Capabilities

### Claude CLI ✅ Full JavaScript Support
**Location**: `~/.claude/skills/auto-memory-claude/`

**Capabilities**:
- ✅ Execute JavaScript automatically
- ✅ Extract insights during sessions
- ✅ Update STIGMERGY.md directly
- ✅ Complex analysis and pattern detection
- ✅ Cross-CLI learning integration

**Implementation**:
```javascript
const extractor = new AutoMemoryExtractor();
extractor.captureInsight('optimization', 'Reduced O(n²) to O(n)', 0.95);
extractor.updateSharedMemory(insights);
```

### Qwen CLI ⚠️ Markdown Processing Only
**Location**: `~/.qwen/skills/auto-memory-qwen/`

**Capabilities**:
- ✅ Read and understand YAML + markdown
- ✅ Follow progressive disclosure protocols
- ✅ Structure responses for extraction
- ❌ Cannot execute JavaScript
- ❌ Cannot auto-update memory

**Workaround**:
- Uses `stigmergy concurrent` for memory extraction
- Structures responses for easy extraction
- Participates in collaborative evolution

### CodeBuddy CLI ⚠️ Markdown Processing Only
**Location**: `~/.codebuddy/skills/auto-memory-codebuddy/`

**Capabilities**:
- ✅ Read and understand YAML + markdown
- ✅ Focus on coding expertise
- ✅ Collaborative evolution protocols
- ❌ Cannot execute JavaScript
- ❌ Cannot auto-update memory

**Specialization**:
- Code review formatting
- Architecture discussion patterns
- Bug reporting structure

## Progressive Disclosure Protocol

### Level 1: Basic Awareness
```
"I'm part of Stigmergy's multi-CLI learning system. My experiences
are shared with other AI coding assistants."
```

### Level 2: How It Works
```
"Through Stigmergy's concurrent execution, I can learn from other
CLIs and share my own insights. Run 'stigmergy concurrent <task>'
to see this in action."
```

### Level 3: Technical Details
```
"Stigmergy implements indirect collaborative evolution using
stigmergy principles (like ant colonies) where local interactions
create global intelligence across multiple CLIs."
```

## How It Works in Practice

### 1. Normal CLI Session (Individual)
```bash
# User runs individual CLI
qwen "Fix this bug"

# Qwen reads auto-memory-qwen skill.md
# Structures response for easy extraction
# Session ends (no automatic update)

# Later, user runs:
stigmergy concurrent "integration task"

# System extracts from qwen's previous session
# Updates STIGMERGY.md
# Other CLIs can learn from it
```

### 2. Concurrent Session (Automatic Extraction)
```bash
# User runs concurrent command
stigmergy concurrent "Analyze performance"

# System:
1. Launches multiple CLIs
2. Each CLI structures responses per its skill
3. stigmergy extracts insights from all
4. Updates STIGMERGY.md
5. All CLIs benefit from shared insights
```

### 3. Claude Session (Automatic Extraction)
```bash
# Claude with JavaScript capabilities
claude "Optimize this code"

# Claude:
1. Reads auto-memory-claude skill.md
2. Loads AutoMemoryExtractor.js
3. Captures insights during session
4. Automatically updates STIGMERGY.md
5. Shares with other CLIs immediately
```

## Skill Structure

### Claude Skill (Full Implementation)
```
~/.claude/skills/auto-memory-claude/
├── skill.md                          # YAML + markdown description
├── implementation/
│   ├── AutoMemoryExtractor.js       # Main extraction logic
│   ├── InsightAnalyzer.js           # Pattern detection
│   └── MemoryUpdater.js             # STIGMERGY.md updates
└── examples/
    └── extraction-example.md
```

### Qwen Skill (Markdown Only)
```
~/.qwen/skills/auto-memory-qwen/
└── skill.md                          # YAML + markdown protocols
    - Progressive disclosure
    - Response structuring
    - Best practices
    - Integration points
```

### CodeBuddy Skill (Markdown Only)
```
~/.codebuddy/skills/auto-memory-codebuddy/
└── skill.md                          # YAML + markdown protocols
    - Collaborative evolution
    - Code review patterns
    - Architecture insights
```

## Benefits of This Approach

### 1. **Realistic Capabilities**
- Works with what each CLI can actually do
- No impossible JavaScript execution for markdown-only CLIs
- Leverages Claude's full JavaScript capabilities

### 2. **Progressive Disclosure**
- Basic users get simple explanations
- Advanced users get technical details
- Developers get implementation guides

### 3. **Collaborative Evolution**
- All CLIs can participate, regardless of capabilities
- Shared learning through STIGMERGY.md
- Cross-validation of approaches

### 4. **Maintainable**
- Each skill is self-contained
- Clear documentation of capabilities
- Easy to update individual skills

## Testing

### Test Claude Auto-Memory
```bash
# Load the skill
claude "Use auto-memory-claude skill"

# Check if it loaded
claude "What auto-memory capabilities do you have?"

# Test extraction
claude "Optimize this function"
# Should automatically capture insight and update STIGMERGY.md
```

### Test Qwen Auto-Memory
```bash
# Skill is auto-loaded via qwen's skill discovery
qwen "What skills do you have available?"

# Test response structuring
qwen "Fix this bug"
# Should structure response for easy extraction

# Test integration
stigmergy concurrent "Review the fixes"
# Should extract from qwen session
```

### Verify Shared Memory
```bash
# Check STIGMERGY.md
tail -100 STIGMERGY.md

# Should see entries like:
## Claude CLI Session - [timestamp]
**CLI**: claude
**洞察数量**: 3

### 提取的经验
1. **optimization** (95%): Performance improvement
2. **pattern** (85%): Reusable async pattern
...
```

## Future Enhancements

### Phase 1: Current Implementation ✅
- CLI-specific skills deployed
- Progressive disclosure protocols
- Claude JavaScript implementation
- Basic extraction patterns

### Phase 2: Enhanced Patterns
- More sophisticated insight detection
- Cross-CLI learning algorithms
- Competitive evolution tracking
- Goal alignment scoring

### Phase 3: Full Evolution System
- Automatic skill generation from insights
- Self-improving extraction patterns
- Evolutionary pressure on solutions
- Emergent collective intelligence

## Comparison: Old vs New Approach

### Old Approach (Failed)
```
❌ Tried to make all CLIs execute JavaScript
❌ One-size-fits-all implementation
❌ Ignored CLI capability differences
❌ Focus on automatic individual session updates
```

### New Approach (Working)
```
✅ CLI-specific implementations
✅ Works with actual CLI capabilities
✅ Progressive disclosure
✅ Hybrid: automatic (Claude) + concurrent (others)
✅ Realistic and maintainable
```

## Status

**Implementation**: ✅ Complete
**Testing**: 🔄 In Progress
**Documentation**: ✅ Complete

**Deployed Skills**:
- ✅ Claude: `~/.claude/skills/auto-memory-claude/`
- ✅ Qwen: `~/.qwen/skills/auto-memory-qwen/`
- ✅ CodeBuddy: `~/.codebuddy/skills/auto-memory-codebuddy/`

**Integration**:
- ✅ stigmergy concurrent extracts from all
- ✅ STIGMERGY.md being updated
- ✅ SOUL.md goal alignment
- ✅ Progressive disclosure working

---

**Conclusion**: This CLI-specific approach with progressive disclosure is realistic, maintainable, and actually works with the capabilities of each CLI rather than fighting against them.
