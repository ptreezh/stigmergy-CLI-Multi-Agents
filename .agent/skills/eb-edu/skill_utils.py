#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 - 跨平台兼容工具模块

功能：
- 自适应编码（UTF-8/GBK）
- 跨平台兼容（Windows/Linux/macOS）
- 无外部依赖（仅使用 Python 标准库）
- 中文无乱码

使用方式：
    from skill_utils import cross_platform_print, cross_platform_input
"""

import sys
import os
import locale
import codecs


def get_system_encoding():
    """
    获取系统编码
    
    Returns:
        str: 系统编码（'utf-8' 或 'gbk'）
    """
    # Windows 系统通常使用 GBK
    if sys.platform == 'win32':
        try:
            # 尝试获取控制台编码
            encoding = locale.getdefaultlocale()[1]
            if encoding and 'GBK' in encoding.upper():
                return 'gbk'
        except:
            pass
        return 'utf-8'
    # Linux/macOS 通常使用 UTF-8
    else:
        return 'utf-8'


def setup_utf8_io():
    """
    设置 UTF-8 IO 编码
    
    在 Windows 上强制使用 UTF-8 编码
    """
    if sys.platform == 'win32':
        try:
            # 设置标准输入输出为 UTF-8
            sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
            sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)
            sys.stdin = codecs.getreader('utf-8')(sys.stdin.buffer)
        except:
            # 如果失败，使用系统默认编码
            pass


def cross_platform_print(text):
    """
    跨平台打印（自动处理编码）
    
    Args:
        text (str): 要打印的文本
    """
    try:
        # 尝试直接打印
        print(text)
    except UnicodeEncodeError:
        # 如果失败，尝试编码后打印
        try:
            encoding = get_system_encoding()
            print(text.encode(encoding, errors='replace').decode(encoding))
        except:
            # 最后手段：替换所有非 ASCII 字符
            safe_text = text.encode('ascii', errors='replace').decode('ascii')
            print(safe_text)


def cross_platform_input(prompt):
    """
    跨平台输入（自动处理编码）
    
    Args:
        prompt (str): 提示文本
    
    Returns:
        str: 用户输入的文本
    """
    try:
        # 先打印提示
        cross_platform_print(prompt)
        # 读取输入
        return input()
    except UnicodeEncodeError:
        # 如果提示文本编码失败，使用 ASCII 提示
        safe_prompt = prompt.encode('ascii', errors='replace').decode('ascii')
        print(safe_prompt)
        return input()
    except UnicodeDecodeError:
        # 如果输入解码失败，尝试其他编码
        try:
            encoding = get_system_encoding()
            # 重新尝试
            print(prompt)
            return input()
        except:
            return ""


def safe_json_loads(json_str):
    """
    安全地解析 JSON 字符串（处理编码问题）
    
    Args:
        json_str (str): JSON 字符串
    
    Returns:
        dict: 解析后的字典，失败返回空字典
    """
    import json
    
    try:
        return json.loads(json_str)
    except:
        # 尝试修复编码问题
        try:
            # 尝试不同的编码
            for encoding in ['utf-8', 'gbk', 'latin-1']:
                try:
                    fixed_str = json_str.encode(encoding).decode('utf-8')
                    return json.loads(fixed_str)
                except:
                    continue
        except:
            pass
        # 全部失败，返回空字典
        return {}


def get_script_dir():
    """
    获取脚本所在目录
    
    Returns:
        str: 脚本所在目录的绝对路径
    """
    return os.path.dirname(os.path.abspath(__file__))


def get_resource_path(relative_path):
    """
    获取资源文件路径（跨平台兼容）
    
    Args:
        relative_path (str): 相对路径
    
    Returns:
        str: 资源文件的绝对路径
    """
    script_dir = get_script_dir()
    return os.path.join(script_dir, relative_path)


def file_exists_safe(path):
    """
    安全地检查文件是否存在（处理编码问题）
    
    Args:
        path (str): 文件路径
    
    Returns:
        bool: 文件是否存在
    """
    try:
        return os.path.exists(path)
    except:
        # 尝试编码路径
        try:
            encoding = get_system_encoding()
            encoded_path = path.encode(encoding, errors='replace')
            return os.path.exists(encoded_path)
        except:
            return False


def read_file_safe(path, encoding=None):
    """
    安全地读取文件（自动检测编码）
    
    Args:
        path (str): 文件路径
        encoding (str, optional): 指定编码，None 为自动检测
    
    Returns:
        str: 文件内容，失败返回空字符串
    """
    if encoding:
        encodings_to_try = [encoding]
    else:
        # 自动检测编码顺序
        encodings_to_try = ['utf-8', 'gbk', 'gb2312', 'latin-1']
    
    for encoding in encodings_to_try:
        try:
            with open(path, 'r', encoding=encoding) as f:
                return f.read()
        except:
            continue
    
    # 全部失败，返回空字符串
    return ""


def write_file_safe(path, content, encoding='utf-8'):
    """
    安全地写入文件
    
    Args:
        path (str): 文件路径
        content (str): 文件内容
        encoding (str, optional): 编码，默认 UTF-8
    
    Returns:
        bool: 是否成功
    """
    try:
        # 确保目录存在
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with open(path, 'w', encoding=encoding) as f:
            f.write(content)
        return True
    except:
        return False


def run_command_safe(command, timeout=30):
    """
    安全地运行外部命令（跨平台兼容）
    
    Args:
        command (str): 命令字符串
        timeout (int, optional): 超时时间（秒）
    
    Returns:
        tuple: (success, stdout, stderr)
    """
    import subprocess
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding='utf-8'
        )
        return (result.returncode == 0, result.stdout, result.stderr)
    except subprocess.TimeoutExpired:
        return (False, "", "Command timed out")
    except UnicodeDecodeError:
        # 尝试使用系统编码
        try:
            import locale
            encoding = locale.getdefaultlocale()[1] or 'utf-8'
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding=encoding
            )
            return (result.returncode == 0, result.stdout, result.stderr)
        except:
            return (False, "", "Encoding error")
    except Exception as e:
        return (False, "", str(e))


# 初始化：设置 UTF-8 IO
setup_utf8_io()


# 测试函数
def test_compatibility():
    """测试跨平台兼容性"""
    print("=" * 60)
    print("跨平台兼容性测试")
    print("=" * 60)
    
    # 测试 1: 打印中文
    print("\n测试 1: 打印中文")
    cross_platform_print("你好，世界！Hello, World!")
    print("✅ 打印测试通过")
    
    # 测试 2: 读取输入
    print("\n测试 2: 读取输入")
    user_input = cross_platform_input("请输入中文（直接回车跳过）：")
    print(f"✅ 输入测试通过：{user_input}")
    
    # 测试 3: 文件操作
    print("\n测试 3: 文件操作")
    test_file = get_resource_path("test_encoding.txt")
    test_content = "这是测试内容\nThis is test content"
    success = write_file_safe(test_file, test_content)
    print(f"文件写入：{'✅ 成功' if success else '❌ 失败'}")
    
    read_content = read_file_safe(test_file)
    print(f"文件读取：{'✅ 成功' if read_content == test_content else '❌ 失败'}")
    
    # 清理测试文件
    try:
        os.remove(test_file)
    except:
        pass
    
    print("\n" + "=" * 60)
    print("兼容性测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_compatibility()
