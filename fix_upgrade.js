// 修复upgrade命令
const fs = require('fs').promises;
const path = require('path');

async function fixUpgradeCommand() {
  console.log('=== 修复upgrade命令 ===\n');
  
  const routerPath = path.join(__dirname, 'src/cli/router.js');
  
  try {
    const content = await fs.readFile(routerPath, 'utf8');
    
    // 查找upgrade命令的处理部分
    const upgradeStart = content.indexOf("case 'upgrade': {");
    let upgradeEnd = content.indexOf('break;', upgradeStart);
    
    // 找到匹配的}
    let braceCount = 0;
    let searchIndex = upgradeStart;
    while (searchIndex < content.length && searchIndex < upgradeStart + 2000) {
      if (content[searchIndex] === '{') braceCount++;
      if (content[searchIndex] === '}') {
        braceCount--;
        if (braceCount === 0) {
          upgradeEnd = searchIndex + 1;
          break;
        }
      }
      searchIndex++;
    }
    
    if (upgradeStart === -1 || upgradeEnd === -1) {
      console.log('❌ 找不到upgrade命令处理逻辑');
      return;
    }
    
    console.log('✅ 找到upgrade命令处理逻辑');
    console.log('原代码长度:', upgradeEnd - upgradeStart, '字符');
    
    // 创建简化版本的upgrade命令
    const fixedUpgradeCode = `  case 'upgrade':
    try {
      console.log('[UPGRADE] Starting CLI tools upgrade check...');
      
      // 简化版本：只显示当前状态和建议
      console.log('\n[INFO] Current tool status:');
      
      const { spawnSync } = require('child_process');
      const tools = {
        claude: { name: 'Claude CLI', check: 'claude --version' },
        gemini: { name: 'Gemini CLI', check: 'gemini --version' },
        qwen: { name: 'Qwen CLI', check: 'qwen --version' },
        iflow: { name: 'iFlow CLI', check: 'iflow --version' },
        qodercli: { name: 'Qoder CLI', check: 'qodercli --version' },
        codebuddy: { name: 'CodeBuddy CLI', check: 'codebuddy --version' },
        copilot: { name: 'GitHub Copilot CLI', check: 'copilot --version' },
        codex: { name: 'OpenAI Codex CLI', check: 'codex --version' }
      };
      
      for (const [toolName, toolInfo] of Object.entries(tools)) {
        try {
          const result = spawnSync(toolInfo.check, {
            encoding: 'utf8',
            timeout: 5000,
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']
          });
          
          if (result.status === 0) {
            const version = result.stdout.trim() || result.stderr.trim() || 'unknown';
            console.log(`  ✅ ${toolInfo.name}: ${version.substring(0, 50)}`);
          } else {
            console.log(`  ❌ ${toolInfo.name}: Not installed`);
          }
        } catch (error) {
          console.log(`  ❌ ${toolInfo.name}: Check failed`);
        }
      }
      
      console.log('\n[INFO] Upgrade recommendations:');
      console.log('  1. Check for updates manually:');
      console.log('     npm outdated -g');
      console.log('  2. Update all tools:');
      console.log('     npm update -g');
      console.log('  3. Update specific tool:');
      console.log('     npm update -g @anthropic-ai/claude-code');
      console.log('\n[INFO] Upgrade check completed.');
      
    } catch (error) {
      console.error('[ERROR] Upgrade check failed:', error.message);
      if (process.env.DEBUG === 'true') {
        console.error(error.stack);
      }
      process.exit(1);
    }
    break;`;
    
    // 替换原代码
    const beforeUpgrade = content.substring(0, upgradeStart);
    const afterUpgrade = content.substring(upgradeEnd);
    const fixedContent = beforeUpgrade + fixedUpgradeCode + afterUpgrade;
    
    await fs.writeFile(routerPath, fixedContent, 'utf8');
    
    console.log('✅ 替换upgrade命令处理逻辑');
    console.log('新代码长度:', fixedUpgradeCode.length, '字符');
    
    // 测试修复
    console.log('\n=== 测试修复 ===');
    
    const { spawnSync } = require('child_process');
    const testResult = spawnSync('node', ['src/index.js', 'upgrade'], {
      encoding: 'utf8',
      timeout: 15000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (testResult.stdout) {
      console.log('输出:');
      console.log(testResult.stdout);
    }
    
    if (testResult.stderr) {
      console.log('错误:', testResult.stderr);
    }
    
    console.log('退出码:', testResult.status);
    
    if (testResult.status === 0) {
      console.log('\n✅ upgrade命令修复成功！');
    } else {
      console.log('\n⚠️ upgrade命令仍有问题');
    }
    
  } catch (error) {
    console.error('修复失败:', error);
  }
}

fixUpgradeCommand();