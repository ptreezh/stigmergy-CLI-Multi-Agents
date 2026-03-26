#!/usr/bin/env node

/**
 * Stigmergy WeChat Hub - 多Bot管理架构
 *
 * 核心功能：
 * - 管理多个Bot实例（一个Bot对应一个CLI）
 * - 支持凭证共享（一次扫码）或独立凭证（多次扫码）
 * - 消息路由和分发
 * - Bot生命周期管理
 * - 健康监控集成
 *
 * 架构：
 * Stigmergy WeChat Hub
 *   ├── Bot Instance Manager (管理多个Bot)
 *   ├── Credential Manager (凭证管理)
 *   ├── Message Router (消息路由)
 *   └── Health Monitor (健康监控)
 */

const { EventEmitter } = require('events');
const { ILinkApiClientEnhanced } = require('./ilink-wechat-client-v2');
const fs = require('fs');
const path = require('path');

/**
 * 凭证存储
 */
const CREDENTIALS_FILE = path.join(__dirname, '../.wechat-hub-credentials.json');

class CredentialManager {
  constructor() {
    this.credentials = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(CREDENTIALS_FILE)) {
        return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('加载凭证失败:', error.message);
    }
    return {
      shared: null,  // 共享凭证（一次扫码）
      independent: {},  // 独立凭证（多次扫码）
    };
  }

  _save() {
    try {
      fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(this.credentials, null, 2));
    } catch (error) {
      console.error('保存凭证失败:', error.message);
    }
  }

  /**
   * 保存共享凭证（一次扫码）
   */
  saveShared(credentials) {
    this.credentials.shared = {
      ...credentials,
      createdAt: new Date().toISOString(),
    };
    this._save();
  }

  /**
   * 获取共享凭证
   */
  getShared() {
    return this.credentials.shared;
  }

  /**
   * 保存独立凭证（多次扫码）
   */
  saveIndependent(cliName, credentials) {
    this.credentials.independent[cliName] = {
      ...credentials,
      createdAt: new Date().toISOString(),
    };
    this._save();
  }

  /**
   * 获取独立凭证
   */
  getIndependent(cliName) {
    return this.credentials.independent[cliName];
  }

  /**
   * 删除凭证
   */
  remove(cliName) {
    if (this.credentials.independent[cliName]) {
      delete this.credentials.independent[cliName];
      this._save();
    }
  }

  /**
   * 清空所有凭证
   */
  clear() {
    this.credentials = {
      shared: null,
      independent: {},
    };
    this._save();
  }
}

/**
 * Bot实例包装器
 */
class BotInstanceWrapper {
  constructor(cliName, client, mode = 'shared') {
    this.cliName = cliName;
    this.client = client;
    this.mode = mode;  // 'shared' or 'independent'
    this.status = 'initializing';
    this.startTime = null;
    this.messageCount = 0;
    this.errorCount = 0;
    this.lastActivity = null;

    // 监听客户端事件
    this._setupEventHandlers();
  }

  _setupEventHandlers() {
    this.client.on('connected', () => {
      this.status = 'connected';
      this.startTime = new Date();
      this.lastActivity = new Date();
      console.log(`[${this.cliName}] ✅ 已连接`);
    });

    this.client.on('disconnected', () => {
      this.status = 'disconnected';
      console.log(`[${this.cliName}] ❌ 已断开`);
    });

    this.client.on('health-check-failed', (data) => {
      this.status = 'unhealthy';
      this.errorCount++;
      console.warn(`[${this.cliName}] ⚠️ 健康检查失败:`, data);
    });
  }

  /**
   * 获取Bot状态
   */
  getStatus() {
    return {
      cliName: this.cliName,
      mode: this.mode,
      status: this.status,
      startTime: this.startTime,
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      lastActivity: this.lastActivity,
      clientStatus: this.client.getStatus(),
    };
  }

  /**
   * 发送消息
   */
  async sendMessage(toUserId, content, contextToken = null) {
    this.messageCount++;
    this.lastActivity = new Date();
    return this.client.sendMessage(toUserId, content, contextToken);
  }
}

/**
 * WeChat Hub - 多Bot管理器
 */
class WeChatHub extends EventEmitter {
  constructor() {
    super();

    this.bots = new Map();  // cliName -> BotInstanceWrapper
    this.credentialManager = new CredentialManager();
    this.messageRouter = new MessageRouter(this);
    this.logger = console;
  }

  /**
   * 添加Bot（使用共享凭证）
   */
  async addBotWithSharedCredentials(cliName) {
    if (this.bots.has(cliName)) {
      throw new Error(`Bot ${cliName} 已存在`);
    }

    this.logger.info(`[${cliName}] 使用共享凭证创建Bot...`);

    // 获取或创建共享凭证
    let sharedCreds = this.credentialManager.getShared();
    if (!sharedCreds) {
      this.logger.info(`[${cliName}] 未找到共享凭证，需要扫码登录...`);
      // TODO: 触发QR码登录流程
      throw new Error('需要先执行QR码登录以获取共享凭证');
    }

    // 创建客户端
    const client = new ILinkApiClientEnhanced({
      token: sharedCreds.token,
      accountId: sharedCreds.accountId,
      userId: sharedCreds.userId,
    });

    // 创建包装器
    const wrapper = new BotInstanceWrapper(cliName, client, 'shared');
    this.bots.set(cliName, wrapper);

    // 连接
    await client.connect();

    this.logger.info(`[${cliName}] ✅ Bot创建成功（共享凭证）`);
    this.emit('bot-added', { cliName, mode: 'shared' });

    return wrapper;
  }

