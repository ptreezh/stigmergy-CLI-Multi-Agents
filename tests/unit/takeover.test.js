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

const { handleTakeoverCommand } = require("../../src/cli/commands/takeover");

describe("Takeover CLI Command", () => {
  const originalExit = process.exit;

  beforeEach(() => {
    process.exit = jest.fn();
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  it("should export handleTakeoverCommand function", () => {
    expect(typeof handleTakeoverCommand).toBe("function");
  });

  it("should fail when source agent is not token exhausted", async () => {
    await expect(handleTakeoverCommand({ from: "claude", to: "qwen" })).resolves.toBeUndefined();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
