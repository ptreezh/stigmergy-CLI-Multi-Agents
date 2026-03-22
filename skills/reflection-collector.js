#!/usr/bin/env node

/**
 * Reflection Collector - 反思数据收集系统
 *
 * Phase 2 反思集成 - 收集agent真实使用skill后的深度反思
 *
 * 核心功能：
 * - 收集使用前预期
 * - 收集使用后反思
 * - 收集深度反思
 * - 保存反思数据
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

class ReflectionCollector {
  constructor() {
    this.reflectionStore = new Map(); // 反思存储
    this.storagePath = path.join(process.cwd(), '.stigmergy', 'reflections');
    this.ensureStorageDirectory();
  }

  /**
   * 确保存储目录存在
   */
  ensureStorageDirectory() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * 收集完整的反思数据
   */
  async collectReflection(agentId, skillName, usageContext) {
    console.log(`\n🧠 收集反思: ${agentId} 使用 ${skillName}`);

    const reflectionId = uuidv4();
    const timestamp = new Date().toISOString();

    const reflection = {
      reflectionId,
      agentId,
      skillName,
      timestamp,

      // 使用前预期
      beforeUsage: await this.collectBeforeUsage(usageContext),

      // 使用后反思
      afterUsage: await this.collectAfterUsage(skillName, usageContext),

      // 深度反思
      deepReflection: await this.collectDeepReflection(skillName, usageContext)
    };

    // 保存反思
    await this.saveReflection(reflection);

    console.log(`   ✅ 反思收集完成: ${reflectionId}`);

    return reflection;
  }

  /**
   * 收集使用前预期
   */
  async collectBeforeUsage(usageContext) {
    const beforeUsage = {
      expectations: usageContext.expectations || [],
      confidence: usageContext.confidence || 0.5,
      goals: usageContext.goals || [],
      concerns: usageContext.concerns || [],
      context: {
        domain: usageContext.domain || 'general',
        taskType: usageContext.taskType || 'unknown',
        urgency: usageContext.urgency || 'normal',
        complexity: usageContext.complexity || 'medium'
      }
    };

    console.log(`   📊 使用前预期:`);
    console.log(`      - 信心水平: ${beforeUsage.confidence}`);
    console.log(`      - 目标数量: ${beforeUsage.goals.length}`);
    console.log(`      - 领期数量: ${beforeUsage.expectations.length}`);

    return beforeUsage;
  }

  /**
   * 收集使用后反思
   */
  async collectAfterUsage(skillName, usageContext) {
    // 这里应该通过交互式方式收集
    // 现在提供一个框架和模拟数据

    const afterUsage = {
      actualOutcome: await this.captureActualOutcome(skillName, usageContext),
      metExpectations: await this.compareExpectations(skillName, usageContext),
      lessonsLearned: await this.extractLessons(skillName, usageContext),
      wouldUseAgain: await this.askReusability(skillName),
      suggestions: await this.collectSuggestions(skillName),
      performance: {
        effectiveness: await this.rateEffectiveness(skillName),
        efficiency: await this.rateEfficiency(skillName),
        reliability: await this.rateReliability(skillName),
        easeOfUse: await this.rateEaseOfUse(skillName)
      }
    };

    console.log(`   📊 使用后反思:`);
    console.log(`      - 有效性: ${afterUsage.performance.effectiveness}/5`);
    console.log(`      - 效率: ${afterUsage.performance.efficiency}/5`);
    console.log(`      - 可靠性: ${afterUsage.performance.reliability}/5`);
    console.log(`      - 易用性: ${afterUsage.performance.easeOfUse}/5`);

    return afterUsage;
  }

  /**
   * 收集深度反思
   */
  async collectDeepReflection(skillName, usageContext) {
    const deepReflection = {
      whatWentWell: await this.askWhatWentWell(skillName),
      whatCouldImprove: await this.askWhatCouldImprove(skillName),
      whatSurprised: await this.askWhatSurprised(skillName),
      whatLearned: await this.askWhatLearned(skillName),
      wouldRecommend: await this.askWouldRecommend(skillName),
      additionalThoughts: await this.askAdditionalThoughts(skillName)
    };

    console.log(`   📊 深度反思:`);
    console.log(`      - 做得好的: ${deepReflection.whatWentWell.length}条`);
    console.log(`      - 需改进: ${deepReflection.whatCouldImprove.length}条`);
    console.log(`      - 令人惊讶: ${deepReflection.whatSurprised.length}条`);
    console.log(`      - 学到知识: ${deepReflection.whatLearned.length}条`);

    return deepReflection;
  }

  /**
   * 捕获实际结果
   */
  async captureActualOutcome(skillName, usageContext) {
    // 模拟实现
    return {
      success: true,
      completed: true,
      duration: 5000,
      errors: [],
      warnings: [],
      output: '模拟输出'
    };
  }

  /**
   * 比较预期和实际
   */
  async compareExpectations(skillName, usageContext) {
    // 模拟实现
    return {
      metExpectations: true,
      exceededExpectations: false,
      fellShort: false,
      differences: []
    };
  }

  /**
   * 提取经验教训
   */
  async extractLessons(skillName, usageContext) {
    // 模拟实现
    return [
      'skill在简单任务上表现良好',
      '复杂任务需要更多时间',
      '文档需要改进'
    ];
  }

  /**
   * 询问重用意愿
   */
  async askReusability(skillName) {
    // 模拟实现
    return {
      wouldUseAgain: true,
      likelihood: 'high',
      conditions: []
    };
  }

  /**
   * 收集建议
   */
  async collectSuggestions(skillName) {
    // 模拟实现
    return [
      '增加更多示例',
      '改进文档',
      '优化性能'
    ];
  }

  /**
   * 评估有效性
   */
  async rateEffectiveness(skillName) {
    // 模拟实现：返回4/5
    return 4;
  }

  /**
   * 评估效率
   */
  async rateEfficiency(skillName) {
    // 模拟实现：返回3.5/5
    return 3.5;
  }

  /**
   * 评估可靠性
   */
  async rateReliability(skillName) {
    // 模拟实现：返回4/5
    return 4;
  }

  /**
   * 评估易用性
   */
  async rateEaseOfUse(skillName) {
    // 模拟实现：返回3/5
    return 3;
  }

  /**
   * 询问：做得好的地方
   */
  async askWhatWentWell(skillName) {
    // 模拟实现
    return [
      'skill成功完成任务',
      '输出质量好',
      '响应速度快'
    ];
  }

  /**
   * 询问：需要改进的地方
   */
  async askWhatCouldImprove(skillName) {
    // 模拟实现
    return [
      '错误处理可以更好',
      '配置选项不够灵活',
      '学习曲线陡峭'
    ];
  }

  /**
   * 询问：令人惊讶的地方
   */
  async askWhatSurprised(skillName) {
    // 模拟实现
    return [
      '性能比预期好',
      '某些功能很有用',
      '文档比预期详细'
    ];
  }

  /**
   * 询问：学到的知识
   */
  async askWhatLearned(skillName) {
    // 模拟实现
    return [
      '学会了最佳实践',
      '理解了skill的设计理念',
      '掌握了高级用法'
    ];
  }

  /**
   * 询问：是否推荐
   */
  async askWouldRecommend(skillName) {
    // 模拟实现
    return {
      wouldRecommend: true,
      toWhom: ['其他开发者', '相似场景'],
      confidence: 'high'
    };
  }

  /**
   * 询问：其他想法
   */
  async askAdditionalThoughts(skillName) {
    // 模拟实现
    return [
      '整体体验良好',
      '期待未来改进'
    ];
  }

  /**
   * 保存反思到文件
   */
  async saveReflection(reflection) {
    const filename = `${reflection.reflectionId}.json`;
    const filepath = path.join(this.storagePath, filename);

    try {
      fs.writeFileSync(filepath, JSON.stringify(reflection, null, 2));

      // 也保存到内存
      this.reflectionStore.set(reflection.reflectionId, reflection);

      // 更新索引
      await this.updateIndex(reflection);

    } catch (error) {
      console.error(`   ❌ 保存反思失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新反思索引
   */
  async updateIndex(reflection) {
    const indexPath = path.join(this.storagePath, 'index.json');

    let index = [];
    if (fs.existsSync(indexPath)) {
      try {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      } catch (error) {
        console.warn(`   ⚠️  索引文件损坏，创建新索引`);
      }
    }

    index.push({
      reflectionId: reflection.reflectionId,
      agentId: reflection.agentId,
      skillName: reflection.skillName,
      timestamp: reflection.timestamp
    });

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * 加载反思
   */
  async loadReflection(reflectionId) {
    // 先检查内存
    if (this.reflectionStore.has(reflectionId)) {
      return this.reflectionStore.get(reflectionId);
    }

    // 从文件加载
    const filepath = path.join(this.storagePath, `${reflectionId}.json`);
    if (fs.existsSync(filepath)) {
      try {
        const reflection = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        this.reflectionStore.set(reflectionId, reflection);
        return reflection;
      } catch (error) {
        console.error(`   ❌ 加载反思失败: ${error.message}`);
        return null;
      }
    }

    return null;
  }

  /**
   * 获取skill的所有反思
   */
  async getReflectionsBySkill(skillName) {
    const indexPath = path.join(this.storagePath, 'index.json');

    if (!fs.existsSync(indexPath)) {
      return [];
    }

    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const skillReflectionIds = index
        .filter(item => item.skillName === skillName)
        .map(item => item.reflectionId);

      const reflections = [];
      for (const reflectionId of skillReflectionIds) {
        const reflection = await this.loadReflection(reflectionId);
        if (reflection) {
          reflections.push(reflection);
        }
      }

      return reflections;

    } catch (error) {
      console.error(`   ❌ 加载反思列表失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取agent的所有反思
   */
  async getReflectionsByAgent(agentId) {
    const indexPath = path.join(this.storagePath, 'index.json');

    if (!fs.existsSync(indexPath)) {
      return [];
    }

    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const agentReflectionIds = index
        .filter(item => item.agentId === agentId)
        .map(item => item.reflectionId);

      const reflections = [];
      for (const reflectionId of agentReflectionIds) {
        const reflection = await this.loadReflection(reflectionId);
        if (reflection) {
          reflections.push(reflection);
        }
      }

      return reflections;

    } catch (error) {
      console.error(`   ❌ 加载反思列表失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 生成反思统计
   */
  getReflectionStatistics() {
    const stats = {
      totalReflections: this.reflectionStore.size,
      storagePath: this.storagePath,
      agents: new Set(),
      skills: new Set()
    };

    this.reflectionStore.forEach(reflection => {
      stats.agents.add(reflection.agentId);
      stats.skills.add(reflection.skillName);
    });

    return {
      totalReflections: stats.totalReflections,
      uniqueAgents: stats.agents.size,
      uniqueSkills: stats.skills.size,
      storagePath: stats.storagePath
    };
  }

  /**
   * 导出反思数据
   */
  async exportReflections(outputPath) {
    const reflections = Array.from(this.reflectionStore.values());

    const exportData = {
      exportDate: new Date().toISOString(),
      totalReflections: reflections.length,
      reflections: reflections
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`   ✅ 已导出 ${reflections.length} 条反思到 ${outputPath}`);
  }

  /**
   * 批量导入反思数据
   */
  async importReflections(inputPath) {
    try {
      const importData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

      let importCount = 0;
      for (const reflection of importData.reflections) {
        await this.saveReflection(reflection);
        importCount++;
      }

      console.log(`   ✅ 已导入 ${importCount} 条反思`);

      return importCount;

    } catch (error) {
      console.error(`   ❌ 导入失败: ${error.message}`);
      return 0;
    }
  }
}

module.exports = ReflectionCollector;
