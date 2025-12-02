/**
 * 环境线索式协同系统 - 增量设计
 * 不影响现有系统功能，增强环境共享机制
 */

import fs from 'fs/promises';
import path from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

class EnvironmentStigmergySystem {
    constructor() {
        // 现有系统路径保持不变
        this.projectRoot = process.cwd();
        this.stigmergyDir = path.join(this.projectRoot, '.stigmergy-project');
        this.contextDir = path.join(this.stigmergyDir, 'context-cache');
        this.collaborationLog = path.join(this.stigmergyDir, 'collaboration.log');
        this.environmentCache = path.join(this.stigmergyDir, 'environment-cache.json');
        
        // CLI工具配置映射
        this.cliConfig = {
            'claude': {
                configFile: '~/.config/claude/config.json',
                historyFile: '~/.config/claude/history.json',
                contextPatterns: ['claude', 'anthropic']
            },
            'gemini': {
                configFile: '~/.config/gemini/config.json',
                historyFile: '~/.config/gemini/history.json', 
                contextPatterns: ['gemini', 'google', 'bard']
            },
            'qwen': {
                configFile: '~/.config/qwen/config.json',
                historyFile: '~/.config/qwen/history.json',
                contextPatterns: ['qwen', 'qwencode', 'alibaba']
            },
            'iflow': {
                configFile: '~/.config/iflow/config.json',
                historyFile: '~/.config/iflow/history.json',
                contextPatterns: ['iflow', 'flow', 'mindflow']
            },
            'qoder': {
                configFile: '~/.config/qoder/config.json',
                historyFile: '~/.config/qoder/history.json',
                contextPatterns: ['qoder', 'code-assistant']
            },
            'codebuddy': {
                configFile: '~/.config/codebuddy/config.json',
                historyFile: '~/.config/codebuddy/history.json',
                contextPatterns: ['codebuddy', 'tencent', 'buddy']
            },
            'copilot': {
                configFile: '~/.config/copilot/config.json',
                historyFile: '~/.config/copilot/history.json',
                contextPatterns: ['copilot', 'github', 'gh']
            },
            'codex': {
                configFile: '~/.config/codex/config.json',
                historyFile: '~/.config/codex/history.json',
                contextPatterns: ['codex', 'openai', 'gpt']
            }
        };
    }

    /**
     * 初始化环境线索系统 - 增量创建
     */
    async initializeEnvironmentSystem() {
        try {
            // 创建必要的目录（不影响现有结构）
            await fs.mkdir(this.contextDir, { recursive: true });
            
            // 初始化环境缓存文件
            await this.initializeEnvironmentCache();
            
            console.log('✅ 环境线索协同系统初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 环境线索系统初始化失败:', error.message);
            return false;
        }
    }

    /**
     * 初始化环境缓存
     */
    async initializeEnvironmentCache() {
        const cacheExists = await fs.access(this.environmentCache)
            .then(() => true)
            .catch(() => false);

        if (!cacheExists) {
            const initialCache = {
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
                sharedContext: {},
                collaborationHistory: [],
                environmentSignals: {}
            };

            await fs.writeFile(this.environmentCache, JSON.stringify(initialCache, null, 2));
        }
    }

    /**
     * 写入环境线索 - CLI调用时自动调用
     */
    async writeEnvironmentSignal(cliName, userInput, context = {}) {
        try {
            const signal = {
                timestamp: new Date().toISOString(),
                cliName,
                userInput,
                context,
                intent: this.detectCollaborationIntent(userInput),
                sessionId: this.generateSessionId()
            };

            // 更新环境缓存
            await this.updateEnvironmentCache('signal', signal);
            
            // 记录协作日志
            await this.logCollaboration(signal);
            
            return signal;
        } catch (error) {
            console.error('❌ 写入环境线索失败:', error.message);
            return null;
        }
    }

