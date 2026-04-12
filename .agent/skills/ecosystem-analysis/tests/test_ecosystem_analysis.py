#!/usr/bin/env python3
"""
商业生态系统分析器完整测试套件
包括单元测试、集成测试和性能测试
"""

import unittest
import json
import tempfile
import os
from pathlib import Path
import sys

# 添加技能模块到路径
skill_dir = Path(__file__).parent.parent
sys.path.insert(0, str(skill_dir))

from scripts.business_ecosystem_analyzer import (
    BusinessEcosystemAnalyzer,
    AnalysisType
)


class TestBusinessEcosystemAnalyzerInit(unittest.TestCase):
    """测试商业生态系统分析器初始化"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()

    def test_analyzer_initialization(self):
        """测试分析器初始化"""
        self.assertIsInstance(self.analyzer, BusinessEcosystemAnalyzer)
        self.assertIsNotNone(self.analyzer)


class TestIndustryEcosystemAnalysis(unittest.TestCase):
    """测试行业生态系统分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.industry_context = {
            "targetIndustry": "新能源汽车",
            "analysis_objectives": ["行业生态分析", "关键企业识别"],
            "geographic_scope": "中国"
        }

    def test_perform_industry_ecosystem_analysis_structure(self):
        """测试行业生态系统分析结构"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.industry_context
        )

        # 验证基本结构
        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "performing-industry-ecosystem-analysis"
        )
        self.assertIn("industry_context", result)
        self.assertIn("industry_structure", result)
        self.assertIn("participants", result)
        self.assertIn("value_chain", result)

    def test_industry_structure_content(self):
        """测试行业结构内容"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.industry_context
        )
        industry_structure = result["industry_structure"]

        self.assertIn("life_cycle_stage", industry_structure)
        self.assertIn("market_structure", industry_structure)
        self.assertIn("value_distribution", industry_structure)
        self.assertIn("external_factors", industry_structure)
        self.assertIn("innovation_trends", industry_structure)

    def test_participants_list(self):
        """测试参与者列表"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.industry_context
        )
        participants = result["participants"]

        self.assertIsInstance(participants, list)
        self.assertGreater(len(participants), 0)

        # 验证参与者结构
        for participant in participants:
            self.assertIn("name", participant)
            self.assertIn("role", participant)

    def test_value_chain_content(self):
        """测试价值链内容"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.industry_context
        )
        value_chain = result["value_chain"]

        self.assertIn("primary_activities", value_chain)
        self.assertIn("support_activities", value_chain)

        self.assertIsInstance(value_chain["primary_activities"], list)
        self.assertIsInstance(value_chain["support_activities"], list)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.industry_context
        )
        output_results = result["output_results"]

        self.assertIn("ecosystem_structure_map", output_results)
        self.assertIn("participant_classification_matrix", output_results)
        self.assertIn("value_chain_analysis_diagram", output_results)
        self.assertIn("competition_landscape_report", output_results)
        self.assertIn("industry_trend_prediction", output_results)


