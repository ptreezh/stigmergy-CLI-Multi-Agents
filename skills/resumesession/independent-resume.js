#!/usr/bin/env node

/**
 * ResumeSession - 跨 CLI 会话恢复工具
 * 
 * 此工具被 AI 助手（Claude、Gemini 等）调用，用于恢复和管理会话历史
 * 
 * 功能：
 * - 恢复当前项目目录的最新会话（不论会话是哪个 CLI 产生的）
 * - 显示当前项目目录相关的最近 N 个会话摘要列表
 * - 显示对应 CLI 关于本项目目录相关的会话列表
 * - 显示用户当前项目所有相关的会话列表
 * - 显示所有 CLI 所有项目的会话分类列表
 * 
 * 配置策略（优先级从高到低）：
 * 1. 工具自己的配置文件 (~/.resume-session/config.json)
 * 2. Stigmergy 配置（可选增强）
 * 3. 自动检测（扫描常见位置）
 * 4. 默认配置
 * 
 * 使用方式：
 *   node independent-resume.js              # 恢复当前项目最新会话
 *   node independent-resume.js 5            # 显示当前项目最近 5 个会话
 *   node independent-resume.js iflow        # 显示当前项目的 iFlow 会话
 *   node independent-resume.js iflow 3      # 显示当前项目最近 3 个 iFlow 会话
 *   node independent-resume.js --all        # 显示当前项目所有 CLI 的会话
 *   node independent-resume.js --complete   # 显示所有 CLI 所有项目的会话
 *   node independent-resume.js --help       # 显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 工具配置文件路径
const TOOL_CONFIG_PATH = path.join(os.homedir(), '.resume-session', 'config.json');

// 默认 CLI 配置（作为最后的后备）
const DEFAULT_CLI_CONFIG = {
  claude: {
    name: 'Claude',
    path: path.join(os.homedir(), '.claude', 'projects'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/projects[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  gemini: {
    name: 'Gemini',
    path: path.join(os.homedir(), '.config', 'gemini', 'tmp'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/tmp[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  qwen: {
    name: 'Qwen',
    path: path.join(os.homedir(), '.qwen', 'projects'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/projects[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  iflow: {
    name: 'iFlow',
    path: path.join(os.homedir(), '.iflow', 'projects'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/projects[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  codebuddy: {
    name: 'CodeBuddy',
    path: path.join(os.homedir(), '.codebuddy', 'projects'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/projects[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  codex: {
    name: 'Codex',
    path: path.join(os.homedir(), '.config', 'codex'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/codex[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  qodercli: {
    name: 'QoderCLI',
    path: path.join(os.homedir(), '.qoder', 'projects'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/projects[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  },
  kode: {
    name: 'Kode',
    path: path.join(os.homedir(), '.kode', 'projects'),
    sessionPattern: /.*\.json$/,
    extractProject: (filePath) => {
      const match = filePath.match(/projects[\\/]([^\\/]+)/);
      return match ? match[1] : null;
    },
    getSessionId: (filePath) => path.basename(filePath, '.json')
  }
};

// 常见 CLI 的候选路径配置（用于自动检测）
const CLI_CANDIDATES = {
  claude: {
    name: 'Claude',
    candidates: [
      path.join(os.homedir(), '.claude', 'projects'),
      path.join(os.homedir(), '.config', 'claude', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'claude', 'projects'),
    ]
  },
  gemini: {
    name: 'Gemini',
    candidates: [
      path.join(os.homedir(), '.config', 'gemini', 'tmp'),
      path.join(os.homedir(), '.gemini', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'gemini', 'tmp'),
    ]
  },
  qwen: {
    name: 'Qwen',
    candidates: [
      path.join(os.homedir(), '.qwen', 'projects'),
      path.join(os.homedir(), '.config', 'qwen', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'qwen', 'projects'),
    ]
  },
  iflow: {
    name: 'iFlow',
    candidates: [
      path.join(os.homedir(), '.iflow', 'projects'),
      path.join(os.homedir(), '.config', 'iflow', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'iflow', 'projects'),
    ]
  },
  codebuddy: {
    name: 'CodeBuddy',
    candidates: [
      path.join(os.homedir(), '.codebuddy', 'projects'),
      path.join(os.homedir(), '.config', 'codebuddy', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'codebuddy', 'projects'),
    ]
  },
  codex: {
    name: 'Codex',
    candidates: [
      path.join(os.homedir(), '.config', 'codex'),
      path.join(os.homedir(), '.codex', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'codex'),
    ]
  },
  qodercli: {
    name: 'QoderCLI',
    candidates: [
      path.join(os.homedir(), '.qoder', 'projects'),
      path.join(os.homedir(), '.config', 'qoder', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'qoder', 'projects'),
    ]
  },
  kode: {
    name: 'Kode',
    candidates: [
      path.join(os.homedir(), '.kode', 'projects'),
      path.join(os.homedir(), '.config', 'kode', 'projects'),
      path.join(os.homedir(), 'AppData', 'Roaming', 'kode', 'projects'),
    ]
  }
};

// 从工具配置文件读取配置
function getToolConfig() {
  try {
    if (fs.existsSync(TOOL_CONFIG_PATH)) {
      const content = fs.readFileSync(TOOL_CONFIG_PATH, 'utf8');
      const toolConfig = JSON.parse(content);
      
      if (toolConfig.cli_paths && Object.keys(toolConfig.cli_paths).length > 0) {
        return toolConfig.cli_paths;
      }
    }
  } catch (e) {
    // 忽略错误，使用默认配置
  }
  
  return null;
}

// 保存配置到工具配置文件
function saveToolConfig(cliConfig) {
  try {
    const configDir = path.dirname(TOOL_CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const config = {
      cli_paths: cliConfig,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(TOOL_CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (e) {
    // 忽略保存错误
  }
}

// 从 stigmergy 获取配置（可选增强）
function getStigmergyConfig() {
  const stigmergyConfigPath = path.join(os.homedir(), '.stigmergy', 'config.json');
  
  try {
    if (fs.existsSync(stigmergyConfigPath)) {
      const content = fs.readFileSync(stigmergyConfigPath, 'utf8');
      const stigmergyConfig = JSON.parse(content);
      
      if (stigmergyConfig.cli_paths && Object.keys(stigmergyConfig.cli_paths).length > 0) {
        return stigmergyConfig.cli_paths;
      }
    }
  } catch (e) {
    // 忽略错误
  }
  
  return null;
}

// 自动检测已安装的 CLI
function autoDetectCLIs() {
  const detectedCLIs = {};
  
  for (const [cliKey, cliDef] of Object.entries(CLI_CANDIDATES)) {
    // 尝试所有候选路径
    for (const candidatePath of cliDef.candidates) {
      if (fs.existsSync(candidatePath)) {
        // 找到第一个存在的路径
        detectedCLIs[cliKey] = {
          name: cliDef.name,
          path: candidatePath,
          sessionPattern: /.*\.json$/,
          extractProject: DEFAULT_CLI_CONFIG[cliKey].extractProject,
          getSessionId: DEFAULT_CLI_CONFIG[cliKey].getSessionId
        };
        break;
      }
    }
  }
  
  return detectedCLIs;
}

// 获取 CLI 配置（优先级：工具配置 > stigmergy > 自动检测 > 默认配置）
function getCLIConfig() {
  // 1. 优先使用工具自己的配置文件
  const toolConfig = getToolConfig();
  if (toolConfig && Object.keys(toolConfig).length > 0) {
    return toolConfig;
  }
  
  // 2. 尝试从 stigmergy 获取配置（可选增强）
  const stigmergyConfig = getStigmergyConfig();
  if (stigmergyConfig && Object.keys(stigmergyConfig).length > 0) {
    return stigmergyConfig;
  }
  
  // 3. 使用自动检测
  const detectedCLIs = autoDetectCLIs();
  if (Object.keys(detectedCLIs).length > 0) {
    // 保存检测到的配置
    saveToolConfig(detectedCLIs);
    return detectedCLIs;
  }
  
  // 4. 使用默认配置
  return DEFAULT_CLI_CONFIG;
}

// 获取当前工作目录的标准化路径
function getCurrentProjectPath() {
  const cwd = process.cwd();
  try {
    return fs.realpathSync(cwd);
  } catch (e) {
    return cwd;
  }
}

// 递归查找目录中的所有会话文件
function findSessionFiles(dir, pattern) {
  const sessions = [];
  
  if (!fs.existsSync(dir)) {
    return sessions;
  }
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        try {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            traverse(itemPath);
          } else if (pattern.test(item)) {
            sessions.push(itemPath);
          }
        } catch (e) {
          // 忽略无法访问的文件
        }
      }
    } catch (e) {
      // 忽略无法访问的目录
    }
  }
  
  traverse(dir);
  return sessions;
}

// 查找所有 CLI 的会话
function findAllSessions() {
  const allSessions = [];
  const cliConfig = getCLIConfig();
  
  for (const [cliKey, config] of Object.entries(cliConfig)) {
    try {
      const cliPath = config.path;
      const sessionFiles = findSessionFiles(cliPath, config.sessionPattern);
      
      for (const filePath of sessionFiles) {
        try {
          const stats = fs.statSync(filePath);
          const projectName = config.extractProject(filePath);
          const sessionId = config.getSessionId(filePath);
          
          allSessions.push({
            cli: cliKey,
            cliName: config.name,
            filePath,
            projectName,
            sessionId,
            lastModified: stats.mtime,
            size: stats.size
          });
        } catch (e) {
          // 忽略无法读取的会话文件
        }
      }
    } catch (e) {
      // 忽略无法访问的 CLI 目录
    }
  }
  
  return allSessions;
}

// 读取会话内容
function readSessionContent(session) {
  try {
    const content = fs.readFileSync(session.filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 尝试提取对话内容
    let conversation = '';
    
    if (data.messages && Array.isArray(data.messages)) {
      conversation = data.messages.map(msg => {
        const role = msg.role || 'unknown';
        const content = msg.content || '';
        return `[${role}]: ${content}`;
      }).join('\n\n');
    } else if (data.conversation && Array.isArray(data.conversation)) {
      conversation = data.conversation.map(msg => {
        const role = msg.role || 'unknown';
        const content = msg.content || '';
        return `[${role}]: ${content}`;
      }).join('\n\n');
    } else if (data.content) {
      conversation = data.content;
    } else {
      conversation = JSON.stringify(data, null, 2);
    }
    
    return conversation;
  } catch (e) {
    return null;
  }
}

// 生成会话摘要
function generateSessionSummary(session) {
  const content = readSessionContent(session);
  if (!content) {
    return '无法读取会话内容';
  }
  
  // 取前 200 个字符作为摘要
  const preview = content.substring(0, 200).replace(/\n/g, ' ');
  return preview.length < content.length ? preview + '...' : preview;
}

// 按时间排序会话
function sortSessionsByTime(sessions, descending = true) {
  return sessions.sort((a, b) => {
    const diff = a.lastModified - b.lastModified;
    return descending ? -diff : diff;
  });
}

// 过滤当前项目的会话
function filterCurrentProjectSessions(sessions) {
  const currentProjectPath = getCurrentProjectPath();
  
  return sessions.filter(session => {
    if (!session.projectName) return false;
    
    // 多级匹配策略
    const projectName = session.projectName.toLowerCase();
    const currentPath = currentProjectPath.toLowerCase();
    const currentDirName = path.basename(currentPath).toLowerCase();
    
    // 1. 精确匹配：项目名称与当前目录名完全相同
    if (projectName === currentDirName) {
      return true;
    }
    
    // 2. 路径包含：当前路径包含项目名称
    if (currentPath.includes(projectName)) {
      return true;
    }
    
    // 3. 名称包含：项目名称包含当前目录名
    if (projectName.includes(currentDirName)) {
      return true;
    }
    
    // 4. 文件路径包含：会话文件路径包含当前路径
    if (session.filePath.toLowerCase().includes(currentPath)) {
      return true;
    }
    
    return false;
  });
}

// 显示帮助信息
function showHelp() {
  console.log(`
ResumeSession - 跨 CLI 会话恢复工具
======================================

使用方式：
  node independent-resume.js [参数]

参数说明：
  无参数                  恢复当前项目目录的最新会话（不论哪个 CLI）
  [数字]                  显示当前项目目录相关的最近 N 个会话摘要列表
  [CLI名称]               显示对应 CLI 关于本项目目录相关的会话列表
  [CLI名称] [数字]        显示对应 CLI 关于本项目目录相关的最近 N 个会话
  --all                   显示当前项目所有 CLI 的会话列表
  --complete              显示所有 CLI 所有项目的会话分类列表
  --help                  显示此帮助信息

示例：
  node independent-resume.js              # 恢复当前项目最新会话
  node independent-resume.js 5            # 显示当前项目最近 5 个会话
  node independent-resume.js iflow        # 显示当前项目的 iFlow 会话
  node independent-resume.js iflow 3      # 显示当前项目最近 3 个 iFlow 会话
  node independent-resume.js --all        # 显示当前项目所有 CLI 的会话
  node independent-resume.js --complete   # 显示所有 CLI 所有项目的会话

支持的 CLI：
  claude, gemini, qwen, iflow, codebuddy, codex, qodercli, kode

配置策略（优先级从高到低）：
  1. 工具配置文件 (~/.resume-session/config.json)
  2. Stigmergy 配置（可选增强）
  3. 自动检测（扫描常见位置）
  4. 默认配置

特性：
  - 独立的配置管理，无需依赖 stigmergy
  - 自动扫描常见 CLI 的会话存储位置
  - 无需手动配置，开箱即用
  - 支持自定义安装路径
  - 智能项目识别
  - 相对时间显示
`);
}

// 显示会话列表
function displaySessionList(sessions, limit = null) {
  if (sessions.length === 0) {
    console.log('未找到相关会话。');
    return;
  }
  
  const displaySessions = limit ? sessions.slice(0, limit) : sessions;
  
  console.log(`\n找到 ${sessions.length} 个会话${limit ? ` (显示前 ${limit} 个)` : ''}：\n`);
  console.log('='.repeat(80));
  
  displaySessions.forEach((session, index) => {
    const summary = generateSessionSummary(session);
    const timeStr = session.lastModified.toLocaleString('zh-CN');
    const relativeTime = getRelativeTime(session.lastModified);
    
    console.log(`\n[${index + 1}] ${session.cliName} - ${session.projectName || '未知项目'}`);
    console.log(`    时间: ${timeStr} (${relativeTime})`);
    console.log(`    会话ID: ${session.sessionId}`);
    console.log(`    摘要: ${summary}`);
    console.log('-'.repeat(80));
  });
  
  console.log('\n提示: 使用会话编号可以查看完整内容（功能开发中）\n');
}

// 显示完整会话内容
function displayFullSession(session) {
  console.log('\n' + '='.repeat(80));
  console.log(`会话来源: ${session.cliName}`);
  console.log(`项目: ${session.projectName || '未知项目'}`);
  console.log(`时间: ${session.lastModified.toLocaleString('zh-CN')} (${getRelativeTime(session.lastModified)})`);
  console.log(`会话ID: ${session.sessionId}`);
  console.log('='.repeat(80));
  console.log('\n');
  
  const content = readSessionContent(session);
  if (content) {
    console.log(content);
  } else {
    console.log('无法读取会话内容');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// 显示按 CLI 分组的会话列表
function displayCliGroupedSessions(sessions) {
  const grouped = {};
  
  sessions.forEach(session => {
    if (!grouped[session.cliName]) {
      grouped[session.cliName] = [];
    }
    grouped[session.cliName].push(session);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('会话列表（按 CLI 分组）');
  console.log('='.repeat(80) + '\n');
  
  for (const [cliName, cliSessions] of Object.entries(grouped)) {
    console.log(`\n${cliName} (${cliSessions.length} 个会话)`);
    console.log('-'.repeat(80));
    
    cliSessions.forEach((session, index) => {
      const timeStr = session.lastModified.toLocaleString('zh-CN');
      const relativeTime = getRelativeTime(session.lastModified);
      console.log(`  [${index + 1}] ${session.projectName || '未知项目'} - ${timeStr} (${relativeTime})`);
      console.log(`      会话ID: ${session.sessionId}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// 显示按项目分组的会话列表
function displayProjectGroupedSessions(sessions) {
  const grouped = {};
  
  sessions.forEach(session => {
    const projectName = session.projectName || '未知项目';
    if (!grouped[projectName]) {
      grouped[projectName] = [];
    }
    grouped[projectName].push(session);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('会话列表（按项目分组）');
  console.log('='.repeat(80) + '\n');
  
  for (const [projectName, projectSessions] of Object.entries(grouped)) {
    console.log(`\n${projectName} (${projectSessions.length} 个会话)`);
    console.log('-'.repeat(80));
    
    projectSessions.forEach((session) => {
      const timeStr = session.lastModified.toLocaleString('zh-CN');
      const relativeTime = getRelativeTime(session.lastModified);
      console.log(`  ${session.cliName} - ${timeStr} (${relativeTime})`);
      console.log(`    会话ID: ${session.sessionId}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// 获取相对时间
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes} 分钟前`;
  } else if (hours < 24) {
    return `${hours} 小时前`;
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return `${date.toLocaleDateString('zh-CN')}`;
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  // 显示帮助
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  // 查找所有会话
  const allSessions = findAllSessions();
  
  if (allSessions.length === 0) {
    console.log('未找到任何会话。');
    console.log('\n提示:');
    console.log('1. 确保至少使用过一个 CLI 工具并创建了会话');
    console.log('2. 工具会自动扫描常见 CLI 的会话存储位置');
    console.log('3. 如果您的 CLI 安装在自定义位置，请确保会话目录可访问');
    console.log('4. 配置文件: ~/.resume-session/config.json');
    return;
  }
  
  // 过滤当前项目的会话
  const currentProjectSessions = filterCurrentProjectSessions(allSessions);
  
  // 解析参数
  const firstArg = args[0];
  const secondArg = args[1];
  
  // --complete: 显示所有 CLI 所有项目的会话分类列表
  if (firstArg === '--complete') {
    console.log('\n当前工作目录:', getCurrentProjectPath());
    displayProjectGroupedSessions(allSessions);
    return;
  }
  
  // --all: 显示当前项目所有相关的会话列表
  if (firstArg === '--all') {
    if (currentProjectSessions.length === 0) {
      console.log('当前项目未找到相关会话。');
      console.log('\n提示: 使用 --complete 查看所有项目的会话。');
      return;
    }
    
    console.log('\n当前工作目录:', getCurrentProjectPath());
    displaySessionList(currentProjectSessions);
    return;
  }
  
  // CLI 名称参数: 显示对应 CLI 关于本项目目录相关的会话
  if (DEFAULT_CLI_CONFIG[firstArg]) {
    const cliSessions = currentProjectSessions.filter(s => s.cli === firstArg);
    
    if (cliSessions.length === 0) {
      console.log(`当前项目未找到 ${DEFAULT_CLI_CONFIG[firstArg].name} 的会话。`);
      return;
    }
    
    // 如果有第二个参数且是数字，显示指定数量的会话
    if (secondArg && /^\d+$/.test(secondArg)) {
      const limit = parseInt(secondArg, 10);
      displaySessionList(sortSessionsByTime(cliSessions), limit);
    } else {
      // 否则显示该 CLI 的所有会话
      displaySessionList(sortSessionsByTime(cliSessions));
    }
    
    return;
  }
  
  // 数字参数: 显示当前项目目录相关的最近 N 个会话摘要列表
  if (firstArg && /^\d+$/.test(firstArg)) {
    const limit = parseInt(firstArg, 10);
    
    if (currentProjectSessions.length === 0) {
      console.log('当前项目未找到相关会话。');
      console.log('\n提示: 使用 --complete 查看所有项目的会话。');
      return;
    }
    
    displaySessionList(sortSessionsByTime(currentProjectSessions), limit);
    return;
  }
  
  // 无参数: 恢复当前项目目录的最新会话
  if (!firstArg) {
    if (currentProjectSessions.length === 0) {
      console.log('当前项目未找到相关会话。');
      console.log('\n提示: 使用 --complete 查看所有项目的会话。');
      return;
    }
    
    const sortedSessions = sortSessionsByTime(currentProjectSessions);
    const latestSession = sortedSessions[0];
    
    console.log('\n当前工作目录:', getCurrentProjectPath());
    displayFullSession(latestSession);
    return;
  }
  
  // 未知参数
  console.log(`未知参数: ${firstArg}`);
  console.log('使用 --help 查看帮助信息。');
}

// 运行主函数
main();