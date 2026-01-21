#!/usr/bin/env node
/**
 * Stigmergy CLI 构建脚本 (跳过测试版本)
 * Version: 1.2.5
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Stigmergy CLI 构建脚本 (跳过测试)');
console.log('====================================');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
if (majorVersion < 16) {
  console.error('❌ Node.js版本必须 >= 16.0.0');
  process.exit(1);
}

console.log(`✅ Node.js版本检查通过: ${nodeVersion}`);

// 检查必要的文件
const requiredFiles = [
  'package.json',
  'src/index.js',
  'src/cli/router.js',
  'src/core/coordination/nodejs/HookDeploymentManager.js',
  'src/core/coordination/nodejs/CLCommunication.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ 必要文件缺失: ${file}`);
    process.exit(1);
  }
}

console.log('✅ 所有必需文件存在');

// 创建发布包
console.log('\n📦 创建发布包...');

// 确保dist目录存在
const distDir = 'dist';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// 复制必要文件
const filesToCopy = [
  'package.json',
  'README.md',
  'LICENSE',
  'STIGMERGY.md',
  'RELEASE_NOTES_v1.2.5.md'
];

for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    const dest = path.join(distDir, file);
    fs.copyFileSync(file, dest);
    console.log(`  复制: ${file}`);
  }
}

// 复制目录
const dirsToCopy = [
  'src',
  'bin',
  'config',
  'templates',
  'scripts',
  'test',
  'examples',
  'docs'
];

for (const dir of dirsToCopy) {
  if (fs.existsSync(dir)) {
    const dest = path.join(distDir, dir);
    copyDirRecursive(dir, dest);
    console.log(`  复制目录: ${dir}`);
  }
}

console.log('\n✅ 发布包创建完成');

// 显示发布说明
console.log('\n📝 发布说明 (v1.2.5):');
console.log('========================');
console.log('新增功能:');
console.log('  • 中英文双语钩子指令支持');
console.log('  • 支持8个主流AI CLI工具');
console.log('  • 全局钩子部署机制');
console.log('技术改进:');
console.log('  • 修复正则表达式问题');
console.log('  • 增强模式匹配准确性');
console.log('  • 改进参数处理机制');

console.log('\n🚀 构建完成! 发布包位于: ./dist');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}