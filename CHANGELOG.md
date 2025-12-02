# Changelog

## [1.0.63] - 2025-12-02

### Added
- 实现完整的跨CLI工具协作系统
- 支持Claude、Gemini、Qwen、iFlow、Qoder、CodeBuddy、Copilot、Codex等AI CLI工具
- 智能部署系统，自动扫描、安装和配置CLI工具
- 自然语言跨工具调用功能
- 一键部署命令 (`quick-deploy`)

### Changed
- 重构核心架构，支持多种集成类型（Hook系统、Extension系统、Class继承等）
- 移除Python依赖，全部使用Node.js实现
- 优化CLI工具检测逻辑，正确处理包名与命令名不一致的情况
- 改进插件部署机制，支持各CLI工具的特定集成方式

### Fixed
- 修复Qoder CLI检测问题
- 修复Qwen CLI命令执行问题
- 修复iFlow CLI安装脚本问题
- 修复CodeBuddy CLI集成问题

## [1.0.0] - 2025-12-01

### Added
- 初始版本发布
- 基础CLI工具扫描功能
- 简单的插件部署机制