import { ClaudeSlashIntegration } from './ClaudeSlashIntegration';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface CLIIntegration {
  name: string;
  cliType: string;
  install(): Promise<boolean>;
  isInstalled(): Promise<boolean>;
  test(): Promise<boolean>;
  uninstall(): Promise<boolean>;
  generateUsageDocs(): string;
}

/**
 * Universal Slash Command Installer
 * Installs /history slash commands for all supported CLI tools
 */
export class SlashCommandInstaller {
  private static instance: SlashCommandInstaller;
  private integrations: Map<string, CLIIntegration> = new Map();

  private constructor() {
    this.initializeIntegrations();
  }

  static getInstance(): SlashCommandInstaller {
    if (!SlashCommandInstaller.instance) {
      SlashCommandInstaller.instance = new SlashCommandInstaller();
    }
    return SlashCommandInstaller.instance;
  }

  /**
   * Initialize all available CLI integrations
   */
  private initializeIntegrations(): void {
    // Claude CLI
    this.integrations.set('claude', new ClaudeSlashIntegration());

    // Note: Other CLI integrations will be added similarly
    // this.integrations.set('gemini', new GeminiSlashIntegration());
    // this.integrations.set('qwen', new QwenSlashIntegration());
    // this.integrations.set('iflow', new IFlowSlashIntegration());
    // this.integrations.set('codebuddy', new CodeBuddySlashIntegration());
    // this.integrations.set('codex', new CodexSlashIntegration());
    // this.integrations.set('qodercli', new QoderCLISlashIntegration());
  }

  /**
   * Install slash commands for a specific CLI
   */
  async installForCLI(cliType: string): Promise<boolean> {
    Logger.exporterInfo(`Installing slash commands for ${cliType}`);

    const integration = this.integrations.get(cliType);
    if (!integration) {
      Logger.exporterWarn(`No integration available for CLI: ${cliType}`);
      return false;
    }

    try {
      const success = await integration.install();

      if (success) {
        // Test the installation
        const testResult = await integration.test();
        if (testResult) {
          Logger.exporterInfo(`✅ Slash commands installed successfully for ${cliType}`);
          return true;
        } else {
          Logger.exporterWarn(`⚠️  Installation succeeded but tests failed for ${cliType}`);
          return false;
        }
      } else {
        Logger.exporterError(`❌ Installation failed for ${cliType}`);
        return false;
      }

    } catch (error) {
      Logger.exporterError(`Installation error for ${cliType}`, error as Error);
      return false;
    }
  }

  /**
   * Install slash commands for all available CLI tools
   */
  async installForAll(): Promise<{ success: string[]; failed: string[] }> {
    Logger.exporterInfo('Installing slash commands for all CLI tools');

    const results = { success: [], failed: [] } as { success: string[]; failed: string[] };

    for (const [cliType, integration] of this.integrations) {
      try {
        const success = await integration.install();
        if (success) {
          results.success.push(cliType);
          Logger.exporterInfo(`✅ Installed for ${cliType}`);
        } else {
          results.failed.push(cliType);
          Logger.exporterWarn(`❌ Failed to install for ${cliType}`);
        }
      } catch (error) {
        results.failed.push(cliType);
        Logger.exporterError(`Installation error for ${cliType}`, error as Error);
      }
    }

    Logger.exporterInfo(`Installation completed: ${results.success.length} success, ${results.failed.length} failed`);
    return results;
  }

  /**
   * Check installation status for all CLI tools
   */
  async checkAllStatus(): Promise<Map<string, { installed: boolean; status: string }>> {
    const status = new Map<string, { installed: boolean; status: string }>();

    for (const [cliType, integration] of this.integrations) {
      try {
        const installed = await integration.isInstalled();
        status.set(cliType, {
          installed,
          status: installed ? 'Installed' : 'Not installed'
        });
      } catch (error) {
        status.set(cliType, {
          installed: false,
          status: `Error: ${(error as Error).message}`
        });
      }
    }

    return status;
  }

  /**
   * Generate installation report
   */
  async generateReport(): Promise<string> {
    const status = await this.checkAllStatus();

    let report = `# Cross-CLI Slash Commands Installation Report\n\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    report += `## Installation Status\n\n`;

    let installedCount = 0;
    for (const [cliType, info] of status) {
      const icon = info.installed ? '✅' : '❌';
      report += `${icon} **${cliType.toUpperCase()}** - ${info.status}\n`;
      if (info.installed) installedCount++;
    }

    report += `\n**Summary:** ${installedCount}/${status.size} CLI tools have slash commands installed.\n\n`;

    report += `## Available Commands\n\n`;
    report += `Once installed, you can use these commands in any supported CLI:\n\n`;
    report += `- \`/history\` - Show cross-CLI session history\n`;
    report += `- \`/history --cli <tool>\` - Show history from specific CLI\n`;
    report += `- \`/history --search <keyword>\` - Search sessions\n`;
    report += `- \`/history --format detailed\` - Show detailed information\n`;
    report += `- \`/history --format context\` - Get context for continuation\n`;
    report += `- \`/history-help\` - Show help information\n\n`;

    report += `## Usage Examples\n\n`;
    report += `\`\`\`\n`;
    report += `/history                    # Show all sessions\n`;
    report += `/history --limit 10         # Show 10 most recent\n`;
    report += `/history --cli claude       # Show Claude sessions only\n`;
    report += `/history --search "React"   # Search for React\n`;
    report += `/history --format context   # Get context to continue\n`;
    report += `\`\`\`\n\n`;

    // Add specific installation instructions for each CLI
    report += `## CLI-Specific Instructions\n\n`;

    for (const [cliType, integration] of this.integrations) {
      const isInstalled = status.get(cliType)?.installed || false;
      if (isInstalled) {
        report += `### ${cliType.toUpperCase()}\n`;
        report += integration.generateUsageDocs();
        report += `\n\n`;
      }
    }

    return report;
  }

  /**
   * Uninstall slash commands for a specific CLI
   */
  async uninstallForCLI(cliType: string): Promise<boolean> {
    Logger.exporterInfo(`Uninstalling slash commands for ${cliType}`);

    const integration = this.integrations.get(cliType);
    if (!integration) {
      Logger.exporterWarn(`No integration available for CLI: ${cliType}`);
      return false;
    }

    try {
      const success = await integration.uninstall();
      if (success) {
        Logger.exporterInfo(`✅ Uninstalled slash commands for ${cliType}`);
      } else {
        Logger.exporterWarn(`❌ Failed to uninstall slash commands for ${cliType}`);
      }
      return success;
    } catch (error) {
      Logger.exporterError(`Uninstallation error for ${cliType}`, error as Error);
      return false;
    }
  }

  /**
   * Uninstall slash commands for all CLI tools
   */
  async uninstallForAll(): Promise<{ success: string[]; failed: string[] }> {
    Logger.exporterInfo('Uninstalling slash commands for all CLI tools');

    const results = { success: [], failed: [] } as { success: string[]; failed: string[] };

    for (const [cliType, integration] of this.integrations) {
      try {
        const success = await integration.uninstall();
        if (success) {
          results.success.push(cliType);
        } else {
          results.failed.push(cliType);
        }
      } catch (error) {
        results.failed.push(cliType);
      }
    }

    return results;
  }

  /**
   * Get all available integrations
   */
  getAvailableIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }

  /**
   * Add a custom integration
   */
  addIntegration(cliType: string, integration: CLIIntegration): void {
    this.integrations.set(cliType, integration);
    Logger.exporterInfo(`Added custom integration for ${cliType}`);
  }
}