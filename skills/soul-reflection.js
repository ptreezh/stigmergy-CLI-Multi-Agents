/**
 * Soul Reflection Skill - 可执行版本
 *
 * 功能：深度反思和分析，提取学习要点
 * 借鉴：OpenClaw 的记忆和反思机制
 */

const fs = require('fs');
const CrossPlatformUtils = require('../../src/utils/cross-platform-utils');
const path = require('path');
const os = require('os');

/**
 * SoulReflection 技能类
 */
class SoulReflection {
  constructor() {
    this.name = 'soul-reflection';
    this.description = '深度反思和分析能力';
    this.triggers = ['reflect', '反思', 'analyze', '分析'];
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
    console.log('\n🧠 [Soul Reflection] 开始深度反思...');

    // 1. 收集最近的会话
    const recentSessions = await memory.retrieveMemories('', 10);

    // 2. 分析会话
    const analysis = await this.analyzeSessions(recentSessions);

    // 3. 提取学习要点
    const learnings = this.extractLearnings(analysis);

    // 4. 生成改进建议
    const improvements = this.generateImprovements(learnings);

    // 5. 保存反思结果
    await this.saveReflection({
      timestamp: Date.now(),
      analysis,
      learnings,
      improvements,
      score: this.calculateScore(analysis)
    });

    // 推送事件
    eventStream.push({
      type: 'reflection_complete',
      data: { learnings, improvements }
    });

    return {
      done: true,
      output: this.formatOutput(learnings, improvements),
      context: {
        lastReflection: Date.now(),
        learningsCount: learnings.length
      }
    };
  }

  /**
   * 分析会话
   */
  async analyzeSessions(sessions) {
    const analysis = {
      totalSessions: sessions.length,
      successfulTasks: 0,
      failedTasks: 0,
      patterns: [],
      commonErrors: []
    };

    for (const session of sessions) {
      if (session.events) {
        const completed = session.events.filter(e => e.type === 'task_complete');
        const errors = session.events.filter(e => e.type === 'error');

        analysis.successfulTasks += completed.length;
        analysis.failedTasks += errors.length;

        // 提取错误模式
        for (const error of errors) {
          if (error.error) {
            analysis.commonErrors.push(error.error);
          }
        }
      }
    }

    // 识别模式
    analysis.patterns = this.identifyPatterns(sessions);

    return analysis;
  }

  /**
   * 识别模式
   */
  identifyPatterns(sessions) {
    const patterns = [];

    // 分析任务类型
    const taskTypes = {};
    for (const session of sessions) {
      const type = this.classifyTask(session.task);
      taskTypes[type] = (taskTypes[type] || 0) + 1;
    }

    // 找出最常见的任务类型
    const sortedTypes = Object.entries(taskTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [type, count] of sortedTypes) {
      patterns.push({
        type: 'task_type',
        value: type,
        frequency: count
      });
    }

    return patterns;
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
    } else if (taskLower.includes('analyze') || taskLower.includes('分析')) {
      return 'analysis';
    } else if (taskLower.includes('learn') || taskLower.includes('学习')) {
      return 'learning';
    } else {
      return 'general';
    }
  }

  /**
   * 提取学习要点
   */
  extractLearnings(analysis) {
    const learnings = [];

    // 从成功中学习
    if (analysis.successfulTasks > 0) {
      learnings.push({
        type: 'success',
        content: `成功完成了 ${analysis.successfulTasks} 个任务`,
        actionable: false
      });
    }

    // 从失败中学习
    if (analysis.commonErrors.length > 0) {
      const errorCounts = {};
      for (const error of analysis.commonErrors) {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      }

      // 找出最常见的错误
      const topErrors = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      for (const [error, count] of topErrors) {
        learnings.push({
          type: 'error_pattern',
          content: `常见错误: ${error} (出现 ${count} 次)`,
          actionable: true
        });
      }
    }

    // 从模式中学习
    for (const pattern of analysis.patterns) {
      learnings.push({
        type: 'pattern',
        content: `常见任务模式: ${pattern.value} (频率: ${pattern.frequency})`,
        actionable: false
      });
    }

    return learnings;
  }

  /**
   * 生成改进建议
   */
  generateImprovements(learnings) {
    const improvements = [];

    for (const learning of learnings) {
      if (learning.actionable) {
        if (learning.type === 'error_pattern') {
          improvements.push({
            priority: 'high',
            action: 'fix_error_pattern',
            description: `修复错误模式: ${learning.content}`,
            expectedImpact: '减少错误发生率'
          });
        }
      }
    }

    // 添加通用改进建议
    improvements.push({
      priority: 'medium',
      action: 'increase_skill_coverage',
      description: '增加技能覆盖范围，学习新领域',
      expectedImpact: '提升任务完成率'
    });

    return improvements;
  }

  /**
   * 计算反思分数
   */
  calculateScore(analysis) {
    let score = 50; // 基础分

    // 成功率加分
    const totalTasks = analysis.successfulTasks + analysis.failedTasks;
    if (totalTasks > 0) {
      const successRate = analysis.successfulTasks / totalTasks;
      score += successRate * 30;
    }

    // 模式识别加分
    if (analysis.patterns.length > 0) {
      score += analysis.patterns.length * 5;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * 保存反思结果
   */
  async saveReflection(reflection) {
    const soulStateDir = CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'soul-state');
    const reflectionDir = CrossPlatformUtils.buildPath(soulStateDir, 'reflections');

    await fs.promises.mkdir(reflectionDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reflectionFile = CrossPlatformUtils.buildPath(reflectionDir, `reflection_${timestamp}.json`);

    await fs.promises.writeFile(
      reflectionFile,
      JSON.stringify(reflection, null, 2)
    );

    console.log(`💾 反思已保存: ${reflectionFile}`);
  }

  /**
   * 格式化输出
   */
  formatOutput(learnings, improvements) {
    let output = '\n📊 反思分析结果\n';
    output += '================\n\n';

    output += '🎓 学习要点:\n';
    for (const learning of learnings) {
      const icon = learning.type === 'success' ? '✅' :
                   learning.type === 'error_pattern' ? '⚠️' : '💡';
      output += `  ${icon} ${learning.content}\n`;
    }

    output += '\n🚀 改进建议:\n';
    for (const improvement of improvements) {
      const priorityIcon = improvement.priority === 'high' ? '🔴' :
                          improvement.priority === 'medium' ? '🟡' : '🟢';
      output += `  ${priorityIcon} ${improvement.description}\n`;
      output += `     预期影响: ${improvement.expectedImpact}\n`;
    }

    return output;
  }
}

module.exports = SoulReflection;
