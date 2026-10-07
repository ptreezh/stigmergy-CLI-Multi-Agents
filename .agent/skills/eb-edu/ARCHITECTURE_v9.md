# 电商 AI 实训平台 - Skills 架构（能力本位）

**版本**: v9.0 (能力本位重构)  
**创建日期**: 2026-03-30  
**状态**: 架构重构完成

---

## 一、双层架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│  学生层（面向能力培养）- 全部是引导型 Skills                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  所有实训任务都是 LLM 引导型                              │   │
│  │  - 商品上架 → eb-edu-create-product-guided             │   │
│  │  - 订单处理 → eb-edu-create-order-guided               │   │
│  │  - 竞品分析 → eb-edu-analyze-competitors-guided        │   │
│  │  - ... (全部实训任务)                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓ 调用                                │
├─────────────────────────────────────────────────────────────────┤
│  基础层（面向业务执行）- 仅内部调用，不对外公开                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  基础 Skills（仅被引导型 Skills 调用）                     │   │
│  │  - eb-edu-medusa-create-product (内部)                 │   │
│  │  - eb-edu-medusa-create-order (内部)                   │   │
│  │  - ... (仅内部调用)                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、学生 Skills 列表（全部引导型）

### 2.1 核心实训 Skills（✅ 已完成）

| Skill | 培养能力 | LLM 引导环节 | 调用基础 Skill | 状态 |
|-------|---------|-------------|---------------|------|
| `eb-edu-create-product-guided` | 标题优化 + 定价 + 卖点 | 3 个环节 | `eb-edu-medusa-create-product` | ✅ |
| `eb-edu-product-listing-ai-training` | 市场分析 + 定价 + 卖点 | 4 个环节 | `eb-edu-medusa-create-product` | ✅ |
| `eb-edu-competitor-analysis-training` | 数据解读 + 市场洞察 | 分析引导 | 无（纯分析） | ✅ |

### 2.2 待实施实训 Skills

| Skill | 培养能力 | 调用基础 Skill | 优先级 |
|-------|---------|---------------|--------|
| `eb-edu-create-order-guided` | 需求分析 + 配置 + 计算 | `eb-edu-medusa-create-order` | P1 |
| `eb-edu-submit-project-guided` | 成果整理 + 自我展示 | `eb-edu-submit-project` | P1 |
| `eb-edu-analyze-grades-guided` | 数据分析 + 自我反思 | 无（纯分析） | P2 |
| `eb-edu-batch-products-guided` | 批量策略 + 效率优化 | `eb-edu-medusa-batch-products` | P2 |
| `eb-edu-design-marketing-guided` | 营销策划 + 创意能力 | 无（纯策划） | P3 |
| `eb-edu-optimize-ctr-guided` | 主图优化 + 数据分析 | 无（纯分析） | P3 |

---

## 三、基础 Skills（仅内部调用）

### 3.1 基础 Skills 列表

| Skill | 功能 | 调用者 | 可见性 |
|-------|------|--------|--------|
| `eb-edu-medusa-create-product` | 创建商品 | `create-product-guided` | 🔒 内部 |
| `eb-edu-medusa-create-order` | 创建订单 | `create-order-guided` | 🔒 内部 |
| `eb-edu-submit-project` | 提交实训 | `submit-project-guided` | 🔒 内部 |
| `eb-edu-medusa-batch-products` | 批量上架 | `batch-products-guided` | 🔒 内部 |

### 3.2 权限控制

**学生权限**:
```json
{
  "role": "STUDENT",
  "allowed_skills": ["eb-edu-*-guided"],  // 仅引导型
  "denied_skills": ["eb-edu-medusa-*"]     // 基础 Skills 禁止
}
```

**教师权限**:
```json
{
  "role": "TEACHER",
  "allowed_skills": ["*"],  // 全部 Skills
  "note": "教师可使用基础 Skills 用于演示"
}
```

---

## 四、引导型 Skill 标准模板

### 4.1 标准流程

```
阶段 1: 情境导入 (2 分钟)
  ↓
阶段 2: LLM 引导 - 分析/思考 (5-10 分钟)
  ↓
阶段 3: LLM 引导 - 决策 (5-10 分钟)
  ↓
阶段 4: 决策确认 (1 分钟)
  ↓
阶段 5: 调用基础 Skill 执行 (1 分钟)
  ↓
阶段 6: 复盘总结 (5 分钟)
```

### 4.2 代码模板

