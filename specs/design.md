# Stigmergy CLI 系统设计规范

## 1. 架构设计

### 1.1 总体架构
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

### 1.2 技术栈规范
- **运行环境**：Node.js >= 16.0.0
- **包管理**：npm
- **核心依赖**：
  - commander：^12.0.0（命令行参数解析）
  - inquirer：^8.2.6（交互式命令行界面）
  - chalk：^4.1.2（终端着色输出）
  - js-yaml：^4.1.0（YAML文件处理）
- **开发依赖**：
  - eslint：^8.50.0（代码检查）
  - prettier：^3.0.3（代码格式化）
  - jest：^29.0.0（测试框架）

## 2. 模块设计

### 2.1 智能路由模块 (SmartRouter)

#### 2.1.1 接口定义
```javascript
/**
 * 智能路由类
 */
class SmartRouter {
    /**
     * 构造函数
     */
    constructor();
    
    /**
     * 初始化路由系统
     * @returns {Promise<void>}
     */
    async initialize(): Promise<void>;
    
    /**
     * 智能路由决策
     * @param {string} userInput - 用户输入
     * @returns {Promise<{tool: string, prompt: string}>} 路由结果
     */
    async smartRoute(userInput: string): Promise<{tool: string, prompt: string}>;
    
    /**
     * 提取工具关键字
     * @param {string} toolName - 工具名称
     * @returns {string[]} 关键字数组
     */
    extractKeywords(toolName: string): string[];
}
```

#### 2.1.2 实现规范
- 使用简单的关键字匹配算法
- 支持可配置的工具关键字映射
- 提供默认路由机制

### 2.2 上下文管理模块 (MemoryManager)

#### 2.2.1 接口定义
```javascript
/**
 * 内存管理类
 */
class MemoryManager {
    /**
     * 构造函数
     */
    constructor();
    
    /**
     * 获取全局内存
     * @returns {Promise<Object>} 内存数据
     */
    async getGlobalMemory(): Promise<Object>;
    
    /**
     * 更新全局内存
     * @param {Function} updateFn - 更新函数
     * @returns {Promise<Object>} 更新后的内存数据
     */
    async updateGlobalMemory(updateFn: Function): Promise<Object>;
    
    /**
     * 添加交互记录
     * @param {string} tool - 工具名称
     * @param {string} prompt - 用户输入
     * @param {string} response - 工具响应
     * @returns {Promise<void>}
     */
    async addInteraction(tool: string, prompt: string, response: string): Promise<void>;
}
```

#### 2.2.2 实现规范
- 使用JSON文件存储内存数据
- 支持并发访问控制
- 提供内存数据持久化机制

### 2.3 CLI模式分析模块 (CLIHelpAnalyzer)

#### 2.3.1 接口定义
```javascript
/**
 * CLI帮助分析器类
 */
class CLIHelpAnalyzer {
    /**
     * 构造函数
     */
    constructor();
    
    /**
     * 初始化分析器
     * @returns {Promise<boolean>} 初始化结果
     */
    async initialize(): Promise<boolean>;
    
    /**
     * 分析CLI工具
     * @param {string} cliName - CLI工具名称
     * @returns {Promise<Object>} 分析结果
     */
    async analyzeCLI(cliName: string): Promise<Object>;
    
    /**
     * 获取CLI模式
     * @param {string} cliName - CLI工具名称
     * @returns {Promise<Object>} CLI模式
     */
    async getCLIPattern(cliName: string): Promise<Object>;
    
    /**
     * 缓存分析结果
     * @param {string} cliName - CLI工具名称
     * @param {Object} analysis - 分析结果
     * @returns {Promise<void>}
     */
    async cacheAnalysis(cliName: string, analysis: Object): Promise<void>;
}
```

#### 2.3.2 实现规范
- 支持多种CLI帮助命令格式
- 提供24小时缓存机制
- 支持缓存失效自动更新

## 3. 数据设计

### 3.1 全局内存结构规范
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

### 3.2 CLI模式缓存结构规范
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
  },
  "failedAttempts": {
    "工具名称": {
      "error": "错误信息",
      "timestamp": "失败时间",
      "attempts": "尝试次数"
    }
  }
}
```

## 4. 接口设计

### 4.1 命令行接口规范

#### 4.1.1 主要命令
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

#### 4.1.2 环境变量接口规范
```bash
# 系统设置的标准环境变量
STIGMERGY_ENABLED=true
STIGMERGY_VERSION=版本号
STIGMERGY_PROJECT_DIR=项目目录
STIGMERGY_CONTEXT_FILE=上下文文件路径
STIGMERGY_CLI_PATTERNS=CLI模式文件路径
STIGMERGY_TEMP_DIR=临时目录
```

## 5. 错误处理设计

### 5.1 错误类型分类
- **CLI工具未找到**：目标CLI工具未安装 (ERR_CLI_NOT_FOUND)
- **CLI执行失败**：CLI工具执行过程中出错 (ERR_CLI_EXECUTION)
- **内存访问失败**：无法读写全局内存文件 (ERR_MEMORY_ACCESS)
- **模式分析失败**：无法获取或解析CLI帮助信息 (ERR_PATTERN_ANALYSIS)

### 5.2 错误处理策略
- **重试机制**：对于临时性错误进行重试（最多3次）
- **降级处理**：使用默认行为或简化功能
- **错误日志**：记录详细错误信息便于调试
- **用户提示**：提供清晰的错误信息和解决建议

## 6. 性能设计

### 6.1 缓存策略
- **CLI模式缓存**：24小时有效期
- **内存访问优化**：异步读写操作
- **进程管理优化**：复用CLI进程实例

### 6.2 资源管理
- **内存使用**：限制单次操作内存占用不超过100MB
- **文件句柄**：及时关闭文件句柄
- **进程资源**：监控和清理僵尸进程

## 7. 安全设计

### 7.1 输入验证
- 限制用户输入长度（最大10000字符）
- 过滤危险字符（;,|`$<>等）
- 验证CLI命令参数安全性

### 7.2 命令执行安全
- 使用spawn而非exec执行CLI命令
- 禁用shell模式防止命令注入
- 限制可执行命令范围

### 7.3 数据安全
- 敏感信息不写入日志
- 内存文件访问权限控制
- 环境变量保护机制

## 8. 可扩展性设计

### 8.1 插件架构
- 支持第三方CLI工具集成
- 提供标准适配器接口
- 支持自定义路由规则

### 8.2 配置管理
- 支持用户自定义配置
- 提供配置文件模板
- 支持环境变量覆盖