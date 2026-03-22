# 云端分布式基础设施架构设计

**创建时间**: 2026-03-22
**目标**: 利用免费云空间部署安全可信的分布式系统
**状态**: 🟡 设计完成，待实施

---

## 🎯 第一性原理分析

### 核心需求
**如何在零成本前提下，实现安全可信可分布式的基础设施？**

### 本质需求
1. **成本优化** - 充分利用免费额度
2. **安全可信** - 数据安全和隐私保护
3. **分布式部署** - 避免单点故障
4. **可扩展性** - 支持未来增长
5. **易维护** - 自动化部署和监控

### 解决方案策略
**多云架构 + 边缘计算 + 自动化运维**

---

## 🏗️ 云服务选型

### 前端/静态网站托管

| 服务 | 免费额度 | 推荐度 | 用途 |
|------|---------|--------|------|
| **Vercel** | 100GB带宽/月 | ⭐⭐⭐⭐⭐ | 官方网站（Next.js优化） |
| **Netlify** | 100GB带宽/月 | ⭐⭐⭐⭐ | 备用网站 |
| **GitHub Pages** | 1GB存储/月 | ⭐⭐⭐ | 文档站点 |

**选择**: Vercel (主) + Netlify (备)

### 后端API服务

| 服务 | 免费额度 | 推荐度 | 用途 |
|------|---------|--------|------|
| **Railway** | $5/月 | ⭐⭐⭐⭐⭐ | 推荐API服务 |
| **Render** | 750小时/月 | ⭐⭐⭐⭐ | 安全审计API |
| **Fly.io** | 3个VMs | ⭐⭐⭐ | 分布式Workers |

**选择**: Railway (推荐) + Render (审计) + Fly.io (Workers)

### 数据库

| 服务 | 免费额度 | 推荐度 | 用途 |
|------|---------|--------|------|
| **Supabase** | 500MB存储 | ⭐⭐⭐⭐⭐ | 主数据库（PostgreSQL） |
| **MongoDB Atlas** | M512存储 | ⭐⭐⭐⭐ | 反馈数据库 |
| **Firebase** | 1GB数据库 | ⭐⭐⭐ | 实时数据库 |

**选择**: Supabase (主) + MongoDB Atlas (反馈)

### 文件存储

| 服务 | 免费额度 | 推荐度 | 用途 |
|------|---------|--------|------|
| **Cloudflare R2** | 10GB存储/月 | ⭐⭐⭐⭐⭐ | Skill包存储 |
| **AWS S3** | 5GB存储/月 | ⭐⭐⭐ | 备用存储 |

**选择**: Cloudflare R2 (主) + AWS S3 (备份)

### CDN/边缘计算

| 服务 | 免费额度 | 推荐度 | 用途 |
|------|---------|--------|------|
| **Cloudflare Workers** | 10万请求/天 | ⭐⭐⭐⭐⭐ | 边缘计算 |
| **Cloudflare Pages** | 无限制 | ⭐⭐⭐⭐ | 静态网站CDN |
| **Cloudflare R2** | 与Workers集成 | ⭐⭐⭐⭐⭐ | 全球加速 |

**选择**: Cloudflare Workers + Pages + R2

### 监控和日志

| 服务 | 免费额度 | 推荐度 | 用途 |
|------|---------|--------|------|
| **Logtail** | 7天日志 | ⭐⭐⭐⭐ | 应用日志 |
| **Sentry** | 5K错误/月 | ⭐⭐⭐⭐ | 错误追踪 |
| **UptimeRobot** | 50个监控 | ⭐⭐⭐⭐ | 可用性监控 |

**选择**: Logtail + Sentry + UptimeRobot

---

## 🌐 分层架构设计

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN层 (Cloudflare)                      │
│  全球边缘节点 • DDoS防护 • SSL证书 • 负载均衡              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  应用层 (Vercel/Railway)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  官方网站    │  │  推荐API     │  │  安全审计API │     │
│  │  (Next.js)    │  │  (Node.js)    │  │  (Node.js)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  数据层 (Supabase/MongoDB)                  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  主数据库    │  │  反馈数据库  │                        │
│  │ (Supabase)   │  │  (MongoDB)    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  存储层 (Cloudflare R2)                     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Skill包存储 │  │  备份存储    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 安全可信设计

