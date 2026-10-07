# 电商 AI 实训平台 - LLM 智能引导型 Skills

**版本**: v6.0 (LLM 智能引导)  
**创建日期**: 2026-03-30  
**核心特点**: 依赖 AI LLM 智能引导，不是硬编码问答

---

## 一、核心设计理念

### 传统实训 vs LLM 智能引导

| 维度 | 传统实训 | LLM 智能引导 |
|------|---------|------------|
| **引导方式** | 硬编码问题 | LLM 动态生成追问 |
| **反馈** | 固定评估标准 | LLM 个性化点评 |
| **交互** | 单向问答 | 多轮对话 |
| **适应性** | 所有学生一样 | 根据学生回答调整 |
| **深度** | 表面检查 | 深度思考引导 |

### LLM 如何参与实训

```
学生 → 回答问题 → LLM 分析 → LLM 生成追问 → 学生补充思考
  ↓                                      ↓
  └────────────── 多轮对话 ──────────────┘
  
LLM 作用:
1. 评估学生回答质量
2. 发现学生思维盲点
3. 生成个性化追问
4. 引导学生深度思考
5. 给出针对性建议
```

---

## 二、LLM 智能引导型 Skills

### 2.1 商品上架实训（LLM 引导版）

**Skill**: `eb-edu-product-listing-ai-training`

**LLM 参与环节**:

| 环节 | LLM 作用 | 提示词 |
|------|---------|--------|
| 市场分析 | 评估分析质量，生成追问 | `market_analysis` |
| 定价策略 | 评估定价合理性，指出遗漏因素 | `pricing_strategy` |
| 卖点提炼 | 评估差异化，给出改进建议 | `selling_points` |
| 最终点评 | 综合评分，给出行业最佳实践对比 | `final_review` |

**使用方式**:
```bash
# 使用 Qwen LLM
stigmergy skill call eb-edu-product-listing-ai-training --llm qwen

# 使用 Claude LLM
stigmergy skill call eb-edu-product-listing-ai-training --llm claude

# 离线模式（模拟 LLM）
stigmergy skill call eb-edu-product-listing-ai-training --llm offline
```

**交互示例**:
```
$ stigmergy skill call eb-edu-product-listing-ai-training

╔══════════════════════════════════════════════════════════╗
║    电商 AI 实训平台 - 商品上架实训 (LLM 智能引导)            ║
╚══════════════════════════════════════════════════════════╝

📋 阶段 2: 市场分析

竞品数据:
   • 竞品 1: 《夏季新款连衣裙女》- 159 元 - 月销 3000+
   • 竞品 2: 《法式复古连衣裙》- 259 元 - 月销 1000+
   • 竞品 3: 《简约气质连衣裙》- 189 元 - 月销 2000+

你的分析:
> 价格带是 159-259 元，竞品 1 销量最高，因为价格便宜

🤖 AI 导师正在分析你的回答...

📊 AI 导师点评:

你准确识别了价格带，这很好！

但你可能遗漏了:
1. 竞品 1 的成功不仅是价格，还有"新款"这个卖点
2. 259 元的竞品 2 虽然贵，但月销也有 1000+，说明有用户愿意为"法式复古"买单

💡 追问:
如果让你找出市场机会，你会从哪个角度切入？
是低价竞争，还是差异化定位？

> 我觉得可以做差异化，法式风格有市场，但价格可以更亲民

很好的思考！你发现了差异化机会...

[继续后续环节]
```

---

## 三、LLM 集成配置

### 3.1 支持的 LLM

| LLM | 配置 | 说明 |
|-----|------|------|
| **Qwen** | `--llm qwen` | 通过 stigmergy qwen 调用 |
| **Claude** | `--llm claude` | 通过 stigmergy claude 调用 |
| **Offline** | `--llm offline` | 模拟 LLM（离线模式） |

### 3.2 LLM 调用方式

```python
def call_llm(prompt):
    # 方式 1: 调用 stigmergy qwen
    cmd = f'stigmergy qwen "{prompt}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
    return result.stdout.strip()
    
    # 方式 2: 调用 stigmergy claude
    # cmd = f'stigmergy claude "{prompt}"'
    
    # 方式 3: 直接调用 OpenAI API
    # response = openai.ChatCompletion.create(...)
    
    # 方式 4: 离线模式（模拟）
    # return simulate_llm_response(prompt)
```

