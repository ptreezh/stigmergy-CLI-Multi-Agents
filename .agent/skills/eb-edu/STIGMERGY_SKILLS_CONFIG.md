# Stigmergy Skills 配置

**配置日期**: 2026-03-30  
**Skills 路径**: F:\aa\stigmergy-eb-edu\skills\eb-edu

---

## Skills 注册

### 第三层：实训教学 Skills（20 个）

**商品运营实训（4 个）**：
- `train-product-listing` - 商品上架实训
- `train-product-pricing` - 定价策略实训
- `train-product-optimization` - 商品优化实训
- `train-product-analysis` - 商品分析实训

**订单处理实训（3 个）**：
- `train-order-processing` - 订单处理实训
- `train-order-exception` - 异常订单处理
- `train-logistics-management` - 物流管理实训

**客户服务实训（3 个）**：
- `train-customer-service` - 客户服务实训
- `train-customer-retention` - 客户维护实训
- `train-customer-analysis` - 客户分析实训

**库存管理实训（2 个）**：
- `train-inventory-management` - 库存管理实训
- `train-inventory-optimization` - 库存优化实训

**营销推广实训（3 个）**：
- `train-marketing-planning` - 营销策划实训
- `train-discount-strategy` - 折扣策略实训
- `train-marketing-analysis` - 营销分析实训

**数据分析实训（3 个）**：
- `train-sales-analysis` - 销售分析实训
- `train-business-intelligence` - 商业智能实训
- `train-decision-making` - 决策能力实训

**综合实训（2 个）**：
- `train-full-process` - 全流程运营实训
- `train-business-optimization` - 业务优化实训

### 第一层：基础操作 Skills（37 个）

**商品操作（7 个）**：
- `medusa-list-products`
- `medusa-get-product`
- `medusa-update-product`
- `medusa-delete-product`
- `medusa-product-variants`
- `medusa-product-categories`
- `medusa-duplicate-product`

**订单操作（7 个）**：
- `medusa-list-orders`
- `medusa-get-order`
- `medusa-update-order`
- `medusa-cancel-order`
- `medusa-refund-order`
- `medusa-order-notes`
- `medusa-fulfill-order`

**客户操作（6 个）**：
- `medusa-create-customer`
- `medusa-list-customers`
- `medusa-get-customer`
- `medusa-update-customer`
- `medusa-delete-customer`
- `medusa-customer-groups`

**库存操作（4 个）**：
- `medusa-check-inventory`
- `medusa-adjust-inventory`
- `medusa-inventory-warning`
- `medusa-inventory-transfer`

**物流操作（4 个）**：
- `medusa-shipping-templates`
- `medusa-shipping-providers`
- `medusa-shipping-tracking`
- `medusa-fulfill-order`

**支付操作（2 个）**：
- `medusa-payment-configure`
- `medusa-payment-refund`

**营销操作（3 个）**：
- `medusa-create-discount`
- `medusa-list-discounts`
- `medusa-discount-codes`

**数据分析（4 个）**：
- `medusa-sales-analytics`
- `medusa-analytics-products`
- `medusa-analytics-orders`
- `medusa-analytics-customers`

---

## 使用方法

### 启动实训

```bash
# 商品上架实训
stigmergy skill call eb-edu-train-product-listing

# 定价策略实训
stigmergy skill call eb-edu-train-product-pricing

# 订单处理实训
stigmergy skill call eb-edu-train-order-processing

# 客户服务实训
stigmergy skill call eb-edu-train-customer-service

# 物流管理实训
stigmergy skill call eb-edu-train-logistics-management
```

### 调用基础 Skills

```bash
# 查看商品列表
stigmergy skill call eb-edu-medusa-list-products

# 创建商品
stigmergy skill call eb-edu-medusa-create-product

# 查看订单
stigmergy skill call eb-edu-medusa-list-orders
```

---

**配置版本**: v1.0  
**配置日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台教学团队
