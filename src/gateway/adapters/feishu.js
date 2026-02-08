/**
 * Feishu Adapter - 飞书适配器
 * 解析飞书消息，格式化为飞书卡片
 */

const crypto = require("crypto");

class FeishuAdapter {
  constructor(config = {}) {
    this.webhookUrl = config.webhook_url || "";
    this.secret = config.secret || "";
  }

  /**
   * 解析飞书 Webhook 消息
   */
  parse(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    let text = data.content?.text || data.text || data.message || "";
    text = text.replace(/@[^\s]+/g, "").trim();

    return {
      text,
      userId: data.sender?.user_id || data.user_id || "unknown",
      msgId: data.msg_id || data.message_id || Date.now().toString(),
      eventId: data.event_id || "",
      platform: "feishu",
    };
  }

  /**
   * 验证签名
   */
  verifySignature(body, timestamp, signature) {
    if (!this.secret) return true;

    const signStr = `${timestamp}${body}`;
    const mySignature = crypto
      .createHmac("sha256", this.secret)
      .update(signStr)
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(mySignature),
    );
  }

  /**
   * 格式化为飞书卡片
   */
  format(result) {
    const statusEmoji = result.success ? "✅" : "❌";
    const headerColor = result.success ? "green" : "red";
    const messageText =
      typeof result.message === "string"
        ? result.message
        : JSON.stringify(result.message);

    if (result.mode === "help") {
      return {
        msg_type: "text",
        content: { text: messageText },
      };
    }

    return {
      msg_type: "card",
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: `${statusEmoji} 任务${result.success ? "完成" : "失败"}`,
          template: headerColor,
        },
        elements: [
          {
            tag: "div",
            text: {
              content:
                messageText.substring(0, 500) +
                (messageText.length > 500 ? "..." : ""),
              type: "text",
            },
          },
          {
            tag: "div",
            fields: [
              {
                is_short: true,
                text: { content: `🤖 **模式**: ${result.mode}`, type: "text" },
              },
              {
                is_short: true,
                text: {
                  content: `⏱️ **用时**: ${this.formatDuration(result.duration)}`,
                  type: "text",
                },
              },
            ],
          },
        ],
        i18n_elements: {
          zh_cn: [
            {
              tag: "note",
              elements: [
                {
                  tag: "text",
                  content: `🕐 ${result.timestamp || new Date().toISOString()}`,
                },
              ],
            },
          ],
        },
      },
    };
  }

  /**
   * 发送消息到飞书
   */
  async send(payload) {
    if (!this.webhookUrl) {
      console.log("[Feishu Adapter] Webhook URL not configured");
      return { success: false, error: "Webhook URL not configured" };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.code === 0) {
        console.log("[Feishu Adapter] Message sent successfully");
        return { success: true, data: result };
      } else {
        console.error("[Feishu Adapter] Send failed:", result.msg);
        return { success: false, error: result.msg };
      }
    } catch (error) {
      console.error("[Feishu Adapter] Send error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 格式化为飞书文本消息
   */
  formatText(text) {
    return {
      msg_type: "text",
      content: { text },
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

module.exports = { FeishuAdapter };
