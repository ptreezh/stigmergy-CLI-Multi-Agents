#!/usr/bin/env node

/**
 * 快速测试脚本
 * 测试核心功能是否正常工作
 */

const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

async function testModuleImport(modulePath, moduleName) {
  try {
    const module = require(modulePath);
    success(`${moduleName} 模块导入成功`);
    return { success: true, module };
  } catch (err) {
    error(`${moduleName} 模块导入失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testDirectoryCreation() {
  info('测试目录创建功能...');

  const testDir = path.join(process.cwd(), '.test-temp-' + Date.now());

  try {
    // 测试创建目录
    fs.mkdirSync(testDir, { recursive: true });
    success(`创建测试目录: ${testDir}`);

    // 测试创建嵌套目录
    const nestedDir = path.join(testDir, 'level1', 'level2', 'level3');
    fs.mkdirSync(nestedDir, { recursive: true });
    success(`创建嵌套目录: ${nestedDir}`);

    // 测试创建文件
    const testFile = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFile, 'test content');
    success(`创建测试文件: ${testFile}`);

    // 清理
    fs.rmSync(testDir, { recursive: true, force: true });
    success(`清理测试目录: ${testDir}`);

    return { success: true };
  } catch (err) {
    error(`目录创建测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testCLIPathDetector() {
  info('测试CLI路径检测...');

  try {
    const CLIPathDetector = require('../src/core/cli_path_detector');
    const detector = new CLIPathDetector();

    success('CLIPathDetector 实例化成功');

    // 测试获取npm全局路径
    const npmPaths = detector.getNPMGlobalPaths();
    success(`获取npm全局路径: ${npmPaths.length} 个路径`);

    // 测试检测CLI
    const detected = await detector.detectAllCLIPaths();
    success(`检测CLI工具: ${Object.keys(detected).length} 个工具`);

    return { success: true, detected };
  } catch (err) {
    error(`CLI路径检测测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testInstaller() {
  info('测试安装器...');

  try {
    const StigmergyInstaller = require('../src/core/installer');
    const installer = new StigmergyInstaller();

    success('StigmergyInstaller 实例化成功');

    // 测试检查CLI
    const claudeInstalled = await installer.checkCLI('claude');
    success(`检查Claude CLI: ${claudeInstalled ? '已安装' : '未安装'}`);

    return { success: true };
  } catch (err) {
    error(`安装器测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testSkillsManager() {
  info('测试技能管理器...');

  try {
    const StigmergySkillManager = require('../src/core/skills/StigmergySkillManager');
    const skillsManager = new StigmergySkillManager();

    success('StigmergySkillManager 实例化成功');

    // 测试扫描技能
    const skills = await skillsManager.scanSkills();
    success(`扫描技能: ${skills.length} 个技能`);

    return { success: true, skills };
  } catch (err) {
    error(`技能管理器测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testSkillSync() {
  info('测试技能同步...');

  try {
    const SkillSyncManager = require('../src/core/skills/SkillSyncManager');
    const syncManager = new SkillSyncManager();

    success('SkillSyncManager 实例化成功');

    return { success: true };
  } catch (err) {
    error(`技能同步测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testBuiltinSkillsDeployer() {
  info('测试内置技能部署器...');

  try {
    const BuiltinSkillsDeployer = require('../src/core/skills/BuiltinSkillsDeployer');
    const deployer = new BuiltinSkillsDeployer();

    success('BuiltinSkillsDeployer 实例化成功');

    // 测试获取内置技能列表
    const builtinSkills = deployer.getBuiltinSkills();
    success(`获取内置技能: ${builtinSkills.length} 个技能`);

    return { success: true, builtinSkills };
  } catch (err) {
    error(`内置技能部署器测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testSmartRouter() {
  info('测试智能路由...');

  try {
    const SmartRouter = require('../src/core/smart_router');
    const router = new SmartRouter();

    success('SmartRouter 实例化成功');

    // 测试路由工具
    const tools = router.tools;
    success(`路由工具: ${Object.keys(tools).length} 个工具`);

    return { success: true };
  } catch (err) {
    error(`智能路由测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function testMemoryManager() {
  info('测试内存管理器...');

  try {
    const MemoryManager = require('../src/core/memory_manager');
    const memory = new MemoryManager();

    success('MemoryManager 实例化成功');

    return { success: true };
  } catch (err) {
    error(`内存管理器测试失败: ${err.message}`);
    return { success: false, error: err };
  }
}

async function main() {
  log('\n🧪 Stigmergy CLI 快速功能测试', 'cyan');
  log('================================\n', 'cyan');

  const results = {
    directoryCreation: null,
    cliPathDetector: null,
    installer: null,
    skillsManager: null,
    skillSync: null,
    builtinSkillsDeployer: null,
    smartRouter: null,
    memoryManager: null
  };

  // 运行测试
  results.directoryCreation = await testDirectoryCreation();
  log('');
  results.cliPathDetector = await testCLIPathDetector();
  log('');
  results.installer = await testInstaller();
  log('');
  results.skillsManager = await testSkillsManager();
  log('');
  results.skillSync = await testSkillSync();
  log('');
  results.builtinSkillsDeployer = await testBuiltinSkillsDeployer();
  log('');
  results.smartRouter = await testSmartRouter();
  log('');
  results.memoryManager = await testMemoryManager();

  // 汇总结果
  log('\n📊 测试结果汇总', 'cyan');
  log('================================\n', 'cyan');

  let passed = 0;
  let failed = 0;

  Object.keys(results).forEach(testName => {
    const result = results[testName];
    if (result && result.success) {
      success(`${testName}`);
      passed++;
    } else {
      error(`${testName}`);
      failed++;
    }
  });

  log('');
  log(`总计: ${passed + failed} 个测试`, 'cyan');
  success(`通过: ${passed} 个`);
  if (failed > 0) {
    error(`失败: ${failed} 个`);
  }

  log('');
  if (failed === 0) {
    log('🎉 所有测试通过！', 'green');
    process.exit(0);
  } else {
    log('⚠️  部分测试失败，请检查错误信息', 'yellow');
    process.exit(1);
  }
}

main().catch(err => {
  error(`测试运行失败: ${err.message}`);
  console.error(err);
  process.exit(1);
});