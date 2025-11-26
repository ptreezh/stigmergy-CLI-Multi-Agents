# Stigmergy-CLI 跨协作系统测试验证计划

## 🎯 测试目标

验证Stigmergy-CLI跨协作系统的**实际可行性**和**工作原理**，确保：
1. 适配器能够真正传递任务给CLI
2. 跨CLI调用机制实际工作
3. 系统能够正确识别和路由协作请求
4. 错误处理和回退机制有效

## 📋 测试分层架构

```
测试金字塔:
    🔺 端到端测试 (E2E) - 真实用户场景
   🟦 集成测试 (Integration) - CLI间协作
  🟩 单元测试 (Unit) - 单个适配器功能
 🟱 系统测试 (System) - 完整工作流验证
```

## 🧪 阶段1: 基础功能验证 (单元测试)

### 1.1 CLI工具可用性测试
```bash
# 测试脚本: test_cli_availability.sh
#!/bin/bash

echo "=== CLI工具可用性测试 ==="

# 测试所有CLI工具是否安装并可执行
declare -a cli_tools=("claude" "gemini" "qwen" "iflow" "codebuddy" "qodercli" "copilot")

for cli in "${cli_tools[@]}"; do
    echo "测试 $cli..."
    if command -v $cli &> /dev/null; then
        version=$($cli --version 2>/dev/null || $cli --help 2>/dev/null | head -1)
        echo "✅ $cli 可用 - $version"
    else
        echo "❌ $cli 不可用"
    fi
done
```

### 1.2 配置文件完整性测试
```python
# 测试脚本: test_config_integrity.py
import json
import os
from pathlib import Path

class ConfigIntegrityTest:
    def __init__(self):
        self.home_dir = Path.home()
        self.config_paths = {
            'claude': self.home_dir / '.config' / 'claude' / 'hooks.json',
            'gemini': self.home_dir / '.config' / 'gemini' / 'extensions.json',
            'qwen': self.home_dir / '.qwen' / 'config.json',
            'iflow': self.home_dir / '.config' / 'iflow' / 'workflows.json',
        }
        self.stigmergy_dir = self.home_dir / '.stigmergy-cli'

    def test_all_configs(self):
        """测试所有配置文件的完整性"""
        print("=== 配置文件完整性测试 ===")

        for cli, config_path in self.config_paths.items():
            if config_path.exists():
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        config = json.load(f)

                    # 检查是否包含stigmergy集成
                    has_stigmergy = 'stigmergy' in str(config).lower()
                    print(f"✅ {cli} 配置存在 {'🔗' if has_stigmergy else '❌'}")

                except Exception as e:
                    print(f"❌ {cli} 配置损坏: {e}")
            else:
                print(f"❌ {cli} 配置不存在")

        # 检查适配器目录
        adapter_dir = self.stigmergy_dir / 'adapters'
        if adapter_dir.exists():
            adapters = [d.name for d in adapter_dir.iterdir() if d.is_dir()]
            print(f"✅ 适配器目录存在，包含: {', '.join(adapters)}")
        else:
            print("❌ 适配器目录不存在")

if __name__ == "__main__":
    test = ConfigIntegrityTest()
    test.test_all_configs()
```

### 1.3 适配器语法和导入测试
```python
# 测试脚本: test_adapter_syntax.py
import sys
import importlib.util
from pathlib import Path

class AdapterSyntaxTest:
    def __init__(self):
        self.stigmergy_dir = Path.home() / '.stigmergy-cli'
        self.adapters_dir = self.stigmergy_dir / 'adapters'

    def test_adapter_syntax(self, adapter_name):
        """测试单个适配器的语法正确性"""
        adapter_path = self.adapters_dir / adapter_name

        if not adapter_path.exists():
            return False, f"适配器目录不存在: {adapter_path}"

        # 测试所有Python文件
        python_files = list(adapter_path.glob("*.py"))

        for py_file in python_files:
            try:
                spec = importlib.util.spec_from_file_location(py_file.stem, py_file)
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    print(f"✅ {adapter_name}/{py_file.name} 语法正确")
                else:
                    return False, f"无法加载 {py_file}"
            except Exception as e:
                return False, f"语法错误 {adapter_name}/{py_file.name}: {e}"

        return True, f"{adapter_name} 所有文件语法正确"

    def test_all_adapters(self):
        """测试所有适配器"""
        print("=== 适配器语法测试 ===")

        if not self.adapters_dir.exists():
            print("❌ 适配器目录不存在")
            return

        adapters = [d.name for d in self.adapters_dir.iterdir() if d.is_dir()]

        for adapter in adapters:
            success, message = self.test_adapter_syntax(adapter)
            print(f"{'✅' if success else '❌'} {adapter}: {message}")

if __name__ == "__main__":
    test = AdapterSyntaxTest()
    test.test_all_adapters()
```

