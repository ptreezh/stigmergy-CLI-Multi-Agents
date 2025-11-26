"""
CLI Hook Integration - CLI工具钩子集成模块
将增强的 /init 指令集成到各个CLI工具的钩子系统
"""
import os
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any
import logging

from .enhanced_init_processor import EnhancedInitProcessor

logger = logging.getLogger(__name__)


class CLIHookIntegration:
    """CLI工具钩子集成 - 统一处理各CLI工具的钩子集成"""

    def __init__(self):
        self.processors = {}  # 缓存不同CLI的处理器实例

    async def handle_init_command(self, current_cli: str, project_path: str = None) -> str:
        """统一处理 /init 斜杠指令"""
        try:
            logger.info(f"处理 {current_cli} 的 /init 指令")

            # 获取项目路径
            if not project_path:
                project_path = os.getcwd()

            # 获取或创建处理器实例
            processor = self._get_processor(current_cli)

            # 处理初始化命令
            result = await processor.process_init_command(project_path)

            # 生成用户友好的响应消息
            response_message = self._generate_response_message(result, current_cli)

            return response_message

        except Exception as e:
            logger.error(f"处理 /init 指令失败: {e}")
            return f"❌ 处理失败: {str(e)}"

    def _get_processor(self, current_cli: str) -> EnhancedInitProcessor:
        """获取或创建处理器实例"""
        if current_cli not in self.processors:
            self.processors[current_cli] = EnhancedInitProcessor(current_cli)
        return self.processors[current_cli]

    def _generate_response_message(self, result, current_cli: str) -> str:
        """生成用户友好的响应消息"""
        try:
            if not result.ai_environment:
                return result.message

            env = result.ai_environment
            available_tools = len(env.available_clis)

            base_message = f"""
🎯 **AI CLI Router - 项目初始化完成**

📊 **项目状态**: {result.project_type}
🤖 **可用AI工具**: {available_tools} 个
⏱️ **处理时间**: {result.processing_time:.2f} 秒

**详细结果**:
{result.message}
"""

            # 添加工具状态信息
            if result.project_type == "existing_project":
                enhanced_count = len(result.enhanced_documents)
                base_message += f"""
📝 **增强的文档**: {enhanced_count} 个
"""
                if enhanced_count > 0:
                    base_message += "\n✅ 以下文档已添加协作感知:\n"
                    for doc_name in result.enhanced_documents.keys():
                        base_message += f"   - `{doc_name}.md`\n"

            else:  # new_project
                generated_count = len(result.generated_documents)
                base_message += f"""
🆕 **生成的文档**: {generated_count} 个
"""
                if generated_count > 0:
                    base_message += "\n📄 以下文档已生成:\n"
                    for doc_name in result.generated_documents.keys():
                        base_message += f"   - `{doc_name}.md`\n"

            # 添加可用工具列表
            base_message += f"""
🔧 **可用AI工具**:
"""
            for tool_name, tool_info in env.available_clis.items():
                status_icon = "✅" if tool_info.status.value == "available" else "❌"
                base_message += f"   {status_icon} **{tool_info.display_name}** v{tool_info.version}\n"

            # 添加快速开始指南
            base_message += f"""
🚀 **快速开始**:

现在您可以使用跨AI工具协作指令:

**中文示例**:
- `请用{self._get_other_tool(env.available_clis, current_cli)}帮我生成代码`
- `调用{self._get_other_tool(env.available_clis, current_cli)}分析性能问题`
- `用{self._get_other_tool(env.available_clis, current_cli)}审查代码质量`

**英文示例**:
- `use {self._get_other_tool(env.available_clis, current_cli)} to generate tests`
- `call {self._get_other_tool(env.available_clis, current_cli)} for code review`
- `ask {self._get_other_tool(env.available_clis, current_cli)} to optimize performance`

💡 **提示**:
- 查看生成的 `.md` 文件获取详细的协作指南
- 使用 `/init` 命令重新扫描AI环境
- 项目配置保存在 `.ai-cli-project/` 目录中

🔗 **相关命令**:
- `ai-cli-router status` - 查看所有工具状态
- `ai-cli-router scan` - 重新扫描AI环境
"""

            return base_message

        except Exception as e:
            logger.error(f"生成响应消息失败: {e}")
            return result.message

    def _get_other_tool(self, available_clis: Dict[str, Any], current_cli: str) -> str:
        """获取另一个可用的工具名称"""
        for tool_name in available_clis.keys():
            if tool_name != current_cli:
                return tool_name
        return "其他工具"


# 各CLI工具的具体钩子集成实现

class ClaudeHookIntegration:
    """Claude CLI 钩子集成"""

    @staticmethod
    async def on_user_prompt_submit(context: Dict[str, Any]) -> Optional[str]:
        """处理用户提示词提交钩子"""
        try:
            user_input = context.get("prompt", "").strip()

            # 检测 /init 指令
            if user_input == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("claude")

            # 检测其他相关指令（可以扩展）
            elif user_input.startswith("/ai-cli"):
                # 处理其他AI CLI Router指令
                return await ClaudeHookIntegration._handle_ai_cli_commands(user_input)

            return None

        except Exception as e:
            logger.error(f"Claude钩子处理失败: {e}")
            return None

    @staticmethod
    async def _handle_ai_cli_commands(command: str) -> str:
        """处理AI CLI Router相关命令"""
        try:
            parts = command.split()
            if len(parts) < 2:
                return "❌ 无效的AI CLI Router命令"

            sub_command = parts[1]
            hook_integration = CLIHookIntegration()

            if sub_command == "status":
                # 检查状态
                return await hook_integration.handle_init_command("claude")
            elif sub_command == "scan":
                # 重新扫描
                return await hook_integration.handle_init_command("claude")
            else:
                return f"❌ 未知命令: {sub_command}"

        except Exception as e:
            return f"❌ 命令执行失败: {str(e)}"


