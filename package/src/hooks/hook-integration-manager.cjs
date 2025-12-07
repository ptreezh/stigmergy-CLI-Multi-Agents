#!/usr/bin/env node

/**
 * Hook Integration Manager
 * Manages real integration between hooks and AI CLI tools
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class HookIntegrationManager {
    constructor() {
        this.hooksDir = path.join(process.cwd(), 'hooks');
        this.naturalLanguageParser = null;
        this.setupParser();
    }

    /**
     * Setup natural language parser
     */
    async setupParser() {
        try {
            const NaturalLanguageParser = require('../natural-language/nl-parser.cjs');
            this.naturalLanguageParser = new NaturalLanguageParser();
        } catch (error) {
            console.warn('Natural language parser not available:', error.message);
        }
    }

    /**
     * Process input through hook system
     */
    processHookInput(aiTool, input) {
        if (!this.naturalLanguageParser) {
            return {
                detected: false,
                message: 'Natural language parser not available'
            };
        }

        // Parse input for skill patterns
        const parseResult = this.naturalLanguageParser.parse(input);

        if (!parseResult.skill || parseResult.confidence < 3) {
            return {
                detected: false,
                message: 'No skill pattern detected',
                confidence: parseResult.confidence || 0
            };
        }

        return {
            detected: true,
            skill: parseResult.skill,
            parameters: parseResult.parameters,
            confidence: parseResult.confidence,
            aiTool,
            originalInput: input,
            suggestion: `Use Stigmergy Skills: stigmergy nl "${input}" --tool=${aiTool}`
        };
    }

    /**
     * Execute hook for AI tool
     */
    async executeHook(aiTool, input) {
        const hookPath = this.getHookPath(aiTool);

        if (!fs.existsSync(hookPath)) {
            return {
                success: false,
                message: `Hook not found for ${aiTool}: ${hookPath}`
            };
        }

        try {
            const result = await this.runHookScript(hookPath, input);
            return {
                success: true,
                result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get hook path for AI tool
     */
    getHookPath(aiTool) {
        const hookConfigs = {
            'claude': '.claude/hooks/skill-forced-eval-hook.sh',
            'gemini': '.gemini/hooks/skill-forced-eval-hook.js',
            'qwen': '.qwen/hooks/skill-forced-eval-hook.py',
            'iflow': '.iflow/hooks/skill-forced-eval-hook.js',
            'codebuddy': '.codebuddy/hooks/skill-forced-eval-hook.py'
        };

        return hookConfigs[aiTool] || null;
    }

    /**
     * Run hook script
     */
    async runHookScript(hookPath, input) {
        return new Promise((resolve, reject) => {
            const extension = path.extname(hookPath);
            let command, args;

            switch (extension) {
                case '.sh':
                    command = 'bash';
                    args = [hookPath, input];
                    break;
                case '.js':
                    command = 'node';
                    args = [hookPath, input];
                    break;
                case '.py':
                    command = 'python';
                    args = [hookPath, input];
                    break;
                default:
                    reject(new Error(`Unsupported hook script type: ${extension}`));
                    return;
            }

            const child = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                encoding: 'utf8'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data;
            });

            child.stderr.on('data', (data) => {
                stderr += data;
            });

            child.on('close', (code) => {
                resolve({
                    code,
                    stdout,
                    stderr
                });
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Check if hooks are properly installed
     */
    checkHookInstallation() {
        const aiTools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy'];
        const results = {};

        for (const tool of aiTools) {
            const hookPath = this.getHookPath(tool);
            const exists = fs.existsSync(hookPath);

            results[tool] = {
                hookPath,
                exists,
                status: exists ? 'installed' : 'missing'
            };
        }

        return results;
    }

    /**
     * Get hook status summary
     */
    getHookStatus() {
        const checkResults = this.checkHookInstallation();
        const total = Object.keys(checkResults).length;
        const installed = Object.values(checkResults).filter(r => r.exists).length;

        return {
            total,
            installed,
            missing: total - installed,
            details: checkResults
        };
    }

    /**
     * Create enhanced hook that integrates with natural language
     */
    createEnhancedHook(aiTool) {
        const hookContent = this.generateHookContent(aiTool);
        const hookPath = this.getHookPath(aiTool);

        if (!hookPath) {
            throw new Error(`No hook path configured for ${aiTool}`);
        }

        // Ensure directory exists
        const hookDir = path.dirname(hookPath);
        if (!fs.existsSync(hookDir)) {
            fs.mkdirSync(hookDir, { recursive: true });
        }

        fs.writeFileSync(hookPath, hookContent, 'utf8');

        return hookPath;
    }

    /**
     * Generate hook content for AI tool
     */
    generateHookContent(aiTool) {
        const extension = this.getHookExtension(aiTool);
        const template = this.getHookTemplate(extension);

        return template
            .replace(/\{\{AI_TOOL\}\}/g, aiTool)
            .replace(/\{\{TIMESTAMP\}\}/g, new Date().toISOString());
    }

    /**
     * Get hook file extension for AI tool
     */
    getHookExtension(aiTool) {
        const extensions = {
            'claude': '.sh',
            'gemini': '.js',
            'qwen': '.py',
            'iflow': '.js',
            'codebuddy': '.py'
        };

        return extensions[aiTool] || '.js';
    }

    /**
     * Get hook template for file extension
     */
    getHookTemplate(extension) {
        const templates = {
            '.sh': `#!/bin/bash
# Enhanced Skill Detection Hook for {{AI_TOOL}}
# Generated: {{TIMESTAMP}}

INPUT="$1"

# Use Stigmergy natural language processing
if command -v node &> /dev/null; then
    RESULT=$(node package/src/main.js nl "$INPUT" --tool={{AI_TOOL}} 2>/dev/null)
    if [ $? -eq 0 ] && [[ "$RESULT" == *"Detected skill:"* ]]; then
        echo "🎯 Skill detected! Use: stigmergy nl \\"$INPUT\\" --tool={{AI_TOOL}}"
        echo "📋 $RESULT"
        exit 0
    fi
fi

# Fallback to basic processing
echo "✅ Processing with {{AI_TOOL}}: $INPUT"
exit 0
`,
            '.js': `#!/usr/bin/env node
// Enhanced Skill Detection Hook for {{AI_TOOL}}
// Generated: {{TIMESTAMP}}

const input = process.argv[2] || '';

try {
    // Use Stigmergy natural language processing
    const { spawn } = require('child_process');

    const child = spawn('node', ['package/src/main.js', 'nl', input, '--tool={{AI_TOOL}}'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
    });

    let output = '';
    child.stdout.on('data', (data) => {
        output += data;
    });

    child.on('close', (code) => {
        if (code === 0 && output.includes('Detected skill:')) {
            console.log('🎯 Skill detected! Use: stigmergy nl "' + input + '" --tool={{AI_TOOL}}');
            console.log('📋 ' + output.trim());
        } else {
            console.log('✅ Processing with {{AI_TOOL}}: ' + input);
        }
    });

} catch (error) {
    console.log('✅ Processing with {{AI_TOOL}}: ' + input);
}
`,
            '.py': `#!/usr/bin/env python3
# Enhanced Skill Detection Hook for {{AI_TOOL}}
# Generated: {{TIMESTAMP}}

import sys
import subprocess
import json

input_text = sys.argv[1] if len(sys.argv) > 1 else ''

try:
    # Use Stigmergy natural language processing
    result = subprocess.run([
        'node', 'package/src/main.js', 'nl', input_text, '--tool={{AI_TOOL}}'
    ], capture_output=True, text=True, encoding='utf-8')

    if result.returncode == 0 and 'Detected skill:' in result.stdout:
        print(f'🎯 Skill detected! Use: stigmergy nl "{input_text}" --tool={{AI_TOOL}}')
        print(f'📋 {result.stdout.strip()}')
    else:
        print(f'✅ Processing with {{AI_TOOL}}: {input_text}')

except Exception as e:
    print(f'✅ Processing with {{AI_TOOL}}: {input_text}')
`
        };

        return templates[extension] || templates['.js'];
    }

    /**
     * Test hook integration
     */
    async testHookIntegration(aiTool, testInput) {
        console.log(`Testing hook integration for ${aiTool}...`);

        const hookResult = await this.executeHook(aiTool, testInput);
        const nlResult = this.processHookInput(aiTool, testInput);

        return {
            hookResult,
            nlResult,
            working: hookResult.success && nlResult.detected
        };
    }
}

module.exports = HookIntegrationManager;