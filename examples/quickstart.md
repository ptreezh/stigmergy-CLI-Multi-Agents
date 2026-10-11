# Quickstart — a real 60-second demo

This is a **verbatim transcript** captured from a real run on the maintainer's
machine (Windows, 2026-10-11) using `node src/index.js` from the repository
root. The only edits are the `…` marks, which indicate output trimmed for
readability (the full-screen CJK welcome banner is also omitted from the
`scan`/`skill list` blocks — it prints first, before the real work).

You can reproduce every line below yourself:

```bash
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents
node src/index.js --version
node src/index.js scan
node src/index.js skill list
```

## 1. Version

```console
$ stigmergy --version
1.11.0
```

## 2. Detect what is actually on this machine

`scan` probes your `PATH` (and common desktop install locations) and reports
**only what it finds** — there is no hard-coded CLI list.

```console
$ stigmergy scan
 Scanning for all AI agents...
[DETECTOR] Starting comprehensive CLI path detection...
[DETECTOR] Detecting path for claude...
[DETECTOR] Found claude in PATH: F:\npm-global\claude
[DETECTOR] Detecting path for gemini...
[DETECTOR] Found gemini in PATH: F:\npm-global\gemini
…
[DETECTOR] Detecting path for copilot...
[DETECTOR] copilot not found
…
[DETECTOR] Detecting path for kode...
[DETECTOR] kode not found
…
[DETECTOR] Saved path cache to: C:\Users\Zhang\.stigmergy\cli-paths\detected-paths.json

 Found 9 CLI tools:
   Claude CLI
     Version: 2.1.295 (Claude Code)
     Path: F:\npm-global\claude
   Gemini CLI
     Version: 0.63.0
     Path: F:\npm-global\gemini
   Qwen CLI
     Version: 0.25.0
     Path: F:\npm-global\qwen
   iFlow CLI
     Version: 0.5.19
     Path: F:\npm-global\iflow
   OpenCode AI CLI
     Version: 1.18.35
     Path: F:\npm-global\opencode
   Qoder CLI
     Version: 1.1.66
     Path: F:\npm-global\qodercli
   CodeBuddy CLI
     Version: 2.162.0
     Path: F:\npm-global\codebuddy
   KiloCode CLI
     Version: 7.8.8
     Path: F:\npm-global\kilo
   OpenAI Codex CLI
     Version: codex-cli 0.146.0
     Path: F:\npm-global\codex

 Scan Summary:
  Total checked: 33
  CLI tools: 18
  Desktop agents: 13
  Evolved agents: 2
  Session dirs: 7
```

Notice `copilot` and `kode` were probed but **not** reported as found — the
list reflects reality, not a marketing claim.

## 3. Every skill Stigmergy has unified

`skill list` counts only skills actually installed across your CLIs.

```console
$ stigmergy skill list
Installed skills (352):

[UNIVERSAL] universal:
  • algorithmic-art                Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. …
  • brainstorming                  You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. …
  • brand-positioning              跨境品牌定位与本土化技能，提供市场分析、品牌定位、视觉设计和传播策略的完整方案
  • business-ecosystem-analysis    商业生态系统分析技能，整合多个子技能进行全面的商业生态系统分析
  …
```

## 4. The payload: install once, read everywhere

```console
$ stigmergy skill install anthropics/skills
$ stigmergy skill read pdf        # prints SKILL.md for the calling agent
```

After hooks are deployed, the same skill store is readable by Claude, Gemini,
Qwen, iFlow, Qoder, CodeBuddy, Codex, KiloCode and opencode.
