import { SlashCommandExtensions } from '../core/SlashCommandExtensions';
import { Logger } from '../utils/Logger';

/**
 * Direct CLI Extensions - Ready-to-use code snippets for different CLI platforms
 * These can be directly copied into the respective CLI codebases
 */
export class DirectCLIExtensions {
  private static instance: DirectCLIExtensions;

  private constructor() {}

  static getInstance(): DirectCLIExtensions {
    if (!DirectCLIExtensions.instance) {
      DirectCLIExtensions.instance = new DirectCLIExtensions();
    }
    return DirectCLIExtensions.instance;
  }

  /**
   * Generate Claude CLI extension code
   */
  generateClaudeExtension(): string {
    return `// Claude CLI Cross-CLI History Extension
// Add this code to Claude CLI's slash command handler

const { CrossCLISlashCommands } = require('cross-cli-session-recovery');

async function handleHistoryCommand(input, context) {
  try {
    const slashCommands = CrossCLISlashCommands.getInstance();
    const result = await slashCommands.handleHistoryCommand(input, 'claude');

    if (result.success) {
      return {
        response: result.content,
        suggestions: result.suggestions || []
      };
    } else {
      return {
        response: result.error || 'Command failed',
        suggestions: []
      };
    }
  } catch (error) {
    console.error('History command error:', error);
    return {
      response: '❌ Cross-CLI history command failed',
      suggestions: []
    };
  }
}

// Register the slash command
const slashCommands = {
  '/history': handleHistoryCommand,
  '/history-help': () => ({
    response: \`\${slashCommands.generateHelp()}\`,
    suggestions: []
  })
};

// Usage in Claude CLI:
// When user input starts with '/', check slashCommands and execute accordingly
// Example: if (input.startsWith('/history')) { return await slashCommands['/history'](input); }`;
  }

  /**
   * Generate Gemini CLI extension code
   */
  generateGeminiExtension(): string {
    return `// Gemini CLI Cross-CLI History Extension
// Add this to Gemini CLI's command processing system

import { CrossCLISlashCommands } from 'cross-cli-session-recovery';

class GeminiHistoryHandler {
  constructor() {
    this.slashCommands = new CrossCLISlashCommands();
  }

  async handleHistory(input, session) {
    try {
      const result = await this.slashCommands.handleHistoryCommand(input, 'gemini');

      return {
        text: result.success ? result.content : result.error,
        continue: true,
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error('Gemini history error:', error);
      return {
        text: '❌ Cross-CLI history command failed',
        continue: true,
        suggestions: []
      };
    }
  }

  getHelp() {
    return this.slashCommands.generateHelp();
  }
}

// Integration in Gemini CLI:
// const historyHandler = new GeminiHistoryHandler();
// if (input.startsWith('/history')) {
//   return await historyHandler.handleHistory(input, session);
// }`;
  }

  /**
   * Generate Qwen CLI extension code
   */
  generateQwenExtension(): string {
    return `// Qwen CLI Cross-CLI History Extension
// Add to Qwen CLI's command handler

const { CrossCLISlashCommands } = require('cross-cli-session-recovery');

class QwenHistoryExtension {
  constructor() {
    this.commands = new CrossCLISlashCommands();
  }

  async processCommand(input, context) {
    if (!input.startsWith('/history')) return null;

    try {
      const result = await this.commands.handleHistoryCommand(input, 'qwen');

      return {
        response: result.success ? result.content : result.error,
        success: result.success,
        followUp: result.suggestions || []
      };
    } catch (error) {
      console.error('Qwen history error:', error);
      return {
        response: '❌ Cross-CLI history failed',
        success: false,
        followUp: []
      };
    }
  }

  getAvailableCommands() {
    return {
      '/history': 'Show cross-CLI session history',
      '/history-help': 'Show help for history commands'
    };
  }
}

// Usage in Qwen CLI:
// const historyExt = new QwenHistoryExtension();
// const result = await historyExt.processCommand(userInput, context);
// if (result) { return result.response; }`;
  }

