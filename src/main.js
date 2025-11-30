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
    adaptersDir: join(__dirname, 'adapters')
};

class StigmergyCLIRouter {
    constructor() {
        this.config = CONFIG;
        this.adapters = new Map();
        this.isInstalling = false;
    }

    async loadAdapter(adapterName) {
        // 适配器名称映射 - 将用户可见的名称映射到实际目录名
        const adapterDirName = this.mapAdapterName(adapterName);

        // 尝试多个可能的路径
        const possibleBasePaths = [
            join(__dirname, 'adapters'),           // 从当前文件目录查找
            join(dirname(__dirname), 'adapters'),  // 从当前目录的父目录查找
        ];

        for (const basePath of possibleBasePaths) {
            try {
                const configPath = join(basePath, adapterDirName, 'config.json');
                const configData = await fs.readFile(configPath, 'utf8');
                const config = JSON.parse(configData);
                // 成功找到配置，返回
                return { ...config, loaded: true };
            } catch (error) {
                // 继续尝试下一个路径
                continue;
            }
        }

        // 所有路径都尝试过了但失败
        const lastPathAttempted = join(possibleBasePaths[possibleBasePaths.length - 1], adapterDirName, 'config.json');
        console.error(`❌ 加载 ${adapterName} 适配器配置失败: 未找到配置文件在任何可能的路径中，最后尝试: ${lastPathAttempted}`);
        return { loaded: false, error: "无法找到适配器配置文件" };
    }

    async checkAdapterExists(adapterName) {
        // 适配器名称映射 - 将用户可见的名称映射到实际目录名
        const adapterDirName = this.mapAdapterName(adapterName);

        // 使用与loadAdapter相同的路径检测逻辑
        const possibleBasePaths = [
            join(__dirname, 'adapters'),           // 从当前文件目录查找
            join(dirname(__dirname), 'adapters'),  // 从当前目录的父目录查找
        ];

        for (const basePath of possibleBasePaths) {
            try {
                const configPath = join(basePath, adapterDirName, 'config.json');
                await fs.access(configPath);
                return true;
            } catch {
                // 继续尝试下一个路径
                continue;
            }
        }

        return false;
    }

