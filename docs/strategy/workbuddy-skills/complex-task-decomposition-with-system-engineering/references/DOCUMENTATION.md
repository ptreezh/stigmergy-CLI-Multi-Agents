# 基于复杂任务分解和系统工程思维的技能 - 文档和使用示例

## 概述

本技能实现了基于复杂任务分解和系统工程思维的工作方法，结合了planning-with-files技能的持久化文件管理机制和superpowers插件的并发智能体协调能力。该技能能够将复杂任务分解为独立的子任务，在隔离的上下文中并发执行，并通过持久化文件跟踪整个过程。

## 核心特性

### 1. 持久化文件管理
- 所有任务状态和中间结果保存到文件系统
- 支持任务中断后的恢复
- 提供完整的审计轨迹

### 2. 任务分解与依赖管理
- 自动分析任务结构并进行分解
- 识别任务间的依赖关系
- 优化执行顺序以提高效率

### 3. 上下文隔离
- 每个子任务在独立的上下文中执行
- 防止不同子任务间的意外干扰
- 明确定义输入输出接口

### 4. 并发智能体协调
- 独立子任务并行执行以提高效率
- 依赖任务按序执行以保证正确性
- 智能调度和资源管理

## 文件结构

### 主要文件
- `task_decomposition.md` - 任务分解结构和状态跟踪
- `system_architecture.md` - 系统架构设计和组件关系
- `progress_tracker.md` - 详细进度跟踪和里程碑
- `context_isolation.md` - 子任务上下文隔离记录
- `dependency_map.md` - 任务依赖关系图
- `error_log.md` - 错误记录和解决方案
- `aggregated_results.md` - 最终结果聚合

### 脚本文件
- `task_analyzer.sh` - 任务分析和分解脚本
- `context_manager.sh` - 上下文隔离管理脚本
- `agent_coordinator.sh` - 并发智能体协调器

### 子任务上下文目录
- `subtask_X_context/` - 每个子任务的独立执行环境

## 使用方法

### 方法1：自动任务分解和执行
```bash
# 初始化任务分解
bash skills/complex-task-decomposition-with-system-engineering/task_analyzer.sh "实现一个复杂的软件功能"

# 启动智能体协调器
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh init

# 分配任务给智能体
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "1" "需求分析" "none"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "2" "架构设计" "none"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "3" "编码实现" "1,2"

# 启动智能体执行
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh launch "1" "requirement_analysis.sh" "input_data"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh launch "2" "arch_design.sh" "input_data"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh launch "3" "implementation.sh" "input_data"

# 等待完成并聚合结果
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh wait
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh aggregate
```

### 方法2：使用高级封装脚本
```bash
# 创建高级封装脚本
cat > complex_task_executor.sh << 'EOF'
#!/bin/bash
# 高级任务执行器

TASK_DESCRIPTION="$1"

if [ -z "$TASK_DESCRIPTION" ]; then
    echo "用法: $0 '<任务描述>'"
    exit 1
fi

echo "开始处理复杂任务: $TASK_DESCRIPTION"

# 1. 任务分析和分解
echo "步骤1: 任务分析和分解"
bash skills/complex-task-decomposition-with-system-engineering/task_analyzer.sh "$TASK_DESCRIPTION"

# 2. 初始化协调器
echo "步骤2: 初始化智能体协调器"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh init

# 3. 根据任务类型分配子任务（示例）
case "$TASK_DESCRIPTION" in
    *"软件开发"*)
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "1" "需求分析" "none"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "2" "架构设计" "1"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "3" "编码实现" "2"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "4" "测试验证" "3"
        ;;
    *"数据分析"*)
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "1" "数据收集" "none"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "2" "数据清洗" "1"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "3" "数据分析" "2"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "4" "结果可视化" "3"
        ;;
    *)
        # 默认分解策略
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "1" "任务理解" "none"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "2" "方案设计" "1"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "3" "执行实施" "2"
        bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "4" "验证评估" "3"
        ;;
esac

# 4. 启动智能体执行（这里需要根据实际情况指定脚本和输入）
# 示例：
# bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh launch "1" "step1_script.sh" "input1"
# bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh launch "2" "step2_script.sh" "input2"
# ...

echo "任务分解完成，请根据具体情况启动相应的智能体执行任务"
EOF

chmod +x complex_task_executor.sh

# 使用示例
./complex_task_executor.sh "开发一个数据分析仪表板"
```

## 使用示例

### 示例1：软件开发项目
假设我们需要开发一个Web应用程序，包含前端、后端和数据库设计。

```bash
# 1. 创建任务描述
TASK="开发一个具有用户认证、数据管理功能的Web应用程序"

# 2. 运行任务分析
bash skills/complex-task-decomposition-with-system-engineering/task_analyzer.sh "$TASK"

# 3. 查看生成的任务分解
cat task_decomposition.md
```

