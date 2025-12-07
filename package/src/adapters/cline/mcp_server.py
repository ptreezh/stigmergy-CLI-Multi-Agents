"""
Stigmergy MCP Server for Cline Integration

This module implements a Model Context Protocol (MCP) server that provides
tools and resources for the Stigmergy CLI Multi-Agents system integration
with Cline CLI.

Key Features:
- Tool exposure for cross-CLI operations
- Resource management for project context
- Bidirectional communication with Cline
- Dynamic tool creation and management
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class MCPToolDefinition:
    """MCP Tool definition"""
    name: str
    description: str
    inputSchema: Dict[str, Any]


@dataclass
class MCPResourceDefinition:
    """MCP Resource definition"""
    uri: str
    name: str
    description: str
    mimeType: Optional[str] = None


class StigmergyMCPServer:
    """MCP Server implementation for Stigmergy-Cline integration"""
    
    def __init__(self):
        self.tools: Dict[str, MCPToolDefinition] = {}
        self.resources: Dict[str, MCPResourceDefinition] = {}
        self.project_root = os.environ.get("STIGMERGY_PROJECT_ROOT", os.getcwd())
        self.collaboration_mode = os.environ.get("STIGMERGY_COLLABORATION_MODE", "enabled")
        self._setup_default_tools()
        self._setup_default_resources()
    
    def _setup_default_tools(self):
        """Setup default MCP tools"""
        default_tools = [
            MCPToolDefinition(
                name="search_files",
                description="Search for files in the project directory",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "File pattern to search for (glob format)"
                        },
                        "directory": {
                            "type": "string",
                            "description": "Directory to search in (optional)"
                        }
                    },
                    "required": ["pattern"]
                }
            ),
            MCPToolDefinition(
                name="read_project_file",
                description="Read content of a project file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative path to the file"
                        },
                        "max_lines": {
                            "type": "integer",
                            "description": "Maximum number of lines to read",
                            "default": 100
                        }
                    },
                    "required": ["path"]
                }
            ),
            MCPToolDefinition(
                name="get_project_structure",
                description="Get the project directory structure",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "max_depth": {
                            "type": "integer",
                            "description": "Maximum directory depth to explore",
                            "default": 3
                        }
                    }
                }
            ),
            MCPToolDefinition(
                name="analyze_codebase",
                description="Analyze the codebase for patterns and structure",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "analysis_type": {
                            "type": "string",
                            "enum": ["dependencies", "structure", "complexity", "patterns"],
                            "description": "Type of analysis to perform"
                        }
                    },
                    "required": ["analysis_type"]
                }
            ),
            MCPToolDefinition(
                name="collaborate_with_cli",
                description="Collaborate with other CLI tools in the system",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "target_cli": {
                            "type": "string",
                            "description": "Target CLI tool to collaborate with"
                        },
                        "task": {
                            "type": "string",
                            "description": "Task to delegate to the target CLI"
                        },
                        "context": {
                            "type": "object",
                            "description": "Context information for the task"
                        }
                    },
                    "required": ["target_cli", "task"]
                }
            ),
            MCPToolDefinition(
                name="create_tool",
                description="Create a new MCP tool dynamically",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "tool_name": {
                            "type": "string",
                            "description": "Name of the new tool"
                        },
                        "description": {
                            "type": "string",
                            "description": "Description of what the tool does"
                        },
                        "function_code": {
                            "type": "string",
                            "description": "Python code implementing the tool function"
                        }
                    },
                    "required": ["tool_name", "description", "function_code"]
                }
            )
        ]
        
        for tool in default_tools:
            self.tools[tool.name] = tool
    
    def _setup_default_resources(self):
        """Setup default MCP resources"""
        default_resources = [
            MCPResourceDefinition(
                uri="file://project_spec.json",
                name="Project Specification",
                description="Current project specification and configuration",
                mimeType="application/json"
            ),
            MCPResourceDefinition(
                uri="file://collaboration_log.md",
                name="Collaboration Log",
                description="Log of cross-CLI collaboration activities",
                mimeType="text/markdown"
            ),
            MCPResourceDefinition(
                uri="file://tasks.md",
                name="Task Management",
                description="Current tasks and their status",
                mimeType="text/markdown"
            ),
            MCPResourceDefinition(
                uri="file://global_memory.json",
                name="Global Memory",
                description="Shared memory and learned patterns across CLI tools",
                mimeType="application/json"
            )
        ]
        
        for resource in default_resources:
            self.resources[resource.uri] = resource
    
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP request"""
        method = request.get("method", "")
        params = request.get("params", {})
        request_id = request.get("id")
        
        logger.info(f"Handling MCP request: {method}")
        
        try:
            if method == "tools/list":
                return await self._handle_tools_list(request_id)
            elif method == "tools/call":
                return await self._handle_tools_call(params, request_id)
            elif method == "resources/list":
                return await self._handle_resources_list(request_id)
            elif method == "resources/read":
                return await self._handle_resources_read(params, request_id)
            elif method == "initialize":
                return await self._handle_initialize(params, request_id)
            else:
                return self._create_error_response(request_id, -32601, f"Method {method} not found")
        except Exception as e:
            logger.error(f"Error handling request {method}: {e}")
            return self._create_error_response(request_id, -32603, str(e))
    
    async def _handle_tools_list(self, request_id: Any) -> Dict[str, Any]:
        """Handle tools/list request"""
        tools_data = [asdict(tool) for tool in self.tools.values()]
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"tools": tools_data}
        }
    
    async def _handle_tools_call(self, params: Dict[str, Any], request_id: Any) -> Dict[str, Any]:
        """Handle tools/call request"""
        tool_name = params.get("name")
        tool_arguments = params.get("arguments", {})
        
        if not tool_name:
            return self._create_error_response(request_id, -32602, "Missing tool name")
        
        if tool_name not in self.tools:
            return self._create_error_response(request_id, -32602, f"Tool {tool_name} not found")
        
        try:
            result = await self._execute_tool(tool_name, tool_arguments)
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": result
            }
        except Exception as e:
            logger.error(f"Tool execution error: {e}")
            return self._create_error_response(request_id, -32603, f"Tool execution failed: {str(e)}")
    
    async def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Execute the specified tool"""
        if tool_name == "search_files":
            return await self._tool_search_files(arguments)
        elif tool_name == "read_project_file":
            return await self._tool_read_project_file(arguments)
        elif tool_name == "get_project_structure":
            return await self._tool_get_project_structure(arguments)
        elif tool_name == "analyze_codebase":
            return await self._tool_analyze_codebase(arguments)
        elif tool_name == "collaborate_with_cli":
            return await self._tool_collaborate_with_cli(arguments)
        elif tool_name == "create_tool":
            return await self._tool_create_tool(arguments)
        else:
            raise ValueError(f"Unknown tool: {tool_name}")
    
    async def _tool_search_files(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Search for files in the project"""
        pattern = arguments.get("pattern", "*")
        directory = arguments.get("directory", self.project_root)
        
        if not os.path.isabs(directory):
            directory = os.path.join(self.project_root, directory)
        
        try:
            import glob
            search_path = os.path.join(directory, pattern)
            files = glob.glob(search_path, recursive=True)
            
            # Filter out common ignore patterns
            filtered_files = []
            for file_path in files:
                rel_path = os.path.relpath(file_path, self.project_root)
                if not any(part.startswith('.') for part in rel_path.split(os.sep)):
                    if not any(part in ['node_modules', '__pycache__', '.git'] for part in rel_path.split(os.sep)):
                        filtered_files.append(rel_path)
            
            return {
                "files": filtered_files,
                "count": len(filtered_files),
                "pattern": pattern,
                "directory": directory
            }
        except Exception as e:
            logger.error(f"File search error: {e}")
            return {"error": str(e), "files": [], "count": 0}
    
    async def _tool_read_project_file(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Read content of a project file"""
        file_path = arguments.get("path")
        max_lines = arguments.get("max_lines", 100)
        
        if not file_path:
            return {"error": "File path is required"}
        
        # Ensure path is within project root
        full_path = os.path.join(self.project_root, file_path)
        if not os.path.abspath(full_path).startswith(os.path.abspath(self.project_root)):
            return {"error": "Path outside project root is not allowed"}
        
        if not os.path.exists(full_path):
            return {"error": f"File not found: {file_path}"}
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                content = ''.join(lines[:max_lines])
                
            return {
                "path": file_path,
                "content": content,
                "total_lines": len(lines),
                "read_lines": min(max_lines, len(lines)),
                "truncated": len(lines) > max_lines
            }
        except Exception as e:
            logger.error(f"File read error: {e}")
            return {"error": str(e)}
    
    async def _tool_get_project_structure(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Get project directory structure"""
        max_depth = arguments.get("max_depth", 3)
        
        def build_tree(path: str, current_depth: int = 0) -> Dict[str, Any]:
            if current_depth >= max_depth:
                return {"name": os.path.basename(path), "type": "directory", "children": []}
            
            try:
                items = []
                for item in sorted(os.listdir(path)):
                    if item.startswith('.'):
                        continue
                    
                    item_path = os.path.join(path, item)
                    if os.path.isdir(item_path):
                        items.append(build_tree(item_path, current_depth + 1))
                    else:
                        items.append({
                            "name": item,
                            "type": "file",
                            "size": os.path.getsize(item_path)
                        })
                
                return {
                    "name": os.path.basename(path) or path,
                    "type": "directory",
                    "children": items
                }
            except PermissionError:
                return {"name": os.path.basename(path), "type": "directory", "error": "Permission denied"}
        
        try:
            structure = build_tree(self.project_root)
            return {"structure": structure, "root": self.project_root}
        except Exception as e:
            logger.error(f"Project structure error: {e}")
            return {"error": str(e)}
    
    async def _tool_analyze_codebase(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze codebase for patterns and structure"""
        analysis_type = arguments.get("analysis_type", "structure")
        
        try:
            if analysis_type == "dependencies":
                return await self._analyze_dependencies()
            elif analysis_type == "structure":
                return await self._analyze_structure()
            elif analysis_type == "complexity":
                return await self._analyze_complexity()
            elif analysis_type == "patterns":
                return await self._analyze_patterns()
            else:
                return {"error": f"Unknown analysis type: {analysis_type}"}
        except Exception as e:
            logger.error(f"Codebase analysis error: {e}")
            return {"error": str(e)}
    
    async def _analyze_dependencies(self) -> Dict[str, Any]:
        """Analyze project dependencies"""
        dependencies = {}
        
        # Check for package.json
        package_json = os.path.join(self.project_root, "package.json")
        if os.path.exists(package_json):
            try:
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    dependencies["npm"] = {
                        "dependencies": data.get("dependencies", {}),
                        "devDependencies": data.get("devDependencies", {})
                    }
            except Exception as e:
                dependencies["npm_error"] = str(e)
        
        # Check for requirements.txt
        requirements_txt = os.path.join(self.project_root, "requirements.txt")
        if os.path.exists(requirements_txt):
            try:
                with open(requirements_txt, 'r') as f:
                    deps = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                    dependencies["python"] = deps
            except Exception as e:
                dependencies["python_error"] = str(e)
        
        return {"analysis_type": "dependencies", "results": dependencies}
    
    async def _analyze_structure(self) -> Dict[str, Any]:
        """Analyze project structure"""
        structure_info = {
            "total_files": 0,
            "total_directories": 0,
            "file_types": {},
            "languages": {}
        }
        
        for root, dirs, files in os.walk(self.project_root):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            structure_info["total_directories"] += len(dirs)
            structure_info["total_files"] += len(files)
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext:
                    structure_info["file_types"][ext] = structure_info["file_types"].get(ext, 0) + 1
                
                # Simple language detection
                if ext in ['.py']:
                    structure_info["languages"]["python"] = structure_info["languages"].get("python", 0) + 1
                elif ext in ['.js', '.ts']:
                    structure_info["languages"]["javascript"] = structure_info["languages"].get("javascript", 0) + 1
                elif ext in ['.md']:
                    structure_info["languages"]["markdown"] = structure_info["languages"].get("markdown", 0) + 1
        
        return {"analysis_type": "structure", "results": structure_info}
    
    async def _analyze_complexity(self) -> Dict[str, Any]:
        """Analyze code complexity (simplified)"""
        complexity_info = {
            "total_lines": 0,
            "file_complexity": {}
        }
        
        # Simple line counting
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.endswith(('.py', '.js', '.ts')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            lines = len(f.readlines())
                            complexity_info["total_lines"] += lines
                            rel_path = os.path.relpath(file_path, self.project_root)
                            complexity_info["file_complexity"][rel_path] = lines
                    except Exception:
                        continue
        
        return {"analysis_type": "complexity", "results": complexity_info}
    
    async def _analyze_patterns(self) -> Dict[str, Any]:
        """Analyze code patterns (simplified)"""
        patterns = {
            "imports": {},
            "functions": {},
            "classes": {}
        }
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                        # Simple pattern detection
                        import_lines = [line.strip() for line in content.split('\\n') if line.strip().startswith('import ') or line.strip().startswith('from ')]
                        if import_lines:
                            rel_path = os.path.relpath(file_path, self.project_root)
                            patterns["imports"][rel_path] = import_lines[:10]  # Limit to first 10
                    except Exception:
                        continue
        
        return {"analysis_type": "patterns", "results": patterns}
    
    async def _tool_collaborate_with_cli(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Collaborate with other CLI tools"""
        target_cli = arguments.get("target_cli")
        task = arguments.get("task")
        context = arguments.get("context", {})
        
        if not target_cli or not task:
            return {"error": "target_cli and task are required"}
        
        try:
            # This would integrate with the broader Stigmergy system
            # For now, return a mock response
            return {
                "target_cli": target_cli,
                "task": task,
                "result": f"Collaboration request sent to {target_cli}",
                "status": "pending"
            }
        except Exception as e:
            logger.error(f"CLI collaboration error: {e}")
            return {"error": str(e)}
    
    async def _tool_create_tool(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new tool dynamically"""
        tool_name = arguments.get("tool_name")
        description = arguments.get("description")
        function_code = arguments.get("function_code")
        
        if not all([tool_name, description, function_code]):
            return {"error": "tool_name, description, and function_code are required"}
        
        try:
            # Create new tool definition
            new_tool = MCPToolDefinition(
                name=tool_name,
                description=description,
                inputSchema={
                    "type": "object",
                    "properties": {
                        "input": {"type": "string", "description": "Input parameter"}
                    },
                    "required": ["input"]
                }
            )
            
            # Add to tools
            self.tools[tool_name] = new_tool
            
            # Store function code for execution (in a real implementation)
            # This would require a more sophisticated execution environment
            
            return {
                "tool_name": tool_name,
                "description": description,
                "status": "created",
                "message": f"Tool '{tool_name}' created successfully"
            }
        except Exception as e:
            logger.error(f"Tool creation error: {e}")
            return {"error": str(e)}
    
    async def _handle_resources_list(self, request_id: Any) -> Dict[str, Any]:
        """Handle resources/list request"""
        resources_data = [asdict(resource) for resource in self.resources.values()]
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"resources": resources_data}
        }
    
    async def _handle_resources_read(self, params: Dict[str, Any], request_id: Any) -> Dict[str, Any]:
        """Handle resources/read request"""
        uri = params.get("uri")
        
        if not uri:
            return self._create_error_response(request_id, -32602, "Missing resource URI")
        
        if uri not in self.resources:
            return self._create_error_response(request_id, -32602, f"Resource {uri} not found")
        
        try:
            content = await self._read_resource(uri)
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {"content": content}
            }
        except Exception as e:
            logger.error(f"Resource read error: {e}")
            return self._create_error_response(request_id, -32603, f"Failed to read resource: {str(e)}")
    
    async def _read_resource(self, uri: str) -> str:
        """Read resource content"""
        if uri == "file://project_spec.json":
            spec_path = os.path.join(self.project_root, "PROJECT_SPEC.json")
            if os.path.exists(spec_path):
                with open(spec_path, 'r') as f:
                    return f.read()
            return "{}"
        
        elif uri == "file://collaboration_log.md":
            log_path = os.path.join(self.project_root, "COLLABORATION_LOG.md")
            if os.path.exists(log_path):
                with open(log_path, 'r') as f:
                    return f.read()
            return "# Collaboration Log\\n\\nNo collaboration activities yet."
        
        elif uri == "file://tasks.md":
            tasks_path = os.path.join(self.project_root, "TASKS.md")
            if os.path.exists(tasks_path):
                with open(tasks_path, 'r') as f:
                    return f.read()
            return "# Tasks\\n\\nNo tasks defined yet."
        
        elif uri == "file://global_memory.json":
            memory_path = os.path.join(self.project_root, "global_cli_memory.json")
            if os.path.exists(memory_path):
                with open(memory_path, 'r') as f:
                    return f.read()
            return "{}"
        
        else:
            raise ValueError(f"Unknown resource URI: {uri}")
    
    async def _handle_initialize(self, params: Dict[str, Any], request_id: Any) -> Dict[str, Any]:
        """Handle initialize request"""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": False},
                    "resources": {"listChanged": False, "subscribe": False}
                },
                "serverInfo": {
                    "name": "stigmergy-mcp-server",
                    "version": "1.0.0"
                }
            }
        }
    
    def _create_error_response(self, request_id: Any, code: int, message: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {
                "code": code,
                "message": message
            }
        }


async def main():
    """Main entry point for the MCP server"""
    logger.info("Starting Stigmergy MCP Server")
    
    server = StigmergyMCPServer()
    
    # Read from stdin and write to stdout for stdio transport
    try:
        while True:
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
            
            try:
                request = json.loads(line.strip())
                response = await server.handle_request(request)
                response_json = json.dumps(response) + "\\n"
                sys.stdout.write(response_json)
                sys.stdout.flush()
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
                error_response = {
                    "jsonrpc": "2.0",
                    "error": {"code": -32700, "message": "Parse error"}
                }
                sys.stdout.write(json.dumps(error_response) + "\\n")
                sys.stdout.flush()
            except Exception as e:
                logger.error(f"Error processing request: {e}")
                error_response = {
                    "jsonrpc": "2.0",
                    "error": {"code": -32603, "message": "Internal error"}
                }
                sys.stdout.write(json.dumps(error_response) + "\\n")
                sys.stdout.flush()
    
    except KeyboardInterrupt:
        logger.info("MCP server interrupted")
    except Exception as e:
        logger.error(f"MCP server error: {e}")
    finally:
        logger.info("MCP server shutting down")


if __name__ == "__main__":
    asyncio.run(main())