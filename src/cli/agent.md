# CLI Command System

Parses user commands via `commander`, dispatches to modular handlers, and manages execution modes (interactive vs one-time).

## Key Files

- `router-beta.js` - Modular router (current), delegates to `commands/` handlers
- `utils/` - Formatters, environment helpers
- `commands/` - Individual command handlers (install, scan, skills, status, etc.)

## Design

- `router-beta.js` imports `CLI_TOOLS` from `core/cli_tools.js` and uses `ExecutionModeDetector` + `CLIAdapterManager` from `core/`
- All CLI output uses `chalk` for styling
- Error handling delegates to `core/error_handler.js`
