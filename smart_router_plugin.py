#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DSGS Context Engineering Skills - 智能路由插件系统
实现CLI内部自然语言交互和智能路由功能
"""

import os
import sys
import re
import subprocess
import json
from pathlib import Path


class SmartRouterPlugin:
    """
    智能路由插件 - 可集成到任何CLI工具中
    实现内部自然语言交互和跨工具智能路由
    """
    
    def __init__(self, cli_name: str):
        self.cli_name = cli_name
        self.config = self._load_config()
        self.route_patterns = self._initialize_patterns()
    
    def _load_config(self):
        """加载配置"""
        default_config = {
            'enabled': True,
            'routing_rules': {
                'claude': ['gemini', 'qwen', 'kimi', 'codebuddy'],
                'gemini': ['claude', 'qwen', 'kimi', 'copilot'],
                'qwen': ['gemini', 'claude', 'kimi', 'codebuddy'],
                'kimi': ['qwen', 'gemini', 'claude', 'iflow'],
                'codebuddy': ['copilot', 'qwen', 'claude', 'qoder'],
                'copilot': ['codebuddy', 'qoder', 'gemini', 'claude'],
                'qoder': ['codebuddy', 'copilot', 'iflow', 'qwen'],
                'iflow': ['kimi', 'qoder', 'copilot', 'gemini']
            },
            'languages': ['zh', 'en'],  # 支持的语言
            'max_recursion_depth': 3    # 最大递归深度防止循环路由
        }
        
        config_file = Path.home() / '.dsgs' / 'router_config.json'
        if config_file.exists():
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except:
                pass
        
        return default_config

    def _initialize_patterns(self):
        """初始化路由模式"""
        return {
            'zh': {  # 中文模式
                'claude': [
                    r'(?i)用(.*?)claude(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查)',
                    r'(?i)让(.*?)claude(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查)',
                    r'(?i)请(.*?)claude(.*?)(帮忙|写|翻译|解释|分析|优化|评估|重构|审查)',
                    r'(?i)Claude(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查)'
                ],
                'gemini': [
                    r'(?i)用(.*?)gemini(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查)',
                    r'(?i)让(.*?)gemini(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查)',
                    r'(?i)请(.*?)gemini(.*?)(帮忙|写|翻译|解释|分析|优化|评估|重构|审查)',
                    r'(?i)Gemini(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查)'
                ],
                'qwen': [
                    r'(?i)用(.*?)qwen(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)让(.*?)qwen(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)请(.*?)qwen(.*?)(帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)Qwen(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)'
                ],
                'kimi': [
                    r'(?i)用(.*?)kimi(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)让(.*?)kimi(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)请(.*?)kimi(.*?)(帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)Kimi(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    # 月之暗面别名
                    r'(?i)用(.*?)月之暗面(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)',
                    r'(?i)月之暗面(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|评估|重构|审查|生成)'
                ],
                'codebuddy': [
                    r'(?i)用(.*?)codebuddy(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|审查|修复)',
                    r'(?i)让(.*?)codebuddy(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|审查|修复)',
                    r'(?i)请(.*?)codebuddy(.*?)(帮忙|写代码|分析|优化|审查|修复)',
                    r'(?i)Codebuddy(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|审查|修复)'
                ],
                'copilot': [
                    r'(?i)用(.*?)copilot(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|审查|建议)',
                    r'(?i)让(.*?)copilot(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|审查|建议)',
                    r'(?i)请(.*?)copilot(.*?)(帮忙|写代码|分析|优化|审查|建议)',
                    r'(?i)Copilot(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|审查|建议)'
                ],
                'qoder': [
                    r'(?i)用(.*?)qoder(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|解决|调试)',
                    r'(?i)让(.*?)qoder(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|解决|调试)',
                    r'(?i)请(.*?)qoder(.*?)(帮忙|写代码|分析|优化|解决|调试)',
                    r'(?i)Qoder(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|解决|调试)',
                    # QoderCLI别名
                    r'(?i)用(.*?)qodercli(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|解决|调试)',
                    r'(?i)Qodercli(.*?)(帮我|帮我写代码|帮我分析|帮忙|写代码|分析|优化|解决|调试)'
                ],
                'iflow': [
                    r'(?i)用(.*?)iflow(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|决策|思考|建议)',
                    r'(?i)让(.*?)iflow(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|决策|思考|建议)',
                    r'(?i)请(.*?)iflow(.*?)(帮忙|写|翻译|解释|分析|优化|决策|思考|建议)',
                    r'(?i)Iflow(.*?)(帮忙|写|翻译|解释|分析|优化|决策|思考|建议)',
                    # 心流别名
                    r'(?i)用(.*?)心流(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|决策|思考|建议)',
                    r'(?i)心流(.*?)(帮我|帮我写|帮我翻译|帮我解释|帮忙|写|翻译|解释|分析|优化|决策|思考|建议)'
                ]
            },
            'en': {  # 英文模式
                'claude': [
                    r'(?i)use(.*?)claude(.*?)to(.*?)(analyze|optimize|review|explain|translate|write|refactor)',
                    r'(?i)let(.*?)claude(.*?)(analyze|optimize|review|explain|translate|write|refactor)',
                    r'(?i)ask(.*?)claude(.*?)(to)?(.*?)(analyze|optimize|review|explain|translate|write|refactor)',
                    r'(?i)Claude(.*?)(please|can you|could you)(.*?)(analyze|optimize|review|explain|translate|write|refactor)'
                ],
                'gemini': [
                    r'(?i)use(.*?)gemini(.*?)to(.*?)(analyze|optimize|review|explain|translate|write|refactor)',
                    r'(?i)let(.*?)gemini(.*?)(analyze|optimize|review|explain|translate|write|refactor)',
                    r'(?i)ask(.*?)gemini(.*?)(to)?(.*?)(analyze|optimize|review|explain|translate|write|refactor)',
                    r'(?i)Gemini(.*?)(please|can you|could you)(.*?)(analyze|optimize|review|explain|translate|write|refactor)'
                ],
                # 其他英文模式...
            }
        }
    
    def detect_routing_intent(self, user_input: str) -> dict or None:
        """
        检测路由意图
        返回: {'target_tool': str, 'instruction': str} 或 None
        """
        if not self.config['enabled']:
            return None
            
        user_lower = user_input.lower()
        
        # 按语言检测模式
        for lang, patterns_dict in self.route_patterns.items():
            for target_tool, patterns in patterns_dict.items():
                for pattern in patterns:
                    match = re.search(pattern, user_lower)
                    if match:
                        # 提取指令部分
                        matched_text = match.group(0)
                        remaining = user_input.replace(matched_text, '', 1).strip()
                        
                        # 清理多余词语
                        remaining = re.sub(r'^(?:用|让|请|请帮我|帮我|麻烦|使用|use|let|ask)\s*(?:.*?)\s*', '', remaining, re.IGNORECASE)
                        remaining = re.sub(r'(?:帮我|帮我写|帮我翻译|帮我解释|to|please|can you|could you)', '', remaining, re.IGNORECASE)
                        remaining = ' '.join(remaining.split()).strip()
                        
                        return {
                            'target_tool': target_tool,
                            'instruction': remaining,
                            'original_input': user_input
                        }
        
        return None
    
    def execute_routing(self, target_tool: str, instruction: str) -> bool:
        """
        执行路由到目标工具
        """
        try:
            # 检查目标工具是否在允许的路由列表中
            allowed_tools = self.config['routing_rules'].get(self.cli_name, [])
            if target_tool not in allowed_tools:
                print(f"❌ 路由限制: 不允许从 {self.cli_name} 路由到 {target_tool}")
                return False
            
            print(f"🔄 正在路由到: {target_tool}")
            
            # 检查目标工具是否存在
            if self._tool_exists(target_tool):
                # 执行目标工具
                cmd = [target_tool, instruction] if instruction else [target_tool]
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr, file=sys.stderr)
                
                return True
            else:
                print(f"❌ 工具不存在: {target_tool}")
                return False
                
        except Exception as e:
            print(f"❌ 路由执行失败: {e}")
            return False
    
    def _tool_exists(self, tool_name: str) -> bool:
        """检查工具是否存在"""
        try:
            subprocess.run([tool_name, '--help'], capture_output=True, timeout=5)
            return True
        except:
            return False
    
    def intercept_command(self, user_input: str) -> bool:
        """
        拦截命令 - 如果有路由意图则处理路由，否则返回False让原工具处理
        """
        route_info = self.detect_routing_intent(user_input)
        
        if route_info:
            print(f"🔄 [{self.cli_name}] 检测到路由意图")
            success = self.execute_routing(route_info['target_tool'], route_info['instruction'])
            return success
        else:
            return False  # 无路由意图，让原工具处理


def integrate_with_cli(cli_name: str, user_input: str):
    """
    与CLI工具集成的主函数
    
    使用方法：
    在您的CLI工具主函数中添加此调用：
    
    def main():
        user_input = ' '.join(sys.argv[1:])
        
        # 首先尝试路由
        if not integrate_with_cli('your_cli_name', user_input):
            # 原始功能
            original_cli_function(user_input)
    """
    plugin = SmartRouterPlugin(cli_name)
    return plugin.intercept_command(user_input)


# 使用示例
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"""
        🚀 DSGS 智能路由插件 - 使用示例
        ========================================
        
        在您的CLI工具中集成此插件：
        ```python
        from smart_router_plugin import integrate_with_cli
        
        def main():
            user_input = ' '.join(sys.argv[1:])
            
            # 首先尝试路由
            if not integrate_with_cli('qwen', user_input):
                # 原始qwen功能
                original_qwen_function(user_input)
        ```
        
        支持的路由命令示例:
        - "用gemini帮我翻译Hello World"  
        - "让claude帮我分析这段代码"
        - "请qwen帮我写Python脚本"
        - "use Gemini to explain this algorithm"
        """)
    else:
        # 测试模式
        user_cmd = ' '.join(sys.argv[1:])
        print(f"🔍 测试路由功能: '{user_cmd}'")
        
        # 使用示例CLI名称
        success = integrate_with_cli('test_cli', user_cmd)
        
        if not success:
            print("ℹ️  无路由意图，保持原始功能")
        else:
            print("✅ 路由执行完成")