#!/bin/bash
#
# Stigmergy Configuration Verification Script
# 配置验证工具
#
# 用途: 验证 Stigmergy 配置是否正确
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Stigmergy 配置验证${NC}"
echo "======================================"

# 配置目录
STIGMERGY_DIR="$HOME/.stigmergy"
CONFIG_DIR="$STIGMERGY_DIR/config"

# 统计变量
total_checks=0
passed_checks=0
failed_checks=0
warnings=0

# 检查函数
check() {
    local name="$1"
    local command="$2"
    local expected="${3:-true}"

    total_checks=$((total_checks + 1))

    echo -n "检查 $name: "

    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        if [ "$expected" = "false" ]; then
            echo -e "${YELLOW}⚠️  警告${NC}"
            warnings=$((warnings + 1))
        else
            echo -e "${RED}❌ 失败${NC}"
            failed_checks=$((failed_checks + 1))
        fi
        return 1
    fi
}

# 1. 检查目录结构
echo -e "\n${BLUE}📁 目录结构${NC}"
check "Stigmergy 目录存在" "[ -d '$STIGMERGY_DIR' ]"
check "配置目录存在" "[ -d '$CONFIG_DIR' ]"

# 2. 检查搜索引擎配置
echo -e "\n${BLUE}🔍 搜索引擎配置${NC}"

if [ -f "$CONFIG_DIR/search-services.json" ]; then
    check "搜索配置文件存在" "true"

    # 检查 DuckDuckGo
    if command -v python3 &> /dev/null; then
        has_ddg=$(python3 -c "import json; f=open('$CONFIG_DIR/search-services.json'); config=json.load(f); print('duckduckgo' in config.get('enabled', []))" 2>/dev/null)
        if [ "$has_ddg" = "True" ]; then
            check "DuckDuckGo 已配置" "true"
        else
            check "DuckDuckGo 已配置" "false" "false"
        fi
    fi
else
    check "搜索配置文件存在" "false" "false"
fi

# 测试 DuckDuckGo API
echo -n "测试 DuckDuckGo API: "
if command -v curl &> /dev/null; then
    response=$(curl -s 'https://api.duckduckgo.com/?q=test&format=json' -m 5)
    if [ -n "$response" ]; then
        echo -e "${GREEN}✅ 可用${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ 不可用${NC}"
        failed_checks=$((failed_checks + 1))
    fi
    total_checks=$((total_checks + 1))
else
    echo -e "${YELLOW}⚠️  curl 未安装，跳过测试${NC}"
    warnings=$((warnings + 1))
    total_checks=$((total_checks + 1))
fi

# 3. 检查本地 LLM 配置
echo -e "\n${BLUE}🤖 本地 LLM 配置${NC}"

check "Ollama 已安装" "command -v ollama"

if command -v ollama &> /dev/null; then
    # 检查 Ollama 服务
    echo -n "检查 Ollama 服务状态: "
    if pgrep -x "ollama" > /dev/null; then
        echo -e "${GREEN}✅ 运行中${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${YELLOW}⚠️  未运行${NC}"
        warnings=$((warnings + 1))
    fi
    total_checks=$((total_checks + 1))

    # 检查已安装的模型
    echo -n "检查已安装的模型: "
    models=$(ollama list 2>/dev/null | tail -n +2 | wc -l)
    if [ "$models" -gt 0 ]; then
        echo -e "${GREEN}✅ $models 个模型${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${YELLOW}⚠️  无模型${NC}"
        warnings=$((warnings + 1))
    fi
    total_checks=$((total_checks + 1))
else
    # Ollama 未安装时的占位检查
    echo -n "检查 Ollama 服务状态: "
    echo -e "${YELLOW}⚠️  Ollama 未安装${NC}"
    warnings=$((warnings + 1))
    total_checks=$((total_checks + 1))

    echo -n "检查已安装的模型: "
    echo -e "${YELLOW}⚠️  Ollama 未安装${NC}"
    warnings=$((warnings + 1))
    total_checks=$((total_checks + 1))
fi

