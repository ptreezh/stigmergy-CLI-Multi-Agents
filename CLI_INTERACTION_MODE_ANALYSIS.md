# CLI 交互模式问题分析

## 当前架构

### Stigmergy 交互模式

```
用户 → Stigmergy 交互模式 → CLI 进程（每次启动新进程）→ 返回结果 → 进程退出
     ↑                                                              ↓
     └─────────────── 循环：每次交互都重复这个流程 ───────────────────┘
```

### 当前的问题

1. **每次都是新进程**
   ```javascript
   async _executeWithCLI(cliName, task) {
     // 启动新的 CLI 进程
     const process = spawn(cliName, args, {
       stdio: ['ignore', 'pipe', 'pipe'],  // stdin 被忽略！
       shell: true
     });

     // 收集输出
     process.stdout.on('data', (data) => {
       output += data.toString();
     });

     // 进程关闭后结束
     process.on('close', (code) => {
       resolve({ success: true, output });
     });
   }
   ```

2. **`-i` 标志的真实含义**

   让我检查 qwen 和 iflow 的帮助信息：

   **qwen 帮助**：
   ```
   -i, --prompt-interactive  Execute the provided prompt and continue in interactive mode
   ```

   **iflow 帮助**：
   ```
   -i, --prompt-interactive  Execute the provided prompt and continue in interactive mode
   ```

   **关键**：`-i` 标志的意思是"执行 prompt 后**继续**在交互模式中"

3. **为什么现在看起来"可以持续对话"**？

   实际上**不是真正的持续交互**，而是：
   - Stigmergy 保持了循环输入（`while (this.isActive)`）
   - 每次输入都启动新的 CLI 进程
   - 通过**上下文注入**模拟连续性

   ```javascript
   qwen> 任务1  // 启动进程1 → 执行 → 退出
   qwen> 任务2  // 启动进程2（注入任务1的上下文）→ 执行 → 退出
   qwen> 任务3  // 启动进程3（注入任务1、2的上下文）→ 执行 → 退出
   ```

   这**不是真正的持续交互**，只是"上下文增强的一次性执行"。

## 真正的持续交互应该是什么样？

### 期望的交互模式

```
用户 → Stigmergy → 持久化的 CLI 进程 → 返回结果 → 进程**继续运行**
                    ↓                     ↓
                    └─ 保持进程活跃 ←──────┘
```

### 期望的行为

```bash
qwen> 任务1
[立即响应，不退出]
qwen> 任务2
[立即响应，不退出]
qwen> 任务3
[立即响应，不退出]
```

**关键特征**：
- ✅ CLI 进程**永不退出**
- ✅ 响应速度快（进程已启动）
- ✅ 真正的会话状态（在 CLI 的内存中）
- ✅ 可以处理多轮交互

## 当前的限制

### 为什么 `-i` 标志不工作？

因为 `stdio: ['ignore', 'pipe', 'pipe']`：
- `stdin: 'ignore'` → CLI 无法接收持续输入
- 即使使用 `-i`，CLI 也会因为 stdin 关闭而退出

### 为什么上下文不是真正的持续交互？

因为每次都是新进程：
- CLI 的内存状态**不保留**
- 只是**模拟**上下文（通过文本注入）
- 无法利用 CLI 的原生会话机制

## 解决方案

### 方案1：持久进程池（真正的持续交互）⭐⭐⭐⭐⭐

