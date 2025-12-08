const CLIHelpAnalyzer = require('./cli_help_analyzer');

class SmartRouter {
    constructor() {
        this.tools = require('../main_english').CLI_TOOLS || {};
        this.analyzer = new CLIHelpAnalyzer();
        this.routeKeywords = ['use', 'help', 'please', 'write', 'generate', 'explain', 'analyze', 'translate', 'code', 'article'];
        this.defaultTool = 'claude';
    }

    /**
     * Initialize the smart router
     */
    async initialize() {
        await this.analyzer.initialize();
    }

    /**
     * Check if input should be routed to a specific CLI tool
     */
    shouldRoute(userInput) {
        return this.routeKeywords.some(keyword =>
            userInput.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * Perform smart routing based on user input and CLI patterns
     */
    async smartRoute(userInput) {
        const input = userInput.trim();
        
        // First try to detect tool-specific keywords
        for (const [toolName, toolInfo] of Object.entries(this.tools)) {
            // Get CLI pattern for this tool
            let cliPattern = await this.analyzer.getCLIPattern(toolName);
            
            // If we don't have a pattern, try to analyze the CLI
            if (!cliPattern) {
                try {
                    cliPattern = await this.analyzer.analyzeCLI(toolName);
                } catch (error) {
                    console.warn(`Failed to analyze ${toolName}:`, error.message);
                    // Continue with next tool
                    continue;
                }
            }
            
            // Check if input contains any of the tool's keywords or subcommands
            const keywords = this.extractKeywords(toolName, cliPattern);
            for (const keyword of keywords) {
                if (input.toLowerCase().includes(keyword.toLowerCase())) {
                    // Extract clean parameters
                    const cleanInput = input
                        .replace(new RegExp(`.*${keyword}\\s*`, 'gi'), '')
                        .replace(/^(use|please|help|using|with)\s*/i, '')
                        .trim();
                    return { tool: toolName, prompt: cleanInput };
                }
            }
        }
        
        // Default routing
        const cleanInput = input.replace(/^(use|please|help|using|with)\s*/i, '').trim();
        return { tool: this.defaultTool, prompt: cleanInput };
    }

    /**
     * Extract keywords for a tool from its CLI patterns
     */
    extractKeywords(toolName, cliPattern) {
        const keywords = [toolName];
        
        // Add tool-specific keywords
        const toolSpecificKeywords = {
            claude: ['claude', 'anthropic'],
            gemini: ['gemini', 'google'],
            qwen: ['qwen', 'alibaba', 'tongyi'],
            iflow: ['iflow', 'workflow', 'intelligent'],
            qodercli: ['qoder', 'code'],
            codebuddy: ['codebuddy', 'buddy'],
            copilot: ['copilot', 'github'],
            codex: ['codex', 'openai']
        };
        
        if (toolSpecificKeywords[toolName]) {
            keywords.push(...toolSpecificKeywords[toolName]);
        }
        
        // Add subcommands from CLI pattern if available
        if (cliPattern && cliPattern.patterns && cliPattern.patterns.subcommands) {
            cliPattern.patterns.subcommands.forEach(subcommand => {
                if (subcommand.name) {
                    keywords.push(subcommand.name);
                }
            });
        }
        
        // Add commands from CLI pattern if available
        if (cliPattern && cliPattern.patterns && cliPattern.patterns.commands) {
            cliPattern.patterns.commands.forEach(command => {
                if (command.name && command.name !== toolName) {
                    keywords.push(command.name);
                }
            });
        }
        
        return [...new Set(keywords)]; // Remove duplicates
    }

    /**
     * Route input to appropriate CLI tool
     */
    async routeToCLI(userInput) {
        const route = await this.smartRoute(userInput);
        return route.tool;
    }
}

module.exports = SmartRouter;