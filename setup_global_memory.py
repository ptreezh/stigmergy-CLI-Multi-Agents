#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全局记忆文档生成器执行脚本
一键生成所有CLI的完整记忆文档
"""

import os
import sys
from pathlib import Path

# 确保在项目根目录
project_root = Path(__file__).parent
os.chdir(project_root)

# 导入生成器
try:
    from generate_global_memory import GlobalMemoryGenerator
    from cross_cli_mapping import CrossCLIMapper
    from cross_platform_safe_cli import get_cli_executor
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    print("💡 请确保在项目根目录运行此脚本")
    sys.exit(1)

def main():
    """主函数"""
    print("📚 Stigmergy CLI Multi-Agents 全局记忆文档生成器")
    print("=" * 60)
    print("🌐 跨平台编码安全 | 🔗 跨CLI协作 | 📊 智能分析")
    print()
    
    # 生成全局记忆文档
    print("📖 生成CLI全局记忆文档...")
    try:
        generator = GlobalMemoryGenerator()
        success = generator.generate_all_memories()
        
        if success:
            print("\n✅ 全局记忆文档生成成功！")
            memory_dir = Path('.') / 'global_memory'
            print(f"📁 文档位置: {memory_dir}")
            
            # 列出生成的文件
            print("\n📋 生成的文件:")
            if memory_dir.exists():
                for file_path in sorted(memory_dir.glob('*')):
                    file_size = file_path.stat().st_size
                    file_type = "JSON" if file_path.suffix == '.json' else "MD"
                    print(f"   📄 {file_path.name} ({file_type}, {file_size} bytes)")
            
        else:
            print("\n❌ 全局记忆文档生成失败")
            return 1
            
    except Exception as e:
        print(f"\n❌ 生成过程出错: {e}")
        return 1
    
    # 生成跨CLI映射表
    print("\n🔗 生成交叉CLI映射表...")
    try:
        mapper = CrossCLIMapper()
        mapping_file = 'global_memory/cross_cli_mapping.json'
        success = mapper.export_mapping_table(mapping_file)
        
        if success:
            print("✅ 跨CLI映射表生成成功！")
            print(f"📄 映射文件: {mapping_file}")
        else:
            print("❌ 跨CLI映射表生成失败")
            
    except Exception as e:
        print(f"❌ 映射表生成出错: {e}")
    
    # 验证CLI工具状态
    print("\n🔍 验证CLI工具状态...")
    try:
        executor = get_cli_executor()
        available_count = 0
        total_count = len(executor.cli_configs)
        
        print("📊 CLI工具状态:")
        for cli_name, config in executor.cli_configs.items():
            status, message = executor.check_cli_status(cli_name)
            
            if status.value in ['authenticated', 'configured', 'available', 'installed']:
                icon = "✅"
                available_count += 1
            else:
                icon = "❌"
            
            print(f"   {icon} {config.display_name:<20} {status.value}")
        
        print(f"\n📊 可用CLI: {available_count}/{total_count}")
        
    except Exception as e:
        print(f"❌ CLI验证出错: {e}")
    
    # 生成使用指南
    print("\n📖 生成使用指南...")
    try:
        generate_usage_guide()
        print("✅ 使用指南生成成功！")
    except Exception as e:
        print(f"❌ 使用指南生成失败: {e}")
    
    print("\n🎉 全局记忆文档系统部署完成！")
    print("\n🚀 下一步操作:")
    print("   1. 运行: python stigmergy_cli.py")
    print("   2. 选择相应功能开始使用")
    print("   3. 查看 global_memory/ 目录了解详细文档")
    
    return 0

def generate_usage_guide():
    """生成使用指南"""
    guide_content = """# 🚀 Stigmergy CLI Multi-Agents 使用指南

## 📋 概述

Stigmergy CLI Multi-Agents 是一个跨平台、跨CLI的AI工具协作系统，支持多种AI CLI工具的无缝协作。

## 🌐 支持的CLI工具

### 🔴 核心工具（必需）
- **Claude CLI** - Anthropic Claude AI助手
- **Gemini CLI** - Google Gemini AI助手

### 🟢 扩展工具（可选）
- **QwenCode CLI** - 阿里云QwenCode代码生成
- **iFlow CLI** - iFlow工作流管理
- **Qoder CLI** - Qoder代码生成工具
- **CodeBuddy CLI** - CodeBuddy编程学习助手
- **GitHub Copilot CLI** - GitHub Copilot代码补全
- **Codex CLI** - OpenAI Codex代码分析

## 🔧 快速开始

### 1. 系统检查
```bash
python stigmergy_cli.py
# 选择 "1. 检查所有CLI工具状态"
```

### 2. 生成记忆文档
```bash
python stigmergy_cli.py
# 选择 "2. 生成/更新全局记忆文档"
```

