/**
 * 技能编排引擎
 * 负责技能编排验证、关系图生成、编排执行
 */

class SkillOrchestrator {
  constructor() {
    this.availableSkills = new Set();  // 可用技能集合
    this.orchestrationHistory = [];    // 编排历史
    this.orchestrationCounter = 0;     // 编排计数器
  }

  /**
   * 创建编排任务
   * @param {string} name - 技能名称
   * @param {string} description - 描述
   * @param {Object} options - 编排选项
   * @returns {Object} 编排任务
   */
  createTask(name, description, options) {
    return {
      name,
      description,
      type: options.orchestrationType || 'teaching',
      baseSkills: options.baseSkills || [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 验证编排逻辑
   * @param {Object} orchestration - 编排数据
   * @returns {Object} 验证结果 { valid, errors }
   */
  validateOrchestration(orchestration) {
    const errors = [];

    // 验证基础技能列表
    if (!orchestration.baseSkills || orchestration.baseSkills.length === 0) {
      errors.push('至少需要一个基础技能');
    } else {
      // 检查每个基础技能是否可用
      orchestration.baseSkills.forEach(skill => {
        if (!this.availableSkills.has(skill)) {
          errors.push(`基础技能 ${skill} 不存在`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 生成编排关系图
   * @param {Object} orchestration - 编排数据
   * @returns {string} JSON格式的关系图
   */
  generateOrchestrationGraph(orchestration) {
    const nodes = [
      { id: orchestration.name, type: 'composite', label: orchestration.name }
    ];

    // 添加基础技能节点
    orchestration.baseSkills.forEach(skill => {
      nodes.push({ id: skill, type: 'base', label: skill });
    });

    // 添加编排关系边
    const edges = orchestration.baseSkills.map(skill => ({
      from: orchestration.name,
      to: skill,
      type: 'orchestrates'
    }));

    const graph = {
      name: orchestration.name,
      nodes,
      edges,
      orchestrationLogic: orchestration.orchestrationLogic || {}
    };

    return JSON.stringify(graph, null, 2);
  }

  /**
   * 执行编排
   * @param {Object} orchestration - 编排数据
   * @returns {Object} 编排结果
   */
  orchestrate(orchestration) {
    // 验证编排
    const validation = this.validateOrchestration(orchestration);
    if (!validation.valid) {
      return {
        success: false,
        error: `编排验证失败: ${validation.errors.join(', ')}`
      };
    }

    // 执行编排
    this.orchestrationCounter++;
    const orchestrationId = `orch-${this.orchestrationCounter}`;

    const result = {
      success: true,
      orchestrationId,
      name: orchestration.name,
      baseSkills: orchestration.baseSkills,
      message: `技能编排 ${orchestration.name} 成功`,
      executedAt: new Date().toISOString()
    };

    // 记录历史
    this.orchestrationHistory.push(result);

    return result;
  }

  /**
   * 获取编排历史
   * @returns {Array} 编排历史记录
   */
  getHistory() {
    return [...this.orchestrationHistory];
  }
}

module.exports = {
  SkillOrchestrator
};