### 3.3 LLM 提示词模板

```python
LLM_PROMPTS = {
    "market_analysis": """
你是一位资深电商运营导师，正在指导学生进行市场分析。

竞品数据:
{competitors_data}

学生分析:
{student_analysis}

请评估学生的分析:
1. 学生是否准确识别了价格带？
2. 学生是否发现了竞品的成功因素？
3. 学生是否找到了市场机会？

要求:
- 先肯定学生的正确发现
- 指出学生遗漏的关键点
- 提出 1-2 个追问，引导学生深入思考
- 语气鼓励性，不要直接给答案
""",

    "pricing_strategy": """
...（类似模板）
""",

    "selling_points": """
...（类似模板）
""",

    "final_review": """
...（类似模板）
"""
}
```

---

## 四、能力培养效果

### 4.1 对比：有无 LLM 引导

| 维度 | 无 LLM（硬编码） | 有 LLM 引导 |
|------|---------------|-----------|
| **反馈个性化** | ❌ 所有人一样 | ✅ 根据学生回答定制 |
| **追问深度** | ❌ 固定问题 | ✅ 根据学生水平调整 |
| **盲点发现** | ❌ 有限 | ✅ LLM 全面分析 |
| **学习深度** | ⚠️ 表面 | ✅ 深度思考 |
| **学生参与度** | ⚠️ 被动回答 | ✅ 主动思考 |

### 4.2 学生能力成长路径

```
实训 1: 市场分析
  ↓ LLM 引导
  学会：价格带分析、竞品成功因素识别
  
实训 2: 定价策略
  ↓ LLM 引导
  学会：成本 + 竞品 + 定位三维思考
  
实训 3: 卖点提炼
  ↓ LLM 引导
  学会：差异化卖点提炼
  
实训 4: 完整方案
  ↓ LLM 引导
  综合运用：市场分析→定价→卖点→执行
  
最终: 独立工作能力
  无需 LLM 引导，能独立完成商品上架方案
```

---

## 五、部署与配置

### 5.1 前置要求

| 要求 | 说明 | 是否必须 |
|------|------|---------|
| **stigmergy** | 跨 CLI 协作框架 | ✅ |
| **qwen/claude** | AI CLI（至少一个） | ✅ |
| **medusa-backend** | 后端 API | ⚠️ 阶段 5 需要 |
| **Python 3.8+** | 运行环境 | ✅ |

### 5.2 安装步骤

```bash
# 1. 安装 Skills
cp -r skills/eb-edu C:\Users\Zhang/.stigmergy/skills/

# 2. 安装依赖
pip install -r C:\Users\Zhang/.stigmergy/skills/eb-edu/requirements.txt

# 3. 验证 AI CLI 可用
stigmergy qwen "你好"

# 4. 测试 Skill
stigmergy skill call eb-edu-product-listing-ai-training --llm qwen
```

### 5.3 LLM 配置

```bash
# 配置 Qwen
stigmergy config set qwen.api_key "sk-..."

# 配置 Claude
stigmergy config set claude.api_key "sk-..."

# 测试 LLM
stigmergy qwen "你好，请介绍一下自己"
```

---

## 六、总结

### 6.1 核心优势

| 优势 | 说明 |
|------|------|
| **依赖 LLM** | 不是硬编码，真正智能引导 |
| **个性化** | 根据学生回答定制反馈 |
| **深度思考** | 多轮追问，引导深入思考 |
| **能力培养** | 培养专业思维，不只是操作 |
| **可扩展** | 容易添加新场景、新品类 |

### 6.2 使用建议

| 场景 | 推荐配置 |
|------|---------|
| **有 AI CLI** | `--llm qwen` 或 `--llm claude` |
| **无 AI CLI** | `--llm offline`（功能受限） |
| **教学实训** | 推荐 LLM 引导版 |
| **技能考核** | 推荐 LLM 引导版 |

---

**维护者**: 电商 AI 实训平台教学团队  
**文档版本**: v6.0  
**更新日期**: 2026-03-30  
**状态**: LLM 智能引导型 Skills 已实现 ✅
