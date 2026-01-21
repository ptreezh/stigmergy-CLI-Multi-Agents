#!/usr/bin/env python3
"""
宿主LLM集成模块
直接使用宿主LLM的原生能力，无需脚本调用
"""

import logging
from typing import Dict, Any, List, Optional
import json

# 配置日志（只记录错误，不输出额外文本）
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


class HostLLMIntegration:
    """宿主LLM集成器 - 直接使用宿主LLM的原生能力"""

    def __init__(self):
        """
        初始化宿主LLM集成器
        通过环境变量或全局变量获取宿主LLM接口
        """
        # 这里通过全局方式获取宿主LLM
        # 宿主环境会提供LLM接口，我们直接调用
        self.llm_interface = self._get_host_llm_interface()

    def _get_host_llm_interface(self):
        """获取宿主LLM接口"""
        try:
            # 方式1: 从全局变量获取（Stigmergy框架提供）
            if 'HOST_LLM_INTERFACE' in globals():
                return globals()['HOST_LLM_INTERFACE']

            # 方式2: 从环境变量获取接口模块路径
            import os
            interface_path = os.environ.get('HOST_LLM_INTERFACE_PATH')
            if interface_path:
                module_name = interface_path.split('.')[-1]
                spec = __import__('importlib.util').spec_from_file_location(module_name, interface_path)
                module = __import__('importlib.util').module_from_spec(spec)
                if hasattr(module, 'get_llm_interface'):
                    return module.get_llm_interface()
                return module

            # 方式3: 尝试直接导入（如果宿主LLM是已知模块）
            # 这里不实现，因为我们不知道宿主LLM的具体接口

            logger.warning("无法直接获取宿主LLM接口，使用模拟接口")
            return self._create_mock_interface()

        except Exception as e:
            logger.error(f"获取宿主LLM接口失败: {e}")
            return self._create_mock_interface()

    def _create_mock_interface(self):
        """创建模拟LLM接口（用于测试）"""
        class MockLLMInterface:
            """模拟LLM接口"""

            @staticmethod
            def complete(
                messages: List[Dict[str, str]],
                **kwargs
            ) -> Dict[str, Any]:
                """模拟聊天完成"""
                # 返回模拟响应
                return {
                    "choices": [
                        {
                            "message": {
                                "role": "assistant",
                                "content": "这是模拟的LLM响应。实际使用时，这个接口会被宿主环境的真实LLM接口替换。"
                            },
                            "finish_reason": "stop"
                        }
                    ],
                    "usage": {
                        "prompt_tokens": 100,
                        "completion_tokens": 200,
                        "total_tokens": 300
                    }
                }

        return MockLLMInterface()

    def chat(
        self,
        messages: List[Dict[str, str]],
        **kwargs
    ) -> Dict[str, Any]:
        """
        直接调用宿主LLM进行对话

        Args:
            messages: 消息列表，格式为[{"role": "user", "content": "..."}]
            **kwargs: 额外参数（温度、max_tokens等）

        Returns:
            LLM响应结果
        """
        try:
            # 直接调用宿主LLM接口的complete方法
            response = self.llm_interface.complete(messages, **kwargs)

            return {
                "success": True,
                "content": response["choices"][0]["message"]["content"],
                "usage": response.get("usage", {}),
                "model": response.get("model", "host-llm")
            }
        except Exception as e:
            logger.error(f"调用宿主LLM失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def chat_with_json_output(
        self,
        messages: List[Dict[str, str]],
        **kwargs
    ) -> Dict[str, Any]:
        """
        调用宿主LLM并要求返回JSON格式

        Args:
            messages: 消息列表
            **kwargs: 额外参数

        Returns:
            解析后的JSON结果
        """
        try:
            # 在系统提示中添加JSON格式要求
            if messages and messages[0].get("role") == "system":
                messages[0]["content"] += "\n\n重要：你必须严格按照JSON格式返回结果，不要包含任何JSON之外的文字。"
            else:
                # 在最前面插入系统消息
                messages.insert(0, {
                    "role": "system",
                    "content": "你必须严格按照JSON格式返回结果，不要包含任何JSON之外的文字。"
                })

            # 调用宿主LLM
            response = self.chat(messages, **kwargs)

            if not response.get("success"):
                return {
                    "success": False,
                    "error": response.get("error")
                }

            # 解析JSON
            try:
                json_result = json.loads(response["content"])

                # 添加元数据
                json_result["metadata"] = {
                    "llm_type": "host_llm",
                    "usage": response.get("usage", {})
                }

                return {
                    "success": True,
                    "result": json_result
                }

            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                return {
                    "success": False,
                    "error": f"LLM返回的不是有效JSON: {e}",
                    "raw_content": response["content"]
                }

        except Exception as e:
            logger.error(f"JSON输出处理失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def stream_chat(
        self,
        messages: List[Dict[str, str]],
        **kwargs
    ):
        """
        流式调用宿主LLM

        Args:
            messages: 消息列表
            **kwargs: 额外参数

        Yields:
            生成的内容片段
        """
        try:
            # 检查宿主LLM是否支持流式
            if hasattr(self.llm_interface, 'stream_complete'):
                stream = self.llm_interface.stream_complete(messages, **kwargs)

                for chunk in stream:
                    if "choices" in chunk and "delta" in chunk["choices"][0]:
                        delta = chunk["choices"][0]["delta"]
                        if "content" in delta:
                            yield delta["content"]

            else:
                # 如果不支持流式，使用普通聊天
                response = self.chat(messages, **kwargs)
                if response.get("success"):
                    yield response["content"]

        except Exception as e:
            logger.error(f"流式调用失败: {e}")
            yield f"错误: {str(e)}"


