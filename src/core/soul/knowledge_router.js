/**
 * KnowledgeRouter - 知识路由器
 * 自动路由知识到正确的存储位置（全局或项目）
 */

class KnowledgeRouter {
  /**
   * 初始化知识路由器
   */
  constructor(globalManager, projectManager) {
    this.globalManager = globalManager;
    this.projectManager = projectManager;
  }

  /**
   * 添加知识（自动路由）
   */
  async addKnowledge(entry, currentProject) {
    if (entry.scope === 'global' || entry.universality === 'high') {
      await this.globalManager.addEntry(entry, currentProject);
      return 'global';
    } else {
      // 项目知识存储在教训中
      await this.projectManager.saveLesson({
        ...entry,
        type: entry.problem ? 'errorLesson' : 'bestPractice'
      }, entry.universality === 'high');
      return 'project';
    }
  }

  /**
   * 查询知识（自动合并）
   */
  async queryKnowledge(query, maxResults = 10) {
    const results = [];

    // 查询全局知识
    if (this.globalManager && this.globalManager.queryEntries) {
      const globalResults = await this.globalManager.queryEntries(query, maxResults);
      results.push(...globalResults.map(r => ({ ...r, scope: 'global' })));
    }

    // 查询项目教训
    if (this.projectManager && this.projectManager.getLessons) {
      const projectLessons = await this.projectManager.getLessons();
      const queryLower = query.toLowerCase();
      
      for (const lesson of projectLessons) {
        if (this._lessonMatches(lesson, queryLower)) {
          results.push({ ...lesson, scope: 'project' });
        }
      }
    }

    // 去重并限制数量
    const unique = this._deduplicate(results);
    return unique.slice(0, maxResults);
  }

  // 私有方法

  _lessonMatches(lesson, queryLower) {
    const searchable = [
      lesson.title,
      lesson.scene,
      lesson.practice,
      lesson.effect,
      lesson.problem,
      lesson.rootCause,
      lesson.avoid
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchable.includes(queryLower);
  }

  _deduplicate(results) {
    const seen = new Set();
    return results.filter(r => {
      const key = r.title + r.scope;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = KnowledgeRouter;
