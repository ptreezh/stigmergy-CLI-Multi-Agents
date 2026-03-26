#!/usr/bin/env node

/**
 * OpenClaw WeChat 启动脚本
 *
 * 用法: node scripts/start-openclaw-wechat.js [cli-type]
 *
 * 示例:
 *   node scripts/start-openclaw-wechat.js claude
 *   node scripts/start-openclaw-wechat.js gemini
 *   node scripts/start-openclaw-wechat.js qwen
 */

const path = require('path');
const fs = require('fs');

// 导入适配器
const { OpenClawWeChatHandler } = require('../skills/openclaw-wechat-adapter');

/**
 * 加载配置
 */
function loadConfig() {
  const configPaths = [
    'openclaw-config.json',
    '.openclawrc',
    '.openclaw.json'
  ];

  for (const configPath of configPaths) {
    const fullPath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(fullPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        console.log(`✅ 已加载配置: ${configPath}`);
        return config;
      } catch (error) {
        console.warn(`⚠️  配置文件 ${configPath} 解析失败: ${error.message}`);
      }
    }
  }

  // 返回默认配置
  return {
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:39280',
    token: process.env.OPENCLAW_TOKEN,
    cliType: process.env.OPENCLAW_CLI_TYPE || 'claude',
    projectPath: process.env.OPENCLAW_PROJECT_PATH || process.cwd(),
    timeout: parseInt(process.env.OPENCLAW_TIMEOUT) || 35000
  };
}

/**
 * 验证配置
 */
function validateConfig(config) {
  const errors = [];

  if (!config.token) {
    errors.push('缺少 token（请设置 OPENCLAW_TOKEN 环境变量或在配置文件中指定）');
  }

  if (!config.cliType) {
    errors.push('缺少 cliType（请指定要使用的 AI CLI）');
  }

  return errors;
}

/**
 * 检查 OpenClaw Gateway 是否运行
 */
async function checkGateway(gatewayUrl) {
  const http = require('http');

  return new Promise((resolve) => {
    const url = new URL(gatewayUrl);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode < 500);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('\\n' + '='.repeat(70));
  console.log('🚀 OpenClaw WeChat for Stigmergy');
  console.log('='.repeat(70));

  // 获取 CLI 类型
  const cliType = process.argv[2] || process.env.OPENCLAW_CLI_TYPE || 'claude';
  console.log(`\\n📱 AI CLI: ${cliType.toUpperCase()}`);

  // 加载配置
  console.log('\\n📋 加载配置...');
  const config = loadConfig();
  config.cliType = cliType;

  console.log('   网关地址:', config.gatewayUrl);
  console.log('   项目路径:', config.projectPath);
  console.log('   超时时间:', config.timeout, 'ms');

  // 验证配置
  console.log('\\n🔍 验证配置...');
  const errors = validateConfig(config);
  if (errors.length > 0) {
    console.error('\\n❌ 配置错误:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.log('\\n💡 提示：');
    console.log('   1. 创建 openclaw-config.json 配置文件');
    console.log('   2. 或设置环境变量：');
    console.log('      export OPENCLAW_TOKEN=your-token');
    console.log('      export OPENCLAW_CLI_TYPE=claude');
    process.exit(1);
  }
  console.log('   ✅ 配置验证通过');

  // 检查 Gateway
  console.log('\\n🔗 检查 OpenClaw Gateway...');
  const gatewayRunning = await checkGateway(config.gatewayUrl);
  if (!gatewayRunning) {
    console.warn('   ⚠️  Gateway 似乎未运行');
    console.log('   💡 启动命令: openclaw gateway start');
    console.log('   ⚠️  继续尝试连接...');
  } else {
    console.log('   ✅ Gateway 运行正常');
  }

  // 创建处理器
  console.log('\\n🔧 初始化消息处理器...');
  const handler = new OpenClawWeChatHandler(config);

  // 优雅退出处理
  let isShuttingDown = false;

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\\n\\n🛑 收到 ${signal} 信号，正在优雅退出...`);
    await handler.stop();
    console.log('✅ 已停止服务');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // 启动服务
  console.log('\\n' + '='.repeat(70));
  console.log('✅ 准备就绪，开始监听微信消息...');
  console.log('='.repeat(70));
  console.log('\\n💡 提示：');
  console.log('   - 按 Ctrl+C 停止服务');
  console.log(`   - 使用微信发送消息，${cliType.toUpperCase()} CLI 将自动回复`);
  console.log('   - 查看日志了解处理详情\\n');

  try {
    await handler.start();
  } catch (error) {
    console.error('\\n❌ 服务启动失败:', error.message);
    console.error('\\n🔍 错误详情:');
    console.error(error);
    console.log('\\n💡 故障排查：');
    console.log('   1. 检查 OpenClaw 是否已安装: openclaw --version');
    console.log('   2. 检查 WeChat 插件是否已启用: openclaw config get');
    console.log('   3. 检查微信是否已登录: openclaw channels list');
    console.log('   4. 检查 Gateway 是否运行: openclaw gateway status');
    process.exit(1);
  }
}

// 运行
main().catch(error => {
  console.error('❌ 启动失败:', error);
  process.exit(1);
});
