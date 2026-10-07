#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const WIKI_DIR = path.join(process.cwd(), "wiki");
const STATE_FILE = path.join(WIKI_DIR, "state.json");

const AGENT_MARKERS = {
  claude: ['.claude'],
  opencode: ['.opencode'],
  qoder: ['.qoder'],
  zcode: ['.zcode'],
  kilocode: ['.kilocode'],
  aider: ['.aider'],
  continue: ['.continue'],
  cursor: ['.cursor'],
  codex: ['.codex'],
  copilot: ['.copilot'],
  gemini: ['.gemini'],
  qwen: ['.qwen'],
  deepseek: ['.deepseek'],
  grok: ['.grok'],
  perplexity: ['.perplexity'],
  pi: ['.pi'],
  notebooklm: ['.notebooklm'],
  'character-ai': ['.character-ai'],
  devin: ['.devin'],
  manus: ['.manus'],
  workbuddy: ['.workbuddy'],
  marvis: ['.marvis'],
  coze: ['.coze'],
  doubao: ['.doubao', '.mediakit-doubao'],
  kimi: ['.kimi', '.kimiwork', '.kimicode'],
  wenxin: ['.wenxin'],
  lingyi: ['.lingyi'],
  baichuan: ['.baichuan'],
  xunfei: ['.xunfei'],
  minimax: ['.minimax'],
  poe: ['.poe'],
  iflow: ['.iflow'],
  codebuddy: ['.codebuddy'],
  windsurf: ['.windsurf'],
  supermaven: ['.supermaven'],
  tabnine: ['.tabnine'],
  cody: ['.cody'],
  githubcopilot: ['.github-copilot'],
  chatgpt: ['.chatgpt'],
  agentgit: ['.agentgit'],
  gbrain: ['.gbrain'],
  stigmergy: ['.stigmergy'],
  trae: ['.trae']
};

const VERIFIED_AGENTS = new Set([
  'claude', 'opencode', 'qoder', 'zcode', 'workbuddy', 'marvis',
  'kimi', 'qwen', 'cursor', 'codex', 'copilot', 'gemini',
  'gbrain', 'stigmergy', 'iflow', 'codebuddy', 'trae', 'minimax',
  'doubao', 'poe'
]);

const PROJECT_AGENT_MARKERS = {
  'D:\\powerSale': {
    agents: ['zcode', 'qoder', 'claude', 'marvis', 'kimi', 'workbuddy', 'opencode'],
    evidence: ['zcode bot-state.v2.json workspacePath', 'claude history.jsonl project field', 'marvis schedules directory', 'qoder QODER.md', 'opencode storage/session directory field']
  },
  'E:\\fintech': {
    agents: ['zcode', 'qoder', 'claude', 'kimi', 'opencode'],
    evidence: ['zcode v2/setting.json recentProjects', 'qoder trustDirectories', 'claude history.jsonl project field', 'opencode storage/session directory field']
  },
  'D:\\socienceAI': {
    agents: ['claude', 'opencode', 'kilocode'],
    evidence: ['claude history.jsonl project field', 'opencode storage/session directory field', 'kilocode skills directory']
  },
  'D:\\ssciskills': {
    agents: ['claude', 'opencode', 'workbuddy'],
    evidence: ['claude history.jsonl project field', 'opencode storage/session directory field', 'workbuddy usage-log.json']
  },
  'D:\\AIDevelop\\failureLogic': {
    agents: ['claude', 'qwen', 'opencode'],
    evidence: ['claude history.jsonl project field', 'qwen history', 'opencode storage/session directory field']
  },
  'F:\\Chat4': {
    agents: ['zcode', 'claude', 'codebuddy', 'codex', 'cursor', 'gemini', 'qoder', 'qwen', 'kimi'],
    evidence: ['zcode v2/setting.json recentProjects', 'claude history.jsonl project field']
  },
  'F:\\market-repo': {
    agents: ['zcode', 'claude', 'kimi'],
    evidence: ['zcode v2/setting.json recentProjects', 'claude history.jsonl project field']
  }
};

const AGENT_ALIASES = {
  kimi: ['kimi', 'kimiwork', 'kimicode', 'kimi-code', 'Kimi', 'Kimiwork', 'Kimicode'],
  qwen: ['qwen', 'qwenwork', 'qwencode', 'qwen-code', 'Qwen', 'Qwenwork'],
  codebuddy: ['codebuddy', 'workbuddy', 'code-buddy', 'work-buddy', 'CodeBuddy', 'WorkBuddy'],
  trae: ['trae', 'traework', 'traecode', 'trae-code', 'Trae', 'Traework'],
  doubao: ['doubao', 'doubao-code', 'doubaocode', '豆包', 'Doubao'],
  wenxin: ['wenxin', 'wenxin-code', '文心', 'Wenxin', 'wenxin-yiyan'],
  lingyi: ['lingyi', 'lingyi-code', '灵一', 'Lingyi'],
  baichuan: ['baichuan', 'baichuan-code', '百川', 'Baichuan', 'baichuan-chat'],
  xunfei: ['xunfei', 'xunfei-code', '讯飞', 'Xunfei', 'xunfei-xinghuo'],
  minimax: ['minimax', 'minimax-code', 'minimax-agent', 'minimax-chat', 'MiniMax'],
  coze: ['coze', 'coze-code', '扣子', 'Coze'],
  marvis: ['marvis', 'marvis-code', 'marvis-agent', 'Marvis'],
  workbuddy: ['workbuddy', 'work-buddy', 'WorkBuddy'],
  claude: ['claude', 'claude-code', 'claude-agent', 'Claude'],
  opencode: ['opencode', 'open-code', 'OpenCode'],
  qoder: ['qoder', 'qoder-code', 'Qoder'],
  zcode: ['zcode', 'z-code', 'ZCode'],
  kilocode: ['kilocode', 'kilo-code', 'KiloCode'],
  aider: ['aider', 'aider-code', 'Aider'],
  continue: ['continue', 'continue-dev', 'Continue'],
  cursor: ['cursor', 'cursor-ide', 'Cursor'],
  codex: ['codex', 'openai-codex', 'Codex'],
  copilot: ['copilot', 'github-copilot', 'Copilot', 'GitHub Copilot'],
  gemini: ['gemini', 'gemini-code', 'Gemini'],
  deepseek: ['deepseek', 'deepseek-code', 'DeepSeek'],
  grok: ['grok', 'grok-code', 'Grok'],
  perplexity: ['perplexity', 'perplexity-code', 'Perplexity'],
  pi: ['pi', 'pi-code', 'Pi'],
  notebooklm: ['notebooklm', 'notebook-lm', 'NotebookLM'],
  'character-ai': ['character-ai', 'characterai', 'CharacterAI'],
  devin: ['devin', 'devin-code', 'Devin'],
  manus: ['manus', 'manus-code', 'Manus'],
  iflow: ['iflow', 'i-flow', 'iFlow'],
  windsurf: ['windsurf', 'wind-surf', 'Windsurf'],
  supermaven: ['supermaven', 'super-maven', 'SuperMaven'],
  tabnine: ['tabnine', 'tab-nine', 'Tabnine'],
  cody: ['cody', 'sourcegraph-cody', 'Cody'],
  chatgpt: ['chatgpt', 'chat-gpt', 'ChatGPT'],
  agentgit: ['agentgit', 'agent-git', 'AgentGit'],
  gbrain: ['gbrain', 'g-brain', 'GBrain'],
  stigmergy: ['stigmergy', 'stigmergy-cli', 'Stigmergy']
};

