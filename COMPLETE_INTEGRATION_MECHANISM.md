# 🔍 Stigmergy CLI - 完整集成机制说明

**文档时间**: 2026-01-27
**版本**: v1.3.77-beta.0

---

## 第一部分：iflow Agents & Skills 集成机制

### 📋 完整流程图

```
┌─────────────────────────────────────────────────────────────┐
│  阶段1: 开发者本地配置（开发机器）                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ~/.iflow/                                                  │
│  ├── agents/                                               │
│  │   ├── agent-creator.md          (19KB)                  │
│  │   ├── ant-expert.md             (12KB)                  │
│  │   ├── grounded-theory-expert.md (14KB)                 │
│  │   └── ... (共24个agent文件)                             │
│  └── skills/                                               │
│      ├── ant/skill.md                                      │
│      ├── planning-with-files/skill.md                      │
│      ├── using-superpowers/skill.md                        │
│      └── ... (共25个skill目录)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  阶段2: 打包成 bundle（开发机器运行脚本）                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  $ node scripts/bundle-iflow-resources.js                  │
│                                                             │
│  脚本执行：                                                  │
│  1. 读取 ~/.iflow/agents/*.md (24个文件)                   │
│  2. 读取 ~/.iflow/skills/*/skill.md (25个文件)              │
│  3. 创建 config/bundle/iflow-bundle/config-bundle.json      │
│     (包含所有文件的完整内容，共489KB)                        │
│                                                             │
│  生成的文件：                                                │
│  config/bundle/iflow-bundle/                               │
│  ├── config-bundle.json          (489KB) ← 关键！          │
│  └── deployment-manifest.json                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  阶段3: npm 包发布                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  package.json 配置：                                        │
│  {                                                          │
│    "files": [                                              │
│      "config/**"  ← 包含 bundle 目录                       │
│    ]                                                       │
│  }                                                          │
│                                                             │
│  $ npm publish                                              │
│  → config/bundle/iflow-bundle/config-bundle.json           │
│     随npm包一起发布                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  阶段4: 用户安装 & 自动部署（用户机器）                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户执行：                                                  │
│  $ npm install -g stigmergy@beta                           │
│                                                             │
│  npm 自动触发：                                            │
│  → postinstall 脚本                                        │
│  → scripts/postinstall-deploy.js                           │
│  → ConfigDeployer.run()                                    │
│                                                             │
│  部署过程：                                                  │
│  1. 读取 config-bundle.json (489KB)                        │
│  2. 提取 24个 agents 的内容                                │
│  3. 提取 25个 skills 的内容                                │
│  4. 写入到各个CLI的全局目录：                               │
│                                                             │
│  ~/.qwen/agents/agent-creator.md     (从bundle写入)         │
│  ~/.qwen/agents/ant-expert.md        (从bundle写入)         │
│  ~/.qwen/skills/ant/skill.md         (从bundle写入)         │
│  ~/.qwen/skills/planning-with-files/skill.md               │
│  ~/.qwen/skills/using-superpowers/skill.md                 │
│  ...                                                        │
│                                                             │
│  同样的内容复制到：                                         │
│  ~/.codebuddy/ (49个文件)                                  │
│  ~/.claude/ (49个文件)                                     │
│  ~/.qodercli/ (49个文件)                                   │
│  ~/.gemini/ (49个文件)                                     │
│  ~/.copilot/ (49个文件)                                    │
│  ~/.codex/ (49个文件)                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔍 详细机制说明

#### 1️⃣ **Bundle 生成脚本**

**文件**: `scripts/bundle-iflow-resources.js`

```javascript
async function bundleIflowResources() {
  // 1. 定位 iflow 配置目录
  const iflowConfigPath = path.join(os.homedir(), '.iflow');

  // 2. 读取所有 agents (24个文件)
  const agentsDir = path.join(iflowConfigPath, 'agents');
  const agentFiles = await fs.readdir(agentsDir);

  for (const file of agentFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    agents.push({
      path: `agents/${file}`,
      content: content  // ← 完整内容，不是路径引用
    });
  }

  // 3. 读取所有 skills (25个目录)
  const skillsDir = path.join(iflowConfigPath, 'skills');
  const skillDirs = await fs.readdir(skillsDir);

  for (const skillDir of skillDirs) {
    const skillFile = path.join(skillPath, 'skill.md');
    const content = await fs.readFile(skillFile, 'utf8');
    skills.push({
      path: `skills/${skillDir}/skill.md`,
      content: content  // ← 完整内容
    });
  }

  // 4. 生成 config-bundle.json
  const configBundle = {
    sourceCLI: 'iflow',
    targetCLIs: ['qwen', 'codebuddy', 'claude', 'qodercli', 'gemini', 'copilot', 'codex'],
    summary: {
      totalItems: 49,
      agentsCount: 24,
      skillsCount: 25
    },
    configs: {
      iflow: {
        agents: { items: agents },   // ← 包含完整内容
        skills: { items: skills }    // ← 包含完整内容
      }
    }
  };

  // 5. 写入 bundle 文件
  await fs.writeFile(
    'config/bundle/iflow-bundle/config-bundle.json',
    JSON.stringify(configBundle, null, 2)
  );
}
```

#### 2️⃣ **Bundle 内容结构**

**文件**: `config/bundle/iflow-bundle/config-bundle.json` (489KB)

```json
{
  "sourceCLI": "iflow",
  "targetCLIs": ["qwen", "codebuddy", "claude", "qodercli", "gemini", "copilot", "codex"],
  "generatedAt": "2026-01-25T07:10:29.577Z",
  "platform": "win32",
  "summary": {
    "totalItems": 49,
    "agentsCount": 24,
    "skillsCount": 25
  },
  "configs": {
    "iflow": {
      "agents": {
        "items": [
          {
            "path": "agents/agent-creator.md",
            "content": "---\nname: agent-creator\ndescription: ... [16KB完整内容]"
          },
          // ... 24个agent文件
        ]
      },
      "skills": {
        "items": [
          {
            "path": "skills/ant/skill.md",
            "content": "---\nname: ant\n... [完整skill内容]"
          },
          // ... 25个skill文件
        ]
      }
    }
  }
}
```

**关键特点**：
- ✅ **完整内容打包** - 不是路径引用，而是文件的实际内容
- ✅ **自包含** - 用户无需安装iflow即可获得这些资源
- ✅ **跨平台** - 在目标机器上动态创建目录结构

#### 3️⃣ **自动部署机制**

**触发时机**: `npm install` 时

**执行流程**:

```javascript
// scripts/postinstall-deploy.js

