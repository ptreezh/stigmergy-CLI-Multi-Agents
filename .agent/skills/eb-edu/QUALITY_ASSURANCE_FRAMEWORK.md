# 电商 AI 实训平台 - CLI 和 Skills 质量保障体系

**版本**: v1.0  
**创建日期**: 2026-03-30  
**目标**: 确保每个 CLI 和 Skill 都真实可用、规范对齐、LLM 可调用

---

## 质量保障框架

### 1. CLI 命令质量保证

#### 1.1 CLI 命令结构检查清单

每个 CLI 命令必须满足：

- [ ] **Shebang 声明** - `#!/usr/bin/env node`
- [ ] **帮助信息** - `--help` 参数支持
- [ ] **参数解析** - 使用 args 解析
- [ ] **错误处理** - try-catch + 有意义的错误信息
- [ ] **API 调用** - 正确的 API 路径和方法
- [ ] **输出格式** - JSON 或格式化文本
- [ ] **退出码** - 成功 0，失败 1

#### 1.2 CLI 命令测试模板

```typescript
#!/usr/bin/env node
/**
 * Medusa CLI - [功能名称]
 * 
 * Usage:
 *   stigmergy eb-edu medusa [module] [action] [options]
 */

import axios from 'axios';

const API_BASE_URL = process.env.MEDUSA_API_URL || 'http://localhost:9000';

async function main() {
  const args = process.argv.slice(2);
  
  // 1. 帮助信息
  if (args.length === 0 || args[0] === '--help') {
    printHelp();
    process.exit(args[0] === '--help' ? 0 : 1);
  }
  
  // 2. 参数解析
  const [resourceId, ...options] = args;
  const json = args.includes('--json');
  
  try {
    // 3. API 调用
    const response = await axios.get(`${API_BASE_URL}/api/v1/[endpoint]`);
    const data = response.data.data || response.data;
    
    // 4. 输出格式
    if (json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      formatOutput(data);
    }
    
  } catch (error: any) {
    // 5. 错误处理
    console.error('Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

function formatOutput(data: any): void {
  // 格式化输出
}

function printHelp(): void {
  console.log(`
Medusa CLI - [功能名称]

Usage:
  stigmergy eb-edu medusa [module] [action] [options]

Arguments:
  resource-id          资源 ID

Options:
  --json               输出 JSON 格式
  --help               显示帮助信息

Examples:
  stigmergy eb-edu medusa [module] [action] resource_123
  stigmergy eb-edu medusa [module] [action] resource_123 --json
`);
}

main();
```

---

### 2. Skills 质量保证

#### 2.1 agentskills.io 规范检查清单

每个 Skill 必须满足：

**skill.json 必需字段**:
- [ ] `name` - 小写 + 连字符
- [ ] `version` - 语义化版本
- [ ] `description` - 清晰简洁
- [ ] `author` - 作者/团队
- [ ] `category` - 类别
- [ ] `tags` - 至少 1 个标签
- [ ] `triggers` - keywords + patterns
- [ ] `parameters` - JSON Schema
- [ ] `execution` - runtime, script, timeout
- [ ] `permissions` - roles, requires_auth
- [ ] `examples` - 至少 3 个，含 output
- [ ] `errors` - 错误定义

**skill.py 必需内容**:
- [ ] **Shebang 声明** - `#!/usr/bin/env python3`
- [ ] **文档字符串** - 说明功能和调用方式
- [ ] **build_command** - 构建 CLI 命令
- [ ] **execute_command** - 执行 CLI 命令
- [ ] **format_output** - 格式化输出
- [ ] **main 函数** - 参数解析 + 执行
- [ ] **错误处理** - try-except + 有意义的错误信息

#### 2.2 Skill 测试模板

```python
#!/usr/bin/env python3
"""
电商 AI 实训平台 Skill - [功能名称]

调用方式:
    stigmergy skill call eb-edu-[skill-name] \\
        --param1 "value1" \\
        --param2 "value2"
"""

import json
import sys
import subprocess
import argparse


def build_command(args):
    """构建 CLI 命令"""
    cmd = "stigmergy eb-edu medusa [module] [action]"
    
    if args.param1:
        cmd += f' --param1 "{args.param1}"'
    if args.param2:
        cmd += f' --param2 "{args.param2}"'
    
    return cmd


def execute_command(cmd):
    """执行 CLI 命令"""
    if not cmd:
        return {"success": False, "error": "缺少参数", "message": "参数错误"}
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            try:
                return {"success": True, "data": json.loads(result.stdout)}
            except:
                return {"success": True, "data": result.stdout}
        else:
            return {"success": False, "error": result.stderr}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


def format_output(result, args):
    """格式化输出结果"""
    if result["success"]:
        data = result["data"]
        
        # 处理不同类型的数据
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except:
                pass
        
        if isinstance(data, dict):
            data = data.get("data", data)
        
        output = ["## ✅ 操作成功\n"]
        output.append(f"**资源 ID**: {data.get('id', 'N/A')}")
        output.append(f"**名称**: {data.get('name', 'N/A')}")
        
        return "\n".join(output)
    else:
        return f"❌ 操作失败\n\n**错误**: {result.get('error', '未知错误')}"


def main():
    parser = argparse.ArgumentParser(description="[功能描述]")
    parser.add_argument("--param1", type=str, required=True, help="参数 1")
    parser.add_argument("--param2", type=str, help="参数 2")
    
    args = parser.parse_args()
    
    cmd = build_command(args)
    result = execute_command(cmd)
    output = format_output(result, args)
    print(output)
    
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
```

---

