# Changelog

All notable changes to this project will be documented in this file.

## [1.2.9] - 2025-12-15

### Added
- Added GLM4.5 as a contributor to the project
- Enhanced web interface with both English and Chinese versions
- Improved cross-CLI communication documentation
- Added comprehensive .gitignore with patterns for test files and temporary files

### Changed
- Updated package name from 'stigmergy' to 'stigmergy-cli' for clarity
- Updated contributor list to include all AI systems (Claude, Qwen, iFlow, QoderCLI, GLM4.5)
- Removed unnecessary authentication modules (auth.js, auth_command.js)
- Simplified isAuthenticated function to return true by default
- Updated installation process to use enhanced installer

## [1.2.1] - 2025-12-12

### Added
- Added `call` command implementation to the new modular architecture in `src/cli/router.js`
- Added `call` command to help output in router.js

### Changed
- Moved old `main.js` implementation to archive directory
- Updated package version from 1.2.0 to 1.2.1
- Consolidated command handling to modular `src/cli/router.js` architecture

### Fixed
- Fixed missing `call` command functionality in the modular system
- Resolved architecture inconsistency where call command existed in old implementation but not in new modular system

### Removed
- Removed dependency on old `package/src/main.js` for `call` command functionality

## [1.2.0] - 2025-12-11

### Added
- Modular architecture with `src/cli/router.js` as main command router
- Node.js-first implementation with Python-free approach
- Real-world testing approach instead of theoretical implementations
- ANSI encoding for international compatibility

### Changed
- Replaced shell script implementation with Node.js implementation
- Moved to modular architecture from monolithic implementation
- Updated project structure to support modular design

## [1.2.8] - 2025-12-14

### Added
- 完整实现12种语言的跨CLI指令识别支持
  - 英语 (English), 中文 (Chinese), 日语 (Japanese), 韩语 (Korean)
  - 德语 (German), 法语 (French), 西班牙语 (Spanish), 意大利语 (Italian)
  - 葡萄牙语 (Portuguese), 俄语 (Russian), 阿拉伯语 (Arabic), 土耳其语 (Turkish)
- 嵌入式LanguagePatternManager，确保在部署环境中可靠加载
- 完善多语言跨CLI指令识别机制

### Fixed
- 修复了 "direct addressing" 模式匹配问题，现在正确捕获 "please" 前缀
- 改进了正则表达式模式，确保所有前缀在任务文本中被正确保留

## [1.2.7] - 2025-12-14

### Fixed
- 修复了部署的钩子中 LanguagePatternManager 模块路径查找问题
- 修复了 LanguagePatternManager 构造函数的多种导入场景处理
- 增强了模块导入的健壮性，支持多种导入方式（默认导出、命名导出等）
- 改进了 HookDeploymentManager 中的多路径查找逻辑
- 优化了部署钩子的错误处理和回退机制
- 修复了模块实例化逻辑，确保在各种环境下的兼容性

## [1.2.6] - 2025-12-14

### Added
- 中英文双语钩子指令支持增强
- 钩子全局部署在 ~/.stigmergy/hooks/ 目录下
- 支持所有8个CLI工具的自动部署

### Changed
- 增强中文语言支持用于跨CLI通信
- 改进了ANSI编码兼容性

### Fixed
- 修复了钩子部署中的正则表达式模式问题
- 增强了模式匹配的准确性
- 改进了跨CLI调用的参数处理

[1.2.8]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.2.1...v1.2.6
[1.2.1]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.1.8...v1.2.0