async function postInstallDeploy() {
  // 1. 运行 auto-install（安装CLI工具）
  await runCommand('node', ['src/index.js', 'auto-install']);

  // 2. 部署 iflow 资源
  const bundleDir = path.join(__dirname, '..', 'config', 'bundle', 'iflow-bundle');

  // 3. 创建 ConfigDeployer
  const ConfigDeployer = require('../src/core/config/ConfigDeployer');
  const deployer = new ConfigDeployer({
    packageDir: bundleDir,
    force: true,
    verbose: false
  });

  // 4. 执行部署
  await deployer.run();
}
```

**ConfigDeployer.run() 工作流程**:

```javascript
// src/core/config/ConfigDeployer.js

async run() {
  // 1. 加载 bundle
  const configBundle = await loadConfigBundle();
  // → 读取 config-bundle.json (489KB)

  // 2. 获取源配置
  const sourceCLI = 'iflow';
  const sourceConfig = configBundle.configs.iflow;

  // 3. 遍历目标CLI
  for (const targetCLI of ['qwen', 'codebuddy', 'claude', ...]) {
    // 4. 部署 agents (24个文件)
    await deployConfigItem(targetCLI, 'agents', sourceConfig.agents.items);

    // 5. 部署 skills (25个文件)
    await deployConfigItem(targetCLI, 'skills', sourceConfig.skills.items);
  }
}

async deployConfigItem(cliName, configType, items) {
  const targetBasePath = path.join(os.homedir(), `.${cliName}`);
  const targetPath = path.join(targetBasePath, configType);

  // 遍历每个文件
  for (const item of items) {
    const itemTargetPath = path.join(targetPath, item.path);

    // 写入文件（从bundle中的content字段）
    await fs.writeFile(itemTargetPath, item.content, 'utf8');
  }
}
```

#### 4️⃣ **实际部署结果**

用户安装后，各CLI目录下将创建：

```
~/.qwen/
├── agents/
│   ├── agent-creator.md          (从bundle写入)
│   ├── ant-expert.md             (从bundle写入)
│   ├── grounded-theory-expert.md (从bundle写入)
│   └── ... (24个文件)
└── skills/
    ├── ant/
    │   └── skill.md               (从bundle写入)
    ├── planning-with-files/
    │   └── skill.md
    ├── using-superpowers/
    │   └── skill.md
    └── ... (25个目录)

~/.codebuddy/
├── agents/ (同样的24个文件)
└── skills/ (同样的25个目录)

~/.claude/
├── agents/ (同样的24个文件)
└── skills/ (同样的25个目录)

