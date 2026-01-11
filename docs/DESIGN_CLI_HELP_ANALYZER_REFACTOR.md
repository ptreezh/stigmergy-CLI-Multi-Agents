# CLI Help Analyzer 重构 - 设计文档 (DESIGN)

## 1. 设计概述

### 1.1 设计目标
- 简化方法调用链，减少代码冗余
- 统一分析入口，便于维护和扩展
- 保持向后兼容，不影响现有功能
- 提升代码可读性和可维护性

### 1.2 设计原则
1. **单一职责原则**：每个方法只做一件事
2. **开闭原则**：对扩展开放，对修改封闭
3. **依赖倒置原则**：依赖抽象而非具体实现
4. **接口隔离原则**：接口精简，职责明确

### 1.3 命名规范

#### 1.3.1 现有方法命名（保持向后兼容）
- `analyzeCLI()` - 核心分析方法
- `analyzeCLIEnhanced()` - 增强分析方法
- `getCLIPattern()` - 获取CLI模式
- `getEnhancedCLIPattern()` - 获取增强CLI模式
- `analyzeAllCLI()` - 分析所有CLI

#### 1.3.2 命名规范说明
- **核心分析方法**：使用 `analyze` 前缀，表示执行分析操作
- **数据获取方法**：使用 `get` 前缀，表示获取已分析的数据
- **批量操作方法**：使用 `analyzeAll` 前缀，表示批量分析

#### 1.3.3 新增方法命名规范
- 新增分析方法：使用 `analyze` 前缀
- 新增获取方法：使用 `get` 前缀
- 新增批量方法：使用 `analyzeAll` 前缀

**注意**：为保持向后兼容性，现有方法名保持不变，不进行重命名。

## 2. 架构设计

### 2.1 当前架构问题

```
当前调用链：
analyzeCLI() ← 核心方法
  ├── analyzeCLIEnhanced() → 调用 analyzeCLI()
  ├── getCLIPattern() → 调用 analyzeCLI()
  ├── getEnhancedCLIPattern() → 调用 analyzeCLIEnhanced() → analyzeCLI()
  └── analyzeAllCLI() → 调用 analyzeCLI()

问题：
1. 5个方法，实际核心逻辑只有1个
2. 调用链过长，难以追踪
3. 职责不清，边界模糊
4. 维护困难，容易出错
```

### 2.2 重构后架构

```
重构后调用链：
analyzeCLI(cliName, options) ← 唯一核心入口
  ├── options.enhanced = false → 基础分析
  ├── options.enhanced = true → 增强分析
  └── options.forceRefresh = true → 强制刷新

包装器方法（向后兼容）：
  ├── getCLIPattern(cliName) → analyzeCLI(cliName, { enhanced: false })
  ├── getEnhancedCLIPattern(cliName) → analyzeCLI(cliName, { enhanced: true })
  └── analyzeCLIEnhanced(cliName) → analyzeCLI(cliName, { enhanced: true })

优势：
1. 单一入口，逻辑集中
2. 参数控制，灵活扩展
3. 向后兼容，平滑迁移
4. 职责清晰，易于维护
```

## 3. 详细设计

### 3.1 核心方法设计

#### 3.1.1 analyzeCLI() 方法

**方法签名**：
```javascript
async analyzeCLI(cliName, options = {})
```

**参数**：
- `cliName` (string): CLI工具名称，如 'claude', 'gemini'
- `options` (object): 可选配置对象
  - `enhanced` (boolean): 是否返回增强信息，默认 false
  - `forceRefresh` (boolean): 是否强制刷新缓存，默认 false

**返回值**：
```javascript
{
  success: boolean,
  cliName: string,
  cliType: string,
  version: string,
  helpMethod: string,
  patterns: object,
  commandStructure: object,
  examples: array,
  interactionMode: string,
  agentSkillSupport?: object,  // 当 enhanced=true 时存在
  timestamp: string
}
```

**流程图**：
```
开始
  ↓
检查参数有效性
  ↓
检查缓存
  ↓
缓存存在且未过期且版本未变化且 forceRefresh=false？
  ↓ 是
返回缓存结果
  ↓ 否
执行分析
  ├── 获取帮助信息
  ├── 检测CLI类型
  ├── 提取模式
  ├── 分析命令结构
  ├── 提取使用示例
  └── 确定交互模式
  ↓
enhanced=true？
  ↓ 是
添加增强信息
  ↓ 否
保存到缓存
  ↓
返回分析结果
  ↓
结束
```

