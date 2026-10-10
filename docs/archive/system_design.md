# Stigmergy CLI 系统设计文档

## 1. 引言

### 1.1 目的
本文档描述Stigmergy CLI系统的架构设计和技术实现方案，为开发团队提供技术指导。

### 1.2 范围
涵盖系统的整体架构、模块设计、数据流和接口设计。

## 2. 系统架构

### 2.1 总体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    用户输入                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   智能路由系统                              │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │ 关键字识别  │  │ 参数提取    │  │ CLI转发            │  │
│  └─────────────┘  └─────────────┘  └────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 CLI工具执行环境                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 环境变量设置                                           │ │
│  │  ├── STIGMERGY_CONTEXT                               │ │
│  │  ├── STIGMERGY_PROJECT_DIR                           │ │
│  │  ├── STIGMERGY_MEMORY_FILE                           │ │
│  │  └── 其他标准环境变量                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ CLI进程管理                                            │ │
│  │  ├── 进程启动                                          │ │
│  │  ├── 输入输出重定向                                    │ │
│  │  └── 错误处理                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  上下文管理系统                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 全局内存管理                                           │ │
│  │  ├── 内存读取                                          │ │
│  │  ├── 内存更新                                          │ │
│  │  └── 并发控制                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ CLI模式分析                                            │ │
│  │  ├── 帮助信息获取                                      │ │
│  │  ├── 模式解析                                          │ │
│  │  └── 缓存管理                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈
- **运行环境**：Node.js >= 16.0.0
- **核心依赖**：
  - commander：命令行参数解析
  - inquirer：交互式命令行界面
  - chalk：终端着色输出
  - js-yaml：YAML文件处理
- **系统工具**：
  - child_process：CLI工具执行
  - fs/promises：文件系统操作
  - path：路径处理

## 3. 模块设计

### 3.1 智能路由模块 (SmartRouter)

#### 3.1.1 类结构
```javascript
class SmartRouter {
    constructor() {
        this.tools = CLI_TOOLS;  // CLI工具配置
        this.defaultTool = 'claude';  // 默认工具
    }
    
    async smartRoute(userInput) {
        // 实现路由逻辑
    }
    
    extractKeywords(toolName) {
        // 提取工具关键字
    }
}
```

#### 3.1.2 核心方法
- `smartRoute(userInput)`：主路由方法
- `extractKeywords(toolName)`：关键字提取方法

### 3.2 上下文管理模块 (MemoryManager)

#### 3.2.1 类结构
```javascript
class MemoryManager {
    constructor() {
        this.globalMemoryFile = path.join(os.homedir(), '.stigmergy', 'memory.json');
        this.projectMemoryFile = path.join(process.cwd(), 'STIGMERGY.md');
    }
    
    async getGlobalMemory() {
        // 获取全局内存
    }
    
    async updateGlobalMemory(updateFn) {
        // 更新全局内存
    }
}
```

#### 3.2.2 核心方法
- `getGlobalMemory()`：获取全局内存数据
- `updateGlobalMemory(updateFn)`：更新全局内存数据

### 3.3 CLI模式分析模块 (CLIHelpAnalyzer)

#### 3.3.1 类结构
```javascript
class CLIHelpAnalyzer {
    constructor() {
        this.configDir = path.join(os.homedir(), '.stigmergy', 'cli-patterns');
        this.persistentConfig = path.join(this.configDir, 'cli-patterns.json');
        this.cliTools = require('../main_english').CLI_TOOLS || {};
    }
    
    async analyzeCLI(cliName) {
        // 分析CLI工具
    }
    
    async getCLIPattern(cliName) {
        // 获取CLI模式
    }
}
```

#### 3.3.2 核心方法
- `analyzeCLI(cliName)`：分析指定CLI工具
- `getCLIPattern(cliName)`：获取CLI模式信息
- `cacheAnalysis(cliName, analysis)`：缓存分析结果

## 4. 数据设计

