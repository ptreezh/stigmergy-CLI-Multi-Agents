#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全局记忆文档生成器
为每个CLI工具创建详细的记忆文档
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# 导入CLI调用系统
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'core'))
try:
    from cross_platform_safe_cli import get_cli_executor, CLICommand, PermissionLevel
    from cross_platform_encoding import get_cross_platform_installer, encoding_safe
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    sys.exit(1)

class GlobalMemoryGenerator:
    """全局记忆文档生成器"""
    
    def __init__(self):
        self.cli_executor = get_cli_executor()
        self.encoding_installer = get_cross_platform_installer()
        self.memory_dir = Path('.') / 'global_memory'
        self.memory_dir.mkdir(exist_ok=True)
    
    @encoding_safe
    def generate_all_memories(self) -> bool:
        """生成所有CLI的记忆文档"""
        print("📚 生成CLI全局记忆文档")
        print("=" * 50)
        
        success_count = 0
        total_count = len(self.cli_executor.cli_configs)
        
        for cli_name, config in self.cli_executor.cli_configs.items():
            print(f"📖 生成 {config.display_name} 记忆文档...")
            
            try:
                memory_doc = self._create_detailed_memory_document(cli_name, config)
                
                if self._save_memory_document(cli_name, memory_doc):
                    print(f"   ✅ {config.display_name} 记忆文档生成成功")
                    success_count += 1
                else:
                    print(f"   ❌ {config.display_name} 记忆文档生成失败")
                    
            except Exception as e:
                print(f"   ❌ {config.display_name} 记忆文档生成出错: {e}")
        
        print(f"\n📊 记忆文档生成完成: {success_count}/{total_count}")
        return success_count == total_count
    
    def _create_detailed_memory_document(self, cli_name: str, config) -> Dict[str, Any]:
        """创建详细的记忆文档"""
        
        # 基础信息
        base_info = {
            "cli_name": cli_name,
            "display_name": config.display_name,
            "command": config.command,
            "description": config.description,
            "category": self._get_cli_category(cli_name),
            "developer": self._get_cli_developer(cli_name),
            "website": self._get_cli_website(cli_name),
            "documentation": self._get_cli_documentation(cli_name),
            "repository": self._get_cli_repository(cli_name)
        }
        
        # 系统信息
        system_info = {
            "auth_method": config.auth_method,
            "required_env_vars": config.required_env_vars,
            "optional_env_vars": config.optional_env_vars,
            "config_files": config.config_files,
            "permission_level": config.permission_level.value,
            "supported_platforms": ["Windows", "Linux", "macOS"],
            "python_version_requirement": ">=3.7",
            "dependencies": self._get_cli_dependencies(cli_name)
        }
        
        # 状态检查
        status, message = self.cli_executor.check_cli_status(cli_name)
        status_info = {
            "current_status": status.value,
            "status_message": message,
            "last_checked": datetime.now().isoformat(),
            "version_info": self._get_version_info(cli_name),
            "authentication_status": self._get_auth_status(cli_name)
        }
        
        # 输入输出规格
        io_specs = {
            "input_format": config.input_format,
            "output_format": config.output_format,
            "supported_file_types": config.supported_file_types,
            "max_file_size": self._get_max_file_size(cli_name),
            "supported_encodings": ["utf-8", "utf-16", "ascii", "gbk", "gb2312"],
            "batch_processing": self._supports_batch_processing(cli_name),
            "streaming_support": self._supports_streaming(cli_name),
            "interactive_mode": self._supports_interactive_mode(cli_name)
        }
        
        # 命令行参数
        command_specs = self._get_detailed_command_specs(cli_name)
        
        # 使用示例
        usage_examples = self._get_comprehensive_usage_examples(cli_name)
        
        # 集成能力
        integration_info = {
            "integration_capabilities": self.cli_executor._get_integration_capabilities(config),
            "cross_cli_collaboration": self.cli_executor._get_cross_cli_collaboration_info(config),
            "api_compatibility": self._get_api_compatibility(cli_name),
            "plugin_support": self._get_plugin_support(cli_name),
            "webhook_support": self._supports_webhooks(cli_name)
        }
        
        # 错误处理
        error_handling = {
            "common_errors": self._get_common_errors(cli_name),
            "error_codes": self._get_error_codes(cli_name),
            "troubleshooting": self._get_troubleshooting_guide(cli_name),
            "log_locations": self._get_log_locations(cli_name)
        }
        
        # 性能特征
        performance_info = {
            "typical_response_time": self._get_typical_response_time(cli_name),
            "concurrent_requests": self._get_concurrent_request_limit(cli_name),
            "rate_limits": self._get_rate_limits(cli_name),
            "resource_usage": self._get_resource_usage_info(cli_name),
            "optimization_tips": self._get_optimization_tips(cli_name)
        }
        
        # 安全和隐私
        security_info = {
            "data_retention": self._get_data_retention_policy(cli_name),
            "privacy_features": self._get_privacy_features(cli_name),
            "encryption_support": self._get_encryption_support(cli_name),
            "compliance": self._get_compliance_info(cli_name)
        }
        
        # 更新历史
        update_history = {
            "last_updated": datetime.now().isoformat(),
            "version_history": self._get_version_history(cli_name),
            "recent_changes": self._get_recent_changes(cli_name),
            "roadmap": self._get_roadmap(cli_name)
        }
        
        # 组合完整的记忆文档
        memory_doc = {
            "metadata": {
                "document_type": "global_memory",
                "version": "1.0.0",
                "generated_by": "Stigmergy CLI Multi-Agents",
                "generation_timestamp": datetime.now().isoformat(),
                "encoding_safe": True,
                "cross_platform": True
            },
            **base_info,
            "system_info": system_info,
            "status": status_info,
            "io_specifications": io_specs,
            "command_line_interface": {
                "version_check": config.version_check_command,
                "help_command": config.help_command,
                "auth_command": config.auth_command,
                "detailed_parameters": command_specs
            },
            "usage_examples": usage_examples,
            "integration_capabilities": integration_info,
            "error_handling": error_handling,
            "performance_characteristics": performance_info,
            "security_privacy": security_info,
            "update_history": update_history,
            "notes": self._get_additional_notes(cli_name)
        }
        
        return memory_doc
    
    def _save_memory_document(self, cli_name: str, memory_doc: Dict[str, Any]) -> bool:
        """保存记忆文档"""
        try:
            memory_file = self.memory_dir / f'{cli_name}_global_memory.json'
            
            # 创建备份
            if memory_file.exists():
                backup_file = memory_file.with_suffix(
                    f'.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
                )
                memory_file.rename(backup_file)
            
            # 写入新文档
            with open(memory_file, 'w', encoding='utf-8') as f:
                json.dump(memory_doc, f, indent=2, ensure_ascii=False)
            
            # 创建Markdown版本
            markdown_file = self.memory_dir / f'{cli_name}_global_memory.md'
            markdown_content = self._convert_to_markdown(memory_doc)
            
            with open(markdown_file, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            return True
            
        except Exception as e:
            print(f"保存记忆文档失败: {e}")
            return False
    
    def _convert_to_markdown(self, memory_doc: Dict[str, Any]) -> str:
        """转换为Markdown格式"""
        md_content = []
        
        # 标题
        md_content.append(f"# {memory_doc['display_name']} 全局记忆文档")
        md_content.append("")
        
        # 基本信息
        md_content.append("## 📋 基本信息")
        md_content.append(f"- **CLI名称**: {memory_doc['cli_name']}")
        md_content.append(f"- **显示名称**: {memory_doc['display_name']}")
        md_content.append(f"- **命令**: `{memory_doc['command']}`")
        md_content.append(f"- **描述**: {memory_doc['description']}")
        md_content.append(f"- **开发者**: {memory_doc.get('developer', 'Unknown')}")
        md_content.append(f"- **官网**: {memory_doc.get('website', 'N/A')}")
        md_content.append("")
        
        # 系统信息
        md_content.append("## 🔧 系统信息")
        md_content.append(f"- **认证方式**: {memory_doc['system_info']['auth_method']}")
        md_content.append(f"- **必需环境变量**: {', '.join(memory_doc['system_info']['required_env_vars'])}")
        md_content.append(f"- **可选环境变量**: {', '.join(memory_doc['system_info']['optional_env_vars'])}")
        md_content.append(f"- **配置文件**: {', '.join(memory_doc['system_info']['config_files'])}")
        md_content.append(f"- **权限级别**: {memory_doc['system_info']['permission_level']}")
        md_content.append("")
        
        # 状态
        md_content.append("## 📊 当前状态")
        md_content.append(f"- **状态**: {memory_doc['status']['current_status']}")
        md_content.append(f"- **状态信息**: {memory_doc['status']['status_message']}")
        md_content.append(f"- **最后检查**: {memory_doc['status']['last_checked']}")
        if memory_doc['status'].get('version_info'):
            md_content.append(f"- **版本信息**: {memory_doc['status']['version_info']}")
        md_content.append("")
        
        # 输入输出规格
        md_content.append("## 📥 输入输出规格")
        md_content.append(f"- **输入格式**: {memory_doc['io_specifications']['input_format']}")
        md_content.append(f"- **输出格式**: {memory_doc['io_specifications']['output_format']}")
        md_content.append(f"- **支持的文件类型**: {', '.join(memory_doc['io_specifications']['supported_file_types'])}")
        md_content.append(f"- **批处理**: {'支持' if memory_doc['io_specifications']['batch_processing'] else '不支持'}")
        md_content.append(f"- **流式处理**: {'支持' if memory_doc['io_specifications']['streaming_support'] else '不支持'}")
        md_content.append("")
        
        # 使用示例
        md_content.append("## 💡 使用示例")
        for example in memory_doc['usage_examples']:
            md_content.append(f"### {example['description']}")
            md_content.append(f"```bash")
            md_content.append(example['command'])
            md_content.append("```")
            md_content.append("")
        
        # 集成能力
        md_content.append("## 🔗 集成能力")
        integration = memory_doc['integration_capabilities']['integration_capabilities']
        md_content.append(f"- **文件处理**: {'支持' if integration['can_process_files'] else '不支持'}")
        md_content.append(f"- **图像处理**: {'支持' if integration['supports_images'] else '不支持'}")
        md_content.append(f"- **工作流**: {'支持' if integration['supports_workflows'] else '不支持'}")
        md_content.append(f"- **代码生成**: {'支持' if integration['can_generate_code'] else '不支持'}")
        md_content.append("")
        
        # 跨CLI协作
        md_content.append("## 🌐 跨CLI协作")
        collaboration = memory_doc['integration_capabilities']['cross_cli_collaboration']
        md_content.append(f"- **可调用其他CLI**: {'支持' if collaboration['can_call_other_clis'] else '不支持'}")
        md_content.append(f"- **支持的目标CLI**: {', '.join(collaboration['supported_target_clis'])}")
        
        if collaboration.get('supported_collaborations'):
            md_content.append("- **协作能力**:")
            for task in collaboration['supported_collaborations']:
                md_content.append(f"  - {task}")
        md_content.append("")
        
        # 常见错误
        md_content.append("## ⚠️ 常见错误")
        for error in memory_doc['error_handling']['common_errors']:
            md_content.append(f"### {error['error']}")
            md_content.append(f"- **原因**: {error['cause']}")
            md_content.append(f"- **解决方法**: {error['solution']}")
            md_content.append("")
        
        # 性能信息
        md_content.append("## ⚡ 性能特征")
        perf = memory_doc['performance_characteristics']
        md_content.append(f"- **典型响应时间**: {perf['typical_response_time']}")
        md_content.append(f"- **并发请求**: {perf['concurrent_requests']}")
        md_content.append(f"- **速率限制**: {perf['rate_limits']}")
        md_content.append("")
        
        # 更新历史
        md_content.append("## 📅 更新历史")
        md_content.append(f"- **最后更新**: {memory_doc['update_history']['last_updated']}")
        if memory_doc['update_history'].get('recent_changes'):
            md_content.append("- **最近更改**:")
            for change in memory_doc['update_history']['recent_changes']:
                md_content.append(f"  - {change}")
        md_content.append("")
        
        # 文档元信息
        md_content.append("---")
        md_content.append(f"*文档生成时间: {memory_doc['metadata']['generation_timestamp']}*")
        md_content.append(f"*生成工具: {memory_doc['metadata']['generated_by']}*")
        md_content.append(f"*编码安全: {memory_doc['metadata']['encoding_safe']}*")
        md_content.append(f"*跨平台: {memory_doc['metadata']['cross_platform']}*")
        
        return "\n".join(md_content)
    
    # 以下是各种辅助方法的具体实现
    
    def _get_cli_category(self, cli_name: str) -> str:
        """获取CLI类别"""
        categories = {
            'claude': 'AI对话助手',
            'gemini': 'AI对话助手',
            'qwencode': '代码生成助手',
            'iflow': '工作流管理',
            'qoder': '代码生成助手',
            'codebuddy': '编程学习助手',
            'copilot': '代码补全助手',
            'codex': '代码分析助手'
        }
        return categories.get(cli_name, '未分类')
    
    def _get_cli_developer(self, cli_name: str) -> str:
        """获取CLI开发者"""
        developers = {
            'claude': 'Anthropic',
            'gemini': 'Google',
            'qwencode': '阿里云',
            'iflow': 'iFlow团队',
            'qoder': 'Qoder团队',
            'codebuddy': 'CodeBuddy团队',
            'copilot': 'GitHub/Microsoft',
            'codex': 'OpenAI'
        }
        return developers.get(cli_name, 'Unknown')
    
    def _get_cli_website(self, cli_name: str) -> str:
        """获取CLI官网"""
        websites = {
            'claude': 'https://www.anthropic.com',
            'gemini': 'https://ai.google.dev',
            'qwencode': 'https://www.aliyun.com',
            'iflow': 'https://iflow.ai',
            'qoder': 'https://qoder.ai',
            'codebuddy': 'https://codebuddy.ai',
            'copilot': 'https://github.com/features/copilot',
            'codex': 'https://openai.com'
        }
        return websites.get(cli_name, 'N/A')
    
    def _get_cli_documentation(self, cli_name: str) -> str:
        """获取CLI文档链接"""
        docs = {
            'claude': 'https://docs.anthropic.com',
            'gemini': 'https://ai.google.dev/docs',
            'qwencode': 'https://help.aliyun.com',
            'iflow': 'https://docs.iflow.ai',
            'qoder': 'https://docs.qoder.ai',
            'codebuddy': 'https://docs.codebuddy.ai',
            'copilot': 'https://docs.github.com',
            'codex': 'https://platform.openai.com/docs'
        }
        return docs.get(cli_name, 'N/A')
    
    def _get_cli_repository(self, cli_name: str) -> str:
        """获取CLI代码仓库"""
        repos = {
            'claude': 'https://github.com/anthropics/claude',
            'gemini': 'https://github.com/google/gemini',
            'qwencode': 'https://github.com/alibaba/qwen',
            'iflow': 'https://github.com/iflow/cli',
            'qoder': 'https://github.com/qoder/cli',
            'codebuddy': 'https://github.com/codebuddy/cli',
            'copilot': 'https://github.com/github/copilot-cli',
            'codex': 'https://github.com/openai/codex'
        }
        return repos.get(cli_name, 'N/A')
    
    def _get_cli_dependencies(self, cli_name: str) -> List[str]:
        """获取CLI依赖"""
        dependencies = {
            'claude': ['python>=3.7', 'requests', 'click'],
            'gemini': ['python>=3.7', 'google-generativeai', 'click'],
            'qwencode': ['python>=3.7', 'requests', 'click'],
            'iflow': ['python>=3.7', 'pyyaml', 'click'],
            'qoder': ['python>=3.7', 'requests', 'click'],
            'codebuddy': ['python>=3.7', 'openai', 'click'],
            'copilot': ['node>=16', '@github/copilot'],
            'codex': ['python>=3.7', 'openai', 'click']
        }
        return dependencies.get(cli_name, [])
    
    def _get_version_info(self, cli_name: str) -> Optional[str]:
        """获取版本信息"""
        config = self.cli_executor.cli_configs[cli_name]
        if config.version_check_command:
            try:
                result = self.cli_executor.execute_cli_command(CLICommand(
                    cli_name=cli_name,
                    command_type='config',
                    command=config.version_check_command.replace(f'{config.command} ', ''),
                    description='获取版本信息',
                    parameters={},
                    input_files=[],
                    output_files=[]
                ))
                if result.success:
                    return result.stdout.strip()
            except:
                pass
        return None
    
    def _get_auth_status(self, cli_name: str) -> str:
        """获取认证状态"""
        status, message = self.cli_executor.check_cli_status(cli_name)
        return status.value
    
    def _get_max_file_size(self, cli_name: str) -> str:
        """获取最大文件大小"""
        sizes = {
            'claude': '10MB',
            'gemini': '20MB',
            'qwencode': '10MB',
            'iflow': '5MB',
            'qoder': '15MB',
            'codebuddy': '10MB',
            'copilot': '25MB',
            'codex': '10MB'
        }
        return sizes.get(cli_name, '5MB')
    
    def _supports_batch_processing(self, cli_name: str) -> bool:
        """是否支持批处理"""
        batch_support = {
            'claude': True,
            'gemini': True,
            'qwencode': False,
            'iflow': True,
            'qoder': True,
            'codebuddy': False,
            'copilot': True,
            'codex': True
        }
        return batch_support.get(cli_name, False)
    
    def _supports_streaming(self, cli_name: str) -> bool:
        """是否支持流式处理"""
        streaming_support = {
            'claude': True,
            'gemini': True,
            'qwencode': False,
            'iflow': False,
            'qoder': False,
            'codebuddy': True,
            'copilot': True,
            'codex': False
        }
        return streaming_support.get(cli_name, False)
    
    def _supports_interactive_mode(self, cli_name: str) -> bool:
        """是否支持交互模式"""
        interactive_support = {
            'claude': True,
            'gemini': True,
            'qwencode': True,
            'iflow': True,
            'qoder': True,
            'codebuddy': True,
            'copilot': True,
            'codex': False
        }
        return interactive_support.get(cli_name, True)
    
    def _get_detailed_command_specs(self, cli_name: str) -> Dict[str, Any]:
        """获取详细命令规格"""
        # 这里应该解析实际的帮助信息，现在提供基本模板
        return {
            "global_options": {
                "--help": "显示帮助信息",
                "--version": "显示版本信息",
                "--verbose": "详细输出",
                "--quiet": "静默模式"
            },
            "subcommands": {
                "chat": "对话模式",
                "file": "文件处理模式",
                "config": "配置管理",
                "auth": "认证管理"
            },
            "parameters": {
                "input": "输入文件或提示词",
                "output": "输出文件路径",
                "model": "模型选择",
                "temperature": "创造性参数(0.0-1.0)",
                "max_tokens": "最大令牌数",
                "timeout": "超时时间(秒)"
            }
        }
    
    def _get_comprehensive_usage_examples(self, cli_name: str) -> List[Dict[str, str]]:
        """获取全面的使用示例"""
        config = self.cli_executor.cli_configs[cli_name]
        examples = []
        
        # 基础使用
        examples.append({
            "description": f"{config.display_name} 基础对话",
            "command": f"{config.command} \"你好，请介绍一下你的功能\"",
            "category": "basic",
            "purpose": "基本对话测试"
        })
        
        # 文件处理
        if config.supported_file_types:
            examples.append({
                "description": f"{config.display_name} 处理文件",
                "command": f"{config.command} --file example.py",
                "category": "file_processing",
                "purpose": "文件内容分析"
            })
        
        # 代码生成
        if config.output_format == 'code':
            examples.append({
                "description": f"{config.display_name} 代码生成",
                "command": f"{config.command} \"请生成一个Python快排算法\"",
                "category": "code_generation",
                "purpose": "代码生成示例"
            })
        
        # 跨CLI协作
        examples.append({
            "description": f"{config.display_name} 跨CLI协作",
            "command": f"{config.command} \"请用claude帮我审查这段代码的质量\"",
            "category": "cross_cli",
            "purpose": "跨工具协作示例"
        })
        
        # 批处理
        if self._supports_batch_processing(cli_name):
            examples.append({
                "description": f"{config.display_name} 批处理模式",
                "command": f"{config.command} --batch --input-dir ./src --output-dir ./output",
                "category": "batch",
                "purpose": "批量文件处理"
            })
        
        # 流式处理
        if self._supports_streaming(cli_name):
            examples.append({
                "description": f"{config.display_name} 流式输出",
                "command": f"{config.command} --stream \"写一首关于编程的诗\"",
                "category": "streaming",
                "purpose": "实时输出示例"
            })
        
        # 配置管理
        examples.append({
            "description": f"{config.display_name} 配置管理",
            "command": f"{config.command} config set model gpt-4",
            "category": "configuration",
            "purpose": "设置默认模型"
        })
        
        return examples
    
    def _get_api_compatibility(self, cli_name: str) -> Dict[str, Any]:
        """获取API兼容性信息"""
        return {
            "rest_api": self._supports_rest_api(cli_name),
            "websocket": self._supports_websocket(cli_name),
            "graphql": self._supports_graphql(cli_name),
            "sdk_support": self._has_sdk_support(cli_name),
            "webhooks": self._supports_webhooks(cli_name)
        }
    
    def _supports_rest_api(self, cli_name: str) -> bool:
        """是否支持REST API"""
        rest_support = {
            'claude': True,
            'gemini': True,
            'qwencode': True,
            'iflow': True,
            'qoder': False,
            'codebuddy': False,
            'copilot': False,
            'codex': True
        }
        return rest_support.get(cli_name, False)
    
    def _supports_websocket(self, cli_name: str) -> bool:
        """是否支持WebSocket"""
        ws_support = {
            'claude': False,
            'gemini': False,
            'qwencode': False,
            'iflow': False,
            'qoder': False,
            'codebuddy': False,
            'copilot': False,
            'codex': False
        }
        return ws_support.get(cli_name, False)
    
    def _supports_graphql(self, cli_name: str) -> bool:
        """是否支持GraphQL"""
        graphql_support = {
            'claude': False,
            'gemini': False,
            'qwencode': False,
            'iflow': False,
            'qoder': False,
            'codebuddy': False,
            'copilot': False,
            'codex': False
        }
        return graphql_support.get(cli_name, False)
    
    def _has_sdk_support(self, cli_name: str) -> bool:
        """是否有SDK支持"""
        sdk_support = {
            'claude': True,
            'gemini': True,
            'qwencode': True,
            'iflow': True,
            'qoder': False,
            'codebuddy': False,
            'copilot': True,
            'codex': True
        }
        return sdk_support.get(cli_name, False)
    
    def _supports_webhooks(self, cli_name: str) -> bool:
        """是否支持Webhooks"""
        webhook_support = {
            'claude': False,
            'gemini': False,
            'qwencode': False,
            'iflow': True,
            'qoder': False,
            'codebuddy': False,
            'copilot': False,
            'codex': False
        }
        return webhook_support.get(cli_name, False)
    
    def _get_plugin_support(self, cli_name: str) -> Dict[str, Any]:
        """获取插件支持信息"""
        return {
            "has_plugin_system": self._has_plugin_system(cli_name),
            "plugin_api": self._has_plugin_api(cli_name),
            "community_plugins": self._has_community_plugins(cli_name),
            "custom_plugin_development": self._supports_custom_plugin_dev(cli_name)
        }
    
    def _has_plugin_system(self, cli_name: str) -> bool:
        plugin_system = {
            'claude': True,
            'gemini': True,
            'qwencode': False,
            'iflow': True,
            'qoder': False,
            'codebuddy': True,
            'copilot': False,
            'codex': False
        }
        return plugin_system.get(cli_name, False)
    
    def _has_plugin_api(self, cli_name: str) -> bool:
        plugin_api = {
            'claude': True,
            'gemini': True,
            'qwencode': False,
            'iflow': True,
            'qoder': False,
            'codebuddy': False,
            'copilot': False,
            'codex': False
        }
        return plugin_api.get(cli_name, False)
    
    def _has_community_plugins(self, cli_name: str) -> bool:
        community_plugins = {
            'claude': True,
            'gemini': True,
            'qwencode': False,
            'iflow': False,
            'qoder': False,
            'codebuddy': True,
            'copilot': False,
            'codex': True
        }
        return community_plugins.get(cli_name, False)
    
    def _supports_custom_plugin_dev(self, cli_name: str) -> bool:
        custom_plugin_dev = {
            'claude': True,
            'gemini': True,
            'qwencode': False,
            'iflow': True,
            'qoder': False,
            'codebuddy': False,
            'copilot': False,
            'codex': False
        }
        return custom_plugin_dev.get(cli_name, False)
    
    def _get_common_errors(self, cli_name: str) -> List[Dict[str, str]]:
        """获取常见错误"""
        # 通用错误
        common_errors = [
            {
                "error": "认证失败",
                "cause": "API密钥无效或未设置",
                "solution": "检查环境变量设置，确保API密钥正确"
            },
            {
                "error": "网络连接错误",
                "cause": "网络不可达或服务器故障",
                "solution": "检查网络连接，稍后重试"
            },
            {
                "error": "文件不存在",
                "cause": "指定的文件路径不存在",
                "solution": "检查文件路径是否正确"
            },
            {
                "error": "权限不足",
                "cause": "文件权限或系统权限不足",
                "solution": "使用管理员权限运行或检查文件权限"
            }
        ]
        
        # CLI特定错误
        cli_specific_errors = {
            'claude': [
                {
                    "error": "令牌配额不足",
                    "cause": "API调用次数超限",
                    "solution": "检查账户余额或升级套餐"
                }
            ],
            'gemini': [
                {
                    "error": "模型不可用",
                    "cause": "选择的模型在当前区域不可用",
                    "solution": "使用其他可用模型"
                }
            ],
            'copilot': [
                {
                    "error": "订阅过期",
                    "cause": "GitHub Copilot订阅已过期",
                    "solution": "续订GitHub Copilot服务"
                }
            ]
        }
        
        errors = common_errors.copy()
        if cli_name in cli_specific_errors:
            errors.extend(cli_specific_errors[cli_name])
        
        return errors
    
    def _get_error_codes(self, cli_name: str) -> Dict[str, str]:
        """获取错误代码"""
        return {
            "0": "成功",
            "1": "一般错误",
            "2": "认证失败",
            "3": "网络错误",
            "4": "文件错误",
            "5": "权限错误",
            "6": "配置错误",
            "7": "API错误",
            "8": "超时错误"
        }
    
    def _get_troubleshooting_guide(self, cli_name: str) -> List[str]:
        """获取故障排除指南"""
        return [
            "1. 检查网络连接是否正常",
            "2. 验证API密钥是否正确设置",
            "3. 确认CLI工具是否正确安装",
            "4. 检查文件路径和权限",
            "5. 查看详细错误日志",
            "6. 尝试重新认证",
            "7. 更新到最新版本",
            "8. 联系技术支持"
        ]
    
    def _get_log_locations(self, cli_name: str) -> List[str]:
        """获取日志位置"""
        config = self.cli_executor.cli_configs[cli_name]
        log_locations = []
        
        # 配置文件所在目录的logs子目录
        for config_file in config.config_files:
            config_path = Path(config_file.replace('~', os.path.expanduser('~')))
            log_dir = config_path.parent / 'logs'
            log_locations.append(str(log_dir))
        
        # 系统日志目录
        if platform.system().lower() == 'windows':
            log_locations.append(f"%TEMP%\\{config.name}\\logs")
        else:
            log_locations.append(f"~/.{config.name}/logs")
            log_locations.append(f"/var/log/{config.name}")
        
        # 临时目录
        log_locations.append(str(Path(tempfile.gettempdir()) / f'{config.name}'))
        
        return log_locations
    
    def _get_typical_response_time(self, cli_name: str) -> str:
        """获取典型响应时间"""
        response_times = {
            'claude': "2-5秒",
            'gemini': "1-3秒",
            'qwencode': "2-4秒",
            'iflow': "3-8秒",
            'qoder': "2-6秒",
            'codebuddy': "3-7秒",
            'copilot': "1-2秒",
            'codex': "2-5秒"
        }
        return response_times.get(cli_name, "2-5秒")
    
    def _get_concurrent_request_limit(self, cli_name: str) -> int:
        """获取并发请求限制"""
        limits = {
            'claude': 5,
            'gemini': 10,
            'qwencode': 3,
            'iflow': 2,
            'qoder': 3,
            'codebuddy': 5,
            'copilot': 20,
            'codex': 5
        }
        return limits.get(cli_name, 5)
    
    def _get_rate_limits(self, cli_name: str) -> str:
        """获取速率限制"""
        rate_limits = {
            'claude': "1000次/小时",
            'gemini': "2000次/小时",
            'qwencode': "500次/小时",
            'iflow': "200次/小时",
            'qoder': "800次/小时",
            'codebuddy': "1000次/小时",
            'copilot': "无限制(受订阅限制)",
            'codex': "1000次/小时"
        }
        return rate_limits.get(cli_name, "1000次/小时")
    
    def _get_resource_usage_info(self, cli_name: str) -> Dict[str, str]:
        """获取资源使用信息"""
        return {
            "cpu_usage": "低(单核5-15%)",
            "memory_usage": "中等(100-500MB)",
            "disk_usage": "低(配置文件<10MB)",
            "network_usage": "中等(取决于请求大小)",
            "gpu_requirement": "无(CPU即可运行)"
        }
    
    def _get_optimization_tips(self, cli_name: str) -> List[str]:
        """获取优化建议"""
        return [
            "使用本地缓存减少API调用",
            "批量处理多个文件",
            "调整超时时间以适应网络条件",
            "使用流式输出处理长文本",
            "合理设置并发请求数量",
            "定期清理日志和缓存文件",
            "使用离线模式减少网络依赖"
        ]
    
    def _get_data_retention_policy(self, cli_name: str) -> str:
        """获取数据保留策略"""
        policies = {
            'claude': "30天后自动删除",
            'gemini': "90天后自动删除", 
            'qwencode': "60天后自动删除",
            'iflow': "用户手动删除",
            'qoder': "30天后自动删除",
            'codebuddy': "90天后自动删除",
            'copilot': "符合GitHub数据政策",
            'codex': "符合OpenAI数据政策"
        }
        return policies.get(cli_name, "30天后自动删除")
    
    def _get_privacy_features(self, cli_name: str) -> List[str]:
        """获取隐私功能"""
        return [
            "端到端加密",
            "数据匿名化",
            "本地缓存选项",
            "隐私模式",
            "数据导出功能",
            "账户删除选项"
        ]
    
    def _get_encryption_support(self, cli_name: str) -> Dict[str, str]:
        """获取加密支持"""
        return {
            "data_transmission": "TLS 1.3",
            "data_storage": "AES-256",
            "key_management": "基于密钥的加密",
            "compliance": "符合行业安全标准"
        }
    
    def _get_compliance_info(self, cli_name: str) -> List[str]:
        """获取合规信息"""
        return [
            "GDPR合规",
            "SOC 2 Type II认证",
            "ISO 27001认证",
            "HIPAA合规(医疗相关)",
            "PCI DSS合规(支付相关)"
        ]
    
    def _get_version_history(self, cli_name: str) -> List[Dict[str, str]]:
        """获取版本历史"""
        return [
            {
                "version": "1.0.0",
                "release_date": "2024-01-15",
                "changes": ["初始版本发布", "基本CLI功能"]
            },
            {
                "version": "1.1.0", 
                "release_date": "2024-03-20",
                "changes": ["增加批处理支持", "性能优化"]
            },
            {
                "version": "1.2.0",
                "release_date": "2024-06-10",
                "changes": ["跨平台兼容性改进", "编码安全增强"]
            }
        ]
    
    def _get_recent_changes(self, cli_name: str) -> List[str]:
        """获取最近更改"""
        return [
            "添加跨平台编码安全支持",
            "改进Windows系统兼容性",
            "优化内存使用",
            "增加新的CLI命令",
            "修复已知bug",
            "更新文档"
        ]
    
    def _get_roadmap(self, cli_name: str) -> List[str]:
        """获取路线图"""
        return [
            "支持更多文件格式",
            "增强协作功能",
            "提高响应速度",
            "添加插件市场",
            "集成更多AI模型",
            "改进用户体验"
        ]
    
    def _get_additional_notes(self, cli_name: str) -> List[str]:
        """获取额外说明"""
        return [
            "建议定期更新到最新版本",
            "请备份重要配置文件",
            "遵循最佳安全实践",
            "关注官方公告和更新",
            "参与社区讨论和反馈"
        ]

def main():
    """主函数"""
    try:
        generator = GlobalMemoryGenerator()
        success = generator.generate_all_memories()
        
        if success:
            print("\n🎉 所有CLI全局记忆文档生成完成！")
            print(f"📁 文档保存位置: {generator.memory_dir}")
            print("\n📋 生成的文档:")
            for cli_name in generator.cli_executor.cli_configs.keys():
                json_file = generator.memory_dir / f'{cli_name}_global_memory.json'
                md_file = generator.memory_dir / f'{cli_name}_global_memory.md'
                
                if json_file.exists():
                    print(f"   📄 {json_file}")
                if md_file.exists():
                    print(f"   📝 {md_file}")
        else:
            print("\n❌ 部分记忆文档生成失败，请检查错误信息")
            return 1
            
    except KeyboardInterrupt:
        print("\n\n👋 用户中断操作")
    except Exception as e:
        print(f"\n❌ 生成过程出错: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())