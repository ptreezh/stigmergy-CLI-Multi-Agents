/**
 * IM交互管理器
 * 负责IM追问、用户回复解析、进度消息构建
 */

const { InputType, CLITool, IncubationPhase } = require('./types');

class IMInteractionManager {
  /**
   * 生成追问模板
   * @returns {Object} 追问模板
   */
  generateFollowUpTemplate() {
    return {
      question: '好的！请确认您有以下哪种？',
      options: [
        { label: '1️⃣  项目源码', value: InputType.SOURCE_CODE, description: 'GitHub仓库或本地代码' },
        { label: '2️⃣  网站系统', value: InputType.WEBSITE, description: '可访问的URL' },
        { label: '3️⃣  桌面软件', value: InputType.DESKTOP_SOFTWARE },
        { label: '4️⃣  都没有', value: InputType.NONE, description: '从零开始' }
      ],
      helpText: '请回复数字'
    };
  }

  /**
   * 解析用户回复
   * @param {string} reply - 用户回复
   * @returns {string|null} 输入类型或null
   */
  parseUserReply(reply) {
    if (!reply || typeof reply !== 'string') {
      return null;
    }

    const trimmed = reply.trim();

    // 数字输入
    const digitMap = {
      '1': InputType.SOURCE_CODE,
      '2': InputType.WEBSITE,
      '3': InputType.DESKTOP_SOFTWARE,
      '4': InputType.NONE
    };

    if (digitMap[trimmed]) {
      return digitMap[trimmed];
    }

    // 中文数字输入
    const chineseMap = {
      '一': InputType.SOURCE_CODE,
      '二': InputType.WEBSITE,
      '三': InputType.DESKTOP_SOFTWARE,
      '四': InputType.NONE
    };

    if (chineseMap[trimmed]) {
      return chineseMap[trimmed];
    }

    return null;
  }

  /**
   * 构建进度消息
   * @param {Object} progress - 孵化进度
   * @returns {string} 格式化的消息
   */
  buildProgressMessage(progress) {
    const progressBar = this._buildProgressBar(progress.percentage);
    
    return `📊 孵化进度: ${progressBar} ${progress.percentage}%
🔄 当前阶段: ${this._getPhaseLabel(progress.phase)}
📝 当前步骤: ${progress.currentStep} (${progress.completedSteps.length}/${progress.totalSteps})
⏱️  预计剩余: ${progress.estimatedRemainingHours}小时

完成后我会通知您 📱`;
  }

  /**
   * 选择CLI工具
   * @param {string} inputType - 输入类型
   * @returns {string|null} CLI工具名称或null
   */
  selectCLITool(inputType) {
    switch (inputType) {
      case InputType.SOURCE_CODE:
      case InputType.DESKTOP_SOFTWARE:
        return CLITool.CLI_ANYTHING;
      case InputType.WEBSITE:
        return CLITool.OPENCLI;
      case InputType.NONE:
        return null;  // 需要推荐技术基座
      default:
        return null;
    }
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
  IMInteractionManager
};
