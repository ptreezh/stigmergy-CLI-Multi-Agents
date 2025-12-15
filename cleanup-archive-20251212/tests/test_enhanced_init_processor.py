"""
测试增强的初始化处理器
"""
import pytest
import asyncio
import tempfile
import json
from pathlib import Path
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock

from src.core.enhanced_init_processor import EnhancedInitProcessor
from src.core.ai_environment_scanner import AIEnvironmentScanner
from src.core.models import (
    CLIInfo, AIEnvironmentInfo, CollaborationGuide, CLIStatus, IntegrationType
)


class TestEnhancedInitProcessor:
    """增强初始化处理器测试"""

    @pytest.fixture
    def processor(self):
        """创建处理器实例"""
        return EnhancedInitProcessor("claude")

    @pytest.fixture
    def temp_project_dir(self):
        """创建临时项目目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield Path(temp_dir)

    @pytest.fixture
    def mock_ai_environment(self):
        """模拟AI环境信息"""
        cli_info = CLIInfo(
            name="claude",
            display_name="Claude CLI",
            version="2.0.1",
            integration_type=IntegrationType.HOOK_SYSTEM,
            status=CLIStatus.AVAILABLE,
            capabilities=["智能分析", "跨CLI协调"],
            config_file="~/.config/claude/hooks.json",
            global_doc="claude.md"
        )

        collaboration_guide = CollaborationGuide(
            current_cli="claude",
            available_peers={},
            protocols={
                "chinese": ["请用{cli}帮我{task}"],
                "english": ["use {cli} to {task}"]
            }
        )

        return AIEnvironmentInfo(
            available_clis={"claude": cli_info},
            project_specific_clis={},
            collaboration_guide=collaboration_guide,
            generated_at=datetime.now(),
            scan_duration=0.5
        )

    @pytest.mark.asyncio
    async def test_detect_project_status_new_project(self, processor, temp_project_dir):
        """测试新项目状态检测"""
        # 空目录应该是新项目
        status = await processor._detect_project_status(str(temp_project_dir))

        assert status.is_existing_project is False
        assert len(status.existing_md_files) == 0
        assert status.total_expected > 0

    @pytest.mark.asyncio
    async def test_detect_project_status_existing_project(self, processor, temp_project_dir):
        """测试现有项目状态检测"""
        # 创建一些MD文件
        (temp_project_dir / "claude.md").write_text("# Claude CLI配置")
        (temp_project_dir / "gemini.md").write_text("# Gemini CLI配置")

        status = await processor._detect_project_status(str(temp_project_dir))

        assert status.is_existing_project is True
        assert "claude" in status.existing_md_files
        assert "gemini" in status.existing_md_files
        assert len(status.existing_md_files) == 2

    @pytest.mark.asyncio
    async def test_enhance_existing_project(self, processor, temp_project_dir, mock_ai_environment):
        """测试增强现有项目"""
        # 创建现有MD文件
        existing_content = """# Claude CLI配置

