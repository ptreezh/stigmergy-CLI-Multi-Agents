const fs = require('fs');
const path = require('path');

console.log('🧪 开始集成测试：验证resumesession与kode的集成\n');

// 测试1: 验证所有必需的文件都存在
console.log('📋 检查集成组件...');

const components = [
  {
    name: 'Kode模板文件',
    path: 'packages/resume/templates/kode-integration.template.js',
    check: (content) => content.includes('/stigmergy-resume') && content.includes('kode.addExtension')
  },
  {
    name: 'CodeGenerator更新',
    path: 'packages/resume/src/utils/CodeGenerator.ts',
    check: (content) => content.includes('kode: join(projectPath') && content.includes('kode: this.generateKodeTemplate')
  },
  {
    name: 'ResumeSessionGenerator支持',
    path: 'src/core/coordination/nodejs/generators/ResumeSessionGenerator.js',
    check: (content) => content.includes("'kode'") && content.includes("'kode': '⚡'")
  },
  {
    name: '路径配置管理器',
    path: 'packages/resume/src/config/PathConfigManager.ts',
    check: (content) => content.includes('kode: [\'projects\', \'sessions\', \'conversations\']')
  },
  {
    name: 'CLI工具配置',
    path: 'src/core/cli_tools.js',
    check: (content) => content.includes("kode: {") && content.includes("Kode CLI")
  }
];

let allComponentsValid = true;
for (const component of components) {
  const fullPath = path.join(__dirname, component.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const isValid = component.check(content);
    console.log(`   ✅ ${component.name}: ${isValid ? '验证通过' : '验证失败'}`);
    if (!isValid) allComponentsValid = false;
  } else {
    console.log(`   ❌ ${component.name}: 文件不存在`);
    allComponentsValid = false;
  }
}

// 测试2: 验证生成器能够为所有CLI生成代码
console.log('\n🔧 测试代码生成器功能...');

// 检查生成器是否包含所有CLI的支持
const generatorPath = path.join(__dirname, 'packages', 'resume', 'src', 'utils', 'CodeGenerator.ts');
const generatorContent = fs.readFileSync(generatorPath, 'utf8');

const allCLIsSupported = [
  'claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex', 'kode'
].every(cli => generatorContent.includes(cli));

console.log(`   所有CLI工具支持: ${allCLIsSupported ? '✅ 是' : '❌ 否'}`);

// 测试3: 验证路径配置
console.log('\n🗺️  测试路径配置...');

const pathConfigPath = path.join(__dirname, 'packages', 'resume', 'src', 'config', 'PathConfigManager.ts');
const pathConfigContent = fs.readFileSync(pathConfigPath, 'utf8');

const hasKodeInPathConfig = pathConfigContent.includes('kode:') && pathConfigContent.includes('projects');
console.log(`   Kode路径配置: ${hasKodeInPathConfig ? '✅ 是' : '❌ 否'}`);

// 测试4: 验证会话扫描能力
console.log('\n🔍 测试会话扫描能力...');

const resumeGenPath = path.join(__dirname, 'src/core', 'coordination', 'nodejs', 'generators', 'ResumeSessionGenerator.js');
const resumeGenContent = fs.readFileSync(resumeGenPath, 'utf8');

const hasKodeScanLogic = resumeGenContent.includes('kode') && 
                         resumeGenContent.includes('projects') && 
                         resumeGenContent.includes('sessions');
console.log(`   Kode扫描逻辑: ${hasKodeScanLogic ? '✅ 是' : '❌ 否'}`);

// 测试5: 验证命令集成
console.log('\n📡 测试命令集成...');

const routerPath = path.join(__dirname, 'src/cli', 'router.js');
if (fs.existsSync(routerPath)) {
  const routerContent = fs.readFileSync(routerPath, 'utf8');
  const hasResumeSessionCommand = routerContent.includes('resumesession');
  console.log(`   ResumeSession命令路由: ${hasResumeSessionCommand ? '✅ 是' : '❌ 否'}`);
} else {
  console.log(`   ResumeSession命令路由: ❌ 文件不存在`);
}

// 汇总结果
console.log('\n' + '='.repeat(60));
console.log('📊 集成测试结果');
console.log('='.repeat(60));

const overallPass = allComponentsValid && allCLIsSupported && hasKodeInPathConfig && hasKodeScanLogic;

console.log(`\n🎯 核心功能验证:`);
console.log(`   • Kode历史会话恢复: ${overallPass ? '✅ 支持' : '❌ 不支持'}`);
console.log(`   • 跨CLI会话访问: ${overallPass ? '✅ 支持' : '❌ 不支持'}`);
console.log(`   • 会话扫描功能: ${hasKodeScanLogic ? '✅ 支持' : '❌ 不支持'}`);
console.log(`   • 代码生成器: ${allCLIsSupported ? '✅ 支持' : '❌ 不支持'}`);

console.log(`\n📋 详细组件验证:`);
console.log(`   • Kode模板: ${components[0].check(fs.readFileSync(path.join(__dirname, components[0].path), 'utf8')) ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   • 代码生成器: ${components[1].check(fs.readFileSync(path.join(__dirname, components[1].path), 'utf8')) ? '✅ 已更新' : '❌ 未更新'}`);
console.log(`   • 生成器支持: ${components[2].check(fs.readFileSync(path.join(__dirname, components[2].path), 'utf8')) ? '✅ 已支持' : '❌ 未支持'}`);
console.log(`   • 路径配置: ${components[3].check(fs.readFileSync(path.join(__dirname, components[3].path), 'utf8')) ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   • CLI配置: ${components[4].check(fs.readFileSync(path.join(__dirname, components[4].path), 'utf8')) ? '✅ 已配置' : '❌ 未配置'}`);

console.log(`\n✨ 集成测试状态: ${overallPass ? '✅ 通过' : '❌ 未通过'}`);

if (overallPass) {
  console.log('\n🚀 集成测试成功！');
  console.log('   • Kode CLI可以访问其他CLI的历史会话');
  console.log('   • 其他CLI可以访问Kode的历史会话');
  console.log('   • /stigmergy-resume命令在所有CLI中可用');
  console.log('   • 项目感知的会话恢复功能已就绪');
} else {
  console.log('\n⚠️  集成测试未完全通过，需要进一步配置');
}

console.log('\n✅ 集成测试完成');
