"""
真实跨CLI集成演示 - 展示已安装和未安装CLI的完整处理
严格基于真实研究，严禁推测
"""

import os
import sys
import time
from pathlib import Path
from datetime import datetime

# 添加项目路径
sys.path.append(str(Path(__file__).parent.parent))
sys.path.append(str(Path(__file__).parent))

from src.core.real_cross_cli_system import RealCrossCLISystem
from src.core.direct_cli_hook_system import DirectCLIHookManager
from src.core.cross_platform_encoding import safe_file_write, safe_file_read

class RealCrossCLIDemo:
    """真实跨CLI集成演示"""
    
    def __init__(self):
        self.cross_system = RealCrossCLISystem()
        self.hook_manager = DirectCLIHookManager()
        self.demo_results = {
            'start_time': datetime.now().isoformat(),
            'system_overview': {},
            'cli_status_tests': [],
            'direct_call_demos': [],
            'cross_cli_demos': [],
            'fallback_demos': [],
            'hook_demos': [],
            'user_interaction_scenarios': []
        }
    
    def run_complete_demo(self):
        """运行完整演示"""
        print("🚀 真实跨CLI系统集成演示")
        print("=" * 70)
        print("基于真实CLI架构，处理已安装和未安装CLI的所有情况")
        print("严格基于真实研究，严禁推测")
        print("=" * 70)
        
        # 1. 系统概览
        print("\n📊 1. 系统概览分析")
        self.demo_system_overview()
        
        # 2. CLI状态检查演示
        print("\n🔍 2. CLI状态检查演示")
        self.demo_cli_status_check()
        
        # 3. 直接调用演示
        print("\n🎯 3. 直接CLI调用演示")
        self.demo_direct_cli_calls()
        
        # 4. 跨CLI协作演示
        print("\n🔗 4. 跨CLI协作演示")
        self.demo_cross_cli_collaboration()
        
        # 5. 优雅降级演示
        print("\n🛡️ 5. 优雅降级机制演示")
        self.demo_fallback_mechanism()
        
        # 6. Hook系统演示
        print("\n🪝 6. Hook系统集成演示")
        self.demo_hook_system()
        
        # 7. 用户交互场景演示
        print("\n👤 7. 用户交互场景演示")
        self.demo_user_interaction_scenarios()
        
        # 8. 生成演示报告
        print("\n📄 8. 生成演示报告")
        self.generate_demo_report()
        
        print("\n" + "=" * 70)
        print("✅ 完整演示结束!")
        print("=" * 70)
    
    def demo_system_overview(self):
        """演示系统概览"""
        try:
            overview = self.cross_system.get_system_overview()
            self.demo_results['system_overview'] = overview
            
            print(f"   📈 总CLI工具: {overview['total_clis']}")
            print(f"   ✅ 可用CLI: {overview['available_clis']}")
            print(f"   ❌ 不可用CLI: {overview['unavailable_clis']}")
            
            print("\n   📋 CLI类型分布:")
            cli_types = {}
            for cli_name, status in overview['cli_status'].items():
                cli_type = status['type']
                if cli_type not in cli_types:
                    cli_types[cli_type] = {'available': 0, 'unavailable': 0}
                
                if status['exists']:
                    cli_types[cli_type]['available'] += 1
                else:
                    cli_types[cli_type]['unavailable'] += 1
            
            for cli_type, counts in cli_types.items():
                print(f"      📦 {cli_type}: 可用 {counts['available']}, 不可用 {counts['unavailable']}")
            
            print("\n   🔍 可用CLI详情:")
            for cli_name, status in overview['cli_status'].items():
                if status['exists']:
                    print(f"      ✅ {cli_name}: {status['best_method']}")
                    if status.get('version_info'):
                        print(f"         📋 版本: {status['version_info']}")
            
        except Exception as e:
            print(f"   ❌ 系统概览演示失败: {e}")
            self.demo_results['system_overview'] = {'error': str(e)}
    
    def demo_cli_status_check(self):
        """演示CLI状态检查"""
        # 选择几个代表性CLI进行详细检查
        test_clis = ['claude', 'iflow', 'qwencode', 'codex', 'nonexistent_cli']
        
        for cli_name in test_clis:
            print(f"   🔍 检查 {cli_name}:")
            
            try:
                status = self.cross_system.check_cli_status(cli_name)
                
                test_result = {
                    'cli_name': cli_name,
                    'exists': status['exists'],
                    'type': status.get('type', 'unknown'),
                    'available_methods': status.get('available_methods', []),
                    'best_method': status.get('best_method', ''),
                    'needs_install': status.get('needs_install', False),
                    'install_command': status.get('install_command', ''),
                    'version_info': status.get('version_info', '')
                }
                
                self.demo_results['cli_status_tests'].append(test_result)
                
                if status['exists']:
                    print(f"      ✅ 状态: 存在")
                    print(f"      📦 类型: {status['type']}")
                    print(f"      🎯 最佳方法: {status['best_method']}")
                    if status.get('version_info'):
                        print(f"      📋 版本: {status['version_info']}")
                    print(f"      🔧 可用方法: {', '.join(status['available_methods'][:2])}")
                else:
                    print(f"      ❌ 状态: 未安装")
                    print(f"      📦 类型: {status.get('type', 'unknown')}")
                    print(f"      🔧 安装命令: {status.get('install_command', 'N/A')}")
                
            except Exception as e:
                print(f"      ❌ 检查失败: {e}")
                self.demo_results['cli_status_tests'].append({
                    'cli_name': cli_name,
                    'error': str(e)
                })
    
    def demo_direct_cli_calls(self):
        """演示直接CLI调用"""
        overview = self.cross_system.get_system_overview()
        available_clis = [name for name, status in overview['cli_status'].items() if status['exists']]
        
        if not available_clis:
            print("      ⚠️ 没有可用的CLI进行直接调用演示")
            return
        
        # 选择第一个可用CLI进行测试
        test_cli = available_clis[0]
        test_requests = [
            "生成一个简单的Hello World程序",
            "分析当前目录结构",
            "创建一个Markdown文档模板"
        ]
        
        print(f"      🎯 使用CLI: {test_cli}")
        
        for i, request in enumerate(test_requests):
            print(f"      📝 测试 {i+1}: {request}")
            
            try:
                start_time = time.time()
                result = self.cross_system.call_cli(
                    source_cli='demo',
                    target_cli=test_cli,
                    request=request,
                    auto_install=False
                )
                execution_time = time.time() - start_time
                
                demo_result = {
                    'test_number': i+1,
                    'request': request,
                    'cli_name': test_cli,
                    'success': result['success'],
                    'execution_time': execution_time,
                    'command_used': result.get('command_used', ''),
                    'method_used': result.get('method_used', ''),
                    'install_used': result.get('install_used', False),
                    'fallback_used': result.get('fallback_used', False),
                    'response_length': len(result.get('response', '')),
                    'fallback_level': result.get('fallback_level', '')
                }
                
                self.demo_results['direct_call_demos'].append(demo_result)
                
                status_icon = "✅" if result['success'] else "❌"
                print(f"         {status_icon} 结果: {'成功' if result['success'] else '失败'}")
                print(f"         ⏱️  时间: {execution_time:.2f}s")
                print(f"         🔧 命令: {result.get('command_used', 'N/A')}")
                if result.get('fallback_used'):
                    print(f"         🛡️  降级: {result.get('fallback_level', 'unknown')}")
                
                # 显示部分响应
                response = result.get('response', '')
                if response:
                    preview = response[:150] + '...' if len(response) > 150 else response
                    print(f"         📄 响应预览: {preview}")
                
            except Exception as e:
                print(f"         ❌ 测试失败: {e}")
                self.demo_results['direct_call_demos'].append({
                    'test_number': i+1,
                    'request': request,
                    'cli_name': test_cli,
                    'error': str(e),
                    'exception': True
                })
    
    def demo_cross_cli_collaboration(self):
        """演示跨CLI协作"""
        overview = self.cross_system.get_system_overview()
        available_clis = [name for name, status in overview['cli_status'].items() if status['exists']]
        
        if len(available_clis) < 2:
            print("      ⚠️ 可用CLI少于2个，无法演示跨CLI协作")
            return
        
        # 选择前两个可用CLI进行协作测试
        source_cli = available_clis[0]
        target_cli = available_clis[1]
        
        collaboration_requests = [
            "创建一个React组件并分析其结构",
            "生成API文档并进行代码审查",
            "实现一个排序算法并优化性能"
        ]
        
        print(f"      🔗 协作测试: {source_cli} -> {target_cli}")
        
        for i, request in enumerate(collaboration_requests):
            print(f"      📝 协作 {i+1}: {request}")
            
            try:
                start_time = time.time()
                result = self.cross_system.call_cli(
                    source_cli=source_cli,
                    target_cli=target_cli,
                    request=request,
                    auto_install=True  # 允许自动安装以演示完整流程
                )
                execution_time = time.time() - start_time
                
                demo_result = {
                    'collaboration_number': i+1,
                    'source_cli': source_cli,
                    'target_cli': target_cli,
                    'request': request,
                    'success': result['success'],
                    'execution_time': execution_time,
                    'command_used': result.get('command_used', ''),
                    'install_used': result.get('install_used', False),
                    'fallback_used': result.get('fallback_used', False),
                    'response_length': len(result.get('response', ''))
                }
                
                self.demo_results['cross_cli_demos'].append(demo_result)
                
                status_icon = "✅" if result['success'] else "❌"
                print(f"         {status_icon} 协作: {'成功' if result['success'] else '失败'}")
                print(f"         ⏱️  时间: {execution_time:.2f}s")
                if result.get('install_used'):
                    print(f"         🔧 安装: 是")
                if result.get('fallback_used'):
                    print(f"         🛡️  降级: {result.get('fallback_level', 'unknown')}")
                
                # 显示响应预览
                response = result.get('response', '')
                if response:
                    preview = response[:200] + '...' if len(response) > 200 else response
                    print(f"         📄 响应预览: {preview}")
                
            except Exception as e:
                print(f"         ❌ 协作失败: {e}")
                self.demo_results['cross_cli_demos'].append({
                    'collaboration_number': i+1,
                    'source_cli': source_cli,
                    'target_cli': target_cli,
                    'request': request,
                    'error': str(e),
                    'exception': True
                })
    
    def demo_fallback_mechanism(self):
        """演示优雅降级机制"""
        print("      🛡️ 测试优雅降级机制...")
        
        # 测试场景1: 完全不存在的CLI
        print("      📝 场景1: 不存在的CLI")
        try:
            result = self.cross_system.call_cli(
                source_cli='demo',
                target_cli='nonexistent_ai_tool',
                request='生成Python代码示例',
                auto_install=False
            )
            
            demo_result = {
                'scenario': 'nonexistent_cli',
                'target_cli': 'nonexistent_ai_tool',
                'success': result.get('success', False),
                'fallback_used': result.get('fallback_used', False),
                'fallback_level': result.get('fallback_level', ''),
                'response_type': 'guidance' if '安装指导' in result.get('response', '') else 'other'
            }
            
            self.demo_results['fallback_demos'].append(demo_result)
            
            print(f"         ✅ 降级处理: {'成功' if result.get('success') else '失败'}")
            print(f"         🛡️  降级级别: {result.get('fallback_level', 'unknown')}")
            
        except Exception as e:
            print(f"         ❌ 降级测试失败: {e}")
        
        # 测试场景2: 存在但执行失败的CLI
        overview = self.cross_system.get_system_overview()
        available_clis = [name for name, status in overview['cli_status'].items() if status['exists']]
        
        if available_clis:
            print("      📝 场景2: 可用CLI的降级处理")
            test_cli = available_clis[0]
            
            try:
                result = self.cross_system.call_cli(
                    source_cli='demo',
                    target_cli=test_cli,
                    request='故意制造的无效请求 @#$%^&*()',
                    auto_install=False
                )
                
                demo_result = {
                    'scenario': 'invalid_request',
                    'target_cli': test_cli,
                    'success': result.get('success', False),
                    'fallback_used': result.get('fallback_used', False),
                    'fallback_level': result.get('fallback_level', ''),
                    'response_type': 'error_handling' if '错误' in result.get('response', '') else 'other'
                }
                
                self.demo_results['fallback_demos'].append(demo_result)
                
                print(f"         ✅ 错误处理: {'成功' if result.get('success') else '失败'}")
                if result.get('fallback_used'):
                    print(f"         🛡️  降级级别: {result.get('fallback_level', 'unknown')}")
                
            except Exception as e:
                print(f"         ❌ 错误处理测试失败: {e}")
    
    def demo_hook_system(self):
        """演示Hook系统"""
        print("      🪝 初始化Hook系统...")
        
        try:
            # 安装Shell Hook
            install_result = self.hook_manager.install_shell_hooks()
            
            demo_result = {
                'hook_installation': {
                    'success': install_result['success'],
                    'shell_type': install_result.get('shell_type', 'unknown'),
                    'integration_method': install_result.get('integration_method', 'unknown'),
                    'hooks_count': len(install_result.get('installed_hooks', [])),
                    'message': install_result.get('message', '')
                }
            }
            
            self.demo_results['hook_demos'].append(demo_result)
            
            if install_result['success']:
                print(f"         ✅ Hook安装成功: {install_result['shell_type']}")
                print(f"         🔗 集成方式: {install_result.get('integration_method', 'unknown')}")
                print(f"         📁 Hook文件: {len(install_result.get('installed_hooks', []))}")
                
                # 获取Hook状态
                hook_status = self.hook_manager.get_hook_status()
                print(f"         📊 Hook状态:")
                print(f"            📄 事件处理器: {len(hook_status.get('active_processors', []))}")
                print(f"            🎯 模式匹配器: {len(hook_status.get('pattern_matchers', []))}")
                print(f"            📝 Hook脚本: {len(hook_status.get('hook_scripts', []))}")
                
                # 处理待处理事件
                self.hook_manager.process_pending_events()
                print(f"            🔄 待处理事件: 已处理")
                
            else:
                print(f"         ❌ Hook安装失败: {install_result.get('message', 'unknown error')}")
        
        except Exception as e:
            print(f"         ❌ Hook系统演示失败: {e}")
            self.demo_results['hook_demos'].append({'error': str(e)})
    
    def demo_user_interaction_scenarios(self):
        """演示用户交互场景"""
        scenarios = [
            {
                'name': '代码生成场景',
                'description': '用户想要生成特定功能的代码',
                'user_input': '使用claude生成一个Python Web API',
                'expected_behavior': '检测跨CLI意图，调用claude生成代码'
            },
            {
                'name': '代码分析场景', 
                'description': '用户想要分析现有代码',
                'user_input': '请iflow帮我分析这个项目的代码结构',
                'expected_behavior': '检测跨CLI意图，调用iflow进行分析'
            },
            {
                'name': '调试协助场景',
                'description': '用户遇到bug需要帮助',
                'user_input': 'call copilot to debug this authentication issue',
                'expected_behavior': '检测跨CLI意图，调用copilot进行调试'
            },
            {
                'name': '文档生成场景',
                'description': '用户需要生成技术文档',
                'user_input': 'using gemini create API documentation',
                'expected_behavior': '检测跨CLI意图，调用gemini生成文档'
            }
        ]
        
        for scenario in scenarios:
            print(f"      🎭 场景: {scenario['name']}")
            print(f"         📝 描述: {scenario['description']}")
            print(f"         💬 用户输入: '{scenario['user_input']}'")
            print(f"         🎯 预期行为: {scenario['expected_behavior']}")
            
            try:
                # 模拟Hook系统检测跨CLI意图
                intent = self.hook_manager._detect_cross_cli_patterns(scenario['user_input'])
                
                if intent:
                    print(f"         ✅ 意图检测: 成功")
                    print(f"            🎯 目标CLI: {intent['target_clis']}")
                    print(f"            📊 置信度: {intent['confidence']}")
                    print(f"            🔍 检测模式: {intent['pattern']}")
                    
                    # 检查目标CLI是否可用
                    for target_cli in intent['target_clis']:
                        status = self.cross_system.check_cli_status(target_cli)
                        if status['exists']:
                            print(f"            ✅ {target_cli}: 可用 ({status['best_method']})")
                        else:
                            print(f"            ❌ {target_cli}: 未安装")
                            print(f"            🔧 安装命令: {status['install_command']}")
                else:
                    print(f"         ⚠️ 意图检测: 未检测到跨CLI协作意图")
                
                demo_result = {
                    'scenario_name': scenario['name'],
                    'user_input': scenario['user_input'],
                    'intent_detected': intent is not None,
                    'target_clis': intent.get('target_clis', []) if intent else [],
                    'confidence': intent.get('confidence', 0) if intent else 0,
                    'detected_pattern': intent.get('pattern', '') if intent else ''
                }
                
                self.demo_results['user_interaction_scenarios'].append(demo_result)
                
            except Exception as e:
                print(f"         ❌ 场景演示失败: {e}")
                self.demo_results['user_interaction_scenarios'].append({
                    'scenario_name': scenario['name'],
                    'error': str(e)
                })
            
            print()
    
    def generate_demo_report(self):
        """生成演示报告"""
        self.demo_results['end_time'] = datetime.now().isoformat()
        
        # 计算统计数据
        stats = {
            'total_demos': 0,
            'successful_demos': 0,
            'demo_types': {
                'cli_status_tests': len(self.demo_results.get('cli_status_tests', [])),
                'direct_call_demos': len(self.demo_results.get('direct_call_demos', [])),
                'cross_cli_demos': len(self.demo_results.get('cross_cli_demos', [])),
                'fallback_demos': len(self.demo_results.get('fallback_demos', [])),
                'hook_demos': len(self.demo_results.get('hook_demos', [])),
                'user_interaction_scenarios': len(self.demo_results.get('user_interaction_scenarios', []))
            }
        }
        
        # 计算成功演示数量
        for demo_type in ['direct_call_demos', 'cross_cli_demos', 'fallback_demos']:
            demos = self.demo_results.get(demo_type, [])
            stats['total_demos'] += len(demos)
            stats['successful_demos'] += len([d for d in demos if d.get('success', False) and not d.get('exception', False)])
        
        self.demo_results['statistics'] = stats
        
        # 保存演示报告
        report_dir = Path(__file__).parent.parent / 'demo_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'cross_cli_demo_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        try:
            safe_file_write(str(report_file), str(self.demo_results))
            print(f"      📄 演示报告已保存: {report_file}")
        except Exception as e:
            print(f"      ⚠️ 保存演示报告失败: {e}")
        
        # 打印总结
        print(f"      📊 演示统计:")
        print(f"         总演示数: {stats['total_demos']}")
        print(f"         成功演示: {stats['successful_demos']}")
        print(f"         成功率: {stats['successful_demos']/stats['total_demos']:.1%}" if stats['total_demos'] > 0 else "         成功率: N/A")
        
        print(f"      📋 演示类型分布:")
        for demo_type, count in stats['demo_types'].items():
            if count > 0:
                print(f"         {demo_type}: {count}")

