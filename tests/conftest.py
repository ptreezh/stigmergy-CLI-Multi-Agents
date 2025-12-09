"""
pytest配置文件 - AI CLI Universal Integration System
提供测试夹具、Mock对象和测试环境配置
"""

import pytest
import asyncio
import tempfile
import json
import os
from unittest.mock import Mock, AsyncMock
from typing import Dict, Any, Optional
from pathlib import Path

# 添加src目录到Python路径
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

# 配置pytest-asyncio
@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环用于async测试"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Remove imports of BaseCrossCLIAdapter and IntentResult since they no longer exist
# from core.base_adapter import BaseCrossCLIAdapter
# from core.parser import IntentResult

# Simple IntentResult class for testing purposes
class IntentResult:
    """Simple IntentResult for testing - standalone implementation"""
    
    def __init__(self, is_cross_cli: bool = False, target_cli: str = None, task: str = "", confidence: float = 1.0):
        self.is_cross_cli = is_cross_cli
        self.target_cli = target_cli
        self.task = task
        self.confidence = confidence


class MockHookContext:
    """Mock Claude CLI Hook上下文"""
    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}


class MockRequest:
    """Mock CLI请求对象"""
    def __init__(self, prompt: str, metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}


class MockContext:
    """Mock CLI上下文对象"""
    def __init__(self, request: Optional[MockRequest] = None):
        self.request = request or MockRequest("")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "request": self.request.__dict__
        }


class MockCrossCLIAdapter:
    """Mock跨CLI适配器用于测试 - 独立实现，无继承"""

    def __init__(self, cli_name: str, mock_result: str = "mock_result"):
        self.cli_name = cli_name.lower().strip()
        self.version = "1.0.0"
        self.mock_result = mock_result
        self.call_count = 0
        self.last_task = None
        self.last_context = None
        self.last_execution_time = None
        self.execution_count = 0
        self.error_count = 0

    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """Mock执行任务"""
        self.call_count += 1
        self.last_task = task
        self.last_context = context
        self.execution_count += 1
        from datetime import datetime
        self.last_execution_time = datetime.now()
        return f"[{self.cli_name.upper()} 调用结果]\n{self.mock_result}"

    def is_available(self) -> bool:
        """检查可用性"""
        return True

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        from datetime import datetime
        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'execution_count': self.execution_count,
            'error_count': self.error_count,
            'last_execution_time': self.last_execution_time.isoformat() if self.last_execution_time else None
        }

    def record_error(self):
        """记录错误"""
        self.error_count += 1


@pytest.fixture
def event_loop():
    """创建事件循环fixture"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_config_dir():
    """创建临时配置目录fixture"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture
def mock_claude_context():
    """Mock Claude CLI Hook上下文fixture"""
    return MockHookContext()


@pytest.fixture
def mock_request():
    """Mock CLI请求对象fixture"""
    return MockRequest()


@pytest.fixture
def mock_context(mock_request):
    """Mock CLI上下文对象fixture"""
    return MockContext(mock_request)


@pytest.fixture
def mock_adapter():
    """Mock跨CLI适配器fixture"""
    return MockCrossCLIAdapter("test_cli", "测试结果")


@pytest.fixture
def sample_cross_cli_requests():
    """示例跨CLI调用请求fixture"""
    return [
        "请用gemini帮我分析这个架构图",
        "调用claude审查这段代码",
        "用qwencode生成Python爬虫",
        "use gemini to analyze this data",
        "ask claude to review my code",
        "tell qwencode to generate tests",
        "让gemini帮我优化性能",
        "调用claude来修复这个bug"
    ]


@pytest.fixture
def sample_non_cross_cli_requests():
    """示例非跨CLI调用请求fixture"""
    return [
        "帮我写一个Python函数",
        "重构这段代码",
        "解释这个算法",
        "写单元测试",
        "优化性能",
        "修复bug",
        "分析这个错误",
        "生成文档"
    ]


@pytest.fixture
def intent_result_factory():
    """IntentResult工厂fixture"""
    def create_intent_result(
        is_cross_cli: bool = False,
        target_cli: Optional[str] = None,
        task: str = "test task",
        confidence: float = 1.0
    ) -> IntentResult:
        return IntentResult(
            is_cross_cli=is_cross_cli,
            target_cli=target_cli,
            task=task,
            confidence=confidence
        )
    return create_intent_result


