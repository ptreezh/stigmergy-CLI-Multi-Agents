"""
自然语言解析器 - 简化版本
专注于检测跨CLI调用意图，无复杂抽象
"""

import re
import logging
from typing import Dict, Any, Optional
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
            r'用(\w+)\s*帮我?([^。！？\n]*)'
        ]

        self.en_patterns = [
            r'use\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'call\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'ask\s+(\w+)\s+for\s+([^.\n!?]*)'
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
                cli_name = match.group(1).lower()
                task = match.group(2).strip()

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
                cli_name = match.group(1).lower()
                task = match.group(2).strip()

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