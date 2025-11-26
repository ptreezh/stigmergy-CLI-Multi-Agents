# Stigmergy-CLI 最佳实践方案

## 🎯 核心设计理念

### 简洁性原则
- ❌ 去除所有不必要的抽象层
- ❌ 去除复杂的核心模块
- ❌ 去除工厂模式和依赖注入
- ✅ 每个适配器独立工作
- ✅ 直接subprocess调用
- ✅ 简单配置驱动

## 🏗️ 正确的架构设计

### 1. 独立适配器架构

每个CLI工具都有**完全独立**的适配器：

```python
# ~/.stigmergy-cli/adapters/claude/cross_cli_handler.py
import subprocess
import re
from pathlib import Path

class ClaudeCrossCLIHandler:
    """Claude CLI 跨工具处理器 - 完全独立"""

    def __init__(self):
        # CLI工具映射
        self.cli_tools = {
            'gemini': 'gemini',
            'qwen': 'qwen',
            'iflow': 'iflow',
            'codebuddy': 'codebuddy'
        }

    def detect_cross_cli(self, text: str) -> tuple:
        """检测跨CLI调用"""
        patterns = [
            r"用(\w+)帮我(.+)",
            r"请(\w+)来(.+)",
            r"use (\w+) to (.+)"
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                target_cli = match.group(1).lower()
                task = match.group(2).strip()
                if target_cli in self.cli_tools:
                    return target_cli, task
        return None, None

    def call_cli(self, cli_name: str, task: str) -> str:
        """直接调用CLI工具"""
        try:
            result = subprocess.run([
                self.cli_tools[cli_name], task
            ], capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                return result.stdout
            else:
                return f"{cli_name}调用失败: {result.stderr}"
        except Exception as e:
            return f"{cli_name}调用异常: {str(e)}"

    def handle_user_input(self, user_input: str) -> str:
        """处理用户输入"""
        target_cli, task = self.detect_cross_cli(user_input)

        if target_cli:
            # 跨CLI调用
            result = self.call_cli(target_cli, task)
            return f"""
🤖 通过{target_cli.upper()}完成任务:
📝 任务: {task}
✅ 结果: {result}
            """
        else:
            # 非跨CLI调用，返回None让Claude正常处理
            return None

# Claude Hook入口点
def user_prompt_submit_hook(prompt: str, metadata: dict) -> str:
    """Claude用户提示提交Hook"""
    handler = ClaudeCrossCLIHandler()
    return handler.handle_user_input(prompt)
```

### 2. 原生Hook集成

每个CLI工具通过其**原生扩展机制**加载适配器：

#### Claude Hook配置
```json
// ~/.config/claude/hooks.json
{
  "user_prompt_submit": {
    "enabled": true,
    "handler": "python",
    "script_path": "/Users/Zhang/.stigmergy-cli/adapters/claude/cross_cli_handler.py",
    "entry_point": "user_prompt_submit_hook"
  }
}
```

#### Qwen类继承
```python
# ~/.stigmergy-cli/adapters/qwen/cross_cli_enhancer.py
import subprocess
import re

class CrossCLIQwenEnhancer:
    """Qwen CLI 跨工具增强器"""

    def __init__(self):
        self.cli_tools = {
            'claude': 'claude',
            'gemini': 'gemini',
            'iflow': 'iflow'
        }

    def process_command(self, command: str, args: list) -> str:
        """重写Qwen的命令处理"""
        user_input = f"{command} {' '.join(args)}"

        target_cli, task = self._detect_cross_cli(user_input)
        if target_cli:
            return self._call_cli(target_cli, task)

        # 不是跨CLI调用，让Qwen正常处理
        return None

    def _detect_cross_cli(self, text: str) -> tuple:
        patterns = [r"用(\w+)帮我(.+)", r"请(\w+)来(.+)"]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).lower(), match.group(2).strip()
        return None, None

    def _call_cli(self, cli_name: str, task: str) -> str:
        result = subprocess.run([self.cli_tools[cli_name], task],
                              capture_output=True, text=True, timeout=60)
        return result.stdout if result.returncode == 0 else f"调用失败"

# Qwen配置文件中的增强器引用
# ~/.qwen/config.json
{
  "enhancement": {
    "enabled": true,
    "processor": "/Users/Zhang/.stigmergy-cli/adapters/qwen/cross_cli_enhancer.py",
    "class": "CrossCLIQwenEnhancer"
  }
}
```

