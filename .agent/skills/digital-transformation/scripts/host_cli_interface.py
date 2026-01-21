#!/usr/bin/env python3
"""
宿主CLI LLM接口适配器
直接利用宿主CLI的LLM调用能力、API入口、模型和KEY，无需额外LLM客户端
"""

import os
import sys
import json
import logging
import subprocess
from typing import Dict, Any, List, Optional

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HostCLIInterface:
    """
    宿主CLI LLM接口适配器
    
    直接使用宿主CLI的LLM能力，通过命令行调用或直接访问接口
    """
    
    def __init__(self):
        """初始化接口适配器"""
        self._detect_host_environment()
        self._validate_configuration()
        logger.info("宿主CLI LLM接口适配器初始化完成")
    
    def _detect_host_environment(self):
        """检测宿主环境"""
        logger.info("检测宿主CLI环境...")
        
        # 检测是否在Stigmergy环境中
        self.is_stigmergy = self._check_stigmergy_environment()
        self.is_shell_available = self._check_shell_availability()
        
        # 尝试自动配置
        self._auto_detect_cli()
        self._auto_detect_api_endpoint()
        self._auto_detect_model()
        self._auto_detect_api_key()
    
    def _check_stigmergy_environment(self) -> bool:
        """检查是否在Stigmergy环境中"""
        # 检查环境变量
        if 'STIGMERGY_HOME' in os.environ:
            logger.info("检测到Stigmergy环境")
            return True
        return False
    
    def _check_shell_availability(self) -> bool:
        """检查Shell可用性"""
        try:
            if sys.platform == "win32":
                result = subprocess.run(['cmd', '/c', 'echo', 'test'], capture_output=True, text=True, timeout=2)
            return result.returncode == 0
            else:
                result = subprocess.run(['echo', 'test'], capture_output=True, text=True, timeout=2)
                return result.returncode == 0
        except Exception as e:
            logger.warning(f"Shell不可用: {e}")
            return False
    
    def _auto_detect_cli(self):
        """自动检测宿主CLI"""
        logger.info("自动检测宿主CLI...")
        
        # 检测常见的CLI命令
        self.host_cli_command = None
        
        # 1. 检查是否有llm命令（通用LLM CLI）
        if self._check_command_exists('llm'):
            self.host_cli_command = 'llm'
            logger.info("发现llm命令")
            return
        
        # 2. 检查Stigmergy CLI
        if self._check_command_exists('stigmergy') or self._check_command_exists('stigmergy-cli'):
            self.host_cli_command = 'stigmergy'
            logger.info("发现Stigmergy CLI")
            return
        
        # 3. 检查其他可能的CLI
        possible_clis = ['ai', 'claude', 'openai', 'gpt']
        for cli in possible_clis:
            if self._check_command_exists(cli):
                self.host_cli_command = cli
                logger.info(f"发现CLI命令: {cli}")
                return
        
        # 4. 默认使用python命令调用LLM（通过环境变量传递API key）
        logger.info("未找到专用CLI，使用Python环境变量方式")
        self.host_cli_command = None
    
    def _check_command_exists(self, command: str) -> bool:
        """检查命令是否存在"""
        try:
            if sys.platform == "win32":
                result = subprocess.run(['where', command], capture_output=True, text=True, timeout=2)
                return result.returncode == 0
            else:
                result = subprocess.run(['which', command], capture_output=True, text=True, timeout=2)
                return result.returncode == 0
        except:
            return False
    
    def _auto_detect_api_endpoint(self):
        """自动检测API端点"""
        logger.info("自动检测API端点...")
        
        # 1. 优先使用环境变量
        self.api_endpoint = os.environ.get('HOST_LLM_API_ENDPOINT', 
                                     os.environ.get('LLM_API_ENDPOINT',
                                     os.environ.get('API_ENDPOINT',
                                     os.environ.get('OPENAI_API_BASE',
                                     'https://api.openai.com/v1')))
        
        # 2. 检查Stigmergy特定的API端点配置
        if self.is_stigmergy:
            stigmergy_endpoint = os.environ.get('STIGMERGY_LLM_API_ENDPOINT')
            if stigmergy_endpoint:
                self.api_endpoint = stigmergy_endpoint
                logger.info(f"使用Stigmergy API端点: {stigmergy_endpoint}")
        
        logger.info(f"API端点: {self.api_endpoint}")
    
    def _auto_detect_model(self):
        """自动检测模型"""
        logger.info("自动检测模型...")
        
        # 1. 优先使用环境变量
        self.model = os.environ.get('HOST_LLM_MODEL',
                           os.environ.get('LLM_MODEL',
                           os.environ.get('MODEL',
                           os.environ.get('OPENAI_MODEL',
                           'gpt-4'))
        
        # 2. 检查Stigmergy特定的模型配置
        if self.is_stigmergy:
            stigmergy_model = os.environ.get('STIGMERGY_LLM_MODEL')
            if stigmergy_model:
                self.model = stigmergy_model
                logger.info(f"使用Stigmergy模型: {stigmergy_model}")
        
        logger.info(f"模型: {self.model}")
    
    def _auto_detect_api_key(self):
        """自动检测API密钥"""
        logger.info("自动检测API密钥...")
        
        # 1. 优先使用宿主CLI专用的环境变量
        possible_keys = [
            'HOST_LLM_API_KEY',
            'STIGMERGY_LLM_API_KEY',
            'CLI_API_KEY'
        ]
        
        for key in possible_keys:
            if os.environ.get(key):
                self.api_key = os.environ.get(key)
                logger.info(f"发现API密钥: {key}")
                return
        
        # 2. 使用标准的环境变量
        standard_keys = [
            'OPENAI_API_KEY',
            'ANTHROPIC_API_KEY',
            'DASHSCOPE_API_KEY',
            'ZHIPU_API_KEY',
            'HUNYUAN_API_KEY',
            'BAICHUAN_API_KEY',
            'TIANYUAN_API_KEY'
        ]
        
        for key in standard_keys:
            if os.environ.get(key):
                self.api_key = os.environ.get(key)
                logger.info(f"发现标准API密钥: {key}")
                return
        
        # 3. 如果没有找到API密钥，但检测到Stigmergy环境，可能使用内置的LLM服务
        if self.is_stigmergy and not self.api_key:
            logger.info("Stigmergy环境未配置API密钥，可能使用内置LLM服务")
            self.api_key = None
        else:
            logger.warning("未找到API密钥，某些功能可能无法使用")
            self.api_key = None
    
    def _validate_configuration(self):
        """验证配置"""
        logger.info("验证配置...")
        
        issues = []
        
        # 验证API端点
        if not self.api_endpoint:
            issues.append("API端点未配置")
        elif not self.api_endpoint.startswith(('http://', 'https://')):
            issues.append("API端点格式无效")
        
        # 验证模型
        if not self.model:
            issues.append("模型未配置")
        
        # 验证API密钥
        if not self.api_key and self.api_endpoint and 'openai' in self.api_endpoint.lower():
            issues.append("OpenAI端点需要API密钥")
        
        if issues:
            logger.warning(f"配置验证发现问题: {', '.join(issues)}")
        else:
            logger.info("配置验证通过")
    
    def complete(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        执行聊天完成 - 通过宿主CLI的LLM调用能力
        
        Args:
            messages: 消息列表，格式为[{"role": "user", "content": "..."}]
            **kwargs: 额外参数
            
        Returns:
            LLM响应结果（宿主CLI格式）
        """
        try:
            logger.info(f"通过宿主CLI调用LLM: {self.model}")
            
            # 方式1: 如果有专用的LLM CLI命令
            if self.host_cli_command:
                return self._call_via_cli(messages, **kwargs)
            # 方式2: 通过Python环境和API端点调用
            else:
                return self._call_via_python(messages, **kwargs)
            
        except Exception as e:
            logger.error(f"LLM调用失败: {e}")
            return {
                "error": str(e),
                "error_type": "host_cli_call_failed"
            }
    
    def _call_via_cli(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """通过CLI调用LLM"""
        logger.info(f"使用CLI命令调用LLM: {self.host_cli_command}")
        
        # 构建CLI调用
        cli_command = []
        cli_command.append(self.host_cli_command)
        
        # 添加模型参数
        if self.host_cli_command in ['llm']:
            cli_command.extend(['--model', self.model])
        elif self.host_cli_command in ['openai', 'gpt', 'chatgpt']:
            cli_command.extend(['--model', self.model])
        
        # 添加API端点
        if self.api_endpoint:
            cli_command.extend(['--api-endpoint', self.api_endpoint])
        
        # 添加API密钥（如果有的话）
        if self.api_key:
            cli_command.extend(['--api-key', self.api_key])
        
        # 添加输出格式
        cli_command.extend(['--format', 'json'])
        
        # 添加提示词（将messages转换为CLI格式）
        user_message = self._messages_to_cli_prompt(messages)
        cli_command.extend(['--prompt', user_message])
        
        # 执行CLI命令
        try:
            logger.info(f"执行CLI命令: {' '.join(cli_command)}")
            result = subprocess.run(
                cli_command,
                capture_output=True,
                text=True,
                timeout=300,
                check=True
            )
            
            if result.returncode != 0:
                raise Exception(f"CLI命令执行失败，返回码: {result.returncode}, 错误: {result.stderr}")
            
            # 解析CLI输出
            return self._parse_cli_response(result.stdout)
            
        except subprocess.TimeoutExpired:
            raise Exception("CLI命令执行超时")
        except Exception as e:
            raise Exception(f"CLI调用失败: {e}")
    
    def _call_via_python(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """通过Python环境调用LLM"""
        logger.info(f"通过Python环境调用LLM: {self.api_endpoint}")
        
        # 尝试使用requests库（如果可用）
        try:
            import requests
            return self._call_via_requests(messages, **kwargs)
        except ImportError:
            logger.info("requests库不可用，使用subprocess调用curl")
            return self._call_via_curl(messages, **kwargs)
    
    def _call_via_requests(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """通过requests库调用LLM"""
        import requests
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # 构建请求体
        # 根据API端点的不同，使用不同的请求格式
        if 'openai' in self.api_endpoint.lower():
            # OpenAI格式
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": kwargs.get('temperature', 0.7),
                "max_tokens": kwargs.get('max_tokens', 2000)
            }
        else:
            # 通用格式
            payload = {
                "model": self.model,
                "messages": messages,
                **kwargs
            }
        
        logger.info(f"发送请求到API端点: {self.api_endpoint}")
        
        # 发送请求
        response = requests.post(
            self.api_endpoint + '/chat/completions',
            headers=headers,
            json=payload,
            timeout=300
        )
        
        if response.status_code != 200:
            raise Exception(f"API请求失败，状态码: {response.status_code}, 错误: {response.text}")
        
        return response.json()
    
    def _call_via_curl(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """通过curl命令调用LLM"""
        logger.info("使用curl命令调用LLM")
        
        # 构建curl命令
        curl_command = ['curl', '-X', 'POST', self.api_endpoint + '/chat/completions']
        
        # 添加头信息
        curl_command.extend(['-H', 'Content-Type: application/json'])
        curl_command.extend(['-H', f"Authorization: Bearer {self.api_key}"])
        
        # 构建请求体
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": kwargs.get('temperature', 0.7),
            "max_tokens": kwargs.get('max_tokens', 2000)
        }
        
        # 添加数据体
        curl_command.extend(['-d', json.dumps(payload)])
        
        # 执行curl命令
        result = subprocess.run(
            curl_command,
            capture_output=True,
            text=True,
            timeout=300,
            check=True
        )
        
        if result.returncode != 0:
            raise Exception(f"curl命令执行失败，返回码: {result.returncode}, 错误: {result.stderr}")
        
        # 解析响应
        return json.loads(result.stdout)
    
    def stream_complete(self, messages: List[Dict[str, str]], **kwargs):
        """
        流式聊天完成 - 通过宿主CLI
        
        Args:
            messages: 消息列表
            **kwargs: 额外参数
            
        Yields:
            生成的内容片段
        """
        logger.info("开始流式聊天完成")
        
        # 流式实现
        for chunk in self._stream_via_cli(messages, **kwargs):
            yield chunk
    
    def _stream_via_cli(self, messages: List[Dict[str, str]], **kwargs):
        """通过CLI流式调用LLM"""
        # 简化实现：先完成然后流式输出
        result = self.complete(messages, **kwargs)
        
        # 流式输出（简化版）
        if 'choices' in result and len(result['choices']) > 0:
            content = result['choices'][0]['message']['content']
            # 分批流式输出
            chunk_size = 100
            for i in range(0, len(content), chunk_size):
                yield content[i:i+chunk_size]
                import time
                time.sleep(0.05)  # 模拟流式输出
    
    def _messages_to_cli_prompt(self, messages: List[Dict[str, str]]) -> str:
        """将消息列表转换为CLI提示词格式"""
        prompt_parts = []
        
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "system":
                prompt_parts.append(f"## 系统提示\n{content}\n")
            elif role == "user":
                prompt_parts.append(f"## 用户输入\n{content}\n")
        
        return '\n'.join(prompt_parts)
    
    def _parse_cli_response(self, response_text: str) -> Dict[str, Any]:
        """解析CLI响应"""
        try:
            # 尝试解析为JSON
            return json.loads(response_text)
        except json.JSONDecodeError:
            # 如果不是纯JSON，尝试提取JSON部分
            lines = response_text.split('\n')
            json_lines = []
            in_json_block = False
            for line in lines:
                line = line.strip()
                if line.startswith('```json'):
                    in_json_block = True
                elif line.startswith('```') and in_json_block:
                    in_json_block = False
                elif in_json_block:
                    json_lines.append(line)
            
            if json_lines:
                response_json = '\n'.join(json_lines)
                return json.loads(response_json)
            else:
                # 如果没有找到JSON，返回原始文本
                return {
                    "raw_response": response_text,
                    "format": "text"
                }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        获取模型信息
        
        Returns:
            模型信息
        """
        info = {
            "host_cli": self.host_cli_command,
            "api_endpoint": self.api_endpoint,
            "model": self.model,
            "api_key_configured": self.api_key is not None,
            "environment": "stigmergy" if self.is_stigmergy else "standard"
        }
        
        return info


# 便捷函数
def get_host_cli_interface() -> HostCLIInterface:
    """获取宿主CLI LLM接口"""
    return HostCLIInterface()


def main():
    """主函数 - 测试宿主CLI接口"""
    import argparse
    
    parser = argparse.ArgumentParser(description="宿主CLI LLM接口测试")
    parser.add_argument("--test-call", action="store_true", help="测试LLM调用")
    parser.add_argument("--test-model-info", action="store_true", help="获取模型信息")
    
    args = parser.parse_args()
    
    # 获取接口
    interface = get_host_cli_interface()
    
    # 显示模型信息
    print("\n模型信息:")
    print("="*70)
    info = interface.get_model_info()
    for key, value in info.items():
        print(f"{key}: {value}")
    print("="*70)
    
    # 测试调用
    if args.test_call:
        print("\n测试LLM调用:")
        print("="*70)
        
        messages = [
            {"role": "system", "content": "你是一位数字化转型专家。"},
            {"role": "user", "content": "请简要说明数字化转型的重要性。"}
        ]
        
        result = interface.complete(messages)
        print("\n响应:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("\n" + "="*70)
    
    if args.test_model_info:
        print("\n模型信息:")
        print("="*70)
        print(json.dumps(interface.get_model_info(), ensure_ascii=False, indent=2))
        print("="*70)


if __name__ == "__main__":
    main()
