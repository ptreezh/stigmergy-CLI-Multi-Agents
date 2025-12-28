import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { CLIInfo } from '../types';

export class CLIScanner {
  private static instance: CLIScanner;

  static getInstance(): CLIScanner {
    if (!CLIScanner.instance) {
      CLIScanner.instance = new CLIScanner();
    }
    return CLIScanner.instance;
  }

  /**
   * 扫描所有CLI工具（包括不可用的）
   */
  async scanAllCLIs(): Promise<CLIInfo[]> {
    const cliList: CLIInfo[] = [
      {
        name: 'claude',
        displayName: 'Claude CLI',
        version: '',
        available: false,
        integrationLevel: 'native'
      },
      {
        name: 'gemini',
        displayName: 'Gemini CLI',
        version: '',
        available: false,
        integrationLevel: 'native'
      },
      {
        name: 'qwen',
        displayName: 'Qwen CLI',
        version: '',
        available: false,
        integrationLevel: 'native'
      },
      {
        name: 'iflow',
        displayName: 'IFlow CLI',
        version: '',
        available: false,
        integrationLevel: 'hook'
      },
      {
        name: 'codebuddy',
        displayName: 'CodeBuddy CLI',
        version: '',
        available: false,
        integrationLevel: 'external'
      },
      {
        name: 'qodercli',
        displayName: 'QoderCLI',
        version: '',
        available: false,
        integrationLevel: 'external'
      },
      {
        name: 'codex',
        displayName: 'Codex CLI',
        version: '',
        available: false,
        integrationLevel: 'external'
      },
      {
        name: 'kode',
        displayName: 'Kode CLI',
        version: '',
        available: false,
        integrationLevel: 'external'
      }
    ];

    // 检查每个CLI的可用性
    for (const cli of cliList) {
      await this.checkCLIAvailability(cli);
    }

    return cliList;
  }

  /**
   * 扫描系统中可用的CLI工具
   */
  async scanAvailableCLIs(): Promise<CLIInfo[]> {
    // 使用与scanAllCLIs相同的逻辑，返回所有CLI
    return await this.scanAllCLIs();
  }

  /**
   * 检查特定CLI的可用性
   */
  private async checkCLIAvailability(cli: CLIInfo): Promise<void> {
    try {
      // 首先检查是否在PATH中
      const cliPath = await this.getCLIPath(cli.name);
      if (!cliPath) {
        cli.available = false;
        return;
      }

      // 尝试获取版本信息
      const version = await this.getCLIVersion(cli.name);
      if (version) {
        cli.available = true;
        cli.version = version;
      } else {
        // 如果版本检测失败，但路径存在，标记为部分可用
        cli.available = true;
        cli.version = 'unknown';
      }

      // 获取路径信息
      cli.installedPath = cliPath;
      cli.configPath = await this.getCLIConfigPath(cli.name);
      cli.sessionsPath = await this.getCLISessionsPath(cli.name);
    } catch (error) {
      cli.available = false;
    }
  }

  /**
   * Get CLI version
   */
  private async getCLIVersion(cliName: string): Promise<string> {
    // For certain CLI tools, avoid executing commands that might launch UI
    // Check installation path and config files instead
    if (cliName === 'codex') {
      return await this.getCodexVersionByPath();
    }

    const versionCommands: Record<string, string[]> = {
      'claude': ['claude', '--version'],
      'gemini': ['gemini', '--version'],
      'qwen': ['qwen', '--version'],
      'iflow': ['iflow', '--version'],
      'codebuddy': ['codebuddy', '--version'],
      'qodercli': ['qodercli', '--version'],
      'kode': ['kode', '--version']
    };

    const command = versionCommands[cliName];
    if (!command) return '';

    try {
      const output = execSync(command.join(' '), {
        encoding: 'utf8',
        timeout: 5000,
        stdio: 'pipe',
        // 防止启动GUI界面
        windowsHide: true,
        env: {
          ...process.env,
          DISPLAY: undefined // 在Unix系统上防止GUI启动
        }
      });

      // 提取版本号，支持更多格式
      const versionMatch = output.match(/(\d+\.\d+\.\d+)/) || output.match(/(\d+\.\d+)/);
      if (versionMatch) {
        return versionMatch[1];
      }
      // 如果没有匹配到版本号，但命令执行成功，返回'detected'
      if (output.trim().length > 0) {
        return 'detected';
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Get Codex version by file path (avoid executing commands)
   */
  private async getCodexVersionByPath(): Promise<string> {
    try {
      // Check if codex is in PATH
      const codexPath = await this.getCLIPath('codex');
      if (!codexPath) return '';

      // Check if config directory exists
      const configPath = await this.getCLIConfigPath('codex');
      if (!configPath) return '';

      // Check sessions directory
      const sessionsPath = await this.getCLISessionsPath('codex');
      if (!sessionsPath) return '';

      // If basic structure exists, consider version available (but don't execute version command)
      return 'detected';
    } catch (error) {
      return '';
    }
  }

  /**
   * Get CLI installation path
   */
  private async getCLIPath(cliName: string): Promise<string | undefined> {
    try {
      const command = process.platform === 'win32' ? 'where' : 'which';
      const output = execSync(`${command} ${cliName}`, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: 'pipe'
      });
      return output.trim().split('\n')[0];
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get CLI configuration path
   */
  private async getCLIConfigPath(cliName: string): Promise<string | undefined> {
    const homeDir = require('os').homedir();
    const configPaths: Record<string, string> = {
      'claude': join(homeDir, '.claude'),
      'gemini': join(homeDir, '.gemini'),
      'qwen': join(homeDir, '.qwen'),
      'iflow': join(homeDir, '.iflow'),
      'codebuddy': join(homeDir, '.codebuddy'),
      'qodercli': join(homeDir, '.qodercli'),
      'codex': join(homeDir, '.codex'),
      'kode': join(homeDir, '.kode')
    };

    const path = configPaths[cliName];
    return path && existsSync(path) ? path : undefined;
  }

  /**
   * Get CLI sessions path
   */
  private async getCLISessionsPath(cliName: string): Promise<string | undefined> {
    const configPath = await this.getCLIConfigPath(cliName);
    if (!configPath) return undefined;

    const sessionPaths: Record<string, string> = {
      'claude': join(configPath, 'sessions'),
      'gemini': join(configPath, 'sessions'),
      'qwen': join(configPath, 'sessions'),
      'iflow': join(configPath, 'stigmergy', 'sessions'),
      'codebuddy': join(configPath, 'conversations'),
      'qodercli': join(configPath, 'chats'),
      'codex': join(configPath, 'sessions'),
      'kode': join(configPath, 'sessions')
    };

    const path = sessionPaths[cliName];
    // 如果sessions目录不存在，尝试创建它
    if (path && !existsSync(path)) {
      try {
        require('fs').mkdirSync(path, { recursive: true });
        return path;
      } catch (error) {
        return undefined;
      }
    }
    return path;
  }

  /**
   * Validate if CLI supports cross-CLI session recovery
   */
  async validateCLIForCrossCLI(cliName: string): Promise<boolean> {
    try {
      // Check if config directory exists
      const configPath = await this.getCLIConfigPath(cliName);
      if (!configPath) return false;

      // Check if sessions storage exists
      const sessionsPath = await this.getCLISessionsPath(cliName);
      if (!sessionsPath) return false;

      // Check if we have permission to access
      try {
        const testFile = join(sessionsPath, '.resumesession-test');
        require('fs').writeFileSync(testFile, 'test');
        require('fs').unlinkSync(testFile);
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}