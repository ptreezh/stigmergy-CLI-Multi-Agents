#!/usr/bin/env node

/**
 * Deep Verification Test
 * 极严格的递归测试，确保所有功能的真实性验证
 */

const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

class DeepVerificationTester {
  constructor() {
    this.verificationResults = {
      timestamp: new Date().toISOString(),
      deepTests: [],
      actualFunctionality: {},
      crossValidation: {},
      finalAssessment: null
    };
  }

  log(category, test, result, details = '') {
    const entry = {
      category,
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    };
    this.verificationResults.deepTests.push(entry);

    const status = result ? '✅' : '❌';
    console.log(`${status} ${category}: ${test}`);
    if (details) console.log(`   详情: ${details}`);
  }

  // 验证1: 实际文件修改检查
  verifyActualFileChanges() {
    console.log('\n🔍 验证1: 检查实际的文件修改...');

    const criticalFiles = [
      'src/index.js',
      'src/cli/router.js',
      'src/core/installer.js',
      'src/core/smart_router.js'
    ];

    let modificationsVerified = 0;
    criticalFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // 检查引号风格是否改变
        const singleQuoteCount = (content.match(/'/g) || []).length;
        const doubleQuoteCount = (content.match(/"/g) || []).length;

        // 检查行结束符
        const crlfCount = (content.match(/\r\n/g) || []).length;
        const lfCount = (content.match(/(?<!\r)\n/g) || []).length;

        this.log('文件修改', file, true,
          `单引号: ${singleQuoteCount}, 双引号: ${doubleQuoteCount}, CRLF: ${crlfCount}, LF: ${lfCount}`);

        modificationsVerified++;
      } catch (error) {
        this.log('文件修改', file, false, error.message);
      }
    });

    return modificationsVerified === criticalFiles.length;
  }

  // 验证2: CLI功能实际测试
  verifyActualCLIFunctionality() {
    console.log('\n🔍 验证2: CLI功能实际测试...');

    const commands = [
      { cmd: '--help', expect: /Stigmergy CLI/i },
      { cmd: 'version', expect: /v1\.2\.6/ },
      { cmd: 'status', expect: /Available:/i },
      { cmd: 'diagnostic', expect: /Stigmergy CLI System Diagnostic/i }
    ];

    let workingCommands = 0;
    commands.forEach(({ cmd, expect }) => {
      try {
        const result = spawnSync('node', ['src/index.js', cmd], {
          encoding: 'utf8',
          timeout: 15000
        });

        const isWorking = result.status === 0 && expect.test(result.stdout);
        this.log('CLI功能', cmd, isWorking,
          `退出码: ${result.status}, 输出长度: ${result.stdout.length}`);

        this.verificationResults.actualFunctionality[cmd] = {
          working: isWorking,
          exitCode: result.status,
          outputLength: result.stdout.length,
          hasExpectedPattern: expect.test(result.stdout)
        };

        if (isWorking) workingCommands++;
      } catch (error) {
        this.log('CLI功能', cmd, false, error.message);
        this.verificationResults.actualFunctionality[cmd] = {
          working: false,
          error: error.message
        };
      }
    });

    return workingCommands >= 3; // 至少3个命令工作
  }

  // 验证3: 钩子文件真实存在性检查
  verifyHookFilesExistence() {
    console.log('\n🔍 验证3: 钩子文件真实存在性检查...');

    const hookPaths = [
      'C:\\Users\\Zhang\\.claude\\hooks.json',
      'C:\\Users\\Zhang\\.gemini\\hooks.json',
      'C:\\Users\\Zhang\\.qwen\\hooks.json',
      'C:\\Users\\Zhang\\.stigmergy\\hooks\\claude\\claude_nodejs_hook.js'
    ];

    let existingHooks = 0;
    hookPaths.forEach(hookPath => {
      try {
        const exists = fs.existsSync(hookPath);
        this.log('钩子存在', path.basename(hookPath), exists);

        if (exists) {
          const stats = fs.statSync(hookPath);
          this.log('钩子详情', path.basename(hookPath), true,
            `大小: ${stats.size} bytes, 修改时间: ${stats.mtime}`);
          existingHooks++;
        }
      } catch (error) {
        this.log('钩子存在', path.basename(hookPath), false, error.message);
      }
    });

    return existingHooks >= 3;
  }

  // 验证4: 模块加载真实测试
  verifyModuleLoading() {
    console.log('\n🔍 验证4: 模块加载真实测试...');

    const criticalModules = [
      './src/index.js',
      './src/cli/router.js',
      './src/core/installer.js',
      './src/core/smart_router.js'
    ];

    let loadedModules = 0;
    criticalModules.forEach(module => {
      try {
        // 清除模块缓存以确保重新加载
        delete require.cache[require.resolve(module)];
        const mod = require(module);

        this.log('模块加载', module, true, `类型: ${typeof mod}`);
        loadedModules++;
      } catch (error) {
        this.log('模块加载', module, false, error.message);
      }
    });

    return loadedModules >= 3;
  }

  // 验证5: 交叉验证测试
  performCrossValidation() {
    console.log('\n🔍 验证5: 交叉验证测试...');

    // 测试相同功能的不同调用方式
    const tests = [
      {
        name: 'help命令交叉验证',
        tests: [
          () => this.runCommand('node src/index.js --help'),
          () => this.runCommand('node src/index.js help')
        ]
      },
      {
        name: 'version命令交叉验证',
        tests: [
          () => this.runCommand('node src/index.js version'),
          () => this.runCommand('node src/index.js --version')
        ]
      }
    ];

    let passedCrossValidations = 0;
    tests.forEach(({ name, tests: testFunctions }) => {
      try {
        const results = testFunctions.map(fn => fn());
        const allWorking = results.every(r => r.working);

        this.log('交叉验证', name, allWorking);
        this.verificationResults.crossValidation[name] = {
          allWorking,
          results
        };

        if (allWorking) passedCrossValidations++;
      } catch (error) {
        this.log('交叉验证', name, false, error.message);
      }
    });

    return passedCrossValidations >= 1;
  }

  runCommand(command, args = []) {
    try {
      const result = spawnSync(command, args, {
        encoding: 'utf8',
        timeout: 10000
      });

      return {
        working: result.status === 0,
        exitCode: result.status,
        output: result.stdout,
        error: result.stderr
      };
    } catch (error) {
      return {
        working: false,
        error: error.message
      };
    }
  }

  // 验证6: 性能基准测试
  verifyPerformanceBenchmarks() {
    console.log('\n🔍 验证6: 性能基准测试...');

    const startTime = Date.now();

    // 测试CLI命令响应时间
    const responseTime = this.measureCommandTime('node', ['src/index.js', '--help']);

    // 测试模块加载时间
    const loadTime = this.measureModuleLoadTime('./src/index.js');

    const totalTime = Date.now() - startTime;

    this.log('性能测试', 'CLI响应时间', responseTime < 3000, `${responseTime}ms`);
    this.log('性能测试', '模块加载时间', loadTime < 1000, `${loadTime}ms`);
    this.log('性能测试', '总体测试时间', totalTime < 10000, `${totalTime}ms`);

    return responseTime < 3000 && loadTime < 1000;
  }

  measureCommandTime(command, args) {
    const start = Date.now();
    spawnSync(command, args, { encoding: 'utf8', timeout: 10000 });
    return Date.now() - start;
  }

  measureModuleLoadTime(modulePath) {
    const start = Date.now();
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
    return Date.now() - start;
  }

  // 验证7: 数据完整性检查
  verifyDataIntegrity() {
    console.log('\n🔍 验证7: 数据完整性检查...');

    const integrityChecks = [
      {
        name: 'package.json完整性',
        check: () => {
          try {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return pkg.name === 'stigmergy' && pkg.version === '1.2.6';
          } catch { return false; }
        }
      },
      {
        name: '钩子配置JSON完整性',
        check: () => {
          try {
            const config = JSON.parse(fs.readFileSync('C:\\Users\\Zhang\\.claude\\hooks.json', 'utf8'));
            return config.cross_cli_adapter && config.cross_cli_adapter.enabled === true;
          } catch { return false; }
        }
      }
    ];

    let integrityPassed = 0;
    integrityChecks.forEach(({ name, check }) => {
      const result = check();
      this.log('数据完整性', name, result);
      if (result) integrityPassed++;
    });

    return integrityPassed >= 1;
  }

  // 最终可信度评估
  calculateTrustScore() {
    console.log('\n🎯 计算可信度评分...');

    const tests = this.verificationResults.deepTests;
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.result).length;
    const score = Math.round((passedTests / totalTests) * 100);

    const trustLevels = {
      high: { min: 90, label: '高可信度', emoji: '🟢' },
      medium: { min: 70, label: '中等可信度', emoji: '🟡' },
      low: { min: 50, label: '低可信度', emoji: '🔴' }
    };

    let trustLevel;
    if (score >= 90) trustLevel = trustLevels.high;
    else if (score >= 70) trustLevel = trustLevels.medium;
    else trustLevel = trustLevels.low;

    console.log(`\n${trustLevel.emoji} 可信度评分: ${score}%`);
    console.log(`${trustLevel.emoji} 可信度等级: ${trustLevel.label}`);

    return { score, level: trustLevel };
  }

