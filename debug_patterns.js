#!/usr/bin/env node
/**
 * 调试钩子模式匹配
 */

const fs = require('fs');
const path = require('path');

// 加载Claude钩子来测试模式
const hookPath = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'hooks',
  'claude',
  'claude_nodejs_hook.js'
);

const HookClass = require(hookPath);
const hook = new HookClass();

// 测试输入
const testInputs = [
  'ask copilot to create a React component',
  'use claude to write a Python function', 
  'call qwen to explain quantum computing',
  'gemini, please help me translate this text'
];

console.log('Testing pattern matching...\n');

for (const input of testInputs) {
  console.log(`Input: "${input}"`);
  
  // 直接测试每个模式
  const patterns = [
    /(?:use|call|ask)\s+(\w+)\s+(?:to|for)\s+(.+)$/i,
    /(?:please\s+)?(?:use|call|ask)\s+(\w+)\s+(.+)$/i,
    /(\w+)[,\s]+(?:please\s+)?(?:help\s+me\s+)?(.+)$/i
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = input.match(pattern);
    console.log(`  Pattern ${i+1}: ${pattern}`);
    console.log(`    Match: ${!!match}`);
    if (match) {
      console.log(`    Groups: [${match.slice(1).join(', ')}]`);
    }
  }
  
  // 测试钩子方法
  const result = hook.detectCrossCLIRequest(input);
  console.log(`  Hook result: ${JSON.stringify(result)}`);
  console.log('');
}