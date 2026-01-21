# 🔧 Stigmergy 技能部署到各个 CLI 工具指南

生成时间：2026-01-17

---

## 📋 当前状况分析

### ✅ Stigmergy 已有的功能

1. **StigmergySkillManager**
   - 从 GitHub 安装技能到 `~/.stigmergy/skills/`
   - 支持多个搜索路径
   - 技能管理和验证

2. **BuiltinSkillsDeployer**
   - 读取 `config/builtin-skills.json`
   - 部署内置技能到各个 CLI 工具
   - 目标目录：`~/.cli-name/skills/`

### ⚠️ 问题

**技能隔离问题**：
- Stigmergy 安装的技能：`~/.stigmergy/skills/`
- 各个 CLI 工具读取：`~/.cli-name/skills/`
- **结果**：CLI 工具无法直接使用 Stigmergy 安装的技能

---

## 🎯 解决方案

### 方案 1：扩展 BuiltinSkillsDeployer（推荐）⭐

创建一个通用的技能同步器，可以将 Stigmergy 的技能同步到各个 CLI 工具。

#### 实现步骤

**1. 创建 SkillSyncManager 类**

```javascript
/**
 * SkillSyncManager - Sync skills from Stigmergy to all CLI tools
 */

class SkillSyncManager {
  constructor() {
    this.stigmergySkillsDir = path.join(os.homedir(), '.stigmergy/skills');
    this.cliTools = [
      'claude',
      'codex',
      'iflow',
      'qwen',
      'qodercli',
      'codebuddy',
      'opencode'
      // 添加更多支持 skills 的 CLI 工具
    ];
  }

  /**
   * 同步单个技能到所有 CLI 工具
   */
  async syncSkill(skillName, options = {}) {
    const skillPath = path.join(this.stigmergySkillsDir, skillName);

    // 检查技能是否存在
    if (!fs.existsSync(skillPath)) {
      throw new Error(`Skill '${skillName}' not found in ${this.stigmergySkillsDir}`);
    }

    const results = [];

    for (const cliName of this.cliTools) {
      const result = await this.syncSkillToCLI(skillPath, skillName, cliName, options);
      results.push(result);
    }

    return {
      skillName,
      totalCLIs: this.cliTools.length,
      successful: results.filter(r => r.success).length,
      results
    };
  }

  /**
   * 同步技能到特定 CLI 工具
   */
  async syncSkillToCLI(skillPath, skillName, cliName, options = {}) {
    const cliSkillsDir = path.join(os.homedir(), `.${cliName}`, 'skills');
    const targetPath = path.join(cliSkillsDir, skillName);

    // 检查 CLI 是否已安装
    const cliHomeDir = path.join(os.homedir(), `.${cliName}`);
    if (!fs.existsSync(cliHomeDir)) {
      return {
        success: false,
        cliName,
        reason: 'CLI not installed'
      };
    }

    // 创建 skills 目录
    if (!fs.existsSync(cliSkillsDir)) {
      fs.mkdirSync(cliSkillsDir, { recursive: true });
    }

    // 复制技能
    try {
      if (options.force && fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }

      // 递归复制
      this.copyDirectory(skillPath, targetPath);

      console.log(`✓ Synced '${skillName}' to ${cliName}`);
      return { success: true, cliName };
    } catch (error) {
      console.error(`✗ Failed to sync to ${cliName}:`, error.message);
      return { success: false, cliName, error: error.message };
    }
  }

  /**
   * 同步所有技能到所有 CLI 工具
   */
  async syncAll(options = {}) {
    const skills = await this.listInstalledSkills();

    console.log(`[SYNC] Found ${skills.length} skill(s) to sync`);

    const results = [];
    for (const skill of skills) {
      const result = await this.syncSkill(skill.name, options);
      results.push(result);
    }

    return results;
  }

  /**
   * 列出已安装的技能
   */
  async listInstalledSkills() {
    const skills = [];

    if (!fs.existsSync(this.stigmergySkillsDir)) {
      return skills;
    }

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

  /**
   * 递归复制目录
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

module.exports = SkillSyncManager;
```

**2. 添加到 StigmergySkillManager**

```javascript
// 在 src/core/skills/StigmergySkillManager.js 中添加

import { SkillSyncManager } from './SkillSyncManager.js';

export class StigmergySkillManager {
  constructor(options = {}) {
    // ... 现有代码 ...

    this.syncManager = new SkillSyncManager();
  }

  /**
   * 安装技能并同步到所有 CLI 工具
   */
  async install(source, options = {}) {
    console.log(`[INFO] Installing skills from ${source}...`);

    // 现有的安装逻辑
    const skills = await this.installer.installFromGitHub(source, options);

    console.log(`\n[OK] Successfully installed ${skills.length} skill(s)`);

    // 同步到所有 CLI 工具
    if (options.sync !== false) {
      console.log('\n[SYNC] Syncing skills to all CLI tools...');

      for (const skill of skills) {
        await this.syncManager.syncSkill(skill.name, {
          force: options.force || false
        });
      }

      // 同步 AGENTS.md
      await this.sync();
    }

    return skills;
  }

  /**
   * 同步所有已安装的技能
   */
  async syncAll() {
    return await this.syncManager.syncAll();
  }
}
```

