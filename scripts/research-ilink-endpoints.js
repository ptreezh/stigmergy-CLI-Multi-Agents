#!/usr/bin/env node

/**
 * iLink Bot API 接口研究脚本
 * 探索和测试所有可用的API端点
 */

const https = require('https');

const API_BASE = 'https://ilinkai.weixin.qq.com';

/**
 * 通用API请求函数
 */
function apiRequest(path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'User-Agent': 'Stigmergy-iLink-Research/1.0',
        ...headers
      }
    };

    console.log(`\n📡 请求: ${method} ${options.path}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${res.headers['content-length']}`);

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

    req.end();
  });
}

/**
 * 研究主函数
 */
async function researchILinkAPI() {
  console.log('='.repeat(70));
  console.log('🔍 iLink Bot API 接口研究');
  console.log('='.repeat(70));

  const results = [];

  // 1. 测试获取二维码端点
  console.log('\n' + '='.repeat(70));
  console.log('📱 端点1: 获取二维码 (get_bot_qrcode)');
  console.log('='.repeat(70));

  try {
    const qrResponse = await apiRequest('/ilink/bot/get_bot_qrcode?bot_type=3');
    results.push({ endpoint: 'get_bot_qrcode', success: true, data: qrResponse });
  } catch (error) {
    results.push({ endpoint: 'get_bot_qrcode', success: false, error: error.message });
  }

  // 2. 测试不同的bot_type
  console.log('\n' + '='.repeat(70));
  console.log('🔧 测试不同的 bot_type 参数');
  console.log('='.repeat(70));

  const botTypes = [1, 2, 3, 4, 5];
  for (const botType of botTypes) {
    try {
      const response = await apiRequest(`/ilink/bot/get_bot_qrcode?bot_type=${botType}`);
      if (response.data.ret === 0) {
        console.log(`   ✅ bot_type=${botType} 可用`);
        results.push({ endpoint: `get_bot_qrcode?type=${botType}`, success: true });
      } else {
        console.log(`   ⚠️  bot_type=${botType} 返回:`, response.data);
        results.push({ endpoint: `get_bot_qrcode?type=${botType}`, success: false, response: response.data });
      }
    } catch (error) {
      console.log(`   ❌ bot_type=${botType} 错误:`, error.message);
      results.push({ endpoint: `get_bot_qrcode?type=${botType}`, success: false, error: error.message });
    }
  }

  // 3. 测试状态查询端点
  console.log('\n' + '='.repeat(70));
  console.log('📊 端点2: 查询二维码状态 (get_qrcode_status)');
  console.log('='.repeat(70));

  try {
    // 使用一个示例qrcode
    const statusResponse = await apiRequest('/ilink/bot/get_qrcode_status?qrcode=test123');
    results.push({ endpoint: 'get_qrcode_status', success: true, data: statusResponse });
  } catch (error) {
    results.push({ endpoint: 'get_qrcode_status', success: false, error: error.message });
  }

  // 4. 测试配置端点
  console.log('\n' + '='.repeat(70));
  console.log('⚙️  端点3: 获取配置 (getconfig)');
  console.log('='.repeat(70));

  try {
    const configResponse = await apiRequest('/ilink/bot/getconfig', 'POST', {
      'Content-Type': 'application/json'
    });
    results.push({ endpoint: 'getconfig', success: true, data: configResponse });
  } catch (error) {
    results.push({ endpoint: 'getconfig', success: false, error: error.message });
  }

  // 5. 测试长轮询端点
  console.log('\n' + '='.repeat(70));
  console.log('🔄 端点4: 长轮询获取消息 (getupdates)');
  console.log('='.repeat(70));

  try {
    const updatesResponse = await apiRequest('/ilink/bot/getupdates', 'POST', {
      'Content-Type': 'application/json'
    });
    results.push({ endpoint: 'getupdates', success: true, data: updatesResponse });
  } catch (error) {
    results.push({ endpoint: 'getupdates', success: false, error: error.message });
  }

  // 6. 测试根路径
  console.log('\n' + '='.repeat(70));
  console.log('🏠 端点5: 根路径 (/)');
  console.log('='.repeat(70));

  try {
    const rootResponse = await apiRequest('/');
    results.push({ endpoint: 'root', success: true, data: rootResponse });
  } catch (error) {
    results.push({ endpoint: 'root', success: false, error: error.message });
  }

  // 7. 测试API文档路径
  const docPaths = [
    '/docs',
    '/api',
    '/v1',
    '/ilink',
    '/ilink/bot',
    '/health',
    '/ping'
  ];

  console.log('\n' + '='.repeat(70));
  console.log('📚 端点6: 其他可能的路径');
  console.log('='.repeat(70));

  for (const path of docPaths) {
    try {
      const response = await apiRequest(path);
      console.log(`   ✅ ${path} 可访问`);
      results.push({ endpoint: path, success: true, status: response.status });
    } catch (error) {
      console.log(`   ❌ ${path} ${error.message}`);
      results.push({ endpoint: path, success: false, error: error.message });
    }
  }

  // 总结
  console.log('\n' + '='.repeat(70));
  console.log('📊 研究总结');
  console.log('='.repeat(70));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ 成功访问: ${successful.length} 个端点`);
  console.log(`❌ 访问失败: ${failed.length} 个端点`);

  console.log('\n成功的端点:');
  successful.forEach(r => {
    console.log(`   - ${r.endpoint}`);
  });

  console.log('\n失败的端点:');
  failed.forEach(r => {
    console.log(`   - ${r.endpoint}: ${r.error || r.response?.ret}`);
  });

  // 保存结果
  const fs = require('fs');
  const reportPath = 'ilink-api-research-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 详细结果已保存到: ${reportPath}`);

  return results;
}

// 执行研究
researchILinkAPI()
  .then(() => {
    console.log('\n✅ 研究完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 研究失败:', error);
    process.exit(1);
  });
