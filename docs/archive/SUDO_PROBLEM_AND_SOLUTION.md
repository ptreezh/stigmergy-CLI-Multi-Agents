# Stigmergy CLI Sudo 问题详解

## 目录
1. [为什么之前需要 sudo](#为什么之前需要-sudo)
2. [解决思路](#解决思路)
3. [实现逻辑](#实现逻辑)
4. [代码分析](#代码分析)
5. [对比说明](#对比说明)

---

## 为什么之前需要 sudo?

### 问题根源

npm 的全局安装命令 `npm install -g` 默认会将包安装到**系统目录**：

```bash
# 传统全局安装
npm install -g @anthropic-ai/claude-code

# 安装位置
/usr/local/lib/node_modules/@anthropic-ai/claude-code/
/usr/local/bin/claude  # 符号链接
```

**系统目录权限：**
```
drwxr-xr-x  root root  /usr/local/lib/node_modules/
drwxr-xr-x  root root  /usr/local/bin/
```

这些目录属于 `root` 用户，普通用户**无法写入**，所以需要 sudo：

```bash
# ❌ 普通用户执行
npm install -g @anthropic-ai/claude-code
# 错误: EACCES: permission denied

# ✅ 使用 sudo
sudo npm install -g @anthropic-ai/claude-code
# 成功
```

### 容器环境的问题

在容器环境中（Docker、Podman等）：

1. **通常没有安装 sudo**
   ```bash
   $ which sudo
   # 未找到
   ```

2. **用户不是 root**
   ```bash
   $ whoami
   nodeuser  # 普通用户，不是 root

   $ sudo npm install -g xxx
   # 错误: sudo: command not found
   ```

3. **无法写入系统目录**
   ```bash
   $ npm install -g xxx
   # 错误: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/xxx'
   ```

### Stigmergy 之前的实现

**旧代码** (enhanced_cli_installer.js v1.3.1):

```javascript
async executeUnixElevatedInstallation(toolInfo) {
  // 直接使用 sudo
  const command = `sudo ${toolInfo.install}`;
  // toolInfo.install = "npm install -g @anthropic-ai/claude-code"

  const result = spawnSync('bash', ['-c', command], {
    stdio: 'inherit',
    timeout: this.options.timeout * 2
  });

  // 如果 sudo 不存在，直接失败
  if (result.error?.code === 'ENOENT') {
    throw new Error('sudo not found');
  }
}
```

**问题：**
- 只支持 sudo
- 没有 fallback 机制
- 在容器环境下直接失败

---

## 解决思路

### 核心思想

**将全局包安装到用户目录，而不是系统目录**

### npm 的用户目录安装

npm 支持 `--prefix` 参数指定安装目录：

```bash
# 安装到用户目录
npm install -g --prefix ~/.npm-global @anthropic-ai/claude-code

# 安装位置
~/.npm-global/lib/node_modules/@anthropic-ai/claude-code/
~/.npm-global/bin/claude  # 可执行文件
```

**用户目录权限：**
```
drwxr-xr-x  user user  ~/.npm-global/lib/node_modules/
drwxr-xr-x  user user  ~/.npm-global/bin/
```

这些目录属于当前用户，**不需要 sudo 就可以写入**！

### PATH 配置

安装到用户目录后，需要将 bin 目录添加到 PATH：

```bash
# 添加到 PATH
export PATH="~/.npm-global/bin:$PATH"

# 现在 shell 可以找到 claude 命令
$ which claude
/home/user/.npm-global/bin/claude

$ claude --version
Claude CLI v1.x.x
```

### 三层策略

```
┌─────────────────────────────────────┐
│  尝试检测权限提升工具                │
│  (sudo, doas, run0, pkexec)         │
└─────────────────┬───────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
┌─────────────┐       ┌─────────────┐
│  找到工具    │       │  未找到工具  │
│  使用安装    │       │  使用用户    │
│  sudo/doas  │       │  空间安装    │
└──────┬──────┘       └─────────────┘
       │
       ▼
┌─────────────┐
│ 安装成功?   │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌─────┐ ┌─────────────┐
│ 是  │ │  否         │
└─────┘ │  使用用户    │
        │  空间安装    │
        └─────────────┘
```

---

## 实现逻辑

### 第一层：权限检测

检测系统上有哪些权限提升工具：

```javascript
async setupUnixElevatedContext() {
  // 要检测的工具列表（按优先级排序）
  const privilegeEscalationTools = [
    { name: 'sudo',  testCmd: 'sudo',  testArgs: ['-n', 'true'] },
    { name: 'doas',  testCmd: 'doas',  testArgs: ['-n', 'true'] },
    { name: 'run0',  testCmd: 'run0',  testArgs: ['-n', 'true'] },
    { name: 'pkexec', testCmd: 'pkexec', testArgs: ['--help'] },
  ];

  for (const tool of privilegeEscalationTools) {
    // 尝试运行该工具
    const result = spawnSync(tool.testCmd, tool.testArgs);

    if (result.status === 0) {
      // 找到且可以无密码运行
      return {
        privilegeTool: tool.name,
        requiresPassword: false
      };
    } else if (result.error?.code !== 'ENOENT') {
      // 找到但需要密码
      return {
        privilegeTool: tool.name,
        requiresPassword: true
      };
    }
    // 否则继续尝试下一个工具
  }

  // 没有找到任何工具
  return {
    privilegeTool: null,
    userSpaceOnly: true
  };
}
```

**检测原理：**
- `sudo -n true`: `-n` 表示非交互模式，如果不需要密码则返回 0
- 如果 sudo 不存在，`spawnSync` 返回 `ENOENT` 错误
- 如果 sudo 存在但需要密码，返回非 0 状态码

### 第二层：使用权限工具安装

如果找到了权限提升工具，使用它安装：

```javascript
async executeUnixElevatedInstallation(toolInfo) {
  const permissionSetup = await this.setupPermissions();

  // 如果没有权限工具，直接使用用户空间安装
  if (permissionSetup.userSpaceOnly) {
    return await this.executeUserSpaceInstallation(toolInfo);
  }

  // 使用检测到的工具（sudo/doas/run0/pkexec）
  const privilegeTool = permissionSetup.privilegeTool;
  const command = `${privilegeTool} ${toolInfo.install}`;

  const result = spawnSync('bash', ['-c', command]);

  if (result.status === 0) {
    return { success: true };  // 成功
  } else {
    // 失败，回退到用户空间安装
    return await this.executeUserSpaceInstallation(toolInfo);
  }
}
```

### 第三层：用户空间安装

如果没有权限工具，或者权限工具失败，使用用户空间安装：

```javascript
async executeUserSpaceInstallation(toolInfo) {
  const os = require('os');
  const path = require('path');

  // 1. 确定用户目录
  let userNpmDir = process.env.NPM_CONFIG_PREFIX ||
                    path.join(os.homedir(), '.npm-global');

  // 2. 创建目录（如果不存在）
  const fs = require('fs');
  if (!fs.existsSync(userNpmDir)) {
    fs.mkdirSync(userNpmDir, { recursive: true, mode: 0o755 });
  }

  // 3. 解析包名
  // toolInfo.install = "npm install -g @anthropic-ai/claude-code"
  const installMatch = toolInfo.install.match(/npm\s+(?:install|upgrade)\s+(?:-g\s+)?(.+)/);
  const packageName = installMatch[1].trim();  // "@anthropic-ai/claude-code"

  // 4. 构建用户空间安装命令
  const userCommand = `npm install -g --prefix "${userNpmDir}" ${packageName}`;

  // 5. 设置 PATH 环境变量
  const env = {
    ...process.env,
    PATH: `${path.join(userNpmDir, 'bin')}:${process.env.PATH}`
  };

  // 6. 执行安装
  const result = spawnSync('bash', ['-c', userCommand], {
    env: env,
    timeout: this.options.timeout * 3
  });

  if (result.status === 0) {
    // 7. 配置 PATH
    const binDir = path.join(userNpmDir, 'bin');
    await this.addPathToShellConfig(binDir);

    return { success: true, userSpace: true, binDir };
  } else {
    return { success: false, error: 'Installation failed' };
  }
}
```

### PATH 配置

自动将 bin 目录添加到 shell 配置文件：

```javascript
async addPathToShellConfig(binDir) {
  const shellConfigs = [
    { file: '~/.bashrc', marker: '# Stigmergy CLI PATH' },
    { file: '~/.zshrc',  marker: '# Stigmergy CLI PATH' },
    { file: '~/.profile', marker: '# Stigmergy CLI PATH' },
  ];

  const pathLine = `export PATH="${binDir}:$PATH"\n`;

  for (const config of shellConfigs) {
    let content = '';
    try {
      content = await fs.readFile(config.file, 'utf8');
    } catch {
      // 文件不存在，会创建
    }

    // 检查是否已经添加过（避免重复）
    if (content.includes(config.marker)) {
      continue;
    }

    // 添加 PATH 配置
    await fs.appendFile(config.file, `\n${config.marker}\n${pathLine}`);
  }
}
```

**添加的内容：**
```bash
# ~/.bashrc
# Stigmergy CLI PATH
export PATH="/home/user/.npm-global/bin:$PATH"
```

---

## 代码分析

### 关键文件

**src/core/enhanced_cli_installer.js**

| 方法 | 行数 | 功能 |
|------|------|------|
| `setupUnixElevatedContext()` | 221-285 | 检测权限提升工具 |
| `executeUnixElevatedInstallation()` | 473-506 | 执行权限提升安装 |
| `executeUserSpaceInstallation()` | 511-574 | 执行用户空间安装 |
| `addPathToShellConfig()` | 579-613 | 配置 PATH |

### 数据流图

```
用户执行: stigmergy install claude
        ↓
installTool('claude', toolInfo)
        ↓
executeInstallation(toolInfo)
        ↓
executeElevatedInstallation(toolInfo)
        ↓
executeUnixElevatedInstallation(toolInfo)
        ↓
setupPermissions()
        ↓
setupUnixElevatedContext()
        ↓
检测: sudo? doas? run0? pkexec?
        ↓
        ├─ 找到工具 → executeUnixElevatedInstallation()
        │                         ↓
        │                  使用该工具安装
        │                         ↓
        │                  成功? ─→ 是 → 完成
        │                         ↓
        │                        否
        │                         ↓
        └─ 未找到/失败 ─────→ executeUserSpaceInstallation()
                                      ↓
                              安装到 ~/.npm-global
                                      ↓
                              addPathToShellConfig()
                                      ↓
                                    完成
```

---

## 对比说明

### 之前 vs 现在

| 方面 | 之前 (v1.3.1) | 现在 (v1.3.2) |
|------|---------------|---------------|
| **权限检测** | 只支持 sudo | 支持 sudo, doas, run0, pkexec |
| **容器支持** | ❌ 不支持 | ✅ 完全支持 |
| **失败处理** | 直接报错 | 自动回退到用户空间安装 |
| **PATH 配置** | 需要手动配置 | 自动配置 |
| **用户友好** | ❌ 差 | ✅ 好 |
| **适用场景** | 有 sudo 的系统 | 任何 Linux/Unix 系统 |

### 安装命令对比

**场景 1: Ubuntu Desktop (有密码less sudo)**

| 版本 | 命令 | 结果 |
|------|------|------|
| v1.3.1 | `sudo npm install -g @anthropic-ai/claude-code` | ✅ 成功 |
| v1.3.2 | `sudo npm install -g @anthropic-ai/claude-code` | ✅ 成功 (相同) |

**场景 2: Docker 容器 (无 sudo)**

| 版本 | 命令 | 结果 |
|------|------|------|
| v1.3.1 | `sudo npm install -g @anthropic-ai/claude-code` | ❌ 失败: sudo not found |
| v1.3.2 | `npm install -g --prefix ~/.npm-global @anthropic-ai/claude-code` | ✅ 成功 |

**场景 3: Arch Linux (有 doas)**

| 版本 | 命令 | 结果 |
|------|------|------|
| v1.3.1 | `sudo npm install -g @anthropic-ai/claude-code` | ❌ 失败: sudo not found |
| v1.3.2 | `doas npm install -g @anthropic-ai/claude-code` | ✅ 成功 |

### 目录结构对比

**系统安装 (需要 sudo)**

```
/usr/local/
├── lib/
│   └── node_modules/
│       └── @anthropic-ai/
│           └── claude-code/
└── bin/
    └── claude  -> ../lib/node_modules/@anthropic-ai/claude-code/bin/claude.js
```

**用户空间安装 (无需 sudo)**

```
~/.npm-global/
├── lib/
│   └── node_modules/
│       └── @anthropic-ai/
│           └── claude-code/
└── bin/
    └── claude  -> ../lib/node_modules/@anthropic-ai/claude-code/bin/claude.js
```

**结构完全相同，只是位置不同！**

---

## 总结

### 核心原理

1. **npm 的 -g 参数的本质**:
   ```bash
   npm install -g <package>
   # 等价于
   npm install --prefix $(npm config get prefix) -g <package>
   ```

2. **npm prefix 的默认值**:
   ```bash
   # 系统安装
   npm config get prefix
   # 输出: /usr/local

   # 用户安装（配置后）
   npm config set prefix ~/.npm-global
   npm config get prefix
   # 输出: /home/user/.npm-global
   ```

3. **--prefix 参数的作用**:
   ```bash
   # 临时改变安装位置
   npm install -g --prefix ~/.npm-global <package>
   # 安装到 ~/.npm-global/lib/node_modules/
   ```

### 为什么这样可以工作？

1. **npm 的设计**:
   - npm 支持自定义安装位置
   - `-g` 只是表示"全局可访问"，不是"必须安装到系统目录"

2. **PATH 的作用**:
   - Shell 在 PATH 中查找命令
   - 只要 bin 目录在 PATH 中，任何位置都可以

3. **用户目录的权限**:
   - 用户对自己的 home 目录有完全权限
   - 不需要 root 就可以创建文件和目录

### 最佳实践

**推荐配置（一次性设置）**:

```bash
# 1. 配置 npm 使用用户目录
npm config set prefix '~/.npm-global'

# 2. 添加到 PATH（一次性）
echo 'export PATH="~/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 3. 现在所有安装都不需要 sudo
npm install -g @anthropic-ai/claude-code  # ✅ 无需 sudo
npm install -g @google/gemini-cli         # ✅ 无需 sudo
npm install -g @qwen/cli                  # ✅ 无需 sudo
```

---

**更新日期**: 2025-12-24
**版本**: 1.3.2-beta.0
**作者**: Stigmergy CLI Team
