# CLI 工具参数对比分析

**分析日期**: 2025-12-23
**目的**: 理解各个 CLI 工具的 `-i` 和 `-p` 参数含义，避免冲突

## 📊 关键发现

### 重要结论
**`-i` 和 `-p` 在不同 CLI 中的含义完全不同！**

- **`-p`**: 通常表示 **print**（打印输出并退出），用于**非交互式**一次性执行
- **`-i`**: 通常表示 **interactive**（交互式），用于**保持交互模式**

## 🔍 各 CLI 工具详细分析

### 1. Claude CLI

```bash
claude [options] [command] [prompt]
```

| 参数 | 含义 | 模式 | 说明 |
|------|------|------|------|
| **(无参数)** | - | 🟢 **交互式** (默认) | 启动交互式会话 |
| `-p, --print` | Print | 🔴 **非交互式** | 打印响应并退出（用于管道） |
| `-c, --continue` | Continue | 🟢 交互式 | 继续最近的对话 |
| `-r, --resume` | Resume | 🟢 交互式 | 恢复会话 |

**关键信息**:
```
Claude Code - starts an interactive session by default,
use -p/--print for non-interactive output
```

**示例**:
```bash
# 非交互式（stigmergy 当前使用的）
claude -p "写一个函数"  # 执行后退出

# 交互式（进入对话界面）
claude  # 默认就是交互式
claude "写一个函数"  # 传入初始 prompt，然后保持交互

# 继续对话
claude --continue
```

**注意**: Claude **没有 `-i` 参数**

---

### 2. Qwen CLI

```bash
qwen [options] [command]
```

| 参数 | 含义 | 模式 | 说明 |
|------|------|------|------|
| **(无参数)** | - | 🟢 **交互式** (默认) | 启动交互式 CLI |
| `-p, --prompt` | Prompt | 🔴 **非交互式** | ⚠️ 已 deprecated，用于一次性 prompt |
| **`-i, --prompt-interactive`** | Prompt + Interactive | 🟢 **混合** | ⚠️ **关键！执行 prompt 后继续交互** |

**关键信息**:
```
Qwen Code - Launch an interactive CLI, use -p/--prompt for non-interactive mode

Positionals:
  query  Positional prompt. Defaults to one-shot; use -i/--prompt-interactive
         for interactive.
```

**示例**:
```bash
# 非交互式（one-shot，已废弃）
qwen -p "写一个函数"  # 执行后退出

# 交互式（默认）
qwen  # 默认就是交互式

# 混合模式（qwen 特有！）
qwen -i "写一个函数"  # 执行初始 prompt，然后进入交互模式
                        # 用户可以继续提问！

# 位置参数（one-shot）
qwen "写一个函数"  # 默认是 one-shot，执行后退出
```

**重要**: `-i` 在 qwen 中有**特殊含义** - 执行 prompt 后**保持交互**

---

### 3. Codex CLI

```bash
codex [OPTIONS] [PROMPT]
codex exec [OPTIONS] [PROMPT]  # 非交互式
```

| 参数 | 含义 | 模式 | 说明 |
|------|------|------|------|
| **(无子命令)** | - | 🟢 **交互式** (默认) | 默认启动交互式 CLI |
| `exec` / `e` | Execute | 🔴 **非交互式** | 非交互式执行 |
| `resume` | Resume | 🟢 交互式 | 恢复之前的会话 |

**关键信息**:
```
If no subcommand is specified, options will be forwarded to the interactive CLI.
```

**示例**:
```bash
# 交互式
codex  # 默认交互式
codex "写一个函数"  # 传入初始 prompt，保持交互

# 非交互式
codex exec "写一个函数"  # 执行后退出
codex e "写一个函数"  # 同上
```

**注意**: 使用子命令区分交互/非交互，**不使用 `-p` 或 `-i`**

---

## ⚠️ 参数冲突分析

### `-p` 参数的使用

