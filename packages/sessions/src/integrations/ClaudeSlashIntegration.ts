import { CrossCLISlashCommands } from '../core/CrossCLISlashCommands';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

/**
 * Claude CLI Slash Commands Integration
 * Provides /history and other slash commands for Claude CLI
 */
export class ClaudeSlashIntegration {
  private crossCLISlashCommands: CrossCLISlashCommands;
  private hooksDirectory: string;

  constructor() {
    this.crossCLISlashCommands = CrossCLISlashCommands.getInstance();
    this.hooksDirectory = path.join(os.homedir(), '.claude', 'hooks');
  }

  /**
   * Install Claude CLI slash command hooks
   */
  async install(): Promise<boolean> {
    Logger.exporterInfo('Installing Claude CLI slash commands integration');

    try {
      // Create hooks directory if it doesn't exist
      await fs.ensureDir(this.hooksDirectory);

      // Install the main slash command handler
      const success = await this.installSlashCommandHandler();

      if (success) {
        Logger.exporterInfo('Claude CLI slash commands installed successfully');
        return true;
      } else {
        Logger.exporterError('Failed to install Claude CLI slash commands');
        return false;
      }

    } catch (error) {
      Logger.exporterError('Claude CLI installation failed', error as Error);
      return false;
    }
  }

  /**
   * Install the slash command handler file
   */
  private async installSlashCommandHandler(): Promise<boolean> {
    const handlerFile = path.join(this.hooksDirectory, 'cross-cli-history.js');

    const handlerCode = `
#!/usr/bin/env node

/**
 * Cross-CLI History Slash Command Handler for Claude CLI
 * Handles /history and other slash commands
 */

const { CrossCLISlashCommands } = require('cross-cli-session-recovery');

async function handleSlashCommand(input, context = {}) {
  try {
    const slashCommands = CrossCLISlashCommands.getInstance();

    // Parse the command
    const trimmedInput = input.trim();

    // Handle /history command
    if (trimmedInput.startsWith('/history')) {
      const result = await slashCommands.handleHistoryCommand(trimmedInput, 'claude');

      // Return formatted response for Claude CLI
      return formatClaudeResponse(result);
    }

    // Handle /history-help command
    if (trimmedInput === '/history-help' || trimmedInput === '/history --help') {
      const helpText = slashCommands.generateHelp();
      return {
        success: true,
        content: helpText,
        type: 'markdown'
      };
    }

    // Handle session export
    if (trimmedInput.startsWith('/export-session ')) {
      const sessionId = trimmedInput.replace('/export-session ', '').trim();
      const result = await slashCommands.exportSessionForContinuation(sessionId);
      return formatClaudeResponse(result);
    }

    return null; // Not a cross-cli command

  } catch (error) {
    console.error('Cross-CLI slash command error:', error);
    return {
      success: false,
      content: \`❌ Cross-CLI命令执行失败: \${error.message}\`,
      type: 'error'
    };
  }
}

function formatClaudeResponse(result) {
  if (!result.success) {
    return {
      content: result.content,
      type: 'error'
    };
  }

  return {
    content: result.content,
    type: 'markdown',
    suggestions: result.suggestions || [],
    context: result.context
  };
}

// Export for Claude CLI integration
module.exports = {
  handleSlashCommand,

  // Alternative interface for different hook formats
  processCommand: handleSlashCommand,

  // Metadata
  name: 'cross-cli-history',
  version: '1.0.0',
  commands: ['/history', '/history-help', '/export-session'],
  description: 'Cross-CLI session history and recovery commands'
};

// CLI execution support
if (require.main === module) {
  const input = process.argv[2] || '';
  handleSlashCommand(input)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
`;

    try {
      await fs.writeFile(handlerFile, handlerCode, 'utf-8');
      await fs.chmod(handlerFile, '755');

      // Create a simple configuration file for Claude CLI
      const configFile = path.join(this.hooksDirectory, 'cross-cli-config.json');
      const config = {
        name: 'cross-cli-history',
        enabled: true,
        commands: {
          'history': {
            description: 'Show cross-CLI session history',
            handler: 'cross-cli-history.js'
          },
          'history-help': {
            description: 'Show help for cross-CLI commands',
            handler: 'cross-cli-history.js'
          },
          'export-session': {
            description: 'Export session for continuation',
            handler: 'cross-cli-history.js',
            args: ['session-id']
          }
        },
        integration: {
          cliType: 'claude',
          version: '1.0.0',
          installDate: new Date().toISOString()
        }
      };

      await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf-8');

      Logger.exporterInfo(`Claude CLI slash handler installed: ${handlerFile}`);
      return true;

    } catch (error) {
      Logger.exporterError('Failed to install slash handler', error as Error);
      return false;
    }
  }

