#!/usr/bin/env python3
"""
测试统一CLI扫描器
"""
import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from src.core.unified_cli_scanner import UnifiedCLIScanner

async def test_scanner():
    print("[INFO] 测试统一CLI扫描器...")
    
    scanner = UnifiedCLIScanner()
    
    # 扫描所有CLI工具
    results = await scanner.scan_all_clis()
    
    print(f"\n[SCAN] 扫描结果 (找到 {len(results)} 个工具):")
    print("-" * 60)

    for name, info in results.items():
        availability = scanner.validate_availability(info)
        status = "YES" if availability else "NO"
        print(f"[{status}] {name:12} | 命令: {info.execute_command:15} | 位置: {info.location:6} | 版本: {info.version}")

    print(f"\n[DETAILS] 详细信息:")
    print("-" * 60)

    for name, info in results.items():
        print(f"\n{name}:")
        print(f"  - 执行命令: {info.execute_command}")
        print(f"  - 位置: {info.location}")
        print(f"  - 是否全局: {info.is_global}")
        print(f"  - 版本: {info.version}")
        print(f"  - 可用性: {'是' if scanner.validate_availability(info) else '否'}")
        print(f"  - 执行指南: {scanner.get_execution_guide(info)}")

    # 生成综合报告
    print(f"\n[REPORT] 综合扫描报告:")
    print("-" * 60)
    report = await scanner.get_comprehensive_scan_report()
    summary = report['summary']
    print(f"总计扫描: {summary['total_scanned']}")
    print(f"可用数量: {summary['available']}")
    print(f"全局包: {summary['global_packages']}")
    print(f"本地包: {summary['local_packages']}")
    print(f"npx包: {summary['npx_packages']}")

    if report['recommendations']:
        print(f"\n[SUGGESTIONS] 建议:")
        for rec in report['recommendations']:
            print(f"  - {rec}")

if __name__ == "__main__":
    asyncio.run(test_scanner())