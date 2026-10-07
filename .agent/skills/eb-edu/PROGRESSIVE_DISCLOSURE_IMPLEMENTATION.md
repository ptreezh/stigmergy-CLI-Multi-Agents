# 电商 AI 实训平台 - 渐进式披露实施指南

**版本**: v2.0  
**创建日期**: 2026-03-30  
**目标**: 确保每个 Skill 都严格符合渐进式披露原则

---

## 什么是渐进式披露

**渐进式披露**（Progressive Disclosure）是一种信息设计原则：
- **第一层**：只展示必要信息（核心信息）
- **第二层**：根据用户需求逐步展示更多信息（详细信息）
- **第三层**：提供深入学习的入口（学习资源）

### 在 Skills 中的应用

```
用户请求 → 核心信息 → 详细信息 → 深入学习
   ↓          ↓          ↓          ↓
查看商品   商品列表   商品详情   商品管理教程
```

---

## 渐进式披露实施标准

### 第一层：核心信息（必须展示）

**目标**：让用户快速了解结果

**内容**：
- ✅ 操作结果（成功/失败）
- ✅ 关键数据（ID、名称、状态）
- ✅ 下一步建议

**示例**：
```markdown
## 📦 商品列表

1. **夏季连衣裙**
   - 价格：¥199
   - 库存：100 件
   - 状态：已发布

共 3 件商品

**下一步**:
- 查看商品详情：`--product-id "prod_123"`
- 更新商品：`eb-edu-medusa-update-product`
```

### 第二层：详细信息（按需展示）

**目标**：满足用户深入了解需求

**内容**：
- ✅ 完整属性
- ✅ 关联数据
- ✅ 历史记录

**触发方式**：
- `--detail` 参数
- `--json` 参数
- 追问

**示例**：
```markdown
## 📦 商品详情（详细）

**基本信息**:
- 商品 ID: prod_123
- 标题：夏季连衣裙
- 描述：2026 年夏季新款...
- 状态：已发布

**价格信息**:
- 原价：¥299
- 现价：¥199
- 成本：¥80
- 毛利率：57.7%

**库存信息**:
- 总库存：100 件
- 已占用：10 件
- 可用：90 件

**销售数据**:
- 总销量：500 件
- 月销量：100 件
- 评价：4.8 分（200 条评价）
```

### 第三层：深入学习（入口提供）

**目标**：帮助用户系统学习

**内容**：
- ✅ 相关概念解释
- ✅ 最佳实践
- ✅ 常见问题
- ✅ 学习资源链接

**示例**：
```markdown
## 📚 深入学习

**相关概念**:
- [什么是 SKU？](./concepts/sku.md)
- [如何定价？](./guides/pricing.md)
- [库存管理最佳实践](./guides/inventory.md)

**常见问题**:
- Q: 如何设置商品变体？
- A: 使用 `eb-edu-medusa-product-variants` Skill

**学习资源**:
- [商品管理完整教程](./tutorials/product-management.md)
- [电商运营入门](./courses/ecommerce-basics.md)
```

---

## Skill 参数设计标准

### 基础参数（必须）

**特点**：
- ✅ 简单易懂
- ✅ 日常使用
- ✅ 无需解释

**示例**：
```json
{
  "page": {"type": "integer", "default": 1, "description": "页码"},
  "limit": {"type": "integer", "default": 20, "description": "每页数量"},
  "status": {"type": "string", "enum": ["draft", "published"], "description": "状态"}
}
```

### 高级参数（可选）

**特点**：
- ✅ 专业用户需要
- ✅ 有默认值
- ✅ 有详细说明

**示例**：
```json
{
  "include_deleted": {
    "type": "boolean",
    "default": false,
    "description": "是否包含已删除的商品（默认：false）"
  },
  "sort_by": {
    "type": "string",
    "default": "created_at",
    "enum": ["created_at", "updated_at", "price", "sales"],
    "description": "排序字段（默认：按创建时间）"
  }
}
```

### 专家参数（隐藏）

**特点**：
- ✅ 专家用户需要
- ✅ 需要专业知识
- ✅ 有使用风险

**示例**：
```json
{
  "force_reindex": {
    "type": "boolean",
    "default": false,
    "description": "强制重新索引（仅管理员使用，可能影响性能）"
  },
  "bypass_validation": {
    "type": "boolean",
    "default": false,
    "description": "绕过验证（高风险操作，仅限紧急情况）"
  }
}
```

---

## Skill 示例设计标准

### 示例 1：入门级（必须）

**目标**：展示最基本用法

**特点**：
- ✅ 无参数或最少参数
- ✅ 日常使用场景
- ✅ 一看就懂