    /**
     * 读取环境线索 - CLI启动时自动调用
     */
    async readEnvironmentSignals(cliName) {
        try {
            const cache = await this.loadEnvironmentCache();
            const signals = cache.environmentSignals || {};
            
            // 获取最近的协作信号
            const recentSignals = this.getRecentCollaborationSignals(signals, cliName);
            
            // 分析环境上下文
            const context = this.analyzeEnvironmentContext(signals, cliName);
            
            return {
                signals: recentSignals,
                context,
                collaborationSuggestions: this.generateCollaborationSuggestions(signals, cliName)
            };
        } catch (error) {
            console.error('❌ 读取环境线索失败:', error.message);
            return { signals: [], context: {}, suggestions: [] };
        }
    }

    /**
     * 检测协作意图
     */
    detectCollaborationIntent(userInput) {
        const patterns = [
            /(?:call|invoke|use|run|execute|ask|tell|request)\s+(?:the\s+)?([a-z]+)\s+(?:cli|tool|assistant|ai)/i,
            /(?:with|using|via|through)\s+([a-z]+)/i,
            /(?:let|have|can|should)\s+([a-z]+)\s+(?:help|assist|process|handle|deal)/i,
            /(?:switch|change|switch to)\s+([a-z]+)/i,
            /(?:in|using)\s+([a-z]+)\s+(?:mode|context)/i
        ];

        for (const pattern of patterns) {
            const match = userInput.match(pattern);
            if (match) {
                const targetCli = match[1].toLowerCase();
                // 映射到标准CLI名称
                return this.mapToStandardCliName(targetCli);
            }
        }

        return null;
    }

    /**
     * 映射到标准CLI名称
     */
    mapToStandardCliName(cliName) {
        const mapping = {
            'anthropic': 'claude',
            'google': 'gemini',
            'bard': 'gemini',
            'qwencode': 'qwen',
            'alibaba': 'qwen',
            'flow': 'iflow',
            'mindflow': 'iflow',
            'tencent': 'codebuddy',
            'buddy': 'codebuddy',
            'github': 'copilot',
            'gh': 'copilot',
            'openai': 'codex',
            'gpt': 'codex'
        };

        return mapping[cliName] || cliName;
    }

    /**
     * 获取最近的协作信号
     */
    getRecentCollaborationSignals(signals, currentCli) {
        const allSignals = Object.values(signals).flat();
        const collaborationSignals = allSignals.filter(signal => 
            signal.intent && signal.intent !== currentCli
        );

        // 按时间排序，返回最近的5个
        return collaborationSignals
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
    }

    /**
     * 分析环境上下文
     */
    analyzeEnvironmentContext(signals, currentCli) {
        const allSignals = Object.values(signals).flat();
        const recentSignals = allSignals
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        // 分析模式
        const patterns = {
            frequentCollaboration: {},
            commonTopics: [],
            projectContext: {},
            workflowHints: []
        };

        // 分析协作频率
        recentSignals.forEach(signal => {
            const target = signal.intent;
            if (target && target !== currentCli) {
                patterns.frequentCollaboration[target] = 
                    (patterns.frequentCollaboration[target] || 0) + 1;
            }
        });

        // 分析常见主题
        const topics = recentSignals
            .map(signal => this.extractTopics(signal.userInput))
            .flat();
        patterns.commonTopics = this.getMostFrequent(topics, 3);

        return patterns;
    }

    /**
     * 生成协作建议
     */
    generateCollaborationSuggestions(signals, currentCli) {
        const context = this.analyzeEnvironmentContext(signals, currentCli);
        const suggestions = [];

        // 基于协作频率的建议
        Object.entries(context.frequentCollaboration).forEach(([cli, count]) => {
            if (count >= 2) {
                suggestions.push({
                    type: 'frequent_collaboration',
                    cli,
                    reason: `最近频繁与${cli}协作 (${count}次)`,
                    suggestion: `考虑使用${cli}继续当前任务`
                });
            }
        });

        // 基于主题的建议
        context.commonTopics.forEach(topic => {
            suggestions.push({
                type: 'topic_based',
                topic,
                reason: `最近在处理"${topic}"相关任务`,
                suggestion: `考虑使用专门的工具处理${topic}任务`
            });
        });

        return suggestions;
    }

