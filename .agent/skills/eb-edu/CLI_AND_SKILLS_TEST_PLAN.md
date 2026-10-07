# Medusa CLI 命令和 Skills 完整测试报告

**测试日期**: 2026-03-30  
**测试范围**: 14 个 P0 CLI 命令 + 14 个基础 Skills  
**测试目标**: 确保所有 CLI 和 Skills 在真实场景中可用

---

## 测试环境

```
操作系统：Windows 11
Node.js: v18+
Python: v3.10+
Medusa Backend: 本地运行 (localhost:9000)
Stigmergy: 已安装并配置
```

---

## 测试场景设计

### 场景 1: 电商日常运营完整流程

```
1. 创建商品 → 2. 查询商品 → 3. 更新商品 → 4. 创建客户 → 5. 创建订单 → 
6. 查询订单 → 7. 更新订单状态 → 8. 发货 → 9. 查询库存 → 10. 销售统计
```

### 场景 2: 促销活动流程

```
1. 创建优惠券 → 2. 查询商品 → 3. 客户下单 → 4. 使用优惠券 → 5. 发货 → 6. 销售统计
```

### 场景 3: 库存管理流程

```
1. 查询库存 → 2. 识别库存不足 → 3. 调整库存 → 4. 确认调整结果
```

---

## CLI 命令测试

### 1. 商品管理 CLI 测试

#### 1.1 `medusa product list`

**测试命令**:
```bash
stigmergy eb-edu medusa product list --page 1 --limit 10
```

**预期输出**:
```json
{
  "products": [
    {
      "id": "prod_001",
      "title": "夏季连衣裙",
      "price": 19900,
      "inventory_quantity": 100,
      "status": "published"
    }
  ],
  "count": 1,
  "page": 1,
  "limit": 10
}
```

**测试结果**: ⏳ 待测试

#### 1.2 `medusa product get`

**测试命令**:
```bash
stigmergy eb-edu medusa product get prod_001
```

**预期输出**:
```json
{
  "product": {
    "id": "prod_001",
    "title": "夏季连衣裙",
    "description": "夏季新款",
    "price": 19900,
    "inventory_quantity": 100
  }
}
```

**测试结果**: ⏳ 待测试

#### 1.3 `medusa product update`

**测试命令**:
```bash
stigmergy eb-edu medusa product update prod_001 --price 15900 --inventory 150
```

**预期输出**:
```
✅ 商品已更新

商品 ID: prod_001
新价格：¥159
新库存：150 件
```

**测试结果**: ⏳ 待测试

#### 1.4 `medusa product delete`

**测试命令**:
```bash
stigmergy eb-edu medusa product delete prod_002 --force
```

**预期输出**:
```
✅ 商品已删除

商品 ID: prod_002
```

**测试结果**: ⏳ 待测试

---

### 2. 订单管理 CLI 测试

#### 2.1 `medusa order list`

**测试命令**:
```bash
stigmergy eb-edu medusa order list --status pending --limit 5
```

**预期输出**:
```json
{
  "orders": [
    {
      "id": "order_001",
      "display_id": "ORD-001",
      "email": "zhangsan@example.com",
      "total": 19900,
      "fulfillment_status": "pending"
    }
  ]
}
```

**测试结果**: ⏳ 待测试

#### 2.2 `medusa order get`

**测试命令**:
```bash
stigmergy eb-edu medusa order get order_001
```

**预期输出**:
```json
{
  "order": {
    "id": "order_001",
    "display_id": "ORD-001",
    "email": "zhangsan@example.com",
    "total": 19900,
    "items": [
      {
        "title": "夏季连衣裙",
        "quantity": 1
      }
    ]
  }
}
```

**测试结果**: ⏳ 待测试

#### 2.3 `medusa order update-status`

**测试命令**:
```bash
stigmergy eb-edu medusa order update-status order_001 --status shipped
```

**预期输出**:
```
✅ 订单状态已更新

订单号：ORD-001
新状态：shipped
```

**测试结果**: ⏳ 待测试

---

### 3. 客户管理 CLI 测试

#### 3.1 `medusa customer create`

