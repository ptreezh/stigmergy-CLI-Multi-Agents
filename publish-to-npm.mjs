#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Publishing stigmergy to npm public registry...');

try {
  // 检查是否提供了npm认证令牌
  const npmToken = process.env.NPM_AUTH_TOKEN;
  if (!npmToken) {
    console.error('❌ Error: NPM_AUTH_TOKEN environment variable not set');
    console.log('\n💡 Please create an npm automation token and set it:');
    console.log('   Windows CMD: set NPM_AUTH_TOKEN=your_npm_token_here');
    console.log('   Windows PowerShell: $env:NPM_AUTH_TOKEN="your_npm_token_here"');
    console.log('   Mac/Linux: export NPM_AUTH_TOKEN=your_npm_token_here');
    console.log('\n📝 How to get npm token:');
    console.log('   1. Visit https://www.npmjs.com/');
    console.log('   2. Login to your account (niuxiaozhang)');
    console.log('   3. Go to Settings > Access Tokens');
    console.log('   4. Click "Generate New Token"');
    console.log('   5. Select "Automation" type');
    console.log('   6. Copy the generated token');
    process.exit(1);
  }

  // 清理可能存在的GitHub Packages配置
  console.log('🧹 Cleaning GitHub Packages configuration...');
  try {
    execSync('npm config delete @ptreezh:registry', { stdio: 'pipe' });
    execSync('npm config delete //npm.pkg.github.com/:_authToken', { stdio: 'pipe' });
  } catch (error) {
    // 忽略删除不存在配置的错误
  }

  // 设置npm公共注册表
  console.log('🌐 Setting npm public registry...');
  execSync('npm config set registry https://registry.npmjs.org/', { stdio: 'inherit' });

  // 设置认证令牌
  console.log('🔐 Setting authentication token...');
  execSync(`npm config set //registry.npmjs.org/:_authToken ${npmToken}`, { stdio: 'inherit' });

  // 获取包信息
  const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
  const packageName = packageInfo.name;
  const packageVersion = packageInfo.version;
  
  console.log(`📦 Package: ${packageName}@${packageVersion}`);

  // 检查包是否已存在
  console.log('🔍 Checking package availability...');
  try {
    execSync(`npm view ${packageName} versions --json`, { stdio: 'pipe' });
    console.log('⚠️  Package already exists. This will be a version update.');
  } catch (error) {
    console.log('✅ Package name is available for first publish!');
  }

  // 打包项目
  console.log('📦 Packing project...');
  execSync('npm pack', { stdio: 'inherit' });

  // 发布到npm公共注册表
  console.log('📤 Publishing to npm public registry...');
  execSync('npm publish --access public', { stdio: 'inherit' });

  console.log('\n🎉 Success! Package published to npm!');
  console.log(`\n📥 Users can now install and use your package:`);
  console.log(`   npx stigmergy`);
  console.log(`   npm install -g stigmergy`);
  console.log(`   npx stigmergy --help`);

} catch (error) {
  console.error('❌ Publish failed:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Verify your npm token is correct and has publish permissions');
  console.log('2. Check if the token has expired (tokens expire after 90 days)');
  console.log('3. Ensure you have internet connectivity');
  console.log('4. Try clearing npm cache: npm cache clean --force');
  console.log('5. Check npm status: https://status.npmjs.org/');
  process.exit(1);
}