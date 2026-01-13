const fs = require('fs');
const path = require('path');

const skillDirs = ['claude', 'codex', 'iflow', 'qwen', 'qoder', 'codebuddy'];

console.log('检查各 CLI 的 resumesession 技能目录:\n');

skillDirs.forEach(cli => {
  const fullPath = path.join('C:\\Users\\Zhang', `.${cli}`, 'skills', 'resumesession');
  const exists = fs.existsSync(fullPath);

  console.log(`${cli.toUpperCase()}: ${exists ? '✅ 存在' : '❌ 不存在'}`);

  if (exists) {
    const files = fs.readdirSync(fullPath);
    console.log('  文件:', files.join(', '));
  }
  console.log();
});

// 检查是否有内置技能配置
console.log('\n检查 stigmergy 内置技能配置:');
const configFiles = ['config/builtin-skills.json', 'config/skills.json', '.stigmergy/skills.json', 'templates/skills.json'];
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});