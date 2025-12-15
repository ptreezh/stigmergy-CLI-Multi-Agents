import { CLIAdapter } from '../types/CLIAdapter';
import { Logger, LogLevel } from '../utils/Logger';
import {
  ClaudeAdapter
} from '../adapters/ClaudeAdapter';
import {
  GeminiAdapter
} from '../adapters/GeminiAdapter';
import {
  QwenAdapter
} from '../adapters/QwenAdapter';
import {
  IFlowAdapter
} from '../adapters/IFlowAdapter';
import {
  CodeBuddyAdapter
} from '../adapters/CodeBuddyAdapter';
import {
  QoderCLIAdapter
} from '../adapters/QoderCLIAdapter';
import {
  CodexAdapter
} from '../adapters/CodexAdapter';

export interface DiscoveredCLI {
  cliType: string;
  name: string;
  version: string;
  available: boolean;
  sessionPaths: string[];
  adapter: CLIAdapter;
  lastChecked: Date;
}

export interface CLIDiscoveryConfig {
  autoDiscovery: boolean;
  checkIntervalMinutes: number;
  includeUnavailable: boolean;
  customAdapters: CLIAdapter[];
}

/**
 * CLI Discovery Service for automatic detection of available CLI tools
 * This enables true cross-CLI session recovery by discovering all installed CLI tools
 */
export class CLIDiscovery {
  private static instance: CLIDiscovery;
  private discoveredCLIs: Map<string, DiscoveredCLI> = new Map();
  private config: CLIDiscoveryConfig;
  private discoveryInterval: NodeJS.Timeout | null = null;

  private constructor(config: Partial<CLIDiscoveryConfig> = {}) {
    this.config = {
      autoDiscovery: true,
      checkIntervalMinutes: 5,
      includeUnavailable: false,
      customAdapters: [],
      ...config
    };

    Logger.scannerInfo('CLI Discovery service initialized', {
      autoDiscovery: this.config.autoDiscovery,
      checkInterval: this.config.checkIntervalMinutes
    });
  }

  static getInstance(config?: Partial<CLIDiscoveryConfig>): CLIDiscovery {
    if (!CLIDiscovery.instance) {
      CLIDiscovery.instance = new CLIDiscovery(config);
    }
    return CLIDiscovery.instance;
  }

  /**
   * Start automatic CLI discovery
   */
  startAutoDiscovery(): void {
    if (this.discoveryInterval) {
      Logger.scannerWarn('Auto discovery already running');
      return;
    }

    Logger.scannerInfo('Starting automatic CLI discovery');

    // Initial discovery
    this.discoverAllCLIs();

    // Set up periodic discovery
    if (this.config.checkIntervalMinutes > 0) {
      this.discoveryInterval = setInterval(() => {
        this.discoverAllCLIs();
      }, this.config.checkIntervalMinutes * 60 * 1000);
    }
  }

