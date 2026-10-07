# agentskills.io 规范对齐文档

**版本**: v1.0  
**对齐日期**: 2026-03-30  
**目标**: 确保所有 Skills 符合 agentskills.io 标准规范

---

## agentskills.io 核心规范

### 1. Skill 元数据规范

#### 必需字段

```json
{
  "name": "skill-名称",           // 必需：小写 + 连字符
  "version": "1.0.0",             // 必需：语义化版本
  "description": "技能描述",       // 必需：清晰简洁
  "author": "作者/团队",          // 必需
  "category": "类别",             // 必需
  "tags": ["标签 1", "标签 2"],   // 必需：至少 1 个标签
  "triggers": {                   // 必需：触发词
    "keywords": ["关键词"],
    "patterns": ["正则模式"]
  },
  "parameters": {                 // 必需：JSON Schema
    "type": "object",
    "properties": {}
  },
  "execution": {                  // 必需：执行配置
    "runtime": "python3",
    "script": "skill.py",
    "timeout": 30
  },
  "permissions": {                // 必需：权限配置
    "roles": ["STUDENT"],
    "requires_auth": true
  },
  "examples": [                   // 必需：使用示例
    {
      "input": "用户输入",
      "parameters": {},
      "output": "预期输出"
    }
  ],
  "errors": {                     // 推荐：错误定义
    "ERROR_CODE": {
      "code": 400,
      "message": "错误信息",
      "solution": "解决方案"
    }
  }
}
```

### 2. 命名规范

#### ✅ 正确命名

```json
{
  "name": "eb-edu-medusa-list-products",      // ✅ 小写 + 连字符
  "name": "eb-edu-create-order",              // ✅ 动词 + 名词
  "name": "eb-edu-check-inventory"            // ✅ 动词 + 名词
}
```

#### ❌ 错误命名

```json
{
  "name": "eb-edu-Medusa-List-Products",      // ❌ 大写字母
  "name": "eb-edu/medusa/list-products",      // ❌ 斜杠
  "name": "list_products",                    // ❌ 下划线
  "name": "medusaListProducts"                // ❌ 驼峰命名
}
```

### 3. 触发词规范

#### keywords（关键词）

```json
"triggers": {
  "keywords": [
    "查看商品",           // ✅ 精确匹配
    "商品列表",           // ✅ 名词短语
    "商品管理"            // ✅ 动词 + 名词
  ]
}
```

#### patterns（正则模式）

```json
"triggers": {
  "patterns": [
    "查看.*商品",         // ✅ 匹配"查看商品"、"查看我的商品"
    "列出.*商品",         // ✅ 匹配"列出商品"、"列出所有商品"
    "查询.*商品"          // ✅ 匹配"查询商品"、"查询商品列表"
  ]
}
```

### 4. 参数规范

#### 必需参数 vs 可选参数

```json
"parameters": {
  "type": "object",
  "required": ["product_id"],        // 必需参数
  "properties": {
    "product_id": {
      "type": "string",
      "description": "商品 ID"
    },
    "page": {
      "type": "integer",
      "default": 1,                  // 可选参数（有默认值）
      "description": "页码"
    }
  }
}
```

#### 参数验证

```json
"parameters": {
  "properties": {
    "price": {
      "type": "integer",
      "minimum": 0,                  // ✅ 最小值
      "maximum": 999999,             // ✅ 最大值
      "description": "商品价格"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published"], // ✅ 枚举值
      "description": "商品状态"
    },
    "email": {
      "type": "string",
      "format": "email",              // ✅ 格式验证
      "description": "邮箱"
    }
  }
}
```

### 5. 示例规范

#### 完整示例结构

```json
"examples": [
  {
    "input": "查看商品列表",
    "parameters": {},
    "output": "## 📦 商品列表\n\n1. **夏季连衣裙**\n   - 价格：¥199\n   共 1 件商品"
  },
  {
    "input": "查看已发布的商品",
    "parameters": {"status": "published"},
    "output": "## 📦 商品列表\n\n1. **夏季连衣裙** (已发布)\n   共 1 件商品"
  }
]
```

#### 示例最佳实践

1. **覆盖常用场景** - 至少 3 个示例
2. **包含输出示例** - 展示预期输出
3. **展示参数用法** - 展示如何使用参数
4. **包含边界情况** - 展示边界值处理

### 6. 错误处理规范

#### 错误定义

```json
"errors": {
  "MISSING_PARAMS": {
    "code": 400,
    "message": "至少需要一个更新参数",
    "solution": "提供 --title, --price, --inventory, --status 之一"
  },
  "PRODUCT_NOT_FOUND": {
    "code": 404,
    "message": "商品不存在",
    "solution": "检查商品 ID 是否正确"
  },
  "INVALID_PRICE": {
    "code": 400,
    "message": "价格不能为负数",
    "solution": "使用有效的价格，如 --price 199"
  }
}
```

#### 错误输出格式

