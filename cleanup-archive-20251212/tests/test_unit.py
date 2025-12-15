import unittest
import tempfile
import os
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

# 添加项目源码到路径
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from cli_collaboration_agent import ProjectContext, CLICollaborationAgent


class TestProjectContext(unittest.TestCase):
    """测试项目背景管理器"""

    def setUp(self):
        """为每个测试创建临时目录"""
        self.temp_dir = tempfile.mkdtemp()
        self.project_path = Path(self.temp_dir)
        self.context = ProjectContext(project_path=self.project_path)

    def tearDown(self):
        """清理临时目录"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_initialization_creates_default_context(self):
        """测试初始化创建默认背景"""
        self.assertEqual(self.context.data["project_name"], "Collaboration Project")
        self.assertEqual(self.context.data["status"], "active")
        self.assertIn("tasks", self.context.data)
        self.assertIn("collaboration_history", self.context.data)

    def test_save_and_load_context(self):
        """测试保存和加载背景"""
        # 修改数据
        self.context.data["test_value"] = "test"
        self.context._save_context()

        # 创建新实例验证数据持久化
        new_context = ProjectContext(project_path=self.project_path)
        self.assertEqual(new_context.data["test_value"], "test")

    def test_add_collaboration_log(self):
        """测试添加协作日志"""
        initial_count = len(self.context.data["collaboration_history"])
        self.context.add_collaboration_log("Test message", "test_agent")
        
        self.assertEqual(len(self.context.data["collaboration_history"]), initial_count + 1)
        log_entry = self.context.data["collaboration_history"][-1]
        self.assertEqual(log_entry["message"], "Test message")
        self.assertEqual(log_entry["agent"], "test_agent")

    def test_create_and_update_task(self):
        """测试创建和更新任务"""
        task_id = self.context.create_task("test_type", "Test description", "test_agent")
        
        self.assertIn(task_id, self.context.data["tasks"])
        self.assertEqual(self.context.data["tasks"][task_id]["description"], "Test description")
        self.assertEqual(self.context.data["tasks"][task_id]["status"], "pending")
        
        # 测试更新任务状态
        self.context.update_task_status(task_id, "completed", "Result", "test_agent")
        self.assertEqual(self.context.data["tasks"][task_id]["status"], "completed")
        self.assertEqual(self.context.data["tasks"][task_id]["result"], "Result")

    def test_analyze_context_for_next_action(self):
        """测试分析背景以决定下一步行动"""
        # 首先测试智能体能找到分配给自己的任务
        assigned_task_id = self.context.create_task("test_type", "test for claude analyze", "claude")
        
        # 测试智能体能否找到分配给自己的任务
        found_task_id, found_task = self.context.analyze_context_for_next_action("claude")
        self.assertEqual(found_task_id, assigned_task_id)
        self.assertEqual(found_task["description"], "test for claude analyze")

        # 完成已分配的任务
        self.context.update_task_status(assigned_task_id, "completed", "Completed", "claude")
        
        # 现在测试智能体认领未分配但适合它的任务
        unassigned_task_id = self.context.create_task("test_type", "test claude logic reasoning", None)
        
        # 智能体应该能找到未分配的任务
        found_task_id, found_task = self.context.analyze_context_for_next_action("claude")
        self.assertIsNotNone(found_task_id)
        self.assertEqual(self.context.data["tasks"][found_task_id]["description"], "test claude logic reasoning")


class TestCLICollaborationAgent(unittest.TestCase):
    """测试CLI协作智能体"""

    def setUp(self):
        """为每个测试创建临时目录"""
        self.temp_dir = tempfile.mkdtemp()
        self.project_path = Path(self.temp_dir)
        self.agent = CLICollaborationAgent("claude", project_path=self.project_path)

    def tearDown(self):
        """清理临时目录"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_agent_initialization(self):
        """测试智能体初始化"""
        self.assertEqual(self.agent.agent_name, "claude")
        self.assertEqual(self.agent.cli_command, "claude")

    @patch('subprocess.run')
    def test_execute_command_success(self, mock_subprocess):
        """测试命令执行成功"""
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "Success output"
        mock_result.stderr = ""
        mock_subprocess.return_value = mock_result

        success, stdout, stderr = self.agent.execute_command(["test"])
        
        self.assertTrue(success)
        self.assertEqual(stdout, "Success output")
        self.assertEqual(stderr, "")

    @patch('subprocess.run')
    def test_execute_command_failure(self, mock_subprocess):
        """测试命令执行失败"""
        mock_result = MagicMock()
        mock_result.returncode = 1
        mock_result.stdout = ""
        mock_result.stderr = "Error output"
        mock_subprocess.return_value = mock_result

        success, stdout, stderr = self.agent.execute_command(["test"])
        
        self.assertFalse(success)
        self.assertEqual(stderr, "Error output")

    def test_can_handle_task(self):
        """测试任务处理能力判断"""
        task1 = {"description": "analyze the data and provide insights"}
        self.assertTrue(self.agent.project_context._can_handle_task(task1, "claude"))

        task2 = {"description": "translate the document"}
        self.assertFalse(self.agent.project_context._can_handle_task(task2, "claude"))  # claude不适合翻译
        self.assertTrue(self.agent.project_context._can_handle_task(task2, "gemini"))   # gemini适合翻译


if __name__ == '__main__':
    unittest.main()