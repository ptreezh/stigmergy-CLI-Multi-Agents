# CLI Help Analyzer 架构重构方案

## 当前问题

### 方法冗余
- `analyzeCLI()` - 核心分析方法
- `analyzeCLIEnhanced()` - 增强分析（调用 analyzeCLI）
- `getCLIPattern()` - 获取模式（调用 analyzeCLI）
- `getEnhancedCLIPattern()` - 获取增强模式（调用 analyzeCLIEnhanced）
- `analyzeAllCLI()` - 分析所有CLI（调用 analyzeCLI）

**问题**：5个方法，实际核心逻辑只有1个

### 调用混乱
```
外部调用：
├── smart_router.js
│   ├── getEnhancedCLIPattern() (3次)
│   └── analyzeCLI() (1次)
└── enhanced_cli_parameter_handler.js
    └── getCLIPattern() (1次)
```

**问题**：不同地方调用不同方法，缺乏统一规范

## 最佳实践方案

### 核心原则
1. **单一入口** - 所有分析通过 `analyzeCLI()` 进入
2. **参数控制** - 使用选项参数控制分析深度
3. **向后兼容** - 保留旧方法作为包装器
4. **职责清晰** - 每个方法只做一件事

### 重构后的架构

#### 1. 核心方法（保持不变）
```javascript
/**
 * 核心：CLI分析方法
 * @param {string} cliName - CLI名称
 * @param {Object} options - 分析选项
 * @param {boolean} options.enhanced - 是否包含agent/skill信息
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 分析结果
 */
async analyzeCLI(cliName, options = {}) {
  const {
    enhanced = false,      // 是否返回增强信息
    forceRefresh = false   // 是否强制刷新
  } = options;

  // 版本检测和缓存逻辑
  const cachedAnalysis = await this.getCachedAnalysis(cliName);
  if (!forceRefresh && cachedAnalysis && cachedAnalysis.success) {
    const currentVersion = await this.getCurrentVersion(cliName, this.cliTools[cliName]);
    if (currentVersion === cachedAnalysis.version && !this.isCacheExpired(cachedAnalysis.timestamp)) {
      // 如果需要增强信息，添加到缓存结果
      if (enhanced) {
        return this.addEnhancedInfo(cachedAnalysis, cliName);
      }
      return cachedAnalysis;
    }
  }

  // 执行分析
  const analysis = await this.performAnalysis(cliName);

  // 如果需要增强信息
  if (enhanced) {
    return this.addEnhancedInfo(analysis, cliName);
  }

  return analysis;
}

/**
 * 添加增强信息
 */
addEnhancedInfo(analysis, cliName) {
  const enhancedPatterns = this.enhancedPatterns[cliName] || {};
  analysis.agentSkillSupport = {
    supportsAgents: enhancedPatterns.agentDetection || false,
    supportsSkills: enhancedPatterns.skillDetection || false,
    // ... 其他增强字段
  };
  return analysis;
}
```

#### 2. 包装器方法（保持向后兼容）
```javascript
/**
 * 获取CLI模式（包装器）
 */
async getCLIPattern(cliName) {
  return await this.analyzeCLI(cliName, { enhanced: false });
}

/**
 * 获取增强CLI模式（包装器）
 */
async getEnhancedCLIPattern(cliName) {
  return await this.analyzeCLI(cliName, { enhanced: true });
}

/**
 * 增强分析（包装器）
 */
async analyzeCLIEnhanced(cliName) {
  return await this.analyzeCLI(cliName, { enhanced: true });
}
```

#### 3. 批量分析方法
```javascript
/**
 * 分析所有CLI
 */
async analyzeAllCLI(options = {}) {
  const cliNames = Object.keys(this.cliTools);
  const results = {};

  const promises = cliNames.map(async (cliName) => {
    try {
      const result = await this.analyzeCLI(cliName, options);
      return { cliName, result };
    } catch (error) {
      return { cliName, result: { success: false, error: error.message } };
    }
  });

  const analysisResults = await Promise.all(promises);
  for (const { cliName, result } of analysisResults) {
    results[cliName] = result;
  }

  return results;
}
```

## 调用规范

### 推荐用法

```javascript
// 1. 基础分析（默认）
const pattern = await analyzer.analyzeCLI('claude');

// 2. 增强分析（包含agent/skill信息）
const enhancedPattern = await analyzer.analyzeCLI('claude', { enhanced: true });

// 3. 强制刷新（忽略缓存）
const freshPattern = await analyzer.analyzeCLI('claude', { forceRefresh: true });

// 4. 批量分析
const allPatterns = await analyzer.analyzeAllCLI({ enhanced: true });

// 5. 向后兼容（旧代码）
const pattern1 = await analyzer.getCLIPattern('claude');
const pattern2 = await analyzer.getEnhancedCLIPattern('claude');
```

## 实施步骤

### 阶段1：重构核心方法
1. 修改 `analyzeCLI()` 添加 `options` 参数
2. 提取 `addEnhancedInfo()` 方法
3. 更新内部调用使用 `options`

### 阶段2：简化包装器
1. 简化 `getCLIPattern()` 为包装器
2. 简化 `getEnhancedCLIPattern()` 为包装器
3. 简化 `analyzeCLIEnhanced()` 为包装器

### 阶段3：更新外部调用
1. 更新 `smart_router.js` 使用统一方法
2. 更新 `enhanced_cli_parameter_handler.js` 使用统一方法

### 阶段4：测试验证
1. 单元测试
2. 集成测试
3. 性能测试

## 优势

### 1. 代码清晰
- 单一入口，逻辑集中
- 职责明确，易于理解

### 2. 易于维护
- 修改核心逻辑只需改一处
- 添加新功能只需扩展 `options`

### 3. 向后兼容
- 保留旧方法，不影响现有代码
- 逐步迁移，风险可控

### 4. 灵活扩展
- 通过 `options` 参数控制行为
- 易于添加新功能

## 注意事项

1. **版本兼容** - 保持包装器方法签名不变
2. **性能优化** - 缓存逻辑在核心方法中
3. **错误处理** - 统一错误处理机制
4. **文档更新** - 更新API文档说明新用法

## 总结

**核心思想**：单一入口 + 参数控制 + 向后兼容

**关键优势**：
- ✅ 减少代码重复
- ✅ 简化维护成本
- ✅ 提高代码可读性
- ✅ 降低出错风险
- ✅ 便于未来扩展