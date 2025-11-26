#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents NPX 部署管理器
 * 支持一键部署到各个AI CLI工具，实现真正的Stigmergy协作
 */
import { spawn } from 'child_process';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG = {
    repo: 'https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git',
    localConfig: join(homedir(), '.stigmergy-cli'),
    templatesDir: join(__dirname, 'templates'),
    adaptersDir: join(__dirname, 'src', 'adapters')
};

class StigmergyCLIRouter {
    constructor() {
        this.config = CONFIG;
        this.adapters = new Map();
        this.isInstalling = false;
    }

    async loadAdapter(adapterName) {
        const configPath = join(this.config.adaptersDir, adapterName, 'config.json');
        try {
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            return { ...config, loaded: true };
        } catch (error) {
            console.error(`❌ 加载 ${adapterName} 适配器配置失败: ${error.message}`);
            return { ...config, loaded: false, error: error.message };
        }
    }

    async checkAdapterExists(adapterName) {
        const configPath = join(this.config.adaptersDir, `${adapterName}`, 'config.json');
        try {
            await fs.access(configPath);
            return true;
        } catch {
            return false;
        }
    }

    async installAdapter(adapterName, force = false) {
        if (this.isInstalling) {
            console.log('⚠️  正在安装中，请稍候...');
            return;
        }

        this.isInstalling = true;

        try {
            console.log(`🚀 开始安装 ${adapterName} 适配器...`);

            // 检查适配器是否已存在
            const exists = await this.checkAdapterExists(adapterName);
            if (exists && !force) {
                console.log(`✅ ${adapterName} 适配器已存在`);
                this.isInstalling = false;
                return;
            }

            // 加载适配器配置
            const config = await this.loadAdapter(adapterName);
            if (!config.loaded) {
                console.error(`❌ ${adapterName} 适配器配置加载失败: ${config.error}`);
                this.isInstalling = false;
                return;
            }

            // 创建配置目录
            const adapterConfigDir = join(this.config.localConfig, adapterName);
            await fs.mkdir(adapterConfigDir, { recursive: true });

            // 复制配置文件
            const adapterConfigFile = join(__dirname, 'src', 'adapters', adapterName, 'config.json');
            const targetConfigFile = join(adapterConfigDir, 'config.json');
            await fs.copyFile(adapterConfigFile, targetConfigFile);

            // 创建钩子目录
            const hooksDir = join(adapterConfigDir, 'hooks');
            await fs.mkdir(hooksDir, { recursive: true });

            // 复制钩子文件
            const adapterHooksDir = join(__dirname, 'src', 'adapters', adapterName);
            await this.copyDirectory(adapterHooksDir, hooksDir);

            // 创建日志目录
            const logsDir = join(adapterConfigDir, 'logs');
            await fs.mkdir(logsDir, { recursive: true });

            console.log(`✅ ${adapterName} 适配器安装完成`);

            this.adapters.set(adapterName, config);
            this.isInstalling = false;

        } catch (error) {
            console.error(`❌ ${adapterName} 适配器安装失败: ${error.message}`);
        } finally {
            this.isInstalling = false;
        }
    }

    async copyDirectory(src, dest) {
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry);
            const destPath = join(dest, entry);

