# WeChat iLink 项目深度对比分析报告

> **生成时间**: 2026-03-23
> **分析目标**: 找到最适合Stigmergy多CLI协作的WeChat个人账号接入方案

---

## 📊 项目概览

| 项目 | 作者 | 核心定位 | 复杂度 | 多模态支持 | 监控能力 |
|------|------|----------|--------|------------|----------|
| **OpenClaw** | Tencent | 框架插件 | ⭐⭐⭐⭐⭐ | ✅ 全支持 | ❌ 无 |
| **vibe-remote** | cyhhao | 多AI网关 | ⭐⭐⭐⭐ | ✅ 全支持 | ✅ 仪表盘 |
| **wechatbot** | sorrycc | 轻量Bot | ⭐⭐ | ✅ 全支持 | ❌ 无 |

---

## 🔬 深度分析

### 1. OpenClaw (@tencent-weixin/openclaw-weixin)

#### ✅ 优势
- **官方出品**: 腾讯官方维护，协议对接最准确
- **功能完整**: 支持所有消息类型（文字、图片、语音、视频、文件）
- **多账号**: 支持多个WeChat账号同时在线
- **上下文隔离**: 支持 per-channel-per-peer 模式
- **CDN集成**: 完整的AES-128-ECB加密CDN上传

#### ❌ 劣势
- **框架依赖**: 必须安装OpenClaw框架
- **架构复杂**: 需要gateway、plugin多层架构
- **配置繁琐**: 需要多个配置步骤
- **无监控**: 缺少健康检查和监控界面

#### 📦 技术架构
```
OpenClaw Framework
  └── openclaw-weixin Plugin
      └── iLink API Client
          ├── getUpdates (Long Polling)
          ├── sendMessage
          ├── getUploadUrl (CDN)
          └── getConfig/sendTyping
```

#### 🎯 适配Stigmergy评分: 6/10
- ❌ 框架依赖过重
- ❌ 不适合轻量集成
- ✅ 协议实现最标准

---

### 2. vibe-remote (cyhhao/vibe-remote)

#### ✅ 优势
- **多AI支持**: Codex + CC 同时接入
- **可视化**: 自带健康监控仪表盘
- **灵活路由**: 按频道配置不同Agent
- **生产就绪**: 有完整的监控体系

#### ❌ 劣势
- **架构复杂**: 需要完整部署
- **学习曲线**: 配置项较多
- **依赖关系**: 可能需要额外服务
- **网络要求**: 需要外部访问能力

#### 📦 技术架构（推测）
```
vibe-remote Gateway
  ├── WeChat iLink Adapter
  ├── Codex Adapter
  ├── CC Adapter
  ├── Channel Router (按频道分发)
  └── Dashboard (健康监控)
```

#### 🎯 适配Stigmergy评分: 7/10
- ✅ 监控理念值得借鉴
- ✅ 多AI路由思路有用
- ❌ 整体集成复杂度高
- ❌ 适合独立部署，不适合嵌入

---

### 3. wechatbot (sorrycc/wechatbot)

#### ✅ 优势
- **轻量级**: 依赖最少，易集成
- **底层协议**: 直接对接iLink Bot协议
- **稳定性**: 断线自动重连
- **多模态**: SILK语音解码 + STT兜底
- **作者可信**: sorrycc是知名开源贡献者
- **性能好**: 无中间层，直连API

#### ❌ 劣势
- **功能专注**: 只做Bot，不做网关
- **无监控**: 缺少管理界面
- **单Bot**: 默认单Bot设计（但可扩展）

#### 📦 技术架构（推测）
```
wechatbot
  ├── iLink Protocol Client
  ├── Message Handler
  ├── Auto-Reconnect Logic
  ├── SILK Decoder (语音)
  └── STT Fallback (语音识别)
```

#### 🎯 适配Stigmergy评分: 9/10
- ✅ 轻量级，易集成
- ✅ 直接协议对接
- ✅ 稳定性好
- ✅ 可扩展为多Bot
- ✅ 适合作为Stigmergy基础

---

## 🎯 Stigmergy最优方案设计

### 核心需求分析

根据你的要求：
1. ✅ **个人微信**: 三个项目都支持
2. ✅ **多CLI并发接入**: 需要架构设计
3. ✅ **一个Bot对接一个CLI**: 需要多实例支持
4. ✅ **可多次扫码或一次扫码**: 需要凭证管理

### 推荐方案: **Stigmergy WeChat Multi-CLI架构**

