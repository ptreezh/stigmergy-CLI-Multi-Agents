const { CodeGenerator } = require('@stigmergy/resume/dist/index');
const { ShareMemConfig } = require('@stigmergy/resume/dist/types');

// 创建一个测试配置
const config = {
  projectPath: process.cwd(),
  selectedCLIs: ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex', 'kode'],
  initializedAt: new Date(),
  version: '1.2.2-beta.1'
};

console.log('🔍 Testing Kode CLI integration...');

try {
  const generator = new CodeGenerator();
  
  // 测试生成Kode模板
  const kodeTemplate = generator.generateKodeTemplate({ 
    cliType: 'kode', 
    projectPath: process.cwd(), 
    config: config 
  });
  
  console.log('✅ Kode template generated successfully');
  console.log('Template length:', kodeTemplate.length);
  
  // 验证模板中包含关键部分
  if (kodeTemplate.includes('stigmergy-resume')) {
    console.log('✅ Template contains stigmergy-resume command');
  } else {
    console.log('❌ Template missing stigmergy-resume command');
  }
  
  if (kodeTemplate.includes('kode.addExtension')) {
    console.log('✅ Template contains kode.addExtension call');
  } else {
    console.log('❌ Template missing kode.addExtension call');
  }
  
  if (kodeTemplate.includes('Kode CLI ResumeSession Integration')) {
    console.log('✅ Template contains correct header');
  } else {
    console.log('❌ Template missing correct header');
  }
  
  // 测试生成其他CLI的模板确保其他功能也正常
  const claudeTemplate = generator.generateClaudeTemplate({ 
    cliType: 'claude', 
    projectPath: process.cwd(), 
    config: config 
  });
  
  console.log('✅ Claude template also works, length:', claudeTemplate.length);
  
  // 测试kode是否在CLI类型映射中
  console.log('Testing dynamic generation for kode CLI...');
  
  // 创建一个临时测试目录来测试集成生成
  const fs = require('fs');
  const path = require('path');
  
  // 创建一个临时的测试项目
  const testProjectPath = path.join(__dirname, 'temp-test-project');
  if (!fs.existsSync(testProjectPath)) {
    fs.mkdirSync(testProjectPath, { recursive: true });
  }
  
  console.log('✅ Created temporary test project');
  
  // 尝试生成Kode集成文件
  generator.generateIntegration('kode', testProjectPath, config)
    .then(() => {
      console.log('✅ Kode integration file generated successfully');
      
      // 检查生成的文件
      const integrationPath = path.join(testProjectPath, '.kode', 'agents', 'resumesession-history.js');
      if (fs.existsSync(integrationPath)) {
        console.log('✅ Kode integration file exists at:', integrationPath);
        const content = fs.readFileSync(integrationPath, 'utf8');
        console.log('✅ Integration file content length:', content.length);
        
        if (content.includes('stigmergy-resume')) {
          console.log('✅ Integration file contains expected command');
        }
      } else {
        console.log('❌ Kode integration file was not created at expected location');
      }
      
      // 测试其他CLI集成是否也正常工作
      return generator.generateIntegration('claude', testProjectPath, config);
    })
    .then(() => {
      console.log('✅ Claude integration also works');
      
      const claudeIntegrationPath = path.join(testProjectPath, '.claude', 'hooks', 'resumesession-history.js');
      if (fs.existsSync(claudeIntegrationPath)) {
        console.log('✅ Claude integration file exists');
      } else {
        console.log('⚠️  Claude integration file was not created (may be expected if template file missing)');
      }
    })
    .catch(err => {
      console.error('❌ Error during integration generation:', err.message);
    });

} catch (error) {
  console.error('❌ Error during Kode CLI integration test:', error.message);
  console.error('Stack:', error.stack);
}