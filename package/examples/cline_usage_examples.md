# Cline CLI Usage Examples

This document provides comprehensive usage examples for the Cline CLI integration with the Stigmergy system.

## 🚀 Quick Start Examples

### 1. Basic Task Execution
```bash
# Simple task execution
cline task "Analyze the project structure and identify main components"

# Task with specific context
cline task "Review the authentication module for security issues" --context "Django web application"

# Multi-step task
cline task "First run the tests, then build the project, and finally deploy to staging"
```

### 2. MCP Tool Usage
```bash
# List available MCP tools
cline mcp list-tools

# Search for Python files
cline mcp call-tool search_files --args '{"pattern": "*.py", "directory": "src"}'

# Read a specific file
cline mcp call-tool read_project_file --args '{"path": "README.md", "max_lines": 50}'

# Get project structure
cline mcp call-tool get_project_structure --args '{"max_depth": 3}'

# Analyze codebase dependencies
cline mcp call-tool analyze_codebase --args '{"analysis_type": "dependencies"}'
```

### 3. Cross-CLI Collaboration
```bash
# From Claude CLI
claude "请用cline帮我执行构建任务"
claude "use cline to run the test suite"

# From Gemini CLI  
gemini "调用cline来管理这个工作流"
gemini "call cline to orchestrate the deployment process"

# From other CLI tools
codebuddy "让cline帮我创建一个新的工具"
codebuddy "ask cline to create a custom tool for code analysis"
```

## 📋 Advanced Workflow Examples

### Example 1: Code Review Workflow
```bash
# Step 1: Use Claude for initial code review
claude "Review the authentication module for security vulnerabilities"

# Step 2: Use Cline to execute security tests
cline task "Run security tests on the authentication module"

# Step 3: Use Cline to generate security report
cline mcp call-tool analyze_codebase --args '{"analysis_type": "security"}'

# Step 4: Use Gemini to translate findings
gemini "Translate this security report to Chinese for the team"
```

### Example 2: Multi-Language Development
```bash
# Step 1: Use QwenCode for Chinese code generation
qwencode "生成用户管理模块的Python代码"

# Step 2: Use Cline to organize the generated code
cline task "Organize the generated user management code into proper structure"

# Step 3: Use Cline to create tests
cline task "Create comprehensive unit tests for the user management module"

# Step 4: Use Claude for code review
claude "Review the user management module for best practices"
```

### Example 3: Documentation Generation
```bash
# Step 1: Use Cline to analyze project structure
cline mcp call-tool get_project_structure --args '{"max_depth": 4}'

# Step 2: Use Cline to read key files
cline mcp call-tool read_project_file --args '{"path": "src/main.py"}'

# Step 3: Use Claude to generate documentation
claude "Generate comprehensive documentation for this project based on the structure"

# Step 4: Use Gemini to translate documentation
gemini "Translate the project documentation to multiple languages"
```

### Example 4: Testing and Quality Assurance
```bash
# Step 1: Use Cline to search for test files
cline mcp call-tool search_files --args '{"pattern": "*test*.py"}'

# Step 2: Use Cline to analyze test coverage
cline task "Analyze test coverage and identify gaps"

# Step 3: Use Cline to run tests with coverage
cline task "Run all tests with coverage reporting"

# Step 4: Use CodeBuddy for learning recommendations
codebuddy "Based on the test results, what should I learn about testing best practices?"
```

## 🔧 Custom MCP Tool Creation

### Example 1: Create a TODO Analyzer
```bash
# Create a tool that analyzes TODO comments in code
cline mcp create-tool --name "todo_analyzer" \
  --description "Analyze code for TODO comments and generate reports" \
  --function-code '
def analyze_todos(file_path):
    """Analyze Python file for TODO comments"""
    todos = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            if "TODO" in line.upper() or "FIXME" in line.upper():
                todos.append({
                    "line": line_num,
                    "content": line.strip(),
                    "type": "TODO" if "TODO" in line.upper() else "FIXME"
                })
    return {"file": file_path, "todos": todos, "count": len(todos)}
'

# Use the custom tool
cline mcp call-tool todo_analyzer --args '{"file_path": "src/main.py"}'
```

### Example 2: Create a Dependency Analyzer
```bash
# Create a tool that analyzes project dependencies
cline mcp create-tool --name "dependency_analyzer" \
  --description "Analyze project dependencies and suggest updates" \
  --function-code '
def analyze_dependencies(project_path):
    """Analyze project dependencies"""
    import json
    from pathlib import Path
    
    results = {}
    
    # Check package.json
    package_json = Path(project_path) / "package.json"
    if package_json.exists():
        with open(package_json) as f:
            data = json.load(f)
            results["npm"] = {
                "dependencies": list(data.get("dependencies", {}).keys()),
                "devDependencies": list(data.get("devDependencies", {}).keys())
            }
    
    # Check requirements.txt
    requirements = Path(project_path) / "requirements.txt"
    if requirements.exists():
        with open(requirements) as f:
            results["python"] = [line.strip() for line in f if line.strip() and not line.startswith("#")]
    
    return results
'

# Use the custom tool
cline mcp call-tool dependency_analyzer --args '{"project_path": "."}'
```

## 🌐 Web Integration Examples

### Example 1: Browser Automation
```bash
# Use Cline for browser automation
cline task "Open the application in browser and test the login functionality"

# Take screenshots for documentation
cline task "Take screenshots of all main pages for documentation"

# Test responsive design
cline task "Test the application on different screen sizes and devices"
```

