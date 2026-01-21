# Stigmergy CLI 开发规范

## 1. 代码风格规范

### 1.1 命名规范
- **变量命名**：使用camelCase，如`userName`, `cliPatterns`
- **常量命名**：使用UPPER_SNAKE_CASE，如`MAX_RETRY_COUNT`, `DEFAULT_TOOL`
- **函数命名**：使用camelCase，如`analyzeCLI`, `getCLIPattern`
- **类命名**：使用PascalCase，如`SmartRouter`, `MemoryManager`
- **文件命名**：使用snake_case，如`smart_router.js`, `cli_help_analyzer.js`

### 1.2 注释规范
```javascript
/**
 * 智能路由类
 * 负责根据用户输入将请求路由到合适的CLI工具
 */
class SmartRouter {
    /**
     * 初始化智能路由
     * @returns {Promise<void>}
     */
    async initialize() {
        // 实现初始化逻辑
    }
    
    /**
     * 智能路由决策
     * @param {string} userInput - 用户输入
     * @returns {Promise<Object>} 路由结果
     */
    async smartRoute(userInput) {
        // 实现路由逻辑
    }
}
```

### 1.3 错误处理规范
```javascript
try {
    const result = await someAsyncOperation();
    return result;
} catch (error) {
    // 记录错误日志
    console.error(`[ERROR] Operation failed: ${error.message}`, error);
    
    // 抛出自定义错误或返回默认值
    throw new Error(`Operation failed: ${error.message}`);
}
```

## 2. 模块设计规范

### 2.1 模块结构
```
src/
├── core/                    # 核心模块
│   ├── smart_router.js      # 智能路由
│   ├── cli_help_analyzer.js # CLI帮助分析器
│   └── memory_manager.js    # 内存管理器
├── adapters/                # 适配器模块
│   └── [tool_name]/         # 各工具适配器
├── utils/                   # 工具模块
└── main_english.js          # 主入口文件
```

### 2.2 模块导出规范
```javascript
// smart_router.js
class SmartRouter {
    // 类实现
}

// 导出类和重要函数
module.exports = SmartRouter;

// 或者导出多个项
module.exports = { 
    SmartRouter, 
    someUtilityFunction 
};
```

## 3. 异步编程规范

### 3.1 Promise使用
```javascript
// 推荐：使用async/await
async function processData() {
    try {
        const result = await fetchData();
        return await processResult(result);
    } catch (error) {
        throw new Error(`Processing failed: ${error.message}`);
    }
}

// 避免：回调地狱
// 不推荐嵌套过多的Promise链
```

### 3.2 错误边界处理
```javascript
async function robustOperation() {
    const maxRetries = 3;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await riskyOperation();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                // 重试前等待
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    throw new Error(`Operation failed after ${maxRetries} retries: ${lastError.message}`);
}
```

## 4. 文件操作规范

### 4.1 异步文件操作
```javascript
const fs = require('fs/promises');

// 推荐：使用fs/promises
async function readFileAsync(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}`);
        }
        throw error;
    }
}

// 避免：使用同步方法
// const data = fs.readFileSync(filePath, 'utf8'); // 不推荐
```

### 4.2 路径处理
```javascript
const path = require('path');

// 推荐：使用path模块处理路径
const configPath = path.join(os.homedir(), '.stigmergy', 'config.json');

// 避免：字符串拼接路径
// const configPath = os.homedir() + '/.stigmergy/config.json'; // 不推荐
```

## 5. 环境变量规范

### 5.1 环境变量使用
```javascript
// 推荐：使用解构赋值和默认值
const { 
    STIGMERGY_ENABLED = 'true',
    STIGMERGY_VERSION = '1.0.0',
    NODE_ENV = 'development'
} = process.env;

