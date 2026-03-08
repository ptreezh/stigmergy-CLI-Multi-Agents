#!/usr/bin/env node
/**
 * 真实的 AI 进化演示 - 协作进化
 *
 * 不同的 CLI 专注于不同的任务：
 * - CLI 1: 代码生成
 * - CLI 2: 测试验证
 * - CLI 3: 性能优化
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function demonstrateCollaboration() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   真实的 AI 协作进化演示                                     ║');
  console.log('║   不同的 CLI 专注于不同的任务                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const tasks = [
    {
      name: 'Code Generation',
      cli: 'qwen',
      prompt: `Generate a JavaScript function that calculates the Fibonacci sequence efficiently using memoization.
The function should:
1. Take a number n as input
2. Return the nth Fibonacci number
3. Use memoization to cache results
4. Include error handling for invalid inputs
5. Add JSDoc comments

Provide ONLY the executable JavaScript code, no explanations.`,
      outputFile: 'fibonacci-generated.js'
    },
    {
      name: 'Testing',
      cli: 'qwen',
      prompt: `Write comprehensive unit tests for a Fibonacci memoization function.
The tests should cover:
1. Basic correctness (test known values: fib(0)=0, fib(1)=1, fib(10)=55)
2. Edge cases (negative numbers, non-integers)
3. Performance (verify memoization works by checking speed improvement)
4. Error handling

Use Jest syntax. Provide ONLY the test code, no explanations.`,
      outputFile: 'fibonacci-tests.js'
    },
    {
      name: 'Optimization',
      cli: 'qwen',
      prompt: `Analyze and optimize this Fibonacci memoization implementation for better performance:

\`\`\`javascript
function fibonacci(n, memo = {}) {
  if (n < 0) throw new Error('Negative input');
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (memo[n]) return memo[n];

  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}
\`\`\`

Provide an optimized version with:
1. Iterative approach (avoid recursion stack limits)
2. Space optimization
3. Same API (function signature)
4. JSDoc comments

Provide ONLY the optimized JavaScript code, no explanations.`,
      outputFile: 'fibonacci-optimized.js'
    }
  ];

  const results = [];

  for (const task of tasks) {
    console.log(`\n📋 Task: ${task.name}`);
    console.log(`🤖 CLI: ${task.cli}`);
    console.log(`📝 Prompt: ${task.prompt.substring(0, 100)}...`);
    console.log('');

    try {
      const result = await executeCLI(task.cli, task.prompt);
      results.push({
        task: task.name,
        cli: task.cli,
        success: true,
        output: result
      });

      // Save output to file
      const outputPath = path.join(__dirname, task.outputFile);
      fs.writeFileSync(outputPath, result);
      console.log(`   ✅ Output saved to: ${task.outputFile}`);
      console.log(`   📄 Length: ${result.length} characters`);

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        task: task.name,
        cli: task.cli,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   协作进化总结                                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const successful = results.filter(r => r.success).length;
  console.log(`✅ 成功: ${successful}/${results.length}`);

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`   ${icon} ${result.task} (${result.cli})`);
  });

  console.log('\n💡 这个演示展示了:');
  console.log('   1. 代码生成 - AI 生成初始实现');
  console.log('   2. 测试验证 - AI 生成测试用例');
  console.log('   3. 性能优化 - AI 优化现有代码');
  console.log('\n🔥 这是真实的 AI 协作，不是脚本自动化!');
}

function executeCLI(cliName, prompt) {
  return new Promise((resolve, reject) => {
    const command = `stigmergy call "${prompt}"`;

    console.log(`   执行: ${command}`);

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
        resolve(output);
      } else {
        reject(new Error(`CLI failed with code ${code}: ${errorOutput || output}`));
      }
    });

    child.on('error', (error) => {
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
  demonstrateCollaboration().catch(error => {
    console.error('演示失败:', error);
    process.exit(1);
  });
}

module.exports = { demonstrateCollaboration };
