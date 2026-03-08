#!/usr/bin/env node
/**
 * 快速启动指南 - 真实的 AI 进化系统
 *
 * 使用单个 CLI (Qwen) 进行自主进化
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   快速启动 - 真实的 AI 进化系统                               ║');
console.log('║   使用 Qwen CLI 进行自主进化                                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

async function quickStart() {
  console.log('📋 可用的演示:');
  console.log('');
  console.log('1. 并发执行测试');
  console.log('   命令: stigmergy concurrent "Your task" -c 3');
  console.log('');
  console.log('2. 单 CLI 调用');
  console.log('   命令: stigmergy qwen "Your task"');
  console.log('');
  console.log('3. 自主进化系统');
  console.log('   命令: node autonomous-evolution-system.js');
  console.log('');
  console.log('4. 协作进化演示');
  console.log('   命令: node demonstrate-collaboration.js');
  console.log('');
  console.log('5. 竞争进化演示');
  console.log('   命令: node demonstrate-competition.js');
  console.log('');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   快速演示                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Demo 1: Simple concurrent execution
  console.log('📌 Demo 1: 并发代码分析');
  console.log('─'.repeat(70));

  try {
    const task = `Analyze this JavaScript function and provide:
1. Time complexity (Big O)
2. Space complexity
3. Three optimization suggestions

Function:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}

Respond in JSON format:
{
  "timeComplexity": "...",
  "spaceComplexity": "...",
  "suggestions": ["...", "...", "..."]
}`;

    console.log('执行任务: 代码复杂度分析...');
    console.log('');

    const result = await executeQwen(task);

    console.log('✅ 结果:');
    console.log(result);
    console.log('');

    // Save result
    const demoDir = path.join(__dirname, 'evolution-demos');
    if (!fs.existsSync(demoDir)) {
      fs.mkdirSync(demoDir, { recursive: true });
    }

    const resultPath = path.join(demoDir, 'demo1-analysis.json');
    fs.writeFileSync(resultPath, result);

    console.log(`💾 结果已保存: ${resultPath}`);
    console.log('');

  } catch (error) {
    console.error('❌ Demo 1 失败:', error.message);
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   下一步                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('🚀 启动自主进化系统:');
  console.log('   node autonomous-evolution-system.js');
  console.log('');
  console.log('📖 查看完整报告:');
  console.log('   cat REAL-EVOLUTION-DEMO.md');
  console.log('');
  console.log('📊 查看进化日志:');
  console.log('   tail -f evolution-log.jsonl');
  console.log('');
}

function executeQwen(task) {
  return new Promise((resolve, reject) => {
    console.log('   调用 Qwen CLI...');

    const child = spawn('stigmergy', ['qwen', task], {
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
        reject(new Error(`Qwen failed: ${errorOutput || output}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to spawn Qwen: ${error.message}`));
    });

    setTimeout(() => {
      child.kill();
      reject(new Error('Timeout after 60 seconds'));
    }, 60000);
  });
}

// Run quick start
if (require.main === module) {
  quickStart().catch(error => {
    console.error('快速启动失败:', error);
    process.exit(1);
  });
}

module.exports = { quickStart };
