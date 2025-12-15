#!/usr/bin/env node
/**
 * Stigmergy CLI v1.2.5 最终验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('✅ Stigmergy CLI v1.2.5 最终验证');
console.log('===================================');

// 验证关键文件
const keyFiles = [
  {
    path: 'dist/package.json',
    check: (content) => content.includes('"version": "1.2.5"'),
    description: '版本号 1.2.5'
  },
  {
    path: 'dist/src/core/coordination/nodejs/HookDeploymentManager.js',
    check: (content) => content.includes('请用') && content.includes('调用'),
    description: '中文钩子模式支持'
  },
  {
    path: 'dist/RELEASE_NOTES_v1.2.5.md',
    check: (content) => content.includes('中英文双语钩子指令支持'),
    description: '发布说明完整性'
  }
];

let allPassed = true;

for (const file of keyFiles) {
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    if (file.check(content)) {
      console.log(`✅ ${file.description}`);
    } else {
      console.log(`❌ ${file.description}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${file.description} (文件未找到)`);
    allPassed = false;
  }
}

// 验证目录结构
const requiredDirs = [
  'dist/src',
  'dist/bin',
  'dist/config',
  'dist/templates',
  'dist/scripts'
];

for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${path.basename(dir)} 目录存在`);
  } else {
    console.log(`❌ ${path.basename(dir)} 目录缺失`);
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 所有验证通过！Stigmergy CLI v1.2.5 已准备好发布！');
  console.log('\n📦 发布包位置: ./dist');
  console.log('\n✨ 主要特性:');
  console.log('   • 中英文双语钩子指令支持');
  console.log('   • 8个主流AI CLI工具集成');
  console.log('   • 全局钩子部署机制');
  console.log('   • 跨CLI工具无缝协作');
} else {
  console.log('❌ 验证失败，请检查上述问题');
  process.exit(1);
}