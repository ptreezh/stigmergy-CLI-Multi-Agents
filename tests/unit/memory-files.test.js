const path = require("path");
const {
  CLI_MEMORY_FILES,
  getToolMdFiles,
} = require("../../src/core/memory_files");

describe("canonical single-CLI memory filenames", () => {
  describe("CLI_MEMORY_FILES (project-level sync targets)", () => {
    it("contains only the canonical uppercase per-CLI files", () => {
      expect(CLI_MEMORY_FILES).toEqual([
        "CLAUDE.md",
        "GEMINI.md",
        "QWEN.md",
        "IFLOW.md",
        "CODEBUDDY.md",
      ]);
    });

    it("has no lowercase legacy names", () => {
      expect(CLI_MEMORY_FILES).not.toContain("claude.md");
      expect(CLI_MEMORY_FILES).not.toContain("gemini.md");
      expect(CLI_MEMORY_FILES).not.toContain("qwen.md");
      expect(CLI_MEMORY_FILES).not.toContain("iflow.md");
      expect(CLI_MEMORY_FILES).not.toContain("codebuddy.md");
    });

    it("excludes invented names that no CLI actually reads", () => {
      expect(CLI_MEMORY_FILES).not.toContain("qodercli.md");
      expect(CLI_MEMORY_FILES).not.toContain("copilot.md");
      expect(CLI_MEMORY_FILES).not.toContain("codex.md");
    });

    it("excludes AGENTS.md family at project level (global-only per design)", () => {
      expect(CLI_MEMORY_FILES).not.toContain("AGENTS.md");
    });
  });

  describe("getToolMdFiles (global home-dir targets)", () => {
    const files = getToolMdFiles("/home/test");

    it("uses canonical filenames for per-CLI files", () => {
      expect(path.basename(files.claude)).toBe("CLAUDE.md");
      expect(path.basename(files.gemini)).toBe("GEMINI.md");
      expect(path.basename(files.qwen)).toBe("QWEN.md");
      expect(path.basename(files.iflow)).toBe("IFLOW.md");
      expect(path.basename(files.codebuddy)).toBe("CODEBUDDY.md");
    });

    it("maps AGENTS.md-family CLIs to AGENTS.md", () => {
      expect(path.basename(files.qodercli)).toBe("AGENTS.md");
      expect(path.basename(files.codex)).toBe("AGENTS.md");
      expect(path.basename(files.kilocode)).toBe("AGENTS.md");
    });

    it("maps Copilot to copilot-instructions.md", () => {
      expect(path.basename(files.copilot)).toBe("copilot-instructions.md");
    });

    it("points at the documented home directories", () => {
      expect(files.claude).toBe(
        path.join("/home/test", ".claude", "CLAUDE.md"),
      );
      expect(files.qodercli).toBe(
        path.join("/home/test", ".qoder", "AGENTS.md"),
      );
      expect(files.copilot).toBe(
        path.join("/home/test", ".copilot", "copilot-instructions.md"),
      );
      expect(files.kilocode).toBe(
        path.join("/home/test", ".kilocode", "AGENTS.md"),
      );
    });

    it("has no lowercase legacy or invented filenames anywhere", () => {
      const banned = [
        "claude.md",
        "gemini.md",
        "qwen.md",
        "iflow.md",
        "qoder.md",
        "codebuddy.md",
        "copilot.md",
        "codex.md",
      ];
      for (const filePath of Object.values(files)) {
        expect(banned).not.toContain(path.basename(filePath));
      }
    });
  });
});
