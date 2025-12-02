# Cline CLI 集成适配器

## 概述

Cline CLI 是一个基于 Node.js 和 gRPC 架构的 AI 助手 CLI 工具，支持任务生命周期管理、多智能体编排和 Hook 系统集成。本适配器为 Cline CLI 提供了与 Stigmergy 多 CLI 协作系统的完整集成。

## 🌟 核心特性

### 任务生命周期管理
- **TaskStart**: 任务开始时触发
- **TaskResume**: 任务恢复时触发  
- **TaskCancel**: 任务取消时触发
- **UserPromptSubmit**: 用户提交消息时触发
- **PreToolUse**: 工具执行前触发
- **PostToolUse**: 工具执行后触发

### 多智能体编排
- 支持同时管理多个 Cline 实例
- 任务委托和跨 CLI 协作
- 工作流编排和状态监控

### Hook 系统集成
- JSON 标准输入输出通信
- 任务执行状态跟踪
- 跨 CLI 协作日志记录

## 🛠️ 安装和配置

### 系统要求

- **操作系统**: macOS 或 Linux (Windows 支持计划中)
- **Node.js**: 16.0 或更高版本
- **Python**: 3.7 或更高版本
- **Cline CLI**: 已安装并配置

### 安装步骤

1. **安装 Cline CLI**:
```bash
npm install -g cline
```

2. **验证安装**:
```bash
cline --version
```

3. **安装 Stigmergy 集成**:
```bash
cd src/adapters/cline
python install_cline_integration.py
```

4. **启用 Hook 系统** (在 Cline 设置中):
- 打开 Cline 设置
- 导航到 "Features" 部分
- 启用 "Enable Hooks" 选项

### 配置文件

#### 用户配置 (`~/.config/cline/config.json`)
```json
{
  "cline_version": "1.0.0",
  "api_provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "hooks_enabled": true,
  "stigmergy_integration": {
    "enabled": true,
    "cross_cli_collaboration": true,
    "statistics_tracking": true,
    "auto_backup": true
  }
}
```

#### 适配器配置 (`~/.stigmergy/adapters/cline/config.json`)
```json
{
  "name": "cline",
  "displayName": "Cline CLI",
  "version": "1.0.0",
  "integration_type": "hook_system",
  "supported_platforms": ["darwin", "linux"],
  "hook_system": {
    "supported_hooks": [
      "TaskStart", "TaskResume", "TaskCancel",
      "UserPromptSubmit", "PreToolUse", "PostToolUse"
    ]
  }
}
```

## 🚀 使用方法

### 基本命令

```bash
# 直接调用 Cline CLI
cline-call.sh "analyze this code structure"

# 跨 CLI 协作
cline-call.sh "请用 claude 帮我审查这段代码"

# 复杂任务执行
cline-call.sh "执行多步骤部署流程"

# 工作流编排
cline-call.sh "协调多个 CLI 工具完成任务"
```

### Python API 使用

```python
from src.adapters.cline import StandaloneClineAdapter

# 初始化适配器
adapter = StandaloneClineAdapter()

# 执行基本任务
result = adapter.execute_task("优化数据库查询", {})
print(result)

# 跨 CLI 协作
result = adapter.execute_task("请用 gemini 翻译这段文档", {})
print(result)

# 健康检查
health = adapter.health_check()
print(json.dumps(health, indent=2, ensure_ascii=False))
```

## 🤝 跨 CLI 协作模式

### 支持的协作类型

1. **任务委托** (`TASK_DELEGATION`)
   - Claude → Cline: 复杂任务执行
   - 触发词: "请用 cline 执行任务", "cline 帮我执行"

2. **分析反馈** (`ANALYSIS_FEEDBACK`)
   - Cline → Claude: 执行结果分析
   - 触发词: "请 claude 分析执行结果", "claude 帮我总结"

3. **任务编排** (`ORCHESTRATION`)
   - 多 CLI → Cline: 工作流协调
   - 触发词: "协调多个 CLI 工具", "cline 编排任务"

