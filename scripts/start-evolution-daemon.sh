#!/bin/bash
#
# Stigmergy Evolution Daemon
# 长时自主进化系统守护进程
#

cd /c/bde/stigmergy

echo "🚀 启动 Stigmergy 自主进化系统..."
echo "================================"
echo ""
echo "启动时间: $(date)"
echo "进程ID: $$"
echo ""

# 创建日志目录
LOG_DIR="$HOME/.stigmergy/soul-state/logs"
mkdir -p "$LOG_DIR"

# 日志文件
LOG_FILE="$LOG_DIR/evolution-$(date +%Y%m%d-%H%M%S).log"

echo "日志文件: $LOG_FILE"
echo ""

# 启动进化系统（后台运行）
nohup node scripts/start-evolution.js > "$LOG_FILE" 2>&1 &
EVOLUTION_PID=$!

echo "✅ 进化系统已启动"
echo "   进程ID: $EVOLUTION_PID"
echo "   日志文件: $LOG_FILE"
echo ""

# 保存 PID
echo "$EVOLUTION_PID" > "$HOME/.stigmergy/soul-state/evolution.pid"

echo "💡 管理命令:"
echo "   查看日志: tail -f $LOG_FILE"
echo "   停止系统: kill $EVOLUTION_PID"
echo "   查看状态: node scripts/track-progress.js"
echo ""

# 等待几秒确认启动
sleep 3

# 检查进程是否还在运行
if ps -p $EVOLUTION_PID > /dev/null; then
    echo "✅ 系统运行正常"
    echo ""
    echo "📊 实时监控 (最近20行日志):"
    echo "================================"
    tail -20 "$LOG_FILE"
else
    echo "❌ 系统启动失败，请查看日志:"
    cat "$LOG_FILE"
    exit 1
fi

echo ""
echo "🎉 自主进化系统已成功启动并持续运行！"
echo ""
echo "🔍 监控命令:"
echo "   tail -f $LOG_FILE           # 实时查看日志"
echo "   node scripts/track-progress.js  # 查看进度"
echo ""
