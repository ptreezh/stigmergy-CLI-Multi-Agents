/**
 * KnowledgeInheritance - 知识继承
 * 新项目从全局灵魂层继承相关智慧
 */

const path = require('path');
const fs = require('fs').promises;

class KnowledgeInheritance {
  /**
   * 初始化知识继承
   */
  constructor(options = {}) {
    this.globalSoulPath = options.globalSoulPath;
    this.projectSoulPath = options.projectSoulPath;
  }

  /**
   * 执行继承
   * @param {string} projectName - 项目名称
   * @param {string} projectType - 项目类型
   * @returns {Promise<Object>} 继承结果
   */
  async inherit(projectName, projectType = 'general') {
    const GlobalSoulManager = require('./global_soul_manager');
    const globalManager = new GlobalSoulManager({ globalSoulPath: this.globalSoulPath });

    // 1. 加载全局智慧
    const coreWisdom = await globalManager.loadCoreWisdom();
    const globalKb = await globalManager.getKnowledgeBase();

    // 2. 筛选相关智慧
    const relevantPractices = this.filterByRelevance(coreWisdom.bestPractices, projectType);
    const relevantLessons = this.filterByRelevance(coreWisdom.errorLessons, projectType);
    const relevantKnowledge = this.filterByRelevance(globalKb.entries, projectType);

    // 3. 适配到项目上下文
    const adaptedPractices = relevantPractices.map(p => this.adaptToProject(p, projectName, projectType));
    const adaptedLessons = relevantLessons.map(l => this.adaptToProject(l, projectName, projectType));

    // 4. 写入项目.soul/目录
    await this.writeInheritedSoul(projectName, projectType, adaptedPractices, adaptedLessons);

    return {
      inheritedPractices: adaptedPractices,
      inheritedLessons: adaptedLessons,
      inheritedKnowledge: relevantKnowledge,
      totalCount: adaptedPractices.length + adaptedLessons.length + relevantKnowledge.length
    };
  }

  /**
   * 筛选与项目类型相关的智慧
   */
  filterByRelevance(items, projectType) {
    if (!items || items.length === 0) return [];

    return items.filter(item => {
      // 检查所有字符串字段（包括details）
      const allText = Object.values(item)
        .filter(v => typeof v === 'string')
        .join(' ')
        .toLowerCase();

      // 高通用性
      if (allText.includes('high') || allText.includes('高')) return true;
      
      // 专业匹配
      if (allText.includes(projectType.toLowerCase())) return true;

      return false;
    });
  }

  /**
   * 适配教训到项目上下文
   */
  adaptToProject(lesson, projectName, projectType) {
    return {
      ...lesson,
      inheritedFrom: 'global',
      inheritedAt: new Date().toISOString(),
      targetProject: projectName,
      projectType: projectType
    };
  }

  /**
   * 写入继承的Soul文件
   */
  async writeInheritedSoul(projectName, projectType, practices, lessons) {
    const soulMdPath = path.join(this.projectSoulPath, '.soul', 'soul.md');
    const lessonsPath = path.join(this.projectSoulPath, '.soul', 'LESSONS.md');

    // 确保目录存在
    await fs.mkdir(path.dirname(soulMdPath), { recursive: true });

    // 写入soul.md
    let soulMd = `# Soul - ${projectName}

## 身份
- **名称**: ${projectName}
- **角色**: 项目型智能
- **类型**: ${projectType}

## 继承
- **继承自**: 全局灵魂层
- **继承时间**: ${new Date().toISOString()}
- **全局最佳实践**: ${practices.length}条
- **全局错误教训**: ${lessons.length}条

## 全局最佳实践

`;

    for (const p of practices) {
      soulMd += `### ${p.title}\n`;
      if (p.scene) soulMd += `- **场景**: ${p.scene}\n`;
      if (p.practice) soulMd += `- **做法**: ${p.practice}\n`;
      if (p.effect) soulMd += `- **效果**: ${p.effect}\n`;
      soulMd += '\n';
    }

    soulMd += `\n## 全局错误教训\n\n`;
    for (const l of lessons) {
      soulMd += `### ${l.title}\n`;
      if (l.problem) soulMd += `- **问题**: ${l.problem}\n`;
      if (l.rootCause) soulMd += `- **根因**: ${l.rootCause}\n`;
      if (l.avoid) soulMd += `- **避免**: ${l.avoid}\n`;
      soulMd += '\n';
    }

    await fs.writeFile(soulMdPath, soulMd, 'utf-8');

    // 写入LESSONS.md
    let lessonsMd = `# 项目教训 - ${projectName}\n\n`;
    lessonsMd += `> 以下${practices.length}条最佳实践和${lessons.length}条错误教训继承自全局灵魂层\n\n`;

    lessonsMd += '## 继承的最佳实践\n';
    for (const p of practices) {
      lessonsMd += `\n### ${p.title}\n`;
      if (p.scene) lessonsMd += `- **场景**: ${p.scene}\n`;
      if (p.practice) lessonsMd += `- **做法**: ${p.practice}\n`;
      if (p.effect) lessonsMd += `- **效果**: ${p.effect}\n`;
      lessonsMd += `- **来源**: 全局灵魂层\n`;
    }

    lessonsMd += '\n## 继承的错误教训\n';
    for (const l of lessons) {
      lessonsMd += `\n### ${l.title}\n`;
      if (l.problem) lessonsMd += `- **问题**: ${l.problem}\n`;
      if (l.rootCause) lessonsMd += `- **根因**: ${l.rootCause}\n`;
      if (l.avoid) lessonsMd += `- **避免**: ${l.avoid}\n`;
      lessonsMd += `- **来源**: 全局灵魂层\n`;
    }

    await fs.writeFile(lessonsPath, lessonsMd, 'utf-8');
  }
}

module.exports = KnowledgeInheritance;
