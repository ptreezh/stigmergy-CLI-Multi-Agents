#!/usr/bin/env python3
"""
系统工程任务分解技能执行脚本

此脚本提供了一个接口，用于执行系统工程任务分解技能，
可以根据输入的任务描述进行智能分解，并监控token消耗。
"""

import sys
import os
import json
import argparse
from typing import Dict, Any

# 计算正确的项目根目录路径
script_dir = os.path.dirname(os.path.abspath(__file__))  # D:\stigmergy-CLI-Multi-Agents\.agent\skills\system-engineering-task-decomposition\scripts
skills_dir = os.path.dirname(script_dir)                 # D:\stigmergy-CLI-Multi-Agents\.agent\skills\system-engineering-task-decomposition
agent_dir = os.path.dirname(skills_dir)                  # D:\stigmergy-CLI-Multi-Agents\.agent\skills
parent_dir = os.path.dirname(agent_dir)                  # D:\stigmergy-CLI-Multi-Agents\.agent
project_root_dir = os.path.dirname(parent_dir)           # D:\stigmergy-CLI-Multi-Agents

print(f"Script directory: {script_dir}", file=sys.stderr)
print(f"Skills directory: {skills_dir}", file=sys.stderr)
print(f"Agent directory: {agent_dir}", file=sys.stderr)
print(f"Parent directory: {parent_dir}", file=sys.stderr)
print(f"Project root directory: {project_root_dir}", file=sys.stderr)

# 添加项目根目录到Python路径
sys.path.insert(0, project_root_dir)

try:
    from system_engineering_skill import SystemEngineeringSkill, DecompositionMethod
except ImportError as e:
    print(f"Import error: {e}", file=sys.stderr)
    # 如果直接导入失败，尝试从项目根目录导入
    import importlib.util
    skill_path = os.path.join(project_root_dir, 'system_engineering_skill.py')
    print(f"Looking for skill file at: {skill_path}", file=sys.stderr)
    if os.path.exists(skill_path):
        spec = importlib.util.spec_from_file_location("system_engineering_skill", skill_path)
        skill_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(skill_module)
        SystemEngineeringSkill = skill_module.SystemEngineeringSkill
        DecompositionMethod = skill_module.DecompositionMethod
    else:
        raise FileNotFoundError(f"Could not find system_engineering_skill.py at {skill_path}")


def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description='系统工程任务分解技能')
    parser.add_argument('--task-description', '-t', type=str, required=True,
                        help='任务描述')
    parser.add_argument('--resources', '-r', type=str, default='{}',
                        help='可用资源JSON字符串')
    parser.add_argument('--constraints', '-c', type=str, default='{}',
                        help='约束条件JSON字符串')
    parser.add_argument('--method', '-m', type=str, 
                        choices=[m.value for m in DecompositionMethod],
                        default=DecompositionMethod.HIERARCHICAL.value,
                        help='分解方法')
    parser.add_argument('--objectives', '-o', type=str, nargs='+',
                        default=['efficiency', 'quality'],
                        help='优化目标')
    parser.add_argument('--max-context', type=int, default=128000,
                        help='最大上下文大小')
    
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_arguments()
    
    try:
        # 解析JSON参数
        resources = json.loads(args.resources) if args.resources else {}
        constraints = json.loads(args.constraints) if args.constraints else {}
        
        # 创建技能实例
        skill = SystemEngineeringSkill(max_context_size=args.max_context)
        
        # 映射方法字符串到枚举
        method_map = {m.value: m for m in DecompositionMethod}
        selected_method = method_map.get(args.method, DecompositionMethod.HIERARCHICAL)
        
        # 执行任务分解
        result = skill.execute_task_decomposition(
            task_description=args.task_description,
            available_resources=resources,
            constraints=constraints,
            decomposition_method=selected_method,
            optimization_objectives=args.objectives
        )
        
        # 输出结果
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"执行错误: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()