**伪代码**：
```javascript
async analyzeCLI(cliName, options = {}) {
  const { enhanced = false, forceRefresh = false } = options;
  
  // 1. 参数验证
  if (!this.cliTools[cliName]) {
    throw new Error(`CLI tool ${cliName} not found`);
  }
  
  // 2. 检查缓存
  if (!forceRefresh) {
    const cachedAnalysis = await this.getCachedAnalysis(cliName);
    if (cachedAnalysis && cachedAnalysis.success) {
      const currentVersion = await this.getCurrentVersion(cliName);
      if (currentVersion === cachedAnalysis.version && 
          !this.isCacheExpired(cachedAnalysis.timestamp)) {
        if (enhanced) {
          return this.addEnhancedInfo(cachedAnalysis, cliName);
        }
        return cachedAnalysis;
      }
    }
  }
  
  // 3. 执行分析
  const analysis = await this.performAnalysis(cliName);
  
  // 4. 添加增强信息
  if (enhanced) {
    return this.addEnhancedInfo(analysis, cliName);
  }
  
  // 5. 保存缓存
  await this.cacheAnalysis(cliName, analysis);
  
  return analysis;
}
```

#### 3.1.2 addEnhancedInfo() 方法

**方法签名**：
```javascript
addEnhancedInfo(analysis, cliName)
```

**参数**：
- `analysis` (object): 基础分析结果
- `cliName` (string): CLI工具名称

**返回值**：
```javascript
{
  ...analysis,  // 原始分析结果
  agentSkillSupport: {
    supportsAgents: boolean,
    supportsSkills: boolean,
    naturalLanguageSupport: boolean,
    skillPrefixRequired: boolean,
    positionalArgs: boolean,
    agentTypes: array,
    skillKeywords: array,
    commandFormat: string,
    examples: array
  }
}
```

**重要说明**：
- ⚠️ **必须返回新对象，不能修改原对象**
- ⚠️ 使用展开运算符 `...analysis` 创建新对象
- ⚠️ 遵循不可变原则，避免副作用
- ⚠️ 原始 `analysis` 对象必须保持不变

**伪代码**：
```javascript
addEnhancedInfo(analysis, cliName) {
  const enhancedPatterns = this.enhancedPatterns[cliName] || {};
  
  // 使用展开运算符创建新对象，不修改原对象
  return {
    ...analysis,
    agentSkillSupport: {
      supportsAgents: enhancedPatterns.agentDetection || false,
      supportsSkills: enhancedPatterns.skillDetection || false,
      naturalLanguageSupport: enhancedPatterns.naturalLanguageSupport || false,
      skillPrefixRequired: enhancedPatterns.skillPrefixRequired || false,
      positionalArgs: enhancedPatterns.positionalArgs || false,
      agentTypes: enhancedPatterns.agentTypes || [],
      skillKeywords: enhancedPatterns.skillKeywords || [],
      commandFormat: enhancedPatterns.commandFormat || '',
      examples: enhancedPatterns.examples || []
    }
  };
}
```

**与现有代码的差异**：
现有代码 `analyzeCLIEnhanced()` 直接修改原对象：
```javascript
// ❌ 错误：直接修改原对象
basicAnalysis.agentSkillSupport = { ... };
return basicAnalysis;
```

重构后必须使用展开运算符：
```javascript
// ✅ 正确：返回新对象
return {
  ...basicAnalysis,
  agentSkillSupport: { ... }
};
```

#### 3.1.3 包装器方法设计

```javascript
// 基础模式获取
async getCLIPattern(cliName) {
  return await this.analyzeCLI(cliName, { enhanced: false });
}

// 增强模式获取
async getEnhancedCLIPattern(cliName) {
  return await this.analyzeCLI(cliName, { enhanced: true });
}

// 增强分析
async analyzeCLIEnhanced(cliName) {
  return await this.analyzeCLI(cliName, { enhanced: true });
}
```

### 3.2 数据结构设计

#### 3.2.1 Options 对象

