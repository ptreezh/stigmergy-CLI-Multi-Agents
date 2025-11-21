# Smart CLI Router 快速开始指南 | 异构智能体协作系统

## 安装

### 一键安装（推荐）
```bash
# 下载项目
git clone https://github.com/your-username/smart-cli-router.git
cd smart-cli-router

# 运行快速启动
python quick_start.py
```

### 手动配置
```bash
# 生成智能路由器
python src/universal_cli_setup.py --cli ai --format cmd
```

## 智能体协作快速入门

### 启动协作模式
```bash
# 创建协作项目目录
mkdir my_collaboration_project
cd my_collaboration_project

# 复制项目宪法到协作目录
cp ../PROJECT_CONSTITUTION.md ./
cp ../PROJECT_SPEC.json ./
```

### 自然语言协作
在智能路由器中使用自然语言进行多智能体协作：

```bash
# 单一工具使用
smart_ai.cmd 用claude写Python代码
smart_ai.cmd 用gemini分析数据问题
smart_ai.cmd 用kimi写技术文章

# 多智能体协作 - 当一个智能体无法解决或不确定时，会自动委派给其他智能体
smart_ai.cmd 请帮我创建一个完整的计算器应用，包含代码、文档和测试
# 这个指令可能触发多个智能体协作完成：
# 1. 代码生成智能体生成代码
# 2. 测试智能体生成单元测试
# 3. 文档智能体生成文档
```

### 项目宪法使用
每个协作项目都应包含项目宪法：

```bash
# 将项目宪法应用到新项目
cp PROJECT_CONSTITUTION.md /path/to/new/project/
cp PROJECT_SPEC.json /path/to/new/project/
```

## 使用方法

### 自然语言路由
在任何支持的CLI工具中使用自然语言：

```bash
# 在Qwen中
qwen "用gemini帮我翻译 'Hello World'"
qwen "让claude帮我分析这段代码"
qwen "请kimi生成文档"

# 在Claude中
claude "用qwen帮我写算法"
claude "让gemini解释这段逻辑"
claude "用codebuddy优化代码"

# 在其他工具中
gemini "请kimi帮你生成报告"
codebuddy "让copilot帮我审查代码"
```

### 路由规则
系统会识别以下关键词并自动路由：

**中文模式:**
- `用{工具名}帮我{任务}` - 用gemini帮我翻译
- `让{工具名}帮我{任务}` - 让qwen帮我写代码
- `请{工具名}{任务}` - 请claude分析需求

**英文模式:**
- `Use {tool} to {action}` - Use Gemini to translate
- `Let {tool} {action}` - Let Qwen write code
- `Ask {tool} to {action}` - Ask Claude to analyze

## 异构智能体协作系统

### 协作机制
- **统一规范文档**：所有智能体通过共享的 `PROJECT_SPEC.json` 文件进行协作
- **自然语言协商**：智能体之间通过自然语言进行协商和沟通
- **任务委派**：当一个智能体无法解决或不确定时，可以将任务委派给其他智能体
- **分工协作**：多个智能体基于项目目录和统一规范文档完成任务分工

### 协作流程
1. **任务识别**：智能体识别当前可处理的任务
2. **状态检查**：检查项目规范文档中的当前状态
3. **任务执行**：执行分配给自己的任务
4. **状态更新**：更新任务状态和项目信息
5. **协作委派**：需要时委派任务给其他智能体
6. **协作记录**：记录协作过程和决策

## 功能特性

### 智能路由
- 自动检测路由意图
- 智能清理输入指令
- 安全权限控制
- 无缝功能切换

### 兼容性
- 保持所有原始功能
- 无功能损失
- 向下兼容
- 降级机制

### 支持工具
- Claude, Gemini, Qwen, Kimi
- CodeBuddy, Copilot, Qoder, iFlow
- 以及更多工具支持

## 高级用法

### 复杂路由
```bash
# 串联路由
qwen "让gemini翻译，然后用claude分析"  # 支持多步路由

# 参数传递
claude "用qwen帮我写代码 --with-comments"  # 传递参数给目标工具
```

### 自定义配置
编辑 `~/.dsgs/router_config.json` 自定义路由规则：

```json
{
  "enabled": true,
  "routing_rules": {
    "qwen": ["gemini", "claude", "kimi"],
    "claude": ["qwen", "gemini", "codebuddy"],
    "gemini": ["qwen", "claude", "copilot"]
  }
}
```

## 故障排除

### 常见问题
1. **路由不工作** - 检查目标工具是否已安装
2. **权限错误** - 检查路由规则配置
3. **命令未识别** - 检查自然语言格式

### 验证安装
```bash
# 测试路由功能
dsgs --test-routing

# 查看支持的工具
dsgs --list-tools
```

## 更新和维护

### 更新系统
```bash
npm update -g dsgs-cli
dsgs  # 重新配置
```

### 查看版本
```bash
dsgs --version
```

现在您可以享受在CLI工具内部使用自然语言进行智能路由和多智能体协作的便捷体验了！