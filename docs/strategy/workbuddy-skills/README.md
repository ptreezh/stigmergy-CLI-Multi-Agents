# WorkBuddy 上架暂存目录（A 组 7 技能）

本目录存放 A 组 7 个技能的 WorkBuddy 适配版副本（源文件在 `skills/<name>/`，本目录仅供上架适配，**勿删源**）。

## 状态总览（2026-09-24 更新）

| # | 技能 | 目录 | frontmatter | 本地 validate | 编码 | 试水待决 |
|---|---|---|---|---|---|---|
| 1 | verification-first | `verification-first/` | ✅ 完整 | ✅ PASS | ✅ | **allowed-tools 探测** ← 试水提交对象 |
| 2 | resumesession | `resumesession/` | ✅ 完整 | ✅ PASS | ✅ | 无 |
| 3 | planning-with-files | `planning-with-files/` | ✅ 完整 | ✅ PASS | ✅ | hooks 已移除（见预案） |
| 4 | two-agent-loop | `two-agent-loop/` | ✅ 完整 | ✅ PASS | ✅ | tags 已移除 |
| 5 | complex-task-decomposition-with-system-engineering | `complex-task-decomposition-with-system-engineering/` | ✅ 完整 | ✅ PASS | ✅ | hooks 已移除（见预案） |
| 6 | cli-integration-sop | `cli-integration-sop/` | ✅ 完整 | ✅ PASS | ✅ | tags 已移除 |
| 7 | strict-test-skill | `strict-test-skill/` | ✅ 完整 | ✅ PASS | ✅ | ✅ 已确认上架（7 个全上） |

## 字段处置记录（对应计划文档 R1/R4 保守方案）

### hooks：已移除（2 个技能）
- `planning-with-files/`：原 frontmatter `hooks:` 块（PreToolUse + Stop）已整块移除，含 `${CLAUDE_PLUGIN_ROOT}` 引用。
- `complex-task-decomposition-with-system-engineering/`：原 frontmatter `hooks:` 块（PreToolUse + Stop，含 `${CLAUDE_PLUGIN_ROOT}`）已整块移除。
- **回填预案**：若 verification-first 试水证实平台支持 hooks 字段，按源文件 `skills/<name>/SKILL.md` 原样恢复 hooks 块，并将占位符改写为：
  - `${CLAUDE_PLUGIN_ROOT}` → `${CODEBUDDY_PLUGIN_ROOT}`
  - 同时检查 `${CLAUDE_SKILL_DIR}` → `${CODEBUDDY_SKILL_DIR}`

### allowed-tools：保留 + 1 处显式探测
- `verification-first/` 显式加入：`allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch`（官方可选字段，作平台解析行为探针）。
- `planning-with-files/` 保留原 allowed-tools（Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch）。
- `complex-task-decomposition-with-system-engineering/` 保留原 allowed-tools（含 Task）。

### tags：已移除（2 个技能）
- `two-agent-loop/`、`cli-integration-sop/` 原 `tags:` 已移除（R4 未知字段保守处置）。

## 已验证项
1. `stigmergy skill validate` 对 7 个 SKILL.md 全部 PASS（exit=0）。
2. 29 个文件全部严格 UTF-8、无 BOM（PowerShell `System.Text.UTF8Encoding($false,$true)` 实测）。
3. frontmatter 读取复核：`name` / `description`(EN) / `description_zh` / `description_en`(EN) / `version` / `display_name` / `category` / `author` 全部就位。
   - author 采用**字符串**形式（`Stigmergy CLI Team`；resumesession / strict-test-skill 保留原 `stigmergy`），不编造 email（package.json 实证 `author: "Stigmergy CLI Team"` 无 email）。
   - frontmatter 内不加注释（试水标记统一放本 manifest）。

## ⚠️ 待平台试水实证（人工动作）
1. 用户提交 verification-first 审核（open.workbuddy.cn）后观察：
   - `allowed-tools` 是否被接受/忽略/拒绝 → 决定其余 6 个是否保留该字段。
   - 未知字段（display_name/category 等）是否被接受。
