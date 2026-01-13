# OpenCode 在 Stigmergy 中的实现细节

## 概述

本文档详细说明 Stigmergy 如何获取 OpenCode 的安装路径、帮助信息、配置技能以及历史会话信息。

---

## 1. 获取 OpenCode 安装路径

### 配置文件位置

**文件：** `src/core/cli_tools.js:89-94`

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

### 路径检测机制

**文件：** `src/core/cli_path_detector.js:24-34`

首先在 `cliNameMap` 中注册 OpenCode：

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
  'opencode': ['opencode']  // ✅ 已添加
};
```

### 检测流程

**文件：** `src/core/cli_path_detector.js:213-272`

`detectCLIPath()` 方法使用多种方法检测 OpenCode 路径：

#### 方法 0：通过 npm 获取实际全局安装路径（最优先）

```javascript
async findCommandViaNPM(command) {
  try {
    // 获取 npm 全局前缀
    const npmPrefixResult = spawnSync('npm', ['config', 'get', 'prefix'], {
      encoding: 'utf8',
      shell: true
    });

    if (npmPrefixResult.status === 0 && npmPrefixResult.stdout.trim()) {
      const npmPrefix = npmPrefixResult.stdout.trim();
      let binDir;

      if (this.platform === 'win32') {
        binDir = npmPrefix; // Windows: 前缀直接指向可执行文件目录
      } else {
        binDir = path.join(npmPrefix, 'bin'); // Unix: bin 子目录
      }

      const commandPath = this.checkCommandInDir(command, binDir);
      if (commandPath) {
        return commandPath;
      }
    }
  } catch (error) {
    // 忽略错误
  }
}
```

#### 方法 1：检查系统 PATH

```javascript
pathFound = this.findCommandInPath(command);
if (pathFound) {
  console.log(`[DETECTOR] Found ${toolName} in PATH: ${pathFound}`);
  return pathFound;
}
```

#### 方法 2：检查 npm 全局目录

```javascript
pathFound = this.findCommandInNPMGlobal(command);
if (pathFound) {
  console.log(`[DETECTOR] Found ${toolName} in npm global: ${pathFound}`);
  return pathFound;
}
```

#### 方法 3：检查常见安装位置

**Windows:**
```javascript
const userNPMPath = path.join(os.homedir(), 'AppData', 'Roaming', 'npm');
pathFound = this.checkCommandInDir(command, userNPMPath);
```

**Unix-like:**
```javascript
const unixPaths = [
  path.join(os.homedir(), '.npm-global', 'bin'),
  path.join(os.homedir(), '.npm', 'bin'),
  '/usr/local/bin',
  '/usr/bin',
  path.join(os.homedir(), '.local', 'bin'),
  '/root/.npm-global/bin',
  '/root/.npm/bin'
];
```

### 路径缓存

**文件：** `src/core/cli_path_detector.js:275-310`

检测到的路径会被缓存到 `~/.stigmergy/cli-paths/detected-paths.json`：

```javascript
async loadDetectedPaths() {
  try {
    if (fs.existsSync(this.pathCacheFile)) {
      const data = await fs.readFile(this.pathCacheFile, 'utf8');
      this.detectedPaths = JSON.parse(data);
      return true;
    }
  } catch (error) {
    // 忽略错误
  }
  return false;
}

