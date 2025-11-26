#!/usr/bin/env node

/**
 * Stigmergy CLI 部署验证脚本
 * 验证所有核心功能是否正常工作
 */

import { spawn } from 'child_process';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DeploymentValidator {
    constructor() {
        this.testResults = [];
        this.testDir = join(__dirname, 'test-deployment');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': 'ℹ️ ',
            'success': '✅ ',
            'error': '❌ ',
            'warning': '⚠️ '
        }[type] || 'ℹ️ ';

        console.log(`${timestamp} ${prefix}${message}`);
        this.testResults.push({ timestamp, message, type });
    }

    async runCommand(command, args = [], cwd = process.cwd()) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                resolve({ code, stdout, stderr });
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async testBasicCommands() {
        this.log('开始测试基础命令...', 'info');

        // 测试帮助命令
        try {
            const result = await this.runCommand('node', ['src/main.js'], __dirname);
            if (result.code === 0) {
                this.log('帮助命令正常工作', 'success');
            } else {
                this.log(`帮助命令失败，退出码: ${result.code}`, 'error');
            }
        } catch (error) {
            this.log(`帮助命令执行错误: ${error.message}`, 'error');
        }
    }

    async testInitialization() {
        this.log('开始测试项目初始化...', 'info');

        // 创建测试目录
        const testProjectDir = join(this.testDir, 'test-project');
        try {
            await mkdir(testProjectDir, { recursive: true });
            this.log(`创建测试项目目录: ${testProjectDir}`, 'success');
        } catch (error) {
            this.log(`创建测试目录失败: ${error.message}`, 'error');
            return;
        }

        // 测试初始化命令
        try {
            const result = await this.runCommand('node', ['src/main.js', 'init'], __dirname);
            if (result.code === 0) {
                this.log('项目初始化命令正常工作', 'success');

                // 检查生成的文件
                const configFile = join(testProjectDir, '.stigmergy-project', 'stigmergy-config.json');
                try {
                    await access(configFile);
                    this.log('项目配置文件已生成', 'success');

                    const config = JSON.parse(await readFile(configFile, 'utf8'));
                    this.log(`发现 ${config.adapters?.length || 0} 个适配器`, 'info');
                } catch (error) {
                    this.log(`项目配置文件检查失败: ${error.message}`, 'error');
                }
            } else {
                this.log(`项目初始化失败，退出码: ${result.code}`, 'error');
                this.log(`错误输出: ${result.stderr}`, 'error');
            }
        } catch (error) {
            this.log(`项目初始化执行错误: ${error.message}`, 'error');
        }
    }

    async testPackageConfiguration() {
        this.log('开始测试包配置...', 'info');

        try {
            const packagePath = join(__dirname, 'package.json');
            const packageContent = await readFile(packagePath, 'utf8');
            const packageData = JSON.parse(packageContent);

            // 检查必要的字段
            const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'scripts', 'repository'];
            let allFieldsPresent = true;

            for (const field of requiredFields) {
                if (packageData[field]) {
                    this.log(`字段 ${field}: ✅`, 'success');
                } else {
                    this.log(`字段 ${field}: ❌`, 'error');
                    allFieldsPresent = false;
                }
            }

            if (allFieldsPresent) {
                this.log('包配置检查通过', 'success');
            } else {
                this.log('包配置检查失败', 'error');
            }

            // 检查项目名称
            if (packageData.name === 'stigmergy-cli') {
                this.log('项目名称正确设置为 stigmergy-cli', 'success');
            } else {
                this.log(`项目名称错误: ${packageData.name}`, 'error');
            }

            // 检查仓库地址
            if (packageData.repository?.url?.includes('ptreezh/stigmergy-CLI-Multi-Agents')) {
                this.log('仓库地址正确设置', 'success');
            } else {
                this.log(`仓库地址错误: ${packageData.repository?.url}`, 'error');
            }

        } catch (error) {
            this.log(`包配置读取失败: ${error.message}`, 'error');
        }
    }

    async testNPXConfiguration() {
        this.log('开始测试NPX配置...', 'info');

        try {
            const packagePath = join(__dirname, 'package.json');
            const packageData = JSON.parse(await readFile(packagePath, 'utf8'));

            if (packageData.bin && packageData.bin['stigmergy-cli']) {
                this.log('NPX bin配置正确', 'success');
            } else {
                this.log('NPX bin配置缺失或错误', 'error');
            }

            if (packageData.npx && packageData.npx['stigmergy-cli']) {
                this.log('NPX配置正确', 'success');
            } else {
                this.log('NPX配置缺失或错误', 'error');
            }

        } catch (error) {
            this.log(`NPX配置检查失败: ${error.message}`, 'error');
        }
    }

    async testFileStructure() {
        this.log('开始测试文件结构...', 'info');

        const requiredFiles = [
            'src/main.js',
            'package.json',
            'README.md'
        ];

        for (const file of requiredFiles) {
            try {
                await access(join(__dirname, file));
                this.log(`文件存在: ${file}`, 'success');
            } catch (error) {
                this.log(`文件缺失: ${file}`, 'error');
            }
        }
    }

    async testStigmergyFeatures() {
        this.log('开始测试Stigmergy特性...', 'info');

        // 检查配置目录名称
        const mainPath = join(__dirname, 'src/main.js');
        try {
            const mainContent = await readFile(mainPath, 'utf8');

            if (mainContent.includes('.stigmergy-cli')) {
                this.log('使用正确的配置目录名称', 'success');
            } else {
                this.log('配置目录名称不正确', 'error');
            }

            if (mainContent.includes('.stigmergy-project')) {
                this.log('使用正确的项目配置目录', 'success');
            } else {
                this.log('项目配置目录不正确', 'error');
            }

            if (mainContent.includes('StigmergyCLIRouter')) {
                this.log('使用正确的类名', 'success');
            } else {
                this.log('类名不正确', 'error');
            }

            if (mainContent.includes('ptreezh/stigmergy-CLI-Multi-Agents')) {
                this.log('使用正确的仓库地址', 'success');
            } else {
                this.log('仓库地址不正确', 'error');
            }

        } catch (error) {
            this.log(`Stigmergy特性检查失败: ${error.message}`, 'error');
        }
    }

    async generateReport() {
        this.log('生成验证报告...', 'info');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                success: this.testResults.filter(r => r.type === 'success').length,
                error: this.testResults.filter(r => r.type === 'error').length,
                warning: this.testResults.filter(r => r.type === 'warning').length,
                info: this.testResults.filter(r => r.type === 'info').length
            },
            details: this.testResults
        };

        const reportPath = join(__dirname, 'deployment-validation-report.json');
        await writeFile(reportPath, JSON.stringify(report, null, 2));

        this.log(`验证报告已生成: ${reportPath}`, 'success');

        // 显示摘要
        console.log('\n📊 验证摘要:');
        console.log(`   总检查项: ${report.summary.total}`);
        console.log(`   ✅ 成功: ${report.summary.success}`);
        console.log(`   ❌ 失败: ${report.summary.error}`);
        console.log(`   ⚠️  警告: ${report.summary.warning}`);
        console.log(`   ℹ️  信息: ${report.summary.info}`);

        const successRate = (report.summary.success / report.summary.total * 100).toFixed(1);
        console.log(`   📈 成功率: ${successRate}%`);

        return report.summary.success === report.summary.total - report.summary.info;
    }

    async runAllTests() {
        console.log('🚀 开始Stigmergy CLI部署验证...\n');

        await this.testBasicCommands();
        await this.testPackageConfiguration();
        await this.testNPXConfiguration();
        await this.testFileStructure();
        await this.testStigmergyFeatures();
        await this.testInitialization();

        const allPassed = await this.generateReport();

        if (allPassed) {
            console.log('\n🎉 所有测试通过！Stigmergy CLI已准备就绪！');
        } else {
            console.log('\n⚠️  部分测试失败，请检查上述错误');
        }

        return allPassed;
    }
}

// 运行验证
async function main() {
    const validator = new DeploymentValidator();
    const success = await validator.runAllTests();
    process.exit(success ? 0 : 1);
}

main().catch(error => {
    console.error('验证过程中发生错误:', error);
    process.exit(1);
});