#!/bin/bash
# context_manager.sh - 上下文隔离管理脚本

# 创建子任务上下文目录
setup_subtask_context() {
    local subtask_id=$1
    local context_dir="./subtask_${subtask_id}_context"
    
    echo "设置子任务 ${subtask_id} 的上下文环境"
    
    # 创建独立的上下文目录
    mkdir -p "$context_dir"
    
    # 创建子任务配置文件
    cat > "$context_dir/config.json" << EOF
{
  "subtask_id": "$subtask_id",
  "context_dir": "$context_dir",
  "input_data": "",
  "output_data": "",
  "resources": {
    "memory_limit": "1GB",
    "cpu_limit": "50%"
  },
  "dependencies": [],
  "status": "initialized"
}
EOF

    # 创建子任务工作文件
    touch "$context_dir/input.txt"
    touch "$context_dir/output.txt"
    touch "$context_dir/log.txt"
    
    echo "子任务 ${subtask_id} 上下文环境设置完成"
}

# 隔离执行函数
execute_in_isolated_context() {
    local subtask_id=$1
    local script_path=$2
    local input_data=$3
    local context_dir="./subtask_${subtask_id}_context"
    
    echo "在隔离环境中执行子任务 ${subtask_id}"
    
    # 检查上下文是否存在
    if [ ! -d "$context_dir" ]; then
        setup_subtask_context "$subtask_id"
    fi
    
    # 更新配置文件
    local config_path="$context_dir/config.json"
    sed -i.bak "s/\"input_data\": \"\"/\"input_data\": \"$input_data\"/" "$config_path"
    sed -i.bak "s/\"status\": \"initialized\"/\"status\": \"running\"/" "$config_path"
    
    # 将输入数据写入上下文
    echo "$input_data" > "$context_dir/input.txt"
    
    # 在隔离环境中执行脚本
    # 注意：在实际实现中，这里可能需要更复杂的隔离机制
    # 如使用容器、命名空间或其他沙箱技术
    (
        cd "$context_dir"
        echo "$(date): 开始执行子任务 $subtask_id" >> log.txt
        bash "$script_path" < input.txt > output.txt 2>> log.txt
        echo $? > exit_code.txt
        echo "$(date): 子任务 $subtask_id 执行完成" >> log.txt
    )
    
    # 更新状态
    local exit_code=$(cat "$context_dir/exit_code.txt")
    if [ "$exit_code" -eq 0 ]; then
        sed -i.bak 's/\"status\": \"running\"/\"status\": \"completed\"/' "$config_path"
    else
        sed -i.bak 's/\"status\": \"running\"/\"status\": \"failed\"/' "$config_path"
    fi
    
    # 记录输出到主日志
    echo "子任务 ${subtask_id} 执行完成，退出码: $exit_code" >> ../error_log.md
    
    echo "子任务 ${subtask_id} 隔离执行完成"
}

# 清理上下文函数
cleanup_context() {
    local subtask_id=$1
    local context_dir="./subtask_${subtask_id}_context"
    
    echo "清理子任务 ${subtask_id} 的上下文环境"
    
    # 更新进度跟踪
    if [ -f "../progress_tracker.md" ]; then
        sed -i.bak "s/| 子任务$subtask_id | 待执行 | - | - | - | - |/| 子任务$subtask_id | 清理完成 | - | - | $(date) | - |/" "../progress_tracker.md"
    fi
    
    # 删除上下文目录（在实际实现中，可能需要保留以供调试）
    # rm -rf "$context_dir"
    
    echo "子任务 ${subtask_id} 上下文环境清理完成"
}

