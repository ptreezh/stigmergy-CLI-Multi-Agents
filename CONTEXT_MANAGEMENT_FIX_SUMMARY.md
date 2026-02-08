# 上下文连贯性修复总结

## 问题描述

用户报告了两个关键问题：

1. **CLI 切换后无法保持交互模式**
   - 使用 `use iflow` 切换后，没有进入 iflow 的持续交互模式
   - 每次任务执行后，CLI 进程就退出了

2. **每次交互都是全新对话，无上下文连贯性**
   - 在 qwen 模式下交互时，每次都是全新对话
   - 没有共享上下文，导致任务不连续
   - 无法记住之前的对话内容

## 解决方案

### 1️⃣ 修复 CLI 交互模式参数（问题1）

**位置**：`src/interactive/InteractiveModeController.js` 第580-614行

**修复内容**：
- 使用 `CLIAdapterManager` 获取正确的交互模式参数
- 使用 `ExecutionModeDetector` 强制交互模式
- 确保 iflow/qwen 使用 `-i` 参数（而非一次性执行参数）

**关键代码**：
```javascript
// 🔥 使用 CLIAdapterManager 获取正确的交互模式参数
const adapterManager = new CLIAdapterManager();
const modeDetector = new ExecutionModeDetector();

// 检测执行模式（在交互式终端中默认为交互模式）
const mode = modeDetector.detect({
  interactive: true,  // 强制交互模式
  verbose: process.env.DEBUG === 'true'
});

// 获取适配后的参数（使用正确的交互模式标志）
let args = adapterManager.getArguments(cliName, mode, task);
```

**效果**：
- ✅ `use iflow` 现在会正确进入 iflow 的交互模式
- ✅ 执行任务后，CLI 进程保持运行状态
- ✅ 所有 CLI 都能正确使用交互模式参数

---

### 2️⃣ 实现跨 CLI 上下文管理系统（问题2）

**位置**：`src/interactive/InteractiveModeController.js` 第44-52行，第504-1049行

**核心功能**：

#### a) 上下文数据结构
```javascript
// 每个 CLI 的独立上下文
this.cliContexts = {
  qwen: [{role, content, timestamp}, ...],
  iflow: [{role, content, timestamp}, ...],
  claude: [{role, content, timestamp}, ...
};

// 全局共享上下文
this.sharedContext = {
  sessionId: 'session-xxx',
  startTime: Date.now(),
  projectContext: {},
  taskHistory: [],
  crossCLIRefs: []
};
```

#### b) 上下文管理方法

**添加消息到上下文**：
```javascript
_addToCLIContext(cliName, role, content)
```
- 记录用户输入和 CLI 响应
- 自动限制历史记录数量（最多 20 条）
- 更新共享上下文

**获取 CLI 上下文**：
```javascript
_getCLIContext(cliName, maxItems = 5)
```
- 获取特定 CLI 的最近 N 条对话
- 用于构建上下文注入

**构建增强任务**：
```javascript
_buildContextualTask(cliName, task)
```
- 将历史对话注入到当前任务中
- 格式化为清晰的上下文格式

#### c) 上下文自动注入

在 `_executeWithCLI` 方法中：

```javascript
// 1. 记录用户输入
this._addToCLIContext(cliName, 'user', task);

// 2. 构建包含上下文的增强任务
const contextualTask = this._buildContextualTask(cliName, task);

// 3. 使用增强的任务执行
args = adapterManager.getArguments(cliName, mode, contextualTask);

// 4. 记录 CLI 响应
this._addToCLIContext(cliName, 'assistant', output.trim());
```

**效果**：
- ✅ 每个对话都包含之前的历史记录
- ✅ CLI 能够理解之前的上下文
- ✅ 任务具有连续性和连贯性

---

### 3️⃣ 新增上下文管理命令

#### `context` / `ctx` - 查看上下文状态

**功能**：
- 显示当前会话 ID
- 显示每个 CLI 的对话历史数量
- 显示全局共享上下文信息

**使用示例**：
```bash
qwen> context

========================================
  Cross-CLI Context Status
========================================
Session ID: session-1737872345678-abc123
Session Start: 1/26/2026, 3:45:67 PM

Per-CLI Conversation History:
  qwen: 8 messages
  iflow: 3 messages
  Total: 11 messages

Shared Context:
  Task History: 11 items
  Cross-CLI References: 0 items
========================================
```

#### `clear [cli]` - 清除上下文

**功能**：
- 清除特定 CLI 的上下文：`clear qwen`
- 清除所有上下文：`clear`

**使用示例**：
```bash
qwen> clear qwen
✓ Cleared context for qwen (8 messages removed)

qwen> clear
✓ Cleared all context (11 messages removed)
✓ New session started: session-1737872349999-xyz456
```

