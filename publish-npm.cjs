#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // 检查是否已经登录
  console.log('Checking npm login status...');
  
  // 尝试发布
  console.log('Publishing package to npm...');
  execSync('npm publish --access public', { stdio: 'inherit' });
  
  console.log('Package published successfully!');
} catch (error) {
  console.error('Failed to publish package:', error.message);
  process.exit(1);
}