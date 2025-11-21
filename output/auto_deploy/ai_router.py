#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能ai路由器 - Python版本
系统: windows
可用工具: ['claude', 'gemini', 'testai']
"""

import sys
import subprocess
import re
import os

class SmartRouter:
    def __init__(self):
        self.cli_name = "ai"
        self.available_tools = {'claude': True, 'gemini': True, 'testai': False}
        self.tools = {'claude': {'command': {'windows': 'claude.cmd', 'linux': 'claude', 'darwin': 'claude'}, 'description': 'Anthropic Claude', 'keywords': ['claude', 'anthropic'], 'priority': 1, 'wrapper': False}, 'gemini': {'command': {'windows': 'gemini.cmd', 'linux': 'gemini', 'darwin': 'gemini'}, 'description': 'Google Gemini AI', 'keywords': ['gemini', 'google', '谷歌'], 'priority': 2, 'wrapper': False}, 'testai': {'command': {'windows': 'testai.cmd', 'linux': 'testai', 'darwin': 'testai'}, 'description': '测试AI工具', 'keywords': ['testai', '测试'], 'priority': 3, 'wrapper': False}}
        self.route_keywords = ['用', '帮我', '请', '智能', 'ai', '写', '生成', '解释', '分析', '翻译', '代码', '文章']
        self.default_tool = "claude"
    
    def should_route(self, user_input):
        """检查是否需要智能路由"""
        return any(keyword.lower() in user_input.lower() for keyword in self.route_keywords)
    
    def smart_route(self, user_input):
        """智能路由到合适的工具"""
        user_input = user_input.strip()
        
        # 检测工具关键词
        for tool_name, tool_info in self.tools.items():
            if not self.available_tools.get(tool_name, False):
                continue
                
            for keyword in tool_info["keywords"]:
                if keyword.lower() in user_input.lower():
                    # 提取参数
                    clean_input = re.sub(rf'.*{keyword}\s*', '', user_input, flags=re.IGNORECASE).strip()
                    clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\s*', '', clean_input, flags=re.IGNORECASE).strip()
                    return tool_name, [clean_input] if clean_input else []
        
        # 默认路由
        clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\s*', '', user_input, flags=re.IGNORECASE).strip()
        return self.default_tool, [clean_input] if clean_input else []
    
    def execute_tool(self, tool_name, args):
        """执行工具"""
        if tool_name not in self.tools:
            return 1, "", f"未知工具: {tool_name}"
        
        tool_info = self.tools[tool_name]
        command = tool_info["command"]["windows"]
        
        if tool_info.get("wrapper"):
            wrapper_script = tool_info.get("wrapper_script")
            cmd = ["python", wrapper_script] + args
        else:
            cmd = [command] + args
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=60)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", f"执行失败: {e}"
    
    def execute_original_cli(self, args):
        """执行原始CLI"""
        try:
            cmd = ["ai"] + args
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", f"原始CLI执行失败: {e}"

def main():
    router = SmartRouter()
    
    if len(sys.argv) < 2:
        print("🎯 智能{cli_name}路由器 - Python版本")
        print("💡 原始功能: python smart_ai.py '参数'")
        print("🤖 智能路由示例:")
        print("    python smart_ai.py '用claude写代码'")
        print("    python smart_ai.py '用gemini写代码'")
        print("    python smart_ai.py '用testai写代码'")
        return 0
    
    user_input = ' '.join(sys.argv[1:])
    
    if router.should_route(user_input):
        tool_name, args = router.smart_route(user_input)
        if tool_name and tool_name != router.cli_name:
            print(f"🚀 智能路由到: {{router.tools[tool_name]['description']}}")
            returncode, stdout, stderr = router.execute_tool(tool_name, args)
            if stdout:
                print(stdout)
            if stderr:
                print(stderr, file=sys.stderr)
            sys.exit(returncode)
    
    # 执行原始CLI
    returncode, stdout, stderr = router.execute_original_cli(sys.argv[1:])
    if stdout:
        print(stdout)
    if stderr:
        print(stderr, file=sys.stderr)
    sys.exit(returncode)

if __name__ == "__main__":
    main()
