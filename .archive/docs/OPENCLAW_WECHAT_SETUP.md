# OpenClaw WeChat 集成指南

## 🎯 目标

让 Stigmergy 的所有 AI CLI（Claude、Gemini、Qwen 等）都可以通过**个人微信**与用户对话。

## 📦 OpenClaw 简介

**OpenClaw** 是一个 AI Bot 框架，支持通过**个人微信扫码**接入。

**关键特性**:
- ✅ 个人微信扫码登录（无需企业认证）
- ✅ 支持多微信账号同时在线
- ✅ 提供完整的 iLink API 协议
- ✅ 支持文本、图片、语音、文件、视频

**官方文档**: https://docs.openclaw.ai/install

## 🚀 快速开始

### 步骤 1: 安装 OpenClaw

```bash
# 快速安装（推荐）
npx -y @tencent-weixin/openclaw-weixin-cli install

# 或手动安装
npm install -g @openclaw/cli
npm install -g @tencent-weixin/openclaw-weixin
```

### 步骤 2: 启用 WeChat 插件

```bash
# 启用插件
openclaw config set plugins.entries.openclaw-weixin.enabled true
```

### 步骤 3: 扫码登录微信

```bash
# 扫码登录
openclaw channels login --channel openclaw-weixin
```

终端会显示二维码，用手机微信扫码确认授权。

### 步骤 4: 启动 OpenClaw Gateway

```bash
# 启动网关（默认端口 39280）
openclaw gateway start

# 或后台运行
openclaw gateway restart
```

### 步骤 5: 获取 Token

登录后，OpenClaw 会自动保存 token 到本地配置。

查看 token:
```bash
openclaw config get
```

## 🔧 集成到 Stigmergy

### 方式 1: 使用适配器（推荐）

Stigmergy 已提供完整的适配器实现：

```javascript
const { OpenClawWeChatHandler } = require('./skills/openclaw-wechat-adapter');

// 创建处理器
const handler = new OpenClawWeChatHandler({
  gatewayUrl: 'http://localhost:39280',
  token: 'your-token-here',
  cliType: 'claude', // 或 'gemini', 'qwen' 等
  projectPath: process.cwd()
});

// 启动消息监听
await handler.start();
```

### 方式 2: 直接使用 iLink API

```javascript
const { OpenClawILinkClient } = require('./skills/openclaw-wechat-adapter');

const client = new OpenClawILinkClient({
  gatewayUrl: 'http://localhost:39280',
  token: 'your-token-here'
});

// 长轮询获取消息
const response = await client.getUpdates('');

// 发送文本消息
await client.sendTextMessage('user-id', 'Hello!', 'context-token');
```

## 📡 iLink API 协议

### 请求头

```
Content-Type: application/json
AuthorizationType: ilink_bot_token
Authorization: Bearer <token>
```

### 主要端点

#### 1. getUpdates - 长轮询获取消息

**请求**:
```json
{
  "get_updates_buf": ""
}
```

**响应**:
```json
{
  "ret": 0,
  "msgs": [...],
  "get_updates_buf": "<new cursor>",
  "longpolling_timeout_ms": 35000
}
```

#### 2. sendMessage - 发送消息

**请求**:
```json
{
  "msg": {
    "to_user_id": "<target user ID>",
    "context_token": "<conversation context token>",
    "item_list": [
      {
        "type": 1,
        "text_item": { "text": "Hello" }
      }
    ]
  }
}
```

#### 3. getUploadUrl - 获取上传URL

用于上传图片、视频、文件等。

## 🤖 支持 AI CLI

适配器支持所有 Stigmergy 集成的 AI CLI：

