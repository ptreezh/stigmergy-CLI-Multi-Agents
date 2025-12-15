#!/usr/bin/env node

/**
 * Demonstration of Cross-CLI /history slash commands
 * Shows how to integrate /history commands into any CLI tool
 */

console.log('ðŸŒ Cross-CLI /history Slash Commands Demo');
console.log('=====================================\n');

// Example implementation for any CLI tool
class CrossCLIHistoryHandler {
  constructor() {
    console.log('ðŸ”§ Initializing Cross-CLI History Handler...\n');
    this.demonstrateIntegration();
  }

  // This is the core handler that would be integrated into any CLI
  async handleHistoryCommand(input, currentCLI = 'demo') {
    console.log(`ðŸ“ Processing: ${input} (as ${currentCLI})\n`);

    try {
      // Parse the command
      const options = this.parseCommand(input);
      console.log('ðŸ” Command options:', options);

      // Simulate session discovery (in real implementation, this would use the scanner)
      const mockSessions = this.generateMockSessions(currentCLI);

      // Format response based on CLI type
      const response = this.formatResponse(mockSessions, options, currentCLI);

      console.log('âœ?Response:\n');
      console.log(response);

      return {
        success: true,
        response,
        suggestions: this.generateSuggestions(mockSessions)
      };

    } catch (error) {
      console.error('â?Error:', error.message);
      return {
        success: false,
        error: error.message,
        suggestions: []
      };
    }
  }

  parseCommand(input) {
    const options = { limit: 10, format: 'summary' };
    const cleanInput = input.replace(/^\/history\s*/i, '').trim();
    const parts = cleanInput.split(/\s+/).filter(p => p.length > 0);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      if (part === '--cli' && i + 1 < parts.length) {
        options.cli = parts[++i];
      } else if (part === '--search' && i + 1 < parts.length) {
        options.search = parts[++i];
      } else if (part === '--limit' && i + 1 < parts.length) {
        options.limit = parseInt(parts[++i]);
      } else if (part === '--format') {
        options.format = parts[i + 1] || 'summary';
        i++;
      } else if (part === '--context') {
        options.format = 'context';
      } else if (!part.startsWith('--') && !options.search) {
        options.search = part;
      }
    }

