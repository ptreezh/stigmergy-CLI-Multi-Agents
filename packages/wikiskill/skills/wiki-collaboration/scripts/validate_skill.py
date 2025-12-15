#!/usr/bin/env python3
"""
Claude Skills规范验证器
验证Wiki技能是否符合Claude Skills标准规范
"""

import json
import re
import sys
import yaml
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ValidationResult:
    """验证结果数据结构"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    suggestions: List[str]
    score: float

class SkillValidator:
    """技能验证器主类"""
    
    def __init__(self):
        self.required_fields = ['name', 'description']
        self.optional_fields = ['allowed-tools', 'tags', 'version', 'author']
        self.max_name_length = 64
        self.max_description_length = 1024
        self.name_pattern = r'^[a-z0-9-]+$'
        
        self.validation_rules = {
            'yaml_syntax': self._validate_yaml_syntax,
            'required_fields': self._validate_required_fields,
            'field_constraints': self._validate_field_constraints,
            'progressive_disclosure': self._validate_progressive_disclosure,
            'file_structure': self._validate_file_structure,
            'content_quality': self._validate_content_quality
        }
    
    def validate_skill(self, skill_path: str) -> ValidationResult:
        """验证技能规范"""
        errors = []
        warnings = []
        suggestions = []
        
        # 检查技能路径
        if not Path(skill_path).exists():
            errors.append(f"技能路径不存在: {skill_path}")
            return ValidationResult(False, errors, warnings, suggestions, 0.0)
        
        # 检查SKILL.md文件
        skill_file = Path(skill_path) / 'SKILL.md'
        if not skill_file.exists():
            errors.append("缺少SKILL.md文件")
            return ValidationResult(False, errors, warnings, suggestions, 0.0)
        
        # 读取并解析SKILL.md
        try:
            with open(skill_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 解析YAML frontmatter
            yaml_content, markdown_content = self._parse_skill_file(content)
            
            if yaml_content is None:
                errors.append("无法解析YAML frontmatter")
                return ValidationResult(False, errors, warnings, suggestions, 0.0)
            
        except Exception as e:
            errors.append(f"读取SKILL.md文件失败: {str(e)}")
            return ValidationResult(False, errors, warnings, suggestions, 0.0)
        
        # 执行各项验证
        for rule_name, rule_func in self.validation_rules.items():
            try:
                rule_errors, rule_warnings, rule_suggestions = rule_func(
                    yaml_content, markdown_content, skill_path
                )
                errors.extend(rule_errors)
                warnings.extend(rule_warnings)
                suggestions.extend(rule_suggestions)
            except Exception as e:
                warnings.append(f"验证规则 {rule_name} 执行失败: {str(e)}")
        
        # 计算总分
        score = self._calculate_score(len(errors), len(warnings))
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            score=score
        )
    
    def _parse_skill_file(self, content: str) -> Tuple[Dict[str, Any], str]:
        """解析SKILL.md文件"""
        # 查找YAML frontmatter
        if content.startswith('---'):
            try:
                end_index = content.find('---', 3)
                if end_index == -1:
                    return None, content
                
                yaml_text = content[3:end_index].strip()
                markdown_content = content[end_index + 3:].strip()
                
                yaml_data = yaml.safe_load(yaml_text)
                return yaml_data, markdown_content
                
            except yaml.YAMLError as e:
                return None, content
        
        return None, content
    
    def _validate_yaml_syntax(self, yaml_content: Dict[str, Any], 
                            markdown_content: str, skill_path: str) -> Tuple[List[str], List[str], List[str]]:
        """验证YAML语法"""
        errors = []
        warnings = []
        suggestions = []
        
        # 检查YAML是否为字典
        if not isinstance(yaml_content, dict):
            errors.append("YAML frontmatter必须是字典格式")
            return errors, warnings, suggestions
        
        # 检查数据类型
        for key, value in yaml_content.items():
            if key in ['name', 'description', 'version', 'author'] and not isinstance(value, str):
                errors.append(f"字段 {key} 必须是字符串类型")
            
            if key == 'allowed-tools' and not isinstance(value, list):
                errors.append("allowed-tools字段必须是列表类型")
            
            if key == 'tags' and not isinstance(value, list):
                errors.append("tags字段必须是列表类型")
        
        return errors, warnings, suggestions
    
    def _validate_required_fields(self, yaml_content: Dict[str, Any], 
                                markdown_content: str, skill_path: str) -> Tuple[List[str], List[str], List[str]]:
        """验证必需字段"""
        errors = []
        warnings = []
        suggestions = []
        
        # 检查必需字段
        for field in self.required_fields:
            if field not in yaml_content:
                errors.append(f"缺少必需字段: {field}")
            elif not yaml_content[field].strip():
                errors.append(f"字段 {field} 不能为空")
        
        return errors, warnings, suggestions
    
    def _validate_field_constraints(self, yaml_content: Dict[str, Any], 
                                  markdown_content: str, skill_path: str) -> Tuple[List[str], List[str], List[str]]:
        """验证字段约束"""
        errors = []
        warnings = []
        suggestions = []
        
        # 验证name字段
        if 'name' in yaml_content:
            name = yaml_content['name']
            
            if len(name) > self.max_name_length:
                errors.append(f"name字段长度不能超过{self.max_name_length}个字符")
            
            if not re.match(self.name_pattern, name):
                errors.append("name字段只能包含小写字母、数字和连字符")
            
            if name.startswith('-') or name.endswith('-'):
                errors.append("name字段不能以连字符开头或结尾")
            
            if '--' in name:
                errors.append("name字段不能包含连续连字符")
        
        # 验证description字段
        if 'description' in yaml_content:
            description = yaml_content['description']
            
            if len(description) > self.max_description_length:
                errors.append(f"description字段长度不能超过{self.max_description_length}个字符")
            
            if len(description) < 10:
                warnings.append("description字段过短，可能影响技能发现")
            
            # 检查描述是否包含触发词
            trigger_words = ['当', '如果', '在', '需要', '用于', '处理', '创建', '编辑']
            if not any(word in description for word in trigger_words):
                suggestions.append("建议在description中包含触发词以提高技能发现率")
        
        # 验证allowed-tools字段
        if 'allowed-tools' in yaml_content:
            allowed_tools = yaml_content['allowed-tools']
            valid_tools = ['bash', 'text_editor', 'web_search', 'computer', 'python']
            
            for tool in allowed_tools:
                if tool not in valid_tools:
                    warnings.append(f"未知的工具: {tool}，建议使用有效工具: {', '.join(valid_tools)}")
        
        return errors, warnings, suggestions
    
    def _validate_progressive_disclosure(self, yaml_content: Dict[str, Any], 
                                       markdown_content: str, skill_path: str) -> Tuple[List[str], List[str], List[str]]:
        """验证渐进式披露结构"""
        errors = []
        warnings = []
        suggestions = []
        
        # 检查是否有触发条件部分
        if '触发条件' not in markdown_content and '触发' not in markdown_content:
            suggestions.append("建议添加'触发条件'部分以明确技能激活时机")
        
        # 检查是否有核心流程部分
        if '核心' not in markdown_content and '流程' not in markdown_content:
            suggestions.append("建议添加'核心流程'部分以描述技能工作流程")
        
        # 检查是否有具体实施指南
        if '具体实施' not in markdown_content and '使用指南' not in markdown_content:
            suggestions.append("建议添加'具体实施指南'部分以提供使用指导")
        
        # 检查章节结构
        headers = re.findall(r'^#+\s+(.+)$', markdown_content, re.MULTILINE)
        if len(headers) < 3:
            warnings.append("章节结构较少，建议增加更多章节以提高内容组织性")
        
        # 检查是否有代码示例
        if '```' not in markdown_content and 'bash(' not in markdown_content:
            suggestions.append("建议添加代码示例或使用示例以提高实用性")
        
        return errors, warnings, suggestions
    
    def _validate_file_structure(self, yaml_content: Dict[str, Any], 
                               markdown_content: str, skill_path: str) -> Tuple[List[str], List[str], List[str]]:
        """验证文件结构"""
        errors = []
        warnings = []
        suggestions = []
        
        skill_dir = Path(skill_path)
        
        # 检查支持目录
        required_dirs = ['scripts', 'references']
        for dir_name in required_dirs:
            dir_path = skill_dir / dir_name
            if not dir_path.exists():
                suggestions.append(f"建议创建 {dir_name} 目录以存放支持文件")
        
        # 检查scripts目录中的文件
        scripts_dir = skill_dir / 'scripts'
        if scripts_dir.exists():
            script_files = list(scripts_dir.glob('*.py'))
            if not script_files:
                warnings.append("scripts目录为空，建议添加支持脚本")
            
            for script_file in script_files:
                if not script_file.is_file():
                    warnings.append(f"scripts目录中的 {script_file.name} 不是有效文件")
        
        # 检查references目录中的文件
        refs_dir = skill_dir / 'references'
        if refs_dir.exists():
            ref_files = list(refs_dir.glob('*.md'))
            if not ref_files:
                warnings.append("references目录为空，建议添加参考文档")
        
        return errors, warnings, suggestions
    
    def _validate_content_quality(self, yaml_content: Dict[str, Any], 
                                markdown_content: str, skill_path: str) -> Tuple[List[str], List[str], List[str]]:
        """验证内容质量"""
        errors = []
        warnings = []
        suggestions = []
        
        # 检查内容长度
        if len(markdown_content) < 500:
            warnings.append("内容较短，可能无法提供充分的指导")
        elif len(markdown_content) > 10000:
            suggestions.append("内容较长，考虑拆分为多个文件以提高可维护性")
        
        # 检查列表项
        list_items = re.findall(r'^\s*[-*+]\s+(.+)$', markdown_content, re.MULTILINE)
        if len(list_items) < 10:
            suggestions.append("建议增加更多列表项以提高内容的结构性")
        
        # 检查代码块
        code_blocks = re.findall(r'```[\w]*\n.*?```', markdown_content, re.DOTALL)
        if len(code_blocks) == 0:
            suggestions.append("建议添加代码块以提供具体示例")
        
        # 检查链接
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', markdown_content)
        if len(links) > 0:
            # 检查是否有内部链接
            internal_links = [link for link in links if link[1].startswith('#')]
            if len(internal_links) == 0:
                suggestions.append("建议添加内部链接以提高导航性")
        
        # 检查是否有最佳实践部分
        if '最佳实践' not in markdown_content and '实践建议' not in markdown_content:
            suggestions.append("建议添加'最佳实践'部分以提供使用指导")
        
        return errors, warnings, suggestions
    
    def _calculate_score(self, error_count: int, warning_count: int) -> float:
        """计算验证分数"""
        base_score = 100.0
        
        # 错误扣分
        error_penalty = error_count * 20
        
        # 警告扣分
        warning_penalty = warning_count * 5
        
        final_score = max(0, base_score - error_penalty - warning_penalty)
        
        return final_score
    
    def generate_validation_report(self, result: ValidationResult, skill_path: str) -> str:
        """生成验证报告"""
        report = []
        report.append(f"# {Path(skill_path).name} - Claude Skills规范验证报告\n")
        
        # 总体结果
        status = "✅ 通过" if result.is_valid else "❌ 未通过"
        report.append(f"## 验证结果: {status}")
        report.append(f"**得分**: {result.score:.1f}/100\n")
        
        # 错误
        if result.errors:
            report.append("## ❌ 错误\n")
            for i, error in enumerate(result.errors, 1):
                report.append(f"{i}. {error}")
            report.append("")
        
        # 警告
        if result.warnings:
            report.append("## ⚠️ 警告\n")
            for i, warning in enumerate(result.warnings, 1):
                report.append(f"{i}. {warning}")
            report.append("")
        
        # 建议
        if result.suggestions:
            report.append("## 💡 建议\n")
            for i, suggestion in enumerate(result.suggestions, 1):
                report.append(f"{i}. {suggestion}")
            report.append("")
        
        # 规范说明
        report.append("## 📋 Claude Skills规范要点\n")
        report.append("### 必需字段")
        report.append("- `name`: 技能名称（小写字母、数字、连字符，最多64字符）")
        report.append("- `description`: 技能描述（最多1024字符）")
        report.append("")
        
        report.append("### 可选字段")
        report.append("- `allowed-tools`: 允许使用的工具列表")
        report.append("- `tags`: 标签列表")
        report.append("- `version`: 版本号")
        report.append("- `author`: 作者")
        report.append("")
        
        report.append("### 内容结构")
        report.append("- YAML frontmatter + Markdown内容")
        report.append("- 建议包含触发条件、核心流程、实施指南")
        report.append("- 支持渐进式披露（三级加载）")
        report.append("- 建议包含scripts/和references/目录")
        report.append("")
        
        report.append("### 质量标准")
        report.append("- 内容长度适中（500-10000字符）")
        report.append("- 结构清晰，有明确的章节层次")
        report.append("- 包含具体的示例和代码")
        report.append("- 提供实用的指导和建议")
        
        return "\n".join(report)
    
    def validate_all_skills(self, skills_dir: str) -> Dict[str, ValidationResult]:
        """验证所有技能"""
        results = {}
        
        skills_path = Path(skills_dir)
        if not skills_path.exists():
            return results
        
        for skill_dir in skills_path.iterdir():
            if skill_dir.is_dir():
                result = self.validate_skill(str(skill_dir))
                results[skill_dir.name] = result
        
        return results

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python validate_skill.py --skill '技能路径'")
        print("       python validate_skill.py --all '技能目录'")
        sys.exit(1)
    
    validator = SkillValidator()
    
    if sys.argv[1] == "--skill":
        skill_path = sys.argv[2]
        
        # 验证单个技能
        result = validator.validate_skill(skill_path)
        
        # 生成报告
        report = validator.generate_validation_report(result, skill_path)
        
        # 输出报告
        print(report)
        
        # 保存报告
        report_file = Path(skill_path) / "validation_report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n验证报告已保存到 {report_file}")
        
        # 返回退出码
        sys.exit(0 if result.is_valid else 1)
    
    elif sys.argv[1] == "--all":
        skills_dir = sys.argv[2]
        
        # 验证所有技能
        results = validator.validate_all_skills(skills_dir)
        
        if not results:
            print("未找到任何技能")
            sys.exit(1)
        
        # 生成汇总报告
        report = ["# Claude Skills规范验证汇总报告\n"]
        
        total_count = len(results)
        passed_count = sum(1 for r in results.values() if r.is_valid)
        
        report.append(f"## 总体结果")
        report.append(f"- 总技能数: {total_count}")
        report.append(f"- 通过验证: {passed_count}")
        report.append(f"- 未通过验证: {total_count - passed_count}")
        report.append(f"- 通过率: {passed_count/total_count*100:.1f}%\n")
        
        # 详细结果
        report.append("## 详细结果\n")
        for skill_name, result in results.items():
            status = "✅ 通过" if result.is_valid else "❌ 未通过"
            report.append(f"### {skill_name}: {status} ({result.score:.1f}/100)")
            
            if result.errors:
                report.append("**错误**:")
                for error in result.errors:
                    report.append(f"- {error}")
            
            if result.warnings:
                report.append("**警告**:")
                for warning in result.warnings:
                    report.append(f"- {warning}")
            
            report.append("")
        
        # 输出报告
        print("\n".join(report))
        
        # 保存报告
        with open("skills_validation_summary.md", 'w', encoding='utf-8') as f:
            f.write("\n".join(report))
        
        print(f"\n汇总报告已保存到 skills_validation_summary.md")
        
        # 返回退出码
        sys.exit(0 if passed_count == total_count else 1)
    
    else:
        print("参数错误")
        sys.exit(1)

if __name__ == "__main__":
    main()