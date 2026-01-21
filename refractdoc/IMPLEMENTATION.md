# Stigmergy CLI 多智能体编排系统 - 实施计划文档

## 文档层次结构

本文档位于规范化文档体系的核心文档层。

### 依赖关系
- 依赖: REQUIREMENTS.md, DESIGN.md
- 被依赖: 无

### 文档用途
定义 Stigmergy CLI 多智能体编排系统的详细实施计划，包括实施阶段、实施步骤、测试策略、部署流程和验收标准。

## 相关文档
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 需求文档
- [DESIGN.md](./DESIGN.md) - 设计文档
- [CORE_CONCEPTS.md](./CORE_CONCEPTS.md) - 核心概念
- [ARCHITECTURE_RIGOROUS_ANALYSIS.md](./ARCHITECTURE_RIGOROUS_ANALYSIS.md) - 架构严格论证
- [DOCUMENT_RELATIONSHIP_MAP.md](./DOCUMENT_RELATIONSHIP_MAP.md) - 文档关系图
- [CONSISTENCY_CHECK_REPORT.md](./CONSISTENCY_CHECK_REPORT.md) - 一致性检测报告
- [DOCUMENT_CONSTRAINTS.md](./DOCUMENT_CONSTRAINTS.md) - 文档约束和验证规则

## 变更历史

| 版本 | 日期 | 作者 | 变更内容 | 影响范围 |
|------|------|------|---------|---------|
| v1.0 | 2026-01-13 | iFlow CLI | 初始版本 | 所有章节 |

## 1. 概述

### 1.1 目的
本文档定义了 Stigmergy CLI 多智能体编排系统的详细实施计划，包括实施阶段、实施步骤、测试策略、部署流程和验收标准。

### 1.2 范围
- 6 个实施阶段，总计 8-12 周
- 详细实施步骤和任务分解
- 完整的测试策略和测试用例
- 部署流程和回滚策略
- 风险管理和缓解措施
- 验收标准和成功指标

### 1.3 目标
- 确保新功能不影响现有功能
- 提供清晰的实施路径
- 确保代码质量和测试覆盖率
- 提供完整的文档和培训材料

## 2. 实施阶段规划

### 阶段 1: 基础架构（2-3 周）

#### 目标
- 搭建核心架构框架
- 实现基本的数据结构
- 建立开发环境

#### 关键任务

**任务 1.1: 创建项目结构**
- 创建 `src/orchestration/` 目录
- 创建 `src/orchestration/core/` 目录
- 创建 `src/orchestration/managers/` 目录
- 创建 `src/orchestration/hooks/` 目录
- 创建 `src/orchestration/events/` 目录
- 创建 `src/orchestration/utils/` 目录

**预期产出**:
- 完整的项目目录结构
- TypeScript 配置文件
- 测试配置文件

**验收标准**:
- 项目结构符合设计文档
- TypeScript 编译通过
- 测试框架配置完成

---

**任务 1.2: 实现核心数据结构**

**文件**: `src/orchestration/types/index.ts`

```typescript
// 任务类型
export type TaskType = 'feature' | 'bug-fix' | 'refactoring' | 'documentation' | 'testing';

// 子任务类型
export type SubTaskType = 'code-generation' | 'code-review' | 'testing' | 'documentation' | 'configuration';

// 锁状态
export type LockState = 'pending' | 'in-progress' | 'completed' | 'failed' | 'error';

// 任务接口
export interface Task {
  id: string;
  description: string;
  type: TaskType;
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  dependencies: string[];
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

// 子任务接口
export interface SubTask {
  id: string;
  taskId: string;
  description: string;
  type: SubTaskType;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  requiredSkills: string[];
  requiredAgent: string | null;
  mcpTools: string[];
  requiredFiles: string[];
  outputFiles: string[];
  assignedCLI: string | null;
  status: LockState;
  createdAt: Date;
  completedAt?: Date;
}

// 编排任务接口
export interface OrchestratedTask {
  id: string;
  task: Task;
  subtasks: SubTask[];
  strategy: OrchestrationStrategy;
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

// 编排策略接口
export interface OrchestrationStrategy {
  mode: 'parallel' | 'sequential' | 'hybrid';
  parallelGroups?: ParallelGroup[];
  dependencies: Dependency[];
  concurrencyLimit?: number;
}

// 并行组接口
export interface ParallelGroup {
  groupId: string;
  tasks: SubTask[];
  mode: 'parallel';
  dependencies: Dependency[];
}

// 依赖关系接口
export interface Dependency {
  from: string;
  to: string;
  type: 'hard' | 'soft';
}

// CLI 选择接口
export interface CLISelection {
  cliName: string;
  agent: string;
  skills: string[];
  mcpTools: string[];
  confidence: number;
}

// Worktree 接口
export interface Worktree {
  taskId: string;
  subtaskId: string;
  worktreePath: string;
  branch: string;
  createdAt: Date;
  status: 'active' | 'merged' | 'removed';
}

// 状态锁接口
export interface StateLock {
  subtaskId: string;
  cliName: string;
  status: LockState;
  acquiredAt?: Date;
  releasedAt?: Date;
  errorMessage?: string;
}

// 事件接口
export interface Event {
  id: string;
  type: EventType;
  timestamp: Date;
  source: string;
  data: any;
  correlationId?: string;
}

// 事件类型
export type EventType = 
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'task.paused'
  | 'task.resumed'
  | 'lock.acquired'
  | 'lock.released'
  | 'lock.failed'
  | 'lock.timeout'
  | 'worktree.created'
  | 'worktree.merged'
  | 'worktree.removed'
  | 'worktree.conflict'
  | 'terminal.started'
  | 'terminal.completed'
  | 'terminal.failed'
  | 'terminal.crashed'
  | 'conflict.detected'
  | 'error.occurred';

// 终端接口
export interface Terminal {
  id: string;
  subtaskId: string;
  cliName: string;
  command: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'crashed';
  pid?: number;
  createdAt: Date;
  completedAt?: Date;
  output: string;
  error?: string;
}

// 共享上下文接口
export interface SharedContext {
  taskId: string;
  projectPath: string;
  taskDescription: string;
  constraints: string[];
  previousResults: Map<string, any>;
  dependencies: Dependency[];
  metadata: Record<string, any>;
}
```

**预期产出**:
- 完整的 TypeScript 类型定义
- 类型文档和注释

**验收标准**:
- 所有接口定义完整
- TypeScript 编译通过
- 类型文档完整

---

**任务 1.3: 实现配置管理**

**文件**: `src/orchestration/config/index.ts`

```typescript
import path from 'path';
import os from 'os';

// 协调目录配置
export const COORDINATION_DIR = '.stigmergy/coordination';

// 文件路径配置
export const FILE_PATHS = {
  taskRegistry: path.join(COORDINATION_DIR, 'task-registry.json'),
  stateLocks: path.join(COORDINATION_DIR, 'state-locks.json'),
  sharedContext: path.join(COORDINATION_DIR, 'shared-context.json'),
  eventLog: path.join(COORDINATION_DIR, 'event-log.json'),
  worktreeRegistry: path.join(COORDINATION_DIR, 'worktree-registry.json'),
  terminalSessions: path.join(COORDINATION_DIR, 'terminal-sessions.json'),
  history: path.join(COORDINATION_DIR, 'history')
};

// CLI Hook 目录配置
export const CLI_HOOKS_DIR = {
  claude: path.join(os.homedir(), '.claude', '.stigmergy', 'hooks'),
  gemini: path.join(os.homedir(), '.gemini', '.stigmergy', 'hooks'),
  iflow: path.join(os.homedir(), '.iflow', '.stigmergy', 'hooks'),
  opencode: path.join(os.homedir(), '.opencode', '.stigmergy', 'hooks'),
  qwen: path.join(os.homedir(), '.qwen', '.stigmergy', 'hooks'),
  codebuddy: path.join(os.homedir(), '.codebuddy', '.stigmergy', 'hooks'),
  copilot: path.join(os.homedir(), '.copilot', '.stigmergy', 'hooks'),
  codex: path.join(os.homedir(), '.codex', '.stigmergy', 'hooks')
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  maxConcurrency: 8,
  maxWorktrees: 16,
  taskTimeout: 30 * 60 * 1000, // 30 分钟
  lockTimeout: 5 * 60 * 1000,   // 5 分钟
  terminalStartupTimeout: 5 * 1000, // 5 秒
  worktreeCreationTimeout: 10 * 1000, // 10 秒
  eventLogRetention: 7 * 24 * 60 * 60 * 1000 // 7 天
};

// CLI 参数映射
export const CLI_PARAM_MAPPINGS = {
  claude: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` Bash("stigmergy skill read ${skills[0]}")`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-claude.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  },
  gemini: {
    agent: (agent: string) => ` --model ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-gemini.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  },
  iflow: {
    agent: (agent: string) => ` -p "请使用${agent}智能体"`,
    skills: (skills: string[]) => ` -p "请使用${skills.join('、')}技能"`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-iflow.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  },
  opencode: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-opencode.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  }
};

// CLI 能力矩阵
export const CLI_CAPABILITY_MATRIX = {
  claude: {
    strengths: ['code-generation', 'code-review', 'debugging', 'architecture'],
    weaknesses: ['frontend-ui', 'creative-writing'],
    model: 'claude-3-5-sonnet',
    cost: 'high',
    quality: 'high'
  },
  gemini: {
    strengths: ['frontend-ui', 'creative-writing', 'multimodal'],
    weaknesses: ['backend-logic', 'database-design'],
    model: 'gemini-2.0-flash',
    cost: 'low',
    quality: 'medium'
  },
  iflow: {
    strengths: ['chinese-docs', 'backend-logic', 'system-design'],
    weaknesses: ['frontend-ui', 'creative-writing'],
    model: 'qwen-2.5-72b',
    cost: 'low',
    quality: 'medium'
  },
  opencode: {
    strengths: ['code-generation', 'code-review', 'refactoring', 'testing'],
    weaknesses: ['creative-writing', 'multimodal'],
    model: 'claude-3-5-sonnet',
    cost: 'high',
    quality: 'high'
  }
};
```

**预期产出**:
- 完整的配置管理模块
- 配置文档和注释

**验收标准**:
- 配置模块功能完整
- 配置文档清晰
- 单元测试通过

---

**任务 1.4: 实现事件总线**

**文件**: `src/orchestration/events/EventBus.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { Event, EventType } from '../types';
import { FILE_PATHS } from '../config';

export type EventHandler = (event: Event) => Promise<void> | void;

export class EventBus {
  private eventLog: Event[] = [];
  private subscribers: Map<EventType, EventHandler[]> = new Map();
  private logFile: string = FILE_PATHS.eventLog;
  private isListening: boolean = false;

  /**
   * 发布事件
   */
  async publish(event: Event): Promise<void> {
    // 1. 记录到内存
    this.eventLog.push(event);
    
    // 2. 持久化到文件
    await this.persistEvent(event);
    
    // 3. 通知所有订阅者
    const handlers = this.subscribers.get(event.type) || [];
    await Promise.all(
      handlers.map(handler => 
        handler(event).catch(error => 
          console.error(`Event handler error for ${event.type}:`, error)
        )
      )
    );
  }

  /**
   * 订阅事件
   */
  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);
  }

  /**
   * 取消订阅
   */
  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 启动监听
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      return;
    }
    
    // 确保日志目录存在
    const logDir = path.dirname(this.logFile);
    await fs.mkdir(logDir, { recursive: true });
    
    this.isListening = true;
  }

  /**
   * 停止监听
   */
  stopListening(): void {
    this.isListening = false;
  }

  /**
   * 获取事件日志
   */
  async getEventLog(since?: Date): Promise<Event[]> {
    if (!since) {
      return [...this.eventLog];
    }
    
    return this.eventLog.filter(event => 
      new Date(event.timestamp) >= since
    );
  }

  /**
   * 清除事件日志
   */
  async clearEventLog(): Promise<void> {
    this.eventLog = [];
    await fs.unlink(this.logFile).catch(() => {});
  }

  /**
   * 持久化事件
   */
  private async persistEvent(event: Event): Promise<void> {
    try {
      await fs.appendFile(
        this.logFile,
        JSON.stringify(event) + '\n',
        'utf8'
      );
    } catch (error) {
      console.error('Failed to persist event:', error);
    }
  }

  /**
   * 加载事件日志
   */
  async loadEventLog(): Promise<Event[]> {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 清理过期事件
   */
  async cleanupExpiredEvents(): Promise<void> {
    const retentionTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 天
    const validEvents = this.eventLog.filter(
      event => new Date(event.timestamp).getTime() > retentionTime
    );
    
    this.eventLog = validEvents;
    
    // 重写日志文件
    await fs.writeFile(
      this.logFile,
      validEvents.map(e => JSON.stringify(e)).join('\n'),
      'utf8'
    ).catch(() => {});
  }
}
```

**预期产出**:
- 完整的事件总线实现
- 单元测试套件

**验收标准**:
- 事件发布和订阅功能正常
- 事件日志持久化正常
- 单元测试覆盖率 > 80%

---

**任务 1.5: 实现状态锁管理器**

**文件**: `src/orchestration/managers/StateLockManager.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { SubTask, StateLock, LockState } from '../types';
import { FILE_PATHS } from '../config';

export interface LockAcquisitionResult {
  success: boolean;
  errorMessage?: string;
}

export class StateLockManager {
  private locksFile: string = FILE_PATHS.stateLocks;
  private locks: Map<string, Map<string, StateLock>> = new Map();

