#!/usr/bin/env node

/**
 * Claude CLI 微信/飞书集成 - 实际可用的实现方案
 *
 * 基于Playwright验证的官方方案：
 * - 企业微信"自建应用" (5-10分钟)
 * - 飞书"企业自建应用" (5-10分钟)
 *
 * 架构：用户 → 企业微信/飞书 → Webhook → Stigmergy → Claude CLI → 返回
 */

const { exec } = require('child_process');
const http = require('http');

/**
 * 企业微信 + Claude CLI 集成
 */
class WeChatWorkClaudeIntegration {
  constructor(config) {
    this.corpId = config.corpId;
    this.secret = config.secret;
    this.token = null;
    this.tokenExpireTime = null;
    this.platform = 'wechat-work';
  }

  /**
   * 获取Access Token
   */
  async getAccessToken() {
    if (this.token && this.tokenExpireTime > Date.now()) {
      return this.token;
    }

    const https = require('https');
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.corpId}&corpsecret=${this.secret}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.errcode !== 0) {
            reject(new Error(result.errmsg));
          } else {
            this.token = result.access_token;
            this.tokenExpireTime = Date.now() + (result.expires_in - 300) * 1000;
            resolve(this.token);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * 调用Claude CLI
   */
  async callClaudeCLI(userMessage, context = {}) {
    return new Promise((resolve, reject) => {
      // 构建Claude CLI命令
      let command = 'claude';

      // 如果有context，添加到命令中
      if (context.projectPath) {
        command += ` --cwd ${context.projectPath}`;
      }

      // 添加用户消息
      command += ` "${userMessage}"`;

      console.log(`🤖 调用Claude CLI: ${command}`);

      exec(command, {
        cwd: context.cwd || process.cwd(),
        timeout: 60000 // 60秒超时
      }, (error, stdout, stderr) => {
        if (error) {
          // 如果是kill信号，可能是因为超时或其他原因
          if (error.killed) {
            reject(new Error('Claude CLI执行被终止'));
          } else {
            reject(error);
          }
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * 处理用户消息（通过Webhook）
   */
  async handleUserMessage(userId, userMessage, context = {}) {
    try {
      console.log(`\n📨 收到用户 ${userId} 的消息: ${userMessage}`);

      // 1. 调用Claude CLI处理
      console.log('🤖 正在调用Claude CLI...');
      const claudeResponse = await this.callClaudeCLI(userMessage, context);

      console.log('✅ Claude CLI响应成功');
      console.log(`   响应长度: ${claudeResponse.length} 字符`);

      // 2. 发送回复给用户
      const token = await this.getAccessToken();
      const https = require('https');

      const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

      const postData = JSON.stringify({
        touser: userId,
        msgtype: 'text',
        text: {
          content: claudeResponse
        }
      });

      return new Promise((resolve, reject) => {
        const req = https.request(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const result = JSON.parse(data);
            if (result.errcode !== 0) {
              reject(new Error(result.errmsg));
            } else {
              resolve({
                success: true,
                messageId: result.msgid,
                platform: 'wechat-work'
              });
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

    } catch (error) {
      console.error('❌ 处理失败:', error);

      // 返回错误消息给用户
      try {
        const token = await this.getAccessToken();
        const https = require('https');
        const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

        const postData = JSON.stringify({
          touser: userId,
          msgtype: 'text',
          text: {
            content: `抱歉，处理您的请求时出错：${error.message}`
          }
        });

        return new Promise((resolve, reject) => {
          const req = https.request(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              const result = JSON.parse(data);
              resolve({ success: result.errcode === 0 });
            });
          });

          req.on('error', () => resolve({ success: false }));
          req.write(postData);
          req.end();
        });
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  }
}

/**
 * 飞书 + Claude CLI 集成
 */
class FeishuClaudeIntegration {
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.token = null;
    this.tokenExpireTime = null;
    this.platform = 'feishu';
  }

  /**
   * 获取Tenant Access Token
   */
  async getAccessToken() {
    if (this.token && this.tokenExpireTime > Date.now()) {
      return this.token;
    }

    const https = require('https');
    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/';

    return new Promise((resolve, reject) => {
      const req = https.request(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.code !== 0) {
            reject(new Error(result.msg));
          } else {
            this.token = result.tenant_access_token;
            this.tokenExpireTime = Date.now() + (result.expire - 300) * 1000;
            resolve(this.token);
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret
      }));
      req.end();
    });
  }

  /**
   * 调用Claude CLI（与企业微信相同的逻辑）
   */
  async callClaudeCLI(userMessage, context = {}) {
    return new Promise((resolve, reject) => {
      let command = 'claude';

      if (context.projectPath) {
        command += ` --cwd ${context.projectPath}`;
      }

      command += ` "${userMessage}"`;

      console.log(`🤖 调用Claude CLI: ${command}`);

      exec(command, {
        cwd: context.cwd || process.cwd(),
        timeout: 60000
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Claude CLI执行被终止'));
          } else {
            reject(error);
          }
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * 处理用户消息
   */
  async handleUserMessage(userId, userMessage, context = {}) {
    try {
      console.log(`\n📨 收到用户 ${userId} 的消息: ${userMessage}`);

      const claudeResponse = await this.callClaudeCLI(userMessage, context);

      console.log('✅ Claude CLI响应成功');
      console.log(`   响应长度: ${claudeResponse.length} 字符`);

      const token = await this.getAccessToken();
      const https = require('https');
      const url = 'https://open.feishu.cn/open-apis/message/v4/send/';

      const postData = JSON.stringify({
        msg_type: 'text',
        to_user_id: userId,
        content: {
          text: claudeResponse
        }
      });

      return new Promise((resolve, reject) => {
        const req = https.request(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const result = JSON.parse(data);
            if (result.code !== 0) {
              reject(new Error(result.msg));
            } else {
              resolve({
                success: true,
                messageId: result.data.message_id,
                platform: 'feishu'
              });
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

    } catch (error) {
      console.error('❌ 处理失败:', error);

      try {
        const token = await this.getAccessToken();
        const https = require('https');
        const url = 'https://open.feishu.cn/open-apis/message/v4/send/';

        const postData = JSON.stringify({
          msg_type: 'text',
          to_user_id: userId,
          content: {
            text: `抱歉，处理您的请求时出错：${error.message}`
          }
        });

        return new Promise((resolve, reject) => {
          const req = https.request(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              const result = JSON.parse(data);
              resolve({ success: result.code === 0 });
            });
          });

          req.on('error', () => resolve({ success: false }));
          req.write(postData);
          req.end();
        });
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  }
}

/**
 * Webhook服务器 - 接收企业微信/飞书的消息
 */
class WebhookServer {
  constructor(integrations) {
    this.integrations = integrations;
    this.port = process.env.PORT || 3000;
  }

  /**
   * 解析企业微信消息
   */
  parseWeChatWorkMessage(body) {
    // 企业微信消息格式
    return {
      userId: body.FromUserName,
      agentId: body.ToUserName,
      messageType: body.MsgType,
      content: body.Content,
      timestamp: body.CreateTime
    };
  }

  /**
   * 解析飞书消息
   */
  parseFeishuMessage(body) {
    // 飞书消息格式（简化）
    return {
      userId: body.event.user_id,
      messageType: body.event.type,
      content: body.event.text,
      timestamp: body.event.create_time
    };
  }

  /**
   * 处理企业微信Webhook
   */
  async handleWeChatWork(req, res) {
    try {
      let body = '';

      req.on('data', chunk => body += chunk);

      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          const parsed = this.parseWeChatWorkMessage(message);

          console.log('\n📨 企业微信消息:');
          console.log('   用户ID:', parsed.userId);
          console.log('   消息类型:', parsed.messageType);
          console.log('   内容:', parsed.content);

          // 如果是文本消息，调用Claude CLI
          if (parsed.messageType === 'text') {
            const integration = this.integrations['wechat-work'];
            if (integration) {
              const result = await integration.handleUserMessage(
                parsed.userId,
                parsed.content,
                { cwd: process.cwd() }
              );

              console.log('   处理结果:', result.success ? '✅ 成功' : '❌ 失败');
            }
          }

          // 返回成功响应
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: 0, message: 'success' }));

        } catch (error) {
          console.error('❌ 处理企业微信消息失败:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ code: -1, message: error.message }));
        }
      });

    } catch (error) {
      console.error('❌ 解析企业微信消息失败:', error);
      res.writeHead(400);
      res.end('Invalid request');
    }
  }

  /**
   * 处理飞书Webhook
   */
  async handleFeishu(req, res) {
    try {
      let body = '';

      req.on('data', chunk => body += chunk);

      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          const parsed = this.parseFeishuMessage(message);

          console.log('\n📨 飞书消息:');
          console.log('   用户ID:', parsed.userId);
          console.log('   消息类型:', parsed.messageType);
          console.log('   内容:', parsed.content);

          // 如果是文本消息，调用Claude CLI
          if (parsed.content) {
            const integration = this.integrations['feishu'];
            if (integration) {
              const result = await integration.handleUserMessage(
                parsed.userId,
                parsed.content,
                { cwd: process.cwd() }
              );

              console.log('   处理结果:', result.success ? '✅ 成功' : '❌ 失败');
            }
          }

          // 返回成功响应
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: 0, data: { success: true } }));

        } catch (error) {
          console.error('❌ 处理飞书消息失败:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ code: -1, message: error.message }));
        }
      });

    } catch (error) {
      console.error('❌ 解析飞书消息失败:', error);
      res.writeHead(400);
      res.end('Invalid request');
    }
  }

  /**
   * 启动Webhook服务器
   */
  start() {
    const http = require('http');

    const server = http.createServer((req, res) => {
      if (req.url === '/webhook/wechat' && req.method === 'POST') {
        this.handleWeChatWork(req, res);
      } else if (req.url === '/webhook/feishu' && req.method === 'POST') {
        this.handleFeishu(req, res);
      } else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          integrations: Object.keys(this.integrations),
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(this.port, () => {
      console.log('\n🚀 Webhook服务器已启动');
      console.log(`   监听端口: ${this.port}`);
      console.log(`   企业微信Webhook: http://your-domain:${this.port}/webhook/wechat`);
      console.log(`   飞书Webhook: http://your-domain:${this.port}/webhook/feishu`);
      console.log(`   健康检查: http://localhost:${this.port}/health`);
      console.log('\n💡 提示：需要配置企业微信/飞书的回调URL到公网地址');
    });

    return server;
  }
}

/**
 * 使用示例
 */
function exampleUsage() {
  console.log('\n📖 使用示例\n');

  // 配置企业微信集成
  const wechatWorkIntegration = new WeChatWorkClaudeIntegration({
    corpId: 'your-corp-id',
    secret: 'your-secret'
  });

  // 配置飞书集成
  const feishuIntegration = new FeishuClaudeIntegration({
    appId: 'your-app-id',
    appSecret: 'your-app-secret'
  });

  // 创建Webhook服务器
  const webhookServer = new WebhookServer({
    'wechat-work': wechatWorkIntegration,
    'feishu': feishuIntegration
  });

  // 启动服务器
  webhookServer.start();

  console.log('\n📝 配置步骤:');
  console.log('\n【企业微信】');
  console.log('1. 访问 https://work.weixin.qq.com/');
  console.log('2. 应用管理 → 自建 → 创建应用');
  console.log('3. 配置接收消息URL: http://your-domain:3000/webhook/wechat');
  console.log('4. 保存Secret和CorpID');

  console.log('\n【飞书】');
  console.log('1. 访问 https://open.feishu.cn/');
  console.log('2. 创建企业自建应用');
  console.log('3. 事件订阅 → 添加消息接收事件');
  console.log('4. 配置请求URL: http://your-domain:3000/webhook/feishu');
  console.log('5. 保存App ID和App Secret');

  console.log('\n【Claude CLI】');
  console.log('1. 确保已安装Claude CLI');
  console.log('2. 测试运行: claude "hello"');
  console.log('3. 确保可以正常调用');

  console.log('\n✅ 配置完成后，用户可以通过微信/飞书直接使用Claude CLI！');
}

// 导出
module.exports = {
  WeChatWorkClaudeIntegration,
  FeishuClaudeIntegration,
  WebhookServer
};

// 如果直接运行
if (require.main === module) {
  try {
    exampleUsage();
  } catch (error) {
    console.error('❌ 示例执行失败:', error);
    console.log('\n💡 提示：需要先配置企业微信/飞书和Claude CLI');
  }
}
