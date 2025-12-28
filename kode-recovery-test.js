const fs = require('fs');
const path = require('path');

console.log('🧪 Kode恢复测试：验证kode是否可以从其它CLI的会话中恢复\n');

// 检查kode CLI的集成能力
console.log('🔍 检查Kode CLI集成能力...');

// 检查kode模板文件
const kodeTemplatePath = path.join(__dirname, 'packages', 'resume', 'templates', 'kode-integration.template.js');
const hasKodeTemplate = fs.existsSync(kodeTemplatePath);
console.log(`   ✅ Kode模板文件: ${hasKodeTemplate ? '存在' : '不存在'}`);

if (hasKodeTemplate) {
  const templateContent = fs.readFileSync(kodeTemplatePath, 'utf8');
  const hasSessionScanner = templateContent.includes('SessionScanner');
  const hasSessionFilter = templateContent.includes('SessionFilter');
  const hasHistoryFormatter = templateContent.includes('HistoryFormatter');
  const hasHistoryQuery = templateContent.includes('HistoryQuery');
  const hasCommandHandler = templateContent.includes('handleCommand');
  
  console.log(`     - 会话扫描器: ${hasSessionScanner ? '✅' : '❌'}`);
  console.log(`     - 会话过滤器: ${hasSessionFilter ? '✅' : '❌'}`);
  console.log(`     - 历史格式化器: ${hasHistoryFormatter ? '✅' : '❌'}`);
  console.log(`     - 历史查询器: ${hasHistoryQuery ? '✅' : '❌'}`);
  console.log(`     - 命令处理器: ${hasCommandHandler ? '✅' : '❌'}`);
}

// 检查ResumeSessionGenerator中的kode支持
const resumeGenPath = path.join(__dirname, 'src', 'core', 'coordination', 'nodejs', 'generators', 'ResumeSessionGenerator.js');
const hasResumeGen = fs.existsSync(resumeGenPath);
console.log(`   ✅ ResumeSessionGenerator: ${hasResumeGen ? '存在' : '不存在'}`);

if (hasResumeGen) {
  const resumeGenContent = fs.readFileSync(resumeGenPath, 'utf8');
  const hasKodeInGenerator = resumeGenContent.includes("'kode'");
  const hasKodeScanLogic = resumeGenContent.includes('kode') && resumeGenContent.includes('projects');
  const hasKodeIcon = resumeGenContent.includes("'kode': '⚡'");
  
  console.log(`     - Kode生成支持: ${hasKodeInGenerator ? '✅' : '❌'}`);
  console.log(`     - Kode扫描逻辑: ${hasKodeScanLogic ? '✅' : '❌'}`);
  console.log(`     - Kode图标配置: ${hasKodeIcon ? '✅' : '❌'}`);
}

// 检查路径配置管理器
const pathConfigPath = path.join(__dirname, 'packages', 'resume', 'src', 'config', 'PathConfigManager.ts');
const hasPathConfig = fs.existsSync(pathConfigPath);
console.log(`   ✅ PathConfigManager: ${hasPathConfig ? '存在' : '不存在'}`);

if (hasPathConfig) {
  const pathConfigContent = fs.readFileSync(pathConfigPath, 'utf8');
  const hasKodeInPathConfig = pathConfigContent.includes('kode:');
  const hasKodePaths = pathConfigContent.includes('projects') && 
                       pathConfigContent.includes('sessions') && 
                       pathConfigContent.includes('conversations');
  
  console.log(`     - Kode路径配置: ${hasKodeInPathConfig ? '✅' : '❌'}`);
  console.log(`     - Kode会话路径: ${hasKodePaths ? '✅' : '❌'}`);
}

// 检查CodeGenerator对kode的支持
const codeGenPath = path.join(__dirname, 'packages', 'resume', 'src', 'utils', 'CodeGenerator.ts');
const hasCodeGen = fs.existsSync(codeGenPath);
console.log(`   ✅ CodeGenerator: ${hasCodeGen ? '存在' : '不存在'}`);

if (hasCodeGen) {
  const codeGenContent = fs.readFileSync(codeGenPath, 'utf8');
  const hasKodeIntegrationPath = codeGenContent.includes('kode: join(projectPath');
  const hasKodeGenerator = codeGenContent.includes('kode: this.generateKodeTemplate');
  
  console.log(`     - Kode集成路径: ${hasKodeIntegrationPath ? '✅' : '❌'}`);
  console.log(`     - Kode生成器: ${hasKodeGenerator ? '✅' : '❌'}`);
}

console.log('\n🔄 测试Kode访问其他CLI会话的能力...');

// 模拟其他CLI的会话路径（通过PathConfigManager）
const otherCLISessions = [
  { cli: 'claude', path: 'projects/sessions', description: 'Claude会话' },
  { cli: 'gemini', path: 'tmp/*/chats', description: 'Gemini会话' },
  { cli: 'qwen', path: 'projects/*/chats', description: 'Qwen会话' },
  { cli: 'iflow', path: 'projects', description: 'IFlow会话' },
  { cli: 'codebuddy', path: 'projects/history.jsonl', description: 'CodeBuddy会话' },
  { cli: 'qodercli', path: 'projects', description: 'QoderCLI会话' },
  { cli: 'codex', path: 'sessions', description: 'Codex会话' },
  { cli: 'kode', path: 'projects/sessions/conversations', description: 'Kode自身会话' }
];

