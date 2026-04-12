# Stigmergy Gateway

Remote CLI orchestration server exposing Stigmergy commands via chat platforms.

## Components

- `server.js` / `index.js` - GatewayServer entry point
- `core/` - MessageParser, CommandRouter, ResultFormatter
- `adapters/` - Platform adapters: Feishu, Telegram, Slack, Discord

## Supported Platforms

Feishu, Telegram, Slack, Discord - each adapter parses inbound webhooks and formats outbound messages/cards.

## Usage

```bash
stigmergy gateway --feishu --telegram --port 3000
stigmergy gateway --feishu --tunnel   # with public tunnel
```
