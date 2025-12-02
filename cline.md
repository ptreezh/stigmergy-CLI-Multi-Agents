# Cline CLI Integration Guide

## 🎯 Overview

Cline CLI is a powerful AI coding assistant that supports the Model Context Protocol (MCP), enabling seamless integration with the Stigmergy CLI Multi-Agents system. This integration provides advanced tool management, cross-CLI collaboration, and dynamic capability extension.

## 🔧 Architecture & Features

### Core Capabilities
- **Model Context Protocol (MCP) Support**: Full MCP server integration for tool management
- **Multi-Agent Orchestration**: Coordinate multiple CLI tools through Cline
- **Task Lifecycle Management**: Handle complex, multi-step development tasks
- **Terminal Command Execution**: Execute system commands with human-in-the-loop approval
- **Dynamic Tool Creation**: Create custom MCP tools through natural language
- **Cross-CLI Collaboration**: Delegate tasks to and from other CLI tools

### Technical Specifications
```json
{
  "name": "cline",
  "architecture_type": "nodejs_npm",
  "mcp_protocol_version": "2024-11-05",
  "transport_mechanisms": ["stdio", "http"],
  "capabilities": {
    "file_operations": true,
    "terminal_execution": true,
    "browser_automation": true,
    "tool_creation": true,
    "context_management": true,
    "multi_step_tasks": true,
    "human_in_the_loop": true
  }
}
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm 7+
- Python 3.8+ (for MCP server)

### Quick Installation
```bash
# Install Cline CLI globally
npm install -g cline

# Run the Stigmergy integration installer
python src/adapters/cline/install_cline_integration.py
```

### Manual Installation
```bash
# 1. Install Cline CLI
npm install -g cline

# 2. Configure MCP settings
mkdir -p ~/.config/cline
cp src/adapters/cline/config.json ~/.config/cline/

# 3. Setup MCP server
python -m src.adapters.cline.mcp_server
```

## 🔌 MCP Integration

### MCP Server Configuration
Cline integrates with the Stigmergy system through a custom MCP server that provides:

- **File Operations**: Search, read, and analyze project files
- **Project Structure Analysis**: Understand codebase organization
- **Cross-CLI Collaboration**: Delegate tasks to other CLI tools
- **Dynamic Tool Creation**: Create custom tools via natural language

### MCP Tools Available

#### 1. `search_files`
Search for files in the project directory using glob patterns.
```json
{
  "name": "search_files",
  "description": "Search for files in the project directory",
  "inputSchema": {
    "pattern": "*.py",
    "directory": "src/"
  }
}
```

#### 2. `read_project_file`
Read content of a project file with optional line limits.
```json
{
  "name": "read_project_file", 
  "description": "Read content of a project file",
  "inputSchema": {
    "path": "src/main.py",
    "max_lines": 50
  }
}
```

#### 3. `get_project_structure`
Get the project directory structure up to a specified depth.
```json
{
  "name": "get_project_structure",
  "description": "Get project directory structure",
  "inputSchema": {
    "max_depth": 3
  }
}
```

#### 4. `analyze_codebase`
Analyze the codebase for dependencies, structure, complexity, or patterns.
```json
{
  "name": "analyze_codebase",
  "description": "Analyze codebase patterns and structure",
  "inputSchema": {
    "analysis_type": "dependencies"
  }
}
```

#### 5. `collaborate_with_cli`
Collaborate with other CLI tools in the Stigmergy system.
```json
{
  "name": "collaborate_with_cli",
  "description": "Collaborate with other CLI tools",
  "inputSchema": {
    "target_cli": "claude",
    "task": "Analyze this code for security issues",
    "context": {"project_root": "/path/to/project"}
  }
}
```

#### 6. `create_tool`
Dynamically create new MCP tools through natural language descriptions.
```json
{
  "name": "create_tool",
  "description": "Create a new MCP tool dynamically",
  "inputSchema": {
    "tool_name": "todo_analyzer",
    "description": "Analyze code for TODO comments and generate reports",
    "function_code": "def analyze_todos(file_path): ..."
  }
}
```

## 🔄 Cross-CLI Collaboration

### Supported Collaboration Patterns

#### 1. Claude → Cline (Task Delegation)
Delegate complex execution tasks from Claude to Cline.
```
User: "请用cline执行这个复杂的构建任务"
System: Claude → Cline (任务委托)
Result: Cline executes the build process with terminal commands
```

#### 2. Cline → Claude (Analysis Feedback)
Send execution results from Cline back to Claude for analysis.
```
User: "claude帮我分析Cline的执行结果"
System: Cline → Claude (分析反馈)
Result: Claude analyzes the execution output and provides insights
```

#### 3. Multi-CLI → Cline (Orchestration)
Use Cline to orchestrate multiple CLI tools in complex workflows.
```
User: "协调多个CLI工具完成这个项目"
System: Multi-CLI → Cline (任务编排)
Result: Cline manages the workflow across multiple CLI tools
```

### Intent Detection Patterns

#### Chinese Patterns
- `请用cline\s*帮我?([^。！？\n]*)`
- `调用cline\s*来([^。！？\n]*)`
- `用cline\s*帮我?([^。！？\n]*)`

#### English Patterns
- `use\s+cline\s+to\s+([^.\n!?]*)`
- `call\s+cline\s+to\s+([^.\n!?]*)`
- `ask\s+cline\s+for\s+([^.\n!?]*)`

## 💻 Usage Examples

### Basic Task Execution
```bash
# Execute a simple task
cline task "Analyze the project structure"