### 4.1 全局内存结构
```json
{
  "version": "1.0.0",
  "lastUpdated": "ISO时间戳",
  "interactions": [
    {
      "timestamp": "ISO时间戳",
      "tool": "工具名称",
      "prompt": "用户输入",
      "response": "工具响应",
      "duration": "执行时间(ms)"
    }
  ],
  "collaborations": [
    {
      "sessionId": "会话ID",
      "tools": ["工具列表"],
      "startTime": "开始时间",
      "endTime": "结束时间",
      "interactions": ["交互记录"]
    }
  ]
}
```

### 4.2 CLI模式缓存结构
```json
{
  "version": "1.0.0",
  "lastUpdated": "ISO时间戳",
  "cliPatterns": {
    "工具名称": {
      "success": true,
      "cliName": "工具名称",
      "cliType": "工具类型",
      "version": "版本信息",
      "helpMethod": "帮助命令",
      "patterns": {
        "commands": ["命令列表"],
        "options": ["选项列表"],
        "subcommands": ["子命令列表"]
      },
      "timestamp": "分析时间"
    }
  }
}
```

## 5. 接口设计

### 5.1 命令行接口

#### 5.1.1 主要命令
```bash
# 显示帮助信息
stigmergy --help

# 智能路由执行
stigmergy call "用户指令"

# 检查CLI工具状态
stigmergy status

# 扫描可用CLI工具
stigmergy scan

# 安装缺失的CLI工具
stigmergy install

# 部署钩子和集成
stigmergy deploy

# 完整设置和配置
stigmergy setup
```

#### 5.1.2 环境变量接口
```bash
# 系统设置的标准环境变量
STIGMERGY_ENABLED=true
STIGMERGY_VERSION=版本号
STIGMERGY_PROJECT_DIR=项目目录
STIGMERGY_CONTEXT_FILE=上下文文件路径
STIGMERGY_CLI_PATTERNS=CLI模式文件路径
STIGMERGY_TEMP_DIR=临时目录
```

## 6. 数据流设计

### 6.1 用户请求处理流程
```
1. 用户输入指令
   ↓
2. 主程序解析命令
   ↓
3. 创建智能路由实例
   ↓
4. 路由分析用户输入
   ↓
5. 识别目标CLI工具
   ↓
6. 设置执行环境变量
   ↓
7. 执行CLI工具进程
   ↓
8. 传递用户指令参数
   ↓
9. 监控执行过程
   ↓
10. 捕获执行结果
    ↓
11. 更新全局内存
    ↓
12. 返回执行结果给用户
```

### 6.2 CLI模式分析流程
```
1. 系统初始化
   ↓
2. 检查CLI模式缓存
   ↓
3. 缓存存在且未过期？
   ├── 是 → 返回缓存数据
   └── 否 → 
         ↓
4. 执行CLI帮助命令
   ↓
5. 解析帮助信息
   ↓
6. 提取命令模式
   ↓
7. 缓存分析结果
   ↓
8. 返回分析数据
```

## 7. 错误处理设计

### 7.1 错误类型分类
- **CLI工具未找到**：目标CLI工具未安装
- **CLI执行失败**：CLI工具执行过程中出错
- **内存访问失败**：无法读写全局内存文件
- **模式分析失败**：无法获取或解析CLI帮助信息

### 7.2 错误处理策略
- **重试机制**：对于临时性错误进行重试
- **降级处理**：使用默认行为或简化功能
- **错误日志**：记录详细错误信息便于调试
- **用户提示**：提供清晰的错误信息和解决建议

## 8. 性能设计

### 8.1 缓存策略
- **CLI模式缓存**：24小时有效期
- **内存访问优化**：异步读写操作
- **进程管理优化**：复用CLI进程实例

### 8.2 资源管理
- **内存使用**：限制单次操作内存占用
- **文件句柄**：及时关闭文件句柄
- **进程资源**：监控和清理僵尸进程