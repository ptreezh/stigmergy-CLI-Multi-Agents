#!/usr/bin/env node

/**
 * Post-uninstall script for Stigmergy CLI
 * Provides information about what remains after uninstallation
 */

console.log('\n📋 POST-UNINSTALLATION REPORT');
console.log('=============================');
console.log('');
console.log('✅ The enhanced uninstaller has completed and removed:');
console.log('   • Stigmergy configuration directories (~/.stigmergy)');
console.log('   • Integration hooks from major AI CLI tools');
console.log('   • Cache files and temporary files');
console.log('   • Cross-CLI communication configurations');
console.log('');
console.log('⚠️  The following items were NOT removed (by design):');
console.log('');
console.log('   Individual AI CLI tools (still installed globally):');
console.log('     • @anthropic-ai/claude-code');
console.log('     • @google/gemini-cli'); 
console.log('     • @qwen-code/qwen-code');
console.log('     • @iflow-ai/iflow-cli');
console.log('     • @qoder-ai/qodercli');
console.log('     • @tencent-ai/codebuddy-code');
console.log('     • @github/copilot');
console.log('     • @openai/codex');
console.log('');
console.log('   Project-level files:');
console.log('     • Any project-specific configurations');
console.log('     • Any generated documentation files');
console.log('     • Any custom hooks or integrations you added manually');
console.log('');
console.log('🔄 If you wish to remove individual AI CLI tools:');
console.log('');
console.log('   For Claude:    npm uninstall -g @anthropic-ai/claude-code');
console.log('   For Gemini:    npm uninstall -g @google/gemini-cli');
console.log('   For Qwen:      npm uninstall -g @qwen-code/qwen-code');
console.log('   For iFlow:     npm uninstall -g @iflow-ai/iflow-cli');
console.log('   For QoderCLI:  npm uninstall -g @qoder-ai/qodercli');
console.log('   For CodeBuddy: npm uninstall -g @tencent-ai/codebuddy-code');
console.log('   For Copilot:   npm uninstall -g @github/copilot');
console.log('   For Codex:     npm uninstall -g @openai/codex');
console.log('');
console.log('🙏 Thank you for using Stigmergy CLI!');
console.log('');