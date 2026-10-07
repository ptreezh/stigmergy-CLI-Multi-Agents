# 电商 AI 实训平台 - 渐进式披露与业务背景知识

**版本**: v1.0  
**创建日期**: 2026-03-30  
**状态**: ✅ 所有 Skills 符合渐进式披露原则 | ✅ 业务背景知识完整

---

## 🎯 渐进式披露原则

### 什么是渐进式披露？

**渐进式披露**（Progressive Disclosure）是一种设计原则：
- **第一步**：只展示必要信息（核心信息）
- **第二步**：根据用户需求逐步展示更多信息（详细信息）
- **第三步**：提供深入学习的入口（学习资源）

### 在 Skills 中的应用

```
用户请求 → 核心信息 → 详细信息 → 深入学习
   ↓          ↓          ↓          ↓
查看商品   商品列表   商品详情   商品管理教程
```

---

## ✅ 所有 Skills 已优化

### 参数设计（分层披露）

| 层级 | 参数类型 | 特点 | 示例 |
|------|---------|------|------|
| **基础参数** | 必须/常用 | 简单易懂 | `page`, `limit`, `status` |
| **高级参数** | 可选/专业 | 有默认值 | `sort_by`, `include_deleted` |
| **专家参数** | 隐藏/高风险 | 需要专业知识 | `force_reindex`, `bypass_validation` |

### 示例设计（分级展示）

| 层级 | 示例类型 | 特点 | 数量 |
|------|---------|------|------|
| **入门级** | 无参数/最少参数 | 日常使用 | 1 个 |
| **进阶级** | 1-2 个参数 | 常见场景 | 1 个 |
| **专家级** | 多个参数组合 | 复杂场景 | 1 个 |

### 输出设计（逐步深入）

```markdown
## 第一层：核心信息（必须展示）

✅ 操作成功/失败
📊 关键数据（ID、名称、状态）
💡 下一步建议

## 第二层：详细信息（--detail 或 --json）

📋 完整属性
📈 关联数据
📜 历史记录

## 第三层：深入学习（入口提供）

📚 相关概念
📖 最佳实践
❓ 常见问题
🔗 学习资源
```

### 错误信息设计（三层结构）

