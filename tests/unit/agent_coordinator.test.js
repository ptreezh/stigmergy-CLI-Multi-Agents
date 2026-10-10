const path = require("path");

jest.mock("child_process", () => ({
  spawnSync: jest.fn(() => ({ status: 0, stdout: "1.0.0-mock", stderr: "" })),
}));

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

const { AgentCoordinator } = require("../../src/core/agent_coordinator");

describe("AgentCoordinator", () => {
  let coordinator;

  beforeEach(async () => {
    coordinator = new AgentCoordinator({
      registryOptions: {
        agentStatesDir: path.join(__dirname, "..", "fixtures", "agent-states"),
        cacheTTL: 30000,
      },
      collectorOptions: {
        agentStatesDir: path.join(__dirname, "..", "fixtures", "agent-states"),
      },
    });
    await coordinator.initialize();
  });

  describe("initialize", () => {
    it("should initialize coordinator without throwing", async () => {
      expect(coordinator.registry).toBeDefined();
      expect(coordinator.getAllAgentStates().length).toBeGreaterThan(0);
    });
  });

  describe("getAllAgentStates", () => {
    it("should return array of agent states", async () => {
      const states = coordinator.getAllAgentStates();
      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBeGreaterThan(0);
    });

    it("each state should have id, name, type, status fields", async () => {
      const states = coordinator.getAllAgentStates();
      for (const state of states) {
        expect(state).toHaveProperty("id");
        expect(state).toHaveProperty("name");
        expect(state).toHaveProperty("type");
        expect(state).toHaveProperty("status");
      }
    });
  });

  describe("getAvailableAgents", () => {
    it("should return only installed and non-offline agents", async () => {
      const available = coordinator.getAvailableAgents();
      expect(Array.isArray(available)).toBe(true);

      for (const agent of available) {
        expect(agent.installed).toBe(true);
        expect(agent.status).not.toBe("offline");
      }
    });
  });

  describe("getIdleAgents", () => {
    it("should return agents with idle status", async () => {
      const idle = coordinator.getIdleAgents();
      expect(Array.isArray(idle)).toBe(true);

      for (const agent of idle) {
        expect(agent.status).toBe("idle");
      }
    });
  });

  describe("getTokenExhaustedAgents", () => {
    it("should return agents with tokenExhausted flag", async () => {
      const exhausted = coordinator.getTokenExhaustedAgents();
      expect(Array.isArray(exhausted)).toBe(true);

      for (const agent of exhausted) {
        expect(agent.tokenExhausted).toBe(true);
      }
    });
  });

  describe("routeTask", () => {
    it("should return a routing decision with agent and reason", async () => {
      const result = await coordinator.routeTask("test task");

      expect(result).toHaveProperty("agent");
      expect(result).toHaveProperty("reason");
      expect(result).toHaveProperty("state");
    });

    it("should respect forceAgent option", async () => {
      const registryData = await coordinator.registry.scanAll();
      const available = registryData.cli.filter((a) => a.installed);
      if (available.length > 0) {
        const result = await coordinator.routeTask("test", { agent: available[0].id, forceAgent: true });
        expect(result.agent).toBe(available[0].id);
        expect(result.reason).toBe("forced");
      }
    });
  });

  describe("recordTaskResult", () => {
    it("should record success without incrementing failure count", async () => {
      await coordinator.recordTaskResult("test-agent", "test task", true);
      const failures = coordinator.failureCounts.get("test-agent");
      expect(failures).toBe(0);
    });

    it("should record failure and increment failure count", async () => {
      await coordinator.recordTaskResult("test-agent-2", "test task", false, "some error");
      const failures = coordinator.failureCounts.get("test-agent-2");
      expect(failures).toBe(1);
    });
  });

  describe("takeOver", () => {
    it("should fail if source agent is not token exhausted", async () => {
      const result = await coordinator.takeOver("claude", "qwen", "test task");
      expect(result.success).toBe(false);
    });
  });

  describe("suggestTakeover", () => {
    it("should return suggestions array", async () => {
      const result = await coordinator.suggestTakeover();
      expect(result).toHaveProperty("suggestions");
      expect(result).toHaveProperty("exhaustedCount");
      expect(result).toHaveProperty("idleCount");
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe("getDashboard", () => {
    it("should return dashboard with summary, agents, and takeover", async () => {
      const dashboard = await coordinator.getDashboard();

      expect(dashboard).toHaveProperty("summary");
      expect(dashboard).toHaveProperty("agents");
      expect(dashboard).toHaveProperty("takeover");
      expect(dashboard).toHaveProperty("generatedAt");

      expect(dashboard.summary).toHaveProperty("total");
      expect(dashboard.summary).toHaveProperty("installed");
      expect(dashboard.summary).toHaveProperty("active");
      expect(dashboard.summary).toHaveProperty("idle");
      expect(dashboard.summary).toHaveProperty("tokenExhausted");
    });
  });
});
