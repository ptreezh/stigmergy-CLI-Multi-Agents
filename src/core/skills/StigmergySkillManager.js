/**
 * StigmergySkillManager - Unified Skill Manager
 * 
 * Integrates OpenSkills core functionality + Stigmergy cross-CLI routing
 * 
 * License: Apache 2.0
 */

import { SkillReader } from './embedded-openskills/SkillReader.js';
import { SkillInstaller } from './embedded-openskills/SkillInstaller.js';
import { SkillParser } from './embedded-openskills/SkillParser.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class StigmergySkillManager {
    constructor(options = {}) {
        this.skillsDir = options.skillsDir || path.join(os.homedir(), '.stigmergy/skills');
        
        // Create custom search paths (prioritize skillsDir)
        const customSearchPaths = [
            this.skillsDir,                                      // Stigmergy skills dir (highest priority)
            path.join(process.cwd(), '.agent/skills'),          // Project universal
            path.join(os.homedir(), '.agent/skills'),           // Global universal
            path.join(process.cwd(), '.claude/skills'),         // Project Claude
            path.join(os.homedir(), '.claude/skills'),          // Global Claude
        ];
        
        this.reader = new SkillReader(customSearchPaths);
        this.installer = new SkillInstaller(this.skillsDir);
        this.parser = new SkillParser();
    }

    /**
     * Install skills from GitHub repository
     * @param {string} source - GitHub URL or owner/repo
     * @param {Object} options - Installation options
     * @returns {Promise<Array>} List of installed skills
     */
    async install(source, options = {}) {
        console.log(`[INFO] Installing skills from ${source}...`);
        
        try {
            const skills = await this.installer.installFromGitHub(source, options);
            
            console.log(`\n[OK] Successfully installed ${skills.length} skill(s)`);
            
            // Auto-sync to AGENTS.md (if enabled)
            if (options.autoSync !== false) {
                await this.sync();
            }
            
            return skills;
        } catch (err) {
            console.error(`[X] Installation failed: ${err.message}`);
            throw err;
        }
    }

    /**
     * Read skill content (output format compatible with OpenSkills)
     * @param {string} name - Skill name
     * @returns {Promise<Object>} Skill content
     */
    async read(name) {
        try {
            const skill = await this.reader.readSkill(name);
            
            // Output format compatible with OpenSkills
            console.log(`Reading: ${skill.name}`);
            console.log(`Base directory: ${skill.baseDir}`);
            console.log('');
            console.log(skill.content);
            console.log('');
            console.log(`Skill read: ${skill.name}`);
            
            return skill;
        } catch (err) {
            console.error(`[X] Error reading skill '${name}': ${err.message}`);
            console.error('\nSearched paths:');
            this.reader.searchPaths.forEach(p => console.error(`  - ${p}`));
            console.error('\nInstall skills: stigmergy skill install <source>');
            throw err;
        }
    }

    /**
     * List all installed skills
     * @returns {Promise<Array>} List of skills
     */
    async list() {
        try {
            const skills = await this.reader.listSkills();
            
            if (skills.length === 0) {
                console.log('No skills installed');
                console.log('\nInstall skills: stigmergy skill install <source>');
                console.log('Example: stigmergy skill install anthropics/skills');
                return [];
            }
            
            console.log(`\nInstalled skills (${skills.length}):\n`);
            
            // Group by location for display
            const grouped = this.groupByLocation(skills);
            
            for (const [location, locationSkills] of Object.entries(grouped)) {
                console.log(`${this.getLocationIcon(location)} ${location}:`);
                locationSkills.forEach(skill => {
                    console.log(`  • ${skill.name.padEnd(30)} ${skill.description}`);
                });
                console.log('');
            }
            
            return skills;
        } catch (err) {
            console.error(`[X] Error listing skills: ${err.message}`);
            throw err;
        }
    }

    /**
     * Sync skills to CLI configuration files
     * Also refreshes the LocalSkillScanner cache
     * @returns {Promise<void>}
     */
    async sync() {
        console.log('[INFO] Syncing skills to CLI configuration files...');

        try {
            // Refresh the LocalSkillScanner cache
            try {
                // Import LocalSkillScanner (it's a CommonJS module)
                const { createRequire } = await import('module');
                const require = createRequire(import.meta.url);
                const LocalSkillScanner = require('./local_skill_scanner.js');

                const scanner = new LocalSkillScanner();
                await scanner.initialize(true); // Force refresh
                console.log('[INFO] Refreshed skills/agents cache');
            } catch (err) {
                // LocalSkillScanner might not be available, ignore
                if (process.env.DEBUG === 'true') {
                    console.log('[DEBUG] LocalSkillScanner not available:', err.message);
                }
            }

            const skills = await this.reader.listSkills();

            if (skills.length === 0) {
                console.log('[INFO] No skills to sync');
                return;
            }

            // Generate <available_skills> XML
            const skillsXml = this.generateSkillsXml(skills);

            // All CLI configuration files to update
            const cliFiles = [
                'AGENTS.md',      // Universal config
                'claude.md',      // Claude CLI
                'qwen.md',        // Qwen CLI
                'gemini.md',      // Gemini CLI
                'iflow.md',       // iFlow CLI
                'qodercli.md',    // Qoder CLI
                'codebuddy.md',   // CodeBuddy CLI
                'copilot.md',     // Copilot CLI
                'codex.md'        // Codex CLI
            ];

            let syncedCount = 0;
            let createdCount = 0;
            let skippedCount = 0;

            // Iterate through all CLI configuration files
            for (const fileName of cliFiles) {
                const filePath = path.join(process.cwd(), fileName);

                try {
                    const result = await this.syncToFile(filePath, fileName, skillsXml);
                    if (result === 'synced') {
                        syncedCount++;
                    } else if (result === 'created') {
                        createdCount++;
                    }
                } catch (err) {
                    console.log(`[INFO] Skipped ${fileName}: ${err.message}`);
                    skippedCount++;
                }
            }

            // Output sync result summary
            console.log(`\n[OK] Sync completed:`);
            console.log(`   - Updated: ${syncedCount} file(s)`);
            if (createdCount > 0) {
                console.log(`   - Created: ${createdCount} file(s)`);
            }
            if (skippedCount > 0) {
                console.log(`   - Skipped: ${skippedCount} file(s)`);
            }
            console.log(`   - Skills: ${skills.length}`);
        } catch (err) {
            console.error(`[X] Sync failed: ${err.message}`);
            throw err;
        }
    }
    
    /**
     * Sync skills to a single file
     * @private
     * @param {string} filePath - Full file path
     * @param {string} fileName - File name (for logging)
     * @param {string} skillsXml - Skills XML content
     * @returns {Promise<string>} 'synced' | 'created'
     */
    async syncToFile(filePath, fileName, skillsXml) {
        try {
            let content = await fs.readFile(filePath, 'utf-8');
            
            // Replace or insert skills section
            if (content.includes('<!-- SKILLS_START -->')) {
                content = content.replace(
                    /<!-- SKILLS_START -->.*?<!-- SKILLS_END -->/s,
                    `<!-- SKILLS_START -->\n${skillsXml}\n<!-- SKILLS_END -->`
                );
            } else {
                // Add to end of file
                content += `\n\n<!-- SKILLS_START -->\n${skillsXml}\n<!-- SKILLS_END -->\n`;
            }
            
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`   [OK] ${fileName}`);
            return 'synced';
        } catch (err) {
            if (err.code === 'ENOENT') {
                // File does not exist, create new file
                const cliName = fileName.replace('.md', '');
                const content = `# ${cliName.toUpperCase()} Configuration\n\n<!-- SKILLS_START -->\n${skillsXml}\n<!-- SKILLS_END -->\n`;
                await fs.writeFile(filePath, content, 'utf-8');
                console.log(`   [OK] ${fileName} (created)`);
                return 'created';
            } else {
                throw err;
            }
        }
    }

    /**
     * Generate <available_skills> XML
     * @private
     */
    generateSkillsXml(skills) {
        let xml = '<skills_system priority="1">\n\n';
        xml += '## Stigmergy Skills\n\n';
        xml += '<usage>\n';
        xml += 'Load skills using Stigmergy skill manager:\n\n';
        xml += 'Direct call (current CLI):\n';
        xml += '  Bash("stigmergy skill read <skill-name>")\n\n';
        xml += 'Cross-CLI call (specify CLI):\n';
        xml += '  Bash("stigmergy use <cli-name> skill <skill-name>")\n\n';
        xml += 'Smart routing (auto-select best CLI):\n';
        xml += '  Bash("stigmergy call skill <skill-name>")\n\n';
        xml += 'The skill content will load with detailed instructions.\n';
        xml += 'Base directory will be provided for resolving bundled resources.\n';
        xml += '</usage>\n\n';
        xml += '<available_skills>\n\n';
        
        for (const skill of skills) {
            xml += '<skill>\n';
            xml += `<name>${skill.name}</name>\n`;
            xml += `<description>${this.escapeXml(skill.description)}</description>\n`;
            xml += `<location>${skill.location}</location>\n`;
            xml += '</skill>\n\n';
        }
        
        xml += '</available_skills>\n\n';
        xml += '</skills_system>';
        
        return xml;
    }

    /**
     * Remove skill
     * @param {string} name - Skill name
     * @returns {Promise<void>}
     */
    async remove(name) {
        try {
            await this.installer.uninstallSkill(name);
            console.log(`[OK] Removed skill: ${name}`);
            
            // Auto-sync
            await this.sync();
        } catch (err) {
            console.error(`[X] Failed to remove skill: ${err.message}`);
            throw err;
        }
    }

    /**
     * Validate skill
     * @param {string} pathOrName - Skill path or name
     * @returns {Promise<Object>} Validation result
     */
    async validate(pathOrName) {
        try {
            let content;
            
            // Determine if path or name
            if (pathOrName.includes('/') || pathOrName.includes('\\')) {
                // Is a path
                content = await fs.readFile(pathOrName, 'utf-8');
            } else {
                // Is a name
                const skill = await this.reader.readSkill(pathOrName);
                content = skill.content;
            }
            
            const validation = this.parser.validateSkill(content);
            
            if (validation.valid) {
                console.log('[OK] Skill validation passed');
            } else {
                console.log('[X] Skill validation failed:');
                validation.errors.forEach(err => console.log(`   - ${err}`));
            }
            
            return validation;
        } catch (err) {
            console.error(`[X] Validation error: ${err.message}`);
            throw err;
        }
    }

    /**
     * Group by location
     * @private
     */
    groupByLocation(skills) {
        return skills.reduce((groups, skill) => {
            const loc = skill.location || 'unknown';
            if (!groups[loc]) groups[loc] = [];
            groups[loc].push(skill);
            return groups;
        }, {});
    }

    /**
     * Get location icon
     * @private
     */
    getLocationIcon(location) {
        const icons = {
            'stigmergy': '[GLOBAL]',
            'project': '[PROJECT]',
            'global': '[HOME]',
            'claude': '[CLAUDE]',
            'universal': '[UNIVERSAL]'
        };
        return icons[location] || '[INFO]';
    }

    /**
     * XML escape
     * @private
     */
    escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
