/**
 * SkillReader Tests - TDD Approach
 * Test-Driven Development: Write tests first, then implement functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SkillReader } from '../embedded-openskills/SkillReader.js';

describe('SkillReader', () => {
    let reader;
    let testSkillsDir;

    beforeEach(async () => {
        // Create temporary skill directory for testing
        testSkillsDir = path.join(os.tmpdir(), `test-skills-${Date.now()}`);
        await fs.mkdir(testSkillsDir, { recursive: true });

        reader = new SkillReader([testSkillsDir]);
    });

    afterEach(async () => {
        // Cleanup test directory
        await fs.rm(testSkillsDir, { recursive: true, force: true });
    });

    describe('findSkill', () => {
        it('should find an existing skill', async () => {
            // Arrange: Create test skill
            const skillName = 'test-skill';
            const skillDir = path.join(testSkillsDir, skillName);
            await fs.mkdir(skillDir, { recursive: true });
            await fs.writeFile(
                path.join(skillDir, 'SKILL.md'),
                '---\nname: test-skill\n---\n# Test'
            );

            // Act: Find skill
            const result = await reader.findSkill(skillName);

            // Assert: Verify result
            expect(result).not.toBeNull();
            expect(result.name).toBe(skillName);
            expect(result.path).toContain('SKILL.md');
            expect(result.baseDir).toBe(skillDir);
        });

        it('should return null for non-existent skill', async () => {
            // Act
            const result = await reader.findSkill('non-existent');

            // Assert
            expect(result).toBeNull();
        });

        it('should search in multiple directories', async () => {
            // Arrange: Create second search path
            const secondDir = path.join(os.tmpdir(), `test-skills-2-${Date.now()}`);
            await fs.mkdir(secondDir, { recursive: true });

            reader = new SkillReader([testSkillsDir, secondDir]);

            // Create skill in second directory
            const skillName = 'skill-in-second-dir';
            const skillDir = path.join(secondDir, skillName);
            await fs.mkdir(skillDir);
            await fs.writeFile(
                path.join(skillDir, 'SKILL.md'),
                '---\nname: skill-in-second-dir\n---\n'
            );

            // Act
            const result = await reader.findSkill(skillName);

            // Assert
            expect(result).not.toBeNull();
            expect(result.baseDir).toBe(skillDir);

            // Cleanup
            await fs.rm(secondDir, { recursive: true, force: true });
        });
    });

    describe('readSkill', () => {
        it('should read skill content', async () => {
            // Arrange
            const skillName = 'readable-skill';
            const skillDir = path.join(testSkillsDir, skillName);
            await fs.mkdir(skillDir);
            const skillContent = '---\nname: readable-skill\ndescription: Test skill\n---\n# Instructions\nDo something';
            await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);

            // Act
            const result = await reader.readSkill(skillName);

            // Assert
            expect(result.name).toBe(skillName);
            expect(result.content).toBe(skillContent);
            expect(result.baseDir).toBe(skillDir);
        });

        it('should throw error for non-existent skill', async () => {
            // Act & Assert
            await expect(reader.readSkill('non-existent'))
                .rejects
                .toThrow("Skill 'non-existent' not found");
        });

        it('should read skill with bundled resources', async () => {
            // Arrange: Create skill with resources
            const skillName = 'skill-with-resources';
            const skillDir = path.join(testSkillsDir, skillName);
            await fs.mkdir(skillDir);
            await fs.mkdir(path.join(skillDir, 'scripts'));
            await fs.mkdir(path.join(skillDir, 'references'));

            await fs.writeFile(
                path.join(skillDir, 'SKILL.md'),
                '---\nname: skill-with-resources\n---\n# Skill'
            );
            await fs.writeFile(
                path.join(skillDir, 'scripts', 'helper.py'),
                'print("helper")'
            );

            // Act
            const result = await reader.readSkill(skillName);

            // Assert
            expect(result.name).toBe(skillName);
            expect(result.baseDir).toBe(skillDir);
            
            // Verify resource file exists
            const scriptExists = await fs.access(
                path.join(result.baseDir, 'scripts', 'helper.py')
            ).then(() => true).catch(() => false);
            expect(scriptExists).toBe(true);
        });
    });

    describe('listSkills', () => {
        it('should list all skills in directory', async () => {
            // Arrange: Create multiple skills
            const skills = ['skill-1', 'skill-2', 'skill-3'];
            for (const name of skills) {
                const skillDir = path.join(testSkillsDir, name);
                await fs.mkdir(skillDir);
                await fs.writeFile(
                    path.join(skillDir, 'SKILL.md'),
                    `---\nname: ${name}\ndescription: ${name} description\n---\n`
                );
            }

            // Act
            const result = await reader.listSkills();

            // Assert
            expect(result).toHaveLength(skills.length);
            expect(result.map(s => s.name).sort()).toEqual(skills.sort());
        });

        it('should return empty array when no skills found', async () => {
            // Act
            const result = await reader.listSkills();

            // Assert
            expect(result).toEqual([]);
        });

        it('should ignore directories without SKILL.md', async () => {
            // Arrange
            await fs.mkdir(path.join(testSkillsDir, 'not-a-skill'));
            await fs.mkdir(path.join(testSkillsDir, 'valid-skill'));
            await fs.writeFile(
                path.join(testSkillsDir, 'valid-skill', 'SKILL.md'),
                '---\nname: valid-skill\n---\n'
            );

            // Act
            const result = await reader.listSkills();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('valid-skill');
        });
    });
});
