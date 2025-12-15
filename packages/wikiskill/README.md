# Wiki协同技能

基于TiddlyWiki的智能协同编辑系统，完全嵌入CLI生态系统。

## 🎯 特性

- **完全本地化**：基于单页HTML文件，无需服务器
- **多主题管理**：每个专业领域独立Wiki
- **智能协同**：自主查找词条、设置角色、学习知识
- **CLI集成**：继承CLI的LLM、搜索、下载等能力
- **跨CLI兼容**：支持所有Stigmergy生态CLI工具

## 📦 安装

```bash
npm install @stigmergy/wikiskill
```

## 🚀 快速开始

### 初始化Wiki

```bash
# 在当前项目初始化Wiki
npx wikiskill init

# 或通过CLI调用
stigmergy wiki init
```

### 使用技能

```bash
# 智能编辑词条
stigmergy call wikiskill "参与机器学习词条编辑"

# 创建新主题
claude> wikiskill "创建AI伦理主题" --new-topic

# 查看Wiki
stigmergy wiki open --topic machine-learning
```

## 📁 目录结构

```
.wiki/
├── topics/                   # 主题文件
│   ├── machine-learning.html
│   └── ai-ethics.html
├── config/                   # 配置文件
│   └── wiki-config.json
└── assets/                   # 静态资源
    └── tiddlywiki.js
```

## 🔧 API文档

### WikiCollaborativeSkill

主要的协同编辑技能类。

```javascript
const skill = new WikiCollaborativeSkill(cliContext);
const result = await skill.executeWikiTask(taskDescription);
```

### MultiTopicWikiManager

多主题Wiki管理器。

```javascript
const manager = new MultiTopicWikiManager(cliContext);
const topics = await manager.listTopics();
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT