# 混合上下文管理方案 - 设计文档

## 概述

本文档描述了用于 Stigmergy 多 AI CLI 协作系统的混合上下文管理方案，旨在解决以下问题：

1. **CLI 切换后无法保持交互模式**
2. **每次交互都是全新对话，无上下文连贯性**
3. **跨 CLI 上下文无法共享**

## 架构设计

### 三层架构

```
┌─────────────────────────────────────────────────────────┐
│              Stigmergy Context Layer                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Layer 3: Context Broker (上下文经纪人)          │  │
│  │  - 统一上下文格式                                │  │
│  │  - CLI 间上下文转换                              │  │
│  │  - 上下文过滤和聚合                              │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Layer 2: Persistent Pool (持久进程池)           │  │
│  │  - 管理长期运行的 CLI 进程                        │  │
│  │  - 保持内存中的会话状态                           │  │
│  │  - 提供快速交互响应                               │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Layer 1: File History (文件历史存储)            │  │
│  │  - 持久化对话历史到磁盘                           │  │
│  │  - 跨会话上下文恢复                               │  │
│  │  - 崩溃恢复                                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Context Broker (上下文经纪人)

**职责**：
- 维护统一的上下文格式
- 处理 CLI 间的上下文转换
- 提供上下文查询和过滤 API

**数据结构**：
```javascript
class UnifiedContext {
  constructor() {
    this.metadata = {
      sessionId: uuid(),
      startTime: Date.now(),
      lastUpdate: Date.now(),
      currentCLI: null
    };

    this.conversations = {
      // 每个CLI的对话历史
      qwen: { messages: [], summary: '' },
      iflow: { messages: [], summary: '' },
      claude: { messages: [], summary: '' },
      // ...
    };

    this.sharedMemory = {
      // 跨CLI共享的变量和状态
      projectContext: {},
      taskHistory: [],
      decisions: [],
      artifacts: []
    };

    this.crossCLIReferences = {
      // CLI间的引用关系
      'qwen->iflow': [],
      'iflow->claude': [],
      // ...
    };
  }
}
```

**核心方法**：
```javascript
class ContextBroker {
  // 获取特定CLI的上下文（包含跨CLI引用）
  async getContextForCLI(cliName, options = {}) {
    const {
      includeHistory = true,      // 包含历史对话
      includeCrossRef = true,     // 包含跨CLI引用
      maxHistoryItems = 10,       // 最大历史条目数
      summaryOnly = false         // 仅摘要模式
    } = options;

    let context = {
      currentCLI: cliName,
      messages: [],
      crossCLIContext: [],
      sharedMemory: this.sharedMemory
    };

    // 1. 获取该CLI的历史对话
    if (includeHistory) {
      const history = this.conversations[cliName]?.messages || [];
      context.messages = summaryOnly
        ? this._summarizeHistory(history)
        : history.slice(-maxHistoryItems);
    }

    // 2. 获取相关的跨CLI上下文
    if (includeCrossRef) {
      context.crossCLIContext = this._getRelevantCrossCLIContext(cliName);
    }

    return context;
  }

  // 添加消息到特定CLI的上下文
  async addMessage(cliName, message, role = 'user') {
    if (!this.conversations[cliName]) {
      this.conversations[cliName] = { messages: [], summary: '' };
    }

    const msg = {
      role,
      content: message,
      timestamp: Date.now(),
      cli: cliName
    };

    this.conversations[cliName].messages.push(msg);
    this.metadata.lastUpdate = Date.now();

    // 触发持久化
    await this._persistToFile();
  }

  // 记录跨CLI引用
  async recordCrossCLIReference(fromCLI, toCLI, taskId) {
    const refKey = `${fromCLI}->${toCLI}`;
    if (!this.crossCLIReferences[refKey]) {
      this.crossCLIReferences[refKey] = [];
    }

    this.crossCLIReferences[refKey].push({
      timestamp: Date.now(),
      taskId,
      fromCLI,
      toCLI
    });
  }

  // 生成上下文摘要（用于注入到CLI）
  generateContextSummary(cliName) {
    const context = this.getContextForCLI(cliName, {
      maxHistoryItems: 5,
      summaryOnly: true
    });

    return `
# Stigmergy Cross-CLI Context

## Current Session
- Session ID: ${this.metadata.sessionId}
- Started: ${new Date(this.metadata.startTime).toISOString()}
- Current CLI: ${cliName}

## Recent Conversation with ${cliName}
${context.messages.map(m => `[${m.role}]: ${m.content}`).join('\n')}

## Cross-CLI Context
${context.crossCLIContext.map(ctx => `- From ${ctx.cli}: ${ctx.summary}`).join('\n')}

## Shared Memory
${JSON.stringify(context.sharedMemory, null, 2)}
    `.trim();
  }
}
```

### 2. Persistent Pool (持久进程池)

**职责**：
- 管理长期运行的 CLI 进程
- 保持进程的交互状态
- 提供进程健康检查和重启机制

**数据结构**：
```javascript
class PersistentCLIPool {
  constructor() {
    this.processes = {}; // { cliName: CLIProcess }
    this.processConfig = {
      qwen: {
        command: 'qwen',
        interactiveArgs: [], // qwen 默认就是交互模式
        prompt: 'qwen> ',
        timeout: 30000
      },
      iflow: {
        command: 'iflow',
        interactiveArgs: [], // iflow 默认就是交互模式
        prompt: 'iflow> ',
        timeout: 30000
      },
      claude: {
        command: 'claude',
        interactiveArgs: [],
        prompt: 'claude> ',
        timeout: 30000
      }
      // ...
    };
  }

