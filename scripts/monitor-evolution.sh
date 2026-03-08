#!/bin/bash
#
# Stigmergy 进化系统实时监控
#

cd /c/bde/stigmergy

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Stigmergy 自主进化系统 - 实时监控                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 检查进程是否运行
if [ -f ~/.stigmergy/soul-state/evolution.pid ]; then
    PID=$(cat ~/.stigmergy/soul-state/evolution.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ 进化系统运行中 (PID: $PID)"
    else
        echo "⚠️  进化系统未运行"
    fi
else
    echo "⚠️  进化系统未运行"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# 显示最新进度
node scripts/track-progress.js

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📁 最新文件:"
echo ""

# 显示最新反思
LATEST_REFLECTION=$(ls -t ~/.stigmergy/soul-state/reflections/ 2>/dev/null | head -1)
if [ -n "$LATEST_REFLECTION" ]; then
    echo "🧠 最新反思: $LATEST_REFLECTION"
    REFLECTION_TIME=$(stat -c %y ~/.stigmergy/soul-state/reflections/$LATEST_REFLECTION 2>/dev/null | cut -d'.' -f1)
    echo "   时间: $REFLECTION_TIME"
    echo ""
fi

# 显示最新技能
LATEST_SKILL=$(ls -t ~/.stigmergy/soul-state/evolved-skills/ 2>/dev/null | head -1)
if [ -n "$LATEST_SKILL" ]; then
    echo "⚡ 最新技能: $LATEST_SKILL"
    SKILL_TIME=$(stat -c %y ~/.stigmergy/soul-state/evolved-skills/$LATEST_SKILL 2>/dev/null | cut -d'.' -f1)
    echo "   时间: $SKILL_TIME"

    # 显示技能内容
    echo ""
    echo "   技能内容:"
    cat ~/.stigmergy/soul-state/evolved-skills/$LATEST_SKILL | head -20
    echo "   ..."
    echo ""
fi

# 显示最新日志
LATEST_LOG=$(ls -t ~/.stigmergy/soul-state/logs/ 2>/dev/null | head -1)
if [ -n "$LATEST_LOG" ]; then
    echo "📝 最新日志: $LATEST_LOG"
    echo "   最后20行:"
    echo ""
    tail -20 ~/.stigmergy/soul-state/logs/$LATEST_LOG
    echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo ""
echo "💡 持续监控 (每10秒更新，按 Ctrl+C 退出):"
echo ""
echo "   watch -n 10 'bash scripts/monitor-evolution.sh'"
echo ""