```python
#!/usr/bin/env python3
"""
电商 AI 实训平台 Skill - {任务名称}（LLM 智能引导版）

培养能力：{能力列表}
调用基础 Skill: {base_skill_name}
"""

import json
import sys
import subprocess
import argparse

LLM_PROMPTS = {
    "analysis": """...""",
    "decision": """...""",
    "review": """..."""
}

def call_llm(prompt):
    """调用 AI LLM"""
    cmd = f'stigmergy qwen "{prompt}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
    return result.stdout.strip()

def call_base_skill(**kwargs):
    """调用基础 Skill 执行"""
    cmd = f'stigmergy skill call {BASE_SKILL_NAME}'
    for key, value in kwargs.items():
        cmd += f' --{key} "{value}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    return result.returncode == 0, result.stdout

def run_guided_training():
    """运行 LLM 智能引导实训"""
    
    # 阶段 1: 情境导入
    print("📋 情境导入")
    # ...
    
    # 阶段 2: LLM 引导 - 分析
    print("🤖 LLM 引导 - 分析")
    student_analysis = get_input("你的分析:")
    llm_feedback = call_llm(LLM_PROMPTS["analysis"].format(...))
    print(llm_feedback)
    
    # 阶段 3: LLM 引导 - 决策
    print("🤖 LLM 引导 - 决策")
    student_plan = get_input("你的方案:")
    student_reason = get_input("决策依据:")
    llm_feedback = call_llm(LLM_PROMPTS["decision"].format(...))
    print(llm_feedback)
    
    # 阶段 4: 决策确认
    confirm = get_input("确认执行？(y/n)")
    if confirm != 'y':
        return 0
    
    # 阶段 5: 调用基础 Skill 执行
    success, result = call_base_skill(...)
    if success:
        print("✅ 执行成功")
    else:
        print("⚠️ 执行失败")
    
    # 阶段 6: 复盘总结
    print("📋 复盘总结")
    llm_feedback = call_llm(LLM_PROMPTS["review"].format(...))
    print(llm_feedback)
    
    return 0

if __name__ == "__main__":
    sys.exit(run_guided_training())
```

---

## 五、使用示例

### 5.1 学生使用（引导型）

```bash
# 商品上架实训
stigmergy skill call eb-edu-create-product-guided

# 订单处理实训
stigmergy skill call eb-edu-create-order-guided

# 竞品分析实训
stigmergy skill call eb-edu-analyze-competitors-guided
```

### 5.2 教师使用（可访问基础 Skills）

```bash
# 演示：快速创建商品
stigmergy skill call eb-edu-medusa-create-product \
    --title "演示商品" --price 99

# 教学：引导型 Skills
stigmergy skill call eb-edu-create-product-guided
```

---

## 六、部署与验证

### 6.1 部署步骤

```bash
# 1. 安装 Skills
cp -r skills/eb-edu C:\Users\Zhang/.stigmergy/skills/

# 2. 配置权限
stigmergy config set student.role "STUDENT"
stigmergy config set teacher.role "TEACHER"

# 3. 验证
stigmergy skill list --role student  # 仅显示引导型
stigmergy skill list --role teacher  # 显示全部
```

### 6.2 验证清单

| 验证项 | 命令 | 预期 |
|--------|------|------|
| 学生访问基础 Skill | `stigmergy skill call eb-edu-medusa-create-product` | ❌ 权限拒绝 |
| 学生访问引导型 Skill | `stigmergy skill call eb-edu-create-product-guided` | ✅ 正常 |
| 教师访问基础 Skill | `stigmergy skill call eb-edu-medusa-create-product` | ✅ 正常 |
| 引导型调用基础 Skill | `stigmergy skill call eb-edu-create-product-guided` | ✅ 阶段 5 调用成功 |

---

## 七、总结

### 7.1 核心变革

| 维度 | 之前 | 重构后 |
|------|------|-------|
| **架构** | 混合 | 双层（引导型 + 基础型） |
| **学生访问** | 全部 Skills | 仅引导型 Skills |
| **实训任务** | 部分引导 | 全部引导 |
| **基础 Skills** | 公开 | 内部调用（隐藏） |
| **LLM 引导** | 部分 | 全部实训任务 |

### 7.2 预期效果

| 效果 | 说明 |
|------|------|
| **能力培养** | 所有实训都培养专业思维 |
| **避免捷径** | 学生无法直接操作基础 Skills |
| **个性化学习** | LLM 根据学生水平调整引导 |
| **真正决策** | 学生决策后调用基础 Skill 执行 |

---

**维护者**: 电商 AI 实训平台教学团队  
**文档版本**: v9.0  
**更新日期**: 2026-03-30  
**状态**: 架构重构完成 ✅
