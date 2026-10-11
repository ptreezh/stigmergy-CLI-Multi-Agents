/**
 * Canonical single-CLI memory file locations.
 *
 * Single source of truth shared by the project-level skill sync
 * (StigmergySkillManager.sync) and the global home-dir installer
 * (StigmergyInstaller.appendToToolMdFile). Keeping both paths on one map is
 * the fix for the case-sensitivity hazard: previously the manager wrote
 * lowercase names (claude.md) that no CLI reads on case-sensitive filesystems,
 * and the installer used invented names (copilot.md, codex.md, qodercli.md).
 *
 * Verified 2026-10-11 against each vendor's own docs:
 *  - Claude    ~/.claude/CLAUDE.md               (project: CLAUDE.md)
 *  - Gemini    ~/.gemini/GEMINI.md               (project: GEMINI.md)
 *  - Qwen      ~/.qwen/QWEN.md                   (project: QWEN.md)
 *  - iFlow     ~/.iflow/IFLOW.md                 (project: IFLOW.md)
 *  - CodeBuddy ~/.codebuddy/CODEBUDDY.md         (project: CODEBUDDY.md)
 *  - Qoder     ~/.qoder/AGENTS.md                (project: AGENTS.md)
 *  - Codex     ~/.codex/AGENTS.md                (project: AGENTS.md)
 *  - KiloCode  ~/.kilocode/AGENTS.md             (project: AGENTS.md)
 *  - Copilot   ~/.copilot/copilot-instructions.md
 *              (Copilot also auto-discovers AGENTS.md/CLAUDE.md/GEMINI.md)
 */

const path = require("path");
const os = require("os");

// Project-level files written by StigmergySkillManager.sync().
// AGENTS.md-family CLIs (codex/qoder/kilocode) and Copilot are intentionally
// NOT synced at project level: AGENTS.md-family is delivered globally by the
// installer (avoids repo pollution), and Copilot auto-discovers CLAUDE.md /
// GEMINI.md / AGENTS.md already.
const CLI_MEMORY_FILES = [
  "CLAUDE.md",
  "GEMINI.md",
  "QWEN.md",
  "IFLOW.md",
  "CODEBUDDY.md",
];

// Global home-dir files appended to by StigmergyInstaller.appendToToolMdFile().
function getToolMdFiles(homedir) {
  const home = homedir || os.homedir();
  return {
    claude: path.join(home, ".claude", "CLAUDE.md"),
    gemini: path.join(home, ".gemini", "GEMINI.md"),
    qwen: path.join(home, ".qwen", "QWEN.md"),
    iflow: path.join(home, ".iflow", "IFLOW.md"),
    qodercli: path.join(home, ".qoder", "AGENTS.md"),
    codebuddy: path.join(home, ".codebuddy", "CODEBUDDY.md"),
    copilot: path.join(home, ".copilot", "copilot-instructions.md"),
    codex: path.join(home, ".codex", "AGENTS.md"),
    kilocode: path.join(home, ".kilocode", "AGENTS.md"),
  };
}

module.exports = { CLI_MEMORY_FILES, getToolMdFiles };
