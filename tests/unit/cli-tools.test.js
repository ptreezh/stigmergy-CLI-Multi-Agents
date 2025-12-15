// tests/unit/cli-tools.test.js

const { CLI_TOOLS, validateCLITool } = require('../../src/core/cli_tools');
const path = require('path');

describe('CLI Tools Configuration', () => {
  describe('CLI_TOOLS Configuration', () => {
    test('should have all required CLI tools configured', () => {
      const expectedTools = [
        'claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'
      ];

      expectedTools.forEach(tool => {
        expect(CLI_TOOLS).toHaveProperty(tool);
        expect(CLI_TOOLS[tool]).toHaveProperty('name');
        expect(CLI_TOOLS[tool]).toHaveProperty('version');
        expect(CLI_TOOLS[tool]).toHaveProperty('install');
        expect(CLI_TOOLS[tool]).toHaveProperty('hooksDir');
        expect(CLI_TOOLS[tool]).toHaveProperty('config');
      });
    });

    test('should have valid installation commands', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.install).toBeDefined();
        expect(typeof tool.install).toBe('string');
        // codex has empty install command
        if (tool.name !== 'Codex CLI') {
          expect(tool.install.length).toBeGreaterThan(0);
        }
      });
    });

    test('should have proper configuration paths', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.config).toBeDefined();
        expect(typeof tool.config).toBe('string');
        expect(tool.config.length).toBeGreaterThan(0);
        expect(path.isAbsolute(tool.config)).toBe(true);
      });
    });

    test('should have proper hooks directories', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.hooksDir).toBeDefined();
        expect(typeof tool.hooksDir).toBe('string');
        expect(tool.hooksDir.length).toBeGreaterThan(0);
        expect(path.isAbsolute(tool.hooksDir)).toBe(true);
      });
    });

    test('should have valid version commands', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.version).toBeDefined();
        expect(typeof tool.version).toBe('string');
        expect(tool.version.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateCLITool', () => {
    test('should validate known CLI tools', () => {
      const knownTools = Object.keys(CLI_TOOLS);

      knownTools.forEach(tool => {
        expect(validateCLITool(tool)).toBe(true);
      });
    });

    test('should reject unknown CLI tools', () => {
      const invalidTools = ['invalid', 'unknown', 'fakecli', ''];

      invalidTools.forEach(tool => {
        expect(validateCLITool(tool)).toBe(false);
      });
    });

    test('should handle null and undefined inputs', () => {
      expect(validateCLITool(null)).toBe(false);
      expect(validateCLITool(undefined)).toBe(false);
    });

    test('should handle non-string inputs', () => {
      expect(validateCLITool(123)).toBe(false);
      expect(validateCLITool({})).toBe(false);
      expect(validateCLITool([])).toBe(false);
    });
  });

  describe('Specific Tool Configurations', () => {
    test('claude should have correct configuration', () => {
      const claude = CLI_TOOLS.claude;
      expect(claude.name).toBe('Claude CLI');
      expect(claude.version).toBe('claude --version');
      expect(claude.install).toBe('npm install -g @anthropic-ai/claude-code');
    });

    test('gemini should have correct configuration', () => {
      const gemini = CLI_TOOLS.gemini;
      expect(gemini.name).toBe('Gemini CLI');
      expect(gemini.version).toBe('gemini --version');
      expect(gemini.install).toBe('npm install -g @google/gemini-cli');
    });

    test('codex should have correct configuration', () => {
      const codex = CLI_TOOLS.codex;
      expect(codex.name).toBe('OpenAI Codex CLI');
      expect(codex.install).toBe('npm install -g @openai/codex');
    });
  });

  describe('Path Validation', () => {
    test('should have valid hooks directory paths', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.hooksDir).toContain('.claude');
        expect(tool.hooksDir).toContain('.gemini');
        expect(tool.hooksDir).toContain('.qwen');
        expect(tool.hooksDir).toContain('.iflow');
        expect(tool.hooksDir).toContain('.qoder');
        expect(tool.hooksDir).toContain('.codebuddy');
        expect(tool.hooksDir).toContain('.copilot');
        expect(tool.hooksDir).toContain('.codex');
      });
    });

    test('should have valid config file paths', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.config).toContain('config.json');
      });
    });
  });

  describe('CLI Tool Count', () => {
    test('should have exactly 8 CLI tools', () => {
      const toolCount = Object.keys(CLI_TOOLS).length;
      expect(toolCount).toBe(8);
    });

    test('should have correct tool names', () => {
      const expectedNames = [
        'Claude CLI',
        'Gemini CLI',
        'Qwen CLI',
        'iFlow CLI',
        'Qoder CLI',
        'CodeBuddy CLI',
        'GitHub Copilot CLI',
        'Codex CLI'
      ];

      Object.values(CLI_TOOLS).forEach(tool => {
        expect(expectedNames).toContain(tool.name);
      });
    });
  });
});