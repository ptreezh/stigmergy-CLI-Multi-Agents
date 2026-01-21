import { describe, it, expect } from '@jest/globals';
import {
  COORDINATION_DIR,
  FILE_PATHS,
  CLI_HOOKS_DIR,
  PERFORMANCE_CONFIG,
  CLI_PARAM_MAPPINGS,
  CLI_CAPABILITY_MATRIX
} from '../index';

describe('Configuration', () => {
  describe('COORDINATION_DIR', () => {
    it('should be defined', () => {
      expect(COORDINATION_DIR).toBeDefined();
      expect(typeof COORDINATION_DIR).toBe('string');
    });

    it('should start with dot', () => {
      expect(COORDINATION_DIR).toMatch(/^\./);
    });
  });

  describe('FILE_PATHS', () => {
    it('should have all required file paths', () => {
      expect(FILE_PATHS.taskRegistry).toBeDefined();
      expect(FILE_PATHS.stateLocks).toBeDefined();
      expect(FILE_PATHS.sharedContext).toBeDefined();
      expect(FILE_PATHS.eventLog).toBeDefined();
      expect(FILE_PATHS.worktreeRegistry).toBeDefined();
      expect(FILE_PATHS.terminalSessions).toBeDefined();
      expect(FILE_PATHS.history).toBeDefined();
    });

    it('should include coordination directory in paths', () => {
      Object.values(FILE_PATHS).forEach(path => {
        if (typeof path === 'string') {
          // 使用 path.normalize 来处理跨平台路径分隔符
          const normalizedPath = path.replace(/\\/g, '/');
          const normalizedCoordDir = COORDINATION_DIR.replace(/\\/g, '/');
          expect(normalizedPath).toContain(normalizedCoordDir);
        }
      });
    });
  });

  describe('CLI_HOOKS_DIR', () => {
    it('should have hooks directory for all CLIs', () => {
      const expectedCLIs = [
        'claude', 'gemini', 'iflow', 'opencode', 
        'qwen', 'codebuddy', 'copilot', 'codex'
      ];

      expectedCLIs.forEach(cli => {
        expect(CLI_HOOKS_DIR[cli as keyof typeof CLI_HOOKS_DIR]).toBeDefined();
      });
    });

    it('should include .stigmergy/hooks in paths', () => {
      Object.values(CLI_HOOKS_DIR).forEach(path => {
        expect(path).toContain('.stigmergy');
        expect(path).toContain('hooks');
      });
    });
  });

  describe('PERFORMANCE_CONFIG', () => {
    it('should have all required performance settings', () => {
      expect(PERFORMANCE_CONFIG.maxConcurrency).toBeDefined();
      expect(PERFORMANCE_CONFIG.maxWorktrees).toBeDefined();
      expect(PERFORMANCE_CONFIG.taskTimeout).toBeDefined();
      expect(PERFORMANCE_CONFIG.lockTimeout).toBeDefined();
      expect(PERFORMANCE_CONFIG.terminalStartupTimeout).toBeDefined();
      expect(PERFORMANCE_CONFIG.worktreeCreationTimeout).toBeDefined();
      expect(PERFORMANCE_CONFIG.eventLogRetention).toBeDefined();
    });

    it('should have positive numeric values', () => {
      expect(PERFORMANCE_CONFIG.maxConcurrency).toBeGreaterThan(0);
      expect(PERFORMANCE_CONFIG.maxWorktrees).toBeGreaterThan(0);
      expect(PERFORMANCE_CONFIG.taskTimeout).toBeGreaterThan(0);
      expect(PERFORMANCE_CONFIG.lockTimeout).toBeGreaterThan(0);
      expect(PERFORMANCE_CONFIG.terminalStartupTimeout).toBeGreaterThan(0);
      expect(PERFORMANCE_CONFIG.worktreeCreationTimeout).toBeGreaterThan(0);
      expect(PERFORMANCE_CONFIG.eventLogRetention).toBeGreaterThan(0);
    });

    it('should have reasonable timeout values', () => {
      expect(PERFORMANCE_CONFIG.taskTimeout).toBe(30 * 60 * 1000); // 30 minutes
      expect(PERFORMANCE_CONFIG.lockTimeout).toBe(5 * 60 * 1000); // 5 minutes
      expect(PERFORMANCE_CONFIG.terminalStartupTimeout).toBe(5 * 1000); // 5 seconds
      expect(PERFORMANCE_CONFIG.worktreeCreationTimeout).toBe(10 * 1000); // 10 seconds
      expect(PERFORMANCE_CONFIG.eventLogRetention).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
    });
  });

  describe('CLI_PARAM_MAPPINGS', () => {
    it('should have mappings for all CLIs', () => {
      const expectedCLIs = ['claude', 'gemini', 'iflow', 'opencode'];

      expectedCLIs.forEach(cli => {
        expect(CLI_PARAM_MAPPINGS[cli as keyof typeof CLI_PARAM_MAPPINGS]).toBeDefined();
      });
    });

    it('should have all required parameter functions', () => {
      Object.values(CLI_PARAM_MAPPINGS).forEach(mappings => {
        expect(mappings.agent).toBeDefined();
        expect(mappings.skills).toBeDefined();
        expect(mappings.mcp).toBeDefined();
        expect(mappings.cwd).toBeDefined();
        
        expect(typeof mappings.agent).toBe('function');
        expect(typeof mappings.skills).toBe('function');
        expect(typeof mappings.mcp).toBe('function');
        expect(typeof mappings.cwd).toBe('function');
      });
    });

    it('should generate valid CLI commands', () => {
      const claudeMappings = CLI_PARAM_MAPPINGS.claude;
      
      const agentParam = claudeMappings.agent('oracle');
      expect(agentParam).toContain('--agent');
      expect(agentParam).toContain('oracle');

      const skillsParam = claudeMappings.skills(['typescript', 'react']);
      expect(skillsParam).toContain('skill');

      const cwdParam = claudeMappings.cwd('/path/to/project');
      expect(cwdParam).toContain('--cwd');
      expect(cwdParam).toContain('/path/to/project');
    });
  });

  describe('CLI_CAPABILITY_MATRIX', () => {
    it('should have capabilities for all CLIs', () => {
      const expectedCLIs = ['claude', 'gemini', 'iflow', 'opencode'];

      expectedCLIs.forEach(cli => {
        expect(CLI_CAPABILITY_MATRIX[cli as keyof typeof CLI_CAPABILITY_MATRIX]).toBeDefined();
      });
    });

    it('should have all required capability fields', () => {
      Object.values(CLI_CAPABILITY_MATRIX).forEach(capability => {
        expect(capability.strengths).toBeDefined();
        expect(capability.weaknesses).toBeDefined();
        expect(capability.model).toBeDefined();
        expect(capability.cost).toBeDefined();
        expect(capability.quality).toBeDefined();

        expect(Array.isArray(capability.strengths)).toBe(true);
        expect(Array.isArray(capability.weaknesses)).toBe(true);
        expect(typeof capability.model).toBe('string');
        expect(typeof capability.cost).toBe('string');
        expect(typeof capability.quality).toBe('string');
      });
    });

    it('should have valid cost and quality values', () => {
      Object.values(CLI_CAPABILITY_MATRIX).forEach(capability => {
        expect(['low', 'medium', 'high']).toContain(capability.cost);
        expect(['low', 'medium', 'high']).toContain(capability.quality);
      });
    });

    it('should have non-empty strengths and weaknesses', () => {
      Object.values(CLI_CAPABILITY_MATRIX).forEach(capability => {
        expect(capability.strengths.length).toBeGreaterThan(0);
        expect(capability.weaknesses.length).toBeGreaterThan(0);
      });
    });
  });
});