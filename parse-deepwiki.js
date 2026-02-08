const fs = require('fs');

// 读取文件
const filePath = 'C:\\Users\\Zhang\\.claude\\projects\\D--stigmergy-CLI-Multi-Agents\\fa11537b-de95-4163-90db-5c59a01bbcf5\\tool-results\\mcp-mcp-deepwiki-deepwiki_fetch-1769349778000.txt';

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 提取所有文本
const allTexts = data.map(item => item.text);

// 搜索关键内容
console.log('=== Searching for .claude-plugin ===\n');
allTexts.forEach((text, index) => {
  if (text.includes('.claude-plugin') || text.includes('plugin.json') || text.includes('hooks.json')) {
    console.log(`Found in item ${index}:`);
    console.log(text.substring(0, 500));
    console.log('\n---\n');
  }
});

console.log('\n=== Searching for SKILL.md ===\n');
allTexts.forEach((text, index) => {
  if (text.includes('SKILL.md') || text.includes('brainstorming') || text.includes('test-driven-development')) {
    console.log(`Found in item ${index}:`);
    console.log(text.substring(0, 500));
    console.log('\n---\n');
  }
});

console.log('\n=== Searching for JSON config blocks ===\n');
allTexts.forEach((text, index) => {
  if (text.includes('{') && text.includes('name') && text.includes('version') && (text.includes('claude') || text.includes('hooks'))) {
    console.log(`Found JSON in item ${index}:`);
    // 尝试提取 JSON 块
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      console.log(jsonMatch[0].substring(0, 800));
    }
    console.log('\n---\n');
  }
});

console.log('\n=== Searching for skill files structure ===\n');
allTexts.forEach((text, index) => {
  if (text.includes('skills/') && (text.includes('.md') || text.includes('SKILL'))) {
    console.log(`Found skill structure in item ${index}:`);
    console.log(text.substring(0, 800));
    console.log('\n---\n');
  }
});
