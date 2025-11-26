#!/usr/bin/env node

/**
 * 测试部署脚本
 */

import { spawn } from 'child_process';

console.log('🧪 测试 Stigmergy CLI 部署脚本...\n');

console.log('📋 测试项目：');

// 测试扫描功能
console.log('1. 测试扫描功能...');
const scanResult = spawn('node', ['src/main.js', 'scan'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

scanResult.stdout.on('data', (data) => {
    process.stdout.write(data);
});

scanResult.on('close', (code) => {
    console.log(`扫描完成，退出码: ${code}\n`);

    if (code === 0) {
        console.log('✅ 扫描测试通过');
    } else {
        console.log('❌ 扫描测试失败');
    }
});

// 测试状态功能
setTimeout(() => {
    console.log('2. 测试状态功能...');
    const statusResult = spawn('node', ['src/main.js', 'status'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    statusResult.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    statusResult.on('close', (code) => {
        console.log(`状态检查完成，退出码: ${code}\n`);

        if (code === 0) {
            console.log('✅ 状态测试通过');
        } else {
            console.log('❌ 状态测试失败');
        }
    });
}, 3000);