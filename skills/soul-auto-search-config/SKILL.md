---
name: soul-auto-search-config
description: 自主搜索引擎配置技能 - 自动检测、申请和配置搜索API Keys
author: stigmergy soul-evolve
version: 1.0.0
trigger: auto search config|自动搜索配置|configure search|搜索引擎自动配置
---

# Soul Auto Search Config

自主搜索引擎配置技能 - 让 AI CLI 能够自动检测、申请和配置搜索服务 API Keys，无需用户手动操作。

## When to Use

当需要配置搜索服务时自动使用：

- "配置搜索引擎"
- "自动设置搜索 API"
- "启用搜索功能"
- 检测到搜索需求但未配置时自动触发

## How It Works

**重要**: 此技能使用**本CLI自己的LLM能力**和**外部交互能力**进行自主配置，完全自动化流程。

### 自动配置流程

1. **检测当前状态** - 检查哪些搜索服务已配置，哪些缺失
2. **评估最优方案** - 根据用户环境和需求选择最佳搜索服务
3. **自动申请 Keys** - 通过 API 或自动化流程获取 API Keys
4. **配置集成** - 自动更新配置文件
5. **验证可用性** - 测试配置是否正常工作

### 支持的搜索服务

#### 免费服务（优先推荐）

**1. Tavily Search** (推荐)
```yaml
优势:
  - 专为 AI 设计
  - 每月 1,000 次免费查询
  - 无需信用卡
  - 简单易用

自动申请:
  - Email 注册
  - 自动验证邮箱
  - 获取 API Key
  - 配置到系统
```

**2. DuckDuckGo** (无需 Key)
```yaml
优势:
  - 完全免费
  - 无需 API Key
  - 隐私保护
  - 即用即得

配置: 直接启用，无需申请
```

**3. Wikipedia API** (补充)
```yaml
优势:
  - 完全免费
  - 高质量知识
  - 无需认证
  - 结构化数据

配置: 直接启用
```

#### 付费服务（有免费额度）

**4. Perplexity AI**
```yaml
免费额度:
  - 每月 5 次搜索
  - 需要邮箱注册

自动申请流程:
  1. 创建账户
  2. 验证邮箱
  3. 获取 API Key
  4. 配置到系统
```

**5. Bing Search API**
```yaml
免费额度:
  - 每月 1,000 次查询
  - 需要 Azure 账户

自动申请流程:
  1. 创建 Azure 账户
  2. 启用 Bing Search
  3. 获取 API Key
  4. 配置到系统
```

**6. Google Custom Search**
```yaml
免费额度:
  - 每天 100 次查询
  - 需要 Google Cloud 项目

自动申请流程:
  1. 创建 Google Cloud 项目
  2. 启用 Custom Search API
  3. 创建搜索引擎
  4. 获取 API Key
  5. 配置到系统
```

### 具体执行步骤

**步骤1: 检测当前配置状态**
```javascript
// 伪代码示例
detectSearchConfig() {
  const config = loadStigmergyConfig();
  const available = [];

  // 检查 MCP 配置
  if (hasMCPConfig('perplexity')) available.push('perplexity');
  if (hasMCPConfig('tavily')) available.push('tavily');
  if (hasMCPConfig('brave')) available.push('brave');

  // 检查环境变量
  if (process.env.TAVILY_API_KEY) available.push('tavily');
  if (process.env.BING_API_KEY) available.push('bing');
  if (process.env.GOOGLE_API_KEY) available.push('google');

  return {
    available,
    missing: ALL_SEARCH_SERVICES.filter(s => !available.includes(s))
  };
}
```

**步骤2: 评估最优方案**
```javascript
recommendSearchService(userContext) {
  const recommendations = [];

  // 优先推荐免费且易用的
  if (!userContext.hasPaymentMethod) {
    recommendations.push({
      service: 'tavily',
      priority: 1,
      reason: '每月1000次免费，专为AI设计，无需信用卡'
    });
  }

  // 如果需要更多搜索量
  if (userContext.needsHighVolume) {
    recommendations.push({
      service: 'bing',
      priority: 2,
      reason: '每月1000次免费，企业级质量'
    });
  }

  // 作为补充
  recommendations.push({
    service: 'duckduckgo',
    priority: 3,
    reason: '完全免费，无需API Key，即时可用'
  });

  return recommendations;
}
```

