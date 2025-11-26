#!/usr/bin/env python3
"""
AI CLI Router 部署脚本
一键部署到各个AI CLI工具
"""
import os
import sys
import json
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from src.core.models import CLI_CONFIG_MAPPING
from src.core.ai_environment_scanner import AIEnvironmentScanner


class AICLIRouterDeployer:
    """AI CLI Router 部署器"""

    def __init__(self):
        self.deploy_dir = Path(__file__).parent
        self.home_dir = Path.home()

    async def deploy_all(self, force: bool = False) -> Dict[str, bool]:
        """部署到所有可用的CLI工具"""
        print("🚀 开始部署 AI CLI Router...")

        # 扫描可用的CLI工具
        scanner = AIEnvironmentScanner()
        ai_environment = await scanner.scan_ai_environment(str(Path.cwd()))

        if not ai_environment.available_clis:
            print("❌ 未发现任何可用的AI CLI工具")
            return {}

        print(f"📊 发现 {len(ai_environment.available_clis)} 个可用的AI CLI工具:")
        for tool_name, tool_info in ai_environment.available_clis.items():
            status_icon = "✅" if tool_info.status.value == "available" else "❌"
            print(f"   {status_icon} {tool_info.display_name} v{tool_info.version}")

        # 部署到各个CLI工具
        deployment_results = {}
        for tool_name in ai_environment.available_clis:
            result = await self._deploy_to_cli(tool_name, force)
            deployment_results[tool_name] = result

        # 显示部署结果
        successful = sum(1 for result in deployment_results.values() if result)
        total = len(deployment_results)

        print(f"\n📋 部署完成: {successful}/{total} 个工具部署成功")

        if successful == total:
            print("🎉 所有AI CLI工具都已成功集成 AI CLI Router!")
        else:
            failed_tools = [tool for tool, success in deployment_results.items() if not success]
            print(f"⚠️ 部署失败的工具: {', '.join(failed_tools)}")

        return deployment_results

    async def _deploy_to_cli(self, cli_name: str, force: bool = False) -> bool:
        """部署到单个CLI工具"""
        try:
            print(f"\n🔧 正在部署到 {cli_name.upper()} CLI...")

            # 根据CLI类型进行不同的部署
            if cli_name == "claude":
                success = await self._deploy_to_claude(force)
            elif cli_name == "gemini":
                success = await self._deploy_to_gemini(force)
            elif cli_name == "qwen":
                success = await self._deploy_to_qwen(force)
            elif cli_name == "iflow":
                success = await self._deploy_to_iflow(force)
            elif cli_name == "qoder":
                success = await self._deploy_to_qoder(force)
            elif cli_name == "codebuddy":
                success = await self._deploy_to_codebuddy(force)
            elif cli_name == "copilot":
                success = await self._deploy_to_copilot(force)
            elif cli_name == "codex":
                success = await self._deploy_to_codex(force)
            else:
                print(f"⚠️ 不支持的CLI工具: {cli_name}")
                success = False

            if success:
                print(f"   ✅ {cli_name.upper()} CLI 部署成功")
            else:
                print(f"   ❌ {cli_name.upper()} CLI 部署失败")

            return success

        except Exception as e:
            print(f"   ❌ {cli_name.upper()} CLI 部署出错: {e}")
            return False

    async def _deploy_to_claude(self, force: bool) -> bool:
        """部署到Claude CLI"""
        try:
            claude_config_dir = self.home_dir / ".config" / "claude"
            claude_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建hooks.json配置
            hooks_file = claude_config_dir / "hooks.json"
            hooks_config = {
                "version": "1.0",
                "hooks": {
                    "user_prompt_submit": {
                        "enabled": True,
                        "script": "python -c \"import sys; sys.path.insert(0, '{}'); from src.core.cli_hook_integration import ClaudeHookIntegration; import asyncio; result = asyncio.run(ClaudeHookIntegration.on_user_prompt_submit({{'prompt': '$PROMPT'}})); print(result) if result else None\"".format(self.deploy_dir),
                        "timeout": 30
                    }
                }
            }

            if not hooks_file.exists() or force:
                with open(hooks_file, 'w', encoding='utf-8') as f:
                    json.dump(hooks_config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建Claude钩子配置: {hooks_file}")

            return True

        except Exception as e:
            print(f"   ❌ Claude CLI部署失败: {e}")
            return False

    async def _deploy_to_gemini(self, force: bool) -> bool:
        """部署到Gemini CLI"""
        try:
            gemini_config_dir = self.home_dir / ".config" / "gemini"
            gemini_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建extensions.json配置
            extensions_file = gemini_config_dir / "extensions.json"
            extensions_config = {
                "version": "1.0",
                "extensions": {
                    "ai_cli_router": {
                        "name": "AI CLI Router",
                        "version": "1.0.0",
                        "enabled": True,
                        "script": "python -c \"import sys; sys.path.insert(0, '{}'); from src.core.cli_hook_integration import GeminiExtensionIntegration; import asyncio; result = asyncio.run(GeminiExtensionIntegration.on_prompt_submit({{'prompt': '$PROMPT'}})); print(result) if result else None\"".format(self.deploy_dir),
                        "hooks": ["on_prompt_submit"]
                    }
                }
            }

            if not extensions_file.exists() or force:
                with open(extensions_file, 'w', encoding='utf-8') as f:
                    json.dump(extensions_config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建Gemini扩展配置: {extensions_file}")

            return True

        except Exception as e:
            print(f"   ❌ Gemini CLI部署失败: {e}")
            return False

    async def _deploy_to_qwen(self, force: bool) -> bool:
        """部署到QwenCode CLI"""
        try:
            qwen_config_dir = self.home_dir / ".config" / "qwencode"
            qwen_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建插件配置
            plugins_file = qwen_config_dir / "plugins.json"
            plugins_config = {
                "version": "1.0",
                "plugins": {
                    "ai_cli_router": {
                        "name": "AI CLI Router",
                        "version": "1.0.0",
                        "enabled": True,
                        "class": "AIChangePlugin",
                        "file": str(self.deploy_dir / "src" / "core" / "cli_hook_integration.py"),
                        "hooks": ["on_prompt_received"]
                    }
                }
            }

            if not plugins_file.exists() or force:
                with open(plugins_file, 'w', encoding='utf-8') as f:
                    json.dump(plugins_config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建QwenCode插件配置: {plugins_file}")

            return True

        except Exception as e:
            print(f"   ❌ QwenCode CLI部署失败: {e}")
            return False

    async def _deploy_to_iflow(self, force: bool) -> bool:
        """部署到iFlow CLI"""
        try:
            iflow_config_dir = self.home_dir / ".config" / "iflow"
            iflow_config_dir.mkdir(parents=True, exist_ok=True):

                # 创建hooks.yml配置
                hooks_file = iflow_config_dir / "hooks.yml"
                hooks_config = f"""
# iFlow CLI Hooks配置 - AI CLI Router集成
version: "1.0"

hooks:
  UserPromptSubmit:
    - name: "ai_cli_router_init"
      enabled: true
      script: "python -c \"import sys; sys.path.insert(0, '{self.deploy_dir}'); from src.core.cli_hook_integration import IFlowWorkflowIntegration; import asyncio; result = asyncio.run(IFlowWorkflowIntegration.on_user_prompt_submit({{'prompt': '$PROMPT'}})); print(result) if result else None\""
      timeout: 30
      pattern: ".*init.*"
"""

                if not hooks_file.exists() or force:
                    with open(hooks_file, 'w', encoding='utf-8') as f:
                        f.write(hooks_config)
                    print(f"   📝 创建iFlow钩子配置: {hooks_file}")

            return True

        except Exception as e:
            print(f"   ❌ iFlow CLI部署失败: {e}")
            return False

    async def _deploy_to_qoder(self, force: bool) -> bool:
        """部署到Qoder CLI"""
        try:
            qoder_config_dir = self.home_dir / ".qoder"
            qoder_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建notification_config.json
            config_file = qoder_config_dir / "notification_config.json"
            config = {
                "version": "1.0",
                "notifications": {
                    "command_execution": {
                        "enabled": True,
                        "script": "python -c \"import sys; sys.path.insert(0, '{}'); from src.core.cli_hook_integration import QoderNotificationIntegration; import asyncio; result = asyncio.run(QoderNotificationIntegration.on_command_execution({{'command': '$COMMAND'}})); print(result) if result else None\"".format(self.deploy_dir),
                        "pattern": ".*init.*"
                    }
                }
            }

            if not config_file.exists() or force:
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建Qoder通知配置: {config_file}")

            return True

        except Exception as e:
            print(f"   ❌ Qoder CLI部署失败: {e}")
            return False

    async def _deploy_to_codebuddy(self, force: bool) -> bool:
        """部署到CodeBuddy CLI"""
        try:
            codebuddy_config_dir = self.home_dir / ".codebuddy"
            codebuddy_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建skills_config.json
            config_file = codebuddy_config_dir / "skills_config.json"
            config = {
                "version": "1.0",
                "skills": {
                    "ai_cli_router": {
                        "name": "AI CLI Router",
                        "enabled": True,
                        "script": "python -c \"import sys; sys.path.insert(0, '{}'); from src.core.cli_hook_integration import CodeBuddySkillsIntegration; import asyncio; result = asyncio.run(CodeBuddySkillsIntegration.on_user_command({{'command': '$COMMAND'}})); print(result) if result else None\"".format(self.deploy_dir),
                        "triggers": ["init", "/init"]
                    }
                }
            }

            if not config_file.exists() or force:
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建CodeBuddy技能配置: {config_file}")

            return True

        except Exception as e:
            print(f"   ❌ CodeBuddy CLI部署失败: {e}")
            return False

    async def _deploy_to_copilot(self, force: bool) -> bool:
        """部署到Copilot CLI"""
        try:
            copilot_config_dir = self.home_dir / ".copilot"
            copilot_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建mcp_config.json
            config_file = copilot_config_dir / "mcp_config.json"
            config = {
                "version": "1.0",
                "mcp_servers": {
                    "ai_cli_router": {
                        "name": "AI CLI Router",
                        "command": "python",
                        "args": ["-c", f"import sys; sys.path.insert(0, '{self.deploy_dir}'); from src.core.cli_hook_integration import CopilotMCPIntegration; import asyncio; asyncio.run(CopilotMCPIntegration.serve())"],
                        "enabled": True
                    }
                }
            }

            if not config_file.exists() or force:
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建Copilot MCP配置: {config_file}")

            return True

        except Exception as e:
            print(f"   ❌ Copilot CLI部署失败: {e}")
            return False

    async def _deploy_to_codex(self, force: bool) -> bool:
        """部署到Codex CLI"""
        try:
            codex_config_dir = self.home_dir / ".config" / "codex"
            codex_config_dir.mkdir(parents=True, exist_ok=True)

            # 创建slash_commands.json
            config_file = codex_config_dir / "slash_commands.json"
            config = {
                "version": "1.0",
                "commands": {
                    "init": {
                        "name": "AI CLI Router 初始化",
                        "description": "初始化AI协作环境",
                        "script": "python -c \"import sys; sys.path.insert(0, '{}'); from src.core.cli_hook_integration import CodexSlashIntegration; import asyncio; result = asyncio.run(CodexSlashIntegration.on_slash_command({{'command': 'init', 'args': []}})); print(result) if result else None\"".format(self.deploy_dir),
                        "enabled": True
                    }
                }
            }

            if not config_file.exists() or force:
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(config, f, indent=2, ensure_ascii=False)
                print(f"   📝 创建Codex斜杠命令配置: {config_file}")

            return True

        except Exception as e:
            print(f"   ❌ Codex CLI部署失败: {e}")
            return False

    def status(self) -> Dict[str, Dict[str, str]]:
        """检查部署状态"""
        print("🔍 检查AI CLI Router部署状态...")

        status = {}

        for cli_name, config_mapping in CLI_CONFIG_MAPPING.items():
            config_file = Path(config_mapping.config_file.expanduser())
            cli_status = {
                "config_file": str(config_file),
                "exists": config_file.exists(),
                "status": "❌ 配置缺失"
            }

            if config_file.exists():
                cli_status["status"] = "✅ 已部署"
                try:
                    with open(config_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if "ai_cli_router" in content:
                            cli_status["status"] = "🎉 完全集成"
                        else:
                            cli_status["status"] = "⚠️ 部分集成"
                except Exception as e:
                    cli_status["status"] = f"❌ 读取失败: {e}"

            status[cli_name] = cli_status

        # 显示状态
        for cli_name, cli_status in status.items():
            print(f"   {cli_status['status']} {cli_name.upper()}: {cli_status['config_file']}")

        return status

    def clean(self):
        """清理部署"""
        print("🧹 清理AI CLI Router部署...")

        cleaned = []
        for cli_name, config_mapping in CLI_CONFIG_MAPPING.items():
            config_file = Path(config_mapping.config_file.expanduser())
            if config_file.exists():
                try:
                    # 备份原文件
                    backup_file = config_file.with_suffix('.json.backup')
                    if not backup_file.exists():
                        config_file.rename(backup_file)
                    print(f"   📦 备份配置文件: {config_file} -> {backup_file}")
                    cleaned.append(cli_name)
                except Exception as e:
                    print(f"   ❌ 清理 {cli_name} 失败: {e}")

        print(f"✅ 清理完成，备份了 {len(cleaned)} 个配置文件")


async def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="AI CLI Router 部署工具")
    parser.add_argument("command", choices=["deploy", "status", "clean"], help="执行的命令")
    parser.add_argument("--force", "-f", action="store_true", help="强制覆盖现有配置")

    args = parser.parse_args()

    deployer = AICLIRouterDeployer()

    if args.command == "deploy":
        results = await deployer.deploy_all(args.force)
        successful = sum(1 for success in results.values() if success)
        if successful == 0:
            sys.exit(1)
    elif args.command == "status":
        deployer.status()
    elif args.command == "clean":
        deployer.clean()


if __name__ == "__main__":
    asyncio.run(main())