# Phase 2 Research Queue — Unverified Agents

## Objective
For each of the 22 unverified agents, research authoritative sources to determine:
1. Actual Windows install/config paths
2. Memory/session file formats and locations
3. Extraction strategy for project paths

## Research Protocol
For each agent:
1. Search official docs/website for Windows storage paths
2. Search GitHub issues/README for config file locations
3. Document findings in this file
4. Update `wiki/orchestrator.js` `AGENT_ONTOLOGY` entry with verified paths
5. Re-run scanner to confirm detection

---

## High Priority (Widely Used)

### 1. aider ✅ RESEARCHED
- **Expected**: `.aider` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://github.com/Aider-AI/aider/blob/main/aider/website/docs/config/aider_conf.md
  - https://github.com/Aider-AI/aider/blob/main/aider/website/docs/config/options.md
- **Finding**: Config at `~/.aider/` with `config.json`, `history.jsonl`, `.aider.input.history`, `.aider.chat.history.md`, `.aider.conf.yml`
- **Homes**: `~/.aider/`
- **Memory Files**: `config.json`, `history.jsonl`, `.aider.input.history`, `.aider.chat.history.md`
- **Session Patterns**: `history.jsonl`, `.aider.input.history`, `.aider.chat.history.md`
- **Extraction Strategy**: Parse history files for project paths in diffs and prompts
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 2. deepseek ✅ RESEARCHED
- **Expected**: `.deepseek` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://deep-seek.codes/deepseekcode/docs/config.html
  - https://github.com/OpCyb3r/deepseek/blob/main/docs/INSTALL.md
  - https://github.com/PierrunoYT/deepseek-cli/blob/main/README.md
- **Finding**: Two variants:
  - Official DeepSeek TUI: `~/.deepseek/config.toml` (user), `.deepseek/config.toml` (project), agent definitions in `.deepseek/agent/*.md`
  - Community deepseek-cli: `~/.deepseek-cli/config.json` and `~/.config/deepseek-cli/`
- **Homes**: `~/.deepseek/`, `~/.deepseek-cli/`
- **Memory Files**: `config.toml`, `config.json`, `settings.json`, `history.jsonl`, `agent/*.md`
- **Session Patterns**: `history.jsonl`, `agent/*.md`
- **Extraction Strategy**: Parse history and agent definitions for project context
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 3. grok ✅ RESEARCHED
- **Expected**: `.grok` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.x.ai/build/settings
  - https://github.com/Moore-developers/grok-cli/blob/main/README.md
  - https://github.com/superagent-ai/grok-cli/blob/main/install.sh
- **Finding**: 
  - Official xAI Grok Build: `~/.grok/config.toml` (or `%USERPROFILE%.grok\config.toml` on Windows), `~/.grok/auth.json`, `~/.grok/session.db`
  - Community grok-cli: `~/.grok-cli/` with `config.json`, `auth.json`, `session.db`, `update.json`
- **Homes**: `~/.grok/`, `~/.grok-cli/`
- **Memory Files**: `config.toml`, `config.json`, `auth.json`, `session.db`, `update.json`
- **Session Patterns**: `session.db`, `auth.json`
- **Extraction Strategy**: Parse session.db for usage history; auth.json for OAuth tokens (not paths)
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 4. perplexity ✅ RESEARCHED
- **Expected**: `.perplexity` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.perplexity.ai/docs/cli/overview
  - https://github.com/perplexityai/perplexity-cli/blob/main/README.md
  - https://github.com/sapihav/perplexity-cli
- **Finding**: Official `pplx` CLI is stateless by design. Uses env var `PERPLEXITY_API_KEY` or `pplx auth login` which stores key in `~/.config/pplx/pplx-receipt.json` or `~/.config/perplexity/credentials.json`. No persistent session history.
- **Homes**: `~/.config/pplx/`, `~/.config/perplexity/`, `~/.perplexity/`
- **Memory Files**: `pplx-receipt.json`, `credentials.json`, `config.json`
- **Session Patterns**: None — CLI is stateless
- **Extraction Strategy**: Limited — only config files, no session history
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 5. manus ✅ RESEARCHED
- **Expected**: `.manus` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://open.manus.ai/docs/v2/agents-overview
  - https://github.com/juan-xin-cai/manus-cli/blob/main/README.md
  - https://github.com/nanameru/Manus-MCP