**步骤3: 自动申请 API Keys**

**Tavily 自动申请** (伪代码):
```javascript
async autoConfigureTavily() {
  console.log('🔧 自动配置 Tavily Search...');

  // 1. 检查是否已有 Key
  if (process.env.TAVILY_API_KEY) {
    console.log('✅ Tavily API Key 已存在');
    return true;
  }

  // 2. 引导用户快速注册
  console.log('📝 需要注册 Tavily API Key');
  console.log('🌐 注册地址: https://api.tavily.com');
  console.log('📧 请使用您的邮箱注册（只需30秒）');

  // 3. 生成配置模板
  const configTemplate = generateMCPConfig('tavily', {
    apiKey: 'YOUR_TAVILY_API_KEY',
    envVar: 'TAVILY_API_KEY'
  });

  // 4. 保存到待配置列表
  savePendingConfig('tavily', configTemplate);

  // 5. 提供快速设置命令
  console.log('⚡ 快速设置命令:');
  console.log('export TAVILY_API_KEY="your-key-here"');
  console.log('stigmergy search configure tavily');

  return false; // 等待用户输入
}
```

**DuckDuckGo 即时配置** (无需 Key):
```javascript
async autoConfigureDuckDuckGo() {
  console.log('🔧 配置 DuckDuckGo Search...');

  // DuckDuckGo 不需要 API Key
  const mcpConfig = {
    name: 'duckduckgo',
    type: 'search',
    enabled: true,
    config: {
      noAuthRequired: true,
      baseUrl: 'https://api.duckduckgo.com/'
    }
  };

  // 直接配置
  await updateMCPConfig(mcpConfig);
  console.log('✅ DuckDuckGo Search 已启用（无需API Key）');

  return true;
}
```

**步骤4: 配置集成**
```javascript
async integrateSearchService(serviceName, config) {
  const stigmergyConfig = loadStigmergyConfig();

  // 更新 MCP 配置
  stigmergyConfig.mcp.servers[serviceName] = config;

  // 更新环境变量
  if (config.envVar && config.apiKey) {
    await updateEnvironmentVariable(config.envVar, config.apiKey);
  }

  // 保存配置
  await saveStigmergyConfig(stigmergyConfig);

  console.log(`✅ ${serviceName} 已集成到 Stigmergy`);
}
```

**步骤5: 验证可用性**
```javascript
async verifySearchService(serviceName) {
  try {
    // 测试搜索
    const testQuery = 'test query';
    const results = await performSearch(serviceName, testQuery);

    if (results && results.length > 0) {
      console.log(`✅ ${serviceName} 配置验证成功`);
      return true;
    } else {
      console.log(`⚠️ ${serviceName} 配置可能有问题`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${serviceName} 验证失败: ${error.message}`);
    return false;
  }
}
```

### 智能配置策略

**策略1: 渐进式配置**
```yaml
顺序:
  1. DuckDuckGo (即时可用，无需Key)
  2. Tavily (需注册，但免费额度大)
  3. Wikipedia (知识补充，无需Key)
  4. Perplexity (高质量，需注册)
  5. Bing/Google (备用，需复杂配置)

好处:
  - 立即可用（DuckDuckGo）
  - 逐步增强（Tavily）
  - 知识补充（Wikipedia）
  - 高质量搜索（Perplexity/Bing）
```

**策略2: 多源冗余**
```yaml
配置多个搜索源:
  主要: Tavily (AI优化，大免费额度)
  备用1: DuckDuckGo (无需Key，可靠)
  备用2: Wikipedia (高质量知识)
  备用3: Perplexity (高质量AI搜索)

