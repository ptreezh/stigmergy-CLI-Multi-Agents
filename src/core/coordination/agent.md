# Cross-CLI Coordination

Coordinates execution, communication, and hook deployment across multiple AI CLI tools.

## Components

- `cli_adapter_registry.js` - Registry mapping CLI names to adapter instances
- `cross_cli_executor.js` - Executes commands on remote/other CLI tools
- `collaboration_coordinator.js` - Orchestrates multi-CLI collaboration sessions
- `intent_router.js` - Routes natural-language intents to appropriate CLI handlers
- `natural_language_parser.js` - Parses user intent from natural language input
- `error_handler.js` - Shared error handling across coordination layer
- `graceful_degradation.js` - Circuit breaker for failed CLIs
- `performance_benchmark.js` - Benchmarks CLI performance
- `nodejs/` - Node.js-specific coordination: HookDeploymentManager, CLIIntegrationManager, AdapterManager
- `python_coordination_wrapper.js` / `python_detector.js` - Python environment detection

## Purpose

Enables seamless handoff and collaboration between Claude, Gemini, Qwen, and other supported CLI tools.
