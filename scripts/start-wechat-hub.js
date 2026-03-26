#!/usr/bin/env node

/**
 * WeChat Hub 启动脚本
 * 演示如何使用Hub管理多个CLI的Bot实例
 *
 * 使用场景：
 * 1. 一次扫码，多个CLI共享（共享凭证模式）
 * 2. 多次扫码，每个CLI独立（独立凭证模式）
 */

const { WeChatHub } = require('../skills/wechat-hub');
const http = require('http');

/**
 * 创建简单的管理界面
 */
function createManagementInterface(hub, port = 3003) {
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/status') {
      const status = hub.getStatus();
      const html = generateDashboardHTML(status);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);

    } else if (req.url === '/api/status') {
      const status = hub.getStatus();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status, null, 2));

    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`\n📊 Hub管理界面: http://localhost:${port}`);
  });

  return server;
}

/**
 * 生成仪表盘HTML
 */
function generateDashboardHTML(status) {
  const bots = status.bots || [];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeChat Hub 管理界面</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
        }
        .header h1 { color: #333; margin-bottom: 10px; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .summary-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .summary-card .value { font-size: 32px; font-weight: bold; color: #667eea; }
        .bots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .bot-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .bot-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; }
        .status { padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-connected { background: #d4edda; color: #155724; }
        .status-disconnected { background: #f8d7da; color: #721c24; }
        .status-initializing { background: #fff3cd; color: #856404; }
        .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .metric-label { color: #666; font-size: 14px; }
        .metric-value { color: #333; font-weight: bold; font-size: 14px; }
        .auto-refresh {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 10px 20px;
            border-radius: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 WeChat Hub 管理界面</h1>
            <p>多Bot实例管理 - 一个Bot对接一个CLI</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>总 Bot 数</h3>
                <div class="value">${status.totalBots}</div>
            </div>
            <div class="summary-card">
                <h3>健康 Bot</h3>
                <div class="value" style="color: #28a745;">${status.healthyBots}</div>
            </div>
            <div class="summary-card">
                <h3>异常 Bot</h3>
                <div class="value" style="color: #dc3545;">${status.unhealthyBots}</div>
            </div>
            <div class="summary-card">
                <h3>凭证模式</h3>
                <div class="value" style="font-size: 20px;">
                    ${status.sharedCredentials ? '共享' : '独立'}
                </div>
            </div>
        </div>

        <div class="bots-grid">
            ${bots.map(bot => `
                <div class="bot-card">
                    <div class="bot-name">${bot.cliName}</div>
                    <div class="status status-${bot.status}">
                        ${bot.status.toUpperCase()}
                    </div>
                    <div style="margin-top: 15px;">
                        <div class="metric">
                            <span class="metric-label">模式</span>
                            <span class="metric-value">${bot.mode === 'shared' ? '共享凭证' : '独立凭证'}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">消息数</span>
                            <span class="metric-value">${bot.messageCount}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">错误数</span>
                            <span class="metric-value">${bot.errorCount}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">运行时间</span>
                            <span class="metric-value">${bot.startTime ? new Date(bot.startTime).toLocaleString('zh-CN') : 'N/A'}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">最后活动</span>
                            <span class="metric-value">${bot.lastActivity ? new Date(bot.lastActivity).toLocaleString('zh-CN') : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="auto-refresh">
            🔄 自动刷新: 10秒
        </div>
    </div>

    <script>
        setTimeout(() => location.reload(), 10000);
    </script>
</body>
</html>`;
}

/**
 * 演示场景1：共享凭证模式
 */
async function demoSharedCredentialsMode() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 场景1: 共享凭证模式（一次扫码，多个CLI共享）');
  console.log('='.repeat(70));

  const hub = new WeChatHub();

  console.log('\n步骤:');
  console.log('  1. 扫码登录获取凭证');
  console.log('  2. 使用共享凭证创建多个Bot实例');
  console.log('  3. 每个Bot对应一个CLI（Claude、Qwen、Gemini...）');
  console.log('  4. 所有Bot共享同一个WeChat账号');

  console.log('\n⚠️ 注意：需要真实WeChat凭证才能连接');
  console.log('  请先运行: node scripts/start-wechat-ilink.js claude');
  console.log('  完成扫码登录后，凭证会自动保存');

  // 启动管理界面
  const server = createManagementInterface(hub, 3003);

  console.log('\n💡 提示：');
  console.log('  - 访问 http://localhost:3003 查看Hub状态');
  console.log('  - 按 Ctrl+C 停止服务');

  // 保持运行
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Hub已停止');
    server.close();
    process.exit(0);
  });

  await new Promise(() => {});  // 永不resolve，保持运行
}

/**
 * 演示场景2：独立凭证模式
 */
async function demoIndependentCredentialsMode() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 场景2: 独立凭证模式（多次扫码，每个CLI独立）');
  console.log('='.repeat(70));

  const hub = new WeChatHub();

  console.log('\n步骤:');
  console.log('  1. 为每个CLI分别扫码登录');
  console.log('  2. 每个CLI有独立的Bot实例和凭证');
  console.log('  3. Bot之间完全隔离，互不影响');

  console.log('\n⚠️ 注意：需要为每个CLI分别扫码');
  console.log('  - Claude Bot: node scripts/start-wechat-ilink.js claude');
  console.log('  - Qwen Bot: node scripts/start-wechat-ilink.js qwen');
  console.log('  - Gemini Bot: node scripts/start-wechat-ilink.js gemini');

  // 启动管理界面
  const server = createManagementInterface(hub, 3004);

  console.log('\n💡 提示：');
  console.log('  - 访问 http://localhost:3004 查看Hub状态');
  console.log('  - 按 Ctrl+C 停止服务');

  // 保持运行
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Hub已停止');
    server.close();
    process.exit(0);
  });

  await new Promise(() => {});  // 永不resolve，保持运行
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'shared';

  console.log('\n' + '='.repeat(70));
  console.log('🚀 Stigmergy WeChat Hub - 多Bot管理架构');
  console.log('='.repeat(70));

  if (mode === 'shared') {
    await demoSharedCredentialsMode();
  } else if (mode === 'independent') {
    await demoIndependentCredentialsMode();
  } else {
    console.log('\n使用方法:');
    console.log('  node scripts/start-wechat-hub.js shared       # 共享凭证模式');
    console.log('  node scripts/start-wechat-hub.js independent  # 独立凭证模式');
    process.exit(1);
  }
}

// 运行
main().catch(error => {
  console.error('启动失败:', error);
  process.exit(1);
});
