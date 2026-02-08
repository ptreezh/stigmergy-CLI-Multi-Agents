# 网页内容修订指南

## 📋 修订总结

**修订日期**: 2026-01-27
**对应版本**: stigmergy v1.3.77-beta.0
**修订文件**: index_revised.html

---

## 🔄 主要修订内容

### 1️⃣ **标题和版本信息**

**原内容**:
```html
<h1>Stigmergy AI 协作平台</h1>
```

**修订为**:
```html
<h1>Stigmergy AI 协作平台 <span class="update-badge">v1.3.77-beta.0</span></h1>
```

**说明**: 添加版本标识，让用户知道当前文档对应的具体版本

---

### 2️⃣ **核心功能部分**

#### 新增：v1.3.77-beta.0 新功能

```html
<div class="feature-highlight">
    <h3>🆕 v1.3.77-beta.0 新功能</h3>
    <ul>
        <li><strong>📊 项目状态看板</strong> - 持久化状态管理，跨会话自动协同</li>
        <li><strong>🔄 交互模式</strong> - 实时切换AI工具，状态可视化</li>
        <li><strong>⚡ 并发模式</strong> - 多个AI工具同时工作，效率提升3倍</li>
        <li><strong>🤖 iflow专业资源</strong> - 自动部署49个agents和skills</li>
        <li><strong>🔌 Superpowers插件</strong> - Hooks系统、上下文自动注入</li>
    </ul>
</div>
```

**新增功能卡片**:
- 📊 项目状态看板
- 🔄 交互模式
- ⚡ 并发模式

---

### 3️⃣ **使用流程部分**

#### 原内容（只有一种模式）:
```html
<h3>使用流程</h3>
<div>
    <span>1</span>
    <h4>一键安装</h4>
    <code>npm install -g stigmergy</code>
</div>
<div>→</div>
<div>
    <span>2</span>
    <h4>配置工具</h4>
    <code>stigmergy setup</code>
</div>
<div>→</div>
<div>
    <span>3</span>
    <h4>开始协作</h4>
    <code>stigmergy "任务描述"</code>
</div>
```

#### 修订为（四种模式）:

**模式一：快速智能路由**（保持原有，添加beta版本说明）
```html
<h3>模式一：快速智能路由</h3>
<code>npm install -g stigmergy@beta</code>
```

**模式二：交互模式**（全新）
```html
<h3>模式二：交互模式 🆕 NEW</h3>
<div>
    <span>1</span>
    <h4>启动交互模式</h4>
    <code>stigmergy interactive</code>
</div>
<div>→</div>
<div>
    <span>2</span>
    <h4>查看状态</h4>
    <code>> status</code>
</div>
<div>→</div>
<div>
    <span>3</span>
    <h4>切换工具</h4>
    <code>> use qwen</code>
</div>
```

**模式三：并发协作**（全新）
```html
<h3>模式三：并发协作 🆕 NEW</h3>
<code>stigmergy concurrent "分析代码性能" -c 3</code>
```

**模式四：跨会话项目协同**（全新）
```html
<h3>模式四：跨会话项目协同 🆕 NEW</h3>
<pre><code>cd /path/to/project
stigmergy interactive
> status
> use claude
> 设计数据库架构
> exit

# 新会话自动获取上下文
stigmergy interactive
> status
> use qwen
> 根据架构生成ORM模型</code></pre>
```

---

### 4️⃣ **安装命令更新**

**原内容**:
```html
<code>npm install -g stigmergy</code>
```

**修订为**:
```html
<code>npm install -g stigmergy@beta</code>
```

**说明**: 明确使用beta标签获取最新功能

**新增Beta版本功能说明**:
```html
<div class="feature-highlight">
    <h4>🎉 Beta版本新功能</h4>
    <p>安装后自动获得：</p>
    <ul>
        <li>✅ 49个iflow专业agents和skills</li>
        <li>✅ 项目状态看板（跨会话协同）</li>
        <li>✅ 交互模式（持续会话）</li>
        <li>✅ 并发协作（多CLI同时工作）</li>
        <li>✅ Superpowers插件系统</li>
    </ul>
</div>
```

---

### 5️⃣ **使用指南部分**

#### 原内容（三种方式）:
```html
<h3>🤝 协同使用示范</h3>
<h4>方式一：CLI内部跨工具调用</h4>
<h4>方式二：Stigmergy智能路由</h4>
<h4>方式三：共享项目背景协作</h4>
```

#### 修订为（六种方式）:
```html
<h3>🎯 四种使用模式</h3>
<h4>模式1: 智能路由（推荐新手）</h4>
<h4>模式2: 交互模式 🆕 推荐</h4>
<h4>模式3: 并发协作 🆕 高效</h4>
<h4>模式4: 项目状态看板协同 🆕 最新</h4>

<h3>🤝 协同使用示范</h3>
<h4>方式一：CLI内部跨工具调用</h4>
<h4>方式二：Stigmergy智能路由</h4>
<h4>方式三：共享项目背景协作 🆕 增强</h4>
<h4>方式四：自动部署专业资源 🆕 NEW</h4>
```

---

### 6️⃣ **新增：项目状态看板详解**

