"""
集成演示脚本 - 真实跨CLI协作系统
基于真实参数规范，文件上下文传递，自动化参数
"""

import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent))

def main():
    print("🚀 真实跨CLI协作系统 - 完整演示")
    print("=" * 60)
    print("✅ 基于真实CLI参数规范")
    print("✅ 使用文件传递上下文")
    print("✅ 自动化参数配置")
    print("✅ 处理已安装和未安装CLI")
    print("=" * 60)
    
    # 选择运行模式
    print("\n🎯 选择运行模式:")
    print("1. 快速测试 - 检查CLI状态并测试调用")
    print("2. 详细演示 - 完整功能演示")
    print("3. 交互测试 - 手动测试跨CLI调用")
    print("4. Hook系统 - 安装和测试Shell Hook")
    print("5. 安装指南 - 显示各CLI安装命令")
    
    try:
        choice = input("\n请选择 (1-5): ").strip()
        
        if choice == "1":
            print("\n🚀 运行快速测试...")
            from quick_test import quick_test
            quick_test()
        
        elif choice == "2":
            print("\n🎬 运行详细演示...")
            from demo_real_cross_cli import RealCrossCLIDemo
            demo = RealCrossCLIDemo()
            demo.run_complete_demo()
        
        elif choice == "3":
            print("\n🔧 交互测试...")
            from src.core.verified_cross_cli_system import VerifiedCrossCLISystem
            system = VerifiedCrossCLISystem()
            
            # 显示可用CLI
            available_clis = []
            for cli_name in system.cli_specs:
                status = system.check_cli_availability(cli_name)
                if status['exists']:
                    available_clis.append(cli_name)
                    print(f"   ✅ {cli_name}: {status['best_method']}")
            
            if available_clis:
                print(f"\n找到 {len(available_clis)} 个可用CLI")
                
                # 获取用户输入
                target_cli = input(f"目标CLI ({', '.join(available_clis)}): ").strip().lower()
                request = input("请求内容: ").strip()
                
                if target_cli in available_clis and request:
                    print(f"\n🚀 测试 {target_cli}...")
                    
                    result = system.call_cli_with_file_context(
                        source_cli='user',
                        target_cli=target_cli,
                        request=request,
                        auto_mode=True,
                        timeout=60
                    )
                    
                    print(f"✅ 结果: {'成功' if result['success'] else '失败'}")
                    print(f"⏱️  时间: {result.get('execution_time', 0):.2f}s")
                    print(f"🔧 命令: {result.get('command_used', 'N/A')}")
                    
                    if result.get('response'):
                        preview = result['response'][:500] + '...' if len(result['response']) > 500 else result['response']
                        print(f"📄 响应:\n{preview}")
                else:
                    print("❌ 无效的CLI或请求")
            else:
                print("❌ 没有可用的CLI")
        
        elif choice == "4":
            print("\n🪝 Hook系统演示...")
            from src.core.direct_cli_hook_system import DirectCLIHookManager
            hook_manager = DirectCLIHookManager()
            
            install_result = hook_manager.install_shell_hooks()
            
            if install_result['success']:
                print(f"✅ Hook安装成功: {install_result['shell_type']}")
                print(f"📁 Hook目录: {hook_manager.hook_dir}")
                print(f"🔗 集成方式: {install_result.get('integration_method', 'unknown')}")
                
                print("\n📖 使用说明:")
                if install_result['shell_type'] == 'bash':
                    print("   source ~/.direct_cli_hooks/hook_scripts/load_bash_hooks.sh")
                elif install_result['shell_type'] == 'powershell':
                    print("   重新启动PowerShell，Hook自动加载")
                elif install_result['shell_type'] == 'zsh':
                    print("   source ~/.direct_cli_hooks/hook_scripts/zsh_hooks.zsh")
                
                print("\n🔍 Hook可以检测:")
                print("   'call claude to analyze this file'")
                print("   'using gemini generate code'")
                print("   'ask copilot help with debugging'")
            else:
                print(f"❌ Hook安装失败: {install_result.get('message', 'unknown')}")
        
        elif choice == "5":
            print("\n📦 CLI安装指南:")
            from src.core.verified_cross_cli_system import VerifiedCrossCLISystem
            system = VerifiedCrossCLISystem()
            
            for cli_name, spec in system.cli_specs.items():
                status = system.check_cli_availability(cli_name)
                status_icon = "✅" if status['exists'] else "❌"
                print(f"\n{status_icon} {spec.name}")
                print(f"   类型: {spec.type}")
                print(f"   安装: {spec.install_command}")
                print(f"   版本检查: {spec.version_check}")
                print(f"   自动参数: {', '.join(spec.auto_params[:2])}")
                print(f"   API环境变量: {spec.api_env or 'N/A'}")
                
                if status['exists']:
                    print(f"   最佳命令: {status['best_method']}")
                    if status.get('version_info'):
                        print(f"   当前版本: {status['version_info']}")
        
        else:
            print("❌ 无效选择")
    
    except KeyboardInterrupt:
        print("\n👋 用户中断")
    except Exception as e:
        print(f"\n❌ 错误: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 演示完成!")
    print("基于真实CLI参数规范 - 严格禁止推测")
    print("=" * 60)

if __name__ == '__main__':
    main()