#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLI集成演示
展示如何将钩子系统集成到实际的CLI工具中
"""

import sys
import argparse
from cli_hook_system import HookRegistry, SmartRoutingHook


def simulate_original_cli(cli_name: str, user_input: str):
    """模拟原始CLI的行为"""
    print(f"[{cli_name}] 原始功能: {user_input}")
    # 这里是原始CLI工具的逻辑
    if cli_name == "qwen":
        print(f"🤖 Qwen正在处理: {user_input}")
    elif cli_name == "claude":
        print(f"🧠 Claude正在处理: {user_input}")
    elif cli_name == "gemini":
        print(f"🔍 Gemini正在处理: {user_input}")
    elif cli_name == "codebuddy":
        print(f"💻 CodeBuddy正在处理: {user_input}")
    else:
        print(f"⚙️  {cli_name}正在处理: {user_input}")


def enhanced_cli_main(cli_name: str, user_input: str):
    """
    增强版CLI主函数 - 集成了路由钩子
    """
    print(f"🔌 {cli_name} - 启动增强功能...")
    
    # 1. 初始化钩子系统
    registry = HookRegistry()
    routing_hook = SmartRoutingHook(cli_name)
    registry.register_cli_hook(cli_name, routing_hook)
    
    # 2. 检查是否需要路由
    hook_result = registry.process_input_for_cli(cli_name, user_input)
    
    if hook_result['should_intercept']:
        print(f"✅ 由钩子系统处理路由请求")
        # 路由已处理完毕
        return hook_result
    else:
        print(f"🔄 无路由意图，执行原始功能...")
        # 执行原始CLI逻辑
        simulate_original_cli(cli_name, user_input)
        return {
            'should_intercept': False,
            'original_input': user_input,
            'handled_by': 'original_cli'
        }


def demo_integration():
    """演示集成效果"""
    print("🚀 CLI智能路由集成演示")
    print("=" * 60)
    
    demo_scenarios = [
        ("qwen", "用gemini帮我翻译这段文字: Hello world"),
        ("claude", "让kimi帮我写一段Python代码"),
        ("gemini", "请qwen分析这段代码的性能"),
        ("codebuddy", "用claude帮我优化这段代码"),
        ("qwen", "正常的Qwen请求，不要路由"),  # 应该走原始路径
    ]
    
    for cli_name, demo_input in demo_scenarios:
        print(f"\n--- 演示场景: {cli_name} '{demo_input}' ---")
        result = enhanced_cli_main(cli_name, demo_input)
        print(f"处理结果: {result.get('handled_by', 'unknown')}")
        print()


def create_patch_examples():
    """创建补丁示例"""
    patch_content = """
# 如何将智能路由功能集成到现有CLI工具

## 方法1: 修改CLI主函数入口

在您的CLI工具的主函数中：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
from cli_hook_system import HookRegistry, SmartRoutingHook

def main():
    # 获取原始输入
    if len(sys.argv) < 2:
        print("用法: your_cli_tool <command>")
        return
    
    user_input = ' '.join(sys.argv[1:])
    
    # 1. 初始化路由钩子系统
    registry = HookRegistry()
    routing_hook = SmartRoutingHook("your_cli_name")
    registry.register_cli_hook("your_cli_name", routing_hook)
    
    # 2. 检查是否需要智能路由
    hook_result = registry.process_input_for_cli("your_cli_name", user_input)
    
    if hook_result['should_intercept']:
        # 智能路由已处理，结束
        print("路由处理完成")
        return
    else:
        # 执行原始CLI逻辑
        # 原有的CLI处理逻辑在这里
        original_cli_logic(user_input)

def original_cli_logic(input_text):
    # 您的原始CLI工具逻辑
    pass

if __name__ == "__main__":
    main()
```

## 方法2: 创建装饰器模式

```python
from functools import wraps
from cli_hook_system import HookRegistry, SmartRoutingHook

def with_smart_routing(cli_name):
    def decorator(cli_function):
        @wraps(cli_function)
        def wrapper(*args, **kwargs):
            # 获取输入（根据您的输入方式调整）
            user_input = kwargs.get('input_text', '')
            
            # 初始化路由系统
            registry = HookRegistry()
            routing_hook = SmartRoutingHook(cli_name)
            registry.register_cli_hook(cli_name, routing_hook)
            
            # 检查路由
            hook_result = registry.process_input_for_cli(cli_name, user_input)
            
            if hook_result['should_intercept']:
                return hook_result
            else:
                # 执行原始功能
                return cli_function(*args, **kwargs)
        return wrapper
    return decorator