const AGENT_ONTOLOGY = {
  claude: {
    canonical: 'claude',
    aliases: ['claude', 'claude-code', 'claude-agent', 'Claude'],
    company: 'Anthropic',
    category: 'cli',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.claude'),
      path.join(process.env.APPDATA || '', 'Claude')
    ],
    memoryFiles: [
      'CONFIG.md',
      'CROSS_CLI_GUIDE.md',
      'settings.json',
      'history.jsonl',
      'CLAUDE.md',
      'ses_*.jsonl'
    ],
    sessionPatterns: ['ses_*.jsonl', 'history.jsonl'],
    projectTraces: ['.claude', 'CLAUDE.md', 'history.jsonl'],
    behaviorNotes: 'Writes project paths into history.jsonl and session files. Creates .claude/agent.json with project context.'
  },
  opencode: {
    canonical: 'opencode',
    aliases: ['opencode', 'open-code', 'OpenCode'],
    company: 'OpenCode',
    category: 'ide',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.opencode'),
      path.join(process.env.USERPROFILE || '~', '.local', 'share', 'opencode')
    ],
    memoryFiles: [
      'CONFIG.md',
      'CROSS_CLI_GUIDE.md',
      'config.json',
      'settings.json',
      'storage/session/*/ses_*.json'
    ],
    sessionPatterns: ['storage/session/*/ses_*.json'],
    projectTraces: ['.opencode', 'storage/session', 'directory'],
    behaviorNotes: 'Session JSON files contain directory field with project path.'
  },
  qoder: {
    canonical: 'qoder',
    aliases: ['qoder', 'qoder-code', 'Qoder'],
    company: 'Qoder',
    category: 'cli',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.qoder')],
    memoryFiles: [
      'QODER.md',
      'AGENTS.md',
      'CONFIG.md',
      'CROSS_CLI_GUIDE.md',
      'settings.json',
      'state.json',
      'skill-usage.json'
    ],
    sessionPatterns: ['logs/runs/*'],
    projectTraces: ['.qoder', 'trustDirectories', 'QODER.md'],
    behaviorNotes: 'QODER.md may contain project-specific instructions. state.json tracks recent projects.'
  },
  zcode: {
    canonical: 'zcode',
    aliases: ['zcode', 'z-code', 'ZCode'],
    company: 'ZCode',
    category: 'editor',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.zcode')],
    memoryFiles: [
      'v2/bot-state.v2.json',
      'v2/setting.json',
      'v2/config.json',
      'cli/log/*.jsonl'
    ],
    sessionPatterns: ['cli/log/*.jsonl'],
    projectTraces: ['.zcode', 'bot-state.v2.json', 'recentProjects'],
    behaviorNotes: 'bot-state.v2.json contains bots with workspacePath. setting.json has recentProjects array.'
  },
  kilocode: {
    canonical: 'kilocode',
    aliases: ['kilocode', 'kilo-code', 'KiloCode'],
    company: 'KiloCode',
    category: 'ide',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.kilocode')],
    memoryFiles: [
      'config.json',
      'settings.json',
      'skills/*/SKILL.md'
    ],
    sessionPatterns: [],
    projectTraces: ['.kilocode', 'skills'],
    behaviorNotes: 'Skills directory may contain project-specific skills.'
  },
  aider: {
    canonical: 'aider',
    aliases: ['aider', 'aider-code', 'Aider'],
    company: 'Aider',
    category: 'cli',
    verifiedLocally: false,
    homes: [path.join(process.env.USERPROFILE || '~', '.aider')],
    memoryFiles: ['config.json', 'history.jsonl', '.aider.input.history', '.aider.chat.history.md'],
    sessionPatterns: ['history.jsonl', '.aider.input.history', '.aider.chat.history.md'],
    projectTraces: ['.aider'],
    behaviorNotes: 'History and chat history may contain project paths in diffs and prompts.'
  },
  continue: {
    canonical: 'continue',
    aliases: ['continue', 'continue-dev', 'Continue', 'cn'],
    company: 'Continue',
    category: 'ide',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.continue'),
      path.join(process.env.APPDATA || '', 'Continue')
    ],
    memoryFiles: [
      'config.yaml',
      'config.json',
      '.continuerc.json',
      'config.ts'
    ],
    sessionPatterns: [],
    projectTraces: ['.continue'],
    behaviorNotes: 'Primary config is config.yaml at %USERPROFILE%\\.continue\\config.yaml. Legacy config.json also supported. .continuerc.json for workspace overrides. Minimal persistent session history.'
  },
  cursor: {
    canonical: 'cursor',
    aliases: ['cursor', 'cursor-ide', 'Cursor'],
    company: 'Anysphere',
    category: 'ide',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.cursor')],
    memoryFiles: ['config.json', 'settings.json', 'history.json'],
    sessionPatterns: ['history.json'],
    projectTraces: ['.cursor'],
    behaviorNotes: ''
  },
  codex: {
    canonical: 'codex',
    aliases: ['codex', 'openai-codex', 'Codex'],
    company: 'OpenAI',
    category: 'cli',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.codex')],
    memoryFiles: ['config.json', 'settings.json', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.codex'],
    behaviorNotes: 'Session JSON contains cwd and project paths.'
  },
  copilot: {
    canonical: 'copilot',
    aliases: ['copilot', 'github-copilot', 'Copilot', 'GitHub Copilot'],
    company: 'GitHub',
    category: 'ide',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.copilot'),
      path.join(process.env.USERPROFILE || '~', '.github-copilot')
    ],
    memoryFiles: ['config.json', 'settings.json'],
    sessionPatterns: [],
    projectTraces: ['.copilot', '.github-copilot'],
    behaviorNotes: ''
  },
  gemini: {
    canonical: 'gemini',
    aliases: ['gemini', 'gemini-code', 'Gemini'],
    company: 'Google',
    category: 'cli',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.gemini')],
    memoryFiles: ['config.json', 'settings.json', 'history.jsonl'],
    sessionPatterns: ['history.jsonl'],
    projectTraces: ['.gemini'],
    behaviorNotes: 'History may contain project paths in prompts.'
  },
  qwen: {
    canonical: 'qwen',
    aliases: ['qwen', 'qwenwork', 'qwencode', 'qwen-code', 'Qwen', 'Qwenwork'],
    company: 'Alibaba',
    category: 'cli',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.qwen'),
      path.join(process.env.USERPROFILE || '~', '.qwenwork')
    ],
    memoryFiles: ['config.json', 'settings.json', 'history.jsonl'],
    sessionPatterns: ['history.jsonl', 'qwen_*.log'],
    projectTraces: ['.qwen', '.qwenwork'],
    behaviorNotes: 'May have qwenwork variant with same structure. History contains full conversation with paths.'
  },
  deepseek: {
    canonical: 'deepseek',
    aliases: ['deepseek', 'deepseek-code', 'DeepSeek', 'deepseek-cli', 'deepseek-tui'],
    company: 'DeepSeek',
    category: 'cli',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.deepseek'),
      path.join(process.env.USERPROFILE || '~', '.deepseek-cli')
    ],
    memoryFiles: [
      'config.toml',
      'config.json',
      'settings.json',
      'history.jsonl',
      'agent/*.md'
    ],
    sessionPatterns: ['history.jsonl', 'agent/*.md'],
    projectTraces: ['.deepseek', '.deepseek-cli'],
    behaviorNotes: 'Official CLI uses config.toml at ~/.deepseek/. Community CLI uses ~/.deepseek-cli/. Agent definitions in agent/*.md may contain project context.'
  },
  grok: {
    canonical: 'grok',
    aliases: ['grok', 'grok-code', 'Grok', 'grok-cli'],
    company: 'xAI',
    category: 'cli',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.grok'),
      path.join(process.env.USERPROFILE || '~', '.grok-cli')
    ],
    memoryFiles: [
      'config.toml',
      'config.json',
      'auth.json',
      'session.db',
      'update.json'
    ],
    sessionPatterns: ['session.db', 'auth.json'],
    projectTraces: ['.grok', '.grok-cli'],
    behaviorNotes: 'Official xAI CLI uses ~/.grok/config.toml. Community grok-cli uses ~/.grok-cli/. session.db tracks usage history. auth.json stores OAuth tokens.'
  },
  perplexity: {
    canonical: 'perplexity',
    aliases: ['perplexity', 'perplexity-code', 'Perplexity', 'pplx'],
    company: 'Perplexity AI',
    category: 'cli',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.config', 'pplx'),
      path.join(process.env.USERPROFILE || '~', '.config', 'perplexity'),
      path.join(process.env.USERPROFILE || '~', '.perplexity')
    ],
    memoryFiles: [
      'pplx-receipt.json',
      'credentials.json',
      'config.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.perplexity'],
    behaviorNotes: 'Official pplx CLI is stateless by design, uses env var PERPLEXITY_API_KEY. pplx auth login stores key in ~/.config/pplx/ or ~/.config/perplexity/. No persistent session history.'
  },
  pi: {
    canonical: 'pi',
    aliases: ['pi', 'pi-code', 'Pi', 'pi-coding-agent'],
    company: 'Inflection',
    category: 'cli',
    verifiedLocally: false,
    homes: [path.join(process.env.USERPROFILE || '~', '.pi')],
    memoryFiles: [
      'agent/settings.json',
      'agent/auth.json',
      'agent/SYSTEM.md',
      'agent/AGENTS.md',
      'agent/sessions/*',
      'agent/skills/*/SKILL.md',
      'agent/extensions/*/config.json'
    ],
    sessionPatterns: ['agent/sessions/*'],
    projectTraces: ['.pi'],
    behaviorNotes: 'Pi coding agent stores config in ~/.pi/agent/. Sessions saved to ~/.pi/agent/sessions/ organized by working directory. Skills and extensions provide project context. auth.json contains provider API keys.'
  },
  notebooklm: {
    canonical: 'notebooklm',
    aliases: ['notebooklm', 'notebook-lm', 'NotebookLM', 'notebooklm-py', 'nlm'],
    company: 'Google',
    category: 'cli',
    verifiedLocally: false,
    homes: [path.join(process.env.USERPROFILE || '~', '.notebooklm')],
    memoryFiles: [
      'config.json',
      'storage_state.json',
      'profiles/*/storage_state.json',
      'profiles/*/context.json',
      'profiles/*/browser_profile/'
    ],
    sessionPatterns: ['profiles/*/context.json'],
    projectTraces: ['.notebooklm'],
    behaviorNotes: 'CLI wrapper for Google NotebookLM. Config at ~/.notebooklm/config.json. Auth cookies in storage_state.json. Context file tracks active notebook/conversation. Browser profile for Chromium login. History via `notebooklm history` command.'
  },
  'character-ai': {
    canonical: 'character-ai',
    aliases: ['character-ai', 'characterai', 'CharacterAI', 'c.ai', 'character-ai-desktop'],
    company: 'Character.AI',
    category: 'web',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.character-ai'),
      path.join(process.env.LOCALAPPDATA || '', 'Character AI')
    ],
    memoryFiles: [
      'config.json',
      'settings.json',
      'storage_state.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.character-ai'],
    behaviorNotes: 'Primarily web-based platform. No official Windows desktop app. Third-party wrappers like WebCatalog may create local state. History is cloud-based; export only via GDPR request. Minimal local file access possible.'
  },
  devin: {
    canonical: 'devin',
    aliases: ['devin', 'devin-code', 'Devin', 'devin-cli', 'devin-desktop'],
    company: 'Cognition',
    category: 'cli',
    verifiedLocally: false,
    homes: [
      path.join(process.env.APPDATA || '', 'devin'),
      path.join(process.env.USERPROFILE || '~', '.devin'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DevinClient')
    ],
    memoryFiles: [
      'config.json',
      'mcp_config.json',
      'AGENTS.md',
      '.devin/config.json',
      '.devin/config.local.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.devin'],
    behaviorNotes: 'Windows config at %APPDATA%\\devin\\config.json. Project configs in .devin/config.json. Sessions are cloud-based; local state limited to config and MCP setup.'
  },
  manus: {
    canonical: 'manus',
    aliases: ['manus', 'manus-code', 'Manus', 'manus-cli', 'manus-agent'],
    company: 'Manus',
    category: 'cli',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.manus'),
      path.join(process.env.APPDATA || '', 'Manus')
    ],
    memoryFiles: [
      'config/config.json',
      'config/baseline/config.json',
      'config.toml',
      'history.jsonl'
    ],
    sessionPatterns: ['history.jsonl', 'config/baseline/config.json'],
    projectTraces: ['.manus'],
    behaviorNotes: 'Desktop app and CLI share ~/.manus/. config/config.json stores connectors and settings. history.jsonl tracks task execution. API key stored in config.toml or env MANUS_API_KEY.'
  },
  workbuddy: {
    canonical: 'workbuddy',
    aliases: ['workbuddy', 'work-buddy', 'WorkBuddy'],
    company: 'WorkBuddy',
    category: 'desktop',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.workbuddy')],
    memoryFiles: [
      'MEMORY.md',
      'IDENTITY.md',
      'BOOTSTRAP.md',
      'failover.json',
      'mcp.json',
      'mcp-tool-list.json',
      '.skill-list-cache.json',
      'usage-log.json',
      'user-state.json',
      'ioa-im-override.json'
    ],
    databaseFiles: ['workbuddy.db'],
    sessionPatterns: ['usage-log.json', 'user-state.json'],
    projectTraces: ['.workbuddy', 'usage-log.json', 'mcp-tool-list.json'],
    behaviorNotes: 'usage-log.json tracks skill usage by date. user-state.json contains recent activity. workbuddy.db may contain project references.'
  },
  marvis: {
    canonical: 'marvis',
    aliases: ['marvis', 'marvis-code', 'marvis-agent', 'Marvis'],
    company: 'Tencent',
    category: 'desktop',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.marvis'),
      path.join(process.env.APPDATA || '', 'Tencent', 'Marvis', 'User')
    ],
    memoryFiles: [
      '*/schedules/*.yaml',
      '*/messages/*.md',
      '*/database/*.db',
      '*/workspace/conv_*'
    ],
    sessionPatterns: ['*/schedules/*.yaml', '*/messages/*.md', '*/workspace/conv_*'],
    projectTraces: ['.marvis', 'schedules/*.yaml', 'messages/*.md', 'workspace/conv_*'],
    behaviorNotes: 'Schedules YAML contains full prompt text with project paths. Messages contain meta JSON with execution context. Workspace conv_* directories named by conversation ID.'
  },
  coze: {
    canonical: 'coze',
    aliases: ['coze', 'coze-code', '扣子', 'Coze', 'coze-desktop'],
    company: 'ByteDance',
    category: 'chat',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.coze'),
      path.join(process.env.LOCALAPPDATA || '', 'Coze')
    ],
    memoryFiles: [
      'config.json',
      'bridge/config.json',
      'agents/*/config.json',
      'agents/*/workspace/.sessions/*/board.md',
      'agents/*/workspace/.sessions/*/memory.md'
    ],
    sessionPatterns: ['agents/*/workspace/.sessions/*/'],
    projectTraces: ['.coze', 'agents/*/workspace'],
    behaviorNotes: 'Coze 3.0 desktop app for Windows/macOS. coze-bridge component manages local agent integration. Agent workspace contains sessions with board.md and memory.md. Cloud-based agent execution with local bridge.'
  },
  doubao: {
    canonical: 'doubao',
    aliases: ['doubao', 'doubao-code', 'doubaocode', '豆包', 'Doubao'],
    company: 'ByteDance',
    category: 'chat',
    verifiedLocally: true,
    homes: [
      path.join(process.env.LOCALAPPDATA || '', 'Doubao', 'User Data')
    ],
    memoryFiles: [
      'Profile 1/.doubao/agent_mode/workspace/.sessions/*/board.md',
      'Profile 2/.doubao/agent_mode/workspace/.sessions/*/board.md',
      'Profile 1/.doubao/agent_mode/workspace/.sessions/*/memory.md',
      'Profile 2/.doubao/agent_mode/workspace/.sessions/*/memory.md'
    ],
    sessionPatterns: ['Profile */.doubao/agent_mode/workspace/.sessions/*/'],
    projectTraces: ['.doubao', '.mediakit-doubao', 'board.md', 'memory.md'],
    behaviorNotes: 'board.md is task board, may mention project paths. memory.md is session memory. Multiple profiles supported.'
  },
  kimi: {
    canonical: 'kimi',
    aliases: ['kimi', 'kimiwork', 'kimicode', 'kimi-code', 'Kimi', 'Kimiwork', 'Kimicode'],
    company: 'Moonshot AI',
    category: 'chat',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.kimi'),
      path.join(process.env.LOCALAPPDATA || '', 'Kimi', 'User Data')
    ],
    memoryFiles: [
      'user-history/*.jsonl',
      'sessions/*/context.jsonl',
      'sessions/*/wire.jsonl',
      'config.toml',
      'kimi.json'
    ],
    sessionPatterns: ['user-history/*.jsonl', 'sessions/*/context.jsonl', 'sessions/*/wire.jsonl'],
    projectTraces: ['.kimi', '.kimiwork', '.kimicode', 'user-history/*.jsonl', 'sessions/*/context.jsonl'],
    behaviorNotes: 'user-history/*.jsonl contains user messages with potential paths. context.jsonl contains conversation context. wire.jsonl contains full conversation wire. kimiwork and kimicode variants share same structure.'
  },
  wenxin: {
    canonical: 'wenxin',
    aliases: ['wenxin', 'wenxin-yiyan', '文心一言', 'ernie-bot', 'Wenxin', 'ERNIE Bot', '文心'],
    company: 'Baidu',
    category: 'chat',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.wenxin'),
      path.join(process.env.APPDATA || '', 'Wenxin'),
      path.join(process.env.LOCALAPPDATA || '', 'Baidu', 'Wenxin')
    ],
    memoryFiles: [
      'config.json',
      'config.ini',
      'cache/*',
      'sessions/*',
      'history/*'
    ],
    sessionPatterns: ['sessions/*', 'history/*'],
    projectTraces: ['.wenxin'],
    behaviorNotes: 'Baidu Wenxin desktop app for Windows. Config stored in AppData. History encrypted with AES-256. Cache in LocalAppData/Baidu/Wenxin. Mobile and desktop sync via Baidu account. No official CLI.'
  },
  lingyi: {
    canonical: 'lingyi',
    aliases: ['lingyi', 'lingyi-code', '灵一', 'Lingyi'],
    company: 'Lingyi',
    category: 'chat',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.lingyi'),
      path.join(process.env.LOCALAPPDATA || '', 'Lingyi', 'User Data')
    ],
    memoryFiles: ['config.json', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.lingyi'],
    behaviorNotes: ''
  },
  baichuan: {
    canonical: 'baichuan',
    aliases: ['baichuan', 'baichuan-code', '百川', 'Baichuan', 'baichuan-chat'],
    company: 'Baichuan',
    category: 'chat',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.baichuan'),
      path.join(process.env.LOCALAPPDATA || '', 'Baichuan', 'User Data')
    ],
    memoryFiles: ['config.json', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.baichuan'],
    behaviorNotes: ''
  },
  xunfei: {
    canonical: 'xunfei',
    aliases: ['xunfei', '讯飞星火', 'spark', 'iFlytek', 'Xunfei', '讯飞'],
    company: 'iFlytek',
    category: 'chat',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.xunfei'),
      path.join(process.env.APPDATA || '', 'iFlytek'),
      path.join(process.env.LOCALAPPDATA || '', 'iFlytek', 'Spark')
    ],
    memoryFiles: [
      'config.json',
      'settings.json',
      'sessions/*',
      'history/*'
    ],
    sessionPatterns: ['sessions/*', 'history/*'],
    projectTraces: ['.xunfei'],
    behaviorNotes: 'iFlytek Spark desktop app for Windows/macOS. Config in AppData/iFlytek. History synced across devices via iFlytek account. Supports voice, image, and text interaction. No official CLI.'
  },
  minimax: {
    canonical: 'minimax',
    aliases: ['minimax', 'minimax-code', 'minimax-agent', 'minimax-chat', 'MiniMax'],
    company: 'MiniMax',
    category: 'chat',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.minimax'),
      path.join(process.env.LOCALAPPDATA || '', 'MiniMax', 'User Data')
    ],
    memoryFiles: ['config.json', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.minimax'],
    behaviorNotes: ''
  },
  trae: {
    canonical: 'trae',
    aliases: ['trae', 'traework', 'traecode', 'trae-code', 'Trae', 'Traework'],
    company: 'ByteDance',
    category: 'ide',
    verifiedLocally: true,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.trae'),
      path.join(process.env.LOCALAPPDATA || '', 'Trae')
    ],
    memoryFiles: ['config.json', 'settings.json', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.trae'],
    behaviorNotes: ''
  },
  poe: {
    canonical: 'poe',
    aliases: ['poe', 'Poe'],
    company: 'Quora',
    category: 'desktop',
    verifiedLocally: true,
    homes: [path.join(process.env.APPDATA || '', 'Poe')],
    memoryFiles: ['config.json', 'SharedStorage/*', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.poe'],
    behaviorNotes: ''
  },
  iflow: {
    canonical: 'iflow',
    aliases: ['iflow', 'i-flow', 'iFlow'],
    company: 'iFlow',
    category: 'cli',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.iflow')],
    memoryFiles: ['config.json', 'settings.json', 'agents/*.json'],
    sessionPatterns: ['agents/*.json'],
    projectTraces: ['.iflow'],
    behaviorNotes: ''
  },
  codebuddy: {
    canonical: 'codebuddy',
    aliases: ['codebuddy', 'workbuddy', 'code-buddy', 'work-buddy', 'CodeBuddy', 'WorkBuddy'],
    company: 'CodeBuddy',
    category: 'ide',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.codebuddy')],
    memoryFiles: ['config.json', 'settings.json'],
    sessionPatterns: [],
    projectTraces: ['.codebuddy'],
    behaviorNotes: 'Often confused with WorkBuddy but distinct product.'
  },
  windsurf: {
    canonical: 'windsurf',
    aliases: ['windsurf', 'wind-surf', 'Windsurf', 'devin-desktop'],
    company: 'Windsurf',
    category: 'ide',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.codeium', 'windsurf'),
      path.join(process.env.APPDATA || '', 'Windsurf', 'User'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Windsurf')
    ],
    memoryFiles: [
      'mcp_config.json',
      'memories/global_rules.md',
      'settings.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.windsurf', '.codeium/windsurf'],
    behaviorNotes: 'AI config in ~/.codeium/windsurf/. Editor settings in %APPDATA%\\Windsurf\\User\\settings.json. Formerly Codeium Windsurf, rebranded to Devin Desktop. Memories/global_rules.md may contain project context.'
  },
  supermaven: {
    canonical: 'supermaven',
    aliases: ['supermaven', 'super-maven', 'SuperMaven', 'cursor-agent'],
    company: 'SuperMaven',
    category: 'ide',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.supermaven'),
      path.join(process.env.APPDATA || '', 'SuperMaven')
    ],
    memoryFiles: [
      'config.json',
      'settings.json',
      'state.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.supermaven'],
    behaviorNotes: 'Acquired by Cursor/Anysphere in Nov 2024. Sunset in Nov 2025. Users migrat to Cursor. Minimal local state; primarily VS Code/JetBrains extension.'
  },
  tabnine: {
    canonical: 'tabnine',
    aliases: ['tabnine', 'tab-nine', 'Tabnine', 'tabnine-cli'],
    company: 'Tabnine',
    category: 'ide',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.tabnine'),
      path.join(process.env.LOCALAPPDATA || '', 'ProgramData', 'tabnine-cli')
    ],
    memoryFiles: [
      'agent/settings.json',
      'agent/mcp-server-enablement.json',
      'TABNINE.md'
    ],
    sessionPatterns: [],
    projectTraces: ['.tabnine'],
    behaviorNotes: 'User config at ~/.tabnine/agent/settings.json. Project config at <project>/.tabnine/agent/settings.json. System-wide at C:\\ProgramData\\tabnine-cli\\settings.json. TABNINE.md files provide project context.'
  },
  cody: {
    canonical: 'cody',
    aliases: ['cody', 'sourcegraph-cody', 'Cody', 'sourcegraph'],
    company: 'Sourcegraph',
    category: 'ide',
    verifiedLocally: false,
    homes: [
      path.join(process.env.USERPROFILE || '~', '.sourcegraph'),
      path.join(process.env.APPDATA || '', 'Sourcegraph')
    ],
    memoryFiles: [
      'config.json',
      'settings.json',
      'cody-history.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.cody', '.sourcegraph'],
    behaviorNotes: 'Primarily cloud-connected IDE extension. Minimal local state. History and context primarily in Sourcegraph cloud. CLI available but less common.'
  },
  chatgpt: {
    canonical: 'chatgpt',
    aliases: ['chatgpt', 'chat-gpt', 'ChatGPT', 'openai-chatgpt'],
    company: 'OpenAI',
    category: 'web',
    verifiedLocally: false,
    homes: [
      path.join(process.env.LOCALAPPDATA || '', 'Packages', 'OpenAI.ChatGPT-Desktop_*', 'LocalCache', 'Roaming', 'ChatGPT'),
      path.join(process.env.APPDATA || '', 'OpenAI', 'ChatGPT')
    ],
    memoryFiles: [
      'IndexedDB/*',
      'Local Storage/leveldb/*',
      'config.json'
    ],
    sessionPatterns: [],
    projectTraces: ['.chatgpt'],
    behaviorNotes: 'Windows Store app data in AppData\\Local\\Packages\\OpenAI.ChatGPT-Desktop_*. Chat history in IndexedDB and Local Storage. Web app data in AppData\\Roaming\\OpenAI\\ChatGPT. Limited file-based access.'
  },
  agentgit: {
    canonical: 'agentgit',
    aliases: ['agentgit', 'agent-git', 'AgentGit'],
    company: 'AgentGit',
    category: 'cli',
    verifiedLocally: false,
    homes: [path.join(process.env.USERPROFILE || '~', '.agentgit')],
    memoryFiles: ['config.json', 'settings.json', 'sessions/*.json'],
    sessionPatterns: ['sessions/*.json'],
    projectTraces: ['.agentgit'],
    behaviorNotes: ''
  },
  gbrain: {
    canonical: 'gbrain',
    aliases: ['gbrain', 'g-brain', 'GBrain'],
    company: 'GBrain',
    category: 'cli',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.gbrain')],
    memoryFiles: ['config.json', 'settings.json', 'brain/*.json'],
    sessionPatterns: ['brain/*.json'],
    projectTraces: ['.gbrain'],
    behaviorNotes: ''
  },
  stigmergy: {
    canonical: 'stigmergy',
    aliases: ['stigmergy', 'stigmergy-cli', 'Stigmergy'],
    company: 'Stigmergy',
    category: 'cli',
    verifiedLocally: true,
    homes: [path.join(process.env.USERPROFILE || '~', '.stigmergy')],
    memoryFiles: ['config.json', 'settings.json', 'skills/*/SKILL.md', 'agents/*.json'],
    sessionPatterns: ['agents/*.json'],
    projectTraces: ['.stigmergy'],
    behaviorNotes: ''
  }
};