class TestKeySpeciesIdentification(unittest.TestCase):
    """测试关键物种识别"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.ecosystem_analysis = {
            "industry_context": {
                "targetIndustry": "新能源汽车"
            },
            "participants": [
                {"name": "企业A", "role": "制造商"},
                {"name": "企业B", "role": "供应商"}
            ]
        }

    def test_identify_key_species_structure(self):
        """测试关键物种识别结构"""
        result = self.analyzer.identify_key_species(self.ecosystem_analysis)

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "identifying-key-species-in-industry"
        )
        self.assertIn("ecosystem_analysis", result)
        self.assertIn("key_species", result)
        self.assertIn("influence_assessment", result)

    def test_key_species_list(self):
        """测试关键物种列表"""
        result = self.analyzer.identify_key_species(self.ecosystem_analysis)
        key_species = result["key_species"]

        self.assertIsInstance(key_species, list)
        self.assertGreater(len(key_species), 0)

        # 验证关键物种结构
        for species in key_species:
            self.assertIn("name", species)
            self.assertIn("importance", species)
            self.assertIn("influence", species)
            self.assertIn("ecological_niche", species)
            self.assertIn("competitive_advantage", species)

    def test_influence_assessment(self):
        """测试影响力评估"""
        result = self.analyzer.identify_key_species(self.ecosystem_analysis)
        influence_assessment = result["influence_assessment"]

        self.assertIn("market_position", influence_assessment)
        self.assertIn("ecological_role", influence_assessment)
        self.assertIn("influence_range", influence_assessment)
        self.assertIn("innovation_capability", influence_assessment)
        self.assertIn("strategic_value", influence_assessment)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.identify_key_species(self.ecosystem_analysis)
        output_results = result["output_results"]

        self.assertIn("key_species_list_ranking", output_results)
        self.assertIn("species_ecological_niche_report", output_results)
        self.assertIn("species_influence_matrix", output_results)
        self.assertIn("species_competitive_advantage", output_results)
        self.assertIn("inter_species_dependency_map", output_results)


class TestBusinessModelAnalysis(unittest.TestCase):
    """测试商业模式分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.key_species = {
            "key_species": [
                {
                    "name": "企业A",
                    "importance": "高",
                    "influence": "行业领导者"
                }
            ]
        }

    def test_analyze_business_model_structure(self):
        """测试商业模式分析结构"""
        result = self.analyzer.analyze_business_model(self.key_species)

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "analyzing-business-model-of-key-species"
        )
        self.assertIn("key_species", result)
        self.assertIn("external_business_model", result)
        self.assertIn("business_model_canvas", result)
        self.assertIn("value_network", result)

    def test_external_business_model(self):
        """测试外部业务模式"""
        result = self.analyzer.analyze_business_model(self.key_species)
        external_model = result["external_business_model"]

        self.assertIn("channel_model", external_model)
        self.assertIn("customer_reach", external_model)
        self.assertIn("service_delivery", external_model)
        self.assertIn("supply_chain", external_model)
        self.assertIn("distribution_network", external_model)

    def test_business_model_canvas(self):
        """测试商业模式画布"""
        result = self.analyzer.analyze_business_model(self.key_species)
        canvas = result["business_model_canvas"]

        self.assertIn("customer_segments", canvas)
        self.assertIn("value_propositions", canvas)
        self.assertIn("channels", canvas)
        self.assertIn("customer_relationships", canvas)
        self.assertIn("revenue_streams", canvas)
        self.assertIn("key_resources", canvas)
        self.assertIn("key_activities", canvas)
        self.assertIn("key_partnerships", canvas)
        self.assertIn("cost_structure", canvas)

    def test_value_network(self):
        """测试价值网络"""
        result = self.analyzer.analyze_business_model(self.key_species)
        value_network = result["value_network"]

        self.assertIn("value_creation", value_network)
        self.assertIn("value_delivery", value_network)
        self.assertIn("value_capture", value_network)
        self.assertIn("resource_allocation", value_network)
        self.assertIn("revenue_model", value_network)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.analyze_business_model(self.key_species)
        output_results = result["output_results"]

        self.assertIn("business_model_canvas_analysis", output_results)
        self.assertIn("value_network_map", output_results)
        self.assertIn("revenue_model_report", output_results)
        self.assertIn("competitive_advantage_assessment", output_results)
        self.assertIn("potential_risk_identification", output_results)


