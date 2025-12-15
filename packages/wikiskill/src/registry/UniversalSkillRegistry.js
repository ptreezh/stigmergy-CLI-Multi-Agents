/**
 * 多CLI兼容的统一注册器
 * 支持独立部署和各种CLI集成
 */

class UniversalSkillRegistry {
  constructor() {
    this.registeredSkills = new Map();
    this.cliAdapters = new Map();
    this.deploymentMode = 'standalone'; // standalone | integrated
  }

  /**
   * 注册技能
   */
  registerSkill(skillName, skillConfig) {
    this.registeredSkills.set(skillName, {
      ...skillConfig,
      registeredAt: new Date(),
      deploymentMode: this.deploymentMode
    });
  }

  /**
   * 注册CLI适配器
   */
  registerCLIAdapter(cliType, adapter) {
    this.cliAdapters.set(cliType, adapter);
  }

  /**
   * 设置部署模式
   */
  setDeploymentMode(mode) {
    this.deploymentMode = mode;
  }

  /**
   * 获取技能
   */
  getSkill(skillName) {
    return this.registeredSkills.get(skillName);
  }

  /**
   * 获取所有技能
   */
  getAllSkills() {
    return Array.from(this.registeredSkills.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  /**
   * 执行技能
   */
  async executeSkill(skillName, cliContext, args, options = {}) {
    const skill = this.getSkill(skillName);
    if (!skill) {
      throw new Error(`技能 ${skillName} 未注册`);
    }

    // 根据CLI类型选择适配器
    const cliType = cliContext.cliType || 'standalone';
    const adapter = this.cliAdapters.get(cliType);
    
    if (adapter) {
      // 使用适配器包装上下文
      const adaptedContext = adapter.adaptContext(cliContext);
      return await skill.execute(adaptedContext, args, options);
    } else {
      // 直接使用原始上下文
      return await skill.execute(cliContext, args, options);
    }
  }

  /**
   * 自动检测并注册所有可用的CLI适配器
   */
  async autoRegisterAdapters() {
    const CLIAdapter = require('../adapters/CLIAdapter');
    
    // 注册所有支持的CLI类型
    const supportedCLIs = ['claude', 'stigmergy', 'gemini', 'standalone'];
    
    for (const cliType of supportedCLIs) {
      try {
        const adapter = new CLIAdapter(cliType);
        this.registerCLIAdapter(cliType, adapter);
      } catch (error) {
        console.warn(`无法注册 ${cliType} 适配器:`, error.message);
      }
    }
  }

  /**
   * 创建技能实例
   */
  createSkillInstance(skillName, cliType = 'standalone') {
    const skill = this.getSkill(skillName);
    if (!skill) {
      throw new Error(`技能 ${skillName} 未注册`);
    }

    const adapter = this.cliAdapters.get(cliType);
    if (!adapter) {
      throw new Error(`CLI ${cliType} 的适配器未注册`);
    }

    return skill.createInstance(adapter.context);
  }

  /**
   * 获取注册信息
   */
  getRegistryInfo() {
    return {
      deploymentMode: this.deploymentMode,
      registeredSkills: this.registeredSkills.size,
      registeredAdapters: this.cliAdapters.size,
      supportedCLIs: Array.from(this.cliAdapters.keys()),
      availableSkills: Array.from(this.registeredSkills.keys())
    };
  }
}

/**
 * 技能工厂
 */
class SkillFactory {
  constructor() {
    this.registry = new UniversalSkillRegistry();
    this.initialize();
  }

  /**
   * 初始化
   */
  async initialize() {
    // 自动注册适配器
    await this.registry.autoRegisterAdapters();
    
    // 注册Wiki技能
    this.registerWikiSkill();
  }

  /**
   * 注册Wiki技能
   */
  registerWikiSkill() {
    const WikiCollaborativeSkill = require('../core/WikiCollaborativeSkill');
    const ClaudeWikiSkill = require('../claude/ClaudeWikiSkill');

    // 通用Wiki技能
    this.registry.registerSkill('wikiskill', {
      name: 'wikiskill',
      description: 'Wiki协同编辑技能',
      version: '1.0.0',
      execute: async (context, args, options) => {
        const skill = new WikiCollaborativeSkill(context);
        const taskDescription = args.join(' ');
        return await skill.executeWikiTask(taskDescription, options);
      },
      createInstance: (context) => new WikiCollaborativeSkill(context),
      supportedCLIs: ['claude', 'stigmergy', 'gemini', 'standalone']
    });

    // Claude特化技能
    this.registry.registerSkill('claude-wikiskill', {
      name: 'claude-wikiskill',
      description: 'Claude特化Wiki协同编辑技能',
      version: '1.0.0',
      execute: async (context, args, options) => {
        const claudeSkill = new ClaudeWikiSkill();
        const taskDescription = args.join(' ');
        return await claudeSkill.executeTask(taskDescription, options);
      },
      createInstance: (context) => new ClaudeWikiSkill(),
      supportedCLIs: ['claude', 'standalone']
    });
  }

  /**
   * 获取注册器
   */
  getRegistry() {
    return this.registry;
  }

  /**
   * 创建技能
   */
  createSkill(skillName, cliType = 'standalone') {
    return this.registry.createSkillInstance(skillName, cliType);
  }

  /**
   * 执行技能
   */
  async executeSkill(skillName, cliContext, args, options) {
    return await this.registry.executeSkill(skillName, cliContext, args, options);
  }
}

// 全局技能工厂实例
const globalSkillFactory = new SkillFactory();

module.exports = {
  UniversalSkillRegistry,
  SkillFactory,
  globalSkillFactory
};