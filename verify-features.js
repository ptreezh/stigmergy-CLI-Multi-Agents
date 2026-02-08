#!/usr/bin/env node

/**
 * 综合功能验证测试
 * 验证：
 * 1. package.json 是否包含所有 skills
 * 2. 并发模式命令是否可用
 * 3. Superpowers 部署脚本是否存在
 * 4. planning-with-files 技能是否包含
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('========================================');
console.log('  Stigmergy 功能验证测试');
console.log('========================================\n');

const results = [];
let totalTests = 0;
let passedTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  const passed = Boolean(condition);
  if (passed) passedTests++;

  results.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details && !passed) {
    console.log(`   ${details}`);
  }
}

async function runTests() {
  console.log('📦 测试 1: package.json 配置\n');

  // 读取 package.json
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  test(
    'package.json 存在',
    fs.existsSync(packagePath)
  );

  test(
    'version 字段已更新',
    packageJson.version.startsWith('1.3.')
  );

  test(
    'files 字段包含 src/**',
    packageJson.files.includes('src/**')
  );

  test(
    'files 字段包含 scripts/**',
    packageJson.files.includes('scripts/**')
  );

  test(
    'files 字段包含 skills/** (所有技能)',
    packageJson.files.includes('skills/**')
  );

  test(
    'files 字段不再只包含 resumesession',
    !packageJson.files.includes('skills/resumesession/**') ||
    packageJson.files.includes('skills/**')
  );

  console.log('\n📁 测试 2: 技能文件存在性\n');

  // 检查技能目录
  const skillsDir = path.join(__dirname, 'skills');
  test(
    'skills 目录存在',
    fs.existsSync(skillsDir)
  );

  const requiredSkills = [
    'planning-with-files',
    'resumesession',
    'using-superpowers',
    'strict-test-skill'
  ];

  const skillDirs = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir).filter(d => !d.startsWith('.'))
    : [];

  for (const skillName of requiredSkills) {
    const skillPath = path.join(skillsDir, skillName);
    const skillMdPath = path.join(skillPath, 'SKILL.md') || path.join(skillPath, 'skill.md');

    test(
      `技能 ${skillName} 存在`,
      fs.existsSync(skillPath),
      fs.existsSync(skillPath) ? skillPath : '目录不存在'
    );

    // 检查 SKILL.md 或 skill.md
    if (fs.existsSync(skillPath)) {
      const hasSkillMd = fs.existsSync(path.join(skillPath, 'SKILL.md')) ||
                        fs.existsSync(path.join(skillPath, 'skill.md'));

      test(
        `技能 ${skillName} 包含 SKILL.md`,
        hasSkillMd,
        hasSkillMd ? '✓ 找到技能文件' : '✗ 未找到技能文件'
      );
    }
  }

  console.log('\n🔌 测试 3: Superpowers 部署系统\n');

  // 检查核心文件
  const coreFiles = [
    { path: 'src/core/plugins/PluginDeployer.js', name: 'PluginDeployer' },
    { path: 'src/core/plugins/HookManager.js', name: 'HookManager' },
    { path: 'src/core/plugins/ContextInjector.js', name: 'ContextInjector' },
    { path: 'scripts/deploy-complete-superpowers.js', name: 'Superpowers 部署脚本' },
    { path: 'src/core/skills/BuiltinSkillsDeployer.js', name: 'BuiltinSkillsDeployer' },
    { path: 'src/core/skills/SkillSyncManager.js', name: 'SkillSyncManager' }
  ];

  for (const file of coreFiles) {
    const filePath = path.join(__dirname, file.path);
    test(
      `${file.name} 存在`,
      fs.existsSync(filePath),
      filePath
    );
  }

  console.log('\n⚡ 测试 4: 并发模式实现\n');

  // 检查并发模式文件
  const concurrentFiles = [
    { path: 'src/cli/commands/concurrent.js', name: 'Concurrent 命令处理器' },
    { path: 'dist/orchestration/core/CentralOrchestrator-WithLock.js', name: 'CentralOrchestrator-WithLock' },
    { path: 'dist/orchestration/managers/EnhancedTerminalManager.js', name: 'EnhancedTerminalManager' }
  ];

  for (const file of concurrentFiles) {
    const filePath = path.join(__dirname, file.path);
    test(
      `${file.name} 存在`,
      fs.existsSync(filePath),
      filePath
    );
  }

  // 检查 router-beta.js 中的 concurrent 命令注册
  const routerPath = path.join(__dirname, 'src/cli/router-beta.js');
  if (fs.existsSync(routerPath)) {
    const routerContent = fs.readFileSync(routerPath, 'utf8');

    test(
      'concurrent 命令已注册',
      routerContent.includes(".command('concurrent')") ||
      routerContent.includes('command("concurrent")')
    );

    test(
      'handleConcurrentCommand 已导入',
      routerContent.includes('handleConcurrentCommand')
    );
  }

  console.log('\n📊 测试 5: 部署脚本完整性\n');

  // 检查各 CLI 的部署脚本
  const deploymentScripts = [
    'scripts/deploy-iflow-workflow-v2.js',
    'scripts/deploy-qwen-extension-v2.js',
    'scripts/deploy-codebuddy-buddies-v2.js',
    'scripts/deploy-complete-superpowers.js'
  ];

  for (const script of deploymentScripts) {
    const scriptPath = path.join(__dirname, script);
    test(
      `部署脚本 ${path.basename(script)} 存在`,
      fs.existsSync(scriptPath),
      scriptPath
    );
  }

  console.log('\n🧪 测试 6: 命令行可用性\n');

  // 测试 stigmergy 命令是否可用
  console.log('测试: stigmergy --version');
  try {
    const versionResult = await spawnCommand('node', ['src/index.js', '--version'], 10000);
    test(
      'stigmergy --version 可执行',
      versionResult.success,
      versionResult.success ? versionResult.output : versionResult.error
    );
  } catch (error) {
    test(
      'stigmergy --version 可执行',
      false,
      error.message
    );
  }

  console.log('\n📝 测试总结\n');

  console.log('========================================');
  console.log(`总计: ${totalTests} 个测试`);
  console.log(`✅ 通过: ${passedTests} 个`);
  console.log(`❌ 失败: ${totalTests - passedTests} 个`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  // 保存测试报告
  const reportPath = path.join(__dirname, 'verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    passRate: (passedTests / totalTests) * 100,
    results
  }, null, 2));

  console.log(`📄 测试报告已保存到: ${reportPath}\n`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！\n');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败，请查看详细信息\n');
    process.exit(1);
  }
}

function spawnCommand(cmd, args, timeout = 10000) {
  return new Promise((resolve) => {
    let output = '';
    let error = '';

    const proc = spawn(cmd, args, {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      error += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill();
      resolve({ success: false, error: 'Timeout', output });
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        output,
        error,
        exitCode: code
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ success: false, error: err.message, output });
    });
  });
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试执行失败:', error.message);
  console.error(error.stack);
  process.exit(1);
});
