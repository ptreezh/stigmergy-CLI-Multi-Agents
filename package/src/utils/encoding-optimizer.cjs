#!/usr/bin/env node

/**
 * Character Encoding Optimizer
 * Ensures pure ANSI encoding for international compatibility
 */

const fs = require('fs');

class EncodingOptimizer {
    constructor() {
        this.nonAnsiPattern = /[^\x00-\x7F]/g;
        this.chineseTranslations = {
            '翻译': 'translate',
            '分析': 'analyze',
            '生成': 'generate',
            '创建': 'create',
            '请': 'Please',
            '这个': 'this',
            '代码': 'code',
            '组件': 'component',
            '功能': 'function',
            '用户': 'user',
            '认证': 'authentication',
            '文档': 'documentation',
            '注释': 'comments',
            '性能': 'performance',
            '安全': 'security',
            '错误': 'error',
            '问题': 'issue',
            '语言': 'language'
        };
    }

    /**
     * Check if content contains non-ANSI characters
     */
    hasNonAnsiCharacters(content) {
        return this.nonAnsiPattern.test(content);
    }

    /**
     * Convert non-ANSI characters to ANSI equivalents
     */
    convertToAnsi(content) {
        let converted = content;

        // Replace Chinese characters with English equivalents
        for (const [chinese, english] of Object.entries(this.chineseTranslations)) {
            const regex = new RegExp(chinese, 'g');
            converted = converted.replace(regex, english);
        }

        // Remove any remaining non-ANSI characters
        converted = converted.replace(this.nonAnsiPattern, '');

        return converted;
    }

    /**
     * Optimize file encoding
     */
    optimizeFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const originalContent = fs.readFileSync(filePath, 'utf8');

        if (!this.hasNonAnsiCharacters(originalContent)) {
            return { optimized: false, changes: 0 };
        }

        const optimizedContent = this.convertToAnsi(originalContent);

        // Count changes
        const originalLines = originalContent.split('\n');
        const optimizedLines = optimizedContent.split('\n');
        let changes = 0;

        for (let i = 0; i < Math.min(originalLines.length, optimizedLines.length); i++) {
            if (originalLines[i] !== optimizedLines[i]) {
                changes++;
            }
        }

        // Write optimized content
        fs.writeFileSync(filePath, optimizedContent, 'utf8');

        return { optimized: true, changes };
    }

    /**
     * Optimize multiple files
     */
    optimizeFiles(filePaths) {
        const results = [];

        for (const filePath of filePaths) {
            try {
                const result = this.optimizeFile(filePath);
                results.push({
                    file: filePath,
                    ...result
                });
            } catch (error) {
                results.push({
                    file: filePath,
                    optimized: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Get encoding report for files
     */
    getEncodingReport(filePaths) {
        const report = {
            total: filePaths.length,
            pureAnsi: 0,
            hasNonAnsi: 0,
            files: []
        };

        for (const filePath of filePaths) {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const hasNonAnsi = this.hasNonAnsiCharacters(content);

                report.files.push({
                    file: filePath,
                    hasNonAnsi,
                    size: content.length
                });

                if (hasNonAnsi) {
                    report.hasNonAnsi++;
                } else {
                    report.pureAnsi++;
                }
            } else {
                report.files.push({
                    file: filePath,
                    hasNonAnsi: null,
                    error: 'File not found'
                });
            }
        }

        return report;
    }

    /**
     * Validate file encoding
     */
    validateFileEncoding(filePath) {
        if (!fs.existsSync(filePath)) {
            return { valid: false, error: 'File not found' };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const hasNonAnsi = this.hasNonAnsiCharacters(content);

        return {
            valid: !hasNonAnsi,
            hasNonAnsi,
            size: content.length
        };
    }
}

module.exports = EncodingOptimizer;