"""
Enhanced Init Processor - 增强的初始化处理器
处理新老两种项目的 /init 指令，集成AI环境感知
"""
import os
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

from .models import (
    ProjectStatus, InitResult, EnhancementResult, GeneratedDocument,
    AIEnvironmentInfo, CLI_CONFIG_MAPPING
)
from .ai_environment_scanner import AIEnvironmentScanner
from .md_enhancer import MDDocumentEnhancer
from .md_generator import MDDocumentGenerator

import logging
logger = logging.getLogger(__name__)


class EnhancedInitProcessor:
    """增强的初始化处理器 - 处理新老两种项目情况"""

    def __init__(self, current_cli: str):
        self.current_cli = current_cli
        self.ai_environment_scanner = AIEnvironmentScanner(current_cli)
        self.md_enhancer = MDDocumentEnhancer()
        self.md_generator = MDDocumentGenerator()

    async def process_init_command(self, project_path: str) -> InitResult:
        """处理 /init 指令，自动检测新老项目"""
        start_time = datetime.now()

        try:
            logger.info(f"开始处理 /init 指令，当前CLI: {self.current_cli}，项目路径: {project_path}")

            # 1. 检测项目类型（新老项目）
            logger.info("检测项目状态...")
            project_status = await self._detect_project_status(project_path)

            # 2. 扫描AI环境
            logger.info("扫描AI环境...")
            ai_environment = await self.ai_environment_scanner.scan_ai_environment(project_path)

            # 3. 根据项目类型处理
            if project_status.is_existing_project:
                # 老项目：增强现有MD文档
                logger.info("检测到现有项目，开始增强现有MD文档...")
                result = await self._enhance_existing_project(project_path, ai_environment)
                result.project_type = "existing_project"
            else:
                # 新项目：生成完整MD文档
                logger.info("检测到新项目，开始生成完整MD文档...")
                result = await self._initialize_new_project(project_path, ai_environment)
                result.project_type = "new_project"

            # 4. 计算处理时间
            processing_time = (datetime.now() - start_time).total_seconds()
            result.processing_time = processing_time

            logger.info(f"/init 指令处理完成，耗时: {processing_time:.2f}秒")
            return result

        except Exception as e:
            logger.error(f"处理 /init 指令失败: {e}")
            # 返回错误结果，但不抛出异常
            return InitResult(
                project_type="error",
                ai_environment=None,
                message=f"❌ 处理失败: {str(e)}",
                processing_time=(datetime.now() - start_time).total_seconds()
            )

    async def _detect_project_status(self, project_path: str) -> ProjectStatus:
        """检测项目状态"""
        existing_md_files = []
        project_path_obj = Path(project_path)

        # 检查是否存在CLI工具的MD文档
        cli_tools = list(CLI_CONFIG_MAPPING.keys())

        for cli in cli_tools:
            md_file = project_path_obj / f"{cli}.md"
            if md_file.exists() and md_file.is_file():
                existing_md_files.append(cli)
                logger.debug(f"发现现有文档: {cli}.md")

        is_existing = len(existing_md_files) > 0

        logger.info(f"项目状态检测结果: {'现有项目' if is_existing else '新项目'}")
        logger.info(f"现有MD文档: {existing_md_files}")

        return ProjectStatus(
            is_existing_project=is_existing,
            existing_md_files=existing_md_files,
            total_expected=len(cli_tools),
            project_path=project_path
        )

    async def _enhance_existing_project(self,
                                       project_path: str,
                                       ai_environment: AIEnvironmentInfo) -> InitResult:
        """老项目：增强现有MD文档"""
        enhancement_results = {}
        enhanced_count = 0

        try:
            # 增强所有现有的MD文档（不仅仅是当前CLI的文档）
            for cli_name in ai_environment.available_clis:
                md_path = Path(project_path) / f"{cli_name}.md"

                if md_path.exists():
                    logger.info(f"增强现有文档: {cli_name}.md")

                    try:
                        # 读取现有文档
                        existing_content = await self._read_md_file(md_path)

                        # 生成协作感知内容
                        collaboration_content = await self.md_enhancer.generate_collaboration_section(
                            cli_name, ai_environment, current_cli=self.current_cli
                        )

                        # 增强现有文档
                        enhanced_content = await self.md_enhancer.enhance_existing_md(
                            existing_content, collaboration_content, cli_name
                        )

                        # 写回文件
                        await self._write_md_file(md_path, enhanced_content)

                        # 创建备份（可选）
                        await self._create_backup(md_path, existing_content)

                        enhancement_results[cli_name] = EnhancementResult(
                            enhanced=True,
                            added_collaboration_section=True,
                            original_sections=len(self._count_sections(existing_content)),
                            new_sections=len(self._count_sections(enhanced_content)),
                            enhancement_time=datetime.now()
                        )

                        enhanced_count += 1
                        logger.info(f"成功增强 {cli_name}.md")

                    except Exception as e:
                        logger.error(f"增强文档 {cli_name}.md 失败: {e}")
                        enhancement_results[cli_name] = EnhancementResult(
                            enhanced=False,
                            added_collaboration_section=False,
                            original_sections=0,
                            new_sections=0,
                            enhancement_time=datetime.now()
                        )

            # 生成项目配置文件
            await self._ensure_project_config(project_path, ai_environment)

            message = f"✅ 已增强 {enhanced_count} 个CLI文档的协作感知"
            if enhanced_count < len(ai_environment.available_clis):
                missing_count = len(ai_environment.available_clis) - enhanced_count
                message += f"，{missing_count} 个文档增强失败"

            return InitResult(
                project_type="existing_project",
                enhanced_documents=enhancement_results,
                ai_environment=ai_environment,
                message=message
            )

        except Exception as e:
            logger.error(f"增强现有项目失败: {e}")
            raise

    async def _initialize_new_project(self,
                                     project_path: str,
                                     ai_environment: AIEnvironmentInfo) -> InitResult:
        """新项目：生成完整MD文档"""
        generated_documents = {}
        generated_count = 0

        try:
            # 为每个可用的CLI工具生成完整的MD文档
            for cli_name, cli_info in ai_environment.available_clis.items():
                logger.info(f"生成文档: {cli_name}.md")

                try:
                    # 生成完整MD文档
                    md_content = await self.md_generator.generate_complete_md(
                        cli_name, cli_info, ai_environment, current_cli=self.current_cli
                    )

                    md_path = Path(project_path) / f"{cli_name}.md"
                    await self._write_md_file(md_path, md_content)

                    generated_documents[cli_name] = GeneratedDocument(
                        file_path=str(md_path),
                        sections_count=self._count_sections(md_content),
                        includes_collaboration=True,
                        generation_time=datetime.now()
                    )

                    generated_count += 1
                    logger.info(f"成功生成 {cli_name}.md")

                except Exception as e:
                    logger.error(f"生成文档 {cli_name}.md 失败: {e}")

            # 创建项目配置目录和文件
            await self._create_project_config(project_path, ai_environment)

            # 创建 .ai-cli-project 目录
            await self._create_ai_cli_project_dir(project_path, ai_environment)

            message = f"✅ 已生成 {generated_count} 个完整CLI文档，包含协作感知"
            if generated_count < len(ai_environment.available_clis):
                missing_count = len(ai_environment.available_clis) - generated_count
                message += f"，{missing_count} 个文档生成失败"

            return InitResult(
                project_type="new_project",
                generated_documents=generated_documents,
                ai_environment=ai_environment,
                message=message
            )

        except Exception as e:
            logger.error(f"初始化新项目失败: {e}")
            raise

    async def _read_md_file(self, file_path: Path) -> str:
        """读取MD文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"读取文件失败 {file_path}: {e}")
            raise

    async def _write_md_file(self, file_path: Path, content: str) -> None:
        """写入MD文件"""
        try:
            # 确保目录存在
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

        except Exception as e:
            logger.error(f"写入文件失败 {file_path}: {e}")
            raise

    async def _create_backup(self, file_path: Path, original_content: str) -> None:
        """创建文件备份"""
        try:
            backup_dir = file_path.parent / ".ai-cli-backups"
            backup_dir.mkdir(exist_ok=True)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"{file_path.stem}_{timestamp}{file_path.suffix}"
            backup_path = backup_dir / backup_filename

            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

            logger.debug(f"创建备份: {backup_path}")

        except Exception as e:
            logger.warning(f"创建备份失败: {e}")

    def _count_sections(self, content: str) -> int:
        """统计文档中的章节数量"""
        sections = []
        lines = content.split('\n')

        for line in lines:
            if line.strip().startswith('#'):
                sections.append(line.strip())

        return len(sections)

    async def _ensure_project_config(self, project_path: str, ai_environment: AIEnvironmentInfo) -> None:
        """确保项目配置文件存在"""
        try:
            config_dir = Path(project_path) / ".ai-cli-project"
            config_dir.mkdir(exist_ok=True)

            # 创建基础项目配置
            config_file = config_dir / "project-config.json"
            if not config_file.exists():
                import json
                project_config = {
                    "project_type": "enhanced_existing",
                    "last_update": datetime.now().isoformat(),
                    "available_tools": list(ai_environment.available_clis.keys()),
                    "current_cli": self.current_cli,
                    "collaboration_enabled": True,
                    "auto_scan": True
                }

                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(project_config, f, indent=2, ensure_ascii=False)

                logger.info(f"创建项目配置文件: {config_file}")

        except Exception as e:
            logger.warning(f"创建项目配置失败: {e}")

    async def _create_project_config(self, project_path: str, ai_environment: AIEnvironmentInfo) -> None:
        """为新项目创建配置文件"""
        try:
            config_dir = Path(project_path) / ".ai-cli-project"
            config_dir.mkdir(exist_ok=True)

            # 创建项目配置文件
            import json
            project_config = {
                "project_type": "new_initialized",
                "created_at": datetime.now().isoformat(),
                "last_update": datetime.now().isoformat(),
                "initiated_by": self.current_cli,
                "available_tools": {
                    cli_name: {
                        "name": cli_info.display_name,
                        "version": cli_info.version,
                        "status": cli_info.status.value,
                        "enabled": True
                    }
                    for cli_name, cli_info in ai_environment.available_clis.items()
                },
                "collaboration": {
                    "enabled": True,
                    "auto_detect": True,
                    "protocols": ai_environment.collaboration_guide.protocols
                },
                "preferences": {
                    "primary_tool": self.current_cli,
                    "language": "mixed",  # 支持中英文混合
                    "auto_backup": True
                }
            }

            config_file = config_dir / "project-config.json"
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(project_config, f, indent=2, ensure_ascii=False)

            logger.info(f"创建新项目配置文件: {config_file}")

        except Exception as e:
            logger.warning(f"创建新项目配置失败: {e}")

    async def _create_ai_cli_project_dir(self, project_path: str, ai_environment: AIEnvironmentInfo) -> None:
        """创建 .ai-cli-project 目录结构"""
        try:
            ai_cli_dir = Path(project_path) / ".ai-cli-project"
            ai_cli_dir.mkdir(exist_ok=True)

            # 创建子目录
            subdirs = ["logs", "backups", "cache", "templates"]
            for subdir in subdirs:
                (ai_cli_dir / subdir).mkdir(exist_ok=True)

            # 创建 .gitignore
            gitignore_path = ai_cli_dir / ".gitignore"
            if not gitignore_path.exists():
                gitignore_content = """# AI CLI Router generated files
