# Stigmergy 使用方式与最小代价自动化构建方案

> 文档生成时间: 2026-10-08T21:52:00+08:00
> 核查人: Kilo
> 方法: 代码级调用链梳理 + 现有安装流程审计 + 自动化方案设计

---

## 一、当前使用方式（基于代码证据）

### 1.1 官方宣称的"一线安装"

```bash
npm install -g stigmergy@beta && stigmergy setup
```

### 1.2 实际调用链拆解

```
用户执行: npm install -g stigmergy@beta
  └─ package.json postinstall 钩子
     └─ scripts/postinstall-deploy.js
        ├─ 步骤0: 按顺序安装 CLI 工具（bun -> opencode -> oh-my-opencode -> 其他）
        ├─ 步骤1: 强制升级所有 autoInstall CLI 到最新
        ├─ 步骤2: 检测本地可用 CLI
        ├─ 步骤2.5: 部署内置 Superpowers（P0 核心 Hook + P1 技能 + P2 验证）
        ├─ 步骤3: 克隆 obra/superpowers 仓库并部署到所有 CLI
        ├─ 步骤4: 部署内置技能（resumesession, planning-with-files, skill-from-masters）
        └─ 步骤5: 部署 Soul 自我进化系统

用户执行: stigmergy setup
  └─ src/cli/commands/project.js: handleSetupCommand()
     ├─ STEP 0: setupCLIPaths() - 检测 CLI 路径
     ├─ STEP 1: 安装缺失的 CLI 工具
     ├─ STEP 2: deployHooks() - 部署 hooks 到可用 CLI
     ├─ STEP 3: deployBuiltinSuperpowers() - 部署内置 Superpowers
     └─ STEP 4: 验证安装

用户执行: stigmergy init
  └─ src/cli/commands/project.js: handleInitCommand()
     ├─ ensureSkillsCache() - 初始化技能缓存
     ├─ setupCLIPaths() - 检测 CLI 路径
     └─ 创建 .stigmergy/config.json

用户执行: stigmergy soul init <cli>
  └─ src/cli/commands/soul.js: SoulCommand.init()
     ├─ new SoulManager()
     ├─ manager.detectSoul()
     ├─ manager.initAutonomousSystem()
     │  ├─ 初始化 SoulMemoryManager
     │  ├─ 初始化 SoulKnowledgeBase
     │  ├─ 初始化 SoulSkillEvolver
     │  ├─ 初始化 SoulAlignmentChecker
     │  ├─ 初始化 SkillOntologySearch
     │  ├─ 初始化 SkillOrchestrator
     │  └─ 初始化 DECI Decision Engine
     └─ 【缺失】应调用 manager.memoryManager.startHeartbeat()
```

### 1.3 当前痛点的代码级证据

| 痛点 | 代码证据 |
|------|----------|
| **setup 有 24h 冷却** | `project.js:630-641` - 检查 last-setup-timestamp，24h 内跳过 |
| **postinstall 可能静默失败** | `postinstall-deploy.js:126` - 没有 try/catch 包裹整个流程 |
| **soul init 不启动心跳** | `soul.js:79` - 只调用 `initAutonomousSystem()`，不调用 `startHeartbeat()` |
| **interactive 模式不感知 Soul** | `InteractiveModeController.js:98-131` - 没有接入 SoulManager |
| **用户需手动执行 3+ 命令** | `setup` + `init` + `soul init` + `interactive` |

---

## 二、最小代价自动化构建方案

### 2.1 目标

让用户从**"零环境"到"可用状态"**的代价最小化：
- 理想状态：`npm install -g stigmergy@beta` **一步到位**
- 可接受状态：`npm install -g stigmergy@beta && stigmergy setup` **两步到位**
- 当前状态：需要 **3-5 步** + 手动处理错误

### 2.2 核心设计原则

1. **Zero-config by default** - 默认零配置，自动检测环境
2. **Fail-fast with recovery** - 快速失败但提供恢复指引
3. **Idempotent operations** - 所有操作可重复执行，不产生副作用
4. **Progressive disclosure** - 基础功能开箱即用，高级功能按需启用

### 2.3 实施方案

#### 方案 A：npm postinstall 增强（推荐）

**现状问题**：
- `postinstall-deploy.js` 没有顶层错误处理
- 步骤之间没有原子性保证
- 失败后用户不知道发生了什么

**改进方案**：