### 3. 查看协作建议
```bash
python stigmergy_cli.py
# 选择 "3. 跨CLI协作建议"
# 输入任务描述获取最佳协作方案
```

### 4. 执行跨CLI命令
```bash
python stigmergy_cli.py
# 选择 "4. 执行跨CLI命令"
# 选择CLI工具并输入命令或提示词
```

## 💡 使用示例

### 基础对话
```bash
# 在Claude CLI中
claude "请用gemini帮我翻译这段代码到Python"

# 在Gemini CLI中  
gemini "让claude帮我审查这个JavaScript文件的安全性"
```

### 文件处理
```bash
# 处理单个文件
claude --file main.py "请解释这个算法的复杂度"

# 批量处理
gemini --batch --input-dir ./src --output-dir ./output "优化所有Python文件"
```

### 跨CLI协作
```bash
# 代码审查 + 优化
claude "请用gemini优化这个算法的性能"

# 文档生成 + 翻译
qwencode "请用claude为这个API生成英文文档，然后用gemini翻译成中文"

# 工作流 + 代码生成
iflow "请用qoder生成这个工作流的实现代码"
```

## 🔗 跨CLI协作模式

### 标准协作模式
- **审查模式**: `请用{target_cli}帮我审查{content}`
- **生成模式**: `用{target_cli}生成{content}`
- **优化模式**: `让{target_cli}优化{content}`
- **翻译模式**: `请用{target_cli}翻译{content}`

### 高级协作模式
- **链式协作**: `先用claude分析，然后用gemini优化`
- **并行协作**: `同时用claude和gemini处理不同方面`
- **专业协作**: `用代码生成工具创建，用审查工具检查`

## 📊 全局记忆文档

生成的文档位于 `global_memory/` 目录：

- `*_global_memory.json` - JSON格式的完整记忆文档
- `*_global_memory.md` - Markdown格式的可读文档
- `cross_cli_mapping.json` - 跨CLI协作映射表

### 文档内容
- CLI工具详细配置信息
- 系统要求和依赖
- 使用示例和最佳实践
- 跨CLI协作模式
- 错误处理和故障排除

## ⚙️ 系统配置

### 环境变量设置
```bash
# Claude CLI
export ANTHROPIC_API_KEY="your-api-key"

# Gemini CLI  
export GEMINI_API_KEY="your-api-key"

# QwenCode CLI
export QWEN_API_KEY="your-api-key"

# 其他CLI...
```

### 编码安全设置
```bash
# 跨平台编码安全
export PYTHONIOENCODING=utf-8
export PYTHONLEGACYWINDOWSSTDIO=utf-8  # Windows
```

## 🛠️ 故障排除

### 常见问题

1. **CLI工具未找到**
   ```bash
   # 检查CLI是否已安装
   python stigmergy_cli.py
   # 选择 "5. 验证安装和配置"
   ```

2. **编码错误**
   ```bash
   # 运行编码安全修复
   python fix_all_install_scripts.py
   ```

3. **权限问题**
   ```bash
   # Windows: 以管理员身份运行PowerShell
   # Linux/macOS: 使用sudo
   sudo python stigmergy_cli.py
   ```

4. **认证失败**
   ```bash
   # 检查环境变量
   python stigmergy_cli.py
   # 选择 "8. 系统配置管理" -> "2. 修改环境变量"
   ```

### 诊断和修复
```bash
# 运行系统诊断
python stigmergy_cli.py
# 选择 "6. 系统诊断和修复"
```

## 📚 进阶使用

### 自定义协作模式
```python
# 创建自定义协作模式
from cross_cli_mapping import CrossCLIMapper, CollaborationType

mapper = CrossCLIMapper()
# 获取协作建议
suggestions = mapper.suggest_optimal_collaboration(
    "优化Python代码性能", 
    ['claude', 'gemini', 'codex']
)
```

### 直接CLI调用
```python
# 直接执行CLI命令
from cross_platform_safe_cli import get_cli_executor, CLICommand

executor = get_cli_executor()
command = CLICommand(
    cli_name='claude',
    command_type='prompt',
    command='请帮我优化这段代码',
    description='代码优化请求',
    parameters={},
    input_files=[],
    output_files=[]
)

result = executor.execute_cli_command(command)
print(result.stdout)
```

## 🔄 持续更新

### 更新记忆文档
```bash
# 重新生成全局记忆文档
python generate_global_memory.py
```

### 更新协作映射
```bash
# 更新跨CLI协作映射
python src/core/cross_cli_mapping.py
```

---

*文档生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*  
*系统版本: Stigmergy CLI v1.0.0*
"""
    
    # 写入使用指南
    guide_file = Path('global_memory') / 'USAGE_GUIDE.md'
    with open(guide_file, 'w', encoding='utf-8') as f:
        f.write(guide_content)

if __name__ == "__main__":
    from datetime import datetime
    sys.exit(main())