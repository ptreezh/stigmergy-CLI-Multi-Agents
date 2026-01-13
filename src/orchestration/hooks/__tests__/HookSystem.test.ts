/**
 * Hook 系统测试
 * 测试 Hook 的安装、执行和管理功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { HookSystem, HookStatus } from '../HookSystem';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('HookSystem', () => {
  let hookSystem: HookSystem;
  let testHooksDir: string;

  beforeEach(() => {
    hookSystem = new HookSystem();
    // 创建临时测试目录
    testHooksDir = path.join(os.tmpdir(), `test-hooks-${Date.now()}`);
  });

  afterEach(async () => {
    // 清理测试目录
    try {
      await fs.rm(testHooksDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('installCoordinationHooks', () => {
    it('应该为 CLI 安装所有协调 Hook', async () => {
      const cliName = 'claude';
      
      // 模拟 Hook 目录
      const hooksDir = testHooksDir;
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      // 验证所有 Hook 文件都已创建
      const files = await fs.readdir(hooksDir);
      expect(files).toContain('task-detection.js');
      expect(files).toContain('lock-acquisition.js');
      expect(files).toContain('lock-release.js');
      expect(files).toContain('conflict-detection.js');
    });

    it('应该为不同 CLI 创建不同的 Hook 内容', async () => {
      const cli1 = 'claude';
      const cli2 = 'gemini';
      
      const hooksDir1 = path.join(testHooksDir, cli1);
      const hooksDir2 = path.join(testHooksDir, cli2);
      
      await hookSystem.installCoordinationHooks(cli1, hooksDir1);
      await hookSystem.installCoordinationHooks(cli2, hooksDir2);
      
      // 读取两个 CLI 的任务检测 Hook
      const hook1 = await fs.readFile(path.join(hooksDir1, 'task-detection.js'), 'utf8');
      const hook2 = await fs.readFile(path.join(hooksDir2, 'task-detection.js'), 'utf8');
      
      // 验证 Hook 内容包含各自的 CLI 名称
      expect(hook1).toContain('claude');
      expect(hook2).toContain('gemini');
      expect(hook1).not.toBe(hook2);
    });

    it('应该在 Hook 目录不存在时创建', async () => {
      const cliName = 'claude';
      const hooksDir = path.join(testHooksDir, 'nonexistent', 'nested', 'dir');
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      // 验证目录已创建
      const files = await fs.readdir(hooksDir);
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('generateTaskDetectionHook', () => {
    it('应该生成有效的任务检测 Hook', async () => {
      const cliName = 'claude';
      const hookContent = hookSystem['generateTaskDetectionHook'](cliName);
      
      // 验证 Hook 包含必要的函数
      expect(hookContent).toContain('module.exports');
      expect(hookContent).toContain('loadCoordinationContext');
      expect(hookContent).toContain('matched');
      expect(hookContent).toContain(cliName);
    });

    it('应该生成可以执行的 Hook 代码', () => {
      const cliName = 'claude';
      const hookContent = hookSystem['generateTaskDetectionHook'](cliName);
      
      // 验证代码语法正确
      expect(() => {
        // 尝试解析代码（不执行）
        new Function(hookContent);
      }).not.toThrow();
    });
  });

  describe('generateLockAcquisitionHook', () => {
    it('应该生成有效的锁获取 Hook', () => {
      const cliName = 'claude';
      const hookContent = hookSystem['generateLockAcquisitionHook'](cliName);
      
      // 验证 Hook 包含必要的函数
      expect(hookContent).toContain('module.exports');
      expect(hookContent).toContain('acquireLock');
      expect(hookContent).toContain('taskId');
      expect(hookContent).toContain('subtaskId');
      expect(hookContent).toContain(cliName);
    });

    it('应该包含错误处理', () => {
      const cliName = 'claude';
      const hookContent = hookSystem['generateLockAcquisitionHook'](cliName);
      
      expect(hookContent).toContain('throw new Error');
      expect(hookContent).toContain('Failed to acquire lock');
    });
  });

  describe('generateLockReleaseHook', () => {
    it('应该生成有效的锁释放 Hook', () => {
      const cliName = 'claude';
      const hookContent = hookSystem['generateLockReleaseHook'](cliName);
      
      // 验证 Hook 包含必要的函数
      expect(hookContent).toContain('module.exports');
      expect(hookContent).toContain('releaseLock');
      expect(hookContent).toContain('taskId');
      expect(hookContent).toContain('subtaskId');
      expect(hookContent).toContain('result');
    });
  });

  describe('generateConflictDetectionHook', () => {
    it('应该生成有效的冲突检测 Hook', () => {
      const cliName = 'claude';
      const hookContent = hookSystem['generateConflictDetectionHook'](cliName);
      
      // 验证 Hook 包含必要的函数
      expect(hookContent).toContain('module.exports');
      expect(hookContent).toContain('detectConflicts');
      expect(hookContent).toContain('modifiedFiles');
    });
  });

  describe('checkHookStatus', () => {
    it('应该返回已安装 Hook 的状态', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      const status = await hookSystem.checkHookStatus(cliName, hooksDir);
      
      expect(status.cliName).toBe(cliName);
      expect(status.hooks.taskDetection).toBe(true);
      expect(status.hooks.lockAcquisition).toBe(true);
      expect(status.hooks.lockRelease).toBe(true);
      expect(status.hooks.conflictDetection).toBe(true);
    });

    it('应该返回未安装 Hook 的状态', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      // 不安装任何 Hook
      const status = await hookSystem.checkHookStatus(cliName, hooksDir);
      
      expect(status.cliName).toBe(cliName);
      expect(status.hooks.taskDetection).toBe(false);
      expect(status.hooks.lockAcquisition).toBe(false);
      expect(status.hooks.lockRelease).toBe(false);
      expect(status.hooks.conflictDetection).toBe(false);
    });
  });

  describe('removeHooks', () => {
    it('应该删除所有已安装的 Hook', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      // 验证 Hook 已安装
      let files = await fs.readdir(hooksDir);
      expect(files.length).toBeGreaterThan(0);
      
      // 删除 Hook
      await hookSystem.removeHooks(cliName, hooksDir);
      
      // 验证 Hook 已删除
      files = await fs.readdir(hooksDir);
      expect(files.length).toBe(0);
    });

    it('应该在 Hook 目录不存在时不报错', async () => {
      const cliName = 'claude';
      const hooksDir = path.join(testHooksDir, 'nonexistent');
      
      await expect(
        hookSystem.removeHooks(cliName, hooksDir)
      ).resolves.not.toThrow();
    });
  });

  describe('executeHook', () => {
    it('应该执行任务检测 Hook', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      const result = await hookSystem.executeHook(cliName, hooksDir, 'task-detection', {
        input: 'test input',
        metadata: {}
      });
      
      expect(result).toBeDefined();
      expect(result.matched).toBeDefined();
    });

    it('应该执行锁获取 Hook', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      const result = await hookSystem.executeHook(cliName, hooksDir, 'lock-acquisition', {
        taskId: 'task-1',
        subtaskId: 'subtask-1'
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('应该执行锁释放 Hook', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      await hookSystem.installCoordinationHooks(cliName, hooksDir);
      
      const result = await hookSystem.executeHook(cliName, hooksDir, 'lock-release', {
        taskId: 'task-1',
        subtaskId: 'subtask-1',
        result: { success: true }
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('应该在 Hook 不存在时抛出错误', async () => {
      const cliName = 'claude';
      const hooksDir = testHooksDir;
      
      // 不安装 Hook
      await expect(
        hookSystem.executeHook(cliName, hooksDir, 'task-detection', {})
      ).rejects.toThrow();
    });
  });
});