# CLI之间具体调用链路详细解析

## 1. Claude → Gemini 完整调用链

### 用户输入
```text
用户在Claude CLI中: "请用Gemini帮我翻译这段英文：Hello World"
```

### 调用步骤

#### 步骤1: Claude Hook触发
**配置文件**: `~/.config/claude/hooks.json`
```json
{
  "user_prompt_submit": {
    "enabled": true,
    "handler": "python",
    "script_path": "C:\\Users\\Zhang\\.stigmergy-cli\\adapters\\claude\\hook_adapter.py",
    "config": {
      "detect_cross_cli": true,
      "collaboration_keywords": ["用", "请", "调用", "帮我"],
      "routing_enabled": true
    }
  }
}
```

#### 步骤2: Hook处理器执行
**文件**: `~/.stigmergy-cli/adapters/claude/hook_adapter.py`
```python
async def on_user_prompt_submit(self, context: HookContext) -> Optional[str]:
    user_input = "请用Gemini帮我翻译这段英文：Hello World"

    # 1. 检测跨CLI意图
    intent = self.parser.parse_intent(user_input, "claude")
    # intent结果: {
    #   "is_cross_cli": true,
    #   "target_cli": "gemini",
    #   "task": "翻译这段英文：Hello World",
    #   "confidence": 0.95
    # }

    if not intent.is_cross_cli:
        return None  # 让Claude正常处理

    # 2. 避免自我调用
    if intent.target_cli == self.cli_name:  # "claude"
        return None

    # 3. 执行跨CLI调用
    result = await self._execute_cross_cli_call(
        intent.target_cli,  # "gemini"
        intent.task,        # "翻译这段英文：Hello World"
        context
    )
    return result
```

#### 步骤3: 获取目标适配器
```python
async def _execute_cross_cli_call(self, target_cli, task, context):
    # 通过适配器工厂获取Gemini适配器
    target_adapter = self.get_adapter(target_cli)  # get_adapter("gemini")

    # 检查适配器可用性
    if not target_adapter or not target_adapter.is_available():
        return f"目标CLI工具 '{target_cli}' 不可用"

    # 构建执行上下文
    execution_context = {
        'source_cli': 'claude',
        'target_cli': 'gemini',
        'original_task': task,
        'timestamp': datetime.now().isoformat()
    }

    # 调用Gemini适配器执行任务
    result = await target_adapter.execute_task(task, execution_context)
    return self._format_success_result('gemini', task, result)
```

#### 步骤4: Gemini适配器执行
**文件**: `~/.stigmergy-cli/adapters/gemini/extension_adapter.py`
```python
async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
    # task: "翻译这段英文：Hello World"
    # context: {'source_cli': 'claude', 'target_cli': 'gemini', ...}

    # 创建Extension上下文
    extension_context = ExtensionContext(
        prompt=task,
        metadata=context.get('metadata', {})
    )

    # 检查是否需要进一步跨CLI调用
    intent = self.parser.parse_intent(task, "gemini")
    if intent.is_cross_cli and intent.target_cli != self.cli_name:
        # 如果Gemini也需要调用其他CLI，继续路由
        return await self._execute_cross_cli_call(...)

    # 执行Gemini本地处理
    gemini_result = await self._process_with_gemini(task)
    return gemini_result

async def _process_with_gemini(self, task: str) -> str:
    """调用Gemini CLI执行实际任务"""
    # 这里通过Gemini CLI的Extension API执行翻译
    # 实际实现会调用gemini命令行工具
    import subprocess
    try:
        result = subprocess.run([
            'gemini', '--translate', '--from', 'en', '--to', 'zh',
            'Hello World'
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            return f"Gemini翻译结果: {result.stdout.strip()}"
        else:
            return f"Gemini翻译失败: {result.stderr}"
    except Exception as e:
        return f"Gemini调用异常: {str(e)}"
```

#### 步骤5: 结果返回
```python
# Claude适配器格式化结果
def _format_success_result(self, target_cli, task, result):
    return f"""
🤖 通过{target_cli.upper()}完成任务:
📝 任务: {task}
✅ 结果: {result}
🔄 来源: Stigmergy跨CLI协作系统
"""
```

## 2. Qwen → iFlow 调用链

### 用户输入
```text
用户在Qwen CLI中: "用iflow帮我创建一个用户认证流程"
```

### 调用步骤

#### 步骤1: Qwen类继承触发
**配置文件**: `~/.qwen/config.json`
```json
{
  "version": "1.0.0",
  "stigmergy_integration": true,
  "integration": {
    "enabled": true,
    "type": "class_extension",
    "adapter_class": "StigmergyQwenAdapter",
    "cross_cli_enabled": true,
    "collaboration_config": {
      "keywords": ["用", "请", "调用", "帮我"],
      "auto_route": true
    }
  }
}
```

