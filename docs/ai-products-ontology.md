# AI Products Ontology

## Global CLI / IDE Agents

### Claude (Anthropic)
- canonical: claude
- aliases: claude, claude-code, claude-agent, Claude
- company: Anthropic
- category: cli
- windowsHome: C:\Users\Zhang\.claude
- linuxHome: ~/.claude
- macHome: ~/.claude
- memoryFiles:
  - CONFIG.md
  - CROSS_CLI_GUIDE.md
  - settings.json
  - history.jsonl
  - CLAUDE.md
  - ses_*.jsonl
- sessionPatterns:
  - ses_*.jsonl
  - history.jsonl
- projectTraces:
  - directoryMarker: .claude
  - pathHint: CLAUDE.md
  - pathHint: history.jsonl project field
  - pathHint: session prompt content
- behaviorNotes:
  - Writes project paths into history.jsonl and session files
  - Creates .claude/agent.json with project context
  - CLAUDE.md often contains project-specific instructions

### Codex (OpenAI)
- canonical: codex
- aliases: codex, openai-codex, Codex, OpenAI Codex
- company: OpenAI
- category: cli
- windowsHome: C:\Users\Zhang\.codex
- linuxHome: ~/.codex
- macHome: ~/.codex
- memoryFiles:
  - config.json
  - settings.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .codex
  - pathHint: sessions/*.json cwd field
- behaviorNotes:
  - Session JSON contains cwd and project paths
  - May create .codex/agents/ for custom agents

### Gemini (Google)
- canonical: gemini
- aliases: gemini, gemini-code, Gemini, Google Gemini
- company: Google
- category: cli
- windowsHome: C:\Users\Zhang\.gemini
- linuxHome: ~/.gemini
- macHome: ~/.gemini
- memoryFiles:
  - config.json
  - settings.json
  - history.jsonl
- sessionPatterns:
  - history.jsonl
- projectTraces:
  - directoryMarker: .gemini
  - pathHint: history.jsonl content
- behaviorNotes:
  - History may contain project paths in prompts

### Qwen (Alibaba)
- canonical: qwen
- aliases: qwen, qwenwork, qwencode, qwen-code, Qwen, Qwenwork
- company: Alibaba
- category: cli
- windowsHome: C:\Users\Zhang\.qwen
- linuxHome: ~/.qwen
- macHome: ~/.qwen
- memoryFiles:
  - config.json
  - settings.json
  - history.jsonl
- sessionPatterns:
  - history.jsonl
  - qwen_*.log
- projectTraces:
  - directoryMarker: .qwen
  - pathHint: history.jsonl content
- behaviorNotes:
  - May have qwenwork variant with same structure
  - History contains full conversation with paths

### DeepSeek
- canonical: deepseek
- aliases: deepseek, deepseek-code, DeepSeek
- company: DeepSeek
- category: cli
- windowsHome: C:\Users\Zhang\.deepseek
- linuxHome: ~/.deepseek
- macHome: ~/.deepseek
- memoryFiles:
  - config.json
  - settings.json
  - history.jsonl
- sessionPatterns:
  - history.jsonl
- projectTraces:
  - directoryMarker: .deepseek
  - pathHint: history.jsonl content

### Grok (xAI)
- canonical: grok
- aliases: grok, grok-code, Grok
- company: xAI
- category: cli
- windowsHome: C:\Users\Zhang\.grok
- linuxHome: ~/.grok
- macHome: ~/.grok
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .grok

### Perplexity
- canonical: perplexity
- aliases: perplexity, perplexity-code, Perplexity
- company: Perplexity AI
- category: cli
- windowsHome: C:\Users\Zhang\.perplexity
- linuxHome: ~/.perplexity
- macHome: ~/.perplexity
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .perplexity

### Pi (Inflection)
- canonical: pi
- aliases: pi, pi-code, Pi
- company: Inflection
- category: cli
- windowsHome: C:\Users\Zhang\.pi
- linuxHome: ~/.pi
- macHome: ~/.pi
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .pi

### NotebookLM (Google)
- canonical: notebooklm
- aliases: notebooklm, notebook-lm, NotebookLM
- company: Google
- category: cli
- windowsHome: C:\Users\Zhang\.notebooklm
- linuxHome: ~/.notebooklm
- macHome: ~/.notebooklm
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .notebooklm

### Character.AI
- canonical: character-ai
- aliases: character-ai, characterai, CharacterAI
- company: Character.AI
- category: cli
- windowsHome: C:\Users\Zhang\.character-ai
- linuxHome: ~/.character-ai
- macHome: ~/.character-ai
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .character-ai

### Devin (Cognition)
- canonical: devin
- aliases: devin, devin-code, Devin
- company: Cognition
- category: cli
- windowsHome: C:\Users\Zhang\.devin
- linuxHome: ~/.devin
- macHome: ~/.devin
- memoryFiles:
  - config.json
  - settings.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .devin

### Manus
- canonical: manus
- aliases: manus, manus-code, Manus
- company: Manus
- category: cli
- windowsHome: C:\Users\Zhang\.manus
- linuxHome: ~/.manus
- macHome: ~/.manus
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .manus

## China / Local Desktop / Chat Agents

### WorkBuddy
- canonical: workbuddy
- aliases: workbuddy, work-buddy, WorkBuddy
- company: WorkBuddy
- category: desktop
- windowsHome: C:\Users\Zhang\.workbuddy
- linuxHome: ~/.workbuddy
- macHome: ~/.workbuddy
- memoryFiles:
  - MEMORY.md
  - IDENTITY.md
  - BOOTSTRAP.md
  - failover.json
  - mcp.json
  - mcp-tool-list.json
  - .skill-list-cache.json
  - usage-log.json
  - user-state.json
  - ioa-im-override.json
- databaseFiles:
  - workbuddy.db
- sessionPatterns:
  - usage-log.json
  - user-state.json
- projectTraces:
  - directoryMarker: .workbuddy
  - pathHint: usage-log.json skills may reference project names
  - pathHint: mcp-tool-list.json may contain project paths
- behaviorNotes:
  - usage-log.json tracks skill usage by date
  - user-state.json contains recent activity
  - workbuddy.db may contain project references (requires sqlite3)

### Marvis (Tencent)
- canonical: marvis
- aliases: marvis, marvis-code, marvis-agent, Marvis
- company: Tencent
- category: desktop
- windowsHome: C:\Users\Zhang\.marvis
- windowsAppData: C:\Users\Zhang\AppData\Roaming\Tencent\Marvis
- linuxHome: ~/.marvis
- macHome: ~/.marvis
- memoryFiles:
  - */schedules/*.yaml
  - */messages/*.md
  - */database/*.db
  - */workspace/conv_*
