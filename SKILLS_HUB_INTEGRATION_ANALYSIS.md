# Skills-Hub 集成分析与方案

**日期**: 2025-01-26
**来源**: https://github.com/qufei1993/skills-hub
**目标**: 将集中式技能管理集成到 Stigmergy

---

## 1. Skills-Hub 核心机制分析

### 1.1 核心概念

```
┌─────────────────────────────────────────────────────┐
│              Skills Hub 架构                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Central Repo (~/.skillshub)                        │
│  ├── skill-1/                                       │
│  ├── skill-2/                                       │
│  └── skill-3/                                       │
│         │                                           │
│         ├── symlink/copy ──→ ~/.cursor/skills/      │
│         ├── symlink/copy ──→ ~/.claude/skills/     │
│         ├── symlink/copy ──→ ~/.gemini/skills/     │
│         └── symlink/copy ──→ ~/.copilot/skills/    │
│                                                     │
│  SQLite Database (skills_hub.db)                   │
│  ├── skills (managed skills metadata)              │
│  ├── skill_targets (per-tool mappings)             │
│  └── settings (config)                              │
└─────────────────────────────────────────────────────┘
```

### 1.2 关键特性

| 特性 | 描述 | 优势 |
|------|------|------|
| **Central Repo** | 统一的技能仓库 | 一次安装，集中管理 |
| **Symlink优先** | 优先使用符号链接 | 节省空间，自动同步 |
| **Copy Fallback** | 不支持symlink时复制 | 兼容性更好 |
| **Tool Adapters** | 每个工具的适配器 | 易于扩展新工具 |
| **SQLite存储** | 元数据和状态 | 快速查询和管理 |
| **Onboarding** | 扫描现有技能导入 | 平滑迁移 |

### 1.3 Tool Adapter 结构

```rust
pub struct ToolAdapter {
    pub id: ToolId,                          // 工具唯一标识
    pub display_name: &'static str,          // 显示名称
    pub relative_skills_dir: &'static str,   // 技能目录路径
    pub relative_detect_dir: &'static str,   // 检测工具安装的路径
}

// 示例
ToolAdapter {
    id: ToolId::ClaudeCode,
    display_name: "Claude Code",
    relative_skills_dir: ".claude/skills",
    relative_detect_dir: ".claude",
}
```

---

## 2. 当前 Stigmergy 的问题

### 2.1 重复部署问题

```
当前状态（重复）:

~/.iflow/IFLOW.md          ← 11.75 KB 元技能
~/.qwen/QWEN.md            ← 12.19 KB 元技能
~/.codebuddy/CODEBUDDY.md  ← 14.08 KB 元技能
~/.qoder/QODER.md          ← 11.48 KB 元技能

总计: ~49 KB 重复内容

更新时需要:
1. 修改模板 (templates/using-*.md)
2. 运行4个部署脚本
3. 验证40项测试
```

### 2.2 管理复杂度

| 操作 | 当前成本 | 理想成本 |
|------|---------|---------|
| 添加新CLI | 创建新模板+脚本 | 配置adapter |
| 更新元技能 | 修改4个模板 | 修改1个文件 |
| 部署到新机器 | 运行4个脚本 | 运行1个命令 |
| 版本管理 | 4个独立副本 | 1个中央副本 |

---

## 3. 集成方案设计

### 3.1 Phase 1: 简化版（推荐MVP）

**目标**: 快速实现核心功能，避免过度工程

#### 架构设计

```
~/.stigmergy/
├── skills-hub/                    ← Central Repo
│   ├── meta-skills/
│   │   ├── using-iflow-workflows.md
│   │   ├── using-qwen-extensions.md
│   │   ├── using-codebuddy-buddies.md
│   │   └── using-qodercli-skills.md
│   └── registry.json              ← 技能注册表（替代SQLite）
│
└── config/
    └── tool-adapters.json         ← 工具适配器配置
```

#### 核心组件

**1. Tool Adapter (JavaScript)**

