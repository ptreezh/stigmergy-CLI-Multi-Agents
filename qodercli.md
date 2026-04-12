# QODERCLI Configuration

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
<name>test-skill</name>
<description></description>
<location>global</location>
</skill>

<skill>
<name>advanced-test-skill</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists&apos; work to avoid copyright violations.</description>
<location>universal</location>
</skill>

<skill>
<name>ant</name>
<description>当用户需要执行行动者网络理论分析，包括参与者识别、关系网络构建、转译过程追踪和网络动态分析时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>auto-memory</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>auto-task-skill</name>
<description>从 2 个经验教训中提取，实现 添加自动测试, 优化错误处理</description>
<location>universal</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic&apos;s official brand colors and typography to any sort of artifact that may benefit from having Anthropic&apos;s look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>universal</location>
</skill>

<skill>
<name>business-ecosystem-analysis</name>
<description>商业生态系统分析技能，整合多个子技能进行全面的商业生态系统分析</description>
<location>universal</location>
</skill>

<skill>
<name>business-workflow</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists&apos; work to avoid copyright violations.</description>
<location>universal</location>
</skill>

<skill>
<name>conflict-resolution</name>
<description>当用户需要解决学术研究中的理论、方法论、解释、价值观等分歧，提供建设性对话和共识建立策略时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>digital-transformation</name>
<description>数字化转型分析技能，整合多个子技能进行全面的数字化转型分析</description>
<location>universal</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.</description>
<location>universal</location>
</skill>

<skill>
<name>docx</name>
<description>Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks</description>
<location>universal</location>
</skill>

<skill>
<name>ecosystem-analysis</name>
<description>生态系统分析技能，整合多个子技能进行全面的生态系统分析</description>
<location>universal</location>
</skill>

<skill>
<name>executing-plans</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>universal</location>
</skill>

<skill>
<name>field-analysis</name>
<description>执行布迪厄场域分析，包括场域边界识别、资本分布分析、自主性评估和习性模式分析。当需要分析社会场域的结构、权力关系和文化资本时使用此技能。</description>
<location>universal</location>
</skill>

<skill>
<name>field-expert</name>
<description>布迪厄场域理论专家分析技能，整合场域边界识别、资本分析、习性分析和场域动力学分析功能，基于渐进式信息披露原则支持宿主agent动态加载提示词模板。</description>
<location>universal</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>universal</location>
</skill>

<skill>
<name>grounded-theory-expert</name>
<description>扎根理论专家分析技能，整合开放编码、轴心编码、选择式编码、备忘录撰写和理论饱和度检验功能，提供完整的扎根理论分析框架</description>
<location>universal</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>universal</location>
</skill>

<skill>
<name>mathematical-statistics</name>
<description>当用户需要执行社会科学研究的数理统计分析，包括描述性统计、推断统计、回归分析、方差分析、因子分析等时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>universal</location>
</skill>

<skill>
<name>network-computation</name>
<description>社会网络计算分析工具，提供网络构建、中心性测量、社区检测、网络可视化等完整的网络分析支持</description>
<location>universal</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>universal</location>
</skill>

<skill>
<name>planning-with-files</name>
<description>Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring &gt;5 tool calls.</description>
<location>universal</location>
</skill>

<skill>
<name>pptx</name>
<description>Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks</description>
<location>universal</location>
</skill>

<skill>
<name>resumesession</name>
<description>Cross-CLI session recovery and history management skill</description>
<location>universal</location>
</skill>

<skill>
<name>search-skill</name>
<description>Search and recommend Claude Code skills from trusted marketplaces</description>
<location>universal</location>
</skill>

<skill>
<name>simple-crud</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude&apos;s capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>universal</location>
</skill>

<skill>
<name>skill-from-github</name>
<description>Create skills by learning from high-quality GitHub projects</description>
<location>universal</location>
</skill>

<skill>
<name>skill-from-masters</name>
<description>Help users create high-quality skills by discovering and incorporating proven methodologies from domain experts. Use this skill BEFORE skill-creator when users want to create a new skill - it enhances skill-creator by first identifying expert frameworks and best practices to incorporate. Triggers on requests like &quot;help me create a skill for X&quot; or &quot;I want to make a skill that does Y&quot;. This skill guides methodology selection, then hands off to skill-creator for the actual skill generation.</description>
<location>universal</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like &quot;make me a GIF of X doing Y for Slack.&quot;</description>
<location>universal</location>
</skill>

