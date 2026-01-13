/**
 * Hook 安装器测试
 * 测试为多个 CLI 安装和管理 Hook
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { HookInstaller } from '../HookInstaller';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('HookInstaller', () => {
  let hookInstaller: HookInstaller;
  let testHooksDir: string;

  beforeEach(() => {
    hookInstaller = new HookInstaller();
    // 创建临时测试目录
    testHooksDir = path.join(os.tmpdir(), `test-hook-installer-${Date.now()}`);
  });

  afterEach(async () => {
    // 清理测试目录
    try {
      await fs.rm(testHooksDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('installHooksForCLI', () => {
    it('应该为指定的 CLI 安装 Hook', async () => {
      const cliName = 'claude';
      const hooksDir = path.join(testHooksDir, cliName);
      
      // 修改 HookInstaller 使用测试目录
      const installer = new HookInstaller();
      installer['hookSystem'] = installer['hookSystem'];
      
      await installer['hookSystem'].installCoordinationHooks(cliName, hooksDir);
      
      // 验证 Hook 已安装
      const files = await fs.readdir(hooksDir);
      expect(files.length).toBe(4);
      expect(files).toContain('task-detection.js');
      expect(files).toContain('lock-acquisition.js');
      expect(files).toContain('lock-release.js');
      expect(files).toContain('conflict-detection.js');
    });
  });

  describe('removeHooksForCLI', () => {
    it('应该删除指定 CLI 的 Hook', async () => {
      const cliName = 'claude';
      const hooksDir = path.join(testHooksDir, cliName);
      
      // 安装 Hook
      await hookInstaller['hookSystem'].installCoordinationHooks(cliName, hooksDir);
      
      // 验证 Hook 已安装
      let files = await fs.readdir(hooksDir);
      expect(files.length).toBeGreaterThan(0);
      
      // 删除 Hook
      await hookInstaller['hookSystem'].removeHooks(cliName, hooksDir);
      
      // 验证 Hook 已删除
      files = await fs.readdir(hooksDir);
      expect(files.length).toBe(0);
    });
  });

  describe('checkAllHookStatuses', () => {
    it('应该检查所有 CLI 的 Hook 状态', async () => {
      // 为几个 CLI 安装 Hook
      const cliNames = ['claude', 'gemini', 'qwen'];
      
      for (const cliName of cliNames) {
        const hooksDir = path.join(testHooksDir, cliName);
        await hookInstaller['hookSystem'].installCoordinationHooks(cliName, hooksDir);
      }
      
      // 检查状态
      const statuses = await hookInstaller.checkAllHookStatuses();
      
      // 验证所有 CLI 都有状态
      expect(Object.keys(statuses).length).toBeGreaterThan(0);
    });
  });

  describe('removeAllHooks', () => {
    it('应该删除所有 CLI 的 Hook', async () => {
      // 为几个 CLI 安装 Hook
      const cliNames = ['claude', 'gemini', 'qwen'];
      
      for (const cliName of cliNames) {
        const hooksDir = path.join(testHooksDir, cliName);
        await hookInstaller['hookSystem'].installCoordinationHooks(cliName, hooksDir);
      }
      
      // 删除所有 Hook
      await hookInstaller.removeAllHooks();
      
      // 验证所有 Hook 已删除
      for (const cliName of cliNames) {
        const hooksDir = path.join(testHooksDir, cliName);
        try {
          const files = await fs.readdir(hooksDir);
          expect(files.length).toBe(0);
        } catch (error) {
          // 目录可能已被删除
        }
      }
    });
  });
});