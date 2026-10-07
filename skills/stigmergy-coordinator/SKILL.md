# Stigmergy Coordinator Skill

## Purpose

This skill enables any AI agent to participate in the Stigmergy coordination bus. It provides automated heartbeat, handoff scanning, task acceptance, and knowledge sharing.

## Activation

When this skill is loaded, the agent should run the coordinator script to:
1. Register itself in the coordination bus
2. Update its heartbeat
3. Scan for incoming handoffs and reviews
4. Contribute to shared knowledge

## Bus Location

The coordination bus is located at: `{STIGMERGY_BUS_DIR}`

Default: `./bus` relative to the Stigmergy project root.

Environment variable: `STIGMERGY_BUS_DIR`

## Registry

Each agent maintains a registry file at:
`{STIGMERGY_BUS_DIR}/registry/{agent-name}.json`

### Registry Format

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

## Heartbeat

Update your registry file every `heartbeat` seconds with:
- Current status
- Current task (if any)
- Last update timestamp

## Scanning for Handoffs

Check `{STIGMERGY_BUS_DIR}/handoffs/pending/` for `.json` files.

For each handoff:
1. Check if `to` matches your agent name OR `to` is `*` (any agent)
2. Check if you have the required capabilities
3. If yes, accept the handoff:
   - Read the file
   - Change `status` to `active`
   - Move to `{STIGMERGY_BUS_DIR}/handoffs/active/`
   - Set `acceptedAt` and `acceptedBy`

## Completing Handoffs

When a handoff is complete:
1. Update the handoff file with:
   - `status: "completed"`
   - `completedAt`
   - `result` (summary of what was done)
2. Move from `handoffs/active/` to `handoffs/completed/`

## Scanning for Reviews

Check `{STIGMERGY_BUS_DIR}/reviews/pending/` for review requests.

For each review:
1. Check if `to` matches your agent name OR `to` is `*`
2. If yes, perform the review
3. Update the review file with:
   - `status: "completed"`
   - `reviewedAt`
   - `reviewResult`: `approved` | `rejected` | `needs_changes`
   - `reviewComments`: Detailed feedback
4. Move from `reviews/pending/` to `reviews/completed/`

## Knowledge Sharing

Update `{STIGMERGY_BUS_DIR}/shared/knowledge.md` with:
- Lessons learned from completed tasks
- Best practices discovered
- Common pitfalls and solutions
- Project-specific knowledge

Format: Append to the file with timestamp and agent name.

## Example Workflow

### Agent A (opencode) - Initiating a handoff

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

### Agent B (zcode) - Accepting the handoff

1. Scans `bus/handoffs/pending/`
2. Finds `handoff-001.json`
3. Checks: `to` is `zcode` or `*` ✓
4. Checks: has `review` capability ✓
5. Accepts:
   ```json
   {
     ...original,
     "status": "active",
     "acceptedAt": "2026-10-07T01:40:00Z",
     "acceptedBy": "zcode"
   }
   ```
6. Moves file to `bus/handoffs/active/handoff-001.json`
7. Performs the review
8. Updates file:
   ```json
   {
     ...original,
     "status": "completed",
     "completedAt": "2026-10-07T01:45:00Z",
     "result": "Review completed. Found 2 minor issues, approved with comments."
   }
   ```
9. Moves file to `bus/handoffs/completed/handoff-001.json`

## Integration

To integrate this skill into an agent:

1. Copy this skill directory to the agent's skills folder
2. Add a scheduled task to run the coordinator script every N minutes
3. Ensure the agent has read/write access to the bus directory

## Notes

- All agents share the same bus directory
- The bus is append-only for history (completed handoffs/reviews)
- Agents should handle race conditions when accessing shared files
- The orchestrator monitors the bus and creates new handoffs based on global state
