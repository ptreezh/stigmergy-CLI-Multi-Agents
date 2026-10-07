# Stigmergy Wiki Scanner — Verified Implementation Plan

## 0. Ground Truth: What Is Actually Verified

### Locally Verified Agents (20)
These have been confirmed via direct filesystem inspection on `C:\Users\Zhang`:

| Agent | Category | Verified Home | Key Memory Files | Last Verified |
|-------|----------|---------------|------------------|---------------|
| claude | cli | `.claude` | history.jsonl (365KB), CONFIG.md, CROSS_CLI_GUIDE.md | 2026-10-07 |
| opencode | ide | `.opencode`, `.local/share/opencode` | storage/session/*/ses_*.json (12 dirs), opencode.db (12GB) | 2026-10-07 |
| qoder | cli | `.qoder` | QODER.md (33KB), AGENTS.md, state.json, skill-usage.json | 2026-10-07 |
| zcode | editor | `.zcode` | v2/bot-state.v2.json, v2/setting.json, cli/log/*.jsonl (7 files) | 2026-10-07 |
| workbuddy | desktop | `.workbuddy` | MEMORY.md (2KB), workbuddy.db (14MB), usage-log.json, user-state.json | 2026-10-07 |
| marvis | desktop | `.marvis` | database/data.db (14.6GB), schedules/*.yaml (13 files) | 2026-10-07 |
| kimi | chat | `.kimi` | user-history/*.jsonl (3 files), sessions/* (4 dirs), config.toml | 2026-10-07 |
| minimax | chat | `.minimax` | config.yaml, channel-bindings.yaml, v2/ | 2026-10-07 |
| qwen | cli | `.qwen` | config.json, config.yaml, settings.json, CROSS_CLI_GUIDE.md | 2026-10-07 |
| cursor | ide | `.cursor` | ai-tracking/, extensions/, skills/, argv.json | 2026-10-07 |
| codex | cli | `.codex` | config/, hooks/, log/, plugins/, sessions/, skills/ | 2026-10-07 |
| copilot | ide | `.copilot` | agents/, ide/, logs/, mcp/, session-state/, sessions/, skills/ | 2026-10-07 |
| gemini | cli | `.gemini` | config.json, CONFIG.md, CROSS_CLI_GUIDE.md, history/, sessions/, skills/ | 2026-10-07 |
| gbrain | cli | `.gbrain` | brain.pglite, config.json, import-checkpoint.json | 2026-10-07 |
| stigmergy | cli | `.stigmergy` | config/, skills/, soul-agents/, soul-state/, agent-coordination-history.jsonl | 2026-10-07 |
| iflow | cli | `.iflow` | config.json, CROSS_CLI_GUIDE.md, IFLOW.md, soul-state/, agents/ | 2026-10-07 |
| codebuddy | ide | `.codebuddy` | CODEBUDDY.md, config.json, CROSS_CLI_GUIDE.md, history.jsonl, sessions/ | 2026-10-07 |
| trae | ide | `.trae` | chat/, extensions/, skills/, argv.json | 2026-10-07 |
| kilocode | ide | `.kilocode` | skills/ (67 skills) | 2026-10-07 |
| doubao | chat | `AppData\Local\Doubao\User Data` | Profile 1/2/.doubao/agent_mode/workspace/.sessions/*/board.md, memory.md (14 sessions) | 2026-10-07 |
| poe | desktop | `AppData\Roaming\Poe` | config.json, SharedStorage/, logs/ | 2026-10-07 |

### Theoretical / Unverified Agents (22)
These are defined in `AGENT_ONTOLOGY` but NOT found on this machine during 2026-10-07 scan:

| Agent | Expected Home | Status | Source |
|-------|---------------|--------|--------|
| aider | `.aider` | NOT FOUND | local scan |
| continue | `.continue` | NOT FOUND | local scan |
| deepseek | `.deepseek` | NOT FOUND | local scan |
| grok | `.grok` | NOT FOUND | local scan |
| perplexity | `.perplexity` | NOT FOUND | local scan |
| pi | `.pi` | NOT FOUND | local scan |
| notebooklm | `.notebooklm` | NOT FOUND | local scan |
| character-ai | `.character-ai` | NOT FOUND | local scan |
| devin | `.devin` | NOT FOUND | local scan |
| manus | `.manus` | NOT FOUND | local scan |
| coze | `.coze` | NOT FOUND | local scan |
| wenxin | `.wenxin`, `AppData\Local\Wenxin\User Data` | NOT FOUND | local scan |
| lingyi | `.lingyi`, `AppData\Local\Lingyi\User Data` | NOT FOUND | local scan |
| baichuan | `.baichuan`, `AppData\Local\Baichuan\User Data` | NOT FOUND | local scan |
| xunfei | `.xunfei`, `AppData\Local\Xunfei\User Data` | NOT FOUND | local scan |
| windsurf | `.windsurf` | NOT FOUND | local scan |
| supermaven | `.supermaven` | NOT FOUND | local scan |
| tabnine | `.tabnine` | NOT FOUND | local scan |
| cody | `.cody` | NOT FOUND | local scan |
| githubcopilot | `.github-copilot` | NOT FOUND | local scan |
| chatgpt | `.chatgpt` | NOT FOUND | local scan |
| agentgit | `.agentgit` | NOT FOUND | local scan |

### Key Finding: Constitution P4 vs Reality
Constitution P4 says "must support all 40+ hot agents". Current reality:
- **20 agents**: verified locally, scanner works
- **22 agents**: theoretical only, no local evidence

**Credible position**: Deliver the 20-agent verified system first, then expand coverage via research + user-contributed configs. Do NOT claim 40+ support without verification.

---

## Phase 1: Verified Core System (Week 1-2)

### Goal
Deliver a working wiki scanner + coordination bus for the 20 verified agents, with real project-path extraction and incremental updates.

### Deliverables
1. **Fixed `wiki/orchestrator.js`**
   - `verifiedLocally` flag on all 42 agents (20 true, 22 false)
   - `autoBuildAgentConfigs()` skips unverified agents
   - Clean `AGENT_HOME_PREFIXES` (only verified paths)
   - All syntax/lint errors resolved

2. **Per-Agent Memory Extractors** (for all 20 verified)
   - claude: `history.jsonl` → cwd/project fields
   - opencode: `storage/session/*/ses_*.json` → directory field
   - qoder: `QODER.md`, `state.json` → project context
   - zcode: `v2/bot-state.v2.json` → workspacePath, `v2/setting.json` → recentProjects
   - workbuddy: `MEMORY.md`, `usage-log.json`, `user-state.json`
   - marvis: `schedules/*.yaml` → prompt text with paths, `database/data.db` → task history
   - kimi: `user-history/*.jsonl` → path extraction
   - doubao: `Profile */.sessions/*/board.md`, `memory.md`
   - All others: directory existence + basic file count

3. **Project-Agent Mapping** (verified)
   - `D:\powerSale` → zcode, claude, opencode, workbuddy
   - `D:\socienceAI` → claude, opencode, kilocode
   - `E:\fintech` → zcode, claude
   - `F:\Chat4` → zcode, claude, codebuddy, codex, cursor, gemini, qoder, qwen
   - `D:\ssciskills` → claude, opencode, workbuddy
   - `D:\AIDevelop\failureLogic` → claude, qwen, opencode
   - `F:\market-repo` → zcode, claude

4. **Incremental State**
   - `wiki/state.json` tracks last scan time, file mtimes
   - Delta computation: new/updated agents and projects
   - 15-day recency filter

5. **Verification Report**
   - Script `scripts/verify-wiki.js` that prints:
     - Verified agents count
     - Unverified agents list
     - Projects discovered
     - Scan duration
     - Any missing memory files

### Success Criteria
- [ ] `node wiki/orchestrator.js` runs without errors
- [ ] All 20 verified agents appear in `wiki/latest.json`
- [ ] All 7 known projects appear with correct agent lists
- [ ] Scan completes in < 10 seconds
- [ ] `npm run lint` passes for `wiki/orchestrator.js`

---

## Phase 2: Coverage Expansion via Research (Week 3-4)

### Goal
Add support for the 22 unverified agents by researching their actual memory file formats from authoritative sources.

### Method
For each unverified agent:
1. **Search official docs** for Windows config/storage paths
2. **Search GitHub/issues** for memory file formats
3. **Create minimal extractor** based on findings
4. **Mark as `verifiedLocally: false`** until user installs and confirms
5. **Add to `AGENT_ONTOLOGY` with `researchSources`** field

### Priority Order (by likelihood of being installed)
1. **High priority**: aider, continue, deepseek, grok, perplexity, manus, devin
   - These are widely used and likely to be installed soon
2. **Medium priority**: chatgpt, copilot (already have .copilot but .github-copilot missing), windsurf, tabnine, cody, supermaven
   - IDE extensions that users commonly install
