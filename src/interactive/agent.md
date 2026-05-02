# Interactive Mode

Persistent interactive CLI sessions with cross-tool context sharing and CLI pool management.

## Components

- `InteractiveModeController.js` - Main controller; manages readline interface, session state, context
- `PersistentCLIPool.js` - Maintains a pool of persistent CLI processes for fast response
- `FileLock.js` - File-based locking for concurrent access

## Key Features

- Auto-saves session history and context
- Supports concurrent CLI execution (configurable concurrency)
- Integrates with project status board and concurrent command system
- Default CLI is `qwen`; configurable via options