const RECENT_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000;

const PROJECT_ROOTS = {
  'd:\\powersale': 'D:\\powerSale',
  'd:\\power sale': 'D:\\powerSale',
  'd:\\socianceai': 'D:\\socienceAI',
  'd:\\sciienceai': 'D:\\socienceAI',
  'd:\\stigmergy-cli-multi-agents': 'D:\\stigmergy-CLI-Multi-Agents',
  'f:\\chat4': 'F:\\Chat4',
  'e:\\fintech': 'E:\\fintech',
  'd:\\ssciskills': 'D:\\ssciskills',
  'd:\\aidevelop': 'D:\\AIDevelop',
  'd:\\market-repo': 'F:\\market-repo'
};

function resolveAgentAlias(name) {
  const lower = name.toLowerCase();
  for (const [canonical, ontology] of Object.entries(AGENT_ONTOLOGY)) {
    for (const alias of ontology.aliases) {
      if (lower === alias.toLowerCase()) {
        return canonical;
      }
    }
  }
  return null;
}

const USER_HOME = path.join(process.env.USERPROFILE || "~");
const APPDATA = path.join(process.env.APPDATA || "");
const LOCALAPPDATA = path.join(process.env.LOCALAPPDATA || "");

const AGENT_SEARCH_ROOTS = [
  { base: USER_HOME, subdirs: [""] },
  { base: APPDATA, subdirs: ["Tencent/Marvis/User", "Poe"] },
  { base: LOCALAPPDATA, subdirs: ["Doubao/User Data", "Kimi/User Data", "MiniMax/User Data", "Trae"] }
];

