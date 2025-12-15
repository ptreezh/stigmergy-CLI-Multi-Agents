const { CodeGenerator } = require('./dist/utils/CodeGenerator');
const gen = new CodeGenerator();
const fs = require('fs');

// 生成Gemini代码作为基础
const geminiCode = gen.generateGeminiTemplate({
  projectPath: 'D:\\stigmergy-CLI-Multi-Agents',
  config: { version: '1.0.0' }
});

console.log('Gemini模板长度:', geminiCode.length);

// 转换为Qwen版本
let qwenCode = geminiCode
  .replace(/Gemini CLI/g, 'Qwen CLI')
  .replace(/geminiCLI/g, 'qwenCLI')
  .replace(/GeminiHistoryHandler/g, 'QwenHistoryHandler')
  .replace(/gemini:/g, 'qwen:')
  .replace("gemini: path.join(homeDir, '.gemini', 'sessions')", "qwen: path.join(homeDir, '.qwen', 'projects')")
  .replace("iflow: path.join(homeDir, '.iflow', 'stigmergy', 'sessions')", "iflow: path.join(homeDir, '.iflow', 'projects')")
  .replace("cliType === 'gemini' && sessionsPath.includes('sessions')", "(cliType === 'qwen' || cliType === 'iflow') && sessionsPath.includes('projects')");

// 添加chats子目录支持
qwenCode = qwenCode.replace(
  'if (stat.isDirectory()) {\n              sessions.push(...this.scanSessionFiles(cliType, subdirPath, projectPath));',
  `if (stat.isDirectory()) {
              const chatsDir = path.join(subdirPath, 'chats');
              const targetDir = fs.existsSync(chatsDir) ? chatsDir : subdirPath;
              sessions.push(...this.scanSessionFiles(cliType, targetDir, projectPath));`
);

fs.writeFileSync('qwen-from-gemini.js', qwenCode);
console.log('✓ Qwen模板已生成');
console.log('  长度:', qwenCode.length);

// 测试语法
try {
  const qwenModule = require('./qwen-from-gemini.js');
  console.log('\n✓ Qwen模板语法正确');
  console.log('  导出:', Object.keys(qwenModule));
  
  const handler = new qwenModule.QwenHistoryHandler();
  handler.handleCommand('/history --limit 3', {}).then(result => {
    console.log('\n✅ Qwen集成代码功能正常！');
    console.log('  找到Qwen会话:', result.text.includes('QWEN'));
    console.log('  响应长度:', result.text.length);
    console.log('\n响应预览:');
    console.log(result.text.substring(0, 200));
  }).catch(err => {
    console.log('\n✗ 功能测试失败:', err.message);
  });
} catch (e) {
  console.log('\n✗ Qwen模板有语法错误:', e.message);
  console.log('  位置:', e.stack.split('\n')[0]);
}