**测试命令**:
```bash
stigmergy eb-edu medusa customer create --email "lisi@example.com" --first-name "李" --last-name "四" --phone "13800138000"
```

**预期输出**:
```json
{
  "customer": {
    "id": "cust_002",
    "email": "lisi@example.com",
    "first_name": "李",
    "last_name": "四",
    "phone": "13800138000"
  }
}
```

**测试结果**: ⏳ 待测试

#### 3.2 `medusa customer list`

**测试命令**:
```bash
stigmergy eb-edu medusa customer list --q "李"
```

**预期输出**:
```json
{
  "customers": [
    {
      "id": "cust_002",
      "email": "lisi@example.com",
      "first_name": "李",
      "last_name": "四"
    }
  ]
}
```

**测试结果**: ⏳ 待测试

---

### 4. 库存管理 CLI 测试

#### 4.1 `medusa inventory check`

**测试命令**:
```bash
stigmergy eb-edu medusa inventory check --low-stock 10
```

**预期输出**:
```json
{
  "items": [
    {
      "product_title": "T 恤",
      "inventory_quantity": 5,
      "sku": "TSHIRT-001"
    }
  ]
}
```

**测试结果**: ⏳ 待测试

#### 4.2 `medusa inventory adjust`

**测试命令**:
```bash
stigmergy eb-edu medusa inventory adjust inv_001 --quantity 50 --reason "新到货"
```

**预期输出**:
```
✅ 库存已调整

库存项 ID: inv_001
调整数量：+50
新库存：55 件
原因：新到货
```

**测试结果**: ⏳ 待测试

---

### 5. 营销推广 CLI 测试

#### 5.1 `medusa discount create`

**测试命令**:
```bash
stigmergy eb-edu medusa discount create --code "SUMMER20" --type percentage --value 20 --usage-limit 100
```

**预期输出**:
```json
{
  "discount": {
    "id": "disc_001",
    "code": "SUMMER20",
    "rule": {
      "type": "percentage",
      "value": 20
    },
    "usage_limit": 100
  }
}
```

**测试结果**: ⏳ 待测试

---

### 6. 物流管理 CLI 测试

#### 6.1 `medusa shipping fulfill`

**测试命令**:
```bash
stigmergy eb-edu medusa shipping fulfill order_001 --tracking "SF123456789" --carrier "顺丰速运"
```

**预期输出**:
```
✅ 发货已完成

订单号：order_001
发货单号：ful_001
物流单号：SF123456789
物流公司：顺丰速运
```

**测试结果**: ⏳ 待测试

---

### 7. 数据分析 CLI 测试

#### 7.1 `medusa analytics sales`

**测试命令**:
```bash
stigmergy eb-edu medusa analytics sales --start-date 2026-03-01 --end-date 2026-03-31 --group-by day
```

**预期输出**:
```json
{
  "data": {
    "total_sales": 1990000,
    "total_orders": 100,
    "average_order_value": 19900,
    "by_period": [
      {"period": "2026-03-01", "sales": 59700, "orders": 3}
    ]
  }
}
```

**测试结果**: ⏳ 待测试

---

## Skills 测试

### 测试框架

每个 Skill 测试包含：
1. **正常使用场景** - 正确调用
2. **错误使用场景** - 错误处理和提示
3. **边界条件测试** - 参数边界值
4. **LLM 智能调用测试** - AI CLI 是否能正确调用

---

### 1. `eb-edu-medusa-list-products` Skill 测试

#### 正常使用场景

**测试命令**:
```bash
stigmergy skill call eb-edu-medusa-list-products --page 1 --limit 10 --status published
```

**预期输出**:
```markdown
## 📦 商品列表

1. **夏季连衣裙**
   - 价格：¥199
   - 库存：100 件
   - 状态：published

共 1 件商品
```

**测试结果**: ⏳ 待测试

#### 错误使用场景

**测试命令**:
```bash
stigmergy skill call eb-edu-medusa-list-products --page -1
```

**预期输出**:
```
❌ 查询失败

**错误**: 页码必须大于 0
```

**测试结果**: ⏳ 待测试

#### LLM 智能调用测试

