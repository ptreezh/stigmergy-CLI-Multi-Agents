/**
 * SkillOntologySearch - 技能本体论语义搜索
 *
 * 功能：
 * 1. 基于领域/能力分类搜索
 * 2. 关键词语义匹配
 * 3. 编排模板匹配
 * 4. 相似度排序
 */

const fs = require("fs");
const path = require("path");

class SkillOntologySearch {
  constructor(options = {}) {
    this.skillsPath = options.skillsPath || path.join(
      process.env.USERPROFILE || process.env.HOME,
      ".stigmergy",
      "skills",
    );
    this.ontologyPath = path.join(this.skillsPath, "SKILL-ONTOLOGY.json");
    this.ontology = this._loadOntology();
  }

  _loadOntology() {
    if (fs.existsSync(this.ontologyPath)) {
      return JSON.parse(fs.readFileSync(this.ontologyPath, "utf-8"));
    }
    return null;
  }

  /**
   * 语义搜索技能
   *
   * @param {string} query - 搜索查询
   * @param {object} options - 搜索选项
   * @returns {Array} 匹配结果
   */
  search(query, options = {}) {
    if (!this.ontology) {
      return { error: "Ontology not loaded", results: [] };
    }

    const results = {
      query,
      matchedTemplates: [],
      matchedDomains: [],
      matchedCapabilities: [],
      matchedSkills: [],
    };

    const queryLower = query.toLowerCase();

    // 1. 匹配编排模板
    for (const template of this.ontology.orchestrationTemplates || []) {
      const triggerMatch = (template.trigger || []).some(
        (t) => queryLower.includes(t.toLowerCase()),
      );
      if (triggerMatch) {
        results.matchedTemplates.push(template);
      }
    }

    // 2. 匹配领域
    for (const [key, domain] of Object.entries(this.ontology.domains || {})) {
      const domainMatch =
        key.toLowerCase().includes(queryLower) ||
        (domain.name || "").toLowerCase().includes(queryLower) ||
        (domain.nameEn || "").toLowerCase().includes(queryLower) ||
        (domain.description || "").toLowerCase().includes(queryLower);

      if (domainMatch) {
        results.matchedDomains.push({
          key,
          ...domain,
          skillCount: (domain.skills || []).length,
        });
      }
    }

    // 3. 匹配能力
    for (const [key, cap] of Object.entries(this.ontology.capabilities || {})) {
      const capMatch =
        key.toLowerCase().includes(queryLower) ||
        (cap.name || "").toLowerCase().includes(queryLower) ||
        (cap.nameEn || "").toLowerCase().includes(queryLower) ||
        (cap.verbs || []).some((v) => queryLower.includes(v.toLowerCase()));

      if (capMatch) {
        results.matchedCapabilities.push({
          key,
          ...cap,
          skillCount: (cap.skills || []).length,
        });
      }
    }

    // 4. 匹配具体技能
    // 收集所有相关技能
    let relevantSkills = new Set();

    // 如果匹配到领域，添加该领域所有技能
    if (results.matchedDomains.length > 0) {
      for (const domain of results.matchedDomains) {
        const domainData = this.ontology.domains?.[domain.key];
        (domainData?.skills || []).forEach((s) => relevantSkills.add(s));
      }
    }

    // 如果匹配到能力，添加该能力所有技能
    if (results.matchedCapabilities.length > 0) {
      for (const cap of results.matchedCapabilities) {
        const capData = this.ontology.capabilities?.[cap.key];
        (capData?.skills || []).forEach((s) => relevantSkills.add(s));
      }
    }

    // 如果有模板匹配，添加模板链中的技能
    if (results.matchedTemplates.length > 0) {
      for (const template of results.matchedTemplates) {
        (template.chain || []).forEach((s) => relevantSkills.add(s));
      }
    }

    // 如果以上都没有，尝试直接匹配技能名
    if (relevantSkills.size === 0) {
      for (const domain of Object.values(this.ontology.domains || {})) {
        (domain.skills || []).forEach((s) => relevantSkills.add(s));
      }
    }

    // 构建技能信息
    for (const skill of relevantSkills) {
      const domains = [];
      const capabilities = [];

      for (const [key, domain] of Object.entries(this.ontology.domains || {})) {
        if ((domain.skills || []).includes(skill)) {
          domains.push(domain.name);
        }
      }
      for (const [key, cap] of Object.entries(this.ontology.capabilities || {})) {
        if ((cap.skills || []).includes(skill)) {
          capabilities.push(cap.name);
        }
      }

      results.matchedSkills.push({
        name: skill,
        domains,
        capabilities,
      });
    }

    // 5. 按匹配度排序
    results.matchedSkills.sort((a, b) => {
      // 领域匹配优先
      if (a.domains.length !== b.domains.length) {
        return b.domains.length - a.domains.length;
      }
      return b.capabilities.length - a.capabilities.length;
    });

    // 限制返回数量
    const maxResults = options.maxResults || 20;
    results.matchedSkills = results.matchedSkills.slice(0, maxResults);

    return results;
  }

  /**
   * 获取技能的编排建议
   */
  getOrchestrationForSkill(skillName) {
    if (!this.ontology) return null;

    const templates = (this.ontology.orchestration_templates || []).filter(
      (t) => (t.chain || []).includes(skillName),
    );

    return templates;
  }

  /**
   * 获取领域下的所有技能
   */
  getSkillsByDomain(domainKey) {
    if (!this.ontology) return [];
    const domain = this.ontology.domains?.[domainKey];
    return domain?.skills || [];
  }

  /**
   * 获取能力下的所有技能
   */
  getSkillsByCapability(capKey) {
    if (!this.ontology) return [];
    const cap = this.ontology.capabilities?.[capKey];
    return cap?.skills || [];
  }

  /**
   * 获取统计信息
   */
  getStats() {
    if (!this.ontology) return { total: 0 };

    const totalSkills = new Set();
    for (const domain of Object.values(this.ontology.domains || {})) {
      (domain.skills || []).forEach((s) => totalSkills.add(s));
    }

    return {
      totalSkills: totalSkills.size,
      domains: Object.keys(this.ontology.domains || {}).length,
      capabilities: Object.keys(this.ontology.capabilities || {}).length,
      orchestrationTemplates: (this.ontology.orchestration_templates || [])
        .length,
      relations: (this.ontology.relationshipList || []).length,
      version: this.ontology.version,
      lastUpdated: this.ontology.lastUpdated,
    };
  }
}

module.exports = SkillOntologySearch;