function autoDiscoverAgentHomes() {
  const discovered = new Map();
  for (const root of AGENT_SEARCH_ROOTS) {
    for (const sub of root.subdirs) {
      const base = path.join(root.base, sub);
      if (!fs.existsSync(base)) continue;
      try {
        const entries = fs.readdirSync(base, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory() || !entry.name.startsWith('.')) continue;
          const canonical = resolveAgentAlias(entry.name.slice(1));
          if (!canonical) continue;
          const home = path.join(base, entry.name);
          if (!discovered.has(canonical)) {
            discovered.set(canonical, { home, sources: [] });
          }
          discovered.get(canonical).sources.push(home);
        }
      } catch {}
    }
  }
  return discovered;
}

function autoBuildAgentConfigs(discoveredHomes) {
  const configs = {};
  for (const [canonical, ontology] of Object.entries(AGENT_ONTOLOGY)) {
    if (!ontology.verifiedLocally) continue;
    const discovered = discoveredHomes.get(canonical);
    const homes = discovered ? [discovered.home, ...ontology.homes.filter(h => h !== discovered.home)] : ontology.homes;
    const validHomes = homes.filter(h => fs.existsSync(h.replace(/^~/, process.env.USERPROFILE || '~')));
    if (validHomes.length === 0) continue;

    const memoryFiles = new Set();
    const summaryExtractors = {};
    for (const pattern of ontology.memoryFiles) {
      memoryFiles.add(pattern);
      if (pattern.includes('sessions') || pattern.includes('session') || pattern.includes('history') || pattern.includes('user-history')) {
        summaryExtractors[pattern] = (f, c) => {
          const text = typeof c === 'string' ? c : JSON.stringify(c);
          const projectPaths = extractPathsFromText(text).map(normalizeProjectPath).filter(Boolean);
          return { type: 'session', size: text.length, projectPaths, updatedAt: fs.statSync(f).mtime.toISOString() };
        };
      } else if (pattern.endsWith('.json') || pattern.endsWith('.jsonl')) {
        summaryExtractors[pattern] = (f, c) => { try { return JSON.parse(c); } catch { return {}; } };
      } else if (pattern.endsWith('.md')) {
        summaryExtractors[pattern] = (f, c) => ({ type: 'markdown', size: c.length });
      } else if (pattern.endsWith('.yaml')) {
        summaryExtractors[pattern] = (f, c) => ({ type: 'yaml', size: c.length });
      } else if (pattern.includes('*')) {
        summaryExtractors[pattern] = (f, c) => ({ type: 'session', size: typeof c === 'string' ? c.length : JSON.stringify(c).length });
      }
    }

    if (canonical === 'zcode') {
      summaryExtractors['v2/setting.json'] = (f, c) => {
        try {
          const d = JSON.parse(c);
          return { recentProjects: d.recentProjects || [], lastActiveTabIndex: d.lastActiveTabIndex };
        } catch { return {}; }
      };
      summaryExtractors['v2/bot-state.v2.json'] = (f, c) => {
        try {
          const d = JSON.parse(c);
          const bots = d.bots || {};
          const paths = Object.values(bots).map(b => b.workspacePath).filter(Boolean);
          return { bots, workspacePaths: paths, updatedAt: fs.statSync(f).mtime.toISOString() };
        } catch { return {}; }
      };
      summaryExtractors['cli/log/*.jsonl'] = (f, c) => {
        const lines = c.split('\n').filter(l => l.trim()).slice(-5);
        return { recentLogLines: lines.length, lastLine: lines[lines.length - 1] || '' };
      };
    }

    if (canonical === 'opencode') {
      summaryExtractors['config.json'] = (f, c) => {
        try {
          const d = JSON.parse(c);
          return { injectedPaths: d.injectedPaths || [], sessionId: d.sessionId };
        } catch { return {}; }
      };
      summaryExtractors['storage/session/*/ses_*.json'] = (f, c) => {
        try {
          const d = JSON.parse(c);
          return { directory: d.directory, projectID: d.projectID, title: d.title, time: d.time };
        } catch { return {}; }
      };
    }

    if (canonical === 'claude') {
      summaryExtractors['history.jsonl'] = (f, c) => {
        const lines = c.split('\n').filter(l => l.trim()).slice(-10);
        const projectPaths = new Set();
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.cwd) projectPaths.add(entry.cwd);
            if (entry.project) projectPaths.add(entry.project);
          } catch {}
        }
        return { type: 'history', size: c.length, projectPaths: Array.from(projectPaths), updatedAt: fs.statSync(f).mtime.toISOString() };
      };
    }

    if (canonical === 'kimi') {
      summaryExtractors['user-history/*.jsonl'] = (f, c) => {
        const lines = c.split('\n').filter(l => l.trim()).slice(-5);
        const projectPaths = new Set();
        for (const line of lines) {
          const paths = extractPathsFromText(line);
          paths.forEach(p => { const n = normalizeProjectPath(p); if (n) projectPaths.add(n); });
        }
        return { type: 'user-history', size: c.length, projectPaths: Array.from(projectPaths), updatedAt: fs.statSync(f).mtime.toISOString() };
      };
    }

    if (canonical === 'qwen') {
      summaryExtractors['history.jsonl'] = (f, c) => {
        const lines = c.split('\n').filter(l => l.trim()).slice(-10);
        const projectPaths = new Set();
        for (const line of lines) {
          const paths = extractPathsFromText(line);
          paths.forEach(p => { const n = normalizeProjectPath(p); if (n) projectPaths.add(n); });
        }
        return { type: 'history', size: c.length, projectPaths: Array.from(projectPaths), updatedAt: fs.statSync(f).mtime.toISOString() };
      };
    }

    if (canonical === 'gemini') {
      summaryExtractors['history.jsonl'] = (f, c) => {
        const lines = c.split('\n').filter(l => l.trim()).slice(-10);
        const projectPaths = new Set();
        for (const line of lines) {
          const paths = extractPathsFromText(line);
          paths.forEach(p => { const n = normalizeProjectPath(p); if (n) projectPaths.add(n); });
        }
        return { type: 'history', size: c.length, projectPaths: Array.from(projectPaths), updatedAt: fs.statSync(f).mtime.toISOString() };
      };
    }

    if (canonical === 'doubao') {
      summaryExtractors['Profile */.doubao/agent_mode/workspace/.sessions/*/board.md'] = (f, c) => {
        const paths = extractPathsFromText(c).map(normalizeProjectPath).filter(Boolean);
        return { type: 'board', size: c.length, projectPaths: paths, updatedAt: fs.statSync(f).mtime.toISOString() };
      };
      summaryExtractors['Profile */.doubao/agent_mode/workspace/.sessions/*/memory.md'] = (f, c) => {
        const paths = extractPathsFromText(c).map(normalizeProjectPath).filter(Boolean);
        return { type: 'memory', size: c.length, projectPaths: paths, updatedAt: fs.statSync(f).mtime.toISOString() };
      };
    }

    if (canonical === 'marvis') {
      summaryExtractors['*/schedules/*.yaml'] = (f, c) => {
        const paths = extractPathsFromText(c).map(normalizeProjectPath).filter(Boolean);
        return { type: 'schedule', size: c.length, projectPaths: paths, updatedAt: fs.statSync(f).mtime.toISOString() };
      };
      summaryExtractors['*/messages/*.md'] = (f, c) => {
        const paths = extractPathsFromText(c).map(normalizeProjectPath).filter(Boolean);
        return { type: 'message', size: c.length, projectPaths: paths, updatedAt: fs.statSync(f).mtime.toISOString() };
      };
    }

    if (canonical === 'workbuddy') {
      summaryExtractors['usage-log.json'] = (f, c) => {
        try { return JSON.parse(c); } catch { return {}; }
      };
      summaryExtractors['user-state.json'] = (f, c) => {
        try { return JSON.parse(c); } catch { return {}; }
      };
    }

    configs[canonical] = {
      type: ontology.category,
      home: validHomes[0],
      homes: validHomes,
      memoryFiles: Array.from(memoryFiles),
      summaryExtractors,
      aliases: ontology.aliases,
      company: ontology.company,
      behaviorNotes: ontology.behaviorNotes
    };
  }
  return configs;
}

