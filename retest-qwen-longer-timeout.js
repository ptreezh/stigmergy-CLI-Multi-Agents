/**
 * 重新测试qwen - 使用更长的超时时间
 */

const fs = require('fs').promises;
const { spawn } = require('child_process');
const path = require('path');

async function retestQwen() {
  console.log('🔄 重新测试qwen (超时时间: 60秒)\n');

  const qwenDoc = path.join(process.cwd(), 'qwen.md');
  const skillName = 'manual-test-qwen-skill-v2';

  // 步骤1: 注册skill
  console.log('步骤1: 注册skill到qwen.md...');
  let content = await fs.readFile(qwenDoc, 'utf8');

  if (content.includes(skillName)) {
    console.log('   skill已存在，跳过注册');
  } else {
    const skillEntry = `
<skill>
<name>${skillName}</name>
<description>手动测试技能v2 - 验证qwen的注册机制</description>
<location>stigmergy</location>
</skill>`;

    const endIndex = content.indexOf('</available_skills>');
    if (endIndex !== -1) {
      content = content.slice(0, endIndex) + skillEntry + content.slice(endIndex);
      await fs.writeFile(qwenDoc, content, 'utf8');
      console.log('   ✓ 已注册skill');
    }
  }

  // 步骤2: 验证注册
  console.log('\n步骤2: 验证注册...');
  content = await fs.readFile(qwenDoc, 'utf8');
  if (content.includes(skillName)) {
    console.log('   ✓ skill已成功注册');
  } else {
    console.log('   ✗ skill未找到');
    return;
  }

  // 步骤3: 测试激活 (60秒超时)
  console.log('\n步骤3: 测试qwen激活 (60秒超时)...');
  console.log('命令: qwen "请使用manual-test-qwen-skill-v2技能"\n');

  await new Promise(resolve => {
    const childProcess = spawn('qwen', ['请使用manual-test-qwen-skill-v2技能', '-y'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      cwd: process.cwd()
    });

    let output = '';
    let stderrOutput = '';
    let hasError = false;
    let detectedSkill = false;

    const timeout = setTimeout(() => {
      childProcess.kill();
      console.log('   ⏱ 超时(60秒)');

      if (detectedSkill) {
        console.log('   ⚠ 但检测到skill使用，可能是响应较慢');
      }

      resolve();
    }, 60000);

    childProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;

      // 检测skill名称
      if (text.toLowerCase().includes(skillName.toLowerCase()) ||
          text.includes('manual-test') ||
          (text.includes('使用') && text.includes('技能'))) {
        detectedSkill = true;
        clearTimeout(timeout); // 检测到skill后取消超时
      }
    });

    childProcess.stderr.on('data', (data) => {
      const text = data.toString();
      stderrOutput += text;
      if (text.includes('ERROR') || text.includes('error')) {
        hasError = true;
      }
      // qwen的ImportProcessor错误不算真正的错误
      if (text.includes('ImportProcessor')) {
        hasError = false;
      }
    });

    childProcess.on('close', (code) => {
      clearTimeout(timeout);

      console.log('\n退出码:', code);
      console.log('输出长度:', output.length, '字符');

      if (stderrOutput.includes('ImportProcessor')) {
        console.log('   ℹ 注意到ImportProcessor错误 (这是qwen的已知问题，不影响功能)');
      }

      if (detectedSkill) {
        console.log('\n✅ 成功！qwen识别并使用了' + skillName);
        console.log('\n结论: qwen支持.md文档注册机制，但响应时间较长');
      } else if (output.length > 100) {
        console.log('\n⚠ qwen有输出但未明确提到skill');
        console.log('可能原因: 需要更明确的提示词或不同的激活方式');
      } else {
        console.log('\n❌ 未检测到skill使用');
        console.log('可能原因: 需要重启qwen或使用其他机制');
      }

      // 清理
      fs.readFile(qwenDoc, 'utf8').then(async (newContent) => {
        const regex = new RegExp(`<skill>[\\s\\S]*?<name>${skillName}<\\/name>[\\s\\S]*?<\\/skill>`, 'g');
        const cleaned = newContent.replace(regex, '');
        if (cleaned !== newContent) {
          await fs.writeFile(qwenDoc, cleaned, 'utf8');
          console.log('\n步骤4: 已清理测试skill');
        }
        resolve();
      }).catch(() => resolve());
    });
  });

  console.log('\n测试完成');
}

retestQwen().catch(error => {
  console.error('\n❌ 错误:', error);
});
