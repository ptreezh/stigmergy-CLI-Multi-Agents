#!/usr/bin/env node
/**
 * ResumeSession Command
 * Cross-CLI session recovery and history management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ResumeSessionCommand {
  constructor() {
    this.projectPath = process.cwd();
  }

  // Get all CLI session paths (with dynamic detection)
  getAllCLISessionPaths() {
    const homeDir = os.homedir();
    const paths = {};

    // Detect Claude CLI session paths
    paths.claude = this.detectCLISessionPaths([
      path.join(homeDir, '.claude', 'projects'),
      path.join(homeDir, '.claude', 'sessions'),
      path.join(homeDir, '.claude', 'history')
    ]);

    // Detect Gemini CLI session paths
    paths.gemini = this.detectCLISessionPaths([
      path.join(homeDir, '.config', 'gemini', 'tmp'),
      path.join(homeDir, '.gemini', 'sessions'),
      path.join(homeDir, '.gemini', 'history')
    ]);

    // Detect Qwen CLI session paths
    paths.qwen = this.detectCLISessionPaths([
      path.join(homeDir, '.qwen', 'projects'),
      path.join(homeDir, '.qwen', 'sessions'),
      path.join(homeDir, '.qwen', 'history')
    ]);

    // Detect IFlow CLI session paths
    paths.iflow = this.detectCLISessionPaths([
      path.join(homeDir, '.iflow', 'projects'),
      path.join(homeDir, '.iflow', 'sessions'),
      path.join(homeDir, '.iflow', 'history')
    ]);

    // Detect QoderCLI session paths
    paths.qodercli = this.detectCLISessionPaths([
      path.join(homeDir, '.qoder', 'projects'),
      path.join(homeDir, '.qoder', 'sessions')
    ]);

    // Detect CodeBuddy session paths
    paths.codebuddy = this.detectCLISessionPaths([
      path.join(homeDir, '.codebuddy'),
      path.join(homeDir, '.codebuddy', 'sessions'),
      path.join(homeDir, '.codebuddy', 'history')
    ]);

    // Detect Codex session paths
    paths.codex = this.detectCLISessionPaths([
      path.join(homeDir, '.config', 'codex'),
      path.join(homeDir, '.codex', 'sessions'),
      path.join(homeDir, '.codex', 'history')
    ]);

    // Detect Kode session paths
    paths.kode = this.detectCLISessionPaths([
      path.join(homeDir, '.kode', 'projects'),
      path.join(homeDir, '.kode', 'sessions')
    ]);

    return paths;
  }

  // Detect which session paths actually exist and contain session files
  detectCLISessionPaths(candidatePaths) {
    const validPaths = [];

    for (const candidatePath of candidatePaths) {
      if (!fs.existsSync(candidatePath)) {
        continue;
      }

      // Check if this directory contains session files
      const hasSessionFiles = this.hasSessionFiles(candidatePath);
      if (hasSessionFiles) {
        validPaths.push(candidatePath);
      }
    }

    return validPaths.length > 0 ? validPaths : candidatePaths.filter(p => fs.existsSync(p));
  }

  // Check if a directory contains session files
  hasSessionFiles(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      return files.some(file =>
        file.endsWith('.jsonl') ||
        file.endsWith('.json') ||
        file.endsWith('.session')
      );
    } catch (error) {
      return false;
    }
  }

  // Scan sessions for a specific CLI
  scanSessions(cliType, sessionsPath, projectPath) {
    const sessions = [];
    if (!sessionsPath || !projectPath) return sessions;

    try {
      if (!fs.existsSync(sessionsPath)) return sessions;

      // For IFlow, Claude, QoderCLI, Kode: scan projects subdirectories (one level)
      if ((cliType === 'iflow' || cliType === 'claude' || cliType === 'qodercli' || cliType === 'kode') && sessionsPath.includes('projects')) {
        const subdirs = fs.readdirSync(sessionsPath);
        for (const subdir of subdirs) {
          const subdirPath = path.join(sessionsPath, subdir);
          try {
            const stat = fs.statSync(subdirPath);
            if (stat.isDirectory()) {
              sessions.push(...this.scanSessionFiles(cliType, subdirPath, projectPath));
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // For Gemini: scan tmp/<hash>/chats subdirectories (multiple levels)
      if (cliType === 'gemini' && sessionsPath.includes('tmp')) {
        const hashDirs = fs.readdirSync(sessionsPath);
        for (const hashDir of hashDirs) {
          const hashDirPath = path.join(sessionsPath, hashDir);
          try {
            const stat = fs.statSync(hashDirPath);
            if (stat.isDirectory()) {
              const chatsPath = path.join(hashDirPath, 'chats');
              if (fs.existsSync(chatsPath)) {
                sessions.push(...this.scanSessionFiles(cliType, chatsPath, projectPath));
              }
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // For Qwen: scan projects/<projectName>/chats subdirectories (two levels)
      if (cliType === 'qwen' && sessionsPath.includes('projects')) {
        const projectDirs = fs.readdirSync(sessionsPath);
        for (const projectDir of projectDirs) {
          const projectDirPath = path.join(sessionsPath, projectDir);
          try {
            const stat = fs.statSync(projectDirPath);
            if (stat.isDirectory()) {
              const chatsPath = path.join(projectDirPath, 'chats');
              if (fs.existsSync(chatsPath)) {
                sessions.push(...this.scanSessionFiles(cliType, chatsPath, projectPath));
              }
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // For CodeBuddy: scan both projects subdirectories and root history.jsonl
      if (cliType === 'codebuddy') {
        const projectsPath = path.join(sessionsPath, 'projects');
        if (fs.existsSync(projectsPath)) {
          const projectDirs = fs.readdirSync(projectsPath);
          for (const projectDir of projectDirs) {
            const projectDirPath = path.join(projectsPath, projectDir);
            try {
              const stat = fs.statSync(projectDirPath);
              if (stat.isDirectory()) {
                sessions.push(...this.scanSessionFiles(cliType, projectDirPath, projectPath));
              }
            } catch (error) {
              continue;
            }
          }
        }
        sessions.push(...this.scanSessionFiles(cliType, sessionsPath, projectPath));
        return sessions;
      }

      return this.scanSessionFiles(cliType, sessionsPath, projectPath);
    } catch (error) {
      console.warn(`Warning: Could not scan ${cliType} sessions:`, error.message);
    }

    return sessions;
  }

  // Scan session files in a directory
  scanSessionFiles(cliType, sessionsPath, projectPath) {
    const sessions = [];
    try {
      const files = fs.readdirSync(sessionsPath);
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.session') || file.endsWith('.jsonl')) {
          try {
            const filePath = path.join(sessionsPath, file);
            let sessionData;

            if (file.endsWith('.jsonl')) {
              const content = fs.readFileSync(filePath, 'utf8');
              const lines = content.trim().split('\n').filter(line => line.trim());
              const messages = lines.map(line => JSON.parse(line));

              if (messages.length === 0) continue;
              sessionData = this.parseJSONLSession(messages, file);
            } else {
              const content = fs.readFileSync(filePath, 'utf8');
              sessionData = JSON.parse(content);
            }

            if (this.isProjectSession(sessionData, projectPath)) {
              sessions.push({
                cliType,
                sessionId: sessionData.id || sessionData.sessionId || file.replace(/\.(json|session|jsonl)$/, ''),
                title: sessionData.title || sessionData.topic || 'Untitled',
                content: this.extractContent(sessionData),
                updatedAt: new Date(sessionData.updatedAt || sessionData.timestamp || fs.statSync(filePath).mtime),
                messageCount: sessionData.messageCount || this.countMessages(sessionData),
                projectPath
              });
            }
          } catch (error) {
            console.warn(`Warning: Could not parse ${file}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Could not scan files:', error.message);
    }

    return sessions;
  }

  // Parse JSONL session format
  parseJSONLSession(messages, filename) {
    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];
    const userMessages = messages.filter(m => m.type === 'user' || m.role === 'user');

    let title = 'Untitled Session';
    if (userMessages.length > 0) {
      const firstUserMsg = userMessages[0];
      let content = firstUserMsg.message?.content || firstUserMsg.content || '';
      if (typeof content === 'object') {
        content = JSON.stringify(content);
      }
      if (typeof content === 'string' && content.trim()) {
        title = content.substring(0, 100) || title;
      }
    }

    const contentParts = messages
      .map(m => {
        if (m.message && typeof m.message === 'object') {
          return m.message.content || m.message.text || '';
        }
        return m.content || m.text || '';
      })
      .filter(text => text && typeof text === 'string' && text.trim());

    return {
      sessionId: firstMsg.sessionId || filename.replace('.jsonl', ''),
      title: title,
      content: contentParts.join(' '),
      timestamp: lastMsg.timestamp || new Date().toISOString(),
      projectPath: firstMsg.cwd || firstMsg.workingDirectory,
      messageCount: messages.filter(m => m.type === 'user' || m.type === 'assistant' || m.role === 'user' || m.role === 'assistant').length,
      messages: messages
    };
  }

  // Scan all CLI sessions
  scanAllCLISessions(projectPath) {
    const allSessions = [];
    const cliPathsMap = this.getAllCLISessionPaths();

    for (const [cliType, sessionsPaths] of Object.entries(cliPathsMap)) {
      for (const sessionsPath of sessionsPaths) {
        const sessions = this.scanSessions(cliType, sessionsPath, projectPath);
        allSessions.push(...sessions);
      }
    }

    return allSessions;
  }

  // Check if session belongs to current project
  isProjectSession(session, projectPath) {
    const sessionProject = session.projectPath || session.workingDirectory || session.cwd;
    // If no project path info, exclude this session (unless showing all projects)
    if (!sessionProject) return false;

    return sessionProject === projectPath ||
           sessionProject.startsWith(projectPath) ||
           projectPath.startsWith(sessionProject);
  }

  // Extract content from session data
  extractContent(sessionData) {
    if (sessionData.content && typeof sessionData.content === 'string') {
      return sessionData.content;
    }

    if (sessionData.messages && Array.isArray(sessionData.messages)) {
      return sessionData.messages
        .map(msg => {
          if (msg.message && typeof msg.message === 'object') {
            const content = msg.message.content || msg.message.text || '';
            return this.extractTextFromContent(content);
          }
          const content = msg.content || msg.text || '';
          return this.extractTextFromContent(content);
        })
        .filter(text => text && typeof text === 'string' && text.trim())
        .join(' ');
    }

    if (Array.isArray(sessionData)) {
      return sessionData
        .map(item => {
          if (item.message && typeof item.message === 'object') {
            const content = item.message.content || item.message.text || '';
            return this.extractTextFromContent(content);
          }
          const content = item.content || item.text || '';
          return this.extractTextFromContent(content);
        })
        .filter(text => text && typeof text === 'string' && text.trim())
        .join(' ');
    }

    return '';
  }

  // Extract text from content
  extractTextFromContent(content) {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map(item => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            return item.text || item.content || '';
          }
          return '';
        })
        .filter(text => text && typeof text === 'string')
        .join(' ');
    }

    if (content && typeof content === 'object') {
      return content.text || content.content || JSON.stringify(content);
    }

    return '';
  }

  // Count messages in session
  countMessages(sessionData) {
    if (sessionData.messages) {
      return Array.isArray(sessionData.messages) ? sessionData.messages.length : 0;
    }

    if (Array.isArray(sessionData)) {
      return sessionData.length;
    }

    return 0;
  }

  // Filter sessions by CLI
  filterByCLI(sessions, cliType) {
    if (!cliType) return sessions;
    return sessions.filter(session => session.cliType === cliType);
  }

  // Filter sessions by search term
  filterBySearch(sessions, searchTerm) {
    if (!searchTerm) return sessions;

    const lowerSearch = searchTerm.toLowerCase();
    return sessions.filter(session =>
      session.title.toLowerCase().includes(lowerSearch) ||
      session.content.toLowerCase().includes(lowerSearch)
    );
  }

  // Filter sessions by date range
  filterByDateRange(sessions, timeRange = 'all') {
    if (timeRange === 'all') return sessions;

    const now = new Date();
    return sessions.filter(session => {
      const sessionDate = new Date(session.updatedAt);

      switch (timeRange) {
        case 'today':
          return sessionDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // Sort sessions by date
  sortByDate(sessions) {
    return [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Apply all filters
  applyFilters(sessions, options, projectPath) {
    let filteredSessions = [...sessions];

    // 如果不是 --all，则只过滤当前项目的会话
    if (!options.showAll) {
      filteredSessions = filteredSessions.filter(session => this.isProjectSession(session, projectPath));
    }

    if (options.cli) {
      filteredSessions = this.filterByCLI(filteredSessions, options.cli);
    }

    if (options.search) {
      filteredSessions = this.filterBySearch(filteredSessions, options.search);
    }

    if (options.timeRange) {
      filteredSessions = this.filterByDateRange(filteredSessions, options.timeRange);
    }

    filteredSessions = this.sortByDate(filteredSessions);

    // Only apply limit if not showing all projects
    if (!options.showAll && options.limit && options.limit > 0) {
      filteredSessions = filteredSessions.slice(0, options.limit);
    }

    return filteredSessions;
  }

  // Format sessions as summary
  formatSummary(sessions) {
    if (sessions.length === 0) {
      return `📭 暂无会话记录\n\n💡 **提示:** 尝试: stigmergy resume --all 查看所有项目的会话`;
    }

    let response = `📁 ${this.projectPath} 项目会话\n\n📊 共找到 ${sessions.length} 个会话\n\n`;

    const byCLI = {};
    sessions.forEach(session => {
      if (!byCLI[session.cliType]) byCLI[session.cliType] = [];
      byCLI[session.cliType].push(session);
    });

    Object.entries(byCLI).forEach(([cli, cliSessions]) => {
      const icon = this.getCLIIcon(cli);
      response += `${icon} **${cli.toUpperCase()}** (${cliSessions.length}个)\n`;

      cliSessions.forEach((session, i) => {
        const date = this.formatDate(session.updatedAt);
        const title = session.title.substring(0, 50);
        response += `   ${i + 1}. ${title}...\n`;
        response += `      📅 ${date} • 💬 ${session.messageCount}条消息\n`;
      });
      response += '\n';
    });

    if (!this.projectPath.includes('stigmergy')) {
      response += `💡 **使用方法:**\n`;
      response += `• 'stigmergy resume' - 恢复最近的会话\n`;
      response += `• 'stigmergy resume <数字>' - 显示指定数量的会话\n`;
      response += `• 'stigmergy resume <cli>' - 查看特定CLI的会话\n`;
      response += `• 'stigmergy resume <cli> <数字>' - 查看特定CLI的指定数量会话\n`;
      response += `• 'stigmergy resume --all' - 查看所有项目的会话`;
    }

    return response;
  }

  // Format sessions as timeline
  formatTimeline(sessions) {
    if (sessions.length === 0) {
      return '📭 暂无会话时间线。';
    }

    let response = `⏰ **时间线视图**\n\n`;

    sessions.forEach((session, index) => {
      const date = this.formatDate(session.updatedAt);
      const cliIcon = this.getCLIIcon(session.cliType);

      response += `${index + 1}. ${cliIcon} ${session.title}\n`;
      response += `   📅 ${date} • 💬 ${session.messageCount}条消息\n`;
      response += `   🔑 ${session.cliType}:${session.sessionId}\n\n`;
    });

    return response;
  }

  // Format sessions as detailed
  formatDetailed(sessions) {
    if (sessions.length === 0) {
      return '📭 暂无详细会话信息。';
    }

    let response = `📋 **详细视图**\n\n`;

    sessions.forEach((session, index) => {
      const cliIcon = this.getCLIIcon(session.cliType);
      const date = session.updatedAt.toLocaleString();

      response += `${index + 1}. ${cliIcon} **${session.title}**\n`;
      response += `   📅 ${date}\n`;
      response += `   🔧 CLI: ${session.cliType}\n`;
      response += `   💬 消息数: ${session.messageCount}\n`;
      response += `   🆔 会话ID: '${session.sessionId}'\n\n`;
    });

    return response;
  }

  // Format session context
  formatContext(session, full = false) {
    if (!session) {
      return `📭 暂无可恢复的上下文。`;
    }

    let response = `🔄 **上下文恢复**\n\n`;
    response += `📅 会话时间: ${this.formatDate(session.updatedAt)} (${session.updatedAt.toLocaleString()})\n`;
    response += `🔧 来源CLI: ${session.cliType}\n`;
    response += `💬 消息数: ${session.messageCount}\n`;
    response += `🆔 会话ID: ${session.sessionId}\n\n`;
    response += `---\n\n`;
    response += `**会话标题:**\n${session.title}\n\n`;
    
    const content = session.content.trim();
    if (content.length === 0) {
      response += `⚠️ 此会话内容为空\n`;
    } else {
      response += `**上次讨论内容:**\n`;
      if (full) {
        // 返回完整内容
        response += content;
      } else {
        // 返回完整内容，不再截断
        response += content;
      }
    }

    return response;
  }

  // Get CLI icon
  getCLIIcon(cliType) {
    const icons = {
      'claude': '🟢',
      'gemini': '🔵',
      'qwen': '🟡',
      'iflow': '🔴',
      'codebuddy': '🟣',
      'codex': '🟪',
      'qodercli': '🟠',
      'kode': '⚡'
    };
    return icons[cliType] || '🔹';
  }

  // Format date
  formatDate(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) {
      return date.toLocaleTimeString();
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else if (days < 30) {
      return `${Math.floor(days / 7)}周前`;
    } else {
      return `${Math.floor(days / 30)}个月前`;
    }
  }

  // Parse command options
  parseOptions(args) {
    const options = {
      limit: null,           // null 表示显示最近的会话，数字表示显示多个
      showAll: false,        // --all 显示所有项目的会话
      format: 'context',     // 默认显示上下文格式
      timeRange: 'all',
      cli: null,
      search: null,
      full: false            // --full 显示完整上下文（不截断）
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--all') {
        options.showAll = true;
        options.format = 'summary';
      } else if (arg === '--cli' && i + 1 < args.length) {
        options.cli = args[++i];
      } else if (arg === '--search' && i + 1 < args.length) {
        options.search = args[++i];
      } else if (arg === '--limit' && i + 1 < args.length) {
        options.limit = parseInt(args[++i]);
      } else if (arg === '--format' && i + 1 < args.length) {
        const format = args[++i]?.toLowerCase();
        if (['summary', 'timeline', 'detailed', 'context'].includes(format)) {
          options.format = format;
        }
      } else if (arg === '--today') {
        options.timeRange = 'today';
      } else if (arg === '--week') {
        options.timeRange = 'week';
      } else if (arg === '--month') {
        options.timeRange = 'month';
      } else if (arg === '--full') {
        options.full = true;
      } else if (!arg.startsWith('--')) {
        // 检查是否是数字
        const num = parseInt(arg);
        if (!isNaN(num) && num > 0) {
          options.limit = num;
          options.format = 'summary'; // 数字参数显示列表格式
        } else if (!options.search) {
          options.search = arg;
        }
      }
    }

    return options;
  }

  // Check if session has content
  hasContent(session) {
    if (!session) return false;
    if (!session.content) return false;
    const trimmed = session.content.trim();
    return trimmed.length > 0;
  }

  // Execute resume command
  execute(args) {
    try {
      const options = this.parseOptions(args);
      const allSessions = this.scanAllCLISessions(this.projectPath);
      const filteredSessions = this.applyFilters(allSessions, options, this.projectPath);

      let response;
      
      // 默认模式：显示最近的会话上下文
      if (options.format === 'context' && !options.limit && !options.showAll) {
        // 找到最近的会话
        let session = filteredSessions[0] || null;
        
        // 如果最近的会话内容为空，尝试上一个会话
        if (session && !this.hasContent(session) && filteredSessions.length > 1) {
          for (let i = 1; i < filteredSessions.length; i++) {
            if (this.hasContent(filteredSessions[i])) {
              session = filteredSessions[i];
              break;
            }
          }
        }
        
        if (!session) {
          response = `📭 ${options.showAll ? '暂无会话记录' : '当前项目暂无会话记录'}\n\n💡 **提示:** 尝试: stigmergy resume --all 查看所有项目的会话`;
        } else {
          response = this.formatContext(session, options.full);
        }
      } else {
        // 列表模式或其他格式
        switch (options.format) {
          case 'timeline':
            response = this.formatTimeline(filteredSessions);
            break;
          case 'detailed':
            response = this.formatDetailed(filteredSessions);
            break;
          case 'context':
            response = this.formatContext(filteredSessions[0] || null, options.full);
            break;
          case 'summary':
          default:
            response = this.formatSummary(filteredSessions);
            break;
        }
      }

      console.log(response);
      return 0;
    } catch (error) {
      console.error(`❌ 历史查询失败: ${error.message}`);
      return 1;
    }
  }
}

// Export for use as module
module.exports = ResumeSessionCommand;

// Export handler function for router
module.exports.handleResumeCommand = async function(args, options) {
  const command = new ResumeSessionCommand();
  return command.execute(args);
};

// Export help function
module.exports.printResumeHelp = function() {
  console.log(`
ResumeSession - Cross-CLI session recovery and history management

Usage: stigmergy resume [options] [cli] [limit]

默认行为: 恢复当前项目最近的会话上下文

Arguments:
  cli                CLI tool to filter (claude, gemini, qwen, iflow, codebuddy, codex, qodercli)
  limit              Maximum number of sessions to show (default: show latest session context)

Options:
  --all              Show all projects' sessions (not just current project)
  --cli <tool>        Filter by specific CLI tool
  --search <term>     Search sessions by content
  --format <format>   Output format: summary, timeline, detailed, context (default: context)
  --today             Show today's sessions
  --week              Show sessions from last 7 days
  --month             Show sessions from last 30 days
  --limit <number>    Limit number of sessions
  --full              Show complete context without truncation (default: false)
  -v, --verbose       Verbose output
  -h, --help          Show this help

Examples:
  stigmergy resume                     # 恢复当前项目最近的会话（完整内容）
  stigmergy resume --full              # 恢复当前项目最近的会话（完整内容，显式指定）
  stigmergy resume 5                   # 显示当前项目最近 5 个会话
  stigmergy resume --all                # 显示所有项目的会话
  stigmergy resume iflow               # 显示当前项目 iflow 的会话
  stigmergy resume iflow 5             # 显示 iflow 的 5 个会话
  stigmergy resume --search "react"     # 搜索包含 "react" 的会话
  stigmergy resume --today              # 显示今天的会话
  stigmergy resume --format timeline    # 以时间线格式显示
`);
};

// Run as CLI command
if (require.main === module) {
  const command = new ResumeSessionCommand();
  const args = process.argv.slice(2);
  process.exit(command.execute(args));
}