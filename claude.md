# Claude CLI Project Memory Document

## Project Overview
- **Project Name**: stigmergy-CLI-Multi-Agents
- **Project Type**: Node.js Project
- **Main Tech Stack**: Node.js, JavaScript, TypeScript
- **Created Date**: 2025-12-07T15:19:21.994Z
- **Last Updated**: 2025-12-07T15:19:21.994Z

## Claude CLI Usage Guide

### 1. Common Command Patterns
```bash
# Code analysis
claude "Analyze the functionality and potential issues of this file" {{FILE_PATH}}

# Code generation
claude "Generate code for {{FEATURE_NAME}} functionality"

# Code review
claude "Review the security of this PR" {{PR_URL}}

# Documentation generation
claude "Generate complete documentation for this API" {{API_PATH}}
```

### 2. Project Specific Configuration
- **Code Style**: ESLint + Prettier
- **Test Framework**: Jest
- **Build Tool**: npm
- **Deployment Method**: npm publish

### 3. Claude CLI Specific Prompt Templates

#### Code Review Template
```
Please review the following code from a senior architect perspective:
1. Code quality and maintainability
2. Security vulnerabilities
3. Performance optimization suggestions
4. Best practices compliance

Code content:
[CODE_CONTENT]
```

#### Feature Development Template
```
I need to implement a {{FEATURE_DESCRIPTION}} functionality with requirements:
1. Functional requirements: {{REQUIREMENTS}}
2. Technical constraints: {{CONSTRAINTS}}
3. Expected output: {{EXPECTED_OUTPUT}}

Please generate complete implementation code.
```

### 4. Cross-CLI Collaboration
- **Collaborate with Gemini**: Translation and multilingual support
- **Collaborate with Qwen**: Chinese content and localization
- **Collaborate with iFlow**: Workflow automation
- **Collaborate with CodeBuddy**: Code completion and refactoring

### 5. Project Memory
- **Recent changes**: No recent changes recorded
- **Known issues**: No known issues
- **Todo items**: No todo items
- **Team preferences**: Standard development practices

## Example Usage Scenarios

### Scenario 1: New Feature Development
```bash
claude "I need to add two-factor authentication to user management system using TOTP algorithm, please generate complete frontend and backend implementation"
```

### Scenario 2: Performance Optimization
```bash
claude "Analyze performance bottlenecks of this database query and provide optimization solution: [QUERY_CONTENT]"
```

### Scenario 3: Security Review
```bash
claude "Perform security review on this user authentication module, focusing on SQL injection and XSS vulnerabilities"
```

---
*This document is automatically generated and updated by Stigmergy CLI*
*Last update time: 2025/12/7 23:19:21*