/**
 * Event Bus Types
 * 事件总线类型定义
 */

export interface EventHandler<T = any> {
  (event: T): void | Promise<void>;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  once: boolean;
}

export interface Event<T = any> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  source?: string;
}

export interface EventBusOptions {
  maxHistorySize?: number;
  enableHistory?: boolean;
  enableStatistics?: boolean;
}

export interface EventBusStatistics {
  totalEvents: number;
  totalSubscriptions: number;
  eventsByType: Record<string, number>;
  subscriptionsByType: Record<string, number>;
  averageProcessingTime: number;
}