# Execute with specific context
cline task "Search for all Python files containing TODO comments"
```

### MCP Tool Usage
```bash
# List available MCP tools
cline mcp list-tools

# Use a specific MCP tool
cline mcp call-tool search_files --args '{"pattern": "*.py", "directory": "src"}'

# Create a new MCP tool
cline mcp create-tool --name "security_scanner" --description "Scan code for security vulnerabilities"
```

### Cross-CLI Collaboration
```bash
# From other CLI tools
use cline to execute terminal commands
call cline to manage the build process
ask cline for workflow orchestration
```

### Complex Workflow Example
```bash
# Multi-step development workflow
cline orchestrate --workflow "{
  'steps': [
    {'tool': 'claude', 'task': 'Review code structure'},
    {'tool': 'cline', 'task': 'Execute build and tests'},
    {'tool': 'gemini', 'task': 'Generate documentation'}
  ]
}"
```

## 🔧 Configuration

### MCP Settings File
Location: `~/.config/cline/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "stigmergy": {
      "command": "python",
      "args": ["-m", "src.adapters.cline.mcp_server"],
      "env": {
        "STIGMERGY_PROJECT_ROOT": "/path/to/project",
        "STIGMERGY_COLLABORATION_MODE": "enabled"
      },
      "disabled": false,
      "autoStart": true
    }
  },
  "globalSettings": {
    "timeout": 60,
    "maxRetries": 3,
    "transport": "stdio"
  }
}
```

### Environment Variables
```bash
export STIGMERGY_PROJECT_ROOT="/path/to/your/project"
export STIGMERGY_COLLABORATION_MODE="enabled"
export PYTHONPATH="/path/to/stigmergy/project"
```

## 🛠️ Development & Extension

### Creating Custom MCP Tools
```python
# src/adapters/cline/custom_tools.py
async def my_custom_tool(arguments: Dict[str, Any]) -> Any:
    """Custom tool implementation"""
    # Your tool logic here
    return {"result": "success", "data": processed_data}

# Register in MCP server
self.tools["my_custom_tool"] = MCPToolDefinition(
    name="my_custom_tool",
    description="My custom tool description",
    inputSchema={"type": "object", "properties": {...}}
)
```

### Extending Collaboration Patterns
```python
# Add new collaboration patterns in cross_cli_mapping.py
patterns['new_pattern'] = CollaborationPattern(
    pattern_id='new_pattern',
    source_cli='source',
    target_cli='cline',
    collaboration_type=CollaborationType.TASK_DELEGATION,
    trigger_phrases=['trigger phrase 1', 'trigger phrase 2'],
    command_template='cline command --args "{args}"',
    parameter_mappings=[...],
    output_format='result_format',
    use_cases=['use case 1', 'use case 2'],
    best_practices=['best practice 1', 'best practice 2']
)
```

## 🔍 Troubleshooting

### Common Issues

#### 1. MCP Server Not Starting
```bash
# Check Python path
python -m src.adapters.cline.mcp_server --help

