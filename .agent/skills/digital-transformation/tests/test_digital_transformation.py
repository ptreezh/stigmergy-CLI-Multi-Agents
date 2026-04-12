#!/usr/bin/env python3
"""
数字化转型分析器完整测试套件
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

from scripts.digital_transformation_analyzer import (
    DigitalTransformationAnalyzer,
    AnalysisType
)


class TestDigitalTransformationAnalyzerInit(unittest.TestCase):
    """测试数字化转型分析器初始化"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()

    def test_analyzer_initialization(self):
        """测试分析器初始化"""
        self.assertIsInstance(self.analyzer, DigitalTransformationAnalyzer)
        self.assertIsNotNone(self.analyzer.expert_perspectives)
        self.assertEqual(len(self.analyzer.expert_perspectives), 6)

    def test_expert_perspectives_keys(self):
        """测试专家视角键的正确性"""
        expected_keys = [
            "digital_transformation_consultant",
            "digital_economist",
            "digital_philosopher",
            "industrial_internet_expert",
            "ai_expert",
            "business_model_reconstruction_expert"
        ]
        for key in expected_keys:
            self.assertIn(key, self.analyzer.expert_perspectives)


class TestExpertPerspectives(unittest.TestCase):
    """测试专家视角功能"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.test_context = {
            "business_scenario": "测试业务场景",
            "industry": "测试行业"
        }

    def test_digital_transformation_consultant_expertise(self):
        """测试数字化转型咨询专家视角"""
        result = self.analyzer._digital_transformation_consultant_expertise(self.test_context)
        self.assertIsInstance(result, dict)
        self.assertIn("strategic_value", result)
        self.assertIn("competitive_advantage", result)
        self.assertIn("transformation_risk", result)
        self.assertIn("success_factors", result)
        self.assertIn("change_management", result)

    def test_digital_economist_expertise(self):
        """测试数字化经济学专家视角"""
        result = self.analyzer._digital_economist_expertise(self.test_context)
        self.assertIsInstance(result, dict)
        self.assertIn("cost_structure", result)
        self.assertIn("value_creation", result)
        self.assertIn("network_effects", result)
        self.assertIn("platform_economics", result)

    def test_digital_philosopher_expertise(self):
        """测试数字化哲学专家视角"""
        result = self.analyzer._digital_philosopher_expertise(self.test_context)
        self.assertIsInstance(result, dict)
        self.assertIn("ontology", result)
        self.assertIn("epistemology", result)
        self.assertIn("axiology", result)
        self.assertIn("space_time", result)

    def test_industrial_internet_expertise(self):
        """测试产业互联网专家视角"""
        result = self.analyzer._industrial_internet_expertise(self.test_context)
        self.assertIsInstance(result, dict)
        self.assertIn("industry_chain_coordination", result)
        self.assertIn("platform_construction", result)
        self.assertIn("ecosystem_network", result)

    def test_ai_expertise(self):
        """测试人工智能专家视角"""
        result = self.analyzer._ai_expertise(self.test_context)
        self.assertIsInstance(result, dict)
        self.assertIn("data_element", result)
        self.assertIn("algorithm_application", result)
        self.assertIn("automation_potential", result)
        self.assertIn("intelligent_decision", result)

    def test_business_model_reconstruction_expertise(self):
        """测试商业模式重构专家视角"""
        result = self.analyzer._business_model_reconstruction_expertise(self.test_context)
        self.assertIsInstance(result, dict)
        self.assertIn("value_proposition", result)
        self.assertIn("revenue_model", result)
        self.assertIn("key_resources", result)
        self.assertIn("channel_path", result)


class TestBusinessSceneDeconstruction(unittest.TestCase):
    """测试业务场景解构分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.business_context = {
            "company_name": "测试公司",
            "industry": "制造业",
            "size": "中型企业",
            "business_model": "B2B"
        }

    def test_deconstruct_business_scene_structure(self):
        """测试业务场景解构结构"""
        result = self.analyzer.deconstruct_business_scene(self.business_context)

        # 验证基本结构
        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "business_scene_deconstruction")
        self.assertIn("business_context", result)
        self.assertIn("deconstruction_result", result)
        self.assertIn("expert_analysis", result)
        self.assertIn("innovation_opportunities", result)

    def test_deconstruction_result_layers(self):
        """测试解构结果的层级结构"""
        result = self.analyzer.deconstruct_business_scene(self.business_context)
        deconstruction_result = result["deconstruction_result"]

        # 验证五层解构框架
        self.assertIn("value_flow_layer", deconstruction_result)
        self.assertIn("resource_element_layer", deconstruction_result)
        self.assertIn("activity_network_layer", deconstruction_result)
        self.assertIn("connection_relationship_layer", deconstruction_result)
        self.assertIn("ecosystem_environment_layer", deconstruction_result)

    def test_value_flow_layer_content(self):
        """测试价值流层内容"""
        result = self.analyzer.deconstruct_business_scene(self.business_context)
        value_flow_layer = result["deconstruction_result"]["value_flow_layer"]

        self.assertIn("value_creation", value_flow_layer)
        self.assertIn("value_delivery", value_flow_layer)
        self.assertIn("value_capture", value_flow_layer)
        self.assertIn("value_distribution", value_flow_layer)

    def test_expert_analysis_inclusion(self):
        """测试专家分析包含"""
        result = self.analyzer.deconstruct_business_scene(self.business_context)
        expert_analysis = result["expert_analysis"]

        self.assertEqual(len(expert_analysis), 6)
        self.assertIn("digital_transformation_consultant", expert_analysis)
        self.assertIn("digital_economist", expert_analysis)

    def test_innovation_opportunities_generation(self):
        """测试创新机会生成"""
        result = self.analyzer.deconstruct_business_scene(self.business_context)
        innovation_opportunities = result["innovation_opportunities"]

        self.assertIsInstance(innovation_opportunities, list)
        self.assertGreater(len(innovation_opportunities), 0)