```typescript
interface AnalyzeOptions {
  enhanced?: boolean;      // 是否返回增强信息
  forceRefresh?: boolean;  // 是否强制刷新缓存
}
```

#### 3.2.2 AnalysisResult 对象

```typescript
interface AnalysisResult {
  success: boolean;
  cliName: string;
  cliType: string;
  version: string;
  helpMethod: string;
  patterns: object;
  commandStructure: object;
  examples: array;
  interactionMode: string;
  timestamp: string;
  agentSkillSupport?: AgentSkillSupport;  // 可选字段
}

interface AgentSkillSupport {
  supportsAgents: boolean;
  supportsSkills: boolean;
  naturalLanguageSupport: boolean;
  skillPrefixRequired: boolean;
  positionalArgs: boolean;
  agentTypes: string[];
  skillKeywords: string[];
  commandFormat: string;
  examples: string[];
}
```

### 3.3 类结构设计

```javascript
class CLIHelpAnalyzer {
  // 构造函数
  constructor()
  
  // 核心方法
  async analyzeCLI(cliName, options = {})
  addEnhancedInfo(analysis, cliName)
  
  // 包装器方法（向后兼容）
  async getCLIPattern(cliName)
  async getEnhancedCLIPattern(cliName)
  async analyzeCLIEnhanced(cliName)
  
  // 批量分析方法
  async analyzeAllCLI(options = {})
  
  // 私有方法（内部使用）
  async performAnalysis(cliName)
  async getHelpInfo(cliName, cliConfig)
  detectCLIType(rawHelp, cliName)
  extractPatterns(rawHelp, cliType, cliName)
  analyzeCommandStructure(patterns)
  extractUsageExamples(rawHelp, cliType)
  determineInteractionMode(helpInfo, patterns)
  
  // 缓存相关方法
  async cacheAnalysis(cliName, analysis)
  async getCachedAnalysis(cliName)
  isCacheExpired(timestamp)
  async loadPersistentConfig()
  async savePersistentConfig(config)
  
  // 版本检测方法
  async getCurrentVersion(cliName, cliConfig)
  
  // 工具方法
  async fileExists(filePath)
  async recordFailedAttempt(cliName, error)
  async updatePatternOnFailure(cliName, error, attemptedCommand)
  async updatePatternOnAgentSkillFailure(cliName, error, attemptedCommand, userPrompt)
}
```

## 4. 接口设计

### 4.1 公共API

#### 4.1.1 analyzeCLI()

```javascript
/**
 * 分析CLI工具
 * @param {string} cliName - CLI工具名称
 * @param {Object} options - 分析选项
 * @param {boolean} options.enhanced - 是否返回增强信息
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 分析结果
 */
async analyzeCLI(cliName, options = {})
```

**使用示例**：
```javascript
// 基础分析
const pattern = await analyzer.analyzeCLI('claude');

// 增强分析
const enhancedPattern = await analyzer.analyzeCLI('claude', { enhanced: true });

// 强制刷新
const freshPattern = await analyzer.analyzeCLI('claude', { forceRefresh: true });

// 组合使用
const result = await analyzer.analyzeCLI('claude', { 
  enhanced: true, 
  forceRefresh: true 
});
```

#### 4.1.2 getCLIPattern()

```javascript
/**
 * 获取CLI模式（向后兼容）
 * @deprecated 建议使用 analyzeCLI(cliName, { enhanced: false })
 * @param {string} cliName - CLI工具名称
 * @returns {Promise<Object>} 分析结果
 */
async getCLIPattern(cliName)
```

#### 4.1.3 getEnhancedCLIPattern()

```javascript
/**
 * 获取增强CLI模式（向后兼容）
 * @deprecated 建议使用 analyzeCLI(cliName, { enhanced: true })
 * @param {string} cliName - CLI工具名称
 * @returns {Promise<Object>} 增强分析结果
 */
async getEnhancedCLIPattern(cliName)
```

#### 4.1.4 analyzeCLIEnhanced()

```javascript
/**
 * 增强分析（向后兼容）
 * @deprecated 建议使用 analyzeCLI(cliName, { enhanced: true })
 * @param {string} cliName - CLI工具名称
 * @returns {Promise<Object>} 增强分析结果
 */
async analyzeCLIEnhanced(cliName)
```

#### 4.1.5 analyzeAllCLI()