好处:
  - 不会单点故障
  - 不同源互补
  - 自动故障转移
```

**策略3: 成本优化**
```yaml
优先级排序:
  1. 完全免费: DuckDuckGo, Wikipedia
  2. 大免费额度: Tavily (1000/月)
  3. 中等额度: Bing (1000/月), Perplexity (5/月)
  4. 小额度: Google (100/天)

使用策略:
  - 优先使用免费服务
  - 额度用尽后自动切换
  - 重要查询用高质量服务
  - 批量查询用免费服务
```

## 输出格式

执行自动配置时，请按以下格式输出：

```
🔍 [Soul Auto Search Config] 开始自动配置搜索引擎

📊 [1/5] 检测当前状态...
   已配置: {已配置的服务列表}
   未配置: {缺失的服务列表}
   推荐配置: {推荐的服务及理由}

🎯 [2/5] 选择最优方案...
   主要搜索引擎: Tavily (每月1000次免费)
   备用搜索引擎: DuckDuckGo (无需API Key)
   知识库: Wikipedia (高质量知识)

🔧 [3/5] 自动申请和配置...
   ✅ DuckDuckGo: 已启用（无需API Key）
   📝 Tavily: 需要注册（30秒完成）
      注册地址: https://api.tavily.com
      快速命令: export TAVILY_API_KEY="your-key"

📦 [4/5] 集成到系统...
   ✅ 配置文件已更新
   ✅ 环境变量已设置
   ✅ MCP 服务器已注册

🧪 [5/5] 验证可用性...
   ✅ DuckDuckGo: 工作正常
   ⏳ Tavily: 等待API Key输入

✅ 自动配置完成！
   即时可用: DuckDuckGo, Wikipedia
   待激活: Tavily (需要API Key)

💡 下一步:
   1. 注册 Tavily: https://api.tavily.com
   2. 设置 Key: export TAVILY_API_KEY="xxx"
   3. 测试搜索: stigmergy search test
```

## Storage Locations

配置文件位置：

```bash
# Stigmergy 配置
~/.stigmergy/config/search-services.json
{
  "enabled": ["tavily", "duckduckgo", "wikipedia"],
  "config": {
    "tavily": {
      "apiKey": "xxx",
      "priority": 1
    },
    "duckduckgo": {
      "enabled": true,
      "priority": 2
    }
  }
}

# 待配置任务
~/.stigmergy/soul-state/pending-configs/
└── search-services.json

# 配置日志
~/.stigmergy/soul-state/config-log/
└── {timestamp}-search-config.json
```

## Configuration

环境变量（自动设置）：

```bash
# Tavily Search (推荐)
export TAVILY_API_KEY="tvly-xxxxxxxxxxxxx"

# Bing Search API
export BING_SEARCH_API_KEY="xxxxxxxxxxxxx"

# Google Custom Search
export GOOGLE_API_KEY="xxxxxxxxxxxxx"
export GOOGLE_CSE_ID="xxxxxxxxxxxxx"

# Perplexity AI
export PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxxx"
```

## Important Notes

1. **完全自动化** - 尽可能减少用户操作
2. **渐进式配置** - 先用免费服务，逐步增强
3. **多源冗余** - 配置多个搜索源避免单点故障
4. **成本优化** - 优先使用免费和大额度服务
5. **即时可用** - DuckDuckGo 等无需 Key 的服务立即可用
6. **安全存储** - API Keys 加密存储

## Example Usage

在 Claude CLI 中：
```
claude "自动配置搜索引擎"
```

在 Qwen CLI 中：
```
qwen "配置搜索API"
```

在 Gemini CLI 中：
```
gemini "auto configure search engines"
```

## Continuous Improvement

- **自动更新**: 检测新的免费搜索服务
- **性能监控**: 跟踪各搜索服务的质量
- **智能切换**: 根据查询类型选择最佳搜索源
- **额度管理**: 监控免费额度使用情况
- **故障转移**: 自动切换到备用搜索服务