## 🔄 阶段2: 集成测试 (CLI间协作)

### 2.1 简单跨CLI调用测试
```python
# 测试脚本: test_simple_cross_cli.py
import asyncio
import subprocess
import json

class SimpleCrossCLITest:
    def __init__(self):
        self.test_results = []

    async def test_claude_to_gemini(self):
        """测试 Claude -> Gemini 调用"""
        print("测试 Claude -> Gemini 调用...")

        try:
            # 使用Claude CLI的print模式进行测试
            result = subprocess.run([
                'claude', '--print', '--debug', 'hooks',
                '请用Gemini帮我翻译：Hello World'
            ], capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                output = result.stdout
                # 检查是否包含跨CLI协作的迹象
                has_gemini_mention = 'gemini' in output.lower()
                has_translation = 'world' in output.lower() or 'hello' in output.lower()

                self.test_results.append({
                    'test': 'claude_to_gemini',
                    'success': True,
                    'output': output,
                    'has_cross_cli': has_gemini_mention,
                    'has_task_result': has_translation
                })

                print(f"✅ Claude -> Gemini 调用成功")
                if has_gemini_mention:
                    print("   🔗 检测到Gemini调用")
                if has_translation:
                    print("   ✨ 检测到任务执行结果")
            else:
                self.test_results.append({
                    'test': 'claude_to_gemini',
                    'success': False,
                    'error': result.stderr
                })
                print(f"❌ Claude -> Gemini 调用失败: {result.stderr}")

        except subprocess.TimeoutExpired:
            print("❌ Claude -> Gemini 调用超时")
            self.test_results.append({
                'test': 'claude_to_gemini',
                'success': False,
                'error': 'timeout'
            })
        except Exception as e:
            print(f"❌ Claude -> Gemini 调用异常: {e}")
            self.test_results.append({
                'test': 'claude_to_gemini',
                'success': False,
                'error': str(e)
            })

    async def test_qwen_to_iflow(self):
        """测试 Qwen -> iFlow 调用"""
        print("测试 Qwen -> iFlow 调用...")

        try:
            # 测试Qwen CLI的跨CLI调用
            result = subprocess.run([
                'qwen', '用iflow帮我创建一个简单的工作流'
            ], capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                output = result.stdout
                has_iflow_mention = 'iflow' in output.lower() or 'workflow' in output.lower()

                self.test_results.append({
                    'test': 'qwen_to_iflow',
                    'success': True,
                    'output': output,
                    'has_cross_cli': has_iflow_mention
                })

                print(f"✅ Qwen -> iFlow 调用成功")
                if has_iflow_mention:
                    print("   🔗 检测到iFlow调用")
            else:
                self.test_results.append({
                    'test': 'qwen_to_iflow',
                    'success': False,
                    'error': result.stderr
                })
                print(f"❌ Qwen -> iFlow 调用失败: {result.stderr}")

        except Exception as e:
            print(f"❌ Qwen -> iFlow 调用异常: {e}")
            self.test_results.append({
                'test': 'qwen_to_iflow',
                'success': False,
                'error': str(e)
            })

    async def run_all_tests(self):
        """运行所有集成测试"""
        print("=== 跨CLI集成测试 ===")

        await self.test_claude_to_gemini()
        await self.test_qwen_to_iflow()

        # 生成测试报告
        self.generate_report()

    def generate_report(self):
        """生成测试报告"""
        print("\n=== 测试报告 ===")

        total_tests = len(self.test_results)
        successful_tests = len([r for r in self.test_results if r['success']])

        print(f"总测试数: {total_tests}")
        print(f"成功测试: {successful_tests}")
        print(f"失败测试: {total_tests - successful_tests}")
        print(f"成功率: {(successful_tests/total_tests)*100:.1f}%")

        print("\n详细结果:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")

            if result['success']:
                if result.get('has_cross_cli'):
                    print("   🔗 检测到跨CLI调用")
                if result.get('has_task_result'):
                    print("   ✨ 检测到任务执行结果")
            else:
                print(f"   错误: {result.get('error', 'unknown')}")

if __name__ == "__main__":
    test = SimpleCrossCLITest()
    asyncio.run(test.run_all_tests())
```

