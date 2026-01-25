/**
 * 手动验证测试 - 添加skill到qwen.md并测试
 */

const fs = require('fs').promises;
const { spawn } = require('child_process');
const path = require('path');

async function manualTest() {
  console.log('🧪 手动验证测试\n');

  // 1. 手动在qwen.md中添加skill
  console.log('步骤1: 在qwen.md中注册skill...');
  const qwenDoc = path.join(process.cwd(), 'qwen.md');
  let content = await fs.readFile(qwenDoc, 'utf8');

  // 检查是否已经注册
  if (content.includes('manual-test-skill')) {
    console.log('   skill已注册，跳过');
  } else {
    // 在</available_skills>前添加
    const skillEntry = `
<skill>
<name>manual-test-skill</name>
<description>手动测试技能 - 验证注册机制</description>
<location>stigmergy</location>
</skill>`;

    const endIndex = content.indexOf('</available_skills>');
    if (endIndex !== -1) {
      content = content.slice(0, endIndex) + skillEntry + content.slice(endIndex);
      await fs.writeFile(qwenDoc, content, 'utf8');
      console.log('   ✓ 已添加skill到qwen.md');
    }
  }

  // 2. 验证skill是否在文档中
  console.log('\n步骤2: 验证注册...');
  content = await fs.readFile(qwenDoc, 'utf8');
  if (content.includes('manual-test-skill')) {
    console.log('   ✓ skill已成功注册到qwen.md');
  } else {
    console.log('   ✗ skill未找到');
    return;
  }

  // 3. 测试qwen是否能识别这个skill
  console.log('\n步骤3: 测试qwen激活...');
  console.log('命令: qwen "请使用manual-test-skill技能"\n');

  await new Promise(resolve => {
    const childProcess = spawn('qwen', ['请使用manual-test-skill技能', '-y'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let output = '';
    childProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(data);
    });

    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    childProcess.on('close', (code) => {
      console.log(`\n退出码: ${code}`);

      // 检查是否提到skill
      if (output.toLowerCase().includes('manual-test-skill')) {
        console.log('\n✅ 成功！qwen识别并使用了manual-test-skill');
        console.log('\n结论: 只需要在qwen.md中注册即可激活skill！');
      } else {
        console.log('\n❌ 未检测到skill使用');
        console.log('\n可能原因:');
        console.log('1. 需要重启qwen才能加载新的.md文档');
        console.log('2. skill名称格式不对');
        console.log('3. 需要skill文件而不仅仅是注册');
      }

      // 4. 清理：移除测试skill
      fs.readFile(qwenDoc, 'utf8').then(async (newContent) => {
        const cleaned = newContent.replace(/<skill>[\s\S]*?<name>manual-test-skill<\/name>[\s\S]*?<\/skill>/g, '');
        if (cleaned !== newContent) {
          await fs.writeFile(qwenDoc, cleaned, 'utf8');
          console.log('\n步骤4: 已清理测试skill');
        }
        resolve();
      });
    });

    setTimeout(() => {
      childProcess.kill();
      resolve();
    }, 30000);
  });
}

manualTest().catch(error => {
  console.error('\n❌ 错误:', error);
});
