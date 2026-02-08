#!/bin/bash

# Stigmergy CLI 发布脚本

echo "=========================================="
echo "Stigmergy CLI v1.3.77-beta.0 发布脚本"
echo "=========================================="

# 检查是否已登录npm
echo "检查npm登录状态..."
npm whoami > /dev/null 2>&1
LOGIN_STATUS=$?

if [ $LOGIN_STATUS -ne 0 ]; then
    echo "❌ 未登录npm，请先运行: npm login"
    exit 1
else
    LOGGED_USER=$(npm whoami)
    echo "✅ 已登录为: $LOGGED_USER"
fi

# 检查package.json版本
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "📦 准备发布的版本: $PACKAGE_VERSION"

if [ "$PACKAGE_VERSION" != "1.3.77-beta.0" ]; then
    echo "❌ 版本不匹配，期望 1.3.77-beta.0，实际 $PACKAGE_VERSION"
    exit 1
fi

echo ""
echo "即将发布 Stigmergy CLI v1.3.77-beta.0"
echo "包含以下更新："
echo "- 增强 resumesession 技能功能"
echo "  - 实现智能累积机制，当会话内容不足时自动追加更多会话"
echo "  - 只显示用户输入、模型输出和时间戳信息，去除冗余格式"
echo "  - 添加内容过滤功能，剔除无意义内容（如API超限提示）"
echo "  - 按日期分组显示，标注每组的起始和结束时间"
echo "  - 当没有会话时返回\"无\""
echo ""

read -p "确定要发布吗? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 开始发布..."
    npm publish --tag beta
    PUBLISH_STATUS=$?
    
    if [ $PUBLISH_STATUS -eq 0 ]; then
        echo "✅ 发布成功!"
        echo ""
        echo "接下来的步骤："
        echo "1. git add ."
        echo "2. git commit -m \"feat: 发布 v1.3.77-beta.0 包含 resumesession 增强功能\""
        echo "3. git tag -a v1.3.77-beta.0 -m \"v1.3.77-beta.0: resumesession 增强功能\""
        echo "4. git push origin main"
        echo "5. git push origin v1.3.77-beta.0"
    else
        echo "❌ 发布失败，状态码: $PUBLISH_STATUS"
        exit 1
    fi
else
    echo "发布已取消"
    exit 0
fi