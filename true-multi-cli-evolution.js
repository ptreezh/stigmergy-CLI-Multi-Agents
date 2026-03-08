#!/usr/bin/env node
/**
 * 真正的多 CLI 协同进化系统
 *
 * 使用多个实际可用的 CLI (qwen, codebuddy) 进行:
 * - 交叉验证 (Cross-validation)
 * - 协作进化 (Collaboration)
 * - 竞争进化 (Competition)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EVOLUTION_LOG = path.join(__dirname, 'multi-cli-evolution-log.jsonl');
const EVOLUTION_STATE = path.join(__dirname, 'multi-cli-evolution-state.json');

class TrueMultiCLIEvolutionSystem {
  constructor() {
    this.iteration = 0;
    this.state = this.loadState();
    // 真正可用的 CLI 列表（已测试确认）
    this.availableCLIs = ['qwen', 'codebuddy'];
    this.strategies = {
      crossValidation: this.runCrossValidation.bind(this),
      collaboration: this.runCollaboration.bind(this),
      competition: this.runCompetition.bind(this)
    };
  }

  async start() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   真正的多 CLI 协同进化系统                                 ║');
    console.log('║   可用 CLI: Qwen, CodeBuddy                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🤖 可用 CLI: ${this.availableCLIs.join(', ')}`);
    console.log(`📊 总数: ${this.availableCLIs.length} 个`);
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
        } else {
          console.log(`\n⚠️  迭代 #${this.iteration} 完成 - 但未达成目标`);
        }

        console.log(`\n💤 等待 25 秒后进行下一轮...`);
        await this.sleep(25000);

      } catch (error) {
        console.error(`\n❌ 迭代 #${this.iteration} 失败:`, error.message);
        this.logEvolution('error', { error: error.message });
        await this.sleep(25000);
      }
    }
  }

  selectStrategy() {
    const strategies = ['crossValidation', 'collaboration', 'competition'];

    if (!this.state.lastStrategy) {
      return strategies[0];
    }

    const lastIndex = strategies.indexOf(this.state.lastStrategy);
    const nextIndex = (lastIndex + 1) % strategies.length;
    return strategies[nextIndex];
  }

  /**
   * 策略 A: 交叉验证
   * 多个 CLI 分析同一代码，比较结果
   */
  async runCrossValidation() {
    console.log('🔍 策略 A: 交叉验证 (Cross-Validation)');
    console.log('─'.repeat(70));

    const targetFile = this.selectTargetFile();
    console.log(`📄 目标文件: ${targetFile}`);

    const task = `Analyze this file and provide structured JSON output: ${targetFile}

Include:
1. complexity: score 0-100
2. issues: array of {severity, description, location}
3. suggestions: array of {priority, description, impact}
4. overall: {rating, summary}

Respond ONLY in valid JSON format.`;

    console.log(`\n🤖 并发调用所有 ${this.availableCLIs.length} 个 CLI...`);

    const results = await this.executeConcurrent(this.availableCLIs, task);

    console.log(`\n📊 交叉验证结果:`);

    const analyses = [];
    for (const result of results) {
      if (result.success) {
        try {
          const analysis = this.extractJSON(result.output);
          analyses.push({ cli: result.cli, ...analysis });

          console.log(`\n   ✅ ${result.cli}:`);
          console.log(`      复杂度: ${analysis.complexity || 'N/A'}/100`);
          console.log(`      问题数: ${analysis.issues?.length || 0}`);
          console.log(`      建议数: ${analysis.suggestions?.length || 0}`);
          if (analysis.overall) {
            console.log(`      评级: ${analysis.overall.rating || 'N/A'}`);
          }
        } catch (error) {
          console.log(`\n   ⚠️  ${result.cli}: 无法解析 JSON`);
          console.log(`      原始输出长度: ${result.output.length} 字符`);
        }
      } else {
        console.log(`\n   ❌ ${result.cli}: 执行失败`);
      }
    }

    if (analyses.length >= 2) {
      // 计算共识
      console.log(`\n💡 多 CLI 共识分析:`);

      const avgComplexity = analyses.reduce((sum, a) => sum + (a.complexity || 0), 0) / analyses.length;
      const allIssues = analyses.flatMap(a => a.issues || []);
      const uniqueIssues = this.deduplicateIssues(allIssues);
      const allSuggestions = analyses.flatMap(a => a.suggestions || []);
      const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);

      console.log(`   平均复杂度: ${avgComplexity.toFixed(1)}/100`);
      console.log(`   共同问题: ${uniqueIssues.length} 个`);
      console.log(`   合并建议: ${uniqueSuggestions.length} 个`);

      // 保存共识分析
      const consensus = {
        timestamp: new Date().toISOString(),
        targetFile,
        participants: analyses.map(a => a.cli),
        avgComplexity,
        uniqueIssues,
        uniqueSuggestions,
        consensus: this.calculateConsensus(analyses)
      };

      const outputFile = path.join(__dirname, `consensus-${Date.now()}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(consensus, null, 2));

      console.log(`\n✅ 共识分析已保存: ${outputFile}`);

      return {
        success: true,
        strategy: 'cross-validation',
        participants: analyses.length,
        avgComplexity,
        uniqueIssues: uniqueIssues.length,
        consensus: consensus.consensus,
        outputFile
      };
    }

    console.log(`\n❌ 交叉验证失败: 需要至少 2 个成功的分析，实际 ${analyses.length} 个`);
    return {
      success: false,
      error: `Not enough valid analyses (${analyses.length}/${this.availableCLIs.length})`,
      strategy: 'cross-validation'
    };
  }

  /**
   * 策略 B: 协作进化
   * 不同 CLI 专注于不同任务
   */
  async runCollaboration() {
    console.log('🤝 策略 B: 协作进化 (Collaboration)');
    console.log('─'.repeat(70));

    const tasks = [
      {
        name: 'Code Analysis',
        cli: 'qwen',
        task: `Read and analyze this file: src/core/soul_engine/SoulEngine.js

Provide:
1. Architecture overview
2. Key components identification
3. Design patterns used
4. Potential improvements

Format as structured markdown report.`
      },
      {
        name: 'Test Generation',
        cli: 'codebuddy',
        task: `Generate comprehensive Jest tests for: src/core/soul_engine/SoulEngine.js

Include:
1. Unit tests for key methods
2. Edge case testing
3. Error handling tests
4. Performance tests

Provide ONLY executable Jest test code.`
      }
    ];

    console.log(`\n📋 协作任务:`);
    tasks.forEach(t => console.log(`   ${t.name} (${t.cli})`));

    const results = [];
    for (const task of tasks) {
      console.log(`\n🔄 执行: ${task.name} (${task.cli})...`);

      try {
        const output = await this.executeCLI(task.cli, task.task);
        const timestamp = Date.now();
        const fileName = `${task.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.md`;
        const outputFile = path.join(__dirname, fileName);

        fs.writeFileSync(outputFile, output);
        console.log(`   ✅ 完成: ${fileName} (${output.length} 字符)`);

        results.push({
          task: task.name,
          cli: task.cli,
          success: true,
          file: fileName,
          length: output.length
        });

      } catch (error) {
        console.log(`   ❌ 失败: ${error.message}`);
        results.push({
          task: task.name,
          cli: task.cli,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 协作结果: ${successCount}/${tasks.length} 任务完成`);

    if (successCount === tasks.length) {
      console.log(`\n✅ 协作进化成功 - 所有任务完成`);

      return {
        success: true,
        strategy: 'collaboration',
        tasksCompleted: successCount,
        totalTasks: tasks.length,
        results
      };
    }

    return {
      success: false,
      strategy: 'collaboration',
      tasksCompleted: successCount,
      totalTasks: tasks.length,
      error: 'Partial completion'
    };
  }

  /**
   * 策略 C: 竞争进化
   * 多个 CLI 竞争解决同一问题，选择最优解
   */
  async runCompetition() {
    console.log('🏆 策略 C: 竞争进化 (Competition)');
    console.log('─'.repeat(70));

    const task = `Generate a JavaScript function with these requirements:

Function: deepClone(obj)
Purpose: Deep clone any JavaScript object
Features:
1. Handle nested objects and arrays
2. Handle Date objects
3. Handle RegExp objects
4. Preserve object prototypes
5. Handle circular references safely

Requirements:
- Include JSDoc documentation
- Include 3 test cases
- Optimize for performance

Provide ONLY the executable JavaScript function with comments.`;

    console.log(`\n🏆 所有 ${this.availableCLIs.length} 个 CLI 竞争...`);
    console.log(`   任务: 生成 deepClone 函数`);

    const results = await this.executeConcurrent(this.availableCLIs, task);

    console.log(`\n📊 竞争结果:`);

    const evaluated = [];
    for (const result of results) {
      if (result.success) {
        const score = this.evaluateSolution(result.output);
        evaluated.push({ cli: result.cli, score, code: result.output });

        console.log(`\n   ${result.cli}:`);
        console.log(`      总分: ${score.total}/100`);
        console.log(`      - 功能完整性: ${score.completeness}/35`);
        console.log(`      - 代码质量: ${score.quality}/25`);
        console.log(`      - 文档完整性: ${score.documentation}/20`);
        console.log(`      - 测试覆盖: ${score.testing}/20`);
      }
    }

    if (evaluated.length > 0) {
      // 排序并选择获胜者
      evaluated.sort((a, b) => b.score.total - a.score.total);
      const winner = evaluated[0];

      console.log(`\n🏆 获胜者: ${winner.cli} (${winner.score.total}/100)`);

      // 保存获胜方案
      const winnerFile = path.join(__dirname, `winner-${Date.now()}.js`);
      fs.writeFileSync(winnerFile, winner.code);

      // 保存竞争报告
      const competitionReport = {
        timestamp: new Date().toISOString(),
        task: 'Generate deepClone function',
        participants: evaluated.length,
        results: evaluated.map(e => ({
          cli: e.cli,
          score: e.score
        })),
        winner: winner.cli,
        winnerScore: winner.score.total
      };

      const reportFile = path.join(__dirname, `competition-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(competitionReport, null, 2));

      console.log(`✅ 获胜方案: ${winnerFile}`);
      console.log(`✅ 竞争报告: ${reportFile}`);

      return {
        success: true,
        strategy: 'competition',
        winner: winner.cli,
        score: winner.score.total,
        participants: evaluated.length,
        winnerFile,
        reportFile
      };
    }

    console.log(`\n❌ 竞争失败: 没有成功的解决方案`);
    return {
      success: false,
      error: 'No valid solutions',
      strategy: 'competition'
    };
  }

  /**
   * 辅助方法
   */

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

  executeCLI(cliName, prompt) {
    return new Promise((resolve, reject) => {
      const quotedPrompt = `"${prompt.replace(/"/g, '\\"')}"`;
      const command = `stigmergy ${cliName} ${quotedPrompt}`;

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
          reject(new Error(`CLI failed (${code}): ${errorOutput || output}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn CLI: ${error.message}`));
      });

      setTimeout(() => {
        child.kill();
        reject(new Error('Timeout after 60 seconds'));
      }, 60000);
    });
  }

  extractJSON(text) {
    // 尝试找到 JSON 对象
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in output');
  }

  deduplicateIssues(issues) {
    const seen = new Set();
    const unique = [];

    issues.forEach(issue => {
      const key = `${issue.severity}-${issue.description}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(issue);
      }
    });

    return unique;
  }

  deduplicateSuggestions(suggestions) {
    const seen = new Set();
    const unique = [];

    suggestions.forEach(suggestion => {
      const key = suggestion.description;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(suggestion);
      }
    });

    return unique;
  }

  calculateConsensus(analyses) {
    // 计算不同 CLI 之间的共识程度
    if (analyses.length < 2) return 0;

    const complexityScores = analyses.map(a => a.complexity || 0);
    const avgComplexity = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length;
    const variance = complexityScores.reduce((sum, score) => sum + Math.pow(score - avgComplexity, 2), 0) / complexityScores.length;

    // 方差越小，共识越高
    const maxVariance = 2500; // 50^2
    const consensusScore = Math.max(0, 1 - (variance / maxVariance));

    return {
      score: consensusScore,
      level: consensusScore > 0.8 ? 'HIGH' : consensusScore > 0.5 ? 'MEDIUM' : 'LOW',
      avgComplexity,
      variance
    };
  }

  evaluateSolution(code) {
    let score = {
      completeness: 0,
      quality: 0,
      documentation: 0,
      testing: 0,
      total: 0
    };

    // 功能完整性 (35 分)
    if (code.includes('function') || code.includes('=>')) score.completeness += 10;
    if (code.includes('deep')) score.completeness += 5;
    if (code.includes('clone') || code.includes('copy')) score.completeness += 5;
    if (code.includes('Date') || code.includes('RegExp')) score.completeness += 5;
    if (code.includes('circular') || code.includes('cycle')) score.completeness += 5;
    if (code.includes('typeof') || code.includes('Array.isArray')) score.completeness += 5;

    // 代码质量 (25 分)
    if (code.includes('const ') || code.includes('let ')) score.quality += 8;
    if (!code.includes('var ')) score.quality += 7;
    if (code.includes('return')) score.quality += 5;
    if (code.includes('throw') || code.includes('Error')) score.quality += 5;

    // 文档完整性 (20 分)
    if (code.includes('/**') && code.includes('*/')) score.documentation += 10;
    if (code.includes('@param') && code.includes('@returns')) score.documentation += 5;
    if (code.includes('@example') || code.includes('test')) score.documentation += 5;

    // 测试覆盖 (20 分)
    if (code.includes('test') || code.includes('spec')) score.testing += 10;
    if (code.includes('expect') || code.includes('assert')) score.testing += 5;
    if (code.includes('describe') || code.includes('it')) score.testing += 5;

    score.total = score.completeness + score.quality + score.documentation + score.testing;
    return score;
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
  const system = new TrueMultiCLIEvolutionSystem();
  system.start().catch(error => {
    console.error('系统错误:', error);
    process.exit(1);
  });
}

module.exports = { TrueMultiCLIEvolutionSystem };