### 2.2 Hook机制验证测试
```bash
# 测试脚本: test_hook_mechanism.sh
#!/bin/bash

echo "=== Hook机制验证测试 ==="

# 测试Claude Hook调试输出
echo "测试Claude Hook调试..."
echo "请用Gemini翻译：Hello World" | claude --print --debug hooks 2>&1 | grep -i "hook\|gemini\|stigmergy"

# 检查Hook配置是否被读取
echo -e "\n检查Hook配置读取..."
CLAUDE_DEBUG=hooks claude --print "测试消息" 2>&1 | head -10

# 测试Hook文件是否存在
echo -e "\n检查Hook文件状态..."
if [ -f "$HOME/.config/claude/hooks.json" ]; then
    echo "✅ Claude hooks.json 存在"
    echo "内容预览:"
    head -5 "$HOME/.config/claude/hooks.json"
else
    echo "❌ Claude hooks.json 不存在"
fi
```

## 🚀 阶段3: 端到端测试 (真实场景)

### 3.1 完整协作场景测试
```python
# 测试脚本: test_e2e_scenarios.py
import asyncio
import subprocess
import json
import time

class EndToEndTest:
    def __init__(self):
        self.scenarios = [
            {
                'name': '简单翻译任务',
                'source_cli': 'claude',
                'target_cli': 'gemini',
                'prompt': '请用Gemini帮我翻译这句话：Hello, how are you today?',
                'expected_keywords': ['hello', '今天', '你好']
            },
            {
                'name': '代码生成任务',
                'source_cli': 'qwen',
                'target_cli': 'codebuddy',
                'prompt': '用CodeBuddy帮我写一个Python函数来计算斐波那契数列',
                'expected_keywords': ['def', 'fibonacci', 'return']
            },
            {
                'name': '工作流创建任务',
                'source_cli': 'claude',
                'target_cli': 'iflow',
                'prompt': '请用iFlow帮我创建一个用户注册工作流',
                'expected_keywords': ['workflow', 'user', 'register', 'step']
            }
        ]

    async def run_scenario(self, scenario):
        """运行单个测试场景"""
        print(f"\n🧪 运行场景: {scenario['name']}")
        print(f"源CLI: {scenario['source_cli']} → 目标CLI: {scenario['target_cli']}")

        try:
            # 根据源CLI选择调用方式
            if scenario['source_cli'] == 'claude':
                result = subprocess.run([
                    'claude', '--print', '--debug', 'hooks',
                    scenario['prompt']
                ], capture_output=True, text=True, timeout=60)
            else:
                result = subprocess.run([
                    scenario['source_cli'], scenario['prompt']
                ], capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                output = result.stdout
                debug_output = result.stderr

                # 分析结果
                success = self.analyze_scenario_result(scenario, output, debug_output)

                return {
                    'scenario': scenario['name'],
                    'success': success,
                    'output': output,
                    'debug': debug_output,
                    'analysis': self.get_analysis(scenario, output, debug_output)
                }
            else:
                return {
                    'scenario': scenario['name'],
                    'success': False,
                    'error': result.stderr,
                    'output': result.stdout
                }

        except subprocess.TimeoutExpired:
            return {
                'scenario': scenario['name'],
                'success': False,
                'error': 'timeout',
                'timeout': 60
            }
        except Exception as e:
            return {
                'scenario': scenario['name'],
                'success': False,
                'error': str(e)
            }

    def analyze_scenario_result(self, scenario, output, debug_output):
        """分析场景执行结果"""
        # 检查是否提到目标CLI
        target_mentioned = scenario['target_cli'].lower() in output.lower()

        # 检查是否包含期望的关键词
        keyword_matches = 0
        for keyword in scenario['expected_keywords']:
            if keyword.lower() in output.lower():
                keyword_matches += 1

        # 检查调试输出中是否有Hook/扩展活动的迹象
        has_activity = any([
            'hook' in debug_output.lower(),
            'extension' in debug_output.lower(),
            'adapter' in debug_output.lower(),
            'stigmergy' in debug_output.lower()
        ])

        # 综合评估
        confidence = 0
        if target_mentioned:
            confidence += 0.3
        if keyword_matches >= len(scenario['expected_keywords']) / 2:
            confidence += 0.4
        if has_activity:
            confidence += 0.3

        return confidence >= 0.6

    def get_analysis(self, scenario, output, debug_output):
        """获取详细分析"""
        analysis = {
            'target_cli_mentioned': scenario['target_cli'].lower() in output.lower(),
            'keyword_matches': [],
            'debug_activity': [],
            'output_length': len(output),
            'response_time': time.time()
        }

        # 检查关键词匹配
        for keyword in scenario['expected_keywords']:
            if keyword.lower() in output.lower():
                analysis['keyword_matches'].append(keyword)

        # 检查调试活动
        activity_keywords = ['hook', 'extension', 'adapter', 'stigmergy', 'cross', 'cli']
        for keyword in activity_keywords:
            if keyword in debug_output.lower():
                analysis['debug_activity'].append(keyword)

        return analysis

    async def run_all_scenarios(self):
        """运行所有端到端测试场景"""
        print("=== 端到端场景测试 ===")

        results = []

        for scenario in self.scenarios:
            result = await self.run_scenario(scenario)
            results.append(result)

            # 显示结果
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['scenario']}")

            if result['success'] and 'analysis' in result:
                analysis = result['analysis']
                if analysis['target_cli_mentioned']:
                    print("   🔗 检测到目标CLI调用")
                if analysis['keyword_matches']:
                    print(f"   ✨ 关键词匹配: {', '.join(analysis['keyword_matches'])}")
                if analysis['debug_activity']:
                    print(f"   🔧 调试活动: {', '.join(analysis['debug_activity'])}")
            elif not result['success']:
                print(f"   ❌ 错误: {result.get('error', 'unknown')}")

        # 生成综合报告
        self.generate_e2e_report(results)

    def generate_e2e_report(self, results):
        """生成端到端测试报告"""
        print("\n=== 端到端测试综合报告 ===")

        total = len(results)
        successful = len([r for r in results if r['success']])

        print(f"总场景数: {total}")
        print(f"成功场景: {successful}")
        print(f"失败场景: {total - successful}")
        print(f"成功率: {(successful/total)*100:.1f}%")

        # 详细分析
        successful_results = [r for r in results if r['success'] and 'analysis' in r]

        if successful_results:
            print("\n✅ 成功场景分析:")
            for result in successful_results:
                analysis = result['analysis']
                print(f"\n📊 {result['scenario']}:")
                print(f"   输出长度: {analysis['output_length']} 字符")
                print(f"   关键词匹配: {len(analysis['keyword_matches'])}/{len([kw for s in self.scenarios if s['name'] == result['scenario'] for kw in s['expected_keywords']][0])}")
                print(f"   调试活动: {len(analysis['debug_activity'])} 种")

        # 失败分析
        failed_results = [r for r in results if not r['success']]
        if failed_results:
            print("\n❌ 失败场景分析:")
            for result in failed_results:
                print(f"\n💥 {result['scenario']}:")
                if 'error' in result:
                    print(f"   错误类型: {result['error']}")

if __name__ == "__main__":
    test = EndToEndTest()
    asyncio.run(test.run_all_scenarios())
```

