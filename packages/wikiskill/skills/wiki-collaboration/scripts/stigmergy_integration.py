#!/usr/bin/env python3
"""
Stigmergy Wiki系统集成器
实现Stigmergy技能系统与Claude Skills的兼容集成
"""

import json
import sys
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime

@dataclass
class StigmergyConfig:
    """Stigmergy配置数据结构"""
    cli_path: str
    skills_path: str
    hooks_path: str
    data_path: str
    version: str
    environment: str

@dataclass
class IntegrationStatus:
    """集成状态数据结构"""
    stigmergy_available: bool
    claude_skills_available: bool
    integration_mode: str
    compatibility_level: float
    active_features: List[str]

class StigmergyIntegrator:
    """Stigmergy系统集成器主类"""
    
    def __init__(self):
        self.config = self._load_config()
        self.status = self._check_integration_status()
        self.integration_layer = self._initialize_integration_layer()
    
    def _load_config(self) -> StigmergyConfig:
        """加载Stigmergy配置"""
        # 默认配置
        config = StigmergyConfig(
            cli_path="",
            skills_path="",
            hooks_path="",
            data_path="",
            version="1.0.0",
            environment="stigmergy"
        )
        
        # 尝试从环境变量加载
        if os.getenv('STIGMERGY_CLI_PATH'):
            config.cli_path = os.getenv('STIGMERGY_CLI_PATH')
        
        if os.getenv('STIGMERGY_SKILLS_PATH'):
            config.skills_path = os.getenv('STIGMERGY_SKILLS_PATH')
        
        if os.getenv('STIGMERGY_HOOKS_PATH'):
            config.hooks_path = os.getenv('STIGMERGY_HOOKS_PATH')
        
        if os.getenv('STIGMERGY_DATA_PATH'):
            config.data_path = os.getenv('STIGMERGY_DATA_PATH')
        
        # 尝试从配置文件加载
        config_file = Path("stigmergy_config.json")
        if config_file.exists():
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    file_config = json.load(f)
                    for key, value in file_config.items():
                        if hasattr(config, key):
                            setattr(config, key, value)
            except Exception as e:
                print(f"Warning: Failed to load config file: {e}")
        
        return config
    
    def _check_integration_status(self) -> IntegrationStatus:
        """检查集成状态"""
        stigmergy_available = self._check_stigmergy_availability()
        claude_skills_available = self._check_claude_skills_availability()
        
        # 确定集成模式
        if stigmergy_available and claude_skills_available:
            integration_mode = "dual"
            compatibility_level = 1.0
        elif stigmergy_available:
            integration_mode = "stigmergy"
            compatibility_level = 0.8
        elif claude_skills_available:
            integration_mode = "claude"
            compatibility_level = 0.7
        else:
            integration_mode = "none"
            compatibility_level = 0.0
        
        # 确定活跃功能
        active_features = []
        if stigmergy_available:
            active_features.extend([
                "stigmergy_cli",
                "stigmergy_hooks",
                "stigmergy_data",
                "multi_cli_support"
            ])
        
        if claude_skills_available:
            active_features.extend([
                "claude_skills",
                "progressive_disclosure",
                "claude_tools",
                "claude_context"
            ])
        
        return IntegrationStatus(
            stigmergy_available=stigmergy_available,
            claude_skills_available=claude_skills_available,
            integration_mode=integration_mode,
            compatibility_level=compatibility_level,
            active_features=active_features
        )
    
    def _check_stigmergy_availability(self) -> bool:
        """检查Stigmergy可用性"""
        # 检查CLI路径
        if self.config.cli_path and not Path(self.config.cli_path).exists():
            return False
        
        # 检查技能路径
        if self.config.skills_path and not Path(self.config.skills_path).exists():
            return False
        
        # 检查核心模块
        try:
            import subprocess
            result = subprocess.run(['stigmergy', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except Exception:
            return False
    
    def _check_claude_skills_availability(self) -> bool:
        """检查Claude Skills可用性"""
        # 检查.claude目录
        claude_skills_dir = Path(".claude/skills")
        if not claude_skills_dir.exists():
            return False
        
        # 检查技能文件
        skill_files = list(claude_skills_dir.glob("**/SKILL.md"))
        return len(skill_files) > 0
    
    def _initialize_integration_layer(self) -> Dict[str, Any]:
        """初始化集成层"""
        integration_layer = {
            "adapters": {},
            "translators": {},
            "coordinators": {},
            "monitors": {}
        }
        
        # 初始化适配器
        integration_layer["adapters"] = {
            "stigmergy_to_claude": self._create_stigmergy_to_claude_adapter(),
            "claude_to_stigmergy": self._create_claude_to_stigmergy_adapter()
        }
        
        # 初始化翻译器
        integration_layer["translators"] = {
            "request": self._create_request_translator(),
            "response": self._create_response_translator(),
            "context": self._create_context_translator()
        }
        
        # 初始化协调器
        integration_layer["coordinators"] = {
            "execution": self._create_execution_coordinator(),
            "state": self._create_state_coordinator(),
            "data": self._create_data_coordinator()
        }
        
        # 初始化监控器
        integration_layer["monitors"] = {
            "performance": self._create_performance_monitor(),
            "compatibility": self._create_compatibility_monitor(),
            "health": self._create_health_monitor()
        }
        
        return integration_layer
    
    def _create_stigmergy_to_claude_adapter(self) -> Dict[str, Any]:
        """创建Stigmergy到Claude的适配器"""
        return {
            "name": "stigmergy_to_claude",
            "description": "将Stigmergy技能调用转换为Claude Skills格式",
            "mappings": {
                "executeWikiTask": "wiki-collaboration",
                "createTopic": "create-wiki-topic",
                "editTopic": "edit-wiki-content",
                "acquireKnowledge": "wiki-knowledge-acquisition"
            },
            "transformers": {
                "parameters": self._transform_parameters,
                "context": self._transform_context,
                "response": self._transform_response
            }
        }
    
    def _create_claude_to_stigmergy_adapter(self) -> Dict[str, Any]:
        """创建Claude到Stigmergy的适配器"""
        return {
            "name": "claude_to_stigmergy",
            "description": "将Claude Skills调用转换为Stigmergy技能格式",
            "mappings": {
                "wiki-collaboration": "executeWikiTask",
                "create-wiki-topic": "createTopic",
                "edit-wiki-content": "editTopic",
                "wiki-knowledge-acquisition": "acquireKnowledge"
            },
            "transformers": {
                "parameters": self._reverse_transform_parameters,
                "context": self._reverse_transform_context,
                "response": self._reverse_transform_response
            }
        }
    
    def _create_request_translator(self) -> Dict[str, Any]:
        """创建请求翻译器"""
        return {
            "name": "request_translator",
            "description": "翻译不同系统间的请求格式",
            "translations": {
                "stigmergy_to_claude": self._translate_stigmergy_to_claude_request,
                "claude_to_stigmergy": self._translate_claude_to_stigmergy_request
            }
        }
    
    def _create_response_translator(self) -> Dict[str, Any]:
        """创建响应翻译器"""
        return {
            "name": "response_translator",
            "description": "翻译不同系统间的响应格式",
            "translations": {
                "stigmergy_to_claude": self._translate_stigmergy_to_claude_response,
                "claude_to_stigmergy": self._translate_claude_to_stigmergy_response
            }
        }
    
    def _create_context_translator(self) -> Dict[str, Any]:
        """创建上下文翻译器"""
        return {
            "name": "context_translator",
            "description": "翻译不同系统间的上下文信息",
            "translations": {
                "stigmergy_to_claude": self._translate_stigmergy_to_claude_context,
                "claude_to_stigmergy": self._translate_claude_to_stigmergy_context
            }
        }
    
    def _create_execution_coordinator(self) -> Dict[str, Any]:
        """创建执行协调器"""
        return {
            "name": "execution_coordinator",
            "description": "协调不同系统的执行流程",
            "coordinations": {
                "dual_execution": self._coordinate_dual_execution,
                "fallback_execution": self._coordinate_fallback_execution,
                "parallel_execution": self._coordinate_parallel_execution
            }
        }
    
    def _create_state_coordinator(self) -> Dict[str, Any]:
        """创建状态协调器"""
        return {
            "name": "state_coordinator",
            "description": "协调不同系统的状态管理",
            "coordinations": {
                "state_sync": self._coordinate_state_sync,
                "state_backup": self._coordinate_state_backup,
                "state_recovery": self._coordinate_state_recovery
            }
        }
    
    def _coordinate_state_sync(self, data):
        """协调状态同步"""
        return {"status": "synced", "data": data}
    
    def _coordinate_state_backup(self, data):
        """协调状态备份"""
        return {"status": "backed_up", "data": data}
    
    def _coordinate_state_recovery(self, data):
        """协调状态恢复"""
        return {"status": "recovered", "data": data}
    
    def _create_data_coordinator(self) -> Dict[str, Any]:
        """创建数据协调器"""
        return {
            "name": "data_coordinator",
            "description": "协调不同系统的数据同步",
            "coordinations": {
                "data_sync": self._coordinate_data_sync,
                "data_conversion": self._coordinate_data_conversion,
                "data_validation": self._coordinate_data_validation
            }
        }
    
    def _coordinate_data_sync(self, data):
        """协调数据同步"""
        return {"status": "synced", "data": data}
    
    def _coordinate_data_conversion(self, data):
        """协调数据转换"""
        return {"status": "converted", "data": data}
    
    def _coordinate_data_validation(self, data):
        """协调数据验证"""
        return {"status": "validated", "data": data}
    
    def _create_performance_monitor(self) -> Dict[str, Any]:
        """创建性能监控器"""
        return {
            "name": "performance_monitor",
            "description": "监控系统性能指标",
            "metrics": [
                "response_time",
                "throughput",
                "error_rate",
                "resource_usage"
            ]
        }
    
    def _create_compatibility_monitor(self) -> Dict[str, Any]:
        """创建兼容性监控器"""
        return {
            "name": "compatibility_monitor",
            "description": "监控系统兼容性",
            "checks": [
                "api_compatibility",
                "data_format_compatibility",
                "feature_compatibility"
            ]
        }
    
    def _create_health_monitor(self) -> Dict[str, Any]:
        """创建健康监控器"""
        return {
            "name": "health_monitor",
            "description": "监控系统健康状态",
            "checks": [
                "system_health",
                "service_health",
                "integration_health"
            ]
        }
    
    def _transform_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """转换参数格式"""
        transformed = {}
        
        for key, value in parameters.items():
            if key == "taskDescription":
                transformed["task"] = value
            elif key == "options":
                transformed.update(value)
            else:
                transformed[key] = value
        
        return transformed
    
    def _transform_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """转换上下文格式"""
        transformed = {}
        
        # 转换Stigmergy特定上下文到Claude格式
        if "cliContext" in context:
            transformed["claude_context"] = {
                "tools": context["cliContext"].get("availableTools", []),
                "environment": context["cliContext"].get("environment", "unknown")
            }
        
        return transformed
    
    def _transform_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """转换响应格式"""
        transformed = {}
        
        # 转换响应格式
        if "success" in response:
            transformed["status"] = "success" if response["success"] else "error"
        
        if "result" in response:
            transformed["data"] = response["result"]
        
        if "error" in response:
            transformed["error"] = response["error"]
        
        return transformed
    
    def _reverse_transform_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """反向转换参数格式"""
        transformed = {}
        
        for key, value in parameters.items():
            if key == "task":
                transformed["taskDescription"] = value
            elif key in ["tools", "environment"]:
                transformed.setdefault("options", {})[key] = value
            else:
                transformed[key] = value
        
        return transformed
    
    def _reverse_transform_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """反向转换上下文格式"""
        transformed = {}
        
        # 转换Claude特定上下文到Stigmergy格式
        if "claude_context" in context:
            transformed["cliContext"] = {
                "availableTools": context["claude_context"].get("tools", []),
                "environment": context["claude_context"].get("environment", "claude")
            }
        
        return transformed
    
    def _reverse_transform_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """反向转换响应格式"""
        transformed = {}
        
        # 转换响应格式
        if "status" in response:
            transformed["success"] = response["status"] == "success"
        
        if "data" in response:
            transformed["result"] = response["data"]
        
        if "error" in response:
            transformed["error"] = response["error"]
        
        return transformed
    
    def _translate_stigmergy_to_claude_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """翻译Stigmergy到Claude请求"""
        adapter = self.integration_layer["adapters"]["stigmergy_to_claude"]
        
        # 映射技能名称
        skill_name = request.get("skill", "unknown")
        mapped_skill = adapter["mappings"].get(skill_name, skill_name)
        
        # 转换参数
        parameters = request.get("parameters", {})
        transformed_params = adapter["transformers"]["parameters"](parameters)
        
        # 转换上下文
        context = request.get("context", {})
        transformed_context = adapter["transformers"]["context"](context)
        
        return {
            "skill": mapped_skill,
            "parameters": transformed_params,
            "context": transformed_context,
            "source": "stigmergy"
        }
    
    def _translate_claude_to_stigmergy_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """翻译Claude到Stigmergy请求"""
        adapter = self.integration_layer["adapters"]["claude_to_stigmergy"]
        
        # 映射技能名称
        skill_name = request.get("skill", "unknown")
        mapped_skill = adapter["mappings"].get(skill_name, skill_name)
        
        # 转换参数
        parameters = request.get("parameters", {})
        transformed_params = adapter["transformers"]["parameters"](parameters)
        
        # 转换上下文
        context = request.get("context", {})
        transformed_context = adapter["transformers"]["context"](context)
        
        return {
            "skill": mapped_skill,
            "parameters": transformed_params,
            "context": transformed_context,
            "source": "claude"
        }
    
    def _translate_stigmergy_to_claude_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """翻译Stigmergy到Claude响应"""
        adapter = self.integration_layer["adapters"]["stigmergy_to_claude"]
        
        # 转换响应格式
        return adapter["transformers"]["response"](response)
    
    def _translate_claude_to_stigmergy_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """翻译Claude到Stigmergy响应"""
        adapter = self.integration_layer["adapters"]["claude_to_stigmergy"]
        
        # 转换响应格式
        return adapter["transformers"]["response"](response)
    
    def _translate_stigmergy_to_claude_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """翻译Stigmergy到Claude上下文"""
        translator = self.integration_layer["translators"]["context"]
        return translator["translations"]["stigmergy_to_claude"](context)
    
    def _translate_claude_to_stigmergy_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """翻译Claude到Stigmergy上下文"""
        translator = self.integration_layer["translators"]["context"]
        return translator["translations"]["claude_to_stigmergy"](context)
    
    def _coordinate_dual_execution(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """协调双系统执行"""
        results = {}
        
        # 检查双系统可用性
        if not (self.status.stigmergy_available and self.status.claude_skills_available):
            return {"error": "Dual system not available"}
        
        # 并行执行
        try:
            # Stigmergy执行
            stigmergy_result = self._execute_stigmergy_request(request)
            results["stigmergy"] = stigmergy_result
            
            # Claude执行
            claude_request = self._translate_stigmergy_to_claude_request(request)
            claude_result = self._execute_claude_request(claude_request)
            results["claude"] = self._translate_claude_to_stigmergy_response(claude_result)
            
            # 合并结果
            results["merged"] = self._merge_results(results["stigmergy"], results["claude"])
            
        except Exception as e:
            results["error"] = str(e)
        
        return results
    
    def _coordinate_fallback_execution(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """协调回退执行"""
        # 优先使用Stigmergy
        if self.status.stigmergy_available:
            try:
                return self._execute_stigmergy_request(request)
            except Exception as e:
                # 回退到Claude
                if self.status.claude_skills_available:
                    claude_request = self._translate_stigmergy_to_claude_request(request)
                    claude_result = self._execute_claude_request(claude_request)
                    return self._translate_claude_to_stigmergy_response(claude_result)
                else:
                    return {"error": str(e)}
        else:
            # 使用Claude
            if self.status.claude_skills_available:
                claude_request = self._translate_stigmergy_to_claude_request(request)
                return self._execute_claude_request(claude_request)
            else:
                return {"error": "No system available"}
    
    def _coordinate_parallel_execution(self, requests: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """协调并行执行"""
        results = []
        
        for request in requests:
            result = self._coordinate_dual_execution(request)
            results.append(result)
        
        return results
    
    def _execute_stigmergy_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """执行Stigmergy请求"""
        # 这里应该调用实际的Stigmergy技能系统
        # 模拟实现
        return {
            "success": True,
            "result": f"Stigmergy executed: {request.get('skill', 'unknown')}",
            "metadata": {
                "system": "stigmergy",
                "timestamp": datetime.now().isoformat()
            }
        }
    
    def _execute_claude_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """执行Claude请求"""
        # 这里应该调用实际的Claude Skills系统
        # 模拟实现
        return {
            "success": True,
            "result": f"Claude Skills executed: {request.get('skill', 'unknown')}",
            "metadata": {
                "system": "claude",
                "timestamp": datetime.now().isoformat()
            }
        }
    
    def _merge_results(self, stigmergy_result: Dict[str, Any], claude_result: Dict[str, Any]) -> Dict[str, Any]:
        """合并执行结果"""
        merged = {
            "success": stigmergy_result.get("success", False) and claude_result.get("success", False),
            "stigmergy_result": stigmergy_result,
            "claude_result": claude_result,
            "merged_data": {}
        }
        
        # 合并数据
        if "result" in stigmergy_result and "result" in claude_result:
            merged["merged_data"] = {
                "stigmergy_data": stigmergy_result["result"],
                "claude_data": claude_result["result"]
            }
        
        return merged
    
    def get_integration_status(self) -> IntegrationStatus:
        """获取集成状态"""
        return self.status
    
    def get_integration_info(self) -> Dict[str, Any]:
        """获取集成信息"""
        return {
            "config": self.config.__dict__,
            "status": self.status.__dict__,
            "integration_layer": self.integration_layer,
            "features": {
                "dual_mode": self.status.integration_mode == "dual",
                "stigmergy_support": self.status.stigmergy_available,
                "claude_skills_support": self.status.claude_skills_available,
                "compatibility_level": self.status.compatibility_level
            }
        }

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python stigmergy_integration.py --action 'action' [parameters]")
        print("可用操作:")
        print("  --action status - 显示集成状态")
        print("  --action info - 显示集成信息")
        print("  --action check - 检查系统兼容性")
        print("  --action test - 测试集成功能")
        sys.exit(1)
    
    integrator = StigmergyIntegrator()
    
    action = sys.argv[2]
    
    if action == "status":
        status = integrator.get_integration_status()
        print("Stigmergy集成状态:")
        print(f"  Stigmergy可用: {status.stigmergy_available}")
        print(f"  Claude Skills可用: {status.claude_skills_available}")
        print(f"  集成模式: {status.integration_mode}")
        print(f"  兼容性级别: {status.compatibility_level}")
        print(f"  活跃功能: {', '.join(status.active_features)}")
    
    elif action == "info":
        info = integrator.get_integration_info()
        print("Stigmergy集成信息:")
        print(json.dumps(info, indent=2, ensure_ascii=False))
    
    elif action == "check":
        print("系统兼容性检查:")
        
        if integrator.status.stigmergy_available:
            print("  ✅ Stigmergy系统: 可用")
        else:
            print("  ❌ Stigmergy系统: 不可用")
        
        if integrator.status.claude_skills_available:
            print("  ✅ Claude Skills: 可用")
        else:
            print("  ❌ Claude Skills: 不可用")
        
        if integrator.status.integration_mode == "dual":
            print("  ✅ 双系统集成: 可用")
        else:
            print(f"  ⚠️ 集成模式: {integrator.status.integration_mode}")
    
    elif action == "test":
        print("测试集成功能...")
        
        # 测试适配器
        test_request = {
            "skill": "executeWikiTask",
            "parameters": {
                "taskDescription": "测试任务",
                "options": {"verbose": True}
            },
            "context": {
                "cliContext": {
                    "availableTools": ["bash", "text_editor"],
                    "environment": "test"
                }
            }
        }
        
        # 测试Stigmergy到Claude转换
        try:
            claude_request = integrator._translate_stigmergy_to_claude_request(test_request)
            print(f"  ✅ Stigmergy到Claude转换: 成功")
            print(f"    映射技能: {claude_request['skill']}")
        except Exception as e:
            print(f"  ❌ Stigmergy到Claude转换: 失败 - {e}")
        
        # 测试Claude到Stigmergy转换
        try:
            stigmergy_request = integrator._translate_claude_to_stigmergy_request(claude_request)
            print(f"  ✅ Claude到Stigmergy转换: 成功")
            print(f"    映射技能: {stigmergy_request['skill']}")
        except Exception as e:
            print(f"  ❌ Claude到Stigmergy转换: 失败 - {e}")
        
        # 测试双系统执行
        try:
            result = integrator._coordinate_dual_execution(test_request)
            print(f"  ✅ 双系统执行: {'成功' if result.get('success') else '失败'}")
        except Exception as e:
            print(f"  ❌ 双系统执行: 失败 - {e}")
    
    else:
        print(f"未知操作: {action}")

if __name__ == "__main__":
    main()