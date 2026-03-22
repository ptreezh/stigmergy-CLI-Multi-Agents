#!/usr/bin/env node

/**
 * 创建真实的进化任务到共享队列
 */

const SharedMemoryStore = require('../.stigmergy/shared-memory-store');
const path = require('path');

async function createRealTasks() {
  console.log('🎯 创建真实的进化任务...\n');

  const store = new SharedMemoryStore({
    storePath: path.join(__dirname, '..', '.stigmergy', '.shared-memory.json')
  });

  await store.initialize();

  // 任务1: 反思任务
  const task1 = await store.enqueueTask({
    type: 'reflection',
    priority: 'high',
    context: {
      scope: 'daily',
      focus: 'mission-alignment'
    }
  });
  console.log(`✅ 任务1已创建: ${task1.id} (反思任务)`);

  // 任务2: 审计任务
  const task2 = await store.enqueueTask({
    type: 'audit',
    priority: 'high',
    context: {
      scope: 'security',
      target: 'skills'
    }
  });
  console.log(`✅ 任务2已创建: ${task2.id} (审计任务)`);

  // 任务3: 进化任务
  const task3 = await store.enqueueTask({
    type: 'evolution',
    priority: 'normal',
    context: {
      phase: 'skill-discovery',
      focus: 'new-capabilities'
    }
  });
  console.log(`✅ 任务3已创建: ${task3.id} (进化任务)`);

  // 查看队列状态
  const stats = await store.getStatistics();
  console.log(`\n📊 队列状态:`);
  console.log(`   待处理任务: ${stats.pendingTasks}`);
  console.log(`   总任务数: ${stats.totalTasks}`);

  console.log('\n💡 提示: 任务已加入队列，等待协调器处理...');
  console.log('   可以运行: node skills/soul-multi-cli-evolution-coordinator.js');
}

createRealTasks().catch(console.error);