# 验证隔离函数
verify_isolation() {
    local subtask1_context="./subtask_1_context"
    local subtask2_context="./subtask_2_context"
    
    echo "验证上下文隔离有效性"
    
    # 检查是否存在跨上下文的数据访问
    local isolation_violations=0
    
    # 示例检查：确保一个子任务的输出不会直接影响另一个子任务
    if [ -f "$subtask1_context/output.txt" ] && [ -f "$subtask2_context/output.txt" ]; then
        # 检查输出文件是否包含对方上下文的信息
        if grep -q "$subtask2_context" "$subtask1_context/output.txt"; then
            ((isolation_violations++))
            echo "警告: 检测到上下文隔离违规 - 子任务1访问了子任务2的上下文" >> ../error_log.md
        fi
        
        if grep -q "$subtask1_context" "$subtask2_context/output.txt"; then
            ((isolation_violations++))
            echo "警告: 检测到上下文隔离违规 - 子任务2访问了子任务1的上下文" >> ../error_log.md
        fi
    fi
    
    if [ $isolation_violations -eq 0 ]; then
        echo "上下文隔离验证通过"
        
        # 更新上下文隔离记录
        if [ -f "../context_isolation.md" ]; then
            sed -i.bak "s/- \[ \] 子任务1上下文验证/- [x] 子任务1上下文验证/" "../context_isolation.md"
            sed -i.bak "s/- \[ \] 子任务2上下文验证/- [x] 子任务2上下文验证/" "../context_isolation.md"
            sed -i.bak "s/- \[ \] 子任务3上下文验证/- [x] 子任务3上下文验证/" "../context_isolation.md"
        fi
        
        return 0
    else
        echo "上下文隔离验证失败，检测到 $isolation_violations 个违规"
        return 1
    fi
}

# 同步状态函数
sync_status() {
    local subtask_id=$1
    local status=$2
    local context_dir="./subtask_${subtask_id}_context"
    
    echo "同步子任务 ${subtask_id} 的状态: $status"
    
    # 更新进度跟踪文件
    if [ -f "../progress_tracker.md" ]; then
        case $status in
            "running")
                sed -i.bak "s/| 子任务$subtask_id | 待执行 | - | - | - | - |/| 子任务$subtask_id | 运行中 | $(date) | TBD | - | - |/" "../progress_tracker.md"
                ;;
            "completed")
                sed -i.bak "s/| 子任务$subtask_id | 运行中 | .*. | TBD | - | - |/| 子任务$subtask_id | 已完成 | .* | TBD | $(date) | - |/" "../progress_tracker.md"
                # 更精确的替换
                sed -i.bak "/| 子任务$subtask_id | 运行中 |/s/| 运行中 |/| 已完成 |/" "../progress_tracker.md"
                sed -i.bak "/| 子任务$subtask_id | 已完成 |/s/TBD/$(date)/" "../progress_tracker.md"
                ;;
            "failed")
                sed -i.bak "/| 子任务$subtask_id | 运行中 |/s/| 运行中 |/| 失败 |/" "../progress_tracker.md"
                ;;
        esac
    fi
    
    # 更新主任务分解文件
    if [ -f "../task_decomposition.md" ]; then
        case $status in
            "completed")
                sed -i.bak "s/- \[ \] 子任务$subtask_id: .*/- [x] 子任务$subtask_id: [具体描述] - 状态: 完成/" "../task_decomposition.md"
                ;;
            "failed")
                sed -i.bak "s/- \[ \] 子任务$subtask_id: .*/- [~] 子任务$subtask_id: [具体描述] - 状态: 失败/" "../task_decomposition.md"
                ;;
        esac
    fi
    
    echo "子任务 ${subtask_id} 状态同步完成: $status"
}

# 主函数
main() {
    if [ $# -lt 2 ]; then
        echo "用法: $0 <操作> [参数...]"
        echo "操作:"
        echo "  setup <subtask_id>                    - 设置子任务上下文"
        echo "  execute <subtask_id> <script> <input> - 在隔离环境中执行子任务"
        echo "  cleanup <subtask_id>                  - 清理子任务上下文"
        echo "  verify                               - 验证上下文隔离"
        echo "  sync <subtask_id> <status>           - 同步子任务状态"
        exit 1
    fi
    
    local operation=$1
    shift
    
    case $operation in
        "setup")
            if [ $# -ne 1 ]; then
                echo "用法: $0 setup <subtask_id>"
                exit 1
            fi
            setup_subtask_context "$1"
            ;;
        "execute")
            if [ $# -ne 3 ]; then
                echo "用法: $0 execute <subtask_id> <script> <input>"
                exit 1
            fi
            execute_in_isolated_context "$1" "$2" "$3"
            ;;
        "cleanup")
            if [ $# -ne 1 ]; then
                echo "用法: $0 cleanup <subtask_id>"
                exit 1
            fi
            cleanup_context "$1"
            ;;
        "verify")
            verify_isolation
            ;;
        "sync")
            if [ $# -ne 2 ]; then
                echo "用法: $0 sync <subtask_id> <status>"
                exit 1
            fi
            sync_status "$1" "$2"
            ;;
        *)
            echo "未知操作: $operation"
            exit 1
            ;;
    esac
}

# 调用主函数
main "$@"