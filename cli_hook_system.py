#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLI钩子系统 - 智能路由钩子实现
允许在CLI内进行自然语言路由
"""

import re
import subprocess
from typing import Dict, Any, Optional


class CLIRoutingHookInterface:
    """CLI路由钩子接口"""
    
    def extract_route_info(self, user_input: str) -> Optional[Dict[str, str]]:
        """
        提取路由信息
        返回: {'target_tool': str, 'remaining_input': str, 'original_input': str} 或 None
        """
        raise NotImplementedError
    
    def execute_remote_tool(self, target_tool: str, instruction: str) -> Dict[str, Any]:
        """执行远程工具"""
        raise NotImplementedError


class SmartRoutingHook(CLIRoutingHookInterface):
    """智能路由钩子实现"""
    
    def __init__(self, cli_name: str):
        self.cli_name = cli_name
        self.route_patterns = {
            'claude': [
                r'(?i)用claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)让claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)请claude\s*(?:帮忙|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)请claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)Claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)'
            ],
            'gemini': [
                r'(?i)用gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)让gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)请gemini\s*(?:帮忙|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)请gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)Gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)'
            ],
            'qwen': [
                r'(?i)用qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)让qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)请qwen\s*(?:帮忙|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)请qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)',
                r'(?i)Qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析)'
            ],
            'kimi': [
                r'(?i)用kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析|生成)',
                r'(?i)让kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析|生成)',
                r'(?i)请kimi\s*(?:帮忙|写|翻译|解释|分析|优化|帮我分析|生成)',
                r'(?i)请kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析|生成)',
                r'(?i)Kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析|生成)',
                # 月之暗面模式
                r'(?i)用月之暗面\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析|生成)',
                r'(?i)月之暗面\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|帮我分析|生成)'
            ],
            'codebuddy': [
                r'(?i)用codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                r'(?i)让codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                r'(?i)请codebuddy\s*(?:帮忙|写代码|代码|分析|优化)',
                r'(?i)Codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)'
            ],
            'copilot': [
                r'(?i)用copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                r'(?i)让copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                r'(?i)请copilot\s*(?:帮忙|写代码|代码|分析|优化)',
                r'(?i)Copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)'
            ],
            'qoder': [
                r'(?i)用qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化|解决)',
                r'(?i)让qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化|解决)',
                r'(?i)请qoder\s*(?:帮忙|写代码|代码|分析|优化|解决)',
                r'(?i)Qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化|解决)',
                # QoderCLI模式
                r'(?i)用qodercli\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化|解决)',
                r'(?i)让qodercli\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化|解决)',
                r'(?i)请qodercli\s*(?:帮忙|写代码|代码|分析|优化|解决)',
                r'(?i)Qodercli\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化|解决)'
            ],
            'iflow': [
                r'(?i)用iflow\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|做决策|思考)',
                r'(?i)让iflow\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|做决策|思考)',
                r'(?i)请iflow\s*(?:帮忙|写|翻译|解释|分析|优化|做决策|思考)',
                r'(?i)Iflow\s*(?:帮忙|写|翻译|解释|分析|优化|做决策|思考)',
                # 心流模式
                r'(?i)用心流\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|做决策|思考)',
                r'(?i)心流\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化|做决策|思考)'
            ]
        }
        
        self.tool_commands = {
            'claude': 'claude',
            'gemini': 'gemini', 
            'qwen': 'qwen',
            'kimi': 'kimi',
            'codebuddy': 'codebuddy',
            'copilot': 'gh copilot',  # 注意: copilot通过gh命令
            'qoder': 'qoder',
            'iflow': 'iflow'
        }
    
    def extract_route_info(self, user_input: str) -> Optional[Dict[str, str]]:
        """
        从用户输入中提取路由信息
        """
        user_original = user_input
        user_lower = user_input.lower()

        for target_tool, patterns in self.route_patterns.items():
            for pattern in patterns:
                # 使用更宽松的匹配，处理大小写
                compiled_pattern = re.compile(pattern, re.IGNORECASE)
                match = compiled_pattern.search(user_lower)
                if match:
                    # 找到匹配位置并提取工具名
                    matched_text = match.group(0)

                    # 从原始输入中删除匹配的部分，保留剩余部分
                    pos = user_lower.find(matched_text.lower())
                    if pos != -1:
                        # 在原始输入中删除匹配的部分
                        before_match = user_original[:pos]
                        after_match = user_original[pos + len(matched_text):]

                        # 合并前后部分
                        remaining = (before_match + after_match).strip()
                    else:
                        # 如果没找到位置，直接删除匹配部分
                        remaining = user_original.replace(matched_text, '', 1).strip()

                    # 清理前导词和其他无关词
                    remaining = re.sub(r'^(?:用|让|请|麻烦|帮我|帮我写|帮我翻译|帮我解释|帮忙|代我|替我|使用|请用)\s*', '', remaining, flags=re.IGNORECASE).strip()

                    # 进一步清理多余的空白
                    remaining = ' '.join(remaining.split())

                    # 如果原匹配文本包含"帮我"等词，确保这些词也被清理
                    for directive in ['帮我', '帮我写', '帮我翻译', '帮我解释', '帮忙', '代我', '替我', '帮我分析', '帮我优化']:
                        remaining = remaining.replace(directive, '', 1)

                    remaining = ' '.join(remaining.split()).strip()

                    return {
                        'target_tool': target_tool,
                        'remaining_input': remaining,
                        'original_input': user_original
                    }

        return None

    def execute_remote_tool(self, target_tool: str, instruction: str) -> Dict[str, Any]:
        """执行远程工具"""
        if target_tool not in self.tool_commands:
            return {
                'success': False,
                'error': f'工具不存在: {target_tool}',
                'target_tool': target_tool,
                'instruction': instruction
            }
        
        try:
            command_template = self.tool_commands[target_tool]
            
            if target_tool == 'copilot':
                # GitHub Copilot 特殊处理
                cmd = ['gh', 'copilot', 'advise', instruction or 'help']
            else:
                # 一般工具处理
                cmd_parts = command_template.split()
                cmd = cmd_parts + [instruction] if instruction.strip() else cmd_parts
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                'success': result.returncode == 0,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'command': ' '.join(cmd),
                'target_tool': target_tool,
                'instruction': instruction
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': '命令执行超时',
                'timeout': True,
                'target_tool': target_tool,
                'instruction': instruction
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'exception_type': type(e).__name__,
                'target_tool': target_tool,
                'instruction': instruction
            }


class HookRegistry:
    """钩子注册表"""
    
    def __init__(self):
        self.hooks = {}
        self.cli_specific_hooks = {}
    
    def register_cli_hook(self, cli_name: str, hook_instance: 'SmartRoutingHook'):
        """注册特定CLI的钩子"""
        if cli_name not in self.cli_specific_hooks:
            self.cli_specific_hooks[cli_name] = []
        self.cli_specific_hooks[cli_name].append(hook_instance)
    
    def process_input_for_cli(self, cli_name: str, user_input: str) -> Dict[str, Any]:
        """
        为特定CLI处理输入
        """
        # 首先检查CLI特定钩子
        if cli_name in self.cli_specific_hooks:
            for hook in self.cli_specific_hooks[cli_name]:
                route_info = hook.extract_route_info(user_input)
                if route_info:
                    # 发现路由意图，执行路由
                    result = hook.execute_remote_tool(
                        route_info['target_tool'],
                        route_info['remaining_input']
                    )
                    
                    return {
                        'should_intercept': True,
                        'route_target': route_info['target_tool'],
                        'processed_input': route_info['remaining_input'],
                        'execution_result': result,
                        'original_input': user_input,
                        'handled_by': 'cli_specific_hook'
                    }
        
        # 没有发现路由意图，返回原始处理指示
        return {
            'should_intercept': False,
            'original_input': user_input,
            'handled_by': 'none'
        }


# 全局钩子注册表
hook_registry = HookRegistry()