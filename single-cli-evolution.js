#!/usr/bin/env node
/**
 * 优化的单 CLI 进化系统
 *
 * 专门为单个可用 CLI (Qwen) 设计的进化策略
 * 避免需要多个 CLI 的交叉验证和竞争
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EVOLUTION_LOG = path.join(__dirname, 'single-cli-evolution-log.jsonl');
const EVOLUTION_STATE = path.join(__dirname, 'single-cli-evolution-state.json');

class SingleCLIEvolutionSystem {
  constructor() {
    this.iteration = 0;
    this.state = this.loadState();
    this.cliName = 'qwen'; // 当前唯一可用的 CLI
    this.strategies = {
      codeAnalysis: this.runCodeAnalysis.bind(this),
      codeGeneration: this.runCodeGeneration.bind(this),
      codeOptimization: this.runCodeOptimization.bind(this),
      bugDetection: this.runBugDetection.bind(this)
    };
  }

  async start() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   优化的单 CLI 进化系统                                      ║');
    console.log('║   使用 Qwen CLI 进行自主进化                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
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

        // 记录结果
        this.logEvolution(strategy, result);

        // 更新状态
        this.state.lastStrategy = strategy;
        this.state.iterations++;
        this.state.lastSuccess = result.success;
        this.saveState();

        if (result.success) {
          console.log(`\n✅ 迭代 #${this.iteration} 完成 - 成功`);
          console.log(`💡 改进已保存: ${result.outputFile || '内存中'}`);
        } else {
          console.log(`\n⚠️  迭代 #${this.iteration} 完成 - 但未生成改进`);
          console.log(`📝 原因: ${result.error || '未知'}`);
        }

        console.log(`\n💤 等待 20 秒后进行下一轮...`);
        await this.sleep(20000);

      } catch (error) {
        console.error(`\n❌ 迭代 #${this.iteration} 失败:`, error.message);
        this.logEvolution('error', { error: error.message });
        await this.sleep(20000);
      }
    }
  }

  selectStrategy() {
    const strategies = ['codeAnalysis', 'codeGeneration', 'codeOptimization', 'bugDetection'];

    if (!this.state.lastStrategy) {
      return strategies[0];
    }

    const lastIndex = strategies.indexOf(this.state.lastStrategy);
    const nextIndex = (lastIndex + 1) % strategies.length;
    return strategies[nextIndex];
  }

  async runCodeAnalysis() {
    console.log('🔍 策略 1: 代码分析');
    console.log('─'.repeat(70));

    const targetFile = this.selectTargetFile();
    console.log(`📄 目标文件: ${targetFile}`);

    const task = `Analyze this JavaScript file and provide a detailed analysis: ${targetFile}

Focus on:
1. Code complexity and structure
2. Potential bugs or issues
3. Performance optimization opportunities
4. Best practices violations

Respond with a structured analysis including specific line numbers where relevant.`;

    try {
      const analysis = await this.executeCLI(task);

      // Save analysis
      const timestamp = Date.now();
      const outputFile = path.join(__dirname, `analysis-${timestamp}.md`);
      fs.writeFileSync(outputFile, `# Code Analysis - ${new Date().toISOString()}\n\n${analysis}`);

      console.log(`\n✅ 分析完成:`);
      console.log(`   📄 保存到: ${outputFile}`);
      console.log(`   📊 分析长度: ${analysis.length} 字符`);

      return {
        success: true,
        strategy: 'code-analysis',
        targetFile,
        outputFile,
        analysisLength: analysis.length
      };

    } catch (error) {
      return { success: false, error: error.message, strategy: 'code-analysis' };
    }
  }

  async runCodeGeneration() {
    console.log('✨ 策略 2: 代码生成');
    console.log('─'.repeat(70));

    const task = `Generate a JavaScript utility function with these requirements:

1. Function name: validateEmail
2. Purpose: Validate email addresses with comprehensive checks
3. Features:
   - Check for valid email format
   - Support international domains
   - Return object with {valid: boolean, errors: string[]}
4. Include JSDoc documentation
5. Include 3 example test cases in comments

Provide ONLY the executable JavaScript code, no explanations.`;

    try {
      const code = await this.executeCLI(task);

      // Save generated code
      const timestamp = Date.now();
      const outputFile = path.join(__dirname, `generated-${timestamp}.js`);
      fs.writeFileSync(outputFile, code);

      console.log(`\n✅ 代码生成完成:`);
      console.log(`   📄 保存到: ${outputFile}`);
      console.log(`   📊 代码长度: ${code.length} 字符`);

      return {
        success: true,
        strategy: 'code-generation',
        outputFile,
        codeLength: code.length
      };

    } catch (error) {
      return { success: false, error: error.message, strategy: 'code-generation' };
    }
  }

  async runCodeOptimization() {
    console.log('⚡ 策略 3: 代码优化');
    console.log('─'.repeat(70));

    const targetFile = this.selectTargetFile();
    console.log(`📄 目标文件: ${targetFile}`);

    const task = `Read this file: ${targetFile}

Identify the most inefficient function or code block and provide an optimized version.

Requirements:
1. Keep the same functionality
2. Improve performance (time/space complexity)
3. Add comments explaining the optimization
4. Include before/after complexity analysis

Provide the optimized code with explanations.`;

    try {
      const optimization = await this.executeCLI(task);

      // Save optimization
      const timestamp = Date.now();
      const outputFile = path.join(__dirname, `optimization-${timestamp}.md`);
      fs.writeFileSync(outputFile, `# Code Optimization - ${new Date().toISOString()}\n\n${optimization}`);

      console.log(`\n✅ 优化建议完成:`);
      console.log(`   📄 保存到: ${outputFile}`);
      console.log(`   📊 建议长度: ${optimization.length} 字符`);

      return {
        success: true,
        strategy: 'code-optimization',
        targetFile,
        outputFile,
        optimizationLength: optimization.length
      };

    } catch (error) {
      return { success: false, error: error.message, strategy: 'code-optimization' };
    }
  }

  async runBugDetection() {
    console.log('🐛 策略 4: Bug 检测');
    console.log('─'.repeat(70));

    const targetFile = this.selectTargetFile();
    console.log(`📄 目标文件: ${targetFile}`);

    const task = `Analyze this file for potential bugs: ${targetFile}

Look for:
1. Unhandled edge cases
2. Missing error handling
3. Race conditions or async issues
4. Memory leaks
5. Security vulnerabilities
6. Type coercion issues

For each potential bug found, provide:
- Severity (Critical/High/Medium/Low)
- Location (line numbers if possible)
- Explanation
- Suggested fix

Respond in structured format.`;

    try {
      const bugReport = await this.executeCLI(task);

      // Save bug report
      const timestamp = Date.now();
      const outputFile = path.join(__dirname, `bugs-${timestamp}.md`);
      fs.writeFileSync(outputFile, `# Bug Report - ${new Date().toISOString()}\n\n${bugReport}`);

      console.log(`\n✅ Bug 检测完成:`);
      console.log(`   📄 保存到: ${outputFile}`);
      console.log(`   📊 报告长度: ${bugReport.length} 字符`);

      return {
        success: true,
        strategy: 'bug-detection',
        targetFile,
        outputFile,
        bugReportLength: bugReport.length
      };

    } catch (error) {
      return { success: false, error: error.message, strategy: 'bug-detection' };
    }
  }

  executeCLI(prompt) {
    return new Promise((resolve, reject) => {
      const quotedPrompt = `"${prompt.replace(/"/g, '\\"')}"`;
      const command = `stigmergy ${this.cliName} ${quotedPrompt}`;

      console.log(`   📡 调用 ${this.cliName} CLI...`);

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
          console.log(`   ✅ ${this.cliName} 响应成功`);
          resolve(output);
        } else {
          console.log(`   ❌ ${this.cliName} 失败: ${errorOutput.substring(0, 100)}`);
          reject(new Error(`CLI failed: ${errorOutput || output}`));
        }
      });

      child.on('error', (error) => {
        console.log(`   ❌ CLI 错误: ${error.message}`);
        reject(new Error(`Failed to spawn CLI: ${error.message}`));
      });

      setTimeout(() => {
        child.kill();
        reject(new Error('Timeout after 60 seconds'));
      }, 60000);
    });
  }

  selectTargetFile() {
    const targets = [
      'src/core/soul_engine/SoulEngine.js',
      'src/core/smart_router.js',
      'src/core/coordination/collaboration_coordinator.js',
      'src/cli/commands/project.js',
      'src/cli/router-beta.js'
    ];
    return targets[Math.floor(Math.random() * targets.length)];
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
      lastSuccess: false
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
  const system = new SingleCLIEvolutionSystem();
  system.start().catch(error => {
    console.error('系统错误:', error);
    process.exit(1);
  });
}

module.exports = { SingleCLIEvolutionSystem };
