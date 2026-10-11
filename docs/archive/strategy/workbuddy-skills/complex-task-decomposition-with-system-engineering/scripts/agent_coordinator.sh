#!/bin/bash
# agent_coordinator.sh - 并发智能体协调器

# 导入其他脚本的功能
source context_manager.sh 2>/dev/null || true

# 全局变量
AGENT_STATUS_FILE="agent_status.json"
COORDINATION_LOG="coordination_log.md"

# 初始化协调器
init_coordinator() {
    echo "初始化并发智能体协调器"
    
    # 创建状态文件
    cat > "$AGENT_STATUS_FILE" << EOF
{
  "coordinator": {
    "status": "initialized",
    "start_time": "$(date)",
    "active_agents": 0,
    "completed_agents": 0,
    "failed_agents": 0
  },
  "agents": {}
}
EOF

    # 创建协调日志
    cat > "$COORDINATION_LOG" << EOF
# 协调日志

## 会话信息
- 开始时间: $(date)
- 协调器状态: 初始化完成

## 事件日志
- $(date): 协调器启动
EOF

    echo "协调器初始化完成"
}

# 分配子任务给智能体
assign_task_to_agent() {
    local agent_id=$1
    local task_desc=$2
    local dependencies=$3  # 逗号分隔的依赖任务ID
    
    echo "为智能体 $agent_id 分配任务: $task_desc"
    
    # 更新状态文件
    local agent_entry="{\"task_desc\": \"$task_desc\", \"status\": \"assigned\", \"dependencies\": \"$dependencies\", \"start_time\": \"\", \"end_time\": \"\", \"result\": \"\"}"
    
    # 使用临时文件更新JSON
    jq --arg id "$agent_id" --argjson entry "$agent_entry" '.agents[$id] = $entry' "$AGENT_STATUS_FILE" > temp.json && mv temp.json "$AGENT_STATUS_FILE"
    
    # 记录到日志
    echo "- $(date): 为智能体 $agent_id 分配任务 '$task_desc'" >> "$COORDINATION_LOG"
    
    # 更新进度跟踪
    if [ -f "progress_tracker.md" ]; then
        sed -i.bak "s/| 子任务$agent_id | 待执行 |/| 子任务$agent_id | 已分配 |/" "progress_tracker.md"
    fi
    
    echo "任务分配完成"
}

# 启动智能体
launch_agent() {
    local agent_id=$1
    local task_script=$2
    local input_data=$3
    
    echo "启动智能体 $agent_id 执行任务"
    
    # 更新状态
    jq --arg id "$agent_id" --arg time "$(date)" '.agents[$id].status = "running" | .agents[$id].start_time = $time | .coordinator.active_agents += 1' "$AGENT_STATUS_FILE" > temp.json && mv temp.json "$AGENT_STATUS_FILE"
    
    # 记录到日志
    echo "- $(date): 启动智能体 $agent_id" >> "$COORDINATION_LOG"
    
    # 在后台运行智能体（模拟并发）
    (
        # 设置上下文隔离
        setup_subtask_context "$agent_id"
        
        # 执行任务
        execute_in_isolated_context "$agent_id" "$task_script" "$input_data"
        
        # 获取结果
        local result
        if [ -f "./subtask_${agent_id}_context/output.txt" ]; then
            result=$(cat "./subtask_${agent_id}_context/output.txt")
        else
            result="No output"
        fi
        
        # 更新状态
        local end_time=$(date)
        jq --arg id "$agent_id" --arg result "$result" --arg end_time "$end_time" '
            .agents[$id].status = "completed" | 
            .agents[$id].end_time = $end_time | 
            .agents[$id].result = $result |
            .coordinator.active_agents -= 1 |
            .coordinator.completed_agents += 1
        ' "$AGENT_STATUS_FILE" > temp.json && mv temp.json "$AGENT_STATUS_FILE"
        
        # 更新进度
        sync_status "$agent_id" "completed"
        
        # 记录完成事件
        echo "- $(date): 智能体 $agent_id 完成任务" >> "$COORDINATION_LOG"
    ) &
    
    echo "智能体 $agent_id 已启动（后台运行）"
}

# 检查依赖是否满足
check_dependencies_met() {
    local dependencies=$1  # 逗号分隔的依赖任务ID
    
    if [ -z "$dependencies" ] || [ "$dependencies" = "none" ]; then
        echo "true"
        return
    fi
    
    # 分割依赖项
    IFS=',' read -ra deps <<< "$dependencies"
    
    for dep in "${deps[@]}"; do
        # 检查依赖任务是否完成
        local dep_status=$(jq -r ".agents[\"$dep\"].status" "$AGENT_STATUS_FILE" 2>/dev/null)
        if [ "$dep_status" != "completed" ]; then
            echo "false"
            return
        fi
    done
    
    echo "true"
}

# 等待所有智能体完成
wait_for_all_agents() {
    echo "等待所有智能体完成..."
    
    local active_agents
    while true; do
        active_agents=$(jq -r '.coordinator.active_agents' "$AGENT_STATUS_FILE")
        if [ "$active_agents" -eq 0 ]; then
            break
        fi
        echo "仍有 $active_agents 个智能体在运行，等待中..."
        sleep 2
    done
    
    echo "所有智能体已完成"
    
    # 更新协调日志
    echo "- $(date): 所有智能体完成执行" >> "$COORDINATION_LOG"
}

