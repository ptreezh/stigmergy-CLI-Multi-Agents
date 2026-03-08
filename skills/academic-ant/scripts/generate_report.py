#!/usr/bin/env python3
"""
ANT Analysis Report Generator
学术型ANT分析报告生成器

该脚本整合所有中间分析结果，生成综合分析报告。
"""

import json
import os
from datetime import datetime
from pathlib import Path

def load_json(filepath):
    """加载JSON文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {filepath} not found")
        return None
    except json.JSONDecodeError:
        print(f"Warning: {filepath} is not valid JSON")
        return None

def generate_executive_summary(data):
    """生成执行摘要"""
    summary = """# ANT分析执行摘要

## 分析概览
- 分析时间: {timestamp}
- 分析师人格: 学术型ANT研究员

## 核心发现

### 行动者网络
- 人类行动者数量: {human_actors}
- 非人类行动者数量: {non_human_actors}
- 网络连接数量: {connections}

### 转译过程
- 问题化状态: {problematisation}
- 利益化状态: {interessement}
- 征召状态: {enrolment}
- 动员状态: {mobilisation}

### 网络稳定性
- 稳定性评分: {stability_score}

### 本土化洞察
{localization_insights}

## 理论贡献
{theoretical_contributions}

---
*本报告由学术型ANT分析技能自动生成*
"""
    return summary.format(
        timestamp=datetime.now().isoformat(),
        human_actors=data.get('human_actors_count', 'N/A'),
        non_human_actors=data.get('non_human_actors_count', 'N/A'),
        connections=data.get('connections_count', 'N/A'),
        problematisation=data.get('problematisation_status', 'N/A'),
        interessement=data.get('interessement_status', 'N/A'),
        enrolment=data.get('enrolment_status', 'N/A'),
        mobilisation=data.get('mobilisation_status', 'N/A'),
        stability_score=data.get('stability_score', 'N/A'),
        localization_insights=data.get('localization_insights', '待分析'),
        theoretical_contributions=data.get('theoretical_contributions', '待分析')
    )

def generate_full_report(actor_data, network_data, translation_data,
                         material_data, dynamics_data, localization_data):
    """生成完整分析报告"""

    report = f"""# 行动者网络理论分析报告

## 元信息
- 生成时间: {datetime.now().isoformat()}
- 分析框架: Actor-Network Theory (ANT)
- 分析师角色: 学术型ANT研究员
- 人格特质: 严谨、批判、深入、创新

---

## 一、行动者映射分析

{format_actors(actor_data)}

---

## 二、网络结构分析

{format_network(network_data)}

---

## 三、转译过程追踪

{format_translation(translation_data)}

---

## 四、物质-符号分析

{format_material(material_data)}

---

## 五、网络动态评估

{format_dynamics(dynamics_data)}

---

## 六、本土化分析

{format_localization(localization_data)}

---

## 七、综合讨论

### 7.1 主要发现

[基于以上分析的综合讨论]

### 7.2 理论贡献

[对ANT理论的潜在贡献]

### 7.3 研究局限

[分析过程中的局限]

### 7.4 后续建议

[未来研究建议]

---

## 参考文献

1. Callon, M. (1986). Some Elements of a Sociology of Translation.
2. Latour, B. (1987). Science in Action.
3. Latour, B. (2005). Reassembling the Social.
4. Law, J. (1992). Notes on the Theory of the Actor-Network.

---

*本报告遵循学术规范，所有分析均有证据支撑*
"""

    return report

def format_actors(data):
    """格式化行动者分析"""
    if not data:
        return "*行动者分析数据待补充*"

    # 简化格式化，实际应处理完整数据结构
    return f"""
### 人类行动者
- 已识别 {len(data.get('human_actors', []))} 个核心人类行动者

### 非人类行动者
- 已识别 {len(data.get('non_human_actors', []))} 个非人类行动者

### 初始网络配置
- 网络拓扑: {data.get('initial_network', {}).get('topology_description', '待分析')}
"""

def format_network(data):
    """格式化网络分析"""
    if not data:
        return "*网络分析数据待补充*"
    return f"""
### 网络结构
- 核心节点数量: {len(data.get('network_structure', {}).get('core_nodes', []))}
- 边缘节点数量: {len(data.get('network_structure', {}).get('peripheral_nodes', []))}
- 网络密度: {data.get('network_structure', {}).get('density_score', 'N/A')}
"""

def format_translation(data):
    """格式化转译分析"""
    if not data:
        return "*转译分析数据待补充*"
    return f"""
