/**
 * Message Parser - 消息解析器
 * 解析各平台消息格式，提取纯文本和用户信息
 */

class MessageParser {
  /**
   * 解析各平台消息格式
   * @param {string} platform - 平台名称
   * @param {object} rawMessage - 原始消息
   * @returns {object} 解析后的消息
   */
  parse(platform, rawMessage) {
    switch (platform) {
      case "feishu":
        return this.parseFeishu(rawMessage);
      case "telegram":
        return this.parseTelegram(rawMessage);
      case "slack":
        return this.parseSlack(rawMessage);
      case "discord":
        return this.parseDiscord(rawMessage);
      default:
        return this.parseGeneric(rawMessage);
    }
  }

  /**
   * 解析飞书消息
   */
  parseFeishu(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    let text = data.content?.text || data.text || data.message || "";
    text = text.replace(/@[^\s]+/g, "").trim();
    return {
      text,
      userId: data.sender?.user_id || data.user_id || "unknown",
      msgId: data.msg_id || data.message_id || Date.now().toString(),
      platform: "feishu",
    };
  }

  /**
   * 解析 Telegram 消息
   */
  parseTelegram(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const message = data.message || data;
    let text = message?.text || message?.caption || "";
    return {
      text,
      userId: message?.from?.id || message?.from?.username || "unknown",
      chatId: message?.chat?.id || "",
      msgId: message?.message_id || Date.now().toString(),
      platform: "telegram",
    };
  }

  /**
   * 解析 Slack 消息
   */
  parseSlack(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    let text = data.text || data.event?.text || "";
    return {
      text,
      userId: data.user_id || data.event?.user || "unknown",
      channel: data.channel_id || data.event?.channel || "",
      msgId: data.event_id || data.message_ts || Date.now().toString(),
      platform: "slack",
    };
  }

  /**
   * 解析 Discord 消息
   */
  parseDiscord(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    let text = data.content || "";
    return {
      text,
      userId: data.author?.id || "unknown",
      channelId: data.channel_id || "",
      guildId: data.guild_id || "",
      msgId: data.id || Date.now().toString(),
      platform: "discord",
    };
  }

  /**
   * 通用解析
   */
  parseGeneric(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      text: data.text || data.content || data.message || "",
      userId: "unknown",
      msgId: Date.now().toString(),
      platform: "generic",
    };
  }

  /**
   * 识别命令意图
   * @param {string} text - 消息文本
   * @returns {string} 意图类型
   */
  recognizeIntent(text) {
    const trimmed = text.trim();

    if (/^(concurrent|parallel)\s+/i.test(trimmed)) {
      return "concurrent";
    }

    if (/^ask\s+\w+\s+/i.test(trimmed)) {
      return "ask";
    }

    if (/^statu[ss]?\s*(\?)?$/i.test(trimmed)) {
      return "status";
    }

    if (/^stop\s*(\?)?$/i.test(trimmed)) {
      return "stop";
    }

    if (/^help\s*(\?)?$/i.test(trimmed)) {
      return "help";
    }

    return "route";
  }

  /**
   * 提取任务文本
   * @param {string} text - 原始文本
   * @param {string} intent - 意图类型
   * @returns {string} 任务文本
   */
  extractTask(text, intent) {
    const trimmed = text.trim();

    switch (intent) {
      case "concurrent":
      case "parallel":
        return trimmed.replace(/^(concurrent|parallel)\s+/i, "").trim();
      case "ask":
        return trimmed.replace(/^ask\s+\w+\s+/i, "").trim();
      case "status":
      case "stop":
      case "help":
        return "";
      default:
        return trimmed;
    }
  }

  /**
   * 提取 CLI 名称 (用于 ask 命令)
   * @param {string} text - 原始文本
   * @returns {string|null} CLI 名称
   */
  extractCLI(text) {
    const match = text.match(/^ask\s+(\w+)\s+/i);
    return match ? match[1].toLowerCase() : null;
  }
}

module.exports = { MessageParser };
