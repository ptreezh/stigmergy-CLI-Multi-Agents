# CLI工具自动化权限安装分析

## 🔍 当前CLI安装流程分析

### 现状
```javascript
// 当前安装流程
1. stigmergy install 命令
2. 扫描缺失的CLI工具
3. 对每个工具执行: npm install -g @package/name
4. 如果遇到权限错误 -> 安装失败
```

### 存在的权限问题
```bash
# 用户遇到的问题：
npm install -g @anthropic-ai/claude-code
# ❌ npm ERR! code EPERM
# ❌ npm ERR! permission denied
# ❌ 无法写入全局npm目录
```

## 🚨 问题分析

### 1. **CLI工具安装的权限挑战**
每个CLI工具都需要全局安装权限：
```bash
npm install -g @anthropic-ai/claude-code    # Claude CLI
npm install -g @google/gemini-cli          # Gemini CLI
npm install -g @qwen-code/qwen-code         # Qwen CLI
npm install -g @iflow-ai/iflow-cli          # iFlow CLI
npm install -g @qoder-ai/qodercli           # Qoder CLI
npm install -g @tencent-ai/codebuddy-code   # CodeBuddy CLI
npm install -g @github/copilot              # GitHub Copilot CLI
npm install -g @openai/codex                # OpenAI Codex CLI
```

### 2. **当前系统的局限性**
```javascript
// 当前的安装方法只处理了stigmergy本身的权限
// 但没有处理各个CLI工具的权限问题

async installTool(toolName, toolInfo, retryCount = 0) {
  // ❌ 问题：直接执行npm install，没有权限检查
  const result = spawnSync('npm', ['-g', 'install', packageName], {
    env: {
      npm_config_prefix: process.env.npm_config_prefix, // 只设置了前缀
      // 但没有确保用户有权限写入这个前缀目录
    }
  });
}
```

## 💡 自动化权限解决方案

### 方案1：智能权限检测和自动提升
```javascript
class AutoPermissionCLIInstaller extends EnhancedCLIInstaller {
  async installToolWithPermission(toolName, toolInfo) {
    // 1. 尝试标准安装
    let result = await this.attemptInstallation(toolInfo);

    if (result.success) {
      return result;
    }

    // 2. 检测是否是权限问题
    if (this.isPermissionError(result.error)) {
      console.log(`🔧 检测到权限问题，尝试自动处理...`);

      // 3. 根据平台自动处理权限
      const permissionResult = await this.handlePermissionForInstallation();

      if (permissionResult.success) {
        // 4. 重新尝试安装
        result = await this.attemptInstallation(toolInfo);
      }
    }

    return result;
  }

  async handlePermissionForInstallation() {
    const platform = process.platform;

    switch (platform) {
      case 'win32':
        return this.handleWindowsPermission();
      case 'darwin':
      case 'linux':
        return this.handleUnixPermission();
    }
  }

  async handleWindowsPermission() {
    // Windows: 检查是否是管理员权限，尝试重新启动管理员PowerShell
    const isAdmin = await this.checkWindowsAdmin();

    if (!isAdmin) {
      console.log('⚠️  需要管理员权限安装CLI工具');
      console.log('🔧 正在尝试重新以管理员权限安装...');

      return this.reinstallWithWindowsAdmin();
    }

    return { success: true };
  }

  async handleUnixPermission() {
    // macOS/Linux: 使用sudo重新安装
    console.log('⚠️  需要管理员权限安装CLI工具');
    console.log('🔧 正在使用sudo重新安装...');

    return this.reinstallWithSudo();
  }
}
```

### 方案2：跨平台自动化权限提升
```javascript
class CrossPlatformPermissionInstaller {
  async installCLIWithAutoPermission(toolInfo) {
    const installCommand = toolInfo.install; // "npm install -g @package/name"

    // 尝试标准安装
    const standardResult = await this.executeCommand(installCommand);
    if (standardResult.success) {
      return standardResult;
    }

    // 检测权限问题
    if (this.isPermissionError(standardResult.error)) {
      console.log(`🔧 检测到权限问题，自动使用提升权限安装...`);

      // 根据平台使用适当的权限提升方式
      const elevatedCommand = this.getElevatedCommand(installCommand);
      return await this.executeCommand(elevatedCommand);
    }

    return standardResult;
  }

  getElevatedCommand(originalCommand) {
    const platform = process.platform;

    switch (platform) {
      case 'win32':
        // Windows: 创建管理员PowerShell脚本并执行
        return this.createWindowsAdminCommand(originalCommand);

      case 'darwin':
      case 'linux':
        // macOS/Linux: 在命令前添加sudo
        return `sudo ${originalCommand}`;

      default:
        return originalCommand;
    }
  }

  createWindowsAdminCommand(originalCommand) {
    // 创建临时PowerShell脚本
    const scriptPath = path.join(os.tmpdir(), 'stigmergy-install.ps1');
    const scriptContent = `
      Start-Process PowerShell -Verb RunAs -ArgumentList "-Command ${originalCommand}" -Wait
    `;

    fs.writeFileSync(scriptPath, scriptContent);
    return `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
  }
}
```

### 方案3：集成到现有的stigmergy install命令
```javascript
// 修改 src/cli/router.js 中的install case
case 'install':
case 'inst':
  const { missing: missingTools } = await installer.scanCLI();

  if (Object.keys(missingTools).length === 0) {
    console.log('[INFO] All AI CLI tools are already installed!');
    return;
  }

  console.log(`\n[AUTO-INSTALL] Installing ${Object.keys(missingTools).length} missing AI CLI tools...`);

  // 使用新的自动权限安装器
  const autoPermInstaller = new AutoPermissionCLIInstaller({
    verbose: process.env.DEBUG === 'true'
  });

  const selectedTools = Object.keys(missingTools);
  const installResult = await autoPermInstaller.installWithAutoPermission(selectedTools, missingTools);

  if (installResult.success) {
    console.log(`\n[SUCCESS] Installed ${installResult.successCount} AI CLI tools!`);

    // 显示权限处理结果
    if (installResult.permissionHandled) {
      console.log('✅ 权限问题已自动处理');
    }
  } else {
    console.log('\n[WARN] Some tools may not have installed successfully.');
    // 提供手动指导
    console.log('💡 如果遇到权限问题，请尝试:');
    console.log('   Windows: 以管理员身份运行PowerShell，然后执行 stigmergy install');
    console.log('   macOS/Linux: sudo stigmergy install');
  }
  break;
