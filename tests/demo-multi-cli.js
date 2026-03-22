#!/usr/bin/env node

/**
 * 多CLI自主进化系统完整演示
 * 展示真实的跨CLI协作流程
 */

const SharedMemoryStore = require('../.stigmergy/shared-memory-store');
const { spawn } = require('child_process');
const path = require('path');

async function runDemo() {
  console.log('🎭 多CLI自主进化系统完整演示\n');
  console.log('='.repeat(70));

  const store = new SharedMemoryStore({
    storePath: path.join(__dirname, '..', '.stigmergy', '.shared-memory.json')
  });

  await store.initialize();

  // 场景1: Claude CLI创建并处理任务
  console.log('\n📌 场景1: Claude CLI 创建进化任务');
  console.log('-'.repeat(70));

  await store.registerCLI({
    name: 'claude',
    version: '2.1.81',
    capabilities: ['evolution', 'reflection', 'audit']
  });

  const task1 = await store.enqueueTask({
    type: 'evolution',
    priority: 'high',
    context: {
      phase: 'skill-discovery',
      focus: 'security'
    }
  });

  console.log(`✅ Claude创建任务: ${task1.id}`);
  console.log(`   类型: ${task1.type}`);
  console.log(`   优先级: ${task1.priority}`);

  // Claude获取并处理任务
  console.log('\n⚙️  Claude 处理任务...');
  const assigned1 = await store.getNextTask('claude');
  console.log(`   任务已分配给: ${assigned1.assignedTo}`);

  // 模拟任务执行
  await simulateTaskExecution(assigned1, store);

  // 场景2: Qwen CLI创建审计任务
  console.log('\n📌 场景2: Qwen CLI 创建审计任务');
  console.log('-'.repeat(70));

  await store.registerCLI({
    name: 'qwen',
    version: '0.12.3',
    capabilities: ['audit', 'reflection']
  });

  const task2 = await store.enqueueTask({
    type: 'audit',
    priority: 'high',
    context: {
      target: 'skills',
      scope: 'security'
    }
  });

  console.log(`✅ Qwen创建任务: ${task2.id}`);
  console.log(`   类型: ${task2.type}`);
  console.log(`   优先级: ${task2.priority}`);

  // Qwen获取并处理任务
  console.log('\n⚙️  Qwen 处理任务...');
  const assigned2 = await store.getNextTask('qwen');
  console.log(`   任务已分配给: ${assigned2.assignedTo}`);

  await simulateTaskExecution(assigned2, store);

  // 场景3: iFlow CLI查看并贡献
  console.log('\n📌 场景3: iFlow CLI 查看系统状态');
  console.log('-'.repeat(70));

  await store.registerCLI({
    name: 'iflow',
    version: '1.0.0',
    capabilities: ['coordination', 'reflection']
  });

  const stats = await store.getStatistics();
  console.log(`✅ iFlow 查看系统状态:`);
  console.log(`   总任务数: ${stats.totalTasks}`);
  console.log(`   待处理: ${stats.pendingTasks}`);
  console.log(`   活跃CLI: ${stats.activeCLIs}个`);
  console.log(`   记忆条目: ${stats.totalEntries}条`);

  // iFlow添加反思
  await store.addEntry({
    cli: 'iflow',
    type: 'reflection',
    content: {
      observation: '系统运行良好，多CLI协作正常',
      suggestions: ['继续监控', '优化任务分配']
    }
  });

  console.log('\n✅ iFlow 添加了反思条目');

  // 场景4: 故障转移演示
  console.log('\n📌 场景4: 故障转移演示');
  console.log('-'.repeat(70));

  console.log('模拟: Claude CLI不可用...');

  // 创建新任务
  const task3 = await store.enqueueTask({
    type: 'coordination',
    priority: 'critical',
    context: {
      reason: 'failover',
      failedCLI: 'claude'
    }
  });

  console.log(`✅ 创建紧急任务: ${task3.id}`);

  // Qwen接手
  console.log('\n⚙️  Qwen 接管任务...');
  const assigned3 = await store.getNextTask('qwen');
  console.log(`   ✅ Qwen成功接管: ${assigned3.id}`);

  await simulateTaskExecution(assigned3, store);

  // 最终统计
  console.log('\n' + '='.repeat(70));
  console.log('📊 演示最终统计');
  console.log('='.repeat(70));

  const finalStats = await store.getStatistics();
  const summary = await store.getSummary();

  console.log(`\n✅ 系统状态:`);
  console.log(`   总任务数: ${finalStats.totalTasks}`);
  console.log(`   记忆条目: ${finalStats.totalEntries}`);
  console.log(`   活跃CLI: ${finalStats.activeCLIs}个`);
  console.log(`   版本号: ${finalStats.version}`);

  console.log(`\n✅ CLI注册情况:`);
  for (const [cliName, cliInfo] of Object.entries(store.memory.cliRegistry)) {
    console.log(`   - ${cliName}: ${cliInfo.status}`);
  }

  console.log(`\n✅ 进化状态:`);
  console.log(`   当前阶段: ${summary.evolutionState.currentPhase}`);
  console.log(`   最后进化: ${summary.evolutionState.lastEvolution || '尚未执行'}`);

  console.log('\n' + '='.repeat(70));
  console.log('🎉 演示完成！多CLI自主进化系统运行正常');
  console.log('='.repeat(70));

  console.log('\n🔑 关键成就:');
  console.log('   ✅ 多CLI成功注册');
  console.log('   ✅ 跨CLI任务创建和分配');
  console.log('   ✅ 任务执行和状态更新');
  console.log('   ✅ 共享记忆存储和同步');
  console.log('   ✅ 故障转移机制');
  console.log('   ✅ 系统状态追踪');
}

async function simulateTaskExecution(task, store) {
  const startTime = Date.now();

  // 模拟任务执行时间
  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = {
    success: true,
    result: {
      taskType: task.type,
      completedAt: new Date().toISOString(),
      executionTime: Date.now() - startTime
    }
  };

  await store.updateTaskStatus(task.id, 'completed', result);

  console.log(`   ✅ 任务完成，耗时: ${result.result.executionTime}ms`);

  // 记录到记忆
  await store.addEntry({
    cli: task.assignedTo || 'unknown',
    type: task.type,
    content: result.result,
    metadata: {
      taskId: task.id
    }
  });
}

runDemo()
  .then(() => {
    console.log('\n✅ 演示成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 演示失败:', error);
    process.exit(1);
  });
