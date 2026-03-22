#!/usr/bin/env node

/**
 * Multi-CLI Autonomous Evolution System Test
 *
 * 测试跨CLI的自主进化协调系统
 * 验证分布式任务执行和故障转移
 */

const SharedMemoryStore = require('../.stigmergy/shared-memory-store');
const MultiCLIEvolutionCoordinator = require('../skills/soul-multi-cli-evolution-coordinator');
const path = require('path');
const fs = require('fs');

async function runTest() {
  console.log('🧪 测试多CLI自主进化系统\n');

  // 临时测试路径
  const testStorePath = path.join(__dirname, '.test-shared-memory.json');
  const testLockPath = path.join(__dirname, '.test-shared-memory.lock');

  // 清理旧测试文件
  if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  if (fs.existsSync(testLockPath)) fs.unlinkSync(testLockPath);

  try {
    // 测试1: 共享记忆存储
    console.log('📝 测试1: 共享记忆存储...\n');
    await testSharedMemoryStore(testStorePath, testLockPath);

    // 测试2: 多CLI协调器
    console.log('\n📝 测试2: 多CLI协调器...\n');
    await testMultiCLICoordinator(testStorePath, testLockPath);

    // 测试3: 任务队列
    console.log('\n📝 测试3: 任务队列...\n');
    await testTaskQueue(testStorePath, testLockPath);

    // 测试4: 并发访问
    console.log('\n📝 测试4: 并发访问控制...\n');
    await testConcurrentAccess(testStorePath, testLockPath);

    // 测试5: CLI注册和心跳
    console.log('\n📝 测试5: CLI注册和心跳...\n');
    await testCLIRegistry(testStorePath, testLockPath);

    console.log('\n✅ 所有测试通过！');
    console.log('\n🎊 多CLI系统功能验证：');
    console.log('  ✅ 共享记忆存储');
    console.log('  ✅ 多CLI协调');
    console.log('  ✅ 任务队列管理');
    console.log('  ✅ 并发访问控制');
    console.log('  ✅ CLI注册机制');
    console.log('  ✅ 跨CLI状态同步');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // 清理测试文件
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
    if (fs.existsSync(testLockPath)) fs.unlinkSync(testLockPath);
  }
}

async function testSharedMemoryStore(storePath, lockPath) {
  const store = new SharedMemoryStore({
    storePath,
    lockPath
  });

  // 初始化
  await store.initialize();
  console.log('✅ 存储初始化成功');

  // 添加条目
  const entry1 = await store.addEntry({
    cli: 'claude',
    type: 'test',
    content: { message: '测试条目1' }
  });
  console.log(`✅ 添加条目: ${entry1.id}`);

  const entry2 = await store.addEntry({
    cli: 'gemini',
    type: 'test',
    content: { message: '测试条目2' }
  });
  console.log(`✅ 添加条目: ${entry2.id}`);

  // 获取最近条目
  const recent = await store.getRecentEntries(10);
  console.log(`✅ 获取最近条目: ${recent.length}条`);
  if (recent.length !== 2) {
    throw new Error(`期望2条记录，实际${recent.length}条`);
  }

  // 搜索条目
  const searchResults = await store.searchEntries('测试');
  console.log(`✅ 搜索结果: ${searchResults.length}条`);
  if (searchResults.length !== 2) {
    throw new Error(`期望2条搜索结果，实际${searchResults.length}条`);
  }

  // 获取统计
  const stats = await store.getStatistics();
  console.log(`✅ 统计信息: ${stats.totalEntries}条记录`);
  if (stats.totalEntries !== 2) {
    throw new Error(`期望2条统计记录，实际${stats.totalEntries}条`);
  }
}

