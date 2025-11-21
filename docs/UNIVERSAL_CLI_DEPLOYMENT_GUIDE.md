# 🚀 通用CLI智能路由部署指南

## 📋 概述

这是一个完整的CLI工具智能路由系统，可以让您将多个AI CLI工具集成到一个统一的入口中，支持自然语言意图识别和自动路由。

### 核心功能

- **智能路由**: 根据自然语言输入自动选择合适的AI工具
- **多平台支持**: 支持Windows、Linux、macOS
- **多格式输出**: 可生成CMD、PowerShell、Bash、Python格式路由器
- **工具发现**: 自动检测系统中可用的AI工具
- **配置灵活**: 支持自定义工具配置和路由规则

### 支持的AI工具

- **Claude CLI** - Anthropic Claude
- **Gemini CLI** - Google Gemini AI
- **Kimi CLI** - 月之暗面Kimi (支持包装器)
- **Qwen CLI** - 阿里通义千问
- **Ollama** - 本地模型运行器
- **CodeBuddy** - 代码助手
- **QoderCLI** - 代码生成工具
- **iFlow CLI** - 智能助手

## 🛠️ 快速开始

### 1. 环境准备

确保您的系统已安装：
- Python 3.7+
- 需要集成的AI CLI工具

### 2. 下载脚本

将以下脚本文件复制到您的项目目录：
- `universal_cli_setup.py` - 通用设置脚本
- `smart_router_creator.py` - 简化版路由创建器

### 3. 检查可用工具

```bash
python universal_cli_setup.py --list
```

这将显示系统中可用的AI工具：
```
🔧 可用工具 (8个):
  ✅ claude     - Anthropic Claude
  ✅ gemini     - Google Gemini AI
  ✅ kimi       - 月之暗面Kimi
  ✅ qwen       - 阿里通义千问
  ✅ ollama     - Ollama本地模型
  ✅ codebuddy  - CodeBuddy代码助手
  ✅ qodercli   - QoderCLI代码生成
  ✅ iflow      - iFlow智能助手
```

### 4. 生成智能路由器

#### 为特定CLI生成路由器

```bash
# 生成CMD格式 (Windows)
python universal_cli_setup.py --cli mytool --format cmd

# 生成PowerShell格式
python universal_cli_setup.py --cli mytool --format powershell

# 生成Bash格式 (Linux/macOS)
python universal_cli_setup.py --cli mytool --format bash

# 生成Python格式
python universal_cli_setup.py --cli mytool --format python
```

#### 使用简化版路由创建器

```bash
# 为单个工具创建路由器
python smart_router_creator.py --cli mytool --format cmd

# 为所有工具创建路由器
python smart_router_creator.py --all
```

### 5. 使用智能路由器

生成的路由器文件可以直接使用：

```bash
# Windows CMD
smart_mytool.cmd 用claude写代码

# PowerShell
.\smart_mytool.ps1 用gemini分析问题

# Linux/macOS Bash
./smart_mytool.sh 用kimi写文章

# Python
python smart_mytool.py 用ollama列出模型
```

## 🔧 高级配置

### 自定义配置文件

创建自定义配置文件 `my_config.json`：

```json
{
  "version": "1.0.0",
  "tools": {
    "my_custom_tool": {
      "command": {
        "windows": "mytool.cmd",
        "linux": "mytool",
        "darwin": "mytool"
      },
      "description": "我的自定义工具",
      "keywords": ["mytool", "自定义", "custom"],
      "priority": 10,
      "wrapper": false
    }
  },
  "route_keywords": ["用", "帮我", "请", "智能", "ai"],
  "default_tool": "claude"
}
```

使用自定义配置：

```bash
python universal_cli_setup.py --config my_config.json --list
```

### 工具包装器

对于需要特殊处理的工具（如Kimi CLI），可以创建包装器：

