# 快速安装指南

## 🚀 一键安装

### Windows
```powershell
# 方法1：右键PowerShell，选择"以管理员身份运行"
# 然后复制运行以下命令：
npm install -g stigmergy

# 方法2：从普通PowerShell启动管理员PowerShell
Start-Process PowerShell -Verb RunAs -ArgumentList "npm install -g stigmergy"
```

### macOS/Linux
```bash
# 复制运行以下命令：
sudo npm install -g stigmergy
```

## 🎯 安装后使用

```bash
# 检查状态
stigmergy status

# 安装所有AI CLI工具
stigmergy install

# 开始使用
stigmergy help
```

## ❓ 遇到问题？

### Windows权限问题
```powershell
# 如果遇到权限错误，使用：
npm install -g stigmergy --force
```

### macOS/Linux权限问题
```bash
# 如果遇到权限错误，使用：
sudo npm install -g stigmergy --unsafe-perm=true --allow-root
```

### npm版本问题
```bash
# 更新npm到最新版本
npm install -g npm@latest
sudo npm install -g stigmergy
```

## 🎉 完成！

安装完成后，您可以在任何目录使用：
- `claude` - Claude CLI
- `gemini` - Gemini CLI
- `qwen` - Qwen CLI
- `stigmergy` - Stigmergy协调工具

---

**就是这么简单！** 🎈