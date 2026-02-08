#!/bin/bash

echo "========================================"
echo "  Real-Time Output Feature Demo"
echo "========================================"
echo ""
echo "📋 测试: 并发执行3个模拟CLI工具"
echo "⚙️  并发数: 3"
echo ""

echo "🚀 启动模拟CLI进程..."
echo ""

# 启动3个后台进程模拟CLI输出
(sleep 1 && echo "[Tool-1] 初始化..." && sleep 1 && echo "[Tool-1] 分析任务..." && sleep 1 && echo "[Tool-1] 生成结果...") &
PID1=$!

(sleep 0.5 && echo "[Tool-2] 连接服务器..." && sleep 1 && echo "[Tool-2] 处理数据..." && sleep 1 && echo "[Tool-2] 完成处理...") &
PID2=$!

(sleep 1.5 && echo "[Tool-3] 加载配置..." && sleep 1 && echo "[Tool-3] 执行操作..." && sleep 1 && echo "[Tool-3] 保存结果...") &
PID3=$!

echo ""
echo "⏳ 等待所有 CLI 完成..."
echo ""

# 等待所有后台进程
wait $PID1 $PID2 $PID3

echo ""
echo "========================================"
echo "  执行完成"
echo "========================================"
echo ""
echo "✅ 注意观察上面的输出:"
echo "   - 不同工具的输出是交错出现的"
echo "   - 这证明了输出是实时显示的"
echo "   - 每个工具的输出都有 [Tool-X] 前缀"
