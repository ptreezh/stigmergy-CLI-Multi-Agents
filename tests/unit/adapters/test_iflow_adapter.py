"""
iFlow CLI Workflow Pipeline适配器单元测试

遵循测试驱动开发(TDD)原则，先创建测试用例，再实现具体功能。
测试iFlow CLI的Workflow Pipeline集成机制。
"""

import pytest
import asyncio
import json
import datetime
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from typing import Dict, Any, Optional, List
from pathlib import Path

# 导入被测试的模块
from src.core.base_adapter import BaseCrossCLIAdapter
from src.core.parser import NaturalLanguageParser, IntentResult


class MockIFlowPipelineContext:
    """模拟iFlow CLI Pipeline上下文"""
    def __init__(self, workflow_id: str = "", stage: str = "", data: Dict = None):
        self.workflow_id = workflow_id or "test-workflow"
        self.stage = stage or "input"
        self.data = data or {}
        self.metadata = {
            'user_id': 'test_user',
            'session_id': 'test_session',
            'pipeline_config': {}
        }
        self.pipeline_name = "cross-cli-integration"
        self.version = "1.0.0"


class TestIFlowWorkflowAdapterTDD:
    """iFlow CLI Workflow Pipeline适配器TDD测试 - 遵循测试先行的原则"""

    @pytest.fixture
    def mock_adapter_class(self):
        """Mock适配器类用于TDD"""
        class IFlowWorkflowAdapter(BaseCrossCLIAdapter):
            def __init__(self, cli_name: str):
                super().__init__(cli_name)
                self.pipeline_stages = []
                self.processed_workflows = []
                self.workflow_executions = []
                self.pipeline_hooks = {}
                self.stages_processed = 0
                self.cross_cli_calls_count = 0

            async def initialize(self) -> bool:
                """初始化Workflow Pipeline系统"""
                try:
                    # 1. 加载Pipeline配置
                    await self._load_pipeline_config()

                    # 2. 注册Pipeline处理器
                    await self._register_pipeline_stages()

                    # 3. 设置Workflow Hooks
                    await self._setup_workflow_hooks()

                    # 4. 初始化任务队列
                    await self._initialize_task_queue()

                    return True
                except Exception as e:
                    print(f"初始化失败: {e}")
                    return False

            async def _load_pipeline_config(self) -> bool:
                """加载Pipeline配置"""
                config_path = Path("src/adapters/iflow/config.json")
                if config_path.exists():
                    with open(config_path, 'r', encoding='utf-8') as f:
                        self.pipeline_config = json.load(f)
                    return True
                return False

            async def _register_pipeline_stages(self) -> bool:
                """注册Pipeline阶段处理器"""
                self.pipeline_stages = [
                    'input_validation',
                    'cross_cli_detection',
                    'target_execution',
                    'result_processing',
                    'output_formatting'
                ]
                return True

            async def _setup_workflow_hooks(self) -> bool:
                """设置Workflow Hooks"""
                self.pipeline_hooks = {
                    'on_workflow_start': self.on_workflow_start,
                    'on_stage_complete': self.on_stage_complete,
                    'on_workflow_success': self.on_workflow_success,
                    'on_workflow_error': self.on_workflow_error,
                    'on_pipeline_ready': self.on_pipeline_ready
                }
                return True

            async def _initialize_task_queue(self) -> bool:
                """初始化任务队列"""
                self.task_queue = asyncio.Queue()
                return True

            def is_available(self) -> bool:
                """检查Pipeline系统是否可用"""
                return len(self.pipeline_stages) > 0

            async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
                """执行工作流任务"""
                return f"iFlow处理结果: {task}"

            # Pipeline Hook处理器
            async def on_workflow_start(self, context: MockIFlowPipelineContext) -> Optional[str]:
                """工作流开始Hook"""
                try:
                    self.stages_processed += 1
                    workflow_data = {
                        'workflow_id': context.workflow_id,
                        'stage': context.stage,
                        'data': context.data,
                        'metadata': context.metadata
                    }
                    self.processed_workflows.append(workflow_data)

                    # 检测跨CLI调用意图
                    if self._detect_cross_cli_intent(context):
                        target_cli, task = self._parse_cross_cli_task(context)
                        if target_cli and target_cli != 'iflow':
                            result = await self._execute_cross_cli_workflow(target_cli, task, context)
                            return result

                    return None  # 继续正常Pipeline流程

                except Exception as e:
                    print(f"工作流开始Hook错误: {e}")
                    return None

            async def on_stage_complete(self, context: MockIFlowPipelineContext, stage_result: Any) -> Optional[str]:
                """阶段完成Hook"""
                self.stages_processed += 1
                return None

            async def on_workflow_success(self, context: MockIFlowPipelineContext, final_result: Any) -> Optional[str]:
                """工作流成功Hook"""
                self.processed_workflows.append({
                    'type': 'workflow_success',
                    'workflow_id': context.workflow_id,
                    'result': final_result
                })
                return None

            async def on_workflow_error(self, context: MockIFlowPipelineContext, error: Exception) -> Optional[str]:
                """工作流错误Hook"""
                self.processed_workflows.append({
                    'type': 'workflow_error',
                    'workflow_id': context.workflow_id,
                    'error': str(error)
                })
                return None

            async def on_pipeline_ready(self, pipeline_config: Dict) -> Optional[str]:
                """Pipeline就绪Hook"""
                return None

            # 跨CLI功能
            def _detect_cross_cli_intent(self, context: MockIFlowPipelineContext) -> bool:
                """检测跨CLI调用意图"""
                import re
                user_input = context.data.get('prompt', '')
                patterns = [
                    r'调用\s*(\w+)\s*来',
                    r'使用\s*(\w+)\s*执行',
                    r'让\s*(\w+)\s*帮我',
                    r'use\s+(\w+)\s+to',
                    r'call\s+(\w+)\s+to',
                    r'ask\s+(\w+)\s+for'
                ]

                for pattern in patterns:
                    if re.search(pattern, user_input, re.IGNORECASE):
                        return True
                return False

            def _parse_cross_cli_task(self, context: MockIFlowPipelineContext) -> tuple:
                """解析跨CLI任务"""
                user_input = context.data.get('prompt', '')

                # 使用已有的解析器
                parser = NaturalLanguageParser()
                intent = parser.parse_intent(user_input, "iflow")

                if intent.is_cross_cli:
                    return intent.target_cli, intent.task

                return None, None

            async def _execute_cross_cli_workflow(self, target_cli: str, task: str, context: MockIFlowPipelineContext) -> str:
                """执行跨CLI工作流"""
                # 记录跨CLI调用
                self.cross_cli_calls_count += 1
                workflow_execution = {
                    'workflow_id': context.workflow_id,
                    'target_cli': target_cli,
                    'task': task,
                    'timestamp': datetime.datetime.now().isoformat()
                }
                self.workflow_executions.append(workflow_execution)

                # 模拟目标CLI调用
                mock_result = await self._mock_target_cli_workflow(target_cli, task, context)
                return self._format_workflow_result(target_cli, mock_result, context)

            async def _mock_target_cli_workflow(self, target_cli: str, task: str, context: MockIFlowPipelineContext) -> str:
                """模拟目标CLI工作流执行"""
                workflow_results = {
                    'claude': f"Claude工作流结果: 成功执行 '{task}' 的智能分析",
                    'gemini': f"Gemini工作流结果: 完成了 '{task}' 的AI处理流程",
                    'qwencode': f"QwenCode工作流结果: 代码生成 '{task}' 已完成",
                    'qoder': f"Qoder工作流结果: 开发任务 '{task}' 执行完毕",
                    'codebuddy': f"CodeBuddy工作流结果: 编程辅助 '{task}' 完成",
                    'codex': f"Codex工作流结果: 代码执行 '{task}' 结束"
                }
                return workflow_results.get(target_cli, f"{target_cli}工作流结果: {task}")

            def _format_workflow_result(self, target_cli: str, result: str, context: MockIFlowPipelineContext) -> str:
                """格式化工作流结果"""
                return f"""## 🔄 跨CLI工作流结果

**源工作流**: iFlow Pipeline ({context.workflow_id})
**目标CLI**: {target_cli.upper()}
**工作流阶段**: {context.stage}
**执行时间**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由iFlow跨CLI集成系统通过Workflow Pipeline提供*"""

        return IFlowWorkflowAdapter

    @pytest.fixture
    def adapter(self, mock_adapter_class):
        """创建适配器实例"""
        return mock_adapter_class("iflow")

    @pytest.fixture
    def mock_context(self):
        """创建模拟Pipeline上下文"""
        return MockIFlowPipelineContext(
            workflow_id="test-workflow-001",
            stage="input_validation",
            data={"prompt": "请用claude帮我分析这个算法"}
        )

    # ==================== TDD测试用例 ====================

    @pytest.mark.unit
    async def test_adapter_initialization(self, adapter):
        """测试适配器初始化"""
        result = await adapter.initialize()

        assert result is True, "适配器初始化应该成功"
        assert adapter.is_available() is True, "初始化后适配器应该可用"
        assert len(adapter.pipeline_stages) > 0, "应该加载Pipeline阶段"
        assert len(adapter.pipeline_hooks) > 0, "应该注册Pipeline Hooks"

    @pytest.mark.unit
    async def test_pipeline_configuration_loading(self, adapter):
        """测试Pipeline配置加载"""
        await adapter.initialize()

        assert hasattr(adapter, 'pipeline_config'), "应该加载Pipeline配置"

        # 验证配置结构
        if hasattr(adapter, 'pipeline_config'):
            config = adapter.pipeline_config
            assert 'adapter_name' in config, "配置应包含适配器名称"
            assert 'pipeline_mechanism' in config, "配置应包含Pipeline机制"

    @pytest.mark.unit
    async def test_pipeline_stages_registration(self, adapter):
        """测试Pipeline阶段注册"""
        await adapter.initialize()

        expected_stages = [
            'input_validation',
            'cross_cli_detection',
            'target_execution',
            'result_processing',
            'output_formatting'
        ]

        assert adapter.pipeline_stages == expected_stages, "应该注册正确的Pipeline阶段"

    @pytest.mark.unit
    async def test_workflow_hooks_setup(self, adapter):
        """测试Workflow Hooks设置"""
        await adapter.initialize()

        expected_hooks = [
            'on_workflow_start',
            'on_stage_complete',
            'on_workflow_success',
            'on_workflow_error',
            'on_pipeline_ready'
        ]

        assert set(adapter.pipeline_hooks.keys()) == set(expected_hooks), "应该设置正确的Workflow Hooks"

    @pytest.mark.unit
    async def test_cross_cli_detection_in_workflow(self, adapter, mock_context):
        """测试工作流中的跨CLI检测"""
        await adapter.initialize()

        # 测试跨CLI调用检测
        mock_context.data = {"prompt": "请用claude帮我分析数据"}
        is_cross_cli = adapter._detect_cross_cli_intent(mock_context)

        assert is_cross_cli is True, "应该检测到跨CLI调用意图"

    @pytest.mark.unit
    async def test_workflow_stage_processing_with_cross_cli(self, adapter, mock_context):
        """测试包含跨CLI的工作流阶段处理"""
        await adapter.initialize()

        mock_context.data = {"prompt": "使用gemini处理这个文本"}
        result = await adapter.on_workflow_start(mock_context)

        assert result is not None, "跨CLI调用应该返回结果"
        assert "gemini" in result.lower(), "结果应该包含目标CLI名称"
        assert "工作流结果" in result, "结果应该是工作流格式"

    @pytest.mark.unit
    async def test_workflow_stage_processing_normal_task(self, adapter, mock_context):
        """测试普通任务的工作流阶段处理"""
        await adapter.initialize()

        mock_context.data = {"prompt": "正常的数据处理任务"}
        result = await adapter.on_workflow_start(mock_context)

        assert result is None, "普通任务应该返回None，继续正常流程"
        assert adapter.stages_processed > 0, "应该处理了工作流阶段"

    @pytest.mark.unit
    async def test_workflow_self_reference_handling(self, adapter, mock_context):
        """测试工作流自我引用处理"""
        await adapter.initialize()

        mock_context.data = {"prompt": "使用iflow处理这个工作流"}
        target_cli, task = adapter._parse_cross_cli_task(mock_context)

        # 应该不触发跨CLI调用（避免自我引用）
        result = await adapter.on_workflow_start(mock_context)
        assert result is None, "自我引用应该返回None"

    @pytest.mark.unit
    async def test_multiple_target_cli_support(self, adapter, mock_context):
        """测试多目标CLI支持"""
        await adapter.initialize()

        supported_clis = ['claude', 'gemini', 'qwencode', 'qoder', 'codebuddy', 'codex']

        for cli in supported_clis:
            mock_context.data = {"prompt": f"请用{cli}帮我处理任务"}
            result = await adapter.on_workflow_start(mock_context)

            assert result is not None, f"应该支持{cli}的跨CLI调用"
            assert cli.upper() in result, f"结果应该包含{cli}"

    @pytest.mark.unit
    async def test_pipeline_hooks_configuration(self, adapter):
        """测试Pipeline Hooks配置"""
        await adapter.initialize()

        # 验证每个Hook都是可调用的
        for hook_name, hook_func in adapter.pipeline_hooks.items():
            assert callable(hook_func), f"Hook {hook_name} 应该是可调用的"

    @pytest.mark.unit
    async def test_workflow_result_formatting_consistency(self, adapter, mock_context):
        """测试工作流结果格式化一致性"""
        await adapter.initialize()

        mock_context.data = {"prompt": "请用claude分析这个算法"}
        result = await adapter.on_workflow_start(mock_context)

        # 验证格式化结构
        required_elements = [
            "🔄 跨CLI工作流结果",
            "源工作流**: iFlow Pipeline",
            "目标CLI**: CLAUDE",
            "工作流阶段",
            "执行时间",
            "Claude工作流结果",
            "通过Workflow Pipeline提供"
        ]

        for element in required_elements:
            assert element in result, f"工作流结果格式应该包含: {element}"

    @pytest.mark.unit
    async def test_workflow_error_handling(self, adapter, mock_context):
        """测试工作流错误处理"""
        await adapter.initialize()

        # 模拟工作流错误
        test_error = Exception("工作流执行错误")
        result = await adapter.on_workflow_error(mock_context, test_error)

        assert result is None, "错误处理应该返回None"

        # 验证错误被记录
        error_records = [w for w in adapter.processed_workflows if w.get('type') == 'workflow_error']
        assert len(error_records) > 0, "应该记录工作流错误"

    @pytest.mark.unit
    async def test_concurrent_workflow_processing(self, adapter, mock_context):
        """测试并发工作流处理"""
        await adapter.initialize()

        # 创建多个并发工作流
        workflows = []
        for i in range(3):
            workflow_context = MockIFlowPipelineContext(
                workflow_id=f"concurrent-workflow-{i}",
                stage="input_validation",
                data={"prompt": f"请用gemini处理任务{i}"}
            )
            workflows.append(adapter.on_workflow_start(workflow_context))

        # 并发执行
        results = await asyncio.gather(*workflows)

        # 验证结果
        for i, result in enumerate(results):
            assert result is not None, f"并发工作流{i}应该返回结果"
            assert "gemini" in result.lower(), f"结果{i}应该包含目标CLI"

    @pytest.mark.unit
    async def test_workflow_statistics_tracking(self, adapter, mock_context):
        """测试工作流统计跟踪"""
        await adapter.initialize()

        # 执行几个工作流
        await adapter.on_workflow_start(mock_context)
        await adapter.on_stage_complete(mock_context, "stage_result")
        await adapter.on_workflow_success(mock_context, "final_result")

        # 验证统计
        assert adapter.stages_processed > 0, "应该记录处理的阶段数"
        assert len(adapter.processed_workflows) > 0, "应该记录处理的工作流"

    @pytest.mark.unit
    async def test_workflow_context_preservation(self, adapter, mock_context):
        """测试工作流上下文保留"""
        await adapter.initialize()

        original_workflow_id = mock_context.workflow_id
        original_stage = mock_context.stage
        original_data = mock_context.data.copy()

        result = await adapter.on_workflow_start(mock_context)

        # 验证上下文未被修改
        assert mock_context.workflow_id == original_workflow_id, "工作流ID应该保持不变"
        assert mock_context.stage == original_stage, "阶段应该保持不变"
        assert mock_context.data == original_data, "数据应该保持不变"

    @pytest.mark.unit
    async def test_workflow_lifecycle(self, adapter, mock_context):
        """测试完整工作流生命周期"""
        await adapter.initialize()

        # 模拟完整工作流生命周期
        await adapter.on_workflow_start(mock_context)
        await adapter.on_stage_complete(mock_context, "intermediate_result")
        await adapter.on_workflow_success(mock_context, "success_result")

        # 验证生命周期记录
        workflow_types = [w.get('type') for w in adapter.processed_workflows]
        assert len(workflow_types) >= 2, "应该记录多个工作流事件"

    @pytest.mark.unit
    async def test_pipeline_specific_features(self, adapter, mock_context):
        """测试Pipeline特有功能"""
        await adapter.initialize()

        # 测试Pipeline配置功能
        pipeline_config = {"max_concurrent_workflows": 5}
        result = await adapter.on_pipeline_ready(pipeline_config)

        assert result is None, "Pipeline就绪Hook应该返回None"

    @pytest.mark.unit
    async def test_task_queue_initialization(self, adapter):
        """测试任务队列初始化"""
        await adapter.initialize()

        assert hasattr(adapter, 'task_queue'), "应该初始化任务队列"
        assert isinstance(adapter.task_queue, asyncio.Queue), "任务队列应该是asyncio.Queue类型"