## 🔧 阶段4: 系统诊断和调试

### 4.1 CLI扩展机制诊断
```bash
# 诊断脚本: diagnose_cli_extensions.sh
#!/bin/bash

echo "=== CLI扩展机制诊断 ==="

# 诊断Claude Hook机制
echo "🔍 诊断Claude Hook机制..."
if [ -f "$HOME/.config/claude/hooks.json" ]; then
    echo "✅ Hook配置文件存在"
    echo "📄 Hook配置内容:"
    cat "$HOME/.config/claude/hooks.json" | jq '.' 2>/dev/null || cat "$HOME/.config/claude/hooks.json"

    echo -e "\n🧪 测试Hook调试输出..."
    timeout 10s claude --debug hooks --print "测试消息" 2>&1 | head -20
else
    echo "❌ Hook配置文件不存在"
fi

# 诊断Gemini扩展机制
echo -e "\n🔍 诊断Gemini扩展机制..."
if [ -f "$HOME/.config/gemini/extensions.json" ]; then
    echo "✅ 扩展配置文件存在"
    echo "📄 扩展配置内容:"
    cat "$HOME/.config/gemini/extensions.json" | jq '.' 2>/dev/null || cat "$HOME/.config/gemini/extensions.json"
else
    echo "❌ 扩展配置文件不存在"
fi

# 诊断Qwen类继承机制
echo -e "\n🔍 诊断Qwen类继承机制..."
if [ -f "$HOME/.qwen/config.json" ]; then
    echo "✅ Qwen配置文件存在"
    echo "📄 Qwen配置内容:"
    cat "$HOME/.qwen/config.json" | jq '.' 2>/dev/null || cat "$HOME/.qwen/config.json"
else
    echo "❌ Qwen配置文件不存在"
fi

# 检查适配器文件状态
echo -e "\n🔍 检查适配器文件状态..."
stigmergy_dir="$HOME/.stigmergy-cli/adapters"
if [ -d "$stigmergy_dir" ]; then
    echo "✅ 适配器目录存在"
    echo "📁 适配器列表:"
    for adapter in "$stigmergy_dir"/*; do
        if [ -d "$adapter" ]; then
            adapter_name=$(basename "$adapter")
            file_count=$(find "$adapter" -name "*.py" -o -name "*.json" | wc -l)
            echo "   $adapter_name: $file_count 个文件"
        fi
    done
else
    echo "❌ 适配器目录不存在"
fi
```