<skill>
<name>strict-test-skill</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>universal</location>
</skill>

<skill>
<name>system-engineering-task-decomposition</name>
<description>基于复杂任务分解和系统工程思维的技能，能够有效把复杂任务分解，并按照系统工程的思维管理多层次分解的子任务和系统集成。能够有效监控任务执行过程中的token消耗，确保任务分解后的复杂程度能够在128k上下文完成。</description>
<location>universal</location>
</skill>

<skill>
<name>systematic-debugging</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>universal</location>
</skill>

<skill>
<name>test-crud-skill</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>test-driven-development</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>universal</location>
</skill>

<skill>
<name>test-skill-direct</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>universal</location>
</skill>

<skill>
<name>user-management</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>using-git-worktrees</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>universal</location>
</skill>

<skill>
<name>validity-reliability</name>
<description>当用户需要执行研究信度效度分析，包括内部一致性、重测信度、评分者信度、构念效度、内容效度、效标效度等全面分析时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>universal</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>universal</location>
</skill>

<skill>
<name>writing-plans</name>
<description>Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring &gt;5 tool calls.</description>
<location>universal</location>
</skill>

<skill>
<name>xlsx</name>
<description>Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas</description>
<location>universal</location>
</skill>

<skill>
<name>affiliate-management</name>
<description>联盟营销体系搭建技能，提供联盟平台选择、佣金设置、联盟招募和效果监控的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>automated-operations</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>brainstorming</name>
<description>You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.</description>
<location>universal</location>
</skill>

<skill>
<name>brand-positioning</name>
<description>跨境品牌定位与本土化技能，提供市场分析、品牌定位、视觉设计和传播策略的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>cognitive-trap-expert</name>
<description>专业的认知陷阱平台开发专家技能，提供针对认知偏差教育平台的开发、调试和优化指导。该技能涵盖指数增长误区、复利思维陷阱、历史决策重现等核心场景的专业知识。</description>
<location>universal</location>
</skill>

<skill>
<name>competitor-intel</name>
<description>竞品情报监控技能，提供竞品识别、数据收集、分析和预警的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>compliance-management</name>
<description>Cross-border e-commerce compliance monitoring, risk assessment, and regulatory adherence management</description>
<location>universal</location>
</skill>

<skill>
<name>content-marketing</name>
<description>本地化内容营销技能，提供内容规划、创作、发布和效果分析的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>crisis-management</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>cross-border-cs</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>data-analytics</name>
<description>跨境数据智能分析技能，提供数据收集、清洗、分析和洞察发现的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>dispatching-parallel-agents</name>
<description>Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies</description>
<location>universal</location>
</skill>

<skill>
<name>evolved-general</name>
<description>Auto-evolved skill for general</description>
<location>universal</location>
</skill>

<skill>
<name>finishing-a-development-branch</name>
<description>Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup</description>
<location>universal</location>
</skill>

<skill>
<name>fraud-detection</name>
<description>跨境欺诈检测与防控技能，提供风险识别、模型构建、实时检测和处置追踪的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>fx-hedging</name>
<description>外汇风险对冲管理技能，帮助跨境电商企业识别、评估和管理汇率波动风险，制定科学的对冲策略</description>
<location>universal</location>
</skill>

<skill>
<name>geo-optimization</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>influencer-marketing</name>
<description>海外红人营销与KOL合作技能，提供红人筛选、合作洽谈、内容创作和效果追踪的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>inventory-management</name>
<description>跨境库存智能管理技能，提供需求预测、库存规划、补货管理和库存监控的完整解决方案</description>
<location>universal</location>
</skill>

<skill>
<name>ip-protection</name>
<description>Intellectual property rights protection, trademark registration, and anti-counterfeit strategies for cross-border e-commerce</description>
<location>universal</location>
</skill>

<skill>
<name>listing-seo</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>localization-cs</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>logistics-optimization</name>
<description>国际物流链路优化技能，提供从路线规划、运输方式选择到成本优化的完整解决方案</description>
<location>universal</location>
</skill>

<skill>
<name>mechanism-test-skill</name>
<description>机制测试技能 - 用于精确确定qwen从哪个路径加载skill</description>
<location>universal</location>
</skill>

