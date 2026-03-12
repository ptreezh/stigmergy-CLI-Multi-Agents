# Soul创建和自动进化时机指南

## 📋 目录
1. [Soul创建时机](#soul创建时机)
2. [自动进化启动时机](#自动进化启动时机)
3. [进化调度策略](#进化调度策略)
4. [实际使用示例](#实际使用示例)

---

## 🎯 Soul创建时机

### **方式1: 自动创建（推荐）** ✅

#### 触发条件
在CLI启动时（session-start），自动检测项目本地soul：

```javascript
// 时机: 每次启动CLI工具时
// 文件: config/superpowers/session-start.js

// 1. 检查项目本地目录
detectProjectSoul() {
  检查: .stigmergy/skills/soul.md
  检查: .agent/skills/soul.md
  检查: .claude/skills/soul.md

  如果找到 → 自动加载并初始化 ✅
  如果未找到 → 跳过（不创建）
}

// 2. 初始化Soul系统状态
initProjectSoulState(soulInfo) {
  创建: .stigmergy/soul-state/soul-system-state.json
  记录: 初始化时间、路径信息
}

// 3. 注入Soul身份到CLI上下文
ctx.additionalContext += soulContent;
ctx._soulSystem = { initialized: true, path: ..., ... };
```

#### 实际表现
```bash
# 场景: 项目已有soul.md
cd /home/user/my-project/
ls .stigmergy/skills/soul.md  # 存在

claude

# 输出:
🧠 Soul detected: /home/user/my-project/.stigmergy/skills/soul.md
🦸 Superpowers context injected | 🧠 Soul auto-initialized

# ✅ Soul自动加载并激活
```

---

### **方式2: 手动创建**

#### 命令创建
```bash
# 创建全局soul
stigmergy soul create academic my-soul
stigmergy soul create technical project-soul
stigmergy soul create general default-soul

# 创建位置
~/.stigmergy/skills/my-soul/soul.md
```

#### 手动创建
```bash
# 在项目目录创建
mkdir -p .stigmergy/skills
cat > .stigmergy/skills/soul.md <<EOF
# Soul.md - MyProject

## 身份 Identity
- **名称**: MyProject
- **角色**: 项目开发助手
- **类型**: 技术开发型

## 人格 Personality
- **核心特质**: 高效、创新、专业
- **沟通风格**: 简洁、直接

## 使命 Mission
- **终极目标**: 提升项目开发效率
- **核心职责**:
  1. 代码质量保证
  2. 架构优化建议
  3. 技术问题解决

## 专业知识域 Expertise
- **核心领域**: 软件开发
- **知识深度**: 专家级
EOF

# 下次启动CLI时自动加载 ✅
```

---

## 🚀 自动进化启动时机

### **关键代码流程**

```javascript
// 文件: src/core/soul_system.js
async function createSoulSystem(options) {
  const { autoLearn = true } = options;  // ⚠️ 默认开启

  // 1. 检测soul.md
  const hasSoul = await soulManager.detectSoul(skillsPath);
  if (!hasSoul) return null;  // 没有soul就不启动

  // 2. 加载soul配置
  await soulManager.loadSoul();

  // 3. 初始化组件
  await soulManager.initAutonomousSystem();

  // 4. 启动调度器 ⚠️ 关键步骤
  if (autoLearn) {
    soulManager.scheduler.start();  // 启动自动进化
  }

  return soulManager;
}
```

### **启动条件（必须全部满足）**

✅ **条件1**: 存在soul.md文件
```
.stigmergy/skills/soul.md  ← 必须存在
```

✅ **条件2**: Soul系统被初始化
```javascript
// 通过以下方式之一初始化：
// A. session-start hook自动初始化
// B. 手动运行: stigmergy soul init
// C. 编程方式: createSoulSystem()
```

✅ **条件3**: autoLearn参数为true（默认）
```javascript
// 默认: autoLearn = true
// 可以关闭: autoLearn = false
```

---

## ⏰ 进化调度策略

### **调度器配置**

```javascript
// 文件: src/core/soul_scheduler.js
const config = {
  // 夜间模式 (23:00 - 7:00)
  night: {
    start: 23,           // 晚上11点开始
    end: 7,              // 早上7点结束
    evolveIntervalMs: 30 * 60 * 1000,  // 每30分钟进化一次
    alignCheckIntervalMs: 15 * 60 * 1000,  // 每15分钟检查对齐
  },

  // 白天模式 (7:00 - 23:00)
  day: {
    start: 7,
    end: 23,
    evolveIntervalMs: 4 * 60 * 60 * 1000,  // 每4小时进化一次
    alignCheckIntervalMs: 60 * 60 * 1000,  // 每1小时检查对齐
  },
};
```

### **实际调度时间表**

| 时间段 | 模式 | 进化频率 | 对齐检查频率 | 说明 |
|--------|------|----------|--------------|------|
| 23:00-07:00 | 夜间 | 30分钟 | 15分钟 | 活跃期，频繁进化 |
| 07:00-23:00 | 白天 | 4小时 | 1小时 | 休息期，减少干扰 |

### **调度逻辑**

```javascript
// 1. 确定当前模式
if (hour >= 23 || hour < 7) {
  currentMode = "night";  // 夜间模式
} else {
  currentMode = "day";    // 白天模式
}

// 2. 根据模式设置定时器
const interval = currentMode === "night"
  ? 30 * 60 * 1000   // 夜间: 30分钟
  : 4 * 60 * 60 * 1000;  // 白天: 4小时

// 3. 安排下次进化
setTimeout(() => {
  triggerEvolve();  // 执行进化
  _scheduleEvolve(); // 重新调度
}, interval);
```

---

## 🔄 完整生命周期

### **首次使用流程**

```bash
# 步骤1: 创建soul.md
mkdir -p .stigmergy/skills
cat > .stigmergy/skills/soul.md <<EOF
# Soul.md
## 身份
- **名称**: MyProject
EOF

# 步骤2: 启动CLI
claude

# 自动执行:
# ✅ detectProjectSoul() - 检测到soul.md
# ✅ initProjectSoulState() - 初始化状态
# ✅ 注入soul身份到context
# ✅ createSoulSystem() - 创建Soul系统
# ✅ scheduler.start() - 启动调度器
# ✅ _scheduleEvolve() - 安排进化任务

# 输出:
🧠 Soul detected: /path/to/.stigmergy/skills/soul.md
🦸 Superpowers context injected | 🧠 Soul auto-initialized
[SoulScheduler] 🚀 Started in day mode
[SoulScheduler]   Next evolve: 14:30:00
[SoulScheduler]   Next align check: 13:00:00
```

### **后续使用流程**

```bash
# 每次启动CLI时
claude

# 自动执行:
# ✅ detectProjectSoul() - 检测soul.md
# ✅ 加载现有状态
# ✅ createSoulSystem({ autoLearn: true })
# ✅ scheduler.start() - 重新启动调度器

# 注意: 调度器在CLI会话期间持续运行
```

---

## 📊 实际运行示例

### **示例1: 工作日使用**

```bash
# 早上9点启动CLI
$ claude

🧠 Soul detected: /home/user/project/.stigmergy/skills/soul.md
[SoulScheduler] 🚀 Started in day mode
[SoulScheduler]   Next evolve: 13:00:00  ← 4小时后
[SoulScheduler]   Next align check: 10:00:00  ← 1小时后

# 自动执行:
# ✅ 10:00 - 对齐检查
# ✅ 13:00 - 进化
# ✅ 14:00 - 对齐检查
# ✅ 17:00 - 进化
```

### **示例2: 深夜工作**

```bash
# 晚上11点启动CLI
$ claude

🧠 Soul detected: /home/user/project/.stigmergy/skills/soul.md
[SoulScheduler] 🚀 Started in night mode
[SoulScheduler]   Next evolve: 23:30:00  ← 30分钟后
[SoulScheduler]   Next align check: 23:15:00  ← 15分钟后

# 自动执行:
# ✅ 23:15 - 对齐检查
# ✅ 23:30 - 进化
# ✅ 23:45 - 对齐检查
# ✅ 00:00 - 进化
# ✅ 00:15 - 对齐检查
# ... 持续进化
```

### **示例3: 手动触发进化**

```bash
# 任何时候都可以手动触发
$ stigmergy soul evolve

[SoulScheduler] 🔥 Manually triggered evolution
[SoulSkillEvolver] Starting evolution for: general
[SoulSkillEvolver] Evolution complete: 5 knowledge, 2 skills created

# 或者通过CLI命令
$ stigmergy soul reflect

[SoulScheduler] 🔍 Running alignment check
✅ Aligned: Yes (score: 92%)
```

---

## 🔧 高级配置

### **调整进化频率**

```javascript
// 方式1: 创建时指定
const soulSystem = await createSoulSystem({
  cliName: "claude",
  skillsPath: "/path/to/skills",
  autoLearn: true,
  learningIntervalHours: 12,  // 改为12小时
});

// 方式2: 修改调度器配置
soulManager.scheduler.config.day.evolveIntervalMs = 2 * 60 * 60 * 1000;  // 2小时
soulManager.scheduler.config.night.evolveIntervalMs = 1 * 60 * 60 * 1000;  // 1小时
```

### **关闭自动进化**

```javascript
// 方式1: 创建时关闭
const soulSystem = await createSoulSystem({
  autoLearn: false,  // 关闭自动进化
});

// 方式2: 运行时停止
soulManager.scheduler.stop();

// 方式3: 只在需要时手动触发
stigmergy soul evolve  ← 按需进化
```

---

## 📝 检查Soul状态

```bash
# 查看soul状态
$ stigmergy soul status

📊 Soul System Status

📁 Default config location:
   /home/user/.stigmergy/config/soul_default.json
   /home/user/.stigmergy/config/soul-{cli}.json

📚 Registered Souls:
   ✅ my-project (项目本地)
   ✅ default (全局)

# 查看调度器状态
$ stigmergy soul status --scheduler

📊 Scheduler Status:
   Mode: day
   Running: true
   Next evolve: 14:30:00
   Next align check: 13:00:00
```

---

## ⚠️ 重要说明

### **1. 调度器生命周期**
- 调度器只在CLI会话期间运行
- 关闭CLI后，调度器停止
- 下次启动CLI时，重新启动调度器

### **2. 进化数据持久化**
```javascript
// 进化数据保存在:
.stigmergy/soul-state/
├── evolution-state.json    ← 进化历史
├── soul-system-state.json  ← 系统状态
└── knowledge-base/         ← 知识库
```

### **3. 权限要求**
- 项目本地soul: 无特殊权限 ✅
- 全局soul: 需要用户目录写权限
- 自动创建: 总是在项目本地 ✅

---

## 🎯 最佳实践

### **推荐配置**

1. **每个项目独立soul**
```bash
my-project/.stigmergy/skills/soul.md  ← 项目特定配置
```

2. **使用自动初始化**
```bash
# 创建soul.md后，CLI自动识别和加载
# 无需手动配置
```

3. **夜间活跃进化**
```bash
# 默认配置已经很合理
# 夜间频繁进化（30分钟）
# 白天减少干扰（4小时）
```

4. **按需手动进化**
```bash
# 需要时手动触发
stigmergy soul evolve web-development
```

---

## 总结

| 操作 | 时机 | 自动化 | 说明 |
|------|------|--------|------|
| Soul创建 | 项目首次使用 | ✅ 自动检测 | 创建soul.md即自动加载 |
| Soul初始化 | CLI启动 | ✅ 自动 | session-start hook |
| 进化启动 | CLI启动 | ✅ 自动 | autoLearn=true |
| 进化执行 | 定时调度 | ✅ 自动 | 夜间30分钟，白天4小时 |
| 手动进化 | 任何时候 | ⚠️ 手动 | stigmergy soul evolve |

**关键点**: 创建 `soul.md` 后，一切自动发生！✅