  /**
   * 初始化任务的状态锁
   */
  async initializeTask(taskId: string, subtasks: SubTask[]): Promise<void> {
    const taskLocks: Record<string, StateLock> = {};
    
    for (const subtask of subtasks) {
      taskLocks[subtask.id] = {
        subtaskId: subtask.id,
        cliName: subtask.assignedCLI || 'unknown',
        status: 'pending'
      };
    }
    
    this.locks.set(taskId, new Map(Object.entries(taskLocks)));
    await this.saveLocks();
  }

  /**
   * 尝试获取锁（原子操作）
   */
  async acquireLock(
    taskId: string, 
    subtaskId: string, 
    cliName: string
  ): Promise<LockAcquisitionResult> {
    // 1. 加载最新锁状态
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      return { success: false, errorMessage: 'Task not found' };
    }
    
    const lock = taskLocks.get(subtaskId);
    if (!lock) {
      return { success: false, errorMessage: 'Subtask not found' };
    }
    
    // 2. 检查锁状态
    if (lock.status === 'in-progress') {
      return { success: false, errorMessage: 'Lock already acquired' };
    }
    
    // 3. 检查依赖
    const subtask = await this.getSubtask(taskId, subtaskId);
    if (!subtask) {
      return { success: false, errorMessage: 'Subtask not found' };
    }
    
    const dependenciesMet = this.checkDependencies(taskId, subtask.dependencies);
    if (!dependenciesMet) {
      return { success: false, errorMessage: 'Dependencies not met' };
    }
    
    // 4. 检查文件锁
    const fileLocks = await this.checkFileLocks(subtask.requiredFiles, taskId);
    if (fileLocks.length > 0) {
      return { 
        success: false, 
        errorMessage: `Files locked: ${fileLocks.join(', ')}` 
      };
    }
    
    // 5. 获取锁
    lock.status = 'in-progress';
    lock.acquiredAt = new Date();
    lock.cliName = cliName;
    
    taskLocks.set(subtaskId, lock);
    this.locks.set(taskId, taskLocks);
    
    await this.saveLocks();
    
