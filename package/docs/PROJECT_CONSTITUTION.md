# 🏛️ Stigmergy-CLI 项目宪法

**强制必须对齐和遵守的核心设计原则与实施指南**

## 🎖️ 项目核心理念

### 基本原则
1. **简洁性原则** - 每个组件只做一件事，做好一件事
2. **独立性原则** - 适配器完全独立，无复杂依赖关系
3. **直接性原则** - 直接subprocess调用，无抽象层
4. **原生性原则** - 利用CLI工具的原生扩展机制

### 禁止事项 (❌ FORBIDDEN)
- **禁止复杂抽象层** - 不得创建BaseAdapter、Factory等复杂抽象
- **禁止依赖注入** - 不得使用依赖注入框架或IoC容器
- **禁止过度工程化** - 不得为简单问题创建复杂解决方案
- **禁止核心模块** - 不得创建core/目录和复杂的核心基础设施
- **禁止抽象工厂** - 不得使用Factory Pattern管理适配器

### 强制要求 (✅ MANDATORY)
- **每个适配器独立工作** - 必须能在没有其他适配器的情况下运行
- **直接subprocess调用** - 必须使用subprocess直接调用目标CLI工具
- **原生Hook集成** - 必须使用每个CLI的原生扩展机制
- **简单JSON配置** - 必须使用简单的JSON配置文件进行路由
- **无依赖设计** - 适配器之间不得有任何依赖关系

## 🏗️ 强制架构设计

### 适配器架构 (强制)
```python
# 正确的适配器结构 (✅)
class ClaudeCrossCLIHandler:
    """Claude CLI 跨工具处理器 - 完全独立"""

    def detect_cross_cli(self, text: str) -> tuple:
        """检测跨CLI调用意图 - 直接实现"""
        pass

    def call_cli_tool(self, cli_name: str, task: str) -> str:
        """直接调用CLI工具 - 使用subprocess"""
        return subprocess.run([cli_name, task], capture_output=True, text=True).stdout

    def handle_user_input(self, user_input: str) -> str:
        """处理用户输入 - 直接逻辑"""
        target_cli, task = self.detect_cross_cli(user_input)
        if target_cli:
            return self.call_cli_tool(target_cli, task)
        return None
```

### 禁止的架构 (❌ 禁止)
```python
# ❌ 错误的抽象层设计
class BaseCrossCLIAdapter(ABC):  # 禁止！
    @abstractmethod
    def execute_task(self, task: str, context: dict) -> str:
        pass

class CrossCLIAdapterFactory:  # 禁止！
    def get_adapter(self, cli_name: str):
        pass
```

### 文件结构 (强制)
```
~/.stigmergy-cli/
├── adapters/                    # 适配器目录
│   ├── claude/
│   │   └── cross_cli_handler.py    # 独立的Claude适配器 (50-100行)
│   ├── gemini/
│   │   └── extension_handler.py    # 独立的Gemini适配器 (50-100行)
│   ├── qwen/
│   │   └── class_enhancer.py        # 独立的Qwen适配器 (50-100行)
│   └── iflow/
│       └── workflow_handler.py     # 独立的iFlow适配器 (50-100行)
├── routing.json                   # 简单的路由配置 (JSON)
└── logs/                          # 可选的日志目录
```

### 禁止的文件结构 (❌ 禁止)
```
~/.stigmergy-cli/
├── core/                          # ❌ 禁止！复杂的核心模块
│   ├── base_adapter.py
│   ├── parser.py
│   └── factory.py
├── adapters/
│   └── base/                      # ❌ 禁止！抽象基类
└── complex_dependencies/         # ❌ 禁止！复杂依赖
```

## 🔧 强制实施指南