```javascript
// scripts/postinstall-deploy.js 增强版

async function postInstallDeploy() {
  const results = {
    step0: { name: 'CLI installation', status: 'pending' },
    step1: { name: 'CLI upgrade', status: 'pending' },
    step2: { name: 'CLI detection', status: 'pending' },
    step2_5: { name: 'Builtin Superpowers', status: 'pending' },
    step3: { name: 'Superpowers deployment', status: 'pending' },
    step4: { name: 'Builtin skills', status: 'pending' },
    step5: { name: 'Soul system', status: 'pending' },
  };

  try {
    // 每步独立 try/catch，保证其他步骤继续执行
    for (const [key, step] of Object.entries(results)) {
      try {
        await executeStep(key, results);
        results[key].status = 'success';
      } catch (error) {
        results[key].status = 'failed';
        results[key].error = error.message;
        console.log(`  ⚠️  ${step.name} failed: ${error.message}`);
      }
    }
  } finally {
    printSummary(results);
  }
}

function printSummary(results) {
  const failed = Object.entries(results).filter(([_, r]) => r.status === 'failed');
  const success = Object.entries(results).filter(([_, r]) => r.status === 'success');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Success: ${success.length}/${Object.keys(results).length} steps`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length} steps:`);
    for (const [key, r] of failed) {
      console.log(`  - ${r.name}: ${r.error}`);
    }
    console.log('\n💡 Run `stigmergy setup --force` to retry failed steps');
  }
}
```

#### 方案 B：setup 命令幂等化增强

**现状问题**：
- 24h 冷却时间导致重复 setup 被跳过
- 用户修改配置后无法重新运行

**改进方案**：

```javascript
// src/cli/commands/project.js

async function handleSetupCommand(options = {}) {
  // 移除 24h 冷却限制，改为智能增量检测
  if (!options.force) {
    const needsSetup = await checkNeedsSetup();
    if (!needsSetup.hasChanges) {
      console.log(chalk.green('[SETUP] ✓ System is already up to date'));
      console.log(chalk.gray('  Use --force to re-run setup'));
      return;
    }
    console.log(chalk.blue(`[SETUP] Detected ${needsSetup.changes.length} updates needed`));
  }

  // 执行增量 setup
  const changes = await executeIncrementalSetup(options);
  printChanges(changes);
}

async function checkNeedsSetup() {
  const changes = [];
  
  // 检查每个组件的状态
  const checks = [
    { name: 'CLI paths', check: checkCLIPaths },
    { name: 'Hooks deployment', check: checkHooksDeployed },
    { name: 'Superpowers skills', check: checkSuperpowersDeployed },
    { name: 'Soul system', check: checkSoulSystem },
    { name: 'Builtin skills', check: checkBuiltinSkills },
  ];

  for (const { name, check } of checks) {
    const result = await check();
    if (!result.valid) {
      changes.push({ component: name, issue: result.issue });
    }
  }

  return { hasChanges: changes.length > 0, changes };
}
```

#### 方案 C：一键启动器（最低用户代价）

**目标**：用户只需执行一条命令，自动完成所有初始化并进入交互模式

```bash
# 安装后自动提示
npm install -g stigmergy@beta
# 输出：
# 🎉 Stigmergy installed!
# 💡 Run `stigmergy` to start (auto-setup on first launch)

# 用户执行
stigmergy
# 自动执行：
# 1. 检测环境（已安装的 CLI、PATH 配置）
# 2. 执行增量 setup（仅部署缺失组件）
# 3. 自动进入 interactive 模式
```

**实现方案**：

```javascript
// src/cli/router-beta.js - 默认命令改为智能启动

program
  .action(async () => {
    // 无参数时，执行智能启动
    await handleSmartLaunch();
  });

async function handleSmartLaunch() {
  console.log(chalk.cyan('🚀 Stigmergy Smart Launch\n'));

  // 1. 检查是否已初始化
  const needsInit = !await checkProjectInitialized();
  if (needsInit) {
    console.log(chalk.blue('[LAUNCH] First run - auto-initializing...'));
    await handleInitCommand();
  }

  // 2. 检查是否需要 setup
  const setupStatus = await checkSetupStatus();
  if (setupStatus.needsSetup) {
    console.log(chalk.blue('[LAUNCH] Running setup...'));
    await handleSetupCommand({ silent: true });
  }

  // 3. 检查 Soul 系统
  const soulStatus = await checkSoulStatus();
  if (soulStatus.needsInit) {
    console.log(chalk.blue('[LAUNCH] Activating Soul system...'));
    await handleSoulCommand('init', [soulStatus.defaultCLI]);
  }

  // 4. 自动进入 interactive 模式
  console.log(chalk.green('[LAUNCH] ✅ Ready! Starting interactive mode...\n'));
  await handleInteractiveCommand();
}
```

