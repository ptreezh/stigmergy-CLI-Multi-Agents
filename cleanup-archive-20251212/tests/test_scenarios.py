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


class TestScenarios(unittest.TestCase):
    """测试特定使用场景"""

    def setUp(self):
        """为每个测试创建临时目录"""
        self.temp_dir = tempfile.mkdtemp()
        self.project_path = Path(self.temp_dir)

    def tearDown(self):
        """清理临时目录"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    @patch('subprocess.run')
    def test_software_development_scenario(self, mock_subprocess):
        """测试软件开发场景：需求分析 -> 编码 -> 测试 -> 文档"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            
            if 'claude' in str(cmd):
                mock_result.stdout = """
项目需求分析完成：
- 用户需要一个计算器应用
- 需要支持基本运算：加减乘除
- 需要图形界面
- 需要考虑错误处理
"""
            elif 'codebuddy' in str(cmd) or 'qodercli' in str(cmd):
                mock_result.stdout = """
import tkinter as tk

class Calculator:
    def __init__(self):
        self.window = tk.Tk()
        self.window.title("Calculator")
        
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b

def main():
    calc = Calculator()
    calc.window.mainloop()

if __name__ == "__main__":
    main()
"""
            elif 'gemini' in str(cmd):
                mock_result.stdout = """
# Calculator App
This application provides basic arithmetic operations.

## Features
- Addition: calc.add(a, b)
- Subtraction: calc.subtract(a, b)
- Multiplication and Division coming soon
"""
            else:
                mock_result.stdout = "Task completed successfully"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 1. 创建需求分析任务
        analysis_task = context.create_task("requirements_analysis", 
                                          "分析计算器应用需求", "claude")

        # 2. Claude进行需求分析
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        claude_success = claude_agent.work_on_context()
        self.assertTrue(claude_success)

        # 3. 创建编码任务
        coding_task = context.create_task("coding", 
                                        "实现计算器基本功能", "codebuddy")

        # 4. CodeBuddy进行编码
        codebuddy_agent = CLICollaborationAgent("codebuddy", project_path=self.project_path)
        codebuddy_success = codebuddy_agent.work_on_context()
        self.assertTrue(codebuddy_success)

        # 5. 创建文档任务
        doc_task = context.create_task("documentation", 
                                     "为计算器应用生成文档", "gemini")

        # 6. Gemini生成文档
        gemini_agent = CLICollaborationAgent("gemini", project_path=self.project_path)
        gemini_success = gemini_agent.work_on_context()
        self.assertTrue(gemini_success)

        # 7. 验证整个开发流程
        self.assertEqual(context.data["tasks"][analysis_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][coding_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][doc_task]["status"], "completed")

    @patch('subprocess.run')
    def test_research_collaboration_scenario(self, mock_subprocess):
        """测试研究协作场景：文献调研 -> 数据分析 -> 结果解读 -> 报告撰写"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            
            if 'kimi' in str(cmd):  # Kimi适合处理长文本和研究
                mock_result.stdout = """
文献调研结果：
1. 深度学习在NLP中的应用
2. Transformer模型的发展历程
3. 当前研究的挑战与机遇
"""
            elif 'claude' in str(cmd):
                mock_result.stdout = """
数据分析完成：
- 样本数量：1000个文本样本
- 平均长度：250词
- 主要主题分布：技术50%，商业30%，其他20%
- 情感倾向：正面60%，中性30%，负面10%
"""
            elif 'gemini' in str(cmd):
                mock_result.stdout = """
研究报告草稿：
# AI在文本分析中的应用趋势

## 摘要
本报告分析了AI在文本分析领域的最新进展...

## 结论
AI文本分析技术发展迅速，但仍存在挑战...
"""
            else:
                mock_result.stdout = "Task completed"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 1. 文献调研
        research_task = context.create_task("literature_review", 
                                          "调研AI文本分析相关文献", "kimi")
        
        kimi_agent = CLICollaborationAgent("kimi", project_path=self.project_path)
        kimi_success = kimi_agent.work_on_context()
        self.assertTrue(kimi_success)

        # 2. 数据分析
        analysis_task = context.create_task("data_analysis", 
                                          "分析文本数据集", "claude")
        
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        claude_success = claude_agent.work_on_context()
        self.assertTrue(claude_success)

        # 3. 报告撰写
        report_task = context.create_task("report_writing", 
                                        "撰写研究报告", "gemini")
        
        gemini_agent = CLICollaborationAgent("gemini", project_path=self.project_path)
        gemini_success = gemini_agent.work_on_context()
        self.assertTrue(gemini_success)

        # 4. 验证研究流程
        self.assertEqual(context.data["tasks"][research_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][analysis_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][report_task]["status"], "completed")

    @patch('subprocess.run')
    def test_bug_fix_collaboration_scenario(self, mock_subprocess):
        """测试Bug修复协作场景：问题诊断 -> 修复实现 -> 测试验证"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            
            if 'claude' in str(cmd):
                mock_result.stdout = """
Bug诊断结果：
- 问题：用户登录时出现空指针异常
- 位置：AuthenticationService.java:45
- 原因：未检查用户对象是否为空
- 解决方案：添加空值检查
"""
            elif 'codebuddy' in str(cmd):
                mock_result.stdout = """
// 修复后的代码
public boolean authenticateUser(User user) {
    if (user == null) {
        logger.warn("Null user object received");
        return false;
    }
    // 原有的认证逻辑...
    return performAuthentication(user);
}
"""
            elif 'qodercli' in str(cmd):
                mock_result.stdout = """
测试结果：
✅ 修复后的代码通过了所有单元测试
✅ 边界情况测试通过（空用户、无效凭据等）
✅ 性能测试显示无性能降级
✅ 集成测试通过
"""
            else:
                mock_result.stdout = "Task completed"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 1. 问题诊断
        diag_task = context.create_task("bug_diagnosis", 
                                      "诊断登录空指针异常", "claude")
        
        claude_agent = CLICollaborationAgent("claude", project_path=self.project_path)
        claude_success = claude_agent.work_on_context()
        self.assertTrue(claude_success)

        # 2. 代码修复
        fix_task = context.create_task("code_fix", 
                                     "修复认证服务中的空指针问题", "codebuddy")
        
        codebuddy_agent = CLICollaborationAgent("codebuddy", project_path=self.project_path)
        codebuddy_success = codebuddy_agent.work_on_context()
        self.assertTrue(codebuddy_success)

        # 3. 测试验证
        test_task = context.create_task("testing", 
                                      "测试修复后的认证功能", "qodercli")
        
        qoder_agent = CLICollaborationAgent("qodercli", project_path=self.project_path)
        qoder_success = qoder_agent.work_on_context()
        self.assertTrue(qoder_success)

        # 4. 验证Bug修复流程
        self.assertEqual(context.data["tasks"][diag_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][fix_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][test_task]["status"], "completed")

    @patch('subprocess.run')
    def test_content_creation_scenario(self, mock_subprocess):
        """测试内容创作场景：主题规划 -> 内容创作 -> 编辑优化 -> 发布准备"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            
            if 'gemini' in str(cmd):
                mock_result.stdout = """
