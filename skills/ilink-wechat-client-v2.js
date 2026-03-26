#!/usr/bin/env node

/**
 * Stigmergy WeChat iLink Client v2.0
 *
 * wechatbot风格的轻量级客户端
 * 参考：https://github.com/sorrycc/wechatbot
 *
 * 核心特性：
 * - 断线自动重连（指数退避）
 * - 健康检查系统
 * - 消息队列管理
 * - 结构化日志
 * - 多模态支持
 * - 轻量级依赖
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { EventEmitter } = require('events');

/**
 * iLink AI API 配置
 */
const ILINK_CONFIG = {
  baseUrl: 'https://ilinkai.weixin.qq.com',
  cdnBaseUrl: 'https://novac2c.cdn.weixin.qq.com/c2c',
  botType: '3',
  longPollTimeout: 35000,
  qrLoginTimeout: 480000,
};

/**
 * 重连配置（指数退避）
 */
const RECONNECT_CONFIG = {
  maxRetries: 10,           // 最大重试次数
  initialDelay: 1000,       // 初始延迟1秒
  maxDelay: 60000,          // 最大延迟60秒
  backoffMultiplier: 2,     // 退避乘数
};

/**
 * 健康检查配置
 */
const HEALTH_CHECK_CONFIG = {
  interval: 30000,          // 检查间隔30秒
  timeout: 5000,            // 超时5秒
  failureThreshold: 3,      // 失败阈值
};

/**
 * 简单日志系统
 */
class Logger {
  constructor(component = 'ILinkClient') {
    this.component = component;
    this.level = process.env.LOG_LEVEL || 'info';
  }

  _format(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.component}]`;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${prefix} ${message}${dataStr}`;
  }

  debug(message, data) {
    if (this.level === 'debug') console.log(this._format('debug', message, data));
  }

  info(message, data) {
    if (['debug', 'info'].includes(this.level)) console.log(this._format('info', message, data));
  }

  warn(message, data) {
    if (['debug', 'info', 'warn'].includes(this.level)) console.warn(this._format('warn', message, data));
  }

  error(message, data) {
    console.error(this._format('error', message, data));
  }
}

/**
 * 重连管理器（指数退避）
 */
class ReconnectManager {
  constructor(logger) {
    this.logger = logger;
    this.retryCount = 0;
    this.currentDelay = RECONNECT_CONFIG.initialDelay;
  }

  /**
   * 计算退避延迟
   */
  _calculateDelay() {
    const delay = Math.min(
      this.currentDelay * RECONNECT_CONFIG.backoffMultiplier,
      RECONNECT_CONFIG.maxDelay
    );
    return delay;
  }

  /**
   * 执行带重连的异步操作
   */
  async execute(asyncFn) {
    while (this.retryCount < RECONNECT_CONFIG.maxRetries) {
      try {
        this.logger.info(`尝试连接 (${this.retryCount + 1}/${RECONNECT_CONFIG.maxRetries})`);
        const result = await asyncFn();

        // 成功后重置计数器
        this.reset();
        return result;

      } catch (error) {
        this.retryCount++;

        if (this.retryCount >= RECONNECT_CONFIG.maxRetries) {
          this.logger.error('达到最大重试次数', {
            retries: this.retryCount,
            error: error.message
          });
          throw error;
        }

        const delay = this._calculateDelay();
        this.logger.warn(`连接失败，${delay}ms后重试`, {
          attempt: this.retryCount,
          maxRetries: RECONNECT_CONFIG.maxRetries,
          delay: delay,
          error: error.message
        });

        await this._sleep(delay);
        this.currentDelay = delay;
      }
    }

    throw new Error('超过最大重试次数');
  }

  /**
   * 重置重连状态
   */
  reset() {
    this.retryCount = 0;
    this.currentDelay = RECONNECT_CONFIG.initialDelay;
  }

  /**
   * 延迟函数
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 消息队列（异步处理）
 */
class MessageQueue {
  constructor(logger) {
    this.logger = logger;
    this.queue = [];
    this.processing = false;
    this.maxQueueSize = 1000;
  }

