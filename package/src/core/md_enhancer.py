"""
MD Document Enhancer - MD文档增强器
为现有MD文档添加协作感知章节
"""
import re
import asyncio
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple

from models import (
    CLIInfo, AIEnvironmentInfo, CollaborationGuide,
    MarkdownSection, EnhancementResult, CLI_CONFIG_MAPPING
)

import logging
logger = logging.getLogger(__name__)


class MDDocumentEnhancer:
    """MD文档增强器 - 为现有MD文档添加协作感知"""

    def __init__(self):
        self.collaboration_keywords = [
            "协作", "collaboration", "AI工具", "跨AI", "协同",
            "cooperation", "ai tools", "cross-ai", "synergy"
        ]

    async def enhance_existing_md(self,
                                existing_content: str,
                                collaboration_content: str,
                                cli_name: str) -> str:
        """增强现有MD文档"""
        try:
            # 解析现有文档结构
            doc_structure = self._parse_markdown_structure(existing_content)

            # 检查是否已存在协作相关章节
            has_collaboration = self._has_collaboration_section(doc_structure)

            if has_collaboration:
                logger.info(f"文档 {cli_name}.md 已存在协作章节，将更新内容")
                # 更新现有协作章节
                return await self._update_collaboration_section(existing_content, collaboration_content)
            else:
                logger.info(f"文档 {cli_name}.md 不存在协作章节，将添加新章节")
                # 添加新的协作章节
                return await self._add_collaboration_section(existing_content, collaboration_content, cli_name)

        except Exception as e:
            logger.error(f"增强MD文档失败: {e}")
            # 如果增强失败，返回原内容
            return existing_content

    async def generate_collaboration_section(self,
                                            cli_name: str,
                                            ai_environment: AIEnvironmentInfo,
                                            current_cli: str) -> str:
        """生成协作感知章节内容"""
        try:
            # 获取当前CLI信息
            current_cli_info = ai_environment.available_clis.get(cli_name)
            if not current_cli_info:
                logger.warning(f"未找到CLI工具 {cli_name} 的信息")
                return ""

            # 获取可协作的其他CLI工具
            peer_clis = ai_environment.collaboration_guide.available_peers

            collaboration_section = f"""

## 🤝 AI工具协作指南

> 📅 协作配置更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 🔧 由 {current_cli.upper()} 工具增强

### 🎯 本项目可用的AI CLI工具

**当前工具**: **{current_cli_info.display_name}** v{current_cli_info.version}
- 集成类型: {self._get_integration_type_display(current_cli_info.integration_type)}
- 配置文件: `{current_cli_info.config_file}`
- 状态: {self._get_status_display(current_cli_info.status)}

**🔄 可协作工具**:
"""

            # 添加可协作工具列表
            for peer_name, peer_info in peer_clis.items():
                status_emoji = "✅" if peer_info.status.value == "available" else "❌"
                capabilities = ", ".join(peer_info.capabilities[:3])  # 只显示前3个能力
                if len(peer_info.capabilities) > 3:
                    capabilities += f" 等{len(peer_info.capabilities)}项能力"

                collaboration_section += f"""
- **{peer_info.display_name}** v{peer_info.version} - {self._get_integration_type_display(peer_info.integration_type)} {status_emoji}
  - 能力: {capabilities}
  - 配置: `{peer_info.config_file}`
"""

            # 添加协作协议
            collaboration_section += f"""

### 🔄 跨AI协作指令模板

**中文协作指令**:
"""
            for protocol in ai_environment.collaboration_guide.protocols.get("chinese", [])[:5]:
                example = self._generate_protocol_example(protocol, list(peer_clis.keys())[:2])
                collaboration_section += f"- `{example}`\n"

            collaboration_section += """
**英文协作指令**:
"""
            for protocol in ai_environment.collaboration_guide.protocols.get("english", [])[:5]:
                example = self._generate_protocol_example(protocol, list(peer_clis.keys())[:2])
                collaboration_section += f"- `{example}`\n"

            # 添加协作示例
            collaboration_section += f"""

### 🎨 协作场景示例

基于当前项目特点和可用AI工具，推荐以下协作模式：

#### 🔗 代码生成与审查链
```bash
# 使用不同工具进行协作开发
> 请用qwen帮我生成用户认证模块
> 调用gemini审查代码安全性
> 用claude分析架构设计
```

#### 🔄 工作流自动化
```bash
# 创建自动化流程
> 用iflow创建测试工作流
> 让qwen生成部署脚本
> 调用gemini优化性能
```

#### 📊 数据分析协作
```bash
# 数据处理和分析
> 请用qwen处理这个数据集
> 用gemini分析关键趋势
> 调用claude生成报告
```

#### 🎯 问题解决链
```bash
# 复杂问题协作解决
> 请用claude分析这个问题
> 调用gemini提供解决方案
> 用qwen实现修复代码
```

#### 🛠️ 项目维护协作
```bash
# 项目维护和优化
> 用iflow创建更新工作流
> 请用qwen重构老旧模块
> 调用gemini进行性能优化
"""

            # 添加协作技巧和最佳实践
            collaboration_section += f"""

### 💡 协作技巧与最佳实践

1. **上下文保持**: 跨工具调用时，提供充分的上下文信息
2. **任务分解**: 将复杂任务分解为不同工具的专长领域
3. **结果验证**: 使用不同工具交叉验证重要结果
4. **版本控制**: 为重要的协作结果建立版本记录

### ⚠️ 重要提示

- **当前激活工具**: {current_cli_info.display_name} (您正在使用的工具)
- **协作感知**: 本文档已启用跨AI工具协作感知
- **动态更新**: 协作配置会随AI环境变化自动更新
- **工具状态**: 协作前请确认目标工具的可用状态

### 🔧 故障排除

如果跨AI工具协作遇到问题：

1. **检查工具可用性**: 确认目标CLI工具已正确安装
2. **验证配置文件**: 检查配置文件是否存在且格式正确
3. **网络连接**: 某些协作可能需要网络连接
4. **权限设置**: 确认工具具有执行相应任务的权限
5. **查看日志**: 检查各CLI工具的日志文件

### 📚 相关文档

- 项目AI环境配置: `.ai-cli-unified/config.json`
- 全局CLI配置: `~/.ai-cli-unified/global-config.json`
- 协作协议文档: [协作协议详细说明]

---
*📌 协作感知由 AI CLI Router 在 {datetime.now().isoformat()} 自动增强*
*🔄 支持的工具: {', '.join([info.display_name for info in ai_environment.available_clis.values()])}*
"""

            return collaboration_section

        except Exception as e:
            logger.error(f"生成协作章节失败: {e}")
            return f"\n\n## 🤝 协作指南\n\n协作功能暂时不可用: {str(e)}\n"

    def _parse_markdown_structure(self, content: str) -> List[MarkdownSection]:
        """解析Markdown文档结构"""
        sections = []
        lines = content.split('\n')
        current_section = None

        for line in lines:
            # 检测标题
            if line.strip().startswith('#'):
                if current_section:
                    sections.append(current_section)

                current_section = MarkdownSection(
                    title=line.strip(),
                    content=[],
                    level=len(line) - len(line.lstrip('#'))
                )
            elif current_section:
                current_section.content.append(line)

        if current_section:
            sections.append(current_section)

        return sections

    def _has_collaboration_section(self, sections: List[MarkdownSection]) -> bool:
        """检查是否已存在协作章节"""
        for section in sections:
            title_lower = section.title.lower()
            if any(keyword in title_lower for keyword in self.collaboration_keywords):
                return True
        return False

    async def _update_collaboration_section(self, existing_content: str, new_collaboration_content: str) -> str:
        """更新现有协作章节"""
        try:
            # 找到协作章节的起始位置
            lines = existing_content.split('\n')
            collaboration_start = -1
            collaboration_end = -1

            for i, line in enumerate(lines):
                if collaboration_start == -1:
                    # 寻找协作章节开始
                    if any(keyword in line.lower() for keyword in self.collaboration_keywords) and line.strip().startswith('#'):
                        collaboration_start = i
                else:
                    # 寻找协作章节结束（下一个同级或更高级标题）
                    if line.strip().startswith('#'):
                        current_level = len(line) - len(line.lstrip('#'))
                        # 找到协作章节的级别
                        collaboration_level = len(lines[collaboration_start]) - len(lines[collaboration_start].lstrip('#'))

                        if current_level <= collaboration_level:
                            collaboration_end = i
                            break

            # 如果找到了协作章节，替换它
            if collaboration_start != -1:
                if collaboration_end == -1:
                    # 协作章节在文档末尾
                    new_content = lines[:collaboration_start] + [new_collaboration_content.strip()]
                else:
                    # 协作章节在文档中间
                    new_content = lines[:collaboration_start] + [new_collaboration_content.strip()] + lines[collaboration_end:]

                return '\n'.join(new_content)
            else:
                # 没找到协作章节，添加到文档末尾
                return existing_content + new_collaboration_content

        except Exception as e:
            logger.error(f"更新协作章节失败: {e}")
            return existing_content + new_collaboration_content

    async def _add_collaboration_section(self, existing_content: str, collaboration_content: str, cli_name: str) -> str:
        """添加新的协作章节"""
        # 在文档末尾添加协作章节
        if not existing_content.endswith('\n'):
            existing_content += '\n'

        return existing_content + collaboration_content

    def _generate_protocol_example(self, protocol: str, peer_clis: List[str]) -> str:
        """生成协议示例"""
        if not peer_clis:
            return protocol.replace('{cli}', '工具名').replace('{task}', '任务')

        peer_cli = peer_clis[0]  # 使用第一个可用的CLI作为示例
        example_tasks = {
            "qwen": ["生成代码", "重构函数", "编写测试", "优化算法"],
            "gemini": ["分析性能", "优化查询", "数据可视化", "安全审查"],
            "claude": ["架构设计", "代码审查", "需求分析", "文档编写"],
            "iflow": ["创建工作流", "自动化部署", "持续集成", "流程优化"]
        }

        tasks = example_tasks.get(peer_cli, ["执行任务"])
        task = tasks[0] if tasks else "执行任务"

        return protocol.replace('{cli}', peer_cli).replace('{task}', task)

    def _get_integration_type_display(self, integration_type) -> str:
        """获取集成类型的显示名称"""
        type_names = {
            "hook_system": "钩子系统",
            "extension_system": "扩展系统",
            "class_inheritance": "类继承",
            "workflow_pipeline": "工作流流水线",
            "notification_hook": "通知钩子",
            "mcp_server": "MCP服务器",
            "slash_command": "斜杠命令"
        }
        return type_names.get(integration_type.value, integration_type.value)

    def _get_status_display(self, status) -> str:
        """获取状态的显示名称"""
        status_names = {
            "available": "✅ 可用",
            "unavailable": "❌ 不可用",
            "version_incompatible": "⚠️ 版本不兼容",
            "config_missing": "⚠️ 配置缺失"
        }
        return status_names.get(status.value, status.value)

    def _extract_sections(self, content: str) -> List[str]:
        """提取文档中的所有章节标题"""
        sections = []
        lines = content.split('\n')

        for line in lines:
            if line.strip().startswith('#'):
                sections.append(line.strip())

        return sections