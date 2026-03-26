#!/usr/bin/env node

/**
 * Web界面版WeChat登录
 * 在浏览器中显示二维码，支持真实扫码操作
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const API_BASE = 'https://ilinkai.weixin.qq.com';

async function getBotQrCode() {
  return new Promise((resolve, reject) => {
    https.get(`${API_BASE}/ilink/bot/get_bot_qrcode?bot_type=3`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            qrcode: result.qrcode,
            qrcodeUrl: result.qrcode_img_content,
            timestamp: Date.now()
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkQrCodeStatus(qrcode) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ilinkai.weixin.qq.com',
      path: `/ilink/bot/get_qrcode_status?qrcode=${qrcode}`,
      headers: {
        'iLink-App-ClientVersion': '1'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const qrCode = await getBotQrCode();

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeChat 登录 - Stigmergy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      max-width: 500px;
      text-align: center;
    }
    h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
    .qr-container {
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 15px;
      padding: 20px;
      margin: 20px 0;
    }
    .qr-link {
      word-break: break-all;
      color: #495057;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.6;
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
    }
    .instructions {
      text-align: left;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .instructions h3 { color: #856404; margin-bottom: 10px; font-size: 16px; }
    .instructions ol { margin-left: 20px; color: #856404; }
    .instructions li { margin: 8px 0; line-height: 1.5; }
    .status {
      margin-top: 20px;
      padding: 15px;
      border-radius: 10px;
      font-weight: bold;
    }
    .status.waiting { background: #d1ecf1; color: #0c5460; }
    .status.scanned { background: #d4edda; color: #155724; }
    .status.expired { background: #f8d7da; color: #721c24; }
    .refresh-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 15px;
    }
    .refresh-btn:hover { background: #5568d3; }
    .auto-refresh { font-size: 12px; color: #6c757d; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 WeChat 登录</h1>
    <p class="subtitle">Stigmergy 多CLI协作系统</p>

    <div class="instructions">
      <h3>⚠️ 重要说明</h3>
      <ol>
        <li><strong>不要在微信中直接点击链接</strong></li>
        <li>需要<strong>使用微信扫一扫</strong>扫描二维码</li>
        <li>或者复制链接到二维码生成器生成二维码图片</li>
      </ol>
    </div>

    <div class="qr-container">
      <p style="color: #495057; margin-bottom: 10px;">🔗 二维码链接：</p>
      <div class="qr-link">${qrCode.qrcodeUrl}</div>
    </div>

    <div id="status" class="status waiting">
      ⏳ 等待扫码...
    </div>

    <p class="auto-refresh">🔄 页面每8秒自动刷新</p>

    <button class="refresh-btn" onclick="location.reload()">立即刷新</button>

    <script>
      // 自动刷新页面（每8秒）
      setTimeout(() => {
        location.reload();
      }, 8000);

      // 显示二维码ID用于调试
      console.log('二维码ID:', '${qrCode.qrcode}');
      console.log('生成时间:', new Date(${qrCode.timestamp}).toLocaleString());
    </script>
  </div>
</body>
</html>
      `);

    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('错误: ' + error.message);
    }
  } else if (req.url === '/api/status') {
    // API状态检查端点
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const qrcode = urlParams.get('qrcode');

    if (!qrcode) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '缺少qrcode参数' }));
      return;
    }

    try {
      const status = await checkQrCodeStatus(qrcode);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - 页面未找到');
  }
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🌐 WeChat Web登录服务器');
  console.log('='.repeat(70));
  console.log(`\n✅ 服务器已启动: http://localhost:${PORT}`);
  console.log('\n📱 操作步骤:');
  console.log('   1. 在浏览器中打开: http://localhost:' + PORT);
  console.log('   2. 使用微信"扫一扫"扫描页面上的二维码');
  console.log('   3. 在微信中确认登录');
  console.log('\n💡 提示: 页面每8秒自动刷新二维码');
  console.log('='.repeat(70) + '\n');
});
