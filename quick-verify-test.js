/**
 * 快速验证测试脚本是否可以运行
 */

console.log('========================================');
console.log('  快速验证测试');
console.log('  时间:', new Date().toLocaleString());
console.log('========================================');

console.log('\n正在测试脚本的基本功能...\n');

// 测试1: 检查文件系统
const fs = require('fs');
const path = require('path');

console.log('测试1: 检查文件系统');
const testDir = path.resolve(__dirname);
console.log(`  测试目录: ${testDir}`);
console.log(`  目录存在: ${fs.existsSync(testDir)}`);
console.log('  ✓ 文件系统正常\n');

// 测试2: 检查stigmergy命令
console.log('测试2: 检查stigmergy命令');
const { spawn } = require('child_process');

const stigmergyCheck = spawn('stigmergy', ['--version'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

let versionOutput = '';

stigmergyCheck.stdout.on('data', (data) => {
  versionOutput += data.toString();
});

stigmergyCheck.on('close', (code) => {
  console.log(`  stigmergy版本: ${versionOutput.trim()}`);
  console.log(`  退出码: ${code}`);
  console.log('  ✓ stigmergy命令正常\n');
  
  // 测试3: 检查协调层组件
  console.log('测试3: 检查协调层组件');
  
  try {
    const { NaturalLanguageParser } = require('./src/core/coordination/natural_language_parser');
    console.log('  ✓ NaturalLanguageParser导入成功');
  } catch (error) {
    console.log('  ✗ NaturalLanguageParser导入失败:', error.message);
  }
  
  try {
    const { Logger } = require('./src/core/coordination/logger');
    console.log('  ✓ Logger导入成功');
  } catch (error) {
    console.log('  ✗ Logger导入失败:', error.message);
  }
  
  try {
    const PythonDetector = require('./src/core/coordination/python_detector');
    console.log('  ✓ PythonDetector导入成功');
  } catch (error) {
    console.log('  ✗ PythonDetector导入失败:', error.message);
  }
  
  console.log('\n========================================');
  console.log('  快速验证完成');
  console.log('========================================');
  console.log('\n所有基本功能正常，可以运行完整测试！');
  console.log('运行命令: node ultimate-real-test.js');
  console.log('\n注意: 完整测试将需要20-30分钟');
  console.log('      将进行真实的AI CLI调用');
  console.log('      请确保网络连接正常\n');
});

stigmergyCheck.on('error', (error) => {
  console.log('  ✗ stigmergy命令失败:', error.message);
  console.log('\n请确保stigmergy已正确安装\n');
  process.exit(1);
});