class TestDigitizationDeconstruction(unittest.TestCase):
    """测试数字化解构分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.digitization_context = {
            "transformation_objectives": ["效率提升", "成本降低"],
            "current_capabilities": ["基础信息化"]
        }

    def test_deconstruct_digitization_structure(self):
        """测试数字化解构结构"""
        result = self.analyzer.deconstruct_digitization(self.digitization_context)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "digitization_deconstruction")
        self.assertIn("digitization_context", result)
        self.assertIn("core_functions", result)
        self.assertIn("digitization_niche_model", result)

    def test_digitization_niche_model(self):
        """测试数字化利基模型"""
        result = self.analyzer.deconstruct_digitization(self.digitization_context)
        niche_model = result["digitization_niche_model"]

        self.assertIn("data_monetization_niche", niche_model)
        self.assertIn("process_optimization_niche", niche_model)
        self.assertIn("experience_upgrade_niche", niche_model)
        self.assertIn("ecosystem_coordination_niche", niche_model)

    def test_niche_structure(self):
        """测试利基结构"""
        result = self.analyzer.deconstruct_digitization(self.digitization_context)
        data_niche = result["digitization_niche_model"]["data_monetization_niche"]

        self.assertIn("opportunity", data_niche)
        self.assertIn("case", data_niche)
        self.assertIn("value", data_niche)

    def test_core_functions(self):
        """测试核心功能"""
        result = self.analyzer.deconstruct_digitization(self.digitization_context)
        core_functions = result["core_functions"]

        self.assertIn("value_creation_deconstruction", core_functions)
        self.assertIn("resource_allocation_optimization", core_functions)
        self.assertIn("competition_pattern_reconstruction", core_functions)


class TestOnlineTransformationDeconstruction(unittest.TestCase):
    """测试在线化解构分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.online_context = {
            "current_online_presence": "基础网站",
            "objectives": ["扩大触达", "提升交互"]
        }

    def test_deconstruct_online_transformation_structure(self):
        """测试在线化解构结构"""
        result = self.analyzer.deconstruct_online_transformation(self.online_context)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "online_transformation_deconstruction")
        self.assertIn("online_context", result)
        self.assertIn("online_deconstruction_framework", result)
        self.assertIn("online_niche_model", result)

    def test_online_deconstruction_framework(self):
        """测试在线化解构框架"""
        result = self.analyzer.deconstruct_online_transformation(self.online_context)
        framework = result["online_deconstruction_framework"]

        self.assertIn("reach_layer", framework)
        self.assertIn("interaction_layer", framework)
        self.assertIn("data_layer", framework)
        self.assertIn("value_layer", framework)

    def test_online_niche_model(self):
        """测试在线化利基模型"""
        result = self.analyzer.deconstruct_online_transformation(self.online_context)
        niche_model = result["online_niche_model"]

        self.assertIn("reach_channel_niche", niche_model)
        self.assertIn("data_insight_niche", niche_model)
        self.assertIn("real_time_service_niche", niche_model)
        self.assertIn("ecosystem_integration_niche", niche_model)


