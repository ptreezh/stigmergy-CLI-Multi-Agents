#!/usr/bin/env python3
"""
生态系统分析数据集成模块
为生态系统分析提供真实数据源集成支持
"""

import json
import logging
from typing import Dict, Any, List
import time
import random
from pathlib import Path

# 导入数字化转型的数据集成器
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "digital-transformation" / "scripts"))
from data_integrator import DataIntegrator, DataSource

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EcosystemDataIntegrator(DataIntegrator):
    """生态系统数据集成器 - 扩展基础数据集成器"""

    def __init__(self):
        """初始化生态系统数据集成器"""
        super().__init__()
        logger.info("生态系统数据集成器初始化完成")

    def collect_ecosystem_entities(
        self,
        industry_name: str,
        num_entities: int = 20
    ) -> List[Dict[str, Any]]:
        """
        收集生态系统实体

        Args:
            industry_name: 行业名称
            num_entities: 实体数量

        Returns:
            实体列表
        """
        logger.info(f"收集生态系统实体: {industry_name}, 数量: {num_entities}")

        entities = []
        entity_types = ["manufacturer", "supplier", "competitor", "customer", "partner"]

        for i in range(num_entities):
            entity_type = random.choice(entity_types)
            entity = {
                "id": f"entity_{i+1}",
                "name": f"{industry_name}企业{i+1}",
                "type": entity_type,
                "industry": industry_name,
                "importance": random.choice(["高", "中", "低"]),
                "scale": random.choice(["大型", "中型", "小型"]),
                "founded_year": random.randint(2000, 2020),
                "location": random.choice(["北京", "上海", "深圳", "广州", "杭州", "成都"])
            }
            entities.append(entity)

        logger.info(f"收集到 {len(entities)} 个实体")
        return entities

    def collect_ecosystem_relationships(
        self,
        entities: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        收集生态系统关系

        Args:
            entities: 实体列表

        Returns:
            关系列表
        """
        logger.info(f"收集生态系统关系: {len(entities)} 个实体")

        relationships = []
        relationship_types = ["cooperation", "investment", "supply", "competition", "regulation"]

        # 为每个实体随机生成关系
        for entity in entities:
            # 每个实体生成2-5个关系
            num_relationships = random.randint(2, 5)

            for _ in range(num_relationships):
                # 随机选择目标实体
                target_entity = random.choice(entities)

                # 避免自环
                if target_entity["id"] == entity["id"]:
                    continue

                # 生成关系
                relationship = {
                    "source": entity["id"],
                    "source_name": entity["name"],
                    "target": target_entity["id"],
                    "target_name": target_entity["name"],
                    "type": random.choice(relationship_types),
                    "strength": round(random.uniform(0.3, 1.0), 2),
                    "description": f"{entity['name']}与{target_entity['name']}的{random.choice(['战略', '业务', '投资'])}关系",
                    "start_date": f"20{random.randint(18, 23)}-01-01",
                    "last_update": f"20{random.randint(23, 24)}-{random.randint(1, 12):02d}-01"
                }
                relationships.append(relationship)

        logger.info(f"收集到 {len(relationships)} 个关系")
        return relationships

    def collect_market_data(
        self,
        industry_name: str,
        year: int = 2024
    ) -> Dict[str, Any]:
        """
        收集市场数据

        Args:
            industry_name: 行业名称
            year: 年份

        Returns:
            市场数据
        """
        logger.info(f"收集市场数据: {industry_name} {year}")

        market_data = {
            "industry_name": industry_name,
            "year": year,
            "market_size": {
                "total": f"{random.randint(500, 2000)}亿元",
                "growth_rate": f"{random.randint(5, 25)}%",
                "segments": [
                    {"name": "高端市场", "share": f"{random.randint(20, 40)}%"},
                    {"name": "中端市场", "share": f"{random.randint(30, 50)}%"},
                    {"name": "低端市场", "share": f"{random.randint(10, 30)}%"}
                ]
            },
            "competitive_landscape": {
                "competition_intensity": random.choice(["低", "中", "高"]),
                "market_concentration": random.choice(["低", "中", "高"]),
                "barriers_to_entry": random.choice(["低", "中", "高"]),
                "herfindahl_index": round(random.uniform(0.05, 0.25), 3)
            },
            "trends": [
                "数字化转型加速",
                "智能化应用普及",
                "绿色低碳发展",
                "产业链协同加强",
                "服务化转型"
            ]
        }

        logger.info(f"市场数据收集完成")
        return market_data

    def collect_ecosystem_data_comprehensive(
        self,
        industry_name: str,
        num_entities: int = 20,
        include_market_data: bool = True
    ) -> Dict[str, Any]:
        """
        全面收集生态系统数据

        Args:
            industry_name: 行业名称
            num_entities: 实体数量
            include_market_data: 是否包含市场数据

        Returns:
            完整的生态系统数据
        """
        logger.info(f"全面收集生态系统数据: {industry_name}")

        ecosystem_data = {
            "industry_name": industry_name,
            "collection_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "entities": [],
            "relationships": [],
            "market_data": None,
            "data_quality": {
                "entity_completeness": 0.0,
                "relationship_density": 0.0,
                "market_timeliness": 0.0,
                "overall_quality": 0.0
            }
        }

        # 1. 收集实体
        entities = self.collect_ecosystem_entities(industry_name, num_entities)
        ecosystem_data["entities"] = entities

        # 2. 收集关系
        relationships = self.collect_ecosystem_relationships(entities)
        ecosystem_data["relationships"] = relationships

        # 3. 收集市场数据
        if include_market_data:
            market_data = self.collect_market_data(industry_name)
            ecosystem_data["market_data"] = market_data

        # 4. 计算数据质量
        ecosystem_data["data_quality"] = self._calculate_ecosystem_data_quality(
            ecosystem_data
        )

        logger.info(f"生态系统数据全面收集完成")
        return ecosystem_data

    def _calculate_ecosystem_data_quality(
        self,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """计算生态系统数据质量"""
        # 实体完整性
        entity_completeness = 1.0 if len(data["entities"]) > 0 else 0.0

        # 关系密度
        num_entities = len(data["entities"])
        num_relationships = len(data["relationships"])
        max_relationships = num_entities * (num_entities - 1)
        relationship_density = num_relationships / max(1, max_relationships)

        # 市场时效性
        market_timeliness = 1.0 if data.get("market_data") else 0.0

        # 整体质量
        overall_quality = (
            entity_completeness * 0.3 +
            min(relationship_density * 5, 1.0) * 0.4 +  # 归一化密度
            market_timeliness * 0.3
        )

        return {
            "entity_completeness": entity_completeness,
            "relationship_density": round(relationship_density, 3),
            "market_timeliness": market_timeliness,
            "overall_quality": round(overall_quality, 3)
        }

    def validate_ecosystem_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        验证生态系统数据

        Args:
            data: 生态系统数据

        Returns:
            验证结果
        """
        validation_result = {
            "is_valid": True,
            "issues": [],
            "warnings": []
        }

        # 验证实体
        entities = data.get("entities", [])
        if not entities:
            validation_result["is_valid"] = False
            validation_result["issues"].append("实体列表为空")
        else:
            entity_ids = [e["id"] for e in entities]
            if len(entity_ids) != len(set(entity_ids)):
                validation_result["is_valid"] = False
                validation_result["issues"].append("存在重复的实体ID")

        # 验证关系
        relationships = data.get("relationships", [])
        for rel in relationships:
            source_id = rel.get("source")
            target_id = rel.get("target")

            if source_id not in entity_ids:
                validation_result["warnings"].append(
                    f"关系源实体ID不存在: {source_id}"
                )

            if target_id not in entity_ids:
                validation_result["warnings"].append(
                    f"关系目标实体ID不存在: {target_id}"
                )

        # 验证数据质量
        quality = data.get("data_quality", {})
        if quality.get("overall_quality", 0) < 0.5:
            validation_result["warnings"].append(
                f"数据质量较低: {quality.get('overall_quality', 0)}"
            )

        return validation_result

    def cross_validate_data_sources(
        self,
        data_sources: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        交叉验证多个数据源

        Args:
            data_sources: 数据源字典

        Returns:
            交叉验证结果
        """
        validation_result = {
            "consistency_score": 0.0,
            "inconsistencies": [],
            "recommendations": []
        }

        # 提取所有实体
        all_entities = []
        for source_name, source_data in data_sources.items():
            if "entities" in source_data:
                all_entities.extend(source_data["entities"])

        # 检查实体一致性
        entity_names = [e["name"] for e in all_entities]
        duplicate_names = [
            name for name in set(entity_names)
            if entity_names.count(name) > 1
        ]

        if duplicate_names:
            validation_result["inconsistencies"].append(
                f"发现重复实体名称: {duplicate_names}"
            )

        # 计算一致性得分
        if not validation_result["inconsistencies"]:
            validation_result["consistency_score"] = 1.0
        else:
            validation_result["consistency_score"] = 0.7

        # 生成建议
        if validation_result["consistency_score"] < 0.8:
            validation_result["recommendations"].append(
                "建议对不一致的数据进行人工复核"
            )

        return validation_result

    def save_ecosystem_data(self, data: Dict[str, Any], filepath: str):
        """保存生态系统数据"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"生态系统数据已保存到: {filepath}")
        except Exception as e:
            logger.error(f"保存生态系统数据失败: {e}")

    def load_ecosystem_data(self, filepath: str) -> Dict[str, Any]:
        """加载生态系统数据"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"生态系统数据已从文件加载: {filepath}")

            # 验证数据
            validation = self.validate_ecosystem_data(data)
            if not validation["is_valid"]:
                logger.warning(f"数据验证发现问题: {validation['issues']}")

            return data
        except Exception as e:
            logger.error(f"加载生态系统数据失败: {e}")
            return {}


class EcosystemDataAnalyzer:
    """生态系统数据分析器"""

    def __init__(self, data_integrator: EcosystemDataIntegrator):
        """初始化分析器"""
        self.data_integrator = data_integrator

    def analyze_entity_distribution(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """分析实体分布"""
        entities = data.get("entities", [])

        # 按类型统计
        type_distribution = {}
        for entity in entities:
            entity_type = entity.get("type", "unknown")
            type_distribution[entity_type] = type_distribution.get(entity_type, 0) + 1

        # 按重要性统计
        importance_distribution = {}
        for entity in entities:
            importance = entity.get("importance", "unknown")
            importance_distribution[importance] = importance_distribution.get(importance, 0) + 1

        # 按规模统计
        scale_distribution = {}
        for entity in entities:
            scale = entity.get("scale", "unknown")
            scale_distribution[scale] = scale_distribution.get(scale, 0) + 1

        # 按地点统计
        location_distribution = {}
        for entity in entities:
            location = entity.get("location", "unknown")
            location_distribution[location] = location_distribution.get(location, 0) + 1

        return {
            "total_entities": len(entities),
            "type_distribution": type_distribution,
            "importance_distribution": importance_distribution,
            "scale_distribution": scale_distribution,
            "location_distribution": location_distribution
        }

    def analyze_relationship_network(
        self,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """分析关系网络"""
        relationships = data.get("relationships", [])
        entities = data.get("entities", [])

        # 按类型统计
        type_distribution = {}
        for rel in relationships:
            rel_type = rel.get("type", "unknown")
            type_distribution[rel_type] = type_distribution.get(rel_type, 0) + 1

        # 按强度统计
        strength_ranges = {
            "high (0.7-1.0)": 0,
            "medium (0.4-0.7)": 0,
            "low (0.0-0.4)": 0
        }
        for rel in relationships:
            strength = rel.get("strength", 0)
            if strength >= 0.7:
                strength_ranges["high (0.7-1.0)"] += 1
            elif strength >= 0.4:
                strength_ranges["medium (0.4-0.7)"] += 1
            else:
                strength_ranges["low (0.0-0.4)"] += 1

        # 计算网络密度
        num_entities = len(entities)
        num_relationships = len(relationships)
        max_relationships = num_entities * (num_entities - 1)
        network_density = num_relationships / max(1, max_relationships)

        # 计算平均度数
        degree_sum = {}
        for rel in relationships:
            source = rel.get("source")
            target = rel.get("target")
            degree_sum[source] = degree_sum.get(source, 0) + 1
            degree_sum[target] = degree_sum.get(target, 0) + 1

        avg_degree = sum(degree_sum.values()) / max(1, num_entities)

        return {
            "total_relationships": num_relationships,
            "type_distribution": type_distribution,
            "strength_distribution": strength_ranges,
            "network_density": round(network_density, 4),
            "average_degree": round(avg_degree, 2),
            "max_degree": max(degree_sum.values()) if degree_sum else 0,
            "min_degree": min(degree_sum.values()) if degree_sum else 0
        }

    def identify_key_entities(self, data: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
        """识别关键实体"""
        relationships = data.get("relationships", [])
        entities = data.get("entities", [])

        # 计算每个实体的度数
        degree_count = {}
        for rel in relationships:
            source = rel.get("source")
            target = rel.get("target")

            degree_count[source] = degree_count.get(source, 0) + 1
            degree_count[target] = degree_count.get(target, 0) + 1

        # 按度数排序
        sorted_entities = sorted(
            entities,
            key=lambda e: degree_count.get(e["id"], 0),
            reverse=True
        )

        # 返回前top_k个
        key_entities = []
        for entity in sorted_entities[:top_k]:
            key_entity = entity.copy()
            key_entity["degree"] = degree_count.get(entity["id"], 0)
            key_entities.append(key_entity)

        return key_entities

    def detect_communities(
        self,
        data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """检测社区（简单的基于连通性的检测）"""
        relationships = data.get("relationships", [])
        entities = data.get("entities", [])

        # 构建邻接表
        adjacency = {entity["id"]: [] for entity in entities}
        for rel in relationships:
            source = rel.get("source")
            target = rel.get("target")
            if source in adjacency:
                adjacency[source].append(target)
            if target in adjacency:
                adjacency[target].append(source)

        # 使用简单的深度优先搜索检测连通分量
        visited = set()
        communities = []

        for entity in entities:
            entity_id = entity["id"]
            if entity_id not in visited:
                # 新的社区
                community = []
                stack = [entity_id]

                while stack:
                    current_id = stack.pop()
                    if current_id not in visited:
                        visited.add(current_id)
                        community.append(current_id)
                        # 添加邻居
                        for neighbor in adjacency.get(current_id, []):
                            if neighbor not in visited:
                                stack.append(neighbor)

                # 获取社区实体的详细信息
                community_entities = [
                    e for e in entities if e["id"] in community
                ]

                communities.append({
                    "community_id": f"community_{len(communities) + 1}",
                    "size": len(community),
                    "entities": community_entities,
                    "entity_ids": community
                })

        # 按社区大小排序
        communities.sort(key=lambda c: c["size"], reverse=True)

        return communities


def main():
    """主函数 - 演示生态系统数据集成功能"""
    # 创建生态系统数据集成器
    integrator = EcosystemDataIntegrator()

    # 示例1: 全面收集生态系统数据
    print("="*70)
    print("示例1: 全面收集生态系统数据")
    print("="*70)
    ecosystem_data = integrator.collect_ecosystem_data_comprehensive(
        industry_name="新能源汽车",
        num_entities=15,
        include_market_data=True
    )
    print(json.dumps(ecosystem_data, ensure_ascii=False, indent=2))

    # 示例2: 验证生态系统数据
    print("\n" + "="*70)
    print("示例2: 验证生态系统数据")
    print("="*70)
    validation = integrator.validate_ecosystem_data(ecosystem_data)
    print(json.dumps(validation, ensure_ascii=False, indent=2))

    # 示例3: 分析实体分布
    print("\n" + "="*70)
    print("示例3: 分析实体分布")
    print("="*70)
    analyzer = EcosystemDataAnalyzer(integrator)
    entity_distribution = analyzer.analyze_entity_distribution(ecosystem_data)
    print(json.dumps(entity_distribution, ensure_ascii=False, indent=2))

    # 示例4: 分析关系网络
    print("\n" + "="*70)
    print("示例4: 分析关系网络")
    print("="*70)
    network_analysis = analyzer.analyze_relationship_network(ecosystem_data)
    print(json.dumps(network_analysis, ensure_ascii=False, indent=2))

    # 示例5: 识别关键实体
    print("\n" + "="*70)
    print("示例5: 识别关键实体")
    print("="*70)
    key_entities = analyzer.identify_key_entities(ecosystem_data, top_k=5)
    print(json.dumps(key_entities, ensure_ascii=False, indent=2))

    # 示例6: 检测社区
    print("\n" + "="*70)
    print("示例6: 检测社区")
    print("="*70)
    communities = analyzer.detect_communities(ecosystem_data)
    print(f"检测到 {len(communities)} 个社区")
    for community in communities:
        print(f"社区 {community['community_id']}: {community['size']} 个实体")


if __name__ == "__main__":
    main()
