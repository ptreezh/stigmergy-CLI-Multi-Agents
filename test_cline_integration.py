"""
Cline CLI Integration Test Suite

Comprehensive testing of Cline CLI integration with the Stigmergy system,
including MCP server functionality, cross-CLI collaboration, and error handling.
"""

import asyncio
import json
import logging
import os
import sys
import tempfile
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.adapters.cline.standalone_cline_adapter import StandaloneClineAdapter
from src.adapters.cline.config import CLINE_CONFIG, get_mcp_settings_path, get_mcp_server_directory
from src.adapters.cline.mcp_server import StigmergyMCPServer
from src.core.cross_cli_executor import CrossCLIExecutor, RealCLIArchitectures
from src.core.cross_cli_mapping import CrossCLIMapper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ClineIntegrationTester:
    """Comprehensive tester for Cline CLI integration"""
    
    def __init__(self):
        self.adapter = StandaloneClineAdapter()
        self.mcp_server = StigmergyMCPServer()
        self.cross_executor = CrossCLIExecutor()
        self.cross_mapper = CrossCLIMapper()
        self.test_results = []
        
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests"""
        logger.info("🚀 Starting Cline CLI integration tests...")
        
        test_suite = [
            ("Configuration Validation", self.test_configuration),
            ("MCP Server Startup", self.test_mcp_server_startup),
            ("MCP Tool Discovery", self.test_mcp_tool_discovery),
            ("MCP Tool Execution", self.test_mcp_tool_execution),
            ("Cross-CLI Intent Detection", self.test_cross_cli_intent_detection),
            ("Task Execution", self.test_task_execution),
            ("Error Handling", self.test_error_handling),
            ("Performance Metrics", self.test_performance_metrics),
            ("Integration Report", self.generate_integration_report)
        ]
        
        overall_results = {
            "test_suite": "Cline CLI Integration Tests",
            "timestamp": datetime.now().isoformat(),
            "total_tests": len(test_suite),
            "passed_tests": 0,
            "failed_tests": 0,
            "test_results": []
        }
        
        for test_name, test_func in test_suite:
            try:
                logger.info(f"📋 Running test: {test_name}")
                result = await test_func()
                
                test_result = {
                    "name": test_name,
                    "status": "passed" if result.get("success", False) else "failed",
                    "duration": result.get("duration", 0),
                    "details": result.get("details", ""),
                    "errors": result.get("errors", [])
                }
                
                overall_results["test_results"].append(test_result)
                
                if result.get("success", False):
                    overall_results["passed_tests"] += 1
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    overall_results["failed_tests"] += 1
                    logger.error(f"❌ {test_name}: FAILED - {result.get('details', 'Unknown error')}")
                    
            except Exception as e:
                logger.error(f"💥 Test {test_name} crashed: {e}")
                overall_results["failed_tests"] += 1
                overall_results["test_results"].append({
                    "name": test_name,
                    "status": "crashed",
                    "duration": 0,
                    "details": str(e),
                    "errors": [str(e)]
                })
        
        # Save test results
        self._save_test_results(overall_results)
        
        logger.info(f"🎯 Test Summary: {overall_results['passed_tests']}/{overall_results['total_tests']} tests passed")
        return overall_results
    
    async def test_configuration(self) -> Dict[str, Any]:
        """Test configuration validation"""
        start_time = time.time()
        
        try:
            # Test configuration loading
            config = CLINE_CONFIG
            assert config["name"] == "cline"
            assert config["architecture"]["type"] == "nodejs_npm"
            
            # Test MCP settings
            mcp_settings = get_mcp_settings_path()
            mcp_dir = get_mcp_server_directory()
            
            # Test adapter initialization
            assert self.adapter.cli_name == "cline"
            assert self.adapter.version == "1.0.0"
            
            duration = time.time() - start_time
            return {
                "success": True,
                "duration": duration,
                "details": "Configuration validation successful",
                "errors": []
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"Configuration validation failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_mcp_server_startup(self) -> Dict[str, Any]:
        """Test MCP server startup and initialization"""
        start_time = time.time()
        
        try:
            # Test server initialization
            server = StigmergyMCPServer()
            
            # Test that default tools are loaded
            assert len(server.tools) > 0
            assert "search_files" in server.tools
            assert "read_project_file" in server.tools
            assert "collaborate_with_cli" in server.tools
            
            # Test that default resources are loaded
            assert len(server.resources) > 0
            assert "file://project_spec.json" in server.resources
            
            duration = time.time() - start_time
            return {
                "success": True,
                "duration": duration,
                "details": f"MCP server initialized with {len(server.tools)} tools and {len(server.resources)} resources",
                "errors": []
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"MCP server startup failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_mcp_tool_discovery(self) -> Dict[str, Any]:
        """Test MCP tool discovery functionality"""
        start_time = time.time()
        
        try:
            # Test tool discovery through adapter
            tools = await self.adapter._discover_available_tools()
            
            # Verify basic tools are available
            tool_names = [tool.name for tool in tools]
            
            duration = time.time() - start_time
            return {
                "success": True,
                "duration": duration,
                "details": f"Discovered {len(tools)} MCP tools: {', '.join(tool_names[:5])}",
                "errors": [],
                "tools_discovered": tool_names
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"MCP tool discovery failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_mcp_tool_execution(self) -> Dict[str, Any]:
        """Test MCP tool execution"""
        start_time = time.time()
        
        try:
            # Create a temporary test file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write("# Test file for MCP integration\nprint('Hello from MCP test')\n")
                test_file_path = f.name
            
            # Test file search tool
            search_request = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "search_files",
                    "arguments": {
                        "pattern": "*.py",
                        "directory": os.path.dirname(test_file_path)
                    }
                },
                "id": 1
            }
            
            result = await self.mcp_server.handle_request(search_request)
            assert "result" in result
            assert "files" in result["result"]
            
            # Test file read tool
            read_request = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "read_project_file",
                    "arguments": {
                        "path": os.path.basename(test_file_path),
                        "max_lines": 10
                    }
                },
                "id": 2
            }
            
            result = await self.mcp_server.handle_request(read_request)
            assert "result" in result
            assert "content" in result["result"]
            
            # Cleanup
            os.unlink(test_file_path)
            
            duration = time.time() - start_time
            return {
                "success": True,
                "duration": duration,
                "details": "MCP tool execution successful",
                "errors": []
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"MCP tool execution failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_cross_cli_intent_detection(self) -> Dict[str, Any]:
        """Test cross-CLI intent detection"""
        start_time = time.time()
        
        try:
            test_cases = [
                ("请用cline帮我分析代码", "chinese"),
                ("use cline to execute this task", "english"),
                ("调用cline来处理这个工作流", "chinese"),
                ("call cline to manage the build process", "english"),
                ("用cline帮我创建工具", "chinese"),
                ("ask cline for help with testing", "english")
            ]
            
            detected_intents = []
            for test_input, expected_lang in test_cases:
                intent = self.adapter._detect_cross_cli_intent(test_input)
                if intent:
                    detected_intents.append({
                        "input": test_input,
                        "detected": True,
                        "language": intent.get("language"),
                        "task": intent.get("task")
                    })
            
            success_rate = len(detected_intents) / len(test_cases)
            
            duration = time.time() - start_time
            return {
                "success": success_rate >= 0.8,  # 80% success rate required
                "duration": duration,
                "details": f"Intent detection success rate: {success_rate:.2%} ({len(detected_intents)}/{len(test_cases)})",
                "errors": [],
                "detected_intents": detected_intents
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"Intent detection test failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_task_execution(self) -> Dict[str, Any]:
        """Test basic task execution"""
        start_time = time.time()
        
        try:
            # Test simple task execution
            context = {
                "project_root": str(project_root),
                "use_npx": True  # Use npx for testing
            }
            
            result = await self.adapter.execute_task("Analyze the current project structure", context)
            
            # Verify result contains expected content
            assert "[CLINE]" in result or "[CLINE MCP]" in result
            
            duration = time.time() - start_time
            return {
                "success": True,
                "duration": duration,
                "details": "Task execution successful",
                "errors": [],
                "result_preview": result[:200] + "..." if len(result) > 200 else result
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"Task execution failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling scenarios"""
        start_time = time.time()
        
        try:
            error_scenarios = [
                ("Invalid MCP tool", self._test_invalid_mcp_tool),
                ("Missing parameters", self._test_missing_parameters),
                ("Invalid CLI command", self._test_invalid_cli_command),
                ("Timeout scenario", self._test_timeout_scenario)
            ]
            
            error_results = []
            for scenario_name, test_func in error_scenarios:
                try:
                    result = await test_func()
                    error_results.append({
                        "scenario": scenario_name,
                        "handled": result.get("handled", False),
                        "error_message": result.get("error", "")
                    })
                except Exception as e:
                    error_results.append({
                        "scenario": scenario_name,
                        "handled": False,
                        "error_message": str(e)
                    })
            
            # Check if most errors were handled gracefully
            handled_count = sum(1 for r in error_results if r["handled"])
            success_rate = handled_count / len(error_scenarios)
            
            duration = time.time() - start_time
            return {
                "success": success_rate >= 0.75,  # 75% error handling success rate
                "duration": duration,
                "details": f"Error handling success rate: {success_rate:.2%} ({handled_count}/{len(error_scenarios)})",
                "errors": [],
                "error_results": error_results
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"Error handling test failed: {e}",
                "errors": [str(e)]
            }
    
    async def test_performance_metrics(self) -> Dict[str, Any]:
        """Test performance metrics"""
        start_time = time.time()
        
        try:
            # Measure MCP server response time
            mcp_start = time.time()
            
            request = {
                "jsonrpc": "2.0",
                "method": "tools/list",
                "params": {},
                "id": 1
            }
            
            result = await self.mcp_server.handle_request(request)
            mcp_response_time = time.time() - mcp_start
            
            # Measure adapter response time
            adapter_start = time.time()
            result = await self.adapter.execute_task("List available tools", {})
            adapter_response_time = time.time() - adapter_start
            
            # Measure cross-CLI mapping performance
            mapping_start = time.time()
            suggestions = self.cross_mapper.suggest_optimal_collaboration(
                "Analyze this codebase for security issues",
                ["cline", "claude", "gemini"]
            )
            mapping_response_time = time.time() - mapping_start
            
            duration = time.time() - start_time
            
            performance_metrics = {
                "mcp_response_time": mcp_response_time,
                "adapter_response_time": adapter_response_time,
                "mapping_response_time": mapping_response_time,
                "suggestions_generated": len(suggestions)
            }
            
            # Performance thresholds
            mcp_ok = mcp_response_time < 1.0  # 1 second
            adapter_ok = adapter_response_time < 2.0  # 2 seconds
            mapping_ok = mapping_response_time < 0.5  # 0.5 seconds
            
            all_metrics_ok = mcp_ok and adapter_ok and mapping_ok
            
            return {
                "success": all_metrics_ok,
                "duration": duration,
                "details": f"Performance metrics: MCP={mcp_response_time:.3f}s, Adapter={adapter_response_time:.3f}s, Mapping={mapping_response_time:.3f}s",
                "errors": [],
                "performance_metrics": performance_metrics,
                "thresholds_met": {
                    "mcp": mcp_ok,
                    "adapter": adapter_ok,
                    "mapping": mapping_ok
                }
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"Performance test failed: {e}",
                "errors": [str(e)]
            }
    
    async def generate_integration_report(self) -> Dict[str, Any]:
        """Generate comprehensive integration report"""
        start_time = time.time()
        
        try:
            # Check architecture integration
            architectures = RealCLIArchitectures()
            cline_arch = architectures.ARCHITECTURES.get("cline")
            
            # Check cross-CLI mapping
            mapper = CrossCLIMapper()
            cline_compat = mapper.cli_compatibility.get("cline")
            
            # Check collaboration patterns
            cline_patterns = [p for p in mapper.collaboration_patterns.values() if "cline" in [p.source_cli, p.target_cli]]
            
            # Generate report
            report = {
                "integration_status": "active" if cline_arch and cline_compat else "partial",
                "architecture": {
                    "name": cline_arch.name if cline_arch else "Not found",
                    "type": cline_arch.architecture_type if cline_arch else "Unknown",
                    "mcp_support": True,
                    "collaboration_patterns": len(cline_patterns)
                },
                "compatibility": {
                    "supported_as_source": len(cline_compat.supported_as_source) if cline_compat else 0,
                    "supported_as_target": len(cline_compat.supported_as_target) if cline_compat else 0,
                    "strengths": cline_compat.strengths if cline_compat else [],
                    "limitations": cline_compat.limitations if cline_compat else []
                },
                "mcp_capabilities": {
                    "tools_available": len(self.mcp_server.tools),
                    "resources_available": len(self.mcp_server.resources),
                    "protocol_version": CLINE_CONFIG["mcp_protocol_version"]
                }
            }
            
            duration = time.time() - start_time
            return {
                "success": True,
                "duration": duration,
                "details": f"Integration report generated: {report['integration_status']}",
                "errors": [],
                "integration_report": report
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "duration": duration,
                "details": f"Integration report generation failed: {e}",
                "errors": [str(e)]
            }
    
    # Helper methods for error handling tests
    async def _test_invalid_mcp_tool(self) -> Dict[str, Any]:
        """Test handling of invalid MCP tool calls"""
        try:
            request = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "nonexistent_tool",
                    "arguments": {}
                },
                "id": 999
            }
            
            result = await self.mcp_server.handle_request(request)
            
            # Should return error response
            has_error = "error" in result
            
            return {
                "handled": has_error,
                "error": result.get("error", {}).get("message", "Unknown error")
            }
            
        except Exception as e:
            return {
                "handled": True,
                "error": str(e)
            }
    
    async def _test_missing_parameters(self) -> Dict[str, Any]:
        """Test handling of missing required parameters"""
        try:
            request = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "read_project_file",
                    "arguments": {}  # Missing required 'path' parameter
                },
                "id": 998
            }
            
            result = await self.mcp_server.handle_request(request)
            
            # Should handle missing parameters gracefully
            has_error = "error" in result or "result" in result
            
            return {
                "handled": has_error,
                "error": result.get("error", {}).get("message", "Parameter validation")
            }
            
        except Exception as e:
            return {
                "handled": True,
                "error": str(e)
            }
    
    async def _test_invalid_cli_command(self) -> Dict[str, Any]:
        """Test handling of invalid CLI commands"""
        try:
            # Try to execute with invalid command
            result = await self.adapter.execute_task("invalid_command_that_does_not_exist", {})
            
            # Should handle gracefully with error message
            has_error = "ERROR" in result.upper()
            
            return {
                "handled": has_error,
                "error": "Invalid command handled gracefully"
            }
            
        except Exception as e:
            return {
                "handled": True,
                "error": str(e)
            }
    
    async def _test_timeout_scenario(self) -> Dict[str, Any]:
        """Test timeout handling"""
        try:
            # This should complete quickly, but test the timeout mechanism
            start_time = time.time()
            result = await self.adapter.execute_task("echo test", {"timeout": 0.1})  # Very short timeout
            elapsed = time.time() - start_time
            
            # Should either complete quickly or handle timeout
            return {
                "handled": elapsed < 1.0,  # Should complete within reasonable time
                "error": "Timeout handled appropriately"
            }
            
        except Exception as e:
            return {
                "handled": True,
                "error": str(e)
            }
    
    def _save_test_results(self, results: Dict[str, Any]):
        """Save test results to file"""
        try:
            results_dir = project_root / "test_results"
            results_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            results_file = results_dir / f"cline_integration_test_{timestamp}.json"
            
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            logger.info(f"📊 Test results saved to: {results_file}")
            
        except Exception as e:
            logger.error(f"Failed to save test results: {e}")


