/**
 * SkillOrchestrator - 技能编排执行引擎
 *
 * 功能：
 * 1. 根据用户意图匹配编排模板
 * 2. 解析技能依赖链
 * 3. 顺序/并行执行技能
 * 4. 聚合执行结果
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class SkillOrchestrator {
  constructor(options = {}) {
    this.skillsPath = options.skillsPath || path.join(
      process.env.USERPROFILE || process.env.HOME,
      ".stigmergy",
      "skills",
    );
    this.ontologyPath = path.join(this.skillsPath, "SKILL-ONTOLOGY.json");
    this.ontology = this._loadOntology();
    this.executionHistory = [];
  }

  _loadOntology() {
    if (fs.existsSync(this.ontologyPath)) {
      return JSON.parse(fs.readFileSync(this.ontologyPath, "utf-8"));
    }
    return null;
  }

  /**
   * 根据用户意图匹配并执行编排
   *
   * @param {string} intent - 用户意图描述
   * @param {object} options - 执行选项
   * @returns {object} 执行结果
   */
  async orchestrate(intent, options = {}) {
    if (!this.ontology) {
      return { error: "Ontology not loaded", success: false };
    }

    const intentLower = intent.toLowerCase();

    // 1. 匹配编排模板
    const matchedTemplate = this._matchTemplate(intentLower);
    if (!matchedTemplate) {
      return {
        success: false,
        message: "No matching orchestration template found",
        suggestion: "Try using skill search to find relevant skills",
      };
    }

    // 2. 解析技能链
    const skillChain = matchedTemplate.chain || [];
    if (skillChain.length === 0) {
      return {
        success: false,
        message: "Template has empty skill chain",
        template: matchedTemplate,
      };
    }

    // 3. 验证技能存在
    const missingSkills = this._validateSkills(skillChain);
    if (missingSkills.length > 0) {
      return {
        success: false,
        message: `Missing skills: ${missingSkills.join(", ")}`,
        template: matchedTemplate,
      };
    }

    // 4. 执行技能链
    console.log(
      `\n🎯 Orchestration: ${matchedTemplate.nameCn || matchedTemplate.name}`,
    );
    console.log(`   Chain: ${skillChain.join(" → ")}\n`);

    const results = [];
    const context = { intent, template: matchedTemplate, previousResults: [] };

    for (const skillName of skillChain) {
      console.log(`   ⚡ Executing: ${skillName}`);
      const skillResult = await this._executeSkill(skillName, context, options);
      results.push({ skill: skillName, ...skillResult });
      context.previousResults.push({ skill: skillName, ...skillResult });
    }

    // 5. 记录历史
    const executionRecord = {
      template: matchedTemplate.id,
      intent,
      timestamp: new Date().toISOString(),
      results,
      success: results.every((r) => r.success !== false),
    };
    this.executionHistory.push(executionRecord);

    // 6. 聚合结果
    return {
      success: executionRecord.success,
      template: matchedTemplate,
      executionChain: skillChain,
      results,
      summary: this._generateSummary(results),
      history: this.executionHistory,
    };
  }

  /**
   * 匹配编排模板
   */
  _matchTemplate(intentLower) {
    const templates = this.ontology.orchestrationTemplates || [];

    for (const template of templates) {
      const triggers = template.trigger || [];
      if (triggers.some((t) => intentLower.includes(t.toLowerCase()))) {
        return template;
      }
    }

    return null;
  }

  /**
   * 验证技能是否存在
   */
  _validateSkills(skillChain) {
    const missing = [];
    for (const skill of skillChain) {
      const skillDir = path.join(this.skillsPath, skill);
      if (!fs.existsSync(skillDir)) {
        missing.push(skill);
      }
    }
    return missing;
  }

  /**
   * 执行单个技能
   */
  async _executeSkill(skillName, context, options) {
    try {
      // 通过 stigmergy CLI 读取技能内容
      const skillContent = execSync(
        `stigmergy skill read ${skillName} 2>&1`,
        {
          encoding: "utf-8",
          timeout: 10000,
        },
      );

      if (skillContent.includes("not found") || skillContent.includes("error")) {
        return {
          success: false,
          error: skillContent.substring(0, 200),
        };
      }

      return {
        success: true,
        contentLength: skillContent.length,
        preview: skillContent.substring(0, 200),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message.substring(0, 200),
      };
    }
  }

  /**
   * 生成执行摘要
   */
  _generateSummary(results) {
    const total = results.length;
    const success = results.filter((r) => r.success).length;
    const failed = total - success;

    return {
      total,
      success,
      failed,
      successRate: `${((success / total) * 100).toFixed(0)}%`,
    };
  }

  /**
   * 获取所有编排模板
   */
  listTemplates() {
    return this.ontology?.orchestrationTemplates || [];
  }

  /**
   * 添加编排模板
   */
  addTemplate(template) {
    if (!this.ontology) return { success: false, error: "Ontology not loaded" };

    if (!this.ontology.orchestrationTemplates) {
      this.ontology.orchestrationTemplates = [];
    }

    template.id =
      template.id || `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    template.createdAt = template.createdAt || new Date().toISOString();

    this.ontology.orchestrationTemplates.push(template);
    this._saveOntology();

    return { success: true, id: template.id };
  }

  /**
   * 删除编排模板
   */
  removeTemplate(templateId) {
    if (!this.ontology) return { success: false, error: "Ontology not loaded" };

    const idx = (this.ontology.orchestrationTemplates || []).findIndex(
      (t) => t.id === templateId,
    );
    if (idx === -1) {
      return { success: false, error: "Template not found" };
    }

    this.ontology.orchestrationTemplates.splice(idx, 1);
    this._saveOntology();

    return { success: true };
  }

  _saveOntology() {
    fs.writeFileSync(
      this.ontologyPath,
      JSON.stringify(this.ontology, null, 2),
      "utf-8",
    );
  }

  /**
   * 获取执行历史
   */
  getHistory(limit = 10) {
    return this.executionHistory.slice(-limit);
  }
}

module.exports = SkillOrchestrator;
