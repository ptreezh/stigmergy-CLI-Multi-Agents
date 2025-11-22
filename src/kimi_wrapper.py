#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kimi CLI包装器 - 解决兼容性问题
"""

import subprocess
import sys
import os


def kimi_chat(prompt, model="moonshot-v1-8k"):
    """使用kimi进行对话"""
    try:
        # 方法1: 尝试使用环境变量传递提示
        env = os.environ.copy()
        env['KIMI_PROMPT'] = prompt
        
        # 使用子进程启动kimi，然后发送输入
        process = subprocess.Popen(
            ['kimi', '--model', model],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        # 发送提示并等待输出
        stdout, stderr = process.communicate(input=prompt + '\n', timeout=60)
        
        if process.returncode == 0:
            return stdout
        else:
            return f"错误: {stderr}"
    
    except subprocess.TimeoutExpired:
        return "请求超时"
    except Exception as e:
        return f"异常: {str(e)}"


def kimi_direct_api(prompt):
    """直接调用Kimi API（如果可用）"""
    try:
        import requests
        
        api_key = os.getenv('KIMI_API_KEY')
        if not api_key:
            return "未设置KIMI_API_KEY环境变量"
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'moonshot-v1-8k',
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.7
        }
        
        response = requests.post(
            'https://api.moonshot.cn/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            return f"API错误: {response.status_code} - {response.text}"
    
    except ImportError:
        return "需要安装requests库: pip install requests"
    except Exception as e:
        return f"API调用失败: {str(e)}"


def main():
    if len(sys.argv) < 2:
        print("用法: kimi_wrapper.py '你的提示'")
        return
    
    prompt = ' '.join(sys.argv[1:])
    print(f"🚀 Kimi处理中...")
    
    # 尝试直接API
    result = kimi_direct_api(prompt)
    if "未设置" not in result and "API错误" not in result:
        print(result)
        return
    
    # 如果API不可用，尝试CLI包装
    print("⚠️  API不可用，尝试CLI包装...")
    result = kimi_chat(prompt)
    print(result)


if __name__ == "__main__":
    main()