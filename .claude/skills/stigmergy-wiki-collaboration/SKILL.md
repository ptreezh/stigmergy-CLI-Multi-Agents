---
name: stigmergy-wiki-collaboration
description: Stigmergy Wiki协同编辑技能，支持多用户Wiki创建、编辑、知识整合。当用户需要协同编辑Wiki、创建知识体系、整合多源信息、专业角色分析时激活。
allowed-tools: ["bash", "text_editor", "web_search"]
---

# Stigmergy Wiki协同编辑技能

## 触发条件
当用户请求涉及以下任一任务时，激活本技能：
- 创建或编辑Wiki词条
- 多用户协同知识编辑
- 专业知识体系构建
- 多源信息整合
- Wiki主题管理和组织
- 协作编辑流程管理

## 核心工作流程

### 第一步：任务理解和主题识别
1. 分析用户需求和任务目标
2. 识别Wiki主题类型（技术/学术/实践）
3. 确定协同编辑需求
4. 运行 `scripts/task_analyzer.py` 进行深度分析
5. 评估任务复杂度和优先级

### 第二步：专业角色设定
1. 根据主题领域选择合适专业角色
2. 参考 `references/roles.md` 中的角色模板
3. 配置角色背景、专长和分析视角
4. 识别潜在偏见并制定调整策略
5. 建立多角色协作机制

### 第三步：多源知识获取
1. 使用web_search工具获取相关资料
2. 运行 `scripts/knowledge_collector.py` 收集知识
3. 整合多源信息（学术/技术/实践）
4. 构建知识图谱和关联网络
5. 验证信息可靠性和时效性

### 第四步：智能协同编辑
1. 运行 `scripts/collaborative_editor.py` 协同编辑
2. 生成结构化的编辑提案
3. 实现多版本控制和冲突解决
4. 提供实时协作支持
5. 维护编辑历史和变更追踪

### 第五步：质量控制和优化
1. 运行 `scripts/wiki_quality_checker.py` 质量评估
2. 多角度内容审核
3. 专业知识准确性验证
4. 协作效果评估
5. 持续改进建议生成

## 具体实施指南

### 创建新Wiki主题
```
当用户说"创建机器学习Wiki"时：
1. 运行: bash("python scripts/task_analyzer.py --task '创建机器学习Wiki'")
2. 参考: references/topic_templates.md
3. 执行: bash("python scripts/knowledge_collector.py --topic '机器学习'")
4. 协同: bash("python scripts/collaborative_editor.py --create 'machine-learning'")
5. 质检: bash("python scripts/wiki_quality_checker.py --topic 'machine-learning'")
```

### 多用户协同编辑
```
当用户说"多人编辑区块链Wiki"时：
1. 运行: bash("python scripts/task_analyzer.py --task '多人编辑区块链Wiki' --collaborative")
2. 参考: references/collaboration_guidelines.md
3. 执行: bash("python scripts/collaborative_editor.py --collaborative 'blockchain'")
4. 冲突: bash("python scripts/conflict_resolver.py --topic 'blockchain'")
5. 同步: bash("python scripts/sync_manager.py --topic 'blockchain'")
```

### 知识体系整合
```
当用户说"整合AI知识体系"时：
1. 运行: bash("python scripts/task_analyzer.py --task '整合AI知识体系'")
2. 参考: references/knowledge_integration.md
3. 执行: bash("python scripts/knowledge_collector.py --domain 'artificial-intelligence'")
4. 整合: bash("python scripts/knowledge_integrator.py --domain 'AI'")
5. 构建: bash("python scripts/knowledge_graph_builder.py --domain 'AI'")
```

## 支持工具和脚本

### 任务分析器
- 文件：`scripts/task_analyzer.py`
- 功能：深度分析用户任务需求
- 使用：`python scripts/task_analyzer.py --task "任务描述" --collaborative`

