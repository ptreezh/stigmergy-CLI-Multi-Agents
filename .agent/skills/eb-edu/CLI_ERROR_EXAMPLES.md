# Medusa CLI 错误使用示例和反例

**目的**: 帮助用户正确使用 CLI 命令，避免常见错误

---

## 商品管理 CLI

### `medusa product list`

#### ✅ 正确使用

```bash
# 查看商品列表
stigmergy eb-edu medusa product list

# 查看已发布的商品
stigmergy eb-edu medusa product list --status published

# 搜索商品
stigmergy eb-edu medusa product list --q "连衣裙"

# 分页查看
stigmergy eb-edu medusa product list --page 2 --limit 10
```

#### ❌ 错误使用

```bash
# 错误 1: 不支持的参数
stigmergy eb-edu medusa product list --sort price  # ❌ 不支持排序参数

# 错误 2: 无效的页码
stigmergy eb-edu medusa product list --page 0  # ❌ 页码必须≥1

# 错误 3: 无效的每页数量
stigmergy eb-edu medusa product list --limit 0  # ❌ 每页数量必须≥1

# 错误 4: 无效的状态值
stigmergy eb-edu medusa product list --status invalid  # ❌ 只能是 draft 或 published
```

---

### `medusa product update`

#### ✅ 正确使用

```bash
# 更新价格
stigmergy eb-edu medusa product update prod_001 --price 199

# 更新库存
stigmergy eb-edu medusa product update prod_001 --inventory 100

# 同时更新多个字段
stigmergy eb-edu medusa product update prod_001 --price 199 --inventory 100 --status published

# 更新标题
stigmergy eb-edu medusa product update prod_001 --title "新款连衣裙"
```

#### ❌ 错误使用

```bash
# 错误 1: 没有提供任何更新参数
stigmergy eb-edu medusa product update prod_001  # ❌ 至少需要一个更新参数

# 错误 2: 商品 ID 不存在
stigmergy eb-edu medusa product update prod_999 --price 199  # ❌ 商品不存在

# 错误 3: 价格为负数
stigmergy eb-edu medusa product update prod_001 --price -100  # ❌ 价格不能为负

# 错误 4: 库存为负数
stigmergy eb-edu medusa product update prod_001 --inventory -50  # ❌ 库存不能为负

# 错误 5: 无效的状态值
stigmergy eb-edu medusa product update prod_001 --status invalid  # ❌ 只能是 draft 或 published
```

---

### `medusa product delete`

#### ✅ 正确使用

```bash
# 删除商品（会提示确认）
stigmergy eb-edu medusa product delete prod_001

# 确认删除（不提示）
stigmergy eb-edu medusa product delete prod_001 --force
```

#### ❌ 错误使用

```bash
# 错误 1: 没有 --force 参数时无法删除
stigmergy eb-edu medusa product delete prod_001  # ⚠️ 会提示确认，不会直接删除

# 错误 2: 删除不存在的商品
stigmergy eb-edu medusa product delete prod_999 --force  # ❌ 商品不存在

# 错误 3: 删除有订单关联的商品
stigmergy eb-edu medusa product delete prod_001 --force  # ⚠️ 可能失败，因为有订单关联
```

---

## 订单管理 CLI

### `medusa order list`

#### ✅ 正确使用

```bash
# 查看所有订单
stigmergy eb-edu medusa order list

# 查看待处理订单
stigmergy eb-edu medusa order list --status pending

# 查看已完成订单
stigmergy eb-edu medusa order list --status completed

# 分页查看
stigmergy eb-edu medusa order list --page 2 --limit 10
```

#### ❌ 错误使用

```bash
# 错误 1: 无效的状态值
stigmergy eb-edu medusa order list --status invalid  # ❌ 无效状态

# 错误 2: 无效的页码
stigmergy eb-edu medusa order list --page -1  # ❌ 页码必须≥1
```

---

### `medusa order update-status`

#### ✅ 正确使用

```bash
# 订单发货
stigmergy eb-edu medusa order update-status order_001 --status shipped

# 订单完成
stigmergy eb-edu medusa order update-status order_001 --status delivered

# 取消订单
stigmergy eb-edu medusa order update-status order_001 --status cancelled
```

#### ❌ 错误使用

