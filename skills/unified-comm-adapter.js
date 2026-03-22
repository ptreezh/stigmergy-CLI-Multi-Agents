#!/usr/bin/env node

/**
 * Unified Communication Platform Adapter
 *
 * 统一通信平台适配器 - 降低Stigmergy与通信工具的对接门槛
 *
 * 支持平台：
 * - 微信（公众号/小程序/企业微信）
 * - 飞书（Lark）
 * - 钉钉
 *
 * 核心功能：
 * - 统一的消息接口
 * - 零配置或低配置接入
 * - 自动适配不同平台
 * - Webhook回调处理
 *
 * 使用场景：
 * - Stigmergy推荐结果推送
 * - Skill使用反馈收集
 * - 实时通知和提醒
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

/**
 * 统一通信平台适配器
 */
class UnifiedCommAdapter {
  constructor(config = {}) {
    this.platforms = {
      wechat: {
        enabled: config.wechat?.enabled || false,
        config: config.wechat,
        adapter: new WeChatAdapter(config.wechat)
      },
      feishu: {
        enabled: config.feishu?.enabled || false,
        config: config.feishu,
        adapter: new FeishuAdapter(config.feishu)
      },
      dingtalk: {
        enabled: config.dingtalk?.enabled || false,
        config: config.dingtalk,
        adapter: new DingTalkAdapter(config.dingtalk)
      }
    };

    console.log('📱 统一通信平台适配器初始化');
    console.log('   已配置平台:', Object.keys(this.platforms).filter(p => this.platforms[p].enabled));
  }

  /**
   * 发送推荐结果
   */
  async sendRecommendation(platform, userId, recommendations) {
    if (!this.platforms[platform] || !this.platforms[platform].enabled) {
      throw new Error(`平台 ${platform} 未启用或未配置`);
    }

    const adapter = this.platforms[platform].adapter;
    return await adapter.sendRecommendation(userId, recommendations);
  }

  /**
   * 收集使用反馈
   */
  async collectFeedback(platform, userId, skillName, feedback) {
    if (!this.platforms[platform] || !this.platforms[platform].enabled) {
      throw new Error(`平台 ${platform} 未启用或未配置`);
    }

    const adapter = this.platforms[platform].adapter;
    return await adapter.collectFeedback(userId, skillName, feedback);
  }

  /**
   * 处理Webhook回调
   */
  async handleWebhook(platform, req, res) {
    if (!this.platforms[platform] || !this.platforms[platform].enabled) {
      throw new Error(`平台 ${platform} 未启用或未配置`);
    }

    const adapter = this.platforms[platform].adapter;
    return await adapter.handleWebhook(req, res);
  }

