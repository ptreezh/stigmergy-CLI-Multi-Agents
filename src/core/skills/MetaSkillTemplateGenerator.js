#!/usr/bin/env node

/**
 * Meta-Skill Template Generator
 * Generates meta-skill templates for CLI tools that don't have custom templates
 */

const fs = require("fs").promises;
const path = require("path");

class MetaSkillTemplateGenerator {
  constructor() {
    this.templateDir = path.join(process.cwd(), "templates");
    this.centralRepoDir = path.join(
      require("os").homedir(),
      ".stigmergy",
      "skills-hub",
      "meta-skills",
    );
  }

  /**
   * Generate a meta-skill template for a CLI tool
   */
  async generateTemplate(toolId, toolConfig) {
    const templateName = `using-${toolId}-skills.md`;
    const templatePath = path.join(this.templateDir, templateName);

    // Check if template already exists
    try {
      await fs.access(templatePath);
      return { exists: true, path: templatePath };
    } catch (e) {
      // Template doesn't exist, generate it
    }

    const content = this.generateTemplateContent(toolId, toolConfig);

    await fs.writeFile(templatePath, content, "utf8");

    return { exists: false, path: templatePath, created: true };
  }

  /**
   * Generate template content for a tool
   */
  generateTemplateContent(toolId, toolConfig) {
    const displayName = toolConfig.name || toolId;
    const toolIdUpper = toolId.toUpperCase();

    return `<!-- META_SKILL_START -->
---
name: using-${toolId}-skills
description: Use when starting any task in ${displayName} - establishes skill usage protocol and methodology
---

<EXTREMELY_IMPORTANT>
You are using ${displayName} with Stigmergy skill integration.

**Below is the complete guide for using ${displayName}'s capabilities**

## Mandatory First Response Protocol

Before ANY response or action in ${displayName}, you MUST complete this checklist:

☐ 1. Identify task requirements and constraints
☐ 2. Check if a skill should be activated
☐ 3. Select appropriate skill or approach
☐ 4. Follow the methodology systematically
☐ 5. Verify completion before finishing

**Responding WITHOUT completing this checklist = automatic failure**

## ${displayName} Integration

${displayName} provides AI-powered assistance with Stigmergy cross-CLI coordination.

### Key Capabilities

${this.generateCapabilitiesSection(toolId, toolConfig)}

### Available Skills

Through Stigmergy integration, you have access to:

1. **Process Skills**
   - brainstorming: Design and ideation methodology
   - test-driven-development: TDD methodology
   - systematic-debugging: Troubleshooting methodology

2. **Execution Skills**
   - subagent-driven-development: Multi-agent coordination
   - executing-plans: Plan execution methodology

3. **Review Skills**
   - requesting-code-review: Pre-review preparation
   - receiving-code-review: Review response methodology

## Common Rationalizations (DO NOT FALL FOR THESE)

| Your Thought | Reality | Why You're Wrong |
|--------------|----------|------------------|
| "I can do this directly" | Skills provide structured expertise | You'll miss proven patterns |
| "The skill will slow me down" | Skills prevent rework | Rework is slower than process |
| "I don't need a skill for this" | Skills bring methodology | Process matters more than speed |
| "I know this skill's approach" | Skills evolve and update | Current version may differ |
| "Let me start, then check skill" | Starting without structure = chaos | Skills shape thinking from start |
| "This task is too simple for a skill" | Simple tasks have hidden complexity | Structure prevents oversights |
| "The skill is too rigid" | Framework enables creativity | Structure frees mental space |
| "I'll combine multiple skills" | Good! Use primary skill, add others | Clear primary prevents confusion |

## Decision Framework

### When to Use Skills

**✅ ALWAYS Use When:**
- Task is non-trivial (> 1 minute of work)
- Task involves creativity or decision-making
- Task requires quality or correctness
- Task has established best practices
- Task benefits from structured approach

**❌ May Skip When:**
- Task is purely informational (answering a question)
- Task is fully specified and routine
- User explicitly requests no skill
- Task is so simple that methodology overhead is unjustified

### Skill Selection Guide

1. **Creative/Design tasks?** → **brainstorming skill**
2. **Implementation tasks?** → **test-driven-development skill**
3. **Troubleshooting?** → **systematic-debugging skill**
4. **Code review?** → **requesting/receiving-code-review skills**
5. **Multi-agent work?** → **subagent-driven-development skill**

## Integration with Stigmergy

${displayName} can coordinate with Stigmergy for cross-CLI workflows:

### Accessing Stigmergy Skills

\`\`\`bash
# Within ${displayName}, invoke a Stigmergy skill
stigmergy use ${toolId} skill brainstorming

# Route task to different CLI
stigmergy call "Analyze this code for performance"
\`\`\`

### Cross-CLI Workflow Example

\`\`\`bash
# In ${displayName}
1. Use brainstorming skill for design
2. "Design system architecture"

# Then delegate to Claude for implementation
stigmergy use claude "Implement this design"

# Then back for review
${toolId} "Review this implementation"
\`\`\`

## Best Practices

### 1. Trust Skill Activation
The system is smart - let it select the right skill for your task.

### 2. Follow Skill Methodologies
Skills provide proven processes - follow them systematically.

### 3. Leverage Cross-CLI Capabilities
${displayName} is designed for cross-CLI coordination - use Stigmergy when beneficial.

### 4. Document Your Work
When a skill activates, acknowledge it and explain why it's relevant.

## Troubleshooting

### Problem: "No skill activated"
**Solution**:
- Check if trigger keywords are present
- Try manual activation: "Use brainstorming skill for this"
- Verify skill is configured

### Problem: "Skill slowed me down"
**Solution**:
- Process time is investment, not waste
- Quality upfront prevents rework
- Compare: Do it right once vs fix it three times

## Examples

### Example 1: Design Task
\`\`\`
User: "Design a new feature"

✓ CORRECT (with Skill):
1. brainstorming skill activates
2. Skill guides through process:
   - Diverge: Generate alternatives
   - Explore: Analyze options
   - Converge: Select best approach
3. Output: Well-structured design with rationale

✗ WRONG (no Skill):
1. Start designing immediately
2. First idea becomes "the design"
3. Output: Unconsidered, fragile design
\`\`\`

### Example 2: Implementation Task
\`\`\`
User: "Implement a function"

✓ CORRECT (with TDD Skill):
1. test-driven-development skill activates
2. Skill enforces TDD process
3. Output: Tested, clean code with full coverage

✗ WRONG (no Skill):
1. Start implementing
2. Write code without tests
3. Output: Untested code with potential bugs
\`\`\`

## Summary

**Key Principles:**
1. ✅ **Skills first** - Always check for applicable skills
2. ✅ **Follow the process** - Skills provide methodologies
3. ✅ **Quality focus** - Skills enforce standards
4. ✅ **Cross-CLI thinking** - Use Stigmergy for coordination
5. ✅ **Systematic execution** - Process ensures quality

**Your Success Criteria:**
- Tasks are well-planned before execution
- Quality is built-in (TDD, verification)
- Problems are solved systematically
- Work is verifiable and complete

**Remember**: ${displayName} + Stigmergy = STRUCTURED EXCELLENCE through systematic, methodical task execution.

</EXTREMELY_IMPORTANT>

## Additional Resources

- ${displayName} CLI documentation
- Stigmergy integration: See cross-CLI documentation
- Skill configuration: ~/.stigmergy/skills/

---

**Version**: 1.0.0
**Last Updated**: ${new Date().toISOString().split("T")[0]}
**Maintained By**: Stigmergy Project
<!-- META_SKILL_END -->`;
  }

