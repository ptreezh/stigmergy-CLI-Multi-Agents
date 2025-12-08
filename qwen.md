# Qwen CLI Project Memory Document

## Project Overview
- **Project Name**: stigmergy-CLI-Multi-Agents
- **Project Type**: Node.js Project
- **Main Tech Stack**: Node.js, JavaScript, TypeScript
- **Created Date**: 2025-12-07T15:19:21.999Z
- **Last Updated**: 2025-12-07T15:19:21.999Z

## Qwen CLI Usage Guide

### 1. Common Command Patterns
```bash
# Chinese content generation
qwen "Generate detailed documentation about {{TOPIC}}"

# Code generation (with Chinese comments)
qwen "Write {{FUNCTION_NAME}} functionality using {{LANGUAGE}}, requiring Chinese comments"

# Localization processing
qwen "Localize this user interface to Chinese version" {{UI_PATH}}

# Technical documentation translation
qwen "Translate technical documentation to Chinese, maintaining professional terminology accuracy" {{DOC_PATH}}
```

### 2. Project Specific Configuration
- **Language preference**: Simplified/Traditional Chinese
- **Technical domain**: Software Development
- **Documentation style**: 简体中文技术文档
- **Encoding standard**: UTF-8

### 3. Qwen CLI Specific Prompt Templates

#### Chinese Code Generation Template
```
Please implement the following functionality using {{PROGRAMMING_LANGUAGE}}, requiring Chinese comments:

Functional requirements: {{REQUIREMENT_DESCRIPTION}}
Input parameters: {{INPUT_PARAMETERS}}
Output requirements: {{OUTPUT_REQUIREMENTS}}
Exception handling: {{EXCEPTION_HANDLING}}

Code requirements:
1. All functions and classes must have Chinese comments
2. Variable names can use Pinyin or English
3. Error messages in Chinese
4. Follow {{PROGRAMMING_LANGUAGE}} best practices
```

#### Chinese Technical Documentation Template
```
Please generate detailed Chinese technical documentation for the following {{COMPONENT_TYPE}}:

Component name: {{COMPONENT_NAME}}
Function description: {{FUNCTION_DESCRIPTION}}
Technical implementation: {{TECHNICAL_IMPLEMENTATION}}

Documentation requirements:
1. Use Simplified Chinese with accurate terminology
2. Clear structure and hierarchy
3. Include complete usage examples
4. Provide troubleshooting guide

Please organize according to following structure:
I. Overview
II. Feature Description
III. Usage Methods
IV. API Interface
V. Configuration Instructions
VI. Common Questions
```

#### Localization Testing Template
```
Please generate Chinese localization test cases for the following functionality:

Function module: {{MODULE_NAME}}
Target users: {{TARGET_USERS}}
Usage scenarios: {{USAGE_SCENARIOS}}

Testing requirements:
1. Correct Chinese input and display
2. Chinese font and style adaptation
3. Chinese date time format
4. Chinese error prompts
5. Chinese help documentation

Test scenarios:
- {{SCENARIO_1}}
- {{SCENARIO_2}}
- {{SCENARIO_3}}
```

### 4. Chinese Adaptation Guide
```
Please perform Chinese adaptation for the following {{COMPONENT_TYPE}}:

Original component: {{ORIGINAL_COMPONENT}}
Target user group: {{CHINESE_USER_GROUP}}
Usage context: {{USAGE_CONTEXT}}

Adaptation requirements:
1. Interface text localization
2. Conform to Chinese user habits
3. Support Chinese input methods
4. Adapt to Chinese display requirements
5. Consider local regulations and policies

Special focus:
- Date time format (year month day, time zone)
- Number and currency format
- Color and cultural preferences
- Legal and regulatory compliance
```

### 5. Cross-CLI Collaboration
- **Collaborate with Claude**: Code review and architecture suggestions
- **Collaborate with Gemini**: Multilingual support and translation
- **Collaborate with iFlow**: Localization workflows
- **Collaborate with CodeBuddy**: Chinese code optimization

### 6. Project Memory
- **Chinese terminology**: Standard Chinese technical terms
- **Localization standards**: Chinese localization standards
- **User habits**: Chinese user preferences
- **Compliance requirements**: Local regulations compliance

## Example Usage Scenarios

### Scenario 1: Chinese Documentation Generation
```bash
qwen "Generate complete Chinese user manual for this e-commerce project, including illustrated usage instructions"
```

### Scenario 2: Chinese Adaptation
```bash
qwen "Perform Chinese adaptation for this mobile application, including payment methods, social media integration and user interface"
```

### Scenario 3: Chinese Code Development
```bash
qwen "Write an order management system using Python, requiring all comments and error messages to be in Chinese"
```

### Scenario 4: Localization Testing
```bash
qwen "Generate Chinese localization test cases for this game, focusing on dialogue system and text display"
```

## Chinese Development Best Practices

### Code Commenting Standards
1. **Function comments**: Use Chinese to describe functionality, parameters and return values
2. **Class comments**: Explain class purpose and main methods
3. **Inline comments**: Explain complex logic and algorithms
4. **README documentation**: Provide complete Chinese instructions

### Localization Key Points
1. **Text externalization**: Extract all user-visible text to resource files
2. **Format adaptation**: Support Chinese date, time, number formats
3. **Font support**: Ensure Chinese fonts display correctly
4. **Input method support**: Support Chinese input method integration
5. **Cultural adaptation**: Consider Chinese user usage habits

### Technical Documentation Standards
1. **Terminology unification**: Use standard Chinese technical terms
2. **Clear structure**: Well-organized hierarchy for easy understanding
3. **Complete examples**: Provide sufficient Chinese example code
4. **Maintenance friendly**: Facilitate future updates and maintenance

---
*This document is automatically generated and updated by Stigmergy CLI*
*Last update time: 2025/12/7 23:19:21*