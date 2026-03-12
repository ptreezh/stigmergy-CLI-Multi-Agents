#!/usr/bin/env node
/**
 * 真实的 AI 自主进化系统
 *
 * 结合三种进化策略：
 * A. Cross-validation (交叉验证)
 * B. Collaboration (协作进化)
 * C. Competition (竞争进化)
 *
 * 使用真实的 LLM 推理，不是脚本自动化
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EVOLUTION_LOG = path.join(__dirname, 'evolution-log.jsonl');
const EVOLUTION_STATE = path.join(__dirname, 'evolution-state.json');

class AutonomousEvolutionSystem {
  constructor() {
    this.iteration = 0;
    this.state = this.loadState();
    this.availableCLIs = [];
    this.strategies = {
      crossValidation: this.runCrossValidation.bind(this),
      collaboration: this.runCollaboration.bind(this),
      competition: this.runCompetition.bind(this)
    };
  }

  async start() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   真实的 AI 自主进化系统                                     ║');
    console.log('║   使用 Stigmergy 多 CLI 协调                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    // 前置检查
    console.log('\n🔍 执行前置检查...');
    const hasCLI = await this.checkCLIAvailability();
    if (!hasCLI) {
      console.error('❌ 无可用CLI工具，进化系统无法启动');
      console.log('💡 请运行: stigmergy scan 检查CLI状态');
      process.exit(1);
    }
    console.log(`   ✅ 发现 ${this.availableCLIs.length} 个可用CLI: ${this.availableCLIs.join(', ')}`);
    console.log('');

    while (true) {
      this.iteration++;
      console.log(`\n╔════════════════════════════════════════════════════════════╗`);
      console.log(`║   进化迭代 #${this.iteration}                                          ║`);
      console.log(`╚════════════════════════════════════════════════════════════╝`);
      console.log('');

      try {
        // 选择进化策略
        const strategy = this.selectStrategy();
        console.log(`📋 策略: ${strategy}`);
        console.log(`🔄 上次迭代: ${this.state.lastStrategy || '无'}`);
        console.log('');

        // 执行策略
        const result = await this.strategies[strategy]();

        // 更新策略统计
        this.updateStrategyStats(strategy, result.success);

        // 记录结果
        this.logEvolution(strategy, result);

        // 更新状态
        this.state.lastStrategy = strategy;
        this.state.iterations++;
        this.state.lastSuccess = result.success;
        this.saveState();

        console.log(`\n✅ 迭代 #${this.iteration} 完成`);
        console.log(`💡 等待 30 秒后进行下一轮...`);

        await this.sleep(30000);

      } catch (error) {
        console.error(`\n❌ 迭代 #${this.iteration} 失败:`, error.message);
        this.logEvolution('error', { error: error.message });
        await this.sleep(30000);
      }
    }
  }

  async checkCLIAvailability() {
    // 优先检测已确认可用的CLI，按可靠性排序
    const clis = ['iflow', 'codebuddy', 'kilocode', 'qodercli', 'qwen', 'claude', 'gemini', 'copilot'];
    const available = [];

    console.log('   🔍 检测可用CLI工具...');

    for (const cli of clis) {
      try {
        // 使用 stigmergy 调用方式，发送简单prompt测试
        // 增加超时到15秒，因为某些CLI启动较慢
        const result = await this.testCLICall(cli, 15000);
        if (result.success) {
          available.push(cli);
          console.log(`   ✅ ${cli} 可用`);
        } else {
          console.log(`   ⚠️ ${cli} 不可用: ${result.error}`);
        }
      } catch (e) {
        console.log(`   ⚠️ ${cli} 检测失败: ${e.message}`);
      }
    }

    this.availableCLIs = available;
    
    if (available.length === 0) {
      console.log('\n   💡 提示: 请确保至少一个CLI工具已配置API密钥');
      return false;
    }
    
    return true;
  }

  async testCLICall(cliName, timeout = 8000) {
    return new Promise((resolve) => {
      const child = spawn(`stigmergy ${cliName} "test"`, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        windowsHide: true
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({ success: false, error: 'Timeout' });
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        // 只要返回了内容就算成功（不管退出码）
        if (output && output.length > 10 && !errorOutput.includes('quota exceeded') && !errorOutput.includes('not logged in')) {
          resolve({ success: true, output });
        } else if (errorOutput.includes('quota exceeded')) {
          resolve({ success: false, error: 'Quota exceeded' });
        } else if (errorOutput.includes('not logged in')) {
          resolve({ success: false, error: 'Not logged in' });
        } else {
          resolve({ success: false, error: `Exit code ${code}` });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        resolve({ success: false, error: error.message });
      });
    });
  }

  executeCLIWithTimeout(cliName, prompt, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout after ${timeout}ms`));
      }, timeout);

      this.executeCLI(cliName, prompt)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  selectStrategy() {
    const strategies = ['crossValidation', 'collaboration', 'competition'];

    // 初始化成功率跟踪
    if (!this.state.strategyStats) {
      this.state.strategyStats = {};
      strategies.forEach(s => this.state.strategyStats[s] = { success: 0, total: 0, lastFail: 0 });
    }

    // 排除最近连续失败超过2次的策略
    const available = strategies.filter(s => {
      const stats = this.state.strategyStats[s];
      return stats.total - stats.lastFail < 3;
    });

    if (available.length === 0) {
      // 所有策略都失败，重置并继续
      strategies.forEach(s => this.state.strategyStats[s].lastFail = 0);
      return strategies[0];
    }

    // 加权随机选择
    const weights = available.map(s => {
      const stats = this.state.strategyStats[s];
      const rate = stats.total > 0 ? stats.success / stats.total : 0.33;
      return Math.max(0.1, rate);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < available.length; i++) {
      random -= weights[i];
      if (random <= 0) return available[i];
    }

    return available[0];
  }

  updateStrategyStats(strategy, success) {
    if (!this.state.strategyStats) {
      this.state.strategyStats = {};
    }
    if (!this.state.strategyStats[strategy]) {
      this.state.strategyStats[strategy] = { success: 0, total: 0, lastFail: 0 };
    }

    const stats = this.state.strategyStats[strategy];
    stats.total++;
    if (success) {
      stats.success++;
      stats.lastFail = 0;
    } else {
      stats.lastFail++;
    }
  }

  async runCrossValidation() {
    console.log('🔍 策略 A: 交叉验证');
    console.log('─'.repeat(70));

    const targetFile = this.selectTargetFile();
    console.log(`📄 目标文件: ${targetFile}`);

    const task = `Analyze the code quality and suggest improvements for: ${targetFile}

Respond with JSON format:
{
  "complexity": <score 0-100>,
  "issues": ["issue1", "issue2", "issue3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "priority": "high|medium|low"
}`;

    // 使用可用CLI
    const clis = this.availableCLIs.slice(0, 2);
    if (clis.length < 2) {
      clis.push('qwen', 'iflow');
    }
    const results = await this.executeConcurrent(clis, task);

    // 比较结果
    console.log('\n📊 交叉验证结果:');

    const analyses = [];
    for (const result of results) {
      if (result.success) {
        try {
          const analysis = this.extractJSON(result.output);
          analyses.push({ cli: result.cli, ...analysis });
          console.log(`   ${result.cli}: 复杂度 ${analysis.complexity}/100, 问题 ${analysis.issues.length} 个`);
        } catch (error) {
          console.log(`   ${result.cli}: 无法解析输出`);
        }
      }
    }

    if (analyses.length >= 2) {
      // 计算共识
      const avgComplexity = analyses.reduce((sum, a) => sum + a.complexity, 0) / analyses.length;
      const allIssues = analyses.flatMap(a => a.issues);
      const uniqueIssues = [...new Set(allIssues)];

      console.log(`\n💡 共识分析:`);
      console.log(`   平均复杂度: ${avgComplexity.toFixed(1)}/100`);
      console.log(`   共同问题: ${uniqueIssues.length} 个`);

      return {
        success: true,
        strategy: 'cross-validation',
        participants: analyses.length,
        avgComplexity,
        uniqueIssues: uniqueIssues.length
      };
    }

    return { success: false, error: 'Not enough valid analyses' };
  }

  async runCollaboration() {
    console.log('🤝 策略 B: 协作进化');
    console.log('─'.repeat(70));

    const tasks = [
      {
        role: 'Code Generator',
        prompt: `Generate a JavaScript function to validate passwords with these requirements:
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Return {valid: boolean, errors: string[]}
Include JSDoc documentation.

Provide ONLY the JavaScript code.`,
        output: 'password-validator.js'
      },
      {
        role: 'Test Writer',
        prompt: `Write comprehensive Jest tests for a password validator function that:
- Tests valid passwords
- Tests each requirement separately
- Tests edge cases
- Tests error messages

Provide ONLY the Jest test code.`,
        output: 'password-validator.test.js'
      }
    ];

    // 选择可用CLI
    const selectedCLI = this.availableCLIs[0] || 'qwen';

    const results = [];
    for (const task of tasks) {
      console.log(`\n📋 ${task.role}:`);

      try {
        const output = await this.executeCLI(selectedCLI, task.prompt);
        const filePath = path.join(__dirname, task.output);
        fs.writeFileSync(filePath, output);

        console.log(`   ✅ Generated: ${task.output} (${output.length} chars)`);
        results.push({ task: task.role, success: true, file: task.output });

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        results.push({ task: task.role, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount === results.length,
      strategy: 'collaboration',
      tasksCompleted: successCount,
      totalTasks: results.length
    };
  }

  async runCompetition() {
    console.log('🏆 策略 C: 竞争进化');
    console.log('─'.repeat(70));

    const task = `Write a JavaScript function to parse and validate URLs.

Requirements:
- Parse URL into protocol, host, path, query params
- Validate URL format
- Handle edge cases (missing protocol, invalid characters)
- Return {valid: boolean, parsed: object, errors: string[]}
- Include JSDoc documentation

Provide ONLY the JavaScript function, no explanations.`;

    // 使用可用CLI
    const clis = this.availableCLIs.length >= 2
      ? this.availableCLIs.slice(0, 2)
      : ['qwen', 'iflow'];
    const results = await this.executeConcurrent(clis, task);

    console.log('\n📊 竞争结果:');

    const evaluated = [];
    for (const result of results) {
      if (result.success) {
        const score = this.evaluateCode(result.output);
        evaluated.push({ cli: result.cli, score, code: result.output });

        console.log(`   ${result.cli}: ${score.total}/100`);
        console.log(`      - Correctness: ${score.correctness}/40`);
        console.log(`      - Robustness: ${score.robustness}/30`);
        console.log(`      - Documentation: ${score.documentation}/20`);
        console.log(`      - Best Practices: ${score.bestPractices}/10`);
      }
    }

    if (evaluated.length > 0) {
      const winner = evaluated.sort((a, b) => b.score.total - a.score.total)[0];

      // Save winner
      const winnerPath = path.join(__dirname, 'winner-url-parser.js');
      fs.writeFileSync(winnerPath, winner.code);

      console.log(`\n🏆 获胜者: ${winner.cli} (${winner.score.total}/100)`);
      console.log(`✅ 保存到: ${winnerPath}`);

      return {
        success: true,
        strategy: 'competition',
        winner: winner.cli,
        score: winner.score.total,
        participants: evaluated.length
      };
    }

    return { success: false, error: 'No valid solutions' };
  }

  async executeConcurrent(clis, task) {
    const promises = clis.map(cli => {
      return this.executeCLI(cli, task).then(output => ({
        cli,
        success: true,
        output
      })).catch(error => ({
        cli,
        success: false,
        error: error.message
      }));
    });

    return Promise.all(promises);
  }

  async executeCLI(cliName, prompt, retries = 2) {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this._executeCLIOnce(cliName, prompt);
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          console.log(`   🔄 重试 ${attempt}/${retries}...`);
          await this.sleep(2000);
        }
      }
    }
    throw lastError;
  }

  async _executeCLIOnce(cliName, prompt) {
    return new Promise((resolve, reject) => {
      const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const command = `stigmergy ${cliName} "${escapedPrompt}"`;

      console.log(`   📡 Executing: ${cliName}`);

      const child = spawn(command, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        windowsHide: true
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Timeout after 60 seconds'));
      }, 60000);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0 && output) {
          console.log(`   ✅ ${cliName} completed`);
          resolve(output);
        } else {
          console.log(`   ❌ ${cliName} failed (code ${code})`);
          reject(new Error(errorOutput || `Exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  selectTargetFile() {
    // 选择需要进化的目标文件
    const targets = [
      'src/core/soul_engine/SoulEngine.js',
      'src/core/smart_router.js',
      'src/core/coordination/collaboration_coordinator.js'
    ];
    return targets[Math.floor(Math.random() * targets.length)];
  }

  extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('No JSON found in output');
  }

  evaluateCode(code) {
    // 使用改进的评估逻辑
    const { evaluateCode: improvedEvaluate } = require('./scripts/compete-improved');
    return improvedEvaluate(code);
  }
  
  // 保留原方法作为备份
  evaluateCodeLegacy(code) {
    let score = {
      correctness: 0,
      robustness: 0,
      documentation: 0,
      bestPractices: 10,
      total: 0
    };

    if (code.includes('function') || code.includes('=>')) score.correctness += 15;
    if (code.includes('return ')) score.correctness += 15;
    if (code.includes('if') || code.includes('switch')) score.correctness += 10;

    if (code.includes('if') || code.includes('typeof')) score.robustness += 10;
    if (code.includes('try') || code.includes('catch')) score.robustness += 10;
    if (code.includes('null') || code.includes('undefined')) score.robustness += 10;

    if (code.includes('/**') || code.includes('//')) score.documentation += 10;
    if (code.includes('@param') || code.includes('@returns') || code.includes('@return')) score.documentation += 10;

    if (code.includes('const ') || code.includes('let ')) score.bestPractices += 5;
    if (!code.includes('var ')) score.bestPractices += 5;

    score.total = score.correctness + score.robustness + score.documentation + score.bestPractices;
    return score;
  }

  logEvolution(strategy, result) {
    const log = {
      timestamp: new Date().toISOString(),
      iteration: this.iteration,
      strategy,
      result
    };

    fs.appendFileSync(EVOLUTION_LOG, JSON.stringify(log) + '\n');
    console.log(`\n📝 进化日志已更新: ${EVOLUTION_LOG}`);
  }

  loadState() {
    if (fs.existsSync(EVOLUTION_STATE)) {
      return JSON.parse(fs.readFileSync(EVOLUTION_STATE, 'utf-8'));
    }
    return {
      iterations: 0,
      lastStrategy: null,
      lastSuccess: false,
      strategyStats: {}
    };
  }

  saveState() {
    fs.writeFileSync(EVOLUTION_STATE, JSON.stringify(this.state, null, 2));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 启动系统
if (require.main === module) {
  const system = new AutonomousEvolutionSystem();
  system.start().catch(error => {
    console.error('系统错误:', error);
    process.exit(1);
  });
}

module.exports = { AutonomousEvolutionSystem };