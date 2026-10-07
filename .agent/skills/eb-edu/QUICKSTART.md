# 电商 AI 实训平台 Skills 快速启动指南

**版本**: v1.0  
**更新日期**: 2026-03-30  
**适用对象**: 教师、学生、AI CLI 用户

---

## 🚀 5 分钟快速开始

### 步骤 1: 安装 Skills（1 分钟）

```bash
# 复制 Skills 到 Stigmergy 目录
cp -r F:\aa\stigmergy-eb-edu\skills\eb-edu C:\Users\Zhang/.stigmergy/skills/

# 安装Python 依赖
pip install -r C:\Users\Zhang/.stigmergy/skills/eb-edu/requirements.txt
```

### 步骤 2: 验证安装（1 分钟）

```bash
# 查看已安装的 Skills
stigmergy skill list | grep eb-edu

# 预期输出：
# ✅ eb-edu-medusa-list-products - 查看商品列表
# ✅ eb-edu-medusa-update-product - 更新商品信息
# ✅ eb-edu-medusa-delete-product - 删除商品
# ... (共 14 个 Skills)
```

### 步骤 3: 测试 Skill（1 分钟）

```bash
# 测试第一个 Skill - 查看商品列表
stigmergy skill call eb-edu-medusa-list-products

# 预期输出：
# ## 📦 商品列表
#
# 暂无商品
#
# 共 0 件商品
```

### 步骤 4: 通过 AI CLI 调用（2 分钟）

```bash
# 通过 Qwen CLI 调用
qwen "查看商品列表"

# 通过 Claude CLI 调用
claude "查看商品列表"

# 通过 OpenCode CLI 调用
opencode "查看商品列表"
```

---

## 📚 常用 Skills 快速参考

### 商品管理

```bash
# 查看商品列表
stigmergy skill call eb-edu-medusa-list-products

# 查看已发布的商品
stigmergy skill call eb-edu-medusa-list-products --status published

# 搜索商品
stigmergy skill call eb-edu-medusa-list-products --q "连衣裙"

# 更新商品价格
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_123" \
    --price 199

# 删除商品
stigmergy skill call eb-edu-medusa-delete-product \
    --product-id "prod_123" \
    --force
```

### 订单管理

```bash
# 查看订单列表
stigmergy skill call eb-edu-medusa-list-orders

# 查看待处理订单
stigmergy skill call eb-edu-medusa-list-orders --status pending

# 查看订单详情
stigmergy skill call eb-edu-medusa-get-order \
    --order-id "order_123"

# 订单发货
stigmergy skill call eb-edu-medusa-update-order \
    --order-id "order_123" \
    --status shipped
```

### 客户管理

```bash
# 创建客户
stigmergy skill call eb-edu-medusa-create-customer \
    --email "zhangsan@example.com" \
    --first-name "张三"

# 查看客户列表
stigmergy skill call eb-edu-medusa-list-customers --q "张三"
```

### 库存管理

```bash
# 查询库存
stigmergy skill call eb-edu-medusa-check-inventory

# 查询库存不足的商品
stigmergy skill call eb-edu-medusa-check-inventory \
    --low-stock 10

# 调整库存（新到货）
stigmergy skill call eb-edu-medusa-adjust-inventory \
    --item-id "inv_123" \
    --quantity 50 \
    --reason "新到货"
```

### 营销推广

```bash
# 创建优惠券
stigmergy skill call eb-edu-medusa-create-discount \
    --code "SUMMER20" \
    --type percentage \
    --value 20
```

### 物流管理

```bash
# 订单发货
stigmergy skill call eb-edu-medusa-fulfill-order \
    --order-id "order_123" \
    --tracking "SF123456789" \
    --carrier "顺丰速运"
```

### 数据分析

```bash
# 查看销售统计
stigmergy skill call eb-edu-medusa-sales-analytics \
    --start-date "2026-03-01" \
    --end-date "2026-03-31" \
    --group-by day
```

---

## 🎓 教学实训场景

### 场景 1: 商品上架实训

**学生操作**:
```bash
# 1. 登录系统
stigmergy skill call eb-edu-login \
    --username "zhangsan" \
    --password "******"

# 2. 查看商品列表
stigmergy skill call eb-edu-medusa-list-products

# 3. 创建商品（通过引导型 Skill）
stigmergy skill call eb-edu-create-product-guided

# 4. 查看创建结果
stigmergy skill call eb-edu-medusa-list-products
```

**教师操作**:
```bash
# 1. 创建实训任务
stigmergy skill call eb-edu-create-project \
    --title "商品上架实训" \
    --deadline "2026-04-10 23:59"

# 2. 通知学生
stigmergy skill call eb-edu-send-notification \
    --message "请完成商品上架实训"

# 3. 查看学生提交
stigmergy skill call eb-edu-view-projects

# 4. 批改实训
stigmergy skill call eb-edu-grade-project \
    --student-name "张三" \
    --score 95 \
    --comment "优秀！"
```

### 场景 2: 订单处理实训

