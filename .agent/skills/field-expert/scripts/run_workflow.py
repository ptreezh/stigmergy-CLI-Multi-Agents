#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
布迪厄场域分析工作流 - 使用 stigmergy 调用宿主 LLM

工作流步骤:
  1. 数据准备 - 扫描源文件，生成 combined_input.json
  2. 边界分析 - 调用 LLM 识别场域边界
  3. 资本分析 - 调用 LLM 分析资本分布
  4. 习性分析 - 调用 LLM 分析习性模式
  5. 动态分析 - 调用 LLM 分析场域动力学
  6. 生成报告 - 整合所有结果

输入输出规范:
  输入:  test_data/{analysis}/ (21个分析文件)
  中间:  field_analysis_workflow/intermediate/
  输出:  field_analysis_workflow/output/
"""

import argparse
import json
import subprocess
import sys
import re
import os
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional


def run_stigmergy(prompt: str) -> str:
    """调用 stigmergy qwen 执行 LLM 分析"""
    print(f"\n📤 正在调用 stigmergy qwen...")
    print(f"   提示词长度: {len(prompt)} 字符")
    
    try:
        # 写入提示词到临时文件
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        prompt_file = f"temp_prompt_{timestamp}.txt"
        
        with open(prompt_file, 'w', encoding='utf-8') as f:
            f.write(prompt)
        
        # 使用 PowerShell 执行 stigmergy claude
        ps_command = f'powershell -Command "$p = Get-Content \'{prompt_file}\' -Raw -Encoding UTF8; stigmergy claude $p"'
        
        result = subprocess.run(
            ps_command,
            capture_output=True,
            text=True,
            shell=True,
            encoding='utf-8',
            errors='replace',
            timeout=180
        )
        
        output = result.stdout
        
        # 清理临时文件
        try:
            os.remove(prompt_file)
        except:
            pass
        
        if result.returncode != 0:
            print(f"⚠️ 命令返回非零: {result.stderr}")
        
        if output:
            print(f"\n📥 LLM 响应 (前500字符):\n{output[:500]}...")
        else:
            print(f"\n⚠️ LLM 响应为空！")
        
        return output
        
    except subprocess.TimeoutExpired:
        print("⚠️ stigmergy 调用超时")
        return ""
    except Exception as e:
        print(f"⚠️ stigmergy 调用失败: {e}")
        return ""


def extract_entity_summary(input_data: Dict[str, Any]) -> str:
    """从输入数据中提取关键实体摘要（不包含完整文本）"""
    entities = {"actors": set()}
    
    grounded_theory_files = input_data.get("grounded_theory", {}).get("files", [])
    
    # 提取角色名称
    for file_data in grounded_theory_files[:5]:
        content = file_data.get("content", "")
        actor_patterns = [
            r'(唐僧|孙悟空|猪八戒|沙僧|白龙马)',
            r'(玉皇大帝|太上老君|观音菩萨|如来佛祖)',
            r'(牛魔王|铁扇公主|红孩儿|白骨精)',
            r'([^\s，。、！？：；""''\'【】()\\[\\]]{2,4}佛祖)',
            r'([^\s，。、！？：；""''\'【】()\\[\\]]{2,4}菩萨)',
        ]
        for pattern in actor_patterns:
            matches = re.findall(pattern, content)
            entities["actors"].update(matches)
    
    lines = []
    lines.append("【角色列表】")
    actors = list(entities["actors"])[:25]
    if actors:
        lines.append(", ".join(actors))
    
    total_chars = sum(f.get("stats", {}).get("chars", 0) for f in grounded_theory_files)
    lines.append(f"【文本总字符数】{total_chars}")
    
    return "\n".join(lines)


def parse_field_response(response: str) -> Dict[str, Any]:
    """解析场域分析响应"""
    result = {"fields": [], "gatekeepers": [], "boundary_dynamics": {}, "field_relations": {}}
    
    # 匹配 "场域名：角色1、角色2" 格式
    pattern = r'([^：:\n]+)[：:]\s*([^。\n]+)'
    matches = re.findall(pattern, response)
    
    field_name_map = {
        "佛界": "佛界", "Buddha Realm": "佛界",
        "天庭": "天庭", "Heaven": "天庭",
        "人间": "人间", "Human World": "人间",
        "妖界": "妖界", "Demon World": "妖界",
        "取经团队": "取经团队", "Pilgrimage Team": "取经团队"
    }
    
    for match in matches:
        field_raw = match[0].strip()
        actors_raw = match[1].strip()
        field_name = field_name_map.get(field_raw, field_raw)
        
        if field_name in field_name_map.values():
            actors = [a.strip() for a in re.split(r'[、,，]', actors_raw) if a.strip()]
            result["fields"].append({"name": field_name, "core_actors": actors[:5]})
    
    return result


def parse_capital_response(response: str) -> Dict[str, Any]:
    """解析资本分析响应"""
    result = {"capital_types": {}, "distribution": {}, "ranking": []}
    
    pattern = r'([^：:\n]+)[：:]([^\n]+)'
    matches = re.findall(pattern, response)
    
    capital_level_map = {"高": 3, "中": 2, "低": 1}
    field_name_map = {"佛界": "佛界", "天庭": "天庭", "人间": "人间", "妖界": "妖界", "取经团队": "取经团队"}
    capital_names = ["经济资本", "文化资本", "社会资本", "象征资本"]
    
    for match in matches:
        field_raw = match[0].strip()
        capital_str = match[1].strip()
        field_name = field_name_map.get(field_raw, field_raw)
        
        if field_name in field_name_map.values():
            capital_dict = {}
            for cn in capital_names:
                level_match = re.search(rf'{cn}\(([高中低123]+)\)', capital_str)
                if level_match:
                    level_str = level_match.group(1)
                    if level_str.isdigit():
                        capital_dict[cn] = int(level_str)
                    elif level_str in capital_level_map:
                        capital_dict[cn] = capital_level_map[level_str]
            result["distribution"][field_name] = capital_dict
    
    return result


def parse_habitus_response(response: str) -> Dict[str, Any]:
    """解析习性分析响应"""
    result = {"actors": [], "symbolic_violence": {}, "cross_field": {}}
    pattern = r'([^：:\n]+)[：:]([^\n]+)'
    matches = re.findall(pattern, response)
    
    for match in matches:
        actor_raw = match[0].strip()
        habitus_str = match[1].strip()
        habitus_list = [h.strip() for h in re.split(r'[、,，]', habitus_str) if h.strip()]
        result["actors"].append({"name": actor_raw, "habitus": habitus_list[:5]})
    
    return result


def parse_dynamics_response(response: str) -> Dict[str, Any]:
    """解析动态分析响应"""
    result = {"competition": {}, "power": {}, "evolution": {}, "theory": {}}
    
    # 匹配 "场域1-场域2：关系" 格式
    pattern = r'([^\s-]+)-([^\s：]+)[：:]([^\n]+)'
    matches = re.findall(pattern, response)
    
    for match in matches:
        field1 = match[0].strip()
        field2 = match[1].strip()
        relation = match[2].strip()
        result["competition"][f"{field1}-{field2}"] = {"type": relation, "description": relation}
    
    return result


# =============================================================================
# 步骤函数
# =============================================================================

def step_1_prepare_data(input_path: Path, workflow_dir: Path) -> Path:
    """步骤1: 数据准备"""
    print("\n" + "=" * 60)
    print("步骤1: 数据准备")
    print("=" * 60)
    
    SKILL_DIR = Path(__file__).parent.parent
    prepare_script = SKILL_DIR / "scripts" / "prepare_data.py"
    output_dir = workflow_dir / "input" / "processed"
    
    # 直接调用 prepare_data.py
    sys.path.insert(0, str(SKILL_DIR / "scripts"))
    from prepare_data import scan_source_files, merge_data
    
    source_dir = Path(input_path)
    files = scan_source_files(source_dir)
    
    print(f"   扎根理论文件: {len(files['grounded_theory'])}")
    print(f"   社会网络文件: {len(files['social_network'])}")
    print(f"   ESOC框架文件: {len(files['esoc_framework'])}")
    
    merged_data = merge_data(files)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "combined_input.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 数据准备完成")
    print(f"   总文件数: {merged_data['metadata']['total_files']}")
    
    return output_file


def step_2_boundary_analysis(combined_input: Path, workflow_dir: Path) -> Path:
    """步骤2: 边界分析"""
    print("\n" + "=" * 60)
    print("步骤2: 边界分析 (LLM)")
    print("=" * 60)
    
    with open(combined_input, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    # 提取摘要
    summary = extract_entity_summary(input_data)
    
    # 构建提示词
    prompt = f"""{summary}

