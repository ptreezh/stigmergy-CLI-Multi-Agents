# Event Bus

TypeScript event system for cross-agent communication within the orchestration layer.

## Components

- `EventBus.ts` - Publish/subscribe event bus with file persistence and `findings.md` recording
- `event-types.ts` - Type definitions for all event types

## Features

- In-memory event log with file persistence to `COORDINATION_DIR/event-log.json`
- Automatic `findings.md` recording for important events
- Correlation ID support for tracing event chains
