/**
 * 孵化进度跟踪器
 * 负责孵化任务的进度跟踪、步骤管理、消息生成
 */

const { IncubationPhase } = require('./types');

class IncubationProgressTracker {
  constructor() {
    this.tasks = new Map();  // taskId -> progress data
  }

  /**
   * 创建任务进度跟踪
   * @param {string} taskId - 任务ID
   * @param {string} title - 任务标题
   * @param {number} totalSteps - 总步骤数（默认10）
   * @returns {Object} 进度对象
   */
  createTask(taskId, title, totalSteps = 10) {
    const progress = {
      taskId,
      title,
      phase: IncubationPhase.INIT,
      percentage: 0,
      estimatedRemainingHours: 0,
      currentStep: '等待开始',
      completedSteps: [],
      totalSteps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.set(taskId, progress);
    return progress;
  }

  /**
   * 更新进度
   * @param {string} taskId - 任务ID
   * @param {Object} update - 更新数据
   * @returns {Object} 更新结果
   */
  updateProgress(taskId, update) {
    const progress = this.tasks.get(taskId);
    if (!progress) {
      return {
        success: false,
        error: `任务 ${taskId} 不存在`
      };
    }

    // 应用更新
    if (update.phase) progress.phase = update.phase;
    if (update.percentage !== undefined) progress.percentage = update.percentage;
    if (update.currentStep) progress.currentStep = update.currentStep;
    if (update.estimatedRemainingHours !== undefined) {
      progress.estimatedRemainingHours = update.estimatedRemainingHours;
    }

    // 添加已完成步骤
    if (update.completedStep) {
      progress.completedSteps.push(update.completedStep);
      // 自动计算百分比
      progress.percentage = Math.round(
        (progress.completedSteps.length / progress.totalSteps) * 100
      );
    }

    progress.updatedAt = new Date().toISOString();

    // 检查是否完成
    if (progress.percentage >= 100) {
      progress.phase = IncubationPhase.COMPLETE;
      progress.currentStep = '全部完成';
    }

    return {
      success: true,
      progress
    };
  }

  /**
   * 标记步骤完成
   * @param {string} taskId - 任务ID
   * @param {string} stepName - 步骤名称
   * @returns {Object} 更新结果
   */
  completeStep(taskId, stepName) {
    const progress = this.tasks.get(taskId);
    if (!progress) {
      return {
        success: false,
        error: `任务 ${taskId} 不存在`
      };
    }

    progress.completedSteps.push(stepName);
    progress.currentStep = stepName;

    // 计算百分比
    progress.percentage = Math.round(
      (progress.completedSteps.length / progress.totalSteps) * 100
    );

    progress.updatedAt = new Date().toISOString();

    // 检查是否完成
    if (progress.completedSteps.length >= progress.totalSteps) {
      progress.phase = IncubationPhase.COMPLETE;
      progress.percentage = 100;
      progress.currentStep = '全部完成';
    }

    return {
      success: true,
      progress
    };
  }

  /**
   * 获取任务进度
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 进度对象或null
   */
  getProgress(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * 获取所有任务
   * @returns {Array} 所有任务进度列表
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * 生成进度消息
   * @param {string} taskId - 任务ID
   * @returns {string} 格式化的消息
   */
  generateMessage(taskId) {
    const progress = this.tasks.get(taskId);
    if (!progress) {
      return `任务 ${taskId} 不存在`;
    }

    const progressBar = this._buildProgressBar(progress.percentage);
    const phaseLabel = this._getPhaseLabel(progress.phase);

    if (progress.phase === IncubationPhase.COMPLETE) {
      return `🎉 ${progress.title} 孵化完成！

✅ 进度: ${progressBar} 100%
📦 已完成步骤: ${progress.completedSteps.length}/${progress.totalSteps}
📋 步骤清单: ${progress.completedSteps.join(' → ')}

💬 现在可以通过IM调用该技能了！`;
    }

    return `🥚 ${progress.title}

📊 进度: ${progressBar} ${progress.percentage}%
🔄 阶段: ${phaseLabel}
📝 当前: ${progress.currentStep} (${progress.completedSteps.length}/${progress.totalSteps})
⏱️  预计剩余: ${progress.estimatedRemainingHours}小时

${progress.completedSteps.length > 0 ? '✅ 已完成: ' + progress.completedSteps.join(', ') : ''}`;
  }

  /**
   * 构建进度条
   * @private
   */
  _buildProgressBar(percentage) {
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * 获取阶段标签
   * @private
   */
  _getPhaseLabel(phase) {
    const labels = {
      'init': '初始化',
      'cli_generation': 'CLI生成',
      'base_skill_creation': '基础技能创建',
      'skill_orchestration': '技能编排',
      'registration': '注册',
      'complete': '完成'
    };
    return labels[phase] || phase;
  }
}

module.exports = {
  IncubationProgressTracker
};
