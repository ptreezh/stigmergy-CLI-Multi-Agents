#!/bin/bash

# stigmergy@1.3.77-beta.0 安装验证脚本
# 快速验证npm安装是否成功

echo "========================================="
echo "  stigmergy@1.3.77-beta.0 安装验证"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $2${NC}"
        FAILED=$((FAILED + 1))
    fi
}

echo "📦 测试 1: 包安装验证"
echo "===================="

# 检查全局安装目录
NPM_GLOBAL="$HOME/AppData/Roaming/npm/node_modules/stigmergy"
if [ -d "$NPM_GLOBAL" ]; then
    test 0 "全局安装目录存在"
else
    test 1 "全局安装目录存在"
fi

# 检查package.json版本
VERSION=$(cat "$NPM_GLOBAL/package.json" 2>/dev/null | grep '"version"' | head -1 | cut -d'"' -f4)
if [ "$VERSION" = "1.3.77-beta.0" ]; then
    test 0 "版本号正确 ($VERSION)"
else
    test 1 "版本号正确 (实际: $VERSION)"
fi

echo ""
echo "📊 测试 2: iflow Bundle验证"
echo "========================="

# 检查config-bundle.json
BUNDLE_FILE="$NPM_GLOBAL/config/bundle/iflow-bundle/config-bundle.json"
if [ -f "$BUNDLE_FILE" ]; then
    BUNDLE_SIZE=$(stat -c%s "$BUNDLE_FILE" 2>/dev/null || stat -f%z "$BUNDLE_FILE" 2>/dev/null || echo "0")
    if [ $BUNDLE_SIZE -gt 400000 ]; then
        test 0 "iflow bundle存在且大小正确 (${BUNDLE_SIZE} bytes)"
    else
        test 1 "iflow bundle大小正确 (${BUNDLE_SIZE} bytes)"
    fi
else
    test 1 "iflow bundle文件存在"
fi

# 检查deployment-manifest.json
MANIFEST_FILE="$NPM_GLOBAL/config/bundle/iflow-bundle/deployment-manifest.json"
if [ -f "$MANIFEST_FILE" ]; then
    test 0 "deployment-manifest.json存在"
else
    test 1 "deployment-manifest.json存在"
fi

echo ""
echo "🎯 测试 3: Stigmergy Skills验证"
echo "=============================="

# 检查技能目录
SKILLS=("planning-with-files" "resumesession" "strict-test-skill" "using-superpowers")
for skill in "${SKILLS[@]}"; do
    if [ -d "$NPM_GLOBAL/skills/$skill" ]; then
        test 0 "技能 $skill 存在"
    else
        test 1 "技能 $skill 存在"
    fi
done

echo ""
echo "🔌 测试 4: 自动部署验证"
echo "===================="

# 检查qwen的agents
QWEN_AGENTS="$HOME/.qwen/agents"
if [ -d "$QWEN_AGENTS" ]; then
    AGENT_COUNT=$(ls -1 "$QWEN_AGENTS"/*.md 2>/dev/null | wc -l)
    if [ $AGENT_COUNT -ge 20 ]; then
        test 0 "qwen agents已部署 ($AGENT_COUNT 个文件)"
    else
        test 1 "qwen agents已部署 ($AGENT_COUNT 个文件)"
    fi
else
    test 1 "qwen agents目录存在"
fi

# 检查qwen的skills
QWEN_SKILLS="$HOME/.qwen/skills"
if [ -d "$QWEN_SKILLS" ]; then
    SKILL_COUNT=$(ls -1 "$QWEN_SKILLS" 2>/dev/null | wc -l)
    if [ $SKILL_COUNT -ge 20 ]; then
        test 0 "qwen skills已部署 ($SKILL_COUNT 个目录)"
    else
        test 1 "qwen skills已部署 ($SKILL_COUNT 个目录)"
    fi
else
    test 1 "qwen skills目录存在"
fi

# 检查关键技能
if [ -f "$QWEN_SKILLS/planning-with-files/SKILL.md" ]; then
    test 0 "planning-with-files技能已部署"
else
    test 1 "planning-with-files技能已部署"
fi

if [ -f "$QWEN_SKILLS/using-superpowers/SKILL.md" ]; then
    test 0 "using-superpowers技能已部署"
else
    test 1 "using-superpowers技能已部署"
fi

echo ""
echo "⚙️  测试 5: 核心模块验证"
echo "===================="

# 检查关键模块
MODULES=(
    "$NPM_GLOBAL/src/core/ProjectStatusBoard.js"
    "$NPM_GLOBAL/src/core/HierarchicalStatusBoard.js"
    "$NPM_GLOBAL/src/core/plugins/PluginDeployer.js"
    "$NPM_GLOBAL/src/interactive/InteractiveModeController.js"
    "$NPM_GLOBAL/src/cli/commands/concurrent.js"
)

for module in "${MODULES[@]}"; do
    if [ -f "$module" ]; then
        test 0 "$(basename $module) 存在"
    else
        test 1 "$(basename $module) 存在"
    fi
done

echo ""
echo "📋 测试总结"
echo "=========="
echo ""
echo "总测试数: $TOTAL"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo "通过率: $(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  🎉 所有测试通过！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "用户可以立即使用以下功能："
    echo "  • iflow的49个专业资源"
    echo "  • 项目状态看板"
    echo "  • Superpowers插件系统"
    echo "  • 并发CLI模式"
    echo "  • 交互模式"
    echo ""
    echo "开始使用："
    echo "  stigmergy --version"
    echo "  stigmergy status"
    echo "  stigmergy interactive"
    echo ""
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ⚠️  部分测试失败${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "请检查安装或重新安装："
    echo "  npm uninstall -g stigmergy"
    echo "  npm install -g stigmergy@beta"
    echo ""
    exit 1
fi