### 协作示例

```bash
# 任务委托示例
!claude "请用 cline 帮我执行完整的测试流程"

# 分析反馈示例  
!cline "执行部署任务后，请 claude 分析结果"

# 任务编排示例
!iflow "cline 协调 claude 和 gemini 完成代码审查和优化"
```

## 📊 性能统计

适配器提供详细的性能统计信息：

```json
{
  "total_requests": 150,
  "cross_cli_calls": 45,
  "successful_calls": 142,
  "failed_calls": 8,
  "start_time": "2025-12-01T10:30:00Z"
}
```

## 🔧 Hook 系统详解

### Hook 类型

1. **TaskStart Hook**
   - 触发时机: 任务开始时
   - 用途: 初始化跟踪、注入上下文

2. **PreToolUse Hook**
   - 触发时机: 工具执行前
   - 用途: 权限验证、参数检查

3. **PostToolUse Hook**
   - 触发时机: 工具执行后
   - 用途: 结果记录、性能监控

### Hook 通信格式

```json
{
  "clineVersion": "1.0.0",
  "hookName": "TaskStart",
  "timestamp": "2025-12-01T10:30:00Z",
  "taskId": "task-12345",
  "workspaceRoots": ["/path/to/workspace"],
  "userId": "user-67890"
}
```

## 🛡️ 安全考虑

### 权限管理
- Hook 脚本以用户权限运行
- 无敏感数据硬编码
- 安全的临时文件处理

### 数据保护
- API 密钥通过环境变量传递
- 执行日志安全存储
- 跨 CLI 调用结果加密

### 错误处理
- 全面的异常捕获
- 详细的错误日志记录
- 优雅的错误恢复机制

## 🔍 故障排除

### 常见问题

1. **Cline CLI 未找到**
   ```
   Error: Cline CLI is not available in PATH
   ```
   **解决方案**: 确保 Cline CLI 已安装并在 PATH 中

2. **Hook 系统未启用**
   ```
   Warning: Hooks not enabled in Cline settings
   ```
   **解决方案**: 在 Cline 设置中启用 Hook 系统

3. **权限错误**
   ```
   Error: Permission denied for hook execution
   ```
   **解决方案**: 检查 Hook 文件权限，确保可执行

### 调试模式

```bash
# 启用详细输出
cline-call.sh --verbose "debug this issue"

# 查看 Hook 执行日志
tail -f ~/.stigmergy/logs/cline_hooks.log

# 检查适配器健康状态
python -m src.adapters.cline.standalone_cline_adapter
```

## 📚 API 参考

### StandaloneClineAdapter 类

#### 方法

- `is_available() -> bool`: 检查 Cline CLI 是否可用
- `initialize() -> bool`: 初始化适配器和 Hook 系统
- `execute_task(task: str, context: Dict[str, Any]) -> str`: 执行任务
- `health_check() -> Dict[str, Any]`: 健康检查
- `get_stats() -> Dict[str, Any]`: 获取统计信息

#### 属性

- `cli_name`: 适配器名称 ("cline")
- `display_name`: 显示名称 ("Cline CLI")
- `version`: 版本号 ("1.0.0")
- `integration_type`: 集成类型 ("hook_system")

## 🤝 贡献指南

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 安装开发依赖
pip install -r requirements.txt

# 运行测试
python -m pytest tests/test_cline_adapter.py
```

### 提交规范

- 遵循现有代码风格
- 添加单元测试
- 更新文档
- 使用语义化提交信息

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../../LICENSE) 文件。

## 🙏 致谢

- [Cline CLI](https://github.com/cline/cline) - 核心 CLI 工具
- [Stigmergy 团队](https://github.com/ptreezh) - 多 CLI 协作系统
- 所有贡献者和社区成员

---

**最后更新**: 2025年12月1日  
**版本**: 1.0.0  
**维护者**: Stigmergy 团队