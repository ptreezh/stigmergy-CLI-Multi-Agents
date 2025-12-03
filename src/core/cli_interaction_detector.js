/**
 * CLI Interaction Detector - Lightweight interception, enhancing existing adapters
 * Incremental design, does not affect existing systems
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
            
            console.log('[SUCCESS] CLI interaction detector initialized');
            return true;
        } catch (error) {
            console.error('[ERROR] CLI interaction detector initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Detect CLI invocation - lightweight monitoring
     */
    async detectCliInvocation(command, args, workingDir = process.cwd()) {
        const cliName = this.detectCliFromCommand(command);
        
        if (!cliName) {
            return null;
        }

        const userInput = args.join(' ');
        
        // Detect collaboration intent
        const collaborationIntent = await this.stigmergySystem.writeEnvironmentSignal(
            cliName, 
            userInput, 
            { workingDir, command }
        );

        // Record interaction
        await this.logInteraction({
            type: 'cli_invocation',
            cliName,
            command,
            args: userInput,
            workingDir,
            collaborationIntent,
            timestamp: new Date().toISOString()
        });

        // Read environment signals
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
     * Detect CLI name from command
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
     * Generate context-enhanced arguments
     */
    async generateContextEnhancedArgs(cliName, originalArgs, context) {
        const enhancedArgs = [...originalArgs];
        
        // If collaboration intent is detected, add context
        if (context.collaborationIntent && context.collaborationSuggestions.length > 0) {
            // Generate context hint
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

        // Select the most relevant suggestion
        const topSuggestion = suggestions[0];
        
        switch (topSuggestion.type) {
            case 'frequent_collaboration':
                return `Recently collaborated frequently with ${topSuggestion.cli}, consider continuing collaboration`;
            case 'topic_based':
                return `Recently processing "${topSuggestion.topic}" tasks, can combine with related tools`;
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
            console.error('[ERROR] Failed to log interaction:', error.message);
        }
    }

    /**
     * Create CLI wrapper function - minimal wrapping
     */
    createCliWrapper(cliName) {
        return async (args, options = {}) => {
            // Detect invocation
            const detection = await this.detectCliInvocation(cliName, args, options.cwd);
            
            // Generate enhanced arguments
            const enhancedArgs = detection 
                ? await this.generateContextEnhancedArgs(cliName, args, detection.environmentContext)
                : args;

            // Execute original command
            const command = this.cliCommands[cliName][0]; // 使用第一个命令
            const result = spawnSync(command, enhancedArgs, {
                stdio: 'inherit',
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env }
            });

            // Record result
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
     * Get CLI suggestions
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
            console.error('[ERROR] Failed to get CLI suggestions:', error.message);
            return { suggestions: [], context: {}, sharedFiles: {} };
        }
    }

    /**
     * Share file to environment
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

            console.log(`[SUCCESS] File shared to environment: ${shareFileName}`);
            return shareFilePath;
        } catch (error) {
            console.error('[ERROR] Failed to share file:', error.message);
            return null;
        }
    }

    /**
     * Get shared files from environment
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

            // Sort by time
            sharedFiles.sort((a, b) => 
                new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp)
            );

            return sharedFiles;
        } catch (error) {
            console.error('[ERROR] Failed to get shared files:', error.message);
            return [];
        }
    }
}

export { CLIInteractionDetector };