# 🤖 Smart CLI Router 自动化重用指南

## 🎯 概述

本指南介绍如何将Smart CLI Router的经验转化为可重用的自动化脚本，让不同环境中的用户都能轻松部署和使用智能路由系统。

## 🚀 一键启动

### 方法1: 快速启动（推荐新手）

```bash
# 下载项目后，直接运行
python quick_start.py
```

这将自动：
- 🔍 检测您的Python环境
- 📦 检查系统依赖
- 🛠️ 自动检测可用的AI工具
- 📁 生成智能路由器
- 📋 显示使用说明

### 方法2: 交互式部署（推荐自定义）

```bash
python deploy.py --interactive
```

交互式部署将引导您：
- 选择可用的AI工具
- 配置默认工具和输出格式
- 自定义CLI名称
- 生成个性化配置

### 方法3: 自动部署（推荐快速体验）

```bash
python deploy.py --auto
```

## 🛠️ 环境自适应

### 自动操作系统检测

系统会自动检测并适配：
- **Windows**: 生成 `.cmd` 和 `.ps1` 脚本
- **Linux**: 生成 `.sh` 脚本
- **macOS**: 生成 `.sh` 脚本
- **通用**: 生成 `.py` 脚本

### 智能工具发现

自动检测以下AI工具：
- ✅ Claude CLI
- ✅ Gemini CLI  
- ✅ Kimi CLI
- ✅ Qwen CLI
- ✅ Ollama
- ✅ CodeBuddy
- ✅ QoderCLI
- ✅ iFlow CLI

### 配置自动生成

根据检测到的工具自动生成配置：
```json
{
  "version": "1.0.0",
  "system": "windows",
  "tools": {
    "claude": {
      "command": {"windows": "claude.cmd"},
      "keywords": ["claude", "anthropic"],
      "priority": 1
    }
  },
  "default_tool": "claude"
}
```

## 🔧 自定义工具配置

### 添加新的AI工具

#### 方法1: 交互式添加

```bash
python tools/config_generator.py --interactive
```

#### 方法2: 命令行添加

```bash
python tools/config_generator.py --add \
  --name "myai" \
  --desc "我的AI工具" \
  --keywords "myai,我的,custom" \
  --command "myai" \
  --priority 5
```

#### 方法3: 手动编辑配置

创建或编辑 `config.json`：

```json
{
  "tools": {
    "myai": {
      "description": "我的AI工具",
      "keywords": ["myai", "我的", "custom"],
      "priority": 5,
      "wrapper": false,
      "command": {
        "windows": "myai.cmd",
        "linux": "myai", 
        "darwin": "myai"
      }
    }
  }
}
```

### 工具包装器

对于需要特殊处理的工具，可以创建包装器：

```python
# myai_wrapper.py
import subprocess
import sys

def main():
    if len(sys.argv) < 2:
        print("🎯 MyAI Wrapper")
        return
    
    user_input = ' '.join(sys.argv[1:])
    
    try:
        result = subprocess.run(["myai", user_input], 
                              capture_output=True, text=True)
        print(result.stdout)
        return result.returncode
    except Exception as e:
        print(f"❌ 执行失败: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

然后在配置中启用包装器：

```json
{
  "myai": {
    "wrapper": true,
    "wrapper_script": "myai_wrapper.py"
  }
}
```

## 📦 部署包生成

### 自动生成部署包

```bash
python deploy.py --auto
```

将生成包含以下内容的部署包：
- 📄 核心脚本文件
- ⚙️ 自定义配置文件
- 🛠️ 生成的路由器
- 📖 使用指南文档

### 部署包结构

```
output/auto_deploy/
├── universal_cli_setup.py    # 核心设置脚本
├── smart_router_creator.py   # 路由创建器
├── kimi_wrapper.py           # 包装器示例
├── shell_integration.py      # Shell集成
├── config.json               # 自定义配置
├── smart_router.cmd          # 生成的路由器
├── ai_router.py              # Python路由器
├── validate_project.py       # 项目验证
└── 使用指南.md               # 使用说明
```

## 🌐 跨平台使用

### Windows用户

```cmd
# 使用CMD路由器
smart_router.cmd 用claude写代码

# 使用PowerShell路由器
.\smart_router.ps1 用gemini分析问题

# 使用Python路由器
python smart_router.py 用kimi写文章
```

### Linux/macOS用户

```bash
# 使用Shell路由器
./smart_router.sh 用claude写代码

# 使用Python路由器
python smart_router.py 用gemini分析问题
```

## 🔍 故障排除

### 常见问题

#### 1. 工具未检测到

```bash
# 手动检查工具是否安装
python deploy.py --detect

# Windows
where claude

# Linux/macOS  
which claude
```

#### 2. 权限问题

```bash
# Linux/macOS设置执行权限
chmod +x smart_router.sh

# Windows可能需要管理员权限
```

#### 3. 编码问题

```bash
# Windows设置UTF-8编码
chcp 65001
```

### 调试模式

```bash
# 查看详细输出
python deploy.py --auto --verbose

# 验证项目完整性
python validate_project.py
```

## 🎯 高级用法

### 批量生成路由器

```python
# 批量生成脚本
from universal_cli_setup import UniversalCLISetup

setup = UniversalCLISetup()
cli_names = ["ai", "smart", "assistant", "helper"]

for name in cli_names:
    setup.generate_smart_router(name, "cmd")
```

### 自定义路由逻辑

```python
# 扩展路由器
class CustomRouter(UniversalCLISetup):
    def smart_route(self, user_input):
        # 自定义路由逻辑
        if "代码" in user_input:
            return "codebuddy", [user_input.replace("代码", "")]
        # 调用父类方法
        return super().smart_route(user_input)
```

### 集成到现有项目

```python
# 在您的CLI中集成
from smart_router import SmartRouter

def main():
    router = SmartRouter()
    return router.process_input(' '.join(sys.argv[1:]))
```

## 📈 最佳实践

### 1. 环境隔离

```bash
# 使用虚拟环境
python -m venv smart_router_env
source smart_router_env/bin/activate  # Linux/macOS
smart_router_env\Scripts\activate     # Windows
```

### 2. 配置管理

```bash
# 备份配置
cp config.json config.json.backup

# 版本控制配置
git add config.json
git commit -m "更新工具配置"
```

### 3. 自动化脚本

```bash
# 创建启动脚本
#!/bin/bash
cd /path/to/smart-cli-router
python quick_start.py
```

## 🎉 成功案例

### 案例1: 开发者环境

- 系统: Windows 11
- 工具: Claude, Gemini, Ollama
- 用途: 日常编程辅助

```bash
python quick_start.py
# 自动生成smart_router.cmd
smart_router.cmd 用claude优化这段代码
```

### 案例2: 团队协作

- 系统: Ubuntu Server
- 工具: Qwen, CodeBuddy
- 用途: 团队代码审查

```bash
python deploy.py --auto --config team_config.json
./ai_router.sh 用qwen审查代码质量
```

### 案例3: 个人助手

- 系统: macOS
- 工具: Kimi, iFlow
- 用途: 写作和分析

```bash
python deploy.py --interactive
# 配置个性化设置
./smart_router.sh 用kimi写技术文档
```

---

## 🤝 贡献

欢迎提交您的自动化脚本和使用经验！

- 🐛 报告问题
- 💡 建议改进
- 🔧 提交代码
- 📝 完善文档

---

**让AI工具听从您的自然语言指令！** 🚀