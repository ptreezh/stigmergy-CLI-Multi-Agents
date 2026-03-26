# Interactive Mode Design Document

## 文档信息
- **版本**: 1.0.0
- **状态**: Draft
- **创建日期**: 2026-01-15
- **作者**: Stigmergy CLI Team

## 1. 架构设计

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Stigmergy CLI                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Interactive Mode Controller                   │  │
│  │  - Command Parser                                     │  │
│  │  - Session Manager                                    │  │
│  │  - Context Manager                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Task Orchestrator                            │  │
│  │  - Intent Router                                      │  │
│  │  - Delegation Manager                                 │  │
│  │  - Terminal Manager                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐              │
│         ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Terminal   │  │   Terminal   │  │   Terminal   │      │
│  │  Manager     │  │  Manager     │  │  Manager     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                 │              │
│         ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Terminal 1  │  │  Terminal 2  │  │  Terminal 3  │      │
│  │  (claude)    │  │  (qwen)      │  │  (iflow)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

#### 1.2.1 InteractiveModeController
**职责**: 控制交互式对话模式
```javascript
class InteractiveModeController {
  constructor(options) {
    this.sessionManager = new SessionManager();
    this.contextManager = new ContextManager();
    this.commandParser = new CommandParser();
    this.taskOrchestrator = new TaskOrchestrator();
  }
  
  // 启动交互模式
  async start() {
    this._displayWelcome();
    this._enterCommandLoop();
  }
  
  // 命令循环
  async _enterCommandLoop() {
    while (this.sessionManager.isActive()) {
      const input = await this._readInput();
      const command = this.commandParser.parse(input);
      await this._executeCommand(command);
    }
  }
  
  // 执行命令
  async _executeCommand(command) {
    switch (command.type) {
      case 'task':
        return await this.taskOrchestrator.execute(command);
      case 'terminal':
        return await this._manageTerminals(command);
      case 'delegate':
        return await this._delegateTask(command);
      case 'exit':
        return await this._exit();
    }
  }
}
```

#### 1.2.2 TaskOrchestrator
**职责**: 协调任务执行和委托
```javascript
class TaskOrchestrator {
  constructor() {
    this.intentRouter = new IntentRouter();
    this.delegationManager = new DelegationManager();
    this.terminalManager = new TerminalManager();
    this.progressMonitor = new ProgressMonitor();
  }
  
  // 执行任务
  async execute(task) {
    // 1. 分析意图
    const intent = await this.intentRouter.route(task);
    
    // 2. 创建终端
    const terminal = await this.terminalManager.createTerminal(
      intent.targetCLI,
      task
    );
    
    // 3. 执行任务
    try {
      const result = await this._executeInTerminal(terminal, task);
      return result;
    } catch (error) {
      // 4. 失败委托
      return await this.delegationManager.delegate(
        task,
        intent.targetCLI,
        error
      );
    }
  }
  
  // 在终端中执行
  async _executeInTerminal(terminal, task) {
    return await terminal.executeInteractively(task);
  }
}
```

#### 1.2.3 DelegationManager
**职责**: 管理任务委托
```javascript
class DelegationManager {
  constructor() {
    this.delegationRules = this._loadDelegationRules();
    this.delegationHistory = [];
  }
  
  // 委托任务
  async delegate(task, failedCLI, error) {
    // 1. 分析失败原因
    const failureReason = this._analyzeFailure(error);
    
    // 2. 获取替代CLI列表
    const alternatives = this._getAlternatives(
      failedCLI,
      failureReason
    );
    
    // 3. 尝试替代CLI
    for (const alternative of alternatives) {
      try {
        const result = await this._executeWithCLI(
          alternative,
          task
        );
        
        // 记录成功委托
        this._recordDelegation(task, failedCLI, alternative, true);
        
        return {
          success: true,
          delegatedTo: alternative,
          result: result
        };
      } catch (altError) {
        console.warn(`Alternative ${alternative} also failed:`, altError.message);
        continue;
      }
    }
    
    // 所有替代都失败
    this._recordDelegation(task, failedCLI, null, false);
    
    return {
      success: false,
      error: 'All alternatives failed',
      attempted: alternatives
    };
  }
  
  // 分析失败原因
  _analyzeFailure(error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network-error';
    } else if (errorMessage.includes('token') || errorMessage.includes('limit')) {
      return 'token-limit';
    } else if (errorMessage.includes('timeout')) {
      return 'timeout';
    } else if (errorMessage.includes('api') || errorMessage.includes('rate')) {
      return 'api-error';
    } else {
      return 'unknown-error';
    }
  }
  
  // 获取替代CLI
  _getAlternatives(failedCLI, failureReason) {
    const rule = this.delegationRules[failureReason];
    return rule.priority.filter(cli => cli !== failedCLI);
  }
}
```

