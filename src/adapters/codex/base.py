"""
Codex CLI 适配器基础类
简化设计，专注于直接原生集成，无抽象层
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class BaseCodexAdapter(ABC):
    """Codex CLI 适配器基础类 - 最简设计"""

    def __init__(self, cli_name: str):
        self.cli_name = cli_name.lower().strip()
        self.version = "1.0.0"
        self.last_execution_time: Optional[datetime] = None
        self.execution_count = 0
        self.error_count = 0

    @abstractmethod
    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """执行任务 - 直接实现"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """检查可用性 - 直接检查"""
        pass

    def record_error(self):
        """记录错误"""
        self.error_count += 1

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'execution_count': self.execution_count,
            'error_count': self.error_count,
            'last_execution_time': self.last_execution_time.isoformat() if self.last_execution_time else None
        }