/**
 * Goal Manager
 * 目标管理器
 * 负责管理用户定义的目标
 */

import { randomUUID } from 'crypto';

export interface GoalCondition {
  type: string;
  description: string;
  check: () => Promise<boolean>;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  conditions: GoalCondition[];
  tasks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export class GoalManager {
  private goals: Map<string, Goal> = new Map();
  private goalCounter: number = 0;

  /**
   * 创建目标
   */
  async createGoal(goalData: Omit<Goal, 'id'>): Promise<Goal> {
    const goalId = `goal-${++this.goalCounter}-${randomUUID()}`;

    const goal: Goal = {
      ...goalData,
      id: goalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.goals.set(goalId, goal);
    return goal;
  }

  /**
   * 更新目标
   */
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const goal = this.goals.get(goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    const updatedGoal: Goal = {
      ...goal,
      ...updates,
      updatedAt: new Date(),
    };

    this.goals.set(goalId, updatedGoal);
    return updatedGoal;
  }

  /**
   * 获取目标
   */
  async getGoal(goalId: string): Promise<Goal> {
    const goal = this.goals.get(goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    return goal;
  }

  /**
   * 列出所有目标
   */
  async listGoals(filters?: GoalFilters): Promise<Goal[]> {
    let goals = Array.from(this.goals.values());

    if (filters?.status) {
      goals = goals.filter(goal => goal.status === filters.status);
    }

    return goals;
  }

  /**
   * 检查目标是否完成
   */
  async checkGoalCompletion(goalId: string): Promise<boolean> {
    const goal = await this.getGoal(goalId);

    // 如果没有条件，默认为未完成
    if (!goal.conditions || goal.conditions.length === 0) {
      return false;
    }

    // 检查所有条件是否满足
    const results = await Promise.all(
      goal.conditions.map(condition => condition.check())
    );

    const isCompleted = results.every(result => result === true);

    // 如果所有条件都满足，自动更新目标状态
    if (isCompleted) {
      await this.updateGoal(goalId, { status: 'completed' });
    }

    return isCompleted;
  }

  /**
   * 添加任务到目标
   */
  async addTaskToGoal(goalId: string, taskId: string): Promise<Goal> {
    const goal = await this.getGoal(goalId);

    if (!goal.tasks.includes(taskId)) {
      goal.tasks.push(taskId);
    }

    return this.updateGoal(goalId, { tasks: goal.tasks });
  }

  /**
   * 从目标移除任务
   */
  async removeTaskFromGoal(goalId: string, taskId: string): Promise<Goal> {
    const goal = await this.getGoal(goalId);

    goal.tasks = goal.tasks.filter(id => id !== taskId);

    return this.updateGoal(goalId, { tasks: goal.tasks });
  }

  /**
   * 删除目标
   */
  async deleteGoal(goalId: string): Promise<void> {
    this.goals.delete(goalId);
  }

  /**
   * 清除所有目标
   */
  async clearAll(): Promise<void> {
    this.goals.clear();
    this.goalCounter = 0;
  }
}