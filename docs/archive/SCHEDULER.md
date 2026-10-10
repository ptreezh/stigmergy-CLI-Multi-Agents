# Stigmergy Scheduler - 定时任务管理

**SEO Keywords**: cron scheduler, cron job, scheduled task, timer, AI automation, CLI automation, stigmergy scheduler, task scheduling, cron expression, automation

---

## 🎯 功能概述

Stigmergy Scheduler 提供强大的跨平台定时任务管理功能：

- **🌍 跨平台**: Windows / Linux / macOS
- **⏰ Cron 表达式**: 支持标准 5 字段 Cron 格式
- **🤖 AI CLI 集成**: 定时执行 Claude, Gemini, Qwen, iFlow 等
- **📱 Gateway 消息**: 定时发送消息到 Feishu, Telegram, Slack, Discord
- **🔗 Webhook 调用**: 定时触发外部 HTTP API
- **📜 脚本执行**: 定时运行 Shell/PowerShell/Python 脚本
- **💾 持久化**: 任务自动保存，重启后继续运行

---

## 🚀 快速开始

### 查看帮助

```bash
stigmergy scheduler help
```

### 创建定时任务

```bash
# 创建 CLI 任务 - 每天早上9点用 Claude 执行代码审查
stigmergy scheduler add --name "代码审查" --type cli --cli claude \
  --cron "0 9 * * *" --command "请审查最近的代码变更"

# 创建 Gateway 消息 - 每天8点发送早报到 Telegram
stigmergy scheduler add --name "早报提醒" --type gateway \
  --cron "0 8 * * *" --platform telegram --message "早安！开始新的一天"

# 创建 Webhook 任务 - 每小时触发 CI/CD
stigmergy scheduler add --name "CI 触发" --type webhook \
  --cron "0 * * * *" --webhook "https://api.example.com/build"
```

### 管理任务

```bash
# 列出所有任务
stigmergy scheduler list

# 查看任务详情
stigmergy scheduler get --id <任务ID>

# 立即执行任务
stigmergy scheduler run --id <任务ID>

# 启用/禁用任务
stigmergy scheduler toggle --id <任务ID>

# 删除任务
stigmergy scheduler delete --id <任务ID>

# 查看执行历史
stigmergy scheduler history

# 查看调度器状态
stigmergy scheduler status
```

---

## 📋 命令参考

### 命令列表

| 命令      | 别名   | 描述           |
| --------- | ------ | -------------- |
| `list`    | `ls`   | 列出所有任务   |
| `add`     | `new`  | 创建新任务     |
| `get`     | -      | 查看任务详情   |
| `update`  | `edit` | 更新任务       |
| `delete`  | `rm`   | 删除任务       |
| `toggle`  | -      | 启用/禁用任务  |
| `run`     | `exec` | 立即执行任务   |
| `history` | -      | 查看执行历史   |
| `status`  | -      | 查看调度器状态 |
| `start`   | -      | 启动调度器     |
| `stop`    | -      | 停止调度器     |
| `help`    | -      | 显示帮助       |

---

## 📝 选项说明

### 通用选项

| 选项               | 描述                                            |
| ------------------ | ----------------------------------------------- |
| `--id <ID>`        | 任务 ID                                         |
| `--name <名称>`    | 任务名称                                        |
| `--type <类型>`    | 任务类型: `cli`, `gateway`, `webhook`, `script` |
| `--cron <表达式>`  | Cron 表达式                                     |
| `--timeout <毫秒>` | 超时时间 (默认: 300000)                         |
| `--retry <次数>`   | 失败重试次数 (默认: 0)                          |
| `--limit <数量>`   | 限制返回数量                                    |

### CLI 任务选项

| 选项                   | 描述                 |
| ---------------------- | -------------------- |
| `--cli <工具>`         | CLI 工具名称         |
| `-c, --command <命令>` | 要执行的命令或提示词 |

### Gateway 任务选项

| 选项                    | 描述                                           |
| ----------------------- | ---------------------------------------------- |
| `-p, --platform <平台>` | 平台: `feishu`, `telegram`, `slack`, `discord` |
| `-m, --message <消息>`  | 消息内容                                       |

### Webhook 任务选项

| 选项              | 描述         |
| ----------------- | ------------ |
| `--webhook <URL>` | Webhook 地址 |

### 脚本任务选项

| 选项              | 描述         |
| ----------------- | ------------ |
| `--script <路径>` | 脚本文件路径 |

---

## ⏰ Cron 表达式

### 格式

```
分 时 日 月 周
* * * * *
```

### 字段说明

| 字段 | 范围 | 允许值                            |
| ---- | ---- | --------------------------------- |
| 分   | 0-59 | `*`, `*/n`, `n-m`, `n,m`          |
| 时   | 0-23 | `*`, `*/n`, `n-m`, `n,m`          |
| 日   | 1-31 | `*`, `*/n`, `n-m`, `n,m`          |
| 月   | 1-12 | `*`, `*/n`, `n-m`, `n,m`          |
| 周   | 0-6  | `*`, `*/n`, `n-m`, `n,m` (0=周日) |

