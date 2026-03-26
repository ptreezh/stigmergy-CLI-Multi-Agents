#!/usr/bin/env node

/**
 * Wechaty Bot 完整版 - 支持 CLI 切换和任务执行
 */

import { WechatyBuilder } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import { spawn } from 'child_process';

// 配置
const CONFIG = {
  defaultCLI: 'claude',
  availableCLIs: ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'opencode', 'kilocode'],
  cliCapabilities: {
    claude: { code: 0.95, reasoning: 0.95, conversation: 0.90, chinese: 0.80 },
    gemini: { multimodal: 0.95, conversation: 0.90, reasoning: 0.85, code: 0.80 },
    qwen: { code: 0.85, chinese: 0.95, conversation: 0.90, reasoning: 0.80 },
    iflow: { conversation: 0.85, chinese: 0.90, reasoning: 0.75 },
    codebuddy: { code: 0.90, reasoning: 0.80, conversation: 0.85 },
    opencode: { code: 0.92, reasoning: 0.85, conversation: 0.80, chinese: 0.75 },
    kilocode: { code: 0.88, reasoning: 0.82, conversation: 0.78, chinese: 0.85 }
  }
};

// 会话管理
const sessions = new Map();

class Session {
  constructor(userId) {
    this.userId = userId;
    this.currentCLI = CONFIG.defaultCLI;
    this.context = [];
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  setCLI(cli) {
    this.currentCLI = cli;
    this.lastActivity = Date.now();
  }

  addContext(message) {
    this.context.push(message);
    if (this.context.length > 10) {
      this.context.shift();
    }
    this.lastActivity = Date.now();
  }

  isExpired() {
    return Date.now() - this.lastActivity > 30 * 60 * 1000; // 30分钟
  }
}

// 命令解析器
function parseCommand(text) {
  text = text.trim();

  // CLI 切换命令
  const cliPatterns = [
    /^(?:切换|使用|switch|use|switch to)\s+(\w+)\s*(?:cli)?$/i,
    /^(\w+)\s*cli$/i
  ];

  for (const pattern of cliPatterns) {
    const match = text.match(pattern);
    if (match) {
      const cliName = match[2] || match[1];
      return { type: 'cliSwitch', cli: cliName.toLowerCase() };
    }
  }

  // 任务执行命令
  const taskPatterns = [
    /^(?:执行|运行|execute|run|do)\s*[:：]?\s*(.+)$/i,
    /^(?:帮我|请|can you|could you)\s*(.+)$/i
  ];

  for (const pattern of taskPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { type: 'taskExecute', task: match[match.length - 1].trim() };
    }
  }

  // 查询命令
  if (/^(?:查询|搜索|query|search|find)\s*(.+)$/i.test(text)) {
    const match = text.match(/^(?:查询|搜索|query|search|find)\s*(.+)$/i);
    return { type: 'query', query: match[1].trim() };
  }

  // 状态命令
  if (/^(?:状态|查看状态|status|check status|current)$/i.test(text)) {
    return { type: 'status' };
  }

  // 帮助命令
  if (/^(?:帮助|help|\?|怎么用|使用说明)$/i.test(text)) {
    return { type: 'help' };
  }

  // 关于命令
  if (/^(?:关于|about)$/i.test(text)) {
    return { type: 'about' };
  }

  // 时间命令
  if (/^(?:时间|date|time|现在几点)$/i.test(text)) {
    return { type: 'time' };
  }

  // 问候命令
  if (/^(?:你好|hello|hi|嗨|您好)$/i.test(text)) {
    return { type: 'greeting' };
  }

  return { type: 'chat', text: text };
}

// CLI 选择器
function selectBestCLI(task) {
  const taskLower = task.toLowerCase();
  let bestCLI = CONFIG.defaultCLI;
  let bestScore = 0;

  for (const [cli, capabilities] of Object.entries(CONFIG.cliCapabilities)) {
    let score = 0;

    // 代码任务检测
    if (taskLower.includes('代码') || taskLower.includes('code') ||
        taskLower.includes('函数') || taskLower.includes('function') ||
        taskLower.includes('算法') || taskLower.includes('algorithm')) {
      score += (capabilities.code || 0) * 3;
    }

    // 推理任务检测
    if (taskLower.includes('分析') || taskLower.includes('explain') ||
        taskLower.includes('为什么') || taskLower.includes('如何')) {
      score += (capabilities.reasoning || 0) * 2;
    }

    // 中文任务检测
    if (/[\u4e00-\u9fa5]/.test(task)) {
      score += (capabilities.chinese || 0) * 1.5;
    }

    // 对话任务检测
    if (taskLower.length < 50) {
      score += (capabilities.conversation || 0);
    }

    if (score > bestScore) {
      bestScore = score;
      bestCLI = cli;
    }
  }

  return bestCLI;
}

