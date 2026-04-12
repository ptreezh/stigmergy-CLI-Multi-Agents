/**
 * PromotionManager - 提升管理器
 * 基于使用频率自动提升教训到全局
 */

const path = require('path');
const fs = require('fs').promises;

class PromotionManager {
  /**
   * 初始化提升管理器
   */
  constructor(options = {}) {
    const os = require('os');
    const defaultPath = path.join(os.homedir(), '.stigmergy', 'soul-global', 'promotion_data.json');
    
    if (options.dataPath) {
      const stat = require('fs').statSync(options.dataPath, { throwIfNoEntry: false });
      if (stat && stat.isDirectory()) {
        this.dataPath = path.join(options.dataPath, 'promotion_data.json');
      } else {
        this.dataPath = options.dataPath;
      }
    } else {
      this.dataPath = defaultPath;
    }
    
    this.promotionThreshold = options.promotionThreshold || 3;
    this._usageData = null;
  }

  /**
   * 记录教训在项目中的使用
   */
  async recordUsage(lessonTitle, projectName) {
    const data = await this._loadData();
    
    if (!data.lessons[lessonTitle]) {
      data.lessons[lessonTitle] = {
        title: lessonTitle,
        projects: [],
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        promotionStatus: 'pending', // pending, confirmed, promoted, rejected
        userDecision: null
      };
    }

    const lesson = data.lessons[lessonTitle];
    
    // 添加项目（如果未记录）
    if (!lesson.projects.includes(projectName)) {
      lesson.projects.push(projectName);
    }
    
    lesson.lastUsed = new Date().toISOString();

    await this._saveData(data);
  }

  /**
   * 获取教训使用统计
   */
  async getLessonStats(lessonTitle) {
    const data = await this._loadData();
    return data.lessons[lessonTitle] || null;
  }

  /**
   * 检查是否应该提升
   */
  async shouldPromote(lessonTitle) {
    const stats = await this.getLessonStats(lessonTitle);
    if (!stats) return false;

    // 检查是否已被否决
    if (stats.userDecision === 'rejected') return false;

    // 检查是否已提升
    if (stats.promotionStatus === 'promoted') return false;

    // 检查是否达到阈值
    return stats.projects.length >= this.promotionThreshold;
  }

  /**
   * 用户确认提升
   */
  async confirmPromotion(lessonTitle) {
    const data = await this._loadData();
    if (data.lessons[lessonTitle]) {
      data.lessons[lessonTitle].userDecision = 'confirmed';
      await this._saveData(data);
    }
  }

  /**
   * 用户否决提升
   */
  async rejectPromotion(lessonTitle) {
    const data = await this._loadData();
    if (data.lessons[lessonTitle]) {
      data.lessons[lessonTitle].userDecision = 'rejected';
      await this._saveData(data);
    }
  }

  /**
   * 检查并执行提升
   */
  async checkAndPromote(lessonTitle) {
    const shouldPromote = await this.shouldPromote(lessonTitle);
    if (!shouldPromote) return false;

    const data = await this._loadData();
    const lesson = data.lessons[lessonTitle];

    // 检查用户确认状态
    if (lesson.userDecision === 'confirmed') {
      lesson.promotionStatus = 'promoted';
      await this._saveData(data);
      return true;
    }

    // 等待用户确认
    return false;
  }

  /**
   * 获取待确认的提升列表
   */
  async getPendingPromotions() {
    const data = await this._loadData();
    const pending = [];

    for (const [title, lesson] of Object.entries(data.lessons)) {
      if (lesson.projects.length >= this.promotionThreshold &&
          lesson.userDecision === null &&
          lesson.promotionStatus === 'pending') {
        pending.push({
          title,
          projectCount: lesson.projects.length,
          projects: lesson.projects,
          firstUsed: lesson.firstUsed,
          lastUsed: lesson.lastUsed
        });
      }
    }

    return pending;
  }

  // 私有方法

  async _loadData() {
    if (this._usageData) return this._usageData;

    const exists = await this._fileExists(this.dataPath);
    if (!exists) {
      this._usageData = { lessons: {} };
      return this._usageData;
    }

    const content = await fs.readFile(this.dataPath, 'utf-8');
    this._usageData = JSON.parse(content);
    return this._usageData;
  }

  async _saveData(data) {
    const dir = path.dirname(this.dataPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    this._usageData = data;
  }

  async _fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = PromotionManager;