class TestEcosystemMapConstruction(unittest.TestCase):
    """测试生态图谱构建"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.relationships = [
            {
                "source": "entity_1",
                "target": "entity_2",
                "type": "supply",
                "strength": 0.8,
                "description": "供应链关系"
            },
            {
                "source": "entity_2",
                "target": "entity_3",
                "type": "competition",
                "strength": 0.6,
                "description": "竞争关系"
            }
        ]

    def test_construct_ecosystem_map_structure(self):
        """测试生态图谱构建结构"""
        result = self.analyzer.construct_ecosystem_map(self.relationships)

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "constructing-business-ecosystem-map"
        )
        self.assertIn("relationships", result)
        self.assertIn("relationship_mapping", result)
        self.assertIn("ecosystem_elements", result)
        self.assertIn("flow_types", result)

    def test_relationship_mapping(self):
        """测试关系映射"""
        result = self.analyzer.construct_ecosystem_map(self.relationships)
        relationship_mapping = result["relationship_mapping"]

        self.assertIn("connections", relationship_mapping)
        self.assertIn("flow_direction", relationship_mapping)
        self.assertIn("connection_strength", relationship_mapping)
        self.assertIn("flow_type", relationship_mapping)

    def test_ecosystem_elements(self):
        """测试生态图谱要素"""
        result = self.analyzer.construct_ecosystem_map(self.relationships)
        elements = result["ecosystem_elements"]

        self.assertIn("nodes", elements)
        self.assertIn("edges", elements)
        self.assertIn("weights", elements)
        self.assertIn("flows", elements)
        self.assertIn("attributes", elements)

    def test_flow_types(self):
        """测试流类型"""
        result = self.analyzer.construct_ecosystem_map(self.relationships)
        flow_types = result["flow_types"]

        self.assertIn("business_flow", flow_types)
        self.assertIn("funding_flow", flow_types)
        self.assertIn("information_flow", flow_types)
        self.assertIn("logistics_flow", flow_types)
        self.assertIn("technology_flow", flow_types)

    def test_visualization_dimensions(self):
        """测试可视化维度"""
        result = self.analyzer.construct_ecosystem_map(self.relationships)
        visualization = result["visualization_dimensions"]

        self.assertIn("node_size", visualization)
        self.assertIn("edge_thickness", visualization)
        self.assertIn("color_coding", visualization)
        self.assertIn("layout_algorithm", visualization)
        self.assertIn("interaction_features", visualization)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.construct_ecosystem_map(self.relationships)
        output_results = result["output_results"]

        self.assertIn("visual_ecosystem_map", output_results)
        self.assertIn("species_relationship_matrix", output_results)
        self.assertIn("flow_analysis_report", output_results)
        self.assertIn("key_node_identification", output_results)
        self.assertIn("ecosystem_structure_analysis", output_results)


class TestDigitalTransformationImpactAnalysis(unittest.TestCase):
    """测试数字化转型影响分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.ecosystem_context = {
            "industry": "制造业",
            "transformation_level": "初级"
        }

    def test_analyze_digital_transformation_impact_structure(self):
        """测试数字化转型影响分析结构"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "analyzing-digital-transformation-impact-on-business"
        )
        self.assertIn("ecosystem_context", result)
        self.assertIn("business_model_changes", result)
        self.assertIn("long_tail_analysis", result)
        self.assertIn("transformation_dimensions", result)

    def test_business_model_changes(self):
        """测试业务模式变革"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )
        business_model_changes = result["business_model_changes"]

        self.assertIn("supply_demand_shift", business_model_changes)
        self.assertIn("channel_evolution", business_model_changes)
        self.assertIn("customer_engagement", business_model_changes)
        self.assertIn("service_flexibility", business_model_changes)
        self.assertIn("market_transformation", business_model_changes)

    def test_long_tail_analysis(self):
        """测试长尾效应分析"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )
        long_tail_analysis = result["long_tail_analysis"]

        self.assertIn("market_shift", long_tail_analysis)
        self.assertIn("new_ecological_niches", long_tail_analysis)
        self.assertIn("demand_data_aggregators", long_tail_analysis)

    def test_transformation_dimensions(self):
        """测试变革维度"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )
        transformation_dimensions = result["transformation_dimensions"]

        self.assertIn("channel_change", transformation_dimensions)
        self.assertIn("service_change", transformation_dimensions)
        self.assertIn("transaction_change", transformation_dimensions)
        self.assertIn("operation_change", transformation_dimensions)
        self.assertIn("organization_change", transformation_dimensions)

    def test_digital_transformation_steps(self):
        """测试数字化转型三步曲"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )
        steps = result["digital_transformation_steps"]

        self.assertIn("digitization_impact", steps)
        self.assertIn("online_impact", steps)
        self.assertIn("intelligence_impact", steps)

    def test_detailed_analysis_fields(self):
        """测试详细分析字段"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )
        detailed_fields = result["detailed_analysis_fields"]

        self.assertIn("customer_behavior_changes", detailed_fields)
        self.assertIn("competition_landscape_changes", detailed_fields)
        self.assertIn("value_chain_reconstruction", detailed_fields)
        self.assertIn("business_model_innovation", detailed_fields)
        self.assertIn("organization_capability_building", detailed_fields)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.analyze_digital_transformation_impact(
            self.ecosystem_context
        )
        output_results = result["output_results"]

        self.assertIn("digital_transformation_impact_assessment", output_results)
        self.assertIn("business_model_transformation_path", output_results)
        self.assertIn("channel_integration_analysis", output_results)
        self.assertIn("service_innovation_opportunities", output_results)
        self.assertIn("new_ecological_niche_prediction", output_results)
        self.assertIn("transformation_risks_opportunities", output_results)


