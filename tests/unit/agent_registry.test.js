const path = require("path");

// Prevent real `spawnSync("<cli>", ["--version"])` calls during version
// detection (agent_registry.js _scanCLITools). The path-detector mock reports
// 8 CLIs as installed, so 8 real process spawns happened per scanAll() before
// this mock existed — the dominant cost of the ~84s suite.
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

const { AgentRegistry, AGENT_STATES_DIR } = require("../../src/core/agent_registry");

describe("AgentRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = new AgentRegistry({
      // Deterministic fixture instead of the live repo agent-states/ dir.
      agentStatesDir: path.join(__dirname, "..", "fixtures", "agent-states"),
      // NB: cacheTTL of 0 would silently fall back to 30000
      // (`options.cacheTTL || 30000` in the constructor); be explicit so the
      // cache-across-two-scans TTL semantics are visible and stable.
      cacheTTL: 30000,
    });
  });

  describe("scanAll", () => {
    it("should return registry with cli, desktop, evolved, sessions, and total", async () => {
      const result = await registry.scanAll();

      expect(result).toHaveProperty("cli");
      expect(result).toHaveProperty("desktop");
      expect(result).toHaveProperty("evolved");
      expect(result).toHaveProperty("sessions");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("scannedAt");
      expect(Array.isArray(result.cli)).toBe(true);
      expect(Array.isArray(result.desktop)).toBe(true);
      expect(Array.isArray(result.evolved)).toBe(true);
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("should include cli tools with installed, path, version fields", async () => {
      const result = await registry.scanAll();
      const firstCLI = result.cli[0];

      expect(firstCLI).toHaveProperty("id");
      expect(firstCLI).toHaveProperty("name");
      expect(firstCLI).toHaveProperty("type", "cli");
      expect(firstCLI).toHaveProperty("installed");
      expect(firstCLI).toHaveProperty("agentStatesDir");
      expect(firstCLI).toHaveProperty("hasStateDir");
    });

    it("should detect evolved agents from agent-states directory when present", async () => {
      const result = await registry.scanAll();
      const hasEvolved = result.evolved.some((a) => a.type === "evolved");
      if (hasEvolved) {
        for (const agent of result.evolved) {
          expect(agent.type).toBe("evolved");
          expect(agent).toHaveProperty("agentStatesDir");
          expect(agent.hasStateDir).toBe(true);
        }
      }
    });

    it("should cache results and respect TTL", async () => {
      const first = await registry.scanAll();
      const second = await registry.scanAll();

      expect(first.scannedAt).toBe(second.scannedAt);
    });

    it("should invalidate cache when requested", async () => {
      await registry.scanAll();
      registry.invalidateCache();

      const first = await registry.scanAll();
      // With spawnSync mocked, scans now finish in <1ms; pace explicitly so the
      // two scannedAt ISO timestamps are guaranteed to differ.
      await new Promise((resolve) => setTimeout(resolve, 10));
      await registry.scanAll();
      registry.invalidateCache();
      const second = await registry.scanAll();

      expect(first.scannedAt).not.toBe(second.scannedAt);
    });
  });

  describe("getAgent", () => {
    it("should return agent by id or name", async () => {
      const result = await registry.scanAll();
      const all = [...result.cli, ...result.desktop, ...result.evolved];

      if (all.length > 0) {
        const agent = await registry.getAgent(all[0].id);
        expect(agent).not.toBeNull();
        expect(agent.id).toBe(all[0].id);
      }
    });

    it("should return null for unknown agent", async () => {
      const agent = await registry.getAgent("nonexistent-agent-xyz");
      expect(agent).toBeNull();
    });
  });

  describe("listAvailable", () => {
    it("should return installed cli, desktop, and evolved agents", async () => {
      const available = await registry.listAvailable();

      expect(available).toHaveProperty("cli");
      expect(available).toHaveProperty("desktop");
      expect(available).toHaveProperty("evolved");
      expect(Array.isArray(available.cli)).toBe(true);
    });
  });
});
