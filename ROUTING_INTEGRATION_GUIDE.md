
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
