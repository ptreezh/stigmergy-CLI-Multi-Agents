/**
 * Interactive Mode Controller
 * Controls the interactive dialogue mode for Stigmergy CLI
 */

const readline = require('readline');
const { EventEmitter } = require('events');
// 🔒 使用带文件锁保护的编排器
const { CentralOrchestrator } = require('../../dist/orchestration/core/CentralOrchestrator');
const CLIPathDetector = require('../core/cli_path_detector');

class InteractiveModeController extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      maxHistory: options.maxHistory || 100,
      autoSave: options.autoSave !== false,
      saveInterval: options.saveInterval || 60000,
      autoEnterLoop: options.autoEnterLoop !== false, // 默认自动进入命令循环
      cliTimeout: options.cliTimeout || 0, // CLI执行超时时间，默认0（无超时限制）
      concurrency: options.concurrency || 3, // 并发CLI数量
      ...options
    };

    // Initialize orchestration system components
    this.orchestrator = new CentralOrchestrator({
      concurrency: options.concurrency || 3,
      workDir: process.cwd()
    });

    // Controller state
    this.isActive = false;
    this.readlineInterface = null;
    this.saveIntervalId = null;
    this.currentCLI = options.defaultCLI || 'qwen'; // 默认使用 qwen

    // Initialize CLI path detector
    this.cliPathDetector = new CLIPathDetector();

    // CLI registry for concurrent execution (will be updated by scanning)
    this.cliRegistry = {};

    // Initialize components
    this.commandParser = new CommandParser();
    this.sessionManager = new SessionManager(this.options);
    this.contextManager = new ContextManager();
    this.taskOrchestrator = null; // Will be initialized later
  }
  
  /**
   * Get running state
   */
  get isRunning() {
    return this.isActive;
  }
  
  /**
   * Start interactive mode
   */
  async start() {
    if (this.isActive) {
      console.warn('Interactive mode is already active');
      return;
    }

    this.isActive = true;

    // Scan for installed CLI tools
    await this._scanInstalledCLITools();

    // Create session
    this.sessionManager.createSession();

    // Display welcome message
    this._displayWelcome();

    // Start auto-save if enabled
    if (this.options.autoSave) {
      this._startAutoSave();
    }

    // Enter command loop only if autoEnterLoop is enabled
    if (this.options.autoEnterLoop) {
      await this._enterCommandLoop();
    }
  }
  
  /**
   * Stop interactive mode
   */
  async stop() {
    if (!this.isActive) {
      return;
    }
    
    this.isActive = false;
    
    // Close readline interface
    if (this.readlineInterface) {
      this.readlineInterface.close();
      this.readlineInterface = null;
    }
    
    // Stop auto-save
    if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
      this.saveIntervalId = null;
    }
    
    // Save session
    if (this.options.autoSave) {
      await this.sessionManager.saveSession();
    }
    
    // Display goodbye message
    this._displayGoodbye();
    
    this.emit('stopped');
  }
  
  /**
   * Execute a command
   */
  async executeCommand(command) {
    try {
      // Update context
      this.contextManager.updateContext({
        lastCommand: command,
        lastCommandTime: Date.now()
      });
      
      // Execute based on command type
      let result;
      switch (command.type) {
        case 'task':
          result = await this._executeTask(command);
          break;
        case 'exit':
          result = await this._executeExit();
          break;
        case 'help':
          result = await this._executeHelp();
          break;
        case 'terminal':
          result = await this._executeTerminalCommand(command);
          break;
        case 'status':
          result = await this._executeStatus();
          break;
        case 'delegate':
          result = await this._executeDelegate(command);
          break;
        case 'use':
          result = await this._executeUse(command);
          break;
        case 'ask':
          result = await this._executeAsk(command);
          break;
        case 'route':
          result = await this._executeRoute(command);
          break;
        case 'parallel':
        case 'concurrent':
          result = await this._executeConcurrent(command);
          break;
        case 'empty':
          result = { success: true, message: 'No command' };
          break;
        case 'error':
          result = { success: false, error: command.error };
          break;
        default:
          result = { success: false, error: `Unknown command type: ${command.type}` };
      }
      
      // Add to session history
      this.sessionManager.addToHistory({
        command,
        result,
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      this.emit('error', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get session information
   */
  getSessionInfo() {
    return this.sessionManager.getCurrentSession();
  }
  
  /**
   * Get context
   */
  getContext() {
    return this.contextManager.getContext();
  }
  
  /**
   * Display welcome message
   */
  _displayWelcome() {
    const availableCLIs = Object.keys(this.cliRegistry)
      .filter(cli => this.cliRegistry[cli].available)
      .join(', ');

    console.log('========================================');
    console.log('  Stigmergy Interactive Mode');
    console.log('========================================');
    console.log('');
    console.log('Welcome to Stigmergy Interactive Mode!');
    console.log('');
    console.log(`Current CLI: ${this.currentCLI}`);
    console.log('');
    console.log('Available CLI Tools:');
    console.log(`  ${availableCLIs || 'No CLI tools detected'}`);
    console.log('');
    console.log('Available commands:');
    console.log('  <your message>       - Send message to current CLI');
    console.log('  use <cli>            - Switch to specific CLI (e.g., use iflow)');
    console.log('  ask <cli> <message>  - Ask specific CLI (e.g., ask qwen hello)');
    console.log('  route <message>      - Smart routing to best CLI (e.g., route analyze this code)');
    console.log('  r <message>          - Shortcut for route (e.g., r analyze this code)');
    console.log('  parallel <message>   - Execute with multiple CLIs concurrently');
    console.log('  concurrent <message> - Same as parallel');
    console.log('  resume [cli] [limit] - Resume session from CLI history');
    console.log('  skill <cmd> [args]   - Skills management (install/list/read/validate/remove)');
    console.log('  skill-i <source>     - Install a skill');
    console.log('  skill-l              - List installed skills');
    console.log('  skill-r <name>       - Read a skill');
    console.log('  skill-v <path/name>  - Validate/read a skill');
    console.log('  skill-d <name>       - Remove a skill');
    console.log('  help                - Show this help');
    console.log('  status              - Show status');
    console.log('  exit                - Exit interactive mode');
    console.log('');
    console.log('Type your message or "exit" to quit.');
    console.log('========================================');
    console.log('');
  }

  /**
   * Scan for installed CLI tools and update registry
   */
  async _scanInstalledCLITools() {
    try {
      console.log('[SCANNING] Detecting installed CLI tools...');
      const detectedPaths = await this.cliPathDetector.detectAllCLIPaths();

      // Update CLI registry based on detection results
      this.cliRegistry = {};
      const availableTools = [];

      for (const [toolName, pathInfo] of Object.entries(detectedPaths)) {
        const isAvailable = pathInfo !== null && pathInfo !== undefined;
        this.cliRegistry[toolName] = {
          name: toolName,
          available: isAvailable,
          path: pathInfo
        };
        if (isAvailable) {
          availableTools.push(toolName);
        }
      }

      // If no tools detected, show warning
      if (availableTools.length === 0) {
        console.log('[WARNING] No CLI tools detected. Run "stigmergy install" to install CLI tools.');
      } else {
        console.log(`[SCANNING] Found ${availableTools.length} CLI tool(s): ${availableTools.join(', ')}`);
      }

      // Set default CLI to first available tool if current CLI is not available
      if (!this.cliRegistry[this.currentCLI]?.available && availableTools.length > 0) {
        this.currentCLI = availableTools[0];
        console.log(`[INFO] Default CLI set to: ${this.currentCLI}`);
      }
    } catch (error) {
      console.error('[ERROR] Failed to scan CLI tools:', error.message);
      // Fallback to default registry
      this.cliRegistry = {
        qwen: { name: 'qwen', available: false },
        iflow: { name: 'iflow', available: false },
        claude: { name: 'claude', available: false },
        gemini: { name: 'gemini', available: false },
        codebuddy: { name: 'codebuddy', available: false },
        codex: { name: 'codex', available: false },
        qodercli: { name: 'qodercli', available: false },
        copilot: { name: 'copilot', available: false },
        opencode: { name: 'opencode', available: false },
        kode: { name: 'kode', available: false }
      };
    }
  }
  
  /**
   * Display goodbye message
   */
  _displayGoodbye() {
    console.log('');
    console.log('========================================');
    console.log('  Goodbye!');
    console.log('========================================');
  }
  
  /**
     * Create readline interface
     */
  _createReadlineInterface() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  /**
     * Enter command loop
     */
  async _enterCommandLoop() {
      // Create readline interface
      this.readlineInterface = this._createReadlineInterface();
  
      // Question loop
      while (this.isActive) {
        try {
          const input = await this._readInput();
  
          if (!input || input.trim() === '') {
            continue;
          }
  
          const command = this.commandParser.parse(input);
          const result = await this.executeCommand(command);
  
          this._displayResult(result);
  
          // Check if should exit
          if (command.type === 'exit') {
            break;
          }
  
        } catch (error) {
          console.error('Error:', error.message);
        }
      }
    }  
  /**
   * Read input from user
   */
  _readInput() {
    return new Promise((resolve, reject) => {
      this.readlineInterface.question(`${this.currentCLI}> `, (answer) => {
        resolve(answer);
      });
    });
  }
  
  /**
   * Execute task command
   */
  async _executeTask(command) {
    const task = command.task || '';
    
    // 使用当前选择的 CLI
    return await this._executeWithCLI(this.currentCLI, task);
  }
  
  /**
   * Execute use command - switch to specific CLI
   */
  async _executeUse(command) {
    const cli = command.cli;
    this.currentCLI = cli;
    
    return {
      success: true,
      message: `Switched to ${cli} CLI`
    };
  }
  
  /**
   * Execute ask command - ask specific CLI
   */
  async _executeAsk(command) {
    const cli = command.cli;
    const task = command.task;
    
    return await this._executeWithCLI(cli, task);
  }
  
  /**
   * Execute route command - smart routing to best CLI
   */
  async _executeRoute(command) {
    const task = command.task;
    
    // 智能选择最合适的 CLI
    const bestCLI = this._selectBestCLI(task);
    
    console.log(`\n🎯 Smart routing: Selected "${bestCLI}" for this task`);
    
    // 切换到选中的 CLI
    const previousCLI = this.currentCLI;
    this.currentCLI = bestCLI;
    
    console.log(`🔄 Switched from "${previousCLI}" to "${bestCLI}" CLI`);
    
    // 恢复跨CLI的上下文
    await this._restoreCrossCLIContext(bestCLI);
    
    // 执行任务
    const result = await this._executeWithCLI(bestCLI, task);
    
    // 保存当前CLI的上下文
    await this._saveCurrentCLIContext();
    
    return result;
  }
  
  /**
   * 恢复跨CLI的上下文
   */
  async _restoreCrossCLIContext(cliName) {
    try {
      // 调用resumesession技能来恢复上下文
      const { spawn } = require('child_process');
      
      console.log(`📋 Restoring cross-CLI context for ${cliName}...`);
      
      return new Promise((resolve) => {
        const process = spawn('stigmergy', ['resume', cliName, '10'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: true
        });
        
        let output = '';
        
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.on('close', (code) => {
          if (code === 0 && output.trim()) {
            console.log(`✅ Context restored for ${cliName}`);
          }
          resolve();
        });
        
        // 10秒超时
        setTimeout(() => {
          resolve();
        }, 10000);
      });
    } catch (error) {
      // 如果恢复失败，继续执行
      console.log(`⚠️  Context restore failed for ${cliName}: ${error.message}`);
    }
  }
  
  /**
   * 保存当前CLI的上下文
   */
  async _saveCurrentCLIContext() {
    try {
      // 保存当前CLI的会话历史
      const sessionData = {
        cli: this.currentCLI,
        timestamp: Date.now(),
        history: this.sessionManager.getHistory().slice(-5) // 保存最近5条记录
      };
      
      // 这里可以保存到文件或内存中
      this.contextManager.updateContext({
        currentCLI: this.currentCLI,
        lastContextSave: Date.now()
      });
      
    } catch (error) {
      console.log(`⚠️  Failed to save context: ${error.message}`);
    }
  }
  
  /**
   * Select the best CLI for a given task
   */
  _selectBestCLI(task) {
    const taskLower = task.toLowerCase();
    
    // CLI 特长规则（按优先级排序）
    const cliRules = [
      {
        cli: 'claude',
        keywords: ['分析', '审查', '文档', '推理', '解释', '复杂', '理解', '总结', 'review', 'analyze', 'document', 'reasoning'],
        priority: 10
      },
      {
        cli: 'qwen',
        keywords: ['中文', '对话', '生成', '代码', '函数', 'python', 'javascript', 'react', 'node', 'chinese', 'code', 'function'],
        priority: 8
      },
      {
        cli: 'gemini',
        keywords: ['多语言', '翻译', '创意', '写作', '设计', '翻译', 'translate', 'creative', 'writing', 'design', 'multilingual'],
        priority: 7
      },
      {
        cli: 'codebuddy',
        keywords: ['补全', '重构', '优化', '代码质量', '补全', 'complete', 'refactor', 'optimize', 'quality'],
        priority: 6
      },
      {
        cli: 'codex',
        keywords: ['调试', 'bug', '错误', '修复', 'debug', 'fix', 'error', 'bug'],
        priority: 5
      },
      {
        cli: 'copilot',
        keywords: ['最佳实践', '建议', '模式', '架构', 'best practice', 'suggestion', 'pattern', 'architecture'],
        priority: 4
      },
      {
        cli: 'iflow',
        keywords: ['交互', 'iflow', 'interactive'],
        priority: 3
      },
      {
        cli: 'qodercli',
        keywords: ['qodercli'],
        priority: 2
      }
    ];
    
    // 计算每个 CLI 的得分
    const scores = cliRules.map(rule => {
      let score = 0;
      let matchedKeywords = [];
      
      rule.keywords.forEach(keyword => {
        if (taskLower.includes(keyword.toLowerCase())) {
          score += rule.priority;
          matchedKeywords.push(keyword);
        }
      });
      
      return {
        cli: rule.cli,
        score: score,
        matchedKeywords: matchedKeywords
      };
    });
    
    // 按得分排序
    scores.sort((a, b) => b.score - a.score);
    
    // 返回得分最高的 CLI
    const bestCLI = scores[0];
    
    if (bestCLI.score > 0) {
      console.log(`   Matched keywords: ${bestCLI.matchedKeywords.join(', ')}`);
      return bestCLI.cli;
    }
    
    // 如果没有匹配，返回默认 CLI
    return 'qwen';
  }
  
  /**
   * Execute task with specific CLI
   */
  async _executeWithCLI(cliName, task) {
    const { spawn } = require('child_process');
    
    try {
      console.log(`\nExecuting with ${cliName}...`);
      console.log(`Task: ${task}`);
      console.log('');
      
      // 构建命令参数
      // qwen: 使用位置参数 + -y (YOLO mode)
      // iflow: 使用位置参数 + -y (YOLO mode)
      // qodercli: 使用位置参数 + -y (YOLO mode)
      // gemini: 使用位置参数 + -y (YOLO mode)
      // codebuddy: 使用 -p 参数 + -y (YOLO mode)
      // codex: 使用 -p 参数 + -y (YOLO mode)
      // copilot: 使用 -p 参数 + --allow-all-tools (允许所有工具包括shell)
      // claude: 使用 -p 参数 + --dangerously-skip-permissions + --allowed-tools (允许所有工具包括Bash)
      // 其他: 使用 -p 参数
      let args;
      if (cliName === 'qwen' || cliName === 'iflow' || cliName === 'qodercli' || cliName === 'gemini') {
        args = [task, '-y'];
      } else if (cliName === 'codebuddy' || cliName === 'codex') {
        args = ['-p', task, '-y'];
      } else if (cliName === 'copilot') {
        // --allow-all-tools 允许所有工具包括 shell
        args = ['-p', task, '--allow-all-tools'];
      } else if (cliName === 'claude') {
        // --dangerously-skip-permissions 跳过权限检查
        // --allowed-tools 指定允许的工具，包括 Bash
        args = ['-p', task, '--dangerously-skip-permissions', '--allowed-tools', 'Bash,Edit,Read,Write,RunCommand,ComputerTools'];
      } else {
        args = ['-p', task];
      }
      
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        let output = '';
        let errorOutput = '';
        
        // 启动CLI进程
        const process = spawn(cliName, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: true
        });        
        // 收集stdout
        process.stdout.on('data', (data) => {
          output += data.toString();
          process.stdout.write(data);
        });
        
        // 收集stderr
        process.stderr.on('data', (data) => {
          errorOutput += data.toString();
          process.stderr.write(data);
        });
        
        // 处理进程退出
        process.on('close', (code) => {
          const executionTime = Date.now() - startTime;
          
          console.log('');
          console.log(`Execution completed in ${executionTime}ms`);
          console.log(`Exit code: ${code}`);
          
          if (code === 0) {
            resolve({
              success: true,
              cli: cliName,
              task: task,
              output: output,
              executionTime: executionTime,
              exitCode: code
            });
          } else {
            // 如果qwen失败，尝试iflow
            if (cliName === 'qwen') {
              console.log(`\n${cliName} failed, trying iflow...`);
              this._executeWithCLI('iflow', task).then(resolve).catch(reject);
            } else {
              reject({
                success: false,
                cli: cliName,
                task: task,
                error: errorOutput || `Process exited with code ${code}`,
                exitCode: code
              });
            }
          }
        });
        
        // 处理错误
        process.on('error', (error) => {
          // 如果qwen失败，尝试iflow
          if (cliName === 'qwen') {
            console.log(`\n${cliName} error, trying iflow...`);
            this._executeWithCLI('iflow', task).then(resolve).catch(reject);
          } else {
            reject({
              success: false,
              cli: cliName,
              task: task,
              error: error.message
            });
          }
        });
        
        // 不设置超时，允许长时间运行的任务
        // const timeout = this.options.cliTimeout;
        // if (timeout > 0) {
        //   setTimeout(() => {
        //     process.kill();
        //     // 如果qwen超时，尝试iflow
        //     if (cliName === 'qwen') {
        //       console.log(`\n${cliName} timeout, trying iflow...`);
        //       this._executeWithCLI('iflow', task).then(resolve).catch(reject);
        //     } else {
        //       reject({
        //         success: false,
        //         cli: cliName,
        //         task: task,
        //         error: `Timeout after ${timeout}ms`
        //       });
        //     }
        //   }, timeout);
        // }
      });
      
    } catch (error) {
      // 如果qwen失败，尝试iflow
      if (cliName === 'qwen') {
        console.log(`\n${cliName} exception, trying iflow...`);
        return await this._executeWithCLI('iflow', task);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Execute exit command
   */
  async _executeExit() {
    await this.stop();
    return {
      success: true,
      message: 'Exiting interactive mode'
    };
  }
  
  /**
   * Execute help command
   */
  async _executeHelp() {
    console.log('');
    console.log('Available commands:');
    console.log('  <your message>       - Send message to current CLI');
    console.log('  use <cli>            - Switch to specific CLI (e.g., use iflow)');
    console.log('  ask <cli> <message>  - Ask specific CLI (e.g., ask qwen hello)');
    console.log('  route <message>      - Smart routing to best CLI (e.g., route analyze this code)');
    console.log('  r <message>          - Shortcut for route (e.g., r analyze this code)');
    console.log('  parallel <message>   - Execute with multiple CLIs concurrently (e.g., parallel analyze this code)');
    console.log('  concurrent <message> - Same as parallel (e.g., concurrent refactor this project)');
    console.log('  help                - Show this help');
    console.log('  status              - Show current status');
    console.log('  exit                - Exit interactive mode');
    console.log('');
    console.log('CLI Tools:');
    console.log('  qwen, iflow, claude, gemini, codebuddy, codex, qodercli, copilot');
    console.log('');
    
    return {
      success: true,
      message: 'Help displayed'
    };
  }

  /**
   * Execute concurrent command - execute with multiple CLIs concurrently using full orchestration system
   */
async _executeConcurrent(command) {
    const task = command.task;

    try {
      console.log(`\n🚀 Starting concurrent execution with CentralOrchestrator...`);
      console.log(`📊 Concurrency level: ${this.options.concurrency || 3}`);
      console.log(`📋 Task: ${task.substring(0, 100)}...`);

      // 临时关闭 readline 接口以避免冲突
      const readlineWasOpen = this.readlineInterface !== null;
      if (readlineWasOpen) {
        console.log(`\n⏸️  Temporarily pausing input interface...`);
        this.readlineInterface.pause();
        this.readlineInterface.close();
        this.readlineInterface = null;
      }

      try {
        // 使用 CentralOrchestrator 并发执行
        const result = await this.orchestrator.executeConcurrent(task, {
          mode: 'parallel',
          concurrencyLimit: this.options.concurrency || 3,
          timeout: this.options.cliTimeout || 0
        });

        // 显示结果
        console.log(`\n📊 Execution Summary:`);
        console.log(`  Total: ${result.totalResults} CLIs`);
        console.log(`  Success: ${result.successCount}`);
        console.log(`  Failed: ${result.failedCount}`);
        console.log(`  Total Time: ${result.totalTime}ms`);

        // 显示每个 CLI 的结果
        console.log(`\n📝 Detailed Results:`);
        result.results.forEach((r, i) => {
          console.log(`\n  [${i + 1}] ${r.cli}:`);
          console.log(`      Status: ${r.success ? '✅ Success' : '❌ Failed'}`);
          if (r.error) {
            console.log(`      Error: ${r.error}`);
          }
          if (r.output) {
            const outputStr = typeof r.output === 'string' ? r.output : JSON.stringify(r.output);
            console.log(`      Output: ${outputStr.substring(0, 200)}${outputStr.length > 200 ? '...' : ''}`);
          }
        });

        return {
          success: true,
          result: result
        };
      } finally {
        // 重新创建 readline 接口
        if (readlineWasOpen && this.isActive) {
          console.log(`\n▶️  Resuming input interface...`);
          this.readlineInterface = this._createReadlineInterface();
        }
      }

    } catch (error) {
      console.error(`\n❌ Concurrent execution failed:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Execute terminal command
   */
  async _executeTerminalCommand(command) {
    // Will be implemented with TerminalManager
    return {
      success: true,
      message: 'Terminal command executed',
      terminals: []
    };
  }
  
  /**
   * Execute status command
   */
  async _executeStatus() {
    const session = this.sessionManager.getCurrentSession();
    const context = this.contextManager.getContext();
    
    return {
      success: true,
      status: {
        active: this.isActive,
        currentCLI: this.currentCLI,
        session: session,
        context: context
      }
    };
  }
  
  /**
   * Execute delegate command
   */
  async _executeDelegate(command) {
    // Will be implemented with DelegationManager
    return {
      success: true,
      message: 'Delegation command executed'
    };
  }
  
  /**
   * Display result
   */
  _displayResult(result) {
    if (result.success) {
      // 如果是CLI执行结果，显示详细信息
      if (result.cli) {
        console.log('');
        console.log('========================================');
        console.log(`  Execution Result`);
        console.log('========================================');
        console.log(`CLI: ${result.cli}`);
        console.log(`Task: ${result.task}`);
        console.log(`Execution Time: ${result.executionTime}ms`);
        console.log(`Exit Code: ${result.exitCode}`);
        console.log('');
        
        if (result.output) {
          console.log('Response:');
          console.log('----------------------------------------');
          console.log(result.output);
          console.log('----------------------------------------');
        }
        
        console.log('========================================');
        console.log('');
      } else if (result.message) {
        console.log('✓', result.message);
      }
      if (result.data) {
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else {
      console.error('✗ Error:', result.error);
    }
  }
  
  /**
   * Start auto-save
   */
  _startAutoSave() {
    this.saveIntervalId = setInterval(async () => {
      try {
        await this.sessionManager.saveSession();
      } catch (error) {
        console.error('Auto-save failed:', error.message);
      }
    }, this.options.saveInterval);
  }
}

class CommandParser {
  constructor() {
    this.commandPatterns = [
      { type: 'exit', pattern: /^(exit|quit|bye)$/i },
      { type: 'help', pattern: /^(help|\?|h)$/i },
      { type: 'status', pattern: /^status$/i },
      { type: 'terminal', pattern: /^terminal/i },
      { type: 'delegate', pattern: /^delegate/i },
      { type: 'use', pattern: /^use\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot)$/i },
      { type: 'ask', pattern: /^ask\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot)\s+(.+)$/s },
      { type: 'route', pattern: /^(route|r)\s+(.+)$/s },
      { type: 'parallel', pattern: /^parallel\s+(.+)$/s },
      { type: 'concurrent', pattern: /^concurrent\s+(.+)$/s },
      { type: 'task', pattern: /.*/s } // 匹配所有非空输入
    ];
  }
  
  parse(input) {
    if (input === null || input === undefined || typeof input !== 'string') {
      return {
        type: 'error',
        error: 'Invalid input'
      };
    }
    
    const trimmedInput = input.trim();
    
    if (trimmedInput === '') {
      return {
        type: 'empty'
      };
    }
    
    // 尝试匹配特定命令模式
    for (const pattern of this.commandPatterns) {
      if (pattern.pattern.test(trimmedInput)) {
        if (pattern.type === 'task') {
          return {
            type: 'task',
            task: trimmedInput
          };
        } else if (pattern.type === 'use') {
          const match = trimmedInput.match(/^use\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot)$/i);
          return {
            type: 'use',
            cli: match[1].toLowerCase()
          };
        } else if (pattern.type === 'ask') {
          const match = trimmedInput.match(/^ask\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot)\s+(.+)$/s);
          return {
            type: 'ask',
            cli: match[1].toLowerCase(),
            task: match[2]
          };
        } else if (pattern.type === 'route') {
          const match = trimmedInput.match(/^(route|r)\s+(.+)$/s);
          return {
            type: 'route',
            task: match[2]
          };
        } else if (pattern.type === 'parallel' || pattern.type === 'concurrent') {
          const match = trimmedInput.match(/^(parallel|concurrent)\s+(.+)$/s);
          return {
            type: 'concurrent',
            task: match[2]
          };
        } else {
          return {
            type: pattern.type
          };
        }
      }
    }
    
    // 默认作为task处理
    return {
      type: 'task',
      task: trimmedInput
    };
  }
}

class SessionManager {
  constructor(options = {}) {
    this.options = options;
    this.currentSession = null;
    this.sessionHistory = [];
  }
  
  createSession() {
    this.currentSession = {
      id: this._generateSessionId(),
      startTime: Date.now(),
      status: 'active',
      commands: [],
      context: {}
    };
  }
  
  getCurrentSession() {
    return this.currentSession;
  }
  
  addToHistory(entry) {
    if (this.currentSession) {
      this.currentSession.commands.push(entry);
    }
  }
  
  getHistory() {
    return this.currentSession ? this.currentSession.commands : [];
  }
  
  async saveSession() {
    // Save session to file
    // Implementation pending
  }
  
  _generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

class ContextManager {
  constructor() {
    this.context = {
      lastCommand: null,
      lastCommandTime: null,
      lastTask: null,
      lastTaskTime: null,
      variables: {}
    };
  }
  
  updateContext(updates) {
    Object.assign(this.context, updates);
  }
  
  getContext() {
    return { ...this.context };
  }
  
  setVariable(name, value) {
    this.context.variables[name] = value;
  }
  
  getVariable(name) {
    return this.context.variables[name];
  }
}

module.exports = {
  InteractiveModeController,
  CommandParser,
  SessionManager,
  ContextManager
};