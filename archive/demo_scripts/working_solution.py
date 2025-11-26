#!/usr/bin/env python3
"""
可工作的简化跨CLI协作解决方案
基于现有的CLI工具，实现实际的跨CLI调用功能
"""

import subprocess
import json
import re
import sys
import os
from pathlib import Path
from typing import Optional, Tuple, Dict

class WorkingCrossCLIRouter:
    """可工作的跨CLI路由器"""

    def __init__(self):
        self.home_dir = Path.home()
        self.config_file = self.home_dir / '.stigmergy-cli' / 'router.json'

        # CLI工具映射
        self.cli_tools = {
            'claude': 'claude',
            'gemini': 'gemini',
            'qwen': 'qwen',
            'iflow': 'iflow',
            'codebuddy': 'codebuddy',
            'qodercli': 'qodercli',
            'copilot': 'copilot'
        }

        # CLI名称映射（支持中英文）
        self.cli_name_mapping = {
            '克劳德': 'claude',
            '双子座': 'gemini',
            '通义': 'qwen',
            '千问': 'qwen',
            'ai流': 'iflow',
            '代码伙伴': 'codebuddy',
            '编码器': 'qodercli',
            '副驾驶': 'copilot'
        }

        # 协作关键词模式
        self.collaboration_patterns = [
            r"用(\w+)帮我(.+)",
            r"请(\w+)来(.+)",
            r"调用(\w+)(.+)",
            r"让(\w+)(.+)",
            r"use (\w+) to (.+)",
            r"call (\w+) to (.+)",
            r"ask (\w+) for (.+)"
        ]

    def detect_cross_cli_intent(self, user_input: str) -> Tuple[Optional[str], Optional[str]]:
        """
        检测跨CLI调用意图

        Returns:
            (target_cli, task) 或 (None, None)
        """
        user_input = user_input.strip()

        for pattern in self.collaboration_patterns:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                target_cli_name = match.group(1).lower()
                task = match.group(2).strip()

                # 映射CLI名称
                target_cli = self.cli_name_mapping.get(target_cli_name, target_cli_name)

                if target_cli in self.cli_tools:
                    return target_cli, task

        return None, None

    def check_cli_availability(self, cli_name: str) -> bool:
        """检查CLI工具是否可用"""
        try:
            result = subprocess.run(
                [self.cli_tools[cli_name], '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False

    def call_cli_tool(self, cli_name: str, task: str, timeout: int = 60) -> Dict:
        """
        调用CLI工具执行任务

        Returns:
            {
                'success': bool,
                'output': str,
                'error': str,
                'cli': str
            }
        """
        try:
            # 构建命令
            if cli_name == 'claude':
                cmd = [self.cli_tools[cli_name], '--print', task]
            elif cli_name == 'gemini':
                cmd = [self.cli_tools[cli_name], task]
            else:
                cmd = [self.cli_tools[cli_name], task]

            # 执行命令
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding='utf-8'
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'cli': cli_name
            }

        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': f'{cli_name} 调用超时',
                'cli': cli_name
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': f'{cli_name} 调用异常: {str(e)}',
                'cli': cli_name
            }

    def get_fallback_cli(self, primary_cli: str, task: str) -> Optional[str]:
        """获取备选CLI"""
        # 根据任务类型选择备选CLI
        task_lower = task.lower()

        if any(word in task_lower for word in ['翻译', 'translate', '翻译']):
            fallback_options = ['gemini', 'claude', 'qwen']
        elif any(word in task_lower for word in ['代码', 'code', '写代码', '编程']):
            fallback_options = ['codebuddy', 'qodercli', 'copilot', 'claude']
        elif any(word in task_lower for word in ['分析', 'analyze', '分析']):
            fallback_options = ['claude', 'gemini', 'qwen']
        elif any(word in task_lower for word in ['流程', 'workflow', '工作流']):
            fallback_options = ['iflow']
        else:
            fallback_options = ['claude', 'gemini', 'qwen']

        # 返回第一个可用的备选CLI
        for cli in fallback_options:
            if cli != primary_cli and self.check_cli_availability(cli):
                return cli

        return None

    def process_cross_cli_request(self, user_input: str, source_cli: str = None) -> Dict:
        """
        处理跨CLI请求

        Returns:
            {
                'is_cross_cli': bool,
                'target_cli': str,
                'task': str,
                'result': Dict,
                'fallback_used': bool
            }
        """
        # 检测跨CLI意图
        target_cli, task = self.detect_cross_cli_intent(user_input)

        if not target_cli:
            return {
                'is_cross_cli': False,
                'target_cli': None,
                'task': user_input,
                'result': None,
                'fallback_used': False
            }

        # 避免自我调用
        if source_cli and target_cli == source_cli:
            return {
                'is_cross_cli': False,
                'target_cli': None,
                'task': user_input,
                'result': None,
                'fallback_used': False
            }

        # 尝试主要目标CLI
        primary_result = self.call_cli_tool(target_cli, task)

        if primary_result['success']:
            return {
                'is_cross_cli': True,
                'target_cli': target_cli,
                'task': task,
                'result': primary_result,
                'fallback_used': False
            }

        # 尝试备选CLI
        fallback_cli = self.get_fallback_cli(target_cli, task)
        if fallback_cli:
            fallback_result = self.call_cli_tool(fallback_cli, task)
            if fallback_result['success']:
                return {
                    'is_cross_cli': True,
                    'target_cli': fallback_cli,
                    'task': task,
                    'result': fallback_result,
                    'fallback_used': True
                }

        # 所有CLI都失败
        return {
            'is_cross_cli': True,
            'target_cli': target_cli,
            'task': task,
            'result': primary_result,  # 返回主要失败结果
            'fallback_used': False
        }

    def format_result(self, request_result: Dict) -> str:
        """格式化输出结果"""
        if not request_result['is_cross_cli']:
            return f"🤖 本地处理: {request_result['task']}"

        target_cli = request_result['target_cli']
        task = request_result['task']
        result = request_result['result']

        if result['success']:
            output = f"""
🤖 跨CLI协作完成:
🎯 目标工具: {target_cli.upper()}
📝 执行任务: {task}
✅ 执行成功:
{result['output']}
"""
            if request_result['fallback_used']:
                output += "🔄 使用了备选CLI工具"
            return output
        else:
            return f"""
❌ 跨CLI调用失败:
🎯 目标工具: {target_cli.upper()}
📝 执行任务: {task}
💥 错误信息: {result['error']}
"""


