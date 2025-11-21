import unittest
import tempfile
import os
import json
import threading
import time
from pathlib import Path
from unittest.mock import patch, MagicMock

# 添加项目源码到路径
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from cli_collaboration_agent import ProjectContext, CLICollaborationAgent


class TestAutomatedInteraction(unittest.TestCase):
    """测试自动化交互模拟"""

    def setUp(self):
        """为每个测试创建临时目录"""
        self.temp_dir = tempfile.mkdtemp()
        self.project_path = Path(self.temp_dir)

    def tearDown(self):
        """清理临时目录"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    @patch('subprocess.run')
    def test_concurrent_agents_interaction(self, mock_subprocess):
        """测试并发智能体交互"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            agent_name = [part for part in cmd if isinstance(part, str) and part in ["claude", "gemini", "codebuddy"]][0] if isinstance(cmd, list) else "unknown"
            
            if agent_name == "claude":
                mock_result.stdout = "分析完成: 识别出系统性能瓶颈在数据库查询"
            elif agent_name == "gemini":
                mock_result.stdout = "翻译完成: 英文文档已翻译为中文"
            elif agent_name == "codebuddy":
                mock_result.stdout = "优化完成: 数据库查询性能提升30%"
            else:
                mock_result.stdout = "Task completed"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        # 创建共享背景
        context = ProjectContext(project_path=self.project_path)

        # 并发运行多个智能体
        def run_agent(agent_name, task_description):
            agent = CLICollaborationAgent(agent_name, project_path=self.project_path)
            
            # 创建任务
            context.create_task("auto_test", task_description, agent_name)
            
            # 处理任务
            return agent.work_on_context()

        # 启动多个线程模拟并发操作
        threads = []
        results = {}
        
        # 为每个线程创建独立的结果存储
        thread_results = {}
        
        def worker(agent_name, task_desc, result_key):
            thread_results[result_key] = run_agent(agent_name, task_desc)
        
        # 创建并发线程
        thread1 = threading.Thread(target=worker, args=("claude", "分析系统性能", "claude_result"))
        thread2 = threading.Thread(target=worker, args=("gemini", "翻译文档", "gemini_result"))
        thread3 = threading.Thread(target=worker, args=("codebuddy", "优化代码", "codebuddy_result"))
        
        threads = [thread1, thread2, thread3]
        
        # 启动所有线程
        for thread in threads:
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
        
        # 验证所有智能体都成功完成任务
        self.assertTrue(thread_results.get("claude_result", False))
        self.assertTrue(thread_results.get("gemini_result", False))
        self.assertTrue(thread_results.get("codebuddy_result", False))

        # 验证背景在并发访问后仍保持一致性
        self.assertEqual(context.data["status"], "active")

    @patch('subprocess.run')
    def test_user_interaction_simulation(self, mock_subprocess):
        """测试用户交互模拟"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            mock_result.stdout = f"Processed: {' '.join(cmd) if isinstance(cmd, list) else str(cmd)}"
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 模拟用户添加不同类型的任务
        user_requests = [
            ("claude", "帮我分析这份销售报告", "analysis"),
            ("gemini", "把这份文档翻译成英文", "translation"),
            ("codebuddy", "审查这段代码有什么问题", "code_review"),
            ("kimi", "写一篇关于AI发展趋势的文章", "content_creation")
        ]

        agents = {
            "claude": CLICollaborationAgent("claude", project_path=self.project_path),
            "gemini": CLICollaborationAgent("gemini", project_path=self.project_path),
            "codebuddy": CLICollaborationAgent("codebuddy", project_path=self.project_path),
            "kimi": CLICollaborationAgent("kimi", project_path=self.project_path)
        }

        # 模拟用户请求
        for agent_name, task_desc, task_type in user_requests:
            # 用户创建任务
            context.create_task(task_type, task_desc, agent_name)
            
            # 对应智能体处理任务
            agent = agents[agent_name]
            success = agent.work_on_context()
            self.assertTrue(success)

        # 验证所有用户请求都被处理
        self.assertEqual(len(context.data["tasks"]), len(user_requests))
        for task_id, task in context.data["tasks"].items():
            self.assertEqual(task["status"], "completed")

    @patch('subprocess.run')
    def test_dynamic_task_generation_interaction(self, mock_subprocess):
        """测试动态任务生成交互"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            
            if 'code' in str(cmd).lower():
                mock_result.stdout = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 测试代码