    // 适配器名称映射方法
    mapAdapterName(adapterName) {
        // 将用户接口名称映射到实际的适配器目录名称
        const nameMap = {
            'qwen': 'qwencode'  // qwen在内部对应qwencode目录
        };
        return nameMap[adapterName] || adapterName;
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

            // 使用映射后的目录名查找源配置文件
            const adapterDirName = this.mapAdapterName(adapterName);
            const adapterConfigFile = join(__dirname, 'src', 'adapters', adapterDirName, 'config.json');
            const targetConfigFile = join(adapterConfigDir, 'config.json');
            await fs.copyFile(adapterConfigFile, targetConfigFile);

            // 创建钩子目录
            const hooksDir = join(adapterConfigDir, 'hooks');
            await fs.mkdir(hooksDir, { recursive: true });

            // 复制钩子文件
            const adapterHooksDir = join(__dirname, 'src', 'adapters', adapterDirName);
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

    async directoryExists(dirPath) {
        try {
            const stat = await fs.stat(dirPath);
            return stat.isDirectory();
        } catch (error) {
            return false;
        }
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

        // 验证并修复路径 - 确保不在系统根目录创建项目文件
        let safeProjectPath = projectPath;
        if (safeProjectPath === '/' || safeProjectPath === 'C:\\' || safeProjectPath === 'D:\\' ||
            safeProjectPath === 'E:\\' || safeProjectPath.endsWith(':\\')) {
            // 如果用户在磁盘根目录运行，创建一个专门的项目目录
            console.log('⚠️  检测到在磁盘根目录运行，将自动创建项目目录进行初始化');

            // 创建带序号的项目目录
            let projectDirName = 'ProjStig';
            let counter = 1;
            let targetDir = join(safeProjectPath, projectDirName);

            // 检查目录是否存在，如果存在则添加序号
            while (await directoryExists(targetDir)) {
                targetDir = join(safeProjectPath, `${projectDirName}${counter}`);
                counter++;
            }

            // 创建项目目录
            await fs.mkdir(targetDir, { recursive: true });
            safeProjectPath = targetDir;
            console.log(`📁 项目目录创建成功: ${safeProjectPath}`);
        }

        // 创建项目配置目录
        const projectConfigDir = join(safeProjectPath, '.stigmergy-project');
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
            // 确保md文件生成在项目目录中而不是系统根目录
            const mdPath = join(safeProjectPath, `${adapter.name}.md`);
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
                .replace(/\{integrationType\}/g, adapter.integrationType || 'N/A')
                .replace(/\{configFile\}/g, adapter.config_file || 'N/A')
                .replace(/\{globalDoc\}/g, adapter.global_doc || 'N/A')
                .replace(/\{projectPath\}/g, process.cwd())
                .replace(/\{availableTools\}/g, projectConfig.adapters.map(a => a.name).join(', '))
                .replace(/\{currentTime\}/g, new Date().toLocaleString('zh-CN'))
                .replace(/\{currentTimeISO\}/g, new Date().toISOString())
                .replace(/\{repoUrl\}/g, this.config.repo);

            // 添加协作指南
            const collaborationSection = this.generateCollaborationSection(adapter, projectConfig.adapters);
            content = content.replace(/\{collaborationSection\}/g, collaborationSection);

            return content; // 返回内容而不是直接写入文件
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

    async checkProject(projectPath = process.cwd()) {
        console.log('🔍 检查项目配置...');

        try {
            // 检查项目配置目录
            const projectConfigDir = join(projectPath, '.stigmergy-project');
            try {
                await fs.access(projectConfigDir);
                console.log('✅ 项目配置目录存在');
            } catch {
                console.log('⚠️  项目配置目录不存在，需要初始化');
                return;
            }

            // 检查项目配置文件
            const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
            try {
                const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
                const config = JSON.parse(projectConfig);

                console.log('✅ 项目配置文件存在');
                console.log(`📊 项目类型: ${config.projectType}`);
                console.log(`📅 创建时间: ${config.createdAt}`);

                if (config.adapters) {
                    console.log(`🔧 已配置适配器: ${config.adapters.length} 个`);
                    for (const adapter of config.adapters) {
                        console.log(`   - ${adapter.name} (${adapter.status})`);
                    }
                }
            } catch (configErr) {
                console.log('⚠️  项目配置文件不存在或格式错误');
            }

            // 检查全局配置
            try {
                const globalConfigPath = join(this.config.localConfig, 'global-config.json');
                await fs.access(globalConfigPath);
                console.log('✅ 全局配置存在');
            } catch {
                console.log('⚠️  全局配置不存在，需要部署');
            }

            console.log('✅ 项目检查完成');
        } catch (error) {
            console.error(`❌ 检查项目时出错: ${error.message}`);
        }
    }

    async scanSystem() {
        console.log('🔍 扫描系统环境...');

        // 这里会实现扫描逻辑，类似于deploy.js中的功能
        const CLI_TOOLS = [
            { name: 'claude', displayName: 'Claude CLI', required: true },
            { name: 'gemini', displayName: 'Gemini CLI', required: true },
            { name: 'qwen', displayName: 'QwenCode CLI', required: false },
            { name: 'iflow', displayName: 'iFlow CLI', required: false },
            { name: 'qoder', displayName: 'Qoder CLI', required: false },
            { name: 'codebuddy', displayName: 'CodeBuddy CLI', required: false },
            { name: 'copilot', displayName: 'GitHub Copilot CLI', required: false },
            { name: 'ollama', displayName: 'Ollama CLI', required: false }
        ];

        console.log('');
        console.log('📋 扫描结果:');

        for (const cliInfo of CLI_TOOLS) {
            const available = await this.checkToolAvailable(cliInfo.name);
            const status = available ? '✅' : '❌';
            const required = cliInfo.required ? '(必需)' : '(可选)';
            console.log(`  ${status} ${cliInfo.displayName} ${required} - ${available ? '可用' : '不可用'}`);
        }

        console.log('');
        console.log('💡 提示: 使用 "stigmergy-cli deploy" 部署未安装的工具');
    }

    async checkToolAvailable(cliName) {
        try {
            const { spawnSync } = require('child_process');
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [cliName], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [cliName], { stdio: 'pipe' });
            }

            return result.status === 0;
        } catch (e) {
            // 如果系统命令失败，尝试npm检查
            try {
                const { spawnSync } = require('child_process');
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(cliName);
                }
            } catch (e2) {
                // 忽略npm检查错误
            }
            return false;
        }
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