**实现**：
```javascript
class PersistentCLIPool {
  async getCLIClient(cliName) {
    // 如果进程已存在，直接返回
    if (this.processes[cliName]?.isHealthy()) {
      return this.processes[cliName];
    }

    // 否则创建新进程（使用交互模式，不退出）
    return await this._createPersistentProcess(cliName);
  }

  async _createPersistentProcess(cliName) {
    // 启动 CLI 进程（不带任何任务参数）
    const proc = spawn(cliName, [], {
      stdio: ['pipe', 'pipe', 'pipe'],  // 保持 stdin 打开！
      shell: true
    });

    // 等待 CLI 就绪
    await this._waitForReady(proc);

    return new CLIProcess(proc, cliName);
  }

  async executeTask(cliName, task) {
    const client = await this.getCLIClient(cliName);

    // 向持久进程发送任务
    return await client.send(task);
  }
}

class CLIProcess {
  constructor(proc, cliName) {
    this.proc = proc;
    this.cliName = cliName;
    this.ready = false;
  }

  async send(task) {
    return new Promise((resolve, reject) => {
      // 发送任务到 stdin
      this.proc.stdin.write(task + '\n');

      // 监听响应
      const onResponse = () => {
        // 检测是否完整响应（检测到提示符）
        if (this._isCompleteResponse()) {
          resolve(this._extractResponse());
        } else {
          setTimeout(onResponse, 50);
        }
      };

      onResponse();
    });
  }

  _isCompleteResponse() {
    // 检测输出中是否包含提示符
    // 例如：qwen>, iflow>, >, $ 等
    return this.output.includes('>') ||
           this.output.includes('$') ||
           this.output.includes(this.cliName + '>');
  }
}
```

**优势**：
- ✅ 真正的持续交互
- ✅ 响应速度快
- ✅ 原生会话状态
- ✅ 支持多轮对话

**挑战**：
- ⚠️ 需要管理进程生命周期
- ⚠️ 需要处理提示符检测
- ⚠️ 需要处理超时和错误恢复

### 方案2：CLI 的会话恢复机制（临时方案）⭐⭐⭐

**原理**：利用 CLI 的会话恢复功能

```javascript
async _executeWithCLI(cliName, task) {
  // 1. 获取该 CLI 的历史会话
  const sessions = await this._getCLISessions(cliName);
  const lastSession = sessions[0];

  // 2. 使用 CLI 的会话恢复功能
  let args;
  if (cliName === 'qwen') {
    // qwen 支持 -c/--continue 继续最近的会话
    args = ['-c', '-i', task];
  } else if (cliName === 'iflow') {
    // iflow 支持 -r/--resume 恢复会话
    args = ['-r', '-i', task];
  }

  // 3. 执行任务
  const result = await spawn(cliName, args, { ... });

  // 4. 保存会话 ID
  await this._saveSessionId(cliName, result.sessionId);
}
```

**优势**：
- ✅ 利用 CLI 原生功能
- ✅ 实现相对简单

**限制**：
- ⚠️ 仍然是一次性执行（不是真正的持续交互）
- ⚠️ 依赖 CLI 的会话恢复功能
- ⚠️ 响应速度慢（每次启动新进程）

## 推荐方案

### 短期：方案2（会话恢复）
- 快速实现
- 改善用户体验
- 为长期方案铺路

### 长期：方案1（持久进程池）
- 真正的持续交互
- 最佳用户体验
- 完全控制 CLI 进程

## 实现步骤

### Phase 1：验证 CLI 的交互模式（当前）

```bash
# 测试 qwen 的持续交互
echo -e "任务1\n任务2\n任务3" | qwen

# 测试 iflow 的持续交互
echo -e "task1\ntask2\ntask3" | iflow

# 测试 qwen 的 -c 标志
qwen -c -i "continue previous task"

# 测试 iflow 的 -r 标志
iflow -r -i "continue previous task"
```

### Phase 2：实现持久进程池

1. 创建 `PersistentCLIPool` 类
2. 创建 `CLIProcess` 封装
3. 实现提示符检测
4. 实现进程健康检查
5. 集成到 `InteractiveModeController`

### Phase 3：测试和优化

1. 单 CLI 测试
2. CLI 切换测试
3. 错误恢复测试
4. 性能优化

## 总结

**当前的"持续对话"是假的**，只是：
- Stigmergy 循环输入
- 每次启动新进程
- 通过上下文注入模拟连续性

**真正的持续交互需要**：
- 持久化的 CLI 进程
- 保持 stdin 打开
- 动态发送任务
- 检测响应完成

**下一步**：
1. 验证 CLI 的交互模式行为
2. 实现持久进程池
3. 集成到交互模式控制器
