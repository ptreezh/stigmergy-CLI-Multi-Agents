# Stigmergy 实用型配置指南

## 现实可行的增强方案

### 1. 搜索引擎配置（实用方案）

```bash
# 创建配置脚本
cat > ~/.stigmergy/setup-search.sh << 'EOF'
#!/bin/bash
echo "🔍 配置搜索引擎..."

# DuckDuckGo（无需API Key，即时可用）
echo "✅ DuckDuckGo: 已启用（无需配置）"

# Tavily（推荐，1000次/月免费）
echo ""
echo "📝 配置 Tavily Search:"
echo "1. 访问: https://api.tavily.com"
echo "2. 注册并获取 API Key"
echo "3. 运行: export TAVILY_API_KEY='your-key'"
echo "4. 添加到 ~/.bashrc 或 ~/.zshrc"

# 检查是否已配置
if [ -n "$TAVILY_API_KEY" ]; then
    echo "✅ Tavily: 已配置"
else
    echo "⏳ Tavily: 待配置"
fi

echo ""
echo "🦆 使用 DuckDuckGo 进行即时搜索"
EOF

chmod +x ~/.stigmergy/setup-search.sh
```

### 2. LLM增强（实用方案）

```bash
# 创建LLM配置脚本
cat > ~/.stigmergy/setup-llm.sh << 'EOF'
#!/bin/bash
echo "🤖 配置本地LLM..."

# Ollama（本地免费）
if command -v ollama &> /dev/null; then
    echo "✅ Ollama: 已安装"
else
    echo "📦 安装 Ollama:"
    echo "  macOS: brew install ollama"
    echo "  Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo "  Windows: https://ollama.com/download"
fi

# 推荐模型
echo ""
echo "📥 推荐模型:"
echo "  ollama pull llama3:8b"
echo "  ollama pull qwen:7b"

# Google AI Studio
echo ""
echo "📝 配置 Google AI Studio (可选):"
echo "1. 访问: https://aistudio.google.com"
echo "2. 获取 API Key"
echo "3. 运行: export GOOGLE_API_KEY='your-key'"
EOF

chmod +x ~/.stigmergy/setup-llm.sh
```

### 3. 实际工作流程

```bash
# 真实的使用流程
echo "🚀 Stigmergy 增强流程"

# 1. 安装 Ollama（本地LLM）
brew install ollama  # macOS
# 或
curl -fsSL https://ollama.com/install.sh | sh  # Linux

# 2. 启动 Ollama
ollama serve &

# 3. 下载模型
ollama pull llama3:8b
ollama pull qwen:7b

# 4. 配置环境变量（可选）
echo "export GOOGLE_API_KEY='your-key'" >> ~/.bashrc
echo "export TAVILY_API_KEY='your-key'" >> ~/.bashrc

# 5. 使用 Claude CLI + 本地 LLM
claude "使用 Ollama 的 llama3 模型帮我分析代码"
```

### 4. 现实限制

```yaml
可行:
  - ✅ 指导用户配置
  - ✅ 提供脚本模板
  - ✅ 检测已配置服务
  - ✅ 提供使用建议

不可行:
  - ❌ 自动申请 API Keys（需要人工验证）
  - ❌ 自动注册账户（违反服务条款）
  - ❌ 绕过验证流程（安全风险）
  - ❌ 完全无需用户操作（技术上不可行）
```

### 5. 真实的"增强"效果

```yaml
配置前:
  - Claude CLI（单源）
  - 无搜索能力
  - 云端依赖

配置后:
  - Claude CLI + Ollama（本地）
  - DuckDuckGo 搜索
  - 混合云+本地
  - 月度成本: $0

实际提升:
  - 搜索能力: ✅（DuckDuckGo）
  - 本地隐私: ✅（Ollama）
  - 中文支持: ✅（Qwen模型）
  - 离线能力: ✅（本地LLM）
```

## 总结

**真实情况**:
- 没有"魔法"，需要手动配置
- 但有**实用脚本**简化流程
- 可以**显著增强**能力
- **完全免费**运行

**建议**:
1. 使用实用脚本
2. 先配置DuckDuckGo（即时可用）
3. 安装Ollama（本地LLM）
4. 根据需要添加云端API