class TestEcosystemImpactAssessment(unittest.TestCase):
    """测试生态系统影响评估"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.transformation_analysis = {
            "business_model_changes": {},
            "long_tail_analysis": {}
        }

    def test_assess_ecosystem_impact_structure(self):
        """测试生态系统影响评估结构"""
        result = self.analyzer.assess_ecosystem_impact(
            self.transformation_analysis
        )

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "assessing-ecosystem-impact-of-digital-transformation"
        )
        self.assertIn("transformation_analysis", result)
        self.assertIn("systematic_impact", result)
        self.assertIn("ecosystem_dimensions", result)

    def test_systematic_impact(self):
        """测试系统性影响"""
        result = self.analyzer.assess_ecosystem_impact(
            self.transformation_analysis
        )
        systematic_impact = result["systematic_impact"]

        self.assertIn("direct_impact", systematic_impact)
        self.assertIn("indirect_impact", systematic_impact)
        self.assertIn("system_impact", systematic_impact)
        self.assertIn("ripple_impact", systematic_impact)

    def test_ecosystem_dimensions(self):
        """测试生态系统维度"""
        result = self.analyzer.assess_ecosystem_impact(
            self.transformation_analysis
        )
        dimensions = result["ecosystem_dimensions"]

        self.assertIn("structural_stability", dimensions)
        self.assertIn("functional_integrity", dimensions)
        self.assertIn("competition_dynamics", dimensions)
        self.assertIn("collaboration_network", dimensions)
        self.assertIn("innovation_vitality", dimensions)

    def test_transformation_impact_assessment(self):
        """测试变革影响评估"""
        result = self.analyzer.assess_ecosystem_impact(
            self.transformation_analysis
        )
        assessment = result["transformation_impact_assessment"]

        self.assertIn("species_adaptability", assessment)
        self.assertIn("relationship_reconfiguration", assessment)
        self.assertIn("competition_dynamics", assessment)
        self.assertIn("value_redistribution", assessment)
        self.assertIn("entry_barrier_changes", assessment)

    def test_evolution_trends(self):
        """测试演化趋势"""
        result = self.analyzer.assess_ecosystem_impact(
            self.transformation_analysis
        )
        trends = result["evolution_trends"]

        self.assertIn("short_term_trends", trends)
        self.assertIn("medium_term_trends", trends)
        self.assertIn("long_term_trends", trends)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.assess_ecosystem_impact(
            self.transformation_analysis
        )
        output_results = result["output_results"]

        self.assertIn("ecosystem_impact_comprehensive_assessment", output_results)
        self.assertIn("species_relationship_change_prediction", output_results)
        self.assertIn("ecosystem_stability_quantitative_analysis", output_results)
        self.assertIn("system_evolution_trend_prediction", output_results)
        self.assertIn("new_ecological_niche_identification", output_results)
        self.assertIn("risk_assessment_response_suggestions", output_results)


class TestBusinessEcosystemDataCollection(unittest.TestCase):
    """测试商业生态系统数据收集"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.collection_params = {
            "targetIndustry": "新能源汽车",
            "geographic_scope": "中国",
            "entity_types": ["企业", "投资机构"],
            "collection_depth": "standard_depth"
        }

    def test_collect_business_ecosystem_data_structure(self):
        """测试数据收集结构"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "business-ecosystem-data-collection"
        )
        self.assertIn("collection_params", result)
        self.assertIn("data_sources", result)
        self.assertIn("collected_data", result)

    def test_data_sources(self):
        """测试数据源"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )
        data_sources = result["data_sources"]

        self.assertIn("baidu_search", data_sources)
        self.assertIn("company_websites", data_sources)
        self.assertIn("news_media", data_sources)
        self.assertIn("government_info", data_sources)
        self.assertIn("industry_reports", data_sources)

    def test_collection_scope(self):
        """测试收集范围"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )
        scope = result["collection_scope"]

        self.assertIn("geographic_range", scope)
        self.assertIn("entity_types", scope)
        self.assertIn("data_types", scope)

    def test_collection_depths(self):
        """测试收集深度"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )
        depths = result["collection_depths"]

        self.assertIn("basic_depth", depths)
        self.assertIn("standard_depth", depths)
        self.assertIn("comprehensive_depth", depths)

    def test_data_validation(self):
        """测试数据验证"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )
        validation = result["data_validation"]

        self.assertIn("entity_info_completeness", validation)
        self.assertIn("relationship_data_accuracy", validation)
        self.assertIn("industry_info_timeliness", validation)
        self.assertIn("multi_source_cross_verification", validation)
        self.assertIn("overall_data_quality_assessment", validation)

    def test_collected_data(self):
        """测试收集的数据"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )
        collected_data = result["collected_data"]

        self.assertIn("entities", collected_data)
        self.assertIn("relationships", collected_data)
        self.assertIn("industry_info", collected_data)

        # 验证实体结构
        entities = collected_data["entities"]
        self.assertIsInstance(entities, list)
        for entity in entities:
            self.assertIn("id", entity)
            self.assertIn("name", entity)
            self.assertIn("type", entity)

        # 验证关系结构
        relationships = collected_data["relationships"]
        self.assertIsInstance(relationships, list)
        for rel in relationships:
            self.assertIn("source", rel)
            self.assertIn("target", rel)
            self.assertIn("type", rel)
            self.assertIn("strength", rel)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.collect_business_ecosystem_data(
            self.collection_params
        )
        output_results = result["output_results"]

        self.assertIn("complete_entity_list", output_results)
        self.assertIn("detailed_entity_relationship_network", output_results)
        self.assertIn("industry_macro_info_trends", output_results)
        self.assertIn("data_quality_report_verification_results", output_results)
        self.assertIn("improvement_suggestions_follow_up_analysis", output_results)


