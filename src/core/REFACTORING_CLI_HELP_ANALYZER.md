# CLI Help Analyzer 维护指南

## 📋 快速导航

- [函数调用关系](#-函数调用关系)
- [外部依赖](#-外部依赖调用)
- [数据流向](#-数据流向)
- [修改指南](#-修改指南)
- [故障排查](#-故障排查)
- [代码审查](#-代码审查清单)

---

## 🏗️ 函数调用关系

### 核心调用链

```
analyzeCLI(cliName, options = {})
    ↓
    ├─ getCachedAnalysis(cliName)
    ├─ getCurrentVersion(cliName, cliConfig)
    ├─ getHelpInfo(cliName, cliConfig)
    ├─ detectCLIType(helpText, cliName)
    ├─ extractPatterns(helpText, cliType, cliName)
    ├─ analyzeCommandStructure(patterns)
    ├─ extractUsageExamples(helpText, cliType)
    ├─ determineInteractionMode(helpInfo, patterns)
    ├─ cacheAnalysis(cliName, analysis)
    └─ addEnhancedInfo(analysis, cliName) [如果 enhanced: true]
```

### 包装器调用链

```
getCLIPattern(cliName) → analyzeCLI(cliName, { enhanced: false })
getEnhancedCLIPattern(cliName) → analyzeCLI(cliName, { enhanced: true })
analyzeCLIEnhanced(cliName) → analyzeCLI(cliName, { enhanced: true })
```

---

## 🔗 外部依赖调用

### SmartRouter 调用

```javascript
// 位置: smart_router.js:304, 377-380, 439
const enhancedPattern = await router.getEnhancedCLIPattern(toolName);
// 最终调用: analyzeCLI(toolName, { enhanced: true })
```

### EnhancedCLIParameterHandler 调用

```javascript
// 位置: enhanced_cli_parameter_handler.js:164
const cliPattern = await handler.analyzer.getCLIPattern(toolName);
// 最终调用: analyzeCLI(toolName, { enhanced: false })
```

### 内部调用

```javascript
// 位置: cli_help_analyzer.js:1084
const newAnalysis = await analyzer.analyzeCLIEnhanced(cliName);
// 最终调用: analyzeCLI(cliName, { enhanced: true })
```

---

## 📈 数据流向

### analyzeCLI 流程

```
输入: cliName, options = { enhanced, forceRefresh }
    ↓
1. 检查缓存（如果 !forceRefresh）
2. 获取当前版本
3. 比较版本和缓存过期时间
4. 如果缓存有效且 enhanced=false → 返回缓存
5. 如果缓存有效且 enhanced=true → 返回 addEnhancedInfo(缓存)
6. 如果缓存无效 → 执行分析
7. 调用 getHelpInfo() 获取帮助信息
8. 调用 detectCLIType() 检测 CLI 类型
9. 调用 extractPatterns() 提取模式
10. 调用 analyzeCommandStructure() 分析结构
11. 调用 extractUsageExamples() 提取示例
12. 调用 determineInteractionMode() 确定交互模式
13. 构建分析结果对象
14. 调用 cacheAnalysis() 保存缓存
15. 如果 enhanced=true → 返回 addEnhancedInfo(新分析)
16. 如果 enhanced=false → 返回新分析
    ↓
输出: 分析结果对象
```

### addEnhancedInfo 流程

```
输入: analysis, cliName
    ↓
1. 获取 enhancedPatterns[cliName]
2. 使用展开运算符创建新对象 ...analysis
3. 添加 agentSkillSupport 字段
    ↓
输出: 增强分析结果（新对象，不修改原对象）
```

---

## 🔧 修改指南

### 添加新的分析选项

**目标：** 在 analyzeCLI 中添加新选项

**步骤：**

1. 修改函数签名
```javascript
async analyzeCLI(cliName, options = {}) {
  const { enhanced = false, forceRefresh = false, newOption = false } = options;
```

2. 实现新逻辑
```javascript
if (newOption) {
  // 新逻辑
}
```

3. 更新 JSDoc
```javascript
@param {boolean} options.newOption - 新选项说明
```

4. 添加测试
```javascript
test('analyzeCLI() 应该支持 newOption', async () => {
  const methodString = analyzer.analyzeCLI.toString();
  expect(methodString).toContain('newOption');
});
```

5. 更新本文档

---

### 修改增强信息结构

**目标：** 在 agentSkillSupport 中添加新字段

**步骤：**

1. 修改 addEnhancedInfo()
```javascript
addEnhancedInfo(analysis, cliName) {
  const enhancedPatterns = this.enhancedPatterns[cliName] || {};
  
  return {
    ...analysis,
    agentSkillSupport: {
      // 现有字段...
      newField: enhancedPatterns.newField || null,
    }
  };
}
```

2. 更新 enhancedPatterns 配置
```javascript
this.enhancedPatterns = {
  'claude': {
    // 现有配置...
    newField: 'value',
  }
};
```

3. 添加测试
```javascript
test('addEnhancedInfo() 应该包含新字段', () => {
  const enhanced = analyzer.addEnhancedInfo(basicAnalysis, 'claude');
  expect(enhanced.agentSkillSupport.newField).toBeDefined();
});
```

---

### 添加新的 CLI 工具

**目标：** 支持新的 CLI 工具

**步骤：**

1. 在 cli_tools.js 中添加配置
```javascript
'newcli': {
  name: 'newcli',
  version: 'newcli --version',
  help: ['--help', '-h'],
}
```

2. 在 enhancedPatterns 中添加配置
```javascript
'newcli': {
  commandFormat: 'newcli -p "{prompt}"',
  agentDetection: true,
  skillDetection: true,
}
```

3. 添加测试
```javascript
test('analyzeCLI() 应该支持 newcli', async () => {
  const result = await analyzer.analyzeCLI('newcli');
  expect(result.cliName).toBe('newcli');
});
```

---

### 修改缓存策略

**目标：** 修改缓存过期时间

**步骤：**

1. 修改 isCacheExpired()
```javascript
isCacheExpired(timestamp) {
  const cacheTime = new Date(timestamp);
  const now = new Date();
  const diffHours = (now - cacheTime) / (1000 * 60 * 60);
  return diffHours > 12; // 修改为12小时
}
```

2. 添加测试
```javascript
test('isCacheExpired() 应该使用新的过期时间', () => {
  const oldTimestamp = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString();
  expect(analyzer.isCacheExpired(oldTimestamp)).toBe(true);
});
```

---

## ⚠️ 修改风险评估

### 高风险修改

**修改 analyzeCLI() 核心逻辑**
- 影响：所有分析功能
- 要求：
  - 在测试环境验证
  - 添加回归测试
  - 逐步发布

**修改 enhancedPatterns 结构**
- 影响：所有增强分析
- 要求：
  - 保持向后兼容
  - 使用默认值
  - 更新文档

**修改缓存机制**
- 影响：所有缓存相关功能
- 要求：
  - 充分测试缓存失效逻辑
  - 监控缓存命中率
  - 提供缓存清理工具

### 中风险修改

**修改包装器方法**
- 影响：SmartRouter、EnhancedCLIParameterHandler
- 要求：
  - 检查所有外部调用
  - 更新集成测试
  - 发布前通知

**修改辅助函数**
- 影响：调用该函数的代码
- 要求：
  - 查找所有调用点
  - 添加单元测试
  - 更新文档

### 低风险修改

**添加新选项**
- 影响：只影响使用新选项的代码
- 要求：
  - 使用默认值
  - 添加测试
  - 更新文档

**添加新字段**
- 影响：只影响读取新字段的代码
- 要求：
  - 使用默认值
  - 向后兼容
  - 更新文档

---

## 🔍 故障排查

### analyzeCLI 返回缓存结果不符合预期

**排查步骤：**

1. 检查缓存是否过期
```javascript
const cached = await analyzer.getCachedAnalysis('claude');
console.log('Cache timestamp:', cached.timestamp);
console.log('Is expired:', analyzer.isCacheExpired(cached.timestamp));
```

2. 检查版本是否变化
```javascript
const currentVersion = await analyzer.getCurrentVersion('claude', cliConfig);
console.log('Current version:', currentVersion);
console.log('Cached version:', cached.version);
```

3. 强制刷新缓存
```javascript
const freshResult = await analyzer.analyzeCLI('claude', { forceRefresh: true });
```

4. 清除所有缓存
```javascript
const fs = require('fs');
const os = require('os');
const path = require('path');
const cacheFile = path.join(os.homedir(), '.stigmergy', 'cli-patterns', 'cli-patterns.json');
fs.unlinkSync(cacheFile);
```

---

### 增强分析缺少 agentSkillSupport 字段

**排查步骤：**

1. 检查 enhancedPatterns 配置
```javascript
console.log('Enhanced patterns:', analyzer.enhancedPatterns['claude']);
```

2. 检查 addEnhancedInfo 是否被调用
```javascript
addEnhancedInfo(analysis, cliName) {
  console.log('[DEBUG] addEnhancedInfo called for:', cliName);
  console.log('[DEBUG] Enhanced patterns:', this.enhancedPatterns[cliName]);
  // ...
}
```

3. 检查 enhanced 参数是否正确传递
```javascript
async analyzeCLI(cliName, options = {}) {
  console.log('[DEBUG] options:', options);
  console.log('[DEBUG] enhanced:', options.enhanced);
  // ...
}
```

---

### SmartRouter 调用失败

**排查步骤：**

1. 检查 analyzer 是否正确初始化
```javascript
console.log('Analyzer exists:', !!router.analyzer);
console.log('Analyzer type:', router.analyzer.constructor.name);
```

2. 检查方法是否存在
```javascript
console.log('getEnhancedCLIPattern exists:', typeof router.analyzer.getEnhancedCLIPattern === 'function');
```

3. 直接调用测试
```javascript
try {
  const result = await router.analyzer.getEnhancedCLIPattern('claude');
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

---

### 性能问题，分析速度慢

**排查步骤：**

1. 检查缓存命中率
```javascript
let cacheHits = 0;
let cacheMisses = 0;

// 在 analyzeCLI 中
if (cachedAnalysis && ... ) {
  cacheHits++;
  console.log('[PERF] Cache hit:', cliName);
  return cachedAnalysis;
}
cacheMisses++;
console.log('[PERF] Cache miss:', cliName);
```

2. 检查超时设置
```javascript
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Analysis timeout')), 60000)
);
```

3. 检查 CLI 工具响应时间
```javascript
const start = Date.now();
await analyzer.analyzeCLI('claude');
console.log('Time:', Date.now() - start, 'ms');
```

---

## 📝 代码审查清单

### 功能检查
- [ ] 所有现有测试通过
- [ ] 添加了新测试覆盖新功能
- [ ] 函数签名保持向后兼容
- [ ] 返回值格式保持一致
- [ ] 错误处理正确

### 性能检查
- [ ] 缓存机制正常工作
- [ ] 没有性能回归
- [ ] 超时设置合理
- [ ] 内存使用正常

### 文档检查
- [ ] 更新了 JSDoc 注释
- [ ] 更新了本文档
- [ ] 更新了相关文档
- [ ] 添加了使用示例

### 兼容性检查
- [ ] 向后兼容性保持
- [ ] 外部依赖正常工作
- [ ] 集成测试通过
- [ ] 没有破坏性变更

---

## 📚 相关文件

### 核心文件
- `src/core/cli_help_analyzer.js` - 主实现

### 依赖文件
- `src/core/smart_router.js` - 调用 getEnhancedCLIPattern()
- `src/core/enhanced_cli_parameter_handler.js` - 调用 getCLIPattern()

### 测试文件
- `tests/unit/cli-help-analyzer.test.js` - 单元测试
- `tests/integration/cli-help-analyzer-integration.test.js` - 集成测试

---

## 🎯 快速参考

### 函数签名

```javascript
// 核心函数
async analyzeCLI(cliName, options = {})
async analyzeAllCLI(options = {})
addEnhancedInfo(analysis, cliName)

// 包装器函数（已弃用）
async getCLIPattern(cliName)
async getEnhancedCLIPattern(cliName)
async analyzeCLIEnhanced(cliName)
```

### 返回值结构

```javascript
// 基础分析
{
  success: true,
  cliName: 'claude',
  cliType: 'anthropic',
  version: '2.1.4',
  patterns: { ... },
  commandStructure: { ... },
  timestamp: '...'
}

// 增强分析
{
  // ... 基础分析所有字段
  agentSkillSupport: {
    supportsAgents: true,
    supportsSkills: true,
    // ... 更多字段
  }
}
```

### 常用操作

```javascript
// 基础分析
await analyzer.analyzeCLI('claude');

// 增强分析
await analyzer.analyzeCLI('claude', { enhanced: true });

// 强制刷新
await analyzer.analyzeCLI('claude', { forceRefresh: true });

// 批量分析
await analyzer.analyzeAllCLI({ enhanced: true });
```

---

*本文档面向未来维护者，提供直接的修改指南和故障排查步骤。*