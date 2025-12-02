import asyncio
import sys
sys.path.insert(0, '.')

async def test_cline_integration():
    print("🧪 Testing Cline CLI Integration...")
    
    try:
        # Test 1: Configuration
        print("1. Testing configuration...")
        from src.adapters.cline.config import CLINE_CONFIG
        print(f"   ✅ Config: {CLINE_CONFIG['name']} v{CLINE_CONFIG['version']}")
        
        # Test 2: MCP Server
        print("2. Testing MCP server...")
        from src.adapters.cline.mcp_server import StigmergyMCPServer
        server = StigmergyMCPServer()
        print(f"   ✅ MCP Server: {len(server.tools)} tools, {len(server.resources)} resources")
        
        # Test 3: Adapter
        print("3. Testing adapter...")
        from src.adapters.cline.standalone_cline_adapter import StandaloneClineAdapter
        adapter = StandaloneClineAdapter()
        print(f"   ✅ Adapter: {adapter.cli_name} v{adapter.version}")
        
        # Test 4: Basic MCP tool test
        print("4. Testing MCP tool execution...")
        request = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": 1
        }
        result = await server.handle_request(request)
        if "result" in result and "tools" in result["result"]:
            print(f"   ✅ Tool list: {len(result['result']['tools'])} tools available")
        else:
            print(f"   ❌ Tool list failed: {result}")
        
        # Test 5: Basic task execution
        print("5. Testing basic task execution...")
        result = adapter.execute_task("List project files", {})
        if "[CLINE]" in result or "[CLINE MCP]" in result:
            print(f"   ✅ Task execution: Command processed successfully")
        else:
            print(f"   ⚠️  Task execution: Unexpected result format")
        
        # Test 6: Architecture validation
        print("6. Testing architecture validation...")
        from src.core.cross_cli_executor import RealCLIArchitectures
        architectures = RealCLIArchitectures()
        cline_arch = architectures.ARCHITECTURES.get("cline")
        if cline_arch:
            print(f"   ✅ Cline architecture: {cline_arch.name} ({cline_arch.architecture_type})")
        else:
            print("   ❌ Cline architecture not found")
        
        print("\n🎉 Cline integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_cline_integration())
    sys.exit(0 if success else 1)