const AGENT_HOME_PREFIXES = [
  'C:\\Users\\Zhang\\.claude',
  'C:\\Users\\Zhang\\.opencode',
  'C:\\Users\\Zhang\\.qoder',
  'C:\\Users\\Zhang\\.workbuddy',
  'C:\\Users\\Zhang\\.zcode',
  'C:\\Users\\Zhang\\.kilocode',
  'C:\\Users\\Zhang\\.qwen',
  'C:\\Users\\Zhang\\.cursor',
  'C:\\Users\\Zhang\\.codex',
  'C:\\Users\\Zhang\\.copilot',
  'C:\\Users\\Zhang\\.gemini',
  'C:\\Users\\Zhang\\.minimax',
  'C:\\Users\\Zhang\\.marvis',
  'C:\\Users\\Zhang\\.gbrain',
  'C:\\Users\\Zhang\\.stigmergy',
  'C:\\Users\\Zhang\\.iflow',
  'C:\\Users\\Zhang\\.codebuddy',
  'C:\\Users\\Zhang\\.trae',
  'C:\\Users\\Zhang\\.kimi',
  'C:\\Users\\Zhang\\AppData\\Local\\Doubao',
  'C:\\Users\\Zhang\\AppData\\Local\\Kimi',
  'C:\\Users\\Zhang\\AppData\\Roaming\\WorkBuddy',
  'C:\\Users\\Zhang\\AppData\\Roaming\\Poe',
  'C:\\Users\\Zhang\\AppData\\Roaming\\Tencent\\Marvis'
];

