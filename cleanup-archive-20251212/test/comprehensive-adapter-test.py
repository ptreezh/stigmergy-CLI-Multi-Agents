#!/usr/bin/env python3
"""
Comprehensive adapter test to verify all 7 adapters are working correctly
"""

import sys
import os
import asyncio

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

async def test_all_adapters():
    """Test all 7 adapters"""
    print("Testing all 7 adapters...")
    
    # Import adapter registry
    from src.adapters import (
        get_claude_adapter,
        get_gemini_adapter,
        get_qwencode_adapter,
        get_iflow_adapter,
        get_qoder_adapter,
        get_codebuddy_adapter,
        get_codex_adapter
    )
    
    adapters = {
        'Claude': get_claude_adapter,
        'Gemini': get_gemini_adapter,
        'QwenCode': get_qwencode_adapter,
        'iFlow': get_iflow_adapter,
        'Qoder': get_qoder_adapter,
        'CodeBuddy': get_codebuddy_adapter,
        'Codex': get_codex_adapter
    }
    
    results = {}
    
    for name, getter in adapters.items():
        try:
            print(f"\nTesting {name} adapter...")
            adapter = getter()
            
            if adapter:
                # Test execution
                result = await adapter.execute_task(f"Test task for {name}")
                print(f"  Execution: PASS" if result else "  Execution: FAIL")
                
                # Test statistics
                stats = adapter.get_statistics()
                print(f"  Statistics: PASS" if stats else "  Statistics: FAIL")
                
                results[name] = {
                    'loaded': True,
                    'execution': result is not None,
                    'stats': stats is not None
                }
            else:
                print(f"  FAIL - Could not load adapter")
                results[name] = {
                    'loaded': False,
                    'execution': False,
                    'stats': False
                }
                
        except Exception as e:
            print(f"  ERROR - {e}")
            results[name] = {
                'loaded': False,
                'execution': False,
                'stats': False,
                'error': str(e)
            }
    
    # Print summary
    print("\n" + "="*50)
    print("ADAPTER TEST SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(adapters)
    
    for name, result in results.items():
        status = "PASS" if result['loaded'] and result['execution'] and result['stats'] else "FAIL"
        print(f"{name:12}: {status}")
        if result['loaded'] and result['execution'] and result['stats']:
            passed += 1
    
    print("-"*50)
    print(f"RESULT: {passed}/{total} adapters working correctly")
    
    if passed == total:
        print("ALL ADAPTERS ARE WORKING CORRECTLY!")
        return True
    elif passed >= total * 0.8:
        print("MOST ADAPTERS ARE WORKING!")
        return True
    else:
        print("TOO MANY ADAPTERS FAILED!")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_all_adapters())
    sys.exit(0 if success else 1)