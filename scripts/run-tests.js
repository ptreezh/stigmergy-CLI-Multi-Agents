#!/usr/bin/env node

/**
 * 测试运行脚本
 * 支持运行不同类型的测试
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n▶ ${description}...`, 'cyan');
  try {
    const startTime = Date.now();
    execSync(command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    const duration = Date.now() - startTime;
    log(`✓ ${description} 完成 (${(duration / 1000).toFixed(2)}s)`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} 失败`, 'red');
    return false;
  }
}

// 测试类型
const testTypes = {
  unit: {
    description: '单元测试',
    command: 'jest tests/unit --coverage',
    file: 'test-results/unit-results.json'
  },
  integration: {
    description: '集成测试',
    command: 'jest tests/integration',
    file: 'test-results/integration-results.json'
  },
  e2e: {
    description: '端到端测试',
    command: 'jest tests/e2e',
    file: 'test-results/e2e-results.json'
  },
  automation: {
    description: '自动化测试',
    command: 'jest tests/automation',
    file: 'test-results/automation-results.json'
  },
  functional: {
    description: '功能测试',
    command: 'jest tests/functional',
    file: 'test-results/functional-results.json'
  },
  all: {
    description: '全量测试',
    command: 'jest tests --coverage',
    file: 'test-results/all-results.json'
  }
};

// 主函数
function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  log('\n🧪 Stigmergy CLI 测试套件', 'magenta');
  log('================================\n', 'magenta');

  // 创建测试结果目录
  const resultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // 运行测试
  if (testType === 'all') {
    log('运行所有测试...\n', 'yellow');

    const results = {};
    let allPassed = true;

    // 按顺序运行测试
    const testOrder = ['unit', 'integration', 'e2e', 'automation'];
    for (const type of testOrder) {
      const passed = runCommand(
        testTypes[type].command,
        testTypes[type].description
      );
      results[type] = passed;
      if (!passed) allPassed = false;
    }

    // 生成汇总报告
    generateSummary(results, allPassed);

    process.exit(allPassed ? 0 : 1);
  } else if (testTypes[testType]) {
    const passed = runCommand(
      testTypes[testType].command,
      testTypes[testType].description
    );
    process.exit(passed ? 0 : 1);
  } else {
    log('未知的测试类型', 'red');
    log(`\n可用的测试类型:`, 'yellow');
    Object.keys(testTypes).forEach(type => {
      log(`  - ${type}: ${testTypes[type].description}`, 'reset');
    });
    process.exit(1);
  }
}

function generateSummary(results, allPassed) {
  log('\n📊 测试汇总', 'magenta');
  log('================================\n', 'magenta');

  Object.keys(results).forEach(type => {
    const status = results[type] ? '✓ 通过' : '✗ 失败';
    const color = results[type] ? 'green' : 'red';
    log(`${testTypes[type].description}: ${status}`, color);
  });

  log('\n', 'reset');

  if (allPassed) {
    log('🎉 所有测试通过！', 'green');
  } else {
    log('⚠️  部分测试失败，请查看详细日志', 'yellow');
  }

  // 读取覆盖率报告
  const coverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
  if (fs.existsSync(coverageFile)) {
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
    log('\n📈 覆盖率统计', 'cyan');
    log('================================\n', 'cyan');

    const { total } = coverage;
    log(`语句: ${total.lines.pct}%`, 'reset');
    log(`分支: ${total.branches.pct}%`, 'reset');
    log(`函数: ${total.functions.pct}%`, 'reset');
    log(`行数: ${total.lines.pct}%`, 'reset');
  }

  log('\n详细报告:', 'yellow');
  log(`  - HTML: ${path.join(__dirname, '..', 'coverage', 'index.html')}`, 'reset');
  log(`  - JUnit: ${path.join(__dirname, '..', 'test-results', 'junit.xml')}`, 'reset');
}

// 运行主函数
main();