class TestEcosystemRelationshipAnalysis(unittest.TestCase):
    """测试生态系统关系分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.ecosystem_data = {
            "entities": [
                {"id": "entity_1", "name": "企业A", "type": "manufacturer"},
                {"id": "entity_2", "name": "企业B", "type": "supplier"}
            ],
            "relationships": [
                {
                    "source": "entity_1",
                    "target": "entity_2",
                    "type": "supply",
                    "strength": 0.8
                }
            ]
        }

    def test_analyze_ecosystem_relationships_structure(self):
        """测试关系分析结构"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )

        self.assertIsInstance(result, dict)
        self.assertEqual(
            result["analysis_type"],
            "ecosystem-relationship-analysis"
        )
        self.assertIn("ecosystem_data", result)
        self.assertIn("relationship_types", result)
        self.assertIn("network_topology", result)

    def test_relationship_types(self):
        """测试关系类型"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        relationship_types = result["relationship_types"]

        self.assertIn("cooperation_analysis", relationship_types)
        self.assertIn("competition_analysis", relationship_types)

        # 验证合作关系分析
        cooperation = relationship_types["cooperation_analysis"]
        self.assertIn("cooperation", cooperation)
        self.assertIn("investment", cooperation)
        self.assertIn("supply", cooperation)
        self.assertIn("regulation", cooperation)

    def test_network_topology(self):
        """测试网络拓扑"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        topology = result["network_topology"]

        self.assertIn("network_density", topology)
        self.assertIn("connectivity", topology)
        self.assertIn("degree_distribution", topology)
        self.assertIn("clustering_coefficient", topology)
        self.assertIn("path_length", topology)

    def test_centralities(self):
        """测试中心性"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        centralities = result["centralities"]

        self.assertIn("degree_centrality", centralities)
        self.assertIn("closeness_centrality", centralities)
        self.assertIn("betweenness_centrality", centralities)

    def test_key_relationships(self):
        """测试关键关系"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        key_relationships = result["key_relationships"]

        self.assertIn("high_strength_relationships", key_relationships)
        self.assertIn("central_entities", key_relationships)
        self.assertIn("bridge_relationships", key_relationships)
        self.assertIn("key_paths", key_relationships)

    def test_community_detection(self):
        """测试社区检测"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        community_detection = result["community_detection"]

        self.assertIn("community_identification", community_detection)
        self.assertIn("modular_structure", community_detection)
        self.assertIn("community_characteristics", community_detection)
        self.assertIn("inter_community_relationships", community_detection)

    def test_ecosystem_health(self):
        """测试生态系统健康度"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        health = result["ecosystem_health"]

        self.assertIn("structural_health", health)
        self.assertIn("connection_quality", health)
        self.assertIn("diversity_assessment", health)
        self.assertIn("stability_evaluation", health)

    def test_output_results(self):
        """测试输出结果"""
        result = self.analyzer.analyze_ecosystem_relationships(
            self.ecosystem_data
        )
        output_results = result["output_results"]

        self.assertIn("complete_relationship_type_analysis", output_results)
        self.assertIn("accurate_network_topology_property_calculation", output_results)
        self.assertIn("effective_key_relationship_entity_identification", output_results)
        self.assertIn("reasonable_ecosystem_health_assessment", output_results)
        self.assertIn("clear_community_structure_analysis", output_results)
        self.assertIn("specific_actionable_optimization_suggestions", output_results)