<skill>
<name>payment-management</name>
<description>Multi-currency payment gateway integration, payment optimization, and payment gateway management for cross-border e-commerce</description>
<location>universal</location>
</skill>

<skill>
<name>ppc-optimization</name>
<description>跨境广告投放优化技能，提供Google Ads、Amazon Ads等平台的广告投放优化方案</description>
<location>universal</location>
</skill>

<skill>
<name>price-optimization</name>
<description>动态定价策略技能，提供市场分析、价格模型、动态定价和效果监控的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>product-selection</name>
<description></description>
<location>universal</location>
</skill>

<skill>
<name>receiving-code-review</name>
<description>Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation</description>
<location>universal</location>
</skill>

<skill>
<name>reconciliation</name>
<description>跨境账务对账与结算技能，提供自动化对账流程，处理多平台、多币种、多渠道的财务数据对账</description>
<location>universal</location>
</skill>

<skill>
<name>requesting-code-review</name>
<description>Use when completing tasks, implementing major features, or before merging to verify work meets requirements</description>
<location>universal</location>
</skill>

<skill>
<name>social-media-ops</name>
<description>海外社交媒体运营技能，提供平台选择、内容策划、社区运营和数据分析的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>subagent-driven-development</name>
<description>Use when executing implementation plans with independent tasks in the current session</description>
<location>universal</location>
</skill>

<skill>
<name>supply-risk-mgmt</name>
<description>供应链风险管理技能，提供风险识别、评估、应对和持续监控的完整方案</description>
<location>universal</location>
</skill>

<skill>
<name>tax-management</name>
<description>Cross-border e-commerce tax planning, optimization, and compliance management across multiple jurisdictions</description>
<location>universal</location>
</skill>

<skill>
<name>test-analyzer</name>
<description>Test data analysis skill for integration testing</description>
<location>universal</location>
</skill>

<skill>
<name>using-superpowers</name>
<description>Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions</description>
<location>universal</location>
</skill>

<skill>
<name>verification-before-completion</name>
<description>Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always</description>
<location>universal</location>
</skill>

<skill>
<name>writing-skills</name>
<description>Use when creating new skills, editing existing skills, or verifying skills work before deployment</description>
<location>universal</location>
</skill>

<skill>
<name>academic-illustration</name>
<description>Generate black-and-white printed illustrations for academic books based on Tufte data-ink ratio principles, Novak concept mapping theory, and causal loop diagrams. Creates diagrams for interdisciplinary theories including core-environment coupling models and three-stage evolution diagrams.</description>
<location>claude</location>
</skill>

<skill>
<name>agent-debugging-error-handling</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>agent-harness-construction</name>
<description>Design and optimize AI agent action spaces, tool definitions, and observation formatting for higher completion rates.</description>
<location>claude</location>
</skill>

<skill>
<name>agent-long-term-memory</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>agent-teams-orchestration</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>agent-tool-creation</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>agentic-engineering</name>
<description>Operate as an agentic engineer using eval-first execution, decomposition, and cost-aware model routing.</description>
<location>claude</location>
</skill>

<skill>
<name>agentic-workflow-patterns</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>ai-code-review-automation</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>ai-first-engineering</name>
<description>Engineering operating model for teams where AI agents generate a large share of implementation output.</description>
<location>claude</location>
</skill>

<skill>
<name>api-design</name>
<description>REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs.</description>
<location>claude</location>
</skill>

<skill>
<name>article-writing</name>
<description>Write articles, guides, blog posts, tutorials, newsletter issues, and other long-form content in a distinctive voice derived from supplied examples or brand guidance. Use when the user wants polished written content longer than a paragraph, especially when voice consistency, structure, and credibility matter.</description>
<location>claude</location>
</skill>

<skill>
<name>autonomous-loops</name>
<description>Patterns and architectures for autonomous Claude Code loops — from simple sequential pipelines to RFC-driven multi-agent DAG systems.</description>
<location>claude</location>
</skill>

<skill>
<name>backend-patterns</name>
<description>Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes.</description>
<location>claude</location>
</skill>

<skill>
<name>bourdieu-field-analysis-expert</name>
<description>布迪厄场域分析专家技能（AI CLI 原生版），支持自动任务队列执行。包含绝对禁止原则、任务分解规则，以及完整的资本/习性/场域动力学分析工具链，确保分析质量和完整性。</description>
<location>claude</location>
</skill>

