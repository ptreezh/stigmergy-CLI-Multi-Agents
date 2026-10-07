# Medusa CLI 命令覆盖分析与补充设计

**分析日期**: 2026-03-30  
**状态**: ❌ 覆盖严重不足，需要补充

---

## 一、当前 CLI 命令覆盖情况

### 1.1 已有 CLI 命令

| 模块 | 命令 | 功能 | 状态 |
|------|------|------|------|
| **商品** | `medusa product create` | 创建商品 | ✅ 已实现 |
| **商品** | `medusa product import-batch` | 批量导入商品 | ✅ 已实现 |
| **订单** | `medusa order create` | 创建订单 | ✅ 已实现 |
| **商品** | `medusa product list` | 查看商品列表 | 📋 规划中 |
| **订单** | `medusa order list` | 查看订单列表 | 📋 规划中 |

### 1.2 缺失的 CLI 命令（Medusa 核心功能）

Medusa 电商平台核心功能模块：

```
Medusa 核心功能
├── 商品管理 (Products)
│   ├── 创建商品 ✅
│   ├── 更新商品 ❌
│   ├── 删除商品 ❌
│   ├── 查看商品 ❌
│   ├── 商品分类 ❌
│   └── 商品变体 (SKU) ❌
│
├── 订单管理 (Orders)
│   ├── 创建订单 ✅
│   ├── 查看订单 ❌
│   ├── 更新订单状态 ❌
│   ├── 订单退款 ❌
│   └── 订单取消 ❌
│
├── 客户管理 (Customers)
│   ├── 创建客户 ❌
│   ├── 查看客户 ❌
│   ├── 客户分组 ❌
│   └── 客户等级 ❌
│
├── 库存管理 (Inventory)
│   ├── 库存查询 ❌
│   ├── 库存调整 ❌
│   ├── 库存预警 ❌
│   └── 多仓库管理 ❌
│
├── 折扣促销 (Discounts)
│   ├── 创建优惠券 ❌
│   ├── 折扣码管理 ❌
│   ├── 满减活动 ❌
│   └── 促销规则 ❌
│
├── 运输物流 (Shipping)
│   ├── 运费模板 ❌
│   ├── 物流公司 ❌
│   ├── 发货管理 ❌
│   └── 物流跟踪 ❌
│
├── 支付管理 (Payments)
│   ├── 支付配置 ❌
│   ├── 支付处理 ❌
│   └── 退款管理 ❌
│
└── 数据分析 (Analytics)
    ├── 销售统计 ❌
    ├── 商品分析 ❌
    ├── 订单分析 ❌
    └── 客户分析 ❌
```

**覆盖率**: 仅约 **5%** (2/40+)

---

## 二、需要补充的 CLI 命令

### 2.1 商品管理模块（需要补充 5 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa product list` | 查看商品列表 | P0 |
| `medusa product get` | 查看商品详情 | P0 |
| `medusa product update` | 更新商品信息 | P0 |
| `medusa product delete` | 删除商品 | P1 |
| `medusa product variants` | 管理商品变体 | P2 |

### 2.2 订单管理模块（需要补充 4 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa order list` | 查看订单列表 | P0 |
| `medusa order get` | 查看订单详情 | P0 |
| `medusa order update-status` | 更新订单状态 | P0 |
| `medusa order cancel` | 取消订单 | P1 |
| `medusa order refund` | 订单退款 | P2 |

### 2.3 客户管理模块（需要补充 3 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa customer create` | 创建客户 | P0 |
| `medusa customer list` | 查看客户列表 | P0 |
| `medusa customer get` | 查看客户详情 | P1 |
| `medusa customer groups` | 客户分组管理 | P2 |

### 2.4 库存管理模块（需要补充 4 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa inventory check` | 查询库存 | P0 |
| `medusa inventory adjust` | 调整库存 | P0 |
| `medusa inventory warning` | 库存预警 | P1 |
| `medusa inventory warehouses` | 多仓库管理 | P2 |

### 2.5 折扣促销模块（需要补充 4 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa discount create` | 创建优惠券 | P0 |
| `medusa discount list` | 查看折扣列表 | P0 |
| `medusa discount codes` | 折扣码管理 | P1 |
| `medusa discount rules` | 促销规则 | P2 |

### 2.6 运输物流模块（需要补充 4 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa shipping templates` | 运费模板 | P0 |
| `medusa shipping providers` | 物流公司 | P1 |
| `medusa shipping fulfill` | 发货管理 | P0 |
| `medusa shipping tracking` | 物流跟踪 | P2 |

### 2.7 支付管理模块（需要补充 3 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa payment configure` | 支付配置 | P0 |
| `medusa payment process` | 支付处理 | P0 |
| `medusa payment refund` | 退款管理 | P1 |

### 2.8 数据分析模块（需要补充 4 个）

| 命令 | 功能 | 优先级 |
|------|------|--------|
| `medusa analytics sales` | 销售统计 | P0 |
| `medusa analytics products` | 商品分析 | P0 |
| `medusa analytics orders` | 订单分析 | P1 |
| `medusa analytics customers` | 客户分析 | P2 |

---

## 三、完整 CLI 命令列表（规划）

### 3.1 总计

