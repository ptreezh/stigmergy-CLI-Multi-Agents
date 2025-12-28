/**
 * SkillInstaller - Install skills from GitHub
 * 
 * Adapted from: https://github.com/numman-ali/openskills
 * Original License: Apache 2.0
 * Modifications: Copyright Stigmergy Project
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SkillParser } from './SkillParser.js';

export class SkillInstaller {
    /**
     * @param {string} targetDir - Directory to install skills (default: ~/.stigmergy/skills)
     */
    constructor(targetDir = null) {
        this.targetDir = targetDir || path.join(os.homedir(), '.stigmergy/skills');
        this.parser = new SkillParser();
    }

    /**
     * Parse GitHub URL into owner and repo with intelligent format detection
     * @param {string} url - GitHub URL or shorthand (owner/repo)
     * @returns {Object} {owner, repo, filePath, branch, isRawFile}
     */
    parseGitHubUrl(url) {
        const attempts = [];
        let result = null;

        // 1. 简写格式: owner/repo
        attempts.push('简写格式 (owner/repo)');
        let match = url.match(/^([^\/]+)\/([^\/]+)$/);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, ''),
                filePath: null,
                branch: 'main',
                isRawFile: false,
                format: 'shorthand'
            };
        }

        // 2. 完整GitHub仓库URL: https://github.com/owner/repo
        attempts.push('完整GitHub仓库URL (https://github.com/owner/repo)');
        match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/i);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                filePath: null,
                branch: 'main',
                isRawFile: false,
                format: 'repository'
            };
        }

        // 3. GitHub blob URL: https://github.com/owner/repo/blob/branch/path/to/file
        attempts.push('GitHub blob URL (https://github.com/owner/repo/blob/branch/path)');
        match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/i);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                filePath: match[4],
                branch: match[3],
                isRawFile: false,
                format: 'blob'
            };
        }

        // 4. GitHub raw URL: https://raw.githubusercontent.com/owner/repo/branch/path/to/file
        attempts.push('GitHub raw URL (https://raw.githubusercontent.com/owner/repo/branch/path)');
        match = url.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/i);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                filePath: match[4],
                branch: match[3],
                isRawFile: true,
                format: 'raw'
            };
        }

        // 5. 带路径的简写: owner/repo/path/to/file
        attempts.push('带路径的简写 (owner/repo/path/to/file)');
        match = url.match(/^([^\/]+)\/([^\/]+)\/(.+)$/);
        if (match) {
            // 检查是否可能是owner/repo格式（没有路径）
            const pathParts = match[3].split('/');
            if (pathParts.length >= 1) {
                return {
                    owner: match[1],
                    repo: match[2],
                    filePath: match[3],
                    branch: 'main',
                    isRawFile: false,
                    format: 'shorthand-with-path'
                };
            }
        }

        // 6. 带分支和路径的简写: owner/repo@branch/path/to/file
        attempts.push('带分支和路径的简写 (owner/repo@branch/path/to/file)');
        match = url.match(/^([^\/]+)\/([^\/]+)@([^\/]+)\/(.+)$/);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                filePath: match[4],
                branch: match[3],
                isRawFile: false,
                format: 'shorthand-with-branch'
            };
        }

        // 7. 仅owner（可能用户只想查看用户的所有仓库）
        attempts.push('仅owner格式 (owner)');
        match = url.match(/^([^\/]+)$/);
        if (match) {
            return {
                owner: match[1],
                repo: null, // 需要用户选择仓库
                filePath: null,
                branch: 'main',
                isRawFile: false,
                format: 'owner-only'
            };
        }

        // 所有尝试都失败，提供详细的错误信息
        const attemptedFormats = attempts.map((format, index) => `  ${index + 1}. ${format}`).join('\n');
        
        const examples = [
            '• anthropics/skills',
            '• https://github.com/anthropics/claude-skills',
            '• https://github.com/anthropics/claude-skills/blob/main/skills/algorithmic-art.json',
            '• https://raw.githubusercontent.com/anthropics/claude-skills/main/skills/algorithmic-art.json',
            '• anthropics/claude-skills/skills/algorithmic-art.json',
            '• anthropics/claude-skills@main/skills/algorithmic-art.json'
        ].join('\n');

        throw new Error(
            `无法解析GitHub URL格式。\n\n` +
            `尝试的格式:\n${attemptedFormats}\n\n` +
            `支持的格式示例:\n${examples}\n\n` +
            `你提供的URL: "${url}"`
        );
    }

    /**
     * Scan directory for skills (directories containing SKILL.md)
     * @param {string} directory - Directory to scan
     * @returns {Promise<Array>} Array of skill info
     */
    async scanSkills(directory) {
        const skills = [];

        async function scanRecursive(dir, relativePath = '') {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    // Check if this directory contains SKILL.md
                    const skillPath = path.join(fullPath, 'SKILL.md');
                    try {
                        await fs.access(skillPath);
                        
                        // Found a skill
                        const content = await fs.readFile(skillPath, 'utf-8');
                        const parser = new SkillParser();
                        const metadata = parser.parseMetadata(content);

                        skills.push({
                            name: metadata.name || entry.name,
                            description: metadata.description || '',
                            version: metadata.version || '1.0.0',
                            path: fullPath,
                            relativePath: path.join(relativePath, entry.name)
                        });
                    } catch {
                        // Not a skill directory, scan deeper
                        await scanRecursive(fullPath, path.join(relativePath, entry.name));
                    }
                }
            }
        }

        await scanRecursive(directory);
        return skills;
    }

    /**
     * Calculate directory size in bytes
     * @param {string} dirPath - Directory path
     * @returns {Promise<number>} Size in bytes
     */
    async calculateSize(dirPath) {
        let totalSize = 0;

        async function calcRecursive(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    await calcRecursive(fullPath);
                } else {
                    const stats = await fs.stat(fullPath);
                    totalSize += stats.size;
                }
            }
        }

        await calcRecursive(dirPath);
        return totalSize;
    }

    /**
     * Install a single skill
     * @param {Object} skill - Skill info from scanSkills
     * @param {boolean} force - Overwrite if exists
     * @returns {Promise<void>}
     */
    async installSkill(skill, force = false) {
        const targetPath = path.join(this.targetDir, skill.name);

        // Check if already exists
        try {
            await fs.access(targetPath);
            if (!force) {
                throw new Error(`Skill '${skill.name}' already exists. Use --force to overwrite.`);
            }
            // Remove existing
            await fs.rm(targetPath, { recursive: true, force: true });
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw err;
            }
            // Doesn't exist, that's fine
        }

        // Create target directory
        await fs.mkdir(this.targetDir, { recursive: true });

        // Copy skill directory
        await fs.cp(skill.path, targetPath, { recursive: true });
    }

    /**
     * Install skills from GitHub repository with intelligent URL handling
     * @param {string} repoUrl - GitHub URL or shorthand
     * @param {Object} options - Installation options
     * @returns {Promise<Array>} Installed skills
     */
    async installFromGitHub(repoUrl, options = {}) {
        // 智能解析URL
        const urlInfo = this.parseGitHubUrl(repoUrl);
        const { owner, repo, filePath, branch, isRawFile, format } = urlInfo;

        // 处理特殊情况
        if (!repo) {
            throw new Error(
                `仅提供了GitHub用户/组织名 "${owner}"，但未指定仓库。\n\n` +
                `请使用以下格式之一：\n` +
                `• ${owner}/<repo-name> - 安装特定仓库\n` +
                `• ${owner}/<repo-name>/<path> - 安装仓库中的特定文件/目录\n` +
                `\n示例：\n` +
                `• ${owner}/claude-skills\n` +
                `• ${owner}/claude-skills/skills/algorithmic-art.json`
            );
        }

        // 处理单个文件的情况
        if (filePath) {
            if (isRawFile) {
                // 处理raw文件URL
                return await this.installFromRawFile(urlInfo, options);
            } else {
                // 处理GitHub文件或blob URL
                return await this.installFromFileOrDirectory(urlInfo, options);
            }
        }

        // 默认情况：克隆整个仓库
        return await this.installFromRepository(urlInfo, options);
    }

    /**
     * Install skills by cloning entire repository
     * @param {Object} urlInfo - Parsed URL information
     * @param {Object} options - Installation options
     * @returns {Promise<Array>} Installed skills
     */
    async installFromRepository(urlInfo, options = {}) {
        const { owner, repo } = urlInfo;
        const fullUrl = `https://github.com/${owner}/${repo}.git`;

        console.log(`[INFO] Installing skills from ${owner}/${repo}...`);

        // Create temp directory
        const tempDir = path.join(os.tmpdir(), `stigmergy-skill-install-${Date.now()}`);

        try {
            // Clone repository
            console.log(`[INFO] Cloning repository...`);
            execSync(`git clone --depth 1 ${fullUrl} ${tempDir}`, {
                stdio: options.verbose ? 'inherit' : 'ignore'
            });

            // Scan for skills
            const skills = await this.scanSkills(tempDir);

            if (skills.length === 0) {
                throw new Error(
                    `在仓库 ${owner}/${repo} 中未找到技能。\n\n` +
                    `技能目录必须包含 SKILL.md 文件。\n` +
                    `请确认仓库中包含有效的技能。`
                );
            }

            console.log(`[INFO] 找到 ${skills.length} 个技能`);

            // Install each skill
            const installed = [];
            for (const skill of skills) {
                try {
                    await this.installSkill(skill, options.force);
                    console.log(`[OK] 已安装: ${skill.name}`);
                    installed.push(skill);
                } catch (err) {
                    console.error(`[X] 安装失败 ${skill.name}: ${err.message}`);
                    if (!options.continueOnError) {
                        throw err;
                    }
                }
            }

            console.log(`[SUCCESS] 成功安装 ${installed.length}/${skills.length} 个技能`);
            return installed;
        } catch (error) {
            // 提供友好的错误信息
            if (error.message.includes('Command failed')) {
                throw new Error(
                    `克隆仓库失败: ${owner}/${repo}\n\n` +
                    `可能的原因：\n` +
                    `1. 仓库不存在或无权访问\n` +
                    `2. Git未安装或不可用\n` +
                    `3. 网络连接问题\n\n` +
                    `原始错误: ${error.message}`
                );
            }
            throw error;
        } finally {
            // Cleanup temp directory
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch {
                // Ignore cleanup errors
            }
        }
    }

    /**
     * Install from raw file URL
     * @param {Object} urlInfo - Parsed URL information
     * @param {Object} options - Installation options
     * @returns {Promise<Array>} Installed skills
     */
    async installFromRawFile(urlInfo, options = {}) {
        const { owner, repo, filePath, branch } = urlInfo;
        
        console.log(`[INFO] 从 raw 文件安装: ${owner}/${repo}/${branch}/${filePath}`);
        
        // 目前仅支持仓库级别的安装
        // 对于单个文件，建议用户使用仓库安装
        throw new Error(
            `单个文件安装功能正在开发中。\n\n` +
            `当前仅支持安装整个技能仓库。\n` +
            `请使用以下格式之一：\n` +
            `• ${owner}/${repo} - 安装整个仓库\n` +
            `• https://github.com/${owner}/${repo} - GitHub仓库URL\n\n` +
            `如果你想安装特定技能，请先确认该技能在仓库的SKILL.md文件中定义。`
        );
    }

    /**
     * Install from file or directory path within repository
     * @param {Object} urlInfo - Parsed URL information
     * @param {Object} options - Installation options
     * @returns {Promise<Array>} Installed skills
     */
    async installFromFileOrDirectory(urlInfo, options = {}) {
        const { owner, repo, filePath, branch } = urlInfo;
        
        console.log(`[INFO] 从仓库路径安装: ${owner}/${repo}/${branch}/${filePath}`);
        
        // 目前仅支持仓库级别的安装
        // 对于特定路径，我们可以克隆仓库后只处理该路径
        // 这里先提供有用的错误信息
        const suggestion = filePath.endsWith('.json') ? 
            `你提供的似乎是JSON文件。技能通常以目录形式组织，包含SKILL.md文件。\n` :
            `你提供了路径 "${filePath}"。`;
            
        throw new Error(
            `特定路径安装功能正在开发中。\n\n` +
            `${suggestion}\n` +
            `当前建议：\n` +
            `1. 安装整个仓库: stigmergy skill install ${owner}/${repo}\n` +
            `2. 然后查看可用技能: stigmergy skill list\n` +
            `3. 或者直接使用完整仓库URL: stigmergy skill install https://github.com/${owner}/${repo}`
        );
    }

    /**
     * Uninstall a skill
     * @param {string} skillName - Name of skill to uninstall
     * @returns {Promise<void>}
     */
    async uninstallSkill(skillName) {
        const skillPath = path.join(this.targetDir, skillName);

        try {
            await fs.access(skillPath);
            await fs.rm(skillPath, { recursive: true, force: true });
            console.log(`[OK] Uninstalled: ${skillName}`);
        } catch {
            throw new Error(`Skill '${skillName}' not found`);
        }
    }
}