**学生操作**:
```bash
# 1. 查看订单列表
stigmergy skill call eb-edu-medusa-list-orders

# 2. 查看订单详情
stigmergy skill call eb-edu-medusa-get-order \
    --order-id "order_123"

# 3. 订单发货（通过引导型 Skill）
stigmergy skill call eb-edu-create-order-guided

# 4. 更新订单状态
stigmergy skill call eb-edu-medusa-update-order \
    --order-id "order_123" \
    --status shipped
```

### 场景 3: 库存管理实训

**学生操作**:
```bash
# 1. 查询库存
stigmergy skill call eb-edu-medusa-check-inventory

# 2. 识别库存不足的商品
stigmergy skill call eb-edu-medusa-check-inventory \
    --low-stock 10

# 3. 调整库存
stigmergy skill call eb-edu-medusa-adjust-inventory \
    --item-id "inv_123" \
    --quantity 50 \
    --reason "新到货"

# 4. 确认调整结果
stigmergy skill call eb-edu-medusa-check-inventory
```

---

## 🤖 AI CLI 集成

### Qwen CLI

```bash
# 启动 Qwen CLI
qwen

# 自然语言调用
> "查看商品列表"
> "更新商品 prod_123 价格为 199"
> "删除商品 prod_123"
> "创建客户 zhangsan@example.com"
```

### Claude CLI

```bash
# 启动 Claude CLI
claude

# 自然语言调用
> "查看商品列表"
> "更新商品 prod_123 价格为 199"
> "删除商品 prod_123"
> "创建客户 zhangsan@example.com"
```

### OpenCode CLI

```bash
# 启动 OpenCode CLI
opencode

# 自然语言调用
> "查看商品列表"
> "更新商品 prod_123 价格为 199"
> "删除商品 prod_123"
> "创建客户 zhangsan@example.com"
```

---

## ❌ 常见错误和解决方案

### 错误 1: Skill 未找到

```bash
# 错误信息
❌ Skill not found: eb-edu-medusa-list-products

# 解决方案
# 1. 确认 Skills 已安装
ls C:\Users\Zhang/.stigmergy/skills/eb-edu/

# 2. 重新安装 Skills
cp -r F:\aa\stigmergy-eb-edu\skills\eb-edu C:\Users\Zhang/.stigmergy/skills/

# 3. 验证安装
stigmergy skill list | grep eb-edu
```

### 错误 2: 参数错误

```bash
# 错误信息
❌ 错误：至少需要一个更新参数

# 解决方案
# 提供至少一个更新参数
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_123" \
    --price 199
```

### 错误 3: 权限不足

```bash
# 错误信息
❌ 权限不足：需要 TEACHER 或 ADMIN 角色

# 解决方案
# 1. 确认已登录
stigmergy auth status

# 2. 使用有权限的账号登录
stigmergy auth login --username "admin"
```

### 错误 4: 资源不存在

```bash
# 错误信息
❌ 商品不存在：prod_999

# 解决方案
# 1. 先查看商品列表
stigmergy skill call eb-edu-medusa-list-products

# 2. 确认商品 ID 正确
# 3. 使用正确的商品 ID 重试
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_123" \
    --price 199
```

---

## 📖 完整文档

| 文档 | 功能 | 链接 |
|------|------|------|
| `P0_IMPLEMENTATION_COMPLETE.md` | 最终实施报告 | [查看](./P0_IMPLEMENTATION_COMPLETE.md) |
| `CLI_ERROR_EXAMPLES.md` | 错误使用示例 | [查看](./CLI_ERROR_EXAMPLES.md) |
| `AGENTSKILLS_IO_ALIGNMENT.md` | agentskills.io 规范对齐 | [查看](./AGENTSKILLS_IO_ALIGNMENT.md) |
| `SKILLS_USAGE_SCENARIOS.md` | Skills 使用场景 | [查看](./SKILLS_USAGE_SCENARIOS.md) |
| `CLI_AND_SKILLS_TEST_PLAN.md` | 测试计划 | [查看](./CLI_AND_SKILLS_TEST_PLAN.md) |

---

## 💡 最佳实践

### 1. 使用 Skills 而非直接 CLI

```bash
# ✅ 推荐（有权限检查和错误提示）
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_123" \
    --price 199

# ❌ 不推荐（可能权限不足）
stigmergy eb-edu medusa product update prod_123 --price 199
```

### 2. 先查询后操作

```bash
# ✅ 推荐
# 先查询商品是否存在
stigmergy skill call eb-edu-medusa-get-product --product-id "prod_123"

# 确认存在后再更新
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_123" \
    --price 199
```

### 3. 使用 --help 查看帮助

```bash
# 查看 Skill 帮助
stigmergy skill call eb-edu-medusa-update-product --help

# 查看 CLI 帮助
stigmergy eb-edu medusa product update --help
```

### 4. 使用引导型 Skills 进行实训

```bash
# ✅ 推荐（有 LLM 智能引导）
stigmergy skill call eb-edu-create-product-guided

# ❌ 不推荐（无引导，直接操作）
stigmergy skill call eb-edu-medusa-create-product
```

---

**快速启动指南版本**: v1.0  
**更新日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台教学团队