| 模块 | 已有 | 需要补充 | 总计 |
|------|------|---------|------|
| 商品管理 | 2 | 5 | 7 |
| 订单管理 | 1 | 5 | 6 |
| 客户管理 | 0 | 4 | 4 |
| 库存管理 | 0 | 4 | 4 |
| 折扣促销 | 0 | 4 | 4 |
| 运输物流 | 0 | 4 | 4 |
| 支付管理 | 0 | 3 | 3 |
| 数据分析 | 0 | 4 | 4 |
| **总计** | **3** | **33** | **36** |

### 3.2 P0 优先级（核心功能）

| # | 命令 | 功能 | 应用场景 |
|---|------|------|---------|
| 1 | `medusa product list` | 查看商品列表 | 商品管理 |
| 2 | `medusa product get` | 查看商品详情 | 商品管理 |
| 3 | `medusa product update` | 更新商品信息 | 商品管理 |
| 4 | `medusa order list` | 查看订单列表 | 订单管理 |
| 5 | `medusa order get` | 查看订单详情 | 订单管理 |
| 6 | `medusa order update-status` | 更新订单状态 | 订单管理 |
| 7 | `medusa customer create` | 创建客户 | 客户管理 |
| 8 | `medusa customer list` | 查看客户列表 | 客户管理 |
| 9 | `medusa inventory check` | 查询库存 | 库存管理 |
| 10 | `medusa inventory adjust` | 调整库存 | 库存管理 |
| 11 | `medusa discount create` | 创建优惠券 | 促销活动 |
| 12 | `medusa shipping fulfill` | 发货管理 | 物流管理 |
| 13 | `medusa payment process` | 支付处理 | 支付管理 |
| 14 | `medusa analytics sales` | 销售统计 | 数据分析 |

---

## 四、基础 Skills 补充计划

### 4.1 需要补充的基础 Skills

| Skill | 对应 CLI | 培养能力 | 优先级 |
|-------|---------|---------|--------|
| `eb-edu-medusa-update-product` | `medusa product update` | 商品更新能力 | P0 |
| `eb-edu-medusa-list-products` | `medusa product list` | 商品管理能力 | P0 |
| `eb-edu-medusa-get-order` | `medusa order get` | 订单查询能力 | P0 |
| `eb-edu-medusa-update-order-status` | `medusa order update-status` | 订单管理能力 | P0 |
| `eb-edu-medusa-check-inventory` | `medusa inventory check` | 库存查询能力 | P0 |
| `eb-edu-medusa-create-discount` | `medusa discount create` | 促销策划能力 | P1 |
| `eb-edu-medusa-fulfill-order` | `medusa shipping fulfill` | 发货管理能力 | P1 |

### 4.2 对应的引导型 Skills

| 引导型 Skill | 调用基础 Skill | 培养能力 |
|------------|---------------|---------|
| `eb-edu-manage-inventory-guided` | `medusa-inventory-check` | 库存管理能力 |
| `eb-edu-create-discount-guided` | `medusa-discount-create` | 促销策划能力 |
| `eb-edu-fulfill-order-guided` | `medusa-shipping-fulfill` | 订单履约能力 |
| `eb-edu-handle-refund-guided` | `medusa-payment-refund` | 退款处理能力 |

---

## 五、实施计划

### 5.1 第一阶段：核心补充（2026-04）

- [ ] `medusa product list` - 查看商品列表
- [ ] `medusa product get` - 查看商品详情
- [ ] `medusa product update` - 更新商品
- [ ] `medusa order list` - 查看订单列表
- [ ] `medusa order get` - 查看订单详情
- [ ] `medusa order update-status` - 更新订单状态
- [ ] `medusa customer create` - 创建客户
- [ ] `medusa customer list` - 查看客户列表

### 5.2 第二阶段：运营补充（2026-05）

- [ ] `medusa inventory check` - 查询库存
- [ ] `medusa inventory adjust` - 调整库存
- [ ] `medusa discount create` - 创建优惠券
- [ ] `medusa shipping fulfill` - 发货管理
- [ ] `medusa payment process` - 支付处理

### 5.3 第三阶段：分析补充（2026-06）

- [ ] `medusa analytics sales` - 销售统计
- [ ] `medusa analytics products` - 商品分析
- [ ] `medusa analytics orders` - 订单分析
- [ ] `medusa analytics customers` - 客户分析

---

## 六、总结

### 6.1 当前问题

1. **CLI 命令覆盖严重不足** - 仅约 5% (3/36+)
2. **基础 Skills 数量不足** - 仅 4 个，需要补充到 15+ 个
3. **Medusa 核心功能未覆盖** - 库存、折扣、物流、支付等模块缺失

### 6.2 改进计划

1. **补充 CLI 命令** - 从 3 个增加到 36 个
2. **补充基础 Skills** - 从 4 个增加到 15+ 个
3. **补充引导型 Skills** - 从 7 个增加到 20+ 个

### 6.3 目标

- ✅ **Medusa 核心功能 100% 覆盖**
- ✅ **所有业务场景都有 CLI 命令**
- ✅ **所有 CLI 命令都有对应 Skills**
- ✅ **所有实训任务都有引导型 Skills**

---

**分析者**: Soul Agent  
**分析日期**: 2026-03-30  
**状态**: 需要大规模补充 CLI 命令和 Skills
