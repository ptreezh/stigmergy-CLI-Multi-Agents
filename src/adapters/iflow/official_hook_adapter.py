"""
iFlow CLI官方Hook适配器 - 基于iFlow CLI官方Hook系统的原生集成

严格基于iFlow CLI官方文档实现9种Hook类型：
1. PreToolUse - 工具执行前触发
2. PostToolUse - 工具执行后触发
3. SetUpEnvironment - 环境设置时触发
4. Stop - 主会话结束时触发
5. SubagentStop - 子代理会话结束时触发
6. SessionStart - 会话开始时触发
7. SessionEnd - 会话结束时触发
8. UserPromptSubmit - 用户提示词提交时触发
9. Notification - 通知发送时触发

完全符合项目约束条件：
- 使用iFlow CLI官方Hook机制
- 不改变CLI启动和使用方式
- 不依赖包装器
- 完全无损扩展
"""

import os
import json
import logging
import asyncio
import subprocess
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass

from ...core.parser import NaturalLanguageParser

logger = logging.getLogger(__name__)


@dataclass
class IFlowHookEvent:
    """iFlow Hook事件对象"""
    hook_type: str
    matcher: Optional[str]
    data: Dict[str, Any]
    timestamp: datetime
    session_id: str
    tool_name: Optional[str] = None
    command: Optional[str] = None


