const fs = require('fs');
const path = require('path');

// 构建正确的路径
const filePath = path.join(
  'C:',
  'Users',
  'Zhang',
  '.claude',
  'projects',
  'D--stigmergy-CLI-Multi-Agents',
  'fa11537b-de95-4163-90db-5c59a01bbcf5',
  'tool-results',
  'mcp-mcp-deepwiki-deepwiki_fetch-1769349778000.txt'
);

console.log('Reading from:', filePath);

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Total items:', data.length);

// 查找包含具体配置的内容
console.log('\n=== Looking for directory structure ===\n');
data.forEach((item, index) => {
  const text = item.text;
  if (text.includes('superpowers/') && text.includes('skills')) {
    console.log(`\n--- Item ${index} ---`);
    const lines = text.split('\n').slice(0, 30);
    console.log(lines.join('\n'));
  }
});

// 查找 plugin.json
console.log('\n\n=== Looking for plugin.json content ===\n');
data.forEach((item, index) => {
  const text = item.text;
  if (text.includes('"name"') && text.includes('"description"') && text.includes('"claude"')) {
    console.log(`\n--- Item ${index} ---`);
    const lines = text.split('\n').slice(0, 50);
    console.log(lines.join('\n'));
  }
});

// 查找具体技能文件
console.log('\n\n=== Looking for skill file examples ===\n');
data.forEach((item, index) => {
  const text = item.text;
  if (text.includes('---') && text.includes('name:') && text.includes('description:')) {
    console.log(`\n--- Item ${index} ---`);
    const lines = text.split('\n').slice(0, 80);
    console.log(lines.join('\n'));
  }
});
