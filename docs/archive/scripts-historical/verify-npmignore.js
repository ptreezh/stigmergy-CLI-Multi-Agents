#!/usr/bin/env node

/**
 * 验证 .npmignore 是否正确排除测试文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 验证 .npmignore 配置\n');
console.log('='.repeat(80));

// 读取 .npmignore
const npmignorePath = path.join(__dirname, '..', '.npmignore');
const npmignore = fs.readFileSync(npmignorePath, 'utf8');

console.log('✓ .npmignore 文件存在\n');

// 检查关键规则
const rules = [
  '**/*test*.js',
  '**/*spec*.js',
  '**/test/',
  '**/__tests__/',
  'src/core/test/',
  'src/core/skills/__tests__/',
  '**/e2e-test.js',
  '**/regression-test.js',
  '**/integration-test.js',
  '**/comprehensive-e2e-test.js',
  '**/test-runner.js',
  '**/run-all-tests.js',
  'src/commands/skill-bridge.js'
];

console.log('📋 检查关键排除规则:\n');

let allFound = true;
for (const rule of rules) {
  if (npmignore.includes(rule)) {
    console.log(`  ✓ ${rule}`);
  } else {
    console.log(`  ✗ ${rule} (未找到)`);
    allFound = false;
  }
}

if (allFound) {
  console.log('\n✅ 所有关键规则都已配置\n');
} else {
  console.log('\n⚠️  部分规则缺失\n');
}

// 尝试使用 npm pack --dry-run
console.log('📦 尝试预览 npm 包...\n');

try {
  const output = execSync('npm pack --dry-run 2>&1', {
    encoding: 'utf8',
    stdio: 'pipe'
  });

  console.log(output);

  // 检查是否包含测试文件
  const testFiles = [
    'comprehensive-e2e-test.js',
    'regression-test.js',
    'e2e-test.js',
    'integration-test.js',
    'SkillInstaller.test.js',
    'test-runner.js',
    'run-all-tests.js',
    'skill-bridge.js'
  ];

  console.log('\n🔍 检查测试文件是否被排除:\n');

  let foundTestFiles = [];
  for (const file of testFiles) {
    if (output.includes(file)) {
      foundTestFiles.push(file);
      console.log(`  ❌ ${file} - 仍然在包中！`);
    } else {
      console.log(`  ✅ ${file} - 已排除`);
    }
  }

  if (foundTestFiles.length > 0) {
    console.log(`\n⚠️  发现 ${foundTestFiles.length} 个测试文件未被排除\n`);

    console.log('💡 可能的原因:\n');
    console.log('  1. package.json 的 files 字段优先级更高');
    console.log('  2. .npmignore 规则不够精确');
    console.log('  3. 需要重新构建或清除缓存\n');

    console.log('🔧 建议的解决方案:\n');
    console.log('  方案 1: 明确指定 files 字段（不使用通配符）');
    console.log('  方案 2: 将测试文件移到 tests/ 目录');
    console.log('  方案 3: 重命名测试文件以匹配排除规则\n');
  } else {
    console.log('\n✅ 所有测试文件都已被正确排除！\n');
  }

} catch (error) {
  console.log('⚠️  无法运行 npm pack --dry-run\n');
  console.log(error.message);
}

console.log('='.repeat(80));