# Verify environment variables
echo $STIGMERGY_PROJECT_ROOT
echo $PYTHONPATH
```

#### 2. Cline CLI Not Found
```bash
# Check global installation
npm list -g cline

# Use npx fallback
npx -y cline --version
```

#### 3. Cross-CLI Communication Issues
```bash
# Check hook events
cat ~/.stigmergy_cli_hooks/hook_events.json

# Verify CLI availability
python -c "from src.core.cross_cli_executor import CrossCLIExecutor; print(CrossCLIExecutor().check_cli_availability('cline'))"
```

### Debug Mode
```bash
# Enable debug logging
export STIGMERGY_DEBUG="enabled"
python src/adapters/cline/mcp_server.py --debug
```

## 📊 Performance & Monitoring

### Execution Metrics
- **Response Time**: < 2s for MCP operations
- **Success Rate**: > 95% for cross-CLI calls
- **Memory Usage**: < 500MB for MCP server
- **Concurrent Operations**: Up to 5 simultaneous tool calls

### Monitoring Commands
```bash
# Check MCP server status
cline mcp status

# View collaboration logs
tail -f ~/.stigmergy_cli_hooks/hook_events.json

# Monitor cross-CLI performance
python src/adapters/cline/performance_monitor.py
```

## 🔗 Integration Points

### With Existing CLI Tools
- **Claude**: Task delegation and analysis feedback
- **Gemini**: Multi-language support and optimization
- **Copilot**: GitHub integration and workflow automation
- **QwenCode**: Chinese language support and localization
- **CodeBuddy**: Tencent ecosystem integration
- **iFlow**: Advanced workflow orchestration

### With External Systems
- **Git Repositories**: Version control integration
- **CI/CD Pipelines**: Automated testing and deployment
- **Package Managers**: npm, pip, cargo support
- **Cloud Services**: AWS, Azure, GCP integration via MCP tools

## 📚 Advanced Features

### Dynamic Tool Discovery
```bash
# Auto-discover available tools
cline mcp discover-tools

# Refresh tool cache
cline mcp refresh-tools
```

### Context Preservation
```bash
# Save current context
cline context save --name "project_setup"

# Load saved context
cline context load --name "project_setup"

# List available contexts
cline context list
```

### Batch Operations
```bash
# Execute multiple tasks
cline batch --tasks task1.json task2.json task3.json

# Process task queue
cline queue --process --parallel 3
```

## 🎉 Best Practices

### 1. Task Design
- Break complex tasks into smaller, manageable steps
- Provide clear context and requirements
- Use appropriate collaboration patterns
- Monitor execution progress

### 2. MCP Tool Usage
- Leverage existing tools before creating new ones
- Provide comprehensive tool descriptions
- Test tools in isolation before integration
- Document tool usage and limitations

### 3. Cross-CLI Collaboration
- Choose appropriate source and target CLIs
- Use intent detection patterns effectively
- Handle fallback scenarios gracefully
- Monitor collaboration success rates

### 4. Error Handling
- Implement comprehensive error handling
- Provide meaningful error messages
- Log errors for debugging and improvement
- Implement retry mechanisms for transient failures

## 📞 Support & Resources

### Documentation
- [Cline CLI Official Documentation](https://docs.cline.bot/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Stigmergy System Architecture](../README.md)

### Community
- GitHub Issues: [Report bugs and feature requests](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)
- Discussions: [Community forum and Q&A](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)

### Development
- Source Code: `src/adapters/cline/`
- Tests: `tests/test_cline_integration.py`
- Examples: `examples/cline_usage/`

---

*This integration is part of the Stigmergy CLI Multi-Agents System, enabling seamless collaboration between different AI coding assistants through the Model Context Protocol.*