  // 获取或创建CLI进程
  async getCLIClient(cliName) {
    // 如果进程已存在且健康，直接返回
    if (this.processes[cliName]?.isHealthy()) {
      return this.processes[cliName];
    }

    // 否则创建新进程
    return await this._createCLIClient(cliName);
  }

  // 创建持久的CLI客户端
  async _createCLIClient(cliName) {
    const config = this.processConfig[cliName];
    if (!config) {
      throw new Error(`Unknown CLI: ${cliName}`);
    }

    console.log(`[POOL] Creating persistent ${cliName} process...`);

    // 使用交互模式启动进程
    const proc = spawn(config.command, config.interactiveArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: process.env
    });

    const client = new CLIProcess(proc, cliName, config);

    // 等待进程启动
    await client.waitForReady();

    // 存储到池中
    this.processes[cliName] = client;

    console.log(`[POOL] ${cliName} process ready (PID: ${proc.pid})`);
    return client;
  }

  // 关闭所有进程
  async shutdownAll() {
    for (const [cliName, client] of Object.entries(this.processes)) {
      console.log(`[POOL] Shutting down ${cliName}...`);
      await client.shutdown();
    }
    this.processes = {};
  }
}
```

**CLI 进程封装**：
```javascript
class CLIProcess {
  constructor(proc, cliName, config) {
    this.proc = proc;
    this.cliName = cliName;
    this.config = config;
    this.ready = false;
    this.messageQueue = [];
    this.responseBuffer = '';

    this._setupIOHandlers();
  }

  _setupIOHandlers() {
    // 处理stdout输出
    this.proc.stdout.on('data', (data) => {
      const output = data.toString();
      this.responseBuffer += output;

      // 检测是否是提示符（表示等待输入）
      if (output.includes(this.config.prompt) ||
          output.includes('>') ||
          output.includes('$')) {
        this.ready = true;
      }
    });

    // 处理stderr
    this.proc.stderr.on('data', (data) => {
      console.error(`[${this.cliName}] ERROR:`, data.toString());
    });

    // 处理进程退出
    this.proc.on('close', (code) => {
      console.log(`[${this.cliName}] Process exited with code ${code}`);
      this.ready = false;
    });
  }

