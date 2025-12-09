#!/usr/bin/env node

/**
 * Stigmergy CLI 简化发布脚本
 */

const { execSync } = 'child_process';
const { readFile } from 'fs/promises';
const { join, dirname } from 'path';
const { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Stigmergy CLI 发布工具');

async function main() {
    try {
        // 读取package.json
        const packagePath = join(__dirname, 'package.json');
        const pkg = JSON.parse(await readFile(packagePath, 'utf8'));

        console.log(`📦 包名: ${pkg.name}`);
        console.log(`📦 版本: ${pkg.version}`);
        console.log(`📦 描述: ${pkg.description}`);

        // 检查必要文件
        const requiredFiles = ['src/index.js', 'package.json', 'README.md', 'LICENSE'];
        console.log('📍 检查必要文件...');

        for (const file of requiredFiles) {
            try {
                execSync(`test -f ${file}`, { cwd: __dirname });
                console.log(`✅ ${file} 存在`);
            } catch {
                console.log(`❌ ${file} 不存在`);
                throw new Error(`缺少必要文件: ${file}`);
            }
        }

        // 模拟npm发布
        console.log('📤 模拟npm发布...');
        console.log('⚠️  注意: 这是模拟发布，实际发布需要:');
        console.log('   1. npm login');
        console.log('   2. node scripts/simple-publish.js');
        console.log('   3. npm publish');

        console.log('✅ 模拟发布完成！');
        console.log('📦 包准备就绪，可以实际发布');

    } catch (error) {
        console.error('❌ 发布过程失败:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}