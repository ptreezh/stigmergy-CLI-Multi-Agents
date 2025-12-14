#!/usr/bin/env node

/**
 * Stigmergy CLI 发布脚本
 * 自动化发布流程到npm
 */

import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class NPMPublisher {
    constructor() {
        this.rootDir = __dirname;
        this.packagePath = join(this.rootDir, 'package.json');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '📦 ',
            'success': '�?',
            'error': '�?',
            'warning': '⚠️ '
        }[type] || '📦 ';

        console.log(`${timestamp} ${prefix}${message}`);
    }

    async readPackage() {
        try {
            const content = await readFile(this.packagePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.log(`读取package.json失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async checkRequirements() {
        this.log('检查发布要�?..', 'info');

        const pkg = await this.readPackage();

        // 检查必要字�?        const required = ['name', 'version', 'description', 'main', 'bin', 'repository'];
        for (const field of required) {
            if (!pkg[field]) {
                throw new Error(`缺少必要字段: ${field}`);
            }
        }

        // 检查版本格�?        if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) {
            throw new Error(`版本格式不正�? ${pkg.version}`);
        }

        // 检查仓库URL
        if (!pkg.repository?.url) {
            throw new Error('缺少repository.url');
        }

        this.log('所有检查通过', 'success');
    }

    async buildProject() {
        this.log('构建项目...', 'info');

        try {
            // 清理之前的构�?            execSync('rm -rf dist', { cwd: this.rootDir });

            // 创建dist目录
            execSync('mkdir -p dist', { cwd: this.rootDir });

            // 复制必要文件
            const filesToCopy = [
                'src/index.js',
                'src/adapters/',
                'src/templates/',
                'package.json',
                'README.md',
                'LICENSE'
            ];

            for (const file of filesToCopy) {
                if (file.endsWith('/')) {
                    execSync(`cp -r ${file} dist/`, { cwd: this.rootDir });
                } else {
                    execSync(`cp ${file} dist/`, { cwd: this.rootDir });
                }
            }

            // 复制bin文件
            execSync('mkdir -p dist/bin', { cwd: this.rootDir });
            execSync('cp bin/* dist/bin/', { cwd: this.rootDir });

            // 生成package.json用于发布
            const publishPackage = await this.readPackage();
            const publishConfig = {
                ...publishPackage,
                files: [
                    'src/index.js',
                    'src/adapters/**',
                    'src/templates/**',
                    'bin/**',
                    'README.md',
                    'LICENSE'
                ],
                main: 'src/index.js',
                bin: {
                    'stigmergy-cli': 'src/index.js'
                }
            };

            await writeFile(
                join(this.rootDir, 'dist/package.json'),
                JSON.stringify(publishConfig, null, 2),
                'utf8'
            );

            this.log('构建完成', 'success');
        } catch (error) {
            this.log(`构建失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async runTests() {
        this.log('运行测试...', 'info');

        try {
            execSync('npm test', { cwd: this.rootDir, stdio: 'inherit' });
            this.log('测试通过', 'success');
        } catch (error) {
            this.log(`测试失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async publishToNPM(dryRun = false) {
        this.log('准备发布到npm...', 'info');

        try {
            // 检查是否已登录npm
            try {
                execSync('npm whoami', { stdio: 'pipe' });
                this.log('npm登录状�? 已登�?, 'success');
            } catch {
                this.log('请先登录npm: npm login', 'warning');
                throw new Error('需要先登录npm');
            }

            // 检查包名是否可�?            const pkg = await this.readPackage();
            try {
                execSync(`npm view ${pkg.name}`, { stdio: 'pipe' });
                this.log(`包名 ${pkg.name} 已存在，将覆盖发布`, 'warning');
            } catch {
                this.log(`包名 ${pkg.name} 可用`, 'success');
            }

            // 发布命令
            const publishCmd = dryRun ? 'npm publish --dry-run' : 'npm publish --access public';

            if (dryRun) {
                this.log('模拟发布�?..', 'info');
                execSync(publishCmd, { cwd: join(this.rootDir, 'dist'), stdio: 'inherit' });
                this.log('模拟发布完成', 'success');
            } else {
                this.log('发布到npm...', 'info');
                execSync(publishCmd, { cwd: join(this.rootDir, 'dist'), stdio: 'inherit' });
                this.log('发布成功�?, 'success');
            }

        } catch (error) {
            this.log(`发布失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async versionUpdate(type = 'patch') {
        this.log(`更新版本 (${type})...`, 'info');

        try {
            execSync(`npm version ${type}`, { cwd: this.rootDir, stdio: 'inherit' });
            this.log('版本更新完成', 'success');
        } catch (error) {
            this.log(`版本更新失败: ${error.message}`, 'error');
            throw error;
        }
    }

    async showHelp() {
        console.log(`
🚀 Stigmergy CLI 发布工具

用法: node scripts/publish.js [选项]

选项:
  --dry-run     模拟发布，不实际上传到npm
  --patch       更新补丁版本 (默认)
  --minor       更新次版�?  --major       更新主版�?  --help, -h   显示帮助信息

示例:
  node scripts/publish.js              # 发布到npm
  node scripts/publish.js --dry-run     # 模拟发布
  node scripts/publish.js --minor         # 更新次版本并发布
  node scripts/publish.js --help           # 显示帮助

工作流程:
  1. 检查发布要�?  2. 运行测试
  3. 构建项目
  4. 更新版本 (可�?
  5. 发布到npm
        `);
    }
}

async function main() {
    const publisher = new NPMPublisher();
    const args = process.argv.slice(2);

    // 显示帮助
    if (args.includes('--help') || args.includes('-h')) {
        publisher.showHelp();
        return;
    }

    try {
        // 检查发布要�?        await publisher.checkRequirements();

        // 运行测试
        await publisher.runTests();

        // 构建项目
        await publisher.buildProject();

        // 处理版本更新
        let versionType = 'patch';
        if (args.includes('--minor')) versionType = 'minor';
        if (args.includes('--major')) versionType = 'major';

        if (versionType !== 'patch') {
            await publisher.versionUpdate(versionType);
        }

        // 发布到npm
        const dryRun = args.includes('--dry-run');
        await publisher.publishToNPM(dryRun);

    } catch (error) {
        console.error('发布失败:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
