/**
 * 轻量级CLI增强器 - 增量到现有CLI
 * 不修改CLI原生行为，增加协同能力
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { CLIInteractionDetector } from './cli_interaction_detector.js';

class LightweightCLIEnhancer {
    constructor() {
        this.detector = new CLIInteractionDetector();
        this.enhancementConfig = {
            enableContextSharing: true,
            enableCollaborationHints: true,
            enableAutomaticFileSharing: true,
            minimalIntervention: true
        };
    }

    /**
     * 增强CLI命令 - 最小化介入
     */
    async enhanceCliCommand(cliName, args, options = {}) {
        // 初始化检测器
        await this.detector.initialize();

        // 检测CLI调用
        const detection = await this.detector.detectCliInvocation(cliName, args, options.cwd);

        if (!detection) {
            // 如果没有检测到特殊意图，直接执行原命令
            return this.executeOriginalCommand(cliName, args, options);
        }

        // 生成增强参数
        const enhancedArgs = await this.generateEnhancedArgs(detection);

        // 执行增强命令
        return this.executeEnhancedCommand(cliName, enhancedArgs, options, detection);
    }

    /**
     * 执行原始命令 - 完全不改变行为
     */
    async executeOriginalCommand(cliName, args, options = {}) {
        const cliCommands = {
            'claude': ['claude', '@anthropic/claude-code'],
            'gemini': ['gemini', '@google/gemini-cli'],
            'qwen': ['qwen', 'qwencode'],
            'iflow': ['iflow', '@iflow-ai/iflow-cli'],
            'qoder': ['qodercli', 'qoder'],
            'codebuddy': ['codebuddy', '@tencent-ai/codebuddy-code'],
            'copilot': ['copilot', 'gh copilot'],
            'codex': ['codex', 'openai-codex']
        };

        const command = cliCommands[cliName]?.[0] || cliName;
        
        return spawnSync(command, args, {
            stdio: 'inherit',
            cwd: options.cwd || process.cwd(),
            env: { ...process.env, ...options.env }
        });
    }

    /**
     * 生成增强参数
     */
    async generateEnhancedArgs(detection) {
        const enhancedArgs = [...detection.userInput.split(' ')];
        
        // 添加上下文线索
        if (this.enhancementConfig.enableContextSharing && detection.environmentContext) {
            const contextHint = this.generateContextHint(detection);
            if (contextHint) {
                enhancedArgs.push(`[上下文: ${contextHint}]`);
            }
        }

        // 添加协作提示
        if (this.enhancementConfig.enableCollaborationHints && detection.suggestions.length > 0) {
            const collaborationHint = this.generateCollaborationHint(detection.suggestions[0]);
            if (collaborationHint) {
                enhancedArgs.push(`[协作提示: ${collaborationHint}]`);
            }
        }

        return enhancedArgs;
    }

    /**
     * 生成上下文提示
     */
    generateContextHint(detection) {
        const context = detection.environmentContext;
        
        if (context.frequentCollaboration && Object.keys(context.frequentCollaboration).length > 0) {
            const frequentCli = Object.keys(context.frequentCollaboration)[0];
            return `最近经常与${frequentCli}协作`;
        }

        if (context.commonTopics && context.commonTopics.length > 0) {
            return `最近在处理${context.commonTopics[0]}相关任务`;
        }

        return '';
    }

    /**
     * 生成协作提示
     */
    generateCollaborationHint(suggestion) {
        switch (suggestion.type) {
            case 'frequent_collaboration':
                return `建议后续可使用${suggestion.cli}继续`;
            case 'topic_based':
                return `建议使用专门工具处理${suggestion.topic}任务`;
            default:
                return suggestion.suggestion;
        }
    }

    /**
     * 执行增强命令
     */
    async executeEnhancedCommand(cliName, enhancedArgs, options, detection) {
        // 先执行原始命令
        const result = await this.executeOriginalCommand(cliName, enhancedArgs, options);

        // 后台处理协作逻辑
        if (this.enhancementConfig.enableAutomaticFileSharing) {
            await this.handleAutomaticFileSharing(detection);
        }

        // 记录协作结果
        await this.logCollaborationResult(detection, result);

        return result;
    }

    /**
     * 处理自动文件共享
     */
    async handleAutomaticFileSharing(detection) {
        if (!detection.collaborationIntent) {
            return;
        }

        try {
            // 检测当前目录中的重要文件
            const importantFiles = await this.detectImportantFiles();
            
            // 自动共享相关文件到环境
            for (const file of importantFiles) {
                await this.detector.shareFileToEnvironment(
                    detection.cliName,
                    file.filePath,
                    { 
                        autoShared: true,
                        collaborationIntent: detection.collaborationIntent,
                        relevanceScore: file.relevanceScore
                    }
                );
            }
        } catch (error) {
            console.error('❌ 自动文件共享失败:', error.message);
        }
    }

    /**
     * 检测重要文件
     */
    async detectImportantFiles() {
        const workingDir = process.cwd();
        const files = await fs.readdir(workingDir);
        
        const importantPatterns = {
            'README': ['README.md', 'README.txt', 'readme.md'],
            'Config': ['package.json', 'requirements.txt', 'pyproject.toml', 'Cargo.toml'],
            'Code': ['src/', 'lib/', 'app/', 'main.py', 'main.js', 'index.js', 'index.py'],
            'Project': ['project.json', 'project.toml', '.stigmergy-project/']
        };

        const importantFiles = [];
        
        for (const file of files) {
            let relevanceScore = 0;
            let fileType = '';
            
            for (const [type, patterns] of Object.entries(importantPatterns)) {
                if (patterns.some(pattern => file.includes(pattern) || file.startsWith(pattern))) {
                    relevanceScore += 2;
                    fileType = type;
                }
            }

            if (relevanceScore > 0) {
                const filePath = path.join(workingDir, file);
                try {
                    const stats = await fs.stat(filePath);
                    importantFiles.push({
                        fileName: file,
                        filePath,
                        fileType,
                        relevanceScore,
                        size: stats.size,
                        modified: stats.mtime
                    });
                } catch (error) {
                    // 忽略无法访问的文件
                }
            }
        }

        // 按相关性排序
        return importantFiles
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 5); // 最多共享5个文件
    }

    /**
     * 记录协作结果
     */
    async logCollaborationResult(detection, result) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                type: 'collaboration_result',
                cliName: detection.cliName,
                userInput: detection.userInput,
                collaborationIntent: detection.collaborationIntent,
                exitCode: result.status,
                success: result.status === 0,
                enhanced: true
            };

            const logFile = path.join(process.cwd(), '.stigmergy-project', 'collaboration_results.log');
            await fs.mkdir(path.dirname(logFile), { recursive: true });
            
            const logLine = JSON.stringify(logEntry) + '\n';
            await fs.appendFile(logFile, logLine);
        } catch (error) {
            console.error('❌ 记录协作结果失败:', error.message);
        }
    }

    /**
     * 创建CLI命令包装器
     */
    createCliWrapper(cliName) {
        return async (...args) => {
            return await this.enhanceCliCommand(cliName, args);
        };
    }

    /**
     * 获取当前环境状态
     */
    async getEnvironmentStatus() {
        try {
            const suggestions = await this.detector.getCliSuggestions('claude'); // 以claude为例
            const sharedFiles = await this.detector.getSharedFilesFromEnvironment();
            
            return {
                systemInitialized: true,
                featuresEnabled: this.enhancementConfig,
                availableSuggestions: suggestions.collaborationSuggestions.length,
                sharedFilesCount: sharedFiles.length,
                recentCollaborations: suggestions.recentCollaborations.length
            };
        } catch (error) {
            return {
                systemInitialized: false,
                error: error.message
            };
        }
    }
}

export { LightweightCLIEnhancer };