/**
 * Hook 安装器
 * 为所有支持的 CLI 安装协调 Hook
 */

import { HookSystem } from './HookSystem';
import { CLI_HOOKS_DIR } from '../config';

export class HookInstaller {
  private hookSystem: HookSystem;

  constructor() {
    this.hookSystem = new HookSystem();
  }

  /**
   * 为所有支持的 CLI 安装 Hook
   */
  async installAllHooks(): Promise<void> {
    const cliNames = Object.keys(CLI_HOOKS_DIR);
    
    for (const cliName of cliNames) {
      const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
      
      try {
        await this.hookSystem.installCoordinationHooks(cliName, hooksDir);
        console.log(`✓ Installed hooks for ${cliName}`);
      } catch (error) {
        console.error(`✗ Failed to install hooks for ${cliName}:`, error);
      }
    }
  }

  /**
   * 为指定的 CLI 安装 Hook
   */
  async installHooksForCLI(cliName: string): Promise<void> {
    const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
    
    if (!hooksDir) {
      throw new Error(`No hooks directory configured for ${cliName}`);
    }
    
    await this.hookSystem.installCoordinationHooks(cliName, hooksDir);
  }

  /**
   * 检查所有 CLI 的 Hook 状态
   */
  async checkAllHookStatuses(): Promise<Record<string, any>> {
    const cliNames = Object.keys(CLI_HOOKS_DIR);
    const statuses: Record<string, any> = {};
    
    for (const cliName of cliNames) {
      const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
      
      try {
        const status = await this.hookSystem.checkHookStatus(cliName, hooksDir);
        statuses[cliName] = status;
      } catch (error) {
        statuses[cliName] = {
          cliName,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return statuses;
  }

  /**
   * 删除所有 CLI 的 Hook
   */
  async removeAllHooks(): Promise<void> {
    const cliNames = Object.keys(CLI_HOOKS_DIR);
    
    for (const cliName of cliNames) {
      const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
      
      try {
        await this.hookSystem.removeHooks(cliName, hooksDir);
        console.log(`✓ Removed hooks for ${cliName}`);
      } catch (error) {
        console.error(`✗ Failed to remove hooks for ${cliName}:`, error);
      }
    }
  }

  /**
   * 删除指定 CLI 的 Hook
   */
  async removeHooksForCLI(cliName: string): Promise<void> {
    const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
    
    if (!hooksDir) {
      throw new Error(`No hooks directory configured for ${cliName}`);
    }
    
    await this.hookSystem.removeHooks(cliName, hooksDir);
  }
}