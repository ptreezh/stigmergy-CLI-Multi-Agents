#!/usr/bin/env node

/**
 * OpenClaw WeChat iLink API Adapter for Stigmergy
 *
 * 基于 @tencent-weixin/openclaw-weixin 的 iLink API 协议
 * 让 Stigmergy 的各个 AI CLI 都可以通过个人微信与用户对话
 *
 * OpenClaw 文档: https://docs.openclaw.ai/install
 * iLink API 协议: 见 README
 *
 * 架构:
 * 用户(微信) → OpenClaw Gateway → iLink API → Stigmergy → AI CLI → 返回
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');

/**
 * OpenClaw iLink API 客户端
 */
class OpenClawILinkClient {
  constructor(config) {
    this.gatewayUrl = config.gatewayUrl || 'http://localhost:39280';
    this.token = config.token;
    this.timeout = config.timeout || 35000;
  }

  /**
   * 发送 iLink API 请求
   */
  async _sendRequest(endpoint, data) {
    const url = new URL(endpoint, this.gatewayUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'AuthorizationType': 'ilink_bot_token',
          'Authorization': `Bearer ${this.token}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = client.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (result.ret === 0 || result.ret === undefined) {
              resolve(result);
            } else {
              reject(new Error(`iLink API error: ${result.errmsg || 'Unknown error'}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);

      req.write(postData);
      req.end();
    });
  }

  /**
   * 长轮询获取新消息
   */
  async getUpdates(getUpdatesBuf = '') {
    return await this._sendRequest('getupdates', {
      get_updates_buf: getUpdatesBuf
    });
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(toUserId, text, contextToken = '') {
    return await this._sendRequest('sendmessage', {
      msg: {
        to_user_id: toUserId,
        context_token: contextToken,
        item_list: [
          {
            type: 1, // TEXT
            text_item: { text }
          }
        ]
      }
    });
  }

  /**
   * 发送图片消息
   */
  async sendImageMessage(toUserId, encryptQueryParam, aesKey, contextToken = '') {
    return await this._sendRequest('sendmessage', {
      msg: {
        to_user_id: toUserId,
        context_token: contextToken,
        item_list: [
          {
            type: 2, // IMAGE
            image_item: {
              encrypt_query_param: encryptQueryParam,
              aes_key: aesKey
            }
          }
        ]
      }
    });
  }

  /**
   * 获取上传URL
   */
  async getUploadUrl(fileKey, mediaType, toUserId, fileInfo) {
    return await this._sendRequest('getuploadurl', {
      filekey: fileKey,
      media_type: mediaType, // 1=IMAGE, 2=VIDEO, 3=FILE
      to_user_id: toUserId,
      rawsize: fileInfo.rawsize,
      rawfilemd5: fileInfo.rawfilemd5,
      filesize: fileInfo.filesize,
      thumb_rawsize: fileInfo.thumb_rawsize,
      thumb_rawfilemd5: fileInfo.thumb_rawfilemd5,
      thumb_filesize: fileInfo.thumb_filesize
    });
  }

  /**
   * 获取配置
   */
  async getConfig(ilinkUserId, contextToken = '') {
    return await this._sendRequest('getconfig', {
      ilink_user_id: ilinkUserId,
      context_token: contextToken
    });
  }

  /**
   * 发送正在输入状态
   */
  async sendTyping(ilinkUserId, typingTicket, status = 1) {
    return await this._sendRequest('sendtyping', {
      ilink_user_id: ilinkUserId,
      typing_ticket: typingTicket,
      status: status // 1=typing, 2=cancel
    });
  }
}

/**
 * Stigmergy AI CLI 集成器
 */
class StigmergyAIIntegration {
  constructor(config) {
    this.cliType = config.cliType || 'claude'; // claude, gemini, qwen, etc.
    this.cliPath = config.cliPath;
    this.projectPath = config.projectPath || process.cwd();
  }

