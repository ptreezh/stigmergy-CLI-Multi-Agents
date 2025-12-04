# Qoder CLI Global Memory Document

## Basic Information
- **CLI Name**: qoder
- **Display Name**: Qoder CLI
- **Command**: `qoder`
- **Description**: Qoder Code Generation CLI Tool
- **Developer**: Qoder Team
- **Website**: https://qoder.ai

## System Information
- **Authentication Method**: api_key
- **Required Environment Variables**: QODER_API_KEY
- **Optional Environment Variables**: QODER_BASE_URL, QODER_MODEL
- **Configuration Files**: ~/.qoder/config.json, ~/.config/qoder/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'Qoder CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:14.972628

## Input/Output Specifications
- **Input Format**: text
- **Output Format**: code
- **Supported File Types**: .txt, .md, .py, .js, .ts, .java, .cpp, .c, .h
- **Batch Processing**: Supported
- **Streaming**: Not supported

## Usage Examples
### Qoder CLI Basic Chat
```bash
qoder "Hello, please introduce your features"
```

### Qoder CLI Process Files
```bash
qoder --file example.py
```

### Qoder CLI Code Generation
```bash
qoder "Please generate a Python quick sort algorithm"
```

### Qoder CLI Cross-CLI Collaboration
```bash
qoder "Please use claude to review the code quality"
```

### Qoder CLI Batch Mode
```bash
qoder --batch --input-dir ./src --output-dir ./output
```

### Qoder CLI Configuration Management
```bash
qoder config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Not supported
- **Workflows**: Not supported
- **Code Generation**: Supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: claude, gemini, qwencode, iflow, codebuddy, copilot, codex, cline
- **Collaboration Capabilities**:
  - code_completion
  - snippet_generation
  - template_creation

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
- **Typical Response Time**: 2-6秒
- **Concurrent Requests**: 3
- **Rate Limit**: 800次/小时

## Update History
- **Last Updated**: 2025-12-04T13:49:15.228966
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:15.228966*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*