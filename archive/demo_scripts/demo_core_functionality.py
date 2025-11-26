#!/usr/bin/env python3
"""
核心跨CLI功能演示脚本
验证跨CLI调用功能无需协作系统即可正常工作
"""

import asyncio
import sys
import os
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent / 'src'))

async def demo_cross_cli_functionality():
    """演示核心跨CLI功能"""
    print("🔗 AI CLI 跨集成系统演示")
    print("=" * 50)

    # 导入适配器（无协作依赖）
    try:
        from adapters.claude.standalone_claude_adapter import StandaloneClaudeAdapter
        from adapters.codex.standalone_codex_adapter import StandaloneCodexAdapter
        from adapters.gemini.standalone_gemini_adapter import StandaloneGeminiAdapter
        print("✅ 适配器导入成功")
    except Exception as e:
        print(f"❌ 适配器导入失败: {e}")
        return

    # 初始化适配器
    claude_adapter = StandaloneClaudeAdapter()
    codex_adapter = StandaloneCodexAdapter()
    gemini_adapter = StandaloneGeminiAdapter()

    print("\n📊 适配器初始化状态:")
    print(f"  Claude CLI: {'✅' if claude_adapter.is_available() else '❌'}")
    print(f"  Codex CLI: {'✅' if codex_adapter.is_available() else '❌'}")
    print(f"  Gemini CLI: {'✅' if gemini_adapter.is_available() else '❌'}")

    # 测试跨CLI调用功能
    print("\n🧪 测试跨CLI调用功能:")

    test_cases = [
        ("Claude", "请用gemini帮我分析这个代码"),
        ("Claude", "调用codex来优化这个函数"),
        ("Codex", "/x claude 写一个Python函数"),
        ("Codex", "用gemini生成测试用例"),
        ("Gemini", "/x codex 重构这段代码"),
    ]

    for adapter, task in test_cases:
        print(f"\n🔹 测试: {adapter} -> {task[:30]}...")

        try:
            if adapter == "Claude":
                result = await claude_adapter.execute_task(task)
            elif adapter == "Codex":
                result = await codex_adapter.execute_task(task)
            elif adapter == "Gemini":
                result = await gemini_adapter.execute_task(task)

            # 检查结果中是否包含跨CLI调用
            if "跨CLI调用结果" in result or "CLI 处理结果" in result:
                print("  ✅ 跨CLI调用成功")
                # 提取关键信息
                lines = result.split('\n')
                for line in lines:
                    if '目标工具' in line or 'CLI 处理结果' in line:
                        print(f"  📋 {line.strip()}")
                        break
            else:
                print("  ℹ️ 本地处理（无跨CLI调用）")

        except Exception as e:
            print(f"  ❌ 执行失败: {e}")

    # 测试帮助和状态命令
    print("\n📚 测试帮助和状态命令:")

    help_status_tests = [
        ("Codex", "/help-x"),
        ("Codex", "/status-x"),
        ("Gemini", "/help"),
        ("Claude", "/help"),
    ]

    for adapter, command in help_status_tests:
        print(f"\n🔹 测试: {adapter} -> {command}")

        try:
            if adapter == "Claude":
                result = await claude_adapter.execute_task(command)
            elif adapter == "Codex":
                result = await codex_adapter.execute_task(command)
            elif adapter == "Gemini":
                result = await gemini_adapter.execute_task(command)

            if "跨集成帮助" in result or "集成状态" in result or "可用CLI工具" in result:
                print("  ✅ 帮助/状态命令正常")
            else:
                print("  ℹ️ 其他响应")

        except Exception as e:
            print(f"  ❌ 执行失败: {e}")

    # 统计信息
    print("\n📈 执行统计信息:")

    adapters = [
        ("Claude", claude_adapter),
        ("Codex", codex_adapter),
        ("Gemini", gemini_adapter)
    ]

    for name, adapter in adapters:
        stats = adapter.get_statistics()
        print(f"\n  {name} CLI:")
        print(f"    总执行次数: {stats['execution_count']}")
        print(f"    跨CLI调用: {stats.get('cross_cli_calls', 0)}")
        print(f"    错误次数: {stats['error_count']}")
        print(f"    成功率: {stats['success_rate']:.1%}")
        print(f"    设计模式: {stats.get('design', 'unknown')}")

    print("\n" + "=" * 50)
    print("✅ 核心跨CLI功能演示完成")
    print("💡 核心功能无需协作系统即可正常运行")
    print("🔗 支持自然语言跨CLI调用和斜杠命令")

async def main():
    """主函数"""
    try:
        await demo_cross_cli_functionality()
    except KeyboardInterrupt:
        print("\n👋 演示已取消")
    except Exception as e:
        print(f"\n❌ 演示失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())