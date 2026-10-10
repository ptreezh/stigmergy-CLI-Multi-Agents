# WeChat 集成迁移方案

> **创建日期**: 2026-03-24
> **目的**: 从 iLink Bot 迁移到可行的替代方案
> **状态**: 📋 待执行

---

## 🎯 迁移目标

将已完成的多模态 WeChat 集成系统从 iLink Bot 迁移到可用的替代方案，保持核心功能不变。

### 核心功能保持

- ✅ 文本消息处理和路由
- ✅ 语音消息处理（框架）
- ✅ 图片消息处理（框架）
- ✅ 任务执行和 CLI 协调
- ✅ 智能命令识别
- ✅ 会话管理

---

## 📊 方案对比

### 方案 A: 企业微信机器人 API ⭐️⭐️⭐️⭐️⭐️

#### 优点
- ✅ 官方支持，文档完善
- ✅ 稳定可靠，适合生产
- ✅ 无需复杂审核
- ✅ Webhook 和轮询双模式
- ✅ 丰富的消息类型支持
- ✅ 完善的多媒体支持

#### 缺点
- ❌ 仅限企业微信环境
- ❌ 需要企业注册
- ❌ 不能添加个人微信好友

#### 技术规格
```javascript
// Webhook URL
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

// API 端点
POST /cgi-bin/webhook/send?key={key}

// 消息格式
{
  "msgtype": "text",
  "text": {
    "content": "消息内容"
  }
}
```

#### 实施难度
- **时间**: 1-2 天
- **复杂度**: 低
- **风险**: 极低

---

### 方案 B: 微信公众号/小程序 ⭐️⭐️⭐️⭐️

#### 优点
- ✅ 官方支持，生态成熟
- ✅ 丰富的 API 和 SDK
- ✅ 大量社区资源
- ✅ 支持个人用户

#### 缺点
- ❌ 需要注册认证（个人或企业）
- ❌ 审核周期较长
- ❌ 消息推送有限制
- ❌ 不能主动添加好友

#### 技术规格
```javascript
// 消息接口
POST /cgi-bin/message/custom/send

// 认证方式
access_token（2小时有效期）

// 消息格式
{
  "touser": "OPENID",
  "msgtype": "text",
  "text": {
    "content": "Hello World"
  }
}
```

#### 实施难度
- **时间**: 3-5 天
- **复杂度**: 中
- **风险**: 低

---

### 方案 C: Wechaty（开源库）⭐️⭐️⭐️

#### 优点
- ✅ 开源免费
- ✅ 无需注册审核
- ✅ 支持微信个人号
- ✅ 可添加好友
- ✅ TypeScript/JavaScript

#### 缺点
- ❌ 非官方，可能被封
- ❌ 稳定性无保证
- ❌ 违反微信服务条款
- ❌ 仅适合学习研究

#### 技术规格
```javascript
const { Wechaty } = require('wechaty')

const bot = new Wechaty()

bot.on('message', async message => {
  const contact = message.talker()
  const text = message.text()

  if (text === 'ping') {
    await contact.say('pong')
  }
})

await bot.start()
```

#### 实施难度
- **时间**: 2-3 天
- **复杂度**: 中
- **风险**: 高（仅供学习）

---

## 🚀 推荐方案：企业微信机器人 API

基于稳定性、可靠性和实施难度，**强烈推荐使用企业微信机器人 API**。

### 实施步骤

#### 第1步：注册企业微信（30分钟）

1. 访问 https://work.weixin.qq.com/
2. 点击"企业注册"
3. 填写企业信息（可以是个体户或小团队）
4. 完成邮箱验证
5. 登录企业管理后台

#### 第2步：创建机器人应用（15分钟）

1. 进入"应用管理"
2. 点击"创建应用"
3. 填写应用信息：
   - 应用名称：Stigmergy Bot
   - 应用介绍：多AI CLI工具协调机器人
   - 应用logo：上传图标
4. 创建成功后记录：
   - AgentId
   - Secret

#### 第3步：配置机器人（30分钟）

1. 在应用设置中：
   - 启用"接收消息"
   - 设置回调 URL（需要公网域名）
   - 配置 Token 和 EncodingAESKey

2. 配置可见范围：
   - 添加测试用户
   - 或添加到整个部门

#### 第4步：获取 access_token（5分钟）

```javascript
async function getAccessToken(corpid, corpsecret) {
  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode === 0) {
    return data.access_token;
  } else {
    throw new Error(`获取 access_token 失败: ${data.errmsg}`);
  }
}
```

#### 第5步：适配 WeChat Client 接口（2-3小时）

