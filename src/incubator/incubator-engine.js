/**
 * 孵化器引擎主类
 * 整合IM交互、技能注册、进度推送、CLI生成、技能编排
 */

const { IMInteractionManager } = require('./im-interaction');
const { SkillRegistry } = require('./skill-registry');
const { IncubationProgressTracker } = require('./progress-tracker');
const { CLIGenerationEngine } = require('./cli-generator');
const { SkillOrchestrator } = require('./skill-orchestrator');
const { InputType, CLITool, IncubationPhase } = require('./types');

class IncubatorEngine {
  constructor() {
    // 初始化所有子模块
    this.imManager = new IMInteractionManager();
    this.skillRegistry = new SkillRegistry();
    this.progressTracker = new IncubationProgressTracker();
    this.cliGenerator = new CLIGenerationEngine();
    this.skillOrchestrator = new SkillOrchestrator();

    // 任务列表
    this.tasks = [];
  }

  /**
   * 处理孵化请求
   * @param {Object} request - 孵化请求
   * @returns {Object} 处理结果
   */
  processIncubationRequest(request) {
    // 验证请求
    if (!request.idea || !request.idea.trim()) {
      return {
        success: false,
        error: '请提供您的想法或项目描述'
      };
    }

    if (!request.inputType) {
      return {
        success: false,
        error: '请指定输入类型'
      };
    }

    // 选择CLI工具
    const selectedTool = this.cliGenerator.selectTool(request.inputType);

    // 创建任务进度跟踪
    const taskId = `task-${Date.now()}`;
    const totalSteps = this._getTotalSteps(request.inputType);
    
    this.progressTracker.createTask(taskId, request.idea, totalSteps);

    // 记录任务
    const task = {
      taskId,
      request,
      selectedTool,
      status: 'started',
      createdAt: new Date().toISOString()
    };
    this.tasks.push(task);

    // 构建响应
    const response = {
      success: true,
      taskId,
      selectedTool,
      nextStep: this._getNextStep(request.inputType),
      estimatedTime: this._getEstimatedTime(request.inputType)
    };

    // 如果是从零开始，提供推荐
    if (request.inputType === InputType.NONE) {
      response.recommendations = this._getRecommendations(request.industry);
    }

    return response;
  }

  /**
   * 生成追问消息
   * @returns {string} 追问消息
   */
  generateFollowUpMessage() {
    const template = this.imManager.generateFollowUpTemplate();
    
    return `${template.question}

${template.options.map(opt => `${opt.label}${opt.description ? ' - ' + opt.description : ''}`).join('\n')}

${template.helpText}`;
  }

  /**
   * 获取任务进度
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 进度对象
   */
  getTaskProgress(taskId) {
    return this.progressTracker.getProgress(taskId);
  }

  /**
   * 生成进度消息
   * @param {string} taskId - 任务ID
   * @returns {string} 格式化的消息
   */
  generateProgressMessage(taskId) {
    return this.progressTracker.generateMessage(taskId);
  }

  /**
   * 获取所有任务
   * @returns {Array} 任务列表
   */
  getAllTasks() {
    return this.tasks;
  }

  /**
   * 获取总步骤数
   * @private
   */
  _getTotalSteps(inputType) {
    switch (inputType) {
      case InputType.SOURCE_CODE:
      case InputType.WEBSITE:
        return 5;  // 下载/分析 → 生成CLI → 基础技能 → 编排 → 注册
      case InputType.DESKTOP_SOFTWARE:
        return 6;  // 额外需要CLI生成步骤
      case InputType.NONE:
        return 7;  // 额外需要技术选型步骤
      default:
        return 5;
    }
  }

  /**
   * 获取下一步骤
   * @private
   */
  _getNextStep(inputType) {
    switch (inputType) {
      case InputType.SOURCE_CODE:
        return '下载源码并分析结构';
      case InputType.WEBSITE:
        return '访问网站并分析API';
      case InputType.DESKTOP_SOFTWARE:
        return '分析软件并生成CLI';
      case InputType.NONE:
        return '推荐技术基座';
      default:
        return '开始孵化';
    }
  }

  /**
   * 获取预估时间
   * @private
   */
  _getEstimatedTime(inputType) {
    switch (inputType) {
      case InputType.SOURCE_CODE:
        return 3;
      case InputType.WEBSITE:
        return 4;
      case InputType.DESKTOP_SOFTWARE:
        return 5;
      case InputType.NONE:
        return 6;
      default:
        return 4;
    }
  }

  /**
   * 获取推荐技术基座
   * @private
   */
  _getRecommendations(industry) {
    const recommendations = {
      'AI+医疗': [
        { name: 'MONAI', url: 'https://github.com/Project-MONAI/MONAI', description: '医疗影像AI框架' },
        { name: 'OHIF Viewer', url: 'https://viewer.ohif.org/', description: '医疗影像Web浏览器' }
      ],
      'AI+工业制造': [
        { name: 'OpenPLC', url: 'https://github.com/thestamp/openplc_v3', description: '开源PLC运行时' },
        { name: 'FreeCAD', url: 'https://github.com/FreeCAD/FreeCAD', description: '开源CAD软件' }
      ],
      'default': [
        { name: 'Python项目', description: '基于Python的开源项目' },
        { name: 'Web系统', description: '基于Web的业务系统' }
      ]
    };

    return recommendations[industry] || recommendations['default'];
  }
}

module.exports = {
  IncubatorEngine
};
