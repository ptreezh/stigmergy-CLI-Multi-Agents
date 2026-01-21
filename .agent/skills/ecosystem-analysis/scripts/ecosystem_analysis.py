#!/usr/bin/env python3
"""
生态系统分析模块（第三阶段）
严格输出JSON，不包含任何额外文本
"""

import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

from llm_client import chat_with_llm

# 配置日志（仅用于内部调试，不影响输出）
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)


class EcosystemAnalysis:
    """生态系统分析 - 第三阶段"""

    def __init__(
        self,
        llm_provider: str = "openai",
        llm_model: Optional[str] = None,
        llm_api_key: Optional[str] = None
    ):
        """
        初始化分析器

        Args:
            llm_provider: LLM提供商
            llm_model: LLM模型名称
            llm_api_key: LLM API密钥
        """
        self.llm_provider = llm_provider
        self.llm_model = llm_model
        self.llm_api_key = llm_api_key

    def analyze_ecosystem(
        self,
        digital_transformation_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        执行生态系统分析

        Args:
            digital_transformation_result: 第二阶段数字化转型的分析结果

        Returns:
            生态系统分析结果（严格JSON格式）
        """
        # 提取关键信息
        industry_name = digital_transformation_result.get("industry_name", "未知行业")
        opportunities = digital_transformation_result.get("dital_transformation_opportunities", [])
        roadmap = digital_transformation_result.get("dital_transformation_roadmap", {})

        # 构建系统提示
        system_prompt = f"""你是一位生态系统分析专家，专门分析{industry_name}行业的生态系统结构、动态和演化趋势。

你的任务是深入分析该行业生态系统的现状、关键参与者、竞争格局，以及数字化转型对生态系统的影响。

分析要求：
1. 基于提供的数字化转型分析结果进行生态系统分析
2. 识别生态系统中的关键物种（企业、平台、机构等）
3. 分析生态系统的结构和关系网络
4. 评估数字化转型对生态系统的影响
5. 预测生态系统的演化趋势

输出要求：
- 必须严格按照JSON格式输出
- 不包含任何JSON之外的文本
- 不包含任何解释性文字
- 只返回JSON对象"""

        # 构建用户提示
        user_prompt = f"""请对{industry_name}行业的生态系统进行全面深入分析。

数字化转型分析结果：
{json.dumps(digital_transformation_result, ensure_ascii=False, indent=2)[:3000]}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "ecosystem_analysis",
    "industry_name": "{industry_name}",
    "analysis_timestamp": "当前时间戳",
    "ecosystem_structure": {{
        "ecosystem_type": "生态系统类型（hub_and_spoke/hierarchical/network/platform_based）",
        "key_layers": [
            {{
                "layer_name": "层级名称",
                "layer_description": "层级描述",
                "entities": [
                    {{
                        "entity_type": "实体类型",
                        "entity_count": "数量",
                        "description": "描述"
                    }}
                ]
            }}
        ],
        "connection_patterns": [
            {{
                "pattern_type": "连接模式类型",
                "description": "模式描述",
                "strength": "强度（weak/medium/strong）"
            }}
        ]
    }},
    "key_species": [
        {{
            "species_id": "唯一ID",
            "species_name": "物种名称",
            "species_type": "物种类型（platform/manufacturer/supplier/customer/competitor）",
            "ecological_niche": "生态位描述",
            "importance_level": "重要性级别（critical/high/medium/low）",
            "competitive_advantage": "竞争优势",
            "influence_scope": "影响力范围",
            "relationships": [
                {{
                    "related_species": "关联物种",
                    "relationship_type": "关系类型（cooperation/competition/supply/partnership）",
                    "relationship_strength": "关系强度（1-10）"
                }}
            ]
        }}
    ],
    "ecosystem_dynamics": {{
        "current_stability": "当前稳定性（stable/evolving/unstable）",
        "evolution_trends": [
            {{
                "trend_id": "唯一ID",
                "trend_name": "趋势名称",
                "trend_description": "趋势描述",
                "drivers": ["驱动因素1", "驱动因素2"],
                "expected_impact": "预期影响",
                "timeframe": "时间框架",
                "confidence_level": "置信度（low/medium/high）"
            }}
        ],
        "disruption_factors": [
            {{
                "factor_id": "唯一ID",
                "factor_name": "扰动因素名称",
                "factor_type": "因素类型（technology/market/policy/regulatory）",
                "impact_level": "影响程度（low/medium/high）",
                "affected_species": ["受影响的物种1", "受影响的物种2"],
                "adaptation_strategies": ["适应策略1", "适应策略2"]
            }}
        ]
    }},
    "dital_transformation_impact": {{
        "direct_impacts": [
            {{
                "impact_id": "唯一ID",
                "impact_area": "影响领域",
                "impact_description": "影响描述",
                "affected_species": ["受影响物种1", "受影响物种2"],
                "nature_of_change": "变化性质（enhancement/disruption/transformation）",
                "magnitude": "变化幅度（low/medium/high）"
            }}
        ],
        "emerging_ecological_niches": [
            {{
                "niche_id": "唯一ID",
                "niche_name": "新兴生态位名称",
                "niche_description": "生态位描述",
                "required_capabilities": ["所需能力1", "所需能力2"],
                "potential_species": ["潜在进入者1", "潜在进入者2"],
                "time_to_emerge": "出现时间",
                "growth_potential": "增长潜力（low/medium/high）"
            }}
        ],
        "species_evolution_paths": [
            {{
                "species": "物种名称",
                "current_state": "当前状态",
                "evolution_stages": [
                    {{
                        "stage_name": "阶段名称",
                        "transformation_needed": "需要的转型",
                        "capabilities_to_acquire": ["需要获得的能力1", "需要获得的能力2"],
                        "timeframe": "时间框架"
                    }}
                ]
            }}
        ]
    }},
    "strategic_recommendations": [
        {{
            "recommendation_id": "唯一ID",
            "title": "建议标题",
            "target_audience": "目标受众",
            "recommendation_category": "建议类别（positioning/partnership/innovation/adaptation）",
            "description": "详细描述",
            "action_steps": ["行动步骤1", "行动步骤2", "行动步骤3"],
            "expected_benefits": ["预期收益1", "预期收益2"],
            "risks": ["风险1", "风险2"],
            "priority": "优先级（high/medium/low）",
            "timeline": "时间线"
        }}
    ],
    "ecosystem_health_metrics": {{
        "diversity_index": "多样性指数（0-1）",
        "resilience_score": "韧性得分（0-10）",
        "innovation_capacity": "创新能力（0-10）",
        "stability_index": "稳定性指数（0-10）",
        "growth_potential": "增长潜力（0-10）",
        "overall_health_score": "整体健康度（0-10）"
    }}
}}

