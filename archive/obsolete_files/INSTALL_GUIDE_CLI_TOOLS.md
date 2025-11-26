# CLI工具安装指南

## 📦 安装 Node.js

首先安装 Node.js，这是大多数 AI CLI 工具的基础环境：

**Windows:**
```
https://nodejs.org/dist/v24.11.1/node-v24.11.1-x64.msi
```

## 🔧 安装各 AI 工具 CLI

### Claude Code CLI
```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 或使用 zcf 工具一键设置环境（包括 API URL/KEY/Model 等）
# 参考: https://github.com/UfoMiao/zcf/blob/main/README_zh-CN.md
npx zcf
```

### Gemini CLI
```bash
npm install -g @google/gemini-cli
```

### Qwen CLI
```bash
npm install -g @qwen-code/qwen-code
```

### iFlow CLI
```bash
npm install -g @iflow-ai/iflow-cli
```

### CodeBuddy CLI
```bash
npm install -g codebuddycli
```

### DeepSeek CLI (使用 zcf 切换模型)
```bash
# 安装 zcf 后，通过 zcf 换成 deepseek-ai/DeepSeek-V3.1 就能使用
npx zcf
```

## 🚀 智能体协作系统使用

安装完上述工具后，运行智能体协作系统：

```bash
# 克隆项目
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 运行部署脚本
python deploy.py --global-setup
```

## 🤝 协作示例

在任意目录中：

```bash
# Claude内部识别并路由到其他工具
claude "让gemini帮我翻译这份文档"

# Gemini内部识别并路由到其他工具  
gemini "请codebuddy优化这段代码"

# iFlow内部识别并路由到其他工具
iflow "用claude分析这个需求"
```

## 📄 项目背景文件

协作系统会自动创建以下文件来实现 Stigmergy 机制：

- `PROJECT_SPEC.json` - 任务状态和协作历史
- `PROJECT_CONSTITUTION.md` - 项目协作规则
- `TASKS.md` - 人类可读任务列表
- `COLLABORATION_LOG.md` - 协作日志

## 🎯 特性与优势

- **内部自然语言交互**: 在原始 CLI 工具内部使用自然语言
- **跨工具协作**: 支持 Claude、Gemini、Qwen 等工具协同工作
- **基于背景的间接协同**: 通过共享背景文件实现 Stigmergy 机制
- **原子性安全**: 防止多智能体任务冲突
- **去中心化架构**: 无中央协调器的自主协作