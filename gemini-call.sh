#!/bin/bash
# Gemini CLI 工具调用脚本
# 用于在Linux/macOS环境下调用其他已安装的CLI工具

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: gemini-call <cli_name> [arguments...]"
    echo "示例: gemini-call claude --version"
    echo ""
    echo "已安装的CLI工具:"
    echo "  - claude: Anthropic Claude CLI (版本 2.0.37)"
    echo "  - qwen: Qwen CLI (版本 0.3.0)"
    echo "  - iflow: iFlow CLI (版本 0.3.9)"
    echo "  - codebuddy: CodeBuddy CLI (版本 2.10.0)"
    echo "  - codex: Codex CLI (版本 0.63.0)"
    echo "  - copilot: Copilot CLI (版本 0.0.350)"
    exit 1
fi

# 获取要调用的CLI名称
CLI_NAME="$1"
shift

# 根据CLI名称调用相应的命令
case "$CLI_NAME" in
    "claude")
        echo "调用 Claude CLI: claude $*"
        echo "--------------------------------------------------"
        claude "$@"
        ;;
    "qwen")
        echo "调用 Qwen CLI: qwen $*"
        echo "--------------------------------------------------"
        qwen "$@"
        ;;
    "iflow")
        echo "调用 iFlow CLI: iflow $*"
        echo "--------------------------------------------------"
        iflow "$@"
        ;;
    "codebuddy")
        echo "调用 CodeBuddy CLI: codebuddy $*"
        echo "--------------------------------------------------"
        codebuddy "$@"
        ;;
    "codex")
        echo "调用 Codex CLI: codex $*"
        echo "--------------------------------------------------"
        codex "$@"
        ;;
    "copilot")
        echo "调用 Copilot CLI: copilot $*"
        echo "--------------------------------------------------"
        copilot "$@"
        ;;
    *)
        echo "错误: 未知的CLI工具 '$CLI_NAME'"
        echo "请使用以下工具之一: claude, qwen, iflow, codebuddy, codex, copilot"
        exit 1
        ;;
esac