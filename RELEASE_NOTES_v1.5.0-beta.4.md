# Release Notes v1.5.0-beta.4

## What's New

### Concurrent Mode Improvements

**File Lock System**

- Added `FileLock.js` - Robust file locking for concurrent access
- Supports Windows, macOS, and Linux
- Automatic stale lock cleanup
- Crash recovery support

**Shared Context Initialization**

- Automatic initialization of shared context files:
  - `STIGMERGY.md` - Project-level shared context
  - `.stigmergy/status/PROJECT_STATUS.md` - Status board
  - `.stigmergy/memory.json` - Global memory
- File lock coordination for concurrent access

**Enhanced `ProjectStatusBoard.js`**

- Improved lock mechanism (30s timeout, configurable)
- Automatic stale lock cleanup
- Process health check
- Better cross-platform support

### CLI Alias Support

Added CLI name aliases for `use` command:

- `buddy` → `codebuddy`
- `qoder` → `qodercli`
- `kilo` → `kilocode`

### ResumeSession Skill

- Fixed Windows path resolution issues
- Simplified output format
- Added `quick-resume.js` and `resume.js`

## Bug Fixes

- Fixed interactive mode `use` command for kilocode, kode, opencode
- Fixed concurrent mode context sharing
- Fixed file lock race conditions

## Files Changed

```
src/interactive/FileLock.js           # NEW
src/interactive/SharedContextManager.js  # NEW
src/core/ProjectStatusBoard.js       # IMPROVED
src/cli/commands/concurrent.js        # IMPROVED
src/cli/commands/concurrent.js       # IMPROVED
src/interactive/InteractiveModeController.js  # IMPROVED
skills/resumesession/resume.js        # NEW
skills/resumesession/quick-resume.js  # NEW
config/builtin-skills.json          # UPDATED
```

## Installation

```bash
npm install -g stigmergy-CLI-Multi-Agents@1.5.0-beta.4
```

## Usage

```bash
# Initialize project
stigmergy init

# Run concurrent tasks with context sharing
stigmergy concurrent "分析代码结构" --concurrency 3

# Use CLI aliases
use buddy      # → codebuddy
use qoder     # → qodercli
use kilo      # → kilocode
```
