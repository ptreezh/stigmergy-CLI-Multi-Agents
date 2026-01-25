/**
 * Stigmergy Orchestrator - 基于Stigmergy机制的增强编排器
 * 实现CLI之间的间接协同，避免冲突，智能聚合结果
 */

const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const StigmergyEnvironment = require('./StigmergyEnvironment');
const FileLockManager = require('./FileLockManager');
const ResultAggregator = require('./ResultAggregator');

class StigmergyOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();

    this.concurrency = options.concurrency || 3;
    this.workDir = options.workDir || process.cwd();
    this.cliRegistry = new Map();
    this.maxRetries = options.maxRetries ?? 2;
    this.enableSessionResume = options.enableSessionResume !== false;

    // 协同组件
    this.environment = new StigmergyEnvironment({ workDir: this.workDir });
    this.fileLockManager = new FileLockManager({
      workDir: this.workDir,
      lockTimeout: options.lockTimeout || 300000
    });
    this.resultAggregator = new ResultAggregator({
      cliWeights: options.cliWeights
    });

    // 协同模式
    this.coordinationMode = options.coordinationMode || 'parallel';  // parallel, competitive, collaborative
    this.aggregationStrategy = options.aggregationStrategy || 'consensus';

    this._initializeCLIRegistry();
  }

  /**
   * 初始化 CLI 注册表
   */
  _initializeCLIRegistry() {
    const clis = [
      {
        name: 'qwen',
        command: 'qwen',
        params: ['-y'],
        available: true,
        capabilities: ['code', 'chinese', 'analysis', 'documentation']
      },
      {
        name: 'iflow',
        command: 'iflow',
        params: [],
        available: true,
        capabilities: ['code', 'analysis', 'interactive']
      },
      {
        name: 'claude',
        command: 'claude',
        params: ['-p', '', '--dangerously-skip-permissions', '--allowed-tools', 'Bash,Edit,Read,Write,RunCommand,ComputerTools'],
        available: true,
        capabilities: ['analysis', 'documentation', 'reasoning', 'complex']
      },
      {
        name: 'gemini',
        command: 'gemini',
        params: ['-y'],
        available: true,
        capabilities: ['multilingual', 'creative', 'writing', 'design']
      },
      {
        name: 'codebuddy',
        command: 'codebuddy',
        params: ['-p', '', '-y'],
        available: true,
        capabilities: ['completion', 'refactoring', 'optimization', 'quality']
      },
      {
        name: 'codex',
        command: 'codex',
        params: ['-p', '', '-y'],
        available: true,
        capabilities: ['debugging', 'bug-fixing', 'error-handling']
      },
      {
        name: 'copilot',
        command: 'copilot',
        params: ['-p', '', '--allow-all-tools'],
        available: true,
        capabilities: ['best-practices', 'suggestions', 'patterns', 'architecture']
      },
      {
        name: 'qodercli',
        command: 'qodercli',
        params: ['-y'],
        available: true,
        capabilities: ['code', 'general']
      }
    ];

    clis.forEach(cli => {
      this.cliRegistry.set(cli.name, cli);
      // 注册到环境
      this.environment.registerAgent(cli.name, cli.capabilities);
    });
  }

  /**
   * 并发执行任务（增强版，支持协同）
   */
  async executeConcurrent(task, options = {}) {
    const mode = options.mode || this.coordinationMode;
    const aggregationStrategy = options.aggregationStrategy || this.aggregationStrategy;
    const concurrencyLimit = options.concurrencyLimit || this.concurrency;
    const timeout = options.timeout || 0;

    this.emit('task-start', { task, mode, aggregationStrategy });

    const startTime = Date.now();
    const taskId = `task_${Date.now()}`;

    console.log(`\n🚀 Stigmergy Orchestrator: Starting ${mode} execution`);
    console.log(`📊 Mode: ${mode}`);
    console.log(`📋 Aggregation: ${aggregationStrategy}`);
    console.log(`🤖 Concurrency: ${concurrencyLimit}`);

    try {
      let results;

      switch (mode) {
        case 'competitive':
          // 竞争模式：所有CLI执行相同任务，选择最佳结果
          results = await this._executeCompetitive(task, concurrencyLimit, timeout, taskId);
          break;

        case 'collaborative':
          // 协同模式：根据特长分配子任务
          results = await this._executeCollaborative(task, concurrencyLimit, timeout, taskId);
          break;

        case 'parallel':
        default:
          // 并行模式：传统并行执行
          results = await this._executeParallel(task, concurrencyLimit, timeout, taskId);
          break;
      }

      // 聚合结果
      console.log(`\n🔄 Aggregating results using ${aggregationStrategy} strategy...`);
      const aggregated = this.resultAggregator.aggregate(results, aggregationStrategy);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 记录结果到环境
      results.forEach(r => {
        this.environment.cacheResult(taskId, r.cli, r);
      });

      // 添加聚合痕迹
      this.environment.addTrace({
        type: 'result_aggregation',
        taskId,
        strategy: aggregationStrategy,
        resultsCount: results.length,
        successCount: results.filter(r => r.success).length,
        selectedResult: aggregated.cli || 'aggregated'
      });

      // 检测冲突
      const conflicts = this.environment.detectConflicts();
      if (conflicts.length > 0) {
        console.log(`\n⚠️  Detected ${conflicts.length} potential conflicts`);
        conflicts.forEach(c => {
          console.log(`   📁 ${c.filePath}: ${c.modifiers.join(' vs ')}`);
        });
      }

      // 返回结果
      const finalResult = {
        taskId,
        mode,
        aggregationStrategy,
        totalResults: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
        totalTime,
        results,
        aggregated,
        conflicts
      };

      this.emit('task-complete', { task, result: finalResult });
      return finalResult;

    } catch (error) {
      this.emit('task-error', { task, error });
      throw error;
    }
  }

  /**
   * 并行执行模式
   */
  async _executeParallel(task, concurrencyLimit, timeout, taskId) {
    const availableCLIs = this._selectAvailableCLIs(concurrencyLimit);
    console.log(`\n🤖 Selected CLIs: ${availableCLIs.join(', ')}`);

    const promises = availableCLIs.map(cliName =>
      this._executeWithCLI(cliName, task, timeout, 0, taskId)
    );

    return await Promise.all(promises);
  }

  /**
   * 竞争执行模式
   */
  async _executeCompetitive(task, concurrencyLimit, timeout, taskId) {
    const availableCLIs = this._selectAvailableCLIs(concurrencyLimit);
    console.log(`\n⚔️  Competitive mode: ${availableCLIs.length} CLIs competing`);

    console.log(`\n🤖 Competitors: ${availableCLIs.join(', ')}`);

    const promises = availableCLIs.map(cliName =>
      this._executeWithCLI(cliName, task, timeout, 0, taskId)
    );

    const results = await Promise.all(promises);

    // 记录竞争痕迹
    results.forEach(r => {
      this.environment.addTrace({
        type: 'competition',
        taskId,
        cliName: r.cli,
        success: r.success,
        executionTime: r.executionTime
      });
    });

    return results;
  }

  /**
   * 协同执行模式
   */
  async _executeCollaborative(task, concurrencyLimit, timeout, taskId) {
    console.log(`\n🤝 Collaborative mode: CLIs working together`);

    // 分析任务类型
    const taskType = this._analyzeTaskType(task);

    // 根据任务类型选择最合适的CLIs
    const selectedCLIs = this._selectCLIsByCapability(taskType, concurrencyLimit);

    console.log(`\n📊 Task type: ${taskType}`);
    console.log(`🤖 Selected specialists: ${selectedCLIs.map(c => c.name).join(', ')}`);

    // 分配子任务
    const subTasks = this._decomposeTask(task, selectedCLIs, taskType);

    // 执行子任务
    const results = [];
    for (const subTask of subTasks) {
      console.log(`\n📝 Sub-task for ${subTask.cli}: ${subTask.task.substring(0, 50)}...`);

      const result = await this._executeWithCLI(
        subTask.cli,
        subTask.task,
        timeout,
        0,
        taskId
      );

      results.push(result);

      // 记录协同痕迹
      this.environment.addTrace({
        type: 'collaboration',
        taskId,
        cliName: subTask.cli,
        subTask: subTask.task,
        dependency: subTask.dependency,
        success: result.success
      });
    }

    return results;
  }

  /**
   * 分析任务类型
   */
  _analyzeTaskType(task) {
    const taskLower = task.toLowerCase();

    if (taskLower.includes('分析') || taskLower.includes('analyze') || taskLower.includes('review')) {
      return 'analysis';
    } else if (taskLower.includes('代码') || taskLower.includes('function') || taskLower.includes('实现')) {
      return 'code';
    } else if (taskLower.includes('测试') || taskLower.includes('test')) {
      return 'testing';
    } else if (taskLower.includes('文档') || taskLower.includes('document') || taskLower.includes('readme')) {
      return 'documentation';
    } else if (taskLower.includes('重构') || taskLower.includes('refactor') || taskLower.includes('优化')) {
      return 'refactoring';
    } else if (taskLower.includes('调试') || taskLower.includes('debug') || taskLower.includes('bug')) {
      return 'debugging';
    } else {
      return 'general';
    }
  }

  /**
   * 根据能力选择CLIs
   */
  _selectCLIsByCapability(taskType, limit) {
    const taskCapabilities = {
      'analysis': ['analysis', 'reasoning'],
      'code': ['code'],
      'testing': ['code', 'quality'],
      'documentation': ['documentation', 'writing'],
      'refactoring': ['refactoring', 'optimization'],
      'debugging': ['debugging', 'bug-fixing'],
      'general': ['code', 'general']
    };

    const requiredCaps = taskCapabilities[taskType] || ['general'];

    // 评分并排序
    const scored = Array.from(this.cliRegistry.values())
      .filter(cli => cli.available)
      .map(cli => {
        const score = cli.capabilities.filter(cap => requiredCaps.includes(cap)).length;
        return { ...cli, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  /**
   * 分解任务
   */
  _decomposeTask(task, selectedCLIs, taskType) {
    // 简化版：为每个CLI分配略有不同的任务角度
    const subTasks = [];

    const angles = {
      'code': [
        { suffix: ' 请提供完整的代码实现', prefix: '' },
        { suffix: ' 请注重代码质量和可维护性', prefix: '【质量视角】' },
        { suffix: ' 请添加详细注释', prefix: '【文档视角】' }
      ],
      'analysis': [
        { suffix: ' 请深入分析', prefix: '' },
        { suffix: ' 请找出潜在问题', prefix: '【批判视角】' },
        { suffix: ' 请提供改进建议', prefix: '【优化视角】' }
      ],
      'default': [
        { suffix: '', prefix: '' },
        { suffix: ' 请详细说明', prefix: '【详细版】' },
        { suffix: ' 请简洁回答', prefix: '【简洁版】' }
      ]
    };

    const taskAngles = angles[taskType] || angles['default'];

    selectedCLIs.forEach((cli, index) => {
      const angle = taskAngles[index % taskAngles.length];
      subTasks.push({
        cli: cli.name,
        task: `${angle.prefix}${task}${angle.suffix}`,
        dependency: null
      });
    });

    return subTasks;
  }

  /**
   * 使用指定的 CLI 执行任务
   */
  async _executeWithCLI(cliName, task, timeout, currentRetry, taskId) {
    const cliConfig = this.cliRegistry.get(cliName);

    if (!cliConfig) {
      throw new Error(`CLI ${cliName} not found in registry`);
    }

    console.log(`\n🚀 Executing with ${cliName} (attempt ${currentRetry + 1}/${this.maxRetries + 1})...`);
    console.log(`📋 Task: ${task.substring(0, 100)}...`);

    // 分配任务
    this.environment.assignTask(taskId, cliName, { task, retry: currentRetry });

    const startTime = Date.now();

    try {
      // 构建命令参数
      let args;
      if (cliName === 'qwen' || cliName === 'qodercli' || cliName === 'gemini') {
        args = [task, ...cliConfig.params];
      } else if (cliName === 'iflow') {
        args = [task];
      } else if (cliName === 'codebuddy' || cliName === 'codex') {
        args = [...cliConfig.params.map(p => p === '' ? task : p)];
      } else if (cliName === 'copilot') {
        args = ['-p', task, '--allow-all-tools'];
      } else if (cliName === 'claude') {
        args = ['-p', task, '--dangerously-skip-permissions', '--allowed-tools', 'Bash,Edit,Read,Write,RunCommand,ComputerTools'];
      } else {
        args = ['-p', task];
      }

      // 执行命令
      const result = await this._spawnCommand(cliName, cliName, args, timeout);
      const endTime = Date.now();

      console.log(`✅ ${cliName} completed in ${endTime - startTime}ms`);

      const finalResult = {
        cli: cliName,
        success: true,
        output: result,
        executionTime: endTime - startTime
      };

      // 标记任务完成
      this.environment.completeTask(taskId, cliName, finalResult);

      return finalResult;
    } catch (error) {
      const endTime = Date.now();
      const errorMsg = error.message || String(error);
      console.log(`❌ ${cliName} failed: ${errorMsg}`);

      // 如果执行失败，尝试恢复和重试
      if (this.enableSessionResume && currentRetry < this.maxRetries) {
        console.log(`⚠️  Attempting auto-recovery for ${cliName}...`);

        await this._recoverSession(cliName);

        return await this._executeWithCLI(cliName, task, timeout, currentRetry + 1, taskId);
      }

      return {
        cli: cliName,
        success: false,
        output: null,
        executionTime: endTime - startTime,
        error: errorMsg
      };
    }
  }

  /**
   * 恢复CLI会话
   */
  async _recoverSession(cliName) {
    console.log(`💾 Recovering session for ${cliName}...`);

    return new Promise((resolve) => {
      const process = spawn('stigmergy', ['resume', cliName, '5'], {
        stdio: 'inherit',
        shell: true,
        cwd: this.workDir
      });

      process.on('close', (code) => {
        console.log(`✅ Session recovery completed (code=${code})`);
        resolve();
      });

      setTimeout(() => {
        console.log(`⏱️  Session recovery timeout for ${cliName}`);
        resolve();
      }, 10000);
    });
  }

  /**
   * 生成子进程执行命令
   */
  _spawnCommand(cliName, command, args, timeout) {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      let interactionDetected = false;

      const interactionPatterns = [
        />> ?>|\(y\/n\)|Continue\?|Press any key|输入|确认/i
      ];

      const childProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        cwd: this.workDir,
        env: { ...process.env, FORCE_COLOR: '0' }
      });

      childProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;

        for (const pattern of interactionPatterns) {
          if (pattern.test(text)) {
            interactionDetected = true;
            console.log(`\n⚠️  [${cliName}] Interactive prompt detected, terminating...`);
            childProcess.kill('SIGTERM');
            break;
          }
        }

        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`[${cliName}] ${line}`);
          }
        });
      });

      childProcess.stderr?.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;

        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.error(`[${cliName}] ERROR: ${line}`);
          }
        });
      });

      childProcess.on('close', (code) => {
        if (interactionDetected) {
          reject(new Error('Interactive prompt detected - auto-terminated'));
        } else if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(error);
      });

      // 超时控制
      const defaultTimeout = 120000;
      const timeoutId = setTimeout(() => {
        if (!childProcess.killed) {
          console.log(`\n⏱️  [${cliName}] Timeout after ${defaultTimeout}ms, terminating...`);
          childProcess.kill('SIGTERM');
          setTimeout(() => childProcess.kill('SIGKILL'), 5000);
        }
      }, timeout > 0 ? timeout : defaultTimeout);

      childProcess.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * 选择可用的 CLI
   */
  _selectAvailableCLIs(count) {
    const available = Array.from(this.cliRegistry.entries())
      .filter(([_, config]) => config.available)
      .map(([name, _]) => name);

    return available.slice(0, count);
  }

  /**
   * 获取环境摘要
   */
  getEnvironmentSummary() {
    return this.environment.getSummary();
  }

  /**
   * 获取锁状态
   */
  getLockStatus() {
    return this.fileLockManager.getStatus();
  }

  /**
   * 清理
   */
  cleanup() {
    this.fileLockManager.releaseAllLocks();
    this.environment.cleanup();
  }
}

module.exports = StigmergyOrchestrator;
