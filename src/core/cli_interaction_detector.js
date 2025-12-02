/**
 * CLI协同检测器 - 轻量级拦截，增强现有适配器
 * 增量设计，不影响现有系统
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { EnvironmentStigmergySystem } from './environment_stigmergy_system.js';

class CLIInteractionDetector {
    constructor() {
        this.stigmergySystem = new EnvironmentStigmergySystem();
        this.interactionLogFile = path.join(process.cwd(), '.stigmergy-project', 'interactions.log');
        
        // 检测配置 - 轻量级，不修改现有CLI行为
        this.detectionConfig = {
            enableCollaborationDetection: true,
            enableContextSharing: true,
            enableSuggestion: true,
            minimalLogging: true
        };
        
        // CLI命令映射
        this.cliCommands = {
            'claude': ['claude', '@anthropic/claude-code'],
            'gemini': ['gemini', '@google/gemini-cli'],
            'qwen': ['qwen', 'qwencode'],
            'iflow': ['iflow', '@iflow-ai/iflow-cli'],
            'qoder': ['qodercli', 'qoder'],
            'codebuddy': ['codebuddy', '@tencent-ai/codebuddy-code'],
            'copilot': ['copilot', 'gh copilot'],
            'codex': ['codex', 'openai-codex']
        };
    }

    /**
     * 初始化检测器 - 增量到现有系统
     */
    async initialize() {
        try {
            // 初始化环境线索系统
            await this.stigmergySystem.initializeEnvironmentSystem();
            
            // 创建交互日志目录
            const logDir = path.dirname(this.interactionLogFile);
            await fs.mkdir(logDir, { recursive: true });
            
            console.log('✅ CLI协同检测器初始化完成');
            return true;
        } catch (error) {
            console.error('❌ CLI协同检测器初始化失败:', error.message);
            return false;
        }
    }

    /**
     * 检测CLI调用 - 轻量级监控
     */
    async detectCliInvocation(command, args, workingDir = process.cwd()) {
        const cliName = this.detectCliFromCommand(command);
        
        if (!cliName) {
            return null;
        }

        const userInput = args.join(' ');
        
        // 检测协作意图
        const collaborationIntent = await this.stigmergySystem.writeEnvironmentSignal(
            cliName, 
            userInput, 
            { workingDir, command }
        );

        // 记录交互
        await this.logInteraction({
            type: 'cli_invocation',
            cliName,
            command,
            args: userInput,
            workingDir,
            collaborationIntent,
            timestamp: new Date().toISOString()
        });

        // 读取环境线索
        const environmentContext = await this.stigmergySystem.readEnvironmentSignals(cliName);

        return {
            cliName,
            userInput,
            collaborationIntent,
            environmentContext,
            suggestions: environmentContext.collaborationSuggestions
        };
    }

    /**
     * 从命令检测CLI名称
     */
    detectCliFromCommand(command) {
        const cmd = command.toLowerCase();
        
        for (const [cliName, commands] of Object.entries(this.cliCommands)) {
            if (commands.some(cmdStr => cmd.includes(cmdStr))) {
                return cliName;
            }
        }

        return null;
    }

    /**
     * 生成上下文增强参数
     */
    async generateContextEnhancedArgs(cliName, originalArgs, context) {
        const enhancedArgs = [...originalArgs];
        
        // 如果检测到协作意图，添加上下文
        if (context.collaborationIntent && context.collaborationSuggestions.length > 0) {
            // 生成上下文提示
            const contextHint = this.generateContextHint(context);
            if (contextHint) {
                enhancedArgs.push(`[环境线索: ${contextHint}]`);
            }
        }

        return enhancedArgs;
    }

    /**
     * 生成上下文提示
     */
    generateContextHint(context) {
        const suggestions = context.collaborationSuggestions;
        
        if (suggestions.length === 0) {
            return '';
        }

        // 选择最相关的建议
        const topSuggestion = suggestions[0];
        
        switch (topSuggestion.type) {
            case 'frequent_collaboration':
                return `最近频繁与${topSuggestion.cli}协作，考虑继续协作`;
            case 'topic_based':
                return `最近在处理"${topSuggestion.topic}"任务，可结合相关工具`;
            default:
                return topSuggestion.suggestion;
        }
    }

    /**
     * 记录交互日志
     */
    async logInteraction(interaction) {
        try {
            const logLine = JSON.stringify(interaction) + '\n';
            await fs.appendFile(this.interactionLogFile, logLine);
        } catch (error) {
            console.error('❌ 记录交互日志失败:', error.message);
        }
    }

    /**
     * 创建CLI包装函数 - 最小化包装
     */
    createCliWrapper(cliName) {
        return async (args, options = {}) => {
            // 检测调用
            const detection = await this.detectCliInvocation(cliName, args, options.cwd);
            
            // 生成增强参数
            const enhancedArgs = detection 
                ? await this.generateContextEnhancedArgs(cliName, args, detection.environmentContext)
                : args;

            // 执行原始命令
            const command = this.cliCommands[cliName][0]; // 使用第一个命令
            const result = spawnSync(command, enhancedArgs, {
                stdio: 'inherit',
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env }
            });

            // 记录结果
            if (detection) {
                await this.logInteraction({
                    type: 'cli_completion',
                    cliName,
                    args: args.join(' '),
                    enhancedArgs: enhancedArgs.join(' '),
                    exitCode: result.status,
                    timestamp: new Date().toISOString()
                });
            }

            return result;
        };
    }

    /**
     * 获取CLI建议
     */
    async getCliSuggestions(cliName) {
        try {
            const environmentContext = await this.stigmergySystem.getCliContext(cliName);
            
            return {
                collaborationSuggestions: environmentContext.suggestions,
                recentCollaborations: environmentContext.recentCollaborations,
                contextHints: environmentContext.environmentContext,
                sharedFiles: environmentContext.sharedFiles
            };
        } catch (error) {
            console.error('❌ 获取CLI建议失败:', error.message);
            return { suggestions: [], context: {}, sharedFiles: {} };
        }
    }

    /**
     * 共享文件到环境
     */
    async shareFileToEnvironment(cliName, filePath, metadata = {}) {
        try {
            const contextDir = path.join(process.cwd(), '.stigmergy-project', 'context-cache');
            await fs.mkdir(contextDir, { recursive: true });

            const shareData = {
                cliName,
                filePath,
                fileName: path.basename(filePath),
                content: await fs.readFile(filePath, 'utf8'),
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    size: (await fs.stat(filePath)).size
                }
            };

            const shareFileName = `${cliName}_${path.basename(filePath)}_${Date.now()}.json`;
            const shareFilePath = path.join(contextDir, shareFileName);

            await fs.writeFile(shareFilePath, JSON.stringify(shareData, null, 2));

            console.log(`✅ 文件已共享到环境: ${shareFileName}`);
            return shareFilePath;
        } catch (error) {
            console.error('❌ 共享文件失败:', error.message);
            return null;
        }
    }

    /**
     * 从环境获取共享文件
     */
    async getSharedFilesFromEnvironment(targetCli = null) {
        try {
            const contextDir = path.join(process.cwd(), '.stigmergy-project', 'context-cache');
            const files = await fs.readdir(contextDir);
            
            const sharedFiles = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(contextDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const shareData = JSON.parse(content);
                    
                    if (!targetCli || shareData.cliName === targetCli) {
                        sharedFiles.push(shareData);
                    }
                }
            }

            // 按时间排序
            sharedFiles.sort((a, b) => 
                new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp)
            );

            return sharedFiles;
        } catch (error) {
            console.error('❌ 获取共享文件失败:', error.message);
            return [];
        }
    }
}

export { CLIInteractionDetector };