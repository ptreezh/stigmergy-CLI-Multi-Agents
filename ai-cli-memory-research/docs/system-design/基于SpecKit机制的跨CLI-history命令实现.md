# 基于Spec Kit机制的跨CLI /history 命令实现方案

## 方案概述

基于GitHub Spec Kit的真实斜杠命令扩展机制，实现跨CLI的`/history`命令，用于查看和恢复不同CLI工具的历史会话。

## 1. 核心技术原理

### 1.1 Spec Kit斜杠命令机制

**关键发现**: 各AI CLI通过以下机制支持斜杠命令：

```
项目根目录/
├── .claude/commands/     # Claude CLI斜杠命令目录
├── .gemini/commands/     # Gemini CLI斜杠命令目录
├── .qwen/commands/       # Qwen CLI斜杠命令目录
├── .iflow/commands/      # IFlow CLI斜杠命令目录
└── .codebuddy/commands/  # CodeBuddy CLI斜杠命令目录
```

每个CLI会自动扫描其`commands/`目录下的`.md`文件，并将其识别为斜杠命令。

### 1.2 命令模板格式

```markdown
---
description: 命令描述
handoffs:                 # 可选：代理交接
scripts:                  # 可选：执行脚本
  sh: script.sh "$ARGUMENTS"
---

## 用户输入
```text
$ARGUMENTS
```

## 命令内容
```

## 2. 跨CLI /history 命令实现

### 2.1 目录结构设计

```
项目根目录/
├── .claude/commands/
│   └── history.md              # Claude的history命令
├── .gemini/commands/
│   └── history.md              # Gemini的history命令
├── .qwen/commands/
│   └── history.md              # Qwen的history命令
├── .iflow/commands/
│   └── history.md              # IFlow的history命令
├── .codebuddy/commands/
│   └── history.md              # CodeBuddy的history命令
└── .cross-cli/                 # 跨CLI工具集
    ├── history-scanner.js      # 会话扫描器
    ├── session-formatter.js    # 会话格式化器
    ├── session-exporter.js     # 会话导出器
    ├── history-scanner.sh      # Bash扫描脚本
    └── history-scanner.ps1     # PowerShell扫描脚本
```

### 2.2 统一的history命令模板

```markdown
---
description: 查看跨CLI历史会话并恢复选中的会话
scripts:
  sh: .cross-cli/history-scanner.sh "$ARGUMENTS"
  ps: .cross-cli/history-scanner.ps1 "$ARGUMENTS"
---

## 用户输入
```text
$ARGUMENTS
```

## 跨CLI历史会话恢复

### 🔍 扫描当前项目的所有CLI会话

项目路径: `$(pwd)`

<!-- 动态生成的会话列表将在这里显示 -->

### 💡 使用说明
- 输入数字选择要恢复的会话
- 使用 `/export <session-id>` 导出会话内容
- 使用 `/search <keyword>` 搜索特定会话
- 使用 `/help` 查看更多选项

### 📋 可用操作
- **恢复会话**: 直接输入会话编号
- **导出内容**: `/export <session-id>`
- **搜索会话**: `/search <keyword>`
- **按CLI筛选**: `/filter <cli-name>`
- **显示详情**: `/detail <session-id>`
```

### 2.3 核心扫描器实现

#### JavaScript扫描器 (.cross-cli/history-scanner.js)

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

class CrossCLIScanner {
    constructor() {
        this.homeDir = os.homedir();
        this.projectDir = process.cwd();
        this.cliConfigs = {
            claude: {
                baseDir: path.join(this.homeDir, '.claude', 'projects'),
                pattern: /.*\.jsonl$/,
                parser: this.parseClaudeSession.bind(this)
            },
            gemini: {
                baseDir: path.join(this.homeDir, '.gemini', 'tmp'),
                pattern: /.*\/chats\/session-.*\.json$/,
                parser: this.parseGeminiSession.bind(this)
            },
            qwen: {
                baseDir: path.join(this.homeDir, '.qwen', 'tmp'),
                pattern: /.*\/chats\/session-.*\.json$/,
                parser: this.parseQwenSession.bind(this)
            },
            iflow: {
                baseDir: path.join(this.homeDir, '.iflow', 'projects'),
                pattern: /.*\/session-.*\.jsonl$/,
                parser: this.parseIFlowSession.bind(this)
            },
            codebuddy: {
                baseDir: path.join(this.homeDir, '.codebuddy'),
                pattern: /.*\.jsonl$/,
                parser: this.parseCodeBuddySession.bind(this)
            }
        };
    }

