#!/bin/bash

# Stigmergy-CLI 本地安装脚本 (Linux/macOS)
# 不依赖npm，直接从GitHub下载并部署

set -e

echo "🚀 Stigmergy-CLI 本地安装程序"
echo "=============================="

# 检查系统要求
check_requirements() {
    echo "📋 检查系统要求..."

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ 未检测到Node.js"
        echo "💡 请先安装Node.js: https://nodejs.org/"
        exit 1
    fi

    local node_version=$(node --version)
    echo "✅ Node.js版本: $node_version"

    # 检查git
    if ! command -v git &> /dev/null; then
        echo "⚠️ 未检测到git，建议安装以便下载项目"
    else
        echo "✅ Git已安装"
    fi

    echo ""
}

# 安装方法1: Git克隆
install_git_clone() {
    echo "📦 下载项目源码..."
    echo "===================="

    local install_dir="$HOME/.stigmergy-cli-install"

    if [ -d "$install_dir" ]; then
        echo "更新现有安装..."
        cd "$install_dir"
        git pull origin main
    else
        echo "克隆项目到: $install_dir"
        git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git "$install_dir"
        cd "$install_dir"
    fi

    echo "✅ 项目下载完成"

    # 部署扩展
    echo "🚀 部署原生扩展..."
    if node deployment/real-deploy.js; then
        echo "✅ 扩展部署成功"
        return 0
    else
        echo "❌ 扩展部署失败"
        return 1
    fi
}

# 安装方法2: 使用curl下载
install_curl_download() {
    echo "📦 下载部署脚本..."
    echo "==================="

    local deploy_script="$HOME/.stigmergy-cli-deploy.js"

    if curl -fsSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/deployment/real-deploy.js -o "$deploy_script"; then
        echo "✅ 部署脚本下载完成"

        echo "🚀 部署原生扩展..."
        if node "$deploy_script"; then
            echo "✅ 扩展部署成功"
            return 0
        else
            echo "❌ 扩展部署失败"
            return 1
        fi
    else
        echo "❌ 下载失败"
        return 1
    fi
}

# 主安装流程
main() {
    check_requirements

    echo "🎯 选择安装方式:"
    echo "1. Git克隆 (推荐，获取完整项目)"
    echo "2. curl下载 (仅下载部署脚本)"
    echo ""

    read -p "请选择 (1-2，默认1): " choice
    choice=${choice:-1}

    case $choice in
        1)
            if install_git_clone; then
                show_success_message
            else
                echo "尝试备用方法..."
                install_curl_download && show_success_message
            fi
            ;;
        2)
            if install_curl_download; then
                show_success_message
            else
                echo "❌ 安装失败"
                exit 1
            fi
            ;;
        *)
            echo "❌ 无效选择"
            exit 1
            ;;
    esac
}

show_success_message() {
    echo ""
    echo "🎉 安装完成！"
    echo "=============="
    echo ""
    echo "📚 使用指南:"
    echo "  # 重新扫描状态"
    echo "  node ~/.stigmergy-cli-install/deployment/real-deploy.js scan"
    echo ""
    echo "  # 重新部署"
    echo "  node ~/.stigmergy-cli-install/deployment/real-deploy.js deploy"
    echo ""
    echo "  # 或者使用下载的脚本"
    echo "  node ~/.stigmergy-cli-deploy.js"
    echo ""
    echo "🌐 项目地址: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents"
    echo "📁 配置目录: ~/.stigmergy-cli/"
}

# 运行主程序
main "$@"