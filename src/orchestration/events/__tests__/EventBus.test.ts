import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EventBus, EventHandler } from '../EventBus';
import { Event, EventType } from '../../types';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(async () => {
    eventBus = new EventBus();
    await eventBus.startListening();
  });

  afterEach(async () => {
    eventBus.stopListening();
    await eventBus.clearEventLog();
  });

  describe('publish', () => {
    it('should publish an event', async () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      await expect(eventBus.publish(event)).resolves.not.toThrow();
    });

    it('should notify subscribers', async () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      let receivedEvent: Event | undefined;
      const handler: EventHandler = (e) => {
        receivedEvent = e;
      };

      eventBus.subscribe('task.created', handler);
      await eventBus.publish(event);

      expect(receivedEvent).not.toBeUndefined();
      expect(receivedEvent?.id).toBe('event-1');
    });

    it('should handle multiple subscribers', async () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      const receivedEvents: Event[] = [];
      const handler1: EventHandler = (e) => { receivedEvents.push(e); };
      const handler2: EventHandler = (e) => { receivedEvents.push(e); };

      eventBus.subscribe('task.created', handler1);
      eventBus.subscribe('task.created', handler2);
      await eventBus.publish(event);

      expect(receivedEvents).toHaveLength(2);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to an event type', () => {
      const handler: EventHandler = () => {};
      
      expect(() => {
        eventBus.subscribe('task.created', handler);
      }).not.toThrow();
    });

    it('should support multiple subscriptions to same event', () => {
      const handler1: EventHandler = () => {};
      const handler2: EventHandler = () => {};

      expect(() => {
        eventBus.subscribe('task.created', handler1);
        eventBus.subscribe('task.created', handler2);
      }).not.toThrow();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from an event', async () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      let receivedEvent: Event | undefined;
      const handler: EventHandler = (e) => {
        receivedEvent = e;
      };

      eventBus.subscribe('task.created', handler);
      eventBus.unsubscribe('task.created', handler);
      await eventBus.publish(event);

      expect(receivedEvent).toBeUndefined();
    });
  });

  describe('getEventLog', () => {
    it('should return all events', async () => {
      const event1: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      const event2: Event = {
        id: 'event-2',
        type: 'task.started',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      await eventBus.publish(event1);
      await eventBus.publish(event2);

      const events = await eventBus.getEventLog();
      expect(events).toHaveLength(2);
    });

    it('should filter events by timestamp', async () => {
      const now = new Date();
      const oneSecondAgo = new Date(now.getTime() - 1000);

      const event1: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: oneSecondAgo,
        source: 'test',
        data: { taskId: 'task-1' }
      };

      const event2: Event = {
        id: 'event-2',
        type: 'task.started',
        timestamp: now,
        source: 'test',
        data: { taskId: 'task-1' }
      };

      await eventBus.publish(event1);
      await eventBus.publish(event2);

      const events = await eventBus.getEventLog(now);
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event-2');
    });
  });

  describe('clearEventLog', () => {
    it('should clear the event log', async () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      await eventBus.publish(event);
      await eventBus.clearEventLog();

      const events = await eventBus.getEventLog();
      expect(events).toHaveLength(0);
    });
  });

  describe('cleanupExpiredEvents', () => {
    it('should remove expired events', async () => {
      const now = new Date();
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

      const oldEvent: Event = {
        id: 'old-event',
        type: 'task.created',
        timestamp: eightDaysAgo,
        source: 'test',
        data: { taskId: 'task-1' }
      };

      const newEvent: Event = {
        id: 'new-event',
        type: 'task.started',
        timestamp: now,
        source: 'test',
        data: { taskId: 'task-1' }
      };

      // 直接添加到事件日志（模拟旧事件）
      await eventBus.publish(oldEvent);
      await eventBus.publish(newEvent);

      await eventBus.cleanupExpiredEvents();

      const events = await eventBus.getEventLog();
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('new-event');
    });
  });

  describe('error handling', () => {
    it('should handle handler errors gracefully', async () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { taskId: 'task-1' }
      };

      const errorHandler: EventHandler = async () => {
        throw new Error('Handler error');
      };

      const successHandler: EventHandler = () => {};

      eventBus.subscribe('task.created', errorHandler);
      eventBus.subscribe('task.created', successHandler);

      // 应该不会抛出错误，因为错误被捕获了
      // Promise.allSettled 确保即使有错误也会成功
      const result = eventBus.publish(event);
      await expect(result).resolves.not.toThrow();
    });
  });
});