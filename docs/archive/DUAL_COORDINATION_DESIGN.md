# 双重协调层设计文档

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 双重协调层设计文档 |
| 文档版本 | 1.0.0 |
| 创建日期 | 2026-01-15 |
| 作者 | Stigmergy Team |
| 状态 | 草稿 |

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Stigmergy CLI Interface                        │
│                        (Stigmergy CLI 接口)                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Coordination Layer Manager                        │
│                      (协调层管理器)                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Coordination Layer Selector                       │    │
│  │                 (协调层选择器)                                 │    │
│  │  - Python Detection (Python 检测)                            │    │
│  │  - Layer Selection (层选择)                                  │    │
│  │  - Fallback Logic (降级逻辑)                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  Node.js Layer      │ │  Python Layer       │ │  Fallback Layer     │
│  (Node.js 协调层)   │ │  (Python 协调层)    │ │  (备用协调层)        │
│  - Primary (主要)    │ │  - Fallback (备用)  │ │  - Emergency (紧急)  │
│  ┌───────────────┐   │ │  ┌───────────────┐   │ │  ┌───────────────┐   │
│  │ Adapter Mgr   │   │ │  │ Process Mgr   │   │ │  │ Simple Tasks  │   │
│  │ Communication│   │ │  │ IPC Bridge    │   │ │  │ Limited Func  │   │
│  │ Statistics    │   │ │  │ Python Wrapper│   │ │  └───────────────┘   │
│  │ Health Check  │   │ │  └───────────────┘   │ │                       │
│  └───────────────┘   │ │                       │ │                       │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CLI Tools Layer                                 │
│                      (CLI 工具层)                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Claude  │  │   Qwen   │  │   iFlow  │  │  Codex   │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐                                          │
│  │CodeBuddy │  │ QoderCLI │                                          │
│  └──────────┘  └──────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件设计

#### 2.2.1 Coordination Layer Manager（协调层管理器）

**职责**：
- 管理协调层生命周期
- 选择和切换协调层
- 处理降级逻辑
- 提供统一的协调层接口

**接口**：
```typescript
interface CoordinationLayerManager {
  initialize(): Promise<boolean>;
  selectLayer(): Promise<CoordinationLayer>;
  switchLayer(layerType: LayerType): Promise<void>;
  executeCrossCLITask(sourceCLI: string, targetCLI: string, task: string): Promise<string>;
  getSystemStatus(): Promise<SystemStatus>;
  healthCheck(): Promise<boolean>;
}
```

**状态机**：
```
[Uninitialized] → [Initializing] → [Ready]
                                      ↓
                                 [Error]
                                      ↓
                                  [Fallback]
```

#### 2.2.2 Coordination Layer Selector（协调层选择器）

**职责**：
- 检测 Python 可用性
- 根据配置选择协调层
- 处理选择逻辑

**选择策略**：
```typescript
enum SelectionStrategy {
  AUTO = 'auto',           // 自动选择（优先 Node.js）
  NODEJS_ONLY = 'nodejs', // 仅 Node.js
  PYTHON_ONLY = 'python', // 仅 Python
  PREFER_NODEJS = 'prefer-nodejs',  // 优先 Node.js
  PREFER_PYTHON = 'prefer-python'   // 优先 Python
}
```

**选择逻辑**：
```
function selectLayer(strategy: SelectionStrategy): CoordinationLayer {
  switch (strategy) {
    case SelectionStrategy.AUTO:
      return isPythonAvailable() ? nodejsLayer : nodejsLayer;
    case SelectionStrategy.NODEJS_ONLY:
      return nodejsLayer;
    case SelectionStrategy.PYTHON_ONLY:
      return pythonLayer;
    case SelectionStrategy.PREFER_NODEJS:
      return nodejsLayer.isHealthy() ? nodejsLayer : pythonLayer;
    case SelectionStrategy.PREFER_PYTHON:
      return pythonLayer.isHealthy() ? pythonLayer : nodejsLayer;
  }
}
```

#### 2.2.3 Node.js Coordination Layer（Node.js 协调层）