### Example 2: API Testing
```bash
# Test API endpoints
cline task "Test all API endpoints and verify responses"

# Generate API documentation
cline task "Generate comprehensive API documentation from the code"

# Create API client examples
cline task "Create example API client code in multiple languages"
```

## 📊 Data Analysis Examples

### Example 1: Code Quality Analysis
```bash
# Analyze code complexity
cline mcp call-tool analyze_codebase --args '{"analysis_type": "complexity"}'

# Find code patterns
cline mcp call-tool analyze_codebase --args '{"analysis_type": "patterns"}'

# Analyze dependencies
cline mcp call-tool analyze_codebase --args '{"analysis_type": "dependencies"}'
```

### Example 2: Performance Analysis
```bash
# Analyze project structure
cline mcp call-tool get_project_structure --args '{"max_depth": 5}'

# Find large files
cline mcp call-tool search_files --args '{"pattern": "*.py"}' | python -c "
import json, sys
data = json.load(sys.stdin)
large_files = [f for f in data['files'] if f.endswith('.py')]
print(f'Found {len(large_files)} Python files')
"
```

## 🤖 Automation Examples

### Example 1: Automated Code Review
```bash
#!/bin/bash
# Automated code review script

echo "🚀 Starting automated code review..."

# Step 1: Get changed files
CHANGED_FILES=$(git diff --name-only HEAD~1)

# Step 2: Analyze each changed file
for file in $CHANGED_FILES; do
    if [[ $file == *.py ]]; then
        echo "Analyzing $file..."
        cline mcp call-tool read_project_file --args "{\"path\": \"$file\", \"max_lines\": 100}"
        claude "Review this Python file for code quality and best practices"
    fi
done

# Step 3: Generate summary report
cline task "Generate a comprehensive code review report based on the analysis"

echo "✅ Automated code review completed!"
```

### Example 2: Continuous Integration
```bash
#!/bin/bash
# CI/CD integration script

echo "🔧 Starting CI/CD pipeline..."

# Step 1: Run tests with Cline
cline task "Run all unit tests and generate coverage report"

# Step 2: Security analysis
cline mcp call-tool analyze_codebase --args '{"analysis_type": "security"}'

# Step 3: Performance analysis
cline task "Run performance benchmarks and compare with previous results"

# Step 4: Documentation generation
claude "Generate updated documentation based on the latest code changes"

# Step 5: Deployment preparation
cline task "Prepare deployment packages and verify deployment scripts"

echo "✅ CI/CD pipeline completed!"
```

## 🎯 Best Practices

### 1. Task Design
- **Be Specific**: Provide clear, detailed task descriptions
- **Break Down Complex Tasks**: Divide large tasks into smaller steps
- **Include Context**: Provide relevant background information
- **Set Expectations**: Specify desired output format and scope

### 2. MCP Tool Usage
- **Leverage Existing Tools**: Use built-in tools before creating custom ones
- **Provide Clear Parameters**: Use well-structured JSON for tool arguments
- **Handle Errors Gracefully**: Implement proper error handling in workflows
- **Document Custom Tools**: Add comprehensive descriptions for custom tools

### 3. Cross-CLI Collaboration
- **Choose Appropriate Tools**: Select the right CLI for each specific task
- **Maintain Context**: Preserve context across CLI boundaries
- **Monitor Performance**: Track execution times and success rates
- **Implement Fallbacks**: Have backup strategies for failed operations

### 4. Security Considerations
- **Validate Inputs**: Sanitize user inputs before processing
- **Limit Permissions**: Use minimal required permissions for operations
- **Audit Actions**: Log all cross-CLI operations for security review
- **Secure Credentials**: Store API keys and sensitive data securely

## 🚨 Common Issues and Solutions

### Issue 1: MCP Server Not Responding
```bash
# Solution: Check server status and restart
cline mcp status
cline mcp restart

# Check logs
tail -f ~/.config/cline/mcp_server.log
```

### Issue 2: Tool Execution Fails
```bash
# Solution: Verify tool parameters
cline mcp call-tool search_files --args '{"pattern": "*.py"}' --validate

# Check tool documentation
cline mcp describe-tool search_files
```

### Issue 3: Cross-CLI Communication Issues
```bash
# Solution: Check collaboration logs
cat ~/.stigmergy_cli_hooks/hook_events.json

# Verify CLI availability
python -c "from src.core.cross_cli_executor import CrossCLIExecutor; print(CrossCLIExecutor().check_cli_availability('cline'))"
```

### Issue 4: Performance Problems
```bash
# Solution: Monitor execution times
cline task "Analyze performance" --profile

# Check resource usage
cline mcp call-tool analyze_codebase --args '{"analysis_type": "performance"}'
```

## 📚 Additional Resources

### Documentation
- [Cline CLI Official Docs](https://docs.cline.bot/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Stigmergy System Guide](../README.md)

### Community
- [GitHub Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)
- [Community Discussions](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)

### Development
- [Source Code](../src/adapters/cline/)
- [Test Suite](../test_cline_integration.py)
- [Configuration](../src/adapters/cline/config.py)

---

*These examples demonstrate the full potential of Cline CLI integration with the Stigmergy system. Experiment with different combinations to find the workflows that work best for your development process.*