创建新的 `WeChatWorkClient.js`:

```javascript
const https = require('https');

class WeChatWorkClient {
  constructor(config) {
    this.corpid = config.corpid;
    this.corpsecret = config.corpsecret;
    this.agentid = config.agentid;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  async ensureAccessToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      this.accessToken = await this.getAccessToken();
      this.tokenExpireTime = Date.now() + 7000 * 1000; // 2小时 - 缓冲
    }
    return this.accessToken;
  }

  async getAccessToken() {
    return new Promise((resolve, reject) => {
      const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.corpid}&corpsecret=${this.corpsecret}`;

      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.errcode === 0) {
            resolve(result.access_token);
          } else {
            reject(new Error(`获取 token 失败: ${result.errmsg}`));
          }
        });
      }).on('error', reject);
    });
  }

  async sendText(userid, text) {
    const token = await this.ensureAccessToken();

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        touser: userid,
        msgtype: 'text',
        agentid: this.agentid,
        text: {
          content: text
        }
      });

      const options = {
        hostname: 'qyapi.weixin.qq.com',
        path: `/cgi-bin/message/send?access_token=${token}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.errcode === 0) {
            resolve(true);
          } else {
            reject(new Error(`发送消息失败: ${result.errmsg}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async sendImage(userid, mediaId) {
    const token = await this.ensureAccessToken();

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        touser: userid,
        msgtype: 'image',
        agentid: this.agentid,
        image: {
          media_id: mediaId
        }
      });

      const options = {
        hostname: 'qyapi.weixin.qq.com',
        path: `/cgi-bin/message/send?access_token=${token}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.errcode === 0) {
            resolve(true);
          } else {
            reject(new Error(`发送图片失败: ${result.errmsg}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async uploadMedia(filePath, type = 'image') {
    const token = await this.ensureAccessToken();
    const fs = require('fs');
    const FormData = require('form-data');

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('media', fs.createReadStream(filePath));

      const options = {
        hostname: 'qyapi.weixin.qq.com',
        path: `/cgi-bin/media/upload?access_token=${token}&type=${type}`,
        method: 'POST',
        headers: form.getHeaders()
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.errcode === 0) {
            resolve(result.media_id);
          } else {
            reject(new Error(`上传媒体失败: ${result.errmsg}`));
          }
        });
      });

      req.on('error', reject);
      form.pipe(req);
    });
  }
}

module.exports = WeChatWorkClient;
```

#### 第6步：更新 Hub 配置（30分钟）

修改 `scripts/start-wechat-hub.js`:

```javascript
const WeChatWorkClient = require('../src/orchestration/wechat/WeChatWorkClient');

