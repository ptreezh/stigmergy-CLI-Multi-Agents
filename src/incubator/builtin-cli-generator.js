/**
 * 内置CLI生成引擎
 * 零配置，核心包内置的轻量CLI生成能力
 * 覆盖60%常见场景，无需外部工具
 */

class BuiltInCLIGenerator {
  /**
   * 识别项目类型
   * @param {Object} structure - 项目结构 { files, directories }
   * @returns {Object} 项目类型信息
   */
  identifyProjectType(structure) {
    const files = structure.files || [];
    const fileNames = files.map(f => f.toLowerCase());

    // Python项目
    if (fileNames.includes('requirements.txt') || 
        fileNames.includes('setup.py') ||
        fileNames.includes('pyproject.toml')) {
      return {
        type: 'python',
        confidence: 0.9,
        entryPoint: this._findPythonEntryPoint(files)
      };
    }

    // Node.js项目
    if (fileNames.includes('package.json')) {
      return {
        type: 'nodejs',
        confidence: 0.95,
        entryPoint: this._findNodeEntryPoint(files)
      };
    }

    // Web项目
    if (fileNames.includes('index.html') || fileNames.includes('index.htm')) {
      return {
        type: 'web',
        confidence: 0.8
      };
    }

    // Java项目
    if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) {
      return {
        type: 'java',
        confidence: 0.85
      };
    }

    return {
      type: 'unknown',
      confidence: 0
    };
  }

  /**
   * 生成CLI命令
   * @param {Object} projectInfo - 项目信息
   * @returns {Array} CLI命令列表
   */
  generateCommands(projectInfo) {
    const commands = [];

    switch (projectInfo.type) {
      case 'python':
        commands.push(
          { name: 'run', description: '运行项目', command: `python ${projectInfo.entryPoint || 'app.py'}` },
          { name: 'install', description: '安装依赖', command: 'pip install -r requirements.txt' },
          { name: 'test', description: '运行测试', command: 'python -m pytest' },
          { name: 'help', description: '显示帮助', command: 'python app.py --help' }
        );
        break;

      case 'nodejs':
        commands.push(
          { name: 'start', description: '启动项目', command: 'node index.js' },
          { name: 'install', description: '安装依赖', command: 'npm install' },
          { name: 'test', description: '运行测试', command: 'npm test' },
          { name: 'help', description: '显示帮助', command: 'node index.js --help' }
        );
        break;

      case 'web':
        commands.push(
          { name: 'serve', description: '启动本地服务器', command: 'python -m http.server 8000' },
          { name: 'open', description: '在浏览器中打开', command: 'start index.html' }
        );
        break;

      default:
        commands.push(
          { name: 'run', description: '运行项目', command: 'run' },
          { name: 'help', description: '显示帮助', command: '--help' }
        );
    }

    return commands;
  }

  /**
   * 生成网站CLI骨架
   * @param {Object} siteInfo - 网站信息
   * @returns {Object} CLI骨架
   */
  generateWebsiteCLI(siteInfo) {
    const cliName = `cli-${this._sanitizeName(siteInfo.url)}`;
    
    const commands = (siteInfo.detectedPages || []).map(page => ({
      name: `get-${page}`,
      description: `获取${page}页面数据`,
      command: `curl ${siteInfo.url}/${page}`
    }));

    if (siteInfo.hasAPI) {
      commands.push({
        name: 'api-list',
        description: '列出可用API端点',
        command: `curl ${siteInfo.url}/api`
      });
    }

    return {
      cliName,
      sourceUrl: siteInfo.url,
      commands,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 生成内置CLI的溯源信息
   * @param {Object} options - 选项
   * @returns {Object} 溯源信息
   */
  generateBuiltInProvenance(options) {
    return {
      cliName: options.cliName,
      sourceType: options.sourceType,
      sourceUrl: options.sourceUrl,
      generatedAt: new Date().toISOString(),
      generatedBy: 'builtin',  // 标识为内置引擎生成
      capabilities: options.commands || [],
      testPassed: false,
      engine: 'builtin-lite',
      coverage: '60%'
    };
  }

  /**
   * 评估覆盖能力
   * @param {Object} context - 上下文
   * @returns {Object} 评估结果
   */
  assessCoverage(context) {
    const { projectType, complexity } = context;

    // 简单项目：内置引擎可处理
    if (complexity === 'simple') {
      return {
        canHandle: true,
        coverage: 90,
        engine: 'builtin',
        recommendUpgrade: false
      };
    }

    // 中等复杂度：部分可处理
    if (complexity === 'medium') {
      if (['python', 'nodejs', 'web'].includes(projectType)) {
        return {
          canHandle: true,
          coverage: 70,
          engine: 'builtin',
          recommendUpgrade: false
        };
      }
    }

    // 复杂或未知项目：建议升级
    return {
      canHandle: false,
      coverage: 30,
      engine: 'builtin',
      recommendUpgrade: true,
      reason: '项目复杂度高，建议使用cli-anything完整引擎'
    };
  }

  /**
   * 查找Python入口文件
   * @private
   */
  _findPythonEntryPoint(files) {
    const commonEntryPoints = ['app.py', 'main.py', 'index.py', 'cli.py'];
    for (const entry of commonEntryPoints) {
      if (files.includes(entry)) {
        return entry;
      }
    }
    return 'app.py';  // 默认
  }

  /**
   * 查找Node.js入口文件
   * @private
   */
  _findNodeEntryPoint(files) {
    const commonEntryPoints = ['index.js', 'main.js', 'app.js', 'cli.js'];
    for (const entry of commonEntryPoints) {
      if (files.includes(entry)) {
        return entry;
      }
    }
    return 'index.js';  // 默认
  }

  /**
   * 清理URL作为CLI名称
   * @private
   */
  _sanitizeName(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/\./g, '-');
    } catch {
      return url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    }
  }
}

module.exports = {
  BuiltInCLIGenerator
};
