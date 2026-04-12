/**
 * GlobalLessons - 全局教训管理
 * 管理跨项目共享的最佳实践和错误教训
 */

const path = require('path');
const os = require('os');
const fs = require('fs').promises;

class GlobalLessons {
  /**
   * 初始化全局教训
   */
  constructor(options = {}) {
    const defaultPath = path.join(os.homedir(), '.stigmergy', 'soul-global', 'CORE_WISDOM.md');
    
    if (options.lessonsPath) {
      const stat = require('fs').statSync(options.lessonsPath, { throwIfNoEntry: false });
      if (stat && stat.isDirectory()) {
        this.lessonsPath = path.join(options.lessonsPath, 'CORE_WISDOM.md');
      } else {
        this.lessonsPath = options.lessonsPath;
      }
    } else {
      this.lessonsPath = defaultPath;
    }
  }

  /**
   * 初始化教训文件
   */
  async initialize() {
    const dir = path.dirname(this.lessonsPath);
    await fs.mkdir(dir, { recursive: true });

    const exists = await this._fileExists(this.lessonsPath);
    if (!exists) {
      await fs.writeFile(this.lessonsPath, this._defaultContent(), 'utf-8');
    }
  }

  /**
   * 添加最佳实践
   */
  async addBestPractice(bp) {
    const wisdom = await this._load();
    wisdom.bestPractices.push(bp);
    await this._save(wisdom);
  }

  /**
   * 添加错误教训
   */
  async addLesson(lesson) {
    const wisdom = await this._load();
    wisdom.errorLessons.push(lesson);
    await this._save(wisdom);
  }

  /**
   * 获取所有最佳实践
   */
  async getBestPractices() {
    const wisdom = await this._load();
    return wisdom.bestPractices;
  }

  /**
   * 获取所有错误教训
   */
  async getErrorLessons() {
    const wisdom = await this._load();
    return wisdom.errorLessons;
  }

  /**
   * 按标题查找
   */
  async findByTitle(title) {
    const wisdom = await this._load();
    
    // 搜索最佳实践
    const bp = wisdom.bestPractices.find(item => item.title === title);
    if (bp) return bp;
    
    // 搜索错误教训
    const lesson = wisdom.errorLessons.find(item => item.title === title);
    if (lesson) return lesson;
    
    return null;
  }

  /**
   * 搜索匹配的教训
   */
  async search(query) {
    const wisdom = await this._load();
    const queryLower = query.toLowerCase();
    
    const results = [];
    
    // 搜索最佳实践
    for (const bp of wisdom.bestPractices) {
      if (this._itemMatches(bp, queryLower)) {
        results.push({ ...bp, type: 'bestPractice' });
      }
    }
    
    // 搜索错误教训
    for (const lesson of wisdom.errorLessons) {
      if (this._itemMatches(lesson, queryLower)) {
        results.push({ ...lesson, type: 'errorLesson' });
      }
    }
    
    return results;
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const wisdom = await this._load();
    
    const byUniversality = {};
    
    // 统计最佳实践的通用性
    for (const bp of wisdom.bestPractices) {
      const u = bp.universality || 'unspecified';
      byUniversality[u] = (byUniversality[u] || 0) + 1;
    }
    
    // 统计错误教训的通用性
    for (const lesson of wisdom.errorLessons) {
      const u = lesson.universality || 'unspecified';
      byUniversality[u] = (byUniversality[u] || 0) + 1;
    }
    
    return {
      totalBestPractices: wisdom.bestPractices.length,
      totalErrorLessons: wisdom.errorLessons.length,
      byUniversality
    };
  }

  // 私有方法

  async _load() {
    const exists = await this._fileExists(this.lessonsPath);
    if (!exists) {
      return { bestPractices: [], errorLessons: [] };
    }

    const content = await fs.readFile(this.lessonsPath, 'utf-8');
    return this._parseContent(content);
  }

  async _save(wisdom) {
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

    await fs.writeFile(this.lessonsPath, content, 'utf-8');
  }

  _parseContent(content) {
    const wisdom = { bestPractices: [], errorLessons: [] };
    
    const lines = content.split('\n');
    let currentSection = '';
    let currentItem = null;

    for (const line of lines) {
      if (line.startsWith('## 最佳实践')) {
        if (currentItem && currentSection) {
          wisdom[currentSection].push(currentItem);
          currentItem = null;
        }
        currentSection = 'bestPractices';
      } else if (line.startsWith('## 错误教训')) {
        if (currentItem && currentSection) {
          wisdom[currentSection].push(currentItem);
          currentItem = null;
        }
        currentSection = 'errorLessons';
      } else if (line.startsWith('###') && currentSection) {
        if (currentItem) {
          wisdom[currentSection].push(currentItem);
        }
        currentItem = { title: line.replace('### ', '').trim() };
      } else if (currentItem && line.includes('**')) {
        // 解析键值对
        const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          const key = this._mapKey(match[1]);
          currentItem[key] = match[2].trim();
        }
      }
    }

    if (currentItem && currentSection) {
      wisdom[currentSection].push(currentItem);
    }

    return wisdom;
  }

  _mapKey(mdKey) {
    const keyMap = {
      '场景': 'scene',
      '做法': 'practice',
      '效果': 'effect',
      '通用性': 'universality',
      '问题': 'problem',
      '根因': 'rootCause',
      '避免': 'avoid'
    };
    return keyMap[mdKey] || mdKey.toLowerCase();
  }

  _itemMatches(item, queryLower) {
    const searchable = [
      item.title,
      item.scene,
      item.practice,
      item.effect,
      item.problem,
      item.rootCause,
      item.avoid
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchable.includes(queryLower);
  }

  async _fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  _defaultContent() {
    return `# 核心智慧

## 最佳实践
<!-- 全局通用最佳实践将在此记录 -->

## 错误教训
<!-- 全局通用错误教训将在此记录 -->
`;
  }
}

module.exports = GlobalLessons;