**职责**：
- 实现跨 CLI 通信
- 管理适配器
- 收集统计信息
- 健康检查

**架构**：
```
NodeJsCoordinationLayer
├── AdapterManager (适配器管理器)
│   ├── ClaudeAdapter
│   ├── QwenAdapter
│   ├── iFlowAdapter
│   ├── CodexAdapter
│   ├── CodeBuddyAdapter
│   └── QoderCLIAdapter
├── CLCommunication (跨 CLI 通信)
│   ├── TaskDispatcher (任务分发器)
│   ├── ResultCollector (结果收集器)
│   └── EventPublisher (事件发布器)
├── StatisticsCollector (统计收集器)
│   ├── TaskStats (任务统计)
│   ├── PerformanceStats (性能统计)
│   └── ErrorStats (错误统计)
└── HealthChecker (健康检查器)
    ├── LayerHealth (层健康)
    ├── AdapterHealth (适配器健康)
    └── SystemHealth (系统健康)
```

**核心接口**：
```typescript
interface NodeJsCoordinationLayer extends CoordinationLayer {
  adapterManager: AdapterManager;
  communication: CLCommunication;
  statistics: StatisticsCollector;
  healthChecker: HealthChecker;
  
  async initialize(): Promise<boolean>;
  async executeCrossCLITask(sourceCLI: string, targetCLI: string, task: string): Promise<string>;
  async getAdapterStatistics(cliName: string): Promise<AdapterStatistics>;
  async getSystemStatus(): Promise<SystemStatus>;
  async healthCheck(): Promise<boolean>;
}
```

#### 2.2.4 Python Coordination Layer（Python 协调层）

**职责**：
- 包装现有 Python 协调层
- 提供 Node.js 兼容接口
- 管理 Python 进程
- 处理进程间通信

**架构**：
```
PythonCoordinationLayer
├── PythonProcessManager (Python 进程管理器)
│   ├── ProcessLauncher (进程启动器)
│   ├── ProcessMonitor (进程监控器)
│   └── ProcessTerminator (进程终止器)
├── IPCBridge (进程间通信桥)
│   ├── MessageSender (消息发送器)
│   ├── MessageReceiver (消息接收器)
│   └── MessageSerializer (消息序列化器)
└── PythonInterfaceAdapter (Python 接口适配器)
    ├── RequestAdapter (请求适配器)
    ├── ResponseAdapter (响应适配器)
    └── ErrorAdapter (错误适配器)
```

**核心接口**：
```typescript
interface PythonCoordinationLayer extends CoordinationLayer {
  processManager: PythonProcessManager;
  ipcBridge: IPCBridge;
  interfaceAdapter: PythonInterfaceAdapter;
  
  async initialize(): Promise<boolean>;
  async executeCrossCLITask(sourceCLI: string, targetCLI: string, task: string): Promise<string>;
  async getAdapterStatistics(cliName: string): Promise<AdapterStatistics>;
  async getSystemStatus(): Promise<SystemStatus>;
  async healthCheck(): Promise<boolean>;
}
```

### 2.3 数据流设计

#### 2.3.1 任务执行流程

```
User Request
    ↓
Coordination Layer Manager
    ↓
Coordination Layer Selector
    ↓
Node.js / Python Coordination Layer
    ↓
Adapter Manager
    ↓
Target CLI Adapter
    ↓
CLI Tool Execution
    ↓
Result Collection
    ↓
Response to User
```

#### 2.3.2 降级切换流程

```
Health Check Failure
    ↓
Error Detection
    ↓
Fallback Trigger
    ↓
Layer Switch
    ↓
New Layer Initialization
    ↓
Service Recovery
    ↓
User Notification (Optional)
```

### 2.4 状态机设计

#### 2.4.1 协调层状态机

```
┌─────────────┐
│ Uninitialized│
└──────┬──────┘
       │ initialize()
       ▼
┌─────────────┐
│ Initializing │
└──────┬──────┘
       │ success
       ▼
┌─────────────┐
│    Ready    │◄────┐
└──────┬──────┘     │
       │ error      │
       ▼            │ recover()
┌─────────────┐     │
│   Error     │─────┘
└──────┬──────┘
       │ fallback()
       ▼
┌─────────────┐
│   Fallback  │
└─────────────┘
```

