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

describe("AgentCoordinator Auto-Coordinator", () => {
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

  afterEach(() => {
    if (coordinator.autoCoordinationTimer) {
      coordinator.stopAutoCoordination();
    }
  });

  describe("startAutoCoordination", () => {
    it("should start auto-coordination with default interval", async () => {
      const result = coordinator.startAutoCoordination();
      expect(result).toHaveProperty("started", true);
      expect(result).toHaveProperty("intervalMs", 4 * 60 * 60 * 1000);
      expect(coordinator.autoCoordinationEnabled).toBe(true);
    });

    it("should accept custom interval in hours", async () => {
      const result = coordinator.startAutoCoordination({ interval: 2 * 60 * 60 * 1000 });
      expect(result.intervalMs).toBe(2 * 60 * 60 * 1000);
    });

    it("should clear previous timer when starting again", async () => {
      const firstTimer = coordinator.autoCoordinationTimer;
      coordinator.startAutoCoordination({ interval: 1000 });
      expect(coordinator.autoCoordinationTimer).not.toBe(firstTimer);
    });

    it("should record start event in history", async () => {
      coordinator.startAutoCoordination();
      const status = coordinator.getAutoCoordinationStatus();
      expect(status.history.length).toBeGreaterThan(0);
      expect(status.history[0].type).toBe("started");
    });
  });

  describe("stopAutoCoordination", () => {
    it("should stop auto-coordination", async () => {
      coordinator.startAutoCoordination();
      expect(coordinator.autoCoordinationEnabled).toBe(true);

      const result = coordinator.stopAutoCoordination();
      expect(result).toHaveProperty("stopped", true);
      expect(coordinator.autoCoordinationEnabled).toBe(false);
      expect(coordinator.autoCoordinationTimer).toBeNull();
    });

    it("should record stop event in history", async () => {
      coordinator.startAutoCoordination();
      coordinator.stopAutoCoordination();
      const status = coordinator.getAutoCoordinationStatus();
      const lastEvent = status.history[status.history.length - 1];
      expect(lastEvent.type).toBe("stopped");
    });

    it("should handle stop when not started", async () => {
      const result = coordinator.stopAutoCoordination();
      expect(result.stopped).toBe(true);
    });
  });

  describe("getAutoCoordinationStatus", () => {
    it("should return status object with expected fields", async () => {
      const status = coordinator.getAutoCoordinationStatus();
      expect(status).toHaveProperty("enabled");
      expect(status).toHaveProperty("intervalMs");
      expect(status).toHaveProperty("lastRun");
      expect(status).toHaveProperty("history");
    });

    it("should show disabled by default", async () => {
      const status = coordinator.getAutoCoordinationStatus();
      expect(status.enabled).toBe(false);
      expect(status.lastRun).toBeNull();
    });
  });

  describe("autoCoordinate", () => {
    it("should complete a coordination cycle", async () => {
      const result = await coordinator.autoCoordinate();
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("scanned");
      expect(result).toHaveProperty("actions");
      expect(typeof result.scanned).toBe("number");
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it("should record lastAutoCoordination timestamp", async () => {
      await coordinator.autoCoordinate();
      expect(coordinator.lastAutoCoordination).toBeDefined();
      expect(new Date(coordinator.lastAutoCoordination).getTime()).not.toBe(NaN);
    });

    it("should append cycle to history", async () => {
      await coordinator.autoCoordinate();
      const status = coordinator.getAutoCoordinationStatus();
      const cycleEvent = status.history.find((h) => h.type === "cycle");
      expect(cycleEvent).toBeDefined();
    });
  });

  describe("_extractTaskContext", () => {
    it("should detect 'test' context", () => {
      const ctx = coordinator._extractTaskContext("run unit tests for auth module");
      expect(ctx).toBe("test");
    });

    it("should detect 'review' context", () => {
      const ctx = coordinator._extractTaskContext("please review this PR");
      expect(ctx).toBe("review");
    });

    it("should detect 'deploy' context", () => {
      const ctx = coordinator._extractTaskContext("deploy to production");
      expect(ctx).toBe("deploy");
    });

    it("should return 'general' for unknown context", () => {
      const ctx = coordinator._extractTaskContext("hello world");
      expect(ctx).toBe("general");
    });

    it("should return 'general' for null task", () => {
      const ctx = coordinator._extractTaskContext(null);
      expect(ctx).toBe("general");
    });
  });

  describe("_scoreAgentForTask", () => {
    it("should return 1 for general task context", () => {
      const score = coordinator._scoreAgentForTask(
        { status: "idle", lastUsed: null },
        { taskTypes: [], keywords: [] },
        "general"
      );
      expect(score).toBe(1);
    });

    it("should give higher score for matching task types", () => {
      const score = coordinator._scoreAgentForTask(
        { status: "idle", lastUsed: new Date().toISOString() },
        { taskTypes: ["test"], keywords: [] },
        "test"
      );
      expect(score).toBeGreaterThan(10);
    });

    it("should give idle status bonus when task context matches", () => {
      const score = coordinator._scoreAgentForTask(
        { status: "idle", lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { taskTypes: ["test"], keywords: [] },
        "test"
      );
      expect(score).toBeGreaterThan(10);
    });
  });

  describe("suggestTakeover", () => {
    it("should return suggestions structure", async () => {
      const result = await coordinator.suggestTakeover();
      expect(result).toHaveProperty("suggestions");
      expect(Array.isArray(result.suggestions)).toBe(true);
      if (result.suggestions.length > 0) {
        expect(result).toHaveProperty("exhaustedCount");
        expect(result).toHaveProperty("idleCount");
      }
    });
  });

  describe("takeOver", () => {
    it("should fail when source agent is not token exhausted", async () => {
      const result = await coordinator.takeOver("claude", "qwen", "test");
      expect(result.success).toBe(false);
      expect(result.error).toContain("not token exhausted");
    });
  });

  describe("routeTaskByContext", () => {
    it("should return routing decision with scoredCandidates", async () => {
      const result = await coordinator.routeTaskByContext("run tests for api", {
        taskContext: "test",
      });
      expect(result).toHaveProperty("agent");
      expect(result).toHaveProperty("reason");
      expect(result).toHaveProperty("scoredCandidates");
      expect(Array.isArray(result.scoredCandidates)).toBe(true);
    });

    it("should route with context-match when general context is used", async () => {
      const result = await coordinator.routeTaskByContext("hello world", {
        taskContext: "general",
      });
      expect(result).toHaveProperty("agent");
      expect(result.reason).toContain("context-match");
    });
  });
});
