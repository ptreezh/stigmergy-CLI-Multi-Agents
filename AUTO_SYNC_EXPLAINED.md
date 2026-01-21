# 🔄 自动同步选项 (--sync) 执行流程详解

## 📋 自动同步选项触发条件

### 默认行为

当你使用 `stigmergy skill install` 时，**默认会自动同步**！

```bash
# 这会自动同步
stigmergy skill install vercel-labs/agent-skills

# 等同于
stigmergy skill install vercel-labs/agent-skills --sync
```

### 禁用自动同步

```bash
# 禁用自动同步
stigmergy skill install vercel-labs/agent-skills --no-sync
```

---

## 🔍 执行流程详解

### 第 1 步：安装技能到 Stigmergy

```javascript
// src/commands/skill.js:23
await manager.install(args[0], options);
```

**执行内容**：
1. 从 GitHub 下载技能仓库
2. 解析技能元数据
3. 提取所有技能目录（包含 SKILL.md 的目录）
4. 复制到 `~/.stigmergy/skills/`

**输出示例**：
```
[INFO] Installing skills from vercel-labs/agent-skills...

[OK] Successfully installed 15 skill(s)

Installed skills:
  - pdf
  - algorithmic-art
  - react-best-practices
  - ...
```

---

### 第 2 步：检查同步选项

```javascript
// src/commands/skill.js:26-29
if (options.sync !== false) {
    console.log('\n🔄 Syncing skills to all CLI tools...');
    await syncManager.syncAll({ force: options.force || false });
}
```

**条件**：`options.sync !== false`

| 参数 | sync 是否执行 |
|------|--------------|
| `--sync` | ✅ 执行 |
| （无参数） | ✅ 执行（默认） |
| `--no-sync` | ❌ 不执行 |

---

### 第 3 步：扫描已安装的技能

```javascript
// src/core/skills/SkillSyncManager.js:152-171
async listInstalledSkills() {
  const skills = [];
  const entries = fs.readdirSync(this.stigmergySkillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = path.join(this.stigmergySkillsDir, entry.name);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      if (fs.existsSync(skillMdPath)) {
        skills.push({
          name: entry.name,
          path: skillPath
        });
      }
    }
  }

  return skills;
}
```

**执行内容**：
- 扫描 `~/.stigmergy/skills/` 目录
- 查找包含 `SKILL.md` 的子目录
- 收集技能信息

**输出示例**：
```
[SYNC] Found 15 skill(s) to sync
```

---

### 第 4 步：遍历所有 CLI 工具

```javascript
// src/core/skills/SkillSyncManager.js:17-26
this.cliTools = [
  'claude',      // ~/.claude/skills/
  'codex',      // ~/.codex/skills/
  'iflow',      // ~/.iflow/skills/
  'qwen',       // ~/.qwen/skills/
  'qodercli',   // ~/.qoder/skills/
  'codebuddy',  // ~/.codebuddy/skills/
  'opencode'    // ~/.opencode/skills/
];
```

**对每个 CLI 工具执行**：
1. 检查 CLI 是否已安装
2. 创建 skills 目录（如不存在）
3. 复制技能文件

---

### 第 5 步：同步到每个 CLI 工具

```javascript
// src/core/skills/SkillSyncManager.js:93-143
async syncSkillToCLI(skillPath, skillName, cliName, options = {}) {
  const cliHomeDir = path.join(os.homedir(), `.${cliName}`);
  const cliSkillsDir = path.join(cliHomeDir, 'skills');
  const targetPath = path.join(cliSkillsDir, skillName);

  // 1. 检查 CLI 是否安装
  if (!fs.existsSync(cliHomeDir)) {
    return { success: false, cliName, reason: 'CLI not installed' };
  }

  // 2. 创建 skills 目录
  if (!fs.existsSync(cliSkillsDir)) {
    fs.mkdirSync(cliSkillsDir, { recursive: true });
  }

  // 3. 删除已存在的技能（如果 --force）
  if (options.force && fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  // 4. 检查是否已存在（无 --force）
  if (fs.existsSync(targetPath) && !options.force) {
    return {
      success: false,
      cliName,
      reason: 'Skill already exists (use --force to overwrite)'
    };
  }

  // 5. 递归复制技能目录
  this.copyDirectory(skillPath, targetPath);

  return { success: true, cliName, targetPath };
}
```

**执行内容**：
1. 检查 `~/.claude/` （或 `~/.qwen/` 等）是否存在
2. 创建 `~/.claude/skills/` 目录
3. 复制整个技能目录到 `~/.claude/skills/skill-name/`

---

### 第 6 步：递归复制文件

```javascript
// src/core/skills/SkillSyncManager.js:241-254
copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      this.copyDirectory(srcPath, destPath);  // 递归
    } else {
      fs.copyFileSync(srcPath, destPath);  // 复制文件
    }
  }
}
```

