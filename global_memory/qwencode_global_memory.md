# QwenCode CLI Global Memory Document

## Basic Information
- **CLI Name**: qwencode
- **Display Name**: QwenCode CLI
- **Command**: `qwencode`
- **Description**: Alibaba Cloud QwenCode CLI Tool
- **Developer**: Alibaba Cloud
- **Website**: https://www.aliyun.com

## System Information
- **Authentication Method**: api_key
- **Required Environment Variables**: QWEN_API_KEY
- **Optional Environment Variables**: QWEN_BASE_URL, QWEN_MODEL
- **Configuration Files**: ~/.qwencode/config.json, ~/.config/qwencode/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'QwenCode CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:14.466477

## Input/Output Specifications
- **Input Format**: text
- **Output Format**: text
- **Supported File Types**: .txt, .md, .py, .js, .ts, .java, .cpp, .c, .h
- **Batch Processing**: Not supported
- **Streaming**: Not supported

## Usage Examples
### QwenCode CLI Basic Chat
```bash
qwencode "Hello, please introduce your features"
```

### QwenCode CLI Process Files
```bash
qwencode --file example.py
```

### QwenCode CLI Cross-CLI Collaboration
```bash
qwencode "Please use claude to review the code quality"
```

### QwenCode CLI Configuration Management
```bash
qwencode config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Not supported
- **Workflows**: Not supported
- **Code Generation**: Not supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: claude, gemini, iflow, qoder, codebuddy, copilot, codex, cline
- **Collaboration Capabilities**:
  - code_generation
  - debugging
  - testing

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
- **Typical Response Time**: 2-4秒
- **Concurrent Requests**: 3
- **Rate Limit**: 500次/小时

## Update History
- **Last Updated**: 2025-12-04T13:49:14.716960
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:14.716960*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*