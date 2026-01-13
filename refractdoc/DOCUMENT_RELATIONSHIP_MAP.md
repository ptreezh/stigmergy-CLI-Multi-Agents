# Stigmergy CLI 多智能体编排系统 - 文档关系图

## 文档层次结构

本文档位于规范化文档体系的关系文档层。

### 依赖关系
- 依赖: 所有规范化文档
- 被依赖: 无

### 文档用途
记录所有规范化文档之间的关系、依赖关系和追溯矩阵，确保文档的一致性和完整性。

## 相关文档
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 需求文档
- [DESIGN.md](./DESIGN.md) - 设计文档
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 实施文档
- [CORE_CONCEPTS.md](./CORE_CONCEPTS.md) - 核心概念
- [CONTEXT_MANAGEMENT_DESIGN.md](./CONTEXT_MANAGEMENT_DESIGN.md) - 上下文管理设计
- [ARCHITECTURE_RIGOROUS_ANALYSIS.md](./ARCHITECTURE_RIGOROUS_ANALYSIS.md) - 架构严格论证
- [DESIGN_SIMPLIFIED.md](./DESIGN_SIMPLIFIED.md) - 简化设计
- [CONSISTENCY_CHECK_REPORT.md](./CONSISTENCY_CHECK_REPORT.md) - 一致性检测报告
- [DOCUMENT_CONSTRAINTS.md](./DOCUMENT_CONSTRAINTS.md) - 文档约束和验证规则

## 变更历史

| 版本 | 日期 | 作者 | 变更内容 | 影响范围 |
|------|------|------|---------|---------|
| v1.0 | 2026-01-13 | iFlow CLI | 初始版本 | 所有章节 |

## 1. 文档概览

### 1.1 文档列表

| 文档名称 | 类型 | 状态 | 用途 |
|---------|------|------|------|
| REQUIREMENTS.md | 需求文档 | ✅ 完成 | 定义系统需求 |
| DESIGN.md | 设计文档 | ✅ 完成 | 定义系统设计 |
| IMPLEMENTATION.md | 实施文档 | ✅ 完成 | 定义实施计划 |
| CORE_CONCEPTS.md | 概念文档 | ✅ 完成 | 解释核心概念 |
| CONTEXT_MANAGEMENT_DESIGN.md | 设计文档 | ✅ 完成 | 上下文管理设计 |
| ARCHITECTURE_RIGOROUS_ANALYSIS.md | 分析文档 | ✅ 完成 | 架构严格论证 |
| DESIGN_SIMPLIFIED.md | 设计文档 | ✅ 完成 | 简化设计 |
| DOCUMENT_RELATIONSHIP_MAP.md | 关系文档 | ✅ 完成 | 文档关系图 |
| CONSISTENCY_CHECK_REPORT.md | 检测报告 | 🔄 待创建 | 一致性检测 |

---

## 2. 文档层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                      规范化文档体系                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  核心文档层（Speckit 规范）                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ REQUIREMENTS│  │   DESIGN    │  │IMPLEMENTATION│  │   │
│  │  │    .md      │  │    .md      │  │    .md       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  支撑文档层（补充说明）                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ CORE        │  │ CONTEXT     │  │ ARCHITECTURE│  │   │
│  │  │ CONCEPTS    │  │ MANAGEMENT  │  │ RIGOROUS    │  │   │
│  │  │    .md      │  │ DESIGN      │  │ ANALYSIS    │  │   │
│  │  └─────────────┘  │    .md      │  │    .md      │  │   │
│  │                   └─────────────┘  └─────────────┘  │   │
│  │                   ┌─────────────┐                   │   │
│  │                   │ DESIGN      │                   │   │
│  │                   │ SIMPLIFIED  │                   │   │
│  │                   │    .md      │                   │   │
│  │                   └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  关系文档层（文档关系和一致性）                    │   │
│  │  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │ DOCUMENT    │  │ CONSISTENCY │                  │   │
│  │  │ RELATIONSHIP│  │ CHECK       │                  │   │
│  │  │ MAP         │  │ REPORT      │                  │   │
│  │  │    .md      │  │    .md      │                  │   │
│  │  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 文档依赖关系

### 3.1 核心依赖链

```
REQUIREMENTS.md
    ↓
DESIGN.md
    ↓
IMPLEMENTATION.md
```

