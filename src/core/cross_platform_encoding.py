#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨平台编码安全工具库
解决Windows/Linux/macOS上GBK/UTF-8等编码冲突问题
"""

import os
import sys
import json
import yaml
import shutil
import locale
import platform
import codecs
import traceback
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, Union, List

class EncodingError(Exception):
    """编码相关异常"""
    pass

class CrossPlatformEncoding:
    """跨平台编码处理器"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.default_encoding = self._detect_system_encoding()
        self.fallback_encodings = self._get_fallback_encodings()
        
    def _detect_system_encoding(self) -> str:
        """检测系统默认编码"""
        try:
            # 优先使用系统locale编码
            system_encoding = locale.getpreferredencoding(False)
            if system_encoding and system_encoding.lower() != 'ascii':
                return system_encoding.lower()
        except:
            pass
            
        try:
            # 尝试Python默认编码
            return sys.getdefaultencoding().lower()
        except:
            pass
            
        # 最后的默认值
        return 'utf-8'
    
    def _get_fallback_encodings(self) -> List[str]:
        """获取备用编码列表"""
        encodings = ['utf-8']
        
        if self.system == 'windows':
            encodings.extend(['gbk', 'gb2312', 'cp936', 'utf-8-sig'])
        elif self.system == 'linux':
            encodings.extend(['utf-8-sig', 'latin-1'])
        elif self.system == 'darwin':
            encodings.extend(['utf-8-sig', 'mac-roman'])
            
        return encodings
    
    def setup_environment(self):
        """设置环境编码"""
        if self.system == 'windows':
            # Windows特殊处理
            os.environ['PYTHONIOENCODING'] = 'utf-8'
            os.environ['PYTHONLEGACYWINDOWSSTDIO'] = 'utf-8'
            
            # 重配置标准流
            try:
                sys.stdout.reconfigure(encoding='utf-8', errors='replace')
                sys.stderr.reconfigure(encoding='utf-8', errors='replace')
            except:
                pass
                
        # 通用设置
        if 'PYTHONIOENCODING' not in os.environ:
            os.environ['PYTHONIOENCODING'] = 'utf-8'

