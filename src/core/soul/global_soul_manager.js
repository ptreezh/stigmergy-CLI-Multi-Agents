/**
 * GlobalSoulManager - 全局灵魂管理器
 * 管理跨项目共享的核心智慧、知识库和教训
 */

const path = require('path');
const os = require('os');
const fs = require('fs').promises;

class GlobalSoulManager {
  /**
   * 初始化全局灵魂管理器
   */
  constructor(options = {}) {
    this.globalSoulPath = options.globalSoulPath || 
      path.join(os.homedir(), '.stigmergy', 'soul-global');
  }

  /**
   * 初始化全局灵魂目录结构
   */
  async initialize() {
    // 创建目录
    await fs.mkdir(this.globalSoulPath, { recursive: true });

    // 创建CORE_WISDOM.md（如果不存在）
    const wisdomPath = path.join(this.globalSoulPath, 'CORE_WISDOM.md');
    const wisdomExists = await this._fileExists(wisdomPath);
    if (!wisdomExists) {
      await fs.writeFile(wisdomPath, this._defaultCoreWisdom(), 'utf-8');
    }

    // 创建global_kb.json（如果不存在）
    const kbPath = path.join(this.globalSoulPath, 'global_kb.json');
    const kbExists = await this._fileExists(kbPath);
    if (!kbExists) {
      await fs.writeFile(kbPath, JSON.stringify(this._emptyKnowledgeBase(), null, 2), 'utf-8');
    }
  }

  /**
   * 加载核心智慧
   */
  async loadCoreWisdom() {
    const wisdomPath = path.join(this.globalSoulPath, 'CORE_WISDOM.md');
    const exists = await this._fileExists(wisdomPath);
    if (!exists) {
      return { bestPractices: [], errorLessons: [] };
    }

    const content = await fs.readFile(wisdomPath, 'utf-8');
    return this._parseCoreWisdom(content);
  }

  /**
   * 保存最佳实践
   */
  async saveBestPractice(lesson) {
    const wisdom = await this.loadCoreWisdom();
    wisdom.bestPractices.push(lesson);
    await this._writeCoreWisdom(wisdom);
  }

  /**
   * 保存错误教训
   */
  async saveLesson(lesson) {
    const wisdom = await this.loadCoreWisdom();
    wisdom.errorLessons.push(lesson);
    await this._writeCoreWisdom(wisdom);
  }

  /**
   * 获取全局知识库
   */
  async getKnowledgeBase() {
    const kbPath = path.join(this.globalSoulPath, 'global_kb.json');
    const exists = await this._fileExists(kbPath);
    if (!exists) {
      return this._emptyKnowledgeBase();
    }

    const content = await fs.readFile(kbPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 添加知识到全局知识库
   */
  async addKnowledge(entry, sourceProject) {
    const kb = await this.getKnowledgeBase();
    
    const newEntry = {
      ...entry,
      id: `gkb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      promotedFrom: [sourceProject],
      promotionDate: new Date().toISOString(),
      scope: 'global'
    };

    kb.entries.push(newEntry);
    kb.lastUpdate = new Date().toISOString();

    const kbPath = path.join(this.globalSoulPath, 'global_kb.json');
    await fs.writeFile(kbPath, JSON.stringify(kb, null, 2), 'utf-8');
  }

  /**
   * 查询全局知识库
   */
  async queryKnowledge(query, maxResults = 10) {
    const kb = await this.getKnowledgeBase();
    const queryLower = query.toLowerCase();

    // 简单文本匹配
    const results = kb.entries.filter(entry => {
      return (
        entry.title.toLowerCase().includes(queryLower) ||
        entry.content.toLowerCase().includes(queryLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        entry.keywords.some(kw => kw.toLowerCase().includes(queryLower))
      );
    });

    return results.slice(0, maxResults);
  }

  // 私有辅助方法

  async _fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  _defaultCoreWisdom() {
    return `# 核心智慧

## 最佳实践
<!-- 全局通用最佳实践将在此记录 -->

## 错误教训
<!-- 全局通用错误教训将在此记录 -->
`;
  }

  _emptyKnowledgeBase() {
    return {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      entries: []
    };
  }

  _parseCoreWisdom(content) {
    const wisdom = { bestPractices: [], errorLessons: [] };
    
    const lines = content.split('\n');
    let currentSection = '';
    let currentItem = null;

    for (const line of lines) {
      if (line.startsWith('## 最佳实践')) {
        // 切换section前保存当前项
        if (currentItem && currentSection) {
          wisdom[currentSection].push(currentItem);
          currentItem = null;
        }
        currentSection = 'bestPractices';
      } else if (line.startsWith('## 错误教训')) {
        // 切换section前保存当前项
        if (currentItem && currentSection) {
          wisdom[currentSection].push(currentItem);
          currentItem = null;
        }
        currentSection = 'errorLessons';
      } else if (line.startsWith('###') && currentSection) {
        if (currentItem) {
          wisdom[currentSection].push(currentItem);
        }
        currentItem = { title: line.replace('### ', '').trim(), details: '' };
      } else if (currentItem && line.trim()) {
        currentItem.details += line + '\n';
      }
    }

    // 推送最后一个条目
    if (currentItem && currentSection) {
      wisdom[currentSection].push(currentItem);
    }

    return wisdom;
  }

  async _writeCoreWisdom(wisdom) {
    const wisdomPath = path.join(this.globalSoulPath, 'CORE_WISDOM.md');
    let content = '# 核心智慧\n\n';
    
    content += '## 最佳实践\n';
    for (const bp of wisdom.bestPractices) {
      content += `\n### ${bp.title}\n`;
      if (bp.scene) content += `- **场景**: ${bp.scene}\n`;
      if (bp.practice) content += `- **做法**: ${bp.practice}\n`;
      if (bp.effect) content += `- **效果**: ${bp.effect}\n`;
      if (bp.universality) content += `- **通用性**: ${bp.universality}\n`;
    }

    content += '\n## 错误教训\n';
    for (const el of wisdom.errorLessons) {
      content += `\n### ${el.title}\n`;
      if (el.problem) content += `- **问题**: ${el.problem}\n`;
      if (el.rootCause) content += `- **根因**: ${el.rootCause}\n`;
      if (el.avoid) content += `- **避免**: ${el.avoid}\n`;
      if (el.universality) content += `- **通用性**: ${el.universality}\n`;
    }

    await fs.writeFile(wisdomPath, content, 'utf-8');
  }
}

module.exports = GlobalSoulManager;