| CLI | `-p` 含义 | 用途 | 状态 |
|-----|----------|------|------|
| claude | `--print` | 非交互式输出 | ✅ 使用中 |
| qwen | `--prompt` | 一次性 prompt（已废弃） | ⚠️ Deprecated |
| codex | 不支持 | - | ❌ |

### `-i` 参数的使用

| CLI | `-i` 含义 | 用途 | 支持 |
|-----|----------|------|------|
| claude | 不支持 | - | ❌ |
| qwen | `--prompt-interactive` | 执行 prompt 后保持交互 | ✅ |
| codex | 不支持 | - | ❌ |

## 🎯 Stigmergy 当前实现分析

### 当前代码（router-beta.js）

```javascript
// 当前使用的是非交互式模式
const result = await executeCommand(toolPath, toolArgs, {
  stdio: 'inherit',
  shell: true,
  cwd: workingDir,
  env: toolEnv
});
```

**问题**：
1. ✅ 正确使用了 `-p` (claude) 或无参数 (qwen/codex 位置参数)
2. ❌ 但**不支持连续对话**
3. ❌ 执行后立即退出

### 为何使用 `-p`？

**原因**: Stigmergy 需要以下行为：
1. 接收 prompt
2. 传递给 CLI 工具
3. 获取响应
4. **退出**（返回控制权给用户/终端）

**这正是 `-p` / `--print` 的设计目的！**

---

## 💡 连续对话的可行方案

### 方案 A: 不传 `-p`（推荐）

**原理**: 利用 CLI 工具的默认交互模式

```bash
# Claude（默认交互式）
stigmergy claude "写一个函数"
# 等价于：claude "写一个函数"  # 保持交互

# Qwen（需要 -i）
stigmergy qwen -i "写一个函数"
# 等价于：qwen -i "写一个函数"  # 执行后保持交互

# Codex（默认交互式）
stigmergy codex "写一个函数"
# 等价于：codex "写一个函数"  # 保持交互
```

**优点**:
- ✅ 最简单 - 不传递 `-p`
- ✅ 利用 CLI 工具的默认行为
- ✅ 支持连续对话

**缺点**:
- ❌ **行为不一致**
  - claude: 无需参数
  - qwen: 需要 `-i`
  - codex: 无需参数
- ❌ 用户无法选择模式

### 方案 B: 添加 `--interactive` 标志

```bash
# 一次性执行（当前行为，默认）
stigmergy call "写一个函数"  # 使用 -p
stigmergy claude "写一个函数"  # 使用 -p

# 交互模式（新功能）
stigmergy call --interactive "写一个函数"
stigmergy claude -i "写一个函数"  # 不传递 -p

# 映射到各 CLI
# claude: 无参数（默认交互）
# qwen: -i（prompt-interactive）
# codex: 无参数（默认交互）
```

**映射逻辑**:

| stigmergy 参数 | claude | qwen | codex |
|---------------|--------|-------|-------|
| (默认，一次性) | `-p` | 位置参数 | `exec` |
| `--interactive` / `-i` | 无参数 | `-i` | 无参数 |

**优点**:
- ✅ 用户明确选择行为
- ✅ 向后兼容
- ✅ 可以正确适配各 CLI 工具

**缺点**:
- ⚠️ stigmergy 的 `-i` 与 qwen 的 `-i` **含义不同**
  - stigmergy `-i`: 进入交互模式
  - qwen `-i`: 执行 prompt 后保持交互
  - 但**实际效果相似**！

### 方案 C: 自动检测（不推荐）

根据 prompt 是否存在来决定模式：

```bash
stigmergy claude          # 无 prompt → 交互模式
stigmergy claude "hello"  # 有 prompt → 一次性模式
```

**问题**:
- ❌ 与用户期望不符
- ❌ 无法表达"用初始 prompt 启动交互"

---

## 🔑 关键洞察

### 1. `-i` 和 `-p` 的语义冲突

| 语境 | `-i` 通常含义 | `-p` 通常含义 |
|------|--------------|--------------|
| **通用 CLI** | `--interactive` | `--print` |
| **Claude** | 不支持 | 非交互式 |
| **Qwen** | prompt+交互 | 非交互式（已废弃） |
| **Codex** | 不支持 | 不支持 |

