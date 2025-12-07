"""
独立 Qoder CLI 适配器 - 完全无抽象层
"""

import os
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class StandaloneQoderAdapter:
    """独立的 Qoder CLI 适配器"""

    def __init__(self):
        self.cli_name = "qoder"
        self.version = "1.0.0"
        self.execution_count = 0
        self.error_count = 0
        self.last_execution: Optional[datetime] = None
        logger.info("独立 Qoder CLI 适配器初始化完成")

    def is_available(self) -> bool:
        return True

    async def execute_task(self, task: str, context: Dict[str, Any] = None) -> str:
        """执行任务 - 纯实现，无抽象层"""
        try:
            self.execution_count += 1
            self.last_execution = datetime.now()
            return f"[Qoder CLI 本地处理] {task}"
        except Exception as e:
            self.error_count += 1
            return f"[错误] {task} 执行失败: {str(e)}"

    def get_statistics(self) -> Dict[str, Any]:
        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'design': 'standalone_notification_native',
            'no_abstraction': True
        }


def get_standalone_qoder_adapter() -> StandaloneQoderAdapter:
    return StandaloneQoderAdapter()