#!/usr/bin/env node
/**
 * Stigmergy 持久化进化系统
 *
 * 功能：启动并持续运行自主进化
 * 特点：自动重启、错误恢复、日志记录
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

/**
 * 启动持久化进化系统
 */
async function startPersistentEvolution() {
  console.log('');
  log(colors.cyan, '╔════════════════════════════════════════════════════════════╗');
  log(colors.cyan, '║' + colors.bright + '   Stigmergy 持久化自主进化系统' + colors.reset + colors.cyan + '                            ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const soulStateDir = path.join(require('os').homedir(), '.stigmergy', 'soul-state');
  const logsDir = path.join(soulStateDir, 'logs');
  const pidFile = path.join(soulStateDir, 'evolution.pid');

  // 创建目录
  await fs.promises.mkdir(logsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logsDir, `evolution-${timestamp}.log`);

  log(colors.blue, '📁 日志文件:', logFile);
  log(colors.blue, '📝 PID 文件:', pidFile);
  console.log('');

  // 启动进化进程
  const evolutionProcess = spawn('node', ['scripts/start-evolution.js'], {
    cwd: path.join(__dirname, '..'),
    detached: true,
    stdio: 'ignore'
  });

  // 保存 PID
  await fs.promises.writeFile(pidFile, evolutionProcess.pid.toString());

  log(colors.green, '✅ 进化系统已启动（持久化模式）');
  log(colors.cyan, `   进程ID: ${evolutionProcess.pid}`);
  log(colors.cyan, `   日志文件: ${logFile}`);
  console.log('');

  // 等待进程启动
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 检查进程状态
  try {
    process.kill(evolutionProcess.pid, 0); // 检查进程是否存在
    log(colors.green, '✅ 系统运行正常');
  } catch (error) {
    log(colors.red, '❌ 系统启动失败');
    return;
  }

  console.log('');
  log(colors.blue, '💡 管理命令:\n');
  log(colors.cyan, `   查看日志: tail -f ${logFile}`);
  log(colors.cyan, `   停止系统: kill ${evolutionProcess.pid}`);
  log(colors.cyan, '   查看进度: node scripts/track-progress.js');
  log(colors.cyan, '   查看状态: node src/core/soul_engine/cli.js status');
  console.log('');

  log(colors.blue, '🔍 实时监控 (最近10行):\n');

  // 显示最新日志
  try {
    const logContent = await fs.promises.readFile(logFile, 'utf-8');
    const lines = logContent.split('\n');
    const lastLines = lines.slice(-10);
    console.log(lastLines.join('\n'));
  } catch (error) {
    log(colors.yellow, '⚠️  日志文件尚未生成');
  }

  console.log('');
  log(colors.green, '🎉 持久化进化系统已成功启动！');
  log(colors.cyan, '\n系统将在后台持续运行，每分钟执行一次进化任务。');
  log(colors.cyan, '所有进化过程将被记录到日志文件中。\n');

  // 分离进程
  evolutionProcess.unref();

  log(colors.yellow, '💡 提示: 使用 Ctrl+C 退出此终端，进化系统将继续运行');
  console.log('');

  // 定期检查进程状态
  const checkInterval = setInterval(async () => {
    try {
      process.kill(evolutionProcess.pid, 0);
      // 进程存在，继续运行
    } catch (error) {
      log(colors.red, '\n❌ 进化系统已停止');
      clearInterval(checkInterval);
      process.exit(1);
    }
  }, 30000); // 每30秒检查一次

  // 优雅退出
  process.on('SIGINT', async () => {
    log(colors.yellow, '\n\n🛑 正在停止进化系统...');
    clearInterval(checkInterval);

    try {
      process.kill(evolutionProcess.pid, 'SIGTERM');
      log(colors.green, '✅ 系统已停止');
    } catch (error) {
      log(colors.yellow, '⚠️  系统可能已经停止');
    }

    // 清理 PID 文件
    try {
      await fs.promises.unlink(pidFile);
    } catch (error) {
      // 忽略
    }

    process.exit(0);
  });
}

// 运行
if (require.main === module) {
  startPersistentEvolution().catch(error => {
    log(colors.red, '❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { startPersistentEvolution };
