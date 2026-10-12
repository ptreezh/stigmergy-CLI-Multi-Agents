#!/usr/bin/env node
/**
 * 硬编码路径检查脚本
 * 检测 *.js 文件中的硬编码绝对路径
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

// 匹配 Windows 路径 (如 D:\xxx, C:\xxx) 和 macOS 路径 (如 /Users/xxx)
const windowsPathPattern = /[A-Z]:\\[^\s"']+/gi;
const macosPathPattern = /\/Users\/[^\s"']+/gi;

for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    // 跳过注释
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    const windowsMatches = line.match(windowsPathPattern);
    const macosMatches = line.match(macosPathPattern);

    if (windowsMatches || macosMatches) {
      const relPath = path.relative(path.join(__dirname, '..'), file);
      console.error(`❌ 硬编码路径: ${relPath}:${i + 1}`);
      if (windowsMatches) windowsMatches.forEach(m => console.error(`    Windows: ${m}`));
      if (macosMatches) macosMatches.forEach(m => console.error(`    macOS: ${m}`));
      found = true;
    }
  });
}

if (found) {
  console.error('\n修复建议: 使用 path.join(__dirname, ...) 或 os.homedir()');
  process.exit(1);
} else {
  console.log('✅ 硬编码路径检查通过: 无硬编码绝对路径');
}