    async validate(scope = 'project') {
        console.log(`🔍 验证 ${scope} 配置...`);

        if (scope === 'project') {
            const projectConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
            try {
                const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
                const config = JSON.parse(projectConfig);

                console.log('✅ 项目配置验证通过');
                console.log(`📊 项目类型: ${config.projectType}`);
                console.log(`📅 创建时间: ${config.createdAt}`);
                console.log(`🔧 适配器数量: ${config.adapters ? config.adapters.length : 0}`);

                return true;
            } catch (error) {
                console.log('⚠️  项目配置验证失败或不存在');
                console.log('💡 提示: 使用 stigmergy-cli init 初始化项目配置');
                return false;
            }
        } else if (scope === 'global') {
            const globalConfigPath = join(this.config.localConfig, 'global-config.json');
            try {
                const globalConfig = await fs.readFile(globalConfigPath, 'utf8');
                const config = JSON.parse(globalConfig);

                console.log('✅ 全局配置验证通过');
                console.log(`📊 版本: ${config.version}`);
                console.log(`📅 最后更新: ${config.lastUpdate}`);

                return true;
            } catch (error) {
                console.log('⚠️  全局配置验证失败或不存在');
                console.log('💡 提示: 使用 stigmergy-cli deploy 部署全局配置');
                return false;
            }
        } else {
            console.log('⚠️  未知的验证范围，使用 "project" 或 "global"');
            return false;
        }
    }
}

// 命令处理
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    // 检查是否为快速部署命令
    if (args.includes('quick-deploy') || args.includes('deploy')) {
        await runQuickDeploy();
        return;
    }

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
        case 'scan':
            await router.scanSystem();
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

🚀 快速部署:
  npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy

📖 文档: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
🔧 配置: ~/.stigmergy-cli/global-config.json
🔧 项目: .stigmergy-project/project-config.json

