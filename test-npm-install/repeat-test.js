#!/usr/bin/env node

/**
 * 重复安装卸载测试脚本
 * 验证npm生命周期钩子的可靠性和配置管理
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔄 重复安装卸载测试');
console.log('='.repeat(60));

const homeDir = os.homedir();
const stigmergyDir = path.join(homeDir, '.stigmergy');
const tgzPath = path.join(__dirname, 'stigmergy-cli-1.2.9.tgz');

// 检查关键配置文件
const keyFiles = [
  path.join(homeDir, '.claude', 'hooks.json'),
  path.join(homeDir, '.gemini', 'extensions.json'),
  path.join(homeDir, '.qwen', 'hooks.json'),
  path.join(homeDir, '.iflow', 'hooks.json'),
  path.join(homeDir, '.codebuddy', 'buddy_config.json'),
  path.join(homeDir, '.copilot', 'mcp-config.json')
];

function checkConfiguration() {
  const results = {
    stigmergyDir: fs.existsSync(stigmergyDir),
    keyFiles: {},
    totalKeyFiles: 0,
    installedKeyFiles: 0
  };
  
  keyFiles.forEach(file => {
    const exists = fs.existsSync(file);
    results.keyFiles[path.basename(path.dirname(file))] = exists;
    if (exists) results.installedKeyFiles++;
  });
  
  results.totalKeyFiles = keyFiles.length;
  return results;
}

function runCommand(cmd, args, description) {
  console.log(`\n▶️ ${description}`);
  console.log(`  命令: ${cmd} ${args.join(' ')}`);
  
  const result = spawnSync(cmd, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: true,
    timeout: 120000 // 2分钟超时
  });
  
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  
  // 查找关键输出
  const hasAutoInstall = stdout.includes('AUTO-INSTALL STARTING') || 
                        stderr.includes('AUTO-INSTALL STARTING');
  const hasScanning = stdout.includes('Scanning for AI CLI tools') || 
                     stderr.includes('Scanning for AI CLI tools');
  const hasPreuninstall = stdout.includes('PRE-UNINSTALL CLEANUP') || 
                         stderr.includes('PRE-UNINSTALL CLEANUP');
  
  return {
    success: result.status === 0,
    exitCode: result.status,
    stdout,
    stderr,
    hasAutoInstall,
    hasScanning,
    hasPreuninstall
  };
}

async function runInstallUninstallCycle(cycleNumber) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🔄 第 ${cycleNumber} 次循环`);
  console.log(`${'='.repeat(50)}`);
  
  // 初始状态检查
  const initialConfig = checkConfiguration();
  console.log(`📊 初始状态: .stigmergy目录 ${initialConfig.stigmergyDir ? '存在' : '不存在'}`);
  console.log(`  配置文件: ${initialConfig.installedKeyFiles}/${initialConfig.totalKeyFiles}`);
  
  // 步骤1: 安装
  console.log(`\n📦 步骤1: 安装 stigmergy-cli`);
  const installResult = runCommand('npm', ['install', '-g', tgzPath], 'npm安装');
  
  console.log(`  退出码: ${installResult.exitCode}`);
  console.log(`  安装结果: ${installResult.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`  Postinstall输出: ${installResult.hasAutoInstall ? '✅ 可见' : '❌ 未找到'}`);
  
  // 安装后状态检查
  const afterInstallConfig = checkConfiguration();
  console.log(`\n📊 安装后状态:`);
  console.log(`  .stigmergy目录: ${afterInstallConfig.stigmergyDir ? '✅ 已创建' : '❌ 未创建'}`);
  console.log(`  配置文件: ${afterInstallConfig.installedKeyFiles}/${afterInstallConfig.totalKeyFiles}`);
  
  // 列出创建的配置文件
  if (afterInstallConfig.installedKeyFiles > 0) {
    console.log(`  具体配置:`);
    Object.entries(afterInstallConfig.keyFiles).forEach(([cli, exists]) => {
      console.log(`    ${cli}: ${exists ? '✅' : '❌'}`);
    });
  }
  
  // 步骤2: 验证stigmergy命令
  console.log(`\n🔍 步骤2: 验证stigmergy命令`);
  const versionResult = runCommand('stigmergy', ['--version'], '版本检查');
  const helpResult = runCommand('stigmergy', ['--help'], '帮助信息');
  
  console.log(`  版本命令: ${versionResult.success ? '✅ 可用' : '❌ 失败'}`);
  if (versionResult.success && versionResult.stdout) {
    console.log(`  版本信息: ${versionResult.stdout.trim()}`);
  }
  console.log(`  帮助命令: ${helpResult.success ? '✅ 可用' : '❌ 失败'}`);
  
  // 步骤3: 运行auto-install查看详细输出
  console.log(`\n⚙️ 步骤3: 运行auto-install`);
  const autoInstallResult = runCommand('stigmergy', ['auto-install'], 'auto-install命令');
  console.log(`  auto-install: ${autoInstallResult.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`  扫描输出: ${autoInstallResult.hasScanning ? '✅ 可见' : '❌ 未找到'}`);
  
  // 步骤4: 卸载
  console.log(`\n🗑️ 步骤4: 卸载 stigmergy-cli`);
  const uninstallResult = runCommand('npm', ['uninstall', '-g', 'stigmergy-cli'], 'npm卸载');
  
  console.log(`  退出码: ${uninstallResult.exitCode}`);
  console.log(`  卸载结果: ${uninstallResult.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`  Preuninstall输出: ${uninstallResult.hasPreuninstall ? '✅ 可见' : '❌ 未找到'}`);
  
  // 卸载后状态检查
  const afterUninstallConfig = checkConfiguration();
  console.log(`\n📊 卸载后状态:`);
  console.log(`  .stigmergy目录: ${afterUninstallConfig.stigmergyDir ? '❌ 仍然存在' : '✅ 已清理'}`);
  console.log(`  配置文件: ${afterUninstallConfig.installedKeyFiles}/${afterUninstallConfig.totalKeyFiles}`);
  
  // 检查残留文件
  if (afterUninstallConfig.installedKeyFiles > 0) {
    console.log(`  ⚠️  残留配置文件:`);
    Object.entries(afterUninstallConfig.keyFiles).forEach(([cli, exists]) => {
      if (exists) {
        console.log(`    ${cli}: ❌ 未清理`);
      }
    });
  }
  
  return {
    cycleNumber,
    installSuccess: installResult.success,
    installHasOutput: installResult.hasAutoInstall,
    afterInstallConfig,
    commandValid: versionResult.success && helpResult.success,
    autoInstallSuccess: autoInstallResult.success,
    uninstallSuccess: uninstallResult.success,
    uninstallHasOutput: uninstallResult.hasPreuninstall,
    afterUninstallConfig,
    configCleaned: !afterUninstallConfig.stigmergyDir && afterUninstallConfig.installedKeyFiles === 0
  };
}

async function runMultipleCycles(cycles = 3) {
  const results = [];
  
  for (let i = 1; i <= cycles; i++) {
    const result = await runInstallUninstallCycle(i);
    results.push(result);
    
    // 循环间暂停
    if (i < cycles) {
      console.log(`\n⏳ 等待3秒后继续下一个循环...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return results;
}

// 生成摘要报告
function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 测试报告摘要');
  console.log('='.repeat(60));
  
  let allPass = true;
  
  results.forEach((result, index) => {
    const cycleNum = index + 1;
    console.log(`\n🔄 第 ${cycleNum} 次循环结果:`);
    
    const installOk = result.installSuccess ? '✅' : '❌';
    const installOutputOk = result.installHasOutput ? '✅' : '❌';
    const commandsOk = result.commandValid ? '✅' : '❌';
    const uninstallOk = result.uninstallSuccess ? '✅' : '❌';
    const uninstallOutputOk = result.uninstallHasOutput ? '✅' : '❌';
    const cleanupOk = result.configCleaned ? '✅' : '❌';
    
    console.log(`  安装: ${installOk} 成功, ${installOutputOk} 输出可见`);
    console.log(`  命令: ${commandsOk} 可用`);
    console.log(`  卸载: ${uninstallOk} 成功, ${uninstallOutputOk} 输出可见`);
    console.log(`  清理: ${cleanupOk} 配置文件`);
    
    if (result.afterInstallConfig.stigmergyDir) {
      console.log(`  安装创建文件: ${result.afterInstallConfig.installedKeyFiles} 个配置文件`);
    }
    if (!result.configCleaned) {
      console.log(`  ⚠️  残留: ${result.afterUninstallConfig.installedKeyFiles} 个配置文件未清理`);
    }
    
    const cyclePass = result.installSuccess && result.installHasOutput &&
                      result.commandValid && result.uninstallSuccess &&
                      result.uninstallHasOutput && result.configCleaned;
    
    if (!cyclePass) allPass = false;
  });
  
  // 总体统计
  console.log('\n' + '='.repeat(60));
  console.log('📈 总体统计');
  console.log('='.repeat(60));
  
  const totalCycles = results.length;
  const successfulInstalls = results.filter(r => r.installSuccess && r.installHasOutput).length;
  const successfulCommands = results.filter(r => r.commandValid).length;
  const successfulUninstalls = results.filter(r => r.uninstallSuccess && r.uninstallHasOutput).length;
  const completeCleanups = results.filter(r => r.configCleaned).length;
  
  console.log(`总循环次数: ${totalCycles}`);
  console.log(`成功安装(含输出): ${successfulInstalls}/${totalCycles}`);
  console.log(`命令可用: ${successfulCommands}/${totalCycles}`);
  console.log(`成功卸载(含输出): ${successfulUninstalls}/${totalCycles}`);
  console.log(`完全清理: ${completeCleanups}/${totalCycles}`);
  
  if (allPass) {
    console.log('\n🎉 所有测试通过: npm生命周期钩子工作正常!');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步检查:');
    
    if (successfulInstalls < totalCycles) {
      console.log('  • 安装过程输出可能被npm缓冲');
    }
    if (completeCleanups < totalCycles) {
      console.log('  • 卸载后配置文件残留');
      console.log('  • 建议检查preuninstall脚本执行情况');
    }
  }
  
  // 详细建议
  console.log('\n💡 改进建议:');
  console.log('  1. 确保npm生命周期脚本有正确的shebang (#!)');
  console.log('  2. 在Windows上验证脚本执行权限');
  console.log('  3. 考虑使用npm install --verbose查看详细输出');
  console.log('  4. 检查npm环境变量(npm_lifecycle_event)是否传递正确');
  
  return allPass;
}

// 主函数
async function main() {
  try {
    console.log(`测试包路径: ${tgzPath}`);
    console.log(`配置文件目录: ${stigmergyDir}`);
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    
    // 检查tgz文件是否存在
    if (!fs.existsSync(tgzPath)) {
      console.error(`❌ 找不到tgz文件: ${tgzPath}`);
      console.error('请先运行: npm pack');
      process.exit(1);
    }
    
    // 运行多个循环
    const results = await runMultipleCycles(3);
    
    // 生成报告
    const allPass = generateReport(results);
    
    console.log(`\n🏁 测试完成时间: ${new Date().toLocaleString()}`);
    process.exit(allPass ? 0 : 1);
    
  } catch (error) {
    console.error(`❌ 测试执行失败: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行
main();