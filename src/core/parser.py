"""
自然语言解析器 - 核心版本
专注于检测跨CLI调用意图，无复杂抽象
"""
# -*- coding: utf-8 -*-
import re
import logging
from typing import Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class IntentResult:
    """意图解析结果"""
    is_cross_cli: bool = False
    target_cli: Optional[str] = None
    task: str = ""
    confidence: float = 1.0


class NaturalLanguageParser:
    """简化的自然语言解析器"""
    
    def __init__(self):
        # 中英文跨CLI调用模式
        self.cn_patterns = [
            r'请用(\w+)\s*帮我?([^。！？\n]*)',
            r'调用(\w+)\s*来([^。！？\n]*)',
            r'用(\w+)\s*帮我?([^。！？\n]*)',
            r'让(\w+)\s*帮我?([^。！？\n]*)',
            r'使用(\w+)\s*处理([^。！？\n]*)',
            r'通过(\w+)\s*执行([^。！？\n]*)'
        ]
        
        self.en_patterns = [
            r'use\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'call\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'ask\s+(\w+)\s+for\s+([^.\n!?]*)',
            r'tell\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'get\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'have\s+(\w+)\s+([^.\n!?]*)',
            r'execute\s+([^.\n!?]*)\s+with\s+(\w+)',
            r'process\s+([^.\n!?]*)\s+using\s+(\w+)'
        ]
        
        # 支持的CLI工具列表（用于验证）
        self.supported_clis = [
            'claude', 'gemini', 'qwen', 'iflow', 
            'qoder', 'codebuddy', 'copilot', 'codex'
        ]

    def detect_cross_cli_call(self, text: str) -> bool:
        """检测是否为跨CLI调用"""
        intent = self.parse_intent(text, "unknown")
        return intent.is_cross_cli

    def parse_intent(self, text: str, source_cli: str) -> IntentResult:
        """解析意图"""
        text = text.strip()

        # 检测中文模式
        for pattern in self.cn_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # 对于中文模式，CLI名称通常在第一组
                cli_name = match.group(1).lower()
                task = match.group(2).strip()

                # 验证CLI名称是否受支持
                if cli_name in self.supported_clis:
                    # 避免自我调用
                    if cli_name != source_cli.lower():
                        return IntentResult(
                            is_cross_cli=True,
                            target_cli=cli_name,
                            task=task,
                            confidence=0.9
                        )

        # 检测英文模式
        for pattern in self.en_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # 处理不同的英文模式
                if len(match.groups()) >= 2:
                    # 标准模式：CLI名称在第一组
                    cli_name = match.group(1).lower()
                    task = match.group(2).strip()
                else:
                    # 特殊模式：CLI名称在第二组
                    task = match.group(1).strip()
                    cli_name = match.group(2).lower() if len(match.groups()) > 1 else ""

                # 验证CLI名称是否受支持
                if cli_name in self.supported_clis:
                    # 避免自我调用
                    if cli_name != source_cli.lower():
                        return IntentResult(
                            is_cross_cli=True,
                            target_cli=cli_name,
                            task=task,
                            confidence=0.9
                        )

        # 不是跨CLI调用
        return IntentResult(is_cross_cli=False, task=text)