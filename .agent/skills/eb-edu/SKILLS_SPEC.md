# 电商 AI 实训平台 - Skills 规范

**版本**: v3.0 (Skills 定义规范)  
**创建日期**: 2026-03-30  
**目标**: 让所有 AI CLI (qwen/opencode/kilocode/codebuddy 等) 能够调用

---

## 一、架构说明

### 1.1 正确架构

```
┌─────────────────────────────────────────────────────────────────┐
│  AI CLI (qwen/opencode/kilocode/codebuddy/...)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  AI CLI 自己实现                                        │   │
│  │  - LLM 理解用户意图                                      │   │
│  │  - 参数提取                                             │   │
│  │  - 错误处理                                             │   │
│  │  - 用户交互                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────────┘
                    │ 调用 Skill
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stigmergy Skills (我们提供)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  skill.json (元数据)                                     │   │
│  │  - 名称                                                  │   │
│  │  - 描述                                                  │   │
│  │  - 触发词                                                │   │
│  │  - 参数 Schema                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  skill.py (执行脚本)                                     │   │
│  │  - 调用 stigmergy eb-edu CLI                            │   │
│  │  - 返回结果                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────────┘
                    │ 执行 CLI
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  stigmergy eb-edu CLI (我们提供)                                 │
│  - stigmergy eb-edu project create ...                         │
│  - stigmergy eb-edu medusa product create ...                  │
└───────────────────┬─────────────────────────────────────────────┘
                    │ 调用 API
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  medusa-backend API                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 责任分工

| 组件 | 负责方 | 职责 |
|------|--------|------|
| **AI CLI** | qwen/opencode/kilocode 等 | LLM 理解、参数提取、错误处理、用户交互 |
| **Skills** | 我们（电商 AI 实训平台） | Skill 定义、CLI 调用 |
| **CLI 命令** | 我们 | 封装 API 调用 |
| **API** | 我们 | 业务逻辑 |

---

## 二、Skill 定义规范

### 2.1 skill.json 结构

```json
{
  "name": "eb-edu-create-project",
  "version": "1.0.0",
  "description": "创建实训项目 - 教师可以通过自然语言布置实训任务",
  "author": "电商 AI 实训平台",
  "category": "education",
  "tags": ["电商", "实训", "教学", "项目创建"],
  
  "triggers": {
    "keywords": [
      "创建实训",
      "布置任务",
      "创建项目",
      "发布作业",
      "安排实训"
    ],
    "patterns": [
      "帮我创建一个.*实训",
      "我要布置.*任务",
      "给学生安排.*项目"
    ]
  },
  
  "parameters": {
    "type": "object",
    "required": ["title", "deadline"],
    "properties": {
      "title": {
        "type": "string",
        "description": "实训项目标题",
        "example": "商品上架实训"
      },
      "deadline": {
        "type": "string",
        "description": "截止时间",
        "format": "date-time",
        "example": "2026-04-10 23:59"
      },
      "class_id": {
        "type": "string",
        "description": "班级 ID",
        "default": "auto"
      },
      "type": {
        "type": "string",
        "enum": ["individual", "group"],
        "default": "individual"
      },
      "description": {
        "type": "string",
        "description": "项目描述"
      },
      "requirements": {
        "type": "string",
        "description": "项目要求"
      },
      "max_score": {
        "type": "integer",
        "default": 100
      }
    }
  },
  
  "execution": {
    "command": "stigmergy eb-edu project create",
    "timeout": 60,
    "retry": 2
  },
  
  "permissions": {
    "roles": ["ADMIN", "SCHOOL_ADMIN", "TEACHER"],
    "requires_auth": true
  },
  
  "examples": [
    {
      "input": "帮我创建一个商品上架实训，4 月 10 日截止",
      "parameters": {
        "title": "商品上架实训",
        "deadline": "2026-04-10 23:59"
      }
    }
  ]
}
```

### 2.2 skill.py 模板

```python
#!/usr/bin/env python3
"""
电商 AI 实训平台 Skill - 创建实训项目

调用方式:
    stigmergy skill call eb-edu-create-project \\
        --title "商品上架实训" \\
        --deadline "2026-04-10 23:59"
"""