```javascript
// tool-adapters.json
{
  "tools": [
    {
      "id": "iflow",
      "displayName": "iFlow CLI",
      "metaSkillFile": "using-iflow-workflows.md",
      "targetPath": "~/.iflow/IFLOW.md",
      "detectPath": "~/.iflow",
      "injectMode": "prepend"  // prepend, replace, or section
    },
    {
      "id": "qwen",
      "displayName": "Qwen CLI",
      "metaSkillFile": "using-qwen-extensions.md",
      "targetPath": "~/.qwen/QWEN.md",
      "detectPath": "~/.qwen",
      "injectMode": "prepend"
    },
    {
      "id": "codebuddy",
      "displayName": "CodeBuddy CLI",
      "metaSkillFile": "using-codebuddy-buddies.md",
      "targetPath": "~/.codebuddy/CODEBUDDY.md",
      "detectPath": "~/.codebuddy",
      "injectMode": "prepend"
    },
    {
      "id": "qodercli",
      "displayName": "QoderCLI",
      "metaSkillFile": "using-qodercli-skills.md",
      "targetPath": "~/.qoder/QODER.md",
      "detectPath": "~/.qoder",
      "injectMode": "prepend"
    }
  ]
}
```

**2. Skills Manager (JavaScript)**

```javascript
// src/core/skills/StigmergySkillsHub.js
class StigmergySkillsHub {
  constructor() {
    this.centralRepo = path.join(os.homedir(), '.stigmergy', 'skills-hub');
    this.registryPath = path.join(this.centralRepo, 'registry.json');
    this.adaptersPath = path.join(os.homedir(), '.stigmergy', 'config', 'tool-adapters.json');
  }

  // 初始化中央仓库
  async init() {
    await this.createCentralRepo();
    await this.loadAdapters();
    await this.loadRegistry();
  }

  // 同步元技能到所有工具
  async syncAll() {
    const results = [];
    for (const adapter of this.adapters) {
      if (await this.isToolInstalled(adapter)) {
        const result = await this.syncToTool(adapter);
        results.push(result);
      }
    }
    return results;
  }

  // 同步到特定工具
  async syncToTool(adapter) {
    const sourcePath = path.join(this.centralRepo, 'meta-skills', adapter.metaSkillFile);
    const targetPath = this.expandPath(adapter.targetPath);

    // 读取源文件
    const metaSkillContent = await fs.readFile(sourcePath, 'utf8');

    // 读取目标文件
    let targetContent = '';
    try {
      targetContent = await fs.readFile(targetPath, 'utf8');
    } catch (e) {
      targetContent = '';
    }

    // 移除旧的 META_SKILL 部分
    targetContent = targetContent.replace(
      /<!-- META_SKILL_START -->[\s\S]*?<!-- META_SKILL_END -->\n?/g,
      ''
    );

    // 注入新的 META_SKILL
    const injectedContent = metaSkillContent + '\n\n---\n\n' + targetContent;

    // 写入目标文件
    await fs.writeFile(targetPath, injectedContent, 'utf-8');

    // 更新注册表
    await this.updateRegistry(adapter.id, {
      syncedAt: Date.now(),
      sourceHash: this.hashContent(metaSkillContent)
    });

    return { tool: adapter.id, success: true };
  }

  // 检测工具是否已安装
  async isToolInstalled(adapter) {
    const detectPath = this.expandPath(adapter.detectPath);
    try {
      await fs.access(detectPath);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 展开路径中的 ~
  expandPath(p) {
    return p.replace(/^~/, os.homedir());
  }

  // 计算内容哈希
  hashContent(content) {
    return require('crypto')
      .createHash('md5')
      .update(content)
      .digest('hex');
  }
}
```

**3. CLI 命令**

```bash
# 初始化 skills hub
stigmergy skills-hub init

# 同步所有已安装的工具
stigmergy skills-hub sync

# 同步到特定工具
stigmergy skills-hub sync --tool iflow

# 查看同步状态
stigmergy skills-hub status

# 更新中央仓库的元技能
stigmergy skills-hub update
```

### 3.2 Phase 2: 完整版（可选）

**目标**: 接近 skills-hub 的完整功能

#### 新增功能

1. **SQLite 数据库**（替代 registry.json）
   - 更高效的查询
   - 支持复杂关系
   - 更好的并发控制

2. **GUI 界面**（可选）
   - Electron/Tauri 桌面应用
   - 可视化管理技能
   - 拖拽式同步配置

3. **Git 集成**
   - 从 Git 仓库导入技能
   - 自动更新技能
   - 版本管理

