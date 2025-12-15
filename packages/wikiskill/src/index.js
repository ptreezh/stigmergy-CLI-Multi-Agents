const WikiCollaborativeSkill = require('./core/WikiCollaborativeSkill');
const MultiTopicWikiManager = require('./core/MultiTopicWikiManager');
const WikiInitializer = require('./utils/WikiInitializer');
const WikiViewer = require('./utils/WikiViewer');
const WikiPathResolver = require('./utils/WikiPathResolver');

/**
 * Wiki协同技能主入口
 */
class WikiSkill {
  constructor(cliContext) {
    this.cliContext = cliContext;
    this.wikiManager = new MultiTopicWikiManager(cliContext);
    this.viewer = new WikiViewer(cliContext);
  }

  /**
   * 执行Wiki协同任务
   * @param {string} taskDescription - 任务描述
   * @param {Object} options - 选项
   */
  async execute(taskDescription, options = {}) {
    const skill = new WikiCollaborativeSkill(this.cliContext);
    return await skill.executeWikiTask(taskDescription, options);
  }

  /**
   * 初始化Wiki系统
   * @param {string} projectPath - 项目路径
   */
  async init(projectPath = process.cwd()) {
    const initializer = new WikiInitializer(this.cliContext);
    return await initializer.initializeWiki(projectPath);
  }

  /**
   * 打开Wiki查看器
   * @param {string} topicName - 主题名称
   */
  async open(topicName = null) {
    return await this.viewer.openWiki(topicName);
  }

  /**
   * 列出所有主题
   */
  async listTopics() {
    return await this.wikiManager.listTopics();
  }

  /**
   * 获取Wiki状态
   */
  async status() {
    const wikiPath = await WikiPathResolver.findWikiPath();
    if (!wikiPath) {
      return { initialized: false };
    }

    const topics = await this.wikiManager.listTopics();
    return {
      initialized: true,
      path: wikiPath,
      topicsCount: topics.length,
      topics: topics.map(t => t.name)
    };
  }
}

/**
 * 技能注册函数
 */
function register(cliContext) {
  const wikiSkill = new WikiSkill(cliContext);
  
  // 注册到CLI技能中心
  cliContext.registerSkill('wikiskill', {
    name: 'wikiskill',
    description: 'Wiki协同编辑技能',
    version: '1.0.0',
    execute: wikiSkill.execute.bind(wikiSkill),
    subcommands: {
      init: wikiSkill.init.bind(wikiSkill),
      open: wikiSkill.open.bind(wikiSkill),
      'list-topics': wikiSkill.listTopics.bind(wikiSkill),
      status: wikiSkill.status.bind(wikiSkill)
    }
  });

  return wikiSkill;
}

module.exports = {
  WikiSkill,
  WikiCollaborativeSkill,
  MultiTopicWikiManager,
  register
};