```javascript
/**
 * 分析所有CLI工具
 * @param {Object} options - 分析选项
 * @param {boolean} options.enhanced - 是否返回增强信息
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 所有CLI的分析结果
 */
async analyzeAllCLI(options = {})
```

### 4.2 内部API

#### 4.2.1 addEnhancedInfo()

```javascript
/**
 * 添加增强信息
 * @param {Object} analysis - 基础分析结果
 * @param {string} cliName - CLI工具名称
 * @returns {Object} 增强分析结果
 */
addEnhancedInfo(analysis, cliName)
```

## 5. 错误处理设计

### 5.1 错误类型

```javascript
// CLI工具不存在
class CLINotFoundError extends Error {
  constructor(cliName) {
    super(`CLI tool ${cliName} not found in configuration`);
    this.name = 'CLINotFoundError';
  }
}

// 分析失败
class AnalysisFailedError extends Error {
  constructor(cliName, originalError) {
    super(`Failed to analyze ${cliName}: ${originalError.message}`);
    this.name = 'AnalysisFailedError';
    this.originalError = originalError;
  }
}

// 缓存错误
class CacheError extends Error {
  constructor(message) {
    super(`Cache error: ${message}`);
    this.name = 'CacheError';
  }
}
```

### 5.2 错误处理策略

```javascript
async analyzeCLI(cliName, options = {}) {
  try {
    // 参数验证
    if (!this.cliTools[cliName]) {
      throw new CLINotFoundError(cliName);
    }
    
    // 执行分析
    const analysis = await this.performAnalysis(cliName);
    
    return analysis;
  } catch (error) {
    // 记录失败
    await this.recordFailedAttempt(cliName, error);
    
    // 重新抛出
    throw new AnalysisFailedError(cliName, error);
  }
}
```

## 6. 测试设计

### 6.1 单元测试

#### 6.1.1 analyzeCLI() 测试

```javascript
describe('analyzeCLI()', () => {
  test('should return basic analysis when enhanced=false', async () => {
    const result = await analyzer.analyzeCLI('claude', { enhanced: false });
    expect(result.success).toBe(true);
    expect(result.agentSkillSupport).toBeUndefined();
  });
  
  test('should return enhanced analysis when enhanced=true', async () => {
    const result = await analyzer.analyzeCLI('claude', { enhanced: true });
    expect(result.success).toBe(true);
    expect(result.agentSkillSupport).toBeDefined();
  });
  
  test('should use cache when version unchanged', async () => {
    // 第一次调用
    const result1 = await analyzer.analyzeCLI('claude');
    // 第二次调用应该使用缓存
    const result2 = await analyzer.analyzeCLI('claude');
    expect(result2).toEqual(result1);
  });
  
  test('should force refresh when forceRefresh=true', async () => {
    const result1 = await analyzer.analyzeCLI('claude');
    // 强制刷新
    const result2 = await analyzer.analyzeCLI('claude', { forceRefresh: true });
    expect(result2.timestamp).not.toEqual(result1.timestamp);
  });
});
```

#### 6.1.2 addEnhancedInfo() 测试

```javascript
describe('addEnhancedInfo()', () => {
  test('should add agentSkillSupport to analysis', () => {
    const basicAnalysis = { cliName: 'claude', version: '2.1.4' };
    const enhancedAnalysis = analyzer.addEnhancedInfo(basicAnalysis, 'claude');
    
    expect(enhancedAnalysis.agentSkillSupport).toBeDefined();
    expect(enhancedAnalysis.agentSkillSupport.supportsAgents).toBe(true);
  });
  
  test('should not modify original analysis', () => {
    const basicAnalysis = { cliName: 'claude', version: '2.1.4' };
    const enhancedAnalysis = analyzer.addEnhancedInfo(basicAnalysis, 'claude');
    
    expect(basicAnalysis.agentSkillSupport).toBeUndefined();
  });
});
```

#### 6.1.3 包装器方法测试

