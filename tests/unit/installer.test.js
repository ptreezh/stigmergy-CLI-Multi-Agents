/**
 * Tests for StigmergyInstaller class
 */

const StigmergyInstaller = require('../../src/core/installer');
const { spawnSync } = require('child_process');
const fs = require('fs');

// Mock dependencies
jest.mock('inquirer');
jest.mock('../../src/core/smart_router');
jest.mock('../../src/core/error_handler');
jest.mock('fs/promises');

describe('StigmergyInstaller', () => {
  let installer;
  let mockRouter;
  let mockMemory;
  let originalSpawnSync;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Store original spawnSync
    originalSpawnSync = require('child_process').spawnSync;

    // Mock SmartRouter
    mockRouter = {
      tools: {
        claude: { name: 'Claude CLI', version: '1.0.0', install: 'npm install -g @anthropic-ai/claude-code' },
        gemini: { name: 'Gemini CLI', version: '1.0.0', install: 'npm install -g @google/gemini-cli' },
        codex: { name: 'OpenAI Codex CLI', version: '1.0.0', install: 'npm install -g @openai/codex' }
      }
    };

    // Mock MemoryManager
    mockMemory = {};

    installer = new StigmergyInstaller();
    installer.router = mockRouter;
    installer.memory = mockMemory;
  });

  afterEach(() => {
    // Restore original spawnSync
    require('child_process').spawnSync = originalSpawnSync;
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(installer.router).toBeDefined();
      expect(installer.memory).toBeDefined();
      expect(installer.configDir).toContain('.stigmergy');
    });
  });

  describe('checkCLI', () => {
    describe('normal CLI tools', () => {
      test('should return true when CLI tool is available', async () => {
        // Mock successful spawnSync for which command
        spawnSync.mockReturnValueOnce({
          status: 0,
          stdout: '/usr/local/bin/claude\n'
        });

        // Mock successful spawnSync for test command
        spawnSync.mockReturnValueOnce({
          status: 0
        });

        const result = await installer.checkCLI('claude');
        expect(result).toBe(true);
      });

      test('should return false when CLI tool is not found', async () => {
        // Mock failed spawnSync for which command
        spawnSync.mockReturnValueOnce({
          status: 1,
          stdout: ''
        });

        const result = await installer.checkCLI('claude');
        expect(result).toBe(false);
      });

      test('should return false when CLI tool has no version/install info', async () => {
        installer.router.tools.testtool = { name: 'Test Tool' }; // no version or install

        const result = await installer.checkCLI('testtool');
        expect(result).toBe(false);
      });

      test('should handle spawnSync errors gracefully', async () => {
        // Mock spawnSync to throw error for which command
        spawnSync.mockImplementationOnce(() => {
          throw new Error('Command not found');
        });

        const result = await installer.checkCLI('nonexistent');
        expect(result).toBe(false);
      });
    });

    describe('codex special handling', () => {
      beforeEach(() => {
        // Mock fs.existsSync and fs.statSync for codex tests
        const mockFS = {
          existsSync: jest.fn(),
          readFileSync: jest.fn(),
          statSync: jest.fn()
        };
        require('fs').existsSync = mockFS.existsSync;
        require('fs').statSync = mockFS.statSync;
      });

      test('should check codex JS file existence', async () => {
        // Mock successful which command for codex
        spawnSync.mockReturnValueOnce({
          status: 0,
          stdout: '/path/to/codex\n'
        });

        // Mock script content with JS file reference
        require('fs').readFileSync.mockReturnValue('#!/bin/bash\nnode "/path/to/codex.js" "$@"');
        require('fs').existsSync.mockReturnValue(true);
        require('fs').statSync.mockReturnValue({ size: 1000 }); // non-empty file

        // Mock successful test
        spawnSync.mockReturnValueOnce({ status: 0 });

        const result = await installer.checkCLI('codex');
        expect(result).toBe(true);
      });

      test('should return false when codex JS file is empty', async () => {
        // Mock successful which command for codex
        spawnSync.mockReturnValueOnce({
          status: 0,
          stdout: '/path/to/codex\n'
        });

        // Mock script content with JS file reference
        require('fs').readFileSync.mockReturnValue('#!/bin/bash\nnode "/path/to/codex.js" "$@"');
        require('fs').existsSync.mockReturnValue(true);
        require('fs').statSync.mockReturnValue({ size: 0 }); // empty file

        const result = await installer.checkCLI('codex');
        expect(result).toBe(false);
      });

      test('should return false when codex JS file does not exist', async () => {
        // Mock successful which command for codex
        spawnSync.mockReturnValueOnce({
          status: 0,
          stdout: '/path/to/codex\n'
        });

        // Mock script content with JS file reference
        require('fs').readFileSync.mockReturnValue('#!/bin/bash\nnode "/path/to/codex.js" "$@"');
        require('fs').existsSync.mockReturnValue(false);

        const result = await installer.checkCLI('codex');
        expect(result).toBe(false);
      });

      test('should handle codex with extra safety precautions', async () => {
        // Mock successful which command
        spawnSync.mockReturnValueOnce({
          status: 0,
          stdout: '/path/to/codex\n'
        });

        // Mock successful help command with safety options
        spawnSync.mockReturnValueOnce({
          status: 0,
          stderr: '',
          stdout: 'Usage: codex [options]'
        });

        const result = await installer.checkCLI('codex');
        expect(result).toBe(true);

        // Verify that spawnSync was called with safety options
        expect(spawnSync).toHaveBeenCalledWith('codex', ['--help'], {
          encoding: 'utf8',
          timeout: 3000,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: false,
          windowsHide: true,
          detached: false
        });
      });
    });

    describe('fallback checks', () => {
      test('should try multiple check methods', async () => {
        // Mock failed which command
        spawnSync.mockReturnValueOnce({
          status: 1,
          stdout: ''
        });

        // Mock successful help command
        spawnSync.mockReturnValueOnce({
          status: 0
        });

        const result = await installer.checkCLI('claude');
        expect(result).toBe(true);
      });

      test('should try --help and --version flags', async () => {
        // Mock failed which command
        spawnSync.mockReturnValueOnce({ status: 1 });

        // Mock failed --help
        spawnSync.mockReturnValueOnce({ status: 127 });

        // Mock successful --version
        spawnSync.mockReturnValueOnce({ status: 0 });

        const result = await installer.checkCLI('gemini');
        expect(result).toBe(true);

        // Verify correct commands were tried
        expect(spawnSync).toHaveBeenCalledWith('gemini', ['--help'], expect.any(Object));
        expect(spawnSync).toHaveBeenCalledWith('gemini', ['--version'], expect.any(Object));
      });

      test('should handle error status codes correctly', async () => {
        // Mock successful which command
        spawnSync.mockReturnValueOnce({ status: 0, stdout: '/path/to/tool' });

        // Mock command that returns status 1 (should still be considered available)
        spawnSync.mockReturnValueOnce({ status: 1 });

        const result = await installer.checkCLI('tool');
        expect(result).toBe(true);
      });

      test('should return false for command not found status codes', async () => {
        // Mock successful which command
        spawnSync.mockReturnValueOnce({ status: 0, stdout: '/path/to/tool' });

        // Mock command not found (Unix)
        spawnSync.mockReturnValueOnce({ status: 127 });

        // Mock command not found (Windows)
        spawnSync.mockReturnValueOnce({ status: 9009 });

        const result = await installer.checkCLI('tool');
        expect(result).toBe(false);
      });
    });
  });

  describe('scanCLI', () => {
    test('should scan all tools and return available and missing', async () => {
      // Mock checkCLI results
      jest.spyOn(installer, 'checkCLI')
        .mockResolvedValueOnce(true)  // claude available
        .mockResolvedValueOnce(false) // gemini missing
        .mockResolvedValueOnce(true); // codex available

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await installer.scanCLI();

      expect(result.available).toHaveProperty('claude');
      expect(result.available).toHaveProperty('codex');
      expect(result.missing).toHaveProperty('gemini');
      expect(consoleSpy).toHaveBeenCalledWith('[SCAN] Scanning for AI CLI tools...');
      expect(consoleSpy).toHaveBeenCalledWith('[SCAN] Checking Claude CLI...');
      expect(consoleSpy).toHaveBeenCalledWith('[OK] Claude CLI is available');

      consoleSpy.mockRestore();
    });

    test('should handle checkCLI errors gracefully', async () => {
      // Mock checkCLI to throw error
      jest.spyOn(installer, 'checkCLI').mockRejectedValue(new Error('Test error'));

      // Mock errorHandler
      const mockErrorHandler = require('../../src/core/error_handler');
      mockErrorHandler.logError = jest.fn().mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await installer.scanCLI();

      expect(result.missing).toHaveProperty('claude');
      expect(mockErrorHandler.logError).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Failed to check Claude CLI')
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('placeholder methods', () => {
    test('downloadRequiredAssets should return true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.downloadRequiredAssets();
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[ASSETS] No required assets to download');
      consoleSpy.mockRestore();
    });

    test('showInstallOptions should return empty array', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.showInstallOptions({});
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('[INSTALL] No install options to show');
      consoleSpy.mockRestore();
    });

    test('getUserSelection should return empty array', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.getUserSelection([], {});
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('[INSTALL] No user selection needed');
      consoleSpy.mockRestore();
    });

    test('installTools should return true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.installTools([], {});
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[INSTALL] No tools to install');
      consoleSpy.mockRestore();
    });

    test('deployHooks should return true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.deployHooks({});
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[HOOKS] No hooks to deploy');
      consoleSpy.mockRestore();
    });

    test('deployProjectDocumentation should return true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.deployProjectDocumentation();
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[DOCS] No documentation to deploy');
      consoleSpy.mockRestore();
    });

    test('initializeConfig should return true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.initializeConfig();
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[CONFIG] Configuration initialized');
      consoleSpy.mockRestore();
    });

    test('showUsageInstructions should return true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await installer.showUsageInstructions();
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[USAGE] No usage instructions to show');
      consoleSpy.mockRestore();
    });
  });

  describe('createProjectFiles', () => {
    test('should create PROJECT_SPEC.json and PROJECT_CONSTITUTION.md', async () => {
      const mockFs = require('fs/promises');
      mockFs.access = jest.fn()
        .mockResolvedValueOnce(false) // PROJECT_SPEC.json doesn't exist
        .mockResolvedValueOnce(false); // PROJECT_CONSTITUTION.md doesn't exist
      mockFs.writeFile = jest.fn().mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await installer.createProjectFiles();

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('PROJECT_SPEC.json'),
        '{}',
        'utf8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('PROJECT_CONSTITUTION.md'),
        expect.stringContaining('# 项目协作宪法'),
        'utf8'
      );
      expect(consoleSpy).toHaveBeenCalledWith('[PROJECT] Created PROJECT_SPEC.json');
      expect(consoleSpy).toHaveBeenCalledWith('[PROJECT] Created PROJECT_CONSTITUTION.md');

      consoleSpy.mockRestore();
    });

    test('should not create files if they already exist', async () => {
      const mockFs = require('fs/promises');
      mockFs.access = jest.fn()
        .mockResolvedValueOnce(true) // PROJECT_SPEC.json exists
        .mockResolvedValueOnce(true); // PROJECT_CONSTITUTION.md exists
      mockFs.writeFile = jest.fn().mockResolvedValue();

      const result = await installer.createProjectFiles();

      expect(result).toBe(true);
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    test('should handle file creation errors', async () => {
      const mockFs = require('fs/promises');
      mockFs.access = jest.fn().mockResolvedValue(false);
      mockFs.writeFile = jest.fn().mockRejectedValue(new Error('Permission denied'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await installer.createProjectFiles();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[PROJECT] Failed to create project files:',
        'Permission denied'
      );

      consoleSpy.mockRestore();
    });
  });
});
