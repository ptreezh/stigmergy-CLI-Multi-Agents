<<<<<<< HEAD

/**
 * Stigmergy CLI - Simplified Core Functionality
 * Focused on practical deployment and usage requirements
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
            'info': '[INFO] ',
            'success': '[SUCCESS] ',
            'error': '[ERROR] ',
            'warning': '[WARN] '
        }[type] || '[INFO] ';

        console.log(`${timestamp} ${prefix}${message}`);
    }

    scanEnvironment() {
        this.log('Scanning AI environment...', 'info');

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
                this.log(`Found ${tool.displayName} (${tool.doc})`, 'success');
            } else {
                this.log(`Not found ${tool.displayName}`, 'warning');
            }
        }

        if (available.length > 0) {
            this.log(`Found ${available.length} AI CLI tools`, 'success');

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

            this.log('Collaboration guide generated', 'success');
            return true;
        } else {
            this.log('No AI CLI tools found', 'error');
            return false;
        }
    }

    generateCollaborationGuide(available) {
        let guide = '\n## 🤝 AI Collaboration Guide\n\n';

        for (const tool of available) {
            const otherTools = available.filter(t => t.name !== tool.name);

            guide += `### Using ${tool.displayName}\n\n`;
            guide += `In ${tool.displayName}, you can call the following tools:\n\n`;

            for (const other of otherTools.slice(0, 3)) {
                guide += `- Please use ${other.name} to help me ${this.getRandomTask()}\n`;
            }

            guide += '\nExample:\n';
            guide += `\`\`\`Please use ${otherTools[0]?.name || 'qwen'} to help me generate a Python function\`\`\`\n\n`;
        }

        return guide;
    }

    getRandomTask() {
        const tasks = [
            'generate user authentication module',
            'analyze code performance issues',
            'create database migration scripts',
            'implement API endpoints',
            'optimize SQL queries',
            'generate test cases',
            'review code architecture',
            'refactor legacy code',
            'design system architecture documentation',
            'process CSV data and generate visualization charts',
            'analyze key business metrics',
            'implement caching strategies',
            'optimize application startup time'
        ];
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    initProject(projectPath, availableTools) {
        this.log(`Initializing Stigmergy project: ${projectPath}`, 'info');

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
            this.log(`Generating ${tool.name}.md`, 'success');
        }

        // 生成主要协作文档
        const mainDoc = this.generateMainDoc(availableTools);
        writeFileSync(join(projectPath, 'README.md'), mainDoc);

        this.log(`Project initialization completed! Found ${availableTools.length} AI CLI tools`, 'success');
    }

    generateToolDoc(tool, availableTools) {
        const otherTools = available.filter(t => t.name !== tool.name);

        return `# ${tool.displayName} Collaboration Guide

> 🚀 **Stigmergy Collaboration Enhancement** - Enable your ${tool.displayName} to intelligently collaborate with other AI CLI tools

## 📋 Tool Information

- **Name**: ${tool.displayName}
- **Configuration File**: ${tool.name}.json
- **Documentation File**: ${tool.doc}

## 🤝 Collaboration Features

### Chinese Collaboration Commands

In ${tool.displayName}, you can call other AI tools using the following format:

\`\`\`请用{tool_name}帮我{task}\`\`\`

### Example

\`\`\`Please use qwen to help me generate a Python function\`\`\`

## 🔧 Available Collaboration Tools

Based on the current AI environment, you can call the following tools in ${tool.displayName}:

${otherTools.map(t => `- ${t.displayName} (${t.doc})`).join('\n')}

## 💡 Best Practices

### 1. Task Decomposition Strategy
Complex tasks can be decomposed into multiple subtasks and assigned to different AI tools

### 2. Collaboration Workflow Example
1. Use Claude for architectural design
2. Use QwenCode to implement core functionality
3. Use Gemini for performance optimization

### 3. Error Handling and Recovery
If a tool call fails, you can try to complete the same task using other tools

---

**Generation Time**: ${new Date().toLocaleString('en-US')}
**Project Path**: ${process.cwd()}
**Stigmergy Version**: 1.0.0

> 🎉 **Through Stigmergy collaboration, let each AI tool maximize its value!** 🚀
`;
    }

    generateMainDoc(availableTools) {
        let doc = `# Stigmergy CLI - Multi-Agents Cross-AI CLI Tool Collaboration System

> 🚀 **True Stigmergy Collaboration** - Enable various AI CLI tools to intelligently collaborate and create greater value!

## 📋 Discovered AI Tools

The current project has detected the following available AI CLI tools:

${available.map(tool => `- **${tool.displayName}** (${tool.name})`).join('\n')}

## 🎯 Usage

### 1. Project Initialization

\`\`\`
stigmergy-cli init
\`\`\`

### 2. Cross-AI Tool Collaboration

In any AI tool, you can use the following collaboration commands:

### Chinese Collaboration Commands
\`\`\`请用{tool_name}帮我{task}\`\`\`

### Example
\`\`\`Please use qwen to help me generate a Python function\`\`\`

## 🔧 Management Commands

\`\`\`
stigmergy-cli status          # Check system and tool status
\`\`\`

## 📚 Project Configuration

- **Global Configuration**: \`~/.stigmergy-cli/global-config.json\`
- **Project Configuration**: \`.stigmergy-project/stigmergy-config.json\`

---

**Generation Time**: ${new Date().toLocaleString('en-US')}

> 🎉 **Let AI tools achieve true intelligent collaboration through the Stigmergy mechanism!** 🚀

## 🔮 Technical Support

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **Documentation**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/blob/main/README.md

---

**Stigmergy CLI v1.0.0** - Simplified version, focused on core collaboration features
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
            console.log('🔍 Checking Stigmergy CLI status...');
            console.log('📁 Global configuration:', cli.configDir);
            console.log('📁 Project configuration:', cli.projectConfigDir);
            break;
        case 'help':
        default:
            console.log(`
🤖 Stigmergy CLI v1.0.0 - Simplified Version

📚 Available Commands:
  init              - Initialize project (scan AI environment and generate collaboration documents)
  status            - Check status
  help              - Show help information

💡 Usage:
  stigmergy-cli init              # Initialize current project

🔗 Project URL: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
🔧 Configuration Directory: ~/.stigmergy-cli

> 🎉 Simplified Version - Focused on core collaboration features, ready to use!
            `);
            break;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
=======

/**
 * Stigmergy CLI - Simplified Core Functionality
 * Focused on practical deployment and usage requirements
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
            'info': '[INFO] ',
            'success': '[SUCCESS] ',
            'error': '[ERROR] ',
            'warning': '[WARN] '
        }[type] || '[INFO] ';

        console.log(`${timestamp} ${prefix}${message}`);
    }

    scanEnvironment() {
        this.log('Scanning AI environment...', 'info');

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
                this.log(`Found ${tool.displayName} (${tool.doc})`, 'success');
            } else {
                this.log(`Not found ${tool.displayName}`, 'warning');
            }
        }

        if (available.length > 0) {
            this.log(`Found ${available.length} AI CLI tools`, 'success');

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

            this.log('Collaboration guide generated', 'success');
            return true;
        } else {
            this.log('No AI CLI tools found', 'error');
            return false;
        }
    }

    generateCollaborationGuide(available) {
        let guide = '\n## 🤝 AI Collaboration Guide\n\n';

        for (const tool of available) {
            const otherTools = available.filter(t => t.name !== tool.name);

            guide += `### Using ${tool.displayName}\n\n`;
            guide += `In ${tool.displayName}, you can call the following tools:\n\n`;

            for (const other of otherTools.slice(0, 3)) {
                guide += `- Please use ${other.name} to help me ${this.getRandomTask()}\n`;
            }

            guide += '\nExample:\n';
            guide += `\`\`\`Please use ${otherTools[0]?.name || 'qwen'} to help me generate a Python function\`\`\`\n\n`;
        }

        return guide;
    }

    getRandomTask() {
        const tasks = [
            'generate user authentication module',
            'analyze code performance issues',
            'create database migration scripts',
            'implement API endpoints',
            'optimize SQL queries',
            'generate test cases',
            'review code architecture',
            'refactor legacy code',
            'design system architecture documentation',
            'process CSV data and generate visualization charts',
            'analyze key business metrics',
            'implement caching strategies',
            'optimize application startup time'
        ];
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    initProject(projectPath, availableTools) {
        this.log(`Initializing Stigmergy project: ${projectPath}`, 'info');

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
            this.log(`Generating ${tool.name}.md`, 'success');
        }

        // 生成主要协作文档
        const mainDoc = this.generateMainDoc(availableTools);
        writeFileSync(join(projectPath, 'README.md'), mainDoc);

        this.log(`Project initialization completed! Found ${availableTools.length} AI CLI tools`, 'success');
    }

    generateToolDoc(tool, availableTools) {
        const otherTools = available.filter(t => t.name !== tool.name);

        return `# ${tool.displayName} Collaboration Guide

> 🚀 **Stigmergy Collaboration Enhancement** - Enable your ${tool.displayName} to intelligently collaborate with other AI CLI tools

## 📋 Tool Information

- **Name**: ${tool.displayName}
- **Configuration File**: ${tool.name}.json
- **Documentation File**: ${tool.doc}

## 🤝 Collaboration Features

### Chinese Collaboration Commands

In ${tool.displayName}, you can call other AI tools using the following format:

\`\`\`请用{tool_name}帮我{task}\`\`\`

### Example

\`\`\`Please use qwen to help me generate a Python function\`\`\`

## 🔧 Available Collaboration Tools

Based on the current AI environment, you can call the following tools in ${tool.displayName}:

${otherTools.map(t => `- ${t.displayName} (${t.doc})`).join('\n')}

## 💡 Best Practices

### 1. Task Decomposition Strategy
Complex tasks can be decomposed into multiple subtasks and assigned to different AI tools

### 2. Collaboration Workflow Example
1. Use Claude for architectural design
2. Use QwenCode to implement core functionality
3. Use Gemini for performance optimization

### 3. Error Handling and Recovery
If a tool call fails, you can try to complete the same task using other tools

---

**Generation Time**: ${new Date().toLocaleString('en-US')}
**Project Path**: ${process.cwd()}
**Stigmergy Version**: 1.0.0

> 🎉 **Through Stigmergy collaboration, let each AI tool maximize its value!** 🚀
`;
    }

    generateMainDoc(availableTools) {
        let doc = `# Stigmergy CLI - Multi-Agents Cross-AI CLI Tool Collaboration System

> 🚀 **True Stigmergy Collaboration** - Enable various AI CLI tools to intelligently collaborate and create greater value!

## 📋 Discovered AI Tools

The current project has detected the following available AI CLI tools:

${available.map(tool => `- **${tool.displayName}** (${tool.name})`).join('\n')}

## 🎯 Usage

### 1. Project Initialization

\`\`\`
stigmergy-cli init
\`\`\`

### 2. Cross-AI Tool Collaboration

In any AI tool, you can use the following collaboration commands:

### Chinese Collaboration Commands
\`\`\`请用{tool_name}帮我{task}\`\`\`

### Example
\`\`\`Please use qwen to help me generate a Python function\`\`\`

## 🔧 Management Commands

\`\`\`
stigmergy-cli status          # Check system and tool status
\`\`\`

## 📚 Project Configuration

- **Global Configuration**: \`~/.stigmergy-cli/global-config.json\`
- **Project Configuration**: \`.stigmergy-project/stigmergy-config.json\`

---

**Generation Time**: ${new Date().toLocaleString('en-US')}

> 🎉 **Let AI tools achieve true intelligent collaboration through the Stigmergy mechanism!** 🚀

## 🔮 Technical Support

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **Documentation**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/blob/main/README.md

---

**Stigmergy CLI v1.0.0** - Simplified version, focused on core collaboration features
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
            console.log('🔍 Checking Stigmergy CLI status...');
            console.log('📁 Global configuration:', cli.configDir);
            console.log('📁 Project configuration:', cli.projectConfigDir);
            break;
        case 'help':
        default:
            console.log(`
🤖 Stigmergy CLI v1.0.0 - Simplified Version

📚 Available Commands:
  init              - Initialize project (scan AI environment and generate collaboration documents)
  status            - Check status
  help              - Show help information

💡 Usage:
  stigmergy-cli init              # Initialize current project

🔗 Project URL: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
🔧 Configuration Directory: ~/.stigmergy-cli

> 🎉 Simplified Version - Focused on core collaboration features, ready to use!
            `);
            break;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
>>>>>>> temp-branch
}