**说明**:
- REQUIREMENTS.md 定义需求
- DESIGN.md 基于需求设计系统
- IMPLEMENTATION.md 基于设计制定实施计划

---

### 3.2 支撑文档依赖

```
CORE_CONCEPTS.md
    ↓
DESIGN.md
    ↓
CONTEXT_MANAGEMENT_DESIGN.md
```

**说明**:
- CORE_CONCEPTS.md 解释核心概念
- DESIGN.md 使用核心概念设计系统
- CONTEXT_MANAGEMENT_DESIGN.md 扩展上下文管理设计

---

### 3.3 分析文档依赖

```
REQUIREMENTS.md + DESIGN.md + IMPLEMENTATION.md
    ↓
ARCHITECTURE_RIGOROUS_ANALYSIS.md
    ↓
DESIGN_SIMPLIFIED.md
```

**说明**:
- ARCHITECTURE_RIGOROUS_ANALYSIS.md 分析现有文档
- DESIGN_SIMPLIFIED.md 基于分析结果提供简化设计

---

### 3.4 关系文档依赖

```
所有文档
    ↓
DOCUMENT_RELATIONSHIP_MAP.md
    ↓
CONSISTENCY_CHECK_REPORT.md
```

**说明**:
- DOCUMENT_RELATIONSHIP_MAP.md 记录所有文档关系
- CONSISTENCY_CHECK_REPORT.md 检测文档一致性

---

## 4. 文档交叉引用

### 4.1 REQUIREMENTS.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| DESIGN.md | 无 | ❌ 缺失 |
| IMPLEMENTATION.md | 无 | ❌ 缺失 |
| CORE_CONCEPTS.md | 无 | ❌ 缺失 |
| CONTEXT_MANAGEMENT_DESIGN.md | 无 | ❌ 缺失 |

**问题**: ❌ REQUIREMENTS.md 没有引用其他文档

---

### 4.2 DESIGN.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| REQUIREMENTS.md | 无 | ❌ 缺失 |
| IMPLEMENTATION.md | 无 | ❌ 缺失 |
| CORE_CONCEPTS.md | 无 | ❌ 缺失 |
| CONTEXT_MANAGEMENT_DESIGN.md | 无 | ❌ 缺失 |

**问题**: ❌ DESIGN.md 没有引用其他文档

---

### 4.3 IMPLEMENTATION.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| REQUIREMENTS.md | 无 | ❌ 缺失 |
| DESIGN.md | 无 | ❌ 缺失 |
| CORE_CONCEPTS.md | 无 | ❌ 缺失 |

**问题**: ❌ IMPLEMENTATION.md 没有引用其他文档

---

### 4.4 CORE_CONCEPTS.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| REQUIREMENTS.md | 无 | ❌ 缺失 |
| DESIGN.md | 无 | ❌ 缺失 |

**问题**: ❌ CORE_CONCEPTS.md 没有引用其他文档

---

### 4.5 CONTEXT_MANAGEMENT_DESIGN.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| REQUIREMENTS.md | 无 | ❌ 缺失 |
| DESIGN.md | 无 | ❌ 缺失 |
| CORE_CONCEPTS.md | 无 | ❌ 缺失 |

**问题**: ❌ CONTEXT_MANAGEMENT_DESIGN.md 没有引用其他文档

---

### 4.6 ARCHITECTURE_RIGOROUS_ANALYSIS.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| REQUIREMENTS.md | 无 | ❌ 缺失 |
| DESIGN.md | 无 | ❌ 缺失 |
| IMPLEMENTATION.md | 无 | ❌ 缺失 |

**问题**: ❌ ARCHITECTURE_RIGOROUS_ANALYSIS.md 没有引用其他文档

---

### 4.7 DESIGN_SIMPLIFIED.md 引用

| 引用目标 | 引用位置 | 引用类型 |
|---------|---------|---------|
| ARCHITECTURE_RIGOROUS_ANALYSIS.md | 无 | ❌ 缺失 |

**问题**: ❌ DESIGN_SIMPLIFIED.md 没有引用其他文档

---

## 5. 追溯矩阵

### 5.1 需求到设计的追溯

