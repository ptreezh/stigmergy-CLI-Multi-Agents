# Medusa CLI 命令补充计划

**版本**: v1.0  
**创建日期**: 2026-03-30  
**目标**: 从 3 个 CLI 命令补充到 36 个，覆盖 Medusa 电商全部功能

---

## 一、任务列表

### P0 优先级（核心功能）- 14 个 CLI 命令

| # | CLI 命令 | 功能 | 对应基础 Skill | 预计工时 |
|---|---------|------|--------------|---------|
| 1 | `medusa product list` | 查看商品列表 | `eb-edu-medusa-list-products` | 2h |
| 2 | `medusa product get` | 查看商品详情 | `eb-edu-medusa-get-product` | 2h |
| 3 | `medusa product update` | 更新商品信息 | `eb-edu-medusa-update-product` | 2h |
| 4 | `medusa product delete` | 删除商品 | `eb-edu-medusa-delete-product` | 1h |
| 5 | `medusa order list` | 查看订单列表 | `eb-edu-medusa-list-orders` | 2h |
| 6 | `medusa order get` | 查看订单详情 | `eb-edu-medusa-get-order` | 2h |
| 7 | `medusa order update-status` | 更新订单状态 | `eb-edu-medusa-update-order` | 2h |
| 8 | `medusa customer create` | 创建客户 | `eb-edu-medusa-create-customer` | 2h |
| 9 | `medusa customer list` | 查看客户列表 | `eb-edu-medusa-list-customers` | 2h |
| 10 | `medusa inventory check` | 查询库存 | `eb-edu-medusa-check-inventory` | 2h |
| 11 | `medusa inventory adjust` | 调整库存 | `eb-edu-medusa-adjust-inventory` | 2h |
| 12 | `medusa discount create` | 创建优惠券 | `eb-edu-medusa-create-discount` | 2h |
| 13 | `medusa shipping fulfill` | 发货管理 | `eb-edu-medusa-fulfill-order` | 2h |
| 14 | `medusa analytics sales` | 销售统计 | `eb-edu-medusa-sales-analytics` | 3h |

### P1 优先级（运营功能）- 10 个 CLI 命令

| # | CLI 命令 | 功能 | 对应基础 Skill |
|---|---------|------|--------------|
| 15 | `medusa order cancel` | 取消订单 | `eb-edu-medusa-cancel-order` |
| 16 | `medusa order refund` | 订单退款 | `eb-edu-medusa-refund-order` |
| 17 | `medusa customer get` | 查看客户详情 | `eb-edu-medusa-get-customer` |
| 18 | `medusa customer groups` | 客户分组 | `eb-edu-medusa-customer-groups` |
| 19 | `medusa inventory warning` | 库存预警 | `eb-edu-medusa-inventory-warning` |
| 20 | `medusa inventory warehouses` | 多仓库管理 | `eb-edu-medusa-warehouses` |
| 21 | `medusa discount list` | 查看折扣列表 | `eb-edu-medusa-list-discounts` |
| 22 | `medusa discount codes` | 折扣码管理 | `eb-edu-medusa-discount-codes` |
| 23 | `medusa shipping templates` | 运费模板 | `eb-edu-medusa-shipping-templates` |
| 24 | `medusa payment process` | 支付处理 | `eb-edu-medusa-payment-process` |

### P2 优先级（高级功能）- 9 个 CLI 命令

| # | CLI 命令 | 功能 | 对应基础 Skill |
|---|---------|------|--------------|
| 25 | `medusa product variants` | 商品变体管理 | `eb-edu-medusa-product-variants` |
| 26 | `medusa product categories` | 商品分类管理 | `eb-edu-medusa-categories` |
| 27 | `medusa shipping providers` | 物流公司 | `eb-edu-medusa-shipping-providers` |
| 28 | `medusa shipping tracking` | 物流跟踪 | `eb-medusa-shipping-tracking` |
| 29 | `medusa payment configure` | 支付配置 | `eb-edu-medusa-payment-configure` |
| 30 | `medusa payment refund` | 退款管理 | `eb-edu-medusa-payment-refund` |
| 31 | `medusa analytics products` | 商品分析 | `eb-edu-medusa-product-analytics` |
| 32 | `medusa analytics orders` | 订单分析 | `eb-edu-medusa-order-analytics` |
| 33 | `medusa analytics customers` | 客户分析 | `eb-edu-medusa-customer-analytics` |

---

## 二、实施步骤（每个 CLI 命令）

### 步骤 1: 创建 CLI 命令脚本

位置：`medusa-backend/src/cli/commands/<module>/<command>.ts`