**3. 添加 CLI 命令**

```javascript
// 在 src/commands/skill.js 中添加

case 'sync-to-cli':
  await manager.syncAll();
  break;

case 'sync-to-cli':
  if (!args[0]) {
    console.error('❌ Error: skill name required');
    console.log('\nUsage: stigmergy skill sync-to-cli <skill-name>');
    process.exit(1);
  }
  await manager.syncSkill(args[0]);
  break;
```

---

### 方案 2：创建符号链接（高级方案）

适用于支持符号链接的系统（Linux, macOS）。

```javascript
/**
 * 使用符号链接而不是复制
 */
async createSymlink(skillName, cliName) {
  const skillPath = path.join(this.stigmergySkillsDir, skillName);
  const cliSkillsDir = path.join(os.homedir(), `.${cliName}`, 'skills');
  const linkPath = path.join(cliSkillsDir, skillName);

  try {
    fs.symlinkSync(skillPath, linkPath);
    console.log(`✓ Created symlink for '${skillName}' in ${cliName}`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      // 已存在，删除并重建
      fs.unlinkSync(linkPath);
      fs.symlinkSync(skillPath, linkPath);
    } else {
      throw error;
    }
  }
}
```

**优点**：
- 节省磁盘空间
- 更新 Stigmergy 技能会自动反映到所有 CLI

**缺点**：
- Windows 需要管理员权限
- 不是所有文件系统都支持

---

### 方案 3：统一技能目录（最简单）⭐⭐⭐

让所有 CLI 工具读取统一的技能目录。

#### 修改各 CLI 工具的技能搜索路径

**1. Stigmergy 作为中间层**

```javascript
// stigmergy skill read pdf
// 将技能内容输出到标准输出，供其他 CLI 使用
```

**2. 各 CLI 工具支持远程技能读取**

通过 HTTP API 或命令行接口读取 Stigmergy 的技能：

```bash
# 在 Qwen 中使用 Claude 的技能
qwen> curl http://localhost:3000/skills/pdf | claude --skill
```

---

## 🚀 推荐实施方案

### 最佳方案：方案 1（扩展 BuiltinSkillsDeployer）

**原因**：
- ✅ 完全控制
- ✅ 兼容所有平台
- ✅ 用户可见
- ✅ 可以增量同步

### 实施步骤

**第 1 步：创建 SkillSyncManager**

```bash
# 创建新文件
touch src/core/skills/SkillSyncManager.js
```

**第 2 步：集成到 StigmergySkillManager**

修改 `src/core/skills/StigmergySkillManager.js`

**第 3 步：添加 CLI 命令**

```bash
# 同步所有技能
stigmergy skill sync-all

# 同步单个技能
stigmergy skill sync-to-cli pdf

# 查看同步状态
stigmergy skill sync-status
```

**第 4 步：自动同步（可选）**

在 `stigmergy skill install` 时自动同步：

```bash
stigmergy skill install vercel-labs/agent-skills --sync
# 或
stigmergy skill install vercel-labs/agent-skills --auto-sync
```

---

## 📊 各 CLI 工具的技能目录

### 技能目录结构

| CLI 工具 | 技能目录 | 配置文件 |
|---------|---------|---------|
| **Claude** | `~/.claude/skills/` | `~/.claude/config.json` |
| **Qwen** | `~/.qwen/skills/` | `~/.qwen/config.json` |
| **iFlow** | `~/.iflow/skills/` | `~/.iflow/config.json` |
| **Qoder CLI** | `~/.qodercli/skills/` | `~/.qodercli/config.json` |
| **CodeBuddy** | `~/.codebuddy/skills/` | `~/.codebuddy/config.json` |
| **OpenCode** | `~/.opencode/skills/` | `~/.opencode/config.json` |
| **Codex** | `~/.codex/skills/` | `~/.codex/config.json` |
| **Stigmergy** | `~/.stigmergy/skills/` | `~/.stigmergy/config.json` |

### 技能格式

所有 CLI 工具使用相同的技能格式：

```markdown
<!-- SKILL.md -->
# Skill Name

Description of what this skill does.

## Instructions

Step-by-step instructions for the AI agent.

## Examples

Example usage...
```

---

## 🎯 使用示例

### 场景 1：安装并同步技能

