# Claude CLI Global Memory Document

## Basic Information
- **CLI Name**: claude
- **Display Name**: Claude CLI
- **Command**: `claude`
- **Description**: Anthropic Claude CLI Tool
- **Developer**: Anthropic
- **Website**: https://www.anthropic.com

## System Information
- **Authentication Method**: api_key
- **Required Environment Variables**: ANTHROPIC_API_KEY
- **Optional Environment Variables**: ANTHROPIC_BASE_URL, ANTHROPIC_API_URL
- **Configuration Files**: ~/.claude/config.json, ~/.config/claude/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'Claude CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:13.917537

## Input/Output Specifications
- **Input Format**: text
- **Output Format**: text
- **Supported File Types**: .txt, .md, .py, .js, .ts, .java, .cpp, .c, .h
- **Batch Processing**: Supported
- **Streaming**: Supported

## Usage Examples
### Claude CLI Basic Chat
```bash
claude "Hello, please introduce your features"
```

### Claude CLI Process Files
```bash
claude --file example.py
```

### Claude CLI Cross-CLI Collaboration
```bash
claude "Please use claude to review the code quality"
```

### Claude CLI Batch Mode
```bash
claude --batch --input-dir ./src --output-dir ./output
```

### Claude CLI Streaming Output
```bash
claude --stream "Write a poem about programming"
```

### Claude CLI Configuration Management
```bash
claude config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Not supported
- **Workflows**: Not supported
- **Code Generation**: Not supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: gemini, qwencode, iflow, qoder, codebuddy, copilot, codex, cline
- **Collaboration Capabilities**:
  - code_review
  - analysis
  - documentation

## Common Errors
### 认证失败
- **Cause**: API密钥无效或未设置
- **Solution**: 检查环境变量设置，确保API密钥正确

### 网络连接错误
- **Cause**: 网络不可达或服务器故障
- **Solution**: 检查网络连接，稍后重试

### 文件不存在
- **Cause**: 指定的文件路径不存在
- **Solution**: 检查文件路径是否正确

### 权限不足
- **Cause**: 文件权限或系统权限不足
- **Solution**: 使用管理员权限运行或检查文件权限

### 令牌配额不足
- **Cause**: API调用次数超限
- **Solution**: 检查账户余额或升级套餐

## Performance Characteristics
- **Typical Response Time**: 2-5秒
- **Concurrent Requests**: 5
- **Rate Limit**: 1000次/小时

## Update History
- **Last Updated**: 2025-12-04T13:49:14.189972
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:14.189972*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*