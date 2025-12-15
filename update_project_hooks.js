#!/usr/bin/env node
/**
 * 更新项目中的钩子模板以支持中英文模式匹配
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const projectRoot = '.';
const hookDeploymentManagerPath = path.join(projectRoot, 'src', 'core', 'coordination', 'nodejs', 'HookDeploymentManager.js');

if (fs.existsSync(hookDeploymentManagerPath)) {
  console.log('Updating HookDeploymentManager.js...');
  
  let content = fs.readFileSync(hookDeploymentManagerPath, 'utf8');
  
  // 查找并替换模式匹配部分
  const oldPatternSection = `detectCrossCLIRequest(prompt) {
    // Enhanced pattern matching for cross-CLI requests
    const patterns = [
      /(?:use|call|ask)\\\\s+(\\\\w+)\\\\s+(?:to|for)\\\\s+(.+)$/i,
      /(?:please\\\\s+)?(?:use|call|ask)\\\\s+(\\\\w+)\\\\s+(.+)$/i,
      /(\\\\w+)[,\\\\s]+(?:please\\\\s+)?(?:help\\\\s+me\\\\s+)?(.+)$/i
    ];`;
  
  const newPatternSection = `detectCrossCLIRequest(prompt) {
    // Enhanced pattern matching for cross-CLI requests
    const patterns = [
      /(?:use|call|ask)\\s+(\\w+)\\s+(?:to|for)\\s+(.+)$/i,
      /(?:please\\s+)?(?:use|call|ask)\\s+(\\w+)\\s+(.+)$/i,
      /(\\w+)[,\\s]+(?:please\\s+)?(?:help\\s+me\\s+)?(.+)$/i,
      /请用(\\w+)\\s*帮我(.+)$/i,
      /调用(\\w+)\\s*来(.+)$/i,
      /用(\\w+)\\s*帮我(.+)$/i,
      /(\\w+)，(.+)$/i,
      /让(\\w+)\\s*(.+)$/i
    ];`;
  
  content = content.replace(oldPatternSection, newPatternSection);
  
  // 修复所有双反斜杠
  content = content.replace(/\\\\\\\\/g, '\\\\');
  
  fs.writeFileSync(hookDeploymentManagerPath, content, 'utf8');
  console.log('✅ HookDeploymentManager.js updated successfully!');
} else {
  console.log('❌ HookDeploymentManager.js not found');
}

console.log('All project files updated with Chinese pattern matching support!');