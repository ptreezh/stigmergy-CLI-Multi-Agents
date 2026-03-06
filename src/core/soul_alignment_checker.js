/**
 * SoulAlignmentChecker - 灵魂对齐检查器
 *
 * 核心功能：
 * 1. 检查输出是否与soul.md人格对齐
 * 2. 检查是否偏离使命方向
 * 3. 专业知识准确性验证
 * 4. 实时对齐监控和提醒
 */

class SoulAlignmentChecker {
  constructor(options = {}) {
    this.soulIdentity = options.soulIdentity;
    this.knowledgeBase = options.knowledgeBase;

    this.config = {
      threshold: options.threshold || 0.7,
      checkPersonality: options.checkPersonality !== false,
      checkMission: options.checkMission !== false,
      checkExpertise: options.checkExpertise !== false,
      ...options,
    };

    // 对齐历史
    this.history = [];
    this.dailyScores = [];
  }

  /**
   * 检查输出对齐
   */
  async check(output) {
    const result = {
      aligned: true,
      overallScore: 1.0,
      personalityScore: 1.0,
      missionScore: 1.0,
      expertiseScore: 1.0,
      warnings: [],
      suggestions: [],
    };

    // 1. 人格对齐检查
    if (this.config.checkPersonality) {
      result.personalityScore = await this._checkPersonality(output);
    }

    // 2. 使命对齐检查
    if (this.config.checkMission) {
      result.missionScore = await this._checkMission(output);
    }

    // 3. 专业知识检查
    if (this.config.checkExpertise) {
      result.expertiseScore = await this._checkExpertise(output);
    }

    // 计算总分
    result.overallScore =
      result.personalityScore * 0.3 +
      result.missionScore * 0.4 +
      result.expertiseScore * 0.3;

    // 判断是否对齐
    result.aligned = result.overallScore >= this.config.threshold;

    // 生成警告和建议
    if (!result.aligned) {
      result.warnings.push(
        `对齐分数 ${result.overallScore} 低于阈值 ${this.config.threshold}`,
      );

      if (result.personalityScore < this.config.threshold) {
        result.suggestions.push(...this._suggestPersonalityCorrection(output));
      }
      if (result.missionScore < this.config.threshold) {
        result.suggestions.push(...this._suggestMissionCorrection(output));
      }
      if (result.expertiseScore < this.config.threshold) {
        result.suggestions.push(...this._suggestExpertiseCorrection(output));
      }
    }

    // 记录历史
    this._recordCheck(result);

    return result;
  }