示例 (`product-list.ts`):
```typescript
#!/usr/bin/env node
/**
 * Medusa CLI - 查看商品列表
 * 
 * Usage:
 *   stigmergy eb-edu medusa product list [options]
 * 
 * Options:
 *   --page <number>      页码 (默认：1)
 *   --limit <number>     每页数量 (默认：20)
 *   --category <id>      按分类筛选
 *   --status <status>    按状态筛选 (draft, published)
 *   --q <query>          搜索关键词
 *   --json               输出 JSON 格式
 */

import { MedusaService } from '../../services/medusa.service';
import { outputFormatter } from '../../utils/output-formatter';

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  try {
    const medusa = new MedusaService();
    const products = await medusa.products.list(options);
    
    if (options.json) {
      console.log(JSON.stringify(products, null, 2));
    } else {
      outputFormatter.formatProductList(products);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

### 步骤 2: 创建 Skill 封装

位置：`skills/eb-edu/teacher|student/<skill-name>/skill.py`

示例 (`medusa-list-products/skill.py`):
```python
#!/usr/bin/env python3
"""
电商 AI 实训平台 Skill - 查看商品列表

调用方式:
    stigmergy skill call eb-edu-medusa-list-products \\
        --page 1 \\
        --limit 20
"""

import json
import sys
import subprocess
import argparse

def build_command(args):
    cmd = "stigmergy eb-edu medusa product list"
    if args.page:
        cmd += f" --page {args.page}"
    if args.limit:
        cmd += f" --limit {args.limit}"
    if args.category:
        cmd += f" --category {args.category}"
    if args.q:
        cmd += f" --q \"{args.q}\""
    return cmd

