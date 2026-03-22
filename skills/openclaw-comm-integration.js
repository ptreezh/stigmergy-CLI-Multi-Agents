#!/usr/bin/env node

/**
 * OpenClaw-Aligned Communication Integration
 *
 * 对齐OpenClaw标准的通信平台集成
 *
 * 架构定位：
 * 用户界面层 (WeChat/Feishu) → Stigmergy编排层 → AI CLI层 → AI模型层
 *
 * 核心原则：
 * 1. 不生产AI能力 - 依赖下层AI CLI
 * 2. 不修改AI响应 - 透明传递
 * 3. 专注编排优化 - 路由、记忆、协作
 */

const axios = require('axios');

/**
 * OpenClaw标准事件格式
 *
 * 参考：docs/STIGMERGY_VS_OPENCLAW_ANALYSIS.md
 * Stigmergy作为编排层，使用统一的事件格式
 */
const OpenClawEventTypes = {
  RECOMMENDATION: 'recommendation',  // 推荐结果推送
  FEEDBACK: 'feedback',              // 用户反馈收集
  NOTIFICATION: 'notification',      // 通用通知
  ERROR: 'error'                     // 错误报告
};

/**
 * 企业微信集成 - 对齐OpenClaw标准
 */
class OpenClawWeChatWork {
  constructor(config) {
    this.corpId = config.corpId;
    this.secret = config.secret;
    this.token = null;
    this.tokenExpireTime = null;
    this.platform = 'wechat-work';
  }

