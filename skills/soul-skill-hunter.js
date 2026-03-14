/**
 * Soul Skill Hunter - 自动发现和推荐新技能
 *
 * 功能：
 * - 自动搜索 GitHub 上的技能仓库
 * - 分析技能相关性和质量
 * - 推荐适合的技能安装
 * - 追踪热门技能趋势
 *
 * 借鉴：OpenClaw 的 auto-skill-hunter 机制
 */

const fs = require('fs');
const CrossPlatformUtils = require('../../src/utils/cross-platform-utils');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

/**
 * SoulSkillHunter 技能类
 */
class SoulSkillHunter {
  constructor() {
    this.name = 'soul-skill-hunter';
    this.description = '自动发现和推荐新技能';
    this.triggers = ['hunt skills', '寻找技能', 'discover skills', '发现技能', 'skill hunter'];

    // 搜索目标（GitHub 仓库和关键词）
    this.searchTargets = {
      githubRepos: [
        'awesome-openclaw-skills',
        'agent-skills',
        'claude-skills',
        'ai-agent-skills'
      ],
      keywords: [
        'claude skill',
        'ai agent',
        'llm skill',
        'automation',
        'api integration',
        'data processing',
        'web scraping',
        'testing automation'
      ],
      stigmergyRepos: [
        'ptreezh/stigmergy-CLI-Multi-Agents'
      ]
    };

    // 技能质量评分标准
    this.qualityCriteria = {
      stars: 10,        // GitHub stars 权重
      updates: 8,       // 最近更新权重
      description: 7,   // 描述完整性权重
      relevance: 15     // 相关性权重（最高）
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
    console.log('\n🔍 [Soul Skill Hunter] 开始技能狩猎...');

    try {
      // 1. 分析当前技能缺口
      const skillGaps = await this.analyzeSkillGaps(memory);

      // 2. 搜索 GitHub 技能
      const githubSkills = await this.searchGitHubSkills(skillGaps);

      // 3. 搜索 npm 技能包
      const npmSkills = await this.searchNpmSkills(skillGaps);

      // 4. 评估相关性
      const rankedSkills = await this.rankRelevance(
        [...githubSkills, ...npmSkills],
        skillGaps
      );

      // 5. 生成推荐
      const recommendations = this.generateRecommendations(rankedSkills);

      // 6. 保存结果
      await this.saveHuntResults({
        timestamp: Date.now(),
        skillGaps,
        recommendations,
        totalFound: githubSkills.length + npmSkills.length
      });

      // 推送事件
      eventStream.push({
        type: 'skill_hunt_complete',
        data: {
          found: recommendations.length,
          gaps: skillGaps.length
        }
      });

      return {
        done: true,
        output: this.formatOutput(skillGaps, recommendations),
        context: {
          recommendations: recommendations.map(r => r.name),
          lastHunt: Date.now()
        }
      };
    } catch (error) {
      console.error('❌ Skill hunter error:', error);
      return {
        done: true,
        output: `⚠️ 技能狩猎遇到问题: ${error.message}\n提示: 请检查网络连接和 GitHub 访问`
      };
    }
  }

  /**
   * 分析当前技能缺口
   */
  async analyzeSkillGaps(memory) {
    // 1. 读取当前已安装的技能
    const currentSkills = await this.getCurrentSkills();

    // 2. 分析最近的任务，识别需要的技能
    const recentSessions = await memory.retrieveMemories('', 20);
    const requiredSkills = this.extractRequiredSkills(recentSessions);

    // 3. 找出缺口
    const gaps = requiredSkills.filter(required => {
      return !currentSkills.some(current =>
        this.isSkillCovering(current, required)
      );
    });

    // 4. 添加推荐的通用技能
    const recommendedGeneral = this.getRecommendedGeneralSkills(currentSkills);

    return [...gaps, ...recommendedGeneral];
  }

  /**
   * 获取当前已安装的技能
   */
  async getCurrentSkills() {
    const skills = [];

    // 扫描多个技能目录
    const skillDirs = [
      CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'skills'),
      CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.claude', 'skills'),
      CrossPlatformUtils.buildPath(process.cwd(), 'skills')
    ];

    for (const dir of skillDirs) {
      try {
        if (CrossPlatformUtils.fileExists(dir)) {
          const files = CrossPlatformUtils.safeReaddir(dir).files || [];
          for (const file of files) {
            if (file.endsWith('.md') || file.endsWith('.js')) {
              const skillName = path.basename(file, path.extname(file));
              skills.push({
                name: skillName,
                source: dir
              });
            }
          }
        }
      } catch (error) {
        // 忽略目录不存在或无法访问的情况
      }
    }

    return skills;
  }

