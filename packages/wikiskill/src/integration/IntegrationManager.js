/**
 * 集成层 - 兼容Stigmergy和其他CLI系统
 */

const { globalSkillFactory } = require('../registry/UniversalSkillRegistry');

/**
 * Stigmergy集成适配器
 */
class StigmergyIntegration {
  constructor(stigmergyContext) {
    this.stigmergyContext = stigmergyContext;
    this.skillFactory = globalSkillFactory;
    this.setupIntegration();
  }

  /**
   * 设置集成
   */
  setupIntegration() {
    // 设置部署模式为集成
    this.skillFactory.getRegistry().setDeploymentMode('integrated');
    
    // 注册Stigmergy特化的CLI适配器
    this.registerStigmergyAdapter();
  }

  /**
   * 注册Stigmergy适配器
   */
  registerStigmergyAdapter() {
    const adapter = {
      cliType: 'stigmergy',
      adaptContext: (context) => ({
        ...context,
        cliType: 'stigmergy',
        llm: context.llm || this.stigmergyContext.llm,
        tools: {
          ...context.tools,
          ...this.stigmergyContext.tools
        },
        logger: {
          ...context.logger,
          ...this.stigmergyContext.logger
        }
      })
    };

    this.skillFactory.getRegistry().registerCLIAdapter('stigmergy', adapter);
  }

  /**
   * 注册技能到Stigmergy
   */
  registerToStigmergy() {
    // 注册Wiki技能
    this.stigmergyContext.registerSkill('wikiskill', {
      name: 'wikiskill',
      description: 'Wiki协同编辑技能',
      version: '1.0.0',
      category: 'collaboration',
      execute: async (taskDescription, options = {}) => {
        const context = {
          cliType: 'stigmergy',
          ...this.stigmergyContext
        };
        
        return await this.skillFactory.executeSkill(
          'wikiskill',
          context,
          taskDescription.split(' '),
          options
        );
      },
      subcommands: {
        init: async (projectPath) => {
          const WikiInitializer = require('../utils/WikiInitializer');
          const initializer = new WikiInitializer(this.stigmergyContext);
          return await initializer.initializeWiki(projectPath);
        },
        open: async (topicName) => {
          const WikiViewer = require('../utils/WikiViewer');
          const viewer = new WikiViewer(this.stigmergyContext);
          return await viewer.openWiki(topicName);
        },
        'list-topics': async () => {
          const MultiTopicWikiManager = require('../core/MultiTopicWikiManager');
          const manager = new MultiTopicWikiManager(this.stigmergyContext);
          return await manager.listTopics();
        },
        status: async () => {
          const WikiPathResolver = require('../utils/WikiPathResolver');
          const wikiPath = await WikiPathResolver.findWikiPath();
          return {
            initialized: !!wikiPath,
            path: wikiPath
          };
        }
      }
    });

    // 注册Claude特化技能
    this.stigmergyContext.registerSkill('claude-wikiskill', {
      name: 'claude-wikiskill',
      description: 'Claude特化Wiki协同编辑技能',
      version: '1.0.0',
      category: 'collaboration',
      execute: async (taskDescription, options = {}) => {
        const ClaudeWikiSkill = require('../claude/ClaudeWikiSkill');
        const skill = new ClaudeWikiSkill();
        return await skill.executeTask(taskDescription, options);
      }
    });
  }

  /**
   * 获取集成状态
   */
  getIntegrationStatus() {
    const registry = this.skillFactory.getRegistry();
    
    return {
      deploymentMode: registry.deploymentMode,
      registeredSkills: registry.getAllSkills(),
      supportedCLIs: registry.supportedCLIs,
      stigmergyFeatures: {
        skillRegistration: true,
        contextSharing: true,
        toolIntegration: true,
        loggingIntegration: true
      }
    };
  }
}

/**
 * Claude集成适配器
 */
class ClaudeIntegration {
  constructor(claudeContext) {
    this.claudeContext = claudeContext;
    this.skillFactory = globalSkillFactory;
    this.setupIntegration();
  }

  /**
   * 设置集成
   */
  setupIntegration() {
    // 注册Claude特化的CLI适配器
    this.registerClaudeAdapter();
  }

  /**
   * 注册Claude适配器
   */
  registerClaudeAdapter() {
    const adapter = {
      cliType: 'claude',
      adaptContext: (context) => ({
        ...context,
        cliType: 'claude',
        llm: context.llm || this.claudeContext.llm,
        tools: {
          ...context.tools,
          ...this.claudeContext.tools
        },
        logger: {
          ...context.logger,
          ...this.claudeContext.logger
        }
      })
    };

    this.skillFactory.getRegistry().registerCLIAdapter('claude', adapter);
  }

  /**
   * 注册技能到Claude
   */
  registerToClaude() {
    // Claude通常有自己的技能注册机制
    if (this.claudeContext.registerSkill) {
      this.claudeContext.registerSkill('wikiskill', {
        name: 'wikiskill',
        description: 'Wiki协同编辑技能',
        execute: async (taskDescription, options = {}) => {
          const ClaudeWikiSkill = require('../claude/ClaudeWikiSkill');
          const skill = new ClaudeWikiSkill();
          return await skill.executeTask(taskDescription, options);
        },
        features: [
          '智能任务理解',
          '专业角色设定',
          '知识搜索学习',
          '深度思考分析',
          '协同编辑支持',
          '反馈处理机制'
        ]
      });
    }
  }

  /**
   * 创建Claude特化实例
   */
  createClaudeInstance() {
    return this.skillFactory.createSkill('claude-wikiskill', 'claude');
  }
}

/**
 * 通用集成管理器
 */
class IntegrationManager {
  constructor() {
    this.integrations = new Map();
    this.skillFactory = globalSkillFactory;
  }

  /**
   * 注册Stigmergy集成
   */
  registerStigmergy(stigmergyContext) {
    const integration = new StigmergyIntegration(stigmergyContext);
    integration.registerToStigmergy();
    this.integrations.set('stigmergy', integration);
    return integration;
  }

  /**
   * 注册Claude集成
   */
  registerClaude(claudeContext) {
    const integration = new ClaudeIntegration(claudeContext);
    integration.registerToClaude();
    this.integrations.set('claude', integration);
    return integration;
  }

  /**
   * 注册通用CLI集成
   */
  registerGenericCLI(cliType, cliContext) {
    const integration = {
      cliType,
      context: cliContext,
      skillFactory: this.skillFactory,
      
      registerSkills: () => {
        if (cliContext.registerSkill) {
          cliContext.registerSkill('wikiskill', {
            name: 'wikiskill',
            description: 'Wiki协同编辑技能',
            execute: async (taskDescription, options = {}) => {
              return await this.skillFactory.executeSkill(
                'wikiskill',
                { cliType, ...cliContext },
                taskDescription.split(' '),
                options
              );
            }
          });
        }
      }
    };

    integration.registerSkills();
    this.integrations.set(cliType, integration);
    return integration;
  }

  /**
   * 获取所有集成状态
   */
  getAllIntegrations() {
    const status = {};
    
    for (const [name, integration] of this.integrations) {
      status[name] = {
        type: name,
        registered: true,
        features: integration.getIntegrationStatus ? 
          integration.getIntegrationStatus() : 
          { basic: true }
      };
    }

    return status;
  }

  /**
   * 获取技能工厂
   */
  getSkillFactory() {
    return this.skillFactory;
  }
}

// 全局集成管理器实例
const globalIntegrationManager = new IntegrationManager();

module.exports = {
  StigmergyIntegration,
  ClaudeIntegration,
  IntegrationManager,
  globalIntegrationManager
};