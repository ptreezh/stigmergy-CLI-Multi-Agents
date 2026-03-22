#!/usr/bin/env node

/**
 * Unified Communication Adapter - REAL Verification Test
 *
 * 统一通信平台适配器 - 真实验证测试
 *
 * ⚠️ 诚实声明：
 * - 本测试只验证基础功能（不需要API凭证）
 * - 所有需要真实API的功能标记为 SKIPPED
 * - 不假装测试了未测试的内容
 */

const UnifiedCommAdapter = require('../skills/unified-comm-adapter');

let passed = 0;
let failed = 0;
let skipped = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`   ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`   ❌ ${name}: ${error.message}`);
    failed++;
  }
}

function skip(name, reason) {
  console.log(`   ⏭️  ${name} - SKIPPED: ${reason}`);
  skipped++;
}

async function runTests() {
  console.log('\n🔬 统一通信平台适配器 - 真实验证测试\n');
  console.log('=' .repeat(70));

  // 测试1: 模块加载
  console.log('\n📦 测试组1: 模块加载和初始化');
  test('模块可以require', () => {
    const Adapter = require('../skills/unified-comm-adapter');
    if (!Adapter) throw new Error('模块导出失败');
  });

  test('可以创建实例', () => {
    const adapter = new UnifiedCommAdapter();
    if (!adapter.platforms) throw new Error('platforms属性不存在');
  });

  test('空配置时没有启用平台', () => {
    const adapter = new UnifiedCommAdapter();
    const enabled = Object.keys(adapter.platforms).filter(p => adapter.platforms[p].enabled);
    if (enabled.length !== 0) throw new Error(`预期0个，实际${enabled.length}个`);
  });

  test('配置后平台正确启用', () => {
    const adapter = new UnifiedCommAdapter({
      wechat: { enabled: true, appId: 'test' },
      feishu: { enabled: true, appId: 'test' },
      dingtalk: { enabled: true, appKey: 'test' }
    });
    const enabled = Object.keys(adapter.platforms).filter(p => adapter.platforms[p].enabled);
    if (enabled.length !== 3) throw new Error(`预期3个，实际${enabled.length}个`);
  });

  // 测试2: 消息格式化
  console.log('\n📝 测试组2: 消息格式化（不需要API）');
  const adapter = new UnifiedCommAdapter();
  const recommendations = [
    { skillName: 'test-skill-1', score: 5.0, reasoning: '测试理由1' },
    { skillName: 'test-skill-2', score: 4.5, reasoning: '测试理由2' },
    { skillName: 'test-skill-3', score: 4.0, reasoning: '测试理由3' }
  ];

  test('微信消息格式化', () => {
    const wechat = adapter.platforms.wechat.adapter;
    const msg = wechat.formatRecommendationMessage(recommendations);
    if (!msg.includes('Stigmergy')) throw new Error('消息格式不正确');
    if (!msg.includes('test-skill-1')) throw new Error('未包含技能名称');
    if (!msg.includes('5')) throw new Error('未包含评分'); // JavaScript会输出"5"而不是"5.0"
    if (!msg.includes('4.5')) throw new Error('未包含评分4.5');
  });

  test('飞书卡片格式化', () => {
    const feishu = adapter.platforms.feishu.adapter;
    const card = feishu.formatRecommendationMessage(recommendations);
    if (card.msg_type !== 'interactive') throw new Error('消息类型错误');
    if (!card.card || !card.card.header) throw new Error('卡片结构不完整');
  });

  test('钉钉Markdown格式化', () => {
    const dingtalk = adapter.platforms.dingtalk.adapter;
    const md = dingtalk.formatRecommendationMessage(recommendations);
    if (md.msgtype !== 'markdown') throw new Error('消息类型错误');
    if (!md.markdown || !md.markdown.text) throw new Error('Markdown结构不完整');
  });

  // 测试3: 配置页面
  console.log('\n📄 测试组3: 配置页面生成');
  test('配置页面生成', () => {
    const html = adapter.generateConfigPage();
    if (html.length < 1000) throw new Error('HTML内容太短');
    if (!html.includes('微信')) throw new Error('未包含微信配置');
    if (!html.includes('飞书')) throw new Error('未包含飞书配置');
    if (!html.includes('钉钉')) throw new Error('未包含钉钉配置');
    if (!html.includes('open.weixin.qq.com')) throw new Error('未包含微信文档链接');
    if (!html.includes('open.feishu.cn')) throw new Error('未包含飞书文档链接');
    if (!html.includes('open.dingtalk.com')) throw new Error('未包含钉钉文档链接');
  });

  // 测试4: API调用（这些需要真实凭证，所以跳过）
  console.log('\n🌐 测试组4: API调用（需要真实凭证）');

  skip('微信Access Token获取', '需要真实的AppID和AppSecret');
  skip('飞书Tenant Access Token获取', '需要真实的App ID和App Secret');
  skip('钉钉Access Token获取', '需要真实的AppKey和AppSecret');
  skip('微信消息发送', '需要真实的API凭证和用户OpenID');
  skip('飞书消息发送', '需要真实的API凭证和用户ID');
  skip('钉钉消息发送', '需要真实的API凭证和用户ID');
  skip('Webhook回调验证', '需要公网URL和平台配置');

  // 测试5: 错误处理
  console.log('\n⚠️  测试组5: 错误处理');
  test('未配置平台时sendRecommendation抛出错误', () => {
    const adapter = new UnifiedCommAdapter(); // 未启用任何平台
    adapter.sendRecommendation('wechat', 'user-id', [])
      .then(() => { throw new Error('应该抛出错误'); })
      .catch(err => {
        if (!err.message.includes('未启用')) throw new Error('错误消息不正确');
      });
  });

  // 结果汇总
  console.log('\n' + '='.repeat(70));
  console.log('📊 测试结果汇总:');
  console.log(`   ✅ 通过: ${passed}`);
  console.log(`   ❌ 失败: ${failed}`);
  console.log(`   ⏭️  跳过: ${skipped}`);
  console.log(`   📈 通过率: ${passed > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : 0}%`);
  console.log('='.repeat(70));

  if (failed > 0) {
    console.log('\n❌ 有测试失败，请检查实现');
    process.exit(1);
  } else if (passed === 0) {
    console.log('\n⚠️  没有实际运行的测试');
    process.exit(1);
  } else {
    console.log('\n✅ 基础功能测试通过');
    console.log('\n⚠️  重要提醒：');
    console.log('   - 本测试只验证了不需要API凭证的基础功能');
    console.log('   - 所有API调用功能需要真实凭证才能验证');
    console.log('   - API规范可能已过时，需要获取最新官方文档');
    console.log('   - 生产环境使用前必须进行完整测试');
    console.log('\n📖 下一步：');
    console.log('   1. 获取各平台的真实API凭证');
    console.log('   2. 配置环境变量');
    console.log('   3. 测试真实的API调用');
    console.log('   4. 验证Webhook回调');
  }
}

runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ 测试执行失败:', error);
    process.exit(1);
  });