## 基本信息
这是一个Claude CLI配置文件。
"""
        md_file = temp_project_dir / "claude.md"
        md_file.write_text(existing_content)

        # 模拟AI环境扫描
        with patch.object(processor.ai_environment_scanner, 'scan_ai_environment') as mock_scan:
            mock_scan.return_value = mock_ai_environment

            result = await processor._enhance_existing_project(str(temp_project_dir), mock_ai_environment)

        assert result.project_type == "existing_project"
        assert len(result.enhanced_documents) > 0
        assert "claude" in result.enhanced_documents
        assert result.enhanced_documents["claude"].enhanced is True

        # 检查文件是否被更新
        updated_content = md_file.read_text()
        assert "协作指南" in updated_content
        assert len(updated_content) > len(existing_content)

    @pytest.mark.asyncio
    async def test_initialize_new_project(self, processor, temp_project_dir, mock_ai_environment):
        """测试初始化新项目"""
        # 模拟AI环境扫描
        with patch.object(processor.ai_environment_scanner, 'scan_ai_environment') as mock_scan:
            mock_scan.return_value = mock_ai_environment

            result = await processor._initialize_new_project(str(temp_project_dir), mock_ai_environment)

        assert result.project_type == "new_project"
        assert len(result.generated_documents) > 0

        # 检查生成的文件
        md_file = temp_project_dir / "claude.md"
        assert md_file.exists()
        content = md_file.read_text()
        assert "Claude CLI 项目配置" in content
        assert "协作指南" in content

        # 检查项目配置目录
        config_dir = temp_project_dir / ".ai-cli-project"
        assert config_dir.exists()
        assert (config_dir / "project-config.json").exists()
        assert (config_dir / "README.md").exists()

    @pytest.mark.asyncio
    async def test_process_init_command_new_project(self, processor, temp_project_dir):
        """测试处理新项目的初始化命令"""
        with patch.object(processor, '_detect_project_status') as mock_detect, \
             patch.object(processor.ai_environment_scanner, 'scan_ai_environment') as mock_scan, \
             patch.object(processor, '_initialize_new_project') as mock_init:

            # 设置模拟返回值
            mock_detect.return_value = AsyncMock(
                is_existing_project=False,
                existing_md_files=[],
                total_expected=8
            )

            mock_scan.return_value = Mock(
                available_clis={"claude": Mock()},
                collaboration_guide=Mock(protocols={}),
                generated_at=datetime.now(),
                scan_duration=0.5
            )

            mock_result = Mock(
                project_type="new_project",
                generated_documents={"claude": Mock()},
                message="✅ 项目初始化完成"
            )
            mock_init.return_value = mock_result

            result = await processor.process_init_command(str(temp_project_dir))

            assert result.project_type == "new_project"
            assert "项目初始化完成" in result.message
            mock_detect.assert_called_once()
            mock_scan.assert_called_once()
            mock_init.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_init_command_existing_project(self, processor, temp_project_dir):
        """测试处理现有项目的初始化命令"""
        # 创建现有文件
        (temp_project_dir / "claude.md").write_text("# 现有配置")

        with patch.object(processor, '_detect_project_status') as mock_detect, \
             patch.object(processor.ai_environment_scanner, 'scan_ai_environment') as mock_scan, \
             patch.object(processor, '_enhance_existing_project') as mock_enhance:

            # 设置模拟返回值
            mock_detect.return_value = AsyncMock(
                is_existing_project=True,
                existing_md_files=["claude"],
                total_expected=8
            )

            mock_scan.return_value = Mock(
                available_clis={"claude": Mock()},
                collaboration_guide=Mock(protocols={}),
                generated_at=datetime.now(),
                scan_duration=0.3
            )

            mock_result = Mock(
                project_type="existing_project",
                enhanced_documents={"claude": Mock(enhanced=True)},
                message="✅ 项目增强完成"
            )
            mock_enhance.return_value = mock_result

            result = await processor.process_init_command(str(temp_project_dir))

            assert result.project_type == "existing_project"
            assert "项目增强完成" in result.message
            mock_detect.assert_called_once()
            mock_scan.assert_called_once()
            mock_enhance.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_init_command_error_handling(self, processor, temp_project_dir):
        """测试错误处理"""
        with patch.object(processor.ai_environment_scanner, 'scan_ai_environment') as mock_scan:
            mock_scan.side_effect = Exception("扫描失败")

            result = await processor.process_init_command(str(temp_project_dir))

            assert result.project_type == "error"
            assert "处理失败" in result.message
            assert "扫描失败" in result.message

    def test_count_sections(self, processor):
        """测试章节数量统计"""
        content = """# 主标题

## 章节1

内容1

### 子章节1.1

子内容

## 章节2

内容2
"""
        count = processor._count_sections(content)
        assert count == 4  # 主标题、章节1、子章节1.1、章节2

    def test_get_processor_caching(self, processor):
        """测试处理器实例缓存"""
        # 第一次调用应该创建新实例
        processor1 = processor._get_processor("gemini")
        assert isinstance(processor1, EnhancedInitProcessor)
        assert processor1.current_cli == "gemini"

        # 第二次调用应该返回缓存的实例
        processor2 = processor._get_processor("gemini")
        assert processor1 is processor2

        # 不同CLI应该创建不同实例
        processor3 = processor._get_processor("qwen")
        assert processor3.current_cli == "qwen"
        assert processor1 is not processor3

    @pytest.mark.asyncio
    async def test_read_write_md_file(self, processor, temp_project_dir):
        """测试MD文件读写"""
        test_content = "# 测试内容\n\n这是测试内容。"
        test_file = temp_project_dir / "test.md"

        # 写入文件
        await processor._write_md_file(test_file, test_content)
        assert test_file.exists()

        # 读取文件
        read_content = await processor._read_md_file(test_file)
        assert read_content == test_content

    @pytest.mark.asyncio
    async def test_create_backup(self, processor, temp_project_dir):
        """测试备份创建"""
        original_content = "# 原始内容"
        md_file = temp_project_dir / "test.md"
        md_file.write_text(original_content)

        # 创建备份
        await processor._create_backup(md_file, original_content)

        # 检查备份目录和文件
        backup_dir = temp_project_dir / ".ai-cli-backups"
        assert backup_dir.exists()

        backup_files = list(backup_dir.glob("test_*.md"))
        assert len(backup_files) > 0

        # 检查备份内容
        backup_content = backup_files[0].read_text()
        assert backup_content == original_content


if __name__ == "__main__":
    pytest.main([__file__])