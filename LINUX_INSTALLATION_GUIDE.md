# Linux Auto-Installation Guide

## Overview

Stigmergy CLI now supports automatic installation on Linux systems **without sudo** or other privilege escalation tools. This guide explains how the system works and what to expect.

## Problem Solved

Previously, `stigmergy install` would fail on Linux systems that don't have:
- `sudo` installed
- Passwordless sudo configured
- Other privilege escalation tools (doas, run0, pkexec)

This affected:
- Container environments (Docker, Podman, etc.)
- Minimal Linux distributions
- Systems with restricted user permissions
- Live USB environments

## Solution

The enhanced installer now implements a **three-tier fallback strategy**:

### Tier 1: Detect Privilege Escalation Tools

The installer checks for these tools in order of preference:

1. **sudo** - Most common, checks for passwordless mode
2. **doas** - OpenBSD alternative, often used on Arch Linux
3. **run0** - Modern systemd alternative
4. **pkexec** - Polkit-based escalation tool

For each tool, it tests:
- Whether the tool exists
- Whether it can run without a password (passwordless mode)

**Example output:**
```
[INFO] Unix: Checking privilege escalation methods...
[SUCCESS] Found sudo (passwordless)
```

Or if password is required:
```
[INFO] Unix: Checking privilege escalation methods...
[INFO] Found sudo (requires password)
[INFO] Will prompt for password per installation
```

### Tier 2: Use Detected Tool

If a privilege escalation tool is found, the installer uses it:

```bash
# With sudo
sudo npm install -g @anthropic-ai/claude-code

# With doas
doas npm install -g @anthropic-ai/claude-code

# With run0
run0 npm install -g @anthropic-ai/claude-code
```

### Tier 3: User-Space Installation (No Privileges)

If **no privilege escalation tools are found**, the installer falls back to user-space installation:

```bash
# Install to user directory
npm install -g --prefix ~/.npm-global @anthropic-ai/claude-code
```

**What happens:**
1. Creates `~/.npm-global/` directory if it doesn't exist
2. Installs npm packages to user directory
3. Adds `~/.npm-global/bin` to PATH in shell config files
4. Provides clear instructions to user

**Example output:**
```
[WARN] No privilege escalation tool found (sudo, doas, run0, pkexec)
[INFO] Will attempt user-space installation without privileges
[INFO] Installing Claude CLI to user directory: /home/user/.npm-global
[INFO] Command: npm install -g --prefix "/home/user/.npm-global" @anthropic-ai/claude-code
[SUCCESS] Successfully installed Claude CLI to user directory
[INFO] ⚠️  Make sure to add the bin directory to your PATH:
[INFO]    export PATH="/home/user/.npm-global/bin:$PATH"
[INFO] Added PATH to .bashrc
```

### Tier 4: Automatic Fallback

If privilege escalation **fails** (permission denied, wrong password, etc.), the installer automatically tries user-space installation:

```
[INFO] Using sudo for elevated installation of: Claude CLI
[WARN] Privilege escalation failed, trying user-space installation...
[INFO] Installing Claude CLI to user directory: /home/user/.npm-global
[SUCCESS] Successfully installed Claude CLI to user directory
```

## Shell Configuration

The installer automatically adds the user-space bin directory to your PATH in these files:

- `~/.bashrc` - For Bash users
- `~/.zshrc` - For Zsh users
- `~/.profile` - Fallback for other shells

**Added lines:**
```bash
# Stigmergy CLI PATH
export PATH="/home/user/.npm-global/bin:$PATH"
```

This prevents duplicate entries and ensures the PATH is set on next login.

## Usage Examples

### Example 1: Ubuntu with Passwordless Sudo

```bash
$ stigmergy install claude
[INFO] Unix: Checking privilege escalation methods...
[SUCCESS] Found sudo (passwordless)
[INFO] Installing Claude CLI (claude)...
[INFO] Using sudo for elevated installation of: Claude CLI
[SUCCESS] Successfully installed Claude CLI
```

### Example 2: Container Without Sudo

```bash
$ stigmergy install claude
[INFO] Unix: Checking privilege escalation methods...
[WARN] No privilege escalation tool found (sudo, doas, run0, pkexec)
[INFO] Will attempt user-space installation without privileges
[INFO] Installing Claude CLI to user directory: /root/.npm-global
[SUCCESS] Successfully installed Claude CLI to user directory
[INFO] Added PATH to .bashrc
```

### Example 3: Arch Linux with Doas

```bash
$ stigmergy install gemini
[INFO] Unix: Checking privilege escalation methods...
[INFO] Found doas (requires password)
[INFO] Installing OpenAI Codex CLI (codex)...
[INFO] Using doas for elevated installation of: OpenAI Codex CLI
# Password prompt from doas
[SUCCESS] Successfully installed OpenAI Codex CLI
```

### Example 4: Privilege Escalation Fails

