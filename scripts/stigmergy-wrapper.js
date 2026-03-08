#!/usr/bin/env node
/**
 * Stigmergy 包装脚本
 *
 * 包装各个 CLI 的调用，在会话结束时自动触发协同进化 hooks
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class StigmergyWrapper {
  constructor(cliName) {
    this.cliName = cliName;
    this.projectDir = process.cwd();
    this.autoMemoryHook = path.join(this.projectDir, 'scripts', 'auto-memory-hook.js');
  }

  /**
   * 包装 CLI 调用
   */
  async wrap(prompt) {
    console.log(`🚀 [Stigmergy] 启动 ${this.cliName}，启用协同进化...\n`);

    // 1. 设置环境变量，让 CLI 知道当前项目
    const env = {
      ...process.env,
      STIGMERGY_PROJECT_DIR: this.projectDir,
      STIGMERGY_CLI_NAME: this.cliName,
      STIGMERGY_AUTO_MEMORY: 'true'
    };

    // 2. 调用原始 CLI
    try {
      const result = await this.callCLI(prompt, env);

      // 3. 会话结束后，触发自动记忆 hook
      await this.triggerAutoMemoryHook(prompt, result);

      return result;

    } catch (error) {
      // 即使失败也触发记忆 hook（记录失败经验）
      await this.triggerAutoMemoryHook(prompt, { error: error.message });

      throw error;
    }
  }

  /**
   * 调用原始 CLI
   */
  callCLI(prompt, env) {
    return new Promise((resolve, reject) => {
      const quotedPrompt = `"${prompt.replace(/"/g, '\\"')}"`;
      const command = `stigmergy ${this.cliName} ${quotedPrompt}`;

      const cli = spawn(command, {
        env,
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      cli.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data); // 实时输出
      });

      cli.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data); // 实时输出错误
      });

      cli.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`CLI failed with code ${code}: ${errorOutput || output}`));
        }
      });

      cli.on('error', (error) => {
        reject(new Error(`Failed to spawn CLI: ${error.message}`));
      });

      // 超时保护
      setTimeout(() => {
        cli.kill();
        reject(new Error('Timeout after 120 seconds'));
      }, 120000);
    });
  }

  /**
   * 触发自动记忆 hook
   */
  async triggerAutoMemoryHook(prompt, result) {
    try {
      // 构造模拟的会话数据
      const sessionData = {
        cli: this.cliName,
        prompt: prompt,
        result: result,
        timestamp: new Date().toISOString(),
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: typeof result === 'string' ? result : JSON.stringify(result) }
        ]
      };

      // 动态加载并执行 AutoMemoryHook
      const { AutoMemoryHook } = require(this.autoMemoryHook);
      const hook = new AutoMemoryHook();
      await hook.onSessionEnd(sessionData);

    } catch (error) {
      console.error(`   ⚠️  自动记忆 hook 失败:`, error.message);
    }
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const cliName = args[0];
  const prompt = args.slice(1).join(' ');

  if (!cliName || !prompt) {
    console.log('用法: node stigmergy-wrapper.js <cli> <prompt>');
    console.log('示例: node stigmergy-wrapper.js qwen "分析代码并改进"');
    process.exit(1);
  }

  const wrapper = new StigmergyWrapper(cliName);
  wrapper.wrap(prompt).catch(error => {
    console.error('错误:', error.message);
    process.exit(1);
  });
}

module.exports = { StigmergyWrapper };
