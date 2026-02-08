---
name: system-engineering-task-decomposition
description: 基于复杂任务分解和系统工程思维的技能，能够有效把复杂任务分解，并按照系统工程的思维管理多层次分解的子任务和系统集成。能够有效监控任务执行过程中的token消耗，确保任务分解后的复杂程度能够在128k上下文完成。
version: 1.0.0
author: Stigmergy AI Assistant
license: MIT
tags: [system-engineering, task-decomposition, project-management, complexity-analysis, token-monitoring]
compatibility: All AI agents with Python support
metadata:
  domain: project-management
  methodology: system-engineering
  complexity: advanced
  integration_type: task_decomposition_tool
  last_updated: "2026-02-04"
allowed-tools: [python, bash, read_file, write_file, edit]
---

# 系统工程任务分解技能 (System Engineering Task Decomposition)

## 概述

系统工程任务分解技能是一个高级任务管理工具，专门用于将复杂任务分解为可管理的子任务，并按照系统工程的思维管理多层次分解的子任务和系统集成。该技能能够有效监控任务执行过程中的token消耗，确保任务分解后的复杂程度能够在128k上下文内完成。

## 使用时机

当用户请求以下操作时使用此技能：
- 需要分解复杂任务为可管理的子任务
- 需要系统化地管理多层次任务结构
- 需要监控任务执行过程中的资源消耗
- 需要确保任务在指定上下文限制内完成
- 需要应用系统工程原理进行任务规划
- 需要管理任务间的依赖关系和集成

## 快速开始

当用户请求任务分解时：
1. **分析**任务的复杂度和约束条件
2. **选择**合适的分解策略（功能、时序、层次、目标导向等）
3. **分解**任务为可管理的子任务
4. **监控**token消耗和执行进度
5. **集成**子任务成果为整体解决方案

## 核心功能

### 任务复杂度分析
- 评估认知复杂度
- 分析结构复杂度
- 评估不确定性水平
- 分析任务范围（广度和深度）
- 估算资源需求
- 识别风险因素

### 分解策略
- **功能分解法**: 按功能模块分解
- **时序分解法**: 按时间序列分解
- **层次分解法**: 按层级结构分解
- **目标导向分解法**: 按目标导向分解
- **资源约束分解法**: 按资源约束分解
- **风险驱动分解法**: 按风险驱动分解

### Token消耗监控
- 实时监控Token使用情况
- 预测性Token消耗分析
- Token优化建议
- 上下文管理

### 任务管理
- 子任务调度
- 资源分配
- 进度监控
- 依赖关系管理

## 使用方法

### 基本用法
```python
from system_engineering_skill import SystemEngineeringSkill

# 创建技能实例
skill = SystemEngineeringSkill(max_context_size=128000)

# 执行任务分解
result = skill.execute_task_decomposition(
    task_description="需要完成的复杂任务描述",
    available_resources={
        "developers": {"count": 3, "skill_level": "mid"},
        "time": {"available_days": 30},
        "tools": ["IDE", "version_control"]
    },
    constraints={
        "deadline": "2023-12-31",
        "budget": "medium",
        "technology": ["Python", "Django"]
    },
    decomposition_method="hierarchical"  # 或 "functional", "temporal", "goal_oriented", "resource_based", "risk_driven"
)
```

### 高级用法
```python
# 自定义优化目标
result = skill.execute_task_decomposition(
    task_description="复杂系统开发任务",
    optimization_objectives=["efficiency", "quality", "risk_minimization"]
)
```

## 输出格式

```json
{
  "task_id": "unique-task-id",
  "complexity_analysis": {
    "overall_complexity": "moderate",
    "cognitive_load": "high",
    "structural_complexity": "hierarchical",
    "uncertainty_level": "knowable",
    "scope_analysis": {
      "breadth": "medium",
      "depth": "deep"
    },
    "resource_requirements": {
      "time": 45,
      "personnel": 3,
      "computing": 2,
      "tools": ["advanced_analysis", "dependency_management"]
    },
    "risk_factors": [
      {
        "type": "cognitive",
        "description": "任务复杂度过高可能导致执行困难",
        "severity": "high"
      }
    ],
    "recommended_depth": 3
  },
  "decomposition_strategy": {
    "method": "hierarchical",
    "optimization_objectives": ["efficiency", "quality"],
    "granularity_optimization": {
      "subtasks_count": 7,
      "average_effort_per_task": 12
    }
  },
  "subtask_breakdown": [
    {
      "id": "hier_subtask_1",
      "name": "任务规划",
      "description": "复杂系统开发任务的任务规划",
      "type": "hierarchical_level1",
      "estimated_effort": {
        "person_hours": 16,
        "tokens_required": 4000
      },
      "dependencies": [],
      "resources_needed": {
        "default": {
          "quantity": 1,
          "type": "generic"
        }
      }
    }
  ],
  "execution_plan": {
    "critical_path": ["hier_subtask_1"],
    "parallel_opportunities": [
      {
        "group": "independent_tasks",
        "tasks": ["hier_subtask_1", "hier_subtask_4", "hier_subtask_7"]
      }
    ],
    "bottleneck_points": [
      {
        "task_id": "hier_subtask_2",
        "reason": "工作量大",
        "severity": "high"
      }
    ],
    "contingency_plans": [
      {
        "trigger": "任务延期",
        "action": "重新评估资源分配，调整优先级",
        "fallback": "缩小任务范围或延长截止日期"
      }
    ],
    "timeline_estimate": "预计 15 个工作日"
  },
  "quality_assurance": {
    "validation_criteria": ["任务规划完成标准验证"],
    "progress_metrics": ["任务规划进度跟踪"],
    "risk_mitigation": [
      "定期风险评估",
      "质量门检查",
      "阶段性评审"
    ],
    "success_indicators": ["任务规划成功完成"]
  },
  "monitoring_data": {
    "initial_status": {
      "total_tasks": 7,
      "completed_tasks": 0,
      "in_progress_tasks": 0,
      "failed_tasks": 0,
      "completion_rate": 0.0,
      "global_remaining_tokens": 118000,
      "global_used_tokens": 0,
      "global_token_utilization": 0.0
    },
    "hierarchy_summary": {
      "info": {
        "task_id": "task-1234567890",
        "name": "Root Task",
        "status": "pending",
        "token_budget": 50000,
        "token_used": 0,
        "remaining_budget": 50000,
        "completion_percentage": 0.0,
        "duration": 0
      },
      "children": [
        {
          "info": {
            "task_id": "hier_subtask_1",
            "name": "任务规划",
            "status": "pending",
            "token_budget": 8000,
            "token_used": 0,
            "remaining_budget": 8000,
            "completion_percentage": 0.0,
            "duration": 0
          },
          "children": []
        }
      ]
    }
  }
}
```

## 质量标准

- 任务分解的完整性和准确性
- Token消耗控制的有效性
- 子任务间的依赖关系清晰
- 资源分配的合理性
- 风险识别的全面性
- 执行计划的可行性

## 系统集成

此技能与其他系统组件的集成方式：
- 与上下文管理系统协作，确保token使用在限制范围内
- 与任务调度系统协作，管理子任务的执行顺序
- 与监控系统协作，提供实时进度和资源使用情况

## 完成标志

完成高质量的任务分解应该：
1. 提供完整的任务复杂度分析
2. 生成合理的子任务分解结构
3. 制定可行的执行计划
4. 识别并规划风险缓解措施
5. 确保token消耗在预设限制内

---

*此技能为复杂任务分解和系统工程管理提供专业的框架和工具，确保任务在资源约束内高效完成。*