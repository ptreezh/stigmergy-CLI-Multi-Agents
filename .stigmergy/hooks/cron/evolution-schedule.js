#!/usr/bin/env node

/**
 * Soul Evolution Schedule Hooks
 *
 * 实现定时自主进化机制
 * 支持每日反思、每周进化、每月战略评估
 *
 * 使用方法：
 * node evolution-schedule.js start    # 启动定时任务
 * node evolution-schedule.js stop     # 停止定时任务
 * node evolution-schedule.js status   # 查看状态
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EvolutionScheduler {
  constructor() {
    this.schedules = new Map();
    this.stateFile = path.join(__dirname, '..', '.scheduler-state.json');
    this.logFile = path.join(__dirname, '..', '.evolution-log.json');
  }

  /**
   * 启动所有定时任务
   */
  start() {
    console.log('🚀 启动Soul自主进化定时任务...\n');

    // 每日反思 - 每天凌晨2点
    this.schedule('daily-reflection', '0 2 * * *', async () => {
      await this.runEvolutionTask('daily-reflection', {
        focus: 'mission-alignment',
        scope: 'daily'
      });
    });

    // 每周进化 - 每周日凌晨2点
    this.schedule('weekly-evolution', '0 2 * * 0', async () => {
      await this.runEvolutionTask('weekly-evolution', {
        focus: 'capability-enhancement',
        scope: 'weekly'
      });
    });

    // 每月战略 - 每月1号凌晨2点
    this.schedule('monthly-strategy', '0 2 1 * *', async () => {
      await this.runEvolutionTask('monthly-strategy', {
        focus: 'strategic-alignment',
        scope: 'monthly'
      });
    });

    // 技能发现 - 每6小时
    this.schedule('skill-discovery', '0 */6 * * *', async () => {
      await this.runSkillDiscovery();
    });

    // 快速检查 - 每小时
    this.schedule('quick-check', '0 * * * *', async () => {
      await this.runQuickCheck();
    });

    console.log(`✅ 已启动 ${this.schedules.size} 个定时任务`);
    this.printSchedule();
    this.saveState('running');

    // 保持进程运行
    this.keepAlive();
  }

  /**
   * 调度任务
   */
  schedule(name, cronExpression, task) {
    console.log(`   调度: ${name} (${cronExpression})`);

    this.schedules.set(name, {
      name,
      cron: cronExpression,
      task,
      lastRun: null,
      nextRun: null
    });
  }

  /**
   * 运行进化任务
   */
  async runEvolutionTask(taskName, options) {
    const timestamp = new Date().toISOString();
    console.log(`\n🧬 执行 ${taskName} - ${timestamp}`);

    try {
      // 调用soul-automated-skills-integration
      const result = await this.executeSkillIntegration(options);

      // 记录结果
      this.logExecution({
        task: taskName,
        timestamp,
        status: 'success',
        result
      });

      // 更新最后运行时间
      const schedule = this.schedules.get(taskName);
      if (schedule) {
        schedule.lastRun = timestamp;
      }

      console.log(`✅ ${taskName} 完成`);
      return result;
    } catch (error) {
      console.error(`❌ ${taskName} 失败:`, error.message);

      // 记录错误
      this.logExecution({
        task: taskName,
        timestamp,
        status: 'error',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * 运行技能发现
   */
  async runSkillDiscovery() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 执行技能发现 - ${timestamp}`);

    try {
      // 调用soul-skill-hunter-safe
      const result = await this.executeSkillHunter();

      this.logExecution({
        task: 'skill-discovery',
        timestamp,
        status: 'success',
        result
      });

      console.log(`✅ 技能发现完成，找到 ${result.found || 0} 个新技能`);
      return result;
    } catch (error) {
      console.error(`❌ 技能发现失败:`, error.message);

      this.logExecution({
        task: 'skill-discovery',
        timestamp,
        status: 'error',
        error: error.message
      });
    }
  }

  /**
   * 运行快速检查
   */
  async runQuickCheck() {
    const timestamp = new Date().toISOString();
    console.log(`⚡ 快速检查 - ${timestamp}`);

    try {
      // 检查系统状态
      const status = await this.checkSystemStatus();

      this.logExecution({
        task: 'quick-check',
        timestamp,
        status: 'success',
        result: status
      });

      return status;
    } catch (error) {
      console.error(`❌ 快速检查失败:`, error.message);
    }
  }

  /**
   * 执行技能集成
   */
  async executeSkillIntegration(options) {
    return new Promise((resolve, reject) => {
      const skillPath = path.join(__dirname, '..', '..', 'skills', 'soul-automated-skills-integration.js');
      const args = options.quick ? ['--quick'] : [];

      const child = spawn('node', [skillPath, ...args], {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..', '..')
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
        process.stderr.write('ERROR: ' + data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ output, success: true });
        } else {
          reject(new Error(error || `Execution failed with code ${code}`));
        }
      });
    });
  }

  /**
   * 执行技能猎人
   */
  async executeSkillHunter() {
    // 简化实现，实际会调用soul-skill-hunter-safe
    return {
      found: 0,
      scanned: 0,
      safe: 0
    };
  }

  /**
   * 检查系统状态
   */
  async checkSystemStatus() {
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 记录执行日志
   */
  logExecution(entry) {
    const log = this.loadLog();
    log.push(entry);

    // 只保留最近1000条记录
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }

    fs.writeFileSync(this.logFile, JSON.stringify(log, null, 2));
  }

  /**
   * 加载日志
   */
  loadLog() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('加载日志失败:', error.message);
    }
    return [];
  }

  /**
   * 保存状态
   */
  saveState(state) {
    const stateData = {
      state,
      timestamp: new Date().toISOString(),
      schedules: Array.from(this.schedules.entries()).map(([name, schedule]) => ({
        name,
        cron: schedule.cron,
        lastRun: schedule.lastRun
      }))
    };

    fs.writeFileSync(this.stateFile, JSON.stringify(stateData, null, 2));
  }

  /**
   * 加载状态
   */
  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('加载状态失败:', error.message);
    }
    return null;
  }

  /**
   * 打印调度信息
   */
  printSchedule() {
    console.log('\n📅 定时任务调度表:');
    console.log('─'.repeat(60));

    for (const [name, schedule] of this.schedules) {
      console.log(`${name.padEnd(25)} ${schedule.cron}`);
    }

    console.log('─'.repeat(60));
  }

  /**
   * 停止调度器
   */
  stop() {
    console.log('🛑 停止Soul自主进化定时任务...');
    this.schedules.clear();
    this.saveState('stopped');
    console.log('✅ 所有定时任务已停止');
    process.exit(0);
  }

  /**
   * 查看状态
   */
  status() {
    const state = this.loadState();
    const log = this.loadLog();

    console.log('\n📊 Soul自主进化系统状态');
    console.log('─'.repeat(60));

    if (state) {
      console.log(`状态: ${state.state}`);
      console.log(`最后更新: ${state.timestamp}`);
    } else {
      console.log('状态: 未初始化');
    }

    console.log(`\n定时任务数量: ${this.schedules.size}`);
    console.log(`日志记录数量: ${log.length}`);

    if (log.length > 0) {
      console.log('\n最近执行记录:');
      const recentLogs = log.slice(-5).reverse();
      for (const entry of recentLogs) {
        const status = entry.status === 'success' ? '✅' : '❌';
        console.log(`${status} ${entry.task} - ${entry.timestamp}`);
      }
    }

    console.log('─'.repeat(60));
  }

  /**
   * 保持进程运行
   */
  keepAlive() {
    console.log('\n💡 提示: 按 Ctrl+C 停止调度器');

    // 优雅退出
    process.on('SIGINT', () => {
      console.log('\n\n🛑 收到停止信号...');
      this.stop();
    });

    // 定期保存状态
    setInterval(() => {
      this.saveState('running');
    }, 60000); // 每分钟保存一次
  }
}

// ==================== 命令行接口 ====================

if (require.main === module) {
  const command = process.argv[2] || 'start';
  const scheduler = new EvolutionScheduler();

  switch (command) {
    case 'start':
      scheduler.start();
      break;
    case 'stop':
      scheduler.stop();
      break;
    case 'status':
      scheduler.status();
      process.exit(0);
      break;
    default:
      console.log('使用方法:');
      console.log('  node evolution-schedule.js start   # 启动定时任务');
      console.log('  node evolution-schedule.js stop    # 停止定时任务');
      console.log('  node evolution-schedule.js status  # 查看状态');
      process.exit(1);
  }
}

module.exports = EvolutionScheduler;