#### 2.4.2 任务状态机

```
┌─────────────┐
│   Pending   │
└──────┬──────┘
       │ start()
       ▼
┌─────────────┐
│ In Progress │
└──────┬──────┘
       │ complete() / fail()
       ▼
┌─────────────┐
│  Completed  │
└─────────────┘
```

### 2.5 并发控制设计

#### 2.5.1 任务队列

```typescript
class TaskQueue {
  private queue: Task[] = [];
  private processing: Set<string> = new Set();
  private maxConcurrent: number = 10;
  
  async enqueue(task: Task): Promise<void>;
  async dequeue(): Promise<Task | null>;
  async complete(taskId: string): Promise<void>;
  getQueueStatus(): QueueStatus;
}
```

#### 2.5.2 资源池

```typescript
class ResourcePool<T> {
  private available: T[] = [];
  private inUse: Map<string, T> = new Map();
  
  async acquire(): Promise<T>;
  async release(resource: T): Promise<void>;
  getPoolStatus(): PoolStatus;
}
```

### 2.6 错误处理设计

#### 2.6.1 错误类型

```typescript
enum ErrorType {
  INITIALIZATION_ERROR = 'initialization_error',
  COMMUNICATION_ERROR = 'communication_error',
  ADAPTER_ERROR = 'adapter_error',
  HEALTH_CHECK_ERROR = 'health_check_error',
  FALLBACK_ERROR = 'fallback_error'
}

class CoordinationError extends Error {
  type: ErrorType;
  layer: LayerType;
  timestamp: Date;
  context: any;
}
```

#### 2.6.2 错误恢复策略

```typescript
enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  ABORT = 'abort',
  NOTIFY = 'notify'
}

function handleError(error: CoordinationError): RecoveryStrategy {
  switch (error.type) {
    case ErrorType.INITIALIZATION_ERROR:
      return RecoveryStrategy.FALLBACK;
    case ErrorType.COMMUNICATION_ERROR:
      return RecoveryStrategy.RETRY;
    case ErrorType.HEALTH_CHECK_ERROR:
      return RecoveryStrategy.FALLBACK;
    default:
      return RecoveryStrategy.ABORT;
  }
}
```

### 2.7 安全设计

#### 2.7.1 进程隔离

- Node.js 协调层运行在主进程
- Python 协调层运行在独立子进程
- 进程间通信使用安全的 IPC 机制

#### 2.7.2 数据验证

```typescript
function validateTask(task: any): boolean {
  return (
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.command === 'string' &&
    Array.isArray(task.args)
  );
}
```

#### 2.7.3 访问控制

```typescript
class AccessController {
  private permissions: Map<string, Permission> = new Map();
  
  checkPermission(cliName: string, action: string): boolean;
  grantPermission(cliName: string, action: string): void;
  revokePermission(cliName: string, action: string): void;
}
```

### 2.8 监控和告警设计

#### 2.8.1 监控指标

```typescript
interface MonitoringMetrics {
  layerHealth: LayerHealthMetrics;
  taskPerformance: TaskPerformanceMetrics;
  resourceUsage: ResourceUsageMetrics;
  errorRate: ErrorRateMetrics;
}
```

#### 2.8.2 告警规则

```typescript
interface AlertRule {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '==' | '>=';
  action: AlertAction;
}

function checkAlerts(metrics: MonitoringMetrics): Alert[] {
  // 检查所有告警规则
  // 返回触发的告警列表
}
```

## 3. 接口定义

### 3.1 协调层接口

```typescript
interface CoordinationLayer {
  // 初始化
  initialize(): Promise<boolean>;
  
  // 任务执行
  executeCrossCLITask(sourceCLI: string, targetCLI: string, task: string): Promise<string>;
  
  // 统计信息
  getAdapterStatistics(cliName: string): Promise<AdapterStatistics>;
  getSystemStatus(): Promise<SystemStatus>;
  
  // 健康检查
  healthCheck(): Promise<boolean>;
  
  // 生命周期
  shutdown(): Promise<void>;
}
```