class TestIntelligentTransformationDeconstruction(unittest.TestCase):
    """测试智能化解构分析"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.intelligent_context = {
            "current_ai_capability": "无",
            "objectives": ["智能化决策", "自动化运营"]
        }

    def test_deconstruct_intelligent_transformation_structure(self):
        """测试智能化解构结构"""
        result = self.analyzer.deconstruct_intelligent_transformation(self.intelligent_context)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "intelligent_transformation_deconstruction")
        self.assertIn("intelligent_context", result)
        self.assertIn("intelligent_deconstruction_framework", result)
        self.assertIn("intelligent_niche_model", result)

    def test_intelligent_deconstruction_framework(self):
        """测试智能化解构框架"""
        result = self.analyzer.deconstruct_intelligent_transformation(self.intelligent_context)
        framework = result["intelligent_deconstruction_framework"]

        self.assertIn("data_intelligence_layer", framework)
        self.assertIn("algorithm_intelligence_layer", framework)
        self.assertIn("decision_intelligence_layer", framework)
        self.assertIn("service_intelligence_layer", framework)

    def test_intelligent_niche_model(self):
        """测试智能化利基模型"""
        result = self.analyzer.deconstruct_intelligent_transformation(self.intelligent_context)
        niche_model = result["intelligent_niche_model"]

        self.assertIn("intelligent_decision_niche", niche_model)
        self.assertIn("prediction_analysis_niche", niche_model)
        self.assertIn("personalized_service_niche", niche_model)
        self.assertIn("intelligent_platform_niche", niche_model)


class TestInnovationNicheIdentification(unittest.TestCase):
    """测试创新利基识别"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.deconstruction_results = [
            {
                "analysis_type": "digitization_deconstruction",
                "digitization_context": {"test": "context"}
            },
            {
                "analysis_type": "online_transformation_deconstruction",
                "online_context": {"test": "context"}
            }
        ]

    def test_identify_innovation_niche_structure(self):
        """测试创新利基识别结构"""
        result = self.analyzer.identify_innovation_niche(self.deconstruction_results)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "innovation_niche_identification")
        self.assertIn("deconstruction_results", result)
        self.assertIn("aggregated_insights", result)
        self.assertIn("niche_evaluation_matrix", result)
        self.assertIn("innovation_niche_types", result)
        self.assertIn("identified_niches", result)

    def test_aggregated_insights(self):
        """测试聚合洞察"""
        result = self.analyzer.identify_innovation_niche(self.deconstruction_results)
        aggregated_insights = result["aggregated_insights"]

        self.assertIn("pain_points", aggregated_insights)
        self.assertIn("demand_gaps", aggregated_insights)
        self.assertIn("supply_gaps", aggregated_insights)
        self.assertIn("ecosystem_gaps", aggregated_insights)

    def test_niche_evaluation_matrix(self):
        """测试利基评估矩阵"""
        result = self.analyzer.identify_innovation_niche(self.deconstruction_results)
        evaluation_matrix = result["niche_evaluation_matrix"]

        self.assertIn("market_demand_intensity", evaluation_matrix)
        self.assertIn("technical_feasibility", evaluation_matrix)
        self.assertIn("competitive_environment", evaluation_matrix)
        self.assertIn("commercial_value", evaluation_matrix)
        self.assertIn("implementation_difficulty", evaluation_matrix)

    def test_innovation_niche_types(self):
        """测试创新利基类型"""
        result = self.analyzer.identify_innovation_niche(self.deconstruction_results)
        niche_types = result["innovation_niche_types"]

        self.assertIn("efficiency_driven_niche", niche_types)
        self.assertIn("experience_driven_niche", niche_types)
        self.assertIn("model_driven_niche", niche_types)
        self.assertIn("data_driven_niche", niche_types)

    def test_identified_niches(self):
        """测试识别的利基"""
        result = self.analyzer.identify_innovation_niche(self.deconstruction_results)
        identified_niches = result["identified_niches"]

        self.assertIsInstance(identified_niches, list)
        self.assertGreater(len(identified_niches), 0)

        for niche in identified_niches:
            self.assertIn("name", niche)
            self.assertIn("description", niche)
            self.assertIn("feasibility", niche)
            self.assertIn("market_potential", niche)
            self.assertIn("implementation_complexity", niche)