  /**
   * 调用 AI CLI 处理用户消息
   */
  async processMessage(userMessage, userId, context = {}) {
    return new Promise((resolve, reject) => {
      let command = this.cliType;

      // 添加项目路径
      if (this.projectPath) {
        command += ` --cwd ${this.projectPath}`;
      }

      // 添加用户消息
      command += ` "${userMessage}"`;

      console.log(`🤖 调用 ${this.cliType.toUpperCase()} CLI: ${command}`);

      exec(command, {
        cwd: this.projectPath,
        timeout: 120000 // 2分钟超时
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error(`${this.cliType} CLI 执行被终止`));
          } else {
            // 部分错误可能仍然有输出
            if (stdout) {
              resolve(stdout);
            } else {
              reject(error);
            }
          }
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

/**
 * OpenClaw WeChat 消息处理器
 */
class OpenClawWeChatHandler {
  constructor(config) {
    this.ilinkClient = new OpenClawILinkClient({
      gatewayUrl: config.gatewayUrl,
      token: config.token,
      timeout: config.timeout || 35000
    });

    this.aiIntegration = new StigmergyAIIntegration({
      cliType: config.cliType || 'claude',
      cliPath: config.cliPath,
      projectPath: config.projectPath
    });

    this.getUpdatesBuf = '';
    this.conversationHistory = new Map(); // 存储对话历史
    this.isRunning = false;
  }

  /**
   * 处理收到的消息
   */
  async handleMessages(messages) {
    for (const msg of messages) {
      try {
        // 只处理用户消息（message_type = 1）
        if (msg.message_type !== 1) continue;

        // 只处理新消息（message_state = 0）
        if (msg.message_state !== 0) continue;

        // 提取文本内容
        const textContent = this.extractTextContent(msg);
        if (!textContent) continue;

        console.log(`\\n📨 收到微信消息:`);
        console.log(`   用户ID: ${msg.from_user_id}`);
        console.log(`   消息内容: ${textContent}`);
        console.log(`   上下文Token: ${msg.context_token}`);

        // 调用 AI CLI 处理
        console.log(`🤖 正在调用 ${this.aiIntegration.cliType.toUpperCase()} CLI...`);

        try {
          const aiResponse = await this.aiIntegration.processMessage(
            textContent,
            msg.from_user_id,
            { contextToken: msg.context_token }
          );

          console.log(`✅ ${this.aiIntegration.cliType.toUpperCase()} CLI 响应成功`);
          console.log(`   响应长度: ${aiResponse.length} 字符`);

          // 发送回复给用户
          await this.ilinkClient.sendTextMessage(
            msg.from_user_id,
            aiResponse,
            msg.context_token
          );

          console.log('   ✅ 已发送回复到微信');

        } catch (error) {
          console.error(`❌ ${this.aiIntegration.cliType.toUpperCase()} CLI 处理失败:`, error.message);

          // 发送错误消息给用户
          await this.ilinkClient.sendTextMessage(
            msg.from_user_id,
            `抱歉，处理您的请求时出错：${error.message}`,
            msg.context_token
          );
        }

      } catch (error) {
        console.error('❌ 处理消息失败:', error);
      }
    }
  }

  /**
   * 提取消息文本内容
   */
  extractTextContent(msg) {
    if (!msg.item_list || msg.item_list.length === 0) {
      return null;
    }

    for (const item of msg.item_list) {
      if (item.type === 1 && item.text_item) {
        return item.text_item.text;
      }
    }

    return null;
  }

  /**
   * 启动消息监听循环
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  消息监听已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('\\n🚀 启动 OpenClaw WeChat 消息监听');
    console.log(`   网关地址: ${this.ilinkClient.gatewayUrl}`);
    console.log(`   AI CLI: ${this.aiIntegration.cliType.toUpperCase()}`);
    console.log(`   项目路径: ${this.aiIntegration.projectPath}`);

    while (this.isRunning) {
      try {
        // 长轮询获取新消息
        const response = await this.ilinkClient.getUpdates(this.getUpdatesBuf);

        if (response.msgs && response.msgs.length > 0) {
          console.log(`\\n📬 收到 ${response.msgs.length} 条消息`);
          await this.handleMessages(response.msgs);
        }

        // 更新同步游标
        if (response.get_updates_buf) {
          this.getUpdatesBuf = response.get_updates_buf;
        }

        // 等待一段时间再继续轮询
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('❌ 获取消息失败:', error.message);

        // 如果是会话超时等错误，等待更长时间
        if (error.message.includes('timeout') || error.message.includes('session')) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  /**
   * 停止消息监听
   */
  async stop() {
    this.isRunning = false;
    console.log('\\n🛑 已停止 OpenClaw WeChat 消息监听');
  }
}

/**
 * 使用示例
 */
async function exampleUsage() {
  console.log('\\n📖 OpenClaw WeChat 集成示例\\n');

  const handler = new OpenClawWeChatHandler({
    gatewayUrl: 'http://localhost:39280', // OpenClaw Gateway 地址
    token: 'your-token-here', // 从 OpenClaw 获取的 token
    cliType: 'claude', // 或 'gemini', 'qwen' 等
    projectPath: process.cwd()
  });

  try {
    // 启动消息监听
    await handler.start();

  } catch (error) {
    console.error('❌ 启动失败:', error);
    console.log('\\n💡 提示：');
    console.log('1. 确保 OpenClaw 已安装并运行');
    console.log('2. 确保 OpenClaw WeChat 插件已安装');
    console.log('3. 确保已通过扫码登录微信');
    console.log('4. 确保 Gateway 正在运行 (通常在端口 39280)');
  }
}

// 导出
module.exports = {
  OpenClawILinkClient,
  StigmergyAIIntegration,
  OpenClawWeChatHandler
};

// 如果直接运行
if (require.main === module) {
  exampleUsage().catch(error => {
    console.error('❌ 示例执行失败:', error);
    process.exit(1);
  });
}
