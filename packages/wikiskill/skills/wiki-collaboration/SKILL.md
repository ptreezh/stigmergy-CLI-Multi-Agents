---
name: wiki-collaboration
description: 双系统Wiki协同编辑技能，支持Claude和Stigmergy系统。智能协同编辑、专业角色分析、知识整合。当用户需要创建Wiki、协同编辑、知识管理、多系统集成时激活。
system: dual
allowed-tools: ["bash", "text_editor", "web_search", "computer"]
---

# Wiki协同编辑技能（双系统支持）

## 系统兼容性
本技能支持双系统运行模式：
- **Claude Skills模式**：遵循Claude Skills规范，渐进式披露
- **Stigmergy模式**：兼容Stigmergy技能系统架构

## 触发条件
当用户请求涉及以下任一任务时，自动激活本技能：
- 创建或编辑Wiki词条
- 多用户协同知识编辑
- 专业知识体系构建
- 多源信息整合
- Wiki主题管理和组织
- 跨系统知识协同

## 双系统工作流程

### Claude Skills模式流程
1. **触发检测**：系统自动识别用户需求
2. **技能加载**：渐进式加载技能内容
3. **工具调用**：使用allowed-tools执行任务
4. **结果返回**：结构化输出结果

### Stigmergy模式流程
1. **技能识别**：Stigmergy系统识别技能调用
2. **上下文加载**：加载技能上下文和配置
3. **功能执行**：执行具体Wiki协同功能
4. **状态管理**：维护技能执行状态

## 核心功能实现

### 智能协同编辑
```bash
# Claude模式：自动触发
用户："创建机器学习Wiki"
→ 系统自动调用wiki-collaboration技能

# Stigmergy模式：显式调用
用户："stigmergy use wiki-collaboration create 机器学习"
→ 系统执行技能功能
```

### 专业角色分析
- **技术专家**：系统架构、开发实践
- **学术专家**：理论研究、方法论
- **行业专家**：实际应用、最佳实践
- **协作专家**：团队协调、流程优化

### 知识整合管理
- 多源信息收集和验证
- 知识图谱构建和可视化
- 跨系统知识同步
- 智能推荐和关联

## 系统适配层

### Claude Skills适配
```yaml
# Claude Skills规范格式
system: dual
allowed-tools: ["bash", "text_editor", "web_search", "computer"]
progressive_disclosure: true
```

### Stigmergy适配
```javascript
// Stigmergy技能系统格式
module.exports = {
  name: 'wiki-collaboration',
  description: 'Wiki协同编辑技能',
  system: 'stigmergy',
  compatibility: 'claude-skills'
};
```

## 具体实施指南

### Claude Skills环境
```
当在Claude环境中使用时：
1. 自动检测用户意图
2. 渐进式加载技能内容
3. 调用相应工具执行任务
4. 返回结构化结果

示例：
用户："帮我创建一个Python编程Wiki"
→ 自动触发技能
→ 执行Wiki创建流程
→ 返回创建结果
```

### Stigmergy环境
```
当在Stigmergy环境中使用时：
1. 通过命令显式调用
2. 加载技能配置和上下文
3. 执行具体功能模块
4. 管理执行状态

示例：
stigmergy call wiki-collaboration create --topic "Python编程"
→ 加载技能配置
→ 执行创建模块
→ 返回执行状态
```

### 混合环境
```
当在混合环境中使用时：
1. 自动检测运行环境
2. 选择合适的执行模式
3. 保持功能一致性
4. 提供统一接口

示例：
用户："创建Python编程Wiki"
→ 检测环境类型
→ 选择执行模式
→ 统一功能执行
```

## 支持工具和脚本

### 通用脚本（双系统兼容）
- `scripts/task_analyzer.py`：任务分析器
- `scripts/collaborative_editor.py`：协同编辑器
- `scripts/knowledge_integrator.py`：知识整合器
- `scripts/quality_checker.py`：质量检查器

### Claude Skills专用
- `references/claude_integration.md`：Claude集成指南
- `templates/claude_workflow.md`：Claude工作流模板

### Stigmergy专用
- `references/stigmergy_integration.md`：Stigmergy集成指南
- `templates/stigmergy_workflow.md`：Stigmergy工作流模板

## 双系统特性

### 统一功能接口
- 相同的核心功能实现
- 一致的数据结构
- 统一的错误处理
- 兼容的输出格式

### 环境自适应
- 自动检测运行环境
- 智能选择执行模式
- 动态调整参数配置
- 保持功能完整性

### 状态同步
- 跨系统状态管理
- 数据一致性保证
- 冲突检测和解决
- 实时状态同步

## 质量保证

### 功能一致性
- 双系统功能对等
- 接口规范统一
- 行为表现一致
- 结果格式兼容

### 性能优化
- 环境特定优化
- 资源使用优化
- 响应时间优化
- 并发处理优化

### 兼容性测试
- 双系统兼容性验证
- 接口兼容性测试
- 数据格式兼容性
- 功能完整性测试

## 使用示例

### Claude Skills环境
```markdown
用户请求："创建一个关于深度学习的Wiki"

系统响应：
1. 自动识别Wiki创建需求
2. 加载wiki-collaboration技能
3. 执行深度分析
4. 生成专业内容
5. 返回结构化结果
```

### Stigmergy环境
```bash
用户命令：
stigmergy call wiki-collaboration create --topic "深度学习" --domain "technical"

系统响应：
1. 加载wiki-collaboration技能
2. 解析命令参数
3. 执行创建流程
4. 返回执行结果
5. 更新技能状态
```

### 混合环境
```markdown
用户请求："创建深度学习Wiki，并在Claude和Stigmergy中同步"

系统响应：
1. 检测混合环境需求
2. 选择双系统执行模式
3. 并行执行创建任务
4. 保持数据同步
5. 返回统一结果
```

## 扩展和定制

### 添加新系统支持
1. 在系统适配层添加新系统接口
2. 实现系统特定的功能映射
3. 测试新系统兼容性
4. 更新文档和示例

### 自定义功能扩展
1. 在核心功能层添加新功能
2. 实现双系统兼容接口
3. 更新配置和模板
4. 测试功能一致性

### 性能优化
1. 分析系统特定性能瓶颈
2. 实现针对性优化方案
3. 测试优化效果
4. 更新性能基准

## 技能边界和限制

- 双系统功能对等性限制
- 环境特定功能差异
- 性能表现差异
- 兼容性维护成本

## 最佳实践

### 开发原则
- 保持双系统功能一致
- 优先核心功能实现
- 渐进式功能扩展
- 持续兼容性维护

### 测试策略
- 双系统并行测试
- 功能一致性验证
- 性能基准对比
- 兼容性回归测试

### 维护策略
- 定期兼容性检查
- 及时修复兼容问题
- 同步功能更新
- 用户反馈收集