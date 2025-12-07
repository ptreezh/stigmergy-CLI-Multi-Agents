"""
AI Environment Scanner - AI环境扫描器
检测项目可用的AI CLI工具和协作环境
"""
import os
import asyncio
import json
import yaml
import subprocess
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

from models import (
    CLIInfo, ProjectCLIInfo, AIEnvironmentInfo, CollaborationGuide,
    CLIStatus, IntegrationType, CLI_CONFIG_MAPPING, COLLABORATION_PROTOCOLS
)

logger = logging.getLogger(__name__)


class AIEnvironmentScanner:
    """AI环境扫描器 - 检测项目可用的AI协作工具"""

    def __init__(self, current_cli: str = None):
        self.current_cli = current_cli
        self.scan_start_time = None

    async def scan_ai_environment(self, project_path: str) -> AIEnvironmentInfo:
        """扫描当前项目的AI环境"""
        self.scan_start_time = datetime.now()

        try:
            # 1. 检测全局已安装的CLI工具
            logger.info("开始扫描全局CLI工具...")
            global_clis = await self._scan_global_clis()

            # 2. 检测项目特定的AI配置
            logger.info("开始扫描项目特定配置...")
            project_clis = await self._scan_project_clis(project_path)

            # 3. 生成协作指南
            logger.info("生成协作指南...")
            collaboration_guide = await self._generate_collaboration_guide(global_clis, project_clis)

            scan_duration = (datetime.now() - self.scan_start_time).total_seconds()

            ai_environment = AIEnvironmentInfo(
                available_clis=global_clis,
                project_specific_clis=project_clis,
                collaboration_guide=collaboration_guide,
                generated_at=self.scan_start_time,
                scan_duration=scan_duration
            )

            logger.info(f"AI环境扫描完成，耗时: {scan_duration:.2f}秒")
            return ai_environment

        except Exception as e:
            logger.error(f"AI环境扫描失败: {e}")
            raise

    async def _scan_global_clis(self) -> Dict[str, CLIInfo]:
        """扫描全局已安装的AI CLI工具"""
        available_clis = {}

        scan_tasks = []
        for cli_name, config_mapping in CLI_CONFIG_MAPPING.items():
            task = self._scan_single_cli(cli_name, config_mapping)
            scan_tasks.append(task)

        # 并行扫描所有CLI工具
        results = await asyncio.gather(*scan_tasks, return_exceptions=True)

        for i, (cli_name, config_mapping) in enumerate(CLI_CONFIG_MAPPING.items()):
            result = results[i]
            if isinstance(result, Exception):
                logger.warning(f"扫描 {cli_name} 时出错: {result}")
                continue

            if result:
                available_clis[cli_name] = result

        logger.info(f"发现 {len(available_clis)} 个可用的CLI工具: {list(available_clis.keys())}")
        return available_clis

    async def _scan_single_cli(self, cli_name: str, config_mapping) -> Optional[CLIInfo]:
        """扫描单个CLI工具"""
        try:
            # 1. 检查CLI工具是否可用
            is_available = await self._is_cli_available(cli_name, config_mapping)
            if not is_available:
                return None

            # 2. 获取版本信息
            version = await self._get_cli_version(cli_name, config_mapping)

            # 3. 获取能力信息
            capabilities = await self._get_cli_capabilities(cli_name, config_mapping)

            # 4. 检查配置文件
            config_file_exists = await self._check_config_file(config_mapping.config_file)

            status = CLIStatus.AVAILABLE if config_file_exists else CLIStatus.CONFIG_MISSING

            return CLIInfo(
                name=cli_name,
                display_name=self._get_display_name(cli_name),
                version=version,
                integration_type=config_mapping.integration_type,
                status=status,
                capabilities=capabilities,
                config_file=config_mapping.config_file,
                global_doc=config_mapping.global_doc,
                protocols=COLLABORATION_PROTOCOLS["chinese"] + COLLABORATION_PROTOCOLS["english"]
            )

        except Exception as e:
            logger.warning(f"扫描CLI工具 {cli_name} 失败: {e}")
            return None

    async def _is_cli_available(self, cli_name: str, config_mapping) -> bool:
        """检查CLI工具是否可用"""
        try:
            # 检查命令是否存在
            command = config_mapping.version_check_command
            if not command:
                # 如果没有版本检查命令，尝试通用命令
                command = f"{cli_name}-cli --version"

            result = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await result.communicate()

            return result.returncode == 0

        except Exception:
            return False

    async def _get_cli_version(self, cli_name: str, config_mapping) -> str:
        """获取CLI工具版本"""
        try:
            command = config_mapping.version_check_command
            if not command:
                command = f"{cli_name}-cli --version"

            result = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await result.communicate()

            if result.returncode == 0:
                version_output = stdout.decode().strip() or stderr.decode().strip()
                # 提取版本号
                for line in version_output.split('\n'):
                    if any(keyword in line.lower() for keyword in ['version', 'v']):
                        return line.strip()
                return version_output
            else:
                return "Unknown"

        except Exception:
            return "Unknown"

    async def _get_cli_capabilities(self, cli_name: str, config_mapping) -> List[str]:
        """获取CLI工具能力"""
        # 基于集成类型返回默认能力
        capability_map = {
            IntegrationType.HOOK_SYSTEM: ["钩子系统", "事件处理", "跨工具协调"],
            IntegrationType.EXTENSION_SYSTEM: ["扩展系统", "智能匹配", "多处理器"],
            IntegrationType.CLASS_INHERITANCE: ["插件继承", "代码生成", "方法重写"],
            IntegrationType.WORKFLOW_PIPELINE: ["工作流", "流水线处理", "任务队列"],
            IntegrationType.NOTIFICATION_HOOK: ["通知系统", "实时监控", "事件通知"],
            IntegrationType.MCP_SERVER: ["MCP协议", "服务器集成", "自定义代理"],
            IntegrationType.SLASH_COMMAND: ["斜杠命令", "快速执行", "参数化命令"]
        }

        return capability_map.get(config_mapping.integration_type, ["通用AI助手"])

    async def _check_config_file(self, config_file_path: str) -> bool:
        """检查配置文件是否存在"""
        try:
            expanded_path = Path(config_file_path.expanduser())
            return expanded_path.exists() and expanded_path.is_file()
        except Exception:
            return False

    def _get_display_name(self, cli_name: str) -> str:
        """获取CLI工具显示名称"""
        display_names = {
            "claude": "Claude CLI",
            "gemini": "Gemini CLI",
            "qwen": "QwenCode CLI",
            "iflow": "iFlow CLI",
            "qoder": "Qoder CLI",
            "codebuddy": "CodeBuddy CLI",
            "copilot": "Copilot CLI",
            "codex": "Codex CLI"
        }
        return display_names.get(cli_name, cli_name.upper())

    async def _scan_project_clis(self, project_path: str) -> Dict[str, ProjectCLIInfo]:
        """扫描项目特定的AI配置"""
        project_clis = {}

        # 检查项目目录下的AI配置文件
        ai_config_files = [
            ".ai-config.json",
            ".claude-project.json",
            ".gemini-project.json",
            ".qwen-project.json",
            ".iflow-project.json",
            "ai-workflow.yml",
            ".ai-cli-unified.json"
        ]

        for config_file in ai_config_files:
            config_path = Path(project_path) / config_file
            if config_path.exists():
                try:
                    cli_configs = await self._parse_project_config(config_path)
                    project_clis.update(cli_configs)
                    logger.info(f"发现项目配置文件: {config_file}")
                except Exception as e:
                    logger.warning(f"解析项目配置文件 {config_file} 失败: {e}")

        logger.info(f"发现 {len(project_clis)} 个项目特定CLI配置")
        return project_clis

    async def _parse_project_config(self, config_path: Path) -> Dict[str, ProjectCLIInfo]:
        """解析项目配置文件"""
        project_clis = {}

        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                if config_path.suffix.lower() in ['.yml', '.yaml']:
                    config_data = yaml.safe_load(f)
                else:
                    config_data = json.load(f)

            # 根据配置文件格式解析CLI配置
            if 'ai_tools' in config_data:
                for cli_name, cli_config in config_data['ai_tools'].items():
                    project_clis[cli_name] = ProjectCLIInfo(
                        cli_name=cli_name,
                        project_config=cli_config,
                        custom_settings=cli_config.get('custom_settings', {}),
                        enabled_features=cli_config.get('enabled_features', [])
                    )
            elif 'tools' in config_data:
                # 简化格式
                for cli_config in config_data['tools']:
                    cli_name = cli_config.get('name')
                    if cli_name:
                        project_clis[cli_name] = ProjectCLIInfo(
                            cli_name=cli_name,
                            project_config=cli_config,
                            custom_settings=cli_config.get('custom_settings', {}),
                            enabled_features=cli_config.get('enabled_features', [])
                        )

        except Exception as e:
            logger.error(f"解析配置文件失败 {config_path}: {e}")
            raise

        return project_clis

    async def _generate_collaboration_guide(self,
                                           global_clis: Dict[str, CLIInfo],
                                           project_clis: Dict[str, ProjectCLIInfo]) -> CollaborationGuide:
        """生成协作指南"""

        # 合并全局和项目特定的CLI信息
        all_clis = {**global_clis}
        for cli_name, project_cli in project_clis.items():
            if cli_name in all_clis:
                # 增强现有CLI信息
                existing_cli = all_clis[cli_name]
                # 可以在这里添加项目特定的增强信息
            else:
                # 项目特定的CLI可能不在全局列表中
                logger.info(f"项目特定CLI {cli_name} 不在全局列表中")

        # 确定当前CLI工具
        current_cli = self.current_cli or "claude"  # 默认值

        # 生成可协作的伙伴列表（排除当前CLI）
        peer_clis = {k: v for k, v in all_clis.items() if k != current_cli}

        # 生成协作示例
        examples = self._generate_collaboration_examples(current_cli, peer_clis)

        return CollaborationGuide(
            current_cli=current_cli,
            available_peers=peer_clis,
            protocols=COLLABORATION_PROTOCOLS,
            examples=examples
        )

    def _generate_collaboration_examples(self, current_cli: str, peer_clis: Dict[str, CLIInfo]) -> List[str]:
        """生成协作示例"""
        examples = []

        # 基于可用CLI工具生成示例
        if "qwen" in peer_clis:
            examples.append("请用qwen帮我生成单元测试")
            examples.append("调用qwen来重构这个函数")

        if "gemini" in peer_clis:
            examples.append("用gemini分析代码性能")
            examples.append("让gemini优化这个查询")

        if "iflow" in peer_clis:
            examples.append("用iflow创建CI/CD工作流")
            examples.append("启动iflow部署流程")

        if "claude" in peer_clis:
            examples.append("请用claude审查这段代码")
            examples.append("调用claude进行架构分析")

        # 添加通用示例
        examples.append("请用{tool}帮我{task}")
        examples.append("call {tool} to {task}")

        return examples