生成的`task_decomposition.md`将包含：
```markdown
# 任务分解文档

## 总体目标
开发一个具有用户认证、数据管理功能的Web应用程序

## 子任务列表
- [x] 任务分析 - 状态: 完成
- [x] 任务分解 - 状态: 完成
- [ ] 系统架构设计 - 状态: 待执行
- [ ] 子任务1: 需求分析 - 状态: 待执行
- [ ] 子任务2: 数据库设计 - 状态: 待执行
- [ ] 子任务3: 后端API开发 - 状态: 待执行
- [ ] 子任务4: 前端界面开发 - 状态: 待执行
- [ ] 子任务5: 集成测试 - 状态: 待执行
- [ ] 子任务6: 部署上线 - 状态: 待执行

## 依赖关系
- 系统架构设计依赖于任务分解的完成
- 子任务3依赖于子任务2的完成
- 子任务4依赖于子任务2的完成
- 子任务5依赖于子任务3和子任务4的完成
- 子任务6依赖于子任务5的完成

## 执行时间线
- 预计开始时间: Wed Feb 4 10:30:00 CST 2026
- 预计完成时间: TBD
- 关键里程碑: 架构设计完成、后端API完成、前端界面完成、集成测试完成
```

### 示例2：数据分析项目
假设我们需要分析销售数据并生成报告。

```bash
# 1. 创建任务描述
TASK="分析2025年销售数据，识别趋势并生成可视化报告"

# 2. 运行任务分析
bash skills/complex-task-decomposition-with-system-engineering/task_analyzer.sh "$TASK"

# 3. 初始化协调器
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh init

# 4. 分配任务
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "1" "数据收集和清洗" "none"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "2" "探索性数据分析" "1" 
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "3" "趋势识别" "2"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "4" "可视化制作" "3"
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "5" "报告生成" "4"

# 5. 启动智能体（需要准备相应的脚本）
# 这里只是示例，实际需要创建对应的脚本
```

## 高级功能

### 动态任务调整
系统支持在执行过程中动态调整任务分解：

```bash
# 检查当前任务状态
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh check

# 如果某个任务失败，可以重新分配
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh error "3" "后端API开发遇到问题，需要重新设计"

# 根据错误信息调整任务
bash skills/complex-task-decomposition-with-system-engineering/agent_coordinator.sh assign "3_updated" "后端API重新设计" "2"
```

### 资源优化
系统会自动监控资源使用情况并优化分配：

```bash
# 查看进度跟踪
cat progress_tracker.md

# 查看协调日志
cat coordination_log.md

# 查看错误日志
cat error_log.md
```

## 最佳实践

### 1. 任务分解原则
- 保持子任务的相对独立性
- 确保子任务规模合理（既不过大也不过小）
- 明确定义子任务的输入输出接口

### 2. 上下文隔离原则
- 为每个子任务分配独立的工作空间
- 避免子任务间的意外数据共享
- 使用版本控制管理中间结果

### 3. 并发执行原则
- 仅对真正独立的任务进行并行化
- 合理控制并发度以避免资源竞争
- 实现适当的同步机制处理依赖

### 4. 错误处理原则
- 记录所有执行错误和异常情况
- 实现回滚机制处理失败的子任务
- 提供详细的错误诊断信息

## 集成与扩展

### 与其他技能的协作
此技能可以与其他技能结合使用：

```bash
# 与planning-with-files技能结合
# 在任务分解前先创建规划文件
cat > task_plan.md << EOF
# 任务计划

## 目标
$(cat task_decomposition.md | grep "## 总体目标" -A 1 | tail -1)

## 阶段
$(cat task_decomposition.md | grep "## 子任务列表" -A 20 | head -10)

## 决策
- 使用复杂任务分解技能进行任务管理
- 采用并发智能体提高执行效率
EOF
```

### 工具集成
可以与各种开发和分析工具集成：

```bash
# 集成Git进行版本控制
git init
git add task_decomposition.md system_architecture.md progress_tracker.md
git commit -m "Initial task decomposition for complex project"

# 集成测试框架
# 在子任务完成后自动运行测试
```

## 故障排除

### 常见问题
1. **任务分解不充分**：如果子任务之间存在过多依赖，可能需要进一步细分
2. **资源竞争**：如果并发执行导致性能下降，需要调整并发度
3. **上下文泄漏**：如果子任务间出现数据污染，需要加强隔离

### 调试技巧
- 检查`error_log.md`获取详细的错误信息
- 查看`coordination_log.md`了解智能体执行情况
- 使用`progress_tracker.md`跟踪任务进展

## 总结

基于复杂任务分解和系统工程思维的技能提供了一种结构化的方法来处理复杂的多步骤任务。通过将任务分解为独立的子任务，在隔离的上下文中并发执行，并使用持久化文件跟踪整个过程，该技能能够显著提高复杂任务的执行效率和可靠性。

该技能特别适用于：
- 复杂的软件开发项目
- 多步骤的数据分析任务
- 系统集成项目
- 需要多方协作的任务

通过结合planning-with-files的持久化管理机制和superpowers的并发智能体协调能力，该技能实现了系统工程思维在AI辅助任务管理中的有效应用。