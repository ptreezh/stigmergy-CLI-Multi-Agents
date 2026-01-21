#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据准备脚本 - 场域分析技能

功能：
- 自动扫描输入目录中的文本文件
- 按类型分类（扎根理论、社会网络、ESOC框架）
- 合并为统一的输入格式

输入：
- --input: 源数据目录路径

输出：
- input/processed/combined_input.json
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# 添加项目根目录
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


def scan_source_files(source_dir: Path) -> Dict[str, List[Path]]:
    """
    扫描源目录，分类文件
    
    分类规则：
    - 扎根理论: 包含"开放编码"、"选择性编码"、"饱和度检验"
    - 社会网络: 包含"社会网络"、"network"
    - ESOC框架: 包含"ESOC"、"理论框架"
    """
    files = {
        "grounded_theory": [],
        "social_network": [],
        "esoc_framework": []
    }
    
    if not source_dir.exists():
        print(f"错误: 源目录不存在: {source_dir}")
        return files
    
    # 扫描所有文本文件
    txt_files = list(source_dir.glob("*.txt"))
    
    for txt_file in txt_files:
        name = txt_file.name.lower()
        
        if "社会网络" in name or "network" in name:
            files["social_network"].append(txt_file)
        elif "esoc" in name or "理论框架" in name:
            files["esoc_framework"].append(txt_file)
        else:
            # 其他文件归类为扎根理论数据
            files["grounded_theory"].append(txt_file)
    
    return files


def read_text_file(file_path: Path) -> Dict[str, Any]:
    """读取文本文件，返回结构化数据"""
    if not file_path.exists():
        return {"error": f"文件不存在: {file_path}"}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取文件名作为标题
        title = file_path.stem
        
        # 简单统计
        lines = content.split('\n')
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        return {
            "source_file": str(file_path),
            "title": title,
            "content": content,
            "stats": {
                "chars": len(content),
                "lines": len(lines),
                "paragraphs": len(paragraphs)
            }
        }
    except Exception as e:
        return {"error": f"读取失败: {str(e)}"}


def merge_data(files: Dict[str, List[Path]]) -> Dict[str, Any]:
    """合并所有数据"""
    merged = {
        "metadata": {
            "sources": [],
            "grounded_theory_count": 0,
            "social_network_count": 0,
            "esoc_framework_count": 0,
            "total_files": 0,
            "merged_at": datetime.now().isoformat()
        },
        "grounded_theory": {
            "description": "扎根理论分析数据",
            "files": []
        },
        "social_network": {
            "description": "社会网络分析数据",
            "files": []
        },
        "esoc_framework": {
            "description": "ESOC-R理论框架数据",
            "files": []
        },
        "analysis_ready": True
    }
    
    # 处理扎根理论数据
    for file_path in sorted(files["grounded_theory"]):
        data = read_text_file(file_path)
        merged["grounded_theory"]["files"].append(data)
        merged["metadata"]["sources"].append(file_path.name)
    
    merged["metadata"]["grounded_theory_count"] = len(files["grounded_theory"])
    merged["metadata"]["total_files"] += len(files["grounded_theory"])
    
    # 处理社会网络数据
    for file_path in sorted(files["social_network"]):
        data = read_text_file(file_path)
        merged["social_network"]["files"].append(data)
        merged["metadata"]["sources"].append(file_path.name)
    
    merged["metadata"]["social_network_count"] = len(files["social_network"])
    merged["metadata"]["total_files"] += len(files["social_network"])
    
    # 处理ESOC框架数据
    for file_path in sorted(files["esoc_framework"]):
        data = read_text_file(file_path)
        merged["esoc_framework"]["files"].append(data)
        merged["metadata"]["sources"].append(file_path.name)
    
    merged["metadata"]["esoc_framework_count"] = len(files["esoc_framework"])
    merged["metadata"]["total_files"] += len(files["esoc_framework"])
    
    return merged


def main():
    """主函数"""
    # 解析命令行参数
    input_path = None
    output_path = None
    
    for i, arg in enumerate(sys.argv):
        if arg == "--input" and i + 1 < len(sys.argv):
            input_path = Path(sys.argv[i + 1])
        elif arg == "--output" and i + 1 < len(sys.argv):
            output_path = Path(sys.argv[i + 1])
    
    # 默认路径
    if input_path is None:
        # 默认输入路径：当前工作目录下的源数据
        input_path = Path.cwd() / "test_data" / "xiyouji_analysis"
    
    if output_path is None:
        # 默认输出路径：技能目录下的 workflow
        skill_dir = Path(__file__).parent.parent
        output_path = skill_dir / "field_analysis_workflow" / "input" / "processed"
    
    print("=" * 60)
    print("  场域分析技能 - 数据准备脚本")
    print("=" * 60)
    print(f"\n📁 源目录: {input_path}")
    print(f"📁 输出目录: {output_path}")
    
    # 扫描文件
    print("\n📂 扫描源目录...")
    files = scan_source_files(input_path)
    
    print(f"   扎根理论文件: {len(files['grounded_theory'])}")
    for f in files['grounded_theory'][:3]:
        print(f"     - {f.name}")
    if len(files['grounded_theory']) > 3:
        print(f"     ... 共 {len(files['grounded_theory'])} 个文件")
    
    print(f"   社会网络文件: {len(files['social_network'])}")
    for f in files['social_network']:
        print(f"     - {f.name}")
    
    print(f"   ESOC框架文件: {len(files['esoc_framework'])}")
    for f in files['esoc_framework']:
        print(f"     - {f.name}")
    
    # 合并数据
    print("\n📦 合并数据...")
    merged_data = merge_data(files)
    
    # 确保输出目录存在
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 写入输出文件
    output_file = output_path / "combined_input.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 数据准备完成!")
    print(f"   输出文件: {output_file}")
    print(f"   总文件数: {merged_data['metadata']['total_files']}")
    print(f"   扎根理论: {merged_data['metadata']['grounded_theory_count']}")
    print(f"   社会网络: {merged_data['metadata']['social_network_count']}")
    print(f"   ESOC框架: {merged_data['metadata']['esoc_framework_count']}")
    
    # 打印摘要
    print(f"\n📋 数据摘要:")
    print(f"   - 扎根理论段落数: {sum(f['stats']['paragraphs'] for f in merged_data['grounded_theory']['files'])}")
    print(f"   - 总字符数: {sum(f['stats']['chars'] for f in merged_data['grounded_theory']['files'])}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
