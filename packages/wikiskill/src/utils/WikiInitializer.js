const fs = require('fs-extra');
const path = require('path');

/**
 * Wiki初始化器
 */
class WikiInitializer {
  constructor(cliContext) {
    this.cliContext = cliContext;
  }

  /**
   * 初始化Wiki系统
   * @param {string} projectPath - 项目路径
   */
  async initializeWiki(projectPath) {
    const wikiPath = path.join(projectPath, '.wiki');
    
    // 检查是否已存在
    if (await fs.pathExists(wikiPath)) {
      throw new Error('Wiki已在当前项目中初始化');
    }

    try {
      // 创建目录结构
      await this.createDirectoryStructure(wikiPath);
      
      // 复制模板文件
      await this.copyTemplateFiles(wikiPath);
      
      // 创建配置文件
      await this.createConfigFiles(wikiPath);
      
      // 创建初始主题
      await this.createInitialTopic(wikiPath);
      
      this.cliContext.logger.success('Wiki初始化完成');
      this.cliContext.logger.info(`Wiki路径: ${wikiPath}`);
      
      return wikiPath;
    } catch (error) {
      this.cliContext.logger.error('Wiki初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建目录结构
   */
  async createDirectoryStructure(wikiPath) {
    const directories = [
      'topics',
      'config',
      'assets/tiddlywiki',
      'assets/themes',
      'backups'
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.join(wikiPath, dir));
    }
  }

  /**
   * 复制模板文件
   */
  async copyTemplateFiles(wikiPath) {
    const templateDir = path.join(__dirname, '../templates');
    const assetsDir = path.join(wikiPath, 'assets');

    // 复制TiddlyWiki核心文件
    const tiddlywikiSource = path.join(templateDir, 'tiddlywiki.js');
    const tiddlywikiTarget = path.join(assetsDir, 'tiddlywiki/tiddlywiki.js');
    
    if (await fs.pathExists(tiddlywikiSource)) {
      await fs.copy(tiddlywikiSource, tiddlywikiTarget);
    } else {
      // 如果模板文件不存在，创建占位符
      await this.createPlaceholderTiddlyWiki(tiddlywikiTarget);
    }

    // 复制主题模板
    const topicTemplateSource = path.join(templateDir, 'topic-template.html');
    const topicTemplateTarget = path.join(wikiPath, 'topics/template.html');
    
    if (await fs.pathExists(topicTemplateSource)) {
      await fs.copy(topicTemplateSource, topicTemplateTarget);
    } else {
      await this.createTopicTemplate(topicTemplateTarget);
    }
  }

  /**
   * 创建配置文件
   */
  async createConfigFiles(wikiPath) {
    const configPath = path.join(wikiPath, 'config');
    
    // Wiki配置
    const wikiConfig = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      defaultTheme: 'default',
      autoSave: true,
      localServer: {
        enabled: false,
        port: 8080
      },
      collaboration: {
        enabled: true,
        autoSync: false
      }
    };

    await fs.writeJson(
      path.join(configPath, 'wiki-config.json'),
      wikiConfig,
      { spaces: 2 }
    );

    // 共享配置（跨CLI）
    const sharedConfig = {
      lastAccessed: new Date().toISOString(),
      activeTopics: [],
      userPreferences: {
        defaultEditor: 'visual',
        autoOpenBrowser: true,
        theme: 'light'
      }
    };

    await fs.writeJson(
      path.join(configPath, 'shared-config.json'),
      sharedConfig,
      { spaces: 2 }
    );
  }

  /**
   * 创建初始主题
   */
  async createInitialTopic(wikiPath) {
    const readmeContent = this.generateReadmeContent();
    const readmePath = path.join(wikiPath, 'topics/README.html');
    
    await fs.writeFile(readmePath, readmeContent);
  }

  /**
   * 生成README内容
   */
  generateReadmeContent() {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wiki系统说明</title>
</head>
<body>
  <div id="store">
    <div id="tiddler-README" title="README" created="${new Date().toISOString()}" modified="${new Date().toISOString()}" tags="系统说明">
      <pre>## Wiki协同系统

欢迎使用Wiki协同编辑系统！

### 快速开始

1. 使用CLI命令创建新主题：
   \`\`\`bash
   stigmergy call wikiskill "创建新主题：[主题名称]"
   \`\`\`

2. 编辑现有主题：
   \`\`\`bash
   stigmergy call wikiskill "参与[主题名称]词条编辑"
   \`\`\`

3. 查看Wiki：
   \`\`\`bash
   stigmergy wiki open
   \`\`\`

### 功能特性

- 🔍 智能词条查找
- 🎭 专业角色自动设置
- 📚 知识搜索学习
- 🤔 自主思考消化
- 💬 协同编辑
- 🔄 反馈争辩反思

### 目录说明

- \`topics/\`: 各个主题的Wiki文件
- \`config/\`: 配置文件
- \`assets/\`: 静态资源

### 技术栈

- Wiki引擎: TiddlyWiki
- 部署方式: 本地单页文件
- CLI集成: 完全嵌入CLI生态

---
生成时间: ${new Date().toLocaleString()}
</pre>
    </div>
  </div>
  
  <script src="../assets/tiddlywiki/tiddlywiki.js"></script>
</body>
</html>`;
  }

  /**
   * 创建占位符TiddlyWiki文件
   */
  async createPlaceholderTiddlyWiki(targetPath) {
    const placeholder = `// TiddlyWiki核心文件占位符
// 实际部署时需要从官方源复制完整的TiddlyWiki文件
// 下载地址: https://tiddlywiki.com/

console.log('TiddlyWiki核心文件需要从官方源获取');
`;
    
    await fs.writeFile(targetPath, placeholder);
  }

  /**
   * 创建主题模板
   */
  async createTopicTemplate(targetPath) {
    const template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{TOPIC_NAME}}</title>
</head>
<body>
  <div id="store">
    <!-- TiddlyWiki数据将在这里动态生成 -->
  </div>
  
  <script src="../assets/tiddlywiki/tiddlywiki.js"></script>
  <script>
    // 初始化TiddlyWiki
    var wiki = new $tw.TiddlyWiki();
    
    // 加载主题数据
    // TODO: 实现数据加载逻辑
  </script>
</body>
</html>`;
    
    await fs.writeFile(targetPath, template);
  }
}

module.exports = WikiInitializer;