const { buildMatcher, normalize } = require("../../../src/agent-forensics/matcher");
const SIGNATURES = require("../../../src/agent-forensics/signatures");

describe("matcher", () => {
  const matcher = buildMatcher(SIGNATURES.SIGNATURES);

  test("byExactName matches exact alias", () => {
    expect(matcher.byExactName("Claude Code")?.id).toBe("claude-code");
    expect(matcher.byExactName("codex cli")?.id).toBe("codex-cli");
  });

  test("byProcess matches process name", () => {
    expect(matcher.byProcess("ollama app.exe")?.id).toBe("ollama");
    expect(matcher.byProcess("claude.exe")?.id).toBe("claude-code");
    expect(matcher.byProcess("codex.exe")?.id).toBe("codex-cli");
  });

  test("byNpmPackage matches npm package", () => {
    expect(matcher.byNpmPackage("@anthropic-ai/claude-code")?.id).toBe("claude-code");
    expect(matcher.byNpmPackage("@openai/codex")?.id).toBe("codex-cli");
    expect(matcher.byNpmPackage("@kilocode/cli")?.id).toBe("kilocode");
  });

  test("byDirName matches directory names", () => {
    expect(matcher.byDirName(".claude", "home")?.id).toBe("claude-code");
    expect(matcher.byDirName(".codex", "home")?.id).toBe("codex-cli");
    expect(matcher.byDirName("claude-desktop", "roaming")?.id).toBe("claude-desktop");
  });

  test("normalize strips punctuation and lowercases", () => {
    expect(normalize("Claude-Code")).toBe("claudecode");
    expect(normalize("@anthropic-ai/claude-code")).toBe("@anthropicai/claudecode");
  });
});