根据以上文本，识别其中的社会场域及核心行动者。

**必须严格按照以下格式输出，不要添加任何解释或额外内容**：

```
天庭：玉皇大帝、太上老君、观音菩萨
佛界：如来佛祖
人间：唐僧、孙悟空、猪八戒、沙僧
妖界：牛魔王、白骨精
```

只输出格式化的场域列表，不要其他内容。
"""
    
    response = run_stigmergy(prompt)
    result_data = parse_field_response(response)
    
    output_dir = workflow_dir / "intermediate" / "01_boundary"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "boundary_results.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
    
    fields = result_data.get("fields", [])
    print(f"✅ 边界分析完成")
    print(f"   识别场域: {len(fields)} 个")
    for field in fields:
        print(f"   - {field.get('name', '未命名')}: {', '.join(field.get('core_actors', [])[:3])}")
    
    return output_file


def step_3_capital_analysis(combined_input: Path, workflow_dir: Path) -> Path:
    """步骤3: 资本分析"""
    print("\n" + "=" * 60)
    print("步骤3: 资本分析 (LLM)")
    print("=" * 60)
    
    # 读取步骤2的边界分析结果
    boundary_file = workflow_dir / "intermediate" / "01_boundary" / "boundary_results.json"
    boundary_data = json.loads(boundary_file.read_text(encoding='utf-8')) if boundary_file.exists() else {}
    fields = boundary_data.get("fields", [])
    
    # 构建场域信息
    fields_info = []
    for field in fields:
        name = field.get("name", "")
        actors = field.get("core_actors", [])
        if name and actors:
            fields_info.append(f"{name}：{', '.join(actors)}")
    
    with open(combined_input, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    summary = extract_entity_summary(input_data)
    
    fields_info_text = "\n".join(fields_info) if fields_info else "请从文本中识别场域"
    
    prompt = f"""{summary}

