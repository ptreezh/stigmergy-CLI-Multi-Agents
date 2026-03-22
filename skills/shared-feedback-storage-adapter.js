#!/usr/bin/env node

/**
 * Shared Feedback Storage Adapter - 反馈存储适配器
 *
 * 为现有SkillFeedbackCollector添加跨CLI共享能力
 *
 * 核心功能：
 * - 适配现有反馈收集器
 * - 自动同步到共享存储
 * - 零配置使用（默认共享目录）
 * - 向后兼容
 *
 * 使用场景（当前项目实际情况）：
 * - 单机多CLI场景（Claude + Gemini + Qwen）
 * - 开发者本地测试
 * - 小团队协作
 */

const SharedFeedbackStorage = require('./shared-feedback-storage');

class SharedFeedbackStorageAdapter {
  constructor(config = {}) {
    // 初始化共享存储
    this.sharedStorage = new SharedFeedbackStorage({
      storageType: 'shared',  // 使用共享目录模式
      storagePath: config.storagePath,
      readOnly: false
    });

    // 自动同步配置
    this.autoSync = config.autoSync !== false;  // 默认启用
    this.syncInterval = config.syncInterval || 60000;  // 1分钟

    // 启动自动同步
    if (this.autoSync) {
      this.startAutoSync();
    }

    console.log(`🔄 共享存储适配器初始化`);
    console.log(`   自动同步: ${this.autoSync ? '启用' : '禁用'}`);
  }

  /**
   * 启动自动同步
   */
  startAutoSync() {
    this.syncTimer = setInterval(async () => {
      try {
        await this.syncToShared();
      } catch (error) {
        console.error(`   ⚠️  自动同步失败: ${error.message}`);
      }
    }, this.syncInterval);

    console.log(`   ⏰ 自动同步已启动 (间隔: ${this.syncInterval/1000}秒)`);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log(`   ⏹️  自动同步已停止`);
    }
  }

  /**
   * 同步本地反馈到共享存储
   */
  async syncToShared(localFeedbacks = []) {
    let synced = 0;
    let skipped = 0;

    for (const feedback of localFeedbacks) {
      try {
        // 添加来源标识
        feedback.source = process.env.CLI_NAME || 'unknown';

        await this.sharedStorage.saveFeedback(feedback);
        synced++;
      } catch (error) {
        // 可能已存在，跳过
        skipped++;
      }
    }

    if (synced > 0) {
      console.log(`   🔄 同步完成: ${synced} 条新增, ${skipped} 条跳过`);
    }

    return { synced, skipped };
  }

  /**
   * 从共享存储加载所有反馈
   */
  async loadFromShared() {
    const feedbacks = await this.sharedStorage.getAllFeedbacks();
    console.log(`   📥 从共享存储加载 ${feedbacks.length} 条反馈`);
    return feedbacks;
  }

  /**
   * 获取共享统计
   */
  getSharedStats() {
    return this.sharedStorage.getStatistics();
  }

  /**
   * 获取存储信息
   */
  getStorageInfo() {
    return this.sharedStorage.getStorageInfo();
  }

  /**
   * 健康检查
   */
  healthCheck() {
    return this.sharedStorage.healthCheck();
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopAutoSync();
  }
}

module.exports = SharedFeedbackStorageAdapter;
