#!/usr/bin/env node
/**
 * 🔒 门禁验证系统 (Gatekeeper)
 *
 * 用途：在任何报告发布前，强制执行严苛验证检查
 * 生效日期：2026-03-22
 * 强制级别：绝对强制
 */

const fs = require('fs');
const path = require('path');

class Gatekeeper {
  constructor() {
    this.failures = [];
    this.warnings = [];
  }

  /**
   * 主入口：执行门禁检查
   */
  check(reportContent, options = {}) {
    console.log('🔒 门禁验证系统启动...\n');

    // 重置状态
    this.failures = [];
    this.warnings = [];

    // 执行所有检查
    this.checkSimulationTesting(reportContent);
    this.checkVerificationLevel(reportContent);
    this.checkLimitations(reportContent);
    this.checkEvidence(reportContent);
    this.checkTitleAccuracy(reportContent, options.title);
    this.checkSoulMdAlignment(reportContent);

    // 生成报告
    return this.generateReport();
  }

  /**
   * 检查1: 禁止模拟测试
   */
  checkSimulationTesting(content) {
    console.log('🔍 检查1: 测试真实性验证...');

    const indicators = [
      { pattern: /模拟.*测试/g, name: '明确说明"模拟测试"' },
      { pattern: /simulate|simulation/gi, name: '使用"simulate"或"simulation"' },
      { pattern: /异步函数.*并发/g, name: '使用异步函数冒充进程' },
      { pattern: /进程内.*并发/g, name: '进程内并发（可能冒充多进程）' },
    ];

    let foundSimulation = false;
    let clarifiedSimulation = false;

    for (const indicator of indicators) {
      if (indicator.pattern.test(content)) {
        foundSimulation = true;
        // 检查是否有明确说明这是模拟
        if (content.includes('这是模拟测试') ||
            content.includes('非真实CLI进程') ||
            content.includes('进程内并发') ||
            content.includes('非真实测试')) {
          clarifiedSimulation = true;
        }
      }
    }

    if (foundSimulation && !clarifiedSimulation) {
      this.failures.push({
        check: '禁止模拟测试',
        reason: '检测到模拟测试，但未明确说明是模拟',
        severity: 'CRITICAL',
        fix: '必须明确说明"这是模拟测试，非真实测试"'
      });
    } else if (foundSimulation && clarifiedSimulation) {
      this.warnings.push({
        check: '模拟测试说明',
        reason: '包含模拟测试，但已明确说明',
        severity: 'WARNING',
        note: '模拟测试不能声称高验证等级'
      });
    } else {
      console.log('  ✅ 通过：未检测到模拟测试');
    }
  }

  /**
   * 检查2: 验证等级准确性
   */
  checkVerificationLevel(content) {
    console.log('🔍 检查2: 验证等级确认...');

    const levels = [
      { name: 'Level 1', pattern: /Level\s*1(\.\d+)?/g, level: 1 },
      { name: 'Level 2', pattern: /Level\s*2(\.\d+)?/g, level: 2 },
      { name: 'Level 3', pattern: /Level\s*3(\.\d+)?/g, level: 3 },
      { name: 'Level 4', pattern: /Level\s*4(\.\d+)?/g, level: 4 },
    ];

    // 查找所有等级
    const foundLevels = levels.filter(level => level.pattern.test(content));

    // 提取实际的等级数字
    const actualLevels = [];
    const levelMatch = content.match(/Level\s*(\d+(\.\d+)?)/g);
    if (levelMatch) {
      levelMatch.forEach(match => {
        const num = parseFloat(match.replace(/Level\s*/, ''));
        actualLevels.push(num);
      });
    }

    if (actualLevels.length === 0) {
      this.failures.push({
        check: '验证等级',
        reason: '未明确标注验证等级',
        severity: 'CRITICAL',
        fix: '必须明确标注验证等级（Level 1-4，支持小数如Level 1.5）'
      });
    } else {
      // 使用最高等级作为报告等级
      const maxLevel = Math.max(...actualLevels);
      const levelName = `Level ${maxLevel}`;
      console.log(`  ✅ 通过：验证等级为 ${levelName}`);

      // 检查是否夸大
      if (maxLevel >= 3) {
        if (content.includes('模拟') || content.includes('simulate')) {
          this.failures.push({
            check: '验证等级夸大',
            reason: `Level ${maxLevel} 不能包含模拟测试`,
            severity: 'CRITICAL',
            fix: `模拟测试最高只能声称 Level 1-2`
          });
        }
      }
    }
  }

  /**
   * 检查3: 局限性说明
   */
  checkLimitations(content) {
    console.log('🔍 检查3: 局限性说明...');

    const limitationIndicators = [
      /局限性|限制|不足/g,
      /未.*测试|未.*验证/g,
      /待.*验证|待.*测试/g,
      /需要.*补充|需要.*完善/g,
    ];

    const hasLimitations = limitationIndicators.some(pattern => pattern.test(content));

    if (!hasLimitations) {
      this.failures.push({
        check: '局限性说明',
        reason: '未明确说明测试局限性',
        severity: 'CRITICAL',
        fix: '必须明确说明测试的局限性和未验证的场景'
      });
    } else {
      console.log('  ✅ 通过：包含局限性说明');
    }
  }

