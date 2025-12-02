"""
快速验证测试 - 真实CLI调用系统
立即验证所有真实CLI参数是否正确工作
"""

import os
import sys
import time
from pathlib import Path

# 添加项目路径
sys.path.append(str(Path(__file__).parent.parent))
sys.path.append(str(Path(__file__).parent))

from src.core.verified_cross_cli_system import VerifiedCrossCLISystem

def quick_test():
    """快速测试所有CLI"""
    print("🚀 快速验证真实CLI调用系统")
    print("=" * 50)
    
    system = VerifiedCrossCLISystem()
    
    # 1. 检查所有CLI状态
    print("📊 检查CLI状态...")
    available_clis = []
    
    for cli_name in system.cli_specs:
        status = system.check_cli_availability(cli_name)
        if status['exists']:
            available_clis.append(cli_name)
            print(f"   ✅ {cli_name}: {status['best_method']}")
            if status.get('version_info'):
                print(f"      📋 版本: {status['version_info']}")
        else:
            print(f"   ❌ {cli_name}: 未安装")
    
    # 2. 如果有可用CLI，进行快速测试
    if available_clis:
        print(f"\n🎯 找到 {len(available_clis)} 个可用CLI，开始测试...")
        
        test_cli = available_clis[0]
        print(f"   测试CLI: {test_cli}")
        
        # 创建测试文件
        test_file = Path.cwd() / 'quick_test.py'
        test_content = '''# 测试代码
def quick_function():
    return "Hello from test"

if __name__ == "__main__":
    print(quick_function())
'''
        
        try:
            # 写入测试文件
            with open(test_file, 'w', encoding='utf-8') as f:
                f.write(test_content)
            
            # 执行快速测试
            result = system.call_cli_with_file_context(
                source_cli='quick_test',
                target_cli=test_cli,
                request='快速分析这个Python文件',
                context_files=[str(test_file)],
                auto_mode=True,
                timeout=30
            )
            
            print(f"   📊 测试结果: {'✅ 成功' if result['success'] else '❌ 失败'}")
            print(f"   ⏱️  时间: {result.get('execution_time', 0):.2f}s")
            print(f"   🔧 命令: {result.get('command_used', 'N/A')}")
            
            if result.get('response'):
                preview = result['response'][:200] + '...' if len(result['response']) > 200 else result['response']
                print(f"   📄 响应: {preview}")
            
            if result.get('fallback_used'):
                print(f"   🛡️  降级: {result.get('fallback_level', 'unknown')}")
            
            # 清理测试文件
            if test_file.exists():
                test_file.unlink()
                
        except Exception as e:
            print(f"   ❌ 测试异常: {e}")
    
    else:
        print("\n⚠️ 没有找到可用的CLI")
        print("   请安装至少一个CLI:")
        for cli_name, spec in system.cli_specs.items():
            print(f"   - {spec.name}: {spec.install_command}")
    
    # 3. 显示系统信息
    print(f"\n📋 系统信息:")
    print(f"   支持的CLI: {len(system.cli_specs)}")
    print(f"   可用的CLI: {len(available_clis)}")
    print(f"   上下文目录: {system.context_dir}")
    print(f"   内存目录: {system.memory_dir}")

if __name__ == '__main__':
    quick_test()
    print("\n✅ 快速测试完成!")