# Changelog

All notable changes to this project will be documented in this file.

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

[1.2.1]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/compare/v1.1.8...v1.2.0