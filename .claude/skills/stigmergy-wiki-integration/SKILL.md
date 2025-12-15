---
name: stigmergy-wiki-integration
description: Stigmergy Wiki系统集成技能，支持多CLI工具集成、TiddlyWiki部署、知识图谱构建。当用户需要集成Wiki到其他CLI、部署独立Wiki、构建知识体系、多工具协同时激活。
allowed-tools: ["bash", "text_editor", "web_search"]
---

# Stigmergy Wiki系统集成技能

## 触发条件
当用户请求涉及以下任一任务时，激活本技能：
- 集成Wiki到其他CLI工具
- 部署独立的TiddlyWiki实例
- 构建跨工具知识体系
- 多CLI工具协同工作流
- Wiki系统架构设计
- 知识图谱构建和可视化

## 核心集成流程

### 第一步：集成需求分析
1. 分析目标CLI工具特性和能力
2. 评估集成可行性和技术挑战
3. 运行 `scripts/integration_analyzer.py` 分析需求
4. 设计集成架构和接口规范
5. 制定集成实施计划

### 第二步：TiddlyWiki部署
1. 运行 `scripts/tiddlywiki_deployer.py` 部署系统
2. 配置Wiki实例和插件
3. 设置主题和样式
4. 初始化知识结构
5. 验证部署效果

### 第三步：多CLI协同
1. 建立CLI工具间通信机制
2. 运行 `scripts/cli_coordinator.py` 协调工具
3. 实现数据同步和共享
4. 处理工具间冲突和兼容性
5. 优化协同工作流程

### 第四步：知识体系构建
1. 运行 `scripts/knowledge_graph_builder.py` 构建图谱
2. 建立跨工具知识关联
3. 实现智能知识推荐
4. 维护知识更新和同步
5. 提供知识可视化

### 第五步：系统优化监控
1. 运行 `scripts/system_monitor.py` 监控系统
2. 性能优化和瓶颈分析
3. 用户体验改进
4. 系统稳定性维护
5. 持续功能迭代

## 具体实施指南

### 集成到Claude CLI
```
当用户说"将Wiki集成到Claude"时：
1. 运行: bash("python scripts/integration_analyzer.py --target 'claude' --type 'wiki'")
2. 参考: references/claude_integration.md
3. 部署: bash("python scripts/tiddlywiki_deployer.py --target 'claude'")
4. 协调: bash("python scripts/cli_coordinator.py --tools 'claude,wiki'")
5. 测试: bash("python scripts/integration_tester.py --target 'claude'")
```

### 多工具知识协同
```
当用户说"构建多工具知识体系"时：
1. 运行: bash("python scripts/integration_analyzer.py --multi-tool")
2. 参考: references/multi_tool_knowledge.md
3. 构建: bash("python scripts/knowledge_graph_builder.py --cross-tool")
4. 同步: bash("python scripts/data_synchronizer.py --multi-source")
5. 优化: bash("python scripts/system_optimizer.py --knowledge")
```

### 独立Wiki部署
```
当用户说"部署独立Wiki系统"时：
1. 运行: bash("python scripts/integration_analyzer.py --standalone")
2. 参考: references/standalone_deployment.md
3. 部署: bash("python scripts/tiddlywiki_deployer.py --standalone")
4. 配置: bash("python scripts/wiki_configurator.py --custom")
5. 验证: bash("python scripts/deployment_validator.py --comprehensive")
```

## 支持工具和脚本

### 集成分析器
- 文件：`scripts/integration_analyzer.py`
- 功能：分析CLI工具集成需求
- 使用：`python scripts/integration_analyzer.py --target "工具名" --type "集成类型"`

### TiddlyWiki部署器
- 文件：`scripts/tiddlywiki_deployer.py`
- 功能：部署和配置TiddlyWiki实例
- 使用：`python scripts/tiddlywiki_deployer.py --mode "部署模式" --target "目标"`

### CLI协调器
- 文件：`scripts/cli_coordinator.py`
- 功能：协调多CLI工具协同工作
- 使用：`python scripts/cli_coordinator.py --tools "工具列表" --workflow "工作流"`

### 知识图谱构建器
- 文件：`scripts/knowledge_graph_builder.py`
- 功能：构建跨工具知识图谱
- 使用：`python scripts/knowledge_graph_builder.py --domain "领域" --cross-tool`

### 系统监控器
- 文件：`scripts/system_monitor.py`
- 功能：监控系统性能和状态
- 使用：`python scripts/system_monitor.py --comprehensive --alert`

## 支持文档和模板

### 集成指南
- 文件：`references/integration_guidelines.md`
- 功能：提供各类CLI工具集成指南
- 包含：Claude、Gemini、Qwen等工具集成方案

