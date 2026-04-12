/**
 * SkillsManager - 别名文件
 * 重定向到 StigmergySkillManager
 */

const { StigmergySkillManager } = require('./StigmergySkillManager');

// SkillsManager是StigmergySkillManager的别名
class SkillsManager extends StigmergySkillManager {
  constructor(options = {}) {
    super(options);
  }
}

// 同时导出类和默认导出
module.exports = SkillsManager;
module.exports.default = SkillsManager;
module.exports.SkillsManager = SkillsManager;
module.exports.StigmergySkillManager = StigmergySkillManager;
