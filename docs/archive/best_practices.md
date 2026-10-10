# Stigmergy CLI 最佳实践规范

## 项目核心理念

### 核心原则
1. **用户主导**：用户决定如何分工和协同
2. **CLI自主**：各CLI工具自主决定调用其他工具
3. **系统支撑**：项目只提供基础支撑和上下文传递机制

## 智能路由系统规范

### 基础路由功能
智能路由系统只负责最基本的关键字识别和CLI转发，不做深度语义分析。

```javascript
// 智能路由只做最基本的关键字识别和CLI转发
async smartRoute(userInput) {
    const input = userInput.trim();
    
    // 简单的关键字匹配，不深度解析语义
    for (const [toolName, toolInfo] of Object.entries(this.tools)) {
        // 只检查工具名称关键字
        if (input.toLowerCase().includes(toolName.toLowerCase())) {
            // 提取工具后的完整指令
            const prompt = input.replace(new RegExp(`.*${toolName}\\s*`, 'gi'), '').trim();
            return { tool: toolName, prompt: prompt || input };
        }
    }
    
    // 默认路由到首选工具
    return { tool: this.defaultTool, prompt: input };
}
```

### 上下文传递机制
系统提供标准化的上下文传递机制，确保各CLI工具能够访问共享状态。

```javascript
// 在执行CLI时传递项目上下文
async executeCLI(toolName, prompt) {
    // 准备环境变量传递上下文
    const env = {
        ...process.env,
        STIGMERGY_CONTEXT: JSON.stringify(this.getCurrentContext()),
        STIGMERGY_PROJECT_DIR: process.cwd(),
        STIGMERGY_MEMORY_FILE: this.memory.globalMemoryFile
    };
    
    // 执行CLI命令
    const child = spawn(toolName, [prompt], { 
        stdio: 'inherit', 
        shell: true,
        env: env
    });
    
    return child;
}
```

### 内存和状态共享
提供全局内存管理机制，供各CLI工具读写共享状态。

```javascript
class MemoryManager {
    // 提供全局内存文件供各CLI读写
    async getGlobalMemory() {
        try {
            const data = await fs.readFile(this.globalMemoryFile, 'utf8');
            return JSON.parse(data);
        } catch {
            return { interactions: [], collaborations: [] };
        }
    }
    
    async updateGlobalMemory(updateFn) {
        const memory = await this.getGlobalMemory();
        const updatedMemory = updateFn(memory);
        await fs.writeFile(this.globalMemoryFile, JSON.stringify(updatedMemory, null, 2));
        return updatedMemory;
    }
}
```

## 系统架构

```
用户输入 → 智能路由 → CLI工具A → (用户决定) → CLI工具B → (用户决定) → CLI工具C
              ↓           ↓            ↓            ↓            ↓
           上下文传递   环境变量    用户控制    环境变量    用户控制
```

## 系统提供的核心支撑

### 标准化接口
提供给各CLI的标准接口：

```javascript
// 提供给各CLI的标准接口
const StigmergyAPI = {
    // 获取当前上下文
    getContext: () => this.memory.getGlobalMemory(),
    
    // 更新上下文
    updateContext: (updateFn) => this.memory.updateGlobalMemory(updateFn),
    
    // 调用其他CLI的标准方法
    callCLI: (toolName, prompt) => this.executeCLI(toolName, prompt),
    
    // 获取CLI模式信息
    getCLIPattern: (toolName) => this.analyzer.getCLIPattern(toolName)
};
```

### 环境变量标准化
系统自动设置的标准环境变量：

```javascript
// 系统自动设置的标准环境变量
const standardEnv = {
    STIGMERGY_ENABLED: 'true',
    STIGMERGY_VERSION: packageVersion,
    STIGMERGY_PROJECT_DIR: process.cwd(),
    STIGMERGY_CONTEXT_FILE: globalMemoryFile,
    STIGMERGY_CLI_PATTERNS: cliPatternsFile,
    STIGMERGY_TEMP_DIR: tempDir
};
```

## 最佳实践总结

1. **保持简单**：智能路由只做最基本的工具识别和转发
2. **用户至上**：完全由用户和各CLI决定协作流程
3. **标准支撑**：提供统一的上下文传递和状态管理机制
4. **透明机制**：各CLI都能访问相同的上下文和历史信息
5. **灵活扩展**：CLI可以自由决定是否调用其他工具