function extractPathsFromText(text) {
  const paths = new Set();
  const regex = /[A-Z]:\\(?:[^"\\/|<>:*?\s]+\\)*[^"\\/|<>:*?\s]*/g;
  const matches = text.match(regex) || [];
  for (const m of matches) {
    if (m.length >= 3 && !m.includes('\\n') && !m.includes('\\t') && !m.includes('\\r')) paths.add(m);
  }
  return Array.from(paths);
}

function normalizeProjectPath(raw) {
  if (!raw || raw.length < 3) return null;
  const lower = raw.toLowerCase();
  for (const prefix of AGENT_HOME_PREFIXES) {
    if (lower.startsWith(prefix.toLowerCase())) return null;
  }
  const cleaned = raw.replace(/\\$/, '');
  if (cleaned.length < 3) return null;
  
  const hasExtension = /\.[a-z]{1,4}$/i.test(cleaned);
  if (hasExtension) return null;
  
  const parts = cleaned.split(/[\\\/]/);
  const meaningful = parts.filter(p => p && p !== '-' && p.length > 1 && !/^\d+$/.test(p) && p !== 'n');
  if (meaningful.length === 0) return null;
  
  const normalizedDrive = cleaned[0].toLowerCase() + cleaned.slice(1).split(/[\\\/]/)[0];
  const rest = cleaned.slice(normalizedDrive.length).replace(/^[\\\/]+/, '');
  let normalizedPath = normalizedDrive + '\\' + rest;
  
  const normalizedLower = normalizedPath.toLowerCase();
  for (const [variant, canonical] of Object.entries(PROJECT_ROOTS)) {
    if (normalizedLower === variant.toLowerCase() || normalizedLower.startsWith(variant.toLowerCase() + '\\')) {
      normalizedPath = canonical + normalizedPath.slice(variant.length);
      break;
    }
  }
  
  return normalizedPath;
}

class StigmergyWiki {
  constructor() {
    this.ensureWikiDir();
    this.state = this.loadState();
  }

  ensureWikiDir() {
    if (!fs.existsSync(WIKI_DIR)) fs.mkdirSync(WIKI_DIR, { recursive: true });
  }

  loadState() {
    if (fs.existsSync(STATE_FILE)) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch {}
    }
    return { lastRun: null, projects: {}, agents: {}, evidence: [] };
  }

  saveState() {
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, { depth: 3 }, 2));
  }

  async scanAgentMemory(agentName, config) {
    const summaries = [];
    const { globSync } = require("glob");
    const homes = config.homes || [config.home];

    for (const home of homes) {
      const homeResolved = home.replace(/^~/, process.env.USERPROFILE || '~');
      if (!fs.existsSync(homeResolved)) continue;

      for (const pattern of config.memoryFiles) {
        try {
          const fullPattern = path.join(homeResolved.replace(/\\/g, "/"), pattern).replace(/\\/g, "/");
          let matches = globSync(fullPattern, { absolute: true, dot: true, onlyFiles: true });
          matches = matches.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime).slice(0, 50);

          for (const file of matches) {
            try {
              const stat = fs.statSync(file);
              if (stat.size > 10 * 1024 * 1024) {
                summaries.push({
                  agent: agentName,
                  file,
                  error: "file_too_large",
                  modified: stat.mtime.toISOString()
                });
                continue;
              }
              const content = fs.readFileSync(file, "utf8");
              const fileKey = file.toLowerCase().replace(/\\/g, "/");

              const extractor = Object.keys(config.summaryExtractors).find(pat => {
                const patParts = pat.replace(/\\/g, "/").split("*");
                return patParts.every(part => fileKey.includes(part.toLowerCase()));
              });

              if (extractor) {
                const summary = config.summaryExtractors[extractor](file, content);
                summaries.push({
                  agent: agentName,
                  file,
                  modified: stat.mtime.toISOString(),
                  summary
                });
              } else {
                summaries.push({
                  agent: agentName,
                  file,
                  error: "no_extractor",
                  modified: stat.mtime.toISOString()
                });
              }
            } catch (e) {
              summaries.push({
                agent: agentName,
                file,
                error: e.message,
                modified: null
              });
            }
          }
        } catch (e) {
          summaries.push({
            agent: agentName,
            pattern,
            error: e.message,
            modified: null
          });
        }
      }
    }

    return summaries;
  }

  loadSelfReports() {
    const reports = [];
    const busDir = path.join(process.cwd(), 'bus');
    
    const reportDirs = [
      { type: 'onetime', dir: path.join(busDir, 'onetime') },
      { type: 'daily', dir: path.join(busDir, 'daily') },
      { type: 'session', dir: path.join(busDir, 'sessions') }
    ];
    
    for (const { type, dir } of reportDirs) {
      if (!fs.existsSync(dir)) continue;
      
      if (type === 'daily' || type === 'session') {
        for (const agentDir of fs.readdirSync(dir).filter(f => !f.startsWith('.'))) {
          const agentPath = path.join(dir, agentDir);
          if (!fs.statSync(agentPath).isDirectory()) continue;
          
          for (const file of fs.readdirSync(agentPath).filter(f => f.endsWith('.json'))) {
            try {
              const content = fs.readFileSync(path.join(agentPath, file), 'utf8');
              const data = JSON.parse(content);
              reports.push({
                agent: agentDir,
                file: path.join(agentPath, file),
                modified: data.timestamp || fs.statSync(path.join(agentPath, file)).mtime.toISOString(),
                summary: data,
                reportType: type
              });
            } catch (e) {
              console.warn(`[WIKI] Failed to parse self-report: ${path.join(agentPath, file)}: ${e.message}`);
            }
          }
        }
      } else {
        for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
          try {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const data = JSON.parse(content);
            const agentName = path.basename(file, '.json');
            reports.push({
              agent: agentName,
              file: path.join(dir, file),
              modified: data.timestamp || fs.statSync(path.join(dir, file)).mtime.toISOString(),
              summary: data,
              reportType: type
            });
          } catch (e) {
            console.warn(`[WIKI] Failed to parse self-report: ${path.join(dir, file)}: ${e.message}`);
          }
        }
      }
    }
    
    return reports;
  }

  extractProjects(summaries) {
    const projects = new Map();

    for (const s of summaries) {
      if (!s.summary) continue;
      const paths = [];

      if (s.summary.injectedPaths) {
        paths.push(...(Array.isArray(s.summary.injectedPaths) ? s.summary.injectedPaths : [s.summary.injectedPaths]));
      }
      if (s.summary.recentProjects) {
        paths.push(...(Array.isArray(s.summary.recentProjects) ? s.summary.recentProjects : [s.summary.recentProjects]));
      }
      if (s.summary.bots) {
        for (const bot of Object.values(s.summary.bots)) {
          if (bot.workspacePath) paths.push(bot.workspacePath);
        }
      }
      if (s.summary.projectPaths) {
        paths.push(...(Array.isArray(s.summary.projectPaths) ? s.summary.projectPaths : [s.summary.projectPaths]));
      }
      if (s.summary.directory) {
        paths.push(s.summary.directory);
      }
      if (s.reportType === 'onetime' && s.summary.projects) {
        for (const p of s.summary.projects) {
          if (p.path) paths.push(p.path);
        }
      }
      if (s.reportType === 'daily') {
        if (s.summary.today?.activeProject) paths.push(s.summary.today.activeProject);
        if (s.summary.yesterday?.projectsWorked) {
          paths.push(...(Array.isArray(s.summary.yesterday.projectsWorked) ? s.summary.yesterday.projectsWorked : [s.summary.yesterday.projectsWorked]));
        }
      }
      if (s.reportType === 'session' && s.summary.workingDirectory) {
        paths.push(s.summary.workingDirectory);
      }

      const content = JSON.stringify(s.summary || {});
      const rawMatches = extractPathsFromText(content);
      for (const raw of rawMatches) {
        const normalized = normalizeProjectPath(raw);
        if (normalized) paths.push(normalized);
      }

      for (const p of paths) {
        const normalized = normalizeProjectPath(p);
        if (!normalized || normalized.length < 3) continue;
        if (!projects.has(normalized)) {
          projects.set(normalized, {
            path: normalized,
            agents: new Set(),
            summaries: [],
            lastSeen: null,
            agentMarkers: []
          });
        }
        const proj = projects.get(normalized);
        proj.agents.add(s.agent);
        proj.summaries.push(s);
        if (!proj.lastSeen || new Date(s.modified) > new Date(proj.lastSeen)) {
          proj.lastSeen = s.modified;
        }
      }
    }

    for (const [projectPath, project] of projects) {
      const markers = this.scanProjectAgentMarkers(projectPath);
      project.agentMarkers = markers;
      for (const agent of markers) {
        project.agents.add(agent);
      }
    }

    const recentProjects = new Map();
    const cutoff = new Date(Date.now() - RECENT_THRESHOLD_MS);
    for (const [path, project] of projects) {
      const recentSummaries = project.summaries.filter(s => s.modified && new Date(s.modified) > cutoff);
      if (recentSummaries.length > 0 || project.agentMarkers.length > 0) {
        recentProjects.set(path, project);
      }
    }

    return recentProjects;
  }

  scanProjectAgentMarkers(projectPath) {
    const markers = [];
    try {
      if (!fs.existsSync(projectPath)) return markers;
      
      const entries = fs.readdirSync(projectPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('.')) {
          for (const [agent, agentMarkers] of Object.entries(AGENT_MARKERS)) {
            if (agentMarkers.includes(entry.name)) {
              markers.push(agent);
            }
          }
        }
      }
    } catch (e) {
      markers.push('_scan_error');
    }
    return markers;
  }

  buildOntology(summaries, projects) {
    const ontology = {
      timestamp: new Date().toISOString(),
      agents: {},
      projects: {}
    };

    const agentSummaries = new Map();
    for (const s of summaries) {
      if (!agentSummaries.has(s.agent)) agentSummaries.set(s.agent, []);
      agentSummaries.get(s.agent).push(s);
    }

    for (const [agentName, agentSummaryList] of agentSummaries) {
      const cutoff = new Date(Date.now() - RECENT_THRESHOLD_MS);
      const recentAgentSummaries = agentSummaryList.filter(s => s.modified && new Date(s.modified) > cutoff);
      const latest = recentAgentSummaries.sort((a, b) => new Date(b.modified) - new Date(a.modified))[0];
      
      const allProjectPaths = new Set();
      for (const s of agentSummaryList) {
        if (s.summary?.injectedPaths) {
          const paths = Array.isArray(s.summary.injectedPaths) ? s.summary.injectedPaths : [s.summary.injectedPaths];
          paths.forEach(p => { if (p && p.length >= 3) allProjectPaths.add(p); });
        }
        if (s.summary?.recentProjects) {
          const paths = Array.isArray(s.summary.recentProjects) ? s.summary.recentProjects : [s.summary.recentProjects];
          paths.forEach(p => { if (p && p.length >= 3) allProjectPaths.add(p); });
        }
        if (s.summary?.bots) {
          for (const bot of Object.values(s.summary.bots)) {
            if (bot.workspacePath) allProjectPaths.add(bot.workspacePath);
          }
        }
        if (s.summary?.projectPaths) {
          const paths = Array.isArray(s.summary.projectPaths) ? s.summary.projectPaths : [s.summary.projectPaths];
          paths.forEach(p => { if (p && p.length >= 3) allProjectPaths.add(p); });
        }
      }
      
      ontology.agents[agentName] = {
        name: agentName,
        type: (this.discoveredConfigs && this.discoveredConfigs[agentName]?.type) || "unknown",
        lastActivity: latest?.modified || null,
        memoryFileCount: agentSummaryList.length,
        summary: latest?.summary || {},
        projectPaths: Array.from(allProjectPaths),
        verifiedLocally: this.discoveredConfigs && this.discoveredConfigs[agentName]?.verifiedLocally || false
      };
    }

    for (const [projectPath, project] of projects) {
      ontology.projects[projectPath] = {
        path: projectPath,
        agents: Array.from(project.agents),
        lastSeen: project.lastSeen,
        agentMarkers: project.agentMarkers || [],
        summary: this.summarizeProject(projectPath, project)
      };
    }

    return ontology;
  }

  summarizeProject(projectPath, project) {
    const cutoff = new Date(Date.now() - RECENT_THRESHOLD_MS);
    const recent = project.summaries
      .filter(s => s.modified && new Date(s.modified) > cutoff)
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));

    const agentFreq = new Map();
    for (const s of recent) {
      agentFreq.set(s.agent, (agentFreq.get(s.agent) || 0) + 1);
    }

    const progressNotes = [];
    for (const s of recent.slice(0, 5)) {
      progressNotes.push({
        agent: s.agent,
        time: s.modified,
        frequency: agentFreq.get(s.agent) || 1,
        summary: s.summary
      });
    }

    const projectName = path.basename(projectPath);
    const context = this.inferProjectContext(projectPath, project.summaries);
    
    return {
      name: projectName,
      context: context,
      recentActivity: recent.length,
      lastActivity: recent[0]?.modified || null,
      progressNotes
    };
  }

  inferProjectContext(projectPath, summaries) {
    const pathLower = projectPath.toLowerCase();
    
    if (pathLower.includes('powersale')) {
      return '电力交易/售电业务系统';
    }
    if (pathLower.includes('fintech')) {
      return '金融科技项目';
    }
    if (pathLower.includes('chat4')) {
      return '聊天/对话系统项目';
    }
    if (pathLower.includes('market-repo')) {
      return '市场数据/交易项目';
    }
    if (pathLower.includes('socience')) {
      return '科学研究/AI项目';
    }
    if (pathLower.includes('ssci')) {
      return '学术/SSCI技能项目';
    }
    if (pathLower.includes('failurelogic')) {
      return '失败逻辑/故障分析项目';
    }
    if (pathLower.includes('aesthetic')) {
      return '美学/设计项目';
    }
    
    return '项目';
  }

  computeDelta(ontology) {
    const delta = {
      newProjects: [],
      updatedProjects: [],
      newAgents: [],
      updatedAgents: []
    };

    for (const [projPath, proj] of Object.entries(ontology.projects)) {
      const prev = this.state.projects[projPath];
      if (!prev) {
        delta.newProjects.push(projPath);
      } else if (proj.lastSeen !== prev.lastSeen) {
        delta.updatedProjects.push(projPath);
      }
    }

    for (const [agentName, agent] of Object.entries(ontology.agents)) {
      const prev = this.state.agents[agentName];
      if (!prev) {
        delta.newAgents.push(agentName);
      } else if (agent.lastActivity !== prev.lastActivity) {
        delta.updatedAgents.push(agentName);
      }
    }

    return delta;
  }

  async run() {
    console.log("[STIGMERGY] Ontology-based wiki scan...\n");

    const discoveredHomes = autoDiscoverAgentHomes();
    console.log(`[STIGMERGY] Discovered ${discoveredHomes.size} agent homes`);
    this.discoveredConfigs = autoBuildAgentConfigs(discoveredHomes);
    console.log(`[STIGMERGY] Built configs for ${Object.keys(this.discoveredConfigs).length} agents`);

    const summaries = [];
    for (const [agentName, config] of Object.entries(this.discoveredConfigs)) {
      const agentSummaries = await this.scanAgentMemory(agentName, config);
      summaries.push(...agentSummaries);
      console.log(`[STIGMERGY] ${agentName}: ${agentSummaries.length} memory files`);
    }

    const selfReports = this.loadSelfReports();
    summaries.push(...selfReports);
    console.log(`[STIGMERGY] Self-reports: ${selfReports.length}`);

    const projects = this.extractProjects(summaries);
    const ontology = this.buildOntology(summaries, projects);
    const delta = this.computeDelta(ontology);

    this.state.lastRun = new Date().toISOString();
    this.state.agents = ontology.agents;
    this.state.projects = ontology.projects;
    this.state.evidence = summaries;
    this.saveState();

    this.writeWiki(ontology);

    console.log("\n[STIGMERGY] Delta:");
    console.log(`  New projects: ${delta.newProjects.length}`);
    console.log(`  Updated projects: ${delta.updatedProjects.length}`);
    console.log(`  New agents: ${delta.newAgents.length}`);
    console.log(`  Updated agents: ${delta.updatedAgents.length}`);

    console.log("\n[STIGMERGY] Project Summary:");
    for (const [path, proj] of Object.entries(ontology.projects)) {
      console.log(`\n${path}`);
      console.log(`  Agents: ${proj.agents.join(", ")}`);
      console.log(`  Last seen: ${proj.lastSeen}`);
      console.log(`  Recent activity: ${proj.summary.recentActivity} events`);
      if (proj.summary.progressNotes.length > 0) {
        console.log(`  Latest: ${proj.summary.progressNotes[0].agent} @ ${proj.summary.progressNotes[0].time}`);
      }
    }

    return ontology;
  }

  writeWiki(ontology) {
    const wikiPath = path.join(WIKI_DIR, "latest.json");
    fs.writeFileSync(wikiPath, JSON.stringify(ontology, null, 2));
    console.log("\n[STIGMERGY] Wiki written to:", wikiPath);
  }
}

if (require.main === module) {
  const wiki = new StigmergyWiki();
  wiki.run().catch(console.error);
}

module.exports = StigmergyWiki;