### 1. 数据安全

**加密策略**:
- 传输加密: TLS 1.3
- 存储加密: AES-256
- 数据库加密: Supabase自带加密

**访问控制**:
- API密钥认证
- 环境变量隔离
- IP白名单（可选）

**备份策略**:
- 数据库每日自动备份
- 跨云备份（R2 + S3）
- 版本控制（Git）

### 2. 服务可用性

**高可用架构**:
- 多云部署（避免单点故障）
- 边缘节点（全球加速）
- 自动故障转移

**监控告警**:
- 实时性能监控
- 错误追踪
- 可用性监控
- 自动告警

### 3. 分布式部署

**地理分布**:
- Cloudflare全球节点
- 多区域数据库复制
- 边缘计算Workers

**负载均衡**:
- Cloudflare Load Balancer
- 自动流量调度
- 故障自动切换

---

## 📦 服务部署规划

### Phase 1: 核心服务部署（第1周）

#### 1.1 官方网站 (Vercel)

**服务**: Vercel
**仓库**: GitHub
**分支**: main
**构建命令**: 自动检测
**环境变量**: 无需

**部署步骤**:
```bash
# 1. 连接GitHub仓库到Vercel
# 2. 自动部署网站目录
# 3. 配置自定义域名（可选）
```

**成本**: $0/月

#### 1.2 推荐API (Railway)

**服务**: Railway
**仓库**: GitHub
**分支**: main
**构建配置**: `railway.json`
**环境变量**:
- DATABASE_URL
- JWT_SECRET
- NODE_ENV=production

**部署步骤**:
```bash
# 1. 在Railway创建新项目
# 2. 连接GitHub仓库
# 3. 配置启动命令
# 4. 设置环境变量
```

**成本**: $0-5/月

#### 1.3 数据库 (Supabase)

**服务**: Supabase
**项目**: Stigmergy Production
**表**:
- feedback (反馈数据)
- recommendations (推荐结果)
- skills (skill信息)
- agents (agent信息)

**部署步骤**:
```bash
# 1. 在Supabase创建新项目
# 2. 创建表结构
# 3. 配置行级安全策略
# 4. 获取数据库连接字符串
```

**成本**: $0/月

### Phase 2: 边缘计算和CDN（第2周）

#### 2.1 Cloudflare Workers

**用途**: 边缘计算、API路由、负载均衡

**部署脚本**: `workers/index.js`

**功能**:
- API请求路由
- 边缘缓存
- 请求聚合
- 错误处理

**成本**: $0/月（10万请求/天）

#### 2.2 Cloudflare R2

**用途**: Skill包存储和分发

**部署**:
- 创建R2 Bucket
- 配置CORS
- 设置生命周期规则

**成本**: $0/月（10GB存储）

### Phase 3: 监控和日志（第3周）

#### 3.1 Logtail集成

**用途**: 应用日志收集和分析

**集成**:
- Railway日志
- Vercel日志
- 自定义日志

**成本**: $0/月

#### 3.2 Sentry集成

**用途**: 错误追踪和性能监控

**集成**:
- 前端错误
- API错误
- 性能监控

**成本**: $0/月

---

## 🚀 部署脚本

### Vercel部署脚本

