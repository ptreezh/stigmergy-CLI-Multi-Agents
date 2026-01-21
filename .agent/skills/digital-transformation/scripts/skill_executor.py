#!/usr/bin/env python3
"""
技能执行器 - 支持信息渐进式披露（Progressive Disclosure）
遵循agentskills.io规范
"""

import json
import importlib
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

from llm_client import LLMClientFactory

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SkillExecutor:
    """技能执行器 - 支持渐进式披露"""

    def __init__(
        self,
        skill_config_path: str,
        llm_provider: str = "openai",
        llm_model: Optional[str] = None,
        llm_api_key: Optional[str] = None
    ):
        """
        初始化技能执行器

        Args:
            skill_config_path: 技能配置文件路径
            llm_provider: LLM提供商
            llm_model: LLM模型名称
            llm_api_key: LLM API密钥
        """
        self.skill_config_path = skill_config_path
        self.llm_provider = llm_provider
        self.llm_model = llm_model
        self.llm_api_key = llm_api_key

        # 加载技能配置
        self.skill_config = self._load_skill_config()
        self.skills = self.skill_config.get("skills", {})
        self.integration_scripts = self.skill_config.get("integration_scripts", {})

        # 执行配置
        self.execution_config = self.skill_config.get("execution_config", {})

        logger.info(f"技能执行器初始化完成\n"
                   f"  技能配置: {skill_config_path}\n"
                   f"  技能数量: {len(self.skills)}\n"
                   f"  渐进式披露: {self.skill_config.get('progressive_disclosure', false)}")

    def _load_skill_config(self) -> Dict[str, Any]:
        """加载技能配置"""
        config_path = Path(self.skill_config_path)
        if not config_path.exists():
            raise FileNotFoundError(f"技能配置文件不存在: {config_path}")

        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # 验证配置
        if "skills" not in config:
            raise ValueError("技能配置中缺少 'skills' 字段")

        if not config.get("requires_llm", False):
            logger.warning("技能配置中 'requires_llm' 为 false，但执行器是为LLM设计的")

        return config

    def _load_script(
        self,
        script_path: str,
        skill_name: str
    ):
        """
        动态加载脚本模块

        Args:
            script_path: 脚本路径（相对于技能目录）
            skill_name: 技能名称

        Returns:
            脚本模块
        """
        try:
            # 构建完整的模块路径
            skill_dir = Path(self.skill_config_path).parent
            full_script_path = skill_dir / script_path

            if not full_script_path.exists():
                logger.warning(f"脚本不存在: {full_script_path}")
                return None

            # 动态导入模块
            module_name = Path(script_path).stem
            spec = importlib.util.spec_from_file_location(module_name, full_script_path)

            if spec is None or spec.loader is None:
                logger.error(f"无法加载模块: {full_script_path}")
                return None

            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            logger.info(f"成功加载脚本: {script_path}")
            return module

        except Exception as e:
            logger.error(f"加载脚本失败 {script_path}: {e}")
            return None

    def _execute_step(
        self,
        step: Dict[str, Any],
        context: Dict[str, Any],
        skill_dir: Path
    ) -> Dict[str, Any]:
        """
        执行单个步骤

        Args:
            step: 步骤配置
            context: 当前上下文
            skill_dir: 技能目录

        Returns:
            步骤执行结果
        """
        step_name = step.get("step", "unknown")
        step_type = step.get("type", "analysis")

        logger.info(f"\n执行步骤: {step_name}")
        logger.info(f"  描述: {step.get('description', '')}")

        # 检查是否是可选步骤
        if step.get("optional", False):
            logger.info(f"  状态: 可选步骤")
            # TODO: 从用户输入或配置中决定是否执行
            return {"status": "skipped", "reason": "optional_step"}

        # 检查必需的输入
        required_inputs = step.get("required_inputs", [])
        missing_inputs = [inp for inp in required_inputs if inp not in context]
        if missing_inputs:
            logger.warning(f"  缺少必需的输入: {missing_inputs}")
            raise ValueError(f"步骤 {step_name} 缺少必需的输入: {missing_inputs}")

        # 执行不同类型的步骤
        if step_type == "collect_context":
            return self._execute_collect_step(step, context, skill_dir)
        elif step_type == "llm_analysis":
            return self._execute_llm_step(step, context, skill_dir)
        elif step_type == "visualization":
            return self._execute_visualization_step(step, context, skill_dir)
        else:
            logger.warning(f"  未知步骤类型: {step_type}")
            return {"status": "unknown_step_type"}

    def _execute_collect_step(
        self,
        step: Dict[str, Any],
        context: Dict[str, Any],
        skill_dir: Path
    ) -> Dict[str, Any]:
        """
        执行数据收集步骤

        Args:
            step: 步骤配置
            context: 当前上下文
            skill_dir: 技能目录

        Returns:
            收集结果
        """
        script_path = step.get("script")
        function_name = step.get("function")

        if not script_path or not function_name:
            logger.warning("  缺少脚本或函数名称")
            return {"status": "error", "error": "missing_script_or_function"}

        # 加载脚本
        module = self._load_script(script_path, "data_integrator")
        if not module:
            return {"status": "error", "error": "failed_to_load_script"}

        # 调用函数
        try:
            func = getattr(module, function_name)

            # 从上下文中提取参数
            params = {}
            for key in context.keys():
                if key in step.get("required_inputs", []):
                    params[key] = context[key]

            # 执行函数
            result = func(**params)

            logger.info(f"  状态: 成功")
            return {"status": "success", "result": result}

        except Exception as e:
            logger.error(f"  执行失败: {e}")
            return {"status": "error", "error": str(e)}

    def _execute_llm_step(
        self,
        step: Dict[str, Any],
        context: Dict[str, Any],
        skill_dir: Path
    ) -> Dict[str, Any]:
        """
        执行LLM分析步骤

        Args:
            step: 步骤配置
            context: 当前上下文
            skill_dir: 技能目录

        Returns:
            分析结果
        """
        script_path = step.get("script")
        function_name = step.get("function")

        if not script_path or not function_name:
            logger.warning("  缺少脚本或函数名称")
            return {"status": "error", "error": "missing_script_or_function"}

        # 加载脚本
        module = self._load_script(script_path, "llm_analyzer")
        if not module:
            return {"status": "error", "error": "failed_to_load_script"}

        # 调用函数
        try:
            func = getattr(module, function_name)

            # 从上下文中提取参数
            params = {}
            for key in context.keys():
                if key in step.get("required_inputs", []):
                    params[key] = context[key]

            # 执行函数
            result = func(**params)

            logger.info(f"  状态: 成功")
            return {"status": "success", "result": result}

        except Exception as e:
            logger.error(f"  执行失败: {e}")
            return {"status": "error", "error": str(e)}

    def _execute_visualization_step(
        self,
        step: Dict[str, Any],
        context: Dict[str, Any],
        skill_dir: Path
    ) -> Dict[str, Any]:
        """
        执行可视化步骤

        Args:
            step: 步骤配置
            context: 当前上下文
            skill_dir: 技能目录

        Returns:
            可视化结果
        """
        script_path = step.get("script")
        function_name = step.get("function")

        if not script_path or not function_name:
            logger.warning("  缺少脚本或函数名称")
            return {"status": "error", "error": "missing_script_or_function"}

        # 加载脚本
        module = self._load_script(script_path, "visualizer")
        if not module:
            return {"status": "error", "error": "failed_to_load_script"}

        # 调用函数
        try:
            func = getattr(module, function_name)

            # 从上下文中提取参数
            params = {}
            for key in context.keys():
                if key in step.get("required_inputs", []):
                    params[key] = context[key]

            # 执行函数
            result = func(**params)

            logger.info(f"  状态: 成功")
            return {"status": "success", "result": result}

        except Exception as e:
            logger.error(f"  执行失败: {e}")
            return {"status": "error", "error": str(e)}

    def execute_skill(
        self,
        skill_name: str,
        context: Dict[str, Any],
        output_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        执行技能 - 支持渐进式披露

        Args:
            skill_name: 技能名称
            context: 初始上下文
            output_file: 输出文件路径（可选）

        Returns:
            执行结果
        """
        logger.info(f"\n{'='*70}")
        logger.info(f"开始执行技能: {skill_name}")
        logger.info(f"{'='*70}")

        # 检查技能是否存在
        if skill_name not in self.skills:
            available_skills = list(self.skills.keys())
            raise ValueError(
                f"技能不存在: {skill_name}\n"
                f"可用的技能: {', '.join(available_skills)}"
            )

        # 获取技能配置
        skill_config = self.skills[skill_name]

        logger.info(f"\n技能信息:")
        logger.info(f"  名称: {skill_config.get('name', '')}")
        logger.info(f"  描述: {skill_config.get('description', '')}")
        logger.info(f"  类型: {skill_config.get('type', '')}")
        logger.info(f"  层级: {skill_config.get('layer', '')}")

        # 检查上下文要求
        context_requirements = skill_config.get("context_requirements", {})
        required = context_requirements.get("required", [])
        optional = context_requirements.get("optional", [])

        # 验证必需的上下文
        missing_required = [field for field in required if field not in context]
        if missing_required:
            logger.warning(f"缺少必需的上下文字段: {missing_required}")

        # 执行渐进式步骤
        progressive_steps = skill_config.get("progressive_steps", [])
        if not progressive_steps:
            logger.warning("技能没有配置渐进式步骤")

        execution_context = context.copy()
        execution_results = {}

        for i, step in enumerate(progressive_steps, 1):
            step_name = step.get("step", f"step_{i}")

            try:
                # 执行步骤
                result = self._execute_step(step, execution_context, Path(self.skill_config_path).parent)

                # 将结果添加到上下文中
                if result.get("status") == "success":
                    step_output_key = f"{step_name}_output"
                    execution_context[step_output_key] = result.get("result")
                    execution_results[step_name] = result
                elif result.get("status") == "skipped":
                    execution_results[step_name] = result
                else:
                    # 步骤失败，决定是否继续
                    logger.error(f"步骤 {step_name} 失败")
                    if not self.execution_config.get("retry_on_failure", False):
                        logger.info("根据配置，停止执行")
                        break
            except Exception as e:
                logger.error(f"步骤 {step_name} 执行时发生异常: {e}")
                execution_results[step_name] = {
                    "status": "error",
                    "error": str(e)
                }

                # 根据配置决定是否继续
                if not self.execution_config.get("retry_on_failure", False):
                    break

        # 生成最终结果
        final_result = {
            "skill_name": skill_name,
            "skill_config": skill_config,
            "execution_results": execution_results,
            "final_context": execution_context
        }

        # 保存结果
        if output_file:
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(final_result, f, ensure_ascii=False, indent=2)
                logger.info(f"\n执行结果已保存到: {output_file}")
            except Exception as e:
                logger.error(f"保存结果失败: {e}")

        return final_result

    def list_skills(self) -> List[str]:
        """列出所有可用的技能"""
        return list(self.skills.keys())

    def get_skill_info(self, skill_name: str) -> Optional[Dict[str, Any]]:
        """
        获取技能信息

        Args:
            skill_name: 技能名称

        Returns:
            技能信息
        """
        return self.skills.get(skill_name)


def main():
    """主函数 - 测试技能执行器"""
    import argparse

    parser = argparse.ArgumentParser(description="技能执行器 - 支持渐进式披露")
    parser.add_argument("--config", type=str, default="config_llm.json", help="技能配置文件路径")
    parser.add_argument("--skill", type=str, help="要执行的技能名称")
    parser.add_argument("--llm_provider", type=str, default="openai", help="LLM提供商")
    parser.add_argument("--llm_model", type=str, help="LLM模型名称")
    parser.add_argument("--llm_api_key", type=str, help="LLM API密钥")
    parser.add_argument("--context", type=str, help="初始上下文(JSON格式)")
    parser.add_argument("--context_file", type=str, help="初始上下文文件路径")
    parser.add_argument("--output_file", type=str, help="输出文件路径")
    parser.add_argument("--list_skills", action="store_true", help="列出所有可用技能")

    args = parser.parse_args()

    # 初始化执行器
    try:
        executor = SkillExecutor(
            skill_config_path=args.config,
            llm_provider=args.llm_provider,
            llm_model=args.llm_model,
            llm_api_key=args.llm_api_key
        )
    except Exception as e:
        print(f"初始化执行器失败: {e}")
        return 1

    # 列出技能
    if args.list_skills:
        print("\n可用的技能:")
        print("="*70)
        for skill_name in executor.list_skills():
            skill_info = executor.get_skill_info(skill_name)
            if skill_info:
                print(f"\n技能: {skill_name}")
                print(f"  名称: {skill_info.get('name', '')}")
                print(f"  描述: {skill_info.get('description', '')}")
                print(f"  类型: {skill_info.get('type', '')}")
                print(f"  层级: {skill_info.get('layer', '')}")
        return 0

    # 执行技能
    if not args.skill:
        print("错误: 请指定要执行的技能名称 (--skill) 或使用 --list_skills 查看可用技能")
        return 1

    # 准备上下文
    context = {}
    if args.context:
        context = json.loads(args.context)
    elif args.context_file:
        with open(args.context_file, 'r', encoding='utf-8') as f:
            context = json.load(f)
    else:
        print("错误: 请提供初始上下文 (--context 或 --context_file)")
        return 1

    # 执行技能
    try:
        result = executor.execute_skill(
            skill_name=args.skill,
            context=context,
            output_file=args.output_file
        )

        print("\n执行完成!")
        print("="*70)
        print(f"技能: {result['skill_name']}")
        print(f"执行结果: {len(result['execution_results'])} 个步骤")

        # 打印执行摘要
        for step_name, step_result in result['execution_results'].items():
            status = step_result.get('status', 'unknown')
            if status == 'success':
                print(f"  ✓ {step_name}: 成功")
            elif status == 'skipped':
                print(f"  - {step_name}: 跳过 ({step_result.get('reason', '')})")
            else:
                print(f"  ✗ {step_name}: 失败 ({step_result.get('error', '')})")

        return 0

    except Exception as e:
        print(f"执行技能失败: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
