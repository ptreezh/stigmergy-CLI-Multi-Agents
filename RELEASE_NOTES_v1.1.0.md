# Stigmergy CLI v1.1.0 Release Notes

## 🎉 Major Improvements

### 🔧 Architectural Refactoring
- **Modular Code Structure**: Split monolithic `main_english.js` into 5 focused modules:
  - `src/core/memory_manager.js` - Memory and interaction tracking
  - `src/core/installer.js` - Installation and deployment logic
  - `src/utils/helpers.js` - Utility functions
  - `src/cli/router.js` - Command routing and CLI interface
  - `src/index.js` - Unified entry point
- **Improved Maintainability**: Cleaner separation of concerns makes future development easier
- **Backward Compatibility**: All existing functionality preserved

### 🚀 Enhanced Node.js Coordination Layer
- **Complete Implementation**: Full Node.js fallback for Python-free environments
- **Automatic Hook Deployment**: npm install -g automatically deploys adapters for available CLI tools
- **Cross-CLI Communication**: Simulated inter-tool collaboration for seamless workflow
- **Graceful Degradation**: Robust fallback mechanisms when Python components unavailable

### 🛡️ Deployment Security
- **No Manual File Opening**: Eliminated any scenarios where JS files might open in text editors
- **Cross-Platform Compatibility**: Tested on Windows, Linux, and macOS
- **Proper File Associations**: Correct shebangs and permissions for direct execution

## 📈 Performance & Reliability

### ⚡ Faster Startup
- Modular loading reduces initial memory footprint
- Optimized import structure improves boot time

### 🐛 Bug Fixes
- Fixed regex pattern corruption in generated hook files
- Resolved async test infrastructure issues
- Corrected cross-platform path handling

## 📋 New Features

### 🔍 Enhanced CLI Commands
- `stigmergy status` - Detailed tool availability report
- `stigmergy scan` - Comprehensive CLI tool detection
- `stigmergy deploy` - Selective adapter deployment
- Improved error messaging and troubleshooting guidance

### 🛠️ Developer Experience
- Streamlined development workflow with `npm run dev`
- Enhanced testing infrastructure with 79/79 test pass rate
- Comprehensive documentation updates

## 🎯 Use Cases Enabled

1. **Enterprise Environments**: Python-free deployment in restricted environments
2. **Cross-Platform Development**: Consistent experience across operating systems
3. **Collaborative AI Workflows**: Seamless switching between Claude, Gemini, Qwen, and other AI tools
4. **Automated Setup**: One-command installation with `npm install -g stigmergy`

## 🚀 Getting Started

```bash
# Install globally
npm install -g stigmergy

# Auto-scan and install AI CLI tools
stigmergy install

# Start collaborating
stigmergy call "Create a React component for a todo list"
```

## 📊 Version Information
- **Previous Version**: 1.0.99
- **New Version**: 1.1.0
- **Type**: Major Feature Release
- **Compatibility**: Fully backward compatible

## 🙏 Acknowledgments
Thanks to all contributors who helped test and refine this release. Special thanks to early adopters who provided valuable feedback on the Node.js coordination layer implementation.