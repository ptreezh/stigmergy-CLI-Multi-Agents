#!/usr/bin/env python3
"""
Debug script to check why Codex and Cline/Copilot adapters are failing to load
"""

import sys
import os
import traceback

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

print("Debugging adapter loading issues...")
print(f"Project root: {project_root}")
print(f"Python path: {sys.path[:3]}...")

def debug_adapter_loading():
    """Debug adapter loading issues"""
    
    # Test Codex adapter
    print("\n=== Testing Codex Adapter ===")
    try:
        from src.adapters.codex.standalone_codex_adapter import get_standalone_codex_adapter
        print("Codex adapter module imported successfully")
        
        adapter = get_standalone_codex_adapter()
        print(f"Codex adapter instance created: {type(adapter)}")
        
        # Test basic functionality
        stats = adapter.get_statistics()
        print(f"Codex adapter stats: {stats}")
        
    except Exception as e:
        print(f"Codex adapter failed: {e}")
        print("Traceback:")
        traceback.print_exc()
    
    # Test Cline adapter (as proxy for Copilot)
    print("\n=== Testing Cline Adapter ===")
    try:
        from src.adapters.cline.standalone_cline_adapter import get_standalone_cline_adapter
        print("Cline adapter module imported successfully")
        
        adapter = get_standalone_cline_adapter()
        print(f"Cline adapter instance created: {type(adapter)}")
        
    except Exception as e:
        print(f"Cline adapter failed: {e}")
        print("Traceback:")
        traceback.print_exc()
    
    # Test via adapter registry
    print("\n=== Testing Adapter Registry ===")
    try:
        from src.adapters import get_codex_adapter, get_cline_adapter
        
        codex = get_codex_adapter()
        print(f"Codex via registry: {'OK' if codex else 'FAILED'}")
        
        cline = get_cline_adapter()
        print(f"Cline via registry: {'OK' if cline else 'FAILED'}")
        
    except Exception as e:
        print(f"Adapter registry test failed: {e}")
        print("Traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    debug_adapter_loading()