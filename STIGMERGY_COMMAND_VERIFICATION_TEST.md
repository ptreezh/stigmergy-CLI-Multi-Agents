# Stigmergy CLI Command Verification Test

This document provides a complete verification test for the Stigmergy CLI multi-agents system.

## 1. Quick System Verification

Run this command to verify the system is installed correctly:

```bash
stigmergy version
```

Expected output: Shows the version number (e.g., "Stigmergy CLI v1.3.2-beta.7")

## 2. Command Structure Verification

The following commands should execute without structural errors:

```bash
# Check overall system status
stigmergy status

# Scan for available CLI tools
stigmergy scan

# Check help for main commands
stigmergy --help
```

## 3. Individual Tool Commands Test

Verify that each AI tool command is properly routed:

```bash
# Test Claude
stigmergy claude "hello" --print

# Test Gemini  
stigmergy gemini "hello" --print

# Test Qwen
stigmergy qwen "hello" --print

# Test iFlow
stigmergy iflow "hello" --print

# Test other tools
stigmergy codebuddy "hello" --print
stigmergy copilot "hello" --print
stigmergy codex "hello" --print
stigmergy qodercli "hello" --print
```

## 4. Smart Routing Test

Test the intelligent command routing system:

```bash
# Smart routing - system chooses best tool
stigmergy call "say hello world"

# Smart routing with different prompts
stigmergy call "write a simple JavaScript function"
stigmergy call "translate 'hello' to French"
stigmergy call "summarize benefits of renewable energy"
```

## 5. Skills Management Test

Verify skills system functionality:

```bash
# Show skills help
stigmergy skill

# List installed skills
stigmergy skill list

# Skills shortcuts
stigmergy skill-l
```

## 6. System Commands Test

Test system management commands:

```bash
# Diagnostic
stigmergy diagnostic

# Clean cache
stigmergy clean --dry-run

# Check permissions
stigmergy perm-check
```

## 7. Advanced Features Test

Test advanced functionality:

```bash
# Resume session (if available)
stigmergy resume --help

# Session management
stigmergy resumesession --help

# Project initialization (in a test directory)
mkdir test-project && cd test-project
stigmergy init
```

## 8. Comprehensive Test Script

For a complete verification, you can run the test script created in this project:

```bash
node test-stigmergy-command.js
node test-command-structure.js
```

## Expected Results

- All commands should execute without structural errors
- API-related failures due to missing keys are normal and expected
- Command routing should work correctly
- The system should detect installed CLI tools properly

## Troubleshooting

If commands fail with "command not found" errors:
1. Make sure stigmergy is installed globally: `npm install -g stigmergy`
2. Verify your PATH includes npm global binaries
3. Run `stigmergy setup` to complete installation

If API-related errors occur (which is normal):
- This indicates the command structure is working correctly
- Configure your API keys according to each tool's documentation