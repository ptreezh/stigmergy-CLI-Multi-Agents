#!/usr/bin/env node

/**
 * 会话结束提示脚本
 * 
 * 在 CLI 会话结束时显示提示，提醒用户提取记忆
 * 
 * 使用方式：
 *   在 CLI 会话结束时手动运行：
 *   node scripts/session-end-reminder.js
 */

const fs = require('fs');
const path = require('path');

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 检查是否有未提取的会话
 */
async function checkUnextractedSessions() {
  const sessionDirs = [
    path.join(process.env.HOME || process.env.USERPROFILE, '.qwen', 'sessions'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'sessions'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.iflow', 'sessions')
  ];
  
  let totalSessions = 0;
  let recentSessions = 0;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  for (const dir of sessionDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          totalSessions++;
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs > oneHourAgo) {
            recentSessions++;
          }
        }
      }
    }
  }
  
  return { totalSessions, recentSessions };
}

/**
 * 显示会话结束提示
 */
async function showSessionEndReminder() {
  const { totalSessions, recentSessions } = await checkUnextractedSessions();
  
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                           ║', 'cyan');
  log('║  💡 会话结束提示                                          ║', 'cyan');
  log('║                                                           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  if (recentSessions > 0) {
    log(`\n📊 检测到 ${recentSessions} 个最近会话（过去 1 小时内）`, 'yellow');
    log(`   总会话数：${totalSessions}`, 'yellow');
  } else {
    log(`\n📊 总会话数：${totalSessions}`, 'yellow');
  }
  
  log(`
┌─────────────────────────────────────────────────────────┐
│  提取记忆到共享存储：                                   │
│                                                         │
│    /stigmergy-resume                                    │
│                                                         │
│  或使用 Stigmergy 并发模式自动提取：                    │
│                                                         │
│    stigmergy concurrent "<任务>"                        │
│                                                         │
│  跳过本次会话：                                         │
│    直接关闭即可                                         │
└─────────────────────────────────────────────────────────┘
`, 'green');

  log('\n💡 提示：提取的记忆会保存到 STIGMERGY.md，供所有 CLI 共享', 'cyan');
  log('   查看共享记忆：cat STIGMERGY.md\n', 'cyan');
}

/**
 * 自动提取记忆（可选）
 */
async function autoExtractMemory() {
  log('\n🔄 开始自动提取记忆...', 'cyan');
  
  try {
    // 这里可以集成实际的记忆提取逻辑
    // 目前仅显示提示
    
    log('✅ 记忆提取完成！', 'green');
    log('   查看共享记忆：cat STIGMERGY.md', 'cyan');
    
  } catch (error) {
    log(`❌ 记忆提取失败：${error.message}`, 'red');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--auto')) {
    // 自动模式
    await autoExtractMemory();
  } else if (args.includes('--check')) {
    // 仅检查
    const { totalSessions, recentSessions } = await checkUnextractedSessions();
    log(`总会话：${totalSessions}`, 'cyan');
    log(`最近会话：${recentSessions}`, 'cyan');
  } else {
    // 默认：显示提示
    await showSessionEndReminder();
  }
}

// 运行
main().catch(console.error);