```python
#!/usr/bin/env python3
# kimi_wrapper.py

import subprocess
import sys

def main():
    if len(sys.argv) < 2:
        print("🎯 Kimi包装器")
        return
    
    user_input = ' '.join(sys.argv[1:])
    
    try:
        # 尝试执行原始kimi
        result = subprocess.run(["kimi", user_input], capture_output=True, text=True)
        print(result.stdout)
        return result.returncode
    except:
        # API回退逻辑
        print("使用API回退模式...")
        return 0

if __name__ == "__main__":
    sys.exit(main())
```

## 🌍 跨平台部署

### Windows部署

1. **CMD格式**:
   ```bash
   python universal_cli_setup.py --cli mytool --format cmd
   # 生成的smart_mytool.cmd可直接在CMD中使用
   ```

2. **PowerShell格式**:
   ```bash
   python universal_cli_setup.py --cli mytool --format powershell
   # 在PowerShell中执行: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Linux部署

```bash
python universal_cli_setup.py --cli mytool --format bash
chmod +x smart_mytool.sh
./smart_mytool.sh 用claude写代码
```

### macOS部署

```bash
python universal_cli_setup.py --cli mytool --format bash
chmod +x smart_mytool.sh
./smart_mytool.sh 用gemini分析
```

## 📝 使用示例

### 基本用法

```bash
# 智能路由到Claude
smart_mytool.cmd 用claude解释机器学习

# 智能路由到Gemini
smart_mytool.cmd 用gemini写Python代码

# 智能路由到Kimi
smart_mytool.cmd 用kimi写一篇技术文章

# 智能路由到Ollama
smart_mytool.cmd 用ollama列出可用模型
```

### 高级用法

```bash
# 复杂任务分配
smart_mytool.cmd 用claude分析代码然后用gemini优化

# 多步骤任务
smart_mytool.cmd 用kimi收集资料，用qwen整理成报告

# 工具链组合
smart_mytool.cmd 用ollama运行本地模型进行数据分析
```

## 🔍 故障排除

### 常见问题

1. **工具未检测到**
   - 确保工具已正确安装并在PATH中
   - 检查工具命令是否正确

2. **路由失败**
   - 检查关键词配置是否正确
   - 验证工具是否可用

3. **权限问题**
   - Linux/macOS: 确保脚本有执行权限 `chmod +x`
   - Windows: 可能需要管理员权限

4. **编码问题**
   - 确保终端支持UTF-8编码
   - Windows CMD可能需要 `chcp 65001`

### 调试模式

启用详细输出：

```bash
# 检查配置
python universal_cli_setup.py --list

# 查看生成的路由器内容
type smart_mytool.cmd  # Windows
cat smart_mytool.sh    # Linux/macOS
```

## 🎯 最佳实践

### 1. 工具命名规范

- 使用简短、易记的CLI名称
- 避免与系统命令冲突
- 使用小写字母和连字符

### 2. 关键词优化

- 为每个工具配置独特的关键词
- 包含中英文关键词
- 避免关键词冲突

### 3. 路由规则设计

- 按优先级排序工具
- 设置合理的默认工具
- 配置回退策略

### 4. 部署建议

- 在测试环境先验证
- 逐步推广到生产环境
- 收集用户反馈优化

## 📚 扩展开发

### 添加新工具

1. 在配置文件中添加工具定义
2. 设置关键词和优先级
3. 测试路由功能
4. 更新文档

### 自定义路由逻辑

可以扩展路由器以支持：
- 更复杂的NLP处理
- 上下文感知路由
- 负载均衡
- 工具性能监控

### 集成到现有项目

```python
# 在您的CLI项目中集成
from universal_cli_setup import UniversalCLISetup

def main():
    setup = UniversalCLISetup()
    # 使用智能路由功能
```

## 🤝 贡献指南

欢迎提交问题报告和功能请求！

### 开发环境设置

```bash
git clone <repository>
cd universal-cli-router
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 测试

```bash
python -m pytest tests/
```

## 📄 许可证

MIT License - 详见LICENSE文件

## 🙏 致谢

感谢所有AI工具的开发者和开源社区的贡献！

---

**让AI工具集成变得简单而强大！** 🚀