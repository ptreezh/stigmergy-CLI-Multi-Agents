#!/usr/bin/env python3
"""
数字化转型分析器 - agentskills.io标准实现
技能中的提示词直接使用技能所在的CLI工具的LLM算力，无需显示的调用！
"""

import json
import logging
from typing import Dict, Any, List
import sys
from pathlib import Path

# 配置日志（只记录错误）
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


class DigitalTransformationAnalyzerAgentskillsIO:
    """
    数字化转型分析器 - agentskills.io标准实现

    核心原则：
    1. 技能文件(.md) = 系统提示词
    2. 技能实现(.py) = 只返回提示词（不调用LLM）
    3. agentskills.io框架 = 使用技能提示词调用宿主CLI的LLM
    4. 无需任何显式的LLM调用代码
    5. 输出 = LLM生成的结果（通过agentskills.io框架）
    """

    def __init__(self):
        """初始化分析器"""
        # 注意：这里不需要任何LLM配置或客户端
        # 技能的提示词会自动被agentskills.io框架使用
        logger.info("数字化转型分析器初始化完成（agentskills.io标准实现）")

    def _build_prompt_data(
        self,
        analysis_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        构建提示词数据 - 只返回提示词，不调用LLM

        Args:
            analysis_type: 分析类型
            context: 分析上下文

        Returns:
            提示词数据
        """
        # 根据分析类型构建提示词
        if analysis_type == "business_scene_deconstruction":
            return self._build_business_scene_prompt(context)
        elif analysis_type == "digitization_deconstruction":
            return self._build_digitization_prompt(context)
        elif analysis_type == "online_transformation_deconstruction":
            return self._build_online_transformation_prompt(context)
        elif analysis_type == "intelligent_transformation_deconstruction":
            return self._build_intelligent_transformation_prompt(context)
        elif analysis_type == "innovation_niche_identification":
            return self._build_innovation_niche_prompt(context)
        elif analysis_type == "business_model_reconstruction":
            return self._build_business_model_prompt(context)
        elif analysis_type == "business_innovation_pathway_planning":
            return self._build_pathway_planning_prompt(context)
        else:
            raise ValueError(f"不支持的分析类型: {analysis_type}")

    def _build_business_scene_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        构建业务场景解构提示词

        Args:
            context: 业务场景上下文

        Returns:
            提示词数据
        """
        # 系统提示词
        system_prompt = """你是一位资深的数字化转型咨询专家，擅长从多维度分析业务场景。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析框架

你擅长使用 **DEEP-SCAN五层解构模型** 进行深度业务场景分析：

### 第一层：价值流层（Value Flow Layer）
分析价值的创造、传递、捕获和分配逻辑

### 第二层：资源要素层（Resource Element Layer）
分析有形资源、无形资源、人力资源和组织资源的使用和配置

### 第三层：活动网络层（Activity Network Layer）
分析核心价值创造活动、支持活动、管理活动和连接活动

### 第四层：连接关系层（Connection Relationship Layer）
分析物理连接、信息连接、价值连接和认知连接

### 第五层：生态系统环境层（Ecosystem Environment Layer）
分析技术环境、市场环境、政策环境和社会环境

## 输出要求

**必须严格按照JSON格式返回结果**，不要包含任何JSON之外的文字。
- 只返回JSON对象
- 不包含任何解释性文字
- 不包含任何markdown标记
- 不包含任何调试信息
"""

        # 用户提示词
        user_prompt = f"""请对以下业务场景进行全面的解构分析：

## 业务场景信息

### 业务概述
- 公司名称：{context.get('company_name', '示例公司')}
- 所属行业：{context.get('industry', '示例行业')}
- 业务模式：{context.get('business_model', 'B2B/B2C/C2C/B2G')}

### 战略目标
{self._format_list(context.get('strategic_objectives', ['数字化转型', '在线化转型', '智能化转型']))}

### 核心业务
{self._format_list(context.get('core_business', ['产品设计', '生产制造', '市场营销', '销售服务']))}

### 当前挑战
{self._format_list(context.get('current_challenges', ['数据孤岛', '人才缺乏', '组织阻力']))}

### 数字化现状
- 数字化水平：{context.get('digital_maturity', '初级/中级/高级')}
- 数据资产：{context.get('data_assets', '描述数据资产现状')}
- 技术基础：{context.get('technology_infrastructure', '描述技术基础')}

---

## 分析要求

请基于以上信息，按照以下JSON格式返回分析结果：

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

---

**重要提示**：
1. 所有分析都必须基于提供的具体业务场景信息
2. 识别的创新机会要具体、有洞察力
3. 评估要客观、基于事实
4. 必须返回有效的JSON格式
"""

        # 返回提示词（不是LLM结果）
        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "deconstruct_business_scene",
                "frameworks_used": ["DEEP-SCAN", "six-expert-perspectives"]
            }
        }

    def _build_digitization_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """构建数字化解构提示词"""
        system_prompt = """你是一位数字化转型专家，专长于分析企业的数字化机会和挑战。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析重点

你擅长分析以下方面：

### 数字化现状评估
- 评估当前数字化水平（初级/中级/高级）
- 识别数字化转型的机会和障碍
- 提供数字化成熟度评估矩阵

### 数字化转型机会
- **数据货币化机会**: 将业务数据转化为商业价值
- **流程优化机会**: 通过数字化优化低效流程
- **体验升级机会**: 通过数字化提升用户体验
- **生态协同机会**: 通过数字化促进生态伙伴协同

### 数字化实施路径
- **数字化基础阶段**: 建立数据基础和数字化能力
- **在线化拓展阶段**: 建立客户触达和数据收集能力
- **智能化升级阶段**: 应用AI和数据智能能力
"""

        user_prompt = f"""请对以下企业的数字化情况进行深入分析：

## 企业数字化信息

### 公司信息
- 公司名称：{context.get('company_name', '示例公司')}
- 所属行业：{context.get('industry', '示例行业')}
- 公司规模：{context.get('company_size', '大型/中型/小型')}
- 业务模式：{context.get('business_model', 'B2B/B2C/C2C/B2G')}

### 数字化现状
- 数字化水平：{context.get('digital_maturity', '初级/中级/高级')}
- 数字化投入：{context.get('digital_investment', '描述数字化投入情况')}

### 数字化能力
- 数据资产：{context.get('data_assets', '描述数据资产')}

### 智能化能力
- AI应用：{context.get('ai_applications', '描述AI应用情况')}
- 机器学习：{context.get('machine_learning', '描述机器学习应用')}

### 技术基础设施
- 云平台：{context.get('cloud_platform', '描述云平台情况')}
- 数据平台：{context.get('data_platform', '描述数据平台情况')}
- AI平台：{context.get('ai_platform', '描述AI平台情况')}

### 数字化战略
- 数字化目标：{self._format_list(context.get('digital_goals', ['提升效率', '改善体验', '创新模式']))}

---

## 分析要求

请基于以上信息，按照以下JSON格式返回分析结果：

{{
    "analysis_type": "digitization_deconstruction",
    "digitization_context_summary": "对数字化现状的简要总结",
    "current_digitalization_level": {{
        "overall_level": "评估当前数字化水平（初级/中级/高级）",
        "digitization_score": "数字化得分（1-10）",
        "online_score": "在线化得分（1-10）",
        "intelligent_score": "智能化得分（1-10）",
        "assessment": "评估说明"
    }},
    "digitization_opportunities": {{
        "data_monetization_opportunities": [
            {{
                "opportunity": "数据货币化机会描述",
                "case": "具体应用案例",
                "value": "商业价值",
                "priority": "优先级（高/中/低）"
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
            "challenge_id": "挑战ID",
            "name": "挑战名称",
            "type": "挑战类型（technical/organizational/cultural/financial）",
            "description": "详细描述",
            "impact_level": "影响程度（low/medium/high）",
            "mitigation_strategies": ["缓解策略1", "缓解策略2"]
        }}
    ],
    "digitization_roadmap": {{
        "short_term_goals": "短期目标（3-6个月）",
        "medium_term_goals": "中期目标（6-18个月）",
        "long_term_goals": "长期目标（18个月以上）"
    }}
}}

---

**重要提示**：
1. 分析必须基于提供的具体企业信息
2. 识别的机会和挑战要具体、有洞察力
3. 要考虑企业的实际情况和资源限制
4. 必须返回有效的JSON格式
"""

        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "deconstruct_digitization",
                "frameworks_used": ["digital-transformation", "innovation"]
            }
        }

    def _build_online_transformation_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """构建在线化解构提示词"""
        system_prompt = """你是一位在线化和数字化转型专家，专长于分析企业如何通过在线化实现业务增长和客户连接。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析重点

你擅长分析以下方面：

### 在线化现状评估
- 评估客户触达成熟度（初级/中级/高级）
- 评估数字交互成熟度
- 评估数据收集成熟度
- 评估服务交付成熟度

### 在线化转型机会
- **触达渠道机会**: 通过在线化建立新的客户触达通道
- **数据洞察机会**: 通过全场景数据采集获得深度洞察
- **实时服务机会**: 通过在线化提供实时服务
- **生态整合机会**: 通过在线化促进生态伙伴协同

### 在线化实施路径
- **第一阶段目标**: 建立基础的在线化能力
- **第二阶段目标**: 扩展在线化能力和覆盖范围
- **第三阶段目标**: 实现高级在线化和智能化服务
"""

        user_prompt = f"""请对以下企业的在线化情况进行深入分析：

## 企业在线化信息

### 公司信息
- 公司名称：{context.get('company_name', '示例公司')}
- 所属行业：{context.get('industry', '示例行业')}
- 公司规模：{context.get('company_size', '大型/中型/小型')}
- 业务模式：{context.get('business_model', 'B2B/B2C/C2C/B2G')}

### 在线化现状
- 在线化水平：{context.get('online_maturity', '初级/中级/高级')}
- 数字触达：{context.get('digital_reach', '描述数字触达现状')}

### 客户触点
{self._format_list(context.get('customer_touchpoints', ['官方网站', '电商平台', "社交媒体", "移动App"]))}

### 数据采集点
{self._format_list(context.get('data_collection_points', ['用户行为数据', "设备传感器数据', "交易数据', "反馈数据"]))}

### 在线化服务
{self._format_list(context.get('online_services', ['在线客服', "在线支付", "远程服务", "个性化推荐"]))}

### 在线化战略
- 在线化目标：{self._format_list(context.get('online_goals', ['提升客户触达', '增强数据能力', '优化客户体验']))}

---

## 分析要求

请基于以上信息，按照以下JSON格式返回分析结果：

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
                "priority": "优先级"
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
}}

---

**重要提示**：
1. 分析必须基于提供的具体企业信息
2. 识别的机会必须具体、可操作
3. 建议必须切实可行，与企业的实际情况相匹配
4. 必须返回有效的JSON格式
"""

        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "deconstruct_online_transformation",
                "frameworks_used": ["online-transformation", "innovation"]
            }
        }

    def _build_intelligent_transformation_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """构建智能化解构提示词"""
        system_prompt = """你是一位AI和智能化转型专家，专长于分析企业如何应用AI和数据智能实现业务创新和效率提升。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析重点

你擅长分析以下方面：

### 智能化现状评估
- 数据就绪度评估：数据质量、完整性、一致性
- 算法就绪度评估：算法库、算法成熟度、应用场景
- 基础设施就绪度：算力、存储、网络
- 人才就绪度：数据科学家、算法工程师、ML工程师

### 智能化机会
- **智能决策机会**: 通过AI实现数据驱动的智能决策
- **预测分析机会**: 通过机器学习实现预测分析和预测服务
- **个性化服务机会**: 通过AI算法实现个性化推荐和定制化
- **智能平台机会**: 构建智能数据平台，提供数据服务和算法服务
"""

        user_prompt = f"""请对以下企业的智能化情况进行深入分析：

## 企业智能化信息

### 公司信息
- 公司名称：{context.get('company_name', '示例公司')}
- 所属行业：{context.get('industry', '示例行业')}
- 公司规模：{context.get('company_size', '大型/中型/小型')}
- 业务模式：{context.get('business_model', 'B2B/B2C/C2C/B2G')}

### 智能化现状
- 智能化水平：{context.get('ai_maturity', '初级/中级/高级')}
- AI应用：{context.get('ai_applications', '描述AI应用情况')}
- 机器学习：{context.get('machine_learning', '描述机器学习应用')}

### 数据基础
- 数据规模：{context.get('data_size', '描述数据规模')}
- 数据质量：{context.get('data_quality', '描述数据质量')}
- 数据类型：{self._format_list(context.get('data_types', ['结构化数据', '非结构化数据', "时序数据", '图像数据', "视频数据"]))}

### 算法能力
- 算法库：{context.get('algorithm_library', '描述算法库')}
- 算法应用：{context.get('algorithm_application', '描述算法应用场景')}

### 技术平台
- ML平台：{context.get('ml_platform', '描述ML平台')}
- AI平台：{context.get('ai_platform', '描述AI平台')}

### 智能化战略
- 智能化目标：{self._format_list(context.get('ai_goals', ['应用AI算法', '实现智能决策', '提供智能服务', '构建智能平台']))}

---

## 分析要求

请基于以上信息，按照以下JSON格式返回分析结果：

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
}}

---

**重要提示**：
1. 分析必须基于企业的实际AI能力和资源
2. 识别的机会必须技术可行、商业有价值
3. 实施路线图要分阶段、可执行
4. 必须返回有效的JSON格式
"""

        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "deconstruct_intelligent_transformation",
                "frameworks_used": ["intelligent_transformation", "AI", "innovation"]
            }
        }

    def _build_innovation_niche_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """构建创新利基识别提示词"""
        system_prompt = """你是一位商业创新专家，专长于识别企业转型中的创新利基和机会。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析重点

你擅长以下方面：

### 创新利基发现
- 痛点聚合：综合多维度分析识别系统性问题和低效环节
- 机会识别：发现被忽视或低估的商业机会
- 价值评估：评估创新利基的战略价值
- 风险分析：评估实施风险和挑战

### 利基评估
- 市场需求强度：评估市场需求的大小和增长
- 技术可行性：评估技术实现的可行性
- 竞争优势：评估竞争优势的可持续性
- 商业价值：评估商业价值的潜力
- 实施难度：评估实施的技术和组织难度

### 实施路径
- 短期：快速实验和验证
- 中期：扩大规模和优化
- 长期：全面推广和深化

---

## 分析要求

请基于以下信息，按照以下JSON格式返回分析结果：

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
}}

---

**重要提示**：
1. 基于提供的完整解构分析结果进行综合分析
2. 识别的创新利基要具体、有吸引力、可行
3. 评估要客观、基于事实
4. 必须返回有效的JSON格式
"""

        # 收集关键信息
        insights_summary = []
        for i in range(len(context)):
            insights_summary.append(f"解构分析结果 {i+1}")

        user_prompt = f"""请基于以下解构分析结果，识别最有价值的创新利基：

## 解构分析摘要
{chr(10).join(insights_summary)}

## 完整的解构分析结果
{json.dumps(context, ensure_ascii=False, indent=2)}

---

## 分析要求

请按照以下JSON格式返回分析结果：

{{
    "analysis_type": "innovation_niche_identification",
    "aggregated_insights": {{
        "pain_points": ["痛点1", "痛点2", "痛点3"],
        "demand_gaps": ["需求缺口1", "需求缺口2", "需求缺口3"],
        "supply_gaps": ["供给缺口1", "供给缺口2", "供给缺口3"],
        "ecosystem_gaps": ["生态缺口1", "生态缺口2", "生态缺口3"]
    }},
    "niche_evaluation_matrix": {{
        "market_demand_intensity": {{"score": "4.5", "weight": "0.25", "assessment": "市场需求强劲，增长迅速"}},
        "technical_feasibility": {{"score": "3.5", "weight": "0.20", "assessment": "技术成熟，实施难度中等"}},
        "competitive_environment": {{"score": "3.0", "weight": "0.16", "assessment": "竞争激烈，需差异化竞争策略"}},
        "commercial_value": {{"score": "4.0", "weight": "0.16", "assessment": "商业价值高，ROI可期"},
        "implementation_difficulty": {{"score": "2.5", "weight": "0.13", "assessment": "需要一定技术积累和组织准备"}}
    }},
    "top_niches": [
        {{
            "name": "数据驱动的服务产品化",
            "description": "将企业内部的数据资产转化为可对外提供的数据服务产品",
            "type": "data_driven",
            "evaluation": {{
                "market_demand": "4.5",
                "technical_feasibility": "3.5",
                "competitive_advantage": "3.0",
                "commercial_value": "4.0",
                "implementation_complexity": "2.5"
            }},
            "potential_value": "将成本中心转化为利润中心",
            "action_plan": [
                "第一阶段：建立数据产品定义",
                "第二阶段：试点服务推出",
                "第三阶段：规模化推广"
            ]
        }},
        {{
            "name": "智能化运营平台",
            "description": "构建AI驱动的运营平台，实现运营自动化和智能决策",
            "type": "model_driven",
            "evaluation": {{
                "market_demand": "5.0",
                "technical_feasibility": "4.0",
                "competitive_advantage": "4.0",
                "commercial_value": "4.5",
                "implementation_complexity": "3.5"
            }},
            "potential_value": "运营效率提升30%以上",
            "action_plan": [
                "第一阶段：核心流程自动化",
                "第二阶段：智能决策支持",
                "第三阶段：全链路智能优化"
            ]
        }}
    ]
}}

---

**重要提示**：
1. 基于提供的完整解构分析结果进行综合分析
2. 识别的创新利基要具体、有吸引力、可行
3. 评估要客观、基于事实
4. 必须返回有效的JSON格式
"""

        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "identify_innovation_niche",
                "frameworks_used": ["DEEP-SCAN", "INOF", "innovation"]
            }
        }

    def _build_business_model_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """构建商业模式重构提示词"""
        system_prompt = """你是一位商业模式创新专家，专长于设计数字时代的新型商业模式。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析框架

你擅长使用的分析框架包括：

### BMR商业模式重构框架
- **价值主张重构**: 重塑价值主张，更好地满足客户价值需求
- **价值创造重构**: 设计数据驱动的价值创造机制
- **价值传递重构**: 优化价值传递渠道，提高传递效率
- **价值获取重构**: 创新收入模式，优化价值获取方式
- **竞争优势重构**: 构建数据驱动的竞争优势

---

## 分析要求

请基于以下创新利基信息，设计创新的商业模式：

## 创新利基信息

{json.dumps(context, ensure_ascii=False, indent=2)}

---

## 分析要求

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
                "actions": ["行动1", "行动2", "行动3"],
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
}}

---

**重要提示**：
1. 基于具体的创新利基设计商业模式
2. 商业模式要创新、可行、有价值
3. 重构路径要分阶段、可执行
4. 必须返回有效的JSON格式
"""

        user_prompt = f"""请基于以下创新利基，设计创新的商业模式：

## 创新利基信息
{json.dumps(context, ensure_ascii=False, indent=2)}

---

## 分析要求

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
            "innovation_points": ["创新点1", "创新点2", "创新点3"]
        }},
        "value_delivery": {{
            "current_channels": "当前价值传递渠道",
            "new_channels": "新价值传递渠道",
            "delivery_innovation": "传递创新说明"
        }},
        "value_capture": {{
            "current_revenue_model": "当前收入模式",
            "new_revenue_model": "新收入模式",
            "revenue_streams": ["收入流1", "收入流2", "收入流3", "收入流4"],
            "pricing_strategy": "定价策略"
        }},
        "competitive_advantage": {{
            "current_advantage": "当前竞争优势",
            "new_advantage": "新竞争优势",
            "sustainability": "可持续性分析"
        }}
    }},
    "reconstruction_path": {{
        "path_type": "重构路径类型",
        "phases": [
            {{
                "phase": "探索阶段",
                "objectives": "目标1, 目标2",
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
}}

---

**重要提示**：
1. 商业模式要创新、可行、有价值
2. 重构路径要分阶段、可执行
3. 必须返回有效的JSON格式
"""

        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "reconstruct_business_model",
                "frameworks_used": ["BMR", "innovation", "business_model_reconstruction"]
            }
        }

    def _build_pathway_planning_prompt(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """构建路径规划提示词"""
        system_prompt = """你是一位创新管理专家，专长于规划企业创新项目的实施路径。
你的专业领域包括：

## 专家视角
1. **数字化转型咨询专家**: 战略规划、变革管理、组织适配、风险控制
2. **数字化经济专家**: 数据要素、网络效应、算法经济、平台经济
3. **数字化哲学专家**: 存在本质、关系重构、价值内涵、时空重塑
4. **产业互联网专家**: 生态协同、平台构建、网络效应、标准制定
5. **人工智能专家**: 算法应用、数据智能、自动化潜力、智能决策
6. **商业模式重构专家**: 价值创造、收入模式、竞争壁垒、生态构建

## 分析框架

你擅长使用的分析框架包括：

### IPM业务创新路径模型
- **探索阶段**: 探索阶段（1-3个月）
- **试点阶段**: 试点阶段（3-6个月）
- **扩展阶段**: 扩展阶段（6-18个月）
- **优化阶段**: 优化阶段（18-36个月）

---

## 分析要求

请基于以下创新上下文，设计详细的业务创新路径：

## 创新上下文信息
{json.dumps(context, ensure_ascii=False, indent=2)}

---

## 分析要求

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
}}

---

**重要提示**：
1. 路径规划要分阶段、可执行、可衡量
2. 资源分配要合理、预算要可行
3. 风险管理要全面、应对措施要具体
4. 成功指标要可量化、可测量、可追踪
5. 必须返回有效的JSON格式
"""

        user_prompt = f"""请基于以下创新上下文，设计详细的业务创新路径：

## 创新上下文信息
{json.dumps(context, ensure_ascii=False, indent=2)}

---

## 分析要求

请按照以下JSON格式返回分析结果：

{{
    "analysis_type": "business_innovation_pathway_planning",
    "innovation_summary": "创新项目摘要",
    "innovation_pathway": {{
        "exploration_phase": {{
            "phase_name": "探索阶段（1-3个月）",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动1：调研和需求分析",
                    "owner": "项目负责人",
                    "timeline": "第1-2周",
                    "resources_needed": "调研团队、预算、工具",
                    "deliverables": ["需求调研报告", "技术可行性报告"]
                }},
                {{
                    "activity": "活动2：技术方案设计",
                    "owner": "技术负责人",
                    "timeline": "第3-6周",
                    "resources_needed": "架构师、开发团队、开发环境",
                    "deliverables": ["技术方案文档", "原型系统"]
                }},
                {{
                    "activity": "活动3：概念验证",
                    "owner": "产品负责人",
                    "timeline": "第7-12周",
                    "resources_needed": "产品团队、测试用户、测试环境",
                    "deliverables": ["用户反馈", "验证报告"]
                }}
            ],
            "key_metrics": ["参与度", "NPS（净推荐值）", "概念验证成功率"],
            "success_criteria": [
                "验证核心假设",
                "用户满意度 > 4.0",
                "技术可行性验证通过"
            ],
            "deliverables": [
                "需求调研报告",
                "技术方案文档",
                "原型系统",
                "验证报告"
            ]
        }},
        "pilot_phase": {{
            "phase_name": "试点阶段（3-6个月）",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动1：系统开发",
                    "owner": "开发团队",
                    "timeline": "第1-3个月",
                    "resources_needed": "开发团队、基础设施、数据",
                    "deliverables": "可用的系统"
                }},
                {{
                    "activity": "活动2：试点部署",
                    "owner": "部署团队",
                    "timeline": "第4-5个月",
                    "resources_needed": "部署工具、测试环境",
                    "deliverables": "试点环境"
                }},
                {{
                    "activity": "活动3：数据收集",
                    "owner": "数据团队",
                    "timeline": "第3-6个月持续进行",
                    "resources_needed": "数据平台、ETL工具",
                    "deliverables": "数据收集报告"
                }},
                {{
                    "activity": "活动4：运营监控",
                    "owner": "运营团队",
                    "timeline": "第4-6个月持续进行",
                    "resources_needed": "监控工具、运营团队",
                    "deliverables": "运营分析报告"
                }}
            ],
            "key_metrics": ["活跃用户数", "留存率", "核心功能使用率", "用户满意度"],
            "success_criteria": [
                "活跃用户数 > 1000",
                "留存率 > 40%",
                "核心功能使用率 > 30%",
                "用户满意度 > 4.0",
                "试点ROI > 150%"
            ],
            "deliverables": [
                "试点系统",
                "运营分析报告",
                "用户反馈总结"
            ]
        }},
        "scaling_phase": {{
            "phase_name": "扩展阶段（6-18个月）",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动1：功能完善",
                    "owner": "产品团队",
                    "timeline": "第1-6个月持续进行",
                    "resources_needed": "产品团队、基础设施、数据",
                    "deliverables": "功能完善的系统"
                }},
                {{
                    "activity": "活动2：市场推广",
                    "owner": "市场团队",
                    "timeline": "第1-6个月持续进行",
                    "resources_needed": "市场团队、推广预算",
                    "deliverables": "营销活动结果"
                }},
                {{
                    "activity": "活动3：技术架构升级",
                    "owner": "架构团队",
                    "timeline": "第4-9个月",
                    "resources_needed": "架构师、开发团队、基础设施",
                    "deliverables": "升级后的架构"
                }},
                {{
                    "activity": "活动4：用户运营",
                    "owner": "运营团队",
                    "timeline": "第7-18个月持续进行",
                    "resources_needed": "运营团队、工具",
                    "deliverables": "运营分析报告"
                }}
            ],
            "key_metrics": ["总用户数", "月活跃率", "付费转化率", "NPS（净推荐值）"],
            "success_criteria": [
                "总用户数 > 10000",
                "月活跃率 > 20%",
                "付费转化率 > 3%",
                "NPS > 10%",
                "规模化ROI > 200%"
            ],
            "deliverables": [
                "生产系统",
                "营销活动结果",
                "运营分析报告"
            ]
        }},
        "optimization_phase": {{
            "phase_name": "优化阶段（18-36个月）",
            "objectives": "阶段目标",
            "key_activities": [
                {{
                    "activity": "活动1：算法优化",
                    "owner": "算法团队",
                    "timeline": "第1-6个月持续进行",
                    "resources_needed": "算法团队、数据、计算资源",
                    "deliverables": "优化后的算法"
                }},
                {{
                    "activity": "活动2：平台集成",
                    "owner": "集成团队",
                    "timeline": "第1-12个月持续进行",
                    "resources_needed": "集成团队、API接口、开发团队",
                    "deliverables": "集成后的平台"
                }},
                {{
                    "activity": "活动3：生态构建",
                    "owner": "生态团队",
                    "timeline": "第7-18个月持续进行",
                    "resources_needed": "生态团队、合作伙伴、合作伙伴",
                    "deliverables": "生态网络"
                }},
                {{
                    "activity": "活动4：智能化升级",
                    "owner": "AI团队",
                    "timeline":第13-24个月持续进行",
                    "resources_needed": "AI团队、数据、算力",
                    "deliverables": "智能化能力"
                }},
                {{
                    "activity": "活动5：持续运营",
                    "owner": "运营团队",
                    "timeline": "第1-18个月持续进行",
                    "resources_needed": "运营团队、工具",
                    "deliverables": "运营分析报告"
                }}
            ],
            "key_metrics": ["用户数", "DAU/MAU", "LTV", "CAC", "ROI"],
            "success_criteria": [
                "DAU/MAU > 50%",
                "LTV > 2.0",
                "CAC < 基准",
                "ROI > 500%",
                "智能化功能使用率 > 40%"
            ],
            "deliverables": [
                "优化的系统",
                "API平台",
                "智能化功能",
                "运营分析报告"
            ]
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
            "risk": "技术风险",
            "probability": "发生概率",
            "impact": "影响程度",
            "mitigation_strategy": "缓解策略",
            "contingency_plan": "应急预案"
        }},
        {{
            "risk": "市场风险",
            "probability": "发生概率",
            "impact": "影响程度",
            "mitigation_strategy": "缓解策略",
            "contingency_plan": "应急预案"
        }},
        {{
            "risk": "组织风险",
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
            }},
            {{
                "metric": "指标名称",
                "target": "目标值",
                "measurement_method": "测量方法"
            }},
            {{
                "metric": "指标名称",
                "target": "目标值",
                "measurement_method": "测量方法"
            }},
            {{
                "metric": "指标名称",
                "target": "目标值",
                "measurement_method": "测量方法"
            }},
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
            }},
            {{
                "metric": "商业价值指标",
                "target": "目标值",
                "measurement_method": "测量方法"
            }},
            {{
                "metric": "商业价值指标",
                "target": "目标值",
                "measurement_method": "测量方法"
            }},
            {{
                "metric": "商业价值指标",
                "target": "目标值",
                "measurement_method": "测量方法"
            }}
        ]
    }}
}}

---

**重要提示**：
1. 路径规划要分阶段、可执行、可衡量
2. 资源分配要合理、预算要可行
3. 风险管理要全面、应对措施要具体
4. 成功指标要可量化、可测量、可追踪
5. 必须返回有效的JSON格式
"""

        return {
            "prompt_data": {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "context": context,
                "expected_format": "json",
                "skill_id": "digital-transformation-innovation-analyst",
                "action": "plan_business_innovation_pathway",
                "frameworks_used": ["IPM", "innovation", "pathway_planning"]
            }
        }

    def _format_list(self, items: List[str]) -> str:
        """格式化列表为字符串"""
        if not items:
            return "无"
        return "\n".join(f"- {item}" for item in items)

    def execute_analysis(
        self,
        analysis_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        执行分析 - 返回提示词给agentskills.io框架

        Args:
            analysis_type: 分析类型
            context: 分析上下文

        Returns:
            包含提示词的结果对象（会被agentskills.io框架使用）
        """
        # 根据分析类型构建提示词
        if analysis_type == "business_scene_deconstruction":
            return self._build_business_scene_prompt(context)
        elif analysis_type == "digitization_deconstruction":
            return self._build_digitization_prompt(context)
        elif analysis_type == "online_transformation_deconstruction":
            return self._build_online_transformation_prompt(context)
        elif analysis_type == "intelligent_transformation_deconstruction":
            return self._build_intelligent_transformation_prompt(context)
        elif analysis_type == "innovation_niche_identification":
            deconstruction_results = context.get("deconstruction_results", [context])
            return self._build_innovation_niche_prompt(deconstruction_results)
        elif analysis_type == "business_model_reconstruction":
            return self._build_business_model_prompt(context)
        elif analysis_type == "business_innovation_pathway_planning":
            return self._build_pathway_planning_prompt(context)
        else:
            raise ValueError(f"不支持的分析类型: {analysis_type}")

    def deconstruct_business_scene(self, business_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        业务场景解构分析 - 返回提示词（不调用LLM）

        Args:
            business_context: 业务场景上下文

        Returns:
            提示词数据（会被agentskills.io框架使用）
        """
        return self._build_prompt_data("business_scene_deconstruction", business_context)

    def deconstruct_digitization(self, digitization_context: Dict[str, Any]) -> Dict[str, Any]:
        """数字化解构分析 - 返回提示词（不调用LLM）"""
        return self._build_prompt_data("digitization_deconstruction", digitization_context)

    def deconstruct_online_transformation(self, online_context: Dict[str, Any]) -> Dict[str, Any]:
        """在线化解构分析 - 返回提示词（不调用LLM）"""
        return self._build_prompt_data("online_transformation_deconstruction", online_context)

    def deconstruct_intelligent_transformation(self, intelligent_context: Dict[str, Any]) -> Dict[str, Any]:
        """智能化解构分析 - 返回提示词（不调用LLM）"""
        return self._build_prompt_data("intelligent_transformation_deconstruction", intelligent_context)

    def identify_innovation_niche(self, deconstruction_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """创新利基识别 - 返回提示词（不调用LLM）"""
        context = {
            "deconstruction_results": deconstruction_results,
            "analysis_type": "innovation_niche_identification"
        }
        return self._build_prompt_data("innovation_niche_identification", context)

    def reconstruct_business_model(self, niche_context: Dict[str, Any]) -> Dict[str, Any]:
        """商业模式重构 - 返回提示词（不调用LLM）"""
        return self._build_prompt_data("business_model_reconstruction", niche_context)

    def plan_business_innovation_pathway(self, innovation_context: Dict[str, Any]) -> Dict[str, Any]:
        """业务创新路径规划 - 返回提示词（不调用LLM）"""
        return self._build_prompt_data("business_innovation_pathway_planning", innovation_context)

    def execute_analysis(
        self,
        analysis_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        执行分析 - 返回提示词给agentskills.io框架

        Args:
            analysis_type: 分析类型
            context: 分析上下文

        Returns:
            包含提示词的结果对象（会被agentskills.io框架使用）
        """
        # 根据分析类型构建提示词
        return self._build_prompt_data(analysis_type, context)


class AnalysisType:
    """分析类型枚举"""
    BUSINESS_SCENE_DECONSTRUCTION = "business_scene_deconstruction"
    DIGITIZATION_DECONSTRUCTION = "digitization_deconstruction"
    ONLINE_TRANSFORMATION_DECONSTRUCTION = "online_transformation_deconstruction"
    INTELLIGENT_TRANSFORMATION_DECONSTRUCTION = "intelligent_transformation_deconstruction"
    INNOVATION_NICHE_IDENTIFICATION = "innovation_niche_identification"
    BUSINESS_MODEL_RECONSTRUCTION = "business_model_reconstruction"
    BUSINESS_INNOVATION_PATHWAY_PLANNING = "business_innovation_pathway_planning"


def main():
    """主函数 - agentskills.io标准实现"""
    import argparse

    parser = argparse.ArgumentParser(
        description="数字化转型分析工具 - agentskills.io标准实现"
    )
    parser.add_argument("analysis_type", type=str, help="分析类型")
    parser.add_argument("--context", type=str, help="上下文信息(JSON格式)")
    parser.add_argument("--context_file", type=str, help="上下文文件路径")
    parser.add_argument("--output_file", type=str, help="输出文件路径")

    args = parser.parse_args()

    # 初始化分析器
    analyzer = DigitalTransformationAnalyzerAgentskillsIO()

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
            "business_model": "B2B",
            "strategic_objectives": ["数字化转型", "在线化转型", "智能化转型"],
            "current_challenges": ["数据孤岛", "人才缺乏", "组织阻力"],
            "data_assets": "公司拥有大量生产和运营数据",
            "ai_applications": "尝试在部分流程中应用AI和机器学习"
        }

    try:
        # 执行分析（返回提示词给agentskills.io框架）
        print()  # 只输出换行，不输出其他文字

        result = analyzer.execute_analysis(args.analysis_type, context)

        # 输出提示词（agentskills.io框架会使用这个提示词调用宿主CLI的LLM）
        if args.output_file:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"提示词已保存到: {args.output_file}")
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))

    except ValueError as e:
        print()  # 只输出换行
        print(json.dumps({"error": str(e)}, ensure_ascii=False, indent=2))
    except Exception as e:
        print()  # 只输出换行
        print(json.dumps({"error": str(e)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