🌟 全球访问:
  npx stigmergy-cli install --global
            `);
            break;
    }
}

// 添加一个全局的directoryExists函数
async function directoryExists(dirPath) {
    try {
        const { stat } = await fs;
        const statResult = await stat(dirPath);
        return statResult.isDirectory();
    } catch (error) {
        return false;
    }
}

// 远程快速部署函数
async function runQuickDeploy() {
    console.log('🤖 Stigmergy CLI - 远程快速部署系统');
    console.log('==================================');
    console.log('此脚本将自动检测、安装和配置跨AI CLI工具协作系统');
    console.log('');

    // 定义支持的AI工具及其npm包名称
    const AI_TOOLS = [
        {
            name: 'claude',
            displayName: 'Claude CLI',
            npmPackage: '@anthropic-ai/claude-code',
            description: 'Anthropic Claude CLI工具',
            website: 'https://claude.ai/cli'
        },
        {
            name: 'gemini',
            displayName: 'Gemini CLI',
            npmPackage: '@google/gemini-cli',
            description: 'Google Gemini CLI工具',
            website: 'https://ai.google.dev/cli'
        },
        {
            name: 'qwen',
            displayName: 'QwenCode CLI',
            npmPackage: '@qwen-code/qwen-code@latest',
            description: '阿里云QwenCode CLI工具',
            website: 'https://qwen.aliyun.com'
        },
        {
            name: 'iflow',
            displayName: 'iFlow CLI',
            npmPackage: '@iflow-ai/iflow-cli@latest',
            description: 'iFlow工作流CLI工具',
            website: 'https://iflow.ai'
        },
        {
            name: 'qoder',
            displayName: 'Qoder CLI',
            npmPackage: '@qoder-ai/qodercli',
            description: 'Qoder代码生成CLI工具',
            website: 'https://qoder.ai'
        },
        {
            name: 'codebuddy',
            displayName: 'CodeBuddy CLI',
            npmPackage: '@tencent-ai/codebuddy-code',
            description: '腾讯CodeBuddy编程助手',
            website: 'https://codebuddy.qq.com'
        },
        {
            name: 'copilot',
            displayName: 'GitHub Copilot CLI',
            npmPackage: '@github/copilot',
            description: 'GitHub Copilot CLI工具',
            website: 'https://github.com/features/copilot'
        },
        {
            name: 'ollama',
            displayName: 'Ollama CLI',
            npmPackage: 'ollama',
            description: 'Ollama本地模型CLI工具',
            website: 'https://ollama.ai'
        },
        {
            name: 'codex',
            displayName: 'OpenAI Codex CLI',
            npmPackage: '@openai/codex --registry=https://registry.npmmirror.com',
            description: 'OpenAI Codex代码分析CLI工具',
            website: 'https://platform.openai.com'
        }
    ];

    // 检测AI工具的函数
    async function checkToolInstallation(toolName) {
        try {
            // 检查命令是否可用
            const { spawnSync } = await import('child_process');
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [toolName], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [toolName], { stdio: 'pipe' });
            }

            return result.status === 0;
        } catch (e) {
            // 如果系统命令失败，尝试npm检查
            try {
                const { spawnSync } = require('child_process');
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(toolName);
                }
            } catch (e2) {
                // 忽略npm检查错误
            }
            return false;
        }
    }

    // 检测已安装的AI工具
    async function detectInstalledTools() {
        console.log('🔍 正在检测您系统中已安装的AI工具...');

        const installedTools = [];
        const notInstalledTools = [];

        for (const tool of AI_TOOLS) {
            const isInstalled = await checkToolInstallation(tool.name);
            if (isInstalled) {
                installedTools.push(tool);
                console.log(`✅ ${tool.displayName} - 已安装`);
            } else {
                notInstalledTools.push(tool);
                console.log(`❌ ${tool.displayName} - 未安装`);
            }
        }

        return { installedTools, notInstalledTools };
    }

    // 安装指定的工具
    async function installTools(toolsToInstall) {
        if (toolsToInstall.length === 0) {
            console.log('\n✅ 无需安装额外工具，继续配置系统...');
            return;
        }

        console.log(`\n📦 正在安装 ${toolsToInstall.length} 个AI工具...`);

        for (const toolName of toolsToInstall) {
            // 找到工具信息
            const tool = AI_TOOLS.find(t => t.name === toolName);
            if (!tool) continue;

            console.log(`\n🔄 安装 ${tool.displayName}...`);

            const { spawn } = await import('child_process');
            await new Promise((resolve) => {
                // 处理带额外参数的npm包名（如codex）
                let npmArgs = ['install', '-g'];
                const packageWithArgs = tool.npmPackage;

                // 分割包名和参数
                const parts = packageWithArgs.split(' ');
                npmArgs.push(parts[0]); // 添加包名
                if (parts.length > 1) {
                    npmArgs = npmArgs.concat(parts.slice(1)); // 添加额外参数
                }

                const installProcess = spawn('npm', npmArgs, {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true
                });

                installProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('added') || output.includes('updated')) {
                        console.log(`✅ ${tool.displayName} 安装成功`);
                    }
                });

                installProcess.stderr.on('data', (data) => {
                    // 忽略大部分npm警告，只显示关键错误
                    const errOutput = data.toString();
                    if (errOutput.includes('WARN') || errOutput.includes('deprecated')) {
                        return; // 忽略警告
                    }
                    if (errOutput.includes('ERR') || errOutput.includes('error')) {
                        console.log(`❌ ${tool.displayName} 安装出错: ${errOutput.trim()}`);
                    }
                });

                installProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`✅ ${tool.displayName} 安装完成`);
                    } else {
                        console.log(`⚠️ ${tool.displayName} 安装可能未完成 (退出码: ${code})`);
                    }
                    resolve(); // 继续下一个工具的安装
                });
            });
        }
    }

    // 适配器名称映射函数
    function mapAdapterName(adapterName) {
        // 将用户接口名称映射到实际的适配器目录名称
        const nameMap = {
            'qwen': 'qwencode'  // qwen在内部对应qwencode目录
        };
        return nameMap[adapterName] || adapterName;
    }

    // 确定特定CLI工具的安装参数
    function determineInstallArgs(cliName) {
        // 不同的CLI工具有不同的参数格式来触发安装
        const installArgMap = {
            'claude': ['--install'], // Claude脚本支持--install
            'gemini': ['--install'], // Gemini脚本支持--install
            'qwen': ['--install'],   // QwenCode脚本支持--install
            'iflow': ['--install'],  // iFlow脚本支持--install
            'qoder': ['--install'],  // Qoder脚本支持--install
            'codebuddy': ['--install'], // CodeBuddy脚本支持--install
            'codex': ['--install'],  // Codex脚本支持--install
            'copilot': ['--force'],  // Copilot脚本使用--force进行安装
            'ollama': []             // Ollama没有集成脚本
        };

        // 返回相应的安装参数数组
        return installArgMap[cliName] || ['--install'];
    }

    // 检测CLI工具是否可用的函数（与checkToolInstallation保持一致）
    async function checkToolAvailable(cliName) {
        try {
            // 检查命令是否可用
            const { spawnSync } = await import('child_process');
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [cliName], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [cliName], { stdio: 'pipe' });
            }

            return result.status === 0;
        } catch (e) {
            // 如果系统命令失败，尝试npm检查
            try {
                const { spawnSync } = require('child_process');
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(cliName);
                }
            } catch (e2) {
                // 忽略npm检查错误
            }
            return false;
        }
    }

    // 配置系统 - 运行本地init命令，为所有已安装的CLI配置插件
    async function configureSystem() {
        console.log('\n⚙️  正在配置Stigmergy CLI协作系统...');

        // 检测所有支持的CLI工具是否已安装
        const allCLITools = [
            { name: 'claude', displayName: 'Claude CLI', required: true },
            { name: 'gemini', displayName: 'Gemini CLI', required: true },
            { name: 'qwen', displayName: 'QwenCode CLI', required: false },
            { name: 'iflow', displayName: 'iFlow CLI', required: false },
            { name: 'qoder', displayName: 'Qoder CLI', required: false },
            { name: 'codebuddy', displayName: 'CodeBuddy CLI', required: false },
            { name: 'copilot', displayName: 'GitHub Copilot CLI', required: false },
            { name: 'codex', displayName: 'OpenAI Codex CLI', required: false },
            { name: 'ollama', displayName: 'Ollama CLI', required: false }
        ];

        // 检测每个CLI工具是否可用
        const availableCLIs = [];
        const unavailableCLIs = [];

        for (const cliInfo of allCLITools) {
            const available = await checkToolAvailable(cliInfo.name);
            if (available) {
                availableCLIs.push(cliInfo);
                console.log(`✅ ${cliInfo.displayName} - 可用`);
            } else {
                unavailableCLIs.push(cliInfo);
                console.log(`❌ ${cliInfo.displayName} - 不可用`);
            }
        }

        console.log(`\n📊 检测结果: ${availableCLIs.length} 个可用, ${unavailableCLIs.length} 个不可用`);

        // 初始化项目配置
        try {
            const projectPath = process.cwd();
            console.log('\n🚀 初始化Stigmergy CLI项目...');

            // 验证并修复路径 - 确保不在系统根目录创建项目文件
            let safeProjectPath = projectPath;
            if (safeProjectPath === '/' || safeProjectPath === 'C:\\' || safeProjectPath === 'D:\\' ||
                safeProjectPath === 'E:\\' || safeProjectPath.endsWith(':\\')) {
                // 如果用户在磁盘根目录运行，创建一个专门的项目目录
                console.log('⚠️  检测到在磁盘根目录运行，将自动创建项目目录进行初始化');

                // 创建带序号的项目目录
                let projectDirName = 'ProjStig';
                let counter = 1;
                let targetDir = join(safeProjectPath, projectDirName);

                // 检查目录是否存在，如果存在则添加序号
                while (await directoryExists(targetDir)) {
                    targetDir = join(safeProjectPath, `${projectDirName}${counter}`);
                    counter++;
                }

                // 创建项目目录
                await fs.mkdir(targetDir, { recursive: true });
                safeProjectPath = targetDir;
                console.log(`📁 项目目录创建成功: ${safeProjectPath}`);
            }

            // 创建项目配置目录
            const projectConfigDir = join(safeProjectPath, '.stigmergy-project');
            await fs.mkdir(projectConfigDir, { recursive: true });

            // 生成项目配置 - 只包含已安装的工具
            const projectConfig = {
                projectType: 'initialized',
                createdAt: new Date().toISOString(),
                adapters: availableCLIs.map(cli => ({
                    name: cli.name,
                    displayName: cli.displayName,
                    required: cli.required,
                    status: 'available'
                }))
            };

            // 保存项目配置
            const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
            await fs.writeFile(projectConfigPath, JSON.stringify(projectConfig, null, 2));

            console.log(`✅ Stigmergy项目初始化完成！`);
            if (availableCLIs.length > 0) {
                console.log(`📊 为 ${availableCLIs.length} 个已安装的AI CLI工具配置协作:`, availableCLIs.map(a => a.name).join(', '));
            } else {
                console.log(`📊 没有检测到已安装的AI CLI工具`);
            }

            // 为所有已安装的CLI生成配置文档
            for (const cliInfo of availableCLIs) {
                // 确保md文件生成在项目目录中而不是系统根目录
                const mdPath = join(safeProjectPath, `${cliInfo.name}.md`);

                try {
                    // 为CLI生成基本配置文档
                    const mdContent = `# ${cliInfo.displayName} 配置