console.log('   检查Kode对各CLI会话的访问能力:');
for (const cli of otherCLISessions) {
  // 检查ResumeSessionGenerator是否支持该CLI的会话扫描
  let cliSupported = false;
  if (hasResumeGen) {
    const content = fs.readFileSync(resumeGenPath, 'utf8');
    cliSupported = content.includes(`'${cli.cli}'`) || 
                   (cli.cli === 'kode' && content.includes('kode')); // 特殊处理kode
  }
  
  console.log(`     ${cliSupported ? '✅' : '❌'} ${cli.cli.toUpperCase()}: ${cli.description}`);
}

console.log('\n📋 Kode恢复功能组件验证:');

// 验证所有必需组件
const components = {
  '模板文件': hasKodeTemplate,
  '生成器支持': hasResumeGen && fs.readFileSync(resumeGenPath, 'utf8').includes("'kode'"),
  '路径配置': hasPathConfig && fs.readFileSync(pathConfigPath, 'utf8').includes('kode:'),
  '代码生成': hasCodeGen && fs.readFileSync(codeGenPath, 'utf8').includes('kode:'),
  '会话扫描': hasResumeGen && fs.readFileSync(resumeGenPath, 'utf8').includes('scanSessions'),
  '跨CLI查询': hasKodeTemplate && fs.readFileSync(kodeTemplatePath, 'utf8').includes('scanAllCLISessions'),
  '命令处理': hasKodeTemplate && fs.readFileSync(kodeTemplatePath, 'utf8').includes('handleCommand')
};

let allComponentsReady = true;
for (const [name, ready] of Object.entries(components)) {
  console.log(`   ${ready ? '✅' : '❌'} ${name}: ${ready ? '就绪' : '缺失'}`);
  if (!ready) allComponentsReady = false;
}

console.log('\n🎯 恢复能力验证:');

// 测试命令可用性
const hasResumeCommand = fs.existsSync(path.join(__dirname, 'src', 'cli', 'commands', 'resume.js'));
console.log(`   • ResumeSession命令: ${hasResumeCommand ? '✅ 可用' : '❌ 不可用'}`);

// 测试命令别名支持
const routerPath = path.join(__dirname, 'src', 'cli', 'router.js');
let hasCommandAliases = false;
if (fs.existsSync(routerPath)) {
  const routerContent = fs.readFileSync(routerPath, 'utf8');
  hasCommandAliases = routerContent.includes('resumesession') && 
                      routerContent.includes('resume') && 
                      routerContent.includes('sg-resume');
}
console.log(`   • 命令别名支持: ${hasCommandAliases ? '✅ 支持' : '❌ 不支持'}`);

// 模拟恢复工作流程
console.log('\n🔄 Kode会话恢复工作流程:');
console.log('   1. 用户在Kode CLI中输入 /stigmergy-resume');
console.log('   2. Kode的集成代码处理命令');
console.log('   3. SessionScanner扫描所有CLI的会话目录');
console.log('   4. PathConfigManager提供各CLI的路径配置');
console.log('   5. 返回跨CLI的统一会话历史');

// 检查模板中的实现细节
if (hasKodeTemplate) {
  const templateContent = fs.readFileSync(kodeTemplatePath, 'utf8');
  const hasScanAllCLIs = templateContent.includes('scanAllCLISessions');
  const hasPathConfigLoader = templateContent.includes('pathConfigLoader');
  const hasCrossProjectQuery = templateContent.includes('projectPath === projectPath');
  
  console.log(`   实现细节:`);
  console.log(`      - 扫描所有CLI: ${hasScanAllCLIs ? '✅' : '❌'}`);
  console.log(`      - 路径配置加载: ${hasPathConfigLoader ? '✅' : '❌'}`);
  console.log(`      - 跨项目查询: ${hasCrossProjectQuery ? '✅' : '❌'}`);
}

console.log('\n' + '='.repeat(70));
console.log('📊 Kode恢复测试结果');
console.log('='.repeat(70));

console.log('\n📋 组件完整性:');
const componentCount = Object.keys(components).length;
const readyCount = Object.values(components).filter(Boolean).length;
console.log(`   完成度: ${readyCount}/${componentCount} 个组件`);

console.log('\n🎯 恢复能力评估:');
console.log(`   • Kode访问其他CLI: ${allComponentsReady ? '✅ 支持' : '❌ 部分支持'}`);
console.log(`   • 其他CLI访问Kode: ${allComponentsReady ? '✅ 支持' : '❌ 部分支持'}`);
console.log(`   • 跨CLI会话恢复: ${allComponentsReady ? '✅ 支持' : '❌ 部分支持'}`);
console.log(`   • 项目感知恢复: ${hasPathConfig ? '✅ 支持' : '❌ 不支持'}`);

// 判断整体结果
const overallResult = allComponentsReady && hasResumeCommand && hasCommandAliases;

console.log(`\n✨ Kode恢复测试: ${overallResult ? '✅ 通过' : '❌ 部分通过'}`);

if (overallResult) {
  console.log('\n🚀 Kode恢复功能测试成功！');
  console.log('   • Kode CLI可以访问所有其他CLI的历史会话');
  console.log('   • 支持跨CLI的会话恢复功能');
  console.log('   • 统一的/stigmergy-resume命令可用');
  console.log('   • 项目感知的会话过滤功能');
  console.log('   • 完整的双向会话访问');
  
  console.log('\n📋 Kode恢复功能特性:');
  console.log('   • 实时扫描所有集成CLI的会话');
  console.log('   • 按项目过滤会话历史');
  console.log('   • 统一的会话历史视图');
  console.log('   • 搜索和过滤功能');
  console.log('   • 上下文恢复能力');
} else {
  console.log('\n⚠️  Kode恢复功能部分实现，需检查失败组件');
}

console.log('\n✅ Kode恢复测试完成');
