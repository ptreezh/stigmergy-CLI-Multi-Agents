import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

export interface CLIPathConfig {
  cliType: string;
  paths: string[];
  configFile?: string;
  lastModified?: number;
  discoveredAt: number;
}

export interface PathConfigCache {
  version: string;
  updatedAt: number;
  cliConfigs: Record<string, CLIPathConfig>;
}

/**
 * 集中化路径配置管理器
 * - 自动发现CLI会话路径
 * - 缓存路径配置到用户目录
 * - 检测配置变更并自动更新
 */
export class PathConfigManager {
  private static instance: PathConfigManager;
  private configPath: string;
  private cache: PathConfigCache | null = null;
  private readonly CONFIG_VERSION = '1.0.0';
  
  private constructor() {
    const stigmergyDir = join(homedir(), '.stigmergy', 'resume');
    if (!existsSync(stigmergyDir)) {
      mkdirSync(stigmergyDir, { recursive: true });
    }
    this.configPath = join(stigmergyDir, 'path-config.json');
  }

  static getInstance(): PathConfigManager {
    if (!PathConfigManager.instance) {
      PathConfigManager.instance = new PathConfigManager();
    }
    return PathConfigManager.instance;
  }

  /**
   * 获取CLI会话路径（带缓存）
   */
  getCLISessionPaths(cliType: string, forceRefresh = false): string[] {
    if (!this.cache || forceRefresh) {
      this.loadOrDiscoverPaths();
    }

    const config = this.cache?.cliConfigs[cliType];
    if (!config) {
      return [];
    }

    // 检查配置文件是否变更
    if (config.configFile && this.hasConfigChanged(config)) {
      console.log(`[PathConfig] Detected config change for ${cliType}, refreshing...`);
      return this.refreshCLIPaths(cliType);
    }

    return config.paths.filter(p => existsSync(p));
  }

  /**
   * 获取所有CLI的路径配置
   */
  getAllCLISessionPaths(forceRefresh = false): Record<string, string[]> {
    if (!this.cache || forceRefresh) {
      this.loadOrDiscoverPaths();
    }

    const result: Record<string, string[]> = {};
    const cliTypes = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex', 'kode'];
    
    for (const cliType of cliTypes) {
      result[cliType] = this.getCLISessionPaths(cliType, false);
    }

    return result;
  }

  /**
   * 刷新指定CLI的路径配置
   */
  refreshCLIPaths(cliType: string): string[] {
    const discoveredPaths = this.discoverCLIPaths(cliType);
    const configFile = this.findCLIConfigFile(cliType);
    
    const config: CLIPathConfig = {
      cliType,
      paths: discoveredPaths,
      configFile,
      lastModified: configFile ? this.getFileModifiedTime(configFile) : undefined,
      discoveredAt: Date.now()
    };

    if (!this.cache) {
      this.cache = {
        version: this.CONFIG_VERSION,
        updatedAt: Date.now(),
        cliConfigs: {}
      };
    }

    this.cache.cliConfigs[cliType] = config;
    this.cache.updatedAt = Date.now();
    this.saveCache();

    return discoveredPaths;
  }

  /**
   * 刷新所有CLI的路径配置
   */
  refreshAllPaths(): void {
    const cliTypes = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex', 'kode'];
    for (const cliType of cliTypes) {
      this.refreshCLIPaths(cliType);
    }
  }

  /**
   * 加载缓存或发现路径
   */
  private loadOrDiscoverPaths(): void {
    if (existsSync(this.configPath)) {
      try {
        const content = readFileSync(this.configPath, 'utf8');
        this.cache = JSON.parse(content);
        
        // 版本不匹配，重新发现
        if (this.cache?.version !== this.CONFIG_VERSION) {
          console.log('[PathConfig] Version mismatch, rediscovering paths...');
          this.refreshAllPaths();
        }
        return;
      } catch (error) {
        console.warn('[PathConfig] Failed to load cache, rediscovering...', (error as Error).message);
      }
    }

    // 首次运行，发现所有路径
    console.log('[PathConfig] First run, discovering all CLI paths...');
    this.refreshAllPaths();
  }

  /**
   * 保存缓存到文件
   */
  private saveCache(): void {
    try {
      const content = JSON.stringify(this.cache, null, 2);
      writeFileSync(this.configPath, content, 'utf8');
    } catch (error) {
      console.error('[PathConfig] Failed to save cache:', (error as Error).message);
    }
  }