```bash
# 错误 1: 缺少状态参数
stigmergy eb-edu medusa order update-status order_001  # ❌ 必须指定 --status

# 错误 2: 无效的状态值
stigmergy eb-edu medusa order update-status order_001 --status invalid  # ❌ 无效状态

# 错误 3: 订单不存在
stigmergy eb-edu medusa order update-status order_999 --status shipped  # ❌ 订单不存在

# 错误 4: 状态流转不合法
stigmergy eb-edu medusa order update-status order_001 --status delivered  # ⚠️ 未发货不能直接完成
```

---

## 客户管理 CLI

### `medusa customer create`

#### ✅ 正确使用

```bash
# 创建客户（最少参数）
stigmergy eb-edu medusa customer create --email "zhangsan@example.com"

# 创建客户（完整参数）
stigmergy eb-edu medusa customer create \
    --email "zhangsan@example.com" \
    --first-name "张三" \
    --last-name "张" \
    --phone "13800138000"
```

#### ❌ 错误使用

```bash
# 错误 1: 缺少必需参数
stigmergy eb-edu medusa customer create  # ❌ 缺少 --email

# 错误 2: 邮箱格式不正确
stigmergy eb-edu medusa customer create --email "invalid-email"  # ❌ 邮箱格式错误

# 错误 3: 邮箱已存在
stigmergy eb-edu medusa customer create --email "zhangsan@example.com"  # ❌ 邮箱已存在
```

---

## 库存管理 CLI

### `medusa inventory check`

#### ✅ 正确使用

```bash
# 查询所有库存
stigmergy eb-edu medusa inventory check

# 查询库存不足的商品
stigmergy eb-edu medusa inventory check --low-stock 10

# 查询特定商品的库存
stigmergy eb-edu medusa inventory check --product prod_001
```

#### ❌ 错误使用

```bash
# 错误 1: 无效的库存阈值
stigmergy eb-edu medusa inventory check --low-stock -10  # ❌ 阈值不能为负

# 错误 2: 不存在的商品 ID
stigmergy eb-edu medusa inventory check --product prod_999  # ❌ 商品不存在
```

---

### `medusa inventory adjust`

#### ✅ 正确使用

```bash
# 增加库存
stigmergy eb-edu medusa inventory adjust inv_001 --quantity 50

# 减少库存
stigmergy eb-edu medusa inventory adjust inv_001 --quantity -10

# 增加库存并说明原因
stigmergy eb-edu medusa inventory adjust inv_001 --quantity 50 --reason "新到货"

# 报损
stigmergy eb-edu medusa inventory adjust inv_001 --quantity -5 --reason "损坏报损"
```

#### ❌ 错误使用

```bash
# 错误 1: 缺少数量参数
stigmergy eb-edu medusa inventory adjust inv_001  # ❌ 必须指定 --quantity

# 错误 2: 库存项不存在
stigmergy eb-edu medusa inventory adjust inv_999 --quantity 50  # ❌ 库存项不存在

# 错误 3: 调整后库存为负
stigmergy eb-edu medusa inventory adjust inv_001 --quantity -100  # ❌ 调整后库存不能为负

# 错误 4: 调整数量为 0
stigmergy eb-edu medusa inventory adjust inv_001 --quantity 0  # ❌ 调整数量不能为 0
```

---

## 营销推广 CLI

### `medusa discount create`

#### ✅ 正确使用

```bash
# 创建百分比优惠券
stigmergy eb-edu medusa discount create --code "SUMMER20" --type percentage --value 20

# 创建固定金额优惠券
stigmergy eb-edu medusa discount create --code "SAVE50" --type fixed --value 50

# 创建有限制使用的优惠券
stigmergy eb-edu medusa discount create \
    --code "LIMITED100" \
    --type percentage \
    --value 20 \
    --usage-limit 100
```

#### ❌ 错误使用

```bash
# 错误 1: 缺少必需参数
stigmergy eb-edu medusa discount create --type percentage --value 20  # ❌ 缺少 --code

# 错误 2: 优惠券代码已存在
stigmergy eb-edu medusa discount create --code "SUMMER20"  # ❌ 代码已存在

# 错误 3: 无效的优惠类型
stigmergy eb-edu medusa discount create --code "TEST" --type invalid --value 20  # ❌ 无效类型

# 错误 4: 优惠值超出范围
stigmergy eb-edu medusa discount create --code "TEST" --type percentage --value 200  # ❌ 百分比不能>100

# 错误 5: 固定优惠为负数
stigmergy eb-edu medusa discount create --code "TEST" --type fixed --value -50  # ❌ 不能为负
```

