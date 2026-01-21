"""
Cross-CLI Adapter Package Entry - No Abstraction Layer Implementation

Provides a simple adapter retrieval mechanism, replacing the original factory pattern.
Each adapter is implemented independently and accessed through direct imports.
"""

from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Adapter registry - replacing factory pattern
_ADAPTER_REGISTRY = {}

def register_adapter(cli_name: str, adapter_instance: Any):
    """
    Register adapter instance
    
    Args:
        cli_name: CLI tool name
        adapter_instance: Adapter instance
    """
    logger.debug(f"Registering adapter: {cli_name}")
    _ADAPTER_REGISTRY[cli_name] = adapter_instance

def get_adapter(cli_name: str) -> Optional[Any]:
    """
    Get adapter instance for specified CLI
    
    Args:
        cli_name: CLI tool name
        
    Returns:
        Adapter instance or None
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
def get_cross_cli_adapter(cli_name: str) -> Optional[Any]:
    """
    Get cross-CLI adapter - replacing the original factory method
    
    Args:
        cli_name: CLI tool name
        
    Returns:
        Adapter instance or None
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