#!/usr/bin/env node
/**
 * 测试中文钩子指令匹配
 */

const fs = require('fs');
const path = require('path');

// 加载Claude钩子来测试
const hookPath = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'hooks',
  'claude',
  'claude_nodejs_hook.js'
);

const HookClass = require(hookPath);
const hook = new HookClass();

// 中文测试用例
const chineseTestCases = [
  {
    name: '请用...帮我...',
    input: '请用copilot帮我创建一个React组件',
    expectedTarget: 'copilot',
    expectedTask: '创建一个React组件'
  },
  {
    name: '调用...来...',
    input: '调用qwen来解释量子计算',
    expectedTarget: 'qwen',
    expectedTask: '解释量子计算'
  },
  {
    name: '用...帮我...',
    input: '用claude帮我写一个Python函数',
    expectedTarget: 'claude',
    expectedTask: '写一个Python函数'
  },
  {
    name: '...，...',
    input: 'gemini，请翻译这段文字',
    expectedTarget: 'gemini',
    expectedTask: '请翻译这段文字'
  },
  {
    name: '让...做...',
    input: '让codebuddy分析这段代码',
    expectedTarget: 'codebuddy',
    expectedTask: '分析这段代码'
  }
];

console.log('Testing Chinese pattern matching...\n');

let passedTests = 0;

for (const testCase of chineseTestCases) {
  console.log(`Testing: ${testCase.name}`);
  console.log(`  Input: "${testCase.input}"`);
  
  const result = hook.detectCrossCLIRequest(testCase.input);
  
  if (result) {
    console.log(`  Detected:`);
    console.log(`    Target CLI: ${result.targetCLI}`);
    console.log(`    Task: ${result.task}`);
    
    if (result.targetCLI === testCase.expectedTarget && 
        result.task.trim() === testCase.expectedTask.trim()) {
      console.log(`  ✅ PASSED\n`);
      passedTests++;
    } else {
      console.log(`  ❌ FAILED`);
      console.log(`    Expected target: ${testCase.expectedTarget}, got: ${result.targetCLI}`);
      console.log(`    Expected task: "${testCase.expectedTask}", got: "${result.task}"\n`);
    }
  } else {
    console.log(`  ❌ No cross-CLI request detected\n`);
  }
}

console.log(`Summary: ${passedTests}/${chineseTestCases.length} Chinese tests passed`);

if (passedTests === chineseTestCases.length) {
  console.log('🎉 All Chinese patterns working correctly!');
} else {
  console.log('⚠️  Some Chinese patterns need attention.');
}