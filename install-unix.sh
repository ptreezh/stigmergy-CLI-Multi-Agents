#!/bin/bash
# Linux/macOS Shell启动脚本 - 跨平台编码安全安装器

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Stigmergy CLI - Multi-Agents跨AI CLI工具协作系统"
echo -e "${CYAN}[INFO]${NC} 跨平台编码安全安装器"
echo -e "${PURPLE}==================================================${NC}"
echo

# 检查Python是否可用
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到Python，请确保Python已安装${NC}"
    echo -e "${YELLOW}💡 下载地址: https://www.python.org/downloads/${NC}"
    exit 1
fi

# 选择Python命令
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo -e "${GREEN}[OK]${NC} Python环境检查通过"
echo -e "${GREEN}[OK]${NC} Python版本:"
$PYTHON_CMD --version
echo

# 设置编码环境变量
export PYTHONIOENCODING=utf-8
echo -e "${GREEN}[OK]${NC} 已设置UTF-8编码环境: $PYTHONIOENCODING"

# 检查必要文件是否存在
if [ ! -f "universal_cli_installer.py" ]; then
    echo -e "${RED}❌ 错误: 找不到 universal_cli_installer.py${NC}"
    echo -e "${YELLOW}💡 请确保在项目根目录下运行此脚本${NC}"
    exit 1
fi

if [ ! -f "src/core/cross_platform_encoding.py" ]; then
    echo -e "${RED}❌ 错误: 找不到跨平台编码库${NC}"
    echo -e "${YELLOW}💡 正在尝试创建...${NC}"
    
    # 尝试创建核心目录
    mkdir -p src/core
    
    # 检查是否有脚本生成编码库
    if [ -f "generate_encoding_library.py" ]; then
        echo -e "${BLUE}[INFO]${NC} 正在生成编码库..."
        $PYTHON_CMD generate_encoding_library.py
    else
        echo -e "${RED}❌ 无法自动创建编码库，请手动下载完整项目${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}[OK]${NC} 必要文件检查通过"
echo

# 显示安装选项
echo -e "${CYAN}🎯 请选择安装模式:${NC}"
echo -e "${GREEN}1.${NC} 🚀 统一安装管理器（推荐）"
echo -e "${GREEN}2.${NC} 🔧 批量修复所有安装脚本"
echo -e "${GREEN}3.${NC} 📦 仅安装核心CLI工具（Claude + Gemini）"
echo -e "${GREEN}4.${NC} 🌐 显示编码环境信息"
echo -e "${GREEN}5.${NC} 🔍 验证现有安装"
echo -e "${GREEN}0.${NC} 📋 退出"
echo

read -p "请输入选择 (0-5): " choice

case $choice in
    1)
        echo -e "${BLUE}[INFO]${NC} 启动统一安装管理器..."
        echo
        $PYTHON_CMD universal_cli_installer.py
        ;;
    2)
        echo -e "${BLUE}[INFO]${NC} 批量修复安装脚本..."
        echo
        $PYTHON_CMD fix_all_install_scripts.py
        ;;
    3)
        echo -e "${BLUE}[INFO]${NC} 安装核心CLI工具..."
        echo
        if [ -f "src/adapters/claude/install_claude_integration.py" ]; then
            $PYTHON_CMD src/adapters/claude/install_claude_integration.py
        fi
        if [ -f "src/adapters/gemini/install_gemini_integration.py" ]; then
            $PYTHON_CMD src/adapters/gemini/install_gemini_integration.py
        fi
        ;;
    4)
        echo -e "${BLUE}[INFO]${NC} 显示编码环境信息..."
        echo
        $PYTHON_CMD -c "
import sys
import os
import locale
import platform

print('🌐 系统编码信息:')
print(f'   操作系统: {platform.system()} {platform.release()}')
print(f'   Python版本: {sys.version.split()[0]}')
print(f'   默认编码: {sys.getdefaultencoding()}')
print(f'   系统编码: {locale.getpreferredencoding()}')
print(f'   文件系统编码: {sys.getfilesystemencoding()}')
print()
print('🔧 环境变量:')
print(f'   PYTHONIOENCODING: {os.environ.get(\"PYTHONIOENCODING\", \"未设置\")}')
print(f'   LANG: {os.environ.get(\"LANG\", \"未设置\")}')
print()
print('📁 当前工作目录:', os.getcwd())
"
        ;;
    5)
        echo -e "${BLUE}[INFO]${NC} 验证现有安装..."
        echo
        if [ -f "src/adapters/claude/install_claude_integration.py" ]; then
            $PYTHON_CMD src/adapters/claude/install_claude_integration.py --verify
        fi
        if [ -f "src/adapters/gemini/install_gemini_integration.py" ]; then
            $PYTHON_CMD src/adapters/gemini/install_gemini_integration.py --verify
        fi
        ;;
    0)
        echo -e "${BLUE}[INFO]${NC} 退出安装程序"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效选择，请重新运行${NC}"
        exit 1
        ;;
esac

echo
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 操作失败，请检查错误信息${NC}"
    echo -e "${YELLOW}💡 建议检查权限或使用sudo运行${NC}"
else
    echo -e "${GREEN}✅ 操作完成！${NC}"
    echo
    echo -e "${CYAN}🚀 下一步:${NC}"
    echo -e "  1. 运行: stigmergy-cli init"
    echo -e "  2. 开始使用: claude-cli '请用gemini帮我分析代码'"
fi

echo