/**
 * SkillParser - Parse SKILL.md files
 * 
 * Adapted from: https://github.com/numman-ali/openskills
 * Original License: Apache 2.0
 * Modifications: Copyright Stigmergy Project
 */

export class SkillParser {
    /**
     * Parse YAML frontmatter from skill content
     * @param {string} content - Full SKILL.md content
     * @returns {Object} Parsed metadata
     */
    parseMetadata(content) {
        // Normalize line endings to LF
        const normalizedContent = content.replace(/\r\n/g, '\n');
        const match = normalizedContent.match(/^---\n(.*?)\n---/s);
        if (!match) {
            return {};
        }

        const yamlContent = match[1];
        const metadata = {};
        
        const lines = yamlContent.split('\n');
        let currentKey = null;
        let currentArray = null;
        
        for (const line of lines) {
            // Handle array items
            if (line.trim().startsWith('-') && currentKey) {
                const value = line.trim().substring(1).trim();
                if (!currentArray) {
                    currentArray = [];
                    metadata[currentKey] = currentArray;
                }
                currentArray.push(value);
                continue;
            }
            
            // Handle key-value pairs
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                currentKey = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // Reset array tracking
                currentArray = null;
                
                // Handle multiline values (>)
                if (value === '>') {
                    continue; // Next lines will be the value
                }
                
                // Remove quotes
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                if (value) {
                    metadata[currentKey] = value;
                }
            } else if (currentKey && line.trim()) {
                // Multiline continuation
                const existingValue = metadata[currentKey];
                metadata[currentKey] = existingValue 
                    ? `${existingValue} ${line.trim()}`
                    : line.trim();
            }
        }
        
        return metadata;
    }

    /**
     * Extract content after frontmatter
     * @param {string} content - Full SKILL.md content
     * @returns {string} Content without frontmatter
     */
    extractContent(content) {
        // Normalize line endings to LF
        const normalizedContent = content.replace(/\r\n/g, '\n');
        const match = normalizedContent.match(/^---\n.*?\n---\n(.*)$/s);
        return match ? match[1].trim() : normalizedContent;
    }

    /**
     * Validate skill structure and content
     * @param {string} content - Full SKILL.md content
     * @returns {Object} Validation result with valid flag and errors array
     */
    validateSkill(content) {
        const errors = [];
        const metadata = this.parseMetadata(content);
        
        // Required fields
        if (!metadata.name) {
            errors.push('Missing required field: name');
        }
        
        if (!metadata.description) {
            errors.push('Missing required field: description');
        }
        
        // Name format validation
        if (metadata.name && !/^[a-z0-9-]+$/.test(metadata.name)) {
            errors.push('Skill name must use lowercase and hyphens only');
        }
        
        // Content length validation (approximate word count)
        const mainContent = this.extractContent(content);
        const wordCount = mainContent.split(/\s+/).length;
        
        if (wordCount > 5000) {
            errors.push('SKILL.md content exceeds 5000 words');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            metadata: metadata,
            wordCount: wordCount
        };
    }
}
