# Qwen CLI Subagent 真实测试计划

**测试日期**: 2026-03-30  
**测试环境**: Qwen CLI (当前环境)  
**测试方法**: 使用 Qwen CLI 的 task 和 subagent 机制

---

## 测试策略

### 使用 Qwen CLI Subagent 机制

**不是**：
- ❌ 调用外部 qwen CLI
- ❌ Python 脚本模拟
- ❌ 批处理命令

**而是**：
- ✅ 使用当前 Qwen CLI 环境的 subagent 机制
- ✅ Dispatch subagent 作为学生
- ✅ Subagent 与实训 Skill 交互
- ✅ 监控和验证测试结果

### Subagent Dispatch 流程

```
1. 创建测试计划
   ↓
2. Dispatch Subagent as Student (张三)
   ↓
3. Subagent interacts with Training Skill
   ↓
4. Monitor interaction
   ↓
5. Validate results
   ↓
6. Write test report
```

---

## 测试用例

### 测试用例 1: 商品上架实训

**Subagent Persona**:
```
姓名：张三
年龄：20 岁
专业：电商运营
水平：初学者
目标：学习商品上架全流程
```

**测试步骤**：
1. Dispatch subagent 作为学生张三
2. Subagent 启动实训：`python train-product-listing/skill.py`
3. Subagent 完成情境导入
4. Subagent 完成市场调研（LLM 引导）
5. Subagent 完成商品录入
6. Subagent 完成定价策略（LLM 引导）
7. Subagent 完成复盘总结
8. 验证测试结果

**验证点**：
- ✅ Skill 是否成功加载
- ✅ LLM 引导是否清晰有效
- ✅ Subagent 是否理解每个步骤
- ✅ 能力是否得到发展
- ✅ 场景是否对齐真实业务

### 测试用例 2: 定价策略实训

**Subagent Persona**:
```
姓名：李四
年龄：21 岁
专业：电商运营
水平：中级
目标：学习定价策略
```

**测试步骤**：
1. Dispatch subagent 作为学生李四
2. Subagent 启动实训
3. Subagent 完成成本分析（LLM 引导）
4. Subagent 完成竞品调研
5. Subagent 完成定价策略制定（LLM 引导）
6. Subagent 完成复盘总结
7. 验证测试结果

### 测试用例 3: 客户服务实训

**Subagent Persona**:
```
姓名：王五
年龄：19 岁
专业：电商运营
水平：初学者
目标：学习客户服务
```

**测试步骤**：
1. Dispatch subagent 作为学生王五
2. Subagent 启动实训
3. Subagent 处理客户咨询（LLM 引导）
4. Subagent 处理客户投诉（LLM 引导）
5. Subagent 完成客户维护
6. Subagent 完成复盘总结
7. 验证测试结果

---

## 测试执行

### 第一步：创建测试 Task

**Task**: 测试 20 个实训 Skills

**Subtasks**:
1. 测试商品上架实训（张三）
2. 测试定价策略实训（李四）
3. 测试商品优化实训（赵六）
4. 测试商品分析实训（孙七）
5. 测试订单处理实训（周八）
6. 测试异常订单处理（吴九）
7. 测试物流管理实训（郑十）
8. 测试客户服务实训（王五）
9. 测试客户维护实训（李四）

### 第二步：Dispatch Subagents

**Subagent 1: 张三（商品上架实训）**
```
Role: 电商专业学生，20 岁，初学者
Task: 完成商品上架实训
Goal: 学习市场调研、商品录入、定价策略
```

**Subagent 2: 李四（定价策略实训）**
```
Role: 电商专业学生，21 岁，中级
Task: 完成定价策略实训
Goal: 学习成本分析、竞品调研、定价策略
```

**Subagent 3: 王五（客户服务实训）**
```
Role: 电商专业学生，19 岁，初学者
Task: 完成客户服务实训
Goal: 学习客户沟通、投诉处理
```

### 第三步：监控交互

**监控点**：
- Subagent 是否理解情境导入？
- LLM 引导是否清晰有效？
- Subagent 是否能完成每个步骤？
- Subagent 是否学到能力？

### 第四步：验证结果

**验证清单**：
- [ ] Skill 加载成功
- [ ] LLM 引导有效
- [ ] Subagent 理解流程
- [ ] 能力得到发展
- [ ] 场景对齐真实业务

### 第五步：编写报告

**测试报告**：
- 测试结果（通过/失败）
- 对话记录
- 发现的问题
- 改进建议
- 总体评估

---

## 预期输出

### 测试报告格式

```markdown
# 实训 Skill 测试报告 - [Skill 名称]

**测试日期**: 2026-03-30  
**Subagent**: [姓名、年龄、专业、水平]  
**测试环境**: Qwen CLI

## 测试结果

### Skill 加载
- [ ] ✅/❌ Skill 加载成功
- [ ] ✅/❌ 元数据有效

### LLM 引导
- [ ] ✅/❌ LLM 理解场景
- [ ] ✅/❌ 引导清晰有效
- [ ] ✅/❌ 反馈有帮助

### 能力发展
- [ ] ✅/❌ 能力得到发展
- [ ] ✅/❌ 目标达成

### 场景对齐
- [ ] ✅/❌ 对齐真实业务
- [ ] ✅/❌ 数据真实

## 对话记录

[关键对话片段]

## 问题和建议

[发现的问题和改进建议]

## 总体评估

[通过/待改进/失败]
```

---

## 执行计划

### 阶段 1: 准备（5 分钟）
- 创建测试计划
- 准备 subagent personas
- 设定验证标准

### 阶段 2: 执行（60 分钟）
- Dispatch 9 个 subagents
- 每个 subagent 测试 1 个 Skill
- 监控交互过程

### 阶段 3: 验证（20 分钟）
- 收集测试结果
- 验证能力发展
- 识别问题

### 阶段 4: 报告（15 分钟）
- 编写测试报告
- 提出改进建议
- 更新 Skills

---

**测试计划版本**: v1.0  
**测试日期**: 2026-03-30  
**测试环境**: Qwen CLI (当前环境)  
**测试方法**: Subagent 机制  
**状态**: ✅ 准备执行测试
