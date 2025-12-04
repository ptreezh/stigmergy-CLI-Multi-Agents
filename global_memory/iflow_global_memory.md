# iFlow CLI Global Memory Document

## Basic Information
- **CLI Name**: iflow
- **Display Name**: iFlow CLI
- **Command**: `iflow`
- **Description**: iFlow Workflow CLI Tool
- **Developer**: iFlow Team
- **Website**: https://iflow.ai

## System Information
- **Authentication Method**: api_key
- **Required Environment Variables**: IFLOW_API_KEY
- **Optional Environment Variables**: IFLOW_BASE_URL, IFLOW_WORKSPACE
- **Configuration Files**: ~/.iflow/config.json, ~/.config/iflow/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'iFlow CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:14.716960

## Input/Output Specifications
- **Input Format**: workflow
- **Output Format**: workflow
- **Supported File Types**: .yml, .yaml, .json, .txt, .md
- **Batch Processing**: Supported
- **Streaming**: Not supported

## Usage Examples
### iFlow CLI Basic Chat
```bash
iflow "Hello, please introduce your features"
```

### iFlow CLI Process Files
```bash
iflow --file example.py
```

### iFlow CLI Cross-CLI Collaboration
```bash
iflow "Please use claude to review the code quality"
```

### iFlow CLI Batch Mode
```bash
iflow --batch --input-dir ./src --output-dir ./output
```

### iFlow CLI Configuration Management
```bash
iflow config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Not supported
- **Workflows**: Supported
- **Code Generation**: Not supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: claude, gemini, qwencode, qoder, codebuddy, copilot, codex, cline
- **Collaboration Capabilities**:
  - workflow_creation
  - automation
  - integration

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
- **Typical Response Time**: 3-8秒
- **Concurrent Requests**: 2
- **Rate Limit**: 200次/小时

## Update History
- **Last Updated**: 2025-12-04T13:49:14.972628
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:14.972628*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*