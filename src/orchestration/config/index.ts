import path from 'path';
import os from 'os';

// 协调目录配置
export const COORDINATION_DIR = '.stigmergy/coordination';

// 文件路径配置
export const FILE_PATHS = {
  taskRegistry: path.join(COORDINATION_DIR, 'task-registry.json'),
  stateLocks: path.join(COORDINATION_DIR, 'state-locks.json'),
  sharedContext: path.join(COORDINATION_DIR, 'shared-context.json'),
  eventLog: path.join(COORDINATION_DIR, 'event-log.json'),
  worktreeRegistry: path.join(COORDINATION_DIR, 'worktree-registry.json'),
  terminalSessions: path.join(COORDINATION_DIR, 'terminal-sessions.json'),
  history: path.join(COORDINATION_DIR, 'history')
};

// CLI Hook 目录配置
export const CLI_HOOKS_DIR = {
  claude: path.join(os.homedir(), '.claude', '.stigmergy', 'hooks'),
  gemini: path.join(os.homedir(), '.gemini', '.stigmergy', 'hooks'),
  iflow: path.join(os.homedir(), '.iflow', '.stigmergy', 'hooks'),
  opencode: path.join(os.homedir(), '.opencode', '.stigmergy', 'hooks'),
  qwen: path.join(os.homedir(), '.qwen', '.stigmergy', 'hooks'),
  codebuddy: path.join(os.homedir(), '.codebuddy', '.stigmergy', 'hooks'),
  copilot: path.join(os.homedir(), '.copilot', '.stigmergy', 'hooks'),
  codex: path.join(os.homedir(), '.codex', '.stigmergy', 'hooks')
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  maxConcurrency: 8,
  maxWorktrees: 16,
  taskTimeout: 30 * 60 * 1000, // 30 分钟
  lockTimeout: 5 * 60 * 1000,   // 5 分钟
  terminalStartupTimeout: 5 * 1000, // 5 秒
  worktreeCreationTimeout: 10 * 1000, // 10 秒
  eventLogRetention: 7 * 24 * 60 * 60 * 1000 // 7 天
};

// CLI 参数映射
export const CLI_PARAM_MAPPINGS: Record<string, {
  agent: (agent: string) => string;
  skills: (skills: string[]) => string;
  mcp: (tools: string[]) => string;
  cwd: (cwd: string) => string;
  autoMode: () => string; // 自动模式参数
}> = {
  claude: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` Bash("stigmergy skill read ${skills[0]}")`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-claude.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --permission-mode bypassPermissions --print` // Claude 使用绕过权限模式 + 打印模式
  },
  gemini: {
    agent: (agent: string) => ` --model ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-gemini.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --approval-mode auto-edit` // Gemini 使用自动批准编辑模式
  },
  qwen: {
    agent: (agent: string) => ` --model ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-qwen.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --approval-mode yolo` // Qwen 使用 YOLO 模式（完全自动）
  },
  iflow: {
    agent: (agent: string) => ` -p "请使用${agent}智能体"`,
    skills: (skills: string[]) => ` -p "请使用${skills.join('、')}技能"`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-iflow.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --yolo` // iFlow 使用 YOLO 模式
  },
  codebuddy: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-codebuddy.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --yolo` // CodeBuddy 使用 YOLO 模式
  },
  copilot: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-copilot.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --yolo` // Copilot 使用 YOLO 模式
  },
  codex: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-codex.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` --yolo` // Codex 使用 YOLO 模式
  },
  opencode: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-opencode.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`,
    autoMode: () => ` run` // OpenCode 使用 run 命令（YOLO 模式）
  }
};

// CLI 能力矩阵
export const CLI_CAPABILITY_MATRIX: Record<string, {
  strengths: string[];
  weaknesses: string[];
  model: string;
  cost: 'low' | 'medium' | 'high';
  quality: 'low' | 'medium' | 'high';
}> = {
  claude: {
    strengths: ['code-generation', 'code-review', 'debugging', 'architecture'],
    weaknesses: ['frontend-ui', 'creative-writing'],
    model: 'claude-3-5-sonnet',
    cost: 'high',
    quality: 'high'
  },
  gemini: {
    strengths: ['frontend-ui', 'creative-writing', 'multimodal'],
    weaknesses: ['backend-logic', 'database-design'],
    model: 'gemini-2.0-flash',
    cost: 'low',
    quality: 'medium'
  },
  iflow: {
    strengths: ['chinese-docs', 'backend-logic', 'system-design'],
    weaknesses: ['frontend-ui', 'creative-writing'],
    model: 'qwen-2.5-72b',
    cost: 'low',
    quality: 'medium'
  },
  opencode: {
    strengths: ['code-generation', 'code-review', 'refactoring', 'testing'],
    weaknesses: ['creative-writing', 'multimodal'],
    model: 'claude-3-5-sonnet',
    cost: 'high',
    quality: 'high'
  }
};