---

## 物流管理 CLI

### `medusa shipping fulfill`

#### ✅ 正确使用

```bash
# 订单发货
stigmergy eb-edu medusa shipping fulfill order_001 --tracking "SF123456789" --carrier "顺丰速运"

# 部分发货
stigmergy eb-edu medusa shipping fulfill order_001 --items "item_1:2,item_2:1"
```

#### ❌ 错误使用

```bash
# 错误 1: 订单不存在
stigmergy eb-edu medusa shipping fulfill order_999  # ❌ 订单不存在

# 错误 2: 订单已发货
stigmergy eb-edu medusa shipping fulfill order_001  # ⚠️ 订单已发货，不能重复发货

# 错误 3: 发货商品数量超过订单数量
stigmergy eb-edu medusa shipping fulfill order_001 --items "item_1:100"  # ❌ 数量超过订单
```

---

## 数据分析 CLI

### `medusa analytics sales`

#### ✅ 正确使用

```bash
# 查看所有销售数据
stigmergy eb-edu medusa analytics sales

# 查看指定日期范围
stigmergy eb-edu medusa analytics sales --start-date 2026-03-01 --end-date 2026-03-31

# 按天分组统计
stigmergy eb-edu medusa analytics sales --group-by day

# 按月分组统计
stigmergy eb-edu medusa analytics sales --group-by month
```

#### ❌ 错误使用

```bash
# 错误 1: 日期格式不正确
stigmergy eb-edu medusa analytics sales --start-date "2026/03/01"  # ❌ 格式应为 YYYY-MM-DD

# 错误 2: 结束日期早于开始日期
stigmergy eb-edu medusa analytics sales --start-date 2026-03-31 --end-date 2026-03-01  # ❌ 日期范围错误

# 错误 3: 无效的分组方式
stigmergy eb-edu medusa analytics sales --group-by invalid  # ❌ 只能是 day/week/month/product
```

---

## 常见错误总结

### 1. 参数缺失错误

```bash
# ❌ 错误
stigmergy eb-edu medusa product update prod_001

# ✅ 正确
stigmergy eb-edu medusa product update prod_001 --price 199
```

### 2. 参数值错误

```bash
# ❌ 错误
stigmergy eb-edu medusa product list --status invalid

# ✅ 正确
stigmergy eb-edu medusa product list --status published
```

### 3. 资源不存在错误

```bash
# ❌ 错误
stigmergy eb-edu medusa product get prod_999

# ✅ 正确
stigmergy eb-edu medusa product get prod_001
```

### 4. 权限不足错误

```bash
# ❌ 错误（学生尝试删除商品）
stigmergy eb-edu medusa product delete prod_001 --force

# ✅ 正确（教师或管理员操作）
stigmergy skill call eb-edu-medusa-delete-product --product-id "prod_001" --force
```

---

## 错误处理最佳实践

### 1. 操作前确认

```bash
# 删除操作前确认
stigmergy eb-edu medusa product delete prod_001
# 系统会提示：⚠️ 即将删除商品：prod_001，此操作不可恢复！

# 确认删除
stigmergy eb-edu medusa product delete prod_001 --force
```

### 2. 使用 --help 查看帮助

```bash
# 查看命令帮助
stigmergy eb-edu medusa product update --help
```

### 3. 先查询后操作

```bash
# 先查询商品是否存在
stigmergy eb-edu medusa product get prod_001

# 确认存在后再更新
stigmergy eb-edu medusa product update prod_001 --price 199
```

### 4. 使用 Skills 而非直接 CLI

对于学生用户，建议使用 Skills 而非直接 CLI：

```bash
# ✅ 推荐（有权限检查和错误提示）
stigmergy skill call eb-edu-medusa-update-product --product-id "prod_001" --price 199

# ❌ 不推荐（可能权限不足）
stigmergy eb-edu medusa product update prod_001 --price 199
```

---

**文档版本**: v1.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台教学团队
