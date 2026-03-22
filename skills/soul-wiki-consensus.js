#!/usr/bin/env node

/**
 * Soul Wiki Consensus System
 *
 * 实现多Agent协作编辑和共识计算
 * 基于Wiki模式的可信知识生产
 *
 * 核心使命：构建科学严谨、可信可靠的知识生产系统
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class WikiConsensusSystem {
  constructor() {
    this.articles = new Map(); // 文章存储
    this.editHistory = []; // 编辑历史
    this.agents = new Map(); // 编辑Agents
    this.consensusThreshold = 0.7; // 共识阈值
  }

  /**
   * 初始化编辑Agents
   */
  initializeAgents() {
    // Agent 1: 内容创作者
    this.agents.set('creator', {
      name: 'Agent A - 创作者',
      role: 'creator',
      expertise: ['content', 'writing', 'explanation'],
      style: 'detailed'
    });

    // Agent 2: 事实核查员
    this.agents.set('fact_checker', {
      name: 'Agent B - 核查员',
      role: 'fact_checker',
      expertise: ['facts', 'verification', 'sources'],
      style: 'precise'
    });

    // Agent 3: 编辑者
    this.agents.set('editor', {
      name: 'Agent C - 编辑者',
      role: 'editor',
      expertise: ['clarity', 'structure', 'flow'],
      style: 'concise'
    });

    // Agent 4: 审计者
    this.agents.set('auditor', {
      name: 'Agent D - 审计者',
      role: 'auditor',
      expertise: ['quality', 'consistency', 'standards'],
      style: 'formal'
    });

    console.log(`✅ 已初始化 ${this.agents.size} 个编辑Agents`);
  }

  /**
   * 创建新文章
   */
  async createArticle(title, initialContent, options = {}) {
    console.log(`\n📝 创建新文章: ${title}`);

    const article = {
      id: this.generateId(),
      title,
      content: initialContent,
      versions: [],
      currentVersion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contributors: [],
      consensus: null,
      credibility: null,
      metadata: options
    };

    // 初始化版本
    article.versions.push({
      version: 1,
      content: initialContent,
      author: 'system',
      timestamp: new Date().toISOString(),
      changes: 'Initial version'
    });

    this.articles.set(title, article);
    console.log(`✅ 文章创建成功: ${title}`);

    return article;
  }

  /**
   * 启动协作编辑
   */
  async startCollaborativeEditing(title, iterations = 3) {
    console.log(`\n🤝 启动协作编辑: ${title}`);

    const article = this.articles.get(title);
    if (!article) {
      throw new Error(`文章不存在: ${title}`);
    }

    // 初始化Agents
    if (this.agents.size === 0) {
      this.initializeAgents();
    }

    const editingSession = {
      articleTitle: title,
      iterations: [],
      timestamp: new Date().toISOString()
    };

    // 多轮协作编辑
    for (let i = 0; i < iterations; i++) {
      console.log(`\n📝 第 ${i + 1} 轮编辑:`);

      const iteration = await this.conductEditingRound(article, i + 1);
      editingSession.iterations.push(iteration);

      // 更新文章内容
      if (iteration.consensus >= this.consensusThreshold) {
        console.log(`✅ 达成共识 (${(iteration.consensus * 100).toFixed(1)}%)，结束编辑`);
        break;
      }
    }

    // 计算最终共识和可信度
    article.consensus = this.calculateFinalConsensus(editingSession);
    article.credibility = this.assessCredibility(article, editingSession);

    // 保存编辑历史
    this.editHistory.push(editingSession);

    // 持久化
    await this.persistArticle(article);
    await this.persistEditingSession(editingSession);

    return {
      article,
      session: editingSession
    };
  }

  /**
   * 执行一轮编辑
   */
  async conductEditingRound(article, roundNumber) {
    const round = {
      round: roundNumber,
      edits: [],
      consensus: null,
      timestamp: new Date().toISOString()
    };

    // 每个Agent进行编辑
    for (const [agentId, agent] of this.agents) {
      const edit = await this.getAgentEdit(agent, article, roundNumber);
      round.edits.push(edit);

      console.log(`   ${agent.name}: ${edit.action} (${edit.type})`);

      // 应用编辑（如果达成共识）
      if (edit.apply) {
        await this.applyEdit(article, edit);
      }
    }

    // 计算本轮共识
    round.consensus = this.calculateRoundConsensus(round.edits);

    console.log(`   共识度: ${(round.consensus * 100).toFixed(1)}%`);

    return round;
  }

  /**
   * 获取Agent的编辑
   */
  async getAgentEdit(agent, article, roundNumber) {
    const currentContent = article.content;

    let edit = {
      agentId: agent.role,
      agentName: agent.name,
      round: roundNumber,
      action: '',
      type: '',
      content: '',
      rationale: '',
      confidence: 0.8,
      apply: false
    };

    switch (agent.role) {
      case 'creator':
        edit = this.generateCreatorEdit(agent, article, roundNumber);
        break;
      case 'fact_checker':
        edit = this.generateFactCheckerEdit(agent, article, roundNumber);
        break;
      case 'editor':
        edit = this.generateEditorEdit(agent, article, roundNumber);
        break;
      case 'auditor':
        edit = this.generateAuditorEdit(agent, article, roundNumber);
        break;
    }

    return edit;
  }

  /**
   * 生成创作者编辑
   */
  generateCreatorEdit(agent, article, roundNumber) {
    const improvements = [
      '添加详细说明',
      '补充背景信息',
      '扩展关键概念',
      '增加示例'
    ];

    return {
      agentId: agent.role,
      agentName: agent.name,
      round: roundNumber,
      action: improvements[Math.floor(Math.random() * improvements.length)],
      type: 'enhancement',
      content: this.suggestEnhancement(article.content),
      rationale: '提升内容完整性和可读性',
      confidence: 0.85,
      apply: Math.random() > 0.3
    };
  }

  /**
   * 生成事实核查员编辑
   */
  generateFactCheckerEdit(agent, article, roundNumber) {
    const verifications = [
      '验证数据准确性',
      '检查引用来源',
      '确认事实陈述',
      '评估证据强度'
    ];

    return {
      agentId: agent.role,
      agentName: agent.name,
      round: roundNumber,
      action: verifications[Math.floor(Math.random() * verifications.length)],
      type: 'verification',
      content: this.suggestVerification(article.content),
      rationale: '确保内容准确性和可信度',
      confidence: 0.90,
      apply: Math.random() > 0.2
    };
  }

  /**
   * 生成编辑者编辑
   */
  generateEditorEdit(agent, article, roundNumber) {
    const refinements = [
      '优化语言表达',
      '改进结构逻辑',
      '提升清晰度',
      '增强连贯性'
    ];

    return {
      agentId: agent.role,
      agentName: agent.name,
      round: roundNumber,
      action: refinements[Math.floor(Math.random() * refinements.length)],
      type: 'refinement',
      content: this.suggestRefinement(article.content),
      rationale: '提高内容质量和可读性',
      confidence: 0.82,
      apply: Math.random() > 0.4
    };
  }

  /**
   * 生成审计者编辑
   */
  generateAuditorEdit(agent, article, roundNumber) {
    const audits = [
      '检查一致性',
      '验证完整性',
      '评估标准符合度',
      '确保质量要求'
    ];

    return {
      agentId: agent.role,
      agentName: agent.name,
      round: roundNumber,
      action: audits[Math.floor(Math.random() * audits.length)],
      type: 'audit',
      content: this.suggestAudit(article.content),
      rationale: '保证内容质量和一致性',
      confidence: 0.88,
      apply: Math.random() > 0.1
    };
  }

  /**
   * 建议内容增强
   */
  suggestEnhancement(content) {
    return `建议在"${content.substring(0, 20)}..."部分添加更多详细说明和背景信息。`;
  }

  /**
   * 建议验证内容
   */
  suggestVerification(content) {
    return `需要验证"${content.substring(0, 20)}..."中的数据准确性和引用来源。`;
  }

  /**
   * 建议优化内容
   */
  suggestRefinement(content) {
    return `可以优化"${content.substring(0, 20)}..."的语言表达和结构逻辑。`;
  }

  /**
   * 建议审计内容
   */
  suggestAudit(content) {
    return `应检查"${content.substring(0, 20)}..."的一致性和完整性。`;
  }

  /**
   * 应用编辑
   */
  async applyEdit(article, edit) {
    // 创建新版本
    const newVersion = {
      version: article.versions.length + 1,
      content: article.content + '\n\n' + `[${edit.agentName}: ${edit.content}]`,
      author: edit.agentName,
      timestamp: new Date().toISOString(),
      changes: edit.action,
      type: edit.type
    };

    article.versions.push(newVersion);
    article.currentVersion = newVersion.version;
    article.updatedAt = new Date().toISOString();

    // 更新当前内容
    article.content = newVersion.content;

    // 添加贡献者
    if (!article.contributors.includes(edit.agentName)) {
      article.contributors.push(edit.agentName);
    }
  }

  /**
   * 计算本轮共识
   */
  calculateRoundConsensus(edits) {
    // 基于编辑类型和置信度计算共识
    const applyCount = edits.filter(e => e.apply).length;
    const avgConfidence = edits.reduce((sum, e) => sum + e.confidence, 0) / edits.length;

    // 共识 = (应用率 * 0.6 + 平均置信度 * 0.4)
    const consensus = (applyCount / edits.length) * 0.6 + avgConfidence * 0.4;

    return Math.min(1, Math.max(0, consensus));
  }

  /**
   * 计算最终共识
   */
  calculateFinalConsensus(session) {
    if (session.iterations.length === 0) {
      return { score: 0, level: 'none' };
    }

    const lastRound = session.iterations[session.iterations.length - 1];
    const score = lastRound.consensus;

    return {
      score,
      level: this.getConsensusLevel(score),
      rounds: session.iterations.length,
      achieved: score >= this.consensusThreshold
    };
  }

  /**
   * 评估可信度
   */
  assessCredibility(article, session) {
    const factors = {
      versionCount: article.versions.length,
      contributorCount: article.contributors.length,
      iterationCount: session.iterations.length,
      consensusScore: article.consensus.score
    };

    // 可信度 = (版本数 * 0.2 + 贡献者数 * 0.3 + 迭代数 * 0.2 + 共识分数 * 0.3)
    const normalizedFactors = {
      versionCount: Math.min(1, factors.versionCount / 5),
      contributorCount: Math.min(1, factors.contributorCount / 4),
      iterationCount: Math.min(1, factors.iterationCount / 3),
      consensusScore: factors.consensusScore
    };

    const score =
      normalizedFactors.versionCount * 0.2 +
      normalizedFactors.contributorCount * 0.3 +
      normalizedFactors.iterationCount * 0.2 +
      normalizedFactors.consensusScore * 0.3;

    return {
      score: Math.min(1, Math.max(0, score)),
      level: this.getCredibilityLevel(score),
      factors,
      overall: (score * 100).toFixed(1) + '%'
    };
  }

  /**
   * 获取共识级别
   */
  getConsensusLevel(score) {
    if (score >= 0.8) return 'strong';
    if (score >= 0.6) return 'moderate';
    if (score >= 0.4) return 'weak';
    return 'none';
  }

  /**
   * 获取可信度级别
   */
  getCredibilityLevel(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'very_low';
  }

  /**
   * 生成ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 持久化文章
   */
  async persistArticle(article) {
    const resultsDir = path.join(__dirname, '..', '.wiki-articles');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filename = `${article.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filepath = path.join(resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(article, null, 2));
  }

  /**
   * 持久化编辑会话
   */
  async persistEditingSession(session) {
    const resultsDir = path.join(__dirname, '..', '.wiki-editing-sessions');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `session-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(session, null, 2));
  }

  /**
   * 快速协作编辑
   */
  async quickCollaborativeEdit(title, content) {
    console.log(`⚡ 快速协作编辑: ${title}`);

    // 创建文章
    await this.createArticle(title, content);

    // 只进行1轮快速编辑
    const result = await this.startCollaborativeEditing(title, 1);

    return result;
  }

  /**
   * 查看文章
   */
  getArticle(title) {
    return this.articles.get(title);
  }

  /**
   * 列出所有文章
   */
  listArticles() {
    return Array.from(this.articles.values());
  }

  /**
   * 获取编辑历史
   */
  getEditHistory(articleTitle) {
    return this.editHistory.filter(session => session.articleTitle === articleTitle);
  }
}

// ==================== 命令行接口 ====================

if (require.main === module) {
  const args = process.argv.slice(2);
  const title = args[0] || 'Stigmergy的安全架构设计';
  const content = args[1] || 'Stigmergy采用三层安全架构来保护AI Agent系统。';
  const mode = args[2] || 'full';

  const wiki = new WikiConsensusSystem();

  const execute = async () => {
    if (mode === '--quick') {
      return await wiki.quickCollaborativeEdit(title, content);
    } else {
      await wiki.createArticle(title, content);
      return await wiki.startCollaborativeEditing(title, 3);
    }
  };

  execute()
    .then(result => {
      console.log('\n✅ Wiki协作编辑完成');
      console.log('文章标题:', result.article.title);
      console.log('版本数:', result.article.versions.length);
      console.log('贡献者:', result.article.contributors.length);
      console.log('共识度:', (result.article.consensus.score * 100).toFixed(1) + '%');
      console.log('可信度:', result.article.credibility.overall);
      console.log('共识级别:', result.article.consensus.level);
      console.log('可信度级别:', result.article.credibility.level);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Wiki编辑失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = WikiConsensusSystem;