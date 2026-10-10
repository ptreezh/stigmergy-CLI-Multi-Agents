# Heartbeat 实现状态核查报告

> 核查时间: 2026-10-08T20:08:29+08:00
> 核查人: Kilo (系统级代码扫描 + 调用链分析)
> 方法: grep/glob 全库扫描 → 调用链追踪 → 根因定位

---

## 一、已实现的心跳痕迹（代码级证据）

| 序号 | 文件 | 行号 | 实现内容 | 状态 |
|------|------|------|----------|------|
| 1 | `src/core/soul_memory_manager.js` | 89-116, 440-466 | `heartbeat()` + `startHeartbeat(intervalMs)` 调度器 | ✅ 代码已写 |
| 2 | `src/core/soul_manager.js` | 553-590 | `heartbeat()` 委托给 `memoryManager.heartbeat()` | ✅ 代码已写 |
| 3 | `skills/stigmergy-coordinator/runner.js` | 72-75, 272-307 | `heartbeat()` + `runDaemon()` 循环 | ✅ 代码已写 |
| 4 | `bus/coordinator.js` | 48-57, 206-215 | `heartbeat()` 函数（手动触发） | ✅ 代码已写 |
| 5 | `skills/soul-multi-cli-evolution-coordinator.js` | 227-230, 252-259 | `sendHeartbeat()` setInterval 30s | ✅ 代码已写 |
| 6 | `src/core/agent_coordinator.js` | 59-86, 112-203 | `startAutoCoordination()` 默认4h interval | ✅ 代码已写 |
| 7 | `docs/plans/2026-10-08-unified-heartbeat-design.md` | 全文 | 统一心跳设计文档（5系统合并方案） | ✅ 设计已写 |

---

## 二、调用链追踪：从入口到心跳

### 2.1 CLI 入口路径

```
src/index.js
  → src/cli/router-beta.js
    → src/cli/commands/soul.js (handleSoulCommand)
      → SoulCommand.init()
        → new SoulManager()
        → manager.initAutonomousSystem()   // ❌ 不调用 startHeartbeat
        → manager.initDecisionEngine()     // ❌ 不调用 heartbeat
```

### 2.2 Interactive Mode 路径

```
src/cli/commands/interactive.js
  → new InteractiveModeController()
    → controller.start()
      → this.statusBoard.initialize()
      → this._scanInstalledCLITools()
      → this._enterCommandLoop()
      // ❌ 没有任何心跳启动代码
```

### 2.3 Auto-Coordinator 路径

```
src/cli/commands/auto-coordinator.js
  → new AgentCoordinator()
    → coordinator.startAutoCoordination({ interval })
      // ✅ 这个会启动定时器，但需要手动执行命令
```

---

## 三、根因定位：为什么"实现了但没有心跳"

### 3.1 核心问题：5 个独立心跳系统，全部需要手动启动

| 系统 | 启动方式 | 实际是否自动运行 |
|------|----------|------------------|
| SoulMemoryManager.heartbeat | `startHeartbeat()` 方法 | ❌ **从未被调用** |
| SoulManager.heartbeat | 手动调用 `manager.heartbeat()` | ❌ 仅 DECI 内部引用 |
| runner.js daemon | `node runner.js daemon` | ❌ 需手动启动 |
| bus/coordinator.js | `node coordinator.js heartbeat` | ❌ 单次执行 |
| agent_coordinator | `stigmergy auto-coordinator start` | ❌ 需手动启动 |
| soul-multi-cli-evolution-coordinator | `.start()` 方法 | ❌ 需手动调用 |

### 3.2 根本原因

1. **`soul init` 不启动心跳**
   - `src/cli/commands/soul.js:79` 只调用 `initAutonomousSystem()`
   - `initAutonomousSystem()` 初始化知识库/技能进化器/对齐检查器，**但不启动心跳调度器**

2. **`startHeartbeat()` 定义后从未被调用**
   - `src/core/soul_memory_manager.js:440-466` 有完整实现
   - 全库搜索 `startHeartbeat` 只有定义处，**0 处调用**

3. **InteractiveModeController 不感知心跳**
   - 启动时只初始化状态看板、CLI池、协调器
   - **没有接入 SoulManager 心跳循环**

4. **统一设计文档未实施**
   - `docs/plans/2026-10-08-unified-heartbeat-design.md` 描述了完整方案
   - 但该文档只是"计划"，**没有对应代码实现**

---

## 四、收敛方案

### 4.1 目标

让心跳在以下场景**自动运行**：
- `stigmergy soul init` 后自动启动
- `stigmergy interactive` 模式启动后自动启动
- 后台 daemon 持续运行

### 4.2 实施步骤（最小改动，最大效果）

#### Step 1: 在 `soul init` 后自动启动心跳

修改 `src/cli/commands/soul.js`:
```javascript
// 在 manager.initAutonomousSystem() 之后
await manager.initAutonomousSystem();

// 🔥 新增：自动启动心跳（30分钟间隔）
if (manager.memoryManager) {
  manager.memoryManager.startHeartbeat(30 * 60 * 1000);
  console.log(`   Heartbeat: started (30min)`);
}
```

#### Step 2: 在 `initAutonomousSystem()` 中自动启动心跳

