#!/usr/bin/env node
/**
 * 自动记忆同步器
 *
 * 监控各个 CLI 的会话历史，自动提取经验教训
 * 更新到 STIGMERGY.md
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class AutoMemorySync {
  constructor() {
    this.projectDir = process.cwd();
    this.stigmergyMd = path.join(this.projectDir, 'STIGMERGY.md');
    this.soulMd = path.join(this.projectDir, 'SOUL.md');

    // 各个 CLI 的会话历史路径
    this.cliHistoryPaths = {
      qwen: path.join(os.homedir(), '.qwen', 'projects'),
      codebuddy: path.join(os.homedir(), '.codebuddy'),
      iflow: path.join(os.homedir(), '.iflow', 'projects'),
      claude: path.join(os.homedir(), '.claude', 'projects'),
      gemini: path.join(os.homedir(), '.config', 'gemini', 'tmp')
    };
  }

  /**
   * 扫描各个 CLI 的最近会话
   */
  async scanRecentSessions() {
    const recentSessions = [];

    for (const [cli, historyPath] of Object.entries(this.cliHistoryPaths)) {
      try {
        const sessions = await this.scanCliSessions(cli, historyPath);
        recentSessions.push(...sessions);
      } catch (error) {
        console.log(`⚠️  ${cli} 扫描失败:`, error.message);
      }
    }

    return recentSessions;
  }

  /**
   * 扫描特定 CLI 的会话
   */
  async scanCliSessions(cli, historyPath) {
    const sessions = [];

    if (!fs.existsSync(historyPath)) {
      return sessions;
    }

    // 递归扫描最近的会话文件
    const recentFiles = this.getRecentFiles(historyPath, 3); // 最近 3 天

    for (const file of recentFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const session = this.parseSessionFile(cli, file, content);
        if (session) {
          sessions.push(session);
        }
      } catch (error) {
        // 忽略无法读取的文件
      }
    }

    return sessions;
  }

  /**
   * 获取最近的文件
   */
  getRecentFiles(dir, days) {
    const files = [];
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const scanDir = (currentPath) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          if (stats.mtimeMs >= cutoffTime) {
            files.push(fullPath);
          }
        }
      }
    };

    try {
      scanDir(dir);
    } catch (error) {
      // 忽略无法访问的目录
    }

    return files;
  }

  /**
   * 解析会话文件
   */
  parseSessionFile(cli, filePath, content) {
    try {
      // 尝试解析 JSON
      const sessionData = JSON.parse(content);

      // 提取有用的信息
      return {
        cli,
        file: filePath,
        timestamp: sessionData.timestamp || sessionData.updatedAt || new Date().toISOString(),
        title: sessionData.title || sessionData.topic || 'Untitled',
        messages: sessionData.messages || sessionData.conversation || [],
        success: this.isSuccessfulSession(sessionData),
        lessons: this.extractLessons(sessionData)
      };
    } catch (error) {
      // 不是 JSON 文件，可能是其他格式
      return null;
    }
  }

  /**
   * 判断会话是否成功
   */
  isSuccessfulSession(sessionData) {
    // 检查是否有错误或失败标记
    const content = JSON.stringify(sessionData).toLowerCase();
    return !content.includes('error') && !content.includes('failed') && !content.includes('exception');
  }

  /**
   * 提取经验教训
   */
  extractLessons(sessionData) {
    const lessons = [];
    const content = JSON.stringify(sessionData);

    // 查找模式：经验、教训、发现、改进
    const patterns = [
      /(?:经验|lesson|learned|发现|found|改进|improve|优化|optimize)/gi
    ];

    // 简单实现：提取包含关键字的句子
    // 实际应用中可以使用更复杂的 NLP
    return lessons;
  }

  /**
   * 提取最有价值的会话
   */
  filterValuableSessions(sessions) {
    // 优先选择成功的会话
    return sessions
      .filter(s => s.success)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // 最多 10 个
  }

  /**
   * 生成经验总结
   */
  async generateExperienceSummary(sessions) {
    if (sessions.length === 0) {
      return '';
    }

    const valuableSessions = this.filterValuableSessions(sessions);

    let summary = '\n╔════════════════════════════════════════════════════════════╗\n';
    summary += '║   从独立运行中汲取的经验                                           ║\n';
    summary += '╚════════════════════════════════════════════════════════════╝\n\n';

    summary += `📊 扫描时间: ${new Date().toLocaleString()}\n`;
    summary += `📁 发现会话: ${sessions.length} 个\n`;
    summary += `✅ 有效会话: ${valuableSessions.length} 个\n\n`;

    summary += '🎯 最近的高价值会话:\n\n';

    for (const session of valuableSessions.slice(0, 5)) {
      const date = new Date(session.timestamp).toLocaleString();
      summary += `📅 ${date}\n`;
      summary += `🤖 ${session.cli}: ${session.title.substring(0, 60)}...\n`;
      summary += `   ${session.messages.length} 条消息\n\n`;
    }

    return summary;
  }

  /**
   * 更新 STIGMERGY.md
   */
  async updateSTIGMERGY(summary) {
    if (!summary) {
      return;
    }

    // 追加到 STIGMERGY.md
    fs.appendFileSync(this.stigmergyMd, summary + '\n');

    console.log('✅ STIGMERGY.md 已更新');
  }

  /**
   * 主同步函数
   */
  async sync() {
    console.log('🔄 开始自动记忆同步...\n');

    try {
      // 1. 扫描各个 CLI 的最近会话
      const sessions = await this.scanRecentSessions();
      console.log(`📊 扫描到 ${sessions.length} 个最近会话`);

      // 2. 生成经验总结
      const summary = await this.generateExperienceSummary(sessions);

      // 3. 更新 STIGMERGY.md
      await this.updateSTIGMERGY(summary);

      console.log('\n✅ 自动记忆同步完成');

    } catch (error) {
      console.error('❌ 同步失败:', error.message);
    }
  }
}

// 启动同步
if (require.main === module) {
  const syncer = new AutoMemorySync();
  syncer.sync().catch(error => {
    console.error('错误:', error);
    process.exit(1);
  });
}

module.exports = { AutoMemorySync };
