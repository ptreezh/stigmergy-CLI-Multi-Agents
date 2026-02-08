/**
 * Slack Adapter - Slack 适配器
 * 解析 Slack Events API 消息，格式化为 Slack 消息块
 */

class SlackAdapter {
  constructor(config = {}) {
    this.webhookUrl = config.webhook_url || "";
    this.signingSecret = config.signing_secret || "";
    this.token = config.bot_token || "";
  }

  /**
   * 解析 Slack 消息
   */
  parse(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    let text = "";
    let userId = "";
    let channelId = "";
    let eventTs = "";

    if (data.type === "url_verification") {
      return {
        type: "verification",
        challenge: data.challenge,
        platform: "slack",
      };
    }

    if (data.event) {
      text = data.event.text || "";
      userId = data.event.user || "";
      channelId = data.event.channel || "";
      eventTs = data.event.ts || "";
    } else {
      text = data.text || "";
      userId = data.user_id || "";
      channelId = data.channel_id || "";
      eventTs = data.message_ts || data.event_ts || "";
    }

    return {
      text,
      userId,
      channel: channelId,
      msgId: eventTs || Date.now().toString(),
      platform: "slack",
    };
  }

  /**
   * 格式化为 Slack 消息块
   */
  format(result) {
    const statusEmoji = result.success ? ":white_check_mark:" : ":x:";
    const messageText =
      typeof result.message === "string"
        ? result.message.substring(0, 2000)
        : JSON.stringify(result.message).substring(0, 2000);

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${statusEmoji} 任务${result.success ? "完成" : "失败"}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: messageText,
        },
      },
    ];

    if (result.mode !== "help") {
      const fields = [
        {
          type: "mrkdwn",
          text: `*模式:*\n${result.mode}`,
        },
        {
          type: "mrkdwn",
          text: `*用时:*\n${this.formatDuration(result.duration)}`,
        },
      ];

      if (result.clis && result.clis.length > 0) {
        fields.push({
          type: "mrkdwn",
          text: `*执行中:*\n${result.clis.join(", ")}`,
        });
      }

      blocks.push({
        type: "section",
        fields,
      });

      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🕐 ${result.timestamp || new Date().toISOString()}`,
          },
        ],
      });
    }

    if (result.mode !== "help") {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "🔄 重试",
            },
            action_id: `retry_${result.mode}`,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📊 状态",
            },
            action_id: "status",
          },
        ],
      });
    }

    return { blocks };
  }

  /**
   * 发送消息到 Slack (Webhook)
   */
  async send(payload) {
    if (!this.webhookUrl) {
      console.log("[Slack Adapter] Webhook URL not configured");
      return { success: false, error: "Webhook URL not configured" };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("[Slack Adapter] Message sent successfully");
        return { success: true };
      } else {
        const error = await response.text();
        console.error("[Slack Adapter] Send failed:", error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("[Slack Adapter] Send error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 格式化为纯文本消息
   */
  formatText(text) {
    return { text };
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

module.exports = { SlackAdapter };