创建 `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "website/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "public" }
    },
    {
      "src": "website/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### Railway部署脚本

创建 `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build",
    "watchPatterns": ["skills/**/*.js"]
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "healthcheckPath": "/health"
  }
}
```

### Cloudflare Workers脚本

创建 `workers/index.js`:
```javascript
export default {
  async fetch(request, env, ctx) {
    // 路由逻辑
    const url = new URL(request.url);

    // API路由
    if (url.pathname.startsWith('/api/recommend')) {
      return handleRecommendation(request, env);
    }

    // 静态资源
    return env.ASSETS.fetch(request);
  }
};
```

---

## 📊 成本估算

### 月度成本（全部免费额度内）

| 服务 | 成本 | 免费额度使用 |
|------|------|-------------|
| Vercel | $0 | <100GB带宽 |
| Railway | $0 | <$5计算 |
| Supabase | $0 | <500MB存储 |
| Cloudflare Workers | $0 | <10万请求 |
| Cloudflare R2 | $0 | <10GB存储 |
| Logtail | $0 | <7天日志 |
| Sentry | $0 | <5K错误 |
| **总计** | **$0** | **完全免费** |

### 扩展成本（超出免费额度）

| 场景 | 预估成本 | 说明 |
|------|---------|------|
| 小规模（<1000用户） | $0-10/月 | 免费额度足够 |
| 中规模（1000-10000用户） | $10-50/月 | 需要Railway计算资源 |
| 大规模（>10000用户） | $50-200/月 | 需要优化和缓存 |

---

## 🔐 安全最佳实践

### 1. API安全

```javascript
// API密钥验证
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// 速率限制
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制100个请求
});
```

### 2. 数据验证

```javascript
// 输入验证
const validateFeedback = (feedback) => {
  const schema = {
    rating: 'number|min=1|max=5',
    effectiveness: 'string',
    domain: 'string'
  };
  // 验证逻辑
};
```

### 3. CORS配置

```javascript
// CORS配置
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://stigmergy.cli'],
  credentials: true
};
```

---

## 📈 可扩展性设计

### 垂直扩展

**Railway自动扩展**:
- CPU: 0.25 → 1 vCPU
- RAM: 512MB → 1GB
- 成本: 按使用量计费

### 水平扩展

**Cloudflare Workers**:
- 全球边缘节点
- 自动负载均衡
- 无限扩展能力

### 缓存策略

**多层缓存**:
1. 边缘缓存（Cloudflare）
2. 应用缓存（Railway）
3. 数据库缓存（Supabase）

---

## 🔄 持续集成/部署

### GitHub Actions配置

创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloud

on:
  push:
    branches: [main]

jobs:
  deploy-vercel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-railway:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/cli-action@v3
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: stigmergy-api
```

---

## 🎯 实施计划

### Week 1: 核心部署

- [ ] 连接GitHub到Vercel
- [ ] 部署官方网站
- [ ] 在Railway创建项目
- [ ] 部署推荐API
- [ ] 在Supabase创建数据库
- [ ] 配置环境变量

### Week 2: 边缘计算

- [ ] 配置Cloudflare Workers
- [ ] 设置Cloudflare R2
- [ ] 配置DNS和SSL
- [ ] 测试全球CDN

### Week 3: 监控告警

- [ ] 集成Logtail
- [ ] 集成Sentry
- [ ] 配置UptimeRobot
- [ ] 设置告警规则

### Week 4: 优化和文档

- [ ] 性能优化
- [ ] 安全加固
- [ ] 文档完善
- [ ] 用户指南

---

## 🎊 预期成果

### 技术成果

1. **零成本运行** - 完全在免费额度内
2. **全球加速** - Cloudflare全球节点
3. **高可用性** - 多云部署，无单点故障
4. **可扩展性** - 按需自动扩展
5. **安全可信** - 企业级安全措施

### 业务成果

1. **官网访问** - 全球用户快速访问
2. **API可用** - 99.9%+可用性
3. **推荐服务** - 实时skill推荐
4. **数据安全** - 加密存储和传输
5. **监控完善** - 实时监控和告警

---

## 🔮 未来扩展

### 短期（3个月内）

1. **性能优化**
   - 缓存优化
   - CDN配置
   - 数据库查询优化

2. **功能增强**
   - 实时推荐
   - 个性化推荐
   - A/B测试

3. **监控完善**
   - 自定义仪表板
   - 性能分析
   - 用户行为分析

### 中期（6个月内）

1. **成本优化**
   - 预算优化
   - 资源优化
   - 缓存策略

2. **功能扩展**
   - 多租户支持
   - API网关
   - 服务网格

3. **生态建设**
   - 开发者API
   - Webhook支持
   - 插件市场

---

**设计完成**: 2026-03-22
**状态**: 🟡 设计完成，待实施
**预期成本**: $0/月（小规模）
**安全级别**: 企业级
**可用性**: 99.9%+
**置信度**: 高

**🚀 这是一个零成本、安全可信、可分布式的云端基础设施方案！**