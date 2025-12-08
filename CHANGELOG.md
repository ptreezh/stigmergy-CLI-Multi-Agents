# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.95] - 2025-12-08

### Added
- Unified CLI parameter handling system for better cross-tool compatibility
- Enhanced CLI help analyzer with improved pattern recognition
- New CLI parameter handler for consistent argument generation across all tools

### Changed
- Refactored redundant implementations between CLI help analyzer and parameter handler
- Improved parameter generation logic for Claude, iFlow, Codex, CodeBuddy, and other CLI tools
- Updated unit tests for CLI parameter handling

### Fixed
- Resolved issues with Claude CLI integration not working properly
- Fixed iFlow CLI parameter passing issues
- Corrected Codex CLI subcommand handling

## [1.0.94] - 2025-12-08

### Added
- Initial release of Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System
- Support for multiple AI CLI tools including Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, and Codex
- Smart routing system for automatically directing prompts to appropriate AI tools
- Cross-CLI collaboration capabilities
- Memory management for interaction history
- Comprehensive testing suite