/**
 * Platform Adapters - 统一适配器接口
 */

const { FeishuAdapter } = require("./feishu");
const { TelegramAdapter } = require("./telegram");
const { SlackAdapter } = require("./slack");
const { DiscordAdapter } = require("./discord");

class PlatformAdapter {
  constructor(config = {}) {
    this.config = config;
    this.adapters = {};

    this.initAdapters(config);
  }

  /**
   * 初始化各平台适配器
   */
  initAdapters(config) {
    if (config.feishu?.enabled) {
      this.adapters.feishu = new FeishuAdapter(config.feishu);
    }

    if (config.telegram?.enabled) {
      this.adapters.telegram = new TelegramAdapter(config.telegram);
    }

    if (config.slack?.enabled) {
      this.adapters.slack = new SlackAdapter(config.slack);
    }

    if (config.discord?.enabled) {
      this.adapters.discord = new DiscordAdapter(config.discord);
    }
  }

  /**
   * 获取指定平台的适配器
   */
  getAdapter(platform) {
    const name = platform.toLowerCase();

    if (name === "feishu" && this.adapters.feishu) {
      return { adapter: this.adapters.feishu, config: this.config.feishu };
    }

    if (name === "telegram" && this.adapters.telegram) {
      return { adapter: this.adapters.telegram, config: this.config.telegram };
    }

    if (name === "slack" && this.adapters.slack) {
      return { adapter: this.adapters.slack, config: this.config.slack };
    }

    if (name === "discord" && this.adapters.discord) {
      return { adapter: this.adapters.discord, config: this.config.discord };
    }

    return { adapter: null, config: null };
  }

  /**
   * 解析消息
   */
  parse(platform, raw) {
    const { adapter } = this.getAdapter(platform);
    if (!adapter) {
      return { text: "", userId: "unknown", platform };
    }
    return adapter.parse(raw);
  }

  /**
   * 格式化结果
   */
  format(platform, result) {
    const { adapter } = this.getAdapter(platform);
    if (!adapter) {
      return { error: "Adapter not found" };
    }
    return adapter.format(result);
  }

  /**
   * 发送消息
   */
  async send(platform, result) {
    const { adapter } = this.getAdapter(platform);
    if (!adapter) {
      return { success: false, error: "Adapter not found or not enabled" };
    }
    return await adapter.send(result);
  }

  /**
   * 获取所有启用的平台
   */
  getEnabledPlatforms() {
    return Object.keys(this.adapters).filter((p) => this.adapters[p]);
  }

  /**
   * 检查平台是否已启用
   */
  isEnabled(platform) {
    const { adapter } = this.getAdapter(platform);
    return !!adapter;
  }
}

module.exports = {
  PlatformAdapter,
  FeishuAdapter,
  TelegramAdapter,
  SlackAdapter,
  DiscordAdapter,
};
