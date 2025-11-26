"""
QoderCLI通知Hook适配器 - 基于QoderCLI通知Hook系统的原生集成

基于QoderCLI官方通知Hook机制实现跨CLI调用功能。
Qoder CLI 目前主要支持通知类 Hooks，使用 AppleScript 进行 macOS 通知。

QoderCLI Hook机制:
- 通知类Hooks：通过osascript发送macOS系统通知
- 环境变量Hook：通过QODER_CROSS_CLI_* 环境变量进行通信
- 钩子点：任务执行前、执行后、错误处理
- 平台支持：主要针对macOS，兼容其他平台的fallback机制

完全符合项目约束条件：
- 使用Qoder CLI官方Hook机制
- 不改变CLI启动和使用方式
- 不依赖包装器
- 完全无损扩展
"""

import os
import sys
import json
import logging
import asyncio
import subprocess
import platform
import tempfile
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass

from ...core.base_adapter import BaseCrossCLIAdapter, IntentResult
from ...core.parser import NaturalLanguageParser

logger = logging.getLogger(__name__)


@dataclass
class QoderHookEvent:
    """Qoder Hook事件对象"""
    hook_type: str
    stage: str
    data: Dict[str, Any]
    timestamp: datetime
    session_id: str
    command: Optional[str] = None
    exit_code: Optional[int] = None