| 需求 | 设计文档 | 设计组件 | 状态 |
|------|---------|---------|------|
| FR-1.1: 并发启动终端 | DESIGN.md | EnhancedTerminalManager | ✅ |
| FR-1.2: 独立运行 CLI | DESIGN.md | EnhancedTerminalManager | ✅ |
| FR-3.1: 创建 worktree | DESIGN.md | GitWorktreeManager | ✅ |
| FR-6.1: 原子锁操作 | DESIGN.md | StateLockManager | ✅ |
| FR-16.1: 创建 task_plan.md | DESIGN.md | TaskPlanningFiles | ✅ |
| FR-17.1: 创建 findings.md | DESIGN.md | TaskPlanningFiles | ✅ |
| FR-18.1: 创建 progress.md | DESIGN.md | TaskPlanningFiles | ✅ |

**覆盖率**: 7/22 (31.8%)

**问题**: ❌ 追溯矩阵不完整，缺少 15 个需求的追溯

---

### 5.2 设计到实施的追溯

| 设计组件 | 实施文档 | 实施阶段 | 实施任务 | 状态 |
|---------|---------|---------|---------|------|
| CentralOrchestrator | IMPLEMENTATION.md | 阶段 1 | 任务 1.2 | ✅ |
| EnhancedTerminalManager | IMPLEMENTATION.md | 阶段 2 | 任务 2.1 | ✅ |
| GitWorktreeManager | IMPLEMENTATION.md | 阶段 3 | 任务 3.1 | ✅ |
| StateLockManager | IMPLEMENTATION.md | 阶段 1 | 任务 1.5 | ✅ |
| EventBus | IMPLEMENTATION.md | 阶段 1 | 任务 1.4 | ✅ |
| TaskPlanningFiles | IMPLEMENTATION.md | 阶段 6 | 任务 6.1 | ✅ |

**覆盖率**: 6/10 (60%)

**问题**: ⚠️ 追溯矩阵不完整，缺少 4 个组件的追溯

---

### 5.3 需求到测试的追溯

| 需求 | 测试文档 | 测试用例 | 状态 |
|------|---------|---------|------|
| FR-1.1 | IMPLEMENTATION.md | should launch multiple terminals | ✅ |
| FR-3.1 | IMPLEMENTATION.md | should create worktree | ✅ |
| FR-6.1 | IMPLEMENTATION.md | should acquire lock atomically | ✅ |
| FR-16.1 | IMPLEMENTATION.md | should create planning files | ✅ |

**覆盖率**: 4/22 (18.2%)

**问题**: ❌ 追溯矩阵严重不完整，缺少 18 个需求的测试追溯

---

### 5.4 文档到文档的追溯

| 文档 | 引用文档 | 引用位置 | 状态 |
|------|---------|---------|------|
| REQUIREMENTS.md | DESIGN.md | 无 | ❌ 缺失 |
| REQUIREMENTS.md | IMPLEMENTATION.md | 无 | ❌ 缺失 |
| DESIGN.md | REQUIREMENTS.md | 无 | ❌ 缺失 |
| DESIGN.md | IMPLEMENTATION.md | 无 | ❌ 缺失 |
| IMPLEMENTATION.md | REQUIREMENTS.md | 无 | ❌ 缺失 |
| IMPLEMENTATION.md | DESIGN.md | 无 | ❌ 缺失 |

**覆盖率**: 0/6 (0%)

**问题**: ❌ 完全没有文档之间的交叉引用

---

## 6. 内部逻辑一致性

### 6.1 需求一致性

#### ✅ 一致性检查

| 检查项 | REQUIREMENTS.md | DESIGN.md | IMPLEMENTATION.md | 状态 |
|--------|-----------------|-----------|-------------------|------|
| 功能需求数量 | 22 个 | 10 个组件 | 7 个阶段 | ⚠️ 不一致 |
| 非功能需求数量 | 25 个 | 15 个 | 无 | ❌ 不一致 |
| 约束条件 | 10 个 | 无 | 无 | ❌ 不一致 |

**问题**:
- ❌ 功能需求数量不一致（22 vs 10 vs 7）
- ❌ 非功能需求数量不一致（25 vs 15 vs 0）
- ❌ 约束条件在设计和实施中缺失

---

### 6.2 设计一致性

#### ✅ 一致性检查

| 检查项 | DESIGN.md | DESIGN_SIMPLIFIED.md | 状态 |
|--------|-----------|---------------------|------|
| 组件数量 | 10 个 | 5 个 | ❌ 不一致 |
| 架构层次 | 7 层 | 4 层 | ❌ 不一致 |
| 接口数量 | 15+ 个 | 8 个 | ❌ 不一致 |

