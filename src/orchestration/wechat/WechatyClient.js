/**
 * Wechaty 微信客户端
 * 基于开源 Wechaty 库，支持个人微信
 * 无需企业微信，无需复杂配置
 */

const { Wechaty } = require('wechaty');

class WechatyClient {
  constructor(options = {}) {
    this.bot = null;
    this.name = options.name || 'stigmergy-bot';
    this.qrCode = null;
    this.isLoggedIn = false;
    this.messageHandlers = [];
    this.onLoginCallback = null;
  }

  /**
   * 初始化并启动机器人
   */
  async start() {
    console.log('🤖 启动 Wechaty 机器人...');

    this.bot = new Wechaty({
      name: this.name,
      puppet: 'wechaty-puppet-wechat', // 使用微信协议
    });

    // 监听事件
    this.bot
      .on('scan', this.onScan.bind(this))
      .on('login', this.onLogin.bind(this))
      .on('logout', this.onLogout.bind(this))
      .on('message', this.onMessage.bind(this))
      .on('error', this.onError.bind(this));

    try {
      await this.bot.start();
      console.log('✅ Wechaty 机器人已启动');
    } catch (error) {
      console.error('❌ 启动失败:', error.message);
      throw error;
    }
  }

  /**
   * 扫码事件
   */
  async onScan(qrcode, status) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📱 请扫描二维码登录微信');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 在终端显示 QR code
    const qrcodeTerminal = require('qrcode-terminal');
    qrcodeTerminal.generate(qrcode, { small: true });

    // 保存 QR code URL
    this.qrCode = qrcode;

    console.log('\n提示:');
    console.log('  1. 打开微信，点击右上角 "+" → "扫一扫"');
    console.log('  2. 扫描上方二维码');
    console.log('  3. 在手机上确认登录\n');

    // 同时在浏览器中显示（可选）
    const qrcodeUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
    console.log(`或者访问: ${qrcodeUrl}\n`);
  }

  /**
   * 登录成功事件
   */
  async onLogin(user) {
    console.log('\n✅ 登录成功！');
    console.log(`   用户: ${user.name()}`);
    console.log(`   ID: ${user.id}\n`);

    this.isLoggedIn = true;

    if (this.onLoginCallback) {
      await this.onLoginCallback(user);
    }
  }

  /**
   * 登出事件
   */
  async onLogout(user) {
    console.log(`\n⚠️  用户 ${user.name()} 已登出\n`);
    this.isLoggedIn = false;
  }

  /**
   * 消息事件
   */
  async onMessage(message) {
    const contact = message.talker();
    const text = message.text();
    const room = message.room();

    console.log(`\n📨 收到消息:`);
    console.log(`   来自: ${contact.name()}`);
    if (room) {
      console.log(`   群聊: ${room.topic()}`);
    }
    console.log(`   内容: ${text}`);

    // 调用所有消息处理器
    for (const handler of this.messageHandlers) {
      try {
        await handler(message, this);
      } catch (error) {
        console.error('消息处理器错误:', error.message);
      }
    }
  }

  /**
   * 错误事件
   */
  onError(error) {
    console.error('Wechaty 错误:', error);
  }

  /**
   * 发送文本消息
   */
  async sendText(userId, text) {
    if (!this.isLoggedIn) {
      throw new Error('未登录，请先扫码登录');
    }

    try {
      const contact = await this.bot.Contact.find({ id: userId });
      if (!contact) {
        throw new Error(`找不到联系人: ${userId}`);
      }

      await contact.say(text);
      console.log(`✅ 已发送消息到 ${userId}: ${text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('发送消息失败:', error.message);
      throw error;
    }
  }

  /**
   * 发送图片消息
   */
  async sendImage(userId, imagePath) {
    if (!this.isLoggedIn) {
      throw new Error('未登录，请先扫码登录');
    }

    try {
      const contact = await this.bot.Contact.find({ id: userId });
      if (!contact) {
        throw new Error(`找不到联系人: ${userId}`);
      }

      const fileBox = require('file-box');
      const file = fileBox.fromFile(imagePath);
      await contact.say(file);
      console.log(`✅ 已发送图片到 ${userId}`);
      return true;
    } catch (error) {
      console.error('发送图片失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取所有联系人
   */
  async getContacts() {
    if (!this.isLoggedIn) {
      throw new Error('未登录，请先扫码登录');
    }

    try {
      const contacts = await this.bot.Contact.findAll();
      return contacts.map(contact => ({
        id: contact.id,
        name: contact.name(),
        alias: contact.alias() || '',
        isFriend: contact.friend(),
      }));
    } catch (error) {
      console.error('获取联系人失败:', error.message);
      throw error;
    }
  }

  /**
   * 查找联系人
   */
  async findContact(query) {
    if (!this.isLoggedIn) {
      throw new Error('未登录，请先扫码登录');
    }

    try {
      const contact = await this.bot.Contact.find(query);
      return contact ? {
        id: contact.id,
        name: contact.name(),
        alias: contact.alias() || '',
        isFriend: contact.friend(),
      } : null;
    } catch (error) {
      console.error('查找联系人失败:', error.message);
      throw error;
    }
  }

  /**
   * 添加消息处理器
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * 设置登录回调
   */
  onLoginReady(callback) {
    this.onLoginCallback = callback;
  }

  /**
   * 停止机器人
   */
  async stop() {
    if (this.bot) {
      console.log('\n🛑 停止 Wechaty 机器人...');
      await this.bot.stop();
      console.log('✅ 已停止');
    }
  }

  /**
   * 检查是否已登录
   */
  isReady() {
    return this.isLoggedIn && this.bot && this.bot.isLoggedIn;
  }

  /**
   * 获取机器人信息
   */
  getBotInfo() {
    if (!this.isReady()) {
      return null;
    }

    const user = this.bot.userSelf();
    return {
      id: user.id,
      name: user.name(),
      alias: user.alias() || '',
    };
  }
}

module.exports = WechatyClient;