识别到的场域：
{fields_info_text}

分析各场域中不同行动者的资本分布。资本类型：经济、文化、社会、象征。

**必须严格按照以下格式输出，不要添加任何解释或额外内容**：

```
天庭：
  玉皇大帝：经济(高)、文化(中)、社会(高)、象征(高)
  太上老君：经济(高)、文化(高)、社会(中)、象征(高)
佛界：
  如来佛祖：经济(高)、文化(高)、社会(高)、象征(高)
人间：
  唐僧：经济(低)、文化(高)、社会(中)、象征(高)
```

只输出格式化的资本分布，不要其他内容。
"""
    
    response = run_stigmergy(prompt)
    result_data = parse_capital_response(response)
    
    output_dir = workflow_dir / "intermediate" / "02_capital"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "capital_results.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 资本分析完成")
    print(f"   场域数量: {len(result_data.get('distribution', {}))}")
    
    return output_file


def step_4_habitus_analysis(combined_input: Path, workflow_dir: Path) -> Path:
    """步骤4: 习性分析"""
    print("\n" + "=" * 60)
    print("步骤4: 习性分析 (LLM)")
    print("=" * 60)
    
    with open(combined_input, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    summary = extract_entity_summary(input_data)
    
    prompt = f"""{summary}

分析各行动者的习性特征。习性是场域中内化的感知、评判和行动倾向。

**必须严格按照以下格式输出，不要添加任何解释或额外内容**：

```
孙悟空：反抗权威、追求自由、机智灵活
猪八戒：贪吃懒惰、性情温和、眷恋人世
唐僧：坚定信念、慈悲为循、循规蹈矩
```

只输出格式化的习性列表，不要其他内容。
"""
    
    response = run_stigmergy(prompt)
    result_data = parse_habitus_response(response)
    
    output_dir = workflow_dir / "intermediate" / "03_habitus"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "habitus_results.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 习性分析完成")
    print(f"   行动者数量: {len(result_data.get('actors', []))}")
    
    return output_file


def step_5_dynamics_analysis(combined_input: Path, workflow_dir: Path) -> Path:
    """步骤5: 场域动态分析"""
    print("\n" + "=" * 60)
    print("步骤5: 场域动态分析 (LLM)")
    print("=" * 60)
    
    with open(combined_input, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    summary = extract_entity_summary(input_data)
    
    prompt = f"""场域动态分析维度：
1. 场域间关系：对立、合作、统治、依附等
2. 场域竞争：资源争夺、位置争夺
3. 场域演变：历史变迁、结构重组

{summary}

分析场域间的关系和演变。

**必须严格按照以下格式输出，不要添加任何解释或额外内容**：

```
佛界-天庭：统治关系（佛界统御天庭）
天庭-妖界：对立关系（天庭镇压妖界）
取经过程：从人间到佛界的习性转化
```