### 2.4 具体自动化措施

| 措施 | 当前代价 | 自动化后代价 | 实现位置 |
|------|----------|--------------|----------|
| **自动检测环境** | 用户需手动确认 CLI 安装 | 0 交互，自动扫描 | `setupCLIPaths()` |
| **自动安装缺失 CLI** | 用户需手动 `stigmergy install` | 自动安装，仅需确认 | `handleSetupCommand()` |
| **自动部署 hooks** | 用户需手动 `stigmergy deploy` | setup 时自动完成 | `deployHooks()` |
| **自动初始化 Soul** | 用户需手动 `stigmergy soul init` | 智能启动时自动完成 | `handleSmartLaunch()` |
| **自动启动心跳** | 需手动调用 `startHeartbeat()` | init 后自动启动 | `soul_manager.js` 已修复 |
| **自动进入交互模式** | 用户需手动 `stigmergy interactive` | 无参数时自动进入 | `router-beta.js` 默认 action |
| **跳过 24h 冷却** | 重复 setup 被跳过 | 智能检测变更，按需执行 | `handleSetupCommand()` |

---

## 三、用户最小代价路径

### 3.1 理想路径（2 步）

```bash
# 步骤 1: 全局安装（一次性）
npm install -g stigmergy@beta

# 步骤 2: 启动（自动完成所有初始化）
stigmergy
# 自动执行：
# - 检测已安装的 AI CLI 工具
# - 部署 hooks 和 skills
# - 初始化 Soul 系统
# - 进入交互模式
```

### 3.2 当前路径（5+ 步）

```bash
# 步骤 1: 全局安装
npm install -g stigmergy@beta

# 步骤 2: 完整 setup
stigmergy setup

# 步骤 3: 项目初始化
stigmergy init

# 步骤 4: 初始化 Soul
stigmergy soul init <cli-name>

# 步骤 5: 进入交互模式
stigmergy interactive
```

### 3.3 降低代价的关键改进

1. **合并 setup + init + soul init 为单一智能启动**
   - 用户只需执行 `stigmergy`
   - 系统自动检测当前状态并执行必要步骤

2. **postinstall 增强错误处理**
   - 每步独立 try/catch
   - 失败后提供清晰的恢复指引
   - 用户可随时重新运行 `stigmergy setup --force`

3. **移除 24h 冷却限制**
   - 改为智能增量检测
   - 仅重新执行有变更的步骤

4. **自动启动心跳**
   - `soul init` 后自动启动 30min 心跳
   - `interactive` 模式自动激活 Soul

---

## 四、实施优先级

| 优先级 | 措施 | 影响 | 实现难度 | 代码位置 |
|--------|------|------|----------|----------|
| P0 | 自动启动心跳 | 高 | 低 | ✅ 已实现 |
| P0 | postinstall 错误处理增强 | 高 | 低 | `postinstall-deploy.js` |
| P1 | setup 幂等化 + 移除冷却 | 中 | 中 | `project.js` |
| P1 | 智能启动器（无参数默认启动） | 高 | 中 | `router-beta.js` |
| P2 | 自动初始化 Soul | 中 | 低 | `InteractiveModeController.js` ✅ 已实现 |

---

## 五、验证清单

- [ ] `npm install -g stigmergy@beta` 后，postinstall 每步都有清晰的 success/failed 状态
- [ ] `stigmergy setup --force` 可随时重新执行，不依赖 24h 冷却
- [ ] `stigmergy`（无参数）自动完成 init + setup + soul init + interactive
- [ ] `stigmergy soul init` 后心跳自动启动
- [ ] `stigmergy interactive` 自动激活 Soul 心跳
- [ ] 所有 setup 步骤可重复执行，不产生副作用

---

## 六、结论

**当前状态**：Stigmergy 已经有完整的自动化安装体系（postinstall + setup + init），但存在以下问题：
1. postinstall 错误处理不完善
2. setup 有 24h 冷却限制
3. 用户需要手动执行多个命令
4. Soul 系统需要手动初始化

**最小代价方案**：
1. ✅ 已实现：自动启动心跳（soul_manager.js + InteractiveModeController.js）
2. 待实现：postinstall 增强错误处理
3. 待实现：setup 幂等化 + 移除冷却
4. 待实现：智能启动器（`stigmergy` 无参数自动进入交互模式）

**预期效果**：
- 从 **5+ 步** 降到 **2 步**
- 用户只需 `npm install -g stigmergy@beta && stigmergy`
- 系统自动完成所有初始化并进入可用状态
