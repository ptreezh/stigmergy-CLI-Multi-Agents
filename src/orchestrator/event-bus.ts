/**
 * Event Bus
 * 事件总线
 * 负责事件的发布、订阅和分发
 */

import { randomUUID } from 'crypto';
import {
  EventHandler,
  Event,
  EventSubscription,
  EventBusOptions,
  EventBusStatistics,
} from './event-types';

export class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private history: Event[] = [];
  private statistics: EventBusStatistics = {
    totalEvents: 0,
    totalSubscriptions: 0,
    eventsByType: {},
    subscriptionsByType: {},
    averageProcessingTime: 0,
  };
  private processingTimes: number[] = [];

  private options: Required<EventBusOptions>;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      maxHistorySize: options.maxHistorySize || 100,
      enableHistory: options.enableHistory !== false,
      enableStatistics: options.enableStatistics !== false,
    };
  }

  /**
   * 订阅事件
   */
  async subscribe<T = any>(
    eventType: string,
    handler: EventHandler<T>
  ): Promise<string> {
    const subscriptionId = randomUUID();
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      once: false,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);

    if (this.options.enableStatistics) {
      this.statistics.totalSubscriptions++;
      this.statistics.subscriptionsByType[eventType] =
        (this.statistics.subscriptionsByType[eventType] || 0) + 1;
    }

    return subscriptionId;
  }

  /**
   * 订阅事件（一次性）
   */
  async subscribeOnce<T = any>(
    eventType: string,
    handler: EventHandler<T>
  ): Promise<string> {
    const subscriptionId = randomUUID();
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      once: true,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);

    if (this.options.enableStatistics) {
      this.statistics.totalSubscriptions++;
      this.statistics.subscriptionsByType[eventType] =
        (this.statistics.subscriptionsByType[eventType] || 0) + 1;
    }

    return subscriptionId;
  }

  /**
   * 取消订阅
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    let found = false;

    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        found = true;

        if (this.options.enableStatistics) {
          this.statistics.totalSubscriptions--;
          this.statistics.subscriptionsByType[eventType]--;
        }

        break;
      }
    }

    if (!found) {
      throw new Error('Subscription not found');
    }
  }

  /**
   * 发布事件
   */
  async publish<T = any>(
    eventType: string,
    data: T,
    source?: string
  ): Promise<void> {
    const event: Event<T> = {
      id: randomUUID(),
      type: eventType,
      data,
      timestamp: new Date(),
      source,
    };

    // 记录历史
    if (this.options.enableHistory) {
      this.history.push(event);
      if (this.history.length > this.options.maxHistorySize) {
        this.history.shift();
      }
    }

    // 更新统计
    if (this.options.enableStatistics) {
      this.statistics.totalEvents++;
      this.statistics.eventsByType[eventType] =
        (this.statistics.eventsByType[eventType] || 0) + 1;
    }

    // 获取订阅者
    const subscriptions = this.subscriptions.get(eventType) || [];
    if (subscriptions.length === 0) {
      return;
    }

    // 执行事件处理器
    const startTime = Date.now();
    const subscriptionsToRemove: string[] = [];

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await subscription.handler(event);

          if (subscription.once) {
            subscriptionsToRemove.push(subscription.id);
          }
        } catch (error) {
          // 记录错误但不中断其他处理器
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      })
    );

    // 移除一次性订阅
    for (const subscriptionId of subscriptionsToRemove) {
      await this.unsubscribe(subscriptionId);
    }

    // 更新处理时间统计
    if (this.options.enableStatistics) {
      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift();
      }
      this.statistics.averageProcessingTime =
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    }
  }

  /**
   * 获取事件历史
   */
  async getHistory(eventType?: string): Promise<Event[]> {
    if (!this.options.enableHistory) {
      return [];
    }

    if (eventType) {
      return this.history.filter(event => event.type === eventType);
    }

    return [...this.history];
  }

  /**
   * 清除事件历史
   */
  async clearHistory(): Promise<void> {
    this.history = [];
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<EventBusStatistics> {
    if (!this.options.enableStatistics) {
      return {
        totalEvents: 0,
        totalSubscriptions: 0,
        eventsByType: {},
        subscriptionsByType: {},
        averageProcessingTime: 0,
      };
    }

    return { ...this.statistics };
  }

  /**
   * 清除所有订阅和历史
   */
  async clearAll(): Promise<void> {
    this.subscriptions.clear();
    this.history = [];
    this.statistics = {
      totalEvents: 0,
      totalSubscriptions: 0,
      eventsByType: {},
      subscriptionsByType: {},
      averageProcessingTime: 0,
    };
    this.processingTimes = [];
  }
}