**示例**：
```json
{
  "level": "beginner",
  "input": "查看商品列表",
  "parameters": {},
  "output": "## 📦 商品列表\n\n1. **夏季连衣裙**\n   - 价格：¥199\n   共 3 件商品\n\n**下一步**:\n- 查看商品详情：`--product-id \"prod_123\"`\n- 更新商品：`eb-edu-medusa-update-product`"
}
```

### 示例 2：进阶级（推荐）

**目标**：展示常用功能

**特点**：
- ✅ 1-2 个参数
- ✅ 常见使用场景
- ✅ 有实际价值

**示例**：
```json
{
  "level": "intermediate",
  "input": "查看已发布的商品",
  "parameters": {"status": "published"},
  "output": "## 📦 商品列表（已发布）\n\n1. **夏季连衣裙** (已发布)\n   - 价格：¥199\n   - 库存：100 件\n   共 3 件商品"
}
```

### 示例 3：专家级（可选）

**目标**：展示高级功能

**特点**：
- ✅ 多个参数组合
- ✅ 复杂使用场景
- ✅ 专业用户需要

**示例**：
```json
{
  "level": "advanced",
  "input": "查看商品列表，按销量排序，只显示前 10 个",
  "parameters": {
    "status": "published",
    "limit": 10,
    "sort_by": "sales"
  },
  "output": "## 📦 热销商品 TOP 10\n\n1. **夏季连衣裙**\n   销量：500 件\n   ..."
}
```

---

## 错误信息设计标准

### 第一层：简单提示（必须）

**目标**：让用户知道出错了

**内容**：
- ✅ 错误类型
- ✅ 简单原因

**示例**：
```markdown
❌ 操作失败

**错误**: 商品不存在
```

### 第二层：详细解释（推荐）

**目标**：帮助用户理解错误

**内容**：
- ✅ 详细原因
- ✅ 错误位置
- ✅ 影响范围

**示例**：
```markdown
❌ 操作失败

**错误类型**: PRODUCT_NOT_FOUND

**错误信息**: 商品不存在（ID: prod_999）

**可能原因**:
1. 商品 ID 输入错误
2. 商品已被删除
3. 权限不足，无法查看该商品
```

### 第三层：解决方案（必须）

**目标**：帮助用户解决问题

**内容**：
- ✅ 具体步骤
- ✅ 替代方案
- ✅ 求助入口

**示例**：
```markdown
❌ 操作失败

**错误**: 商品不存在

**解决方案**:
1. 检查商品 ID 是否正确
2. 使用 `eb-edu-medusa-list-products` 查看商品列表
3. 确认商品存在后重试

**需要帮助？**:
- [查看商品管理教程](./tutorials/product-management.md)
- [常见问题解答](./faq/products.md)
- [联系技术支持](./support.md)
```

---

## Skill 帮助信息设计标准

### 简短帮助（--help）

**内容**：
- ✅ 功能说明
- ✅ 基本用法
- ✅ 常用参数

**示例**：
```bash
$ stigmergy skill call eb-edu-medusa-list-products --help

查看商品列表

用法:
  stigmergy skill call eb-edu-medusa-list-products [选项]

常用选项:
  --page <number>      页码 (默认：1)
  --limit <number>     每页数量 (默认：20)
  --status <status>    状态筛选 (draft, published)
  --q <keyword>        搜索关键词

示例:
  stigmergy skill call eb-edu-medusa-list-products
  stigmergy skill call eb-edu-medusa-list-products --status published

完整文档:
  https://docs.eb-edu.com/skills/medusa-list-products
```

### 详细帮助（--help --verbose）

**内容**：
- ✅ 所有参数
- ✅ 参数详解
- ✅ 使用场景
- ✅ 最佳实践
- ✅ 常见问题

**示例**：
```bash
$ stigmergy skill call eb-edu-medusa-list-products --help --verbose

查看商品列表 - 完整帮助

功能说明:
  查看商品列表，支持分页、筛选、搜索等功能

参数详解:
  --page <number>
      页码，从 1 开始
      默认值：1
      范围：1-1000
      
  --limit <number>
      每页显示数量
      默认值：20
      范围：1-100
      建议：20-50（性能最佳）
      
  --status <status>
      商品状态筛选
      可选值：
        - draft: 草稿状态，未发布
        - published: 已发布，前台可见
        
  --q <keyword>
      搜索关键词
      搜索范围：商品标题、描述、SKU

使用场景:
  1. 查看所有商品
     stigmergy skill call eb-edu-medusa-list-products
  
  2. 查看已发布商品
     stigmergy skill call eb-edu-medusa-list-products --status published
  
  3. 搜索商品
     stigmergy skill call eb-edu-medusa-list-products --q "连衣裙"
  
  4. 分页查看
     stigmergy skill call eb-edu-medusa-list-products --page 2 --limit 50

