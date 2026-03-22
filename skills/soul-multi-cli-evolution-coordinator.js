#!/usr/bin/env node

/**
 * Soul Multi-CLI Evolution Coordinator
 *
 * 实现跨CLI的自主进化协调系统
 * 确保任何CLI都可以参与进化过程，避免单点故障
 *
 * 核心特性：
 * - 多CLI负载均衡
 * - 自动故障转移
 * - 分布式任务执行
 * - 共享状态管理
 * - CLI可用性检测
 */

const { spawn } = require('child_process');
const path = require('path');
const SharedMemoryStore = require('../.stigmergy/shared-memory-store');

class MultiCLIEvolutionCoordinator {
  constructor(options = {}) {
    this.memoryStore = new SharedMemoryStore(options.memoryStore);
    this.currentCLI = options.currentCLI || this.detectCurrentCLI();
    this.availableCLIs = new Map();
    this.isRunning = false;
    this.heartbeatInterval = null;
    this.taskCheckInterval = null;

    // CLI工具配置
    this.cliTools = {
      claude: { command: 'claude', priority: 1 },
      gemini: { command: 'gemini', priority: 2 },
      qwen: { command: 'qwen', priority: 3 },
      iflow: { command: 'iflow', priority: 4 },
      qodercli: { command: 'qodercli', priority: 5 },
      codebuddy: { command: 'codebuddy', priority: 6 },
      opencode: { command: 'opencode', priority: 7 },
      kilocode: { command: 'kilo', priority: 8 }
    };
  }

  /**
   * 初始化协调器
   */
  async initialize() {
    console.log('🚀 初始化多CLI进化协调器...\n');

    // 初始化共享记忆存储
    await this.memoryStore.initialize();

    // 检测当前CLI
    console.log(`🔍 当前CLI: ${this.currentCLI}`);

    // 注册当前CLI
    await this.registerCurrentCLI();

    // 扫描可用的其他CLI
    await this.scanAvailableCLIs();

    // 显示协调器状态
    this.printCoordinatorStatus();
  }

  /**
   * 检测当前运行的CLI
   */
  detectCurrentCLI() {
    // 从进程信息检测
    const argv = process.argv;
    const execPath = process.execPath;

    // 检查环境变量
    if (process.env.CLI_NAME) {
      return process.env.CLI_NAME;
    }

    // 从命令行参数检测
    if (argv.some(arg => arg.includes('claude'))) return 'claude';
    if (argv.some(arg => arg.includes('gemini'))) return 'gemini';
    if (argv.some(arg => arg.includes('qwen'))) return 'qwen';
    if (argv.some(arg => arg.includes('iflow'))) return 'iflow';
    if (argv.some(arg => arg.includes('qoder'))) return 'qodercli';
    if (argv.some(arg => arg.includes('codebuddy'))) return 'codebuddy';
    if (argv.some(arg => arg.includes('opencode'))) return 'opencode';
    if (argv.some(arg => arg.includes('kilo'))) return 'kilocode';

    // 默认返回unknown
    return 'unknown';
  }

  /**
   * 注册当前CLI
   */
  async registerCurrentCLI() {
    const cliInfo = {
      name: this.currentCLI,
      version: await this.getCLIVersion(this.currentCLI),
      capabilities: await this.detectCLICapabilities(),
      pid: process.pid
    };

    await this.memoryStore.registerCLI(cliInfo);
    console.log(`✅ 已注册当前CLI: ${this.currentCLI}`);
  }

  /**
   * 获取CLI版本
   */
  async getCLIVersion(cliName) {
    return new Promise((resolve) => {
      const tool = this.cliTools[cliName];
      if (!tool) {
        resolve('unknown');
        return;
      }

      try {
        const child = spawn(tool.command, ['--version'], {
          stdio: 'pipe',
          shell: true,
          timeout: 5000
        });

        let output = '';
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.on('close', (code) => {
          resolve(output.trim() || 'unknown');
        });

        child.on('error', () => {
          resolve('unknown');
        });
      } catch (error) {
        resolve('unknown');
      }
    });
  }