# 使用装饰器
@with_smart_routing("your_cli_name")
def your_cli_function(input_text):
    # 原始功能
    pass
```

## 方法3: 配置文件模式

创建配置文件 `cli_routing_config.json`：
```json
{
  "hooks": [
    {
      "cli_name": "qwen",
      "enable_smart_routing": true,
      "routing_rules": ["gemini", "claude", "kimi"]
    },
    {
      "cli_name": "claude", 
      "enable_smart_routing": true,
      "routing_rules": ["qwen", "gemini", "codebuddy"]
    }
  ]
}
```

然后在CLI启动时读取配置：
```python
import json

def load_routing_config():
    try:
        with open('cli_routing_config.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
        return config
    except FileNotFoundError:
        # 默认配置
        return {"hooks": []}
```
"""
    
    with open("ROUTING_INTEGRATION_GUIDE.md", "w", encoding="utf-8") as f:
        f.write(patch_content)


def create_integration_script():
    """创建自动集成脚本"""
    script_content = '''#!/bin/bash
# 自动集成脚本示例
# 将置此脚本将智能路由功能添加到现有的CLI工具中

echo "🔌 开始集成智能路由功能..."

CLI_NAME="$1"
CLI_FILE_PATH="$2"

if [ -z "$CLI_NAME" ] || [ -z "$CLI_FILE_PATH" ]; then
    echo "用法: $0 <cli_name> <cli_file_path>"
    echo "示例: $0 qwen /path/to/qwen_cli.py"
    exit 1
fi

echo "正在为 $CLI_NAME 集成路由功能到 $CLI_FILE_PATH"

# 备份原文件
cp "$CLI_FILE_PATH" "${CLI_FILE_PATH}.backup"
echo "备份原文件到: ${CLI_FILE_PATH}.backup"

# 在目标文件中插入路由代码（这是一个简化的示例）
# 实际应用中需要更精细的代码注入逻辑
sed -i.bak \'1i\\
# 路由系统导入\\\\n
from cli_hook_system import HookRegistry, SmartRoutingHook\\\\n
\\' "$CLI_FILE_PATH"

sed -i.bak \'s/main()/{\\\\n    # 智能路由集成\\\\n    registry = HookRegistry()\\\\n    routing_hook = SmartRoutingHook("$CLI_NAME")\\\\n    registry.register_cli_hook("$CLI_NAME", routing_hook)\\\\n\\\
    import sys\\\\n    user_input = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else ""\\\\n\\\
    hook_result = registry.process_input_for_cli("$CLI_NAME", user_input)\\\\n\\\
    if hook_result["should_intercept"]:\\\\n        return\\\\n    else:\\\\n        # 原始main逻辑\\\\n        main_original()/g\' "$CLI_FILE_PATH"

echo "✅ 集成完成！"
echo "原始文件已备份为: ${CLI_FILE_PATH}.backup"
echo "更新后的文件: $CLI_FILE_PATH"
'''
    
    with open("auto_integrate.sh", "w", encoding="utf-8") as f:
        f.write(script_content)
    
    # Make it executable (on Unix systems)
    try:
        import os
        os.chmod("auto_integrate.sh", 0o755)
        print("✅ 集成脚本已创建: auto_integrate.sh")
    except:
        print("⚠️  脚本已创建: auto_integrate.sh (需手动设置执行权限)")


def main():
    """主函数"""
    print("🎯 CLI智能路由集成解决方案")
    print("=" * 60)
    
    print("\n1. 演示集成效果:")
    demo_integration()
    
    print("\n2. 创建集成文档:")
    create_patch_examples()
    print("   ✅ 集成指南已创建: ROUTING_INTEGRATION_GUIDE.md")
    
    print("\n3. 创建自动集成脚本:")
    create_integration_script()
    
    print("\n4. 智能路由功能已准备就绪！")
    
    print("\n📋 集成功能特点:")
    print("   • 自然语言路由识别 ('用gemini帮我...')")
    print("   • 保持原有功能兼容")
    print("   • 灵活的钩子系统架构")
    print("   • 支持多种CLI工具集成")
    print("   • 可配置的路由规则")
    
    print("\n💡 集成步骤:")
    print("   1. 在您的CLI工具中导入HookRegistry和SmartRoutingHook")
    print("   2. 初始化路由钩子系统")
    print("   3. 检查用户输入是否需要路由")
    print("   4. 如需要路由则执行，否则执行原始逻辑")


if __name__ == "__main__":
    main()