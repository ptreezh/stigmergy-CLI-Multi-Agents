"""
跨平台脚本工具集

**重要**: 所有外部技能的系统依赖命令必须使用这些 Python 脚本
**禁止**: 在技能中直接使用特定操作系统的命令（如 ls, dir, grep, find 等）

使用方法:
  from cross_platform_scripts import CrossPlatformScripts

  scripts = CrossPlatformScripts()
  result = scripts.list_files('/path/to/directory')
  result = scripts.find_files('/path/to/directory', '*.js')
  result = scripts.search_content('/path/to/file', 'pattern')
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path
from typing import List, Dict, Any, Optional


class CrossPlatformScripts:
    """
    跨平台脚本工具类

    提供统一的跨平台接口，替代特定操作系统的命令
    """

    def __init__(self):
        self.platform = platform.system()
        self.is_windows = self.platform == 'Windows'
        self.is_linux = self.platform == 'Linux'
        self.is_mac = self.platform == 'Darwin'

    def _run_command(self, args: List[str], cwd: Optional[str] = None) -> Dict[str, Any]:
        """
        安全运行命令（跨平台）

        Args:
            args: 命令参数列表
            cwd: 工作目录

        Returns:
            包含 success, output, error 的字典
        """
        try:
            result = subprocess.run(
                args,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=30,
                shell=False  # 安全：不使用 shell
            )

            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'return_code': result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Command timeout',
                'return_code': -1
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }

    def list_files(self, directory: str, pattern: Optional[str] = None) -> Dict[str, Any]:
        """
        列出目录中的文件（跨平台，替代 ls/dir）

        Args:
            directory: 目录路径
            pattern: 文件模式（如 *.js）

        Returns:
            包含文件列表的字典
        """
        try:
            path = Path(directory)
            if not path.exists():
                return {
                    'success': False,
                    'files': [],
                    'error': f'Directory not found: {directory}'
                }

            if pattern:
                files = list(path.glob(pattern))
            else:
                files = list(path.iterdir())

            return {
                'success': True,
                'files': [str(f) for f in files],
                'count': len(files)
            }
        except Exception as e:
            return {
                'success': False,
                'files': [],
                'error': str(e)
            }

    def find_files(self, directory: str, pattern: str = '*', recursive: bool = True) -> Dict[str, Any]:
        """
        查找文件（跨平台，替代 find）

        Args:
            directory: 搜索目录
            pattern: 文件模式
            recursive: 是否递归搜索

        Returns:
            包含匹配文件列表的字典
        """
        try:
            path = Path(directory)
            if not path.exists():
                return {
                    'success': False,
                    'files': [],
                    'error': f'Directory not found: {directory}'
                }

            if recursive:
                files = list(path.rglob(pattern))
            else:
                files = list(path.glob(pattern))

            return {
                'success': True,
                'files': [str(f) for f in files if f.is_file()],
                'count': len([f for f in files if f.is_file()])
            }
        except Exception as e:
            return {
                'success': False,
                'files': [],
                'error': str(e)
            }

    def search_content(self, file_path: str, pattern: str, case_sensitive: bool = True) -> Dict[str, Any]:
        """
        在文件中搜索内容（跨平台，替代 grep）

        Args:
            file_path: 文件路径
            pattern: 搜索模式
            case_sensitive: 是否区分大小写

        Returns:
            包含匹配结果的字典
        """
        try:
            path = Path(file_path)
            if not path.exists():
                return {
                    'success': False,
                    'matches': [],
                    'error': f'File not found: {file_path}'
                }

            matches = []
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                for line_num, line in enumerate(f, 1):
                    search_line = line if case_sensitive else line.lower()
                    search_pattern = pattern if case_sensitive else pattern.lower()

                    if search_pattern in search_line:
                        matches.append({
                            'line_number': line_num,
                            'line': line.strip(),
                            'pattern': pattern
                        })

            return {
                'success': True,
                'matches': matches,
                'count': len(matches)
            }
        except Exception as e:
            return {
                'success': False,
                'matches': [],
                'error': str(e)
            }

    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """
        获取文件信息（跨平台，替代 ls -l/stat）

        Args:
            file_path: 文件路径

        Returns:
            包含文件信息的字典
        """
        try:
            path = Path(file_path)
            if not path.exists():
                return {
                    'success': False,
                    'error': f'File not found: {file_path}'
                }

            stat = path.stat()

            return {
                'success': True,
                'name': path.name,
                'size': stat.st_size,
                'modified': stat.st_mtime,
                'is_file': path.is_file(),
                'is_dir': path.is_dir(),
                'permissions': oct(stat.st_mode)[-3:],
                'path': str(path.absolute())
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def create_directory(self, directory: str, parents: bool = True) -> Dict[str, Any]:
        """
        创建目录（跨平台，替代 mkdir -p）

        Args:
            directory: 目录路径
            parents: 是否创建父目录

        Returns:
            操作结果
        """
        try:
            path = Path(directory)
            path.mkdir(parents=parents, exist_ok=True)

            return {
                'success': True,
                'path': str(path.absolute())
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def copy_file(self, source: str, destination: str) -> Dict[str, Any]:
        """
        复制文件（跨平台，替代 cp）

        Args:
            source: 源文件
            destination: 目标文件

        Returns:
            操作结果
        """
        try:
            import shutil
            src_path = Path(source)
            dst_path = Path(destination)

            if not src_path.exists():
                return {
                    'success': False,
                    'error': f'Source file not found: {source}'
                }

            shutil.copy2(src_path, dst_path)

            return {
                'success': True,
                'source': str(src_path.absolute()),
                'destination': str(dst_path.absolute())
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def move_file(self, source: str, destination: str) -> Dict[str, Any]:
        """
        移动文件（跨平台，替代 mv）

        Args:
            source: 源文件
            destination: 目标文件

        Returns:
            操作结果
        """
        try:
            import shutil
            src_path = Path(source)
            dst_path = Path(destination)

            if not src_path.exists():
                return {
                    'success': False,
                    'error': f'Source file not found: {source}'
                }

            shutil.move(str(src_path), str(dst_path))

            return {
                'success': True,
                'source': str(src_path.absolute()),
                'destination': str(dst_path.absolute())
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def delete_file(self, file_path: str) -> Dict[str, Any]:
        """
        删除文件（跨平台，替代 rm）

        Args:
            file_path: 文件路径

        Returns:
            操作结果
        """
        try:
            path = Path(file_path)
            if not path.exists():
                return {
                    'success': False,
                    'error': f'File not found: {file_path}'
                }

            if path.is_dir():
                import shutil
                shutil.rmtree(path)
            else:
                path.unlink()

            return {
                'success': True,
                'deleted': str(path.absolute())
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_env_var(self, key: str, default: Optional[str] = None) -> str:
        """
        获取环境变量（跨平台）

        Args:
            key: 环境变量名
            default: 默认值

        Returns:
            环境变量值
        """
        return os.environ.get(key, default)

    def get_user_home(self) -> str:
        """
        获取用户主目录（跨平台）

        Returns:
            用户主目录路径
        """
        return Path.home()

    def get_temp_dir(self) -> str:
        """
        获取临时目录（跨平台）

        Returns:
            临时目录路径
        """
        return Path(os.environ.get('TMPDIR', '/tmp'))


def main():
    """
    命令行接口
    """
    if len(sys.argv) < 2:
        print("Usage: cross_platform_scripts.py <command> [args...]")
        print("Commands:")
        print("  list_files <directory> [pattern]")
        print("  find_files <directory> <pattern>")
        print("  search_content <file> <pattern>")
        print("  get_file_info <file>")
        sys.exit(1)

    command = sys.argv[1]
    scripts = CrossPlatformScripts()

    if command == 'list_files':
        if len(sys.argv) < 3:
            print("Usage: list_files <directory> [pattern]")
            sys.exit(1)
        result = scripts.list_files(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)

    elif command == 'find_files':
        if len(sys.argv) < 4:
            print("Usage: find_files <directory> <pattern>")
            sys.exit(1)
        result = scripts.find_files(sys.argv[2], sys.argv[3])

    elif command == 'search_content':
        if len(sys.argv) < 4:
            print("Usage: search_content <file> <pattern>")
            sys.exit(1)
        result = scripts.search_content(sys.argv[2], sys.argv[3])

    elif command == 'get_file_info':
        if len(sys.argv) < 3:
            print("Usage: get_file_info <file>")
            sys.exit(1)
        result = scripts.get_file_info(sys.argv[2])

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

    # 输出 JSON 结果
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