class TestIFlowWorkflowAdapterEdgeCases:
    """iFlow适配器边界情况测试"""

    @pytest.fixture
    def adapter(self):
        """创建适配器实例"""
        # 直接使用实际的iFlow适配器
        from src.adapters.iflow.workflow_adapter import IFlowWorkflowAdapter
        return IFlowWorkflowAdapter("iflow")

    @pytest.mark.unit
    async def test_empty_workflow_handling(self, adapter):
        """测试空工作流处理"""
        await adapter.initialize()

        empty_context = MockIFlowPipelineContext(
            workflow_id="",
            stage="",
            data={}
        )

        result = await adapter.on_workflow_start(empty_context)
        assert result is None, "空工作流应该返回None"

    @pytest.mark.unit
    async def test_malformed_workflow_data(self, adapter):
        """测试格式错误的工作流数据"""
        await adapter.initialize()

        malformed_context = MockIFlowPipelineContext(
            workflow_id="test-workflow",
            stage="input_validation",
            data={"invalid": "data"}  # 缺少prompt字段
        )

        # 应该不抛出异常
        result = await adapter.on_workflow_start(malformed_context)
        assert result is None, "格式错误数据应该返回None"

    @pytest.mark.unit
    async def test_very_long_workflow_task(self, adapter):
        """测试超长工作流任务"""
        await adapter.initialize()

        long_prompt = "请用claude帮我分析" + "x" * 10000
        long_context = MockIFlowPipelineContext(
            workflow_id="long-workflow",
            stage="input_validation",
            data={"prompt": long_prompt}
        )

        result = await adapter.on_workflow_start(long_context)
        assert result is not None, "超长任务应该被处理"
        assert "claude" in result.lower(), "结果应该包含目标CLI"

    @pytest.mark.unit
    async def test_special_characters_in_workflow(self, adapter):
        """测试工作流中的特殊字符"""
        await adapter.initialize()

        special_prompt = "请用gemini处理包含特殊字符的任务: 🚀 @#$%^&*(){}[]|\\:;\"'<>?,./"
        special_context = MockIFlowPipelineContext(
            workflow_id="special-chars-workflow",
            stage="input_validation",
            data={"prompt": special_prompt}
        )

        # 应该不抛出异常
        result = await adapter.on_workflow_start(special_context)
        assert result is not None, "特殊字符任务应该被处理"

    @pytest.mark.unit
    async def test_unicode_workflow_content(self, adapter):
        """测试Unicode工作流内容"""
        await adapter.initialize()

        unicode_prompt = "请用qwencode处理包含Unicode的内容: 🎯 测试中文 ñoël español русский العربية"
        unicode_context = MockIFlowPipelineContext(
            workflow_id="unicode-workflow",
            stage="input_validation",
            data={"prompt": unicode_prompt}
        )

        result = await adapter.on_workflow_start(unicode_context)
        assert result is not None, "Unicode内容应该被正确处理"