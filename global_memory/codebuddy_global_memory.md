# CodeBuddy CLI Global Memory Document

## Basic Information
- **CLI Name**: codebuddy
- **Display Name**: CodeBuddy CLI
- **Command**: `codebuddy`
- **Description**: CodeBuddy Programming Assistant CLI Tool
- **Developer**: CodeBuddy Team
- **Website**: https://codebuddy.ai

## System Information
- **Authentication Method**: api_key
- **Required Environment Variables**: CODEBUDDY_API_KEY
- **Optional Environment Variables**: CODEBUDDY_BASE_URL, CODEBUDDY_MODEL
- **Configuration Files**: ~/.codebuddy/config.json, ~/.config/codebuddy/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'CodeBuddy CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:15.241405

## Input/Output Specifications
- **Input Format**: text
- **Output Format**: text
- **Supported File Types**: .txt, .md, .py, .js, .ts, .java, .cpp, .c, .h
- **Batch Processing**: Not supported
- **Streaming**: Supported

## Usage Examples
### CodeBuddy CLI Basic Chat
```bash
codebuddy "Hello, please introduce your features"
```

### CodeBuddy CLI Process Files
```bash
codebuddy --file example.py
```

### CodeBuddy CLI Cross-CLI Collaboration
```bash
codebuddy "Please use claude to review the code quality"
```

### CodeBuddy CLI Streaming Output
```bash
codebuddy --stream "Write a poem about programming"
```

### CodeBuddy CLI Configuration Management
```bash
codebuddy config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Not supported
- **Workflows**: Not supported
- **Code Generation**: Not supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: claude, gemini, qwencode, iflow, qoder, copilot, codex, cline
- **Collaboration Capabilities**:
  - learning
  - tutorial
  - explanation

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

## Performance Characteristics
- **Typical Response Time**: 3-7秒
- **Concurrent Requests**: 5
- **Rate Limit**: 1000次/小时

## Update History
- **Last Updated**: 2025-12-04T13:49:15.496419
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:15.496419*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*