const fs = require('fs');
const code = fs.readFileSync('qwen-from-gemini.js', 'utf8');

console.log('检查Qwen特定修改:');
console.log('  包含qwen projects路径:', code.includes(".qwen', 'projects"));
console.log('  包含qwen条件:', code.includes("cliType === 'qwen'"));
console.log('  包含chats目录:', code.includes('chats'));

// 查找关键代码段
const lines = code.split('\n');
let foundProjects = false;
let foundChats = false;

lines.forEach((line, i) => {
  if (line.includes('projects') && line.includes('qwen')) {
    console.log('\n找到qwen projects配置 (行' + (i+1) + '):');
    console.log('  ', line.trim().substring(0, 100));
    foundProjects = true;
  }
  if (line.includes('chats') && !foundChats) {
    console.log('\n找到chats引用 (行' + (i+1) + '):');
    console.log('  ', line.trim().substring(0, 100));
    foundChats = true;
  }
});

if (!foundProjects) {
  console.log('\n❌ 未找到qwen projects配置');
}
if (!foundChats) {
  console.log('\n❌ 未找到chats目录支持');
}