### 3. 统一路由配置

简单的JSON配置文件管理CLI映射：

```json
// ~/.stigmergy-cli/routing.json
{
  "cli_mappings": {
    "克劳德": "claude",
    "双子座": "gemini",
    "通义": "qwen",
    "千问": "qwen",
    "代码伙伴": "codebuddy"
  },
  "fallback_order": {
    "translation": ["gemini", "claude", "qwen"],
    "coding": ["codebuddy", "claude", "qwen"],
    "analysis": ["claude", "gemini", "qwen"]
  }
}
```

## 🛠️ 实施步骤

### 步骤1: 创建独立适配器
```bash
# 为每个CLI创建独立的适配器
mkdir -p ~/.stigmergy-cli/adapters/{claude,gemini,qwen,iflow,codebuddy}
```

### 步骤2: 配置CLI原生扩展
```bash
# Claude Hook配置
cat > ~/.config/claude/hooks.json << 'EOF'
{
  "user_prompt_submit": {
    "enabled": true,
    "handler": "python",
    "script_path": "~/.stigmergy-cli/adapters/claude/cross_cli_handler.py",
    "config": {
      "routing_config": "~/.stigmergy-cli/routing.json"
    }
  }
}
EOF
```

### 步骤3: 验证集成
```bash
# 测试Claude跨CLI调用
echo "请用Gemini翻译：Hello World" | claude --print

# 测试Qwen跨CLI调用
qwen "用Claude分析这个问题"
```

## 🎯 优势对比

### ❌ 复杂方案 (之前错误的方向)
- 复杂的继承层次
- 抽象工厂模式
- 依赖注入
- 核心模块管理
- 难以调试和维护

### ✅ 简洁方案 (最佳实践)
- 每个适配器独立
- 直接subprocess调用
- 简单配置驱动
- 易于理解和维护
- 符合Unix哲学

## 🔧 立即可执行的代码

### Claude适配器示例
```python
# ~/.stigmergy-cli/adapters/claude/cross_cli_handler.py
import subprocess
import re
import json
from pathlib import Path

def load_routing_config():
    """加载路由配置"""
    config_path = Path.home() / '.stigmergy-cli' / 'routing.json'
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    return {"cli_mappings": {}}

def detect_cross_cli(text: str, config: dict) -> tuple:
    """检测跨CLI调用"""
    cli_mappings = config.get('cli_mappings', {})

    patterns = [
        r"用(\w+)帮我(.+)",
        r"请(\w+)来(.+)",
        r"use (\w+) to (.+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            cli_name = match.group(1).lower()
            task = match.group(2).strip()

            # 映射CLI名称
            mapped_cli = cli_mappings.get(cli_name, cli_name)
            return mapped_cli, task

    return None, None

def call_cli_tool(cli_name: str, task: str) -> str:
    """调用CLI工具"""
    cli_commands = {
        'claude': ['claude', '--print', task],
        'gemini': ['gemini', task],
        'qwen': ['qwen', task],
        'iflow': ['iflow', task],
        'codebuddy': ['codebuddy', task]
    }

    if cli_name not in cli_commands:
        return f"不支持的CLI工具: {cli_name}"

    try:
        result = subprocess.run(
            cli_commands[cli_name],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            return result.stdout
        else:
            return f"{cli_name}执行失败: {result.stderr}"
    except Exception as e:
        return f"{cli_name}调用异常: {str(e)}"

def user_prompt_submit_hook(prompt: str, metadata: dict) -> str:
    """Claude Hook处理函数"""
    config = load_routing_config()
    target_cli, task = detect_cross_cli(prompt, config)

    if target_cli:
        result = call_cli_tool(target_cli, task)
        return f"""
🤖 跨CLI协作完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 目标工具: {target_cli.upper()}
📝 执行任务: {task}
✅ 执行结果:
{result}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """

    # 不是跨CLI调用，返回None让Claude正常处理
    return None

# Hook入口点
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = user_prompt_submit_hook(' '.join(sys.argv[1:]), {})
        if result:
            print(result)
```

## 🎉 总结

这个方案的优势：

1. **简洁性** - 每个文件职责单一，易于理解
2. **独立性** - 适配器之间完全独立，无依赖
3. **可维护性** - 修改一个适配器不影响其他
4. **性能** - 直接subprocess调用，无抽象层开销
5. **可扩展性** - 添加新CLI只需创建新适配器

**这才是正确的架构设计！** 简单、直接、有效。