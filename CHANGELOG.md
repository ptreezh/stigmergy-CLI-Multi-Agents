# Changelog

All notable changes to this project will be documented in this file.

## [1.3.2-beta.3] - 2025-12-25

### Fixed
- **Critical syntax error in generated hook files** - ResumeSessionGenerator regex escaping issue
  - Fixed template string interpolation: removed `\` before `${commandName}` that was blocking variable substitution
  - Fixed regex literal syntax conflicts by using RegExp constructor instead of regex literals
  - Fixed backslash escaping calculation for template strings nested in generated code
  - **Impact**: All CLI tools' ResumeSession integration was failing with syntax errors
  - **Files affected**:
    - `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js` (Line 537, 627)
    - Generated files: `resumesession-history.js` for all CLI tools

### Technical Details

**Root Cause**:
1. **Template interpolation blocked**: `\${commandName}` prevented variable substitution, generating literal `${commandName}` in output
2. **Regex literal syntax conflict**: Using `/pattern/` with command names containing `/` broke the regex syntax
3. **Incorrect backslash escaping**: Attempted to escape `/` in regex literals when RegExp constructor was needed

**The Fix**:
```javascript
// Before (Line 537, 627)
const cleanInput = input.replace(/^\\\\/?\${commandName}\\s*/i, '').trim();
//                                ↑ Blocks interpolation   ↑ Regex literal breaks