#### 步骤2: Qwen类继承处理
**文件**: `~/.stigmergy-cli/adapters/qwen/standalone_qwencode_adapter.py`
```python
class StandaloneQwenCodeAdapter:
    def process_command(self, command: str, args: List[str]) -> str:
        # 重写QwenCodeCLI的process_command方法
        user_input = f"{command} {' '.join(args)}"

        # 检测跨CLI意图
        if self._detect_cross_cli_intent(user_input):
            target_cli, task = self._parse_cross_cli_intent(user_input)
            return self._execute_cross_cli_call(target_cli, task)

        # 非跨CLI调用，使用原始Qwen处理
        return super().process_command(command, args)

    def _detect_cross_cli_intent(self, user_input: str) -> bool:
        """检测是否为跨CLI调用"""
        patterns = [
            r"用(\w+)帮我",
            r"请(\w+)来",
            r"调用(\w+)",
            r"use (\w+) to",
            r"call (\w+) to"
        ]

        for pattern in patterns:
            if re.search(pattern, user_input, re.IGNORECASE):
                return True
        return False

    def _parse_cross_cli_intent(self, user_input: str) -> Tuple[str, str]:
        """解析跨CLI调用意图"""
        # 匹配 "用iflow帮我创建一个用户认证流程"
        match = re.search(r"用(\w+)帮我(.*)", user_input)
        if match:
            target_cli = match.group(1).lower()  # "iflow"
            task = match.group(2).strip()        # "创建一个用户认证流程"
            return target_cli, task

        return None, None
```

#### 步骤3: iFlow工作流适配器
**文件**: `~/.stigmergy-cli/adapters/iflow/workflow_adapter.py`
```python
class iFlowWorkflowAdapter:
    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        # task: "创建一个用户认证流程"

        # 检查iFlow CLI可用性
        if not self._check_iflow_availability():
            return "iFlow CLI不可用"

        # 创建工作流配置
        workflow_config = {
            "name": "user_authentication_workflow",
            "description": task,
            "steps": [
                {"name": "user_login", "type": "authentication"},
                {"name": "token_validation", "type": "security"},
                {"name": "user_session", "type": "session_management"}
            ],
            "source_cli": context.get('source_cli', 'unknown'),
            "stigmergy_integration": True
        }

        # 通过iFlow CLI执行工作流
        return await self._execute_iflow_workflow(workflow_config)

    async def _execute_iflow_workflow(self, config: Dict) -> str:
        """通过iFlow CLI执行工作流"""
        import subprocess
        import json

        try:
            # 创建临时工作流文件
            workflow_file = f"/tmp/stigmergy_workflow_{config['name']}.json"
            with open(workflow_file, 'w') as f:
                json.dump(config, f, indent=2)

            # 调用iFlow CLI执行工作流
            result = subprocess.run([
                'iflow', 'workflow', 'create',
                '--config', workflow_file,
                '--execute'
            ], capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                return f"""
🔄 iFlow工作流执行成功:
📋 工作流: {config['name']}
📝 描述: {config['description']}
🚀 结果: {result.stdout}
✨ 来源: Qwen通过Stigmergy系统调用
                """
            else:
                return f"iFlow工作流执行失败: {result.stderr}"

        except Exception as e:
            return f"iFlow调用异常: {str(e)}"
        finally:
            # 清理临时文件
            if os.path.exists(workflow_file):
                os.remove(workflow_file)
```

## 3. 多轮协作: Claude → Qwen → iFlow

### 场景：复杂任务的多步协作
```text
用户在Claude中: "请用Qwen分析这个需求，然后用ilow创建实现流程"
```

### 调用链
```
Claude Hook → Qwen适配器 → Qwen分析 → iFlow适配器 → iFlow创建流程 → 返回Claude
```

#### 步骤1: Claude分解任务
```python
# Claude适配器检测到多重调用意图
intent = self.parser.parse_multi_step_intent(user_input)
# 解析结果: [
#   {"target": "qwen", "task": "分析这个需求", "order": 1},
#   {"target": "iflow", "task": "创建实现流程", "order": 2, "depends_on": 1}
# ]
```

#### 步骤2: 顺序执行
```python
results = []
for step in intent.steps:
    if step.order == 1:
        # 第一步：调用Qwen分析
        qwen_result = await self._call_cli("qwen", step.task)
        results.append(("qwen", qwen_result))

    elif step.order == 2 and step.depends_on == 1:
        # 第二步：基于Qwen分析结果调用iFlow
        analysis_result = results[0][1]  # 获取Qwen的分析结果
        enhanced_task = f"{step.task}\n\n基于Qwen的分析结果:\n{analysis_result}"
        iflow_result = await self._call_cli("iflow", enhanced_task)
        results.append(("iflow", iflow_result))

# 组装最终结果
final_result = self._format_multi_step_result(results)
```

## 项目支持跨CLI协作的具体工作

### 1. 核心基础设施

#### 适配器工厂系统
```python
# 文件: ~/.stigmergy-cli/adapters/adapter_factory.py
class CrossCLIAdapterFactory:
    def __init__(self):
        self.adapters = {}
        self._register_all_adapters()

    def _register_all_adapters(self):
        """注册所有可用的CLI适配器"""
        self.adapters.update({
            'claude': ClaudeHookAdapter(),
            'gemini': GeminiExtensionAdapter(),
            'qwen': StandaloneQwenCodeAdapter(),
            'iflow': iFlowWorkflowAdapter(),
            'codebuddy': CodeBuddyPluginAdapter(),
            'qoder': QoderEnvironmentAdapter(),
            'copilot': CopilotExtensionAdapter()
        })

    def get_adapter(self, cli_name: str):
        """获取指定CLI的适配器"""
        return self.adapters.get(cli_name.lower())
```