**复制内容**：
- `SKILL.md` - 技能定义
- `*.js`, `*.ts`, `*.py` - 实现代码
- `*.json`, `*.yaml` - 配置文件
- 其他辅助文件

---

## 📊 完整执行示例

### 命令

```bash
stigmergy skill install vercel-labs/agent-skills
```

### 实际执行流程

#### 1. 安装阶段

```
[INFO] Installing skills from vercel-labs/agent-skills...
[INFO] Cloning repository...
[INFO] Scanning for skills...
[INFO] Found 15 skill(s)
[INFO] Installing to ~/.stigmergy/skills/...

[OK] Successfully installed 15 skill(s)

Installed skills:
  ✓ pdf
  ✓ algorithmic-art
  ✓ react-best-practices
  ✓ typescript-examples
  ✓ web-scraping
  ✓ data-analysis
  ✓ cli-tools
  ✓ git-integration
  ✓ docker-basics
  ✓ testing-utils
  ✓ api-clients
  ✓ database-management
  ✓ documentation
  ✓ code-review
  ✓ security-checks
```

#### 2. 同步阶段（自动执行）

```
🔄 Syncing skills to all CLI tools...

📦 pdf
  ✓ claude: synced successfully
  ✗ codex: CLI not installed
  ✓ iflow: synced successfully
  ✓ qwen: synced successfully
  ✓ qodercli: synced successfully
  ✓ codebuddy: synced successfully
  ✓ opencode: synced successfully

✓ Synced to 6/7 CLI tools

📦 algorithmic-art
  ✓ claude: synced successfully
  ✗ codex: CLI not installed
  ✓ iflow: synced successfully
  ✓ qwen: synced successfully
  ✓ qodercli: synced successfully
  ✓ codebuddy: synced successfully
  ✓ opencode: synced successfully

✓ Synced to 6/7 CLI tools

...（继续处理其余 13 个技能）

================================================================================
📊 Sync Summary

Total Skills: 15
Successful Syncs: 90/105 (85.7%)
Success Rate: 85.7%

Total: 6/7 CLI tools available
```

---

## 🎯 具体到每个 CLI 工具的执行

### 1. Claude CLI

```
源: ~/.stigmergy/skills/pdf/
目标: ~/.claude/skills/pdf/

执行:
1. 检查 ~/.claude/ 是否存在 → ✓ 存在
2. 创建 ~/.claude/skills/     → ✓ 已存在
3. 复制 pdf/ 目录
   - pdf/SKILL.md      → ~/.claude/skills/pdf/SKILL.md
   - pdf/*.js         → ~/.claude/skills/pdf/*.js

结果: ✓ claude: synced successfully
```

### 2. Qwen CLI

```
源: ~/.stigmergy/skills/pdf/
目标: ~/.qwen/skills/pdf/

执行:
1. 检查 ~/.qwen/ 是否存在 → ✓ 存在
2. 创建 ~/.qwen/skills/      → ✓ 已存在
3. 复制 pdf/ 目录

结果: ✓ qwen: synced successfully
```

### 3. Codex CLI（未安装）

```
源: ~/.stigmergy/skills/pdf/
目标: ~/.codex/skills/pdf/

执行:
1. 检查 ~/.codex/ 是否存在 → ✗ 不存在

结果: ✗ codex: CLI not installed
```

---

## ⚙️ 可选参数的影响

### --force（强制覆盖）

```bash
# 不使用 --force（默认）
stigmergy skill sync-to-cli pdf

# 如果技能已存在，会提示：
# ✗ claude: Skill already exists (use --force to overwrite)

# 使用 --force
stigmergy skill sync-to-cli pdf --force

# 强制覆盖，即使已存在
# ✓ claude: synced successfully (overwritten)
```

**实现**：
```javascript
if (options.force && fs.existsSync(targetPath)) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}
```

---

### --exclude（排除某些 CLI）

```bash
# 排除 codex 和 opencode
stigmergy skill sync-all --exclude codex,opencode

# 输出:
📦 pdf
  ✓ claude: synced successfully
  ⊘ codex: skipped (excluded)
  ✓ iflow: synced successfully
  ✓ qwen: synced successfully
  ✓ qodercli: synced successfully
  ✓ codebuddy: synced successfully
  ⊘ opencode: skipped (excluded)

✓ Synced to 5/7 CLI tools
  ⊘ Skipped 2 CLI tools
```

**实现**：
```javascript
if (options.exclude && options.exclude.includes(cliName)) {
  console.log(`  ⊘ ${cliName}: skipped (excluded)`);
  skipped++;
  continue;
}
```

---

### --clis（只同步到特定 CLI）

