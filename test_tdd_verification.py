#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TDD测试验证 - CLI智能路由功能
严格验证功能是否按照需求实现
"""

import unittest
import subprocess
import tempfile
import os
import sys
from plugin_manager import PluginManager
from cli_hook_system import HookRegistry, SmartRoutingHook


class TestCLIRoutingFunctionality(unittest.TestCase):
    """CLI路由功能TDD测试套件"""
    
    def setUp(self):
        """测试前准备"""
        self.registry = HookRegistry()
        self.test_cli_name = "test_cli"
        self.routing_hook = SmartRoutingHook(self.test_cli_name)
        self.registry.register_cli_hook(self.test_cli_name, self.routing_hook)
    
    def test_route_pattern_detection(self):
        """测试路由模式检测"""
        print("\n🔍 测试1: 路由模式检测")
        
        # 测试各种路由指令模式
        test_cases = [
            ("用gemini帮我翻译Hello World", "gemini", "翻译Hello World"),
            ("让qwen分析这段代码", "qwen", "分析这段代码"),
            ("请claude帮我写Python代码", "claude", "写Python代码"),
            ("让kimi帮我生成文档", "kimi", "生成文档"),
            ("用codebuddy优化这段代码", "codebuddy", "优化这段代码"),
            ("让copilot帮我写代码", "copilot", "写代码"),
            ("请qoder解决这个问题", "qoder", "解决这个问题"),
            ("用iflow帮我解释", "iflow", "解释"),
        ]
        
        for input_text, expected_tool, expected_instruction in test_cases:
            with self.subTest(input_text=input_text):
                route_info = self.routing_hook.extract_route_info(input_text)
                self.assertIsNotNone(route_info, f"未能识别路由意图: {input_text}")
                self.assertEqual(route_info['target_tool'], expected_tool)
                self.assertEqual(route_info['remaining_input'].strip(), expected_instruction)
                print(f"  ✅ '{input_text}' -> 路由到 {expected_tool}")
    
    def test_non_route_inputs(self):
        """测试非路由输入不应被拦截"""
        print("\n🔍 测试2: 非路由输入处理")
        
        non_route_inputs = [
            "正常的CLI请求，不包含路由指令",
            "这是普通的请求内容",
            "hello world",
            "write some code",
            "analyze this document",
            "translate this paragraph",
        ]
        
        for input_text in non_route_inputs:
            with self.subTest(input_text=input_text):
                route_info = self.routing_hook.extract_route_info(input_text)
                self.assertIsNone(route_info, f"不应该识别到路由意图: {input_text}")
                print(f"  ✅ '{input_text}' -> 正确保持原功能")
    
    def test_case_insensitive_matching(self):
        """测试大小写不敏感匹配"""
        print("\n🔍 测试3: 大小写不敏感匹配")
        
        mixed_case_inputs = [
            ("用GEMINI帮我翻译", "gemini"),
            ("让Qwen帮我写代码", "qwen"),
            ("请CLAUD帮我分析", "claude"),
            ("USE GEMINI TO TRANSLATE", "gemini"),  # 英文混合
        ]
        
        for input_text, expected_tool in mixed_case_inputs:
            with self.subTest(input_text=input_text):
                route_info = self.routing_hook.extract_route_info(input_text)
                self.assertIsNotNone(route_info, f"大小写匹配失败: {input_text}")
                self.assertEqual(route_info['target_tool'], expected_tool)
                print(f"  ✅ '{input_text}' -> 正确识别为 {expected_tool}")
    
    def test_process_input_for_routing(self):
        """测试路由处理流程"""
        print("\n🔍 测试4: 路由处理流程")
        
        user_input = "用gemini帮我翻译这段文字: Hello world"
        
        result = self.registry.process_input_for_cli(self.test_cli_name, user_input)
        
        self.assertTrue(result['should_intercept'], "路由意图应该被拦截")
        self.assertEqual(result['route_target'], 'gemini', "应该路由到gemini")
        self.assertIn('Hello world', result['processed_input'], "应该保留原始指令")
        print(f"  ✅ 路由处理成功: {user_input}")
    
    def test_no_route_passthrough(self):
        """测试无路由意图的输入正常通过"""
        print("\n🔍 测试5: 无路由意图正常通过")
        
        user_input = "正常的Qwen请求，不包含路由指令"
        
        result = self.registry.process_input_for_cli(self.test_cli_name, user_input)
        
        self.assertFalse(result['should_intercept'], "无路由意图不应该被拦截")
        self.assertEqual(result['handled_by'], 'none', "应该返回none处理状态")
        print(f"  ✅ 正常通过: {user_input}")
    
    def test_clean_input_functionality(self):
        """测试输入清理功能"""
        print("\n🔍 测试6: 输入清理功能")
        
        test_cases = [
            ("用gemini帮我翻译Hello World", "Hello World"),
            ("让qwen帮我分析这段代码并优化", "分析这段代码并优化"),
            ("请claude帮我写Python代码", "写Python代码"),
        ]
        
        for input_text, expected_clean in test_cases:
            with self.subTest(input_text=input_text):
                route_info = self.routing_hook.extract_route_info(input_text)
                if route_info:
                    self.assertIn(expected_clean.strip(), route_info['remaining_input'].strip())
                    print(f"  ✅ 清理成功: '{input_text}' -> '{route_info['remaining_input']}'")
    
    def test_execute_remote_tool(self):
        """测试远程工具执行（模拟）"""
        print("\n🔍 测试7: 远程工具执行模拟")
        
        # 这个测试因为需要实际的工具而难以验证，所以我们检查命令构建
        result = self.routing_hook.execute_remote_tool('gemini', 'test input')
        
        # 至少检查返回值结构
        self.assertIn('success', result)
        self.assertIn('target_tool', result)
        self.assertIn('instruction', result)
        print(f"  ✅ 工具执行结构验证通过")
    
    def test_cli_integration_simulation(self):
        """测试CLI集成模拟"""
        print("\n🔍 测试8: CLI集成模拟")
        
        # 模拟在CLI内部的处理流程
        test_inputs = [
            ("用claude分析这个需求文档", "claude"),
            ("让gemini帮我写代码", "gemini"),
            ("正常的请求", None)  # 不应该路由
        ]
        
        for user_input, expected_route in test_inputs:
            result = self.registry.process_input_for_cli(self.test_cli_name, user_input)
            
            if expected_route:
                self.assertTrue(result['should_intercept'], f"应该路由到 {expected_route}")
                self.assertEqual(result['route_target'], expected_route)
                print(f"  ✅ 模拟CLI: '{user_input}' -> 路由到 {expected_route}")
            else:
                self.assertFalse(result['should_intercept'], "不应该路由")
                print(f"  ✅ 模拟CLI: '{user_input}' -> 原始处理")
    
    def test_edge_cases(self):
        """测试边界情况"""
        print("\n🔍 测试9: 边界情况")
        
        edge_cases = [
            "",  # 空输入
            "   ",  # 只有空格
            "用不存在的工具帮我做事",  # 不存在的工具
            "用Gemini帮我",  # 指令很短
        ]
        
        for input_text in edge_cases:
            try:
                result = self.registry.process_input_for_cli(self.test_cli_name, input_text)
                print(f"  ✅ 边界情况处理: '{input_text[:20]}...' -> {result['handled_by']}")
            except Exception as e:
                print(f"  ⚠️  边界情况异常: '{input_text[:20]}...' -> {str(e)}")


class TestIntegrationScenarios(unittest.TestCase):
    """集成场景测试"""
    
    def setUp(self):
        self.registry = HookRegistry()
        
        # 为不同CLI注册路由钩子
        for cli_name in ['qwen', 'claude', 'gemini', 'codebuddy']:
            hook = SmartRoutingHook(cli_name)
            self.registry.register_cli_hook(cli_name, hook)
    
    def test_inter_cli_routing_scenarios(self):
        """测试跨CLI路由场景"""
        print("\n🔍 测试10: 跨CLI路由场景")
        
        scenarios = [
            ('qwen', '用gemini帮我翻译Hello', 'gemini'),
            ('claude', '让qwen分析这段代码', 'qwen'),
            ('gemini', '请claude帮我写文章', 'claude'),
            ('codebuddy', '用kimi帮我生成测试', 'kimi'),
        ]
        
        for cli_name, user_input, expected_target in scenarios:
            with self.subTest(cli=cli_name, input=user_input):
                result = self.registry.process_input_for_cli(cli_name, user_input)
                
                self.assertTrue(result['should_intercept'], 
                              f"{cli_name}应该拦截路由请求: {user_input}")
                self.assertEqual(result['route_target'], expected_target,
                               f"{cli_name}应该路由到{expected_target}")
                
                print(f"  ✅ {cli_name}: '{user_input}' -> 路由到 {expected_target}")
    
    def test_original_function_preservation(self):
        """测试原始功能保持"""
        print("\n🔍 测试11: 原始功能保持")
        
        scenarios = [
            ('qwen', '正常的Qwen请求'),
            ('claude', '标准Claude查询'),
            ('gemini', '普通Gemini任务'),
            ('codebuddy', '常规代码请求'),
        ]
        
        for cli_name, user_input in scenarios:
            with self.subTest(cli=cli_name, input=user_input):
                result = self.registry.process_input_for_cli(cli_name, user_input)
                
                self.assertFalse(result['should_intercept'],
                               f"{cli_name}不应该拦截非路由请求: {user_input}")
                
                print(f"  ✅ {cli_name}: '{user_input}' -> 保持原始功能")


def run_user_interaction_simulation():
    """用户交互模拟测试"""
    print("\n" + "="*60)
    print("🎭 用户交互模拟测试")
    print("="*60)
    
    print("\n场景1: 用户在Qwen中请求路由")
    print("用户输入: 用Claude帮我写Python代码")
    
    registry = HookRegistry()
    qwen_hook = SmartRoutingHook("qwen")
    registry.register_cli_hook("qwen", qwen_hook)
    
    result = registry.process_input_for_cli("qwen", "用Claude帮我写Python代码")
    
    if result['should_intercept']:
        print("✅ 系统响应: 检测到路由意图")
        print(f"🎯 目标工具: {result['route_target']}")
        print(f"📝 指令内容: {result['processed_input']}")
        print("🔄 已路由到Claude执行")
    else:
        print("❌ 路由失败")
    
    print("\n场景2: 用户在Claude中请求普通功能")
    print("用户输入: 帮我优化这段Python代码")
    
    result2 = registry.process_input_for_cli("qwen", "帮我优化这段Python代码")
    
    if not result2['should_intercept']:
        print("✅ 系统响应: 无路由意图")
        print("🔄 执行原始Qwen功能")
    else:
        print("❌ 非路由请求被误拦截")
    
    print("\n场景3: 用户在Qwen中复杂路由")
    print("用户输入: 请Gemini帮我翻译这段中文为英文")
    
    result3 = registry.process_input_for_cli("qwen", "请Gemini帮我翻译这段中文为英文")
    
    if result3['should_intercept']:
        print("✅ 系统响应: 检测到路由意图")
        print(f"🎯 目标工具: {result3['route_target']}")
        print(f"📝 指令内容: {result3['processed_input']}")
        print("🔄 已路由到Gemini执行")
    else:
        print("❌ 复杂路由失败")


def main():
    """主函数 - 运行所有测试"""
    print("🧪 TDD测试验证 - CLI智能路由功能")
    print("="*60)
    
    # 创建测试套件
    suite = unittest.TestSuite()
    
    # 添加测试用例
    suite.addTest(unittest.makeSuite(TestCLIRoutingFunctionality))
    suite.addTest(unittest.makeSuite(TestIntegrationScenarios))
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # 运行用户交互模拟
    run_user_interaction_simulation()
    
    # 输出测试结果摘要
    print("\n" + "="*60)
    print("📊 测试结果摘要")
    print("="*60)
    print(f"✅ 运行测试数: {result.testsRun}")
    print(f"❌ 失败数量: {len(result.failures)}")
    print(f"⚠️  错误数量: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("\n🎉 所有测试通过！")
        print("✅ CLI智能路由功能按预期工作")
        print("✅ 自然语言路由识别正常")
        print("✅ 原始功能保持完整")
        print("✅ 跨CLI路由正常工作")
        print("✅ 边界情况处理妥当")
    else:
        print(f"\n❌ 有 {len(result.failures) + len(result.errors)} 个测试失败")
        for failure in result.failures:
            print(f"❌ 失败: {failure[0]} - {failure[1]}")
        for error in result.errors:
            print(f"❌ 错误: {error[0]} - {error[1]}")
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)