3. **Low priority**: pi, notebooklm, character-ai, agentgit, coze, wenxin, lingyi, baichuan, xunfei
   - Niche or China-specific tools

### Deliverables
1. **Research document**: `docs/agent-research-queue.md`
   - Each agent with: official doc links, expected paths, memory file names, extraction strategy
2. **Updated `AGENT_ONTOLOGY`**:
   - Add `researchSources` array with URLs
   - Add `extractionStrategy` field
   - Keep `verifiedLocally: false` until confirmed
3. **Test harness**: `tests/wiki/test-orchestrator.js`
   - Unit tests for each extractor
   - Mock filesystem tests for unverified agents

---

## Phase 3: Coordination Bus (Week 5-6)

### Goal
Implement the coordination bus that allows agents to register, create handoffs, and share knowledge.

### Deliverables
1. **`bus/coordinator.js`** (already created, needs testing)
   - Agent registration
   - Handoff creation/acceptance/completion
   - Review requests
   - Shared knowledge updates

2. **Skill injection package**: `skills/stigmergy-coordinator/`
   - `SKILL.md` with coordination protocol
   - `runner.js` with bus operations
   - Installable into any agent's skill directory

3. **End-to-end demo**
   - opencode registers → creates handoff
   - zcode scans → accepts handoff → completes
   - bus state persisted to JSON

---

## Phase 4: LLM Wiki Generation (Week 7-8)

### Goal
Generate project progress summaries from extracted data, suitable for LLM consumption.

### Deliverables
1. **Progress summary extractor**
   - For each project: agents, lastSeen, activity count, recent memory snippets
   - Context inference from project path (e.g., `powerSale` → e-commerce)

2. **Wiki output format**
   - `wiki/latest.json`: full snapshot
   - `wiki/state.json`: incremental state
   - `wiki/delta.json`: changes since last scan

3. **LLM-friendly summary**
   - Markdown summary of all projects and agents
   - Suitable for injection into agent context

---

## Phase 5: IM Gateway Integration (Week 9-12)

### Goal
Allow IM tools (Feishu, WeChat, Telegram) to query the wiki and trigger coordination.

### Deliverables
1. **IM adapter skeleton**
   - Feishu/WeChat webhook handler
   - Command parsing: "status", "handoff", "review"
   - Response formatting

2. **CLI commands**
   - `npm run wiki:scan` (already exists)
   - `npm run wiki:status`
   - `npm run wiki:handoff`

---

## Risk Mitigation

### Risk 1: "Claiming 40+ support without verification"
**Mitigation**: Split output into `verifiedAgents` and `unverifiedAgents` arrays. Only count verified agents toward coverage metrics.

### Risk 2: Memory file format changes
**Mitigation**: Each extractor has a `try/catch` fallback that returns `{}` on parse failure. Unknown formats are logged but don't crash the scan.

### Risk 3: Performance on large directories
**Mitigation**: Session-only scanning (not full directory walks). Use glob patterns with depth limits. Incremental state tracks mtimes.

### Risk 4: User privacy / sensitive data
**Mitigation**: Read-only access to memory files. No project source code scanning. Paths are stored but not file contents.

---

## Immediate Next Steps

1. **Fix remaining syntax error** in `wiki/orchestrator.js` (duplicate array close)
2. **Run full scan** and verify output
3. **Create verification script** `scripts/verify-wiki.js`
4. **Write Phase 2 research queue** `docs/agent-research-queue.md`
5. **Update project constitution** to reflect verified vs theoretical distinction

---

## Constitution Alignment Check

| Principle | Current State | Plan |
|-----------|---------------|------|
| P0: User Liberation | Scanner runs automatically, no user input needed | ✓ Maintained |
| P1: Evidence First | 20 agents verified locally, 22 marked unverified | ✓ Strengthened |
| P2: Progressive Disclosure | L1-L4 layered scanning | ✓ Maintained |
| P3: Memory-First Scanning | Only memory files scanned, no full filesystem | ✓ Maintained |
| P4: Universal Coverage | 20 verified + 22 research queue | **Revised**: credible coverage over fake completeness |
| P5: Project Progress | 7 projects mapped with agent lists | ✓ Enhanced in Phase 4 |

**Key decision**: Constitution P4 says "must support all 40+ hot agents". The credible interpretation is: "must have configs and research plans for all 40+, but only count verified ones as supported." This preserves evidence-first (P1) while maintaining the ambition of universal coverage.