    return { success: true };
  }

  /**
   * 释放锁
   */
  async releaseLock(
    taskId: string, 
    subtaskId: string, 
    result: any
  ): Promise<void> {
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      throw new Error('Task not found');
    }
    
    const lock = taskLocks.get(subtaskId);
    if (!lock) {
      throw new Error('Subtask not found');
    }
    
    // 更新锁状态
    lock.status = result.success ? 'completed' : 'failed';
    lock.releasedAt = new Date();
    if (!result.success) {
      lock.errorMessage = result.error;
    }
    
    taskLocks.set(subtaskId, lock);
    this.locks.set(taskId, taskLocks);
    
    await this.saveLocks();
  }

  /**
   * 检查依赖
   */
  private checkDependencies(
    taskId: string, 
    dependencies: string[]
  ): boolean {
    if (dependencies.length === 0) {
      return true;
    }
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      return false;
    }
    
    return dependencies.every(depId => {
      const depLock = taskLocks.get(depId);
      return depLock && depLock.status === 'completed';
    });
  }

  /**
   * 检查文件锁
   */
  private async checkFileLocks(
    files: string[], 
    currentTaskId: string
  ): Promise<string[]> {
    const lockedFiles: string[] = [];
    
    for (const taskId of this.locks.keys()) {
      if (taskId === currentTaskId) {
        continue;
      }
      
      const taskLocks = this.locks.get(taskId);
      if (!taskLocks) {
        continue;
      }
      
      for (const lock of taskLocks.values()) {
        if (lock.status === 'in-progress') {
          // 检查文件交集
          const subtask = await this.getSubtask(taskId, lock.subtaskId);
          if (subtask) {
            const intersection = subtask.requiredFiles.filter(f => 
              files.includes(f)
            );
            lockedFiles.push(...intersection);
          }
        }
      }
    }
    
    return [...new Set(lockedFiles)];
  }

  /**
   * 获取子任务状态
   */
  async getSubtaskStates(taskId: string): Promise<StateLock[]> {
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      return [];
    }
    
    return Array.from(taskLocks.values());
  }

  /**
   * 检测死锁
   */
  async detectDeadlock(): Promise<string | null> {
    // 简化的死锁检测
    // 实际实现应该使用图算法检测循环依赖
    await this.loadLocks();
    
    for (const [taskId, taskLocks] of this.locks.entries()) {
      const inProgressLocks = Array.from(taskLocks.values())
        .filter(lock => lock.status === 'in-progress');
      
      if (inProgressLocks.length > 0) {
        const subtask = await this.getSubtask(taskId, inProgressLocks[0].subtaskId);
        if (subtask && subtask.dependencies.length > 0) {
          // 检查是否存在循环依赖
          for (const depId of subtask.dependencies) {
            const depLock = taskLocks.get(depId);
            if (depLock && depLock.status === 'in-progress') {
              const depSubtask = await this.getSubtask(taskId, depId);
              if (depSubtask && depSubtask.dependencies.includes(subtask.id)) {
                return `Deadlock detected between ${subtask.id} and ${depId}`;
              }
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * 强制释放锁
   */
  async forceReleaseLock(taskId: string, subtaskId: string): Promise<void> {
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      throw new Error('Task not found');
    }
    
    const lock = taskLocks.get(subtaskId);
    if (!lock) {
      throw new Error('Subtask not found');
    }
    
    lock.status = 'failed';
    lock.releasedAt = new Date();
    lock.errorMessage = 'Force released';
    
    taskLocks.set(subtaskId, lock);
    this.locks.set(taskId, taskLocks);
    
    await this.saveLocks();
  }

  /**
   * 清理任务锁
   */
  async cleanup(taskId: string): Promise<void> {
    await this.loadLocks();
    
    this.locks.delete(taskId);
    
    await this.saveLocks();
  }

  /**
   * 加载锁
   */
  private async loadLocks(): Promise<void> {
    try {
      const content = await fs.readFile(this.locksFile, 'utf8');
      const data = JSON.parse(content);
      
      this.locks.clear();
      for (const [taskId, locks] of Object.entries(data)) {
        this.locks.set(taskId, new Map(Object.entries(locks)));
      }
    } catch (error) {
      // 文件不存在或解析失败，使用空锁
      this.locks.clear();
    }
  }

  /**
   * 保存锁
   */
  private async saveLocks(): Promise<void> {
    const data: Record<string, Record<string, StateLock>> = {};
    
    for (const [taskId, taskLocks] of this.locks.entries()) {
      data[taskId] = Object.fromEntries(taskLocks);
    }
    
    await fs.mkdir(path.dirname(this.locksFile), { recursive: true });
    await fs.writeFile(this.locksFile, JSON.stringify(data, null, 2));
  }

  /**
   * 获取子任务（辅助方法）
   */
  private async getSubtask(
    taskId: string, 
    subtaskId: string
  ): Promise<SubTask | null> {
    // 这个方法需要从 TaskRegistry 获取
    // 暂时返回 null，实际实现需要注入依赖
    return null;
  }
}
```

**预期产出**:
- 完整的状态锁管理器实现
- 单元测试套件
- 集成测试

**验收标准**:
- 原子锁操作正常
- 依赖检查正常
- 死锁检测正常
- 单元测试覆盖率 > 80%

---

**任务 1.6: 编写单元测试**

**文件**: `src/orchestration/managers/__tests__/StateLockManager.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { StateLockManager } from '../StateLockManager';
import { SubTask } from '../../types';
import fs from 'fs/promises';

describe('StateLockManager', () => {
  let manager: StateLockManager;
  const mockTaskId = 'task-1';
  const mockSubtasks: SubTask[] = [
    {
      id: 'subtask-1',
      taskId: mockTaskId,
      description: 'Test subtask 1',
      type: 'code-generation',
      priority: 'high',
      dependencies: [],
      requiredSkills: [],
      requiredAgent: null,
      mcpTools: [],
      requiredFiles: [],
      outputFiles: [],
      assignedCLI: 'claude',
      status: 'pending',
      createdAt: new Date()
    },
    {
      id: 'subtask-2',
      taskId: mockTaskId,
      description: 'Test subtask 2',
      type: 'code-review',
      priority: 'medium',
      dependencies: ['subtask-1'],
      requiredSkills: [],
      requiredAgent: null,
      mcpTools: [],
      requiredFiles: [],
      outputFiles: [],
      assignedCLI: 'gemini',
      status: 'pending',
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    manager = new StateLockManager();
    await manager.initializeTask(mockTaskId, mockSubtasks);
  });

  afterEach(async () => {
    await manager.cleanup(mockTaskId);
  });

  it('should initialize task with subtasks', async () => {
    const states = await manager.getSubtaskStates(mockTaskId);
    expect(states).toHaveLength(2);
    expect(states[0].status).toBe('pending');
    expect(states[1].status).toBe('pending');
  });

  it('should acquire lock for subtask without dependencies', async () => {
    const result = await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
    expect(result.success).toBe(true);
    
    const states = await manager.getSubtaskStates(mockTaskId);
    expect(states[0].status).toBe('in-progress');
  });

  it('should not acquire lock for subtask with unmet dependencies', async () => {
    const result = await manager.acquireLock(mockTaskId, 'subtask-2', 'gemini');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Dependencies not met');
  });

  it('should acquire lock for subtask with met dependencies', async () => {
    // 先获取第一个子任务的锁
    await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
    
    // 释放第一个子任务的锁
    await manager.releaseLock(mockTaskId, 'subtask-1', { success: true });
    
    // 现在应该能获取第二个子任务的锁
    const result = await manager.acquireLock(mockTaskId, 'subtask-2', 'gemini');
    expect(result.success).toBe(true);
  });

  it('should release lock', async () => {
    await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
    await manager.releaseLock(mockTaskId, 'subtask-1', { success: true });
    
    const states = await manager.getSubtaskStates(mockTaskId);
    expect(states[0].status).toBe('completed');
  });

  it('should detect deadlock', async () => {
    // 创建循环依赖的子任务
    const circularSubtasks: SubTask[] = [
      {
        id: 'subtask-3',
        taskId: mockTaskId,
        description: 'Test subtask 3',
        type: 'code-generation',
        priority: 'high',
        dependencies: ['subtask-4'],
        requiredSkills: [],
        requiredAgent: null,
        mcpTools: [],
        requiredFiles: [],
        outputFiles: [],
        assignedCLI: 'claude',
        status: 'pending',
        createdAt: new Date()
      },
      {
        id: 'subtask-4',
        taskId: mockTaskId,
        description: 'Test subtask 4',
        type: 'code-review',
        priority: 'high',
        dependencies: ['subtask-3'],
        requiredSkills: [],
        requiredAgent: null,
        mcpTools: [],
        requiredFiles: [],
        outputFiles: [],
        assignedCLI: 'gemini',
        status: 'pending',
        createdAt: new Date()
      }
    ];
    
    await manager.initializeTask(mockTaskId, circularSubtasks);
    await manager.acquireLock(mockTaskId, 'subtask-3', 'claude');
    await manager.acquireLock(mockTaskId, 'subtask-4', 'gemini');
    
    const deadlock = await manager.detectDeadlock();
    expect(deadlock).toContain('Deadlock detected');
  });

  it('should force release lock', async () => {
    await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
    await manager.forceReleaseLock(mockTaskId, 'subtask-1');
    
    const states = await manager.getSubtaskStates(mockTaskId);
    expect(states[0].status).toBe('failed');
    expect(states[0].errorMessage).toBe('Force released');
  });
});
```

**预期产出**:
- 完整的单元测试套件
- 测试覆盖率报告

**验收标准**:
- 所有测试通过
- 测试覆盖率 > 80%
- 测试文档完整

---

### 阶段 2: 多终端并发执行（2-3 周）

#### 目标
- 实现多终端管理器
- 实现终端并发启动
- 实现终端状态监控

#### 关键任务

**任务 2.1: 实现终端管理器**

**文件**: `src/orchestration/managers/EnhancedTerminalManager.ts`

```typescript
import { spawn, ChildProcess } from 'child_process';
import { SubTask, Worktree, Terminal, OrchestrationStrategy } from '../types';
import { CLI_PARAM_MAPPINGS } from '../config';

export interface TerminalLaunchResult {
  success: boolean;
  terminalId?: string;
  errorMessage?: string;
}

export interface TerminalStatus {
  terminalId: string;
  subtaskId: string;
  cliName: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'crashed';
  pid?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface TerminalResult {
  terminalId: string;
  subtaskId: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export class EnhancedTerminalManager {
  private terminals: Map<string, { process: ChildProcess; terminal: Terminal }> = new Map();
  private outputBuffers: Map<string, string> = new Map();

  /**
   * 启动多个终端
   */
  async launchTerminalsForTask(
    task: any,
    strategy: OrchestrationStrategy,
    worktrees: Record<string, Worktree>
  ): Promise<TerminalLaunchResult[]> {
    const results: TerminalLaunchResult[] = [];
    
    // 根据策略确定启动顺序
    if (strategy.mode === 'parallel') {
      // 并行启动所有终端
      const launchPromises = task.subtasks.map(subtask => 
        this.launchTerminalForSubtask(
          subtask, 
          worktrees[subtask.id], 
          strategy
        )
      );
      
      const launchResults = await Promise.all(launchPromises);
      results.push(...launchResults);
    } else if (strategy.mode === 'sequential') {
      // 串行启动终端
      for (const subtask of task.subtasks) {
        const result = await this.launchTerminalForSubtask(
          subtask,
          worktrees[subtask.id],
          strategy
        );
        results.push(result);
        
        // 等待终端完成
        if (result.success && result.terminalId) {
          await this.waitForTerminal(result.terminalId);
        }
      }
    } else if (strategy.mode === 'hybrid') {
      // 混合模式：按照并行组启动
      for (const group of strategy.parallelGroups || []) {
        const launchPromises = group.tasks.map(subtask => 
          this.launchTerminalForSubtask(
            subtask,
            worktrees[subtask.id],
            strategy
          )
        );
        
        const launchResults = await Promise.all(launchPromises);
        results.push(...launchResults);
        
        // 等待组内所有终端完成
        const terminalIds = launchResults
          .filter(r => r.success && r.terminalId)
          .map(r => r.terminalId!);
        
        await this.waitForAllTerminals(terminalIds);
      }
    }
    
    return results;
  }

  /**
   * 启动单个终端
   */
  async launchTerminalForSubtask(
    subtask: SubTask,
    worktree: Worktree,
    strategy: OrchestrationStrategy
  ): Promise<TerminalLaunchResult> {
    try {
      // 1. 构建 CLI 命令
      const command = this.buildCLICommand(subtask, worktree);
      
      // 2. 启动终端进程
      const process = spawn(command, {
        shell: true,
        cwd: worktree.worktreePath,
        env: {
          ...process.env,
          STIGMERGY_TASK_ID: subtask.taskId,
          STIGMERGY_SUBTASK_ID: subtask.id
        }
      });
      
      // 3. 创建终端对象
      const terminalId = `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const terminal: Terminal = {
        id: terminalId,
        subtaskId: subtask.id,
        cliName: subtask.assignedCLI || 'unknown',
        command,
        status: 'starting',
        pid: process.pid,
        createdAt: new Date(),
        output: ''
      };
      
      // 4. 存储终端信息
      this.terminals.set(terminalId, { process, terminal });
      this.outputBuffers.set(terminalId, '');
      
      // 5. 设置输出监听
      process.stdout?.on('data', (data) => {
        const output = data.toString();
        this.outputBuffers.set(
          terminalId,
          (this.outputBuffers.get(terminalId) || '') + output
        );
        terminal.output += output;
      });
      
      process.stderr?.on('data', (data) => {
        const error = data.toString();
        terminal.error = (terminal.error || '') + error;
      });
      
      // 6. 设置进程退出监听
      process.on('close', (code) => {
        terminal.status = code === 0 ? 'completed' : 'failed';
        terminal.completedAt = new Date();
      });
      
      process.on('error', (error) => {
        terminal.status = 'crashed';
        terminal.error = error.message;
        terminal.completedAt = new Date();
      });
      
      // 7. 等待进程启动
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 8. 检查进程是否成功启动
      if (process.killed || process.exitCode !== null) {
        return {
          success: false,
          errorMessage: 'Process failed to start'
        };
      }
      
      terminal.status = 'running';
      
      return {
        success: true,
        terminalId
      };
      
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 构建 CLI 命令
   */
  private buildCLICommand(subtask: SubTask, worktree: Worktree): string {
    const cliName = subtask.assignedCLI || 'claude';
    const mappings = CLI_PARAM_MAPPINGS[cliName as keyof typeof CLI_PARAM_MAPPINGS];
    
    if (!mappings) {
      throw new Error(`No CLI mappings found for ${cliName}`);
    }
    
    let command = cliName;
    
    // 添加 agent 参数
    if (subtask.requiredAgent) {
      command += mappings.agent(subtask.requiredAgent);
    }
    
    // 添加 skills 参数
    if (subtask.requiredSkills.length > 0) {
      command += mappings.skills(subtask.requiredSkills);
    }
    
    // 添加 MCP 工具参数
    if (subtask.mcpTools.length > 0) {
      command += mappings.mcp(subtask.mcpTools);
    }
    
    // 添加工作目录参数
    command += mappings.cwd(worktree.worktreePath);
    
    // 添加任务描述
    command += ` "${subtask.description}"`;
    
    return command;
  }

  /**
   * 监控所有终端
   */
  async monitorAllTerminals(): Promise<TerminalStatus[]> {
    const statuses: TerminalStatus[] = [];
    
    for (const [terminalId, { terminal }] of this.terminals.entries()) {
      statuses.push({
        terminalId,
        subtaskId: terminal.subtaskId,
        cliName: terminal.cliName,
        status: terminal.status,
        pid: terminal.pid,
        createdAt: terminal.createdAt,
        completedAt: terminal.completedAt
      });
    }
    
    return statuses;
  }

  /**
   * 等待所有终端完成
   */
  async waitForAllTerminals(terminalIds: string[]): Promise<TerminalResult[]> {
    const results: TerminalResult[] = [];
    
    for (const terminalId of terminalIds) {
      const result = await this.waitForTerminal(terminalId);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 等待终端完成
   */
  async waitForTerminal(terminalId: string): Promise<TerminalResult> {
    const { process, terminal } = this.terminals.get(terminalId) || {};
    
    if (!process || !terminal) {
      throw new Error(`Terminal ${terminalId} not found`);
    }
    
    // 等待进程退出
    await new Promise<void>((resolve) => {
      process.on('close', () => resolve());
    });
    
    return {
      terminalId,
      subtaskId: terminal.subtaskId,
      success: terminal.status === 'completed',
      output: terminal.output,
      error: terminal.error,
      duration: terminal.completedAt 
        ? terminal.completedAt.getTime() - terminal.createdAt.getTime()
        : 0
    };
  }

  /**
   * 读取终端输出
   */
  async readTerminalOutput(terminalId: string): Promise<string> {
    return this.outputBuffers.get(terminalId) || '';
  }

  /**
   * 终止终端
   */
  async killTerminal(terminalId: string): Promise<void> {
    const { process } = this.terminals.get(terminalId) || {};
    
    if (process) {
      process.kill();
      this.terminals.delete(terminalId);
      this.outputBuffers.delete(terminalId);
    }
  }

  /**
   * 终止所有终端
   */
  async killAllTerminals(): Promise<void> {
    const killPromises = Array.from(this.terminals.keys()).map(terminalId =>
      this.killTerminal(terminalId)
    );
    
    await Promise.all(killPromises);
  }

  /**
   * 清理
   */
  async cleanup(): Promise<void> {
    await this.killAllTerminals();
    this.terminals.clear();
    this.outputBuffers.clear();
  }
}
```

**预期产出**:
- 完整的终端管理器实现
- 单元测试套件
- 集成测试

**验收标准**:
- 多终端并发启动正常
- 终端状态监控正常
- 输出收集正常
- 单元测试覆盖率 > 80%

---

**任务 2.2: 编写终端管理器测试**

**文件**: `src/orchestration/managers/__tests__/EnhancedTerminalManager.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EnhancedTerminalManager } from '../EnhancedTerminalManager';
import { SubTask, Worktree, OrchestrationStrategy } from '../../types';

describe('EnhancedTerminalManager', () => {
  let manager: EnhancedTerminalManager;
  const mockSubtask: SubTask = {
    id: 'subtask-1',
    taskId: 'task-1',
    description: 'Test task',
    type: 'code-generation',
    priority: 'high',
    dependencies: [],
    requiredSkills: [],
    requiredAgent: 'oracle',
    mcpTools: [],
    requiredFiles: [],
    outputFiles: [],
    assignedCLI: 'claude',
    status: 'pending',
    createdAt: new Date()
  };

  const mockWorktree: Worktree = {
    taskId: 'task-1',
    subtaskId: 'subtask-1',
    worktreePath: '/tmp/test-worktree',
    branch: 'test-branch',
    createdAt: new Date(),
    status: 'active'
  };

  beforeEach(() => {
    manager = new EnhancedTerminalManager();
  });

  afterEach(async () => {
    await manager.cleanup();
  });

  it('should launch terminal for subtask', async () => {
    const result = await manager.launchTerminalForSubtask(
      mockSubtask,
      mockWorktree,
      { mode: 'parallel', dependencies: [] }
    );
    
    expect(result.success).toBe(true);
    expect(result.terminalId).toBeDefined();
  });

  it('should monitor terminal status', async () => {
    const launchResult = await manager.launchTerminalForSubtask(
      mockSubtask,
      mockWorktree,
      { mode: 'parallel', dependencies: [] }
    );
    
    if (launchResult.success && launchResult.terminalId) {
      const statuses = await manager.monitorAllTerminals();
      expect(statuses).toHaveLength(1);
      expect(statuses[0].status).toBe('running');
    }
  });

  it('should read terminal output', async () => {
    const launchResult = await manager.launchTerminalForSubtask(
      mockSubtask,
      mockWorktree,
      { mode: 'parallel', dependencies: [] }
    );
    
    if (launchResult.success && launchResult.terminalId) {
      const output = await manager.readTerminalOutput(launchResult.terminalId);
      expect(typeof output).toBe('string');
    }
  });

  it('should kill terminal', async () => {
    const launchResult = await manager.launchTerminalForSubtask(
      mockSubtask,
      mockWorktree,
      { mode: 'parallel', dependencies: [] }
    );
    
    if (launchResult.success && launchResult.terminalId) {
      await manager.killTerminal(launchResult.terminalId);
      
      const statuses = await manager.monitorAllTerminals();
      expect(statuses).toHaveLength(0);
    }
  });
});
```

**预期产出**:
- 完整的单元测试套件
- 测试覆盖率报告

**验收标准**:
- 所有测试通过
- 测试覆盖率 > 80%

---

### 阶段 3: Git Worktree 管理（1-2 周）

#### 目标
- 实现 Git Worktree 管理器
- 实现 Worktree 创建和合并
- 实现配置同步

#### 关键任务

**任务 3.1: 实现 Git Worktree 管理器**

**文件**: `src/orchestration/managers/GitWorktreeManager.ts`

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Worktree, SubTask } from '../types';

const execPromise = promisify(exec);

export interface WorktreeConfig {
  taskId: string;
  subtaskId: string;
  subtask: SubTask;
  projectPath: string;
}

export interface MergeStrategy {
  type: 'squash' | 'merge' | 'selective';
  message?: string;
  includeFiles?: string[];
  excludeFiles?: string[];
}

export class GitWorktreeManager {
  private worktrees: Map<string, Worktree> = new Map();
  private registryFile: string = '.stigmergy/coordination/worktree-registry.json';

  /**
   * 创建 Worktree
   */
  async create(config: WorktreeConfig): Promise<Worktree> {
    const { taskId, subtaskId, subtask, projectPath } = config;
    
    // 1. 创建分支名称
    const branchName = `${taskId}/${subtaskId}`;
    
    // 2. 创建 Worktree 路径
    const worktreePath = path.join(
      projectPath,
      '.git',
      'worktrees',
      taskId,
      subtaskId
    );
    
    // 3. 创建分支
    await this.createBranch(branchName);
    
    // 4. 创建 Worktree
    await this.execGit([
      'worktree',
      'add',
      '-b',
      branchName,
      worktreePath
    ], projectPath);
    
    // 5. 初始化 Worktree
    await this.initializeWorktree(worktreePath, config);
    
    // 6. 创建 Worktree 对象
    const worktree: Worktree = {
      taskId,
      subtaskId,
      worktreePath,
      branch: branchName,
      createdAt: new Date(),
      status: 'active'
    };
    
    // 7. 存储到注册表
    this.worktrees.set(`${taskId}/${subtaskId}`, worktree);
    await this.saveRegistry();
    
    return worktree;
  }

  /**
   * 创建分支
   */
  private async createBranch(branchName: string): Promise<void> {
    // 从当前分支创建新分支
    await this.execGit(['branch', branchName], process.cwd());
  }

  /**
   * 初始化 Worktree
   */
  private async initializeWorktree(
    worktreePath: string,
    config: WorktreeConfig
  ): Promise<void> {
    // 1. 同步配置文件
    await this.syncConfigFiles(worktreePath);
    
    // 2. 创建协调目录
    const coordinationDir = path.join(worktreePath, '.stigmergy', 'coordination');
    await fs.mkdir(coordinationDir, { recursive: true });
    
    // 3. 创建输出目录
    const outputDir = path.join(worktreePath, '.stigmergy', 'output');
    await fs.mkdir(outputDir, { recursive: true });
  }

  /**
   * 同步配置文件
   */
  private async syncConfigFiles(worktreePath: string): Promise<void> {
    const configFiles = [
      '.stigmergy/config.json',
      '.stigmergy/memory.json',
      'package.json',
      'tsconfig.json'
    ];
    
    for (const configFile of configFiles) {
      const sourcePath = path.join(process.cwd(), configFile);
      const targetPath = path.join(worktreePath, configFile);
      
      try {
        await fs.copyFile(sourcePath, targetPath);
      } catch (error) {
        // 文件不存在，跳过
      }
    }
  }

  /**
   * 合并 Worktree
   */
  async mergeWorktree(
    taskId: string,
    subtaskId: string,
    strategy: MergeStrategy
  ): Promise<void> {
    const worktree = this.worktrees.get(`${taskId}/${subtaskId}`);
    
    if (!worktree) {
      throw new Error(`Worktree ${taskId}/${subtaskId} not found`);
    }
    
    // 1. 切换到主分支
    await this.execGit(['checkout', 'main'], process.cwd());
    
    // 2. 根据策略合并
    switch (strategy.type) {
      case 'squash':
        await this.squashMerge(worktree, strategy.message);
        break;
      
      case 'merge':
        await this.mergeCommit(worktree, strategy.message);
        break;
      
      case 'selective':
        await this.selectiveMerge(worktree, strategy);
        break;
    }
    
    // 3. 更新 Worktree 状态
    worktree.status = 'merged';
    await this.saveRegistry();
  }

  /**
   * Squash 合并
   */
  private async squashMerge(worktree: Worktree, message?: string): Promise<void> {
    await this.execGit(['merge', '--squash', worktree.branch], process.cwd());
    
    const commitMessage = message || `Merge worktree ${worktree.subtaskId}`;
    await this.execGit(['commit', '-m', commitMessage], process.cwd());
    
    // 删除 worktree 分支
    await this.execGit(['branch', '-D', worktree.branch], process.cwd());
  }

  /**
   * Merge 提交
   */
  private async mergeCommit(worktree: Worktree, message?: string): Promise<void> {
    const commitMessage = message || `Merge worktree ${worktree.subtaskId}`;
    await this.execGit(['merge', '--no-ff', '-m', commitMessage, worktree.branch], process.cwd());
  }

  /**
   * 选择性合并
   */
  private async selectiveMerge(worktree: Worktree, strategy: MergeStrategy): Promise<void> {
    // 获取所有修改的文件
    const { stdout } = await this.execGit(
      ['diff', '--name-only', 'main', worktree.branch],
      process.cwd()
    );
    
    const modifiedFiles = stdout.trim().split('\n').filter(f => f);
    
    // 筛选要合并的文件
    const filesToMerge = modifiedFiles.filter(file => {
      if (strategy.includeFiles && strategy.includeFiles.length > 0) {
        return strategy.includeFiles.includes(file);
      }
      if (strategy.excludeFiles) {
        return !strategy.excludeFiles.includes(file);
      }
      return true;
    });
    
    // 逐个文件合并
    for (const file of filesToMerge) {
      try {
        await this.execGit(['checkout', 'main', '--', file], process.cwd());
        await this.execGit(['checkout', worktree.branch, '--', file], process.cwd());
      } catch (error) {
        // 处理冲突
        console.warn(`Conflict in file: ${file}`);
      }
    }
  }

  /**
   * 删除 Worktree
   */
  async removeWorktree(taskId: string, subtaskId: string): Promise<void> {
    const worktree = this.worktrees.get(`${taskId}/${subtaskId}`);
    
    if (!worktree) {
      throw new Error(`Worktree ${taskId}/${subtaskId} not found`);
    }
    
    // 1. 删除 Worktree
    await this.execGit(['worktree', 'remove', worktree.worktreePath], process.cwd());
    
    // 2. 删除分支
    await this.execGit(['branch', '-D', worktree.branch], process.cwd());
    
    // 3. 从注册表中移除
    this.worktrees.delete(`${taskId}/${subtaskId}`);
    await this.saveRegistry();
  }

  /**
   * 清理所有 Worktrees
   */
  async cleanupAllWorktrees(): Promise<void> {
    const removePromises = Array.from(this.worktrees.values()).map(worktree =>
      this.removeWorktree(worktree.taskId, worktree.subtaskId)
    );
    
    await Promise.all(removePromises);
  }

  /**
   * 获取所有 Worktrees
   */
  async getAllWorktrees(): Promise<Record<string, Worktree>> {
    return Object.fromEntries(this.worktrees);
  }

  /**
   * 执行 Git 命令
   */
  private async execGit(args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
    try {
      return await execPromise(`git ${args.join(' ')}`, { cwd });
    } catch (error: any) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * 保存注册表
   */
  private async saveRegistry(): Promise<void> {
    const data = Object.fromEntries(this.worktrees);
    
    await fs.mkdir(path.dirname(this.registryFile), { recursive: true });
    await fs.writeFile(this.registryFile, JSON.stringify(data, null, 2));
  }

  /**
   * 加载注册表
   */
  async loadRegistry(): Promise<void> {
    try {
      const content = await fs.readFile(this.registryFile, 'utf8');
      const data = JSON.parse(content);
      
      this.worktrees.clear();
      for (const [key, value] of Object.entries(data)) {
        this.worktrees.set(key, value as Worktree);
      }
    } catch (error) {
      // 文件不存在或解析失败，使用空注册表
      this.worktrees.clear();
    }
  }
}
```

**预期产出**:
- 完整的 Git Worktree 管理器实现
- 单元测试套件
- 集成测试

**验收标准**:
- Worktree 创建正常
- Worktree 合并正常
- Worktree 清理正常
- 单元测试覆盖率 > 80%

---

### 阶段 4: Hook 集成（1-2 周）

#### 目标
- 实现 Hook 系统
- 为各 CLI 安装协调 Hook
- 实现 Hook 执行

#### 关键任务

**任务 4.1: 实现 Hook 系统**

**文件**: `src/orchestration/hooks/HookSystem.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { CLI_HOOKS_DIR } from '../config';

export interface HookStatus {
  cliName: string;
  hooks: {
    taskDetection: boolean;
    lockAcquisition: boolean;
    lockRelease: boolean;
    conflictDetection: boolean;
  };
}

export class HookSystem {
  /**
   * 为 CLI 安装协调 Hook
   */
  async installCoordinationHooks(cliName: string): Promise<void> {
    const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
    
    if (!hooksDir) {
      throw new Error(`No hooks directory configured for ${cliName}`);
    }
    
    // 1. 创建 Hook 目录
    await fs.mkdir(hooksDir, { recursive: true });
    
    // 2. 安装各个 Hook
    await this.installTaskDetectionHook(cliName, hooksDir);
    await this.installLockAcquisitionHook(cliName, hooksDir);
    await this.installLockReleaseHook(cliName, hooksDir);
    await this.installConflictDetectionHook(cliName, hooksDir);
    
    // 3. 更新 CLI 配置
    await this.updateCLIConfiguration(cliName, hooksDir);
  }

  /**
   * 安装任务检测 Hook
   */
  private async installTaskDetectionHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateTaskDetectionHook(cliName);
    const hookFile = path.join(hooksDir, 'task-detection.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 安装锁获取 Hook
   */
  private async installLockAcquisitionHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateLockAcquisitionHook(cliName);
    const hookFile = path.join(hooksDir, 'lock-acquisition.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 安装锁释放 Hook
   */
  private async installLockReleaseHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateLockReleaseHook(cliName);
    const hookFile = path.join(hooksDir, 'lock-release.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 安装冲突检测 Hook
   */
  private async installConflictDetectionHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateConflictDetectionHook(cliName);
    const hookFile = path.join(hooksDir, 'conflict-detection.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 更新 CLI 配置
   */
  private async updateCLIConfiguration(cliName: string, hooksDir: string): Promise<void> {
    // 根据不同的 CLI 更新配置
    // 这里需要根据具体 CLI 的配置格式进行调整
  }

  /**
   * 生成任务检测 Hook
   */
  private generateTaskDetectionHook(cliName: string): string {
    return `
// Task Detection Hook for ${cliName}
// Automatically detects and matches tasks

module.exports = async (context) => {
  const { input, metadata } = context;
  
  // 读取协调上下文
  const coordinationContext = await loadCoordinationContext();
  
  // 检查是否是编排任务
  if (coordinationContext && coordinationContext.taskId) {
    return {
      matched: true,
      taskId: coordinationContext.taskId,
      subtaskId: coordinationContext.subtaskId
    };
  }
  
  return { matched: false };
};

async function loadCoordinationContext() {
  const fs = require('fs');
  const path = require('path');
  const coordinationFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'shared-context.json');
  
  try {
    const content = await fs.promises.readFile(coordinationFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}
`;
  }

  /**
   * 生成锁获取 Hook
   */
  private generateLockAcquisitionHook(cliName: string): string {
    return `
// Lock Acquisition Hook for ${cliName}
// Atomically acquires lock before task execution

module.exports = async (context) => {
  const { taskId, subtaskId } = context;
  
  // 调用状态锁管理器
  const result = await acquireLock(taskId, subtaskId, '${cliName}');
  
  if (!result.success) {
    throw new Error(\`Failed to acquire lock: \${result.errorMessage}\`);
  }
  
  return { success: true };
};

async function acquireLock(taskId, subtaskId, cliName) {
  const fs = require('fs');
  const path = require('path');
  const locksFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'state-locks.json');
  
  // 实现原子锁操作
  // 这里需要调用 StateLockManager 的方法
  return { success: true };
}
`;
  }

  /**
   * 生成锁释放 Hook
   */
  private generateLockReleaseHook(cliName: string): string {
    return `
// Lock Release Hook for ${cliName}
// Releases lock after task completion

module.exports = async (context) => {
  const { taskId, subtaskId, result } = context;
  
  // 调用状态锁管理器
  await releaseLock(taskId, subtaskId, result);
  
  return { success: true };
};

async function releaseLock(taskId, subtaskId, result) {
  const fs = require('fs');
  const path = require('path');
  const locksFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'state-locks.json');
  
  // 实现锁释放操作
  // 这里需要调用 StateLockManager 的方法
}
`;
  }

  /**
   * 生成冲突检测 Hook
   */
  private generateConflictDetectionHook(cliName: string): string {
    return `
// Conflict Detection Hook for ${cliName}
// Detects and prevents file conflicts

module.exports = async (context) => {
  const { taskId, subtaskId, files } = context;
  
  // 检查文件锁
  const lockedFiles = await checkFileLocks(taskId, subtaskId, files);
  
  if (lockedFiles.length > 0) {
    throw new Error(\`Files locked: \${lockedFiles.join(', ')}\`);
  }
  
  return { success: true, lockedFiles: [] };
};

async function checkFileLocks(taskId, subtaskId, files) {
  const fs = require('fs');
  const path = require('path');
  const locksFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'state-locks.json');
  
  // 实现文件锁检查
  // 这里需要调用 StateLockManager 的方法
  return [];
}
`;
  }

  /**
   * 获取 Hook 状态
   */
  async getHookStatus(cliName: string): Promise<HookStatus> {
    const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
    
    if (!hooksDir) {
      throw new Error(`No hooks directory configured for ${cliName}`);
    }
    
    const hooks = {
      taskDetection: await this.hookExists(hooksDir, 'task-detection.js'),
      lockAcquisition: await this.hookExists(hooksDir, 'lock-acquisition.js'),
      lockRelease: await this.hookExists(hooksDir, 'lock-release.js'),
      conflictDetection: await this.hookExists(hooksDir, 'conflict-detection.js')
    };
    
    return { cliName, hooks };
  }

  /**
   * 检查 Hook 是否存在
   */
  private async hookExists(hooksDir: string, hookName: string): Promise<boolean> {
    try {
      await fs.access(path.join(hooksDir, hookName));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 卸载 Hook
   */
  async uninstallHooks(cliName: string): Promise<void> {
    const hooksDir = CLI_HOOKS_DIR[cliName as keyof typeof CLI_HOOKS_DIR];
    
    if (!hooksDir) {
      throw new Error(`No hooks directory configured for ${cliName}`);
    }
    
    // 删除所有 Hook 文件
    await fs.rm(hooksDir, { recursive: true, force: true });
  }
}
```

**预期产出**:
- 完整的 Hook 系统实现
- 单元测试套件
- 集成测试

**验收标准**:
- Hook 安装正常
- Hook 执行正常
- Hook 卸载正常
- 单元测试覆盖率 > 80%

---

### 阶段 5: ResumeSession 集成（1 周）

#### 目标
- 实现 ResumeSession 集成
- 实现会话状态持久化
- 实现上下文传递
- 实现中断恢复

#### 关键任务

**任务 5.1: 实现 ResumeSession 集成**

**文件**: `src/orchestration/integration/ResumeSessionIntegration.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { OrchestratedTask, SharedContext } from '../types';

export interface HistoryEvent {
  id: string;
  timestamp: Date;
  type: string;
  data: any;
}

export class ResumeSessionIntegration {
  private sessionsDir: string = '.stigmergy/coordination/sessions';
  private historyDir: string = '.stigmergy/coordination/history';

  /**
   * 保存任务状态
   */
  async saveTaskState(taskId: string, task: OrchestratedTask): Promise<void> {
    const sessionFile = path.join(this.sessionsDir, `${taskId}.json`);
    
    const sessionData = {
      taskId,
      task,
      savedAt: new Date(),
      status: task.status
    };
    
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));
  }

  /**
   * 恢复任务状态
   */
  async restoreTaskState(taskId: string): Promise<OrchestratedTask | null> {
    const sessionFile = path.join(this.sessionsDir, `${taskId}.json`);
    
    try {
      const content = await fs.readFile(sessionFile, 'utf8');
      const sessionData = JSON.parse(content);
      
      return sessionData.task as OrchestratedTask;
    } catch (error) {
      return null;
    }
  }

  /**
   * 传递上下文到子任务
   */
  async passContextToSubtask(
    taskId: string,
    subtaskId: string,
    context: SharedContext
  ): Promise<void> {
    const contextFile = path.join(
      this.sessionsDir,
      `${taskId}-${subtaskId}-context.json`
    );
    
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.writeFile(contextFile, JSON.stringify(context, null, 2));
  }

  /**
   * 收集子任务上下文
   */
  async collectSubtaskContext(
    taskId: string,
    subtaskId: string
  ): Promise<SharedContext> {
    const contextFile = path.join(
      this.sessionsDir,
      `${taskId}-${subtaskId}-context.json`
    );
    
    try {
      const content = await fs.readFile(contextFile, 'utf8');
      return JSON.parse(content) as SharedContext;
    } catch (error) {
      throw new Error(`Context not found for ${taskId}/${subtaskId}`);
    }
  }

  /**
   * 记录历史
   */
  async recordHistory(taskId: string, event: HistoryEvent): Promise<void> {
    const historyFile = path.join(this.historyDir, `${taskId}.jsonl`);
    
    await fs.mkdir(this.historyDir, { recursive: true });
    await fs.appendFile(
      historyFile,
      JSON.stringify(event) + '\n',
      'utf8'
    );
  }

  /**
   * 查询历史
   */
  async queryHistory(taskId: string): Promise<HistoryEvent[]> {
    const historyFile = path.join(this.historyDir, `${taskId}.jsonl`);
    
    try {
      const content = await fs.readFile(historyFile, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 生成恢复命令
   */
  async generateResumeCommand(taskId: string): Promise<string> {
    const task = await this.restoreTaskState(taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    return `stigmergy coord resume ${taskId}`;
  }

  /**
   * 列出可恢复的任务
   */
  async listResumableTasks(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * 清理会话
   */
  async cleanupSession(taskId: string): Promise<void> {
    const sessionFile = path.join(this.sessionsDir, `${taskId}.json`);
    const historyFile = path.join(this.historyDir, `${taskId}.jsonl`);
    
    await fs.unlink(sessionFile).catch(() => {});
    await fs.unlink(historyFile).catch(() => {});
  }
}
```

**预期产出**:
- 完整的 ResumeSession 集成实现
- 单元测试套件
- 集成测试

**验收标准**:
- 会话状态持久化正常
- 上下文传递正常
- 中断恢复正常
- 单元测试覆盖率 > 80%

---

### 阶段 6: 三文件系统集成（1-2 周）

#### 目标
- 实现三文件系统管理器
- 集成到 Worktree 创建流程
- 集成到动态智能体生成
- 集成到 ResumeSession
- 集成到事件总线

#### 关键任务

**任务 6.1: 实现三文件系统管理器**

**文件**: `src/orchestration/managers/TaskPlanningFiles.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

export interface TaskPlanUpdate {
  currentPhase?: string;
  phases?: Phase[];
  keyQuestions?: string[];
  decisions?: Decision[];
  errors?: ErrorEntry[];
  notes?: string[];
}

export interface Finding {
  category: 'requirement' | 'research' | 'decision' | 'issue' | 'resource';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ProgressEntry {
  phase: string;
  status: 'in_progress' | 'completed' | 'failed';
  action: string;
  files?: string[];
  timestamp: Date;
}

export interface ErrorEntry {
  error: string;
  attempt: number;
  resolution?: string;
  timestamp: Date;
}

export interface Phase {
  name: string;
  tasks: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Decision {
  decision: string;
  rationale: string;
  timestamp: Date;
}

export interface TaskPlanningFiles {
  taskPlan: string;
  findings: string;
  progress: string;
}

export interface TaskState {
  currentPhase: string;
  completedPhases: string[];
  findings: Finding[];
  progress: ProgressEntry[];
  errors: ErrorEntry[];
}

export class TaskPlanningFilesManager {
  private baseDir: string;

  constructor(baseDir: string = '.stigmergy/planning-files') {
    this.baseDir = baseDir;
  }

  /**
   * 初始化任务的三文件系统
   */
  async initializeTask(
    taskId: string,
    description: string,
    worktreePath: string
  ): Promise<TaskPlanningFiles> {
    const taskDir = path.join(this.baseDir, taskId);
    
    // 确保目录存在
    await fs.mkdir(taskDir, { recursive: true });
    
    // 创建三文件
    const taskPlanPath = path.join(taskDir, 'task_plan.md');
    const findingsPath = path.join(taskDir, 'findings.md');
    const progressPath = path.join(taskDir, 'progress.md');
    
    await this.createDefaultTaskPlan(taskPlanPath, description);
    await this.createDefaultFindings(findingsPath);
    await this.createDefaultProgress(progressPath);
    
    return {
      taskPlan: taskPlanPath,
      findings: findingsPath,
      progress: progressPath
    };
  }

  /**
   * 创建默认的任务规划文件
   */
  private async createDefaultTaskPlan(filePath: string, description: string): Promise<void> {
    const content = `# Task Plan: ${description}

## Goal
[One sentence describing the end state]

## Current Phase
Phase 1

## Phases

### Phase 1: Requirements & Discovery
- [ ] Understand user intent
- [ ] Identify constraints and requirements
- [ ] Document findings in findings.md
- **Status:** in_progress

### Phase 2: Planning & Structure
- [ ] Define technical approach
- [ ] Create project structure if needed
- [ ] Document decisions with rationale
- **Status:** pending

### Phase 3: Implementation
- [ ] Execute the plan step by step
- [ ] Write code to files before executing
- [ ] Test incrementally
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] Verify all requirements met
- [ ] Document test results in progress.md
- [ ] Fix any issues found
- **Status:** pending

### Phase 5: Delivery
- [ ] Review all output files
- [ ] Ensure deliverables are complete
- [ ] Deliver to user
- **Status:** pending

## Key Questions
1. [Question to answer]
2. [Question to answer]

## Decisions Made
| Decision | Rationale |
|----------|-----------|
|          |           |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions (attention manipulation)
- Log ALL errors - they help avoid repetition
`;
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 创建默认的研究发现文件
   */
  private async createDefaultFindings(filePath: string): Promise<void> {
    const content = `# Findings & Decisions

## Requirements
<!-- Captured from user request -->
-

## Research Findings
<!-- Key discoveries during exploration -->
-

## Technical Decisions
<!-- Decisions made with rationale -->
| Decision | Rationale |
|----------|-----------|
|          |           |

## Issues Encountered
<!-- Errors and how they were resolved -->
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
<!-- URLs, file paths, API references -->
-

## Visual/Browser Findings
<!-- CRITICAL: Update after every 2 view/browser operations -->
<!-- Multimodal content must be captured as text immediately -->
-

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
`;
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 创建默认的进度日志文件
   */
  private async createDefaultProgress(filePath: string): Promise<void> {
    const content = `# Progress Log

## Session: ${new Date().toISOString()}

### Phase 1: [Title]
- **Status:** in_progress
- **Started:** ${new Date().toISOString()}
- Actions taken:
  -
- Files created/modified:
  -

### Phase 2: [Title]
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

## Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
|      |       |          |        |        |

## Error Log

<!-- Keep ALL errors - they help avoid repetition -->
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
|           |       | 1       |            |

## 5-Question Reboot Check
<!-- If you can answer these, context is solid -->
| Question | Answer |
|----------|--------|
| Where am I? | Phase X |
| Where am I going? | Remaining phases |
| What's the goal? | [goal statement] |
| What have I learned? | See findings.md |
| What have I done? | See above |

---
*Update after completing each phase or encountering errors*
`;
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 更新任务规划文件
   */
  async updateTaskPlan(taskId: string, updates: TaskPlanUpdate): Promise<void> {
    const taskPlanPath = path.join(this.baseDir, taskId, 'task_plan.md');
    let content = await fs.readFile(taskPlanPath, 'utf8');
    
    // 更新当前阶段
    if (updates.currentPhase) {
      content = content.replace(
        /## Current Phase\n.+/,
        `## Current Phase\n${updates.currentPhase}`
      );
    }
    
    // 更新阶段状态
    if (updates.phases) {
      for (const phase of updates.phases) {
        const phaseRegex = new RegExp(
          `### Phase [0-9]+: ${phase.name}.*?- \\*\\*Status:\\*\\* (pending|in_progress|completed)`,
          's'
        );
        content = content.replace(
          phaseRegex,
          `### Phase ${phase.name}\n- **Status:** ${phase.status}`
        );
      }
    }
    
    // 更新决策
    if (updates.decisions && updates.decisions.length > 0) {
      const decisionsSection = '## Decisions Made\n| Decision | Rationale |\n|----------|-----------|\n';
      const newDecisions = updates.decisions
        .map(d => `| ${d.decision} | ${d.rationale} |`)
        .join('\n');
      content = content.replace(
        /## Decisions Made\n[\s\S]*?(?=\n## Errors Encountered)/,
        `${decisionsSection}${newDecisions}`
      );
    }
    
    // 更新错误
    if (updates.errors && updates.errors.length > 0) {
      const errorsSection = '## Errors Encountered\n| Error | Attempt | Resolution |\n|-------|---------|------------|\n';
      const newErrors = updates.errors
        .map(e => `| ${e.error} | ${e.attempt} | ${e.resolution || ''} |`)
        .join('\n');
      content = content.replace(
        /## Errors Encountered\n[\s\S]*?(?=\n## Notes)/,
        `${errorsSection}${newErrors}`
      );
    }
    
    await fs.writeFile(taskPlanPath, content, 'utf8');
  }

  /**
   * 添加研究发现
   */
  async addFinding(taskId: string, finding: Finding): Promise<void> {
    const findingsPath = path.join(this.baseDir, taskId, 'findings.md');
    let content = await fs.readFile(findingsPath, 'utf8');
    
    const timestamp = finding.timestamp.toISOString();
    let section = '';
    
    switch (finding.category) {
      case 'requirement':
        section = '## Requirements';
        break;
      case 'research':
        section = '## Research Findings';
        break;
      case 'decision':
        section = '## Technical Decisions';
        break;
      case 'issue':
        section = '## Issues Encountered';
        break;
      case 'resource':
        section = '## Resources';
        break;
    }
    
    // 找到对应的 section 并添加内容
    const sectionRegex = new RegExp(`(${section}\\n[\\s\\S]*?)(?=\\n## |$)`);
    const match = content.match(sectionRegex);
    
    if (match) {
      const newContent = `${match[1]}\n- ${finding.content} (${timestamp})`;
      content = content.replace(sectionRegex, newContent);
    }
    
    await fs.writeFile(findingsPath, content, 'utf8');
  }

  /**
   * 记录进度
   */
  async recordProgress(taskId: string, progress: ProgressEntry): Promise<void> {
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    let content = await fs.readFile(progressPath, 'utf8');
    
    // 找到对应的 phase 并更新
    const phaseRegex = new RegExp(
      `(### Phase [0-9]+: [\\s\\S]*?Actions taken:\\n[\\s\\S]*?Files created/modified:\\n[\\s\\S]*?)(?=\\n### |\\n## |$)`
    );
    
    const match = content.match(phaseRegex);
    
    if (match) {
      const timestamp = progress.timestamp.toISOString();
      const newActions = `${match[1]}  - ${progress.action} (${timestamp})\n`;
      
      if (progress.files && progress.files.length > 0) {
        const newFiles = newActions + `  - ${progress.files.join(', ')}\n`;
        content = content.replace(phaseRegex, newFiles);
      } else {
        content = content.replace(phaseRegex, newActions);
      }
    }
    
    await fs.writeFile(progressPath, content, 'utf8');
  }

  /**
   * 记录错误
   */
  async recordError(taskId: string, error: ErrorEntry): Promise<void> {
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    let content = await fs.readFile(progressPath, 'utf8');
    
    // 更新 Error Log 部分
    const errorLogSection = '## Error Log\n| Timestamp | Error | Attempt | Resolution |\n|-----------|-------|---------|------------|\n';
    const newError = `| ${error.timestamp.toISOString()} | ${error.error} | ${error.attempt} | ${error.resolution || ''} |`;
    
    content = content.replace(
      /## Error Log\n[\s\S]*?(?=\n## 5-Question Reboot Check)/,
      `${errorLogSection}${newError}\n`
    );
    
    await fs.writeFile(progressPath, content, 'utf8');
  }

  /**
   * 更新阶段状态
   */
  async updatePhaseStatus(
    taskId: string,
    phase: string,
    status: 'pending' | 'in_progress' | 'completed'
  ): Promise<void> {
    const taskPlanPath = path.join(this.baseDir, taskId, 'task_plan.md');
    let content = await fs.readFile(taskPlanPath, 'utf8');
    
    const phaseRegex = new RegExp(
      `(### Phase [0-9]+: ${phase}.*?- \\*\\*Status:\\*\\*) (pending|in_progress|completed)`
    );
    
    content = content.replace(phaseRegex, `$1 ${status}`);
    
    await fs.writeFile(taskPlanPath, content, 'utf8');
  }

  /**
   * 读取任务规划
   */
  async readTaskPlan(taskId: string): Promise<any> {
    const taskPlanPath = path.join(this.baseDir, taskId, 'task_plan.md');
    const content = await fs.readFile(taskPlanPath, 'utf8');
    
    // 解析 task_plan.md
    const currentPhaseMatch = content.match(/## Current Phase\n(.+)/);
    const currentPhase = currentPhaseMatch ? currentPhaseMatch[1].trim() : '';
    
    const phases: Phase[] = [];
    const phaseMatches = content.matchAll(/### Phase [0-9]+: (.+?)\n[\s\S]*?- \*\*Status:\*\* (pending|in_progress|completed)/g);
    for (const match of phaseMatches) {
      phases.push({
        name: match[1],
        status: match[2] as 'pending' | 'in_progress' | 'completed'
      });
    }
    
    const completedPhases = phases
      .filter(p => p.status === 'completed')
      .map(p => p.name);
    
    return {
      currentPhase,
      phases,
      completedPhases
    };
  }

  /**
   * 读取研究发现
   */
  async readFindings(taskId: string): Promise<Finding[]> {
    const findingsPath = path.join(this.baseDir, taskId, 'findings.md');
    const content = await fs.readFile(findingsPath, 'utf8');
    
    // 解析 findings.md
    const findings: Finding[] = [];
    
    // 解析 Requirements
    const requirementsMatch = content.match(/## Requirements\n([\s\S]*?)(?=\n## )/);
    if (requirementsMatch) {
      const lines = requirementsMatch[1].split('\n').filter(l => l.trim() && l.startsWith('-'));
      for (const line of lines) {
        findings.push({
          category: 'requirement',
          content: line.replace(/^- /, '').trim(),
          timestamp: new Date()
        });
      }
    }
    
    // 解析 Research Findings
    const researchMatch = content.match(/## Research Findings\n([\s\S]*?)(?=\n## )/);
    if (researchMatch) {
      const lines = researchMatch[1].split('\n').filter(l => l.trim() && l.startsWith('-'));
      for (const line of lines) {
        findings.push({
          category: 'research',
          content: line.replace(/^- /, '').replace(/\([^)]+\)$/, '').trim(),
          timestamp: new Date()
        });
      }
    }
    
    return findings;
  }

  /**
   * 读取进度日志
   */
  async readProgress(taskId: string): Promise<ProgressEntry[]> {
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    const content = await fs.readFile(progressPath, 'utf8');
    
    // 解析 progress.md
    const progressEntries: ProgressEntry[] = [];
    
    const phaseMatches = content.matchAll(/### Phase [0-9]+: (.+?)\n[\s\S]*?- \*\*Status:\*\* (in_progress|completed|failed)\n[\s\S]*?Actions taken:\n([\s\S]*?)(?=\n### |$)/g);
    for (const match of phaseMatches) {
      const actions = match[3].split('\n').filter(l => l.trim() && l.startsWith('-'));
      for (const action of actions) {
        progressEntries.push({
          phase: match[1],
          status: match[2] as 'in_progress' | 'completed' | 'failed',
          action: action.replace(/^- /, '').replace(/\([^)]+\)$/, '').trim(),
          timestamp: new Date()
        });
      }
    }
    
    return progressEntries;
  }

  /**
   * 恢复任务状态（用于中断恢复）
   */
  async restoreTaskState(taskId: string): Promise<TaskState> {
    const taskPlan = await this.readTaskPlan(taskId);
    const findings = await this.readFindings(taskId);
    const progress = await this.readProgress(taskId);
    
    // 读取错误
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    const progressContent = await fs.readFile(progressPath, 'utf8');
    
    const errors: ErrorEntry[] = [];
    const errorMatches = progressContent.matchAll(/\| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/g);
    for (const match of errorMatches) {
      if (match[1] !== 'Timestamp') {
        errors.push({
          timestamp: new Date(match[1]),
          error: match[2],
          attempt: parseInt(match[3]),
          resolution: match[4] || undefined
        });
      }
    }
    
    return {
      currentPhase: taskPlan.currentPhase,
      completedPhases: taskPlan.completedPhases,
      findings,
      progress,
      errors
    };
  }

  /**
   * 清理或归档三文件系统
   */
  async cleanup(taskId: string, archive: boolean = false): Promise<void> {
    const taskDir = path.join(this.baseDir, taskId);
    
    if (archive) {
      // 归档到 archive 目录
      const archiveDir = path.join(this.baseDir, 'archive', taskId);
      await fs.mkdir(path.dirname(archiveDir), { recursive: true });
      await fs.rename(taskDir, archiveDir);
    } else {
      // 删除
      await fs.rm(taskDir, { recursive: true });
    }
  }
}
```

**预期产出**:
- 完整的三文件系统管理器实现
- 单元测试套件

**验收标准**:
- 三文件创建和管理正常
- 文件更新和读取正常
- 任务状态恢复正常
- 单元测试覆盖率 > 80%

---

**任务 6.2: 集成到 Worktree 创建流程**

**文件**: `src/orchestration/managers/GitWorktreeManager.ts`（修改）

```typescript
import { TaskPlanningFilesManager } from './TaskPlanningFiles';

export class GitWorktreeManager {
  private planningFilesManager: TaskPlanningFilesManager;

  constructor() {
    this.planningFilesManager = new TaskPlanningFilesManager();
  }

  /**
   * 创建 Worktree 并初始化三文件系统
   */
  async create(config: WorktreeConfig): Promise<Worktree> {
    // ... 原有的 worktree 创建逻辑 ...

    // 初始化三文件系统
    const planningFiles = await this.planningFilesManager.initializeTask(
      config.subtaskId,
      config.subtask.description,
      worktreePath
    );

    // 将 planning 文件路径添加到 worktree 对象
    worktree.planningFiles = planningFiles;

    return worktree;
  }
}
```

**预期产出**:
- Worktree 创建时自动创建三文件系统
- 单元测试

**验收标准**:
- Worktree 创建时三文件系统自动创建
- 单元测试通过

---

**任务 6.3: 集成到动态智能体生成**

**文件**: `src/orchestration/agents/DynamicAgentGenerator.ts`（修改）

```typescript
import { TaskPlanningFilesManager } from '../managers/TaskPlanningFiles';

export class DynamicAgentGenerator {
  private planningFilesManager: TaskPlanningFilesManager;

  constructor() {
    this.planningFilesManager = new TaskPlanningFilesManager();
  }

  /**
   * 生成智能体并配置三文件系统
   */
  async generateAgentForTask(task: TacticalTask): Promise<Agent> {
    // 创建任务规划文件
    const planningFiles = await this.planningFilesManager.initializeTask(
      task.id,
      task.description,
      task.worktreePath
    );

    // 生成智能体配置
    const agent = await this.createAgent(task, planningFiles);

    // 将 planning 文件路径添加到智能体配置中
    agent.config.planningFiles = planningFiles;

    // 添加智能体特定的规则
    agent.config.rules = [
      ...agent.config.rules,
      '先创建计划再执行',
      '每次查看/浏览后立即保存发现',
      '决策前重读计划',
      '记录所有错误'
    ];

    return agent;
  }
}
```

**预期产出**:
- 智能体生成时自动配置三文件系统
- 单元测试

**验收标准**:
- 智能体生成时三文件系统自动配置
- 智能体使用三文件系统记录工作
- 单元测试通过

---

**任务 6.4: 集成到 ResumeSession**

**文件**: `src/orchestration/integration/ResumeSessionIntegration.ts`（修改）

```typescript
import { TaskPlanningFilesManager } from '../managers/TaskPlanningFiles';

export class ResumeSessionIntegration {
  private planningFilesManager: TaskPlanningFilesManager;

  constructor() {
    this.planningFilesManager = new TaskPlanningFilesManager();
  }

  /**
   * 保存任务状态（包括三文件系统）
   */
  async saveTaskState(taskId: string, task: OrchestratedTask): Promise<void> {
    // 保存任务状态
    await this.saveTaskMetadata(taskId, task);

    // 保存三文件系统
    if (task.planningFiles) {
      await this.savePlanningFiles(taskId, task.planningFiles);
    }
  }

  /**
   * 恢复任务状态（包括三文件系统）
   */
  async restoreTaskState(taskId: string): Promise<OrchestratedTask | null> {
    // 恢复任务状态
    const task = await this.loadTaskMetadata(taskId);

    // 恢复三文件系统
    const planningFiles = await this.loadPlanningFiles(taskId);
    task.planningFiles = planningFiles;

    // 读取 task_plan.md 恢复上下文
    if (planningFiles.taskPlan) {
      const taskState = await this.planningFilesManager.restoreTaskState(taskId);
      task.currentPhase = taskState.currentPhase;
      task.completedPhases = taskState.completedPhases;
      task.findings = taskState.findings;
      task.progress = taskState.progress;
      task.errors = taskState.errors;
    }

    return task;
  }
}
```

**预期产出**:
- ResumeSession 保存和恢复三文件系统
- 单元测试

**验收标准**:
- ResumeSession 保存三文件系统正常
- ResumeSession 恢复三文件系统正常
- 中断恢复时快速恢复状态
- 单元测试通过

---

**任务 6.5: 集成到事件总线**

**文件**: `src/orchestration/events/EventBus.ts`（修改）

```typescript
import { TaskPlanningFilesManager } from '../managers/TaskPlanningFiles';

export class EventBus {
  private planningFilesManager: TaskPlanningFilesManager;

  constructor() {
    this.planningFilesManager = new TaskPlanningFilesManager();
  }

  /**
   * 发布事件（重要事件记录到 findings.md）
   */
  async publish(event: Event): Promise<void> {
    // 发布事件
    await this.persistEvent(event);

    // 如果是重要事件，记录到 findings.md
    if (this.isImportantEvent(event)) {
      await this.recordFinding(event);
    }

    // 如果是错误事件，记录到 task_plan.md 和 progress.md
    if (event.type === 'error.occurred') {
      await this.recordError(event);
    }

    // 如果是阶段完成事件，更新 task_plan.md
    if (event.type === 'phase.completed') {
      await this.updatePhaseStatus(event);
    }

    // 通知订阅者
    const handlers = this.subscribers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  /**
   * 判断是否是重要事件
   */
  private isImportantEvent(event: Event): boolean {
    const importantTypes = [
      'task.created',
      'task.completed',
      'task.failed',
      'worktree.created',
      'worktree.merged',
      'conflict.detected'
    ];
    return importantTypes.includes(event.type);
  }

  /**
   * 记录研究发现
   */
  private async recordFinding(event: Event): Promise<void> {
    const finding: Finding = {
      category: 'research',
      content: `${event.type}: ${JSON.stringify(event.data)}`,
      timestamp: new Date(event.timestamp)
    };

    await this.planningFilesManager.addFinding(event.correlationId || 'default', finding);
  }

  /**
   * 记录错误
   */
  private async recordError(event: Event): Promise<void> {
    const error: ErrorEntry = {
      error: event.data.error || 'Unknown error',
      attempt: event.data.attempt || 1,
      timestamp: new Date(event.timestamp)
    };

    await this.planningFilesManager.recordError(event.correlationId || 'default', error);
  }

  /**
   * 更新阶段状态
   */
  private async updatePhaseStatus(event: Event): Promise<void> {
    await this.planningFilesManager.updatePhaseStatus(
      event.correlationId || 'default',
      event.data.phase,
      'completed'
    );
  }
}
```

**预期产出**:
- 事件总线自动记录重要事件到三文件系统
- 单元测试

**验收标准**:
- 重要事件自动记录到 findings.md
- 错误事件自动记录到 task_plan.md 和 progress.md
- 阶段完成事件自动更新 task_plan.md
- 单元测试通过

---

**任务 6.6: 编写集成测试**

**文件**: `src/orchestration/__tests__/integration/planning-files.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TaskPlanningFilesManager } from '../../managers/TaskPlanningFiles';
import { Finding, ProgressEntry } from '../../managers/TaskPlanningFiles';

describe('TaskPlanningFiles Integration Tests', () => {
  let manager: TaskPlanningFilesManager;
  const testTaskId = 'test-task-1';

  beforeEach(async () => {
    manager = new TaskPlanningFilesManager('.test-planning-files');
  });

  afterEach(async () => {
    await manager.cleanup(testTaskId, false);
  });

  it('should initialize task with three files', async () => {
    const planningFiles = await manager.initializeTask(
      testTaskId,
      'Test task description',
      '/tmp/test-worktree'
    );

    expect(planningFiles.taskPlan).toContain('task_plan.md');
    expect(planningFiles.findings).toContain('findings.md');
    expect(planningFiles.progress).toContain('progress.md');
  });

  it('should update task plan', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    await manager.updateTaskPlan(testTaskId, {
      currentPhase: 'Phase 2',
      phases: [
        { name: 'Phase 1', status: 'completed' },
        { name: 'Phase 2', status: 'in_progress' }
      ]
    });

    const taskPlan = await manager.readTaskPlan(testTaskId);
    expect(taskPlan.currentPhase).toBe('Phase 2');
    expect(taskPlan.completedPhases).toContain('Phase 1');
  });

  it('should add findings', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    const finding: Finding = {
      category: 'research',
      content: 'Test research finding',
      timestamp: new Date()
    };

    await manager.addFinding(testTaskId, finding);

    const findings = await manager.readFindings(testTaskId);
    expect(findings).toHaveLength(1);
    expect(findings[0].content).toBe('Test research finding');
  });

  it('should record progress', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    const progress: ProgressEntry = {
      phase: 'Phase 1',
      status: 'in_progress',
      action: 'Test action',
      timestamp: new Date()
    };

    await manager.recordProgress(testTaskId, progress);

    const progressLog = await manager.readProgress(testTaskId);
    expect(progressLog).toHaveLength(1);
    expect(progressLog[0].action).toBe('Test action');
  });

  it('should record errors', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    await manager.recordError(testTaskId, {
      error: 'Test error',
      attempt: 1,
      timestamp: new Date()
    });

    const taskState = await manager.restoreTaskState(testTaskId);
    expect(taskState.errors).toHaveLength(1);
    expect(taskState.errors[0].error).toBe('Test error');
  });

  it('should restore task state', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    // 更新一些状态
    await manager.updateTaskPlan(testTaskId, {
      currentPhase: 'Phase 2'
    });

    await manager.addFinding(testTaskId, {
      category: 'research',
      content: 'Test finding',
      timestamp: new Date()
    });

    // 恢复状态
    const taskState = await manager.restoreTaskState(testTaskId);

    expect(taskState.currentPhase).toBe('Phase 2');
    expect(taskState.findings).toHaveLength(1);
  });

  it('should cleanup task files', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    await manager.cleanup(testTaskId, false);

    // 尝试读取应该失败
    await expect(manager.readTaskPlan(testTaskId)).rejects.toThrow();
  });

  it('should archive task files', async () => {
    await manager.initializeTask(testTaskId, 'Test task', '/tmp/test');

    await manager.cleanup(testTaskId, true);

    // 检查是否归档
    const archivedPath = '.test-planning-files/archive/test-task-1';
    await expect(fs.access(archivedPath)).resolves.not.toThrow();
  });
});
```

**预期产出**:
- 完整的集成测试套件
- 测试覆盖率报告

**验收标准**:
- 所有集成测试通过
- 测试覆盖率 > 80%
- 测试文档完整

---

### 阶段 7: 集成测试和部署（1-2 周）

#### 目标
- 进行完整的集成测试
- 进行性能测试
- 准备部署文档
- 进行用户验收测试

#### 关键任务

**任务 7.1: 编写集成测试**

**文件**: `src/orchestration/__tests__/integration/orchestration-flow.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CentralOrchestrator } from '../../core/CentralOrchestrator';
import { EnhancedTerminalManager } from '../../managers/EnhancedTerminalManager';
import { GitWorktreeManager } from '../../managers/GitWorktreeManager';
import { StateLockManager } from '../../managers/StateLockManager';
import { HookSystem } from '../../hooks/HookSystem';
import { ResumeSessionIntegration } from '../../integration/ResumeSessionIntegration';

describe('Orchestration Flow Integration Tests', () => {
  let orchestrator: CentralOrchestrator;
  let terminalManager: EnhancedTerminalManager;
  let worktreeManager: GitWorktreeManager;
  let lockManager: StateLockManager;
  let hookSystem: HookSystem;
  let resumeSession: ResumeSessionIntegration;

  beforeAll(async () => {
    // 初始化所有组件
    orchestrator = new CentralOrchestrator();
    terminalManager = new EnhancedTerminalManager();
    worktreeManager = new GitWorktreeManager();
    lockManager = new StateLockManager();
    hookSystem = new HookSystem();
    resumeSession = new ResumeSessionIntegration();
  });

  afterAll(async () => {
    // 清理
    await terminalManager.cleanup();
    await worktreeManager.cleanupAllWorktrees();
  });

  it('should execute full orchestration flow', async () => {
    // 1. 创建任务
    const taskId = await orchestrator.createOrchestrationTask(
      '实现电商系统',
      {
        mode: 'parallel',
        dependencies: []
      }
    );

    expect(taskId).toBeDefined();

    // 2. 获取任务
    const task = await orchestrator.getTask(taskId);
    expect(task).toBeDefined();
    expect(task.subtasks.length).toBeGreaterThan(0);

    // 3. 创建 Worktrees
    const worktrees: Record<string, any> = {};
    for (const subtask of task.subtasks) {
      const worktree = await worktreeManager.create({
        taskId,
        subtaskId: subtask.id,
        subtask,
        projectPath: process.cwd()
      });
      worktrees[subtask.id] = worktree;
    }

    expect(Object.keys(worktrees).length).toBe(task.subtasks.length);

    // 4. 初始化锁
    await lockManager.initializeTask(taskId, task.subtasks);

    // 5. 启动终端
    const launchResults = await terminalManager.launchTerminalsForTask(
      task,
      task.strategy,
      worktrees
    );

    expect(launchResults.every(r => r.success)).toBe(true);

    // 6. 等待所有终端完成
    const terminalIds = launchResults
      .filter(r => r.success && r.terminalId)
      .map(r => r.terminalId!);

    const results = await terminalManager.waitForAllTerminals(terminalIds);

    expect(results.every(r => r.success)).toBe(true);

    // 7. 聚合结果
    const aggregatedResult = await orchestrator.aggregateResults(taskId);

    expect(aggregatedResult).toBeDefined();
    expect(aggregatedResult.status).toBe('completed');

    // 8. 清理
    await lockManager.cleanup(taskId);
  }, 60000); // 60 秒超时

  it('should handle task interruption and recovery', async () => {
    // 1. 创建任务
    const taskId = await orchestrator.createOrchestrationTask(
      '测试任务',
      {
        mode: 'parallel',
        dependencies: []
      }
    );

    // 2. 保存任务状态
    const task = await orchestrator.getTask(taskId);
    await resumeSession.saveTaskState(taskId, task);

    // 3. 模拟中断
    await resumeSession.recordHistory(taskId, {
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      type: 'task.interrupted',
      data: { reason: 'User interruption' }
    });

    // 4. 恢复任务
    const restoredTask = await resumeSession.restoreTaskState(taskId);
    expect(restoredTask).toBeDefined();
    expect(restoredTask.id).toBe(taskId);

    // 5. 查询历史
    const history = await resumeSession.queryHistory(taskId);
    expect(history).toHaveLength(1);
    expect(history[0].type).toBe('task.interrupted');

    // 6. 清理
    await resumeSession.cleanupSession(taskId);
  });
});
```

**预期产出**:
- 完整的集成测试套件
- 测试覆盖率报告
- 测试文档

**验收标准**:
- 所有集成测试通过
- 集成测试覆盖率 > 70%
- 测试文档完整

---

**任务 6.2: 编写性能测试**

**文件**: `src/orchestration/__tests__/performance/performance.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { CentralOrchestrator } from '../../core/CentralOrchestrator';

describe('Performance Tests', () => {
  let orchestrator: CentralOrchestrator;

  beforeEach(() => {
    orchestrator = new CentralOrchestrator();
  });

  it('should achieve 3x speedup with parallel execution', async () => {
    // 测量串行执行时间
    const sequentialStart = Date.now();
    await orchestrator.executeOrchestrationTask(
      '测试任务',
      { mode: 'sequential', dependencies: [] }
    );
    const sequentialTime = Date.now() - sequentialStart;

    // 测量并行执行时间
    const parallelStart = Date.now();
    await orchestrator.executeOrchestrationTask(
      '测试任务',
      { mode: 'parallel', dependencies: [] }
    );
    const parallelTime = Date.now() - parallelStart;

    // 计算加速比
    const speedup = sequentialTime / parallelTime;

    expect(speedup).toBeGreaterThan(3);
  }, 120000); // 2 分钟超时

  it('should complete within time budget', async () => {
    const startTime = Date.now();

    await orchestrator.executeOrchestrationTask(
      '测试任务',
      { mode: 'parallel', dependencies: [] }
    );

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(30 * 60 * 1000); // 30 分钟
  }, 1800000); // 30 分钟超时

  it('should handle concurrent tasks efficiently', async () => {
    const taskCount = 8;
    const startTime = Date.now();

    const promises = Array.from({ length: taskCount }, (_, i) =>
      orchestrator.executeOrchestrationTask(
        `测试任务 ${i}`,
        { mode: 'parallel', dependencies: [] }
      )
    );

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    const averageTime = duration / taskCount;

    expect(averageTime).toBeLessThan(5 * 60 * 1000); // 平均每个任务 5 分钟
  }, 1800000); // 30 分钟超时
});
```

**预期产出**:
- 完整的性能测试套件
- 性能基准报告
- 性能优化建议

**验收标准**:
- 并发执行效率提升 > 3x
- 任务完成时间在预算内
- 性能基准建立

---

**任务 6.3: 编写部署文档**

**文件**: `docs/orchestration/DEPLOYMENT.md`

```markdown
# Stigmergy CLI 多智能体编排系统 - 部署文档

## 1. 系统要求

### 1.1 硬件要求
- CPU: 4 核心或更高
- 内存: 8GB 或更高
- 磁盘: 10GB 可用空间

### 1.2 软件要求
- Node.js: 16.0 或更高
- Git: 2.0 或更高
- 操作系统: Windows 10+, Linux, macOS

## 2. 安装流程

### 2.1 安装 Stigmergy CLI

```bash
npm install -g stigmergy-cli
```

### 2.2 初始化协调系统

```bash
stigmergy coord init
```

### 2.3 安装 CLI Hook

```bash
# 为每个 CLI 安装 Hook
stigmergy hooks install claude
stigmergy hooks install gemini
stigmergy hooks install iflow
stigmergy hooks install opencode
```

### 2.4 验证安装

```bash
stigmergy coord status
stigmergy hooks status claude
```

## 3. 升级流程

### 3.1 备份现有配置

```bash
cp -r ~/.stigmergy ~/.stigmergy.backup
```

### 3.2 升级 Stigmergy CLI

```bash
npm update -g stigmergy-cli
```

### 3.3 更新 Hook

```bash
stigmergy hooks install claude
stigmergy hooks install gemini
stigmergy hooks install iflow
stigmergy hooks install opencode
```

### 3.4 验证升级

```bash
stigmergy coord status
stigmergy --version
```

## 4. 回滚流程

### 4.1 恢复配置

```bash
rm -rf ~/.stigmergy
cp -r ~/.stigmergy.backup ~/.stigmergy
```

### 4.2 降级 Stigmergy CLI

```bash
npm install -g stigmergy-cli@<previous-version>
```

## 5. 故障排除

### 5.1 Hook 安装失败

**问题**: Hook 安装失败

**解决方案**:
```bash
# 手动创建 Hook 目录
mkdir -p ~/.claude/.stigmergy/hooks

# 手动复制 Hook 文件
cp <stigmergy-path>/hooks/task-detection.js ~/.claude/.stigmergy/hooks/
```

### 5.2 Worktree 创建失败

**问题**: Worktree 创建失败

**解决方案**:
```bash
# 检查 Git 版本
git --version

# 清理现有 Worktrees
stigmergy worktree cleanup

# 重新创建
stigmergy worktree create <task-id> <subtask-id>
```

### 5.3 锁获取失败

**问题**: 锁获取失败

**解决方案**:
```bash
# 查看锁状态
stigmergy locks list

# 强制释放锁
stigmergy locks force-release <subtask-id>

# 清理所有锁
stigmergy locks cleanup
```
```

**预期产出**:
- 完整的部署文档
- 安装脚本
- 升级脚本
- 回滚脚本

**验收标准**:
- 部署文档完整
- 安装流程可行
- 升级流程可行
- 回滚流程可行

---

## 3. 测试策略

### 3.1 单元测试

**目标覆盖率**: > 80%

**测试框架**: Jest

**测试文件位置**: `src/orchestration/**/__tests__/**/*.test.ts`

**运行命令**:
```bash
npm run test:unit
```

### 3.2 集成测试

**目标覆盖率**: > 70%

**测试框架**: Jest

**测试文件位置**: `src/orchestration/__tests__/integration/**/*.test.ts`

**运行命令**:
```bash
npm run test:integration
```

### 3.3 性能测试

**测试框架**: Jest

**测试文件位置**: `src/orchestration/__tests__/performance/**/*.test.ts`

**运行命令**:
```bash
npm run test:performance
```

### 3.4 兼容性测试

**测试平台**: Windows, Linux, macOS

**测试 CLI**: claude, gemini, iflow, opencode

**运行命令**:
```bash
npm run test:compatibility
```

## 4. 部署流程

### 4.1 开发环境部署

1. 克隆代码库
2. 安装依赖: `npm install`
3. 运行测试: `npm test`
4. 构建项目: `npm run build`
5. 本地测试: `npm run test:e2e`

### 4.2 生产环境部署

1. 备份现有配置
2. 安装新版本: `npm install -g stigmergy-cli@<version>`
3. 初始化协调系统: `stigmergy coord init`
4. 安装 Hook: `stigmergy hooks install <cli>`
5. 验证安装: `stigmergy coord status`

### 4.3 回滚流程

1. 停止所有运行的任务
2. 恢复配置备份
3. 降级到旧版本: `npm install -g stigmergy-cli@<previous-version>`
4. 验证回滚: `stigmergy --version`

## 5. 验收标准

### 5.1 功能验收标准

- **AC-1**: 能够并发启动 4 个 CLI 工具并成功执行任务
- **AC-2**: 能够为每个 CLI 创建独立的 Git Worktree
- **AC-3**: 能够正确处理文件锁和依赖关系
- **AC-4**: 能够自动检测和解决合并冲突
- **AC-5**: 能够在中断后恢复任务
- **AC-6**: 现有功能完全不受影响
- **AC-7**: ResumeSession 集成正常工作

### 5.2 性能验收标准

- **AC-8**: 并发执行效率提升 > 3x
- **AC-9**: 系统响应时间 < 2 秒
- **AC-10**: 内存使用 < 500MB
- **AC-11**: 锁操作时间 < 100ms

### 5.3 兼容性验收标准

- **AC-12**: 现有 `stigmergy call` 功能 100% 兼容
- **AC-13**: 现有 Hook 系统 100% 兼容
- **AC-14**: 现有 ResumeSession 功能 100% 兼容
- **AC-15**: 支持 Windows/Linux/macOS
- **AC-16**: 支持 Git 2.0+

## 6. 风险管理

### 6.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Git Worktree 不稳定 | 高 | 中 | 实现平台适配层，提供降级方案 |
| 文件系统锁并发问题 | 高 | 低 | 使用文件锁和超时机制 |
| 终端管理复杂 | 中 | 高 | 限制并发数量，提供配置选项 |

### 6.2 兼容性风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 破坏现有 Hook 系统 | 高 | 低 | 保持 Hook 接口向后兼容 |
| ResumeSession 集成 bug | 中 | 中 | 作为可选功能，不影响核心流程 |
| CLI 参数化不支持 | 中 | 中 | 提供默认参数，支持自定义配置 |

### 6.3 性能风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 并发终端过多 | 高 | 低 | 实现资源监控和限制机制 |
| Worktree 创建耗时 | 中 | 中 | 优化 Worktree 操作，提供缓存 |
| 事件日志写入影响性能 | 低 | 中 | 使用异步写入，批量操作 |

## 7. 成功指标

### 7.1 功能指标
- **KPI-1**: 并发执行效率提升 > 3x
- **KPI-2**: 任务成功率 > 95%
- **KPI-3**: 冲突自动解决率 > 80%
- **KPI-4**: 中断恢复成功率 > 90%

### 7.2 性能指标
- **KPI-5**: 平均任务完成时间减少 > 50%
- **KPI-6**: 系统响应时间 < 2 秒
- **KPI-7**: 内存使用 < 500MB
- **KPI-8**: 锁操作时间 < 100ms

### 7.3 质量指标
- **KPI-9**: 现有功能兼容性 = 100%
- **KPI-10**: 单元测试覆盖率 > 80%
- **KPI-11**: 集成测试覆盖率 > 70%
- **KPI-12**: 代码审查通过率 > 95%

### 7.4 用户体验指标
- **KPI-13**: 用户满意度 > 4.0/5.0
- **KPI-14**: 学习曲线 < 1 周
- **KPI-15**: 问题解决时间 < 1 天

## 8. 时间估算

| 阶段 | 任务 | 预计时间 | 实际时间 |
|------|------|----------|----------|
| 阶段 1 | 基础架构 | 2-3 周 | ___ |
| 阶段 2 | 多终端并发 | 2-3 周 | ___ |
| 阶段 3 | Git Worktree | 1-2 周 | ___ |
| 阶段 4 | Hook 集成 | 1-2 周 | ___ |
| 阶段 5 | ResumeSession | 1 周 | ___ |
| 阶段 6 | 集成测试 | 1-2 周 | ___ |
| **总计** | | **8-12 周** | **___** |

## 11. 追溯矩阵

### 11.1 需求到测试的追溯

| 需求 ID | 需求描述 | 测试文件 | 测试用例 |
|---------|---------|---------|---------|
| FR-1.1 | 并发启动终端 | TerminalManager.test.ts | should launch multiple terminals |
| FR-1.2 | 独立运行 CLI | TerminalManager.test.ts | should run CLI independently |
| FR-1.3 | 配置环境变量 | TerminalManager.test.ts | should configure environment variables |
| FR-1.4 | 监控终端状态 | TerminalManager.test.ts | should monitor terminal status |
| FR-1.5 | 读取终端输出 | TerminalManager.test.ts | should read terminal output |
| FR-1.6 | 终止指定终端 | TerminalManager.test.ts | should terminate terminal |
| FR-1.7 | 批量等待终端 | TerminalManager.test.ts | should wait for all terminals |
| FR-2.1 | 指定智能体 | TerminalManager.test.ts | should specify agent |
| FR-2.2 | 指定技能 | TerminalManager.test.ts | should specify skills |
| FR-2.3 | MCP 工具配置 | TerminalManager.test.ts | should configure MCP tools |
| FR-2.4 | 工作目录指定 | TerminalManager.test.ts | should specify working directory |
| FR-2.5 | CLI 特定参数 | TerminalManager.test.ts | should support CLI specific parameters |
| FR-3.1 | 创建 worktree | WorktreeManager.test.ts | should create worktree |
| FR-3.2 | 创建任务分支 | WorktreeManager.test.ts | should create task branch |
| FR-3.3 | 同步配置文件 | WorktreeManager.test.ts | should sync config files |
| FR-3.4 | 初始化协调上下文 | WorktreeManager.test.ts | should initialize coordination context |
| FR-4.1 | Squash 合并 | WorktreeManager.test.ts | should support squash merge |
| FR-4.2 | Merge 合并 | WorktreeManager.test.ts | should support merge strategy |
| FR-4.3 | 检测合并冲突 | WorktreeManager.test.ts | should detect merge conflicts |
| FR-4.4 | 提供冲突建议 | WorktreeManager.test.ts | should provide conflict suggestions |
| FR-4.5 | 选择性合并 | WorktreeManager.test.ts | should support selective merge |
| FR-5.1 | 删除 worktree | WorktreeManager.test.ts | should delete worktree |
| FR-5.2 | 批量清理 worktree | WorktreeManager.test.ts | should batch cleanup worktrees |
| FR-5.3 | 保留 worktree | WorktreeManager.test.ts | should keep worktree for debugging |
| FR-5.4 | 清理临时文件 | WorktreeManager.test.ts | should cleanup temp files |
| FR-6.1 | 原子锁操作 | LockManager.test.ts | should acquire lock atomically |
| FR-6.2 | 依赖关系检查 | LockManager.test.ts | should check dependencies |
| FR-6.3 | 文件锁检测 | LockManager.test.ts | should check file locks |
| FR-6.4 | 锁超时释放 | LockManager.test.ts | should support lock timeout |
| FR-6.5 | 死锁检测预防 | LockManager.test.ts | should detect deadlock |
| FR-7.1 | 锁状态管理 | LockManager.test.ts | should manage lock states |
| FR-7.2 | 锁所有者记录 | LockManager.test.ts | should record lock owner |
| FR-7.3 | 锁获取时间 | LockManager.test.ts | should record lock acquisition time |
| FR-7.4 | 锁释放时间 | LockManager.test.ts | should record lock release time |
| FR-7.5 | 锁失败原因 | LockManager.test.ts | should record lock failure reason |
| FR-8.1 | 任务检测 Hook | HookSystem.test.ts | should detect task |
| FR-8.2 | 锁获取 Hook | HookSystem.test.ts | should acquire lock |
| FR-8.3 | 锁释放 Hook | HookSystem.test.ts | should release lock |
| FR-8.4 | 冲突检测 Hook | HookSystem.test.ts | should detect conflict |
| FR-8.5 | 事件发布 Hook | HookSystem.test.ts | should publish event |
| FR-9.1 | 任务创建事件 | EventBus.test.ts | should publish task created event |
| FR-9.2 | 锁获取事件 | EventBus.test.ts | should publish lock acquired event |
| FR-9.3 | 锁释放事件 | EventBus.test.ts | should publish lock released event |
| FR-9.4 | 任务完成事件 | EventBus.test.ts | should publish task completed event |
| FR-9.5 | 冲突检测事件 | EventBus.test.ts | should publish conflict detected event |
| FR-9.6 | 错误事件 | EventBus.test.ts | should publish error event |
| FR-10.1 | 任务分解 | Orchestrator.test.ts | should decompose task |
| FR-10.2 | CLI 分配 | Orchestrator.test.ts | should assign CLI |
| FR-10.3 | 智能体分配 | Orchestrator.test.ts | should assign agent |
| FR-10.4 | 技能分配 | Orchestrator.test.ts | should assign skills |
| FR-10.5 | 依赖分析 | Orchestrator.test.ts | should analyze dependencies |
| FR-11.1 | 并行执行 | Orchestrator.test.ts | should support parallel execution |
| FR-11.2 | 串行执行 | Orchestrator.test.ts | should support sequential execution |
| FR-11.3 | 混合执行 | Orchestrator.test.ts | should support hybrid execution |
| FR-11.4 | 自定义策略 | Orchestrator.test.ts | should support custom strategy |
| FR-11.5 | 并发度控制 | Orchestrator.test.ts | should support concurrency control |
| FR-12.1 | 收集结果 | ResultAggregator.test.ts | should collect results |
| FR-12.2 | 检测冲突 | ResultAggregator.test.ts | should detect conflicts |
| FR-12.3 | 生成摘要 | ResultAggregator.test.ts | should generate summary |
| FR-12.4 | 生成建议 | ResultAggregator.test.ts | should generate recommendations |
| FR-12.5 | 计算成功率 | ResultAggregator.test.ts | should calculate success rate |
| FR-13.1 | 保存任务状态 | ResumeSession.test.ts | should save task state |
| FR-13.2 | 中断恢复 | ResumeSession.test.ts | should support interrupt recovery |
| FR-13.3 | 传递上下文 | ResumeSession.test.ts | should pass minimal context |
| FR-13.4 | 收集结果摘要 | ResumeSession.test.ts | should collect result summary |
| FR-13.5 | 恢复任务 | ResumeSession.test.ts | should restore task |
| FR-14.1 | 传递描述 | ResumeSession.test.ts | should pass description |
| FR-14.2 | 传递依赖 | ResumeSession.test.ts | should pass dependencies |
| FR-14.3 | 传递路径 | ResumeSession.test.ts | should pass worktree path |
| FR-14.4 | 传递文件列表 | ResumeSession.test.ts | should pass required files |
| FR-14.5 | 传递输出列表 | ResumeSession.test.ts | should pass output files |
| FR-15.1 | 记录任务 | ResumeSession.test.ts | should record task |
| FR-15.2 | 记录分解 | ResumeSession.test.ts | should record decomposition |
| FR-15.3 | 记录策略 | ResumeSession.test.ts | should record strategy |
| FR-15.4 | 记录结果 | ResumeSession.test.ts | should record results |
| FR-15.5 | 记录合并 | ResumeSession.test.ts | should record merge |
| FR-16.1 | 创建 task_plan.md | SessionManager.test.ts | should create task plan |
| FR-16.2 | 包含目标阶段 | SessionManager.test.ts | should include goal phases |
| FR-16.3 | 记录决策 | SessionManager.test.ts | should record decisions |
| FR-16.4 | 记录错误 | SessionManager.test.ts | should record errors |
| FR-16.5 | 跟踪阶段 | SessionManager.test.ts | should track phase status |
| FR-17.1 | 创建 findings.md | SessionManager.test.ts | should create findings |
| FR-17.2 | 记录需求 | SessionManager.test.ts | should record requirements |
| FR-17.3 | 记录发现 | SessionManager.test.ts | should record findings |
| FR-17.4 | 记录问题 | SessionManager.test.ts | should record issues |
| FR-17.5 | 记录资源 | SessionManager.test.ts | should record resources |
| FR-18.1 | 创建 progress.md | SessionManager.test.ts | should create progress |
| FR-18.2 | 记录操作 | SessionManager.test.ts | should record actions |
| FR-18.3 | 记录文件 | SessionManager.test.ts | should record files |
| FR-18.4 | 记录测试 | SessionManager.test.ts | should record tests |
| FR-18.5 | 记录错误 | SessionManager.test.ts | should record errors |
| FR-19.1 | 自动创建 | SessionManager.test.ts | should auto create |
| FR-19.2 | 更新任务计划 | SessionManager.test.ts | should update task plan |
| FR-19.3 | 更新发现 | SessionManager.test.ts | should update findings |
| FR-19.4 | 更新进度 | SessionManager.test.ts | should update progress |
| FR-19.5 | 清理归档 | SessionManager.test.ts | should cleanup or archive |
| FR-20.1 | 先创建计划 | SessionManager.test.ts | should create plan first |
| FR-20.2 | 2-Action 规则 | SessionManager.test.ts | should follow 2-Action rule |
| FR-20.3 | 重读计划 | SessionManager.test.ts | should re-read plan before decision |
| FR-20.4 | 更新状态 | SessionManager.test.ts | should update status after phase |
| FR-20.5 | 记录错误 | SessionManager.test.ts | should record all errors |
| FR-20.6 | 永不重复失败 | SessionManager.test.ts | should never repeat failures |
| FR-20.7 | 3次失败升级 | SessionManager.test.ts | should escalate after 3 failures |
| FR-21.1 | 恢复阶段 | SessionManager.test.ts | should restore phase |
| FR-21.2 | 恢复发现 | SessionManager.test.ts | should restore findings |
| FR-21.3 | 恢复工作 | SessionManager.test.ts | should restore progress |
| FR-21.4 | 快速恢复 | SessionManager.test.ts | should restore quickly |
| FR-21.5 | 继续执行 | SessionManager.test.ts | should continue execution |
| FR-22.1 | 独立三文件 | SessionManager.test.ts | should have independent three files |
| FR-22.2 | 不共享 | SessionManager.test.ts | should not share files |
| FR-22.3 | 独立记录 | SessionManager.test.ts | should record independently |
| FR-22.4 | Git 合并 | SessionManager.test.ts | should share via Git merge |
| FR-22.5 | 事件通知 | SessionManager.test.ts | should notify via event bus |

**覆盖率**: 85/85 (100%)

## 9. 里程碑

- **M1** (第 3 周): 基础架构完成
- **M2** (第 6 周): 多终端并发完成
- **M3** (第 8 周): Git Worktree 完成
- **M4** (第 10 周): Hook 集成完成
- **M5** (第 11 周): ResumeSession 集成完成
- **M6** (第 12 周): 集成测试和部署完成

## 10. 附录

### 10.1 参考文档
- REQUIREMENTS.md - 需求文档
- DESIGN.md - 设计文档
- API.md - API 文档

### 10.2 相关工具
- Jest - 测试框架
- TypeScript - 类型系统
- Git - 版本控制

### 10.3 联系方式
- 项目负责人: [姓名]
- 技术支持: [邮箱]
- 问题反馈: [GitHub Issues]