### TiddlyWiki配置
- 文件：`references/tiddlywiki_config.md`
- 功能：TiddlyWiki配置和优化指南
- 包含：插件配置、主题设置、性能优化

### 多工具协同
- 文件：`references/multi_tool_coordination.md`
- 功能：多工具协同工作流程设计
- 包含：通信机制、数据同步、冲突解决

### 知识体系架构
- 文件：`references/knowledge_architecture.md`
- 功能：知识体系设计和实现
- 包含：图谱设计、关联规则、可视化

## 集成特性

### 多CLI工具支持
- Claude CLI集成
- Gemini CLI集成
- Qwen CLI集成
- 自定义CLI工具集成
- 工具间无缝切换

### TiddlyWiki功能
- 单页面Wiki系统
- 丰富的插件生态
- 自定义主题和样式
- 数据导入导出
- 版本控制支持

### 知识图谱
- 智能知识关联
- 可视化知识网络
- 动态知识更新
- 跨工具知识同步
- 个性化知识推荐

### 协同工作流
- 多工具协同编辑
- 实时数据同步
- 冲突检测和解决
- 工作流自动化
- 性能监控优化

## 技术架构

### 系统架构图
```
┌─────────────────────────────────────────────────────┐
│                Stigmergy Wiki集成系统                  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  CLI工具层   │  │  Wiki服务层 │  │  知识管理层 │   │
│  │             │  │             │  │             │   │
│  │ • Claude    │  │ • TiddlyWiki│  │ • 知识图谱   │   │
│  │ • Gemini    │  │ • Wiki引擎  │  │ • 数据同步   │   │
│  │ • Qwen      │  │ • 插件系统  │  │ • 关联分析   │   │
│  │ • 自定义工具 │  │ • API接口   │  │ • 推荐系统   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│         │                │                │           │
│         ▼                ▼                ▼           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              集成协调层                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ 通信管理器   │  │  数据同步器  │  │  冲突解决器  │  │   │
│  │  │             │  │             │  │             │  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  │   │
└─────────────────────────────────────────────────────┘
```

### 数据流架构
```
用户请求 → 集成分析器 → 任务分发器 → 执行器 → 结果聚合 → 用户反馈
    ↓           ↓           ↓         ↓        ↓
  需求分析    工具识别    工具协调   具体执行   结果整合
    ↓           ↓           ↓         ↓        ↓
  架构设计    接口定义    流程控制   数据处理   质量检查
```

## 智能化特性

### 自适应集成
- 根据CLI工具特性自动调整集成策略
- 智能识别工具能力和限制
- 动态优化集成架构
- 自动处理兼容性问题

### 智能知识管理
- 自动识别知识关联
- 智能推荐相关内容
- 动态更新知识图谱
- 个性化知识组织

### 智能协同优化
- 自动优化工作流程
- 智能调度资源使用
- 预测和避免冲突
- 自动性能调优

## 质量保证

### 集成质量标准
- 工具间无缝连接
- 数据一致性保证
- 接口稳定性验证
- 性能基准测试

### 部署质量标准
- 系统稳定性检查
- 功能完整性验证
- 用户体验评估
- 安全性测试

### 协同质量标准
- 工作流效率评估
- 冲突解决效果
- 数据同步准确性
- 用户满意度调查

## 常见问题处理

### 集成冲突
1. 智能检测接口冲突
2. 自动适配不同版本
3. 提供兼容性解决方案
4. 持续监控和优化

### 性能问题
1. 性能瓶颈识别
2. 资源使用优化
3. 缓存策略改进
4. 负载均衡调整

### 数据同步
1. 同步冲突检测
2. 自动冲突解决
3. 数据一致性保证
4. 增量同步优化

## 扩展和定制

### 添加新CLI工具
1. 在 `references/integration_guidelines.md` 中添加工具指南
2. 更新 `scripts/integration_analyzer.py` 支持新工具
3. 测试工具集成效果
4. 优化集成流程

### 自定义Wiki功能
1. 开发自定义插件
2. 扩展Wiki主题
3. 增强编辑功能
4. 优化用户体验

### 知识图谱扩展
1. 添加新的关联规则
2. 扩展知识领域
3. 增强可视化效果
4. 优化推荐算法

## 技能边界和限制

- 依赖CLI工具的API支持
- 集成效果受工具限制影响
- 知识质量依赖数据源
- 需要适当的系统资源

## 最佳实践

### 集成设计
- 采用松耦合架构
- 实现标准化接口
- 保持向后兼容
- 提供降级方案

### 部署运维
- 使用容器化部署
- 实施监控告警
- 定期备份恢复
- 持续性能优化

### 用户体验
- 简化操作流程
- 提供清晰指引
- 及时反馈响应
- 持续改进体验