#!/usr/bin/env node

/**
 * Cloud Deployment Orchestrator
 *
 * 一键部署到免费云基础设施
 * 支持：Vercel, Railway, Supabase, Cloudflare
 *
 * 核心使命：零成本、安全可信、可分布式
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class CloudDeploymentOrchestrator {
  constructor() {
    this.platform = os.platform();
    this.deployConfig = this.loadDeployConfig();
    this.checklist = [];
  }

  /**
   * 主部署流程
   */
  async deploy(options = {}) {
    console.log('🚀 开始云端部署流程\n');

    const services = options.services || ['vercel', 'supabase', 'railway', 'cloudflare'];

    for (const service of services) {
      await this.deployService(service);
    }

    // 生成部署报告
    const report = this.generateDeploymentReport();
    await this.saveDeploymentReport(report);

    return report;
  }

  /**
   * 部署单个服务
   */
  async deployService(service) {
    console.log(`\n📦 部署 ${service.toUpperCase()}...`);

    switch (service) {
      case 'vercel':
        await this.deployVercel();
        break;
      case 'supabase':
        await this.deploySupabase();
        break;
      case 'railway':
        await this.deployRailway();
        break;
      case 'cloudflare':
        await this.deployCloudflare();
        break;
      default:
        console.log(`❌ 未知服务: ${service}`);
    }
  }

  /**
   * 部署到Vercel
   */
  async deployVercel() {
    console.log('   📝 准备Vercel部署...');

    // 检查vercel CLI
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('   ✅ Vercel CLI已安装');
    } catch (error) {
      console.log('   ⚠️  Vercel CLI未安装，安装中...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // 创建vercel.json
    this.createVercelConfig();

    // 部署提示
    const steps = [
      '1. 访问 https://vercel.com/new',
      '2. 导入GitHub仓库',
      '3. 配置项目设置',
      '4. 点击Deploy按钮',
      '5. 等待部署完成'
    ];

    console.log('   📋 部署步骤:');
    steps.forEach(step => console.log(`      ${step}`));
    console.log('   💡 提示: Vercel会自动从GitHub部署main分支');

    this.checklist.push({
      service: 'vercel',
      status: 'pending',
      instructions: steps,
      url: 'https://vercel.com/new'
    });
  }

  /**
   * 部署到Supabase
   */
  async deploySupabase() {
    console.log('   📝 准备Supabase部署...');

    // 创建SQL脚本
    this.createSupabaseSchema();

    const steps = [
      '1. 访问 https://supabase.com',
      '2. 创建新项目（免费计划）',
      '3. 在SQL Editor中执行脚本',
      '4. 在API Settings中创建密钥',
      '5. 复制数据库连接字符串'
    ];

    console.log('   📋 部署步骤:');
    steps.forEach(step => console.log(`      ${step}`));

    console.log('   📄 SQL脚本已生成: scripts/supabase/schema.sql');

    this.checklist.push({
      service: 'supabase',
      status: 'pending',
      instructions: steps,
      url: 'https://supabase.com',
      script: 'scripts/supabase/schema.sql'
    });
  }

  /**
   * 部署到Railway
   */
  async deployRailway() {
    console.log('   📝 准备Railway部署...');

    // 创建railway.json
    this.createRailwayConfig();

    // 创建Dockerfile
    this.createDockerfile();

    const steps = [
      '1. 访问 https://railway.app/new',
      '2. 选择"Deploy from GitHub repo"',
      '3. 选择仓库和分支',
      '4. 配置环境变量',
      '5. 点击Deploy'
    ];

    console.log('   📋 部署步骤:');
    steps.forEach(step => console.log(`      ${step}`));

    console.log('   📄 配置文件已生成:');
    console.log('      - railway.json');
    console.log('      - Dockerfile');

    this.checklist.push({
      service: 'railway',
      status: 'pending',
      instructions: steps,
      url: 'https://railway.app/new'
    });
  }

  /**
   * 部署到Cloudflare
   */
  async deployCloudflare() {
    console.log('   📝 准备Cloudflare部署...');

    // 创建Workers脚本
    this.createCloudflareWorkers();

    const steps = [
      '1. 访问 https://dash.cloudflare.com',
      '2. 选择Workers & Pages',
      '3. 创建Service (Workers)',
      '4. 部署workers/index.js',
      '5. 配置R2存储（可选）'
    ];

    console.log('   📋 部署步骤:');
    steps.forEach(step => console.log(`      ${step}`));

    console.log('   📄 Workers脚本已生成: workers/index.js');

    this.checklist.push({
      service: 'cloudflare',
      status: 'pending',
      instructions: steps,
      url: 'https://dash.cloudflare.com'
    });
  }

  /**
   * 创建Vercel配置
   */
  createVercelConfig() {
    const config = {
      version: 2,
      builds: [
        {
          src: 'website/package.json',
          use: '@vercel/static-build',
          config: { distDir: 'public' }
        }
      ],
      routes: [
        {
          src: '/api/(.*)',
          dest: '/api/$1'
        }
      ]
    };

    const configPath = path.join(__dirname, '..', 'vercel.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('   ✅ vercel.json已创建');
  }

  /**
   * 创建Supabase Schema
   */
  createSupabaseSchema() {
    const scriptsDir = path.join(__dirname, '..', 'scripts', 'supabase');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    const schema = `
-- 创建反馈表
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  effectiveness TEXT,
  ease_of_use INTEGER,
  reliability INTEGER,
  performance INTEGER,
  accuracy INTEGER,
  would_recommend BOOLEAN,
  use_case TEXT,
  domain TEXT,
  pros TEXT[],
  cons TEXT[],
  suggestions TEXT,
  security_concerns TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建推荐表
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  score DECIMAL(5,2),
  confidence DECIMAL(5,2),
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedback_skill ON feedback(skill_name);
CREATE INDEX idx_feedback_agent ON feedback(agent_id);
CREATE INDEX idx_recommendations_agent ON recommendations(agent_id);

-- 启用行级安全
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (agent_id = current_user);

CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (agent_id = current_user);

-- 创建视图
CREATE VIEW skill_ratings AS
SELECT
  skill_name,
  AVG(rating) as avg_rating,
  COUNT(*) as feedback_count,
  AVG(reliability) as avg_reliability
FROM feedback
GROUP BY skill_name;
    `;

    const schemaPath = path.join(scriptsDir, 'schema.sql');
    fs.writeFileSync(schemaPath, schema);
    console.log('   ✅ schema.sql已创建');
  }

  /**
   * 创建Railway配置
   */
  createRailwayConfig() {
    const config = {
      build: {
        builder: 'NIXPACKS',
        buildCommand: 'npm run build',
        watchPatterns: ['skills/**/*.js']
      },
      deploy: {
        startCommand: 'node server/index.js',
        healthcheckPath: '/health'
      }
    };

    const configPath = path.join(__dirname, '..', 'railway.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('   ✅ railway.json已创建');
  }

  /**
   * 创建Dockerfile
   */
  createDockerfile() {
    const dockerfile = `# 使用Node.js 18
FROM node:18-alpine

# 工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error('Health check failed')})"

# 启动应用
CMD ["node", "server/index.js"]
`;

    const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
    fs.writeFileSync(dockerfilePath, dockerfile);
    console.log('   ✅ Dockerfile已创建');
  }

  /**
   * 创建Cloudflare Workers
   */
  createCloudflareWorkers() {
    const workersDir = path.join(__dirname, '..', 'workers');
    if (!fs.existsSync(workersDir)) {
      fs.mkdirSync(workersDir, { recursive: true });
    }

    const workerCode = `
// Cloudflare Workers - 边缘计算层
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API路由
    if (url.pathname.startsWith('/api/recommend')) {
      return handleRecommendation(request, env);
    }

    // API路由
    if (url.pathname.startsWith('/api/feedback')) {
      return handleFeedback(request, env);
    }

    // 健康检查
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 静态资源
    return env.ASSETS.fetch(request);
  }
};

// 处理推荐请求
async function handleRecommendation(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const agentId = body.agentId;
    const context = body.context || {};

    // 这里应该调用Railway API
    const apiUrl = env.RAILWAY_API_URL;
    const response = await fetch(\`\${apiUrl}/api/recommend\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${env.RAILWAY_API_KEY}\`
      },
      body: JSON.stringify({ agentId, context })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理反馈请求
async function handleFeedback(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();

    // 这里应该调用Supabase
    const apiUrl = env.SUPABASE_URL;
    const response = await fetch(\`\${apiUrl}/rest/v1/feedback\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_KEY,
        'Authorization': \`Bearer \${env.SUPABASE_KEY}\`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
    `;

    const workerPath = path.join(workersDir, 'index.js');
    fs.writeFileSync(workerPath, workerCode);
    console.log('   ✅ workers/index.js已创建');
  }

  /**
   * 生成部署报告
   */
  generateDeploymentReport() {
    return {
      timestamp: new Date().toISOString(),
      checklist: this.checklist,
      summary: {
        total: this.checklist.length,
        pending: this.checklist.filter(c => c.status === 'pending').length,
        completed: this.checklist.filter(c => c.status === 'completed').length
      },
      nextSteps: [
        '1. 按照checklist完成各服务部署',
        '2. 配置环境变量和API密钥',
        '3. 测试各服务连接',
        '4. 配置域名和DNS',
        '5. 设置监控和告警'
      ],
      estimatedTime: '2-3小时',
      estimatedCost: '$0/月（小规模使用）'
    };
  }

  /**
   * 保存部署报告
   */
  async saveDeploymentReport(report) {
    const reportPath = path.join(__dirname, '..', '.deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n   📄 部署报告已保存: ${reportPath}`);
  }

  /**
   * 加载部署配置
   */
  loadDeployConfig() {
    const configPath = path.join(__dirname, '..', '.deploy-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
  }

  /**
   * 显示部署指南
   */
  showDeploymentGuide() {
    console.log('\n📚 云端部署指南\n');
    console.log('═════════════════════════════════════════════════════\n');

    const services = [
      {
        name: 'Vercel (官方网站)',
        url: 'https://vercel.com/new',
        cost: '$0/月',
        difficulty: '简单',
        estimatedTime: '10分钟'
      },
      {
        name: 'Supabase (数据库)',
        url: 'https://supabase.com',
        cost: '$0/月',
        difficulty: '中等',
        estimatedTime: '20分钟'
      },
      {
        name: 'Railway (推荐API)',
        url: 'https://railway.app/new',
        cost: '$0-5/月',
        difficulty: '中等',
        estimatedTime: '15分钟'
      },
      {
        name: 'Cloudflare (CDN+Workers)',
        url: 'https://dash.cloudflare.com',
        cost: '$0/月',
        difficulty: '简单',
        estimatedTime: '15分钟'
      }
    ];

    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name}`);
      console.log(`   URL: ${service.url}`);
      console.log(`   成本: ${service.cost}`);
      console.log(`   难度: ${service.difficulty}`);
      console.log(`   预计时间: ${service.estimatedTime}`);
      console.log('');
    });

    console.log('═════════════════════════════════════════════════════');
    console.log('💡 提示: 可以按任意顺序部署，各服务独立');
    console.log('💡 提示: 总部署时间约1小时');
    console.log('💡 提示: 完全免费，小规模使用无需付费\n');
  }
}

// ==================== 命令行接口 ====================

if (require.main === module) {
  const orchestrator = new CloudDeploymentOrchestrator();

  const args = process.argv.slice(2);
  const command = args[0] || 'guide';

  switch (command) {
    case 'deploy':
      orchestrator.deploy({
        services: args.slice(1)
      }).then(report => {
        console.log('\n✅ 部署流程完成！');
        console.log(`\n待完成任务: ${report.summary.pending}`);
        console.log('📄 详细报告已保存到: .deployment-report.json');
        process.exit(0);
      }).catch(error => {
        console.error('\n❌ 部署失败:', error.message);
        process.exit(1);
      });
      break;

    case 'guide':
      orchestrator.showDeploymentGuide();
      process.exit(0);
      break;

    default:
      console.log('用法:');
      console.log('  node deploy-cloud.js deploy [services...]  - 执行部署');
      console.log('  node deploy-cloud.js guide              - 显示部署指南');
      console.log('\n可用服务:');
      console.log('  - vercel');
      console.log('  - supabase');
      console.log('  - railway');
      console.log('  - cloudflare');
      console.log('  - all (部署所有服务)');
      process.exit(1);
  }
}

module.exports = CloudDeploymentOrchestrator;
