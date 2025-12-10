# Release Notes v1.1.6

## Features
- Removed obsolete `call` command from CLI interface
- Improved cross-CLI communication reliability
- Enhanced hook deployment mechanism with better error handling
- Added comprehensive documentation for all supported CLI tools

## Fixes
- Fixed syntax errors in HookDeploymentManager.js that prevented proper hook generation
- Corrected CLI parameter handling for cross-CLI communication
- Resolved issues with qwen hook not properly invoking iflow
- Fixed regex pattern matching in cross-CLI request detection
- Improved error handling in CLI communication module

## Improvements
- Enhanced cross-CLI communication with direct module calls (no background services required)
- Better parameter adaptation for different CLI tools (iflow now properly uses -p flag)
- Streamlined deployment process with more reliable hook generation
- Added detailed documentation files for each supported CLI tool
- Improved system architecture with clearer separation of concerns

## Supported AI CLI Tools
- Claude (Anthropic)
- Qwen (Alibaba)
- Gemini (Google)
- iFlow (Intelligent Workflow)
- Qoder CLI
- CodeBuddy
- GitHub Copilot
- OpenAI Codex

## Architecture
- Distributed hook system for seamless CLI integration
- Node.js coordination layer for cross-CLI orchestration
- Dynamic parameter learning through CLI help analysis
- Fault-tolerant communication with multiple fallback mechanisms