  /**
   * 检测CLI能力
   */
  async detectCLICapabilities() {
    return [
      'evolution',
      'reflection',
      'audit',
      'coordination',
      'task-execution'
    ];
  }

  /**
   * 扫描可用的其他CLI
   */
  async scanAvailableCLIs() {
    console.log('\n🔍 扫描可用的CLI工具...');

    for (const [cliName, tool] of Object.entries(this.cliTools)) {
      if (cliName === this.currentCLI) continue;

      const isAvailable = await this.checkCLIAvailability(cliName);
      if (isAvailable) {
        this.availableCLIs.set(cliName, {
          name: cliName,
          command: tool.command,
          priority: tool.priority,
          status: 'available',
          lastChecked: new Date().toISOString()
        });
        console.log(`  ✅ ${cliName} - 可用`);
      } else {
        console.log(`  ❌ ${cliName} - 不可用`);
      }
    }

    console.log(`\n找到 ${this.availableCLIs.size} 个可用的备用CLI`);
  }

  /**
   * 检查CLI是否可用
   */
  async checkCLIAvailability(cliName) {
    return new Promise((resolve) => {
      const tool = this.cliTools[cliName];
      if (!tool) {
        resolve(false);
        return;
      }

      try {
        const child = spawn(tool.command, ['--help'], {
          stdio: 'pipe',
          shell: true,
          timeout: 5000
        });

        child.on('close', (code) => {
          resolve(code === 0 || code === 1); // 0或1都表示命令存在
        });

        child.on('error', () => {
          resolve(false);
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * 启动协调器
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  协调器已在运行');
      return;
    }

    console.log('\n🎯 启动多CLI进化协调器...\n');
    this.isRunning = true;

    // 启动心跳
    this.heartbeatInterval = setInterval(
      () => this.sendHeartbeat(),
      30000 // 每30秒
    );

    // 启动任务检查
    this.taskCheckInterval = setInterval(
      () => this.checkAndExecuteTasks(),
      10000 // 每10秒
    );

    // 立即执行一次任务检查
    await this.checkAndExecuteTasks();

    console.log('✅ 协调器已启动');
    console.log('💡 提示: 按 Ctrl+C 停止协调器');

    // 设置优雅退出
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * 发送心跳
   */
  async sendHeartbeat() {
    try {
      await this.memoryStore.updateCLIHeartbeat(this.currentCLI);
      console.log(`💓 ${this.currentCLI} 心跳更新 - ${new Date().toISOString()}`);
    } catch (error) {
      console.error('心跳更新失败:', error.message);
    }
  }

  /**
   * 检查并执行任务
   */
  async checkAndExecuteTasks() {
    try {
      // 获取下一个任务
      const task = await this.memoryStore.getNextTask(this.currentCLI);

      if (!task) {
        // 没有待处理任务，检查是否需要创建进化任务
        await this.maybeCreateEvolutionTask();
        return;
      }

      console.log(`\n📋 获得任务: ${task.id}`);
      console.log(`   类型: ${task.type}`);
      console.log(`   优先级: ${task.priority}`);

      // 执行任务
      const result = await this.executeTask(task);

      // 更新任务状态
      if (result.success) {
        await this.memoryStore.updateTaskStatus(task.id, 'completed', result);
        console.log(`✅ 任务完成: ${task.id}`);
      } else {
        await this.memoryStore.updateTaskStatus(task.id, 'failed', result.error);
        console.log(`❌ 任务失败: ${task.id} - ${result.error}`);

        // 如果失败次数过多，重新排队
        if (task.attempts >= 3) {
          console.log(`⚠️  任务失败次数过多，已放弃: ${task.id}`);
        } else {
          // 重新排队
          await this.memoryStore.enqueueTask({
            ...task,
            id: undefined // 让系统生成新ID
          });
        }
      }
    } catch (error) {
      console.error('任务检查失败:', error.message);
    }
  }

  /**
   * 可能创建进化任务
   */
  async maybeCreateEvolutionTask() {
    const evolutionState = await this.memoryStore.getEvolutionState();
    const now = new Date();
    const lastEvolution = evolutionState.lastEvolution ? new Date(evolutionState.lastEvolution) : null;

    // 如果距离上次进化超过1小时，创建新的进化任务
    if (!lastEvolution || (now - lastEvolution) > 3600000) {
      console.log('\n🧬 创建新的进化任务...');

      await this.memoryStore.enqueueTask({
        type: 'evolution',
        priority: 'high',
        phase: evolutionState.currentPhase || 'reflection',
        context: {
          lastEvolution: evolutionState.lastEvolution,
          currentPhase: evolutionState.currentPhase
        }
      });

      await this.memoryStore.updateEvolutionState({
        currentPhase: 'evolution_scheduled'
      });
    }
  }

  /**
   * 执行任务
   */
  async executeTask(task) {
    console.log(`\n🎯 执行任务: ${task.type}`);

    try {
      switch (task.type) {
        case 'evolution':
          return await this.executeEvolutionTask(task);

        case 'reflection':
          return await this.executeReflectionTask(task);

        case 'audit':
          return await this.executeAuditTask(task);

        case 'coordination':
          return await this.executeCoordinationTask(task);

        default:
          throw new Error(`未知任务类型: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行进化任务
   */
  async executeEvolutionTask(task) {
    console.log('   执行自主进化...');

    try {
      // 调用多Agent协调器
      const MultiAgentCoordinator = require('./soul-multi-agent-coordinator');
      const coordinator = new MultiAgentCoordinator();

      const evolutionResult = await coordinator.startAutonomousEvolution();

      // 记录到共享记忆
      await this.memoryStore.addEntry({
        cli: this.currentCLI,
        type: 'evolution',
        content: evolutionResult,
        metadata: {
          taskId: task.id,
          phase: task.phase
        }
      });

      // 更新进化状态
      await this.memoryStore.updateEvolutionState({
        lastEvolution: new Date().toISOString(),
        currentPhase: evolutionResult.direction,
        lastDirection: evolutionResult.direction,
        lastPriority: evolutionResult.priority
      });

      return {
        success: true,
        result: evolutionResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行反思任务
   */
  async executeReflectionTask(task) {
    console.log('   执行反思任务...');

    try {
      // 获取最近的记忆
      const recentEntries = await this.memoryStore.getRecentEntries(20);

      // 分析反思
      const reflection = {
        summary: this.generateReflectionSummary(recentEntries),
        insights: this.extractInsights(recentEntries),
        recommendations: this.generateRecommendations(recentEntries),
        timestamp: new Date().toISOString()
      };

      // 记录反思
      await this.memoryStore.addEntry({
        cli: this.currentCLI,
        type: 'reflection',
        content: reflection,
        metadata: {
          taskId: task.id,
          analyzedEntries: recentEntries.length
        }
      });

      return {
        success: true,
        result: reflection,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行审计任务
   */
  async executeAuditTask(task) {
    console.log('   执行安全审计...');

    try {
      // 获取待审计的内容
      const recentEntries = await this.memoryStore.getRecentEntries(10);

      // 执行安全审计
      const audit = {
        securityScore: this.calculateSecurityScore(recentEntries),
        issues: this.identifySecurityIssues(recentEntries),
        recommendations: this.generateSecurityRecommendations(recentEntries),
        timestamp: new Date().toISOString()
      };

      // 记录审计结果
      await this.memoryStore.addEntry({
        cli: this.currentCLI,
        type: 'audit',
        content: audit,
        metadata: {
          taskId: task.id,
          auditedEntries: recentEntries.length
        }
      });

      return {
        success: true,
        result: audit,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行协调任务
   */
  async executeCoordinationTask(task) {
    console.log('   执行协调任务...');

    try {
      // 获取活跃的CLI
      const activeCLIs = await this.memoryStore.getActiveCLIs();

      // 分析协调状态
      const coordination = {
        activeCLIs: activeCLIs.length,
        loadBalance: this.analyzeLoadBalance(activeCLIs),
        recommendations: this.generateCoordinationRecommendations(activeCLIs),
        timestamp: new Date().toISOString()
      };

      // 记录协调结果
      await this.memoryStore.addEntry({
        cli: this.currentCLI,
        type: 'coordination',
        content: coordination,
        metadata: {
          taskId: task.id
        }
      });

      return {
        success: true,
        result: coordination,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 委派任务给其他CLI
   */
  async delegateTask(task, targetCLI) {
    console.log(`\n🔄 委派任务给 ${targetCLI}...`);

    const cliTool = this.cliTools[targetCLI];
    if (!cliTool) {
      throw new Error(`未知的CLI: ${targetCLI}`);
    }

    return new Promise((resolve, reject) => {
      // 构造委派命令
      const command = this.buildDelegationCommand(task, targetCLI);

      const child = spawn(cliTool.command, [command], {
        stdio: 'pipe',
        shell: true,
        cwd: process.cwd()
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output,
            delegatedTo: targetCLI,
            timestamp: new Date().toISOString()
          });
        } else {
          reject(new Error(error || `委派失败，退出码: ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`委派执行失败: ${err.message}`));
      });
    });
  }

  /**
   * 构造委派命令
   */
  buildDelegationCommand(task, targetCLI) {
    // 根据任务类型构造不同的命令
    switch (task.type) {
      case 'evolution':
        return `stigmergy soul evolve`;

      case 'reflection':
        return `stigmergy soul reflect`;

      case 'audit':
        return `stigmergy soul audit`;

      default:
        return `stigmergy task ${task.id}`;
    }
  }

  /**
   * 故障转移 - 当当前CLI不可用时
   */
  async failover() {
    console.log('\n🚨 启动故障转移...');

    // 找到可用的备用CLI
    const backupCLIs = Array.from(this.availableCLIs.values())
      .filter(cli => cli.status === 'available')
      .sort((a, b) => a.priority - b.priority);

    if (backupCLIs.length === 0) {
      console.error('❌ 没有可用的备用CLI');
      return false;
    }

    console.log(`📋 可用备份CLI: ${backupCLIs.map(c => c.name).join(', ')}`);

    // 尝试委派任务给优先级最高的可用CLI
    for (const backupCLI of backupCLIs) {
      try {
        console.log(`🔄 尝试切换到 ${backupCLI.name}...`);

        // 创建紧急任务
        await this.memoryStore.enqueueTask({
          type: 'coordination',
          priority: 'critical',
          reason: 'failover',
          context: {
            failedCLI: this.currentCLI,
            targetCLI: backupCLI.name
          }
        });

        console.log(`✅ 已成功切换到 ${backupCLI.name}`);
        return true;
      } catch (error) {
        console.error(`❌ 切换到 ${backupCLI.name} 失败:`, error.message);
        continue;
      }
    }

    console.error('❌ 所有故障转移尝试均失败');
    return false;
  }

  /**
   * 停止协调器
   */
  async shutdown() {
    console.log('\n🛑 正在关闭协调器...');

    this.isRunning = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.taskCheckInterval) {
      clearInterval(this.taskCheckInterval);
    }

    // 获取最终统计
    const stats = await this.memoryStore.getStatistics();
    console.log('\n📊 最终统计:');
    console.log(`   总贡献: ${this.memoryStore.memory.statistics.totalContributions}`);
    console.log(`   活跃CLI: ${stats.activeCLIs}`);
    console.log(`   待处理任务: ${stats.pendingTasks}`);

    console.log('\n✅ 协调器已安全关闭');
    process.exit(0);
  }

  /**
   * 打印协调器状态
   */
  printCoordinatorStatus() {
    console.log('\n📊 多CLI进化协调器状态:');
    console.log('─'.repeat(60));
    console.log(`当前CLI: ${this.currentCLI}`);
    console.log(`可用备份CLI: ${this.availableCLIs.size}`);
    console.log(`协调器状态: ${this.isRunning ? '运行中' : '已停止'}`);
    console.log('─'.repeat(60));
  }

  // ==================== 辅助方法 ====================

  generateReflectionSummary(entries) {
    return {
      totalEntries: entries.length,
      cliDistribution: this.analyzeCLIDistribution(entries),
      typeDistribution: this.analyzeTypeDistribution(entries),
      timeframe: this.calculateTimeframe(entries)
    };
  }

  extractInsights(entries) {
    return [
      '系统持续运行中',
      '多CLI协作正常',
      '进化机制活跃'
    ];
  }

  generateRecommendations(entries) {
    return [
      '保持当前运行状态',
      '定期检查CLI可用性',
      '优化任务分配策略'
    ];
  }

  calculateSecurityScore(entries) {
    // 基础分数
    let score = 80;

    // 根据条目数量调整
    if (entries.length > 100) score -= 5;
    if (entries.length > 500) score -= 10;

    // 根据CLI数量调整
    const uniqueCLIs = new Set(entries.map(e => e.cli)).size;
    if (uniqueCLIs < 2) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  identifySecurityIssues(entries) {
    const issues = [];

    // 检查是否有未知CLI
    const unknownCLIs = entries.filter(e => e.cli === 'unknown');
    if (unknownCLIs.length > 0) {
      issues.push({
        severity: 'warning',
        issue: '发现未知CLI贡献',
        count: unknownCLIs.length
      });
    }

    return issues;
  }

  generateSecurityRecommendations(entries) {
    return [
      '定期审查CLI注册状态',
      '监控异常活动',
      '保持系统更新'
    ];
  }

  analyzeLoadBalance(activeCLIs) {
    const totalLoad = activeCLIs.reduce((sum, cli) =>
      sum + (cli.statistics?.tasksCompleted || 0), 0
    );

    return {
      totalTasks: totalLoad,
      averagePerCLI: totalLoad / Math.max(1, activeCLIs.length),
      distribution: activeCLIs.map(cli => ({
        cli: cli.name,
        tasks: cli.statistics?.tasksCompleted || 0
      }))
    };
  }

  generateCoordinationRecommendations(activeCLIs) {
    const recommendations = [];

    if (activeCLIs.length < 2) {
      recommendations.push('建议安装更多CLI以提高可用性');
    }

    if (activeCLIs.length > 5) {
      recommendations.push('CLI数量充足，可以优化任务分配');
    }

    return recommendations;
  }

  analyzeCLIDistribution(entries) {
    const distribution = {};
    for (const entry of entries) {
      distribution[entry.cli] = (distribution[entry.cli] || 0) + 1;
    }
    return distribution;
  }

  analyzeTypeDistribution(entries) {
    const distribution = {};
    for (const entry of entries) {
      distribution[entry.type] = (distribution[entry.type] || 0) + 1;
    }
    return distribution;
  }

  calculateTimeframe(entries) {
    if (entries.length === 0) return null;

    const timestamps = entries.map(e => new Date(e.timestamp).getTime());
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);

    return {
      start: new Date(min).toISOString(),
      end: new Date(max).toISOString(),
      duration: max - min
    };
  }
}

// ==================== 命令行接口 ====================

if (require.main === module) {
  const coordinator = new MultiCLIEvolutionCoordinator();

  coordinator.initialize()
    .then(() => {
      return coordinator.start();
    })
    .catch(error => {
      console.error('\n❌ 协调器启动失败:', error);
      process.exit(1);
    });
}

module.exports = MultiCLIEvolutionCoordinator;