最佳实践:
  - 默认每页 20 条，性能最佳
  - 搜索时使用具体关键词，避免模糊搜索
  - 定期清理草稿商品，提高列表加载速度

常见问题:
  Q: 为什么我看不到某些商品？
  A: 检查 --status 参数，可能商品是草稿状态
  
  Q: 搜索为什么没有结果？
  A: 检查关键词拼写，或尝试更具体的关键词

相关技能:
  - eb-edu-medusa-get-product: 查看商品详情
  - eb-edu-medusa-update-product: 更新商品信息
  - eb-edu-medusa-delete-product: 删除商品

学习资源:
  - [商品管理完整教程](./tutorials/product-management.md)
  - [商品定价指南](./guides/pricing.md)
  - [库存管理最佳实践](./guides/inventory.md)
```

---

## 业务背景知识组织

### 概念解释（Concepts）

**内容**：
- ✅ 电商术语
- ✅ 业务概念
- ✅ 技术名词

**示例**：
```markdown
# SKU（库存量单元）

**定义**: Stock Keeping Unit，库存量单元

**作用**:
- 唯一标识一个商品规格
- 用于库存管理
- 用于销售统计

**示例**:
- T 恤的 SKU: TSHIRT-RED-L（红色 L 码）
- T 恤的 SKU: TSHIRT-BLUE-M（蓝色 M 码）

**相关概念**:
- [SPU](./spu.md) - 标准化产品单元
- [库存管理](./inventory-management.md)
```

### 业务指南（Guides）

**内容**：
- ✅ 最佳实践
- ✅ 操作指南
- ✅ 决策框架

**示例**：
```markdown
# 商品定价指南

## 定价策略

### 1. 成本加成定价

公式：售价 = 成本 × (1 + 毛利率)

示例:
- 成本：¥80
- 目标毛利率：50%
- 售价：¥80 × (1 + 50%) = ¥120

### 2. 竞争定价

参考竞争对手价格，制定有竞争力的价格

示例:
- 竞品 A: ¥159
- 竞品 B: ¥199
- 我的价格：¥179（中间价位）

### 3. 价值定价

基于产品价值和用户感知定价

适用场景:
- 独特产品
- 品牌溢价
- 高端定位

## 定价检查清单

- [ ] 计算成本和毛利率
- [ ] 调研竞争对手价格
- [ ] 考虑目标用户购买力
- [ ] 测试不同价格点
- [ ] 监控销售数据调整价格

## 相关技能

- eb-edu-medusa-update-product: 更新商品价格
- eb-edu-medusa-sales-analytics: 查看销售统计
```

### 教程（Tutorials）

**内容**：
- ✅ 完整流程
- ✅ 实战演练
- ✅ 案例分析

**示例**：
```markdown
# 商品管理完整教程

## 学习目标

完成本教程后，你将能够：
- 创建商品
- 管理商品库存
- 优化商品信息
- 分析商品销售数据

## 前置知识

- [电商基础概念](./concepts/ecommerce-basics.md)
- [SKU 和 SPU](./concepts/sku-spu.md)

## 教程内容

### 第一步：创建商品

1. 准备商品信息
   - 商品标题
   - 商品描述
   - 商品价格
   - 商品图片

2. 使用 Skill 创建商品
   ```bash
   stigmergy skill call eb-edu-medusa-create-product-guided
   ```

3. 验证创建结果
   ```bash
   stigmergy skill call eb-edu-medusa-get-product --product-id "prod_123"
   ```

### 第二步：管理库存

...

## 实战演练

...

## 案例分析

...

## 总结

...
```

---

## 质量检查清单

### 渐进式披露检查

- [ ] **核心信息优先** - 第一眼看到最重要的信息
- [ ] **详细信息可选** - 用户可以选择查看详细信息
- [ ] **学习入口提供** - 提供深入学习的入口
- [ ] **参数分层** - 基础参数、高级参数、专家参数
- [ ] **示例分级** - 入门级、进阶级、专家级
- [ ] **错误信息分层** - 简单提示、详细解释、解决方案
- [ ] **帮助信息分级** - 简短帮助、详细帮助

### 业务背景知识检查

- [ ] **概念解释** - 电商术语、业务概念
- [ ] **业务指南** - 最佳实践、操作指南
- [ ] **教程** - 完整流程、实战演练
- [ ] **案例分析** - 真实案例、经验总结
- [ ] **相关链接** - 概念之间、指南之间互相关联

---

**渐进式披露实施指南版本**: v2.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台设计团队
