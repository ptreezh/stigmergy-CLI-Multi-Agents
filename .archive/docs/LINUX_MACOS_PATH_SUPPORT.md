# Linux/macOS Path Detection Support

## Overview

Stigmergy CLI now supports comprehensive path detection for Linux and macOS systems, covering various Node.js installation methods and user configurations.

## Supported Paths

### User-Specific Paths
- `~/.npm-global/bin` - Custom NPM global prefix
- `~/.npm/bin` - Default NPM user installation
- `~/node_modules/.bin` - Local project binaries
- `~/.nvm/versions/node/*/bin` - NVM (Node Version Manager) installations
- `~/.nvm/current/bin` - NVM current version
- `~/.local/bin` - User local binaries
- `~/.brew/node/bin` - Custom Homebrew (macOS)

### System-Wide Paths
- `/usr/local/bin` - Common system location
- `/usr/bin` - System binaries
- `/opt/node/bin` - Node.js installed to /opt
- `/opt/nodejs/bin` - Alternative system installation
- `/usr/local/share/npm/bin` - npm share location
- `/opt/homebrew/bin` - Apple Silicon Homebrew (macOS)
- `/snap/bin` - Snap packages (Ubuntu)
- `/var/lib/snapd/snap/bin` - Snap system

### Root-Specific Paths
- `/root/.npm-global/bin` - Root user custom prefix
- `/root/.npm/bin` - Root user npm
- `/root/node_modules/.bin` - Root local node_modules
- `/root/.nvm/versions/node/*/bin` - NVM installations for root

## Detection Methods

### 1. NPM Query (Primary)
- Uses `npm config get prefix` to determine actual global installation path
- Most reliable method as it queries npm directly
- Works with custom npm configurations

### 2. System PATH Search
- Checks all directories in the system PATH environment variable
- Uses `which` command on Unix-like systems

### 3. Comprehensive Directory Scanning
- Scans all known npm global installation directories
- Supports wildcard expansion for NVM version paths
- Handles various Node.js installation methods

## Platform-Specific Considerations

### Linux
- Supports APT, YUM, DNF package manager installations
- Works with NVM, N, fnm Node.js version managers
- Handles Snap packages (Ubuntu)
- Compatible with custom prefix installations

### macOS
- Supports Homebrew (Intel and Apple Silicon)
- Works with MacPorts installations
- Compatible with NVM and other version managers
- Handles custom installations in /opt/local

## Usage Examples

```bash
# Install and auto-detect paths
stigmergy setup

# Manual path detection test
stigmergy status

# Direct CLI usage (uses detected paths)
stigmergy claude "your prompt"
stigmergy gemini "your prompt"
```

## Troubleshooting

If CLI tools are not detected:

1. **Check npm configuration**:
   ```bash
   npm config get prefix
   npm config list
   ```

2. **Verify installation location**:
   ```bash
   which npm
   npm list -g --depth=0
   ```

3. **Check PATH**:
   ```bash
   echo $PATH
   ```

4. **Manual installation**:
   ```bash
   npm install -g @anthropic-ai/claude-code
   npm install -g @google/gemini-cli
   ```

## Common Issues Resolved

- ✅ **Root user installations**: Now detects `/root/.npm` paths
- ✅ **NVM installations**: Supports wildcard path expansion
- ✅ **Homebrew on macOS**: Intel and Apple Silicon variants
- ✅ **Custom npm prefixes**: Detects non-standard configurations
- ✅ **Snap packages**: Ubuntu Snap support
- ✅ **System package managers**: APT/YUM/DNF compatibility

## Performance

- Path detection results are cached to avoid repeated scans
- Fast lookup for subsequent CLI tool executions
- Intelligent fallback mechanisms for robustness

## Implementation Details

The path detection system uses a multi-layered approach:

1. **NPM Query Layer** - Direct npm configuration queries
2. **PATH Environment Layer** - System PATH scanning
3. **Directory Scan Layer** - Comprehensive known location scanning
4. **Cache Layer** - Persistent storage of detected paths

This ensures maximum compatibility across different Linux distributions and macOS versions.