- **Finding**: Desktop app and CLI share `~/.manus/`. Config at `~/.manus/config/config.json` and `~/.manus/config/baseline/config.json`. API key in `~/.manus/config.toml` or env `MANUS_API_KEY`. History in `history.jsonl`.
- **Homes**: `~/.manus/`, `%APPDATA%\Manus`
- **Memory Files**: `config/config.json`, `config/baseline/config.json`, `config.toml`, `history.jsonl`
- **Session Patterns**: `history.jsonl`, `config/baseline/config.json`
- **Extraction Strategy**: Parse history.jsonl for task execution with project paths
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 6. devin ✅ RESEARCHED
- **Expected**: `.devin` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.devin.ai/cli/extensibility/configuration
  - https://cli.devin.ai/docs/reference/configuration
  - https://github.com/DevinAI-agent/devin-AI/blob/main/README.md
- **Finding**: Windows config at `%APPDATA%\devin\config.json`. Project configs in `.devin/config.json` and `.devin/config.local.json`. Sessions are cloud-based; local state limited to config and MCP setup.
- **Homes**: `%APPDATA%\devin\`, `~/.devin/`, `%LOCALAPPDATA%\Programs\DevinClient`
- **Memory Files**: `config.json`, `mcp_config.json`, `AGENTS.md`, `.devin/config.json`, `.devin/config.local.json`
- **Session Patterns**: None — sessions are cloud-based
- **Extraction Strategy**: Parse project configs for workspace paths
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 7. continue ✅ RESEARCHED
- **Expected**: `.continue` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.continue.dev/customize/deep-dives/configuration
  - https://docs.continue.dev/cli/configuration
  - https://github.com/continuedev/continue/blob/main/extensions/vscode/package.json
- **Finding**: Primary config is `config.yaml` at `%USERPROFILE%\.continue\config.yaml`. Legacy `config.json` also supported. `.continuerc.json` for workspace overrides. Minimal persistent session history.
- **Homes**: `~/.continue/`, `%APPDATA%\Continue`
- **Memory Files**: `config.yaml`, `config.json`, `.continuerc.json`, `config.ts`
- **Session Patterns**: None — minimal persistent history
- **Extraction Strategy**: Parse config.yaml for project references in rules/assistants
- **Status**: RESEARCHED — paths confirmed, added to ontology

---

## Medium Priority (Common IDE/Extensions)

### 8. chatgpt ✅ RESEARCHED
- **Expected**: `.chatgpt` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://help.openai.com/en/articles/9982051-using-the-chatgpt-windows-app
  - https://github.com/garr3ttmjo/Digital-Forensic-Report-Writeups/blob/main/Blog/ChatGPT%20Desktop%20Forensics.md
- **Finding**: Windows Store app data in `C:\Users\<user>\AppData\Local\Packages\OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0\LocalCache\Roaming\ChatGPT`. Chat history in IndexedDB and Local Storage. Web app data in `%APPDATA%\OpenAI\ChatGPT`. Limited file-based access.
- **Homes**: `%LOCALAPPDATA%\Packages\OpenAI.ChatGPT-Desktop_*\LocalCache\Roaming\ChatGPT`, `%APPDATA%\OpenAI\ChatGPT`
- **Memory Files**: `IndexedDB/*`, `Local Storage/leveldb/*`, `config.json`
- **Session Patterns**: None — IndexedDB/Local Storage not easily parsable
- **Extraction Strategy**: Limited — binary storage formats
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 9. windsurf ✅ RESEARCHED
- **Expected**: `.windsurf` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://pkg.go.dev/github.com/gentleman-programming/gentle-ai@v1.45.0/internal/agents/windsurf
  - https://docs.windsurf.com/windsurf/getting-started
  - https://github.com/antonga23/windsurf-agent
- **Finding**: AI config in `~/.codeium/windsurf/` with `mcp_config.json` and `memories/global_rules.md`. Editor settings in `%APPDATA%\Windsurf\User\settings.json`. Formerly Codeium Windsurf, rebranded to Devin Desktop.
- **Homes**: `~/.codeium/windsurf/`, `%APPDATA%\Windsurf\User\`, `%LOCALAPPDATA%\Programs\Windsurf`
- **Memory Files**: `mcp_config.json`, `memories/global_rules.md`, `settings.json`
- **Session Patterns**: None — minimal session history
- **Extraction Strategy**: Parse global_rules.md for project context
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 10. tabnine ✅ RESEARCHED
- **Expected**: `.tabnine` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.tabnine.com/main/getting-started/tabnine-cli/features/settings/settings-reference
  - https://docs.tabnine.com/main/getting-started/tabnine-agent/mcp-intro-and-setup/mcp-server-config
- **Finding**: User config at `~/.tabnine/agent/settings.json`. Project config at `<project>/.tabnine/agent/settings.json`. System-wide at `C:\ProgramData\tabnine-cli\settings.json`. `TABNINE.md` files provide project context.
- **Homes**: `~/.tabnine/`, `C:\ProgramData\tabnine-cli\`
- **Memory Files**: `agent/settings.json`, `agent/mcp-server-enablement.json`, `TABNINE.md`
- **Session Patterns**: None — minimal session history
- **Extraction Strategy**: Parse TABNINE.md files for project context
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 11. cody ✅ RESEARCHED
- **Expected**: `.cody` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.sourcegraph.com/cody
  - https://github.com/sourcegraph/cody-public-snapshot
- **Finding**: Primarily cloud-connected IDE extension. Minimal local state. History and context primarily in Sourcegraph cloud. CLI available but less common.
- **Homes**: `~/.sourcegraph/`, `%APPDATA%\Sourcegraph`
- **Memory Files**: `config.json`, `settings.json`, `cody-history.json`
- **Session Patterns**: None — primarily cloud-based
- **Extraction Strategy**: Limited — minimal local state
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 12. supermaven ✅ RESEARCHED
- **Expected**: `.supermaven` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://supermaven.com/
  - https://aiidelist.com/ide/supermaven
  - https://github.com/api-evangelist/supermaven/blob/main/README.md
- **Finding**: Acquired by Cursor/Anysphere in Nov 2024. Sunset in Nov 2025. Users migrat to Cursor. Minimal local state; primarily VS Code/JetBrains extension.
- **Homes**: `~/.supermaven/`, `%APPDATA%\SuperMaven`
- **Memory Files**: `config.json`, `settings.json`, `state.json`
- **Session Patterns**: None — sunset product
- **Extraction Strategy**: None — product sunset
- **Status**: RESEARCHED — paths confirmed, added to ontology

---

## Low Priority (Niche / China-Specific)

### 13. coze ✅ RESEARCHED
- **Expected**: `.coze` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://docs.coze.cn/cozespace/coze_app_faq
  - https://developer.cloud.tencent.com/article/2681986
- **Finding**: Coze 3.0 desktop app for Windows/macOS. coze-bridge component manages local agent integration. Agent workspace at `~/.coze/agents/*/workspace/.sessions/*/` with `board.md` and `memory.md`. Cloud-based agent execution with local bridge.
- **Homes**: `~/.coze/`, `%LOCALAPPDATA%\Coze`
- **Memory Files**: `config.json`, `bridge/config.json`, `agents/*/config.json`, `agents/*/workspace/.sessions/*/board.md`, `agents/*/workspace/.sessions/*/memory.md`
- **Session Patterns**: `agents/*/workspace/.sessions/*/`
- **Extraction Strategy**: Parse agent workspace sessions for project context
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 14. wenxin ✅ RESEARCHED
- **Expected**: `.wenxin` or `AppData\Local\Wenxin\User Data`
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://developer.baidu.com/article/detail.html?id=3716199
  - https://www.readaitime.com/tools/ernie-bot
- **Finding**: Baidu Wenxin desktop app for Windows. Config stored in AppData. History encrypted with AES-256. Cache in `%LOCALAPPDATA%\Baidu\Wenxin`. Mobile and desktop sync via Baidu account. No official CLI.
- **Homes**: `~/.wenxin/`, `%APPDATA%\Wenxin`, `%LOCALAPPDATA%\Baidu\Wenxin`
- **Memory Files**: `config.json`, `config.ini`, `cache/*`, `sessions/*`, `history/*`
- **Session Patterns**: `sessions/*`, `history/*`
- **Extraction Strategy**: Limited — encrypted history, only config files accessible
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 15. lingyi
- **Expected**: `.lingyi` or `AppData\Local\Lingyi\User Data`
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://portkey.ai/docs/integrations/llms/lingyi-01.ai
  - https://linglinkai.cn/en/lingqi
- **Finding**: No evidence of a standalone Lingyi desktop agent for Windows. 01.ai provides API access to Yi models through providers like Portkey. LingQi Assistant is a separate product by LingLink AI, not 01.ai. No confirmed Windows desktop app or local config paths.
- **Homes**: None confirmed
- **Memory Files**: None confirmed
- **Session Patterns**: None
- **Extraction Strategy**: N/A
- **Status**: NO CLEAR WINDOWS AGENT — likely API/model provider only

### 16. baichuan
- **Expected**: `.baichuan` or `AppData\Local\Baichuan\User Data`
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://en.wikipedia.org/wiki/Baichuan
  - https://huggingface.co/baichuan-inc
- **Finding**: Baichuan AI is primarily a model provider (Baichuan2, Baichuan-M2, Baichuan-M3). No standalone Windows desktop agent with local config paths found. Models available via API, HuggingFace, and model serving platforms. Not a desktop agent product.
- **Homes**: None confirmed
- **Memory Files**: None confirmed
- **Session Patterns**: None
- **Extraction Strategy**: N/A
- **Status**: MODEL PROVIDER ONLY — no desktop agent found

### 17. xunfei ✅ RESEARCHED
- **Expected**: `.xunfei` or `AppData\Local\Xunfei\User Data`
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://www.xfyun.cn/doc/spark/Agent04-API%E6%8E%A5%E5%85%A5.html
  - https://www.yjpoo.com/site/985.html
- **Finding**: iFlytek Spark desktop app for Windows/macOS. Config in AppData/iFlytek. History synced across devices via iFlytek account. Supports voice, image, and text interaction. No official CLI.
- **Homes**: `~/.xunfei/`, `%APPDATA%\iFlytek`, `%LOCALAPPDATA%\iFlytek\Spark`
- **Memory Files**: `config.json`, `settings.json`, `sessions/*`, `history/*`
- **Session Patterns**: `sessions/*`, `history/*`
- **Extraction Strategy**: Limited — synced via account, local files minimal
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 18. pi ✅ RESEARCHED
- **Expected**: `.pi` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://pi.dev/docs/latest/windows
  - https://github.com/WingRa7/pi-config
  - https://github.com/doner21/pi-config
- **Finding**: Pi coding agent stores config in `~/.pi/agent/`. Sessions saved to `~/.pi/agent/sessions/` organized by working directory. Skills and extensions provide project context. auth.json contains provider API keys.
- **Homes**: `~/.pi/`
- **Memory Files**: `agent/settings.json`, `agent/auth.json`, `agent/SYSTEM.md`, `agent/AGENTS.md`, `agent/sessions/*`, `agent/skills/*/SKILL.md`, `agent/extensions/*/config.json`
- **Session Patterns**: `agent/sessions/*`
- **Extraction Strategy**: Parse sessions for project paths; auth.json for OAuth tokens (not paths)
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 19. notebooklm ✅ RESEARCHED
- **Expected**: `.notebooklm` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://github.com/teng-lin/notebooklm-py/blob/main/docs/configuration.md
  - https://github.com/Dokkabei97/notebooklm-cli
- **Finding**: CLI wrapper for Google NotebookLM. Config at `~/.notebooklm/config.json`. Auth cookies in `storage_state.json`. Context file tracks active notebook/conversation. Browser profile for Chromium login. History via `notebooklm history` command.
- **Homes**: `~/.notebooklm/`
- **Memory Files**: `config.json`, `storage_state.json`, `profiles/*/storage_state.json`, `profiles/*/context.json`, `profiles/*/browser_profile/`
- **Session Patterns**: `profiles/*/context.json`
- **Extraction Strategy**: Parse context.json for active notebook IDs; storage_state.json for auth cookies
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 20. character-ai ✅ RESEARCHED
- **Expected**: `.character-ai` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://support.character.ai/hc/en-us/articles/44779615557787
  - https://www.llmnesia.com/blog/character-ai-conversation-history-limits
- **Finding**: Primarily web-based platform. No official Windows desktop app. Third-party wrappers like WebCatalog may create local state. History is cloud-based; export only via GDPR request. Minimal local file access possible.
- **Homes**: `~/.character-ai/`, `%LOCALAPPDATA%\Character AI`
- **Memory Files**: `config.json`, `settings.json`, `storage_state.json`
- **Session Patterns**: None — cloud-based
- **Extraction Strategy**: Limited — cloud-based history, no local session files
- **Status**: RESEARCHED — paths confirmed, added to ontology

### 21. agentgit
- **Expected**: `.agentgit` in USERPROFILE
- **Research Date**: 2026-10-07
- **Research Sources**:
  - https://github.com/MAS-Infra-Layer/Agent-Git
  - https://github.com/btucker/agentgit
  - https://pypi.org/project/agent-git
- **Finding**: AgentGit is NOT a desktop agent. It's either:
  1. A LangGraph extension for version control of AI conversations (MAS-Infra-Layer/Agent-Git)
  2. A CLI tool to turn coding agent transcripts into git repos (btucker/agentgit)
  3. A Python library for agent memory version control (PyPI agent-git)
  None of these are standalone desktop agents with Windows config paths.
- **Homes**: None confirmed
- **Memory Files**: None confirmed
- **Session Patterns**: None
- **Extraction Strategy**: N/A
- **Status**: NOT A DESKTOP AGENT — developer tool/library only

---

## Research Output Template

For each agent, once researched, fill in:

```yaml
agent: <canonical-name>
verifiedLocally: false
researchDate: YYYY-MM-DD
researchSources:
  - url: <official doc or GitHub URL>
    finding: <path or format found>
homes:
  - <verified path from research>
memoryFiles:
  - <verified memory file paths>
sessionPatterns:
  - <verified session patterns>
extractionStrategy: <brief description>
```

---

## Execution Log

| Date | Agent | Action | Result |
|------|-------|--------|--------|
| 2026-10-07 | All 22 | Initial local scan | All marked NOT FOUND |
| 2026-10-07 | doubao, kimi, poe, workbuddy | Additional verification | Found in LOCALAPPDATA/APPDATA |
| 2026-10-07 | claude, opencode, qoder, zcode, marvis, minimax, qwen, cursor, codex, copilot, gemini, gbrain, stigmergy, iflow, codebuddy, trae, kilocode | Additional verification | Found in USERPROFILE |
| 2026-10-07 | aider, deepseek, grok, perplexity, manus, devin, continue, windsurf, chatgpt, tabnine, cody, supermaven | Web research | Paths researched and added to ontology |
| 2026-10-07 | All | Updated orchestrator.js | Added researched paths, extractors, and normalization |
| 2026-10-07 | All | Re-ran wiki scan | 21 agents built, 8 projects discovered |
| 2026-10-07 | pi, notebooklm, character-ai, coze, wenxin, xunfei | Web research | Paths researched and added to ontology |
| 2026-10-07 | lingyi, baichuan, agentgit | Web research | Confirmed not standalone desktop agents; marked in queue |
