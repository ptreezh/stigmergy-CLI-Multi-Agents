/**
 * 跨平台兼容性检查运行器
 */

const CrossPlatformChecker = require('./cross-platform-checker');

async function main() {
  const checker = new CrossPlatformChecker();

  // 检查技能目录
  const report = await checker.checkSkills('./skills');

  // 输出报告
  console.log(checker.formatReport(report));

  // 保存报告
  const fs = require('fs');
  const reportPath = './cross-platform-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);

  // 如果有错误，返回非零退出码
  if (report.summary.errors > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
