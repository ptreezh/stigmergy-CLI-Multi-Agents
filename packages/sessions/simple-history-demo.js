#!/usr/bin/env node

/**
 * Simple demonstration of Cross-CLI /history functionality
 * Shows how to add /history commands to any CLI tool
 */

console.log('ğŸŒ Cross-CLI /history Slash Commands');
console.log('=================================\n');

// Example: History command handler for any CLI
function createHistoryHandler(cliType = 'demo') {
  return {
    async handleHistory(input) {
      console.log(`ğŸ“ Processing: ${input} (from ${cliType})\n`);

      // Parse command
      const cleanInput = input.replace(/^\/history\s*/i, '').trim();

      // Mock session data (in real implementation, this would scan actual sessions)
      const mockSessions = [
        {
          cli: 'claude',
          id: 'claude-123',
          title: 'React component development',
          date: new Date(Date.now() - 86400000),
          messages: 15
        },
        {
          cli: 'gemini',
          id: 'gemini-456',
          title: 'TypeScript questions',
          date: new Date(Date.now() - 172800000),
          messages: 8
        },
        {
          cli: 'qwen',
          id: 'qwen-789',
          title: 'Python data analysis',
          date: new Date(Date.now() - 259200000),
          messages: 12
        }
      ];

      // Format response
      let response = `ğŸ“š Found ${mockSessions.length} history sessions:\n\n`;

      mockSessions.forEach((session, i) => {
        const icon = session.cli === cliType ? 'ğŸŸ¢' : 'ğŸ”µ';
        response += `${i + 1}. ${icon} ${session.cli.toUpperCase()}: ${session.title}\n`;
        response += `   ğŸ“… ${session.date.toLocaleDateString()} â€?ğŸ’¬ ${session.messages} messages\n`;
        response += `   ğŸ†” Session ID: ${session.id}\n\n`;
      });

      response += `ğŸ’¡ Usage:\n`;
      response += `â€?/history --cli <tool> - Show specific CLI\n`;
      response += `â€?/history --search <keyword> - Search content\n`;
      response += `â€?/history --format context - Get context to continue\n`;

      console.log(response);

      return {
        success: true,
        suggestions: ['/history --format context', '/history --search "help"']
      };
    }
  };
}

// Demonstrate different CLI integrations
console.log('ğŸ”§ Integration Examples:\n');

console.log('1. Claude CLI Integration:');
console.log(`
const claudeHandler = createHistoryHandler('claude');

// In Claude CLI input handler:
if (userInput.startsWith('/history')) {
  const result = await claudeHandler.handleHistory(userInput);
  return result.response;
}
`);

console.log('2. Gemini CLI Integration:');
console.log(`
const geminiHandler = createHistoryHandler('gemini');

// In Gemini CLI command processor:
if (input.startsWith('/history')) {
  return await geminiHandler.handleHistory(input);
}
`);

console.log('3. Generic CLI Integration:');
console.log(`
const yourHandler = createHistoryHandler('your-cli');

// Universal pattern for any CLI:
if (input.startsWith('/history')) {
  const result = await yourHandler.handleHistory(input);
  // Display result.response in your CLI format
}
`);

// Demo the functionality
console.log('\nğŸ§ª Demo /history command:\n');
console.log('â”€'.repeat(50));

const handler = createHistoryHandler('claude');
handler.handleHistory('/history').then(() => {
  console.log('\nâœ?Demo completed!');
  console.log('\nğŸš€ Integration Steps:');
  console.log('1. Install cross-cli-session-recovery package');
  console.log('2. Copy the handler code into your CLI');
  console.log('3. Add /history command to your input processor');
  console.log('4. Test with: /history --help');

  console.log('\nğŸ’¡ Benefits:');
  console.log('â€?ğŸ”„ Cross-CLI session recovery');
  console.log('â€?ğŸ” Unified search across all CLI tools');
  console.log('â€?ğŸ’¬ Context recovery for continuation');
  console.log('â€?ğŸ¯ CLI-specific filtering');
  console.log('â€?ğŸ“Š Smart suggestions');
});
