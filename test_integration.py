"""
集成测试脚本 - 基于真实架构的跨CLI协作系统
验证已安装CLI的直接调用，无需重复安装
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime

# 添加项目路径
sys.path.append(str(Path(__file__).parent.parent))
sys.path.append(str(Path(__file__).parent))

from src.core.direct_cli_executor import DirectCLIExecutor
from src.core.cross_platform_encoding import safe_file_write, safe_file_read

class CrossCLITester:
    """跨CLI系统集成测试器"""
    
    def __init__(self):
        self.executor = DirectCLIExecutor()
        self.test_results = {
            'start_time': datetime.now().isoformat(),
            'cli_status_test': {},
            'direct_call_tests': [],
            'cross_cli_tests': [],
            'fallback_tests': [],
            'performance_tests': [],
            'error_handling_tests': []
        }
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始跨CLI系统集成测试")
        print("=" * 60)
        
        # 1. CLI状态检查测试
        print("📋 1. CLI可用性检查测试...")
        self.test_cli_status()
        
        # 2. 直接调用测试
        print("📋 2. 直接CLI调用测试...")
        self.test_direct_calls()
        
        # 3. 跨CLI协作测试
        print("📋 3. 跨CLI协作测试...")
        self.test_cross_cli_collaboration()
        
        # 4. 优雅降级测试
        print("📋 4. 优雅降级测试...")
        self.test_fallback_mechanism()
        
        # 5. 性能测试
        print("📋 5. 性能测试...")
        self.test_performance()
        
        # 6. 错误处理测试
        print("📋 6. 错误处理测试...")
        self.test_error_handling()
        
        # 7. 生成测试报告
        print("📋 7. 生成测试报告...")
        self.generate_test_report()
        
        print("=" * 60)
        print("✅ 所有测试完成!")
    
    def test_cli_status(self):
        """测试CLI状态检查"""
        try:
            status = self.executor.get_system_status()
            
            self.test_results['cli_status_test'] = {
                'success': True,
                'total_clis': status['total_clis'],
                'available_count': len([c for c in status['available_clis'].values() if c['available']]),
                'unavailable_count': len([c for c in status['available_clis'].values() if not c['available']]),
                'cli_details': status['available_clis']
            }
            
            # 打印结果
            print(f"   ✓ 总CLI数量: {status['total_clis']}")
            print(f"   ✓ 可用CLI: {self.test_results['cli_status_test']['available_count']}")
            print(f"   ✓ 不可用CLI: {self.test_results['cli_status_test']['unavailable_count']}")
            
            for cli_name, info in status['available_clis'].items():
                status_icon = "✓" if info['available'] else "✗"
                print(f"     {status_icon} {info['name']}: {info['message']}")
            
        except Exception as e:
            self.test_results['cli_status_test'] = {
                'success': False,
                'error': str(e)
            }
            print(f"   ✗ CLI状态检查失败: {e}")
    
    def test_direct_calls(self):
        """测试直接CLI调用"""
        status = self.executor.get_system_status()
        available_clis = [name for name, info in status['available_clis'].items() if info['available']]
        
        if not available_clis:
            print("   ⚠️ 没有可用的CLI进行直接调用测试")
            return
        
        test_requests = [
            "生成一个简单的Python Hello World程序",
            "分析当前目录结构",
            "创建一个基本的Markdown文档模板"
        ]
        
        for cli_name in available_clis[:3]:  # 测试最多3个CLI
            for i, request in enumerate(test_requests):
                test_name = f"{cli_name}_direct_{i+1}"
                
                try:
                    start_time = time.time()
                    result = self.executor.execute_direct_cli_call(
                        source_cli=cli_name,
                        target_cli=cli_name,
                        request=request,
                        use_fallback=False  # 直接调用测试不使用fallback
                    )
                    execution_time = time.time() - start_time
                    
                    test_result = {
                        'test_name': test_name,
                        'source_cli': cli_name,
                        'target_cli': cli_name,
                        'request': request,
                        'success': result['success'],
                        'execution_time': execution_time,
                        'command_used': result.get('command_used', ''),
                        'response_length': len(result.get('response', '')),
                        'error': result.get('error', ''),
                        'fallback_used': result.get('fallback_used', False)
                    }
                    
                    self.test_results['direct_call_tests'].append(test_result)
                    
                    status_icon = "✓" if result['success'] else "✗"
                    print(f"     {status_icon} {test_name}: {execution_time:.2f}s")
                    
                    if not result['success'] and result.get('error'):
                        print(f"       错误: {result['error'][:100]}...")
                    
                except Exception as e:
                    test_result = {
                        'test_name': test_name,
                        'success': False,
                        'error': str(e),
                        'exception': True
                    }
                    self.test_results['direct_call_tests'].append(test_result)
                    print(f"     ✗ {test_name}: 异常 - {e}")
    
    def test_cross_cli_collaboration(self):
        """测试跨CLI协作"""
        status = self.executor.get_system_status()
        available_clis = [name for name, info in status['available_clis'].items() if info['available']]
        
        if len(available_clis) < 2:
            print("   ⚠️ 可用CLI少于2个，无法进行跨CLI协作测试")
            return
        
        # 测试前两个可用CLI之间的协作
        source_cli = available_clis[0]
        target_cli = available_clis[1]
        
        test_requests = [
            "创建一个React组件示例",
            "生成API文档结构",
            "分析代码质量并提供建议"
        ]
        
        for i, request in enumerate(test_requests):
            test_name = f"{source_cli}_to_{target_cli}_{i+1}"
            
            try:
                start_time = time.time()
                result = self.executor.execute_direct_cli_call(
                    source_cli=source_cli,
                    target_cli=target_cli,
                    request=request,
                    use_fallback=True
                )
                execution_time = time.time() - start_time
                
                test_result = {
                    'test_name': test_name,
                    'source_cli': source_cli,
                    'target_cli': target_cli,
                    'request': request,
                    'success': result['success'],
                    'execution_time': execution_time,
                    'command_used': result.get('command_used', ''),
                    'fallback_used': result.get('fallback_used', False),
                    'fallback_level': result.get('fallback_level', 0),
                    'response_length': len(result.get('response', '')),
                    'error': result.get('error', '')
                }
                
                self.test_results['cross_cli_tests'].append(test_result)
                
                status_icon = "✓" if result['success'] else "✗"
                fallback_info = " (使用降级)" if result.get('fallback_used') else ""
                print(f"     {status_icon} {test_name}: {execution_time:.2f}s{fallback_info}")
                
                if result.get('fallback_used'):
                    print(f"       降级级别: {result.get('fallback_level', 'unknown')}")
                
            except Exception as e:
                test_result = {
                    'test_name': test_name,
                    'success': False,
                    'error': str(e),
                    'exception': True
                }
                self.test_results['cross_cli_tests'].append(test_result)
                print(f"     ✗ {test_name}: 异常 - {e}")
    
    def test_fallback_mechanism(self):
        """测试优雅降级机制"""
        print("   测试不可用CLI的降级处理...")
        
        # 使用一个不存在的CLI
        fake_cli = "nonexistent_cli"
        test_request = "生成代码示例"
        
        try:
            start_time = time.time()
            result = self.executor.execute_direct_cli_call(
                source_cli="test",
                target_cli=fake_cli,
                request=test_request,
                use_fallback=True
            )
            execution_time = time.time() - start_time
            
            test_result = {
                'test_name': f'fallback_{fake_cli}',
                'target_cli': fake_cli,
                'request': test_request,
                'success': result['success'],  # 降级应该成功
                'fallback_used': result.get('fallback_used', False),
                'fallback_level': result.get('fallback_level', 0),
                'execution_time': execution_time,
                'response_length': len(result.get('response', ''))
            }
            
            self.test_results['fallback_tests'].append(test_result)
            
            status_icon = "✓" if result.get('fallback_used') else "✗"
            print(f"     {status_icon} 降级机制测试: {result.get('fallback_level', 'unknown')}级")
            
        except Exception as e:
            print(f"     ✗ 降级机制测试失败: {e}")
    
    def test_performance(self):
        """性能测试"""
        status = self.executor.get_system_status()
        available_clis = [name for name, info in status['available_clis'].items() if info['available']]
        
        if not available_clis:
            print("   ⚠️ 没有可用的CLI进行性能测试")
            return
        
        cli_name = available_clis[0]
        test_request = "生成一个简单的测试函数"
        
        # 执行多次测试
        execution_times = []
        for i in range(5):
            try:
                start_time = time.time()
                result = self.executor.execute_direct_cli_call(
                    source_cli=cli_name,
                    target_cli=cli_name,
                    request=test_request,
                    use_fallback=False
                )
                execution_time = time.time() - start_time
                execution_times.append(execution_time)
                
                print(f"     测试 {i+1}: {execution_time:.2f}s")
                
            except Exception as e:
                print(f"     测试 {i+1} 失败: {e}")
        
        if execution_times:
            avg_time = sum(execution_times) / len(execution_times)
            min_time = min(execution_times)
            max_time = max(execution_times)
            
            self.test_results['performance_tests'] = {
                'cli_name': cli_name,
                'request': test_request,
                'execution_count': len(execution_times),
                'average_time': avg_time,
                'min_time': min_time,
                'max_time': max_time,
                'all_times': execution_times
            }
            
            print(f"     ✓ 平均执行时间: {avg_time:.2f}s")
            print(f"     ✓ 最快: {min_time:.2f}s, 最慢: {max_time:.2f}s")
    
    def test_error_handling(self):
        """错误处理测试"""
        error_test_cases = [
            {
                'name': '空请求测试',
                'request': '',
                'expected_error': 'Empty request'
            },
            {
                'name': '超长请求测试',
                'request': '生成代码' * 1000,
                'expected_error': 'Request too long'
            },
            {
                'name': '特殊字符测试',
                'request': '测试代码生成\n\t\r\\'\"',
                'expected_error': 'Special characters'
            }
        ]
        
        for test_case in error_test_cases:
            try:
                result = self.executor.execute_direct_cli_call(
                    source_cli='test',
                    target_cli='nonexistent_cli',  # 使用不存在的CLI来触发错误
                    request=test_case['request'],
                    use_fallback=True
                )
                
                test_result = {
                    'test_name': test_case['name'],
                    'request': test_case['request'][:50] + '...' if len(test_case['request']) > 50 else test_case['request'],
                    'success': result['success'],
                    'fallback_used': result.get('fallback_used', False),
                    'fallback_level': result.get('fallback_level', 0),
                    'error': result.get('error', '')
                }
                
                self.test_results['error_handling_tests'].append(test_result)
                
                # 降级应该成功处理错误
                status_icon = "✓" if result.get('fallback_used') else "✗"
                print(f"     {status_icon} {test_case['name']}: 降级级别 {result.get('fallback_level', 'unknown')}")
                
            except Exception as e:
                print(f"     ✗ {test_case['name']}: 异常 - {e}")
    
    def generate_test_report(self):
        """生成测试报告"""
        self.test_results['end_time'] = datetime.now().isoformat()
        
        # 计算统计数据
        total_tests = 0
        successful_tests = 0
        
        for test_type in ['direct_call_tests', 'cross_cli_tests', 'fallback_tests']:
            total_tests += len(self.test_results.get(test_type, []))
            successful_tests += len([t for t in self.test_results.get(test_type, []) if t.get('success', False)])
        
        self.test_results['summary'] = {
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': successful_tests / total_tests if total_tests > 0 else 0,
            'cli_availability': self.test_results.get('cli_status_test', {}).get('available_count', 0)
        }
        
        # 保存测试报告
        report_file = Path(__file__).parent.parent / 'test_reports' / f'cross_cli_test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        report_file.parent.mkdir(exist_ok=True)
        
        try:
            safe_file_write(str(report_file), json.dumps(self.test_results, indent=2, ensure_ascii=False))
            print(f"   📄 测试报告已保存: {report_file}")
        except Exception as e:
            print(f"   ⚠️ 保存测试报告失败: {e}")
        
        # 打印总结
        summary = self.test_results['summary']
        print(f"\n📊 测试总结:")
        print(f"   总测试数: {summary['total_tests']}")
        print(f"   成功测试: {summary['successful_tests']}")
        print(f"   成功率: {summary['success_rate']:.1%}")
        print(f"   可用CLI: {summary['cli_availability']}")
        
        # 分类成功率
        for test_type in ['direct_call_tests', 'cross_cli_tests', 'fallback_tests']:
            tests = self.test_results.get(test_type, [])
            if tests:
                successful = len([t for t in tests if t.get('success', False)])
                rate = successful / len(tests) if tests else 0
                print(f"   {test_type}: {successful}/{len(tests)} ({rate:.1%})")

def main():
    """主函数"""
    print("🔬 跨CLI系统集成测试")
    print("基于真实CLI架构，无需重复安装")
    print()
    
    tester = CrossCLITester()
    tester.run_all_tests()
    
    # 交互式选择
    print("\n" + "="*60)
    print("🎯 测试完成! 您想要:")
    print("1. 查看详细测试结果")
    print("2. 重新运行特定测试")
    print("3. 测试特定的跨CLI调用")
    print("4. 退出")
    
    try:
        choice = input("\n请选择 (1-4): ").strip()
        
        if choice == "1":
            print("\n📋 详细测试结果:")
            print(json.dumps(tester.test_results, indent=2, ensure_ascii=False))
        
        elif choice == "2":
            print("\n🔄 重新运行测试...")
            tester.run_all_tests()
        
        elif choice == "3":
            # 获取可用的CLI
            status = tester.executor.get_system_status()
            available_clis = [name for name, info in status['available_clis'].items() if info['available']]
            
            if len(available_clis) >= 2:
                print(f"\n可用的CLI: {', '.join(available_clis)}")
                source = input("源CLI: ").strip().lower()
                target = input("目标CLI: ").strip().lower()
                request = input("测试请求: ").strip()
                
                if source in available_clis and target in available_clis and request:
                    print(f"\n🚀 测试 {source} -> {target}")
                    result = tester.executor.execute_direct_cli_call(
                        source_cli=source,
                        target_cli=target,
                        request=request
                    )
                    
                    print(f"✓ 成功: {result['success']}")
                    print(f"✓ 命令: {result.get('command_used', 'N/A')}")
                    print(f"✓ 响应: {result['response'][:300]}...")
                    if result.get('fallback_used'):
                        print(f"⚠️ 使用降级: 级别 {result.get('fallback_level', 'unknown')}")
                else:
                    print("❌ 输入无效")
            else:
                print("❌ 可用CLI不足，无法进行测试")
        
    except KeyboardInterrupt:
        print("\n👋 测试中断")
    except Exception as e:
        print(f"\n❌ 选择处理错误: {e}")

if __name__ == '__main__':
    main()