  /**
   * 从会话中提取需要的技能
   */
  extractRequiredSkills(sessions) {
    const skillPatterns = {
      'api-integration': ['api', 'api调用', '接口', 'http请求'],
      'data-processing': ['数据处理', '数据分析', 'data', 'csv', 'json'],
      'web-scraping': ['爬虫', '抓取', 'scraping', '网页数据'],
      'testing': ['测试', 'test', 'testing', '自动化测试'],
      'documentation': ['文档', 'document', 'readme', '文档生成'],
      'database': ['数据库', 'database', 'sql', 'mongodb'],
      'automation': ['自动化', 'automation', 'batch', '批处理'],
      'web-development': ['web', '网站', 'frontend', 'backend']
    };

    const required = [];

    for (const session of sessions) {
      if (!session.task) continue;

      const taskLower = session.task.toLowerCase();

      for (const [skill, keywords] of Object.entries(skillPatterns)) {
        if (keywords.some(keyword => taskLower.includes(keyword))) {
          if (!required.includes(skill)) {
            required.push({
              type: skill,
              keywords: keywords
            });
          }
        }
      }
    }

    return required;
  }

  /**
   * 推荐的通用技能
   */
  getRecommendedGeneralSkills(currentSkills) {
    const allRecommended = [
      { type: 'error-handling', keywords: ['error', '错误处理'], priority: 'high' },
      { type: 'logging', keywords: ['log', '日志', 'logging'], priority: 'high' },
      { type: 'configuration', keywords: ['config', '配置', 'settings'], priority: 'medium' },
      { type: 'performance', keywords: ['performance', '性能', 'optimization'], priority: 'medium' }
    ];

    // 过滤掉已有的技能
    return allRecommended.filter(rec => {
      return !currentSkills.some(current =>
        current.name.toLowerCase().includes(rec.type)
      );
    });
  }

  /**
   * 判断技能是否覆盖需求
   */
  isSkillCovering(skill, requirement) {
    const skillName = skill.name.toLowerCase();
    const reqType = requirement.type?.toLowerCase() || '';

    return skillName.includes(reqType) ||
           requirement.keywords?.some(keyword =>
             skillName.includes(keyword.toLowerCase())
           );
  }

  /**
   * 搜索 GitHub 技能
   */
  async searchGitHubSkills(skillGaps) {
    const skills = [];

    console.log('  🔎 搜索 GitHub 技能仓库...');

    for (const repo of this.searchTargets.githubRepos) {
      try {
        // 使用 GitHub API 搜索（不需要认证）
        const query = `${repo} language:javascript stars:>10`;
        const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;

        const response = await this.fetchWithTimeout(searchUrl, 5000);
        const data = JSON.parse(response);

        if (data.items) {
          for (const item of data.items) {
            skills.push({
              name: item.name,
              description: item.description || 'No description',
              url: item.html_url,
              stars: item.stargazers_count,
              updatedAt: item.updated_at,
              language: item.language,
              source: 'github',
              score: this.calculateGitHubScore(item)
            });
          }
        }
      } catch (error) {
        console.log(`    ⚠️ 搜索 ${repo} 失败: ${error.message}`);
      }
    }

    console.log(`    ✅ 找到 ${skills.length} 个 GitHub 技能`);
    return skills;
  }

