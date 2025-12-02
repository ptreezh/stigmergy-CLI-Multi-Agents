import sys
sys.path.insert(0, '.')

try:
    from src.adapters.cline.config import CLINE_CONFIG
    from src.adapters.cline.mcp_server import StigmergyMCPServer
    print('✅ Configuration and MCP server imports successful')
    print(f'📋 Cline config name: {CLINE_CONFIG["name"]}')
    print(f'🔧 MCP protocol version: {CLINE_CONFIG["mcp_protocol_version"]}')
    
    server = StigmergyMCPServer()
    print(f'🛠️  MCP tools available: {len(server.tools)}')
    print(f'📚 MCP resources available: {len(server.resources)}')
    print('✅ Basic integration test passed!')
except Exception as e:
    print(f'❌ Test failed: {e}')
    import traceback
    traceback.print_exc()