# 持久进程池集成指南

## 🎯 目标

实现**真正的持续交互**，而不是每次都启动新进程。

## 📊 问题对比

### 当前实现（伪持续交互）

```javascript
// 每次交互都启动新进程
async _executeWithCLI(cliName, task) {
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

**问题**：
- ❌ 每次启动新进程
- ❌ CLI 无法保持会话状态
- ❌ 依赖上下文注入模拟连续性
- ❌ 响应速度慢（启动时间）

### 目标实现（真正的持续交互）

```javascript
// 使用持久进程池
async _executeWithCLI(cliName, task) {
  // 从进程池获取（或创建）持久进程
  const result = await this.cliPool.executeTask(cliName, task);

  // 进程**继续运行**，等待下一个任务
  return result;
}
```

**优势**：
- ✅ CLI 进程长期运行
- ✅ 真正的会话状态（在 CLI 内存中）
- ✅ 响应速度快（进程已启动）
- ✅ 支持多轮对话

---

## 🔧 集成步骤

### Step 1: 已完成 ✅

`src/interactive/PersistentCLIPool.js` - 持久进程池实现

**核心功能**：
- `PersistentCLIPool` - 进程池管理器
- `CLIProcess` - CLI 进程封装
- 提示符检测
- 进程健康检查
- 自动重启机制

### Step 2: 需要手动集成

在 `src/interactive/InteractiveModeController.js` 中：

#### 2.1 添加导入（第12行附近）

```javascript
// 🔥 新增：持久进程池
const { PersistentCLIPool } = require('./PersistentCLIPool');
```

✅ **已完成**

#### 2.2 初始化进程池（第57行附近）

```javascript
// 🔥 新增：持久进程池（实现真正的持续交互）
this.cliPool = new PersistentCLIPool({
  autoRestart: true,
  healthCheckInterval: 30000,
  maxIdleTime: 300000 // 5 分钟无活动后关闭
});
```

✅ **已完成**

#### 2.3 修改 stop 方法（第130行附近）

```javascript
// 🔥 新增：关闭所有持久 CLI 进程
console.log('\n[POOL] Shutting down persistent CLI processes...');
await this.cliPool.shutdownAll();
```

✅ **已完成**

#### 2.4 重写 _executeWithCLI 方法（第678-847行）

**当前代码**：
```javascript
async _executeWithCLI(cliName, task) {
  const { spawn } = require('child_process');
  // ... 启动新进程的逻辑
}
```

**替换为**：
```javascript
async _executeWithCLI(cliName, task) {
  const startTime = Date.now();

  try {
    console.log(`\n[${cliName}] Executing task...`);
    console.log(`Task: ${task}`);
    console.log('');

    // 🔥 记录用户输入到上下文
    this._addToCLIContext(cliName, 'user', task);

    // 🔥 构建包含上下文的增强任务
    const contextualTask = this._buildContextualTask(cliName, task);
    const finalTask = contextualTask !== task ? contextualTask : task;

    if (process.env.DEBUG === 'true' && contextualTask !== task) {
      console.log('[DEBUG] Using contextual task with conversation history');
    }

    // 🔥 关键改变：使用持久进程池
    const result = await this.cliPool.executeTask(cliName, finalTask, {
      timeout: this.options.cliTimeout || 30000,
      verbose: process.env.DEBUG === 'true'
    });

    // 🔥 记录 CLI 响应到上下文
    if (result.output && result.output.trim()) {
      this._addToCLIContext(cliName, 'assistant', result.output.trim());
    }

    // 显示执行结果
    console.log('');
    console.log(`[${cliName}] Response received in ${result.executionTime}ms`);

    // 显示上下文状态
    const contextCount = this.cliContexts[cliName]?.length || 0;
    if (contextCount > 2) {
      console.log(`[${cliName}] Context: ${contextCount} messages maintained`);
    }

    return {
      ...result,
      task: task,
      hasContext: contextCount > 1
    };

  } catch (error) {
    console.error(`\n[${cliName}] Execution failed:`, error.message);

    // 回退到 iflow
    if (cliName === 'qwen') {
      console.log(`[${cliName}] Trying fallback to iflow...`);

      try {
        const fallbackResult = await this.cliPool.executeTask('iflow', task, {
          timeout: this.options.cliTimeout || 30000
        });

        this._addToCLIContext('iflow', 'user', task);
        if (fallbackResult.output) {
          this._addToCLIContext('iflow', 'assistant', fallbackResult.output.trim());
        }

        console.log(`\n[iflow] Fallback successful!`);

        return {
          ...fallbackResult,
          task: task,
          fallback: true,
          originalCLI: cliName
        };
      } catch (fallbackError) {
        console.error(`[iflow] Fallback also failed:`, fallbackError.message);
      }
    }

    throw error;
  }
}
```

❌ **需要手动替换**

---

## 🚀 快速集成命令

由于 Edit 工具无法精确匹配，请使用以下命令手动替换：

```bash
# 备份原文件
cp src/interactive/InteractiveModeController.js src/interactive/InteractiveModeController.js.backup

