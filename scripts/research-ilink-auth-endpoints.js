#!/usr/bin/env node

/**
 * iLink Bot 认证端点研究脚本
 * 测试可能的认证和授权端点
 */

const https = require('https');

const API_BASE = 'https://ilinkai.weixin.qq.com';

/**
 * 通用API请求函数
 */
function apiRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...headers
      }
    };

    console.log(`\n📡 请求: ${method} ${options.path}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type'] || 'undefined'}`);
        console.log(`   Content-Length: ${res.headers['content-length'] || 'undefined'}`);

        try {
          const json = JSON.parse(data);
          console.log(`   响应:`, JSON.stringify(json, null, 2));
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          console.log(`   响应（文本）:`, data.substring(0, 200));
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ 错误:`, error.message);
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * 研究主函数
 */
async function researchAuthEndpoints() {
  console.log('='.repeat(70));
  console.log('🔍 iLink Bot 认证端点研究');
  console.log('='.repeat(70));

  const results = [];

  // 1. 测试可能的认证端点
  console.log('\n' + '='.repeat(70));
  console.log('🔐 第1组: 认证和登录端点');
  console.log('='.repeat(70));

  const authEndpoints = [
    { path: '/ilink/auth/login', method: 'POST' },
    { path: '/ilink/auth/token', method: 'POST' },
    { path: '/ilink/auth/authorize', method: 'GET' },
    { path: '/ilink/login', method: 'POST' },
    { path: '/ilink/token', method: 'POST' },
    { path: '/ilink/oauth/authorize', method: 'GET' },
    { path: '/ilink/oauth/token', method: 'POST' },
    { path: '/auth/login', method: 'POST' },
    { path: '/oauth/authorize', method: 'GET' },
  ];

  for (const endpoint of authEndpoints) {
    try {
      const response = await apiRequest(
        endpoint.path,
        endpoint.method,
        { 'Content-Type': 'application/json' },
        endpoint.method === 'POST' ? {} : null
      );

      if (response.status !== 404) {
        console.log(`   ✅ ${endpoint.path} 返回 ${response.status}`);
        results.push({ endpoint: endpoint.path, success: true, status: response.status, data: response.data });
      } else {
        console.log(`   ❌ ${endpoint.path} 不存在`);
        results.push({ endpoint: endpoint.path, success: false, status: 404 });
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path} 错误:`, error.message);
      results.push({ endpoint: endpoint.path, success: false, error: error.message });
    }
  }

  // 2. 测试 Bot 注册和管理端点
  console.log('\n' + '='.repeat(70));
  console.log('🤖 第2组: Bot 注册和管理端点');
  console.log('='.repeat(70));

  const botEndpoints = [
    { path: '/ilink/bot/register', method: 'POST' },
    { path: '/ilink/bot/create', method: 'POST' },
    { path: '/ilink/bot/auth', method: 'POST' },
    { path: '/ilink/bot/login', method: 'POST' },
    { path: '/bot/register', method: 'POST' },
    { path: '/bot/create', method: 'POST' },
  ];

  for (const endpoint of botEndpoints) {
    try {
      const response = await apiRequest(
        endpoint.path,
        endpoint.method,
        { 'Content-Type': 'application/json' },
        { bot_name: 'test', bot_type: 3 }
      );

      if (response.status !== 404) {
        console.log(`   ✅ ${endpoint.path} 返回 ${response.status}`);
        results.push({ endpoint: endpoint.path, success: true, status: response.status, data: response.data });
      } else {
        console.log(`   ❌ ${endpoint.path} 不存在`);
        results.push({ endpoint: endpoint.path, success: false, status: 404 });
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path} 错误:`, error.message);
      results.push({ endpoint: endpoint.path, success: false, error: error.message });
    }
  }

  // 3. 测试 API Key 和 App 相关端点
  console.log('\n' + '='.repeat(70));
  console.log('🔑 第3组: API Key 和应用管理端点');
  console.log('='.repeat(70));

  const apiEndpoints = [
    { path: '/ilink/api/key', method: 'GET' },
    { path: '/ilink/api/create', method: 'POST' },
    { path: '/ilink/app/info', method: 'GET' },
    { path: '/ilink/app/create', method: 'POST' },
    { path: '/api/key', method: 'GET' },
    { path: '/app/info', method: 'GET' },
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await apiRequest(endpoint.path, endpoint.method);

      if (response.status !== 404) {
        console.log(`   ✅ ${endpoint.path} 返回 ${response.status}`);
        results.push({ endpoint: endpoint.path, success: true, status: response.status, data: response.data });
      } else {
        console.log(`   ❌ ${endpoint.path} 不存在`);
        results.push({ endpoint: endpoint.path, success: false, status: 404 });
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path} 错误:`, error.message);
      results.push({ endpoint: endpoint.path, success: false, error: error.message });
    }
  }

  // 4. 测试开发者相关端点
  console.log('\n' + '='.repeat(70));
  console.log('👨‍💻 第4组: 开发者控制台端点');
  console.log('='.repeat(70));

  const devEndpoints = [
    { path: '/ilink/dev/info', method: 'GET' },
    { path: '/ilink/dev/console', method: 'GET' },
    { path: '/ilink/dev/apps', method: 'GET' },
    { path: '/developer', method: 'GET' },
    { path: '/console', method: 'GET' },
    { path: '/admin', method: 'GET' },
  ];

  for (const endpoint of devEndpoints) {
    try {
      const response = await apiRequest(endpoint.path, endpoint.method);

      if (response.status !== 404) {
        console.log(`   ✅ ${endpoint.path} 返回 ${response.status}`);
        results.push({ endpoint: endpoint.path, success: true, status: response.status, data: response.data });
      } else {
        console.log(`   ❌ ${endpoint.path} 不存在`);
        results.push({ endpoint: endpoint.path, success: false, status: 404 });
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path} 错误:`, error.message);
      results.push({ endpoint: endpoint.path, success: false, error: error.message });
    }
  }

  // 5. 测试带参数的认证端点
  console.log('\n' + '='.repeat(70));
  console.log('🔧 第5组: 带参数的认证测试');
  console.log('='.repeat(70));

  // 测试 QR code 认证（不同的实现方式）
  console.log('\n测试 QR code 认证变体:');

  const qrVariants = [
    '/ilink/qrcode/login',
    '/ilink/qrcode/auth',
    '/ilink/qr/login',
    '/ilink/qr/auth',
    '/qrcode/login',
  ];

  for (const path of qrVariants) {
    try {
      // 先尝试获取 QR code
      const getResponse = await apiRequest(path, 'GET');

      if (getResponse.status !== 404) {
        console.log(`   ✅ GET ${path} 返回 ${getResponse.status}`);
        results.push({ endpoint: `GET ${path}`, success: true, status: getResponse.status, data: getResponse.data });

        // 如果成功，尝试查询状态
        if (getResponse.data && getResponse.data.qrcode) {
          const statusPath = `${path}/status?qrcode=${getResponse.data.qrcode}`;
          const statusResponse = await apiRequest(statusPath, 'GET');

          if (statusResponse.status !== 404) {
            console.log(`   ✅ GET ${statusPath} 返回 ${statusResponse.status}`);
            results.push({ endpoint: `GET ${statusPath}`, success: true, status: statusResponse.status, data: statusResponse.data });
          }
        }
      } else {
        console.log(`   ❌ GET ${path} 不存在`);
        results.push({ endpoint: `GET ${path}`, success: false, status: 404 });
      }
    } catch (error) {
      console.log(`   ❌ GET ${path} 错误:`, error.message);
      results.push({ endpoint: `GET ${path}`, success: false, error: error.message });
    }
  }

  // 6. 测试不同的 HTTP 方法
  console.log('\n' + '='.repeat(70));
  console.log('🔄 第6组: 不同 HTTP 方法测试');
  console.log('='.repeat(70));

  const methodTestPaths = [
    '/ilink/auth',
    '/ilink/login',
    '/ilink/bot/auth',
    '/ilink/session',
  ];

  for (const path of methodTestPaths) {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      try {
        const response = await apiRequest(path, method, { 'Content-Type': 'application/json' }, method !== 'GET' ? {} : null);

        if (response.status !== 404 && response.status !== 405) {
          console.log(`   ✅ ${method} ${path} 返回 ${response.status}`);
          results.push({ endpoint: `${method} ${path}`, success: true, status: response.status, data: response.data });
        } else if (response.status === 405) {
          console.log(`   ⚠️  ${method} ${path} 方法不允许（端点存在）`);
          results.push({ endpoint: `${method} ${path}`, success: true, status: 405, note: 'Method not allowed' });
        } else {
          console.log(`   ❌ ${method} ${path} 不存在`);
          results.push({ endpoint: `${method} ${path}`, success: false, status: 404 });
        }
      } catch (error) {
        // 忽略连接错误，可能端点根本不存在
        results.push({ endpoint: `${method} ${path}`, success: false, error: error.message });
      }
    }
  }

  // 总结
  console.log('\n' + '='.repeat(70));
  console.log('📊 研究总结');
  console.log('='.repeat(70));

  const successful = results.filter(r => r.success && r.status !== 404);
  const notFound = results.filter(r => !r.success || r.status === 404);
  const interesting = results.filter(r => r.success && r.status !== 200 && r.status !== 404);

  console.log(`\n✅ 发现的端点（非404）: ${successful.length} 个`);
  console.log(`❌ 不存在的端点（404）: ${notFound.length} 个`);
  console.log(`⚠️  有趣的响应（非200）: ${interesting.length} 个`);

  if (successful.length > 0) {
    console.log('\n发现的端点:');
    successful.forEach(r => {
      const statusInfo = r.status === 405 ? ' [方法不允许]' : '';
      console.log(`   - ${r.endpoint} → ${r.status}${statusInfo}`);
      if (r.data && typeof r.data === 'object') {
        console.log(`     数据: ${JSON.stringify(r.data).substring(0, 100)}...`);
      }
    });
  }

  if (interesting.length > 0) {
    console.log('\n有趣的响应:');
    interesting.forEach(r => {
      console.log(`   - ${r.endpoint} → ${r.status}`);
      if (r.note) console.log(`     说明: ${r.note}`);
      if (r.data) console.log(`     数据: ${JSON.stringify(r.data).substring(0, 100)}...`);
    });
  }

  // 保存结果
  const fs = require('fs');
  const reportPath = 'ilink-auth-research-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 详细结果已保存到: ${reportPath}`);

  return results;
}

// 执行研究
researchAuthEndpoints()
  .then(() => {
    console.log('\n✅ 研究完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 研究失败:', error);
    process.exit(1);
  });