只输出格式化的场域动态，不要其他内容。
"""
    
    response = run_stigmergy(prompt)
    result_data = parse_dynamics_response(response)
    
    output_dir = workflow_dir / "intermediate" / "04_dynamics"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "dynamics_results.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 场域动态分析完成")
    
    return output_file


def step_6_generate_report(workflow_dir: Path) -> Path:
    """步骤6: 生成报告"""
    print("\n" + "=" * 60)
    print("步骤6: 生成报告")
    print("=" * 60)
    
    # 读取所有中间结果
    boundary_file = workflow_dir / "intermediate" / "01_boundary" / "boundary_results.json"
    capital_file = workflow_dir / "intermediate" / "02_capital" / "capital_results.json"
    habitus_file = workflow_dir / "intermediate" / "03_habitus" / "habitus_results.json"
    dynamics_file = workflow_dir / "intermediate" / "04_dynamics" / "dynamics_results.json"
    
    boundary = json.loads(boundary_file.read_text(encoding='utf-8')) if boundary_file.exists() else {}
    capital = json.loads(capital_file.read_text(encoding='utf-8')) if capital_file.exists() else {}
    habitus = json.loads(habitus_file.read_text(encoding='utf-8')) if habitus_file.exists() else {}
    dynamics = json.loads(dynamics_file.read_text(encoding='utf-8')) if dynamics_file.exists() else {}
    
    # 生成综合分析
    comprehensive = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "analysis_type": "bourdieu_field",
            "methodology": "LLM-based analysis"
        },
        "boundary_analysis": boundary,
        "capital_analysis": capital,
        "habitus_analysis": habitus,
        "dynamics_analysis": dynamics
    }
    
    output_json = workflow_dir / "output" / "json" / "comprehensive_analysis.json"
    output_json.parent.mkdir(parents=True, exist_ok=True)
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(comprehensive, f, ensure_ascii=False, indent=2)
    
    # 生成HTML报告
    fields = boundary.get("fields", [])
    html = f"""<!DOCTYPE html>
<html lang=\"zh-CN\">
<head>
    <meta charset=\"UTF-8\">
    <title>布迪厄场域分析报告</title>
    <style>
        body {{ font-family: serif; max-width: 900px; margin: 0 auto; padding: 20px; }}
        h1 {{ color: #2d3748; border-bottom: 3px solid #c53030; padding-bottom: 10px; }}
        .field {{ background: #f7fafc; padding: 15px; margin: 10px 0; border-left: 4px solid #3182ce; }}
    </style>
</head>
<body>
    <h1>布迪厄场域分析报告</h1>
    <p><strong>生成时间:</strong> {comprehensive['metadata']['generated_at']}</p>
    <p><strong>分析方法:</strong> LLM实时分析</p>
    
    <h2>识别场域 ({len(fields)}个)</h2>
    {''.join([f'<div class=\"field\"><strong>{f["name"]}</strong>：{", ".join(f["core_actors"])}</div>' for f in fields])}
    
    <footer><p>由 stigmergy qwen 实时分析生成</p></footer>
</body>
</html>"""
    
    output_html = workflow_dir / "output" / "reports" / "field_analysis_report.html"
    output_html.parent.mkdir(parents=True, exist_ok=True)
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ 报告生成完成")
    print(f"   HTML: {output_html}")
    print(f"   JSON: {output_json}")
    
    return output_html


# =============================================================================
# 主函数
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="布迪厄场域分析工作流")
    # 计算项目根目录下的 test_data/xiyouji_analysis 路径
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    input_path = project_root / "test_data" / "xiyouji_analysis"
    parser.add_argument("--input", default=str(input_path),
                        help="输入数据目录")
    parser.add_argument("--step", type=str, default="all", 
                        help="执行步骤: 1, 2, 3, 4, 5, 6, all")
    
    args = parser.parse_args()
    
    SKILL_DIR = Path(__file__).parent.parent
    WORKFLOW_DIR = SKILL_DIR / "field_analysis_workflow"
    
    input_path = Path(args.input)
    
    print("=" * 60)
    print("  布迪厄场域分析工作流")
    print(f"  输入: {input_path}")
    print(f"  步骤: {args.step}")
    print("=" * 60)
    
    # 执行步骤
    if args.step in ["1", "all"]:
        combined_input = step_1_prepare_data(input_path, WORKFLOW_DIR)
    else:
        combined_input = WORKFLOW_DIR / "input" / "processed" / "combined_input.json"
    
    if args.step in ["2", "all"]:
        step_2_boundary_analysis(combined_input, WORKFLOW_DIR)
    
    if args.step in ["3", "all"]:
        step_3_capital_analysis(combined_input, WORKFLOW_DIR)
    
    if args.step in ["4", "all"]:
        step_4_habitus_analysis(combined_input, WORKFLOW_DIR)
    
    if args.step in ["5", "all"]:
        step_5_dynamics_analysis(combined_input, WORKFLOW_DIR)
    
    if args.step in ["6", "all"]:
        step_6_generate_report(WORKFLOW_DIR)
    
    print("\n" + "=" * 60)
    print("  ✅ 工作流完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()