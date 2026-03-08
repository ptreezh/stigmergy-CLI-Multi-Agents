#!/bin/bash
#
# Stigmergy One-Click Setup Script
# 一键配置脚本
#
# 用途: 快速配置 Stigmergy 的所有增强功能
# 支持: Linux, macOS
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}${BOLD}🚀 Stigmergy 一键配置${NC}"
echo "======================================"
echo ""
echo "此脚本将自动配置："
echo "  1. ✅ DuckDuckGo 搜索（即时可用）"
echo "  2. ✅ Wikipedia 知识库（即时可用）"
echo "  3. 🤖 本地 LLM（Ollama + Llama3/Qwen）"
echo "  4. 📝 可选的云端 API 配置指南"
echo ""

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

# 检查依赖
check_dependencies() {
    echo -e "\n${BLUE}🔍 检查系统依赖...${NC}"

    local missing_deps=()

    # 检查 curl
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi

    # 检查 Python 3（可选，用于 JSON 处理）
    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}⚠️  Python 3 未安装（可选，用于 JSON 处理）${NC}"
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${RED}❌ 缺少依赖: ${missing_deps[*]}${NC}"
        echo ""
        echo "请先安装缺少的依赖："

        if [[ "$OS" == "macos" ]]; then
            echo "  brew install ${missing_deps[*]}"
        elif [[ "$OS" == "linux" ]]; then
            echo "  sudo apt-get install ${missing_deps[*]}"  # Debian/Ubuntu
            echo "  或"
            echo "  sudo yum install ${missing_deps[*]}"      # CentOS/RHEL
        fi

        return 1
    fi

    echo -e "${GREEN}✅ 依赖检查通过${NC}"
    return 0
}

# 配置搜索引擎
setup_search() {
    echo -e "\n${BLUE}🔍 配置搜索引擎...${NC}"
    echo "======================================"

    if [ -f "$SCRIPT_DIR/setup-search.sh" ]; then
        bash "$SCRIPT_DIR/setup-search.sh"
    else
        echo -e "${RED}❌ 找不到 setup-search.sh${NC}"
        return 1
    fi
}

# 配置本地 LLM
setup_local_llm() {
    echo -e "\n${BLUE}🤖 配置本地 LLM...${NC}"
    echo "======================================"

    if [ -f "$SCRIPT_DIR/setup-local-llm.sh" ]; then
        bash "$SCRIPT_DIR/setup-local-llm.sh"
    else
        echo -e "${RED}❌ 找不到 setup-local-llm.sh${NC}"
        return 1
    fi
}

# 显示下一步指南
show_next_steps() {
    echo -e "\n${GREEN}${BOLD}✅ 配置完成！${NC}"
    echo ""
    echo "📖 下一步操作："
    echo ""
    echo "1️⃣  测试搜索引擎："
    echo "   claude '搜索 latest AI news'"
    echo ""
    echo "2️⃣  测试本地 LLM（如果已安装）："
    echo "   ollama run llama3:8b '你好'"
    echo ""
    echo "3️⃣  配置可选的云端 API："
    echo "   - Tavily Search: https://api.tavily.com"
    echo "   - Google AI: https://aistudio.google.com"
    echo "   - Hugging Face: https://huggingface.co"
    echo ""
    echo "4️⃣  查看配置文件："
    echo "   cat ~/.stigmergy/config/search-services.json"
    echo "   cat ~/.stigmergy/config/local-llm.json"
    echo ""
    echo "📚 更多信息："
    echo "   - 搜索配置: $SCRIPT_DIR/setup-search.sh"
    echo "   - LLM 配置: $SCRIPT_DIR/setup-local-llm.sh"
    echo "   - 实用指南: ~/.stigmergy/docs/realistic-soul-proposal.md"
}

# 主流程
main() {
    echo -e "检测到操作系统: ${BOLD}$OS${NC}\n"

    # 检查依赖
    if ! check_dependencies; then
        exit 1
    fi

    # 询问用户要配置什么
    echo -e "\n${BOLD}选择要配置的功能：${NC}"
    echo "  1. 仅搜索引擎（快速，2分钟）"
    echo "  2. 仅本地 LLM（需要下载模型，10-30分钟）"
    echo "  3. 全部配置（推荐）"
    echo "  4. 自定义"
    echo ""

    read -p "请选择 (1-4): " choice

    case $choice in
        1)
            setup_search
            ;;
        2)
            setup_local_llm
            ;;
        3)
            setup_search
            echo ""
            read -p "是否继续配置本地 LLM？(y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                setup_local_llm
            fi
            ;;
        4)
            echo ""
            read -p "配置搜索引擎？(y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                setup_search
            fi

            echo ""
            read -p "配置本地 LLM？(y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                setup_local_llm
            fi
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            exit 1
            ;;
    esac

    # 显示下一步
    show_next_steps
}

# 运行主流程
main
