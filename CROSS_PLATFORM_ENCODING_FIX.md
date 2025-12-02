# 🌐 跨平台编码安全解决方案

## 📋 问题描述

在Windows中文系统中，CLI插件安装脚本经常遇到GBK编码错误：
- Windows默认使用GBK编码
- 安装脚本使用UTF-8编码写入配置文件
- 导致编码冲突，安装失败
- 影响Claude、Gemini、QwenCode等所有CLI工具

## 🔧 解决方案概述

### 核心组件

1. **跨平台编码处理器** (`src/core/cross_platform_encoding.py`)
   - 自动检测系统编码环境
   - 支持多种编码回退机制
   - 安全的文件读写操作

2. **编码安全安装器基类**
   - 原子性文件操作（临时文件+重命名）
   - 自动备份现有配置
   - 多级编码降级策略

3. **统一安装管理器** (`universal_cli_installer.py`)
   - 一键管理所有CLI工具安装
   - 交互式界面，用户友好
   - 自动处理编码问题

4. **批量修复工具** (`fix_all_install_scripts.py`)
   - 一键更新所有安装脚本
   - 添加编码安全装饰器
   - 修复文件读写操作

## 🚀 使用方法

### 方法1：一键安装（推荐）

```bash
# 运行统一安装管理器
python universal_cli_installer.py
```

### 方法2：修复现有脚本

```bash
# 批量修复所有安装脚本
python fix_all_install_scripts.py

# 然后使用修复后的脚本
python src/adapters/claude/install_claude_integration.py
```

### 方法3：手动使用编码安全库

```python
# 导入跨平台编码库
from src.core.cross_platform_encoding import get_cross_platform_installer, encoding_safe

# 获取安装器实例
installer = get_cross_platform_installer()

# 使用编码安全装饰器
@encoding_safe
def my_installation_function(installer):
    # 安全写入JSON
    installer.writer.write_json("config.json", data, backup=True)
    
    # 安全写入YAML
    installer.writer.write_yaml("config.yml", data, backup=True)
    
    # 安全复制文件
    installer.writer.copy_file("src.py", "dst.py")
```

## 🛡️ 编码安全特性

### 多级编码回退

1. **UTF-8** (首选)
2. **UTF-8-SIG** (带BOM)
3. **GBK/GB2312** (Windows中文)
4. **CP936** (Windows代码页)
5. **Latin-1** (最大兼容性)
6. **ASCII** (最终回退)

### 安全文件操作

- **原子性写入**：使用临时文件+重命名
- **自动备份**：每次修改前自动备份
- **错误恢复**：写入失败时自动清理
- **验证机制**：写入后验证文件可读性

### 环境自适应

- **Windows**: 设置PYTHONIOENCODING和PYTHONLEGACYWINDOWSSTDIO
- **Linux**: 使用系统locale设置
- **macOS**: 优化的UTF-8处理

## 📁 文件结构

```
stigmergy-CLI-Multi-Agents/
├── src/core/
│   └── cross_platform_encoding.py     # 跨平台编码安全库
├── src/adapters/
│   ├── claude/
│   │   └── install_claude_integration.py    # 修复后的Claude安装脚本
│   ├── gemini/
│   │   └── install_gemini_integration.py   # 修复后的Gemini安装脚本
│   ├── qwencode/
│   │   └── install_qwencode_integration.py  # 修复后的QwenCode安装脚本
│   └── ...
├── universal_cli_installer.py          # 统一安装管理器
├── fix_all_install_scripts.py          # 批量修复工具
└── fix-gbk-encoding.py                 # 原始修复脚本（已弃用）
```

## 🔍 验证修复效果

### 1. 检查编码环境

```python
# 运行安装器查看系统信息
installer = get_cross_platform_installer()
installer.print_system_info()

# 输出示例：
# [INFO] 系统信息:
#    操作系统: windows
#    默认编码: utf-8
#    备用编码: utf-8, gbk, gb2312, cp936, utf-8-sig
```

### 2. 测试文件写入

```python
# 测试包含中文的配置写入
test_data = {
    "中文键": "中文值",
    "emoji": "🚀🎉",
    "config": {
        "enabled": True,
        "message": "测试编码"
    }
}

installer = get_cross_platform_installer()
success = installer.writer.write_json("test.json", test_data)
print(f"写入成功: {success}")
```

### 3. 验证所有CLI安装

```bash
# 运行统一安装管理器，选择验证功能
python universal_cli_installer.py
# 选择: 4. 🔍 验证现有安装
```

## 🚨 故障排除

### 问题1：编码库导入失败

**错误**: `ImportError: cannot import name 'get_cross_platform_installer'`

**解决**: 确保 `src/core/cross_platform_encoding.py` 存在
```bash
# 重新生成编码库
python -c "
from pathlib import Path
Path('src/core').mkdir(exist_ok=True)
# 下载或复制 cross_platform_encoding.py 到正确位置
"
```

### 问题2：脚本运行失败

**错误**: `FileNotFoundError: [Errno 2] No such file or directory`

**解决**: 检查工作目录和文件路径
```bash
# 确保在项目根目录运行
cd path/to/stigmergy-CLI-Multi-Agents
python universal_cli_installer.py
```

### 问题3：权限错误

**错误**: `PermissionError: [Errno 13] Permission denied`

**解决**: 使用管理员权限或检查目录权限
```bash
# Windows: 以管理员身份运行PowerShell
# Linux/macOS: 使用sudo
sudo python universal_cli_installer.py
```

### 问题4：编码仍然失败

**错误**: 仍然出现编码错误

**解决**: 检查系统设置
```bash
# Windows: 设置系统编码为UTF-8
chcp 65001

# 设置环境变量
export PYTHONIOENCODING=utf-8
export LANG=zh_CN.UTF-8
```

## 🎯 最佳实践

### 1. 开发者指南

- 所有新的安装脚本都应使用编码安全库
- 使用 `@encoding_safe` 装饰器保护函数
- 优先使用 `installer.writer` 而不是直接文件操作

### 2. 部署建议

- 在CI/CD中运行 `fix_all_install_scripts.py`
- 测试在不同操作系统上的安装效果
- 提供清晰的错误信息和用户指导

### 3. 维护更新

- 定期检查编码库的兼容性
- 更新支持的CLI工具列表
- 优化编码检测和回退机制

## 📞 技术支持

如果遇到问题，请：

1. 检查系统环境：运行 `installer.print_system_info()`
2. 查看详细错误日志
3. 在项目仓库提交Issue
4. 提供操作系统、Python版本等环境信息

---

**注意**: 这个解决方案专门针对Stigmergy CLI Multi-Agents项目，但编码安全库可以用于其他类似项目。