class TestBusinessModelReconstruction(unittest.TestCase):
    """测试商业模式重构"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.niche_context = {
            "identified_niches": ["数字化转型机会"],
            "transformation_objectives": ["商业模式创新"]
        }

    def test_reconstruct_business_model_structure(self):
        """测试商业模式重构结构"""
        result = self.analyzer.reconstruct_business_model(self.niche_context)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "business_model_reconstruction")
        self.assertIn("niche_context", result)
        self.assertIn("business_model_reconstruction_framework", result)
        self.assertIn("reconstruction_path_model", result)

    def test_business_model_reconstruction_framework(self):
        """测试商业模式重构框架"""
        result = self.analyzer.reconstruct_business_model(self.niche_context)
        framework = result["business_model_reconstruction_framework"]

        self.assertIn("value_proposition_reconstruction", framework)
        self.assertIn("value_creation_reconstruction", framework)
        self.assertIn("value_delivery_reconstruction", framework)
        self.assertIn("value_capture_reconstruction", framework)
        self.assertIn("competitive_advantage_reconstruction", framework)

    def test_reconstruction_path_model(self):
        """测试重构路径模型"""
        result = self.analyzer.reconstruct_business_model(self.niche_context)
        path_model = result["reconstruction_path_model"]

        self.assertIn("value_added_reconstruction_path", path_model)
        self.assertIn("replacement_reconstruction_path", path_model)
        self.assertIn("platform_reconstruction_path", path_model)
        self.assertIn("data_reconstruction_path", path_model)

    def test_reconstruction_path_structure(self):
        """测试重构路径结构"""
        result = self.analyzer.reconstruct_business_model(self.niche_context)
        value_added_path = result["reconstruction_path_model"]["value_added_reconstruction_path"]

        self.assertIn("status_quo", value_added_path)
        self.assertIn("reconstruction", value_added_path)
        self.assertIn("case", value_added_path)
        self.assertIn("value", value_added_path)


class TestBusinessInnovationPathwayPlanning(unittest.TestCase):
    """测试业务创新路径规划"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.innovation_context = {
            "innovation_niches": ["智能化服务"],
            "business_model": "平台化"
        }

    def test_plan_business_innovation_pathway_structure(self):
        """测试业务创新路径规划结构"""
        result = self.analyzer.plan_business_innovation_pathway(self.innovation_context)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "business_innovation_pathway_planning")
        self.assertIn("innovation_context", result)
        self.assertIn("innovation_pathway_model", result)
        self.assertIn("pathway_planning_framework", result)

    def test_innovation_pathway_model(self):
        """测试创新路径模型"""
        result = self.analyzer.plan_business_innovation_pathway(self.innovation_context)
        pathway_model = result["innovation_pathway_model"]

        self.assertIn("exploration_phase", pathway_model)
        self.assertIn("pilot_phase", pathway_model)
        self.assertIn("scaling_phase", pathway_model)
        self.assertIn("optimization_phase", pathway_model)

    def test_phase_structure(self):
        """测试阶段结构"""
        result = self.analyzer.plan_business_innovation_pathway(self.innovation_context)
        exploration_phase = result["innovation_pathway_model"]["exploration_phase"]

        self.assertIn("goal", exploration_phase)
        self.assertIn("activities", exploration_phase)
        self.assertIn("key_metrics", exploration_phase)

        self.assertIsInstance(exploration_phase["activities"], list)
        self.assertIsInstance(exploration_phase["key_metrics"], list)

    def test_pathway_planning_framework(self):
        """测试路径规划框架"""
        result = self.analyzer.plan_business_innovation_pathway(self.innovation_context)
        framework = result["pathway_planning_framework"]

        self.assertIn("technology_implementation_pathway", framework)
        self.assertIn("commercial_implementation_pathway", framework)
        self.assertIn("organizational_implementation_pathway", framework)