4. **技能发现**
   - 扫描现有技能
   - 智能分组
   - 冲突检测

---

## 4. 实现计划

### 4.1 Phase 1 实现步骤

#### Step 1: 创建目录结构
```bash
mkdir -p ~/.stigmergy/skills-hub/meta-skills
mkdir -p ~/.stigmergy/config
```

#### Step 2: 移动现有模板
```bash
# 将模板文件复制到中央仓库
cp templates/using-*.md ~/.stigmergy/skills-hub/meta-skills/
```

#### Step 3: 创建配置文件
- `~/.stigmergy/config/tool-adapters.json`
- `~/.stigmergy/skills-hub/registry.json`

#### Step 4: 实现 Skills Manager
- 创建 `src/core/skills/StigmergySkillsHub.js`
- 实现核心方法（init, sync, status）

#### Step 5: 创建 CLI 命令
- `src/commands/skills-hub.js`
- 添加子命令（init, sync, status, update）

#### Step 6: 更新现有脚本
- 修改 `deploy-*-v2.js` 使用 Skills Hub
- 或创建新的 `sync-meta-skills.js`

#### Step 7: 测试
- 单元测试
- 集成测试
- 端到端测试

### 4.2 时间估算

| 步骤 | 预计时间 |
|------|---------|
| Step 1-3 | 30分钟 |
| Step 4 | 2-3小时 |
| Step 5 | 1-2小时 |
| Step 6 | 1小时 |
| Step 7 | 1小时 |
| **总计** | **5-7小时** |

---

## 5. 优势对比

### 5.1 当前方式 vs Skills Hub 方式

| 维度 | 当前方式 | Skills Hub | 改进 |
|------|---------|-----------|------|
| **部署** | 4个独立脚本 | 1个中央仓库 | 4x简化 |
| **更新** | 修改4个模板 | 修改1个文件 | 4x简化 |
| **存储** | 49 KB (4副本) | 12 KB (1副本) | 4x节省 |
| **管理** | 手动管理每个 | 集中管理 | 统一视图 |
| **扩展性** | 添加CLI需新建脚本 | 配置adapter | 插件化 |

### 5.2 维护成本

| 操作 | 当前 | Skills Hub |
|------|------|-----------|
| 添加新CLI | 创建模板+脚本+测试 | 添加1个JSON配置 |
| 更新元技能 | 修改4个模板 | 修改1个文件 |
| 部署到新机器 | 运行4个脚本 | 运行1个命令 |
| 版本回滚 | 手动处理4个文件 | 回滚1个文件 |

---

## 6. 风险和挑战

### 6.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Symlink权限问题 | Copy fallback | 检测并自动fallback |
| 路径兼容性 | 统一使用path.expand | 跨平台测试 |
| 文件锁定 | 原子写入 | 使用临时文件+重命名 |
| 并发冲突 | 文件锁或队列 | 简化：单次同步 |

### 6.2 兼容性

| 平台 | Symlink支持 | Copy模式 | 测试状态 |
|------|------------|---------|---------|
| Linux | ✅ | ✅ | 需测试 |
| macOS | ✅ | ✅ | 需测试 |
| Windows | ⚠️ 需管理员 | ✅ | 需测试 |

---

## 7. 推荐方案

### 7.1 立即行动（Phase 1 MVP）

**实现简化版 Skills Hub**：
- 使用 JSON（不使用 SQLite）
- 使用文件复制（不使用 symlink，降低复杂度）
- 仅支持元技能（不支持所有技能）
- CLI 命令行界面（不使用 GUI）

**预期收益**：
- ✅ 消除重复部署
- ✅ 简化管理流程
- ✅ 降低维护成本
- ✅ 提升扩展性

### 7.2 未来增强（Phase 2）

根据使用反馈考虑：
- SQLite 数据库
- Symlink 支持
- GUI 界面
- Git 集成
- 技能发现

---

## 8. 下一步行动

1. **审查方案** - 确认技术方案
2. **开始实现** - 创建 Phase 1 MVP
3. **测试验证** - 确保功能正常
4. **文档更新** - 更新使用文档
5. **发布使用** - 集成到主分支

---

**版本**: 1.0.0
**日期**: 2025-01-26
**状态**: 待审查