### 四个关键时刻
1. 问题化: {data.get('problematisation', {}).get('opp', '待分析')}
2. 利益化: {len(data.get('interessement', {}).get('devices_used', []))} 个装置使用
3. 征召: {len(data.get('enrolment', {}).get('agreements', []))} 个协议达成
4. 动员: {len(data.get('mobilisation', {}).get('spokespersons', []))} 个代言者识别

### 转译评估
- 成功程度: {data.get('translation_assessment', {}).get('success_level', '待评估')}
"""

def format_material(data):
    """格式化物质符号分析"""
    if not data:
        return "*物质符号分析数据待补充*"
    return f"""
### 非人类能动性
- 技术脚本: {len(data.get('non_human_agency', {}).get('technology_scripts', []))} 个识别
- 意义承载者: {len(data.get('non_human_agency', {}).get('meaning_bearers', []))} 个识别

### 表演性分析
- 秩序生产机制: {len(data.get('performativity', {}).get('order_production', []))} 个识别
"""

def format_dynamics(data):
    """格式化动态分析"""
    if not data:
        return "*动态分析数据待补充*"
    return f"""
### 网络稳定性
- 黑箱化程度: {data.get('stability_analysis', {}).get('blackboxing_level', '待分析')}
- 脆弱点数量: {len(data.get('stability_analysis', {}).get('vulnerability_points', []))}

### 权力关系
- 权力来源: {len(data.get('power_relations', {}).get('power_sources', []))} 个识别
"""

def format_localization(data):
    """格式化本土化分析"""
    if not data:
        return "*本土化分析数据待补充*"
    return f"""
### 中国语境特征
{chr(10).join(['- ' + f for f in data.get('chinese_context', {}).get('institutional_factors', [])])}

### 理论贡献
{chr(10).join(['- ' + c for c in data.get('theoretical_contributions', {}).get('new_dimensions', [])])}
"""

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='Generate ANT Analysis Report')
    parser.add_argument('--actors', required=True, help='Actor mapping JSON')
    parser.add_argument('--network', required=True, help='Network analysis JSON')
    parser.add_argument('--translation', required=True, help='Translation results JSON')
    parser.add_argument('--material', required=True, help='Material-semiotic JSON')
    parser.add_argument('--dynamics', required=True, help='Dynamics results JSON')
    parser.add_argument('--localization', required=True, help='Localization results JSON')
    parser.add_argument('--output', required=True, help='Output directory')

    args = parser.parse_args()

    # 加载数据
    actor_data = load_json(args.actors)
    network_data = load_json(args.network)
    translation_data = load_json(args.translation)
    material_data = load_json(args.material)
    dynamics_data = load_json(args.dynamics)
    localization_data = load_json(args.localization)

    # 创建输出目录
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 生成报告
    report = generate_full_report(
        actor_data, network_data, translation_data,
        material_data, dynamics_data, localization_data
    )

    # 写入文件
    report_path = output_dir / 'reports' / 'ant_analysis_report.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    # 生成综合JSON
    comprehensive = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'analyst_type': 'Academic ANT Analyst',
            'personality_traits': ['严谨', '批判', '深入', '创新']
        },
        'actors': actor_data,
        'network': network_data,
        'translation': translation_data,
        'material_semiotic': material_data,
        'dynamics': dynamics_data,
        'localization': localization_data
    }

    json_path = output_dir / 'json' / 'comprehensive_analysis.json'
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(comprehensive, f, ensure_ascii=False, indent=2)

    # 生成执行摘要
    summary_data = {
        'human_actors_count': len(actor_data.get('human_actors', [])) if actor_data else 0,
        'non_human_actors_count': len(actor_data.get('non_human_actors', [])) if actor_data else 0,
        'connections_count': len(network_data.get('relationships', [])) if network_data else 0,
        'stability_score': dynamics_data.get('stability_analysis', {}).get('blackboxing_level', 'N/A') if dynamics_data else 'N/A'
    }
    summary = generate_executive_summary(summary_data)

    summary_path = output_dir / 'executive_summary.txt'
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write(summary)

    print(f"Report generated: {report_path}")
    print(f"JSON saved: {json_path}")
    print(f"Summary saved: {summary_path}")

if __name__ == '__main__':
    main()
