#!/bin/bash

# Wechaty Bot 一键安装脚本

echo "========================================"
echo "🤖 Stigmergy Wechaty Bot 安装"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 安装 Wechaty 依赖
echo "📦 安装 Wechaty 依赖..."
echo ""

npm install wechaty wechaty-puppet-wechat qrcode-terminal file-box

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 安装成功！"
    echo ""
    echo "========================================"
    echo "🚀 启动命令"
    echo "========================================"
    echo ""
    echo "  node scripts/start-wechaty-bot.js"
    echo ""
    echo "或者指定其他 AI CLI："
    echo "  node scripts/start-wechaty-bot.js gemini"
    echo "  node scripts/start-wechaty-bot.js qwen"
    echo ""
    echo "========================================"
    echo "📚 详细文档"
    echo "========================================"
    echo ""
    echo "查看: docs/WECHATY_QUICK_START.md"
    echo ""
else
    echo ""
    echo "❌ 安装失败"
    echo ""
    echo "💡 可能的解决方案："
    echo "  1. 检查网络连接"
    echo "  2. 尝试使用淘宝镜像:"
    echo "     npm install --registry=https://registry.npmmirror.com"
    echo "  3. 查看详细文档: docs/WECHATY_QUICK_START.md"
    echo ""
    exit 1
fi
