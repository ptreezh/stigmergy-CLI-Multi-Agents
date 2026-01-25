# Qwen CLI CLI Documentation

## Overview
This document contains configuration and usage information for the Qwen CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: qwen
- **Tool Name**: Qwen CLI
- **Installation Command**: `npm install -g @qwen-code/qwen-code`
- **Version Check**: `qwen --version`

## Usage Patterns
The Qwen CLI CLI can be invoked in several ways:
1. Direct execution: `qwen [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call Qwen CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy qwen "[task description]"

# Examples:
stigmergy qwen "分析这段代码"
stigmergy qwen "翻译这段文字"
stigmergy qwen "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.qwen\hooks`

## Last Updated
2025-12-14T10:20:50.710Z

---
*This file is automatically managed by Stigmergy CLI*


<!-- SKILLS_START -->
<skills_system priority="1">

## Stigmergy Skills

<usage>
Load skills using Stigmergy skill manager:

Direct call (current CLI):
  Bash("stigmergy skill read <skill-name>")

Cross-CLI call (specify CLI):
  Bash("stigmergy use <cli-name> skill <skill-name>")

Smart routing (auto-select best CLI):
  Bash("stigmergy call skill <skill-name>")

The skill content will load with detailed instructions.
Base directory will be provided for resolving bundled resources.
</usage>

<available_skills>

<skill>
<name>ant</name>
<description>当用户需要执行行动者网络理论分析，包括参与者识别、关系网络构建、转译过程追踪和网络动态分析时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>business-ecosystem-analysis</name>
<description>商业生态系统分析技能，整合多个子技能进行全面的商业生态系统分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>conflict-resolution</name>
<description>当用户需要解决学术研究中的理论、方法论、解释、价值观等分歧，提供建设性对话和共识建立策略时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>digital-transformation</name>
<description>数字化转型分析技能，整合多个子技能进行全面的数字化转型分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>ecosystem-analysis</name>
<description>生态系统分析技能，整合多个子技能进行全面的生态系统分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>field-analysis</name>
<description>执行布迪厄场域分析，包括场域边界识别、资本分布分析、自主性评估和习性模式分析。当需要分析社会场域的结构、权力关系和文化资本时使用此技能。</description>
<location>stigmergy</location>
</skill>

<skill>
<name>field-expert</name>
<description>布迪厄场域理论专家分析技能，整合场域边界识别、资本分析、习性分析和场域动力学分析功能，基于渐进式信息披露原则支持宿主agent动态加载提示词模板。</description>
<location>stigmergy</location>
</skill>

<skill>
<name>grounded-theory-expert</name>
<description>扎根理论专家分析技能，整合开放编码、轴心编码、选择式编码、备忘录撰写和理论饱和度检验功能，提供完整的扎根理论分析框架</description>
<location>stigmergy</location>
</skill>

<skill>
<name>mathematical-statistics</name>
<description>当用户需要执行社会科学研究的数理统计分析，包括描述性统计、推断统计、回归分析、方差分析、因子分析等时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>network-computation</name>
<description>社会网络计算分析工具，提供网络构建、中心性测量、社区检测、网络可视化等完整的网络分析支持</description>
<location>stigmergy</location>
</skill>

<skill>
<name>test-skill</name>
<description>A simple test skill for verifying the skills system</description>
<location>stigmergy</location>
</skill>

<skill>
<name>validity-reliability</name>
<description>当用户需要执行研究信度效度分析，包括内部一致性、重测信度、评分者信度、构念效度、内容效度、效标效度等全面分析时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>resumesession</name>
<description>Cross-CLI session recovery and history management skill</description>
<location>claude</location>
</skill>

<skill>
<name>dev-browser</name>
<description>Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include &quot;go to [url]&quot;, &quot;click on&quot;, &quot;fill out the form&quot;, &quot;take a screenshot&quot;, &quot;scrape&quot;, &quot;automate&quot;, &quot;test the website&quot;, &quot;log into&quot;, or any browser interaction request.</description>
<location>claude</location>
</skill>


<skill>
<name>alienation-analysis</name>
<description>Test skill from local deployment test</description>
<location>stigmergy</location>
</skill>
<skill>
<name>brainstorming</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>dispatching-parallel-agents</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>executing-plans</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>finishing-a-development-branch</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>grounded-theory</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>planning-with-files</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>pptx</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>receiving-code-review</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>requesting-code-review</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>subagent-driven-development</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>systematic-debugging</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>test-driven-development</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>using-git-worktrees</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>using-superpowers</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>verification-before-completion</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>writing-plans</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>
<skill>
<name>writing-skills</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill></available_skills>

</skills_system>
<!-- SKILLS_END -->
