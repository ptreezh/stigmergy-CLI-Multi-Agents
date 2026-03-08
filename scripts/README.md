# Stigmergy 实用配置脚本

**版本**: 1.0.0
**状态**: ✅ 真实可执行
**承诺**: 所有功能均经过验证，无虚假承诺

---

## 📋 概述

这是一套**真实可用**的 Stigmergy 配置脚本，用于增强您的 AI CLI 工具能力。

### ✅ 可实现的功能

- ✅ **DuckDuckGo 搜索** - 即时可用，无需 API Key
- ✅ **Wikipedia 知识库** - 高质量知识，无需认证
- ✅ **Ollama 本地 LLM** - 完全免费，隐私保护
- ✅ **配置验证** - 自动检查配置状态
- ✅ **一键安装** - Linux/macOS/Windows 支持

### ⚠️ 需要手动操作的

- ⏳ **API Key 申请** - Tavily、Google AI 等（需要注册）
- ⏳ **Ollama 安装** - 需要下载和安装
- ⏳ **模型下载** - 需要时间和磁盘空间

---

## 🚀 快速开始

### Linux / macOS

```bash
# 1. 给脚本添加执行权限
cd ~/.stigmergy/scripts
chmod +x *.sh

# 2. 一键配置（推荐）
./setup-all.sh

# 3. 验证配置
./verify-config.sh

# 4. 查看使用示例
./examples.sh
```

### Windows

```powershell
# 1. 进入脚本目录
cd $env:USERPROFILE\.stigmergy\scripts

# 2. 运行配置脚本
powershell -ExecutionPolicy Bypass -File setup-all.ps1

# 3. 验证配置
# （验证脚本仅支持 Linux/macOS）
```

---

## 📁 脚本说明

### 1. setup-all.sh / setup-all.ps1
**一键配置脚本** - 快速配置所有功能

**功能：**
- 检测操作系统和依赖
- 配置 DuckDuckGo 搜索
- 配置 Wikipedia 知识库
- 配置 Ollama 本地 LLM
- 显示下一步操作指南

**使用：**
```bash
./setup-all.sh          # Linux/macOS
powershell setup-all.ps1 # Windows
```

### 2. setup-search.sh
**搜索引擎配置脚本** - 配置搜索服务

**功能：**
- 配置 DuckDuckGo（即时可用）
- 配置 Wikipedia（即时可用）
- 配置 Tavily（需要 API Key）
- 测试搜索功能

**使用：**
```bash
./setup-search.sh
```

### 3. setup-local-llm.sh
**本地 LLM 配置脚本** - 安装和配置 Ollama

**功能：**
- 检测 Ollama 安装状态
- 自动安装 Ollama（Linux）
- 推荐和下载模型
- 测试模型功能
- 创建配置文件

**使用：**
```bash
./setup-local-llm.sh
```

### 4. verify-config.sh
**配置验证工具** - 检查配置状态

**功能：**
- 检查目录结构
- 验证搜索引擎配置
- 验证本地 LLM 配置
- 测试 API 连接
- 显示详细配置信息
- 提供修复建议

**使用：**
```bash
./verify-config.sh
```

### 5. examples.sh
**使用示例脚本** - 显示使用方法

**功能：**
- 搜索引擎使用示例
- 本地 LLM 使用示例
- API 调用示例
- 组合使用示例
- 实用工作流

**使用：**
```bash
./examples.sh
```

---

## 🎯 典型使用场景

### 场景1: 即时搜索（2分钟）

```bash
# 1. 配置搜索
./setup-search.sh

# 2. 立即使用
claude '搜索 latest AI news'

# ✅ 完成！DuckDuckGo 已可用
```

### 场景2: 本地 LLM（20分钟）

```bash
# 1. 配置 Ollama
./setup-local-llm.sh

# 2. 下载模型（选择推荐模型）
# ollama pull llama3:8b
# ollama pull qwen2.5:7b

# 3. 测试
ollama run llama3:8b '你好'

# ✅ 完成！本地 LLM 已可用
```

### 场景3: 完整配置（30分钟）

```bash
# 1. 一键配置
./setup-all.sh

# 2. 验证
./verify-config.sh

# 3. 开始使用
claude '搜索 AI news'
ollama run llama3:8b '总结今天的新闻'

# ✅ 完成！所有功能已配置
```

---

## 📊 配置文件说明

### 搜索引擎配置
**位置**: `~/.stigmergy/config/search-services.json`

```json
{
  "version": "1.0.0",
  "enabled": ["duckduckgo"],
  "providers": {
    "duckduckgo": {
      "name": "DuckDuckGo",
      "enabled": true,
      "noAuthRequired": true,
      "baseUrl": "https://api.duckduckgo.com/",
      "priority": 1,
      "description": "完全免费的搜索引擎，无需API Key"
    }
  }
}
```

