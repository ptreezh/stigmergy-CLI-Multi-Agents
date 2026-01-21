# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview
This is the Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System. It enables existing AI CLI tools to collaborate with each other through a plugin system rather than replacing them. The system supports tools like Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, Codex, and Kode.

The system features a dual implementation architecture with Node.js as the primary implementation and Python as a fallback for graceful degradation.

## Common Commands

### Development Workflow
```bash
# Run the CLI locally
npm start

# Watch mode for development
npm run dev

# Run all tests
npm test

# Run specific tests
node test/real-test.js

# Run Node.js coordination layer tests
npm run test:nodejs-coordination
npm run test:nodejs-hooks
npm run test:nodejs-integration

# Lint the code
npm run lint

# Format code
npm run format
```

### Authentication Commands
```bash
# Register a new user
stigmergy register <username> <password>

# Log in
stigmergy login <username> <password>

# Check authentication status
stigmergy auth-status

# Log out
stigmergy logout
```

### Build and Deployment
```bash
# Build the project
npm run build

# Deploy hooks
npm run deploy

# Auto-install during postinstall
npm run postinstall
```

### CLI Operations
```bash
# Check system status
npm run status

# Scan for available AI CLI tools
npm run scan

# Initialize system
npm run init

# Validate installation
npm run validate

# Clean system
npm run clean

# Remove all Stigmergy hooks
stigmergy remove
```

## Code Architecture and Structure

### Core Components
1. **Main Entry Point**: `src/main_english.js` - Contains the primary CLI logic and routing system
2. **Core Module**: `src/core/cli_help_analyzer.js` - Handles CLI help analysis and parsing
3. **Adapters**: `src/adapters/` - Contains tool-specific adapters for each supported AI CLI
4. **Index File**: `src/index.js` - Simple entry point that loads main.js

### Key Classes and Systems
1. **SmartRouter**: Handles intelligent routing of user prompts to appropriate AI tools based on keywords
2. **MemoryManager**: Manages interaction history and memory storage in both global and project contexts
3. **CLI_TOOLS Configuration**: Central configuration defining all supported AI CLI tools with their installation methods and paths

### Adapter System
Each AI tool has its own adapter directory under `src/adapters/` containing:
- Hook adapters for integrating with the tool's extension system
- Installation scripts for setting up the integration
- Skill integration modules for advanced functionality

### Testing Structure
Tests are located in the `test/` directory with:
- Integration tests for various system components
- Unit tests in the `test/unit` subdirectory
- Real-world scenario tests for cross-CLI collaboration

### Configuration Files
- `package.json`: Defines npm scripts, dependencies, and entry points
- `STIGMERGY.md`: Project-specific memory and configuration
- Global configuration in `~/.stigmergy/config.json`

## Cross-CLI Collaboration Flow
1. User inputs a request through the stigmergy CLI
2. SmartRouter analyzes the input and determines the appropriate AI tool
3. The request is routed to the specific tool's adapter
4. The adapter communicates with the AI tool
5. Responses are captured and managed by MemoryManager
6. Results are returned to the user with context preservation

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

</available_skills>

</skills_system>
<!-- SKILLS_END -->
