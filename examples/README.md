# 📚 Smart CLI Router 使用示例

本目录包含了Smart CLI Router的各种使用示例，帮助您快速上手和深入了解项目功能。

## 📁 示例文件

### [basic_usage.py](basic_usage.py)
基本使用示例，包含：
- 工具检测和发现
- 智能路由器生成
- 自定义配置
- 跨平台支持

### 运行示例

```bash
# 进入项目根目录
cd smart-cli-router

# 运行基本示例
python examples/basic_usage.py
```

## 🎯 示例内容

### 1. 基本设置和工具检测
```python
# 创建设置实例
setup = UniversalCLISetup()

# 检查可用工具
available_tools = setup.discover_available_tools()
```

### 2. 生成智能路由器
```python
# 生成CMD格式路由器
router_content = create_smart_router("myai", "cmd")

# 保存为文件
with open("smart_myai.bat", 'w') as f:
    f.write(router_content)
```

### 3. 自定义配置
```json
{
  "tools": {
    "my_custom_tool": {
      "command": {"windows": "mytool.cmd"},
      "keywords": ["mytool", "自定义"],
      "priority": 1
    }
  },
  "default_tool": "my_custom_tool"
}
```

### 4. 跨平台生成
```python
formats = ["cmd", "powershell", "bash", "python"]
for fmt in formats:
    content = create_smart_router("crossai", fmt)
    # 保存对应格式的文件
```

## 🚀 快速测试

生成路由器后，您可以立即测试：

```bash
# Windows
smart_myai.bat 用claude写代码

# Linux/macOS
./smart_crossai.sh 用gemini分析问题

# Python通用
python smart_crossai.py 用kimi写文章
```

## 📖 更多示例

我们将持续添加更多示例，包括：

- [ ] 高级路由规则配置
- [ ] 工具包装器开发
- [ ] Shell集成示例
- [ ] 企业级部署方案
- [ ] 性能优化技巧

## 💡 贡献示例

欢迎提交您的使用示例！请确保：

1. 代码清晰易懂
2. 包含必要的注释
3. 提供运行说明
4. 遵循项目代码规范

---

**让AI工具听从您的自然语言指令！** 🚀