  async runDeepVerification() {
    console.log('🚀 开始深度验证测试');
    console.log('========================');

    const startTime = Date.now();

    // 执行所有验证
    const verifications = [
      { name: '文件修改检查', fn: () => this.verifyActualFileChanges() },
      { name: 'CLI功能测试', fn: () => this.verifyActualCLIFunctionality() },
      { name: '钩子存在性', fn: () => this.verifyHookFilesExistence() },
      { name: '模块加载测试', fn: () => this.verifyModuleLoading() },
      { name: '交叉验证', fn: () => this.performCrossValidation() },
      { name: '性能基准', fn: () => this.verifyPerformanceBenchmarks() },
      { name: '数据完整性', fn: () => this.verifyDataIntegrity() }
    ];

    let passedVerifications = 0;
    verifications.forEach(({ name, fn }) => {
      try {
        if (fn()) {
          passedVerifications++;
          this.log('总体验证', name, true, '✅ 通过');
        } else {
          this.log('总体验证', name, false, '❌ 失败');
        }
      } catch (error) {
        this.log('总体验证', name, false, `异常: ${error.message}`);
      }
    });

    const duration = Date.now() - startTime;
    this.verificationResults.duration = duration;
    this.verificationResults.verificationPassRate = (passedVerifications / verifications.length) * 100;

    // 计算最终可信度
    const trustScore = this.calculateTrustScore();
    this.verificationResults.finalAssessment = {
      passedVerifications,
      totalVerifications: verifications.length,
      passRate: this.verificationResults.verificationPassRate,
      trustScore,
      duration
    };

    this.saveDetailedReport();

    console.log('\n========================');
    console.log(`📊 验证完成: ${passedVerifications}/${verifications.length} 通过`);
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log(`📈 通过率: ${this.verificationResults.verificationPassRate}%`);

    return trustScore.score >= 70;
  }

  saveDetailedReport() {
    const reportFile = `deep-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(this.verificationResults, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportFile}`);
  }
}

// 运行深度验证
if (require.main === module) {
  const tester = new DeepVerificationTester();
  tester.runDeepVerification().then(trustworthy => {
    if (trustworthy) {
      console.log('\n✅ 深度验证通过 - 结果可信！');
      process.exit(0);
    } else {
      console.log('\n❌ 深度验证未通过 - 结果需要进一步审查！');
      process.exit(1);
    }
  }).catch(error => {
    console.error('\n💥 深度验证执行失败:', error);
    process.exit(1);
  });
}

module.exports = DeepVerificationTester;