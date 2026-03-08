#!/usr/bin/env node
/**
 * 去中心化的多智能体自主进化系统
 *
 * 架构特点：
 * - 没有中央控制器
 * - 每个 CLI 自主运行、自主进化
 * - 通过共享资源（soul.md, 会话历史）间接协作
 * - 通过结果比较间接竞争
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 共享资源路径
const SHARED_RESOURCES = {
  soulMd: path.join(__dirname, 'SOUL.md'),
  conversationHistory: path.join(__dirname, 'conversation-history.jsonl'),
  agentState: path.join(__dirname, 'agent-states'),
  evolutionLog: path.join(__dirname, 'decentralized-evolution.jsonl')
};

class DecentralizedAgent {
  constructor(cliName) {
    this.cliName = cliName;
    this.stateDir = path.join(SHARED_RESOURCES.agentState, cliName);
    this.state = this.loadState();
    this.soul = this.loadSharedSoul();
  }

  /**
   * 智能体自主运行
   * - 读取共享的 soul.md
   * - 读取会话历史
   * - 决定自己的进化策略
   * - 执行进化
   * - 更新自己的状态
   */
  async run() {
    console.log(`\n🤖 ${this.cliName} 开始自主运行...`);

    while (true) {
      try {
        // 1. 读取共享上下文
        const sharedContext = await this.getSharedContext();

        // 2. 读取会话历史（学习其他智能体的经验）
        const conversationHistory = await this.getConversationHistory();

        // 3. 自主决定进化策略
        const evolutionStrategy = await this.decideEvolutionStrategy(sharedContext, conversationHistory);

        // 4. 执行进化
        const evolutionResult = await this.evolve(evolutionStrategy, sharedContext);

        // 5. 更新自己的状态
        this.updateState(evolutionResult);

        // 6. 记录到会话历史（间接协作）
        this.logToConversation(evolutionResult);

        console.log(`✅ ${this.cliName} 进化完成`);

        // 等待后继续
        await this.sleep(30000 + Math.random() * 30000); // 随机 30-60 秒

      } catch (error) {
        console.error(`❌ ${this.cliName} 进化失败:`, error.message);
        await this.sleep(60000);
      }
    }
  }

  /**
   * 读取共享的 soul.md
   */
  loadSharedSoul() {
    if (fs.existsSync(SHARED_RESOURCES.soulMd)) {
      return fs.readFileSync(SHARED_RESOURCES.soulMd, 'utf-8');
    }

    // 如果不存在，创建默认的共享 soul.md
    const defaultSoul = `# Stigmergy 智能体共享 SOUL

## 共同使命
推动 Stigmergy 系统的持续进化和优化

## 共享价值观
- 开放协作：通过共享上下文协作
- 持续学习：从会话历史中学习
- 优胜劣汰：通过结果比较竞争
- 去中心化：没有中央控制器

## 进化目标
1. 提高代码质量和性能
2. 自动发现和修复 bug
3. 生成更好的技能文件
4. 优化系统架构
5. 提升用户体验
`;

    fs.writeFileSync(SHARED_RESOURCES.soulMd, defaultSoul);
    return defaultSoul;
  }

  /**
   * 获取共享上下文
   */
  async getSharedContext() {
    const context = {
      soul: this.soul,
      recentEvolutions: [],
      otherAgentsSuccess: []
    };

    // 读取最近的进化日志
    if (fs.existsSync(SHARED_RESOURCES.evolutionLog)) {
      const logs = fs.readFileSync(SHARED_RESOURCES.evolutionLog, 'utf-8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-20); // 最近 20 条

      logs.forEach(log => {
        try {
          const entry = JSON.parse(log);
          if (entry.agent !== this.cliName) {
            context.otherAgentsSuccess.push({
              agent: entry.agent,
              strategy: entry.strategy,
              success: entry.success
            });
          }
        } catch (e) {
          // 忽略解析错误
        }
      });
    }

    return context;
  }

  /**
   * 获取会话历史（学习其他智能体的经验）
   */
  async getConversationHistory() {
    const history = [];

    if (fs.existsSync(SHARED_RESOURCES.conversationHistory)) {
      const lines = fs.readFileSync(SHARED_RESOURCES.conversationHistory, 'utf-8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-50); // 最近 50 条

      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          // 只读取其他智能体的历史，不读取自己的
          if (entry.agent !== this.cliName) {
            history.push(entry);
          }
        } catch (e) {
          // 忽略解析错误
        }
      });
    }

    return history;
  }

  /**
   * 自主决定进化策略
   * 基于共享的 soul.md 和会话历史
   */
  async decideEvolutionStrategy(sharedContext, conversationHistory) {
    // 分析其他智能体的成功模式
    const successfulStrategies = conversationHistory
      .filter(entry => entry.success)
      .map(entry => entry.strategy);

    // 选择策略：可以采用其他智能体成功的策略，或者尝试新策略
    const strategies = [
      'code-optimization',
      'bug-detection',
      'skill-generation',
      'architecture-improvement',
      'performance-tuning'
    ];

    // 30% 概率跟随成功策略，70% 概率自主选择
    if (successfulStrategies.length > 0 && Math.random() < 0.3) {
      const randomSuccess = successfulStrategies[Math.floor(Math.random() * successfulStrategies.length)];
      return randomSuccess;
    }

    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  /**
   * 执行进化
   */
  async evolve(strategy, sharedContext) {
    console.log(`   🔄 ${this.cliName} 执行策略: ${strategy}`);

    let task = '';
    let outputFile = '';

    switch (strategy) {
      case 'code-optimization':
        task = await this.generateOptimizationTask(sharedContext);
        outputFile = `optimization-${Date.now()}.md`;
        break;

      case 'bug-detection':
        task = await this.generateBugDetectionTask(sharedContext);
        outputFile = `bugs-${Date.now()}.md`;
        break;

      case 'skill-generation':
        task = await this.generateSkillGenerationTask(sharedContext);
        outputFile = `skill-${Date.now()}.js`;
        break;

      case 'architecture-improvement':
        task = await this.generateArchitectureTask(sharedContext);
        outputFile = `architecture-${Date.now()}.md`;
        break;

      case 'performance-tuning':
        task = await this.generatePerformanceTask(sharedContext);
        outputFile = `performance-${Date.now()}.md`;
        break;

      default:
        task = 'Analyze the codebase and suggest improvements.';
        outputFile = `analysis-${Date.now()}.md`;
    }

    // 执行任务
    try {
      const result = await this.executeCLI(task);

      // 保存结果
      const outputPath = path.join(this.stateDir, outputFile);
      fs.writeFileSync(outputPath, result);

      return {
        success: true,
        strategy,
        outputFile: outputPath,
        resultLength: result.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        strategy,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 生成代码优化任务
   */
  async generateOptimizationTask(sharedContext) {
    const targets = [
      'src/core/soul_engine/SoulEngine.js',
      'src/core/smart_router.js',
      'src/core/coordination/collaboration_coordinator.js'
    ];
    const target = targets[Math.floor(Math.random() * targets.length)];

    return `Analyze and optimize: ${target}

Focus on:
1. Performance improvements
2. Code readability
3. Best practices
4. Bug fixes

Provide specific code changes with explanations.`;
  }

  /**
   * 生成 Bug 检测任务
   */
  async generateBugDetectionTask(sharedContext) {
    const targets = [
      'src/core/soul_engine/SoulEngine.js',
      'src/core/smart_router.js',
      'src/cli/commands/project.js'
    ];
    const target = targets[Math.floor(Math.random() * targets.length)];

    return `Detect bugs and issues in: ${target}

Look for:
1. Logic errors
2. Edge cases not handled
3. Resource leaks
4. Security vulnerabilities
5. Performance issues

For each bug found, provide:
- Severity (Critical/High/Medium/Low)
- Location (line numbers)
- Explanation
- Suggested fix`;
  }

  /**
   * 生成技能生成任务
   */
  async generateSkillGenerationTask(sharedContext) {
    return `Generate a new Stigmergy skill based on the shared soul.md:

${sharedContext.soul}

Create a skill that:
1. Aligns with the shared mission
2. Provides unique value
3. Is practical and useful
4. Includes proper documentation

Provide the complete skill file with:
- Skill description
- Trigger patterns
- Execution logic
- Error handling`;
  }

  /**
   * 生成架构改进任务
   */
  async generateArchitectureTask(sharedContext) {
    return `Analyze the Stigmergy architecture and suggest improvements.

Focus on:
1. Modularity
2. Scalability
3. Maintainability
4. Extensibility

Provide:
- Current architecture analysis
- Identified issues
- Specific improvements
- Migration plan`;
  }

  /**
   * 生成性能优化任务
   */
  async generatePerformanceTask(sharedContext) {
    return `Analyze Stigmergy performance and suggest optimizations.

Focus on:
1. CLI execution speed
2. Memory usage
3. I/O operations
4. Concurrency

Provide:
- Performance bottlenecks
- Optimization strategies
- Code examples
- Expected improvements`;
  }

  /**
   * 执行 CLI
   */
  executeCLI(prompt) {
    return new Promise((resolve, reject) => {
      const quotedPrompt = `"${prompt.replace(/"/g, '\\"')}"`;
      const command = `stigmergy ${this.cliName} ${quotedPrompt}`;

      const child = spawn(command, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0 && output) {
          resolve(output);
        } else {
          reject(new Error(`CLI failed: ${errorOutput || output}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn CLI: ${error.message}`));
      });

      setTimeout(() => {
        child.kill();
        reject(new Error('Timeout'));
      }, 120000); // 2 分钟超时
    });
  }

  /**
   * 更新自己的状态
   */
  updateState(evolutionResult) {
    // 确保状态目录存在
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }

    // 更新状态
    this.state.lastEvolution = evolutionResult;
    this.state.evolutionCount = (this.state.evolutionCount || 0) + 1;
    this.state.lastUpdate = new Date().toISOString();

    // 保存状态
    const stateFile = path.join(this.stateDir, 'state.json');
    fs.writeFileSync(stateFile, JSON.stringify(this.state, null, 2));
  }

  /**
   * 记录到会话历史（间接协作）
   */
  logToConversation(evolutionResult) {
    const entry = {
      timestamp: new Date().toISOString(),
      agent: this.cliName,
      strategy: evolutionResult.strategy,
      success: evolutionResult.success,
      result: evolutionResult.success ? {
        file: evolutionResult.outputFile,
        length: evolutionResult.resultLength
      } : {
        error: evolutionResult.error
      }
    };

    // 追加到会话历史
    fs.appendFileSync(SHARED_RESOURCES.conversationHistory, JSON.stringify(entry) + '\n');

    // 同时记录到进化日志
    const evoEntry = {
      timestamp: entry.timestamp,
      agent: this.cliName,
      strategy: entry.strategy,
      success: entry.success,
      result: entry.result
    };
    fs.appendFileSync(SHARED_RESOURCES.evolutionLog, JSON.stringify(evoEntry) + '\n');
  }

  /**
   * 加载自己的状态
   */
  loadState() {
    const stateFile = path.join(this.stateDir, 'state.json');
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    }
    return {
      cliName: this.cliName,
      createdAt: new Date().toISOString(),
      evolutionCount: 0
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 启动去中心化的多智能体进化系统
 *
 * 关键特点：
 * - 没有中央控制器
 * - 每个智能体独立运行
 * - 通过共享资源间接协作
 * - 通过结果比较间接竞争
 */
async function startDecentralizedEvolution() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   去中心化的多智能体自主进化系统                             ║');
  console.log('║   没有中央控制器                                            ║');
  console.log('║   通过共享资源间接协作                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // 可用的 CLI 列表
  const availableCLIs = ['qwen', 'codebuddy']; // 可以添加更多

  console.log(`🤖 启动 ${availableCLIs.length} 个智能体:`);
  availableCLIs.forEach(cli => console.log(`   - ${cli}`));
  console.log('');
  console.log(`📁 共享资源:`);
  console.log(`   - SOUL.md: ${SHARED_RESOURCES.soulMd}`);
  console.log(`   - 会话历史: ${SHARED_RESOURCES.conversationHistory}`);
  console.log(`   - 智能体状态: ${SHARED_RESOURCES.agentState}`);
  console.log('');

  // 创建共享目录
  if (!fs.existsSync(SHARED_RESOURCES.agentState)) {
    fs.mkdirSync(SHARED_RESOURCES.agentState, { recursive: true });
  }

  // 启动每个智能体（独立进程）
  const agents = availableCLIs.map(cliName => {
    const agent = new DecentralizedAgent(cliName);

    // 在独立的后台进程中运行
    const agentProcess = agent.run().catch(error => {
      console.error(`❌ 智能体 ${cliName} 崩溃:`, error.message);
    });

    return {
      cliName,
      agent,
      process: agentProcess
    };
  });

  console.log('✅ 所有智能体已启动');
  console.log('');
  console.log('💡 工作原理:');
  console.log('   1. 每个智能体独立运行，自主决策');
  console.log('   2. 读取共享的 soul.md 了解共同目标');
  console.log('   3. 读取会话历史学习其他智能体的经验');
  console.log('   4. 记录自己的进化到会话历史');
  console.log('   5. 通过共享上下文间接协作和竞争');
  console.log('');
  console.log('📊 监控命令:');
  console.log('   tail -f conversation-history.jsonl  # 查看会话历史');
  console.log('   tail -f decentralized-evolution.jsonl  # 查看进化日志');
  console.log('');

  // 等待所有智能体（实际上它们会一直运行）
  await Promise.all(agents.map(a => a.process));
}

// 启动系统
if (require.main === module) {
  startDecentralizedEvolution().catch(error => {
    console.error('系统错误:', error);
    process.exit(1);
  });
}

module.exports = { DecentralizedAgent, startDecentralizedEvolution };
