const fs = require('fs-extra');
const path = require('path');
const open = require('open');
const express = require('express');
const { Server } = require('socket.io');

/**
 * Wiki查看器
 */
class WikiViewer {
  constructor(cliContext) {
    this.cliContext = cliContext;
    this.server = null;
    this.io = null;
  }

  /**
   * 打开Wiki
   * @param {string} topicName - 主题名称
   */
  async openWiki(topicName = null) {
    try {
      const wikiPath = await this.resolveWikiPath(topicName);
      
      if (!await fs.pathExists(wikiPath)) {
        throw new Error(`Wiki文件不存在: ${wikiPath}`);
      }

      // 读取配置
      const config = await this.loadConfig();
      
      if (config.localServer.enabled) {
        // 启动本地服务器
        await this.startLocalServer();
        const url = `http://localhost:${config.localServer.port}/${topicName || 'index'}`;
        await open(url);
        this.cliContext.logger.info(`Wiki已打开: ${url}`);
      } else {
        // 直接打开HTML文件
        await open(`file://${wikiPath}`);
        this.cliContext.logger.info(`Wiki已打开: ${wikiPath}`);
      }

      // 更新访问记录
      await this.updateAccessRecord(topicName);
      
    } catch (error) {
      this.cliContext.logger.error('打开Wiki失败:', error.message);
      throw error;
    }
  }

  /**
   * 解析Wiki路径
   */
  async resolveWikiPath(topicName) {
    const WikiPathResolver = require('./WikiPathResolver');
    const wikiBasePath = await WikiPathResolver.findWikiPath();
    
    if (!wikiBasePath) {
      throw new Error('Wiki未初始化，请先运行 "stigmergy wiki init"');
    }

    if (topicName) {
      return path.join(wikiBasePath, 'topics', `${topicName}.html`);
    } else {
      return path.join(wikiBasePath, 'topics', 'README.html');
    }
  }

  /**
   * 加载配置
   */
  async loadConfig() {
    const WikiPathResolver = require('./WikiPathResolver');
    const wikiBasePath = await WikiPathResolver.findWikiPath();
    const configPath = path.join(wikiBasePath, 'config', 'wiki-config.json');
    
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
    
    // 默认配置
    return {
      localServer: {
        enabled: false,
        port: 8080
      }
    };
  }

  /**
   * 启动本地服务器
   */
  async startLocalServer() {
    if (this.server) {
      return; // 服务器已启动
    }

    const WikiPathResolver = require('./WikiPathResolver');
    const wikiBasePath = await WikiPathResolver.findWikiPath();
    const config = await this.loadConfig();

    const app = express();
    
    // 静态文件服务
    app.use('/assets', express.static(path.join(wikiBasePath, 'assets')));
    app.use('/topics', express.static(path.join(wikiBasePath, 'topics')));
    
    // 主页路由
    app.get('/', (req, res) => {
      res.sendFile(path.join(wikiBasePath, 'topics', 'README.html'));
    });

    // 主题路由
    app.get('/:topic', (req, res) => {
      const topicPath = path.join(wikiBasePath, 'topics', `${req.params.topic}.html`);
      if (fs.pathExistsSync(topicPath)) {
        res.sendFile(topicPath);
      } else {
        res.status(404).send('主题不存在');
      }
    });

    // 启动服务器
    this.server = app.listen(config.localServer.port, () => {
      this.cliContext.logger.info(`Wiki服务器启动: http://localhost:${config.localServer.port}`);
    });

    // 设置Socket.IO用于实时协作
    this.io = new Server(this.server);
    this.setupSocketHandlers();
  }

  /**
   * 设置Socket.IO处理器
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      this.cliContext.logger.debug('用户连接到Wiki服务器');

      // 加入主题房间
      socket.on('join-topic', (topicName) => {
        socket.join(topicName);
        this.cliContext.logger.debug(`用户加入主题: ${topicName}`);
      });

      // 处理编辑操作
      socket.on('edit-operation', (data) => {
        socket.to(data.topic).emit('remote-edit', data);
      });

      // 处理用户状态
      socket.on('user-cursor', (data) => {
        socket.to(data.topic).emit('remote-cursor', data);
      });

      socket.on('disconnect', () => {
        this.cliContext.logger.debug('用户断开连接');
      });
    });
  }

  /**
   * 停止本地服务器
   */
  async stopLocalServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.cliContext.logger.info('Wiki服务器已停止');
    }
  }

  /**
   * 更新访问记录
   */
  async updateAccessRecord(topicName) {
    const WikiPathResolver = require('./WikiPathResolver');
    const wikiBasePath = await WikiPathResolver.findWikiPath();
    const sharedConfigPath = path.join(wikiBasePath, 'config', 'shared-config.json');
    
    try {
      const config = await fs.readJson(sharedConfigPath);
      config.lastAccessed = new Date().toISOString();
      
      if (topicName && !config.activeTopics.includes(topicName)) {
        config.activeTopics.push(topicName);
      }
      
      await fs.writeJson(sharedConfigPath, config, { spaces: 2 });
    } catch (error) {
      this.cliContext.logger.warn('更新访问记录失败:', error.message);
    }
  }

  /**
   * 获取Wiki统计信息
   */
  async getWikiStats() {
    const WikiPathResolver = require('./WikiPathResolver');
    const wikiBasePath = await WikiPathResolver.findWikiPath();
    
    if (!wikiBasePath) {
      return null;
    }

    const topicsPath = path.join(wikiBasePath, 'topics');
    const files = await fs.readdir(topicsPath);
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    return {
      totalTopics: htmlFiles.length,
      topics: htmlFiles.map(file => file.replace('.html', '')),
      serverRunning: !!this.server
    };
  }
}

module.exports = WikiViewer;