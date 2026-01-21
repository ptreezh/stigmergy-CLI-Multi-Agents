# Stigmergy 并发机制分析报告

## 📊 当前并发机制详解

### 1. 核心架构

```
用户命令 → CLI Router → Interactive Mode / Direct Command
                    ↓
            CentralOrchestrator (TypeScript)
                    ↓
            并发执行引擎 (Promise.all)
                    ↓
        多个 CLI 工具子进程 (spawn)
```

---

## 🔍 问题分析

### 问题 1: 没有新终端窗口打开

**原因**:
- 当前实现使用 `spawn()` + `stdio: ['ignore', 'pipe', 'pipe']`
- **所有输出都被重定向到管道**，不显示在终端
- 并发执行在**后台进行**，用户看不到实时反馈

**代码位置**: `src/orchestration/core/CentralOrchestrator.ts:296-342`

```typescript
const process = spawn(command, args, {
  stdio: ['ignore', 'pipe', 'pipe'],  // ❌ 问题在这里
  shell: true,
  cwd: this.workDir
});
```

### 问题 2: 没有实时反馈

**原因**:
- 并发执行使用 `Promise.all()` 等待所有进程完成
- **只在所有 CLI 都完成后才显示结果**
- 执行过程中没有任何进度提示

**代码位置**: `src/orchestration/core/CentralOrchestrator.ts:194-198`

```typescript
const promises = availableCLIs.map(cliName =>
  this._executeWithCLI(cliName, task, strategy.timeout)
);

const results = await Promise.all(promises);  // ❌ 等待全部完成
```

### 问题 3: 为什么直接退出到交互界面

**原因**:
- 交互模式启动后会进入 `_enterCommandLoop()`
- 并发命令执行完成后**立即返回命令循环**
- 没有暂停或等待用户查看结果

**代码位置**: `src/interactive/InteractiveModeController.js:253-283`

```javascript
while (this.isActive) {
  const input = await this._readInput();
  const command = this.commandParser.parse(input);
  const result = await this.executeCommand(command);  // 执行命令
  this._displayResult(result);  // 显示结果
  // ⚠️ 立即继续循环，没有暂停
}
```

---

## ⚖️ 并发协同机制

### 当前的协同方式

**1. 进程级并发** (无共享状态)
```
CLI 1 (独立进程) ─┐
CLI 2 (独立进程) ─┼→ Promise.all() → 收集结果
CLI 3 (独立进程) ─┘
```

**特点**:
- ✅ **不会冲突**: 每个 CLI 在独立进程中运行
- ✅ **资源隔离**: 一个 CLI 崩溃不影响其他
- ❌ **无通信**: CLI 之间无法相互协作
- ❌ **结果隔离**: 只能独立工作，无法共享中间结果

**2. 结果聚合** (执行后)
```javascript
{
  totalResults: 3,
  successCount: 2,
  failedCount: 1,
  results: [
    { cli: 'qwen', success: true, output: '...' },
    { cli: 'claude', success: true, output: '...' },
    { cli: 'gemini', success: false, error: '...' }
  ]
}
```

---

## 🐛 当前存在的问题

### 1. 用户体验问题

| 问题 | 影响 | 严重性 |
|------|------|--------|
| 无实时反馈 | 用户不知道执行进度 | 🔴 高 |
| 无新窗口 | 所有输出混在一起 | 🔴 高 |
| 结果一闪而过 | 没时间查看详细输出 | 🟡 中 |
| 无进度指示 | 不知道哪个 CLI 在执行 | 🟡 中 |

### 2. 技术问题

| 问题 | 原因 | 影响 |
|------|------|------|
| `stdio: pipe` 重定向 | 输出被捕获而非显示 | 用户看不到实时输出 |
| `Promise.all()` 阻塞 | 必须等待全部完成 | 响应慢 |
| 无终端窗口管理 | 没有打开新终端 | 无法交互式查看 |

---

## 💡 改进建议

### 方案 A: 实时流式输出 (推荐)

**实现方式**:
```typescript
// 修改 stdio 配置
const process = spawn(command, args, {
  stdio: ['ignore', 'inherit', 'inherit'],  // 实时显示输出
  shell: true
});

// 添加前缀标识
process.stdout.on('data', (data) => {
  console.log(`[${cliName}]`, data.toString());
});
```

**优点**:
- ✅ 实时反馈
- ✅ 简单实现
- ✅ 保持单窗口

**缺点**:
- ⚠️ 输出混杂
- ⚠️ 难以区分不同 CLI

---

### 方案 B: 多终端窗口 (最佳用户体验)

**实现方式**:
```typescript
// Windows: 使用新的 PowerShell 窗口
const spawnNewTerminal = (cliName, command) => {
  spawn('powershell.exe', ['-NoExit', '-Command', command], {
    detached: true,
    stdio: 'ignore'
  });
};

// 为每个 CLI 启动独立窗口
availableCLIs.forEach(cliName => {
  spawnNewTerminal(cliName, buildCommand(cliName, task));
});
```

**优点**:
- ✅ 清晰分离
- ✅ 可交互
- ✅ 完整输出

**缺点**:
- ⚠️ 需要平台特定代码
- ⚠️ 窗口管理复杂

---

### 方案 C: 进度条 + 结果缓存 (平衡方案)

**实现方式**:
```typescript
// 显示进度
const progress = availableCLIs.map((cli, i) =>
  `[${i+1}/${availableCLIs.length}] ${cli}: 执行中...`
);

console.log(progress.join('\n'));

// 缓存输出，分阶段显示
const outputs = new Map();

availableCLIs.forEach(cliName => {
  const proc = spawn(cliName, args);
  proc.stdout.on('data', (data) => {
    outputs.set(cliName, (outputs.get(cliName) || '') + data);
    // 实时更新该 CLI 的输出
  });
});

// 完成后汇总显示
```

**优点**:
- ✅ 有进度提示
- ✅ 结果有序
- ✅ 单窗口管理

**缺点**:
- ⚠️ 实现复杂
- ⚠️ 仍可能混杂

---

## 🎯 推荐实现步骤

### 阶段 1: 快速修复 (1-2小时)

1. **修改 stdio 为 inherit**
   ```typescript
   stdio: ['ignore', 'inherit', 'inherit']
   ```

2. **添加 CLI 名称前缀**
   ```typescript
   process.stdout.on('data', (data) => {
     console.log(chalk[`[${cliName}]`], data.toString());
   });
   ```

3. **添加进度提示**
   ```javascript
   console.log(`🚀 Starting ${availableCLIs.length} CLIs...`);
   ```

### 阶段 2: 中期优化 (1天)

1. **实现结果缓存**
2. **添加进度条**
3. **改进结果展示**

### 阶段 3: 长期目标 (3-5天)

1. **多终端窗口支持**
2. **终端管理器**
3. **交互式结果查看**

---

## 📝 总结

### 当前状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 并发执行 | ✅ 工作正常 | Promise.all() 实现正确 |
| 冲突避免 | ✅ 无冲突 | 进程隔离 |
| 用户体验 | ❌ 需改进 | 无实时反馈 |
| 终端管理 | ❌ 未实现 | 单窗口 |

### 关键发现

1. **不会冲突**: 每个 CLI 独立运行，互不干扰
2. **后台执行**: 所有输出被重定向，用户看不到
3. **结果汇总**: 才完成后才显示，没有中间状态
4. **缺少窗口管理**: 没有为每个 CLI 打开独立终端

### 下一步行动

建议先实现**方案 A (实时流式输出)**，快速改善用户体验，再考虑**方案 B (多终端窗口)**。
