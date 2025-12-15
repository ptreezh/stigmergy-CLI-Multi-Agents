#!/usr/bin/env node
/**
 * 全面测试所有CLI工具的Stigmergy钩子
 * 测试每个CLI工具的钩子是否能正确识别和处理跨CLI调用
 */

const fs = require('fs');
const path = require('path');

// CLI工具列表
const CLIS = [
  'claude',
  'gemini', 
  'qwen',
  'iflow',
  'qodercli',
  'codebuddy',
  'copilot',
  'codex'
];

// 测试用例
const TEST_CASES = [
  {
    name: 'Basic cross-CLI call',
    input: 'ask copilot to create a React component',
    expectedTarget: 'copilot',
    expectedTask: 'to create a React component'
  },
  {
    name: 'Use pattern',
    input: 'use claude to write a Python function',
    expectedTarget: 'claude',
    expectedTask: 'to write a Python function'
  },
  {
    name: 'Call pattern',
    input: 'call qwen to explain quantum computing',
    expectedTarget: 'qwen',
    expectedTask: 'to explain quantum computing'
  },
  {
    name: 'Direct addressing pattern',
    input: 'gemini, please help me translate this text',
    expectedTarget: 'gemini',
    expectedTask: 'please help me translate this text'
  }
];

async function testHook(cliName) {
  console.log(`\n=== Testing ${cliName.toUpperCase()} Hook ===`);
  
  try {
    // 构造钩子文件路径
    const hookPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.stigmergy',
      'hooks',
      cliName,
      `${cliName}_nodejs_hook.js`
    );
    
    // 检查钩子文件是否存在
    if (!fs.existsSync(hookPath)) {
      console.log(`❌ Hook file not found: ${hookPath}`);
      return false;
    }
    
    // 动态加载钩子
    const HookClass = require(hookPath);
    const hook = new HookClass();
    
    console.log(`✅ Hook loaded successfully`);
    
    // 测试所有用例
    let passedTests = 0;
    
    for (const testCase of TEST_CASES) {
      console.log(`\n  Testing: ${testCase.name}`);
      console.log(`    Input: "${testCase.input}"`);
      
      try {
        // 测试detectCrossCLIRequest方法
        const crossCLIRequest = hook.detectCrossCLIRequest(testCase.input);
        
        if (crossCLIRequest) {
          console.log(`    Detected cross-CLI request:`);
          console.log(`      Target CLI: ${crossCLIRequest.targetCLI}`);
          console.log(`      Task: ${crossCLIRequest.task}`);
          
          // 验证结果
          if (crossCLIRequest.targetCLI === testCase.expectedTarget && 
              crossCLIRequest.task.trim() === testCase.expectedTask.trim()) {
            console.log(`    ✅ Test PASSED`);
            passedTests++;
          } else {
            console.log(`    ❌ Test FAILED`);
            console.log(`      Expected target: ${testCase.expectedTarget}, got: ${crossCLIRequest.targetCLI}`);
            console.log(`      Expected task: ${testCase.expectedTask}, got: ${crossCLIRequest.task}`);
          }
        } else {
          console.log(`    ❌ No cross-CLI request detected`);
        }
      } catch (error) {
        console.log(`    ❌ Error testing case: ${error.message}`);
      }
    }
    
    console.log(`\n  Summary for ${cliName}: ${passedTests}/${TEST_CASES.length} tests passed`);
    return passedTests === TEST_CASES.length;
    
  } catch (error) {
    console.log(`❌ Failed to test ${cliName} hook: ${error.message}`);
    return false;
  }
}

async function testAllHooks() {
  console.log('🧪 Starting comprehensive hook test suite...\n');
  
  let passedCLI = 0;
  
  // 测试每个CLI工具的钩子
  for (const cliName of CLIS) {
    try {
      const result = await testHook(cliName);
      if (result) {
        passedCLI++;
      }
    } catch (error) {
      console.log(`❌ Error testing ${cliName}: ${error.message}`);
    }
  }
  
  console.log(`\n🏁 Final Results: ${passedCLI}/${CLIS.length} CLI tools passed hook tests`);
  
  if (passedCLI === CLIS.length) {
    console.log('🎉 All hooks are working correctly!');
  } else {
    console.log('⚠️  Some hooks may have issues.');
  }
}

// 运行测试
testAllHooks().catch(console.error);