#!/usr/bin/env node
/**
 * 修复所有Stigmergy钩子文件中的正则表达式
 */

const fs = require('fs');
const path = require('path');

const hookDir = path.join(process.env.HOME || process.env.USERPROFILE, '.stigmergy', 'hooks');
const clis = ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'];

for (const cli of clis) {
  const hookPath = path.join(hookDir, cli, `${cli}_nodejs_hook.js`);
  
  if (fs.existsSync(hookPath)) {
    console.log(`Fixing ${cli} hook...`);
    
    let content = fs.readFileSync(hookPath, 'utf8');
    
    // 修复正则表达式中的双反斜杠
    content = content.replace(/\\\\/g, '\\');
    
    fs.writeFileSync(hookPath, content, 'utf8');
    console.log(`✅ Fixed ${cli} hook`);
  } else {
    console.log(`❌ ${cli} hook not found`);
  }
}

console.log('All hooks fixed!');