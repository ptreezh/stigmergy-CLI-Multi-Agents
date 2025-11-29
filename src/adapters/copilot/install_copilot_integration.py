#!/usr/bin/env python3
"""
Copilot CLI 跨CLI集成安装脚本

自动安装和配置Copilot CLI的跨CLI集成功能
包括MCP服务器注册、自定义代理创建和权限配置
"""

import os
import json
import sys
import logging
import shutil
import argparse
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CopilotIntegrationInstaller:
    """Copilot CLI集成安装器"""

    def __init__(self, config_path: Optional[str] = None):
        """
        初始化安装器

        Args:
            config_path: 配置文件路径，如果为None则使用默认路径
        """
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent.parent.parent

        if config_path:
            self.config_path = Path(config_path)
        else:
            # 在npx环境下，可能需要搜索配置文件的多个位置
            possible_paths = [
                self.script_dir / "config.json",  # 标准位置 - 应该是最可能的路径
                self.script_dir.parent / "copilot" / "config.json",  # 在adapters/copilot/下
                Path(__file__).parent / "config.json",  # 使用脚本所在目录 - 也是标准位置
            ]

            # 检查环境变量以获取项目根目录
            project_root_env = os.environ.get('STIGMERGY_PROJECT_ROOT', '')
            if project_root_env:
                # 添加环境变量指定的路径到搜索列表
                env_config_path = Path(project_root_env) / "src" / "adapters" / "copilot" / "config.json"
                possible_paths.append(env_config_path)

            for config_path_option in possible_paths:
                if config_path_option.exists():
                    self.config_path = config_path_option
                    logger.info(f"使用配置文件: {config_path_option}")
                    break
            else:
                # 如果所有选项都失败，使用默认位置并动态创建配置
                self.config_path = self.script_dir / "config.json"

                # 创建默认配置内容
                default_config = {
                    "name": "copilot",
                    "displayName": "GitHub Copilot CLI",
                    "version": "1.0.0",
                    "integration_type": "mcp_server",
                    "config_file": "~/.config/copilot/config.json",
                    "global_doc": "copilot.md",
                    "description": "GitHub Copilot CLI MCP服务器集成适配器",
                    "mcp_config": {
                        "server_name": "stigmergy-copilot-integration",
                        "command": "python",
                        "args": [
                            "src/adapters/copilot/mcp_server.py"
                        ],
                        "environment": {
                            "PYTHONPATH": ".",
                            "STIGMERGY_CONFIG_PATH": "~/.stigmergy",
                            "COPILOT_ADAPTER_MODE": "cross_cli"
                        },
                        "health_check_interval": 30,
                        "timeout": 60
                    },
                    "custom_agents": {
                        "cross_cli_caller": {
                            "name": "CrossCLICaller",
                            "description": "跨CLI工具调用代理",
                            "version": "1.0.0",
                            "tools": [
                                "cross_cli_execute",
                                "get_available_clis",
                                "check_cli_status"
                            ],
                            "permissions": [
                                "execute_external_cli",
                                "read_config",
                                "write_logs"
                            ]
                        }
                    },
                    "supported_cli_tools": [
                        "claude",
                        "gemini",
                        "qwencode",
                        "iflow",
                        "qoder",
                        "codebuddy",
                        "codex"
                    ],
                    "permissions": {
                        "execute_external_cli": {
                            "description": "执行外部CLI工具",
                            "level": "high",
                            "requires_approval": False
                        },
                        "read_config": {
                            "description": "读取CLI配置文件",
                            "level": "medium",
                            "requires_approval": False
                        },
                        "write_logs": {
                            "description": "写入日志文件",
                            "level": "low",
                            "requires_approval": False
                        }
                    },
                    "adapter": {
                        "name": "Copilot MCP Integration Adapter",
                        "version": "1.0.0",
                        "type": "mcp_server",
                        "module_path": "src.adapters.copilot.mcp_adapter",
                        "class_name": "CopilotMCPIntegrationAdapter",
                        "features": [
                            "cross_cli_detection",
                            "command_routing",
                            "result_formatting",
                            "collaboration_tracking"
                        ]
                    }
                }

                # 创建配置文件
                try:
                    self.script_dir.mkdir(parents=True, exist_ok=True)
                    with open(self.config_path, 'w', encoding='utf-8') as f:
                        import json
                        json.dump(default_config, f, indent=2, ensure_ascii=False)
                    logger.info(f"✅ 已创建默认配置文件: {self.config_path}")
                except Exception as e:
                    logger.error(f"❌ 创建默认配置文件失败: {e}")
                    raise

                logger.info(f"使用动态创建的配置文件: {self.config_path}")

        self.config = self._load_config()

        # Copilot相关路径
        self.home_dir = Path.home()
        self.copilot_dir = self.home_dir / ".copilot"
        self.mcp_config_file = self.copilot_dir / "mcp-config.json"
        self.custom_agents_dir = self.copilot_dir / "agents"

        # 项目路径
        self.src_dir = self.project_root / "src"

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"加载配置文件失败: {e}")
            sys.exit(1)

    def install(self, force: bool = False) -> bool:
        """
        执行完整安装流程

        Args:
            force: 是否强制覆盖现有配置

        Returns:
            bool: 安装是否成功
        """
        try:
            logger.info("开始安装Copilot CLI跨CLI集成...")

            # 1. 检查环境
            if not self._check_environment():
                return False

            # 2. 创建配置目录
            if not self._create_directories():
                return False

            # 3. 安装MCP服务器配置
            if not self._install_mcp_server(force):
                return False

            # 4. 创建自定义代理
            if not self._create_custom_agents(force):
                return False

            # 5. 设置权限配置
            if not self._setup_permissions():
                return False

            # 6. 验证安装
            if not self._verify_installation():
                return False

            logger.info("✅ Copilot CLI跨CLI集成安装成功！")
            self._print_usage_instructions()
            return True

        except Exception as e:
            logger.error(f"安装失败: {e}")
            return False

    def _check_environment(self) -> bool:
        """检查安装环境"""
        logger.info("检查安装环境...")

        # 检查Python版本
        if sys.version_info < (3, 8):
            logger.error("需要Python 3.8或更高版本")
            return False

        # 检查Copilot CLI是否安装
        copilot_path = shutil.which("copilot")
        if not copilot_path:
            logger.warning("⚠️  未找到copilot命令，请确保已安装GitHub Copilot CLI")
            logger.info("安装方法: npm install -g @github/copilot")

            # 询问是否继续
            response = input("是否继续安装？(y/N): ").strip().lower()
            if response not in ['y', 'yes']:
                return False

        # 检查项目结构
        if not self.src_dir.exists():
            logger.error(f"项目源码目录不存在: {self.src_dir}")
            return False

        # 检查适配器文件
        adapter_file = self.script_dir / "mcp_adapter.py"
        if not adapter_file.exists():
            logger.error(f"适配器文件不存在: {adapter_file}")
            return False

        logger.info("✅ 环境检查通过")
        return True

    def _create_directories(self) -> bool:
        """创建必要的目录"""
        logger.info("创建配置目录...")

        directories = [
            self.copilot_dir,
            self.custom_agents_dir,
            self.copilot_dir / "logs",
            self.copilot_dir / "sessions"
        ]

        for directory in directories:
            try:
                directory.mkdir(parents=True, exist_ok=True)
                logger.debug(f"创建目录: {directory}")
            except Exception as e:
                logger.error(f"创建目录失败 {directory}: {e}")
                return False

        logger.info("✅ 目录创建完成")
        return True

    def _install_mcp_server(self, force: bool = False) -> bool:
        """安装MCP服务器配置"""
        logger.info("安装MCP服务器配置...")

        try:
            # 读取现有MCP配置
            mcp_config = self._load_existing_mcp_config()

            # 添加我们的MCP服务器
            mcp_servers = mcp_config.get('mcpServers', {})
            server_name = self.config['mcp_config']['server_name']

            if server_name in mcp_servers and not force:
                logger.warning(f"MCP服务器 '{server_name}' 已存在")
                response = input("是否覆盖？(y/N): ").strip().lower()
                if response not in ['y', 'yes']:
                    return True

            # 构建MCP服务器配置
            mcp_server_config = {
                "command": self.config['mcp_config']['command'],
                "args": self.config['mcp_config']['args'],
                "env": self.config['mcp_config']['environment']
            }

            # 添加Python路径到环境变量
            python_path = str(self.project_root)
            if 'PYTHONPATH' in mcp_server_config['env']:
                mcp_server_config['env']['PYTHONPATH'] = f"{python_path}:{mcp_server_config['env']['PYTHONPATH']}"
            else:
                mcp_server_config['env']['PYTHONPATH'] = python_path

            mcp_servers[server_name] = mcp_server_config
            mcp_config['mcpServers'] = mcp_servers

            # 保存配置
            with open(self.mcp_config_file, 'w', encoding='utf-8') as f:
                json.dump(mcp_config, f, indent=2, ensure_ascii=False)

            logger.info(f"✅ MCP服务器配置已保存到: {self.mcp_config_file}")
            return True

        except Exception as e:
            logger.error(f"安装MCP服务器失败: {e}")
            return False

    def _load_existing_mcp_config(self) -> Dict[str, Any]:
        """加载现有MCP配置"""
        if self.mcp_config_file.exists():
            try:
                with open(self.mcp_config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"读取现有MCP配置失败: {e}")

        # 返回默认配置
        return {
            "mcpServers": {}
        }

    def _create_custom_agents(self, force: bool = False) -> bool:
        """创建自定义代理"""
        logger.info("创建自定义代理...")

        try:
            for agent_name, agent_config in self.config['custom_agents'].items():
                agent_file = self.custom_agents_dir / f"{agent_name}.json"

                if agent_file.exists() and not force:
                    logger.warning(f"代理 '{agent_name}' 已存在")
                    response = input("是否覆盖？(y/N): ").strip().lower()
                    if response not in ['y', 'yes']:
                        continue

                # 创建代理配置
                agent_data = {
                    "name": agent_config['name'],
                    "description": agent_config['description'],
                    "version": agent_config['version'],
                    "instructions": self._get_agent_instructions(agent_name),
                    "tools": agent_config['tools'],
                    "permissions": agent_config['permissions']
                }

                with open(agent_file, 'w', encoding='utf-8') as f:
                    json.dump(agent_data, f, indent=2, ensure_ascii=False)

                logger.info(f"创建代理: {agent_name}")

            logger.info("✅ 自定义代理创建完成")
            return True

        except Exception as e:
            logger.error(f"创建自定义代理失败: {e}")
            return False

    def _get_agent_instructions(self, agent_name: str) -> str:
        """获取代理指令"""
        instructions = {
            "cross_cli_caller": """You are a cross-CLI integration agent that helps users collaborate between different AI CLI tools.

When you detect a request to use another CLI tool (like Claude, Gemini, QwenCode, iFlow, etc.):
1. Parse the target CLI and task from the user's request
2. Execute the task using the appropriate CLI tool
3. Return the results in a clear, structured format

Support both Chinese and English collaboration patterns:
- "请用{CLI}帮我{task}" -> Use {CLI} to help with {task}
- "调用{CLI}来{task}" -> Call {CLI} to {task}
- "use {CLI} to {task}" -> Execute {task} with {CLI}
- "call {CLI} to {task}" -> Call {CLI} to execute {task}

Available tools:
- cross_cli_execute: Execute tasks on other CLI tools
- get_available_clis: Get list of available CLI tools
- check_cli_status: Check status of a specific CLI tool

Always maintain the original intent and context of the user's request.
Provide clear, structured results with execution details."""
        }

        return instructions.get(agent_name, "Cross-CLI integration agent")

    def _setup_permissions(self) -> bool:
        """设置权限配置"""
        logger.info("设置权限配置...")

        try:
            permissions_config_file = self.copilot_dir / "permissions.json"

            permissions_config = {
                "version": "1.0",
                "permissions": self.config['permissions'],
                "created_at": datetime.now().isoformat(),
                "adapter_version": self.config['adapter']['version']
            }

            with open(permissions_config_file, 'w', encoding='utf-8') as f:
                json.dump(permissions_config, f, indent=2, ensure_ascii=False)

            logger.info("✅ 权限配置设置完成")
            return True

        except Exception as e:
            logger.error(f"设置权限配置失败: {e}")
            return False

    def _verify_installation(self) -> bool:
        """验证安装"""
        logger.info("验证安装...")

        # 检查MCP配置文件
        if not self.mcp_config_file.exists():
            logger.error("MCP配置文件不存在")
            return False

        # 检查自定义代理
        for agent_name in self.config['custom_agents'].keys():
            agent_file = self.custom_agents_dir / f"{agent_name}.json"
            if not agent_file.exists():
                logger.error(f"代理文件不存在: {agent_file}")
                return False

        # 验证MCP配置格式
        try:
            with open(self.mcp_config_file, 'r', encoding='utf-8') as f:
                mcp_config = json.load(f)

            server_name = self.config['mcp_config']['server_name']
            if server_name not in mcp_config.get('mcpServers', {}):
                logger.error(f"MCP服务器配置未找到: {server_name}")
                return False

        except Exception as e:
            logger.error(f"验证MCP配置失败: {e}")
            return False

        logger.info("✅ 安装验证通过")
        return True

    def _print_usage_instructions(self):
        """打印使用说明"""
        print("\n" + "="*60)
        print("🎉 Copilot CLI跨CLI集成安装完成！")
        print("="*60)
        print("\n📋 使用说明:")
        print("1. 启动Copilot CLI:")
        print("   copilot")
        print("\n2. 跨CLI调用示例:")
        print("   中文: '请用claude帮我写一个Python脚本'")
        print("   英文: 'use gemini to analyze this code'")
        print("\n3. 可用的代理:")
        for agent_name in self.config['custom_agents'].keys():
            print(f"   - {agent_name}")
        print("\n4. 支持的CLI工具:")
        for cli_tool in self.config['supported_cli_tools']:
            print(f"   - {cli_tool}")
        print("\n📁 配置文件位置:")
        print(f"   MCP配置: {self.mcp_config_file}")
        print(f"   自定义代理: {self.custom_agents_dir}")
        print("\n📚 更多信息请参考项目文档")
        print("="*60)

    def uninstall(self) -> bool:
        """卸载集成"""
        logger.info("卸载Copilot CLI跨CLI集成...")

        try:
            # 1. 移除MCP服务器配置
            if self.mcp_config_file.exists():
                mcp_config = self._load_existing_mcp_config()
                server_name = self.config['mcp_config']['server_name']

                if server_name in mcp_config.get('mcpServers', {}):
                    del mcp_config['mcpServers'][server_name]

                    with open(self.mcp_config_file, 'w', encoding='utf-8') as f:
                        json.dump(mcp_config, f, indent=2, ensure_ascii=False)

                    logger.info(f"移除MCP服务器配置: {server_name}")

            # 2. 移除自定义代理
            for agent_name in self.config['custom_agents'].keys():
                agent_file = self.custom_agents_dir / f"{agent_name}.json"
                if agent_file.exists():
                    agent_file.unlink()
                    logger.info(f"移除代理: {agent_name}")

            # 3. 询问是否移除配置目录
            if self.copilot_dir.exists():
                response = input(f"是否删除配置目录 {self.copilot_dir}？(y/N): ").strip().lower()
                if response in ['y', 'yes']:
                    shutil.rmtree(self.copilot_dir)
                    logger.info("删除配置目录")

            logger.info("✅ 卸载完成")
            return True

        except Exception as e:
            logger.error(f"卸载失败: {e}")
            return False


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Copilot CLI跨CLI集成安装程序")
    parser.add_argument(
        "--config",
        help="配置文件路径",
        default=None
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="强制覆盖现有配置"
    )
    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载集成"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="详细输出"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    installer = CopilotIntegrationInstaller(args.config)

    if args.uninstall:
        success = installer.uninstall()
    else:
        success = installer.install(args.force)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()