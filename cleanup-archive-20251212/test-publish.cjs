#!/usr/bin/env node

console.log('🚀 Stigmergy CLI 发布状态检查');

const fs = require('fs');
const path = require('path');

try {
    // 检查package.json
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    console.log(`📦 包名: ${pkg.name}`);
    console.log(`📦 版本: ${pkg.version}`);
    console.log(`📦 描述: ${pkg.description}`);

    // 检查必要文件
    const requiredFiles = ['src/main.js', 'package.json', 'README.md'];
    console.log('📍 检查必要文件...');

    let allFilesExist = true;
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} 存在`);
        } else {
            console.log(`❌ ${file} 不存在`);
            allFilesExist = false;
        }
    }

    if (allFilesExist) {
        console.log('✅ 所有必要文件存在，包已准备发布！');
        console.log('');
        console.log('📤 实际发布命令:');
        console.log('   1. npm login');
        console.log('   2. npm publish --access public');
        console.log('');
        console.log('⚠️  当前状态: 准备就绪，需要实际npm发布');
    } else {
        console.log('❌ 缺少必要文件，无法发布');
    }

} catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
}