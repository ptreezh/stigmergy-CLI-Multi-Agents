/**
 * 测试1: 简单真实CLI调用测试
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  测试1: 简单真实CLI调用测试');
console.log('  时间:', new Date().toLocaleString());
console.log('========================================');

function executeStigmergy(args, input = '', timeout = 180000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(`\n执行: stigmergy ${args.join(' ')}`);
    if (input) {
      console.log(`输入: ${input}`);
    }
    
    const childProcess = spawn('stigmergy', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    
    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });
    
    let timeoutHandle;
    
    childProcess.on('close', (code) => {
      clearTimeout(timeoutHandle);
      const executionTime = Date.now() - startTime;
      
      console.log(`\n退出码: ${code}`);
      console.log(`执行时间: ${executionTime}ms (${(executionTime/1000).toFixed(2)}秒)`);
      
      resolve({
        exitCode: code,
        stdout,
        stderr,
        executionTime,
        success: code === 0
      });
    });
    
    childProcess.on('error', (error) => {
      clearTimeout(timeoutHandle);
      console.log(`\n错误: ${error.message}`);
      
      resolve({
        exitCode: -1,
        stdout: '',
        stderr: error.message,
        executionTime: Date.now() - startTime,
        success: false
      });
    });
    
    // 发送输入
    if (input) {
      childProcess.stdin.write(input + '\n');
      childProcess.stdin.end();
    }
    
    timeoutHandle = setTimeout(() => {
      childProcess.kill();
      console.log('\n超时!');
      
      resolve({
        exitCode: -1,
        stdout: '',
        stderr: 'Timeout',
        executionTime: Date.now() - startTime,
        success: false
      });
    }, timeout);
  });
}

async function runTest() {
  console.log('\n--- 测试: stigmergy call智能路由 ---');
  const result = await executeStigmergy(['call', '你好'], '', 180000);
  
  console.log('\n========================================');
  console.log('  测试结果');
  console.log('========================================');
  
  if (result.success || result.stdout.length > 0) {
    console.log('✓ 测试通过');
    console.log(`  退出码: ${result.exitCode}`);
    console.log(`  执行时间: ${result.executionTime}ms`);
    console.log(`  输出长度: ${result.stdout.length}`);
  } else {
    console.log('✗ 测试失败');
    console.log(`  退出码: ${result.exitCode}`);
    console.log(`  错误: ${result.stderr}`);
  }
  
  const report = {
    testTime: new Date().toISOString(),
    testName: '简单真实CLI调用测试',
    result: result
  };
  
  const reportPath = path.join(__dirname, 'simple-cli-call-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: ${reportPath}`);
}

console.log('警告: 此测试将进行真实的AI CLI调用');
console.log('可能需要1-3分钟\n');
console.log('请耐心等待...\n');

runTest().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});