**全新章节**:
```html
<h3>🆕 项目状态看板详解</h3>
<div class="feature-highlight">
    <h4>核心特性</h4>
    <ul>
        <li><strong>持久化存储</strong> - .stigmergy/status/PROJECT_STATUS.md</li>
        <li><strong>跨会话协同</strong> - 自动共享上下文</li>
        <li><strong>目录隔离</strong> - 每个项目独立</li>
        <li><strong>自动注入</strong> - 任务执行时自动注入</li>
        <li><strong>Markdown格式</strong> - Git友好</li>
    </ul>
</div>

<h4>状态看板内容示例</h4>
<pre><code>## 项目信息
- 名称: my-project
- 会话ID: session-abc123

## 任务队列
- [ ] 实现用户认证
- [x] 设计数据库架构

## 关键发现
- **design** [claude]: 使用微服务架构
- **performance** [qwen]: 需要添加缓存层

## 协作历史
- 📋 [claude] 设计数据库架构 (10:00)
- 🎯 [qwen] 生成ORM模型 (10:05)</code></pre>
```

---

### 7️⃣ **新增：版本说明章节**

**全新章节**:
```html
<h3>🆕 版本说明</h3>
<div class="feature-highlight">
    <h4>v1.3.77-beta.0 (2026-01-27)</h4>
    <p>重大更新：</p>
    <ul>
        <li>✅ 新增项目状态看板系统</li>
        <li>✅ 新增交互模式</li>
        <li>✅ 新增并发协作模式</li>
        <li>✅ 自动部署49个iflow专业资源</li>
        <li>✅ Superpowers插件系统集成</li>
        <li>✅ 修复npm包包含所有技能文件</li>
        <li>✅ 完整文档和使用指南</li>
    </ul>
</div>
```

---

### 8️⃣ **样式更新**

**新增CSS类**:
```css
.new-feature {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    margin-left: 8px;
}

.feature-highlight {
    background: #f0f9ff;
    border-left: 4px solid #3b82f6;
    padding: 16px;
    margin: 16px 0;
}

.update-badge {
    background: #10b981;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: bold;
}
```

**用途**:
- `.new-feature` - 标记新功能
- `.feature-highlight` - 高亮重要功能区块
- `.update-badge` - 版本标识徽章

---

## 📊 修订对比表

| 章节 | 原内容 | 修订后 | 变更类型 |
|------|--------|--------|----------|
| **标题** | 无版本号 | v1.3.77-beta.0 | 🆕 添加 |
| **核心功能** | 3个功能 | 8个功能 | ➕ 新增5个 |
| **使用流程** | 1种模式 | 4种模式 | ➕ 新增3种 |
| **安装命令** | stigmergy | stigmergy@beta | 🔄 更新 |
| **Beta功能说明** | 无 | 详细列表 | 🆕 添加 |
| **使用模式** | 3种方式 | 6种方式 | ➕ 新增3种 |
| **状态看板** | 无 | 完整章节 | 🆕 添加 |
| **版本说明** | 无 | 详细更新日志 | 🆕 添加 |
| **样式** | 基础样式 | 新增3个CSS类 | ➕ 增强 |

---

## 🎯 关键改进点

### 1️⃣ **清晰度提升**
- ✅ 明确标注版本号
- ✅ 新功能有明显的NEW标识
- ✅ 功能区块有视觉高亮

### 2️⃣ **完整性提升**
- ✅ 覆盖所有4种使用模式
- ✅ 详细的使用示例
- ✅ 完整的版本更新说明

### 3️⃣ **实用性提升**
- ✅ 具体的命令示例
- ✅ 实际的输出展示
- ✅ 清晰的操作步骤

### 4️⃣ **可发现性提升**
- ✅ 新功能突出显示
- ✅ 分类清晰（快速路由/交互/并发/协同）
- ✅ 推荐模式标注

---

## 🔗 保持不变的内容

### ✅ 所有链接保持原样
- 导航链接 - 未修改
- GitHub链接 - 未修改
- 文档链接 - 未修改
- 安装指南链接 - 未修改

### ✅ 基础功能描述
- AI工具协作 - 保持原有描述
- 自然语言指挥 - 保持原有描述
- 支持的工具列表 - 保持不变

### ✅ 页面结构
- 导航栏 - 保持不变
- 页脚 - 保持不变
- 整体布局 - 保持不变

---

## 📝 使用建议

### 1️⃣ **直接替换**
```bash
# 备份原文件
cp index.html index.html.backup

# 使用修订版
cp index_revised.html index.html
```

### 2️⃣ **测试验证**
- 在浏览器中打开index_revised.html
- 检查所有链接是否正常
- 验证命令示例是否清晰
- 确认新功能突出显示

### 3️⃣ **后续维护**
- 每次发布新版本时更新版本号
- 添加新功能时更新对应章节
- 保持与实际功能同步

---

## 🎉 总结

### 修订成果
- ✅ 添加了所有v1.3.77-beta.0的新功能
- ✅ 完善了4种使用模式的说明
- ✅ 增加了交互模式和并发模式的详细示例
- ✅ 添加了项目状态看板的完整介绍
- ✅ 保持了所有原有链接不变
- ✅ 提升了文档的完整性和实用性

### 用户价值
- ✅ 更容易了解新功能
- ✅ 更清楚如何使用不同模式
- ✅ 更好的使用体验和文档支持

---

**修订完成日期**: 2026-01-27
**对应版本**: stigmergy v1.3.77-beta.0
**修订文件**: index_revised.html
