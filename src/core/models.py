"""
AI CLI Router - 核心数据模型和类型定义
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class CLIStatus(Enum):
    """CLI工具状态"""
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    VERSION_INCOMPATIBLE = "version_incompatible"
    CONFIG_MISSING = "config_missing"


class IntegrationType(Enum):
    """集成类型"""
    HOOK_SYSTEM = "hook_system"
    EXTENSION_SYSTEM = "extension_system"
    CLASS_INHERITANCE = "class_inheritance"
    WORKFLOW_PIPELINE = "workflow_pipeline"
    NOTIFICATION_HOOK = "notification_hook"
    MCP_SERVER = "mcp_server"
    SLASH_COMMAND = "slash_command"


@dataclass
class CLIInfo:
    """CLI工具信息"""
    name: str
    display_name: str
    version: str
    integration_type: IntegrationType
    status: CLIStatus
    capabilities: List[str]
    config_file: str
    global_doc: str
    protocols: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProjectCLIInfo:
    """项目特定CLI信息"""
    cli_name: str
    project_config: Dict[str, Any]
    custom_settings: Dict[str, Any] = field(default_factory=dict)
    enabled_features: List[str] = field(default_factory=list)


@dataclass
class CollaborationGuide:
    """协作指南"""
    current_cli: str
    available_peers: Dict[str, CLIInfo]
    protocols: Dict[str, List[str]]
    examples: List[str] = field(default_factory=list)


@dataclass
class AIEnvironmentInfo:
    """AI环境信息"""
    available_clis: Dict[str, CLIInfo]
    project_specific_clis: Dict[str, ProjectCLIInfo]
    collaboration_guide: CollaborationGuide
    generated_at: datetime
    scan_duration: Optional[float] = None


@dataclass
class ProjectStatus:
    """项目状态"""
    is_existing_project: bool
    existing_md_files: List[str]
    total_expected: int
    project_path: str


@dataclass
class EnhancementResult:
    """增强结果"""
    enhanced: bool
    added_collaboration_section: bool
    original_sections: int
    new_sections: int
    enhancement_time: Optional[datetime] = None


@dataclass
class GeneratedDocument:
    """生成的文档"""
    file_path: str
    sections_count: int
    includes_collaboration: bool
    generation_time: Optional[datetime] = None


@dataclass
class InitResult:
    """初始化结果"""
    project_type: str
    ai_environment: AIEnvironmentInfo
    message: str
    enhanced_documents: Dict[str, EnhancementResult] = field(default_factory=dict)
    generated_documents: Dict[str, GeneratedDocument] = field(default_factory=dict)
    processing_time: Optional[float] = None


@dataclass
class MarkdownSection:
    """Markdown章节"""
    title: str
    content: List[str]
    level: int


class ProjectType(Enum):
    """项目类型"""
    NEW_PROJECT = "new_project"
    EXISTING_PROJECT = "existing_project"


@dataclass
class CLIConfigMapping:
    """CLI配置映射"""
    config_file: str
    global_doc: str
    integration_type: IntegrationType
    adapter_class: Optional[str] = None
    install_script: Optional[str] = None
    version_check_command: Optional[str] = None


# CLI工具配置映射表
CLI_CONFIG_MAPPING = {
    "claude": CLIConfigMapping(
        config_file="~/.config/claude/hooks.json",
        global_doc="claude.md",
        integration_type=IntegrationType.HOOK_SYSTEM,
        install_script="install_claude_integration.py",
        version_check_command="claude-cli --version"
    ),
    "gemini": CLIConfigMapping(
        config_file="~/.config/gemini/extensions.json",
        global_doc="gemini.md",
        integration_type=IntegrationType.EXTENSION_SYSTEM,
        install_script="install_gemini_integration.py",
        version_check_command="gemini-cli --version"
    ),
    "qwen": CLIConfigMapping(
        config_file="~/.config/qwencode/config.yml",
        global_doc="qwen.md",
        integration_type=IntegrationType.CLASS_INHERITANCE,
        install_script="install_qwencode_integration.py",
        version_check_command="qwen --version"
    ),
    "iflow": CLIConfigMapping(
        config_file="~/.config/iflow/hooks.yml",
        global_doc="iflow.md",
        integration_type=IntegrationType.WORKFLOW_PIPELINE,
        install_script="install_iflow_integration.py",
        version_check_command="iflow --version"
    ),
    "qoder": CLIConfigMapping(
        config_file="~/.qoder/config.json",
        global_doc="qoder.md",
        integration_type=IntegrationType.NOTIFICATION_HOOK,
        install_script="install_qoder_integration.py",
        version_check_command="qodercli --version"
    ),
    "codebuddy": CLIConfigMapping(
        config_file="~/.codebuddy/buddy_config.json",
        global_doc="codebuddy.md",
        integration_type=IntegrationType.HOOK_SYSTEM,
        install_script="install_codebuddy_integration.py",
        version_check_command="codebuddy --version"
    ),
    "copilot": CLIConfigMapping(
        config_file="~/.copilot/mcp-config.json",
        global_doc="copilot.md",
        integration_type=IntegrationType.MCP_SERVER,
        install_script="install_copilot_integration.py",
        version_check_command="copilot-cli --version"
    ),
    "codex": CLIConfigMapping(
        config_file="~/.config/codex/slash_commands.json",
        global_doc="codex.md",
        integration_type=IntegrationType.SLASH_COMMAND,
        install_script="install_codex_integration.py",
        version_check_command="codex-cli --version"
    ),
    "cline": CLIConfigMapping(
        config_file="~/.config/cline/cline_mcp_settings.json",
        global_doc="cline.md",
        integration_type=IntegrationType.MCP_SERVER,
        install_script="install_cline_integration.py",
        version_check_command="cline --version"
    ),
}

# 协作协议模板
COLLABORATION_PROTOCOLS = {
    "chinese": [
        "请用{cli}帮我{task}",
        "调用{cli}来{task}",
        "用{cli}帮我{task}",
        "让{cli}帮我{task}",
        "使用{cli}处理{task}",
        "通过{cli}执行{task}",
        "启动{cli}工作流{task}"
    ],
    "english": [
        "use {cli} to {task}",
        "call {cli} to {task}",
        "ask {cli} for {task}",
        "tell {cli} to {task}",
        "get {cli} to {task}",
        "have {cli} {task}",
        "start {cli} workflow for {task}",
        "execute {task} with {cli}",
        "process {task} using {cli}"
    ]
}