import asyncio
import subprocess
import platform

async def test_async_subprocess():
    # 映射CLI名称到实际命令和可能的路径
    if platform.system() == "Windows":
        cmd = ['C:\\Users\\WIN10\\AppData\\Roaming\\npm\\claude.cmd']
    else:
        cmd = ['claude']
    
    cmd.append('--version')
    
    try:
        # 使用 asyncio.create_subprocess_exec 来异步执行
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # 设置超时
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=10.0)
        
        print('STDOUT:', stdout.decode('utf-8', errors='ignore'))
        print('STDERR:', stderr.decode('utf-8', errors='ignore'))
        print('Return code:', process.returncode)
        
        if process.returncode == 0:
            result = stdout.decode('utf-8', errors='ignore').strip()
            if not result and stderr:
                result = stderr.decode('utf-8', errors='ignore').strip()
            print('Result:', result)
        else:
            print('Command failed')
            
    except asyncio.TimeoutError:
        print('Command timed out')
    except Exception as e:
        print(f'Exception: {e}')

if __name__ == '__main__':
    asyncio.run(test_async_subprocess())