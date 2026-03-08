/**
 * Gateway Server - 多平台统一网关服务器
 * 接收各平台 Webhook 消息，路由到 Stigmergy 执行
 */

const http = require("http");
const path = require("path");
const fs = require("fs");
const { URL } = require("url");

const { MessageParser } = require("./core/parser");
const { CommandRouter } = require("./core/router");
const { ResultFormatter } = require("./core/formatter");
const { PlatformAdapter } = require("./adapters");
const { NgrokManager } = require("../tunnel/ngrok");

class GatewayServer {
  constructor(config = {}) {
    this.config = config;
    this.port = config.port || 3000;
    this.workdir = config.workdir || process.cwd();
    this.enableTunnel = config.tunnel || false;

    this.parser = new MessageParser();
    this.formatter = new ResultFormatter();
    this.adapter = new PlatformAdapter(config.platforms || {});

    this.router = null;
    this.server = null;
    this.ngrok = null;
    this.publicUrl = null;
    this.running = false;
    this.requestCount = 0;
    this.startTime = Date.now();
  }

  /**
   * 初始化路由器
   */
  async initRouter() {
    try {
      const {
        InteractiveModeController,
      } = require("../interactive/InteractiveModeController");

      this.router = new CommandRouter(
        new InteractiveModeController({
          autoEnterLoop: false,
          workdir: this.workdir,
        }),
      );

      console.log("[Gateway] Full router initialized");
    } catch (error) {
      console.warn(
        `[Gateway] Could not initialize full router: ${error.message}`,
      );
      this.router = null;
    }
  }

