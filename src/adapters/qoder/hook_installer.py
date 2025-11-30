"""
Qoder CLI Hook安装器
用于自动安装和配置Qoder CLI的通知Hook插件
"""

import os
import sys
import shutil
import json
import logging
import platform
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class QoderHookInstaller:
    """Qoder CLI Hook安装器"""

    def __init__(self):
        """初始化安装器"""
        self.qoder_config_dir = os.path.expanduser("~/.qoder")
        self.hooks_dir = os.path.join(self.qoder_config_dir, "hooks")
        self.logs_dir = os.path.join(self.qoder_config_dir, "logs")
        self.cache_dir = os.path.join(self.qoder_config_dir, "cache")

        # 适配器路径
        self.current_dir = Path(__file__).parent
        self.hook_adapter_file = self.current_dir / "notification_hook_adapter.py"
        self.config_file = self.current_dir / "config.json"

        # 安装状态
        self.installation_log: List[Dict[str, Any]] = []

    async def install_hooks(self) -> bool:
        """
        安装Qoder CLI Hook插件

        Returns:
            bool: 安装是否成功
        """
        try:
            logger.info("开始安装Qoder CLI Hook插件...")

            # 1. 检查环境和平台
            if not await self._check_environment():
                logger.error("环境检查失败")
                return False

            # 2. 创建配置目录
            await self._create_directories()

            # 3. 复制适配器文件
            if not await self._install_adapter_files():
                logger.error("适配器文件安装失败")
                return False

            # 4. 创建Hook脚本
            if not await self._create_hook_scripts():
                logger.error("Hook脚本创建失败")
                return False

            # 5. 设置环境配置
            if not await self._setup_environment_config():
                logger.error("环境配置设置失败")
                return False

            # 6. 创建启动脚本
            if not await self._create_startup_scripts():
                logger.error("启动脚本创建失败")
                return False

            # 7. 验证安装
            if not await self._verify_installation():
                logger.error("安装验证失败")
                return False

            logger.info("Qoder CLI Hook插件安装成功")
            await self._log_installation("success", "Hook插件安装成功")
            return True

        except Exception as e:
            logger.error(f"安装Qoder CLI Hook插件失败: {e}")
            await self._log_installation("error", f"安装失败: {str(e)}")
            return False

    async def uninstall_hooks(self) -> bool:
        """
        卸载Qoder CLI Hook插件

        Returns:
            bool: 卸载是否成功
        """
        try:
            logger.info("开始卸载Qoder CLI Hook插件...")

            # 1. 备份配置
            await self._backup_configuration()

            # 2. 清理Hook脚本
            await self._cleanup_hook_scripts()

            # 3. 清理适配器文件
            await self._cleanup_adapter_files()

            # 4. 清理环境变量
            await self._cleanup_environment()

            # 5. 清理临时文件
            await self._cleanup_temp_files()

            logger.info("Qoder CLI Hook插件卸载成功")
            await self._log_installation("success", "Hook插件卸载成功")
            return True

        except Exception as e:
            logger.error(f"卸载Qoder CLI Hook插件失败: {e}")
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

            # 检查平台支持
            current_platform = platform.system()
            if current_platform not in ["Darwin", "Linux", "Windows"]:
                logger.warning(f"平台 {current_platform} 可能不受完全支持，将使用fallback机制")

            # 检查必要的文件是否存在
            required_files = [
                self.hook_adapter_file,
                self.config_file
            ]

            for file_path in required_files:
                if not file_path.exists():
                    logger.error(f"必要文件不存在: {file_path}")
                    return False

            # 检查依赖包
            try:
                import json
                import asyncio
                import subprocess
            except ImportError as e:
                logger.error(f"缺少依赖包: {e}")
                return False

            # 检查系统工具
            if current_platform == "Darwin":
                # 检查osascript是否可用
                try:
                    subprocess.run(['osascript', '-e', '1'],
                                  check=True, capture_output=True, timeout=2)
                except (subprocess.CalledProcessError, FileNotFoundError):
                    logger.warning("osascript不可用，通知功能可能受限")

            logger.info(f"环境检查通过 ({current_platform})")
            return True

        except Exception as e:
            logger.error(f"环境检查失败: {e}")
            return False

    async def _create_directories(self) -> None:
        """创建必要的目录"""
        directories = [
            self.qoder_config_dir,
            self.hooks_dir,
            self.logs_dir,
            self.cache_dir
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
            # 复制Hook适配器到Qoder目录
            adapter_dest = os.path.join(self.qoder_config_dir, "notification_hook_adapter.py")
            shutil.copy2(self.hook_adapter_file, adapter_dest)
            logger.info(f"复制Hook适配器到: {adapter_dest}")

            # 复制配置文件
            config_dest = os.path.join(self.qoder_config_dir, "config.json")
            shutil.copy2(self.config_file, config_dest)
            logger.info(f"复制配置文件到: {config_dest}")

            # 创建__init__.py文件
            init_file = os.path.join(self.qoder_config_dir, "__init__.py")
            if not os.path.exists(init_file):
                with open(init_file, 'w', encoding='utf-8') as f:
                    f.write('"""Qoder CLI Hook适配器包"""\n')
                logger.info(f"创建__init__.py文件: {init_file}")

            return True

        except Exception as e:
            logger.error(f"安装适配器文件失败: {e}")
            return False

    async def _create_hook_scripts(self) -> bool:
        """
        创建Hook脚本

        Returns:
            bool: 创建是否成功
        """
        try:
            # 前置Hook脚本
            pre_hook_content = '''#!/bin/bash
# Qoder CLI前置Hook脚本
# 检测跨CLI调用意图并发送通知

COMMAND="$1"
STAGE="pre_command"
SESSION_ID="${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 记录请求信息
REQUEST_FILE="$QODER_CROSS_CLI_REQUEST_FILE"
if [ -n "$REQUEST_FILE" ]; then
    cat > "$REQUEST_FILE" << EOF
{
    "stage": "$STAGE",
    "command": "$COMMAND",
    "session_id": "$SESSION_ID",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "platform": "$(uname -s)",
    "user": "$USER"
}
EOF
fi

# 检测跨CLI调用关键词
CROSS_CLI_KEYWORDS="请用|调用|用|让|use|call|ask"
CLI_NAMES="claude|gemini|qwencode|iflow|codebuddy|codex"

if echo "$COMMAND" | grep -E "($CROSS_CLI_KEYWORDS).*$CLI_NAMES" > /dev/null 2>&1; then
    # 发送跨CLI检测通知
    case "$(uname -s)" in
        Darwin*)
            if command -v osascript > /dev/null 2>&1; then
                osascript -e 'display notification "检测到跨CLI调用意图" with title "QoderCLI" subtitle "准备调用其他AI工具"'
            fi
            ;;
        Linux*)
            if command -v notify-send > /dev/null 2>&1; then
                notify-send "QoderCLI" "检测到跨CLI调用意图 - 准备调用其他AI工具" --urgency=normal
            fi
            ;;
    esac
fi

exit 0
'''

            # 后置Hook脚本
            post_hook_content = '''#!/bin/bash
# Qoder CLI后置Hook脚本
# 处理跨CLI调用结果并发送完成通知

EXIT_CODE=$?
STAGE="post_command"
COMMAND="$1"
SESSION_ID="${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 记录完成状态
STATUS_FILE="$QODER_CROSS_CLI_STATUS_FILE"
if [ -n "$STATUS_FILE" ]; then
    cat > "$STATUS_FILE" << EOF
{
    "stage": "$STAGE",
    "command": "$COMMAND",
    "session_id": "$SESSION_ID",
    "exit_code": $EXIT_CODE,
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "completed": true,
    "success": $([ $EXIT_CODE -eq 0 ] && echo true || echo false)
}
EOF
fi

# 检查是否有跨CLI响应
RESPONSE_FILE="$QODER_CROSS_CLI_RESPONSE_FILE"
if [ -f "$RESPONSE_FILE" ] && [ -s "$RESPONSE_FILE" ]; then
    # 发送完成通知
    case "$(uname -s)" in
        Darwin*)
            if command -v osascript > /dev/null 2>&1; then
                osascript -e 'display notification "[OK] 跨CLI调用完成" with title "QoderCLI" subtitle "任务执行成功"'
            fi
            ;;
        Linux*)
            if command -v notify-send > /dev/null 2>&1; then
                notify-send "QoderCLI" "[OK] 跨CLI调用完成" --urgency=low
            fi
            ;;
    esac
fi

exit $EXIT_CODE
'''

            # 错误处理Hook脚本
            error_hook_content = '''#!/bin/bash
# Qoder CLI错误处理Hook脚本
# 处理错误情况并发送授权通知

EXIT_CODE=$?
STAGE="error_handling"
COMMAND="$1"
SESSION_ID="${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 如果有错误，发送授权通知
if [ $EXIT_CODE -ne 0 ]; then
    case "$(uname -s)" in
        Darwin*)
            if command -v osascript > /dev/null 2>&1; then
                osascript -e 'display notification "⌛️ 你提交的任务需要授权呀…" with title "QoderCLI"'
            fi
            ;;
        Linux*)
            if command -v notify-send > /dev/null 2>&1; then
                notify-send "QoderCLI" "⌛️ 你提交的任务需要授权呀…" --urgency=normal
            fi
            ;;
    esac

    # 记录错误到日志
    LOG_FILE="$HOME/.qoder/logs/error.log"
    echo "[$(date)] Hook Error: Command '$COMMAND' failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

exit 0
'''

            # 写入脚本文件
            scripts = {
                'pre_hook.sh': pre_hook_content,
                'post_hook.sh': post_hook_content,
                'error_hook.sh': error_hook_content
            }

            for filename, content in scripts.items():
                script_path = os.path.join(self.hooks_dir, filename)
                with open(script_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                os.chmod(script_path, 0o755)
                logger.info(f"创建Hook脚本: {script_path}")

            return True

        except Exception as e:
            logger.error(f"创建Hook脚本失败: {e}")
            return False

    async def _setup_environment_config(self) -> bool:
        """
        设置环境配置

        Returns:
            bool: 设置是否成功
        """
        try:
            # 创建环境配置文件
            env_config = {
                "QODER_CROSS_CLI_ENABLED": "1",
                "QODER_CROSS_CLI_RESPONSE_FILE": "",
                "QODER_CROSS_CLI_REQUEST_FILE": "",
                "QODER_CROSS_CLI_STATUS_FILE": "",
                "QODER_HOOK_STAGE": "",
                "QODER_HOOK_COMMAND": "",
                "QODER_HOOK_SESSION_ID": "",
                "QODER_HOOK_LOG_LEVEL": "INFO",
                "QODER_HOOK_PLATFORM": platform.system()
            }

            env_config_path = os.path.join(self.qoder_config_dir, "environment.json")
            with open(env_config_path, 'w', encoding='utf-8') as f:
                json.dump(env_config, f, indent=2, ensure_ascii=False)

            logger.info(f"环境配置已创建: {env_config_path}")
            return True

        except Exception as e:
            logger.error(f"设置环境配置失败: {e}")
            return False

    async def _create_startup_scripts(self) -> bool:
        """
        创建启动脚本

        Returns:
            bool: 创建是否成功
        """
        try:
            # 创建Qoder Hook启动脚本
            startup_script = '''#!/bin/bash
# Qoder CLI Cross-CLI Hook启动脚本

QODER_DIR="$HOME/.qoder"
ADAPTER="$QODER_DIR/notification_hook_adapter.py"

# 检查Python环境
if ! command -v python3 > /dev/null 2>&1; then
    echo "错误: 需要Python 3"
    exit 1
fi

# 检查适配器文件
if [ ! -f "$ADAPTER" ]; then
    echo "错误: Qoder Hook适配器文件不存在: $ADAPTER"
    exit 1
fi

# 设置环境变量
export QODER_CROSS_CLI_ENABLED=1
export PYTHONPATH="$QODER_DIR:$PYTHONPATH"

# 启动Hook监控
echo "启动Qoder CLI Cross-CLI Hook监控..."
python3 "$ADAPTER"

echo "Qoder Hook监控已停止"
'''

            startup_script_path = os.path.join(self.qoder_config_dir, "start_hooks.sh")
            with open(startup_script_path, 'w', encoding='utf-8') as f:
                f.write(startup_script)
            os.chmod(startup_script_path, 0o755)

            logger.info(f"启动脚本已创建: {startup_script_path}")
            return True

        except Exception as e:
            logger.error(f"创建启动脚本失败: {e}")
            return False

    async def _verify_installation(self) -> bool:
        """
        验证安装

        Returns:
            bool: 验证是否成功
        """
        try:
            # 检查必要文件是否存在
            required_files = [
                os.path.join(self.qoder_config_dir, "notification_hook_adapter.py"),
                os.path.join(self.qoder_config_dir, "config.json"),
                os.path.join(self.hooks_dir, "pre_hook.sh"),
                os.path.join(self.hooks_dir, "post_hook.sh"),
                os.path.join(self.hooks_dir, "error_hook.sh"),
                os.path.join(self.qoder_config_dir, "environment.json"),
                os.path.join(self.qoder_config_dir, "start_hooks.sh")
            ]

            for file_path in required_files:
                if not os.path.exists(file_path):
                    logger.error(f"必要文件不存在: {file_path}")
                    return False

            # 检查目录权限
            if not os.access(self.hooks_dir, os.X_OK):
                logger.error(f"Hook目录无执行权限: {self.hooks_dir}")
                return False

            # 测试Hook脚本语法
            for script_name in ["pre_hook.sh", "post_hook.sh", "error_hook.sh"]:
                script_path = os.path.join(self.hooks_dir, script_name)
                if platform.system() != "Windows":
                    result = subprocess.run(
                        ['bash', '-n', script_path],
                        capture_output=True,
                        text=True
                    )
                    if result.returncode != 0:
                        logger.error(f"Hook脚本语法错误: {script_name}")
                        logger.error(f"错误信息: {result.stderr}")
                        return False

            logger.info("安装验证通过")
            return True

        except Exception as e:
            logger.error(f"安装验证失败: {e}")
            return False

    async def _backup_configuration(self) -> None:
        """备份现有配置"""
        try:
            backup_dir = os.path.join(self.qoder_config_dir, "backup", datetime.now().strftime("%Y%m%d_%H%M%S"))
            os.makedirs(backup_dir, exist_ok=True)

            # 备份Hook目录
            if os.path.exists(self.hooks_dir):
                backup_hooks_dir = os.path.join(backup_dir, "hooks")
                shutil.copytree(self.hooks_dir, backup_hooks_dir, dirs_exist_ok=True)

            # 备份配置文件
            config_files = [
                "notification_hook_adapter.py",
                "config.json",
                "environment.json",
                "start_hooks.sh"
            ]

            for config_file in config_files:
                src_path = os.path.join(self.qoder_config_dir, config_file)
                if os.path.exists(src_path):
                    dest_path = os.path.join(backup_dir, config_file)
                    shutil.copy2(src_path, dest_path)

            logger.info(f"配置已备份到: {backup_dir}")

        except Exception as e:
            logger.warning(f"备份配置失败: {e}")

    async def _cleanup_hook_scripts(self) -> None:
        """清理Hook脚本"""
        try:
            scripts = ["pre_hook.sh", "post_hook.sh", "error_hook.sh"]
            for script in scripts:
                script_path = os.path.join(self.hooks_dir, script)
                if os.path.exists(script_path):
                    os.remove(script_path)
                    logger.debug(f"删除Hook脚本: {script_path}")

        except Exception as e:
            logger.warning(f"清理Hook脚本失败: {e}")

    async def _cleanup_adapter_files(self) -> None:
        """清理适配器文件"""
        try:
            files = [
                "notification_hook_adapter.py",
                "config.json",
                "environment.json",
                "start_hooks.sh",
                "__init__.py"
            ]

            for file_name in files:
                file_path = os.path.join(self.qoder_config_dir, file_name)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"删除文件: {file_path}")

        except Exception as e:
            logger.warning(f"清理适配器文件失败: {e}")

    async def _cleanup_environment(self) -> None:
        """清理环境变量"""
        try:
            env_vars = [
                'QODER_CROSS_CLI_ENABLED',
                'QODER_CROSS_CLI_RESPONSE_FILE',
                'QODER_CROSS_CLI_REQUEST_FILE',
                'QODER_CROSS_CLI_STATUS_FILE',
                'QODER_HOOK_STAGE',
                'QODER_HOOK_COMMAND',
                'QODER_HOOK_SESSION_ID'
            ]

            for env_var in env_vars:
                if env_var in os.environ:
                    del os.environ[env_var]

            logger.debug("环境变量已清理")

        except Exception as e:
            logger.warning(f"清理环境变量失败: {e}")

    async def _cleanup_temp_files(self) -> None:
        """清理临时文件"""
        try:
            temp_pattern = os.path.join(self.qoder_config_dir, "cache", "qoder_cross_cli_temp_*")
            import glob
            temp_dirs = glob.glob(temp_pattern)

            for temp_dir in temp_dirs:
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    logger.debug(f"清理临时目录: {temp_dir}")

        except Exception as e:
            logger.warning(f"清理临时文件失败: {e}")

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
            'message': message,
            'platform': platform.system()
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
            'platform': platform.system(),
            'qoder_config_dir': self.qoder_config_dir,
            'hooks_dir': self.hooks_dir,
            'files_exist': {
                'hook_adapter': os.path.exists(os.path.join(self.qoder_config_dir, "notification_hook_adapter.py")),
                'config': os.path.exists(os.path.join(self.qoder_config_dir, "config.json")),
                'pre_hook': os.path.exists(os.path.join(self.hooks_dir, "pre_hook.sh")),
                'post_hook': os.path.exists(os.path.join(self.hooks_dir, "post_hook.sh")),
                'error_hook': os.path.exists(os.path.join(self.hooks_dir, "error_hook.sh")),
                'startup_script': os.path.exists(os.path.join(self.qoder_config_dir, "start_hooks.sh"))
            },
            'installation_log': self.installation_log
        }


# 便捷函数
async def install_qoder_hooks() -> bool:
    """
    安装Qoder CLI Hook插件

    Returns:
        bool: 安装是否成功
    """
    installer = QoderHookInstaller()
    return await installer.install_hooks()


async def uninstall_qoder_hooks() -> bool:
    """
    卸载Qoder CLI Hook插件

    Returns:
        bool: 卸载是否成功
    """
    installer = QoderHookInstaller()
    return await installer.uninstall_hooks()


def get_qoder_hook_status() -> Dict[str, Any]:
    """
    获取Qoder Hook插件状态

    Returns:
        Dict[str, Any]: 状态信息
    """
    installer = QoderHookInstaller()
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
            success = await install_qoder_hooks()
            print(f"安装{'成功' if success else '失败'}")
        elif command == "uninstall":
            success = await uninstall_qoder_hooks()
            print(f"卸载{'成功' if success else '失败'}")
        elif command == "status":
            status = get_qoder_hook_status()
            print("Qoder Hook插件状态:")
            print(json.dumps(status, indent=2, ensure_ascii=False))
        else:
            print("未知命令:", command)

    asyncio.run(main())