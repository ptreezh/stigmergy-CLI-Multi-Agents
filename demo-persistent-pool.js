#!/usr/bin/env node

/**
 * 持久进程池演示脚本
 * 展示如何使用 PersistentCLIPool 实现真正的持续交互
 */

const { PersistentCLIPool } = require('./src/interactive/PersistentCLIPool');

async function demo() {
  console.log('========================================');
  console.log('  持久进程池演示');
  console.log('========================================\n');

  // 创建持久进程池
  const pool = new PersistentCLIPool({
    autoRestart: true,
    healthCheckInterval: 30000,
    maxIdleTime: 300000
  });

  try {
    // 演示1：执行单个任务
    console.log('\n【演示1】执行单个任务');
    console.log('-------------------------');
    const result1 = await pool.executeTask('qwen', '你好');
    console.log('\n响应:', result1.output?.substring(0, 200) + '...');

    // 演示2：连续对话（上下文保持）
    console.log('\n\n【演示2】连续对话');
    console.log('-------------------------');
    const result2 = await pool.executeTask('qwen', '我刚才说了什么？');
    console.log('\n响应:', result2.output?.substring(0, 200) + '...');

    // 演示3：CLI 切换（每个 CLI 独立进程）
    console.log('\n\n【演示3】CLI 切换');
    console.log('-------------------------');
    const result3 = await pool.executeTask('iflow', '帮我写一个 Python 函数');
    console.log('\n响应:', result3.output?.substring(0, 200) + '...');

    // 演示4：回到之前的 CLI（上下文仍然保持）
    console.log('\n\n【演示4】回到 qwen（上下文保持）');
    console.log('-------------------------');
    const result4 = await pool.executeTask('qwen', '继续我们的对话');
    console.log('\n响应:', result4.output?.substring(0, 200) + '...');

    // 查看进程状态
    console.log('\n\n【进程状态】');
    console.log('-------------------------');
    const status = pool.getStatus();
    for (const [cli, info] of Object.entries(status)) {
      console.log(`\n${cli}:`);
      console.log(`  PID: ${info.pid}`);
      console.log(`  Ready: ${info.ready}`);
      console.log(`  Healthy: ${info.healthy}`);
      console.log(`  Last Activity: ${new Date(info.lastActivity).toLocaleTimeString()}`);
    }

  } catch (error) {
    console.error('\n错误:', error.message);
  } finally {
    // 关闭所有进程
    console.log('\n\n【关闭所有进程】');
    console.log('-------------------------');
    await pool.shutdownAll();
    console.log('\n✓ 所有进程已关闭');
  }

  console.log('\n========================================');
  console.log('  演示完成');
  console.log('========================================\n');
}

// 运行演示
demo().catch(error => {
  console.error('演示失败:', error);
  process.exit(1);
});