// 避免：直接访问process.env
// if (process.env.STIGMERGY_ENABLED === 'true') // 不推荐
```

### 5.2 配置管理
```javascript
class ConfigManager {
    constructor() {
        this.config = {
            enabled: process.env.STIGMERGY_ENABLED === 'true',
            version: process.env.STIGMERGY_VERSION || '1.0.0',
            debug: process.env.NODE_ENV === 'development'
        };
    }
    
    get(key) {
        return this.config[key];
    }
    
    set(key, value) {
        this.config[key] = value;
    }
}
```

## 6. 日志规范

### 6.1 日志级别
```javascript
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor(level = LOG_LEVELS.INFO) {
        this.level = level;
    }
    
    error(message, error) {
        if (this.level >= LOG_LEVELS.ERROR) {
            console.error(`[ERROR] ${message}`, error);
        }
    }
    
    warn(message) {
        if (this.level >= LOG_LEVELS.WARN) {
            console.warn(`[WARN] ${message}`);
        }
    }
    
    info(message) {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log(`[INFO] ${message}`);
        }
    }
    
    debug(message) {
        if (this.level >= LOG_LEVELS.DEBUG) {
            console.log(`[DEBUG] ${message}`);
        }
    }
}
```

### 6.2 日志格式
```javascript
// 统一日志格式
[LEVEL] TIMESTAMP MESSAGE [CONTEXT]

// 示例
[INFO] 2023-12-08T10:30:00.000Z CLI tool analysis completed [claude]
[ERROR] 2023-12-08T10:30:01.000Z Failed to execute command [qwen]
```

## 7. 测试规范

### 7.1 测试文件命名
- 单元测试：`*.test.js`
- 集成测试：`*.integration.test.js`
- 端到端测试：`*.e2e.test.js`

### 7.2 测试结构
```javascript
describe('ModuleName', () => {
    let instance;
    
    beforeEach(() => {
        instance = new ModuleName();
    });
    
    afterEach(() => {
        // 清理资源
    });
    
    describe('methodName', () => {
        test('should do something when condition', async () => {
            // 准备测试数据
            
            // 执行测试
            
            // 验证结果
        });
    });
});
```

## 8. 安全规范

### 8.1 输入验证
```javascript
function validateInput(input) {
    if (typeof input !== 'string') {
        throw new TypeError('Input must be a string');
    }
    
    if (input.length > 10000) {
        throw new Error('Input too long');
    }
    
    // 检查危险字符
    if (/[;&|`$<>]/.test(input)) {
        throw new Error('Invalid characters in input');
    }
    
    return input.trim();
}
```

### 8.2 命令执行安全
```javascript
const { spawn } = require('child_process');

function safeExecuteCommand(command, args = []) {
    // 验证命令和参数
    if (!command || typeof command !== 'string') {
        throw new Error('Invalid command');
    }
    
    // 过滤参数中的危险字符
    const safeArgs = args.filter(arg => 
        typeof arg === 'string' && !/[;&|`$<>]/.test(arg)
    );
    
    // 使用spawn而不是exec
    return spawn(command, safeArgs, { 
        stdio: 'inherit',
        shell: false // 避免shell注入
    });
}
```

## 9. 性能规范

### 9.1 内存管理
```javascript
// 及时释放大对象引用
function processData(largeData) {
    try {
        // 处理数据
        return processResult(largeData);
    } finally {
        // 清理大对象
        largeData = null;
    }
}

// 使用流处理大文件
const fs = require('fs');
const { pipeline } = require('stream/promises');

async function processLargeFile(inputPath, outputPath) {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    
    await pipeline(
        readStream,
        transformStream,
        writeStream
    );
}
```

### 9.2 缓存策略
```javascript
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 24 * 60 * 60 * 1000; // 24小时
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
```

## 10. 版本控制规范

### 10.1 Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 10.2 分支管理
- `main`：主分支，稳定版本
- `develop`：开发分支
- `feature/*`：功能分支
- `hotfix/*`：紧急修复分支
- `release/*`：发布分支

遵循这些开发规范可以确保代码质量、可维护性和团队协作效率。