  /**
   * 人格对齐检查
   */
  async _checkPersonality(output) {
    const traits = this.soulIdentity.personality?.traits || [];
    const style = this.soulIdentity.personality?.style || "";
    const values = this.soulIdentity.personality?.values || [];
    const boundaries = this.soulIdentity.personality?.boundaries || {
      allowed: [],
      forbidden: [],
    };

    let score = 0.5;
    let checks = 0;

    // 检查核心特质
    for (const trait of traits) {
      if (output.toLowerCase().includes(trait.toLowerCase())) {
        score += 0.1;
      }
      checks++;
    }

    // 检查沟通风格
    if (style) {
      if (style.includes("严谨") && this._containsFormalLanguage(output)) {
        score += 0.15;
      }
      if (style.includes("简洁") && this._isConcise(output)) {
        score += 0.15;
      }
      if (style.includes("耐心") && this._isPatient(output)) {
        score += 0.15;
      }
      checks++;
    }

    // 检查边界
    for (const forbidden of boundaries.forbidden) {
      if (output.toLowerCase().includes(forbidden.toLowerCase())) {
        score -= 0.2; // 触犯边界扣分
      }
      checks++;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 使命对齐检查
   */
  async _checkMission(output) {
    const mission = this.soulIdentity.mission || {};
    const ultimate = mission.ultimate || "";
    const responsibilities = mission.responsibilities || [];
    const audience = mission.audience || "";

    let score = 0.5;
    let checks = 0;

    // 检查终极目标关键词
    if (ultimate) {
      const keywords = ultimate.split(/[,，、\s]/).filter((k) => k.length > 2);
      const matchCount = keywords.filter((k) =>
        output.toLowerCase().includes(k.toLowerCase()),
      ).length;
      score += (matchCount / keywords.length) * 0.25;
      checks++;
    }

    // 检查核心职责
    for (const resp of responsibilities.slice(0, 3)) {
      const keywords = resp.split(/[,，、\s]/).filter((k) => k.length > 2);
      const hasMatch = keywords.some((k) =>
        output.toLowerCase().includes(k.toLowerCase()),
      );
      if (hasMatch) {
        score += 0.1;
      }
      checks++;
    }

    // 检查服务对象
    if (audience) {
      if (output.toLowerCase().includes(audience.toLowerCase().split(" ")[0])) {
        score += 0.15;
      }
      checks++;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 专业知识检查
   */
  async _checkExpertise(output) {
    const expertise = this.soulIdentity.expertise || {};
    const core = expertise.core || [];
    const related = expertise.related || [];

    let score = 0.4;
    let checks = 0;

    // 检查核心领域
    for (const exp of core) {
      if (output.toLowerCase().includes(exp.toLowerCase())) {
        score += 0.2;
      }
      checks++;
    }

    // 检查相关领域
    for (const rel of related.slice(0, 3)) {
      if (output.toLowerCase().includes(rel.toLowerCase())) {
        score += 0.1;
      }
      checks++;
    }

    // 验证准确性（通过知识库）
    if (this.knowledgeBase) {
      const keywords = [...core, ...related].slice(0, 5);
      for (const kw of keywords) {
        const results = this.knowledgeBase.search(kw, { limit: 3 });
        // 如果知识库有相关内容，检查是否匹配
        if (results.length > 0) {
          for (const r of results) {
            if (this._validateAgainstKnowledge(output, r.entry.content)) {
              score += 0.1;
              break;
            }
          }
        }
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 验证知识准确性
   */
  _validateAgainstKnowledge(output, knowledge) {
    // 简单验证：输出中应该包含知识库中的关键概念
    const knowledgeKeywords = knowledge
      .split(/[,，。.;:\s]+/)
      .filter((k) => k.length > 4)
      .slice(0, 10);

    const outputLower = output.toLowerCase();
    const matchCount = knowledgeKeywords.filter((k) =>
      outputLower.includes(k.toLowerCase()),
    ).length;

    return matchCount / knowledgeKeywords.length > 0.3;
  }

  /**
   * 人格纠正建议
   */
  _suggestPersonalityCorrection(output) {
    const suggestions = [];
    const traits = this.soulIdentity.personality?.traits || [];
    const style = this.soulIdentity.personality?.style || "";

    if (!traits.some((t) => output.toLowerCase().includes(t.toLowerCase()))) {
      suggestions.push(`建议体现核心特质: ${traits.join(", ")}`);
    }

    if (style.includes("严谨") && !this._containsFormalLanguage(output)) {
      suggestions.push("建议使用更严谨正式的表述");
    }

    if (style.includes("简洁") && !this._isConcise(output)) {
      suggestions.push("建议精简表述，突出重点");
    }

    return suggestions;
  }

  /**
   * 使命纠正建议
   */
  _suggestMissionCorrection(output) {
    const suggestions = [];
    const mission = this.soulIdentity.mission || {};
    const ultimate = mission.ultimate || "";

    if (ultimate) {
      suggestions.push(`请围绕核心使命展开: ${ultimate}`);
    }

    const responsibilities = mission.responsibilities || [];
    if (responsibilities.length > 0) {
      suggestions.push(`可从以下职责角度分析: ${responsibilities[0]}`);
    }

    return suggestions;
  }

  /**
   * 专业知识纠正建议
   */
  _suggestExpertiseCorrection(output) {
    const suggestions = [];
    const expertise = this.soulIdentity.expertise || {};
    const core = expertise.core || [];

    if (core.length > 0) {
      suggestions.push(`建议结合核心领域: ${core.join(", ")}`);
    }

    const learningDirs = expertise.learningDirections || [];
    if (learningDirs.length > 0) {
      suggestions.push(`可参考最新学习方向: ${learningDirs[0]}`);
    }

    return suggestions;
  }

  /**
   * 辅助方法
   */
  _containsFormalLanguage(output) {
    const formalPatterns = [
      /因此/,
      /基于/,
      /根据/,
      /分析/,
      /结论/,
      /然而/,
      /此外/,
      /namely/,
      /therefore/,
      /furthermore/,
    ];
    return formalPatterns.some((p) => p.test(output));
  }

  _isConcise(output) {
    // 简单判断：每段不超过100字符
    const paragraphs = output.split(/\n\n/);
    return paragraphs.every((p) => p.length < 150);
  }

  _isPatient(output) {
    // 检查是否有解释性内容
    const patterns = [
      /解释/,
      /详细/,
      /例如/,
      /也就是说/,
      /具体来说/,
      /for example/,
      /that is/,
      /in detail/,
    ];
    return patterns.some((p) => p.test(output));
  }

  /**
   * 记录检查结果
   */
  _recordCheck(result) {
    this.history.push({
      timestamp: new Date().toISOString(),
      score: result.overallScore,
      aligned: result.aligned,
    });

    // 保持历史在100条以内
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    // 记录每日分数
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = this.dailyScores.find((d) => d.date === today);
    if (todayEntry) {
      todayEntry.scores.push(result.overallScore);
      todayEntry.alignedCount += result.aligned ? 1 : 0;
    } else {
      this.dailyScores.push({
        date: today,
        scores: [result.overallScore],
        alignedCount: result.aligned ? 1 : 0,
      });
    }

    // 保持30天数据
    if (this.dailyScores.length > 30) {
      this.dailyScores = this.dailyScores.slice(-30);
    }
  }

  /**
   * 获取每日对齐统计
   */
  async checkDailyAlignment() {
    const today = new Date().toISOString().split("T")[0];
    const todayData = this.dailyScores.find((d) => d.date === today);

    if (!todayData || todayData.scores.length === 0) {
      return { date: today, checks: 0, avgScore: 0, aligned: 0 };
    }

    const avgScore =
      todayData.scores.reduce((a, b) => a + b, 0) / todayData.scores.length;

    return {
      date: today,
      checks: todayData.scores.length,
      avgScore,
      aligned: todayData.alignedCount,
      alignmentRate: todayData.alignedCount / todayData.scores.length,
    };
  }

  /**
   * 获取对齐历史
   */
  getHistory(days = 7) {
    return this.dailyScores.slice(-days);
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      threshold: this.config.threshold,
      totalChecks: this.history.length,
      recentAvgScore:
        this.history.slice(-10).reduce((a, b) => a + b.score, 0) /
          Math.min(10, this.history.length) || 0,
      alignmentRate:
        this.history.slice(-30).filter((h) => h.aligned).length /
          Math.min(30, this.history.length) || 0,
    };
  }
}

module.exports = SoulAlignmentChecker;
