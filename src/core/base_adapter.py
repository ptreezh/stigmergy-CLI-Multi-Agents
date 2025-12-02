"""
BaseCrossCLIAdapter - 跨CLI适配器基类
定义所有CLI适配器的统一接口和基础功能
"""

import abc
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class IntentResult:
    """意图解析结果"""
    is_cross_cli: bool = False
    target_cli: Optional[str] = None
    task: str = ""
    confidence: float = 1.0


class BaseCrossCLIAdapter(abc.ABC):
    """
    跨CLI适配器抽象基类
    定义所有CLI适配器必须实现的接口和提供的基础功能
    """

    def __init__(self, cli_name: str):
        """
        初始化适配器

        Args:
            cli_name: CLI工具名称
        """
        self.cli_name = cli_name
        self.version = "1.0.0"
        self.initialized = False
        self.initialization_time: Optional[datetime] = None
        
        # 统计信息
        self.execution_count = 0
        self.error_count = 0
        self.successful_executions = 0
        self.total_execution_time = 0.0
        
        # 错误记录
        self.last_error: Optional[str] = None
        self.last_error_time: Optional[datetime] = None

    @abc.abstractmethod
    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        执行跨CLI任务 - 抽象方法，必须由子类实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        pass

    @abc.abstractmethod
    def is_available(self) -> bool:
        """
        检查适配器是否可用 - 抽象方法，必须由子类实现

        Returns:
            bool: 是否可用
        """
        pass

    async def initialize(self) -> bool:
        """
        初始化适配器 - 可由子类重写

        Returns:
            bool: 初始化是否成功
        """
        self.initialized = True
        self.initialization_time = datetime.now()
        logger.info(f"{self.cli_name} 适配器初始化完成")
        return True

    async def health_check(self) -> Dict[str, Any]:
        """
        健康检查

        Returns:
            Dict[str, Any]: 健康状态信息
        """
        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'initialized': self.initialized,
            'available': self.is_available(),
            'execution_count': self.execution_count,
            'error_count': self.error_count,
            'success_rate': self.get_success_rate(),
            'last_error': self.last_error,
            'last_error_time': self.last_error_time.isoformat() if self.last_error_time else None,
            'initialization_time': self.initialization_time.isoformat() if self.initialization_time else None
        }

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'execution_count': self.execution_count,
            'error_count': self.error_count,
            'successful_executions': self.successful_executions,
            'total_execution_time': self.total_execution_time,
            'success_rate': self.get_success_rate(),
            'average_execution_time': (
                self.total_execution_time / self.successful_executions 
                if self.successful_executions > 0 else 0
            )
        }

    def get_success_rate(self) -> float:
        """
        计算成功率

        Returns:
            float: 成功率 (0.0 - 1.0)
        """
        if self.execution_count == 0:
            return 1.0
        return self.successful_executions / self.execution_count

    def record_execution(self, execution_time: float, success: bool = True):
        """
        记录执行统计

        Args:
            execution_time: 执行时间（秒）
            success: 是否执行成功
        """
        self.execution_count += 1
        self.total_execution_time += execution_time
        
        if success:
            self.successful_executions += 1
        else:
            self.error_count += 1

    def record_error(self, error_message: Optional[str] = None):
        """
        记录错误

        Args:
            error_message: 错误信息
        """
        self.error_count += 1
        self.last_error = error_message or "Unknown error"
        self.last_error_time = datetime.now()

    async def cleanup(self) -> bool:
        """
        清理适配器资源 - 可由子类重写

        Returns:
            bool: 清理是否成功
        """
        logger.info(f"{self.cli_name} 适配器清理完成")
        return True

    def __str__(self):
        return f"{self.__class__.__name__}(cli_name='{self.cli_name}', version='{self.version}')"

    def __repr__(self):
        return self.__str__()


# 全局适配器工厂
_adapters_registry: Dict[str, BaseCrossCLIAdapter] = {}


def register_adapter(cli_name: str, adapter: BaseCrossCLIAdapter):
    """
    注册适配器到全局注册表

    Args:
        cli_name: CLI工具名称
        adapter: 适配器实例
    """
    _adapters_registry[cli_name] = adapter
    logger.info(f"注册适配器: {cli_name}")


def get_cross_cli_adapter(cli_name: str) -> Optional[BaseCrossCLIAdapter]:
    """
    获取跨CLI适配器

    Args:
        cli_name: CLI工具名称

    Returns:
        Optional[BaseCrossCLIAdapter]: 适配器实例
    """
    return _adapters_registry.get(cli_name)


def get_all_adapters() -> Dict[str, BaseCrossCLIAdapter]:
    """
    获取所有注册的适配器

    Returns:
        Dict[str, BaseCrossCLIAdapter]: 所有适配器
    """
    return _adapters_registry.copy()