**问题**:
- ❌ 组件数量不一致（10 vs 5）
- ❌ 架构层次不一致（7 vs 4）
- ❌ 接口数量不一致（15+ vs 8）

**说明**: DESIGN_SIMPLIFIED.md 是简化版本，但缺少与原 DESIGN.md 的对比和迁移路径

---

### 6.3 实施一致性

#### ✅ 一致性检查

| 检查项 | IMPLEMENTATION.md | DESIGN.md | 状态 |
|--------|-------------------|-----------|------|
| 实施阶段 | 7 个阶段 | 10 个组件 | ⚠️ 不一致 |
| 阶段 1 任务 | 6 个任务 | CentralOrchestrator | ⚠️ 不一致 |
| 阶段 2 任务 | 8 个任务 | EnhancedTerminalManager | ⚠️ 不一致 |

**问题**:
- ⚠️ 实施阶段与设计组件不完全对应
- ⚠️ 任务分解与组件职责不完全匹配

---

### 6.4 概念一致性

#### ✅ 一致性检查

| 检查项 | CORE_CONCEPTS.md | DESIGN.md | IMPLEMENTATION.md | 状态 |
|--------|------------------|-----------|-------------------|------|
| 事件驱动概念 | ✅ | ✅ | ✅ | ✅ 一致 |
| 智能合并概念 | ✅ | ✅ | ✅ | ✅ 一致 |
| 完整追踪概念 | ✅ | ✅ | ✅ | ✅ 一致 |
| 上下文管理概念 | ✅ | ✅ | ✅ | ✅ 一致 |
| 三文件系统概念 | ❌ | ✅ | ✅ | ⚠️ 不一致 |

**问题**:
- ⚠️ 三文件系统概念在 CORE_CONCEPTS.md 中缺失
- ⚠️ 概念文档与设计文档不完全同步

---

## 7. 问题汇总

### 7.1 文档关系问题

| 问题类型 | 严重程度 | 数量 | 描述 |
|---------|---------|------|------|
| 缺少交叉引用 | 🔴 高 | 6 | 所有文档都没有引用其他文档 |
| 追溯矩阵不完整 | 🔴 高 | 3 | 需求到设计、设计到实施、需求到测试的追溯都不完整 |
| 文档层次不清晰 | 🟡 中 | 1 | 文档层次结构没有明确说明 |

---

### 7.2 内部逻辑一致性问题

| 问题类型 | 严重程度 | 数量 | 描述 |
|---------|---------|------|------|
| 需求数量不一致 | 🔴 高 | 3 | 功能需求、非功能需求、约束条件数量不一致 |
| 设计不一致 | 🔴 高 | 3 | 组件数量、架构层次、接口数量不一致 |
| 实施不一致 | 🟡 中 | 2 | 实施阶段与设计组件不完全对应 |
| 概念不一致 | 🟡 中 | 1 | 三文件系统概念在概念文档中缺失 |

---

### 7.3 Speckit 规范符合性问题

| 问题类型 | 严重程度 | 数量 | 描述 |
|---------|---------|------|------|
| 缺少需求追溯矩阵 | 🔴 高 | 1 | 不符合 Speckit 规范 |
| 缺少设计追溯矩阵 | 🔴 高 | 1 | 不符合 Speckit 规范 |
| 缺少实施追溯矩阵 | 🔴 高 | 1 | 不符合 Speckit 规范 |
| 缺少测试追溯矩阵 | 🔴 高 | 1 | 不符合 Speckit 规范 |
| 缺少变更管理流程 | 🟡 中 | 1 | 不符合 Speckit 规范 |

---

## 8. 改进建议

### 8.1 立即执行（P0）

#### 建议 1: 添加文档交叉引用

**操作**:
1. 在 REQUIREMENTS.md 中添加对 DESIGN.md 和 IMPLEMENTATION.md 的引用
2. 在 DESIGN.md 中添加对 REQUIREMENTS.md 和 IMPLEMENTATION.md 的引用
3. 在 IMPLEMENTATION.md 中添加对 REQUIREMENTS.md 和 DESIGN.md 的引用
4. 在所有文档中添加"相关文档"章节