  /**
   * Generate IFlow CLI extension code
   */
  generateIFlowExtension(): string {
    return `// IFlow CLI Cross-CLI History Extension
// Integrate with IFlow's stigmergy command system

const { CrossCLISlashCommands } = require('cross-cli-session-recovery');

class IFlowHistoryHandler {
  constructor() {
    this.crossCLI = new CrossCLISlashCommands();
  }

  async handleCommand(command, args, workflow) {
    if (command !== 'history') return null;

    try {
      const input = '/history' + (args.length > 0 ? ' ' + args.join(' ') : '');
      const result = await this.crossCLI.handleHistoryCommand(input, 'iflow');

      return {
        success: result.success,
        output: result.success ? result.content : result.error,
        metadata: {
          suggestions: result.suggestions || [],
          context: result.context
        }
      };
    } catch (error) {
      console.error('IFlow history error:', error);
      return {
        success: false,
        output: '❌ Cross-CLI history command failed',
        metadata: { error: error.message }
      };
    }
  }

  registerWithStigmergy(stigmergy) {
    stigmergy.addCommand('history', this.handleCommand.bind(this), {
      description: 'Show cross-CLI session history',
      usage: 'history [--cli <tool>] [--search <term>] [--context]',
      examples: [
        'history',
        'history --cli claude',
        'history --search "react"',
        'history --context'
      ]
    });
  }
}

// Usage in IFlow CLI:
// const historyHandler = new IFlowHistoryHandler();
// historyHandler.registerWithStigmergy(stigmergy);`;
  }

  /**
   * Generate generic CLI extension code
   */
  generateGenericExtension(cliType: string): string {
    return `// ${cliType.toUpperCase()} CLI Cross-CLI History Extension
// Generic integration for any CLI tool

import { CrossCLISlashCommands } from 'cross-cli-session-recovery';

class ${cliType.charAt(0).toUpperCase() + cliType.slice(1)}HistoryHandler {
  constructor() {
    this.slashCommands = new CrossCLISlashCommands();
    this.cliType = '${cliType}';
  }

  async handleSlashCommand(input, context) {
    if (!input.startsWith('/history')) return null;

    try {
      const result = await this.slashCommands.handleHistoryCommand(input, this.cliType);

      return {
        success: result.success,
        response: result.success ? result.content : result.error,
        suggestions: result.suggestions || [],
        context: result.context
      };
    } catch (error) {
      console.error(\`${this.cliType} history error:\`, error);
      return {
        success: false,
        response: '❌ Cross-CLI history command failed',
        suggestions: [],
        context: null
      };
    }
  }

  getCommandHelp() {
    return this.slashCommands.generateHelp();
  }

  // Example integration:
  // const handler = new ${cliType.charAt(0).toUpperCase() + cliType.slice(1)}HistoryHandler();
  //
  // In your CLI's input handler:
  // if (input.startsWith('/')) {
  //   const result = await handler.handleSlashCommand(input, context);
  //   if (result) {
  //     console.log(result.response);
  //     if (result.suggestions.length > 0) {
  //       console.log('Suggestions:', result.suggestions);
  //     }
  //     return true; // Command handled
  //   }
  // }
}`;
  }

  /**
   * Generate package.json installation script
   */
  generateInstallationScript(): string {
    return `#!/bin/bash

# Cross-CLI History Extension Installation Script
echo "🚀 Installing Cross-CLI History Extensions..."

# Install the cross-cli-session-recovery package
npm install -g cross-cli-session-recovery

echo "✅ Package installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the extension code for your CLI tool"
echo "2. Integrate the /history command handler"
echo "3. Test with: /history --help"
echo ""
echo "📚 Documentation: https://github.com/your-repo/cross-cli-session-recovery"

# Test installation
echo ""
echo "🧪 Testing installation..."
if command -v ccsr &> /dev/null; then
    echo "✅ CCSR command available"
    ccsr --version
else
    echo "❌ CCSR command not found"
fi`;
  }

  /**
   * Generate all CLI extensions
   */
  generateAllExtensions(): Record<string, string> {
    return {
      claude: this.generateClaudeExtension(),
      gemini: this.generateGeminiExtension(),
      qwen: this.generateQwenExtension(),
      iflow: this.generateIFlowExtension(),
      install: this.generateInstallationScript()
    };
  }

  /**
   * Save extensions to files
   */
  async saveExtensions(outputDir: string): Promise<void> {
    const fs = require('fs-extra');
    await fs.ensureDir(outputDir);

    const extensions = this.generateAllExtensions();

    for (const [cliName, code] of Object.entries(extensions)) {
      const filename = `${cliName}-extension.${cliName === 'install' ? 'sh' : 'js'}`;
      await fs.writeFile(`${outputDir}/${filename}`, code);
    }

    Logger.exporterInfo(`Extensions saved to ${outputDir}`);
  }
}