### 每个适配器必须包含 (强制)
1. **跨CLI检测函数** - 直接实现，无继承
2. **CLI调用函数** - 使用subprocess直接调用
3. **Hook入口函数** - 与CLI原生扩展集成
4. **错误处理** - 简单直接的错误处理
5. **单文件设计** - 每个适配器一个Python文件
6. **双向支持** - 必须支持与其他CLI工具的双向调用
7. **项目文档同步** - 必须处理.md文件的共享和更新

### 项目文档共享机制 (强制)
所有CLI工具必须能够：
- **读取其他CLI的项目文档** - {claude.md, qwen.md, gemini.md, iflow.md}
- **更新项目上下文** - 将跨CLI协作结果写入对应文档
- **共享任务计划** - 在文档中记录协作任务和状态
- **维护项目历史** - 跟踪跨CLI协作的完整历史

### 适配器代码模板 (强制使用)
```python
#!/usr/bin/env python3
"""
{CLI_NAME} CLI 跨工具处理器 - 独立版本
遵循项目宪法：简洁、独立、直接、双向
"""

import subprocess
import re
import json
from pathlib import Path
from datetime import datetime
import os

# CLI工具项目文档路径映射
PROJECT_DOCS = {
    'claude': Path.home() / '.claude' / 'claude.md',
    'gemini': Path.home() / '.gemini' / 'gemini.md',
    'qwen': Path.home() / '.qwen' / 'qwen.md',
    'iflow': Path.home() / '.config' / 'iflow' / 'iflow.md',
    'codebuddy': Path.home() / '.codebuddy' / 'codebuddy.md',
    'qodercli': Path.home() / '.qoder' / 'qodercli.md',
    'copilot': Path.home() / '.config' / 'copilot' / 'copilot.md'
}

def load_routing_config():
    """加载路由配置"""
    config_path = Path.home() / '.stigmergy-cli' / 'routing.json'
    if config_path.exists():
        with open(config_path, encoding='utf-8') as f:
            return json.load(f)
    return {"cli_mappings": {}}

def detect_cross_cli(text: str) -> tuple:
    """检测跨CLI调用 - 直接模式匹配"""
    patterns = [
        r"用(\w+)帮我(.+)",
        r"请(\w+)来(.+)",
        r"调用(\w+)(.+)",
        r"use (\w+) to (.+)",
        r"call (\w+) to (.+)",
        r"ask (\w+) for (.+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            cli_name = match.group(1).lower()
            task = match.group(2).strip()
            return cli_name, task
    return None, None

def call_cli_tool(cli_name: str, task: str, source_cli: str = None) -> str:
    """直接调用CLI工具 - 双向支持"""
    cli_commands = {
        'claude': ['claude', '--print', task],
        'gemini': ['gemini', task],
        'qwen': ['qwen', task],
        'iflow': ['iflow', task],
        'codebuddy': ['codebuddy', task],
        'qodercli': ['qodercli', task],
        'copilot': ['copilot', task]
    }

    if cli_name not in cli_commands:
        return f"❌ 不支持的CLI工具: {cli_name}"

    # 记录调用到项目文档
    if source_cli:
        _record_collaboration(source_cli, cli_name, task)

    try:
        print(f"🔄 正在调用 {cli_name.upper()}...")
        result = subprocess.run(
            cli_commands[cli_name],
            capture_output=True,
            text=True,
            timeout=60
        )

        output = result.stdout if result.returncode == 0 else result.stderr

        # 记录结果到项目文档
        if source_cli:
            _record_result(source_cli, cli_name, task, output)

        return output
    except Exception as e:
        return f"❌ {cli_name.upper()} 调用失败: {str(e)}"

def _record_collaboration(source_cli: str, target_cli: str, task: str):
    """记录协作任务到项目文档"""
    try:
        # 更新源CLI项目文档
        source_doc = PROJECT_DOCS.get(source_cli)
        if source_doc and source_doc.exists():
            _append_to_project_doc(source_doc, source_cli, target_cli, task, "REQUESTED")

        # 更新目标CLI项目文档
        target_doc = PROJECT_DOCS.get(target_cli)
        if target_doc and target_doc.exists():
            _append_to_project_doc(target_doc, source_cli, target_cli, task, "CALLED")
    except Exception as e:
        print(f"⚠️ 记录协作任务失败: {e}")

def _record_result(source_cli: str, target_cli: str, task: str, result: str):
    """记录协作结果到项目文档"""
    try:
        # 更新源CLI项目文档
        source_doc = PROJECT_DOCS.get(source_cli)
        if source_doc and source_doc.exists():
            _append_to_project_doc(source_doc, source_cli, target_cli, task, "COMPLETED", result)

        # 更新目标CLI项目文档
        target_doc = PROJECT_DOCS.get(target_cli)
        if target_doc and target_doc.exists():
            _append_to_project_doc(target_doc, source_cli, target_cli, task, "EXECUTED", result)
    except Exception as e:
        print(f"⚠️ 记录协作结果失败: {e}")

def _append_to_project_doc(doc_path: Path, source_cli: str, target_cli: str, task: str, status: str, result: str = ""):
    """向项目文档添加协作记录"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    collaboration_entry = f"""
## 🤖 跨CLI协作记录

**时间**: {timestamp}
**源CLI**: {source_cli.upper()}
**目标CLI**: {target_cli.upper()}
**任务**: {task}
**状态**: {status}
{f"**结果**: {result[:200]}..." if len(result) > 200 else f"**结果**: {result}" if result else ""}

---
"""

    try:
        with open(doc_path, 'a', encoding='utf-8') as f:
            f.write(collaboration_entry)
    except Exception as e:
        print(f"⚠️ 更新项目文档失败 {doc_path}: {e}")

def sync_project_contexts():
    """同步所有CLI项目的上下文"""
    shared_context = {
        "project_overview": "Stigmergy-CLI跨工具协作系统",
        "supported_tools": ["claude", "gemini", "qwen", "iflow", "codebuddy", "qodercli", "copilot"],
        "last_sync": datetime.now().isoformat()
    }

    for cli, doc_path in PROJECT_DOCS.items():
        if doc_path and doc_path.exists():
            try:
                # 确保文档存在并包含基本结构
                content = doc_path.read_text(encoding='utf-8')
                if "## 🤖 跨工具协作系统" not in content:
                    _initialize_project_doc(doc_path, cli, shared_context)
            except Exception as e:
                print(f"⚠️ 同步项目上下文失败 {doc_path}: {e}")

def _initialize_project_doc(doc_path: Path, cli_name: str, context: dict):
    """初始化项目文档"""
    initial_content = f"""# 🤖 {cli_name.upper()} 项目文档

## 📋 项目信息
- **CLI工具**: {cli_name.upper()}
- **Stigmergy集成**: ✅ 已启用
- **最后同步**: {context['last_sync']}

## 🔄 跨工具协作能力
支持以下CLI工具的双向协作:
{chr(10).join([f"- {tool.upper()}" for tool in context['supported_tools']])}

## 📝 使用指南
### 跨CLI调用示例
- `请用gemini帮我翻译这段代码`
- `调用claude分析这个需求`
- `用iflow创建工作流`

### 协作历史
跨工具协作的详细记录将显示在下方。

---
*本文档由Stigermy-CLI自动维护*
"""

    doc_path.parent.mkdir(parents=True, exist_ok=True)
    with open(doc_path, 'w', encoding='utf-8') as f:
        f.write(initial_content)

def hook_entry_point(prompt: str, metadata: dict) -> str:
    """Hook入口点 - 与CLI原生扩展集成"""
    # 获取源CLI名称
    source_cli = metadata.get('source_cli', 'unknown')

    target_cli, task = detect_cross_cli(prompt)

    if target_cli and target_cli != source_cli:
        # 跨CLI调用
        result = call_cli_tool(target_cli, task, source_cli)

        return f"""
🤖 跨CLI协作完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 源CLI: {source_cli.upper()}
🎯 目标CLI: {target_cli.upper()}
📝 执行任务: {task}
✅ 执行结果:
{result}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """

    return None  # 让原始CLI正常处理

# 独立测试入口
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = hook_entry_point(' '.join(sys.argv[1:]), {'source_cli': 'test'})
        if result:
            print(result)
```

