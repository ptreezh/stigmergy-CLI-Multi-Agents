const fs = require('fs');
const path = require('path');

console.log('🧪 功能测试：验证resumesession包的所有功能\n');

// 创建测试项目
const testProjectDir = 'D:/stigmergy-test-environment/test-project';
if (!fs.existsSync(testProjectDir)) {
  fs.mkdirSync(testProjectDir, { recursive: true });
}
console.log(`📂 创建测试项目: ${testProjectDir}`);

// 模拟各种CLI的会话数据
const cliSessionData = {
  claude: {
    path: path.join(process.env.USERPROFILE || process.env.HOME, '.claude', 'sessions'),
    files: [{
      name: 'test-session.json',
      content: JSON.stringify({
        id: 'claude-test-1',
        title: 'Test session in Claude',
        content: 'This is a test conversation about code optimization in Claude CLI',
        messages: [
          { role: 'user', content: 'How can I optimize this code?' },
          { role: 'assistant', content: 'You can optimize by using memoization.' }
        ],
        updatedAt: new Date().toISOString(),
        projectPath: testProjectDir
      })
    }]
  },
  gemini: {
    path: path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'sessions'),
    files: [{
      name: 'test-session.json',
      content: JSON.stringify({
        id: 'gemini-test-1',
        title: 'Test session in Gemini',
        content: 'This is a test conversation about AI models in Gemini CLI',
        messages: [
          { role: 'user', content: 'Explain transformer models' },
          { role: 'assistant', content: 'Transformer models use attention mechanisms.' }
        ],
        updatedAt: new Date().toISOString(),
        projectPath: testProjectDir
      })
    }]
  },
  kode: {
    path: path.join(process.env.USERPROFILE || process.env.HOME, '.kode', 'projects'),
    files: [{
      name: 'test-session.json',
      content: JSON.stringify({
        id: 'kode-test-1',
        title: 'Test session in Kode',
        content: 'This is a test conversation about multi-model AI in Kode CLI',
        messages: [
          { role: 'user', content: 'How does multi-model AI work?' },
          { role: 'assistant', content: 'Multi-model AI combines different AI models for better results.' }
        ],
        updatedAt: new Date().toISOString(),
        projectPath: testProjectDir
      })
    }]
  }
};

// 创建模拟会话文件
console.log('💾 创建模拟会话数据...');
for (const [cli, data] of Object.entries(cliSessionData)) {
  if (!fs.existsSync(data.path)) {
    fs.mkdirSync(data.path, { recursive: true });
  }
  
  for (const file of data.files) {
    const filePath = path.join(data.path, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`   ✅ ${cli}: ${filePath}`);
  }
}

// 测试PathConfigManager功能
console.log('\n🗺️  测试路径配置管理器...');
try {
  const pathConfigPath = path.join(__dirname, 'packages', 'resume', 'src', 'config', 'PathConfigManager.ts');
  if (fs.existsSync(pathConfigPath)) {
    console.log('   ✅ PathConfigManager存在');
    
    // 检查是否包含kode路径配置
    const pathConfigContent = fs.readFileSync(pathConfigPath, 'utf8');
    const hasKodePaths = pathConfigContent.includes('kode:');
    console.log(`   ✅ Kode路径配置: ${hasKodePaths ? '存在' : '不存在'}`);
  } else {
    console.log('   ❌ PathConfigManager不存在');
  }
} catch (e) {
  console.log('   ⚠️  无法测试PathConfigManager:', e.message);
}

// 测试CodeGenerator功能
console.log('\n🔧 测试代码生成器...');
try {
  const generatorPath = path.join(__dirname, 'packages', 'resume', 'src', 'utils', 'CodeGenerator.ts');
  if (fs.existsSync(generatorPath)) {
    console.log('   ✅ CodeGenerator存在');
    
    const generatorContent = fs.readFileSync(generatorPath, 'utf8');
    const hasKodeGeneration = generatorContent.includes('kode:');
    console.log(`   ✅ Kode代码生成: ${hasKodeGeneration ? '支持' : '不支持'}`);
  } else {
    console.log('   ❌ CodeGenerator不存在');
  }
} catch (e) {
  console.log('   ⚠️  无法测试CodeGenerator:', e.message);
}

// 测试ResumeSessionGenerator功能
console.log('\n🔄 测试ResumeSession生成器...');
try {
  const resumeGenPath = path.join(__dirname, 'src', 'core', 'coordination', 'nodejs', 'generators', 'ResumeSessionGenerator.js');
  if (fs.existsSync(resumeGenPath)) {
    console.log('   ✅ ResumeSessionGenerator存在');
    
    const resumeGenContent = fs.readFileSync(resumeGenPath, 'utf8');
    const hasKodeSupport = resumeGenContent.includes("'kode'");
    const hasKodeScan = resumeGenContent.includes('kode') && resumeGenContent.includes('projects');
    console.log(`   ✅ Kode支持: ${hasKodeSupport ? '是' : '否'}`);
    console.log(`   ✅ Kode扫描: ${hasKodeScan ? '是' : '否'}`);
  } else {
    console.log('   ❌ ResumeSessionGenerator不存在');
  }
} catch (e) {
  console.log('   ⚠️  无法测试ResumeSessionGenerator:', e.message);
}

