# Stigmergy CLI 部署指南

> ⚠️ **重要提示**: 当前版本为开发版本，正在完善中

## 🎯 当前状态

### ✅ **已完成的功能**
1. **项目基础架构** - 完整的Node.js包结构
2. **核心CLI功能** - 基本的帮助、状态检查功能
3. **配置系统** - 支持8个主要AI CLI工具的适配器
4. **文档模板** - 增强的协作指南生成

### 🚧 **正在完善的功能**
1. **适配器集成** - 需要完善各个CLI工具的具体集成
2. **NPX发布** - 需要发布到npm注册表
3. **错误处理** - 需要更完善的异常处理机制

## 🚀 本地部署和使用

### 方式1: 直接运行（推荐开发者）

```bash
# 1. 克隆项目
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 2. 安装依赖
npm install

# 3. 运行帮助命令
npm start

# 4. 初始化项目
npm run init

# 5. 查看状态
npm run status
```

### 方式2: 本地全局安装

```bash
# 在项目目录下
npm link .

# 全局可用
stigmergy-cli --help
```

## 🔧 手动部署到AI CLI工具

由于当前版本的限制，需要手动将协作功能集成到各个AI CLI工具中：

### Claude CLI集成
```json
// ~/.config/claude/hooks.json
{
  "hooks": {
    "user_prompt_submit": {
      "enabled": true,
      "script": "node /path/to/stigmergy-cli/src/main.js init",
      "timeout": 30
    }
  }
}
```

### Gemini CLI集成
```json
// ~/.config/gemini/extensions.json
{
  "extensions": {
    "stigmergy": {
      "name": "Stigmergy CLI",
      "version": "1.0.0",
      "enabled": true,
      "hooks": ["on_prompt_submit"],
      "handler": "node /path/to/stigmergy-cli/src/main.js init"
    }
  }
}
```

## 🎯 完整部署计划

### 第一阶段：核心功能完善
- [ ] 修复路径和文件访问问题
- [ ] 完善错误处理机制
- [ ] 添加日志记录功能
- [ ] 实现完整的适配器加载

### 第二阶段：集成测试
- [ ] 测试与Claude CLI的集成
- [ ] 测试与Gemini CLI的集成
- [ ] 测试与其他CLI工具的协作
- [ ] 验证跨工具调用功能

### 第三阶段：NPX发布
- [ ] 完善package.json配置
- [ ] 添加必要的依赖和脚本
- [ ] 创建发布脚本
- [ ] 发布到npm注册表

### 第四阶段：文档和示例
- [ ] 编写详细的集成指南
- [ ] 创建使用示例和最佳实践
- [ ] 录制演示视频
- [ ] 建立社区支持

## 🔍 当前可用命令

```bash
# 查看帮助
stigmergy-cli                    # 显示所有可用命令

# 基础功能
stigmergy-cli status            # 检查系统和适配器状态
stigmergy-cli init             # 初始化项目（当前目录）
stigmergy-cli deploy           # 部署适配器（实验性）
```

## ⚠️ 已知限制

1. **文件路径问题**: 在Windows环境下可能存在路径分隔符问题
2. **适配器配置**: 部分适配器配置文件需要完善
3. **依赖管理**: 某些Node.js依赖包可能需要调整
4. **错误恢复**: 需要更完善的错误处理和用户反馈

## 🎉 下一步计划

1. **立即可用**: 基础功能已经可以在本地运行
2. **本周内**: 完善核心功能，修复已知问题
3. **两周内**: 完成主要CLI工具的集成测试
4. **一个月内**: 实现NPX发布，让其他用户可以直接使用

## 📞 技术支持

- **GitHub Issues**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues
- **文档**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/blob/main/README.md
- **讨论**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions

---

**注意**: 这是一个活跃开发的项目，功能在持续完善中。欢迎贡献代码和反馈建议！

> 🚀 **目标**: 让AI工具通过Stigmergy机制实现真正的智能协作