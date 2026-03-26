# iLink Bot API 研究分析报告

> **研究日期**: 2026-03-24
> **研究目的**: 诊断 iLink Bot 登录问题
> **研究方法**: 直接 API 端点测试

---

## 📊 执行摘要

通过对 iLink Bot API 的全面测试，发现了登录失败的根本原因：**我们使用了错误的 API 端点**。

### 关键发现

✅ **API 本身工作正常** - 所有端点都返回有效响应
❌ **QR code 用途错误** - `get_bot_qrcode` 返回的是添加 Lite App 机器人的二维码，而非认证登录二维码
⚠️ **需要找到正确的认证流程** - 当前实现的登录流程与 API 实际用途不匹配

---

## 🔬 测试结果详情

### 1. QR Code 生成端点

**端点**: `GET /ilink/bot/get_bot_qrcode?bot_type={n}`

#### bot_type 参数测试

| bot_type | 状态 | 响应 |
|----------|------|------|
| 1 | ❌ | `{"err_msg": "invalid bot_type", "ret": 2}` |
| 2 | ❌ | `{"err_msg": "invalid bot_type", "ret": 2}` |
| **3** | ✅ | 返回 QR code |
| 4 | ❌ | `{"err_msg": "invalid bot_type", "ret": 2}` |
| 5 | ❌ | `{"err_msg": "invalid bot_type", "ret": 2}` |

**结论**: `bot_type=3` 是唯一有效值

#### QR Code 内容分析

```json
{
  "qrcode": "07809a2071841638d2c18a54de75e3a9",
  "qrcode_img_content": "https://liteapp.weixin.qq.com/q/7GiQu1?qrcode=07809a2071841638d2c18a54de75e3a9&bot_type=3",
  "ret": 0
}
```

**🚨 关键发现**: QR code URL 指向 `liteapp.weixin.qq.com`，这是**微信小程序/轻应用的机器人添加流程**，而非 iLink Bot 认证登录流程！

### 2. 状态查询端点

**端点**: `GET /ilink/bot/get_qrcode_status?qrcode={qrcode}`

**测试响应**:
```json
{
  "ret": 0,
  "status": "expired"
}
```

**分析**:
- 端点工作正常
- 返回 "expired" 是因为测试用的 qrcode 无效
- 这个端点设计用于监控 Lite App 机器人添加状态，而非登录认证状态

### 3. 配置和更新端点

**端点**:
- `POST /ilink/bot/getconfig`
- `POST /ilink/bot/getupdates`

**测试响应**:
```json
{
  "errcode": -14,
  "errmsg": "session timeout"
}
```

**分析**:
- 这些端点需要已建立的会话
- 证明存在 session-based 认证机制
- 但我们不知道如何建立初始 session

### 4. 其他端点测试

测试的文档端点全部返回 404:
- `/` - 404
- `/docs` - 404
- `/api` - 404
- `/v1` - 404
- `/ilink` - 404
- `/ilink/bot` - 404
- `/health` - 404
- `/ping` - 404

**结论**: 没有公开的 API 文档端点

---

## 🎯 问题诊断

### 症状回顾

用户报告的问题:
1. 微信扫一扫扫描 QR code
2. 提示添加了 "clawbot"
3. 打开对话框，发送指令无响应
4. 脚本中状态永远停留在 "wait"

### 根本原因

**我们误解了 API 的用途**:

| 当前理解 | 实际情况 |
|----------|----------|
| `get_bot_qrcode` 用于获取登录认证二维码 | `get_bot_qrcode` 用于获取添加 Lite App 机器人的二维码 |
| 扫码后应该触发登录确认流程 | 扫码后触发的是"添加机器人"流程 |
| 状态应该从 wait → scaned → confirmed | 状态跟踪的是机器人添加状态，不是登录状态 |
| 登录成功后获得 bot_token | 添加机器人后可能只是订阅关系，无认证 token |

### 为什么会出现 "clawbot"

QR code URL `https://liteapp.weixin.qq.com/q/7GiQu1?qrcode=...` 指向的是微信轻应用机器人添加流程：

1. 用户扫描 QR code
2. 微信识别为 Lite App 机器人添加
3. 显示机器人名称（如 "clawbot"）
4. 用户确认添加机器人
5. 但这不是认证流程，只是添加了机器人到联系人

---

## 🔧 可能的解决方案

### 方案 1: 寻找正确的认证端点

**假设**: iLink Bot 可能使用不同的认证流程

**需要研究**:
1. 是否有专门的认证端点（如 `/auth`, `/login`, `/token`）
2. 是否支持 OAuth 流程
3. 是否需要先注册应用获得 app_id/app_secret
4. 是否需要企业认证或特殊权限

**研究方向**:
- 搜索 "iLink Bot API authentication"
- 查找腾讯官方文档
- 检查是否有开发者控制台