### 示例

| 表达式        | 描述            |
| ------------- | --------------- |
| `* * * * *`   | 每分钟          |
| `*/5 * * * *` | 每 5 分钟       |
| `0 * * * *`   | 每小时          |
| `0 9 * * *`   | 每天早上 9 点   |
| `0 9 * * 1-5` | 工作日早上 9 点 |
| `30 8 * * 1`  | 每周一早上 8:30 |
| `0 0 1 * *`   | 每月 1 号午夜   |
| `0 0 * * 0`   | 每周日午夜      |

---

## 💡 使用示例

### 1. 定时代码审查

```bash
# 创建任务
stigmergy scheduler add \
  --name "每日代码审查" \
  --type cli \
  --cli claude \
  --cron "0 9 * * 1-5" \
  --command "请审查昨天和今天的代码变更，总结关键问题和改进建议"
```

### 2. 定时发送报告到 Slack

```bash
# 创建任务
stigmergy scheduler add \
  --name "每日报告" \
  --type gateway \
  --cron "0 18 * * 1-5" \
  --platform slack \
  --message "📊 每日开发报告已生成，请查看项目状态看板"
```

### 3. 定时健康检查

```bash
# 创建任务 - 检查所有 AI CLI 是否正常
stigmergy scheduler add \
  --name "CLI 健康检查" \
  --type cli \
  --cli qwen \
  --cron "0 */2 * * *" \
  --command "请检查以下 CLI 工具的运行状态: claude, gemini, qwen, iflow, codebuddy"
```

### 4. 定时触发 CI/CD

```bash
# 创建任务 - 每天凌晨 2 点触发构建
stigmergy scheduler add \
  --name "夜间构建" \
  --type webhook \
  --cron "0 2 * * *" \
  --webhook "https://api.example.com/cicd/trigger"
```

### 5. 定时备份数据

```bash
# 创建任务 - 每天凌晨 3 点执行备份脚本
stigmergy scheduler add \
  --name "数据备份" \
  --type script \
  --cron "0 3 * * *" \
  --script "/path/to/backup.sh"
```

---

## 📊 状态和历史

### 查看调度器状态

```bash
stigmergy scheduler status
```

输出示例:

```
📊 调度器状态

运行状态: 运行中
平台: linux
任务总数: 3
启用任务: 2
执行中: 0

下次任务: 每日代码审查
执行时间: 2024-01-15 09:00:00
```

### 查看执行历史

```bash
# 查看所有历史
stigmergy scheduler history

# 查看特定任务历史
stigmergy scheduler history --id <任务ID> --limit 20
```

输出示例:

```
📜 任务执行历史

✓ 每日代码审查 | linux | 5234ms | 2024-01-14 09:00:00
✓ CLI 健康检查 | linux | 1245ms | 2024-01-14 08:00:00
✗ CLI 健康检查 | linux | 234ms | 2024-01-14 07:00:00
✓ 每日代码审查 | linux | 5123ms | 2024-01-14 06:00:00
```

---

## 🔧 配置文件

任务配置文件保存在:

- **Windows**: `%USERPROFILE%\.stigmergy\scheduler\tasks\`
- **Linux/macOS**: `~/.stigmergy/scheduler/tasks/`

### 任务文件格式 (JSON)

```json
{
  "id": "task_1705300000_abc123",
  "name": "每日代码审查",
  "type": "cli",
  "cron": "0 9 * * 1-5",
  "enabled": true,
  "cli": "claude",
  "command": "请审查最近的代码变更",
  "timeout": 300000,
  "retry": 0,
  "lastRun": "2024-01-14T09:00:00.000Z",
  "nextRun": "2024-01-15T09:00:00.000Z",
  "runCount": 14,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-14T09:00:00.000Z"
}
```

---

## 🐛 故障排除

### 任务不执行

1. 检查调度器是否运行:

   ```bash
   stigmergy scheduler status
   ```

2. 检查任务是否启用:

   ```bash
   stigmergy scheduler list
   ```

3. 检查任务配置:
   ```bash
   stigmergy scheduler get --id <任务ID>
   ```

### CLI 命令执行失败

```bash
# 手动测试 CLI 是否可用
claude --version
qwen --version
```

### Gateway 消息发送失败

```bash
# 检查 Gateway 是否运行
stigmergy gateway status

# 检查 Gateway 是否配置正确
export STIGMERGY_GATEWAY_URL="http://localhost:3000"
```

---

## 🔐 权限要求

### Linux/macOS

- 普通任务: 无需特殊权限
- 系统级 cron: 需要 `sudo` 权限

### Windows

- 普通任务: 无需管理员权限
- 系统任务: 需要管理员权限

---

## 📚 相关文档

- [Stigmergy README](../README.md) - 主文档
- [Gateway 文档](./GATEWAY.md) - Gateway 服务器
- [CLI 工具配置](../core/cli_tools.js) - 支持的 CLI 列表

---

## ⭐ License

MIT License
