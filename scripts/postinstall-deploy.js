/**
 * Stigmergy Post-install 部署脚本
 * 在 npm install -g stigmergy 后自动：
 * 1. 运行 auto-install（安装 CLI tools）
 * 2. 部署 iflow 的 agents 和 skills 到各 CLI
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

async function postInstallDeploy() {
  console.log('\n🚀 Stigmergy 安装后配置...');
  console.log('=' .repeat(60));

  // 步骤1: 运行 auto-install
  console.log('\n📦 步骤 1/2: 自动安装 CLI tools...\n');

  try {
    await runCommand('node', ['src/index.js', 'auto-install']);
  } catch (error) {
    console.log('  ⚠️  Auto-install 遇到问题（这是正常的）');
  }

  // 步骤2: 部署 iflow 资源
  console.log('\n📦 步骤 2/2: 部署 iflow 的 agents 和 skills...\n');

  const bundleDir = path.join(__dirname, '..', 'config', 'bundle', 'iflow-bundle');

  // 检查 bundle 是否存在
  try {
    await fs.access(bundleDir);
  } catch (error) {
    console.log('  ⚠️  未找到 iflow 资源包（这是正常的）');
    console.log('  💡 如需部署，请先运行: node scripts/bundle-iflow-resources.js');
    return;
  }

  // 检查 config-bundle.json 是否存在
  const bundlePath = path.join(bundleDir, 'config-bundle.json');
  try {
    await fs.access(bundlePath);
  } catch (error) {
    console.log('  ⚠️  config-bundle.json 不存在');
    console.log('  💡 请先运行: node scripts/bundle-iflow-resources.js');
    return;
  }

  try {
    const ConfigDeployer = require('../src/core/config/ConfigDeployer');

    // 创建 deployer 实例
    const deployer = new ConfigDeployer({
      packageDir: bundleDir,
      force: true,  // 强制覆盖，确保首次安装时正确部署
      verbose: false,  // 静默模式，不干扰安装
      dryRun: false
    });

    // 执行部署
    const result = await deployer.run();

    if (result.success) {
      console.log('\n✅ 部署完成！');
      console.log(`📊 统计: ${result.summary.totalSuccess} 项成功, ${result.summary.totalSkip} 项跳过`);
    }

  } catch (error) {
    console.log('  ⚠️  资源部署遇到问题（这是正常的）');
    console.log(`  💡 可以稍后手动运行: stigmergy deploy`);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Stigmergy 安装完成！');
  console.log('💡 运行: stigmergy status\n');
}

/**
 * 运行命令
 */
function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// 运行部署（异步，不阻塞安装）
postInstallDeploy().catch(() => {
  // 静默失败，不干扰 npm install
  process.exit(0);
});
