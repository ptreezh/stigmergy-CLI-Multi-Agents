#!/usr/bin/env node
/**
 * 为所有CLI工具添加中文钩子指令匹配
 */

const fs = require('fs');
const path = require('path');

const hookDir = path.join(process.env.HOME || process.env.USERPROFILE, '.stigmergy', 'hooks');
const clis = ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'];

// 中文模式匹配规则
const chinesePatterns = [
  /请用(\\w+)\\s*帮我(.+)$/i,           // 请用copilot帮我创建React组件
  /调用(\\w+)\\s*来(.+)$/i,              // 调用qwen来解释量子计算
  /用(\\w+)\\s*帮我(.+)$/i,              // 用claude帮我写Python函数
  /(\\w+)，(.+)$/i,                      // copilot，请创建React组件
  /让(\\w+)\\s*(.+)$/i                   // 让gemini解释这段代码
];

for (const cli of clis) {
  const hookPath = path.join(hookDir, cli, `${cli}_nodejs_hook.js`);
  
  if (fs.existsSync(hookPath)) {
    console.log(`Updating ${cli} hook with Chinese patterns...`);
    
    let content = fs.readFileSync(hookPath, 'utf8');
    
    // 找到patterns数组的位置
    const patternStart = content.indexOf('const patterns = [');
    if (patternStart !== -1) {
      // 在现有模式后添加中文模式
      const insertPos = content.indexOf('];', patternStart);
      if (insertPos !== -1) {
        const chinesePatternStrings = chinesePatterns.map(p => `      ${p.toString()}`).join(',\n');
        const newContent = content.substring(0, insertPos) + 
                          ',\n' + chinesePatternStrings + 
                          '\n    ];' + 
                          content.substring(insertPos + 2);
        
        fs.writeFileSync(hookPath, newContent, 'utf8');
        console.log(`✅ Updated ${cli} hook with Chinese patterns`);
      }
    }
  } else {
    console.log(`❌ ${cli} hook not found`);
  }
}

console.log('All hooks updated with Chinese pattern matching!');