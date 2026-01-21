# Project Collaboration Constitution

## Basic Collaboration Principles
- All collaboration is coordinated through PROJECT_SPEC.json
- Agents make autonomous decisions based on background state
- No central scheduler, achieving decentralized collaboration

## PROJECT_SPEC.json Usage
The PROJECT_SPEC.json file serves as the central coordination point for all project activities.

### Basic Structure:
``
{
  "projectName": "your-project-name",
  "version": "1.0.0",
  "description": "Project description",
  "collaboration": {
    "activeTasks": [],
    "completedTasks": [],
    "sharedContext": {}
  }
}
``

### Common Usage Examples:
1. Define project tasks:
   ``
   {
     "collaboration": {
       "activeTasks": [
         {
           "id": "task-001",
           "name": "Implement feature X",
           "status": "in-progress",
           "assignedTo": "any",
           "priority": "high",
           "description": "Task details..."
         }
       ]
     }
   }
   ``

2. Track shared context:
   ``
   {
     "collaboration": {
       "sharedContext": {
         "lastCompletion": "2025-02-22T10:00:00Z",
         "activeDevelopers": ["developer1", "developer2"],
         "currentSprint": "sprint-2"
       }
     }
   }
   ``

## Task Management Principles
- Agents can claim tasks assigned to themselves
- Agents can claim unassigned tasks that match their capabilities
- Task status is updated in real-time to the shared context