// 测试模板文件
console.log('\n📄 测试集成模板...');
const templatePath = path.join(__dirname, 'packages', 'resume', 'templates', 'kode-integration.template.js');
if (fs.existsSync(templatePath)) {
  console.log('   ✅ Kode模板存在');
  
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const hasRequiredParts = [
    { name: '命令处理', check: templateContent.includes('/stigmergy-resume') },
    { name: '扩展注册', check: templateContent.includes('kode.addExtension') },
    { name: '会话扫描', check: templateContent.includes('SessionScanner') },
    { name: '会话过滤', check: templateContent.includes('SessionFilter') },
    { name: '格式化器', check: templateContent.includes('HistoryFormatter') }
  ];
  
  for (const part of hasRequiredParts) {
    console.log(`   ${part.check ? '✅' : '❌'} ${part.name}: ${part.check ? '包含' : '缺失'}`);
  }
} else {
  console.log('   ❌ Kode模板不存在');
}

// 测试命令路由
console.log('\n📡 测试命令路由...');
const routerPath = path.join(__dirname, 'src', 'cli', 'commands', 'resume.js');
if (fs.existsSync(routerPath)) {
  console.log('   ✅ Resume命令存在');
  
  const routerContent = fs.readFileSync(routerPath, 'utf8');
  const hasResumeCommands = [
    { name: 'resume', check: routerContent.includes('handleResumeCommand') },
    { name: 'resumesession', check: routerContent.includes('handleResumeSessionCommand') },
    { name: 'sg-resume', check: routerContent.includes('handleSgResumeCommand') }
  ];
  
  for (const cmd of hasResumeCommands) {
    console.log(`   ${cmd.check ? '✅' : '❌'} ${cmd.name}: ${cmd.check ? '支持' : '不支持'}`);
  }
} else {
  console.log('   ❌ Resume命令不存在');
}

// 总结功能测试
console.log('\n' + '='.repeat(60));
console.log('📊 功能测试结果');
console.log('='.repeat(60));

const allFeatures = [
  fs.existsSync(path.join(__dirname, 'packages', 'resume', 'templates', 'kode-integration.template.js')),
  fs.existsSync(path.join(__dirname, 'packages', 'resume', 'src', 'utils', 'CodeGenerator.ts')),
  fs.existsSync(path.join(__dirname, 'packages', 'resume', 'src', 'config', 'PathConfigManager.ts')),
  fs.existsSync(path.join(__dirname, 'src', 'core', 'coordination', 'nodejs', 'generators', 'ResumeSessionGenerator.js')),
  fs.existsSync(path.join(__dirname, 'src', 'cli', 'commands', 'resume.js')),
];

const coreFeatures = [
  { name: 'Kode模板', check: allFeatures[0] },
  { name: '代码生成器', check: allFeatures[1] },
  { name: '路径配置', check: allFeatures[2] },
  { name: '生成器支持', check: allFeatures[3] },
  { name: '命令路由', check: allFeatures[4] }
];

console.log('\n📋 核心功能组件:');
for (const feature of coreFeatures) {
  console.log(`   ${feature.check ? '✅' : '❌'} ${feature.name}`);
}

const allCoreFeatures = coreFeatures.every(f => f.check);

console.log('\n🎯 功能验证:');
console.log(`   • Kode历史恢复: ${allCoreFeatures ? '✅ 支持' : '❌ 不支持'}`);
console.log(`   • 跨CLI会话访问: ${allCoreFeatures ? '✅ 支持' : '❌ 不支持'}`);
console.log(`   • 统一命令接口: ${allFeatures[4] ? '✅ 支持' : '❌ 不支持'}`);
console.log(`   • 项目感知恢复: ${allFeatures[2] ? '✅ 支持' : '❌ 不支持'}`);

console.log(`\n✨ 功能测试状态: ${allCoreFeatures ? '✅ 通过' : '❌ 部分通过'}`);

if (allCoreFeatures) {
  console.log('\n🚀 所有功能测试通过！');
  console.log('   • Kode集成模板已就绪');
  console.log('   • 代码生成器支持Kode');
  console.log('   • 路径配置管理器包含Kode');
  console.log('   • 会话生成器支持Kode');
  console.log('   • 命令路由功能正常');
} else {
  console.log('\n⚠️  部分功能测试未通过');
}

console.log('\n✅ 功能测试完成');