---

## 📊 成功标准与验收条件

### 验收条件清单 (Must-Have)

#### Phase 1: 基础功能验收
- [ ] 用户可以在Claude CLI中调用Gemini CLI
- [ ] 用户可以在Gemini CLI中调用Claude CLI
- [ ] 系统能正确识别自然语言中的跨CLI调用意图
- [ ] 结果正确格式化并显示在源CLI中

#### Phase 2: 多CLI支持验收
- [ ] 8个目标CLI工具全部集成成功
- [ ] 每个CLI使用其最优集成机制
- [ ] 跨CLI调用成功率 >95%
- [ ] 错误处理和降级机制正常工作

#### Phase 3: 用户体验验收
- [ ] 安装过程一键完成
- [ ] 无需额外配置即可使用
- [ ] 学习曲线最小化
- [ ] 现有CLI功能不受影响

### 性能标准
- **响应时间：** 跨CLI调用在30秒内完成
- **系统开销：** 集成对CLI操作的影响 <100ms
- **可用性：** 核心功能可用率 >99%

### 质量标准
- **代码覆盖率：** 核心组件 >90%
- **兼容性：** 支持Python 3.8+，主流操作系统
- **安全性：** 通过安全审计，无已知漏洞

---

## 🔄 项目执行原则

### 1. 渐进式实现 (Progressive Implementation)
- **原则：** 先实现核心功能，再扩展完整生态
- **Phase 1:** Claude + Gemini + Aider（高优先级CLI）
- **Phase 2:** 剩余5个CLI工具
- **Phase 3:** 优化和扩展功能

