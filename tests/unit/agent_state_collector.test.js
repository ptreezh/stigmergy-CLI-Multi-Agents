const path = require("path");

jest.mock("../../src/core/cli_path_detector", () => {
  const MockCLIPathDetector = jest.fn().mockImplementation(() => ({
    detectAllCLIPaths: jest.fn().mockResolvedValue({
      claude: "F:\\npm-global\\claude",
      gemini: "F:\\npm-global\\gemini",
      qwen: "F:\\npm-global\\qwen",
      iflow: "F:\\npm-global\\iflow",
      codebuddy: "F:\\npm-global\\codebuddy",
      codex: "F:\\npm-global\\codex",
      kilocode: "F:\\npm-global\\kilo",
      opencode: "F:\\npm-global\\opencode",
      copilot: null,
      kode: null,
    }),
    getDetectedPath: jest.fn().mockReturnValue(null),
    detectCLIPath: jest.fn().mockResolvedValue(null),
  }));
  MockCLIPathDetector.default = MockCLIPathDetector;
  return MockCLIPathDetector;
});

const { AgentRegistry } = require("../../src/core/agent_registry");
const { AgentStateCollector } = require("../../src/core/agent_state_collector");

describe("AgentStateCollector", () => {
  let registry;
  let collector;

  beforeEach(() => {
    registry = new AgentRegistry({
      agentStatesDir: path.join(__dirname, "..", "..", "..", "agent-states"),
      cacheTTL: 0,
    });
    collector = new AgentStateCollector({
      agentStatesDir: path.join(__dirname, "..", "..", "..", "agent-states"),
    });
  });

  describe("collect", () => {
    it("should return state object with required fields", async () => {
      const registryData = await registry.scanAll();
      const agent = registryData.cli[0];

      const state = await collector.collect(agent);

      expect(state).toHaveProperty("id");
      expect(state).toHaveProperty("name");
      expect(state).toHaveProperty("type");
      expect(state).toHaveProperty("installed");
      expect(state).toHaveProperty("status");
      expect(state).toHaveProperty("conversationDepth");
      expect(state).toHaveProperty("sessionCount");
      expect(state).toHaveProperty("tokenExhausted");
      expect(state).toHaveProperty("capabilities");
      expect(state).toHaveProperty("collectedAt");
    });

    it("should mark offline status for uninstalled agents", async () => {
      const fakeAgent = {
        id: "nonexistent-tool",
        name: "Nonexistent Tool",
        type: "cli",
        installed: false,
        path: null,
        version: null,
      };

      const state = await collector.collect(fakeAgent);
      expect(state.status).toBe("offline");
      expect(state.installed).toBe(false);
    });

    it("should detect capabilities for evolved agents", async () => {
      const registryData = await registry.scanAll();
      const evolved = registryData.evolved[0];

      if (evolved) {
        const state = await collector.collect(evolved);
        expect(state.capabilities.interactive).toBe(true);
        expect(state.capabilities.oneTime).toBe(true);
        expect(state.capabilities.autoMode).toBe(true);
      }
    });
  });

  describe("collectAll", () => {
    it("should return states for all agents in registry", async () => {
      const registryData = await registry.scanAll();
      const states = await collector.collectAll(registryData);

      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBeGreaterThan(0);
    });

    it("should include error state for agents that throw during collection", async () => {
      const fakeAgent = {
        id: "fake-broken-agent",
        name: "Fake Broken",
        type: "cli",
        installed: true,
        path: "/fake/path",
        version: "1.0",
      };

      const brokenCollector = new AgentStateCollector({
        agentStatesDir: path.join(__dirname, "..", "..", "..", "agent-states"),
      });
      brokenCollector._countSessions = async () => {
        throw new Error("session read failed");
      };

      const states = await brokenCollector.collectAll({ cli: [fakeAgent], desktop: [], evolved: [] });
      const found = states.find((s) => s.id === "fake-broken-agent");
      expect(found).toBeDefined();
      expect(found.status).toBe("error");
      expect(found.error).toBeDefined();
    });
  });

  describe("token exhaustion detection", () => {
    it("should detect token exhaustion from lastError patterns", async () => {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stigmergy-test-"));
      const agentDir = path.join(tmpDir, "test-tool");
      fs.mkdirSync(agentDir, { recursive: true });
      const stateFile = path.join(agentDir, "state.json");
      fs.writeFileSync(stateFile, JSON.stringify({
        evolutionCount: 1,
        lastEvolution: { success: false, error: "Error: rate limit exceeded, please upgrade your plan" },
        lastUpdate: new Date().toISOString()
      }));

      const agent = {
        id: "test-tool",
        name: "Test Tool",
        type: "cli",
        installed: true,
        path: "/test/path",
        version: "1.0",
        agentStatesDir: tmpDir,
      };

      const testCollector = new AgentStateCollector({
        agentStatesDir: tmpDir,
      });

      const state = await testCollector.collect(agent);
      expect(state.tokenExhausted).toBe(true);
      expect(state.tokenExhaustionReason).toContain("rate limit");

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should detect token exhaustion from high conversation depth", async () => {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stigmergy-test-"));
      const sessionDir = path.join(tmpDir, "sessions");
      fs.mkdirSync(sessionDir, { recursive: true });

      for (let i = 0; i < 5; i++) {
        const lines = Array(100).fill("message");
        fs.writeFileSync(path.join(sessionDir, `session-${1000000000000 + i}.json`), lines.join("\n"));
      }

      const agent = {
        id: "test-tool",
        name: "Test Tool",
        type: "cli",
        installed: true,
        path: "/test/path",
        version: "1.0",
      };

      const testCollector = new AgentStateCollector({
        agentStatesDir: path.join(__dirname, "..", "..", "..", "agent-states"),
      });
      testCollector._estimateConversationDepth = async () => 100;

      const state = await testCollector.collect(agent);
      expect(state.tokenExhausted).toBe(true);
      expect(state.conversationDepth).toBeGreaterThan(80);

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should detect token exhaustion from session file content", async () => {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stigmergy-test-"));
      const sessionDir = path.join(tmpDir, "sessions");
      fs.mkdirSync(sessionDir, { recursive: true });
      fs.writeFileSync(path.join(sessionDir, "session-1234567890123.json"), JSON.stringify({ error: "context_length_exceeded: maximum context reached" }));

      const agent = {
        id: "test-tool",
        name: "Test Tool",
        type: "cli",
        installed: true,
        path: "/test/path",
        version: "1.0",
      };

      const originalDirs = require("../../src/core/agent_registry").NATIVE_SESSION_DIRS;
      originalDirs["test-tool"] = sessionDir;

      try {
        const state = await collector.collect(agent);
        expect(state.tokenExhausted).toBe(true);
        expect(state.tokenExhaustionReason).toContain("context");
      } finally {
        delete originalDirs["test-tool"];
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("token exhaustion detection", () => {
    it("should detect token exhaustion from high conversation depth", async () => {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stigmergy-test-"));
      const sessionDir = path.join(tmpDir, "sessions");
      fs.mkdirSync(sessionDir, { recursive: true });

      for (let i = 0; i < 5; i++) {
        const lines = Array(100).fill("message");
        fs.writeFileSync(path.join(sessionDir, `session-${1000000000000 + i}.json`), lines.join("\n"));
      }

      const agent = {
        id: "test-tool",
        name: "Test Tool",
        type: "cli",
        installed: true,
        path: "/test/path",
        version: "1.0",
      };

      const testCollector = new AgentStateCollector({
        agentStatesDir: path.join(__dirname, "..", "..", "..", "agent-states"),
      });
      testCollector._estimateConversationDepth = async () => 100;

      const state = await testCollector.collect(agent);
      expect(state.tokenExhausted).toBe(true);
      expect(state.conversationDepth).toBeGreaterThan(80);

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should detect token exhaustion from session file content", async () => {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stigmergy-test-"));
      const sessionDir = path.join(tmpDir, "sessions");
      fs.mkdirSync(sessionDir, { recursive: true });
      fs.writeFileSync(path.join(sessionDir, "session-1234567890123.json"), JSON.stringify({ error: "context_length_exceeded: maximum context reached" }));

      const agent = {
        id: "test-tool",
        name: "Test Tool",
        type: "cli",
        installed: true,
        path: "/test/path",
        version: "1.0",
      };

      const originalDirs = require("../../src/core/agent_registry").NATIVE_SESSION_DIRS;
      originalDirs["test-tool"] = sessionDir;

      try {
        const state = await collector.collect(agent);
        expect(state.tokenExhausted).toBe(true);
        expect(state.tokenExhaustionReason).toContain("context");
      } finally {
        delete originalDirs["test-tool"];
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
