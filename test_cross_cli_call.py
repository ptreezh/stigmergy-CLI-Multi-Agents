import asyncio
import platform
import sys
import os

# Add the adapters directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'adapters', 'qwencode'))

# Set encoding to utf-8 to avoid Unicode errors
import io
import locale
import codecs

# Redirect stdout to handle Unicode properly
if platform.system() == "Windows":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from standalone_qwencode_adapter import StandaloneQwenCodeAdapter

async def test_cross_cli_call():
    # Create config directory and file if they don't exist
    config_dir = os.path.join(os.path.dirname(__file__), 'src', 'adapters', 'qwencode')
    os.makedirs(config_dir, exist_ok=True)
    config_file = os.path.join(config_dir, 'config.json')
    
    if not os.path.exists(config_file):
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write('{"plugins": [], "integration_settings": {"enable_cross_cli": true}}')
    
    adapter = StandaloneQwenCodeAdapter()
    
    # Test cross-CLI call
    result = await adapter._handle_cross_cli_call("claude --version", {})
    print("Cross-CLI call result:")
    # Handle encoding issues
    try:
        print(result)
    except UnicodeEncodeError:
        print(result.encode('utf-8', errors='ignore').decode('utf-8'))

if __name__ == '__main__':
    asyncio.run(test_cross_cli_call())