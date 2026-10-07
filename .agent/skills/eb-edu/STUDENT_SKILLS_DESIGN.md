# 电商 AI 实训平台 - 学生 Skills 设计理念

**版本**: v8.0 (学生能力本位)  
**创建日期**: 2026-03-30  
**核心理念**: LLM 个性化问答引导 → 学生决策 → 调用基础 Skill 执行

---

## 一、核心设计理念

### 1.1 为什么要 LLM 引导？

**传统操作的问题**:
```
学生： "帮我上架这件商品"
AI:    "好的，请告诉我商品信息"
学生： "夏季连衣裙，199 元"
AI:    ✅ 已上架

学生学到了什么？
❌ 商品标题如何优化
❌ 定价策略如何思考
❌ 卖点如何提炼
❌ 决策依据是什么
```

**LLM 引导的设计**:
```
学生： "我要学习商品上架"
AI:    "好的！AI 导师会引导你完成上架方案"

环节 1: 标题优化
  学生拟定标题 → 🤖 LLM 评估 → 指出改进点 → 学生修改
  
环节 2: 定价策略
  学生制定价格 → 说明理由 → 🤖 LLM 评估 → 指出遗漏因素
  
环节 3: 卖点提炼
  学生提炼卖点 → 🤖 LLM 评估 → 差异化分析 → 改进建议
  
环节 4: 决策确认
  完整方案 → 学生确认
  
环节 5: 调用基础 Skill 执行
  学生决策 → 调用 eb-edu-medusa-create-product → 真正上架

学生学到:
✅ 商品标题优化方法
✅ 定价策略思维
✅ 卖点提炼技巧
✅ 决策依据意识
```

---

## 二、学生 Skills 分类

### 2.1 引导型 Skills（推荐用于教学）

| Skill | 培养能力 | LLM 引导环节 | 调用基础 Skill |
|-------|---------|-------------|---------------|
| `eb-edu-create-product-guided` | 标题优化 + 定价 + 卖点 | 3 个环节 | `eb-edu-medusa-create-product` |
| `eb-edu-product-listing-ai-training` | 市场分析 + 定价 + 卖点 | 4 个环节 | `eb-edu-medusa-create-product` |
| `eb-edu-competitor-analysis-training` | 数据解读 + 市场洞察 | 分析引导 | 无（纯分析） |

### 2.2 基础 Skills（用于快速操作）

| Skill | 功能 | 特点 |
|-------|------|------|
| `eb-edu-medusa-create-product` | 创建商品 | 直接执行，无引导 |
| `eb-edu-medusa-create-order` | 创建订单 | 直接执行，无引导 |
| `eb-edu-submit-project` | 提交实训 | 直接执行，无引导 |

---

## 三、引导型 Skill 设计模式

### 3.1 标准流程

```
┌─────────────────────────────────────────────────────────────────┐
│  引导型 Skill 标准流程                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  环节 1: LLM 引导 - 标题优化                                    │
│  学生拟定 → LLM 评估 → 指出改进 → 学生修改                      │
│                                                                 │
│  环节 2: LLM 引导 - 定价策略                                    │
│  学生制定 → 说明理由 → LLM 评估 → 指出遗漏                      │
│                                                                 │
│  环节 3: LLM 引导 - 卖点提炼                                    │
│  学生提炼 → LLM 评估 → 差异化分析 → 改进建议                    │
│                                                                 │
│  环节 4: 决策确认                                               │
│  完整方案 → 学生确认是否执行                                    │
│                                                                 │
│  环节 5: 调用基础 Skill 执行                                    │
│  学生决策 → 调用基础 Skill → 真正执行                           │
│                                                                 │
│  环节 6: 复盘总结                                               │
│  LLM 综合点评 → 能力收获 → 改进建议                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 LLM 提示词设计

```python
LLM_PROMPTS = {
    "title_optimization": """
你是一位电商商品标题优化专家。

产品信息：{product_info}
学生拟定的标题：{student_title}

请评估:
1. 标题是否包含热搜词？
2. 标题是否突出核心卖点？
3. 标题长度是否合适（30 字以内）？
4. 与竞品标题相比，是否有差异化？

要求:
- 先肯定好的地方
- 指出可以改进的具体点
- 给出 1 个修改建议（不是直接改写）
- 语气鼓励性
""",

    "pricing_strategy": """
你是一位电商定价策略专家。

...（类似设计）
""",

    "selling_points": """
你是一位电商卖点提炼专家。

...（类似设计）
"""
}
```

### 3.3 调用基础 Skill

```python
def call_base_skill(title, price, category="", description="", inventory=100):
    """调用基础 Skill 执行商品创建"""
    cmd = f'stigmergy skill call eb-edu-medusa-create-product \\
        --title "{title}" \\
        --price {price} \\
        --category "{category}" \\
        --description "{description}" \\
        --inventory {inventory}'
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    
    if result.returncode == 0:
        return True, "商品创建成功"
    else:
        return False, result.stderr
