#!/usr/bin/env python3
"""
数字化转型分析器 - 使用宿主CLI的LLM能力
直接利用宿主CLI的LLM调用接口、API入口、模型和KEY
"""

import json
import os
import subprocess
import logging
from typing import Dict, Any, List, Optional

# 配置日志（仅错误级别）
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


class DigitalTransformationAnalyzerHostCLI:
    """数字化转型分析器 - 直接使用宿主CLI的LLM能力"""

    def __init__(self):
        """初始化分析器"""
        self._get_host_cli_config()
        self._validate_config()
        logger.info(f"基于宿主CLI的数字化转型分析器初始化完成，模型: {self.model}")

    def _get_host_cli_config(self):
        """获取宿主CLI配置"""
        # 方式1: 优先从环境变量获取宿主CLI配置
        self.host_cli_command = os.environ.get('HOST_CLI_LLM_COMMAND')
        self.api_endpoint = os.environ.get('HOST_CLI_LLM_API_ENDPOINT')
        self.model = os.environ.get('HOST_CLI_LLM_MODEL', 'gpt-4')
        self.api_key = os.environ.get('HOST_CLI_LLM_API_KEY')

        # 方式2: 如果环境变量没有，尝试检测宿主CLI
        if not self.host_cli_command:
            self._auto_detect_host_cli()

        logger.info(f"宿主CLI配置: command={self.host_cli_command}, endpoint={self.api_endpoint}, model={self.model}")

    def _auto_detect_host_cli(self):
        """自动检测宿主CLI"""
        logger.info("自动检测宿主CLI...")

        # 常见的宿主CLI命令
        possible_clis = [
            'llm',          # 通用LLM CLI
            'gpt', 'openai',   # OpenAI相关
            'claude', 'anthropic',  # Anthropic相关
            'ollama',         # Ollama CLI
            'qwen', 'dashscope',   # 通义千问相关
            'zhipu', 'hunyuan',  # 智谱相关
            'gemini', 'google'     # Google Gemini相关
            'tongyi', 'deepseek'     # 其他国内模型
        ]

        for cli in possible_clis:
            if self._check_cli_available(cli):
                self.host_cli_command = cli
                logger.info(f"检测到可用的CLI命令: {cli}")
                break

        # 如果没有检测到CLI，使用默认的llm命令
        if not self.host_cli_command:
            self.host_cli_command = 'llm'  # 使用通用LLM CLI
            logger.info("使用默认的LLM CLI命令")

    def _check_cli_available(self, cli: str) -> bool:
        """检查CLI是否可用"""
        try:
            result = subprocess.run(
                [cli, '--help'],
                capture_output=True,
                text=True,
                timeout=5,
                check=True
            )
            return result.returncode == 0
        except:
            return False

    def _validate_config(self):
        """验证配置"""
        issues = []

        # 验证API端点
        if not self.api_endpoint:
            issues.append("API端点未配置，请设置 HOST_CLI_LLM_API_ENDPOINT 环境变量")
        elif not self.api_endpoint.startswith(('http://', 'https://')):
            issues.append(f"API端点格式无效，应为 http:// 或 https:// 格式，当前: {self.api_endpoint}")

        # 验证模型
        if not self.model:
            issues.append("模型未配置，请设置 HOST_CLI_LLM_MODEL 环境变量")

        # 对于OpenAI API，必须有API密钥
        if self.api_endpoint and 'openai' in self.api_endpoint.lower():
            if not self.api_key:
                issues.append("OpenAI API端点需要配置 HOST_CLI_LLM_API_KEY 环境变量")

        if issues:
            for issue in issues:
                logger.error(f"配置问题: {issue}")

    def _call_host_cli(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        调用宿主CLI的LLM能力

        Args:
            messages: 消息列表
            **kwargs: 额外参数

        Returns:
            LLM响应结果
        """
        try:
            # 提取参数
            temperature = kwargs.get('temperature', 0.7)
            max_tokens = kwargs.get('max_tokens', 2000)

            # 构建CLI命令
            if self.host_cli_command:
                # 方式1: 通过宿主CLI命令调用
                return self._call_via_cli_command(messages, temperature, max_tokens)
            else:
                # 方式2: 通过API直接调用
                return self._call_via_api_endpoint(messages, temperature, max_tokens)

        except Exception as e:
            logger.error(f"调用宿主CLI失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "error_type": "host_cli_call_failed"
            }

    def _call_via_cli_command(self, messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> Dict[str, Any]:
        """
        通过宿主CLI命令调用LLM

        Args:
            messages: 消息列表
            temperature: 温度
            max_tokens: 最大tokens

        Returns:
            LLM响应结果
        """
        try:
            # 构建CLI命令
            cli_args = [self.host_cli_command]

            # 添加模型参数
            cli_args.extend(['--model', self.model])

            # 添加API端点和密钥（如果配置）
            if self.api_endpoint:
                cli_args.extend(['--endpoint', self.api_endpoint])
            if self.api_key:
                cli_args.extend(['--api-key', self.api_key])

            # 添加生成参数
            cli_args.extend(['--temperature', str(temperature)])
            cli_args.extend(['--max-tokens', str(max_tokens)])
            cli_args.extend(['--format', 'json'])

            # 将消息转换为CLI提示词
            prompt = self._messages_to_cli_prompt(messages)

            # 添加提示词
            cli_args.extend(['--prompt', prompt])

            # 执行CLI命令
            logger.info(f"执行宿主CLI命令: {' '.join(cli_args[:8])} ...")

            result = subprocess.run(
                cli_args,
                capture_output=True,
                text=True,
                timeout=300,
                check=True
            )

            if result.returncode != 0:
                raise Exception(
                    f"CLI命令执行失败，返回码: {result.returncode}, 错误: {result.stderr}"
                )

            # 解析CLI输出
            logger.info(f"CLI输出（前200字符）: {result.stdout[:200]}")

            # 尝试解析为JSON
            try:
                llm_result = json.loads(result.stdout)

                # 提取内容（兼容不同的CLI输出格式）
                if 'response' in llm_result:
                    content = llm_result['response']
                elif 'content' in llm_result:
                    content = llm_result['content']
                elif 'choices' in llm_result and len(llm_result['choices']) > 0:
                    content = llm_result['choices'][0]['message']['content']
                else:
                    # 如果找不到内容字段，返回原始输出
                    content = result.stdout

                return {
                    "success": True,
                    "content": content,
                    "raw_output": result.stdout,
                    "model": self.model
                }

            except json.JSONDecodeError:
                # 如果不是标准JSON，尝试提取文本内容
                # 假设LLM直接返回文本
                return {
                    "success": True,
                    "content": result.stdout,
                    "raw_output": result.stdout,
                    "model": self.model
                }

        except subprocess.TimeoutExpired:
            raise Exception("CLI命令执行超时")

    def _call_via_api_endpoint(self, messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> Dict[str, Any]:
        """
        通过API端点直接调用LLM

        Args:
            messages: 消息列表
            temperature: 温度
            max_tokens: 最大tokens

        Returns:
            LLM响应结果
        """
        try:
            import requests

            headers = {
                "Content-Type": "application/json"
            }

            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            # 构建请求体
            # 根据不同的API端点使用不同的格式
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }

            logger.info(f"通过API端点调用LLM: {self.api_endpoint}")

            # 发送请求
            response = requests.post(
                f"{self.api_endpoint}/chat/completions",
                headers=headers,
                json=payload,
                timeout=300
            )

            if response.status_code != 200:
                raise Exception(
                    f"API请求失败，状态码: {response.status_code}, 错误: {response.text}"
                )

            llm_result = response.json()

            return {
                "success": True,
                "content": llm_result["choices"][0]["message"]["content"],
                "raw_output": json.dumps(llm_result),
                "model": llm_result.get("model", self.model),
                "usage": llm_result.get("usage", {}),
                "api_endpoint": self.api_endpoint
            }

        except Exception as e:
            logger.error(f"API调用失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "error_type": "api_call_failed"
            }

    def _messages_to_cli_prompt(self, messages: List[Dict[str, str]]) -> str:
        """
        将消息列表转换为CLI提示词格式

        Args:
            messages: 消息列表

        Returns:
            CLI提示词
        """
        prompt_parts = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                prompt_parts.append(f"## 系统提示\n{content}\n")
            elif role == "user":
                prompt_parts.append(f"## 用户输入\n{content}\n")
            elif role == "assistant":
                prompt_parts.append(f"## 助手输出\n{content}\n")

        return '\n'.join(prompt_parts)

    def deconstruct_business_scene(self, business_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        业务场景解构分析 - 使用宿主CLI的LLM能力

        Args:
            business_context: 业务场景上下文

        Returns:
            解构分析结果（严格JSON）
        """
        # 构建系统提示
        system_prompt = f"""你是一位资深的数字化转型咨询专家，专长于使用DEEP-SCAN五层解构模型分析业务场景。

你的任务是使用DEEP-SCAN框架（五层解构模型）对业务场景进行深度分析。

DEEP-SCAN框架包括：
1. 价值流层（Value Flow Layer）：价值创造、传递、捕获、分配
2. 资源要素层（Resource Element Layer）：有形资源、无形资源、人力资源、组织资源
3. 活动网络层（Activity Network Layer）：核心活动、支持活动、管理活动、连接活动
4. 连接关系层（Connection Relationship Layer）：物理连接、信息连接、价值连接、认知连接
5. 生态系统环境层（Ecosystem Environment Layer）：技术环境、市场环境、政策环境、社会环境

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 不包含任何解释性文字
- 只返回JSON对象"""

        # 构建用户提示
        user_prompt = f"""请对以下业务场景进行全面的解构分析：

业务场景信息：
{json.dumps(business_context, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "business_scene_deconstruction",
    "business_context_summary": "对业务场景的简要总结",
    "deconstruction_analysis": {{
        "value_flow_layer": {{
            "value_creation": "分析价值是如何创造的",
            "value_delivery": "分析价值是如何传递的",
            "value_capture": "分析各参与方如何获取价值",
            "value_distribution": "分析价值在生态中的分配逻辑"
        }},
        "resource_element_layer": {{
            "tangible_resources": "分析有形资源的使用情况",
            "intangible_resources": "分析无形资源的运用情况",
            "human_resources": "分析人力资源的能力和配置",
            "organizational_resources": "分析组织资源和文化"
        }},
        "activity_network_layer": {{
            "core_activities": "识别和分析核心价值创造活动",
            "support_activities": "识别和分析支持活动",
            "management_activities": "识别和分析管理协调活动",
            "connection_activities": "识别和分析连接协调活动"
        }},
        "connection_relationship_layer": {{
            "physical_connection": "分析实物流动和连接",
            "information_connection": "分析数据和信息流动",
            "value_connection": "分析交易和利益关联",
            "cognitive_connection": "分析认知、信任和文化关联"
        }},
        "ecosystem_environment_layer": {{
            "technology_environment": "分析技术环境和发展趋势",
            "market_environment": "分析市场需求和竞争环境",
            "policy_environment": "分析政策法规环境",
            "social_environment": "分析社会文化和价值观环境"
        }}
    }},
    "expert_analysis": {{
        "digital_transformation_consultant": {{
            "strategic_value": "从战略角度评估数字化的价值",
            "competitive_advantage": "分析数字化如何构建竞争优势",
            "transformation_risk": "识别数字化转型的风险",
            "success_factors": "分析数字化成功的关键因素"
        }},
        "digital_economist": {{
            "cost_structure": "分析数字化对成本结构的影响",
            "value_creation": "分析数字化如何创造新价值",
            "network_effects": "分析数字化带来的网络效应",
            "platform_economics": "分析数字化促进平台化的可能性"
        }},
        "digital_philosopher": {{
            "ontology": "分析数字化如何改变事物的存在方式",
            "epistemology": "分析数字化如何改变认知方式",
            "axiology": "分析数字化如何重新定义价值",
            "space_time": "分析数字化如何重塑时空概念"
        }},
        "industrial_internet_expert": {{
            "industry_chain_coordination": "分析产业链协同的机会",
            "platform_construction": "分析平台建设的可能性",
            "ecosystem_network": "分析生态网络的构建逻辑",
            "standard_setting": "分析标准制定的机会"
        }},
        "ai_expert": {{
            "data_element": "分析数据价值挖掘的机会",
            "algorithm_application": "分析AI算法应用的可能",
            "automation_potential": "分析流程自动化的潜力",
            "intelligent_decision": "分析智能决策的空间"
        }},
        "business_model_reconstruction_expert": {{
            "value_proposition": "分析价值主张的重塑",
            "revenue_model": "分析收入模式的创新",
            "key_resources": "分析关键资源的变化",
            "channel_path": "分析渠道路径的优化"
        }}
    }},
    "innovation_opportunities": [
        {{
            "type": "创新类型",
            "description": "详细描述创新机会",
            "potential_value": "评估潜在价值",
            "feasibility": "评估可行性"
        }}
    ]
}}

重要提示：
1. 所有分析都必须基于提供的具体业务场景信息
2. 识别的创新机会要具体、有洞察力
3. 评估要客观、基于事实
4. 必须返回有效的JSON格式"""

        # 构建消息列表
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        # 调用宿主CLI的LLM
        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        # 解析响应
        try:
            content = response["content"]
            result = json.loads(content)

            # 添加元数据
            result["business_context"] = business_context
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result

        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")
            logger.error(f"LLM响应: {response}")

            return {
                "analysis_type": "business_scene_deconstruction",
                "business_context": business_context,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def deconstruct_digitization(self, digitization_context: Dict[str, Any]) -> Dict[str, Any]:
        """数字化解构分析"""
        messages = [
            {"role": "system", "content": "你是一位数字化转型专家，专长于分析企业的数字化机会和挑战。"},
            {"role": "user", "content": f"请对以下企业的数字化情况进行深入分析：\n\n{json.dumps(digitization_context, ensure_ascii=False, indent=2)}"}
        ]

        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        try:
            content = response["content"]
            result = json.loads(content)

            result["digitization_context"] = digitization_context
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")

            return {
                "analysis_type": "digitization_deconstruction",
                "digitization_context": digitization_context,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def deconstruct_online_transformation(self, online_context: Dict[str, Any]) -> Dict[str, Any]:
        """在线化解构分析"""
        messages = [
            {"role": "system", "content": "你是一位在线化和数字化转型专家，专长于分析企业如何通过在线化实现业务增长和客户连接。"},
            {"role": "user", "content": f"请对以下企业的在线化情况进行深入分析：\n\n{json.dumps(online_context, ensure_ascii=False, indent=2)}"}
        ]

        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        try:
            content = response["content"]
            result = json.loads(content)

            result["online_context"] = online_context
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")

            return {
                "analysis_type": "online_transformation_deconstruction",
                "online_context": online_context,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def deconstruct_intelligent_transformation(self, intelligent_context: Dict[str, Any]) -> Dict[str, Any]:
        """智能化解构分析"""
        messages = [
            {"role": "system", "content": "你是一位AI和智能化转型专家，专长于分析企业如何应用AI和数据智能实现业务创新和效率提升。"},
            {"role": "user", "content": f"请对以下企业的智能化情况进行深入分析：\n\n{json.dumps(intelligent_context, ensure_ascii=False, indent=2)}"}
        ]

        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        try:
            content = response["content"]
            result = json.loads(content)

            result["intelligent_context"] = intelligent_context
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")

            return {
                "analysis_type": "intelligent_transformation_deconstruction",
                "intelligent_context": intelligent_context,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def identify_innovation_niche(self, deconstruction_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """创新利基识别"""
        # 提取关键信息
        insights_summary = []
        for result in deconstruction_results:
            analysis_type = result.get("analysis_type", "unknown")
            insights_summary.append(f"- {analysis_type}分析结果")

        messages = [
            {
                "role": "system",
                "content": "你是一位商业创新专家，专长于识别企业转型中的创新利基和机会。"
            },
            {
                "role": "user",
                "content": f"请基于以下解构分析结果，识别最有价值的创新利基：\n\n解构分析摘要：\n{chr(10).join(insights_summary)}\n\n完整的解构分析结果：\n\n{json.dumps(deconstruction_results, ensure_ascii=False, indent=2)}"
            }
        ]

        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        try:
            content = response["content"]
            result = json.loads(content)

            result["deconstruction_results"] = deconstruction_results
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")

            return {
                "analysis_type": "innovation_niche_identification",
                "deconstruction_results": deconstruction_results,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def reconstruct_business_model(self, niche_context: Dict[str, Any]) -> Dict[str, Any]:
        """商业模式重构"""
        messages = [
            {
                "role": "system",
                "content": "你是一位商业模式创新专家，专长于设计数字时代的新型商业模式。"
            },
            {
                "role": "user",
                "content": f"请基于以下创新利基，设计创新的商业模式：\n\n创新利基信息：\n{json.dumps(niche_context, ensure_ascii=False, indent=2)}"
            }
        ]

        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        try:
            content = response["content"]
            result = json.loads(content)

            result["niche_context"] = niche_context
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")

            return {
                "analysis_type": "business_model_reconstruction",
                "niche_context": niche_context,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def plan_business_innovation_pathway(self, innovation_context: Dict[str, Any]) -> Dict[str, Any]:
        """业务创新路径规划"""
        messages = [
            {
                "role": "system",
                "content": "你是一位创新管理专家，专长于规划企业创新项目的实施路径。"
            },
            {
                "role": "user",
                "content": f"请基于以下创新上下文，设计详细的业务创新路径：\n\n创新上下文信息：\n\n{json.dumps(innovation_context, ensure_ascii=False, indent=2)}"
            }
        ]

        response = self._call_host_cli(messages, temperature=0.8, max_tokens=4000)

        try:
            content = response["content"]
            result = json.loads(content)

            result["innovation_context"] = innovation_context
            result["llm_type"] = "host_cli"
            result["host_cli_info"] = {
                "cli_command": self.host_cli_command,
                "api_endpoint": self.api_endpoint,
                "model": self.model
            }

            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")

            return {
                "analysis_type": "business_innovation_pathway_planning",
                "innovation_context": innovation_context,
                "error": "LLM返回的JSON格式无效",
                "raw_response": response.get("content", response.get("raw_output", "")),
                "llm_info": {
                    "cli_command": self.host_cli_command,
                    "api_endpoint": self.api_endpoint,
                    "model": self.model
                }
            }

    def execute_analysis(self, analysis_type: AnalysisType, context: Dict[str, Any]) -> Dict[str, Any]:
        """执行分析"""
        if analysis_type == AnalysisType.BUSINESS_SCENE_DECONSTRUCTION:
            return self.deconstruct_business_scene(context)
        elif analysis_type == AnalysisType.DIGITIZATION_DECONSTRUCTION:
            return self.deconstruct_digitization(context)
        elif analysis_type == AnalysisType.ONLINE_TRANSFORMATION_DECONSTRUCTION:
            return self.deconstruct_online_transformation(context)
        elif analysis_type == AnalysisType.INTELLIGENT_TRANSFORMATION_DECONSTRUCTION:
            return self.deconstruct_intelligent_transformation(context)
        elif analysis_type == AnalysisType.INNOVATION_NICHE_IDENTIFICATION:
            deconstruction_results = context.get("deconstruction_results", [context])
            return self.identify_innovation_niche(deconstruction_results)
        elif analysis_type == AnalysisType.BUSINESS_MODEL_RECONSTRUCTION:
            return self.reconstruct_business_model(context)
        elif analysis_type == AnalysisType.BUSINESS_INNOVATION_PATHWAY_PLANNING:
            return self.plan_business_innovation_pathway(context)
        else:
            raise ValueError(f"不支持的分析类型: {analysis_type}")


# 便捷函数
def analyze_with_host_cli_llm(
    analysis_type: str,
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """
    便捷的宿主CLI LLM分析函数

    Args:
        analysis_type: 分析类型
        context: 分析上下文

    Returns:
        分析结果（严格JSON）
    """
    # 初始化分析器
    analyzer = DigitalTransformationAnalyzerHostCLI()

    # 执行分析
    return analyzer.execute_analysis(analysis_type, context)


def main():
    """主函数 - 测试基于宿主CLI的数字化转型分析"""
    import argparse

    parser = argparse.ArgumentParser(description="基于宿主CLI的数字化转型分析工具")
    parser.add_argument("analysis_type", type=str, help="分析类型")
    parser.add_argument("--context", type=str, help="分析上下文(JSON格式)")
    parser.add_argument("--input_file", type=str, help="输入文件路径")
    parser.add_argument("--output_file", type=str, help="输出文件路径")

    args = parser.parse_args()

    # 初始化分析器
    analyzer = DigitalTransformationAnalyzerHostCLI()

    # 准备上下文
    context = {}
    if args.context:
        context = json.loads(args.context)
    elif args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            context = json.load(f)
    else:
        # 默认示例上下文
        context = {
            "business_scenario": "示例业务场景",
            "company_name": "示例公司",
            "industry": "制造业",
            "transformation_objectives": ["数字化", "在线化", "智能化"]
        }

    try:
        # 执行分析
        print(f"\n{'='*70}")
        print(f"基于宿主CLI的数字化转型分析: {args.analysis_type}")
        print(f"CLI命令: {analyzer.host_cli_command}")
        print(f"API端点: {analyzer.api_endpoint}")
        print(f"模型: {analyzer.model}")
        print(f"{'='*70}\n")

        analysis_type = AnalysisType(args.analysis_type)
        result = analyzer.execute_analysis(analysis_type, context)

        # 输出结果（严格JSON）
        if args.output_file:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"分析结果已保存到: {args.output_file}")
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))

    except ValueError as e:
        print(f"\n错误: {e}")
        print("\n支持的分析类型:")
        for analysis_type in AnalysisType:
            print(f"  - {analysis_type.value}")
    except Exception as e:
        print(f"\n执行分析时发生错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
