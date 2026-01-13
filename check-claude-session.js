const fs = require('fs');

console.log('检查 Claude 会话文件...\n');

const claudeFile = 'C:\\Users\\Zhang\\.claude\\projects\\D--\\c71ea21b-ea0c-464a-8ef4-5b26728ce399.jsonl';
if (fs.existsSync(claudeFile)) {
  const content = fs.readFileSync(claudeFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 5);
  console.log('前 5 行:');
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`\n行 ${i + 1}:`);
      console.log('  字段:', Object.keys(msg).join(', '));
      if (msg.type) console.log('  type:', msg.type);
      if (msg.content) console.log('  content:', msg.content.substring(0, 50));
      if (msg.skill) console.log('  skill:', msg.skill);
      if (msg.skills) console.log('  skills:', msg.skills);
    } catch (e) {
      console.log(`\n行 ${i + 1}: 解析失败 - ${e.message}`);
    }
  });
} else {
  console.log('文件不存在');
}