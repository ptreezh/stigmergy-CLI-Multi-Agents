/**
 * Soul Auto Evolve Skill - 可执行版本
 *
 * 功能：自主学习和创建新技能
 * 借鉴：OpenClaw 的技能进化机制
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * SoulAutoEvolve 技能类
 */
class SoulAutoEvolve {
  constructor() {
    this.name = 'soul-auto-evolve';
    this.description = '自主学习和进化能力';
    this.triggers = ['evolve', '进化', 'learn', '学习'];
  }

  /**
   * 判断是否可以处理该任务
   */
  canHandle(task, context) {
    const taskLower = task.toLowerCase();
    return this.triggers.some(trigger => taskLower.includes(trigger));
  }

  /**
   * 执行技能
   */
  async execute(task, context, { memory, eventStream }) {
    console.log('\n⚡ [Soul Auto Evolve] 开始自主进化...');

    // 1. 确定学习方向
    const learningDirection = await this.determineLearningDirection(task, context, memory);

    // 2. 深度分析主题
    const knowledge = await this.analyzeTopic(learningDirection);

    // 3. 提取实用知识
    const practicalKnowledge = this.extractPracticalKnowledge(knowledge);

    // 4. 创建新技能
    const newSkill = await this.createNewSkill(practicalKnowledge);

    // 5. 保存技能
    await this.saveSkill(newSkill);

    // 6. 记录进化
    await this.logEvolution({
      direction: learningDirection,
      skill: newSkill.name,
      knowledge: practicalKnowledge
    });

    // 推送事件
    eventStream.push({
      type: 'evolution_complete',
      data: { skill: newSkill.name, direction: learningDirection }
    });

    return {
      done: true,
      output: this.formatOutput(newSkill, practicalKnowledge),
      context: {
        newSkill: newSkill.name,
        evolutionCount: (context.evolutionCount || 0) + 1
      }
    };
  }

  /**
   * 确定学习方向
   */
  async determineLearningDirection(task, context, memory) {
    // 分析最近的会话，找出知识缺口
    const recentSessions = await memory.retrieveMemories('', 20);

    // 统计任务类型
    const taskTypes = {};
    for (const session of recentSessions) {
      const type = this.classifyTask(session.task);
      taskTypes[type] = (taskTypes[type] || 0) + 1;
    }

    // 找出最需要改进的领域
    const sortedTypes = Object.entries(taskTypes)
      .sort((a, b) => a[1] - b[1]); // 升序，找出最少的

    // 如果有明确的学习任务
    if (task && task.includes('学习')) {
      const match = task.match(/学习\s*(.+)/);
      if (match) {
        return match[1].trim();
      }
    }

    // 否则选择最不常见的任务类型
    if (sortedTypes.length > 0) {
      const [type, count] = sortedTypes[0];
      if (count < 3) { // 如果出现次数少，说明需要学习
        return this.getTypeLearningDirection(type);
      }
    }

    // 默认学习方向
    return 'general_improvement';
  }

  /**
   * 分类任务
   */
  classifyTask(task) {
    if (!task) return 'unknown';

    const taskLower = task.toLowerCase();

    if (taskLower.includes('search') || taskLower.includes('搜索')) {
      return 'search';
    } else if (taskLower.includes('code') || taskLower.includes('代码')) {
      return 'coding';
    } else if (taskLower.includes('api') || taskLower.includes('接口')) {
      return 'api_integration';
    } else if (taskLower.includes('data') || taskLower.includes('数据')) {
      return 'data_processing';
    } else if (taskLower.includes('test') || taskLower.includes('测试')) {
      return 'testing';
    } else {
      return 'general';
    }
  }

  /**
   * 获取类型对应的学习方向
   */
  getTypeLearningDirection(type) {
    const directions = {
      'search': 'advanced_search_techniques',
      'coding': 'best_coding_practices',
      'api_integration': 'api_design_patterns',
      'data_processing': 'efficient_data_algorithms',
      'testing': 'modern_testing_strategies',
      'general': 'general_improvement'
    };

    return directions[type] || 'general_improvement';
  }

