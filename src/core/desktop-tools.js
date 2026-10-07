// 桌面型 AI Agent 注册表（下载链接唯一事实来源）
// - 此文件为桌面应用的下载链接/安装检测/版本核查的单一来源，CLI 工具见 cli_tools.js
// - 所有链接均于 2026-09-25 联网实测确认（仅收录官方域名；仿冒站不入库）
// - 链接核查：node scripts/check-desktop-versions.js
// - 桌面应用无 CLI 版本命令，localDirs 任一目录存在即视为已安装
const path = require('path');
const os = require('os');
const fs = require('fs');

const DESKTOP_TOOLS = {
  workbuddy: {
    name: 'WorkBuddy Desktop (腾讯 AI 办公工作台)',
    type: 'desktop',
    vendor: 'Tencent',
    description: 'AI 工作台桌面客户端，无独立 CLI',
    version: null, // 桌面应用无 CLI 版本命令
    autoInstall: false, // 需手动下载安装包
    installHint: '手动下载安装包；安装后可检测 ~/.workbuddy，技能目录 ~/.workbuddy/skills (skill-md)',
    installUrl: 'https://www.workbuddy.ai/',
    downloadUrls: {
      official: 'https://www.workbuddy.ai/',
      tencentCloud: 'https://cloud.tencent.com/product/workbuddy',
      microsoftStore: 'https://apps.microsoft.com/detail/xpfg2p1xdmx1x0',
    },
    localDirs: [path.join(os.homedir(), '.workbuddy')],
    skillsDir: path.join(os.homedir(), '.workbuddy', 'skills'),
    skillsFormat: 'skill-md',
    versionCheck: { url: 'https://www.workbuddy.ai/', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://www.workbuddy.ai/', 'https://cloud.tencent.com/product/workbuddy'],
  },
  qwenwork: {
    name: 'QwenWork (通义千问工作台)',
    type: 'desktop',
    vendor: 'Alibaba',
    description: '通义千问桌面工作台 (macOS 14+ / Windows 10+ 64 位 / HarmonyOS 6.1+)',
    version: null,
    autoInstall: false,
    installHint: '手动下载安装包；安装后可检测 ~/.qwenworkcn',
    installUrl: 'https://qwenwork.cn/download',
    downloadUrls: {
      official: 'https://qwenwork.cn/download',
      microsoftStore: 'https://apps.microsoft.com/detail/xp8bth6x2ptmtw',
    },
    localDirs: [path.join(os.homedir(), '.qwenworkcn')],
    skillsDir: null, // 待核验 qwenwork 技能目录约定
    skillsFormat: null,
    versionCheck: { url: 'https://qwenwork.cn/download', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://qwenwork.cn/'],
  },
  traework: {
    name: 'TraeWork (字节 AI IDE 工作台)',
    type: 'desktop',
    vendor: 'ByteDance',
    description: 'Trae 生态桌面工作台；无独立官网，走 Trae 下载中心',
    version: null,
    autoInstall: false,
    installHint: '从 Trae 下载中心下载；本机未安装，localDirs 为推测候选目录（~/.trae 是 Trae IDE 本体，非 TraeWork，不入检测）',
    installUrl: 'https://www.trae.ai/download',
    downloadUrls: {
      official: 'https://www.trae.ai/download',
    },
    localDirs: [
      path.join(os.homedir(), '.traework'),
    ],
    skillsDir: null, // 待 TraeWork 安装后实测
    skillsFormat: null,
    versionCheck: { url: 'https://www.trae.ai/download', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://www.trae.ai/download', 'https://docs.trae.ai/ide/what-is-trae'],
  },
  qoderwork: {
    name: 'QoderWork (阿里桌面智能助手)',
    type: 'desktop',
    vendor: 'Alibaba',
    description: 'Qoder 桌面智能助手 (MacOS 14+ / Windows 10+，官方下载页显示均已提供)',
    version: null,
    autoInstall: false,
    installHint: '官方入口 qoder.com/qoderwork；本机未安装，localDirs 为推测候选目录',
    installUrl: 'https://qoder.com/qoderwork',
    downloadUrls: {
      official: 'https://qoder.com/download?product=qoderwork',
      cn: 'https://qoder.com.cn/qoderwork',
    },
    localDirs: [path.join(os.homedir(), '.qoderwork')],
    skillsDir: null,
    skillsFormat: null,
    versionCheck: { url: 'https://qoder.com/download?product=qoderwork', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://qoder.com/qoderwork', 'https://qoder.com/download?product=qoderwork'],
  },
  doubao: {
    name: '豆包桌面版 (字节)',
    type: 'desktop',
    vendor: 'ByteDance',
    description: '豆包 AI 桌面客户端 (Windows)',
    version: null,
    autoInstall: false,
    installHint: '手动下载安装包；安装后可检测 ~/Doubao（无点前缀目录）',
    installUrl: 'https://www.doubao.com/download/desktop?ug_utm_source=101',
    downloadUrls: {
      official: 'https://www.doubao.com/download/desktop?ug_utm_source=101',
      microsoftStore: 'https://apps.microsoft.com/detail/xp99jw18tlbk06',
    },
    localDirs: [path.join(os.homedir(), 'Doubao')],
    skillsDir: path.join(os.homedir(), 'doubao', 'skills'),
    skillsFormat: 'skill-md',
    versionCheck: { url: 'https://www.doubao.com/download/desktop', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://www.doubao.com/download/desktop?ug_utm_source=101'],
  },
  kimiwork: {
    name: 'Kimi Work (月之暗面)',
    type: 'desktop',
    vendor: 'Moonshot AI',
    description: 'Kimi 工作台 (Windows / Mac Apple silicon)；同时提供 Kimi CLI (kimi.exe)',
    version: null,
    autoInstall: false,
    installHint: '手动下载安装包；检测目录以 ~/.kimi-code (CLI) 为近似信号，桌面目录待核',
    installUrl: 'https://www.kimi.com/en/products/kimi-work',
    downloadUrls: {
      official: 'https://www.kimi.com/en/products/kimi-work',
    },
    localDirs: [path.join(os.homedir(), '.kimi-code')],
    skillsDir: null,
    skillsFormat: null,
    versionCheck: { url: 'https://www.kimi.com/en/products/kimi-work', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://www.kimi.com/en/products/kimi-work'],
  },
  marvis: {
    name: 'Marvis 马维斯 (腾讯操作系统层 AI 助手)',
    type: 'desktop',
    vendor: 'Tencent',
    description: '操作系统层级 AI 助手 (deepseek v4 + 混元)',
    version: null,
    autoInstall: false,
    installHint: '手动下载安装包；安装后可检测 ~/.marvis',
    installUrl: 'https://marvis.qq.com/',
    downloadUrls: {
      official: 'https://marvis.qq.com/',
      microsoftStore: 'https://apps.microsoft.com/detail/xpfg6f84mb6qsg',
    },
    localDirs: [path.join(os.homedir(), '.marvis')],
    skillsDir: path.join(os.homedir(), '.marvis', 'skills'),
    skillsFormat: 'skill-md',
    versionCheck: { url: 'https://marvis.qq.com/', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://marvis.qq.com/'],
  },
  'deepseek-harness-desktop': {
    name: 'DeepSeek Harness Desktop (DeepSeek AI 操作员)',
    type: 'desktop',
    vendor: 'DeepSeek AI',
    description: 'DeepSeek Harness 桌面版 (Electron)；AI 操作员自动化工作台，独立于 CLI (dsh) 的桌面应用 (apps/desktop)',
    version: null,
    autoInstall: false,
    installHint: '手动安装；官方仓库提供 Windows x64 unsigned 测试包构建命令 (pnpm run package:desktop:win:x64:unsigned)，无正式分发直链；检测目录 ~/.dsh 官方验证 (config-catalog)；主入口 npx @deepseek-ai/dsh web (127.0.0.1:3080)',
    installUrl: 'https://github.com/deepseek-ai/deepseek-harness',
    downloadUrls: {
      official: 'https://github.com/deepseek-ai/deepseek-harness',
    },
    localDirs: [path.join(os.homedir(), '.dsh')],
    skillsDir: null,
    skillsFormat: null,
    versionCheck: { url: 'https://github.com/deepseek-ai/deepseek-harness', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: [
      'https://github.com/deepseek-ai/deepseek-harness',
      'https://deepseek-harness.github.io/deepseek-harness/reference/config-catalog',
    ],
  },
  'codex-desktop': {
    name: 'Codex Desktop (OpenAI Codex 桌面版)',
    type: 'desktop',
    vendor: 'OpenAI',
    description: 'OpenAI Codex 桌面版；2026-07-09 起并入 ChatGPT 桌面应用 (Windows/Mac)',
    version: null,
    autoInstall: false,
    installHint: '手动下载安装包 (ChatGPT 桌面应用, 2026-07-09 并入)；Windows 官方命令安装: winget install --id 9PLM9XGG6VKS -s msstore (learn.chatgpt.com 官方文档)；检测目录以 ~/.codex (CLI 配置) 为近似信号，桌面数据目录待核',
    installUrl: 'https://chatgpt.com/download',
    downloadUrls: {
      official: 'https://chatgpt.com/download',
      codexApp: 'https://developers.openai.com/codex/app',
      microsoftStore: 'https://apps.microsoft.com/detail/9plm9xgg6vks',
    },
    localDirs: [path.join(os.homedir(), '.codex')],
    skillsDir: path.join(os.homedir(), '.codex', 'skills'),
    skillsFormat: 'skill-md',
    versionCheck: { url: 'https://chatgpt.com/download', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: [
      'https://chatgpt.com/download',
      'https://developers.openai.com/codex/app',
      'https://apps.microsoft.com/detail/9plm9xgg6vks',
    ],
  },
  openwork: {
    name: 'OpenWork (Open-source Claude Cowork alternative)',
    type: 'desktop',
    vendor: 'OpenWork Labs / Y Combinator',
    description: 'Free, open-source desktop app for macOS, Windows, and Linux. Built on OpenCode. Chat on files, use skills, schedule tasks, automate browser, MCP gateway.',
    version: null,
    autoInstall: false,
    installHint: 'Download from openworklabs.com or brew install --cask openwork (macOS). Built on OpenCode; skills and MCP servers carry over from OpenCode/Claude Cowork.',
    installUrl: 'https://openworklabs.com/',
    downloadUrls: {
      official: 'https://openworklabs.com/download',
      github: 'https://github.com/different-ai/openwork/releases',
      homebrew: 'brew install --cask openwork',
    },
    localDirs: [
      path.join(os.homedir(), '.openwork'),
      path.join(os.homedir(), '.config', 'openwork'),
    ],
    skillsDir: path.join(os.homedir(), '.opencode', 'skills'),
    skillsFormat: 'skill-md',
    versionCheck: { url: 'https://openworklabs.com/', pattern: null, type: 'page' },
    checkedAt: '2026-10-07',
    sources: [
      'https://openworklabs.com/',
      'https://github.com/different-ai/openwork',
      'https://openworklabs.com/.well-known/agent-skills/install-openwork/SKILL.md',
    ],
  },
  claudework: {
    name: 'Claude Desktop (Anthropic)',
    type: 'desktop',
    vendor: 'Anthropic',
    description: 'Claude Desktop app for macOS, Windows, Linux. Includes Chat, Claude Cowork (non-coding knowledge work), and Claude Code (agentic coding). Not a separate agent — this is the unified Claude Desktop.',
    version: null,
    autoInstall: false,
    installHint: 'Download from claude.com/download. Claude Cowork is a mode within Claude Desktop, not a separate product. Skills are managed via .mcpb extensions and project-level CLAUDE.md files.',
    installUrl: 'https://claude.com/download',
    downloadUrls: {
      official: 'https://claude.com/download',
      microsoftStore: 'https://apps.microsoft.com/detail/9nblg1mz3xqx',
    },
    localDirs: [
      path.join(os.homedir(), '.config', 'Claude'),
      path.join(os.homedir(), 'Library', 'Application Support', 'Claude'),
    ],
    skillsDir: null,
    skillsFormat: null,
    versionCheck: { url: 'https://claude.com/download', pattern: null, type: 'page' },
    checkedAt: '2026-10-07',
    sources: [
      'https://claude.com/download',
      'https://claude.com/product/cowork',
      'https://www.anthropic.com/engineering/desktop-extensions',
    ],
  },
  muse: {
    name: 'Muse Desktop (Meta AI personal agent)',
    type: 'desktop',
    vendor: 'Meta',
    description: 'Meta\'s personal AI agent desktop app (Mac). Organizes files, fills out forms, pulls from Messages/Calendar/Notes. Windows support not yet available.',
    version: null,
    autoInstall: false,
    installHint: 'Download from ai.meta.com/muse/download (Mac) or App Store (mobile). Skills directory is ~/.muse/skills (skill-md format).',
    installUrl: 'https://ai.meta.com/muse/',
    downloadUrls: {
      official: 'https://ai.meta.com/muse/download',
      appStore: 'https://apps.apple.com/app/muse/id...',
    },
    localDirs: [
      path.join(os.homedir(), 'Library', 'Application Support', 'Muse'),
      path.join(os.homedir(), '.muse'),
    ],
    skillsDir: path.join(os.homedir(), '.muse', 'skills'),
    skillsFormat: 'skill-md',
    versionCheck: { url: 'https://ai.meta.com/muse/', pattern: null, type: 'page' },
    checkedAt: '2026-10-07',
    sources: [
      'https://ai.meta.com/muse/',
      'https://www.theverge.com/tech/997332/metas-muse-ai-agent-now-has-a-mac-app',
    ],
  },
  'coze-desktop': {
    name: 'Coze Desktop (扣子 Coze 桌面客户端)',
    type: 'desktop',
    vendor: 'ByteDance',
    description: '扣子 Coze 桌面端 (macOS/Windows)；安装后仍需额外安装 @coze/cli 方能 CLI 协同',
    version: null,
    autoInstall: false,
    installHint: '手动下载安装包 (coze.cn 首页「下载桌面端」)；安装后仍需安装 @coze/cli (npm install -g @coze/cli)；检测目录以 ~/.coze (CLI 配置) 为近似信号，桌面数据目录待核',
    installUrl: 'https://www.coze.cn/',
    downloadUrls: {
      official: 'https://www.coze.cn/',
    },
    localDirs: [path.join(os.homedir(), '.coze')],
    skillsDir: null,
    skillsFormat: null,
    versionCheck: { url: 'https://www.coze.cn/', pattern: null, type: 'page' },
    checkedAt: '2026-09-25',
    sources: ['https://www.coze.cn/'],
  },
};

/**
 * 展开 localDirs 中的 ~ 为用户主目录，返回绝对路径数组
 * @param {string} toolName - 工具标识
 * @returns {string[]} 绝对路径数组（条目不存在时返回空数组）
 */
function resolveLocalDirs(toolName) {
  const tool = DESKTOP_TOOLS[toolName];
  if (!tool || !tool.localDirs) {
    return [];
  }
  return tool.localDirs.map((dir) =>
    dir.startsWith('~') ? path.join(os.homedir(), dir.slice(1)) : dir,
  );
}

/**
 * 判定桌面工具是否已安装（任一 localDir 存在即视为已安装）
 * @param {string} toolName - 工具标识
 * @returns {boolean} 是否已安装
 */
function isDesktopInstalled(toolName) {
  return resolveLocalDirs(toolName).some((dir) => fs.existsSync(dir));
}

/**
 * 获取全部桌面工具标识列表
 * @returns {string[]} 工具标识数组
 */
function getDesktopToolIds() {
  return Object.keys(DESKTOP_TOOLS);
}

module.exports = {
  DESKTOP_TOOLS,
  resolveLocalDirs,
  isDesktopInstalled,
  getDesktopToolIds,
};