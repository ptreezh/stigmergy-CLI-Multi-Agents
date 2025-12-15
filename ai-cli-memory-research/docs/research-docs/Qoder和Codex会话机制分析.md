# Qoder CLI 和 Codex CLI 会话持久化机制补充分析

## Qoder CLI 分析

### 基本信息
- **版本**: 0.1.15
- **安装位置**: `/c/npm_global/qodercli`
- **配置目录**: `~/.qoder/`

### 会话存储结构

**主要目录结构**:
```
~/.qoder/
├── projects/                        # 按项目分组的会话
│   ├── D--AIDevelop-ssai/           # 项目目录（路径标准化）
│   │   ├── 53046ff4-f744-4954-90b9-72edeccc0e4d-session.json
│   │   ├── c43ffd91-121e-47c0-bbba-8c30dadd72e0-session.json
│   │   ├── call_069bb7725fb3466b961db9e9-session.json
│   │   ├── call_4cd401dedd6b4292a2d3e67f-session.json
│   │   └── ... (约20+个会话文件)
│   ├── C--Users-Zhang/
│   └── 其他项目目录/
├── todos/                           # 任务管理
├── events/                          # 事件记录
├── logs/                            # 日志文件
├── extensions/                      # 扩展目录
└── qoder.log                        # 主日志文件（20MB+）
```

### 会话文件格式

**会话元数据格式**:
```json
{
  "id": "5890e924-8875-412d-881f-b1d4527a7587",
  "parent_session_id": "",
  "title": "End Conversation",
  "message_count": 0,
  "prompt_tokens": 12794,
  "completion_tokens": 24,
  "summary_message_id": "",
  "cost": 0.02578,
  "created_at": 1761204377132,     // Unix时间戳（毫秒）
  "updated_at": 1761204468802,
  "working_dir": "C:\\Users\\Zhang"
}
```

**Call格式**（任务会话）:
```json
{
  "id": "call_069bb7725fb3466b961db9e9",
  "parent_session_id": "c43ffd91-121e-47c0-bbba-8c30dadd72e0",
  "title": "Task: 优化用户交互体验",
  "message_count": 0,
  "prompt_tokens": 16077,
  "completion_tokens": 298,
  "summary_message_id": "",
  "cost": 0.32878399999999997,
  "created_at": 1763300128436,
  "updated_at": 1763300435998,
  "working_dir": "D:\\AIDevelop\\ssai"
}
```

### Resume功能
- **支持**: ✅ `--resume <sessionId>`
- **格式**: `qodercli --resume <session-id>`
- **机制**: 通过sessionId直接恢复特定会话

### 特色功能
1. **成本追踪**: 详细记录Token使用和费用
2. **会话层级**: 支持父子会话关系（parent_session_id）
3. **任务分类**: 区分普通会话和任务会话（call_前缀）
4. **路径标准化**: 项目路径中的冒号替换为破折号

## Codex CLI 分析

### 基本信息
- **包名**: `@openai/codex`
- **配置目录**: `~/.codex/` 和 `~/.config/codex/`
- **状态**: 存在权限问题，无法正常运行

### 会话存储结构

**主要目录结构**:
```
~/.codex/
├── history.jsonl                    # 历史记录文件
├── sessions/                        # 会话目录
│   └── 2025/                        # 按年份分组
├── log/                             # 日志目录
└── version.json                     # 版本信息

~/.config/codex/
├── mcp_server.py                    # MCP服务器
├── standalone_codex_adapter.py      # 独立适配器
├── slash_commands.json              # 斜杠命令配置
└── slash_commands/                  # 斜杠命令目录
```

### 会话文件格式

**历史记录格式**:
```json
{
  "session_id": "01a46694-2e5a-4f46-8ad7-84d585d320a0",
  "ts": 1757142006,                  // Unix时间戳（秒）
  "text": "Generate a file named AGENTS.md..."  // 完整的用户输入文本
}
```

### Resume功能
- **支持**: ❌ 无resume相关选项
- **限制**: 工具存在权限问题，无法正常运行
- **会话管理**: 仅提供历史记录，无会话恢复功能

## 跨CLI兼容性分析

### Qoder CLI 集成优势

✅ **高度兼容**:
1. **JSON格式**: 标准JSON格式，易于解析和转换
2. **完整元数据**: 包含时间戳、成本、Token统计等丰富信息
3. **项目隔离**: 清晰的项目分组机制
4. **会话层级**: 支持会话间的父子关系

✅ **转换映射**:
```javascript
// Qoder → 通用格式
const qoderToUniversal = {
  sessionId: qoder.id,
  sourceCLI: 'qoder',
  startTime: new Date(qoder.created_at).toISOString(),
  lastUpdated: new Date(qoder.updated_at).toISOString(),
  projectPath: qoder.working_dir,
  metadata: {
    title: qoder.title,
    cost: qoder.cost,
    tokens: {
      prompt: qoder.prompt_tokens,
      completion: qoder.completion_tokens
    },
    parentSession: qoder.parent_session_id
  }
}
```