            const stat = await fs.stat(srcPath);
            if (stat.isDirectory()) {
                await fs.mkdir(destPath, { recursive: true });
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    async copyFile(src, dest) {
        const data = await fs.readFile(src);
        await fs.writeFile(dest, data);
    }

    async deployAll(force = false) {
        console.log('🚀 开始部署所有适配器...');

        const adapterNames = ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot', 'codex'];

        for (const adapterName of adapterNames) {
            await this.installAdapter(adapterName, force);
        }

        console.log('✅ 所有适配器部署完成！');

        // 更新全局配置
        await this.updateGlobalConfig();
    }

    async updateGlobalConfig() {
        const globalConfigPath = join(this.config.localConfig, 'global-config.json');

        const adapters = {};
        for (const [name, adapter] of this.adapters) {
            adapters[name] = adapter;
        }

        const globalConfig = {
            adapters,
            lastUpdate: new Date().toISOString(),
            version: '1.0.0'
        };

        await fs.writeFile(globalConfigPath, JSON.stringify(globalConfig, null, 2));
        console.log('✅ 全局配置已更新');
    }

    async initProject(projectPath = process.cwd()) {
        console.log('🚀 初始化Stigmergy CLI项目...');

        // 创建项目配置目录
        const projectConfigDir = join(projectPath, '.stigmergy-project');
        await fs.mkdir(projectConfigDir, { recursive: true });

        // 生成项目配置
        const projectConfig = {
            projectType: 'initialized',
            createdAt: new Date().toISOString(),
            adapters: {}
        };

        // 检查可用的适配器
        const availableAdapters = [];
        for (const adapterName of ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot', 'codex']) {
            const config = await this.loadAdapter(adapterName);
            if (config.loaded) {
                availableAdapters.push({
                    name: adapterName,
                    version: config.version,
                    integrationType: config.integration_type,
                    status: 'available'
                });
            }
        }

        projectConfig.adapters = availableAdapters;

        // 保存项目配置
        const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
        await fs.writeFile(projectConfigPath, JSON.stringify(projectConfig, null, 2));

        console.log(`✅ Stigmergy项目初始化完成！`);
        console.log(`📊 发现 ${availableAdapters.length} 个可用的AI CLI工具:`, availableAdapters.map(a => a.name).join(', '));

        // 生成增强的MD文档
        for (const adapter of availableAdapters) {
            const mdPath = join(projectPath, `${adapter.name}.md`);
            const config = await this.loadAdapter(adapter.name);

            if (config.loaded) {
                const mdContent = await this.generateEnhancedMarkdown(adapter, projectConfig);
                await fs.writeFile(mdPath, mdContent, 'utf8');
                console.log(`✅ 生成 ${adapter.name}.md`);
            }
        }
    }

    async generateEnhancedMarkdown(adapter, projectConfig) {
        const templatePath = join(this.config.templatesDir, 'enhanced-cli-doc.md.j2');

        try {
            const template = await fs.readFile(templatePath, 'utf8');

            // 替换模板变量
            let content = template
                .replace(/\{adapterName\}/g, adapter.name)
                .replace(/\{displayName\}/g, adapter.displayName || adapter.name)
                .replace(/\{version\}/g, adapter.version)
                .replace(/\{integrationType\}/g, adapter.integrationType)
                .replace(/\{configFile\}/g, adapter.config_file)
                .replace(/\{globalDoc\}/g, adapter.global_doc)
                .replace(/\{projectPath\}/g, process.cwd())
                .replace(/\{availableTools\}/g, projectConfig.adapters.map(a => a.name).join(', '))
                .replace(/\{currentTime\}/g, new Date().toLocaleString('zh-CN'))
                .replace(/\{currentTimeISO\}/g, new Date().toISOString())
                .replace(/\{repoUrl\}/g, this.config.repo);

            // 添加协作指南
            const collaborationSection = this.generateCollaborationSection(adapter, projectConfig.adapters);
            content = content.replace('## 🤝 AI工具协作指南\n{collaborationSection}', `## 🤝 AI工具协作指南\n${collaborationSection}`);

            await fs.writeFile(join(process.cwd(), `${adapter.name}.md`), content, 'utf8');
            console.log(`✅ 生成增强的 ${adapter.name}.md`);

        } catch (error) {
            console.error(`❌ 生成 ${adapter.name}.md 失败: ${error.message}`);
            throw error;
        }
    }

    generateCollaborationSection(adapter, availableAdapters) {
        const currentAdapter = adapter.name;
        const otherAdapters = availableAdapters.filter(a => a.name !== currentAdapter);

        let section = '\n### 🔄 跨AI工具协作指南\n\n';

        // 中文协作示例
        section += '#### 中文协作指令\n\n';
        for (const otherAdapter of otherAdapters.slice(0, 3)) {
            section += `- 请用${otherAdapter.name}帮我{this.getRandomTask()}\n`;
        }

        // 英文协作示例
        section += '\n#### 英文协作指令\n\n';
        for (const otherAdapter of otherAdapters.slice(0, 3)) {
            section += `- use ${otherAdapter.name} to ${this.getRandomTask()}\n`;
        }

        return section;
    }

    getRandomTask() {
        const tasks = [
            '生成用户认证模块',
            '分析代码性能问题',
            '创建数据库迁移脚本',
            '实现API端点',
            '优化SQL查询',
            '生成测试用例',
            '审查代码架构',
            '重构遗留代码',
            '设计系统架构文档',
            '处理CSV数据并生成可视化图表',
            '分析关键业务指标',
            '实现缓存策略',
            '优化应用启动时间'
        ];
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    async checkStatus() {
        console.log('🔍 检查Stigmergy CLI状态...');

        // 检查全局配置
        const globalConfigPath = join(this.config.localConfig, 'global-config.json');
        let globalConfig;
        try {
            globalConfig = JSON.parse(await fs.readFile(globalConfigPath, 'utf8'));
        } catch {
            console.log('⚠️  全局配置文件不存在');
            return;
        }

        // 检查本地配置
        const localConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
        let localConfig;
        try {
            localConfig = JSON.parse(await fs.readFile(localConfigPath, 'utf8'));
        } catch {
            console.log('⚠️  项目配置文件不存在');
        }

        // 检查适配器状态
        const adapterStatuses = [];
        for (const [adapterName, adapter] of this.adapters) {
            const exists = await this.checkAdapterExists(adapterName);
            adapterStatuses.push({
                name: adapterName,
                status: exists ? '✅ 已安装' : '❌ 未安装',
                config: adapter.config_file
            });
        }

        console.log('\n📊 全局配置:');
        console.log(`   仓库: ${globalConfig.repo}`);
        console.log(`   版本: ${globalConfig.version}`);
        console.log(`   最后更新: ${globalConfig.lastUpdate}`);

        console.log('\n🤖 可用适配器:');
        for (const status of adapterStatuses) {
            console.log(`   ${status.name}: ${status.status} ${status.config ? `(${status.config})` : ''}`);
        }

        if (localConfig) {
            console.log('\n📁 项目配置:');
            console.log(`   类型: ${localConfig.projectType}`);
            console.log(`   创建时间: ${localConfig.createdAt}`);
            console.log(`   可用工具: ${localConfig.adapters.map(a => a.name).join(', ')}`);
        }

        console.log('\n🔍 适配器详细状态:');
        for (const status of adapterStatuses) {
            if (!status.status) {
                console.log(`   ❌ ${status.name}: 需要安装`);
            }
        }
    }
}

// 命令处理
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const router = new StigmergyCLIRouter();

    switch (command) {
        case 'install':
            await router.installAll();
            break;
        case 'deploy':
            await router.deployAll(args.includes('--force'));
            break;
        case 'init':
            await router.initProject();
            break;
        case 'status':
            await router.checkStatus();
            break;
        case 'check-project':
            await router.checkProject();
            break;
        case 'validate':
            await router.validate(args[1] || 'project');
            break;
        case 'clean':
            // 清理功能实现
            break;
        default:
            console.log(`
🤖 Stigmergy CLI v1.0.0 - Multi-Agents跨AI CLI工具协作系统

📚 可用命令:
  install              - 安装所有AI CLI工具适配器
  deploy [options]    - 部署适配器到本地配置
  init [path]         - 初始化项目(默认当前目录)
  status              - 检查系统和适配器状态
  check-project [path]  - 检查项目配置
  validate [scope]    - 验证配置
  clean [options]     - 清理缓存和临时文件

💡 快速开始:
  npx stigmergy-cli init          # 初始化当前项目
  npx stigmergy-cli deploy        # 一键部署
  npx stigmergy-cli status          # 查看状态

📖 文档: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
🔧 配置: ~/.stigmergy-cli/global-config.json
🔧 项目: .stigmergy-project/project-config.json

🌟 全球访问:
  npx stigmergy-cli install --global
            `);
            break;
    }
}

main();