```bash
# 只同步到 claude 和 qwen
stigmergy skill sync-to-cli pdf --clis claude,qwen

# 输出:
📦 pdf
  ✓ claude: synced successfully
  ✓ qwen: synced successfully

✓ Synced to 2/7 CLI tools
```

**实现**：
```javascript
if (options.clis && !options.clis.includes(cliName)) {
  continue;  // 跳过
}
```

---

### --dry-run（预览模式）

```bash
# 预览同步操作，不实际执行
stigmergy skill sync-all --dry-run

# 输出:
[SYNC] Found 15 skill(s) to sync

📦 pdf
  (dry-run) claude: would sync
  (dry-run) codex: would skip (not installed)
  (dry-run) iflow: would sync
  ...

✓ Synced to 6/7 CLI tools (dry run)
```

**实现**：
```javascript
if (options.dryRun) {
  return {
    success: true,
    cliName,
    dryRun: true,
    reason: 'Dry run - would sync'
  };
}
```

---

## 📁 文件系统操作详解

### 目录创建

```javascript
// 创建 ~/.claude/skills/ 目录
const cliSkillsDir = path.join(os.homedir(), '.claude', 'skills');

if (!fs.existsSync(cliSkillsDir)) {
  fs.mkdirSync(cliSkillsDir, { recursive: true });
  // recursive: true 确保父目录也会被创建
}
```

**示例**：
```
创建前: ~/.claude/           (目录不存在)
创建后: ~/.claude/skills/    (创建成功)

如果父目录也不存在:
~/.claude/ → 自动创建
```

---

### 目录复制（递归）

```javascript
copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      this.copyDirectory(srcPath, destPath);  // 递归复制子目录
    } else {
      fs.copyFileSync(srcPath, destPath);  // 复制文件
    }
  }
}
```

**示例**：

**源目录**：
```
~/.stigmergy/skills/pdf/
├── SKILL.md
├── parser.js
├── extractor.js
└── utils.js
```

**目标目录**（创建后）：
```
~/.claude/skills/pdf/
├── SKILL.md
├── parser.js
├── extractor.js
└── utils.js
```

---

## ⏱️ 执行时间估算

### 单个技能同步

```
技能大小: 100 KB
CLI 工具数: 7 个

操作:
- 检查目录: ~10ms × 7 = 70ms
- 创建目录: ~5ms × 7 = 35ms
- 复制文件: ~20ms × 7 = 140ms
总时间: ~250ms
```

### 所有技能同步（15 个）

```
总大小: 1.5 MB
文件数: ~200 个
总时间: ~3-5 秒
```

---

## 🔍 故障处理

### 场景 1：权限不足

```bash
# 错误
✗ claude: Permission denied

# 解决：使用管理员权限
sudo stigmergy skill install vercel-labs/agent-skills --sync

# Windows
# 以管理员身份运行 PowerShell
```

### 场景 2：磁盘空间不足

```bash
# 错误
✗ codebuddy: No space left on device

# 解决：清理空间或跳过该 CLI
stigmergy skill install ... --exclude codebuddy
```

### 场景 3：文件被占用

```bash
# 错误
✗ qwen: File in use

# 解决：稍后重试或使用 --force
stigmergy skill sync-all --force
```

---

## 📝 总结：自动同步选项做了什么

### ✅ 执行的操作

1. **扫描** `~/.stigmergy/skills/` 目录
2. **识别** 所有技能（包含 SKILL.md 的目录）
3. **遍历** 7 个 CLI 工具（claude, codex, iflow, qwen, qodercli, codebuddy, opencode）
4. **检查** 每个 CLI 是否已安装
5. **创建** `~/.cli-name/skills/` 目录（如不存在）
6. **复制** 技能目录到 `~/.cli-name/skills/skill-name/`
7. **验证** 复制是否成功
8. **报告** 同步结果统计

### 📊 最终结果

```bash
安装并同步后：
~/.stigmergy/skills/pdf/    ← Stigmergy 主存储
~/.claude/skills/pdf/       ← Claude 可用
~/.qwen/skills/pdf/        ← Qwen 可用
~/.iflow/skills/pdf/        ← iFlow 可用
~/.qodercli/skills/pdf/    ← Qoder CLI 可用
~/.codebuddy/skills/pdf/   ← CodeBuddy 可用
~/.opencode/skills/pdf/    ← OpenCode 可用
```

### 🎯 用户体验

```bash
# 一条命令搞定
stigigmergy skill install vercel-labs/agent-skills --sync

# 现在可以在任何 CLI 中使用
claude> use pdf skill to analyze document.pdf
qwen> 使用 pdf 技能分析文档.pdf
iflow> pdf 分析 document.pdf
```

**一次安装，到处使用！** 🚀