#### 1.2.4 TerminalManager
**职责**: 管理终端窗口
```javascript
class TerminalManager {
  constructor() {
    this.terminals = new Map();
    this.maxTerminals = 5;
    this.terminalFactory = new TerminalFactory();
  }
  
  // 创建终端
  async createTerminal(cliName, task) {
    // 检查并发限制
    if (this.terminals.size >= this.maxTerminals) {
      throw new Error('Maximum terminals reached');
    }
    
    // 创建终端
    const terminal = await this.terminalFactory.create(cliName, task);
    
    // 注册终端
    this.terminals.set(terminal.id, terminal);
    
    // 监听终端事件
    terminal.on('output', (data) => {
      this._handleTerminalOutput(terminal.id, data);
    });
    
    terminal.on('close', () => {
      this._handleTerminalClose(terminal.id);
    });
    
    return terminal;
  }
  
  // 列出终端
  listTerminals() {
    return Array.from(this.terminals.values());
  }
  
  // 获取终端状态
  getTerminalStatus(terminalId) {
    return this.terminals.get(terminalId);
  }
  
  // 关闭终端
  async closeTerminal(terminalId) {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      await terminal.close();
      this.terminals.delete(terminalId);
    }
  }
  
  // 处理终端输出
  _handleTerminalOutput(terminalId, data) {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.output.push(data);
      terminal.lastOutputTime = Date.now();
    }
  }
  
  // 处理终端关闭
  _handleTerminalClose(terminalId) {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.status = 'closed';
      terminal.closedAt = Date.now();
    }
  }
}
```

#### 1.2.5 Terminal
**职责**: 代表一个终端窗口
```javascript
class Terminal extends EventEmitter {
  constructor(id, cliName, task, options = {}) {
    super();
    
    this.id = id;
    this.cliName = cliName;
    this.task = task;
    this.status = 'starting';
    this.createdAt = Date.now();
    this.output = [];
    this.lastOutputTime = Date.now();
    this.process = null;
    
    this.options = {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      timeout: options.timeout || 300000,
      ...options
    };
  }
  
  // 交互式执行
  async executeInteractively(task) {
    this.status = 'running';
    
    // 启动CLI交互模式
    this.process = spawn(this.cliName, ['-i'], {
      cwd: this.options.cwd,
      env: this.options.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 监听输出
    this.process.stdout.on('data', (data) => {
      const output = data.toString();
      this.output.push(output);
      this.lastOutputTime = Date.now();
      this.emit('output', output);
    });
    
    // 监听错误
    this.process.stderr.on('data', (data) => {
      const error = data.toString();
      this.output.push({ type: 'error', data: error });
      this.emit('error', error);
    });
    
    // 发送任务
    this.process.stdin.write(task + '\n');
    
    // 等待响应
    const response = await this._waitForResponse();
    
    return response;
  }
  
  // 等待响应
  async _waitForResponse() {
    return new Promise((resolve, reject) => {
      let response = '';
      let timeoutId;
      
      const outputHandler = (data) => {
        response += data;
        
        // 检测响应完成
        if (this._isResponseComplete(response)) {
          cleanup();
          resolve(response);
        }
      };
      
      const errorHandler = (error) => {
        cleanup();
        reject(error);
      };
      
      const cleanup = () => {
        this.process.stdout.off('data', outputHandler);
        this.process.stderr.off('data', errorHandler);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      this.process.stdout.on('data', outputHandler);
      this.process.stderr.on('data', errorHandler);
      
      // 超时处理
      timeoutId = setTimeout(() => {
        cleanup();
        this.kill();
        reject(new Error('Terminal timeout'));
      }, this.options.timeout);
    });
  }
  
  // 检测响应完成
  _isResponseComplete(response) {
    // 检测CLI提示符
    const promptPatterns = [
      /claude: /i,
      /qwen: /i,
      /iflow: /i,
      /codebuddy: /i,
      /copilot: /i,
      />\s*$/,
      /\$\s*$/
    ];
    
    return promptPatterns.some(pattern => pattern.test(response.slice(-50)));
  }
  
  // 终止终端
  kill() {
    if (this.process) {
      this.process.kill();
      this.status = 'killed';
    }
  }
  
  // 关闭终端
  async close() {
    this.kill();
    this.status = 'closed';
  }
}
```

