#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 GitHub Packages Setup and Publish Script');

try {
  // 检查是否提供了GitHub令牌
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('❌ Error: GITHUB_TOKEN environment variable not set');
    console.log('💡 Please create a GitHub Personal Access Token with packages permissions and set it:');
    console.log('   Windows CMD: set GITHUB_TOKEN=your_github_token_here');
    console.log('   Windows PowerShell: $env:GITHUB_TOKEN="your_github_token_here"');
    console.log('   Mac/Linux: export GITHUB_TOKEN=your_github_token_here');
    console.log('\n📝 GitHub Token Permissions Needed:');
    console.log('   - read:packages');
    console.log('   - write:packages');
    console.log('   - delete:packages');
    process.exit(1);
  }

  // 创建或更新.npmrc文件
  console.log('📝 Creating/updating .npmrc configuration...');
  const npmrcContent = `@ptreezh:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`;
  
  fs.writeFileSync('.npmrc', npmrcContent);
  console.log('✅ .npmrc file created');

  // 设置npm配置
  console.log('🔐 Setting up npm configuration...');
  execSync('npm config set @ptreezh:registry https://npm.pkg.github.com', { stdio: 'inherit' });
  execSync(`npm config set //npm.pkg.github.com/:_authToken ${githubToken}`, { stdio: 'inherit' });

  // 获取包信息
  const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
  const packageName = packageInfo.name;
  const fullPackageName = `@ptreezh/${packageName}`;
  
  console.log(`📦 Package name: ${packageName}`);
  console.log(`🏷️  Full package name: ${fullPackageName}`);

  // 检查包是否已存在
  console.log('🔍 Checking if package exists...');
  try {
    execSync(`npm view ${fullPackageName} versions --json --registry=https://npm.pkg.github.com`, { stdio: 'pipe' });
    console.log('⚠️  Package already exists. This will be an update.');
  } catch (error) {
    console.log('✅ Package does not exist yet. This will be a new publish.');
  }

  // 发布到GitHub Packages
  console.log('📤 Publishing to GitHub Packages...');
  execSync('npm publish --registry=https://npm.pkg.github.com --access public', { stdio: 'inherit' });

  console.log('🎉 Package published successfully to GitHub Packages!');
  console.log('\n📥 To install your package, users need to:');
  console.log('   1. Create a .npmrc file in their project with:');
  console.log('      @ptreezh:registry=https://npm.pkg.github.com');
  console.log(`   2. Run: npm install ${fullPackageName}`);
  console.log(`   3. Or run: npx ${fullPackageName}`);

  console.log('\n💡 For global installation:');
  console.log(`   npm install -g ${fullPackageName}`);

} catch (error) {
  console.error('❌ Publish failed:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure your GitHub token has packages permissions');
  console.log('2. Verify the token is correct and not expired');
  console.log('3. Check if you have write access to the repository');
  console.log('4. Ensure the package name follows npm naming conventions');
  console.log('5. Try clearing npm cache: npm cache clean --force');
  process.exit(1);
}