修改 `src/core/soul_manager.js:228-283`:
```javascript
async initAutonomousSystem() {
  // ... 现有代码 ...

  // 🔥 新增：自动启动心跳调度器
  if (this.memoryManager && this.memoryManager.startHeartbeat) {
    this.memoryManager.startHeartbeat(30 * 60 * 1000);
    console.log(`[SoulManager] Heartbeat scheduler started`);
  }

  return true;
}
```

#### Step 3: 在 InteractiveModeController 中启动心跳

修改 `src/interactive/InteractiveModeController.js:98-131`:
```javascript
async start() {
  // ... 现有代码 ...

  // 🔥 新增：启动 Soul 心跳
  try {
    const SoulManager = require("../../core/soul_manager");
    const soulManager = new SoulManager({
      cliName: "interactive",
      skillsPath: path.join(process.cwd(), ".stigmergy", "skills"),
      autoLearn: true,
    });

    const hasSoul = await soulManager.detectSoul();
    if (hasSoul) {
      await soulManager.initAutonomousSystem();
      console.log("[SOUL] Heartbeat system activated");
    }
  } catch (e) {
    console.log("[SOUL] Heartbeat skipped:", e.message);
  }

  // Enter command loop
  if (this.options.autoEnterLoop) {
    await this._enterCommandLoop();
  }
}
```

#### Step 4: 统一 runner.js daemon 心跳

修改 `skills/stigmergy-coordinator/runner.js:272-307`:
```javascript
async runDaemon() {
  console.log(`[STIGMERGY] Starting daemon mode (heartbeat: ${this.heartbeatInterval}s)`);

  this.register();

  // 🔥 重构：使用统一心跳循环
  const runHeartbeatCycle = async () => {
    if (!this.agentIsIdle()) {
      console.log(`[STIGMERGY] Agent busy, skipping this cycle`);
      return;
    }

    this.heartbeat();

    // 检查 handoffs
    const handoffs = this.scanHandoffs();
    const myHandoffs = handoffs.filter(h => this.matchesMySkills(h) && (h.to === this.agentName || h.to === "*"));
    if (myHandoffs.length > 0) {
      console.log(`[STIGMERGY] Accepting handoff: ${myHandoffs[0].title}`);
      this.acceptHandoff(myHandoffs[0].id);
      return;
    }

    // 检查 stuck tasks
    const stuckTasks = this.scanStuckTasks();
    const myStuck = stuckTasks.filter(t => this.matchesMySkills(t));
    if (myStuck.length > 0) {
      console.log(`[STIGMERGY] Taking over stuck task: ${myStuck[0].title}`);
      this.updateRegistry({ status: "busy", currentTask: myStuck[0].title });
      return;
    }

    // 全局状态感知
    const others = this.scanRegistry();
    console.log(`[STIGMERGY] Active agents: ${others.length}, Status: idle`);
  };

  // 立即执行一次
  await runHeartbeatCycle();

  // 定时循环
  this.daemonTimer = setInterval(runHeartbeatCycle, this.heartbeatInterval * 1000);
}
```

### 4.3 验证清单

- [ ] `stigmergy soul init claude` 后，`heartbeat-state.json` 出现且 `lastHeartbeat` 被更新
- [ ] `stigmergy interactive` 启动后，心跳自动运行
- [ ] `node skills/stigmergy-coordinator/runner.js daemon` 启动后，bus registry 持续更新
- [ ] `stigmergy status` 能看到 `Last heartbeat` 时间戳

---

## 五、反向核验

### 5.1 代码级核验

```bash
# 1. 搜索所有 startHeartbeat 调用点（应该 ≥ 1）
grep -r "startHeartbeat" src/ skills/ --include="*.js"

# 2. 搜索所有 heartbeat 调用点（应该 ≥ 3）
grep -r "\.heartbeat\(\)" src/ skills/ --include="*.js"

# 3. 验证 soul init 后心跳文件生成
find ~/.stigmergy -name "heartbeat-state.json" -mmin -5
```

### 5.2 运行级核验

```bash
# 1. 启动 soul 并观察心跳日志
npm start -- soul init test-soul
# 应该看到: [Heartbeat] 启动30分钟心跳调度器

# 2. 启动 interactive 模式
npm start -- interactive
# 应该看到: [SOUL] Heartbeat system activated

# 3. 启动 coordinator daemon
node skills/stigmergy-coordinator/runner.js daemon
# 应该看到: [STIGMERGY] Heartbeat opencode
```

### 5.3 状态级核验

```bash
# 检查心跳状态文件
cat ~/.stigmergy/skills/test-soul/heartbeat-state.json | jq '.lastHeartbeat'

# 检查 bus registry 更新时间
cat ~/.stigmergy/bus/registry/opencode.json | jq '.lastUpdate'
```

---

## 六、结论

| 问题 | 答案 |
|------|------|
| 心跳代码是否已实现？ | ✅ 是，6个独立系统全部有代码实现 |
| 心跳是否在运行？ | ❌ 否，所有系统都需要手动启动 |
| 为什么记得实现过？ | 因为 `soul_memory_manager.js`、`runner.js` 等文件确实有心跳代码 |
| 为什么现在没有心跳？ | 因为没有代码路径自动调用这些心跳函数 |
| 修复需要多少改动？ | 最小 3 处修改（soul.js、soul_manager.js、InteractiveModeController.js） |

**核心结论：心跳不是"没实现"，而是"实现了但没接线"。** 需要把已有的心跳函数接入到自动运行路径中。
