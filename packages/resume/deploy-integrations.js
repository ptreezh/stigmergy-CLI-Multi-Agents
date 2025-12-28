// 直接部署集成文件到当前项目
const { CodeGenerator } = require('./dist/utils/CodeGenerator');
const path = require('path');

const projectPath = 'D:\\stigmergy-CLI-Multi-Agents';
const config = {
  version: '1.0.4',
  enabledCLIs: ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex']
};

const generator = new CodeGenerator();

console.log('🚀 部署 resumesession 集成到项目...\n');
console.log(`📁 项目路径: ${projectPath}\n`);

async function deployAll() {
  for (const cliType of config.enabledCLIs) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 部署 ${cliType.toUpperCase()} 集成...`);
      console.log('='.repeat(60));
      
      await generator.generateIntegration(cliType, projectPath, config);
      
      console.log(`✅ ${cliType.toUpperCase()} 集成部署成功`);
    } catch (error) {
      console.error(`❌ ${cliType.toUpperCase()} 集成部署失败:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有集成部署完成');
  console.log('='.repeat(60));
}

deployAll().catch(console.error);