class GeminiExtensionIntegration:
    """Gemini CLI 扩展集成"""

    @staticmethod
    async def on_prompt_submit(context: Dict[str, Any]) -> Optional[str]:
        """处理提示词提交扩展"""
        try:
            prompt = context.get("prompt", "").strip()

            if prompt == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("gemini")

            return None

        except Exception as e:
            logger.error(f"Gemini扩展处理失败: {e}")
            return None


class QwenCodeInheritanceIntegration:
    """QwenCode CLI 继承集成"""

    @staticmethod
    async def on_prompt_received(context: Dict[str, Any]) -> Optional[str]:
        """处理提示词接收"""
        try:
            prompt = context.get("prompt", "").strip()

            if prompt == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("qwen")

            return None

        except Exception as e:
            logger.error(f"QwenCode继承处理失败: {e}")
            return None


class IFlowWorkflowIntegration:
    """iFlow CLI 工作流集成"""

    @staticmethod
    async def on_workflow_start(context: Dict[str, Any]) -> Optional[str]:
        """处理工作流开始"""
        try:
            workflow_config = context.get("workflow_config", {})
            command = workflow_config.get("command", "").strip()

            if command == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("iflow")

            return None

        except Exception as e:
            logger.error(f"iFlow工作流处理失败: {e}")
            return None

    @staticmethod
    async def on_user_prompt_submit(context: Dict[str, Any]) -> Optional[str]:
        """处理用户提示词提交（备用）"""
        try:
            user_input = context.get("prompt", "").strip()

            if user_input == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("iflow")

            return None

        except Exception as e:
            logger.error(f"iFlow钩子处理失败: {e}")
            return None


class QoderNotificationIntegration:
    """Qoder CLI 通知集成"""

    @staticmethod
    async def on_command_execution(context: Dict[str, Any]) -> Optional[str]:
        """处理命令执行"""
        try:
            command = context.get("command", "").strip()

            if command == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("qoder")

            return None

        except Exception as e:
            logger.error(f"Qoder通知处理失败: {e}")
            return None


class CodeBuddySkillsIntegration:
    """CodeBuddy CLI 技能集成"""

    @staticmethod
    async def on_skill_activation(context: Dict[str, Any]) -> Optional[str]:
        """处理技能激活"""
        try:
            skill_name = context.get("skill_name", "")

            if skill_name == "ai_cli_init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("codebuddy")

            return None

        except Exception as e:
            logger.error(f"CodeBuddy技能处理失败: {e}")
            return None

    @staticmethod
    async def on_user_command(context: Dict[str, Any]) -> Optional[str]:
        """处理用户命令（备用）"""
        try:
            command = context.get("command", "").strip()

            if command == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("codebuddy")

            return None

        except Exception as e:
            logger.error(f"CodeBuddy命令处理失败: {e}")
            return None


class CopilotMCPIntegration:
    """Copilot CLI MCP集成"""

    @staticmethod
    async def on_agent_execution(context: Dict[str, Any]) -> Optional[str]:
        """处理代理执行"""
        try:
            agent_request = context.get("request", "")

            if agent_request.strip() == "/init":
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("copilot")

            return None

        except Exception as e:
            logger.error(f"Copilot MCP处理失败: {e}")
            return None


class CodexSlashIntegration:
    """Codex CLI 斜杠命令集成"""

    @staticmethod
    async def on_slash_command(context: Dict[str, Any]) -> Optional[str]:
        """处理斜杠命令"""
        try:
            command = context.get("command", "")
            args = context.get("args", [])

            if command == "init" and not args:
                hook_integration = CLIHookIntegration()
                return await hook_integration.handle_init_command("codex")

            return None

        except Exception as e:
            logger.error(f"Codex斜杠命令处理失败: {e}")
            return None


# 集成映射表
CLI_INTEGRATIONS = {
    "claude": ClaudeHookIntegration,
    "gemini": GeminiExtensionIntegration,
    "qwen": QwenCodeInheritanceIntegration,
    "iflow": IFlowWorkflowIntegration,
    "qoder": QoderNotificationIntegration,
    "codebuddy": CodeBuddySkillsIntegration,
    "copilot": CopilotMCPIntegration,
    "codex": CodexSlashIntegration
}


def get_cli_integration(cli_name: str):
    """获取CLI工具的集成类"""
    return CLI_INTEGRATIONS.get(cli_name)


# 通用钩子处理器（用于适配器集成）
async def universal_init_handler(current_cli: str, context: Dict[str, Any]) -> Optional[str]:
    """通用的 /init 处理器，适用于所有CLI工具"""
    try:
        # 从上下文中提取用户输入
        user_input = ""

        # 尝试从不同的上下文字段中获取用户输入
        for field in ["prompt", "command", "request", "user_input"]:
            if field in context:
                user_input = str(context[field]).strip()
                break

        # 检查是否为 /init 指令
        if user_input == "/init":
            hook_integration = CLIHookIntegration()
            return await hook_integration.handle_init_command(current_cli, context.get("project_path"))

        return None

    except Exception as e:
        logger.error(f"通用 /init 处理器失败: {e}")
        return None