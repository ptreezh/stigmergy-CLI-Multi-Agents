# Archived Python Installation Scripts

## 概述
此目录包含已弃用的 Python 安装脚本，已被 JavaScript 版本替代。

## 迁移历史
- **迁移日期**: 2025-12-13
- **原因**: 完全迁移到 JavaScript 实现，避免 Python 依赖
- **状态**: 已弃用，但保留作为参考

## 文件列表
- `install_claude_integration.py` - Claude CLI Python 安装脚本
- `install_gemini_integration.py` - Gemini CLI Python 安装脚本  
- `install_qwen_integration.py` - Qwen CLI Python 安装脚本
- `install_iflow_integration.py` - iFlow CLI Python 安装脚本
- `install_qoder_integration.py` - Qoder CLI Python 安装脚本
- `install_codebuddy_integration.py` - CodeBuddy CLI Python 安装脚本
- `install_copilot_integration.py` - GitHub Copilot CLI Python 安装脚本
- `install_codex_integration.py` - OpenAI Codex CLI Python 安装脚本

## 对应的 JavaScript 版本
每个 Python 脚本都有对应的 JavaScript 版本，位于相同的适配器目录中：
- `src/adapters/claude/install_claude_integration.js`
- `src/adapters/gemini/install_gemini_integration.js`
- `src/adapters/qwen/install_qwen_integration.js`
- `src/adapters/iflow/install_iflow_integration.js`
- `src/adapters/qoder/install_qoder_integration.js`
- `src/adapters/codebuddy/install_codebuddy_integration.js`
- `src/adapters/copilot/install_copilot_integration.js`
- `src/adapters/codex/install_codex_integration.js`

## 功能对比
### Python 版本（已弃用）
- 依赖 Python 环境
- 需要额外的 Python 包
- 部署复杂度高

### JavaScript 版本（当前使用）
- 无额外依赖
- 与 Node.js 环境完全兼容
- 部署简单快捷
- 功能完全一致

## 迁移说明
所有 Python 脚本的功能已完全移植到 JavaScript 版本中，包括：
1. 配置文件创建
2. 钩子配置
3. 适配器文件复制
4. Cross-CLI 文档生成
5. 工具特定配置

## 注意事项
- 这些 Python 脚本仅作为参考保留
- 实际部署请使用 JavaScript 版本
- 如需参考原始实现，可在此目录中查看

---
*此文档于 2025-12-13 创建*