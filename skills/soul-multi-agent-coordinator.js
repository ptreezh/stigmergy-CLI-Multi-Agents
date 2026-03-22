#!/usr/bin/env node

/**
 * Soul Multi-Agent Coordinator
 *
 * 实现多Agent协作的自主进化系统
 * 基于双Agent循环：执行者 ←→ 反思者
 *
 * 核心使命：构建科学严谨、可信可靠的跨CLI多智能体进化系统
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class MultiAgentCoordinator {
  constructor() {
    this.agents = {
      executor: null,      // 执行者Agent
      reflector: null,     // 反思者Agent
      auditor: null,       // 审计者Agent
      evolution: null      // 进化者Agent
    };
    this.memory = [];
    this.context = {
      mission: '构建科学严谨、可信可靠的跨CLI多智能体进化系统',
      goals: [
        '自主记忆机制 - 持久化、分层级的记忆系统',
        '自主反思机制 - 自我批判、自我修正、自我优化',
        '自主进化机制 - 持续学习、技能发现、能力提升',
        '知识生产系统 - 多Agent辩论、Wiki共识计算、可信知识自主生产'
      ]
    };
  }

  /**
   * 启动自主进化循环
   */
  async startAutonomousEvolution() {
    console.log('🧬 启动Soul自主进化系统...');

    // 1. 执行当前任务
    const executionResult = await this.executeTask();

    // 2. 反思执行结果
    const reflectionResult = await this.reflectOnExecution(executionResult);

    // 3. 审计安全性
    const auditResult = await this.auditReflection(reflectionResult);

    // 4. 决定进化方向
    const evolutionDirection = await this.planEvolution(auditResult);

    // 5. 更新记忆系统
    await this.updateMemory(evolutionDirection);

    return evolutionDirection;
  }

  /**
   * 执行任务（Executor Agent）
   */
  async executeTask() {
    console.log('🎯 Executor Agent: 执行任务...');

    // 使用现有的soul相关技能
    const skills = [
      'soul-reflection',    // 自我反思
      'soul-evolution',     // 自主进化
      'soul-co-evolve',     // 协同进化
      'soul-compete'        // 竞争进化
    ];

    const results = [];
    for (const skill of skills) {
      console.log(`   执行技能: ${skill}`);
      try {
        const result = await this.executeSkill(skill);
        results.push({ skill, result, success: true });
      } catch (error) {
        results.push({ skill, error: error.message, success: false });
      }
    }

    return {
      agent: 'executor',
      action: 'execute-skills',
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 反思执行结果（Reflector Agent）
   */
  async reflectOnExecution(executionResult) {
    console.log('🤔 Reflector Agent: 反思执行结果...');

    const reflections = [];

    for (const result of executionResult.results) {
      if (!result.success) {
        // 反思失败原因
        reflections.push({
          type: 'failure-analysis',
          skill: result.skill,
          issue: result.error,
          improvement: this.suggestImprovement(result.error),
          confidence: 0.8
        });
      } else {
        // 提取成功经验
        reflections.push({
          type: 'success-pattern',
          skill: result.skill,
          pattern: this.extractPattern(result.result),
          confidence: 0.9
        });
      }
    }

    return {
      agent: 'reflector',
      action: 'reflect-on-execution',
      reflections,
      summary: this.summarizeReflections(reflections),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 审计反思结果（Auditor Agent）
   */
  async auditReflection(reflectionResult) {
    console.log('🔒 Auditor Agent: 审计安全性...');

    // 安全检查清单
    const securityChecks = [
      {
        check: 'mission-alignment',
        description: '是否对齐核心使命',
        result: this.checkMissionAlignment(reflectionResult)
      },
      {
        check: 'context-clarity',
        description: '上下文是否清晰',
        result: this.checkContextClarity(reflectionResult)
      },
      {
        check: 'redundancy-check',
        description: '是否存在冗余',
        result: this.checkRedundancy(reflectionResult)
      },
      {
        check: 'automatability',
        description: '是否可自动化',
        result: this.checkAutomatability(reflectionResult)
      }
    ];

    const auditReport = {
      agent: 'auditor',
      action: 'security-audit',
      checks: securityChecks,
      overall: this.calculateOverallScore(securityChecks),
      recommendations: this.generateRecommendations(securityChecks),
      timestamp: new Date().toISOString()
    };

    return auditReport;
  }

  /**
   * 规划进化方向（Evolution Agent）
   */
  async planEvolution(auditResult) {
    console.log('🚀 Evolution Agent: 规划进化方向...');

    // 基于审计结果决定进化方向
    const evolutionPlan = {
      agent: 'evolution',
      action: 'plan-evolution',
      direction: this.determineDirection(auditResult),
      priority: this.determinePriority(auditResult),
      nextSteps: this.generateNextSteps(auditResult),
      confidence: this.calculateConfidence(auditResult),
      timestamp: new Date().toISOString()
    };

    return evolutionPlan;
  }

  /**
   * 更新记忆系统
   */
  async updateMemory(evolutionDirection) {
    console.log('💾 更新记忆系统...');

    const memoryEntry = {
      timestamp: new Date().toISOString(),
      evolution: evolutionDirection,
      context: this.context
    };

    this.memory.push(memoryEntry);

    // 持久化到文件
    const memoryPath = path.join(__dirname, '..', '.soul-memory.json');
    fs.writeFileSync(memoryPath, JSON.stringify(this.memory, null, 2));

    console.log('   记忆已更新并持久化');
  }

  // ==================== 辅助方法 ====================

  /**
   * 执行单个技能
   */
  async executeSkill(skillName) {
    return new Promise((resolve, reject) => {
      const stigmergyPath = path.join(__dirname, '..', 'src', 'index.js');
      const args = ['soul', skillName.split('-')[1]]; // soul reflect, soul evolve等

      const child = spawn('node', [stigmergyPath, ...args], {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ output, success: true });
        } else {
          reject(new Error(error || `Skill ${skillName} failed with code ${code}`));
        }
      });
    });
  }

  /**
   * 建议改进方案
   */
  suggestImprovement(error) {
    if (error.includes('timeout')) {
      return '增加超时时间或优化执行效率';
    } else if (error.includes('permission')) {
      return '检查文件权限和路径配置';
    } else if (error.includes('network')) {
      return '添加重试机制和错误处理';
    } else {
      return '需要进一步调查和优化';
    }
  }

  /**
   * 提取成功模式
   */
  extractPattern(result) {
    // 从成功结果中提取可复用的模式
    return {
      successful: true,
      timestamp: new Date().toISOString(),
      context: 'execution-pattern'
    };
  }

  /**
   * 总结反思结果
   */
  summarizeReflections(reflections) {
    const successes = reflections.filter(r => r.type === 'success-pattern').length;
    const failures = reflections.filter(r => r.type === 'failure-analysis').length;

    return {
      total: reflections.length,
      successes,
      failures,
      successRate: successes / reflections.length
    };
  }

  /**
   * 检查使命对齐度
   */
  checkMissionAlignment(reflectionResult) {
    // 检查每个反思是否对齐核心使命
    const aligned = reflectionResult.reflections.filter(r =>
      r.improvement && r.improvement.includes('系统')
    ).length;

    return {
      score: aligned / reflectionResult.reflections.length,
      status: aligned > 0 ? 'pass' : 'review'
    };
  }

  /**
   * 检查上下文清晰度
   */
  checkContextClarity(reflectionResult) {
    // 检查是否有明确的上下文
    const clearContext = reflectionResult.reflections.filter(r =>
      r.skill && r.confidence
    ).length;

    return {
      score: clearContext / reflectionResult.reflections.length,
      status: clearContext === reflectionResult.reflections.length ? 'pass' : 'review'
    };
  }

  /**
   * 检查冗余
   */
  checkRedundancy(reflectionResult) {
    // 检查是否存在重复的反思
    const uniqueSkills = new Set(reflectionResult.reflections.map(r => r.skill));
    const redundancy = 1 - (uniqueSkills.size / reflectionResult.reflections.length);

    return {
      score: 1 - redundancy, // 越低越好，转换为越高越好
      status: redundancy < 0.2 ? 'pass' : 'warning'
    };
  }

  /**
   * 检查可自动化性
   */
  checkAutomatability(reflectionResult) {
    // 检查是否可以自动化执行
    const automatable = reflectionResult.reflections.filter(r =>
      r.type === 'success-pattern'
    ).length;

    return {
      score: automatable / reflectionResult.reflections.length,
      status: automatable > 0 ? 'pass' : 'review'
    };
  }

  /**
   * 计算总体评分
   */
  calculateOverallScore(checks) {
    const avgScore = checks.reduce((sum, check) => sum + check.result.score, 0) / checks.length;
    return Math.round(avgScore * 100);
  }

  /**
   * 生成建议
   */
  generateRecommendations(checks) {
    const recommendations = [];

    for (const check of checks) {
      if (check.result.status !== 'pass') {
        recommendations.push({
          check: check.check,
          issue: check.description,
          action: `需要改进: ${check.check}`
        });
      }
    }

    return recommendations;
  }

  /**
   * 决定进化方向
   */
  determineDirection(auditResult) {
    if (auditResult.overall >= 80) {
      return 'expand-capabilities';
    } else if (auditResult.overall >= 60) {
      return 'optimize-existing';
    } else {
      return 'fix-foundational';
    }
  }

  /**
   * 决定优先级
   */
  determinePriority(auditResult) {
    if (auditResult.overall < 60) {
      return 'critical';
    } else if (auditResult.overall < 80) {
      return 'high';
    } else {
      return 'normal';
    }
  }

  /**
   * 生成下一步行动
   */
  generateNextSteps(auditResult) {
    const steps = [];

    for (const rec of auditResult.recommendations) {
      steps.push({
        action: rec.action,
        priority: auditResult.overall < 60 ? 'critical' : 'high',
        context: rec.issue
      });
    }

    // 如果没有建议，说明系统运行良好
    if (steps.length === 0) {
      steps.push({
        action: '继续监控和优化',
        priority: 'normal',
        context: '系统运行正常'
      });
    }

    return steps;
  }

  /**
   * 计算置信度
   */
  calculateConfidence(auditResult) {
    // 基于审计评分计算置信度
    return auditResult.overall / 100;
  }
}

// ==================== 命令行接口 ====================

if (require.main === module) {
  const coordinator = new MultiAgentCoordinator();

  coordinator.startAutonomousEvolution()
    .then(result => {
      console.log('\n✅ 自主进化循环完成');
      console.log('进化方向:', result.direction);
      console.log('优先级:', result.priority);
      console.log('下一步行动:', result.nextSteps);
      console.log('置信度:', (result.confidence * 100).toFixed(1) + '%');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 自主进化失败:', error.message);
      process.exit(1);
    });
}

module.exports = MultiAgentCoordinator;