def execute_command(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    if result.returncode == 0:
        try:
            return {"success": True, "data": json.loads(result.stdout)}
        except:
            return {"success": True, "data": result.stdout}
    else:
        return {"success": False, "error": result.stderr}

def format_output(result, args):
    if result["success"]:
        products = result["data"] if isinstance(result["data"], list) else result["data"].get("products", [])
        output = ["## 📦 商品列表\n"]
        for p in products[:10]:
            output.append(f"- **{p.get('title', 'N/A')}** - ¥{p.get('price', 0)} - 库存：{p.get('inventory_quantity', 0)}")
        return "\n".join(output)
    else:
        return f"❌ 查询失败\n\n**错误**: {result.get('error', '未知错误')}"

def main():
    parser = argparse.ArgumentParser(description="查看商品列表")
    parser.add_argument("--page", type=int, default=1, help="页码")
    parser.add_argument("--limit", type=int, default=20, help="每页数量")
    parser.add_argument("--category", type=str, help="分类 ID")
    parser.add_argument("--q", type=str, help="搜索关键词")
    
    args = parser.parse_args()
    cmd = build_command(args)
    result = execute_command(cmd)
    print(format_output(result, args))
    return 0 if result["success"] else 1

if __name__ == "__main__":
    sys.exit(main())
```

### 步骤 3: 创建 Skill JSON

位置：`skills/eb-edu/teacher|student/<skill-name>/skill.json`

```json
{
  "name": "eb-edu-medusa-list-products",
  "version": "1.0",
  "description": "查看商品列表",
  "author": "电商 AI 实训平台",
  "category": "ecommerce",
  "tags": ["电商", "Medusa", "商品管理"],
  "triggers": {
    "keywords": ["查看商品", "商品列表", "商品管理"],
    "patterns": ["查看.*商品", "列出.*商品"]
  },
  "parameters": {
    "type": "object",
    "required": [],
    "properties": {
      "page": {"type": "integer", "default": 1, "description": "页码"},
      "limit": {"type": "integer", "default": 20, "description": "每页数量"},
      "category": {"type": "string", "description": "分类 ID"},
      "q": {"type": "string", "description": "搜索关键词"}
    }
  },
  "execution": {
    "runtime": "python3",
    "script": "skill.py",
    "timeout": 30
  },
  "permissions": {
    "roles": ["STUDENT", "TEACHER", "ADMIN"],
    "requires_auth": true
  }
}
```

### 步骤 4: 创建引导型 Skill（如适用）

对于需要能力培养的实训任务，创建引导型 Skill：

位置：`skills/eb-edu/student/<skill-name>-guided/skill.py`

示例 (`manage-inventory-guided/skill.py`):
```python
#!/usr/bin/env python3
"""
电商 AI 实训平台 Skill - 库存管理（LLM 智能引导版）

培养能力:
- 库存查询能力
- 库存预警识别
- 库存调整决策

调用基础 Skill: eb-edu-medusa-check-inventory
"""

import json
import sys
import subprocess
import argparse

LLM_PROMPTS = {
    "inventory_analysis": """
你是一位电商库存管理专家，正在指导学生分析库存状况。

库存数据:
{inventory_data}

学生分析:
{student_analysis}

请评估:
1. 学生是否识别了库存预警商品？
2. 学生是否分析了库存周转率？
3. 学生提出了什么改进建议？

要求:
- 先肯定学生的正确分析
- 指出遗漏的关键点
- 提出 1-2 个追问，引导学生深入思考
""",

    "adjustment_decision": """
你是一位电商库存管理专家，正在指导学生制定库存调整方案。

库存状况:
{inventory_status}

学生调整方案:
{student_plan}

请评估:
1. 调整方案是否合理？
2. 是否考虑了销售趋势？
3. 是否考虑了采购周期？

要求:
- 先肯定合理部分
- 指出可以改进的地方
- 给出具体建议
"""
}

def call_llm(prompt):
    cmd = f'stigmergy qwen "{prompt}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
    return result.stdout.strip() if result.returncode == 0 else "📊 导师点评：你的分析基本合理。"

def get_input(prompt, allow_empty=False):
    try:
        while True:
            answer = input(f"\n{prompt}\n> ").strip()
            if answer or allow_empty:
                return answer
    except EOFError:
        return ""

def call_base_skill():
    print("\n🔧 正在调用基础 Skill 查询库存...")
    cmd = 'stigmergy skill call eb-edu-medusa-check-inventory'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    if result.returncode == 0:
        try:
            data = json.loads(result.stdout)
            return True, data, ""
        except:
            return True, result.stdout, ""
    else:
        return False, "", result.stderr

def run_guided_training():
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 14 + "电商 AI 实训平台 - 库存管理（LLM 智能引导）" + " " * 14 + "║")
    print("╚" + "═" * 58 + "╝")
    
    # 情境导入
    print("\n" + "=" * 60)
    print("📋 情境导入")
    print("=" * 60)
    print("""
你是一家电商公司的库存管理员，老板要你分析当前库存状况:

任务:
1. 查询当前库存
2. 识别库存预警商品（库存<10）
3. 制定库存调整方案

请开始分析。
""")
    get_input("准备好了吗？（按回车开始）")
    
    # 环节 1: 库存查询
    print("\n" + "=" * 60)
    print("📋 环节 1: 库存查询")
    print("=" * 60)
    
    success, inventory_data, error = call_base_skill()
    if success:
        print(f"\n✅ 库存查询成功\n")
        print(inventory_data if isinstance(inventory_data, str) else json.dumps(inventory_data, indent=2, ensure_ascii=False))
    else:
        print(f"\n⚠️ 库存查询失败：{error}")
        print("模拟数据继续实训...")
        inventory_data = {"products": [{"title": "商品 A", "inventory": 5}, {"title": "商品 B", "inventory": 50}]}
    
    get_input("（按回车继续）")
    
    # 环节 2: 库存分析（LLM 引导）
    print("\n" + "=" * 60)
    print("📋 环节 2: 库存分析")
    print("=" * 60)
    print("""
请分析库存数据，回答:
1. 哪些商品库存低于预警线（<10）？
2. 哪些商品库存过高（>100）？
3. 你有什么改进建议？
""")
    
    student_analysis = get_input("你的分析:")
    
    print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["inventory_analysis"].format(
        inventory_data=str(inventory_data),
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    print("\n" + llm_feedback)
    
    get_input("（按回车继续）")
    
    # 环节 3: 复盘总结
    print("\n" + "=" * 60)
    print("📋 环节 3: 复盘总结")
    print("=" * 60)
    print("""
🎓 库存管理实训完成！

能力收获:
✓ 库存查询能力
✓ 库存预警识别
✓ 库存分析能力
✓ 调整方案制定

建议:
- 定期检查库存
- 建立库存预警机制
- 根据销售数据调整库存
""")
    
    return 0

def main():
    parser = argparse.ArgumentParser(description="库存管理（LLM 智能引导版）")
    args = parser.parse_args()
    return run_guided_training()

if __name__ == "__main__":
    sys.exit(main())
```

---

## 三、实施计划

### 第一阶段：商品管理模块（2026-04-01 ~ 2026-04-03）

| 日期 | 任务 | CLI 命令 | Skill |
|------|------|---------|-------|
| 04-01 | 商品列表 | `medusa product list` | `eb-edu-medusa-list-products` |
| 04-01 | 商品详情 | `medusa product get` | `eb-edu-medusa-get-product` |
| 04-02 | 商品更新 | `medusa product update` | `eb-edu-medusa-update-product` |
| 04-02 | 商品删除 | `medusa product delete` | `eb-edu-medusa-delete-product` |
| 04-03 | 商品变体 | `medusa product variants` | `eb-edu-medusa-product-variants` |

### 第二阶段：订单管理模块（2026-04-04 ~ 2026-04-07）

| 日期 | 任务 | CLI 命令 | Skill |
|------|------|---------|-------|
| 04-04 | 订单列表 | `medusa order list` | `eb-edu-medusa-list-orders` |
| 04-04 | 订单详情 | `medusa order get` | `eb-edu-medusa-get-order` |
| 04-05 | 订单状态更新 | `medusa order update-status` | `eb-edu-medusa-update-order` |
| 04-06 | 订单取消 | `medusa order cancel` | `eb-edu-medusa-cancel-order` |
| 04-07 | 订单退款 | `medusa order refund` | `eb-edu-medusa-refund-order` |

### 第三阶段：客户与库存（2026-04-08 ~ 2026-04-12）

| 日期 | 任务 | CLI 命令 | Skill |
|------|------|---------|-------|
| 04-08 | 客户创建 | `medusa customer create` | `eb-edu-medusa-create-customer` |
| 04-08 | 客户列表 | `medusa customer list` | `eb-edu-medusa-list-customers` |
| 04-09 | 客户详情 | `medusa customer get` | `eb-edu-medusa-get-customer` |
| 04-10 | 库存查询 | `medusa inventory check` | `eb-edu-medusa-check-inventory` |
| 04-11 | 库存调整 | `medusa inventory adjust` | `eb-edu-medusa-adjust-inventory` |
| 04-12 | 库存预警 | `medusa inventory warning` | `eb-edu-medusa-inventory-warning` |

### 第四阶段：营销与物流（2026-04-13 ~ 2026-04-18）

| 日期 | 任务 | CLI 命令 | Skill |
|------|------|---------|-------|
| 04-13 | 优惠券创建 | `medusa discount create` | `eb-edu-medusa-create-discount` |
| 04-14 | 折扣列表 | `medusa discount list` | `eb-edu-medusa-list-discounts` |
| 04-15 | 折扣码管理 | `medusa discount codes` | `eb-edu-medusa-discount-codes` |
| 04-16 | 运费模板 | `medusa shipping templates` | `eb-edu-medusa-shipping-templates` |
| 04-17 | 发货管理 | `medusa shipping fulfill` | `eb-edu-medusa-fulfill-order` |
| 04-18 | 物流跟踪 | `medusa shipping tracking` | `eb-edu-medusa-shipping-tracking` |

### 第五阶段：支付与数据（2026-04-19 ~ 2026-04-25）

| 日期 | 任务 | CLI 命令 | Skill |
|------|------|---------|-------|
| 04-19 | 支付配置 | `medusa payment configure` | `eb-edu-medusa-payment-configure` |
| 04-20 | 支付处理 | `medusa payment process` | `eb-edu-medusa-payment-process` |
| 04-21 | 退款管理 | `medusa payment refund` | `eb-edu-medusa-payment-refund` |
| 04-22 | 销售统计 | `medusa analytics sales` | `eb-edu-medusa-sales-analytics` |
| 04-23 | 商品分析 | `medusa analytics products` | `eb-edu-medusa-product-analytics` |
| 04-24 | 订单分析 | `medusa analytics orders` | `eb-edu-medusa-order-analytics` |
| 04-25 | 客户分析 | `medusa analytics customers` | `eb-edu-medusa-customer-analytics` |

---

## 四、验收标准

### CLI 命令验收

- [ ] 命令可以独立执行
- [ ] 支持 --help 参数
- [ ] 支持 --json 参数（输出 JSON 格式）
- [ ] 错误处理完善
- [ ] 有单元测试

### Skill 验收

- [ ] skill.py 可以正确调用 CLI
- [ ] skill.json 配置完整
- [ ] 有触发词和 patterns
- [ ] 参数 Schema 完整
- [ ] 输出格式化良好

### 引导型 Skill 验收

- [ ] LLM 引导流程完整
- [ ] LLM 提示词设计合理
- [ ] 调用基础 Skill 执行
- [ ] 有复盘总结环节
- [ ] 能力培养目标明确

---

## 五、总结

### 目标

- ✅ **36 个 CLI 命令** - 覆盖 Medusa 电商全部功能
- ✅ **36 个基础 Skills** - 封装 CLI 命令
- ✅ **15+ 个引导型 Skills** - 能力培养实训
- ✅ **100% 测试覆盖** - 所有 CLI 和 Skills 都有测试

### 时间线

- **开始**: 2026-04-01
- **P0 完成**: 2026-04-12（14 个 CLI）
- **P1 完成**: 2026-04-18（24 个 CLI）
- **全部完成**: 2026-04-25（36 个 CLI）

### 预期成果

- Medusa 电商核心功能 100% CLI 覆盖
- 所有业务场景都有对应 Skills
- 所有实训任务都有引导型 Skills
- 学生可以通过 LLM 引导学习全部电商运营技能

---

**计划制定者**: Soul Agent  
**制定日期**: 2026-03-30  
**状态**: 待实施