### Codex CLI 集成挑战

⚠️ **部分兼容**:
1. **权限问题**: 工具无法正常运行，影响测试
2. **功能限制**: 无resume功能，仅历史记录
3. **格式简单**: 缺少复杂的会话结构

✅ **可转换内容**:
```javascript
// Codex → 通用格式
const codexToUniversal = {
  sessionId: codex.session_id,
  sourceCLI: 'codex',
  startTime: new Date(codex.ts * 1000).toISOString(),
  lastUpdated: new Date(codex.ts * 1000).toISOString(),
  messages: [{
    id: generateId(),
    timestamp: new Date(codex.ts * 1000).toISOString(),
    type: 'user',
    content: codex.text
  }]
}
```

## 更新的跨CLI会话恢复支持矩阵

| CLI | 版本 | Resume支持 | 存储格式 | 项目隔离 | 成本追踪 | Token统计 | 转换难度 |
|-----|------|------------|----------|----------|----------|-----------|----------|
| Claude | 2.0.65 | ✅ | JSONL | ✅ | ❌ | ❌ | 简单 |
| Gemini | 0.19.4 | ✅ | JSON | ✅ | ❌ | ❌ | 简单 |
| Qwen | 0.4.0 | ✅ | JSON | ✅ | ❌ | ✅ | 简单 |
| IFlow | 0.4.6 | ✅ | JSONL | ✅ | ❌ | ❌ | 中等 |
| CodeBuddy | 2.10.0 | ✅ | JSONL | ✅ | ❌ | ❌ | 简单 |
| **Qoder** | **0.1.15** | **✅** | **JSON** | **✅** | **✅** | **✅** | **简单** |
| **Codex** | **-** | **❌** | **JSONL** | **❌** | **❌** | **❌** | **中等** |

## 实现建议

### 优先级调整

**Phase 1** (最高优先级):
- **Qoder CLI**: 格式完整，功能丰富，完美支持
- 与现有的Gemini/Qwen双向转换并行实现

**Phase 2** (中等优先级):
- **Codex CLI**: 仅历史记录转换，无resume功能

### 扩展的转换器支持

```javascript
class EnhancedSessionConverter {
  static toUniversal(sourceData, sourceType) {
    switch(sourceType) {
      case 'qoder': return this.fromQoder(sourceData);
      case 'codex': return this.fromCodex(sourceData);
      // ... 其他CLI
    }
  }

  // Qoder格式转换（最完整）
  static fromQoder(qoderSession) {
    return {
      sessionId: qoderSession.id,
      sourceCLI: 'qoder',
      originalFormat: 'qoder-session',

      // 项目信息
      projectPath: qoderSession.working_dir,

      // 时间信息
      startTime: new Date(qoderSession.created_at).toISOString(),
      lastUpdated: new Date(qoderSession.updated_at).toISOString(),

      // 元数据
      metadata: {
        title: qoderSession.title,
        parentSessionId: qoderSession.parent_session_id,
        messageCount: qoderSession.message_count,
        cost: qoderSession.cost,
        tokens: {
          prompt: qoderSession.prompt_tokens,
          completion: qoderSession.completion_tokens,
          total: qoderSession.prompt_tokens + qoderSession.completion_tokens
        },
        isCall: qoderSession.id.startsWith('call_')
      }
    };
  }

  // Codex格式转换（基础版本）
  static fromCodex(codexRecord) {
    return {
      sessionId: codexRecord.session_id,
      sourceCLI: 'codex',
      originalFormat: 'codex-history',

      // 项目信息（从历史推断）
      projectPath: process.cwd(),

      // 时间信息
      startTime: new Date(codexRecord.ts * 1000).toISOString(),
      lastUpdated: new Date(codexRecord.ts * 1000).toISOString(),

      // 简单消息结构
      messages: [{
        id: this.generateId(),
        timestamp: new Date(codexRecord.ts * 1000).toISOString(),
        type: 'user',
        content: codexRecord.text
      }]
    };
  }
}
```

## 总结

**Qoder CLI** 是一个优秀的跨CLI会话恢复候选：
- ✅ 完整的会话管理功能
- ✅ 丰富的元数据（成本、Token、层级）
- ✅ 标准JSON格式
- ✅ 清晰的项目隔离

**Codex CLI** 价值有限：
- ❌ 无resume功能
- ❌ 存在权限问题
- ✅ 仅可作为历史记录导入

建议将Qoder CLI提升到第一优先级，与Gemini/Qwen并列为核心支持的CLI工具。