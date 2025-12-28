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
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists&apos; work to avoid copyright violations.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic&apos;s official brand colors and typography to any sort of artifact that may benefit from having Anthropic&apos;s look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists&apos; work to avoid copyright violations.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>docx</name>
<description>Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks</description>
<location>stigmergy</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>stigmergy</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>stigmergy</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>pptx</name>
<description>Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks</description>
<location>stigmergy</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude&apos;s capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like &quot;make me a GIF of X doing Y for Slack.&quot;</description>
<location>stigmergy</location>
</skill>

<skill>
<name>template-skill</name>
<description>Replace with description of the skill and when Claude should use it.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>xlsx</name>
<description>Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas</description>
<location>stigmergy</location>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->
