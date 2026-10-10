# Stigmergy Gateway Documentation

## 🌐 Stigmergy Gateway - Remote CLI Orchestration

**SEO Keywords**: Stigmergy Gateway, AI CLI remote control, Feishu AI bot, Telegram AI bot, Slack AI bot, Discord AI bot, AI orchestration, remote AI management, multi-agent control, AI team management, chat-to-CLI, AI bot integration, CLI gateway, remote AI control, stigmergy

---

## 🎯 What is Stigmergy Gateway?

Stigmergy Gateway is a powerful remote orchestration system that bridges chat platforms with AI CLI tools. Control your entire AI team (Claude, Gemini, Qwen, iFlow, and 8+ more) from Feishu, Telegram, Slack, or Discord!

Stigmergy Gateway enables you to manage AI agents remotely through familiar chat interfaces.

### Key Features

- **📱 Multi-Platform Support**: Feishu, Telegram, Slack, Discord
- **🎛️ Full CLI Control**: Execute any Stigmergy command via chat
- **👥 Team Collaboration**: Share AI capabilities across your organization
- **🌍 Remote Access**: Control AI agents from anywhere
- **🔄 Real-time Updates**: Live command execution and results
- **🔐 Secure**: Token validation and audit logging

---

## 🚀 Quick Start

### Installation

```bash
# Already have Stigmergy? Gateway is included!
stigmergy --version

# Install Stigmergy with Gateway
npm install -g stigmergy@beta
```

### Start Gateway

```bash
# Basic start with Feishu
stigmergy gateway --feishu

# With Telegram bot
stigmergy gateway --telegram --port 3001

# Multi-platform mode
stigmergy gateway --feishu --telegram --slack --discord

# With public tunnel (ngrok)
stigmergy gateway --feishu --tunnel

# Custom working directory
stigmergy gateway --feishu --workdir ./my-project
```

---

## 📋 Platform Setup

### 1. Feishu (飞书) Setup

```bash
# Initialize Feishu configuration
stigmergy gateway init --feishu

# Start Feishu bot
stigmergy gateway --feishu --port 3000
```

**Feishu Configuration**:

1. Create a bot at https://open.feishu.cn/
2. Get App ID and App Secret
3. Configure Webhook URL: `http://your-server:3000/webhook/feishu`
4. Add bot to group chat
5. Mention bot with commands

### 2. Telegram Setup

```bash
# Initialize Telegram configuration
stigmergy gateway init --telegram

# Start Telegram bot
stigmergy gateway --telegram --port 3000
```

**Telegram Configuration**:

1. Create bot via @BotFather: `/newbot`
2. Get Bot Token
3. Configure Webhook: `https://your-domain.com/webhook/telegram`
4. Start conversation with `/start`

### 3. Slack Setup

```bash
# Initialize Slack configuration
stigmergy gateway init --slack

# Start Slack bot
stigmergy gateway --slack --port 3000
```

**Slack Configuration**:

1. Create app at https://api.slack.com/apps
2. Enable Bot User and Events API
3. Configure Request URL: `http://your-server:3000/webhook/slack`
4. Add to workspace and channels

### 4. Discord Setup

```bash
# Initialize Discord configuration
stigmergy gateway init --discord

# Start Discord bot
stigmergy gateway --discord --port 3000
```

**Discord Configuration**:

1. Create app at https://discord.com/developers/applications
2. Add Bot with Message Content intent
3. Configure Interactions Endpoint: `http://your-server:3000/webhook/discord`
4. Invite bot to server

---

## 💬 Command Reference

### Basic Commands

| Command        | Description             |
| -------------- | ----------------------- |
| `@bot help`    | Show help message       |
| `@bot status`  | Check AI tools status   |
| `@bot list`    | List available AI tools |
| `@bot version` | Show version info       |

### AI Execution Commands

| Command                 | Description            |
| ----------------------- | ---------------------- |
| `@bot claude "task"`    | Execute with Claude    |
| `@bot gemini "task"`    | Execute with Gemini    |
| `@bot qwen "task"`      | Execute with Qwen      |
| `@bot iflow "task"`     | Execute with iFlow     |
| `@bot codebuddy "task"` | Execute with CodeBuddy |
| `@bot qodercli "task"`  | Execute with Qoder     |
| `@bot copilot "task"`   | Execute with Copilot   |
| `@bot codex "task"`     | Execute with Codex     |
| `@bot kode "task"`      | Execute with Kode      |
| `@bot kilocode "task"`  | Execute with KiloCode  |
| `@bot opencode "task"`  | Execute with OpenCode  |

