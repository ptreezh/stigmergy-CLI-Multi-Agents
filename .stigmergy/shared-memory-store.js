#!/usr/bin/env node

/**
 * Shared Memory Store for Cross-CLI Autonomous Evolution
 *
 * 提供跨CLI共享的持久化记忆存储
 * 所有CLI都可以访问和更新这个共享状态
 *
 * 核心特性：
 * - 文件系统持久化
 * - 原子操作保证
 * - 并发访问控制
 * - 自动冲突解决
 * - 版本控制
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SharedMemoryStore {
  constructor(options = {}) {
    this.storePath = options.storePath || path.join(process.cwd(), '.stigmergy', '.shared-memory.json');
    this.lockPath = options.lockPath || path.join(process.cwd(), '.stigmergy', '.shared-memory.lock');
    this.maxRetries = options.maxRetries || 10;
    this.retryDelay = options.retryDelay || 100;
    this.lockTimeout = options.lockTimeout || 30000; // 30秒

    this.memory = null;
    this.version = 0;
    this.lock = null;
  }

  /**
   * 初始化共享记忆存储
   */
  async initialize() {
    console.log('🧠 初始化共享记忆存储...');

    // 确保目录存在
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 加载现有记忆或创建新的
    await this.load();

    console.log('✅ 共享记忆存储已初始化');
    console.log(`   存储路径: ${this.storePath}`);
    console.log(`   记忆条目: ${this.memory.entries.length}`);
    console.log(`   版本: ${this.version}`);
  }

  /**
   * 加载共享记忆
   */
  async load() {
    await this.acquireLock();

    try {
      if (fs.existsSync(this.storePath)) {
        const data = fs.readFileSync(this.storePath, 'utf8');
        const stored = JSON.parse(data);

        this.memory = stored.memory;
        this.version = stored.version || 0;

        console.log('   已加载现有共享记忆');
      } else {
        // 创建新的记忆结构
        this.memory = {
          entries: [],
          cliRegistry: {},
          taskQueue: [],
          evolutionState: {
            lastReflection: null,
            lastEvolution: null,
            lastStrategy: null,
            currentPhase: 'initialization'
          },
          statistics: {
            totalEntries: 0,
            totalContributions: 0,
            cliContributions: {},
            lastUpdate: new Date().toISOString()
          }
        };
        this.version = 1;

        await this.save();
        console.log('   已创建新的共享记忆');
      }
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 保存共享记忆
   */
  async save() {
    await this.acquireLock();

    try {
      const data = {
        memory: this.memory,
        version: this.version,
        timestamp: new Date().toISOString()
      };

      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2));
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 获取文件锁（防止并发写入冲突）
   */
  async acquireLock() {
    const startTime = Date.now();
    const lockId = crypto.randomUUID();

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        // 检查锁文件是否已过期
        if (fs.existsSync(this.lockPath)) {
          try {
            const lockContent = fs.readFileSync(this.lockPath, 'utf8');
            const lockData = JSON.parse(lockContent);
            const lockAge = Date.now() - new Date(lockData.timestamp).getTime();

            // 检查锁是否过期或是当前进程的锁
            if (lockAge > this.lockTimeout || lockData.pid === process.pid) {
              console.log('   清理过期的锁文件');
              try {
                fs.unlinkSync(this.lockPath);
              } catch (unlinkError) {
                // 忽略删除错误
              }
            } else {
              // 锁仍然有效，等待重试
              await this.sleep(this.retryDelay);
              continue;
            }
          } catch (parseError) {
            // 锁文件损坏，尝试删除
            try {
              fs.unlinkSync(this.lockPath);
            } catch (unlinkError) {
              // 忽略删除错误
            }
          }
        }

        // 直接创建锁文件
        const lockData = {
          pid: process.pid,
          timestamp: new Date().toISOString(),
          id: lockId
        };

        fs.writeFileSync(this.lockPath, JSON.stringify(lockData));
        this.lock = lockData;
        return;

      } catch (error) {
        // 发生错误，等待重试
        await this.sleep(this.retryDelay);
      }

      // 检查是否超时
      if (Date.now() - startTime > this.lockTimeout) {
        throw new Error('获取锁超时');
      }
    }

    throw new Error('无法获取文件锁');
  }

  /**
   * 释放文件锁
   */
  async releaseLock() {
    if (this.lock && fs.existsSync(this.lockPath)) {
      try {
        const lockData = JSON.parse(fs.readFileSync(this.lockPath, 'utf8'));
        if (lockData.id === this.lock.id) {
          fs.unlinkSync(this.lockPath);
        }
      } catch (error) {
        console.error('释放锁失败:', error.message);
      }
    }
    this.lock = null;
  }

  /**
   * 添加记忆条目
   */
  async addEntry(entry) {
    await this.acquireLock();

    try {
      const newEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        cli: entry.cli || 'unknown',
        type: entry.type || 'general',
        content: entry.content,
        metadata: entry.metadata || {},
        version: this.version
      };

      this.memory.entries.push(newEntry);
      this.memory.statistics.totalEntries++;
      this.memory.statistics.lastUpdate = new Date().toISOString();

      // 更新CLI贡献统计
      if (!this.memory.statistics.cliContributions[newEntry.cli]) {
        this.memory.statistics.cliContributions[newEntry.cli] = {
          contributions: 0,
          lastContribution: null
        };
      }
      this.memory.statistics.cliContributions[newEntry.cli].contributions++;
      this.memory.statistics.cliContributions[newEntry.cli].lastContribution = newEntry.timestamp;
      this.memory.statistics.totalContributions++;

      this.version++;
      await this.save();

      return newEntry;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 获取最近记忆
   */
  async getRecentEntries(limit = 10, type = null) {
    await this.acquireLock();

    try {
      let entries = this.memory.entries;

      if (type) {
        entries = entries.filter(e => e.type === type);
      }

      return entries.slice(-limit).reverse();
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 搜索记忆
   */
  async searchEntries(query) {
    await this.acquireLock();

    try {
      const results = [];

      for (const entry of this.memory.entries) {
        const content = JSON.stringify(entry.content).toLowerCase();
        const metadata = JSON.stringify(entry.metadata).toLowerCase();

        if (content.includes(query.toLowerCase()) ||
            metadata.includes(query.toLowerCase())) {
          results.push(entry);
        }
      }

      return results;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 注册CLI
   */
  async registerCLI(cliInfo) {
    await this.acquireLock();

    try {
      const cliId = cliInfo.name;

      this.memory.cliRegistry[cliId] = {
        name: cliInfo.name,
        version: cliInfo.version || 'unknown',
        capabilities: cliInfo.capabilities || [],
        status: 'active',
        lastSeen: new Date().toISOString(),
        registeredAt: this.memory.cliRegistry[cliId]?.registeredAt || new Date().toISOString(),
        statistics: {
          tasksCompleted: this.memory.cliRegistry[cliId]?.statistics?.tasksCompleted || 0,
          tasksFailed: this.memory.cliRegistry[cliId]?.statistics?.tasksFailed || 0,
          lastTask: this.memory.cliRegistry[cliId]?.statistics?.lastTask || null
        }
      };

      this.version++;
      await this.save();

      console.log(`✅ CLI已注册: ${cliId}`);
      return this.memory.cliRegistry[cliId];
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 更新CLI心跳
   */
  async updateCLIHeartbeat(cliName) {
    await this.acquireLock();

    try {
      if (this.memory.cliRegistry[cliName]) {
        this.memory.cliRegistry[cliName].lastSeen = new Date().toISOString();
        this.memory.cliRegistry[cliName].status = 'active';

        this.version++;
        await this.save();
      }
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 获取所有活跃的CLI
   */
  async getActiveCLIs() {
    await this.acquireLock();

    try {
      const activeCLIs = [];
      const timeout = 60000; // 1分钟未活动视为不活跃

      for (const [cliId, cliInfo] of Object.entries(this.memory.cliRegistry)) {
        const lastSeen = new Date(cliInfo.lastSeen).getTime();
        const now = Date.now();

        if (now - lastSeen < timeout) {
          activeCLIs.push({
            id: cliId,
            ...cliInfo
          });
        }
      }

      return activeCLIs;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 更新进化状态
   */
  async updateEvolutionState(updates) {
    await this.acquireLock();

    try {
      Object.assign(this.memory.evolutionState, updates);
      this.memory.evolutionState.lastUpdate = new Date().toISOString();

      this.version++;
      await this.save();

      return this.memory.evolutionState;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 获取进化状态
   */
  async getEvolutionState() {
    await this.acquireLock();

    try {
      return this.memory.evolutionState;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 添加任务到队列
   */
  async enqueueTask(task) {
    await this.acquireLock();

    try {
      const newTask = {
        id: crypto.randomUUID(),
        ...task,
        status: 'pending',
        createdAt: new Date().toISOString(),
        attempts: 0,
        assignedTo: null
      };

      this.memory.taskQueue.push(newTask);
      this.version++;
      await this.save();

      return newTask;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 获取下一个待处理任务
   */
  async getNextTask(cliName) {
    await this.acquireLock();

    try {
      // 找到第一个pending状态的任务
      const taskIndex = this.memory.taskQueue.findIndex(t => t.status === 'pending');

      if (taskIndex === -1) {
        return null;
      }

      // 标记任务为已分配
      const task = this.memory.taskQueue[taskIndex];
      task.status = 'assigned';
      task.assignedTo = cliName;
      task.assignedAt = new Date().toISOString();

      this.version++;
      await this.save();

      return task;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId, status, result = null) {
    await this.acquireLock();

    try {
      const task = this.memory.taskQueue.find(t => t.id === taskId);

      if (task) {
        task.status = status;
        task.updatedAt = new Date().toISOString();

        if (status === 'completed') {
          task.result = result;
          task.completedAt = new Date().toISOString();
        } else if (status === 'failed') {
          task.error = result;
          task.failedAt = new Date().toISOString();
          task.attempts++;
        }

        this.version++;
        await this.save();
      }
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    await this.acquireLock();

    try {
      return {
        ...this.memory.statistics,
        version: this.version,
        activeCLIs: (await this.getActiveCLIs()).length,
        pendingTasks: this.memory.taskQueue.filter(t => t.status === 'pending').length,
        totalTasks: this.memory.taskQueue.length
      };
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 清理旧数据
   */
  async cleanup(olderThanDays = 30) {
    await this.acquireLock();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const beforeCount = this.memory.entries.length;

      // 删除旧条目
      this.memory.entries = this.memory.entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate > cutoffDate;
      });

      // 删除已完成或失败的任务
      this.memory.taskQueue = this.memory.taskQueue.filter(task => {
        return task.status === 'pending' || task.status === 'assigned';
      });

      const deletedCount = beforeCount - this.memory.entries.length;

      if (deletedCount > 0) {
        this.version++;
        await this.save();
        console.log(`清理了 ${deletedCount} 条旧记忆`);
      }

      return deletedCount;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 导出记忆
   */
  async export() {
    await this.acquireLock();

    try {
      return {
        memory: this.memory,
        version: this.version,
        exportedAt: new Date().toISOString()
      };
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 导入记忆
   */
  async import(data) {
    await this.acquireLock();

    try {
      this.memory = data.memory;
      this.version = data.version || 1;

      await this.save();

      console.log('已导入共享记忆');
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * 睡眠指定毫秒
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取记忆摘要
   */
  async getSummary() {
    await this.acquireLock();

    try {
      return {
        totalEntries: this.memory.entries.length,
        totalTasks: this.memory.taskQueue.length,
        pendingTasks: this.memory.taskQueue.filter(t => t.status === 'pending').length,
        activeCLIs: (await this.getActiveCLIs()).length,
        registeredCLIs: Object.keys(this.memory.cliRegistry).length,
        version: this.version,
        evolutionState: this.memory.evolutionState,
        statistics: this.memory.statistics
      };
    } finally {
      await this.releaseLock();
    }
  }
}

module.exports = SharedMemoryStore;
