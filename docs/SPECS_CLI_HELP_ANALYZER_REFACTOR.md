# CLI Help Analyzer 重构 - 规范需求文档 (SPECS)

## 1. 项目概述

### 1.1 背景
当前 `CLIHelpAnalyzer` 类存在以下问题：
- 方法冗余：5个方法实际都调用同一个核心方法
- 职责不清：基础分析和增强分析的边界模糊
- 调用混乱：不同地方调用不同方法
- 维护困难：修改一个方法可能影响多个调用点

### 1.2 目标
重构 `CLIHelpAnalyzer` 类，实现：
- 单一入口：所有分析通过 `analyzeCLI()` 进入
- 参数控制：使用 `options` 参数控制分析深度
- 向后兼容：保留旧方法作为包装器
- 职责清晰：每个方法只做一件事

### 1.3 范围
- 重构 `src/core/cli_help_analyzer.js`
- 更新外部调用方代码（如需要）
- 保持所有现有功能不变
- 保持向后兼容性

## 2. 功能需求

### 2.1 核心方法重构

#### FR-001: 统一 analyzeCLI() 方法
**需求描述**：`analyzeCLI()` 方法应支持可选参数控制分析行为

**优先级**：高 (P0)

**验收标准**：
- [ ] 方法签名：`async analyzeCLI(cliName, options = {})`
- [ ] 支持 `options.enhanced` 布尔参数（默认 false）
- [ ] 支持 `options.forceRefresh` 布尔参数（默认 false）
- [ ] 当 `enhanced=true` 时，返回结果包含 `agentSkillSupport` 字段
- [ ] 当 `forceRefresh=true` 时，忽略缓存重新分析
- [ ] 保持原有的版本检测逻辑
- [ ] 保持原有的缓存过期逻辑（24小时）

**示例**：
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

#### FR-002: 提取 addEnhancedInfo() 方法
**需求描述**：将增强信息添加逻辑提取为独立方法

**优先级**：高 (P0)

**验收标准**：
- [ ] 方法签名：`addEnhancedInfo(analysis, cliName)`
- [ ] 从 `this.enhancedPatterns` 读取配置
- [ ] 添加 `agentSkillSupport` 字段到分析结果
- [ ] 返回增强后的分析对象
- [ ] 不修改原始 `analysis` 对象（返回新对象）

**示例**：
```javascript
const basicAnalysis = { cliName: 'claude', version: '2.1.4' };
const enhancedAnalysis = analyzer.addEnhancedInfo(basicAnalysis, 'claude');
// enhancedAnalysis.agentSkillSupport = { supportsAgents: true, ... }
```

#### FR-003: 简化包装器方法
**需求描述**：简化 `getCLIPattern()`, `getEnhancedCLIPattern()`, `analyzeCLIEnhanced()` 为包装器

**优先级**：中 (P1)

**验收标准**：
- [ ] `getCLIPattern(cliName)` 调用 `analyzeCLI(cliName, { enhanced: false })`
- [ ] `getEnhancedCLIPattern(cliName)` 调用 `analyzeCLI(cliName, { enhanced: true })`
- [ ] `analyzeCLIEnhanced(cliName)` 调用 `analyzeCLI(cliName, { enhanced: true })`
- [ ] 保持方法签名不变
- [ ] 保持返回值格式不变

### 2.2 版本检测和缓存

#### FR-004: 版本检测逻辑
**需求描述**：确保版本检测在所有场景下正常工作

**优先级**：高 (P0)

**验收标准**：
- [ ] 获取当前版本：执行 `cliName --version` 命令
- [ ] 对比缓存版本：`currentVersion === cachedAnalysis.version`
- [ ] 版本相同时使用缓存
- [ ] 版本不同时重新分析
- [ ] 版本未知时（unknown）重新分析

#### FR-005: 缓存过期逻辑
**需求描述**：确保缓存过期机制正常工作

**优先级**：高 (P0)

**验收标准**：
- [ ] 缓存有效期：24小时
- [ ] 超过24小时自动过期
- [ ] 过期后重新分析
- [ ] 更新缓存时记录时间戳

### 2.3 向后兼容性

#### FR-006: 保持外部调用兼容
**需求描述**：确保所有外部调用不受影响

**优先级**：高 (P0)

**验收标准**：
- [ ] `smart_router.js` 的调用正常工作
- [ ] `enhanced_cli_parameter_handler.js` 的调用正常工作
- [ ] 所有测试用例通过
- [ ] 不破坏现有功能

### 2.4 错误处理

#### FR-007: 错误处理和恢复
**需求描述**：确保系统在错误情况下能够优雅处理和恢复

**优先级**：高 (P0)