  /**
   * 添加Bot（使用独立凭证）
   */
  async addBotWithIndependentCredentials(cliName) {
    if (this.bots.has(cliName)) {
      throw new Error(`Bot ${cliName} 已存在`);
    }

    this.logger.info(`[${cliName}] 使用独立凭证创建Bot...`);

    // 获取或创建独立凭证
    let independentCreds = this.credentialManager.getIndependent(cliName);
    if (!independentCreds) {
      this.logger.info(`[${cliName}] 未找到独立凭证，需要扫码登录...`);
      // TODO: 触发QR码登录流程
      throw new Error(`需要先为 ${cliName} 执行QR码登录以获取独立凭证`);
    }

    // 创建客户端
    const client = new ILinkApiClientEnhanced({
      token: independentCreds.token,
      accountId: independentCreds.accountId,
      userId: independentCreds.userId,
    });

    // 创建包装器
    const wrapper = new BotInstanceWrapper(cliName, client, 'independent');
    this.bots.set(cliName, wrapper);

    // 连接
    await client.connect();

    this.logger.info(`[${cliName}] ✅ Bot创建成功（独立凭证）`);
    this.emit('bot-added', { cliName, mode: 'independent' });

    return wrapper;
  }

  /**
   * 移除Bot
   */
  async removeBot(cliName) {
    const wrapper = this.bots.get(cliName);
    if (!wrapper) {
      throw new Error(`Bot ${cliName} 不存在`);
    }

    this.logger.info(`[${cliName}] 移除Bot...`);

    // 断开连接
    wrapper.client.disconnect();

    // 删除凭证
    if (wrapper.mode === 'independent') {
      this.credentialManager.remove(cliName);
    }

    // 移除Bot
    this.bots.delete(cliName);

    this.logger.info(`[${cliName}] ✅ Bot已移除`);
    this.emit('bot-removed', { cliName });
  }

  /**
   * 获取Bot
   */
  getBot(cliName) {
    return this.bots.get(cliName);
  }

  /**
   * 获取所有Bot
   */
  getAllBots() {
    return Array.from(this.bots.values()).map(bot => bot.getStatus());
  }

  /**
   * 发送消息（通过指定Bot）
   */
  async sendMessage(cliName, toUserId, content, contextToken = null) {
    const bot = this.getBot(cliName);
    if (!bot) {
      throw new Error(`Bot ${cliName} 不存在`);
    }

    return bot.sendMessage(toUserId, content, contextToken);
  }

  /**
   * 获取Hub状态
   */
  getStatus() {
    const bots = this.getAllBots();
    const healthyCount = bots.filter(b => b.status === 'connected').length;
    const totalCount = bots.length;

    return {
      totalBots: totalCount,
      healthyBots: healthyCount,
      unhealthyBots: totalCount - healthyCount,
      sharedCredentials: !!this.credentialManager.getShared(),
      independentCredentials: Object.keys(this.credentialManager.credentials.independent).length,
      bots: bots,
    };
  }
}

/**
 * 消息路由器
 */
class MessageRouter {
  constructor(hub) {
    this.hub = hub;
    this.routes = new Map();  // pattern -> cliName
  }

  /**
   * 添加路由规则
   */
  addRoute(pattern, cliName) {
    this.routes.set(pattern, cliName);
  }

  /**
   * 移除路由规则
   */
  removeRoute(pattern) {
    this.routes.delete(pattern);
  }

  /**
   * 路由消息到合适的Bot
   */
  async routeMessage(toUserId, content, contextToken = null) {
    // 简单的路由策略：查找匹配的Bot
    for (const [pattern, cliName] of this.routes) {
      if (toUserId.includes(pattern) || content.includes(pattern)) {
        const bot = this.hub.getBot(cliName);
        if (bot && bot.status === 'connected') {
          return bot.sendMessage(toUserId, content, contextToken);
        }
      }
    }

    // 默认：使用第一个可用的Bot
    const bots = this.hub.getAllBots();
    const availableBot = bots.find(b => b.status === 'connected');
    if (availableBot) {
      const bot = this.hub.getBot(availableBot.cliName);
      return bot.sendMessage(toUserId, content, contextToken);
    }

    throw new Error('没有可用的Bot');
  }
}

/**
 * 导出
 */
module.exports = {
  WeChatHub,
  CredentialManager,
  BotInstanceWrapper,
  MessageRouter,
};

// 如果直接运行此文件
if (require.main === module) {
  console.log('\n🚀 Stigmergy WeChat Hub - 多Bot管理架构\n');
  console.log('功能：');
  console.log('  ✅ 管理多个Bot实例');
  console.log('  ✅ 支持凭证共享（一次扫码）');
  console.log('  ✅ 支持独立凭证（多次扫码）');
  console.log('  ✅ 消息路由和分发');
  console.log('  ✅ Bot生命周期管理');
  console.log('  ✅ 健康监控集成\n');
  console.log('使用示例：');
  console.log('  const hub = new WeChatHub();');
  console.log('  await hub.addBotWithSharedCredentials(\'claude\');');
  console.log('  await hub.addBotWithSharedCredentials(\'qwen\');');
  console.log('  await hub.sendMessage(\'claude\', \'userId\', \'Hello\');\n');
}