// After
const cleanInput = input.replace(
  new RegExp('^\\\\\\\\/?' + '${commandName}' + '\\\\\s*', 'i'),
  ''
).trim();
```

**Escaping Formula**:
```
Source backslashes = Target backslashes × 2^(nesting depth)
```

### Lessons Learned
- Created comprehensive documentation in `docs/LESSONS_LEARNED.md`
- Updated `docs/development_guidelines.md` with "Code Generation Standards" section
- Established rules for template strings + regex combinations
- Added code review checklist for generated code validation
- Created debugging utilities for syntax validation

### Documentation
- Created `docs/LESSONS_LEARNED.md` - Comprehensive error lesson log with detailed analysis
- Updated `docs/development_guidelines.md`:
  - Added Section 10: Code Generation Standards
  - Added Section 10.1: Template String Regex Handling (⚠️ CRITICAL)
  - Added Section 10.2: Code Generation Best Practices
  - Added Section 10.3: Common Error Cases
  - Added Section 10.4: Historical Error Records

### Key Rules Established
1. **Never block interpolation**: Use `${variable}`, not `\${variable}` (unless literal needed)
2. **Dynamic patterns → RegExp constructor**: Avoid regex literal `/` delimiter conflicts
3. **Calculate backslashes**: Use formula, don't guess
4. **Validate generated syntax**: Test generated code immediately
5. **Document escaping**: Always comment on escape calculations

### Tested
- ✅ Generated hook files pass syntax validation
- ✅ RegExp constructor correctly handles command names with `/`
- ✅ Template string interpolation works correctly
- ✅ All CLI tools deploy successfully with valid hook files
- ✅ Production package (v1.3.2-beta.3) verified working

### Performance Impact
- None (syntax fix only)

### Breaking Changes
- None (backward compatible)

---

## [1.3.2-beta.2] - 2025-12-25

### Fixed
- Qwen CLI working directory and environment issues
- Comprehensive Linux/macOS path detection support

---

## [1.3.2-beta.1] - 2025-12-25

### Added
- OAuth authentication support for CLI tools

---

## [1.3.2-beta.0] - 2025-12-24

### Added
- **Linux Installation Without Sudo** - Comprehensive support for Linux systems without privilege escalation tools
  - Multiple privilege escalation tool detection: sudo, doas, run0, pkexec
  - User-space installation fallback to ~/.npm-global when no tools available
  - Automatic PATH configuration in ~/.bashrc, ~/.zshrc, ~/.profile
  - Graceful fallback from privilege escalation to user-space installation
  - Passwordless privilege escalation detection when available
  - Enhanced permission mode detection for Unix/Linux systems

### Fixed
- Fixed "Cannot access 'toolInfo' before initialization" error in upgrade command
- Fixed Codex CLI not being detected during upgrade scans
- Fixed Codex shell parameter (changed from shell=false to shell=true)
- Fixed variable initialization order in upgradeTools method
- Fixed **Windows installation error** - "Cannot read properties of undefined (reading 'split')"
  - Added null checks for `toolInfo.install` in all installation methods
  - Internal functions (`scanForTools`, `checkInstallation`) are now properly skipped
  - `scanCLI()` now filters out tools without install commands
  - `installTools()` and `upgradeTools()` skip internal functions
  - `installTool()` returns false early for tools without install command

### Technical Details
- **enhanced_cli_installer.js**:
  - Modified `setupUnixElevatedContext()` to detect multiple privilege escalation tools
  - Modified `executeUnixElevatedInstallation()` to use detected privilege tool and fallback to user-space
  - Added `executeUserSpaceInstallation()` for user-space npm installation
  - Added `addPathToShellConfig()` for automatic PATH configuration
  - Added null checks in `installTool()`, `executeStandardInstallation()`, `executeFallbackInstallation()`
  - Modified `installTools()` and `upgradeTools()` to skip tools without install commands
- **installer.js**:
  - Fixed Codex detection by using shell=true on Windows
  - Fixed Codex special check to use shell parameter correctly
  - Modified `scanCLI()` to skip internal functions without install commands
- **enhanced_cli_parameter_handler.js**:
  - Fixed flag-based execution pattern support for Kode CLI

### Tested
- Verified privilege escalation tool detection logic
- Verified user-space installation command generation
- Verified PATH configuration in shell config files
- Verified fallback logic for failed privilege escalation
- Verified Windows installation error fix - no more "undefined (reading 'split')" errors
- Verified internal functions are properly skipped during installation
- All logic tests passed

### Documentation
- Created `test-linux-install-fix.js` - Verification test for Linux installation fix
- Created `test-windows-fix.js` - Verification test for Windows installation fix
- Created `WINDOWS_INSTALL_TROUBLESHOOTING.md` - Complete Windows troubleshooting guide

## [1.3.1-beta.0] - 2025-12-23

### Added
- **Kode CLI Integration** - Full support for Kode CLI (Multi-Model Collaboration System)
  - Added 'kode' to all supportedCLIs arrays across the codebase
  - Added 'kode' to VALID_CLI_TOOLS whitelist in smart_router.js
  - Added 'kode' to cliNameMap in cli_path_detector.js
  - Updated commandFormat to `kode -p "{prompt}"` for non-interactive execution
  - Agent/skill detection support for Kode CLI
  - 12-language natural language pattern support for Kode
  - Kode-specific agent types: expert, skill, analysis, agent
  - Pre-configured skills: 异化分析技能, 数字马克思智能体, 技术分析技能, 阶级分析技能

- **Enhanced Parameter Format Detection**
  - Improved non-interactive flag detection to include 'print', 'pipe', 'exit' keywords
  - Fixed detection of CLI tools with `--print` style flags (like Kode)
  - Better support for CLI tools using alternative non-interactive flags

### Changed
- Enhanced help scanning to properly detect Kode CLI's command structure
- Updated all documentation to include Kode CLI information
- Improved CLI path detection to cover all 9 supported tools

### Fixed
- Fixed SmartRouter warnings about scanForTools and checkInstallation being treated as CLI tools
- Fixed non-interactive flag detection for CLI tools using `--print` instead of `--non-interactive`
- Fixed Kode CLI not being detected in `stigmergy scan` command

### Documentation
- Created `kode.md` - Comprehensive Kode CLI documentation with usage examples
- Created `KODE_CLI_INTEGRATION_REPORT.md` - Detailed integration test report
- Created `KODE_PARAM_SUPPORT_REPORT.md` - Parameter format support analysis
- Created `test-kode-params.js` - Test script for Kode parameter format detection
- Updated `README.md` - Added Kode to supported tools list and feature list
- Updated `STIGMERGY.md` - Added Kode to CLI tools list and examples
- Updated `AGENTS.md` - Added Kode to project overview

### Tested
- All 9 CLI tools now properly supported (claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, kode)
- 12-language auto-call patterns verified for all supported tools
- Agent/skill parameter format optimization tested and working
- Smart routing properly includes Kode in tool selection
- Help scanning correctly detects Kode CLI patterns and structure

### Breaking Changes
- None - All changes are backward compatible

### Migration Notes
- No migration needed - existing installations will automatically support Kode after `stigmergy deploy`
- Run `stigmergy scan` to refresh CLI tool detection cache
- Run `stigmergy deploy` to update hooks with Kode support

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