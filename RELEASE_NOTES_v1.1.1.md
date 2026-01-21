# Stigmergy CLI v1.1.1 Release Notes

## 🐛 Critical Bug Fixes

### 🔧 Fixed Critical Runtime Errors
- **Undefined 'route' variable**: Fixed ReferenceError that occurred when routing prompts failed
- **Missing 'router' instance**: Added proper instantiation of SmartRouter in CLI router
- **Undefined 'fs' module**: Added missing fs import in installer module

### 🚀 Enhanced Stability
- Improved error handling in command routing
- Fixed deployment issues with Qwen and Qoder CLI tools
- Resolved configuration initialization problems

## 📈 Performance & Reliability

### ⚡ Improved Error Handling
- More robust exception handling in CLI command processing
- Better error messages for debugging and troubleshooting
- Graceful degradation when individual CLI tools fail

## 🎯 Use Cases Enabled

1. **Reliable Cross-CLI Collaboration**: Stable inter-tool communication without runtime crashes
2. **Consistent Deployment**: Proper hook deployment for all supported AI tools
3. **Robust Error Recovery**: Enhanced resilience against various failure scenarios

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
- **Previous Version**: 1.1.0 (had critical bugs)
- **New Version**: 1.1.1 (bug fixes and stability improvements)
- **Type**: Patch Release
- **Compatibility**: Fully backward compatible

## 🙏 Acknowledgments
Thanks to early adopters who reported the critical runtime errors. This patch release addresses all known issues that prevented proper execution of the Stigmergy CLI system.