### Advanced Commands

| Command                     | Description               |
| --------------------------- | ------------------------- |
| `@bot concurrent "task"`    | Run on multiple AIs       |
| `@bot route "task"`         | Smart route to best AI    |
| `@bot skill install <repo>` | Install skill             |
| `@bot skill list`           | List skills               |
| `@bot resume`               | Resume last session       |
| `@bot interactive`          | Start interactive session |

### Multi-Platform Examples

```markdown
# Feishu

@AI-Stigmergy claude "write a Python web scraper"

# Telegram

/claude write a Python web scraper
/concurrent analyze this codebase

# Slack

@stigmergy-bot gemini "translate to Spanish"
@stigmergy-bot concurrent "review this PR"

# Discord

!claude create REST API documentation
!concurrent analyze codebase security
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Gateway settings
export STIGMERGY_GATEWAY_PORT=3000
export STIGMERGY_GATEWAY_HOST=0.0.0.0

# Feishu settings
export FEISHU_APP_ID=your_app_id
export FEISHU_APP_SECRET=your_app_secret
export FEISHU_VERIFY_TOKEN=your_verify_token

# Telegram settings
export TELEGRAM_BOT_TOKEN=your_bot_token

# Slack settings
export SLACK_BOT_TOKEN=xoxb-your-token
export SLACK_SIGNING_SECRET=your_signing_secret

# Discord settings
export DISCORD_BOT_TOKEN=your_bot_token
export DISCORD_PUBLIC_KEY=your_public_key

# Ngrok tunnel
export STIGMERGY_NGROK_AUTH=your_ngrok_auth_token
```

### Config File

Create `~/.stigmergy/gateway.json`:

```json
{
  "port": 3000,
  "host": "0.0.0.0",
  "platforms": {
    "feishu": {
      "enabled": true,
      "app_id": "${FEISHU_APP_ID}",
      "app_secret": "${FEISHU_APP_SECRET}"
    },
    "telegram": {
      "enabled": true,
      "bot_token": "${TELEGRAM_BOT_TOKEN}"
    },
    "slack": {
      "enabled": true,
      "bot_token": "${SLACK_BOT_TOKEN}",
      "signing_secret": "${SLACK_SIGNING_SECRET}"
    },
    "discord": {
      "enabled": true,
      "bot_token": "${DISCORD_BOT_TOKEN}",
      "public_key": "${DISCORD_PUBLIC_KEY}"
    }
  },
  "tunnel": {
    "enabled": false,
    "provider": "ngrok",
    "authtoken": "${STIGMERGY_NGROK_AUTH}"
  },
  "security": {
    "rate_limit": 10,
    "command_whitelist": ["claude", "gemini", "qwen", "status"],
    "audit_logging": true
  }
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Stigmergy Gateway                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Feishu  │  │ Telegram │  │  Slack   │  │ Discord  │       │
│  │  Adapter │  │  Adapter │  │  Adapter │  │  Adapter │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │            │            │            │                │
│       └────────────┴────────────┴────────────┘                │
│                          │                                     │
│                  ┌───────▼───────┐                            │
│                  │   Message     │                            │
│                  │   Parser      │                            │
│                  └───────┬───────┘                            │
│                          │                                     │
│                  ┌───────▼───────┐                            │
│                  │   Command    │                            │
│                  │   Router     │                            │
│                  └───────┬───────┘                            │
│                          │                                     │
│     ┌────────────────────┼────────────────────┐              │
│     │                    │                    │              │
│ ┌───▼────┐  ┌──────────┐  ┌──────────┐  ┌───▼────┐        │
│ │ Claude │  │  Gemini   │  │  Qwen    │  │ iFlow  │        │
│ └────────┘  └──────────┘  └──────────┘  └────────┘        │
│      .                .           .           .               │
│      .                .           .           .               │
│   [11+ AI Tools via Stigmergy Router]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 API Endpoints

### HTTP Endpoints

| Endpoint             | Method | Description               |
| -------------------- | ------ | ------------------------- |
| `/status`            | GET    | Server health check       |
| `/webhook/:platform` | POST   | Receive platform messages |
| `/execute`           | POST   | Execute remote command    |
| `/api/v1/chat`       | POST   | Chat completion API       |
| `/api/v1/tools`      | GET    | List available tools      |

### Webhook Payloads

**Feishu**:

```json
{
  "msg_type": "text",
  "content": {
    "text": "@bot claude \"write a function\""
  },
  "sender": {
    "open_id": "ou_xxx"
  }
}
```

**Telegram**:

```json
{
  "message": {
    "text": "/claude write a function",
    "from": {
      "id": 123456
    }
  }
}
```

**Slack**:

```json
{
  "type": "message",
  "text": "@stigmergy claude write a function",
  "user": "U123456"
}
```

**Discord**:

```json
{
  "data": {
    "content": "!claude write a function"
  },
  "member": {
    "user": {
      "id": "123456789"
    }
  }
}
```

---

## 🔐 Security

### Authentication Flow

```
1. Platform → Webhook → Validate Token
2. Token Valid → Parse Message → Route Command
3. Execute Command → Format Result → Return to Platform
4. All Commands → Audit Log
```

### Security Features

- **Token Validation**: Verify platform signatures
- **Rate Limiting**: Prevent spam (default: 10 req/min)
- **Command Whitelist**: Restrict dangerous commands
- **Audit Logging**: Track all activities
- **Input Sanitization**: Prevent injection attacks
- **Timeout Protection**: Auto-kill long-running commands

---

## 🚨 Troubleshooting

### Gateway Won't Start

```bash
# Check port
netstat -ano | findstr :3000

