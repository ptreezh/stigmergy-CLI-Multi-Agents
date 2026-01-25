/**
 * 分析测试结果并生成报告
 */

const fs = require('fs').promises;
const path = require('path');

const TEST_RESULTS = {
  claude: {
    registered: true,
    verified: true,
    detected: false,
    timedOut: false,
    status: 'failed'
  },
  gemini: {
    registered: true,
    verified: true,
    detected: false,
    timedOut: true,
    status: 'timeout'
  },
  qwen: {
    registered: true,
    verified: true,
    detected: false,
    timedOut: true,
    status: 'timeout'
  },
  iflow: {
    registered: true,
    verified: true,
    detected: true,
    timedOut: true,
    status: 'success' // 超时但检测成功
  },
  codebuddy: {
    registered: true,
    verified: true,
    detected: true,
    timedOut: true,
    status: 'success' // 超时但检测成功
  },
  qodercli: {
    registered: true,
    verified: true,
    detected: false,
    timedOut: false,
    status: 'failed'
  },
  copilot: {
    registered: true,
    verified: true,
    detected: false,
    timedOut: false,
    status: 'failed'
  },
  codex: {
    registered: true,
    verified: true,
    detected: false,
    timedOut: false,
    status: 'failed'
  }
};

function printReport() {
  console.log('\n' + '='.repeat(100));
  console.log('所有CLI手动验证测试 - 结果报告');
  console.log('='.repeat(100) + '\n');

  console.log('测试机制: 在.md文档中注册skill，验证CLI是否能识别并使用\n');

  // 打印详细结果
  console.log('详细结果:');
  console.log('-'.repeat(100));

  for (const [cli, result] of Object.entries(TEST_RESULTS)) {
    const statusIcon = result.detected ? '✅' : (result.timedOut ? '⏱' : '❌');
    const statusText = result.detected ? '成功' : (result.timedOut ? '超时' : '失败');

    console.log(`\n${statusIcon} ${cli.toUpperCase()}`);
    console.log(`   注册: ${result.registered ? '✓' : '✗'} | 验证: ${result.verified ? '✓' : '✗'} | 检测: ${result.detected ? '✓' : '✗'} | 超时: ${result.timedOut ? '是' : '否'}`);
    console.log(`   状态: ${statusText}`);
  }

  // 统计
  console.log('\n' + '='.repeat(100));
  console.log('统计:');
  console.log('='.repeat(100));

  const total = Object.keys(TEST_RESULTS).length;
  const success = Object.values(TEST_RESULTS).filter(r => r.detected).length;
  const timeout = Object.values(TEST_RESULTS).filter(r => r.timedOut && !r.detected).length;
  const failed = Object.values(TEST_RESULTS).filter(r => !r.detected && !r.timedOut).length;

  console.log(`\n  总计: ${total} 个CLI`);
  console.log(`  ✅ 成功 (检测到skill): ${success} 个 (${((success/total)*100).toFixed(1)}%)`);
  console.log(`  ⏱ 超时 (未检测到): ${timeout} 个 (${((timeout/total)*100).toFixed(1)}%)`);
  console.log(`  ❌ 失败 (未检测到): ${failed} 个 (${((failed/total)*100).toFixed(1)}%)`);

  // 分类
  console.log('\n' + '='.repeat(100));
  console.log('分类:');
  console.log('='.repeat(100));

  console.log('\n✅ 通过测试的CLI (2个):');
  console.log('   - iflow:    成功识别并使用了skill');
  console.log('   - codebuddy: 成功识别并使用了skill');

  console.log('\n⏱ 超时的CLI (2个):');
  console.log('   - gemini:   超时，未检测到skill');
  console.log('   - qwen:     超时，未检测到skill (之前单独测试成功)');

  console.log('\n❌ 未检测到skill的CLI (4个):');
  console.log('   - claude:   未检测到skill');
  console.log('   - qodercli: 未检测到skill');
  console.log('   - copilot:  未检测到skill');
  console.log('   - codex:    未检测到skill');

  // 分析
  console.log('\n' + '='.repeat(100));
  console.log('分析:');
  console.log('='.repeat(100));

  console.log('\n1. 成功率分析:');
  console.log(`   - ${((success/total)*100).toFixed(1)}% 的CLI可以通过.md文档注册激活skill`);
  console.log(`   - iflow 和 codebuddy 明确支持.md文档注册机制`);

  console.log('\n2. 超时分析:');
  console.log('   - qwen: 之前的单独测试成功，说明机制有效，可能需要更长响应时间');
  console.log('   - gemini: 超时，可能需要更长的启动时间或不同的检测方式');

  console.log('\n3. 失败分析:');
  console.log('   - claude, qodercli, copilot, codex: 未检测到skill');
  console.log('   - 可能原因:');
  console.log('     a) 这些CLI可能不使用.md文档作为skill注册机制');
  console.log('     b) 可能需要不同的skill格式或位置');
  console.log('     c) 可能需要重启CLI才能加载新的.md文档');
  console.log('     d) 可能需要实际的skill文件而不仅仅是注册');

  console.log('\n4. 关键发现:');
  console.log('   ✅ .md文档注册机制对部分CLI有效 (iflow, codebuddy)');
  console.log('   ✅ qwen在单独测试中成功，说明机制有效但需要更长时间');
  console.log('   ❌ 不是所有CLI都支持.md文档注册机制');
  console.log('   ⚠ 需要对每个CLI进行更深入的研究');

  console.log('\n' + '='.repeat(100));
  console.log('建议:');
  console.log('='.repeat(100));

  console.log('\n1. 短期行动:');
  console.log('   ✓ 为iflow和codebuddy实现.md文档自动注册功能');
  console.log('   ✓ 为qwen增加更长的超时时间并重新测试');
  console.log('   ✓ 研究claude, gemini, qodercli, copilot, codex的具体skill机制');

  console.log('\n2. 中期行动:');
  console.log('   • 为每个CLI创建专门的skill激活检测机制');
  console.log('   • 实现CLI特定的skill文件部署路径');
  console.log('   • 添加CLI重启/重载机制以加载新的skill');

  console.log('\n3. 长期行动:');
  console.log('   • 建立统一的skill注册和激活规范');
  console.log('   • 与各CLI团队协调以支持标准化的skill机制');
  console.log('   • 创建CLI兼容性测试套件');

  console.log('\n' + '='.repeat(100));
  console.log('');
}

printReport();
