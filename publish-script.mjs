#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting npm publish process...');

try {
  // 检查是否提供了认证令牌
  const authToken = process.env.NPM_AUTH_TOKEN;
  if (!authToken) {
    console.error('❌ Error: NPM_AUTH_TOKEN environment variable not set');
    console.log('💡 Please set your npm auth token:');
    console.log('   Windows CMD: set NPM_AUTH_TOKEN=your_token_here');
    console.log('   Windows PowerShell: $env:NPM_AUTH_TOKEN="your_token_here"');
    console.log('   Mac/Linux: export NPM_AUTH_TOKEN=your_token_here');
    process.exit(1);
  }

  // 设置认证令牌
  console.log('🔐 Setting up authentication...');
  execSync(`npm config set //registry.npmjs.org/:_authToken ${authToken}`, { stdio: 'inherit' });

  // 清理可能存在的旧配置
  execSync('npm config delete @ptreezh:registry', { stdio: 'inherit' });
  execSync('npm config delete //npm.pkg.github.com/:_authToken', { stdio: 'inherit' });

  // 设置正确的注册表
  execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });

  // 检查包名是否已被占用
  const packageName = JSON.parse(fs.readFileSync('./package.json')).name;
  console.log(`📦 Checking if package ${packageName} exists...`);

  try {
    execSync(`npm view ${packageName} versions --json`, { stdio: 'pipe' });
    console.log(`⚠️  Warning: Package ${packageName} already exists. This might be an update.`);
  } catch (error) {
    console.log(`✅ Package ${packageName} is available for publishing.`);
  }

  // 发布包
  console.log('📤 Publishing package...');
  execSync('npm publish --access public', { stdio: 'inherit' });

  console.log('🎉 Package published successfully!');
  console.log(`🔗 You can now install it with: npm install -g ${packageName}`);
  console.log(`🔧 Or run it with: npx ${packageName}`);

} catch (error) {
  console.error('❌ Publish failed:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure your npm token has publish permissions');
  console.log('2. Check if the package name is already taken');
  console.log('3. Verify your internet connection');
  console.log('4. Try clearing npm cache: npm cache clean --force');
  process.exit(1);
}