  /**
   * 检查CLI配置文件是否变更
   */
  private hasConfigChanged(config: CLIPathConfig): boolean {
    if (!config.configFile || !existsSync(config.configFile)) {
      return false;
    }

    const currentModified = this.getFileModifiedTime(config.configFile);
    return currentModified !== config.lastModified;
  }

  /**
   * 获取文件修改时间
   */
  private getFileModifiedTime(filePath: string): number {
    try {
      return statSync(filePath).mtimeMs;
    } catch {
      return 0;
    }
  }

  /**
   * 查找CLI配置文件
   */
  private findCLIConfigFile(cliType: string): string | undefined {
    const possiblePaths = [
      join(homedir(), `.${cliType}`, 'config.json'),
      join(homedir(), `.${cliType}`, 'settings.json'),
      join(homedir(), `.${cliType}`, 'settings.local.json'),
      join(homedir(), '.config', cliType, 'config.json')
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return undefined;
  }

  /**
   * 发现CLI会话路径
   */
  private discoverCLIPaths(cliType: string): string[] {
    const paths: string[] = [];
    const baseDir = join(homedir(), `.${cliType}`);

    if (!existsSync(baseDir)) {
      return paths;
    }

    // 1. 从配置文件读取
    const configPath = this.findCLIConfigFile(cliType);
    if (configPath) {
      const configPaths = this.readPathsFromConfig(configPath);
      paths.push(...configPaths);
    }

    // 2. 按CLI类型的已知路径模式
    const knownPaths = this.getKnownPathPatterns(cliType, baseDir);
    paths.push(...knownPaths);

    // 3. 动态搜索常见目录名
    const discoveredPaths = this.discoverCommonDirs(baseDir);
    paths.push(...discoveredPaths);

    // 去重并过滤存在的路径
    return [...new Set(paths)].filter(p => existsSync(p));
  }

  /**
   * 从配置文件读取路径
   */
  private readPathsFromConfig(configPath: string): string[] {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      const paths: string[] = [];

      const pathKeys = ['sessionsPath', 'sessions_path', 'sessionDir', 'historyPath', 'projectsPath'];
      for (const key of pathKeys) {
        if (config[key] && existsSync(config[key])) {
          paths.push(config[key]);
        }
      }

      return paths;
    } catch {
      return [];
    }
  }

  /**
   * 获取已知的路径模式
   */
  private getKnownPathPatterns(cliType: string, baseDir: string): string[] {
    const patterns: Record<string, string[]> = {
      claude: ['projects', 'sessions'],
      gemini: ['tmp', 'sessions'],
      qwen: ['projects', 'chats'],
      iflow: ['projects', 'sessions'],
      codebuddy: ['projects', ''], // 空字符串表示根目录
      qodercli: ['projects', 'chats'],
      codex: ['sessions', 'history'],
      kode: ['projects', 'sessions', 'conversations']
    };

    const cliPatterns = patterns[cliType] || ['sessions', 'projects'];
    return cliPatterns
      .map(p => p ? join(baseDir, p) : baseDir)
      .filter(p => existsSync(p));
  }

  /**
   * 动态发现常见目录
   */
  private discoverCommonDirs(baseDir: string): string[] {
    const commonNames = ['sessions', 'projects', 'chats', 'conversations', 'history', 'tmp'];
    const discovered: string[] = [];

    for (const name of commonNames) {
      const path = join(baseDir, name);
      if (existsSync(path)) {
        try {
          if (statSync(path).isDirectory()) {
            discovered.push(path);
          }
        } catch {
          continue;
        }
      }
    }

    return discovered;
  }

  /**
   * 获取缓存统计信息
   */
  getCacheInfo(): { exists: boolean; version?: string; updatedAt?: Date; cliCount?: number } {
    if (!this.cache) {
      this.loadOrDiscoverPaths();
    }

    return {
      exists: !!this.cache,
      version: this.cache?.version,
      updatedAt: this.cache ? new Date(this.cache.updatedAt) : undefined,
      cliCount: this.cache ? Object.keys(this.cache.cliConfigs).length : 0
    };
  }

  /**
   * 清除缓存（用于测试或强制重新发现）
   */
  clearCache(): void {
    this.cache = null;
    if (existsSync(this.configPath)) {
      try {
        require('fs').unlinkSync(this.configPath);
      } catch (error) {
        console.error('[PathConfig] Failed to delete cache file:', (error as Error).message);
      }
    }
  }
}