### 3. LLM 智能调用保证

#### 3.1 LLM 理解优化

**触发词优化**:
```json
"triggers": {
  "keywords": [
    "查看商品",           // ✅ 精确匹配
    "商品列表",           // ✅ 名词短语
    "商品管理"            // ✅ 动词 + 名词
  ],
  "patterns": [
    "查看.*商品",         // ✅ 匹配"查看商品"、"查看我的商品"
    "列出.*商品",         // ✅ 匹配"列出商品"、"列出所有商品"
    "查询.*商品"          // ✅ 匹配"查询商品"、"查询商品列表"
  ]
}
```

**参数描述优化**:
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

**示例优化**:
```json
"examples": [
  {
    "input": "查看商品列表",
    "parameters": {},
    "output": "## 📦 商品列表\n\n1. **夏季连衣裙**\n   - 价格：¥199\n   - 库存：100 件\n   共 1 件商品"
  },
  {
    "input": "查看已发布的商品",
    "parameters": {"status": "published"},
    "output": "## 📦 商品列表\n\n1. **夏季连衣裙** (已发布)\n   共 1 件商品"
  },
  {
    "input": "搜索连衣裙",
    "parameters": {"q": "连衣裙"},
    "output": "## 📦 商品列表\n\n1. **夏季连衣裙**\n   找到 1 件匹配商品"
  }
]
```

#### 3.2 LLM 调用测试场景

| 用户输入 | 预期 Skill | 预期参数 | 测试方法 |
|---------|-----------|---------|---------|
| "查看商品" | `eb-edu-medusa-list-products` | {} | Qwen/Claude 调用测试 |
| "查看已发布的商品" | `eb-edu-medusa-list-products` | {"status": "published"} | Qwen/Claude 调用测试 |
| "搜索连衣裙" | `eb-edu-medusa-list-products` | {"q": "连衣裙"} | Qwen/Claude 调用测试 |
| "更新商品 prod_123 价格为 199" | `eb-edu-medusa-update-product` | {"product_id": "prod_123", "price": 199} | Qwen/Claude 调用测试 |
| "删除商品 prod_123" | `eb-edu-medusa-delete-product` | {"product_id": "prod_123"} | Qwen/Claude 调用测试 |

---

### 4. 使用示例和错误反例

#### 4.1 正确使用示例

```bash
# ✅ 正确：查看商品列表
stigmergy skill call eb-edu-medusa-list-products --status published

# ✅ 正确：更新商品价格
stigmergy skill call eb-edu-medusa-update-product \
    --product-id "prod_123" \
    --price 199

# ✅ 正确：删除商品（带确认）
stigmergy skill call eb-edu-medusa-delete-product \
    --product-id "prod_123" \
    --force
```

#### 4.2 错误使用反例

```bash
# ❌ 错误：缺少必需参数
stigmergy skill call eb-edu-medusa-update-product --product-id "prod_123"
# 错误信息：至少需要一个更新参数

# ❌ 错误：无效的参数值
stigmergy skill call eb-edu-medusa-list-products --page -1
# 错误信息：页码必须大于 0

# ❌ 错误：资源不存在
stigmergy skill call eb-edu-medusa-get-product --product-id "prod_999"
# 错误信息：商品不存在

# ❌ 错误：权限不足
stigmergy skill call eb-edu-medusa-delete-product --product-id "prod_123"
# 错误信息：权限不足：需要 TEACHER 或 ADMIN 角色
```

---

### 5. 测试执行流程

#### 5.1 CLI 命令测试流程

```
1. 环境检查
   ↓
2. CLI 命令执行测试
   ↓
3. 正常场景测试
   ↓
4. 错误场景测试
   ↓
5. 边界条件测试
   ↓
6. 输出格式验证
   ↓
7. 错误信息验证
```

#### 5.2 Skills 测试流程

```
1. 规范检查（agentskills.io）
   ↓
2. Skill 执行测试
   ↓
3. 正常使用场景测试
   ↓
4. 错误使用场景测试
   ↓
5. LLM 调用测试
   ↓
6. 输出格式验证
   ↓
7. 错误处理验证
```

---

### 6. 质量评分标准

#### 6.1 CLI 命令质量评分

| 指标 | 权重 | 评分标准 |
|------|------|---------|
| **可用性** | 30% | 可执行、有输出、无错误 |
| **规范性** | 20% | 帮助信息、参数解析、错误处理 |
| **健壮性** | 20% | 错误处理、边界条件 |
| **易用性** | 15% | 帮助信息清晰、输出格式友好 |
| **性能** | 15% | 响应时间 < 3 秒 |

#### 6.2 Skills 质量评分

| 指标 | 权重 | 评分标准 |
|------|------|---------|
| **规范符合度** | 30% | agentskills.io 规范 100% 符合 |
| **可用性** | 25% | 可执行、有输出、无错误 |
| **LLM 可调用性** | 20% | 触发词清晰、参数描述详细、示例丰富 |
| **错误处理** | 15% | 错误定义完整、解决方案清晰 |
| **文档完整性** | 10% | 示例、错误反例完整 |

---

### 7. 持续改进机制

#### 7.1 问题反馈和修复

```
用户反馈/测试发现问题
   ↓
记录问题（Issue）
   ↓
分析根本原因
   ↓
修复问题
   ↓
回归测试
   ↓
更新文档
```

#### 7.2 定期审查

- **每周**：检查新增 Skills 的规范性
- **每月**：审查所有 Skills 的使用情况
- **每季度**：更新优化触发词和示例

---

**质量保障体系版本**: v1.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台质量团队