```
┌─────────────────────────────────────────────────────────────┐
│                    Stigmergy Core                            │
│  (Multi-CLI Coordination & Smart Routing)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │  WeChat Hub   │
                    │  (新增核心)   │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐
│  Claude Bot  │    │  Qwen Bot    │    │  Other CLI   │
│  Instance    │    │  Instance    │    │  Instances   │
└───────┬──────┘    └───────┬──────┘    └───────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  iLink API     │
                    │  (Tencent)     │
                    └────────────────┘
```

### 实现策略

#### Phase 1: 基于wechatbot设计轻量客户端 ⭐推荐

```javascript
// skills/wechat-hub.js
class StigmergyWeChatHub {
  constructor() {
    this.bots = new Map(); // cliName -> botInstance
    this.sharedCredentials = null; // 共享登录凭证
  }

  // 方案A: 多次扫码（每个CLI独立）
  async addBot(cliName) {
    const bot = new WeChatBot();
    await bot.loginWithQR(); // 独立扫码
    this.bots.set(cliName, bot);
  }

  // 方案B: 一次扫码（共享凭证）
  async loginOnce() {
    if (!this.sharedCredentials) {
      const bot = new WeChatBot();
      this.sharedCredentials = await bot.loginWithQR();
    }
    return this.sharedCredentials;
  }

  async addBotWithSharedCreds(cliName) {
    const creds = await this.loginOnce();
    const bot = new WeChatBot(creds);
    this.bots.set(cliName, bot);
  }
}
```

#### Phase 2: 借鉴vibe-remote的监控能力

```javascript
// skills/wechat-monitor.js
class WeChatMonitor {
  constructor() {
    this.metrics = {
      botStatus: {},      // botName -> {online, lastSeen, messageCount}
      healthChecks: {},
      alerts: []
    };
  }

  checkHealth(botName) {
    // 定期健康检查
    // 参考 vibe-remote 的监控设计
  }

  getDashboard() {
    // 返回Web仪表盘数据
    // 简化版 vibe-remote dashboard
  }
}
```

#### Phase 3: 参考OpenClaw的协议实现

```javascript
// 基于已分析的OpenClaw源码
// 直接实现iLink API协议
class ILinkProtocol {
  async getUpdates(token, offset) {
    // Long polling实现
  }

  async sendMessage(token, msg) {
    // 消息发送
  }

  async uploadMedia(token, file) {
    // CDN上传（AES-128-ECB）
  }
}
```

---

## 📋 实施路线图

### Week 1: 基础实现
- [x] 创建 iLink API 客户端（已完成）
- [x] 实现QR码登录（已完成）
- [ ] 实现 wechatbot 风格的轻量客户端
- [ ] 添加断线自动重连

### Week 2: 多CLI支持
- [ ] 设计 WeChat Hub 架构
- [ ] 实现凭证共享机制
- [ ] 支持多Bot实例管理
- [ ] 测试并发消息处理

### Week 3: 监控与优化
- [ ] 实现健康检查系统
- [ ] 添加Web仪表盘
- [ ] 性能优化和压力测试
- [ ] 完善文档和示例

### Week 4: 生产就绪
- [ ] 安全加固
- [ ] 错误处理完善
- [ ] 部署脚本
- [ ] 用户指南

---

## 🔥 关键决策点

### ✅ 推荐选择

**主要参考**: wechatbot (sorrycc)
**次要参考**: vibe-remote 的监控设计
**协议标准**: OpenClaw 的API文档

**理由**:
1. wechatbot最轻量，易于集成到Stigmergy
2. 断线重连机制成熟，稳定性好
3. 多模态支持完整（文字、图片、语音）
4. 可以扩展为多Bot架构
5. 作者可信，代码质量高

### 🎯 最终架构

```
Stigmergy WeChat Multi-CLI System
  ├── Core: wechatbot-style 轻量客户端
  ├── Hub: 多Bot实例管理
  ├── Monitor: vibe-style 健康检查
  ├── Protocol: OpenClaw iLink API
  └── Integration: Stigmergy CLI Router
```

---

## 📈 成功指标

- ✅ 支持至少5个CLI并发接入
- ✅ 消息延迟 < 500ms
- ✅ 断线重连 < 3秒
- ✅ 多模态消息（文字、图片、语音）
- ✅ 99.9% 可用性
- ✅ 零配置自动登录（凭证保存）

---

## 🚀 下一步行动

1. **立即**: 开始实现 wechatbot 风格的轻量客户端
2. **本周**: 完成 WeChat Hub 架构设计
3. **本月**: 完成多CLI并发测试
4. **持续**: 监控、优化、迭代

---

**结论**: 基于wechatbot设计，借鉴vibe-remote监控，参考OpenClaw协议，打造最适合Stigmergy的多CLI WeChat接入方案！
