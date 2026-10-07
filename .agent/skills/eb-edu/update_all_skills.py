#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新所有 skill.py 文件，添加跨平台兼容性

功能：
- 添加 skill_utils 导入
- 替换 print 为 cross_platform_print
- 替换 input 为 cross_platform_input
- 添加 UTF-8 编码声明
"""

import os
import re


def update_skill_file(file_path):
    """更新单个 skill 文件"""
    
    print(f"处理文件：{file_path}")
    
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经更新
    if 'from skill_utils import' in content:
        print(f"  ✅ 已更新，跳过")
        return False
    
    # 1. 添加编码声明（如果缺少）
    if not content.startswith('#!/usr/bin/env python3\n# -*- coding: utf-8 -*-'):
        if content.startswith('#!/usr/bin/env python3'):
            content = content.replace(
                '#!/usr/bin/env python3',
                '#!/usr/bin/env python3\n# -*- coding: utf-8 -*-'
            )
        else:
            content = '#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n' + content
    
    # 2. 添加 skill_utils 导入（在现有 import 之后）
    import_section = """
# 导入跨平台工具
import os
import sys

# 添加 skill_utils 到路径
script_dir = os.path.dirname(os.path.abspath(__file__))
utils_path = os.path.join(script_dir, "..", "..")
if utils_path not in sys.path:
    sys.path.insert(0, utils_path)

try:
    from skill_utils import (
        cross_platform_print,
        cross_platform_input,
        safe_json_loads,
        run_command_safe,
        get_resource_path
    )
except ImportError:
    # 备用函数
    def cross_platform_print(text):
        print(text)
    def cross_platform_input(prompt):
        print(prompt)
        return input()
    def safe_json_loads(json_str):
        import json
        try:
            return json.loads(json_str)
        except:
            return {}
    def run_command_safe(command, timeout=30):
        import subprocess
        try:
            result = subprocess.run(
                command, shell=True, capture_output=True,
                text=True, timeout=timeout, encoding='utf-8'
            )
            return (result.returncode == 0, result.stdout, result.stderr)
        except:
            return (False, "", "Error")
    def get_resource_path(relative_path):
        return os.path.join(script_dir, relative_path)

"""
    
    # 找到最后一个 import 语句
    import_match = re.search(r'^(import .+|from .+)', content, re.MULTILINE)
    if import_match:
        # 在最后一个 import 之后插入
        insert_pos = import_match.end()
        # 找到行尾
        while insert_pos < len(content) and content[insert_pos] != '\n':
            insert_pos += 1
        insert_pos += 1  # 跳过换行符
        content = content[:insert_pos] + import_section + content[insert_pos:]
    else:
        # 在文件开头插入
        content = import_section + content
    
    # 3. 替换 print 为 cross_platform_print（仅在函数内部）
    # 注意：不替换 docstring 中的 print
    content = re.sub(
        r'(?<!#)(?<!["\'])(?<!["\']\')print\(',
        r'cross_platform_print(',
        content
    )
    
    # 4. 替换 input 为 cross_platform_input
    content = re.sub(
        r'(?<!#)(?<!["\'])(?<!["\']\')input\(',
        r'cross_platform_input(',
        content
    )
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ 更新完成")
    return True


def main():
    """主函数"""
    print("=" * 60)
    print("批量更新 skill.py 文件 - 添加跨平台兼容性")
    print("=" * 60)
    
    # 查找所有 skill.py 文件
    base_dir = os.path.dirname(os.path.abspath(__file__))
    student_dir = os.path.join(base_dir, "student")
    teacher_dir = os.path.join(base_dir, "teacher")
    
    updated_count = 0
    
    # 处理 student 目录
    if os.path.exists(student_dir):
        print("\n处理 student 目录:")
        for item in os.listdir(student_dir):
            skill_path = os.path.join(student_dir, item)
            if os.path.isdir(skill_path):
                skill_file = os.path.join(skill_path, "skill.py")
                if os.path.exists(skill_file):
                    if update_skill_file(skill_file):
                        updated_count += 1
    
    # 处理 teacher 目录
    if os.path.exists(teacher_dir):
        print("\n处理 teacher 目录:")
        for item in os.listdir(teacher_dir):
            skill_path = os.path.join(teacher_dir, item)
            if os.path.isdir(skill_path):
                skill_file = os.path.join(skill_path, "skill.py")
                if os.path.exists(skill_file):
                    if update_skill_file(skill_file):
                        updated_count += 1
    
    print("\n" + "=" * 60)
    print(f"更新完成！共更新 {updated_count} 个文件")
    print("=" * 60)


if __name__ == "__main__":
    main()
