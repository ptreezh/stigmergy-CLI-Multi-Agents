/**
 * ProjectSoulManager - 项目灵魂管理器
 * 管理项目特定的Soul状态、教训和知识
 */

const path = require('path');
const os = require('os');
const fs = require('fs').promises;

class ProjectSoulManager {
  /**
   * 初始化项目灵魂管理器
   */
  constructor(options) {
    this.projectPath = options.projectPath;
    this.projectName = options.projectName;
    this.projectType = options.projectType || 'general';
    this.cliName = options.cliName;
    this.soulPath = path.join(this.projectPath, '.soul');
  }

  /**
   * 初始化项目Soul
   */
  async initialize() {
    // 创建.soul/目录
    await fs.mkdir(this.soulPath, { recursive: true });

    // 创建soul.md
    const soulMdPath = path.join(this.soulPath, 'soul.md');
    const soulMdExists = await this._fileExists(soulMdPath);
    if (!soulMdExists) {
      await fs.writeFile(soulMdPath, this._defaultSoulMd(), 'utf-8');
    }

    // 创建LESSONS.md
    const lessonsPath = path.join(this.soulPath, 'LESSONS.md');
    const lessonsExists = await this._fileExists(lessonsPath);
    if (!lessonsExists) {
      await fs.writeFile(lessonsPath, this._defaultLessonsMd(), 'utf-8');
    }

    // 创建memory/目录
    await fs.mkdir(path.join(this.soulPath, 'memory'), { recursive: true });

    // 创建.soul_kb/目录
    await fs.mkdir(path.join(this.soulPath, '.soul_kb'), { recursive: true });
  }

  /**
   * 保存项目教训
   */
  async saveLesson(lesson, markUniversal = false) {
    const lessons = await this._loadLessons();
    
    if (markUniversal) {
      lesson.universality = 'high';
    }
    
    lessons.push(lesson);
    await this._saveLessons(lessons);
  }

  /**
   * 获取项目教训
   */
  async getLessons() {
    return await this._loadLessons();
  }

  /**
   * 检查是否应该提升到全局
   */
  async shouldPromoteToGlobal(lesson) {
    return lesson.universality === 'high';
  }

  // 私有方法

  async _loadLessons() {
    const lessonsPath = path.join(this.soulPath, 'LESSONS.md');
    const exists = await this._fileExists(lessonsPath);
    if (!exists) return [];

    const content = await fs.readFile(lessonsPath, 'utf-8');
    return this._parseLessonsMd(content);
  }

  async _saveLessons(lessons) {
    const lessonsPath = path.join(this.soulPath, 'LESSONS.md');
    let content = `# 项目教训 - ${this.projectName}\n\n`;
    
    content += '## 最佳实践\n';
    const bps = lessons.filter(l => l.type === 'bestPractice' || (!l.problem));
    for (const bp of bps) {
      content += `\n### ${bp.title}\n`;
      if (bp.scene) content += `- **场景**: ${bp.scene}\n`;
      if (bp.practice) content += `- **做法**: ${bp.practice}\n`;
      if (bp.effect) content += `- **效果**: ${bp.effect}\n`;
      if (bp.universality) content += `- **通用性**: ${bp.universality}\n`;
    }

    content += '\n## 错误教训\n';
    const els = lessons.filter(l => l.type === 'errorLesson' || l.problem);
    for (const el of els) {
      content += `\n### ${el.title}\n`;
      if (el.problem) content += `- **问题**: ${el.problem}\n`;
      if (el.rootCause) content += `- **根因**: ${el.rootCause}\n`;
      if (el.avoid) content += `- **避免**: ${el.avoid}\n`;
      if (el.universality) content += `- **通用性**: ${el.universality}\n`;
    }

    await fs.writeFile(lessonsPath, content, 'utf-8');
  }

  _parseLessonsMd(content) {
    const lessons = [];
    const lines = content.split('\n');
    let currentItem = null;

    for (const line of lines) {
      if (line.startsWith('###')) {
        if (currentItem) lessons.push(currentItem);
        currentItem = { title: line.replace('### ', '').trim() };
      } else if (currentItem && line.includes('**')) {
        const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          const key = match[1].toLowerCase();
          const value = match[2].trim();
          if (key === '场景') currentItem.scene = value;
          else if (key === '做法') currentItem.practice = value;
          else if (key === '效果') currentItem.effect = value;
          else if (key === '问题') currentItem.problem = value;
          else if (key === '根因') currentItem.rootCause = value;
          else if (key === '避免') currentItem.avoid = value;
          else if (key === '通用性') currentItem.universality = value;
        }
      }
    }

    if (currentItem) lessons.push(currentItem);
    return lessons;
  }

  _defaultSoulMd() {
    return `# Soul - ${this.projectName}

## 身份
- **名称**: ${this.projectName}
- **角色**: 项目型智能
- **类型**: 项目专属

## 人格
- **核心特质**: [待定义]
- **沟通风格**: 专业、简洁
- **价值观**: 事实优先

## 使命
- **项目目标**: [待定义]
- **核心职责**: [待定义]

## 继承
- **全局智慧**: 待同步
- **项目特质**: [待定义]
`;
  }

  _defaultLessonsMd() {
    return `# 项目教训 - ${this.projectName}

## 最佳实践
<!-- 项目特定最佳实践 -->

## 错误教训
<!-- 项目特定错误教训 -->
`;
  }

  async _fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = ProjectSoulManager;
