const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const WikiPathResolver = require('../utils/WikiPathResolver');

/**
 * 多主题Wiki管理器
 */
class MultiTopicWikiManager {
  constructor(cliContext) {
    this.cliContext = cliContext;
  }

  /**
   * 获取所有主题列表
   */
  async listTopics() {
    const wikiPath = await WikiPathResolver.findWikiPath();
    
    if (!wikiPath) {
      throw new Error('Wiki未初始化');
    }

    const topicsPath = path.join(wikiPath, 'topics');
    const files = await fs.readdir(topicsPath);
    
    const topics = [];
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(topicsPath, file);
        const stats = await fs.stat(filePath);
        
        topics.push({
          name: file.replace('.html', ''),
          path: filePath,
          lastModified: stats.mtime,
          size: stats.size
        });
      }
    }

    return topics.sort((a, b) => b.lastModified - a.lastModified);
  }

  /**
   * 创建新主题
   */
  async createTopic(topicName, options = {}) {
    const wikiPath = await WikiPathResolver.findWikiPath();
    
    if (!wikiPath) {
      throw new Error('Wiki未初始化');
    }

    const topicPath = path.join(wikiPath, 'topics', `${topicName}.html`);
    
    // 检查主题是否已存在
    if (await fs.pathExists(topicPath)) {
      throw new Error(`主题 ${topicName} 已存在`);
    }

    try {
      // 生成主题内容
      const topicContent = await this.generateTopicContent(topicName, options);
      
      // 保存主题文件
      await fs.writeFile(topicPath, topicContent);
      
      // 更新配置
      await this.updateTopicConfig(topicName, 'created');
      
      this.cliContext.logger.success(`主题 ${topicName} 创建成功`);
      
      return {
        topicName,
        path: topicPath,
        created: true,
        content: topicContent
      };
      
    } catch (error) {
      this.cliContext.logger.error(`创建主题失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取主题信息
   */
  async getTopicInfo(topicName) {
    const topicPath = await WikiPathResolver.getTopicPath(topicName);
    
    if (!await fs.pathExists(topicPath)) {
      throw new Error(`主题 ${topicName} 不存在`);
    }

    const content = await fs.readFile(topicPath, 'utf8');
    const stats = await fs.stat(topicPath);
    
    // 解析TiddlyWiki内容
    const tiddlers = this.parseTiddlyWikiContent(content);
    
    return {
      name: topicName,
      path: topicPath,
      content,
      tiddlers,
      lastModified: stats.mtime,
      size: stats.size,
      tiddlerCount: tiddlers.length
    };
  }

  /**
   * 编辑主题
   */
  async editTopic(topicName, editProposal) {
    const topicInfo = await this.getTopicInfo(topicName);
    
    try {
      // 应用编辑提案
      const updatedContent = await this.applyEditProposal(
        topicInfo.content,
        editProposal
      );
      
      // 保存更新后的内容
      await fs.writeFile(topicInfo.path, updatedContent);
      
      // 更新配置
      await this.updateTopicConfig(topicName, 'edited');
      
      this.cliContext.logger.success(`主题 ${topicName} 编辑成功`);
      
      return {
        topicName,
        path: topicInfo.path,
        editProposal,
        updated: true,
        previousContent: topicInfo.content
      };
      
    } catch (error) {
      this.cliContext.logger.error(`编辑主题失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 搜索主题内容
   */
  async searchInTopic(topicPath, keyword) {
    const content = await fs.readFile(topicPath, 'utf8');
    const tiddlers = this.parseTiddlyWikiContent(content);
    
    const results = [];
    const keywordLower = keyword.toLowerCase();
    
    tiddlers.forEach(tiddler => {
      const titleMatch = tiddler.title.toLowerCase().includes(keywordLower);
      const contentMatch = tiddler.text.toLowerCase().includes(keywordLower);
      const tagMatch = tiddler.tags.some(tag => 
        tag.toLowerCase().includes(keywordLower)
      );
      
      if (titleMatch || contentMatch || tagMatch) {
        results.push({
          tiddler,
          matchType: {
            title: titleMatch,
            content: contentMatch,
            tags: tagMatch
          }
        });
      }
    });
    
    return results;
  }

  /**
   * 删除主题
   */
  async deleteTopic(topicName) {
    const topicPath = await WikiPathResolver.getTopicPath(topicName);
    
    if (!await fs.pathExists(topicPath)) {
      throw new Error(`主题 ${topicName} 不存在`);
    }

    try {
      // 创建备份
      await this.createBackup(topicName);
      
      // 删除主题文件
      await fs.remove(topicPath);
      
      // 更新配置
      await this.updateTopicConfig(topicName, 'deleted');
      
      this.cliContext.logger.success(`主题 ${topicName} 删除成功`);
      
      return {
        topicName,
        deleted: true
      };
      
    } catch (error) {
      this.cliContext.logger.error(`删除主题失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建主题备份
   */
  async createBackup(topicName) {
    const wikiPath = await WikiPathResolver.findWikiPath();
    const topicPath = path.join(wikiPath, 'topics', `${topicName}.html`);
    const backupPath = path.join(wikiPath, 'backups', `${topicName}-${Date.now()}.html`);
    
    await fs.copy(topicPath, backupPath);
    return backupPath;
  }

  /**
   * 生成主题内容
   */
  async generateTopicContent(topicName, options = {}) {
    const templatePath = path.join(__dirname, '../../templates/topic-template.html');
    
    let template;
    if (await fs.pathExists(templatePath)) {
      template = await fs.readFile(templatePath, 'utf8');
    } else {
      template = this.getDefaultTemplate();
    }

    // 替换模板变量
    const content = template
      .replace(/\{\{TOPIC_NAME\}\}/g, topicName)
      .replace(/\{\{CREATED_AT\}\}/g, new Date().toISOString())
      .replace(/\{\{AUTHOR\}\}/g, options.role?.persona?.name || 'WikiSkill');

    // 添加初始Tiddler
    const initialTiddlers = this.generateInitialTiddlers(topicName, options);
    const tiddlersScript = this.generateTiddlersScript(initialTiddlers);
    
    return content.replace('// TODO: 实现数据加载逻辑', tiddlersScript);
  }

  /**
   * 获取默认模板
   */
  getDefaultTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{TOPIC_NAME}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .tiddler { border: 1px solid #ccc; margin: 10px 0; padding: 15px; }
    .title { font-size: 1.5em; font-weight: bold; margin-bottom: 10px; }
    .tags { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>{{TOPIC_NAME}}</h1>
  <div id="tiddlers-container">
    <!-- Tiddlers will be rendered here -->
  </div>
  
  <script>
    // TODO: 实现数据加载逻辑
  </script>
</body>
</html>`;
  }

  /**
   * 生成初始Tiddlers
   */
  generateInitialTiddlers(topicName, options) {
    const tiddlers = [
      {
        title: topicName,
        text: options.initialContent || `# ${topicName}\n\n这是一个新创建的Wiki主题。`,
        tags: ['main'],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    ];

    if (options.role) {
      tiddlers.push({
        title: '编辑角色',
        text: `**角色名称**: ${options.role.persona.name}\n**专业领域**: ${options.role.expertise.join(', ')}\n**分析视角**: ${options.role.perspective}`,
        tags: ['meta', 'role'],
        created: new Date().toISOString()
      });
    }

    if (options.knowledge) {
      tiddlers.push({
        title: '知识来源',
        text: options.knowledge.items.map(item => 
          `## ${item.query}\n${item.integratedKnowledge}`
        ).join('\n\n'),
        tags: ['meta', 'knowledge'],
        created: new Date().toISOString()
      });
    }

    return tiddlers;
  }

  /**
   * 生成Tiddlers脚本
   */
  generateTiddlersScript(tiddlers) {
    return `
    // 初始化Tiddlers数据
    const initialTiddlers = ${JSON.stringify(tiddlers, null, 2)};
    
    // 渲染Tiddlers
    function renderTiddlers() {
      const container = document.getElementById('tiddlers-container');
      container.innerHTML = '';
      
      initialTiddlers.forEach(tiddler => {
        const tiddlerEl = document.createElement('div');
        tiddlerEl.className = 'tiddler';
        tiddlerEl.innerHTML = \`
          <div class="title">\${tiddler.title}</div>
          <div class="content">\${tiddler.text}</div>
          <div class="tags">标签: \${tiddler.tags.join(', ')}</div>
        \`;
        container.appendChild(tiddlerEl);
      });
    }
    
    // 页面加载时渲染
    document.addEventListener('DOMContentLoaded', renderTiddlers);
    `;
  }

  /**
   * 解析TiddlyWiki内容
   */
  parseTiddlyWikiContent(content) {
    // 简化的TiddlyWiki解析逻辑
    const tiddlers = [];
    
    // 尝试解析JSON格式的Tiddlers
    try {
      const jsonMatch = content.match(/var tiddlers = (\[[\s\S]*?\]);/);
      if (jsonMatch) {
        const parsedTiddlers = JSON.parse(jsonMatch[1]);
        tiddlers.push(...parsedTiddlers);
      }
    } catch (error) {
      this.cliContext.logger.warn('解析Tiddlers失败，使用默认解析');
    }

    // 如果没有找到Tiddlers，创建默认Tiddler
    if (tiddlers.length === 0) {
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'Unknown';
      
      tiddlers.push({
        title,
        text: content.replace(/<[^>]*>/g, '').trim(),
        tags: ['main'],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      });
    }

    return tiddlers;
  }

  /**
   * 应用编辑提案
   */
  async applyEditProposal(originalContent, editProposal) {
    const tiddlers = this.parseTiddlyWikiContent(originalContent);
    
    // 根据编辑提案更新Tiddlers
    if (editProposal.actions && editProposal.actions.length > 0) {
      editProposal.actions.forEach(action => {
        if (action.startsWith('添加')) {
          // 添加新Tiddler
          const newTiddler = {
            title: `编辑-${Date.now()}`,
            text: editProposal.content,
            tags: ['edit', 'proposed'],
            created: new Date().toISOString()
          };
          tiddlers.push(newTiddler);
        } else if (action.startsWith('更新')) {
          // 更新现有Tiddler
          const mainTiddler = tiddlers.find(t => t.tags.includes('main'));
          if (mainTiddler) {
            mainTiddler.text += '\n\n' + editProposal.content;
            mainTiddler.modified = new Date().toISOString();
          }
        }
      });
    }

    // 重新生成内容
    return this.regenerateContent(originalContent, tiddlers);
  }

  /**
   * 重新生成内容
   */
  regenerateContent(originalContent, tiddlers) {
    // 简化的内容重新生成逻辑
    const tiddlersScript = this.generateTiddlersScript(tiddlers);
    
    // 替换Tiddlers数据部分
    return originalContent.replace(
      /\/\/ TODO: 实现数据加载逻辑[\s\S]*?<\/script>/,
      tiddlersScript + '</script>'
    );
  }

  /**
   * 更新主题配置
   */
  async updateTopicConfig(topicName, action) {
    const wikiPath = await WikiPathResolver.findWikiPath();
    const configPath = path.join(wikiPath, 'config', 'shared-config.json');
    
    try {
      let config;
      if (await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath);
      } else {
        config = { activeTopics: [], lastAccessed: new Date().toISOString() };
      }

      // 更新配置
      if (action === 'created' && !config.activeTopics.includes(topicName)) {
        config.activeTopics.push(topicName);
      } else if (action === 'deleted') {
        config.activeTopics = config.activeTopics.filter(t => t !== topicName);
      }

      config.lastAccessed = new Date().toISOString();
      
      await fs.writeJson(configPath, config, { spaces: 2 });
      
    } catch (error) {
      this.cliContext.logger.warn('更新主题配置失败:', error.message);
    }
  }
}

module.exports = MultiTopicWikiManager;