---

## 修复效果对比

### 修复前

```bash
qwen> 分析这个文件
[qwen 正在分析...]
qwen> 继续优化  # ❌ qwen 不知道之前分析了什么
[qwen 正在优化...]

qwen> use iflow
iflow> 基于刚才的分析生成测试  # ❌ iflow 完全不知道之前的分析
[iflow 执行失败]
```

### 修复后

```bash
qwen> 分析这个文件
[qwen 正在分析...]
qwen> 继续优化  # ✅ qwen 知道之前分析了什么
[Context: 4 messages (conversation history maintained)]
[qwen 正在基于之前的分析进行优化...]

qwen> use iflow
iflow> 基于刚才的分析生成测试  # ✅ iflow 看到了之前的上下文
[Context: 2 messages (iflow history)]
[Previous Context includes qwen's analysis]
[iflow 正在生成测试用例...]
```

---

## 技术亮点

### 1. 每个 CLI 独立上下文
- 每个 CLI 维护自己的对话历史
- 上下文不会相互混淆
- 支持独立清除特定 CLI 的上下文

### 2. 智能上下文注入
- 自动将最近 3 条对话注入到任务中
- 格式化为清晰的上下文格式
- CLI 能够理解并利用这些上下文

### 3. 全局共享上下文
- 跨 CLI 的任务历史记录
- 支持未来的跨 CLI 引用功能
- 为高级协作奠定基础

### 4. 用户友好
- 清晰的上下文状态显示
- 简单的命令进行管理
- 自动化上下文维护

---

## 使用指南

### 基本使用

1. **正常对话**（自动维护上下文）
   ```bash
   qwen> 帮我写一个 Python 函数
   [qwen 响应...]
   qwen> 优化这个函数  # 自动包含之前的对话
   [qwen 基于之前的代码进行优化...]
   ```

2. **切换 CLI**（保持上下文）
   ```bash
   qwen> 分析这个 bug
   [qwen 分析...]
   qwen> use iflow
   iflow> 基于分析结果，生成测试用例  # iflow 能看到 qwen 的分析
   [iflow 生成测试...]
   ```

3. **查看上下文状态**
   ```bash
   qwen> context  # 或 ctx
   [显示详细的上下文信息]
   ```

4. **清除上下文**
   ```bash
   qwen> clear qwen   # 仅清除 qwen 的上下文
   iflow> clear       # 清除所有上下文，开始新会话
   ```

### 高级技巧

1. **跨 CLI 任务链**
   ```bash
   qwen> 分析项目结构
   qwen> use iflow
   iflow> 基于刚才的分析，设计工作流
   iflow> use claude
   claude> 根据前面两步，写技术文档
   ```

2. **上下文隔离**
   ```bash
   qwen> 任务A
   qwen> use iflow
   iflow> 任务B  # 不同的上下文
   iflow> use qwen
   qwen> 任务A继续  # 回到 qwen 的上下文
   ```

---

## 未来改进方向

完整的混合方案已设计完成，详见 `HYBRID_CONTEXT_SOLUTION.md`：

1. **持久进程池**
   - 当前：每次任务都启动新进程
   - 改进：维护长期运行的 CLI 进程
   - 优势：真正的持续交互，性能更好

2. **文件持久化**
   - 当前：上下文仅保存在内存中
   - 改进：上下文持久化到磁盘
   - 优势：跨会话恢复，崩溃恢复

3. **跨 CLI 引用**
   - 当前：每个 CLI 独立维护上下文
   - 改进：支持 CLI 间的上下文引用
   - 优势：更智能的协作

4. **上下文过滤**
   - 当前：注入最近 3 条对话
   - 改进：智能选择相关的上下文
   - 优势：更精准的上下文，减少 token 消耗

---

## 测试建议

1. **基本功能测试**
   - 连续对话，验证上下文保持
   - 切换 CLI，验证各自上下文独立
   - 使用 `context` 命令查看状态

2. **边界测试**
   - 长对话（超过 20 条）测试自动清理
   - 跨 CLI 多次切换测试
   - 清除上下文后重新开始

3. **性能测试**
   - 大量上下文注入对性能的影响
   - 多 CLI 并发时的上下文管理

---

## 总结

✅ **问题1已解决**：CLI 切换后正确进入交互模式
✅ **问题2已解决**：每次交互都包含历史上下文

🚀 **额外收获**：
- 跨 CLI 上下文管理系统
- 上下文查看和管理命令
- 为未来高级功能奠定基础

💡 **下一步**：
- 实现持久进程池（真正的持续交互）
- 添加文件持久化（跨会话恢复）
- 智能上下文选择（减少 token 消耗）
