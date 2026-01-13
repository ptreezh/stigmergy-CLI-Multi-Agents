const fs = require('fs');

console.log('检查会话文件中的技能信息...\n');

// 检查 Claude 会话
console.log('1. Claude 会话:');
const claudeFile = 'C:\\Users\\Zhang\\.claude\\projects\\D--stigmergy-CLI-Multi-Agents\\2260cbca-0119-4508-b3b5-62cb669338e6.jsonl';
if (fs.existsSync(claudeFile)) {
  const content = fs.readFileSync(claudeFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 3);
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`  行 ${i + 1}:`, Object.keys(msg).join(', '));
      if (msg.skill) console.log('    skill:', msg.skill);
      if (msg.skills) console.log('    skills:', msg.skills);
    } catch (e) {
      console.log(`  行 ${i + 1}: 解析失败`);
    }
  });
}

// 检查 Qwen 会话
console.log('\n2. Qwen 会话:');
const qwenFile = 'C:\\Users\\Zhang\\.qwen\\projects\\D--stigmergy-CLI-Multi-Agents\\chats\\1745f08f-1395-4724-a30c-19ac7cad1647.jsonl';
if (fs.existsSync(qwenFile)) {
  const content = fs.readFileSync(qwenFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 3);
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`  行 ${i + 1}:`, Object.keys(msg).join(', '));
      if (msg.skill) console.log('    skill:', msg.skill);
      if (msg.skills) console.log('    skills:', msg.skills);
    } catch (e) {
      console.log(`  行 ${i + 1}: 解析失败`);
    }
  });
}

// 检查 IFlow 会话
console.log('\n3. IFlow 会话:');
const iflowFile = 'C:\\Users\\Zhang\\.iflow\\projects\\D--stigmergy-CLI-Multi-Agents\\session-0f482dcd-b393-4fb5-868e-b66d8c0b938f.jsonl';
if (fs.existsSync(iflowFile)) {
  const content = fs.readFileSync(iflowFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 3);
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`  行 ${i + 1}:`, Object.keys(msg).join(', '));
      if (msg.skill) console.log('    skill:', msg.skill);
      if (msg.skills) console.log('    skills:', msg.skills);
    } catch (e) {
      console.log(`  行 ${i + 1}: 解析失败`);
    }
  });
}