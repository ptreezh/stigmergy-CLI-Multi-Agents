#!/bin/bash
# 智能体协作系统 - Unix一键安装脚本
# 为普通用户提供简单安装方式

echo ""
echo "🚀 智能体协作系统 - 一键安装向导 (Unix/Linux/macOS)"
echo "=================================================="
echo ""

# 检查Python是否已安装
echo "🔍 检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装或未在PATH中"
    echo "💡 请先安装Python3"
    echo ""
    exit 1
else
    echo "✅ Python3环境正常: $(python3 --version)"
fi

# 检查Git是否已安装
echo ""
echo "🔍 检查Git环境..."
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装或未在PATH中"
    echo "💡 请先安装Git"
    echo ""
    exit 1
else
    echo "✅ Git环境正常: $(git --version | head -n1)"
fi

# 创建临时安装目录
INSTALL_DIR="$(mktemp -d)"
echo ""
echo "📁 创建临时安装目录: $INSTALL_DIR"

# 克隆项目
echo ""
echo "📦 下载智能体协作系统..."
if [ -d "$INSTALL_DIR/smart-cli-router" ]; then
    rm -rf "$INSTALL_DIR/smart-cli-router"
fi

git clone https://github.com/socienceai/smart-cli-router.git "$INSTALL_DIR/smart-cli-router" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ 下载失败，请检查网络连接"
    rm -rf "$INSTALL_DIR"
    exit 1
else
    echo "✅ 项目下载完成"
fi

# 进入项目目录
cd "$INSTALL_DIR/smart-cli-router"

# 安装Python依赖（如果存在requirements.txt）
echo ""
echo "📚 安装依赖包..."
if [ -f "requirements.txt" ]; then
    if command -v pip3 &> /dev/null; then
        pip3 install -r requirements.txt 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "⚠️  依赖安装失败，尝试继续安装..."
        else
            echo "✅ 依赖安装完成"
        fi
    else
        echo "⚠️  pip3未找到，跳过依赖安装"
    fi
else
    echo "⚠️  未找到requirements.txt文件"
fi

# 执行安装
echo ""
echo "🔧 执行系统安装..."
python3 QUICK_INSTALL.py

echo ""
echo "🎉 安装完成！"
echo ""
echo "💡 使用方法："
echo "   直接使用您已安装的CLI工具，现在它们支持协作功能"
echo "   例如: claude '让gemini帮我翻译这份文档'"
echo ""
echo "📄 协作文件将自动在项目目录中创建："
echo "   - PROJECT_SPEC.json (任务和状态)"
echo "   - PROJECT_CONSTITUTION.md (协作规则)"
echo ""
echo "🌐 项目网站: http://www.socienceAI.com"
echo ""

# 清理临时目录
rm -rf "$INSTALL_DIR"

echo "按任意键退出..."
read -n 1 -s