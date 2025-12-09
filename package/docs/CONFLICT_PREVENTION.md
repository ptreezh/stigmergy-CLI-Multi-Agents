# Stigmergy CLI Conflict Prevention System

This document describes the comprehensive system implemented to prevent conflicts with other CLI tools.

## Problem Statement

Stigmergy previously caused conflicts with other CLI tools by:
1. Installing conflicting npm packages (like the "node" package)
2. Creating broken executable files that interfered with normal CLI operation
3. Modifying system PATH inappropriately

## Solution Overview

We have implemented a multi-layered protection system:

### 1. Pre-installation Safety Checks

**File**: `scripts/preinstall-check.js`
**Purpose**: Prevent installation when conflicts are detected

Checks performed:
- Node.js version compatibility
- npm availability and version
- Existing conflicting "node" package installations
- Previous Stigmergy installations

### 2. Safe Installation Process

**File**: `scripts/safe-install.js`
**Purpose**: Ensure safe installation without side effects

Features:
- Backup of potentially conflicting files
- Monitoring during installation
- Automatic rollback on failure
- Conflict detection during installation

### 3. Runtime Safety Monitoring

**File**: `src/main_english.js` (safetyCheck method)
**Purpose**: Detect conflicts during normal operation

Monitors:
- Conflicting npm packages
- Broken executable files
- System integrity

### 4. Conflict Resolution Tools

**Files**: 
- `fix-node-conflict.js` - Basic conflict fixer
- `fix-node-conflict-enhanced.js` - Advanced conflict prevention

Capabilities:
- Detect and remove conflicting packages
- Repair broken executables
- Verify CLI tool functionality
- Apply preventive measures

### 5. Emergency Recovery

**Files**:
- `emergency-cleanup.js` - Complete system cleanup
- `cleanup.js` - Standard cleanup
- `diagnostic.js` - System diagnostics
- `path-fixer.js` - PATH environment repair

## Usage Instructions

### For Users

1. **Regular Maintenance**:
   ```bash
   npm run fix-node-conflict
   ```

2. **System Diagnostics**:
   ```bash
   npm run diagnostic
   ```

3. **Emergency Cleanup**:
   ```bash
   npm run emergency-clean
   ```

### For Developers

1. **Add safety checks to new features**:
   ```javascript
   await this.safetyCheck(); // Call before critical operations
   ```

2. **Update dependency list carefully**:
   - Avoid dependencies named "node" or similar to system executables
   - Use exact versions instead of ranges when possible
   - Regularly audit dependencies with `npm audit`

3. **Test installation in clean environments**:
   - Use Docker containers or VMs for testing
   - Verify no conflicts with popular CLI tools
   - Test on multiple operating systems

## Best Practices

### Dependency Management
- Pin critical dependencies to specific versions
- Avoid dependencies that might conflict with system tools
- Regular security audits
- Monitor for deprecated dependencies

### Installation Process
- Never modify system PATH directly
- Use npm's standard installation mechanisms
- Provide clear uninstallation procedures
- Test installation/uninstallation cycles

### Conflict Prevention
- Unique naming for executables and packages
- Comprehensive pre-flight checks
- Graceful degradation when conflicts detected
- Clear error messages with resolution steps

## Future Improvements

1. **Automated Testing**:
   - Integration tests with popular CLI tools
   - Cross-platform compatibility verification
   - Regression testing for known conflicts

2. **Enhanced Monitoring**:
   - Real-time conflict detection
   - Proactive notifications
   - Automated recovery

3. **Improved Documentation**:
   - Detailed troubleshooting guides
   - Platform-specific instructions
   - Community contribution guidelines

## Reporting Issues

If you encounter conflicts:
1. Run `npm run diagnostic`
2. Save the output
3. Report to the Stigmergy team with:
   - Operating system and version
   - Node.js and npm versions
   - List of installed CLI tools
   - Diagnostic output