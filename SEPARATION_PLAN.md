# Stigmergy CLI Multi-Package Separation Plan

## Overview
This document outlines the separation of the current monorepo into independent, focused packages.

## Current Structure Analysis

### Package Dependencies
```
stigmergy (main) v1.2.1
├── resumesession v1.0.4 (resumesession/)
├── stigmergy-skill v1.0.0 (skills-package/)
└── cross-cli-session-recovery v1.0.0 (cross-cli-session-recovery/)

stigmergy (dev) v1.1.8 (package/)
└── [Duplicate development version]
```

## Recommended Separation Structure

### 1. Core Package: `stigmergy-cli`
**Location**: Root directory
**Purpose**: Multi-agent AI CLI tools collaboration system
**Contents**:
- `src/core/` - Core functionality
- `src/cli/` - Command line interface
- `src/adapters/` - CLI adapters
- `bin/` - Executable scripts
- `scripts/` - Build and deployment scripts
- `tests/` - Test suites
- `docs/` - Documentation
- `config/` - Configuration files
- `templates/` - Template files

**Package**: `package.json` (root)
**Version**: 1.2.1

### 2. Session Recovery Package: `@stigmergy/session-recovery`
**Location**: `packages/session-recovery/`
**Purpose**: Cross-CLI memory sharing and session recovery
**Contents**:
- `src/` - TypeScript source
- `dist/` - Compiled JavaScript
- `tests/` - Test files
- `README.md` - Package documentation
- `package.json` - Package configuration

**Current Location**: `resumesession/`
**Current Version**: 1.0.3 → **New Version**: 2.0.0

### 3. Skills System Package: `@stigmergy/skills`
**Location**: `packages/skills/`
**Purpose**: Natural language skills for AI CLI tools
**Contents**:
- `src/` - Skills implementation
- `hooks/` - CLI hooks
- `test/` - Test files
- `README.md` - Package documentation
- `package.json` - Package configuration

**Current Location**: `skills-package/`
**Current Version**: 1.0.0 → **New Version**: 2.0.0

### 4. History Management Package: `@stigmergy/history`
**Location**: `packages/history/`
**Purpose**: Cross-CLI session history management and recovery
**Contents**:
- `src/` - TypeScript source
- `dist/` - Compiled JavaScript
- `tests/` - Test files
- `README.md` - Package documentation
- `package.json` - Package configuration

**Current Location**: `cross-cli-session-recovery/`
**Current Version**: 1.0.0 → **New Version**: 2.0.0

## Migration Steps

### Phase 1: Code Consolidation (CRITICAL)
1. **Merge Core Features**: Compare and merge unique features from both packages
   - Move optimized files (`*_optimized.js`) from dev package to main
   - Move enhanced installer/uninstaller from main to dev
   - Consolidate test files (keep more comprehensive versions)
   - Align dependency versions

2. **Feature Comparison**:
   - Main package has: `cache_cleaner.js`, `enhanced_installer.js`, `enhanced_uninstaller.js`, `upgrade_manager.js`
   - Dev package has: `cli_help_analyzer_optimized.js`, `smart_router_optimized.js`
   - **Action**: Merge ALL unique features into main package

3. Create `packages/` directory
4. Move `resumesession/` → `packages/session-recovery/`
5. Move `skills-package/` → `packages/skills/`
6. Move `cross-cli-session-recovery/` → `packages/history/`
7. **DO NOT** remove `package/` directory yet - use it for feature consolidation
8. Clean up root directory

### Phase 2: Package Configuration Updates
1. Update package names:
   - `resumesession` → `@stigmergy/session-recovery`
   - `stigmergy-skill` → `@stigmergy/skills`
   - `cross-cli-session-recovery` → `@stigmergy/history`

2. Update dependencies:
   - Core `stigmergy-cli` depends on `@stigmergy/session-recovery`
   - `@stigmergy/skills` has peer dependency on `stigmergy-cli`
   - `@stigmergy/history` is standalone but integrates with core

3. Update import paths:
   - Adjust all internal imports
   - Update CLI integration scripts
   - Fix adapter configurations

### Phase 3: Build System Integration
1. Set up monorepo structure with Lerna or Rush
2. Configure inter-package dependencies
3. Set up unified testing across packages
4. Configure publish pipeline for each package

### Phase 4: Documentation and Cleanup
1. Update all README files
2. Create main repository README with package overview
3. Update API documentation
4. Clean up duplicate files and configurations

## Benefits of This Structure

1. **Clear Separation**: Each package has a single responsibility
2. **Independent Versioning**: Packages can be versioned and published independently
3. **Reduced Complexity**: Easier to understand and maintain
4. **Better Testing**: Isolated testing per package
5. **Flexible Installation**: Users can install only needed packages
6. **Cleaner Dependencies**: Clear dependency relationships

## Implementation Timeline

- **Week 1**: Directory restructuring and package moves
- **Week 2**: Package configuration updates
- **Week 3**: Build system integration
- **Week 4**: Documentation, testing, and cleanup

## Risk Mitigation

1. **Backup**: Create full backup before any changes
2. **Gradual Migration**: Move one package at a time
3. **Testing**: Comprehensive testing at each phase
4. **Rollback Plan**: Keep rollback procedures documented