- sessionPatterns:
  - schedules/*.yaml
  - messages/*.md
  - workspace/conv_*/
- projectTraces:
  - directoryMarker: .marvis
  - pathHint: schedules/*.yaml prompt field contains Windows paths
  - pathHint: messages/*.md meta field may contain paths
  - pathHint: workspace/conv_* paths in filenames
- behaviorNotes:
  - Schedules YAML contains full prompt text with project paths
  - Messages contain meta JSON with execution context
  - Workspace conv_* directories named by conversation ID
  - Strong signal: schedule title often mentions project name

### Coze (ByteDance)
- canonical: coze
- aliases: coze, coze-code, 扣子, Coze
- company: ByteDance
- category: chat
- windowsHome: C:\Users\Zhang\.coze
- linuxHome: ~/.coze
- macHome: ~/.coze
- memoryFiles:
  - config.json
  - agents/*/config.json
- sessionPatterns:
  - agents/*/
- projectTraces:
  - directoryMarker: .coze
  - pathHint: agents/*/config.json may contain workspace paths
- behaviorNotes:
  - Agent workspace may contain project files
  - config.json has bot definitions

### Doubao / 豆包 (ByteDance)
- canonical: doubao
- aliases: doubao, doubao-code, doubaocode, 豆包, Doubao
- company: ByteDance
- category: chat
- windowsHome: C:\Users\Zhang\.doubao
- windowsAppData: C:\Users\Zhang\AppData\Local\Doubao
- linuxHome: ~/.doubao
- macHome: ~/.doubao
- memoryFiles:
  - Profile */.doubao/agent_mode/workspace/.sessions/*/board.md
  - Profile */.doubao/agent_mode/workspace/.sessions/*/memory.md
- sessionPatterns:
  - Profile */.doubao/agent_mode/workspace/.sessions/*/
- projectTraces:
  - directoryMarker: .doubao, .mediakit-doubao
  - pathHint: board.md may contain paths
  - pathHint: memory.md may contain paths
- behaviorNotes:
  - board.md is task board, may mention project paths
  - memory.md is session memory
  - Multiple profiles supported (Profile 1, Profile 2)

### Kimi / 月之暗面
- canonical: kimi
- aliases: kimi, kimiwork, kimicode, kimi-code, Kimi, Kimiwork, Kimicode
- company: Moonshot AI
- category: chat
- windowsHome: C:\Users\Zhang\.kimi
- linuxHome: ~/.kimi
- macHome: ~/.kimi
- memoryFiles:
  - user-history/*.jsonl
  - sessions/*/context.jsonl
  - sessions/*/wire.jsonl
  - config.toml
  - kimi.json
- sessionPatterns:
  - user-history/*.jsonl
  - sessions/*/context.jsonl
  - sessions/*/wire.jsonl
- projectTraces:
  - directoryMarker: .kimi, .kimiwork, .kimicode
  - pathHint: user-history/*.jsonl content
  - pathHint: sessions/*/context.jsonl content
  - pathHint: sessions/*/wire.jsonl content
- behaviorNotes:
  - user-history/*.jsonl contains user messages with potential paths
  - context.jsonl contains conversation context
  - wire.jsonl contains full conversation wire
  - kimiwork and kimicode variants share same structure

### Wenxin / 文心 (Baidu)
- canonical: wenxin
- aliases: wenxin, wenxin-code, 文心, Wenxin, wenxin-yiyan
- company: Baidu
- category: chat
- windowsHome: C:\Users\Zhang\.wenxin
- windowsAppData: C:\Users\Zhang\AppData\Local\Wenxin
- linuxHome: ~/.wenxin
- macHome: ~/.wenxin
- memoryFiles:
  - config.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .wenxin
  - pathHint: sessions/*.json content
- behaviorNotes:
  - Session JSON may contain conversation with paths

### Lingyi / 灵一
- canonical: lingyi
- aliases: lingyi, lingyi-code, 灵一, Lingyi
- company: Lingyi
- category: chat
- windowsHome: C:\Users\Zhang\.lingyi
- windowsAppData: C:\Users\Zhang\AppData\Local\Lingyi
- linuxHome: ~/.lingyi
- macHome: ~/.lingyi
- memoryFiles:
  - config.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .lingyi
  - pathHint: sessions/*.json content

### Baichuan / 百川
- canonical: baichuan
- aliases: baichuan, baichuan-code, 百川, Baichuan, baichuan-chat
- company: Baichuan
- category: chat
- windowsHome: C:\Users\Zhang\.baichuan
- windowsAppData: C:\Users\Zhang\AppData\Local\Baichuan
- linuxHome: ~/.baichuan
- macHome: ~/.baichuan
- memoryFiles:
  - config.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .baichuan
  - pathHint: sessions/*.json content

### Xunfei / 讯飞
- canonical: xunfei
- aliases: xunfei, xunfei-code, 讯飞, Xunfei, xunfei-xinghuo
- company: iFlytek
- category: chat
- windowsHome: C:\Users\Zhang\.xunfei
- windowsAppData: C:\Users\Zhang\AppData\Local\Xunfei
- linuxHome: ~/.xunfei
- macHome: ~/.xunfei
- memoryFiles:
  - config.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .xunfei
  - pathHint: sessions/*.json content

### MiniMax
- canonical: minimax
- aliases: minimax, minimax-code, minimax-agent, minimax-chat, MiniMax
- company: MiniMax
- category: chat
- windowsHome: C:\Users\Zhang\.minimax
- windowsAppData: C:\Users\Zhang\AppData\Local\MiniMax
- linuxHome: ~/.minimax
- macHome: ~/.minimax
- memoryFiles:
  - config.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .minimax
  - pathHint: sessions/*.json content

### Trae (ByteDance)
- canonical: trae
- aliases: trae, traework, traecode, trae-code, Trae, Traework
- company: ByteDance
- category: ide
- windowsHome: C:\Users\Zhang\.trae
- windowsAppData: C:\Users\Zhang\AppData\Local\Trae
- linuxHome: ~/.trae
- macHome: ~/.trae
- memoryFiles:
  - config.json
  - settings.json
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .trae
  - pathHint: sessions/*.json content

### Poe (Quora)
- canonical: poe
- aliases: poe, Poe
- company: Quora
- category: desktop
- windowsAppData: C:\Users\Zhang\AppData\Roaming\Poe
- linuxHome: ~/.poe
- macHome: ~/.poe
- memoryFiles:
  - config.json
  - SharedStorage/*
  - sessions/*.json
- sessionPatterns:
  - sessions/*.json
- projectTraces:
  - directoryMarker: .poe
  - pathHint: sessions/*.json content

## IDE Extensions

### Cursor
- canonical: cursor
- aliases: cursor, cursor-ide, Cursor
- company: Anysphere
- category: ide
- windowsHome: C:\Users\Zhang\.cursor
- linuxHome: ~/.cursor
- macHome: ~/.cursor
- memoryFiles:
  - config.json
  - settings.json
  - history.json
- projectTraces:
  - directoryMarker: .cursor

### Continue
- canonical: continue
- aliases: continue, continue-dev, Continue
- company: Continue
- category: ide
- windowsHome: C:\Users\Zhang\.continue
- linuxHome: ~/.continue
- macHome: ~/.continue
- memoryFiles:
  - config.json
  - history.json
- projectTraces:
  - directoryMarker: .continue

### CodeBuddy
- canonical: codebuddy
- aliases: codebuddy, workbuddy, code-buddy, work-buddy, CodeBuddy, WorkBuddy
- company: CodeBuddy
- category: ide
- windowsHome: C:\Users\Zhang\.codebuddy
- linuxHome: ~/.codebuddy
- macHome: ~/.codebuddy
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .codebuddy
- behaviorNotes:
  - Often confused with WorkBuddy but distinct product

### Windsurf
- canonical: windsurf
- aliases: windsurf, wind-surf, Windsurf
- company: Windsurf
- category: ide
- windowsHome: C:\Users\Zhang\.windsurf
- linuxHome: ~/.windsurf
- macHome: ~/.windsurf
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .windsurf

### SuperMaven
- canonical: supermaven
- aliases: supermaven, super-maven, SuperMaven
- company: SuperMaven
- category: ide
- windowsHome: C:\Users\Zhang\.supermaven
- linuxHome: ~/.supermaven
- macHome: ~/.supermaven
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .supermaven

### Tabnine
- canonical: tabnine
- aliases: tabnine, tab-nine, Tabnine
- company: Tabnine
- category: ide
- windowsHome: C:\Users\Zhang\.tabnine
- linuxHome: ~/.tabnine
- macHome: ~/.tabnine
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .tabnine

### Cody (Sourcegraph)
- canonical: cody
- aliases: cody, sourcegraph-cody, Cody
- company: Sourcegraph
- category: ide
- windowsHome: C:\Users\Zhang\.cody
- linuxHome: ~/.cody
- macHome: ~/.cody
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .cody

### GitHub Copilot
- canonical: githubcopilot
- aliases: copilot, github-copilot, Copilot, GitHub Copilot
- company: GitHub
- category: ide
- windowsHome: C:\Users\Zhang\.github-copilot
- linuxHome: ~/.github-copilot
- macHome: ~/.github-copilot
- memoryFiles:
  - config.json
  - settings.json
- projectTraces:
  - directoryMarker: .github-copilot, .copilot

## Specialized Agents

### AgentGit
- canonical: agentgit
- aliases: agentgit, agent-git, AgentGit
- company: AgentGit
- category: cli
- windowsHome: C:\Users\Zhang\.agentgit
- linuxHome: ~/.agentgit
- macHome: ~/.agentgit
- memoryFiles:
  - config.json
  - settings.json
  - sessions/*.json
- projectTraces:
  - directoryMarker: .agentgit
  - pathHint: sessions/*.json content

### GBrain
- canonical: gbrain
- aliases: gbrain, g-brain, GBrain
- company: GBrain
- category: cli
- windowsHome: C:\Users\Zhang\.gbrain
- linuxHome: ~/.gbrain
- macHome: ~/.gbrain
- memoryFiles:
  - config.json
  - settings.json
  - brain/*.json
- projectTraces:
  - directoryMarker: .gbrain
  - pathHint: brain/*.json content

### Stigmergy
- canonical: stigmergy
- aliases: stigmergy, stigmergy-cli, Stigmergy
- company: Stigmergy
- category: cli
- windowsHome: C:\Users\Zhang\.stigmergy
- linuxHome: ~/.stigmergy
- macHome: ~/.stigmergy
- memoryFiles:
  - config.json
  - settings.json
  - skills/*/SKILL.md
  - agents/*.json
- projectTraces:
  - directoryMarker: .stigmergy
  - pathHint: agents/*.json content

## Path Resolution Rules

### Windows Path Patterns
- Drive letter: [A-Z]:
- Separator: \
- UNC paths: \\server\share
- Long paths: \\?\C:\...

### Project Root Normalization
Known project roots must be detected from any partial path:
- D:\powerSale → D:\powerSale
- D:\powerSale\.planning → D:\powerSale
- D:\powerSale\output\file.md → D:\powerSale
- E:\fintech\backend → E:\fintech

### Agent Home Filtering
Paths under these prefixes must be dropped:
- C:\Users\Zhang\.claude
- C:\Users\Zhang\.opencode
- C:\Users\Zhang\.qoder
- C:\Users\Zhang\.workbuddy
- C:\Users\Zhang\.zcode
- C:\Users\Zhang\.kilocode
- C:\Users\Zhang\.coze
- C:\Users\Zhang\.doubao
- C:\Users\Zhang\.kimi
- C:\Users\Zhang\.kimiwork
- C:\Users\Zhang\.kimicode
- C:\Users\Zhang\.wenxin
- C:\Users\Zhang\.lingyi
- C:\Users\Zhang\.baichuan
- C:\Users\Zhang\.xunfei
- C:\Users\Zhang\.minimax
- C:\Users\Zhang\.poe
- C:\Users\Zhang\.marvis
- C:\Users\Zhang\.qwen
- C:\Users\Zhang\.deepseek
- C:\Users\Zhang\.grok
- C:\Users\Zhang\.perplexity
- C:\Users\Zhang\.pi
- C:\Users\Zhang\.notebooklm
- C:\Users\Zhang\.character-ai
- C:\Users\Zhang\.devin
- C:\Users\Zhang\.manus
- C:\Users\Zhang\.aider
- C:\Users\Zhang\.continue
- C:\Users\Zhang\.cursor
- C:\Users\Zhang\.codex
- C:\Users\Zhang\.copilot
- C:\Users\Zhang\.gemini
- C:\Users\Zhang\.windsurf
- C:\Users\Zhang\.supermaven
- C:\Users\Zhang\.tabnine
- C:\Users\Zhang\.cody
- C:\Users\Zhang\.github-copilot
- C:\Users\Zhang\.chatgpt
- C:\Users\Zhang\.agentgit
- C:\Users\Zhang\.gbrain
- C:\Users\Zhang\.stigmergy
- C:\Users\Zhang\.iflow
- C:\Users\Zhang\.trae
- C:\Users\Zhang\.codebuddy
- C:\Users\Zhang\AppData\Local\Doubao
- C:\Users\Zhang\AppData\Local\Kimi
- C:\Users\Zhang\AppData\Local\Kimiwork
- C:\Users\Zhang\AppData\Local\Kimicode
- C:\Users\Zhang\AppData\Local\Wenxin
- C:\Users\Zhang\AppData\Local\Lingyi
- C:\Users\Zhang\AppData\Local\Baichuan
- C:\Users\Zhang\AppData\Local\Xunfei
- C:\Users\Zhang\AppData\Local\MiniMax
- C:\Users\Zhang\AppData\Local\Poe
- C:\Users\Zhang\AppData\Local\Trae
- C:\Users\Zhang\AppData\Roaming\Tencent\Marvis
- C:\Users\Zhang\AppData\Roaming\Poe

## Aliases Cross-Reference

| Alias | Canonical |
|-------|-----------|
| kimiwork | kimi |
| kimicode | kimi |
| kimi-code | kimi |
| Kimi | kimi |
| Kimbuddy | kimi |
| qwenwork | qwen |
| qwencode | qwen |
| qwen-code | qwen |
| Qwen | qwen |
| QwenWork | qwen |
| workbuddy | workbuddy |
| work-buddy | workbuddy |
| WorkBuddy | workbuddy |
| trae | trae |
| traework | trae |
| traecode | trae |
| trae-code | trae |
| Trae | trae |
| Traework | trae |
| doubao | doubao |
| doubao-code | doubao |
| doubaocode | doubao |
| 豆包 | doubao |
| Doubao | doubao |
| wenxin | wenxin |
| wenxin-code | wenxin |
| 文心 | wenxin |
| Wenxin | wenxin |
| wenxin-yiyan | wenxin |
| lingyi | lingyi |
| lingyi-code | lingyi |
| 灵一 | lingyi |
| Lingyi | lingyi |
| baichuan | baichuan |
| baichuan-code | baichuan |
| 百川 | baichuan |
| Baichuan | baichuan |
| xunfei | xunfei |
| xunfei-code | xunfei |
| 讯飞 | xunfei |
| Xunfei | xunfei |
| xunfei-xinghuo | xunfei |
| minimax | minimax |
| minimax-code | minimax |
| minimax-agent | minimax |
| minimax-chat | minimax |
| MiniMax | minimax |
| coze | coze |
| coze-code | coze |
| 扣子 | coze |
| Coze | coze |
| marvis | marvis |
| marvis-code | marvis |
| marvis-agent | marvis |
| Marvis | marvis |
| claude | claude |
| claude-code | claude |
| claude-agent | claude |
| Claude | claude |
| opencode | opencode |
| open-code | opencode |
| OpenCode | opencode |
| qoder | qoder |
| qoder-code | qoder |
| Qoder | qoder |
| zcode | zcode |
| z-code | zcode |
| ZCode | zcode |
| kilocode | kilocode |
| kilo-code | kilocode |
| KiloCode | kilocode |
| aider | aider |
| aider-code | aider |
| Aider | aider |
| continue | continue |
| continue-dev | continue |
| Continue | continue |
| cursor | cursor |
| cursor-ide | cursor |
| Cursor | cursor |
| codex | codex |
| openai-codex | codex |
| Codex | codex |
| copilot | copilot |
| github-copilot | copilot |
| Copilot | copilot |
| GitHub Copilot | copilot |
| gemini | gemini |
| gemini-code | gemini |
| Gemini | gemini |
| deepseek | deepseek |
| deepseek-code | deepseek |
| DeepSeek | deepseek |
| grok | grok |
| grok-code | grok |
| Grok | grok |
| perplexity | perplexity |
| perplexity-code | perplexity |
| Perplexity | perplexity |
| pi | pi |
| pi-code | pi |
| Pi | pi |
| notebooklm | notebooklm |
| notebook-lm | notebooklm |
| NotebookLM | notebooklm |
| character-ai | character-ai |
| characterai | character-ai |
| CharacterAI | character-ai |
| devin | devin |
| devin-code | devin |
| Devin | devin |
| manus | manus |
| manus-code | manus |
| Manus | manus |
| iflow | iflow |
| i-flow | iflow |
| iFlow | iflow |
| windsurf | windsurf |
| wind-surf | windsurf |
| Windsurf | windsurf |
| supermaven | supermaven |
| super-maven | supermaven |
| SuperMaven | supermaven |
| tabnine | tabnine |
| tab-nine | tabnine |
| Tabnine | tabnine |
| cody | cody |
| sourcegraph-cody | cody |
| Cody | cody |
| chatgpt | chatgpt |
| chat-gpt | chatgpt |
| ChatGPT | chatgpt |
| agentgit | agentgit |
| agent-git | agentgit |
| AgentGit | agentgit |
| gbrain | gbrain |
| g-brain | gbrain |
| GBrain | gbrain |
| stigmergy | stigmergy |
| stigmergy-cli | stigmergy |
| Stigmergy | stigmergy |
| codebuddy | codebuddy |
| code-buddy | codebuddy |
| CodeBuddy | codebuddy |