import json
import sys
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", type=str, required=True)
    parser.add_argument("--deadline", type=str, required=True)
    parser.add_argument("--class-id", type=str, default="auto")
    parser.add_argument("--type", type=str, default="individual")
    parser.add_argument("--description", type=str, default="")
    parser.add_argument("--requirements", type=str, default="")
    parser.add_argument("--max-score", type=int, default=100)
    parser.add_argument("--token", type=str, required=False)
    
    args = parser.parse_args()
    
    # 构建 CLI 命令
    cmd = f"stigmergy eb-edu project create --title \"{args.title}\" --deadline \"{args.deadline}\""
    if args.class_id:
        cmd += f" --class-id \"{args.class_id}\""
    if args.type:
        cmd += f" --type \"{args.type}\""
    if args.description:
        cmd += f" --description \"{args.description}\""
    if args.requirements:
        cmd += f" --requirements \"{args.requirements}\""
    if args.max_score:
        cmd += f" --max-score {args.max_score}"
    
    # 执行 CLI
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    # 输出结果
    if result.returncode == 0:
        print(result.stdout)
        return 0
    else:
        print(f"Error: {result.stderr}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

---

## 三、AI CLI 集成指南

### 3.1 Qwen CLI 集成

```json
// C:\Users\Zhang/.qwen/extensions/eb-edu-skills/package.json
{
  "name": "eb-edu-skills",
  "version": "1.0.0",
  "description": "电商 AI 实训平台 Skills",
  "skills_directory": "C:\Users\Zhang/.stigmergy/skills/eb-edu",
  "auth": {
    "type": "stigmergy",
    "token_file": "C:\Users\Zhang/.stigmergy/auth/tokens.json"
  }
}
```

### 3.2 OpenCode 集成

```yaml
# C:\Users\Zhang/.opencode/skills/eb-edu.yaml
name: eb-edu-skills
description: 电商 AI 实训平台技能
skills_path: C:\Users\Zhang/.stigmergy/skills/eb-edu
auth:
  provider: stigmergy
  token_file: C:\Users\Zhang/.stigmergy/auth/tokens.json
```

### 3.3 Kilocode 集成

```json
// C:\Users\Zhang/.kilocode/config/skills.json
{
  "eb-edu": {
    "path": "C:\Users\Zhang/.stigmergy/skills/eb-edu",
    "auth": "stigmergy"
  }
}
```

### 3.4 Claude CLI 集成

```yaml
# C:\Users\Zhang/.claude/skills/eb-edu.yaml
name: eb-edu-skills
description: 电商 AI 实训平台技能
skills:
  - name: create-project
    triggers: [创建实训，布置任务]
    command: stigmergy skill call eb-edu-create-project
```

---

## 四、使用示例

### 4.1 在 Qwen 中使用

```bash
# 启动 Qwen
qwen

# 自然语言调用
> 帮我创建一个商品上架实训，4 月 10 日截止

# Qwen 自动:
# 1. LLM 理解决策
# 2. 匹配 Skill: eb-edu-create-project
# 3. 提取参数
# 4. 调用 Skill
# 5. 返回结果
```

### 4.2 在 OpenCode 中使用

```bash
# 启动 OpenCode
opencode

# 自然语言调用
> 我要给学生布置一个店铺装修的实训任务
```

### 4.3 在 Kilocode 中使用

```bash
# 启动 Kilocode
kilocode

# 自然语言调用
> 帮我创建一个商品上架实训
```

---

## 五、Skills 列表

### 5.1 教师 Skills

| Skill | 功能 | 触发词 |
|-------|------|--------|
| `eb-edu-create-project` | 创建实训 | "创建实训"、"布置任务" |
| `eb-edu-grade-project` | 批改实训 | "批改作业"、"评分" |
| `eb-edu-create-class` | 创建班级 | "创建班级" |
| `eb-edu-send-notification` | 发送通知 | "通知学生" |

### 5.2 学生 Skills

| Skill | 功能 | 触发词 |
|-------|------|--------|
| `eb-edu-join-class` | 加入班级 | "加入班级" |
| `eb-edu-submit-project` | 提交实训 | "提交作业" |
| `eb-edu-medusa-create-product` | 创建商品 | "上架商品" |
| `eb-edu-view-grades` | 查看成绩 | "我的成绩" |

---

## 六、部署指南

### 6.1 安装 Skills

```bash
# 复制 Skills
cp -r F:\aa\stigmergy-eb-edu\skills\eb-edu \
    C:\Users\Zhang/.stigmergy/skills/

# 安装依赖
pip install -r C:\Users\Zhang/.stigmergy/skills/eb-edu/requirements.txt
```

### 6.2 认证

```bash
# 一次性认证
stigmergy auth login \
    --username "wanglaoshi" \
    --password "******" \
    --school-id "school_001"

# Token 自动存储，所有 AI CLI 共享
```

### 6.3 验证

```bash
# 列出所有 Skills
stigmergy skill list | grep eb-edu

# 测试 Skill
stigmergy skill test eb-edu-create-project \
    --title "测试实训" \
    --deadline "2026-12-31"
```

---

**文档版本**: v3.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台
