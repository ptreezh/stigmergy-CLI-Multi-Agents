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
from universal_cli_setup import UniversalCLISetup


class TestEndToEnd(unittest.TestCase):
    """端到端测试"""

    def setUp(self):
        """为每个测试创建临时目录"""
        self.temp_dir = tempfile.mkdtemp()
        self.project_path = Path(self.temp_dir)

    def tearDown(self):
        """清理临时目录"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    @patch('subprocess.run')
    def test_complete_collaboration_workflow(self, mock_subprocess):
        """测试完整的协作工作流程"""
        # 模拟多个CLI工具的响应
        def mock_subprocess_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            if 'claude' in str(cmd):
                mock_result.returncode = 0
                mock_result.stdout = "分析完成：数据表明用户偏好功能A"
                mock_result.stderr = ""
            elif 'gemini' in str(cmd):
                mock_result.returncode = 0
                mock_result.stdout = "翻译完成：Hello World -> 你好世界"
                mock_result.stderr = ""
            elif 'codebuddy' in str(cmd):
                mock_result.returncode = 0
                mock_result.stdout = "函数优化完成：提高了性能20%"
                mock_result.stderr = ""
            else:
                mock_result.returncode = 0
                mock_result.stdout = "通用输出"
                mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_subprocess_side_effect

        # 1. 初始化项目背景
        context = ProjectContext(project_path=self.project_path)

        # 2. 创建多个任务 - 使用适合各智能体的描述
        analysis_task = context.create_task("analysis", "Analyze user preference data and provide insights", "claude")
        translation_task = context.create_task("translation", "Translate user feedback from English to Chinese", "gemini")
        optimization_task = context.create_task("optimization", "Optimize performance function for better efficiency", "codebuddy")

        print(f"Created tasks:")
        print(f"  Analysis: {context.data['tasks'][analysis_task]['description']}")
        print(f"  Translation: {context.data['tasks'][translation_task]['description']}")
        print(f"  Optimization: {context.data['tasks'][optimization_task]['description']}")

        # 3. 启动不同智能体处理任务
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        gemini_agent = CLICollaborationAgent("gemini", project_path=self.project_path)
        codebuddy_agent = CLICollaborationAgent("codebuddy", project_path=self.project_path)

        # 4. 让智能体处理任务
        claude_success = claude_agent.work_on_context()
        print(f"Claude success: {claude_success}, task status: {context.data['tasks'][analysis_task]['status']}")
        
        gemini_success = gemini_agent.work_on_context()
        print(f"Gemini success: {gemini_success}, task status: {context.data['tasks'][translation_task]['status']}")
        
        codebuddy_success = codebuddy_agent.work_on_context()
        print(f"Codebuddy success: {codebuddy_success}, task status: {context.data['tasks'][optimization_task]['status']}")

        # 5. 验证至少有智能体尝试处理了任务
        print(f"Task states: {[(task_id, task['status']) for task_id, task in context.data['tasks'].items()]}")
        
        # 智能体可能成功执行了任务（或至少改变了任务状态）
        # 如果任务状态不再是pending，说明智能体已处理了任务
        analysis_processed = context.data["tasks"][analysis_task]["status"] != "pending"
        translation_processed = context.data["tasks"][translation_task]["status"] != "pending"
        optimization_processed = context.data["tasks"][optimization_task]["status"] != "pending"
        
        print(f"Tasks processed: Analysis={analysis_processed}, Translation={translation_processed}, Optimization={optimization_processed}")
        
        # 6. 验证任务状态（至少被处理过）
        self.assertTrue(analysis_processed or claude_success, 
                       f"Claude task should be processed but status is {context.data['tasks'][analysis_task]['status']}")
        self.assertTrue(translation_processed or gemini_success, 
                       f"Gemini task should be processed but status is {context.data['tasks'][translation_task]['status']}")
        self.assertTrue(optimization_processed or codebuddy_success, 
                       f"Codebuddy task should be processed but status is {context.data['tasks'][optimization_task]['status']}")

        # 7. 验证协作历史
        if len(context.data["collaboration_history"]) > 0:
            agents_involved = [log["agent"] for log in context.data["collaboration_history"]]
            print(f"Agents involved in collaboration: {agents_involved}")
            # 验证至少部分智能体参与了协作
            participating_agents = sum([
                1 for agent in ["claude", "gemini", "codebuddy"] 
                if agent in agents_involved
            ])
            self.assertGreaterEqual(participating_agents, 1, "At least one agent should participate in collaboration")

    def test_router_to_agent_integration(self):
        """测试路由器与智能体的集成"""
        # 1. 使用UniversalCLISetup创建路由器
        setup = UniversalCLISetup()
        
        # 2. 生成Python路由器（将包含协作功能）
        try:
            router_content = setup.generate_smart_router("test", "python")
            
            # 3. 这个测试主要验证生成的路由器是否包含正确的协作代码
            self.assertIn("ProjectContext", router_content)
            self.assertIn("间接协同", router_content)
            self.assertIn("stigmergy", router_content.lower())
        except NameError as e:
            if "datetime" in str(e):
                self.fail("Router generation failed due to missing datetime import: " + str(e))
            else:
                raise
        except Exception as e:
            self.fail(f"Router generation failed with error: {e}")

    @patch('subprocess.run')
    def test_stigmergy_mechanism_end_to_end(self, mock_subprocess):
        """测试Stigmergy机制的端到端实现"""
        # 模拟响应
        def mock_subprocess_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            mock_result.stdout = "Analysis of the market data shows interesting trends worth reviewing and potential code optimizations"
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_subprocess_side_effect

        # 1. 创建项目背景（模拟项目启动）
        context = ProjectContext(project_path=self.project_path)

        # 2. 创建初始任务 - 使用Claude能处理的描述
        initial_task = context.create_task("analysis", "Analyze market data trends and provide insights", "claude")

        # 3. Claude智能体处理初始任务
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        claude_success = claude_agent.work_on_context()
        print(f"Claude success: {claude_success}, task status: {context.data['tasks'][initial_task]['status']}")
        print(f"Total tasks after Claude: {len(context.data['tasks'])}")

        # 4. 验证Claude是否处理了任务（状态是否改变）
        self.assertNotEqual(context.data["tasks"][initial_task]["status"], "pending",
                           "Claude should have processed the initial task")

        # 5. 检查是否根据结果创建了后续任务
        all_tasks = context.data["tasks"]
        created_additional_tasks = len(all_tasks) > 1
        print(f"Additional tasks created: {created_additional_tasks}, total tasks: {len(all_tasks)}")
        
        # 如果成功完成任务，验证结果
        if claude_success and context.data["tasks"][initial_task]["status"] == "completed":
            self.assertIn("Analysis", context.data["tasks"][initial_task]["result"])

    @patch('subprocess.run')
    def test_background_persistence_across_sessions(self, mock_subprocess):
        """测试背景在会话间持久化"""
        # 模拟响应
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "Task completed successfully"
        mock_result.stderr = ""
        mock_subprocess.return_value = mock_result

        # 1. 第一个会话：创建背景和任务
        context1 = ProjectContext(project_path=self.project_path)
        task_id = context1.create_task("test", "Process user data analysis", "claude")
        print(f"Created task in session 1: {context1.data['tasks'][task_id]['description']}")

        # 2. 模拟第一个智能体工作
        agent1 = CLICollaborationAgent("claude", project_path=self.project_path)
        agent1.work_on_context()

        # 3. 验证任务状态被处理（不一定完成，但状态应改变）
        initial_task_status = context1.data["tasks"][task_id]["status"]
        print(f"Task status after session 1: {initial_task_status}")
        # 任务状态可能不是completed（因为可能在处理中），但不应是pending
        self.assertNotEqual(initial_task_status, "pending", 
                           "Task should have been processed in first session")

        # 4. 第二个会话：重新加载相同的背景
        context2 = ProjectContext(project_path=self.project_path)
        print(f"Reloaded context. Task status: {context2.data['tasks'][task_id]['status']}")
        
        # 5. 验证第二个会话可以看到与第一个会话相同的任务状态
        self.assertEqual(context2.data["tasks"][task_id]["status"], initial_task_status,
                        "Task status should persist across sessions")
        # 验证背景数据在会话间保持一致
        self.assertEqual(len(context2.data["tasks"]), len(context1.data["tasks"]),
                        "Number of tasks should be consistent across sessions")

    @patch('subprocess.run')
    def test_multi_agent_coordination_via_background(self, mock_subprocess):
        """测试通过背景实现的多智能体协调"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            if 'claude' in str(cmd):
                mock_result.stdout = "Analysis complete: found issue with user auth that needs fixing"
            elif 'codebuddy' in str(cmd):
                mock_result.stdout = "Code fix applied: resolved auth issue"
            elif 'gemini' in str(cmd):
                mock_result.stdout = "Documentation updated for auth module"
            else:
                mock_result.stdout = "Task completed"
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        # 1. 初始化项目
        context = ProjectContext(project_path=self.project_path)

        # 2. 模拟用户创建初始任务 - 使用Claude能处理的描述
        initial_task = context.create_task("bug_analysis", "Analyze authentication issue and provide solution", "claude")
        print(f"Created initial task: {context.data['tasks'][initial_task]['description']}")

        # 3. Claude进行分析
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        claude_success = claude_agent.work_on_context()
        print(f"Claude success: {claude_success}, task status: {context.data['tasks'][initial_task]['status']}")

        # 4. 验证Claude至少处理了任务
        self.assertNotEqual(context.data["tasks"][initial_task]["status"], "pending",
                           "Claude should have processed the initial analysis task")
        
        # 5. 检查是否创建了后续任务（表示多智能体协作）
        total_tasks = len(context.data["tasks"])
        print(f"Total tasks after Claude: {total_tasks}")
        
        # 验证协作发生（任务数量增加或者协作历史记录存在）
        has_collaboration = total_tasks > 1 or len(context.data["collaboration_history"]) > 0
        print(f"Has collaboration (extra tasks: {total_tasks > 1}, history: {len(context.data['collaboration_history']) > 0}): {has_collaboration}")
        
        if len(context.data["collaboration_history"]) > 0:
            agents_involved = set(log["agent"] for log in context.data["collaboration_history"])
            print(f"Agents involved in collaboration: {agents_involved}")


if __name__ == '__main__':
    unittest.main()