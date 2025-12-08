# iFlow CLI Project Memory Document

## Project Overview
- **Project Name**: stigmergy-CLI-Multi-Agents
- **Project Type**: Node.js Project
- **Main Tech Stack**: Node.js, JavaScript, TypeScript
- **Created Date**: 2025-12-07T15:19:21.998Z
- **Last Updated**: 2025-12-07T15:19:21.998Z

## iFlow CLI Usage Guide

### 1. Common Command Patterns
```bash
# Workflow creation
iflow create --template {{TEMPLATE_NAME}} --name {{WORKFLOW_NAME}}

# Workflow execution
iflow run {{WORKFLOW_FILE}} --input "{{INPUT_DATA}}"

# Workflow monitoring
iflow status {{WORKFLOW_ID}}

# Batch processing
iflow batch {{BATCH_CONFIG_FILE}}
```

### 2. Project Specific Configuration
- **Workflow engine**: iFlow CLI
- **Execution environment**: Node.js
- **Data sources**: Local files, APIs
- **Output targets**: Files, databases, APIs

### 3. iFlow CLI Specific Prompt Templates

#### Workflow Design Template
```
Please design a {{WORKFLOW_TYPE}} workflow:

Workflow name: {{WORKFLOW_NAME}}
Business objective: {{BUSINESS_OBJECTIVE}}
Input data: {{INPUT_DATA}}
Output requirements: {{OUTPUT_REQUIREMENTS}}

Workflow steps:
1. {{STEP_1_DESCRIPTION}}
2. {{STEP_2_DESCRIPTION}}
3. {{STEP_3_DESCRIPTION}}

Technical requirements:
- Parallel processing: {{PARALLEL_PROCESSING}}
- Error handling: {{ERROR_HANDLING}}
- Monitoring alerts: {{MONITORING_ALERTS}}
- Data validation: {{DATA_VALIDATION}}

Please generate complete workflow configuration file.
```

#### Automation Process Template
```
Please create an automated {{PROCESS_TYPE}} process:

Trigger conditions: {{TRIGGER_CONDITIONS}}
Execution frequency: {{EXECUTION_FREQUENCY}}
Processing logic: {{PROCESSING_LOGIC}}

Process requirements:
1. Data acquisition: {{DATA_ACQUISITION}}
2. Data processing: {{DATA_PROCESSING}}
3. Result output: {{RESULT_OUTPUT}}
4. Exception handling: {{EXCEPTION_HANDLING}}
5. Log recording: {{LOG_RECORDING}}

Integration requirements:
- {{INTEGRATION_1}}
- {{INTEGRATION_2}}
- {{INTEGRATION_3}}
```

#### Batch Processing Template
```
Please design a batch processing {{BATCH_TYPE}} solution:

Data scale: {{DATA_SCALE}}
Processing time limit: {{TIME_LIMIT}}
Resource limitations: {{RESOURCE_LIMITS}}

Batch processing strategy:
1. Data partitioning: {{DATA_PARTITIONING}}
2. Parallelism control: {{PARALLELISM_CONTROL}}
3. Failure retry: {{FAILURE_RETRY}}
4. Progress monitoring: {{PROGRESS_MONITORING}}

Performance requirements:
- Throughput: {{THROUGHPUT_REQUIREMENT}}
- Latency: {{LATENCY_REQUIREMENT}}
- Resource utilization: {{RESOURCE_UTILIZATION}}
```

### 4. Cross-CLI Collaboration Workflow
```
Please design a cross-CLI collaboration workflow:

Collaboration goal: {{COLLABORATION_GOAL}}
Participating tools: {{PARTICIPATING_TOOLS}}
Workflow process:

1. Claude CLI is responsible for:
   - {{CLAUDE_TASKS}}
   - Trigger conditions: {{CLAUDE_TRIGGERS}}

2. Gemini CLI is responsible for:
   - {{GEMINI_TASKS}}
   - Trigger conditions: {{GEMINI_TRIGGERS}}

3. Qwen CLI is responsible for:
   - {{QWEN_TASKS}}
   - Trigger conditions: {{QWEN_TRIGGERS}}

4. iFlow CLI is responsible for:
   - Workflow orchestration
   - State management
   - Error recovery

Data flow:
{{DATA_FLOW_DIAGRAM}}
```

### 5. Monitoring and Alert Template
```
Please set up monitoring and alerts for workflow {{WORKFLOW_NAME}}:

Monitoring metrics:
1. Execution time: {{EXECUTION_TIME_METRIC}}
2. Success rate: {{SUCCESS_RATE_METRIC}}
3. Resource usage: {{RESOURCE_USAGE_METRIC}}
4. Data quality: {{DATA_QUALITY_METRIC}}

Alert rules:
- {{ALERT_RULE_1}}
- {{ALERT_RULE_2}}
- {{ALERT_RULE_3}}

Notification methods:
{{NOTIFICATION_METHODS}}

Recovery strategy:
{{RECOVERY_STRATEGIES}}
```

### 6. Project Memory
- **Workflow templates**: {{WORKFLOW_TEMPLATES}}
- **Common configurations**: {{COMMON_CONFIGURATIONS}}
- **Integration endpoints**: {{INTEGRATION_ENDPOINTS}}
- **Performance benchmarks**: {{PERFORMANCE_BENCHMARKS}}

## Example Usage Scenarios

### Scenario 1: CI/CD Automation
```bash
iflow run cicd-pipeline.yml --input "{
  'repository': 'https://github.com/user/project',
  'branch': 'main',
  'build_config': 'production'
}"
```

### Scenario 2: Data Processing Workflow
```bash
iflow create --template data-processing --name daily-etl
```

### Scenario 3: Cross-Tool Collaboration
```bash
iflow run cross-cli-collaboration.yml --input "{
  'task': 'code-review-and-localization',
  'participants': ['claude', 'gemini', 'qwen'],
  'workflow_type': 'sequential'
}"
```

### Scenario 4: Batch File Processing
```bash
iflow batch file-processing-config.json
```

## Workflow Best Practices

### Design Principles
1. **Single responsibility**: Each workflow focuses on one business goal
2. **Reusability**: Design reusable workflow components
3. **Error isolation**: Reasonable error handling and recovery mechanisms
4. **Complete monitoring**: Provide comprehensive execution monitoring

### Performance Optimization
1. **Parallel processing**: Reasonably use parallel execution to improve efficiency
2. **Resource management**: Avoid resource waste and contention
3. **Data locality**: Optimize data access patterns
4. **Caching strategy**: Reasonably use caching to reduce duplicate computation

### Security Considerations
1. **Access control**: Implement appropriate permission management
2. **Data encryption**: Encrypt sensitive data transmission and storage
3. **Audit logging**: Record complete operation logs
4. **Security scanning**: Regularly perform security vulnerability checks

## Common Workflow Templates

### Code Review Workflow
```yaml
name: code-review-workflow
triggers:
  - type: webhook
    event: pull_request
steps:
  - name: security-scan
    tool: claude
    command: "analyze security vulnerabilities"
  - name: code-quality
    tool: gemini
    command: "check code quality and best practices"
  - name: localization-check
    tool: qwen
    command: "verify chinese localization"
```

### Deployment Workflow
```yaml
name: deployment-workflow
triggers:
  - type: manual
    input: deployment_config
steps:
  - name: backup
    tool: iflow
    command: "create deployment backup"
  - name: deploy
    tool: iflow
    command: "execute deployment steps"
  - name: verify
    tool: claude
    command: "verify deployment success"
```

---
*This document is automatically generated and updated by Stigmergy CLI*
*Last update time: 2025/12/7 23:19:21*