    return options;
  }

  generateMockSessions(currentCLI) {
    const sessions = [
      {
        metadata: {
          cliType: 'claude',
          sessionId: 'claude-123',
          title: 'React component development discussion',
          updatedAt: new Date(Date.now() - 86400000),
          messageCount: 15,
          projectPath: '/projects/react-app'
        },
        {
          metadata: {
            cliType: 'gemini',
            sessionId: 'gemini-456',
            title: 'TypeScript type system questions',
            updatedAt: new Date(Date.now() - 172800000),
            messageCount: 8,
            projectPath: '/projects/ts-learning'
        },
        {
          metadata: {
            cliType: 'qwen',
            sessionId: 'qwen-789',
            title: 'Python data analysis workflow',
            updatedAt: new Date(Date.now() - 259200000),
            messageCount: 12,
            projectPath: '/projects/data-analysis'
        },
        {
          metadata: {
            cliType: 'iflow',
            sessionId: 'iflow-012',
            title: 'Database migration strategy',
            updatedAt: new Date(Date.now() - 345600000),
            messageCount: 20,
            projectPath: '/projects/db-migration'
        }
    ];

    // Prioritize sessions from current CLI
    return [
      ...sessions.filter(s => s.metadata.cliType === currentCLI),
      ...sessions.filter(s => s.metadata.cliType !== currentCLI)
    ];
  }

  formatResponse(sessions, options, currentCLI) {
    if (sessions.length === 0) {
      return 'ðŸ“­ No history sessions found. Use `/history --search <keyword>` to search.';
    }

    if (options.format === 'context' && sessions.length > 0) {
      const session = sessions[0];
      return `ðŸ”„ **Context Recovery - ${session.metadata.cliType.toUpperCase()}**

ðŸ“… Session: ${session.metadata.updatedAt.toLocaleString()}
ðŸ“ Project: ${session.metadata.projectPath}
ðŸ’¬ ${session.metadata.messageCount} messages

---
**Previous Discussion:**
This was a conversation about ${session.metadata.title.toLowerCase()}.

To continue this discussion, you can ask questions related to the previous context or request to expand on specific topics that were discussed.`;
    }

    let response = `ðŸ“š Found ${sessions.length} history sessions:\n\n`;

    // Group by CLI
    const byCLI = {};
    sessions.forEach(session => {
      if (!byCLI[session.metadata.cliType]) byCLI[session.metadata.cliType] = [];
      byCLI[session.metadata.cliType].push(session);
    });

    Object.entries(byCLI).forEach(([cli, cliSessions]) => {
      const icon = cli === currentCLI ? 'ðŸŸ¢' : 'ðŸ”µ';
      response += `${icon} **${cli.toUpperCase()}** (${cliSessions.length} sessions)\n`;

      cliSessions.slice(0, 3).forEach((session, i) => {
        const date = session.metadata.updatedAt.toLocaleDateString();
        const title = session.metadata.title.substring(0, 60);
        response += `   ${i + 1}. ${title} (${date})\n`;
        response += `      Session ID: \`${session.metadata.sessionId}\`\n`;
      });

      if (cliSessions.length > 3) {
        response += `   ... and ${cliSessions.length - 3} more\n`;
      }
      response += '\n';
    });

    response += `ðŸ’¡ **Usage:**\n`;
    response += `â€?\`/history --cli <tool>\` - Show specific CLI\n`;
    response += `â€?\`/history --search <keyword>\` - Search content\n`;
    response += `â€?\`/history --context\` - Get context recovery\n`;

    return response;
  }

  generateSuggestions(sessions) {
    if (sessions.length === 0) {
      return ['/history --search "help"', '/history --format context'];
    }

    return [
      '/history --format context',
      '/history --search "code"',
      `/history --cli ${sessions[0].metadata.cliType}`,
      '/export-session ' + sessions[0].metadata.sessionId
    ];
  }

  demonstrateIntegration() {
    console.log('ðŸ“‹ Integration Examples for Different CLI Tools:\n');

    // Claude CLI Example
    console.log('ðŸ”µ Claude CLI Integration:');
    console.log('```javascript');
    console.log('// Add to Claude CLI slash command handler');
    console.log('const handler = new CrossCLIHistoryHandler();');
    console.log('if (input.startsWith("/history")) {');
    console.log('  const result = await handler.handleHistoryCommand(input, "claude");');
    console.log('  console.log(result.response);');
    console.log('  // Handle suggestions...');
    console.log('}');
    console.log('```\n');

    // Gemini CLI Example
    console.log('ðŸŸ¢ Gemini CLI Integration:');
    console.log('```javascript');
    console.log('// Add to Gemini CLI command processor');
    console.log('const historyHandler = new CrossCLIHistoryHandler();');
    console.log('if (input.startsWith("/history")) {');
    console.log('  return await historyHandler.handleHistoryCommand(input, "gemini");');
    console.log('}');
    console.log('```\n');

    // Generic CLI Example
    console.log('ðŸ”§ Generic CLI Integration:');
    console.log('```javascript');
    console.log('// Universal integration for any CLI');
    console.log('class YourCLIHistoryHandler extends CrossCLIHistoryHandler {');
    console.log('  constructor() {');
    console.log('    super();');
    console.log('    this.cliType = "your-cli";');
    console.log('  }');
    console.log('}');
    console.log('```\n');

    console.log('ðŸš€ Key Features:\n');
    console.log('â€?âœ?Cross-CLI session discovery');
    console.log('â€?âœ?Unified /history command');
    console.log('â€?âœ?CLI-specific filtering');
    console.log('â€?âœ?Content search');
    console.log('â€?âœ?Context recovery');
    console.log('â€?âœ?Session export');
    console.log('â€?âœ?Smart suggestions');
  }

  showUsageHelp() {
    console.log('ðŸ“– /history Command Reference:\n');
    console.log('Basic Commands:');
    console.log('  /history                           - Show all sessions');
    console.log('  /history --limit 5                 - Show 5 most recent');
    console.log('  /history --cli claude              - Show Claude sessions only');
    console.log('  /history --search "react"         - Search for React');
    console.log('  /history --format context         - Get context to continue');
    console.log('  /history --format detailed        - Show detailed info');
    console.log('  /history-help                      - Show help\n');
    console.log('Advanced Features:');
    console.log('  â€?Automatic CLI detection');
    console.log('  â€?Cross-CLI search and filtering');
    console.log('  â€?Context recovery for continuation');
    console.log('  â€?Smart session recommendations');
    console.log('  â€?Session export and import');
  }
}

// Demo the functionality
async function runDemo() {
  const handler = new CrossCLIHistoryHandler();

  console.log('ðŸ§ª Testing /history commands:\n');

  // Test different commands
  const testCommands = [
    '/history',
    '/history --limit 3',
    '/history --cli claude',
    '/history --search "component"',
    '/history --format context'
  ];

  for (const command of testCommands) {
    console.log('â”€'.repeat(60));
    await handler.handleHistoryCommand(command, 'claude');
    console.log('\n');
  }

  console.log('ðŸŽ‰ Demo completed successfully!\n');
  console.log('ðŸ’¡ To integrate this into your CLI tool:');
  console.log('   1. Copy the integration code above');
  console.log('   2. Add the /history command handler');
  console.log('   3. Test with your CLI tool');
}

// Run demo
runDemo().catch(console.error);
