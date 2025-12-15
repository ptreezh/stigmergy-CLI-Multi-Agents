#!/usr/bin/env node
/**
 * 全面测试所有CLI工具的中英文钩子指令匹配
 */

const fs = require('fs');
const path = require('path');

const clis = ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'];

// 测试用例
const testCases = [
  {
    name: 'English - ask pattern',
    input: 'ask copilot to create a React component',
    expectedTarget: 'copilot',
    expectedTask: 'create a React component'
  },
  {
    name: 'English - use pattern',
    input: 'use claude to write a Python function',
    expectedTarget: 'claude',
    expectedTask: 'write a Python function'
  },
  {
    name: 'English - call pattern',
    input: 'call qwen to explain quantum computing',
    expectedTarget: 'qwen',
    expectedTask: 'explain quantum computing'
  },
  {
    name: 'English - direct addressing',
    input: 'gemini, please translate this text',
    expectedTarget: 'gemini',
    expectedTask: 'please translate this text'
  },
  {
    name: 'Chinese - 请用...帮我...',
    input: '请用copilot帮我创建一个React组件',
    expectedTarget: 'copilot',
    expectedTask: '创建一个React组件'
  },
  {
    name: 'Chinese - 调用...来...',
    input: '调用qwen来解释量子计算',
    expectedTarget: 'qwen',
    expectedTask: '解释量子计算'
  },
  {
    name: 'Chinese - 用...帮我...',
    input: '用claude帮我写一个Python函数',
    expectedTarget: 'claude',
    expectedTask: '写一个Python函数'
  },
  {
    name: 'Chinese - ...，...',
    input: 'gemini，请翻译这段文字',
    expectedTarget: 'gemini',
    expectedTask: '请翻译这段文字'
  },
  {
    name: 'Chinese - 让...做...',
    input: '让codebuddy分析这段代码',
    expectedTarget: 'codebuddy',
    expectedTask: '分析这段代码'
  }
];

let totalPassed = 0;
let totalTests = 0;

for (const cli of clis) {
  console.log(`\n=== Testing ${cli.toUpperCase()} Hook ===`);
  
  try {
    const hookPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.stigmergy',
      'hooks',
      cli,
      `${cli}_nodejs_hook.js`
    );
    
    if (!fs.existsSync(hookPath)) {
      console.log(`❌ Hook file not found: ${hookPath}`);
      continue;
    }
    
    const HookClass = require(hookPath);
    const hook = new HookClass();
    
    let passedTests = 0;
    
    for (const testCase of testCases) {
      console.log(`\n  Testing: ${testCase.name}`);
      console.log(`    Input: "${testCase.input}"`);
      
      const result = hook.detectCrossCLIRequest(testCase.input);
      
      if (result) {
        console.log(`    Detected:`);
        console.log(`      Target CLI: ${result.targetCLI}`);
        console.log(`      Task: ${result.task}`);
        
        if (result.targetCLI === testCase.expectedTarget && 
            result.task.trim() === testCase.expectedTask.trim()) {
          console.log(`    ✅ PASSED`);
          passedTests++;
          totalPassed++;
        } else {
          console.log(`    ❌ FAILED`);
          console.log(`      Expected target: ${testCase.expectedTarget}, got: ${result.targetCLI}`);
          console.log(`      Expected task: "${testCase.expectedTask}", got: "${result.task}"`);
        }
      } else {
        console.log(`    ❌ No cross-CLI request detected`);
      }
      
      totalTests++;
    }
    
    console.log(`\n  Summary for ${cli}: ${passedTests}/${testCases.length} tests passed`);
    
  } catch (error) {
    console.log(`❌ Error testing ${cli} hook: ${error.message}`);
  }
}

console.log(`\n🏁 Final Results: ${totalPassed}/${totalTests} total tests passed`);

const successRate = (totalPassed / totalTests * 100).toFixed(1);
console.log(`📊 Success Rate: ${successRate}%`);

if (totalPassed === totalTests) {
  console.log('🎉 All hooks are working correctly with both English and Chinese patterns!');
  console.log('\n✨ Hook triggering instructions:');
  console.log('   English patterns:');
  console.log('     - "ask <tool> to <task>"');
  console.log('     - "use <tool> to <task>"');
  console.log('     - "call <tool> to <task>"');
  console.log('     - "<tool>, <task>"');
  console.log('   Chinese patterns:');
  console.log('     - "请用<工具>帮我<任务>"');
  console.log('     - "调用<工具>来<任务>"');
  console.log('     - "用<工具>帮我<任务>"');
  console.log('     - "<工具>，<任务>"');
  console.log('     - "让<工具><任务>"');
} else {
  console.log('⚠️  Some hooks may have issues.');
}