async function startWeChatHub(mode) {
  const config = {
    corpid: process.env.WECHAT_WORK_CORPID,
    corpsecret: process.env.WECHAT_WORK_CORPSECRET,
    agentid: process.env.WECHAT_WORK_AGENTID
  };

  const wechatClient = new WeChatWorkClient(config);

  // 其余代码保持不变
  // ...
}
```

#### 第7步：测试核心功能（1小时）

1. **测试文本消息**
```bash
node scripts/test-wechat-work.js --type=text
```

2. **测试任务执行**
```bash
node scripts/test-wechat-work.js --type=task
```

3. **测试 CLI 协调**
```bash
node scripts/test-wechat-work.js --type=cli
```

#### 第8步：部署和监控（30分钟）

1. 设置环境变量
```bash
export WECHAT_WORK_CORPID=xxx
export WECHAT_WORK_CORPSECRET=xxx
export WECHAT_WORK_AGENTID=xxx
```

2. 启动 Hub
```bash
node scripts/start-wechat-hub.js shared
```

3. 监控运行状态
- 检查日志
- 验证消息收发
- 确认任务执行

---

## 📋 实施时间表

### Day 1: 准备和配置
- [ ] 注册企业微信（30分钟）
- [ ] 创建机器人应用（15分钟）
- [ ] 配置 Webhook 和权限（30分钟）
- [ ] 获取凭证（5分钟）
- [ ] 安装依赖（30分钟）
  - form-data
  - axios（可选）

### Day 2: 实施和测试
- [ ] 实现 WeChatWorkClient（2小时）
- [ ] 适配 Hub 接口（1小时）
- [ ] 单元测试（1小时）
- [ ] 集成测试（1小时）
- [ ] 文档更新（1小时）

### Day 3: 部署和验证
- [ ] 生产环境配置（1小时）
- [ ] 完整功能测试（2小时）
- [ ] 性能测试（1小时）
- [ ] 用户验收测试（2小时）
- [ ] 上线发布（1小时）

**总计**: 约 2-3 天

---

## 🧪 测试计划

### 单元测试

```javascript
// tests/unit/wechat-work-client.test.js
describe('WeChatWorkClient', () => {
  test('should get access token', async () => {
    const client = new WeChatWorkClient({
      corpid: 'test',
      corpsecret: 'test'
    });

    const token = await client.getAccessToken();
    expect(token).toBeDefined();
  });

  test('should send text message', async () => {
    const client = new WeChatWorkClient(config);
    const result = await client.sendText('test', 'Hello');
    expect(result).toBe(true);
  });
});
```

### 集成测试

```javascript
// tests/integration/wechat-hub.test.js
describe('WeChat Hub Integration', () => {
  test('should handle text message', async () => {
    const hub = new WeChatHub();
    await hub.start();

    // 模拟接收消息
    await hub.handleMessage({
      from: 'test-user',
      type: 'text',
      content: 'ping'
    });

    // 验证响应
    expect(hub.lastResponse).toBe('pong');
  });
});
```

### 功能测试清单

- [ ] 文本消息收发
- [ ] 命令识别和解析
- [ ] 任务执行
- [ ] CLI 选择和协调
- [ ] 会话管理
- [ ] 错误处理
- [ ] 并发消息处理
- [ ] 长时间运行稳定性

---

## 📊 兼容性保证

### 接口兼容

所有现有的多模态系统组件**无需修改**：

- ✅ MessageRouter.js
- ✅ TextMessageHandler.js
- ✅ VoiceMessageHandler.js（框架）
- ✅ ImageMessageHandler.js（框架）
- ✅ ConversationHandler.js
- ✅ CommandParser.js
- ✅ TaskScheduler.js
- ✅ TaskExecutor.js
- ✅ CLICoordinator.js
- ✅ MultimodalWeChatIntegration.js

### 唯一修改

只需替换 `WeChatClient` 实现：

```javascript
// 旧实现（不可用）
// const WeChatClient = require('./ilink/WeChatClient');

// 新实现（企业微信）
const WeChatClient = require('./WeChatWorkClient');
```

---

## 💰 成本估算

### 开发成本
- 开发时间：2-3 天
- 测试时间：1 天
- 文档时间：0.5 天
- **总计**：3.5-4.5 天

### 运营成本
- 企业微信：**免费**（小团队）
- 服务器：现有资源
- API 调用：**免费**（企业微信无调用限制）

### 维护成本
- Bug 修复：低
- 功能更新：低
- 监控运维：低

---

## ⚠️ 风险和缓解

### 风险 1: API 限制
**风险**: 企业微信可能有消息频率限制
**缓解**:
- 实现消息队列
- 添加速率限制
- 批量发送优化

### 风险 2: Webhook 稳定性
**风险**: Webhook 可能丢失或延迟
**缓解**:
- 实现重试机制
- 添加消息确认
- 备用轮询模式

### 风险 3: 用户接受度
**风险**: 用户需要安装企业微信
**缓解**:
- 提供详细安装指南
- 提供测试环境
- 逐步迁移

---

## 📈 后续优化

### 短期（1周内）
1. 完成基础迁移
2. 核心功能测试
3. 文档完善

### 中期（1个月内）
1. 添加更多消息类型支持
2. 优化性能和稳定性
3. 增强错误处理

### 长期（3个月内）
1. 实现语音消息完整处理
2. 实现图片识别和 OCR
3. 添加更多 AI CLI 工具支持

---

## ✅ 验收标准

### 功能验收
- [ ] 文本消息正常收发
- [ ] 命令识别准确率 > 95%
- [ ] 任务执行成功率 > 98%
- [ ] CLI 选择合理
- [ ] 会话管理正常

### 性能验收
- [ ] 消息响应时间 < 3 秒
- [ ] 并发处理能力 > 10 消息/秒
- [ ] 系统稳定运行 > 24 小时

### 质量验收
- [ ] 代码测试覆盖率 > 80%
- [ ] 文档完整
- [ ] 错误处理完善
- [ ] 日志清晰

---

## 🎯 总结

### 核心优势
1. ✅ 官方支持，稳定可靠
2. ✅ 实施简单，2-3 天完成
3. ✅ 零成本运营
4. ✅ 代码复用率高
5. ✅ 维护成本低

### 推荐行动
**立即开始迁移到企业微信机器人 API**

这是最快速、最可靠的方案，可以让已完成的多模态系统尽快投入使用。

---

**文档版本**: 1.0.0
**创建日期**: 2026-03-24
**预计完成**: 2026-03-27
**负责人**: Claude Code
