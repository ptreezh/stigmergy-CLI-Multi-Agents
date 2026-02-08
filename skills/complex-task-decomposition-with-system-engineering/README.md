# 基于复杂任务分解和系统工程思维的技能

## 概述

这是一个高级技能，结合了planning-with-files技能的持久化文件管理机制和superpowers插件的并发智能体协调能力，用于处理复杂的多步骤任务。该技能通过系统工程思维将大任务分解为独立的子任务，在隔离的上下文中并发执行，并通过持久化文件跟踪整个过程。

## 核心组件

### 1. 持久化文件管理系统
- `task_decomposition.md` - 任务分解结构和状态跟踪
- `system_architecture.md` - 系统架构设计和组件关系
- `progress_tracker.md` - 详细进度跟踪和里程碑
- `context_isolation.md` - 子任务上下文隔离记录
- `dependency_map.md` - 任务依赖关系图
- `error_log.md` - 错误记录和解决方案
- `aggregated_results.md` - 最终结果聚合

### 2. 任务分析和分解引擎 (`task_analyzer.sh`)
- 分析用户请求的复杂度和范围
- 识别任务的主要组成部分
- 自动创建任务分解文件
- 定义任务分解策略

### 3. 上下文隔离管理器 (`context_manager.sh`)
- 为每个子任务创建独立的工作目录
- 实现变量空间隔离
- 定义清晰的输入输出接口
- 验证隔离有效性

### 4. 并发智能体协调器 (`agent_coordinator.sh`)
- 分配子任务给不同的智能体
- 管理智能体的生命周期
- 处理任务依赖关系
- 聚合执行结果

## 架构设计

```
用户请求
    ↓
任务分析器 (task_analyzer.sh)
    ↓
任务分解与依赖分析
    ↓
持久化文件创建
    ↓
智能体协调器 (agent_coordinator.sh)
    ↓
并发智能体执行
    ↓
状态同步与错误处理
    ↓
结果聚合
    ↓
最终输出
```

## 安装和使用

### 安装
将整个 `complex-task-decomposition-with-system-engineering` 目录放置在技能目录中：

```bash
# 技能目录结构
skills/
└── complex-task-decomposition-with-system-engineering/
    ├── SKILL.md
    ├── task_analyzer.sh
    ├── context_manager.sh
    ├── agent_coordinator.sh
    ├── DOCUMENTATION.md
    └── README.md (本文件)
```

### 基本使用
```bash
# 1. 分析和分解任务
bash skills/complex-task-decomposition-with-system-engineering/task_analyzer.sh "你的复杂任务描述"

# 2. 初始化协调器
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh init

# 3. 分配任务给智能体
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign <agent_id> <task_description> <dependencies>

# 4. 启动智能体执行
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh launch <agent_id> <script_path> <input_data>

# 5. 等待完成并聚合结果
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh wait
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh aggregate
```

## 特性

### 1. 系统工程思维
- 将复杂任务视为一个系统，识别其组成部分和相互关系
- 采用自顶向下的分解方式，逐步细化任务
- 考虑任务间的依赖关系和接口

### 2. 持久化文件管理
- 所有任务状态和中间结果保存到文件系统
- 支持任务中断后的恢复
- 提供完整的审计轨迹

### 3. 上下文隔离
- 每个子任务在独立的上下文中执行
- 防止不同子任务间的意外干扰
- 明确定义输入输出接口

### 4. 并发执行
- 独立子任务并行执行以提高效率
- 依赖任务按序执行以保证正确性
- 合理分配资源避免冲突

## 使用场景

### 1. 复杂软件开发项目
- 需求分析、架构设计、编码实现、测试验证等多个阶段
- 各阶段可并行进行部分工作
- 需要明确的依赖关系管理

### 2. 多步骤数据处理任务
- 数据清洗、转换、分析、可视化等步骤
- 部分数据处理任务可并行执行
- 需要中间结果的持久化存储

### 3. 系统集成项目
- 多个子系统的开发和集成
- 需要接口定义和兼容性验证
- 并行开发以缩短整体周期

## 高级功能

### 动态任务调整
系统支持在执行过程中动态调整任务分解，根据执行情况重新分配任务。

### 资源优化
监控资源使用情况并优化分配，实现负载均衡以提高效率。

### 质量保证
实现结果验证机制，提供质量指标跟踪，支持自动化测试集成。

## 最佳实践

1. **任务分解原则**：保持子任务的相对独立性，确保子任务规模合理
2. **上下文隔离原则**：为每个子任务分配独立的工作空间，避免数据污染
3. **并发执行原则**：仅对真正独立的任务进行并行化，合理控制并发度
4. **错误处理原则**：记录所有执行错误，实现回滚机制，提供详细诊断

## 故障排除

- 检查 `error_log.md` 获取详细的错误信息
- 查看 `coordination_log.md` 了解智能体执行情况
- 使用 `progress_tracker.md` 跟踪任务进展
- 验证上下文隔离是否有效

## 扩展性

该技能设计为模块化结构，易于扩展：
- 可以添加新的任务分析算法
- 可以集成更多的智能体类型
- 可以扩展持久化文件的类型和格式
- 可以增强协调器的调度策略

## 许可证

此技能作为stigmergy-CLI-Multi-Agents项目的一部分，遵循项目的整体许可证。