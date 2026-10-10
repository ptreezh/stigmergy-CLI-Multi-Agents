# Unified Heartbeat & Autonomous Coordination Design

## Current State (Evidence-Based)

### Existing Heartbeat Mechanisms (Fragmented)
1. `skills/stigmergy-coordinator/runner.js:214-218` - daemon mode setInterval (heartbeat + scanHandoffs + scanReviews)
2. `src/core/agent_coordinator.js:67-73` - autoCoordinationTimer setInterval
3. `src/core/soul_memory_manager.js:454-461` - heartbeat interval
4. `skills/soul-multi-cli-evolution-coordinator.js:227-230` - sendHeartbeat setInterval
5. `bus/coordinator.js:36-45` - heartbeat() function (manual trigger only)

### Problems
- **5 independent heartbeat systems**, no coordination
- **All require manual start** - no auto-start on agent idle
- **No agent-side autonomous polling** - agents don't read bus unless triggered
- **Reporter has no auto-trigger** - only CLI commands generate reports
- **No unified task board** - agents don't know global state

## Design: Unified Heartbeat Bus (UHB)

### Core Principles
1. **Single source of truth**: `~/.stigmergy/bus/` is the only coordination point
2. **Agent-driven**: Each agent runs its own heartbeat loop when idle
3. **Passive-by-default, active-on-idle**: Agents don't interrupt ongoing work
4. **Evidence-first**: All claims must be backed by bus data

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Unified Heartbeat Bus                       │
├─────────────────────────────────────────────────────────────┤
│  ~/.stigmergy/bus/                                          │
│  ├── registry/        # Agent presence & capabilities        │
│  ├── handoffs/        # Task handoffs (pending/active/done)  │
│  ├── reports/         # Self-reports (onetime/daily/session) │
│  ├── tasks/           # Global task board                     │
│  └── wiki/            # Project-agent correlation             │
└─────────────────────────────────────────────────────────────┘
         ▲              ▲              ▲              ▲
         │              │              │              │
    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
    │ opencode│   │ zcode   │   │workbuddy│   │  qoder  │   ...
    └─────────┘   └─────────┘   └─────────┘   └─────────┘
     heartbeat      heartbeat      heartbeat      heartbeat
     (60s)          (60s)          (60s)          (60s)
```

### Agent Heartbeat Loop (in stigmergy-coordinator/runner.js)

When agent is idle, run every `AGENT_HEARTBEAT` seconds (default 60s):

```javascript
async function agentHeartbeatLoop() {
  const busDir = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), '.stigmergy', 'bus');
  
  while (agentIsIdle()) {
    // 1. Update registry (I'm alive)
    updateRegistry(busDir, { lastHeartbeat: new Date().toISOString() });
    
    // 2. Check for pending handoffs I can accept
    const handoffs = scanPendingHandoffs(busDir);
    const myHandoffs = handoffs.filter(h => matchesMySkills(h));
    if (myHandoffs.length > 0) {
      await acceptHandoff(myHandoffs[0]);
      continue; // Skip rest, I'm busy now
    }
    
    // 3. Check global task board for stuck tasks
    const stuckTasks = scanStuckTasks(busDir);
    const myStuck = stuckTasks.filter(t => matchesMySkills(t) && !t.assignedTo);
    if (myStuck.length > 0) {
      await takeOverTask(myStuck[0]);
      continue; // Skip rest, I'm busy now
    }
    
    // 4. Check other agents' status (global awareness)
    const otherAgents = scanRegistry(busDir);
    logGlobalState(otherAgents);
    
    // 5. Write daily/session self-report
    writeSelfReport(busDir);
    
    // Sleep until next heartbeat
    await sleep(heartbeatInterval * 1000);
  }
}
```

### Global Task Board (new bus schema)

```json
# ~/.stigmergy/bus/tasks/task-{id}.json
{
  "id": "task-123",
  "title": "Fix auth module bug",
  "project": "D:\\socienceAI",
  "status": "stuck",  // pending | active | stuck | completed
  "assignedTo": "opencode",
  "createdAt": "2026-10-07T10:00:00Z",
  "lastUpdate": "2026-10-07T12:00:00Z",
  "stuckSince": "2026-10-07T12:00:00Z",
  "stuckReason": "Rate limit exceeded",
  "priority": "high",
  "tags": ["auth", "security"],
  "requiredSkills": ["code-review", "typescript"]
}
```

### Agent Capability Declaration

Each agent declares its skills in registry:

```json
# ~/.stigmergy/bus/registry/opencode.json
{
  "agent": "opencode",
  "status": "idle",  // idle | busy | offline
  "capabilities": ["coding", "review", "typescript", "python"],
  "currentProject": "D:\\socienceAI",
  "lastHeartbeat": "2026-10-07T12:00:00Z",
  "tasksCompleted": 42,
  "tasksStuck": 0
}
```

## Implementation Plan

### Phase 1: Unified Registry + Task Board (Week 1)
1. Add `tasks/` directory schema to bus
2. Add `updateRegistry()`, `scanRegistry()`, `scanStuckTasks()` to runner.js
3. Update `AgentCoordinator` to write to `tasks/` instead of just handoffs
4. Add task status transitions: pending → active → stuck → completed

### Phase 2: Agent Heartbeat Loop (Week 2)
1. Refactor `runner.js` daemon mode to use unified heartbeat loop
2. Add `agentIsIdle()` detection (check recent activity in registry)
3. Add `matchesMySkills()` filter for handoffs and tasks
4. Add `acceptHandoff()` and `takeOverTask()` methods
5. Auto-start heartbeat when agent becomes idle

### Phase 3: Self-Report Enhancement (Week 3)
1. Update `reporter.js` to read from `tasks/` and `registry/`
2. Add project paths to onetime/daily reports
3. Add global state summary to reports
4. Auto-trigger reports from heartbeat loop

### Phase 4: Global Awareness (Week 4)
1. Add `logGlobalState()` to summarize other agents' status
2. Add project-level aggregation (which agents on which projects)
3. Add priority scoring for handoffs/tasks
4. Add notification mechanism (console output when interesting events happen)

## Verification Plan

### Unit Tests
- [ ] Heartbeat loop runs every N seconds
- [ ] Registry updates correctly
- [ ] Handoff matching by skills works
- [ ] Stuck task detection works
- [ ] Idle detection works

### Integration Tests
- [ ] Two agents can hand off via bus
- [ ] Agent can take over stuck task
- [ ] Global task board updates correctly
- [ ] Self-reports include project paths

### E2E Scenario
1. Agent A starts task, reports "active"
2. Agent A gets rate-limited, reports "stuck"
3. Agent B (idle) sees stuck task in heartbeat loop
4. Agent B takes over task
5. Both agents' registry shows correct status
6. Task status transitions: pending → active → stuck → completed

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Agents interrupt ongoing work | Idle detection before polling |
| Bus contention | File locking, atomic writes |
| Infinite loops | Max iterations per heartbeat, backoff |
| False positives on stuck detection | Require 2+ consecutive stuck reports |
| Performance overhead | Heartbeat only when idle, configurable interval |
