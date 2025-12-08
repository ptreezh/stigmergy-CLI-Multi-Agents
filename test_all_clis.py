import asyncio
import platform
import sys
import os

# Add the adapters directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'adapters', 'qwencode'))

# Set encoding to utf-8 to avoid Unicode errors
import io

# Redirect stdout to handle Unicode properly
if platform.system() == "Windows":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from standalone_qwencode_adapter import StandaloneQwenCodeAdapter

async def test_all_clis():
    adapter = StandaloneQwenCodeAdapter()
    
    # Test all CLI tools
    cli_tools = [
        ("claude", "--version"),
        ("gemini", "--version"), 
        ("iflow", "--version"),
        ("qodercli", "--version"),
        ("codebuddy", "--version"),
        ("copilot", "--version"),
        ("codex", "--version")
    ]
    
    for cli_name, task in cli_tools:
        print(f"\n{'='*50}")
        print(f"Testing {cli_name} CLI call...")
        print(f"{'='*50}")
        
        try:
            # Test cross-CLI call
            command = f"{cli_name} {task}"
            result = await adapter._handle_cross_cli_call(command, {})
            print(f"Cross-CLI call result for {cli_name}:")
            # Handle encoding issues
            try:
                print(result)
            except UnicodeEncodeError:
                print(result.encode('utf-8', errors='ignore').decode('utf-8'))
        except Exception as e:
            print(f"Error calling {cli_name}: {e}")

if __name__ == '__main__':
    asyncio.run(test_all_clis())