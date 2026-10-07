# Agent Forensics Scanner — Converged Plan

**Document state**: Converged, ready for execution  
**T-Level**: T3 (architecture, privacy-sensitive)  
**Date**: 2026-10-05  
**Status**: PHASE 4 — COMMITTED

---

## Executive Summary

Build `agent-forensics`, a cross-platform (Windows/macOS/Linux) scanner that identifies C-end AI agent deployments on a target machine, reports their install paths, session stores, working status, and current tasks.

**v1 scope**: Two-layer scanner — filesystem signature scan + process live inspection.  
**v2 scope**: Add MCP cooperative query + OS telemetry aggregation.  
**Out of scope**: Mobile agents, Docker-only agents, server-side enterprise agents.

**Safety**: Read-only, no writes to target machine, requires user consent, works within current user permissions (no privilege escalation).

---

## Decision Register

| # | Decision | Status | Evidence | Falsifier | Reversibility |
|---|----------|--------|----------|-----------|---------------|
| 1 | v1 = Option E (A+B layers only), not pure A/B/C/D | **SETTLED** | Single-layer options have blind spots; E with A+B covers 90% of real-world cases | If A+B maintenance burden exceeds value, revert to A-only | MEDIUM: dropping Layer B later is cheap |
| 2 | Layer C (MCP cooperative) is v2, not v1 | **SETTLED** | No agent currently implements the protocol; chicken-and-egg makes it useless now | If 3+ major agents adopt MCP forensics extension within 6 months, promote to v1 | HIGH: adding a layer is cheap |
| 3 | Layer D (OS telemetry) is v2, not v1 | **SETTLED** | Requires admin/sudo for full access; violates "no privilege escalation" constraint | If OS telemetry APIs become available to regular users, promote to v1 | HIGH: adding a layer is cheap |
| 4 | Target top-20 C-end agents (中美两国) | **SETTLED** | User explicitly requested 中美两国 C-end focus; enterprise agents out of scope | If user requests enterprise agents later, expand scope | MEDIUM: signature DB expansion is straightforward |
| 5 | Read-only, zero writes to target | **SETTLED** | Ethical requirement; tool is forensics, not tampering | N/A — this is a constraint, not a hypothesis | N/A |
| 6 | No admin/sudo required | **SETTLED** | Must work on locked-down machines (corporate, personal without password) | If > 30% of useful data requires admin, reconsider | LOW: can add optional elevated mode later |
| 7 | Output format: structured JSON + human-readable table | **SETTLED** | JSON for machine consumption (CI, scripts), table for human TUI | If users prefer other formats, add exporters | HIGH: format is serialization concern |
| 8 | Language: TypeScript/Node.js | **SETTLED** | Existing project is Node.js; good cross-platform filesystem/process APIs; team expertise | If performance becomes issue, consider Rust rewrite | MEDIUM: rewrite is expensive |
| 9 | Signature DB: bundled YAML/JSON, updateable via npm | **SETTLED** | Easy to distribute, easy to update, human-readable | If update frequency exceeds npm cadence, move to online API | LOW: swap storage backend |
| 10 | Cloud-only agents (豆包, 通义, Kimi) report as UNKNOWN | **SETTLED** | Cannot access their server-side state; any local cache is undocumented/encrypted | If these agents add documented local caches, update signatures | LOW: just add new signatures |
| 11 | Ethical guardrail: consent check + usage warning | **SETTLED** | Tool is dual-use (forensics vs surveillance); must prevent misuse | N/A — ethical requirement | N/A |

---

## Assumptions Register

| # | Assumption | Risk if Wrong | Mitigation |
|---|-----------|--------------|-----------|
| 1 | Top-20 agents' install paths and session formats are stable enough to document | HIGH: frequent updates break scanner | Online-updatable signature DB; version-pinning |
| 2 | Agent session stores are readable by the current user (no encryption/Keychain) | MEDIUM: some stores may be encrypted | Document known-encrypted cases; report as "encrypted" rather than fail |
| 3 | Process enumeration APIs work on target OS without special permissions | MEDIUM: some OSes restrict process listing | Fallback to filesystem-only mode if process API fails |
| 4 | User has legal right to inspect target machine | CRITICAL | Consent prompt + legal warning in tool |
| 5 | Top-20 agents have not moved to fully cloud-only by late 2026 | MEDIUM | Accept "UNKNOWN" for cloud-only; tool still useful for local agents |

---

## Risk Table

| Risk | Severity | Likelihood | Mitigation | Owner |
|---|---------|-----------|-----------|-------|
| Privacy misuse (surveillance) | CRITICAL | MEDIUM | Consent prompt, legal warning, read-only guarantee | Human |
| Signature DB staleness | HIGH | HIGH | Online update mechanism, community contributions | TBD |
| Cloud-only agents invisible | MEDIUM | HIGH (by design) | Accept limitation; document clearly | TBD |
| OS permission barriers | MEDIUM | LOW-MEDIUM | Graceful degradation to Layer A only | TBD |
| Agent obfuscation (agents hiding) | LOW | LOW | Accept as arms race; focus on standard deployments | TBD |
| Cross-platform path resolution bugs | MEDIUM | MEDIUM | Test matrix: Windows/macOS/Linux, CI | TBD |

---

## Architecture Sketch

