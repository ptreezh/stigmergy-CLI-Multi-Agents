#!/usr/bin/env node

/**
 * Stigmergy WeChat iLink Client
 *
 * 独立的微信个人号接入客户端，直接调用腾讯 iLink AI API
 * 不依赖 OpenClaw 框架
 *
 * 官方 API: https://ilinkai.weixin.qq.com
 *
 * 功能：
 * - 个人微信扫码登录
 * - 消息接收（长轮询）
 * - 消息发送（文本/图片/文件/视频）
 * - 集成所有 AI CLI（opencode、Claude、Qwen、KiloCode 等）
 *
 * 架构：
 * 用户(微信) → iLink AI API → Stigmergy Client → AI CLI → 返回
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

/**
 * iLink AI API 配置
 */
const ILINK_CONFIG = {
  baseUrl: 'https://ilinkai.weixin.qq.com',
  cdnBaseUrl: 'https://novac2c.cdn.weixin.qq.com/c2c',
  botType: '3', // 默认 bot 类型
  longPollTimeout: 35000, // 长轮询超时（毫秒）
  qrLoginTimeout: 480000, // 扫码登录超时（8分钟）
};

/**
 * iLink AI API 客户端
 */
class ILinkApiClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || ILINK_CONFIG.baseUrl;
    this.token = config.token;
    this.accountId = config.accountId;
    this.userId = config.userId;
  }

  /**
   * 发送 HTTP 请求
   */
  async _request(method, path, data = null, options = {}) {
    const url = new URL(path, this.baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : null;

      const headers = {
        ...options.headers,
      };

      if (postData) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(postData);
      }

      if (this.token) {
        headers['AuthorizationType'] = 'ilink_bot_token';
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const reqOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: headers,
        timeout: options.timeout || 30000,
      };

      const req = client.request(reqOptions, (res) => {
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
            resolve(responseData); // 返回原始响应
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
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
   * 获取二维码（用于扫码登录）
   */
  async getBotQrCode(botType = ILINK_CONFIG.botType) {
    const path = `/ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(botType)}`;
    const response = await this.get(path);

    return {
      qrcode: response.qrcode,
      qrcodeUrl: response.qrcode_img_content,
    };
  }

  /**
   * 查询二维码状态（长轮询）
   */
  async getQrCodeStatus(qrcode, timeout = ILINK_CONFIG.longPollTimeout) {
    const path = `/ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`;

    const response = await this.get(path, {
      timeout: timeout,
      headers: {
        'iLink-App-ClientVersion': '1',
      },
    });

    return {
      status: response.status, // wait | scaned | confirmed | expired
      botToken: response.bot_token,
      ilinkBotId: response.ilink_bot_id,
      baseUrl: response.baseurl,
      ilinkUserId: response.ilink_user_id,
    };
  }

  /**
   * 长轮询获取新消息
   */
  async getUpdates(getUpdatesBuf = '', timeout = ILINK_CONFIG.longPollTimeout) {
    const response = await this.post('/ilink/bot/getupdates', {
      get_updates_buf: getUpdatesBuf,
    }, {
      timeout: timeout,
    });

    return {
      ret: response.ret,
      errcode: response.errcode,
      errmsg: response.errmsg,
      msgs: response.msgs || [],
      getUpdatesBuf: response.get_updates_buf,
      longpollingTimeoutMs: response.longpolling_timeout_ms,
    };
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(toUserId, text, contextToken = '') {
    const response = await this.post('/ilink/bot/sendmessage', {
      msg: {
        from_user_id: '',
        to_user_id: toUserId,
        client_id: this._generateClientId(),
        message_type: 2, // BOT
        message_state: 2, // FINISH
        item_list: [
          {
            type: 1, // TEXT
            text_item: { text },
          },
        ],
        context_token: contextToken,
      },
    });

    return { messageId: this._generateClientId() };
  }

  /**
   * 发送图片消息
   */
  async sendImageMessage(toUserId, encryptQueryParam, aesKey, contextToken = '') {
    const response = await this.post('/ilink/bot/sendmessage', {
      msg: {
        from_user_id: '',
        to_user_id: toUserId,
        client_id: this._generateClientId(),
        message_type: 2, // BOT
        message_state: 2, // FINISH
        item_list: [
          {
            type: 2, // IMAGE
            image_item: {
              media: {
                encrypt_query_param: encryptQueryParam,
                aes_key: aesKey,
                encrypt_type: 1,
              },
              mid_size: 0, // 密文大小
            },
          },
        ],
        context_token: contextToken,
      },
    });

    return { messageId: this._generateClientId() };
  }

  /**
   * 获取上传 URL
   */
  async getUploadUrl(fileKey, mediaType, toUserId, fileInfo) {
    const response = await this.post('/ilink/bot/getuploadurl', {
      filekey: fileKey,
      media_type: mediaType, // 1=IMAGE, 2=VIDEO, 3=FILE
      to_user_id: toUserId,
      rawsize: fileInfo.rawsize,
      rawfilemd5: fileInfo.rawfilemd5,
      filesize: fileInfo.filesize,
      thumb_rawsize: fileInfo.thumb_rawsize,
      thumb_rawfilemd5: fileInfo.thumb_rawfilemd5,
      thumb_filesize: fileInfo.thumb_filesize,
    });

    return {
      uploadParam: response.upload_param,
      thumbUploadParam: response.thumb_upload_param,
    };
  }

  /**
   * 获取配置
   */
  async getConfig(ilinkUserId, contextToken = '') {
    const response = await this.post('/ilink/bot/getconfig', {
      ilink_user_id: ilinkUserId,
      context_token: contextToken,
    });

    return {
      ret: response.ret,
      typingTicket: response.typing_ticket,
    };
  }

  /**
   * 发送正在输入状态
   */
  async sendTyping(ilinkUserId, typingTicket, status = 1) {
    const response = await this.post('/ilink/bot/sendtyping', {
      ilink_user_id: ilinkUserId,
      typing_ticket: typingTicket,
      status: status, // 1=typing, 2=cancel
    });

    return { ret: response.ret };
  }

  /**
   * 生成客户端 ID
   */
  _generateClientId() {
    return `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

/**
 * AI CLI 集成器
 */
class AICliIntegration {
  constructor(config = {}) {
    this.cliType = config.cliType || 'claude'; // claude, gemini, qwen, opencode, kilocode, etc.
    this.projectPath = config.projectPath || process.cwd();
  }

  /**
   * 调用 AI CLI 处理消息
   */
  async processMessage(userMessage, context = {}) {
    return new Promise((resolve, reject) => {
      let command = this.cliType;

      // 添加项目路径
      if (this.projectPath) {
        command += ` --cwd ${this.projectPath}`;
      }

      // 添加用户消息
      command += ` "${userMessage.replace(/"/g, '\\"')}"`;

      console.log(`🤖 调用 ${this.cliType.toUpperCase()} CLI: ${command}`);

      exec(command, {
        cwd: this.projectPath,
        timeout: 120000, // 2分钟超时
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error(`${this.cliType} CLI 执行被终止`));
          } else if (stdout) {
            // 部分错误可能仍然有输出
            resolve(stdout);
          } else {
            reject(error);
          }
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

/**
 * Stigmergy WeChat iLink 客户端
 */
class StigmergyWeChatClient {
  constructor(config = {}) {
    this.ilinkClient = new ILinkApiClient({
      token: config.token,
      accountId: config.accountId,
      userId: config.userId,
    });

    this.aiIntegration = new AICliIntegration({
      cliType: config.cliType || 'claude',
      projectPath: config.projectPath,
    });

    this.getUpdatesBuf = '';
    this.contextTokenStore = new Map(); // userId -> contextToken
    this.isRunning = false;
  }

  /**
   * 扫码登录
   */
  async loginWithQr() {
    console.log('\\n🔍 开始微信扫码登录...\\n');

    try {
      // 1. 获取二维码
      console.log('📱 获取二维码...');
      const qrResponse = await this.ilinkClient.getBotQrCode();

      console.log('\\n' + '='.repeat(70));
      console.log('请使用微信扫描以下二维码：');
      console.log('='.repeat(70));
      console.log('');

      // 显示 ASCII 二维码
      qrcode.generate(qrResponse.qrcodeUrl, { small: true });

      console.log('');
      console.log('='.repeat(70));
      console.log('二维码链接：');
      console.log(qrResponse.qrcodeUrl);
      console.log('='.repeat(70));
      console.log('');
      console.log('💡 提示：');
      console.log('   1. 用微信扫描上方二维码');
      console.log('   2. 或在浏览器中打开链接，然后用微信扫浏览器中的二维码');
      console.log('='.repeat(70) + '\\n');

      // 2. 长轮询等待扫码
      console.log('⏳ 等待扫码...\\n');

      const deadline = Date.now() + ILINK_CONFIG.qrLoginTimeout;
      let qrRefreshCount = 0;
      const MAX_QR_REFRESH = 3;

      while (Date.now() < deadline) {
        try {
          const statusResponse = await this.ilinkClient.getQrCodeStatus(qrResponse.qrcode);

          switch (statusResponse.status) {
            case 'wait':
              process.stdout.write('.');
              break;

            case 'scaned':
              console.log('\\n👀 已扫码，请在微信中确认登录...');
              break;

            case 'confirmed':
              console.log('\\n✅ 登录成功！\\n');

              if (statusResponse.botToken && statusResponse.ilinkBotId) {
                this.ilinkClient.token = statusResponse.botToken;
                this.ilinkClient.accountId = statusResponse.ilinkBotId;
                this.ilinkClient.userId = statusResponse.ilinkUserId;

                // 保存登录信息
                this._saveCredentials({
                  token: statusResponse.botToken,
                  accountId: statusResponse.ilinkBotId,
                  userId: statusResponse.ilinkUserId,
                  baseUrl: statusResponse.baseUrl || ILINK_CONFIG.baseUrl,
                });

                console.log(`📋 账号信息：`);
                console.log(`   Bot ID: ${statusResponse.ilinkBotId}`);
                console.log(`   User ID: ${statusResponse.ilinkUserId}`);
                console.log('');

                return {
                  success: true,
                  token: statusResponse.botToken,
                  accountId: statusResponse.ilinkBotId,
                  userId: statusResponse.ilinkUserId,
                };
              }
              break;

            case 'expired':
              qrRefreshCount++;
              if (qrRefreshCount > MAX_QR_REFRESH) {
                throw new Error('二维码过期次数过多，请重新开始');
              }

              console.log(`\\n⏳ 二维码已过期，正在刷新... (${qrRefreshCount}/${MAX_QR_REFRESH})`);

              const newQr = await this.ilinkClient.getBotQrCode();
              console.log('\\n📱 新二维码：\\n');
              console.log(newQr.qrcodeUrl);
              console.log('\\n请重新扫描...\\n');
              break;
          }

        } catch (error) {
          // 如果是二维码过期次数过多，直接退出
          if (error.message.includes('二维码过期次数过多')) {
            throw error;
          }
          console.error('\\n❌ 查询状态失败:', error.message);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      throw new Error('登录超时');

    } catch (error) {
      console.error('\\n❌ 登录失败:', error.message);
      throw error;
    }
  }

  /**
   * 启动消息监听
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  消息监听已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('\\n🚀 启动微信消息监听');
    console.log(`   AI CLI: ${this.aiIntegration.cliType.toUpperCase()}`);
    console.log(`   项目路径: ${this.aiIntegration.projectPath}`);

    while (this.isRunning) {
      try {
        // 长轮询获取消息
        const response = await this.ilinkClient.getUpdates(this.getUpdatesBuf);

        if (response.ret !== 0 && response.ret !== undefined) {
          console.error(`\\n❌ API 错误: ret=${response.ret} errcode=${response.errcode} errmsg=${response.errmsg}`);

          if (response.errcode === -14) {
            // 会话过期
            console.error('⚠️  会话已过期，请重新登录');
            await new Promise(resolve => setTimeout(resolve, 60000));
            continue;
          }

          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        if (response.msgs && response.msgs.length > 0) {
          console.log(`\\n📬 收到 ${response.msgs.length} 条消息`);

          for (const msg of response.msgs) {
            await this._handleMessage(msg);
          }
        }

        // 更新同步游标
        if (response.getUpdatesBuf) {
          this.getUpdatesBuf = response.getUpdatesBuf;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error('\\n❌ 获取消息失败:', error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * 处理收到的消息
   */
  async _handleMessage(msg) {
    try {
      // 只处理用户消息（message_type = 1）
      if (msg.message_type !== 1) return;

      // 只处理新消息（message_state = 0）
      if (msg.message_state !== 0) return;

      const fromUserId = msg.from_user_id;
      const textContent = this._extractTextContent(msg);

      if (!textContent) return;

      console.log(`\\n📨 收到消息:`);
      console.log(`   用户: ${fromUserId}`);
      console.log(`   内容: ${textContent}`);

      // 保存 context_token
      if (msg.context_token) {
        this.contextTokenStore.set(fromUserId, msg.context_token);
      }

      // 调用 AI CLI
      console.log(`🤖 调用 ${this.aiIntegration.cliType.toUpperCase()} CLI...`);

      try {
        const aiResponse = await this.aiIntegration.processMessage(textContent);

        console.log(`✅ ${this.aiIntegration.cliType.toUpperCase()} CLI 响应成功`);
        console.log(`   响应长度: ${aiResponse.length} 字符`);

        // 发送回复
        const contextToken = this.contextTokenStore.get(fromUserId) || '';
        await this.ilinkClient.sendTextMessage(fromUserId, aiResponse, contextToken);

        console.log('   ✅ 已发送回复');

      } catch (error) {
        console.error(`❌ ${this.aiIntegration.cliType.toUpperCase()} CLI 处理失败:`, error.message);

        // 发送错误提示
        try {
          const contextToken = this.contextTokenStore.get(fromUserId) || '';
          await this.ilinkClient.sendTextMessage(
            fromUserId,
            `抱歉，处理您的请求时出错：${error.message}`,
            contextToken
          );
        } catch (sendError) {
          console.error('❌ 发送错误消息失败:', sendError.message);
        }
      }

    } catch (error) {
      console.error('❌ 处理消息失败:', error);
    }
  }

  /**
   * 提取文本内容
   */
  _extractTextContent(msg) {
    if (!msg.item_list || msg.item_list.length === 0) {
      return null;
    }

    for (const item of msg.item_list) {
      if (item.type === 1 && item.text_item && item.text_item.text) {
        return item.text_item.text;
      }

      // 语音消息可能有文字转写
      if (item.type === 3 && item.voice_item && item.voice_item.text) {
        return item.voice_item.text;
      }
    }

    return null;
  }

  /**
   * 停止消息监听
   */
  async stop() {
    this.isRunning = false;
    console.log('\\n🛑 已停止消息监听');
  }

  /**
   * 保存登录凭证
   */
  _saveCredentials(credentials) {
    const stateDir = path.join(process.cwd(), '.stigmergy', 'wechat-ilink');
    fs.mkdirSync(stateDir, { recursive: true });

    const credentialsPath = path.join(stateDir, 'credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

    console.log(`✅ 登录凭证已保存到: ${credentialsPath}`);
  }

  /**
   * 加载登录凭证
   */
  static loadCredentials() {
    const stateDir = path.join(process.cwd(), '.stigmergy', 'wechat-ilink');
    const credentialsPath = path.join(stateDir, 'credentials.json');

    if (!fs.existsSync(credentialsPath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(credentialsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ 加载凭证失败:', error.message);
      return null;
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\\n' + '='.repeat(70));
  console.log('🚀 Stigmergy WeChat iLink Client');
  console.log('='.repeat(70));

  // 获取命令行参数
  const args = process.argv.slice(2);
  const cliType = args[0] || 'claude';

  console.log(`\\n📱 AI CLI: ${cliType.toUpperCase()}`);

  // 尝试加载已保存的凭证
  let credentials = StigmergyWeChatClient.loadCredentials();

  if (!credentials) {
    console.log('\\n未找到登录凭证，开始扫码登录...');

    const client = new StigmergyWeChatClient({
      cliType: cliType,
    });

    const loginResult = await client.loginWithQr();

    if (loginResult.success) {
      credentials = {
        token: loginResult.token,
        accountId: loginResult.accountId,
        userId: loginResult.userId,
        baseUrl: ILINK_CONFIG.baseUrl,
      };
    } else {
      console.error('❌ 登录失败');
      process.exit(1);
    }
  }

  console.log('\\n✅ 登录凭证已加载');
  console.log(`   Bot ID: ${credentials.accountId}`);
  console.log(`   User ID: ${credentials.userId}`);

  // 创建客户端并启动
  const client = new StigmergyWeChatClient({
    token: credentials.token,
    accountId: credentials.accountId,
    userId: credentials.userId,
    cliType: cliType,
    projectPath: process.cwd(),
  });

  // 优雅退出处理
  process.on('SIGINT', async () => {
    console.log('\\n\\n🛑 正在停止服务...');
    await client.stop();
    process.exit(0);
  });

  console.log('\\n' + '='.repeat(70));
  console.log('✅ 准备就绪，开始监听微信消息...');
  console.log('='.repeat(70));
  console.log('\\n💡 提示：');
  console.log('   - 按 Ctrl+C 停止服务');
  console.log(`   - 使用微信发送消息，${cliType.toUpperCase()} CLI 将自动回复`);
  console.log('   - 查看日志了解处理详情\\n');

  await client.start();
}

// 导出
module.exports = {
  ILINK_CONFIG,
  ILinkApiClient,
  AICliIntegration,
  StigmergyWeChatClient,
};

// 如果直接运行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}
