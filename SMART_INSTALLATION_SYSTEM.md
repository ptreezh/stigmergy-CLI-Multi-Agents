# 智能跨平台AI CLI工具安装配置系统

## 🎯 系统目标
自动检测用户环境并部署最适合的配置和脚本版本

## 🏗️ 系统架构

### 1. 环境检测模块
```python
class EnvironmentDetector:
    def __init__(self):
        self.system_info = {
            "os": platform.system().lower(),
            "arch": platform.machine().lower(),
            "version": platform.version(),
            "python_version": sys.version_info,
            "shell": self.detect_shell()
        }
    
    def detect_shell(self):
        """检测当前使用的shell"""
        if os.name == 'nt':  # Windows
            return os.environ.get('COMSPEC', 'cmd.exe')
        else:  # Unix-like
            return os.environ.get('SHELL', '/bin/sh')
```

### 2. 配置适配器模块
```python
class ConfigAdapter:
    def __init__(self, system_info):
        self.system_info = system_info
        self.config_templates = self.load_config_templates()
    
    def get_optimal_config(self):
        """根据系统信息获取最优配置"""
        os_type = self.system_info["os"]
        
        if os_type == "windows":
            return self.config_templates["windows"]
        elif os_type == "linux":
            return self.config_templates["linux"]
        elif os_type == "darwin":
            return self.config_templates["macos"]
        else:
            return self.config_templates["default"]
```

### 3. 脚本部署模块
```python
class ScriptDeployer:
    def __init__(self, config):
        self.config = config
        self.install_dir = Path(config["install_dir"])
    
    def deploy_scripts(self):
        """部署系统特定脚本"""
        for script_info in self.config["scripts"]:
            self.deploy_script(script_info)
    
    def deploy_script(self, script_info):
        """部署单个脚本"""
        script_path = self.install_dir / script_info["name"]
        
        # 根据模板生成脚本内容
        content = self.render_template(script_info["template"], script_info["variables"])
        
        # 写入文件
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # 设置权限（仅限Unix系统）
        if script_info.get("executable", False) and self.config["os"] != "windows":
            os.chmod(script_path, 0o755)
```

## 📋 配置模板

### Windows配置模板
```json
{
  "os": "windows",
  "script_extension": ".bat",
  "path_separator": "\\",
  "shell_commands": {
    "new_terminal": "start cmd /k",
    "background_process": "start /b"
  },
  "scripts": [
    {
      "name": "claude-call.bat",
      "template": "windows_bat_template",
      "executable": true
    }
  ]
}
```

### Linux配置模板
```json
{
  "os": "linux",
  "script_extension": ".sh",
  "path_separator": "/",
  "shell_commands": {
    "new_terminal": "gnome-terminal --",
    "background_process": "nohup"
  },
  "scripts": [
    {
      "name": "claude-call.sh",
      "template": "unix_sh_template",
      "executable": true
    }
  ]
}
```

### macOS配置模板
```json
{
  "os": "darwin",
  "script_extension": ".sh",
  "path_separator": "/",
  "shell_commands": {
    "new_terminal": "osascript -e 'tell app \"Terminal\" to do script'",
    "background_process": "nohup"
  },
  "scripts": [
    {
      "name": "claude-call.sh",
      "template": "unix_sh_template",
      "executable": true
    }
  ]
}
```

## 🚀 智能部署流程

### 1. 初始化阶段
```
[用户运行安装命令]
        ↓
[检测系统环境和配置]
        ↓
[选择最优配置模板]
        ↓
[生成系统特定配置]
```

### 2. 部署阶段
```
[创建安装目录]
        ↓
[部署系统特定脚本]
        ↓
[设置文件权限]
        ↓
[更新环境变量]
        ↓
[创建配置文件]
```

### 3. 验证阶段
```
[验证工具可用性]
        ↓
[测试脚本执行]
        ↓
[生成安装报告]
```

## 🛡️ 兼容性保障

### 多版本支持
- Python 3.6+
- Node.js 12+
- 不同架构支持 (x86, x64, ARM)

### 错误处理
```python
class InstallationError(Exception):
    """安装错误"""
    pass

class CompatibilityError(InstallationError):
    """兼容性错误"""
    pass

def safe_install(func):
    """安全安装装饰器"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except CompatibilityError as e:
            print(f"兼容性错误: {e}")
            return False
        except Exception as e:
            print(f"安装错误: {e}")
            return False
    return wrapper
```

## 📊 系统检测结果示例

### Windows 10 (x64)
```
系统: windows
版本: 10.0.19041
架构: AMD64
Python: 3.8.5
Shell: cmd.exe
```

### Ubuntu 20.04 (x64)
```
系统: linux
版本: #1 SMP Thu Jul 20 12:34:55 UTC 2023
架构: x86_64
Python: 3.8.10
Shell: /bin/bash
```

### macOS 12.0 (ARM64)
```
系统: darwin
版本: Darwin Kernel Version 21.1.0
架构: arm64
Python: 3.9.6
Shell: /bin/zsh
```

## 🎯 自适应策略

### 脚本格式自适应
- Windows: 使用.bat批处理脚本
- Linux/macOS: 使用.sh Shell脚本
- 跨平台: 使用.py Python脚本

### 命令语法自适应
- 路径分隔符自动转换
- 命令参数格式适配
- 权限管理差异化处理

### 依赖管理自适应
- Windows: 优先使用npm包管理
- Linux: 优先使用apt包管理
- macOS: 优先使用brew包管理

## 📈 扩展性设计

### 插件化架构
```python
class PluginManager:
    def __init__(self):
        self.plugins = {}
    
    def register_plugin(self, name, plugin_class):
        """注册插件"""
        self.plugins[name] = plugin_class
    
    def get_plugin(self, name):
        """获取插件"""
        return self.plugins.get(name)
```

### 动态配置更新
- 支持远程配置更新
- 支持增量部署
- 支持回滚机制

## 📋 安装验证清单

### ✅ 基础验证
- [ ] 系统环境检测正确
- [ ] 配置文件生成正确
- [ ] 脚本文件部署完成
- [ ] 权限设置正确

### ✅ 功能验证
- [ ] 脚本可执行性测试
- [ ] 工具调用测试
- [ ] 跨工具协作测试
- [ ] 性能基准测试

### ✅ 兼容性验证
- [ ] 不同Python版本测试
- [ ] 不同系统版本测试
- [ ] 不同架构测试
- [ ] 网络环境测试

## 🚨 故障恢复机制

### 自动回滚
```python
class RollbackManager:
    def __init__(self):
        self.backup_points = []
    
    def create_backup(self, description):
        """创建回滚点"""
        backup = {
            "timestamp": time.time(),
            "description": description,
            "files": self.backup_files()
        }
        self.backup_points.append(backup)
    
    def rollback(self, backup_point=None):
        """执行回滚"""
        if not backup_point:
            backup_point = self.backup_points[-1]
        self.restore_files(backup_point["files"])
```

### 错误诊断
- 系统信息收集
- 安装日志分析
- 依赖关系检查
- 网络连通性测试

## 📚 相关文档
- `smart-installer.py` - 智能安装器主程序
- `CROSS_PLATFORM_AI_CLI_CALL_GUIDE.md` - 跨平台调用指南
- 各工具的.md文档文件

这个智能配置安装系统确保了在任何环境下都能自动适配并部署最合适的版本。