- ✅ **Claude CLI** (`@anthropic-ai/claude-code`)
- ✅ **Gemini CLI** (`@google/gemini-cli`)
- ✅ **Qwen CLI** (`@qwen-code/qwen-code`)
- ✅ **iFlow CLI** (`@iflow-ai/iflow-cli`)
- ✅ **Qoder CLI** (`@qoder-ai/qodercli`)
- ✅ **CodeBuddy CLI** (`@tencent-ai/codebuddy-code`)
- ✅ **Copilot CLI** (`@github/copilot`)
- ✅ **Codex CLI** (`@openai/codex`)
- ✅ **Kode CLI** (`@shareai-lab/kode`)

## 📝 配置示例

创建配置文件 `openclaw-config.json`:

```json
{
  "gatewayUrl": "http://localhost:39280",
  "token": "your-token-here",
  "cliType": "claude",
  "projectPath": "/path/to/your/project",
  "timeout": 35000,
  "conversationHistory": true
}
```

## 🔄 工作流程

```
用户(微信)
  ↓ 发送消息
OpenClaw Gateway
  ↓ iLink API (getUpdates)
Stigmergy Adapter
  ↓ 调用
AI CLI (Claude/Gemini/etc.)
  ↓ 返回响应
Stigmergy Adapter
  ↓ iLink API (sendMessage)
OpenClaw Gateway
  ↓ 发送
用户(微信)
```

## 🎬 完整示例

```javascript
const { OpenClawWeChatHandler } = require('./skills/openclaw-wechat-adapter');

async function main() {
  // 创建处理器
  const handler = new OpenClawWeChatHandler({
    gatewayUrl: 'http://localhost:39280',
    token: process.env.OPENCLAW_TOKEN,
    cliType: 'claude',
    projectPath: process.cwd()
  });

  // 启动消息监听
  console.log('🚀 启动微信对话服务...');
  await handler.start();

  // 优雅退出
  process.on('SIGINT', async () => {
    console.log('\\n🛑 正在停止服务...');
    await handler.stop();
    process.exit(0);
  });
}

main().catch(console.error);
```

## 🔍 故障排查

### 问题 1: 无法连接到 Gateway

**检查**:
```bash
# 检查 Gateway 是否运行
curl http://localhost:39280/health

# 查看 Gateway 日志
openclaw gateway logs
```

### 问题 2: Token 无效

**解决**:
```bash
# 重新登录
openclaw channels login --channel openclaw-weixin

# 获取新 token
openclaw config get
```

### 问题 3: 消息发送失败

**检查**:
- 确保 `context_token` 正确传递
- 检查用户ID是否正确
- 查看错误码和错误信息

## 📊 消息类型

支持的消息类型：

| 类型 | type 值 | 说明 |
|------|---------|------|
| 文本 | 1 | 纯文本消息 |
| 图片 | 2 | 图片消息（CDN） |
| 语音 | 3 | 语音消息（SILK编码） |
| 文件 | 4 | 文件附件 |
| 视频 | 5 | 视频消息 |

## 🔐 安全注意事项

1. **Token 保护**: 不要将 token 提交到代码仓库
2. **环境变量**: 使用环境变量存储敏感信息
3. **访问控制**: Gateway 仅监听 localhost
4. **加密传输**: 所有媒体文件使用 AES-128-ECB 加密

## 📚 相关资源

- **OpenClaw 官方文档**: https://docs.openclaw.ai/install
- **npm 包**: @tencent-weixin/openclaw-weixin
- **iLink API 协议**: 见 README 文档

## ✅ 验证清单

部署前检查：

- [ ] OpenClaw 已安装
- [ ] WeChat 插件已启用
- [ ] 微信账号已扫码登录
- [ ] Gateway 正在运行
- [ ] Token 已获取
- [ ] AI CLI 已安装
- [ ] 防火墙允许 localhost:39280
- [ ] 测试消息收发正常

## 🎉 完成

现在您的 Stigmergy 项目已经可以通过个人微信与用户对话了！

用户发送微信消息 → OpenClaw 接收 → Stigmergy 调用 AI CLI → 返回响应到微信