logs/
backups/
cache/
*.log
*.tmp
.DS_Store
"""
                with open(gitignore_path, 'w', encoding='utf-8') as f:
                    f.write(gitignore_content)

            # 创建 README.md
            readme_path = ai_cli_dir / "README.md"
            if not readme_path.exists():
                readme_content = f"""# AI CLI Router 项目配置

此目录包含 AI CLI Router 的项目特定配置文件。

## 📁 目录结构

- `project-config.json` - 项目AI配置
- `logs/` - AI CLI操作日志
- `backups/` - 配置文件备份
- `cache/` - 临时缓存文件
- `templates/` - 自定义模板

## 🤖 可用AI工具

{chr(10).join(f"- **{info.display_name}** v{info.version}" for info in ai_environment.available_clis.values())}

## 📅 初始化信息

- 初始化时间: {ai_environment.generated_at.strftime('%Y-%m-%d %H:%M:%S')}
- 初始化工具: {self.current_cli}
- 扫描耗时: {ai_environment.scan_duration:.2f}秒

## 🔧 配置管理

使用以下命令管理项目配置:
```bash
# 更新AI环境扫描
ai-cli-router scan

# 验证项目配置
ai-cli-router check-project

# 重置项目配置
ai-cli-router reset --project
```

---
*此目录由 AI CLI Router 自动生成和管理*
"""
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(readme_content)

            logger.info(f"创建 .ai-cli-project 目录结构: {ai_cli_dir}")

        except Exception as e:
            logger.warning(f"创建 .ai-cli-project 目录失败: {e}")