def create_cli_wrapper(cli_name: str):
    """创建CLI包装器"""

    def wrapper():
        if len(sys.argv) < 2:
            print(f"Usage: enhanced_{cli_name} <prompt>")
            return

        user_input = ' '.join(sys.argv[1:])
        router = WorkingCrossCLIRouter()

        # 处理请求
        request_result = router.process_cross_cli_request(user_input, cli_name)

        # 格式化并输出结果
        if request_result['is_cross_cli']:
            # 跨CLI调用
            output = router.format_result(request_result)
        else:
            # 本地处理
            local_result = router.call_cli_tool(cli_name, user_input)
            if local_result['success']:
                output = f"🤖 {cli_name.upper()}结果:\n{local_result['output']}"
            else:
                output = f"❌ {cli_name.upper()}失败: {local_result['error']}"

        print(output)

    return wrapper


# 主函数
def main():
    if len(sys.argv) < 2:
        print("Usage: python working_solution.py <cli_name> <prompt>")
        print("Available CLI: claude, gemini, qwen, iflow, codebuddy, qodercli, copilot")
        return

    cli_name = sys.argv[1].lower()
    if cli_name not in WorkingCrossCLIRouter().cli_tools:
        print(f"❌ 不支持的CLI: {cli_name}")
        print(f"支持的CLI: {', '.join(WorkingCrossCLIRouter().cli_tools.keys())}")
        return

    if len(sys.argv) < 3:
        print(f"Usage: python working_solution.py {cli_name} <prompt>")
        return

    user_input = ' '.join(sys.argv[2:])
    router = WorkingCrossCLIRouter()

    # 处理请求
    request_result = router.process_cross_cli_request(user_input, cli_name)

    # 输出结果
    output = router.format_result(request_result)
    print(output)


if __name__ == "__main__":
    main()