```bash
$ stigmergy install qwen
[INFO] Unix: Checking privilege escalation methods...
[INFO] Found sudo (requires password)
[INFO] Installing Qwen CLI (qwen)...
[INFO] Using sudo for elevated installation of: Qwen CLI
[WARN] Privilege escalation failed, trying user-space installation...
[INFO] Installing Qwen CLI to user directory: /home/user/.npm-global
[SUCCESS] Successfully installed Qwen CLI to user directory
```

## Manual Setup

If you need to manually configure user-space installation:

### 1. Create npm global directory

```bash
mkdir -p ~/.npm-global
```

### 2. Configure npm to use this directory

```bash
npm config set prefix '~/.npm-global'
```

### 3. Add to PATH

Add this line to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
export PATH="~/.npm-global/bin:$PATH"
```

### 4. Reload shell configuration

```bash
source ~/.bashrc  # or source ~/.zshrc
```

### 5. Install packages

```bash
npm install -g @anthropic-ai/claude-code
```

## Troubleshooting

### Issue: Command Not Found After Installation

**Symptom:** After installation, running `claude` or other CLI tools gives "command not found"

**Solution:** The PATH hasn't been reloaded yet. Run:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

Or restart your terminal.

### Issue: Permission Denied During User-Space Installation

**Symptom:** User-space installation fails with permission errors

**Solution:** Ensure your home directory is writable:
```bash
ls -la ~ | head -5
```

If `~/.npm-global` exists with wrong permissions:
```bash
sudo chown -R $USER:$USER ~/.npm-global
chmod -R u+rwx ~/.npm-global
```

### Issue: Old npm Version

**Symptom:** `--prefix` flag not supported

**Solution:** Update npm:
```bash
npm install -g npm@latest
```

## Testing

To verify the installation logic works correctly, run the test:

```bash
node test-linux-install-fix.js
```

This will verify:
- Privilege escalation tool detection logic
- User-space installation command generation
- PATH configuration logic
- Fallback logic

## Technical Implementation

For developers interested in the implementation details:

### Key Methods

**setupUnixElevatedContext()** - `src/core/enhanced_cli_installer.js:221`
```javascript
// Detects privilege escalation tools
// Returns: { privilegeTool, requiresPassword, userSpaceOnly }
```

**executeUserSpaceInstallation()** - `src/core/enhanced_cli_installer.js:511`
```javascript
// Installs to ~/.npm-global without privileges
// Configures PATH automatically
```

**addPathToShellConfig()** - `src/core/enhanced_cli_installer.js:579`
```javascript
// Adds bin directory to PATH in shell configs
// Prevents duplicates with marker comments
```

**executeUnixElevatedInstallation()** - `src/core/enhanced_cli_installer.js:473`
```javascript
// Orchestrates privilege escalation or user-space fallback
// Handles fallback on failure
```

## Supported Scenarios

| Scenario | Sudo Available | Doas Available | Run0 Available | Pkexec Available | Expected Behavior |
|----------|---------------|----------------|----------------|------------------|-------------------|
| Ubuntu Desktop | ✅ | ❌ | ❌ | ❌ | Use sudo (passwordless if configured) |
| Ubuntu Server | ✅ | ❌ | ❌ | ❌ | Use sudo (prompt for password) |
| Arch Linux | ✅ | ✅ | ❌ | ✅ | Use doas (prefer over sudo) |
| Docker Container | ❌ | ❌ | ❌ | ❌ | User-space installation |
| Live USB | ❌ | ❌ | ❌ | ❌ | User-space installation |
| Alpine Linux | ❌ | ❌ | ❌ | ❌ | User-space installation |
| Fedora Server | ✅ | ❌ | ✅ | ✅ | Use sudo (or run0 if available) |

## Security Considerations

### User-Space Installation

User-space installation is **secure** because:
- Only affects the current user's environment
- Doesn't modify system directories
- Doesn't require root privileges
- npm packages respect user permissions

### Privilege Escalation

When privilege escalation is used:
- Each installation command is elevated separately
- Password is prompted per installation (if not passwordless)
- No persistent elevated context is maintained
- Fails gracefully to user-space if denied

## Future Enhancements

Potential improvements for future versions:
- GUI prompt for privilege escalation (polkit)
- Persistent npm global directory configuration
- Automatic shell reload after installation
- Detection of existing npm global directory configuration
- Support for additional shells (fish, csh, tcsh)

## Related Documentation

- `CHANGELOG.md` - Version history and changes
- `test-linux-install-fix.js` - Verification tests
- `src/core/enhanced_cli_installer.js` - Implementation
- `README.md` - General installation guide

## Getting Help

If you encounter issues with Linux installation:

1. Check the test output: `node test-linux-install-fix.js`
2. Verify your shell configuration: `cat ~/.bashrc | grep PATH`
3. Check npm configuration: `npm config get prefix`
4. Report issues with detailed error messages

---

**Last Updated:** 2025-12-24
**Version:** 1.3.2-beta.0
**Status:** ✅ Implementation Complete and Tested