  /**
   * 启动服务器
   */
  async start() {
    if (this.running) {
      console.log("[Gateway] Server already running");
      return;
    }

    await this.initRouter();

    this.server = http.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      this.running = true;
      console.log(`[Gateway] Server running at http://localhost:${this.port}`);
      console.log(`[Gateway] Work directory: ${this.workdir}`);
      this.logEnabledPlatforms();
    });

    if (this.enableTunnel) {
      await this.startTunnel();
    }

    process.on("SIGINT", () => this.stop());
    process.on("SIGTERM", () => this.stop());
  }

  /**
   * 启动 ngrok 隧道
   */
  async startTunnel() {
    try {
      console.log("[Gateway] Starting ngrok tunnel...");
      this.ngrok = new NgrokManager();
      this.publicUrl = await this.ngrok.start(this.port);
      console.log(`[Gateway] Public URL: ${this.publicUrl}`);
      console.log("[Gateway] Webhook endpoints:");
      for (const platform of this.adapter.getEnabledPlatforms()) {
        console.log(`  - ${this.publicUrl}/webhook/${platform}`);
      }
    } catch (error) {
      console.warn(`[Gateway] Failed to start tunnel: ${error.message}`);
    }
  }

  /**
   * 停止服务器
   */
  stop() {
    if (this.ngrok) {
      this.ngrok.stop();
      this.ngrok = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
      this.running = false;
      console.log("[Gateway] Server stopped");
    }
  }

  /**
   * 记录启用的平台
   */
  logEnabledPlatforms() {
    const platforms = this.adapter.getEnabledPlatforms();
    if (platforms.length > 0) {
      console.log(`[Gateway] Enabled platforms: ${platforms.join(", ")}`);
    } else {
      console.log("[Gateway] Warning: No platforms enabled");
      console.log(
        "[Gateway] Use --feishu, --telegram, --slack, --discord flags to enable",
      );
    }
  }

  /**
   * 处理 HTTP 请求
   */
  async handleRequest(req, res) {
    const startTime = Date.now();
    this.requestCount++;

    try {
      const parsedUrl = new URL(req.url, `http://localhost:${this.port}`);
      const pathname = parsedUrl.pathname;

      res.setHeader("Content-Type", "application/json");

      if (pathname === "/health" || pathname === "/") {
        this.handleHealth(res);
        return;
      }

      if (pathname.startsWith("/webhook") && req.method === "POST") {
        await this.handleWebhook(req, res);
        return;
      }

      if (pathname === "/status" && req.method === "GET") {
        await this.handleStatus(res);
        return;
      }

      if (pathname === "/config" && req.method === "POST") {
        await this.handleConfig(req, res);
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not Found" }));
    } catch (error) {
      console.error("[Gateway] Request error:", error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 处理健康检查
   */
  handleHealth(res) {
    const uptime = Date.now() - this.startTime;
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: "ok",
        uptime,
        requests: this.requestCount,
        platforms: this.adapter.getEnabledPlatforms(),
      }),
    );
  }

  /**
   * 处理 Webhook
   */
  async handleWebhook(req, res) {
    const pathname = new URL(req.url, `http://localhost:${this.port}`).pathname;
    const parts = pathname.split("/").filter((p) => p);
    const platform = parts[1] || "feishu";

    if (!this.adapter.isEnabled(platform)) {
      console.log(
        `[Gateway] Webhook received for disabled platform: ${platform}`,
      );
      res.writeHead(200);
      res.end(JSON.stringify({ error: "Platform not enabled" }));
      return;
    }

    try {
      const body = await this.readBody(req);
      console.log(`[Gateway] Received ${platform} webhook`);

      const message = this.adapter.parse(platform, body);

      if (!message.text || message.text.trim() === "") {
        console.log(`[Gateway] Empty message from ${platform}`);
        res.writeHead(200);
        res.end(JSON.stringify({ status: "ignored", reason: "Empty message" }));
        return;
      }

      const intent = this.parser.recognizeIntent(message.text);
      const task = this.parser.extractTask(message.text, intent);

      console.log(
        `[Gateway] Intent: ${intent}, Task: "${String(task).substring(0, 50)}..."`,
      );

      let result;
      if (this.router) {
        result = await this.router.route(intent, message.text);
      } else {
        result = this.getSimplifiedResult(intent, message.text);
      }

      try {
        const formatted = this.adapter.format(platform, result);
        await this.adapter.send(platform, formatted);
      } catch (sendError) {
        console.warn(`[Gateway] Send error: ${sendError.message}`);
      }

      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok", intent, platform, result }));
    } catch (error) {
      console.error("[Gateway] Webhook error:", error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 简化模式下的结果
   */
  getSimplifiedResult(intent, text) {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    switch (intent) {
    case "concurrent":
      result.mode = "concurrent";
      result.message = `[并发模式] 已接收任务: ${text.replace(/^(concurrent|parallel)\s+/i, "")}`;
      result.clis = ["claude", "qwen", "iflow"];
      break;
    case "ask":
      const cli = text.match(/^ask\s+(\w+)\s+/i)?.[1] || "unknown";
      result.mode = "ask";
      result.message = `[${cli}] 已接收任务`;
      result.cli = cli;
      break;
    case "status":
      result.mode = "status";
      result.message = "Stigmergy Gateway 运行中";
      break;
    case "help":
      result.mode = "help";
      result.message = `可用命令:
- route <任务>: 智能路由
- concurrent <任务>: 多 CLI 并行
- ask <cli> <任务>: 指定 CLI
- status: 查询状态`;
      break;
    default:
      result.mode = "route";
      result.message = "[路由模式] 已接收任务";
    }

    return result;
  }

  /**
   * 处理状态查询
   */
  async handleStatus(res) {
    const uptime = Date.now() - this.startTime;
    const platforms = this.adapter.getEnabledPlatforms();

    res.writeHead(200);
    res.end(
      JSON.stringify({
        running: this.running,
        uptime,
        requests: this.requestCount,
        platforms,
        workdir: this.workdir,
      }),
    );
  }

  /**
   * 处理配置更新
   */
  async handleConfig(req, res) {
    try {
      const body = await this.readBody(req);
      const config = JSON.parse(body);

      if (config.platforms) {
        this.adapter = new PlatformAdapter(config.platforms);
      }

      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: "ok",
          platforms: this.adapter.getEnabledPlatforms(),
        }),
      );
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 读取请求体
   */
  readBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => resolve(body));
      req.on("error", reject);
    });
  }
}

module.exports = { GatewayServer };