  /**
   * 分析主题
   *
   * 使用 LLM 的知识库进行深度分析
   */
  async analyzeTopic(direction) {
    console.log(`  📚 分析主题: ${direction}`);

    // 基于学习方向生成知识结构
    const knowledge = {
      direction,
      coreConcepts: [],
      bestPractices: [],
      commonPatterns: [],
      pitfalls: [],
      resources: []
    };

    // 根据方向填充知识
    switch (direction) {
      case 'advanced_search_techniques':
        knowledge.coreConcepts = [
          'Elasticsearch 查询优化',
          '向量搜索和语义检索',
          '搜索结果排序算法',
          '搜索性能调优'
        ];
        knowledge.bestPractices = [
          '使用索引优化查询',
          '实现搜索结果缓存',
          '添加搜索建议和自动完成',
          '处理搜索同义词和变体'
        ];
        break;

      case 'best_coding_practices':
        knowledge.coreConcepts = [
          'Clean Code 原则',
          'SOLID 设计模式',
          '测试驱动开发',
          '代码审查流程'
        ];
        knowledge.bestPractices = [
          '保持函数简洁',
          '使用有意义的变量名',
          '编写单元测试',
          '定期重构代码'
        ];
        break;

      case 'api_integration':
        knowledge.coreConcepts = [
          'RESTful API 设计',
          'API 认证和授权',
          '错误处理策略',
          'API 版本控制'
        ];
        knowledge.bestPractices = [
          '使用标准 HTTP 方法',
          '实现请求限流',
          '提供清晰的 API 文档',
          '处理 API 版本演进'
        ];
        break;

      default:
        knowledge.coreConcepts = [
          '持续学习和改进',
          '关注用户体验',
          '优化工作流程',
          '保持代码质量'
        ];
        knowledge.bestPractices = [
          '定期回顾和反思',
          '接受反馈并改进',
          '分享知识和经验',
          '保持好奇心'
        ];
    }

    return knowledge;
  }

  /**
   * 提取实用知识
   */
  extractPracticalKnowledge(knowledge) {
    return {
      keyPoints: knowledge.coreConcepts.slice(0, 3),
      practices: knowledge.bestPractices.slice(0, 3),
      summary: `${knowledge.direction} 的核心知识和最佳实践`
    };
  }

  /**
   * 创建新技能
   */
  async createNewSkill(practicalKnowledge) {
    const skillName = this.generateSkillName(practicalKnowledge);

    const skill = {
      name: skillName,
      description: `自动生成的技能: ${practicalKnowledge.summary}`,
      version: '1.0.0',
      triggers: this.generateTriggers(practicalKnowledge),
      knowledge: practicalKnowledge,
      createdAt: new Date().toISOString()
    };

    return skill;
  }

  /**
   * 生成技能名称
   */
  generateSkillName(knowledge) {
    // 基于知识摘要生成简洁的技能名
    const summary = knowledge.summary.toLowerCase();
    const words = summary.split(/\s+/).slice(0, 3);

    return 'soul-' + words.join('-').replace(/[^a-z0-9-]/g, '-');
  }

  /**
   * 生成触发词
   */
  generateTriggers(knowledge) {
    // 从关键点中提取关键词
    return knowledge.keyPoints
      .flatMap(point => point.toLowerCase().split(/\s+/))
      .filter(word => word.length > 3)
      .slice(0, 5);
  }

  /**
   * 保存技能
   */
  async saveSkill(skill) {
    const soulStateDir = path.join(os.homedir(), '.stigmergy', 'soul-state');
    const skillsDir = path.join(soulStateDir, 'evolved-skills');

    await fs.promises.mkdir(skillsDir, { recursive: true });

    const skillFile = path.join(skillsDir, `${skill.name}.json`);

    await fs.promises.writeFile(
      skillFile,
      JSON.stringify(skill, null, 2)
    );

    console.log(`✅ 新技能已保存: ${skillFile}`);
  }

  /**
   * 记录进化
   */
  async logEvolution(evolutionData) {
    const soulStateDir = path.join(os.homedir(), '.stigmergy', 'soul-state');
    const evolutionLog = path.join(soulStateDir, 'evolution-log.jsonl');

    const logEntry = {
      timestamp: Date.now(),
      ...evolutionData
    };

    const line = JSON.stringify(logEntry) + '\n';
    await fs.promises.appendFile(evolutionLog, line);

    console.log(`📝 进化已记录: ${evolutionData.skill}`);
  }

  /**
   * 格式化输出
   */
  formatOutput(skill, knowledge) {
    let output = '\n🧬 进化完成\n';
    output += '============\n\n';

    output += `✨ 新技能: ${skill.name}\n`;
    output += `📝 描述: ${skill.description}\n\n`;

    output += '🎯 关键要点:\n';
    for (const point of knowledge.keyPoints) {
      output += `  • ${point}\n`;
    }

    output += '\n💡 最佳实践:\n';
    for (const practice of knowledge.practices) {
      output += `  • ${practice}\n`;
    }

    output += `\n📊 技能已保存到: ~/.stigmergy/soul-state/evolved-skills/${skill.name}.json\n`;

    return output;
  }
}

module.exports = SoulAutoEvolve;
