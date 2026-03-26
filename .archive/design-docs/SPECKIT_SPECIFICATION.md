# Speckit Specification: Stigmergy CLI Multi-Agents System

## 1. Overview

### 1.1 Purpose
This specification defines the architecture, implementation plan, and testing strategy for enhancing the Stigmergy CLI Multi-Agents system with dual Python/Node.js coordination layers and graceful degradation capabilities.

### 1.2 Scope
- Maintain existing Python-based coordination layer
- Implement Node.js-based coordination layer as fallback
- Implement Python availability detection
- Ensure feature parity between implementations
- Provide seamless user experience regardless of underlying implementation

### 1.3 Goals
1. Eliminate mandatory system Python dependency
2. Maintain backward compatibility
3. Enable graceful degradation when Python is unavailable
4. Provide identical functionality in both implementations
5. Support progressive migration from Python to Node.js

## 2. System Architecture

### 2.1 Current Architecture
```
User Terminal
├── Node.js Main CLI Interface
├── Python Coordination Layer (Cross-CLI Communication)
└── Individual CLI Tools
    ├── Claude CLI (Embedded Python)
    ├── Gemini CLI (Embedded Python)
    └── Other CLI Tools (Embedded Python)
```

### 2.2 Target Architecture
```
User Terminal
├── Node.js Main CLI Interface
├── Dual Coordination Layer
│   ├── Primary: Node.js Implementation
│   └── Fallback: Python Implementation (when available)
└── Individual CLI Tools
    ├── Claude CLI (Embedded Python)
    ├── Gemini CLI (Embedded Python)
    └── Other CLI Tools (Embedded Python)
```

### 2.3 Component Responsibilities

#### 2.3.1 Node.js Main CLI Interface
- User interaction and command parsing
- Python availability detection
- Coordination layer selection
- Result presentation to user

#### 2.3.2 Node.js Coordination Layer (Primary)
- Cross-CLI communication
- Adapter management
- State coordination
- Error handling

#### 2.3.3 Python Coordination Layer (Fallback)
- Cross-CLI communication (existing implementation)
- Adapter management (existing implementation)
- State coordination (existing implementation)
- Error handling (existing implementation)

## 3. Implementation Requirements

### 3.1 Python Detection
- Detect Python availability at startup
- Gracefully handle Python absence
- Log detection results for debugging

### 3.2 Coordination Layer Interface
Both implementations must expose identical interfaces:
```
interface CoordinationLayer {
  initialize(): Promise<boolean>;
  executeCrossCLITask(sourceCLI: string, targetCLI: string, task: string): Promise<string>;
  getAdapterStatistics(cliName: string): Promise<object>;
  getSystemStatus(): Promise<object>;
  healthCheck(): Promise<boolean>;
}
```

### 3.3 Feature Parity Requirements
- Identical cross-CLI calling capabilities
- Consistent adapter statistics
- Equivalent error handling
- Same configuration management
- Compatible logging formats

## 4. Deployment and Maintenance

### 4.1 Installation Process
- Install Node.js components by default
- Optionally install Python components if Python available
- Provide clear installation status reporting

### 4.2 Update Strategy
- Update Node.js components independently
- Maintain Python components for backward compatibility
- Provide migration paths for existing installations

## 5. Testing Strategy

### 5.1 Test Environments
- Python-available environment
- Python-unavailable environment
- Mixed CLI tool environments

### 5.2 Test Coverage
- Coordination layer selection logic
- Feature parity between implementations
- Graceful degradation scenarios
- Error handling in both implementations
- Performance comparison

## 6. Success Criteria

### 6.1 Functional Requirements
- System operates without system Python dependency
- All existing functionality preserved
- Seamless user experience regardless of implementation
- Clear error messages when functionality limited

### 6.2 Non-Functional Requirements
- Startup time < 2 seconds in typical environments
- Memory usage < 100MB during normal operation
- Response time < 500ms for coordination layer selection
- Comprehensive logging for troubleshooting