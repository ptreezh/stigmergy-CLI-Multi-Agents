/**
 * SkillSyncManager Tests - desktop tool skills sync integration (W2 Phase 1)
 */
const path = require('path');
const fs = require('fs');
const SkillSyncManager = require('../SkillSyncManager');

jest.mock('os', () => {
  const actual = jest.requireActual('os');
  return { ...actual, homedir: () => 'C:\\Users\\testuser' };
});

describe('SkillSyncManager desktop integration', () => {
  let manager;

  beforeEach(() => {
    manager = new SkillSyncManager();
  });

  describe('cliTools registry', () => {
    it('includes workbuddy (only desktop tool with verified skillsDir)', () => {
      expect(manager.cliTools).toContain('workbuddy');
    });

    it('excludes desktop tools whose skillsDir convention is unverified', () => {
      for (const tool of [
        'qwenwork',
        'traework',
        'qoderwork',
        'doubao',
        'kimiwork',
        'marvis',
      ]) {
        expect(manager.cliTools).not.toContain(tool);
      }
    });
  });

  describe('syncSkillToCLI', () => {
    it('returns dry-run result without touching the file system', async () => {
      const result = await manager.syncSkillToCLI('/tmp/skill', 'test-skill', 'workbuddy', {
        dryRun: true,
      });

      expect(result).toEqual({
        success: true,
        cliName: 'workbuddy',
        dryRun: true,
        reason: 'Dry run - would sync',
      });
    });

    it('returns not-installed reason when the CLI home directory is missing', async () => {
      const spy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      try {
        const result = await manager.syncSkillToCLI('/tmp/skill', 'test-skill', 'codex', {});

        expect(result).toEqual({
          success: false,
          cliName: 'codex',
          reason: 'CLI not installed',
        });
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('checkDeploymentStatus', () => {
    it('reports cliInstalled=true and deployed=false for installed workbuddy without skill', () => {
      const spy = jest.spyOn(fs, 'existsSync');
      spy.mockImplementation((p) => p.endsWith('.workbuddy'));
      try {
        const status = manager.checkDeploymentStatus('test-skill');

        expect(status.workbuddy.cliInstalled).toBe(true);
        expect(status.workbuddy.deployed).toBe(false);
        expect(status.workbuddy.path).toBe(
          path.join('C:\\Users\\testuser', '.workbuddy', 'skills', 'test-skill'),
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('reports deployed=true when skill directory exists', () => {
      const spy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      try {
        const status = manager.checkDeploymentStatus('test-skill');

        expect(status.workbuddy.deployed).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });
  });
});