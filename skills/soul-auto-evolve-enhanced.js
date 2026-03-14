/**
 * Soul Auto Evolve - Enhanced with External Knowledge Sources
 *
 * 增强功能：
 * - GitHub API 集成
 * - npm registry 搜索
 * - 文档 API 访问
 * - Stack Overflow 查询
 * - 外部 CLI 工具调用
 *
 * 借鉴：OpenClaw 的自适应学习机制
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const CrossPlatformUtils = require('../src/utils/cross-platform-utils');

/**
 * SoulAutoEvolveEnhanced 技能类
 */
class SoulAutoEvolveEnhanced {
  constructor() {
    this.name = 'soul-auto-evolve';
    this.description = '增强的自主学习和进化能力（外部知识源）';
    this.triggers = ['evolve', '进化', 'learn', '学习'];

    // 外部知识源配置
    this.knowledgeSources = {
      github: {
        enabled: true,
        priority: 1,
        rateLimit: 60 // 每小时请求限制
      },
      npm: {
        enabled: true,
        priority: 2,
        rateLimit: 100
      },
      documentation: {
        enabled: true,
        priority: 3,
        urls: [
          'https://docs.anthropic.com',
          'https://nodejs.org/docs',
          'https://developer.mozilla.org'
        ]
      },
      stackOverflow: {
        enabled: true,
        priority: 4,
        apiEndpoint: 'https://api.stackexchange.com/2.3'
      }
    };
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
    console.log('\n⚡ [Soul Auto Evolve Enhanced] 开始增强自主进化...');

    try {
      // 1. 确定学习方向
      const learningDirection = await this.determineLearningDirection(task, context, memory);

      // 2. 从外部知识源学习
      const externalKnowledge = await this.learnFromExternalSources(learningDirection);

      // 3. 结合内部知识
      const internalKnowledge = await this.analyzeFromMemory(learningDirection, memory);

      // 4. 整合知识
      const integratedKnowledge = this.integrateKnowledge(externalKnowledge, internalKnowledge);

      // 5. 提取实用知识
      const practicalKnowledge = this.extractPracticalKnowledge(integratedKnowledge);

      // 6. 创建新技能
      const newSkill = await this.createNewSkill(practicalKnowledge);

      // 7. 保存技能
      await this.saveSkill(newSkill);

      // 8. 记录进化
      await this.logEvolution({
        direction: learningDirection,
        skill: newSkill.name,
        knowledgeSources: Object.keys(externalKnowledge),
        knowledge: practicalKnowledge
      });

      // 推送事件
      eventStream.push({
        type: 'evolution_complete',
        data: {
          skill: newSkill.name,
          direction: learningDirection,
          sources: Object.keys(externalKnowledge)
        }
      });

      return {
        done: true,
        output: this.formatOutput(newSkill, practicalKnowledge, externalKnowledge),
        context: {
          newSkill: newSkill.name,
          evolutionCount: (context.evolutionCount || 0) + 1,
          knowledgeSources: Object.keys(externalKnowledge)
        }
      };
    } catch (error) {
      console.error('❌ Enhanced evolution error:', error);
      return {
        done: true,
        output: `⚠️ 进化遇到问题: ${error.message}\n回退到基础进化模式...`
      };
    }
  }

  /**
   * 确定学习方向
   */
  async determineLearningDirection(task, context, memory) {
    const recentSessions = await memory.retrieveMemories('', 20);
    const taskTypes = {};

    for (const session of recentSessions) {
      const type = this.classifyTask(session.task);
      taskTypes[type] = (taskTypes[type] || 0) + 1;
    }

    const sortedTypes = Object.entries(taskTypes)
      .sort((a, b) => a[1] - b[1]);

    if (task && task.includes('学习')) {
      const match = task.match(/学习\s*(.+)/);
      if (match) {
        return match[1].trim();
      }
    }

    if (sortedTypes.length > 0) {
      const [type, count] = sortedTypes[0];
      if (count < 3) {
        return this.getTypeLearningDirection(type);
      }
    }

    return 'general_improvement';
  }

  /**
   * 从外部知识源学习
   */
  async learnFromExternalSources(direction) {
    console.log('  🌐 从外部知识源学习...');
    const knowledge = {};

    // 1. GitHub 搜索
    if (this.knowledgeSources.github.enabled) {
      try {
        knowledge.github = await this.searchGitHub(direction);
        console.log(`    ✅ GitHub: 找到 ${knowledge.github.length} 个结果`);
      } catch (error) {
        console.log(`    ⚠️ GitHub 搜索失败: ${error.message}`);
      }
    }

    // 2. npm registry 搜索
    if (this.knowledgeSources.npm.enabled) {
      try {
        knowledge.npm = await this.searchNpm(direction);
        console.log(`    ✅ npm: 找到 ${knowledge.npm.length} 个包`);
      } catch (error) {
        console.log(`    ⚠️ npm 搜索失败: ${error.message}`);
      }
    }

    // 3. 文档搜索
    if (this.knowledgeSources.documentation.enabled) {
      try {
        knowledge.docs = await this.searchDocumentation(direction);
        console.log(`    ✅ 文档: 找到 ${knowledge.docs.length} 个相关章节`);
      } catch (error) {
        console.log(`    ⚠️ 文档搜索失败: ${error.message}`);
      }
    }

    // 4. Stack Overflow 搜索
    if (this.knowledgeSources.stackOverflow.enabled) {
      try {
        knowledge.stackoverflow = await this.searchStackOverflow(direction);
        console.log(`    ✅ Stack Overflow: 找到 ${knowledge.stackoverflow.length} 个问答`);
      } catch (error) {
        console.log(`    ⚠️ Stack Overflow 搜索失败: ${error.message}`);
      }
    }

    return knowledge;
  }

