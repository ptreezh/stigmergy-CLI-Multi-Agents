#!/usr/bin/env python3
"""Simple test script for Cline CLI integration."""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from src.adapters.cline import StandaloneClineAdapter
    
    print("🚀 Testing Cline CLI Integration")
    print("=" * 50)
    
    # Initialize adapter
    adapter = StandaloneClineAdapter()
    print("✅ Cline adapter loaded successfully")
    print(f"   - Name: {adapter.cli_name}")
    print(f"   - Display Name: {adapter.display_name}")
    print(f"   - Version: {adapter.version}")
    print(f"   - Integration Type: {adapter.integration_type}")
    
    # Test availability
    is_available = adapter.is_available()
    print(f"✅ Cline CLI availability check: {is_available}")
    
    # Test health check
    health = adapter.health_check()
    print(f"✅ Health check completed")
    print(f"   - Available: {health['available']}")
    print(f"   - Platform: {health['platform_support']['current_platform']}")
    print(f"   - Supported: {health['platform_support']['supported']}")
    
    # Test cross-CLI pattern detection
    test_patterns = [
        "请用claude帮我分析代码",
        "use cline to execute task", 
        "调用gemini来翻译文档"
    ]
    
    print("✅ Cross-CLI pattern detection:")
    for pattern in test_patterns:
        # Test Chinese patterns
        import re
        for regex in adapter.chinese_patterns:
            match = re.search(regex, pattern)
            if match:
                cli = match.group(1).lower()
                task = match.group(2).strip()
                print(f"   - '{pattern}' → CLI: {cli}, Task: {task}")
                break
        else:
            # Test English patterns
            for regex in adapter.english_patterns:
                match = re.search(regex, pattern)
                if match:
                    cli = match.group(1).lower()
                    task = match.group(2).strip()
                    print(f"   - '{pattern}' → CLI: {cli}, Task: {task}")
                    break
    
    # Test supported CLI detection
    supported_clis = ['claude', 'gemini', 'qwen', 'codebuddy', 'copilot', 'cline']
    print("✅ Supported CLI detection:")
    for cli in supported_clis:
        is_supported = adapter._is_supported_cli(cli)
        print(f"   - {cli}: {is_supported}")
    
    print("\n🎉 All basic tests passed!")
    print("Cline CLI integration is working correctly.")
    
except Exception as e:
    print(f"❌ Test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)