```

## 🎯 推荐的集成方案

### 1. **升级现有的EnhancedCLIInstaller**
```javascript
// 在 src/core/enhanced_cli_installer.js 中添加权限处理
async installTool(toolName, toolInfo, retryCount = 0) {
  this.log('info', `Installing ${toolInfo.name} (${toolName})...`);

  try {
    // 首先尝试标准安装
    const standardResult = await this.attemptStandardInstallation(toolInfo);
    if (standardResult.success) {
      return true;
    }

    // 如果标准安装失败，检查是否是权限问题
    if (this.isPermissionError(standardResult.error)) {
      this.log('warn', `Permission error detected for ${toolInfo.name}, attempting auto-escalation...`);

      // 尝试自动权限提升安装
      const elevatedResult = await this.attemptElevatedInstallation(toolInfo);
      return elevatedResult.success;
    }

    // 其他类型的错误
    throw new Error(standardResult.error);

  } catch (error) {
    // 现有的错误处理逻辑...
    return false;
  }
}

async attemptElevatedInstallation(toolInfo) {
  const platform = process.platform;

  if (platform === 'win32') {
    return this.attemptWindowsElevatedInstallation(toolInfo);
  } else {
    return this.attemptUnixElevatedInstallation(toolInfo);
  }
}

async attemptWindowsElevatedInstallation(toolInfo) {
  const command = toolInfo.install;

  // 创建管理员PowerShell脚本
  const scriptPath = path.join(os.tmpdir(), `install-${Date.now()}.ps1`);
  const scriptContent = `
    Write-Host "以管理员权限安装: ${toolInfo.name}" -ForegroundColor Yellow
    try {
      ${command}
      Write-Host "安装成功: ${toolInfo.name}" -ForegroundColor Green
      exit 0
    } catch {
      Write-Host "安装失败: ${toolInfo.name}" -ForegroundColor Red
      Write-Host $\_.Exception.Message -ForegroundColor Red
      exit 1
    }
  `;

  fs.writeFileSync(scriptPath, scriptContent, 'utf8');

  try {
    const result = spawnSync('powershell', [
      '-Command', `Start-Process PowerShell -Verb RunAs -ArgumentList "-File '${scriptPath}'" -Wait`
    ], { stdio: 'pipe' });

    // 清理临时文件
    fs.unlinkSync(scriptPath);

    return {
      success: result.status === 0,
      error: result.status !== 0 ? 'Elevated installation failed' : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async attemptUnixElevatedInstallation(toolInfo) {
  const command = `sudo ${toolInfo.install}`;

  try {
    const result = spawnSync('bash', ['-c', command], {
      stdio: 'inherit',
      timeout: this.options.timeout
    });

    return {
      success: result.status === 0,
      error: result.status !== 0 ? 'Sudo installation failed' : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

isPermissionError(errorMessage) {
  const permissionIndicators = [
    'EACCES', 'EPERM', 'permission denied',
    'access denied', 'unauthorized', 'EISDIR',
    'operation not permitted'
  ];

  return permissionIndicators.some(indicator =>
    errorMessage.toLowerCase().includes(indicator.toLowerCase())
  );
}
```

## 🚀 用户体验改进

### 安装过程的自动化权限处理
```bash
$ stigmergy install

[SCAN] Found 3 missing AI CLI tools:
  - Claude CLI: npm install -g @anthropic-ai/claude-code
  - Gemini CLI: npm install -g @google/gemini-cli
  - Qwen CLI: npm install -g @qwen-code/qwen-code

[AUTO-INSTALL] Installing 3 missing AI CLI tools...

[INFO] Installing Claude CLI...
[WARN] Permission error detected, attempting auto-escalation...
[INFO] Automatically using administrator privileges...
✅ Successfully installed Claude CLI

[INFO] Installing Gemini CLI...
[INFO] Using elevated privileges from previous setup...
✅ Successfully installed Gemini CLI

[INFO] Installing Qwen CLI...
✅ Successfully installed Qwen CLI

[SUCCESS] Installed 3 AI CLI tools!
✅ 权限问题已自动处理
```

## 📋 实施步骤

1. **升级EnhancedCLIInstaller** - 添加自动权限检测和处理
2. **测试跨平台权限提升** - Windows/macOS/Linux
3. **更新用户界面** - 显示权限处理状态
4. **添加回退机制** - 如果自动权限提升失败，提供手动指导
5. **文档更新** - 更新安装说明和故障排除指南