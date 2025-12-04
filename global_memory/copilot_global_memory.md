# GitHub Copilot CLI Global Memory Document

## Basic Information
- **CLI Name**: copilot
- **Display Name**: GitHub Copilot CLI
- **Command**: `copilot`
- **Description**: GitHub Copilot CLI Tool
- **Developer**: GitHub/Microsoft
- **Website**: https://github.com/features/copilot

## System Information
- **Authentication Method**: oauth_or_token
- **Required Environment Variables**: GITHUB_TOKEN
- **Optional Environment Variables**: COPILOT_API_KEY, COPILOT_MODEL
- **Configuration Files**: ~/.config/copilot/config.json, ~/.config/github/copilot/config.json
- **Permission Level**: user

## Current Status
- **Status**: not_found
- **Status Message**: CLI工具 'GitHub Copilot CLI' 未安装
- **Last Checked**: 2025-12-04T13:49:15.496419

## Input/Output Specifications
- **Input Format**: text
- **Output Format**: text
- **Supported File Types**: .txt, .md, .py, .js, .ts, .java, .cpp, .c, .h
- **Batch Processing**: Supported
- **Streaming**: Supported

## Usage Examples
### GitHub Copilot CLI Basic Chat
```bash
copilot "Hello, please introduce your features"
```

### GitHub Copilot CLI Process Files
```bash
copilot --file example.py
```

### GitHub Copilot CLI Cross-CLI Collaboration
```bash
copilot "Please use claude to review the code quality"
```

### GitHub Copilot CLI Batch Mode
```bash
copilot --batch --input-dir ./src --output-dir ./output
```

### GitHub Copilot CLI Streaming Output
```bash
copilot --stream "Write a poem about programming"
```

### GitHub Copilot CLI Configuration Management
```bash
copilot config set model gpt-4
```

## Integration Capabilities
- **File Processing**: Supported
- **Image Processing**: Not supported
- **Workflows**: Not supported
- **Code Generation**: Not supported

## Cross-CLI Collaboration
- **Can Call Other CLIs**: Supported
- **Supported Target CLIs**: claude, gemini, qwencode, iflow, qoder, codebuddy, codex, cline
- **Collaboration Capabilities**:
  - pair_programming
  - suggestion
  - completion

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

### 订阅过期
- **Cause**: GitHub Copilot订阅已过期
- **Solution**: 续订GitHub Copilot服务

## Performance Characteristics
- **Typical Response Time**: 1-2秒
- **Concurrent Requests**: 20
- **Rate Limit**: 无限制(受订阅限制)

## Update History
- **Last Updated**: 2025-12-04T13:49:15.753417
- **Recent Changes**:
  - 添加跨平台编码安全支持
  - 改进Windows系统兼容性
  - 优化内存使用
  - 增加新的CLI命令
  - 修复已知bug
  - 更新文档

---
*Document Generation Time: 2025-12-04T13:49:15.753417*
*Generation Tool: Stigmergy CLI Multi-Agents*
*Encoding Safe: True*
*Cross Platform: True*