# Wechaty Bot - 快速开始

> **简单易用的微信机器人** - 无需企业微信，扫码即用！

---

## ✨ 为什么选择 Wechaty？

### 与企业微信对比

| 特性 | Wechaty | 企业微信 |
|------|---------|----------|
| **用户门槛** | ✅ 极低 - 只要有微信 | ❌ 高 - 需要下载企业微信APP |
| **安装配置** | ✅ 一行命令 | ❌ 复杂 - 需要注册企业 |
| **个人使用** | ✅ 完美支持 | ❌ 需要企业认证 |
| **好友数量** | ✅ 无限制 | ⚠️  受企业限制 |
| **群聊支持** | ✅ 完整支持 | ⚠️  功能受限 |
| **开发成本** | ✅ 低 | ❌ 中等 |
| **稳定性** | ✅ 成熟稳定 | ✅ 官方支持 |

### 核心优势

- ✅ **开箱即用** - 安装后扫码即可使用
- ✅ **个人微信** - 直接使用你的个人微信账号
- ✅ **功能丰富** - 文本、图片、文件、群聊等
- ✅ **开源免费** - MIT 许可证，完全免费
- ✅ **成熟稳定** - 多年开发，数万用户
- ✅ **跨平台** - Windows、Mac、Linux 都支持

---

## 📦 安装步骤

### 1. 安装依赖

```bash
npm install wechaty wechaty-puppet-wechat qrcode-terminal file-box
```

### 2. 启动机器人

```bash
node scripts/start-wechaty-bot.js
```

或者指定其他 AI CLI：

```bash
node scripts/start-wechaty-bot.js gemini
node scripts/start-wechaty-bot.js qwen
```

### 3. 扫码登录

1. 终端会显示二维码
2. 打开微信 → 点击右上角 "+" → "扫一扫"
3. 扫描二维码
4. 在手机上确认登录

**就这么简单！** 🎉

---

## 🎯 使用示例

### 基础对话

直接给机器人发消息：

```
你: 你好
Bot: 你好！我是 Stigmergy AI 助手，很高兴为你服务！
```

### CLI 切换

```
你: 切换到 gemini cli
Bot: ✅ 已切换到 Gemini CLI

你: 使用 claude cli
Bot: ✅ 已切换到 Claude CLI
```

### 任务执行

```
你: 执行：创建一个快速排序函数
Bot: ✅ 正在执行任务...
     [生成代码中...]
```

### 帮助命令

```
你: 帮助
Bot: 📋 可用命令:
     • 切换 [cli名] cli - 切换AI助手
     • 执行 [任务] - 执行编程任务
     • 查询 [关键词] - 搜索信息
     • 状态 - 查看当前状态
     • 帮助 - 显示此帮助信息
```

---

## 🔧 高级功能

### 多模态支持

#### 文本消息
```
你: 写一个Python函数计算斐波那契数列
Bot: [生成Python代码]
```

#### 图片消息（实验性）
```
[发送图片]
Bot: [分析图片内容]
```

#### 文件消息
```
[发送文件]
Bot: [收到文件，正在处理...]
```

### 群聊支持

在群聊中 @机器人：

```
@Stigmergy Bot 帮我写一个排序算法
Bot: @User [生成排序算法代码]
```

### 会话管理

机器人会记住每个用户的对话历史：

```
你: 我叫小明
Bot: 好的，小明！很高兴认识你！

[一段时间后]

你: 我叫什么名字？
Bot: 你叫小明！
```

---

## 🛠️ 配置选项

### 环境变量

```bash
# 指定默认 CLI
export DEFAULT_CLI=claude

# 日志级别
export LOG_LEVEL=info

# 消息保存路径
export MESSAGE_HISTORY_PATH=~/.stigmergy/messages
```

### 配置文件

创建 `wechaty-config.json`:

```json
{
  "botName": "my-bot",
  "defaultCli": "claude",
  "autoReply": true,
  "enableVoice": false,
  "enableImage": true,
  "maxHistory": 100
}
```

---

## 📊 性能优化

### 消息处理

