const path = require('path');
const CLIAdapter = require('../adapters/CLIAdapter');
const WikiCollaborativeSkill = require('../core/WikiCollaborativeSkill');
const WikiInitializer = require('../utils/WikiInitializer');
const WikiViewer = require('../utils/WikiViewer');

/**
 * 独立部署的Wiki技能服务
 */
class StandaloneWikiService {
  constructor(cliType = 'standalone') {
    this.cliType = cliType;
    this.adapter = new CLIAdapter(cliType);
    this.skill = new WikiCollaborativeSkill(this.adapter.context);
    this.initializer = new WikiInitializer(this.adapter.context);
    this.viewer = new WikiViewer(this.adapter.context);
  }

  /**
   * 初始化服务
   */
  async initialize(config = {}) {
    this.config = {
      port: config.port || 3000,
      host: config.host || 'localhost',
      wikiPath: config.wikiPath || process.cwd(),
      ...config
    };

    // 初始化Wiki系统
    if (!await this.checkWikiExists()) {
      await this.initializer.initializeWiki(this.config.wikiPath);
    }

    this.adapter.context.logger.info(`Wiki服务已初始化 (${this.cliType}模式)`);
  }

  /**
   * 启动服务
   */
  async start() {
    const express = require('express');
    const app = express();

    // 中间件
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../../templates')));

    // API路由
    app.post('/api/wiki/execute', async (req, res) => {
      try {
        const { task, options } = req.body;
        const result = await this.skill.executeWikiTask(task, options);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/wiki/init', async (req, res) => {
      try {
        const { projectPath } = req.body;
        const result = await this.initializer.initializeWiki(projectPath);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/wiki/open', async (req, res) => {
      try {
        const { topicName } = req.body;
        const result = await this.viewer.openWiki(topicName);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/api/wiki/topics', async (req, res) => {
      try {
        const topics = await this.skill.wikiManager.listTopics();
        res.json({ success: true, topics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/api/wiki/status', async (req, res) => {
      try {
        const status = await this.getStatus();
        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 启动服务器
    this.server = app.listen(this.config.port, this.config.host, () => {
      this.adapter.context.logger.info(
        `Wiki服务已启动: http://${this.config.host}:${this.config.port}`
      );
    });

    return this.server;
  }

  /**
   * 停止服务
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
  }

  /**
   * 检查Wiki是否存在
   */
  async checkWikiExists() {
    const path = require('path');
    const fs = require('fs-extra');
    const wikiPath = path.join(this.config.wikiPath, '.wiki');
    return await fs.pathExists(wikiPath);
  }

  /**
   * 获取服务状态
   */
  async getStatus() {
    return {
      cliType: this.cliType,
      running: !!this.server,
      config: this.config,
      wikiExists: await this.checkWikiExists(),
      uptime: process.uptime()
    };
  }
}

/**
 * CLI命令接口
 */
class CLIInterface {
  constructor() {
    this.commands = new Map();
    this.setupCommands();
  }

  /**
   * 设置命令
   */
  setupCommands() {
    this.commands.set('start', async (args, options) => {
      const cliType = options.cli || 'standalone';
      const service = new StandaloneWikiService(cliType);
      
      await service.initialize({
        port: options.port || 3000,
        host: options.host || 'localhost'
      });
      
      await service.start();
      
      // 保持进程运行
      process.on('SIGINT', async () => {
        console.log('\n正在停止Wiki服务...');
        await service.stop();
        process.exit(0);
      });
    });

    this.commands.set('init', async (args, options) => {
      const cliType = options.cli || 'standalone';
      const service = new StandaloneWikiService(cliType);
      
      await service.initialize();
      const projectPath = args[0] || process.cwd();
      await service.initializer.initializeWiki(projectPath);
      
      console.log('Wiki初始化完成');
    });

    this.commands.set('execute', async (args, options) => {
      const cliType = options.cli || 'standalone';
      const service = new StandaloneWikiService(cliType);
      
      await service.initialize();
      
      const task = args.join(' ');
      const result = await service.skill.executeWikiTask(task, options);
      
      console.log('执行结果:', result);
    });

    this.commands.set('status', async (args, options) => {
      const cliType = options.cli || 'standalone';
      const service = new StandaloneWikiService(cliType);
      
      await service.initialize();
      const status = await service.getStatus();
      
      console.log('服务状态:', status);
    });
  }

  /**
   * 执行命令
   */
  async execute(command, args = [], options = {}) {
    const handler = this.commands.get(command);
    if (!handler) {
      throw new Error(`未知命令: ${command}`);
    }
    
    await handler(args, options);
  }

  /**
   * 获取可用命令
   */
  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }
}

/**
 * 主入口函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Wiki协同技能服务

用法:
  node standalone.js <command> [options]

命令:
  start     - 启动Wiki服务
  init      - 初始化Wiki系统
  execute   - 执行Wiki任务
  status    - 查看服务状态

选项:
  --cli <type>    - CLI类型 (claude|stigmergy|gemini|standalone)
  --port <port>   - 服务端口 (默认: 3000)
  --host <host>   - 服务主机 (默认: localhost)

示例:
  node standalone.js start --cli claude --port 8080
  node standalone.js init --cli standalone
  node standalone.js execute "参与机器学习词条编辑" --cli claude
    `);
    return;
  }

  const cli = new CLIInterface();
  
  try {
    // 解析选项
    const options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].slice(2);
        const value = args[i + 1];
        if (value && !value.startsWith('--')) {
          options[key] = value;
          i++;
        } else {
          options[key] = true;
        }
      }
    }

    await cli.execute(command, args.slice(1), options);
  } catch (error) {
    console.error('命令执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = {
  StandaloneWikiService,
  CLIInterface,
  main
};