```

---

## 四、使用场景

### 场景 1: 教学实训（推荐引导型）

**学生**: "我要学习商品上架"

**推荐**: `eb-edu-create-product-guided`

```bash
stigmergy skill call eb-edu-create-product-guided
```

**流程**:
1. LLM 引导标题优化（5 分钟）
2. LLM 引导定价策略（5 分钟）
3. LLM 引导卖点提炼（5 分钟）
4. 决策确认（1 分钟）
5. 调用基础 Skill 执行（1 分钟）
6. 复盘总结（3 分钟）

**总耗时**: 约 20 分钟  
**能力收获**: 标题优化 + 定价策略 + 卖点提炼

---

### 场景 2: 快速业务操作（使用基础 Skill）

**学生**: "帮我上架这件商品"

**推荐**: `eb-edu-medusa-create-product`

```bash
stigmergy skill call eb-edu-medusa-create-product \
    --title "夏季连衣裙" \
    --price 199
```

**流程**: 直接执行  
**总耗时**: 1 分钟  
**能力收获**: 无（只是操作）

---

### 场景 3: 技能考核（使用引导型）

**教师**: "考核学生商品上架能力"

**推荐**: `eb-edu-create-product-guided`

```bash
stigmergy skill call eb-edu-create-product-guided
# LLM 会评估学生每个环节的表现在决策后执行
```

**输出**: LLM 评估报告 + 综合评分

---

## 五、能力培养效果

### 5.1 对比：有无 LLM 引导

| 维度 | 无引导（基础 Skill） | 有 LLM 引导 |
|------|-------------------|-----------|
| **学生角色** | 操作者 | 决策者 |
| **AI 角色** | 执行者 | 导师 |
| **学习深度** | 表面（操作流程） | 深度（专业思维） |
| **反馈** | 成功/失败 | 个性化点评 |
| **能力收获** | 无 | 标题优化 + 定价 + 卖点 |

### 5.2 能力成长路径

```
实训 1: 商品上架（LLM 引导）
  ↓
  学会：标题优化、定价策略、卖点提炼
  
实训 2: 订单创建（LLM 引导）
  ↓
  学会：客户需求分析、订单配置、价格计算
  
实训 3: 竞品分析（LLM 引导）
  ↓
  学会：数据解读、市场洞察、机会识别
  
最终: 独立工作能力
  无需 LLM 引导，能独立完成电商运营任务
```

---

## 六、部署与验证

### 6.1 部署步骤

```bash
# 1. 安装 Skills
cp -r skills/eb-edu C:\Users\Zhang/.stigmergy/skills/

# 2. 安装依赖
pip install -r C:\Users\Zhang/.stigmergy/skills/eb-edu/requirements.txt

# 3. 验证 AI CLI 可用
stigmergy qwen "你好"

# 4. 测试引导型 Skill
stigmergy skill call eb-edu-create-product-guided

# 5. 测试基础 Skill
stigmergy skill call eb-edu-medusa-create-product --title "测试" --price 99
```

### 6.2 验证清单

| 验证项 | 命令 | 预期 |
|--------|------|------|
| AI CLI 可用 | `stigmergy qwen "你好"` | LLM 回复 |
| 引导型 Skill | `stigmergy skill call eb-edu-create-product-guided` | LLM 引导流程 |
| 基础 Skill | `stigmergy skill call eb-edu-medusa-create-product` | 商品创建成功 |
| 调用关系 | 引导型 → 基础 | 环节 5 调用基础 Skill |

---

## 七、总结

### 7.1 核心设计

| 设计点 | 说明 |
|--------|------|
| **LLM 个性化引导** | 不是硬编码，真正 AI 智能引导 |
| **学生决策** | 学生思考后做决策，不是被动操作 |
| **调用基础 Skill** | 决策后调用基础 Skill 真正执行 |
| **能力培养** | 培养专业思维，不只是操作流程 |

### 7.2 推荐使用

| 场景 | 推荐 Skill 类型 |
|------|--------------|
| 教学实训 | 引导型 Skills |
| 技能考核 | 引导型 Skills |
| 快速操作 | 基础 Skills |
| 离线学习 | 引导型 Skills（offline 模式） |

---

**维护者**: 电商 AI 实训平台教学团队  
**文档版本**: v8.0  
**更新日期**: 2026-03-30  
**状态**: 引导型 Skills 已实现 ✅
