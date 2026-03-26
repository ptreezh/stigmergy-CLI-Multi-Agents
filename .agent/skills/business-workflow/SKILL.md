# business-workflow

A skill implementing the workflow pattern

## Purpose
Implements a multi-step workflow process with state management for general operations.

## Pattern
Workflow - Multi-step process pattern

## Domain
general

## Expertise Level
intermediate

## Capabilities
- Execute multi-step processes
- Maintain workflow state
- Handle workflow branching and conditions
- Support for human-in-the-loop approvals
- Rollback capabilities for failed workflows

## Parameters
- action (start|continue|rollback|status): Workflow action to perform
- context (object): Current workflow context/state
- step (string): Specific step to execute (if continuing)
- taskId (string): Unique identifier for the workflow instance

## Dependencies
- State management system
- Task queue
- Notification system

## Implementation
See implementation file for details

## Notes
- Implements finite state machine pattern
- Supports long-running workflows
- Includes timeout and retry mechanisms
