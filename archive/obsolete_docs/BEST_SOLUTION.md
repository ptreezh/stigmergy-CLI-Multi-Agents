# Stigmergy-CLI 最佳解决方案

## 🔍 问题根因分析

经过深入分析，发现了问题的真正根因：

### ✅ 项目优势
1. **核心模块完整存在**：`src/adapters/codex/`中包含完整的基础设施
   - `base.py` - 基础适配器类
   - `natural_language_parser.py` - 自然语言解析器
   - 实际可工作的代码

2. **架构设计合理**：项目有清晰的分层架构
   - 基础抽象层
   - 意图解析层
   - CLI适配器层

3. **适配器代码完整**：每个CLI都有对应的适配器实现

### ❌ 关键问题
**核心模块没有被正确部署到用户目录**

## 🚀 最佳解决方案

### 方案：完整部署核心基础设施

#### 步骤1: 部署核心模块到用户目录
```bash
# 创建核心模块目录结构
mkdir -p ~/.stigmergy-cli/core

# 复制核心模块
cp /d/AIDevelop/smart-cli-router/src/adapters/codex/* ~/.stigmergy-cli/core/

# 创建__init__.py文件
touch ~/.stigmergy-cli/__init__.py
touch ~/.stigmergy-cli/core/__init__.py
touch ~/.stigmergy-cli/adapters/__init__.py
```

#### 步骤2: 修复适配器导入路径
修改所有适配器文件的导入路径：

```python
# 修复前 (当前错误的导入)
from ...core.base_adapter import BaseCrossCLIAdapter
from ...core.parser import NaturalLanguageParser

# 修复后 (正确的导入)
from ..core.base import BaseCodexAdapter
from ..core.natural_language_parser import NaturalLanguageParser
```

#### 步骤3: 创建适配器工厂
```python
# ~/.stigmergy-cli/adapter_factory.py
import os
import sys
from pathlib import Path

# 添加核心模块到Python路径
core_path = Path(__file__).parent / 'core'
sys.path.insert(0, str(core_path))

from base import BaseCodexAdapter
from natural_language_parser import NaturalLanguageParser

class CrossCLIAdapterFactory:
    def __init__(self):
        self.adapters = {}
        self._load_adapters()

    def _load_adapters(self):
        """加载所有适配器"""
        adapters_dir = Path(__file__).parent / 'adapters'

        for adapter_dir in adapters_dir.iterdir():
            if adapter_dir.is_dir():
                adapter_name = adapter_dir.name
                try:
                    # 动态导入适配器
                    module_name = f"adapters.{adapter_name}.standalone_{adapter_name}_adapter"
                    module = __import__(module_name, fromlist=['StandaloneAdapter'])

                    if hasattr(module, 'StandaloneAdapter'):
                        adapter_class = getattr(module, 'StandaloneAdapter')
                        self.adapters[adapter_name] = adapter_class()
                        print(f"✅ 加载适配器: {adapter_name}")
                except Exception as e:
                    print(f"❌ 加载适配器失败 {adapter_name}: {e}")

    def get_adapter(self, cli_name: str):
        """获取适配器"""
        return self.adapters.get(cli_name.lower())

    def list_available_adapters(self):
        """列出可用适配器"""
        return list(self.adapters.keys())

# 全局工厂实例
adapter_factory = CrossCLIAdapterFactory()
```

#### 步骤4: 修复各个适配器文件
为每个适配器修复导入和继承：

```python
# 示例: ~/.stigmergy-cli/adapters/claude/standalone_claude_adapter.py
import sys
import os
from pathlib import Path

# 添加核心模块路径
core_path = Path(__file__).parent.parent / 'core'
sys.path.insert(0, str(core_path))

from base import BaseCodexAdapter
from natural_language_parser import NaturalLanguageParser

class StandaloneAdapter(BaseCodexAdapter):
    """Claude CLI 独立适配器"""

    def __init__(self):
        super().__init__("claude")
        self.parser = NaturalLanguageParser()

    async def execute_task(self, task: str, context: dict) -> str:
        """执行Claude任务"""
        import subprocess

        try:
            # 调用Claude CLI
            result = subprocess.run([
                'claude', '--print', task
            ], capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                self.execution_count += 1
                self.last_execution_time = datetime.now()
                return result.stdout
            else:
                self.record_error()
                return f"Claude执行失败: {result.stderr}"

        except Exception as e:
            self.record_error()
            return f"Claude调用异常: {str(e)}"

    def is_available(self) -> bool:
        """检查Claude是否可用"""
        try:
            import subprocess
            result = subprocess.run(['claude', '--version'],
                                  capture_output=True, timeout=5)
            return result.returncode == 0
        except:
            return False
```

