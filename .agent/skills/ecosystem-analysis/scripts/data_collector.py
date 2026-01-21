#!/usr/bin/env python3
"""
数据收集和预处理模块（第一阶段）
处理行业和生态系统的基础数据收集
"""

import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

# 导入数据集成器
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "digital-transformation" / "scripts"))
from data_integrator import DataIntegrator

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataCollector:
    """数据收集器 - 第一阶段"""

    def __init__(self):
        """初始化数据收集器"""
        self.data_integrator = DataIntegrator()
        logger.info("数据收集器初始化完成")

    def collect_industry_and_ecosystem_data(
        self,
        industry_name: str,
        collection_depth: str = "standard_depth",
        num_entities: int = 20
    ) -> Dict[str, Any]:
        """
        收集行业和生态系统数据

        Args:
            industry_name: 行业名称
            collection_depth: 收集深度（basic_depth/standard_depth/comprehensive_depth）
            num_entities: 实体数量

        Returns:
            收集的数据
        """
        logger.info(f"开始收集行业和生态系统数据: {industry_name}")

        # 1. 收集行业数据
        logger.info("  1. 收集行业数据...")
        industry_data = self.data_integrator.collect_industry_data(
            industry_name=industry_name
        )

        # 2. 识别主要企业（从行业数据中提取）
        logger.info("  2. 识别主要企业...")
        # 这里可以添加逻辑从行业数据中提取企业列表
        # 目前使用示例企业列表
        sample_companies = [
            f"{industry_name}龙头企业",
            f"{industry_name}供应商A",
            f"{industry_name}供应商B",
            f"{industry_name}客户企业A",
            f"{industry_name}竞争对手A"
        ]

        # 3. 收集主要企业的数据
        logger.info("  3. 收集企业数据...")
        company_data = {}
        for company in sample_companies:
            company_data[company] = self.data_integrator.collect_company_data(company)

        # 4. 收集生态系统数据
        logger.info("  4. 收集生态系统数据...")
        # 从数据集成器导入生态系统数据收集器
        try:
            from ecosystem_data_integrator import EcosystemDataIntegrator
            ecosystem_integrator = EcosystemDataIntegrator()

            ecosystem_data = ecosystem_integrator.collect_ecosystem_data_comprehensive(
                industry_name=industry_name,
                num_entities=num_entities,
                include_market_data=True
            )
        except ImportError:
            logger.warning("  生态系统数据集成器不可用，使用基本数据")
            ecosystem_data = {
                "entities": [],
                "relationships": [],
                "market_data": industry_data
            }

        # 5. 整合所有数据
        logger.info("  5. 整合数据...")
        collected_data = {
            "industry_name": industry_name,
            "collection_depth": collection_depth,
            "industry_data": industry_data,
            "company_data": company_data,
            "ecosystem_data": ecosystem_data,
            "data_sources": {
                "industry_data": ["industry_report"],
                "company_data": ["baidu_search", "company_website", "news_media", "government_info"],
                "ecosystem_data": ["generated", "industry_report"]
            },
            "collection_timestamp": self._get_timestamp()
        }

        logger.info(f"数据收集完成:")
        logger.info(f"  行业数据: {len(industry_data)} 个字段")
        logger.info(f"  企业数据: {len(company_data)} 个企业")
        logger.info(f"  生态系统数据: {len(ecosystem_data.get('entities', []))} 个实体")

        return collected_data

    def validate_collected_data(
        self,
        collected_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        验证收集的数据

        Args:
            collected_data: 收集的数据

        Returns:
            验证结果
        """
        logger.info("开始验证收集的数据...")

        validation_result = {
            "is_valid": True,
            "issues": [],
            "warnings": []
        }

        # 检查必需的字段
        required_fields = [
            "industry_name",
            "industry_data",
            "company_data",
            "ecosystem_data"
        ]

        for field in required_fields:
            if field not in collected_data:
                validation_result["is_valid"] = False
                validation_result["issues"].append(f"缺少必需字段: {field}")

        # 检查行业数据
        if "industry_data" in collected_data:
            industry_data = collected_data["industry_data"]
            if "market_size" not in industry_data:
                validation_result["warnings"].append("行业数据缺少 market_size 字段")

        # 检查企业数据
        if "company_data" in collected_data:
            company_data = collected_data["company_data"]
            if not company_data:
                validation_result["warnings"].append("未收集到企业数据")

        # 检查生态系统数据
        if "ecosystem_data" in collected_data:
            ecosystem_data = collected_data["ecosystem_data"]
            entities = ecosystem_data.get("entities", [])
            if not entities:
                validation_result["warnings"].append("未收集到生态系统实体")
            elif len(entities) < 5:
                validation_result["warnings"].append(f"生态系统实体数量较少: {len(entities)}")

        logger.info("数据验证完成")
        return validation_result

    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        import time
        return time.strftime("%Y-%m-%d %H:%M:%S")


def main():
    """主函数 - 测试数据收集器"""
    import argparse

    parser = argparse.ArgumentParser(description="数据收集器 - 第一阶段")
    parser.add_argument("--industry", type=str, required=True, help="行业名称")
    parser.add_argument("--depth", type=str, default="standard_depth", help="收集深度")
    parser.add_argument("--num_entities", type=int, default=20, help="实体数量")
    parser.add_argument("--output_file", type=str, help="输出文件路径")

    args = parser.parse_args()

    # 初始化收集器
    collector = DataCollector()

    # 收集数据
    print(f"\n{'='*70}")
    print(f"数据收集 - 第一阶段")
    print(f"{'='*70}\n")

    data = collector.collect_industry_and_ecosystem_data(
        industry_name=args.industry,
        collection_depth=args.depth,
        num_entities=args.num_entities
    )

    # 验证数据
    validation = collector.validate_collected_data(data)

    print(f"\n{'='*70}")
    print(f"验证结果")
    print(f"{'='*70}")
    print(f"数据有效性: {'✓ 有效' if validation['is_valid'] else '✗ 无效'}")

    if validation["issues"]:
        print(f"\n问题:")
        for issue in validation["issues"]:
            print(f"  ✗ {issue}")

    if validation["warnings"]:
        print(f"\n警告:")
        for warning in validation["warnings"]:
            print(f"  ! {warning}")

    # 保存数据
    if args.output_file:
        with open(args.output_file, 'w', encoding='utf-8') as f:
            output_data = {
                "collected_data": data,
                "validation": validation
            }
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"\n数据已保存到: {args.output_file}")
    else:
        print("\n收集的数据:")
        print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
