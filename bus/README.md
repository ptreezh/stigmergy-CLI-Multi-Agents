# Stigmergy Coordination Bus Protocol

## Overview

A **file-based coordination bus** that enables autonomous collaboration between AI agents without a central server. All agents read/write JSON files in a shared directory.

## Directory Structure

```
bus/
├── registry/                    # Agent self-registration
│   ├── {agent-name}.json       # Per-agent status file
│   └── README.md
├── handoffs/                   # Task handoffs
│   ├── pending/               # Waiting to be picked up
│   │   └── {id}.json
│   ├── active/                # In progress
│   │   └── {id}.json
│   └── completed/             # Finished
│       └── {id}.json
├── reviews/                    # Review requests
│   ├── pending/
│   │   └── {id}.json
│   └── completed/
│       └── {id}.json
├── shared/                     # Shared context
│   ├── knowledge.md           # Distilled project knowledge
│   └── context.json           # Shared state
└── README.md                   # This file
```

## Agent Registry Format

File: `bus/registry/{agent-name}.json`

```json
{
  "agent": "opencode",
  "status": "active",
  "currentTask": "task-123-or-null",
  "capabilities": ["coding", "review", "research"],
  "project": "D:\\socienceAI",
  "lastUpdate": "2026-10-07T01:38:00Z",
  "heartbeat": 60
}
```

**Fields:**
- `agent`: Agent identifier (must match filename)
- `status`: `active` | `idle` | `busy` | `offline`
- `currentTask`: Current task ID or `null`
- `capabilities`: Array of skills this agent can perform
- `project`: Current working directory
- `lastUpdate`: ISO timestamp of last update
- `heartbeat`: Expected update interval in seconds

## Handoff Format

File: `bus/handoffs/pending/{id}.json`

```json
{
  "id": "handoff-001",
  "from": "opencode",
  "to": "zcode",
  "type": "task",
  "title": "Review authentication PR",
  "description": "Please review the auth changes in branch feature/auth",
  "priority": "high",
  "artifacts": ["D:\\socienceAI\\src\\auth.js"],
  "requirements": ["Must pass tests", "Must follow style guide"],
  "createdAt": "2026-10-07T01:38:00Z",
  "deadline": "2026-10-07T05:00:00Z",
  "status": "pending"
}
```

**States:**
- `pending`: Waiting to be picked up
- `active`: Accepted by agent, in progress
- `completed`: Finished successfully
- `rejected`: Declined by agent
- `cancelled`: Cancelled by originator

## Review Format

File: `bus/reviews/pending/{id}.json`

```json
{
  "id": "review-001",
  "from": "opencode",
  "to": "zcode",
  "type": "code_review",
  "title": "Review PR #42",
  "description": "Please review the changes in PR #42",
  "artifacts": ["D:\\socienceAI\\src\\auth.js"],
  "checklist": ["tests pass", "no security issues", "style guide"],
  "createdAt": "2026-10-07T01:38:00Z",
  "deadline": "2026-10-07T03:00:00Z",
  "status": "pending"
}
```

## Agent Coordination Skill

Each agent should implement a **stigmergy-coordinator skill** that:

1. **Heartbeat**: Update `bus/registry/{agent-name}.json` every N seconds
2. **Scan**: Check `bus/handoffs/pending/` for tasks matching capabilities
3. **Accept**: Move handoff from `pending/` to `active/`
4. **Complete**: Move handoff from `active/` to `completed/`
5. **Review**: Check `bus/reviews/pending/` for review requests
6. **Share**: Update `bus/shared/knowledge.md` with learnings

## Orchestrator Role

The Stigmergy orchestrator:
1. **Scans** all agent registries to build global view
2. **Matches** agents to tasks based on capabilities and project
3. **Creates** handoffs and review requests
4. **Monitors** progress and detects stuck tasks
5. **Distills** learnings into shared knowledge

## Security

- All agents must write to their own registry file only
- Handoffs/reviews can be picked up by any agent (open by default)
- Sensitive data should not be stored in the bus
- The bus directory should be in a shared location accessible to all agents

## Example Workflow

1. opencode finishes coding a feature → creates handoff for review
2. zcode scans `bus/handoffs/pending/` → finds the review request
3. zcode accepts the handoff → moves to `active/`
4. zcode completes review → moves to `completed/`
5. orchestrator detects completion → updates shared knowledge
