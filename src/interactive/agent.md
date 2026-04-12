# Interactive Mode

Persistent interactive CLI sessions with cross-tool context sharing and CLI pool management.

## Components

- `InteractiveModeController.js` - Main controller; manages readline interface, session state, context
- `PersistentCLIPool.js` - Maintains a pool of persistent CLI processes for fast response
- `FileLock.js` - File-based locking for concurrent access
- `SharedContextManager.js` - Shares conversation context across multiple CLI sessions

## Key Features

- Auto-saves session history and context
- Supports concurrent CLI execution (configurable concurrency)
- Integrates with `CentralOrchestrator` from orchestration layer
- Default CLI is `qwen`; configurable via options
