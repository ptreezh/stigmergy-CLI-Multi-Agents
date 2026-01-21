#!/usr/bin/env python3
"""
数字化转型分析模块（第二阶段）
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


class DigitalTransformationAnalysis:
    """数字化转型分析 - 第二阶段"""

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

    def analyze_digital_transformation(
        self,
        collected_data: Dict[str, Any],
        analysis_focus: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        执行数字化转型分析

        Args:
            collected_data: 第一阶段收集的数据
            analysis_focus: 分析焦点（可选）

        Returns:
            分析结果（严格JSON格式）
        """
        # 提取关键信息用于LLM提示
        industry_name = collected_data.get("industry_name", "未知行业")
        industry_data = collected_data.get("industry_data", {})
        company_data = collected_data.get("company_data", {})

        # 构建系统提示
        system_prompt = f"""你是一位数字化转型分析专家，专门分析{industry_name}行业的数字化机会和挑战。

你的任务是深入分析该行业的数字化转型现状、机会和挑战，并提供专业的建议。

分析要求：
1. 基于提供的行业和企业数据进行深度分析
2. 识别数字化转型的关键机会
3. 评估数字化转型的挑战和风险
4. 提供具体、可操作的建议

输出要求：
- 必须严格按照JSON格式输出
- 不包含任何JSON之外的文本
- 不包含任何解释性文字
- 只返回JSON对象"""

        # 构建用户提示
        user_prompt = f"""请对{industry_name}行业的数字化转型进行全面深入分析。

行业数据：
{json.dumps(industry_data, ensure_ascii=False, indent=2)}

企业数据：
{json.dumps(company_data, ensure_ascii=False, indent=2)[:2000]}

请按照以下JSON格式返回分析结果：
{{
    "analysis_type": "digital_transformation_analysis",
    "industry_name": "{industry_name}",
    "analysis_timestamp": "当前时间戳",
    "current_digitalization_level": {{
        "overall_level": "评估整体数字化水平（1-10分）",
        "digitization_score": "数字化得分（1-10）",
        "online_score": "在线化得分（1-10）",
        "intelligent_score": "智能化得分（1-10）",
        "assessment": "评估说明"
    }},
    "dital_transformation_opportunities": [
        {{
            "opportunity_id": "唯一ID",
            "name": "机会名称",
            "type": "机会类型（digitization/online/intelligent）",
            "description": "详细描述",
            "business_value": "商业价值说明",
            "estimated_roi": "预估ROI",
            "implementation_difficulty": "实施难度（easy/medium/hard）",
            "timeframe": "实施时间框架",
            "priority": "优先级（high/medium/low）",
            "success_factors": ["成功因素1", "成功因素2"]
        }}
    ],
    "dital_transformation_challenges": [
        {{
            "challenge_id": "唯一ID",
            "name": "挑战名称",
            "type": "挑战类型（technical/organizational/cultural/financial）",
            "description": "详细描述",
            "impact_level": "影响程度（low/medium/high）",
            "mitigation_strategies": ["缓解策略1", "缓解策略2"]
        }}
    ],
    "strategic_recommendations": [
        {{
            "recommendation_id": "唯一ID",
            "title": "建议标题",
            "category": "建议类别（strategy/technology/organization/process）",
            "description": "详细描述",
            "action_items": ["行动项1", "行动项2", "行动项3"],
            "expected_outcomes": ["预期成果1", "预期成果2"],
            "timeline": "时间线",
            "resource_requirements": "资源需求说明"
        }}
    ],
    "dital_transformation_roadmap": {{
        "phase1": {{
            "name": "第一阶段（0-6个月）",
            "objectives": ["目标1", "目标2"],
            "key_initiatives": ["关键举措1", "关键举措2"],
            "milestones": ["里程碑1", "里程碑2"]
        }},
        "phase2": {{
            "name": "第二阶段（6-18个月）",
            "objectives": ["目标1", "目标2"],
            "key_initiatives": ["关键举措1", "关键举措2"],
            "milestones": ["里程碑1", "里程碑2"]
        }},
        "phase3": {{
            "name": "第三阶段（18-36个月）",
            "objectives": ["目标1", "目标2"],
            "key_initiatives": ["关键举措1", "关键举措2"],
            "milestones": ["里程碑1", "里程碑2"]
        }}
    }},
    "key_success_metrics": [
        {{
            "metric_name": "指标名称",
            "metric_type": "指标类型（efficiency/revenue/customer/experience）",
            "current_value": "当前值",
            "target_value": "目标值",
            "measurement_method": "测量方法"
        }}
    ]
}}

重要提示：
1. 所有分析都必须基于提供的具体数据
2. 识别的机会和挑战要具体、有洞察力
3. 建议要可操作、可实施
4. 严格遵循JSON格式，不要输出任何其他文字"""

        try:
            # 调用LLM
            response = chat_with_llm(
                prompt=user_prompt,
                system_prompt=system_prompt,
                provider=self.llm_provider,
                temperature=0.7,
                max_tokens=4000,
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
            logger.error(f"数字化转型分析失败: {e}")
            return {
                "error": str(e),
                "error_type": "analysis_failure"
            }

    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        import time
        return time.strftime("%Y-%m-%d %H:%M:%S")


def main():
    """主函数 - 测试数字化转型分析"""
    import argparse

    parser = argparse.ArgumentParser(description="数字化转型分析 - 第二阶段")
    parser.add_argument("--input_file", type=str, required=True, help="第一阶段收集的数据文件")
    parser.add_argument("--llm_provider", type=str, default="openai", help="LLM提供商")
    parser.add_argument("--llm_model", type=str, help="LLM模型名称")
    parser.add_argument("--llm_api_key", type=str, help="LLM API密钥")
    parser.add_argument("--output_file", type=str, help="输出文件路径")

    args = parser.parse_args()

    # 加载第一阶段收集的数据
    with open(args.input_file, 'r', encoding='utf-8') as f:
        input_data = json.load(f)

    collected_data = input_data.get("collected_data", {})

    # 初始化分析器
    analyzer = DigitalTransformationAnalysis(
        llm_provider=args.llm_provider,
        llm_model=args.llm_model,
        llm_api_key=args.llm_api_key
    )

    # 执行分析
    print(f"\n{'='*70}")
    print(f"数字化转型分析 - 第二阶段")
    print(f"{'='*70}\n")

    result = analyzer.analyze_digital_transformation(collected_data)

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
