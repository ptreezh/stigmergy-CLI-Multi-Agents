#!/usr/bin/env node

/**
 * 验证 npm 发布状态
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 验证 npm 发布状态\n');
console.log('='.repeat(80));

// 1. 检查当前是否登录 npm
console.log('\n📝 检查 npm 登录状态...\n');

try {
  const username = execSync('npm whoami', { encoding: 'utf8', stdio: 'pipe' }).trim();
  console.log(`✅ 已登录为: ${username}\n`);
} catch (error) {
  console.log('❌ 未登录 npm 或网络问题\n');
  console.log('请运行: npm login\n');
  process.exit(1);
}

// 2. 检查发布的包
console.log('📦 检查已发布的包...\n');

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const version = pkg.version;

  console.log(`尝试获取 stigmergy@${version} 信息...\n`);

  try {
    const info = execSync(`npm view stigmergy@${version} --json`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000
    });

    const pkgInfo = JSON.parse(info);

    console.log('✅ 发布成功！\n');
    console.log('📊 包信息:\n');
    console.log(`  名称: ${pkgInfo.name}`);
    console.log(`  版本: ${pkgInfo.version}`);
    console.log(`  描述: ${pkgInfo.description}`);
    console.log(`  主页: ${pkgInfo.homepage || 'N/A'}`);

    if (pkgInfo.dist) {
      console.log(`  包大小: ${(pkgInfo.dist.unpackedSize / 1024).toFixed(2)} KB`);
      console.log(`  压缩大小: ${(pkgInfo.dist.fileCount / 1024).toFixed(2)} KB`);
    }

    console.log(`\n  标签: ${Object.keys(pkgInfo['dist-tags'] || {}).join(', ')}`);
    console.log(`\n  依赖:`);
    if (pkgInfo.dependencies) {
      Object.keys(pkgInfo.dependencies).forEach(dep => {
        console.log(`    - ${dep}@${pkgInfo.dependencies[dep]}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n🎉 发布成功！用户可以安装了:\n');
    console.log(`  npm install stigmergy@${version}`);
    console.log(`  npm install stigmergy@beta`);
    console.log(`  npm install -g stigmergy@${version}\n`);

  } catch (viewError) {
    // 尝试查看最新版本
    try {
      const latestInfo = execSync('npm view stigmergy --json', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000
      });

      const latest = JSON.parse(latestInfo);

      console.log('⚠️  无法获取指定版本，但包存在于 npm\n');
      console.log('📊 最新版本信息:\n');
      console.log(`  最新版本: ${latest['dist-tags']?.latest || 'N/A'}`);
      console.log(`  Beta 版本: ${latest['dist-tags']?.beta || 'N/A'}`);
      console.log(`  所有版本: ${Object.keys(latest.versions || {}).slice(-5).join(', ')}\n`);

      if (latest['dist-tags']?.beta === version) {
        console.log('✅ Beta 版本已发布！\n');
        console.log(`  npm install stigmergy@beta\n`);
      }
    } catch (latestError) {
      console.log('❌ 无法连接到 npm registry 或包未发布\n');
      console.log('可能的原因:\n');
      console.log('  1. 网络连接问题');
      console.log('  2. npm registry 临时不可用');
      console.log('  3. 包名冲突或权限问题');
      console.log('  4. 发布失败\n');
      console.log('建议:\n');
      console.log('  1. 检查网络连接');
      console.log('  2. 稍后重试: npm view stigmergy');
      console.log('  3. 查看 npm 发布日志\n');
    }
  }

} catch (error) {
  console.log('❌ 读取 package.json 失败:', error.message);
}

console.log('='.repeat(80));
