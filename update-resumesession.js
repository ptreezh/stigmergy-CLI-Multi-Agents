#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 ResumeSession 更新脚本\n');
console.log('这个脚本会帮你更�?resumesession 包并发布新版本。\n');

// 1. 检查当前版�?try {
  const packageJson = require('./package.json');
  console.log(`📦 当前版本: ${packageJson.version || '未知'}`);
} catch (e) {
  console.log('⚠️  无法找到 package.json');
}

console.log('\n📋 更新步骤:');
console.log('1. 应用修复补丁到源代码');
console.log('2. 更新版本�?);
console.log('3. 构建项目');
console.log('4. 发布�?npm');

// 检查是否有 resumesession 目录
const resumesessionDirs = [
  './resumesession',
  './node_modules/resumesession',
  '../resumesession'
];

let resumesessionPath = null;
for (const dir of resumesessionDirs) {
  if (fs.existsSync(dir)) {
    resumesessionPath = dir;
    break;
  }
}

if (resumesessionPath) {
  console.log(`\n�?找到 resumesession 目录: ${resumesessionPath}`);
} else {
  console.log('\n�?未找�?resumesession 源代码目�?);
  console.log('\n请确�?resumesession 源代码在以下位置之一�?);
  resumesessionDirs.forEach(dir => console.log(`  - ${dir}`));
  console.log('\n或者手动应用补丁文件：resumesession-detection-fix.patch');
}
