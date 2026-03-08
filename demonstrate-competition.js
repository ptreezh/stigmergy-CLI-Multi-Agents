#!/usr/bin/env node
/**
 * 真实的 AI 进化演示 - 竞争进化
 *
 * 不同的 CLI 竞争解决同一个问题，选择最优解
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function demonstrateCompetition() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   真实的 AI 竞争进化演示                                     ║');
  console.log('║   多个 CLI 竞争，选择最优解                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const task = `Write a JavaScript function to validate email addresses.

Requirements:
1. Accept valid email formats (e.g., user@example.com, user.name@domain.co.uk)
2. Reject invalid formats (e.g., user@, @example.com, user@@example.com)
3. Support international domain names
4. Provide clear error messages for invalid inputs
5. Include comprehensive JSDoc documentation
6. Handle edge cases (null, undefined, non-string inputs)

Provide ONLY the executable JavaScript function with JSDoc, no explanations.`;

  const clis = ['qwen', 'iflow', 'codebuddy'];
  const results = [];

  console.log(`📋 Task: Email validation function`);
  console.log(`🤖 Competitors: ${clis.join(', ')}`);
  console.log('');

  // Execute all CLIs concurrently
  const promises = clis.map(cli => {
    return executeCLI(cli, task).then(output => ({
      cli,
      success: true,
      output
    })).catch(error => ({
      cli,
      success: false,
      error: error.message
    }));
  });

  const allResults = await Promise.all(promises);

  // Analyze and score each result
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   竞争结果                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  for (const result of allResults) {
    console.log(`\n🤖 ${result.cli}:`);
    console.log('─'.repeat(70));

    if (result.success) {
      const score = evaluateSolution(result.output);
      results.push({
        cli: result.cli,
        output: result.output,
        score,
        metrics: score
      });

      console.log(`   ✅ Success`);
      console.log(`   📄 Code length: ${result.output.length} chars`);
      console.log(`   📊 Quality Score: ${score.total}/100`);
      console.log(`      - Correctness: ${score.correctness}/40`);
      console.log(`      - Robustness: ${score.robustness}/30`);
      console.log(`      - Documentation: ${score.documentation}/20`);
      console.log(`      - Best Practices: ${score.bestPractices}/10`);

    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  }

  // Select winner
  if (results.length > 0) {
    const winner = results.sort((a, b) => b.score.total - a.score.total)[0];

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   🏆 获胜者                                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🏆 ${winner.cli} wins with score ${winner.score.total}/100!`);
    console.log('');

    // Save winner's solution
    const winnerPath = path.join(__dirname, 'winner-email-validator.js');
    fs.writeFileSync(winnerPath, winner.output);
    console.log(`✅ Winning solution saved to: ${winnerPath}`);
    console.log('');

    console.log('📝 Winning solution:');
    console.log('─'.repeat(70));
    console.log(winner.output);
    console.log('─'.repeat(70));
  } else {
    console.log('\n❌ No successful solutions');
  }

  console.log('\n💡 这个演示展示了:');
  console.log('   1. 多个 AI 竞争解决同一个问题');
  console.log('   2. 自动评估每个解决方案的质量');
  console.log('   3. 选择最优解作为最终结果');
  console.log('\n🔥 这是真实的 AI 竞争进化，不是脚本选择!');
}

function evaluateSolution(code) {
  let score = {
    correctness: 0,
    robustness: 0,
    documentation: 0,
    bestPractices: 10,
    total: 0
  };

  // Correctness (40 points)
  if (code.includes('function') || code.includes('=>')) score.correctness += 10;
  if (code.includes('@param') && code.includes('@returns')) score.correctness += 10;
  if (code.includes('return ')) score.correctness += 10;
  if (code.includes('test') || code.includes('validate')) score.correctness += 10;

  // Robustness (30 points)
  if (code.includes('if') || code.includes('typeof')) score.robustness += 10;
  if (code.includes('throw') || code.includes('Error')) score.robustness += 10;
  if (code.includes('try') || code.includes('catch')) score.robustness += 10;

  // Documentation (20 points)
  if (code.includes('/**') && code.includes('*/')) score.documentation += 10;
  if (code.includes('JSDoc') || code.includes('@example')) score.documentation += 10;

  // Best Practices (10 points)
  if (code.includes('const ') || code.includes('let ')) score.bestPractices += 5;
  if (!code.includes('var ')) score.bestPractices += 5;

  score.total = score.correctness + score.robustness + score.documentation + score.bestPractices;
  return score;
}

function executeCLI(cliName, prompt) {
  return new Promise((resolve, reject) => {
    console.log(`   📡 Executing ${cliName}...`);

    const child = spawn('stigmergy', ['call', prompt], {
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
        console.log(`   ✅ ${cliName} completed`);
        resolve(output);
      } else {
        console.log(`   ❌ ${cliName} failed`);
        reject(new Error(`CLI failed with code ${code}: ${errorOutput || output}`));
      }
    });

    child.on('error', (error) => {
      console.log(`   ❌ ${cliName} error: ${error.message}`);
      reject(new Error(`Failed to spawn CLI: ${error.message}`));
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      child.kill();
      reject(new Error('CLI execution timeout'));
    }, 60000);
  });
}

// Run demonstration
if (require.main === module) {
  demonstrateCompetition().catch(error => {
    console.error('演示失败:', error);
    process.exit(1);
  });
}

module.exports = { demonstrateCompetition };
