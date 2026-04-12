/**
 * GlobalKnowledgeBase - 全局知识库管理
 * 管理跨项目共享的知识条目
 */

const path = require('path');
const os = require('os');
const fs = require('fs').promises;

class GlobalKnowledgeBase {
  /**
   * 初始化全局知识库
   */
  constructor(options = {}) {
    const defaultPath = path.join(os.homedir(), '.stigmergy', 'soul-global', 'global_kb.json');
    
    // 如果传入的是目录，追加文件名
    if (options.kbPath) {
      const stat = require('fs').statSync(options.kbPath, { throwIfNoEntry: false });
      if (stat && stat.isDirectory()) {
        this.kbPath = path.join(options.kbPath, 'global_kb.json');
      } else {
        this.kbPath = options.kbPath;
      }
    } else {
      this.kbPath = defaultPath;
    }
  }

  /**
   * 初始化空知识库
   */
  async initialize() {
    const dir = path.dirname(this.kbPath);
    await fs.mkdir(dir, { recursive: true });

    const kb = this._emptyKnowledgeBase();
    await fs.writeFile(this.kbPath, JSON.stringify(kb, null, 2), 'utf-8');
  }

  /**
   * 添加知识条目
   */
  async addEntry(entry, sourceProject) {
    const kb = await this._load();
    
    const newEntry = {
      ...entry,
      id: `gkb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      promotedFrom: [sourceProject],
      promotionDate: new Date().toISOString(),
      scope: 'global',
      createdAt: new Date().toISOString()
    };

    kb.entries.push(newEntry);
    kb.lastUpdate = new Date().toISOString();

    await this._save(kb);
  }

  /**
   * 获取所有条目
   */
  async getEntries() {
    const kb = await this._load();
    return kb.entries;
  }

  /**
   * 查询知识条目
   */
  async queryEntries(query, maxResults = 10) {
    const kb = await this._load();
    const queryLower = query.toLowerCase();

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

  /**
   * 更新条目
   */
  async updateEntry(id, updates) {
    const kb = await this._load();
    
    const index = kb.entries.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Entry not found: ${id}`);
    }

    kb.entries[index] = { ...kb.entries[index], ...updates };
    kb.lastUpdate = new Date().toISOString();

    await this._save(kb);
  }

  /**
   * 删除条目
   */
  async deleteEntry(id) {
    const kb = await this._load();
    
    const initialLength = kb.entries.length;
    kb.entries = kb.entries.filter(e => e.id !== id);

    if (kb.entries.length === initialLength) {
      throw new Error(`Entry not found: ${id}`);
    }

    kb.lastUpdate = new Date().toISOString();
    await this._save(kb);
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const kb = await this._load();
    const entries = kb.entries;

    const byExpertise = {};
    for (const entry of entries) {
      const exp = entry.expertise || 'general';
      byExpertise[exp] = (byExpertise[exp] || 0) + 1;
    }

    return {
      totalEntries: entries.length,
      byExpertise,
      lastUpdate: kb.lastUpdate
    };
  }

  // 私有方法

  async _load() {
    const exists = await this._fileExists(this.kbPath);
    if (!exists) {
      return this._emptyKnowledgeBase();
    }

    const content = await fs.readFile(this.kbPath, 'utf-8');
    return JSON.parse(content);
  }

  async _save(kb) {
    await fs.writeFile(this.kbPath, JSON.stringify(kb, null, 2), 'utf-8');
  }

  async _fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  _emptyKnowledgeBase() {
    return {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      entries: []
    };
  }
}

module.exports = GlobalKnowledgeBase;