<skill>
<name>cas-simulation-expert</name>
<description>复杂适应系统仿真专家（Complex Adaptive Systems Simulation Expert）- 基于Agent-Based Modeling (ABM) 方法，支持多主体建模、互动机制设计、涌现分析和仿真实验，包含任务分解、状态持久化和子Agent并行处理</description>
<location>claude</location>
</skill>

<skill>
<name>claude-code-context-management</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>claude-code-hooks-automation</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>claude-code-settings-json</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>claude-md-optimization</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>clickhouse-io</name>
<description>ClickHouse database patterns, query optimization, analytics, and data engineering best practices for high-performance analytical workloads.</description>
<location>claude</location>
</skill>

<skill>
<name>coding-standards</name>
<description>Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node.js development.</description>
<location>claude</location>
</skill>

<skill>
<name>configure-ecc</name>
<description>Interactive installer for Everything Claude Code — guides users through selecting and installing skills and rules to user-level or project-level directories, verifies paths, and optionally optimizes installed files.</description>
<location>claude</location>
</skill>

<skill>
<name>content-engine</name>
<description>Create platform-native content systems for X, LinkedIn, TikTok, YouTube, newsletters, and repurposed multi-platform campaigns. Use when the user wants social posts, threads, scripts, content calendars, or one source asset adapted cleanly across platforms.</description>
<location>claude</location>
</skill>

<skill>
<name>content-hash-cache-pattern</name>
<description>Cache expensive file processing results using SHA-256 content hashes — path-independent, auto-invalidating, with service layer separation.</description>
<location>claude</location>
</skill>

<skill>
<name>continuous-agent-loop</name>
<description>Patterns for continuous autonomous agent loops with quality gates, evals, and recovery controls.</description>
<location>claude</location>
</skill>

<skill>
<name>continuous-learning</name>
<description>Automatically extract reusable patterns from Claude Code sessions and save them as learned skills for future use.</description>
<location>claude</location>
</skill>

<skill>
<name>continuous-learning-v2</name>
<description>Instinct-based learning system that observes sessions via hooks, creates atomic instincts with confidence scoring, and evolves them into skills/commands/agents. v2.1 adds project-scoped instincts to prevent cross-project contamination.</description>
<location>claude</location>
</skill>

<skill>
<name>cost-aware-llm-pipeline</name>
<description>Cost optimization patterns for LLM API usage — model routing by task complexity, budget tracking, retry logic, and prompt caching.</description>
<location>claude</location>
</skill>

<skill>
<name>cpp-coding-standards</name>
<description>C++ coding standards based on the C++ Core Guidelines (isocpp.github.io). Use when writing, reviewing, or refactoring C++ code to enforce modern, safe, and idiomatic practices.</description>
<location>claude</location>
</skill>

<skill>
<name>cpp-testing</name>
<description>Use only when writing/updating/fixing C++ tests, configuring GoogleTest/CTest, diagnosing failing or flaky tests, or adding coverage/sanitizers.</description>
<location>claude</location>
</skill>

<skill>
<name>custom-commands-creation</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>database-migrations</name>
<description>Database migration best practices for schema changes, data migrations, rollbacks, and zero-downtime deployments across PostgreSQL, MySQL, and common ORMs (Prisma, Drizzle, Django, TypeORM, golang-migrate).</description>
<location>claude</location>
</skill>

<skill>
<name>deployment-patterns</name>
<description>Deployment workflows, CI/CD pipeline patterns, Docker containerization, health checks, rollback strategies, and production readiness checklists for web applications.</description>
<location>claude</location>
</skill>

<skill>
<name>dev-browser</name>
<description>Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include &quot;go to [url]&quot;, &quot;click on&quot;, &quot;fill out the form&quot;, &quot;take a screenshot&quot;, &quot;scrape&quot;, &quot;automate&quot;, &quot;test the website&quot;, &quot;log into&quot;, or any browser interaction request.</description>
<location>claude</location>
</skill>

<skill>
<name>django-patterns</name>
<description>Django architecture patterns, REST API design with DRF, ORM best practices, caching, signals, middleware, and production-grade Django apps.</description>
<location>claude</location>
</skill>

<skill>
<name>django-security</name>
<description>Django security best practices, authentication, authorization, CSRF protection, SQL injection prevention, XSS prevention, and secure deployment configurations.</description>
<location>claude</location>
</skill>