#### 1.2.6 TerminalFactory
**职责**: 创建终端实例
```javascript
class TerminalFactory {
  constructor() {
    this.terminalCounter = 0;
  }
  
  // 创建终端
  async create(cliName, task, options = {}) {
    const terminalId = this._generateTerminalId();
    
    const terminal = new Terminal(
      terminalId,
      cliName,
      task,
      options
    );
    
    return terminal;
  }
  
  // 生成终端ID
  _generateTerminalId() {
    return `terminal-${++this.terminalCounter}-${Date.now()}`;
  }
}
```

## 2. 数据流设计

### 2.1 交互模式启动流程

```
用户启动stigmergy
    ↓
InteractiveModeController.start()
    ↓
显示欢迎信息
    ↓
进入命令循环
    ↓
等待用户输入
    ↓
解析命令
    ↓
执行命令
    ↓
返回结果
    ↓
继续循环
```

### 2.2 任务执行流程

```
用户输入任务
    ↓
CommandParser解析
    ↓
IntentRouter路由
    ↓
选择目标CLI
    ↓
TerminalManager创建终端
    ↓
Terminal.executeInteractively()
    ↓
监听输出
    ↓
返回结果
    ↓
关闭终端
```

### 2.3 委托流程

```
任务执行失败
    ↓
DelegationManager.delegate()
    ↓
分析失败原因
    ↓
获取替代CLI列表
    ↓
依次尝试替代CLI
    ↓
成功则返回结果
    ↓
失败则继续下一个
    ↓
全部失败则返回错误
```

## 3. 接口设计

### 3.1 InteractiveModeController接口

```javascript
class InteractiveModeController {
  // 启动交互模式
  async start(): Promise<void>
  
  // 停止交互模式
  async stop(): Promise<void>
  
  // 执行命令
  async executeCommand(command: Command): Promise<Result>
  
  // 获取会话信息
  getSessionInfo(): SessionInfo
  
  // 获取上下文
  getContext(): Context
}
```

### 3.2 TaskOrchestrator接口

```javascript
class TaskOrchestrator {
  // 执行任务
  async execute(task: Task): Promise<TaskResult>
  
  // 委托任务
  async delegate(task: Task, failedCLI: string, error: Error): Promise<DelegationResult>
  
  // 获取执行状态
  getExecutionStatus(taskId: string): ExecutionStatus
  
  // 取消任务
  async cancelTask(taskId: string): Promise<void>
}
```

### 3.3 TerminalManager接口

```javascript
class TerminalManager {
  // 创建终端
  async createTerminal(cliName: string, task: Task): Promise<Terminal>
  
  // 列出终端
  listTerminals(): Terminal[]
  
  // 获取终端状态
  getTerminalStatus(terminalId: string): TerminalStatus
  
  // 关闭终端
  async closeTerminal(terminalId: string): Promise<void>
  
  // 获取终端输出
  getTerminalOutput(terminalId: string): string[]
}
```

## 4. 配置设计

### 4.1 交互模式配置

```javascript
const interactiveModeConfig = {
  // 会话配置
  session: {
    maxHistory: 100,
    autoSave: true,
    saveInterval: 60000 // 1分钟
  },
  
  // 终端配置
  terminal: {
    maxTerminals: 5,
    defaultTimeout: 300000, // 5分钟
    autoCleanup: true,
    cleanupInterval: 300000 // 5分钟
  },
  
  // 委托配置
  delegation: {
    enabled: true,
    maxAttempts: 3,
    fallbackStrategy: 'priority'
  },
  
  // 进度配置
  progress: {
    enabled: true,
    updateInterval: 2000, // 2秒
    showTerminalStatus: true
  }
};
```

### 4.2 委托规则配置

```javascript
const delegationRules = {
  'network-error': {
    priority: ['qwen', 'iflow', 'claude', 'codebuddy'],
    reason: 'Network connectivity issues',
    maxRetries: 2
  },
  'token-limit': {
    priority: ['codebuddy', 'iflow', 'qwen', 'claude'],
    reason: 'Token limit exceeded',
    maxRetries: 3
  },
  'timeout': {
    priority: ['claude', 'qwen', 'iflow', 'codebuddy'],
    reason: 'Execution timeout',
    maxRetries: 1
  },
  'api-error': {
    priority: ['iflow', 'qwen', 'claude', 'codebuddy'],
    reason: 'API error',
    maxRetries: 2
  }
};
```

## 5. 错误处理设计

### 5.1 错误分类

```javascript
const ErrorTypes = {
  TERMINAL_ERROR: 'terminal-error',
  CLI_ERROR: 'cli-error',
  DELEGATION_ERROR: 'delegation-error',
  TIMEOUT_ERROR: 'timeout-error',
  NETWORK_ERROR: 'network-error',
  TOKEN_LIMIT_ERROR: 'token-limit-error'
};
```

### 5.2 错误处理策略