```
agent-forensics/
├── src/
│   ├── scanner/
│   │   ├── layer-a-filesystem.ts      # Signature-based file scan
│   │   ├── layer-b-process.ts         # Process enumeration + live state
│   │   └── orchestrator.ts            # Layer coordination, output assembly
│   ├── signatures/
│   │   ├── index.ts                   # Agent signature registry
│   │   ├── claude-code.ts
│   │   ├── cursor.ts
│   │   ├── openclaw.ts
│   │   ├── doubao.ts
│   │   └── ... (top-20 agents)
│   ├── models/
│   │   ├── agent-install.ts           # AgentInstall interface
│   │   ├── session-store.ts           # SessionStore interface
│   │   └── task-status.ts             # TaskStatus enum
│   ├── platform/
│   │   ├── paths.ts                   # OS-specific path resolution
│   │   └── process.ts                 # OS-specific process APIs
│   └── cli.ts                         # Entry point
├── signatures.yaml                     # Bundled signature DB (updateable)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/                       # Mock agent installations
└── package.json
```

---

## Top-20 Target Agents (v1 Signatures)

### Tier 1: High local footprint (Priority 1)
1. Claude Code (Anthropic) — JSONL sessions in ~/.claude/projects/
2. Cursor (Cursor AI) — SQLite in ~/Library/Application Support/Cursor/User/
3. OpenClaw — SQLite + JSONL in ~/.openclaw/agents/<id>/
4. Goose (Block) — JSONL in ~/.goose/
5. Codex CLI (OpenAI) — %USERPROFILE%.codex
6. Cline (Cline) — VS Code extension, state in .claude/

### Tier 2: Moderate local footprint (Priority 2)
7. ChatGPT Desktop (OpenAI) — Cloud-only, minimal local state
8. Kilo — JSONL in ~/.kilo/
9. Claude Desktop (Anthropic) — App bundle, limited local state
10. Windsurf — Similar to Cursor
11. GitHub Copilot — IDE extension state
12. Devin Desktop — App bundle, session state?

### Tier 3: Cloud-dominant (Priority 3, report UNKNOWN)
13. 豆包 (ByteDance) — Cloud-only, PC client no documented local DB
14. 通义千问 (Alibaba) — Cloud-only
15. DeepSeek — Cloud-only
16. Kimi (Moonshot) — Cloud-only
17. 腾讯元宝 (Tencent) — Cloud-only
18. 百度文心 (Baidu) — Cloud-only
19. 智谱清言 (Zhipu) — Cloud-only
20. 微信小微 (Tencent) — Embedded in WeChat, no standalone local state

---

## Output Schema

```typescript
interface ForensicsReport {
  scanTime: string;
  target: {
    hostname: string;
    os: string;
    arch: string;
    username: string;
  };
  agents: AgentReport[];
  summary: {
    totalFound: number;
    active: number;
    idle: number;
    unknown: number;
  };
}

interface AgentReport {
  id: string;
  name: string;
  vendor: string;
  status: "active" | "idle" | "unknown";
  install: {
    path: string;
    version?: string;
    config?: string;
  };
  sessions: {
    total?: number;
    active?: number;
    store: {
      type: "jsonl" | "sqlite" | "vscdb" | "cloud" | "unknown";
      path?: string;
      note?: string;
    };
  };
  currentTask?: string;           // Best-effort inference, or null
  currentTaskConfidence?: "high" | "medium" | "low" | "none";
  recentTasks?: RecentTask[];
  layer: ("filesystem" | "process" | "mcp" | "telemetry")[];
  confidence: "high" | "medium" | "low";
  limitation?: string;
}

interface RecentTask {
  sessionId: string;
  title: string;
  lastActive: string;
}
```

---

## Implementation Order

### Week 1: Foundation
1. Project scaffold (TypeScript, tests, CI)
2. Platform abstraction layer (paths.ts, process.ts)
3. Base signature interfaces and registry

### Week 2: Layer A (Filesystem Scanner)
1. Implement signature matching engine
2. Implement Tier 1 agents (Claude Code, Cursor, OpenClaw, Goose, Codex CLI, Cline)
3. Session store parsers (JSONL, SQLite, VSCDB)
4. CLI output (table + JSON)

### Week 3: Layer B (Process Inspector)
1. Process enumeration (cross-platform)
2. Network connection inspection
3. Open file enumeration
4. Current task inference heuristics
5. Tier 2 agents (ChatGPT Desktop, Kilo, Claude Desktop, etc.)

### Week 4: Polish + Tier 3
1. Tier 3 cloud-only agents (report as UNKNOWN)
2. Consent prompt + legal warning
3. Test matrix (Windows/macOS/Linux CI)
4. Documentation + npm publish

### v2 (Future)
1. Layer C: MCP cooperative protocol
2. Layer D: OS telemetry aggregation
3. Online signature DB API
4. Historical timeline view

---

## Open Questions

| # | Question | Priority | Resolution Path |
|---|---------|----------|----------------|
| 1 | Should we support scanning from USB (portable mode)? | MEDIUM | Yes — single binary, no install |
| 2 | Should we expose a library API (in addition to CLI)? | LOW | Future consideration |
| 3 | Should we add "watch" mode (continuous monitoring)? | LOW | v2 or never |
| 4 | How to handle encrypted session stores (Keychain, DPAPI)? | MEDIUM | Report as "encrypted"; don't attempt decryption |
| 5 | Should we integrate with existing tools (osquery, Mantyl)? | MEDIUM | Consider as data source, not replacement |

---

## Revision Log

| Date | Author | Change |
|------|--------|--------|
| 2026-10-05 | Kilo | Initial converged plan (T3 deliberation) |