  /**
   * 生成配置页面
   */
  generateConfigPage() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Stigmergy 通信平台配置</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .platform { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .platform h2 { color: #333; }
    .config-item { margin: 10px 0; }
    .config-item label { display: block; font-weight: bold; margin-bottom: 5px; }
    .config-item input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .config-item .help { font-size: 12px; color: #666; margin-top: 5px; }
    .button { background: #1890ff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    .button:hover { background: #096dd9; }
  </style>
</head>
<body>
  <h1>🚀 Stigmergy 通信平台配置</h1>
  <p>配置你的通信平台接入，零接收Stigmergy的智能推荐和skill使用反馈。</p>

  <form action="/api/configure" method="POST">

    <!-- 微信配置 -->
    <div class="platform">
      <h2>📱 微信</h2>
      <div class="config-item">
        <label>启用微信</label>
        <input type="checkbox" name="wechat_enabled" />
      </div>
      <div class="config-item">
        <label>AppID</label>
        <input type="text" name="wechat_appid" placeholder="wxXXXXXXXXXXXXXXXX" />
        <div class="help">在微信公众平台获取</div>
      </div>
      <div class="config-item">
        <label>AppSecret</label>
        <input type="password" name="wechat_secret" placeholder="XXXXXXXXXXXXXXXX" />
        <div class="help">在微信公众平台获取</div>
      </div>
    </div>

    <!-- 飞书配置 -->
    <div class="platform">
      <h2>🎯 飞书（Lark）</h2>
      <div class="config-item">
        <label>启用飞书</label>
        <input type="checkbox" name="feishu_enabled" />
      </div>
      <div class="config-item">
        <label>App ID</label>
        <input type="text" name="feishu_app_id" placeholder="cli_xxxxxxxxxxxxx" />
        <div class="help">在飞书开放平台获取</div>
      </div>
      <div class="config-item">
        <label>App Secret</label>
        <input type="password" name="feishu_app_secret" placeholder="XXXXXXXXXXXXXXXX" />
        <div class="help">在飞书开放平台获取</div>
      </div>
      <div class="config-item">
        <label>Encrypt Key</label>
        <input type="text" name="feishu_encrypt_key" placeholder="XXXXXXXXXXXXXXXX" />
        <div class="help">用于事件回调加密</div>
      </div>
      <div class="config-item">
        <label>Verification Token</label>
        <input type="text" name="feishu_verify_token" placeholder="XXXXXXXXXXXXXXXX" />
        <div class="help">用于验证Webhook</div>
      </div>
    </div>

    <!-- 钉钉配置 -->
    <div class="platform">
      <h2>💼 钉钉</h2>
      <div class="config-item">
        <label>启用钉钉</label>
        <input type="checkbox" name="dingtalk_enabled" />
      </div>
      <div class="config-item">
        <label>AppKey</label>
        <input type="text" name="dingtalk_appkey" placeholder="dingXXXXXXXXXXXXXXXX" />
        <div class="help">在钉钉开放平台获取</div>
      </div>
      <div class="config-item">
        <label>AppSecret</label>
        <input type="password" name="dingtalk_appsecret" placeholder="XXXXXXXXXXXXXXXX" />
        <div class="help">在钉钉开放平台获取</div>
      </div>
    </div>

    <button type="submit" class="button">保存配置</button>
  </form>

  <h2>📖 接入指南</h2>

  <h3>微信接入步骤</h3>
  <ol>
    <li>访问 <a href="https://open.weixin.qq.com/" target="_blank">微信公众平台</a></li>
    <li>注册并创建公众号/小程序</li>
    <li>获取AppID和AppSecret</li>
    <li>配置服务器地址（URL）</li>
    <li>启用消息接收功能</li>
  </ol>

  <h3>飞书接入步骤</h3>
  <ol>
    <li>访问 <a href="https://open.feishu.cn/document" target="_blank">飞书开放平台</a></li>
    <li>创建自建应用</li>
    <li>获取App ID和App Secret</li>
    <li>配置事件订阅和回调地址</li>
    <li>开启机器人能力</li>
  </ol>

  <h3>钉钉接入步骤</h3>
  <ol>
    <li>访问 <a href="https://open.dingtalk.com/" target="_blank">钉钉开放平台</a></li>
    <li>创建企业内部应用</li>
    <li>获取AppKey和AppSecret</li>
    <li>配置消息接收地址</li>
    <li>订阅机器人事件</li>
  </ol>

</body>
</html>
    `;
  }
}

/**
 * 微信适配器
 */
class WeChatAdapter {
  constructor(config) {
    this.appId = config?.appId;
    this.appSecret = config?.appSecret;
    this.token = null;
  }

  async getAccessToken() {
    // 实现微信access_token获取逻辑
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.errcode) {
              reject(new Error(result.errmsg));
            } else {
              resolve(result.access_token);
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  async sendRecommendation(userId, recommendations) {
    // 实现微信消息发送逻辑
    const message = this.formatRecommendationMessage(recommendations);

    // TODO: 调用微信发送消息API
    console.log(`[微信] 发送推荐给用户 ${userId}:`, message);

    return { success: true, platform: 'wechat' };
  }

  formatRecommendationMessage(recommendations) {
    const top3 = recommendations.slice(0, 3);
    let message = '🎯 Stigmergy为您推荐以下技能：\n\n';

    top3.forEach((rec, i) => {
      message += `${i + 1}. ${rec.skillName}\n`;
      message += `   评分: ${rec.score}/5\n`;
      message += `   推荐理由: ${rec.reasoning}\n\n`;
    });

    return message;
  }

  async handleWebhook(req, res) {
    // 处理微信回调
    console.log('[微信] 收到Webhook');
    res.end('success');
  }
}

/**
 * 飞书适配器
 */
class FeishuAdapter {
  constructor(config) {
    this.appId = config?.appId;
    this.appSecret = config?.appSecret;
    this.encryptKey = config?.encryptKey;
    this.verifyToken = config?.verifyToken;
  }

  async getTenantAccessToken() {
    // 实现飞书tenant_access_token获取逻辑
    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.code) {
              reject(new Error(result.msg));
            } else {
              resolve(result.tenant_access_token);
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);

      req.write(JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret
      }));
      req.end();
    });
  }

  async sendRecommendation(userId, recommendations) {
    // 实现飞书消息发送逻辑
    const message = this.formatRecommendationMessage(recommendations);

    // TODO: 调用飞书发送消息API
    console.log(`[飞书] 发送推荐给用户 ${userId}:`, message);

    return { success: true, platform: 'feishu' };
  }

  formatRecommendationMessage(recommendations) {
    const card = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: '🎯 Stigmergy技能推荐'
          },
          template: 'blue'
        },
        elements: []
      }
    };

    recommendations.slice(0, 3).forEach(rec => {
      card.card.elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**${rec.skillName}**\n评分: ${rec.score}/5\n${rec.reasoning}`
        }
      });
    });

    return card;
  }

  async handleWebhook(req, res) {
    // 处理飞书事件回调
    console.log('[飞书] 收到Webhook');

    const challenge = req.query.challenge;
    if (challenge) {
      res.end(challenge);
      return;
    }

    // 处理其他事件...
    res.end('success');
  }

  async collectFeedback(userId, skillName, feedback) {
    // 收集反馈
    console.log(`[飞书] 收集反馈: ${userId} - ${skillName}`);
    return { success: true };
  }
}

