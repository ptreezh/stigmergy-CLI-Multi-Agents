import sys
sys.path.insert(0, '.')

print("Testing basic imports...")

try:
    print("1. Testing config import...")
    from src.adapters.cline.config import CLINE_CONFIG
    print(f"   ✅ Config loaded: {CLINE_CONFIG['name']}")
    
    print("2. Testing MCP server import...")
    from src.adapters.cline.mcp_server import StigmergyMCPServer
    print("   ✅ MCP server imported")
    
    print("3. Testing adapter import...")
    from src.adapters.cline.standalone_cline_adapter import StandaloneClineAdapter
    print("   ✅ Adapter imported")
    
    print("4. Testing cross CLI executor...")
    from src.core.cross_cli_executor import CrossCLIExecutor
    print("   ✅ Cross CLI executor imported")
    
    print("5. Testing cross CLI mapper...")
    from src.core.cross_cli_mapping import CrossCLIMapper
    print("   ✅ Cross CLI mapper imported")
    
    print("6. Testing real CLI hook system...")
    from src.core.real_cli_hook_system import RealCLIHookManager
    print("   ✅ Real CLI hook system imported")
    
    print("\n🎉 All imports successful!")
    
except Exception as e:
    print(f"\n❌ Import failed: {e}")
    import traceback
    traceback.print_exc()