```markdown
## ❌ 操作失败

**错误类型**: PRODUCT_NOT_FOUND

**错误信息**: 商品不存在

**解决方案**: 
1. 检查商品 ID 是否正确
2. 使用 `eb-edu-medusa-list-products` 查看商品列表
3. 确认商品存在后重试
```

### 7. 输出格式规范

#### Markdown 输出模板

```markdown
## ✅ 操作成功

**资源 ID**: {id}
**名称**: {name}
**状态**: {status}

### 详细信息
- **字段 1**: {value1}
- **字段 2**: {value2}

### 下一步
- 建议操作 1
- 建议操作 2
```

#### 列表输出模板

```markdown
## 📦 资源列表

1. **资源名称**
   - 属性 1: 值 1
   - 属性 2: 值 2

2. **资源名称**
   - 属性 1: 值 1
   - 属性 2: 值 2

共 {count} 个资源
```

---

## 当前 Skills 规范对齐状态

### 已对齐的 Skills

| Skill | 命名 | 描述 | 触发词 | 参数 | 示例 | 错误 | 状态 |
|-------|------|------|--------|------|------|------|------|
| `eb-edu-medusa-list-products` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| `eb-edu-medusa-update-product` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| `eb-edu-medusa-get-product` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-delete-product` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-list-orders` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-get-order` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-update-order` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-create-customer` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-list-customers` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-check-inventory` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-adjust-inventory` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-create-discount` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-fulfill-order` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |
| `eb-edu-medusa-sales-analytics` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 80% |

### 需要补充的项

1. **examples 补充** - 所有 output 字段
2. **errors 补充** - 所有 Skills 的错误定义

---

## LLM 智能调用保证

### LLM 理解机制

```
用户输入 → LLM 理解 → 匹配 Skill → 提取参数 → 调用 Skill
```

### 提高 LLM 准确率的方法

#### 1. 清晰的触发词

```json
"triggers": {
  "keywords": [
    "查看商品",           // ✅ 清晰明确
    "商品列表",           // ✅ 名词短语
    "商品管理"            // ✅ 动词 + 名词
  ],
  "patterns": [
    "查看.*商品",         // ✅ 匹配多种表达
    "列出.*商品",         // ✅ 匹配多种表达
    "查询.*商品"          // ✅ 匹配多种表达
  ]
}
```

#### 2. 详细的参数描述

```json
"parameters": {
  "properties": {
    "product_id": {
      "type": "string",
      "description": "商品 ID，格式：prod_xxx"  // ✅ 详细描述
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published"],
      "description": "商品状态：draft=草稿，published=已发布"  // ✅ 枚举值说明
    }
  }
}
```

#### 3. 丰富的示例

```json
"examples": [
  {
    "input": "查看商品列表",
    "parameters": {},
    "output": "## 📦 商品列表\n\n..."
  },
  {
    "input": "查看已发布的商品",
    "parameters": {"status": "published"},
    "output": "## 📦 商品列表\n\n..."
  },
  {
    "input": "搜索连衣裙",
    "parameters": {"q": "连衣裙"},
    "output": "## 📦 商品列表\n\n..."
  }
]
```

### LLM 调用测试

#### 测试场景

| 用户输入 | 预期 Skill | 预期参数 | 测试结果 |
|---------|-----------|---------|---------|
| "查看商品" | `eb-edu-medusa-list-products` | {} | ⏳ |
| "查看已发布的商品" | `eb-edu-medusa-list-products` | {"status": "published"} | ⏳ |
| "搜索连衣裙" | `eb-edu-medusa-list-products` | {"q": "连衣裙"} | ⏳ |
| "更新商品 prod_123 价格为 199" | `eb-edu-medusa-update-product` | {"product_id": "prod_123", "price": 199} | ⏳ |
| "删除商品 prod_123" | `eb-edu-medusa-delete-product` | {"product_id": "prod_123"} | ⏳ |

---

## 规范检查清单

### 每个 Skill 必须满足

- [ ] **命名规范** - 小写 + 连字符
- [ ] **描述清晰** - 一句话说明功能
- [ ] **触发词完整** - keywords + patterns
- [ ] **参数 Schema** - 完整的 JSON Schema
- [ ] **必需参数** - required 数组
- [ ] **参数描述** - 每个参数都有 description
- [ ] **执行配置** - runtime, script, timeout
- [ ] **权限配置** - roles, requires_auth
- [ ] **使用示例** - 至少 3 个 examples
- [ ] **错误定义** - 常见错误的 errors 定义

### 推荐满足

- [ ] **输出示例** - examples 包含 output
- [ ] **错误码** - 使用标准 HTTP 状态码
- [ ] **解决方案** - errors 包含 solution
- [ ] **emoji 使用** - 输出使用 emoji 增强可读性
- [ ] **下一步建议** - 输出包含下一步建议

---

**规范版本**: v1.0  
**对齐日期**: 2026-03-30  
**总体符合度**: 85%  
**待完成项**: 补充所有 examples 的 output 字段和 errors 定义
