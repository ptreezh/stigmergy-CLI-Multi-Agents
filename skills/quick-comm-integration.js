#!/usr/bin/env node

/**
 * Quick Integration for Enterprise WeChat & Feishu
 *
 * 企业微信 & 飞书快速集成
 *
 * 基于Playwright验证结果 - 5-10分钟完成集成
 * 官方文档已验证：真实存在且立即生效
 */

const axios = require('axios');

/**
 * 企业微信快速集成
 */
class QuickWeChatWork {
  constructor(config) {
    this.corpId = config.corpId;
    this.secret = config.secret;
    this.token = null;
    this.tokenExpireTime = null;
  }

  /**
   * 获取Access Token
   */
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
    this.tokenExpireTime = Date.now() + (res.data.expires_in - 300) * 1000; // 提前5分钟过期

    return this.token;
  }

  /**
   * 发送推荐结果
   */
  async sendRecommendation(userId, recommendations) {
    const token = await this.getAccessToken();
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

    const message = this.formatRecommendations(recommendations);

    const res = await axios.post(url, {
      touser: userId,
      msgtype: 'text',
      text: {
        content: message
      }
    });

    if (res.data.errcode !== 0) {
      throw new Error(`发送失败: ${res.data.errmsg}`);
    }

    return { success: true, platform: 'wechat-work', messageId: res.data.msgid };
  }

  /**
   * 格式化推荐消息
   */
  formatRecommendations(recommendations) {
    let text = '🎯 Stigmergy为您推荐以下技能：\n\n';

    recommendations.slice(0, 3).forEach((rec, i) => {
      text += `${i + 1}. ${rec.skillName}\n`;
      text += `   评分: ${rec.score}/5\n`;
      text += `   推荐理由: ${rec.reasoning}\n\n`;
    });

    text += '\n💡 使用建议：根据任务需求选择合适的技能，可以查看详细文档了解更多信息。';

    return text;
  }
}

/**
 * 飞书快速集成
 */
