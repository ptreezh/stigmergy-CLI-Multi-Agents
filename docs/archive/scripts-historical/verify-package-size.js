#!/usr/bin/env node

/**
 * 验证优化后的包大小
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 验证优化后的包大小\n');
console.log('='.repeat(80));

// 检查 package.json 是否移除了 files 字段
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

if (pkg.files) {
  console.log('⚠️  package.json 仍然包含 files 字段\n');
  console.log('当前 files 字段:');
  console.log(JSON.stringify(pkg.files, null, 2));
  console.log('\n建议: 移除 files 字段，让 .npmignore 控制发布内容\n');
} else {
  console.log('✅ package.json 已移除 files 字段\n');
}

// 运行 npm pack
console.log('📦 正在创建 npm 包...\n');

try {
  const output = execSync('npm pack', {
    encoding: 'utf8',
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });

  console.log(output);

  // 查找生成的 tgz 文件
  const files = fs.readdirSync(path.join(__dirname, '..'));
  const tgzFile = files.find(f => f.startsWith('stigmergy-') && f.endsWith('.tgz'));

  if (tgzFile) {
    const tgzPath = path.join(__dirname, '..', tgzFile);
    const stats = fs.statSync(tgzPath);

    console.log('\n' + '='.repeat(80));
    console.log('📊 包大小分析\n');

    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`文件名: ${tgzFile}`);
    console.log(`大小: ${sizeKB} KB (${sizeMB} MB)`);
    console.log(`字节: ${stats.size} bytes\n`);

    // 比较优化前后
    const beforeSizeKB = 260.6; // 之前的大小
    const reduction = ((beforeSizeKB - parseFloat(sizeKB)) / beforeSizeKB * 100).toFixed(1);

    console.log('📈 优化效果:\n');
    console.log(`  优化前: ${beforeSizeKB} KB`);
    console.log(`  优化后: ${sizeKB} KB`);
    console.log(`  减少: ${reduction}%\n`);

    // 检查是否包含测试文件
    console.log('🔍 检查测试文件:\n');

    const packOutput = execSync(`tar -tzf "${tgzPath}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const testFiles = [
      'comprehensive-e2e-test.js',
      'regression-test.js',
      'e2e-test.js',
      'integration-test.js',
      'SkillInstaller.test.js',
      'SkillParser.test.js',
      'SkillReader.test.js',
      'test-runner.js',
      'run-all-tests.js',
      'cli-command-test.js',
      'skill-bridge.js',
      'cli-availability-checker.js',
      'test-environment.js'
    ];

    let foundTests = [];
    for (const test of testFiles) {
      if (packOutput.includes(test)) {
        foundTests.push(test);
      }
    }

    if (foundTests.length === 0) {
      console.log('✅ 所有测试文件都已成功排除！\n');
    } else {
      console.log(`⚠️  仍然包含 ${foundTests.length} 个测试文件:\n`);
      foundTests.forEach(f => console.log(`  - ${f}`));
      console.log();
    }

    console.log('='.repeat(80));

    if (parseFloat(sizeKB) < 220) {
      console.log('\n✅ 优化成功！包大小已显著减少！\n');
    } else {
      console.log('\n⚠️  包大小仍然较大，可能需要进一步优化\n');
    }
  } else {
    console.log('\n❌ 未找到 .tgz 文件，npm pack 可能失败\n');
  }

} catch (error) {
  console.error('\n❌ 错误:', error.message);
  if (error.stdout) console.error('stdout:', error.stdout);
  if (error.stderr) console.error('stderr:', error.stderr);
}
