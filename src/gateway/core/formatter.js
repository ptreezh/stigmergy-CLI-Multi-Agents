/**
 * Result Formatter - 结果格式化器
 * 将执行结果格式化为各平台的卡片格式
 */

class ResultFormatter {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 格式化结果为指定平台格式
   * @param {object} result - 执行结果
   * @param {string} platform - 平台名称
   * @returns {object} 格式化后的消息
   */
  format(result, platform) {
    switch (platform) {
      case "feishu":
        return this.formatFeishu(result);
      case "telegram":
        return this.formatTelegram(result);
      case "slack":
        return this.formatSlack(result);
      case "discord":
        return this.formatDiscord(result);
      default:
        return this.formatGeneric(result);
    }
  }

  /**
   * 统一结果结构
   */
  normalize(result) {
    return {
      success: result.success !== false,
      message: result.message || result.result || result.content || "",
      mode: result.mode || "unknown",
      cli: result.cli || result.clis?.[0] || "auto",
      clis: result.clis || [],
      duration: result.duration || 0,
      error: result.error || null,
      status: result.status || null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 格式化为飞书卡片
   */
  formatFeishu(result) {
    const normalized = this.normalize(result);
    const statusEmoji = normalized.success ? "✅" : "❌";
    const durationText = normalized.duration
      ? `\n⏱️ 用时：${this.formatDuration(normalized.duration)}`
      : "";

    if (normalized.mode === "help") {
      return {
        msg_type: "text",
        content: { text: normalized.message },
      };
    }

    return {
      msg_type: "card",
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: `${statusEmoji} 任务${normalized.success ? "完成" : "失败"}`,
          template: normalized.success ? "green" : "red",
        },
        elements: [
          {
            tag: "div",
            text: {
              content:
                normalized.message.substring(0, 500) +
                (normalized.message.length > 500 ? "..." : ""),
              type: "text",
            },
          },
          {
            tag: "div",
            fields: [
              {
                is_short: true,
                text: { content: `🤖 模式: ${normalized.mode}`, type: "text" },
              },
              {
                is_short: true,
                text: {
                  content: `⏱️ 用时: ${this.formatDuration(normalized.duration)}`,
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
                { tag: "text", content: `执行时间: ${normalized.timestamp}` },
              ],
            },
          ],
        },
      },
    };
  }

  /**
   * 格式化为 Telegram 消息
   */
  formatTelegram(result) {
    const normalized = this.normalize(result);
    const statusEmoji = normalized.success ? "✅" : "❌";

    let text = `${statusEmoji} *任务${normalized.success ? "完成" : "失败"}*\n\n`;
    text += normalized.message.substring(0, 1000);

    if (normalized.mode !== "help") {
      text += `\n\n`;
      text += `🤖 *模式*: \`${normalized.mode}\`\n`;
      text += `⏱️ *用时*: ${this.formatDuration(normalized.duration)}`;

      if (normalized.clis && normalized.clis.length > 0) {
        text += `\n🤖 *执行中*: ${normalized.clis.join(", ")}`;
      }
    }

    return {
      method: "sendMessage",
      text,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔄 重试", callback_data: `retry_${normalized.mode}` },
            { text: "📊 状态", callback_data: "status" },
          ],
        ],
      },
    };
  }

  /**
   * 格式化为 Slack 消息
   */
  formatSlack(result) {
    const normalized = this.normalize(result);
    const statusEmoji = normalized.success ? ":white_check_mark:" : ":x:";

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${statusEmoji} 任务${normalized.success ? "完成" : "失败"}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: normalized.message.substring(0, 2000),
        },
      },
    ];

    if (normalized.mode !== "help") {
      blocks.push({
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*模式:*\n${normalized.mode}`,
          },
          {
            type: "mrkdwn",
            text: `*用时:*\n${this.formatDuration(normalized.duration)}`,
          },
        ],
      });
    }

    if (normalized.clis && normalized.clis.length > 0) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🤖 执行中: ${normalized.clis.join(", ")}`,
          },
        ],
      });
    }

    return { blocks };
  }

  /**
   * 格式化为 Discord 消息
   */
  formatDiscord(result) {
    const normalized = this.normalize(result);
    const statusEmoji = normalized.success ? "✅" : "❌";

    let content = `**${statusEmoji} 任务${normalized.success ? "完成" : "失败"}**\n\n`;
    content += normalized.message.substring(0, 1900);

    if (normalized.mode !== "help") {
      content += `\n\n`;
      content += `> 🤖 **模式**: \`${normalized.mode}\`\n`;
      content += `> ⏱️ **用时**: ${this.formatDuration(normalized.duration)}`;

      if (normalized.clis && normalized.clis.length > 0) {
        content += `\n> 🤖 **执行中**: ${normalized.clis.join(", ")}`;
      }
    }

    return { content };
  }

  /**
   * 通用格式
   */
  formatGeneric(result) {
    const normalized = this.normalize(result);
    return {
      success: normalized.success,
      message: normalized.message,
      mode: normalized.mode,
      duration: normalized.duration,
      timestamp: normalized.timestamp,
    };
  }

  /**
   * 格式化持续时间
   */
  formatDuration(ms) {
    if (!ms) return "N/A";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * 格式化进度状态
   */
  formatProgress(progress) {
    return {
      running: progress.running || false,
      tasks: progress.tasks || [],
      total: progress.total || 0,
      completed: progress.completed || 0,
      failed: progress.failed || 0,
      duration: this.formatDuration(progress.duration),
    };
  }
}

module.exports = { ResultFormatter };