  /**
   * 搜索 npm 技能包
   */
  async searchNpmSkills(skillGaps) {
    const skills = [];

    console.log('  🔎 搜索 npm 技能包...');

    // 基于缺口生成搜索关键词
    const keywords = skillGaps.map(gap => gap.type).join(' ');

    try {
      // 使用 npm registry API
      const searchUrl = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(keywords + ' skill agent')}&size=10`;

      const response = await this.fetchWithTimeout(searchUrl, 5000);
      const data = JSON.parse(response);

      if (data.objects) {
        for (const obj of data.objects) {
          const pkg = obj.package;
          skills.push({
            name: pkg.name,
            description: pkg.description || 'No description',
            url: `https://www.npmjs.com/package/${pkg.name}`,
            version: pkg.version,
            source: 'npm',
            score: this.calculateNpmScore(obj)
          });
        }
      }
    } catch (error) {
      console.log(`    ⚠️ 搜索 npm 失败: ${error.message}`);
    }

    console.log(`    ✅ 找到 ${skills.length} 个 npm 技能`);
    return skills;
  }

  /**
   * 评估相关性并排序
   */
  async rankRelevance(skills, skillGaps) {
    const gapKeywords = skillGaps.flatMap(gap =>
      (gap.keywords || [gap.type]).map(k => k.toLowerCase())
    );

    return skills.map(skill => {
      let relevanceScore = 0;

      // 名称匹配
      const nameLower = skill.name.toLowerCase();
      for (const keyword of gapKeywords) {
        if (nameLower.includes(keyword)) {
          relevanceScore += 10;
        }
      }

      // 描述匹配
      if (skill.description) {
        const descLower = skill.description.toLowerCase();
        for (const keyword of gapKeywords) {
          if (descLower.includes(keyword)) {
            relevanceScore += 5;
          }
        }
      }

      return {
        ...skill,
        relevanceScore,
        totalScore: skill.score + relevanceScore
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * 生成推荐
   */
  generateRecommendations(rankedSkills) {
    // 只推荐前 10 个高质量技能
    return rankedSkills
      .filter(skill => skill.totalScore > 20)
      .slice(0, 10)
      .map(skill => ({
        ...skill,
        recommendation: this.generateRecommendationText(skill)
      }));
  }

  /**
   * 生成推荐文本
   */
  generateRecommendationText(skill) {
    const reasons = [];

    if (skill.relevanceScore > 10) {
      reasons.push('高度匹配当前需求');
    }

    if (skill.stars > 100) {
      reasons.push('社区热门');
    }

    if (this.isRecentlyUpdated(skill.updatedAt)) {
      reasons.push('积极维护');
    }

    return reasons.join('，') || '可能有用';
  }

  /**
   * 计算 GitHub 技能分数
   */
  calculateGitHubScore(repo) {
    let score = 0;

    // Stars 分数（对数刻度）
    score += Math.log10(repo.stargazers_count + 1) * this.qualityCriteria.stars;

    // 更新时间分数
    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += this.qualityCriteria.updates;
    } else if (daysSinceUpdate < 90) {
      score += this.qualityCriteria.updates * 0.5;
    }

    // 描述完整性
    if (repo.description && repo.description.length > 20) {
      score += this.qualityCriteria.description;
    }

    return Math.round(score);
  }

  /**
   * 计算 npm 技能分数
   */
  calculateNpmScore(pkgObj) {
    let score = 0;

    // 下载量分数（对数刻度）
    if (pkgObj.score && pkgObj.score.final) {
      score += pkgObj.score.final * this.qualityCriteria.stars;
    }

    // 描述完整性
    const pkg = pkgObj.package;
    if (pkg.description && pkg.description.length > 20) {
      score += this.qualityCriteria.description;
    }

    // 维护状态
    if (pkg.version) {
      score += this.qualityCriteria.updates * 0.3;
    }

    return Math.round(score);
  }

  /**
   * 判断是否最近更新
   */
  isRecentlyUpdated(updatedAt) {
    if (!updatedAt) return false;
    const daysSinceUpdate = (Date.now() - new Date(updatedAt)) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate < 60;
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
   * 保存狩猎结果
   */
  async saveHuntResults(results) {
    const soulStateDir = CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'soul-state');
    const huntLog = CrossPlatformUtils.buildPath(soulStateDir, 'skill-hunts.jsonl');

    await fs.promises.mkdir(soulStateDir, { recursive: true });

    const line = JSON.stringify(results) + '\n';
    await fs.promises.appendFile(huntLog, line);

    console.log(`💾 狩猎结果已保存: ${huntLog}`);
  }

  /**
   * 格式化输出
   */
  formatOutput(skillGaps, recommendations) {
    let output = '\n🎯 技能狩猎报告\n';
    output += '================\n\n';

    // 显示技能缺口
    output += '📋 当前技能缺口:\n';
    if (skillGaps.length === 0) {
      output += '  ✅ 没有明显的技能缺口\n';
    } else {
      for (const gap of skillGaps) {
        const icon = gap.priority === 'high' ? '🔴' : '🟡';
        output += `  ${icon} ${gap.type}\n`;
      }
    }

    // 显示推荐技能
    output += '\n✨ 推荐技能:\n';
    if (recommendations.length === 0) {
      output += '  ⚠️ 未找到合适的推荐技能\n';
    } else {
      for (let i = 0; i < recommendations.length; i++) {
        const skill = recommendations[i];
        output += `\n${i + 1}. ${skill.name}\n`;
        output += `   ${skill.description}\n`;
        output += `   ⭐ ${skill.source} | 分数: ${skill.totalScore}\n`;
        output += `   💡 ${skill.recommendation}\n`;
        output += `   🔗 ${skill.url}\n`;
      }
    }

    output += '\n💡 安装建议:\n';
    output += '  • GitHub: 克隆仓库到 ~/.stigmergy/skills/\n';
    output += '  • npm: npm install -g <package>\n';
    output += '  • 自定义: 复制技能代码到 skills 目录\n';

    return output;
  }
}

module.exports = SoulSkillHunter;