#### 步骤5: 创建统一的CLI入口
```python
# ~/.stigmergy-cli/main.py
import sys
import asyncio
from adapter_factory import adapter_factory
from natural_language_parser import IntentResult

async def process_user_input(user_input: str, source_cli: str = None):
    """处理用户输入"""

    # 检测跨CLI意图
    parser = NaturalLanguageParser()
    intent = parser.parse_intent(user_input, source_cli or "unknown")

    if intent.is_cross_cli and intent.target_cli:
        # 跨CLI调用
        target_adapter = adapter_factory.get_adapter(intent.target_cli)

        if target_adapter and target_adapter.is_available():
            print(f"🤖 跨CLI调用: {source_cli} → {intent.target_cli}")

            try:
                result = await target_adapter.execute_task(
                    intent.task,
                    {'source_cli': source_cli}
                )
                print(f"✅ {intent.target_cli.upper()}结果:")
                print(result)
            except Exception as e:
                print(f"❌ 跨CLI调用失败: {e}")
        else:
            print(f"❌ 目标CLI不可用: {intent.target_cli}")
    else:
        # 本地处理
        if source_cli:
            source_adapter = adapter_factory.get_adapter(source_cli)
            if source_adapter and source_adapter.is_available():
                try:
                    result = await source_adapter.execute_task(
                        user_input,
                        {'source_cli': source_cli}
                    )
                    print(f"✅ {source_cli.upper()}结果:")
                    print(result)
                except Exception as e:
                    print(f"❌ 本地处理失败: {e}")
            else:
                print(f"❌ 源CLI不可用: {source_cli}")
        else:
            print(f"💬 本地处理: {user_input}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <cli_name> <user_input>")
        print(f"可用CLI: {', '.join(adapter_factory.list_available_adapters())}")
        return

    cli_name = sys.argv[1]
    user_input = ' '.join(sys.argv[2:])

    # 运行异步处理
    asyncio.run(process_user_input(user_input, cli_name))

if __name__ == "__main__":
    main()
```

## 🔧 立即可执行的修复脚本

### 创建完整的修复脚本
```bash
#!/bin/bash
# fix_stigmergy.sh - 修复Stigmergy-CLI部署问题

echo "🔧 修复Stigmergy-CLI部署问题..."

# 1. 创建核心模块目录
echo "📁 创建核心模块目录..."
mkdir -p ~/.stigmergy-cli/core
mkdir -p ~/.stigmergy-cli/core/__pycache__

# 2. 复制核心模块
echo "📦 复制核心模块..."
cp /d/AIDevelop/smart-cli-router/src/adapters/codex/* ~/.stigmergy-cli/core/

# 3. 创建__init__.py文件
echo "📝 创建Python包文件..."
touch ~/.stigmergy-cli/__init__.py
touch ~/.stigmergy-cli/core/__init__.py

# 4. 测试核心模块导入
echo "🧪 测试核心模块导入..."
cd ~/.stigmergy-cli
python -c "
try:
    from core.base import BaseCodexAdapter
    from core.natural_language_parser import NaturalLanguageParser
    print('✅ 核心模块导入成功')
except Exception as e:
    print(f'❌ 核心模块导入失败: {e}')
"

echo "✅ 修复完成！"
```

## 🎯 实施步骤

### 第一步: 立即修复核心模块
```bash
# 运行修复脚本
bash fix_stigmergy.sh
```

### 第二步: 适配器导入路径修复
需要批量修改所有适配器的导入路径，可以使用脚本自动化处理。

### 第三步: 验证修复效果
```bash
# 测试核心模块
cd ~/.stigmergy-cli
python -c "from core.base import BaseCodexAdapter; print('✅ 基础类可用')"

# 测试解析器
python -c "from core.natural_language_parser import NaturalLanguageParser; print('✅ 解析器可用')"

# 测试适配器
python main.py claude "请用Gemini帮我翻译：Hello World"
```

## 🚀 预期效果

修复完成后，系统将能够：

✅ **正确加载核心模块**
✅ **适配器正常导入和工作**
✅ **实现真正的跨CLI调用**
✅ **支持中英文协作协议**
✅ **提供错误处理和回退**

这个解决方案基于**现有的完整代码**，只需要正确的部署和路径修复，就能让整个系统正常工作！