# 聚合结果
aggregate_results() {
    echo "聚合智能体执行结果"
    
    # 创建结果聚合文件
    local results_file="aggregated_results.md"
    cat > "$results_file" << EOF
# 智能体执行结果聚合

## 执行摘要
- 总智能体数: $(jq '.coordinator.completed_agents + .coordinator.failed_agents' "$AGENT_STATUS_FILE")
- 成功完成: $(jq '.coordinator.completed_agents' "$AGENT_STATUS_FILE")
- 执行失败: $(jq '.coordinator.failed_agents' "$AGENT_STATUS_FILE")

## 各智能体结果
EOF

    # 遍历所有智能体并添加结果
    jq -r 'to_entries[] | select(.key != "coordinator") | "### 智能体 \(.key)\n- 任务: \(.value.task_desc)\n- 状态: \(.value.status)\n- 开始时间: \(.value.start_time)\n- 结束时间: \(.value.end_time)\n- 结果摘要: \(.value.result | .[0:100])..."' "$AGENT_STATUS_FILE" >> "$results_file"
    
    # 更新任务分解文件
    if [ -f "task_decomposition.md" ]; then
        sed -i.bak "s/- \[ \] 子任务执行 - 状态: 待执行/- [x] 子任务执行 - 状态: 完成/" "task_decomposition.md"
        sed -i.bak "s/- \[ \] 结果聚合 - 状态: 待执行/- [x] 结果聚合 - 状态: 完成/" "task_decomposition.md"
    fi
    
    echo "结果聚合完成，保存到 $results_file"
}

# 检查任务完成状态
check_completion_status() {
    local total_agents=$(jq '[.agents[]] | length' "$AGENT_STATUS_FILE")
    local completed_agents=$(jq '.coordinator.completed_agents' "$AGENT_STATUS_FILE")
    local failed_agents=$(jq '.coordinator.failed_agents' "$AGENT_STATUS_FILE")
    
    echo "任务完成状态:"
    echo "- 总计: $total_agents"
    echo "- 完成: $completed_agents" 
    echo "- 失败: $failed_agents"
    
    if [ "$completed_agents" -eq "$total_agents" ] && [ "$failed_agents" -eq 0 ]; then
        echo "所有任务成功完成！"
        return 0
    elif [ "$failed_agents" -gt 0 ]; then
        echo "存在任务失败，需要处理错误！"
        return 1
    else
        echo "任务仍在进行中..."
        return 2
    fi
}

# 错误处理
handle_agent_error() {
    local agent_id=$1
    local error_msg=$2
    
    echo "处理智能体 $agent_id 的错误: $error_msg"
    
    # 更新状态
    jq --arg id "$agent_id" --arg error "$error_msg" --arg end_time "$(date)" '
        .agents[$id].status = "failed" | 
        .agents[$id].end_time = $end_time | 
        .agents[$id].error = $error |
        .coordinator.active_agents -= 1 |
        .coordinator.failed_agents += 1
    ' "$AGENT_STATUS_FILE" > temp.json && mv temp.json "$AGENT_STATUS_FILE"
    
    # 记录错误到日志
    echo "- $(date): 智能体 $agent_id 执行失败 - $error_msg" >> "$COORDINATION_LOG"
    
    # 更新错误日志
    if [ -f "error_log.md" ]; then
        echo "- $(date): 智能体 $agent_id 执行失败" >> "error_log.md"
        echo "  错误信息: $error_msg" >> "error_log.md"
    fi
    
    # 更新进度
    sync_status "$agent_id" "failed"
    
    echo "错误处理完成"
}

# 主函数
main() {
    if [ $# -lt 1 ]; then
        echo "用法: $0 <操作> [参数...]"
        echo "操作:"
        echo "  init                                   - 初始化协调器"
        echo "  assign <agent_id> <task> <deps>        - 分配任务给智能体"
        echo "  launch <agent_id> <script> <input>     - 启动智能体"
        echo "  wait                                  - 等待所有智能体完成"
        echo "  aggregate                             - 聚合结果"
        echo "  check                                 - 检查完成状态"
        echo "  error <agent_id> <msg>                - 处理智能体错误"
        echo "  dependencies <deps_list>              - 检查依赖是否满足"
        exit 1
    fi
    
    local operation=$1
    shift
    
    case $operation in
        "init")
            init_coordinator
            ;;
        "assign")
            if [ $# -ne 3 ]; then
                echo "用法: $0 assign <agent_id> <task> <deps>"
                exit 1
            fi
            assign_task_to_agent "$1" "$2" "$3"
            ;;
        "launch")
            if [ $# -ne 3 ]; then
                echo "用法: $0 launch <agent_id> <script> <input>"
                exit 1
            fi
            launch_agent "$1" "$2" "$3"
            ;;
        "wait")
            wait_for_all_agents
            ;;
        "aggregate")
            aggregate_results
            ;;
        "check")
            check_completion_status
            ;;
        "error")
            if [ $# -ne 2 ]; then
                echo "用法: $0 error <agent_id> <msg>"
                exit 1
            fi
            handle_agent_error "$1" "$2"
            ;;
        "dependencies")
            if [ $# -ne 1 ]; then
                echo "用法: $0 dependencies <deps_list>"
                exit 1
            fi
            check_dependencies_met "$1"
            ;;
        *)
            echo "未知操作: $operation"
            exit 1
            ;;
    esac
}

# 调用主函数
main "$@"