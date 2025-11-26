"""
iFlow CLI Workflow Pipeline适配器

通过iFlow CLI的Workflow Pipeline系统实现跨CLI调用功能。
基于通用workflow插件架构，支持灵活的工作流扩展。
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Union

from src.core.base_adapter import BaseCrossCLIAdapter
from src.core.parser import NaturalLanguageParser

# 配置日志
logger = logging.getLogger(__name__)


class WorkflowContext:
    """iFlow CLI工作流上下文"""

    def __init__(self, workflow_id: str = "", stage: str = "", data: Dict = None):
        self.workflow_id = workflow_id
        self.stage = stage
        self.data = data or {}
        self.metadata = {
            'user_id': 'default_user',
            'session_id': '',
            'pipeline_config': {}
        }
        self.pipeline_name = "cross-cli-integration"
        self.version = "1.0.0"
        self.start_time = datetime.now()
        self.status = "pending"


class WorkflowStage:
    """工作流阶段"""

    def __init__(self, name: str, description: str = "", required: bool = True, timeout: int = 30):
        self.name = name
        self.description = description
        self.required = required
        self.timeout = timeout
        self.status = "pending"
        self.result = None
        self.error = None
        self.start_time = None
        self.end_time = None


class IFlowWorkflowAdapter(BaseCrossCLIAdapter):
    """
    iFlow CLI Workflow Pipeline适配器

    通过iFlow CLI的Workflow Pipeline系统实现跨CLI调用功能。
    基于工作流的无损扩展实现。

    Pipeline机制:
    - on_workflow_start: 工作流开始时触发
    - on_stage_complete: 阶段完成时触发
    - on_workflow_success: 工作流成功完成时触发
    - on_workflow_error: 工作流错误时触发
    - on_pipeline_ready: 流水线就绪时触发
    """

    def __init__(self, cli_name: str = "iflow"):
        super().__init__(cli_name)

        # Pipeline相关属性
        self.pipeline_stages: List[WorkflowStage] = []
        self.workflow_hooks: Dict[str, callable] = {}
        self.processed_workflows: List[Dict] = []
        self.workflow_executions: List[Dict] = []
        self.task_queue: Optional[asyncio.Queue] = None

        # 统计信息
        self.stages_processed = 0
        self.cross_cli_calls_count = 0
        self.workflow_count = 0

        # 配置
        self.pipeline_config: Dict = {}
        self.workflow_config: Dict = {}

        # 组件
        self.parser = NaturalLanguageParser()

        logger.info("iFlow Workflow Pipeline适配器初始化完成")

    async def initialize(self) -> bool:
        """
        初始化适配器

        Returns:
            bool: 初始化是否成功
        """
        try:
            logger.info("开始初始化iFlow Workflow Pipeline适配器...")

            # 1. 加载Pipeline配置
            if not await self._load_pipeline_config():
                logger.error("Pipeline配置加载失败")
                return False

            # 2. 初始化工作流阶段
            if not await self._initialize_workflow_stages():
                logger.error("工作流阶段初始化失败")
                return False

            # 3. 注册工作流Hooks
            if not await self._register_workflow_hooks():
                logger.error("工作流Hooks注册失败")
                return False

            # 4. 初始化任务队列
            if not await self._initialize_task_queue():
                logger.error("任务队列初始化失败")
                return False

            # 5. 创建工作流配置目录
            await self._ensure_config_directory()

            logger.info("iFlow Workflow Pipeline适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化iFlow Workflow Pipeline适配器失败: {e}")
            return False

    async def _load_pipeline_config(self) -> bool:
        """
        加载Pipeline配置

        Returns:
            bool: 加载是否成功
        """
        try:
            config_path = Path(__file__).parent / "config.json"

            if config_path.exists():
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)

                self.pipeline_config = config
                self.workflow_config = config.get('workflow', {})
                logger.info("Pipeline配置加载成功")
                return True
            else:
                logger.warning("Pipeline配置文件不存在，使用默认配置")
                self.pipeline_config = self._get_default_config()
                return True

        except Exception as e:
            logger.error(f"加载Pipeline配置失败: {e}")
            return False

    def _get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            "adapter_name": "iFlow Workflow Pipeline Adapter",
            "pipeline_mechanism": "workflow_pipeline",
            "supported_clis": ["claude", "gemini", "qwencode", "qoder", "codebuddy", "codex"],
            "workflow": {
                "default_settings": {
                    "parallel_execution": True,
                    "error_handling": "continue",
                    "retry_on_failure": True
                }
            }
        }

    async def _initialize_workflow_stages(self) -> bool:
        """
        初始化工作流阶段

        Returns:
            bool: 初始化是否成功
        """
        try:
            stage_configs = self.workflow_config.get('pipeline_setup', {}).get('stages', [])

            default_stages = [
                WorkflowStage("input_validation", "输入数据验证", True, 5),
                WorkflowStage("cross_cli_detection", "跨CLI调用检测", True, 10),
                WorkflowStage("target_execution", "目标CLI执行", False, 25),
                WorkflowStage("result_processing", "结果处理", True, 8),
                WorkflowStage("output_formatting", "输出格式化", True, 3)
            ]

            # 如果配置中有阶段定义，使用配置中的定义
            if stage_configs:
                self.pipeline_stages = []
                for stage_config in stage_configs:
                    stage = WorkflowStage(
                        stage_config['name'],
                        stage_config.get('description', ''),
                        stage_config.get('required', True),
                        stage_config.get('timeout', 30)
                    )
                    self.pipeline_stages.append(stage)
            else:
                self.pipeline_stages = default_stages

            logger.info(f"工作流阶段初始化完成，共{len(self.pipeline_stages)}个阶段")
            return True

        except Exception as e:
            logger.error(f"初始化工作流阶段失败: {e}")
            return False

    async def _register_workflow_hooks(self) -> bool:
        """
        注册工作流Hooks

        Returns:
            bool: 注册是否成功
        """
        try:
            self.workflow_hooks = {
                'on_workflow_start': self.on_workflow_start,
                'on_stage_complete': self.on_stage_complete,
                'on_workflow_success': self.on_workflow_success,
                'on_workflow_error': self.on_workflow_error,
                'on_pipeline_ready': self.on_pipeline_ready
            }

            logger.info("工作流Hooks注册成功")
            return True

        except Exception as e:
            logger.error(f"注册工作流Hooks失败: {e}")
            return False

    async def _initialize_task_queue(self) -> bool:
        """
        初始化任务队列

        Returns:
            bool: 初始化是否成功
        """
        try:
            self.task_queue = asyncio.Queue()
            logger.info("任务队列初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化任务队列失败: {e}")
            return False

    async def _ensure_config_directory(self) -> None:
        """确保配置目录存在"""
        config_dir = Path.home() / ".config" / "iflow" / "adapters"
        config_dir.mkdir(parents=True, exist_ok=True)

    def is_available(self) -> bool:
        """
        检查适配器是否可用

        Returns:
            bool: 是否可用
        """
        return (
            len(self.pipeline_stages) > 0 and
            len(self.workflow_hooks) > 0 and
            self.task_queue is not None
        )

    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        执行工作流任务

        Args:
            task: 要执行的任务
            context: 执行上下文

        Returns:
            str: 执行结果
        """
        try:
            logger.info(f"执行iFlow工作流任务: {task}")

            # 创建工作流上下文
            workflow_context = WorkflowContext(
                workflow_id=context.get('workflow_id', f'workflow-{datetime.now().timestamp()}'),
                stage="execution",
                data={"task": task, **context}
            )

            # 执行工作流
            result = await self._execute_workflow(workflow_context)

            return result

        except Exception as e:
            logger.error(f"执行工作流任务失败: {e}")
            return f"工作流执行失败: {str(e)}"

    # ==================== Workflow Hook处理器 ====================

    async def on_workflow_start(self, context: WorkflowContext) -> Optional[str]:
        """
        工作流开始Hook

        Args:
            context: 工作流上下文

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.workflow_count += 1
            self.stages_processed += 1

            # 记录工作流开始
            workflow_record = {
                'type': 'workflow_start',
                'workflow_id': context.workflow_id,
                'stage': context.stage,
                'data': context.data,
                'metadata': context.metadata,
                'timestamp': datetime.now().isoformat()
            }
            self.processed_workflows.append(workflow_record)

            logger.info(f"工作流开始: {context.workflow_id}")

            # 检测跨CLI调用意图
            user_input = context.data.get('prompt', context.data.get('task', ''))
            if not user_input:
                return None

            intent = self.parser.parse_intent(user_input, "iflow")

            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # 执行跨CLI调用
                result = await self._execute_cross_cli_workflow(
                    intent.target_cli,
                    intent.task,
                    context
                )

                if result:
                    self.cross_cli_calls_count += 1
                    return result

            return None  # 继续正常工作流

        except Exception as e:
            logger.error(f"工作流开始Hook处理失败: {e}")
            self.record_error()
            return None

    async def on_stage_complete(self, context: WorkflowContext, stage_result: Any) -> Optional[str]:
        """
        阶段完成Hook

        Args:
            context: 工作流上下文
            stage_result: 阶段结果

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.stages_processed += 1

            # 记录阶段完成
            stage_record = {
                'type': 'stage_complete',
                'workflow_id': context.workflow_id,
                'stage': context.stage,
                'result': str(stage_result) if stage_result else None,
                'timestamp': datetime.now().isoformat()
            }
            self.processed_workflows.append(stage_record)

            logger.debug(f"工作流阶段完成: {context.workflow_id} - {context.stage}")
            return None

        except Exception as e:
            logger.error(f"阶段完成Hook处理失败: {e}")
            self.record_error()
            return None

    async def on_workflow_success(self, context: WorkflowContext, final_result: Any) -> Optional[str]:
        """
        工作流成功Hook

        Args:
            context: 工作流上下文
            final_result: 最终结果

        Returns:
            Optional[str]: 处理结果
        """
        try:
            # 记录工作流成功
            success_record = {
                'type': 'workflow_success',
                'workflow_id': context.workflow_id,
                'result': str(final_result) if final_result else None,
                'duration': (datetime.now() - context.start_time).total_seconds(),
                'timestamp': datetime.now().isoformat()
            }
            self.processed_workflows.append(success_record)

            logger.info(f"工作流成功完成: {context.workflow_id}")
            return None

        except Exception as e:
            logger.error(f"工作流成功Hook处理失败: {e}")
            self.record_error()
            return None

    async def on_workflow_error(self, context: WorkflowContext, error: Exception) -> Optional[str]:
        """
        工作流错误Hook

        Args:
            context: 工作流上下文
            error: 错误信息

        Returns:
            Optional[str]: 处理结果
        """
        try:
            # 记录工作流错误
            error_record = {
                'type': 'workflow_error',
                'workflow_id': context.workflow_id,
                'error': str(error),
                'error_type': type(error).__name__,
                'timestamp': datetime.now().isoformat()
            }
            self.processed_workflows.append(error_record)

            logger.error(f"工作流执行错误: {context.workflow_id} - {error}")
            return None

        except Exception as e:
            logger.error(f"工作流错误Hook处理失败: {e}")
            self.record_error()
            return None

    async def on_pipeline_ready(self, pipeline_config: Dict) -> Optional[str]:
        """
        流水线就绪Hook

        Args:
            pipeline_config: 流水线配置

        Returns:
            Optional[str]: 处理结果
        """
        try:
            logger.info("iFlow流水线已就绪")
            return None

        except Exception as e:
            logger.error(f"流水线就绪Hook处理失败: {e}")
            self.record_error()
            return None

    # ==================== 跨CLI功能 ====================

    async def _execute_cross_cli_workflow(
        self,
        target_cli: str,
        task: str,
        context: WorkflowContext
    ) -> Optional[str]:
        """
        执行跨CLI工作流

        Args:
            target_cli: 目标CLI工具
            task: 要执行的任务
            context: 工作流上下文

        Returns:
            Optional[str]: 执行结果
        """
        try:
            logger.info(f"执行跨CLI工作流: {target_cli} -> {task}")

            # 记录跨CLI调用
            workflow_execution = {
                'workflow_id': context.workflow_id,
                'target_cli': target_cli,
                'task': task,
                'stage': context.stage,
                'timestamp': datetime.now().isoformat()
            }
            self.workflow_executions.append(workflow_execution)

            # 获取目标CLI适配器
            target_adapter = self.get_adapter(target_cli)

            if not target_adapter:
                logger.warning(f"目标CLI适配器不可用: {target_cli}")
                return self._format_workflow_error(
                    target_cli,
                    task,
                    f"目标CLI工具 '{target_cli}' 不可用或未安装"
                )

            if not target_adapter.is_available():
                logger.warning(f"目标CLI工具不可用: {target_cli}")
                return self._format_workflow_error(
                    target_cli,
                    task,
                    f"目标CLI工具 '{target_cli}' 当前不可用"
                )

            # 构建执行上下文
            execution_context = {
                'source_cli': self.cli_name,
                'target_cli': target_cli,
                'original_task': task,
                'workflow_context': context.__dict__,
                'timestamp': datetime.now().isoformat()
            }

            # 执行任务
            result = await target_adapter.execute_task(task, execution_context)

            # 记录成功的跨CLI调用
            self.processed_requests.append({
                'type': 'cross_cli_workflow_execution',
                'target_cli': target_cli,
                'task': task,
                'workflow_id': context.workflow_id,
                'success': True,
                'result_length': len(result),
                'timestamp': datetime.now().isoformat()
            })

            # 格式化结果
            formatted_result = self._format_workflow_result(target_cli, result, context)

            logger.info(f"跨CLI工作流执行成功: {target_cli}")
            return formatted_result

        except Exception as e:
            logger.error(f"跨CLI工作流执行失败: {target_cli}, {e}")

            # 记录失败的跨CLI调用
            self.processed_requests.append({
                'type': 'cross_cli_workflow_execution',
                'target_cli': target_cli,
                'task': task,
                'workflow_id': context.workflow_id,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })

            return self._format_workflow_error(target_cli, task, str(e))

    async def _execute_workflow(self, context: WorkflowContext) -> str:
        """
        执行工作流

        Args:
            context: 工作流上下文

        Returns:
            str: 执行结果
        """
        try:
            # 触发工作流开始Hook
            start_result = await self.on_workflow_start(context)
            if start_result:
                return start_result

            # 执行各个阶段
            final_result = None
            for stage in self.pipeline_stages:
                stage_context = WorkflowContext(
                    workflow_id=context.workflow_id,
                    stage=stage.name,
                    data=context.data
                )

                # 执行阶段
                stage_result = await self._execute_stage(stage, stage_context)

                # 触发阶段完成Hook
                await self.on_stage_complete(stage_context, stage_result)

                if stage_result is not None:
                    final_result = stage_result

            # 触发工作流成功Hook
            await self.on_workflow_success(context, final_result)

            return final_result or "工作流执行完成"

        except Exception as e:
            # 触发工作流错误Hook
            await self.on_workflow_error(context, e)
            raise

    async def _execute_stage(self, stage: WorkflowStage, context: WorkflowContext) -> Any:
        """
        执行工作流阶段

        Args:
            stage: 工作流阶段
            context: 工作流上下文

        Returns:
            Any: 阶段结果
        """
        try:
            stage.start_time = datetime.now()
            stage.status = "running"

            # 这里可以根据阶段名称执行不同的逻辑
            if stage.name == "cross_cli_detection":
                return await self._stage_cross_cli_detection(context)
            elif stage.name == "target_execution":
                return await self._stage_target_execution(context)
            elif stage.name == "result_processing":
                return await self._stage_result_processing(context)
            elif stage.name == "output_formatting":
                return await self._stage_output_formatting(context)
            else:
                # 默认处理
                return f"阶段 {stage.name} 执行完成"

        except Exception as e:
            stage.status = "failed"
            stage.error = str(e)
            raise
        finally:
            stage.end_time = datetime.now()
            if stage.error is None:
                stage.status = "completed"

    async def _stage_cross_cli_detection(self, context: WorkflowContext) -> Any:
        """跨CLI检测阶段"""
        user_input = context.data.get('prompt', context.data.get('task', ''))
        intent = self.parser.parse_intent(user_input, "iflow")
        return intent

    async def _stage_target_execution(self, context: WorkflowContext) -> Any:
        """目标执行阶段"""
        # 这个阶段的逻辑在on_workflow_start中已经处理
        return None

    async def _stage_result_processing(self, context: WorkflowContext) -> Any:
        """结果处理阶段"""
        return "结果处理完成"

    async def _stage_output_formatting(self, context: WorkflowContext) -> Any:
        """输出格式化阶段"""
        return "输出格式化完成"

    def _format_workflow_result(
        self,
        target_cli: str,
        result: str,
        context: WorkflowContext
    ) -> str:
        """
        格式化工作流结果

        Args:
            target_cli: 目标CLI工具
            result: 执行结果
            context: 工作流上下文

        Returns:
            str: 格式化的结果
        """
        return f"""## 🔄 跨CLI工作流结果

**源工作流**: iFlow Pipeline ({context.workflow_id})
**目标CLI**: {target_cli.upper()}
**工作流阶段**: {context.stage}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由iFlow跨CLI集成系统通过Workflow Pipeline提供*"""

    def _format_workflow_error(
        self,
        target_cli: str,
        task: str,
        error_message: str
    ) -> str:
        """
        格式化工作流错误结果

        Args:
            target_cli: 目标CLI工具
            task: 原始任务
            error_message: 错误信息

        Returns:
            str: 格式化的错误结果
        """
        return f"""## ❌ 跨CLI工作流失败

**源工作流**: iFlow Pipeline
**目标CLI**: {target_cli.upper()}
**错误信息**: {error_message}
**失败时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

请检查目标CLI工具是否正确安装和配置。

---

*此错误由iFlow跨CLI集成系统报告*"""

    # ==================== 测试兼容方法 ====================

    def _detect_cross_cli_intent(self, context: WorkflowContext) -> bool:
        """
        检测跨CLI调用意图（测试兼容方法）

        Args:
            context: 工作流上下文

        Returns:
            bool: 是否为跨CLI调用
        """
        try:
            user_input = context.data.get('prompt', context.data.get('task', ''))
            if not user_input:
                return False

            intent = self.parser.parse_intent(user_input, "iflow")
            return intent.is_cross_cli

        except Exception:
            return False

    def _parse_cross_cli_task(self, context: WorkflowContext) -> tuple:
        """
        解析跨CLI任务（测试兼容方法）

        Args:
            context: 工作流上下文

        Returns:
            tuple: (target_cli, task)
        """
        try:
            user_input = context.data.get('prompt', context.data.get('task', ''))
            if not user_input:
                return None, None

            intent = self.parser.parse_intent(user_input, "iflow")
            if intent.is_cross_cli:
                return intent.target_cli, intent.task

            return None, None

        except Exception:
            return None, None

    async def _execute_cross_cli_workflow_call(
        self,
        target_cli: str,
        task: str,
        context: WorkflowContext
    ) -> str:
        """
        执行跨CLI工作流调用（测试兼容方法）

        Args:
            target_cli: 目标CLI工具
            task: 要执行的任务
            context: 工作流上下文

        Returns:
            str: 执行结果
        """
        result = await self._execute_cross_cli_workflow(target_cli, task, context)
        if result:
            return result
        return f"跨CLI工作流调用失败: {target_cli} -> {task}"