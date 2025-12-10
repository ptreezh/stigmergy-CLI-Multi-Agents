"""
Cross-CLI适配器包入口 - 无抽象层实现

提供简单的适配器检索机制，替代原有的工厂模式。
每个适配器都是独立实现，通过直接导入访问。
"""

from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# 适配器注册表 - 替代工厂模式
_ADAPTER_REGISTRY = {}

def register_adapter(cli_name: str, adapter_instance):
    """
    注册适配器实例
    
    Args:
        cli_name: CLI工具名称
        adapter_instance: 适配器实例
    """
    _ADAPTER_REGISTRY[cli_name.lower()] = adapter_instance
    logger.debug(f"注册适配器: {cli_name}")

def get_adapter(cli_name: str):
    """
    获取指定CLI的适配器实例
    
    Args:
        cli_name: CLI工具名称
        
    Returns:
        适配器实例或None
    """
    return _ADAPTER_REGISTRY.get(cli_name.lower())

def get_claude_adapter():
    """获取Claude适配器"""
    try:
        from .claude.standalone_claude_adapter import get_standalone_claude_adapter
        adapter = get_standalone_claude_adapter()
        register_adapter("claude", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取Claude适配器失败: {e}")
        return None

def get_gemini_adapter():
    """获取Gemini适配器"""
    try:
        from .gemini.standalone_gemini_adapter import get_standalone_gemini_adapter
        adapter = get_standalone_gemini_adapter()
        register_adapter("gemini", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取Gemini适配器失败: {e}")
        return None

def get_qwencode_adapter():
    """获取QwenCode适配器"""
    try:
        from .qwencode.standalone_qwencode_adapter import get_standalone_qwencode_adapter
        adapter = get_standalone_qwencode_adapter()
        register_adapter("qwencode", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取QwenCode适配器失败: {e}")
        return None

def get_iflow_adapter():
    """获取iFlow适配器"""
    try:
        from .iflow.standalone_iflow_adapter import get_standalone_iflow_adapter
        adapter = get_standalone_iflow_adapter()
        register_adapter("iflow", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取iFlow适配器失败: {e}")
        return None

def get_qoder_adapter():
    """获取Qoder适配器"""
    try:
        from .qoder.standalone_qoder_adapter import get_standalone_qoder_adapter
        adapter = get_standalone_qoder_adapter()
        register_adapter("qoder", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取Qoder适配器失败: {e}")
        return None

def get_codebuddy_adapter():
    """获取CodeBuddy适配器"""
    try:
        from .codebuddy.standalone_codebuddy_adapter import get_standalone_codebuddy_adapter
        adapter = get_standalone_codebuddy_adapter()
        register_adapter("codebuddy", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取CodeBuddy适配器失败: {e}")
        return None

def get_codex_adapter():
    """获取Codex适配器"""
    try:
        from .codex.standalone_codex_adapter import get_standalone_codex_adapter
        adapter = get_standalone_codex_adapter()
        register_adapter("codex", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取Codex适配器失败: {e}")
        return None

def get_cline_adapter():
    """获取Cline适配器"""
    try:
        from .cline.standalone_cline_adapter import get_standalone_cline_adapter
        adapter = get_standalone_cline_adapter()
        register_adapter("cline", adapter)
        return adapter
    except Exception as e:
        logger.error(f"获取Cline适配器失败: {e}")
        return None


# 兼容旧接口
def get_cross_cli_adapter(cli_name: str):
    """
    获取跨CLI适配器 - 替代原有的工厂方法
    
    Args:
        cli_name: CLI工具名称
        
    Returns:
        适配器实例或None
    """
    adapter_getters = {
        "claude": get_claude_adapter,
        "gemini": get_gemini_adapter,
        "qwencode": get_qwencode_adapter,
        "iflow": get_iflow_adapter,
        "qoder": get_qoder_adapter,
        "codebuddy": get_codebuddy_adapter,
        "codex": get_codex_adapter,
        "cline": get_cline_adapter,
    }
    
    getter = adapter_getters.get(cli_name.lower())
    if getter:
        return getter()
    
    logger.warning(f"未知的CLI适配器: {cli_name}")
    return None

__all__ = [
    'get_cross_cli_adapter',
    'get_claude_adapter',
    'get_gemini_adapter',
    'get_qwencode_adapter',
    'get_iflow_adapter',
    'get_qoder_adapter',
    'get_codebuddy_adapter',
    'get_codex_adapter',
    'get_cline_adapter',
    'register_adapter',
    'get_adapter'
]