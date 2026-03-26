#!/usr/bin/env node
/**
 * Auto Memory Skill Implementation
 *
 * 自动从各个 CLI 的独立运行中汲取经验教训
 * 更新到共享记忆，实现间接协同进化
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class AutoMemorySkill {
  constructor() {
    this.projectDir = process.cwd();
    this.stigmergyMd = path.join(this.projectDir, 'STIGMERGY.md');
    this.soulMd = path.join(this.projectDir, 'SOUL.md');
    this.sessionStartTime = Date.now();
    this.sessionMessages = [];
    this.initialized = false;
  }

  /**
   * 技能初始化
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('[AUTO_MEMORY] 自动记忆技能已启动');
    console.log('[AUTO_MEMORY] 会话开始，记录消息...');

    // 注册退出处理器
    this.registerExitHandlers();

    // 开始监控会话
    this.startMonitoring();

    this.initialized = true;
  }

  /**
   * 注册退出处理器
   */
  registerExitHandlers() {
    const self = this;

    // 正常退出
    process.on('exit', () => self.onSessionEnd());

    // 中断信号
    process.on('SIGINT', () => self.onSessionEnd());
    process.on('SIGTERM', () => self.onSessionEnd());
  }

  /**
   * 开始监控会话消息
   */
  startMonitoring() {
    const self = this;

    // Hook 全局错误处理来捕获输出
    const originalError = process.stderr.write;
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalErrorLog = console.error;

    // Hook stderr
    process.stderr.write = function(chunk) {
      const text = chunk.toString();
      if (text.trim()) {
        self.sessionMessages.push({
          timestamp: Date.now(),
          type: 'stderr',
          content: text
        });
      }
      return originalError.apply(process.stderr, arguments);
    };

    // Hook console.log
    console.log = function(...args) {
      const text = args.join(' ');
      if (text.trim()) {
        self.sessionMessages.push({
          timestamp: Date.now(),
          type: 'stdout',
          content: text
        });
      }
      return originalLog.apply(console, args);
    };

    // Hook console.warn
    console.warn = function(...args) {
      const text = args.join(' ');
      if (text.trim()) {
        self.sessionMessages.push({
          timestamp: Date.now(),
          type: 'stderr',
          content: text
        });
      }
      return originalWarn.apply(console, args);
    };

    // Hook console.error
    console.error = function(...args) {
      const text = args.join(' ');
      if (text.trim()) {
        self.sessionMessages.push({
          timestamp: Date.now(),
          type: 'stderr',
          content: text
        });
      }
      return originalError.apply(console.error, args);
    };
  }

  /**
   * 会话结束时的处理
   */
  async onSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStartTime;

    console.log('\n[AUTO_MEMORY] 会话结束，提取经验...');

    try {
      // 只处理有意义的会话
      if (sessionDuration > 5000 && this.sessionMessages.length > 0) {
        const insights = await this.analyzeSession();

        if (insights.length > 0) {
          // 更新共享记忆
          await this.updateSharedMemory(insights);

          // 尝试对齐 SOUL.md
          await this.alignWithSoul(insights);

          console.log(`[AUTO_MEMORY] ✅ 提取 ${insights.length} 条经验，已更新共享记忆`);
        } else {
          console.log('[AUTO_MEMORY] ℹ️  未发现显著经验');
        }
      } else {
        console.log('[AUTO_MEMORY] 会话太短，跳过记录');
      }

    } catch (error) {
      console.error('[AUTO_MEMORY] 提取记忆失败:', error.message);
    }
  }

  /**
   * 分析会话内容
   */
  async analyzeSession() {
    const insights = [];
    const allContent = this.sessionMessages.map(m => m.content).join('\n');

    // 分析各种模式
    const analysis = {
      success: this.detectSuccess(allContent),
      problems: this.detectProblems(allContent),
      solutions: this.detectSolutions(allContent),
      learning: this.detectLearning(allContent),
      improvements: this.detectImprovements(allContent)
    };

    // 转换为洞察列表
    if (analysis.success) {
      insights.push({
        type: 'success',
        description: '成功完成任务',
        confidence: 0.8
      });
    }

    if (analysis.problems.length > 0) {
      insights.push({
        type: 'problem',
        description: `发现 ${analysis.problems.length} 个问题`,
        details: analysis.problems.slice(0, 3),
        confidence: 0.7
      });
    }

    if (analysis.solutions.length > 0) {
      insights.push({
        type: 'solution',
        description: `找到 ${analysis.solutions.length} 个解决方案`,
        details: analysis.solutions.slice(0, 3),
        confidence: 0.9
      });
    }

    if (analysis.learning) {
      insights.push({
        type: 'learning',
        description: '学习新知识',
        confidence: 0.7
      });
    }

    if (analysis.improvements.length > 0) {
      insights.push({
        type: 'improvement',
        description: `发现 ${analysis.improvements.length} 个改进机会`,
        details: analysis.improvements.slice(0, 3),
        confidence: 0.8
      });
    }

    return insights;
  }

  /**
   * 检测成功模式
   */
  detectSuccess(content) {
    const successIndicators = [
      '成功', '完成', '✅', 'works', 'solved', 'fixed',
      'success', 'completed', 'done', 'achieved',
      'OK', 'finished', 'correct'
    ];

    return successIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * 检测问题
   */
  detectProblems(content) {
    const problems = [];
    const problemPatterns = [
      { regex: /(?:错误|失败|问题|bug|error|failed|issue)/gi, desc: '错误/失败' },
      { regex: /(?:不能|无法|错误|异常|exception)/gi, desc: '能力限制' },
      { regex: /(?:慢|超时|timeout|卡顿)/gi, desc: '性能问题' }
    ];

    problemPatterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        problems.push(pattern.desc);
      }
    });

    return [...new Set(problems)]; // 去重
  }

  /**
   * 检测解决方案
   */
  detectSolutions(content) {
    const solutions = [];
    const solutionPatterns = [
      { regex: /(?:解决|修复|改进|优化|方案|solve|fix|improve)/gi, desc: '解决方案' },
      { regex: /(?:建议|推荐|should|可以|try)/gi, desc: '建议方案' },
      { regex: /(?:方法|方式|如何|怎样)/gi, desc: '方法论' }
    ];

    solutionPatterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        solutions.push(pattern.desc);
      }
    });

    return [...new Set(solutions)];
  }

  /**
   * 检测学习内容
   */
  detectLearning(content) {
    const learningIndicators = [
      '学习', '发现', '理解', '领悟', '明白',
      'learn', 'discover', 'understand', 'realize',
      'know', 'found', 'grasp'
    ];

    return learningIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * 检测改进机会
   */
  detectImprovements(content) {
    const improvements = [];
    const improvementPatterns = [
      { regex: /(?:更好|最优|最佳|优化|提升|improve|optimize)/gi, desc: '优化机会' },
      { regex: /(?:增加|添加|新增|增加功能)/gi, desc: '功能扩展' },
      { regex: /(?:简化|精简|减少|删除|remove)/gi, desc: '简化机会' }
    ];

    improvementPatterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        improvements.push(pattern.desc);
      }
    });

    return [...new Set(improvements)];
  }

  /**
   * 更新共享记忆
   */
  async updateSharedMemory(insights) {
    const cli = process.env.STIGMERGY_CLI_NAME || 'unknown';
    const timestamp = new Date().toLocaleString();
    const sessionDuration = Math.round((Date.now() - this.sessionStartTime) / 1000);

    // 生成记忆条目
    const memoryEntry = `
## 独立运行经验 - ${Date.now()}
**CLI**: ${cli}
**时间**: ${timestamp}
**会话时长**: ${sessionDuration} 秒
**消息数量**: ${this.sessionMessages.length}

### 提取的经验
${insights.map((insight, i) => `${i + 1}. **${insight.type}** (${(insight.confidence * 100).toFixed(0)}%): ${insight.description}${insight.details ? `\n   详情: ${insight.details.join(', ')}` : ''}`).join('\n\n')}

### 会话摘要
${this.generateSessionSummary()}

---

`;

    // 追加到 STIGMERGY.md
    fs.appendFileSync(this.stigmergyMd, memoryEntry);
  }

  /**
   * 生成会话摘要
   */
  generateSessionSummary() {
    if (this.sessionMessages.length === 0) {
      return '(无消息)';
    }

    // 提取关键信息
    const userMessages = this.sessionMessages.filter(m =>
      m.type === 'stdout' && !m.content.startsWith('[')
    );

    const keyMessages = userMessages.slice(0, 3).map(m =>
      m.content.substring(0, 100)
    );

    return keyMessages.join('\n   ');
  }

  /**
   * 对齐 SOUL.md
   */
  async alignWithSoul(insights) {
    if (!fs.existsSync(this.soulMd)) {
      return;
    }

    const soulContent = fs.readFileSync(this.soulMd, 'utf-8');
    const currentGoals = this.extractGoals(soulContent);

    // 检查洞察是否有助于实现当前目标
    const relevantInsights = insights.filter(insight =>
      this.isRelevantToGoals(insight, currentGoals)
    );

    if (relevantInsights.length > 0) {
      console.log(`[AUTO_MEMORY] 💡 发现 ${relevantInsights.length} 条与目标相关的经验`);
    }
  }

  /**
   * 从 SOUL.md 中提取目标
   */
  extractGoals(content) {
    const goals = [];

    const goalSection = content.match(/## 进化目标[\s\S]*?(?=\n##|\n\n|$)/);
    if (goalSection) {
      const lines = goalSection[0].split('\n');
      lines.forEach(line => {
        if (line.match(/^\d+\./)) {
          goals.push(line.substring(3).trim());
        }
      });
    }

    return goals;
  }

  /**
   * 判断洞察是否与目标相关
   */
  isRelevantToGoals(insight, goals) {
    if (goals.length === 0) {
      return true;
    }

    const insightText = insight.description.toLowerCase();
    return goals.some(goal =>
      insightText.includes(goal.toLowerCase()) ||
      goal.toLowerCase().includes(insightText)
    );
  }
}

// 导出技能实例
module.exports = new AutoMemorySkill();