```javascript
class ErrorHandler {
  async handleError(error, context) {
    switch (error.type) {
      case ErrorTypes.TERMINAL_ERROR:
        return await this._handleTerminalError(error, context);
      case ErrorTypes.CLI_ERROR:
        return await this._handleCLIError(error, context);
      case ErrorTypes.DELEGATION_ERROR:
        return await this._handleDelegationError(error, context);
      default:
        return await this._handleUnknownError(error, context);
    }
  }
  
  async _handleTerminalError(error, context) {
    // 终端错误处理策略
    // 1. 尝试重启终端
    // 2. 如果失败，委托给其他CLI
    // 3. 如果都失败，返回错误
  }
}
```

## 6. 性能优化设计

### 6.1 终端池化

```javascript
class TerminalPool {
  constructor(maxSize = 5) {
    this.pool = [];
    this.maxSize = maxSize;
  }
  
  // 获取终端
  async acquire(cliName, task) {
    // 1. 检查池中是否有可用终端
    // 2. 如果有，复用
    // 3. 如果没有，创建新终端
    // 4. 如果达到上限，等待
  }
  
  // 释放终端
  release(terminal) {
    // 1. 清理终端状态
    // 2. 放回池中
  }
}
```

### 6.2 输出缓冲

```javascript
class OutputBuffer {
  constructor(maxSize = 1000) {
    this.buffer = [];
    this.maxSize = maxSize;
  }
  
  // 添加输出
  add(output) {
    this.buffer.push(output);
    
    // 限制缓冲区大小
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }
  
  // 获取输出
  get(count = 100) {
    return this.buffer.slice(-count);
  }
}
```

## 7. 测试设计

### 7.1 单元测试

```javascript
describe('InteractiveModeController', () => {
  test('should start interactive mode', async () => {
    const controller = new InteractiveModeController();
    await controller.start();
    expect(controller.isActive()).toBe(true);
  });
  
  test('should execute task', async () => {
    const controller = new InteractiveModeController();
    const result = await controller.executeCommand({
      type: 'task',
      task: 'test task'
    });
    expect(result.success).toBe(true);
  });
});
```

### 7.2 集成测试

```javascript
describe('Task Execution Flow', () => {
  test('should execute task with delegation', async () => {
    const orchestrator = new TaskOrchestrator();
    const result = await orchestrator.execute({
      task: 'complex task',
      allowDelegation: true
    });
    expect(result.success).toBe(true);
  });
});
```

## 8. 部署设计

### 8.1 配置文件

```json
{
  "interactiveMode": {
    "enabled": true,
    "maxTerminals": 5,
    "defaultTimeout": 300000,
    "delegation": {
      "enabled": true,
      "maxAttempts": 3
    }
  }
}
```

### 8.2 环境变量

```bash
STIGMERGY_INTERACTIVE_MODE=true
STIGMERGY_MAX_TERMINALS=5
STIGMERGY_DEFAULT_TIMEOUT=300000
STIGMERGY_DELEGATION_ENABLED=true
```

## 9. 监控设计

### 9.1 指标收集

```javascript
class MetricsCollector {
  collectMetrics() {
    return {
      terminals: {
        total: this.terminalManager.listTerminals().length,
        active: this.terminalManager.listTerminals().filter(t => t.status === 'running').length,
        failed: this.terminalManager.listTerminals().filter(t => t.status === 'failed').length
      },
      delegations: {
        total: this.delegationManager.getHistory().length,
        successful: this.delegationManager.getHistory().filter(d => d.success).length,
        failed: this.delegationManager.getHistory().filter(d => !d.success).length
      },
      performance: {
        avgExecutionTime: this._calculateAvgExecutionTime(),
        avgDelegationTime: this._calculateAvgDelegationTime()
      }
    };
  }
}
```

### 9.2 日志记录

```javascript
class Logger {
  log(level, message, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
    
    // 写入日志文件
    this._writeToFile(logEntry);
    
    // 发送到监控系统
    this._sendToMonitoring(logEntry);
  }
}
```

## 10. 安全设计

### 10.1 权限控制

```javascript
class PermissionManager {
  canCreateTerminal(user) {
    // 检查用户权限
    return user.permissions.includes('terminal:create');
  }
  
  canDelegateTask(user, task) {
    // 检查委托权限
    return user.permissions.includes('task:delegate');
  }
}
```

### 10.2 输入验证

```javascript
class InputValidator {
  validateCommand(command) {
    // 验证命令格式
    // 检查恶意输入
    // 清理特殊字符
    return true;
  }
}
```

---
*设计版本*: 1.0.0  
*最后更新*: 2026-01-15  
*状态*: Draft  
*审批*: Pending