def main():
    """主函数"""
    print("🎬 真实跨CLI集成演示程序")
    print("基于真实CLI架构，严格禁止推测")
    print()
    
    demo = RealCrossCLIDemo()
    demo.run_complete_demo()
    
    # 交互式选择
    print("\n" + "=" * 70)
    print("🎯 演示完成! 您想要:")
    print("1. 查看详细演示结果")
    print("2. 测试特定的跨CLI调用")
    print("3. 重新运行特定演示")
    print("4. 安装和使用Hook系统")
    print("5. 退出")
    
    try:
        choice = input("\n请选择 (1-5): ").strip()
        
        if choice == "1":
            print("\n📋 详细演示结果:")
            print("=" * 50)
            print(json.dumps(demo.demo_results, indent=2, ensure_ascii=False, default=str))
        
        elif choice == "2":
            # 获取系统概览
            overview = demo.cross_system.get_system_overview()
            available_clis = [name for name, status in overview['cli_status'].items() if status['exists']]
            
            if available_clis:
                print(f"\n🔧 可用的CLI: {', '.join(available_clis)}")
                source = input("源CLI (或直接按回车使用'user'): ").strip() or "user"
                target = input("目标CLI: ").strip().lower()
                request = input("测试请求: ").strip()
                
                if target in available_clis or target not in demo.cross_system.cli_methods:
                    print(f"\n🚀 测试跨CLI调用: {source} -> {target}")
                    result = demo.cross_system.call_cli(
                        source_cli=source,
                        target_cli=target,
                        request=request,
                        auto_install=True
                    )
                    
                    print(f"✅ 成功: {result['success']}")
                    print(f"🔧 命令: {result.get('command_used', 'N/A')}")
                    print(f"⏱️  时间: {result.get('execution_time', 0):.2f}s")
                    
                    response = result.get('response', '')
                    if response:
                        print(f"📄 响应: {response[:500]}...")
                    
                    if result.get('fallback_used'):
                        print(f"🛡️ 降级: {result.get('fallback_level', 'unknown')}")
                    
                    if result.get('install_used'):
                        print(f"🔧 安装: 是")
                else:
                    print("❌ 目标CLI不可用或不存在")
            else:
                print("❌ 没有可用的CLI进行测试")
        
        elif choice == "3":
            print("\n🔄 选择要重新运行的演示:")
            print("1. CLI状态检查")
            print("2. 直接CLI调用")
            print("3. 跨CLI协作")
            print("4. 优雅降级")
            print("5. Hook系统")
            print("6. 用户交互场景")
            
            sub_choice = input("请选择 (1-6): ").strip()
            
            if sub_choice == "1":
                demo.demo_cli_status_check()
            elif sub_choice == "2":
                demo.demo_direct_cli_calls()
            elif sub_choice == "3":
                demo.demo_cross_cli_collaboration()
            elif sub_choice == "4":
                demo.demo_fallback_mechanism()
            elif sub_choice == "5":
                demo.demo_hook_system()
            elif sub_choice == "6":
                demo.demo_user_interaction_scenarios()
        
        elif choice == "4":
            print("\n🪝 安装和使用Hook系统...")
            install_result = demo.hook_manager.install_shell_hooks()
            
            if install_result['success']:
                print(f"✅ Hook安装成功: {install_result['shell_type']}")
                print(f"📁 Hook目录: {demo.hook_manager.hook_dir}")
                
                shell_type = install_result['shell_type']
                if shell_type == 'bash':
                    print("\n📖 在Bash中使用:")
                    print(f"   source {demo.hook_manager.hook_dir}/hook_scripts/load_bash_hooks.sh")
                elif shell_type == 'powershell':
                    print("\n📖 在PowerShell中使用:")
                    print("   重新启动PowerShell，Hook会自动加载")
                elif shell_type == 'zsh':
                    print("\n📖 在Zsh中使用:")
                    print(f"   source {demo.hook_manager.hook_dir}/hook_scripts/zsh_hooks.zsh")
                else:
                    print("\n📖 手动加载Hook脚本到你的Shell配置")
                
                print("\n🔍 Hook现在可以检测如下模式:")
                print("   'call claude to analyze this file'")
                print("   'using gemini generate code'")
                print("   'ask copilot help with debugging'")
                
            else:
                print(f"❌ Hook安装失败: {install_result.get('message', 'unknown error')}")
        
        elif choice == "5":
            print("\n👋 退出演示程序")
        
        else:
            print("\n❌ 无效选择")
    
    except KeyboardInterrupt:
        print("\n👋 演示程序被中断")
    except Exception as e:
        print(f"\n❌ 选择处理错误: {e}")

if __name__ == '__main__':
    main()