@pytest.fixture
def mock_cli_configs():
    """Mock CLI配置fixture"""
    return {
        "claude": {
            "enabled": True,
            "hook_endpoint": "user_prompt_submit",
            "priority": 100
        },
        "gemini": {
            "enabled": True,
            "extension_point": "preprocessor",
            "priority": 90
        },
        "qwencode": {
            "enabled": True,
            "inheritance_mode": True,
            "priority": 95
        },
        "iflow": {
            "enabled": True,
            "workflow_integration": True,
            "priority": 80
        },
        "qoder": {
            "enabled": True,
            "plugin_system": True,
            "priority": 85
        },
        "codebuddy": {
            "enabled": True,
            "buddy_system": True,
            "priority": 88
        },
        "codex": {
            "enabled": True,
            "extension_system": True,
            "priority": 87
        }
    }


@pytest.fixture
def temp_project_spec():
    """临时PROJECT_SPEC.json文件fixture"""
    spec_content = {
        "project_info": {
            "name": "test_project",
            "version": "1.0.0",
            "description": "Test project for TDD"
        },
        "project_context": {
            "collaboration_mode": "stigmergy",
            "current_focus": "cross_cli_integration"
        },
        "agents": [
            {
                "id": "claude",
                "name": "Claude CLI",
                "status": "active",
                "capabilities": ["code_review", "analysis"]
            },
            {
                "id": "gemini",
                "name": "Gemini CLI",
                "status": "active",
                "capabilities": ["analysis", "optimization"]
            }
        ],
        "tasks": [
            {
                "id": "task_001",
                "title": "Test cross-cli integration",
                "status": "pending",
                "assigned_to": None
            }
        ],
        "collaboration_history": [],
        "current_state": {
            "active_agents": ["claude", "gemini"],
            "pending_tasks": 1,
            "last_updated": "2025-01-22T00:00:00Z"
        }
    }

    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(spec_content, f, indent=2)
        temp_file = f.name

    yield temp_file

    # 清理
    os.unlink(temp_file)


@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch):
    """自动设置测试环境fixture"""
    # 设置测试环境变量
    monkeypatch.setenv("AI_CLI_TEST_MODE", "1")
    monkeypatch.setenv("AI_CLI_LOG_LEVEL", "DEBUG")

    # 注释掉暂时不需要的mock，等实现对应模块后再启用
    # Mock CLI可用性检查
    # def mock_is_cli_available(cli_name: str) -> bool:
    #     return cli_name in ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "codex"]

    # monkeypatch.setattr("core.factory.is_cli_available", mock_is_cli_available)


# 测试标记定义
def pytest_configure(config):
    """配置pytest标记"""
    config.addinivalue_line(
        "markers", "unit: 单元测试标记"
    )
    config.addinivalue_line(
        "markers", "integration: 集成测试标记"
    )
    config.addinivalue_line(
        "markers", "claude: Claude CLI相关测试"
    )
    config.addinivalue_line(
        "markers", "gemini: Gemini CLI相关测试"
    )
    config.addinivalue_line(
        "markers", "qwencode: QwenCodeCLI相关测试"
    )
    config.addinivalue_line(
        "markers", "slow: 慢速测试标记"
    )


# 异步测试支持
@pytest.fixture(scope="session")
def anyio_backend():
    """设置anyio后端为asyncio"""
    return "asyncio"


# 测试数据文件路径
TEST_DATA_DIR = Path(__file__).parent / "fixtures"

def load_test_data(filename: str) -> Dict[str, Any]:
    """加载测试数据文件"""
    file_path = TEST_DATA_DIR / filename
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


# 常用测试工具函数
def create_mock_cli_response(cli_name: str, result: str) -> Dict[str, Any]:
    """创建Mock CLI响应"""
    return {
        "cli_name": cli_name,
        "result": result,
        "success": True,
        "execution_time": 0.1,
        "metadata": {
            "test_mode": True
        }
    }


def assert_intent_result(
    result: IntentResult,
    expected_is_cross_cli: bool,
    expected_target_cli: Optional[str] = None,
    expected_task_contains: Optional[str] = None
):
    """断言IntentResult的辅助函数"""
    assert result.is_cross_cli == expected_is_cross_cli

    if expected_target_cli is not None:
        assert result.target_cli == expected_target_cli

    if expected_task_contains is not None:
        assert expected_task_contains in result.task