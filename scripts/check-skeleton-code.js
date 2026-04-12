#!/usr/bin/env node
/**
 * 空壳代码检测脚本
 * 检测只有 console.log 和 TODO 的实现
 */

const fs = require('fs');
const path = require('path');

function findJSFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
        findJSFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = path.join(__dirname, '..', 'src');
const jsFiles = findJSFiles(srcDir);

let found = false;

for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // 查找 async 函数
  const funcRegex = /async\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match;

  while ((match = funcRegex.exec(content)) !== null) {
    const funcName = match[1];
    const startIndex = match.index;

    // 找到函数体结束位置（简单的匹配）
    const funcContent = content.substring(startIndex, startIndex + 500);

    // 检查是否是空壳: 只有 console.log 或 TODO
    const hasRealLogic = /return\s+[^c]|throw\s|await\s|spawn|exec|require|import/.test(funcContent);
    const hasOnlyConsole = /^[\s\S]*console\.log[\s\S]*$/.test(funcContent) && !hasRealLogic;
    const hasOnlyTODO = /TODO|FIXME|后续|待实现/.test(funcContent) && !hasRealLogic;

    if ((hasOnlyConsole || hasOnlyTODO) && !hasRealLogic && funcContent.length < 200) {
      const relPath = path.relative(path.join(__dirname, '..'), file);
      const lineNum = content.substring(0, startIndex).split('\n').length;
      console.error(`⚠️  可能的空壳实现: ${relPath}:${lineNum} - ${funcName}()`);
      found = true;
    }
  }
}

if (found) {
  console.error('\n注意: 请确认以上实现是否完整，而非仅占位符');
  process.exit(0); // 不阻断 CI，仅警告
} else {
  console.log('✅ 空壳代码检查通过: 无可疑空壳实现');
}