### 本地 LLM 配置
**位置**: `~/.stigmergy/config/local-llm.json`

```json
{
  "version": "1.0.0",
  "provider": "ollama",
  "baseUrl": "http://localhost:11434",
  "enabled": true,
  "models": ["llama3:8b", "qwen2.5:7b"]
}
```

---

## 🔧 高级配置

### 添加 Tavily Search

```bash
# 1. 注册并获取 API Key
# 访问: https://api.tavily.com

# 2. 设置环境变量
export TAVILY_API_KEY="tvly-xxxxxxxxxxxxx"

# 3. 添加到 shell 配置
echo 'export TAVILY_API_KEY="tvly-xxxxxxxxxxxxx"' >> ~/.bashrc  # Linux
echo 'export TAVILY_API_KEY="tvly-xxxxxxxxxxxxx"' >> ~/.zshrc   # macOS

# 4. 重新配置搜索
./setup-search.sh
```

### 添加 Google AI

```bash
# 1. 获取 API Key
# 访问: https://aistudio.google.com

# 2. 设置环境变量
export GOOGLE_API_KEY="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 3. 添加到配置
# 手动编辑 ~/.stigmergy/config/search-services.json
```

---

## 🧪 测试和验证

### 测试搜索功能

```bash
# 方法1: 使用 curl
curl 'https://api.duckduckgo.com/?q=test&format=json'

# 方法2: 使用 Claude CLI
claude '搜索 test query'

# 方法3: 查看配置
cat ~/.stigmergy/config/search-services.json
```

### 测试本地 LLM

```bash
# 方法1: 直接运行
ollama run llama3:8b 'Hello'

# 方法2: API 调用
curl http://localhost:11434/api/generate -d '{
  "model": "llama3:8b",
  "prompt": "Hello"
}'

# 方法3: 查看已安装模型
ollama list
```

### 验证配置

```bash
# 运行验证脚本
./verify-config.sh

# 检查配置文件
ls -la ~/.stigmergy/config/
cat ~/.stigmergy/config/search-services.json
cat ~/.stigmergy/config/local-llm.json
```

---

## ❓ 常见问题

### Q1: DuckDuckGo 搜索质量不高？

**A:** DuckDuckGo 的优势是无需 API Key，立即可用。如果需要更高质量的搜索结果，可以：
1. 配置 Tavily（专为 AI 设计，1000次/月免费）
2. 配置 Google Custom Search（100次/天免费）

### Q2: Ollama 安装失败？

**A:**
- **macOS**: 使用 Homebrew: `brew install ollama`
- **Linux**: 使用官方脚本: `curl -fsSL https://ollama.com/install.sh | sh`
- **Windows**: 从官网下载安装包: https://ollama.com/download

### Q3: 模型下载太慢？

**A:**
- 使用较小的模型（phi3: 2.3GB）
- 使用国内镜像（如果有）
- 分时段下载

### Q4: 内存不足？

**A:**
- 使用轻量模型（phi3: 2.3GB）
- 一次只运行一个模型
- 关闭其他应用

### Q5: 如何卸载？

**A:**
```bash
# 删除配置
rm -rf ~/.stigmergy

# 卸载 Ollama（如果需要）
brew uninstall ollama  # macOS
# 或
rm -rf /usr/local/bin/ollama  # Linux
```

---

## 📚 相关资源

### 官方文档
- [Stigmergy GitHub](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
- [Ollama 文档](https://ollama.com/documentation)
- [Claude CLI](https://claude.ai/code)

### API 服务
- [Tavily Search](https://api.tavily.com) - 1000次/月免费
- [Google AI Studio](https://aistudio.google.com) - Gemini 无限免费
- [Hugging Face](https://huggingface.co) - 30k/天免费
- [Together AI](https://together.ai) - $25 免费额度

### 模型推荐
- [Llama 3](https://ollama.com/library/llama3) - 通用高质量
- [Qwen 2.5](https://ollama.com/library/qwen2.5) - 中文优化
- [Phi-3](https://ollama.com/library/phi3) - 轻量快速
- [Mistral](https://ollama.com/library/mistral) - 高效

---

## 🤝 贡献

如果您发现问题或有改进建议：
1. 提交 Issue
2. 创建 Pull Request
3. 分享您的配置经验

---

## 📄 许可证

MIT License - 与 Stigmergy 主项目相同

---

## 🔒 隐私说明

- ✅ **本地优先**: Ollama 完全在本地运行
- ✅ **无需账户**: DuckDuckGo 无需注册
- ✅ **开源透明**: 所有脚本开源可审计
- ⚠️ **云端服务**: Tavily/Google AI 需要发送数据到云端

---

**版本**: 1.0.0
**最后更新**: 2026-03-06
**状态**: ✅ 生产就绪