  // 等待进程就绪
  async waitForReady() {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.ready) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  // 发送任务并获取响应
  async execute(task) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${this.cliName} response`));
      }, this.config.timeout);

      // 监听响应
      const onResponse = () => {
        // 检测是否完整响应（检测到提示符）
        if (this.responseBuffer.includes(this.config.prompt)) {
          clearTimeout(timeout);

          // 提取响应内容（去除最后一个提示符）
          const response = this._extractResponse(this.responseBuffer);
          this.responseBuffer = '';

          resolve({
            success: true,
            cli: this.cliName,
            output: response
          });
        } else {
          // 继续等待
          setTimeout(onResponse, 50);
        }
      };

      // 发送任务
      this.proc.stdin.write(task + '\n');

      // 开始监听响应
      onResponse();
    });
  }

  // 检查进程是否健康
  isHealthy() {
    return this.proc && !this.proc.killed && this.ready;
  }

  // 关闭进程
  async shutdown() {
    if (this.proc && !this.proc.killed) {
      this.proc.stdin.write('exit\n');
      setTimeout(() => {
        this.proc.kill();
      }, 1000);
    }
  }

  _extractResponse(buffer) {
    // 移除最后一个提示符及其之前的内容
    const lines = buffer.split('\n');
    // 简单实现：返回除最后一行外的所有内容
    return lines.slice(0, -1).join('\n').trim();
  }
}
```

### 3. File History (文件历史存储)

**职责**：
- 持久化上下文到磁盘
- 支持跨会话恢复
- 提供历史查询接口

**文件结构**：
```
~/.stigmergy/
├── sessions/
│   ├── session-2025-01-26-001.json
│   ├── session-2025-01-26-002.json
│   └── current.json -> session-2025-01-26-002.json
├── cli-contexts/
│   ├── qwen-context.md
│   ├── iflow-context.md
│   └── claude-context.md
└── context-broker.json
```

**实现**：
```javascript
class FileHistoryManager {
  constructor() {
    this.baseDir = path.join(os.homedir(), '.stigmergy');
    this.sessionsDir = path.join(this.baseDir, 'sessions');
    this.contextsDir = path.join(this.baseDir, 'cli-contexts');
  }

  // 保存完整上下文
  async saveContext(context) {
    await this._ensureDirectories();

    const sessionFile = path.join(
      this.sessionsDir,
      `session-${context.metadata.sessionId}.json`
    );

    await fs.writeFile(
      sessionFile,
      JSON.stringify(context, null, 2),
      'utf8'
    );

    // 更新 current.json 软链接
    const currentLink = path.join(this.sessionsDir, 'current.json');
    try {
      await fs.unlink(currentLink);
    } catch {}
    await fs.symlink(sessionFile, currentLink);

    // 为每个CLI生成上下文注入文件
    await this._generateCLIContextFiles(context);
  }

  // 生成CLI特定的上下文文件
  async _generateCLIContextFiles(context) {
    for (const cliName of Object.keys(context.conversations)) {
      const summary = contextBroker.generateContextSummary(cliName);
      const contextFile = path.join(
        this.contextsDir,
        `${cliName}-context.md`
      );

      await fs.writeFile(contextFile, summary, 'utf8');
    }
  }

  // 加载最近的上下文
  async loadRecentContext() {
    const currentLink = path.join(this.sessionsDir, 'current.json');

    try {
      const data = await fs.readFile(currentLink, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // 没有现有上下文，返回新的
      return new UnifiedContext();
    }
  }

  async _ensureDirectories() {
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.mkdir(this.contextsDir, { recursive: true });
  }
}
```

## 集成到 InteractiveModeController

### 修改后的 _executeWithCLI 方法

```javascript
async _executeWithCLI(cliName, task) {
  try {
    // 1. 从持久进程池获取客户端
    const cliClient = await this.persistentPool.getCLIClient(cliName);

    // 2. 从 Context Broker 获取上下文
    const context = await this.contextBroker.getContextForCLI(cliName);

    // 3. 构建增强的任务（包含上下文）
    const enhancedTask = this._buildEnhancedTask(task, context);

    // 4. 执行任务
    console.log(`\n[${cliName}] Executing task...`);
    const result = await cliClient.execute(enhancedTask);

    // 5. 记录响应到上下文
    await this.contextBroker.addMessage(cliName, result.output, 'assistant');

    // 6. 持久化上下文
    await this.fileHistory.saveContext(this.contextBroker.getContext());

    return result;

  } catch (error) {
    console.error(`[${cliName}] Execution failed:`, error.message);

    // 尝试重启进程
    await this.persistentPool.restart(cliName);

    throw error;
  }
}

// 构建增强任务（注入上下文）
_buildEnhancedTask(task, context) {
  // 如果有上下文，添加到任务前
  if (context.messages.length > 0) {
    const contextStr = context.messages
      .slice(-3) // 最近3条
      .map(m => `[${m.role}]: ${m.content}`)
      .join('\n');

    return `
# Previous Context:
${contextStr}

# Current Task:
${task}
    `.trim();
  }

  return task;
}
```

## 使用示例

### 场景1：CLI 切换并保持上下文

```javascript
// 用户在交互模式中
> use qwen
qwen> 分析这个文件
[qwen] 正在分析...

> use iflow
[POOL] 创建持久 iflow 进程...
[CONTEXT] 加载 qwen 的上下文摘要...
iflow> 基于刚才的分析，生成测试用例
[CONTEXT] 注入跨 CLI 上下文：qwen 的分析结果...
[iflow] 正在生成测试用例...
```

### 场景2：跨 CLI 会话恢复

```bash
# 用户关闭 Stigmergy
exit

# 用户重新打开
stigmergy

[CONTEXT] 检测到之前的会话...
[CONTEXT] 恢复上下文：
  - qwen: 15 条消息
  - iflow: 8 条消息
  - claude: 3 条消息
[CONTEXT] 跨 CLI 引用：qwen -> iflow (2次)

> 恢复会话成功！
qwen> 继续
```

## 优势总结

### 1. 上下文连续性 ✅
- 持久进程池保持内存状态
- 文件历史提供持久化存储
- Context Broker 统一管理

### 2. 跨 CLI 协作 ✅
- 支持 CLI 间上下文引用
- 共享内存机制
- 自动上下文转换

### 3. 性能优化 ✅
- 进程复用，减少启动开销
- 增量上下文更新
- 智能上下文过滤

### 4. 可恢复性 ✅
- 进程崩溃自动重启
- 文件持久化
- 会话恢复机制

## 实现计划

### Phase 1: 基础设施
- [ ] 实现 ContextBroker 类
- [ ] 实现 FileHistoryManager 类
- [ ] 更新 CLI 适配器配置

### Phase 2: 持久进程池
- [ ] 实现 PersistentCLIPool 类
- [ ] 实现 CLIProcess 封装
- [ ] 添加进程健康检查

### Phase 3: 集成
- [ ] 更新 InteractiveModeController
- [ ] 实现 _executeWithCLI 新逻辑
- [ ] 添加上下文注入机制

### Phase 4: 测试与优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化

## 总结

这个混合方案结合了三种策略的优势：
1. **持久进程池** 提供实时交互能力
2. **文件历史** 提供长期持久化
3. **Context Broker** 提供统一的上下文管理

这将彻底解决 CLI 切换和上下文连续性的问题。
