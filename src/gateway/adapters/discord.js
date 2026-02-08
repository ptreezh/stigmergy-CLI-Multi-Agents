/**
 * Discord Adapter - Discord 适配器
 * 解析 Discord Webhook 消息，格式化为 Discord 消息
 */

class DiscordAdapter {
  constructor(config = {}) {
    this.webhookUrl = config.webhook_url || "";
    this.botToken = config.bot_token || "";
  }

  /**
   * 解析 Discord 消息
   */
  parse(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    let text = data.content || "";
    text = text.replace(/<@[!&]?\d+>/g, "").trim();

    return {
      text,
      userId: data.author?.id || "unknown",
      username: data.author?.username || "",
      discriminator: data.author?.discriminator || "",
      channelId: data.channel_id || "",
      guildId: data.guild_id || "",
      msgId: data.id || Date.now().toString(),
      platform: "discord",
    };
  }

  /**
   * 格式化为 Discord 消息
   */
  format(result) {
    const statusEmoji = result.success ? "✅" : "❌";
    const messageText =
      typeof result.message === "string"
        ? result.message
        : JSON.stringify(result.message);

    let content = `**${statusEmoji} 任务${result.success ? "完成" : "失败"}**\n\n`;
    content += messageText.substring(0, 1900);

    if (result.mode !== "help") {
      content += `\n\n`;
      content += `> 🤖 **模式**: \`${result.mode}\`\n`;
      content += `> ⏱️ **用时**: ${this.formatDuration(result.duration)}`;

      if (result.clis && result.clis.length > 0) {
        content += `\n> 👥 **执行中**: ${result.clis.join(", ")}`;
      }

      content += `\n> 🕐 ${result.timestamp || new Date().toISOString()}`;
    }

    return { content };
  }

  /**
   * 发送消息到 Discord (Webhook)
   */
  async send(payload) {
    if (!this.webhookUrl) {
      console.log("[Discord Adapter] Webhook URL not configured");
      return { success: false, error: "Webhook URL not configured" };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("[Discord Adapter] Message sent successfully");
        return { success: true };
      } else {
        const error = await response.text();
        console.error("[Discord Adapter] Send failed:", error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("[Discord Adapter] Send error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 格式化为纯文本消息
   */
  formatText(text) {
    return { content: text };
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

module.exports = { DiscordAdapter };