重要提示：
1. 所有分析都必须基于提供的数字化转型分析结果
2. 识别的关键物种要具体、有代表性
3. 生态系统分析要深入、有洞察力
4. 数字化转型影响分析要具体、有预测性
5. 严格遵循JSON格式，不要输出任何其他文字"""

        try:
            # 调用LLM
            response = chat_with_llm(
                prompt=user_prompt,
                system_prompt=system_prompt,
                provider=self.llm_provider,
                temperature=0.7,
                max_tokens=5000,
                api_key=self.llm_api_key,
                model=self.llm_model
            )

            # 解析JSON响应
            try:
                result = json.loads(response)

                # 添加元数据
                result["metadata"] = {
                    "llm_provider": self.llm_provider,
                    "llm_model": self.llm_model,
                    "analysis_timestamp": self._get_timestamp()
                }

                return result

            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                # 返回错误信息（也必须是JSON）
                return {
                    "error": "LLM返回的JSON格式无效",
                    "raw_response": response,
                    "error_details": str(e)
                }

        except Exception as e:
            logger.error(f"生态系统分析失败: {e}")
            return {
                "error": str(e),
                "error_type": "analysis_failure"
            }

    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        import time
        return time.strftime("%Y-%m-%d %H:%M:%S")


def main():
    """主函数 - 测试生态系统分析"""
    import argparse

    parser = argparse.ArgumentParser(description="生态系统分析 - 第三阶段")
    parser.add_argument("--input_file", type=str, required=True, help="第二阶段数字化转型的分析结果文件")
    parser.add_argument("--llm_provider", type=str, default="openai", help="LLM提供商")
    parser.add_argument("--llm_model", type=str, help="LLM模型名称")
    parser.add_argument("--llm_api_key", type=str, help="LLM API密钥")
    parser.add_argument("--output_file", type=str, help="输出文件路径")

    args = parser.parse_args()

    # 加载第二阶段的分析结果
    with open(args.input_file, 'r', encoding='utf-8') as f:
        digital_transformation_result = json.load(f)

    # 初始化分析器
    analyzer = EcosystemAnalysis(
        llm_provider=args.llm_provider,
        llm_model=args.llm_model,
        llm_api_key=args.llm_api_key
    )

    # 执行分析
    print(f"\n{'='*70}")
    print(f"生态系统分析 - 第三阶段")
    print(f"{'='*70}\n")

    result = analyzer.analyze_ecosystem(digital_transformation_result)

    # 输出结果（仅JSON，无其他文本）
    if args.output_file:
        with open(args.output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        # 注意：这里也不输出任何文字，只写入文件
    else:
        # 直接输出JSON，不包含任何其他文字
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