... (7个CLI，总共 49×7=343个文件)
```

---

## 第二部分：Superpowers 完整集成机制

### 📊 Superpowers 两部分组成

Superpowers 由两部分组成：

| 部分 | 类型 | 功能 | 存储位置 |
|------|------|------|----------|
| **Skills** | 技能文件 | Markdown格式的技能定义 | `~/.cli/skills/*/skill.md` |
| **Plugins** | 插件系统 | Hooks + Context Injection | `~/.cli/config/` + `~/.cli/extensions/` |

### 🎯 Superpowers 集成架构

```
┌─────────────────────────────────────────────────────────────┐
│  Superpowers 组成部分                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Skills 部分（技能文件）                                  │
│     └── skills/using-superpowers/skill.md                   │
│                                                             │
│  2. Plugins 部分（插件系统）                                 │
│     ├── HookManager.js        (Hook配置和管理)               │
│     ├── ContextInjector.js    (上下文注入)                   │
│     └── PluginDeployer.js     (统一部署)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔧 Plugin 系统详解

#### 1️⃣ **Hooks（钩子）**

**目的**: 在CLI的特定生命周期事件触发自定义行为

**支持的钩子类型**:
- `SessionStart` - 会话开始时触发
- `PreToolUse` - 工具使用前触发
- `Stop` - 任务结束时触发

**Hook 配置文件**: `~/.qwen/config/hooks.json`

```json
{
  "sessionStart": {
    "enabled": true,
    "priority": 1,
    "trigger_keywords": ["task", "project", "code"],
    "max_context_length": 2000,
    "injection_format": "markdown"
  }
}
```

**Hook 实现文件**: `~/.qwen/extensions/hooks/session-start.js`

```javascript
// SessionStart 钩子实现
module.exports = async function(context) {
  // 在会话开始时执行
  console.log('[Stigmergy] Loading skills context...');

  // 注入技能列表到上下文
  const skills = await loadSkills();
  return {
    skills: skills,
    injected: true
  };
};
```

#### 2️⃣ **Context Injection（上下文注入）**

**目的**: 自动将Stigmergy技能信息注入到CLI上下文中

**注入配置文件**: `~/.qwen/config/context-injection.json`

```json
{
  "enabled": true,
  "priority": 1,
  "title": "Stigmergy Skills",
  "max_items": 50,
  "format": "markdown"
}
```

**注入的上下文内容**:
```markdown
## Stigmergy Skills

Available skills:
- planning-with-files: Manus-style file-based planning
- using-superpowers: Superpowers plugin guide
- resumesession: Session recovery and history
...

[技能详情...]
```

---

### 📦 Superpowers 部署机制

#### 部署脚本

**文件**: `scripts/deploy-complete-superpowers.js`

```javascript
class CompleteSuperpowersDeployer {
  async deploy() {
    const deployer = new PluginDeployer({
      verbose: true,
      dryRun: false
    });

    // 1. 定义要部署的技能
    const skills = await this._getSkillsToDeploy();
    // → 从 skills/ 目录读取所有技能

    // 2. 定义要配置的 hooks
    const hooks = {
      'sessionStart': {
        enabled: true,
        priority: 1,
        trigger_keywords: ['task', 'project', 'code'],
        max_context_length: 2000,
        injection_format: 'markdown'
      }
    };

    // 3. 批量部署到目标CLI
    const results = await deployer.deployToMultiple(
      ['iflow', 'qwen', 'codebuddy'],
      {
        skills,
        hooks,
        contextInjection: true
      }
    );

    return results;
  }
}
```

#### PluginDeployer 工作流程

**文件**: `src/core/plugins/PluginDeployer.js`

```javascript
class PluginDeployer {
  async deploySuperpowers(cliName, options) {
    // 1. 部署 Hooks
    await this.deployHooks(cliName, hooksConfig);
    // → 创建 ~/.qwen/config/hooks.json
    // → 创建 ~/.qwen/extensions/hooks/session-start.js

    // 2. 注入上下文配置
    await this.injectContext(cliName, skills);
    // → 创建 ~/.qwen/config/context-injection.json

    // 3. 部署技能文件
    await this.deploySkillFiles(cliName, skills);
    // → 复制 skills/using-superpowers/skill.md
    //   到 ~/.qwen/skills/using-superpowers/skill.md
  }
}
```

---

### 📋 Superpowers 完整部署内容

#### 部署到每个CLI的内容

**以 qwen 为例**:

```
~/.qwen/
├── config/
│   ├── hooks.json                    ← Hook配置
│   └── context-injection.json        ← 上下文注入配置
│
├── extensions/
│   └── hooks/
│       └── session-start.js          ← Hook实现
│
└── skills/
    ├── using-superpowers/
    │   └── skill.md                   ← 技能文件
    ├── planning-with-files/
    │   └── skill.md
    └── resumesession/
        └── skill.md
```

**同样的结构部署到**:
- ~/.iflow/
- ~/.qwen/
- ~/.codebuddy/

---

### 🔄 自动部署流程

#### 1️⃣ **npm postinstall 触发**

```javascript
// scripts/postinstall-deploy.js

async function postInstallDeploy() {
  // 1. 部署 iflow 资源
  const deployer = new ConfigDeployer({
    packageDir: 'config/bundle/iflow-bundle'
  });
  await deployer.run();

  // 2. 部署 superpowers（如果配置了）
  // 注意：这部分通常需要手动触发或额外配置
}
```

#### 2️⃣ **手动部署（可选）**

```bash
# 用户可以手动运行部署脚本
$ node scripts/deploy-complete-superpowers.js deploy

# 或使用 stigmergy 命令
$ stigmergy deploy superpowers
```

---

## 📊 两个机制的对比

| 特性 | iflow Resources | Superpowers |
|------|----------------|-------------|
| **内容来源** | 从 ~/.iflow/ 读取 | 从 skills/ 目录读取 |
| **打包方式** | bundle (489KB JSON) | 代码 + 文件 |
| **部署时机** | npm install postinstall | 手动或postinstall |
| **部署目标** | 7个CLI工具 | iflow, qwen, codebuddy |
| **内容类型** | agents + skills | skills + plugins |
| **Hooks支持** | ❌ 无 | ✅ 有 |
| **Context Injection** | ❌ 无 | ✅ 有 |

---

## 🎯 用户获得的完整功能

安装 `npm install -g stigmergy@beta` 后，用户将获得：

### ✅ iflow 的 49 个专业资源
- 24 个高级 agents
- 25 个专业 skills
- 自动部署到 7 个 CLI 工具

### ✅ Superpowers 插件系统
- Hooks 配置和实现
- Context Injection
- Skills 文件
- 部署到 iflow, qwen, codebuddy

### ✅ Stigmergy 自有功能
- 项目状态看板
- 并发 CLI 模式
- 交互模式
- 技能管理

---

## 🔧 开发者操作指南

### 重新打包 iflow 资源

```bash
# 1. 确保本地 iflow 已配置并包含最新的 agents/skills
ls ~/.iflow/agents/
ls ~/.iflow/skills/

# 2. 运行打包脚本
cd /path/to/stigmergy-CLI-Multi-Agents
node scripts/bundle-iflow-resources.js

# 3. 验证生成的 bundle
ls config/bundle/iflow-bundle/
# → config-bundle.json (应该是最新的)
# → deployment-manifest.json

# 4. 更新版本号
npm version patch

# 5. 发布到 npm
npm publish --tag beta
```

### 手动部署 Superpowers

```bash
# 部署到所有支持的 CLI
node scripts/deploy-complete-superpowers.js deploy

# 验证部署
node scripts/deploy-complete-superpowers.js verify

# 卸载
node scripts/deploy-complete-superpowers.js undeploy
```

---

## 📝 总结

### iflow Resources 机制
1. **打包时**: 从 `~/.iflow/` 读取所有内容，生成 `config-bundle.json` (489KB)
2. **发布时**: `config/**` 包含在 npm 包中
3. **安装时**: postinstall 脚本自动部署到 7 个 CLI 工具
4. **结果**: 用户获得完整的 iflow agents 和 skills

### Superpowers 机制
1. **Skills 部分**: Markdown 文件，从 `skills/` 目录复制
2. **Plugins 部分**: Hooks + Context Injection，通过代码生成配置
3. **部署**: 手动或自动，使用 `PluginDeployer`
4. **结果**: CLI 工具获得增强的插件功能

### 两个机制的关系
- **独立运作**: iflow resources 和 superpowers 是独立的系统
- **互补功能**: iflow 提供内容，superpowers 提供增强
- **统一部署**: 都通过 npm 包分发，都可以自动部署
- **目标用户**: 都面向终端用户，提升 CLI 工具能力

---

**关键数字总结**:
- iflow resources: **49个文件** (24 agents + 25 skills)
- 部署目标: **7个CLI工具**
- 总部署文件数: **343个文件** (49 × 7)
- Bundle 大小: **489KB**
- Superpowers: **3个组件** (skills + hooks + context)
