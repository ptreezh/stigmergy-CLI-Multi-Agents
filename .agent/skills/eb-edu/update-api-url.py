#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新 Skills 的 API URL

用法：
python update-api-url.py --url https://YOUR_PROJECT.up.railway.app/api/v1
"""

import os
import re
import argparse


def update_api_url(file_path, new_url):
    """更新文件中的 API URL"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换 API_BASE_URL
    old_pattern = r"API_BASE_URL\s*=\s*['\"][^'\"]+['\"]"
    new_line = f'API_BASE_URL = "{new_url}"'
    
    if re.search(old_pattern, content):
        content = re.sub(old_pattern, new_line, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    parser = argparse.ArgumentParser(description='批量更新 Skills 的 API URL')
    parser.add_argument('--url', required=True, help='新的 API URL')
    args = parser.parse_args()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    student_dir = os.path.join(base_dir, 'student')
    teacher_dir = os.path.join(base_dir, 'teacher')
    
    updated_count = 0
    
    # 更新 student 目录
    if os.path.exists(student_dir):
        for item in os.listdir(student_dir):
            skill_path = os.path.join(student_dir, item)
            if os.path.isdir(skill_path):
                skill_file = os.path.join(skill_path, 'skill.py')
                if os.path.exists(skill_file):
                    if update_api_url(skill_file, args.url):
                        updated_count += 1
                        print(f"✅ 更新：{item}/skill.py")
    
    # 更新 teacher 目录
    if os.path.exists(teacher_dir):
        for item in os.listdir(teacher_dir):
            skill_path = os.path.join(teacher_dir, item)
            if os.path.isdir(skill_path):
                skill_file = os.path.join(skill_path, 'skill.py')
                if os.path.exists(skill_file):
                    if update_api_url(skill_file, args.url):
                        updated_count += 1
                        print(f"✅ 更新：{item}/skill.py")
    
    print(f"\n完成！共更新 {updated_count} 个文件")
    print(f"新的 API URL: {args.url}")


if __name__ == "__main__":
    main()
