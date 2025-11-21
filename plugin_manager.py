#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
插件管理器 - 管理CLI工具的插件系统
"""

import os
import subprocess
import re
from typing import Dict, Any, Optional


class PluginManager:
    """插件管理器"""
    
    def __init__(self):
        """初始化插件管理器"""
        self.plugins = {}
        self.cli_bindings = {}
        
        # 预定义的路由规则
        self.routing_patterns = {
            'claude': [r'(?i)用claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                      r'(?i)让claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                      r'(?i)请claude\s*(?:帮忙|写|翻译|解释|分析|优化)'],
            'gemini': [r'(?i)用gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                      r'(?i)让gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                      r'(?i)请gemini\s*(?:帮忙|写|翻译|解释|分析|优化)'],
            'qwen': [r'(?i)用qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                    r'(?i)让qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                    r'(?i)请qwen\s*(?:帮忙|写|翻译|解释|分析|优化)'],
            'kimi': [r'(?i)用kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                    r'(?i)让kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                    r'(?i)请kimi\s*(?:帮忙|写|翻译|解释|分析|优化)'],
            'codebuddy': [r'(?i)用codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                         r'(?i)让codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                         r'(?i)请codebuddy\s*(?:帮忙|写代码|代码|分析|优化)'],
            'copilot': [r'(?i)用copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                       r'(?i)让copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                       r'(?i)请copilot\s*(?:帮忙|写代码|代码|分析|优化)'],
            'qoder': [r'(?i)用qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                     r'(?i)让qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
                     r'(?i)请qoder\s*(?:帮忙|写代码|代码|分析|优化)'],
            'iflow': [r'(?i)用iflow\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                     r'(?i)让iflow\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
                     r'(?i)请iflow\s*(?:帮忙|写|翻译|解释|分析|优化)'],
        }
        
        self.tool_commands = {
            'claude': 'claude',
            'gemini': 'gemini',
            'qwen': 'qwen',
            'kimi': 'kimi',
            'codebuddy': 'codebuddy',
            'copilot': 'gh copilot',
            'qoder': 'qoder',
            'iflow': 'iflow'
        }
    
    def register_plugin(self, plugin_name: str, plugin_instance: Any):
        """注册插件"""
        self.plugins[plugin_name] = plugin_instance
    
    def bind_cli_to_plugin(self, cli_name: str, plugin_name: str):
        """将CLI绑定到插件"""
        self.cli_bindings[cli_name] = plugin_name
    
    def extract_routing_intent(self, user_input: str) -> Optional[Dict[str, str]]:
        """提取路由意图"""
        user_lower = user_input.lower()
        
        for target_tool, patterns in self.routing_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, user_lower)
                if match:
                    # 提取剩余输入
                    remaining = re.sub(pattern, '', user_input, count=1, flags=re.IGNORECASE)
                    # 清理多余空白和关键词
                    remaining = re.sub(r'^(?:用|让|请|麻烦|帮我|帮我写|帮我翻译|帮我解释)\s*', '', remaining, flags=re.IGNORECASE).strip()
                    
                    return {
                        'target_tool': target_tool,
                        'remaining_input': remaining,
                        'original_input': user_input
                    }
        
        return None
    
    def execute_remote_command(self, target_tool: str, instruction: str) -> Dict[str, Any]:
        """执行远程命令"""
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
                cmd = cmd_parts + [instruction] if instruction else cmd_parts
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30  # 30秒超时
            )
            
            return {
                'success': result.returncode == 0,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'command': cmd,
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


# 全局插件管理器实例
plugin_manager = PluginManager()