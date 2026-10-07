const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const { CLI_TOOLS, DESKTOP_TOOLS, getCLIPath } = require("./cli_tools");
const CLIPathDetector = require("./cli_path_detector");

const AGENT_STATES_DIR = path.join(process.cwd(), "agent-states");

const NATIVE_SESSION_DIRS = {
  claude: path.join(os.homedir(), ".claude", "projects"),
  gemini: path.join(os.homedir(), ".gemini", "tmp"),
  qwen: path.join(os.homedir(), ".qwen", "sessions"),
  iflow: path.join(os.homedir(), ".iflow", "sessions"),
  codebuddy: path.join(os.homedir(), ".codebuddy", "sessions"),
  codex: path.join(os.homedir(), ".codex", "sessions"),
  copilot: path.join(os.homedir(), ".copilot", "sessions"),
  opencode: path.join(os.homedir(), ".opencode", "sessions"),
  kilocode: path.join(os.homedir(), ".kilocode", "sessions"),
  kode: path.join(os.homedir(), ".kode", "sessions"),
  qodercli: path.join(os.homedir(), ".qoder", "sessions"),
};

class AgentRegistry {
  constructor(options = {}) {
    this.agentStatesDir = options.agentStatesDir || AGENT_STATES_DIR;
    this.cliTools = { ...CLI_TOOLS };
    this.desktopTools = { ...DESKTOP_TOOLS };
    this.pathDetector = new CLIPathDetector();
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = options.cacheTTL || 30000;
  }

  async scanAll() {
    if (this.cache && this.cacheTimestamp && (Date.now() - this.cacheTimestamp < this.cacheTTL)) {
      return this.cache;
    }

    const registry = {
      cli: [],
      desktop: [],
      evolved: [],
      sessions: [],
      total: 0,
      scannedAt: new Date().toISOString(),
    };

    const cliTools = await this._scanCLITools();
    registry.cli = cliTools;

    const desktopTools = await this._scanDesktopTools();
    registry.desktop = desktopTools;

    const evolvedAgents = await this._scanEvolvedAgents();
    registry.evolved = evolvedAgents;

    const sessionDirs = await this._scanSessionDirs();
    registry.sessions = sessionDirs;

    registry.total = registry.cli.length + registry.desktop.length + registry.evolved.length;

    this.cache = registry;
    this.cacheTimestamp = Date.now();

    return registry;
  }

  async getAgent(name) {
    const registry = await this.scanAll();
    const all = [...registry.cli, ...registry.desktop, ...registry.evolved];
    return all.find((a) => a.name === name || a.id === name) || null;
  }

  async listAvailable() {
    const registry = await this.scanAll();
    return {
      cli: registry.cli.filter((a) => a.installed),
      desktop: registry.desktop.filter((a) => a.installed),
      evolved: registry.evolved,
    };
  }

  async _scanCLITools() {
    const detectedPaths = await this.pathDetector.detectAllCLIPaths();
    const results = [];

    for (const [toolName, toolConfig] of Object.entries(this.cliTools)) {
      if (toolConfig.type === "desktop") continue;

      const pathInfo = detectedPaths[toolName];
      const installed = pathInfo !== null && pathInfo !== undefined;
      let version = null;

      if (installed && toolConfig.version) {
        try {
          const versionResult = spawnSync(toolName, ["--version"], {
            encoding: "utf8",
            timeout: 5000,
            stdio: ["pipe", "pipe", "pipe"],
            shell: true,
          });
          if (versionResult.status === 0 || versionResult.status === 1) {
            version = (versionResult.stdout || versionResult.stderr || "").trim();
          }
        } catch (error) {
          version = null;
        }
      }

      results.push({
        id: toolName,
        name: toolConfig.name || toolName,
        type: "cli",
        installed,
        path: pathInfo || null,
        version: version || toolConfig.version || null,
        autoInstall: toolConfig.autoInstall || false,
        hooksDir: toolConfig.hooksDir || null,
        config: toolConfig.config || null,
        skills: toolConfig.skills || null,
        plugins: toolConfig.plugins || null,
        dependsOn: toolConfig.dependsOn || [],
        agentStatesDir: path.join(this.agentStatesDir, toolName),
        hasStateDir: false,
      });
    }

    for (const agent of results) {
      try {
        await fs.access(agent.agentStatesDir);
        agent.hasStateDir = true;
      } catch {
        agent.hasStateDir = false;
      }
    }

    return results;
  }

  async _scanDesktopTools() {
    const results = [];

    for (const [toolName, toolConfig] of Object.entries(this.desktopTools)) {
      const localDirs = toolConfig.localDirs || [];
      let installed = false;
      let foundPath = null;

      for (const dir of localDirs) {
        try {
          await fs.access(dir);
          installed = true;
          foundPath = dir;
          break;
        } catch {
          continue;
        }
      }

      results.push({
        id: toolName,
        name: toolConfig.name || toolName,
        type: "desktop",
        installed,
        path: foundPath,
        version: toolConfig.version || null,
        description: toolConfig.description || null,
        installUrl: toolConfig.installUrl || null,
        autoInstall: false,
        agentStatesDir: path.join(this.agentStatesDir, toolName),
        hasStateDir: false,
      });
    }

    for (const agent of results) {
      try {
        await fs.access(agent.agentStatesDir);
        agent.hasStateDir = true;
      } catch {
        agent.hasStateDir = false;
      }
    }

    return results;
  }

  async _scanEvolvedAgents() {
    const results = [];

    try {
      await fs.access(this.agentStatesDir);
    } catch {
      return results;
    }

    let entries;
    try {
      entries = await fs.readdir(this.agentStatesDir, { withFileTypes: true });
    } catch {
      return results;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const agentName = entry.name;
      const stateFile = path.join(this.agentStatesDir, agentName, "state.json");

      try {
        const stateContent = await fs.readFile(stateFile, "utf8");
        const state = JSON.parse(stateContent);

        results.push({
          id: agentName,
          name: state.cliName || agentName,
          type: "evolved",
          installed: true,
          path: null,
          version: null,
          evolutionCount: state.evolutionCount || 0,
          lastEvolution: state.lastEvolution || null,
          createdAt: state.createdAt || null,
          lastUpdate: state.lastUpdate || null,
          agentStatesDir: path.join(this.agentStatesDir, agentName),
          hasStateDir: true,
        });
      } catch {
        continue;
      }
    }

    return results;
  }

  async _scanSessionDirs() {
    const results = [];

    for (const [cliName, sessionDir] of Object.entries(NATIVE_SESSION_DIRS)) {
      try {
        await fs.access(sessionDir);
        const entries = await fs.readdir(sessionDir, { withFileTypes: true });
        const sessionCount = entries.filter((e) => e.isDirectory() || e.isFile()).length;

        results.push({
          id: `${cliName}-sessions`,
          name: `${cliName} native sessions`,
          type: "sessions",
          cliName,
          sessionDir,
          sessionCount,
          installed: true,
        });
      } catch {
        continue;
      }
    }

    return results;
  }

  invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = null;
  }
}

module.exports = { AgentRegistry, AGENT_STATES_DIR, NATIVE_SESSION_DIRS };