### 知识收集器
- 文件：`scripts/knowledge_collector.py`
- 功能：多源知识收集和整合
- 使用：`python scripts/knowledge_collector.py --topic "主题" --sources "all"`

### 协同编辑器
- 文件：`scripts/collaborative_editor.py`
- 功能：多用户协同编辑支持
- 使用：`python scripts/collaborative_editor.py --action "create/edit" --topic "主题"`

### 质量检查器
- 文件：`scripts/wiki_quality_checker.py`
- 功能：Wiki内容质量评估
- 使用：`python scripts/wiki_quality_checker.py --topic "主题" --comprehensive`

### 冲突解决器
- 文件：`scripts/conflict_resolver.py`
- 功能：编辑冲突检测和解决
- 使用：`python scripts/conflict_resolver.py --topic "主题" --auto-resolve`

## 支持文档和模板

### 专业角色模板
- 文件：`references/roles.md`
- 功能：提供多领域专业角色定义
- 包含：技术专家、学者、从业者等角色

### 主题模板
- 文件：`references/topic_templates.md`
- 功能：标准化Wiki主题结构
- 包含：技术、学术、实践等类型模板

### 协作指南
- 文件：`references/collaboration_guidelines.md`
- 功能：多用户协作编辑规范
- 包含：协作流程、冲突解决、质量控制

### 知识整合指南
- 文件：`references/knowledge_integration.md`
- 功能：多源知识整合方法论
- 包含：信息验证、关联建立、图谱构建

## 协作编辑特性

### 多用户支持
- 实时协作编辑
- 用户权限管理
- 编辑锁机制
- 变更追踪

### 版本控制
- Git集成版本管理
- 分支和合并支持
- 历史版本查看
- 回滚和恢复

### 冲突解决
- 智能冲突检测
- 自动冲突解决
- 人工审核机制
- 协商解决流程

### 质量保证
- 多层次质量检查
- 专业角色审核
- 内容准确性验证
- 持续改进建议

## 智能化特性

### 自适应任务处理
- 根据任务复杂度自动调整处理策略
- 智能选择合适的专业角色组合
- 动态优化知识收集范围
- 自适应质量控制标准

### 多角色协作
- 智能角色匹配和组合
- 角色间协作流程优化
- 偏见识别和平衡机制
- 协作效果评估

### 知识图谱构建
- 自动识别概念关联
- 智能构建知识网络
- 动态更新和优化
- 可视化支持

## 质量标准

### 内容质量
- 准确性：专业知识准确无误
- 完整性：覆盖主题核心方面
- 时效性：信息保持最新状态
- 权威性：来源可靠可验证

### 协作质量
- 参与度：多用户积极参与
- 协调性：协作流程顺畅
- 一致性：编辑风格统一
- 效率性：协作效率高

### 技术质量
- 性能：系统响应快速
- 稳定性：运行稳定可靠
- 安全性：数据安全保障
- 可扩展性：支持扩展需求

## 常见问题处理

### 协作冲突
1. 智能检测冲突点
2. 分析冲突原因
3. 提供解决方案
4. 协商解决机制

### 知识质量
1. 多源交叉验证
2. 专业角色审核
3. 可靠性评估
4. 持续更新机制

### 系统性能
1. 性能监控和优化
2. 资源管理
3. 缓存策略
4. 负载均衡

## 技能边界和限制

- 依赖网络连接进行知识搜索
- 协作效果受用户参与度影响
- 知识质量受限于可用资料
- 需要适当的存储和计算资源

## 扩展和自定义

### 添加新专业角色
1. 在 `references/roles.md` 中定义新角色
2. 更新角色选择算法
3. 测试角色协作效果
4. 优化角色配置

### 集成新知识源
1. 修改 `scripts/knowledge_collector.py`
2. 添加新的数据源接口
3. 更新知识整合逻辑
4. 测试数据源可靠性

### 自定义质量标准
1. 更新 `scripts/wiki_quality_checker.py`
2. 调整评估指标和权重
3. 添加领域特定检查
4. 优化质量报告格式