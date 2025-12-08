# Gemini CLI Project Memory Document

## Project Overview
- **Project Name**: stigmergy-CLI-Multi-Agents
- **Project Type**: Node.js Project
- **Main Tech Stack**: Node.js, JavaScript, TypeScript
- **Created Date**: 2025-12-07T15:19:21.996Z
- **Last Updated**: 2025-12-07T15:19:21.996Z

## Gemini CLI Usage Guide

### 1. Common Command Patterns
```bash
# Multilingual translation
gemini "Translate following content to {{TARGET_LANGUAGE}}: {{CONTENT}}"

# Documentation generation
gemini "Generate detailed technical documentation for this {{COMPONENT_TYPE}}" {{COMPONENT_PATH}}

# Data analysis
gemini "Analyze this dataset and generate report" {{DATA_PATH}}

# API testing
gemini "Generate comprehensive test cases for {{API_ENDPOINT}}"
```

### 2. Project Specific Configuration
- **Primary Language**: English
- **Target Languages**: Chinese, Japanese, Spanish
- **Documentation Style**: Markdown
- **Output Format**: Markdown

### 3. Gemini CLI Specific Prompt Templates

#### Translation Template
```
Please translate the following {{CONTENT_TYPE}} to {{TARGET_LANGUAGE}}:

Source language: {{SOURCE_LANGUAGE}}
Target language: {{TARGET_LANGUAGE}}
Content type: {{CONTENT_TYPE}}
Professional domain: {{DOMAIN}}

Content:
[CONTENT_TO_TRANSLATE]

Requirements:
1. Maintain technical accuracy
2. Follow {{TARGET_LANGUAGE}} expression habits
3. Use professional terminology accurately
4. Preserve format and structure
```

#### Documentation Generation Template
```
Please generate complete technical documentation for the following {{COMPONENT_TYPE}}:

Component name: {{COMPONENT_NAME}}
Tech stack: Node.js, JavaScript, TypeScript
Function description: {{FUNCTION_DESCRIPTION}}

Documentation structure requirements:
1. Overview and purpose
2. API interface documentation
3. Usage examples
4. Configuration instructions
5. Troubleshooting

Please generate using Markdown style.
```

### 4. Data Analysis and Report Templates
```
Please analyze following data and generate detailed report:

Data type: {{DATA_TYPE}}
Analysis goal: {{ANALYSIS_GOAL}}
Time range: {{TIME_RANGE}}
Key metrics: {{KEY_METRICS}}

Data:
[DATA_CONTENT]

Report requirements:
1. Data summary and statistics
2. Trend analysis
3. Anomaly detection
4. Visualization suggestions
5. Conclusions and recommendations
```

### 5. Cross-CLI Collaboration
- **Collaborate with Claude**: Code analysis and architecture design
- **Collaborate with Qwen**: Localization and Chinese content
- **Collaborate with iFlow**: Automated workflow integration
- **Collaborate with CodeBuddy**: Code optimization and refactoring

### 6. Project Memory
- **Translation preferences**: Technical accuracy first
- **Documentation standards**: Markdown with code examples
- **Analysis templates**: Standard analysis templates
- **Common languages**: English, Chinese, Japanese

## Example Usage Scenarios

### Scenario 1: Multilingual Documentation Generation
```bash
gemini "Translate this API documentation to Japanese, Korean and Spanish, maintaining technical terminology consistency" {{API_DOC_PATH}}
```

### Scenario 2: Data Analysis Report
```bash
gemini "Analyze user behavior data and generate monthly report, focusing on user retention and conversion rates" {{DATA_FILE}}
```

### Scenario 3: Localization Testing
```bash
gemini "Generate localization test cases for this web application, covering Chinese, Japanese and Arabic display effects"
```

### Scenario 4: Internationalization Optimization
```bash
gemini "Analyze this application's internationalization implementation and provide improvement suggestions and best practices"
```

## Best Practices

### Translation Best Practices
1. **Terminology consistency**: Use project terminology list
2. **Cultural adaptation**: Consider target region cultural differences
3. **Format preservation**: Maintain original document format and structure
4. **Quality check**: Perform technical and linguistic dual review after translation

### Documentation Generation Best Practices
1. **Structured**: Use unified document structure
2. **Example rich**: Provide sufficient usage examples
3. **Version control**: Clearly specify document version and scope
4. **Maintainability**: Facilitate future updates and maintenance

---
*This document is automatically generated and updated by Stigmergy CLI*
*Last update time: 2025/12/7 23:19:21*