**预期效果**:
- ✅ 文档之间有明确的引用关系
- ✅ 读者可以快速找到相关文档

---

#### 建议 2: 完善追溯矩阵

**操作**:
1. 在 REQUIREMENTS.md 中添加"需求追溯矩阵"章节
2. 在 DESIGN.md 中添加"设计追溯矩阵"章节
3. 在 IMPLEMENTATION.md 中添加"实施追溯矩阵"章节
4. 确保所有需求都有对应的设计和实施

**预期效果**:
- ✅ 需求到设计的追溯完整（100% 覆盖）
- ✅ 设计到实施的追溯完整（100% 覆盖）
- ✅ 需求到测试的追溯完整（100% 覆盖）

---

#### 建议 3: 统一需求数量

**操作**:
1. 在 REQUIREMENTS.md 中明确列出所有需求（22 个功能需求 + 25 个非功能需求 + 10 个约束）
2. 在 DESIGN.md 中列出所有设计组件（10 个组件）
3. 在 IMPLEMENTATION.md 中列出所有实施阶段（7 个阶段）
4. 建立需求、设计、实施之间的映射关系

**预期效果**:
- ✅ 需求数量一致
- ✅ 设计和实施与需求完全对应

---

### 8.2 短期执行（P1）

#### 建议 4: 同步概念文档

**操作**:
1. 在 CORE_CONCEPTS.md 中添加"三文件系统"概念
2. 在 CORE_CONCEPTS.md 中添加"上下文管理"概念
3. 确保所有概念在设计文档中都有体现

**预期效果**:
- ✅ 概念文档完整
- ✅ 概念与设计一致

---

#### 建议 5: 添加变更管理流程

**操作**:
1. 创建 CHANGELOG.md 记录所有变更
2. 在所有文档中添加"变更历史"章节
3. 建立变更影响分析流程

**预期效果**:
- ✅ 符合 Speckit 规范
- ✅ 变更可追溯

---

### 8.3 长期执行（P2）

#### 建议 6: 建立自动化一致性检测

**操作**:
1. 创建自动化脚本检测文档一致性
2. 定期运行一致性检测
3. 自动生成一致性报告

**预期效果**:
- ✅ 自动检测文档一致性
- ✅ 及时发现不一致问题

---

## 9. 结论

### 9.1 总体评估

| 评估项 | 得分 | 满分 | 通过率 |
|--------|------|------|--------|
| 文档关系清晰度 | 2 | 10 | 20% |
| 交叉引用完整性 | 0 | 10 | 0% |
| 追溯矩阵完整性 | 3 | 10 | 30% |
| 内部逻辑一致性 | 5 | 10 | 50% |
| Speckit 规范符合度 | 4 | 10 | 40% |
| **总分** | **14** | **50** | **28%** |

**总体评估**: ❌ **不通过** - 文档关系和内部逻辑一致性存在严重问题

---

### 9.2 主要问题

1. ❌ **文档之间没有交叉引用** - 所有文档都是孤立的
2. ❌ **追溯矩阵不完整** - 需求、设计、实施、测试之间的追溯严重缺失
3. ❌ **内部逻辑不一致** - 需求数量、设计组件、实施阶段不一致
4. ❌ **不符合 Speckit 规范** - 缺少追溯矩阵和变更管理流程

---

### 9.3 改进优先级

#### 🔴 P0 - 必须立即执行（阻塞问题）
1. 添加文档交叉引用
2. 完善追溯矩阵
3. 统一需求数量

#### 🟡 P1 - 应该在 1 周内执行（重要问题）
4. 同步概念文档
5. 添加变更管理流程

#### 🟢 P2 - 可以在 1 个月内执行（优化问题）
6. 建立自动化一致性检测

---

## 10. 附录

### A. 文档模板

```markdown
# [文档名称]

## 相关文档
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 需求文档
- [DESIGN.md](./DESIGN.md) - 设计文档
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 实施文档

## 变更历史
| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|---------|
| v1.0 | 2026-01-13 | iFlow CLI | 初始版本 |

## 追溯矩阵
| 需求 ID | 设计组件 | 实施任务 | 测试用例 |
|---------|---------|---------|---------|
| FR-1.1 | Component A | Task 1.1 | Test 1.1 |
```

---

**文档生成时间**: 2026-01-13
**文档版本**: v1.0
**文档作者**: iFlow CLI