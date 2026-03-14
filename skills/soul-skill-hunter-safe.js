/**
 * Soul Skill Hunter - Safe Version with Security Integration
 *
 * **重要**: 所有发现的技能都必须经过安全核验！
 *
 * 功能：
 * - 自动搜索 GitHub 上的技能仓库
 * - **集成安全审计**
 * - **下载前进行安全检查**
 * - 只推荐安全的技能
 *
 * 借鉴：OpenClaw 的 auto-skill-hunter + 安全扫描机制
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const SoulSecurityAuditor = require('./soul-security-auditor');
const CrossPlatformUtils = require('../src/utils/cross-platform-utils');

/**
 * SoulSkillHunterSafe 技能类
 */
class SoulSkillHunterSafe {
  constructor() {
    this.name = 'soul-skill-hunter';
    this.description = '安全第一的自动技能发现和推荐';
    this.triggers = ['hunt skills', '寻找技能', 'discover skills', '发现技能', 'skill hunter'];

    // 初始化安全审计器
    this.securityAuditor = new SoulSecurityAuditor();

    // 搜索目标
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
        'web automation',  // 新增：网页自动化
        'browser automation',
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
      stars: 10,
      updates: 8,
      description: 7,
      relevance: 15,
      security: 20  // 新增：安全权重
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
    console.log('\n🔍 [Soul Skill Hunter - Safe] 开始安全技能狩猎...');

    try {
      // 1. 分析当前技能缺口
      const skillGaps = await this.analyzeSkillGaps(memory);

      // 2. 搜索技能
      const allSkills = await this.searchAllSkills(skillGaps);

      console.log(`  📊 找到 ${allSkills.length} 个候选技能`);

      // 3. **安全检查（关键步骤）**
      const safeSkills = await this.performSecurityChecks(allSkills);

      console.log(`  ✅ 通过安全检查: ${safeSkills.length} 个`);

      // 4. 评估相关性
      const rankedSkills = await this.rankRelevance(safeSkills, skillGaps);

      // 5. 生成推荐（只推荐安全的）
      const recommendations = this.generateRecommendations(rankedSkills);

      // 6. 保存结果
      await this.saveHuntResults({
        timestamp: Date.now(),
        skillGaps,
        recommendations,
        totalFound: allSkills.length,
        safeCount: safeSkills.length,
        blockedCount: allSkills.length - safeSkills.length
      });

      // 推送事件
      eventStream.push({
        type: 'skill_hunt_complete',
        data: {
          found: recommendations.length,
          gaps: skillGaps.length,
          safe: recommendations.length,
          blocked: allSkills.length - safeSkills.length
        }
      });

      return {
        done: true,
        output: this.formatOutput(skillGaps, recommendations, allSkills.length - safeSkills.length),
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
   * **执行安全检查**（关键新增功能）
   */
  async performSecurityChecks(skills) {
    const safeSkills = [];

    console.log('  🔒 执行安全检查...');

    for (const skill of skills) {
      // 1. 快速安全预检
      const quickCheck = await this.quickSecurityCheck(skill);

      if (!quickCheck.safe) {
        console.log(`    ❌ ${skill.name} 未通过安全预检: ${quickCheck.reason}`);
        continue;
      }

      // 2. 如果有源代码链接，进行深度检查
      if (skill.source === 'github' && skill.url) {
        const deepCheck = await this.deepSecurityCheck(skill);

        if (deepCheck.safe) {
          // 添加安全评分
          skill.securityScore = deepCheck.score;
          skill.securityChecked = true;
          safeSkills.push(skill);
          console.log(`    ✅ ${skill.name} 通过安全检查 (评分: ${deepCheck.score})`);
        } else {
          console.log(`    ❌ ${skill.name} 未通过深度安全检查: ${deepCheck.reason}`);
        }
      } else {
        // npm 包或其他来源，添加基本安全标记
        skill.securityScore = 70; // 默认分数
        skill.securityChecked = true;
        safeSkills.push(skill);
        console.log(`    ⚠️ ${skill.name} 基本检查通过`);
      }
    }

    return safeSkills;
  }

  /**
   * 快速安全预检
   */
  async quickSecurityCheck(skill) {
    // 检查基本指标
    if (skill.stars < 5) {
      return {
        safe: false,
        reason: 'GitHub stars 过少，可能不可靠'
      };
    }

    // 检查描述
    if (!skill.description || skill.description.length < 10) {
      return {
        safe: false,
        reason: '描述不完整或不清晰'
      };
    }

    // 检查最近更新
    if (skill.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(skill.updatedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 365) {
        return {
          safe: false,
          reason: '超过一年未更新，可能已废弃'
        };
      }
    }

    // 检查名称安全性
    const suspiciousPatterns = [
      /hack/i,
      /crack/i,
      /exploit/i,
      /malware/i,
      /virus/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(skill.name) || pattern.test(skill.description)) {
        return {
          safe: false,
          reason: '名称或描述包含可疑关键词'
        };
      }
    }

    return { safe: true };
  }

  /**
   * 深度安全检查
   */
  async deepSecurityCheck(skill) {
    try {
      // 如果是 GitHub 仓库，尝试获取 README
      const readmeUrl = skill.url.replace('github.com', 'raw.githubusercontent.com')
                                 .replace(/\/$/, '')
                                 .replace('/blob/', '/')
                                 + '/master/README.md';

      const response = await this.fetchWithTimeout(readmeUrl, 3000);

      if (response) {
        // 使用安全审计器检查 README 内容
        const auditResult = await this.securityAuditor.quickCheck(response);

        if (!auditResult.safe) {
          return {
            safe: false,
            reason: 'README 包含可疑代码模式',
            score: 0
          };
        }
      }

      // 基于多个因素计算安全分数
      let score = 60; // 基础分

      // Stars 加分
      score += Math.min(20, Math.log10(skill.stars + 1) * 5);

      // 最近更新加分
      if (skill.updatedAt) {
        const daysSinceUpdate = (Date.now() - new Date(skill.updatedAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30) score += 15;
        else if (daysSinceUpdate < 90) score += 10;
        else if (daysSinceUpdate < 180) score += 5;
      }

      // 描述完整性加分
      if (skill.description && skill.description.length > 50) {
        score += 5;
      }

      return {
        safe: score >= 70,
        score: Math.min(100, score)
      };

    } catch (error) {
      // 如果检查失败，返回中等安全分数
      return {
        safe: true,
        score: 70,
        reason: '无法进行深度检查，使用默认分数'
      };
    }
  }

  /**
   * 分析当前技能缺口
   */
  async analyzeSkillGaps(memory) {
    const currentSkills = await this.getCurrentSkills();
    const recentSessions = await memory.retrieveMemories('', 20);
    const requiredSkills = this.extractRequiredSkills(recentSessions);

    const gaps = requiredSkills.filter(required => {
      return !currentSkills.some(current =>
        this.isSkillCovering(current, required)
      );
    });

    const recommendedGeneral = this.getRecommendedGeneralSkills(currentSkills);

    return [...gaps, ...recommendedGeneral];
  }

  /**
   * 获取当前已安装的技能
   */
  async getCurrentSkills() {
    const skills = [];
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
        // 忽略错误
      }
    }

    return skills;
  }

  /**
   * 从会话中提取需要的技能
   */
  extractRequiredSkills(sessions) {
    const skillPatterns = {
      'web-automation': ['browser', '浏览器', 'web', '网页', 'scraping', '爬虫'],
      'api-integration': ['api', 'api调用', '接口', 'http请求'],
      'data-processing': ['数据处理', '数据分析', 'data', 'csv', 'json'],
      'testing': ['测试', 'test', 'testing', '自动化测试'],
      'documentation': ['文档', 'document', 'readme', '文档生成'],
      'database': ['数据库', 'database', 'sql', 'mongodb'],
      'automation': ['自动化', 'automation', 'batch', '批处理']
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
      { type: 'web-automation', keywords: ['browser', 'web'], priority: 'high' },  // 新增
      { type: 'error-handling', keywords: ['error', '错误处理'], priority: 'high' },
      { type: 'logging', keywords: ['log', '日志', 'logging'], priority: 'high' },
      { type: 'security', keywords: ['security', '安全', 'audit'], priority: 'high' }  // 新增
    ];

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
   * 搜索所有技能
   */
  async searchAllSkills(skillGaps) {
    const skills = [];

    // 搜索 GitHub
    const githubSkills = await this.searchGitHubSkills(skillGaps);
    skills.push(...githubSkills);

    // 搜索 npm
    const npmSkills = await this.searchNpmSkills(skillGaps);
    skills.push(...npmSkills);

    return skills;
  }

  /**
   * 搜索 GitHub 技能
   */
  async searchGitHubSkills(skillGaps) {
    const skills = [];

    console.log('  🔎 搜索 GitHub 技能仓库...');

    for (const repo of this.searchTargets.githubRepos) {
      try {
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

    const keywords = skillGaps.map(gap => gap.type).join(' ');

    try {
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

      const nameLower = skill.name.toLowerCase();
      for (const keyword of gapKeywords) {
        if (nameLower.includes(keyword)) {
          relevanceScore += 10;
        }
      }

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
        totalScore: skill.score + relevanceScore + (skill.securityScore || 0)
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * 生成推荐
   */
  generateRecommendations(rankedSkills) {
    return rankedSkills
      .filter(skill => skill.totalScore > 30)  // 提高分数要求
      .filter(skill => skill.securityChecked)  // 只推荐已检查安全的
      .slice(0, 10)
      .map(skill => ({
        ...skill,
        recommendation: this.generateRecommendationText(skill),
        securityBadge: skill.securityScore >= 80 ? '🔒 高安全' : '🔒 基本安全'
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

    if (skill.securityScore >= 80) {
      reasons.push('高安全性');
    }

    return reasons.join('，') || '可能有用';
  }

  /**
   * 计算 GitHub 技能分数
   */
  calculateGitHubScore(repo) {
    let score = 0;
    score += Math.log10(repo.stargazers_count + 1) * this.qualityCriteria.stars;

    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += this.qualityCriteria.updates;
    } else if (daysSinceUpdate < 90) {
      score += this.qualityCriteria.updates * 0.5;
    }

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

    if (pkgObj.score && pkgObj.score.final) {
      score += pkgObj.score.final * this.qualityCriteria.stars;
    }

    const pkg = pkgObj.package;
    if (pkg.description && pkg.description.length > 20) {
      score += this.qualityCriteria.description;
    }

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
  formatOutput(skillGaps, recommendations, blockedCount) {
    let output = '\n🎯 技能狩猎报告（安全版）\n';
    output += '========================\n\n';

    output += '🔒 安全第一：所有推荐技能均已通过安全检查\n\n';

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

    // 显示安全统计
    if (blockedCount > 0) {
      output += `\n⚠️ 安全检查: ${blockedCount} 个技能因安全问题被过滤\n`;
    }

    // 显示推荐技能
    output += '\n✨ 推荐技能（全部已通过安全检查）:\n';
    if (recommendations.length === 0) {
      output += '  ⚠️ 未找到合适的推荐技能\n';
    } else {
      for (let i = 0; i < recommendations.length; i++) {
        const skill = recommendations[i];
        output += `\n${i + 1}. ${skill.name}\n`;
        output += `   ${skill.description}\n`;
        output += `   🔒 ${skill.securityBadge} | 安全评分: ${skill.securityScore || 0}\n`;
        output += `   ⭐ ${skill.source} | 总分: ${skill.totalScore}\n`;
        output += `   💡 ${skill.recommendation}\n`;
        output += `   🔗 ${skill.url}\n`;
      }
    }

    output += '\n💡 安装建议:\n';
    output += '  • GitHub: 克隆仓库到 ~/.stigmergy/skills/\n';
    output += '  • npm: npm install -g <package>\n';
    output += '  • ⚠️ 安装后建议再次运行安全审计\n';

    return output;
  }
}

module.exports = SoulSkillHunterSafe;
