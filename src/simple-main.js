
/**
 * Stigmergy CLI - 简化版核心功能
 * 专注于实际的部署和使用需求
 */

import { existsSync, exists, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

class SimpleStigmergyCLI {
    constructor() {
        this.configDir = join(homedir(), '.stigmergy-cli');
        this.projectConfigDir = '.stigmergy-project';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '📦 ',
            'success': '✅ ',
            'error': '❌ ',
            'warning': '⚠️ '
        }[type] || '📦 ';

        console.log(`${timestamp} ${prefix}${message}`);
    }

    scanEnvironment() {
        this.log('扫描AI环境...', 'info');

        const cliTools = [
            { name: 'claude', displayName: 'Claude CLI', doc: 'claude.md' },
            { name: 'gemini', displayName: 'Gemini CLI', doc: 'gemini.md' },
            { name: 'qwen', displayName: 'QwenCode CLI', doc: 'qwen.md' },
            { name: 'iflow', displayName: 'iFlow CLI', doc: 'iflow.md' },
            { name: 'qoder', displayName: 'Qoder CLI', doc: 'qoder.md' },
            { name: 'codebuddy', displayName: 'CodeBuddy CLI', doc: 'codebuddy.md' },
            { name: 'copilot', displayName: 'Copilot CLI', doc: 'copilot.md' },
            { name: 'codex', displayName: 'Codex CLI', doc: 'codex.md' }
        ];

        const available = [];
        for (const tool of cliTools) {
            if (existsSync(join(process.cwd(), `${tool.doc}`))) {
                available.push(tool);
                this.log(`发现 ${tool.displayName} (${tool.doc})`, 'success');
            } else {
                this.log(`未发现 ${tool.displayName}`, 'warning');
            }
        }

        if (available.length > 0) {
            this.log(`发现 ${available.length} 个AI CLI工具`, 'success');

            // 生成简单的协作指南
            const collaborationGuide = this.generateCollaborationGuide(available);

            // 保存全局配置
            const globalConfig = {
                cliTools: available,
                lastUpdate: new Date().toISOString(),
                version: '1.0.0'
            };

            if (!existsSync(this.configDir)) {
                mkdirSync(this.configDir, { recursive: true });
            }

            writeFileSync(
                join(this.configDir, 'global-config.json'),
                JSON.stringify(globalConfig, null, 2)
            );

            // 生成项目配置
            this.initProject(process.cwd(), available);

            this.log('协作指南已生成', 'success');
            return true;
        } else {
            this.log('未发现任何AI CLI工具', 'error');
            return false;
        }
    }

    generateCollaborationGuide(available) {
        let guide = '\n## 🤝 AI工具协作指南\n\n';

        for (const tool of available) {
            const otherTools = available.filter(t => t.name !== tool.name);

            guide += `### 使用 ${tool.displayName}\n\n`;
            guide += `在${tool.displayName}中，您可以调用以下工具：\n\n`;

            for (const other of otherTools.slice(0, 3)) {
                guide += `- 请用${other.name}帮我${this.getRandomTask()}\n`;
            }

            guide += '\n示例：\n';
            guide += `\`\`\`请用${otherTools[0]?.name || 'qwen'}帮我生成一个Python函数\`\`\`\n\n`;
        }

        return guide;
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

    initProject(projectPath, availableTools) {
        this.log(`初始化Stigmergy项目: ${projectPath}`, 'info');

        // 创建项目配置目录
        const configDir = join(projectPath, this.projectConfigDir);
        if (!existsSync(configDir)) {
            mkdirSync(configDir, { recursive: true });
        }

        // 生成项目配置
        const projectConfig = {
            projectType: 'stigmergy-initialized',
            createdAt: new Date().toISOString(),
            cliTools: availableTools,
            version: '1.0.0'
        };

        writeFileSync(
            join(configDir, 'stigmergy-config.json'),
            JSON.stringify(projectConfig, null, 2)
        );

        // 为每个可用工具生成简单的协作文档
        for (const tool of availableTools) {
            const docContent = this.generateToolDoc(tool, availableTools);
            writeFileSync(join(projectPath, `${tool.name}.md`), docContent);
            this.log(`生成 ${tool.name}.md`, 'success');
        }

        // 生成主要协作文档
        const mainDoc = this.generateMainDoc(availableTools);
        writeFileSync(join(projectPath, 'README.md'), mainDoc);

        this.log(`项目初始化完成！发现 ${availableTools.length} 个AI CLI工具`, 'success');
    }

    generateToolDoc(tool, availableTools) {
        const otherTools = available.filter(t => t.name !== tool.name);

        return `# ${tool.displayName} 协作指南

> 🚀 **Stigmergy协作增强** - 让您的${tool.displayName}能够与其他AI CLI工具智能协作

## 📋 工具信息

- **名称**: ${tool.displayName}
- **配置文件**: ${tool.name}.json
- **文档文件**: ${tool.doc}

## 🤝 协作功能

### 中文协作指令

在${tool.displayName}中，您可以使用以下格式调用其他AI工具：

\`\`\`请用{工具名}帮我{任务}\`\`\`

### 示例

\`\`\`请用qwen帮我生成一个Python函数\`\`\`

## 🔧 可用的协作工具

根据当前AI环境，您可以在${tool.displayName}中调用以下工具：

${otherTools.map(t => `- ${t.displayName} (${t.doc})`).join('\n')}

## 💡 最佳实践

### 1. 任务分解策略
复杂任务可以分解为多个子任务，分配给不同的AI工具

### 2. 协作工作流示例
1. 使用Claude进行架构设计
2. 使用QwenCode实现核心功能
3. 使用Gemini进行性能优化

### 3. 错误处理和恢复
如果某个工具调用失败，可以尝试使用其他工具完成相同任务

---

**生成时间**: ${new Date().toLocaleString('zh-CN')}
**项目路径**: ${process.cwd()}
**Stigmergy版本**: 1.0.0

> 🎉 **通过Stigmergy协作，让每个AI工具都能发挥最大价值！** 🚀
`;
    }

    generateMainDoc(availableTools) {
        let doc = `# Stigmergy CLI - Multi-Agents跨AI CLI工具协作系统

> 🚀 **真正的Stigmergy协作** - 让各个AI CLI工具智能协作，创造更大的价值！

## 📋 发现的AI工具

当前项目已检测到以下可用的AI CLI工具：

${available.map(tool => `- **${tool.displayName}** (${tool.name})`).join('\n')}

## 🎯 使用方法

### 1. 项目初始化

\`\`\`
stigmergy-cli init
\`\`\`

### 2. 跨AI工具协作

在任意AI工具中，您可以使用以下协作指令：

### 中文协作指令
\`\`\`请用{工具名}帮我{任务}\`\`\`

### 示例
\`\`\`请用qwen帮我生成一个Python函数\`\`\`

## 🔧 管理命令

\`\`\`
stigmergy-cli status          # 检查系统和工具状态
\`\`\`

## 📚 项目配置

- **全局配置**: \`~/.stigmergy-cli/global-config.json\`
- **项目配置**: \`.stigmergy-project/stigmergy-config.json\`

---

**生成时间**: ${new Date().toLocaleString('zh-CN')}

> 🎉 **让AI工具通过Stigmergy机制实现真正的智能协作！** 🚀

## 🔮 技术支持

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **文档**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/blob/main/README.md

---

**Stigmergy CLI v1.0.0** - 简化版，专注于核心协作功能
`;

        return doc;
    }
}

// 简化的命令处理
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const cli = new SimpleStigmergyCLI();

    switch (command) {
        case 'init':
            await cli.scanEnvironment();
            break;
        case 'status':
            console.log('🔍 检查Stigmergy CLI状态...');
            console.log('📁 全局配置:', cli.configDir);
            console.log('📁 项目配置:', cli.projectConfigDir);
            break;
        case 'help':
        default:
            console.log(`
🤖 Stigmergy CLI v1.0.0 - 简化版

📚 可用命令:
  init              - 初始化项目(扫描AI环境并生成协作文档)
  status            - 检查状态
  help              - 显示帮助信息

💡 使用方法:
  stigmergy-cli init              # 初始化当前项目

🔗 项目地址: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
🔧 配置目录: ~/.stigmergy-cli

> 🎉 简化版 - 专注于核心协作功能，立即可用！
            `);
            break;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}