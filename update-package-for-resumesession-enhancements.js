#!/usr/bin/env node

/**
 * 更新发布包以包含 resumesession 增强功能
 * 
 * 此脚本将：
 * 1. 验证修改过的文件
 * 2. 打包项目以供发布
 * 3. 准备发布说明
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始更新发布包以包含 resumesession 增强功能...\n');

// 检查修改的文件
const modifiedFiles = [
  'skills/resumesession/independent-resume.js',
  'RESUMESESSION_ENHANCEMENT_SUMMARY.md'
];

console.log('🔍 检查修改的文件...');
for (const file of modifiedFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} - 存在`);
  } else {
    console.log(`  ❌ ${file} - 不存在`);
  }
}

console.log('\n📦 创建发布包...');
try {
  const result = execSync('npm pack', { encoding: 'utf8' });
  console.log('  ✅ npm pack 执行成功');
  
  // 查找生成的包文件
  const files = fs.readdirSync(__dirname);
  const packageFiles = files.filter(f => f.startsWith('stigmergy-') && f.endsWith('.tgz'));
  
  if (packageFiles.length > 0) {
    const packageName = packageFiles[0];
    const packageSize = fs.statSync(packageName).size;
    console.log(`  📦 生成的包: ${packageName} (${(packageSize / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.log('  ❌ 未找到生成的包文件');
  }
} catch (error) {
  console.error('  ❌ npm pack 执行失败:', error.message);
}

console.log('\n📋 更新 CHANGELOG...');

// 读取当前的 CHANGELOG
const changelogPath = path.join(__dirname, 'CHANGELOG.md');
let changelogContent = '';

if (fs.existsSync(changelogPath)) {
  changelogContent = fs.readFileSync(changelogPath, 'utf8');
}

// 准备新的更改日志条目
const newChangelogEntry = `## v${require('./package.json').version} - ${new Date().toISOString().split('T')[0]}
### Features
- 增强 resumesession 技能功能
  - 实现智能累积机制，当会话内容不足时自动追加更多会话
  - 只显示用户输入、模型输出和时间戳信息，去除冗余格式
  - 添加内容过滤功能，剔除无意义内容（如API超限提示）
  - 按日期分组显示，标注每组的起始和结束时间
  - 当没有会话时返回"无"

`;

// 将新条目插入到现有内容的开头
const updatedChangelog = newChangelogEntry + changelogContent;

try {
  fs.writeFileSync(changelogPath, updatedChangelog);
  console.log('  ✅ CHANGELOG.md 已更新');
} catch (error) {
  console.error('  ❌ 更新 CHANGELOG.md 失败:', error.message);
}

console.log('\n✅ 发布包更新完成!');
console.log('\n下一步操作:');
console.log('1. 检查生成的包内容是否包含所有修改');
console.log('2. 如果满意，可以发布到 npm:');
console.log('   npm publish --tag beta');
console.log('3. 或发布到最新版本:');
console.log('   npm publish');