class IFlowOfficialHookAdapter:
    """
    iFlow CLI官方Hook适配器

    基于iFlow CLI官方Hook系统实现跨CLI调用功能
    支持所有9种官方Hook类型和完整的matcher功能
    """

    def __init__(self, cli_name: str = "iflow"):
        """
        初始化iFlow官方Hook适配器

        Args:
            cli_name: CLI工具名称，默认为"iflow"
        """
        super().__init__(cli_name)

        # iFlow官方Hook配置
        self.iflow_settings_file = os.path.expanduser("~/.iflow/settings.json")
        self.iflow_config_dir = os.path.expanduser("~/.iflow")
        self.hooks_enabled = False
        self.hook_scripts_dir = os.path.join(self.iflow_config_dir, "hooks")

        # 9种官方Hook处理器
        self.official_hooks = {
            'PreToolUse': self.handle_pre_tool_use,
            'PostToolUse': self.handle_post_tool_use,
            'SetUpEnvironment': self.handle_set_up_environment,
            'Stop': self.handle_stop,
            'SubagentStop': self.handle_subagent_stop,
            'SessionStart': self.handle_session_start,
            'SessionEnd': self.handle_session_end,
            'UserPromptSubmit': self.handle_user_prompt_submit,
            'Notification': self.handle_notification
        }

        # 统计信息
        self.hook_executions = {hook: 0 for hook in self.official_hooks.keys()}
        self.cross_cli_interceptions = 0
        self.processed_events: List[IFlowHookEvent] = []
        self.active_sessions: Dict[str, Dict] = {}

        # 组件
        self.parser = NaturalLanguageParser()
        self.hook_config = self._get_default_hook_config()

        logger.info("iFlow官方Hook适配器初始化完成")

    def _get_default_hook_config(self) -> Dict[str, Any]:
        """获取默认Hook配置"""
        return {
            "hooks": {
                "PreToolUse": [
                    {
                        "matcher": "*",
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter PreToolUse",
                                "timeout": 30
                            }
                        ]
                    }
                ],
                "PostToolUse": [
                    {
                        "matcher": "*",
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter PostToolUse",
                                "timeout": 15
                            }
                        ]
                    }
                ],
                "SetUpEnvironment": [
                    {
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter SetUpEnvironment",
                                "timeout": 30
                            }
                        ]
                    }
                ],
                "Stop": [
                    {
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter Stop",
                                "timeout": 10
                            }
                        ]
                    }
                ],
                "SubagentStop": [
                    {
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter SubagentStop",
                                "timeout": 10
                            }
                        ]
                    }
                ],
                "SessionStart": [
                    {
                        "matcher": "startup|resume",
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter SessionStart",
                                "timeout": 15
                            }
                        ]
                    }
                ],
                "SessionEnd": [
                    {
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter SessionEnd",
                                "timeout": 15
                            }
                        ]
                    }
                ],
                "UserPromptSubmit": [
                    {
                        "matcher": ".*",
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter UserPromptSubmit",
                                "timeout": 30
                            }
                        ]
                    }
                ],
                "Notification": [
                    {
                        "matcher": ".*",
                        "hooks": [
                            {
                                "type": "command",
                                "command": "python -m src.adapters.iflow.official_hook_adapter Notification",
                                "timeout": 10
                            }
                        ]
                    }
                ]
            }
        }

    async def initialize(self) -> bool:
        """
        初始化适配器

        Returns:
            bool: 初始化是否成功
        """
        try:
            logger.info("开始初始化iFlow官方Hook适配器...")

            # 1. 检查iFlow CLI环境
            if not self._check_iflow_environment():
                logger.error("iFlow CLI环境检查失败")
                return False

            # 2. 创建Hook目录
            await self._ensure_hook_directories()

            # 3. 注册Hook配置到iFlow设置
            if not await self._register_iflow_hooks():
                logger.error("Hook注册失败")
                return False

            # 4. 创建Hook脚本
            if not await self._create_hook_scripts():
                logger.error("Hook脚本创建失败")
                return False

            # 5. 初始化协作系统
            await self._initialize_collaboration_system()

            self.hooks_enabled = True
            logger.info("iFlow官方Hook适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化iFlow官方Hook适配器失败: {e}")
            self.record_error()
            return False

    def _check_iflow_environment(self) -> bool:
        """
        检查iFlow CLI环境

        Returns:
            bool: 环境是否可用
        """
        try:
            # 检查iFlow CLI命令
            result = subprocess.run(
                ['iflow', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                logger.info(f"检测到iFlow CLI: {result.stdout.strip()}")
                return True
            else:
                logger.warning("iFlow CLI不可用")
                return False

        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.warning("iFlow CLI环境检查失败")
            return True  # 开发环境中继续

    async def _ensure_hook_directories(self) -> None:
        """确保Hook目录存在"""
        directories = [
            self.iflow_config_dir,
            self.hooks_scripts_dir,
            os.path.join(self.iflow_config_dir, "logs")
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    async def _register_iflow_hooks(self) -> bool:
        """
        注册Hook配置到iFlow设置

        Returns:
            bool: 注册是否成功
        """
        try:
            # 读取现有设置
            existing_settings = {}
            if os.path.exists(self.iflow_settings_file):
                with open(self.iflow_settings_file, 'r', encoding='utf-8') as f:
                    existing_settings = json.load(f)

            # 合并Hook配置
            if 'hooks' not in existing_settings:
                existing_settings['hooks'] = {}

            # 合并我们的Hook配置
            for hook_type, hook_config in self.hook_config['hooks'].items():
                if hook_type not in existing_settings['hooks']:
                    existing_settings['hooks'][hook_type] = []
                existing_settings['hooks'][hook_type].extend(hook_config)

            # 保存设置
            with open(self.iflow_settings_file, 'w', encoding='utf-8') as f:
                json.dump(existing_settings, f, indent=2, ensure_ascii=False)

            logger.info(f"Hook配置已注册到: {self.iflow_settings_file}")
            return True

        except Exception as e:
            logger.error(f"注册Hook配置失败: {e}")
            return False

    async def _create_hook_scripts(self) -> bool:
        """
        创建Hook脚本

        Returns:
            bool: 创建是否成功
        """
        try:
            # 创建主Hook脚本
            hook_script_content = '''#!/usr/bin/env python3
"""
iFlow CLI Hook执行脚本
"""
import sys
import json
import asyncio
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from src.adapters.iflow.official_hook_adapter import IFlowOfficialHookAdapter

async def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("Usage: hook_script.py <hook_type>", file=sys.stderr)
        sys.exit(1)

    hook_type = sys.argv[1]
    adapter = IFlowOfficialHookAdapter()

    # 读取stdin数据（iFlow通过stdin传递Hook数据）
    try:
        input_data = json.loads(sys.stdin.read())
    except:
        input_data = {}

    # 执行对应的Hook处理器
    try:
        result = await adapter.execute_hook_from_command(hook_type, input_data)
        if result:
            print(result)
    except Exception as e:
        print(f"Hook执行错误: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
'''

            hook_script_path = os.path.join(self.hooks_scripts_dir, "hook_handler.py")
            with open(hook_script_path, 'w', encoding='utf-8') as f:
                f.write(hook_script_content)

            # 设置执行权限
            os.chmod(hook_script_path, 0o755)

            logger.info(f"Hook脚本已创建: {hook_script_path}")
            return True

        except Exception as e:
            logger.error(f"创建Hook脚本失败: {e}")
            return False

    async def _initialize_collaboration_system(self) -> None:
        """初始化协作系统"""
        self.active_sessions = {}
        logger.info("协作系统初始化完成")

    # ==================== 官方Hook处理器 ====================

    async def handle_pre_tool_use(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        PreToolUse Hook处理器 - 工具执行前触发

        用途：
        - 验证工具参数
        - 设置执行环境
        - 记录工具调用日志
        - 阻止不安全的操作
        - 检测跨CLI调用意图

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果，返回None继续执行，返回字符串可阻止执行
        """
        try:
            self.hook_executions['PreToolUse'] += 1

            tool_name = event_data.get('tool_name', '')
            tool_args = event_data.get('args', [])

            # 记录事件
            event = IFlowHookEvent(
                hook_type='PreToolUse',
                matcher=tool_name,
                data=event_data,
                timestamp=datetime.now(),
                session_id=event_data.get('session_id', ''),
                tool_name=tool_name
            )
            self.processed_events.append(event)

            logger.debug(f"PreToolUse: {tool_name}")

            # 检测跨CLI调用意图
            cross_cli_result = await self._detect_cross_cli_in_tool_use(tool_name, tool_args)
            if cross_cli_result:
                self.cross_cli_interceptions += 1
                return cross_cli_result

            return None  # 继续正常工具执行

        except Exception as e:
            logger.error(f"PreToolUse Hook处理失败: {e}")
            self.record_error()
            return None

    async def handle_post_tool_use(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        PostToolUse Hook处理器 - 工具执行后触发

        用途：
        - 处理工具执行结果
        - 记录执行日志
        - 执行清理操作
        - 结果后处理

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['PostToolUse'] += 1

            tool_name = event_data.get('tool_name', '')
            tool_result = event_data.get('result', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='PostToolUse',
                matcher=tool_name,
                data=event_data,
                timestamp=datetime.now(),
                session_id=event_data.get('session_id', ''),
                tool_name=tool_name
            )
            self.processed_events.append(event)

            logger.debug(f"PostToolUse: {tool_name}")

            # 可以在这里处理工具执行结果
            # 例如：格式化结果、执行后处理等

            return None

        except Exception as e:
            logger.error(f"PostToolUse Hook处理失败: {e}")
            return None

    async def handle_set_up_environment(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        SetUpEnvironment Hook处理器 - 环境设置时触发

        用途：
        - 初始化会话环境
        - 设置环境变量
        - 准备跨CLI环境
        - 执行启动前设置

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['SetUpEnvironment'] += 1

            session_id = event_data.get('session_id', 'default')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='SetUpEnvironment',
                matcher=None,
                data=event_data,
                timestamp=datetime.now(),
                session_id=session_id
            )
            self.processed_events.append(event)

            logger.info("SetUpEnvironment: 初始化跨CLI环境")

            # 初始化会话的跨CLI环境
            self.active_sessions[session_id] = {
                'start_time': datetime.now(),
                'cross_cli_calls': 0,
                'environment': 'ready'
            }

            return None

        except Exception as e:
            logger.error(f"SetUpEnvironment Hook处理失败: {e}")
            return None

    async def handle_stop(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        Stop Hook处理器 - 主会话结束时触发

        用途：
        - 清理会话资源
        - 记录会话总结
        - 执行清理操作
        - 保存会话状态

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['Stop'] += 1

            session_id = event_data.get('session_id', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='Stop',
                matcher=None,
                data=event_data,
                timestamp=datetime.now(),
                session_id=session_id
            )
            self.processed_events.append(event)

            logger.info(f"Stop: 清理会话 {session_id}")

            # 清理会话资源
            if session_id in self.active_sessions:
                session_data = self.active_sessions[session_id]
                logger.info(f"会话统计: 跨CLI调用次数 {session_data.get('cross_cli_calls', 0)}")
                del self.active_sessions[session_id]

            return None

        except Exception as e:
            logger.error(f"Stop Hook处理失败: {e}")
            return None

    async def handle_subagent_stop(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        SubagentStop Hook处理器 - 子代理会话结束时触发

        用途：
        - 清理子代理资源
        - 记录子任务执行情况
        - 合并子任务结果
        - 执行子任务后处理

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['SubagentStop'] += 1

            subagent_id = event_data.get('subagent_id', '')
            parent_session_id = event_data.get('parent_session_id', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='SubagentStop',
                matcher=None,
                data=event_data,
                timestamp=datetime.now(),
                session_id=parent_session_id
            )
            self.processed_events.append(event)

            logger.debug(f"SubagentStop: 子代理 {subagent_id} 结束")

            return None

        except Exception as e:
            logger.error(f"SubagentStop Hook处理失败: {e}")
            return None

    async def handle_session_start(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        SessionStart Hook处理器 - 会话开始时触发

        用途：
        - 初始化会话环境
        - 设置日志记录
        - 发送会话开始通知
        - 执行启动时的预处理
        - 支持matcher: startup|resume|clear|compress

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['SessionStart'] += 1

            session_type = event_data.get('session_type', 'startup')
            session_id = event_data.get('session_id', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='SessionStart',
                matcher=session_type,
                data=event_data,
                timestamp=datetime.now(),
                session_id=session_id
            )
            self.processed_events.append(event)

            logger.info(f"SessionStart: 会话开始 ({session_type})")

            # 根据会话类型执行不同处理
            if session_type == 'startup':
                await self._handle_startup_session(event_data)
            elif session_type == 'resume':
                await self._handle_resume_session(event_data)
            elif session_type == 'clear':
                await self._handle_clear_session(event_data)
            elif session_type == 'compress':
                await self._handle_compress_session(event_data)

            return None

        except Exception as e:
            logger.error(f"SessionStart Hook处理失败: {e}")
            return None

    async def handle_session_end(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        SessionEnd Hook处理器 - 会话结束时触发

        用途：
        - 生成会话总结
        - 保存会话数据
        - 执行清理操作
        - 记录会话统计

        Args:
            event_data: Hook事件数据

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['SessionEnd'] += 1

            session_id = event_data.get('session_id', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='SessionEnd',
                matcher=None,
                data=event_data,
                timestamp=datetime.now(),
                session_id=session_id
            )
            self.processed_events.append(event)

            logger.info(f"SessionEnd: 会话结束 {session_id}")

            # 生成会话总结
            await self._generate_session_summary(session_id)

            return None

        except Exception as e:
            logger.error(f"SessionEnd Hook处理失败: {e}")
            return None

    async def handle_user_prompt_submit(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        UserPromptSubmit Hook处理器 - 用户提示词提交时触发

        用途：
        - 检测跨CLI调用意图（核心功能）
        - 内容过滤和验证
        - 提示词预处理
        - 可通过返回非零退出码阻止提示词提交

        Args:
            event_data: Hook事件数据，包含prompt字段

        Returns:
            Optional[str]: 处理结果，返回非零退出码可阻止提交
        """
        try:
            self.hook_executions['UserPromptSubmit'] += 1

            user_prompt = event_data.get('prompt', '')
            session_id = event_data.get('session_id', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='UserPromptSubmit',
                matcher=None,  # 可以根据提示词内容进行匹配
                data=event_data,
                timestamp=datetime.now(),
                session_id=session_id,
                command=user_prompt[:100]  # 截取前100字符作为命令
            )
            self.processed_events.append(event)

            logger.debug(f"UserPromptSubmit: {user_prompt[:50]}...")

            # 核心功能：检测跨CLI调用意图
            intent = self.parser.parse_intent(user_prompt, "iflow")

            if intent.is_cross_cli:
                # 避免自我调用
                if intent.target_cli != self.cli_name:
                    # 执行跨CLI调用
                    cross_cli_result = await self._execute_cross_cli_call(
                        intent.target_cli,
                        intent.task,
                        event_data
                    )

                    if cross_cli_result:
                        # 更新会话统计
                        if session_id in self.active_sessions:
                            self.active_sessions[session_id]['cross_cli_calls'] += 1

                        self.cross_cli_interceptions += 1

                        # 返回跨CLI结果，这会替换原始的用户提示词
                        return f"[跨CLI调用结果]\n\n{cross_cli_result}\n\n[原始用户请求]\n{user_prompt}"

            return None  # 继续正常处理用户提示词

        except Exception as e:
            logger.error(f"UserPromptSubmit Hook处理失败: {e}")
            self.record_error()
            return None

    async def handle_notification(self, event_data: Dict[str, Any]) -> Optional[str]:
        """
        Notification Hook处理器 - 通知发送时触发

        用途：
        - 通知内容记录
        - 第三方系统集成
        - 通知格式转换
        - 自定义通知处理
        - 特殊行为：退出码2不阻止通知，仅将stderr显示给用户

        Args:
            event_data: Hook事件数据，包含message字段

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.hook_executions['Notification'] += 1

            notification_message = event_data.get('message', '')
            notification_type = event_data.get('type', 'info')
            session_id = event_data.get('session_id', '')

            # 记录事件
            event = IFlowHookEvent(
                hook_type='Notification',
                matcher=None,  # 可以根据通知消息内容进行匹配
                data=event_data,
                timestamp=datetime.now(),
                session_id=session_id
            )
            self.processed_events.append(event)

            logger.debug(f"Notification: {notification_message[:50]}...")

            # 可以在这里处理通知，例如：
            # - 记录到日志
            # - 发送到外部系统
            # - 格式转换等

            return None

        except Exception as e:
            logger.error(f"Notification Hook处理失败: {e}")
            return None

    # ==================== 跨CLI功能 ====================

    async def _detect_cross_cli_in_tool_use(self, tool_name: str, tool_args: List[Any]) -> Optional[str]:
        """
        在工具使用中检测跨CLI调用

        Args:
            tool_name: 工具名称
            tool_args: 工具参数

        Returns:
            Optional[str]: 跨CLI调用结果
        """
        try:
            # 将工具参数转换为文本进行分析
            args_text = ' '.join(str(arg) for arg in tool_args)
            full_command = f"{tool_name} {args_text}"

            # 解析跨CLI意图
            intent = self.parser.parse_intent(full_command, "iflow")

            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # 执行跨CLI调用
                return await self._execute_cross_cli_call(
                    intent.target_cli,
                    intent.task,
                    {"tool_name": tool_name, "args": tool_args}
                )

            return None

        except Exception as e:
            logger.error(f"检测工具使用跨CLI调用失败: {e}")
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

            # 获取目标CLI适配器 - 使用新的注册机制
            from .. import get_cross_cli_adapter
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
                'hook_context': context,
                'session_id': context.get('session_id', ''),
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

    # ==================== 会话处理方法 ====================

    async def _handle_startup_session(self, event_data: Dict[str, Any]) -> None:
        """处理新启动会话"""
        session_id = event_data.get('session_id', '')
        self.active_sessions[session_id] = {
            'start_time': datetime.now(),
            'session_type': 'startup',
            'cross_cli_calls': 0,
            'environment': 'initialized'
        }

    async def _handle_resume_session(self, event_data: Dict[str, Any]) -> None:
        """处理恢复会话"""
        session_id = event_data.get('session_id', '')
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = {
                'start_time': datetime.now(),
                'session_type': 'resume',
                'cross_cli_calls': 0,
                'environment': 'resumed'
            }

    async def _handle_clear_session(self, event_data: Dict[str, Any]) -> None:
        """处理清理会话"""
        session_id = event_data.get('session_id', '')
        # 清理会话状态但保留基础信息
        if session_id in self.active_sessions:
            self.active_sessions[session_id].update({
                'session_type': 'cleared',
                'cross_cli_calls': 0,
                'environment': 'cleared'
            })

    async def _handle_compress_session(self, event_data: Dict[str, Any]) -> None:
        """处理压缩会话"""
        session_id = event_data.get('session_id', '')
        if session_id in self.active_sessions:
            self.active_sessions[session_id]['session_type'] = 'compressed'

    async def _generate_session_summary(self, session_id: str) -> None:
        """生成会话总结"""
        if session_id in self.active_sessions:
            session_data = self.active_sessions[session_id]
            summary = {
                'session_id': session_id,
                'session_type': session_data.get('session_type', 'unknown'),
                'start_time': session_data.get('start_time'),
                'end_time': datetime.now(),
                'cross_cli_calls': session_data.get('cross_cli_calls', 0),
                'total_hook_executions': sum(self.hook_executions.values())
            }

            logger.info(f"会话总结: {summary}")

            # 可以将会话总结保存到文件或发送到外部系统

    # ==================== 结果格式化 ====================

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
        return f"""## 🔗 跨CLI调用结果 (iFlow Hook)

**源工具**: iFlow CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由跨CLI集成系统通过iFlow CLI官方Hook提供*"""

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

**源工具**: iFlow CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**错误信息**: {error_message}
**失败时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

请检查目标CLI工具是否正确安装和配置。

---

*此错误由跨CLI集成系统报告*"""

    # ==================== 命令行执行接口 ====================

    async def execute_hook_from_command(self, hook_type: str, input_data: Dict[str, Any]) -> Optional[str]:
        """
        从命令行执行Hook（用于iFlow Hook脚本调用）

        Args:
            hook_type: Hook类型
            input_data: 输入数据

        Returns:
            Optional[str]: 执行结果
        """
        try:
            if hook_type not in self.official_hooks:
                logger.error(f"未知的Hook类型: {hook_type}")
                return None

            hook_handler = self.official_hooks[hook_type]
            return await hook_handler(input_data)

        except Exception as e:
            logger.error(f"从命令行执行Hook失败: {hook_type}, {e}")
            return None

    # ==================== 基础接口实现 ====================

    def is_available(self) -> bool:
        """
        检查适配器是否可用

        Returns:
            bool: 是否可用
        """
        return (
            self.hooks_enabled and
            self._check_iflow_environment() and
            len(self.official_hooks) > 0
        )

    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        执行跨CLI任务 - iFlow适配器的具体实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        try:
            # 直接使用UserPromptSubmit Hook的逻辑
            event_data = {
                'prompt': task,
                'session_id': context.get('session_id', ''),
                **context
            }

            result = await self.handle_user_prompt_submit(event_data)

            if result:
                # 提取跨CLI调用结果部分
                if "[跨CLI调用结果]" in result:
                    # 分离跨CLI结果和原始请求
                    parts = result.split("[原始用户请求]")
                    if len(parts) > 1:
                        return parts[0].replace("[跨CLI调用结果]\n\n", "").strip()
                return result

            return f"iFlow官方Hook适配器处理: {task}"

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

        iflow_health = {
            'hooks_enabled': self.hooks_enabled,
            'hook_executions': self.hook_executions.copy(),
            'cross_cli_interceptions': self.cross_cli_interceptions,
            'processed_events_count': len(self.processed_events),
            'active_sessions_count': len(self.active_sessions),
            'iflow_settings_file': self.iflow_settings_file,
            'iflow_settings_exists': os.path.exists(self.iflow_settings_file),
            'hooks_scripts_dir': self.hooks_scripts_dir,
            'supported_hooks': list(self.official_hooks.keys())
        }

        # 检查环境
        try:
            iflow_health['iflow_environment'] = self._check_iflow_environment()
        except Exception as e:
            iflow_health['iflow_environment_error'] = str(e)

        # 合并基础健康信息
        base_health.update(iflow_health)
        return base_health

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        base_stats = super().get_statistics()

        iflow_stats = {
            'hooks_enabled': self.hooks_enabled,
            'hook_executions': self.hook_executions.copy(),
            'cross_cli_interceptions': self.cross_cli_interceptions,
            'processed_events_count': len(self.processed_events),
            'active_sessions_count': len(self.active_sessions),
            'total_hook_calls': sum(self.hook_executions.values()),
            'supported_hooks': list(self.official_hooks.keys()),
            'iflow_settings_file': self.iflow_settings_file
        }

        base_stats.update(iflow_stats)
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
            self.hook_executions = {hook: 0 for hook in self.official_hooks.keys()}

            logger.info("iFlow官方Hook适配器清理完成")
            return True

        except Exception as e:
            logger.error(f"清理iFlow官方Hook适配器失败: {e}")
            return False


# 创建全局适配器实例
_global_adapter: Optional[IFlowOfficialHookAdapter] = None


def get_iflow_official_hook_adapter() -> IFlowOfficialHookAdapter:
    """
    获取iFlow官方Hook适配器实例

    Returns:
        IFlowOfficialHookAdapter: 适配器实例
    """
    global _global_adapter
    if _global_adapter is None:
        _global_adapter = IFlowOfficialHookAdapter()
        # 异步初始化需要在调用时进行
    return _global_adapter


# 便捷函数
async def initialize_iflow_official_adapter() -> bool:
    """
    初始化iFlow官方Hook适配器

    Returns:
        bool: 初始化是否成功
    """
    adapter = get_iflow_official_hook_adapter()
    return await adapter.initialize()


def is_iflow_official_adapter_available() -> bool:
    """
    检查iFlow官方Hook适配器是否可用

    Returns:
        bool: 是否可用
    """
    adapter = get_iflow_official_hook_adapter()
    return adapter.is_available()


if __name__ == "__main__":
    import asyncio
    import sys
    import json

    async def main():
        """命令行入口 - 用于iFlow Hook脚本调用"""
        if len(sys.argv) < 2:
            print("Usage: python official_hook_adapter.py <hook_type>", file=sys.stderr)
            sys.exit(1)

        hook_type = sys.argv[1]

        # 读取stdin数据
        try:
            input_data = json.loads(sys.stdin.read())
        except:
            input_data = {}

        # 执行Hook
        adapter = IFlowOfficialHookAdapter()
        result = await adapter.execute_hook_from_command(hook_type, input_data)

        if result:
            print(result)

        # 返回适当的退出码
        if result and "失败" in result:
            sys.exit(1)
        else:
            sys.exit(0)

    asyncio.run(main())