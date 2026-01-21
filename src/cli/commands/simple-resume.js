#!/usr/bin/env node
/**
 * Simplified Cross-CLI Session Recovery Tool
 * Simple version without complex internal Node.js modules
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SimpleSessionRecovery {
  constructor() {
    this.projectPath = process.cwd();
    this.cliPaths = {
      claude: path.join(os.homedir(), '.claude', 'projects'),
      gemini: path.join(os.homedir(), '.config', 'gemini', 'tmp'),
      qwen: path.join(os.homedir(), '.qwen', 'projects'),
      iflow: path.join(os.homedir(), '.iflow', 'projects'),
      codebuddy: path.join(os.homedir(), '.codebuddy'),
      codex: path.join(os.homedir(), '.config', 'codex'),
      qodercli: path.join(os.homedir(), '.qoder', 'projects'),
      kode: path.join(os.homedir(), '.kode', 'projects')
    };
  }

  // Get project directory name (normalized)
  getProjectDirName(projectPath) {
    // Windows drive letter format: D:\path -> D--path
    return projectPath
      .replace(/^([A-Za-z]):\\/, '$1--')
      .replace(/\\/g, '-');
  }

  // Find latest session across all CLIs
  findLatestSession() {
    let latestSession = null;
    let latestTime = new Date(0);
    let latestCLI = '';

    for (const [cliType, basePath] of Object.entries(this.cliPaths)) {
      if (!fs.existsSync(basePath)) {
        continue;
      }

      const session = this.findLatestSessionForCLI(cliType, basePath);
      if (session && session.modified > latestTime) {
        latestTime = session.modified;
        latestSession = session;
        latestCLI = cliType;
      }
    }

    if (!latestSession) {
      console.error('未找到任何会话');
      return null;
    }

    console.log(`最新会话: ${latestCLI} (${latestTime.toISOString()})`);
    return latestSession;
  }

  // Find latest session for a specific CLI
  findLatestSessionForCLI(cliType, basePath) {
    const projectDirName = this.getProjectDirName(basePath);

    // Different CLIs have different directory structures
    let sessionPath = basePath;

    if (['claude', 'iflow', 'qodercli', 'kode'].includes(cliType) && basePath.includes('projects')) {
      sessionPath = path.join(basePath, projectDirName);
    } else if (cliType === 'gemini' && basePath.includes('tmp')) {
      // Gemini uses hash directories
      try {
        const hashDirs = fs.readdirSync(basePath);
        for (const hashDir of hashDirs) {
          const chatsPath = path.join(basePath, hashDir, 'chats');
          if (fs.existsSync(chatsPath)) {
            const session = this.findLatestSessionInDir(chatsPath, cliType, hashDir);
            if (session) return session;
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    } else if (cliType === 'qwen' && basePath.includes('projects')) {
      // Qwen uses projects/<projectName>/chats
      const chatsPath = path.join(basePath, projectDirName, 'chats');
      if (fs.existsSync(chatsPath)) {
        return this.findLatestSessionInDir(chatsPath, cliType, projectDirName);
      }
      return null;
    } else if (cliType === 'codebuddy') {
      // CodeBuddy uses projects/<projectName> or root
      const projectsPath = path.join(basePath, 'projects');
      if (fs.existsSync(projectsPath)) {
        const projectPath = path.join(projectsPath, projectDirName);
        if (fs.existsSync(projectPath)) {
          const session = this.findLatestSessionInDir(projectPath, cliType, projectDirName);
          if (session) return session;
        }
      }
      return this.findLatestSessionInDir(basePath, cliType, 'root');
    }

    if (!fs.existsSync(sessionPath)) return null;

    return this.findLatestSessionInDir(sessionPath, cliType, projectDirName);
  }

  // Find latest session in a directory
  findLatestSessionInDir(dirPath, cliType, context) {
    try {
      const files = fs.readdirSync(dirPath);

      // Filter for session files only
      const sessionFiles = files.filter(file => {
        // CodeBuddy's user-state.json should be skipped
        if (cliType === 'codebuddy' && file === 'user-state.json') {
          return false;
        }
        // Codex's slash_commands.json should be skipped
        if (cliType === 'codex' && file === 'slash_commands.json') {
          return false;
        }
        return file.endsWith('.jsonl') || file.endsWith('.json') || file.endsWith('.session');
      });

      if (sessionFiles.length === 0) return null;

      let latestFile = null;
      let latestTime = new Date(0);

      for (const file of sessionFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.mtime > latestTime) {
            latestTime = stats.mtime;
            latestFile = file;
          }
        } catch (error) {
          continue;
        }
      }

      if (!latestFile) return null;

      return {
        cliType,
        file: latestFile,
        path: path.join(dirPath, latestFile),
        modified: latestTime,
        context
      };
    } catch (error) {
      return null;
    }
  }

  // Read and parse full session content
  readFullSession(sessionPath) {
    try {
      const content = fs.readFileSync(sessionPath, 'utf8');

      if (sessionPath.endsWith('.jsonl')) {
        const lines = content.trim().split('\n').filter(line => line.trim());
        return lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        }).filter(msg => msg !== null);
      } else {
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Error reading session: ${error.message}`);
      return null;
    }
  }

  // Format full session for output
  formatFullSession(session) {
    const messages = this.readFullSession(session.path);
    if (!messages) {
      return null;
    }

    // Handle different message formats
    const messageList = Array.isArray(messages) ? messages :
                       (messages.messages && Array.isArray(messages.messages)) ? messages.messages : [];

    if (messageList.length === 0) {
      return null;
    }

    const output = [];
    output.push('📋 最新会话恢复');
    output.push('');
    output.push(`🔧 来源: ${session.cliType.toUpperCase()}`);
    output.push(`📅 最后修改: ${session.modified.toLocaleString()}`);
    output.push(`📁 文件: ${session.file}`);
    output.push('');
    output.push('---');
    output.push('');
    output.push('📝 完整对话内容:');
    output.push('');

    // Extract and format all messages (limit to last 50 for readability)
    messageList.slice(-50).forEach((msg, index) => {
      const role = msg.type || msg.role || 'unknown';
      const prefix = role === 'user' ? '👤 用户' : '🤖 助手';
      const content = this.extractMessageContent(msg);

      if (content && content.trim()) {
        output.push(`${prefix}:`);
        output.push(content);
        output.push('');
      }
    });

    return output.join('\n');
  }

  // Extract text content from a message
  extractMessageContent(msg) {
    if (msg.message && typeof msg.message === 'object') {
      const content = msg.message.content || msg.message.text || '';
      return this.extractTextFromContent(content);
    }

    const content = msg.content || msg.text || '';
    return this.extractTextFromContent(content);
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
      return content.text || content.content || '';
    }

    return '';
  }

  // Execute recovery
  execute(options = {}) {
    const {
      fullRecovery = true,  // Default: recover full session
      listOnly = false,      // List sessions without recovery
      cliFilter = null        // Filter by specific CLI
    } = options;

    if (listOnly) {
      // List all sessions
      return this.listAllSessions();
    }

    // Default mode: find and recover latest session
    const session = this.findLatestSession();

    if (!session) {
      console.log('📭 未找到任何会话');
      console.log(`💡 项目路径: ${this.projectPath}`);
      if (cliFilter) {
        console.log(`💡 指定CLI: ${cliFilter}`);
      }
      return 1;
    }

    if (!fullRecovery) {
      // Show summary only
      const output = [];
      output.push('📋 会话信息');
      output.push('');
      output.push(`🔧 来源: ${session.cliType.toUpperCase()}`);
      output.push(`📅 最后修改: ${session.modified.toLocaleString()}`);
      output.push(`📁 文件: ${session.file}`);
      output.push(`📂 路径: ${session.path}`);
      console.log(output.join('\n'));
      return 0;
    }

    const formatted = this.formatFullSession(session);
    if (formatted) {
      console.log(formatted);
    } else {
      console.log('📭 无法解析会话内容');
      return 1;
    }

    return 0;
  }

  // List all sessions (advanced mode)
  listAllSessions() {
    const sessions = [];

    for (const [cliType, basePath] of Object.entries(this.cliPaths)) {
      if (cliFilter && cliType.toLowerCase() !== cliFilter.toLowerCase()) continue;

      if (!fs.existsSync(basePath)) continue;

      const session = this.findLatestSessionForCLI(cliType, basePath);
      if (session) {
        sessions.push(session);
      }
    }

    if (sessions.length === 0) {
      console.log('📭 未找到任何会话');
      return 1;
    }

    // Sort by modification time (newest first)
    sessions.sort((a, b) => b.modified - a.modified);

    const output = [];
    output.push('📋 所有会话列表（按时间排序）');
    output.push('');
    output.push(`📊 共找到 ${sessions.length} 个会话`);
    output.push('');

    sessions.forEach((session, index) => {
      output.push(`${index + 1}. ${session.cliType.toUpperCase()}`);
      output.push(`   📅 ${session.modified.toLocaleString()}`);
      output.push(`   📁 ${session.file}`);
      output.push('');
    });

    console.log(output.join('\n'));
    return 0;
  }
}

// Run as CLI command
if (require.main === module) {
  const recovery = new SimpleSessionRecovery();

  // Parse command line options
  const options = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--list' || arg === '-l') {
      options.listOnly = true;
    } else if (arg === '--summary' || arg === '-s') {
      options.fullRecovery = false;
    } else if (arg === '--cli' && i + 1 < args.length) {
      options.cliFilter = args[++i];
    }
  }

  process.exit(recovery.execute(options));
}

module.exports = SimpleSessionRecovery;