class TestExecuteAnalysis(unittest.TestCase):
    """测试execute_analysis方法"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.test_context = {"test": "context"}

    def test_execute_perform_industry_ecosystem(self):
        """测试执行行业生态系统分析"""
        result = self.analyzer.execute_analysis(
            AnalysisType.PERFORMING_INDUSTRY_ECOSYSTEM,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "performing-industry-ecosystem-analysis"
        )

    def test_execute_identify_key_species(self):
        """测试执行关键物种识别"""
        result = self.analyzer.execute_analysis(
            AnalysisType.IDENTIFYING_KEY_SPECIES,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "identifying-key-species-in-industry"
        )

    def test_execute_analyze_business_model(self):
        """测试执行商业模式分析"""
        result = self.analyzer.execute_analysis(
            AnalysisType.ANALYZING_BUSINESS_MODEL,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "analyzing-business-model-of-key-species"
        )

    def test_execute_construct_ecosystem_map(self):
        """测试执行生态图谱构建"""
        context = {"relationships": []}
        result = self.analyzer.execute_analysis(
            AnalysisType.CONSTRUCTING_ECOSYSTEM_MAP,
            context
        )
        self.assertEqual(
            result["analysis_type"],
            "constructing-business-ecosystem-map"
        )

    def test_execute_analyze_digital_transformation(self):
        """测试执行数字化转型影响分析"""
        result = self.analyzer.execute_analysis(
            AnalysisType.ANALYZING_DIGITAL_TRANSFORMATION,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "analyzing-digital-transformation-impact-on-business"
        )

    def test_execute_assess_ecosystem_impact(self):
        """测试执行生态系统影响评估"""
        result = self.analyzer.execute_analysis(
            AnalysisType.ASSESSING_ECOSYSTEM_IMPACT,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "assessing-ecosystem-impact-of-digital-transformation"
        )

    def test_execute_collect_business_ecosystem_data(self):
        """测试执行商业生态系统数据收集"""
        result = self.analyzer.execute_analysis(
            AnalysisType.BUSINESS_ECOSYSTEM_DATA_COLLECTION,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "business-ecosystem-data-collection"
        )

    def test_execute_analyze_ecosystem_relationships(self):
        """测试执行生态系统关系分析"""
        result = self.analyzer.execute_analysis(
            AnalysisType.ECOSYSTEM_RELATIONSHIP_ANALYSIS,
            self.test_context
        )
        self.assertEqual(
            result["analysis_type"],
            "ecosystem-relationship-analysis"
        )


class TestJSONSerialization(unittest.TestCase):
    """测试JSON序列化"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.test_context = {
            "targetIndustry": "新能源汽车",
            "geographic_scope": "中国"
        }

    def test_industry_ecosystem_analysis_json_serialization(self):
        """测试行业生态系统分析JSON序列化"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.test_context
        )
        json_str = json.dumps(result, ensure_ascii=False)
        self.assertIsInstance(json_str, str)

        # 验证可以反序列化
        parsed = json.loads(json_str)
        self.assertEqual(
            parsed["analysis_type"],
            "performing-industry-ecosystem-analysis"
        )

    def test_all_analysis_types_json_serialization(self):
        """测试所有分析类型的JSON序列化"""
        test_cases = [
            (AnalysisType.PERFORMING_INDUSTRY_ECOSYSTEM, self.test_context),
            (AnalysisType.IDENTIFYING_KEY_SPECIES, self.test_context),
            (AnalysisType.ANALYZING_BUSINESS_MODEL, self.test_context),
            (AnalysisType.CONSTRUCTING_ECOSYSTEM_MAP, {"relationships": []}),
            (AnalysisType.ANALYZING_DIGITAL_TRANSFORMATION, self.test_context),
            (AnalysisType.ASSESSING_ECOSYSTEM_IMPACT, self.test_context),
            (AnalysisType.BUSINESS_ECOSYSTEM_DATA_COLLECTION, self.test_context),
            (AnalysisType.ECOSYSTEM_RELATIONSHIP_ANALYSIS, self.test_context),
        ]

        for analysis_type, context in test_cases:
            result = self.analyzer.execute_analysis(analysis_type, context)
            json_str = json.dumps(result, ensure_ascii=False)
            parsed = json.loads(json_str)
            self.assertEqual(parsed["analysis_type"], analysis_type.value)


class TestFileInputOutput(unittest.TestCase):
    """测试文件输入输出"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.test_context = {
            "targetIndustry": "新能源汽车",
            "geographic_scope": "中国"
        }
        # 创建临时目录
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """清理测试环境"""
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_read_input_from_json_file(self):
        """测试从JSON文件读取输入"""
        # 创建输入文件
        input_file = os.path.join(self.temp_dir, "input.json")
        with open(input_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_context, f, ensure_ascii=False)

        # 读取文件
        with open(input_file, 'r', encoding='utf-8') as f:
            loaded_context = json.load(f)

        self.assertEqual(loaded_context, self.test_context)

    def test_write_output_to_json_file(self):
        """测试输出到JSON文件"""
        result = self.analyzer.perform_industry_ecosystem_analysis(
            self.test_context
        )
        output_file = os.path.join(self.temp_dir, "output.json")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        # 验证文件存在
        self.assertTrue(os.path.exists(output_file))

        # 验证文件内容
        with open(output_file, 'r', encoding='utf-8') as f:
            loaded_result = json.load(f)

        self.assertEqual(
            loaded_result["analysis_type"],
            "performing-industry-ecosystem-analysis"
        )