  /**
   * Stop automatic CLI discovery
   */
  stopAutoDiscovery(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
      Logger.scannerInfo('Stopped automatic CLI discovery');
    }
  }

  /**
   * Discover all available CLI tools
   */
  async discoverAllCLIs(): Promise<DiscoveredCLI[]> {
    Logger.scannerDebug('Starting CLI discovery scan');

    const adapters = [
      new ClaudeAdapter(),
      new GeminiAdapter(),
      new QwenAdapter(),
      new IFlowAdapter(),
      new CodeBuddyAdapter(),
      new QoderCLIAdapter(),
      new CodexAdapter(),
      ...this.config.customAdapters
    ];

    const discoveryPromises = adapters.map(adapter => this.discoverCLI(adapter));
    const results = await Promise.all(discoveryPromises);

    // Filter out unavailable CLI tools if not configured to include them
    const availableResults = results.filter(result =>
      this.config.includeUnavailable || result.available
    );

    Logger.scannerInfo(`CLI discovery completed`, {
      total: adapters.length,
      available: availableResults.filter(r => r.available).length,
      discovered: availableResults.length
    });

    return availableResults;
  }

  /**
   * Discover a single CLI tool
   */
  async discoverCLI(adapter: CLIAdapter): Promise<DiscoveredCLI> {
    const cliType = adapter.cliType;
    Logger.scannerDebug(`Discovering CLI: ${cliType}`);

    try {
      // Check availability
      const available = await adapter.isAvailable();

      // Get configuration
      let sessionPaths: string[] = [];
      let version = 'unknown';

      if (available) {
        try {
          const config = await adapter.getCLIConfig();
          sessionPaths = config.sessionPaths;
          version = config.version || 'unknown';
        } catch (configError) {
          Logger.scannerWarn(`Failed to get config for ${cliType}`, {
            error: (configError as Error).message
          });
        }
      }

      const discovered: DiscoveredCLI = {
        cliType,
        name: adapter.name,
        version,
        available,
        sessionPaths,
        adapter,
        lastChecked: new Date()
      };

      // Store in cache
      this.discoveredCLIs.set(cliType, discovered);

      Logger.scannerDebug(`CLI discovery result: ${cliType}`, {
        available,
        sessionPaths: sessionPaths.length,
        version
      });

      return discovered;

    } catch (error) {
      Logger.scannerError(`CLI discovery failed for ${cliType}`, error as Error);

      const discovered: DiscoveredCLI = {
        cliType,
        name: adapter.name,
        version: 'unknown',
        available: false,
        sessionPaths: [],
        adapter,
        lastChecked: new Date()
      };

      this.discoveredCLIs.set(cliType, discovered);
      return discovered;
    }
  }

  /**
   * Get all discovered CLI tools
   */
  getAllDiscoveredCLIs(): DiscoveredCLI[] {
    return Array.from(this.discoveredCLIs.values());
  }

  /**
   * Get only available CLI tools
   */
  getAvailableCLIs(): DiscoveredCLI[] {
    return this.getAllDiscoveredCLIs().filter(cli => cli.available);
  }

  /**
   * Get CLI by type
   */
  getCLIByType(cliType: string): DiscoveredCLI | undefined {
    return this.discoveredCLIs.get(cliType);
  }

  /**
   * Get all available adapters (convenience method)
   */
  getAvailableAdapters(): CLIAdapter[] {
    return this.getAvailableCLIs().map(cli => cli.adapter);
  }

  /**
   * Check if a specific CLI type is available
   */
  isCLIAvailable(cliType: string): boolean {
    const cli = this.discoveredCLIs.get(cliType);
    return cli?.available || false;
  }

  /**
   * Get discovery statistics
   */
  getDiscoveryStats(): {
    total: number;
    available: number;
    unavailable: number;
    lastDiscovered: Date | null;
  } {
    const all = this.getAllDiscoveredCLIs();
    const available = all.filter(cli => cli.available);
    const lastChecked = all.length > 0
      ? new Date(Math.max(...all.map(cli => cli.lastChecked.getTime())))
      : null;

    return {
      total: all.length,
      available: available.length,
      unavailable: all.length - available.length,
      lastDiscovered: lastChecked
    };
  }

  /**
   * Refresh discovery for a specific CLI
   */
  async refreshCLI(cliType: string): Promise<DiscoveredCLI | null> {
    const existing = this.discoveredCLIs.get(cliType);
    if (!existing) {
      Logger.scannerWarn(`Cannot refresh unknown CLI: ${cliType}`);
      return null;
    }

    Logger.scannerInfo(`Refreshing CLI: ${cliType}`);
    return await this.discoverCLI(existing.adapter);
  }

  /**
   * Clear all discovery cache
   */
  clearCache(): void {
    this.discoveredCLIs.clear();
    Logger.scannerInfo('CLI discovery cache cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CLIDiscoveryConfig>): void {
    this.config = { ...this.config, ...newConfig };

    Logger.scannerInfo('CLI discovery config updated', this.config);

    // Restart auto discovery if needed
    if (this.config.autoDiscovery && !this.discoveryInterval) {
      this.startAutoDiscovery();
    } else if (!this.config.autoDiscovery && this.discoveryInterval) {
      this.stopAutoDiscovery();
    }
  }

  /**
   * Export discovery results for debugging
   */
  exportDiscoveryResults(): string {
    const results = this.getAllDiscoveredCLIs().map(cli => ({
      cliType: cli.cliType,
      name: cli.name,
      version: cli.version,
      available: cli.available,
      sessionPaths: cli.sessionPaths,
      lastChecked: cli.lastChecked.toISOString()
    }));

    return JSON.stringify(results, null, 2);
  }

  /**
   * Generate human-readable discovery report
   */
  generateDiscoveryReport(): string {
    const stats = this.getDiscoveryStats();
    const cliList = this.getAllDiscoveredCLIs();

    let report = `🔍 CLI Discovery Report\n`;
    report += `======================\n\n`;
    report += `📊 Summary:\n`;
    report += `   Total CLI tools discovered: ${stats.total}\n`;
    report += `   Available CLI tools: ${stats.available}\n`;
    report += `   Unavailable CLI tools: ${stats.unavailable}\n`;
    report += `   Last discovery: ${stats.lastDiscovered?.toLocaleString() || 'Never'}\n\n`;

    report += `🔧 CLI Tools Details:\n`;
    cliList.forEach((cli, index) => {
      const status = cli.available ? '✅ Available' : '❌ Unavailable';
      report += `${index + 1}. ${cli.name} (${cli.cliType})\n`;
      report += `   Status: ${status}\n`;
      report += `   Version: ${cli.version}\n`;
      report += `   Session paths: ${cli.sessionPaths.length}\n`;
      report += `   Last checked: ${cli.lastChecked.toLocaleString()}\n\n`;
    });

    return report;
  }
}