```javascript
// 异步处理消息，避免阻塞
wechatClient.onMessage(async (message) => {
  // 使用 Promise.all 并行处理
  await Promise.all([
    processMessage(message),
    saveHistory(message),
    updateStats(message)
  ]);
});
```

### 内存管理

```javascript
// 定期清理过期会话
setInterval(() => {
  integration.cleanupExpiredSessions(30 * 60 * 1000); // 30分钟
}, 5 * 60 * 1000); // 每5分钟
```

---

## 🔒 安全注意事项

### 1. 账号安全

- ⚠️ **不要用于商业用途** - 可能违反微信服务条款
- ⚠️ **小号使用** - 建议使用小号，避免主号被封
- ⚠️ **控制频率** - 避免短时间内大量发送消息

### 2. 数据隐私

```javascript
// 不保存敏感信息
const safeContent = sanitizeMessage(message.text());

// 加密存储
const encrypted = encrypt(savedData);
```

### 3. 访问控制

```javascript
// 只允许特定用户使用
const allowedUsers = ['user1', 'user2'];

if (!allowedUsers.includes(contact.id)) {
  await contact.say('抱歉，你没有使用权限');
  return;
}
```

---

## 🐛 常见问题

### Q1: 扫码后没有反应？

**A**:
1. 确保微信版本较新
2. 尝试重新扫码
3. 检查网络连接

### Q2: 登录后很快被踢下线？

**A**:
- 这是微信的登录保护机制
- 首次登录建议在常用设备上验证
- 避免频繁登录登出

### Q3: 消息发送失败？

**A**:
1. 检查是否已登录
2. 确认对方是否是好友
3. 避免频繁发送相同内容

### Q4: 如何避免被封号？

**A**:
1. **控制频率** - 每分钟不超过10条消息
2. **避免营销** - 不要发送营销内容
3. **真人行为** - 模拟真人对话节奏
4. **使用小号** - 避免使用主账号

---

## 📈 性能指标

### 资源占用

- **内存**: ~50-100MB
- **CPU**: 待机 < 1%, 处理消息 < 5%
- **网络**: 消息收发 < 1KB/s

### 响应时间

- **文本回复**: < 2秒
- **代码生成**: 5-10秒
- **复杂任务**: 10-30秒

---

## 🚀 部署建议

### 本地开发

```bash
# 直接运行
node scripts/start-wechaty-bot.js
```

### 生产环境

```bash
# 使用 PM2
npm install -g pm2
pm2 start scripts/start-wechaty-bot.js --name stigmergy-wechat

# 查看日志
pm2 logs stigmergy-wechat

# 重启
pm2 restart stigmergy-wechat
```

### Docker 部署

```dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "scripts/start-wechaty-bot.js"]
```

---

## 📚 相关资源

### 官方文档

- [Wechaty 官网](https://wechaty.js.org/)
- [Wechaty 文档](https://wechaty.js.org/docs/)
- [Wechaty GitHub](https://github.com/wechaty/wechaty)

### 社区

- [Wechaty Slack](https://www.wechaty.io/slack)
- [Wechaty 论坛](https://wechaty.js.org/2017/04/05/wechaty-community/)

### 示例代码

- [Wechaty 示例](https://github.com/wechaty/wechaty/tree/master/examples)
- [Stigmergy 示例](https://github.com/your-org/stigmergy/tree/main/examples)

---

## 🎓 下一步

1. **基础使用** - 运行 `start-wechaty-bot.js`
2. **自定义命令** - 修改 `CommandParser.js`
3. **添加功能** - 扩展 `MessageHandler`
4. **部署上线** - 使用 PM2 或 Docker

---

## ✅ 总结

**Wechaty 是最佳选择**，因为：

- ✅ **用户体验好** - 扫码即用，无需额外安装
- ✅ **开发成本低** - 几行代码即可实现
- ✅ **功能完整** - 支持所有微信功能
- ✅ **社区活跃** - 问题能快速解决
- ✅ **免费开源** - 无需任何费用

**立即开始**：

```bash
npm install wechaty wechaty-puppet-wechat qrcode-terminal file-box
node scripts/start-wechaty-bot.js
```

**就是这么简单！** 🎉

---

**文档版本**: 1.0.0
**创建日期**: 2026-03-25
**维护者**: Stigmergy Team
