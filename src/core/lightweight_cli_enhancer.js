/**
 * Lightweight CLI Enhancer - Incremental to existing CLI
 * Does not modify CLI native behavior, adds collaborative capabilities
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
            // If no special intent is detected, execute the original command directly
            return this.executeOriginalCommand(cliName, args, options);
        }

        // 生成增强参数
        const enhancedArgs = await this.generateEnhancedArgs(detection);

        // 执行增强命令
        return this.executeEnhancedCommand(cliName, enhancedArgs, options, detection);
    }

    /**
     * Execute original command - completely unchanged behavior
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
     * Generate enhanced arguments
     */
    async generateEnhancedArgs(detection) {
        const enhancedArgs = [...detection.userInput.split(' ')];
        
        // Add context clues
        if (this.enhancementConfig.enableContextSharing && detection.environmentContext) {
            const contextHint = this.generateContextHint(detection);
            if (contextHint) {
                enhancedArgs.push(`[Context: ${contextHint}]`);
            }
        }

        // Add collaboration hints
        if (this.enhancementConfig.enableCollaborationHints && detection.suggestions.length > 0) {
            const collaborationHint = this.generateCollaborationHint(detection.suggestions[0]);
            if (collaborationHint) {
                enhancedArgs.push(`[Collaboration Hint: ${collaborationHint}]`);
            }
        }

        return enhancedArgs;
    }

    /**
     * Generate context hint
     */
    generateContextHint(detection) {
        const context = detection.environmentContext;
        
        if (context.frequentCollaboration && Object.keys(context.frequentCollaboration).length > 0) {
            const frequentCli = Object.keys(context.frequentCollaboration)[0];
            return `Recently collaborated frequently with ${frequentCli}`;
        }

        if (context.commonTopics && context.commonTopics.length > 0) {
            return `Recently processing ${context.commonTopics[0]} related tasks`;
        }

        return '';
    }

    /**
     * Generate collaboration hint
     */
    generateCollaborationHint(suggestion) {
        switch (suggestion.type) {
            case 'frequent_collaboration':
                return `Suggest using ${suggestion.cli} to continue`;
            case 'topic_based':
                return `Suggest using specialized tools to handle ${suggestion.topic} tasks`;
            default:
                return suggestion.suggestion;
        }
    }

    /**
     * Execute enhanced command
     */
    async executeEnhancedCommand(cliName, enhancedArgs, options, detection) {
        // First execute the original command
        const result = await this.executeOriginalCommand(cliName, enhancedArgs, options);

        // Background processing of collaboration logic
        if (this.enhancementConfig.enableAutomaticFileSharing) {
            await this.handleAutomaticFileSharing(detection);
        }

        // Record collaboration result
        await this.logCollaborationResult(detection, result);

        return result;
    }

    /**
     * Handle automatic file sharing
     */
    async handleAutomaticFileSharing(detection) {
        if (!detection.collaborationIntent) {
            return;
        }

        try {
            // Detect important files in the current directory
            const importantFiles = await this.detectImportantFiles();
            
            // Automatically share relevant files to the environment
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
            console.error('[ERROR] Automatic file sharing failed:', error.message);
        }
    }

    /**
     * Detect important files
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
                    // Ignore inaccessible files
                }
            }
        }

        // Sort by relevance
        return importantFiles
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 5); // Share up to 5 files
    }

    /**
     * Log collaboration result
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
            console.error('[ERROR] Failed to log collaboration result:', error.message);
        }
    }

    /**
     * Create CLI command wrapper
     */
    createCliWrapper(cliName) {
        return async (...args) => {
            return await this.enhanceCliCommand(cliName, args);
        };
    }

    /**
     * Get current environment status
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