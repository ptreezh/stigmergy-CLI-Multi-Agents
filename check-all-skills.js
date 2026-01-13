const fs = require('fs');
const path = require('path');

console.log('检查所有 CLI 会话中的技能信息...\n');

// Qwen
console.log('1. Qwen 会话:');
const qwenFile = 'C:\\Users\\Zhang\\.qwen\\projects\\D--stigmergy-CLI-Multi-Agents\\chats\\1745f08f-1395-4724-a30c-19ac7cad1647.jsonl';
if (fs.existsSync(qwenFile)) {
  const content = fs.readFileSync(qwenFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 3);
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`  行 ${i + 1}: type=${msg.type}`);
      if (msg.content) console.log('    content:', msg.content.substring(0, 40));
      if (msg.skill) console.log('    skill:', msg.skill);
      if (msg.skills) console.log('    skills:', msg.skills);
    } catch (e) {
      console.log(`  行 ${i + 1}: 解析失败`);
    }
  });
}

// IFlow
console.log('\n2. IFlow 会话:');
const iflowFile = 'C:\\Users\\Zhang\\.iflow\\projects\\D--stigmergy-CLI-Multi-Agents\\session-0f482dcd-b393-4fb5-868e-b66d8c0b938f.jsonl';
if (fs.existsSync(iflowFile)) {
  const content = fs.readFileSync(iflowFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 3);
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`  行 ${i + 1}: type=${msg.type}`);
      if (msg.content) console.log('    content:', msg.content.substring(0, 40));
      if (msg.skill) console.log('    skill:', msg.skill);
      if (msg.skills) console.log('    skills:', msg.skills);
    } catch (e) {
      console.log(`  行 ${i + 1}: 解析失败`);
    }
  });
}

// QoderCLI
console.log('\n3. QoderCLI 会话:');
const qoderFile = 'C:\\Users\\Zhang\\.qoder\\projects\\D--stigmergy-CLI-Multi-Agents\\f822fbf3-18a9-4e39-a445-47a5dd1b29fc.jsonl';
if (fs.existsSync(qoderFile)) {
  const content = fs.readFileSync(qoderFile, 'utf8');
  const lines = content.trim().split('\n').slice(0, 3);
  lines.forEach((line, i) => {
    try {
      const msg = JSON.parse(line);
      console.log(`  行 ${i + 1}: type=${msg.type}`);
      if (msg.content) console.log('    content:', msg.content.substring(0, 40));
      if (msg.skill) console.log('    skill:', msg.skill);
      if (msg.skills) console.log('    skills:', msg.skills);
    } catch (e) {
      console.log(`  行 ${i + 1}: 解析失败`);
    }
  });
}

// CodeBuddy
console.log('\n4. CodeBuddy 会话:');
const codebuddyDir = 'C:\\Users\\Zhang\\.codebuddy';
const files = fs.readdirSync(codebuddyDir).filter(f => f.endsWith('.json'));
if (files.length > 0) {
  const codebuddyFile = path.join(codebuddyDir, files[0]);
  const content = fs.readFileSync(codebuddyFile, 'utf8');
  const msg = JSON.parse(content);
  console.log('  字段:', Object.keys(msg).join(', '));
  if (msg.skill) console.log('  skill:', msg.skill);
  if (msg.skills) console.log('  skills:', msg.skills);
}