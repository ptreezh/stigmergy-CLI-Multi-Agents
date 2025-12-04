# Gemini CLI Global Memory Document

## Basic Information
- **CLI Name**: gemini
- **Display Name**: Gemini CLI
- **Command**: `gemini`
- **Description**: Google Gemini CLI Tool
- **Developer**: Google
- **Website**: https://ai.google.dev

## System Information
- **Authentication Method**: api_key
- **Required Environment Variables**: GEMINI_API_KEY
- **Optional Environment Variables**: GOOGLE_CLOUD_PROJECT, GOOGLE_APPLICATION_CREDENTIALS
- **Configuration Files**: ~/.gemini/config.json, ~/.config/gemini/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'Gemini CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:14.196460

## Input/Output Specifications
- **Input Format**: text_or_image
- **Output Format**: text
- **Supported File Types**: .txt, .md, .py, .js, .ts, .java, .cpp, .c, .h, .png, .jpg, .jpeg
- **Batch Processing**: Supported
- **Streaming**: Supported

## Usage Examples
### Gemini CLI Basic Chat
```bash
gemini "Hello, please introduce your features"
```

### Gemini CLI Process Files
```bash
gemini --file example.py
```

### Gemini CLI Cross-CLI Collaboration
```bash
gemini "Please use claude to review the code quality"
```

### Gemini CLI Batch Mode
```bash
gemini --batch --input-dir ./src --output-dir ./output
```

### Gemini CLI Streaming Output
```bash
gemini --stream "Write a poem about programming"
```

### Gemini CLI Configuration Management
```bash
gemini config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Supported
- **Workflows**: Not supported
- **Code Generation**: Not supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: claude, qwencode, iflow, qoder, codebuddy, copilot, codex, cline
- **Collaboration Capabilities**:
  - translation
  - optimization
  - refactoring

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

### 模型不可用
- **Cause**: 选择的模型在当前区域不可用
- **Solution**: 使用其他可用模型

## Performance Characteristics
- **Typical Response Time**: 1-3秒
- **Concurrent Requests**: 10
- **Rate Limit**: 2000次/小时

## Update History
- **Last Updated**: 2025-12-04T13:49:14.466477
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:14.466477*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*