class QuickFeishu {
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.token = null;
    this.tokenExpireTime = null;
  }

  /**
   * 获取Tenant Access Token
   */
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
   * 发送推荐结果
   */
  async sendRecommendation(userId, recommendations) {
    const token = await this.getAccessToken();
    const url = 'https://open.feishu.cn/open-apis/message/v4/send/';

    const message = this.formatRecommendations(recommendations);

    const res = await axios.post(url, {
      msg_type: 'text',
      to_user_id: userId,
      content: {
        text: message
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.data.code !== 0) {
      throw new Error(`发送失败: ${res.data.msg}`);
    }

    return { success: true, platform: 'feishu', messageId: res.data.data.message_id };
  }

  /**
   * 格式化推荐消息
   */
  formatRecommendations(recommendations) {
    let text = '🎯 Stigmergy为您推荐以下技能：\n\n';

    recommendations.slice(0, 3).forEach((rec, i) => {
      text += `${i + 1}. ${rec.skillName}\n`;
      text += `   评分: ${rec.score}/5\n`;
      text += `   推荐理由: ${rec.reasoning}\n\n`;
    });

    text += '\n💡 使用建议：根据任务需求选择合适的技能，可以查看详细文档了解更多信息。';

    return text;
  }
}

/**
 * 统一快速集成接口
 */
class QuickCommIntegration {
  constructor(config) {
    this.wechatWork = null;
    this.feishu = null;

    if (config.wechatWork && config.wechatWork.enabled) {
      this.wechatWork = new QuickWeChatWork(config.wechatWork);
      console.log('✅ 企业微信集成已启用');
    }

    if (config.feishu && config.feishu.enabled) {
      this.feishu = new QuickFeishu(config.feishu);
      console.log('✅ 飞书集成已启用');
    }
  }

  /**
   * 发送推荐（自动选择平台）
   */
  async sendRecommendation(platform, userId, recommendations) {
    if (platform === 'wechat-work') {
      if (!this.wechatWork) {
        throw new Error('企业微信未启用');
      }
      return await this.wechatWork.sendRecommendation(userId, recommendations);
    } else if (platform === 'feishu') {
      if (!this.feishu) {
        throw new Error('飞书未启用');
      }
      return await this.feishu.sendRecommendation(userId, recommendations);
    } else {
      throw new Error(`不支持的平台: ${platform}`);
    }
  }

  /**
   * 批量发送（多平台）
   */
  async sendToAllPlatforms(userId, recommendations) {
    const results = [];

    if (this.wechatWork) {
      try {
        const result = await this.wechatWork.sendRecommendation(userId, recommendations);
        results.push(result);
      } catch (error) {
        console.error('企业微信发送失败:', error.message);
        results.push({ success: false, platform: 'wechat-work', error: error.message });
      }
    }

    if (this.feishu) {
      try {
        const result = await this.feishu.sendRecommendation(userId, recommendations);
        results.push(result);
      } catch (error) {
        console.error('飞书发送失败:', error.message);
        results.push({ success: false, platform: 'feishu', error: error.message });
      }
    }

    return results;
  }
}

/**
 * 快速设置向导
 */
async function quickSetup() {
  console.log('\n🚀 企业微信/飞书快速设置向导\n');
  console.log('=' .repeat(70));

  console.log('\n📱 步骤1: 选择平台');
  console.log('   [1] 企业微信（推荐，5分钟）');
  console.log('   [2] 飞书（推荐，5分钟）');
  console.log('   [3] 两者都要');
  console.log('   [0] 退出');

  // 这里应该用inquirer，简化处理
  console.log('\n💡 提示：请在代码中配置你的凭证\n');

  const config = {
    wechatWork: {
      enabled: false,
      corpId: 'your-corp-id',
      secret: 'your-secret'
    },
    feishu: {
      enabled: false,
      appId: 'your-app-id',
      appSecret: 'your-app-secret'
    }
  };

  console.log('\n📖 配置说明：\n');

  console.log('\n【企业微信配置】');
  console.log('   1. 访问: https://work.weixin.qq.com/');
  console.log('   2. 登录企业微信管理后台');
  console.log('   3. 应用管理 → 自建 → 创建应用');
  console.log('   4. 查看Secret（立即显示）');
  console.log('   5. 记录CorpID和Secret\n');

  console.log('【飞书配置】');
  console.log('   1. 访问: https://open.feishu.cn/');
  console.log('   2. 创建企业自建应用');
  console.log('   3. 获取App ID和App Secret');
  console.log('   4. 申请权限（自动通过）');
  console.log('   5. 发布到企业（立即生效）\n');

  return config;
}

/**
 * 测试示例
 */
async function testExample() {
  console.log('\n🧪 快速集成测试示例\n');

  // 示例配置（需要替换为真实凭证）
  const config = {
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
  };

  const integration = new QuickCommIntegration(config);

  // 模拟推荐数据
  const recommendations = [
    {
      skillName: 'dev-browser',
      score: 4.8,
      reasoning: '基于您最近的浏览器自动化任务，此技能可以帮助您进行Web自动化测试和数据抓取'
    },
    {
      skillName: 'mathematical-statistics',
      score: 4.5,
      reasoning: '适合您的数据分析需求，提供完整的描述统计、推断统计和回归分析功能'
    },
    {
      skillName: 'network-computation',
      score: 4.2,
      reasoning: '基于您对网络分析的兴趣，提供中心性计算、社区检测和网络可视化'
    }
  ];

  console.log('📝 推荐数据准备完成');
  console.log(`   技能数量: ${recommendations.length}`);
  console.log(`   平均评分: ${(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length).toFixed(1)}/5\n`);

  // 发送到企业微信
  try {
    console.log('📤 发送到企业微信...');
    const result = await integration.sendRecommendation('wechat-work', 'test-user-id', recommendations);
    console.log('   ✅ 发送成功:', result.messageId);
  } catch (error) {
    console.log('   ⚠️  发送失败（预期，因为使用测试凭证）:', error.message);
  }

  // 发送到飞书
  try {
    console.log('\n📤 发送到飞书...');
    const result = await integration.sendRecommendation('feishu', 'test-user-id', recommendations);
    console.log('   ✅ 发送成功:', result.messageId);
  } catch (error) {
    console.log('   ⚠️  发送失败（预期，因为使用测试凭证）:', error.message);
  }
}

// 导出
module.exports = {
  QuickWeChatWork,
  QuickFeishu,
  QuickCommIntegration,
  quickSetup,
  testExample
};

// 如果直接运行
if (require.main === module) {
  (async () => {
    try {
      await testExample();
    } catch (error) {
      console.error('❌ 测试失败:', error);
    }
  })();
}
