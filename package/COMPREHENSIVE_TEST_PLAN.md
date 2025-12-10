# Comprehensive Test Plan for Stigmergy CLI Multi-Agents System

## Project Goals Alignment

The test plan aligns with the core project objectives:
1. **Cross-CLI Direct Calling System** - Users can naturally language call other CLI tools
2. **Indirect Collaboration System** - AI tools collaborate based on project context
3. **Native Integration Compliance** - Each adapter uses CLI-specific native mechanisms
4. **Standalone Architecture** - No complex abstraction layers, each adapter independent
5. **国际化合规要求** - All interactions must be pure English with ANSI encoding

## Test Categories

### 1. Unit Tests

#### 1.1 Adapter Functionality Tests
- **Claude CLI Adapter** (Hook System)
  - Hook registration and execution
  - Cross-CLI call detection and routing
  - User prompt submission handling
  - Tool use pre/post processing
  
- **QwenCodeCLI Adapter** (Class Inheritance)
  - Command processing functionality
  - Request handling capabilities
  - Plugin registration verification
  
- **Gemini CLI Adapter** (Module Configuration)
  - Extension loading and registration
  - Configuration file parsing
  - Module-based preprocessing
  
- **iFlow CLI Adapter** (Workflow Scripts)
  - Workflow pipeline execution
  - Stage processing verification
  - Event handling capabilities
  
- **Qoder CLI Adapter** (Environment Variables)
  - Environment variable setup and monitoring
  - Notification hook processing
  - Cross-CLI communication via env vars
  
- **CodeBuddy CLI Adapter** (Plugin System)
  - Skill hook registration
  - Plugin loading functionality
  - Handle-based processing
  
- **Codex CLI Adapter** (Configuration Injection)
  - Slash command processing
  - MCP server integration
  - Configuration loading

#### 1.2 Core Component Tests
- Adapter registry functionality
- Cross-CLI adapter retrieval
- Statistics collection and reporting
- Error handling and recovery
- Configuration management

### 2. Integration Tests

#### 2.1 Cross-CLI Communication Tests
- Claude → QwenCode direct calling
- Gemini → iFlow workflow integration
- Qoder → CodeBuddy plugin coordination
- Codex → Claude hook mediation
- Multi-hop cross-CLI calls

#### 2.2 Native Integration Verification
- Claude hook system registration
- QwenCode class inheritance validation
- Gemini module configuration loading
- iFlow workflow script execution
- Qoder environment variable hooks
- CodeBuddy plugin system registration
- Codex configuration injection

#### 2.3 Error Handling Tests
- Unavailable CLI tool handling
- Network failure recovery
- Configuration file corruption
- Invalid cross-CLI requests
- Resource exhaustion scenarios

### 3. System Tests

#### 3.1 End-to-End Scenarios
- **Scenario 1**: "请用gemini帮我分析这个文件"
  - Claude detects cross-CLI intent
  - Routes to Gemini adapter
  - Executes file analysis
  - Returns formatted results

- **Scenario 2**: "调用claude审查这段代码"
  - QwenCode detects cross-CLI intent
  - Routes to Claude adapter
  - Executes code review
  - Returns annotated results

- **Scenario 3**: Multi-step workflow
  - iFlow orchestrates sequence
  - Qoder provides environment context
  - CodeBuddy adds skill-based processing
  - Results consolidated and returned

#### 3.2 Performance Tests
- Adapter initialization time
- Cross-CLI call latency
- Memory consumption
- Concurrent request handling
- Resource cleanup efficiency

#### 3.3 Security Tests
- Configuration file access controls
- Environment variable isolation
- Cross-CLI data sanitization
- Input validation
- Privilege escalation prevention

### 4. Regression Tests

#### 4.1 Backward Compatibility
- Legacy command support
- Old configuration format handling
- Previous version adapter compatibility
- Migration path verification

#### 4.2 Bug Regression
- Previously identified issues
- Edge case scenarios
- Platform-specific behaviors
- Race condition scenarios

### 5. Acceptance Tests

#### 5.1 User Experience Tests
- Natural language recognition accuracy
- Response time expectations
- Error message clarity
- Help system completeness
- **国际化合规测试**: 所有交互提示必须纯英文纯ANSI编码

#### 5.2 Documentation Verification
- README accuracy
- Command reference completeness
- Configuration guide correctness
- Troubleshooting guide effectiveness

## Test Execution Strategy

### Automated Testing Framework
- **JavaScript Tests**: Jest for Node.js components
- **Python Tests**: Pytest for adapter components
- **Coverage Target**: 80% statement coverage minimum
- **Continuous Integration**: GitHub Actions pipeline

### Manual Testing Procedures
- **Installation Verification**: Fresh system setup
- **Upgrade Testing**: Version migration scenarios
- **Cross-platform Testing**: Windows, Linux, macOS
- **User Acceptance Testing**: Real-world usage scenarios

## Quality Gates

### Test Coverage Requirements
- **Unit Tests**: 85% coverage minimum
- **Integration Tests**: 80% scenario coverage
- **System Tests**: 90% critical path coverage
- **Acceptance Tests**: 100% requirement coverage

### Performance Benchmarks
- Cross-CLI call latency < 2 seconds
- Adapter initialization < 5 seconds
- Memory footprint < 100MB
- Concurrent requests > 10 simultaneous

### Security Standards
- All inputs sanitized
- No privilege escalation vectors
- Secure configuration handling
- Data privacy compliance

### Internationalization Compliance
- All user-facing messages in pure English
- ANSI encoding enforcement
- No Unicode or UTF-8 specific characters in prompts
- ASCII-only output for cross-platform compatibility

## Test Deliverables

1. **Test Reports**: Detailed execution results
2. **Coverage Reports**: Line-by-line analysis
3. **Performance Metrics**: Timing and resource data
4. **Defect Logs**: Issue tracking and resolution
5. **Compliance Matrix**: Requirement traceability

This comprehensive test plan ensures the Stigmergy CLI system meets all project goals while maintaining the required architectural constraints and native integration approaches.