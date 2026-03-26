#!/usr/bin/env node

/**
 * WeChat iLink 客户端启动脚本
 * 用于显示二维码并监控登录状态
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🚀 启动 Stigmergy WeChat iLink 客户端');
console.log('='.repeat(70) + '\n');

const cliType = process.argv[2] || 'claude';

// 启动客户端
const client = spawn('node', ['skills/ilink-wechat-client.js', cliType], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

client.on('error', (error) => {
  console.error('❌ 启动失败:', error);
  process.exit(1);
});

client.on('exit', (code) => {
  console.log('\n程序已退出，退出码:', code);
  process.exit(code);
});

// 保持进程运行
console.log('✅ 客户端已启动');
console.log('💡 提示：按 Ctrl+C 退出\n');