**测试场景**: 用户在 Qwen 中说"查看已发布的商品"

**预期 Qwen 行为**:
1. 理解用户意图
2. 匹配 Skill: `eb-edu-medusa-list-products`
3. 提取参数：status=published
4. 调用 Skill

**测试结果**: ⏳ 待测试

---

### 2. `eb-edu-medusa-update-product` Skill 测试

#### 正常使用场景

**测试命令**:
```bash
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_001" \
    --price 159 \
    --inventory 150
```

**预期输出**:
```markdown
## ✅ 商品已更新

**商品 ID**: prod_001
**新价格**: ¥159
**新库存**: 150 件
```

**测试结果**: ⏳ 待测试

#### 错误使用场景

**测试命令**:
```bash
stigmergy skill call eb-edu-medusa-update-product --product-id "prod_001"
```

**预期输出**:
```
❌ 错误：至少需要一个更新参数

可用参数：--title, --description, --price, --inventory, --status
```

**测试结果**: ⏳ 待测试

---

## agentskills.io 规范对齐检查

### 规范检查清单

| 检查项 | 要求 | 当前状态 | 结果 |
|--------|------|---------|------|
| **Skill 命名** | 小写 + 连字符 | `eb-edu-medusa-list-products` | ✅ |
| **Skill 描述** | 清晰简洁 | 每个 Skill 都有描述 | ✅ |
| **参数定义** | JSON Schema | 所有参数都有 Schema | ✅ |
| **触发词** | keywords + patterns | 每个 Skill 都有 | ✅ |
| **执行超时** | timeout 配置 | 默认 30 秒 | ✅ |
| **权限控制** | roles 配置 | 每个 Skill 都有 | ✅ |
| **示例** | examples 数组 | 部分 Skill 有 | ⚠️ 需补充 |
| **错误处理** | 统一错误格式 | 部分实现 | ⚠️ 需统一 |
| **输出格式** | Markdown | 大部分实现 | ⚠️ 需统一 |

### 需要改进的项

1. **示例补充** - 所有 Skill 都需要完整的 examples
2. **错误格式统一** - 统一错误输出格式
3. **输出模板统一** - 统一 Markdown 输出模板

---

## 测试执行计划

### 第一阶段：CLI 命令测试（预计 2 小时）

- [ ] 商品管理 CLI 测试（4 个）
- [ ] 订单管理 CLI 测试（3 个）
- [ ] 客户管理 CLI 测试（2 个）
- [ ] 库存管理 CLI 测试（2 个）
- [ ] 营销推广 CLI 测试（1 个）
- [ ] 物流管理 CLI 测试（1 个）
- [ ] 数据分析 CLI 测试（1 个）

### 第二阶段：Skills 测试（预计 3 小时）

- [ ] 所有 Skills 正常使用场景测试
- [ ] 所有 Skills 错误使用场景测试
- [ ] LLM 智能调用测试（通过 Qwen/Claude）

### 第三阶段：规范对齐（预计 1 小时）

- [ ] 补充所有 examples
- [ ] 统一错误输出格式
- [ ] 统一 Markdown 输出模板

---

## 测试报告模板

### CLI 命令测试报告

```markdown
#### CLI 名称

**测试命令**: `stigmergy eb-edu medusa xxx`

**测试结果**:
- ✅ 正常场景：通过
- ✅ 错误场景：通过
- ✅ 边界条件：通过

**问题记录**:
- 无 / 具体问题描述

**改进建议**:
- 无 / 具体改进建议
```

### Skill 测试报告

```markdown
#### Skill 名称

**正常使用**: ✅ 通过
**错误处理**: ✅ 通过
**LLM 调用**: ✅ 通过

**agentskills.io 规范**:
- ✅ 命名规范
- ✅ 描述清晰
- ✅ 参数完整
- ⚠️ 示例需补充
- ✅ 权限配置

**问题记录**:
- 无

**改进建议**:
- 补充 examples
```

---

**测试负责人**: Soul Agent  
**开始日期**: 2026-03-30  
**预计完成**: 2026-03-30  
**状态**: 测试计划已制定，准备执行测试
