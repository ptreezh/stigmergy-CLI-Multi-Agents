# 场域分析工作流 - 输入输出规范

## 目录结构

```
field_analysis/
├── input/                    # 输入数据目录
│   ├── raw/                 # 原始数据（需要手动放置）
│   │   ├── grounded_theory_data.json     # 扎根理论数据
│   │   ├── social_network_data.json      # 社会网络数据
│   │   └── esoc_framework_data.json      # ESOC-R理论框架
│   └── processed/           # 预处理后的输入
│       └── combined_input.json            # 合并的输入数据
│
├── intermediate/            # 中间结果目录
│   ├── 01_boundary/         # 步骤2输出
│   │   └── boundary_results.json
│   ├── 02_capital/          # 步骤3输出
│   │   └── capital_results.json
│   ├── 03_habitus/          # 步骤4输出
│   │   └── habitus_results.json
│   └── 04_dynamics/         # 步骤5输出
│       └── dynamics_results.json
│
├── output/                  # 最终输出目录
│   ├── reports/             # HTML报告
│   │   └── field_analysis_report.html
│   ├── json/                # JSON输出
│   │   └── comprehensive_analysis.json
│   └── executive_summary.txt
│
└── logs/                    # 执行日志
    └── execution.log
```

## 数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│  步骤1: 数据准备                                                 │
├─────────────────────────────────────────────────────────────────┤
│  输入:                                                          │
│    input/raw/grounded_theory_data.json                          │
│    input/raw/social_network_data.json                           │
│    input/raw/esoc_framework_data.json                           │
│                                                                  │
│  处理: 合并三个数据源                                            │
│                                                                  │
│  输出:                                                          │
│    input/processed/combined_input.json                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤2: 边界分析                                                 │
├─────────────────────────────────────────────────────────────────┤
│  输入:                                                          │
│    input/processed/combined_input.json                          │
│                                                                  │
│  处理: field_boundary_identification()                          │
│        analyze_boundary_dynamics()                              │
│                                                                  │
│  输出:                                                          │
│    intermediate/01_boundary/boundary_results.json               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤3: 资本分析                                                 │
├─────────────────────────────────────────────────────────────────┤
│  输入:                                                          │
│    input/processed/combined_input.json                          │
│                                                                  │
│  处理: field_capital_analysis()                                 │
│                                                                  │
│  输出:                                                          │
│    intermediate/02_capital/capital_results.json                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤4: 习性分析                                                 │
├─────────────────────────────────────────────────────────────────┤
│  输入:                                                          │
│    input/processed/combined_input.json                          │
│                                                                  │
│  处理: field_habitus_analysis()                                 │
│        analyze_symbolic_violence()                              │
│        analyze_cross_field_analysis()                           │
│                                                                  │
│  输出:                                                          │
│    intermediate/03_habitus/habitus_results.json                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤5: 动力学分析                                               │
├─────────────────────────────────────────────────────────────────┤
│  输入:                                                          │
│    intermediate/01_boundary/boundary_results.json               │
│    intermediate/02_capital/capital_results.json                 │
│    intermediate/03_habitus/habitus_results.json                 │
│                                                                  │
│  处理: 综合分析场域自主性、竞争格局、演化阶段                      │
│                                                                  │
│  输出:                                                          │
│    intermediate/04_dynamics/dynamics_results.json                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤6: 生成报告                                                 │
├─────────────────────────────────────────────────────────────────┤
│  输入:                                                          │
│    intermediate/*/results.json (所有中间结果)                    │
│                                                                  │
│  处理: 整合所有分析结果，生成HTML报告                             │
│                                                                  │
│  输出:                                                          │
│    output/reports/field_analysis_report.html                    │
│    output/json/comprehensive_analysis.json                      │
│    output/executive_summary.txt                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 文件格式规范

### 输入文件格式

```json
// grounded_theory_data.json
{
  "propositions": [...],
  "nodes": [...],
  "relationships": [...]
}

// social_network_data.json
{
  "nodes": [
    {"id": "观音菩萨", "betweenness": 0.35, "degree": 45},
    {"id": "如来佛祖", "betweenness": 0.28, "degree": 38}
  ],
  "edges": [...],
  "stages": [...]
}
```

### 中间结果格式

```json
// boundary_results.json
{
  "step": 2,
  "name": "场域边界分析",
  "results": {
    "fields": ["天庭道教", "灵山佛教", "人间皇权", "妖怪场域"],
    "boundaries": [...],
    "gatekeepers": [...]
  }
}

// capital_results.json
{
  "step": 3,
  "name": "资本分布分析",
  "results": {
    "capital_types": ["经济资本", "社会资本", "文化资本", "符号资本"],
    "distribution": {...},
    "conversion_paths": [...]
  }
}
```

## 使用方法

```python
from skills.field_expert.scripts.field_analysis_tool import FieldAnalysisTool, WorkflowConfig

# 初始化配置（自动创建目录）
config = WorkflowConfig(project_root="test_data/xiyouji_analysis")

# 创建工具实例
tool = FieldAnalysisTool(config)

# 方法1: 运行完整工作流
results = tool.run_full_workflow()

# 方法2: 分步骤执行
tool.prepare_data()          # 步骤1: 数据准备
tool.run_boundary_analysis() # 步骤2: 边界分析
tool.run_capital_analysis()  # 步骤3: 资本分析
tool.run_habitus_analysis()  # 步骤4: 习性分析
tool.run_dynamics_analysis() # 步骤5: 动力学分析
tool.generate_report()       # 步骤6: 生成报告

# 检查工作流状态
status = tool.get_workflow_status()
# 返回: {"data_prepared": True, "boundary_complete": True, ...}
```