print(fibonacci(10))
"""
            elif 'test' in str(cmd).lower():
                mock_result.stdout = """
import unittest

def test_fibonacci():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1
    assert fibonacci(10) == 55

test_fibonacci()
print("All tests passed!")
"""
            else:
                mock_result.stdout = "Processing completed"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 初始任务：生成斐波那契函数
        code_task = context.create_task("code_generation", "生成斐波那契数列函数", "codebuddy")
        
        # CodeBuddy处理编码任务
        codebuddy_agent = CLICollaborationAgent("codebuddy", project_path=self.project_path)
        code_success = codebuddy_agent.work_on_context()
        self.assertTrue(code_success)

        # 验证是否创建了后续的测试任务
        test_tasks = [task for task_id, task in context.data["tasks"].items() 
                     if task["type"] == "testing"]
        
        if test_tasks:
            # Test agent处理测试任务
            test_agent = CLICollaborationAgent("codebuddy", project_path=self.project_path)
            test_success = test_agent.work_on_context()
            self.assertTrue(test_success)

        # 验证整个动态任务生成流程
        self.assertEqual(context.data["tasks"][code_task]["status"], "completed")

    @patch('subprocess.run')
    def test_error_recovery_interaction(self, mock_subprocess):
        """测试错误恢复交互"""
        call_count = 0
        
        def mock_side_effect(cmd, **kwargs):
            nonlocal call_count
            call_count += 1
            mock_result = MagicMock()
            
            if call_count == 1:  # 第一次调用失败
                mock_result.returncode = 1
                mock_result.stdout = ""
                mock_result.stderr = "Error: Invalid input parameters"
            else:  # 后续调用成功
                mock_result.returncode = 0
                mock_result.stdout = "Success after retry"
                mock_result.stderr = ""
            
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 创建任务
        task_id = context.create_task("retry_test", "Test with potential error", "claude")
        
        # Claude处理任务（第一次会失败）
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        first_attempt = claude_agent.work_on_context()
        
        # 模拟手动重试或重新分配
        context.update_task_status(task_id, "pending", completed_by=None)
        second_attempt = claude_agent.work_on_context()
        
        # 验证最终成功
        self.assertTrue(second_attempt)
        self.assertEqual(context.data["tasks"][task_id]["status"], "completed")

    @patch('subprocess.run')
    def test_complex_workflow_interaction(self, mock_subprocess):
        """测试复杂工作流交互"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            
            cmd_str = ' '.join(cmd) if isinstance(cmd, list) else str(cmd)
            
            if 'analyze' in cmd_str.lower():
                mock_result.stdout = """
市场分析报告：
- 目标用户：25-35岁专业人士
- 主要需求：效率工具、协作功能
- 竞争对手分析完成
- 建议功能列表：任务管理、日历集成、团队协作
"""
            elif 'design' in cmd_str.lower():
                mock_result.stdout = """
UI设计方案：
- 简洁现代风格
- 深色/浅色主题切换
- 响应式布局
- 用户体验流程图：
  1. 登录/注册
  2. 任务创建
  3. 团队协作
  4. 进度跟踪
"""
            elif 'implement' in cmd_str.lower():
                mock_result.stdout = """
class TaskManager:
    def __init__(self):
        self.tasks = []
    
    def add_task(self, title, assignee):
        task = {"title": title, "assignee": assignee, "status": "pending"}
        self.tasks.append(task)
    
    def update_status(self, task_id, status):
        self.tasks[task_id]["status"] = status
"""
            elif 'test' in cmd_str.lower():
                mock_result.stdout = """
测试结果：
✅ 所有单元测试通过
✅ 集成测试通过率：95%
✅ 性能测试达标
✅ 用户体验测试反馈良好
"""
            elif 'document' in cmd_str.lower():
                mock_result.stdout = """
# TaskManager API 文档

## 类：TaskManager
功能：管理任务和团队协作

### 方法：
- add_task(title, assignee): 添加新任务
- update_status(task_id, status): 更新任务状态
"""
            else:
                mock_result.stdout = "Task completed successfully"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 模拟复杂项目工作流
        agents = {
            "analyst": CLICollaborationAgent("claude", project_path=self.project_path),
            "designer": CLICollaborationAgent("gemini", project_path=self.project_path),
            "developer": CLICollaborationAgent("codebuddy", project_path=self.project_path),
            "tester": CLICollaborationAgent("qodercli", project_path=self.project_path),
            "technical_writer": CLICollaborationAgent("gemini", project_path=self.project_path)
        }

        # 1. 需求分析
        context.create_task("market_analysis", "分析目标市场和用户需求", "claude")
        analysis_success = agents["analyst"].work_on_context()
        self.assertTrue(analysis_success)

        # 2. UI设计
        context.create_task("ui_design", "设计应用程序UI", "gemini")
        design_success = agents["designer"].work_on_context()
        self.assertTrue(design_success)

        # 3. 开发实现
        context.create_task("development", "实现任务管理功能", "codebuddy")
        dev_success = agents["developer"].work_on_context()
        self.assertTrue(dev_success)

        # 4. 测试验证
        context.create_task("testing", "测试应用程序功能", "qodercli")
        test_success = agents["tester"].work_on_context()
        self.assertTrue(test_success)

        # 5. 文档编写
        context.create_task("documentation", "编写API文档", "gemini")
        doc_success = agents["technical_writer"].work_on_context()
        self.assertTrue(doc_success)

        # 验证整个复杂工作流
        completed_tasks = [task for task_id, task in context.data["tasks"].items() 
                          if task["status"] == "completed"]
        self.assertEqual(len(completed_tasks), 5)

    def test_background_consistency_under_load(self, mock_subprocess=None):
        """测试负载下的背景一致性（不使用patch装饰器，因为需要在方法内处理）"""
        with patch('subprocess.run') as mock_subprocess:
            def mock_side_effect(cmd, **kwargs):
                mock_result = MagicMock()
                mock_result.returncode = 0
                mock_result.stdout = f"Processed by: {' '.join(cmd) if isinstance(cmd, list) else str(cmd)}"
                mock_result.stderr = ""
                return mock_result

            mock_subprocess.side_effect = mock_side_effect

            # 创建多个并发访问的背景实例
            contexts = []
            for i in range(3):
                temp_dir = tempfile.mkdtemp()
                contexts.append(ProjectContext(project_path=Path(temp_dir)))

            # 模拟并发更新
            def update_context(ctx, agent_name, task_desc):
                task_id = ctx.create_task("load_test", f"{task_desc} by {agent_name}", agent_name)
                time.sleep(0.1)  # 模拟处理时间
                ctx.update_task_status(task_id, "completed", f"Result from {agent_name}", agent_name)
                # 小延迟确保其他线程有机会访问
                time.sleep(0.05)

            threads = []
            for i, ctx in enumerate(contexts):
                thread = threading.Thread(target=update_context, 
                                        args=(ctx, f"agent_{i}", f"Task for agent {i}"))
                threads.append(thread)

            for thread in threads:
                thread.start()

            for thread in threads:
                thread.join()

            # 验证所有背景都保持一致性
            for ctx in contexts:
                completed_tasks = [task for task_id, task in ctx.data["tasks"].items() 
                                 if task["status"] == "completed"]
                self.assertTrue(len(completed_tasks) >= 1)
                
                # 清理临时目录
                import shutil
                shutil.rmtree(ctx.project_path, ignore_errors=True)


if __name__ == '__main__':
    unittest.main()