#!/bin/bash
#
# Stigmergy Search Engine Setup Script
# 实用搜索引擎配置脚本
#
# 用途: 配置可用的搜索引擎，优先使用免费服务
# 支持: Linux, macOS
#

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置目录
STIGMERGY_DIR="$HOME/.stigmergy"
CONFIG_DIR="$STIGMERGY_DIR/config"
SEARCH_CONFIG="$CONFIG_DIR/search-services.json"

echo -e "${BLUE}🔍 Stigmergy 搜索引擎配置${NC}"
echo "======================================"

# 创建配置目录
mkdir -p "$CONFIG_DIR"

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)

# 1. DuckDuckGo（无需API Key，即时可用）
setup_duckduckgo() {
    echo -e "\n${GREEN}✅ 配置 DuckDuckGo Search${NC}"
    echo "   优势: 完全免费，无需API Key，即时可用"
    echo "   限制: 搜索结果质量中等"

    # 创建 DuckDuckGo 配置
    cat > "$SEARCH_CONFIG" << EOF
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
EOF

    echo -e "   ${GREEN}✓ DuckDuckGo 已启用${NC}"
    echo "   配置文件: $SEARCH_CONFIG"
}

# 2. Wikipedia（无需认证，高质量知识）
setup_wikipedia() {
    echo -e "\n${GREEN}✅ 配置 Wikipedia API${NC}"
    echo "   优势: 高质量知识，完全免费，无需认证"

    # 更新配置，添加 Wikipedia
    if [ -f "$SEARCH_CONFIG" ]; then
        # 使用 Python 或 jq 来更新 JSON（如果可用）
        if command -v python3 &> /dev/null; then
            python3 << PYTHON
import json

with open('$SEARCH_CONFIG', 'r') as f:
    config = json.load(f)

config['enabled'].append('wikipedia')
config['providers']['wikipedia'] = {
    "name": "Wikipedia",
    "enabled": True,
    "noAuthRequired": True,
    "baseUrl": "https://en.wikipedia.org/api/rest_v1/",
    "priority": 2,
    "description": "高质量的百科知识库"
}

with open('$SEARCH_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
PYTHON
            echo -e "   ${GREEN}✓ Wikipedia 已添加${NC}"
        else
            echo -e "   ${YELLOW}⚠ 需要手动添加 Wikipedia 到配置${NC}"
        fi
    fi
}

# 3. Tavily Search（推荐，1000次/月免费）
setup_tavily() {
    echo -e "\n${YELLOW}📝 配置 Tavily Search（推荐）${NC}"
    echo "   优势: 专为AI设计，每月1000次免费"
    echo "   注册: https://api.tavily.com"
    echo ""

    # 检查是否已配置
    if [ -n "$TAVILY_API_KEY" ]; then
        echo -e "   ${GREEN}✓ TAVILY_API_KEY 已设置${NC}"

        # 添加到配置
        if command -v python3 &> /dev/null && [ -f "$SEARCH_CONFIG" ]; then
            python3 << PYTHON
import json

with open('$SEARCH_CONFIG', 'r') as f:
    config = json.load(f)

if 'tavily' not in config['enabled']:
    config['enabled'].append('tavily')

config['providers']['tavily'] = {
    "name": "Tavily",
    "enabled": True,
    "apiKey": "$TAVILY_API_KEY",
    "baseUrl": "https://api.tavily.com",
    "priority": 0,
    "description": "AI优化搜索引擎，每月1000次免费"
}

with open('$SEARCH_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
PYTHON
        fi
    else
        echo -e "   ${YELLOW}⏳ Tavily 未配置${NC}"
        echo ""
        echo "   配置步骤:"
        echo "   1. 访问: https://api.tavily.com"
        echo "   2. 使用邮箱注册（30秒）"
        echo "   3. 获取 API Key"
        echo "   4. 运行: export TAVILY_API_KEY='your-key-here'"
        echo ""
        echo "   添加到 shell 配置文件:"

        if [[ "$OS" == "macos" ]]; then
            echo "   echo 'export TAVILY_API_KEY=\"your-key\"' >> ~/.zshrc"
            echo "   source ~/.zshrc"
        else
            echo "   echo 'export TAVILY_API_KEY=\"your-key\"' >> ~/.bashrc"
            echo "   source ~/.bashrc"
        fi
    fi
}

# 4. 测试搜索功能
test_search() {
    echo -e "\n${BLUE}🧪 测试搜索功能${NC}"
    echo "======================================"

    # DuckDuckGo 测试
    echo -e "\n测试 DuckDuckGo:"
    echo "查询: 'artificial intelligence'"
    echo "命令: curl -s 'https://api.duckduckgo.com/?q=artificial+intelligence&format=json'"

    if command -v curl &> /dev/null; then
        response=$(curl -s 'https://api.duckduckgo.com/?q=artificial+intelligence&format=json' | head -c 100)
        if [ -n "$response" ]; then
            echo -e "${GREEN}✓ DuckDuckGo 响应正常${NC}"
        else
            echo -e "${RED}✗ DuckDuckGo 无响应${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ curl 未安装，跳过测试${NC}"
    fi
}

# 5. 显示配置摘要
show_summary() {
    echo -e "\n${BLUE}📊 配置摘要${NC}"
    echo "======================================"

    if [ -f "$SEARCH_CONFIG" ]; then
        echo -e "\n配置文件: $SEARCH_CONFIG"
        echo ""
        echo "已配置的搜索引擎:"

        if command -v python3 &> /dev/null; then
            python3 << PYTHON
import json

with open('$SEARCH_CONFIG', 'r') as f:
    config = json.load(f)

for provider in config['enabled']:
    info = config['providers'][provider]
    status = "✅" if info['enabled'] else "❌"
    print(f"  {status} {info['name']}")
    print(f"     {info['description']}")
    print()
PYTHON
        else
            echo "  ✅ DuckDuckGo (即时可用)"
            echo "  ✅ Wikipedia (即时可用)"
        fi
    fi

    echo -e "\n${GREEN}即时可用:${NC}"
    echo "  - DuckDuckGo Search (无需API Key)"
    echo "  - Wikipedia API (无需认证)"

    echo -e "\n${YELLOW}可选配置:${NC}"
    echo "  - Tavily Search (1000次/月免费)"
    echo "  - Perplexity AI (5次/月免费)"

    echo -e "\n${BLUE}使用方法${NC}"
    echo "  在 Claude CLI 中:"
    echo "  claude '搜索 artificial intelligence latest developments'"
}

# 主流程
main() {
    # 配置 DuckDuckGo（即时可用）
    setup_duckduckgo

    # 配置 Wikipedia（即时可用）
    setup_wikipedia

    # 配置 Tavily（需要API Key）
    setup_tavily

    # 测试搜索功能
    test_search

    # 显示摘要
    show_summary

    echo -e "\n${GREEN}✅ 搜索引擎配置完成！${NC}"
}

# 运行主流程
main
