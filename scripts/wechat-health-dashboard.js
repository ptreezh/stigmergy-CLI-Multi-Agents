#!/usr/bin/env node

/**
 * WeChat Bot 健康监控仪表盘
 * 借鉴 vibe-remote 的监控设计
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const DATA_FILE = path.join(__dirname, '../.wechat-health-data.json');

/**
 * 健康数据存储
 */
class HealthDataStore {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('加载健康数据失败:', error.message);
    }

    return {
      bots: {},
      lastUpdate: new Date().toISOString(),
    };
  }

  _save() {
    try {
      this.data.lastUpdate = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('保存健康数据失败:', error.message);
    }
  }

  updateBot(botName, healthData) {
    this.data.bots[botName] = {
      ...this.data.bots[botName],
      ...healthData,
      lastUpdate: new Date().toISOString(),
    };
    this._save();
  }

  removeBot(botName) {
    delete this.data.bots[botName];
    this._save();
  }

  getAll() {
    return this.data;
  }

  getBot(botName) {
    return this.data.bots[botName];
  }
}

/**
 * HTML 仪表盘模板
 */
function getDashboardHTML(data) {
  const bots = Object.entries(data.bots);
  const healthyCount = bots.filter(([, b]) => b.status === 'healthy').length;
  const totalCount = bots.length;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeChat Bot 健康监控</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
        }

        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }

        .header .subtitle {
            color: #666;
            font-size: 14px;
        }

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

        .summary-card h3 {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
        }

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

        .bot-card .bot-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }

        .bot-card .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .status-healthy {
            background: #d4edda;
            color: #155724;
        }

        .status-degraded {
            background: #fff3cd;
            color: #856404;
        }

        .status-unhealthy {
            background: #f8d7da;
            color: #721c24;
        }

        .status-unknown {
            background: #e2e3e5;
            color: #383d41;
        }

        .bot-card .metrics {
            margin-top: 15px;
        }

        .bot-card .metric {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .bot-card .metric:last-child {
            border-bottom: none;
        }

        .bot-card .metric-label {
            color: #666;
            font-size: 14px;
        }

        .bot-card .metric-value {
            color: #333;
            font-weight: bold;
            font-size: 14px;
        }

        .last-update {
            text-align: center;
            color: white;
            margin-top: 30px;
            font-size: 14px;
        }

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
            <h1>🤖 WeChat Bot 健康监控</h1>
            <p class="subtitle">实时监控所有 Bot 实例的健康状态</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>总 Bot 数</h3>
                <div class="value">${totalCount}</div>
            </div>
            <div class="summary-card">
                <h3>健康 Bot</h3>
                <div class="value" style="color: #28a745;">${healthyCount}</div>
            </div>
            <div class="summary-card">
                <h3>异常 Bot</h3>
                <div class="value" style="color: #dc3545;">${totalCount - healthyCount}</div>
            </div>
        </div>

        <div class="bots-grid">
            ${bots.map(([botName, botData]) => `
                <div class="bot-card">
                    <div class="bot-name">${botName}</div>
                    <div class="status status-${botData.status || 'unknown'}">
                        ${(botData.status || 'unknown').toUpperCase()}
                    </div>
                    <div class="metrics">
                        <div class="metric">
                            <span class="metric-label">连接状态</span>
                            <span class="metric-value">${botData.connected ? '已连接' : '未连接'}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">队列长度</span>
                            <span class="metric-value">${botData.queueLength || 0}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">重连次数</span>
                            <span class="metric-value">${botData.retryCount || 0}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">最后更新</span>
                            <span class="metric-value">${botData.lastUpdate ? new Date(botData.lastUpdate).toLocaleTimeString('zh-CN') : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="last-update">
            最后更新: ${new Date(data.lastUpdate).toLocaleString('zh-CN')}
        </div>

        <div class="auto-refresh">
            🔄 自动刷新: 30秒
        </div>
    </div>

    <script>
        // 自动刷新
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>`;
}

/**
 * 创建 HTTP 服务器
 */
const store = new HealthDataStore();

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    const data = store.getAll();
    const html = getDashboardHTML(data);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);

  } else if (req.url === '/api/bots') {
    const data = store.getAll();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));

  } else if (req.method === 'POST' && req.url.startsWith('/api/bot/')) {
    const botName = req.url.split('/').pop();

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const healthData = JSON.parse(body);
        store.updateBot(botName, healthData);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });

  } else if (req.method === 'GET' && req.url.startsWith('/api/bot/')) {
    const botName = req.url.split('/').pop();
    const botData = store.getBot(botName);

    if (botData) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(botData));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bot not found' }));
    }

  } else if (req.method === 'DELETE' && req.url.startsWith('/api/bot/')) {
    const botName = req.url.split('/').pop();
    store.removeBot(botName);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

/**
 * 启动服务器
 */
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 WeChat Bot 健康监控仪表盘已启动');
  console.log('='.repeat(70));
  console.log(`\n📊 请在浏览器中打开：\n`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log('='.repeat(70));
  console.log('\n📡 API 端点：');
  console.log(`   GET  /health          - 仪表盘`);
  console.log(`   GET  /api/bots        - 获取所有 Bot 状态`);
  console.log(`   GET  /api/bot/:name   - 获取指定 Bot 状态`);
  console.log(`   POST /api/bot/:name   - 更新 Bot 状态`);
  console.log(`   DELETE /api/bot/:name - 删除 Bot`);
  console.log('\n' + '='.repeat(70) + '\n');
});

/**
 * 示例：如何更新 Bot 状态
 */
function exampleUpdateBotStatus() {
  const http = require('http');

  const botName = 'claude-bot';
  const healthData = {
    status: 'healthy',
    connected: true,
    queueLength: 5,
    retryCount: 0,
  };

  const postData = JSON.stringify(healthData);

  const req = http.request({
    hostname: 'localhost',
    port: PORT,
    path: `/api/bot/${botName}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Bot 状态已更新:', data));
  });

  req.on('error', (error) => {
    console.error('更新 Bot 状态失败:', error.message);
  });

  req.write(postData);
  req.end();
}

// 如果直接运行此文件
if (require.main === module) {
  // 5秒后自动更新示例数据
  setTimeout(() => {
    console.log('\n📝 更新示例数据...');
    exampleUpdateBotStatus();
  }, 5000);
}

module.exports = { server, HealthDataStore };