2. 试水结论 → 决定 hooks 回填 vs 保持移除、tags 是否恢复。
3. strict-test-skill（25 行测试探针技能）→ **用户已确认上架（2026-09-24，7 个全上）**。

## 📌 官方规格复核（2026-09-24 重拉 `open.workbuddy.cn/docs/skill`，R6 落地）

### frontmatter 官方字段表
| 字段 | 必填 | 说明 |
|---|---|---|
| name | 否 | 技能标识 |
| description | **是** | 写清用途和触发词 |
| description_zh | **是** | 简短中文介绍 |
| description_en | **是** | 简短英文介绍 |
| allowed-tools | 否 | 工具白名单（逗号分隔） |
| version | **是** | 版本号 |
| disable-model-invocation | 否 | true 则 AI 不会自动触发，只能用户手动调用 |
| user-invocable | 否 | false 则隐藏菜单，仅供 AI 内部使用 |
| author | **是** | 合作方名称 |

官方示例 frontmatter 额外含 `display_name` / `display_name_en` / `category`（字段表未列，示例即认可）。

### 对照结论
- ✅ 我们已满足全部必填：description / description_zh / description_en / version / author（字符串 `Stigmergy CLI Team`）。
- ✅ `allowed-tools` 官方确认为合法可选字段（逗号分隔）→ verification-first 探测计划不变。
- ✅ **hooks / tags 未出现在官方任何规范中 → 移除决策被官方证实正确**（manifest 回填预案仅保留为"极低概率的兜底"）。
- ✅ display_name / category：官方示例出现 → 保留正确。
- ⚠️ 平台另有 `disable-model-invocation`、`user-invocable` 字段（本批不用，记录备用）。

### zip 打包规范（官方）
```
{skill-name}/
    ├── SKILL.md              # ★ 必须
    ├── references/           # 可选（@references/xxx.md 引用）
    ├── scripts/              # 可选（Bash 执行）
    └── templates/            # 可选
```
- ✅ **结构整改已完成（2026-09-24）**：3 技能暂存副本已按官方结构归位，7 个 zip 已全部打包并实测条目合规：
  - `resumesession/`：resume.js / quick-resume.js / independent-resume.js / opencode-resume.js → `scripts/`；`implementations/` → `scripts/implementations/`；README.md → `references/`；SKILL.md 行 35 `node ./resume.js` → `node ./scripts/resume.js`；`independent-resume.js` homedir 路径（7 处）已加 `scripts/` 前缀。
  - `complex-task-decomposition-with-system-engineering/`：agent_coordinator.sh / context_manager.sh / task_analyzer.sh → `scripts/`；DOCUMENTATION.md / README.md → `references/`（SKILL.md 未引用脚本，无路径改写）。
  - `planning-with-files/`：reference.md / examples.md → `references/`；SKILL.md 两处链接 → `references/` 前缀；templates/ 原已合规（核对通过）。
  - stigmergy 内部元数据：skill.json / package.json / INDEPENDENT_SKILL.md / `__init__.py` → 已移入 `_excluded/resumesession/`，**不打包**。
  - 整改后复验：`stigmergy skill validate` 7/7 PASS（exit=0）；改动的 2 个 SKILL.md 严格 UTF-8、无 BOM。
- 试水包例外：verification-first 仅含 SKILL.md（最小合规包）。
- **7 zip 全部就绪**：`docs/strategy/release/` 下 verification-first / resumesession / planning-with-files / two-agent-loop / complex-task-decomposition-with-system-engineering / cli-integration-sop / strict-test-skill。条目实测：resumesession=7、planning-with-files=8、complex-task=6，其余 = 1（均以 `{skill-name}/SKILL.md` 为顶层）。

### 提审通道（官方确认）
- 控制台【技能市场】→ 右上角【添加技能】→【创建技能】→ 对话补全提示词 → 提交技能 zip 包。
- 解析失败排错：按上述官方结构核对 → 失败则邮件 `openworkbuddy@tencent.com` 或扫码开放平台首页社群。

### 试水包（已就绪）
- `docs/strategy/release/verification-first.zip`（4760 B，内容 = `verification-first/SKILL.md`，官方结构合规）。