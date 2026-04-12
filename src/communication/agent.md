# Communication Layer

Cross-platform messaging adapter for bridging chat platforms to Stigmergy CLI commands.

## Purpose

Parses messages from external platforms (Feishu, Telegram, etc.), routes commands to appropriate handlers, and formats responses back to platform-specific formats.

## Key Components

- Platform adapter registry - unified interface for multiple IM platforms
- Message normalization - extracts command text from platform-specific payloads
- Response formatting - adapts Stigmergy output to each platform's card/message format

See also `src/gateway/` for the full Gateway server implementation that uses this layer.
