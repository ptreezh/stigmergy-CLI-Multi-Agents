/**
 * 技能注册中心
 * 负责技能的注册、查询、验证依赖、删除
 */

class SkillRegistry {
  constructor() {
    this.skills = new Map();  // name -> skill data
  }

  /**
   * 注册技能
   * @param {Object} skillData - 技能数据
   * @returns {Object} 注册结果 { success, skillId?, message?, error? }
   */
  register(skillData) {
    // 验证必需字段
    const validation = this._validateSkill(skillData);
    if (!validation.valid) {
      return {
        success: false,
        error: `缺少必需字段: ${validation.missing.join(', ')}`
      };
    }

    // 检查是否已存在
    if (this.skills.has(skillData.name)) {
      return {
        success: false,
        error: `技能 ${skillData.name} 已存在`
      };
    }

    // 验证依赖
    if (skillData.dependencies && skillData.dependencies.baseSkills) {
      const missingDeps = skillData.dependencies.baseSkills.filter(
        dep => !this.skills.has(dep)
      );
      if (missingDeps.length > 0) {
        return {
          success: false,
          error: `依赖技能不存在: ${missingDeps.join(', ')}`
        };
      }
    }

    // 注册技能
    const skillId = `${skillData.name}@${skillData.version}`;
    this.skills.set(skillData.name, {
      ...skillData,
      registeredAt: new Date().toISOString(),
      skillId
    });

    return {
      success: true,
      skillId,
      message: `技能 ${skillData.name} 注册成功`
    };
  }

  /**
   * 按名称查询技能
   * @param {string} name - 技能名称
   * @returns {Object|null} 技能数据或null
   */
  getByName(name) {
    return this.skills.get(name) || null;
  }

  /**
   * 列出所有技能
   * @returns {Array} 技能列表
   */
  list() {
    return Array.from(this.skills.values());
  }

  /**
   * 按触发词匹配技能
   * @param {string} trigger - 触发词
   * @returns {Array} 匹配的技能列表
   */
  matchByTrigger(trigger) {
    const normalized = trigger.toLowerCase();
    return this.list().filter(skill =>
      skill.triggers && skill.triggers.some(t =>
        t.toLowerCase().includes(normalized)
      )
    );
  }

  /**
   * 按行业筛选技能
   * @param {string} industry - 行业
   * @returns {Array} 匹配的技能列表
   */
  filterByIndustry(industry) {
    return this.list().filter(skill =>
      skill.industry && skill.industry.includes(industry)
    );
  }

  /**
   * 删除技能
   * @param {string} name - 技能名称
   * @returns {Object} 删除结果
   */
  delete(name) {
    if (!this.skills.has(name)) {
      return {
        success: false,
        error: `技能 ${name} 不存在`
      };
    }

    this.skills.delete(name);

    return {
      success: true,
      message: `技能 ${name} 已删除`
    };
  }

  /**
   * 验证技能数据
   * @private
   */
  _validateSkill(skillData) {
    const requiredFields = [
      'name',
      'version',
      'type',
      'industry',
      'description',
      'incubatedBy',
      'incubationDate',
      'triggers',
      'operations'
    ];

    const missing = requiredFields.filter(field => !skillData[field]);

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

module.exports = {
  SkillRegistry
};
