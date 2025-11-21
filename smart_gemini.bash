#!/bin/bash
# 智能gemini路由器 - Bash版 - 增强版
# 系统: windows
# 可用工具: ['claude', 'gemini', 'kimi', 'qwen', 'ollama', 'codebuddy', 'qodercli', 'iflow']

USER_INPUT="$*"

# 检查是否需要智能路由
if [[ -z "$USER_INPUT" ]]; then
    echo "🎯 智能gemini路由器 - Bash版 - 增强版"
    echo "💡 原始功能: ./smart_gemini.sh '参数'"
    echo "🤖 智能路由示例:"
    echo "    ./smart_gemini.sh '用claude写代码'"
    echo "    ./smart_gemini.sh '用gemini写代码'"
    echo "    ./smart_gemini.sh '用kimi写代码'"
    echo "    ./smart_gemini.sh '用qwen写代码'"
    echo "    ./smart_gemini.sh '用ollama写代码'"
    echo "    ./smart_gemini.sh '用codebuddy写代码'"
    echo "    ./smart_gemini.sh '用qodercli写代码'"
    echo "    ./smart_gemini.sh '用iflow写代码'"
    exit 0
fi

# 智能路由检测
ROUTE_KEYWORDS="用 帮我 请 智能 ai 写 生成 解释 分析 翻译 代码 文章"
NEEDS_ROUTE=false

for keyword in $ROUTE_KEYWORDS; do
    if echo "$USER_INPUT" | grep -qi "$keyword"; then
        NEEDS_ROUTE=true
        break
    fi
done

if [ "$NEEDS_ROUTE" = false ]; then
    # 不需要路由，执行原始命令
    {cli_name} $USER_INPUT
    exit 0
fi

# 智能路由逻辑

if echo "$USER_INPUT" | grep -qi "claude"; then
    echo "🚀 智能路由到: Anthropic Claude"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/claude//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    claude.cmd "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "gemini"; then
    echo "🚀 智能路由到: Google Gemini AI"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/gemini//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    gemini.cmd "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "kimi"; then
    echo "🚀 智能路由到: 月之暗面Kimi"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/kimi//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    python kimi_wrapper.py "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "qwen"; then
    echo "🚀 智能路由到: 阿里通义千问"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/qwen//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    qwen.cmd "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "ollama"; then
    echo "🚀 智能路由到: Ollama本地模型"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/ollama//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    ollama "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "codebuddy"; then
    echo "🚀 智能路由到: CodeBuddy代码助手"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/codebuddy//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    codebuddy "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "qodercli"; then
    echo "🚀 智能路由到: QoderCLI代码生成"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/qodercli//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    qodercli "$CLEAN_INPUT"    exit 0
fi

if echo "$USER_INPUT" | grep -qi "iflow"; then
    echo "🚀 智能路由到: iFlow智能助手"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/iflow//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
    iflow.cmd "$CLEAN_INPUT"    exit 0
fi

# 默认路由到Anthropic Claude
echo "🚀 智能路由到: Anthropic Claude"
CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
claude.cmd "$CLEAN_INPUT"
