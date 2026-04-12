# CC-Connect Adapter

Multi-platform Instant Messaging (IM) gateway adapter. Unlike AI CLI adapters, this connects to chat platforms rather than running AI coding tools.

## Supported Platforms

Feishu, Telegram, WeChat, DingTalk, Slack, Discord, LINE, WeCom, QQ

## Configuration

- Config dir: `~/.stigmergy/cc-connect/`
- Config file: `~/.stigmergy/cc-connect/config.toml`
- Type marker: `im-gateway` (distinguishes from AI CLI tools in `cli_tools.js`)

## Usage

Configured in `router-beta.js` under `IM_GATEWAYS`. Auto-installed before AI CLI tools when using gateway mode.
