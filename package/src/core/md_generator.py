"""
MD Document Generator - MD文档生成器
为新项目生成包含协作感知的完整MD文档
"""
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

from models import (
    CLIInfo, AIEnvironmentInfo, GeneratedDocument, CLI_CONFIG_MAPPING
)

import logging
logger = logging.getLogger(__name__)


class MDDocumentGenerator:
    """MD文档生成器 - 为新项目生成完整MD文档"""

    def __init__(self):
        self.template_cache = {}

    async def generate_complete_md(self,
                                 cli_name: str,
                                 cli_info: CLIInfo,
                                 ai_environment: AIEnvironmentInfo,
                                 current_cli: str) -> str:
        """为新项目生成完整的MD文档"""
        try:
            logger.info(f"为CLI工具 {cli_name} 生成完整MD文档")

            # 生成基础文档结构
            md_content = f"""# {cli_info.display_name} 项目配置

> 🆕 新项目初始化
> 📅 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> 🔧 由 {current_cli.upper()} 工具初始化

## 📋 项目概览

本项目已启用 **AI CLI Router 跨工具协作系统**，支持多个AI CLI工具的无缝协作。

### 🎯 主要特性

- ✅ **跨工具协作**: 支持多个AI CLI工具的协作开发
- ✅ **智能路由**: 自动识别和路由跨AI工具调用
- ✅ **配置管理**: 统一的AI环境配置管理
- ✅ **上下文保持**: 跨工具的上下文信息保持
- ✅ **错误恢复**: 智能的错误处理和恢复机制

"""

            # 添加CLI工具基本信息
            md_content += await self._generate_cli_info_section(cli_info)

            # 添加协作环境章节
            collaboration_content = await self._generate_collaboration_section(cli_name, ai_environment, current_cli)
            md_content += collaboration_content

            # 添加项目特定配置
            project_specific_content = await self._generate_project_specific_section(cli_name, ai_environment)
            md_content += project_specific_content

            # 添加快速开始指南
            quick_start_content = await self._generate_quick_start_section(cli_name, ai_environment)
            md_content += quick_start_content

            # 添加配置参考
            config_reference = await self._generate_config_reference_section(cli_name, ai_environment)
            md_content += config_reference

            # 添加故障排除指南
            troubleshooting_content = await self._generate_troubleshooting_section(cli_name, ai_environment)
            md_content += troubleshooting_content

            logger.info(f"成功生成 {cli_name}.md 文档，包含完整的协作感知")
            return md_content

        except Exception as e:
            logger.error(f"生成MD文档失败: {e}")
            raise

    async def _generate_cli_info_section(self, cli_info: CLIInfo) -> str:
        """生成CLI工具信息章节"""
        return f"""
## 🤖 当前CLI工具信息

**{cli_info.display_name}** v{cli_info.version}

### 📊 基本信息
- **集成类型**: {self._get_integration_type_display(cli_info.integration_type)}
- **配置文件**: `{cli_info.config_file}`
- **状态**: {self._get_status_display(cli_info.status)}
- **全局记忆文档**: `{cli_info.global_doc}`

### ⚡ 核心能力
{self._format_capabilities(cli_info.capabilities)}

### 🔧 技术规格
- **协议支持**: 跨CLI协作协议、中英文自然语言处理
- **错误处理**: 优雅降级、自动重试、错误隔离
- **性能优化**: 异步执行、并发处理、智能缓存
"""

    async def _generate_collaboration_section(self,
                                             cli_name: str,
                                             ai_environment: AIEnvironmentInfo,
                                             current_cli: str) -> str:
        """生成协作环境章节"""
        current_cli_info = ai_environment.available_clis.get(cli_name)
        peer_clis = ai_environment.collaboration_guide.available_peers

        collaboration_section = f"""

## 🤝 AI工具协作环境

### 🎯 本项目AI工具生态系统

**当前激活工具**: **{current_cli_info.display_name}** v{current_cli_info.version}

**🔄 可协作工具生态系统**:
"""

        # 添加协作工具列表
        for peer_name, peer_info in peer_clis.items():
            status_emoji = "✅" if peer_info.status.value == "available" else "❌"
            capabilities_text = ", ".join(peer_info.capabilities[:2])
            if len(peer_info.capabilities) > 2:
                capabilities_text += f" 等{len(peer_info.capabilities)}项"

            collaboration_section += f"""
- **{peer_info.display_name}** v{peer_info.version}
  - {status_emoji} 状态: {self._get_status_display(peer_info.status)}
  - 🛠️ 类型: {self._get_integration_type_display(peer_info.integration_type)}
  - ⚡ 能力: {capabilities_text}
  - 📁 配置: `{peer_info.config_file}`
"""

        # 添加协作协议
        collaboration_section += f"""

### 📝 跨AI协作协议

**中文协作指令模式**:
"""
        chinese_protocols = ai_environment.collaboration_guide.protocols.get("chinese", [])[:6]
        for protocol in chinese_protocols:
            examples = self._generate_protocol_examples(protocol, list(peer_clis.keys())[:2])
            collaboration_section += f"- `{protocol}`\n"
            for example in examples[:2]:  # 每个协议最多2个示例
                collaboration_section += f"  - 示例: `{example}`\n"

        collaboration_section += """
**英文协作指令模式**:
"""
        english_protocols = ai_environment.collaboration_guide.protocols.get("english", [])[:6]
        for protocol in english_protocols:
            examples = self._generate_protocol_examples(protocol, list(peer_clis.keys())[:2])
            collaboration_section += f"- `{protocol}`\n"
            for example in examples[:2]:  # 每个协议最多2个示例
                collaboration_section += f"  - 示例: `{example}`\n"

        # 添加协作场景
        collaboration_section += f"""

### 🎨 典型协作场景

#### 1. 代码开发协作流程
```bash
# 开发新功能
> 请用qwen帮我实现用户认证模块
> 调用gemini分析安全漏洞
> 用claude审查代码架构
> 让iflow创建测试工作流
```

#### 2. 问题解决协作
```bash
# 解决复杂技术问题
> 用claude分析这个性能问题
> 调用gemini提供优化方案
> 请用qwen实现性能优化
```

#### 3. 项目维护协作
```bash
# 项目维护和更新
> 用iflow创建维护工作流
> 请用qwen重构老旧代码
> 调用gemini进行性能分析
> 让claude生成技术文档
```

#### 4. 数据处理协作
```bash
# 数据分析和处理
> 请用qwen处理这个数据集
> 用gemini进行统计分析
> 调用claude生成可视化报告
```

### 🎯 协作最佳实践

1. **上下文传递**: 在跨工具调用时保持充分的上下文信息
2. **任务分解**: 将复杂任务分解为不同工具的专长领域
3. **结果验证**: 使用不同工具交叉验证重要结果
4. **版本管理**: 为重要的协作结果建立版本控制
5. **错误处理**: 优雅处理跨工具调用中的错误情况

### 🔄 工具切换策略

| 任务类型 | 推荐工具 | 备用工具 |
|---------|---------|---------|
| 代码生成 | QwenCode | Claude |
| 性能优化 | Gemini | Claude |
| 架构设计 | Claude | Gemini |
| 工作流自动化 | iFlow | Claude |
| 代码审查 | Claude | Gemini |
| 数据分析 | Gemini | QwenCode |
"""

        return collaboration_section

    async def _generate_project_specific_section(self,
                                                cli_name: str,
                                                ai_environment: AIEnvironmentInfo) -> str:
        """生成项目特定配置章节"""

        return f"""

## ⚙️ 项目特定配置

### 📁 项目结构

建议的项目目录结构:
```
project-root/
├── {cli_name}.md              # 当前工具的项目配置 (本文件)
├── claude.md                  # Claude CLI配置
├── gemini.md                  # Gemini CLI配置
├── qwen.md                    # QwenCode CLI配置
├── iflow.md                   # iFlow CLI配置
├── .ai-cli-project/           # AI项目配置目录
│   ├── project-config.json    # 项目级AI配置
│   ├── collaboration-log.json # 协作历史记录
│   └── tool-preferences.json  # 工具使用偏好
├── src/                       # 源代码目录
├── tests/                     # 测试目录
└── docs/                      # 文档目录
```

### 🔧 AI配置管理

#### 全局配置
- **位置**: `~/.ai-cli-unified/global-config.json`
- **作用**: 存储所有AI CLI工具的全局配置
- **更新方式**: 通过 `ai-cli-router scan` 命令

#### 项目配置
- **位置**: `.ai-cli-project/project-config.json`
- **作用**: 项目特定的AI工具配置和偏好
- **更新方式**: 通过各CLI工具的配置功能

### 📊 协作统计

项目AI工具使用情况将自动记录在 `.ai-cli-project/collaboration-log.json` 中，包括:
- 跨工具调用次数
- 协作成功率
- 常用协作模式
- 性能指标统计
"""

    async def _generate_quick_start_section(self,
                                           cli_name: str,
                                           ai_environment: AIEnvironmentInfo) -> str:
        """生成快速开始指南"""
        peer_clis = list(ai_environment.collaboration_guide.available_peers.keys())

        quick_start = f"""

## 🚀 快速开始

### 1. 立即开始协作

```bash
# 检查可用AI工具
> /init

# 开始跨工具协作
> 请用{peer_clis[0] if peer_clis else 'qwen'}帮我生成一个Python函数
> 调用{peer_clis[1] if len(peer_clis) > 1 else 'claude'}审查这段代码
```

### 2. 常用协作模式

#### 🔗 代码生成 → 审查 → 优化
```bash
> 请用qwen生成用户认证代码
> 调用gemini分析性能
> 用claude审查架构设计
```

#### 🔄 问题分析 → 解决方案 → 实现
```bash
> 用claude分析这个bug
> 调用gemini提供解决方案
> 请用qwen实现修复代码
```

#### 📊 数据处理 → 分析 → 报告
```bash
> 请用qwen处理CSV数据
> 用gemini统计分析结果
> 调用claude生成分析报告
```

### 3. 工具特定功能

"""

        # 添加工具特定的快速开始内容
        tool_specific_content = await self._generate_tool_specific_quick_start(cli_name, peer_clis)
        quick_start += tool_specific_content

        return quick_start

    async def _generate_tool_specific_quick_start(self, cli_name: str, peer_clis: List[str]) -> str:
        """生成工具特定的快速开始内容"""

        tool_guides = {
            "claude": """
#### Claude CLI 特有功能
- **智能分析**: 深度语义理解和智能分析
- **学习优化**: 持续学习和性能优化
- **错误恢复**: 智能错误分析和自动恢复

推荐协作模式:
```bash
> 用claude分析这个需求的复杂性
> 请用qwen基于分析结果生成代码
> 调用gemini优化生成的代码性能
```
""",
            "gemini": """
#### Gemini CLI 特有功能
- **智能匹配**: 高级模式匹配和任务识别
- **多处理器**: 支持多种Extension处理器
- **数据分析**: 强大的数据处理和分析能力

推荐协作模式:
```bash
> 用gemini分析这个数据集的模式
> 请用qwen生成数据可视化代码
> 调用claude生成分析报告
```
""",
            "qwen": """
#### QwenCode CLI 特有功能
- **代码生成**: 高质量代码生成和重构
- **插件系统**: 丰富的插件和扩展能力
- **代码审查**: 智能代码质量检查

推荐协作模式:
```bash
> 请用qwen生成完整的CRUD API
> 调用gemini分析API性能
> 用claude审查代码架构
```
""",
            "iflow": """
#### iFlow CLI 特有功能
- **工作流引擎**: 强大的工作流编排能力
- **流水线处理**: 自动化流水线管理
- **任务队列**: 高效的任务调度和执行

推荐协作模式:
```bash
> 用iflow创建CI/CD工作流
> 请用qwen生成部署脚本
> 调用gemini优化工作流性能
```
"""
        }

        return tool_guides.get(cli_name, f"""
#### {cli_name.upper()} CLI
使用 {cli_name.upper()} CLI 开始你的AI协作之旅。查看工具文档了解更多功能。
""")

    async def _generate_config_reference_section(self,
                                                 cli_name: str,
                                                 ai_environment: AIEnvironmentInfo) -> str:
        """生成配置参考章节"""

        return f"""

## 📚 配置参考

### 🔧 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| AI_CLI_ROUTER_ENABLED | 启用AI CLI Router | true |
| AI_CLI_LOG_LEVEL | 日志级别 | INFO |
| AI_CLI_TIMEOUT | 超时时间(秒) | 30 |
| AI_CLI_RETRY_COUNT | 重试次数 | 3 |

### 📁 配置文件路径

- **全局配置**: `~/.ai-cli-unified/global-config.json`
- **项目配置**: `.ai-cli-project/project-config.json`
- **工具配置**: `~/.config/{cli_name}/config.yml`
- **日志文件**: `~/.config/{cli_name}/logs/`

### 🎯 协作配置选项

```json
{{
  "collaboration": {{
    "enabled": true,
    "auto_detect": true,
    "timeout": 30,
    "retry_count": 3,
    "preferred_tools": ["claude", "qwen", "gemini"],
    "fallback_strategy": "sequential"
  }},
  "protocols": {{
    "chinese": true,
    "english": true,
    "mixed_language": true
  }}
}}
```

### 🔌 插件配置

支持的插件类型:
- **Hook插件**: 用于事件驱动的扩展
- **Extension插件**: 用于功能增强
- **Workflow插件**: 用于工作流集成
"""

    async def _generate_troubleshooting_section(self,
                                                cli_name: str,
                                                ai_environment: AIEnvironmentInfo) -> str:
        """生成故障排除指南"""

        return f"""

## 🔧 故障排除

### ❌ 常见问题

#### 1. 跨工具调用失败
**症状**: 跨AI工具调用时出现错误或超时

**解决方案**:
- 检查目标CLI工具是否正确安装
- 验证配置文件是否存在且格式正确
- 检查网络连接状态
- 查看各工具的日志文件

```bash
# 检查工具状态
> ai-cli-router status

# 重新扫描环境
> ai-cli-router scan
```

#### 2. 协作协议识别失败
**症状**: 无法识别跨AI工具调用意图

**解决方案**:
- 确保使用标准协作协议格式
- 检查协议中的CLI工具名称是否正确
- 使用完整的任务描述
- 避免使用模糊的指令

#### 3. 配置文件冲突
**症状**: 配置文件格式错误或内容冲突

**解决方案**:
- 备份现有配置文件
- 使用 `ai-cli-router init` 重新生成配置
- 手动检查配置文件格式
- 查看配置验证日志

#### 4. 性能问题
**症状**: 跨工具调用响应缓慢

**解决方案**:
- 检查系统资源使用情况
- 调整超时和重试设置
- 使用并行处理模式
- 优化任务描述的清晰度

### 🔍 调试工具

#### 日志查看
```bash
# 查看全局日志
tail -f ~/.ai-cli-unified/logs/router.log

# 查看工具特定日志
tail -f ~/.config/{cli_name}/logs/collaboration.log
```

#### 状态检查
```bash
# 检查所有工具状态
ai-cli-router status --verbose

# 检查项目配置
ai-cli-router check-project
```

#### 配置验证
```bash
# 验证全局配置
ai-cli-router validate --global

# 验证项目配置
ai-cli-router validate --project
```

### 📞 获取帮助

如果遇到无法解决的问题:

1. **查看文档**: 访问项目的完整文档
2. **社区支持**: 在社区论坛寻求帮助
3. **问题报告**: 在GitHub上提交issue
4. **日志分析**: 提供详细的错误日志

### 🔄 重置和恢复

```bash
# 重置项目配置
ai-cli-router reset --project

# 重置全局配置
ai-cli-router reset --global

# 完全重置
ai-cli-router reset --all
```

---

*💡 提示: 定期更新AI CLI Router以获得最新功能和修复*
"""

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

    def _format_capabilities(self, capabilities: List[str]) -> str:
        """格式化能力列表"""
        if not capabilities:
            return "- 基础AI助手功能"

        formatted = []
        for capability in capabilities:
            formatted.append(f"- {capability}")

        return "\n".join(formatted)

    def _generate_protocol_examples(self, protocol: str, peer_clis: List[str]) -> List[str]:
        """生成协议示例"""
        if not peer_clis:
            return [protocol.replace('{cli}', '工具名').replace('{task}', '任务')]

        examples = []
        for peer_cli in peer_clis[:3]:  # 最多3个示例
            example_tasks = {
                "qwen": ["生成代码", "重构函数", "编写测试"],
                "gemini": ["分析性能", "优化查询", "数据可视化"],
                "claude": ["架构设计", "代码审查", "需求分析"],
                "iflow": ["创建工作流", "自动化部署", "流程优化"]
            }

            tasks = example_tasks.get(peer_cli, ["执行任务"])
            for task in tasks[:2]:  # 每个工具最多2个任务
                example = protocol.replace('{cli}', peer_cli).replace('{task}', task)
                examples.append(example)

        return examples

    def _extract_sections(self, content: str) -> int:
        """提取文档中的章节数量"""
        sections = []
        lines = content.split('\n')

        for line in lines:
            if line.strip().startswith('#'):
                sections.append(line.strip())

        return len(sections)