class TestEdgeCases(unittest.TestCase):
    """测试边缘情况"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()

    def test_empty_context(self):
        """测试空上下文"""
        empty_context = {}
        result = self.analyzer.perform_industry_ecosystem_analysis(empty_context)
        self.assertIsInstance(result, dict)

    def test_empty_relationships_list(self):
        """测试空关系列表"""
        empty_relationships = []
        result = self.analyzer.construct_ecosystem_map(empty_relationships)
        self.assertIsInstance(result, dict)

    def test_large_context(self):
        """测试大上下文"""
        large_context = {
            "data": ["item"] * 1000
        }
        result = self.analyzer.perform_industry_ecosystem_analysis(large_context)
        self.assertIsInstance(result, dict)

    def test_special_characters_in_context(self):
        """测试上下文中的特殊字符"""
        special_context = {
            "targetIndustry": "测试<>&\"'行业",
            "description": "包含\n\t\r换行符和制表符"
        }
        result = self.analyzer.perform_industry_ecosystem_analysis(
            special_context
        )
        self.assertIsInstance(result, dict)

    def test_unicode_in_context(self):
        """测试上下文中的Unicode字符"""
        unicode_context = {
            "targetIndustry": "新能源汽车🚗",
            "emoji": "🌏",
            "arabic": "صناعة السيارات الكهربائية"
        }
        result = self.analyzer.perform_industry_ecosystem_analysis(
            unicode_context
        )
        self.assertIsInstance(result, dict)


class TestIntegrationScenarios(unittest.TestCase):
    """测试集成场景"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = BusinessEcosystemAnalyzer()
        self.industry_context = {
            "targetIndustry": "新能源汽车",
            "geographic_scope": "中国",
            "analysis_objectives": [
                "行业生态分析",
                "关键企业识别",
                "商业模式分析"
            ]
        }

    def test_full_ecosystem_analysis_pipeline(self):
        """测试完整生态系统分析流程"""
        # 步骤1: 行业生态系统分析
        ecosystem_analysis = self.analyzer.perform_industry_ecosystem_analysis(
            self.industry_context
        )
        self.assertEqual(
            ecosystem_analysis["analysis_type"],
            "performing-industry-ecosystem-analysis"
        )

        # 步骤2: 关键物种识别
        key_species = self.analyzer.identify_key_species(ecosystem_analysis)
        self.assertEqual(
            key_species["analysis_type"],
            "identifying-key-species-in-industry"
        )

        # 步骤3: 商业模式分析
        business_model = self.analyzer.analyze_business_model(key_species)
        self.assertEqual(
            business_model["analysis_type"],
            "analyzing-business-model-of-key-species"
        )

        # 步骤4: 数字化转型影响分析
        digital_impact = self.analyzer.analyze_digital_transformation_impact(
            ecosystem_analysis
        )
        self.assertEqual(
            digital_impact["analysis_type"],
            "analyzing-digital-transformation-impact-on-business"
        )

        # 步骤5: 生态系统影响评估
        ecosystem_impact = self.analyzer.assess_ecosystem_impact(
            digital_impact
        )
        self.assertEqual(
            ecosystem_impact["analysis_type"],
            "assessing-ecosystem-impact-of-digital-transformation"
        )

    def test_data_collection_to_analysis_pipeline(self):
        """测试数据收集到分析流程"""
        # 步骤1: 数据收集
        collection_params = {
            "targetIndustry": "新能源汽车",
            "geographic_scope": "中国"
        }
        data_collection = self.analyzer.collect_business_ecosystem_data(
            collection_params
        )
        self.assertEqual(
            data_collection["analysis_type"],
            "business-ecosystem-data-collection"
        )

        # 步骤2: 关系分析
        relationship_analysis = self.analyzer.analyze_ecosystem_relationships(
            data_collection
        )
        self.assertEqual(
            relationship_analysis["analysis_type"],
            "ecosystem-relationship-analysis"
        )

        # 步骤3: 生态图谱构建
        ecosystem_map = self.analyzer.construct_ecosystem_map(
            data_collection["collected_data"]["relationships"]
        )
        self.assertEqual(
            ecosystem_map["analysis_type"],
            "constructing-business-ecosystem-map"
        )