# 测试 Ollama API
if command -v ollama &> /dev/null && pgrep -x "ollama" > /dev/null; then
    echo -n "测试 Ollama API: "
    if command -v curl &> /dev/null; then
        response=$(curl -s http://localhost:11434/api/tags -m 2)
        if [ -n "$response" ]; then
            echo -e "${GREEN}✅ 可用${NC}"
            passed_checks=$((passed_checks + 1))
        else
            echo -e "${RED}❌ 不可用${NC}"
            failed_checks=$((failed_checks + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  curl 未安装，跳过测试${NC}"
        warnings=$((warnings + 1))
    fi
    total_checks=$((total_checks + 1))
fi

# 4. 检查环境变量
echo -e "\n${BLUE}🔑 环境变量${NC}"

check "TAVILY_API_KEY 已设置" "[ -n '$TAVILY_API_KEY' ]" "false"
check "GOOGLE_API_KEY 已设置" "[ -n '$GOOGLE_API_KEY' ]" "false"
check "HUGGINGFACE_TOKEN 已设置" "[ -n '$HUGGINGFACE_TOKEN' ]" "false"

# 5. 检查脚本权限
echo -e "\n${BLUE}📜 脚本权限${NC}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$script_dir/setup-search.sh" ]; then
    check "setup-search.sh 可执行" "[ -x '$script_dir/setup-search.sh' ]" "false"
fi
if [ -f "$script_dir/setup-local-llm.sh" ]; then
    check "setup-local-llm.sh 可执行" "[ -x '$script_dir/setup-local-llm.sh' ]" "false"
fi

# 6. 显示详细配置
echo -e "\n${BLUE}📋 配置详情${NC}"
echo "======================================"

# 搜索引擎配置
if [ -f "$CONFIG_DIR/search-services.json" ]; then
    echo ""
    echo "搜索引擎配置:"
    if command -v python3 &> /dev/null; then
        python3 << PYTHON
import json

try:
    with open('$CONFIG_DIR/search-services.json', 'r') as f:
        config = json.load(f)

    for provider in config.get('enabled', []):
        info = config['providers'].get(provider, {})
        status = "✅" if info.get('enabled') else "❌"
        print(f"  {status} {info.get('name', provider)}")
        if info.get('noAuthRequired'):
            print(f"     无需 API Key，即时可用")
        if info.get('apiKey'):
            print(f"     API Key: {info['apiKey'][:8]}...")
except Exception as e:
    print(f"  无法解析配置: {e}")
PYTHON
    fi
fi

# LLM 配置
if [ -f "$CONFIG_DIR/local-llm.json" ]; then
    echo ""
    echo "本地 LLM 配置:"
    if command -v python3 &> /dev/null; then
        python3 << PYTHON
import json

try:
    with open('$CONFIG_DIR/local-llm.json', 'r') as f:
        config = json.load(f)

    print(f"  提供商: {config.get('provider', 'unknown')}")
    print(f"  基础 URL: {config.get('baseUrl', 'unknown')}")

    models = config.get('models', [])
    if models:
        print(f"  已配置模型: {len(models)} 个")
        for model in models[:3]:
            print(f"    - {model}")
        if len(models) > 3:
            print(f"    ... 还有 {len(models) - 3} 个")
    else:
        print(f"  已配置模型: 无")
except Exception as e:
    print(f"  无法解析配置: {e}")
PYTHON
    fi
fi

# Ollama 模型列表
if command -v ollama &> /dev/null; then
    echo ""
    echo "Ollama 已安装模型:"
    ollama list 2>/dev/null | tail -n +2 | while read -r line; do
        echo "  $line"
    done
fi

# 7. 显示总结
echo -e "\n${BLUE}📊 验证总结${NC}"
echo "======================================"
echo -e "总检查数: $total_checks"
echo -e "${GREEN}通过: $passed_checks${NC}"
echo -e "${RED}失败: $failed_checks${NC}"
echo -e "${YELLOW}警告: $warnings${NC}"

# 计算成功率
if [ $total_checks -gt 0 ]; then
    success_rate=$((passed_checks * 100 / total_checks))
    echo -e "\n成功率: $success_rate%"

    if [ $success_rate -ge 80 ]; then
        echo -e "\n${GREEN}✅ 配置良好！${NC}"
    elif [ $success_rate -ge 50 ]; then
        echo -e "\n${YELLOW}⚠️  配置部分可用，建议完善${NC}"
    else
        echo -e "\n${RED}❌ 配置需要修复${NC}"
    fi
fi

# 8. 提供修复建议
if [ $failed_checks -gt 0 ] || [ $warnings -gt 0 ]; then
    echo -e "\n${BLUE}💡 修复建议${NC}"
    echo "======================================"

    if ! command -v ollama &> /dev/null; then
        echo ""
        echo "安装 Ollama:"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  brew install ollama"
        else
            echo "  curl -fsSL https://ollama.com/install.sh | sh"
        fi
    fi

    if ! pgrep -x "ollama" > /dev/null 2>/dev/null && command -v ollama &> /dev/null; then
        echo ""
        echo "启动 Ollama 服务:"
        echo "  ollama serve &"
    fi

    if [ ! -f "$CONFIG_DIR/search-services.json" ]; then
        echo ""
        echo "配置搜索引擎:"
        echo "  bash $script_dir/setup-search.sh"
    fi
fi

echo ""
echo "完成！"
