/**
 * SkillInstaller Tests - TDD Approach
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SkillInstaller } from '../embedded-openskills/SkillInstaller.js';

describe('SkillInstaller', () => {
    let installer;
    let testInstallDir;

    beforeEach(async () => {
        testInstallDir = path.join(os.tmpdir(), `test-install-${Date.now()}`);
        await fs.mkdir(testInstallDir, { recursive: true });
        
        installer = new SkillInstaller(testInstallDir);
    });

    afterEach(async () => {
        await fs.rm(testInstallDir, { recursive: true, force: true });
    });

    describe('parseGitHubUrl', () => {
        it('should parse standard GitHub URL', () => {
            // Arrange
            const url = 'https://github.com/owner/repo';

            // Act
            const result = installer.parseGitHubUrl(url);

            // Assert
            expect(result.owner).toBe('owner');
            expect(result.repo).toBe('repo');
        });

        it('should parse GitHub URL with .git suffix', () => {
            // Arrange
            const url = 'https://github.com/owner/repo.git';

            // Act
            const result = installer.parseGitHubUrl(url);

            // Assert
            expect(result.owner).toBe('owner');
            expect(result.repo).toBe('repo');
        });

        it('should parse short format owner/repo', () => {
            // Arrange
            const url = 'owner/repo';

            // Act
            const result = installer.parseGitHubUrl(url);

            // Assert
            expect(result.owner).toBe('owner');
            expect(result.repo).toBe('repo');
        });

        it('should throw error for invalid URL', () => {
            // Arrange
            const url = 'not-a-valid-url';

            // Act & Assert
            expect(() => installer.parseGitHubUrl(url))
                .toThrow('Invalid GitHub URL');
        });
    });

    describe('scanSkills', () => {
        it('should find skills in directory', async () => {
            // Arrange: Create test skill structure
            const skill1Dir = path.join(testInstallDir, 'skill-1');
            const skill2Dir = path.join(testInstallDir, 'skill-2');
            
            await fs.mkdir(skill1Dir, { recursive: true });
            await fs.mkdir(skill2Dir, { recursive: true });
            
            await fs.writeFile(
                path.join(skill1Dir, 'SKILL.md'),
                '---\nname: skill-1\ndescription: First skill\n---\n'
            );
            await fs.writeFile(
                path.join(skill2Dir, 'SKILL.md'),
                '---\nname: skill-2\ndescription: Second skill\n---\n'
            );

            // Act
            const skills = await installer.scanSkills(testInstallDir);

            // Assert
            expect(skills).toHaveLength(2);
            expect(skills.map(s => s.name)).toContain('skill-1');
            expect(skills.map(s => s.name)).toContain('skill-2');
        });

        it('should find nested skills', async () => {
            // Arrange: Create nested structure
            const nestedDir = path.join(testInstallDir, 'category', 'skill-nested');
            await fs.mkdir(nestedDir, { recursive: true });
            await fs.writeFile(
                path.join(nestedDir, 'SKILL.md'),
                '---\nname: skill-nested\n---\n'
            );

            // Act
            const skills = await installer.scanSkills(testInstallDir);

            // Assert
            expect(skills).toHaveLength(1);
            expect(skills[0].name).toBe('skill-nested');
        });

        it('should ignore directories without SKILL.md', async () => {
            // Arrange
            await fs.mkdir(path.join(testInstallDir, 'not-a-skill'));
            const validDir = path.join(testInstallDir, 'valid-skill');
            await fs.mkdir(validDir);
            await fs.writeFile(
                path.join(validDir, 'SKILL.md'),
                '---\nname: valid-skill\n---\n'
            );

            // Act
            const skills = await installer.scanSkills(testInstallDir);

            // Assert
            expect(skills).toHaveLength(1);
            expect(skills[0].name).toBe('valid-skill');
        });

        it('should include skill metadata', async () => {
            // Arrange
            const skillDir = path.join(testInstallDir, 'meta-skill');
            await fs.mkdir(skillDir);
            await fs.writeFile(
                path.join(skillDir, 'SKILL.md'),
                '---\nname: meta-skill\ndescription: Has metadata\nversion: 2.0.0\n---\n'
            );

            // Act
            const skills = await installer.scanSkills(testInstallDir);

            // Assert
            expect(skills[0].description).toBe('Has metadata');
            expect(skills[0].version).toBe('2.0.0');
        });
    });

    describe('installSkill', () => {
        it('should copy skill to target directory', async () => {
            // Arrange
            const sourceDir = path.join(testInstallDir, 'source');
            const skillDir = path.join(sourceDir, 'test-skill');
            await fs.mkdir(skillDir, { recursive: true });
            await fs.writeFile(
                path.join(skillDir, 'SKILL.md'),
                '---\nname: test-skill\n---\n'
            );

            const targetDir = path.join(testInstallDir, 'target');
            installer = new SkillInstaller(targetDir);

            const skill = {
                name: 'test-skill',
                path: skillDir
            };

            // Act
            await installer.installSkill(skill);

            // Assert
            const installed = await fs.access(
                path.join(targetDir, 'test-skill', 'SKILL.md')
            ).then(() => true).catch(() => false);
            expect(installed).toBe(true);
        });

        it('should copy bundled resources', async () => {
            // Arrange
            const sourceDir = path.join(testInstallDir, 'source');
            const skillDir = path.join(sourceDir, 'skill-with-resources');
            await fs.mkdir(skillDir, { recursive: true });
            await fs.mkdir(path.join(skillDir, 'scripts'));
            await fs.mkdir(path.join(skillDir, 'references'));
            
            await fs.writeFile(path.join(skillDir, 'SKILL.md'), '---\nname: skill\n---\n');
            await fs.writeFile(path.join(skillDir, 'scripts', 'helper.py'), 'print("hi")');
            await fs.writeFile(path.join(skillDir, 'references', 'guide.md'), '# Guide');

            const targetDir = path.join(testInstallDir, 'target');
            installer = new SkillInstaller(targetDir);

            const skill = {
                name: 'skill-with-resources',
                path: skillDir
            };

            // Act
            await installer.installSkill(skill);

            // Assert
            const scriptExists = await fs.access(
                path.join(targetDir, 'skill-with-resources', 'scripts', 'helper.py')
            ).then(() => true).catch(() => false);
            const refExists = await fs.access(
                path.join(targetDir, 'skill-with-resources', 'references', 'guide.md')
            ).then(() => true).catch(() => false);
            
            expect(scriptExists).toBe(true);
            expect(refExists).toBe(true);
        });

        it('should not overwrite existing skill by default', async () => {
            // Arrange
            const targetDir = path.join(testInstallDir, 'target');
            const existingSkillDir = path.join(targetDir, 'existing-skill');
            await fs.mkdir(existingSkillDir, { recursive: true });
            await fs.writeFile(
                path.join(existingSkillDir, 'SKILL.md'),
                'original content'
            );

            const sourceDir = path.join(testInstallDir, 'source', 'existing-skill');
            await fs.mkdir(sourceDir, { recursive: true });
            await fs.writeFile(
                path.join(sourceDir, 'SKILL.md'),
                'new content'
            );

            installer = new SkillInstaller(targetDir);
            const skill = { name: 'existing-skill', path: sourceDir };

            // Act & Assert
            await expect(installer.installSkill(skill))
                .rejects
                .toThrow('already exists');
        });
    });

    describe('calculateSize', () => {
        it('should calculate directory size', async () => {
            // Arrange
            const dir = path.join(testInstallDir, 'size-test');
            await fs.mkdir(dir);
            await fs.writeFile(path.join(dir, 'file1.txt'), 'x'.repeat(100));
            await fs.writeFile(path.join(dir, 'file2.txt'), 'y'.repeat(200));

            // Act
            const size = await installer.calculateSize(dir);

            // Assert
            expect(size).toBeGreaterThan(0);
            expect(size).toBe(300); // 100 + 200 bytes
        });

        it('should include subdirectories in size', async () => {
            // Arrange
            const dir = path.join(testInstallDir, 'nested-size-test');
            const subdir = path.join(dir, 'subdir');
            await fs.mkdir(subdir, { recursive: true });
            await fs.writeFile(path.join(dir, 'file1.txt'), 'x'.repeat(100));
            await fs.writeFile(path.join(subdir, 'file2.txt'), 'y'.repeat(150));

            // Act
            const size = await installer.calculateSize(dir);

            // Assert
            expect(size).toBe(250); // 100 + 150 bytes
        });
    });
});
