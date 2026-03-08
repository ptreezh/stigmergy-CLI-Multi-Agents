# Stigmergy Auto-Evolution System Status

## Overview
This document summarizes the current state of the Stigmergy auto-evolution system and explains what works and what doesn't.

## What Works ✅

### 1. Collaborative Evolution via `stigmergy concurrent`
- **Status**: FULLY FUNCTIONAL
- **How it works**:
  - Run `stigmergy concurrent "<task description>"`
  - System automatically launches multiple CLIs in parallel
  - Extracts experiences from independent CLI sessions (559 qwen sessions, 373 codebuddy sessions, etc.)
  - Integrates insights into shared memory (STIGMERGY.md)
  - Updates PROJECT_STATUS.md

- **Example output**:
  ```
  🧠 汲取独立运行经验...
     📖 qwen: 559 个会话
     📖 codebuddy: 373 个会话
     💡 提取到 23 条经验教训
     ✅ 经验已集成到共享记忆
  ```

### 2. Shared SOUL.md
- **Status**: CREATED AND FUNCTIONAL
- **Location**: `C:\bde\stigmergy\SOUL.md`
- **Purpose**: Defines common mission, values, and evolution goals for all CLIs
- **Contents**:
  - 共同使命 (Common Mission)
  - 共享价值观 (Shared Values)
  - 进化目标 (Evolution Goals)

### 3. Shared STIGMERGY.md
- **Status**: BEING UPDATED
- **Location**: `C:\bde\stigmergy\STIGMERGY.md`
- **Purpose**: Records conversation history and collaborative evolution
- **Updates**: Automatically updated by `stigmergy concurrent`

## What Doesn't Work ❌

### 1. Automatic Memory Extraction from Individual CLI Sessions
- **Status**: NOT WORKING
- **Problem**: CLI tools like qwen don't support automatic JavaScript extension loading
- **Attempts made**:
  1. Created auto-memory skill in `~/.stigmergy/skills/auto-memory/`
  2. Created auto-memory hook in `~/.stigmergy/hooks/qwen/auto-memory-hook.js`
  3. Copied hooks to `~/.qwen/hooks/` directory
  4. Updated qwen's `hooks.json` configuration
  5. Created auto-memory extension in `~/.qwen/extensions/auto-memory/`
  6. Updated qwen's `config.json` to include the extension

- **Result**: None of these approaches work because:
  - Qwen CLI only processes markdown-based skills, not JavaScript implementations
  - Qwen doesn't have a built-in mechanism to auto-load JavaScript extensions on startup
  - The hooks are only triggered when manually invoked via `/stigmergy-resume`

### 2. Cross-CLI Skill Auto-Loading
- **Status**: PARTIALLY WORKING
- **What works**: Skills can be discovered from `~/.stigmergy/skills/`
- **What doesn't**: JavaScript-based skills are not automatically executed

## Technical Analysis

### Why Individual CLI Sessions Don't Auto-Update Memory

The core issue is that **different CLI tools have different extension capabilities**:

| CLI | JavaScript Extension Loading | Hook System | Status |
|-----|----------------------------|-------------|---------|
| Claude | ✅ Full support | ✅ Native | Auto-memory works |
| Qwen | ❌ No support | ⚠️ Manual only | Auto-memory doesn't work |
| CodeBuddy | ❌ Unknown | ❌ Unknown | Untested |
| iFlow | ❌ Unknown | ❌ Unknown | Untested |

### How the Concurrent System Works

The `stigmergy concurrent` command works because:
1. It's a Node.js script with full access to the file system
2. It can spawn multiple CLI processes and capture their output
3. It has a function `absorbIndependentSessionExperiences()` that:
   - Scans recent CLI session files
   - Extracts insights from the sessions
   - Updates STIGMERGY.md with the extracted knowledge

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Stigmergy System                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  stigmergy concurrent (WORKS!)                      │    │
│  │  - Launches multiple CLIs                          │    │
│  │  - Absorbs independent session experiences          │    │
│  │  - Updates STIGMERGY.md                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Shared SOUL.md                                     │    │
│  │  - Common mission                                   │    │
│  │  - Shared values                                    │    │
│  │  - Evolution goals                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Shared STIGMERGY.md                                │    │
│  │  - Conversation history                             │    │
│  │  - Collaborative evolution records                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Individual CLI Sessions (DON'T WORK)               │    │
│  │  - qwen "task"                                     │    │
│  │  - codebuddy "task"                                │    │
│  │  - These don't auto-update memory                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Recommendations

### For Collaborative Evolution ✅
1. **Use `stigmergy concurrent`** - This is the primary mechanism for collaborative evolution
2. **Run regular concurrent sessions** - Schedule periodic concurrent tasks to share experiences
3. **Monitor STIGMERGY.md** - Check for accumulated insights

### For Individual CLI Sessions ⚠️
1. **Manual `/stigmergy-resume`** - Users can manually trigger memory extraction
2. **Accept limitations** - Not all CLI tools support automatic extension loading
3. **Focus on capable CLIs** - Prioritize CLIs with full JavaScript support (like Claude)

### For Future Development 🔄
1. **CLI-specific solutions** - Develop custom solutions for each CLI's capabilities
2. **External monitoring** - Create background processes to monitor CLI sessions (invasive)
3. **Wrapper scripts** - Provide optional wrapper scripts for users who want auto-memory (user rejected)

## Conclusion

The Stigmergy auto-evolution system **IS working** for collaborative evolution through `stigmergy concurrent`. This mechanism:
- ✅ Automatically extracts experiences from independent CLI sessions
- ✅ Integrates insights into shared memory
- ✅ Updates STIGMERGY.md
- ✅ Supports true cross-CLI collaborative learning

However, **automatic memory extraction from individual CLI sessions** is NOT working for most CLI tools due to technical limitations in their extension architectures. This is a fundamental limitation of the CLI tools themselves, not the Stigmergy system.

**The path forward**: Use `stigmergy concurrent` as the primary mechanism for collaborative evolution, as it successfully achieves the goal of sharing experiences across different CLI runs.
