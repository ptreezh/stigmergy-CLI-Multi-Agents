#!/usr/bin/env node
/**
 * OpenCode ResumeSession Skill
 * 专门为 OpenCode CLI 实现的会话恢复功能
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class OpenCodeResumeSession {
  constructor() {
    this.homeDir = os.homedir();
    this.opencodeConfigPath = path.join(this.homeDir, '.opencode');
    this.sessionStoragePath = path.join(this.opencodeConfigPath, 'sessions');
  }

  /**
   * 获取当前项目路径的规范化名称
   */
  getProjectPathHash(projectPath) {
    return projectPath
      .replace(/^([A-Za-z]):\\/, '$1--')
      .replace(/\\/g, '-')
      .replace(/\//g, '-');
  }

  /**
   * 查找所有 CLI 的会话（跨 CLI）
   */
  findAllCLISessions(projectPath) {
    const allSessions = [];
    const homeDir = os.homedir();

    // 定义所有 CLI 的会话路径
    const cliPaths = {
      claude: [path.join(homeDir, '.claude', 'projects')],
      gemini: [path.join(homeDir, '.config', 'gemini', 'tmp')],
      qwen: [path.join(homeDir, '.qwen', 'projects')],
      iflow: [path.join(homeDir, '.iflow', 'projects')],
      codebuddy: [path.join(homeDir, '.codebuddy')],
      codex: [path.join(homeDir, '.config', 'codex')],
      qodercli: [path.join(homeDir, '.qoder', 'projects')],
      opencode: [path.join(homeDir, '.opencode', 'sessions')]
    };

    // 扫描每个 CLI 的会话
    for (const [cliType, paths] of Object.entries(cliPaths)) {
      for (const basePath of paths) {
        if (!fs.existsSync(basePath)) continue;

        const sessions = this.scanCLIPath(cliType, basePath, projectPath);
        allSessions.push(...sessions);
      }
    }

    // 按修改时间排序（最新的在前）
    allSessions.sort((a, b) => b.modified - a.modified);

    return allSessions;
  }

  /**
   * 扫描特定 CLI 路径
   */
  scanCLIPath(cliType, basePath, projectPath) {
    const sessions = [];

    try {
      // OpenCode 特殊处理
      if (cliType === 'opencode' && basePath.includes('sessions')) {
        const projectHash = this.getProjectPathHash(projectPath);
        const projectSessionPath = path.join(basePath, projectHash);

        if (!fs.existsSync(projectSessionPath)) return sessions;

        const files = fs.readdirSync(projectSessionPath);
        for (const file of files) {
          if (file.endsWith('.json') || file.endsWith('.jsonl')) {
            const filePath = path.join(projectSessionPath, file);
            try {
              const stats = fs.statSync(filePath);
              sessions.push({
                id: file.replace(/\.(json|jsonl)$/, ''),
                cli: cliType,
                file: file,
                path: filePath,
                modified: stats.mtime,
                size: stats.size
              });
            } catch (error) {
              continue;
            }
          }
        }
        return sessions;
      }

      // Claude, IFlow, QoderCLI, Kode: 扫描 projects 子目录
      if ((cliType === 'claude' || cliType === 'iflow' || cliType === 'qodercli' || cliType === 'kode') && basePath.includes('projects')) {
        const subdirs = fs.readdirSync(basePath);
        for (const subdir of subdirs) {
          const subdirPath = path.join(basePath, subdir);
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

      // Gemini: 扫描 tmp/<hash>/chats 子目录
      if (cliType === 'gemini' && basePath.includes('tmp')) {
        const hashDirs = fs.readdirSync(basePath);
        for (const hashDir of hashDirs) {
          const hashDirPath = path.join(basePath, hashDir);
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

      // Qwen: 扫描 projects/<projectName>/chats 子目录
      if (cliType === 'qwen' && basePath.includes('projects')) {
        const projectDirs = fs.readdirSync(basePath);
        for (const projectDir of projectDirs) {
          const projectDirPath = path.join(basePath, projectDir);
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

      // CodeBuddy: 扫描 projects 或根目录
      if (cliType === 'codebuddy') {
        const projectsPath = path.join(basePath, 'projects');
        if (fs.existsSync(projectsPath)) {
          const projectDirs = fs.readdirSync(projectsPath);
          for (const projectDir of projectDirs) {
            const projectDirPath = path.join(projectsPath, projectDir);
            if (fs.existsSync(projectDirPath)) {
              sessions.push(...this.scanSessionFiles(cliType, projectDirPath, projectPath));
            }
          }
        }
        sessions.push(...this.scanSessionFiles(cliType, basePath, projectPath));
      }

      // Codex: 扫描根目录
      sessions.push(...this.scanSessionFiles(cliType, basePath, projectPath));

    } catch (error) {
      // 忽略错误，继续扫描其他 CLI
    }

    return sessions;
  }

  /**
   * 扫描会话文件
   */
  scanSessionFiles(cliType, dirPath, projectPath) {
    const sessions = [];

    try {
      const files = fs.readdirSync(dirPath);

      // 过滤会话文件
      const sessionFiles = files.filter(file => {
        // CodeBuddy 的 user-state.json 应该跳过
        if (cliType === 'codebuddy' && file === 'user-state.json') {
          return false;
        }
        // Codex 的 slash_commands.json 应该跳过
        if (cliType === 'codex' && file === 'slash_commands.json') {
          return false;
        }
        return file.endsWith('.jsonl') || file.endsWith('.json') || file.endsWith('.session');
      });

      for (const file of sessionFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = fs.statSync(filePath);
          sessions.push({
            id: file.replace(/\.(json|jsonl|session)$/, ''),
            cli: cliType,
            file: file,
            path: filePath,
            modified: stats.mtime,
            size: stats.size
          });
        } catch (error) {
          continue;
        }
      }

    } catch (error) {
      // 忽略错误
    }

    return sessions;
  }

  /**
   * 读取会话内容
   */
  readSession(sessionPath) {
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

  /**
   * 格式化会话输出
   */
  formatSession(session, options = {}) {
    const { format = 'last_message', limit = 1 } = options;
    const messages = this.readSession(session.path);

    if (!messages || messages.length === 0) {
      return `📭 会话 ${session.id} (${session.cli}) 为空或无法读取`;
    }

    const messageList = Array.isArray(messages) ? messages : 
                       (messages.messages && Array.isArray(messages.messages)) ? messages.messages : [];

    if (messageList.length === 0) {
      return `📭 会话 ${session.id} (${session.cli}) 没有消息`;
    }

    const output = [];

    if (format === 'last_message') {
      // 默认：只显示最后一条消息
      const lastMessage = messageList[messageList.length - 1];
      const role = lastMessage.type || lastMessage.role || 'unknown';
      const prefix = role === 'user' ? '👤 用户' : '🤖 助手';
      const content = this.extractContent(lastMessage);

      output.push('📋 最新会话信息');
      output.push('');
      output.push(`🔧 来源: ${session.cli.toUpperCase()}`);
      output.push(`🆔 会话 ID: ${session.id}`);
      output.push(`📅 最后修改: ${session.modified.toLocaleString()}`);
      output.push(`📝 总消息数: ${messageList.length}`);
      output.push('');
      output.push('---');
      output.push('');
      output.push('📝 最后一条消息:');
      output.push('');
      output.push(`${prefix}:`);
      output.push(content || '(无内容)');

    } else if (format === 'summary') {
      output.push('📋 会话摘要');
      output.push('');
      output.push(`🔧 来源: ${session.cli.toUpperCase()}`);
      output.push(`🆔 会话 ID: ${session.id}`);
      output.push(`📅 最后修改: ${session.modified.toLocaleString()}`);
      output.push(`📝 消息数量: ${messageList.length}`);
      output.push('');
      
      // 显示最近几条消息的摘要
      const recentMessages = messageList.slice(-limit);
      output.push('最近消息:');
      recentMessages.forEach((msg, index) => {
        const role = msg.type || msg.role || 'unknown';
        const prefix = role === 'user' ? '👤' : '🤖';
        const content = this.extractContent(msg);
        const preview = content ? content.substring(0, 100) + (content.length > 100 ? '...' : '') : '(无内容)';
        output.push(`  ${prefix} ${preview}`);
      });

    } else if (format === 'detailed') {
      output.push('📋 完整会话内容');
      output.push('');
      output.push(`🔧 来源: ${session.cli.toUpperCase()}`);
      output.push(`🆔 会话 ID: ${session.id}`);
      output.push(`📅 最后修改: ${session.modified.toLocaleString()}`);
      output.push(`📁 文件: ${session.file}`);
      output.push(`📝 消息数量: ${messageList.length}`);
      output.push('');
      output.push('---');
      output.push('');
      output.push('📝 完整对话内容:');
      output.push('');

      // 显示所有消息
      const messagesToShow = messageList.slice(-limit);
      messagesToShow.forEach((msg, index) => {
        const role = msg.type || msg.role || 'unknown';
        const prefix = role === 'user' ? '👤 用户' : '🤖 助手';
        const content = this.extractContent(msg);

        if (content && content.trim()) {
          output.push(`${prefix}:`);
          output.push(content);
          output.push('');
        }
      });

      if (messageList.length > limit) {
        output.push(`💡 还有 ${messageList.length - limit} 条消息未显示（使用 --limit <数量> 显示更多）`);
      }
    }

    return output.join('\n');
  }

  /**
   * 提取消息内容
   */
  extractContent(msg) {
    if (msg.message && typeof msg.message === 'object') {
      const content = msg.message.content || msg.message.text || '';
      return this.extractTextFromContent(content);
    }

    const content = msg.content || msg.text || '';
    return this.extractTextFromContent(content);
  }

  /**
   * 从内容对象中提取文本
   */
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

  /**
   * 执行会话恢复（默认显示最新有价值会话的最后一条消息）
   */
  execute(options = {}) {
    const {
      format = 'last_message',  // 默认只显示最后一条消息
      sessionId = null,
      limit = 1,
      cliFilter = null
    } = options;

    const projectPath = process.cwd();
    const sessions = this.findAllCLISessions(projectPath);

    if (sessions.length === 0) {
      console.log('📭 未找到任何 CLI 会话');
      console.log(`💡 项目路径: ${projectPath}`);
      console.log(`💡 已扫描的 CLI: claude, gemini, qwen, iflow, codebuddy, codex, qodercli, opencode`);
      return 1;
    }

    // 过滤出有价值的会话（有消息内容的会话）
    const valuableSessions = sessions.filter(session => {
      const messages = this.readSession(session.path);
      if (!messages || messages.length === 0) return false;
      
      const messageList = Array.isArray(messages) ? messages : 
                         (messages.messages && Array.isArray(messages.messages)) ? messages.messages : [];
      return messageList.length > 0;
    });

    if (valuableSessions.length === 0) {
      console.log('📭 未找到有价值的会话（所有会话都为空）');
      console.log(`💡 总共扫描了 ${sessions.length} 个会话`);
      return 1;
    }

    if (cliFilter) {
      // 过滤特定 CLI
      const filteredSessions = valuableSessions.filter(s => s.cli === cliFilter.toLowerCase());
      if (filteredSessions.length === 0) {
        console.log(`📭 未找到 ${cliFilter} 的有价值会话`);
        console.log(`💡 可用的 CLI: ${[...new Set(valuableSessions.map(s => s.cli))].join(', ')}`);
        return 1;
      }
      
      if (sessionId) {
        const session = filteredSessions.find(s => s.id === sessionId);
        if (!session) {
          console.log(`❌ 未找到 ${cliFilter} 的会话 ID: ${sessionId}`);
          console.log(`💡 可用会话: ${filteredSessions.map(s => s.id).join(', ')}`);
          return 1;
        }
        console.log(this.formatSession(session, { format, limit }));
      } else {
        const latestSession = filteredSessions[0];
        console.log(this.formatSession(latestSession, { format, limit }));
        
        if (filteredSessions.length > 1) {
          console.log('');
          console.log(`💡 ${cliFilter} 还有 ${filteredSessions.length - 1} 个其他有价值会话可用`);
        }
      }
    } else {
      // 显示最新有价值的会话（跨 CLI）
      if (sessionId) {
        const session = valuableSessions.find(s => s.id === sessionId);
        if (!session) {
          console.log(`❌ 未找到会话 ID: ${sessionId}`);
          console.log(`💡 可用会话: ${valuableSessions.map(s => `${s.cli}:${s.id}`).join(', ')}`);
          return 1;
        }
        console.log(this.formatSession(session, { format, limit }));
      } else {
        const latestSession = valuableSessions[0];
        console.log(this.formatSession(latestSession, { format, limit }));

        if (valuableSessions.length > 1) {
          console.log('');
          console.log(`💡 还有 ${valuableSessions.length - 1} 个其他有价值会话可用`);
          console.log(`💡 来自 CLI: ${[...new Set(valuableSessions.map(s => s.cli))].join(', ')}`);
          console.log(`💡 使用 --cli <name> 过滤特定 CLI`);
          console.log(`💡 使用 --session <id> 查看其他会话`);
          console.log(`💡 使用 --detailed 查看完整会话`);
        }
      }
    }

    return 0;
  }

  /**
   * 列出所有会话（跨 CLI）
   */
  listSessions() {
    const projectPath = process.cwd();
    const sessions = this.findAllCLISessions(projectPath);

    if (sessions.length === 0) {
      console.log('📭 未找到任何 CLI 会话');
      console.log(`💡 项目路径: ${projectPath}`);
      return 1;
    }

    const output = [];
    output.push('📋 所有 CLI 会话列表（按时间排序）');
    output.push('');
    output.push(`📊 共找到 ${sessions.length} 个会话`);
    output.push('');

    // 按 CLI 分组显示
    const cliGroups = {};
    sessions.forEach(session => {
      if (!cliGroups[session.cli]) {
        cliGroups[session.cli] = [];
      }
      cliGroups[session.cli].push(session);
    });

    for (const [cli, cliSessions] of Object.entries(cliGroups)) {
      output.push(`🔧 ${cli.toUpperCase()}: ${cliSessions.length} 个会话`);
      cliSessions.forEach((session, index) => {
        output.push(`   ${index + 1}. ${session.id}`);
        output.push(`      📅 ${session.modified.toLocaleString()}`);
        output.push(`      📁 ${session.file}`);
      });
      output.push('');
    }

    console.log(output.join('\n'));
    return 0;
  }
}

// 主执行函数
function main() {
  const resumeSession = new OpenCodeResumeSession();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  // 检查是否有 CLI 过滤器参数
  let cliFilter = null;
  let sessionId = null;
  let format = 'last_message';
  let limit = 1;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--cli' && i + 1 < args.length) {
      cliFilter = args[i + 1];
      i++; // 跳过下一个参数
    } else if (arg === '--session' && i + 1 < args.length) {
      sessionId = args[i + 1];
      i++; // 跳过下一个参数
    } else if (arg === '--detailed') {
      format = 'detailed';
    } else if (arg === '--summary') {
      format = 'summary';
    } else if (arg === '--limit' && i + 1 < args.length) {
      limit = parseInt(args[i + 1]) || 1;
      i++; // 跳过下一个参数
    } else if (arg === '--list') {
      return resumeSession.listSessions();
    }
  }
  
  // 执行会话恢复
  return resumeSession.execute({
    format,
    sessionId,
    limit,
    cliFilter
  });
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  const exitCode = main();
  process.exit(exitCode);
}

// 导出类
module.exports = OpenCodeResumeSession;