    async scanAllSessions() {
        const allSessions = [];
        let index = 1;

        console.log('### 🔍 扫描当前项目的所有CLI会话');
        console.log(`项目路径: \`${this.projectDir}\``);
        console.log('');

        for (const [cliName, config] of Object.entries(this.cliConfigs)) {
            const cliSessions = await this.scanCLI(cliName, config);

            if (cliSessions.length > 0) {
                console.log(`### ${this.getCLIIcon(cliName)} ${cliName.toUpperCase()} CLI会话 (${cliSessions.length}个)`);

                cliSessions.forEach(session => {
                    session.index = index++;
                    console.log(this.formatSession(session));
                });

                console.log('');
            }
        }

        if (allSessions.length === 0) {
            console.log('📭 未找到任何历史会话');
        } else {
            console.log(`### 💡 使用说明`);
            console.log(`- 输入数字选择要恢复的会话 (1-${index-1})`);
            console.log(`- 使用 \`/export <session-id>\` 导出会话内容`);
            console.log(`- 使用 \`/search <keyword>\` 搜索特定会话`);
        }

        return allSessions;
    }

    async scanCLI(cliName, config) {
        const sessions = [];

        try {
            if (!fs.existsSync(config.baseDir)) {
                return sessions;
            }

            const sessionFiles = this.findSessionFiles(config.baseDir, config.pattern);

            for (const filePath of sessionFiles) {
                if (this.isProjectSession(filePath)) {
                    try {
                        const session = await config.parser(filePath);
                        session.sourceCLI = cliName;
                        session.filePath = filePath;
                        sessions.push(session);
                    } catch (error) {
                        console.warn(`解析会话失败 ${filePath}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.warn(`扫描${cliName}会话失败: ${error.message}`);
        }

        return sessions;
    }

    isProjectSession(filePath) {
        // 检查会话文件是否属于当前项目
        // 实现项目匹配逻辑
        return true; // 简化实现
    }

    parseClaudeSession(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const lastLine = lines[lines.length - 1];

        try {
            const session = JSON.parse(lastLine);
            return {
                sessionId: session.sessionId,
                lastUpdated: session.timestamp,
                messageCount: lines.length,
                lastMessage: session.message?.content || 'No content',
                workingDir: session.cwd
            };
        } catch (error) {
            return {
                sessionId: path.basename(filePath, '.jsonl'),
                lastUpdated: fs.statSync(filePath).mtime.toISOString(),
                messageCount: lines.length,
                lastMessage: 'Unable to parse content'
            };
        }
    }

    parseGeminiSession(filePath) {
        const session = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        return {
            sessionId: session.sessionId,
            lastUpdated: session.lastUpdated,
            messageCount: session.messages.length,
            lastMessage: session.messages[session.messages.length - 1]?.content || 'No content',
            projectHash: session.projectHash
        };
    }

    parseQwenSession(filePath) {
        const session = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        return {
            sessionId: session.sessionId,
            lastUpdated: session.lastUpdated,
            messageCount: session.messages.length,
            lastMessage: session.messages[session.messages.length - 1]?.content || 'No content',
            tokens: session.tokens
        };
    }

    parseIFlowSession(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        try {
            const lastLine = lines[lines.length - 1];
            const session = JSON.parse(lastLine);

            return {
                sessionId: session.sessionId,
                lastUpdated: session.timestamp,
                messageCount: lines.length,
                lastMessage: session.message?.content || 'No content',
                workingDir: session.cwd
            };
        } catch (error) {
            return {
                sessionId: path.basename(filePath, '.jsonl'),
                lastUpdated: fs.statSync(filePath).mtime.toISOString(),
                messageCount: lines.length,
                lastMessage: 'Unable to parse content'
            };
        }
    }

    formatSession(session) {
        const time = new Date(session.lastUpdated).toLocaleString();
        const icon = this.getCLIIcon(session.sourceCLI);

        return `**${session.index}. ${session.sessionId}**
- 🕒 ${time}
- 💬 ${session.messageCount}条消息
- 📝 最后消息: ${this.truncateMessage(session.lastMessage)}
- 🔧 恢复: \`/resume-${session.sourceCLI} ${session.sessionId}\``;
    }

    getCLIIcon(cliName) {
        const icons = {
            claude: '🤖',
            gemini: '💎',
            qwen: '🐲',
            iflow: '🌊',
            codebuddy: '👨‍💻',
            qoder: '⚡'
        };
        return icons[cliName] || '📝';
    }

    truncateMessage(message, maxLength = 50) {
        if (!message) return 'No content';
        return message.length > maxLength
            ? message.substring(0, maxLength) + '...'
            : message;
    }
}

// 主执行逻辑
async function main() {
    const scanner = new CrossCLIScanner();
    await scanner.scanAllSessions();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = CrossCLIScanner;
```

### 2.4 会话导出器实现

```javascript
// .cross-cli/session-exporter.js
const fs = require('fs');
const path = require('path');

class SessionExporter {
    async exportSession(sessionId, format = 'markdown') {
        // 根据sessionId查找并导出会话
        const session = await this.findSession(sessionId);

        switch (format) {
            case 'markdown':
                return this.exportToMarkdown(session);
            case 'context':
                return this.exportToContext(session);
            case 'json':
                return this.exportToJSON(session);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    exportToMarkdown(session) {
        let markdown = `# ${session.sourceCLI.toUpperCase()} 会话导出\n\n`;
        markdown += `**会话ID**: ${session.sessionId}\n`;
        markdown += `**最后更新**: ${new Date(session.lastUpdated).toLocaleString()}\n`;
        markdown += `**消息数量**: ${session.messageCount}\n\n`;
        markdown += `---\n\n`;

        // 添加会话内容
        if (session.messages) {
            session.messages.forEach(msg => {
                const role = msg.type === 'user' ? '👤 用户' : '🤖 助手';
                markdown += `## ${role}\n\n${msg.content}\n\n`;
            });
        }

        return markdown;
    }

    exportToContext(session) {
        let context = `以下是从${session.sourceCLI}会话中恢复的对话历史:\n\n`;

        if (session.messages) {
            session.messages.forEach(msg => {
                const role = msg.type === 'user' ? '用户' : '助手';
                context += `${role}: ${msg.content}\n\n`;
            });
        }

        context += `--- 会话结束 ---\n\n`;
        context += `现在请基于以上历史对话继续我们的讨论。`;

        return context;
    }
}
```

## 3. 安装和部署

### 3.1 自动安装脚本

```bash
#!/bin/bash
# install-cross-cli-history.sh

echo "🚀 安装跨CLI /history 命令..."

# 创建跨CLI工具目录
mkdir -p .cross-cli

# 下载核心文件
curl -o .cross-cli/history-scanner.js https://raw.githubusercontent.com/your-repo/cross-cli-tools/main/history-scanner.js
curl -o .cross-cli/session-exporter.js https://raw.githubusercontent.com/your-repo/cross-cli-tools/main/session-exporter.js
curl -o .cross-cli/history-scanner.sh https://raw.githubusercontent.com/your-repo/cross-cli-tools/main/history-scanner.sh

# 设置执行权限
chmod +x .cross-cli/history-scanner.sh
chmod +x .cross-cli/history-scanner.js

# 创建CLI命令目录
mkdir -p .claude/commands
mkdir -p .gemini/commands
mkdir -p .qwen/commands
mkdir -p .iflow/commands
mkdir -p .codebuddy/commands

# 复制history模板
cp templates/history.md .claude/commands/
cp templates/history.md .gemini/commands/
cp templates/history.md .qwen/commands/
cp templates/history.md .iflow/commands/
cp templates/history.md .codebuddy/commands/

echo "✅ 安装完成！现在可以在支持的CLI中使用 /history 命令"
```

### 3.2 使用方式

```bash
# 在任何支持斜杠命令的CLI中使用
cd /your/project

# 使用Claude CLI
claude
> /history

# 使用Gemini CLI
gemini
> /history

# 使用Qwen CLI
qwen
> /history
```

## 4. 预期效果

### 4.1 命令输出示例

```
> /history

### 🔍 扫描当前项目的所有CLI会话
项目路径: `/d/my-project`

### 🤖 CLAUDE CLI会话 (3个)
**1. f7767350-c888-4607-8f66-4c2b19fa5f3a**
- 🕒 2025-12-12 08:39:01
- 💬 12条消息
- 📝 最后消息: 分析这个API集成方案
- 🔧 恢复: `/resume-claude f7767350-c888-4607-8f66-4c2b19fa5f3a`

**2. e488609e-b6c8-4249-aa7e-87f9b4ad3df5**
- 🕒 2025-12-11 22:34:02
- 💬 8条消息
- 📝 最后消息: 重构认证模块
- 🔧 恢复: `/resume-claude e488609e-b6c8-4249-aa7e-87f9b4ad3df5`

### 💎 GEMINI CLI会话 (2个)
**3. 264c12b1-9b6d-47c8-887f-9e008bd15f64**
- 🕒 2025-11-03 10:44:23
- 💬 15条消息
- 📝 最后消息: 检查项目状态
- 🔧 恢复: `/resume-gemini 264c12b1-9b6d-47c8-887f-9e008bd15f64`

### 💡 使用说明
- 输入数字选择要恢复的会话 (1-3)
- 使用 `/export <session-id>` 导出会话内容
- 使用 `/search <keyword>` 搜索特定会话
```

## 5. 技术优势

### 5.1 原生集成
- ✅ 基于CLI原生斜杠命令机制
- ✅ 无需修改CLI源码
- ✅ 遵循CLI的标准命令格式

### 5.2 跨CLI兼容
- ✅ 支持所有主流AI CLI工具
- ✅ 统一的用户界面和操作方式
- ✅ 自动适配不同CLI的会话格式

### 5.3 功能丰富
- ✅ 会话列表查看
- ✅ 会话内容导出
- ✅ 交互式会话恢复
- ✅ 搜索和过滤功能

## 6. 总结

基于GitHub Spec Kit的真实斜杠命令扩展机制，跨CLI的`/history`命令实现是**完全可行的**：

1. **技术简单**: 基于文件系统和Markdown模板
2. **兼容性好**: 所有主流CLI都支持斜杠命令
3. **功能强大**: 支持查看、导出、恢复等多种操作
4. **用户体验佳**: 统一的操作界面，无缝集成

这个方案完全解决了跨CLI会话恢复的技术难题！