```bash
# 1. 安装技能到 Stigmergy
stigmergy skill install vercel-labs/agent-skills

# 2. 同步到所有 CLI 工具
stigmergy skill sync-all

# 3. 验证
stigmergy skill sync-status

# 输出：
# ✓ pdf: deployed to claude, qwen, iflow, qodercli
# ✗ algorithmic-art: codex not installed
```

### 场景 2：在各个 CLI 中使用

```bash
# Claude CLI
claude> use pdf skill to analyze document.pdf

# Qwen CLI（技能已同步）
qwen> 使用 pdf 技能分析 document.pdf

# iFlow CLI（技能已同步）
iflow> pdf 分析 document.pdf
```

### 场景 3：更新技能

```bash
# 1. 重新安装技能
stigmergy skill install vercel-labs/agent-skills --force

# 2. 同步更新
stigmergy skill sync-all --force

# 现在 CLI 工具都会使用新版本
```

---

## 📝 配置文件示例

### config/builtin-skills.json

```json
{
  "version": "1.0.0",
  "description": "Stigmergy built-in skills configuration",
  "skills": [
    {
      "name": "resumesession",
      "displayName": "ResumeSession",
      "description": "Cross-CLI session recovery",
      "version": "1.0.0",
      "deployment": {
        "autoDeploy": true,
        "targetCLIs": [
          "claude",
          "codex",
          "iflow",
          "qwen",
          "qodercli",
          "codebuddy",
          "opencode"
        ],
        "files": [
          {
            "source": "skills/resumesession/SKILL.md",
            "destination": "skills/resumesession/SKILL.md"
          }
        ]
      }
    }
  ]
}
```

---

## ⚙️ 高级功能

### 1. 选择性同步

```bash
# 只同步到特定 CLI 工具
stigmergy skill sync-to-cli pdf --clis claude,qwen

# 排除某些 CLI 工具
stigmergy skill sync-to-cli pdf --exclude codex
```

### 2. 干运行（预览）

```bash
# 预览同步操作
stigmergy skill sync-all --dry-run

# 输出：
# [DRY-RUN] Would sync 'pdf' to:
#   - claude
#   - qwen
#   - iflow
#   - qodercli
#   - codebuddy
```

### 3. 同步状态检查

```bash
# 检查所有技能的同步状态
stigmergy skill sync-status

# 输出：
# Skill: pdf
#   ✓ claude: synced (v1.0.0)
#   ✓ qwen: synced (v1.0.0)
#   ✗ codex: not synced (CLI not installed)
#   ✓ iflow: synced (v1.0.0)
```

### 4. 批量操作

```bash
# 同步多个技能
stigmergy skill sync-to-cli pdf algorithmic-art react-best-practices

# 同步所有技能到特定 CLI
stigmergy skill sync-all --target claude
```

---

## 🔍 验证部署

### 检查技能是否正确部署

```bash
# 方法 1：检查目录
ls ~/.claude/skills/pdf
ls ~/.qwen/skills/pdf
ls ~/.iflow/skills/pdf

# 方法 2：使用 Stigmergy 命令
stigmergy skill check-deployment pdf

# 方法 3：在 CLI 中测试
claude> list skills
qwen> 技能列表
```

---

## 📚 文档更新

### 在 README.md 中添加

```markdown
## Skill Synchronization

Stigmergy can sync installed skills to all AI CLI tools:

### Sync to All CLI Tools

\`\`\`bash
# Install and sync in one command
stigmergy skill install vercel-labs/agent-skills --sync

# Or sync all installed skills
stigmergy skill sync-all
\`\`\`

### Sync Specific Skill

\`\`\`bash
stigmergy skill sync-to-cli pdf
\`\`\`

### Check Sync Status

\`\`\`bash
stigmergy skill sync-status
\`\`\`

### Supported CLI Tools

- Claude CLI
- Qwen CLI
- iFlow CLI
- Qoder CLI
- CodeBuddy CLI
- OpenCode CLI
- Codex CLI
\`\`\`
```

---

## ✅ 总结

### 当前状态
- ✅ Stigmergy 可以安装技能到 `~/.stigmergy/skills/`
- ✅ BuiltinSkillsDeployer 可以部署内置技能
- ⚠️ 但用户安装的技能不会自动同步到各 CLI

### 推荐实施
1. **创建 SkillSyncManager 类**
2. **集成到 StigmergySkillManager**
3. **添加同步命令**
4. **支持自动同步选项**

### 用户体验
```bash
# 安装并同步
stigmergy skill install vercel-labs/agent-skills --sync

# 在任何 CLI 中使用
claude> use pdf skill
qwen> 使用 pdf 技能
iflow> pdf 技能
```

---

**建议优先级**：🔥 高优先级

这个功能将大大提升 Stigmergy 的实用性和用户体验！