<skill>
<name>django-tdd</name>
<description>Django testing strategies with pytest-django, TDD methodology, factory_boy, mocking, coverage, and testing Django REST Framework APIs.</description>
<location>claude</location>
</skill>

<skill>
<name>django-verification</name>
<description>Verification loop for Django projects: migrations, linting, tests with coverage, security scans, and deployment readiness checks before release or PR.</description>
<location>claude</location>
</skill>

<skill>
<name>docker-patterns</name>
<description>Docker and Docker Compose patterns for local development, container security, networking, volume strategies, and multi-service orchestration.</description>
<location>claude</location>
</skill>

<skill>
<name>dual-layer-agent-system</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>e2e-testing</name>
<description>Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.</description>
<location>claude</location>
</skill>

<skill>
<name>enterprise-agent-ops</name>
<description>Operate long-lived agent workloads with observability, security boundaries, and lifecycle management.</description>
<location>claude</location>
</skill>

<skill>
<name>eval-harness</name>
<description>Formal evaluation framework for Claude Code sessions implementing eval-driven development (EDD) principles</description>
<location>claude</location>
</skill>

<skill>
<name>evolution-verification</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>foundation-models-on-device</name>
<description>Apple FoundationModels framework for on-device LLM — text generation, guided generation with @Generable, tool calling, and snapshot streaming in iOS 26+.</description>
<location>claude</location>
</skill>

<skill>
<name>frontend-patterns</name>
<description>Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.</description>
<location>claude</location>
</skill>

<skill>
<name>frontend-slides</name>
<description>Create stunning, animation-rich HTML presentations from scratch or by converting PowerPoint files. Use when the user wants to build a presentation, convert a PPT/PPTX to web, or create slides for a talk/pitch. Helps non-designers discover their aesthetic through visual exploration rather than abstract choices.</description>
<location>claude</location>
</skill>

<skill>
<name>git-worktree-push</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>golang-patterns</name>
<description>Idiomatic Go patterns, best practices, and conventions for building robust, efficient, and maintainable Go applications.</description>
<location>claude</location>
</skill>

<skill>
<name>golang-testing</name>
<description>Go testing patterns including table-driven tests, subtests, benchmarks, fuzzing, and test coverage. Follows TDD methodology with idiomatic Go practices.</description>
<location>claude</location>
</skill>

<skill>
<name>grounded-theory-coding</name>
<description>扎根理论编码技能（AI CLI 原生版），支持自动任务队列执行。包含绝对禁止原则、任务分解规则，以及完整的 Python 脚本工具链，确保分析质量和完整性。</description>
<location>claude</location>
</skill>

<skill>
<name>investor-materials</name>
<description>Create and update pitch decks, one-pagers, investor memos, accelerator applications, financial models, and fundraising materials. Use when the user needs investor-facing documents, projections, use-of-funds tables, milestone plans, or materials that must stay internally consistent across multiple fundraising assets.</description>
<location>claude</location>
</skill>

<skill>
<name>investor-outreach</name>
<description>Draft cold emails, warm intro blurbs, follow-ups, update emails, and investor communications for fundraising. Use when the user wants outreach to angels, VCs, strategic investors, or accelerators and needs concise, personalized, investor-facing messaging.</description>
<location>claude</location>
</skill>

<skill>
<name>iterative-retrieval</name>
<description>Pattern for progressively refining context retrieval to solve the subagent context problem</description>
<location>claude</location>
</skill>

<skill>
<name>java-coding-standards</name>
<description>Java coding standards for Spring Boot services: naming, immutability, Optional usage, streams, exceptions, generics, and project layout.</description>
<location>claude</location>
</skill>

<skill>
<name>jpa-patterns</name>
<description>JPA/Hibernate patterns for entity design, relationships, query optimization, transactions, auditing, indexing, pagination, and pooling in Spring Boot.</description>
<location>claude</location>
</skill>

<skill>
<name>liquid-glass-design</name>
<description>iOS 26 Liquid Glass design system — dynamic glass material with blur, reflection, and interactive morphing for SwiftUI, UIKit, and WidgetKit.</description>
<location>claude</location>
</skill>

<skill>
<name>llm-cost-optimization</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>market-research</name>
<description>Conduct market research, competitive analysis, investor due diligence, and industry intelligence with source attribution and decision-oriented summaries. Use when the user wants market sizing, competitor comparisons, fund research, technology scans, or research that informs business decisions.</description>
<location>claude</location>
</skill>