```javascript
describe('wrapper methods', () => {
  test('getCLIPattern() should call analyzeCLI with enhanced=false', async () => {
    const spy = jest.spyOn(analyzer, 'analyzeCLI');
    await analyzer.getCLIPattern('claude');
    
    expect(spy).toHaveBeenCalledWith('claude', { enhanced: false });
  });
  
  test('getEnhancedCLIPattern() should call analyzeCLI with enhanced=true', async () => {
    const spy = jest.spyOn(analyzer, 'analyzeCLI');
    await analyzer.getEnhancedCLIPattern('claude');
    
    expect(spy).toHaveBeenCalledWith('claude', { enhanced: true });
  });
  
  test('analyzeCLIEnhanced() should call analyzeCLI with enhanced=true', async () => {
    const spy = jest.spyOn(analyzer, 'analyzeCLI');
    await analyzer.analyzeCLIEnhanced('claude');
    
    expect(spy).toHaveBeenCalledWith('claude', { enhanced: true });
  });
});
```

### 6.2 集成测试

```javascript
describe('Integration Tests', () => {
  test('should analyze all CLI tools', async () => {
    const results = await analyzer.analyzeAllCLI();
    
    expect(Object.keys(results).length).toBeGreaterThan(0);
    Object.values(results).forEach(result => {
      expect(result.success).toBe(true);
    });
  });
  
  test('should work with smart_router', async () => {
    const router = new SmartRouter();
    const pattern = await router.getEnhancedCLIPattern('claude');
    
    expect(pattern.success).toBe(true);
    expect(pattern.agentSkillSupport).toBeDefined();
  });
});
```

### 6.3 性能测试

```javascript
describe('Performance Tests', () => {
  test('cache hit should be fast (< 3s)', async () => {
    const start = Date.now();
    await analyzer.analyzeCLI('claude');
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(3000);
  });
  
  test('first analysis should be reasonable (< 10s)', async () => {
    const start = Date.now();
    await analyzer.analyzeCLI('claude', { forceRefresh: true });
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(10000);
  });
});
```

## 7. 迁移策略

### 7.1 阶段1：重构核心方法
- 修改 `analyzeCLI()` 添加 `options` 参数
- 提取 `addEnhancedInfo()` 方法
- 更新内部调用使用 `options`

### 7.2 阶段2：简化包装器
- 简化 `getCLIPattern()` 为包装器
- 简化 `getEnhancedCLIPattern()` 为包装器
- 简化 `analyzeCLIEnhanced()` 为包装器

### 7.3 阶段3：更新外部调用（可选）
- 更新 `smart_router.js` 使用统一方法
- 更新 `enhanced_cli_parameter_handler.js` 使用统一方法

### 7.4 阶段4：测试验证
- 运行所有单元测试
- 运行所有集成测试
- 运行性能测试
- 验证向后兼容性

## 8. 风险缓解

### 8.1 向后兼容性风险
**风险**：破坏现有API
**缓解措施**：
- 保留所有包装器方法
- 保持方法签名不变
- 充分测试所有调用场景

### 8.2 性能风险
**风险**：性能下降
**缓解措施**：
- 性能基准测试
- 优化热点代码
- 保持缓存逻辑

### 8.3 缓存一致性风险
**风险**：缓存逻辑错误
**缓解措施**：
- 单元测试覆盖所有缓存场景
- 集成测试验证缓存行为
- 添加缓存失效机制

## 9. 设计决策记录

### DDR-001: 为什么保留包装器方法？
**决策**：保留 `getCLIPattern()`, `getEnhancedCLIPattern()`, `analyzeCLIEnhanced()` 作为包装器
**理由**：
- 保持向后兼容性
- 不影响现有代码
- 便于平滑迁移
**替代方案**：删除包装器，强制所有代码使用新API
**拒绝理由**：破坏向后兼容性，影响范围大

### DDR-002: 为什么使用 options 对象而不是多个参数？
**决策**：使用 `options` 对象传递配置
**理由**：
- 参数扩展性好
- 调用清晰易读
- 便于添加新选项
**替代方案**：使用多个布尔参数 `analyzeCLI(cliName, enhanced, forceRefresh)`
**拒绝理由**：参数顺序容易混淆，扩展性差

### DDR-003: 为什么 addEnhancedInfo() 不修改原对象？
**决策**：返回新对象，不修改原对象
**理由**：
- 遵循不可变原则
- 避免副作用
- 便于调试和测试
**替代方案**：直接修改原对象
**拒绝理由**：违反不可变原则，容易产生副作用

## 10. 变更历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-01-11 | iFlow | 初始版本 |