  /**
   * 检查4: 证据完整性
   */
  checkEvidence(content) {
    console.log('🔍 检查4: 证据完整性...');

    // 检查是否有数据支持
    const hasData = /\d+.*条|\d+.*次|\d+.*%|\d+.*ms/g.test(content);
    const hasOutput = /输出|结果| evidence|证据/gi.test(content);
    const hasFiles = /文件.*\.json|\.md|\.js/g.test(content);

    if (!hasData && !hasOutput && !hasFiles) {
      this.failures.push({
        check: '证据完整性',
        reason: '结论缺乏具体证据支持',
        severity: 'CRITICAL',
        fix: '必须提供可验证的数据、输出或文件证据'
      });
    } else {
      console.log('  ✅ 通过：包含证据支持');
    }
  }

  /**
   * 检查5: 标题准确性
   */
  checkTitleAccuracy(content, title = '') {
    console.log('🔍 检查5: 标题准确性...');

    if (!title) {
      this.warnings.push({
        check: '标题准确性',
        reason: '未提供标题进行检查',
        severity: 'INFO',
        note: '建议提供标题进行准确性检查'
      });
      return;
    }

    // 检查标题中的关键词
    const titleLower = title.toLowerCase();

    // 检查"并发CLI"
    if (titleLower.includes('并发cli') || titleLower.includes('concurrent cli')) {
      // 检查内容中是否真的是多CLI进程
      const hasMultiProcess = /spawn|fork|exec|独立进程/g.test(content);
      const hasWorkerSimulation = /simulateWorker|异步函数.*worker/gi.test(content);

      if (hasWorkerSimulation && !hasMultiProcess) {
        this.failures.push({
          check: '标题准确性',
          reason: '标题声称"并发CLI"，但内容是"并发worker模拟"',
          severity: 'CRITICAL',
          fix: '修改标题为"并发worker模拟"或改为真实多CLI测试'
        });
      }
    }

    console.log('  ✅ 通过：标题准确性检查完成');
  }

  /**
   * 检查6: soul.md对齐
   */
  checkSoulMdAlignment(content) {
    console.log('🔍 检查6: soul.md原则对齐...');

    // 检查是否违反2026-03-22错误案例
    const errorPatterns = [
      { pattern: /10.*并发.*CLI/g, name: '声称10个并发CLI' },
      { pattern: /Level\s*3.*压力验证.*✅/g, name: '声称Level 3验证通过' },
      { pattern: /性能优异|远超预期/g, name: '过度乐观结论' },
    ];

    for (const errorPattern of errorPatterns) {
      if (errorPattern.pattern.test(content)) {
        // 检查是否有对应的明确说明
        if (!content.includes('进程内并发') &&
            !content.includes('非真实CLI') &&
            !content.includes('模拟测试')) {
          this.failures.push({
            check: 'soul.md对齐',
            reason: `检测到"${errorPattern.name}"，可能重演2026-03-22错误`,
            severity: 'CRITICAL',
            fix: '必须明确说明测试方法，避免重演错误'
          });
        }
      }
    }

    console.log('  ✅ 通过：soul.md对齐检查完成');
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 门禁验证报告');
    console.log('='.repeat(60) + '\n');

    // 失败项
    if (this.failures.length > 0) {
      console.log('🚨 门禁未通过 - 严重问题：\n');
      this.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.check}`);
        console.log(`   原因: ${failure.reason}`);
        console.log(`   修复: ${failure.fix}`);
        console.log(`   严重程度: ${failure.severity}\n`);
      });
    }

    // 警告项
    if (this.warnings.length > 0) {
      console.log('⚠️  警告：\n');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.check}`);
        console.log(`   原因: ${warning.reason}`);
        if (warning.note) console.log(`   说明: ${warning.note}`);
        console.log(`   严重程度: ${warning.severity}\n`);
      });
    }

    // 最终结论
    console.log('='.repeat(60));
    if (this.failures.length > 0) {
      console.log('🚨 门禁验证结果：❌ 不通过');
      console.log('');
      console.log('必须修复所有严重问题后才能发布报告。');
      console.log('请对照 GATEKEEPER.md 进行修正。');
      return false;
    } else {
      console.log('✅ 门禁验证结果：通过');
      if (this.warnings.length > 0) {
        console.log('');
        console.log('注意：存在警告项，建议在发布前处理。');
      }
      console.log('');
      console.log('报告已通过门禁检查，可以发布。');
      return true;
    }
  }
}

// CLI接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const gatekeeper = new Gatekeeper();

  if (args.length === 0) {
    console.log('用法: node gatekeeper.js <文件路径> [标题]');
    console.log('');
    console.log('示例:');
    console.log('  node gatekeeper.js ./docs/TEST_REPORT.md');
    console.log('  node gatekeeper.js ./docs/TEST_REPORT.md "Level 3压力测试报告"');
    process.exit(1);
  }

  const filePath = args[0];
  const title = args[1] || '';

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const passed = gatekeeper.check(content, { title });

  process.exit(passed ? 0 : 1);
}

module.exports = Gatekeeper;