内容主题规划：
- 主题：人工智能在医疗领域的应用
- 目标受众：医疗专业人士
- 文章结构：引言、应用案例、挑战、未来展望
- 关键点：影像诊断、药物发现、个性化治疗
"""
            elif 'kimi' in str(cmd):
                mock_result.stdout = """
# 人工智能在医疗领域的应用

## 引言
近年来，人工智能技术在医疗领域的应用日益广泛...

## 主要应用案例
1. 医学影像诊断
2. 药物发现与开发
3. 个性化治疗方案
4. 健康监测与预防

## 面临的挑战
- 数据隐私问题
- 监管合规性
- 技术可靠性

## 未来展望
AI将在精准医疗中发挥更大作用...
"""
            elif 'qwen' in str(cmd):
                mock_result.stdout = """
# 人工智能在医疗领域的应用（优化版）

## 引言
随着深度学习技术的快速发展，人工智能在医疗健康领域展现出巨大潜力...

[优化后的内容，逻辑更清晰，表达更准确...]
"""
            else:
                mock_result.stdout = "Task completed"
            
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 1. 主题规划
        plan_task = context.create_task("planning", 
                                      "规划医疗AI文章主题", "gemini")
        
        gemini_agent = CLICollaborationAgent("gemini", project_path=self.project_path)
        gemini_success = gemini_agent.work_on_context()
        self.assertTrue(gemini_success)

        # 2. 内容创作
        content_task = context.create_task("content_creation", 
                                         "撰写医疗AI应用文章", "kimi")
        
        kimi_agent = CLICollaborationAgent("kimi", project_path=self.project_path)
        kimi_success = kimi_agent.work_on_context()
        self.assertTrue(kimi_success)

        # 3. 内容优化
        edit_task = context.create_task("editing", 
                                      "优化医疗AI文章内容", "qwen")
        
        qwen_agent = CLICollaborationAgent("qwen", project_path=self.project_path)
        qwen_success = qwen_agent.work_on_context()
        self.assertTrue(qwen_success)

        # 4. 验证内容创作流程
        self.assertEqual(context.data["tasks"][plan_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][content_task]["status"], "completed")
        self.assertEqual(context.data["tasks"][edit_task]["status"], "completed")

    @patch('subprocess.run')
    def test_task_priority_and_assignment_scenario(self, mock_subprocess):
        """测试任务优先级和分配场景"""
        def mock_side_effect(cmd, **kwargs):
            mock_result = MagicMock()
            mock_result.returncode = 0
            mock_result.stdout = "Task completed successfully"
            mock_result.stderr = ""
            return mock_result

        mock_subprocess.side_effect = mock_side_effect

        context = ProjectContext(project_path=self.project_path)

        # 1. 创建不同优先级的任务
        high_task = context.create_task("urgent_fix", "修复关键安全漏洞", "codebuddy", priority="high")
        med_task = context.create_task("feature", "实现新功能", "qodercli", priority="medium")
        low_task = context.create_task("refactor", "代码重构", "codebuddy", priority="low")

        # 2. CodeBuddy处理高优先级任务
        codebuddy_agent = CLICollaborationAgent("codebuddy", project_path=self.project_path)
        success1 = codebuddy_agent.work_on_context()
        self.assertTrue(success1)

        # 3. 验证高优先级任务被处理
        self.assertEqual(context.data["tasks"][high_task]["status"], "completed")

        # 4. QoderCLI处理中等优先级任务
        qoder_agent = CLICollaborationAgent("qodercli", project_path=self.project_path)
        success2 = qoder_agent.work_on_context()
        self.assertTrue(success2)

        # 5. 验证中等优先级任务被处理
        self.assertEqual(context.data["tasks"][med_task]["status"], "completed")


if __name__ == '__main__':
    unittest.main()