**结论**: 各 CLI 工具的参数定义**不统一**

### 2. Stigmergy 的两难选择

**选项 A**: 使用 `-p`（当前方案）
- ✅ 符合"一次性执行"的需求
- ✅ 明确的非交互式语义
- ❌ 不支持连续对话

**选项 B**: 不使用 `-p`
- ✅ 支持连续对话
- ❌ 行为不一致（qwen 需要 `-i`）
- ❌ 无法一次性执行

**选项 C**: 添加 `--interactive` 标志
- ✅ 兼顾两种需求
- ✅ 用户明确控制
- ⚠️ 需要为每个 CLI 工具编写适配逻辑

---

## 📋 实现建议

### 推荐方案：`--interactive` / `-i` 标志 + CLI 工具适配器

#### 映射表

```javascript
const cliAdapters = {
  claude: {
    // 一次性模式（默认）
    oneTime: (prompt) => ['-p', prompt],
    // 交互模式
    interactive: (prompt) => prompt ? [prompt] : []
  },

  qwen: {
    // 一次性模式
    oneTime: (prompt) => ['-p', prompt],  // 或直接位置参数
    // 交互模式（需要特殊处理！）
    interactive: (prompt) => prompt ? ['-i', prompt] : []
  },

  codex: {
    // 一次性模式
    oneTime: (prompt) => ['exec', prompt],
    // 交互模式
    interactive: (prompt) => prompt ? [prompt] : []
  }
};
```

#### 使用示例

```bash
# 一次性执行（当前行为，保持不变）
stigmergy claude "写一个函数"  # → claude -p "写一个函数"
stigmergy qwen "写一个函数"   # → qwen -p "写一个函数"
stigmergy codex "写一个函数"  # → codex exec "写一个函数"

# 交互模式（新功能）
stigmergy claude -i "写一个函数"  # → claude "写一个函数"
stigmergy qwen -i "写一个函数"   # → qwen -i "写一个函数"
stigmergy codex -i "写一个函数"  # → codex "写一个函数"
```

#### 关键点

1. **stigmergy 的 `-i` 标志**：
   - 含义：进入交互模式
   - 作用：控制是否传递 `-p` 给底层 CLI

2. **与 qwen `-i` 的"冲突"**：
   - stigmergy `-i`: "我要交互模式"
   - qwen `-i`: "执行 prompt 后交互"
   - **实际效果相同**！都是"保持交互"

3. **不混淆用户**：
   - 文档中明确说明 `-i` 是 stigmergy 的标志
   - 会在底层映射到各 CLI 的相应参数

---

## ✅ 验证清单

在实现前需要验证：

- [ ] claude 不使用 `-p` 时确实是交互式
- [ ] qwen `-i` 确实能执行 prompt 并保持交互
- [ ] codex 不使用 `exec` 时确实是交互式
- [ ] 其他 CLI 工具（gemini, codebuddy, copilot, iflow, qodercli）的行为

---

## 🎯 结论

### 为什么之前默认使用 `-p`？

**因为 stigmergy 的设计目标是"路由工具"**：
1. 接收用户输入
2. 路由到合适的 CLI 工具
3. 获取结果
4. **退出**（返回控制权）

这正是 `-p` / `--print` / `exec` 等参数的设计目的。

### `-i` 和 `-p` 冲突吗？

**在 stigmergy 层面不冲突**：
- `-p` 可以被理解为 pass-through（传递并退出）
- `-i` 可以被理解为 interactive（保持交互）

**但在底层 CLI 工具中确实冲突**：
- 每个工具的参数定义不同
- 需要适配器来统一处理

### 最佳方案

**添加 `--interactive` / `-i` 标志 + CLI 工具适配器**

这是：
- ✅ 技术上可行
- ✅ 用户友好
- ✅ 向后兼容
- ✅ 可扩展到其他 CLI 工具

---

**分析完成日期**: 2025-12-23
**下一步**: 实现适配器和交互模式支持
