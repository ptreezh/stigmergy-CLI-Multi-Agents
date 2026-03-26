#!/usr/bin/env node

/**
 * WeChat 登录服务器
 * 启动一个简单的 HTTP 服务器，提供二维码登录页面
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const QRCode = require('qrcode');
const { exec } = require('child_process');

const PORT = 8080;

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // 获取二维码
    try {
      console.log('📱 获取二维码...');

      const https = require('https');
      const url = `https://ilinkai.weixin.qq.com/ilink/bot/get_bot_qrcode?bot_type=3`;

      const qrResponse = await new Promise((resolve, reject) => {
        https.get(url, (apiRes) => {
          let data = '';
          apiRes.on('data', chunk => data += chunk);
          apiRes.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      if (qrResponse.qrcode_img_content) {
        // 生成二维码图片
        const qrCodeDataURL = await new Promise((resolve) => {
          QRCode.toDataURL(qrResponse.qrcode_img_content, {
            width: 300,
            margin: 2
          }, (err, url) => {
            if (err) {
              // 如果 toDataURL 失败，使用 SVG 格式
              QRCode.toString(qrResponse.qrcode_img_content, { type: 'svg' }, (err, string) => {
                const svgBase64 = Buffer.from(string).toString('base64');
                resolve(`data:image/svg+xml;base64,${svgBase64}`);
              });
            } else {
              resolve(url);
            }
          });
        });

        // HTML 页面
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stigmergy WeChat 登录</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        #qrcode-image {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 10px;
        }
        #qrcode-image img {
            max-width: 100%;
            height: auto;
        }
        .qrcode-url {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            margin: 20px 0;
        }
        .instructions {
            text-align: left;
            background: #e8f4f8;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .instructions h3 {
            margin-top: 0;
            color: #2c6699;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 12px 0;
            line-height: 1.6;
        }
        .highlight {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .refresh-hint {
            color: #666;
            font-size: 14px;
            margin-top: 30px;
        }
        #status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            font-weight: bold;
            display: none;
        }
        .status-waiting {
            background: #fff3cd;
            color: #856404;
        }
        .status-scanned {
            background: #d1ecf1;
            color: #0c5460;
        }
        .status-success {
            background: #d4edda;
            color: #155724;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Stigmergy WeChat 登录</h1>

        <div id="qrcode-image">
            <img src="${qrCodeDataURL}" alt="微信扫码二维码">
        </div>

        <div class="qrcode-url">
            <strong>二维码链接：</strong><br>
            ${qrResponse.qrcode_img_content}
        </div>

        <div class="instructions">
            <h3>📱 扫码步骤：</h3>
            <ol>
                <li>打开微信，点击右上角 <strong>"..."</strong> → <strong>"扫一扫"</strong></li>
                <li>扫描上方二维码</li>
                <li>或在微信中直接打开上方链接</li>
                <li>在微信中点击<strong>"确认登录"</strong></li>
                <li>等待登录成功</li>
            </ol>
        </div>

        <div class="highlight">
            <strong>💡 提示：</strong><br>
            登录成功后，凭证会自动保存，下次使用时无需重复登录。
        </div>

        <div class="refresh-hint">
            页面会在 10 分钟后自动过期，请及时完成扫码
        </div>

        <div id="status" style="display: none;"></div>
    </div>

    <script>
        // 页面加载 10 分钟后自动过期
        setTimeout(function() {
            document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-size: 24px;">⏰ 页面已过期，请重新启动服务器<br><small style="font-size: 16px; color: #666;">关闭此窗口并重新运行</small></div>';
        }, 10 * 60 * 1000);
    </script>
</body>
</html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);

        console.log('✅ 页面已提供');

      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      }
    } catch (error) {
      console.error('❌ 获取二维码失败:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error: ' + error.message);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Stigmergy WeChat 登录服务器已启动');
  console.log('='.repeat(70));
  console.log(`\n📱 请在浏览器中打开：\n`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log('='.repeat(70));
  console.log('\n💡 提示：');
  console.log('   - 页面会显示微信扫码二维码');
  console.log('   - 用微信扫描二维码即可登录');
  console.log('   - 页面 10 分钟后自动过期');
  console.log('   - 按 Ctrl+C 停止服务器');
  console.log('\n' + '='.repeat(70) + '\n');
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n🛑 服务器已停止');
  server.close();
  process.exit(0);
});