### 方案 2: 使用 Bot Token 直接认证

**假设**: 如果已有 bot_token，可能可以直接使用

**需要**:
- 获取有效 bot_token 的方法
- 可能需要在腾讯开发者平台注册
- 可能需要企业认证

### 方案 3: 使用不同的 Bot 类型

**假设**: bot_type=3 可能不是用于我们的场景

**需要测试**:
- 是否有未文档化的 bot_type
- 是否需要特殊参数或权限
- 是否需要申请特定的 bot 类型

### 方案 4: 使用 Webhook 模式

**假设**: iLink Bot 可能主要设计为 Webhook 接收模式，而非主动轮询

**需要研究**:
- 如何设置 Webhook URL
- Webhook 认证机制
- 消息格式和签名验证

---

## 📝 下一步行动

### 立即行动

1. **搜索官方文档**
   - 腾讯 iLink Bot 官方文档
   - 微信开放平台相关文档
   - 企业微信机器人文档

2. **测试可能的认证端点**
   ```javascript
   // 可能的端点
   /ilink/auth/login
   /ilink/auth/token
   /ilink/bot/auth
   /ilink/oauth/authorize
   ```

3. **检查请求头要求**
   - 是否需要特定的 User-Agent
   - 是否需要 Referer
   - 是否需要特定的认证头

### 短期研究

1. **分析其他成功案例**
   - GitHub 上是否有 iLink Bot 集成示例
   - 是否有开源实现
   - 社区讨论和经验分享

2. **联系官方支持**
   - 腾讯开发者社区
   - iLink Bot 官方论坛
   - 技术支持渠道

### 中期策略

如果无法找到官方认证流程，考虑：

1. **替代方案**
   - 使用其他微信 Bot API（如 itchat）
   - 使用企业微信 API
   - 使用第三方微信 Bot 服务

2. **反向工程**
   - 分析官方客户端行为
   - 抓包分析认证流程
   - 研究加密和签名机制

---

## 📊 API 端点总结

### 已确认工作的端点

| 端点 | 方法 | 用途 | 认证要求 |
|------|------|------|----------|
| `/ilink/bot/get_bot_qrcode` | GET | 获取添加机器人二维码 | 无 |
| `/ilink/bot/get_qrcode_status` | GET | 查询机器人添加状态 | 无 |
| `/ilink/bot/getconfig` | POST | 获取机器人配置 | 需要 session |
| `/ilink/bot/getupdates` | POST | 获取消息更新 | 需要 session |

### 需要发现的端点

| 功能 | 端点（猜测） | 优先级 |
|------|--------------|--------|
| 用户登录认证 | `/ilink/auth/login` | 🔴 高 |
| 获取访问令牌 | `/ilink/auth/token` | 🔴 高 |
| OAuth 授权 | `/ilink/oauth/authorize` | 🟡 中 |
| Bot 注册 | `/ilink/bot/register` | 🟡 中 |
| Webhook 设置 | `/ilink/bot/webhook` | 🟢 低 |

---

## 💡 技术洞察

### API 设计分析

从测试结果可以看出：

1. **Response 格式**: 使用 `application/octet-stream` 而非 `application/json`
   - 可能是为了避免某些中间层解析
   - 或是历史遗留设计

2. **错误处理**: 使用 `ret` 和 `errcode` 双重错误码
   - `ret`: 顶层返回码（0=成功）
   - `errcode`: 详细错误码（-14=session timeout）

3. **Session 管理**: 存在 session 概念但建立方式未知
   - getconfig 和 getupdates 都需要有效 session
   - 推测需要通过某个认证流程获取 session

### 架构推断

```
┌─────────────────────────────────────────┐
│  iLink Bot 系统架构（推测）              │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  认证层 (未知)   │  ← 我们缺少这一层！
│  - 用户登录      │
│  - 获取 token    │
│  - 建立 session  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Bot 管理层      │
│  - get_bot_qrcode │
│  - get_qrcode_status│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  消息层          │
│  - getconfig     │
│  - getupdates    │
└─────────────────┘
```

---

## ✅ 结论

### 核心问题

我们尝试使用 **机器人添加 API** 作为 **用户认证 API**，这就是为什么登录流程无法工作的根本原因。

### 研究价值

虽然当前方法不可行，但这次研究：
1. ✅ 确认了 API 可访问且工作正常
2. ✅ 理解了 bot_type 参数（只有 3 有效）
3. ✅ 发现了 session 机制的存在
4. ✅ 排除了了当前实现路径

### 下一步

需要找到**真正的 iLink Bot 认证流程**，这可能需要：
- 官方文档
- 开发者注册
- 企业认证
- 或使用替代方案

---

**报告生成时间**: 2026-03-24 14:00
**研究工具**: `scripts/research-ilink-endpoints.js`
**数据来源**: 直接 API 测试