```markdown
## 第一层：简单提示

❌ 操作失败
**错误**: 商品不存在

## 第二层：详细解释

**错误类型**: PRODUCT_NOT_FOUND
**错误信息**: 商品不存在（ID: prod_999）
**可能原因**: 
1. 商品 ID 输入错误
2. 商品已被删除
3. 权限不足

## 第三层：解决方案

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

## 📚 业务背景知识体系

### 第一部分：电商基础概念

#### 1. 商品管理

**核心概念**:
- [商品属性](./BUSINESS_CONTEXT_REFERENCE.md#商品属性)
- [商品状态](./BUSINESS_CONTEXT_REFERENCE.md#商品状态说明)
- [SKU 和 SPU](./BUSINESS_CONTEXT_REFERENCE.md#商品管理)
- [定价策略](./BUSINESS_CONTEXT_REFERENCE.md#商品定价策略)

**相关 Skills**:
- `eb-edu-medusa-list-products` - 查看商品列表
- `eb-edu-medusa-get-product` - 查看商品详情
- `eb-edu-medusa-update-product` - 更新商品信息

**学习资源**:
- [商品管理教程](./tutorials/product-management.md)
- [商品定价指南](./guides/pricing.md)

#### 2. 订单管理

**核心概念**:
- [订单属性](./BUSINESS_CONTEXT_REFERENCE.md#订单属性)
- [订单状态流转](./BUSINESS_CONTEXT_REFERENCE.md#订单状态流转)
- [订单处理流程](./BUSINESS_CONTEXT_REFERENCE.md#订单处理流程)
- [异常订单处理](./BUSINESS_CONTEXT_REFERENCE.md#异常订单处理)

**相关 Skills**:
- `eb-edu-medusa-list-orders` - 查看订单列表
- `eb-edu-medusa-get-order` - 查看订单详情
- `eb-edu-medusa-update-order` - 更新订单状态

**学习资源**:
- [订单处理教程](./tutorials/order-processing.md)

#### 3. 客户管理

**核心概念**:
- [客户属性](./BUSINESS_CONTEXT_REFERENCE.md#客户属性)
- [客户分类](./BUSINESS_CONTEXT_REFERENCE.md#客户分类)
- [客户服务](./BUSINESS_CONTEXT_REFERENCE.md#客户服务)

**相关 Skills**:
- `eb-edu-medusa-create-customer` - 创建客户
- `eb-edu-medusa-list-customers` - 查看客户列表
- `eb-edu-medusa-get-customer` - 查看客户详情

**学习资源**:
- [客户服务技巧](./guides/customer-service.md)

#### 4. 库存管理

**核心概念**:
- [库存属性](./BUSINESS_CONTEXT_REFERENCE.md#库存属性)
- [库存类型](./BUSINESS_CONTEXT_REFERENCE.md#库存类型)
- [库存预警](./BUSINESS_CONTEXT_REFERENCE.md#库存预警)
- [库存调整](./BUSINESS_CONTEXT_REFERENCE.md#库存调整)

**相关 Skills**:
- `eb-edu-medusa-check-inventory` - 查询库存
- `eb-edu-medusa-adjust-inventory` - 调整库存

**学习资源**:
- [库存管理最佳实践](./guides/inventory.md)

### 第二部分：业务流程

#### 5. 商品上架流程

**完整流程**:
```
1. 市场调研 → 2. 选品 → 3. 采购 → 4. 商品信息准备 → 
5. 商品录入 → 6. 定价 → 7. 上架 → 8. 推广
```

**详细教程**: [商品上架流程](./BUSINESS_CONTEXT_REFERENCE.md#商品上架流程)

**相关 Skills**:
- `eb-edu-medusa-create-product-guided` - 创建商品（引导式）
- `eb-edu-medusa-update-product` - 更新商品信息

#### 6. 订单处理流程

**完整流程**:
```
1. 客户下单 → 2. 订单确认 → 3. 配货 → 4. 打包 → 
5. 发货 → 6. 物流跟踪 → 7. 签收 → 8. 完成
```

**详细教程**: [订单处理流程](./BUSINESS_CONTEXT_REFERENCE.md#订单处理流程)

**相关 Skills**:
- `eb-edu-medusa-list-orders` - 查看订单列表
- `eb-edu-medusa-fulfill-order` - 订单发货

#### 7. 客户服务流程

**服务类型**:
- 售前服务（商品咨询、尺码推荐）
- 售中服务（订单查询、物流查询）
- 售后服务（退换货、投诉处理）

**详细教程**: [客户服务流程](./BUSINESS_CONTEXT_REFERENCE.md#客户服务流程)

**相关 Skills**:
- `eb-edu-medusa-get-customer` - 查看客户详情
- `eb-edu-medusa-refund-order` - 订单退款

### 第三部分：数据分析

#### 8. 销售分析

**核心指标**:
- 销售额、销量、毛利率
- 客单价、转化率

**分析维度**:
- 销售趋势分析
- 商品销售分析

**相关 Skills**:
- `eb-edu-medusa-sales-analytics` - 销售统计

**学习资源**:
- [销售分析指南](./guides/sales-analytics.md)

#### 9. 库存分析

**核心指标**:
- 库存周转率
- 安全库存
- 库存预警

**相关 Skills**:
- `eb-edu-medusa-check-inventory` - 查询库存

**学习资源**:
- [库存分析指南](./guides/inventory-analytics.md)

#### 10. 客户分析

**核心指标**:
- 客户数量
- 客户分类
- 客户价值

**相关 Skills**:
- `eb-edu-medusa-list-customers` - 查看客户列表
- `eb-edu-medusa-get-customer` - 查看客户详情

**学习资源**:
- [客户分析指南](./guides/customer-analytics.md)

---

## 📖 学习路径

### 入门级（新手）

**目标**：掌握基础操作

**学习路径**:
1. [电商基础概念](./BUSINESS_CONTEXT_REFERENCE.md#电商基础概念)
2. [商品管理教程](./tutorials/product-management.md)
3. [订单处理教程](./tutorials/order-processing.md)

**推荐 Skills**:
- `eb-edu-medusa-list-products` - 查看商品列表
- `eb-edu-medusa-get-product` - 查看商品详情
- `eb-edu-medusa-list-orders` - 查看订单列表

### 进阶级（有经验）

**目标**：掌握业务流程

**学习路径**:
1. [商品上架流程](./BUSINESS_CONTEXT_REFERENCE.md#商品上架流程)
2. [订单处理流程](./BUSINESS_CONTEXT_REFERENCE.md#订单处理流程)
3. [客户服务流程](./BUSINESS_CONTEXT_REFERENCE.md#客户服务流程)

**推荐 Skills**:
- `eb-edu-medusa-create-product-guided` - 创建商品（引导式）
- `eb-edu-medusa-fulfill-order` - 订单发货
- `eb-edu-medusa-update-order` - 更新订单状态

### 专家级（专业）

**目标**：掌握数据分析和优化

**学习路径**:
1. [销售分析](./BUSINESS_CONTEXT_REFERENCE.md#销售分析)
2. [库存分析](./BUSINESS_CONTEXT_REFERENCE.md#库存分析)
3. [客户分析](./BUSINESS_CONTEXT_REFERENCE.md#客户分析)

**推荐 Skills**:
- `eb-edu-medusa-sales-analytics` - 销售统计
- `eb-edu-medusa-check-inventory` - 查询库存
- `eb-edu-medusa-list-customers` - 查看客户列表

---

## ✅ 质量检查清单

### 渐进式披露检查

- [x] **核心信息优先** - 第一眼看到最重要的信息
- [x] **详细信息可选** - 用户可以选择查看详细信息（--detail, --json）
- [x] **学习入口提供** - 提供深入学习的入口（learning_resources）
- [x] **参数分层** - 基础参数、高级参数、专家参数
- [x] **示例分级** - 入门级、进阶级、专家级示例
- [x] **错误信息分层** - 简单提示、详细解释、解决方案
- [x] **帮助信息分级** - 简短帮助、详细帮助

### 业务背景知识检查

- [x] **概念解释** - 电商术语、业务概念
- [x] **业务指南** - 最佳实践、操作指南
- [x] **教程** - 完整流程、实战演练
- [x] **案例分析** - 真实案例、经验总结
- [x] **相关链接** - 概念之间、指南之间互相关联

---

## 📁 完整文档体系

### 渐进式披露文档

| 文档 | 功能 | 状态 |
|------|------|------|
| `PROGRESSIVE_DISCLOSURE_GUIDE.md` | 渐进式披露设计指南 | ✅ |
| `skill.json` (每个 Skill) | 包含 level 的 examples | ✅ |

### 业务背景知识文档

| 文档 | 功能 | 状态 |
|------|------|------|
| `BUSINESS_CONTEXT_REFERENCE.md` | 业务背景知识参考 | ✅ |
| `tutorials/` | 完整教程 | ✅ |
| `guides/` | 业务指南 | ✅ |
| `concepts/` | 概念解释 | ✅ |

---

**渐进式披露与业务背景知识版本**: v1.0  
**创建日期**: 2026-03-30  
**状态**: ✅ 所有 Skills 符合渐进式披露原则 | ✅ 业务背景知识完整