### 4.2 实时协作监控
```python
# 监控脚本: monitor_collaboration.py
import asyncio
import subprocess
import re
import json
from datetime import datetime

class CollaborationMonitor:
    def __init__(self):
        self.activities = []
        self.monitoring = False

    async def start_monitoring(self):
        """开始监控CLI活动"""
        print("🔍 开始监控CLI协作活动...")
        self.monitoring = True

        # 监控Claude活动
        asyncio.create_task(self.monitor_claude())

        # 监控其他CLI活动
        asyncio.create_task(self.monitor_other_clis())

    async def monitor_claude(self):
        """监控Claude CLI活动"""
        cmd = ['claude', '--debug', 'hooks']

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            while self.monitoring:
                line = await process.stderr.readline()
                if not line:
                    break

                line_str = line.decode('utf-8').strip()
                if any(keyword in line_str.lower() for keyword in ['hook', 'stigmergy', 'cross', 'adapter']):
                    self.log_activity('claude', line_str)

        except Exception as e:
            print(f"Claude监控错误: {e}")

    async def monitor_other_clis(self):
        """监控其他CLI活动"""
        # 这里可以添加对其他CLI的监控
        pass

    def log_activity(self, cli, activity):
        """记录活动"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            'timestamp': timestamp,
            'cli': cli,
            'activity': activity
        }

        self.activities.append(log_entry)

        # 实时显示
        print(f"[{timestamp}] {cli.upper()}: {activity}")

    def stop_monitoring(self):
        """停止监控"""
        self.monitoring = False
        print("⏹️ 监控已停止")

        # 生成报告
        self.generate_monitoring_report()

    def generate_monitoring_report(self):
        """生成监控报告"""
        print(f"\n📊 监控报告 (共记录 {len(self.activities)} 个活动)")

        # 按CLI分组统计
        cli_stats = {}
        for activity in self.activities:
            cli = activity['cli']
            cli_stats[cli] = cli_stats.get(cli, 0) + 1

        print("CLI活动统计:")
        for cli, count in cli_stats.items():
            print(f"  {cli.upper()}: {count} 次活动")

# 使用示例
async def main():
    monitor = CollaborationMonitor()
    await monitor.start_monitoring()

    # 监控30秒
    await asyncio.sleep(30)

    monitor.stop_monitoring()

if __name__ == "__main__":
    asyncio.run(main())
```

## 📈 执行计划

### 第1天: 基础验证
1. 运行CLI可用性测试
2. 验证配置文件完整性
3. 测试适配器语法

### 第2天: 集成测试
1. 执行简单跨CLI调用测试
2. 验证Hook机制
3. 检查适配器加载

### 第3天: 端到端测试
1. 运行完整协作场景
2. 测试多步协作
3. 验证错误处理

### 第4天: 系统诊断
1. 深度诊断CLI扩展机制
2. 实时监控协作活动
3. 性能和稳定性测试

## 🎯 成功标准

### 基础成功标准
- ✅ 所有CLI工具可用
- ✅ 配置文件完整且有效
- ✅ 适配器语法正确

### 集成成功标准
- ✅ 至少1个跨CLI调用成功
- ✅ Hook/扩展机制被触发
- ✅ 任务能够传递和执行

### 完整成功标准
- ✅ 多个CLI间协作正常
- ✅ 复杂多步任务可完成
- ✅ 错误处理和回退有效

这个测试计划将帮助我们**全面验证Stigmergy-CLI系统的实际工作能力**，并识别任何潜在的问题！