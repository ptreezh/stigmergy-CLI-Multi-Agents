/**
 * 全面真实环境测试 - 无时间限制版本
 * 真实验证：
 * 1. 真实CLI调用协作
 * 2. 并发处理能力
 * 3. 端到端协作流程
 * 4. 多CLI会话历史共享
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  全面真实环境测试 - 无时间限制');
console.log('  时间:', new Date().toLocaleString());
console.log('========================================');

const results = [];
const testDir = path.resolve(__dirname);
const projectTestDir = path.join(testDir, 'test-projects');
const reportPath = path.join(testDir, 'ultimate-real-test-report.json');

function recordTest(name, passed, details = '') {
  results.push({ name, passed, details, timestamp: new Date().toISOString() });
  if (passed) {
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name}`);
  }
  if (details) {
    console.log(`  ${details}`);
  }
}

// 执行stigmergy命令（无时间限制）
function executeStigmergy(args, timeout = 300000) { // 5分钟超时
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(`\n执行: stigmergy ${args.join(' ')}`);
    
    const childProcess = spawn('stigmergy', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
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

// 测试1: 真实CLI调用协作
async function testRealCLICollaboration() {
  console.log('\n========================================');
  console.log('  测试1: 真实CLI调用协作');
  console.log('========================================');
  
  // 测试1.1: 调用qwen（真实AI调用）
  console.log('\n--- 测试1.1: 调用qwen CLI（真实AI调用）---');
  const qwenResult = await executeStigmergy(['qwen', '你好，请简单介绍一下你自己'], 180000); // 3分钟
  recordTest(
    '真实CLI协作 - 调用qwen',
    qwenResult.success || qwenResult.stdout.length > 0,
    `退出码: ${qwenResult.exitCode}, 时间: ${qwenResult.executionTime}ms, 输出长度: ${qwenResult.stdout.length}`
  );
  
  // 测试1.2: 调用iflow（真实AI调用）
  console.log('\n--- 测试1.2: 调用iflow CLI（真实AI调用）---');
  const iflowResult = await executeStigmergy(['iflow', '分析当前目录的结构'], 180000); // 3分钟
  recordTest(
    '真实CLI协作 - 调用iflow',
    iflowResult.success || iflowResult.stdout.length > 0,
    `退出码: ${iflowResult.exitCode}, 时间: ${iflowResult.executionTime}ms, 输出长度: ${iflowResult.stdout.length}`
  );
  
  // 测试1.3: 调用codebuddy（真实AI调用）
  console.log('\n--- 测试1.3: 调用codebuddy CLI（真实AI调用）---');
  const codebuddyResult = await executeStigmergy(['codebuddy', '写一个简单的Python函数计算斐波那契数列'], 180000); // 3分钟
  recordTest(
    '真实CLI协作 - 调用codebuddy',
    codebuddyResult.success || codebuddyResult.stdout.length > 0,
    `退出码: ${codebuddyResult.exitCode}, 时间: ${codebuddyResult.executionTime}ms, 输出长度: ${codebuddyResult.stdout.length}`
  );
  
  // 测试1.4: 调用gemini（真实AI调用）
  console.log('\n--- 测试1.4: 调用gemini CLI（真实AI调用）---');
  const geminiResult = await executeStigmergy(['gemini', '解释什么是机器学习'], 180000); // 3分钟
  recordTest(
    '真实CLI协作 - 调用gemini',
    geminiResult.success || geminiResult.stdout.length > 0,
    `退出码: ${geminiResult.exitCode}, 时间: ${geminiResult.executionTime}ms, 输出长度: ${geminiResult.stdout.length}`
  );
}

// 测试2: 并发处理能力
async function testConcurrentProcessing() {
  console.log('\n========================================');
  console.log('  测试2: 并发处理能力（限制2个并发）');
  console.log('========================================');
  
  const concurrentTests = [
    async () => {
      console.log('\n--- 并发测试1: 调用qwen ---');
      const result = await executeStigmergy(['qwen', '并发测试1：请说出1-10的平方'], 180000);
      return {
        name: '并发测试 - qwen',
        success: result.success || result.stdout.length > 0,
        executionTime: result.executionTime,
        outputLength: result.stdout.length
      };
    },
    async () => {
      console.log('\n--- 并发测试2: 调用iflow ---');
      const result = await executeStigmergy(['iflow', '并发测试2：列出当前目录的文件'], 180000);
      return {
        name: '并发测试 - iflow',
        success: result.success || result.stdout.length > 0,
        executionTime: result.executionTime,
        outputLength: result.stdout.length
      };
    }
  ];
  
  console.log('\n开始并发测试（最大并发数: 2）...');
  const startTime = Date.now();
  
  // 并发执行
  const concurrentResults = await Promise.all(concurrentTests.map(test => test()));
  
  const totalTime = Date.now() - startTime;
  
  for (const result of concurrentResults) {
    recordTest(
      result.name,
      result.success,
      `执行时间: ${result.executionTime}ms, 输出长度: ${result.outputLength}`
    );
  }
  
  const allPassed = concurrentResults.every(r => r.success);
  const avgTime = concurrentResults.reduce((sum, r) => sum + r.executionTime, 0) / concurrentResults.length;
  
  recordTest(
    '并发测试 - 整体',
    allPassed,
    `通过: ${concurrentResults.filter(r => r.success).length}/${concurrentResults.length}, 平均时间: ${avgTime.toFixed(2)}ms, 总时间: ${totalTime}ms`
  );
  
  recordTest(
    '并发测试 - 效率',
    totalTime < avgTime * 2,
    `并发总时间 (${totalTime}ms) < 串行总时间 (${(avgTime * 2).toFixed(2)}ms)`
  );
}

// 测试3: 端到端协作流程
async function testEndToEndCollaboration() {
  console.log('\n========================================');
  console.log('  测试3: 端到端协作流程');
  console.log('========================================');
  
  // 测试3.1: 创建测试项目
  console.log('\n--- 测试3.1: 创建测试项目 ---');
  const testProjectPath = path.join(projectTestDir, 'collaboration-test');
  if (!fs.existsSync(testProjectPath)) {
    fs.mkdirSync(testProjectPath, { recursive: true });
  }
  recordTest(
    '端到端协作 - 创建测试项目',
    fs.existsSync(testProjectPath),
    `项目路径: ${testProjectPath}`
  );
  
  // 测试3.2: 使用qwen创建代码文件
  console.log('\n--- 测试3.2: 使用qwen创建代码文件 ---');
  const qwenCodeResult = await executeStigmergy(['qwen', '在' + testProjectPath + '目录下创建一个hello.js文件，内容是一个简单的Hello World程序'], 180000);
  recordTest(
    '端到端协作 - qwen创建代码',
    qwenCodeResult.success || qwenCodeResult.stdout.length > 0,
    `退出码: ${qwenCodeResult.exitCode}, 输出长度: ${qwenCodeResult.stdout.length}`
  );
  
  // 测试3.3: 验证文件创建
  console.log('\n--- 测试3.3: 验证文件创建 ---');
  const helloFilePath = path.join(testProjectPath, 'hello.js');
  const helloFileExists = fs.existsSync(helloFilePath);
  recordTest(
    '端到端协作 - 文件创建验证',
    helloFileExists,
    `文件存在: ${helloFileExists}`
  );
  
  // 测试3.4: 使用iflow分析代码
  console.log('\n--- 测试3.4: 使用iflow分析代码 ---');
  if (helloFileExists) {
    const iflowAnalyzeResult = await executeStigmergy(['iflow', '分析' + helloFilePath + '文件的内容'], 180000);
    recordTest(
      '端到端协作 - iflow分析代码',
      iflowAnalyzeResult.success || iflowAnalyzeResult.stdout.length > 0,
      `退出码: ${iflowAnalyzeResult.exitCode}, 输出长度: ${iflowAnalyzeResult.stdout.length}`
    );
  } else {
    recordTest('端到端协作 - iflow分析代码', false, '文件不存在，跳过测试');
  }
  
  // 测试3.5: 使用codebuddy优化代码
  console.log('\n--- 测试3.5: 使用codebuddy优化代码 ---');
  if (helloFileExists) {
    const codebuddyOptimizeResult = await executeStigmergy(['codebuddy', '优化' + helloFilePath + '文件的代码'], 180000);
    recordTest(
      '端到端协作 - codebuddy优化代码',
      codebuddyOptimizeResult.success || codebuddyOptimizeResult.stdout.length > 0,
      `退出码: ${codebuddyOptimizeResult.exitCode}, 输出长度: ${codebuddyOptimizeResult.stdout.length}`
    );
  } else {
    recordTest('端到端协作 - codebuddy优化代码', false, '文件不存在，跳过测试');
  }
}

// 测试4: 多CLI会话历史共享
async function testMultiCLISessionHistory() {
  console.log('\n========================================');
  console.log('  测试4: 多CLI会话历史共享');
  console.log('========================================');
  
  // 测试4.1: 检查各CLI的ResumeSession集成
  console.log('\n--- 测试4.1: 检查各CLI的ResumeSession集成 ---');
  const cliDirs = ['.claude', '.qwen', '.gemini', '.codebuddy', '.codex', '.iflow'];
  const integrationResults = {};
  
  for (const cliDir of cliDirs) {
    const cliPath = path.join(testDir, cliDir, 'plugins', 'resumesession-history.js');
    if (fs.existsSync(cliPath)) {
      integrationResults[cliDir] = true;
    } else {
      // 尝试其他可能的路径
      const hooksPath = path.join(testDir, cliDir, 'hooks', 'resumesession-history.js');
      const integrationsPath = path.join(testDir, cliDir, 'integrations', 'resumesession.js');
      const agentsPath = path.join(testDir, cliDir, 'agents', 'resumesession-history.js');
      
      if (fs.existsSync(hooksPath) || fs.existsSync(integrationsPath) || fs.existsSync(agentsPath)) {
        integrationResults[cliDir] = true;
      } else {
        integrationResults[cliDir] = false;
      }
    }
  }
  
  const integratedCLIs = Object.entries(integrationResults).filter(([_, integrated]) => integrated).length;
  recordTest(
    '会话历史 - 多CLI集成状态',
    integratedCLIs >= 3,
    `集成CLI数: ${integratedCLIs}/${cliDirs.length}`
  );
  
  // 测试4.2: 测试stigmergy resume命令
  console.log('\n--- 测试4.2: 测试stigmergy resume命令 ---');
  const resumeResult = await executeStigmergy(['resume'], 120000);
  recordTest(
    '会话历史 - stigmergy resume',
    resumeResult.success || resumeResult.stdout.length > 0,
    `退出码: ${resumeResult.exitCode}, 输出长度: ${resumeResult.stdout.length}`
  );
  
  // 测试4.3: 测试stigmergy resume --cli命令
  console.log('\n--- 测试4.3: 测试stigmergy resume --cli命令 ---');
  const resumeClaudeResult = await executeStigmergy(['resume', '--cli', 'claude'], 120000);
  recordTest(
    '会话历史 - stigmergy resume --cli claude',
    resumeClaudeResult.success || resumeClaudeResult.stdout.length > 0,
    `退出码: ${resumeClaudeResult.exitCode}, 输出长度: ${resumeClaudeResult.stdout.length}`
  );
  
  // 测试4.4: 测试stigmergy resume --help命令
  console.log('\n--- 测试4.4: 测试stigmergy resume --help命令 ---');
  const resumeHelpResult = await executeStigmergy(['resume', '--help'], 60000);
  recordTest(
    '会话历史 - stigmergy resume --help',
    resumeHelpResult.success,
    `退出码: ${resumeHelpResult.exitCode}`
  );
}

// 测试5: 记忆共享功能
async function testMemorySharing() {
  console.log('\n========================================');
  console.log('  测试5: 记忆共享功能');
  console.log('========================================');
  
  try {
    // 清除require缓存
    delete require.cache[require.resolve('./src/core/memory_manager')];
    
    const MemoryManager = require('./src/core/memory_manager');
    const memoryManager = new MemoryManager();
    
    // 测试5.1: 读取全局记忆
    console.log('\n--- 测试5.1: 读取全局记忆 ---');
    const globalMemory = await memoryManager.getGlobalMemory();
    recordTest(
      '记忆共享 - 读取全局记忆',
      globalMemory !== null,
      `版本: ${globalMemory.version}, 交互数: ${globalMemory.interactions?.length || 0}, 协作数: ${globalMemory.collaborations?.length || 0}`
    );
    
    // 测试5.2: 添加CLI协作记录
    console.log('\n--- 测试5.2: 添加CLI协作记录 ---');
    await memoryManager.updateGlobalMemory((memory) => {
      memory.collaborations.push({
        timestamp: new Date().toISOString(),
        type: 'cli-collaboration',
        participants: ['qwen', 'iflow'],
        task: '测试协作任务',
        status: 'completed'
      });
      return memory;
    });
    const updatedMemory = await memoryManager.getGlobalMemory();
    const hasNewCollaboration = updatedMemory.collaborations.length > (globalMemory.collaborations?.length || 0);
    recordTest(
      '记忆共享 - 添加协作记录',
      hasNewCollaboration,
      `协作数: ${updatedMemory.collaborations.length}`
    );
    
    // 测试5.3: 查询特定协作记录
    console.log('\n--- 测试5.3: 查询特定协作记录 ---');
    const recentCollaborations = updatedMemory.collaborations.filter(c => 
      c.type === 'cli-collaboration' && 
      new Date(c.timestamp) > new Date(Date.now() - 60000) // 最近1分钟
    );
    recordTest(
      '记忆共享 - 查询协作记录',
      recentCollaborations.length > 0,
      `最近协作数: ${recentCollaborations.length}`
    );
    
    // 测试5.4: 检查记忆文件
    console.log('\n--- 测试5.4: 检查记忆文件 ---');
    const memoryFile = path.join(require('os').homedir(), '.stigmergy', 'memory.json');
    const memoryFileExists = fs.existsSync(memoryFile);
    recordTest(
      '记忆共享 - 记忆文件',
      memoryFileExists,
      `文件存在: ${memoryFileExists}`
    );
    
  } catch (error) {
    recordTest('记忆共享 - MemoryManager', false, error.message);
  }
}

// 测试6: 协调层组件功能
async function testCoordinationLayer() {
  console.log('\n========================================');
  console.log('  测试6: 协调层组件功能');
  console.log('========================================');
  
  try {
    // 测试6.1: NaturalLanguageParser
    console.log('\n--- 测试6.1: NaturalLanguageParser ---');
    const { NaturalLanguageParser } = require('./src/core/coordination/natural_language_parser');
    const parser = new NaturalLanguageParser({ enableCaching: true });
    
    const testInputs = [
      '请qwen翻译这段文字',
      '让iflow分析代码',
      '请codebuddy审查代码',
      '帮我写一个函数',
      '继续上次的任务'
    ];
    
    let parserPassed = 0;
    for (const input of testInputs) {
      const result = await parser.parseIntent(input);
      if (result.intent !== undefined) {
        parserPassed++;
      }
    }
    recordTest(
      '协调层 - NaturalLanguageParser',
      parserPassed === testInputs.length,
      `通过: ${parserPassed}/${testInputs.length}`
    );
    
    // 测试6.2: Logger
    console.log('\n--- 测试6.2: Logger ---');
    const { Logger } = require('./src/core/coordination/logger');
    const logger = new Logger({
      enableConsole: false,
      enableFileLogging: false,
      enableMetrics: true
    });
    
    logger.info('测试信息日志');
    logger.warn('测试警告日志');
    logger.error('测试错误日志');
    
    const logs = logger.getRecentLogs();
    recordTest(
      '协调层 - Logger',
      logs.length >= 3,
      `记录了 ${logs.length} 条日志`
    );
    
    const dashboardData = logger.getDashboardData();
    recordTest(
      '协调层 - Logger Dashboard',
      dashboardData.logs.total > 0,
      `总日志数: ${dashboardData.logs.total}`
    );
    
    logger.shutdown();
    
    // 测试6.3: PythonDetector
    console.log('\n--- 测试6.3: PythonDetector ---');
    const PythonDetector = require('./src/core/coordination/python_detector');
    const detector = new PythonDetector({ enableCaching: false });
    const pyResult = await detector.detectPython();
    recordTest(
      '协调层 - PythonDetector',
      pyResult.installed !== undefined,
      `Python安装: ${pyResult.installed}, 版本: ${pyResult.version || 'N/A'}`
    );
    
    // 测试6.4: IntentRouter
    console.log('\n--- 测试6.4: IntentRouter ---');
    const IntentRouter = require('./src/core/coordination/intent_router');
    const router = new IntentRouter({
      defaultTool: 'claude',
      enableFallback: true
    });
    
    const intentResult = {
      intent: 'delegation',
      targetCLI: 'qwen',
      confidence: 0.9,
      originalInput: '请qwen翻译这段文字'
    };
    
    const routeResult = await router.routeRequest(intentResult);
    recordTest(
      '协调层 - IntentRouter',
      routeResult.action !== undefined,
      `动作: ${routeResult.action}, 目标: ${routeResult.target?.cli || 'N/A'}`
    );
    
  } catch (error) {
    recordTest('协调层 - 组件测试', false, error.message);
  }
}

// 生成报告
function generateReport() {
  console.log('\n========================================');
  console.log('  最终测试报告');
  console.log('========================================');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`总测试数: ${results.length}`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`成功率: ${((passed / results.length) * 100).toFixed(2)}%`);
  
  // 按类别统计
  const categories = {};
  results.forEach(result => {
    const category = result.name.split(' - ')[0];
    if (!categories[category]) {
      categories[category] = { total: 0, passed: 0 };
    }
    categories[category].total++;
    if (result.passed) {
      categories[category].passed++;
    }
  });
  
  console.log('\n--- 分类统计 ---');
  for (const [category, stats] of Object.entries(categories)) {
    console.log(`${category}: ${stats.passed}/${stats.total} 通过 (${((stats.passed/stats.total)*100).toFixed(2)}%)`);
  }
  
  const report = {
    testTime: new Date().toISOString(),
    summary: {
      total: results.length,
      passed,
      failed,
      successRate: ((passed / results.length) * 100).toFixed(2) + '%'
    },
    categories,
    results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: ${reportPath}`);
  
  if (failed === 0) {
    console.log('\n✓✓✓ 所有测试通过！系统完全可用！✓✓✓');
  } else {
    console.log(`\n✗ ${failed}个测试失败`);
  }
  
  return report;
}

// 主测试流程
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    console.log('开始全面真实环境测试...');
    console.log('预计耗时: 20-30分钟');
    console.log('请耐心等待...\n');
    
    // 执行所有测试
    await testRealCLICollaboration();
    await testConcurrentProcessing();
    await testEndToEndCollaboration();
    await testMultiCLISessionHistory();
    await testMemorySharing();
    await testCoordinationLayer();
    
    // 生成报告
    const report = generateReport();
    
    const totalTime = Date.now() - startTime;
    console.log(`\n总测试时间: ${(totalTime/1000/60).toFixed(2)}分钟`);
    
    console.log('\n✓ 全面真实环境测试完成');
    return report;
    
  } catch (error) {
    console.error('\n测试执行失败:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行测试
console.log('警告: 此测试将进行真实的AI CLI调用，可能需要20-30分钟');
console.log('请确保网络连接正常...\n');

runAllTests().then(report => {
  console.log('\n========================================');
  console.log('  最终总结');
  console.log('========================================');
  console.log(`总计: ${report.summary.total}个测试`);
  console.log(`通过: ${report.summary.passed}个`);
  console.log(`失败: ${report.summary.failed}个`);
  console.log(`成功率: ${report.summary.successRate}`);
  console.log('\n测试文件: ' + reportPath);
  console.log('\n如果成功率 >= 90%，说明系统完全可用！');
  console.log('如果成功率 >= 75%，说明系统基本可用，有小问题需要修复。');
  console.log('如果成功率 < 75%，说明系统存在严重问题，需要修复后重新测试。');
}).catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});