  /**
   * 搜索 GitHub
   */
  async searchGitHub(topic) {
    const query = `${topic} language:javascript stars:>20`;
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

    const response = await this.fetchWithTimeout(searchUrl, 5000);
    const data = JSON.parse(response);

    if (!data.items) return [];

    return data.items.map(item => ({
      name: item.name,
      description: item.description,
      url: item.html_url,
      stars: item.stargazers_count,
      language: item.language,
      topics: item.topics || []
    }));
  }

  /**
   * 搜索 npm
   */
  async searchNpm(topic) {
    const searchUrl = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(topic)}&size=10`;

    const response = await this.fetchWithTimeout(searchUrl, 5000);
    const data = JSON.parse(response);

    if (!data.objects) return [];

    return data.objects.map(obj => ({
      name: obj.package.name,
      description: obj.package.description,
      version: obj.package.version,
      url: `https://www.npmjs.com/package/${obj.package.name}`
    }));
  }

  /**
   * 搜索文档
   */
  async searchDocumentation(topic) {
    const results = [];

    // 使用开发者文档 API（这里使用 MDN Web Docs API）
    const searchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`;

    try {
      const response = await this.fetchWithTimeout(searchUrl, 5000);
      // 简单的 HTML 解析（实际项目中应该使用专业的 HTML 解析库）
      if (response.includes('search-results')) {
        results.push({
          source: 'MDN',
          topic: topic,
          url: searchUrl,
          description: 'MDN Web Docs 相关文档'
        });
      }
    } catch (error) {
      // 忽略错误
    }

    return results;
  }

  /**
   * 搜索 Stack Overflow
   */
  async searchStackOverflow(topic) {
    const searchUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&accepted=True&answers=1&title=${encodeURIComponent(topic)}&site=stackoverflow&pagesize=5`;

    const response = await this.fetchWithTimeout(searchUrl, 5000);
    const data = JSON.parse(response);

    if (!data.items) return [];

    return data.items.map(item => ({
      title: item.title,
      score: item.score,
      url: item.link,
      answers: item.answer_count,
      tags: item.tags
    }));
  }

  /**
   * 从记忆中分析
   */
  async analyzeFromMemory(direction, memory) {
    const relatedSessions = await memory.retrieveMemories(direction, 10);

    return {
      sessions: relatedSessions,
      patterns: this.extractPatterns(relatedSessions),
      context: this.buildContext(direction, relatedSessions)
    };
  }

  /**
   * 提取模式
   */
  extractPatterns(sessions) {
    const patterns = {
      commonErrors: [],
      successfulApproaches: [],
      toolUsage: {}
    };

    for (const session of sessions) {
      if (session.events) {
        const errors = session.events.filter(e => e.type === 'error');
        const successes = session.events.filter(e => e.type === 'task_complete');

        for (const error of errors) {
          if (error.error && !patterns.commonErrors.includes(error.error)) {
            patterns.commonErrors.push(error.error);
          }
        }

        if (successes.length > 0) {
          patterns.successfulApproaches.push({
            task: session.task,
            approach: this.extractApproach(session)
          });
        }
      }
    }

    return patterns;
  }

  /**
   * 提取方法
   */
  extractApproach(session) {
    // 简化的方法提取
    if (session.task && session.task.includes('search')) {
      return 'search_based';
    } else if (session.task && session.task.includes('code')) {
      return 'code_based';
    }
    return 'general';
  }

  /**
   * 构建上下文
   */
  buildContext(direction, sessions) {
    return {
      direction,
      sessionCount: sessions.length,
      lastSession: sessions[0]?.timestamp || null
    };
  }

  /**
   * 整合知识
   */
  integrateKnowledge(external, internal) {
    return {
      external: {
        github: external.github || [],
        npm: external.npm || [],
        docs: external.docs || [],
        stackoverflow: external.stackoverflow || []
      },
      internal: {
        patterns: internal.patterns,
        context: internal.context
      },
      summary: this.generateKnowledgeSummary(external, internal)
    };
  }

  /**
   * 生成知识摘要
   */
  generateKnowledgeSummary(external, internal) {
    const summary = {
      totalSources: 0,
      topResources: [],
      keyInsights: []
    };

    // 统计源数量
    for (const key of Object.keys(external)) {
      if (external[key] && external[key].length > 0) {
        summary.totalSources++;
        summary.topResources.push(...external[key].slice(0, 2));
      }
    }

    // 提取关键洞察
    if (internal.patterns.successfulApproaches.length > 0) {
      summary.keyInsights.push({
        type: 'success',
        content: `找到 ${internal.patterns.successfulApproaches.length} 个成功案例`
      });
    }

    if (internal.patterns.commonErrors.length > 0) {
      summary.keyInsights.push({
        type: 'error',
        content: `识别 ${internal.patterns.commonErrors.length} 个常见错误`
      });
    }

    return summary;
  }

  /**
   * 提取实用知识
   */
  extractPracticalKnowledge(integrated) {
    return {
      keyPoints: this.extractKeyPoints(integrated),
      practices: this.extractBestPractices(integrated),
      resources: this.extractResources(integrated),
      summary: integrated.summary
    };
  }

  /**
   * 提取关键点
   */
  extractKeyPoints(integrated) {
    const points = [];

    // 从 GitHub 仓库
    for (const repo of integrated.external.github.slice(0, 3)) {
      points.push(`GitHub: ${repo.name} - ${repo.description}`);
    }

    // 从 Stack Overflow
    for (const qa of integrated.external.stackoverflow.slice(0, 2)) {
      points.push(`Stack Overflow: ${qa.title} (score: ${qa.score})`);
    }

    // 从内部模式
    if (integrated.internal.patterns.successfulApproaches.length > 0) {
      points.push(`成功模式: ${integrated.internal.patterns.successfulApproaches.length} 个`);
    }

    return points.slice(0, 5);
  }

  /**
   * 提取最佳实践
   */
  extractBestPractices(integrated) {
    const practices = [];

    // 从 npm 包描述中提取
    for (const pkg of integrated.external.npm.slice(0, 3)) {
      if (pkg.description) {
        practices.push(pkg.description);
      }
    }

    // 基于错误模式生成实践
    for (const error of integrated.internal.patterns.commonErrors) {
      practices.push(`避免: ${error}`);
    }

    return practices.slice(0, 5);
  }

  /**
   * 提取资源
   */
  extractResources(integrated) {
    return {
      github: integrated.external.github.slice(0, 3).map(r => r.url),
      npm: integrated.external.npm.slice(0, 3).map(p => p.url),
      docs: integrated.external.docs.slice(0, 2).map(d => d.url),
      stackoverflow: integrated.external.stackoverflow.slice(0, 3).map(s => s.url)
    };
  }

  /**
   * 创建新技能
   */
  async createNewSkill(practicalKnowledge) {
    const skillName = this.generateSkillName(practicalKnowledge);

    const skill = {
      name: skillName,
      description: `自动生成的技能（基于外部知识源）`,
      version: '1.0.0',
      sources: practicalKnowledge.resources,
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
    const direction = knowledge.summary?.keyInsights[0]?.content || 'general';
    const words = direction.toLowerCase().split(/\s+/).slice(0, 3);
    return 'soul-' + words.join('-').replace(/[^a-z0-9-]/g, '-');
  }

  /**
   * 生成触发词
   */
  generateTriggers(knowledge) {
    return knowledge.keyPoints
      .flatMap(point => point.toLowerCase().split(/\s+/))
      .filter(word => word.length > 3)
      .slice(0, 5);
  }

  /**
   * 保存技能
   */
  async saveSkill(skill) {
    const soulStateDir = CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'soul-state');
    const skillsDir = CrossPlatformUtils.buildPath(soulStateDir, 'evolved-skills');

    await fs.promises.mkdir(skillsDir, { recursive: true });

    const skillFile = CrossPlatformUtils.buildPath(skillsDir, `${skill.name}.json`);

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
    const soulStateDir = CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'soul-state');
    const evolutionLog = CrossPlatformUtils.buildPath(soulStateDir, 'evolution-log.jsonl');

    const logEntry = {
      timestamp: Date.now(),
      ...evolutionData
    };

    const line = JSON.stringify(logEntry) + '\n';
    await fs.promises.appendFile(evolutionLog, line);

    console.log(`📝 进化已记录: ${evolutionData.skill}`);
  }

  /**
   * 带超时的 fetch
   */
  async fetchWithTimeout(url, timeout = 5000) {
    const https = require('https');
    const http = require('http');

    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', reject);

      req.setTimeout(timeout, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
    });
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
   * 格式化输出
   */
  formatOutput(skill, knowledge, externalSources) {
    let output = '\n🧬 增强进化完成\n';
    output += '================\n\n';

    output += `✨ 新技能: ${skill.name}\n`;
    output += `📝 描述: ${skill.description}\n`;

    // 显示知识源
    output += '\n📚 知识源:\n';
    for (const [source, data] of Object.entries(externalSources)) {
      if (data && data.length > 0) {
        output += `  • ${source}: ${data.length} 个结果\n`;
      }
    }

    output += '\n🎯 关键要点:\n';
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

module.exports = SoulAutoEvolveEnhanced;
