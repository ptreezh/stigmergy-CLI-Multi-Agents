/**
 * Gateway Server - 多平台统一网关服务器
 * 接收各平台 Webhook 消息，路由到 Stigmergy 执行
 */

const http = require("http");
const { URL } = require("url");
const fs = require("fs").promises;
const path = require("path");
const { AgentCoordinator } = require("../core/agent_coordinator");

// Stub: intent recognition
function recognizeIntent(text) {
  const t = text.toLowerCase();
  if (t.includes("concurrent") || t.includes("parallel")) return "concurrent";
  if (t.startsWith("ask ")) return "ask";
  if (t.includes("status")) return "status";
  if (t.includes("help")) return "help";
  return "route";
}

// Stub: task extraction
function extractTask(text, intent) {
  return text.substring(0, 80);
}

class GatewayServer {
  constructor(config = {}) {
    this.config = config;
    this.port = config.port || 3000;
    this.workdir = config.workdir || process.cwd();
    this.enableTunnel = config.tunnel || false;

    this.router = null;
    this.server = null;
    this.ngrok = null;
    this.publicUrl = null;
    this.running = false;
    this.requestCount = 0;
    this.startTime = Date.now();
    this.coordinator = null;
  }

  /**
   * 启动服务器
   */
  async start() {
    if (this.running) {
      console.log("[Gateway] Server already running");
      return;
    }

    try {
      this.coordinator = new AgentCoordinator();
      await this.coordinator.initialize();
      console.log("[Gateway] AgentCoordinator initialized");
    } catch (error) {
      console.warn(`[Gateway] Failed to initialize AgentCoordinator: ${error.message}`);
    }

    this.server = http.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      this.running = true;
      console.log(`[Gateway] Server running at http://localhost:${this.port}`);
      console.log(`[Gateway] Work directory: ${this.workdir}`);
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
      const { NgrokManager } = require("../tunnel/ngrok");
      console.log("[Gateway] Starting ngrok tunnel...");
      this.ngrok = new NgrokManager();
      this.publicUrl = await this.ngrok.start(this.port);
      console.log(`[Gateway] Public URL: ${this.publicUrl}`);
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
   * 处理 HTTP 请求
   */
  async handleRequest(req, res) {
    this.requestCount++;

    try {
      const parsedUrl = new URL(req.url, `http://localhost:${this.port}`);
      const pathname = parsedUrl.pathname;

      res.setHeader("Content-Type", "application/json");

      if (pathname === "/health" || pathname === "/") {
        this.handleHealth(res);
        return;
      }

      if (pathname === "/api/agents" && req.method === "GET") {
        await this.handleAgentsList(res);
        return;
      }

      if (pathname.startsWith("/api/agents/") && req.method === "GET") {
        const agentName = pathname.split("/")[3];
        await this.handleAgentDetail(res, agentName);
        return;
      }

      if (pathname === "/api/dashboard" && req.method === "GET") {
        await this.handleDashboard(res);
        return;
      }

      if (pathname === "/api/route" && req.method === "POST") {
        await this.handleRouteTask(req, res);
        return;
      }

      if (pathname === "/api/takeover" && req.method === "POST") {
        await this.handleTakeover(req, res);
        return;
      }

      if (pathname.startsWith("/webhook") && req.method === "POST") {
        await this.handleWebhook(req, res);
        return;
      }

      if (pathname === "/status" && req.method === "GET") {
        this.handleStatus(res);
        return;
      }

      if (pathname === "/config" && req.method === "POST") {
        await this.handleConfig(req, res);
        return;
      }

      if (pathname === "/dashboard.html" && req.method === "GET") {
        await this.handleDashboardHtml(req, res);
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
      }),
    );
  }

  /**
   * 处理 Webhook
   */
  async handleWebhook(req, res) {
    try {
      const body = await this.readBody(req);
      console.log(`[Gateway] Received webhook`);

      const intent = recognizeIntent(body);
      const task = extractTask(body, intent);

      console.log(`[Gateway] Intent: ${intent}, Task: "${String(task).substring(0, 50)}..."`);

      const result = this.getSimplifiedResult(intent, body);

      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok", intent, result }));
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
  handleStatus(res) {
    const uptime = Date.now() - this.startTime;
    res.writeHead(200);
    res.end(
      JSON.stringify({
        running: this.running,
        uptime,
        requests: this.requestCount,
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
      JSON.parse(body);
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok" }));
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

  /**
   * 处理智能体列表查询
   */
  async handleAgentsList(res) {
    try {
      if (!this.coordinator) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: "AgentCoordinator not initialized" }));
        return;
      }

      const agents = await this.coordinator.refreshStates();
      res.writeHead(200);
      res.end(JSON.stringify({ agents, count: agents.length }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 处理单个智能体详情查询
   */
  async handleAgentDetail(res, agentName) {
    try {
      if (!this.coordinator) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: "AgentCoordinator not initialized" }));
        return;
      }

      const agent = this.coordinator.getAgentState(agentName);
      if (!agent) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: `Agent ${agentName} not found` }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(agent));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 处理总控台数据查询
   */
  async handleDashboard(res) {
    try {
      if (!this.coordinator) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: "AgentCoordinator not initialized" }));
        return;
      }

      const dashboard = await this.coordinator.getDashboard();
      res.writeHead(200);
      res.end(JSON.stringify(dashboard));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 处理任务路由请求
   */
  async handleRouteTask(req, res) {
    try {
      if (!this.coordinator) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: "AgentCoordinator not initialized" }));
        return;
      }

      const body = await this.readBody(req);
      const { task, agent, taskType, forceAgent } = JSON.parse(body);

      const result = await this.coordinator.routeTask(task, { agent, taskType, forceAgent });
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 处理智能体接管请求
   */
  async handleTakeover(req, res) {
    try {
      if (!this.coordinator) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: "AgentCoordinator not initialized" }));
        return;
      }

      const body = await this.readBody(req);
      const { fromAgent, toAgent, task } = JSON.parse(body);

      const result = await this.coordinator.takeOver(fromAgent, toAgent, task);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * 提供 Dashboard HTML 页面
   */
  async handleDashboardHtml(req, res) {
    try {
      const dashboardPath = path.join(this.workdir, "web", "dashboard.html");
      const content = await fs.readFile(dashboardPath, "utf8");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    } catch (error) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Dashboard not found" }));
    }
  }
}

module.exports = { GatewayServer };