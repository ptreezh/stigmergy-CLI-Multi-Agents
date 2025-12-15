# AI CLI --resume 功能持久化记忆读取位置详细分析

## 概述

各AI CLI工具的 `--resume` 功能从不同的位置读取持久化的会话记忆，具体机制如下：

## 各CLI的Resume读取位置

### 1. Claude CLI

**读取位置**: `~/.claude/projects/<项目路径>/<sessionId>.jsonl`

**存储结构**:
```
~/.claude/
├── projects/
│   └── D--AIDevelop-ssai-md/         # 项目目录（路径中的冒号替换为-）
│       ├── 8a1f5233-cb63-4e99-bba4-98fa7853c6ac.jsonl  # 主要会话文件（7.9MB）
│       └── agent-269dd219.jsonl      # 代理相关会话
├── history.jsonl                     # 全局命令历史
└── todos/                           # 任务管理
```

**Resume机制**:
- 根据当前工作目录确定项目路径
- 在对应项目目录下查找会话文件
- 支持通过sessionId直接恢复特定会话
- 会话文件包含完整的对话历史和上下文

### 2. Gemini CLI

**读取位置**: `~/.gemini/tmp/<项目哈希>/chats/session-<时间戳>-<随机ID>.json`

**存储结构**:
```
~/.gemini/
├── tmp/
│   └── 02226788d1ed76a8b8cbb0990426125cbb3b10fa2afcdb390d2aea3dc7708dff/  # 项目哈希
│       ├── chats/
│       │   ├── session-2025-11-03T01-40-264c12b1.json
│       │   └── session-2025-10-24T14-03-07ea4c0f.json
│       └── logs.json  # 项目日志
```

**Resume机制**:
- 计算当前项目路径的SHA256哈希值
- 在对应的哈希目录下查找会话文件
- `--resume latest` 选择最新的会话文件
- `--resume 5` 选择第5个会话（按时间排序）
- `--list-sessions` 显示当前项目的所有会话列表

### 3. Qwen CLI

**读取位置**: `~/.qwen/tmp/<项目哈希>/chats/session-<时间戳>-<随机ID>.json`

**存储结构**:
```
~/.qwen/
├── tmp/
│   └── 01d6bc34e8bc26a86058822db219d7713dfec298684fc9f191dc3fd05faf5746/  # 项目哈希
│       ├── chats/
│       │   ├── session-2025-11-26T14-57-9e676089.json
│       │   └── session-2025-12-06T12-29-a207f134.json
│       └── logs.json
```

**Resume机制**:
- 与Gemini类似，使用项目哈希进行分组
- `--continue` 恢复当前项目的最新会话
- `--resume` 无参数时显示交互式会话选择器
- `--resume <sessionId>` 恢复特定会话ID的会话

### 4. IFlow CLI

**读取位置**: `~/.iflow/projects/<标准化路径>/session-<sessionId>.jsonl`

**存储结构**:
```
~/.iflow/
├── projects/
│   ├── -C-Users/                     # 标准化的项目路径
│   │   └── session-29a1265f-b13b-452f-ad4d-f00455d4081c.jsonl
│   └── -C-Users-Zhang/
│       ├── session-090f76f7-4c19-4805-bc32-dd9d9a0b8248.jsonl
│       └── session-36e6c308-565d-4613-a820-fe242b71730a.jsonl
├── cache/
│   └── session-index.json           # 会话索引文件
└── history/
```

**Resume机制**:
- 标准化当前工作路径（替换特殊字符）
- 在对应路径目录下查找会话文件
- 使用 `session-index.json` 作为会话索引
- `--resume` 无参数时显示交互式选择器
- 会话文件包含完整的消息历史和元数据

### 5. CodeBuddy CLI

**读取位置**: `~/.codebuddy/history.jsonl` 和 `~/.codebuddy/projects/<项目>/`

**存储结构**:
```
~/.codebuddy/
├── history.jsonl                    # 全局命令历史（34行）
├── user-state.json                  # 用户状态和统计信息
├── projects/
│   └── <项目路径>/                   # 项目特定数据
└── local_storage/                   # 本地存储
```

**Resume机制**:
- 从全局 `history.jsonl` 读取命令历史
- 使用项目路径进行会话分组
- `--resume <sessionId>` 恢复特定会话
- 较简单的会话管理，主要依赖全局历史文件

## 读取机制对比

| CLI | 存储位置 | 项目隔离 | 索引机制 | 特色功能 |
|-----|----------|----------|----------|----------|
| Claude | `~/.claude/projects/<项目>/` | ✅ 路径隔离 | ❌ 无索引 | 大型会话文件支持 |
| Gemini | `~/.gemini/tmp/<哈希>/` | ✅ 哈希隔离 | ✅ 时间排序 | 会话列表和删除 |
| Qwen | `~/.qwen/tmp/<哈希>/` | ✅ 哈希隔离 | ✅ 时间排序 | Token统计 |
| IFlow | `~/.iflow/projects/<路径>/` | ✅ 路径隔离 | ✅ session-index.json | 交互式选择器 |
| CodeBuddy | `~/.codebuddy/history.jsonl` | ⚠️ 简单隔离 | ❌ 无索引 | 用户状态管理 |

## 实际读取流程

### Claude CLI
1. 获取当前工作目录
2. 标准化项目路径（替换冒号为破折号）
3. 在 `~/.claude/projects/<项目>/` 下查找会话文件
4. 加载对应的 `.jsonl` 文件恢复会话上下文

### Gemini CLI
1. 计算当前项目路径的SHA256哈希
2. 定位到 `~/.gemini/tmp/<哈希>/chats/` 目录
3. 按文件名时间戳排序会话文件
4. 根据 `--resume` 参数选择对应会话

### Qwen CLI
1. 与Gemini相同的哈希机制
2. `--continue` 直接选择最新会话
3. `--resume` 显示交互式选择器
4. 加载包含Token统计的完整会话数据

### IFlow CLI
1. 标准化当前工作路径
2. 读取 `session-index.json` 索引文件
3. 在 `~/.iflow/projects/<路径>/` 下查找会话
4. 无参数时显示交互式选择器

### CodeBuddy CLI
1. 读取全局 `history.jsonl` 文件
2. 根据项目字段过滤相关记录
3. 使用sessionId定位特定会话
4. 结合用户状态恢复完整上下文

## 关键技术差异

### 项目识别机制
- **路径标准化**: Claude和IFlow使用标准化路径
- **哈希计算**: Gemini和Qwen使用SHA256哈希
- **简单分组**: CodeBuddy使用简单的项目字段

### 索引和查找
- **无索引**: Claude和CodeBuddy直接文件查找
- **时间排序**: Gemini和Qwen按文件名时间戳排序
- **专用索引**: IFlow使用session-index.json

### 会话文件格式
- **JSONL格式**: Claude、IFlow、CodeBuddy使用逐行JSON
- **JSON文件**: Gemini和Qwen使用完整JSON对象

这种多样化的实现方式反映了不同CLI工具在设计理念上的差异，从简单的命令历史到完整的项目级会话管理系统。