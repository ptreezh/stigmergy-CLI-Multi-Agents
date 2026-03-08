#!/bin/bash
#
# Stigmergy Local LLM Setup Script
# 本地大语言模型配置脚本
#
# 用途: 安装和配置 Ollama 本地 LLM
# 支持: Linux, macOS
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置目录
STIGMERGY_DIR="$HOME/.stigmergy"
CONFIG_DIR="$STIGMERGY_DIR/config"
LLM_CONFIG="$CONFIG_DIR/local-llm.json"

echo -e "${BLUE}🤖 Stigmergy 本地 LLM 配置${NC}"
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

# 检测架构
detect_arch() {
    local arch=$(uname -m)
    if [[ "$arch" == "arm64"* ]] || [[ "$arch" == "aarch64"* ]]; then
        echo "arm64"
    else
        echo "amd64"
    fi
}

ARCH=$(detect_arch)

# 1. 检查 Ollama 是否已安装
check_ollama() {
    echo -e "\n${BLUE}🔍 检查 Ollama 安装状态${NC}"

    if command -v ollama &> /dev/null; then
        local version=$(ollama --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Ollama 已安装${NC}"
        echo "   版本: $version"
        return 0
    else
        echo -e "${YELLOW}⏳ Ollama 未安装${NC}"
        return 1
    fi
}

# 2. 安装 Ollama
install_ollama() {
    echo -e "\n${BLUE}📦 安装 Ollama${NC}"
    echo "======================================"

    if [[ "$OS" == "macos" ]]; then
        echo "检测到 macOS 系统"
        echo ""
        echo "安装方式 1: 使用 Homebrew（推荐）"
        echo "  brew install ollama"
        echo ""
        echo "安装方式 2: 下载安装包"
        echo "  访问: https://ollama.com/download"
        echo "  下载 macOS 版本并安装"
        echo ""

        # 检查是否安装了 brew
        if command -v brew &> /dev/null; then
            read -p "是否使用 Homebrew 自动安装？(y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "正在安装 Ollama..."
                brew install ollama
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Ollama 安装成功${NC}"
                    return 0
                fi
            fi
        fi

    elif [[ "$OS" == "linux" ]]; then
        echo "检测到 Linux 系统"
        echo ""
        echo "使用官方安装脚本:"
        echo "  curl -fsSL https://ollama.com/install.sh | sh"
        echo ""

        read -p "是否运行安装脚本？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "正在安装 Ollama..."
            curl -fsSL https://ollama.com/install.sh | sh
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Ollama 安装成功${NC}"
                return 0
            fi
        fi
    fi

    echo -e "${YELLOW}请手动安装 Ollama${NC}"
    echo "安装指南: https://ollama.com/download"
    return 1
}

# 3. 检查 Ollama 服务状态
check_ollama_service() {
    echo -e "\n${BLUE}🔍 检查 Ollama 服务状态${NC}"

    if ! command -v ollama &> /dev/null; then
        echo -e "${YELLOW}⚠ Ollama 未安装，跳过服务检查${NC}"
        return 1
    fi

    # 检查服务是否运行
    if pgrep -x "ollama" > /dev/null; then
        echo -e "${GREEN}✅ Ollama 服务正在运行${NC}"
        return 0
    else
        echo -e "${YELLOW}⏳ Ollama 服务未启动${NC}"
        return 1
    fi
}

# 4. 启动 Ollama 服务
start_ollama_service() {
    echo -e "\n${BLUE}🚀 启动 Ollama 服务${NC}"

    if [[ "$OS" == "macos" ]]; then
        # macOS 上 Ollama 通常作为应用运行
        echo "在 macOS 上，Ollama 服务会随应用自动启动"
        echo "请确保 Ollama 应用正在运行"
        open -a Ollama 2>/dev/null || echo "请手动启动 Ollama 应用"

    elif [[ "$OS" == "linux" ]]; then
        echo "启动 Ollama 服务..."
        systemctl --user start ollama 2>/dev/null || ollama serve &
        sleep 2

        if pgrep -x "ollama" > /dev/null; then
            echo -e "${GREEN}✅ Ollama 服务已启动${NC}"
        else
            echo -e "${YELLOW}⚠ 可能需要手动启动服务${NC}"
            echo "运行: ollama serve"
        fi
    fi
}

# 5. 推荐和下载模型
recommend_models() {
    echo -e "\n${BLUE}📥 推荐模型${NC}"
    echo "======================================"

    if ! command -v ollama &> /dev/null; then
        echo -e "${YELLOW}⚠ Ollama 未安装，无法下载模型${NC}"
        return 1
    fi

    echo ""
    echo "推荐模型列表:"
    echo ""
    echo "1. Llama 3 8B (通用)"
    echo "   ollama pull llama3:8b"
    echo "   大小: ~4.7GB"
    echo "   特点: 高质量，多语言支持"
    echo ""
    echo "2. Qwen 2.5 7B (中文优化)"
    echo "   ollama pull qwen2.5:7b"
    echo "   大小: ~4.5GB"
    echo "   特点: 中文优化，推理能力强"
    echo ""
    echo "3. Mistral 7B (高效)"
    echo "   ollama pull mistral:7b"
    echo "   大小: ~4.1GB"
    echo "   特点: 高效，适合日常任务"
    echo ""
    echo "4. Phi-3 3.8B (轻量)"
    echo "   ollama pull phi3"
    echo "   大小: ~2.3GB"
    echo "   特点: 轻量，适合低配置设备"

    echo ""
    read -p "是否下载推荐模型？(y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        download_models
    fi
}

# 下载模型
download_models() {
    echo -e "\n${BLUE}⬇️  下载模型${NC}"
    echo "======================================"

    # 检查磁盘空间
    local available_space=$(df -h "$HOME" | awk 'NR==2 {print $4}')
    echo "可用磁盘空间: $available_space"

    # 下载 Llama 3 8B
    echo ""
    read -p "下载 Llama 3 8B? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在下载 llama3:8b..."
        if ollama pull llama3:8b; then
            echo -e "${GREEN}✅ llama3:8b 下载成功${NC}"
        else
            echo -e "${RED}❌ llama3:8b 下载失败${NC}"
        fi
    fi

    # 下载 Qwen 2.5 7B
    echo ""
    read -p "下载 Qwen 2.5 7B? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在下载 qwen2.5:7b..."
        if ollama pull qwen2.5:7b; then
            echo -e "${GREEN}✅ qwen2.5:7b 下载成功${NC}"
        else
            echo -e "${RED}❌ qwen2.5:7b 下载失败${NC}"
        fi
    fi

    # 下载 Phi-3（轻量）
    echo ""
    read -p "下载 Phi-3 3.8B? (推荐低配置) (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在下载 phi3..."
        if ollama pull phi3; then
            echo -e "${GREEN}✅ phi3 下载成功${NC}"
        else
            echo -e "${RED}❌ phi3 下载失败${NC}"
        fi
    fi
}

# 6. 列出已安装的模型
list_models() {
    echo -e "\n${BLUE}📋 已安装的模型${NC}"
    echo "======================================"

    if ! command -v ollama &> /dev/null; then
        echo -e "${YELLOW}⚠ Ollama 未安装${NC}"
        return 1
    fi

    echo ""
    ollama list
}

# 7. 测试模型
test_model() {
    echo -e "\n${BLUE}🧪 测试模型${NC}"
    echo "======================================"

    if ! command -v ollama &> /dev/null; then
        echo -e "${YELLOW}⚠ Ollama 未安装${NC}"
        return 1
    fi

    # 获取第一个可用模型
    local model=$(ollama list | tail -n +2 | head -1 | awk '{print $1}')

    if [ -z "$model" ]; then
        echo -e "${YELLOW}⚠ 没有可用的模型${NC}"
        return 1
    fi

    echo ""
    echo "测试模型: $model"
    echo "提示词: 'Hello, how are you?'"
    echo ""

    echo "ollama run $model 'Hello, how are you?'"
    echo ""

    read -p "运行测试？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ollama run "$model" "Hello, how are you? Please respond briefly."
    fi
}

# 8. 创建配置文件
create_config() {
    echo -e "\n${BLUE}⚙️  创建配置文件${NC}"

    cat > "$LLM_CONFIG" << EOF
{
  "version": "1.0.0",
  "provider": "ollama",
  "baseUrl": "http://localhost:11434",
  "enabled": true,
  "models": []
}
EOF

    # 更新已安装的模型列表
    if command -v ollama &> /dev/null; then
        if command -v python3 &> /dev/null; then
            # 获取模型列表
            local models=$(ollama list | tail -n +2 | awk '{print $1}' | tr '\n' ',' | sed 's/,$//')

            python3 << PYTHON
import json

with open('$LLM_CONFIG', 'r') as f:
    config = json.load(f)

# 添加模型
models = "$models".split(',') if "$models" else []
config['models'] = [m for m in models if m]

with open('$LLM_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
PYTHON

            echo -e "${GREEN}✅ 配置文件已创建: $LLM_CONFIG${NC}"
        fi
    fi
}

# 9. 显示使用指南
show_usage_guide() {
    echo -e "\n${BLUE}📖 使用指南${NC}"
    echo "======================================"

    echo ""
    echo "命令行使用:"
    echo "  ollama list              # 列出模型"
    echo "  ollama pull <model>      # 下载模型"
    echo "  ollama run <model>       # 运行模型"
    echo "  ollama serve             # 启动服务"

    echo ""
    echo "在 Claude CLI 中使用:"
    echo "  claude '使用本地 llama3 模型分析这段代码'"

    echo ""
    echo "API 使用:"
    echo "  curl http://localhost:11434/api/generate -d '{"
    echo "    \"model\": \"llama3:8b\","
    echo "    \"prompt\": \"Hello\""
    echo "  }'"
}

# 10. 显示系统信息
show_system_info() {
    echo -e "\n${BLUE}💻 系统信息${NC}"
    echo "======================================"
    echo "操作系统: $OS"
    echo "架构: $ARCH"

    # 内存信息
    if [[ "$OS" == "macos" ]]; then
        local mem=$(sysctl hw.memsize | awk '{print $2/1024/1024/1024 " GB"}')
        echo "内存: $mem"
    elif [[ "$OS" == "linux" ]]; then
        local mem=$(free -h | awk '/^Mem:/ {print $2}')
        echo "内存: $mem"
    fi

    # 磁盘空间
    local disk=$(df -h "$HOME" | awk 'NR==2 {print $4 " 可用"}')
    echo "磁盘: $disk"
}

# 主流程
main() {
    # 显示系统信息
    show_system_info

    # 检查 Ollama
    if ! check_ollama; then
        install_ollama
    fi

    # 检查并启动服务
    if ! check_ollama_service; then
        start_ollama_service
        sleep 2
    fi

    # 如果已安装，列出当前模型
    if command -v ollama &> /dev/null; then
        list_models

        # 推荐和下载模型
        recommend_models

        # 再次列出模型
        list_models

        # 测试模型
        test_model

        # 创建配置
        create_config
    fi

    # 显示使用指南
    show_usage_guide

    echo -e "\n${GREEN}✅ 本地 LLM 配置完成！${NC}"
    echo ""
    echo "下一步:"
    echo "  1. 测试本地模型: ollama run llama3:8b '你好'"
    echo "  2. 在 Claude CLI 中使用本地模型"
    echo "  3. 配置环境变量（可选）:"
    echo "     export OLLAMA_BASE_URL='http://localhost:11434'"
}

# 运行主流程
main
