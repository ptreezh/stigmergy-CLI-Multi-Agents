"""
Qwen CLI 适配器包

基于 Qwen CLI 官方 Class Inheritance 系统的原生集成
完全无抽象层设计
"""

import sys
import os
import logging

# 设置日志记录
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from qwencode.standalone_qwencode_adapter import get_standalone_qwencode_adapter, StandaloneQwenCodeAdapter
    logger.info("Successfully imported qwencode modules")
except ImportError as e:
    # 如果 qwencode 包未安装，提供替代实现或更友好的错误信息
    logger.warning(f"Failed to import qwencode modules: {e}")
    logger.info("Falling back to alternative implementation")

    # 提供备用实现或简化版本
    class StandaloneQwenCodeAdapter:
        """备用 QwenCode 适配器实现"""
        def __init__(self, *args, **kwargs):
            self.name = "StandaloneQwenCodeAdapter"
            self.is_available = False

        def execute(self, *args, **kwargs):
            raise NotImplementedError("qwencode package not installed. Please install with: npm install -g @qwen-code/qwen-code")

    def get_standalone_qwencode_adapter(*args, **kwargs):
        """备用获取适配器函数"""
        return StandaloneQwenCodeAdapter()

# 向后兼容的别名
QwenCodeInheritanceAdapter = StandaloneQwenCodeAdapter

__all__ = ['StandaloneQwenCodeAdapter', 'get_standalone_qwencode_adapter', 'QwenCodeInheritanceAdapter']