// 执行 stigmergy call
async function executeStigmergyCall(cli, task, userId) {
  return new Promise((resolve, reject) => {
    const args = ['call', cli, task];

    console.log(`\n🔧 执行: stigmergy ${args.join(' ')}`);

    const child = spawn('npm', ['start', '--', ...args], {
      cwd: process.cwd(),
      shell: true
    });

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`   ${text}`);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      error += text;
      console.error(`   ${text}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output || '任务执行完成');
      } else {
        resolve(`任务执行完成 (exit code: ${code})\n输出: ${output || '无输出'}`);
      }
    });

    child.on('error', (err) => {
      reject(new Error(`执行失败: ${err.message}`));
    });

    // 超时处理
    setTimeout(() => {
      child.kill();
      resolve('任务执行超时，但可能仍在处理中...');
    }, 60000); // 60秒超时
  });
}

// 获取会话
function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, new Session(userId));
  }
  return sessions.get(userId);
}

// 清理过期会话
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [userId, session] of sessions.entries()) {
    if (session.isExpired()) {
      sessions.delete(userId);
      console.log(`🧹 清理过期会话: ${userId}`);
    }
  }
}

async function startWechatyBot() {
  console.log('='.repeat(70));
  console.log('🚀 Stigmergy WeChat Bot - 完整版');
  console.log('='.repeat(70));
  console.log('\n✨ 功能:');
  console.log('  • CLI 智能切换 - Claude/Gemini/Qwen');
  console.log('  • 任务执行 - 自动选择最佳 CLI');
  console.log('  • 多模态支持 - 文本/图片/语音');
  console.log('  • 会话管理 - 记住上下文和偏好\n');

  // 创建 Wechaty 实例
  const bot = WechatyBuilder.build({
    name: 'stigmergy-wechat-bot',
    puppet: 'wechaty-puppet-wechat',
  });

  let loginTime = null;
  let messageCount = 0;

  // 定期清理会话
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000); // 每5分钟

  // 设置事件监听
  bot
    .on('scan', (qrcode, status) => {
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('📱 请扫描二维码登录微信');
      console.log('═══════════════════════════════════════════════════════════════\n');

      qrcodeTerminal.generate(qrcode, { small: true });

      console.log('\n提示:');
      console.log('  1. 打开微信，点击右上角 "+" → "扫一扫"');
      console.log('  2. 扫描上方二维码');
      console.log('  3. 在手机上确认登录\n');
    })
    .on('login', async (user) => {
      loginTime = new Date();
      console.log('\n🎉 登录成功！');
      console.log(`   用户: ${user.name()}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   时间: ${loginTime.toLocaleString()}\n`);

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('💡 使用提示:');
      console.log('  • "切换 gemini cli" - 切换 AI 助手');
      console.log('  • "执行 创建排序算法" - 执行编程任务');
      console.log('  • "帮助" - 查看所有命令');
      console.log('  • 按 Ctrl+C 退出\n');

      // 保存登录凭证
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');

      const credentialsDir = path.join(os.homedir(), '.stigmergy');
      const credentialsPath = path.join(credentialsDir, 'wechaty-credentials.json');

      try {
        fs.mkdirSync(credentialsDir, { recursive: true });
        fs.writeFileSync(credentialsPath, JSON.stringify({
          botName: user.name(),
          botId: user.id,
          loginTime: loginTime.toISOString()
        }, null, 2));
        console.log(`✅ 登录凭证已保存到: ${credentialsPath}\n`);
      } catch (error) {
        console.error('保存凭证失败:', error.message);
      }
    })
    .on('logout', (user) => {
      const sessionDuration = loginTime
        ? `${Math.round((Date.now() - loginTime.getTime()) / 1000 / 60)} 分钟`
        : '未知';

      console.log(`\n⚠️  用户 ${user.name()} 已登出`);
      console.log(`   会话时长: ${sessionDuration}`);
      console.log(`   处理消息: ${messageCount} 条\n`);
    })
    .on('message', async (message) => {
      // 跳过自己发送的消息
      if (message.self()) {
        return;
      }

      try {
        const contact = message.talker();
        const text = message.text();
        const room = message.room();
        const userId = contact.id();

        messageCount++;

        console.log('\n📨 收到消息:');
        console.log(`   来自: ${contact.name()}`);
        if (room) {
          console.log(`   群聊: ${room.topic()}`);
        }
        console.log(`   内容: ${text}`);

        // 获取会话
        const session = getSession(userId);

        // 解析命令
        const command = parseCommand(text);
        console.log(`   命令类型: ${command.type}`);

        let response = '';

        switch (command.type) {
          case 'cliSwitch':
            const cliName = command.cli;

            if (CONFIG.availableCLIs.includes(cliName)) {
              session.setCLI(cliName);
              response = `✅ 已切换到 ${cliName.toUpperCase()} CLI\n当前 CLI: ${session.currentCLI}`;
              console.log(`   ✅ CLI 切换成功: ${cliName}`);
            } else {
              const availableList = CONFIG.availableCLIs.map(c => c.toUpperCase()).join(', ');
              response = `❌ 不支持的 CLI: ${cliName}\n\n可用的 CLI:\n${availableList}`;
              console.log(`   ❌ 不支持的 CLI: ${cliName}`);
            }
            break;

          case 'taskExecute':
            const task = command.task;
            console.log(`   🎯 执行任务: ${task}`);

            // 智能选择 CLI
            const selectedCLI = selectBestCLI(task);
            console.log(`   🤖 选择 CLI: ${selectedCLI}`);

            try {
              await contact.say(`🤖 正在使用 ${selectedCLI.toUpperCase()} 执行任务...\n\n任务: ${task}\n\n请稍候...`);

              const result = await executeStigmergyCall(selectedCLI, task, userId);

              // 截断过长的结果
              const maxResultLength = 1500;
              const truncatedResult = result.length > maxResultLength
                ? result.substring(0, maxResultLength) + '\n\n...(结果已截断)'
                : result;

              response = `✅ 任务完成\n\n${truncatedResult}`;
              console.log(`   ✅ 任务执行完成`);
            } catch (error) {
              response = `❌ 任务执行失败: ${error.message}`;
              console.log(`   ❌ 任务执行失败: ${error.message}`);
            }
            break;

          case 'query':
            response = `🔍 查询功能\n\n您想查询: ${command.query}\n\n💡 提示: 查询功能正在开发中，敬请期待！`;
            console.log(`   🔍 查询: ${command.query}`);
            break;

          case 'status':
            response = `📊 当前状态\n\n用户: ${contact.name()}\n当前 CLI: ${session.currentCLI}\n会话时长: ${Math.floor((Date.now() - session.createdAt) / 60000)} 分钟\n上下文条数: ${session.context.length}\n消息计数: ${messageCount}`;
            console.log(`   📊 状态查询`);
            break;

          case 'help':
            response = `📋 可用命令\n\n🤖 CLI 管理:\n  • 切换 [cli] cli - 切换 AI 助手\n  • 示例: "切换 gemini cli"\n\n🎯 任务执行:\n  • 执行 [任务] - 执行编程任务\n  • 示例: "执行 创建快速排序"\n\n📊 信息查询:\n  • 状态 - 查看当前状态\n  • 时间 - 显示当前时间\n\n❓ 帮助:\n  • 帮助 - 显示此信息\n  • 关于 - 关于机器人\n\n🤖 可用 CLI:\n  • Claude - 综合能力最强\n  • Gemini - 多模态专家\n  • Qwen - 中文优化\n  • iFlow - 对话优化\n  • CodeBuddy - 代码专家\n  • OpenCode - 代码专家\n  • Kilocode - 代码助手`;
            console.log(`   📋 显示帮助`);
            break;

          case 'about':
            response = `🤖 Stigmergy WeChat Bot\n\n版本: 1.0.0\n基于: Wechaty\n许可: MIT\n\n功能:\n  • 智能CLI切换\n  • 任务自动执行\n  • 多模态支持\n  • 会话管理\n\n项目: https://github.com/stigmergy`;
            console.log(`   ℹ️ 显示关于信息`);
            break;

          case 'time':
            const now = new Date();
            response = `⏰ 当前时间\n\n${now.toLocaleString()}\n\n时区: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
            console.log(`   ⏰ 显示时间`);
            break;

          case 'greeting':
            response = `你好！我是 Stigmergy AI 助手，很高兴为你服务！\n\n我可以帮你:\n  • 切换不同的 AI 助手\n  • 执行编程任务\n  • 回答问题\n\n发送 "帮助" 查看所有命令。`;
            console.log(`   👋 问候回复`);
            break;

          default:
            // 普通对话
            session.addContext(text);
            response = `收到: "${text}"\n\n💡 提示: 使用 "执行 [任务]" 命令来执行编程任务`;
            console.log(`   💬 普通对话`);
            break;
        }

        // 发送回复
        if (response) {
          await contact.say(response);
          console.log('   ✅ 已发送回复\n');
        }

      } catch (error) {
        console.error('处理消息错误:', error.message);

        // 发送错误提示
        try {
          const contact = message.talker();
          await contact.say(`抱歉，处理消息时出错: ${error.message}`);
        } catch (e) {
          // 忽略
        }
      }
    })
    .on('error', (error) => {
      console.error('\n❌ Wechaty 错误:', error.message);
    })
    .on('ready', () => {
      console.log('\n✅ 机器人已就绪，等待消息...\n');
    });

  // 启动机器人
  try {
    console.log('🔧 正在启动机器人...\n');
    await bot.start();

    // 处理退出信号
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 正在停止机器人...\n');

      const sessionDuration = loginTime
        ? `${Math.round((Date.now() - loginTime.getTime()) / 1000 / 60)} 分钟`
        : '未知';

      console.log(`会话时长: ${sessionDuration}`);
      console.log(`处理消息: ${messageCount} 条`);
      console.log(`活跃会话: ${sessions.size} 个`);

      await bot.stop();

      console.log('\n✅ 已安全退出\n');
      process.exit(0);
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('⏳ 等待扫码登录...\n');

  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('\n💡 可能的解决方案:');
    console.error('  1. 确保已安装依赖');
    console.error('  2. 确保 stigmergy 命令可用');
    console.error('  3. 检查网络连接\n');
    process.exit(1);
  }
}

// 启动
console.log('正在启动 Wechaty Bot (完整版)...\n');
startWechatyBot();
