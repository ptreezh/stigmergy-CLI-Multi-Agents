/**
 * 测试新组件的实际功能
 */

const HookManager = require('../src/core/plugins/HookManager');
const ContextInjector = require('../src/core/plugins/ContextInjector');
const PluginDeployer = require('../src/core/plugins/PluginDeployer');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function testHookManager() {
  console.log('\n=== 测试 HookManager ===\n');

  const hookManager = new HookManager({ verbose: true, dryRun: true });

  // 测试 1: 获取 hooks 配置路径
  console.log('测试 1: 获取 hooks 配置路径');
  console.log('  iflow:', hookManager.getHooksConfigPath('iflow'));
  console.log('  qwen:', hookManager.getHooksConfigPath('qwen'));
  console.log('  ✅ 通过\n');

  // 测试 2: 生成 hooks 配置
  console.log('测试 2: 生成 hooks 配置');
  try {
    await hookManager.createHooksConfig('iflow', {
      'test-hook': {
        enabled: true,
        trigger_keywords: ['test', 'demo']
      }
    });
    console.log('  ✅ 通过\n');
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }

  // 测试 3: 生成 SessionStart hook 实现
  console.log('测试 3: 生成 SessionStart hook 实现');
  try {
    const hookContent = hookManager.generateSessionStartHook('iflow');
    console.log('  长度:', hookContent.length);
    console.log('  前100字符:', hookContent.substring(0, 100));
    console.log('  ✅ 通过\n');
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }
}

async function testContextInjector() {
  console.log('\n=== 测试 ContextInjector ===\n');

  const injector = new ContextInjector({ verbose: true, dryRun: true });

  // 测试 1: 获取 CLI 文档路径
  console.log('测试 1: 获取 CLI 文档路径');
  console.log('  iflow:', injector.getCLIDocPath('iflow'));
  console.log('  qwen:', injector.getCLIDocPath('qwen'));
  console.log('  ✅ 通过\n');

  // 测试 2: 生成上下文注入
  console.log('测试 2: 生成上下文注入');
  try {
    const injection = injector.generateContextInjection([
      { name: 'test-skill', description: '测试技能' }
    ], {
      priority: 1,
      title: 'Test Skills'
    });
    console.log('  长度:', injection.length);
    console.log('  包含标记:', injection.includes('<!-- SKILLS_START -->'));
    console.log('  ✅ 通过\n');
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }

  // 测试 3: 读取已注入的上下文
  console.log('测试 3: 读取已注入的上下文（iflow）');
  try {
    const context = await injector.readInjectedContext('iflow');
    if (context) {
      console.log('  长度:', context.length);
      console.log('  ✅ 通过\n');
    } else {
      console.log('  ⚠️  没有找到上下文\n');
    }
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }
}

async function testPluginDeployer() {
  console.log('\n=== 测试 PluginDeployer ===\n');

  const deployer = new PluginDeployer({ verbose: true, dryRun: true });

  // 测试 1: 验证部署
  console.log('测试 1: 验证部署（iflow）');
  try {
    const results = await deployer.verifyDeployment('iflow');
    console.log('  结果:', results);
    console.log('  ✅ 通过\n');
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }
}

async function testRealWorldScenario() {
  console.log('\n=== 测试真实场景 ===\n');

  const injector = new ContextInjector({ verbose: true, dryRun: false });
  const hookManager = new HookManager({ verbose: true, dryRun: true });

  // 场景 1: Stigmergy 向 iflow 注入自己的上下文
  console.log('场景 1: Stigmergy 向 iflow 注入上下文');
  try {
    await injector.injectContext('iflow', [
      { name: 'stigmergy-coordination', description: 'Stigmergy 跨 CLI 协调能力' }
    ], {
      priority: 1,
      title: 'Stigmergy Capabilities'
    });
    console.log('  ✅ 成功\n');
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }

  // 场景 2: 为 iflow 生成 hooks 配置
  console.log('场景 2: 为 iflow 生成 Stigmergy hooks');
  try {
    await hookManager.createHooksConfig('iflow', {
      'stigmergy-integration': {
        enabled: true,
        trigger_keywords: ['stigmergy', 'cross-cli']
      }
    });
    console.log('  ✅ 成功\n');
  } catch (error) {
    console.log('  ❌ 失败:', error.message, '\n');
  }
}

async function checkActualFiles() {
  console.log('\n=== 检查实际部署的文件 ===\n');

  const cliName = 'iflow';
  const cliDir = path.join(os.homedir(), `.${cliName}`);

  // 检查 hooks.json
  const hooksPath = path.join(cliDir, 'hooks.json');
  console.log('检查 hooks.json:', hooksPath);
  try {
    await fs.access(hooksPath);
    const content = await fs.readFile(hooksPath, 'utf8');
    const hooks = JSON.parse(content);
    console.log('  ✅ 存在');
    console.log('  Hooks:', Object.keys(hooks.hooks || {}).join(', '));
  } catch (error) {
    console.log('  ❌ 不存在或无法读取');
  }

  // 检查 hooks/sessionStart.js
  const sessionStartPath = path.join(cliDir, 'hooks', 'sessionStart.js');
  console.log('\n检查 sessionStart.js:', sessionStartPath);
  try {
    await fs.access(sessionStartPath);
    console.log('  ✅ 存在');
  } catch (error) {
    console.log('  ❌ 不存在');
  }

  // 检查 IFLOW.md 中的上下文
  const iflowMdPath = path.join(cliDir, 'IFLOW.md');
  console.log('\n检查 IFLOW.md 中的上下文:', iflowMdPath);
  try {
    const content = await fs.readFile(iflowMdPath, 'utf8');
    const hasSkills = content.includes('<!-- SKILLS_START -->');
    console.log('  SKILLS_START:', hasSkills ? '✅' : '❌');
    if (hasSkills) {
      const start = content.indexOf('<!-- SKILLS_START -->');
      const end = content.indexOf('<!-- SKILLS_END -->') + '<!-- SKILLS_END -->'.length;
      const skillsSection = content.substring(start, end);
      console.log('  长度:', skillsSection.length);
    }
  } catch (error) {
    console.log('  ❌ 无法读取');
  }
}

async function main() {
  console.log('🧪 开始测试新组件...\n');

  try {
    await testHookManager();
    await testContextInjector();
    await testPluginDeployer();
    await testRealWorldScenario();
    await checkActualFiles();

    console.log('\n✅ 所有测试完成\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
}

main();
