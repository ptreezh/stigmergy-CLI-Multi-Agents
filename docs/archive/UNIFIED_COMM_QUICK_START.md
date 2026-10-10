# 统一通信平台适配器 - 快速开始指南

**版本**: 1.0.0
**更新日期**: 2026-03-22
**状态**: Level 1 框架完成

---

## 🎯 这是什么？

UnifiedCommAdapter 是一个统一的通信平台适配器，让你能够轻松地将 Stigmergy 推荐系统集成到：
- 📱 **微信**（公众号/小程序/企业微信）
- 🎯 **飞书**（Lark）
- 💼 **钉钉**

**核心价值**：降低配置门槛，一个接口支持三个平台！

---

## ⚡ 5分钟快速开始

### 步骤 1: 获取平台凭证

#### 微信
1. 访问 [微信公众平台](https://open.weixin.qq.com/)
2. 创建公众号/小程序
3. 获取 `AppID` 和 `AppSecret`

#### 飞书
1. 访问 [飞书开放平台](https://open.feishu.cn/document)
2. 创建自建应用
3. 获取 `App ID` 和 `App Secret`
4. 配置 `Encrypt Key` 和 `Verification Token`

#### 钉钉
1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用
3. 获取 `AppKey` 和 `AppSecret`

---

### 步骤 2: 配置环境变量

创建 `.env` 文件：

```bash
# 微信配置
WECHAT_APP_ID=wxXXXXXXXXXXXXXXXX
WECHAT_APP_SECRET=XXXXXXXXXXXXXXXX

# 飞书配置
FEISHU_APP_ID=cli_xxxxxxxxxxxxx
FEISHU_APP_SECRET=XXXXXXXXXXXXXXXX
FEISHU_ENCRYPT_KEY=XXXXXXXXXXXXXXXX
FEISHU_VERIFY_TOKEN=XXXXXXXXXXXXXXXX

# 钉钉配置
DINGTALK_APP_KEY=dingXXXXXXXXXXXXXXXX
DINGTALK_APP_SECRET=XXXXXXXXXXXXXXXX
```

---

### 步骤 3: 使用适配器

```javascript
const UnifiedCommAdapter = require('./skills/unified-comm-adapter');

// 初始化
const adapter = new UnifiedCommAdapter({
  wechat: {
    enabled: true,
    appId: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET
  },
  feishu: {
    enabled: true,
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET
  },
  dingtalk: {
    enabled: true,
    appKey: process.env.DINGTALK_APP_KEY,
    appSecret: process.env.DINGTALK_APP_SECRET
  }
});

// 发送推荐
const recommendations = [
  {
    skillName: 'dev-browser',
    score: 4.5,
    reasoning: '基于您的浏览器自动化任务'
  }
];

await adapter.sendRecommendation('wechat', 'user-openid', recommendations);
```

---

### 步骤 4: 启动Webhook服务器

```bash
# 使用示例代码启动服务器
node examples/unified-comm-adapter-usage.js start-server
```

服务器将监听：
- `http://localhost:3000/webhook/wechat` - 微信回调
- `http://localhost:3000/webhook/feishu` - 飞书回调
- `http://localhost:3000/webhook/dingtalk` - 钉钉回调
- `http://localhost:3000/config` - 配置页面

---

## 📚 API 文档

### UnifiedCommAdapter

#### 构造函数
```javascript
new UnifiedCommAdapter(config)
```

**参数**:
- `config.wechat` - 微信配置
  - `enabled` (boolean) - 是否启用
  - `appId` (string) - 微信AppID
  - `appSecret` (string) - 微信AppSecret
- `config.feishu` - 飞书配置
  - `enabled` (boolean) - 是否启用
  - `appId` (string) - 飞书App ID
  - `appSecret` (string) - 飞书App Secret
  - `encryptKey` (string) - 加密Key
  - `verifyToken` (string) - 验证Token
- `config.dingtalk` - 钉钉配置
  - `enabled` (boolean) - 是否启用
  - `appKey` (string) - 钉钉AppKey
  - `appSecret` (string) - 钉钉AppSecret

#### 方法

##### sendRecommendation()
发送推荐结果到指定平台

```javascript
await adapter.sendRecommendation(platform, userId, recommendations)
```

**参数**:
- `platform` (string) - 平台名称: `'wechat'` | `'feishu'` | `'dingtalk'`
- `userId` (string) - 用户在平台的ID
- `recommendations` (Array) - 推荐列表
  - `skillName` (string) - 技能名称
  - `score` (number) - 评分 (0-5)
  - `reasoning` (string) - 推荐理由

**返回**: Promise<{ success: boolean, platform: string }>

---

##### collectFeedback()
收集用户反馈

```javascript
await adapter.collectFeedback(platform, userId, skillName, feedback)
```

**参数**:
- `platform` (string) - 平台名称
- `userId` (string) - 用户ID
- `skillName` (string) - 技能名称
- `feedback` (Object) - 反馈内容
  - `rating` (number) - 评分 (1-5)
  - `effectiveness` (string) - 有效性: `'LOW'` | `'MEDIUM'` | `'HIGH'`
  - `comments` (string) - 评论

**返回**: Promise<{ success: boolean }>

---

##### handleWebhook()
处理Webhook回调

```javascript
await adapter.handleWebhook(platform, req, res)
```

**参数**:
- `platform` (string) - 平台名称
- `req` (http.IncomingMessage) - HTTP请求对象
- `res` (http.ServerResponse) - HTTP响应对象

**返回**: Promise<void>

---

##### generateConfigPage()
生成HTML配置页面

```javascript
const html = adapter.generateConfigPage()
```

**返回**: string - HTML内容

---

## 🔗 集成到协同过滤引擎

```javascript
const CollaborativeFilteringEngine = require('./skills/skill-collaborative-filtering');
const UnifiedCommAdapter = require('./skills/unified-comm-adapter');

class EnhancedCFEngine extends CollaborativeFilteringEngine {
  constructor(config) {
    super(config);

    // 添加通信适配器
    this.commAdapter = new UnifiedCommAdapter(config.communication);
  }

  async recommendSkills(agentId, context) {
    // 获取推荐
    const recommendations = await super.recommendSkills(agentId, context);

    // 获取Agent的通信配置
    const agentConfig = this.getAgentCommConfig(agentId);

    // 发送通知
    if (agentConfig) {
      await this.commAdapter.sendRecommendation(
        agentConfig.platform,
        agentConfig.userId,
        recommendations
      );
    }

    return recommendations;
  }

  getAgentCommConfig(agentId) {
    // 从数据库获取Agent的通信配置
    // 返回格式: { platform: 'wechat', userId: 'xxx' }
  }
}
```

---

## 📋 配置清单

### 微信

**必需**:
- [ ] AppID
- [ ] AppSecret
- [ ] 服务器地址（URL）
- [ ] Token（可选，用于验证）

**步骤**:
1. 登录微信公众平台
2. 开发 → 基本配置
3. 修改服务器配置
4. 填写URL: `https://your-domain.com/webhook/wechat`
5. 启用消息接收功能

---

### 飞书

**必需**:
- [ ] App ID
- [ ] App Secret
- [ ] Encrypt Key
- [ ] Verification Token
- [ ] 订阅事件

**步骤**:
1. 登录飞书开放平台
2. 创建应用 → 事件订阅
3. 配置请求URL: `https://your-domain.com/webhook/feishu`
4. 订阅消息接收事件
5. 开启机器人能力

---

### 钉钉

**必需**:
- [ ] AppKey
- [ ] AppSecret
- [ ] 消息接收URL

**步骤**:
1. 登录钉钉开放平台
2. 创建应用 → 消息接收
3. 配置消息接收地址: `https://your-domain.com/webhook/dingtalk`
4. 订阅机器人事件

---

## 🧪 测试

### 运行示例

```bash
# 运行所有示例
node examples/unified-comm-adapter-usage.js

# 启动Webhook服务器
node examples/unified-comm-adapter-usage.js start-server
```

### 测试清单

- [ ] 适配器初始化成功
- [ ] 配置页面可访问
- [ ] Webhook服务器正常运行
- [ ] 微信消息发送成功
- [ ] 飞书消息发送成功
- [ ] 钉钉消息发送成功
- [ ] Webhook回调接收正常
- [ ] 反馈收集正常

---

## 🐛 常见问题

### Q: Access Token获取失败？
**A**: 检查AppID和AppSecret是否正确，确认应用已发布上线。

### Q: Webhook验证失败？
**A**: 检查Token/Encrypt Key配置，确认服务器可公网访问。

### Q: 消息发送失败？
**A**: 检查用户ID是否正确，确认应用有发送消息权限。

### Q: 如何获取用户ID？
**A**:
- 微信: 用户关注公众号后的OpenID
- 飞书: 用户的User ID
- 钉钉: 用户的UnionID

---

## 📖 相关文档

- [完整报告](./UNIFIED_COMM_ADAPTER_REPORT.md)
- [使用示例](../examples/unified-comm-adapter-usage.js)
- [源代码](../skills/unified-comm-adapter.js)

---

## 🚀 下一步

1. **生产环境部署**
   - 使用PM2或Docker部署Webhook服务器
   - 配置HTTPS（Let's Encrypt）
   - 设置监控和日志

2. **功能增强**
   - 实现零配置向导
   - 添加消息模板管理
   - 实现推荐频率控制

3. **监控和分析**
   - 统计消息送达率
   - 追踪用户互动
   - 分析推荐效果

---

## 📞 支持

- **微信文档**: https://developers.weixin.qq.com/doc/
- **飞书文档**: https://open.feishu.cn/document
- **钉钉文档**: https://open.dingtalk.com/document/

---

**Happy Coding! 🎉**