<skill>
<name>mcp-deep-integration</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>mcp-integration-guide</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>moltbook</name>
<description>Use when participating in the Moltbook social network for AI agents - posting, commenting, voting, searching, following other agents, and engaging with the community. Use when rate limits (1 post per 30min, 1 comment per 20sec, 50 comments/day) affect your actions or when you need to authenticate with API keys for Moltbook operations.</description>
<location>claude</location>
</skill>

<skill>
<name>multi-agent-logistics</name>
<description>多角色智能体物流配送仿真实验技能。使用 Claude Code 的内置 subagent 机制驱动仿真决策，验证论文《电商物流配送场景下多角色智能体对决策效果的影响研究》。当用户提到运行多角色物流仿真、物流配送决策仿真、角色分工效果验证、或执行 bkpaper2026/labpaper 实验时，必须激活此技能。此技能是 agentskills.io 标准格式的 skill。</description>
<location>claude</location>
</skill>

<skill>
<name>nanoclaw-repl</name>
<description>Operate and extend NanoClaw v2, ECC&apos;s zero-dependency session-aware REPL built on claude -p.</description>
<location>claude</location>
</skill>

<skill>
<name>nutrient-document-processing</name>
<description>Process, convert, OCR, extract, redact, sign, and fill documents using the Nutrient DWS API. Works with PDFs, DOCX, XLSX, PPTX, HTML, and images.</description>
<location>claude</location>
</skill>

<skill>
<name>open-source-project-agent-integration</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>paper-downloader</name>
<description>学术论文下载与管理技能，帮助用户搜索、下载、管理计算机科学和AI领域的学术论文，支持arXiv、Google Scholar、Semantic Scholar等来源</description>
<location>claude</location>
</skill>

<skill>
<name>plankton-code-quality</name>
<description>Write-time code quality enforcement using Plankton — auto-formatting, linting, and Claude-powered fixes on every file edit via hooks.</description>
<location>claude</location>
</skill>

<skill>
<name>postgres-patterns</name>
<description>PostgreSQL database patterns for query optimization, schema design, indexing, and security. Based on Supabase best practices.</description>
<location>claude</location>
</skill>

<skill>
<name>project-guidelines-example</name>
<description>Example project-specific skill template based on a real production application.</description>
<location>claude</location>
</skill>

<skill>
<name>prompt-engineering-code</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>python-patterns</name>
<description>Pythonic idioms, PEP 8 standards, type hints, and best practices for building robust, efficient, and maintainable Python applications.</description>
<location>claude</location>
</skill>

<skill>
<name>python-testing</name>
<description>Python testing strategies using pytest, TDD methodology, fixtures, mocking, parametrization, and coverage requirements.</description>
<location>claude</location>
</skill>

<skill>
<name>ralphinho-rfc-pipeline</name>
<description>RFC-driven multi-agent DAG execution pattern with quality gates, merge queues, and work unit orchestration.</description>
<location>claude</location>
</skill>

<skill>
<name>regex-vs-llm-structured-text</name>
<description>Decision framework for choosing between regex and LLM when parsing structured text — start with regex, add LLM only for low-confidence edge cases.</description>
<location>claude</location>
</skill>

<skill>
<name>search-first</name>
<description>Research-before-coding workflow. Search for existing tools, libraries, and patterns before writing custom code. Invokes the researcher agent.</description>
<location>claude</location>
</skill>

<skill>
<name>security-review</name>
<description>Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns.</description>
<location>claude</location>
</skill>

<skill>
<name>security-scan</name>
<description>Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and injection risks using AgentShield. Checks CLAUDE.md, settings.json, MCP servers, hooks, and agent definitions.</description>
<location>claude</location>
</skill>

<skill>
<name>self-evolution-loop</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>skill-stocktake</name>
<description>Use when auditing Claude skills and commands for quality. Supports Quick Scan (changed skills only) and Full Stocktake modes with sequential subagent batch evaluation.</description>
<location>claude</location>
</skill>

<skill>
<name>soul-auto-evolve</name>
<description>长时自动进化 - 持续运行，每3小时检测+触发进化</description>
<location>claude</location>
</skill>

<skill>
<name>soul-check</name>
<description>健康检查 - 每日执行，检查系统状态</description>
<location>claude</location>
</skill>