**验收标准**：
- [ ] 记录失败尝试到配置文件
- [ ] 失败后能够重新分析
- [ ] 错误日志记录到错误处理器
- [ ] 工具不存在时返回失败结果而非抛出异常
- [ ] 缓存读取失败时使用内存配置
- [ ] 配置文件写入失败时不阻塞主流程

### 2.5 边界条件处理

#### FR-008: 边界条件处理
**需求描述**：正确处理各种边界条件和异常输入

**优先级**：高 (P0)

**验收标准**：
- [ ] cliName为空或null时抛出明确错误
- [ ] cliName为空字符串时抛出明确错误
- [ ] cliName不存在于配置中时抛出明确错误
- [ ] options参数为null时使用默认值
- [ ] options参数类型错误时抛出明确错误
- [ ] 配置文件不存在时创建默认配置
- [ ] 配置文件损坏时恢复默认配置
- [ ] 版本检测失败时使用 'unknown' 标记

### 2.5 边界条件处理

#### FR-008: 边界条件处理
**需求描述**：正确处理各种边界条件和异常输入

**优先级**：高 (P0)

**验收标准**：
- [ ] cliName为空或null时抛出明确错误
- [ ] cliName不存在于配置中时抛出明确错误
- [ ] options参数类型错误时抛出明确错误
- [ ] 配置文件不存在时创建默认配置
- [ ] 配置文件损坏时恢复默认配置
- [ ] 版本检测失败时使用 'unknown' 标记
- [ ] 帮助信息获取失败时记录错误并返回失败结果
- [ ] CLI命令执行超时时记录错误并返回失败结果

## 3. 非功能需求

### 3.1 性能需求

#### NFR-001: 性能不降低
**需求描述**：重构后性能不低于重构前

**优先级**：高 (P0)

**验收标准**：
- [ ] 缓存命中时间：≤ 3秒
- [ ] 首次分析时间：≤ 10秒（单个CLI）
- [ ] 并行分析时间：≤ 35秒（13个CLI）

#### NFR-002: 内存使用
**需求描述**：内存使用不显著增加

**优先级**：中 (P1)

**验收标准**：
- [ ] 内存增量：≤ 10MB
- [ ] 无内存泄漏

### 3.2 可维护性需求

#### NFR-003: 代码可读性
**需求描述**：代码结构清晰，易于理解

**优先级**：高 (P0)

**验收标准**：
- [ ] 方法职责单一
- [ ] 方法长度 ≤ 50行
- [ ] 注释清晰完整
- [ ] 变量命名规范

#### NFR-004: 测试覆盖
**需求描述**：确保充分的测试覆盖

**优先级**：高 (P0)

**验收标准**：
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 集成测试覆盖所有主要流程
- [ ] 性能测试验证性能指标

## 4. 约束条件

### 4.1 技术约束
- 必须使用现有的 `CLI_TOOLS` 配置
- 必须保持现有的缓存文件格式
- 必须保持现有的 `enhancedPatterns` 配置

### 4.2 兼容性约束
- 必须保持向后兼容性
- 不能破坏现有API
- 必须支持所有现有调用方式

### 4.3 时间约束
- 重构完成后需要通过所有现有测试
- 重构不能影响已发布的功能

## 5. 依赖关系

### 5.1 内部依赖
- `cli_tools.js` - CLI工具配置
- `error_handler.js` - 错误处理
- `cli_path_detector.js` - 路径检测

### 5.2 外部依赖
- Node.js 内置模块：`child_process`, `fs`, `path`, `os`

## 6. 风险评估

### 6.1 技术风险
| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 破坏现有功能 | 中 | 高 | 充分测试，保留包装器 |
| 性能下降 | 低 | 中 | 性能测试，基准对比 |
| 缓存逻辑错误 | 中 | 高 | 单元测试，集成测试 |

### 6.2 业务风险
| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 用户升级后出现问题 | 低 | 高 | 向后兼容，充分测试 |
| 维护成本增加 | 低 | 低 | 代码审查，文档完善 |

## 7. 验收标准

### 7.1 功能验收
- [ ] 所有功能需求 (FR-001 到 FR-006) 满足
- [ ] 所有现有测试通过
- [ ] 新增测试用例通过

### 7.2 性能验收
- [ ] 所有性能需求 (NFR-001, NFR-002) 满足
- [ ] 性能测试报告通过

### 7.3 质量验收
- [ ] 代码审查通过
- [ ] 测试覆盖率 ≥ 80%
- [ ] 无严重bug

## 8. 交付物

### 8.1 代码
- 重构后的 `cli_help_analyzer.js`
- 更新的测试文件（如有）

### 8.2 文档
- 规范需求文档（本文档）
- 设计文档
- 实施清单
- 测试报告

### 8.3 其他
- 性能测试报告
- 代码审查记录

## 9. 变更历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-01-11 | iFlow | 初始版本 |