#### 自然语言解析器
```python
# 文件: ~/.stigmergy-cli/adapters/natural_language_parser.py
class NaturalLanguageParser:
    def __init__(self):
        # 支持中英文协作协议
        self.chinese_patterns = [
            r"用(\w+)帮我(.+)",
            r"请(\w+)来(.+)",
            r"调用(\w+)(.+)",
            r"让(\w+)(.+)"
        ]

        self.english_patterns = [
            r"use (\w+) to (.+)",
            r"call (\w+) to (.+)",
            r"ask (\w+) for (.+)",
            r"let (\w+) (.+)"
        ]

        self.cli_names = {
            'claude': ['claude', '克劳德'],
            'gemini': ['gemini', '双子座'],
            'qwen': ['qwen', '通义', '千问'],
            'iflow': ['iflow', 'ai流'],
            'codebuddy': ['codebuddy', '代码伙伴'],
            'qoder': ['qoder', '编码器'],
            'copilot': ['copilot', '副驾驶']
        }

    def parse_intent(self, user_input: str, source_cli: str) -> IntentResult:
        """解析用户输入的跨CLI调用意图"""
        # 检测是否包含跨CLI关键词
        for pattern in self.chinese_patterns + self.english_patterns:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                target_cli_name = match.group(1).lower()
                task = match.group(2).strip()

                # 映射到标准CLI名称
                target_cli = self._map_cli_name(target_cli_name)
                if target_cli and target_cli != source_cli:
                    return IntentResult(
                        is_cross_cli=True,
                        target_cli=target_cli,
                        task=task,
                        confidence=0.9,
                        source_cli=source_cli
                    )

        return IntentResult(is_cross_cli=False, target_cli=None, task=user_input)
```

### 2. 配置文件部署

#### 每个CLI的原生配置
```
~/.config/claude/hooks.json          # Claude Hook配置
~/.config/gemini/extensions.json     # Gemini Extension配置
~/.qwen/config.json                  # Qwen类继承配置
~/.config/iflow/workflows.json       # iFlow工作流配置
~/.codebuddy/plugins.json            # CodeBuddy插件配置
~/.qoder/env_hooks.json              # Qoder环境钩子配置
~/.config/copilot/extensions.json    # Copilot扩展配置
```

#### 统一路由配置
```
~/.stigmergy-cli/
├── router.json           # 全局路由规则
├── global-config.json    # 全局协作配置
├── adapters/            # 所有适配器
│   ├── claude/
│   ├── gemini/
│   ├── qwen/
│   ├── iflow/
│   ├── codebuddy/
│   ├── qoder/
│   └── copilot/
└── logs/                # 协作日志
```

### 3. 错误处理和回退机制

```python
class CrossCLIRouter:
    async def route_with_fallback(self, target_cli: str, task: str) -> str:
        """带回退机制的路由"""
        try:
            # 尝试主要目标
            result = await self._call_primary_target(target_cli, task)
            return result

        except PrimaryTargetUnavailable:
            # 主目标不可用，尝试回退选项
            fallback_cli = self._get_fallback_cli(target_cli, task)
            if fallback_cli:
                return await self._call_fallback_target(fallback_cli, task)

        except AllTargetsUnavailable:
            # 所有目标都不可用，返回错误信息
            return self._format_unavailable_error(target_cli, task)

    def _get_fallback_cli(self, primary_cli: str, task: str) -> Optional[str]:
        """根据任务类型选择回退CLI"""
        task_type = self._classify_task(task)
        fallback_map = {
            'translation': {'gemini', 'claude'},
            'coding': {'codebuddy', 'qoder', 'copilot'},
            'analysis': {'claude', 'gemini', 'qwen'},
            'workflow': {'iflow'}
        }

        fallback_options = fallback_map.get(task_type, set())
        return (fallback_options - {primary_cli}).pop() if fallback_options else None
```

### 4. 性能优化和缓存

```python
class PerformanceOptimizer:
    def __init__(self):
        self.adapter_cache = {}
        self.result_cache = LRUCache(maxsize=100)
        self.health_check_cache = {}

    async def get_cached_adapter(self, cli_name: str):
        """获取缓存的适配器实例"""
        if cli_name not in self.adapter_cache:
            self.adapter_cache[cli_name] = await self._create_adapter(cli_name)
        return self.adapter_cache[cli_name]

    def cache_result(self, task_hash: str, result: str, ttl: int = 300):
        """缓存任务结果"""
        self.result_cache[task_hash] = {
            'result': result,
            'expires_at': time.time() + ttl
        }
```

这就是完整的Stigmergy-CLI跨协作系统的实现细节！每个CLI都通过其原生扩展机制感知和调用其他CLI，实现真正的无缝协作。