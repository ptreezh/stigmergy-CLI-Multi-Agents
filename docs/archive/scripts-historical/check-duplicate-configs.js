#!/usr/bin/env node
/**
 * 配置一致性检查脚本
 * 检测 cli_tools.js 中的重复定义
 */

const fs = require('fs');
const path = require('path');

const cliToolsPath = path.join(__dirname, '..', 'src', 'core', 'cli_tools.js');
const content = fs.readFileSync(cliToolsPath, 'utf-8');
const lines = content.split('\n');

const defs = [];
lines.forEach((l, i) => {
  const m = l.match(/^  (\w+):\s*\{/);
  if (m && !['skills', 'plugins'].includes(m[1])) {
    defs.push({ line: i + 1, name: m[1] });
  }
});

const counts = {};
defs.forEach(d => { counts[d.name] = (counts[d.name] || 0) + 1; });

const dupes = Object.entries(counts).filter(([k, v]) => v > 1);

if (dupes.length > 0) {
  console.error('❌ 发现重复定义:');
  dupes.forEach(([k, v]) => {
    const locs = defs.filter(d => d.name === k).map(d => d.line);
    console.error(`  ${k}: ${v} 次 (行 ${locs.join(', ')})`);
  });
  process.exit(1);
} else {
  console.log('✅ 配置一致性检查通过: 无重复定义');
}
