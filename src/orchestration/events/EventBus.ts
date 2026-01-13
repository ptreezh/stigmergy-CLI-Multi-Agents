import fs from 'fs/promises';
import path from 'path';
import { Event, EventType } from '../types';
import { FILE_PATHS } from '../config';
import { TaskPlanningFilesManager } from '../managers/TaskPlanningFiles';

export type EventHandler = (event: Event) => Promise<void> | void;

export class EventBus {
  private eventLog: Event[] = [];
  private subscribers: Map<EventType, EventHandler[]> = new Map();
  private logFile: string = FILE_PATHS.eventLog;
  private isListening: boolean = false;
  private planningFilesManager: TaskPlanningFilesManager = new TaskPlanningFilesManager();

  /**
   * 发布事件
   */
  async publish(event: Event): Promise<void> {
    try {
      // 1. 记录到内存
      this.eventLog.push(event);
      
      // 2. 持久化到文件
      await this.persistEvent(event);
      
      // 3. 如果是重要事件，记录到 findings.md
      if (this.isImportantEvent(event) && event.correlationId) {
        await this.recordFinding(event);
      }
      
      // 4. 如果是错误事件，记录到 task_plan.md
      if (event.type === 'error.occurred' && event.correlationId) {
        await this.recordErrorToTaskPlan(event);
      }
      
      // 5. 通知所有订阅者
      const handlers = this.subscribers.get(event.type) || [];
      await Promise.allSettled(
        handlers.map(handler => {
          const result = handler(event);
          // 处理 Promise 和同步返回值
          return Promise.resolve(result).catch((error: Error) => 
            console.error(`Event handler error for ${event.type}:`, error)
          );
        })
      );
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  }

  /**
   * 判断是否是重要事件
   */
  private isImportantEvent(event: Event): boolean {
    const importantTypes: EventType[] = [
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
    try {
      const finding = {
        category: 'research' as const,
        content: `${event.type}: ${JSON.stringify(event.data)}`,
        timestamp: new Date(event.timestamp)
      };

      await this.planningFilesManager.addFinding(
        event.correlationId || 'default',
        finding
      );
    } catch (error) {
      // 记录失败不应该阻止事件发布
      console.error('Error recording finding:', error);
    }
  }

  /**
   * 记录错误到任务规划
   */
  private async recordErrorToTaskPlan(event: Event): Promise<void> {
    try {
      const error = {
        error: event.data.error || 'Unknown error',
        attempt: event.data.attempt || 1,
        resolution: event.data.resolution,
        timestamp: new Date(event.timestamp)
      };

      await this.planningFilesManager.updateTaskPlan(
        event.correlationId || 'default',
        { errors: [error] }
      );
    } catch (error) {
      // 记录失败不应该阻止事件发布
      console.error('Error recording error to task plan:', error);
    }
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