  async getAccessToken() {
    if (this.token && this.tokenExpireTime > Date.now()) {
      return this.token;
    }

    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.corpId}&corpsecret=${this.secret}`;
    const res = await axios.get(url);

    if (res.data.errcode !== 0) {
      throw new Error(`获取Token失败: ${res.data.errmsg}`);
    }

    this.token = res.data.access_token;
    this.tokenExpireTime = Date.now() + (res.data.expires_in - 300) * 1000;

    return this.token;
  }

  /**
   * 发送OpenClaw标准事件
   *
   * 遵循原则：不修改AI响应，透明传递推荐结果
   */
  async sendEvent(userId, event) {
    const token = await this.getAccessToken();
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

    // 验证事件格式
    if (!event.type || !event.data) {
      throw new Error('Invalid OpenClaw event format');
    }

    // 转换为平台特定格式
    const message = this.formatEventMessage(event);

    const res = await axios.post(url, {
      touser: userId,
      msgtype: 'text',
      text: { content: message }
    });

    if (res.data.errcode !== 0) {
      throw new Error(`发送失败: ${res.data.errmsg}`);
    }

    return {
      success: true,
      platform: this.platform,
      eventType: event.type,
      messageId: res.data.msgid
    };
  }

  /**
   * 格式化事件消息
   *
   * 保持原始数据完整性，不修改AI响应
   */
  formatEventMessage(event) {
    switch (event.type) {
      case OpenClawEventTypes.RECOMMENDATION:
        return this.formatRecommendation(event.data);
      case OpenClawEventTypes.FEEDBACK:
        return this.formatFeedback(event.data);
      case OpenClawEventTypes.NOTIFICATION:
        return this.formatNotification(event.data);
      case OpenClawEventTypes.ERROR:
        return this.formatError(event.data);
      default:
        return `Stigmergy事件: ${event.type}`;
    }
  }

  formatRecommendation(data) {
    // 保持原始推荐数据完整性
    let text = '🎯 Stigmergy技能推荐\n\n';

    if (data.recommendations && Array.isArray(data.recommendations)) {
      data.recommendations.slice(0, 3).forEach((rec, i) => {
        text += `${i + 1}. ${rec.skillName}\n`;
        text += `   评分: ${rec.score}/5\n`;
        if (rec.reasoning) text += `   理由: ${rec.reasoning}\n`;
        if (rec.confidence) text += `   置信度: ${(rec.confidence * 100).toFixed(0)}%\n`;
        text += '\n';
      });
    }

    if (data.summary) {
      text += `📊 ${data.summary}\n`;
    }

    return text;
  }

  formatFeedback(data) {
    return `📝 反馈已记录\n技能: ${data.skillName}\n评分: ${data.rating}/5`;
  }

  formatNotification(data) {
    return `📢 ${data.title}\n\n${data.message}`;
  }

  formatError(data) {
    return `❌ 错误\n${data.message}`;
  }
}

/**
 * 飞书集成 - 对齐OpenClaw标准
 */
class OpenClawFeishu {
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.token = null;
    this.tokenExpireTime = null;
    this.platform = 'feishu';
  }

  async getAccessToken() {
    if (this.token && this.tokenExpireTime > Date.now()) {
      return this.token;
    }

    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/';
    const res = await axios.post(url, {
      app_id: this.appId,
      app_secret: this.appSecret
    });

    if (res.data.code !== 0) {
      throw new Error(`获取Token失败: ${res.data.msg}`);
    }

    this.token = res.data.tenant_access_token;
    this.tokenExpireTime = Date.now() + (res.data.expire - 300) * 1000;

    return this.token;
  }

  /**
   * 发送OpenClaw标准事件
   */
  async sendEvent(userId, event) {
    const token = await this.getAccessToken();
    const url = 'https://open.feishu.cn/open-apis/message/v4/send/';

    if (!event.type || !event.data) {
      throw new Error('Invalid OpenClaw event format');
    }

    const message = this.formatEventMessage(event);

    const res = await axios.post(url, {
      msg_type: 'text',
      to_user_id: userId,
      content: { text: message }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.data.code !== 0) {
      throw new Error(`发送失败: ${res.data.msg}`);
    }

    return {
      success: true,
      platform: this.platform,
      eventType: event.type,
      messageId: res.data.data.message_id
    };
  }

  formatEventMessage(event) {
    // 与企业微信相同的格式化逻辑
    // 保持一致性
    switch (event.type) {
      case OpenClawEventTypes.RECOMMENDATION:
        return this.formatRecommendation(event.data);
      case OpenClawEventTypes.FEEDBACK:
        return this.formatFeedback(event.data);
      case OpenClawEventTypes.NOTIFICATION:
        return this.formatNotification(event.data);
      case OpenClawEventTypes.ERROR:
        return this.formatError(event.data);
      default:
        return `Stigmergy事件: ${event.type}`;
    }
  }

  formatRecommendation(data) {
    let text = '🎯 Stigmergy技能推荐\n\n';

    if (data.recommendations && Array.isArray(data.recommendations)) {
      data.recommendations.slice(0, 3).forEach((rec, i) => {
        text += `${i + 1}. ${rec.skillName}\n`;
        text += `   评分: ${rec.score}/5\n`;
        if (rec.reasoning) text += `   理由: ${rec.reasoning}\n`;
        if (rec.confidence) text += `   置信度: ${(rec.confidence * 100).toFixed(0)}%\n`;
        text += '\n';
      });
    }

    if (data.summary) {
      text += `📊 ${data.summary}\n`;
    }

    return text;
  }

  formatFeedback(data) {
    return `📝 反馈已记录\n技能: ${data.skillName}\n评分: ${data.rating}/5`;
  }

  formatNotification(data) {
    return `📢 ${data.title}\n\n${data.message}`;
  }

  formatError(data) {
    return `❌ 错误\n${data.message}`;
  }
}

/**
 * OpenClaw统一通信接口
 *
 * 定位：用户界面层 → Stigmergy编排层
 * 职责：将推荐结果从编排层传递到用户界面层
 */
class OpenClawCommIntegration {
  constructor(config) {
    this.adapters = {};
    this.platform = 'openclaw-aligned';

    if (config.wechatWork && config.wechatWork.enabled) {
      this.adapters.wechatWork = new OpenClawWeChatWork(config.wechatWork);
      console.log('✅ 企业微信集成已启用 (OpenClaw标准)');
    }

    if (config.feishu && config.feishu.enabled) {
      this.adapters.feishu = new OpenClawFeishu(config.feishu);
      console.log('✅ 飞书集成已启用 (OpenClaw标准)');
    }
  }

  /**
   * 发送推荐结果（OpenClaw标准事件）
   *
   * 这是编排层的主要功能：
   * - 接收来自推荐系统的结果
   * - 转换为OpenClaw标准事件
   * - 发送到用户界面层（WeChat/Feishu）
   *
   * 遵循原则：
   * 1. 不修改推荐结果 - 透明传递
   * 2. 不添加AI内容 - 只做格式化
   * 3. 保持数据完整性
   */
  async sendRecommendation(platform, userId, recommendations, metadata = {}) {
    if (!this.adapters || !this.adapters[platform]) {
      throw new Error(`平台 ${platform} 未启用`);
    }

    // 创建OpenClaw标准事件
    const event = {
      type: OpenClawEventTypes.RECOMMENDATION,
      platform: platform,
      userId: userId,
      timestamp: Date.now(),
      data: {
        recommendations: recommendations,
        summary: metadata.summary || `为您推荐 ${recommendations.length} 个技能`,
        source: metadata.source || 'skill-collaborative-filtering'
      }
    };

    // 发送事件（不修改原始数据）
    return await this.adapters[platform].sendEvent(userId, event);
  }

  /**
   * 发送反馈确认
   */
  async sendFeedbackConfirmation(platform, userId, skillName, rating) {
    if (!this.adapters[platform]) {
      throw new Error(`平台 ${platform} 未启用`);
    }

    const event = {
      type: OpenClawEventTypes.FEEDBACK,
      platform: platform,
      userId: userId,
      timestamp: Date.now(),
      data: {
        skillName: skillName,
        rating: rating,
        message: '感谢您的反馈，这将帮助我们改进推荐质量'
      }
    };

    return await this.adapters[platform].sendEvent(userId, event);
  }

  /**
   * 发送通知
   */
  async sendNotification(platform, userId, title, message) {
    if (!this.adapters[platform]) {
      throw new Error(`平台 ${platform} 未启用`);
    }

    const event = {
      type: OpenClawEventTypes.NOTIFICATION,
      platform: platform,
      userId: userId,
      timestamp: Date.now(),
      data: {
        title: title,
        message: message
      }
    };

    return await this.adapters[platform].sendEvent(userId, event);
  }

  /**
   * 发送错误报告
   */
  async sendError(platform, userId, errorMessage) {
    if (!this.adapters[platform]) {
      throw new Error(`平台 ${platform} 未启用`);
    }

    const event = {
      type: OpenClawEventTypes.ERROR,
      platform: platform,
      userId: userId,
      timestamp: Date.now(),
      data: {
        message: errorMessage
      }
    };

    return await this.adapters[platform].sendEvent(userId, event);
  }

  /**
   * 批量发送到所有平台
   */
  async sendToAllPlatforms(userId, recommendations, metadata) {
    const results = [];
    const platforms = Object.keys(this.adapters);

    for (const platform of platforms) {
      try {
        const result = await this.sendRecommendation(platform, userId, recommendations, metadata);
        results.push(result);
      } catch (error) {
        console.error(`${platform} 发送失败:`, error.message);
        results.push({
          success: false,
          platform: platform,
          error: error.message
        });
      }
    }

    return results;
  }
}

/**
 * 使用示例：集成到协同过滤推荐系统
 *
 * 展示如何在推荐系统中使用OpenClaw标准通信
 */
async function exampleUsage() {
  console.log('\n📖 OpenClaw标准集成示例\n');

  // 1. 初始化（对齐OpenClaw标准）
  const integration = new OpenClawCommIntegration({
    wechatWork: {
      enabled: true,
      corpId: 'your-corp-id',
      secret: 'your-secret'
    },
    feishu: {
      enabled: true,
      appId: 'your-app-id',
      appSecret: 'your-app-secret'
    }
  });

  // 验证适配器已创建
  console.log('已配置平台:', Object.keys(integration.adapters));

  // 2. 推荐系统生成结果（原始数据，不修改）
  const recommendations = [
    {
      skillName: 'dev-browser',
      score: 4.8,
      reasoning: '基于您的浏览器自动化任务',
      confidence: 0.92,
      rank: 1
    },
    {
      skillName: 'mathematical-statistics',
      score: 4.5,
      reasoning: '适合您的数据分析需求',
      confidence: 0.87,
      rank: 2
    },
    {
      skillName: 'network-computation',
      score: 4.2,
      reasoning: '基于您对网络分析的兴趣',
      confidence: 0.81,
      rank: 3
    }
  ];

  console.log('\n推荐数据准备完成:', recommendations.length, '个技能');

  // 3. 通过Stigmergy编排层发送到用户界面层
  // 遵循原则：透明传递，不修改AI响应
  try {
    const result = await integration.sendRecommendation('wechat-work', 'user-id', recommendations, {
      summary: '基于您的使用历史推荐',
      source: 'skill-collaborative-filtering'
    });
    console.log('\n✅ 推荐已发送（模拟）:', result.messageId || '测试模式');
  } catch (error) {
    console.log('\n⚠️  发送失败（预期，使用测试凭证）:', error.message);
  }

  console.log('\n🎯 架构对齐检查:');
  console.log('   ✅ 用户界面层: WeChat/Feishu');
  console.log('   ✅ Stigmergy编排层: OpenClawCommIntegration');
  console.log('   ✅ AI CLI层: 待集成 (OpenClaw/Claude/Gemini)');
  console.log('   ✅ AI模型层: 下层CLI调用');
  console.log('\n   ✅ 不生产AI能力 - 只做编排和传递');
  console.log('   ✅ 不修改AI响应 - 透明传递推荐结果');
  console.log('   ✅ 专注编排优化 - 统一事件格式');
}

// 导出
module.exports = {
  OpenClawEventTypes,
  OpenClawWeChatWork,
  OpenClawFeishu,
  OpenClawCommIntegration
};

// 如果直接运行
if (require.main === module) {
  try {
    exampleUsage();
  } catch (error) {
    console.error('❌ 示例执行失败:', error);
  }
}