/**
 * 钉钉适配器
 */
class DingTalkAdapter {
  constructor(config) {
    this.appKey = config?.appKey;
    this.appSecret = config?.appSecret;
  }

  async getAccessToken() {
    // 实现钉钉access_token获取逻辑
    const url = `https://oapi.dingtalk.com/gettoken?appkey=${this.appKey}&appsecret=${this.appSecret}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.errcode) {
              reject(new Error(result.errmsg));
            } else {
              resolve(result.access_token);
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  async sendRecommendation(userId, recommendations) {
    // 实现钉钉消息发送逻辑
    const message = this.formatRecommendationMessage(recommendations);

    // TODO: 调用钉钉发送消息API
    console.log(`[钉钉] 发送推荐给用户 ${userId}:`, message);

    return { success: true, platform: 'dingtalk' };
  }

  formatRecommendationMessage(recommendations) {
    const card = {
      msgtype: 'markdown',
      markdown: {
        title: '🎯 Stigmergy技能推荐',
        text: this.formatMarkdown(recommendations)
      }
    };

    return card;
  }

  formatMarkdown(recommendations) {
    let markdown = '### Stigmergy为您推荐以下技能：\n\n';

    recommendations.slice(0, 3).forEach((rec, i) => {
      markdown += `#### ${i + 1}. ${rec.skillName}\n`;
      markdown += `**评分**: ${rec.score}/5\n`;
      markdown += `**推荐理由**: ${rec.reasoning}\n\n`;
    });

    return markdown;
  }

  async handleWebhook(req, res) {
    // 处理钉钉回调
    console.log('[钉钉] 收到Webhook');
    res.end('success');
  }

  async collectFeedback(userId, skillName, feedback) {
    // 收集反馈
    console.log(`[钉钉] 收集反馈: ${userId} - ${skillName}`);
    return { success: true };
  }
}

module.exports = UnifiedCommAdapter;