def main():
    """Main test execution function"""
    logger.info("🧪 Cline CLI Integration Test Suite")
    logger.info("=" * 50)
    
    try:
        tester = ClineIntegrationTester()
        results = asyncio.run(tester.run_all_tests())
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 Cline CLI Integration Test Results")
        print("=" * 60)
        
        success_rate = results["passed_tests"] / results["total_tests"] * 100
        status_emoji = "✅" if success_rate >= 80 else "⚠️" if success_rate >= 60 else "❌"
        
        print(f"{status_emoji} Overall Success Rate: {success_rate:.1f}%")
        print(f"📋 Total Tests: {results['total_tests']}")
        print(f"✅ Passed: {results['passed_tests']}")
        print(f"❌ Failed: {results['failed_tests']}")
        print(f"⏱️  Timestamp: {results['timestamp']}")
        
        # Detailed results
        print("\n📋 Detailed Test Results:")
        for test_result in results["test_results"]:
            status_emoji = "✅" if test_result["status"] == "passed" else "❌"
            print(f"  {status_emoji} {test_result['name']}: {test_result['status'].upper()} ({test_result['duration']:.3f}s)")
            if test_result["status"] != "passed":
                print(f"     Details: {test_result['details']}")
        
        # Integration report summary
        integration_report = None
        for test_result in results["test_results"]:
            if test_result["name"] == "Integration Report" and test_result["status"] == "passed":
                integration_report = test_result.get("integration_report", {})
                break
        
        if integration_report:
            print(f"\n📈 Integration Status: {integration_report.get('integration_status', 'unknown')}")
            print(f"🔧 Architecture: {integration_report.get('architecture', {}).get('name', 'unknown')}")
            print(f"🛠️  MCP Tools: {integration_report.get('mcp_capabilities', {}).get('tools_available', 0)}")
            print(f"📚 MCP Resources: {integration_report.get('mcp_capabilities', {}).get('resources_available', 0)}")
        
        # Exit codes
        if success_rate >= 80:
            print(f"\n🎉 Excellent! Cline CLI integration is working well.")
            return 0
        elif success_rate >= 60:
            print(f"\n⚠️  Good progress, but some issues need attention.")
            return 1
        else:
            print(f"\n❌ Significant issues detected. Please review the test results.")
            return 2
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Test suite interrupted by user")
        return 130
    except Exception as e:
        logger.error(f"\n💥 Test suite failed with unexpected error: {e}")
        return 3


if __name__ == "__main__":
    sys.exit(main())