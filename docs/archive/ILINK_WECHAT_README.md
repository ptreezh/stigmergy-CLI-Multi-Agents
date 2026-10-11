# Stigmergy WeChat iLink 客户端

## 🎯 目标

**Stigmergy 独立的微信个人号接入方案**，直接调用腾讯官方 iLink AI API，不依赖 OpenClaw 框架。

让所有 AI CLI（opencode、Claude、Qwen、KiloCode 等）都可以通过个人微信与用户对话。

---

## ✨ 核心特性

- ✅ **个人微信扫码登录** - 无需企业认证，扫码即用
- ✅ **官方 API** - 直接调用腾讯 iLink AI API (`https://ilinkai.weixin.qq.com`)
- ✅ **独立实现** - 不依赖 OpenClaw 框架
- ✅ **多 AI CLI 支持** - 支持 Claude、Gemini、Qwen、opencode、KiloCode 等
- ✅ **长轮询消息** - 高效的消息接收机制
- ✅ **完整功能** - 支持文本、图片、文件、视频等

---

## 🏗️ 架构

```
用户(微信)
  ↓ 发送消息
腾讯 iLink AI API
  ↓ HTTP JSON API
Stigmergy iLink Client
  ↓ 调用 AI CLI
Claude/Gemini/Qwen/etc.
  ↓ 返回响应
Stigmergy iLink Client
  ↓ HTTP JSON API
腾讯 iLink AI API
  ↓ 发送到微信
用户(微信) ✅
```

---

## 🚀 快速开始

### 步骤 1: 安装依赖

```bash
# 无需额外依赖！纯 Node.js 实现
```

### 步骤 2: 扫码登录

```bash
# 使用 Claude CLI
node skills/ilink-wechat-client.js claude

# 使用 Gemini CLI
node skills/ilink-wechat-client.js gemini

# 使用 Qwen CLI
node skills/ilink-wechat-client.js qwen

# 使用 opencode
node skills/ilink-wechat-client.js opencode

# 使用 kilocode
node skills/ilink-wechat-client.js kilocode
```

### 步骤 3: 扫码登录

1. 终端会显示二维码链接
2. 用微信扫描二维码
3. 在微信中确认登录
4. 登录成功后自动保存凭证

### 步骤 4: 开始对话

用微信发送任何消息，AI CLI 将自动回复！

---

## 📡 iLink API 协议

### 基础信息

- **API 地址**: `https://ilinkai.weixin.qq.com`
- **CDN 地址**: `https://novac2c.cdn.weixin.qq.com/c2c`
- **认证方式**: `AuthorizationType: ilink_bot_token` + `Authorization: Bearer <token>`

### 主要端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/ilink/bot/get_bot_qrcode` | GET | 获取二维码（扫码登录） |
| `/ilink/bot/get_qrcode_status` | GET | 查询二维码状态 |
| `/ilink/bot/getupdates` | POST | 长轮询获取消息 |
| `/ilink/bot/sendmessage` | POST | 发送消息 |
| `/ilink/bot/getuploadurl` | POST | 获取上传URL |
| `/ilink/bot/getconfig` | POST | 获取配置 |
| `/ilink/bot/sendtyping` | POST | 发送正在输入状态 |

---

## 💻 使用示例

### 基础使用

```javascript
const { StigmergyWeChatClient } = require('./skills/ilink-wechat-client');

// 创建客户端
const client = new StigmergyWeChatClient({
  cliType: 'claude',
  projectPath: process.cwd(),
});

// 扫码登录
const loginResult = await client.loginWithQr();
console.log('登录成功:', loginResult);

// 启动消息监听
await client.start();
```

### 使用已保存的凭证

```javascript
// 加载已保存的凭证
const credentials = StigmergyWeChatClient.loadCredentials();

if (credentials) {
  const client = new StigmergyWeChatClient({
    token: credentials.token,
    accountId: credentials.accountId,
    userId: credentials.userId,
    cliType: 'claude',
  });

  await client.start();
}
```

### 直接使用 API 客户端

```javascript
const { ILinkApiClient } = require('./skills/ilink-wechat-client');

const apiClient = new ILinkApiClient({
  token: 'your-token',
});

// 获取二维码
const qr = await apiClient.getBotQrCode();
console.log('二维码:', qr.qrcodeUrl);

// 查询状态
const status = await apiClient.getQrCodeStatus(qr.qrcode);
console.log('状态:', status.status);

// 发送消息
await apiClient.sendTextMessage('user-id', 'Hello!', 'context-token');
```

---

## 🤖 支持的 AI CLI

所有 Stigmergy 集成的 AI CLI 都支持：

- ✅ **Claude CLI** (`@anthropic-ai/claude-code`)
- ✅ **Gemini CLI** (`@google/gemini-cli`)
- ✅ **Qwen CLI** (`@qwen-code/qwen-code`)
- ✅ **iFlow CLI** (`@iflow-ai/iflow-cli`)
- ✅ **Qoder CLI** (`@qoder-ai/qodercli`)
- ✅ **CodeBuddy CLI** (`@tencent-ai/codebuddy-code`)
- ✅ **Copilot CLI** (`@github/copilot`)
- ✅ **Codex CLI** (`@openai/codex`)
- ✅ **Kode CLI** (`@shareai-lab/kode`)
- ✅ **opencode**
- ✅ **kilocode**

