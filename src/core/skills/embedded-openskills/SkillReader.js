/**
 * SkillReader - Read and locate skills
 * 
 * Adapted from: https://github.com/numman-ali/openskills
 * Original License: Apache 2.0
 * Modifications: Copyright Stigmergy Project
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SkillParser } from './SkillParser.js';

export class SkillReader {
    /**
     * @param {string[]} customSearchPaths - Optional custom search paths
     */
    constructor(customSearchPaths = null) {
        this.parser = new SkillParser();
        
        if (customSearchPaths) {
            this.searchPaths = customSearchPaths;
        } else {
            // Default search paths (priority order)
            this.searchPaths = [
                path.join(process.cwd(), '.agent/skills'),       // Project universal
                path.join(os.homedir(), '.agent/skills'),        // Global universal
                path.join(process.cwd(), '.claude/skills'),      // Project Claude
                path.join(os.homedir(), '.claude/skills'),       // Global Claude
                path.join(os.homedir(), '.stigmergy/skills')     // Stigmergy unified
            ];
        }
    }

    /**
     * Find skill in search paths
     * @param {string} name - Skill name
     * @returns {Promise<Object|null>} Skill info or null if not found
     */
    async findSkill(name) {
        for (const basePath of this.searchPaths) {
            const skillPath = path.join(basePath, name, 'SKILL.md');
            
            try {
                await fs.access(skillPath);
                return {
                    name: name,
                    path: skillPath,
                    baseDir: path.dirname(skillPath)
                };
            } catch {
                // Continue to next path
                continue;
            }
        }
        
        return null;
    }

    /**
     * Read skill content
     * @param {string} name - Skill name
     * @returns {Promise<Object>} Skill data with name, baseDir, and content
     */
    async readSkill(name) {
        const skill = await this.findSkill(name);
        
        if (!skill) {
            throw new Error(`Skill '${name}' not found in any search path`);
        }

        const content = await fs.readFile(skill.path, 'utf-8');
        
        return {
            name: skill.name,
            baseDir: skill.baseDir,
            content: content
        };
    }

    /**
     * List all available skills
     * @returns {Promise<Array>} Array of skill info objects
     */
    async listSkills() {
        const skills = [];
        const seenNames = new Set();
        
        for (const searchPath of this.searchPaths) {
            try {
                const entries = await fs.readdir(searchPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    if (!entry.isDirectory()) continue;
                    if (seenNames.has(entry.name)) continue; // Skip duplicates
                    
                    const skillPath = path.join(searchPath, entry.name, 'SKILL.md');
                    
                    try {
                        await fs.access(skillPath);
                        const content = await fs.readFile(skillPath, 'utf-8');
                        const metadata = this.parser.parseMetadata(content);
                        
                        skills.push({
                            name: entry.name,
                            description: metadata.description || '',
                            location: this.determineLocation(searchPath),
                            path: skillPath
                        });
                        
                        seenNames.add(entry.name);
                    } catch {
                        // Not a valid skill directory, skip
                        continue;
                    }
                }
            } catch {
                // Search path doesn't exist, skip
                continue;
            }
        }
        
        return skills;
    }

    /**
     * Determine skill location type from path
     * @private
     */
    determineLocation(searchPath) {
        if (searchPath.includes('.stigmergy')) {
            return 'stigmergy';
        } else if (searchPath.includes('.agent')) {
            return 'universal';
        } else if (searchPath.includes('.claude')) {
            return 'claude';
        } else if (searchPath.includes(process.cwd())) {
            return 'project';
        } else {
            return 'global';
        }
    }
}