async saveDetectedPaths() {
  try {
    await fs.mkdir(this.configDir, { recursive: true });
    await fs.writeFile(
      this.pathCacheFile,
      JSON.stringify(this.detectedPaths, null, 2),
      'utf8'
    );
  } catch (error) {
    // 忽略错误
  }
}
```

---

## 2. 获取 OpenCode 帮助信息

### 帮助信息获取机制

**文件：** `src/core/cli_help_analyzer.js:467-515`

`getHelpInfo()` 方法获取帮助信息：

```javascript
async getHelpInfo(cliName, cliConfig) {
  const helpMethods = [
    ['--help'],  // 最常用
    ['-h'],      // 常用
  ];

  let rawHelp = '';
  let version = 'unknown';
  let method = 'unknown';

  // 尝试不同的帮助命令
  for (const helpArgs of helpMethods) {
    try {
      const result = spawnSync(cliName, helpArgs, {
        encoding: 'utf8',
        timeout: 5000,
        shell: true,
      });

      if (result.status === 0 && result.stdout) {
        rawHelp = result.stdout;
        method = `${cliName} ${helpArgs.join(' ')}`;
        break;
      } else if (result.stderr) {
        rawHelp = result.stderr;
        method = `${cliName} ${helpArgs.join(' ')} (stderr)`;
        break;
      }
    } catch (error) {
      // 尝试下一个方法
      continue;
    }
  }

  // 单独获取版本信息
  if (cliConfig.version) {
    try {
      const versionCmd = cliConfig.version.split(' ');
      const versionResult = spawnSync(versionCmd[0], versionCmd.slice(1), {
        encoding: 'utf8',
        timeout: 3000,
        shell: true,
      });

      if (versionResult.status === 0) {
        version = versionResult.stdout.trim() || versionResult.stderr.trim();
      }
    } catch (error) {
      // 使用默认版本
    }
  }

  return {
    rawHelp,
    version,
    method,
    cliName
  };
}
```

### 执行流程

1. **尝试 `opencode --help`**
2. **如果失败，尝试 `opencode -h`**
3. **获取版本信息：`opencode --version`**
4. **返回结构化数据**

---

## 3. 获取 OpenCode 配置的 Skills

### Skill 扫描机制

**文件：** `src/core/local_skill_scanner.js`

Stigmergy 通过扫描 OpenCode 的配置目录来获取技能信息：

#### 扫描目录

```javascript
async scanAll() {
  const cliTools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy',
                    'qodercli', 'copilot', 'codex'];
  const results = {
    skills: {},
    agents: {},
    timestamp: new Date().toISOString()
  };

  for (const cli of cliTools) {
    const cliConfigPath = path.join(os.homedir(), `.${cli}`);
    const skillsPath = path.join(cliConfigPath, 'skills');
    const agentsPath = path.join(cliConfigPath, 'agents');

    results.skills[cli] = await this.scanDirectory(skillsPath, 'skill');
    results.agents[cli] = await this.scanDirectory(agentsPath, 'agent');
  }

  return results;
}
```

#### OpenCode 特定配置

**文件：** `src/core/cli_tools.js:93-94`

```javascript
hooksDir: path.join(os.homedir(), '.opencode', 'hooks'),
config: path.join(os.homedir(), '.opencode', 'config.json'),
```

**但是**，OpenCode 的技能配置路径应该是：

```javascript
skillsPath = path.join(os.homedir(), '.opencode', 'skills')
agentsPath = path.join(os.homedir(), '.opencode', 'agents')
```

### Skill 元数据提取

**文件：** `src/core/local_skill_scanner.js:285-335`

扫描器会查找以下文件来提取技能元数据：

1. **SKILL.md**（优先）
2. **README.md**（备选）
3. **AGENT.md**（用于智能体）

```javascript
async readSkillMetadata(itemPath, skillMdPath, readmePath) {
  try {
    let content = '';
    let sourceFile = '';

    // 优先尝试 SKILL.md
    try {
      content = await fs.readFile(skillMdPath, 'utf8');
      sourceFile = 'SKILL.md';
    } catch {
      // 尝试 README.md
      try {
        content = await fs.readFile(readmePath, 'utf8');
        sourceFile = 'README.md';
      } catch {
        return null;
      }
    }

    // 提取元数据
    const metadata = {
      name: this.extractName(content, path.basename(itemPath)),
      description: this.extractDescription(content),
      capabilities: this.extractCapabilities(content),
      usage: this.extractUsage(content),
      sourceFile
    };

    return metadata;
  } catch (error) {
    return null;
  }
}
```

### 技能缓存

**文件：** `src/core/local_skill_scanner.js:23-70`

扫描结果会被缓存到 `~/.stigmergy/cache/skills-agents-cache.json`：

```javascript
async initialize(forceRefresh = false) {
  if (this.initialized && !forceRefresh) {
    return this.scanResults;
  }

  // 确保缓存目录存在
  try {
    await fs.mkdir(this.cacheDir, { recursive: true });
  } catch (error) {
    // 忽略错误
  }

  // 尝试从缓存加载（无过期时间）
  if (!forceRefresh) {
    const cached = await this.loadFromCache();
    if (cached) {
      this.scanResults = cached;
      this.initialized = true;
      return this.scanResults;
    }
  }

  // 缓存未命中，执行扫描
  const results = await this.scanAll();
  await this.saveToCache(results);
  this.scanResults = results;
  this.initialized = true;

  return this.scanResults;
}
```

---

## 4. OpenCode 历史会话信息

### 会话路径配置

**文件：** `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js:32-47`

ResumeSession 生成器为每个 CLI 定义了会话路径：

```javascript
const getAllCLISessionPaths = () => {
  const homeDir = os.homedir();
  return {
    claude: [path.join(homeDir, '.claude', 'projects')],
    gemini: [path.join(homeDir, '.config', 'gemini', 'tmp')],
    qwen: [path.join(homeDir, '.qwen', 'projects')],
    iflow: [path.join(homeDir, '.iflow', 'projects')],
    qodercli: [path.join(homeDir, '.qoder', 'projects')],
    codebuddy: [path.join(homeDir, '.codebuddy')],
    codex: [path.join(homeDir, '.config', 'codex')],
    kode: [path.join(homeDir, '.kode', 'projects')]
    // ❌ 缺少 opencode 的会话路径配置
  };
};
```

### 问题：OpenCode 会话路径未配置

**当前状态：** OpenCode 的会话路径配置缺失。

**需要添加：**

```javascript
opencode: [path.join(homeDir, '.opencode', 'sessions')]
```

或根据 OpenCode 的实际会话存储位置进行调整。

### 会话扫描机制

**文件：** `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js:49-137`

`SessionScanner` 类负责扫描会话：

```javascript
class SessionScanner {
  scanSessions(cliType, sessionsPath, projectPath) {
    const sessions = [];
    if (!sessionsPath || !projectPath) return sessions;

    try {
      if (!fs.existsSync(sessionsPath)) return sessions;

      // 对于 IFlow, Claude, QoderCLI, Kode: 扫描 projects 子目录
      if ((cliType === 'iflow' || cliType === 'claude' ||
           cliType === 'qodercli' || cliType === 'kode') &&
          sessionsPath.includes('projects')) {
        const subdirs = fs.readdirSync(sessionsPath);
        for (const subdir of subdirs) {
          const subdirPath = path.join(sessionsPath, subdir);
          try {
            const stat = fs.statSync(subdirPath);
            if (stat.isDirectory()) {
              sessions.push(...this.scanSessionFiles(cliType, subdirPath, projectPath));
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // 对于 Gemini: 扫描 tmp/<hash>/chats 子目录
      if (cliType === 'gemini' && sessionsPath.includes('tmp')) {
        const hashDirs = fs.readdirSync(sessionsPath);
        for (const hashDir of hashDirs) {
          const hashDirPath = path.join(sessionsPath, hashDir);
          try {
            const stat = fs.statSync(hashDirPath);
            if (stat.isDirectory()) {
              const chatsPath = path.join(hashDirPath, 'chats');
              sessions.push(...this.scanSessionFiles(cliType, chatsPath, projectPath));
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // 默认：直接扫描目录
      return this.scanSessionFiles(cliType, sessionsPath, projectPath);
    } catch (error) {
      console.warn(`Warning: Could not scan ${cliType} sessions:`, error.message);
      return sessions;
    }
  }

  scanSessionFiles(cliType, sessionsPath, projectPath) {
    const sessions = [];
    const files = fs.readdirSync(sessionsPath);

    // 过滤会话文件
    if (file.endsWith('.json') || file.endsWith('.session') || file.endsWith('.jsonl')) {
      const filePath = path.join(sessionsPath, file);
      let sessionData;

      try {
        const content = fs.readFileSync(filePath, 'utf8');

        if (file.endsWith('.jsonl')) {
          const messages = content.trim().split('\n').map(line => JSON.parse(line));
          sessionData = this.parseJSONLSession(messages, file);
        } else {
          sessionData = JSON.parse(content);
        }

        // 检查是否是项目会话
        if (this.isProjectSession(sessionData, projectPath)) {
          sessions.push({
            cliType,
            sessionId: sessionData.id || sessionData.sessionId || file.replace(/\.(json|session|jsonl)$/, ''),
            title: sessionData.title || sessionData.topic || 'Untitled',
            content: this.extractContent(sessionData),
            updatedAt: new Date(sessionData.updatedAt || sessionData.timestamp || fs.statSync(filePath).mtime),
            messageCount: sessionData.messageCount || this.countMessages(sessionData),
            filePath
          });
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    return sessions;
  }
}
```

### 会话查询

**文件：** `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js:469-530`

`HistoryQuery` 类提供会话查询功能：

```javascript
class HistoryQuery {
  queryHistory(options, projectPath) {
    const allSessions = this.scanner.scanAllCLISessions(projectPath);
    const filteredSessions = this.filter.applyFilters(allSessions, options, projectPath);
    const response = this.formatter.formatSummary(filteredSessions);
    const suggestions = this.generateSuggestions(filteredSessions, options);

    return {
      response,
      suggestions,
      sessionCount: filteredSessions.length
    };
  }
}
```

---

## 5. 集成管理

### CLI 集成配置

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

### Hook 部署

**文件：** `src/core/coordination/nodejs/HookDeploymentManager.js:24-25`

```javascript
'opencode',
'oh-my-opencode'
```

### ResumeSession 扩展

**文件：** `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js:10-11`

```javascript
'iflow', 'qodercli', 'copilot', 'kode', 'opencode',
'oh-my-opencode', 'resumesession'
```

---

## 6. 需要修复的问题

### 问题 1：会话路径配置缺失 ✅ 已修复路径检测

**位置：** `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js:32-47`

**当前状态：** 缺少 opencode 的会话路径配置

**需要添加：**

```javascript
opencode: [path.join(homeDir, '.opencode', 'sessions')]
```

### 问题 2：技能扫描未包含 opencode ✅ 已修复路径检测

**位置：** `src/core/local_skill_scanner.js:220-235`

**当前状态：** `cliTools` 数组中未包含 'opencode'

**需要添加：**

```javascript
const cliTools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy',
                  'qodercli', 'copilot', 'codex', 'opencode'];
```

---

## 7. 总结

| 功能 | 实现状态 | 文件位置 |
|------|---------|---------|
| 安装路径检测 | ✅ 已修复 | `src/core/cli_path_detector.js:34` |
| 帮助信息获取 | ✅ 已实现 | `src/core/cli_help_analyzer.js:467-515` |
| 技能配置扫描 | ❌ 需要修复 | `src/core/local_skill_scanner.js:220-235` |
| 历史会话信息 | ❌ 需要修复 | `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js:32-47` |
| CLI 集成管理 | ✅ 已实现 | `src/core/coordination/nodejs/CLIIntegrationManager.js:75-88` |
| Hook 部署 | ✅ 已实现 | `src/core/coordination/nodejs/HookDeploymentManager.js:24-25` |

---

## 8. 建议的修复步骤

1. ✅ **已完成**：在 `cliNameMap` 中添加 opencode
2. ⏳ **待修复**：在 `getAllCLISessionPaths()` 中添加 opencode 会话路径
3. ⏳ **待修复**：在 `scanAll()` 的 `cliTools` 数组中添加 opencode
4. ⏳ **待测试**：验证所有功能是否正常工作