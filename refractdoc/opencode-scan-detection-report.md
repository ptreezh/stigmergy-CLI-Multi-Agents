# Stigmergy 对 OpenCode 扫描检测报告

## 检测日期
2026年1月13日

## 检测结果总结
**❌ OpenCode 扫描配置不完整**

## 问题描述

Stigmergy 系统虽然已经定义了 OpenCode 的配置信息，但在 CLI 路径检测器（CLIPathDetector）中缺少必要的配置，导致扫描功能无法正确检测 OpenCode。

## 发现的问题

### 1. CLI 配置存在但映射缺失

**文件位置：** `src/core/cli_tools.js`

OpenCode 的配置已正确定义：
```javascript
opencode: {
  name: 'OpenCode AI CLI',
  version: 'opencode --version',
  install: 'npm install -g opencode-ai',
  hooksDir: path.join(os.homedir(), '.opencode', 'hooks'),
  config: path.join(os.homedir(), '.opencode', 'config.json'),
  autoInstall: false,
}
```

**文件位置：** `src/core/cli_path_detector.js:24-35`

但在 `cliNameMap` 中缺少 OpenCode 的映射：

```javascript
this.cliNameMap = {
  'claude': ['claude'],
  'gemini': ['gemini'],
  'qwen': ['qwen'],
  'iflow': ['iflow'],
  'qodercli': ['qodercli'],
  'codebuddy': ['codebuddy'],
  'copilot': ['copilot'],
  'codex': ['codex'],
  'kode': ['kode'],
  'resumesession': ['resumesession']
  // ❌ 缺少 'opencode': ['opencode']
  // ❌ 缺少 'oh-my-opencode': ['oh-my-opencode']
};
```

### 2. 扫描逻辑依赖 cliNameMap

**文件位置：** `src/core/cli_tools.js:415-472`

扫描函数 `scanForTools()` 使用以下逻辑：
1. 调用 `detector.detectAllCLIPaths()` 检测所有 CLI 路径
2. 遍历检测到的路径
3. 检查 CLI 是否可执行

**文件位置：** `src/core/cli_path_detector.js:314`

`detectAllCLIPaths()` 函数遍历 `cliNameMap` 中的工具名称：
```javascript
for (const toolName of Object.keys(this.cliNameMap)) {
  // 检测逻辑
}
```

由于 `opencode` 不在 `cliNameMap` 中，因此：
- ✅ OpenCode 配置存在
- ❌ OpenCode 不会被扫描
- ❌ OpenCode 不会被检测到

### 3. 其他相关配置

以下文件中已包含 OpenCode 相关配置：

**文件：** `src/core/skills/StigmergySkillManager.js:173-174`
```javascript
'opencode.md',    // OpenCode CLI
'oh-my-opencode.md' // Oh-My-OpenCode Plugin Manager
```

**文件：** `src/core/coordination/nodejs/HookDeploymentManager.js:24-25`
```javascript
'opencode',
'oh-my-opencode'
```

**文件：** `src/core/coordination/nodejs/CLIIntegrationManager.js:75-88`
```javascript
opencode: {
  name: 'OpenCode AI CLI',
  executable: 'opencode',
  skills: [
    'on_skill_invocation',
    'on_code_generation',
    'on_cross_cli_task',
  ],
},
'oh-my-opencode': {
  name: 'Oh-My-OpenCode Plugin Manager',
  executable: 'oh-my-opencode',
  plugins: [
    'on_plugin_install',
    'on_plugin_load',
    'on_cross_cli_integration',
  ],
}
```

## 影响范围

### 受影响功能
1. ❌ `stigmergy scan` 命令不会检测 OpenCode
2. ❌ `stigmergy status` 命令不会显示 OpenCode 状态
3. ❌ OpenCode 的 hooks 部署可能不完整
4. ❌ Cross-CLI 通信无法路由到 OpenCode

### 不受影响功能
1. ✅ OpenCode 配置已存在于 cli_tools.js
2. ✅ OpenCode 技能管理器配置正确
3. ✅ OpenCode 集成管理器配置正确
4. ✅ OpenCode Hook 部署管理器配置正确

## 修复建议

### 方案 1：添加到 cliNameMap（推荐）

在 `src/core/cli_path_detector.js` 的 `cliNameMap` 中添加 OpenCode：

```javascript
this.cliNameMap = {
  'claude': ['claude'],
  'gemini': ['gemini'],
  'qwen': ['qwen'],
  'iflow': ['iflow'],
  'qodercli': ['qodercli'],
  'codebuddy': ['codebuddy'],
  'copilot': ['copilot'],
  'codex': ['codex'],
  'kode': ['kode'],
  'resumesession': ['resumesession'],
  'opencode': ['opencode'],              // ✅ 添加这行
  'oh-my-opencode': ['oh-my-opencode']   // ✅ 添加这行
};
```

### 方案 2：动态生成 cliNameMap

修改 `CLIPathDetector` 构造函数，从 `CLI_TOOLS` 配置动态生成 `cliNameMap`：

```javascript
constructor() {
  // ... 其他初始化代码

  // 动态从 CLI_TOOLS 生成 cliNameMap
  this.cliNameMap = {};
  const { CLI_TOOLS } = require('./cli_tools');
  for (const [toolName] of Object.entries(CLI_TOOLS)) {
    this.cliNameMap[toolName] = [toolName];
  }
}
```

## 验证步骤

修复后，可以通过以下步骤验证：

1. **检查扫描结果**
   ```bash
   stigmergy scan
   ```
   应该能看到 OpenCode 在已安装工具列表中（如果已安装）

2. **检查状态**
   ```bash
   stigmergy status
   ```
   应该能看到 OpenCode 的状态信息

3. **测试 Cross-CLI 通信**
   ```bash
   stigmergy opencode "test message"
   ```
   应该能够成功路由到 OpenCode

## 当前环境状态

- **操作系统：** Windows 10 (win32)
- **Node.js 版本：** v22.14.0
- **OpenCode 安装状态：** 未安装（`where opencode` 未找到）
- **Stigmergy 版本：** 1.3.1

## 结论

Stigmergy 对 OpenCode 的扫描配置**不完整**。虽然 OpenCode 的配置信息已在多个文件中正确定义，但关键的 CLI 路径检测器（CLIPathDetector）中缺少 `opencode` 和 `oh-my-opencode` 的名称映射，导致扫描功能无法检测到这些工具。

**建议优先级：高**
**修复难度：低**（只需添加两行配置）

## 附录：相关文件清单

1. `src/core/cli_tools.js` - OpenCode 配置定义 ✅
2. `src/core/cli_path_detector.js` - CLI 路径检测器 ❌ 缺少映射
3. `src/core/skills/StigmergySkillManager.js` - 技能管理器 ✅
4. `src/core/coordination/nodejs/HookDeploymentManager.js` - Hook 部署 ✅
5. `src/core/coordination/nodejs/CLIIntegrationManager.js` - 集成管理器 ✅
6. `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js` - ResumeSession 生成器 ✅
7. `RELEASE_NOTES_v1.3.19-beta.0.md` - 发布说明 ✅