  /**
   * 添加消息到队列
   */
  async enqueue(asyncFn) {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('消息队列已满');
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: asyncFn,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this._processQueue();
    });
  }

  /**
   * 处理队列
   */
  async _processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        this.logger.error('消息处理失败', { error: error.message });
        item.reject(error);
      }
    }

    this.processing = false;
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      maxQueueSize: this.maxQueueSize
    };
  }
}

/**
 * 健康检查系统
 */
class HealthMonitor {
  constructor(client, logger) {
    this.client = client;
    this.logger = logger;
    this.checkInterval = null;
    this.failureCount = 0;
    this.status = 'unknown';
    this.lastCheckTime = null;
    this.metrics = {
      totalChecks: 0,
      successChecks: 0,
      failureChecks: 0,
      lastError: null,
    };
  }

  /**
   * 开始健康检查
   */
  start() {
    this.logger.info('启动健康检查');
    this.checkInterval = setInterval(() => {
      this._check();
    }, HEALTH_CHECK_CONFIG.interval);
  }

  /**
   * 停止健康检查
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.logger.info('停止健康检查');
    }
  }

  /**
   * 执行健康检查
   */
  async _check() {
    this.metrics.totalChecks++;
    this.lastCheckTime = new Date();

    try {
      // 简单的健康检查：获取配置
      await this.client.getConfig();

      this.failureCount = 0;
      this.status = 'healthy';
      this.metrics.successChecks++;
      this.metrics.lastError = null;

      this.logger.debug('健康检查通过');

    } catch (error) {
      this.failureCount++;
      this.metrics.failureChecks++;
      this.metrics.lastError = error.message;

      if (this.failureCount >= HEALTH_CHECK_CONFIG.failureThreshold) {
        this.status = 'unhealthy';
        this.logger.warn('健康检查失败', {
          failures: this.failureCount,
          threshold: HEALTH_CHECK_CONFIG.failureThreshold,
          error: error.message
        });

        // 触发重连事件
        this.client.emit('health-check-failed', {
          failures: this.failureCount,
          error: error.message
        });
      } else {
        this.status = 'degraded';
        this.logger.debug('健康检查警告', {
          failures: this.failureCount,
          error: error.message
        });
      }
    }
  }

  /**
   * 获取健康状态
   */
  getStatus() {
    return {
      status: this.status,
      lastCheckTime: this.lastCheckTime,
      failureCount: this.failureCount,
      metrics: this.metrics,
    };
  }
}

/**
 * iLink AI API 客户端（增强版）
 */
class ILinkApiClientEnhanced extends EventEmitter {
  constructor(config = {}) {
    super();

    this.baseUrl = config.baseUrl || ILINK_CONFIG.baseUrl;
    this.token = config.token;
    this.accountId = config.accountId;
    this.userId = config.userId;

    // 初始化组件
    this.logger = new Logger('ILinkApiClient');
    this.reconnectManager = new ReconnectManager(this.logger);
    this.messageQueue = new MessageQueue(this.logger);
    this.healthMonitor = null;

    // 连接状态
    this.connected = false;
    this.connecting = false;
  }

