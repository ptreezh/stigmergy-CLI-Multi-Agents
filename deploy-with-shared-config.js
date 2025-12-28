/**
 * 部署带共享配置的CLI集成
 */

const { CodeGenerator } = require('./packages/resume/dist/utils/CodeGenerator');
const fs = require('fs');
const path = require('path');
const os = require('os');

const cliTypes = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];
const projectPath = process.cwd();

async function deploy() {
  console.log('='.repeat(80));
  console.log('部署带共享配置的CLI集成');
  console.log('='.repeat(80));
  console.log();

  const generator = new CodeGenerator();

  // 首先复制共享配置加载器到每个CLI目录
  console.log('1️⃣ 复制共享配置加载器...');
  const sharedLoaderPath = path.join(__dirname, 'packages', 'resume', 'templates', 'shared', 'path-config-loader.js');

  if (!fs.existsSync(sharedLoaderPath)) {
    console.error('❌ 共享配置加载器不存在:', sharedLoaderPath);
    process.exit(1);
  }

  const sharedLoaderContent = fs.readFileSync(sharedLoaderPath, 'utf8');

  for (const cliType of cliTypes) {
    const cliDir = path.join(os.homedir(), `.${cliType}`, 'hooks');
    if (!fs.existsSync(cliDir)) {
      fs.mkdirSync(cliDir, { recursive: true });
    }
    
    const targetPath = path.join(cliDir, 'path-config-loader.js');
    fs.writeFileSync(targetPath, sharedLoaderContent, 'utf8');
    console.log(`   ✅ ${cliType}: ${targetPath}`);
  }
  console.log();

  // 然后部署集成代码
  console.log('2️⃣ 部署CLI集成代码...');
  const config = { version: '1.0.4', projectPath };

  for (const cliType of cliTypes) {
    try {
      await generator.generateIntegration(cliType, projectPath, config);
      console.log(`   ✅ ${cliType}`);
    } catch (error) {
      console.error(`   ❌ ${cliType}: ${error.message}`);
    }
  }
  console.log();

  console.log('='.repeat(80));
  console.log('✅ 部署完成');
  console.log('='.repeat(80));
  console.log();
  console.log('📋 部署内容:');
  console.log('   ✅ 共享配置加载器 (path-config-loader.js)');
  console.log('   ✅ 7个CLI集成文件');
  console.log();
  console.log('🔍 验证方式:');
  console.log('   1. 检查配置文件: ~/.stigmergy/resume/path-config.json');
  console.log('   2. 在任意CLI中运行: /stigmergy-resume');
  console.log('   3. 查看是否能正确扫描到会话历史');
  console.log();
}

// 运行部署
deploy().catch(error => {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
});
