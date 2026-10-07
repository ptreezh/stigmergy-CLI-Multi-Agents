# 电商 AI 实训平台 - Skills 分层设计

**版本**: v3.0  
**创建日期**: 2026-03-30  
**目标**: 确保每个 Skill 都有对应的实训教学任务

---

## Skills 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│  第三层：实训教学 Skills（面向学生，培养专业能力）               │
│  - 引导型 Skills（LLM 智能引导）                                 │
│  - 项目型 Skills（完整业务流程）                                 │
│  - 分析型 Skills（数据分析与决策）                               │
│  - 策略型 Skills（营销策划与优化）                               │
├─────────────────────────────────────────────────────────────────┤
│  第二层：业务流程 Skills（面向教师，教学管理）                   │
│  - 教学管理 Skills                                              │
│  - 学生管理 Skills                                              │
│  - 成绩管理 Skills                                              │
├─────────────────────────────────────────────────────────────────┤
│  第一层：基础操作 Skills（底层调用，不直接公开）                 │
│  - 商品操作 Skills                                              │
│  - 订单操作 Skills                                              │
│  - 客户操作 Skills                                              │
│  - 库存操作 Skills                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 第一层：基础操作 Skills（底层调用）

**特点**：
- ❌ **不直接对学生公开**
- ✅ 作为底层调用操作
- ✅ 由第二层、第三层 Skills 调用
- ✅ 简单、快速、原子化操作

### 商品操作（7 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-list-products` | 查看商品列表 | 教师、系统 |
| `eb-edu-medusa-get-product` | 查看商品详情 | 教师、系统 |
| `eb-edu-medusa-update-product` | 更新商品信息 | 教师、系统 |
| `eb-edu-medusa-delete-product` | 删除商品 | 教师、系统 |
| `eb-edu-medusa-product-variants` | 商品变体管理 | 教师、系统 |
| `eb-edu-medusa-product-categories` | 商品分类管理 | 教师、系统 |
| `eb-edu-medusa-duplicate-product` | 复制商品 | 教师、系统 |

### 订单操作（7 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-list-orders` | 查看订单列表 | 教师、系统 |
| `eb-edu-medusa-get-order` | 查看订单详情 | 教师、系统 |
| `eb-edu-medusa-update-order` | 更新订单状态 | 教师、系统 |
| `eb-edu-medusa-cancel-order` | 取消订单 | 教师、系统 |
| `eb-edu-medusa-refund-order` | 订单退款 | 教师、系统 |
| `eb-edu-medusa-order-notes` | 订单备注 | 教师、系统 |
| `eb-edu-medusa-fulfill-order` | 订单发货 | 教师、系统 |

### 客户操作（6 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-create-customer` | 创建客户 | 教师、系统 |
| `eb-edu-medusa-list-customers` | 查看客户列表 | 教师、系统 |
| `eb-edu-medusa-get-customer` | 查看客户详情 | 教师、系统 |
| `eb-edu-medusa-update-customer` | 更新客户信息 | 教师、系统 |
| `eb-edu-medusa-delete-customer` | 删除客户 | 教师、系统 |
| `eb-edu-medusa-customer-groups` | 客户分组管理 | 教师、系统 |

### 库存操作（4 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-check-inventory` | 查询库存 | 教师、系统 |
| `eb-edu-medusa-adjust-inventory` | 调整库存 | 教师、系统 |
| `eb-edu-medusa-inventory-warning` | 库存预警 | 教师、系统 |
| `eb-edu-medusa-inventory-transfer` | 库存调拨 | 教师、系统 |

### 物流操作（4 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-shipping-templates` | 运费模板管理 | 教师、系统 |
| `eb-edu-medusa-shipping-providers` | 物流公司管理 | 教师、系统 |
| `eb-edu-medusa-shipping-tracking` | 物流跟踪 | 教师、系统 |
| `eb-edu-medusa-fulfill-order` | 订单发货 | 教师、系统 |

### 支付操作（2 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-payment-configure` | 支付配置管理 | 教师、系统 |
| `eb-edu-medusa-payment-refund` | 退款管理 | 教师、系统 |

### 营销操作（3 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-create-discount` | 创建优惠券 | 教师、系统 |
| `eb-edu-medusa-list-discounts` | 折扣列表 | 教师、系统 |
| `eb-edu-medusa-discount-codes` | 折扣码管理 | 教师、系统 |