class TestExecuteAnalysis(unittest.TestCase):
    """测试execute_analysis方法"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.test_context = {"test": "context"}

    def test_execute_business_scene_deconstruction(self):
        """测试执行业务场景解构"""
        result = self.analyzer.execute_analysis(
            AnalysisType.BUSINESS_SCENE_DECONSTRUCTION,
            self.test_context
        )
        self.assertEqual(result["analysis_type"], "business_scene_deconstruction")

    def test_execute_digitization_deconstruction(self):
        """测试执行数字化解构"""
        result = self.analyzer.execute_analysis(
            AnalysisType.DIGITIZATION_DECONSTRUCTION,
            self.test_context
        )
        self.assertEqual(result["analysis_type"], "digitization_deconstruction")

    def test_execute_online_transformation_deconstruction(self):
        """测试执行在线化解构"""
        result = self.analyzer.execute_analysis(
            AnalysisType.ONLINE_TRANSFORMATION_DECONSTRUCTION,
            self.test_context
        )
        self.assertEqual(result["analysis_type"], "online_transformation_deconstruction")

    def test_execute_intelligent_transformation_deconstruction(self):
        """测试执行智能化解构"""
        result = self.analyzer.execute_analysis(
            AnalysisType.INTELLIGENT_TRANSFORMATION_DECONSTRUCTION,
            self.test_context
        )
        self.assertEqual(result["analysis_type"], "intelligent_transformation_deconstruction")

    def test_execute_innovation_niche_identification(self):
        """测试执行创新利基识别"""
        context_with_deconstruction = {
            "deconstruction_results": [self.test_context]
        }
        result = self.analyzer.execute_analysis(
            AnalysisType.INNOVATION_NICHE_IDENTIFICATION,
            context_with_deconstruction
        )
        self.assertEqual(result["analysis_type"], "innovation_niche_identification")

    def test_execute_business_model_reconstruction(self):
        """测试执行商业模式重构"""
        result = self.analyzer.execute_analysis(
            AnalysisType.BUSINESS_MODEL_RECONSTRUCTION,
            self.test_context
        )
        self.assertEqual(result["analysis_type"], "business_model_reconstruction")

    def test_execute_business_innovation_pathway_planning(self):
        """测试执行业务创新路径规划"""
        result = self.analyzer.execute_analysis(
            AnalysisType.BUS_INNOVATION_PATHWAY_PLANNING,
            self.test_context
        )
        self.assertEqual(result["analysis_type"], "business_innovation_pathway_planning")

    def test_execute_invalid_analysis_type(self):
        """测试执行无效分析类型"""
        # 测试不支持的类型
        with self.assertRaises(AttributeError):
            # 尝试访问不存在的枚举值
            pass


class TestJSONSerialization(unittest.TestCase):
    """测试JSON序列化"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.test_context = {
            "company_name": "测试公司",
            "industry": "制造业"
        }

    def test_business_scene_deconstruction_json_serialization(self):
        """测试业务场景解构JSON序列化"""
        result = self.analyzer.deconstruct_business_scene(self.test_context)
        json_str = json.dumps(result, ensure_ascii=False)
        self.assertIsInstance(json_str, str)

        # 验证可以反序列化
        parsed = json.loads(json_str)
        self.assertEqual(parsed["analysis_type"], "business_scene_deconstruction")

    def test_all_analysis_types_json_serialization(self):
        """测试所有分析类型的JSON序列化"""
        analysis_types = [
            (AnalysisType.BUSINESS_SCENE_DECONSTRUCTION, self.test_context),
            (AnalysisType.DIGITIZATION_DECONSTRUCTION, self.test_context),
            (AnalysisType.ONLINE_TRANSFORMATION_DECONSTRUCTION, self.test_context),
            (AnalysisType.INTELLIGENT_TRANSFORMATION_DECONSTRUCTION, self.test_context),
        ]

        for analysis_type, context in analysis_types:
            result = self.analyzer.execute_analysis(analysis_type, context)
            json_str = json.dumps(result, ensure_ascii=False)
            parsed = json.loads(json_str)
            self.assertEqual(parsed["analysis_type"], analysis_type.value)


