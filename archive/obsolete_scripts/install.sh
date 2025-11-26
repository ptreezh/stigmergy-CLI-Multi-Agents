#!/bin/bash

# Stigmergy-CLI 一键安装脚本 (Linux/macOS)
# 使用方法: curl -sSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install.sh | bash

set -e

echo "🚀 Stigmergy-CLI 一键安装程序"
echo "================================"

# 检查系统要求
check_requirements() {
    echo "📋 检查系统要求..."

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ 未检测到Node.js"
        echo "💡 请先安装Node.js: https://nodejs.org/"
        exit 1
    fi

    local node_version=$(node --version | cut -d'v' -f2)
    echo "✅ Node.js版本: $node_version"

    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo "❌ 未检测到npm"
        exit 1
    fi

    # 检查git
    if ! command -v git &> /dev/null; then
        echo "⚠️ 未检测到git，建议安装以便后续更新"
    else
        echo "✅ Git已安装"
    fi

    echo ""
}

# 安装方法1: npm全局安装
install_npm_global() {
    echo "📦 方法1: npm全局安装"
    echo "--------------------"

    echo "正在从npm安装 @stigmergy-cli/deployer..."

    if npm install -g @stigmergy-cli/deployer; then
        echo "✅ npm全局安装成功"
        echo "💡 现在可以使用: stigmergy-cli"
        return 0
    else
        echo "❌ npm全局安装失败，尝试备用方法..."
        return 1
    fi
}

# 安装方法2: npx临时使用
install_npx() {
    echo "📦 方法2: npx临时使用"
    echo "-------------------"

    echo "✅ npx已内置，无需安装"
    echo "💡 使用方法: npx @stigmergy-cli/deployer"

    # 直接测试npx
    echo "正在测试npx..."
    if npx @stigmergy-cli/deployer --help &> /dev/null; then
        echo "✅ npx测试成功"
        return 0
    else
        echo "❌ npx测试失败"
        return 1
    fi
}

# 安装方法3: 克隆仓库
install_git_clone() {
    echo "📦 方法3: 克隆GitHub仓库"
    echo "------------------------"

    local install_dir="$HOME/.stigmergy-cli-source"

    echo "正在克隆到: $install_dir"

    if git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git "$install_dir"; then
        cd "$install_dir/deployment"

        if npm install; then
            echo "✅ 仓库克隆和依赖安装成功"

            # 创建全局链接
            if npm link; then
                echo "✅ 全局命令创建成功"
                echo "💡 现在可以使用: stigmergy-cli"
            else
                echo "⚠️ 全局链接失败，但可以使用: node $install_dir/deployment/deploy.js"
            fi

            return 0
        else
            echo "❌ 依赖安装失败"
            return 1
        fi
    else
        echo "❌ Git克隆失败"
        return 1
    fi
}

# 运行部署
run_deployment() {
    echo ""
    echo "🚀 开始部署Stigmergy-CLI..."
    echo "=========================="

    # 尝试不同的部署方法
    if command -v stigmergy-cli &> /dev/null; then
        stigmergy-cli deploy
    elif npx @stigmergy-cli/deployer deploy &> /dev/null; then
        npx @stigmergy-cli/deployer deploy
    else
        echo "❌ 无法运行部署，请手动运行以下命令之一:"
        echo "   stigmergy-cli deploy"
        echo "   npx @stigmergy-cli/deployer deploy"
    fi
}

# 主安装流程
main() {
    check_requirements

    echo "🎯 选择安装方法:"
    echo "1. npm全局安装 (推荐)"
    echo "2. npx临时使用"
    echo "3. 克隆GitHub仓库"
    echo ""

    read -p "请选择 (1-3，默认1): " choice
    choice=${choice:-1}

    case $choice in
        1)
            if install_npm_global; then
                run_deployment
            else
                echo "尝试备用方法..."
                install_npx
            fi
            ;;
        2)
            install_npx
            run_deployment
            ;;
        3)
            if install_git_clone; then
                run_deployment
            fi
            ;;
        *)
            echo "❌ 无效选择"
            exit 1
            ;;
    esac

    echo ""
    echo "🎉 安装完成！"
    echo "=================="
    echo ""
    echo "📚 使用指南:"
    echo "  stigmergy-cli deploy    # 重新部署"
    echo "  stigmergy-cli scan      # 扫描工具"
    echo "  stigmergy-cli status    # 查看状态"
    echo "  stigmergy-cli clean      # 清理配置"
    echo ""
    echo "🌐 更多信息: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents"
}

# 运行主程序
main "$@"