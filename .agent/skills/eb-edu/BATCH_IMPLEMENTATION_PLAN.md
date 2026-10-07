# 剩余 12 个 Skills 批量实施计划

**实施策略**: 质量第一，逐个实施，每个都符合完整标准

---

## 实施顺序

### 第一批（4 个）- 支付和商品相关

1. **P1-23**: `medusa payment configure` - 支付配置
2. **P1-24**: `medusa payment refund` - 退款管理
3. **P1-25**: `medusa product categories` - 商品分类
4. **P1-32**: `medusa customer update` - 更新客户

### 第二批（4 个）- 数据分析相关

5. **P1-26**: `medusa analytics products` - 商品分析
6. **P1-27**: `medusa analytics orders` - 订单分析
7. **P1-28**: `medusa analytics customers` - 客户分析
8. **P1-29**: `medusa discount list` - 折扣列表

### 第三批（4 个）- 其他

9. **P1-30**: `medusa discount codes` - 折扣码管理
10. **P1-31**: `medusa shipping tracking` - 物流跟踪
11. **P2-33**: `medusa customer delete` - 删除客户
12. **P2-34**: `medusa product duplicate` - 复制商品
13. **P2-35**: `medusa order notes` - 订单备注
14. **P2-36**: `medusa inventory transfer` - 库存调拨

---

## 每个 Skill 实施步骤

### 步骤 1: CLI 命令（Node.js）

```typescript
#!/usr/bin/env node
/**
 * Medusa CLI - [功能名称]
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
  // 3. API 调用
  // 4. 输出格式
  // 5. 错误处理
}

function printHelp() {
  console.log(`
Medusa CLI - [功能名称]

Usage:
  stigmergy eb-edu medusa [module] [action] [options]

Options:
  --json               输出 JSON 格式
  --help               显示帮助信息

Examples:
  stigmergy eb-edu medusa [module] [action]
`);
}

main();
```

### 步骤 2: Skill（Python + skill.json）

**skill.py**:
- build_command 函数
- execute_command 函数
- format_output 函数
- main 函数
- 错误处理

**skill.json**:
- name, version, description
- triggers (keywords + patterns)
- parameters (JSON Schema)
- execution (runtime, script, timeout)
- permissions (roles, requires_auth)
- examples (3 个分级示例)
- errors (错误定义)
- help (帮助信息)
- business_context (业务背景)

### 步骤 3: 质量检查

- ✅ CLI 命令可执行
- ✅ Skill 可调用
- ✅ 符合 agentskills.io 规范
- ✅ 渐进式披露设计
- ✅ 业务背景知识完整
- ✅ 示例和错误反例完整

---

## 实施时间估算

| 批次 | Skills 数量 | 预计时间 | 状态 |
|------|-----------|---------|------|
| 第一批 | 4 个 | 40 分钟 | ⏳ 待实施 |
| 第二批 | 4 个 | 40 分钟 | ⏳ 待实施 |
| 第三批 | 6 个 | 60 分钟 | ⏳ 待实施 |
| **总计** | **14 个** | **140 分钟** | ⏳ 待实施 |

---

**实施者**: AI 实训平台开发团队  
**质量承诺**: 质量第一，逐个实施！
