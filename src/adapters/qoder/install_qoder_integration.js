#!/usr/bin/env node

/**
 * Qoder CLI Hook安装器
 * 用于自动安装和配置Qoder CLI的通知Hook插件
 * 
 * 使用方法：
 * node install_qoder_integration.js [install|uninstall|status]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class QoderHookInstaller {
  constructor() {
    this.qoderConfigDir = path.join(os.homedir(), '.qoder');
    this.hooksDir = path.join(this.qoderConfigDir, 'hooks');
    this.logsDir = path.join(this.qoderConfigDir, 'logs');
    this.cacheDir = path.join(this.qoderConfigDir, 'cache');
    
    // 适配器路径
    this.currentDir = __dirname;
    this.hookAdapterFile = path.join(this.currentDir, 'notification_hook_adapter.js');
    this.configFile = path.join(this.currentDir, 'config.json');
    
    // 安装状态
    this.installationLog = [];
  }

  /**
   * 安装Qoder CLI Hook插件
   */
  async installHooks() {
    try {
      console.log('开始安装Qoder CLI Hook插件...');

      // 1. 检查环境和平台
      if (!await this._checkEnvironment()) {
        console.error('环境检查失败');
        return false;
      }

      // 2. 创建配置目录
      await this._createDirectories();

      // 3. 复制适配器文件
      if (!await this._installAdapterFiles()) {
        console.error('适配器文件安装失败');
        return false;
      }

      // 4. 创建Hook脚本
      if (!await this._createHookScripts()) {
        console.error('Hook脚本创建失败');
        return false;
      }

      // 5. 设置环境配置
      if (!await this._setupEnvironmentConfig()) {
        console.error('环境配置设置失败');
        return false;
      }

      // 6. 创建启动脚本
      if (!await this._createStartupScripts()) {
        console.error('启动脚本创建失败');
        return false;
      }

      // 7. 创建全局Cross-CLI文档
      await this._createGlobalCrossCliDocumentation();

      // 8. 验证安装
      if (!await this._verifyInstallation()) {
        console.error('安装验证失败');
        return false;
      }

      console.log('Qoder CLI Hook插件安装成功');
      await this._logInstallation('success', 'Hook插件安装成功');
      return true;

    } catch (error) {
      console.error(`安装Qoder CLI Hook插件失败: ${error.message}`);
      await this._logInstallation('error', `安装失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 卸载Qoder CLI Hook插件
   */
  async uninstallHooks() {
    try {
      console.log('开始卸载Qoder CLI Hook插件...');

      // 1. 备份配置
      await this._backupConfiguration();

      // 2. 清理Hook脚本
      await this._cleanupHookScripts();

      // 3. 清理适配器文件
      await this._cleanupAdapterFiles();

      // 4. 清理环境变量
      await this._cleanupEnvironment();

      // 5. 清理临时文件
      await this._cleanupTempFiles();

      console.log('Qoder CLI Hook插件卸载成功');
      await this._logInstallation('success', 'Hook插件卸载成功');
      return true;

    } catch (error) {
      console.error(`卸载Qoder CLI Hook插件失败: ${error.message}`);
      await this._logInstallation('error', `卸载失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查安装环境
   */
  async _checkEnvironment() {
    try {
      // 检查Node.js版本
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion < 14) {
        console.error('需要Node.js 14或更高版本');
        return false;
      }

      // 检查平台支持
      const currentPlatform = os.platform();
      if (!['darwin', 'linux', 'win32'].includes(currentPlatform)) {
        console.warn(`平台 ${currentPlatform} 可能不受完全支持，将使用fallback机制`);
      }

      // 检查必要的文件是否存在
      const requiredFiles = [
        this.configFile
      ];

      for (const file of requiredFiles) {
        try {
          await fs.access(file);
        } catch (error) {
          console.warn(`必要文件不存在: ${file}`);
          // 不强制要求适配器文件
        }
      }

      // 检查系统工具
      if (currentPlatform === 'darwin') {
        // 检查osascript是否可用
        try {
          await this._runCommand('osascript', ['-e', '1'], { timeout: 2000 });
        } catch (error) {
          console.warn('osascript不可用，通知功能可能受限');
        }
      }

      console.log(`环境检查通过 (${currentPlatform})`);
      return true;

    } catch (error) {
      console.error(`环境检查失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建必要的目录
   */
  async _createDirectories() {
    const directories = [
      this.qoderConfigDir,
      this.hooksDir,
      this.logsDir,
      this.cacheDir
    ];

    for (const directory of directories) {
      await fs.mkdir(directory, { recursive: true });
      console.log(`创建目录: ${directory}`);
    }
  }

  /**
   * 安装适配器文件
   */
  async _installAdapterFiles() {
    try {
      // 复制Hook适配器到Qoder目录（如果存在）
      const adapterDest = path.join(this.qoderConfigDir, 'notification_hook_adapter.js');
      try {
        await fs.copyFile(this.hookAdapterFile, adapterDest);
        console.log(`复制Hook适配器到: ${adapterDest}`);
      } catch (error) {
        console.warn(`适配器文件不存在，跳过: ${this.hookAdapterFile}`);
      }

      // 复制配置文件
      const configDest = path.join(this.qoderConfigDir, 'config.json');
      try {
        await fs.copyFile(this.configFile, configDest);
        console.log(`复制配置文件到: ${configDest}`);
      } catch (error) {
        // 创建默认配置
        const defaultConfig = {
          cross_cli_enabled: true,
          notifications: {
            enabled: true,
            cross_cli: true
          },
          keywords: {
            cross_cli: ['请用', '调用', '用', '让', 'use', 'call', 'ask']
          }
        };
        await fs.writeFile(configDest, JSON.stringify(defaultConfig, null, 2));
        console.log(`创建默认配置文件: ${configDest}`);
      }

      return true;

    } catch (error) {
      console.error(`安装适配器文件失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建Hook脚本
   */
  async _createHookScripts() {
    try {
      const platform = os.platform();
      const isWindows = platform === 'win32';

      if (isWindows) {
        return await this._createWindowsHookScripts();
      } else {
        return await this._createUnixHookScripts();
      }
    } catch (error) {
      console.error(`创建Hook脚本失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建Unix/Linux/macOS Hook脚本
   */
  async _createUnixHookScripts() {
    // 前置Hook脚本
    const preHookContent = `#!/bin/bash
# Qoder CLI前置Hook脚本
# 检测跨CLI调用意图并发送通知

COMMAND="$1"
STAGE="pre_command"
SESSION_ID="\${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 记录请求信息
REQUEST_FILE="$QODER_CROSS_CLI_REQUEST_FILE"
if [ -n "$REQUEST_FILE" ]; then
    cat > "$REQUEST_FILE" << EOF
{
    "stage": "$STAGE",
    "command": "$COMMAND",
    "session_id": "$SESSION_ID",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "platform": "$(uname -s)",
    "user": "$USER"
}
EOF
fi

# 检测跨CLI调用关键词
CROSS_CLI_KEYWORDS="请用|调用|用|让|use|call|ask"
CLI_NAMES="claude|gemini|qwen|iflow|codebuddy|codex"

if echo "$COMMAND" | grep -E "($CROSS_CLI_KEYWORDS).*$CLI_NAMES" > /dev/null 2>&1; then
    # 发送跨CLI检测通知
    case "$(uname -s)" in
        Darwin*)
            if command -v osascript > /dev/null 2>&1; then
                osascript -e 'display notification "检测到跨CLI调用意图" with title "QoderCLI" subtitle "准备调用其他AI工具"'
            fi
            ;;
        Linux*)
            if command -v notify-send > /dev/null 2>&1; then
                notify-send "QoderCLI" "检测到跨CLI调用意图 - 准备调用其他AI工具" --urgency=normal
            fi
            ;;
    esac
fi

exit 0
`;

    // 后置Hook脚本
    const postHookContent = `#!/bin/bash
# Qoder CLI后置Hook脚本
# 处理跨CLI调用结果并发送完成通知

EXIT_CODE=$?
STAGE="post_command"
COMMAND="$1"
SESSION_ID="\${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 记录完成状态
STATUS_FILE="$QODER_CROSS_CLI_STATUS_FILE"
if [ -n "$STATUS_FILE" ]; then
    cat > "$STATUS_FILE" << EOF
{
    "stage": "$STAGE",
    "command": "$COMMAND",
    "session_id": "$SESSION_ID",
    "exit_code": $EXIT_CODE,
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "completed": true,
    "success": $([ $EXIT_CODE -eq 0 ] && echo true || echo false)
}
EOF
fi

# 检查是否有跨CLI响应
RESPONSE_FILE="$QODER_CROSS_CLI_RESPONSE_FILE"
if [ -f "$RESPONSE_FILE" ] && [ -s "$RESPONSE_FILE" ]; then
    # 发送完成通知
    case "$(uname -s)" in
        Darwin*)
            if command -v osascript > /dev/null 2>&1; then
                osascript -e 'display notification "[OK] 跨CLI调用完成" with title "QoderCLI" subtitle "任务执行成功"'
            fi
            ;;
        Linux*)
            if command -v notify-send > /dev/null 2>&1; then
                notify-send "QoderCLI" "[OK] 跨CLI调用完成" --urgency=low
            fi
            ;;
    esac
fi

exit $EXIT_CODE
`;

    // 错误处理Hook脚本
    const errorHookContent = `#!/bin/bash
# Qoder CLI错误处理Hook脚本
# 处理错误情况并发送授权通知

EXIT_CODE=$?
STAGE="error_handling"
COMMAND="$1"
SESSION_ID="\${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 如果有错误，发送授权通知
if [ $EXIT_CODE -ne 0 ]; then
    case "$(uname -s)" in
        Darwin*)
            if command -v osascript > /dev/null 2>&1; then
                osascript -e 'display notification "⌛️ 你提交的任务需要授权呀…" with title "QoderCLI"'
            fi
            ;;
        Linux*)
            if command -v notify-send > /dev/null 2>&1; then
                notify-send "QoderCLI" "⌛️ 你提交的任务需要授权呀…" --urgency=normal
            fi
            ;;
    esac

    # 记录错误到日志
    LOG_FILE="$HOME/.qoder/logs/error.log"
    echo "[$(date)] Hook Error: Command '$COMMAND' failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

exit 0
`;

    // 写入脚本文件
    const scripts = {
      'pre_hook.sh': preHookContent,
      'post_hook.sh': postHookContent,
      'error_hook.sh': errorHookContent
    };

    for (const [filename, content] of Object.entries(scripts)) {
      const scriptPath = path.join(this.hooksDir, filename);
      await fs.writeFile(scriptPath, content, 'utf8');
      
      // 设置执行权限（Unix系统）
      try {
        await fs.chmod(scriptPath, 0o755);
      } catch (error) {
        console.warn(`设置执行权限失败: ${scriptPath}`);
      }
      
      console.log(`创建Hook脚本: ${scriptPath}`);
    }

    return true;
  }

  /**
   * 创建Windows Hook脚本
   */
  async _createWindowsHookScripts() {
    // Windows版本的Hook脚本
    const preHookContent = `@echo off
REM Qoder CLI前置Hook脚本
REM 检测跨CLI调用意图并发送通知

set COMMAND=%1
set STAGE=pre_command
if "%QODER_HOOK_SESSION_ID%"=="" set QODER_HOOK_SESSION_ID=%TIME%

REM 设置环境变量
set QODER_HOOK_STAGE=%STAGE%
set QODER_HOOK_COMMAND=%COMMAND%

REM 记录请求信息
if not "%QODER_CROSS_CLI_REQUEST_FILE%"=="" (
    echo { > "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo   "stage": "%STAGE%", >> "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo   "command": "%COMMAND%", >> "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo   "session_id": "%QODER_HOOK_SESSION_ID%", >> "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo   "timestamp": "%DATE% %TIME%", >> "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo   "platform": "Windows", >> "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo   "user": "%USERNAME%" >> "%QODER_CROSS_CLI_REQUEST_FILE%"
    echo } >> "%QODER_CROSS_CLI_REQUEST_FILE%"
)

exit /b 0
`;

    const postHookContent = `@echo off
REM Qoder CLI后置Hook脚本
REM 处理跨CLI调用结果并发送完成通知

set EXIT_CODE=%ERRORLEVEL%
set STAGE=post_command
set COMMAND=%1

REM 设置环境变量
set QODER_HOOK_STAGE=%STAGE%
set QODER_HOOK_COMMAND=%COMMAND%

REM 记录完成状态
if not "%QODER_CROSS_CLI_STATUS_FILE%"=="" (
    echo { > "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "stage": "%STAGE%", >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "command": "%COMMAND%", >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "session_id": "%QODER_HOOK_SESSION_ID%", >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "exit_code": %EXIT_CODE%, >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "timestamp": "%DATE% %TIME%", >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "completed": true, >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo   "success": true >> "%QODER_CROSS_CLI_STATUS_FILE%"
    echo } >> "%QODER_CROSS_CLI_STATUS_FILE%"
)

exit /b %EXIT_CODE%
`;

    const errorHookContent = `@echo off
REM Qoder CLI错误处理Hook脚本
REM 处理错误情况并发送授权通知

set EXIT_CODE=%ERRORLEVEL%
set STAGE=error_handling
set COMMAND=%1

REM 设置环境变量
set QODER_HOOK_STAGE=%STAGE%
set QODER_HOOK_COMMAND=%COMMAND%

REM 如果有错误，发送授权通知
if %EXIT_CODE% neq 0 (
    REM 记录错误到日志
    set LOG_FILE=%USERPROFILE%\\.qoder\\logs\\error.log
    echo [%DATE% %TIME%] Hook Error: Command '%COMMAND%' failed with exit code %EXIT_CODE% >> "%LOG_FILE%"
)

exit /b 0
`;

    // 写入脚本文件
    const scripts = {
      'pre_hook.bat': preHookContent,
      'post_hook.bat': postHookContent,
      'error_hook.bat': errorHookContent
    };

    for (const [filename, content] of Object.entries(scripts)) {
      const scriptPath = path.join(this.hooksDir, filename);
      await fs.writeFile(scriptPath, content, 'utf8');
      console.log(`创建Hook脚本: ${scriptPath}`);
    }

    return true;
  }

  /**
   * 设置环境配置
   */
  async _setupEnvironmentConfig() {
    try {
      const envConfig = {
        QODER_CROSS_CLI_ENABLED: '1',
        QODER_CROSS_CLI_RESPONSE_FILE: '',
        QODER_CROSS_CLI_REQUEST_FILE: '',
        QODER_CROSS_CLI_STATUS_FILE: '',
        QODER_HOOK_STAGE: '',
        QODER_HOOK_COMMAND: '',
        QODER_HOOK_SESSION_ID: '',
        QODER_HOOK_LOG_LEVEL: 'INFO',
        QODER_HOOK_PLATFORM: os.platform()
      };

      const envConfigPath = path.join(this.qoderConfigDir, 'environment.json');
      await fs.writeFile(envConfigPath, JSON.stringify(envConfig, null, 2));

      console.log(`环境配置已创建: ${envConfigPath}`);
      return true;

    } catch (error) {
      console.error(`设置环境配置失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建启动脚本
   */
  async _createStartupScripts() {
    try {
      const platform = os.platform();
      const isWindows = platform === 'win32';
      
      let startupScript;
      
      if (isWindows) {
        startupScript = `@echo off
REM Qoder CLI Cross-CLI Hook启动脚本

set QODER_DIR=%USERPROFILE%\\.qoder
set ADAPTER=%QODER_DIR%\\notification_hook_adapter.js

REM 检查Node.js环境
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 需要Node.js
    exit /b 1
)

REM 检查适配器文件
if not exist "%ADAPTER%" (
    echo 错误: Qoder Hook适配器文件不存在: %ADAPTER%
    exit /b 1
)

REM 设置环境变量
set QODER_CROSS_CLI_ENABLED=1

REM 启动Hook监控
echo 启动Qoder CLI Cross-CLI Hook监控...
node "%ADAPTER%"

echo Qoder Hook监控已停止
`;
      } else {
        startupScript = `#!/bin/bash
# Qoder CLI Cross-CLI Hook启动脚本

QODER_DIR="$HOME/.qoder"
ADAPTER="$QODER_DIR/notification_hook_adapter.js"

# 检查Node.js环境
if ! command -v node > /dev/null 2>&1; then
    echo "错误: 需要Node.js"
    exit 1
fi

# 检查适配器文件
if [ ! -f "$ADAPTER" ]; then
    echo "错误: Qoder Hook适配器文件不存在: $ADAPTER"
    exit 1
fi

# 设置环境变量
export QODER_CROSS_CLI_ENABLED=1

# 启动Hook监控
echo "启动Qoder CLI Cross-CLI Hook监控..."
node "$ADAPTER"

echo "Qoder Hook监控已停止"
`;
      }

      const startupScriptPath = path.join(this.qoderConfigDir, isWindows ? 'start_hooks.bat' : 'start_hooks.sh');
      await fs.writeFile(startupScriptPath, startupScript, 'utf8');
      
      // 设置执行权限（Unix系统）
      if (!isWindows) {
        try {
          await fs.chmod(startupScriptPath, 0o755);
        } catch (error) {
          console.warn(`设置执行权限失败: ${startupScriptPath}`);
        }
      }

      console.log(`启动脚本已创建: ${startupScriptPath}`);
      return true;

    } catch (error) {
      console.error(`创建启动脚本失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 验证安装
   */
  async _verifyInstallation() {
    try {
      const platform = os.platform();
      const isWindows = platform === 'win32';
      
      // 检查必要文件是否存在
      const requiredFiles = [
        path.join(this.qoderConfigDir, 'config.json'),
        path.join(this.qoderConfigDir, 'environment.json'),
        path.join(this.qoderConfigDir, isWindows ? 'start_hooks.bat' : 'start_hooks.sh')
      ];

      // Hook脚本文件根据平台不同
      if (isWindows) {
        requiredFiles.push(
          path.join(this.hooksDir, 'pre_hook.bat'),
          path.join(this.hooksDir, 'post_hook.bat'),
          path.join(this.hooksDir, 'error_hook.bat')
        );
      } else {
        requiredFiles.push(
          path.join(this.hooksDir, 'pre_hook.sh'),
          path.join(this.hooksDir, 'post_hook.sh'),
          path.join(this.hooksDir, 'error_hook.sh')
        );
      }

      // 检查适配器文件（可选）
      const adapterFile = path.join(this.qoderConfigDir, 'notification_hook_adapter.js');
      try {
        await fs.access(adapterFile);
        requiredFiles.push(adapterFile);
      } catch (error) {
        // 适配器文件是可选的
      }

      for (const filePath of requiredFiles) {
        try {
          await fs.access(filePath);
        } catch (error) {
          console.error(`必要文件不存在: ${filePath}`);
          return false;
        }
      }

      console.log('安装验证通过');
      return true;

    } catch (error) {
      console.error(`安装验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 备份现有配置
   */
  async _backupConfiguration() {
    try {
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
      const backupDir = path.join(this.qoderConfigDir, 'backup', timestamp);
      await fs.mkdir(backupDir, { recursive: true });

      // 备份Hook目录
      try {
        await this._copyDirectory(this.hooksDir, path.join(backupDir, 'hooks'));
      } catch (error) {
        // 目录可能不存在
      }

      // 备份配置文件
      const configFiles = [
        'notification_hook_adapter.js',
        'config.json',
        'environment.json',
        'start_hooks.sh',
        'start_hooks.bat'
      ];

      for (const configFile of configFiles) {
        const srcPath = path.join(this.qoderConfigDir, configFile);
        try {
          await fs.access(srcPath);
          const destPath = path.join(backupDir, configFile);
          await fs.copyFile(srcPath, destPath);
        } catch (error) {
          // 文件可能不存在
        }
      }

      console.log(`配置已备份到: ${backupDir}`);

    } catch (error) {
      console.warn(`备份配置失败: ${error.message}`);
    }
  }

  /**
   * 清理Hook脚本
   */
  async _cleanupHookScripts() {
    try {
      const platform = os.platform();
      const isWindows = platform === 'win32';
      
      const scripts = isWindows 
        ? ['pre_hook.bat', 'post_hook.bat', 'error_hook.bat']
        : ['pre_hook.sh', 'post_hook.sh', 'error_hook.sh'];
        
      for (const script of scripts) {
        const scriptPath = path.join(this.hooksDir, script);
        try {
          await fs.unlink(scriptPath);
          console.log(`删除Hook脚本: ${scriptPath}`);
        } catch (error) {
          // 文件可能不存在
        }
      }

    } catch (error) {
      console.warn(`清理Hook脚本失败: ${error.message}`);
    }
  }

  /**
   * 清理适配器文件
   */
  async _cleanupAdapterFiles() {
    try {
      const files = [
        'notification_hook_adapter.js',
        'config.json',
        'environment.json',
        'start_hooks.sh',
        'start_hooks.bat'
      ];

      for (const fileName of files) {
        const filePath = path.join(this.qoderConfigDir, fileName);
        try {
          await fs.unlink(filePath);
          console.log(`删除文件: ${filePath}`);
        } catch (error) {
          // 文件可能不存在
        }
      }

    } catch (error) {
      console.warn(`清理适配器文件失败: ${error.message}`);
    }
  }

  /**
   * 清理环境变量
   */
  async _cleanupEnvironment() {
    try {
      const envVars = [
        'QODER_CROSS_CLI_ENABLED',
        'QODER_CROSS_CLI_RESPONSE_FILE',
        'QODER_CROSS_CLI_REQUEST_FILE',
        'QODER_CROSS_CLI_STATUS_FILE',
        'QODER_HOOK_STAGE',
        'QODER_HOOK_COMMAND',
        'QODER_HOOK_SESSION_ID'
      ];

      for (const envVar of envVars) {
        if (process.env[envVar]) {
          delete process.env[envVar];
        }
      }

      console.log('环境变量已清理');

    } catch (error) {
      console.warn(`清理环境变量失败: ${error.message}`);
    }
  }

  /**
   * 清理临时文件
   */
  async _cleanupTempFiles() {
    try {
      const tempPattern = path.join(this.cacheDir, 'qoder_cross_cli_temp_*');
      const tempDirs = await this._glob(tempPattern);

      for (const tempDir of tempDirs) {
        try {
          await fs.rmdir(tempDir, { recursive: true });
          console.log(`清理临时目录: ${tempDir}`);
        } catch (error) {
          // 目录可能不存在
        }
      }

    } catch (error) {
      console.warn(`清理临时文件失败: ${error.message}`);
    }
  }

  /**
   * 创建全局Cross-CLI通信文档
   */
  async _createGlobalCrossCliDocumentation() {
    try {
      const docContent = `# Qoder CLI 跨CLI通信指南

## Cross-CLI Communication
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*本文档由Stigmergy CLI自动生成和维护*
`;

      const docPath = path.join(this.qoderConfigDir, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent, 'utf8');
      console.log(`创建Cross-CLI通信指南: ${docPath}`);

      // 如果存在qoder.md文件，则在末尾追加Cross-CLI通信提示
      const qoderMdPath = path.join(os.homedir(), '.qoder', 'qoder.md');
      try {
        await fs.access(qoderMdPath);
        
        const crossCliContent = `

## Cross-CLI Communication
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(qoderMdPath, crossCliContent, 'utf8');
        console.log('在QODER.md末尾追加Cross-CLI通信提示');
      } catch (error) {
        // 文件可能不存在，忽略
      }

    } catch (error) {
      console.warn(`创建Cross-CLI通信指南失败: ${error.message}`);
    }
  }

  /**
   * 获取安装状态
   */
  async getInstallationStatus() {
    const platform = os.platform();
    const isWindows = platform === 'win32';
    
    const filesExist = {
      hook_adapter: false,
      config: false,
      pre_hook: false,
      post_hook: false,
      error_hook: false,
      startup_script: false
    };

    // 检查文件是否存在
    try {
      await fs.access(path.join(this.qoderConfigDir, 'notification_hook_adapter.js'));
      filesExist.hook_adapter = true;
    } catch (error) {}

    try {
      await fs.access(path.join(this.qoderConfigDir, 'config.json'));
      filesExist.config = true;
    } catch (error) {}

    try {
      await fs.access(path.join(this.hooksDir, isWindows ? 'pre_hook.bat' : 'pre_hook.sh'));
      filesExist.pre_hook = true;
    } catch (error) {}

    try {
      await fs.access(path.join(this.hooksDir, isWindows ? 'post_hook.bat' : 'post_hook.sh'));
      filesExist.post_hook = true;
    } catch (error) {}

    try {
      await fs.access(path.join(this.hooksDir, isWindows ? 'error_hook.bat' : 'error_hook.sh'));
      filesExist.error_hook = true;
    } catch (error) {}

    try {
      await fs.access(path.join(this.qoderConfigDir, isWindows ? 'start_hooks.bat' : 'start_hooks.sh'));
      filesExist.startup_script = true;
    } catch (error) {}

    return {
      platform: platform,
      qoder_config_dir: this.qoderConfigDir,
      hooks_dir: this.hooksDir,
      files_exist: filesExist,
      installation_log: this.installationLog
    };
  }

  /**
   * 记录安装日志
   */
  async _logInstallation(status, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      status: status,
      message: message,
      platform: os.platform()
    };
    this.installationLog.push(logEntry);

    // 写入日志文件
    const logFile = path.join(this.logsDir, 'installation.log');
    await fs.mkdir(path.dirname(logFile), { recursive: true });

    try {
      await fs.appendFile(logFile, `${JSON.stringify(logEntry)}\n`);
    } catch (error) {
      console.warn(`写入安装日志失败: ${error.message}`);
    }
  }

  /**
   * 辅助方法：运行命令
   */
  async _runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { 
        stdio: 'pipe',
        ...options 
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', reject);
    });
  }

  /**
   * 辅助方法：复制目录
   */
  async _copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this._copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * 辅助方法：Glob模式匹配
   */
  async _glob(pattern) {
    // 简单的glob实现，仅支持*通配符
    const dir = path.dirname(pattern);
    const base = path.basename(pattern);
    const regex = new RegExp('^' + base.replace(/\*/g, '.*') + '$');
    
    try {
      const files = await fs.readdir(dir);
      return files
        .filter(file => regex.test(file))
        .map(file => path.join(dir, file));
    } catch (error) {
      return [];
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  const installer = new QoderHookInstaller();

  if (command === 'install') {
    const success = await installer.installHooks();
    console.log(`安装${success ? '成功' : '失败'}`);
    return success ? 0 : 1;
  } else if (command === 'uninstall') {
    const success = await installer.uninstallHooks();
    console.log(`卸载${success ? '成功' : '失败'}`);
    return success ? 0 : 1;
  } else if (command === 'status') {
    const status = await installer.getInstallationStatus();
    console.log('Qoder Hook插件状态:');
    console.log(JSON.stringify(status, null, 2));
    return 0;
  } else {
    console.log('用法: node install_qoder_integration.js [install|uninstall|status]');
    return 1;
  }
}

// 导出模块
module.exports = QoderHookInstaller;

// 如果直接运行此脚本
if (require.main === module) {
  main().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}