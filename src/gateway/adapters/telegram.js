/**
 * Telegram Adapter - Telegram 适配器
 * 解析 Telegram Bot API 消息，格式化为 Telegram 消息
 */

class TelegramAdapter {
  constructor(config = {}) {
    this.token = config.bot_token || "";
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.proxyUrl = config.proxy_url || "";
  }

  /**
   * 解析 Telegram Webhook 消息
   */
  parse(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const message = data.message || data.callback_query || data;

    let text = message?.text || message?.caption || "";
    let chatId = message?.chat?.id || message?.from?.id || "";

    return {
      text,
      userId:
        message?.from?.id?.toString() || message?.from?.username || "unknown",
      username: message?.from?.username || "",
      firstName: message?.from?.first_name || "",
      chatId: chatId.toString(),
      msgId: message?.message_id?.toString() || Date.now().toString(),
      callbackQueryId: data.callback_query?.id || "",
      platform: "telegram",
    };
  }

  /**
   * 格式化为 Telegram 消息
   */
  format(result) {
    const statusEmoji = result.success ? "✅" : "❌";
    const messageText =
      typeof result.message === "string"
        ? result.message
        : JSON.stringify(result.message);

    let text = `${statusEmoji} *任务${result.success ? "完成" : "失败"}*\n\n`;
    text += messageText.substring(0, 3000);

    if (result.mode !== "help") {
      text += `\n\n`;
      text += `🤖 *模式*: \`${result.mode}\`\n`;
      text += `⏱️ *用时*: ${this.formatDuration(result.duration)}`;

      if (result.clis && result.clis.length > 0) {
        text += `\n👥 *执行中*: ${result.clis.join(", ")}`;
      }
    }

    return {
      method: "sendMessage",
      chat_id: this.chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔄 重试", callback_data: `retry_${result.mode}` },
            { text: "📊 状态", callback_data: "status" },
          ],
          [{ text: "📝 帮助", callback_data: "help" }],
        ],
      },
    };
  }

  /**
   * 发送消息到 Telegram
   */
  async send(payload) {
    if (!this.token) {
      console.log("[Telegram Adapter] Bot token not configured");
      return { success: false, error: "Bot token not configured" };
    }

    try {
      const url = `${this.apiUrl}/${payload.method}`;
      const body = { ...payload };
      delete body.method;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.ok) {
        console.log("[Telegram Adapter] Message sent successfully");
        return { success: true, data: result };
      } else {
        console.error("[Telegram Adapter] Send failed:", result.description);
        return { success: false, error: result.description };
      }
    } catch (error) {
      console.error("[Telegram Adapter] Send error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 回答回调查询 (用于按钮响应)
   */
  async answerCallback(callbackQueryId, text = "", showAlert = false) {
    if (!this.token || !callbackQueryId) return;

    try {
      await fetch(`${this.apiUrl}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert,
        }),
      });
    } catch (error) {
      console.error("[Telegram Adapter] Answer callback error:", error.message);
    }
  }

  /**
   * 格式化为纯文本消息
   */
  formatText(text) {
    return {
      method: "sendMessage",
      chat_id: this.chatId,
      text,
      parse_mode: "Markdown",
    };
  }

  /**
   * 格式化持续时间
   */
  formatDuration(ms) {
    if (!ms || ms === "N/A") return "N/A";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

module.exports = { TelegramAdapter };