### 3.2 适配器接口

```typescript
interface CLIAdapter {
  name: string;
  version: string;
  
  // 适配器信息
  getInfo(): AdapterInfo;
  
  // 任务执行
  executeTask(task: Task, context: ExecutionContext): Promise<TaskResult>;
  
  // 健康检查
  healthCheck(): Promise<boolean>;
  
  // 统计信息
  getStatistics(): AdapterStatistics;
}
```

### 3.3 通信接口

```typescript
interface CLCommunication {
  // 任务分发
  dispatchTask(task: Task, targetCLI: string): Promise<TaskResult>;
  
  // 结果收集
  collectResult(taskId: string): Promise<TaskResult | null>;
  
  // 事件发布
  publishEvent(event: Event): Promise<void>;
  
  // 事件订阅
  subscribeEvent(eventType: string, handler: EventHandler): void;
}
```

## 4. 性能优化设计

### 4.1 缓存策略

```typescript
class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number = 60000; // 60 秒
  
  set(key: string, value: any, ttl?: number): void;
  get(key: string): any | null;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}
```

### 4.2 连接池

```typescript
class ConnectionPool {
  private connections: Connection[] = [];
  private maxConnections: number = 10;
  
  async acquire(): Promise<Connection>;
  async release(connection: Connection): Promise<void>;
  getPoolStatus(): PoolStatus;
}
```

### 4.3 批处理

```typescript
class BatchProcessor {
  private batchSize: number = 100;
  private batchTimeout: number = 1000;
  
  async add(task: Task): Promise<void>;
  async flush(): Promise<TaskResult[]>;
  getBatchStatus(): BatchStatus;
}
```

## 5. 测试策略

### 5.1 单元测试

- Python 检测逻辑测试
- 协调层选择器测试
- Node.js 协调层测试
- Python 协调层测试
- 降级逻辑测试

### 5.2 集成测试

- 协调层切换测试
- 跨 CLI 通信测试
- 适配器集成测试
- 端到端流程测试

### 5.3 性能测试

- 启动时间测试
- 内存占用测试
- 响应时间测试
- 并发处理测试

## 6. 部署设计

### 6.1 安装流程

```
1. 检测 Node.js 环境
2. 安装 Node.js 依赖
3. 检测 Python 环境（可选）
4. 安装 Python 依赖（如果 Python 可用）
5. 配置协调层选择策略
6. 验证安装
```

### 6.2 配置管理

```json
{
  "coordinationLayer": {
    "strategy": "auto",
    "preferredLayer": "nodejs",
    "fallbackEnabled": true,
    "pythonDetection": {
      "enabled": true,
      "version": ">=3.8"
    }
  }
}
```

## 7. 维护设计

### 7.1 日志管理

```typescript
class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
}
```

### 7.2 监控和告警

```typescript
class Monitor {
  private metrics: MonitoringMetrics;
  private alertRules: AlertRule[];
  
  collectMetrics(): MonitoringMetrics;
  checkAlerts(): Alert[];
  sendAlert(alert: Alert): void;
}
```

### 7.3 故障恢复

```typescript
class RecoveryManager {
  private recoveryStrategies: Map<ErrorType, RecoveryStrategy> = new Map();
  
  async recover(error: CoordinationError): Promise<boolean>;
  registerStrategy(errorType: ErrorType, strategy: RecoveryStrategy): void;
}
```

## 8. 附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| 协调层 | 负责 CLI 工具间通信和协调的组件 |
| 降级 | 系统在首选实现不可用时切换到备用实现 |
| 适配器 | 封装 CLI 工具接口的组件 |
| IPC | 进程间通信 |

### 8.2 参考资料

1. SPECKIT Specification
2. Dual Coordination Layer Requirements
3. TDD Implementation Plan
4. Node.js Coordination Layer Design

### 8.3 变更历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0.0 | 2026-01-15 | Stigmergy Team | 初始版本 |