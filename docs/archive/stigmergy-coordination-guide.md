# Stigmergy CLI 协同机制指南

## 核心概念

### 什么是 Stigmergy？

Stigmergy 是一种**间接协同**机制，源自对蚂蚁、白蚁等社会昆虫集体行为的研究。

**传统直接通信** vs **Stigmergy间接协同**：

```
传统通信:               Stigmergy:
CLI A ──────→ CLI B    CLI A → 环境 ← CLI B
  │                      ↓        ↓
  └────────────────→   留下痕迹  感知痕迹
   直接消息传递
```

### 三种协同模式

#### 1. Parallel Mode (并行模式)
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Qwen   │  │  iFlow  │  │ Claude  │
└────┬────┘  └────┬────┘  └────┬────┘
     │             │             │
     └──────┬──────┴──────┬──────┘
            ↓             ↓
         相同任务      相同任务
            │             │
            └──────┬──────┘
                   ↓
            聚合选择最佳
```

**特点**：
- ✅ 所有CLI执行**相同**的任务
- ✅ 结果通过投票/质量评分聚合
- ✅ 快速，适合验证和多数决策
- ⚠️ 可能有资源浪费（重复工作）

**使用场景**：
- 快速验证同一问题的多个解决方案
- 需要多数意见的任务
- 对结果质量要求高的场景

---

#### 2. Competitive Mode (竞争模式)
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Qwen   │  │  iFlow  │  │ Claude  │
└────┬────┘  └────┬────┘  └────┬────┘
     │             │             │
     └──────┬──────┴──────┬──────┘
            ↓             ↓
         相同任务      相同任务
            │             │
            └──────┬──────┘
                   ↓
         质量评分 → 选择冠军
```

**特点**：
- ✅ CLI竞争产生最佳结果
- ✅ 基于多个质量指标评分
- ✅ 选择唯一的最佳输出
- ⚠️ 需要定义清晰的质量标准

**质量评分指标**：
- 输出完整性（40%）
- 代码规范性（20%）
- 文档详尽度（15%）
- 执行效率（15%）
- CLI专业权重（10%）

**使用场景**：
- 代码生成（选择最佳实现）
- 问题解决（选择最优方案）
- 架构设计（选择最佳设计）

---

#### 3. Collaborative Mode (协同模式)
```
任务: "开发用户认证系统"

┌─────────┐  ┌─────────┐  ┌─────────┐
│  Qwen   │  │  iFlow  │  │ Claude  │
└────┬────┘  └────┬────┘  └────┬────┘
     │             │             │
  写代码        分析安全      写测试
     │             │             │
     └──────┬──────┴──────┬──────┘
            ↓             ↓
         互补工作      互补工作
            │             │
            └──────┬──────┘
                   ↓
              智能合并结果
```

**特点**：
- ✅ 根据CLI特长分配**不同**子任务
- ✅ 互补工作，避免重复
- ✅ 环境状态共享
- ✅ 冲突检测和解决

**任务分解示例**：

| 主任务 | 子任务分配 | 分配依据 |
|--------|-----------|---------|
| 开发API | Claude: 设计接口 | 擅长架构设计 |
| | Qwen: 实现代码 | 擅长中文编码 |
| | iFlow: 性能优化 | 擅长代码分析 |
| | Copilot: 补充最佳实践 | 擅长模式识别 |

**使用场景**：
- 复杂系统开发
- 多角度代码审查
- 完整解决方案生成

---

## 如何避免相互干扰？

### 1. 文件锁机制

```javascript
// CLI A 想要修改 file.js
if (fileLockManager.acquireLock('file.js', 'qwen')) {
  // ✅ 获取锁成功
  try {
    // 修改文件
    modifyFile('file.js');
  } finally {
    fileLockManager.releaseLock('file.js', 'qwen');
  }
} else {
  // ❌ 文件被其他CLI锁定
  // 等待或执行其他任务
}
```

**锁超时**：默认5分钟自动释放，防止死锁

**实现位置**：`src/core/coordination/nodejs/FileLockManager.js`

---

### 2. 环境状态感知

每个CLI可以通过环境感知其他CLI的工作：

```javascript
// 查询文件修改历史
const modifications = environment.readTraces({
  type: 'file_modification',
  filePath: 'src/app.js'
});

// CLI A 看到文件已被修改
if (modifications.length > 0) {
  // 跳过重复修改
  // 或基于现有结果继续工作
}
```

**痕迹类型**：
- `file_modification`: 文件修改记录
- `result_aggregation`: 结果聚合记录
- `collaboration`: 协同工作记录
- `competition`: 竞争记录

**实现位置**：`src/core/coordination/nodejs/StigmergyEnvironment.js`

---

### 3. 智能任务分配

根据CLI特长避免冲突：

```javascript
// 任务分析
const taskType = analyzeTask('实现用户登录');

// 选择合适的CLI
const selected = selectCLIsByCapability(taskType);
// → Claude (架构设计), Qwen (代码实现)

// 避免选择功能重叠的CLI
```

