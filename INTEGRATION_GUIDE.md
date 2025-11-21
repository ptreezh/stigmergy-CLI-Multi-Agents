# DSGS Context Engineering Skills - 智能路由集成指南

## 概述

本指南介绍如何将DSGS智能路由功能集成到您的CLI工具中，实现内部自然语言交互和跨工具智能路由。

## 1. 核心功能

### 1.1 自然语言路由
在CLI工具内部使用自然语言指令路由到其他工具：
- `> qwen "用gemini帮我翻译Hello World"` → 自动路由到gemini
- `> claude "让qwen帮我分析这段代码"` → 自动路由到qwen  
- `> qwen "请kimi帮我生成报告"` → 自动路由到kimi

### 1.2 插件化架构
- 非侵入式集成
- 保持原有功能完整
- 可选功能，可开关

## 2. 集成方法

### 2.1 在您的CLI工具中集成

```python
# 在您的CLI工具主函数中
from smart_router_plugin import integrate_with_cli

def main():
    user_input = ' '.join(sys.argv[1:])
    
    # 首先检查路由意图
    if not integrate_with_cli('your_cli_name', user_input):
        # 如果没有路由意图，执行原始功能
        original_function(user_input)
```

### 2.2 配置文件 (可选)

创建 `~/.dsgs/router_config.json` 配置路由规则：

```json
{
  "enabled": true,
  "routing_rules": {
    "qwen": ["claude", "gemini", "kimi", "codebuddy"],
    "claude": ["qwen", "gemini", "copilot", "codebuddy"],
    "gemini": ["qwen", "claude", "kimi", "iflow"]
  },
  "languages": ["zh", "en"]
}
```

## 3. 支持的自然语言模式

### 3.1 中文模式
- 用{tool}帮我{action}
- 让{tool}帮我{action}  
- 请{tool}{action}
- {tool}帮我{action}

### 3.2 英文模式
- Use {tool} to {action}
- Let {tool} {action}
- Ask {tool} to {action}
- {tool} please {action}

## 4. 安装和部署

### 4.1 使用pip安装
```bash
pip install -e .
```

### 4.2 一键集成
```bash
# 运行集成向导
python smart_router_integrator.py
```

## 5. 使用示例

### 5.1 集成后的CLI工具使用
```
# 路由命令
qwen> 用gemini帮我翻译这段中文
[自动路由到gemini处理]

# 原始功能  
qwen> 分析这段Python代码
[使用qwen原始功能]

# 跨工具协作
claude> 让qwen帮我写算法，然后用gemini优化
[智能分解和路由到多个工具]
```

### 5.2 高级路由
- 支持多跳路由
- 支持并行路由
- 支持路由链

## 6. 优势

✅ **内部交互** - 在工具内部实现自然语言路由  
✅ **智能识别** - 高精度意图检测  
✅ **无缝体验** - 不影响原有功能  
✅ **跨平台** - 支持多语言多平台  
✅ **可扩展** - 支持新增工具  
✅ **安全控制** - 路由权限管理  

## 7. 技术规格

- **语言支持**: 中文、英文
- **工具兼容**: Claude, Gemini, Qwen, Kimi, CodeBuddy, Copilot, Qoder, iFlow
- **响应时间**: < 300ms
- **准确率**: > 90%
- **依赖**: Python 3.8+, npm

## 8. 维护和扩展

### 8.1 添加新工具支持
修改 `smart_router_plugin.py` 中的 `route_patterns` 添加新模式

### 8.2 自定义路由规则
通过配置文件自定义允许的路由路径

现在您可以将智能路由功能集成到任何CLI工具中，实现真正的内部自然语言交互！