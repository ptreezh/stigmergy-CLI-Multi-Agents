const { normalize } = require("./signatures");
const { getSignatures } = require("./signatures");

const AI_TOKENS = [
  "ai", "llm", "gpt", "chat", "bot", "agent", "codex", "claude", "copilot",
  "cursor", "cursor", "qoder", "trae", "kiro", "antigravity", "warp",
  "doubao", "kimi", "qwen", "coze", "minimax", "skywork", "deepseek",
  "gemini", "opencode", "openclaw", "stigmergy", "ollama", "roo",
  "cline", "goose", "crush", "letta", "openwork", "claudework", "muse",
  "codebuddy", "workbuddy", "mario", "miora", "opendesign", "memu",
  "chatgpt", "gemini", "aipy", "pinokio", "zed", "trae", "antigravity",
  "maestro", "openc", "devin", "replit", "sourcegraph", "tabnine",
  "phind", "codeium", "factory", "augment", "marvis", "tavily",
  "langchain", "llamacpp", "lmstudio", "jan", "anythingllm",
];

const OWNERS = new Set();

function collectOwnedProcessNames() {
  if (OWNERS.size > 0) return OWNERS;
  for (const sig of getSignatures()) {
    for (const p of sig.processes || []) OWNERS.add(normalize(p));
    for (const a of sig.aliases) OWNERS.add(normalize(a));
  }
  OWNERS.add(normalize("claude"));
  return OWNERS;
}

const NOISE = [
  "updater", "uninstall", "crashpad", "renderer", "gpu", "webview",
  "chrome", "edge", "firefox", "system", "service", "host", "helper",
  "tray", "update", "setup", "install", "temp", "tmp", "cache",
  "ext", "extension", "sdk", "runtime", "framework", "driver",
];

const AI_SIGNAL = [
  "ai", "llm", "gpt", "chat", "agent", "copilot", "claude", "codex",
  "cursor", "qoder", "trae", "kiro", "doubao", "kimi", "qwen", "coze",
  "gemini", "opencode", "openclaw", "ollama", "minimax", "skywork",
  "deepseek", "mcp", "rag", "assistant", "bot", "code", "coder",
];

const STRONG_SIGNAL = [
  "llm", "gpt", "copilot", "claude", "codex", "qoder", "doubao", "kimi",
  "qwen", "coze", "gemini", "opencode", "openclaw", "deepseek", "mcp",
  "chatgpt", "minimax", "skywork", "cursor", "kiro", "trae", "ollama",
  "assistant",
];

const IDENTITY_NOISE = [
  "nvidia", "nvcontainer", "nvdisplay", "mailmaster", "lsaiso", "sangfor",
  "aTrust", "cortex", "citrix", "vmware", "oracle", "java", "eclipse",
  "unity", "unreal", "adobe", "autodesk", "siemens", "barcode",
];

function splitTokens(name) {
  return String(name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function reasonFor(name) {
  const tokens = splitTokens(name);
  const lower = String(name || "").toLowerCase();
  const strong = tokens.filter((t) => STRONG_SIGNAL.includes(t));
  const weak = tokens.filter((t) => t === "ai" || t === "agent" || t === "bot" || t === "chat" || t === "rag");
  if (strong.length) return `name token(s): ${strong.join(", ")}`;
  if (weak.length && strong.length === 0 && STRONG_SIGNAL.some((t) => lower.includes(t))) {
    return `weak token(s): ${weak.join(", ")}`;
  }
  return "heuristic candidate";
}

function looksLikeAi(name) {
  const n = normalize(name);
  if (!n || n.length < 3) return false;
  const lower = String(name || "").toLowerCase();
  if (IDENTITY_NOISE.some((t) => lower.includes(t.toLowerCase()))) return false;
  if (NOISE.some((t) => n.includes(t))) return false;

  const tokens = splitTokens(name);
  if (tokens.some((t) => STRONG_SIGNAL.includes(t))) return true;

  if (tokens.some((t) => t === "ai")) {
    const hasAIModifier = tokens.some((t) =>
      ["agent", "assistant", "bot", "chat", "code", "coder", "studio", "app", "ide", "dev", "desk", "work", "hub", "llm"].includes(t)
    );
    return hasAIModifier;
  }

  return false;
}

function isAiName(name) {
  return looksLikeAi(name);
}

const AI_MARKERS = {
  owned: collectOwnedProcessNames(),
  reasonFor,
};

module.exports = {
  AI_TOKENS,
  AI_SIGNAL,
  STRONG_SIGNAL,
  IDENTITY_NOISE,
  NOISE,
  AI_MARKERS,
  looksLikeAi,
  isAiName,
  reasonFor,
  splitTokens,
  collectOwnedProcessNames,
};