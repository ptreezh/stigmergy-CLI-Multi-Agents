#!/usr/bin/env python3
"""
LLM客户端适配器
支持多种LLM提供商（OpenAI、Claude、本地模型等）
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional, Union
from abc import ABC, abstractmethod
import time

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMClient(ABC):
    """LLM客户端抽象基类"""

    @abstractmethod
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        聊天完成接口

        Args:
            messages: 消息列表，格式为[{"role": "user", "content": "..."}]
            temperature: 温度参数，控制输出的随机性
            max_tokens: 最大生成token数

        Returns:
            LLM响应结果
        """
        pass

    @abstractmethod
    def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """
        流式聊天完成接口

        Args:
            messages: 消息列表
            temperature: 温度参数
            max_tokens: 最大生成token数

        Yields:
            生成的内容片段
        """
        pass


class OpenAIClient(LLMClient):
    """OpenAI客户端"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gpt-4",
        base_url: Optional[str] = None
    ):
        """
        初始化OpenAI客户端

        Args:
            api_key: OpenAI API密钥
            model: 模型名称
            base_url: 自定义API地址（可选）
        """
        try:
            import openai
        except ImportError:
            raise ImportError(
                "请安装openai库: pip install openai"
            )

        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("请提供OpenAI API密钥")

        self.model = model
        self.base_url = base_url

        # 初始化OpenAI客户端
        self.client = openai.OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

        logger.info(f"OpenAI客户端初始化完成，模型: {model}")

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """聊天完成"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            return {
                "success": True,
                "content": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "model": response.model
            }
        except Exception as e:
            logger.error(f"OpenAI API调用失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """流式聊天完成"""
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"OpenAI流式API调用失败: {e}")
            yield f"错误: {str(e)}"


class AnthropicClient(LLMClient):
    """Anthropic (Claude) 客户端"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-3-opus-20240229"
    ):
        """
        初始化Anthropic客户端

        Args:
            api_key: Anthropic API密钥
            model: 模型名称
        """
        try:
            import anthropic
        except ImportError:
            raise ImportError(
                "请安装anthropic库: pip install anthropic"
            )

        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("请提供Anthropic API密钥")

        self.model = model

        # 初始化Anthropic客户端
        self.client = anthropic.Anthropic(api_key=self.api_key)

        logger.info(f"Anthropic客户端初始化完成，模型: {model}")

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """聊天完成"""
        try:
            # 将OpenAI格式转换为Anthropic格式
            system_message = None
            user_message = None

            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                elif msg["role"] == "user":
                    user_message = msg["content"]

            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_message or "",
                messages=[{"role": "user", "content": user_message or ""}]
            )

            return {
                "success": True,
                "content": response.content[0].text,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                },
                "model": response.model
            }
        except Exception as e:
            logger.error(f"Anthropic API调用失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """流式聊天完成"""
        try:
            # 将OpenAI格式转换为Anthropic格式
            system_message = None
            user_message = None

            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                elif msg["role"] == "user":
                    user_message = msg["content"]

            with self.client.messages.stream(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_message or "",
                messages=[{"role": "user", "content": user_message or ""}]
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except Exception as e:
            logger.error(f"Anthropic流式API调用失败: {e}")
            yield f"错误: {str(e)}"


class OllamaClient(LLMClient):
    """Ollama客户端（本地模型）"""

    def __init__(
        self,
        model: str = "llama2",
        base_url: str = "http://localhost:11434"
    ):
        """
        初始化Ollama客户端

        Args:
            model: 模型名称
            base_url: Ollama服务地址
        """
        try:
            import requests
        except ImportError:
            raise ImportError(
                "请安装requests库: pip install requests"
            )

        self.model = model
        self.base_url = base_url.rstrip('/')

        # 测试连接
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                logger.warning(f"无法连接到Ollama服务: {self.base_url}")
        except Exception as e:
            logger.warning(f"Ollama服务连接测试失败: {e}")

        logger.info(f"Ollama客户端初始化完成，模型: {model}")

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """聊天完成"""
        import requests

        try:
            # 构建提示词
            prompt = ""
            for msg in messages:
                if msg["role"] == "system":
                    prompt += f"System: {msg['content']}\n"
                elif msg["role"] == "user":
                    prompt += f"User: {msg['content']}\n"
                elif msg["role"] == "assistant":
                    prompt += f"Assistant: {msg['content']}\n"

            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=300
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "content": data.get("response", ""),
                    "model": self.model
                }
            else:
                return {
                    "success": False,
                    "error": f"Ollama API错误: {response.status_code}"
                }
        except Exception as e:
            logger.error(f"Ollama API调用失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """流式聊天完成"""
        import requests

        try:
            # 构建提示词
            prompt = ""
            for msg in messages:
                if msg["role"] == "system":
                    prompt += f"System: {msg['content']}\n"
                elif msg["role"] == "user":
                    prompt += f"User: {msg['content']}\n"
                elif msg["role"] == "assistant":
                    prompt += f"Assistant: {msg['content']}\n"

            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                stream=True,
                timeout=300
            )

            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]
        except Exception as e:
            logger.error(f"Ollama流式API调用失败: {e}")
            yield f"错误: {str(e)}"


class QwenClient(LLMClient):
    """通义千问客户端"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "qwen-turbo",
        base_url: Optional[str] = None
    ):
        """
        初始化通义千问客户端

        Args:
            api_key: 阿里云API密钥
            model: 模型名称
            base_url: 自定义API地址（可选）
        """
        try:
            import openai
        except ImportError:
            raise ImportError(
                "请安装openai库: pip install openai"
            )

        self.api_key = api_key or os.environ.get("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError("请提供阿里云API密钥")

        self.model = model
        self.base_url = base_url or "https://dashscope.aliyuncs.com/compatible-mode/v1"

        # 初始化OpenAI兼容客户端
        self.client = openai.OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

        logger.info(f"通义千问客户端初始化完成，模型: {model}")

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """聊天完成"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            return {
                "success": True,
                "content": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "model": response.model
            }
        except Exception as e:
            logger.error(f"通义千问API调用失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """流式聊天完成"""
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"通义千问流式API调用失败: {e}")
            yield f"错误: {str(e)}"


class LLMClientFactory:
    """LLM客户端工厂"""

    @staticmethod
    def create_client(
        provider: str = "openai",
        **kwargs
    ) -> LLMClient:
        """
        创建LLM客户端

        Args:
            provider: 提供商名称 (openai, anthropic, ollama, qwen)
            **kwargs: 传递给客户端构造函数的参数

        Returns:
            LLM客户端实例
        """
        provider = provider.lower()

        if provider == "openai":
            return OpenAIClient(**kwargs)
        elif provider == "anthropic":
            return AnthropicClient(**kwargs)
        elif provider == "ollama":
            return OllamaClient(**kwargs)
        elif provider == "qwen":
            return QwenClient(**kwargs)
        else:
            raise ValueError(f"不支持的LLM提供商: {provider}")

    @staticmethod
    def auto_detect_client(
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> LLMClient:
        """
        自动检测并创建客户端

        Args:
            api_key: API密钥（可选）
            model: 模型名称（可选）

        Returns:
            LLM客户端实例
        """
        # 按优先级尝试不同的提供商
        providers = [
            ("openai", {"api_key": api_key, "model": model or "gpt-4"}),
            ("anthropic", {"api_key": api_key, "model": model or "claude-3-opus-20240229"}),
            ("qwen", {"api_key": api_key, "model": model or "qwen-turbo"}),
            ("ollama", {"model": model or "llama2"})
        ]

        for provider_name, kwargs in providers:
            try:
                client = LLMClientFactory.create_client(provider_name, **kwargs)
                # 测试客户端是否可用
                test_response = client.chat_completion(
                    messages=[{"role": "user", "content": "测试"}],
                    max_tokens=10
                )
                if test_response.get("success"):
                    logger.info(f"自动检测到可用的LLM提供商: {provider_name}")
                    return client
            except Exception as e:
                logger.debug(f"提供商 {provider_name} 不可用: {e}")
                continue

        raise ValueError("未找到可用的LLM提供商，请检查API密钥或配置")


# 便捷函数
def chat_with_llm(
    prompt: str,
    system_prompt: Optional[str] = None,
    provider: str = "openai",
    temperature: float = 0.7,
    max_tokens: int = 2000,
    **kwargs
) -> str:
    """
    便捷的LLM聊天函数

    Args:
        prompt: 用户提示词
        system_prompt: 系统提示词（可选）
        provider: LLM提供商
        temperature: 温度参数
        max_tokens: 最大生成token数
        **kwargs: 传递给客户端的其他参数

    Returns:
        LLM响应内容
    """
    client = LLMClientFactory.create_client(provider, **kwargs)

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    response = client.chat_completion(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )

    if response.get("success"):
        return response["content"]
    else:
        raise Exception(f"LLM调用失败: {response.get('error')}")


def main():
    """主函数 - 测试LLM客户端"""
    import sys

    # 检查命令行参数
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python llm_client.py <provider> [model]")
        print("\n示例:")
        print("  python llm_client.py openai gpt-4")
        print("  python llm_client.py anthropic claude-3-opus-20240229")
        print("  python llm_client.py ollama llama2")
        print("  python llm_client.py qwen qwen-turbo")
        return

    provider = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        # 创建客户端
        client = LLMClientFactory.create_client(provider, model=model)

        # 测试聊天
        messages = [
            {"role": "system", "content": "你是一个数字化转型专家。"},
            {"role": "user", "content": "请简述数字化转型的重要性。"}
        ]

        print(f"\n使用 {provider} ({model}) 进行测试...\n")
        print("="*70)

        response = client.chat_completion(messages, max_tokens=500)

        if response.get("success"):
            print(f"\n{response['content']}")
            print("\n" + "="*70)
            print(f"\n使用统计:")
            print(f"  模型: {response.get('model')}")
            if "usage" in response:
                print(f"  输入tokens: {response['usage'].get('prompt_tokens')}")
                print(f"  输出tokens: {response['usage'].get('completion_tokens')}")
                print(f"  总tokens: {response['usage'].get('total_tokens')}")
        else:
            print(f"\n错误: {response.get('error')}")

    except Exception as e:
        print(f"\n错误: {e}")


if __name__ == "__main__":
    main()
