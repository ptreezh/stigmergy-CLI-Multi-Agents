# DSGS Context Engineering Skills - 智能路由完整解决方案

## 项目概述
实现了在CLI工具内部使用自然语言交互启动的智能路由系统，用户可以在任一工具内部通过自然语言指令路由到其他工具。

## 核心特性

### 1. 智能路由插件系统
- **内部交互**: 在工具内部实现自然语言路由
- **多语言支持**: 支持中文、英文自然语言指令  
- **智能识别**: 高精度路由意图检测
- **安全控制**: 路由规则权限管理

### 2. 支持的自然语言模式
```bash
# 中文模式
用{工具名}帮我{任务}     # 用gemini帮我翻译
让{工具名}帮我{任务}     # 让qwen帮我写代码
请{工具名}{任务}         # 请claude分析文档

# 英文模式  
Use {tool} to {action}  # Use Gemini to translate
Let {tool} {action}     # Let Qwen write code
```

### 3. 跨工具智能路由
- Claude ↔ Gemini ↔ Qwen ↔ Kimi ↔ CodeBuddy ↔ Copilot ↔ Qoder ↔ iFlow
- 支持多跳路由和串行处理
- 保持原有功能完整

## 安装方案

### 方案1: 一键安装
```bash
# 全局安装（需npm账户）
npm install -g dsgs-cli
dsgs  # 一键配置

# 或从GitHub安装
npm install -g ptreezh/dnaSpec
dsgs
```

### 方案2: 手动集成
```bash
# 克隆项目
git clone https://github.com/ptreezh/dnaSpec.git
cd dnaSpec

# 安装为全局命令
npm install -g .
dsgs  # 运行配置
```

## 集成方法

### 1. 在现有CLI工具中集成
```python
from smart_router_plugin import SmartRouterPlugin

def main():
    user_input = ' '.join(sys.argv[1:])
    
    # 首先检查路由意图
    plugin = SmartRouterPlugin('your_cli_name')
    if plugin.intercept_command(user_input):
        # 路由已处理
        return
    
    # 执行原始功能
    original_function(user_input)
```

### 2. 自动生成的路由器
安装后自动为所有检测到的工具生成智能路由器：
- `qwen_smart.cmd` / `qwen_smart.py`
- `claude_smart.cmd` / `claude_smart.py`  
- `gemini_smart.cmd` / `gemini_smart.py`
- 等等...

## 使用示例

### 内部自然语言交互
在任一CLI工具内部:
```
> qwen "用gemini帮我翻译Hello World"     # 自动路由到gemini
> claude "让kimi帮我生成文档"           # 自动路由到kimi
> gemini "请qwen帮我分析代码"           # 自动路由到qwen
> qwen "正常的需求文档分析"             # 执行qwen原生功能
```

### 增强功能
- **智能清理**: 自动去除路由指令词
- **自动降级**: 未识别时保持原功能
- **实时反馈**: 显示路由过程
- **错误处理**: 安全的错误恢复

## 技术架构

```
用户输入 → 自然语言解析 → 路由决策 → 目标工具执行
   ↓           ↓           ↓           ↓
原功能 ←——— 无路由意图 ———————— 无目标工具 ———— 无权限
```

## 配置和扩展

### 配置路由规则
```json
{
  "routing_rules": {
    "qwen": ["gemini", "claude", "kimi"],
    "claude": ["qwen", "gemini", "codebuddy"],
    "gemini": ["qwen", "claude", "copilot"]
  }
}
```

### 扩展新工具
1. 在`smart_router_plugin.py`中添加新模式
2. 更新路由规则映射
3. 验证工具可用性

## 优势

✅ **内部交互**: 在工具内部实现自然语言路由  
✅ **智能识别**: 高精度意图检测  
✅ **无缝体验**: 保持原有功能完整  
✅ **跨平台**: 支持Windows、Linux、macOS  
✅ **可扩展**: 易于添加新工具  
✅ **安全控制**: 路由权限管理  
✅ **一键安装**: 简单快速部署  

## 部署效果

安装配置后，用户可以：
1. 在任一工具内部用自然语言路由到其他工具
2. 无需记住复杂的命令
3. 享受智能助手协作
4. 保持所有原有功能
5. 获得增强的AI工作流体验

这是真正的内部自然语言交互和智能路由解决方案！