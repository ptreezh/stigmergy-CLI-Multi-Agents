# WeChat多CLI集成 - 快速启动指南

> **更新**: 2026-03-23
> **状态**: ✅ Level 1.5 验证通过

---

## 🚀 5分钟快速开始

### 方式1: 使用共享凭证（推荐）

**一次扫码，多个CLI共享**

```bash
# 步骤1: 扫码登录（只需一次）
node scripts/start-wechat-ilink.js claude

# 步骤2: 启动Hub
node scripts/start-wechat-hub.js shared

# 步骤3: 访问管理界面
# 浏览器打开: http://localhost:3003
```

### 方式2: 使用独立凭证

**多次扫码，每个CLI独立**

```bash
# 步骤1: 为每个CLI分别扫码登录
node scripts/start-wechat-ilink.js claude
node scripts/start-wechat-ilink.js qwen
node scripts/start-wechat-ilink.js gemini

# 步骤2: 启动Hub
node scripts/start-wechat-hub.js independent

# 步骤3: 访问管理界面
# 浏览器打开: http://localhost:3004
```

---

## 📊 监控和管理

### 健康监控仪表盘
```
URL: http://localhost:3002

功能:
- 实时Bot状态
- 健康指标
- 自动刷新（30秒）
```

### Hub管理界面
```
URL: http://localhost:3003 (共享模式)
URL: http://localhost:3004 (独立模式)

功能:
- Bot实例列表
- 运行状态
- 消息统计
```

### API接口
```bash
# 健康监控API
curl http://localhost:3002/api/bots
curl http://localhost:3002/api/bot/claude-bot

# Hub管理API
curl http://localhost:3003/api/status
```

---

## 🧪 测试验证

### 运行测试套件
```bash
# 测试v2客户端
node scripts/test-wechat-v2.js

# 测试Hub功能
node scripts/test-wechat-hub.js
```

### 预期结果
```
✅ 重连机制: 10次重连测试通过
✅ 消息队列: 5个消息处理测试通过
✅ 健康检查: 监控组件测试通过
✅ Hub功能: 多Bot场景测试通过
```

---

## 📁 项目结构

```
stigmergy/
├── skills/
│   ├── ilink-wechat-client.js        # v1客户端（已完成）
│   ├── ilink-wechat-client-v2.js     # v2客户端（增强版✅）
│   └── wechat-hub.js                 # Hub核心（已完成✅）
├── scripts/
│   ├── start-wechat-ilink.js         # QR码登录脚本
│   ├── wechat-login-server.js        # 登录服务器
│   ├── test-wechat-v2.js             # v2测试套件
│   ├── test-wechat-hub.js            # Hub测试套件
│   ├── wechat-health-dashboard.js    # 健康监控（运行在3002✅）
│   └── start-wechat-hub.js           # Hub启动（运行在3003✅）
├── docs/
│   ├── WECHAT_PROJECT_COMPARISON.md              # 项目对比分析
│   ├── WECHAT_MULTI_CLI_IMPLEMENTATION_PLAN.md  # 实施方案
│   ├── WECHAT_V2_PROGRESS_2026-03-23.md         # v2进度总结
│   └── WECHAT_HUB_COMPLETION_2026-03-23.md      # 完成总结
└── .wechat-hub-credentials.json        # Hub凭证存储（自动生成）
```

---

## ⚙️ 配置说明

### 环境变量
```bash
# 日志级别
export LOG_LEVEL=debug  # debug | info | warn | error

# API端口（如需修改）
export HUB_PORT=3003
export HEALTH_PORT=3002
```

### 凭证存储
```bash
# Hub凭证文件
.wechat-hub-credentials.json

# 包含:
{
  "shared": {
    "token": "...",
    "accountId": "...",
    "userId": "..."
  },
  "independent": {
    "claude": { ... },
    "qwen": { ... }
  }
}
```

---

## 🔧 故障排查

### 问题1: 无法连接
```bash
# 检查凭证是否存在
cat .wechat-hub-credentials.json

# 重新扫码登录
node scripts/start-wechat-ilink.js claude
```

### 问题2: 端口被占用
```bash
# 查看占用进程
netstat -ano | findstr :3002
netstat -ano | findstr :3003

# 杀死进程
taskkill /F /PID <进程ID>
```

### 问题3: Bot状态异常
```bash
# 查看健康状态
curl http://localhost:3002/api/bots

# 重启Hub
# Ctrl+C 停止，然后重新运行
node scripts/start-wechat-hub.js shared
```

---

## 📖 更多文档

- [完整对比分析](./WECHAT_PROJECT_COMPARISON.md)
- [实施方案详解](./WECHAT_MULTI_CLI_IMPLEMENTATION_PLAN.md)
- [v2进度总结](./WECHAT_V2_PROGRESS_2026-03-23.md)
- [完成总结报告](./WECHAT_HUB_COMPLETION_2026-03-23.md)

---

## 🎯 验证状态

| 验证项 | 状态 | 说明 |
|--------|------|------|
| Level 1 | ✅ 完成 | 基础功能验证 |
| Level 1.5 | ✅ 完成 | 增强功能验证 |
| Level 2 | ⏳ 待测试 | 需要真实WeChat凭证 |
| Level 3 | ⏳ 待测试 | 需要并发环境 |
| Level 4 | ⏳ 待测试 | 需要生产环境 |

---

## 💡 下一步

1. **完成Level 2验证**
   - 使用真实WeChat凭证
   - 测试5个CLI并发
   - 验证消息收发

2. **性能优化**
   - 压力测试
   - 内存优化
   - 并发优化

3. **生产部署**
   - Docker化
   - 监控告警
   - 自动重启

---

**快速上手，3步启动！** 🚀