    /**
     * 更新环境缓存
     */
    async updateEnvironmentCache(type, data) {
        try {
            const cache = await this.loadEnvironmentCache();
            const timestamp = new Date().toISOString();

            if (type === 'signal') {
                if (!cache.environmentSignals) {
                    cache.environmentSignals = {};
                }
                
                const cliKey = data.cliName;
                if (!cache.environmentSignals[cliKey]) {
                    cache.environmentSignals[cliKey] = [];
                }
                
                cache.environmentSignals[cliKey].push(data);
                
                // 保持每个CLI最多100个信号
                if (cache.environmentSignals[cliKey].length > 100) {
                    cache.environmentSignals[cliKey] = cache.environmentSignals[cliKey].slice(-100);
                }
            }

            cache.lastUpdate = timestamp;
            await fs.writeFile(this.environmentCache, JSON.stringify(cache, null, 2));
        } catch (error) {
            console.error('❌ 更新环境缓存失败:', error.message);
        }
    }

    /**
     * 加载环境缓存
     */
    async loadEnvironmentCache() {
        try {
            const data = await fs.readFile(this.environmentCache, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ 加载环境缓存失败:', error.message);
            return {};
        }
    }

    /**
     * 记录协作日志
     */
    async logCollaboration(signal) {
        const logEntry = {
            timestamp: signal.timestamp,
            type: 'collaboration_signal',
            cli: signal.cliName,
            intent: signal.intent,
            userInput: signal.userInput,
            sessionId: signal.sessionId
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(this.collaborationLog, logLine);
    }

    /**
     * 生成会话ID
     */
    generateSessionId() {
        return createHash('md5')
            .update(`${Date.now()}-${Math.random()}`)
            .digest('hex')
            .substring(0, 16);
    }

    /**
     * 提取主题
     */
    extractTopics(userInput) {
        const topics = [];
        const topicPatterns = {
            '代码生成': ['generate', 'create', 'write', 'build', 'implement', 'code'],
            '代码分析': ['analyze', 'review', 'check', 'examine', 'audit'],
            '调试': ['debug', 'fix', 'error', 'issue', 'problem'],
            '文档': ['document', 'explain', 'comment', 'readme'],
            '测试': ['test', 'spec', 'validate', 'verify'],
            '部署': ['deploy', 'build', 'release', 'publish'],
            'API': ['api', 'endpoint', 'route', 'service'],
            '数据库': ['database', 'db', 'sql', 'query', 'schema'],
            '前端': ['frontend', 'ui', 'component', 'react', 'vue'],
            '后端': ['backend', 'server', 'service', 'microservice']
        };

        const input = userInput.toLowerCase();
        Object.entries(topicPatterns).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => input.includes(keyword))) {
                topics.push(topic);
            }
        });

        return topics;
    }

    /**
     * 获取最频繁的元素
     */
    getMostFrequent(arr, count) {
        const frequency = {};
        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, count)
            .map(([item]) => item);
    }

    /**
     * 为CLI提供环境上下文
     */
    async getCliContext(cliName) {
        const signals = await this.readEnvironmentSignals(cliName);
        return {
            currentSession: this.generateSessionId(),
            recentCollaborations: signals.signals,
            environmentContext: signals.context,
            suggestions: signals.collaborationSuggestions,
            sharedFiles: await this.getSharedFiles(),
            projectSpec: await this.getProjectSpec()
        };
    }

    /**
     * 获取共享文件
     */
    async getSharedFiles() {
        try {
            const files = await fs.readdir(this.contextDir);
            const sharedFiles = {};

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.contextDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    sharedFiles[file] = JSON.parse(content);
                }
            }

            return sharedFiles;
        } catch (error) {
            return {};
        }
    }

    /**
     * 获取项目规格
     */
    async getProjectSpec() {
        try {
            const specFile = path.join(this.projectRoot, '.stigmergy-project', 'stigmergy-config.json');
            const content = await fs.readFile(specFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return {};
        }
    }
}

export { EnvironmentStigmergySystem };