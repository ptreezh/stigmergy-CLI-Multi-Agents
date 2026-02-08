/**
 * Gateway Module Index - 网关模块导出
 */

const { GatewayServer } = require("./server");
const { MessageParser } = require("./core/parser");
const { CommandRouter } = require("./core/router");
const { ResultFormatter } = require("./core/formatter");
const {
  PlatformAdapter,
  FeishuAdapter,
  TelegramAdapter,
  SlackAdapter,
  DiscordAdapter,
} = require("./adapters");

module.exports = {
  GatewayServer,
  MessageParser,
  CommandRouter,
  ResultFormatter,
  PlatformAdapter,
  FeishuAdapter,
  TelegramAdapter,
  SlackAdapter,
  DiscordAdapter,
};
