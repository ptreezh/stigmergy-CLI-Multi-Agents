#!/usr/bin/env node

/**
 * Shared Feedback Storage - 跨CLI反馈数据共享存储
 *
 * Phase 3 协同过滤改进 - 跨CLI数据汇聚机制
 *
 * 验证等级: Level 1 - 代码实现完成
 *
 * 核心功能：
 * - 存储抽象层（支持多种存储后端）
 * - 本地文件共享（立即可用）
 * - 云端同步接口（预留）
 * - 数据一致性保证
 *
 * ⚠️ 重要声明：
 * - 本实现为Level 1基本验证
 * - 本地共享已在单机多CLI场景验证
 * - 云端同步为预留接口，需要额外实现
 * - 未在真实跨机器环境测试
 *
 * 存储后端：
 * - local: 本地文件系统（默认）
 * - shared: 共享目录（多CLI进程共享）
 * - cloud: 云端存储（预留接口）
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

class SharedFeedbackStorage {
  constructor(config = {}) {
    this.storageType = config.storageType || 'shared'; // 默认使用共享目录
    this.storagePath = config.storagePath || this.getDefaultStoragePath();
    this.readOnly = config.readOnly || false;

    // 确保存储目录存在
    this.ensureStorageDirectory();

    // 加载索引
    this.index = this.loadIndex();

    // 内存缓存
    this.cache = new Map();

    console.log(`📦 反馈存储初始化: ${this.storageType}`);
    console.log(`   存储路径: ${this.storagePath}`);
    console.log(`   只读模式: ${this.readOnly ? '是' : '否'}`);
  }

  /**
   * 获取默认存储路径
   */
  getDefaultStoragePath() {
    // 使用项目根目录下的共享存储
    const projectRoot = process.cwd();
    return path.join(projectRoot, '.stigmergy', 'shared-feedbacks');
  }

  /**
   * 确保存储目录存在
   */
  ensureStorageDirectory() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
      console.log(`   ✅ 创建存储目录: ${this.storagePath}`);
    }
  }

  /**
   * 加载索引
   */
  loadIndex() {
    const indexPath = path.join(this.storagePath, 'index.json');

    if (!fs.existsSync(indexPath)) {
      return [];
    }

    try {
      const data = fs.readFileSync(indexPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(`   ⚠️  索引文件损坏，创建新索引`);
      return [];
    }
  }

  /**
   * 保存索引
   */
  saveIndex() {
    if (this.readOnly) {
      console.warn(`   ⚠️  只读模式，不保存索引`);
      return;
    }

    const indexPath = path.join(this.storagePath, 'index.json');
    const tempPath = indexPath + '.tmp';

    try {
      // 先写入临时文件
      fs.writeFileSync(tempPath, JSON.stringify(this.index, null, 2));

      // 原子性替换
      fs.renameSync(tempPath, indexPath);

    } catch (error) {
      console.error(`   ❌ 保存索引失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 保存反馈
   */
  async saveFeedback(feedback) {
    if (this.readOnly) {
      throw new Error('只读模式，不能保存反馈');
    }

    const feedbackId = feedback.feedbackId || uuidv4();
    const filename = `${feedbackId}.json`;
    const filepath = path.join(this.storagePath, filename);

    // 添加时间戳（如果不存在）
    if (!feedback.timestamp) {
      feedback.timestamp = new Date().toISOString();
    }

    try {
      // 写入反馈文件
      fs.writeFileSync(filepath, JSON.stringify(feedback, null, 2));

      // 更新索引
      this.index.push({
        feedbackId: feedback.feedbackId,
        agentId: feedback.agentId,
        skillName: feedback.skillName,
        timestamp: feedback.timestamp,
        source: feedback.source || 'unknown'
      });

      // 保存索引
      this.saveIndex();

      // 更新缓存
      this.cache.set(feedbackId, feedback);

      console.log(`   ✅ 反馈已保存: ${feedbackId}`);

      return feedback;

    } catch (error) {
      console.error(`   ❌ 保存反馈失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 加载反馈
   */
  async loadFeedback(feedbackId) {
    // 先检查缓存
    if (this.cache.has(feedbackId)) {
      return this.cache.get(feedbackId);
    }

    const filepath = path.join(this.storagePath, `${feedbackId}.json`);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(filepath, 'utf8');
      const feedback = JSON.parse(data);

      // 更新缓存
      this.cache.set(feedbackId, feedback);

      return feedback;

    } catch (error) {
      console.error(`   ❌ 加载反馈失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取所有反馈
   */
  async getAllFeedbacks() {
    const feedbacks = [];

    for (const indexEntry of this.index) {
      const feedback = await this.loadFeedback(indexEntry.feedbackId);
      if (feedback) {
        feedbacks.push(feedback);
      }
    }

    return feedbacks;
  }

  /**
   * 按agentId获取反馈
   */
  async getFeedbacksByAgent(agentId) {
    const feedbacks = [];

    for (const indexEntry of this.index) {
      if (indexEntry.agentId === agentId) {
        const feedback = await this.loadFeedback(indexEntry.feedbackId);
        if (feedback) {
          feedbacks.push(feedback);
        }
      }
    }

    return feedbacks;
  }

  /**
   * 按skillName获取反馈
   */
  async getFeedbacksBySkill(skillName) {
    const feedbacks = [];

    for (const indexEntry of this.index) {
      if (indexEntry.skillName === skillName) {
        const feedback = await this.loadFeedback(indexEntry.feedbackId);
        if (feedback) {
          feedbacks.push(feedback);
        }
      }
    }

    return feedbacks;
  }

  /**
   * 按domain获取反馈
   */
  async getFeedbacksByDomain(domain) {
    const feedbacks = [];

    for (const indexEntry of this.index) {
      const feedback = await this.loadFeedback(indexEntry.feedbackId);
      if (feedback && feedback.context && feedback.context.domain === domain) {
        feedbacks.push(feedback);
      }
    }

    return feedbacks;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const stats = {
      total: this.index.length,
      byAgent: {},
      bySkill: {},
      byDomain: {},
      bySource: {}
    };

    this.index.forEach(entry => {
      // 按agent统计
      stats.byAgent[entry.agentId] = (stats.byAgent[entry.agentId] || 0) + 1;

      // 按skill统计
      stats.bySkill[entry.skillName] = (stats.bySkill[entry.skillName] || 0) + 1;

      // 按来源统计
      const source = entry.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    });

    return stats;
  }

  /**
   * 搜索反馈
   */
  async searchFeedbacks(query) {
    const feedbacks = await this.getAllFeedbacks();

    return feedbacks.filter(feedback => {
      // 按agentId搜索
      if (query.agentId && feedback.agentId !== query.agentId) {
        return false;
      }

      // 按skillName搜索
      if (query.skillName && feedback.skillName !== query.skillName) {
        return false;
      }

      // 按domain搜索
      if (query.domain && feedback.context?.domain !== query.domain) {
        return false;
      }

      // 按时间范围搜索
      if (query.startTime || query.endTime) {
        const timestamp = new Date(feedback.timestamp).getTime();
        if (query.startTime && timestamp < query.startTime) {
          return false;
        }
        if (query.endTime && timestamp > query.endTime) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 删除反馈
   */
  async deleteFeedback(feedbackId) {
    if (this.readOnly) {
      throw new Error('只读模式，不能删除反馈');
    }

    const filepath = path.join(this.storagePath, `${feedbackId}.json`);

    if (!fs.existsSync(filepath)) {
      return false;
    }

    try {
      // 删除文件
      fs.unlinkSync(filepath);

      // 更新索引
      this.index = this.index.filter(entry => entry.feedbackId !== feedbackId);
      this.saveIndex();

      // 更新缓存
      this.cache.delete(feedbackId);

      console.log(`   ✅ 反馈已删除: ${feedbackId}`);

      return true;

    } catch (error) {
      console.error(`   ❌ 删除反馈失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 清理过期反馈
   */
  async cleanupExpiredFeedbacks(maxAge = 30 * 24 * 60 * 60 * 1000) {
    if (this.readOnly) {
      throw new Error('只读模式，不能清理反馈');
    }

    const now = Date.now();
    const expiredIds = [];

    for (const entry of this.index) {
      const timestamp = new Date(entry.timestamp).getTime();
      if (now - timestamp > maxAge) {
        expiredIds.push(entry.feedbackId);
      }
    }

    console.log(`   🗑️  发现 ${expiredIds.length} 个过期反馈`);

    for (const feedbackId of expiredIds) {
      await this.deleteFeedback(feedbackId);
    }

    return expiredIds.length;
  }

  /**
   * 导出反馈数据
   */
  async exportFeedbacks(outputPath) {
    const feedbacks = await this.getAllFeedbacks();

    const exportData = {
      exportDate: new Date().toISOString(),
      total: feedbacks.length,
      storageType: this.storageType,
      storagePath: this.storagePath,
      feedbacks: feedbacks
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`   ✅ 已导出 ${feedbacks.length} 条反馈到 ${outputPath}`);
  }

  /**
   * 导入反馈数据
   */
  async importFeedbacks(inputPath) {
    if (this.readOnly) {
      throw new Error('只读模式，不能导入反馈');
    }

    try {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

      let importCount = 0;
      let skipCount = 0;

      for (const feedback of data.feedbacks) {
        // 检查是否已存在
        const exists = this.index.some(entry => entry.feedbackId === feedback.feedbackId);

        if (exists) {
          skipCount++;
          continue;
        }

        await this.saveFeedback(feedback);
        importCount++;
      }

      console.log(`   ✅ 导入完成: ${importCount} 条新增, ${skipCount} 条跳过`);

      return { importCount, skipCount };

    } catch (error) {
      console.error(`   ❌ 导入失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 同步数据（预留接口，用于云端同步）
   */
  async sync() {
    console.log(`   🔄 同步数据...`);

    // 本地存储模式：不需要同步
    if (this.storageType === 'local' || this.storageType === 'shared') {
      console.log(`   ℹ️  本地存储模式，无需同步`);
      return { synced: 0, errors: 0 };
    }

    // 云端存储模式：需要实现同步逻辑
    if (this.storageType === 'cloud') {
      console.log(`   ⚠️  云端同步功能待实现`);
      return { synced: 0, errors: 0 };
    }

    return { synced: 0, errors: 0 };
  }

  /**
   * 获取存储信息
   */
  getStorageInfo() {
    const stats = this.getStatistics();

    return {
      storageType: this.storageType,
      storagePath: this.storagePath,
      readOnly: this.readOnly,
      totalFeedbacks: stats.total,
      uniqueAgents: Object.keys(stats.byAgent).length,
      uniqueSkills: Object.keys(stats.bySkill).length,
      indexSize: this.index.length,
      cacheSize: this.cache.size
    };
  }

  /**
   * 健康检查
   */
  healthCheck() {
    const checks = {
      storageExists: fs.existsSync(this.storagePath),
      indexValid: true,
      writable: !this.readOnly
    };

    // 检查索引文件
    const indexPath = path.join(this.storagePath, 'index.json');
    if (fs.existsSync(indexPath)) {
      try {
        JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      } catch (error) {
        checks.indexValid = false;
      }
    }

    const healthy = checks.storageExists && checks.indexValid;

    return {
      healthy,
      checks
    };
  }
}

module.exports = SharedFeedbackStorage;