# Check logs
stigmergy gateway --verbose

# Check permissions
stigmergy gateway --feishu --port 3000 --verbose
```

### Bot Not Responding

```bash
# Verify webhook configuration
curl http://localhost:3000/status

# Check platform connection
stigmergy gateway status

# Restart with debug
stigmergy gateway --telegram --verbose
```

### Commands Not Executing

```bash
# Check AI tools status
stigmergy status

# Verify CLI tools installed
stigmergy scan

# Test direct execution
stigmergy claude "test"
```

---

## 📈 Performance

### Benchmarks

| Metric              | Value   |
| ------------------- | ------- |
| Cold Start          | < 2s    |
| Command Execution   | < 5s    |
| Concurrent Requests | 50+     |
| Memory Usage        | ~50MB   |
| Response Time       | < 100ms |

### Optimization Tips

1. **Keep Gateway Running**: Avoid cold starts
2. **Use Persistent CLI**: Enable connection pooling
3. **Limit Concurrent Requests**: Use rate limiting
4. **Monitor Resources**: Check `stigmergy gateway status`

---

## 🤝 Contributing

### Add New Platform

1. Create adapter in `src/gateway/adapters/`
2. Implement `PlatformAdapter` interface
3. Add configuration parsing
4. Write unit tests
5. Update documentation

### Example Adapter Structure

```javascript
// src/gateway/adapters/custom.js
const { BaseAdapter } = require("./base");

class CustomAdapter extends BaseAdapter {
  constructor(config) {
    super("custom", config);
  }

  async handleWebhook(payload) {
    // Parse platform-specific payload
    const message = this.parseMessage(payload);
    const command = this.extractCommand(message);
    return { message, command };
  }

  async sendResponse(messageId, response) {
    // Send response back to platform
  }
}

module.exports = CustomAdapter;
```

---

## 📚 Related Documentation

- [Stigmergy README](../README.md) - Main documentation
- [Gateway Implementation Plan](./GATEWAY_IMPLEMENTATION_PLAN.md) - Technical details
- [CLI Commands](../src/cli/router-beta.js) - All available commands
- [ResumeSession Guide](./RESUME_SESSION.md) - Cross-session recovery

---

## 📝 Changelog

### v1.5.0 (2026-02-07)

- ✅ Multi-platform gateway launch
- ✅ Feishu, Telegram, Slack, Discord adapters
- ✅ Ngrok tunnel support
- ✅ Audit logging
- ✅ Rate limiting
- ✅ Command whitelist

---

## ⭐ License

MIT License - See [LICENSE](../LICENSE) for details.

---

**Made with ❤️ by the Stigmergy CLI Team**

_Stigmergy Gateway - Remote CLI Orchestration_
