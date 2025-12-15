#!/usr/bin/env node

/**
 * Simple test for SessionExporter
 */

const { SessionExporter } = require('./dist/lib');

console.log('üß™ Testing SessionExporter...');

try {
  const exporter = new SessionExporter();
  console.log('‚ú?Exporter created');

  const sampleSession = {
    metadata: {
      cliType: 'claude',
      sessionId: 'test-session',
      filePath: '/tmp/test.json',
      projectPath: process.cwd(),
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 2,
      totalTokens: 100,
      title: 'Test Session'
    },
    messages: [
      {
        role: 'user',
        content: 'Hello, how are you?',
        timestamp: new Date(),
        metadata: {}
      },
      {
        role: 'assistant',
        content: 'I am doing well, thank you!',
        timestamp: new Date(),
        metadata: {
          model: 'claude-3-sonnet',
          tokens: 50
        }
      }
    ]
  };

  console.log('‚ú?Sample session created');

  // Test markdown export
  console.log('üìù Testing markdown export...');
  exporter.exportSession(sampleSession, 'markdown').then(markdown => {
    console.log(`‚ú?Markdown export: ${markdown.length} characters`);
    console.log('Preview:');
    console.log(markdown.substring(0, 200) + '...');

    // Test JSON export
    console.log('\nüìÑ Testing JSON export...');
    return exporter.exportSession(sampleSession, 'json');
  }).then(json => {
    console.log(`‚ú?JSON export: ${json.length} characters`);

    // Test context export
    console.log('\nüí¨ Testing context export...');
    return exporter.exportSession(sampleSession, 'context');
  }).then(context => {
    console.log(`‚ú?Context export: ${context.length} characters`);
    console.log('Preview:');
    console.log(context.substring(0, 200) + '...');

    console.log('\nüéâ All tests passed!');
  }).catch(error => {
    console.error('‚ù?Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });

} catch (error) {
  console.error('‚ù?Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