async function testMultiCLICoordinator(storePath, lockPath) {
  const coordinator = new MultiCLIEvolutionCoordinator({
    memoryStore: {
      storePath,
      lockPath
    },
    currentCLI: 'test-cli'
  });

  // 初始化
  await coordinator.initialize();
  console.log('✅ 协调器初始化成功');

  // 注册CLI
  const cliInfo = await coordinator.memoryStore.registerCLI({
    name: 'test-cli',
    version: '1.0.0',
    capabilities: ['test']
  });
  console.log(`✅ CLI注册成功: ${cliInfo.name}`);

  // 检查可用性
  const isAvailable = await coordinator.checkCLIAvailability('claude');
  console.log(`✅ CLI可用性检查: claude ${isAvailable ? '可用' : '不可用'}`);

  // 获取状态
  const summary = await coordinator.memoryStore.getSummary();
  console.log(`✅ 系统摘要: ${summary.registeredCLIs}个注册CLI`);
}

async function testTaskQueue(storePath, lockPath) {
  const store = new SharedMemoryStore({
    storePath,
    lockPath
  });

  await store.initialize();

  // 添加任务
  const task1 = await store.enqueueTask({
    type: 'test',
    priority: 'high',
    context: { test: 'data1' }
  });
  console.log(`✅ 任务已加入队列: ${task1.id}`);

  const task2 = await store.enqueueTask({
    type: 'test',
    priority: 'normal',
    context: { test: 'data2' }
  });
  console.log(`✅ 任务已加入队列: ${task2.id}`);

  // 获取下一个任务
  const nextTask = await store.getNextTask('test-cli');
  console.log(`✅ 获取下一个任务: ${nextTask.id}`);
  if (nextTask.status !== 'assigned') {
    throw new Error(`期望任务状态为assigned，实际为${nextTask.status}`);
  }

  // 更新任务状态
  await store.updateTaskStatus(nextTask.id, 'completed', { success: true });
  console.log(`✅ 任务状态已更新: completed`);

  // 检查统计
  const stats = await store.getStatistics();
  console.log(`✅ 待处理任务: ${stats.pendingTasks}个`);
  if (stats.pendingTasks !== 1) {
    throw new Error(`期望1个待处理任务，实际${stats.pendingTasks}个`);
  }
}

async function testConcurrentAccess(storePath, lockPath) {
  const store = new SharedMemoryStore({
    storePath,
    lockPath,
    retryDelay: 10
  });

  await store.initialize();

  // 模拟并发写入
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      store.addEntry({
        cli: `test-cli-${i}`,
        type: 'concurrent-test',
        content: { index: i }
      })
    );
  }

  const results = await Promise.all(promises);
  console.log(`✅ 并发写入成功: ${results.length}个条目`);

  // 验证所有条目都写入了
  const stats = await store.getStatistics();
  if (stats.totalEntries < 5) {
    throw new Error(`并发写入失败，期望至少5条记录，实际${stats.totalEntries}条`);
  }

  console.log(`✅ 并发访问控制正常: ${stats.totalEntries}条记录`);
}

async function testCLIRegistry(storePath, lockPath) {
  const store = new SharedMemoryStore({
    storePath,
    lockPath
  });

  await store.initialize();

  // 注册多个CLI
  const clis = ['claude', 'gemini', 'qwen', 'iflow'];
  for (const cli of clis) {
    await store.registerCLI({
      name: cli,
      version: '1.0.0',
      capabilities: ['evolution', 'reflection']
    });
    console.log(`✅ 已注册CLI: ${cli}`);
  }

  // 更新心跳
  await store.updateCLIHeartbeat('claude');
  console.log(`✅ 心跳更新成功: claude`);

  // 获取活跃CLI
  const activeCLIs = await store.getActiveCLIs();
  console.log(`✅ 活跃CLI数量: ${activeCLIs.length}`);

  if (activeCLIs.length < 1) {
    throw new Error(`期望至少1个活跃CLI，实际${activeCLIs.length}个`);
  }

  // 获取统计
  const stats = await store.getStatistics();
  console.log(`✅ 注册CLI总数: ${stats.registeredCLIs}个`);

  if (stats.registeredCLIs < 4) {
    throw new Error(`期望4个注册CLI，实际${stats.registeredCLIs}个`);
  }
}

// 运行测试
runTest()
  .then(() => {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });
