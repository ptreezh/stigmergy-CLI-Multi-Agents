# Stigmergy Gateway 多平台实施计划

## 方案 A：Gateway + 现有能力 + 多平台支持

### 核心选择

- **using-superpowers**: 是（技能注入）
- **Gateway 方案**: A（复用现有能力）
- **平台支持**: B（统一架构，一次性支持 4 平台）

---

## 一、目标

通过飞书/Telegram/Slack/Discord Webhook 实现远程对话和任务触发，利用 Stigmergy 现有能力（route/concurrent/ask）。

---

## 二、复用已有模块

| 模块                  | 复用方式           |
| --------------------- | ------------------ |
| `executeRoute()`      | 智能路由到最佳 CLI |
| `executeConcurrent()` | 多 CLI 并行分析    |
| `executeAsk()`        | 指定 CLI 执行      |
| `PersistentCLIPool`   | CLI 进程管理       |
| `MemoryManager`       | 记忆存储           |
| `ProjectStatusBoard`  | 进度追踪           |

---

## 三、新增组件

| 组件                           | 功能                  | 代码量 |
| ------------------------------ | --------------------- | ------ |
| `gateway/server.js`            | HTTP Server + Webhook | ~80行  |
| `gateway/core/parser.js`       | 消息解析              | ~50行  |
| `gateway/core/router.js`       | 命令路由              | ~30行  |
| `gateway/core/formatter.js`    | 结果格式化            | ~60行  |
| `gateway/adapters/feishu.js`   | 飞书适配器            | ~20行  |
| `gateway/adapters/telegram.js` | Telegram 适配器       | ~30行  |
| `gateway/adapters/slack.js`    | Slack 适配器          | ~15行  |
| `gateway/adapters/discord.js`  | Discord 适配器        | ~15行  |
| `tunnel/ngrok.js`              | ngrok 隧道管理        | ~80行  |
| `bin/stigmergy-gateway`        | 启动脚本              | ~30行  |

**总计：~410行**

---

## 四、实施阶段

| 阶段    | 内容                                 | 时间  |
| ------- | ------------------------------------ | ----- |
| Phase 1 | 核心模块 (parser, router, formatter) | 0.5天 |
| Phase 2 | 平台适配器 (4个)                     | 0.7天 |
| Phase 3 | Gateway Server                       | 0.3天 |
| Phase 4 | ngrok 隧道管理                       | 0.3天 |
| Phase 5 | 启动脚本和配置                       | 0.2天 |
| Phase 6 | 测试和文档                           | 0.5天 |

**总计：2.5天**

---

## 五、文件结构

```
src/gateway/
├── server.js              # HTTP Server + Webhook 接收 (~80行)
├── core/
│   ├── parser.js         # 消息解析器 (~50行)
│   ├── router.js        # 命令路由器 (~30行)
│   └── formatter.js     # 结果格式化器 (~60行)
├── adapters/
│   ├── index.js         # 统一适配器接口
│   ├── feishu.js       # 飞书适配器 (~20行)
│   ├── telegram.js      # Telegram 适配器 (~30行)
│   ├── slack.js        # Slack 适配器 (~15行)
│   └── discord.js       # Discord 适配器 (~15行)
└── utils/
    └── message-parser.js # 通用消息解析工具 (~30行)

src/tunnel/
└── ngrok.js            # ngrok 隧道管理 (~80行)

bin/
└── stigmergy-gateway  # 启动脚本 (~30行)

config/
└── gateway.json       # 配置文件 (~40行)
```

---

## 六、配置结构

```json
{
  "version": "1.0.0",
  "port": 3000,
  "workdir": "/default/project/path",
  "platforms": {
    "feishu": {
      "enabled": true,
      "webhook_url": "https://open.larksuite.com/xxx",
      "secret": "optional-signing-secret"
    },
    "telegram": {
      "enabled": false,
      "bot_token": "bot123:xxx",
      "webhook_path": "/webhook/telegram"
    },
    "slack": {
      "enabled": false,
      "webhook_url": "https://hooks.slack.com/xxx"
    },
    "discord": {
      "enabled": false,
      "webhook_url": "https://discord.com/api/webhooks/xxx"
    }
  },
  "tunnel": {
    "enabled": true,
    "provider": "ngrok",
    "autostart": true
  }
}
```

---

## 七、使用方式