### 数据分析操作（4 个）

| Skill | 功能 | 调用者 |
|-------|------|--------|
| `eb-edu-medusa-sales-analytics` | 销售统计 | 教师、系统 |
| `eb-edu-medusa-analytics-products` | 商品分析 | 教师、系统 |
| `eb-edu-medusa-analytics-orders` | 订单分析 | 教师、系统 |
| `eb-edu-medusa-analytics-customers` | 客户分析 | 教师、系统 |

**第一层 Skills 总计**: 37 个（全部作为底层调用，不直接对学生公开）

---

## 第二层：业务流程 Skills（面向教师）

**特点**：
- ✅ **面向教师，教学管理用**
- ✅ 组合第一层 Skills
- ✅ 完成完整业务流程
- ✅ 用于教学演示和成绩管理

### 教学管理（5 个）

| Skill | 功能 | 使用场景 |
|-------|------|---------|
| `eb-edu-teach-product-demo` | 商品管理教学演示 | 教师演示商品上架流程 |
| `eb-edu-teach-order-demo` | 订单处理教学演示 | 教师演示订单处理流程 |
| `eb-edu-teach-inventory-demo` | 库存管理教学演示 | 教师演示库存管理流程 |
| `eb-edu-teach-customer-demo` | 客户服务教学演示 | 教师演示客户服务流程 |
| `eb-edu-teach-marketing-demo` | 营销推广教学演示 | 教师演示营销策划流程 |

### 学生管理（3 个）

| Skill | 功能 | 使用场景 |
|-------|------|---------|
| `eb-edu-manage-students` | 学生管理 | 管理班级学生 |
| `eb-edu-assign-tasks` | 任务分配 | 分配实训任务给学生 |
| `eb-edu-track-progress` | 进度跟踪 | 跟踪学生学习进度 |

### 成绩管理（3 个）

| Skill | 功能 | 使用场景 |
|-------|------|---------|
| `eb-edu-grade-assignments` | 作业批改 | 批改学生实训作业 |
| `eb-edu-export-grades` | 成绩导出 | 导出学生成绩 |
| `eb-edu-analyze-class-performance` | 班级分析 | 分析班级整体表现 |

**第二层 Skills 总计**: 11 个（面向教师，用于教学管理）

---

## 第三层：实训教学 Skills（面向学生）

**特点**：
- ✅ **面向学生，培养专业能力**
- ✅ LLM 智能引导
- ✅ 完整业务流程
- ✅ 培养专业思维和决策能力

### 商品运营实训（4 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-product-listing` | 商品上架能力 | 完成商品上架全流程 |
| `eb-edu-train-product-pricing` | 定价策略能力 | 制定商品定价策略 |
| `eb-edu-train-product-optimization` | 商品优化能力 | 优化商品信息提高转化 |
| `eb-edu-train-product-analysis` | 商品分析能力 | 分析商品销售数据 |

### 订单处理实训（3 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-order-processing` | 订单处理能力 | 完成订单处理全流程 |
| `eb-edu-train-order-exception` | 异常订单处理 | 处理取消、退款等异常 |
| `eb-edu-train-logistics-management` | 物流管理能力 | 管理物流发货和跟踪 |

### 客户服务实训（3 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-customer-service` | 客户服务能力 | 处理客户咨询和投诉 |
| `eb-edu-train-customer-retention` | 客户维护能力 | 维护客户关系提高复购 |
| `eb-edu-train-customer-analysis` | 客户分析能力 | 分析客户行为和偏好 |

### 库存管理实训（2 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-inventory-management` | 库存管理能力 | 管理库存和补货 |
| `eb-edu-train-inventory-optimization` | 库存优化能力 | 优化库存结构降低成本 |

### 营销推广实训（3 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-marketing-planning` | 营销策划能力 | 制定营销推广方案 |
| `eb-edu-train-discount-strategy` | 折扣策略能力 | 设计折扣活动方案 |
| `eb-edu-train-marketing-analysis` | 营销分析能力 | 分析营销活动效果 |

### 数据分析实训（3 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-sales-analysis` | 销售分析能力 | 分析销售数据制定策略 |
| `eb-edu-train-business-intelligence` | 商业智能能力 | 综合分析业务数据 |
| `eb-edu-train-decision-making` | 决策能力 | 基于数据做出业务决策 |

### 综合实训（2 个）