class SafeFileWriter:
    """安全文件写入器"""
    
    def __init__(self, encoding_handler: CrossPlatformEncoding):
        self.encoding_handler = encoding_handler
        
    def write_json(self, file_path: Union[str, Path], data: Dict[str, Any], 
                   backup: bool = True, indent: int = 2) -> bool:
        """安全写入JSON文件"""
        file_path = Path(file_path)
        
        try:
            # 备份现有文件
            if backup and file_path.exists():
                backup_path = self._create_backup(file_path)
                shutil.copy2(file_path, backup_path)
            
            # 确保目录存在
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 使用临时文件确保原子性写入
            temp_path = file_path.with_suffix('.tmp')
            
            # 尝试多种编码
            for encoding in self.encoding_handler.fallback_encodings:
                try:
                    with open(temp_path, 'w', encoding=encoding, errors='replace') as f:
                        json.dump(data, f, indent=indent, ensure_ascii=False)
                    
                    # 验证写入的文件
                    if self._verify_file(temp_path, encoding):
                        temp_path.replace(file_path)
                        return True
                        
                except (UnicodeEncodeError, UnicodeDecodeError) as e:
                    continue
                except Exception as e:
                    break
                    
            # 所有编码都失败，尝试基本ASCII写入
            try:
                with open(temp_path, 'w', encoding='ascii', errors='replace') as f:
                    json.dump(data, f, indent=indent, ensure_ascii=True)
                temp_path.replace(file_path)
                return True
                
            except Exception as e:
                self._cleanup_temp_file(temp_path)
                raise EncodingError(f"所有编码尝试都失败: {e}")
                
        except Exception as e:
            return False
    
    def write_yaml(self, file_path: Union[str, Path], data: Dict[str, Any], 
                   backup: bool = True) -> bool:
        """安全写入YAML文件"""
        file_path = Path(file_path)
        
        try:
            # 备份现有文件
            if backup and file_path.exists():
                backup_path = self._create_backup(file_path)
                shutil.copy2(file_path, backup_path)
            
            # 确保目录存在
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 使用临时文件确保原子性写入
            temp_path = file_path.with_suffix('.tmp')
            
            # 尝试多种编码
            for encoding in self.encoding_handler.fallback_encodings:
                try:
                    with open(temp_path, 'w', encoding=encoding, errors='replace') as f:
                        yaml.dump(data, f, default_flow_style=False, 
                                allow_unicode=True, encoding=encoding)
                    
                    # 验证写入的文件
                    if self._verify_file(temp_path, encoding):
                        temp_path.replace(file_path)
                        return True
                        
                except (UnicodeEncodeError, UnicodeDecodeError) as e:
                    continue
                except Exception as e:
                    break
                    
            # 所有编码都失败，尝试ASCII安全模式
            try:
                with open(temp_path, 'w', encoding='ascii', errors='replace') as f:
                    yaml.dump(data, f, default_flow_style=False, 
                            allow_unicode=False)
                temp_path.replace(file_path)
                return True
                
            except Exception as e:
                self._cleanup_temp_file(temp_path)
                raise EncodingError(f"YAML写入失败: {e}")
                
        except Exception as e:
            return False
    
    def copy_file(self, src: Union[str, Path], dst: Union[str, Path]) -> bool:
        """安全复制文件"""
        try:
            src = Path(src)
            dst = Path(dst)
            
            if not src.exists():
                return False
            
            # 确保目标目录存在
            dst.parent.mkdir(parents=True, exist_ok=True)
            
            # 直接复制二进制文件，避免编码转换
            shutil.copy2(src, dst)
            return True
            
        except Exception as e:
            return False
    
    def _create_backup(self, file_path: Path) -> Path:
        """创建备份文件"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = file_path.with_suffix(f'.backup_{timestamp}')
        return backup_path
    
    def _verify_file(self, file_path: Path, encoding: str) -> bool:
        """验证文件是否可读"""
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                f.read(1024)  # 读取前1024字符验证
            return True
        except:
            return False
    
    def _cleanup_temp_file(self, temp_path: Path):
        """清理临时文件"""
        try:
            if temp_path.exists():
                temp_path.unlink()
        except:
            pass

class SafeFileReader:
    """安全文件读取器"""
    
    def __init__(self, encoding_handler: CrossPlatformEncoding):
        self.encoding_handler = encoding_handler
        
    def read_json(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """安全读取JSON文件"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {}
        
        # 尝试多种编码
        for encoding in self.encoding_handler.fallback_encodings:
            try:
                with open(file_path, 'r', encoding=encoding, errors='replace') as f:
                    return json.load(f) or {}
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue
            except Exception:
                break
        
        # 最后尝试带错误处理的读取
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                return json.load(f) or {}
        except:
            return {}
    
    def read_yaml(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """安全读取YAML文件"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {}
        
        # 尝试多种编码
        for encoding in self.encoding_handler.fallback_encodings:
            try:
                with open(file_path, 'r', encoding=encoding, errors='replace') as f:
                    return yaml.safe_load(f) or {}
            except (UnicodeDecodeError, yaml.YAMLError):
                continue
            except Exception:
                break
        
        # 最后尝试带错误处理的读取
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                return yaml.safe_load(f) or {}
        except:
            return {}

class CrossPlatformInstaller:
    """跨平台安装器基类"""
    
    def __init__(self):
        self.encoding_handler = CrossPlatformEncoding()
        self.writer = SafeFileWriter(self.encoding_handler)
        self.reader = SafeFileReader(self.encoding_handler)
        
        # 设置环境
        self.encoding_handler.setup_environment()
    
    def print_system_info(self):
        """打印系统信息"""
        print(f"[INFO] 系统信息:")
        print(f"   操作系统: {self.encoding_handler.system}")
        print(f"   默认编码: {self.encoding_handler.default_encoding}")
        print(f"   备用编码: {', '.join(self.encoding_handler.fallback_encodings)}")
        print()
    
    def create_directory(self, dir_path: Union[str, Path]) -> bool:
        """创建目录"""
        try:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            return True
        except Exception as e:
            print(f"❌ 创建目录失败: {dir_path} - {e}")
            return False
    
    def copy_adapter_files(self, src_dir: Union[str, Path], 
                          dst_dir: Union[str, Path], 
                          file_patterns: List[str]) -> bool:
        """复制适配器文件"""
        success = True
        src_dir = Path(src_dir)
        dst_dir = Path(dst_dir)
        
        # 确保目标目录存在
        dst_dir.mkdir(parents=True, exist_ok=True)
        
        for pattern in file_patterns:
            for src_file in src_dir.glob(pattern):
                dst_file = dst_dir / src_file.name
                if not self.writer.copy_file(src_file, dst_file):
                    print(f"❌ 复制文件失败: {src_file.name}")
                    success = False
                else:
                    print(f"[OK] 复制文件: {src_file.name}")
        
        return success

# 全局实例
_encoding_installer = None

def get_cross_platform_installer() -> CrossPlatformInstaller:
    """获取跨平台安装器实例"""
    global _encoding_installer
    if _encoding_installer is None:
        _encoding_installer = CrossPlatformInstaller()
    return _encoding_installer

def setup_cross_platform_encoding():
    """设置跨平台编码环境"""
    installer = get_cross_platform_installer()
    installer.print_system_info()
    return installer

# 装饰器：为函数添加编码安全
def encoding_safe(func):
    """编码安全装饰器"""
    def wrapper(*args, **kwargs):
        # 设置编码环境
        installer = get_cross_platform_installer()
        installer.encoding_handler.setup_environment()
        
        try:
            return func(*args, **kwargs)
        except UnicodeError as e:
            print(f"❌ 编码错误: {e}")
            return False
        except Exception as e:
            print(f"❌ 未知错误: {e}")
            print(f"📋 详细错误: {traceback.format_exc()}")
            return False
    
    return wrapper