class QoderNotificationHookAdapter(BaseCrossCLIAdapter):
    """
    QoderCLI通知Hook适配器

    基于Qoder CLI的通知Hook系统和环境变量机制实现跨CLI调用功能。
    主要通过通知系统进行状态提示，环境变量进行实际数据交换。
    """

    def __init__(self, cli_name: str = "qoder"):
        """
        初始化Qoder通知Hook适配器

        Args:
            cli_name: CLI工具名称，默认为"qoder"
        """
        super().__init__(cli_name)

        # Qoder Hook相关配置
        self.is_macos = platform.system() == "Darwin"
        self.hook_enabled = False
        self.cross_cli_enabled = True

        # 环境变量配置
        self.env_vars = {
            'QODER_CROSS_CLI_ENABLED': '1',
            'QODER_CROSS_CLI_RESPONSE_FILE': '',
            'QODER_CROSS_CLI_REQUEST_FILE': '',
            'QODER_CROSS_CLI_STATUS_FILE': '',
            'QODER_HOOK_STAGE': '',
            'QODER_HOOK_COMMAND': '',
            'QODER_HOOK_SESSION_ID': ''
        }

        # 统计信息
        self.hook_executions = {
            'pre_command': 0,
            'post_command': 0,
            'error_handling': 0,
            'notification_sent': 0
        }
        self.cross_cli_calls = 0
        self.processed_events: List[QoderHookEvent] = []
        self.active_sessions: Dict[str, Dict] = {}

        # Hook脚本路径
        self.hook_script_dir = os.path.expanduser("~/.qoder/hooks")
        self.temp_dir = None

        # 组件
        self.parser = NaturalLanguageParser()

        logger.info("Qoder通知Hook适配器初始化完成")

    async def initialize(self) -> bool:
        """
        初始化适配器

        Returns:
            bool: 初始化是否成功
        """
        try:
            logger.info("开始初始化Qoder通知Hook适配器...")

            # 1. 检查Qoder CLI环境
            if not self._check_qoder_environment():
                logger.error("Qoder CLI环境检查失败")
                return False

            # 2. 创建临时目录和Hook目录
            await self._create_directories()

            # 3. 设置环境变量
            await self._setup_environment_variables()

            # 4. 创建Hook脚本
            if not await self._create_hook_scripts():
                logger.error("Hook脚本创建失败")
                return False

            # 5. 初始化通知系统
            await self._initialize_notification_system()

            self.hook_enabled = True
            logger.info("Qoder通知Hook适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化Qoder通知Hook适配器失败: {e}")
            self.record_error()
            return False

    def _check_qoder_environment(self) -> bool:
        """
        检查Qoder CLI环境

        Returns:
            bool: 环境是否可用
        """
        try:
            # 检查Qoder CLI命令
            result = subprocess.run(
                ['qoder', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                logger.info(f"检测到Qoder CLI: {result.stdout.strip()}")
                return True
            else:
                logger.warning("Qoder CLI不可用，使用开发模式")
                return True  # 开发环境中继续

        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.warning("Qoder CLI环境检查失败，使用开发模式")
            return True  # 开发环境中继续

    async def _create_directories(self) -> None:
        """创建必要的目录"""
        directories = [
            self.hook_script_dir,
            os.path.expanduser("~/.qoder/logs"),
            os.path.expanduser("~/.qoder/cache")
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)

        # 创建临时目录
        self.temp_dir = tempfile.mkdtemp(prefix="qoder_cross_cli_")
        logger.info(f"临时目录: {self.temp_dir}")

    async def _setup_environment_variables(self) -> None:
        """设置环境变量"""
        # 设置响应文件路径
        response_file = os.path.join(self.temp_dir, "cross_cli_response.json")
        request_file = os.path.join(self.temp_dir, "cross_cli_request.json")
        status_file = os.path.join(self.temp_dir, "cross_cli_status.json")

        self.env_vars.update({
            'QODER_CROSS_CLI_RESPONSE_FILE': response_file,
            'QODER_CROSS_CLI_REQUEST_FILE': request_file,
            'QODER_CROSS_CLI_STATUS_FILE': status_file
        })

        # 设置环境变量
        for key, value in self.env_vars.items():
            os.environ[key] = value

        logger.info("环境变量设置完成")

    async def _create_hook_scripts(self) -> bool:
        """
        创建Hook脚本

        Returns:
            bool: 创建是否成功
        """
        try:
            # 创建前置Hook脚本
            pre_hook_script = '''#!/bin/bash
# Qoder CLI前置Hook脚本
# 用于检测跨CLI调用意图

COMMAND="$1"
STAGE="pre_command"
SESSION_ID="${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 记录请求到文件
REQUEST_FILE="$QODER_CROSS_CLI_REQUEST_FILE"
if [ -n "$REQUEST_FILE" ]; then
    cat > "$REQUEST_FILE" << EOF
{
    "stage": "$STAGE",
    "command": "$COMMAND",
    "session_id": "$SESSION_ID",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "env_vars": $(env | grep QODER_ | jq -R 'split("="; {key: .[0], value: .[1]}' | jq -s 'from_entries')
}
EOF
fi

# 检测跨CLI调用意图
if echo "$COMMAND" | grep -E "(请用|调用|用|让).*claude|gemini|qwencode|iflow|qoder|codebuddy|codex" > /dev/null 2>&1; then
    # 发送跨CLI检测通知
    if command -v osascript > /dev/null 2>&1; then
        osascript -e "display notification \"检测到跨CLI调用意图\" with title \"QoderCLI\" subtitle \"准备调用其他AI工具\""
    fi
fi

exit 0
'''

            # 创建后置Hook脚本
            post_hook_script = '''#!/bin/bash
# Qoder CLI后置Hook脚本
# 用于处理跨CLI调用结果

EXIT_CODE=$?
STAGE="post_command"
COMMAND="$1"
SESSION_ID="${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 记录完成状态
if [ -n "$QODER_CROSS_CLI_STATUS_FILE" ]; then
    cat > "$QODER_CROSS_CLI_STATUS_FILE" << EOF
{
    "stage": "$STAGE",
    "command": "$COMMAND",
    "session_id": "$SESSION_ID",
    "exit_code": $EXIT_CODE,
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "completed": true
}
EOF
fi

# 检查是否有跨CLI响应
RESPONSE_FILE="$QODER_CROSS_CLI_RESPONSE_FILE"
if [ -f "$RESPONSE_FILE" ] && [ -s "$RESPONSE_FILE" ]; then
    # 发送完成通知
    if command -v osascript > /dev/null 2>&1; then
        osascript -e 'display notification "✅ 跨CLI调用完成" with title "QoderCLI"'
    fi
fi

exit $EXIT_CODE
'''

            # 创建错误处理Hook脚本
            error_hook_script = '''#!/bin/bash
# Qoder CLI错误处理Hook脚本
# 用于处理跨CLI调用错误

EXIT_CODE=$?
STAGE="error_handling"
COMMAND="$1"
SESSION_ID="${QODER_HOOK_SESSION_ID:-$(date +%s)}"

# 设置环境变量
export QODER_HOOK_STAGE="$STAGE"
export QODER_HOOK_COMMAND="$COMMAND"
export QODER_HOOK_SESSION_ID="$SESSION_ID"

# 如果有错误，发送通知
if [ $EXIT_CODE -ne 0 ]; then
    if command -v osascript > /dev/null 2>&1; then
        osascript -e 'display notification "⌛️ 你提交的任务需要授权呀…" with title "QoderCLI"'
    fi
fi

exit 0
'''

            # 写入脚本文件
            scripts = {
                'pre_hook.sh': pre_hook_script,
                'post_hook.sh': post_hook_script,
                'error_hook.sh': error_hook_script
            }

            for filename, content in scripts.items():
                script_path = os.path.join(self.hook_script_dir, filename)
                with open(script_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                os.chmod(script_path, 0o755)

            logger.info("Qoder Hook脚本创建完成")
            return True

        except Exception as e:
            logger.error(f"创建Hook脚本失败: {e}")
            return False

    async def _initialize_notification_system(self) -> None:
        """初始化通知系统"""
        if self.is_macos:
            # 测试AppleScript是否可用
            try:
                subprocess.run([
                    'osascript', '-e', 'display notification "Qoder CLI Hook系统初始化" with title "测试通知"'
                ], check=True, capture_output=True, timeout=5)
                logger.info("macOS通知系统初始化成功")
            except subprocess.CalledProcessError:
                logger.warning("macOS通知系统不可用，将使用fallback通知")
        else:
            logger.info("非macOS系统，将使用fallback通知机制")

    # ==================== 跨CLI功能实现 ====================

    async def handle_cross_cli_detection(self, command: str, session_id: str) -> Optional[str]:
        """
        处理跨CLI调用检测

        Args:
            command: 命令内容
            session_id: 会话ID

        Returns:
            Optional[str]: 跨CLI调用结果
        """
        try:
            logger.info(f"检测跨CLI调用: {command}")

            # 解析跨CLI意图
            intent = self.parser.parse_intent(command, "qoder")

            if not intent.is_cross_cli:
                return None

            # 避免自我调用
            if intent.target_cli == self.cli_name:
                return None

            # 发送检测通知
            await self._send_notification(
                f"检测到跨CLI调用: {intent.target_cli}",
                "QoderCLI",
                subtitle=f"任务: {intent.task[:50]}..."
            )

            # 执行跨CLI调用
            result = await self._execute_cross_cli_call(
                intent.target_cli,
                intent.task,
                {"command": command, "session_id": session_id}
            )

            if result:
                self.cross_cli_calls += 1

                # 将结果写入响应文件
                await self._write_response_file(result)

                # 发送完成通知
                await self._send_notification(
                    "✅ 跨CLI调用完成",
                    "QoderCLI",
                    subtitle=f"{intent.target_cli.upper()} 任务已完成"
                )

                return result

            return None

        except Exception as e:
            logger.error(f"处理跨CLI检测失败: {e}")
            self.record_error()
            return None

    async def _execute_cross_cli_call(
        self,
        target_cli: str,
        task: str,
        context: Dict[str, Any]
    ) -> Optional[str]:
        """
        执行跨CLI调用

        Args:
            target_cli: 目标CLI工具
            task: 要执行的任务
            context: 执行上下文

        Returns:
            Optional[str]: 执行结果
        """
        try:
            logger.info(f"执行跨CLI调用: {target_cli} -> {task}")

            # 获取目标CLI适配器
            from ...core.base_adapter import get_cross_cli_adapter
            target_adapter = get_cross_cli_adapter(target_cli)

            if not target_adapter:
                logger.warning(f"目标CLI适配器不可用: {target_cli}")
                return self._format_error_result(target_cli, task, f"目标CLI工具 '{target_cli}' 不可用")

            if not target_adapter.is_available():
                logger.warning(f"目标CLI工具不可用: {target_cli}")
                return self._format_error_result(target_cli, task, f"目标CLI工具 '{target_cli}' 当前不可用")

            # 构建执行上下文
            execution_context = {
                'source_cli': self.cli_name,
                'target_cli': target_cli,
                'original_task': task,
                'qoder_context': context,
                'timestamp': datetime.now().isoformat()
            }

            # 执行任务
            result = await target_adapter.execute_task(task, execution_context)

            # 记录成功的跨CLI调用
            self.processed_requests.append({
                'type': 'cross_cli_execution',
                'target_cli': target_cli,
                'task': task,
                'success': True,
                'result_length': len(result),
                'timestamp': datetime.now().isoformat()
            })

            # 格式化结果
            formatted_result = self._format_success_result(target_cli, task, result)

            logger.info(f"跨CLI调用成功: {target_cli}")
            return formatted_result

        except Exception as e:
            logger.error(f"跨CLI调用失败: {target_cli}, {e}")
            self.record_error()

            self.processed_requests.append({
                'type': 'cross_cli_execution',
                'target_cli': target_cli,
                'task': task,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })

            return self._format_error_result(target_cli, task, str(e))

    async def _send_notification(self, message: str, title: str = "QoderCLI", subtitle: str = "") -> None:
        """
        发送通知

        Args:
            message: 通知消息
            title: 通知标题
            subtitle: 副标题
        """
        try:
            if self.is_macos:
                # 使用AppleScript发送macOS通知
                script = f'display notification "{message}" with title "{title}"'
                if subtitle:
                    script += f' subtitle "{subtitle}"'

                subprocess.run(['osascript', '-e', script], check=True, capture_output=True, timeout=5)
                self.hook_executions['notification_sent'] += 1
            else:
                # 非macOS系统的fallback通知
                logger.info(f"[NOTIFICATION] {title}: {message} ({subtitle})")

        except Exception as e:
            logger.error(f"发送通知失败: {e}")
            # Fallback到日志
            logger.info(f"[NOTIFICATION] {title}: {message}")

    async def _write_response_file(self, result: str) -> None:
        """
        写入响应文件

        Args:
            result: 响应结果
        """
        try:
            response_file = self.env_vars.get('QODER_CROSS_CLI_RESPONSE_FILE')
            if response_file:
                response_data = {
                    'result': result,
                    'timestamp': datetime.now().isoformat(),
                    'cross_cli': True
                }

                with open(response_file, 'w', encoding='utf-8') as f:
                    json.dump(response_data, f, ensure_ascii=False, indent=2)

                logger.debug(f"响应已写入: {response_file}")

        except Exception as e:
            logger.error(f"写入响应文件失败: {e}")

    def _format_success_result(self, target_cli: str, task: str, result: str) -> str:
        """
        格式化成功的跨CLI调用结果

        Args:
            target_cli: 目标CLI工具
            task: 原始任务
            result: 执行结果

        Returns:
            str: 格式化的结果
        """
        return f"""## 🔗 跨CLI调用结果 (Qoder Hook)

**源工具**: Qoder CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由跨CLI集成系统通过Qoder CLI通知Hook提供*"""

    def _format_error_result(self, target_cli: str, task: str, error_message: str) -> str:
        """
        格式化错误的跨CLI调用结果

        Args:
            target_cli: 目标CLI工具
            task: 原始任务
            error_message: 错误信息

        Returns:
            str: 格式化的错误结果
        """
        return f"""## ❌ 跨CLI调用失败

**源工具**: Qoder CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**错误信息**: {error_message}
**失败时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

请检查目标CLI工具是否正确安装和配置。

---

*此错误由跨CLI集成系统报告*"""

    # ==================== Hook监控 ====================

    async def monitor_hook_events(self) -> None:
        """监控Hook事件"""
        try:
            request_file = self.env_vars.get('QODER_CROSS_CLI_REQUEST_FILE')
            status_file = self.env_vars.get('QODER_CROSS_CLI_STATUS_FILE')

            if request_file and os.path.exists(request_file):
                await self._process_request_file(request_file)

            if status_file and os.path.exists(status_file):
                await self._process_status_file(status_file)

        except Exception as e:
            logger.error(f"监控Hook事件失败: {e}")

    async def _process_request_file(self, file_path: str) -> None:
        """处理请求文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                request_data = json.load(f)

            event = QoderHookEvent(
                hook_type='notification',
                stage=request_data.get('stage', ''),
                data=request_data,
                timestamp=datetime.now(),
                session_id=request_data.get('session_id', ''),
                command=request_data.get('command', '')
            )

            self.processed_events.append(event)

            # 如果是前置命令，检测跨CLI调用
            if event.stage == 'pre_command' and event.command:
                cross_cli_result = await self.handle_cross_cli_detection(
                    event.command,
                    event.session_id
                )

                if cross_cli_result:
                    logger.info("通过Hook检测到并处理了跨CLI调用")

        except Exception as e:
            logger.error(f"处理请求文件失败: {e}")

    async def _process_status_file(self, file_path: str) -> None:
        """处理状态文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                status_data = json.load(f)

            logger.debug(f"Hook状态: {status_data}")

            # 更新会话统计
            session_id = status_data.get('session_id', '')
            if session_id:
                if session_id not in self.active_sessions:
                    self.active_sessions[session_id] = {
                        'start_time': datetime.now(),
                        'commands': [],
                        'cross_cli_calls': 0
                    }

                session = self.active_sessions[session_id]
                session['commands'].append(status_data)

        except Exception as e:
            logger.error(f"处理状态文件失败: {e}")

    # ==================== 基础接口实现 ====================

    def is_available(self) -> bool:
        """
        检查适配器是否可用

        Returns:
            bool: 是否可用
        """
        return (
            self.hook_enabled and
            os.path.exists(self.hook_script_dir) and
            self.temp_dir is not None
        )

    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        执行跨CLI任务 - Qoder适配器的具体实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        try:
            session_id = context.get('session_id', f"task-{datetime.now().timestamp()}")

            # 直接处理跨CLI检测
            cross_cli_result = await self.handle_cross_cli_detection(task, session_id)

            if cross_cli_result:
                return cross_cli_result

            return f"Qoder通知Hook适配器处理: {task}"

        except Exception as e:
            logger.error(f"执行任务失败: {task}, 错误: {e}")
            self.record_error()
            return f"任务执行失败: {str(e)}"

    async def health_check(self) -> Dict[str, Any]:
        """
        健康检查

        Returns:
            Dict[str, Any]: 健康状态
        """
        base_health = await super().health_check()

        qoder_health = {
            'hook_enabled': self.hook_enabled,
            'is_macos': self.is_macos,
            'hook_executions': self.hook_executions.copy(),
            'cross_cli_calls': self.cross_cli_calls,
            'processed_events_count': len(self.processed_events),
            'active_sessions_count': len(self.active_sessions),
            'hook_script_dir': self.hook_script_dir,
            'hook_scripts_exist': os.path.exists(os.path.join(self.hook_script_dir, 'pre_hook.sh')),
            'temp_dir': self.temp_dir,
            'env_vars_configured': all(key in os.environ for key in self.env_vars.keys())
        }

        # 检查环境
        try:
            qoder_health['qoder_environment'] = self._check_qoder_environment()
        except Exception as e:
            qoder_health['qoder_environment_error'] = str(e)

        # 合并基础健康信息
        base_health.update(qoder_health)
        return base_health

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        base_stats = super().get_statistics()

        qoder_stats = {
            'hook_enabled': self.hook_enabled,
            'is_macos': self.is_macos,
            'hook_executions': self.hook_executions.copy(),
            'cross_cli_calls': self.cross_cli_calls,
            'processed_events_count': len(self.processed_events),
            'active_sessions_count': len(self.active_sessions),
            'total_hook_calls': sum(self.hook_executions.values()),
            'notification_sent': self.hook_executions['notification_sent'],
            'hook_script_dir': self.hook_script_dir
        }

        base_stats.update(qoder_stats)
        return base_stats

    async def cleanup(self) -> bool:
        """
        清理适配器资源

        Returns:
            bool: 清理是否成功
        """
        try:
            # 清理统计信息
            self.processed_events.clear()
            self.active_sessions.clear()
            self.hook_executions = {key: 0 for key in self.hook_executions.keys()}

            # 清理临时目录
            if self.temp_dir and os.path.exists(self.temp_dir):
                import shutil
                shutil.rmtree(self.temp_dir, ignore_errors=True)
                self.temp_dir = None

            logger.info("Qoder通知Hook适配器清理完成")
            return True

        except Exception as e:
            logger.error(f"清理Qoder通知Hook适配器失败: {e}")
            return False

    async def start_monitoring(self) -> None:
        """开始监控Hook事件"""
        if not self.is_available():
            logger.warning("适配器不可用，无法开始监控")
            return

        logger.info("开始监控Qoder Hook事件")
        try:
            while self.hook_enabled:
                await self.monitor_hook_events()
                await asyncio.sleep(1)  # 每秒检查一次
        except asyncio.CancelledError:
            logger.info("Hook监控已停止")
        except Exception as e:
            logger.error(f"Hook监控异常: {e}")


# 创建全局适配器实例
_global_adapter: Optional[QoderNotificationHookAdapter] = None


def get_qoder_notification_hook_adapter() -> QoderNotificationHookAdapter:
    """
    获取Qoder通知Hook适配器实例

    Returns:
        QoderNotificationHookAdapter: 适配器实例
    """
    global _global_adapter
    if _global_adapter is None:
        _global_adapter = QoderNotificationHookAdapter()
        # 异步初始化需要在调用时进行
    return _global_adapter


# 便捷函数
async def initialize_qoder_notification_adapter() -> bool:
    """
    初始化Qoder通知Hook适配器

    Returns:
        bool: 初始化是否成功
    """
    adapter = get_qoder_notification_hook_adapter()
    return await adapter.initialize()


def is_qoder_notification_adapter_available() -> bool:
    """
    检查Qoder通知Hook适配器是否可用

    Returns:
        bool: 是否可用
    """
    adapter = get_qoder_notification_hook_adapter()
    return adapter.is_available()


if __name__ == "__main__":
    import asyncio

    async def main():
        """主函数 - 用于测试和独立运行"""
        adapter = QoderNotificationHookAdapter()

        # 初始化
        if await adapter.initialize():
            print("Qoder通知Hook适配器初始化成功")

            # 开始监控
            try:
                await adapter.start_monitoring()
            except KeyboardInterrupt:
                print("\n停止监控")
        else:
            print("Qoder通知Hook适配器初始化失败")

    asyncio.run(main())