# 创建补丁文件
cat > /tmp/executeWithCLI.patch << 'PATCH_END'
--- a/src/interactive/InteractiveModeController.js
+++ b/src/interactive/InteractiveModeController.js
@@ -675,172 +675,78 @@
   /**
    * Execute task with specific CLI
    */
-  async _executeWithCLI(cliName, task) {
-    const { spawn } = require('child_process');
-    const { CLIAdapterManager } = require('../core/cli_adapters');
-    const ExecutionModeDetector = require('../core/execution_mode_detector');
-
-    try {
-      console.log(`\nExecuting with ${cliName}...`);
-      console.log(`Task: ${task}`);
-      console.log('');
-
-      // 🔥 使用 CLIAdapterManager 获取正确的交互模式参数
-      // 这确保了 iflow/qwen 等使用 -i 参数保持交互模式
-      const adapterManager = new CLIAdapterManager();
-      const modeDetector = new ExecutionModeDetector();
-
-      // 检测执行模式（在交互式终端中默认为交互模式）
-      const mode = modeDetector.detect({
-        interactive: true,  // 强制交互模式
-        verbose: process.env.DEBUG === 'true'
-      });
-
-      // 获取适配后的参数（使用正确的交互模式标志）
-      let args = adapterManager.getArguments(cliName, mode, task);
-
-      // 🔥 重要：为并发执行添加 YOLO 模式参数
-      // 这确保所有 CLI 都能自动执行操作
-      const autoModeArgs = adapterManager.getAutoModeArguments(cliName);
-      if (autoModeArgs.length > 0) {
-        args = [...autoModeArgs, ...args];
-      }
-
-      if (process.env.DEBUG === 'true') {
-        console.log(`[DEBUG] Mode: ${mode}`);
-        console.log(`[DEBUG] Args for ${cliName}: ${args.join(' ')}`);
-      }
-
-      // 🔥 新增：记录用户输入到上下文
-      this._addToCLIContext(cliName, 'user', task);
-
-      // 🔥 新增：构建包含上下文的增强任务
-      const contextualTask = this._buildContextualTask(cliName, task);
-
-      // 如果有上下文，使用增强的任务
-      const finalTask = contextualTask !== task ? contextualTask : task;
-
-      if (process.env.DEBUG === 'true' && contextualTask !== task) {
-        console.log('[DEBUG] Using contextual task with conversation history');
-      }
-
-      // 更新参数中的任务（使用最终的任务）
-      if (mode === 'interactive') {
-        // 交互模式：任务应该作为参数传递
-        // 对于 qwen/iflow，使用位置参数
-        // 对于其他 CLI，使用 -p 或 --prompt
-        args = adapterManager.getArguments(cliName, mode, finalTask);
-        // 重新添加 autoModeArgs
-        if (autoModeArgs.length > 0) {
-          args = [...autoModeArgs, ...args];
-        }
-      }
-
-      return new Promise((resolve, reject) => {
-        const startTime = Date.now();
-        let output = '';
-        let errorOutput = '';
-
-        // 启动CLI进程
-        const process = spawn(cliName, args, {
-          stdio: ['ignore', 'pipe', 'pipe'],
-          shell: true
-        });
-
-        // 收集stdout
-        process.stdout.on('data', (data) => {
-          output += data.toString();
-          process.stdout.write(data);
-        });
-
-        // 收集stderr
-        process.stderr.on('data', (data) => {
-          errorOutput += data.toString();
-          process.stderr.write(data);
-        });
-
-        // 处理进程退出
-        process.on('close', (code) => {
-          const executionTime = Date.now() - startTime;
-
-          console.log('');
-          console.log(`Execution completed in ${executionTime}ms`);
-          console.log(`Exit code: ${code}`);
-
-          // 🔥 新增：记录 CLI 响应到上下文
-          if (output && output.trim()) {
-            this._addToCLIContext(cliName, 'assistant', output.trim());
-          }
-
-          if (code === 0) {
-            resolve({
-              success: true,
-              cli: cliName,
-              task: task,
-              output: output,
-              executionTime: executionTime,
-              exitCode: code,
-              hasContext: (this.cliContexts[cliName]?.length || 0) > 1 // 标记是否有上下文
-            });
-          } else {
-            // 如果qwen失败，尝试iflow
-            if (cliName === 'qwen') {
-              console.log(`\n${cliName} failed, trying iflow...`);
-              this._executeWithCLI('iflow', task).then(resolve).catch(reject);
-            } else {
-              reject({
-                success: false,
-                cli: cliName,
-                task: task,
-                error: errorOutput || `Process exited with code ${code}`,
-                exitCode: code
-              });
-            }
-          }
-        });
-
-        // 处理错误
-        process.on('error', (error) => {
-          // 如果qwen失败，尝试iflow
-          if (cliName === 'qwen') {
-            console.log(`\n${cliName} error, trying iflow...`);
-            this._executeWithCLI('iflow', task).then(resolve).catch(reject);
-          } else {
-            reject({
-              success: false,
-              cli: cliName,
-              task: task,
-              error: error.message
-            });
-          }
-        });
-
-        // 不设置超时，允许长时间运行的任务
-        // const timeout = this.options.cliTimeout;
-        // if (timeout > 0) {
-        //   setTimeout(() => {
-        //     process.kill();
-        //     // 如果qwen超时，尝试iflow
-        //     if (cliName === 'qwen') {
-        //       console.log(`\n${cliName} timeout, trying iflow...`);
-        //       this._executeWithCLI('iflow', task).then(resolve).catch(reject);
-        //     } else {
-        //       reject({
-        //         success: false,
-        //         cli: cliName,
-        //         task: task,
-        //         error: `Timeout after ${timeout}ms`
-        //       });
-        //     }
-        //   }, timeout);
-        // }
-      });
-
-    } catch (error) {
-      // 如果qwen失败，尝试iflow
-      if (cliName === 'qwen') {
-        console.log(`\n${cliName} exception, trying iflow...`);
-        return await this._executeWithCLI('iflow', task);
-      } else {
-        throw error;
-      }
-    }
-  }
+  async _executeWithCLI(cliName, task) {
+    const startTime = Date.now();
+
+    try {
+      console.log(`\n[${cliName}] Executing task...`);
+      console.log(`Task: ${task}`);
+      console.log('');
+
+      // 🔥 记录用户输入到上下文
+      this._addToCLIContext(cliName, 'user', task);
+
+      // 🔥 构建包含上下文的增强任务
+      const contextualTask = this._buildContextualTask(cliName, task);
+      const finalTask = contextualTask !== task ? contextualTask : task;
+
+      if (process.env.DEBUG === 'true' && contextualTask !== task) {
+        console.log('[DEBUG] Using contextual task with conversation history');
+      }
+
+      // 🔥 关键改变：使用持久进程池
+      const result = await this.cliPool.executeTask(cliName, finalTask, {
+        timeout: this.options.cliTimeout || 30000,
+        verbose: process.env.DEBUG === 'true'
+      });
+
+      // 🔥 记录 CLI 响应到上下文
+      if (result.output && result.output.trim()) {
+        this._addToCLIContext(cliName, 'assistant', result.output.trim());
+      }
+
+      // 显示执行结果
+      console.log('');
+      console.log(`[${cliName}] Response received in ${result.executionTime}ms`);
+
+      // 显示上下文状态
+      const contextCount = this.cliContexts[cliName]?.length || 0;
+      if (contextCount > 2) {
+        console.log(`[${cliName}] Context: ${contextCount} messages maintained`);
+      }
+
+      return {
+        ...result,
+        task: task,
+        hasContext: contextCount > 1
+      };
+
+    } catch (error) {
+      console.error(`\n[${cliName}] Execution failed:`, error.message);
+
+      // 回退到 iflow
+      if (cliName === 'qwen') {
+        console.log(`[${cliName}] Trying fallback to iflow...`);
+
+        try {
+          const fallbackResult = await this.cliPool.executeTask('iflow', task, {
+            timeout: this.options.cliTimeout || 30000
+          });
+
+          this._addToCLIContext('iflow', 'user', task);
+          if (fallbackResult.output) {
+            this._addToCLIContext('iflow', 'assistant', fallbackResult.output.trim());
+          }
+
+          console.log(`\n[iflow] Fallback successful!`);
+
+          return {
+            ...fallbackResult,
+            task: task,
+            fallback: true,
+            originalCLI: cliName
+          };
+        } catch (fallbackError) {
+          console.error(`[iflow] Fallback also failed:`, fallbackError.message);
+        }
+      }
+
+      throw error;
+    }
+  }
PATCH_END

