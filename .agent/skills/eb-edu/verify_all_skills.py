#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 - 批量验证所有 Skills

验证范围：
- 所有 student 目录的 Skills（26 个）
- 所有 teacher 目录的 Skills（31 个）
- 总计 57 个 Skills

验证内容：
- 文件存在性
- 可执行性（--help）
- JSON 配置有效性
- 跨平台兼容性
- 中文无乱码
"""

import os
import sys
import json
import subprocess


def verify_skill(skill_path):
    """验证单个 Skill"""
    result = {
        'name': os.path.basename(skill_path),
        'path': skill_path,
        'file_exists': False,
        'executable': False,
        'json_valid': False,
        'cross_platform': False,
        'chinese_ok': False,
        'errors': []
    }
    
    skill_file = os.path.join(skill_path, 'skill.py')
    json_file = os.path.join(skill_path, 'skill.json')
    
    # 测试 1: 文件存在性
    if os.path.exists(skill_file):
        result['file_exists'] = True
    else:
        result['errors'].append('skill.py 不存在')
        return result
    
    # 测试 2: JSON 配置有效性
    if os.path.exists(json_file):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            result['json_valid'] = True
            result['skill_name'] = config.get('name', 'N/A')
            result['description'] = config.get('description', 'N/A')[:50]
        except Exception as e:
            result['errors'].append(f'JSON 解析失败：{str(e)}')
    else:
        result['errors'].append('skill.json 不存在')
    
    # 测试 3: 可执行性（--help）
    try:
        proc = subprocess.run(
            ['python', skill_file, '--help'],
            capture_output=True,
            timeout=10,
            cwd=skill_path,
            encoding='utf-8'
        )
        if proc.returncode == 0:
            result['executable'] = True
            # 检查是否包含中文
            if any('\u4e00' <= c <= '\u9fff' for c in proc.stdout):
                result['chinese_ok'] = True
        else:
            result['errors'].append(f'执行失败：{proc.stderr[:100]}')
    except subprocess.TimeoutExpired:
        result['errors'].append('执行超时')
    except Exception as e:
        result['errors'].append(f'执行异常：{str(e)}')
    
    # 测试 4: 跨平台兼容性
    try:
        with open(skill_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否导入 skill_utils
        if 'from skill_utils import' in content or 'cross_platform_print' in content:
            result['cross_platform'] = True
        
        # 检查是否有 UTF-8 编码声明
        if '# -*- coding: utf-8 -*-' in content or '#!/usr/bin/env python3' in content:
            result['chinese_ok'] = True
    except Exception as e:
        result['errors'].append(f'代码检查失败：{str(e)}')
    
    return result


def print_result(result):
    """打印验证结果"""
    status = '✅' if all([
        result['file_exists'],
        result['executable'],
        result['json_valid'],
        result['cross_platform']
    ]) else '⚠️'
    
    print(f"{status} {result['name']}")
    if result['errors']:
        for error in result['errors']:
            print(f"   ❌ {error}")
    if result.get('skill_name'):
        print(f"   名称：{result['skill_name']}")
    if result.get('description'):
        print(f"   描述：{result['description']}...")


def main():
    """主函数"""
    print("=" * 80)
    print("电商 AI 实训平台 - 批量验证所有 Skills")
    print("=" * 80)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    student_dir = os.path.join(base_dir, 'student')
    teacher_dir = os.path.join(base_dir, 'teacher')
    
    all_results = []
    
    # 验证 student 目录
    if os.path.exists(student_dir):
        print("\n" + "=" * 80)
        print("验证 student 目录 Skills")
        print("=" * 80)
        
        for item in sorted(os.listdir(student_dir)):
            skill_path = os.path.join(student_dir, item)
            if os.path.isdir(skill_path):
                result = verify_skill(skill_path)
                all_results.append(result)
                print_result(result)
    
    # 验证 teacher 目录
    if os.path.exists(teacher_dir):
        print("\n" + "=" * 80)
        print("验证 teacher 目录 Skills")
        print("=" * 80)
        
        for item in sorted(os.listdir(teacher_dir)):
            skill_path = os.path.join(teacher_dir, item)
            if os.path.isdir(skill_path):
                result = verify_skill(skill_path)
                all_results.append(result)
                print_result(result)
    
    # 统计结果
    print("\n" + "=" * 80)
    print("验证统计")
    print("=" * 80)
    
    total = len(all_results)
    passed = sum(1 for r in all_results if all([
        r['file_exists'],
        r['executable'],
        r['json_valid'],
        r['cross_platform']
    ]))
    
    file_exists = sum(1 for r in all_results if r['file_exists'])
    executable = sum(1 for r in all_results if r['executable'])
    json_valid = sum(1 for r in all_results if r['json_valid'])
    cross_platform = sum(1 for r in all_results if r['cross_platform'])
    chinese_ok = sum(1 for r in all_results if r['chinese_ok'])
    
    print(f"\n总 Skills 数：{total}")
    print(f"完全通过：{passed}/{total} ({passed/total*100:.1f}%)")
    print(f"\n详细统计:")
    print(f"  文件存在：{file_exists}/{total} ({file_exists/total*100:.1f}%)")
    print(f"  可执行：{executable}/{total} ({executable/total*100:.1f}%)")
    print(f"  JSON 配置有效：{json_valid}/{total} ({json_valid/total*100:.1f}%)")
    print(f"  跨平台兼容：{cross_platform}/{total} ({cross_platform/total*100:.1f}%)")
    print(f"  中文支持：{chinese_ok}/{total} ({chinese_ok/total*100:.1f}%)")
    
    # 失败的 Skills
    failed = [r for r in all_results if not all([
        r['file_exists'],
        r['executable'],
        r['json_valid'],
        r['cross_platform']
    ])]
    
    if failed:
        print(f"\n⚠️ 需要修复的 Skills ({len(failed)}个):")
        for r in failed:
            print(f"  - {r['name']}: {', '.join(r['errors'])}")
    else:
        print(f"\n✅ 所有 Skills 验证通过！")
    
    print("\n" + "=" * 80)
    
    # 返回退出码
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