<skill>
<name>soul-co-evolve</name>
<description>协同进化 - 基于双Agent循环的多CLI协作学习</description>
<location>claude</location>
</skill>

<skill>
<name>soul-compete</name>
<description>竞争进化 - 基于双Agent循环的方案对比与最优选择</description>
<location>claude</location>
</skill>

<skill>
<name>soul-evolution</name>
<description>自主进化 - 常规进化（模式分析→知识提取→技能创建→验证测试）</description>
<location>claude</location>
</skill>

<skill>
<name>soul-reflection</name>
<description>深度反思 - 每5次进化后执行，使命对齐</description>
<location>claude</location>
</skill>

<skill>
<name>source-code-first-verification</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>springboot-patterns</name>
<description>Spring Boot architecture patterns, REST API design, layered services, data access, caching, async processing, and logging. Use for Java Spring Boot backend work.</description>
<location>claude</location>
</skill>

<skill>
<name>springboot-security</name>
<description>Spring Security best practices for authn/authz, validation, CSRF, secrets, headers, rate limiting, and dependency security in Java Spring Boot services.</description>
<location>claude</location>
</skill>

<skill>
<name>springboot-tdd</name>
<description>Test-driven development for Spring Boot using JUnit 5, Mockito, MockMvc, Testcontainers, and JaCoCo. Use when adding features, fixing bugs, or refactoring.</description>
<location>claude</location>
</skill>

<skill>
<name>springboot-verification</name>
<description>Verification loop for Spring Boot projects: build, static analysis, tests with coverage, security scans, and diff review before release or PR.</description>
<location>claude</location>
</skill>

<skill>
<name>stock-investment-analysis</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>strategic-compact</name>
<description>Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction.</description>
<location>claude</location>
</skill>

<skill>
<name>swift-actor-persistence</name>
<description>Thread-safe data persistence in Swift using actors — in-memory cache with file-backed storage, eliminating data races by design.</description>
<location>claude</location>
</skill>

<skill>
<name>swift-concurrency-6-2</name>
<description>Swift 6.2 Approachable Concurrency — single-threaded by default, @concurrent for explicit background offloading, isolated conformances for main actor types.</description>
<location>claude</location>
</skill>

<skill>
<name>swift-protocol-di-testing</name>
<description>Protocol-based dependency injection for testable Swift code — mock file system, network, and external APIs using focused protocols and Swift Testing.</description>
<location>claude</location>
</skill>

<skill>
<name>swiftui-patterns</name>
<description>SwiftUI architecture patterns, state management with @Observable, view composition, navigation, performance optimization, and modern iOS/macOS UI best practices.</description>
<location>claude</location>
</skill>

<skill>
<name>tdd-workflow</name>
<description>Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.</description>
<location>claude</location>
</skill>

<skill>
<name>two-agent-loop</name>
<description>双Agent循环 - 所有进化的基础执行机制</description>
<location>claude</location>
</skill>

<skill>
<name>user-simulation-test</name>
<description></description>
<location>claude</location>
</skill>

<skill>
<name>using-superpowers-stigmergy</name>
<description>Stigmergy Cross-CLI Superpowers Integration - Use when starting any session</description>
<location>claude</location>
</skill>

<skill>
<name>verification-loop</name>
<description>A comprehensive verification system for Claude Code sessions.</description>
<location>claude</location>
</skill>

<skill>
<name>visa-doc-translate</name>
<description>Translate visa application documents (images) to English and create a bilingual PDF with original and translation</description>
<location>claude</location>
</skill>

<skill>
<name>web-access</name>
<description>所有联网操作必须通过此 skill 处理，包括：搜索、网页抓取、登录后操作、网络交互等。 触发场景：用户要求搜索信息、查看网页内容、访问需要登录的网站、操作网页界面、抓取社交媒体内容（小红书、微博、推特等）、读取动态渲染页面、以及任何需要真实浏览器环境的网络任务。</description>
<location>claude</location>
</skill>

<skill>
<name>wechat-article-downloader</name>
<description>Use when batch downloading WeChat Official Account articles with metadata extraction, image downloading, and OCR text recognition from images. Use for automated archival, content analysis, or data collection from public accounts.</description>
<location>claude</location>
</skill>

<skill>
<name>wechat-im-integration</name>
<description></description>
<location>claude</location>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->