# 应用补丁（手动）
# 打开 src/interactive/InteractiveModeController.js
# 找到 _executeWithCLI 方法（第678-847行）
# 用上面的新代码替换
```

---

## 🧪 测试方法

### 1. 测试持久进程池

```bash
node demo-persistent-pool.js
```

### 2. 测试集成后的交互模式

```bash
# 启动 stigmergy 交互模式
stigmergy

# 测试持续交互
qwen> 你好
qwen> 我刚才说了什么？  # 应该记住之前的对话
qwen> 继续我们的对话   # 进程没有退出

# 测试 CLI 切换
qwen> use iflow
iflow> 帮我写一个Python函数
iflow> 优化这个函数  # iflow 进程应该保持运行

# 查看进程状态
qwen> pool-status  # 新命令：显示持久进程状态
```

---

## 📈 预期效果

### 修复前（伪持续交互）

```bash
qwen> 任务1
[启动进程1 → 执行 → 退出]  # 2-3秒
qwen> 任务2
[启动进程2 → 执行 → 退出]  # 2-3秒
qwen> 任务3
[启动进程3 → 执行 → 退出]  # 2-3秒
```

### 修复后（真正的持续交互）

```bash
qwen> 任务1
[立即响应，进程继续运行]  # < 1秒
qwen> 任务2
[立即响应，进程继续运行]  # < 1秒
qwen> 任务3
[立即响应，进程继续运行]  # < 1秒
```

**关键改进**：
- ✅ 响应速度快 2-3 倍
- ✅ 真正的会话状态（CLI 内存中）
- ✅ 进程永不退出
- ✅ 支持多轮对话

---

## ⚠️ 注意事项

1. **提示符检测**
   - 持久进程池依赖提示符检测来确定响应完成
   - 不同 CLI 的提示符可能不同
   - 可以在 `_getCLIConfig` 中自定义提示符模式

2. **超时处理**
   - 默认超时 30 秒
   - 可以在 `executeTask` 时自定义
   - 超时不会杀死进程，只是返回错误

3. **进程管理**
   - 5 分钟无活动后自动关闭进程
   - 进程崩溃后自动重启
   - 手动关闭：`await pool.shutdownAll()`

4. **上下文管理**
   - 持久进程池 + 上下文注入 = 双重上下文
   - 进程内部有自己的会话状态
   - Stigmergy 维护的上下文用于增强任务

---

## 📚 相关文档

- `CLI_INTERACTION_MODE_ANALYSIS.md` - 交互模式问题分析
- `HYBRID_CONTEXT_SOLUTION.md` - 完整的混合上下文方案
- `CONTEXT_MANAGEMENT_FIX_SUMMARY.md` - 上下文管理修复总结
- `demo-persistent-pool.js` - 持久进程池演示脚本

---

## 🎯 总结

### 已完成 ✅
1. 创建 `PersistentCLIPool` 类
2. 创建 `CLIProcess` 封装
3. 实现提示符检测机制
4. 实现进程健康检查
5. 添加导入和初始化代码
6. 更新 `stop` 方法

### 需要手动完成 ⚠️
1. 替换 `_executeWithCLI` 方法

### 下一步 🚀
1. 手动替换 `_executeWithCLI` 方法
2. 测试持久进程池
3. 测试 CLI 切换
4. 优化提示符检测
5. 添加进程状态显示命令