## 基本信息
- **名称**: ${cliInfo.name}
- **显示名称**: ${cliInfo.displayName}
- **状态**: 已安装
- **必需**: ${cliInfo.required ? '是' : '否'}

## Stigmergy协作配置
此工具已配置为参与跨AI工具协作系统。

## 协作指令示例
- 中文: "请用${cliInfo.name}帮我{任务}"
- 英文: "use ${cliInfo.name} to {task}"

---
生成时间: ${new Date().toISOString()}
`;
                    await fs.writeFile(mdPath, mdContent);
                    console.log(`✅ 生成 ${cliInfo.name}.md`);
                } catch (error) {
                    console.log(`⚠️ 生成 ${cliInfo.name}.md 失败: ${error.message}`);
                }
            }

            console.log('✅ 项目配置完成');

            // 为已安装的CLI配置集成插件（如果支持）
            console.log('\n🔄 为已安装的CLI配置协作插件...');
            for (const cliInfo of availableCLIs) {
                try {
                    // 检查是否存在对应的集成安装脚本
                    const adapterDirName = mapAdapterName(cliInfo.name); // 使用映射函数处理qwen->qwencode
                    const installScriptPath = join(__dirname, 'adapters', adapterDirName, `install_${adapterDirName}_integration.py`);

                    // 尝 versfs来检查文件是否存在
                    const { access } = await import('fs/promises');
                    let fileExists = false;
                    try {
                        await access(installScriptPath);
                        fileExists = true;
                    } catch {
                        // 文件不存在
                        fileExists = false;
                    }

                    if (fileExists) {
                        console.log(`\n🔄 配置 ${cliInfo.displayName} 集成插件...`);

                        // 不同CLI工具有可能使用不同的安装参数
                        const installArgs = determineInstallArgs(cliInfo.name);

                        const childProcess = await import('child_process');
                        const { spawn } = childProcess;

                        // 对于Copilot，需要处理npx环境下的路径问题
                        let additionalEnv = {};
                        if (cliInfo.name === 'copilot') {
                            // 设置项目根目录环境变量，帮助Python脚本找到配置文件
                            // __dirname是src目录，所以需要获取父目录作为项目根目录
                            const projectRoot = join(__dirname, '..');  // 从src目录回到项目根目录
                            additionalEnv = {
                                ...process.env,
                                PROJECT_ROOT: projectRoot,
                                STIGMERGY_PROJECT_ROOT: projectRoot
                            };
                        } else {
                            additionalEnv = process.env;
                        }

                        // 运行集成安装脚本，使用特定于该工具的安装参数
                        const integrationProcess = spawn('python', [
                            installScriptPath,
                            ...installArgs
                        ], {
                            stdio: ['pipe', 'pipe', 'pipe'],
                            shell: true,
                            env: additionalEnv
                        });

                        integrationProcess.stdout.on('data', (data) => {
                            const line = data.toString();
                            // 过滤一些冗长的输出
                            if (!line.includes('CLI跨CLI协作集成安装器') &&
                                !line.includes('QwenCode CLI跨CLI协作集成安装器') &&
                                !line.includes('Copilot CLI跨CLI集成安装脚本')) {
                                console.log(line.trim());
                            }
                        });

                        integrationProcess.stderr.on('data', (data) => {
                            const errorLine = data.toString().trim();
                            // 过滤特定的Python错误信息
                            if (!errorLine.includes('CLADE_CONFIG_DIR') && // Claude脚本错误
                                !errorLine.includes('argument --install: ignored explicit argument') && // Copilot参数错误
                                !errorLine.includes('No such file or directory') && // Copilot路径错误
                                !errorLine.includes('loading config file failed') && // Copilot配置文件错误
                                errorLine.length > 0) {
                                console.error(errorLine);
                            }
                        });

                        await new Promise((resolve) => {
                            integrationProcess.on('close', (integrationCode) => {
                                if (integrationCode === 0) {
                                    console.log(`✅ ${cliInfo.displayName} 集成插件配置成功`);
                                } else {
                                    console.log(`⚠️ ${cliInfo.displayName} 集成插件配置可能未完成 (退出码: ${integrationCode})`);
                                }
                                resolve();
                            });
                        });
                    } else {
                        console.log(`ℹ️ ${cliInfo.displayName} - 暂无特殊集成插件配置`);
                    }
                } catch (error) {
                    console.log(`⚠️ ${cliInfo.displayName} 集成插件配置过程中出错: ${error.message}`);
                }
            }

            console.log('\n✅ 系统配置成功');
        } catch (error) {
            console.log(`❌ 系统配置失败: ${error.message}`);
        }
    }


    // 询问用户输入（使用命令行参数而不是inquirer）
    async function promptForTools(notInstalledTools) {
        if (notInstalledTools.length === 0) {
            console.log('\n🎉 您已经安装了所有支持的AI工具！');
            return [];
        }

        console.log('\n🎯 检测到您还可以安装以下AI工具：');
        for (let i = 0; i < notInstalledTools.length; i++) {
            const tool = notInstalledTools[i];
            console.log(`${i + 1}. ${tool.displayName} - ${tool.description}`);
            console.log(`   npm包: ${tool.npmPackage}`);
        }

        console.log('\n💡 提示: 您可以稍后通过 "npm install -g <package>" 手动安装这些工具');
        console.log('   或者现在选择要安装的工具编号，用空格分隔 (如: 1 3 4), 0表示不安装任何工具:');

        return new Promise(async (resolve) => {
            const readline = await import('readline');
            const { createInterface } = readline;
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('请选择要安装的工具编号: ', (answer) => {
                rl.close();

                const selections = answer.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
                if (selections.includes(0)) {
                    resolve([]);
                    return;
                }

                const selectedTools = [];
                for (const selection of selections) {
                    const index = selection - 1; // 转换为0基索引
                    if (index >= 0 && index < notInstalledTools.length) {
                        selectedTools.push(notInstalledTools[index].name);
                    }
                }

                resolve(selectedTools);
            });
        });
    }

    // 自动全局安装 stigmergy-cli
    async function installStigmergyGlobally() {
        console.log('\n🌍 正在全局安装 stigmergy-cli...');
        
        try {
            const { spawn } = await import('child_process');
            
            await new Promise((resolve, reject) => {
                const installProcess = spawn('npm', ['install', '-g', '.'], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true,
                    cwd: process.cwd()
                });

                let output = '';
                installProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                installProcess.stderr.on('data', (data) => {
                    // 过滤npm的警告信息
                    const stderr = data.toString();
                    if (!stderr.includes('WARN')) {
                        output += stderr;
                    }
                });

                installProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('[OK] stigmergy-cli 已成功全局安装！');
                        console.log('      现在可以在任何目录运行: stigmergy-cli <command>');
                        resolve();
                    } else {
                        console.log('[WARN] 全局安装可能未成功，但您可以手动安装:');
                        console.log('      npm install -g stigmergy-cli');
                        resolve(); // 不阻塞流程
                    }
                });

                installProcess.on('error', (error) => {
                    console.log('[WARN] 全局安装失败，您可以手动安装:');
                    console.log('      npm install -g stigmergy-cli');
                    console.log(`      错误: ${error.message}`);
                    resolve(); // 不阻塞流程
                });
            });
        } catch (error) {
            console.log('[WARN] 全局安装失败，您可以手动安装:');
            console.log('      npm install -g stigmergy-cli');
            console.log(`      错误: ${error.message}`);
        }
    }

    // 显示初始化指南
    function showInitializationGuide() {
        console.log('\n🎉 部署完成！以下是使用指南：');
        console.log('\n📋 快速开始:');
        console.log('  现在已全局安装！可以在任何目录运行:');
        console.log('  • 初始化项目: stigmergy-cli init');
        console.log('  • 查看状态: stigmergy-cli status');
        console.log('  • 扫描环境: stigmergy-cli scan');
        console.log('');
        console.log('  或者使用 NPX（无需安装）:');
        console.log('  • 初始化项目: npx stigmergy-cli@latest init');
        console.log('  • 查看状态: npx stigmergy-cli@latest status');
        console.log('  • 扫描环境: npx stigmergy-cli@latest scan');

        console.log('\n⚠️ 重要提示:');
        console.log('  新安装的CLI工具需要注册或自行配置第三方API tokens接口：');
        console.log('');
        
        console.log('\n🔧 各CLI工具启动指令:');
        console.log('  • Claude CLI:     claude');
        console.log('  • Gemini CLI:     gemini');
        console.log('  • QwenCode CLI:   qwen');
        console.log('  • iFlow CLI:       iflow');
        console.log('  • Qoder CLI:       qodercli');
        console.log('  • CodeBuddy CLI:   codebuddy');
        console.log('  • GitHub Copilot:  gh copilot');
        console.log('  • OpenAI Codex:    codex');
        
        console.log('\n📁 建议工作流程:');
        console.log('  1. 新建项目目录:');
        console.log('     mkdir my-ai-project');
        console.log('     cd my-ai-project');
        console.log('');
        console.log('  2. 初始化项目:');
        console.log('     stigmergy-cli init');
        console.log('     或者: npx stigmergy-cli@latest init');
        console.log('');
        console.log('  3. 在任何目录下使用CLI工具:');
        console.log('     claude "设计一个用户认证系统"');
        console.log('     gemini "请用qwen实现这个设计"');
        console.log('     qwen "用iflow创建开发流程"');

        console.log('\n🔑 API配置指南:');
        console.log('  • Claude: 需要设置 ANTHROPIC_API_KEY');
        console.log('  • Gemini: 需要设置 GOOGLE_API_KEY');
        console.log('  • QwenCode: 需要设置 DASHSCOPE_API_KEY');
        console.log('  • iFlow: 需要注册账号获取API密钥');
        console.log('  • Qoder: 需要注册账号获取API密钥');
        console.log('  • CodeBuddy: 需要微信扫码认证或设置 TENCENT_SECRET_ID/KEY');
        console.log('  • Copilot: 需要登录 GitHub 账号');
        console.log('  • Codex: 需要设置 OPENAI_API_KEY');

        console.log('\n🚀 跨AI工具协作示例:');
        console.log('  - 直接在各CLI工具中使用协作指令：');
        console.log('    例: qwen "请用gemini帮我翻译这段代码"');
        console.log('    例: gemini "调用qwen分析这个需求"');
        console.log('    例: claude "使用iflow创建工作流"');

        console.log('\n💡 高级功能:');
        console.log('  - 项目背景共享：所有AI工具共享PROJECT_SPEC.json');
        console.log('  - 任务分配：自动分配和跟踪协作任务');
        console.log('  - Stigmergy协作：通过环境线索实现间接协同');

        console.log('\n🔗 想了解更多？访问: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        console.log('\n🎊 祝您在多AI工具协作中取得成功！');
    }

    try {
        // 检测已安装的AI工具
        const { installedTools, notInstalledTools } = await detectInstalledTools();

        // 询问用户是否安装更多工具
        const toolsToInstall = await promptForTools(notInstalledTools);

        // 安装选中的工具
        await installTools(toolsToInstall);

        // 配置系统
        await configureSystem();

        // 自动全局安装 stigmergy-cli
        await installStigmergyGlobally();

        // 显示使用指南
        showInitializationGuide();
    } catch (error) {
        console.error(`\n❌ 部署过程中发生错误: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();