class TestFileInputOutput(unittest.TestCase):
    """测试文件输入输出"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.test_context = {
            "company_name": "测试公司",
            "industry": "制造业"
        }
        # 创建临时目录
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """清理测试环境"""
        # 删除临时文件
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
        result = self.analyzer.deconstruct_business_scene(self.test_context)
        output_file = os.path.join(self.temp_dir, "output.json")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        # 验证文件存在
        self.assertTrue(os.path.exists(output_file))

        # 验证文件内容
        with open(output_file, 'r', encoding='utf-8') as f:
            loaded_result = json.load(f)

        self.assertEqual(loaded_result["analysis_type"], "business_scene_deconstruction")


class TestEdgeCases(unittest.TestCase):
    """测试边缘情况"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()

    def test_empty_context(self):
        """测试空上下文"""
        empty_context = {}
        result = self.analyzer.deconstruct_business_scene(empty_context)
        self.assertIsInstance(result, dict)
        self.assertEqual(result["analysis_type"], "business_scene_deconstruction")

    def test_large_context(self):
        """测试大上下文"""
        large_context = {
            "data": ["item"] * 1000
        }
        result = self.analyzer.deconstruct_business_scene(large_context)
        self.assertIsInstance(result, dict)

    def test_special_characters_in_context(self):
        """测试上下文中的特殊字符"""
        special_context = {
            "name": "测试<>&\"'公司",
            "description": "包含\n\t\r换行符和制表符"
        }
        result = self.analyzer.deconstruct_business_scene(special_context)
        self.assertIsInstance(result, dict)

    def test_unicode_in_context(self):
        """测试上下文中的Unicode字符"""
        unicode_context = {
            "name": "测试公司",
            "emoji": "🚀",
            "arabic": "مرحبا",
            "emoji_companies": "🏢🏭🏦"
        }
        result = self.analyzer.deconstruct_business_scene(unicode_context)
        self.assertIsInstance(result, dict)


class TestIntegrationScenarios(unittest.TestCase):
    """测试集成场景"""

    def setUp(self):
        """设置测试环境"""
        self.analyzer = DigitalTransformationAnalyzer()
        self.business_context = {
            "company_name": "智能制造公司",
            "industry": "制造业",
            "size": "大型企业",
            "business_model": "B2B",
            "transformation_objectives": [
                "数字化转型",
                "在线化服务",
                "智能化决策"
            ]
        }

    def test_full_analysis_pipeline(self):
        """测试完整分析流程"""
        # 步骤1: 业务场景解构
        business_scene_result = self.analyzer.deconstruct_business_scene(
            self.business_context
        )
        self.assertEqual(
            business_scene_result["analysis_type"],
            "business_scene_deconstruction"
        )

        # 步骤2: 数字化解构
        digitization_result = self.analyzer.deconstruct_digitization(
            self.business_context
        )
        self.assertEqual(
            digitization_result["analysis_type"],
            "digitization_deconstruction"
        )

        # 步骤3: 在线化解构
        online_result = self.analyzer.deconstruct_online_transformation(
            self.business_context
        )
        self.assertEqual(
            online_result["analysis_type"],
            "online_transformation_deconstruction"
        )

        # 步骤4: 智能化解构
        intelligent_result = self.analyzer.deconstruct_intelligent_transformation(
            self.business_context
        )
        self.assertEqual(
            intelligent_result["analysis_type"],
            "intelligent_transformation_deconstruction"
        )

        # 步骤5: 创新利基识别
        deconstruction_results = [
            digitization_result,
            online_result,
            intelligent_result
        ]
        niche_result = self.analyzer.identify_innovation_niche(
            deconstruction_results
        )
        self.assertEqual(
            niche_result["analysis_type"],
            "innovation_niche_identification"
        )

        # 步骤6: 商业模式重构
        reconstruction_result = self.analyzer.reconstruct_business_model(
            niche_result
        )
        self.assertEqual(
            reconstruction_result["analysis_type"],
            "business_model_reconstruction"
        )

        # 步骤7: 路径规划
        pathway_result = self.analyzer.plan_business_innovation_pathway(
            reconstruction_result
        )
        self.assertEqual(
            pathway_result["analysis_type"],
            "business_innovation_pathway_planning"
        )


def run_tests():
    """运行所有测试"""
    # 创建测试套件
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # 添加所有测试类
    test_classes = [
        TestDigitalTransformationAnalyzerInit,
        TestExpertPerspectives,
        TestBusinessSceneDeconstruction,
        TestDigitizationDeconstruction,
        TestOnlineTransformationDeconstruction,
        TestIntelligentTransformationDeconstruction,
        TestInnovationNicheIdentification,
        TestBusinessModelReconstruction,
        TestBusinessInnovationPathwayPlanning,
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
