# Planning with Files

Manus-style file-based planning using persistent markdown files as working memory for complex multi-step tasks.

## Domain
Complex task planning and session memory management.

## What It Does
Creates three persistent files: task_plan.md (phase tracking), findings.md (research storage), and progress.md (session logging). Treats filesystem as disk vs context window as RAM. Enforces the 2-action rule (save after every 2 view operations) and the 3-strike error protocol.

## When to Use
- Multi-step tasks requiring 5+ tool calls
- Research projects spanning multiple sessions
- Resuming work after context gaps
