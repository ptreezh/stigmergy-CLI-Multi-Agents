/**
 * Hook System
 * 钩子系统
 * 负责钩子的注册、执行和管理
 */

import { randomUUID } from 'crypto';
import {
  Hook,
  HookContext,
  HookExecutionResult,
  HookPhase,
  HookSystemOptions,
  HookSystemStatistics,
} from './hook-types';

export class HookSystem {
  private hooks: Map<string, Hook> = new Map();
  private hooksByPhase: Map<HookPhase, string[]> = new Map();
  private executionHistory: HookExecutionResult[] = [];

  private statistics: HookSystemStatistics = {
    totalHooks: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    hooksByPhase: {
      before: 0,
      after: 0,
      error: 0,
    },
    executionsByHook: {},
  };

  private executionTimes: number[] = [];

  private options: Required<HookSystemOptions>;

  constructor(options: HookSystemOptions = {}) {
    this.options = {
      enableExecutionHistory: options.enableExecutionHistory !== false,
      maxHistorySize: options.maxHistorySize || 100,
    };
  }

  /**
   * 注册钩子
   */
  async registerHook<T = any>(hookData: Omit<Hook<T>, 'id' | 'enabled'>): Promise<string> {
    const validPhases: HookPhase[] = ['before', 'after', 'error'];
    if (!validPhases.includes(hookData.phase)) {
      throw new Error('Invalid hook phase');
    }

    const hookId = randomUUID();
    const hook: Hook<T> = {
      ...hookData,
      id: hookId,
      enabled: true,
    };

    this.hooks.set(hookId, hook);

    if (!this.hooksByPhase.has(hookData.phase)) {
      this.hooksByPhase.set(hookData.phase, []);
    }

    this.hooksByPhase.get(hookData.phase)!.push(hookId);

    // Update statistics
    this.statistics.totalHooks++;
    this.statistics.hooksByPhase[hookData.phase]++;

    return hookId;
  }

  /**
   * 取消注册钩子
   */
  async unregisterHook(hookId: string): Promise<void> {
    const hook = this.hooks.get(hookId);
    if (!hook) {
      throw new Error('Hook not found');
    }

    // Remove from hooks map
    this.hooks.delete(hookId);

    // Remove from phase map
    const phaseHooks = this.hooksByPhase.get(hook.phase);
    if (phaseHooks) {
      const index = phaseHooks.indexOf(hookId);
      if (index !== -1) {
        phaseHooks.splice(index, 1);
      }
    }

    // Update statistics
    this.statistics.totalHooks--;
    this.statistics.hooksByPhase[hook.phase]--;
  }

  /**
   * 启用钩子
   */
  async enableHook(hookId: string): Promise<void> {
    const hook = this.hooks.get(hookId);
    if (!hook) {
      throw new Error('Hook not found');
    }

    hook.enabled = true;
  }

  /**
   * 禁用钩子
   */
  async disableHook(hookId: string): Promise<void> {
    const hook = this.hooks.get(hookId);
    if (!hook) {
      throw new Error('Hook not found');
    }

    hook.enabled = false;
  }

  /**
   * 执行钩子
   */
  async executeHooks<T = any>(
    phase: HookPhase,
    context: HookContext,
    data?: T
  ): Promise<HookExecutionResult[]> {
    const hookIds = this.hooksByPhase.get(phase) || [];
    if (hookIds.length === 0) {
      return [];
    }

    const results: HookExecutionResult[] = [];
    const errors: Error[] = [];

    // Sort hooks by priority (lower priority executes first)
    const sortedHooks = hookIds
      .map(id => this.hooks.get(id)!)
      .filter(hook => hook.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const hook of sortedHooks) {
      const startTime = Date.now();
      try {
        await hook.handler(context, data);

        const duration = Date.now() - startTime;
        results.push({
          hookId: hook.id,
          hookName: hook.name,
          success: true,
          duration,
        });

        this.statistics.successfulExecutions++;
        this.updateExecutionTime(duration);
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          hookId: hook.id,
          hookName: hook.name,
          success: false,
          error: error as Error,
          duration,
        });

        errors.push(error as Error);
        this.statistics.failedExecutions++;
        this.updateExecutionTime(duration);
      }

      this.statistics.totalExecutions++;
      this.statistics.executionsByHook[hook.id] =
        (this.statistics.executionsByHook[hook.id] || 0) + 1;
    }

    // If there were errors, execute error hooks
    if (errors.length > 0 && phase !== 'error') {
      await this.executeHooks('error', context, { errors, originalPhase: phase });
    }

    // Record execution history
    if (this.options.enableExecutionHistory) {
      this.executionHistory.push(...results);
      if (this.executionHistory.length > this.options.maxHistorySize) {
        this.executionHistory.splice(0, this.executionHistory.length - this.options.maxHistorySize);
      }
    }

    return results;
  }

  /**
   * 获取所有钩子
   */
  async getHooks(): Promise<Hook[]> {
    return Array.from(this.hooks.values());
  }

  /**
   * 按阶段获取钩子
   */
  async getHooksByPhase(phase: HookPhase): Promise<Hook[]> {
    const hookIds = this.hooksByPhase.get(phase) || [];
    return hookIds.map(id => this.hooks.get(id)!).filter(hook => hook !== undefined);
  }

  /**
   * 获取钩子
   */
  async getHook(hookId: string): Promise<Hook | null> {
    return this.hooks.get(hookId) || null;
  }

  /**
   * 获取执行历史
   */
  async getExecutionHistory(): Promise<HookExecutionResult[]> {
    if (!this.options.enableExecutionHistory) {
      return [];
    }

    return [...this.executionHistory];
  }

  /**
   * 清除执行历史
   */
  async clearExecutionHistory(): Promise<void> {
    this.executionHistory = [];
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<HookSystemStatistics> {
    return { ...this.statistics };
  }

  /**
   * 清除所有钩子和历史
   */
  async clearAll(): Promise<void> {
    this.hooks.clear();
    this.hooksByPhase.clear();
    this.executionHistory = [];

    this.statistics = {
      totalHooks: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      hooksByPhase: {
        before: 0,
        after: 0,
        error: 0,
      },
      executionsByHook: {},
    };

    this.executionTimes = [];
  }

  /**
   * 更新执行时间统计
   */
  private updateExecutionTime(duration: number): void {
    this.executionTimes.push(duration);
    if (this.executionTimes.length > 100) {
      this.executionTimes.shift();
    }
    this.statistics.averageExecutionTime =
      this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
  }
}