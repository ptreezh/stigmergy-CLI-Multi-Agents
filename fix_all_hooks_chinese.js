#!/usr/bin/env node
/**
 * 为所有CLI工具修复中文钩子指令匹配
 */

const fs = require('fs');
const path = require('path');

const hookDir = path.join(process.env.HOME || process.env.USERPROFILE, '.stigmergy', 'hooks');
const clis = ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'];

// 正确的模式数组
const correctPatterns = `[
      /(?:use|call|ask)\\s+(\\w+)\\s+(?:to|for)\\s+(.+)$/i,
      /(?:please\\s+)?(?:use|call|ask)\\s+(\\w+)\\s+(.+)$/i,
      /(\\w+)[,\\s]+(?:please\\s+)?(?:help\\s+me\\s+)?(.+)$/i,
      /请用(\\w+)\\s*帮我(.+)$/i,
      /调用(\\w+)\\s*来(.+)$/i,
      /用(\\w+)\\s*帮我(.+)$/i,
      /(\\w+)，(.+)$/i,
      /让(\\w+)\\s*(.+)$/i
    ]`;

for (const cli of clis) {
  const hookPath = path.join(hookDir, cli, `${cli}_nodejs_hook.js`);
  
  if (fs.existsSync(hookPath)) {
    console.log(`Fixing ${cli} hook...`);
    
    let content = fs.readFileSync(hookPath, 'utf8');
    
    // 替换整个patterns数组
    content = content.replace(
      /const patterns = \[[\s\S]*?\];/m,
      `const patterns = ${correctPatterns};`
    );
    
    // 修复所有双反斜杠
    content = content.replace(/\\\\/g, '\\');
    
    fs.writeFileSync(hookPath, content, 'utf8');
    console.log(`✅ Fixed ${cli} hook`);
  } else {
    console.log(`❌ ${cli} hook not found`);
  }
}

console.log('All hooks fixed with Chinese pattern matching!');