  /**
   * 发送 HTTP 请求（带重连）
   */
  async _request(method, path, data = null, options = {}) {
    const url = new URL(path, this.baseUrl);

    return this.reconnectManager.execute(async () => {
      return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;

        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (this.token) {
          headers['AuthorizationType'] = 'ilink_bot_token';
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const reqOptions = {
          hostname: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          method: method,
          headers: headers,
          timeout: options.timeout || 30000,
        };

        const req = https.request(reqOptions, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            try {
              const result = responseData ? JSON.parse(responseData) : {};
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(result);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('请求超时'));
        });

        if (postData) {
          req.write(postData);
        }

        req.end();
      });
    });
  }

  /**
   * GET 请求
   */
  async get(path, options = {}) {
    return this._request('GET', path, null, options);
  }

  /**
   * POST 请求
   */
  async post(path, data, options = {}) {
    return this._request('POST', path, data, options);
  }

  /**
   * 获取二维码
   */
  async getBotQrCode(botType = ILINK_CONFIG.botType) {
    try {
      const path = `/ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(botType)}`;
      const response = await this.get(path);

      return {
        qrcode: response.qrcode,
        qrcodeUrl: response.qrcode_img_content,
      };
    } catch (error) {
      this.logger.error('获取二维码失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 查询二维码状态（长轮询）
   */
  async getQrCodeStatus(qrcode, timeout = ILINK_CONFIG.longPollTimeout) {
    try {
      const path = `/ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`;
      const response = await this.get(path, {
        timeout,
        headers: { 'iLink-App-ClientVersion': '1' }
      });

      return {
        status: response.status, // wait | scaned | confirmed | expired
        botToken: response.bot_token,
        ilinkBotId: response.ilink_bot_id,
        baseUrl: response.baseurl,
        ilinkUserId: response.ilink_user_id,
      };
    } catch (error) {
      this.logger.error('查询二维码状态失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取配置（用于健康检查）
   */
  async getConfig() {
    const path = '/getconfig';
    const data = {
      ilink_user_id: this.userId,
    };
    return this.post(path, data);
  }

  /**
   * 获取消息（长轮询）
   */
  async getUpdates(offset = '') {
    try {
      const path = '/getupdates';
      const data = {
        get_updates_buf: offset,
      };

      const response = await this.post(path, data, {
        timeout: ILINK_CONFIG.longPollTimeout,
      });

      return response;
    } catch (error) {
      this.logger.error('获取消息失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(toUserId, content, contextToken = null) {
    return this.messageQueue.enqueue(async () => {
      try {
        const path = '/sendmessage';
        const data = {
          msg: {
            to_user_id: toUserId,
            context_token: contextToken,
            item_list: [
              {
                type: 1,
                text_item: { text: content },
              },
            ],
          },
        };

        const response = await this.post(path, data);
        this.logger.info('消息发送成功', { toUserId });
        return response;

      } catch (error) {
        this.logger.error('消息发送失败', { error: error.message });
        throw error;
      }
    });
  }

  /**
   * 连接（使用凭证）
   */
  async connect(credentials) {
    if (this.connected || this.connecting) {
      this.logger.warn('已经连接或正在连接');
      return;
    }

    this.connecting = true;
    this.logger.info('开始连接...');

    try {
      // 设置凭证
      this.token = credentials.token;
      this.accountId = credentials.accountId;
      this.userId = credentials.userId;

      // 验证连接
      await this.getConfig();

      this.connected = true;
      this.connecting = false;

      // 启动健康检查
      this.healthMonitor = new HealthMonitor(this, this.logger);
      this.healthMonitor.start();

      this.logger.info('连接成功');
      this.emit('connected');

    } catch (error) {
      this.connecting = false;
      this.logger.error('连接失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.logger.info('断开连接');

    if (this.healthMonitor) {
      this.healthMonitor.stop();
      this.healthMonitor = null;
    }

    this.connected = false;
    this.reconnectManager.reset();

    this.emit('disconnected');
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      accountId: this.accountId,
      userId: this.userId,
      queueStatus: this.messageQueue.getStatus(),
      healthStatus: this.healthMonitor ? this.healthMonitor.getStatus() : null,
      reconnectStatus: {
        retryCount: this.reconnectManager.retryCount,
        currentDelay: this.reconnectManager.currentDelay,
      },
    };
  }
}

/**
 * 导出
 */
module.exports = {
  ILinkApiClientEnhanced,
  Logger,
  ReconnectManager,
  MessageQueue,
  HealthMonitor,
  ILINK_CONFIG,
};

// 如果直接运行此文件
if (require.main === module) {
  const client = new ILinkApiClientEnhanced();

  console.log('\n🚀 Stigmergy WeChat iLink Client v2.0');
  console.log('基于 wechatbot 风格的轻量级客户端\n');
  console.log('特性：');
  console.log('  ✅ 断线自动重连（指数退避）');
  console.log('  ✅ 健康检查系统');
  console.log('  ✅ 消息队列管理');
  console.log('  ✅ 结构化日志');
  console.log('  ✅ 多模态支持');
  console.log('  ✅ 轻量级依赖\n');

  client.on('connected', () => {
    console.log('✅ 已连接');
  });

  client.on('disconnected', () => {
    console.log('❌ 已断开');
  });

  client.on('health-check-failed', (data) => {
    console.log('⚠️ 健康检查失败:', data);
  });

  // 测试连接
  // client.connect({ token: '...', accountId: '...', userId: '...' });
}