| Skill | 培养能力 | 实训任务 |
|-------|---------|---------|
| `eb-edu-train-full-process` | 全流程运营能力 | 完成电商运营全流程 |
| `eb-edu-train-business-optimization` | 业务优化能力 | 优化整体业务表现 |

**第三层 Skills 总计**: 20 个（面向学生，培养专业能力）

---

## Skills 调用关系

```
学生 → 第三层 Skills（实训教学）
          ↓ 调用
       第二层 Skills（业务流程）
          ↓ 调用
       第一层 Skills（基础操作）
          ↓ 调用
       Medusa API
```

### 示例：商品上架实训

```
学生： "我要完成商品上架实训"
   ↓
eb-edu-train-product-listing（第三层）
   ↓ LLM 智能引导
1. 市场调研
   ↓ 调用
   eb-edu-medusa-list-products（第一层）
   
2. 商品录入
   ↓ 调用
   eb-edu-medusa-create-product（第一层）
   
3. 定价策略
   ↓ 调用
   eb-edu-medusa-update-product（第一层）
   
4. 上架确认
   ↓ 调用
   eb-edu-medusa-update-product（第一层）
   
5. 总结反思
   ↓ LLM 生成
   实训报告
```

---

## 实训教学任务设计

### 任务设计标准

每个第三层 Skills 都对应完整的实训教学任务：

#### 1. 实训目标

- ✅ 明确培养的专业能力
- ✅ 可衡量的学习成果
- ✅ 与就业岗位对接

#### 2. 实训内容

- ✅ 完整业务流程
- ✅ 真实业务场景
- ✅ LLM 智能引导

#### 3. 实训评估

- ✅ 过程评估（LLM 实时反馈）
- ✅ 结果评估（实训报告）
- ✅ 能力评估（专业能力成长）

#### 4. 业务背景知识

- ✅ 相关概念解释
- ✅ 最佳实践
- ✅ 案例分析

---

## 实施计划

### 第一阶段：补充第三层 Skills（10 个）

| # | Skill | 培养能力 | 优先级 |
|---|-------|---------|--------|
| 1 | `eb-edu-train-product-listing` | 商品上架能力 | P0 |
| 2 | `eb-edu-train-order-processing` | 订单处理能力 | P0 |
| 3 | `eb-edu-train-customer-service` | 客户服务能力 | P0 |
| 4 | `eb-edu-train-inventory-management` | 库存管理能力 | P0 |
| 5 | `eb-edu-train-marketing-planning` | 营销策划能力 | P0 |
| 6 | `eb-edu-train-sales-analysis` | 销售分析能力 | P0 |
| 7 | `eb-edu-train-full-process` | 全流程运营能力 | P1 |
| 8 | `eb-edu-train-business-intelligence` | 商业智能能力 | P1 |
| 9 | `eb-edu-train-decision-making` | 决策能力 | P1 |
| 10 | `eb-edu-train-product-pricing` | 定价策略能力 | P1 |

### 第二阶段：补充第二层 Skills（5 个）

| # | Skill | 功能 | 优先级 |
|---|-------|------|--------|
| 1 | `eb-edu-teach-product-demo` | 商品管理教学演示 | P1 |
| 2 | `eb-edu-teach-order-demo` | 订单处理教学演示 | P1 |
| 3 | `eb-edu-manage-students` | 学生管理 | P2 |
| 4 | `eb-edu-assign-tasks` | 任务分配 | P2 |
| 5 | `eb-edu-grade-assignments` | 作业批改 | P2 |

---

## 质量保障

### 第三层 Skills 质量标准

每个第三层 Skills 必须满足：

- ✅ **LLM 智能引导** - 完整的引导式学习流程
- ✅ **业务背景知识** - 概念、指南、案例
- ✅ **渐进式披露** - 参数分层、示例分级、输出分层
- ✅ **实训任务完整** - 目标、内容、评估
- ✅ **专业能力培养** - 明确的培养目标

### 实训任务设计标准

每个实训任务都必须有：

- ✅ **实训指导书** - 完整的实训步骤
- ✅ **业务背景知识** - 相关概念和实践
- ✅ **LLM 智能引导** - 实时反馈和指导
- ✅ **实训报告模板** - 总结和反思
- ✅ **评估标准** - 明确的能力评估标准

---

**Skills 分层设计版本**: v3.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台教学团队
