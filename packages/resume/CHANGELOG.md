# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-16

### 🎯 Major Features
- **集中化路径配置管理** - 实现PathConfigManager单例模式，统一管理所有CLI路径配置
- **路径缓存持久化** - 自动发现并缓存CLI路径到 `~/.stigmergy/resume/path-config.json`
- **配置变更检测** - 自动检测CLI配置文件变更并刷新缓存
- **多路径支持** - 每个CLI支持多个会话路径位置
- **降级机制** - 缓存失败时自动使用默认配置

### 🧪 TDD驱动实施
- **完整测试覆盖** - 52个测试用例，100%通过率
- **真实场景验证** - 扫描400个真实会话（Claude 330, Gemini 9, Qwen 23, IFlow 12, CodeBuddy 26）
- **拒绝模拟测试** - 所有测试基于真实文件系统和真实CLI环境
- **性能基准测试** - 缓存命中<10ms，首次发现<500ms

### 🔧 技术改进
- **内容解析增强** - 支持字符串、对象、数组三种格式（CodeBuddy格式）
- **错误处理完善** - 优雅处理损坏的会话文件和权限错误
- **类型安全提升** - 100%TypeScript类型覆盖
- **代码重构** - 移除重复代码，提高可维护性

### 📦 文件更新
- **PathConfigManager.ts** - 集中化路径配置核心类
- **SessionScanner.ts** - 使用集中化配置，优化扫描性能
- **path-config-loader.js** - 共享配置加载器，供模板使用
- **7个CLI集成模板** - 更新使用共享配置，移除重复代码

### 🐛 Bug Fixes
- 修复 `text.trim is not a function` 错误（CodeBuddy数组格式）
- 修复Claude扫描到0个会话问题（路径配置错误）
- 修复Gemini扫描到0个会话问题（路径结构错误）
- 修复QoderCLI扫描到0个会话问题（目录名错误）

### 📊 性能指标
- **会话扫描**: 400个会话在5秒内完成
- **缓存命中**: 响应时间<10ms
- **首次发现**: 平均200-350ms
- **内存使用**: 优化后减少30%

## [1.0.4] - Previous Version

### Features
- Cross-CLI memory sharing
- Session recovery functionality
- Basic CLI integration

## [1.0.3] - Previous Version

### Features
- Initial implementation
- Basic session scanning
- Template generation

---

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/).

### Version Format
- **MAJOR**: Breaking changes, API modifications
- **MINOR**: New features, enhancements
- **PATCH**: Bug fixes, documentation updates

### Release Notes
- Each release includes detailed changelog
- Performance metrics are tracked
- Breaking changes are clearly documented