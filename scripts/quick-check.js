#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Stigmergy 发布前快速检查\n');
console.log('='.repeat(60));

const errors = [];
const warnings = [];
const passed = [];

// 检查文件是否存在
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    passed.push(`✓ ${description}`);
    return true;
  } else {
    errors.push(`✗ ${description} 不存在: ${filePath}`);
    return false;
  }
}

// 检查目录
function checkDir(dirPath, description) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath);
    passed.push(`✓ ${description} (${files.length} 个文件)`);
    return files.length > 0;
  } else {
    errors.push(`✗ ${description} 不存在或为空`);
    return false;
  }
}

console.log('\n📦 检查必需文件...\n');

// 检查 package.json
checkFile('package.json', 'package.json');

// 检查 bin 文件
checkFile('bin/stigmergy', 'bin/stigmergy');

// 检查主入口
checkFile('src/index.js', 'src/index.js');

// 检查 README
checkFile('README.md', 'README.md');

// 检查 LICENSE
checkFile('LICENSE', 'LICENSE');

// 检查 STIGMERGY.md
checkFile('STIGMERGY.md', 'STIGMERGY.md');

console.log('\n🔨 检查 TypeScript 编译产物...\n');

// 检查 dist/orchestration
checkDir('dist/orchestration', 'dist/orchestration/');

// 检查一些关键的编译文件
checkFile('dist/orchestration/core/CentralOrchestrator.js', 'CentralOrchestrator.js');
checkFile('dist/orchestration/events/EventBus.js', 'EventBus.js');
checkFile('dist/orchestration/hooks/HookSystem.js', 'HookSystem.js');

console.log('\n📄 检查配置文件...\n');

// 检查 .npmignore
checkFile('.npmignore', '.npmignore');

// 读取 package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

console.log('\n📊 包信息:\n');
console.log(`  名称: ${pkg.name}`);
console.log(`  版本: ${pkg.version}`);
console.log(`  主入口: ${pkg.main}`);
console.log(`  bin: ${Object.keys(pkg.bin || {}).join(', ')}`);
console.log(`  files 字段:`);
(pkg.files || []).forEach(f => console.log(`    - ${f}`));

console.log('\n📦 依赖统计:\n');
console.log(`  生产依赖: ${Object.keys(pkg.dependencies || {}).length} 个`);
console.log(`  开发依赖: ${Object.keys(pkg.devDependencies || {}).length} 个 (不会发布)`);

console.log('\n' + '='.repeat(60));
console.log('📊 检查结果总结');
console.log('='.repeat(60));

if (passed.length > 0) {
  console.log('\n✅ 通过的检查:');
  passed.forEach(msg => console.log(`  ${msg}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  警告:');
  warnings.forEach(msg => console.log(`  ${msg}`));
}

if (errors.length > 0) {
  console.log('\n❌ 错误:');
  errors.forEach(msg => console.log(`  ${msg}`));
}

console.log('\n' + '='.repeat(60));

if (errors.length > 0) {
  console.log('\n❌ 发现错误，请修复后再发布！\n');
  process.exit(1);
} else {
  console.log('\n✅ 所有关键检查通过，可以发布！\n');
  console.log('🚀 下一步操作:\n');
  console.log('  1. 运行: npm run build:orchestration');
  console.log('  2. 预览: npm pack --dry-run');
  console.log('  3. 发布: npm publish --tag beta\n');
  process.exit(0);
}
