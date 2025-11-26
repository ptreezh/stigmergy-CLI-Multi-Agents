#!/usr/bin/env node

/**
 * Stigmergy CLI 发布到NPM脚本
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';

const __filename = import.meta.url;
const __dirname = dirname(__filename);

console.log('🚀 Stigmergy CLI - NPM 发布');
console.log('=====================================');

// 1. 检查项目状态
console.log('📋 1. 检查项目文件...');
try {
    const packageJson = JSON.parse(await readFile('./package.json', 'utf8'));
    console.log(`   📦 Package: ${packageJson.name || '未知'} v${packageJson.version}`);
    console.log(`   🔧 Type: ${packageJson.type || 'not specified'}`);
    console.log(`   📚 Scripts: ${Object.keys(packageJson.scripts || {}).length > 0 ? Object.keys(packageJson.scripts).join(', ') : '无'}`);
} catch (error) {
    console.log(`❌ 读取package.json失败: ${error.message}`);
    process.exit(1);
}

// 2. 运行测试
console.log('📋 2. 运行测试...');
try {
    const testResult = spawn('npm', ['test'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        shell: true,
        cwd: __dirname
    });

    testResult.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    testResult.on('close', (code) => {
        if (code === 0) {
            console.log('✅ 测试通过');
        } else {
            console.log(`❌ 测试失败，退出码: ${code}`);
            process.exit(1);
        }
    });
} catch (error) {
    console.log(`❌ 测试执行出错: ${error.message}`);
    process.exit(1);
    }
}

// 3. 构建项目
console.log('📋 3. 构建项目...');
try {
    const buildResult = spawn('npm', ['run', 'build'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        shell: true,
        cwd: __dirname
    });

    buildResult.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    buildResult.on('close', (code) => {
        if (code === 0) {
            console.log('✅ 构建成功');
        } else {
            console.log(`❌ 构建失败，退出码: ${code}`);
            process.exit(1);
        }
    };
} catch (error) {
    console.log(`❌ 构建执行出错: ${error.message}`);
    process.exit(1);
    }
}

// 4. 发布到NPM
console.log('📋 4. 发布到NPM...');
try {
    const publishResult = spawn('npm', ['publish', '--access', 'public'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        shell: true,
        cwd: __dirname
    });

    publishResult.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    publishResult.on('close', (code) => {
        if (code === 0) {
            console.log('✅ NPM 发布成功！');
            console.log('\n📦 包信息:');
            console.log(`   - 名称: stigmergy-cli`);
            console.log(`   - 版本: ${packageJson.version}`);
            console.log(`   - 类型: ${packageJson.type || 'not specified'}`);
            console.log(`   - 仓库: ${packageJson.repository?.url || '未知'}`);
            console.log('   - 官网: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
            console.log('\n🎉 安装使用:');
            console.log('   npm install -g stigmergy-cli');
            console.log('   npx stigmergy-cli init');
            console.log('   npx stigmergy-cli deploy');
            console.log('   npx stigmergy-cli status');
            console.log('   npx stigmergy-cli scan');
        } else {
            console.log(`❌ NPM 发布失败，退出码: ${code}`);
            console.log(publishResult.stderr);
        }
    };
} catch (error) {
    console.log(`❌ 发布过程出错: ${error.message}`);
    process.exit(1);
    }
}

console.log('\n🎉 Stigmergy CLI 已成功开源发布到NPM！');
console.log('\n📦 现在可以使用:');
console.log('   npm install -g stigmergy-cli');
console.log('   npx stigmergy-cli <command>');
console.log('\n📚 更多信息:');
console.log('   - GitHub: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
console.log('   - NPM: https://www.npmjs.com/package/stigmergy-cli');