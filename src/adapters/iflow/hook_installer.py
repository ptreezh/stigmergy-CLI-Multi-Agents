"""
iFlow CLI Hook安装器
用于自动安装和配置iFlow CLI的Hook插件
"""

import os
import sys
import shutil
import json
import yaml
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class IFlowHookInstaller:
    """iFlow CLI Hook安装器"""

    def __init__(self):
        """初始化安装器"""
        self.iflow_config_dir = os.path.expanduser("~/.config/iflow")
        self.hooks_config_file = os.path.join(self.iflow_config_dir, "hooks.yml")
        self.adapters_dir = os.path.join(self.iflow_config_dir, "adapters")
        self.workflows_dir = os.path.join(self.iflow_config_dir, "workflows")
        self.logs_dir = os.path.join(self.iflow_config_dir, "logs")

        # 适配器路径
        self.current_dir = Path(__file__).parent
        self.hook_adapter_file = self.current_dir / "hook_adapter.py"
        self.config_file = self.current_dir / "config.json"
        self.hooks_config_file = self.current_dir / "hooks.yml"

        # 安装状态
        self.installation_log: List[Dict[str, Any]] = []

    async def install_hooks(self) -> bool:
        """
        安装iFlow CLI Hook插件

        Returns:
            bool: 安装是否成功
        """
        try:
            logger.info("开始安装iFlow CLI Hook插件...")

            # 1. 检查环境
            if not await self._check_environment():
                logger.error("环境检查失败")
                return False

            # 2. 创建配置目录
            await self._create_directories()

            # 3. 复制适配器文件
            if not await self._install_adapter_files():
                logger.error("适配器文件安装失败")
                return False

            # 4. 配置Hook插件
            if not await self._configure_hooks():
                logger.error("Hook配置失败")
                return False

            # 5. 创建工作流文件
            if not await self._create_workflows():
                logger.error("工作流创建失败")
                return False

            # 6. 验证安装
            if not await self._verify_installation():
                logger.error("安装验证失败")
                return False

            logger.info("iFlow CLI Hook插件安装成功")
            await self._log_installation("success", "Hook插件安装成功")
            return True

        except Exception as e:
            logger.error(f"安装iFlow CLI Hook插件失败: {e}")
            await self._log_installation("error", f"安装失败: {str(e)}")
            return False

    async def uninstall_hooks(self) -> bool:
        """
        卸载iFlow CLI Hook插件

        Returns:
            bool: 卸载是否成功
        """
        try:
            logger.info("开始卸载iFlow CLI Hook插件...")

            # 1. 备份配置
            await self._backup_configuration()

            # 2. 移除Hook配置
            if not await self._remove_hook_configuration():
                logger.error("Hook配置移除失败")
                return False

            # 3. 清理适配器文件
            await self._cleanup_adapter_files()

            logger.info("iFlow CLI Hook插件卸载成功")
            await self._log_installation("success", "Hook插件卸载成功")
            return True

        except Exception as e:
            logger.error(f"卸载iFlow CLI Hook插件失败: {e}")
            await self._log_installation("error", f"卸载失败: {str(e)}")
            return False

    async def _check_environment(self) -> bool:
        """
        检查安装环境

        Returns:
            bool: 环境是否满足要求
        """
        try:
            # 检查Python版本
            if sys.version_info < (3, 8):
                logger.error("需要Python 3.8或更高版本")
                return False

            # 检查必要的文件是否存在
            required_files = [
                self.hook_adapter_file,
                self.config_file,
                self.hooks_config_file
            ]

            for file_path in required_files:
                if not file_path.exists():
                    logger.error(f"必要文件不存在: {file_path}")
                    return False

            # 检查依赖包
            try:
                import yaml
                import asyncio
            except ImportError as e:
                logger.error(f"缺少依赖包: {e}")
                return False

            logger.info("环境检查通过")
            return True

        except Exception as e:
            logger.error(f"环境检查失败: {e}")
            return False

    async def _create_directories(self) -> None:
        """创建必要的目录"""
        directories = [
            self.iflow_config_dir,
            self.adapters_dir,
            self.workflows_dir,
            self.logs_dir
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            logger.debug(f"创建目录: {directory}")

    async def _install_adapter_files(self) -> bool:
        """
        安装适配器文件

        Returns:
            bool: 安装是否成功
        """
        try:
            # 复制Hook适配器到iFlow适配器目录
            adapter_dest = os.path.join(self.adapters_dir, "hook_adapter.py")
            shutil.copy2(self.hook_adapter_file, adapter_dest)
            logger.info(f"复制Hook适配器到: {adapter_dest}")

            # 复制配置文件
            config_dest = os.path.join(self.adapters_dir, "config.json")
            shutil.copy2(self.config_file, config_dest)
            logger.info(f"复制配置文件到: {config_dest}")

            # 创建__init__.py文件使其成为Python包
            init_file = os.path.join(self.adapters_dir, "__init__.py")
            if not os.path.exists(init_file):
                with open(init_file, 'w', encoding='utf-8') as f:
                    f.write('"""iFlow CLI适配器包"""\n')
                logger.info(f"创建__init__.py文件: {init_file}")

            return True

        except Exception as e:
            logger.error(f"安装适配器文件失败: {e}")
            return False

    async def _configure_hooks(self) -> bool:
        """
        配置Hook插件

        Returns:
            bool: 配置是否成功
        """
        try:
            # 读取现有的hooks配置
            existing_config = {}
            if os.path.exists(self.hooks_config_file):
                with open(self.hooks_config_file, 'r', encoding='utf-8') as f:
                    existing_config = yaml.safe_load(f) or {}

            # 读取我们的hooks配置
            with open(self.hooks_config_file, 'r', encoding='utf-8') as f:
                hook_config = yaml.safe_load(f)

            # 合并配置
            merged_config = self._merge_hook_config(existing_config, hook_config)

            # 保存合并后的配置
            with open(self.hooks_config_file, 'w', encoding='utf-8') as f:
                yaml.dump(merged_config, f, default_flow_style=False, allow_unicode=True)

            logger.info(f"Hook配置已保存到: {self.hooks_config_file}")
            return True

        except Exception as e:
            logger.error(f"配置Hook失败: {e}")
            return False

    def _merge_hook_config(self, existing: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
        """
        合并Hook配置

        Args:
            existing: 现有配置
            new: 新配置

        Returns:
            Dict[str, Any]: 合并后的配置
        """
        merged = existing.copy()

        # 合并plugins
        existing_plugins = merged.get('plugins', [])
        new_plugins = new.get('plugins', [])

        for new_plugin in new_plugins:
            # 检查是否已存在同名插件
            existing_plugin = next(
                (p for p in existing_plugins if p.get('name') == new_plugin.get('name')),
                None
            )

            if existing_plugin:
                # 更新现有插件
                existing_plugin.update(new_plugin)
            else:
                # 添加新插件
                existing_plugins.append(new_plugin)

        merged['plugins'] = existing_plugins

        # 合并其他配置
        for key, value in new.items():
            if key != 'plugins':
                merged[key] = value

        return merged

    async def _create_workflows(self) -> bool:
        """
        创建工作流文件

        Returns:
            bool: 创建是否成功
        """
        try:
            # 创建跨CLI集成工作流
            workflow_config = {
                "name": "cross-cli-integration",
                "description": "跨CLI工具集成工作流",
                "version": "1.0",
                "stages": [
                    {
                        "name": "input_processing",
                        "description": "输入处理和意图检测",
                        "type": "python",
                        "required": True,
                        "timeout": 10
                    },
                    {
                        "name": "cross_cli_execution",
                        "description": "跨CLI调用执行",
                        "type": "python",
                        "required": False,
                        "timeout": 30
                    },
                    {
                        "name": "result_processing",
                        "description": "结果处理和格式化",
                        "type": "python",
                        "required": True,
                        "timeout": 15
                    }
                ],
                "hooks": {
                    "hooks_enabled": True,
                    "hook_file": "~/.config/iflow/hooks.yml"
                }
            }

            workflow_file = os.path.join(self.workflows_dir, "cross_cli_integration.json")
            with open(workflow_file, 'w', encoding='utf-8') as f:
                json.dump(workflow_config, f, indent=2, ensure_ascii=False)

            logger.info(f"创建工作流文件: {workflow_file}")
            return True

        except Exception as e:
            logger.error(f"创建工作流失败: {e}")
            return False

    async def _verify_installation(self) -> bool:
        """
        验证安装

        Returns:
            bool: 验证是否成功
        """
        try:
            # 检查文件是否存在
            required_files = [
                self.hooks_config_file,
                os.path.join(self.adapters_dir, "hook_adapter.py"),
                os.path.join(self.adapters_dir, "config.json"),
                os.path.join(self.workflows_dir, "cross_cli_integration.json")
            ]

            for file_path in required_files:
                if not os.path.exists(file_path):
                    logger.error(f"必要文件不存在: {file_path}")
                    return False

            # 检查配置格式
            with open(self.hooks_config_file, 'r', encoding='utf-8') as f:
                hook_config = yaml.safe_load(f)

            if not hook_config or 'plugins' not in hook_config:
                logger.error("Hook配置格式错误")
                return False

            # 检查我们的插件是否存在
            plugins = hook_config.get('plugins', [])
            cross_cli_plugin = next(
                (p for p in plugins if p.get('name') == 'cross-cli-adapter'),
                None
            )

            if not cross_cli_plugin:
                logger.error("跨CLI适配器插件未找到")
                return False

            logger.info("安装验证通过")
            return True

        except Exception as e:
            logger.error(f"安装验证失败: {e}")
            return False

    async def _backup_configuration(self) -> None:
        """备份现有配置"""
        try:
            if os.path.exists(self.hooks_config_file):
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_file = f"{self.hooks_config_file}.backup_{timestamp}"
                shutil.copy2(self.hooks_config_file, backup_file)
                logger.info(f"配置已备份到: {backup_file}")
        except Exception as e:
            logger.warning(f"备份配置失败: {e}")

    async def _remove_hook_configuration(self) -> bool:
        """
        移除Hook配置

        Returns:
            bool: 移除是否成功
        """
        try:
            if not os.path.exists(self.hooks_config_file):
                return True

            # 读取现有配置
            with open(self.hooks_config_file, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f) or {}

            # 移除我们的插件
            plugins = config.get('plugins', [])
            plugins = [p for p in plugins if p.get('name') != 'cross-cli-adapter']
            config['plugins'] = plugins

            # 保存配置
            with open(self.hooks_config_file, 'w', encoding='utf-8') as f:
                yaml.dump(config, f, default_flow_style=False, allow_unicode=True)

            logger.info("Hook配置已移除")
            return True

        except Exception as e:
            logger.error(f"移除Hook配置失败: {e}")
            return False

    async def _cleanup_adapter_files(self) -> None:
        """清理适配器文件"""
        try:
            files_to_remove = [
                os.path.join(self.adapters_dir, "hook_adapter.py"),
                os.path.join(self.adapters_dir, "config.json"),
                os.path.join(self.workflows_dir, "cross_cli_integration.json")
            ]

            for file_path in files_to_remove:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"删除文件: {file_path}")

        except Exception as e:
            logger.warning(f"清理适配器文件失败: {e}")

    async def _log_installation(self, status: str, message: str) -> None:
        """
        记录安装日志

        Args:
            status: 状态
            message: 消息
        """
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'status': status,
            'message': message
        }
        self.installation_log.append(log_entry)

        # 写入日志文件
        log_file = os.path.join(self.logs_dir, "installation.log")
        os.makedirs(os.path.dirname(log_file), exist_ok=True)

        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"{json.dumps(log_entry, ensure_ascii=False)}\n")
        except Exception as e:
            logger.warning(f"写入安装日志失败: {e}")

    def get_installation_status(self) -> Dict[str, Any]:
        """
        获取安装状态

        Returns:
            Dict[str, Any]: 安装状态
        """
        return {
            'iflow_config_dir': self.iflow_config_dir,
            'hooks_config_file': self.hooks_config_file,
            'files_exist': {
                'hook_adapter': os.path.exists(os.path.join(self.adapters_dir, "hook_adapter.py")),
                'config': os.path.exists(os.path.join(self.adapters_dir, "config.json")),
                'hooks_config': os.path.exists(self.hooks_config_file),
                'workflow': os.path.exists(os.path.join(self.workflows_dir, "cross_cli_integration.json"))
            },
            'installation_log': self.installation_log
        }