```bash
# 查看帮助
stigmergy gateway --help

# 初始化配置
stigmergy gateway init --feishu

# 启动网关服务器（本地测试）
stigmergy gateway --feishu --port 3000
stigmergy gateway --telegram --port 3000
stigmergy gateway --slack --port 3000
stigmergy gateway --discord --port 3000

# 启动并启用 ngrok 公开隧道
stigmergy gateway --feishu --tunnel

# 指定工作目录
stigmergy gateway --feishu --workdir ./my-project

# 查询服务器状态
stigmergy gateway status

# 停止服务器
stigmergy gateway stop
```

### 启动脚本独立运行

```bash
# 直接使用启动脚本
bin/stigmergy-gateway --feishu --tunnel
```

### 通过 Webhook 调用

启动服务器后，配置各平台的 Webhook URL：

```
飞书:   http://localhost:3000/webhook/feishu
Telegram: http://localhost:3000/webhook/telegram
Slack:  http://localhost:3000/webhook/slack
Discord: http://localhost:3000/webhook/discord

# 使用 ngrok 时
# https://xxxx.ngrok.io/webhook/feishu
```

### 本地测试

```bash
# 1. 启动网关
stigmergy gateway --feishu --port 3000

# 2. 另一个终端测试消息
curl -X POST http://localhost:3000/webhook/feishu \
  -H "Content-Type: application/json" \
  -d '{"content":{"text":"route 分析这段代码"}}'

# 3. 检查健康状态
curl http://localhost:3000/health

# 4. 查看状态
curl http://localhost:3000/status
```

### 完整工作流

```bash
# 场景：使用飞书远程控制 Stigmergy
# 1. 启动网关（带 ngrok 隧道）
stigmergy gateway --feishu --tunnel
# 输出: Public URL: https://xxxx.ngrok.io

# 2. 在飞书开发者平台配置 Webhook
#    URL: https://xxxx.ngrok.io/webhook/feishu

# 3. 发送消息到飞书
#    "concurrent 分析这个需求"
#    "ask claude 帮我写一个函数"
#    "route 优化这段代码"
```

---

## 八、消息格式示例

```
飞书：
POST /webhook/feishu
{"content":{"text":"concurrent 分析代码"}}

Telegram：
POST /webhook/telegram
{"update_id":123,"message":{"text":"concurrent 分析代码"}}

Slack：
POST /webhook/slack
{"text":"concurrent 分析代码"}

Discord：
POST /webhook/discord
{"content":"concurrent 分析代码"}
```

---

## 九、命令支持

| 命令               | 说明                    |
| ------------------ | ----------------------- |
| `route <msg>`      | 智能路由到最佳 CLI      |
| `concurrent <msg>` | 多 CLI 并行分析相同任务 |
| `ask <cli> <msg>`  | 指定 CLI 执行           |
| `statu[s]`         | 查询进度                |

---

## 十、实施步骤详情

### Step 1: 核心模块

- [x] parser.js - 消息解析器
- [x] router.js - 命令路由器
- [x] formatter.js - 结果格式化器

### Step 2: 平台适配器

- [x] feishu.js - 飞书适配器
- [x] telegram.js - Telegram 适配器
- [x] slack.js - Slack 适配器
- [x] discord.js - Discord 适配器

### Step 3: Gateway Server

- [x] server.js - HTTP Server + Webhook
- [x] index.js - 统一适配器接口

### Step 4: 隧道管理

- [x] ngrok.js - ngrok 自动管理

### Step 5: 配置和脚本

- [x] gateway.json - 配置文件
- [x] stigmergy-gateway - 启动脚本

### Step 6: CLI 集成

- [x] router-beta.js - 添加 gateway 命令
- [x] package.json - 添加 bin 入口

### Step 7: 测试和文档

- [x] 语法检查 - 通过
- [ ] README.md - 待完善
- [ ] 各平台实际测试

---

## 十一、已知限制

```
当前能力边界：
✅ 多 CLI 并行分析相同任务
✅ 智能路由到最佳 CLI
✅ 指定单个 CLI 执行
❌ 任务分解（需要额外开发）
❌ 任务认领（需要额外开发）
❌ 按依赖调度（需要额外开发）
```

---

## 十二、using-superpowers 集成

通过 `session-start.sh` hook 注入 Gateway 使用说明：

- `stigmergy gateway` 命令使用
- 平台配置方法
- 命令语法参考

---

创建时间: 2026-02-07
版本: 1.0.0