class DigitalTransformationAnalyzerHostLLM:
    """基于宿主LLM的数字化转型分析器"""

    def __init__(self):
        """初始化分析器"""
        self.llm = HostLLMIntegration()
        logger.info("基于宿主LLM的数字化转型分析器初始化完成")

    def deconstruct_business_scene(
        self,
        business_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        业务场景解构分析 - 直接使用宿主LLM

        Args:
            business_context: 业务场景上下文

        Returns:
            解构分析结果（严格JSON）
        """
        # 构建消息
        messages = [
            {
                "role": "system",
                "content": """你是一位资深的数字化转型咨询专家，专长于使用DEEP-SCAN五层解构模型分析业务场景。

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
- 基于提供的具体业务场景信息进行深入、有洞察力的分析
- 识别的创新机会要具体、可行"""
            },
            {
                "role": "user",
                "content": f"""请对以下业务场景进行全面的解构分析：

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
}}"""
            }
        ]

        # 调用宿主LLM并要求JSON输出
        response = self.llm.chat_with_json_output(messages, temperature=0.8)

        return response.get("result", response)

    def deconstruct_digitization(
        self,
        digitization_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        数字化解构分析 - 直接使用宿主LLM

        Args:
            digitization_context: 数字化上下文

        Returns:
            解构分析结果（严格JSON）
        """
        messages = [
            {
                "role": "system",
                "content": """你是一位数字化转型专家，专长于分析企业的数字化机会和挑战。
你的任务是深入分析企业的数字化现状，识别数字化转型的机会和障碍。

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 基于具体的企业信息进行深入分析"""
            },
            {
                "role": "user",
                "content": f"""请对以下企业的数字化情况进行深入分析：

企业数字化信息：
{json.dumps(digitization_context, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "digitization_deconstruction",
    "digitization_context_summary": "对数字化现状的简要总结",
    "current_digitalization_level": {{
        "overall_level": "评估当前数字化水平（初级/中级/高级）",
        "digitization_score": "数字化得分（1-10）",
        "online_score": "在线化得分（1-10）",
        "intelligent_score": "智能化得分（1-10）"
    }},
    "digitization_opportunities": {{
        "data_monetization_opportunities": [
            {{
                "opportunity": "数据货币化机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级（high/medium/low）"
            }}
        ],
        "process_optimization_opportunities": [
            {{
                "opportunity": "流程优化机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级"
            }}
        ],
        "experience_upgrade_opportunities": [
            {{
                "opportunity": "体验升级机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级"
            }}
        ],
        "ecosystem_coordination_opportunities": [
            {{
                "opportunity": "生态协同机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级"
            }}
        ]
    }},
    "digitization_challenges": [
        {{
            "challenge": "数字化挑战描述",
            "impact": "影响程度",
            "solution_suggestion": "解决建议"
        }}
    ],
    "digitization_roadmap": {{
        "short_term_goals": "短期目标（3-6个月）",
        "medium_term_goals": "中期目标（6-18个月）",
        "long_term_goals": "长期目标（18个月以上）"
    }}
}}"""
            }
        ]

        return self.llm.chat_with_json_output(messages, temperature=0.8)

    def deconstruct_online_transformation(
        self,
        online_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        在线化解构分析 - 直接使用宿主LLM

        Args:
            online_context: 在线化上下文

        Returns:
            解构分析结果（严格JSON）
        """
        messages = [
            {
                "role": "system",
                "content": """你是一位在线化和数字化转型专家，专长于分析企业如何通过在线化实现业务增长和客户连接。
你的任务是深入分析企业的在线化现状和机会。

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 基于具体的企业信息进行深入分析"""
            },
            {
                "role": "user",
                "content": f"""请对以下企业的在线化情况进行深入分析：

企业在线化信息：
{json.dumps(online_context, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "online_transformation_deconstruction",
    "online_context_summary": "对在线化现状的简要总结",
    "online_maturity_assessment": {{
        "customer_reach_maturity": "评估客户触达成熟度（初级/中级/高级）",
        "digital_interaction_maturity": "评估数字交互成熟度",
        "data_collection_maturity": "评估数据收集成熟度",
        "service_delivery_maturity": "评估服务交付成熟度"
    }},
    "online_opportunities": {{
        "reach_channel_opportunities": [
            {{
                "opportunity": "触达渠道机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级"
            }}
        ],
        "data_insight_opportunities": [
            {{
                "opportunity": "数据洞察机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级"
            }}
        ],
        "real_time_service_opportunities": [
            {{
                "opportunity": "实时服务机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "priority"
            }}
        ],
        "ecosystem_integration_opportunities": [
            {{
                "opportunity": "生态整合机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级"
            }}
        ]
    }},
    "online_transformation_strategy": {{
        "phase1_objectives": "第一阶段目标",
        "phase2_objectives": "第二阶段目标",
        "phase3_objectives": "第三阶段目标",
        "key_success_metrics": ["关键成功指标1", "关键成功指标2"]
    }}
}}"""
            }
        ]

        return self.llm.chat_with_json_output(messages, temperature=0.8)

    def deconstruct_intelligent_transformation(
        self,
        intelligent_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        智能化解构分析 - 直接使用宿主LLM

        Args:
            intelligent_context: 智能化上下文

        Returns:
            解构分析结果（严格JSON）
        """
        messages = [
            {
                "role": "system",
                "content": """你是一位AI和智能化转型专家，专长于分析企业如何应用AI和数据智能实现业务创新和效率提升。
你的任务是深入分析企业的智能化现状和机会。

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 基于具体的企业AI能力和资源进行深入分析"""
            },
            {
                "role": "user",
                "content": f"""请对以下企业的智能化情况进行深入分析：

企业智能化信息：
{json.dumps(intelligent_context, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "intelligent_transformation_deconstruction",
    "intelligent_context_summary": "对智能化现状的简要总结",
    "ai_readiness_assessment": {{
        "data_readiness": "数据就绪度评估",
        "algorithm_readiness": "算法就绪度评估",
        "infrastructure_readiness": "基础设施就绪度评估",
        "talent_readiness": "人才就绪度评估"
    }},
    "intelligent_opportunities": {{
        "intelligent_decision_opportunities": [
            {{
                "opportunity": "智能决策机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "feasibility": "可行性评估",
                "priority": "优先级"
            }}
        ],
        "prediction_analysis_opportunities": [
            {{
                "opportunity": "预测分析机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "feasibility": "可行性评估",
                "priority": "优先级"
            }}
        ],
        "personalized_service_opportunities": [
            {{
                "opportunity": "个性化服务机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "feasibility": "可行性评估",
                "priority": "优先级"
            }}
        ],
        "intelligent_platform_opportunities": [
            {{
                "opportunity": "智能平台机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "feasibility": "可行性评估",
                "priority": "优先级"
            }}
        ]
    }},
    "ai_implementation_roadmap": {{
        "foundation_building": "基础建设阶段任务",
        "pilot_deployment": "试点部署阶段任务",
        "scaling_up": "规模化推广阶段任务",
        "advanced_optimization": "高级优化阶段任务"
    }}
}}"""
            }
        ]

        return self.llm.chat_with_json_output(messages, temperature=0.8)

    def identify_innovation_niche(
        self,
        deconstruction_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        创新利基识别 - 直接使用宿主LLM

        Args:
            deconstruction_results: 解构分析结果列表

        Returns:
            创新利基识别结果（严格JSON）
        """
        # 提取关键信息
        insights_summary = []
        for result in deconstruction_results:
            analysis_type = result.get("analysis_type", "unknown")
            insights_summary.append(f"- {analysis_type}分析结果")

        messages = [
            {
                "role": "system",
                "content": """你是一位商业创新专家，专长于识别企业转型中的创新利基和机会。
你的任务是综合多个解构分析结果，识别最有价值的创新机会。

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 基于提供的完整解构分析结果进行综合分析"""
            },
            {
                "role": "user",
                "content": f"""请基于以下解构分析结果，识别最有价值的创新利基：

解构分析摘要：
{chr(10).join(insights_summary)}

完整的解构分析结果：
{json.dumps(deconstruction_results, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "innovation_niche_identification",
    "aggregated_insights": {{
        "pain_points": ["痛点1", "痛点2"],
        "demand_gaps": ["需求缺口1", "需求缺口2"],
        "supply_gaps": ["供给缺口1", "供给缺口2"],
        "ecosystem_gaps": ["生态缺口1", "生态缺口2"]
    }},
    "niche_evaluation_matrix": {{
        "market_demand_intensity": {{"score": "1-5分", "weight": "0.25", "assessment": "评估说明"}},
        "technical_feasibility": {{"score": "1-5分", "weight": "0.20", "assessment": "评估说明"}},
        "competitive_environment": {{"score": "1-5分", "weight": "0.20", "assessment": "评估说明"}},
        "commercial_value": {{"score": "1-5分", "weight": "0.20", "assessment": "评估说明"}},
        "implementation_difficulty": {{"score": "1-5分", "weight": "0.15", "assessment": "评估说明"}}
    }},
    "top_niches": [
        {{
            "name": "利基名称",
            "description": "详细描述",
            "type": "利基类型（efficiency_driven/experience_driven/model_driven/data_driven）",
            "evaluation": {{
                "market_demand": "得分",
                "technical_feasibility": "得分",
                "competitive_advantage": "得分",
                "commercial_value": "得分",
                "implementation_complexity": "得分"
            }},
            "potential_value": "潜在价值评估",
            "action_plan": "行动建议"
        }}
    ]
}}"""
            }
        ]

        return self.llm.chat_with_json_output(messages, temperature=0.8)

    def reconstruct_business_model(
        self,
        niche_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        商业模式重构 - 直接使用宿主LLM

        Args:
            niche_context: 利基上下文

        Returns:
            商业模式重构结果（严格JSON）
        """
        messages = [
            {
                "role": "system",
                "content": """你是一位商业模式创新专家，专长于设计数字时代的新型商业模式。
你的任务是基于识别的创新利基，设计创新的商业模式。

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 基于具体的创新利基设计商业模式"""
            },
            {
                "role": "user",
                "content": f"""请基于以下创新利基，设计创新的商业模式：

创新利基信息：
{json.dumps(niche_context, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "business_model_reconstruction",
    "niche_summary": "创新利基摘要",
    "business_model_reconstruction": {{
        "value_proposition": {{
            "current_state": "当前价值主张",
            "new_proposition": "新价值主张",
            "value_innovation": "价值创新说明"
        }},
        "value_creation": {{
            "current_mechanism": "当前价值创造机制",
            "new_mechanism": "新价值创造机制",
            "innovation_points": ["创新点1", "创新点2"]
        }},
        "value_delivery": {{
            "current_channels": "当前价值传递渠道",
            "new_channels": "新价值传递渠道",
            "delivery_innovation": "传递创新说明"
        }},
        "value_capture": {{
            "current_revenue_model": "当前收入模式",
            "new_revenue_model": "新收入模式",
            "revenue_streams": ["收入流1", "收入流2"],
            "pricing_strategy": "定价策略"
        }},
        "competitive_advantage": {{
            "current_advantage": "当前竞争优势",
            "new_advantage": "新竞争优势",
            "sustainability": "可持续性分析"
        }}
    }},
    "reconstruction_path": {{
        "path_type": "重构路径类型（value_added/replacement/platform/data）",
        "phases": [
            {{
                "phase": "阶段名称",
                "objectives": "目标",
                "actions": ["行动1", "行动2"],
                "expected_outcomes": "预期成果"
            }}
        ],
        "resource_requirements": ["资源需求1", "资源需求2"],
        "timeline": "实施时间表",
        "risks_and_mitigation": [
            {{
                "risk": "风险描述",
                "mitigation": "缓解措施"
            }}
        ]
    }}
}}"""
            }
        ]

        return self.llm.chat_with_json_output(messages, temperature=0.8)

    def plan_business_innovation_pathway(
        self,
        innovation_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        业务创新路径规划 - 直接使用宿主LLM

        Args:
            innovation_context: 创新上下文

        Returns:
            路径规划结果（严格JSON）
        """
        messages = [
            {
                "role": "system",
                "content": """你是一位创新管理专家，专长于规划企业创新项目的实施路径。
你的任务是设计详细的创新实施计划，确保创新项目能够成功落地。

输出要求：
- 必须严格按照JSON格式返回结果
- 不包含任何JSON之外的文字
- 基于具体的创新上下文设计详细计划"""
            },
            {
                "role": "user",
                "content": f"""请基于以下创新上下文，设计详细的业务创新路径：

创新上下文信息：
{json.dumps(innovation_context, ensure_ascii=False, indent=2)}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "business_innovation_pathway_planning",
    "innovation_summary": "创新项目摘要",
    "innovation_pathway": {{
        "exploration_phase": {{
            "phase_name": "探索阶段",
            "duration": "持续时间",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动描述",
                    "owner": "负责人",
                    "timeline": "时间安排",
                    "resources_needed": "所需资源"
                }}
            ],
            "key_metrics": ["关键指标1", "关键指标2"],
            "success_criteria": "成功标准",
            "deliverables": ["交付物1", "交付物2"]
        }},
        "pilot_phase": {{
            "phase_name": "试点阶段",
            "duration": "持续时间",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动描述",
                    "owner": "负责人",
                    "timeline": "时间安排",
                    "resources_needed": "所需资源"
                }}
            ],
            "key_metrics": ["关键指标1", "关键指标2"],
            "success_criteria": "成功标准",
            "deliverables": ["交付物1", "交付物2"]
        }},
        "scaling_phase": {{
            "phase_name": "扩展阶段",
            "duration": "持续时间",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动描述",
                    "owner": "负责人",
                    "timeline": "时间安排",
                    "resources_needed": "所需资源"
                }}
            ],
            "key_metrics": ["关键指标1", "关键指标2"],
            "success_criteria": "成功标准",
            "deliverables": ["交付物1", "交付物2"]
        }},
        "optimization_phase": {{
            "phase_name": "优化阶段",
            "duration": "持续时间",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动描述",
                    "owner": "负责人",
                    "timeline": "时间安排",
                    "resources_needed": "所需资源"
                }}
            ],
            "key_metrics": ["关键指标1", "关键指标2"],
            "success_criteria": "成功标准",
            "deliverables": ["交付物1", "交付物2"]
        }}
    }},
    "resource_allocation": {{
        "human_resources": {{"requirements": "人力资源需求", "budget": "预算"}},
        "technology_resources": {{"requirements": "技术资源需求", "budget": "预算"}},
        "financial_resources": {{"requirements": "财务资源需求", "budget": "预算"}},
        "total_budget": "总预算"
    }},
    "risk_management": [
        {{
            "risk": "风险描述",
            "probability": "发生概率",
            "impact": "影响程度",
            "mitigation_strategy": "缓解策略",
            "contingency_plan": "应急预案"
        }}
    ],
    "success_metrics": {{
        "kpi_metrics": [
            {{
                "metric": "指标名称",
                "target": "目标值",
                "measurement_method": "测量方法"
            }}
        ],
        "business_value_metrics": [
            {{
                "metric": "商业价值指标",
                "target": "目标值",
                "measurement_method": "测量方法"
            }}
        ]
    }}
}}"""
            }
        ]

        return self.llm.chat_with_json_output(messages, temperature=0.8)


# 便捷函数
def analyze_with_host_llm(
    analysis_type: str,
    context: Dict[str, Any],
    **llm_kwargs
) -> Dict[str, Any]:
    """
    便捷的宿主LLM分析函数

    Args:
        analysis_type: 分析类型
        context: 分析上下文
        **llm_kwargs: 传递给LLM的额外参数

    Returns:
        分析结果（严格JSON）
    """
    analyzer = DigitalTransformationAnalyzerHostLLM()

    analysis_methods = {
        "business_scene_deconstruction": analyzer.deconstruct_business_scene,
        "digitization_deconstruction": analyzer.deconstruct_digitization,
        "online_transformation_deconstruction": analyzer.deconstruct_online_transformation,
        "intelligent_transformation_deconstruction": analyzer.deconstruct_intelligent_transformation,
        "innovation_niche_identification": analyzer.identify_innovation_niche,
        "business_model_reconstruction": analyzer.reconstruct_business_model,
        "business_innovation_pathway_planning": analyzer.plan_business_innovation_pathway
    }

    method = analysis_methods.get(analysis_type)
    if not method:
        raise ValueError(f"不支持的分析类型: {analysis_type}")

    return method(context)


def main():
    """主函数 - 测试宿主LLM集成"""
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="基于宿主LLM的数字化转型分析工具")
    parser.add_argument("analysis_type", type=str, help="分析类型")
    parser.add_argument("--context", type=str, help="分析上下文(JSON格式)")
    parser.add_argument("--context_file", type=str, help="分析上下文文件路径")
    parser.add_argument("--output_file", type=str, help="输出文件路径（JSON格式）")

    args = parser.parse_args()

    # 准备上下文
    context = {}
    if args.context:
        context = json.loads(args.context)
    elif args.context_file:
        with open(args.context_file, 'r', encoding='utf-8') as f:
            context = json.load(f)
    else:
        # 如果没有提供上下文，则使用默认示例
        context = {
            "business_scenario": "示例业务场景",
            "company_name": "示例公司",
            "industry": "制造业",
            "transformation_objectives": ["数字化", "在线化", "智能化"]
        }

    try:
        # 执行分析
        print()  # 只输出换行，不输出其他文字
        result = analyze_with_host_llm(
            analysis_type=args.analysis_type,
            context=context
        )

        # 输出结果（严格JSON，无其他文字）
        if args.output_file:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))

    except ValueError as e:
        print()  # 只输出换行
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
    except Exception as e:
        print()  # 只输出换行
        print(json.dumps({"error": str(e)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
