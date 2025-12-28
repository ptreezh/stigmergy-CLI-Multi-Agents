import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

/**
 * 动态发现各CLI工具的会话存储路径
 */
export class PathDiscovery {
  private homeDir: string;

  constructor() {
    this.homeDir = os.homedir();
  }

  /**
   * 获取所有CLI的会话路径（带fallback机制）
   */
  getCLISessionPaths(): Record<string, string[]> {
    return {
      claude: this.getClaudePaths(),
      gemini: this.getGeminiPaths(),
      qwen: this.getQwenPaths(),
      iflow: this.getIFlowPaths(),
      codebuddy: this.getCodeBuddyPaths(),
      qodercli: this.getQoderCLIPaths(),
      codex: this.getCodexPaths()
    };
  }

  /**
   * Claude CLI 路径
   * 优先级: projects > sessions > history.jsonl
   */
  private getClaudePaths(): string[] {
    const basePath = join(this.homeDir, '.claude');
    const paths: string[] = [];

    // 1. Projects directory (主要路径)
    const projectsPath = join(basePath, 'projects');
    if (existsSync(projectsPath)) {
      paths.push(projectsPath);
    }

    // 2. Sessions directory (备用)
    const sessionsPath = join(basePath, 'sessions');
    if (existsSync(sessionsPath)) {
      paths.push(sessionsPath);
    }

    // 3. Root history.jsonl (备用)
    if (existsSync(join(basePath, 'history.jsonl'))) {
      paths.push(basePath);
    }

    return paths.length > 0 ? paths : [sessionsPath]; // 默认返回sessions
  }

  /**
   * Gemini CLI 路径
   * 优先级: tmp > sessions
   */
  private getGeminiPaths(): string[] {
    const basePath = join(this.homeDir, '.gemini');
    const paths: string[] = [];

    // 1. Tmp directory (主要路径 - 新版本)
    const tmpPath = join(basePath, 'tmp');
    if (existsSync(tmpPath)) {
      paths.push(tmpPath);
    }

    // 2. Sessions directory (备用 - 旧版本)
    const sessionsPath = join(basePath, 'sessions');
    if (existsSync(sessionsPath)) {
      paths.push(sessionsPath);
    }

    return paths.length > 0 ? paths : [sessionsPath];
  }

  /**
   * Qwen CLI 路径
   */
  private getQwenPaths(): string[] {
    const projectsPath = join(this.homeDir, '.qwen', 'projects');
    return [projectsPath];
  }

  /**
   * IFlow CLI 路径
   */
  private getIFlowPaths(): string[] {
    const projectsPath = join(this.homeDir, '.iflow', 'projects');
    return [projectsPath];
  }

  /**
   * CodeBuddy CLI 路径
   */
  private getCodeBuddyPaths(): string[] {
    const basePath = join(this.homeDir, '.codebuddy');
    return [basePath];
  }

  /**
   * QoderCLI 路径
   * 注意：实际目录是 .qoder 而不是 .qodercli
   */
  private getQoderCLIPaths(): string[] {
    const paths: string[] = [];

    // 1. .qoder/projects (实际路径)
    const qoderProjectsPath = join(this.homeDir, '.qoder', 'projects');
    if (existsSync(qoderProjectsPath)) {
      paths.push(qoderProjectsPath);
    }

    // 2. .qodercli/chats (备用，如果存在)
    const qodercliChatsPath = join(this.homeDir, '.qodercli', 'chats');
    if (existsSync(qodercliChatsPath)) {
      paths.push(qodercliChatsPath);
    }

    return paths.length > 0 ? paths : [qoderProjectsPath];
  }

  /**
   * Codex CLI 路径
   */
  private getCodexPaths(): string[] {
    const sessionsPath = join(this.homeDir, '.codex', 'sessions');
    return [sessionsPath];
  }

  /**
   * 从配置文件读取路径（如果存在）
   */
  private readPathFromConfig(cliType: string): string | null {
    const configPaths = [
      join(this.homeDir, `.${cliType}`, 'config.json'),
      join(this.homeDir, `.${cliType}`, 'settings.json'),
      join(this.homeDir, `.config`, cliType, 'config.json')
    ];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const config = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
          
          // 尝试常见的路径配置字段
          const sessionPath = config.sessionsPath || 
                             config.sessions_path ||
                             config.sessionDir ||
                             config.session_dir ||
                             config.historyPath ||
                             config.history_path;
          
          if (sessionPath && existsSync(sessionPath)) {
            return sessionPath;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  /**
   * 搜索可能的会话目录
   * 用于发现新的或未知的CLI工具
   */
  discoverSessionPaths(cliType: string): string[] {
    const basePaths = [
      join(this.homeDir, `.${cliType}`),
      join(this.homeDir, '.config', cliType)
    ];

    const commonDirNames = [
      'sessions',
      'projects',
      'chats',
      'conversations',
      'history',
      'tmp'
    ];

    const discoveredPaths: string[] = [];

    for (const basePath of basePaths) {
      if (!existsSync(basePath)) continue;

      // 检查常见目录名
      for (const dirName of commonDirNames) {
        const path = join(basePath, dirName);
        if (existsSync(path)) {
          discoveredPaths.push(path);
        }
      }

      // 检查根目录是否有会话文件
      try {
        const files = readdirSync(basePath);
        const hasSessionFiles = files.some(f => 
          f.endsWith('.json') || 
          f.endsWith('.jsonl') || 
          f.endsWith('.session') ||
          f.includes('session') ||
          f.includes('history')
        );
        
        if (hasSessionFiles) {
          discoveredPaths.push(basePath);
        }
      } catch (error) {
        // Ignore
      }
    }

    return discoveredPaths;
  }

  /**
   * 获取CLI的所有可能路径（配置 + 发现 + 默认）
   */
  getAllPossiblePaths(cliType: string): string[] {
    const paths = new Set<string>();

    // 1. 从配置文件读取
    const configPath = this.readPathFromConfig(cliType);
    if (configPath) {
      paths.add(configPath);
    }

    // 2. 使用预定义路径
    const predefinedPaths = this.getCLISessionPaths()[cliType] || [];
    predefinedPaths.forEach(p => paths.add(p));

    // 3. 动态发现
    const discoveredPaths = this.discoverSessionPaths(cliType);
    discoveredPaths.forEach(p => paths.add(p));

    return Array.from(paths).filter(p => existsSync(p));
  }
}