**能力矩阵**：

| CLI | 擅长领域 | 权重 |
|-----|---------|------|
| Claude | 复杂推理、架构设计 | 1.2 |
| Qwen | 中文、代码实现 | 1.0 |
| iFlow | 代码分析、优化 | 0.95 |
| Gemini | 多语言、创意写作 | 0.9 |

---

### 4. 结果聚合策略

#### 投票策略 (Voting)
```
3个CLI的结果:
  Qwen:  "闭包是函数访问外部变量"
  iFlow: "闭包是函数记住词法作用域"
  Claude: "闭包是函数访问外部作用域"

相似度聚类:
  {Qwen, Claude} → 2票 (相似)
  {iFlow} → 1票

胜出: Qwen 或 Claude (随机选择或按权重)
```

#### 质量策略 (Quality)
```
评分:
  Qwen: 85分 (输出完整，代码规范)
  iFlow: 78分 (输出较短，无代码)
  Claude: 92分 (输出完整，有注释，有示例)

胜出: Claude (最高分)
```

#### 共识策略 (Consensus)
```
加权相似度:
  Qwen (1.0) + Claude (1.2) 相似度 85% → 2.2
  iFlow (0.95) 独立 → 0.95

胜出: {Qwen, Claude} 簇中权重最高的 Claude
```

---

### 5. 冲突检测和解决

```javascript
// 检测文件冲突
const conflicts = environment.detectConflicts();

// 冲突示例
[
  {
    type: 'concurrent_modification',
    filePath: 'src/utils.js',
    modifiers: ['qwen', 'iflow'],
    severity: 'warning',
    modifications: [
      { cli: 'qwen', timestamp: 1234, operation: 'modified' },
      { cli: 'iflow', timestamp: 1235, operation: 'modified' }
    ]
  }
]

// 解决策略
// 1. 保留最后修改
// 2. 合并修改内容
// 3. 通知CLI重新处理
```

---

## 实现间接协同的关键组件

### StigmergyEnvironment (环境层)
- 状态管理
- 痕迹追踪
- 冲突检测
- 结果缓存

### FileLockManager (锁管理)
- 文件锁获取/释放
- 超时处理
- 死锁预防

### ResultAggregator (结果聚合)
- 多种聚合策略
- 质量评分
- 相似度计算

### StigmergyOrchestrator (编排器)
- 任务分解
- CLI选择
- 协同协调
- 环境集成

---

## 使用示例

### 基础使用

```javascript
const StigmergyOrchestrator = require('./src/core/coordination/nodejs/StigmergyOrchestrator');

const orchestrator = new StigmergyOrchestrator({
  concurrency: 3,
  coordinationMode: 'collaborative',
  aggregationStrategy: 'consensus'
});

const result = await orchestrator.executeConcurrent(
  '实现一个用户认证系统',
  {
    mode: 'collaborative',
    concurrencyLimit: 3,
    timeout: 120000
  }
);

console.log('Selected result:', result.aggregated);
```

### 查看环境状态

```javascript
const summary = orchestrator.getEnvironmentSummary();
console.log('Active agents:', summary.agents.length);
console.log('Collaborations:', summary.metrics.collaborations);
console.log('Conflicts:', summary.conflicts);
```

### 自定义协同

```javascript
// 只让特定CLIs协同
const customCLIs = ['claude', 'qwen', 'gemini'];

const result = await orchestrator.executeConcurrent(task, {
  mode: 'competitive',
  aggregationStrategy: 'quality',
  concurrencyLimit: 3
});
```

---

## 总结

### Stigmergy 协同的核心价值

1. **间接通信**：通过环境而非直接消息通信
2. **正反馈**：成功的结果会被强化和复用
3. **自组织**：CLI根据环境状态自适应行为
4. **鲁棒性**：单个CLI失败不影响整体
5. **可扩展**：易于添加新的CLI和协同策略

### 避免干扰的方法

| 机制 | 作用 | 实现位置 |
|-----|------|---------|
| 文件锁 | 防止并发修改冲突 | FileLockManager |
| 环境感知 | 感知其他CLI的工作 | StigmergyEnvironment |
| 任务分解 | 分配互补任务 | StigmergyOrchestrator |
| 结果聚合 | 智能合并输出 | ResultAggregator |
| 冲突检测 | 发现和解决冲突 | StigmergyEnvironment |

### 最佳实践

1. **选择合适的协同模式**：
   - 简单任务 → parallel
   - 需要最佳结果 → competitive
   - 复杂任务 → collaborative

2. **合理设置并发数**：
   - 资源受限 → 2-3个CLI
   - 资源充足 → 3-5个CLI

3. **监控环境状态**：
   - 定期检查冲突
   - 清理过期痕迹
   - 分析协同效率

4. **优化聚合策略**：
   - 代码生成 → quality
   - 文本生成 → consensus
   - 验证任务 → voting
