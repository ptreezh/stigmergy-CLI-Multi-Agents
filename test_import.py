#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify imports
"""

import sys
import os
from pathlib import Path

# Add core path
core_path = Path(__file__).parent / 'src' / 'core'
sys.path.insert(0, str(core_path))

print("Testing imports...")

try:
    from cross_platform_safe_cli import get_cli_executor, CLICommand, PermissionLevel
    print("✅ Successfully imported cross_platform_safe_cli")
except ImportError as e:
    print(f"❌ Failed to import cross_platform_safe_cli: {e}")

try:
    from cross_platform_encoding import get_cross_platform_installer, encoding_safe
    print("✅ Successfully imported cross_platform_encoding")
except ImportError as e:
    print(f"❌ Failed to import cross_platform_encoding: {e}")

# Test creating executor
try:
    executor = get_cli_executor()
    print(f"✅ Created CLI executor with {len(executor.cli_configs)} CLI configurations")
    for name, config in executor.cli_configs.items():
        print(f"   - {name}: {config.display_name}")
except Exception as e:
    print(f"❌ Failed to create executor: {e}")