### 2. 测试驱动开发 (Test-Driven Development)
- **原则：** 每个适配器必须有完整的测试覆盖
- **要求：** 单元测试、集成测试、端到端测试
- **标准：** 所有测试通过才能发布

### 3. 用户反馈驱动 (User Feedback Driven)
- **原则：** 定期收集用户反馈并快速迭代
- **机制：** Beta测试用户群、反馈收集渠道
- **响应：** 关键问题48小时内响应

### 4. 文档同步 (Documentation Sync)
- **原则：** 代码变更必须有相应的文档更新
- **要求：** API文档、用户手册、集成指南
- **标准：** 文档准确性100%

---

## ⚠️ 风险管理

### 高风险项目
1. **CLI工具API变更** - 目标CLI工具可能改变其API或集成机制
2. **性能影响** - 集成可能对CLI性能产生不可预见的影响
3. **兼容性问题** - 不同版本的CLI工具可能存在兼容性问题

### 风险缓解策略
1. **版本管理：** 维护兼容性矩阵，支持多个CLI版本
2. **性能监控：** 持续监控集成性能，快速优化瓶颈
3. **模块化设计：** 每个适配器独立，限制故障传播范围

---

## 📝 修订历史

| 版本 | 日期 | 主要变更 | 变更原因 |
|------|------|----------|----------|
| 1.0 | 2025-01-22 | 初始版本 | 基于用户需求讨论创建 |

---

## 📞 联系与反馈

**项目负责人：** AI System
**反馈渠道：** 项目Issue Tracker
**紧急联系：** 项目维护团队

---

### 宪法声明

本项目宪法是项目执行的最高指导原则，所有项目决策和实现都必须遵守本宪法中明确的需求和约束。任何对本宪法的修改都必须经过正式的变更管理流程并获得项目利益相关者的批准。

**本宪法自2025年1月22日起生效，直至被正式修订为止。**

---

*此项目宪法明确界定项目的核心需求、技术约束和执行原则，确保项目在正确的轨道上推进，满足用户的真实需求。*