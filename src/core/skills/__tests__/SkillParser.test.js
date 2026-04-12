/**
 * SkillParser Tests - TDD Approach
 */

import { describe, it, expect } from '@jest/globals';
import { SkillParser } from '../embedded-openskills/SkillParser.js';

describe('SkillParser', () => {
    let parser;

    beforeEach(() => {
        parser = new SkillParser();
    });

    describe('parseMetadata', () => {
        it('should parse valid YAML frontmatter', () => {
            // Arrange
            const content = `---
name: test-skill
description: A test skill
version: 1.0.0
---

# Content here`;

            // Act
            const result = parser.parseMetadata(content);

            // Assert
            expect(result.name).toBe('test-skill');
            expect(result.description).toBe('A test skill');
            expect(result.version).toBe('1.0.0');
        });

        it('should handle missing frontmatter', () => {
            // Arrange
            const content = '# Just content without frontmatter';

            // Act
            const result = parser.parseMetadata(content);

            // Assert
            expect(result).toEqual({});
        });

        it('should handle empty frontmatter', () => {
            // Arrange
            const content = '---\n---\n# Content';

            // Act
            const result = parser.parseMetadata(content);

            // Assert
            expect(result).toEqual({});
        });

        it('should parse arrays in frontmatter', () => {
            // Arrange
            const content = `---
name: skill
allowed-tools:
  - bash
  - text_editor
  - web_search
---`;

            // Act
            const result = parser.parseMetadata(content);

            // Assert
            expect(result['allowed-tools']).toEqual(['bash', 'text_editor', 'web_search']);
        });

        it('should handle multiline values', () => {
            // Arrange
            const content = `---
name: skill
description: >
  This is a long description
  that spans multiple lines
---`;

            // Act
            const result = parser.parseMetadata(content);

            // Assert
            expect(result.description).toContain('This is a long description');
        });
    });

    describe('extractContent', () => {
        it('should extract content after frontmatter', () => {
            // Arrange
            const content = `---
name: test
---

# Instructions

Do something`;

            // Act
            const result = parser.extractContent(content);

            // Assert
            expect(result).toContain('# Instructions');
            expect(result).toContain('Do something');
            expect(result).not.toContain('---');
        });

        it('should return full content if no frontmatter', () => {
            // Arrange
            const content = '# Just content';

            // Act
            const result = parser.extractContent(content);

            // Assert
            expect(result).toBe(content);
        });
    });

    describe('validateSkill', () => {
        it('should validate correct skill structure', () => {
            // Arrange
            const content = `---
name: valid-skill
description: Valid description
---

# Valid Content`;

            // Act
            const result = parser.validateSkill(content);

            // Assert
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should detect missing name', () => {
            // Arrange
            const content = `---
description: No name
---`;

            // Act
            const result = parser.validateSkill(content);

            // Assert
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Missing required field: name');
        });

        it('should detect missing description', () => {
            // Arrange
            const content = `---
name: skill-no-desc
---`;

            // Act
            const result = parser.validateSkill(content);

            // Assert
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Missing required field: description');
        });

        it('should detect invalid name format', () => {
            // Arrange
            const content = `---
name: Invalid_Name
description: Test
---`;

            // Act
            const result = parser.validateSkill(content);

            // Assert
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Skill name must use lowercase and hyphens only');
        });

        it('should validate content length', () => {
            // Arrange
            const longContent = 'x'.repeat(6000);
            const content = `---
name: long-skill
description: Test
---

${longContent}`;

            // Act
            const result = parser.validateSkill(content);

            // Assert
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('SKILL.md content exceeds 5000 words');
        });
    });
});