def run_tests():
    """运行所有测试"""
    # 创建测试套件
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # 添加所有测试类
    test_classes = [
        TestBusinessEcosystemAnalyzerInit,
        TestIndustryEcosystemAnalysis,
        TestKeySpeciesIdentification,
        TestBusinessModelAnalysis,
        TestEcosystemMapConstruction,
        TestDigitalTransformationImpactAnalysis,
        TestEcosystemImpactAssessment,
        TestBusinessEcosystemDataCollection,
        TestEcosystemRelationshipAnalysis,
        TestExecuteAnalysis,
        TestJSONSerialization,
        TestFileInputOutput,
        TestEdgeCases,
        TestIntegrationScenarios
    ]

    for test_class in test_classes:
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)

    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # 返回测试结果
    return result


if __name__ == "__main__":
    # 运行测试
    result = run_tests()

    # 输出测试摘要
    print("\n" + "="*70)
    print("测试摘要")
    print("="*70)
    print(f"运行的测试数量: {result.testsRun}")
    print(f"失败的测试数量: {len(result.failures)}")
    print(f"错误的测试数量: {len(result.errors)}")
    print(f"跳过的测试数量: {len(result.skipped)}")
    print(f"成功率: {(result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100:.2f}%")
    print("="*70)

    # 返回退出代码
    sys.exit(0 if result.wasSuccessful() else 1)