  /**
   * Check if Claude CLI integration is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      const handlerFile = path.join(this.hooksDirectory, 'cross-cli-history.js');
      const configFile = path.join(this.hooksDirectory, 'cross-cli-config.json');

      const handlerExists = await fs.pathExists(handlerFile);
      const configExists = await fs.pathExists(configFile);

      return handlerExists && configExists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test Claude CLI integration
   */
  async test(): Promise<boolean> {
    Logger.exporterInfo('Testing Claude CLI slash commands integration');

    try {
      // Test the handler function directly
      const testCommands = [
        '/history',
        '/history --limit 5',
        '/history --cli claude',
        '/history --search "test"',
        '/history-help',
        '/export-session test-session-123'
      ];

      for (const command of testCommands) {
        Logger.exporterDebug(`Testing command: ${command}`);

        try {
          const result = await this.executeCommand(command);
          if (result && result.success !== false) {
            Logger.exporterInfo(`✅ Command test passed: ${command}`);
          } else {
            Logger.exporterWarn(`⚠️  Command test warning: ${command} - ${result?.error || 'Unknown error'}`);
          }
        } catch (error) {
          Logger.exporterError(`❌ Command test failed: ${command}`, error as Error);
        }
      }

      return true;

    } catch (error) {
      Logger.exporterError('Claude CLI integration test failed', error as Error);
      return false;
    }
  }

  /**
   * Execute a command directly (for testing)
   */
  private async executeCommand(command: string): Promise<any> {
    try {
      const result = await this.crossCLISlashCommands.handleHistoryCommand(command, 'claude');
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get installation status
   */
  async getStatus(): Promise<{
    installed: boolean;
    hooksDirectory: string;
    handlerFile: string;
    configFile: string;
    claudeDirectory: string;
  }> {
    const claudeDir = path.join(os.homedir(), '.claude');
    const handlerFile = path.join(this.hooksDirectory, 'cross-cli-history.js');
    const configFile = path.join(this.hooksDirectory, 'cross-cli-config.json');

    return {
      installed: await this.isInstalled(),
      hooksDirectory: this.hooksDirectory,
      handlerFile,
      configFile,
      claudeDirectory: claudeDir
    };
  }

  /**
   * Uninstall Claude CLI integration
   */
  async uninstall(): Promise<boolean> {
    Logger.exporterInfo('Uninstalling Claude CLI slash commands integration');

    try {
      const handlerFile = path.join(this.hooksDirectory, 'cross-cli-history.js');
      const configFile = path.join(this.hooksDirectory, 'cross-cli-config.json');

      await fs.remove(handlerFile);
      await fs.remove(configFile);

      Logger.exporterInfo('Claude CLI slash commands uninstalled');
      return true;

    } catch (error) {
      Logger.exporterError('Failed to uninstall Claude CLI integration', error as Error);
      return false;
    }
  }

  /**
   * Generate usage documentation
   */
  generateUsageDocs(): string {
    return `# Claude CLI Cross-CLI History Integration

## Installation
The integration is automatically installed in:
~/.claude/hooks/cross-cli-history.js

## Available Commands

### /history
Show cross-CLI session history from all available CLI tools.

Examples:
- /history - Show all sessions
- /history --limit 10 - Show 10 most recent sessions
- /history --cli gemini - Show only Gemini CLI sessions
- /history --search "React" - Search for React-related sessions
- /history --format detailed - Show detailed information
- /history --format context - Get context for continuation

### /history-help
Show help for cross-CLI commands.

### /export-session <session-id>
Export a specific session for continuation.

Examples:
- /export-session abc-123 - Export session abc-123

## Integration Details
- Compatible with Claude CLI v1.0+
- Supports real-time session discovery
- Provides cross-CLI search and filtering
- Includes context recovery for conversation continuation

## File Structure
~/.claude/hooks/
├── cross-cli-history.js          # Main handler
└── cross-cli-config.json        # Configuration

The integration automatically detects all available CLI tools on your system and provides unified access to their session histories.`;
  }
}