---

## 📝 配置文件

登录凭证自动保存到：
```
.stigmergy/wechat-ilink/credentials.json
```

凭证格式：
```json
{
  "token": "bot-token-here",
  "accountId": "bot-id",
  "userId": "user-id",
  "baseUrl": "https://ilinkai.weixin.qq.com",
  "savedAt": "2026-03-23T12:00:00.000Z"
}
```

---

## 🔍 工作流程

### 扫码登录流程

```
1. 调用 get_bot_qrcode
   ↓
2. 返回二维码链接
   ↓
3. 显示给用户
   ↓
4. 长轮询 get_qrcode_status
   ↓
5. 用户扫码 → status: scaned
   ↓
6. 用户确认 → status: confirmed
   ↓
7. 返回 bot_token 和 bot_id
   ↓
8. 保存凭证
```

### 消息处理流程

```
1. 长轮询 getupdates
   ↓
2. 收到消息
   ↓
3. 提取文本内容
   ↓
4. 调用 AI CLI 处理
   ↓
5. 获取 AI 响应
   ↓
6. 调用 sendmessage 发送
   ↓
7. 继续轮询
```

---

## 📊 消息类型

| 类型 | type 值 | 说明 |
|------|---------|------|
| 文本 | 1 | 纯文本消息 |
| 图片 | 2 | 图片消息（CDN） |
| 语音 | 3 | 语音消息（SILK编码） |
| 文件 | 4 | 文件附件 |
| 视频 | 5 | 视频消息 |

---

## 🎯 与 OpenClaw 的区别

| 特性 | OpenClaw | Stigmergy iLink Client |
|------|----------|----------------------|
| 依赖 | 需要 OpenClaw 框架 | ❌ 无需额外依赖 |
| 安装 | npm install -g openclaw | ❌ 无需安装 |
| 配置 | 复杂的配置文件 | ✅ 自动保存凭证 |
| 启动 | openclaw gateway start | ✅ 直接运行 |
| 集成 | OpenClaw 插件系统 | ✅ 独立运行 |
| 大小 | ~50MB | ✅ ~10KB |

---

## 🔐 安全注意事项

1. **Token 保护**: 凭证文件包含敏感信息，不要提交到代码仓库
2. **HTTPS**: 所有通信使用 HTTPS 加密
3. **Token 验证**: 每次请求都验证 token 有效性
4. **会话过期**: 自动处理会话过期（errcode -14）

---

## 📚 API 详细说明

### get_bot_qrcode

**请求**:
```
GET /ilink/bot/get_bot_qrcode?bot_type=3
```

**响应**:
```json
{
  "qrcode": "qr-code-id",
  "qrcode_img_content": "https://..."
}
```

### get_qrcode_status

**请求**:
```
GET /ilink/bot/get_qrcode_status?qrcode=<qrcode-id>
```

**响应**:
```json
{
  "status": "confirmed",
  "bot_token": "token",
  "ilink_bot_id": "bot-id",
  "baseurl": "https://...",
  "ilink_user_id": "user-id"
}
```

**状态值**:
- `wait` - 等待扫码
- `scaned` - 已扫码，等待确认
- `confirmed` - 已确认
- `expired` - 二维码过期

### getupdates

**请求**:
```json
POST /ilink/bot/getupdates
{
  "get_updates_buf": "sync-cursor"
}
```

**响应**:
```json
{
  "ret": 0,
  "msgs": [...],
  "get_updates_buf": "new-cursor",
  "longpolling_timeout_ms": 35000
}
```

### sendmessage

**请求**:
```json
POST /ilink/bot/sendmessage
{
  "msg": {
    "from_user_id": "",
    "to_user_id": "user-id",
    "client_id": "client-id",
    "message_type": 2,
    "message_state": 2,
    "item_list": [
      {
        "type": 1,
        "text_item": { "text": "Hello" }
      }
    ],
    "context_token": "context-token"
  }
}
```

---

## ✅ 验证清单

使用前检查：

- [ ] Node.js 已安装 (>= 16.0.0)
- [ ] AI CLI 已安装（claude/gemini/qwen等）
- [ ] 可以访问 `https://ilinkai.weixin.qq.com`
- [ ] 微信账号可以正常使用

---

## 🎉 完成

现在您的 Stigmergy 项目已经可以：

1. ✅ 独立运行，无需 OpenClaw
2. ✅ 个人微信扫码登录
3. ✅ 接收和发送消息
4. ✅ 集成所有 AI CLI
5. ✅ 自动保存登录凭证

用户发送微信消息 → iLink API → Stigmergy → AI CLI → 返回响应到微信

---

**项目**: Stigmergy
**版本**: 1.0.0
**日期**: 2026-03-23
**作者**: Stigmergy Team