# 便捷函数
async def install_iflow_hooks() -> bool:
    """
    安装iFlow CLI Hook插件

    Returns:
        bool: 安装是否成功
    """
    installer = IFlowHookInstaller()
    return await installer.install_hooks()


async def uninstall_iflow_hooks() -> bool:
    """
    卸载iFlow CLI Hook插件

    Returns:
        bool: 卸载是否成功
    """
    installer = IFlowHookInstaller()
    return await installer.uninstall_hooks()


def get_iflow_hook_status() -> Dict[str, Any]:
    """
    获取iFlow Hook插件状态

    Returns:
        Dict[str, Any]: 状态信息
    """
    installer = IFlowHookInstaller()
    return installer.get_installation_status()


if __name__ == "__main__":
    import asyncio

    async def main():
        """主函数"""
        import sys

        if len(sys.argv) < 2:
            print("用法: python hook_installer.py [install|uninstall|status]")
            return

        command = sys.argv[1].lower()

        if command == "install":
            success = await install_iflow_hooks()
            print(f"安装{'成功' if success else '失败'}")
        elif command == "uninstall":
            success = await uninstall_iflow_hooks()
            print(f"卸载{'成功' if success else '失败'}")
        elif command == "status":
            status = get_iflow_hook_status()
            print("iFlow Hook插件状态:")
            print(json.dumps(status, indent=2, ensure_ascii=False))
        else:
            print("未知命令:", command)

    asyncio.run(main())