  /**
   * Generate capabilities section for a tool
   */
  generateCapabilitiesSection(toolId, toolConfig) {
    // Generate tool-specific capabilities based on configuration
    const capabilities = [];

    if (toolConfig.hooksDir) {
      capabilities.push(
        "- Hooks Integration: Advanced hooks at " + toolConfig.hooksDir,
      );
    }

    if (toolConfig.config) {
      capabilities.push(
        "- Configuration: Managed config at " + toolConfig.config,
      );
    }

    if (toolConfig.autoInstall) {
      capabilities.push("- Auto-Install: Enabled for automatic setup");
    }

    if (capabilities.length === 0) {
      capabilities.push(
        "- AI Assistance: Intelligent code generation and analysis",
      );
      capabilities.push(
        "- Cross-CLI Coordination: Stigmergy integration for multi-tool workflows",
      );
    }

    return capabilities.join("\n");
  }

  /**
   * Generate missing templates for all tools
   */
  async generateMissingTemplates(adapters) {
    const results = [];
    const { CLI_TOOLS } = require("../cli_tools");

    for (const adapter of adapters) {
      const toolConfig = CLI_TOOLS[adapter.id];
      if (!toolConfig) continue;

      // Check if custom template exists
      const customTemplatePath = path.join(
        this.templateDir,
        adapter.metaSkillFile,
      );
      try {
        await fs.access(customTemplatePath);
        results.push({ tool: adapter.id, template: "custom", exists: true });
        continue;
      } catch (e) {
        // Custom template doesn't exist, generate generic one
      }

      // Generate generic template
      const result = await this.generateTemplate(adapter.id, toolConfig);
      results.push({
        tool: adapter.id,
        template: "generic",
        created: result.created,
        path: result.path,
      });
    }

    return results;
  }
}

module.exports = MetaSkillTemplateGenerator;
